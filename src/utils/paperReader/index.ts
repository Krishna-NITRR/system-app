// ──────────────────────────────────────────────────────────
// Paper Reader Orchestrator — ties the entire processing
// pipeline together:
// Extract → Parse → Transform → Annotate → Output
// All processing is 100% client-side.
// ──────────────────────────────────────────────────────────
import type {
  ProcessedPaper,
  PaperSection,
  PaperParagraph,
  PaperSentence,
  TransformationStats,
  ProcessingStep,
} from '../../types/paperReader';
import { extractTextFromFile } from '../documentParser';
import { detectSections, classifySectionType } from './sectionDetector';
import { segmentSentences } from './sentenceSegmenter';
import { extractMetadata } from './metadataExtractor';
import { classifySentence } from './safetyClassifier';
import { transformSentence } from './transformationEngine';
import { buildTrie, matchTermsInSentence } from './terminologyMatcher';
import { loadTerminology, getAllTerms } from '../../data/terminology/index';

type ProgressCallback = (step: ProcessingStep, progress: number) => void;

/**
 * Process a research paper file end-to-end.
 * Returns a structured ProcessedPaper object.
 */
export async function processPaper(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessedPaper> {

  // ── Step 1: Extract text ──
  onProgress?.('extracting', 0);
  const rawText = await extractTextFromFile(file);
  onProgress?.('extracting', 100);

  if (!rawText || rawText.trim().length < 50) {
    throw new Error(
      'Could not extract readable text from this document. It may be a scanned (image-only) PDF.'
    );
  }

  // ── Step 2: Parse structure ──
  onProgress?.('parsing', 0);

  const metadata = extractMetadata(rawText);
  const rawSections = detectSections(rawText);

  const sections: PaperSection[] = parseSectionsContent(rawSections, rawText);

  onProgress?.('parsing', 100);

  // ── Step 3: Transform sentences ──
  onProgress?.('transforming', 0);

  const stats: TransformationStats = {
    totalSentences: 0,
    transformedSentences: 0,
    skippedSentences: 0,
    annotatedTerms: 0,
    uniqueTerms: 0,
    sectionsDetected: sections.length,
  };

  const totalSentences = countSentences(sections);
  let processedCount = 0;

  for (const section of sections) {
    const sectionType = classifySectionType(section.title);

    for (const paragraph of section.paragraphs) {
      for (const sentence of paragraph.sentences) {
        // Classify safety
        const context = classifySentence(sentence.original, sectionType);

        // Transform
        const result = transformSentence(sentence.original, context);
        sentence.transformed = result.text;
        sentence.wasTransformed = result.wasTransformed;
        sentence.transformationType = result.ruleApplied?.type ?? null;
        sentence.skippedReason = result.skippedReason;

        stats.totalSentences++;
        if (result.wasTransformed) stats.transformedSentences++;
        if (result.skippedReason) stats.skippedSentences++;

        processedCount++;
        if (totalSentences > 0) {
          onProgress?.('transforming', Math.round((processedCount / totalSentences) * 100));
        }
      }
    }
  }

  // ── Step 4: Annotate terminology ──
  onProgress?.('annotating', 0);

  await loadTerminology();
  const allTerms = getAllTerms();
  const trie = buildTrie(allTerms);
  const uniqueTermIds = new Set<string>();

  processedCount = 0;
  for (const section of sections) {
    for (const paragraph of section.paragraphs) {
      for (const sentence of paragraph.sentences) {
        // Match against the transformed text (what the user will read)
        const annotations = matchTermsInSentence(sentence.transformed, trie);
        sentence.annotations = annotations;

        stats.annotatedTerms += annotations.length;
        for (const a of annotations) uniqueTermIds.add(a.termId);

        processedCount++;
        if (totalSentences > 0) {
          onProgress?.('annotating', Math.round((processedCount / totalSentences) * 100));
        }
      }
    }
  }

  stats.uniqueTerms = uniqueTermIds.size;

  return { metadata, sections, stats };
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

/** Count total sentences across all sections */
function countSentences(sections: PaperSection[]): number {
  let count = 0;
  for (const s of sections) {
    for (const p of s.paragraphs) {
      count += p.sentences.length;
    }
  }
  return count;
}
