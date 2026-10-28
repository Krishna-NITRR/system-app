// ──────────────────────────────────────────────────────────
// Metadata Extractor : title, authors, affiliations, year, DOI
// from the first page's blocks.
//
// Title: the largest-font substantial block on page 1 (skipping the
// journal masthead and lines repeated on other pages). Authors: the
// block(s) just below it.
// ──────────────────────────────────────────────────────────
import type { PaperMetadata } from '../../types/paperReader';
import type { DocBlock, DocInput } from './docBlocks';

export interface MetadataResult {
  metadata: PaperMetadata;
  /** Indexes of blocks used for the title, authors and affiliations */
  consumed: Set<number>;
  /** Index of the title block (-1 if none) */
  titleIndex: number;
}

const MASTHEAD = /\b(?:journal|proceedings|transactions|letters|university|elsevier|sciencedirect|springer|www\.|https?:)/i;
const STARTS_SECTION = /^(?:abstract|keywords?|index terms|a b s t r a c t|a r t i c l e)\b/i;
const AFFILIATION = /\b(?:universit|institut|department|dept\.|school of|college|laborator|faculty|centre|center|inc\.|ltd|gmbh|corporation|research|hospital|@|e-?mail)/i;

const words = (s: string) => s.split(/\s+/).filter(w => /\p{L}/u.test(w));

function isTitleCandidate(b: DocBlock, repeated: Set<string>): boolean {
  if (b.kind !== 'text' || b.lines.length > 4) return false;
  const w = words(b.text);
  if (w.length < 3 || b.text.length < 15 || b.text.length > 300) return false;
  if (STARTS_SECTION.test(b.text)) return false;
  if (MASTHEAD.test(b.text) && w.length <= 6) return false;
  if (repeated.has(b.text.toLowerCase())) return false;
  return true;
}

/** Strip footnote markers and stray symbols from a name */
function cleanName(s: string): string {
  return s
    .replace(/[∗*†‡§¶#⁎✉]/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\d+/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;.]+|[\s,;]+$/g, '')
    .trim();
}

const NAME_WORD = /^(?:[A-ZÀ-ÖØ-ÞŁ][\p{L}'’-]*\.?|[A-Z]\.(?:-?[A-Z]\.)*|van|von|der|de|da|del|di|la|le|bin|al)$/u;

function isNameLike(s: string): boolean {
  const w = s.split(/\s+/).filter(Boolean);
  if (w.length < 2 || w.length > 6) return false;
  return w.every(x => NAME_WORD.test(x));
}

function splitAuthorList(s: string): string[] {
  return s
    .split(/\s*,\s*(?:and\s+)?|\s+and\s+|\s*&\s*|;\s*/)
    .map(cleanName)
    .filter(Boolean);
}

function parseAuthorBlock(b: DocBlock): string[] | null {
  const text = b.plainText;
  if (text.length > 500 || /\.\s+[A-Z][a-z]+\s+[a-z]+/.test(text)) return null;

  // "Name, Name, and Name"
  const parts = splitAuthorList(text);
  const named = parts.filter(isNameLike);
  if (parts.length > 0 && named.length / parts.length >= 0.6 && !AFFILIATION.test(text)) {
    return named;
  }

  // Grid entry: name on the first line, affiliation/email below
  if (b.lines.length >= 2) {
    const first = cleanName(b.lines[0].text);
    if (isNameLike(first) && AFFILIATION.test(b.lines.slice(1).map(l => l.text).join(' '))) {
      return [first];
    }
  }
  return null;
}

export function extractMetadata(input: DocInput): MetadataResult {
  const { blocks } = input;
  const metadata: PaperMetadata = {
    title: 'Untitled Paper',
    authors: [],
    affiliations: [],
    keywords: [],
    notes: [],
    year: null,
    journal: null,
    doi: input.doi,
    rawAbstract: '',
  };
  const consumed = new Set<number>();
  if (blocks.length === 0) return { metadata, consumed, titleIndex: -1 };

  // Text that appears on more than one page is a running header, not a title
  const pagesByText = new Map<string, Set<number>>();
  for (const b of blocks) {
    const k = b.text.toLowerCase();
    const set = pagesByText.get(k) ?? new Set<number>();
    set.add(b.page);
    pagesByText.set(k, set);
  }
  const repeated = new Set([...pagesByText].filter(([, p]) => p.size > 1).map(([k]) => k));

  // ── Title
  const firstPage = blocks[0].page;
  const candidates = blocks
    .slice(0, 60)
    .filter(b => b.page === firstPage && isTitleCandidate(b, repeated));
  let title: DocBlock | undefined;
  if (input.hasStyles) {
    title = candidates.reduce<DocBlock | undefined>(
      (best, b) => (!best || b.size > best.size + 0.1 ? b : best),
      undefined
    );
    if (title && title.size < input.bodySize) title = candidates[0];
  } else {
    title = candidates[0];
  }
  if (!title) return { metadata, consumed, titleIndex: -1 };
  metadata.title = title.text.replace(/\s+/g, ' ').trim();
  consumed.add(title.index);

  // ── Authors (and affiliations) just below the title
  for (let i = title.index + 1; i < Math.min(blocks.length, title.index + 16); i++) {
    const b = blocks[i];
    if (b.page !== title.page || b.kind !== 'text') break;
    if (STARTS_SECTION.test(b.text) || /^(?:[IVX]+|\d+)\.?\s+[A-Z]/.test(b.text) && b.text.length < 80) break;

    const names = parseAuthorBlock(b);
    if (names && names.length > 0) {
      metadata.authors.push(...names);
      consumed.add(i);
    } else if (metadata.authors.length > 0 && AFFILIATION.test(b.text) && b.text.length < 600) {
      metadata.affiliations.push(b.text);
      consumed.add(i);
    } else if (metadata.authors.length > 0 || b.text.length > 300) {
      break;
    }
  }
  metadata.authors = [...new Set(metadata.authors)].slice(0, 40);

  // ── DOI
  if (!metadata.doi) {
    const all = blocks.map(b => b.text).join(' ');
    const m = all.match(/(?:doi[:\s]*|https?:\/\/(?:dx\.)?doi\.org\/)(10\.\d{4,}\/[^\s]+)/i);
    if (m) metadata.doi = m[1].replace(/[.,;)\]]+$/, '');
  }

  // ── Year: "© 2019" on page 1, else a year inside the DOI
  //    ("10.1109/JRFID.2023.3268422"), else the latest year on page 1
  //    (the first one is often history: "Since 1990, ...")
  const page1 = blocks.filter(b => b.page === firstPage).map(b => b.text).join(' ');
  const latestAllowed = new Date().getFullYear() + 1;
  const page1Years = [...page1.matchAll(/\b((?:19|20)\d{2})\b/g)]
    .map(m => Number(m[1]))
    .filter(y => y <= latestAllowed);
  metadata.year =
    page1.match(/©\s*((?:19|20)\d{2})\b/)?.[1] ??
    metadata.doi?.match(/[./]((?:19|20)\d{2})[./]/)?.[1] ??
    (page1Years.length > 0 ? String(Math.max(...page1Years)) : null);

  return { metadata, consumed, titleIndex: title.index };
}
