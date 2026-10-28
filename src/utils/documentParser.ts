import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import mammoth from 'mammoth/mammoth.browser.js';
import { extractPdfLayout, layoutToText } from './pdf';
import { fromPdfLayout, fromPlainText, type DocInput } from './paperReader/docBlocks';

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

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

async function loadPdf(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return pdfjsLib.getDocument({ data: arrayBuffer }).promise;
}

async function extractTextFromPDF(file: File): Promise<string> {
  return layoutToText(await extractPdfLayout(await loadPdf(file)));
}

/** Structured blocks for the Paper Reader (font styles when the source is a PDF) */
export async function extractDocument(file: File): Promise<DocInput> {
  if (isPdf(file)) {
    return fromPdfLayout(await extractPdfLayout(await loadPdf(file)));
  }
  return fromPlainText(await extractTextFromFile(file));
}

async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
