#!/usr/bin/env node
// Build the question pool from authored JSON files.
// - Reads every pipeline/authored/<topic>/*.json file
// - Lints each question; drops any with findings (printed to stderr)
// - Deterministically shuffles a/b/c/d positions per question
// - Writes src/data/questions/pool.json
// - Fails (exit 1) if any topic is short of its blueprint target
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintQuestion } from './lib/content-lints.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const AUTHORED_DIR = join(__dirname, 'authored');
const REGENERATED_DIR = join(__dirname, 'regenerated');
const STAGING_DIR = join(__dirname, 'staging');
const OUT_FILE = join(ROOT, 'src', 'data', 'questions', 'pool.json');

const args = new Map(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? 'true'] : [a, 'true'];
  }),
);
const BLUEPRINT_FILE = args.has('blueprint')
  ? (args.get('blueprint').startsWith('/') ? args.get('blueprint') : join(ROOT, args.get('blueprint')))
  : join(__dirname, 'blueprint.json');

const blueprint = JSON.parse(readFileSync(BLUEPRINT_FILE, 'utf8'));
const minimums = blueprint.minimums || {};

// ---------- deterministic option shuffle ----------
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleOptions(q) {
  const rand = mulberry32(fnv1a(q.id));
  const order = ['a', 'b', 'c', 'd'];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  // order = new positions in original a/b/c/d sequence; remap to new letters.
  const LETTERS = ['a', 'b', 'c', 'd'];
  const remap = {}; // origId -> newId
  order.forEach((origId, newIdx) => { remap[origId] = LETTERS[newIdx]; });

  const newOptions = LETTERS.map((newId) => {
    const origId = Object.keys(remap).find((k) => remap[k] === newId);
    const orig = q.options.find((o) => o.id === origId);
    return { id: newId, text: orig.text };
  });

  const newCorrect = remap[q.correctOptionId];

  const newExpl = {};
  if (q.optionExplanations) {
    for (const origId of LETTERS) {
      if (q.optionExplanations[origId]) {
        newExpl[remap[origId]] = q.optionExplanations[origId];
      }
    }
  }

  // Remap codeBlocks.perOption keys so per-option code stays attached to the
  // right option after shuffling. codeBlocks.stem is independent.
  let newCodeBlocks = q.codeBlocks;
  if (q.codeBlocks && q.codeBlocks.perOption && typeof q.codeBlocks.perOption === 'object') {
    const newPerOption = {};
    for (const origId of LETTERS) {
      const code = q.codeBlocks.perOption[origId];
      if (typeof code === 'string') {
        newPerOption[remap[origId]] = code;
      }
    }
    newCodeBlocks = { ...q.codeBlocks, perOption: newPerOption };
  }

  return {
    ...q,
    options: newOptions,
    correctOptionId: newCorrect,
    optionExplanations: newExpl,
    ...(newCodeBlocks ? { codeBlocks: newCodeBlocks } : {}),
  };
}

// ---------- collect authored files ----------
function listJsonFiles(rootDir) {
  const out = [];
  let topics = [];
  try {
    topics = readdirSync(rootDir).filter((d) => {
      try { return statSync(join(rootDir, d)).isDirectory(); } catch { return false; }
    });
  } catch {
    topics = [];
  }
  for (const topic of topics) {
    const dir = join(rootDir, topic);
    let files = [];
    try { files = readdirSync(dir).filter((f) => f.endsWith('.json')); } catch { continue; }
    for (const f of files) {
      const full = join(dir, f);
      try {
        const data = JSON.parse(readFileSync(full, 'utf8'));
        out.push({ file: full, topic, data });
      } catch (e) {
        console.error(`[parse error] ${full}: ${e.message}`);
      }
    }
  }
  return out;
}

// ---------- main ----------
const authored = listJsonFiles(AUTHORED_DIR);
const regenerated = listJsonFiles(REGENERATED_DIR);
const staged = listJsonFiles(STAGING_DIR);

const accepted = [];
const rejected = [];
const seenIds = new Set();

function intake(items, { lintMode, source }) {
  for (const { file, topic, data } of items) {
    if (data.topic !== topic) {
      rejected.push({ file, source, reason: `file under ${source}/${topic}/ has topic="${data.topic}"` });
      continue;
    }
    if (seenIds.has(data.id)) {
      rejected.push({ file, source, reason: `duplicate id "${data.id}"` });
      continue;
    }
    // Strip transient debug fields that the importer writes.
    const { _lint, ...clean } = data;
    const findings = lintQuestion(clean, { mode: lintMode });
    if (findings.length > 0) {
      rejected.push({ file, source, reason: 'lint findings', findings });
      continue;
    }
    seenIds.add(clean.id);
    accepted.push({ ...shuffleOptions(clean), source });
  }
}

