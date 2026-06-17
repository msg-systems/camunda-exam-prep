import { describe, it, expect } from 'vitest';
import { lintQuestion, LINT_CODES } from '../pipeline/lib/content-lints.mjs';

function cleanQ(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'mod-test-01',
    topic: 'modeling',
    subtopic: 'events',
    difficulty: 'medium',
    style: 'scenario',
    kind: 'single',
    camundaVersion: '8.8',
    question: 'Which boundary event variant fires the handler and cancels the attached task?',
    options: [
      { id: 'a', text: 'Interrupting error boundary event' },
      { id: 'b', text: 'Non-interrupting timer boundary event' },
      { id: 'c', text: 'Compensation boundary event' },
      { id: 'd', text: 'Signal boundary event with no isInterrupting attribute' },
    ],
    correctOptionId: 'a',
    optionExplanations: {
      a: { text: 'Interrupting boundary events cancel the attached activity when fired.' },
      b: { text: 'Non-interrupting boundary events leave the original task running.' },
      c: { text: 'Compensation handlers run only after a triggering compensation event.' },
      d: { text: 'Signal boundary defaults are interrupting; that is not what this option claims.' },
    },
    explanation: 'Interrupting boundary events cancel the attached activity once the event fires.',
    docs: [{ title: 'BPMN error events', url: 'https://docs.camunda.io/docs/components/modeler/bpmn/error-events/' }],
    ...overrides,
  };
}

function negativeQ(overrides: Partial<Record<string, unknown>> = {}) {
  return cleanQ({
    id: 'mod-negative-01',
    kind: 'negative',
    question: 'Which statement about a terminate end event is NOT true?',
    correctOptionId: 'd',
    options: [
      { id: 'a', text: 'It destroys all tokens within its containing scope.' },
      { id: 'b', text: 'Inside an embedded subprocess it ends only that subprocess.' },
      { id: 'c', text: 'At the top level it ends the entire process instance.' },
      { id: 'd', text: 'It automatically triggers compensation handlers in its scope.' },
    ],
    optionExplanations: {
      a: { text: 'True. Terminate kills tokens in its containing scope.' },
      b: { text: 'True. Inside a subprocess it ends only that subprocess scope.' },
      c: { text: 'True. At the top level it ends the whole instance.' },
      d: { text: 'False. Terminate does not run compensation; that is the wrong/false statement.' },
    },
    ...overrides,
  });
}

function codeBlocksQ(overrides: Partial<Record<string, unknown>> = {}) {
  return cleanQ({
    id: 'ext-feel-substring-01',
    topic: 'extensions-integrations',
    subtopic: 'feel',
    question: 'What does the FEEL expression above return?',
    codeBlocks: {
      stem: 'substring("Camunda", 4)',
    },
    options: [
      { id: 'a', text: '"Camu"' },
      { id: 'b', text: '"unda"' },
      { id: 'c', text: '"munda"' },
      { id: 'd', text: 'Error — out of range.' },
    ],
    correctOptionId: 'b',
    optionExplanations: {
      a: { text: 'Wrong start position; substring is 1-indexed, position 4 is "u".' },
      b: { text: 'Position 4 of "Camunda" is "u" and substring with no length returns the rest.' },
      c: { text: 'That would be position 3, not 4.' },
      d: { text: 'Position 4 is within range; no error is raised.' },
    },
    ...overrides,
  });
}

