// ──────────────────────────────────────────────────────────
// Research Paper Reader — Type Definitions
// ──────────────────────────────────────────────────────────

/* ── Processed Paper ── */

export interface ProcessedPaper {
  metadata: PaperMetadata;
  sections: PaperSection[];
  stats: TransformationStats;
}

export interface PaperMetadata {
  title: string;
  authors: string[];
  year: string | null;
  journal: string | null;
  doi: string | null;
  rawAbstract: string;
}

export interface PaperSection {
  id: string;
  title: string;
  level: number;
  paragraphs: PaperParagraph[];
}

export interface PaperParagraph {
  id: string;
  sentences: PaperSentence[];
}

export interface PaperSentence {
  id: string;
  original: string;
  transformed: string;
  wasTransformed: boolean;
  transformationType: TransformationType | null;
  skippedReason: string | null;
  annotations: TermAnnotation[];
}

export type TransformationType =
  | 'nominalization'
  | 'passive_to_active'
  | 'complex_phrase'
  | 'wordiness'
  | 'connector'
  | 'nested_noun_phrase';

export interface TermAnnotation {
  termId: string;
  surfaceForm: string;
  startOffset: number;
  endOffset: number;
}

export interface TransformationStats {
  totalSentences: number;
  transformedSentences: number;
  skippedSentences: number;
  annotatedTerms: number;
  uniqueTerms: number;
  sectionsDetected: number;
}

/* ── State Machine ── */

export type ProcessingStep =
  | 'extracting'
  | 'parsing'
  | 'transforming'
  | 'annotating';

export type ReaderState =
  | { phase: 'landing' }
  | { phase: 'uploading'; progress: number }
  | { phase: 'processing'; step: ProcessingStep; progress: number }
  | { phase: 'ready'; paper: ProcessedPaper }
  | { phase: 'error'; message: string };

/* ── Reader UI State ── */

export interface ReaderUIState {
  viewMode: 'original' | 'readable';
  showAnnotations: boolean;
  activeSection: string | null;
  activeTerm: string | null;
}

/* ── Terminology ── */

export interface TermEntry {
  id: string;
  term: string;
  aliases: string[];
  abbreviation: string | null;
  domain: string;
  subdomain: string | null;
  simple_definition: string;
  technical_definition: string;
  related_terms: string[];
  context_example: string;
  confidence: 'high' | 'medium';
  source: string;
}

export interface TermDataset {
  domain: string;
  version: string;
  terms: TermEntry[];
}

/* ── Safety & Transformation ── */

export type SafetyFlag =
  | 'equation'
  | 'statistic'
  | 'citation'
  | 'variable'
  | 'unit'
  | 'negation'
  | 'causality'
  | 'comparison'
  | 'uncertainty'
  | 'condition';

export type SectionType =
  | 'abstract'
  | 'introduction'
  | 'methods'
  | 'results'
  | 'discussion'
  | 'conclusion'
  | 'references'
  | 'other';

export interface SentenceContext {
  protectedSpans: [number, number][];
  flags: Set<SafetyFlag>;
  sectionType: SectionType;
}

export interface TransformationRule {
  id: string;
  name: string;
  type: TransformationType;
  priority: number;
  pattern: RegExp;
  replacement: string | ((match: RegExpMatchArray, context: SentenceContext) => string | null);
  requiredAbsentFlags: SafetyFlag[];
  disabledInSections: SectionType[];
  description: string;
}

export interface TransformationResult {
  text: string;
  wasTransformed: boolean;
  ruleApplied: TransformationRule | null;
  skippedReason: string | null;
}
