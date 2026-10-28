// ──────────────────────────────────────────────────────────
// Figure handling: drop text drawn over images, figure-label
// clusters and symbol garbage; pull "Fig. N" / "Table N"
// captions out into their own caption blocks.
// ──────────────────────────────────────────────────────────
import type { PdfBlock, PdfFragment, PdfLine } from './types';
import { itemsToText, makeBlock } from './layout';

export interface Box {
  x0: number;
  x1: number;
  top: number;
  bottom: number;
}

// pdf.js OPS codes (pdfjs-dist/src/shared/util.js)
const OP_SAVE = 10;
const OP_RESTORE = 11;
const OP_TRANSFORM = 12;
const OP_FORM_BEGIN = 74;
const OP_FORM_END = 75;
const IMAGE_OPS = new Set([83, 84, 85, 86, 87, 88, 90]);
const OP_CONSTRUCT_PATH = 91;

type Matrix = [number, number, number, number, number, number];

function multiply(m: Matrix, n: number[]): Matrix {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}

/**
 * Figure areas on the page (top-down page coordinates): images, plus
 * dense clusters of drawn paths (vector charts and diagrams).
 */
export function figureBoxes(
  ops: { fnArray: number[]; argsArray: unknown[] },
  view: number[]
): Box[] {
  const [vx0, vy0, vx1, vy1] = view;
  const boxes: Box[] = [];
  const paths: Box[] = [];
  const toPage = (m: Matrix, x0: number, y0: number, x1: number, y1: number): Box => {
    const xs = [x0, x1, x0, x1].map((x, k) => m[0] * x + m[2] * [y0, y0, y1, y1][k] + m[4]);
    const ys = [x0, x1, x0, x1].map((x, k) => m[1] * x + m[3] * [y0, y0, y1, y1][k] + m[5]);
    return {
      x0: Math.min(...xs) - vx0,
      x1: Math.max(...xs) - vx0,
      top: vy1 - Math.max(...ys),
      bottom: vy1 - Math.min(...ys),
    };
  };
  const stack: Matrix[] = [];
  let ctm: Matrix = [1, 0, 0, 1, 0, 0];

  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    const args = ops.argsArray[i] as any[] | null;
    if (fn === OP_SAVE) {
      stack.push(ctm);
    } else if (fn === OP_RESTORE) {
      ctm = stack.pop() ?? ctm;
    } else if (fn === OP_TRANSFORM && args) {
      ctm = multiply(ctm, args as number[]);
    } else if (fn === OP_FORM_BEGIN) {
      stack.push(ctm);
      const m = args?.[0];
      if (Array.isArray(m) || ArrayBuffer.isView(m)) ctm = multiply(ctm, Array.from(m as number[]));
    } else if (fn === OP_FORM_END) {
      ctm = stack.pop() ?? ctm;
    } else if (IMAGE_OPS.has(fn)) {
      // Images are drawn into the unit square of the current matrix
      boxes.push(toPage(ctm, 0, 0, 1, 1));
    } else if (fn === OP_CONSTRUCT_PATH && args) {
      // [op, data, minMax]: minMax is the path's bounding box in user space
      const mm = args[2] as ArrayLike<number> | null | undefined;
      if (mm && mm.length >= 4 && Number.isFinite(mm[0])) {
        paths.push(toPage(ctm, mm[0], mm[1], mm[2], mm[3]));
      }
    }
  }
  return [...boxes, ...vectorFigures(paths, vx1 - vx0, vy1 - vy0)];
}

/**
 * Cluster path bounding boxes; a cluster of many shapes covering a
 * reasonable area is a vector figure. A few rule lines (table borders,
 * separators) or a page-sized frame are not.
 */
function vectorFigures(paths: Box[], pageWidth: number, pageHeight: number): Box[] {
  const pageArea = pageWidth * pageHeight;
  const NEAR = 6;
  const clusters: { box: Box; count: number }[] = [];
  for (const p of paths) {
    const area = (p.x1 - p.x0) * (p.bottom - p.top);
    if (area > 0.5 * pageArea) continue;
    let target: { box: Box; count: number } = { box: { ...p }, count: 1 };
    // Absorb every cluster this box touches
    for (let i = clusters.length - 1; i >= 0; i--) {
      const c = clusters[i].box;
      const touches =
        p.x0 <= c.x1 + NEAR && p.x1 >= c.x0 - NEAR && p.top <= c.bottom + NEAR && p.bottom >= c.top - NEAR;
      if (!touches) continue;
      target = {
        box: {
          x0: Math.min(target.box.x0, c.x0),
          x1: Math.max(target.box.x1, c.x1),
          top: Math.min(target.box.top, c.top),
          bottom: Math.max(target.box.bottom, c.bottom),
        },
        count: target.count + clusters[i].count,
      };
      clusters.splice(i, 1);
    }
    clusters.push(target);
  }
  return clusters
    .filter(c => {
      const w = c.box.x1 - c.box.x0;
      const h = c.box.bottom - c.box.top;
      return c.count >= 6 && w > 40 && h > 40 && w * h < 0.5 * pageArea;
    })
    .map(c => c.box);
}

/* ── Captions ── */

