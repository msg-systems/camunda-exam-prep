#!/usr/bin/env node
// Curate a top-N quality subset of the pool, respecting blueprint distribution.
// Reads src/data/questions/pool.json, scores every question, and writes
// src/data/questions/pool-curated.json. Run with --apply to also overwrite
// pool.json (the file consumed by the app).

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const POOL_PATH = join(ROOT, 'src', 'data', 'questions', 'pool.json');
const OUT_PATH = join(ROOT, 'src', 'data', 'questions', 'pool-curated.json');

const args = new Map(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? 'true'] : [a, 'true'];
  }),
);

const BLUEPRINT_PATH = args.has('blueprint')
  ? (args.get('blueprint').startsWith('/') ? args.get('blueprint') : join(ROOT, args.get('blueprint')))
  : join(__dirname, 'blueprint.json');

const TARGET = Number(args.get('size') ?? 150);
const APPLY = args.get('apply') === 'true';
const MIN_SCORE = Number(args.get('min-score') ?? 0);

const pool = JSON.parse(readFileSync(POOL_PATH, 'utf8'));
const blueprint = JSON.parse(readFileSync(BLUEPRINT_PATH, 'utf8'));

const totalWeight = Object.values(blueprint.topics).reduce((a, b) => a + b, 0);

// Pro-rata target counts per topic, then largest-remainder rounding to hit TARGET exactly.
const raw = Object.entries(blueprint.topics).map(([topic, w]) => ({
  topic,
  exact: (w / totalWeight) * TARGET,
}));
const floorSum = raw.reduce((a, r) => a + Math.floor(r.exact), 0);
const remainders = raw
  .map((r, i) => ({ i, frac: r.exact - Math.floor(r.exact) }))
  .sort((a, b) => b.frac - a.frac);
const targetPerTopic = Object.fromEntries(raw.map((r) => [r.topic, Math.floor(r.exact)]));
let extra = TARGET - floorSum;
for (const r of remainders) {
  if (extra <= 0) break;
  targetPerTopic[raw[r.i].topic] += 1;
  extra--;
}

// --- Quality score -----------------------------------------------------------
function len(s) { return typeof s === 'string' ? s.length : 0; }
const DOMAIN_MARKER = /\b(bank|insurance|insurer|logistics|retail|e-?commerce|marketplace|saas|healthcare|hospital|fintech|telco|utility|airline|broker|brokerage|payments?|lender|manufacturer|fulfil?ment|warehouse|dealership|payroll|supplier|customer|merchant|carrier|cooperative|wholesaler|publisher|operator|provider|tenant|subscriber)\b/i;
const MEASURABLE = /(\b\d+[\d,]*\s?(%|seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?|ms|attempts?|retries|tokens?|requests?|calls?|orders?|customers?|users?|tenants?|instances?|tasks?|workers?|jobs?|nodes?|brokers?|partitions?|replicas?|million|billion|thousand)\b|[€$£¥]\s?\d|\b\d+[KMB]\b)/i;
const PROPER_NOUN = /\b[A-Z][a-z]{2,}(?:Pay|Bank|Health|Logistics|Insurance|Tech|Cloud|Soft|Works|Labs|Group|Co|Corp|Inc|Ltd)\b/;

