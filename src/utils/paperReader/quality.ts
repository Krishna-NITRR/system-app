// ──────────────────────────────────────────────────────────
// Extraction quality check: flags papers whose layout we likely
// misread, so the reader can warn instead of showing nonsense
// with confidence.
// ──────────────────────────────────────────────────────────
import type { ExtractionQuality, PaperSection } from '../../types/paperReader';
import { garbageRatio } from '../pdf/figures';

/** More than this share of sentences under 4 words: text is fragmented */
const MAX_SHORT_SENTENCES = 0.15;
/** More than this share of symbol/private-use characters: garbage */
const MAX_GARBAGE = 0.05;
/** One section holding more than this share of a long paper: no structure found */
const MAX_SECTION_SHARE = 0.7;
const LONG_PAPER_CHARS = 4000;

export function assessQuality(sections: PaperSection[]): ExtractionQuality {
  const issues: string[] = [];

  const sentences = sections.flatMap(s =>
    s.paragraphs.filter(p => p.kind === 'text').flatMap(p => p.sentences.map(x => x.original))
  );
  const shortCount = sentences.filter(x => x.split(/\s+/).filter(Boolean).length < 4).length;
  const shortRatio = sentences.length > 0 ? shortCount / sentences.length : 0;
  if (sentences.length >= 10 && shortRatio > MAX_SHORT_SENTENCES) {
    issues.push(`${Math.round(shortRatio * 100)}% of sentences are fragments under 4 words`);
  }

  const text = sentences.join(' ');
  const garbage = garbageRatio(text);
  if (text.length > 0 && garbage > MAX_GARBAGE) {
    issues.push(`${(garbage * 100).toFixed(1)}% of characters are symbols or unreadable glyphs`);
  }

  const sizes = sections.map(s =>
    s.paragraphs.reduce((n, p) => n + p.sentences.reduce((m, x) => m + x.original.length, 0), 0)
  );
  const total = sizes.reduce((a, b) => a + b, 0);
  const largest = Math.max(0, ...sizes);
  if (total > LONG_PAPER_CHARS && largest / total > MAX_SECTION_SHARE) {
    issues.push(`${Math.round((largest / total) * 100)}% of the text landed in one section`);
  }

  return { ok: issues.length === 0, issues };
}