// "Fig. 3." / "Figure 3:" / "Fig. 3 Elliptic curve" (Elsevier style, capital
// after the number), but not body text such as "Fig. 3 shows…"
const FIGURE_CAPTION = /^(?:fig\.?|figure)\s*(?:\d+|[ivxlc]+)[a-z]?(?:\s*[.:|—–-]|\s+[A-Z(])/i;
const TABLE_CAPTION = /^(?:Table|TABLE|table)\s*(?:\d+|[IVXLC]+)(?:\s*[.:|—–-]|\s+[A-Z(]|\s*$)/;

export function isCaptionStart(text: string): boolean {
  return FIGURE_CAPTION.test(text) || TABLE_CAPTION.test(text);
}

/* ── Text over images ── */

/**
 * Drop fragments that sit inside an image (labels baked into figures).
 * Page-sized images are ignored: they are backgrounds or scans with a
 * text layer, not figures.
 */
export function dropFragmentsInImages(
  frags: PdfFragment[],
  boxes: Box[],
  pageWidth: number,
  pageHeight: number
): { frags: PdfFragment[]; dropped: number } {
  const figures = boxes.filter(b => {
    const area = (b.x1 - b.x0) * (b.bottom - b.top);
    return area > 400 && area < 0.5 * pageWidth * pageHeight;
  });
  if (figures.length === 0) return { frags, dropped: 0 };

  const kept = frags.filter(f => {
    const cx = (f.x0 + f.x1) / 2;
    const cy = (f.top + f.bottom) / 2;
    const inside = figures.some(b => cx >= b.x0 && cx <= b.x1 && cy >= b.top && cy <= b.bottom);
    return !inside || isCaptionStart(itemsToText(f.items));
  });
  return { frags: kept, dropped: frags.length - kept.length };
}

/* ── Garbage ── */

const PRIVATE_USE = /[-�]/g;
const CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g;
const ORDINARY = /[\p{L}\p{N}\s.,;:!?'"()[\]{}\-–—/%&+=<>*@#$’‘“”…·°±×]/u;

/** Share of characters that are not ordinary text (symbols, private-use glyphs, controls) */
export function garbageRatio(text: string): number {
  const chars = [...text.replace(/\s+/g, '')];
  if (chars.length === 0) return 0;
  let bad = 0;
  for (const c of chars) if (!ORDINARY.test(c)) bad++;
  bad += (text.match(PRIVATE_USE)?.length ?? 0) + (text.match(CONTROL)?.length ?? 0);
  return Math.min(1, bad / chars.length);
}

function letterRatio(text: string): number {
  const chars = text.replace(/\s+/g, '');
  if (chars.length === 0) return 0;
  return (chars.match(/\p{L}/gu)?.length ?? 0) / chars.length;
}

export function isGarbageBlock(block: PdfBlock): boolean {
  if (block.kind === 'caption') return false;
  const text = block.text;
  if (garbageRatio(text) > 0.25) return true;
  if ((text.match(PRIVATE_USE)?.length ?? 0) >= 3) return true;
  // Mostly numbers and symbols: axis ticks, table cells of figures
  if (text.replace(/\s+/g, '').length >= 3 && letterRatio(text) < 0.3) return true;
  // Stray cells such as "6", "N", "(D)": never prose
  const letters = text.match(/\p{L}/gu)?.length ?? 0;
  if (letters === 0 || (letters <= 2 && text.length <= 8)) return true;
  return false;
}

/**
 * A region made of many very short lines is figure labels or table
 * cells read column by column, not prose.
 */
export function isFigureLabelRegion(lines: PdfLine[], bodySize: number): boolean {
  if (lines.length < 3) return false;
  if (lines.some(l => isCaptionStart(l.text) || l.text.includes('@'))) return false;
  const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  if (median(lines.map(l => l.text.length)) >= 15) return false;
  // Author grids are short lines too, but set at body size or larger
  const smallFont = median(lines.map(l => l.size)) < bodySize - 0.4;
  return smallFont || letterRatio(lines.map(l => l.text).join(' ')) < 0.5;
}

/* ── Caption blocks ── */

/**
 * Split caption lines out of text blocks, and merge a bare "TABLE I"
 * label with the title block that follows it.
 */
export function separateCaptions(blocks: PdfBlock[]): PdfBlock[] {
  const out: PdfBlock[] = [];
  for (const block of blocks) {
    // A caption starts a block, or changes font mid-block. A body line
    // that merely wraps to start with "Fig. 9." keeps the body style.
    const idx = block.lines.findIndex((l, i) => {
      if (!isCaptionStart(l.text)) return false;
      const prev = block.lines[i - 1];
      return !prev || prev.font !== l.font || Math.abs(prev.size - l.size) > 0.4;
    });
    if (idx < 0) {
      out.push(block);
      continue;
    }
    if (idx > 0) out.push(makeBlock(block.lines.slice(0, idx), block.page));
    out.push(makeBlock(block.lines.slice(idx), block.page, 'caption'));
  }

  const merged: PdfBlock[] = [];
  for (let i = 0; i < out.length; i++) {
    const b = out[i];
    const next = out[i + 1];
    const bareLabel = b.kind === 'caption' && /^table\s*(?:\d+|[IVXLC]+)\.?$/i.test(b.text.trim());
    if (bareLabel && next && next.kind === 'text' && next.page === b.page && next.text.length < 300) {
      merged.push(makeBlock([...b.lines, ...next.lines], b.page, 'caption'));
      i++;
    } else {
      merged.push(b);
    }
  }
  return merged;
}
