// ──────────────────────────────────────────────────────────
// Terminology Index — loads datasets from bundled JSON and
// optionally from Supabase for centrally-updated definitions.
// Paper content never leaves the client.
// ──────────────────────────────────────────────────────────
import type { TermEntry, TermDataset } from '../../types/paperReader';
import { supabase } from '../../supabaseClient';

// Bundled datasets (static imports for offline fallback)
import generalAcademic from './general-academic.json';
import materialsScience from './materials-science.json';

/** All locally-bundled datasets */
const BUNDLED_DATASETS: TermDataset[] = [
  generalAcademic as TermDataset,
  materialsScience as TermDataset,
];

/** In-memory term lookup */
let _allTerms: Map<string, TermEntry> = new Map();
let _loaded = false;

/**
 * Load all terminology datasets.
 * Tries Supabase first for the latest definitions, then falls back to bundled JSON.
 */
export async function loadTerminology(): Promise<Map<string, TermEntry>> {
  if (_loaded) return _allTerms;

  const terms = new Map<string, TermEntry>();

  // 1. Load bundled datasets as baseline
  for (const dataset of BUNDLED_DATASETS) {
    for (const term of dataset.terms) {
      terms.set(term.id, term);
    }
  }

  // 2. Try to load from Supabase (overrides bundled definitions)
  try {
    const { data, error } = await supabase
      .from('terminology')
      .select('*')
      .limit(2000);

    if (!error && data && data.length > 0) {
      for (const row of data) {
        const entry: TermEntry = {
          id: row.id,
          term: row.term,
          aliases: row.aliases ?? [],
          abbreviation: row.abbreviation ?? null,
          domain: row.domain,
          subdomain: row.subdomain ?? null,
          simple_definition: row.simple_definition,
          technical_definition: row.technical_definition ?? '',
          related_terms: row.related_terms ?? [],
          context_example: row.context_example ?? '',
          confidence: row.confidence ?? 'medium',
          source: row.source ?? 'Supabase',
        };
        terms.set(entry.id, entry);
      }
    }
  } catch {
    // Supabase unavailable — silently fall back to bundled data
    console.info('[Terminology] Supabase unavailable, using bundled datasets.');
  }

  _allTerms = terms;
  _loaded = true;
  return terms;
}

/**
 * Get all loaded terms as an array.
 * Must call loadTerminology() first.
 */
export function getAllTerms(): TermEntry[] {
  return Array.from(_allTerms.values());
}

/**
 * Get a single term by ID.
 */
export function getTermById(id: string): TermEntry | undefined {
  return _allTerms.get(id);
}

/**
 * Reset the loaded state (for testing or hot-reload).
 */
export function resetTerminology(): void {
  _allTerms = new Map();
  _loaded = false;
}
