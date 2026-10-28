// ──────────────────────────────────────────────────────────
// Paper Reader Orchestrator : ties the entire processing
// pipeline together:
// Extract → Parse → Transform → Annotate → Output
// All processing is 100% client-side.
// ──────────────────────────────────────────────────────────
import type {
  ProcessedPaper,
  PaperSection,
  TransformationStats,
  ProcessingStep,
} from '../../types/paperReader';
import { extractDocument } from '../documentParser';
import { parsePaper } from './parsePaper';
import { classifySentence } from './safetyClassifier';
import { transformSentence } from './transformationEngine';
import { annotateSection, buildTrie } from './terminologyMatcher';
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
  const doc = await extractDocument(file);
  onProgress?.('extracting', 100);

  const textLength = doc.blocks.reduce((n, b) => n + b.text.length, 0);
  if (textLength < 50) {
    throw new Error(
      'Could not extract readable text from this document. It may be a scanned (image-only) PDF.'
    );
  }

  // ── Step 2: Parse structure ──
  onProgress?.('parsing', 0);

  const { metadata, sections, quality } = parsePaper(doc);

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
    const sectionType = section.type;

    for (const paragraph of section.paragraphs) {
      for (const sentence of paragraph.sentences) {
        // Captions and reference entries are shown exactly as printed
        if (paragraph.kind === 'caption' || sectionType === 'references') {
          stats.totalSentences++;
          processedCount++;
          continue;
        }

        // Classify safety
        const context = classifySentence(sentence.original, sectionType);

        // Transform
        const result = transformSentence(sentence.original, context);
        sentence.transformed = result.text;
        sentence.wasTransformed = result.wasTransformed;
        sentence.transformationType = result.ruleApplied?.type ?? null;
        sentence.transformationRule = result.ruleApplied
          ? { name: result.ruleApplied.name, description: result.ruleApplied.description }
          : null;
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

  sections.forEach((section, i) => {
    annotateSection(section, trie);
    for (const paragraph of section.paragraphs) {
      for (const sentence of paragraph.sentences) {
        stats.annotatedTerms += sentence.annotations.length;
        for (const a of sentence.annotations) uniqueTermIds.add(a.termId);
      }
    }
    onProgress?.('annotating', Math.round(((i + 1) / sections.length) * 100));
  });

  stats.uniqueTerms = uniqueTermIds.size;

  return { metadata, sections, stats, quality };
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
