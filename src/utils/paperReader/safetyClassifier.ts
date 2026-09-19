// ──────────────────────────────────────────────────────────
// Safety Classifier — detects protected content in sentences
// NEVER modify: numbers, units, equations, variables, statistics,
// citations, negation, uncertainty, causality, comparisons, conditions
// ──────────────────────────────────────────────────────────
import type { SafetyFlag, SentenceContext, SectionType } from '../../types/paperReader';

/** Regex patterns for each safety flag */
const SAFETY_PATTERNS: Record<SafetyFlag, RegExp[]> = {
  equation: [
    /[=<>≤≥±∓∞∑∏∫√∂∇≈≠∝∈∉⊂⊃∪∩]/,
    /\$.*\$/,
    /\\frac|\\sum|\\int|\\sqrt|\\alpha|\\beta|\\gamma|\\delta/,
  ],
  statistic: [
    /p\s*[<>=≤≥]\s*\d/,
    /[rR]²?\s*=\s*\d/,
    /χ²/,
    /[tTFz]\s*\(\s*\d/,
    /[Nn]\s*=\s*\d/,
    /CI\s*[\[\(]/,
    /\bSD\s*[=:]/,
    /\bSE\s*[=:]/,
    /\bα\s*[=:]/,
    /\bβ\s*[=:]/,
    /\bp\s*-?\s*value/i,
    /\bANOVA\b/,
    /\bR-squared\b/i,
    /\bmean\s*[=:±]/i,
    /\bmedian\s*[=:]/i,
    /\bvariance\s*[=:]/i,
    /\bstandard\s+deviation\b/i,
    /\bconfidence\s+interval\b/i,
    /\bsignificant(?:ly)?\s+(?:at|with)\s+/i,
  ],
  citation: [
    /\[\d+(?:\s*[-–,]\s*\d+)*\]/,
    /\([A-Z][a-z]+(?:\s+et\s+al\.?)?\s*,?\s*(?:19|20)\d{2}[a-z]?\)/,
    /[A-Z][a-z]+\s+et\s+al\.\s*(?:\((?:19|20)\d{2}\))?/,
    /\([A-Z][a-z]+(?:\s+(?:and|&)\s+[A-Z][a-z]+)?\s*,\s*(?:19|20)\d{2}\)/,
  ],
  variable: [
    /\b[A-Z](?:_\w+)?\s*=\s*/,
    /\bΔ[A-Za-z]/,
    /\b[xyz]\s*[=<>]/,
  ],
  unit: [
    /\d+\s*(?:mg|kg|μg|ng|g|mol|mmol|μmol|L|mL|μL|nm|μm|mm|cm|m|km|K|°C|°F|Pa|kPa|MPa|GPa|TPa|Hz|kHz|MHz|GHz|THz|eV|keV|MeV|GeV|J|kJ|MJ|W|kW|MW|V|mV|kV|A|mA|Ω|kΩ|MΩ|dB|rpm|ppm|ppb|wt\.?\s*%|vol\.?\s*%|at\.?\s*%|mol\.?\s*%)\b/,
    /\d+\s*(?:s|min|h|hr|hrs|days?|weeks?|months?|years?)\b/,
  ],
  negation: [
    /\b(?:not|no|never|neither|nor|cannot|can't|won't|doesn't|don't|didn't|hasn't|haven't|isn't|aren't|wasn't|weren't|wouldn't|shouldn't|couldn't|none|nothing|nowhere|nobody)\b/i,
  ],
  causality: [
    /\b(?:because|therefore|thus|hence|consequently|as\s+a\s+result|caused\s+by|leads?\s+to|results?\s+in|due\s+to|owing\s+to|attributed\s+to|responsible\s+for|gives?\s+rise\s+to|contributes?\s+to|accounts?\s+for)\b/i,
  ],
  comparison: [
    /\b(?:greater\s+than|less\s+than|higher\s+than|lower\s+than|compared\s+(?:to|with)|relative\s+to|in\s+contrast\s+to|whereas|superior\s+to|inferior\s+to|more\s+than|fewer\s+than|larger\s+than|smaller\s+than)\b/i,
  ],
  uncertainty: [
    /\b(?:may|might|could|possibly|potentially|probably|likely|unlikely|appears?\s+to|seems?\s+to|suggests?\s+that|it\s+is\s+possible|approximately|roughly|estimated|hypothesized|speculated|presumed|putative|tentative)\b/i,
  ],
  condition: [
    /\b(?:if|unless|provided\s+that|assuming|given\s+that|under\s+the\s+condition|in\s+the\s+case\s+(?:of|that)|whenever|only\s+when|only\s+if)\b/i,
  ],
};

/**
 * Classify a sentence to detect all safety flags and protected character spans.
 */
export function classifySentence(sentence: string, sectionType: SectionType): SentenceContext {
  const flags = new Set<SafetyFlag>();
  const protectedSpans: [number, number][] = [];

  for (const [flag, patterns] of Object.entries(SAFETY_PATTERNS) as [SafetyFlag, RegExp[]][]) {
    for (const pattern of patterns) {
      // Create a global version to find all matches
      const globalPattern = new RegExp(pattern.source, pattern.flags.includes('i') ? 'gi' : 'g');
      let match: RegExpExecArray | null;

      while ((match = globalPattern.exec(sentence)) !== null) {
        flags.add(flag);

        // For content-level flags (equation, statistic, citation, variable, unit),
        // mark the matched span as protected
        if (['equation', 'statistic', 'citation', 'variable', 'unit'].includes(flag)) {
          protectedSpans.push([match.index, match.index + match[0].length]);
        }
      }
    }
  }

  // Merge overlapping protected spans
  const merged = mergeSpans(protectedSpans);

  return { protectedSpans: merged, flags, sectionType };
}

/** Merge overlapping [start, end] intervals */
function mergeSpans(spans: [number, number][]): [number, number][] {
  if (spans.length <= 1) return spans;

  const sorted = [...spans].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (sorted[i][0] <= last[1]) {
      last[1] = Math.max(last[1], sorted[i][1]);
    } else {
      merged.push(sorted[i]);
    }
  }

  return merged;
}

/**
 * Check whether a proposed transformation is safe:
 * - The replacement must not modify any protected span characters
 * - Token divergence must be below 40%
 */
export function isTransformationSafe(
  original: string,
  transformed: string,
  context: SentenceContext
): boolean {
  // 1. Check that protected spans are preserved
  for (const [start, end] of context.protectedSpans) {
    const protectedText = original.substring(start, end);
    if (!transformed.includes(protectedText)) {
      return false;
    }
  }

  // 2. Token divergence check (conservative: max 40%)
  const origTokens = original.toLowerCase().split(/\s+/);
  const transTokens = transformed.toLowerCase().split(/\s+/);

  if (origTokens.length === 0) return true;

  const origSet = new Set(origTokens);
  const transSet = new Set(transTokens);

  // Count tokens in transformed that are NOT in original
  let newTokens = 0;
  for (const t of transSet) {
    if (!origSet.has(t)) newTokens++;
  }

  const divergence = newTokens / origTokens.length;
  if (divergence > 0.4) return false;

  // 3. Ensure no new factual content is introduced
  // The transformed text should only contain words from the original
  // (minus removed filler words) or dictionary simplifications
  // This is enforced by the rule definitions themselves — each rule
  // only replaces specific patterns with specific outputs

  return true;
}
