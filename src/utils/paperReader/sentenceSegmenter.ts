// ──────────────────────────────────────────────────────────
// Sentence Segmenter — rule-based sentence boundary detection
// Handles abbreviations, decimals, citations, and ellipsis
// ──────────────────────────────────────────────────────────

/** Common abbreviations that should NOT trigger sentence boundaries */
const ABBREVIATIONS = new Set([
  'dr', 'mr', 'mrs', 'ms', 'prof', 'sr', 'jr', 'st',
  'fig', 'figs', 'eq', 'eqs', 'ref', 'refs', 'sect', 'sec',
  'vol', 'no', 'nos', 'vs', 'etc', 'al', 'approx',
  'dept', 'div', 'est', 'govt', 'natl', 'intl',
  'temp', 'min', 'max', 'avg', 'std', 'dev',
  'inc', 'corp', 'ltd', 'co', 'org',
  'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  'ed', 'eds', 'trans', 'rev', 'repr', 'publ',
  'i.e', 'e.g', 'cf', 'viz', 'ca',
]);

/**
 * Segment a paragraph into individual sentences.
 * Returns an array of sentence strings.
 */
export function segmentSentences(paragraph: string): string[] {
  if (!paragraph || paragraph.trim().length === 0) return [];

  const text = paragraph.replace(/\s+/g, ' ').trim();
  const sentences: string[] = [];
  let current = '';
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    current += char;

    // Check for sentence-ending punctuation: . ? !
    if (char === '.' || char === '?' || char === '!') {
      // Look ahead: is this actually a sentence boundary?
      if (isSentenceBoundary(text, i, current)) {
        // Consume any trailing closing quotes/brackets/parentheses
        while (i + 1 < text.length && /[)"\u201D\u2019\]]/.test(text[i + 1])) {
          i++;
          current += text[i];
        }
        const trimmed = current.trim();
        if (trimmed.length > 0) {
          sentences.push(trimmed);
        }
        current = '';
      }
    }

    i++;
  }

  // Push any remaining text
  const remaining = current.trim();
  if (remaining.length > 0) {
    sentences.push(remaining);
  }

  return sentences;
}

/**
 * Determine if the period/question/exclamation at position `pos` in `text`
 * is a genuine sentence boundary.
 */
function isSentenceBoundary(text: string, pos: number, _accumulated: string): boolean {
  const char = text[pos];

  // Question marks and exclamation marks are almost always boundaries
  if (char === '?' || char === '!') {
    // Unless followed by a lowercase letter immediately (unlikely but safe)
    const afterSpace = getCharAfterWhitespace(text, pos);
    return afterSpace === '' || /[A-Z\d"(\u201C]/.test(afterSpace) || afterSpace === '' ;
  }

  // For periods:
  if (char !== '.') return false;

  // 1. Inside a number: "3.14", "0.05"
  if (pos > 0 && pos < text.length - 1 && /\d/.test(text[pos - 1]) && /\d/.test(text[pos + 1])) {
    return false;
  }

  // 2. Part of an abbreviation
  const wordBefore = getWordBefore(text, pos);
  if (wordBefore && ABBREVIATIONS.has(wordBefore.toLowerCase())) {
    return false;
  }

  // 3. "et al." — never a boundary by itself
  if (pos >= 5 && text.substring(pos - 5, pos + 1).match(/et\s+al\./)) {
    return false;
  }

  // 4. Single-letter initial: "A. Smith", "J. K. Rowling"
  if (pos >= 1 && /^[A-Z]$/.test(text[pos - 1]) && pos >= 2 && /[\s(]/.test(text[pos - 2])) {
    return false;
  }

  // 5. Ellipsis: "..."
  if ((pos > 0 && text[pos - 1] === '.') || (pos < text.length - 1 && text[pos + 1] === '.')) {
    return false;
  }

  // 6. Inside brackets/parentheses at surface level — common in citations
  if (isInsideBrackets(text, pos)) {
    return false;
  }

  // 7. Check what follows the period
  const afterWhitespace = getCharAfterWhitespace(text, pos);
  if (afterWhitespace === '') return true; // end of text
  if (/[A-Z\d"(\u201C\[]/.test(afterWhitespace)) return true; // capital letter, number, quote, bracket
  if (/[a-z]/.test(afterWhitespace)) return false; // lowercase = likely not a boundary

  return true;
}

/** Extract the word immediately before position `pos` */
function getWordBefore(text: string, pos: number): string {
  let end = pos - 1;
  while (end >= 0 && text[end] === '.') end--; // skip consecutive dots
  let start = end;
  while (start >= 0 && /[a-zA-Z.]/.test(text[start])) start--;
  return text.substring(start + 1, end + 1);
}

/** Get the first non-whitespace character after position `pos` */
function getCharAfterWhitespace(text: string, pos: number): string {
  let j = pos + 1;
  while (j < text.length && /\s/.test(text[j])) j++;
  return j < text.length ? text[j] : '';
}

/** Simple check: is position inside [...] or (...) brackets */
function isInsideBrackets(text: string, pos: number): boolean {
  let bracketDepth = 0;
  let parenDepth = 0;
  for (let i = 0; i < pos; i++) {
    if (text[i] === '[') bracketDepth++;
    else if (text[i] === ']') bracketDepth = Math.max(0, bracketDepth - 1);
    else if (text[i] === '(') parenDepth++;
    else if (text[i] === ')') parenDepth = Math.max(0, parenDepth - 1);
  }
  return bracketDepth > 0 || parenDepth > 0;
}
