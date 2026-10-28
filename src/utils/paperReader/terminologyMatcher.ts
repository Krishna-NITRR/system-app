// ──────────────────────────────────────────────────────────
// Terminology Matcher : dictionary-based term annotation
// Uses a trie for efficient longest-match-first scanning.
//
// Terms, aliases and abbreviations are all indexed. Acronyms
// ("NFC", "IoT", "WebRTC") match case-sensitively so that "IT"
// does not match "it"; other forms match in any case. Words are
// letter/digit runs, so "NFC-based" and "TCP/IP" match too.
// ──────────────────────────────────────────────────────────
import type { PaperSection, TermAnnotation, TermEntry } from '../../types/paperReader';

/* ── Trie Data Structure ── */

interface TrieNode {
  children: Map<string, TrieNode>;
  termId: string | null; // non-null if this node is end of a term
}

export interface TermIndex {
  /** Lowercased word sequences */
  lower: TrieNode;
  /** Acronyms, matched with their exact case */
  exact: TrieNode;
}

function createTrieNode(): TrieNode {
  return { children: new Map(), termId: null };
}

const WORD = /[\p{L}\p{N}]+/gu;

function words(phrase: string): string[] {
  return phrase.match(WORD) ?? [];
}

/** "NFC", "IoT", "WebRTC", "TCP/IP": every word has 2+ capitals */
function isAcronym(tokens: string[]): boolean {
  return tokens.length > 0 && tokens.every(t => (t.match(/\p{Lu}/gu)?.length ?? 0) >= 2);
}

/** Build the term index from a list of term entries (term, aliases, abbreviation) */
export function buildTrie(terms: TermEntry[]): TermIndex {
  const index: TermIndex = { lower: createTrieNode(), exact: createTrieNode() };

  for (const term of terms) {
    const forms = [term.term, ...(term.aliases ?? [])];
    // One-letter abbreviations ("p", "k") would match everywhere
    if (term.abbreviation && term.abbreviation.length >= 2) forms.push(term.abbreviation);

    for (const form of forms) {
      const tokens = words(form);
      if (tokens.length === 0) continue;
      if (isAcronym(tokens)) insertIntoTrie(index.exact, tokens, term.id);
      else insertIntoTrie(index.lower, tokens.map(t => t.toLowerCase()), term.id);
    }
  }

  return index;
}

function insertIntoTrie(root: TrieNode, tokens: string[], termId: string): void {
  let node = root;
  for (const word of tokens) {
    if (!node.children.has(word)) {
      node.children.set(word, createTrieNode());
    }
    node = node.children.get(word)!;
  }
  // First term to claim a phrase keeps it
  node.termId ??= termId;
}

/**
 * Find all terminology matches in a sentence using longest-match-first.
 * Returns annotations with character offsets into the sentence.
 */
export function matchTermsInSentence(
  sentence: string,
  index: TermIndex
): TermAnnotation[] {
  const annotations: TermAnnotation[] = [];
  const tokens = tokenizeForMatching(sentence);
  const seenTerms = new Set<string>();

  let i = 0;
  while (i < tokens.length) {
    const lower = longestMatch(index.lower, tokens, i, t => t.lower, singularLower);
    const exact = longestMatch(index.exact, tokens, i, t => t.text, singularAcronym);
    const result = !lower ? exact : !exact ? lower : exact.wordCount >= lower.wordCount ? exact : lower;

    if (result && !seenTerms.has(result.termId)) {
      // Calculate character offsets
      const startOffset = tokens[i].charStart;
      const endWord = tokens[i + result.wordCount - 1];
      const endOffset = endWord.charStart + endWord.text.length;

      annotations.push({
        termId: result.termId,
        surfaceForm: sentence.substring(startOffset, endOffset),
        startOffset,
        endOffset,
      });

      seenTerms.add(result.termId);
      i += result.wordCount; // skip past matched words
    } else {
      i++;
    }
  }

  return annotations;
}

/**
 * Annotate a section's sentences (their readable text), highlighting
 * each term only at its first occurrence in the section.
 */
export function annotateSection(section: PaperSection, index: TermIndex): void {
  const seen = new Set<string>();
  for (const paragraph of section.paragraphs) {
    for (const sentence of paragraph.sentences) {
      sentence.annotations = matchTermsInSentence(sentence.transformed, index).filter(a => {
        if (seen.has(a.termId)) return false;
        seen.add(a.termId);
        return true;
      });
    }
  }
}

interface WordToken {
  text: string;
  lower: string;
  charStart: number;
  /** Separated from the previous word only by a space, hyphen or slash */
  joinable: boolean;
}

/** Tokenize a sentence into words with character positions */
function tokenizeForMatching(sentence: string): WordToken[] {
  const tokens: WordToken[] = [];
  let prevEnd = -1;
  for (const match of sentence.matchAll(WORD)) {
    const start = match.index ?? 0;
    tokens.push({
      text: match[0],
      lower: match[0].toLowerCase(),
      charStart: start,
      joinable: prevEnd >= 0 && /^[\s\-/]+$/.test(sentence.slice(prevEnd, start)),
    });
    prevEnd = start + match[0].length;
  }
  return tokens;
}

/** "codes" → "code", "processes" → "process" */
function singularLower(word: string): string[] {
  if (word.length < 4 || !word.endsWith('s') || word.endsWith('ss')) return [];
  return word.endsWith('es') ? [word.slice(0, -1), word.slice(0, -2)] : [word.slice(0, -1)];
}

/** "APIs" → "API", "GPUs" → "GPU" */
function singularAcronym(word: string): string[] {
  return /\p{Lu}s$/u.test(word) ? [word.slice(0, -1)] : [];
}

interface MatchResult {
  termId: string;
  wordCount: number;
}

/** Find the longest matching phrase starting at word index `start` */
function longestMatch(
  trie: TrieNode,
  tokens: WordToken[],
  start: number,
  key: (t: WordToken) => string,
  singular: (word: string) => string[]
): MatchResult | null {
  let node = trie;
  let bestMatch: MatchResult | null = null;

  for (let j = start; j < tokens.length; j++) {
    // A phrase never spans punctuation: "(QR) code" is not "QR code"
    if (j > start && !tokens[j].joinable) break;
    const word = key(tokens[j]);

    // A plural can only end a phrase ("QR codes")
    for (const base of singular(word)) {
      const end = node.children.get(base);
      if (end?.termId) bestMatch = { termId: end.termId, wordCount: j - start + 1 };
    }

    const next = node.children.get(word);
    if (!next) break;
    node = next;

    if (node.termId !== null) {
      bestMatch = {
        termId: node.termId,
        wordCount: j - start + 1,
      };
    }
  }

  return bestMatch;
}
