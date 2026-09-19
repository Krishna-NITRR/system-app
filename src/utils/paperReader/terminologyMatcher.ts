// ──────────────────────────────────────────────────────────
// Terminology Matcher — dictionary-based term annotation
// Uses a trie for efficient longest-match-first scanning.
// ──────────────────────────────────────────────────────────
import type { TermAnnotation, TermEntry } from '../../types/paperReader';

/* ── Trie Data Structure ── */

interface TrieNode {
  children: Map<string, TrieNode>;
  termId: string | null; // non-null if this node is end of a term
}

function createTrieNode(): TrieNode {
  return { children: new Map(), termId: null };
}

/** Build a trie from a list of term entries (term + all aliases) */
export function buildTrie(terms: TermEntry[]): TrieNode {
  const root = createTrieNode();

  for (const term of terms) {
    // Insert the main term
    insertIntoTrie(root, term.term.toLowerCase(), term.id);
    // Insert all aliases
    for (const alias of term.aliases) {
      insertIntoTrie(root, alias.toLowerCase(), term.id);
    }
  }

  return root;
}

function insertIntoTrie(root: TrieNode, phrase: string, termId: string): void {
  // Split into words for word-level matching
  const words = phrase.split(/\s+/).filter(w => w.length > 0);
  let node = root;

  for (const word of words) {
    if (!node.children.has(word)) {
      node.children.set(word, createTrieNode());
    }
    node = node.children.get(word)!;
  }

  node.termId = termId;
}

/**
 * Find all terminology matches in a sentence using longest-match-first.
 * Returns annotations with character offsets into the sentence.
 */
export function matchTermsInSentence(
  sentence: string,
  trie: TrieNode
): TermAnnotation[] {
  const annotations: TermAnnotation[] = [];
  const words = tokenizeForMatching(sentence);
  const seenTerms = new Set<string>();

  let i = 0;
  while (i < words.length) {
    const result = longestMatch(trie, words, i);

    if (result && !seenTerms.has(result.termId)) {
      // Calculate character offsets
      const startOffset = words[i].charStart;
      const endWord = words[i + result.wordCount - 1];
      const endOffset = endWord.charStart + endWord.text.length;

      const surfaceForm = sentence.substring(startOffset, endOffset);

      annotations.push({
        termId: result.termId,
        surfaceForm,
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

interface WordToken {
  text: string;
  lower: string;
  charStart: number;
}

/** Tokenize a sentence into words with character positions */
function tokenizeForMatching(sentence: string): WordToken[] {
  const tokens: WordToken[] = [];
  const wordRegex = /[a-zA-Z\u00C0-\u024F'-]+/g;
  let match: RegExpExecArray | null;

  while ((match = wordRegex.exec(sentence)) !== null) {
    tokens.push({
      text: match[0],
      lower: match[0].toLowerCase(),
      charStart: match.index,
    });
  }

  return tokens;
}

interface MatchResult {
  termId: string;
  wordCount: number;
}

/** Find the longest matching phrase starting at word index `start` */
function longestMatch(
  trie: TrieNode,
  words: WordToken[],
  start: number
): MatchResult | null {
  let node = trie;
  let bestMatch: MatchResult | null = null;

  for (let j = start; j < words.length; j++) {
    const word = words[j].lower;
    if (!node.children.has(word)) break;

    node = node.children.get(word)!;

    if (node.termId !== null) {
      bestMatch = {
        termId: node.termId,
        wordCount: j - start + 1,
      };
    }
  }

  return bestMatch;
}
