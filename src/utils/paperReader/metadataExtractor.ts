// ──────────────────────────────────────────────────────────
// Metadata Extractor — extracts title, authors, year, DOI from raw text
// ──────────────────────────────────────────────────────────
import type { PaperMetadata } from '../../types/paperReader';

/**
 * Extract paper metadata from the raw text.
 * Uses heuristics — the first substantive line is likely the title,
 * followed by author lines, then possibly a journal/year line.
 */
export function extractMetadata(text: string): PaperMetadata {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const metadata: PaperMetadata = {
    title: 'Untitled Paper',
    authors: [],
    year: null,
    journal: null,
    doi: null,
    rawAbstract: '',
  };

  if (lines.length === 0) return metadata;

  // ── Title: first substantial line (>10 chars, doesn't look like an author line)
  let titleLineIdx = -1;
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];
    if (line.length > 10 && !isLikelyAuthorLine(line) && !isLikelyHeaderFooter(line)) {
      metadata.title = line;
      titleLineIdx = i;
      break;
    }
  }

  // ── Authors: lines after title that look like author names
  if (titleLineIdx >= 0) {
    for (let i = titleLineIdx + 1; i < Math.min(lines.length, titleLineIdx + 8); i++) {
      const line = lines[i];
      if (isLikelyAuthorLine(line)) {
        const authors = parseAuthors(line);
        metadata.authors.push(...authors);
      } else if (line.toLowerCase().startsWith('abstract') || metadata.authors.length > 0) {
        break;
      }
    }
  }

  // ── Year: search for 4-digit year pattern (19xx or 20xx)
  const yearMatch = text.match(/\b((?:19|20)\d{2})\b/);
  if (yearMatch) {
    metadata.year = yearMatch[1];
  }

  // ── DOI: search for DOI pattern
  const doiMatch = text.match(/(?:doi[:\s]*|https?:\/\/doi\.org\/)(10\.\d{4,}\/[^\s]+)/i);
  if (doiMatch) {
    metadata.doi = doiMatch[1].replace(/[.,;)\]]+$/, ''); // clean trailing punctuation
  }

  // ── Abstract: find abstract section content
  const abstractIdx = lines.findIndex(l => /^abstract/i.test(l));
  if (abstractIdx >= 0) {
    const abstractLines: string[] = [];
    for (let i = abstractIdx + 1; i < lines.length && i < abstractIdx + 20; i++) {
      const line = lines[i];
      // Stop at next section heading or keywords line
      if (/^(?:keywords?|introduction|\d+\.\s)/i.test(line)) break;
      if (line.length > 10) abstractLines.push(line);
    }
    metadata.rawAbstract = abstractLines.join(' ');
  }

  return metadata;
}

/** Check if a line looks like an author list */
function isLikelyAuthorLine(line: string): boolean {
  // Author lines typically contain commas separating names, "and", superscript markers
  // and are shorter than section body text
  if (line.length > 200) return false;
  if (line.length < 5) return false;

  // Contains patterns like "A. Smith", "John Doe", comma-separated names
  const namePattern = /[A-Z][a-z]+(?:\s+[A-Z]\.?\s*)*(?:\s+[A-Z][a-z]+)/;
  const hasNames = namePattern.test(line);
  const hasCommasOrAnd = /,|(?:\band\b)/.test(line);
  const hasAffiliationMarkers = /[¹²³⁴⁵⁶\*†‡§]|\d+,?\s*$/.test(line);

  // Doesn't contain sentence-like features
  const hasSentenceEnd = /\.\s+[A-Z]/.test(line);

  return hasNames && (hasCommasOrAnd || hasAffiliationMarkers) && !hasSentenceEnd;
}

/** Check if a line looks like a header/footer (page number, journal header) */
function isLikelyHeaderFooter(line: string): boolean {
  if (/^\d+$/.test(line.trim())) return true; // page number
  if (line.length < 5) return true;
  if (/^(page|vol\.|volume|issue|journal)/i.test(line)) return true;
  return false;
}

/** Parse a comma/and-separated author line into individual names */
function parseAuthors(line: string): string[] {
  // Remove affiliation markers
  const cleaned = line.replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰\*†‡§]/g, '').trim();

  // Split by comma and "and"
  const parts = cleaned.split(/\s*(?:,\s*(?:and\s+)?|\s+and\s+)\s*/);

  return parts
    .map(p => p.trim())
    .filter(p => p.length > 2 && /[A-Za-z]/.test(p))
    .slice(0, 20); // reasonable cap
}