describe('content lints', () => {
  it('clean single-correct question produces no findings', () => {
    expect(lintQuestion(cleanQ())).toEqual([]);
  });

  it('clean negative question produces no findings', () => {
    expect(lintQuestion(negativeQ())).toEqual([]);
  });

  it('clean code-blocks question produces no findings', () => {
    expect(lintQuestion(codeBlocksQ())).toEqual([]);
  });

  it('allows short crisp option text (mock style)', () => {
    const q = cleanQ();
    (q.options as Array<{ id: string; text: string }>)[0].text = 'true';
    (q.options as Array<{ id: string; text: string }>)[1].text = 'false';
    (q.options as Array<{ id: string; text: string }>)[2].text = 'null';
    (q.options as Array<{ id: string; text: string }>)[3].text = 'An error.';
    expect(lintQuestion(q)).toEqual([]);
  });

  it('allows optional scenario absence', () => {
    const q = cleanQ();
    delete (q as Record<string, unknown>).scenario;
    expect(lintQuestion(q)).toEqual([]);
  });

  it('flags question not interrogative', () => {
    const f = lintQuestion(cleanQ({ question: 'Pick the best modeling element for this failure path.' }));
    expect(f.some((x) => x.code === LINT_CODES.QUESTION_NOT_INTERROGATIVE)).toBe(true);
  });

  it('flags question too short', () => {
    const f = lintQuestion(cleanQ({ question: 'Short?' }));
    expect(f.some((x) => x.code === LINT_CODES.QUESTION_TOO_SHORT)).toBe(true);
  });

  it('flags empty option text', () => {
    const q = cleanQ();
    (q.options as Array<{ id: string; text: string }>)[2].text = '   ';
    const f = lintQuestion(q);
    expect(f.some((x) => x.code === LINT_CODES.OPTION_EMPTY)).toBe(true);
  });

  it('flags Cyrillic anywhere', () => {
    const q = cleanQ();
    (q.options as Array<{ id: string; text: string }>)[1].text =
      'Non-interrupting timer boundary event with cyrillic noise \u0413\u0440\u0435\u0448\u043a\u0430 included';
    const f = lintQuestion(q);
    expect(f.some((x) => x.code === LINT_CODES.CYRILLIC_IN_TEXT)).toBe(true);
  });

  it('flags internal-ref leak in option text', () => {
    const q = cleanQ();
    (q.options as Array<{ id: string; text: string }>)[1].text =
      'Non-interrupting timer boundary event per modeling.md:1-15 in the docs repository';
    const f = lintQuestion(q);
    expect(f.some((x) => x.code === LINT_CODES.INTERNAL_REF_LEAK)).toBe(true);
  });

  it('flags missing version marker', () => {
    const f = lintQuestion(cleanQ({ camundaVersion: '8.4' }));
    expect(f.some((x) => x.code === LINT_CODES.VERSION_MARKER_MISSING)).toBe(true);
  });

  it('flags topic not in blueprint', () => {
    const f = lintQuestion(cleanQ({ topic: 'mystery-topic' }));
    expect(f.some((x) => x.code === LINT_CODES.TOPIC_NOT_IN_BLUEPRINT)).toBe(true);
  });

  it('flags docs url wrong host', () => {
    const f = lintQuestion(cleanQ({ docs: [{ title: 'x', url: 'https://example.com/x' }] }));
    expect(f.some((x) => x.code === LINT_CODES.DOCS_URL_MISSING_OR_WRONG_HOST)).toBe(true);
  });

  it('flags missing option explanations', () => {
    const f = lintQuestion(cleanQ({ optionExplanations: { a: { text: 'only one entry of four.' } } }));
    expect(f.some((x) => x.code === LINT_CODES.OPTION_EXPLANATIONS_MISSING)).toBe(true);
  });

  it('flags correct id not in options', () => {
    const f = lintQuestion(cleanQ({ correctOptionId: 'z' }));
    expect(f.some((x) => x.code === LINT_CODES.CORRECT_ID_NOT_IN_OPTIONS)).toBe(true);
  });

  it('flags invalid kind', () => {
    const f = lintQuestion(cleanQ({ kind: 'multi' }));
    expect(f.some((x) => x.code === LINT_CODES.KIND_INVALID)).toBe(true);
  });

  it('flags negative item whose stem omits NOT/FALSE', () => {
    const q = negativeQ({ question: 'Which statement about a terminate end event is incorrect?' });
    const f = lintQuestion(q);
    expect(f.some((x) => x.code === LINT_CODES.NEGATIVE_STEM_MUST_FLAG)).toBe(true);
  });

  it('accepts negative item whose stem contains FALSE', () => {
    const q = negativeQ({
      question: 'Which statement about a terminate end event is FALSE?',
    });
    expect(lintQuestion(q)).toEqual([]);
  });

  it('flags codeBlocks.perOption with non-abcd key', () => {
    const q = codeBlocksQ() as Record<string, unknown>;
    (q.codeBlocks as { perOption?: Record<string, string> }).perOption = {
      a: '"Camu"',
      b: '"unda"',
      c: '"munda"',
      d: '"err"',
      e: '"extra"',
    };
    const f = lintQuestion(q);
    expect(f.some((x) => x.code === LINT_CODES.CODE_BLOCK_BAD_KEY)).toBe(true);
  });

  it('flags asymmetric codeBlocks.perOption (some options but not all)', () => {
    const q = codeBlocksQ() as Record<string, unknown>;
    (q.codeBlocks as { perOption?: Record<string, string> }).perOption = {
      a: '"Camu"',
      b: '"unda"',
      c: '"munda"',
    };
    const f = lintQuestion(q);
    expect(f.some((x) => x.code === LINT_CODES.CODE_BLOCK_PER_OPTION_ASYMMETRIC)).toBe(true);
  });

  it('accepts codeBlocks.perOption covering all four options', () => {
    const q = codeBlocksQ() as Record<string, unknown>;
    (q.codeBlocks as { perOption?: Record<string, string> }).perOption = {
      a: '"Camu"',
      b: '"unda"',
      c: '"munda"',
      d: 'null',
    };
    expect(lintQuestion(q)).toEqual([]);
  });

  it('lenient mode skips the negative-stem flag', () => {
    const q = negativeQ({ question: 'Which statement about a terminate end event is incorrect?' });
    const f = lintQuestion(q, { mode: 'lenient' });
    expect(f.some((x) => x.code === LINT_CODES.NEGATIVE_STEM_MUST_FLAG)).toBe(false);
  });
});
