// ──────────────────────────────────────────────────────────
// Reference list parsing: one entry per item, text kept exactly
// as printed (only line-break hyphenation is repaired).
// ──────────────────────────────────────────────────────────
import type { PaperReference } from '../../types/paperReader';
import type { DocBlock } from './docBlocks';
import { joinLines } from '../pdf/text';

const BRACKETED = /^\[(\d{1,4})\]\s*/;
const DOTTED = /^(\d{1,4})\.\s+(?=\S)/;
const AUTHOR_START = /^\p{Lu}[\p{L}'’ -]{0,40},\s*\p{Lu}/u;

interface RefLine {
  text: string;
  x0: number;
  blockStart: boolean;
}

export function parseReferences(blocks: DocBlock[]): PaperReference[] {
  const lines: RefLine[] = blocks
    .filter(b => b.kind === 'text')
    .flatMap(b => b.lines.map((l, i) => ({ text: l.text.trim(), x0: l.x0, blockStart: i === 0 })))
    .filter(l => l.text.length > 0);
  if (lines.length === 0) return [];

  const bracketed = lines.filter(l => BRACKETED.test(l.text)).length;
  const dotted = lines.filter(l => DOTTED.test(l.text)).length;
  const style: 'bracketed' | 'dotted' | 'unnumbered' =
    bracketed >= 2 ? 'bracketed' : dotted >= 3 ? 'dotted' : 'unnumbered';

  const groups: RefLine[][] = [];
  lines.forEach((line, i) => {
    const prev = lines[i - 1];
    let starts: boolean;
    if (style === 'bracketed') starts = BRACKETED.test(line.text);
    else if (style === 'dotted') starts = DOTTED.test(line.text);
    else {
      // Author–year lists: an entry starts a paragraph, or starts flush
      // left after a hanging-indented line, and opens with "Surname, X"
      // (an entry continued in the next column does not)
      starts =
        (line.blockStart || (!!prev && line.x0 < prev.x0 - 3 && /[.)]$/.test(prev.text))) &&
        AUTHOR_START.test(line.text);
    }
    if (starts || groups.length === 0) groups.push([line]);
    else groups[groups.length - 1].push(line);
  });

  return groups.map((g, i) => {
    const text = joinLines(g.map(l => l.text));
    const label = style === 'bracketed' ? text.match(BRACKETED) : style === 'dotted' ? text.match(DOTTED) : null;
    const number = label ? Number(label[1]) : i + 1;
    return {
      id: `ref-${number}`,
      number,
      label: label ? (style === 'bracketed' ? `[${number}]` : `${number}.`) : '',
      text: label ? text.slice(label[0].length).trim() : text,
    };
  });
}
