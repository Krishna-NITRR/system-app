// ──────────────────────────────────────────────────────────
// Transformation Engine — applies rules to individual sentences
// with safety verification.
//
// Core principle: Scientific fidelity first, readability second.
// If a safe transformation cannot be established, the original
// sentence is preserved unchanged.
// ──────────────────────────────────────────────────────────
import type { TransformationResult, SentenceContext, TransformationRule } from '../../types/paperReader';
import { TRANSFORMATION_RULES } from './transformationRules';
import { isTransformationSafe } from './safetyClassifier';

/**
 * Apply the first matching safe transformation rule to a sentence.
 * Returns the transformed sentence or the original if no rule can be
 * safely applied.
 */
export function transformSentence(
  sentence: string,
  context: SentenceContext
): TransformationResult {
  // Skip very short sentences
  if (sentence.trim().length < 15) {
    return {
      text: sentence,
      wasTransformed: false,
      ruleApplied: null,
      skippedReason: 'Sentence too short for transformation.',
    };
  }

  // References section is never transformed
  if (context.sectionType === 'references') {
    return {
      text: sentence,
      wasTransformed: false,
      ruleApplied: null,
      skippedReason: 'References section — preserved unchanged.',
    };
  }

  // Sort rules by priority
  const sortedRules = [...TRANSFORMATION_RULES].sort((a, b) => a.priority - b.priority);

  for (const rule of sortedRules) {
    // Check if rule is disabled in this section
    if (rule.disabledInSections.includes(context.sectionType)) {
      continue;
    }

    // Check if required absent flags are actually absent
    const hasBlockingFlag = rule.requiredAbsentFlags.some(flag => context.flags.has(flag));
    if (hasBlockingFlag) {
      continue;
    }

    // Check if pattern matches
    // Reset regex lastIndex for global patterns
    rule.pattern.lastIndex = 0;
    const match = rule.pattern.exec(sentence);
    if (!match) continue;

    // Apply replacement
    let transformed: string;
    if (typeof rule.replacement === 'function') {
      const result = rule.replacement(match, context);
      if (result === null) continue; // rule function declined
      // Replace only the matched portion
      transformed = sentence.substring(0, match.index) + result + sentence.substring(match.index + match[0].length);
    } else {
      // Simple string replacement — reset lastIndex for global
      rule.pattern.lastIndex = 0;
      transformed = sentence.replace(rule.pattern, rule.replacement);
    }

    // Capitalize first letter if the replacement is at the start of the sentence
    if (match.index === 0 && transformed.length > 0) {
      transformed = transformed.charAt(0).toUpperCase() + transformed.slice(1);
    }

    // Post-transformation safety check
    if (!isTransformationSafe(sentence, transformed, context)) {
      continue; // skip this rule, try the next one
    }

    // Double-check: the transformed text should not be identical to the original
    if (transformed.trim() === sentence.trim()) {
      continue;
    }

    return {
      text: transformed,
      wasTransformed: true,
      ruleApplied: rule,
      skippedReason: null,
    };
  }

  // No rule could be safely applied
  return {
    text: sentence,
    wasTransformed: false,
    ruleApplied: null,
    skippedReason: null,
  };
}

/**
 * Get a human-readable description of what transformation was applied.
 */
export function getTransformationDescription(rule: TransformationRule): string {
  return `${rule.name} — ${rule.description}`;
}
