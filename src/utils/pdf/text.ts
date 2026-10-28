// ──────────────────────────────────────────────────────────
// Text cleanup: character normalization, hyphenation repair and
// paragraphs continued across column/page breaks.
// ──────────────────────────────────────────────────────────
import type { PdfBlock } from './types';

const LIGATURES: Record<string, string> = {
  'ﬀ': 'ff',
  'ﬁ': 'fi',
  'ﬂ': 'fl',
  'ﬃ': 'ffi',
  'ﬄ': 'ffl',
  'ﬅ': 'st',
  'ﬆ': 'st',
};

/** Ligatures to letters, odd spaces to plain spaces, invisible marks removed */
export function normalizeChars(s: string): string {
  return s
    .replace(/[ﬀ-ﬆ]/g, c => LIGATURES[c] ?? c)
    .replace(/[  -   　]/g, ' ')
    .replace(/[­​-‍⁠﻿]/g, '');
}

/**
 * Join a paragraph's lines. A line ending in "letter-" followed by a
 * lowercase start is a broken word ("wait-" + "ing" → "waiting"), unless
 * the part before the hyphen is an acronym or number ("UHF-" + "based").
 */
export function joinLines(lines: string[]): string {
  let text = '';
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (!text) {
      text = line;
      continue;
    }
    const broken = text.match(/(\S*[A-Za-z])-$/);
    if (broken && /^[a-z]/.test(line)) {
      const word = broken[1].split(/[-/]/).pop() ?? '';
      const keepHyphen =
        /\d/.test(word) ||
        /^[A-Z]{2,}$/.test(word) ||
        // Suspended compound: "on- and off-" + "body"
        /\b[A-Za-z]+- (?:and|or|to) [A-Za-z]+-$/.test(text);
      text = keepHyphen ? text + line : text.slice(0, -1) + line;
    } else if (/[A-Za-z]-$/.test(text) && /^[A-Z0-9]/.test(line)) {
      // Compound with a capitalized part: "UHF-" + "RFID/NFC"
      text += line;
    } else if (/\/$/.test(text)) {
      // URL broken after a slash ("https://" + "doi.org/...")
      text += line;
    } else {
      text += ' ' + line;
    }
  }
  return text.replace(/\s+/g, ' ').trim();
}

const ENDS_PARAGRAPH = /[.!?:]["'”’)\]]*$/;

/**
 * Rejoin paragraphs that a column or page break split in two: the first
 * part does not end a sentence and the next text block (skipping captions
 * placed in between) starts lowercase in the same font size.
 */
export function mergeContinuations(blocks: PdfBlock[], join: (a: PdfBlock, b: PdfBlock) => PdfBlock): PdfBlock[] {
  const out: PdfBlock[] = [];
  const pending = [...blocks];
  while (pending.length > 0) {
    const a = pending.shift()!;
    if (a.kind !== 'text' || ENDS_PARAGRAPH.test(a.text)) {
      out.push(a);
      continue;
    }
    // Look past up to two caption blocks for the continuation
    let j = 0;
    while (j < pending.length && j < 3 && pending[j].kind === 'caption') j++;
    const b = pending[j];
    const continues =
      b &&
      b.kind === 'text' &&
      Math.abs(a.size - b.size) < 0.5 &&
      (/^[a-z]/.test(b.text) || /[A-Za-z]-$/.test(a.text)) &&
      b.page - a.page <= 1;
    if (continues) {
      pending.splice(j, 1);
      pending.unshift(join(a, b));
    } else {
      out.push(a);
    }
  }
  return out;
}
