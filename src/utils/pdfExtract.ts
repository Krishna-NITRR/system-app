// ──────────────────────────────────────────────────────────
// PDF text extraction. Takes an already-loaded pdf.js document
// so the same code runs in the browser and in the Node test
// harness (scripts/test-parser.ts).
// ──────────────────────────────────────────────────────────

/** Minimal slice of the pdf.js document API that we use */
export interface PdfDocLike {
  numPages: number;
  getPage(n: number): Promise<{
    getTextContent(): Promise<{ items: unknown[] }>;
  }>;
}

export async function extractPdfText(pdf: PdfDocLike): Promise<string> {
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Group text items by approximate Y position to handle basic multi-column reading order
    const lines: Record<string, { str: string; x: number }[]> = {};

    for (const item of textContent.items as any[]) {
      if (!item.transform) continue;

      const x = item.transform[4];
      // Group Y positions within a small threshold (e.g., 5 points) to catch superscripts/subscripts on the same line
      const y = Math.round(item.transform[5] / 5) * 5;

      if (!lines[y]) lines[y] = [];
      lines[y].push({ str: item.str, x });
    }

    // Sort Y descending (PDF coordinates start from bottom-left)
    const sortedY = Object.keys(lines).map(Number).sort((a, b) => b - a);

    let pageText = '';
    for (const y of sortedY) {
      // Sort X ascending (left to right)
      const lineItems = lines[y].sort((a, b) => a.x - b.x);

      // Basic heuristic to detect columns: if the gap between text chunks is large, insert a spacer or treat as separate
      let lineStr = '';
      for (let j = 0; j < lineItems.length; j++) {
        if (j > 0 && (lineItems[j].x - lineItems[j-1].x) > 50) {
           lineStr += ' \t '; // Column separator hint
        }
        lineStr += lineItems[j].str + ' ';
      }

      pageText += lineStr.trim() + '\n';
    }

    fullText += pageText + '\n\n';
  }

  return fullText;
}
