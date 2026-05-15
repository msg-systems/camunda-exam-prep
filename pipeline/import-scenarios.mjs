#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCES_DIR = path.join(__dirname, 'sources');

// Auto-discover any setNN.md files in pipeline/sources/. Drop new sets in there
// and re-run — no code changes needed.
const INPUTS = fs.readdirSync(SOURCES_DIR)
  .filter((f) => /^set(\d+)\.md$/.test(f))
  .sort()
  .map((f) => ({
    path: path.join(SOURCES_DIR, f),
    set: parseInt(f.match(/^set(\d+)\.md$/)[1], 10),
  }));

const OUT_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'questions', 'scenarios-imported.json');

const TOPIC_MAP = {
  'Modeling': 'modeling',
  'Configuring Processes': 'configuring-processes',
  'Decisions & Business Rules': 'decisions-business-rules',
  'Decisions & Business Rules (DMN)': 'decisions-business-rules',
  'Decisions & DMN': 'decisions-business-rules',
  'DMN': 'decisions-business-rules',
  'Configuring Forms': 'forms',
  'Forms': 'forms',
  'Configuring Connectors': 'connectors',
  'Connectors': 'connectors',
  'Developing Extensions & Integrations': 'extensions-integrations',
  'Extensions & Integrations': 'extensions-integrations',
  'Extensions': 'extensions-integrations',
  'Managing the Development Process': 'managing-development',
  'Managing Development': 'managing-development',
  'Managing Dev': 'managing-development',
  'Setting up a Development Environment': 'dev-environment',
  'Dev Environment Setup': 'dev-environment',
  'Dev Environment': 'dev-environment',
  'Development Environment': 'dev-environment',
};
const PREFIX = {
  modeling: 'mod', 'configuring-processes': 'cfg', 'decisions-business-rules': 'dmn',
  forms: 'frm', connectors: 'con', 'extensions-integrations': 'ext',
  'managing-development': 'mng', 'dev-environment': 'dev',
};
// Strip Bulgarian (Cyrillic) leftovers from author notes.
// Strategy: (1) drop trailing " — <mostly Cyrillic>" segments, (2) drop entire
// sentences/clauses that are predominantly Cyrillic, (3) tidy whitespace.
const CYR = /[\u0400-\u04FF]/;
const isMostlyCyrillic = (s) => {
  const letters = s.replace(/[^\p{L}]/gu, '');
  if (!letters) return false;
  const cyr = (letters.match(/[\u0400-\u04FF]/g) || []).length;
  return cyr / letters.length >= 0.4;
};
const deBg = (raw) => {
  if (!raw || !CYR.test(raw)) return raw;
  let s = raw;
  // Repeatedly trim trailing " — <cyrillic clause>" suffixes.
  for (let i = 0; i < 4; i++) {
    const m = s.match(/^(.*?)\s*[\u2014-]\s*([^\u2014-]+?)\s*\.?\s*$/);
    if (!m) break;
    if (isMostlyCyrillic(m[2])) { s = m[1].trim(); continue; }
    break;
  }
  // Drop any remaining Cyrillic-dominated sentences.
  s = s.split(/(?<=[.!?])\s+/).filter((sent) => !isMostlyCyrillic(sent)).join(' ');
  // Last-resort: strip residual Cyrillic words.
  s = s.replace(/[\u0400-\u04FF]+/g, '').replace(/\s{2,}/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim();
  // Collapse leftover dangling " — " or " — ." at end.
  s = s.replace(/\s*[\u2014-]\s*\.?\s*$/, '').trim();
  return s;
};
const stripBold = (s) => s.replace(/\*\*([^*]+)\*\*/g, '$1');
const squashWs = (s) => s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

function parseQuestion(body, qNum, setNum) {
  const headerMatch = body.match(/^(.+?)\s*\(Weighting:/);
  if (!headerMatch) throw new Error('no topic header');
  const topicName = headerMatch[1].trim();
  const topic = TOPIC_MAP[topicName];
  if (!topic) throw new Error(`unknown topic "${topicName}"`);

  const scenarioStart = body.indexOf('**Scenario:**');
  if (scenarioStart < 0) throw new Error('no scenario marker');
  const optsMatch = body.match(/^- \*\*a\)\*\* /m);
  if (!optsMatch) throw new Error('no options block');
  const optionsStart = optsMatch.index;
  const explMatch = body.match(/^\*\*[^\n]*🔍\s*Explanations/m);
  if (!explMatch) throw new Error('no explanations marker');

  const preOpts = body.slice(scenarioStart, optionsStart).trim()
    .replace(/^\*\*Scenario:\*\*\s*/, '');
  const paragraphs = preOpts.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  let questionText = '';
  let scenarioParas = paragraphs;
  for (let i = paragraphs.length - 1; i >= 0; i--) {
    const p = paragraphs[i];
    if (/^\*\*[\s\S]*\?\*\*$/.test(p)) {
      questionText = p.replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
      scenarioParas = paragraphs.slice(0, i);
      break;
    }
  }
  if (!questionText) {
    questionText = stripBold(paragraphs[paragraphs.length - 1]);
    scenarioParas = paragraphs.slice(0, -1);
  }
  const scenario = squashWs(deBg(stripBold(scenarioParas.join('\n\n'))));
  const question = squashWs(deBg(stripBold(questionText)));

  const optionsBlock = body.slice(optionsStart, explMatch.index);
  const optParts = optionsBlock.split(/^- \*\*([a-d])\)\*\* /m).slice(1);
  if (optParts.length !== 8) throw new Error(`expected 4 options got ${optParts.length / 2}`);
  const options = [];
  for (let i = 0; i < optParts.length; i += 2) {
    let text = optParts[i + 1].trim();
    text = text.replace(/\s*Documentation:\s*\[[^\]]+\]\([^)]+\)\s*$/gm, '').trim();
    text = deBg(stripBold(text)).replace(/\s+/g, ' ').trim();
    options.push({ id: optParts[i], text });
  }

  const perScore = body.match(/^\*\*Per-option scoring/m);
  const correctAnsHdr = body.match(/^\*\*Correct Answer:/m);
  const expEnd = perScore?.index ?? correctAnsHdr?.index ?? body.length;
  const expBlock = body.slice(explMatch.index, expEnd);
  const correctMatch = expBlock.match(/\*\*Option ([a-d])\) — Correct/);
  if (!correctMatch) throw new Error('no correct option marker');
  const correctOptionId = correctMatch[1];

  const expParts = expBlock.split(/^- \*\*Option ([a-d])\) — (.+?)\.\*\*\s*/m).slice(1);
  const explanationLines = [];
  const optionExplanations = {};
  for (let i = 0; i < expParts.length; i += 3) {
    const id = expParts[i];
    const verdict = expParts[i + 1];
    let text = (expParts[i + 2] || '').trim();
    text = stripBold(text);
    text = deBg(text);
    text = text.replace(/\s+/g, ' ').trim();
    explanationLines.push(`(${id}) ${verdict}: ${text}`);
    optionExplanations[id] = { verdict, text };
  }
  const explanation = explanationLines.join('\n\n');

  // Per-option scoring block: "- **a) 10/10** — verdict note"
  if (perScore) {
    const scoreEnd = correctAnsHdr?.index ?? body.length;
    const scoreBlock = body.slice(perScore.index, scoreEnd);
    const scoreRegex = /^- \*\*([a-d])\)\s+(\d+)\/10\*\*\s*[\u2014-]\s*(.+)$/gm;
    let m;
    while ((m = scoreRegex.exec(scoreBlock)) !== null) {
      const id = m[1];
      const score = parseInt(m[2], 10);
      const note = stripBold(deBg(m[3])).replace(/\s+/g, ' ').trim();
      if (!optionExplanations[id]) optionExplanations[id] = { text: note };
      optionExplanations[id].score = score;
      if (note && optionExplanations[id].text && !optionExplanations[id].text.includes(note)) {
        optionExplanations[id].text = optionExplanations[id].text + ' \u2014 ' + note;
      } else if (!optionExplanations[id].text) {
        optionExplanations[id].text = note;
      }
      // Collapse any " — — " runs created when underlying text already ended with em-dash.
      optionExplanations[id].text = optionExplanations[id].text
        .replace(/(\s*\u2014\s*){2,}/g, ' \u2014 ')
        .replace(/\s*\u2014\s*$/, '')
        .trim();
    }
  }

  const docMatch = body.match(/\*\*Official Documentation Link:\*\*\s*(\S+)/);
  const docUrl = docMatch ? docMatch[1].trim().replace(/[.,;]$/, '') : 'https://docs.camunda.io/';

  const id = `imp-s${setNum}-${PREFIX[topic]}-${String(qNum).padStart(2, '0')}`;

  // Deterministic option shuffle to break "A is always correct" bias.
  // Seeded by question id so repeated imports produce the same order.
  const seed = hashStr(id);
  const order = shuffleDeterministic(['a', 'b', 'c', 'd'], seed);
  const newIds = ['a', 'b', 'c', 'd'];
  const shuffledOptions = order.map((origId, i) => {
    const orig = options.find((o) => o.id === origId);
    return { id: newIds[i], text: orig.text };
  });
  const shuffledExpl = {};
  order.forEach((origId, i) => {
    if (optionExplanations[origId]) shuffledExpl[newIds[i]] = optionExplanations[origId];
  });
  const newCorrectId = newIds[order.indexOf(correctOptionId)];

  return {
    id, topic, subtopic: topicName, difficulty: 'hard', style: 'scenario',
    scenario, question,
    options: shuffledOptions,
    correctOptionId: newCorrectId,
    explanation,
    optionExplanations: shuffledExpl,
    docs: [{ title: 'Camunda 8 documentation', url: docUrl }],
  };
}

