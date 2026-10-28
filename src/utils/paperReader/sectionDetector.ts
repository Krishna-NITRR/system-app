// ──────────────────────────────────────────────────────────
// Section Detector : groups document blocks into sections.
//
// Headings are detected from numbering patterns ("I. INTRODUCTION",
// "2.1 Methods", "A. Overview") checked against font size/style, and
// from known unnumbered names ("Abstract", "Conclusion", "References").
// Run-in headings ("Abstract—We propose…") are split off their text.
// Every block lands in exactly one place: a section, the keyword
// list, or the first-page notes/footnotes.
// ──────────────────────────────────────────────────────────
import type { SectionType } from '../../types/paperReader';
import type { DocBlock, DocInput } from './docBlocks';

/** Known section names (matched after numbering is stripped) */
const SECTION_PATTERNS: { pattern: RegExp; type: SectionType }[] = [
  { pattern: /^abstract$/i, type: 'abstract' },
  { pattern: /^introduction$/i, type: 'introduction' },
  { pattern: /^(?:materials?\s*(?:and|&)\s*)?methods?$/i, type: 'methods' },
  { pattern: /^experimental\s*(?:procedure|setup|methods?|details?)?$/i, type: 'methods' },
  { pattern: /^methodology$/i, type: 'methods' },
  { pattern: /^results?$/i, type: 'results' },
  { pattern: /^results?\s*(?:and|&)\s*discussions?$/i, type: 'results' },
  { pattern: /^discussions?$/i, type: 'discussion' },
  { pattern: /^(?:summary\s*(?:and|&)\s*)?conclusions?(?:\s*(?:and|&)\s*future\s*(?:work|directions))?$/i, type: 'conclusion' },
  { pattern: /^(?:concluding\s*remarks|summary)$/i, type: 'conclusion' },
  { pattern: /^(?:references?|bibliography|works?\s*cited|literature\s*cited)$/i, type: 'references' },
  { pattern: /^acknowledge?m?ents?$/i, type: 'other' },
  { pattern: /^(?:appendix|appendices)\b/i, type: 'other' },
  { pattern: /^(?:background|related\s*works?|literature\s*review|preliminaries)$/i, type: 'other' },
  { pattern: /^(?:supplementary|supporting)\s*(?:information|materials?|data)$/i, type: 'other' },
  { pattern: /^(?:data\s*availability(?:\s*statement)?|funding|author\s*contributions|declaration\s*of\s*competing\s*interests?|conflicts?\s*of\s*interests?|credit\s*authorship\s*contribution\s*statement)$/i, type: 'other' },
];

const KEYWORDS_HEADING = /^(?:keywords?|key\s*words|index\s*terms)\s*[:.—–-]?$/i;
const ARTICLE_INFO = /^article\s*info(?:rmation)?$/i;
const RUN_IN = /^(abstract|keywords?|key\s*words|index\s*terms)\s*(?:[—–:.]\s*|-\s+|\s+(?=[A-Z]))(.+)$/is;
const FRONT_NOTE = /^(?:received|accepted|available online|article history|published|revised)\b/i;

const ROMAN = /^([IVXLC]+)\.\s+(.+)$/;
const LETTER = /^([A-Z])\.\s+(.+)$/;
const ARABIC = /^(\d{1,2}(?:\.\d{1,2}){0,3})\.?\s+(.+)$/;

export interface HeadingInfo {
  title: string;
  level: number;
  type: SectionType;
}

export interface RawSection {
  title: string;
  level: number;
  type: SectionType;
  blocks: DocBlock[];
}

export interface SectionResult {
  sections: RawSection[];
  keywords: string[];
  notes: string[];
}

/** "A B S T R A C T" → "ABSTRACT" */
function collapseLetterSpacing(s: string): string {
  return /^(?:\p{L} ){2,}\p{L}(?: \p{L})*$/u.test(s.trim()) ? s.replace(/ /g, '') : s;
}

function knownType(name: string): SectionType | null {
  const clean = name.replace(/[:.]$/, '').trim();
  for (const sp of SECTION_PATTERNS) if (sp.pattern.test(clean)) return sp.type;
  return null;
}

/** Strip "I.", "2.1", "A." numbering from a heading */
function stripNumbering(title: string): string {
  return title
    .replace(ROMAN, '$2')
    .replace(/^(\d{1,2}(?:\.\d{1,2}){0,3})\.?\s+/, '')
    .replace(/^[A-Z]\.\s+/, '')
    .trim();
}

/** Classify a section title into a SectionType */
export function classifySectionType(title: string): SectionType {
  return knownType(title) ?? knownType(stripNumbering(title)) ?? 'other';
}

