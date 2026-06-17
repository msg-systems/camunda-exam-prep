// Structural content lints for the Camunda 8.8 exam-style question pool.
//
// Aligned with the C8-CP-DV v8.8.0 blueprint: every item is single-correct,
// exactly four options (a/b/c/d). Stylistic rules from the previous rubric
// (mandatory ≥150-char fictional-company scenario, ≥40-char options, 1.4
// length ratio, forbidden meta-vocab, em-dash, markdown, rationale-leak
// heuristics) have been removed; the rewrite follows the Camunda mock-PDF
// style: short tech-token framing, crisp options, optional FEEL/code blocks.
//
// All findings are 'block' severity. The build script drops any question
// that produces any finding (in strict mode).

export const LINT_CODES = Object.freeze({
  QUESTION_TOO_SHORT: 'question-too-short',
  QUESTION_NOT_INTERROGATIVE: 'question-not-interrogative',
  OPTION_COUNT_NOT_4: 'option-count-not-4',
  OPTION_ID_NOT_ABCD: 'option-id-not-abcd',
  OPTION_EMPTY: 'option-empty',
  CYRILLIC_IN_TEXT: 'cyrillic-in-text',
  INTERNAL_REF_LEAK: 'internal-ref-leak',
  CORRECT_ID_NOT_IN_OPTIONS: 'correct-id-not-in-options',
  OPTION_EXPLANATIONS_MISSING: 'option-explanations-missing',
  DOCS_URL_MISSING_OR_WRONG_HOST: 'docs-url-missing-or-wrong-host',
  VERSION_MARKER_MISSING: 'version-marker-missing',
  TOPIC_NOT_IN_BLUEPRINT: 'topic-not-in-blueprint',
  KIND_INVALID: 'kind-invalid',
  NEGATIVE_STEM_MUST_FLAG: 'negative-stem-must-flag',
  CODE_BLOCK_BAD_KEY: 'code-block-bad-key',
  CODE_BLOCK_PER_OPTION_ASYMMETRIC: 'code-block-per-option-asymmetric',
  EXPLANATION_TOO_SHORT: 'explanation-too-short',
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

const VALID_KINDS = new Set(['single', 'negative']);

const CYRILLIC = /[\u0400-\u04FF]/;
// Internal source-citation leaks: "foo/bar.md:23", "config.yml:10-12",
// or "(:32-43)" / "(:16)" parenthetical line refs. Bare `package.json`
// mentions are fine; we only flag explicit line-number suffixes.
const SRC_FILE_REF = /\b[\w/-]+\.(md|json|ya?ml):\d+(-\d+)?/i;
const LINE_REF = /\(\s*:\s*\d+(\s*-\s*\d+)?\s*\)/;
// `NOT` or `FALSE` must appear (case-sensitive uppercase) somewhere in the
// stem of a negative item so the test-taker is warned, matching the mock
// PDF convention ("Which statement … is NOT true?").
const NEGATIVE_FLAG = /\b(NOT|FALSE)\b/;

const VALID_OPT_IDS = new Set(['a', 'b', 'c', 'd']);

function isStr(x) { return typeof x === 'string' && x.length > 0; }

// Codes that are skipped when running in "lenient" mode (used for imported
// questions where author-style rules are relaxed but structural validity is
// still enforced). With the new rubric there is almost nothing stylistic
// left, so lenient mode mostly mirrors strict.
const LENIENT_SKIP = new Set([
  LINT_CODES.NEGATIVE_STEM_MUST_FLAG,
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

  // Kind (optional; defaults to 'single')
  const kind = q.kind ?? 'single';
  if (!VALID_KINDS.has(kind)) {
    push(LINT_CODES.KIND_INVALID, `kind="${q.kind}" must be 'single' or 'negative'`, 'kind');
  }

  // Question stem
  const question = isStr(q.question) ? q.question : '';
  if (question.length < 20) {
    push(LINT_CODES.QUESTION_TOO_SHORT, `question length ${question.length} < 20`, 'question');
  }
  if (!question.trim().endsWith('?')) {
    push(LINT_CODES.QUESTION_NOT_INTERROGATIVE, 'question must end with "?"', 'question');
  }
  if (kind === 'negative' && !NEGATIVE_FLAG.test(question)) {
    push(
      LINT_CODES.NEGATIVE_STEM_MUST_FLAG,
      'kind=negative requires uppercase NOT or FALSE in the question stem',
      'question',
    );
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

  for (let i = 0; i < options.length; i++) {
    const o = options[i];
    const where = `options[${i}]`;
    const t = isStr(o && o.text) ? o.text : '';
    if (!t.trim()) push(LINT_CODES.OPTION_EMPTY, 'option text is empty', where);
    if (SRC_FILE_REF.test(t) || LINE_REF.test(t)) {
      push(LINT_CODES.INTERNAL_REF_LEAK, 'option text contains internal source/line reference', where);
    }
    if (CYRILLIC.test(t)) push(LINT_CODES.CYRILLIC_IN_TEXT, 'Cyrillic in option text', where);
  }

  // Cyrillic anywhere in scenario / question / explanation
  if (isStr(q.scenario) && CYRILLIC.test(q.scenario)) {
    push(LINT_CODES.CYRILLIC_IN_TEXT, 'Cyrillic in scenario', 'scenario');
  }
  if (CYRILLIC.test(question)) push(LINT_CODES.CYRILLIC_IN_TEXT, 'Cyrillic in question', 'question');

  // Correct id
  if (!['a', 'b', 'c', 'd'].includes(q.correctOptionId) || !options.find((o) => o && o.id === q.correctOptionId)) {
    push(LINT_CODES.CORRECT_ID_NOT_IN_OPTIONS, `correctOptionId="${q.correctOptionId}" not in options`, 'correctOptionId');
  }

  // Option explanations: require an entry per option id. Verdict text
  // ("Correct."/"Incorrect.") is no longer enforced — natural prose is OK.
  const explMap = (q.optionExplanations && typeof q.optionExplanations === 'object') ? q.optionExplanations : null;
  const explKeys = explMap ? ['a', 'b', 'c', 'd'].filter((k) => explMap[k] && isStr(explMap[k].text)) : [];
  if (explKeys.length !== 4) {
    push(LINT_CODES.OPTION_EXPLANATIONS_MISSING, `optionExplanations has ${explKeys.length}/4 entries`, 'optionExplanations');
  } else {
    for (const k of ['a', 'b', 'c', 'd']) {
      const t = explMap[k].text;
      if (t.trim().length < 10) {
        push(LINT_CODES.EXPLANATION_TOO_SHORT, `optionExplanations.${k}.text too short`, `optionExplanations.${k}`);
      }
    }
  }

  // Docs URL
  const docs = Array.isArray(q.docs) ? q.docs : [];
  const urlOk = docs.length > 0 && docs.every((d) => isStr(d && d.url) && /^https:\/\/docs\.camunda\.io\/docs\//.test(d.url));
  if (!urlOk) {
    push(LINT_CODES.DOCS_URL_MISSING_OR_WRONG_HOST, 'docs[] must contain >= 1 url matching https://docs.camunda.io/docs/', 'docs');
  }

  // codeBlocks.perOption keys must be valid option ids
  const codeBlocks = q.codeBlocks;
  if (codeBlocks && typeof codeBlocks === 'object') {
    const per = codeBlocks.perOption;
    if (per && typeof per === 'object') {
      const perKeys = Object.keys(per);
      for (const k of perKeys) {
        if (!VALID_OPT_IDS.has(k)) {
          push(LINT_CODES.CODE_BLOCK_BAD_KEY, `codeBlocks.perOption.${k} is not a valid option id (a..d)`, `codeBlocks.perOption.${k}`);
        }
      }
      // perOption must be all-or-nothing across a/b/c/d. A partial set
      // makes some options visually larger than others, which telegraphs
      // the answer to the test taker.
      const abcdSet = perKeys.filter((k) => VALID_OPT_IDS.has(k));
      if (abcdSet.length > 0 && abcdSet.length < 4) {
        push(
          LINT_CODES.CODE_BLOCK_PER_OPTION_ASYMMETRIC,
          `codeBlocks.perOption covers ${abcdSet.length}/4 options (${abcdSet.sort().join(',')}); must cover all four or none — partial sets reveal the answer visually`,
          'codeBlocks.perOption',
        );
      }
    }
  }

  return out;
}