// Tiny deterministic PRNG (mulberry32) + string hash for seeding.
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleDeterministic(arr, seed) {
  const a = [...arr];
  const rnd = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parseFile(filePath, setNum) {
  const md = fs.readFileSync(filePath, 'utf8');
  const parts = md.split(/^## Question (\d+): /m);
  const out = [];
  const errors = [];
  for (let i = 1; i < parts.length; i += 2) {
    const qNum = parseInt(parts[i], 10);
    try { out.push(parseQuestion(parts[i + 1], qNum, setNum)); }
    catch (e) { errors.push(`  set${setNum} Q${qNum}: ${e.message}`); }
  }
  return { out, errors };
}

let all = [];
const allErrors = [];
for (const f of INPUTS) {
  if (!fs.existsSync(f.path)) { console.error(`MISSING: ${f.path}`); continue; }
  const { out, errors } = parseFile(f.path, f.set);
  console.log(`Set ${f.set} (${path.basename(f.path)}): parsed ${out.length}, skipped ${errors.length}`);
  if (errors.length) console.error(errors.join('\n'));
  allErrors.push(...errors);
  all = all.concat(out);
}

const ids = new Set();
const dups = [];
for (const q of all) { if (ids.has(q.id)) dups.push(q.id); ids.add(q.id); }
if (dups.length) console.warn('Duplicate ids:', dups);

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(all, null, 2));
console.log(`\nWrote ${all.length} questions to ${OUT_PATH}`);

const byTopic = {};
for (const q of all) byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;
console.log('\nDistribution by topic:');
for (const [t, n] of Object.entries(byTopic).sort()) console.log(`  ${t}: ${n}`);