// Hand-authored is strict and counts against blueprint targets.
intake(authored, { lintMode: 'strict', source: 'authored' });
// Regenerated content (from the handoff brief) is strict; counts toward
// blueprint as a peer of authored.
intake(regenerated, { lintMode: 'strict', source: 'regenerated' });
// Imported / staged content is lenient and tagged so the UI can filter it.
intake(staged, { lintMode: 'lenient', source: 'imported' });

// ---------- distribution check ----------
const byTopic = {};
for (const t of Object.keys(blueprint.topics)) byTopic[t] = 0;
const authoredAccepted = accepted.filter((q) => q.source === 'authored');
const regeneratedAccepted = accepted.filter((q) => q.source === 'regenerated');
const importedAccepted = accepted.filter((q) => q.source === 'imported');
// Blueprint compliance counts authored + regenerated (both strict-linted).
for (const q of [...authoredAccepted, ...regeneratedAccepted]) {
  byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;
}

let topicsShort = 0;
console.log(`--- Topic distribution (authored + regenerated, blueprint: ${BLUEPRINT_FILE}) ---`);
for (const [t, target] of Object.entries(blueprint.topics)) {
  const have = byTopic[t] || 0;
  const floor = minimums[t] ?? target;
  let status;
  if (have >= target) status = 'OK';
  else if (have >= floor) status = 'FLOOR';
  else { status = 'SHORT'; topicsShort++; }
  const suffix = have < target && have >= floor ? ` (floor ${floor})` : '';
  console.log(`  ${status.padEnd(5)} ${t.padEnd(28)} ${String(have).padStart(3)} / ${target}${suffix}`);
}
console.log(`Authored accepted:    ${authoredAccepted.length}`);
console.log(`Regenerated accepted: ${regeneratedAccepted.length}`);
console.log(`Imported accepted:    ${importedAccepted.length}`);
console.log(`Total in pool:        ${accepted.length}`);

// ---------- rejected report ----------
const rejectedAuthored = rejected.filter((r) => r.source === 'authored');
const rejectedRegenerated = rejected.filter((r) => r.source === 'regenerated');
const rejectedImported = rejected.filter((r) => r.source === 'imported');
if (rejected.length > 0) {
  console.error(`\n--- Rejected (${rejected.length} total; ${rejectedAuthored.length} authored, ${rejectedRegenerated.length} regenerated, ${rejectedImported.length} imported) ---`);
  for (const r of [...rejectedAuthored, ...rejectedRegenerated]) {
    console.error(`  [${r.source}] ${basename(r.file)}: ${r.reason}`);
    if (r.findings) {
      for (const f of r.findings) {
        console.error(`    - [${f.code}] ${f.message} @ ${f.where}`);
      }
    }
  }
  if (rejectedImported.length > 0) {
    const codeCount = {};
    for (const r of rejectedImported) for (const f of (r.findings || [])) codeCount[f.code] = (codeCount[f.code] || 0) + 1;
    console.error(`  imported rejections by code:`);
    for (const [code, n] of Object.entries(codeCount).sort((a, b) => b[1] - a[1])) {
      console.error(`    ${String(n).padStart(5)}  ${code}`);
    }
  }
}

// ---------- write ----------
try { mkdirSync(dirname(OUT_FILE), { recursive: true }); } catch {}
writeFileSync(OUT_FILE, JSON.stringify(accepted, null, 2) + '\n', 'utf8');
console.log(`\nWrote ${OUT_FILE}`);

// ---------- exit ----------
if (rejectedAuthored.length > 0) {
  console.error(`FAIL: ${rejectedAuthored.length} authored question(s) rejected by strict lint.`);
  process.exit(1);
}
if (rejectedRegenerated.length > 0) {
  console.error(`FAIL: ${rejectedRegenerated.length} regenerated question(s) rejected by strict lint.`);
  process.exit(1);
}
if (topicsShort > 0) {
  console.error(`FAIL: ${topicsShort} topic(s) below blueprint floor (authored + regenerated).`);
  process.exit(1);
}
console.log('OK: pool meets blueprint targets.');