/** Detect whether a block is a section heading */
export function detectHeading(b: DocBlock, input: DocInput): HeadingInfo | null {
  if (b.kind !== 'text' || b.lines.length > 2) return null;
  const text = collapseLetterSpacing(b.text.trim());
  if (text.length === 0 || text.length > 100) return null;
  if (/[,;]$/.test(text) || text.includes('@')) return null;

  const known = knownType(text);
  if (known) return { title: text.replace(/[:.]$/, ''), level: 1, type: known };

  // Does this block look different from body text?
  const distinct = input.hasStyles
    ? Math.abs(b.size - input.bodySize) >= 0.5 ||
      b.font !== input.bodyFont ||
      b.bold ||
      b.italic
    : b.lines.length === 1 && text.length < 80;
  const endsLikeSentence = /[.!?]$/.test(text) && !/\b(?:[IVXLC]+|\d+)\.$/.test(text);
  if (endsLikeSentence) return null;
  // Headings are never smaller than footnote-size text in a styled document
  if (input.hasStyles && b.size < input.bodySize - 2.5) return null;

  const roman = text.match(ROMAN);
  if (roman && /^[A-Z]/.test(roman[2])) {
    const upper = roman[2] === roman[2].toUpperCase();
    // "C. PoC App Implementation" is subsection C, not section 100:
    // single-letter numerals only count in ALL-CAPS headings
    if (upper || (distinct && roman[1].length > 1)) {
      return { title: text, level: 1, type: knownType(roman[2]) ?? 'other' };
    }
  }

  // Numbered and unnumbered headings are set at body size or larger
  // (small-caps Roman headings above are the exception)
  const notSmall = !input.hasStyles || b.size >= input.bodySize - 0.5;

  const arabic = text.match(ARABIC);
  if (arabic && /^[A-Z]/.test(arabic[2]) && distinct && notSmall && text.length <= 90) {
    const depth = arabic[1].split('.').length;
    return { title: text, level: Math.min(depth, 3), type: knownType(arabic[2]) ?? 'other' };
  }

  const letter = text.match(LETTER);
  if (letter && /^[A-Z]/.test(letter[2]) && distinct && notSmall && text.length <= 80) {
    return { title: text, level: 2, type: 'other' };
  }

  // Unnumbered heading set apart by style: bold or larger, short, one line
  if (
    input.hasStyles &&
    b.lines.length === 1 &&
    text.length <= 60 &&
    /^\p{Lu}/u.test(text) &&
    notSmall &&
    ((b.bold && b.font !== input.bodyFont) || b.size >= input.bodySize + 1.5) &&
    text.split(/\s+/).length <= 10
  ) {
    return { title: text, level: b.size >= input.bodySize + 1.5 ? 1 : 2, type: 'other' };
  }

  return null;
}

/** Split "x, y; z" or one-per-line keyword lists */
function splitKeywords(text: string, lines: string[]): string[] {
  const parts = /[,;·•]/.test(text) ? text.split(/\s*[,;·•]\s*/) : lines;
  return parts.map(k => k.replace(/[.;,]$/, '').trim()).filter(k => k.length > 1);
}

function isFootnote(b: DocBlock, input: DocInput): boolean {
  if (!input.hasStyles || b.kind !== 'text') return false;
  return b.size < input.bodySize - 0.5 && b.top > b.pageHeight * 0.55 && b.text.length < 800;
}

/**
 * Group blocks into sections. Blocks in `skip` (title, authors) are
 * left out. Text before the first heading becomes "Front matter".
 */
