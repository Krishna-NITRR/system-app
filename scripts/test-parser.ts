// ──────────────────────────────────────────────────────────
// Dev-only Paper Reader test harness.
//
//   npm run test:parser                 # every PDF in test-fixtures/
//   npm run test:parser -- paper.pdf    # specific files
//   npm run test:parser -- --out dir    # also write <name>.txt reports to dir
//   npm run test:parser -- --raw        # also write <name>.raw.txt (full extracted text)
//   npm run test:parser -- --terms      # also list glossary terms highlighted per section
//
// Runs the same extraction + parse code the browser uses and
// prints the title, the section list and the first 500
// characters of each section.
// ──────────────────────────────────────────────────────────
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { extractPdfLayout, layoutToText } from '../src/utils/pdf';
import { parsePaper } from '../src/utils/paperReader/parsePaper';
import { fromPdfLayout } from '../src/utils/paperReader/docBlocks';
import { annotateSection, buildTrie } from '../src/utils/paperReader/terminologyMatcher';
import { getAllTerms, loadTerminology } from '../src/data/terminology';

const FIXTURES_DIR = resolve(import.meta.dirname, '../test-fixtures');
const require = createRequire(import.meta.url);
const pdfjsRoot = resolve(require.resolve('pdfjs-dist/package.json'), '..');
pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
  join(pdfjsRoot, 'legacy/build/pdf.worker.mjs')
).href;

function parseArgs(argv: string[]) {
  const files: string[] = [];
  let outDir: string | null = null;
  let raw = false;
  let terms = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') outDir = argv[++i];
    else if (argv[i] === '--raw') raw = true;
    else if (argv[i] === '--terms') terms = true;
    else files.push(argv[i]);
  }
  return { files, outDir, raw, terms };
}

async function runOne(path: string, withTerms: boolean): Promise<{ report: string; rawText: string }> {
  const data = new Uint8Array(readFileSync(path));
  const task = pdfjs.getDocument({
    data,
    verbosity: 0,
    standardFontDataUrl: join(pdfjsRoot, 'standard_fonts') + '/',
  });
  const pdf = await task.promise;

  const layout = await extractPdfLayout(pdf);
  const rawText = layoutToText(layout);
  const { metadata, sections } = parsePaper(fromPdfLayout(layout));

  const out: string[] = [];
  out.push(`=== ${basename(path)} (${pdf.numPages} pages) ===`);
  out.push(`TITLE: ${metadata.title}`);
  out.push(`YEAR: ${metadata.year ?? "(none)"}  DOI: ${metadata.doi ?? "(none)"}`);
  out.push(`AUTHORS: ${metadata.authors.join('; ') || '(none)'}`);
  out.push(`KEYWORDS: ${metadata.keywords.join('; ') || '(none)'}`);
  out.push(`NOTES: ${metadata.notes.length} (footnotes / first-page notes kept out of sections)`);
  out.push(`CLEANUP: ${Object.entries(layout.stats).map(([k, v]) => `${k}=${v}`).join(' ')}`);
  // Every piece of text must belong to exactly one section
  const seen = new Map<string, string>();
  const dupes = new Set<string>();
  for (const sec of sections)
    for (const p of sec.paragraphs)
      for (const x of p.sentences) {
        if (x.original.length < 40) continue;
        const prev = seen.get(x.original);
        if (prev !== undefined && prev !== sec.id) dupes.add(x.original);
        seen.set(x.original, sec.id);
      }
  out.push(`DUPLICATED ACROSS SECTIONS: ${dupes.size}`);
  const allSentences = sections.flatMap(sec => sec.paragraphs.filter(p => p.kind === 'text').flatMap(p => p.sentences.map(x => x.original)));
  const short = allSentences.filter(x => x.split(/\s+/).length < 4);
  out.push(`SENTENCES: ${allSentences.length} (under 4 words: ${short.length}${short.length ? ` e.g. ${short.slice(0, 4).map(x => JSON.stringify(x)).join(', ')}` : ''})`);
  if (withTerms) {
    await loadTerminology();
    const index = buildTrie(getAllTerms());
    out.push('');
    out.push('GLOSSARY TERMS (first occurrence per section):');
    for (const sec of sections) {
      annotateSection(sec, index);
      const found = sec.paragraphs.flatMap(p => p.sentences.flatMap(x => x.annotations.map(a => a.surfaceForm)));
      if (found.length) out.push(`  ${sec.title}: ${found.join(', ')}`);
    }
  }
  out.push('');
  out.push(`SECTIONS (${sections.length}):`);
  for (const s of sections) {
    out.push(`${'  '.repeat(Math.max(0, s.level - 1))}- ${s.title}`);
  }
  for (const s of sections) {
    if (s.references) {
      out.push('');
      out.push(`--- ${s.title} (${s.references.length} entries) ---`);
      for (const r of s.references.slice(0, 3)) out.push(`${r.label || '•'} ${r.text}`);
      if (s.references.length > 3) out.push(`… last: ${s.references.at(-1)!.label || '•'} ${s.references.at(-1)!.text}`);
      continue;
    }
    const text = s.paragraphs
      .map(p => p.sentences.map(x => x.original).join(' '))
      .join('\n¶ ');
    out.push('');
    out.push(`--- ${s.title} ---`);
    out.push(text.slice(0, 500) + (text.length > 500 ? ' …' : ''));
  }
  await task.destroy();
  return { report: out.join('\n'), rawText };
}

async function main() {
  const { files, outDir, raw, terms } = parseArgs(process.argv.slice(2));
  let targets = files;
  if (targets.length === 0) {
    if (!existsSync(FIXTURES_DIR)) {
      console.error(`No files given and ${FIXTURES_DIR} does not exist.`);
      process.exit(1);
    }
    targets = readdirSync(FIXTURES_DIR)
      .filter(f => f.toLowerCase().endsWith('.pdf'))
      .map(f => join(FIXTURES_DIR, f));
  }
  if (targets.length === 0) {
    console.error('No PDFs found. Put papers in test-fixtures/.');
    process.exit(1);
  }
  if (outDir) mkdirSync(outDir, { recursive: true });

  for (const t of targets) {
    try {
      const { report, rawText } = await runOne(t, terms);
      console.log(report + '\n');
      const dir = outDir ?? '.';
      if (outDir) writeFileSync(join(dir, basename(t, '.pdf') + '.txt'), report);
      if (raw) writeFileSync(join(dir, basename(t, '.pdf') + '.raw.txt'), rawText);
    } catch (err) {
      console.error(`!! ${basename(t)}: ${(err as Error).message}`);
    }
  }
}

main();
