// ──────────────────────────────────────────────────────────
// PDF extraction entry point. Takes an already-loaded pdf.js
// document so the same code runs in the browser and in the Node
// test harness (scripts/test-parser.ts).
// ──────────────────────────────────────────────────────────
import type { PdfDocLike, PdfLayout, PdfPageLayout } from './types';
import { readPage, type RawPage } from './items';
import {
  dominantSize,
  fragmentsToLines,
  groupRows,
  linesToBlocks,
  rowsToFragments,
  xyCut,
} from './layout';

export type { PdfLayout, PdfBlock, PdfPageLayout, PdfDocLike } from './types';

export async function extractPdfLayout(pdf: PdfDocLike): Promise<PdfLayout> {
  const raw: RawPage[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    raw.push(await readPage(await pdf.getPage(i)));
  }

  const bodySize = dominantSize(raw.flatMap(p => p.items));
  const minGapX = Math.max(6, 0.7 * bodySize);
  const minGapY = 0.5 * bodySize;

  const pages: PdfPageLayout[] = raw.map((p, idx) => {
    const rows = groupRows(p.items);
    const frags = rowsToFragments(rows, minGapX);
    const regions = xyCut(frags, { minGapX, minGapY });
    const blocks = regions.flatMap(region =>
      linesToBlocks(fragmentsToLines(region), idx + 1)
    );
    return { number: idx + 1, width: p.width, height: p.height, blocks };
  });

  return { pages, bodySize };
}

/** Flatten a layout to plain text: lines joined by \n, blocks by a blank line */
export function layoutToText(layout: PdfLayout): string {
  return layout.pages
    .map(p => p.blocks.map(b => b.text).join('\n\n'))
    .join('\n\n');
}

export async function extractPdfText(pdf: PdfDocLike): Promise<string> {
  return layoutToText(await extractPdfLayout(pdf));
}
