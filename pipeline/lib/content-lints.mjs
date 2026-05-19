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

/**
 * Lint a single authored question. Returns an array of findings (empty on clean).
 * @param {object} q
 * @returns {Array<{code: string, severity: 'block', message: string, where: string}>}
 */
export function lintQuestion(q) {
  const out = [];
  const push = (code, message, where) => out.push({ code, severity: 'block', message, where });

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

  return out;
}
