// ──────────────────────────────────────────────────────────
// Read positioned text items (and font styles) from a pdf.js page.
// ──────────────────────────────────────────────────────────
import type { PdfPageLike, PdfTextItem } from './types';
import { imageBoxes, type Box } from './figures';

interface RawItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
}

const BOLD_FONT = /bold|black|heavy|semibold|demi|medi(?!um)|[-,+]b(?:d|o)?\b|\.b\b/i;
const ITALIC_FONT = /ital|oblique|[-,+](?:b)?i\b|slant/i;

export interface RawPage {
  width: number;
  height: number;
  items: PdfTextItem[];
  /** Image placements, for dropping text drawn over figures */
  images: Box[];
}

export async function readPage(page: PdfPageLike): Promise<RawPage> {
  const [vx0, vy0, vx1, vy1] = page.view;
  const width = vx1 - vx0;
  const height = vy1 - vy0;

  // The operator list loads the page's fonts into commonObjs, which is
  // where the real font names (and so bold/italic) live. It also tells
  // us where images are drawn.
  let images: Box[] = [];
  try {
    images = imageBoxes(await page.getOperatorList(), page.view);
  } catch {
    // Fonts and images are only hints; carry on without them.
  }
  const content = await page.getTextContent();
  const fontCache = new Map<string, { name: string; bold: boolean; italic: boolean }>();

  const items: PdfTextItem[] = [];
  for (const raw of content.items as RawItem[]) {
    if (!raw.transform || typeof raw.str !== 'string') continue;
    if (raw.str.trim().length === 0) continue;

    const [a, b, c, d, e, f] = raw.transform;
    // Skip rotated text (arXiv side stamps, rotated axis labels)
    if (Math.abs(b) > 0.01 || Math.abs(c) > 0.01 || a <= 0) continue;

    const size = Math.abs(d) || raw.height;
    if (size <= 0) continue;

    let font = fontCache.get(raw.fontName);
    if (!font) {
      let name = raw.fontName;
      let bold = false;
      let italic = false;
      try {
        const obj = page.commonObjs.get(raw.fontName) as
          | { name?: string; bold?: boolean; italic?: boolean }
          | undefined;
        if (obj?.name) name = obj.name;
        bold = !!obj?.bold;
        italic = !!obj?.italic;
      } catch {
        // Font not resolved: keep the internal id.
      }
      const base = name.replace(/^[A-Z]{6}\+/, '');
      font = {
        name: base,
        bold: bold || BOLD_FONT.test(base),
        italic: italic || ITALIC_FONT.test(base),
      };
      fontCache.set(raw.fontName, font);
    }

    const x0 = e - vx0;
    items.push({
      str: raw.str,
      x0,
      x1: x0 + Math.max(raw.width, 0),
      baseline: vy1 - f,
      size,
      font: font.name,
      bold: font.bold,
      italic: font.italic,
    });
  }

  return { width, height, items, images };
}
