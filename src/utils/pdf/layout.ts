// ──────────────────────────────────────────────────────────
// Layout analysis: positioned items → reading-ordered blocks.
//
// 1. Items are grouped into rows by baseline, and rows are split
//    into fragments at wide horizontal gaps (column gutters).
// 2. Fragments are ordered with a recursive XY-cut: a region is
//    split at a vertical whitespace gutter when one exists (left
//    part read before right), otherwise at its widest horizontal
//    gap (which separates full-width bands such as the title and
//    abstract from the columns below them).
// 3. Each leaf region is one column of flowing text: fragments are
//    merged into lines, and lines into paragraphs by vertical gap,
//    font change and first-line indentation.
// ──────────────────────────────────────────────────────────
import type { PdfBlock, PdfFragment, PdfLine, PdfTextItem } from './types';
import { joinLines } from './text';

/** Most common font size, weighted by character count */
export function dominantSize(items: PdfTextItem[]): number {
  const counts = new Map<number, number>();
  for (const it of items) {
    const key = Math.round(it.size * 2) / 2;
    counts.set(key, (counts.get(key) ?? 0) + it.str.length);
  }
  let best = 10;
  let bestCount = -1;
  for (const [size, count] of counts) {
    if (count > bestCount) {
      best = size;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Drop caps: a 1–2 letter item at 2× body size or more ("T" of "THIS
 * paper", spanning several lines). Left alone, its baseline sits on a
 * later line and pulls two lines into one row. Move it onto the first
 * body line to its right so it reads "THIS paper presents…".
 */
export function attachDropCaps(items: PdfTextItem[], bodySize: number): PdfTextItem[] {
  const caps = items.filter(it => it.size >= 2 * bodySize && /^\p{Lu}{1,2}$/u.test(it.str.trim()));
  if (caps.length === 0) return items;

  for (const cap of caps) {
    const candidates = items.filter(
      it =>
        it !== cap &&
        it.size < 1.5 * bodySize &&
        it.x0 >= cap.x1 - 1 &&
        it.x0 <= cap.x1 + 1.5 * bodySize &&
        it.baseline >= cap.baseline - cap.size &&
        it.baseline <= cap.baseline + 0.5 * bodySize
    );
    if (candidates.length === 0) continue;
    const first = candidates.reduce((a, b) => (b.baseline < a.baseline ? b : a));
    // Same line as `first`, ending exactly where it starts (no space)
    Object.assign(cap, {
      size: first.size,
      baseline: first.baseline,
      x1: first.x0,
      x0: first.x0 - (cap.x1 - cap.x0) * (first.size / cap.size),
      font: first.font,
      bold: first.bold,
      italic: first.italic,
    });
  }
  return items;
}

/** Group items into rows by baseline. Superscripts join their row. */
export function groupRows(items: PdfTextItem[]): PdfTextItem[][] {
  const sorted = [...items].sort((a, b) => a.baseline - b.baseline || a.x0 - b.x0);
  const rows: { ref: PdfTextItem; items: PdfTextItem[] }[] = [];

  for (const it of sorted) {
    const row = rows[rows.length - 1];
    if (
      row &&
      Math.abs(it.baseline - row.ref.baseline) <= 0.45 * Math.max(it.size, row.ref.size)
    ) {
      row.items.push(it);
      if (it.size > row.ref.size) row.ref = it;
    } else {
      rows.push({ ref: it, items: [it] });
    }
  }
  return rows.map(r => r.items.sort((a, b) => a.x0 - b.x0));
}

function makeFragment(items: PdfTextItem[]): PdfFragment {
  let x0 = Infinity, x1 = -Infinity, top = Infinity, bottom = -Infinity;
  for (const it of items) {
    x0 = Math.min(x0, it.x0);
    x1 = Math.max(x1, it.x1);
    top = Math.min(top, it.baseline - it.size * 0.8);
    bottom = Math.max(bottom, it.baseline + it.size * 0.2);
  }
  const size = dominantSize(items);
  const main = items.find(i => Math.abs(i.size - size) < 0.6) ?? items[0];
  return { items, x0, x1, top, bottom, baseline: main.baseline, size };
}

/** Split each row into fragments wherever the horizontal gap is wide */
export function rowsToFragments(rows: PdfTextItem[][], splitGap: number): PdfFragment[] {
  const frags: PdfFragment[] = [];
  for (const row of rows) {
    let current: PdfTextItem[] = [];
    let lastX1 = -Infinity;
    for (const it of row) {
      if (current.length > 0 && it.x0 - lastX1 > splitGap) {
        frags.push(makeFragment(current));
        current = [];
      }
      current.push(it);
      lastX1 = Math.max(lastX1, it.x1);
    }
    if (current.length > 0) frags.push(makeFragment(current));
  }
  return frags;
}

/* ── XY-cut ── */

interface CutOptions {
  minGapX: number;
  minGapY: number;
}

function mergedGaps(intervals: [number, number][]): [number, number][] {
  intervals.sort((a, b) => a[0] - b[0]);
  const gaps: [number, number][] = [];
  let end = intervals[0][1];
  for (let i = 1; i < intervals.length; i++) {
    const [s, e] = intervals[i];
    if (s > end) gaps.push([end, s]);
    end = Math.max(end, e);
  }
  return gaps;
}

function findXCut(frags: PdfFragment[], minGap: number): number | null {
  const x0 = Math.min(...frags.map(f => f.x0));
  const x1 = Math.max(...frags.map(f => f.x1));
  const w = x1 - x0;
  // A single row ("1   Introduction") is only split at a very wide gap,
  // e.g. side-by-side author entries.
  const singleRow = frags.every(f => Math.abs(f.baseline - frags[0].baseline) < 0.5 * f.size);
  const needed = singleRow ? minGap * 4 : minGap;
  let best: number | null = null;
  let bestWidth = 0;
  for (const [g0, g1] of mergedGaps(frags.map(f => [f.x0, f.x1]))) {
    const mid = (g0 + g1) / 2;
    if (g1 - g0 < needed) continue;
    if (mid < x0 + 0.12 * w || mid > x1 - 0.12 * w) continue;
    if (g1 - g0 > bestWidth) {
      bestWidth = g1 - g0;
      best = mid;
    }
  }
  return best;
}

/**
 * Where a column gutter would be if the fragments crossing it were
 * removed: the x in the middle of the region crossed by the fewest
 * fragments, with a clear band of at least `minGap` around it.
 */
function findBlockedGutter(frags: PdfFragment[], minGap: number): number | null {
  const x0 = Math.min(...frags.map(f => f.x0));
  const x1 = Math.max(...frags.map(f => f.x1));
  const w = x1 - x0;
  const mid = (x0 + x1) / 2;
  let best: number | null = null;
  let bestCount = Infinity;
  for (let x = x0 + 0.2 * w; x <= x1 - 0.2 * w; x += 1) {
    let crossing = 0;
    let clear = true;
    for (const f of frags) {
      if (f.x0 < x - 1 && f.x1 > x + 1) {
        crossing++;
      } else if (f.x1 > x - minGap / 2 && f.x0 < x + minGap / 2) {
        clear = false;
        break;
      }
    }
    if (!clear) continue;
    if (crossing < bestCount || (crossing === bestCount && best !== null && Math.abs(x - mid) < Math.abs(best - mid))) {
      bestCount = crossing;
      best = x;
    }
  }
  return bestCount <= frags.length * 0.25 ? best : null;
}

/**
 * Horizontal cut. When something spans an otherwise two-column region
 * (title, full-width figure, a stamped footer), cut right next to that
 * spanning content so the columns stay whole; otherwise use the widest gap.
 */
function findYCut(frags: PdfFragment[], minGapX: number, minGapY: number): number | null {
  const gutter = findBlockedGutter(frags, minGapX);
  const spans = (f: PdfFragment) => gutter !== null && f.x0 < gutter - 1 && f.x1 > gutter + 1;

  let best: number | null = null;
  let bestHeight = 0;
  let bestAdjacent: number | null = null;
  let bestAdjacentHeight = 0;
  for (const [g0, g1] of mergedGaps(frags.map(f => [f.top, f.bottom]))) {
    const h = g1 - g0;
    if (h >= minGapY && h > bestHeight) {
      bestHeight = h;
      best = (g0 + g1) / 2;
    }
    // Next to spanning content any clear gap will do: stamped footers
    // can sit just a few points below the last line of the columns.
    if (h < 1) continue;
    const adjacent = frags.some(
      f => spans(f) && (Math.abs(f.bottom - g0) < 1 || Math.abs(f.top - g1) < 1)
    );
    if (adjacent && h > bestAdjacentHeight) {
      bestAdjacentHeight = h;
      bestAdjacent = (g0 + g1) / 2;
    }
  }
  return bestAdjacent ?? best;
}

export function xyCut(frags: PdfFragment[], opts: CutOptions, out: PdfFragment[][] = []): PdfFragment[][] {
  if (frags.length === 0) return out;
  if (frags.length === 1) {
    out.push(frags);
    return out;
  }
  const xc = findXCut(frags, opts.minGapX);
  if (xc !== null) {
    xyCut(frags.filter(f => f.x1 <= xc), opts, out);
    xyCut(frags.filter(f => f.x1 > xc), opts, out);
    return out;
  }
  const yc = findYCut(frags, opts.minGapX, opts.minGapY);
  if (yc !== null) {
    xyCut(frags.filter(f => f.bottom <= yc), opts, out);
    xyCut(frags.filter(f => f.bottom > yc), opts, out);
    return out;
  }
  out.push(frags);
  return out;
}

/* ── Lines ── */

export function itemsToText(items: PdfTextItem[]): string {
  let text = '';
  let prev: PdfTextItem | null = null;
  for (const it of items) {
    if (prev) {
      const gap = it.x0 - prev.x1;
      const needsSpace =
        gap > 0.15 * Math.min(it.size, prev.size) &&
        !/\s$/.test(prev.str) &&
        !/^\s/.test(it.str);
      if (needsSpace) text += ' ';
    }
    text += it.str;
    prev = it;
  }
  return text.replace(/\s+/g, ' ').trim();
}

function makeLine(items: PdfTextItem[]): PdfLine {
  items.sort((a, b) => a.x0 - b.x0);
  // Dominant style by character count
  const styleCounts = new Map<string, { n: number; it: PdfTextItem }>();
  for (const it of items) {
    const key = `${Math.round(it.size * 2) / 2}|${it.font}`;
    const entry = styleCounts.get(key) ?? { n: 0, it };
    entry.n += it.str.trim().length;
    styleCounts.set(key, entry);
  }
  let main = items[0];
  let mainN = -1;
  for (const { n, it } of styleCounts.values()) {
    if (n > mainN) {
      mainN = n;
      main = it;
    }
  }
  return {
    text: itemsToText(items),
    x0: Math.min(...items.map(i => i.x0)),
    x1: Math.max(...items.map(i => i.x1)),
    baseline: main.baseline,
    size: main.size,
    font: main.font,
    bold: main.bold,
    italic: main.italic,
    items,
  };
}

/** Merge a leaf region's fragments into lines (top to bottom) */
export function fragmentsToLines(frags: PdfFragment[]): PdfLine[] {
  const sorted = [...frags].sort((a, b) => a.baseline - b.baseline || a.x0 - b.x0);
  const groups: { baseline: number; size: number; items: PdfTextItem[] }[] = [];
  for (const f of sorted) {
    const g = groups[groups.length - 1];
    if (g && Math.abs(f.baseline - g.baseline) <= 0.45 * Math.max(f.size, g.size)) {
      g.items.push(...f.items);
    } else {
      groups.push({ baseline: f.baseline, size: f.size, items: [...f.items] });
    }
  }
  return groups.map(g => makeLine(g.items)).filter(l => l.text.length > 0);
}

/* ── Paragraph blocks ── */

function quantile(values: number[], q: number): number {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.floor(q * (s.length - 1))))];
}

const ENDS_SENTENCE = /[.!?:;]["'”’)]?$/;

export function linesToBlocks(lines: PdfLine[], page: number): PdfBlock[] {
  if (lines.length === 0) return [];
  const colLeft = quantile(lines.map(l => l.x0), 0.25);
  const colRight = quantile(lines.map(l => l.x1), 0.75);
  const isShort = (l: PdfLine) => l.x1 < colRight - 2 * l.size;

  const groups: PdfLine[][] = [[lines[0]]];
  for (let i = 1; i < lines.length; i++) {
    const a = lines[i - 1];
    const b = lines[i];
    const maxSize = Math.max(a.size, b.size);
    const pitch = b.baseline - a.baseline;
    const indented = b.x0 > colLeft + 0.6 * b.size && b.x0 < colLeft + 6 * b.size;

    const brk =
      pitch > 1.5 * maxSize ||
      Math.abs(a.size - b.size) > 0.75 ||
      ((a.bold !== b.bold || a.italic !== b.italic) && (isShort(a) || isShort(b))) ||
      (indented && (ENDS_SENTENCE.test(a.text) || isShort(a))) ||
      (isShort(a) && ENDS_SENTENCE.test(a.text));

    if (brk) groups.push([b]);
    else groups[groups.length - 1].push(b);
  }

  return groups.map(g => makeBlock(g, page));
}

export function makeBlock(lines: PdfLine[], page: number, kind: PdfBlock['kind'] = 'text'): PdfBlock {
  const counts = new Map<PdfLine, number>();
  for (const l of lines) counts.set(l, l.text.length);
  const main = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  return {
    page,
    kind,
    lines,
    text: joinLines(lines.map(l => l.text)),
    x0: Math.min(...lines.map(l => l.x0)),
    x1: Math.max(...lines.map(l => l.x1)),
    top: Math.min(...lines.map(l => l.baseline - l.size * 0.8)),
    bottom: Math.max(...lines.map(l => l.baseline + l.size * 0.2)),
    size: main.size,
    font: main.font,
    bold: main.bold,
    italic: main.italic,
  };
}
