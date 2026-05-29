#!/usr/bin/env node
// Import v3 exam JSONs (from full_exam_1020_q_v3_/*.fixed.json) into the
// platform's authored-question schema, writing to pipeline/staging/<topic>/.
//
// IMPORTANT: This does NOT modify pipeline/authored/. It writes a separate
// staging tree that the existing build script ignores. After review you can
// move individual files into pipeline/authored/<topic>/ to promote them.
//
// Usage:
//   node pipeline/import-v3.mjs                # default source dir
//   node pipeline/import-v3.mjs --src=<dir>    # custom source dir
//   node pipeline/import-v3.mjs --report-only  # do not write files, only print report
//
import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { lintQuestion } from './lib/content-lints.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);
const DEFAULT_SRC = join(homedir(), 'Downloads', 'full_exam_1020_q_v3_');
const STAGING_DIR = join(__dirname, 'staging');

const args = process.argv.slice(2);
const SRC = (args.find((a) => a.startsWith('--src='))?.split('=')[1]) || DEFAULT_SRC;
const REPORT_ONLY = args.includes('--report-only');

// --- v3.topic (long-form) -> platform slug ---------------------------------
const TOPIC_SLUG = {
  'Modeling': 'modeling',
  'Configuring Processes': 'configuring-processes',
  'Decisions & Business Rules': 'decisions-business-rules',
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
  'Managing Dev': 'managing-development',
  'Setting up a Development Environment': 'dev-environment',
  'Development Environment': 'dev-environment',
  'Dev Environment Setup': 'dev-environment',
};

