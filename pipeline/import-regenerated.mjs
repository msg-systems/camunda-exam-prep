#!/usr/bin/env node
// Ingest a regeneration agent's submission into pipeline/regenerated/<topic>/.
//
// The submission is the directory produced against pipeline/handoff/SPEC.md
// (typically pipeline/handoff/submission/). Files are validated against the
// schema-equivalent strict lint, deduplicated against existing ids, and
// written into pipeline/regenerated/<topic>/. The next pipeline/build-pool.mjs
// run will pick them up as a strict, blueprint-bound tier alongside authored.
//
// Usage:
//   node pipeline/import-regenerated.mjs --src=pipeline/handoff/submission/
//   node pipeline/import-regenerated.mjs --src=... --report-only
//   node pipeline/import-regenerated.mjs --src=... --replace
//                    (wipe pipeline/regenerated/ first; full re-ingest)
import {
  readFileSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  statSync,
  existsSync,
} from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintQuestion } from './lib/content-lints.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const REGENERATED_DIR = join(__dirname, 'regenerated');
const AUTHORED_DIR = join(__dirname, 'authored');

const args = process.argv.slice(2);
const SRC = args.find((a) => a.startsWith('--src='))?.split('=')[1];
const REPORT_ONLY = args.includes('--report-only');
const REPLACE = args.includes('--replace');

if (!SRC) {
  console.error('Usage: node pipeline/import-regenerated.mjs --src=<submission-dir> [--report-only] [--replace]');
  process.exit(2);
}
const srcDir = resolve(process.cwd(), SRC);
if (!existsSync(srcDir)) {
  console.error(`Source dir not found: ${srcDir}`);
  process.exit(2);
}

const KNOWN_TOPICS = new Set([
  'modeling',
  'configuring-processes',
  'decisions-business-rules',
  'forms',
  'connectors',
  'extensions-integrations',
  'managing-development',
  'dev-environment',
]);

// Collect existing ids from authored so we don't clash.
const existingIds = new Set();
function collectIds(root) {
  if (!existsSync(root)) return;
  for (const topic of readdirSync(root)) {
    const dir = join(root, topic);
    if (!statSync(dir).isDirectory()) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      try {
        const q = JSON.parse(readFileSync(join(dir, f), 'utf8'));
        if (q.id) existingIds.add(q.id);
      } catch {
        /* ignore */
      }
    }
  }
}
collectIds(AUTHORED_DIR);
// If not replacing, also collect existing regenerated ids so re-ingest is incremental.
if (!REPLACE) collectIds(REGENERATED_DIR);

// Walk submission.
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.json')) out.push(full);
  }
  return out;
}

if (REPLACE && existsSync(REGENERATED_DIR) && !REPORT_ONLY) {
  rmSync(REGENERATED_DIR, { recursive: true, force: true });
  existingIds.clear();
  collectIds(AUTHORED_DIR);
}

const files = walk(srcDir).sort();
const stats = {
  total: 0,
  written: 0,
  rejected: 0,
  duplicates: 0,
  byTopic: {},
  rejectedByCode: {},
};
const rejectedList = [];

for (const f of files) {
  stats.total++;
  let q;
  try {
    q = JSON.parse(readFileSync(f, 'utf8'));
  } catch (e) {
    stats.rejected++;
    rejectedList.push({ file: f, reason: `parse error: ${e.message}` });
    continue;
  }
  if (!q.topic || !KNOWN_TOPICS.has(q.topic)) {
    stats.rejected++;
    rejectedList.push({ file: f, reason: `unknown topic "${q.topic}"` });
    continue;
  }
  if (!q.id || existingIds.has(q.id)) {
    stats.rejected++;
    stats.duplicates++;
    rejectedList.push({ file: f, reason: `duplicate or missing id "${q.id}"` });
    continue;
  }
  const findings = lintQuestion(q, { mode: 'strict' });
  if (findings.length > 0) {
    stats.rejected++;
    for (const fd of findings) {
      stats.rejectedByCode[fd.code] = (stats.rejectedByCode[fd.code] || 0) + 1;
    }
    rejectedList.push({ file: f, id: q.id, reason: 'lint findings', findings });
    continue;
  }
  existingIds.add(q.id);
  stats.byTopic[q.topic] = (stats.byTopic[q.topic] || 0) + 1;
  if (!REPORT_ONLY) {
    const dir = join(REGENERATED_DIR, q.topic);
    mkdirSync(dir, { recursive: true });
    const fname = `q-${q.id}.json`;
    writeFileSync(join(dir, fname), JSON.stringify(q, null, 2) + '\n', 'utf8');
  }
  stats.written++;
}

console.log('--- Regenerated import report ---');
console.log(`Source:         ${srcDir}`);
console.log(`Files scanned:  ${stats.total}`);
console.log(`Accepted:       ${stats.written}`);
console.log(`Rejected:       ${stats.rejected}`);
console.log(`  duplicates:   ${stats.duplicates}`);
console.log('\nAccepted by topic:');
for (const [t, n] of Object.entries(stats.byTopic).sort()) {
  console.log(`  ${t.padEnd(28)} ${String(n).padStart(4)}`);
}
if (Object.keys(stats.rejectedByCode).length) {
  console.log('\nRejected lint codes:');
  for (const [code, n] of Object.entries(stats.rejectedByCode).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(5)}  ${code}`);
  }
}

if (rejectedList.length > 0 && !REPORT_ONLY) {
  const reportPath = join(__dirname, 'regenerated-rejects.json');
  writeFileSync(reportPath, JSON.stringify(rejectedList, null, 2) + '\n', 'utf8');
  console.log(`\nFull reject report: ${reportPath}`);
}

const acceptanceRatio = stats.total > 0 ? stats.written / stats.total : 0;
console.log(`\nAcceptance ratio: ${(acceptanceRatio * 100).toFixed(1)}%`);
if (acceptanceRatio < 0.95 && stats.total > 0) {
  console.log('NOTE: below 95% acceptance target. Return reject report to the regeneration agent.');
}

console.log(REPORT_ONLY ? '\n(dry run; no files written)' : `\nWritten to: ${REGENERATED_DIR}`);