export function buildSections(input: DocInput, skip: Set<number>, titleIndex: number): SectionResult {
  const sections: RawSection[] = [];
  const keywords: string[] = [];
  const notes: string[] = [];
  const front: RawSection = { title: 'Front matter', level: 1, type: 'other', blocks: [] };
  let current: RawSection | null = null;
  let mode: 'normal' | 'keywords' | 'articleInfo' = 'normal';

  const open = (h: HeadingInfo) => {
    current = { ...h, blocks: [] };
    sections.push(current);
    mode = 'normal';
  };

  for (const b of input.blocks) {
    if (skip.has(b.index)) continue;
    const inReferences = (current as RawSection | null)?.type === 'references';

    // Notices printed above the title, and front-page dates
    if (b.index < titleIndex || (!current && FRONT_NOTE.test(b.text))) {
      notes.push(b.text);
      continue;
    }
    if (mode === 'keywords' && b.kind === 'text' && b.text.length < 300 && !detectHeading(b, input)) {
      keywords.push(...splitKeywords(b.text, b.lines.map(l => l.text)));
      continue;
    }
    if (!inReferences && isFootnote(b, input) && !detectHeading(b, input)) {
      notes.push(b.text);
      continue;
    }

    const runIn = b.kind === 'text' && !inReferences ? b.text.match(RUN_IN) : null;
    const hasSeparator = runIn && /^\s*[—–:.-]/.test(b.text.slice(runIn[1].length));
    const runInIsHeading =
      runIn &&
      (b.leadText.trim().length > 0 ||
        hasSeparator ||
        (/^abstract/i.test(runIn[1]) && b.page <= 2 && !sections.some(s => s.type === 'abstract')));
    if (runIn && runInIsHeading) {
      const name = runIn[1];
      const rest = runIn[2].trim();
      if (/^abstract/i.test(name)) {
        open({ title: 'Abstract', level: 1, type: 'abstract' });
        current!.blocks.push({ ...b, text: rest, plainText: rest, leadText: '' });
      } else {
        keywords.push(...splitKeywords(rest, [rest]));
        mode = 'keywords';
      }
      continue;
    }

    // Keyword lists and Elsevier's "ARTICLE INFO" box
    const collapsed = collapseLetterSpacing(b.text.trim());
    if (b.kind === 'text' && !inReferences && KEYWORDS_HEADING.test(collapsed)) {
      mode = 'keywords';
      continue;
    }
    if (b.kind === 'text' && !inReferences && ARTICLE_INFO.test(collapsed)) {
      mode = 'articleInfo';
      continue;
    }

    const heading = inReferences
      ? (() => {
          const h = detectHeading(b, input);
          // Inside the reference list only an appendix or similar ends it
          return h && h.type !== 'references' && /^(?:appendix|appendices|biograph|acknowledg|supplementary)/i.test(stripNumbering(h.title)) ? h : null;
        })()
      : detectHeading(b, input);

    if (heading) {
      open(heading);
      continue;
    }

    if (mode === 'articleInfo') {
      notes.push(b.text);
      continue;
    }
    mode = 'normal';

    (current ?? front).blocks.push(b);
  }

  // Leading text before any heading: a "Front matter" section, or the
  // whole paper when no headings were found at all.
  if (sections.length === 0) {
    front.title = 'Full text';
    return { sections: front.blocks.length > 0 ? [front] : [], keywords, notes };
  }
  const all = front.blocks.length > 0 ? [front, ...sections] : sections;
  return {
    sections: all.filter(s => s.blocks.length > 0 || hasChildren(all, s)),
    keywords: [...new Set(keywords)],
    notes,
  };
}

/** A heading with no text of its own still matters if subsections follow it */
function hasChildren(all: RawSection[], s: RawSection): boolean {
  const i = all.indexOf(s);
  const next = all[i + 1];
  return !!next && next.level > s.level;
}

/* ── Display titles ── */

const SMALL_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'into', 'of', 'on', 'or', 'the', 'to', 'via', 'vs', 'with']);

/**
 * Turn an ALL-CAPS heading into title case, keeping acronyms in the
 * casing the body text uses ("SECURE DATA SHARING BY POC APP" →
 * "Secure Data Sharing by PoC App").
 */
export function displayTitle(title: string, bodyCasing: Map<string, string>): string {
  const t = collapseLetterSpacing(title.trim());
  const letters = t.replace(/[^\p{L}]/gu, '');
  if (letters.length < 4 || letters !== letters.toUpperCase()) return t;

  const prefix = t.match(/^(?:[IVXLC]+\.|\d+(?:\.\d+)*\.?|[A-Z]\.)\s+/)?.[0] ?? '';
  const rest = t.slice(prefix.length);
  let first = true;
  const words = rest.split(/(\s+|-)/).map(w => {
    if (!/\p{L}/u.test(w)) return w;
    const lower = w.toLowerCase();
    const body = bodyCasing.get(lower);
    let out: string;
    if (body && body !== lower && body !== lower[0].toUpperCase() + lower.slice(1)) out = body;
    else if (!first && SMALL_WORDS.has(lower)) out = lower;
    else out = lower[0].toUpperCase() + lower.slice(1);
    first = false;
    return out;
  });
  return prefix + words.join('');
}

/** Most common mixed/upper-case spelling of each word in the body text */
export function buildBodyCasing(texts: string[]): Map<string, string> {
  const counts = new Map<string, Map<string, number>>();
  for (const t of texts) {
    for (const w of t.match(/\p{L}[\p{L}\d]*/gu) ?? []) {
      const lower = w.toLowerCase();
      const forms = counts.get(lower) ?? new Map<string, number>();
      forms.set(w, (forms.get(w) ?? 0) + 1);
      counts.set(lower, forms);
    }
  }
  const casing = new Map<string, string>();
  for (const [lower, forms] of counts) {
    const best = [...forms.entries()].sort((a, b) => b[1] - a[1])[0][0];
    casing.set(lower, best);
  }
  return casing;
}
