// ──────────────────────────────────────────────────────────
// Stacked-text removal. IEEE Xplore (and some other stampers)
// re-draw the page content, so the same text appears 2–4 times
// at identical positions. Keep the first copy of each item.
// ──────────────────────────────────────────────────────────
import type { PdfTextItem } from './types';

const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

/**
 * Drop items whose text matches an already-kept item at the same
 * position, or that sit entirely inside a kept item on the same
 * baseline whose text contains theirs (the copies can be split into
 * runs differently).
 */
export function dedupeItems(items: PdfTextItem[]): { items: PdfTextItem[]; dropped: number } {
  // Longer runs first so that partial copies are compared against them.
  const order = items
    .map((it, i) => ({ it, i, text: norm(it.str) }))
    .sort((a, b) => b.text.length - a.text.length || a.i - b.i);

  // Kept items bucketed by rounded baseline
  const byRow = new Map<number, { it: PdfTextItem; text: string }[]>();
  const keep = new Set<number>();

  for (const { it, i, text } of order) {
    const tol = Math.max(0.5, 0.15 * it.size);
    const row = Math.round(it.baseline);
    let duplicate = false;

    for (let r = row - 1; r <= row + 1 && !duplicate; r++) {
      for (const k of byRow.get(r) ?? []) {
        if (Math.abs(k.it.baseline - it.baseline) > tol) continue;
        const sameStart = Math.abs(k.it.x0 - it.x0) <= tol;
        if (sameStart && k.text === text) {
          duplicate = true;
          break;
        }
        const inside = it.x0 >= k.it.x0 - tol && it.x1 <= k.it.x1 + tol;
        if (inside && text.length > 0 && k.text.includes(text)) {
          duplicate = true;
          break;
        }
      }
    }

    if (!duplicate) {
      keep.add(i);
      const bucket = byRow.get(row) ?? [];
      bucket.push({ it, text });
      byRow.set(row, bucket);
    }
  }

  const kept = items.filter((_, i) => keep.has(i));
  return { items: kept, dropped: items.length - kept.length };
}
