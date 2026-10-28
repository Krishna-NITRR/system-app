// ──────────────────────────────────────────────────────────
// Layout model produced by the PDF extractor.
// Coordinates are in PDF points, origin top-left (y grows down).
// ──────────────────────────────────────────────────────────

export interface PdfTextItem {
  str: string;
  x0: number;
  x1: number;
  /** Baseline y (top-down) */
  baseline: number;
  size: number;
  font: string;
  bold: boolean;
  italic: boolean;
}

/** A run of items on one baseline, possibly split at a wide gap */
export interface PdfFragment {
  items: PdfTextItem[];
  x0: number;
  x1: number;
  top: number;
  bottom: number;
  baseline: number;
  size: number;
}

export interface PdfLine {
  text: string;
  x0: number;
  x1: number;
  baseline: number;
  /** Dominant (by character count) font properties */
  size: number;
  font: string;
  bold: boolean;
  italic: boolean;
  items: PdfTextItem[];
}

export type PdfBlockKind = 'text' | 'caption';

export interface PdfBlock {
  page: number;
  kind: PdfBlockKind;
  lines: PdfLine[];
  /** Lines joined into one string (hyphenation repaired) */
  text: string;
  x0: number;
  x1: number;
  top: number;
  bottom: number;
  size: number;
  font: string;
  bold: boolean;
  italic: boolean;
}

export interface PdfPageLayout {
  number: number;
  width: number;
  height: number;
  blocks: PdfBlock[];
}

export interface PdfLayout {
  pages: PdfPageLayout[];
  /** Most common font size in the document (body text) */
  bodySize: number;
  /** DOI found in a removed footer/stamp line, if any */
  doi: string | null;
  stats: PdfExtractStats;
}

/** What the cleanup passes removed (for the harness and quality checks) */
export interface PdfExtractStats {
  duplicateItems: number;
  furnitureLines: number;
  /** Fragments over images, figure-label lines and garbage blocks */
  figureText: number;
}

/** Minimal slice of the pdf.js document API that we use */
export interface PdfDocLike {
  numPages: number;
  getPage(n: number): Promise<PdfPageLike>;
}

export interface PdfPageLike {
  view: number[];
  getTextContent(): Promise<{ items: unknown[] }>;
  getOperatorList(): Promise<{ fnArray: number[]; argsArray: unknown[] }>;
  commonObjs: { get(id: string): unknown };
}
