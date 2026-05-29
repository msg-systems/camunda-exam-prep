// Strict content lints for the authored Camunda 8.8 question pool.
// All findings are 'block' severity. The build script drops any question
// that produces any finding.

export const LINT_CODES = Object.freeze({
  SCENARIO_TOO_SHORT: 'scenario-too-short',
  SCENARIO_MISSING_DOMAIN_MARKER: 'scenario-missing-domain-marker',
  SCENARIO_MISSING_MEASURABLE: 'scenario-missing-measurable',
  QUESTION_TOO_SHORT: 'question-too-short',
  QUESTION_NOT_INTERROGATIVE: 'question-not-interrogative',
  OPTION_COUNT_NOT_4: 'option-count-not-4',
  OPTION_ID_NOT_ABCD: 'option-id-not-abcd',
  OPTION_TOO_SHORT: 'option-too-short',
  OPTION_LENGTH_RATIO: 'option-length-ratio',
  META_VOCAB_IN_OPTION: 'meta-vocab-in-option',
  EM_DASH_IN_OPTION: 'em-dash-in-option',
  OPTION_SELF_RATIONALE: 'option-self-rationale',
  MARKDOWN_IN_OPTION: 'markdown-in-option',
  INTERNAL_REF_LEAK: 'internal-ref-leak',
  CYRILLIC_IN_TEXT: 'cyrillic-in-text',
  CORRECT_ID_NOT_IN_OPTIONS: 'correct-id-not-in-options',
  OPTION_EXPLANATIONS_MISSING: 'option-explanations-missing',
  EXPLANATION_VERDICT_MISMATCH: 'explanation-verdict-mismatch',
  DOCS_URL_MISSING_OR_WRONG_HOST: 'docs-url-missing-or-wrong-host',
  VERSION_MARKER_MISSING: 'version-marker-missing',
  TOPIC_NOT_IN_BLUEPRINT: 'topic-not-in-blueprint',
  // Minimum-quality gate. Always blocks, even in lenient mode.
  QUALITY_SCENARIO_TOO_SHORT: 'quality-scenario-too-short',
  QUALITY_QUESTION_TOO_SHORT: 'quality-question-too-short',
  QUALITY_OPTION_TOO_SHORT: 'quality-option-too-short',
  QUALITY_OPTION_LENGTH_RATIO: 'quality-option-length-ratio',
  QUALITY_OPTION_RATIONALE_LEAK: 'quality-option-rationale-leak',
  QUALITY_INTERNAL_REF_LEAK: 'quality-internal-ref-leak',
});

const TOPIC_SLUGS = new Set([
  'modeling',
  'configuring-processes',
  'decisions-business-rules',
  'forms',
  'connectors',
  'extensions-integrations',
  'managing-development',
  'dev-environment',
]);