function score(q) {
  let s = 0;
  const reasons = [];

  // Authored content is human-curated → strong base.
  if (q.source === 'authored') { s += 50; reasons.push('authored'); }

  // Scenario quality (max ~25 pts).
  const sc = q.scenario || '';
  const scLen = len(sc);
  if (scLen >= 150) { s += 10; reasons.push('scenario>=150'); }
  else if (scLen >= 100) { s += 6; }
  else if (scLen >= 80) { s += 3; }
  if (DOMAIN_MARKER.test(sc)) { s += 5; reasons.push('domain'); }
  if (MEASURABLE.test(sc)) { s += 7; reasons.push('measurable'); }
  if (PROPER_NOUN.test(sc)) { s += 3; reasons.push('proper-noun'); }

  // Question quality (max ~10).
  const qt = q.question || '';
  if (len(qt) >= 40) s += 5;
  if (/\?$/.test(qt.trim())) s += 3;
  if (/^(what|which|how|when|where|why|who)\b/i.test(qt.trim())) s += 2;

  // Options quality (max ~25).
  const opts = q.options || [];
  const lens = opts.map((o) => len(o?.text));
  if (lens.length === 4) {
    const lmin = Math.min(...lens);
    const lmax = Math.max(...lens);
    const ratio = lmax / Math.max(1, lmin);
    if (ratio <= 1.6) s += 10; else if (ratio <= 2.2) s += 6; else if (ratio <= 3) s += 3;
    const avg = lens.reduce((a, b) => a + b, 0) / 4;
    if (avg >= 80 && avg <= 220) s += 8;
    else if (avg >= 60 && avg <= 280) s += 4;
    if (lmin >= 60) s += 4;
  }
  // Penalize obvious tells (negations, "all of the above"-style fluff).
  for (const o of opts) {
    if (/\b(all of the above|none of the above)\b/i.test(o?.text || '')) s -= 15;
  }

  // Explanations quality (max ~15).
  const exMap = q.optionExplanations || {};
  const exVals = Object.values(exMap).map((e) => len(e?.text));
  if (exVals.length === 4) {
    const exMin = Math.min(...exVals);
    const exMax = Math.max(...exVals);
    if (exMin >= 80 && exMax <= 600) s += 12;
    else if (exMin >= 60 && exMax <= 900) s += 6;
    else if (exMin >= 40) s += 2;
    if (exMax > 1200) s -= 6; // bloated dump
  }

  // Docs (max ~5).
  if (Array.isArray(q.docs) && q.docs.length > 0) s += 3;
  if (Array.isArray(q.docs) && q.docs.length >= 2) s += 2;

  return { score: s, reasons };
}

// Score everything.
const scored = pool.map((q) => {
  const { score: sc, reasons } = score(q);
  return { q, score: sc, reasons };
});

// Group by topic.
const byTopic = new Map();
for (const item of scored) {
  const t = item.q.topic;
  if (!byTopic.has(t)) byTopic.set(t, []);
  byTopic.get(t).push(item);
}

// Pick top-N per topic.
const picked = [];
const shortage = [];
const stats = [];
for (const [topic, want] of Object.entries(targetPerTopic)) {
  const bucket = (byTopic.get(topic) || [])
    .slice()
    .filter((x) => x.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score);
  const take = bucket.slice(0, want).map((x) => x.q);
  picked.push(...take);
  const meanScore = take.length ? (take.reduce((a, x, i) => a + bucket[i].score, 0) / take.length).toFixed(1) : '0';
  const minScore = take.length ? bucket[take.length - 1].score : 0;
  stats.push({ topic, want, got: take.length, available: bucket.length, meanScore, minScore });
  if (take.length < want) shortage.push({ topic, want, got: take.length });
}

// Distribution sanity.
console.log(`Curated ${picked.length}/${TARGET} questions`);
console.log('');
console.log('Topic              want / got / pool   meanScore  minScore');
for (const r of stats) {
  console.log(
    `  ${r.topic.padEnd(28)} ${String(r.want).padStart(3)} / ${String(r.got).padStart(3)} / ${String(r.available).padStart(4)}    ${String(r.meanScore).padStart(6)}   ${String(r.minScore).padStart(5)}`,
  );
}
if (shortage.length) {
  console.log('');
  console.log('SHORTAGE — not enough scored questions to meet target:');
  for (const s of shortage) console.log(`  ${s.topic}: needed ${s.want}, got ${s.got}`);
}

// Source mix.
const srcCount = picked.reduce((acc, q) => {
  acc[q.source || 'unknown'] = (acc[q.source || 'unknown'] || 0) + 1;
  return acc;
}, {});
console.log('');
console.log('Source mix:', srcCount);

writeFileSync(OUT_PATH, JSON.stringify(picked, null, 2));
console.log('');
console.log(`Wrote ${OUT_PATH}`);

if (APPLY) {
  writeFileSync(POOL_PATH, JSON.stringify(picked, null, 2));
  console.log(`APPLIED → ${POOL_PATH} now contains ${picked.length} curated questions`);
} else {
  console.log('Run with --apply to overwrite src/data/questions/pool.json.');
}
