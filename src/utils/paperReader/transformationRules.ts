// ──────────────────────────────────────────────────────────
// Transformation Rules — deterministic, meaning-preserving
// readability transformations for academic text.
//
// CORE PRINCIPLE: Never introduce information not present in
// the original sentence. No "we" insertion. No factual additions.
// Prefer leaving text unchanged over risky transforms.
// ──────────────────────────────────────────────────────────
import type { TransformationRule, SentenceContext } from '../../types/paperReader';
import { NOMINALIZATION_MAP } from './nominalizationMap';

// Build a regex alternation from the nominalization map keys
const nominalizations = Object.keys(NOMINALIZATION_MAP);
const nomPattern = nominalizations.join('|');

/**
 * All transformation rules, ordered by priority (lower = applied first).
 * Only the first matching rule is applied per sentence.
 */
export const TRANSFORMATION_RULES: TransformationRule[] = [

  // ═══════════════════════════════════════════════
  // RULE 1: Complex Phrase Simplification
  // These are safe, meaning-preserving substitutions
  // ═══════════════════════════════════════════════
  {
    id: 'complex-due-to-fact',
    name: 'Due to the fact that → Because',
    type: 'complex_phrase',
    priority: 10,
    pattern: /\bdue to the fact that\b/gi,
    replacement: 'because',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Replaces verbose causal phrase with concise equivalent.',
  },
  {
    id: 'complex-in-order-to',
    name: 'In order to → To',
    type: 'wordiness',
    priority: 10,
    pattern: /\bin order to\b/gi,
    replacement: 'to',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Removes unnecessary filler words.',
  },
  {
    id: 'complex-in-the-event',
    name: 'In the event that → If',
    type: 'complex_phrase',
    priority: 10,
    pattern: /\bin the event that\b/gi,
    replacement: 'if',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies conditional phrase.',
  },
  {
    id: 'complex-at-present-time',
    name: 'At the present time → Now/Currently',
    type: 'wordiness',
    priority: 10,
    pattern: /\bat the present time\b/gi,
    replacement: 'currently',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Replaces verbose temporal phrase.',
  },
  {
    id: 'complex-at-this-point-in-time',
    name: 'At this point in time → Now/Currently',
    type: 'wordiness',
    priority: 10,
    pattern: /\bat this point in time\b/gi,
    replacement: 'currently',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Replaces verbose temporal phrase.',
  },
  {
    id: 'complex-proximity',
    name: 'In close proximity to → Near',
    type: 'complex_phrase',
    priority: 10,
    pattern: /\bin close proximity to\b/gi,
    replacement: 'near',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies spatial phrase.',
  },
  {
    id: 'complex-has-ability',
    name: 'Has the ability to → Can',
    type: 'wordiness',
    priority: 10,
    pattern: /\bhas the ability to\b/gi,
    replacement: 'can',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies capability phrase.',
  },
  {
    id: 'complex-have-ability',
    name: 'Have the ability to → Can',
    type: 'wordiness',
    priority: 10,
    pattern: /\bhave the ability to\b/gi,
    replacement: 'can',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies capability phrase.',
  },
  {
    id: 'complex-daily-basis',
    name: 'On a daily basis → Daily',
    type: 'wordiness',
    priority: 10,
    pattern: /\bon a daily basis\b/gi,
    replacement: 'daily',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies frequency phrase.',
  },
  {
    id: 'complex-absence-of',
    name: 'In the absence of → Without',
    type: 'complex_phrase',
    priority: 10,
    pattern: /\bin the absence of\b/gi,
    replacement: 'without',
    requiredAbsentFlags: ['negation'],
    disabledInSections: ['references'],
    description: 'Simplifies negation phrase. Skipped if sentence already has negation.',
  },
  {
    id: 'complex-exception-of',
    name: 'With the exception of → Except',
    type: 'complex_phrase',
    priority: 10,
    pattern: /\bwith the exception of\b/gi,
    replacement: 'except for',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies exception phrase.',
  },
  {
    id: 'complex-large-number',
    name: 'A large number of → Many',
    type: 'wordiness',
    priority: 10,
    pattern: /\ba large number of\b/gi,
    replacement: 'many',
    requiredAbsentFlags: ['statistic'],
    disabledInSections: ['references', 'results'],
    description: 'Simplifies quantity phrase. Skipped near statistics.',
  },
  {
    id: 'complex-small-number',
    name: 'A small number of → Few',
    type: 'wordiness',
    priority: 10,
    pattern: /\ba small number of\b/gi,
    replacement: 'few',
    requiredAbsentFlags: ['statistic'],
    disabledInSections: ['references', 'results'],
    description: 'Simplifies quantity phrase. Skipped near statistics.',
  },
  {
    id: 'complex-important-note',
    name: 'It is important to note that → (removed)',
    type: 'wordiness',
    priority: 10,
    pattern: /\bit is important to note that\s*/gi,
    replacement: '',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Removes vacuous preamble.',
  },
  {
    id: 'complex-worth-noting',
    name: 'It is worth noting that → (removed)',
    type: 'wordiness',
    priority: 10,
    pattern: /\bit is worth noting that\s*/gi,
    replacement: '',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Removes vacuous preamble.',
  },
  {
    id: 'complex-it-should-be-noted',
    name: 'It should be noted that → (removed)',
    type: 'wordiness',
    priority: 10,
    pattern: /\bit should be noted that\s*/gi,
    replacement: '',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Removes vacuous preamble.',
  },
  {
    id: 'complex-it-can-be-seen',
    name: 'It can be seen that → (removed)',
    type: 'wordiness',
    priority: 10,
    pattern: /\bit can be seen that\s*/gi,
    replacement: '',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Removes vacuous preamble.',
  },
  {
    id: 'complex-for-the-purpose-of',
    name: 'For the purpose of → To/For',
    type: 'wordiness',
    priority: 10,
    pattern: /\bfor the purpose of\b/gi,
    replacement: 'to',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies purpose phrase.',
  },
  {
    id: 'complex-with-regard-to',
    name: 'With regard to → Regarding/About',
    type: 'wordiness',
    priority: 10,
    pattern: /\bwith regard to\b/gi,
    replacement: 'regarding',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies referential phrase.',
  },
  {
    id: 'complex-with-respect-to',
    name: 'With respect to → Regarding',
    type: 'wordiness',
    priority: 15,
    pattern: /\bwith respect to\b/gi,
    replacement: 'regarding',
    requiredAbsentFlags: ['comparison'],
    disabledInSections: ['references'],
    description: 'Simplifies referential phrase. Skipped in comparisons where "with respect to" may have mathematical meaning.',
  },
  {
    id: 'complex-on-the-basis-of',
    name: 'On the basis of → Based on',
    type: 'complex_phrase',
    priority: 10,
    pattern: /\bon the basis of\b/gi,
    replacement: 'based on',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies basis phrase.',
  },
  {
    id: 'complex-as-a-consequence-of',
    name: 'As a consequence of → Because of',
    type: 'complex_phrase',
    priority: 10,
    pattern: /\bas a consequence of\b/gi,
    replacement: 'because of',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies causal phrase.',
  },
  {
    id: 'complex-prior-to',
    name: 'Prior to → Before',
    type: 'wordiness',
    priority: 10,
    pattern: /\bprior to\b/gi,
    replacement: 'before',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies temporal phrase.',
  },
  {
    id: 'complex-subsequent-to',
    name: 'Subsequent to → After',
    type: 'wordiness',
    priority: 10,
    pattern: /\bsubsequent to\b/gi,
    replacement: 'after',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies temporal phrase.',
  },
  {
    id: 'complex-in-the-vicinity-of',
    name: 'In the vicinity of → Near',
    type: 'complex_phrase',
    priority: 10,
    pattern: /\bin the vicinity of\b/gi,
    replacement: 'near',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies spatial phrase.',
  },
  {
    id: 'complex-take-into-consideration',
    name: 'Take into consideration → Consider',
    type: 'wordiness',
    priority: 10,
    pattern: /\btaken? into consideration\b/gi,
    replacement: 'considered',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies deliberation phrase.',
  },

  // ═══════════════════════════════════════════════
  // RULE 2: Connector Simplification
  // ═══════════════════════════════════════════════
  {
    id: 'connector-notwithstanding',
    name: 'Notwithstanding → Despite',
    type: 'connector',
    priority: 20,
    pattern: /\bnotwithstanding\b/gi,
    replacement: 'despite',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies archaic connector.',
  },
  {
    id: 'connector-inasmuch',
    name: 'Inasmuch as → Since',
    type: 'connector',
    priority: 20,
    pattern: /\binasmuch as\b/gi,
    replacement: 'since',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies formal connector.',
  },
  {
    id: 'connector-insofar',
    name: 'Insofar as → As far as',
    type: 'connector',
    priority: 20,
    pattern: /\binsofar as\b/gi,
    replacement: 'as far as',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies formal connector.',
  },
  {
    id: 'connector-contradistinction',
    name: 'In contradistinction to → Unlike',
    type: 'connector',
    priority: 20,
    pattern: /\bin contradistinction to\b/gi,
    replacement: 'unlike',
    requiredAbsentFlags: ['comparison'],
    disabledInSections: ['references'],
    description: 'Simplifies formal comparison connector.',
  },
  {
    id: 'connector-hitherto',
    name: 'Hitherto → Until now',
    type: 'connector',
    priority: 20,
    pattern: /\bhitherto\b/gi,
    replacement: 'until now',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies archaic temporal connector.',
  },
  {
    id: 'connector-heretofore',
    name: 'Heretofore → Previously',
    type: 'connector',
    priority: 20,
    pattern: /\bheretofore\b/gi,
    replacement: 'previously',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies archaic connector.',
  },
  {
    id: 'connector-aforementioned',
    name: 'Aforementioned → Previous/Earlier',
    type: 'connector',
    priority: 20,
    pattern: /\baforementioned\b/gi,
    replacement: 'earlier',
    requiredAbsentFlags: [],
    disabledInSections: ['references'],
    description: 'Simplifies formal reference word.',
  },

  // ═══════════════════════════════════════════════
  // RULE 3: Nominalization (Safe — no subject insertion)
  // Only handles patterns like:
  //   "the X of Y was performed" → "Y was X-ed"
  //   "the X of Y" → "X-ing Y" (in some contexts)
  // Never inserts "we", "they", or any agent.
  // ═══════════════════════════════════════════════
  {
    id: 'nom-the-X-of-was-performed',
    name: 'The [nominalization] of X was performed → X was [verb]-ed',
    type: 'nominalization',
    priority: 30,
    pattern: new RegExp(
      `\\bthe\\s+(${nomPattern})\\s+of\\s+(.+?)\\s+(?:was|were)\\s+(?:performed|carried out|conducted|undertaken|accomplished|achieved|executed)`,
      'i'
    ),
    replacement: (match: RegExpMatchArray, _ctx: SentenceContext): string | null => {
      const noun = match[1].toLowerCase();
      const verb = NOMINALIZATION_MAP[noun];
      if (!verb) return null;
      const object = match[2];
      // "The implementation of the method was performed" → "The method was implemented"
      return `${object} was ${verb}ed`;
    },
    requiredAbsentFlags: ['negation', 'uncertainty'],
    disabledInSections: ['references'],
    description: 'Reverses nominalization without introducing new subjects.',
  },
  {
    id: 'nom-X-of-was-carried-out',
    name: '[Nominalization] of X was carried out → X was [verb]-ed',
    type: 'nominalization',
    priority: 30,
    pattern: new RegExp(
      `\\b(${nomPattern})\\s+of\\s+(.+?)\\s+(?:was|were)\\s+(?:performed|carried out|conducted|undertaken|accomplished|achieved|executed)`,
      'i'
    ),
    replacement: (match: RegExpMatchArray, _ctx: SentenceContext): string | null => {
      const noun = match[1].toLowerCase();
      const verb = NOMINALIZATION_MAP[noun];
      if (!verb) return null;
      const object = match[2];
      return `${object} was ${verb}ed`;
    },
    requiredAbsentFlags: ['negation', 'uncertainty'],
    disabledInSections: ['references'],
    description: 'Reverses nominalization (variant without "the").',
  },
];