const META_VOCAB = /\b(incorrect|wrong|partial|anti-?pattern|misnomer|overstates|understates|misleading|not\s+supported|deprecated)\b/i;
const INTERNAL_REF = /\bper\s+[\w/-]+\.(md|json|ya?ml)(:\d+(-\d+)?)?/i;
const CYRILLIC = /[\u0400-\u04FF]/;
const EM_DASH = /\u2014/;
const MARKDOWN_BOLD = /\*\*[^*]+\*\*/;
const MARKDOWN_CODE = /`[^`]+`/;
const SELF_RATIONALE = /,\s*(because|since)\b/i;
const DOMAIN_MARKER = /\b(bank|banking|insurance|insurer|logistics|retailer|e-?commerce|marketplace|saas|healthcare|hospital|fintech|telco|utility|government|airline|broker|brokerage|payments?|lender|manufacturer|fulfil?ment|warehouse|dealership|payroll|supplier|customer|merchant|carrier|cooperative|wholesaler|publisher|operator|provider|tenant|subscriber)\b/i;
const PROPER_NOUN = /\b(ACME|NovaPay|HelixHealth|Aurora|Atlas|Vertex|Lumen|Quanta|Stellar|Orion|Helios|Nimbus|Zephyr|Kestrel|Apex|Beacon|Catalyst|Delta|Echo|Forge|Granite|Harbor|Iris|Junction|Keystone|Lattice|Meridian|North|Oasis|Pinnacle|Quantum|Ridge|Sable|Tessera|Umbra|Vanta|Wren|Xander|Yarrow|Zenith)\b/;

function isStr(x) { return typeof x === 'string' && x.length > 0; }

function hasMeasurable(text) {
  if (/[€$£¥]\s?\d/.test(text)) return true;
  if (/\d[\d,]*\s?(?:%|seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?|ms|attempts?|retries|tokens?|requests?|calls?|orders?|customers?|users?|tenants?|instances?|tasks?|workers?|jobs?|nodes?|brokers?|partitions?|replicas?|euros?|dollars?|pounds?|developers?|engineers?|teams?|agents?|claims?|transactions?|invoices?|loans?|policies|policy-holders?|merchants?|shipments?|warehouses?|locations?|branches|records?|rows?|messages?|events?|incidents?|deployments?|releases?|microservices?|clusters?|million|billion|thousand)\b/i.test(text)) return true;
  if (/\b\d+[KMB]\b/.test(text)) return true;
  if (/€\d|\$\d|£\d/.test(text)) return true;
  return false;
}

// Codes that are skipped when running in "lenient" mode (used for imported
// questions where author-style rules are relaxed but structural validity is
// still enforced). Hand-authored content always runs strict.
const LENIENT_SKIP = new Set([
  LINT_CODES.SCENARIO_TOO_SHORT,
  LINT_CODES.SCENARIO_MISSING_DOMAIN_MARKER,
  LINT_CODES.SCENARIO_MISSING_MEASURABLE,
  LINT_CODES.QUESTION_TOO_SHORT,
  LINT_CODES.QUESTION_NOT_INTERROGATIVE,
  LINT_CODES.OPTION_TOO_SHORT,
  LINT_CODES.OPTION_LENGTH_RATIO,
  LINT_CODES.META_VOCAB_IN_OPTION,
  LINT_CODES.EM_DASH_IN_OPTION,
  LINT_CODES.OPTION_SELF_RATIONALE,
  LINT_CODES.MARKDOWN_IN_OPTION,
  LINT_CODES.DOCS_URL_MISSING_OR_WRONG_HOST,
]);

/**
 * Lint a single authored question. Returns an array of findings (empty on clean).
 * @param {object} q
 * @param {{ mode?: 'strict' | 'lenient' }} [opts]
 * @returns {Array<{code: string, severity: 'block', message: string, where: string}>}
 */
export function lintQuestion(q, opts = {}) {
  const mode = opts.mode === 'lenient' ? 'lenient' : 'strict';
  const out = [];
  const push = (code, message, where) => {
    if (mode === 'lenient' && LENIENT_SKIP.has(code)) return;
    out.push({ code, severity: 'block', message, where });
  };

  if (!q || typeof q !== 'object') {
    push('not-object', 'Question is not an object', 'root');
    return out;
  }

  // Topic
  if (!TOPIC_SLUGS.has(q.topic)) {
    push(LINT_CODES.TOPIC_NOT_IN_BLUEPRINT, `topic="${q.topic}" not in blueprint`, 'topic');
  }

  // Version marker
  if (q.camundaVersion !== '8.8') {
    push(LINT_CODES.VERSION_MARKER_MISSING, 'camundaVersion must equal "8.8"', 'camundaVersion');
  }

  // Scenario
  const scenario = isStr(q.scenario) ? q.scenario : '';
  if (scenario.length < 150) {
    push(LINT_CODES.SCENARIO_TOO_SHORT, `scenario length ${scenario.length} < 150`, 'scenario');
  }
  if (scenario && !(DOMAIN_MARKER.test(scenario) || PROPER_NOUN.test(scenario))) {
    push(LINT_CODES.SCENARIO_MISSING_DOMAIN_MARKER, 'scenario lacks a domain noun or company-name proper noun', 'scenario');
  }
  if (scenario && !hasMeasurable(scenario)) {
    push(LINT_CODES.SCENARIO_MISSING_MEASURABLE, 'scenario lacks a number/currency/duration anchor', 'scenario');
  }

  // Question
  const question = isStr(q.question) ? q.question : '';
  if (question.length < 25) {
    push(LINT_CODES.QUESTION_TOO_SHORT, `question length ${question.length} < 25`, 'question');
  }
  if (!question.trim().endsWith('?')) {
    push(LINT_CODES.QUESTION_NOT_INTERROGATIVE, 'question must end with "?"', 'question');
  }

  // Options
  const options = Array.isArray(q.options) ? q.options : [];
  if (options.length !== 4) {
    push(LINT_CODES.OPTION_COUNT_NOT_4, `options length ${options.length} != 4`, 'options');
  }
  const ids = options.map((o) => o && o.id).join(',');
  if (ids !== 'a,b,c,d') {
    push(LINT_CODES.OPTION_ID_NOT_ABCD, `option ids "${ids}" != "a,b,c,d"`, 'options');
  }

  const lengths = options.map((o) => (isStr(o && o.text) ? o.text.length : 0));
  for (let i = 0; i < options.length; i++) {
    const o = options[i];
    const where = `options[${i}]`;
    const t = isStr(o && o.text) ? o.text : '';
    if (t.length < 40) push(LINT_CODES.OPTION_TOO_SHORT, `option text length ${t.length} < 40`, where);
    if (META_VOCAB.test(t)) push(LINT_CODES.META_VOCAB_IN_OPTION, 'meta-vocabulary leak', where);
    if (EM_DASH.test(t)) push(LINT_CODES.EM_DASH_IN_OPTION, 'em-dash leak', where);
    if (SELF_RATIONALE.test(t)) push(LINT_CODES.OPTION_SELF_RATIONALE, 'option contains self-rationale clause', where);
    if (MARKDOWN_BOLD.test(t) || MARKDOWN_CODE.test(t)) push(LINT_CODES.MARKDOWN_IN_OPTION, 'markdown in option', where);
    if (INTERNAL_REF.test(t)) push(LINT_CODES.INTERNAL_REF_LEAK, 'internal-ref leak', where);
    if (CYRILLIC.test(t)) push(LINT_CODES.CYRILLIC_IN_TEXT, 'Cyrillic in option text', where);
  }
  if (lengths.length === 4) {
    const max = Math.max(...lengths);
    const min = Math.min(...lengths) || 1;
    if (max / min > 1.4) {
      push(LINT_CODES.OPTION_LENGTH_RATIO, `option length ratio ${(max / min).toFixed(2)} > 1.4`, 'options');
    }
  }

  // Cyrillic anywhere in scenario/question
  if (CYRILLIC.test(scenario)) push(LINT_CODES.CYRILLIC_IN_TEXT, 'Cyrillic in scenario', 'scenario');
  if (CYRILLIC.test(question)) push(LINT_CODES.CYRILLIC_IN_TEXT, 'Cyrillic in question', 'question');

  // Correct id
  if (!['a', 'b', 'c', 'd'].includes(q.correctOptionId) || !options.find((o) => o && o.id === q.correctOptionId)) {
    push(LINT_CODES.CORRECT_ID_NOT_IN_OPTIONS, `correctOptionId="${q.correctOptionId}" not in options`, 'correctOptionId');
  }

  // Option explanations
  const explMap = (q.optionExplanations && typeof q.optionExplanations === 'object') ? q.optionExplanations : null;
  const explKeys = explMap ? ['a', 'b', 'c', 'd'].filter((k) => explMap[k] && isStr(explMap[k].text)) : [];
  if (explKeys.length !== 4) {
    push(LINT_CODES.OPTION_EXPLANATIONS_MISSING, `optionExplanations has ${explKeys.length}/4 entries`, 'optionExplanations');
  } else {
    for (const k of ['a', 'b', 'c', 'd']) {
      const isCorrect = k === q.correctOptionId;
      const text = explMap[k].text;
      const startsCorrect = /^Correct\./.test(text);
      const startsIncorrect = /^Incorrect\./.test(text);
      if (isCorrect && !startsCorrect) {
        push(LINT_CODES.EXPLANATION_VERDICT_MISMATCH, `optionExplanations.${k} (correct option) must start with "Correct."`, `optionExplanations.${k}`);
      }
      if (!isCorrect && !startsIncorrect) {
        push(LINT_CODES.EXPLANATION_VERDICT_MISMATCH, `optionExplanations.${k} (distractor) must start with "Incorrect."`, `optionExplanations.${k}`);
      }
    }
  }

  // Docs URL
  const docs = Array.isArray(q.docs) ? q.docs : [];
  const urlOk = docs.length > 0 && docs.every((d) => isStr(d && d.url) && /^https:\/\/docs\.camunda\.io\/docs\//.test(d.url));
  if (!urlOk) {
    push(LINT_CODES.DOCS_URL_MISSING_OR_WRONG_HOST, 'docs[] must contain >= 1 url matching https://docs.camunda.io/docs/', 'docs');
  }

  // ---- Minimum-quality gate (always blocks; bypasses LENIENT_SKIP) ----
  const forcePush = (code, message, where) => out.push({ code, severity: 'block', message, where });

  if (scenario.length > 0 && scenario.length < 80) {
    forcePush(LINT_CODES.QUALITY_SCENARIO_TOO_SHORT, `scenario length ${scenario.length} < 80 (catastrophically short)`, 'scenario');
  }
  if (question.length > 0 && question.length < 20) {
    forcePush(LINT_CODES.QUALITY_QUESTION_TOO_SHORT, `question length ${question.length} < 20 (catastrophically short)`, 'question');
  }
  for (let i = 0; i < options.length; i++) {
    const o = options[i];
    const t = isStr(o && o.text) ? o.text : '';
    if (t.length > 0 && t.length < 30) {
      forcePush(LINT_CODES.QUALITY_OPTION_TOO_SHORT, `option text length ${t.length} < 30 (catastrophically short)`, `options[${i}]`);
    }
    // Option text leaks its own verdict ("this is wrong", "this is mistaken",
    // "this is close to correct", "this is a partial approach",
    // "Option c) -- ..."). Real exams never do this.
    const RATIONALE_LEAK = /\b(this|that)\s+(is|represents|would be|sounds)\s+(wrong|incorrect|right|correct|mistaken|misleading|close|partial(ly)?|the\s+wrong|unnecessarily|overkill|a\s+(mistake|misconception|misnomer|trap|red\s*herring|partial|common|reasonable|valid|good|bad|misread|partial\s+approach))\b/i;
    // Generic verdict patterns that don't need a "this/that" subject:
    //   "is mistaken", "is incorrect", "is a misconception", "is workable but verbose"
    //   "The claim/idea/notion/assertion that X is wrong/mistaken/..."
    const GENERIC_VERDICT = /\b(is|are|sounds|seems|looks)\s+(mistaken|misleading|a\s+misconception|a\s+misnomer|a\s+myth|a\s+misread|workable\s+but|reasonable\s+but|plausible\s+but|close\s+but|tempting\s+but|partially\s+(correct|true|right))\b/i;
    const CLAIM_VERDICT = /\b(the\s+)?(claim|idea|notion|assertion|statement|assumption|premise|impression)\s+that\b[^.!?]{0,120}\bis\s+(wrong|incorrect|mistaken|false|misleading|a\s+misconception)\b/i;
    const META_COMMENTARY = /\b(recognis|recogniz)(e|ing|es|ed)\s+(this|the)\s+(limitation|distinction|nuance|caveat|trade[- ]?off|gotcha|pitfall)|helps\s+avoid\s+(common\s+)?(pitfall|mistake|misconception)s?\b/i;
    // Option grades itself in a trailing sentence: "This correctly models...",
    // "This describes an invented behavior", "However, re-instantiating...".
    const SELF_GRADE = /\b(this|that)\s+(correctly|incorrectly|properly|improperly|accurately|inaccurately)\s+(models?|describes?|represents?|implements?|configures?|captures?|reflects?|handles?|solves?)\b/i;
    const SELF_GRADE2 = /\b(this|that)\s+(describes?|represents?)\s+an?\s+(invented|fabricated|nonexistent|imaginary|incorrect|wrong|mistaken|misleading)\b/i;
    // "This reasoning conflates...", "This approach over-engineers...",
    // "This configuration misses...", "The former assumes..."
    const SELF_GRADE3 = /\b(this|that|the\s+(former|latter))\s+(reasoning|approach|option|answer|choice|solution|pattern|configuration|setup|model|design|argument)\s+(conflates|misses|over-?engineers|under-?engineers|over-?states|under-?states|fails|breaks|ignores|misreads|misapplies|misuses|forgets|assumes|works|does\s+not\s+work|wrongly|correctly|incorrectly)\b/i;
    // "Neither choice leverages...", "Either option fails..."
    const COVERAGE_VERDICT = /\b(neither|either|both)\s+(choice|option|approach|answer|pattern|configuration)s?\s+(leverages?|uses?|works?|is|are|matches|achieves|handles|supports|fails|misses|ignores|conflates)\b/i;
    // Negative judgement adjectives: "is unnecessary", "is overkill", etc.
    const NEGATIVE_JUDGEMENT = /\b(is|are|would be|becomes)\s+(unnecessary|unnecessarily|overkill|excessive|wasteful|inappropriate|inadequate|insufficient|sub-?optimal|counter-?productive|misguided|ill-?suited|poorly\s+suited)\b/i;
    const VALUE_VERDICT = /\b(adds?\s+no\s+value|without\s+adding\s+value|clutters?\s+the\s+(model|design|process|diagram)|no\s+real\s+benefit|defeats?\s+the\s+purpose)\b/i;
    // Prescriptive doc-style language: "X is appropriate for Y", "is the
    // canonical/recommended/preferred/standard path/way/approach".
    const PRESCRIPTIVE = /\b(is|are)\s+(appropriate|recommended|suitable|preferred|canonical|the\s+(canonical|standard|recommended|preferred|ideal|best|right|wrong))\s+(for|to|path|approach|way|choice|tool|option|method)\b/i;
    // Directive to the test-taker / engineer (study guides, not exam options).
    const DIRECTIVE = /\b(teams|developers|engineers|administrators|users|operators|architects|you)\s+should\s+(verify|use|consider|ensure|prefer|avoid|always|never|adopt|choose|pick|select|opt|favor|favour)\b/i;
    // "is fully achievable", "is always available", "is not required/needed".
    const ABSOLUTE_VERDICT = /\bis\s+(fully\s+achievable|always\s+available|not\s+required|not\s+needed|not\s+supported|impossible)\b/i;
    // Trailing concession/contrast that signals "but actually this is wrong":
    // "However, X creates...", "but the original X continues...", "yet this fails..."
    const TRAILING_CONCESSION = /(^|[.!?]\s+)(However|That said|In reality|In practice|In fact|Actually|Unfortunately)\s*,/;
    // Doc-style affirmation tail: "Camunda 8 supports/allows/does not/cannot..."
    // appended to an option to confirm/deny correctness.
    const DOC_AFFIRMATION = /(^|[.!?]\s+)(Camunda\s+\d+(\.\d+)?|The\s+(SDK|engine|broker|gateway|connector\s+SDK|platform))\s+(supports?|allows?|enables?|provides?|does\s+not|cannot|will|will\s+not|requires?)\b/i;
    const HEDGE_LEAK = /\b(needs nuance|close to (correct|right|incorrect|wrong)|partial(ly)? (correct|right|wrong|incorrect|true)|but (this|that) (is|misses|conflates|overstates|understates)|serves a different purpose|common (mistake|misconception)|red herring|sounds plausible)\b/i;
    const OPTION_CROSSREF = /\bOption\s+[a-d]\)/i;
    const TERSE_VERDICT = /^[A-Z][a-z'\s]{0,40}--\s*(wrong|incorrect|mistaken|right|correct)\.?$/i;
    if (
      RATIONALE_LEAK.test(t) ||
      GENERIC_VERDICT.test(t) ||
      CLAIM_VERDICT.test(t) ||
      META_COMMENTARY.test(t) ||
      SELF_GRADE.test(t) ||
      SELF_GRADE2.test(t) ||
      SELF_GRADE3.test(t) ||
      COVERAGE_VERDICT.test(t) ||
      NEGATIVE_JUDGEMENT.test(t) ||
      VALUE_VERDICT.test(t) ||
      PRESCRIPTIVE.test(t) ||
      DIRECTIVE.test(t) ||
      ABSOLUTE_VERDICT.test(t) ||
      TRAILING_CONCESSION.test(t) ||
      DOC_AFFIRMATION.test(t) ||
      HEDGE_LEAK.test(t) ||
      OPTION_CROSSREF.test(t) ||
      TERSE_VERDICT.test(t.trim())
    ) {
      forcePush(LINT_CODES.QUALITY_OPTION_RATIONALE_LEAK, 'option text contains its own verdict/rationale', `options[${i}]`);
    }
    // Internal source-citation leaks: "per foo/bar.md:23", "(:32-43)", "(:16)".
    // Require an explicit line-number suffix so legitimate mentions of
    // package.json / application.yaml are not flagged.
    const SRC_FILE_REF = /\b[\w/-]+\.(md|json|ya?ml):\d+(-\d+)?/i;
    const LINE_REF = /\(\s*:\s*\d+(\s*-\s*\d+)?\s*\)/;
    if (SRC_FILE_REF.test(t) || LINE_REF.test(t)) {
      forcePush(LINT_CODES.QUALITY_INTERNAL_REF_LEAK, 'option text contains internal source/line reference', `options[${i}]`);
    }
  }
  if (lengths.length === 4) {
    const lmax = Math.max(...lengths);
    const lmin = Math.min(...lengths) || 1;
    if (lmax / lmin > 6) {
      forcePush(LINT_CODES.QUALITY_OPTION_LENGTH_RATIO, `option length ratio ${(lmax / lmin).toFixed(1)} > 6.0 (catastrophic imbalance)`, 'options');
    }
  }

  return out;
}
