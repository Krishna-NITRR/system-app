// ──────────────────────────────────────────────────────────
// PDF extraction entry point. Takes an already-loaded pdf.js
// document so the same code runs in the browser and in the Node
// test harness (scripts/test-parser.ts).
// ──────────────────────────────────────────────────────────
import type { PdfDocLike, PdfExtractStats, PdfLayout, PdfPageLayout } from './types';
import { readPage, type RawPage } from './items';
import { dedupeItems } from './dedupe';
import { removeFurniture } from './furniture';
import {
  dropFragmentsInImages,
  isFigureLabelRegion,
  isGarbageBlock,
  separateCaptions,
} from './figures';
import {
  dominantSize,
  fragmentsToLines,
  groupRows,
  linesToBlocks,
  rowsToFragments,
  xyCut,
} from './layout';

export type { PdfLayout, PdfBlock, PdfPageLayout, PdfDocLike, PdfExtractStats } from './types';

export async function extractPdfLayout(pdf: PdfDocLike): Promise<PdfLayout> {
  const stats: PdfExtractStats = { duplicateItems: 0, furnitureLines: 0, figureText: 0 };
  const raw: RawPage[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await readPage(await pdf.getPage(i));
    const deduped = dedupeItems(page.items);
    stats.duplicateItems += deduped.dropped;
    raw.push({ ...page, items: deduped.items });
  }

  const bodySize = dominantSize(raw.flatMap(p => p.items));
  const minGapX = Math.max(6, 0.7 * bodySize);
  const minGapY = 0.5 * bodySize;

  const furniture = removeFurniture(
    raw.map(p => ({ height: p.height, frags: rowsToFragments(groupRows(p.items), minGapX) }))
  );
  stats.furnitureLines = furniture.dropped;

  const pages: PdfPageLayout[] = raw.map((p, idx) => {
    const inImages = dropFragmentsInImages(furniture.pages[idx], p.images, p.width, p.height);
    stats.figureText += inImages.dropped;

    const regions = xyCut(inImages.frags, { minGapX, minGapY });
    const textBlocks = regions.flatMap(region => {
      const lines = fragmentsToLines(region);
      if (isFigureLabelRegion(lines, bodySize)) {
        stats.figureText += lines.length;
        return [];
      }
      return linesToBlocks(lines, idx + 1);
    });
    const blocks = separateCaptions(textBlocks).filter(b => {
      const garbage = isGarbageBlock(b);
      if (garbage) stats.figureText += b.lines.length;
      return !garbage;
    });
    return { number: idx + 1, width: p.width, height: p.height, blocks };
  });

  return { pages, bodySize, doi: furniture.doi, stats };
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