// --- Text cleanup pipeline -------------------------------------------------
// Replace unicode em-dash (blocked by lint) with double hyphen.
// Strip markdown bold/italic markers (blocked by lint).
// Strip backtick-wrapped code spans (blocked by lint).
// Drop trailing "Documentation: [..](..)" sentence (internal-ref-style trailer).
// Collapse runs of whitespace.
function cleanText(s) {
  if (typeof s !== 'string') return '';
  let t = s;
  t = t.replace(/\r\n/g, '\n');
  // Drop everything from a trailing "Documentation:" marker to end-of-string.
  // (v3 sources often chain multiple markdown links after this label.)
  t = t.replace(/\s*Documentation:\s*[\s\S]*$/i, '');
  // Also drop stray "Docs:" / "See:" + markdown-link trailers.
  t = t.replace(/\s*(?:Docs|See):\s*\[[^\]]+\]\([^)]+\)(?:\s*[+,&]\s*\[[^\]]+\]\([^)]+\))*\s*$/i, '');
  // Strip any leftover inline "[label](url)" markdown links that survived.
  t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Strip markdown bold (**word**) and italic (*word*) markers but keep inner text
  t = t.replace(/\*\*([^*]+)\*\*/g, '$1');
  t = t.replace(/(?<![*])\*([^*\n]+)\*(?![*])/g, '$1');
  // Strip backtick code spans (keep inner text)
  t = t.replace(/`([^`]+)`/g, '$1');
  // Replace em-dash and en-dash with double hyphen (em-dash is lint-blocked)
  t = t.replace(/\u2014/g, '--');
  t = t.replace(/\u2013/g, '-');
  // Strip stray "🔍" if any survived
  t = t.replace(/🔍/g, '');
  // Collapse whitespace
  t = t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return t;
}

// --- Option-text rewriter -------------------------------------------------
// v3 options are polluted by a recurring author tic: each option ends with a
// graded mini-lecture (verdict, doc-style affirmation, prescriptive advice).
// A real exam option is a self-contained statement. We strip these trailing
// "verdict" sentences and any leading "Claiming that X is wrong..." rejection
// opener, leaving the substantive content.
//
// Patterns intentionally mirror those in lib/content-lints.mjs so the same
// shape that we lint-reject when present also gets stripped here.
const VERDICT_PATTERNS = [
  /\b(this|that)\s+(is|represents|would be|sounds)\s+(wrong|incorrect|right|correct|mistaken|misleading|close|partial(ly)?|the\s+wrong|unnecessarily|overkill|a\s+(mistake|misconception|misnomer|trap|red\s*herring|partial|common|reasonable|valid|good|bad|misread|partial\s+approach))\b/i,
  /\b(is|are|sounds|seems|looks)\s+(mistaken|misleading|a\s+misconception|a\s+misnomer|a\s+myth|a\s+misread|workable\s+but|reasonable\s+but|plausible\s+but|close\s+but|tempting\s+but|partially\s+(correct|true|right))\b/i,
  /\b(the\s+)?(claim|idea|notion|assertion|statement|assumption|premise|impression)\s+that\b[^.!?]{0,150}\b(is\s+(wrong|incorrect|mistaken|false|misleading|a\s+misconception)|does\s+not\s+reflect|misrepresents)\b/i,
  /\b(claiming|stating|saying|asserting|believing|suggesting)\s+that\b[^.!?]{0,200}\b(does\s+not\s+reflect|misrepresents|is\s+(wrong|incorrect|mistaken|false|misleading|inaccurate|a\s+misconception))\b/i,
  /\b(recognis|recogniz)(e|ing|es|ed)\s+(this|the)\s+(limitation|distinction|nuance|caveat|trade[- ]?off|gotcha|pitfall)\b/i,
  /\bhelps\s+avoid\s+(common\s+)?(pitfall|mistake|misconception)s?\b/i,
  /\b(this|that)\s+(correctly|incorrectly|properly|improperly|accurately|inaccurately)\s+(models?|describes?|represents?|implements?|configures?|captures?|reflects?|handles?|solves?)\b/i,
  /\b(this|that)\s+(describes?|represents?)\s+an?\s+(invented|fabricated|nonexistent|imaginary|incorrect|wrong|mistaken|misleading)\b/i,
  /\b(this|that|the\s+(former|latter))\s+(reasoning|approach|option|answer|choice|solution|pattern|configuration|setup|model|design|argument)\s+(conflates|misses|over-?engineers|under-?engineers|over-?states|under-?states|fails|breaks|ignores|misreads|misapplies|misuses|forgets|assumes|works|does\s+not\s+work|wrongly|correctly|incorrectly)\b/i,
  /\b(neither|either|both)\s+(choice|option|approach|answer|pattern|configuration)s?\s+(leverages?|uses?|works?|is|are|matches|achieves|handles|supports|fails|misses|ignores|conflates)\b/i,
  /\b(is|are|would be|becomes)\s+(unnecessary|unnecessarily|overkill|excessive|wasteful|inappropriate|inadequate|insufficient|sub-?optimal|counter-?productive|misguided|ill-?suited|poorly\s+suited)\b/i,
  /\b(adds?\s+no\s+value|without\s+adding\s+value|clutters?\s+the\s+(model|design|process|diagram)|no\s+real\s+benefit|defeats?\s+the\s+purpose)\b/i,
  /\b(is|are)\s+(appropriate|recommended|suitable|preferred|canonical|the\s+(canonical|standard|recommended|preferred|ideal|best|right|wrong))\s+(for|to|path|approach|way|choice|tool|option|method)\b/i,
  /\b(teams|developers|engineers|administrators|users|operators|architects|you)\s+should\s+(verify|use|consider|ensure|prefer|avoid|always|never|adopt|choose|pick|select|opt|favor|favour)\b/i,
  /\bis\s+(fully\s+achievable|always\s+available|not\s+required|not\s+needed|not\s+supported|impossible|the\s+idiomatic|a\s+core\s+[A-Z]|more\s+(direct|idiomatic)\s+than)\b/i,
  /\b(should\s+be\s+preferred|is\s+the\s+idiomatic\s+approach|is\s+a\s+core\s+[A-Za-z]+\s+feature)\b/i,
  /^(However|That said|In reality|In practice|In fact|Actually|Unfortunately)\s*,/i,
  /^(Camunda\s+\d+(\.\d+)?|The\s+(SDK|engine|broker|gateway|connector\s+SDK|platform))\s+(supports?|allows?|enables?|provides?|does\s+not|cannot|will|will\s+not|requires?)\b/i,
];

const LEADING_REJECTION = /^(Claiming|Stating|Saying|Asserting|Believing|Suggesting)\s+that\b[^.!?]{0,200}\b(does\s+not\s+reflect|misrepresents|is\s+(wrong|incorrect|mistaken|false|misleading|inaccurate|a\s+misconception))\b[^.!?]*[.!?]\s*/i;

function splitSentences(text) {
  // Split on sentence boundaries while keeping the trailing punctuation.
  const parts = text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
  return parts ? parts.map((s) => s.trim()).filter(Boolean) : [];
}

function isVerdictSentence(sentence) {
  return VERDICT_PATTERNS.some((re) => re.test(sentence));
}

function stripVerdictTails(text) {
  if (!text) return { text: '', stripped: [] };
  let working = text;
  const stripped = [];
  // 1. Drop a leading "Claiming that X is wrong/does not reflect ..." opener.
  const leadMatch = working.match(LEADING_REJECTION);
  if (leadMatch) {
    stripped.push(leadMatch[0].trim());
    working = working.slice(leadMatch[0].length).trim();
  }
  // 2. Drop ANY sentence (not only trailing) that matches a verdict pattern.
  //    v3 options frequently bury graded commentary in the middle, so a tail-
  //    only strip leaves the leak intact. We keep the substantive sentences
  //    (factual descriptions of the configuration / pattern) and remove the
  //    meta-commentary regardless of position.
  const kept = [];
  for (const s of splitSentences(working)) {
    if (isVerdictSentence(s)) {
      stripped.push(s);
    } else {
      kept.push(s);
    }
  }
  working = kept.join(' ').replace(/\s+/g, ' ').trim();
  return { text: working, stripped };
}

// Pick the most relevant docs URL: prefer the question's official_doc_link,
// fall back to the correct option's doc_link.
function pickDocs(q) {
  const docs = [];
  const url = q.official_doc_link || q.options.find((o) => o.is_correct)?.doc_link;
  if (url && /^https:\/\/docs\.camunda\.io\/docs\//.test(url)) {
    docs.push({ title: 'Camunda 8 docs', url });
  }
  return docs;
}

function convertQuestion(q) {
  const slug = TOPIC_SLUG[q.topic];
  if (!slug) return { ok: false, reason: `unknown topic "${q.topic}"`, q };

  const rewriteLog = [];
  const options = q.options.map((o) => {
    const cleaned = cleanText(o.text);
    const { text: rewritten, stripped } = stripVerdictTails(cleaned);
    if (stripped.length > 0) {
      rewriteLog.push({ optionId: o.id, before: cleaned, after: rewritten, stripped });
    }
    return { id: o.id, text: rewritten };
  });
  const explanations = {};
  for (const o of q.options) {
    const verdict = o.is_correct ? 'Correct.' : 'Incorrect.';
    const body = cleanText(o.explanation_en || o.scoring_note || '');
    explanations[o.id] = { text: `${verdict} ${body}`.trim() };
  }

  const out = {
    id: `imp-${q.id}`,
    topic: slug,
    subtopic: 'imported',
    difficulty: 'medium',
    style: 'scenario',
    camundaVersion: '8.8',
    scenario: cleanText(q.scenario || ''),
    question: cleanText(q.question || ''),
    options,
    correctOptionId: q.correct_answer_id,
    optionExplanations: explanations,
    explanation: cleanText(
      q.options.find((o) => o.is_correct)?.explanation_en || ''
    ),
    docs: pickDocs(q),
    sourceSet: q.set_number,
    sourceId: q.id,
  };
  return { ok: true, slug, q: out, rewriteLog };
}

// --- Load v3 inputs --------------------------------------------------------
function loadSources() {
  if (!existsSync(SRC)) throw new Error(`Source dir not found: ${SRC}`);
  const files = readdirSync(SRC)
    .filter((f) => f.startsWith('full_exam_') && f.endsWith('.fixed.json'))
    .sort();
  if (files.length === 0) {
    throw new Error(`No *.fixed.json files in ${SRC}. Run fix_exam_files.py first.`);
  }
  const out = [];
  const seen = new Set();
  for (const f of files) {
    const d = JSON.parse(readFileSync(join(SRC, f), 'utf8'));
    for (const q of d.questions || []) {
      if (seen.has(q.id)) continue;
      seen.add(q.id);
      out.push(q);
    }
  }
  return out;
}

// --- Main ------------------------------------------------------------------
console.log(`Source: ${SRC}`);
const v3 = loadSources();
console.log(`Loaded ${v3.length} unique v3 questions`);

// Wipe staging (fresh import)
if (!REPORT_ONLY) {
  if (existsSync(STAGING_DIR)) rmSync(STAGING_DIR, { recursive: true, force: true });
  mkdirSync(STAGING_DIR, { recursive: true });
}

const stats = {
  total: v3.length,
  unknownTopic: 0,
  lintClean: 0,
  lintRejected: 0,
  rewritten: 0,
  needsReview: 0,
  byTopic: {},
  findingCounts: {},
};

const rewriteReport = [];

for (const q of v3) {
  const r = convertQuestion(q);
  if (!r.ok) {
    stats.unknownTopic++;
    continue;
  }
  // Flag option-text rewrites that left content too thin.
  const tooShort = r.q.options.some((o) => (o.text || '').length < 30);
  if (r.rewriteLog && r.rewriteLog.length > 0) {
    stats.rewritten++;
    rewriteReport.push({
      id: r.q.id,
      topic: r.slug,
      sourceId: q.id,
      sourceSet: q.set_number,
      needsReview: tooShort,
      changes: r.rewriteLog,
    });
  }
  if (tooShort) {
    stats.needsReview++;
    r.q._needs_review = 'option-text-too-short-after-rewrite';
  }
  const findings = lintQuestion(r.q, { mode: 'lenient' });
  const isClean = findings.length === 0;
  if (isClean) stats.lintClean++;
  else stats.lintRejected++;

  for (const f of findings) {
    stats.findingCounts[f.code] = (stats.findingCounts[f.code] || 0) + 1;
  }
  const slug = r.slug;
  stats.byTopic[slug] = stats.byTopic[slug] || { clean: 0, rejected: 0 };
  if (isClean) stats.byTopic[slug].clean++;
  else stats.byTopic[slug].rejected++;

  if (!REPORT_ONLY) {
    const dir = join(STAGING_DIR, slug);
    mkdirSync(dir, { recursive: true });
    const out = { ...r.q, _lint: { clean: isClean, findings } };
    writeFileSync(join(dir, `q-${q.id}.json`), JSON.stringify(out, null, 2) + '\n', 'utf8');
  }
}

if (!REPORT_ONLY) {
  writeFileSync(
    join(__dirname, 'rewrite-report.json'),
    JSON.stringify(rewriteReport, null, 2) + '\n',
    'utf8',
  );
}

console.log('\n--- Import report ---');
console.log(`Total v3 questions:        ${stats.total}`);
console.log(`Skipped (unknown topic):   ${stats.unknownTopic}`);
console.log(`Lint-clean (promotable):   ${stats.lintClean}`);
console.log(`Lint-rejected (needs edit):${stats.lintRejected}`);

console.log('\nPer topic (clean / rejected):');
for (const [slug, c] of Object.entries(stats.byTopic).sort()) {
  console.log(`  ${slug.padEnd(28)} ${String(c.clean).padStart(4)} / ${String(c.rejected).padStart(4)}`);
}

console.log('\nTop lint-finding codes:');
const codes = Object.entries(stats.findingCounts).sort((a, b) => b[1] - a[1]);
for (const [code, n] of codes.slice(0, 15)) {
  console.log(`  ${String(n).padStart(5)}  ${code}`);
}

if (!REPORT_ONLY) {
  console.log(`\nStaged files written to: ${STAGING_DIR}`);
  console.log('Each file has a "_lint" key with findings. Move clean ones into pipeline/authored/<topic>/ to promote.');
} else {
  console.log('\n(--report-only: no files written)');
}
