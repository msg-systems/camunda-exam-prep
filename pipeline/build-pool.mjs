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
const BLUEPRINT_FILE = join(__dirname, 'blueprint.json');
const OUT_FILE = join(ROOT, 'src', 'data', 'questions', 'pool.json');

const blueprint = JSON.parse(readFileSync(BLUEPRINT_FILE, 'utf8'));

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

  return { ...q, options: newOptions, correctOptionId: newCorrect, optionExplanations: newExpl };
}

// ---------- collect authored files ----------
function listAuthored() {
  const out = [];
  let topics = [];
  try {
    topics = readdirSync(AUTHORED_DIR).filter((d) => {
      try { return statSync(join(AUTHORED_DIR, d)).isDirectory(); } catch { return false; }
    });
  } catch {
    topics = [];
  }
  for (const topic of topics) {
    const dir = join(AUTHORED_DIR, topic);
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
const authored = listAuthored();

const accepted = [];
const rejected = [];
const seenIds = new Set();

for (const { file, topic, data } of authored) {
  if (data.topic !== topic) {
    rejected.push({ file, reason: `file under authored/${topic}/ has topic="${data.topic}"` });
    continue;
  }
  if (seenIds.has(data.id)) {
    rejected.push({ file, reason: `duplicate id "${data.id}"` });
    continue;
  }
  const findings = lintQuestion(data);
  if (findings.length > 0) {
    rejected.push({ file, reason: 'lint findings', findings });
    continue;
  }
  seenIds.add(data.id);
  accepted.push(shuffleOptions(data));
}

// ---------- distribution check ----------
const byTopic = {};
for (const t of Object.keys(blueprint.topics)) byTopic[t] = 0;
for (const q of accepted) byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;

let topicsShort = 0;
console.log('--- Topic distribution ---');
for (const [t, target] of Object.entries(blueprint.topics)) {
  const have = byTopic[t] || 0;
  const status = have >= target ? 'OK' : 'SHORT';
  if (have < target) topicsShort++;
  console.log(`  ${status.padEnd(5)} ${t.padEnd(28)} ${String(have).padStart(3)} / ${target}`);
}
console.log(`Total accepted: ${accepted.length} / ${blueprint.targetPoolSize}`);

// ---------- rejected report ----------
if (rejected.length > 0) {
  console.error(`\n--- Rejected (${rejected.length}) ---`);
  for (const r of rejected) {
    console.error(`  ${basename(r.file)}: ${r.reason}`);
    if (r.findings) {
      for (const f of r.findings) {
        console.error(`    - [${f.code}] ${f.message} @ ${f.where}`);
      }
    }
  }
}

// ---------- write ----------
try { mkdirSync(dirname(OUT_FILE), { recursive: true }); } catch {}
writeFileSync(OUT_FILE, JSON.stringify(accepted, null, 2) + '\n', 'utf8');
console.log(`\nWrote ${OUT_FILE}`);

// ---------- exit ----------
if (rejected.length > 0) {
  console.error(`FAIL: ${rejected.length} question(s) rejected by lint.`);
  process.exit(1);
}
if (topicsShort > 0) {
  console.error(`FAIL: ${topicsShort} topic(s) below blueprint target.`);
  process.exit(1);
}
console.log('OK: pool meets blueprint targets.');
