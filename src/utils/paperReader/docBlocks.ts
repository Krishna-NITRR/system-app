// ──────────────────────────────────────────────────────────
// Document blocks: the parse stage's input. Built from a PDF
// layout (with font sizes and styles) or from plain text (DOCX,
// where only the text is known).
// ──────────────────────────────────────────────────────────
import type { PdfLayout } from '../pdf';
import { itemsToText } from '../pdf/layout';
import { joinLines } from '../pdf/text';

export interface DocLine {
  text: string;
  x0: number;
}

export interface DocBlock {
  index: number;
  kind: 'text' | 'caption';
  text: string;
  /** Text without superscript markers ("Jacobs^a,b" → "Jacobs") */
  plainText: string;
  /** Leading run set in a different font, e.g. "Abstract" in "Abstract—We…" */
  leadText: string;
  lines: DocLine[];
  page: number;
  pageHeight: number;
  top: number;
  /** 0 when unknown (plain-text input) */
  size: number;
  font: string;
  bold: boolean;
  italic: boolean;
}

export interface DocInput {
  blocks: DocBlock[];
  bodySize: number;
  bodyFont: string;
  /** DOI found in a removed page stamp */
  doi: string | null;
  /** Font sizes and styles are known */
  hasStyles: boolean;
}

export function fromPdfLayout(layout: PdfLayout): DocInput {
  const blocks: DocBlock[] = [];
  const fontChars = new Map<string, number>();

  for (const page of layout.pages) {
    for (const b of page.blocks) {
      const plainLines = b.lines.map(l =>
        itemsToText(
          l.items.filter(
            it => it.size >= l.size * 0.8 || Math.abs(it.baseline - l.baseline) < 0.15 * l.size
          )
        )
      );
      const first = b.lines[0];
      const leadItems = [];
      for (const it of first.items) {
        if (it.font === b.font && it.size === b.size) break;
        leadItems.push(it);
      }
      blocks.push({
        index: blocks.length,
        kind: b.kind,
        text: b.text,
        plainText: joinLines(plainLines),
        leadText: leadItems.length < first.items.length ? itemsToText(leadItems) : '',
        lines: b.lines.map(l => ({ text: l.text, x0: l.x0 })),
        page: b.page,
        pageHeight: page.height,
        top: b.top,
        size: b.size,
        font: b.font,
        bold: b.bold,
        italic: b.italic,
      });
      fontChars.set(b.font, (fontChars.get(b.font) ?? 0) + b.text.length);
    }
  }

  const bodyFont = [...fontChars.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  return { blocks, bodySize: layout.bodySize, bodyFont, doi: layout.doi, hasStyles: true };
}

/** Plain text (e.g. DOCX): one block per paragraph, no style information */
export function fromPlainText(text: string): DocInput {
  const blocks: DocBlock[] = text
    .split(/\n\s*\n/)
    .map(p => p.split('\n').map(l => l.trim()).filter(Boolean))
    .filter(lines => lines.length > 0)
    .map((lines, index) => {
      const joined = joinLines(lines);
      return {
        index,
        kind: 'text' as const,
        text: joined,
        plainText: joined,
        leadText: '',
        lines: lines.map(l => ({ text: l, x0: 0 })),
        page: 1,
        pageHeight: 0,
        top: 0,
        size: 0,
        font: '',
        bold: false,
        italic: false,
      };
    });
  return { blocks, bodySize: 0, bodyFont: '', doi: null, hasStyles: false };
}

/** Flatten blocks back to text (paragraphs separated by blank lines) */
export function blocksToText(blocks: DocBlock[]): string {
  return blocks.map(b => b.text).join('\n\n');
}
