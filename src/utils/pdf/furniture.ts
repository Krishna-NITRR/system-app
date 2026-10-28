// ──────────────────────────────────────────────────────────
// Page furniture removal: running headers/footers, page numbers
// and publisher stamps (IEEE Xplore license lines, ISBN/price
// lines, DOI footers, Elsevier masthead lines).
// ──────────────────────────────────────────────────────────
import type { PdfFragment } from './types';
import { itemsToText } from './layout';

export interface FurniturePage {
  height: number;
  frags: PdfFragment[];
}

/** Share of the page height treated as header/footer margin */
const MARGIN = 0.12;

const STAMP_PATTERNS: RegExp[] = [
  /authorized licensed use limited to/i,
  /^restrictions apply\.?$/i,
  /downloaded on .{0,60} from ieee xplore/i,
  // "978-1-4799-1234-5/15 $31.00 ©2015 IEEE"
  /\b97[89][-\d\s]{9,}\/\d{2}\s*\$\s?\d+\.\d{2}/,
  /^[^a-z]{0,40}\$\s?\d+\.\d{2}\s*©\s*(?:19|20)\d{2}\s+ieee\.?$/i,
  /^©\s*(?:19|20)\d{2}\s+ieee\.?$/i,
  /^contents lists available at/i,
  /^journal homepage:/i,
  /^\d{4}-\d{3}[\dxX]\/\s*©/,
  /^available online \d/i,
];

/** Only furniture inside the page margins (body text can wrap a URL onto its own line) */
const MARGIN_PATTERNS: RegExp[] = [
  /^(?:doi|DOI)\s*:?\s*10\.\d{4,}\/\S+$/,
  /^(?:https?:\/\/)?(?:dx\.)?doi\.org\/10\.\d{4,}\/\S+$/i,
  /^(?:page\s*)?\d{1,4}(?:\s*(?:of|\/)\s*\d{1,4})?$/i, // page numbers
];

const DOI_IN_STAMP = /10\.\d{4,}\/[^\s]+/;

function key(text: string): string {
  return text.toLowerCase().replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();
}

export function removeFurniture(pages: FurniturePage[]): {
  pages: PdfFragment[][];
  dropped: number;
  doi: string | null;
} {
  const n = pages.length;
  const texts = pages.map(p => p.frags.map(f => itemsToText(f.items)));
  const inMargin = (p: FurniturePage, f: PdfFragment) =>
    f.bottom < p.height * MARGIN || f.top > p.height * (1 - MARGIN);

  // Count on how many pages each margin line appears
  const pageCounts = new Map<string, number>();
  pages.forEach((p, i) => {
    const seen = new Set<string>();
    p.frags.forEach((f, j) => {
      if (!inMargin(p, f)) return;
      const k = key(texts[i][j]);
      if (k.length > 0) seen.add(k);
    });
    for (const k of seen) pageCounts.set(k, (pageCounts.get(k) ?? 0) + 1);
  });
  const repeatThreshold = n >= 4 ? Math.max(3, Math.ceil(n * 0.4)) : 2;

  let dropped = 0;
  let doi: string | null = null;
  const result = pages.map((p, i) =>
    p.frags.filter((f, j) => {
      const text = texts[i][j];
      const margin = inMargin(p, f);
      const isFurniture =
        STAMP_PATTERNS.some(re => re.test(text)) ||
        (margin && MARGIN_PATTERNS.some(re => re.test(text))) ||
        (margin && n >= 2 && (pageCounts.get(key(text)) ?? 0) >= repeatThreshold);
      if (isFurniture) {
        dropped++;
        if (!doi) doi = text.match(DOI_IN_STAMP)?.[0].replace(/[.,;]+$/, '') ?? null;
      }
      return !isFurniture;
    })
  );

  return { pages: result, dropped, doi };
}
