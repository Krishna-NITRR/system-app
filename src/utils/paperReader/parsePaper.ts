// ──────────────────────────────────────────────────────────
// Parse stage: document blocks → metadata + sections with
// sentences. Kept free of browser-only and network imports so
// the Node test harness can run it directly.
// ──────────────────────────────────────────────────────────
import type {
  ExtractionQuality,
  PaperMetadata,
  PaperSection,
  PaperParagraph,
  PaperSentence,
} from '../../types/paperReader';
import { buildBodyCasing, buildSections, displayTitle } from './sectionDetector';
import { segmentSentences } from './sentenceSegmenter';
import { extractMetadata } from './metadataExtractor';
import type { DocBlock, DocInput } from './docBlocks';
import { parseReferences } from './references';
import { assessQuality } from './quality';

export interface ParsedPaper {
  metadata: PaperMetadata;
  sections: PaperSection[];
  quality: ExtractionQuality;
}

export function parsePaper(input: DocInput): ParsedPaper {
  const { metadata, consumed, titleIndex } = extractMetadata(input);
  const { sections: raw, keywords, notes } = buildSections(input, consumed, titleIndex);
  metadata.keywords = keywords;
  metadata.notes = notes;

  const casing = buildBodyCasing(raw.flatMap(s => s.blocks.map(b => b.text)));
  const sections: PaperSection[] = raw.map((s, i) => {
    const title = displayTitle(s.title, casing);
    const id = `sec-${i}-${slugify(title)}`;
    if (s.type === 'references') {
      // Reference entries are kept verbatim, never split into sentences
      return { id, title, level: s.level, type: s.type, paragraphs: [], references: parseReferences(s.blocks) };
    }
    return {
      id,
      title,
      level: s.level,
      type: s.type,
      paragraphs: blocksToParagraphs(s.blocks, id),
    };
  });

  const abstract = sections.find(s => s.type === 'abstract');
  if (abstract) {
    metadata.rawAbstract = abstract.paragraphs
      .map(p => p.sentences.map(x => x.original).join(' '))
      .join(' ');
  }

  return { metadata, sections, quality: assessQuality(sections) };
}

/** Generate a slug from a section title */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

/** One paragraph per block; captions keep their own paragraph kind */
function blocksToParagraphs(blocks: DocBlock[], sectionId: string): PaperParagraph[] {
  const paragraphs: PaperParagraph[] = [];

  blocks.forEach((block, i) => {
    const text = block.text.trim();
    if (text.length < 2) return;

    const sentenceTexts = block.kind === 'caption' ? [text] : segmentSentences(text);
    if (sentenceTexts.length === 0) return;

    const sentences: PaperSentence[] = sentenceTexts.map((s, j) => ({
      id: `${sectionId}-p${i}-s${j}`,
      original: s,
      transformed: s,         // will be overwritten by engine
      wasTransformed: false,
      transformationType: null,
      transformationRule: null,
      skippedReason: null,
      annotations: [],
    }));

    paragraphs.push({
      id: `${sectionId}-p${i}`,
      kind: block.kind,
      sentences,
    });
  });

  return paragraphs;
}
