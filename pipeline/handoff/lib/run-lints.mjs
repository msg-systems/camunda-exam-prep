#!/usr/bin/env node
// Self-test runner for the regeneration handoff.
//
// Usage:
//   node lib/run-lints.mjs submission/
//
// Walks every *.json file under the given directory, runs lintQuestion in
// strict mode, and prints a per-file findings report. Exits 0 only if there
// are zero findings across all files AND the blueprint distribution matches
// BUDGET.md exactly (with the documented dev-environment carve-out).
//
// This is the same lint engine the platform's build pipeline uses. If this
// runner reports clean, the submission will be accepted.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintQuestion } from './content-lints.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HANDOFF = resolve(__dirname, '..');

const target = process.argv[2];
if (!target) {
  console.error('Usage: node lib/run-lints.mjs <submission-dir>');
  process.exit(2);
}
const ROOT = resolve(process.cwd(), target);

const blueprint = JSON.parse(readFileSync(join(HANDOFF, 'blueprint.json'), 'utf8'));
const budget = JSON.parse(readFileSync(join(HANDOFF, 'budget.json'), 'utf8'));

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

const files = walk(ROOT).sort();
const stats = {
  total: 0,
  clean: 0,
  withFindings: 0,
  findingsByCode: {},
  byTopic: {},
  duplicateIds: new Set(),
};
const seenIds = new Set();
let allFindings = 0;

for (const f of files) {
  let q;
  try {
    q = JSON.parse(readFileSync(f, 'utf8'));
  } catch (e) {
    console.error(`PARSE-ERROR ${f}: ${e.message}`);
    allFindings++;
    continue;
  }
  stats.total++;
  if (q.id) {
    if (seenIds.has(q.id)) stats.duplicateIds.add(q.id);
    seenIds.add(q.id);
  }
  const topic = q.topic || '<missing>';
  stats.byTopic[topic] = (stats.byTopic[topic] || 0) + 1;
  const findings = lintQuestion(q);
  if (findings.length === 0) {
    stats.clean++;
  } else {
    stats.withFindings++;
    console.log(`FINDINGS ${q.id || f}`);
    for (const x of findings) {
      console.log(`  [${x.code}] ${x.where}: ${x.message}`);
      stats.findingsByCode[x.code] = (stats.findingsByCode[x.code] || 0) + 1;
      allFindings++;
    }
  }
}

console.log('\n--- Lint summary ---');
console.log(`Files scanned:     ${stats.total}`);
console.log(`Clean:             ${stats.clean}`);
console.log(`With findings:     ${stats.withFindings}`);
console.log(`Duplicate ids:     ${stats.duplicateIds.size}`);
if (stats.duplicateIds.size) {
  console.log(`  ${[...stats.duplicateIds].join(', ')}`);
}
if (Object.keys(stats.findingsByCode).length) {
  console.log('\nFindings by code:');
  for (const [code, n] of Object.entries(stats.findingsByCode).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(5)}  ${code}`);
  }
}

console.log('\n--- Blueprint distribution ---');
const target500 = budget.distribution;
let blueprintOK = true;
for (const slug of Object.keys(target500).sort()) {
  const got = stats.byTopic[slug] || 0;
  const want = target500[slug];
  const ok = got === want || (slug === 'dev-environment' && got >= budget.minimums[slug]);
  if (!ok) blueprintOK = false;
  console.log(
    `  ${ok ? 'OK   ' : 'MISS '} ${slug.padEnd(28)} got ${String(got).padStart(4)} / want ${String(want).padStart(4)}`,
  );
}

const extraTopics = Object.keys(stats.byTopic).filter((t) => !(t in target500));
if (extraTopics.length) {
  console.log(`\nUNKNOWN TOPICS (reject): ${extraTopics.join(', ')}`);
  blueprintOK = false;
}

const ok = allFindings === 0 && stats.duplicateIds.size === 0 && blueprintOK;
console.log(`\nResult: ${ok ? 'PASS' : 'FAIL'}`);
process.exit(ok ? 0 : 1);
