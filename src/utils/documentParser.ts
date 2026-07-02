import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import mammoth from 'mammoth/mammoth.browser.js';

// Setup pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractTextFromFile(file: File): Promise<string> {
  const type = file.type;
  const name = file.name.toLowerCase();

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  } else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx')) {
    return extractTextFromDOCX(file);
  }
  
  throw new Error("Unsupported file type");
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
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

async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
