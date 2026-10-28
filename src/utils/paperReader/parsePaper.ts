// ──────────────────────────────────────────────────────────
// Parse stage: document blocks → metadata + sections with
// sentences. Kept free of browser-only and network imports so
// the Node test harness can run it directly.
// ──────────────────────────────────────────────────────────
import type {
  PaperMetadata,
  PaperSection,
  PaperParagraph,
  PaperSentence,
} from '../../types/paperReader';
import { detectSections } from './sectionDetector';
import { segmentSentences } from './sentenceSegmenter';
import { extractMetadata } from './metadataExtractor';
import { blocksToText, type DocInput } from './docBlocks';

export interface ParsedPaper {
  metadata: PaperMetadata;
  sections: PaperSection[];
}

export function parsePaper(input: DocInput): ParsedPaper {
  const { metadata, consumed } = extractMetadata(input);
  const rawText = blocksToText(input.blocks.filter(b => !consumed.has(b.index)));
  const rawSections = detectSections(rawText);
  const sections = parseSectionsContent(rawSections, rawText);
  return { metadata, sections };
}

/**
 * Given raw sections from detectSections (which have empty paragraph.sentences),
 * fill them in by re-extracting content from the raw text.
 */
function parseSectionsContent(
  rawSections: PaperSection[],
  fullText: string
): PaperSection[] {
  const lines = fullText.split('\n');
  const sectionBoundaries: { title: string; startLine: number }[] = [];

  // Find section heading line numbers
  let lineNum = 0;
  for (const section of rawSections) {
    // Find the title line in the text
    for (let i = lineNum; i < lines.length; i++) {
      if (lines[i].trim() === section.title.trim() || lines[i].trim().length === 0) {
        if (lines[i].trim() === section.title.trim()) {
          sectionBoundaries.push({ title: section.title, startLine: i });
          lineNum = i + 1;
          break;
        }
      }
    }
  }

  // If we couldn't find boundaries, treat the whole text as one section
  if (sectionBoundaries.length === 0) {
    const singleSection = rawSections[0] || {
      id: 'sec-0-full-paper',
      title: 'Full Paper',
      level: 1,
      paragraphs: [],
    };
    singleSection.paragraphs = textToParagraphs(fullText, singleSection.id);
    return [singleSection];
  }

  // Extract content between section headings
  for (let s = 0; s < rawSections.length; s++) {
    const startLine = s < sectionBoundaries.length
      ? sectionBoundaries[s].startLine + 1
      : 0;
    const endLine = s + 1 < sectionBoundaries.length
      ? sectionBoundaries[s + 1].startLine
      : lines.length;

    const contentText = lines.slice(startLine, endLine).join('\n');
    rawSections[s].paragraphs = textToParagraphs(contentText, rawSections[s].id);
  }

  return rawSections;
}

/** Convert raw text content into PaperParagraph[] with PaperSentence[] */
function textToParagraphs(text: string, sectionId: string): PaperParagraph[] {
  const blocks = text.split(/\n\s*\n/);
  const paragraphs: PaperParagraph[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (block.length < 5) continue; // skip trivial fragments

    const sentenceTexts = segmentSentences(block);
    if (sentenceTexts.length === 0) continue;

    const sentences: PaperSentence[] = sentenceTexts.map((s, j) => ({
      id: `${sectionId}-p${i}-s${j}`,
      original: s,
      transformed: s,         // will be overwritten by engine
      wasTransformed: false,
      transformationType: null,
      skippedReason: null,
      annotations: [],
    }));

    paragraphs.push({
      id: `${sectionId}-p${i}`,
      sentences,
    });
  }

  return paragraphs;
}
