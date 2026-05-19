import { describe, it, expect } from 'vitest';
import { lintQuestion, LINT_CODES } from '../pipeline/lib/content-lints.mjs';

function cleanQ(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'mod-test-01',
    topic: 'modeling',
    subtopic: 'tasks',
    difficulty: 'medium',
    style: 'scenario',
    camundaVersion: '8.8',
    scenario:
      'NovaPay, a payments fintech, runs an order-fulfilment process that handles around 5000 orders per day; the team must decide how to model the payment-failure path before the 8.8 release ships next week.',
    question: 'Which modeling element best captures the payment-failure path for the service task?',
    options: [
      { id: 'a', text: 'Attach a boundary error event to the service task and route to a compensation handler' },
      { id: 'b', text: 'Place a parallel gateway after the service task and join both branches downstream' },
      { id: 'c', text: 'Insert a manual review user task before the service task with a default assignee' },
      { id: 'd', text: 'Catch the failure inside the worker code and write a flag variable back to the process' },
    ],
    correctOptionId: 'a',
    optionExplanations: {
      a: { text: 'Correct. A boundary error event is the BPMN-native way to redirect flow on a failed service task.' },
      b: { text: 'Incorrect. A parallel gateway forks the flow regardless of outcome and does not catch errors.' },
      c: { text: 'Incorrect. A user task before the service task does not react to a downstream failure.' },
      d: { text: 'Incorrect. Catching the failure in worker code skips BPMN semantics and breaks visibility in Operate.' },
    },
    explanation: 'Use BPMN error boundary events to model failure paths from service tasks.',
    docs: [{ title: 'BPMN error events', url: 'https://docs.camunda.io/docs/components/modeler/bpmn/error-events/' }],
    ...overrides,
  };
}

describe('content lints', () => {
  it('clean question produces no findings', () => {
    expect(lintQuestion(cleanQ())).toEqual([]);
  });

  it('flags scenario too short', () => {
    const f = lintQuestion(cleanQ({ scenario: 'Too short.' }));
    expect(f.some((x) => x.code === LINT_CODES.SCENARIO_TOO_SHORT)).toBe(true);
  });

  it('flags scenario missing domain marker', () => {
    const f = lintQuestion(cleanQ({
      scenario:
        'The team is rolling out a new process and must decide how to handle 5 retries before the upcoming release; the deployment is scheduled for next week and every minute counts.',
    }));
    expect(f.some((x) => x.code === LINT_CODES.SCENARIO_MISSING_DOMAIN_MARKER)).toBe(true);
  });

  it('flags scenario missing measurable', () => {
    const f = lintQuestion(cleanQ({
      scenario:
        'A bank is rolling out a new payments process and must decide how to handle the failure path before the upcoming release; the team has been refining the model for several iterations.',
    }));
    expect(f.some((x) => x.code === LINT_CODES.SCENARIO_MISSING_MEASURABLE)).toBe(true);
  });

  it('flags question not interrogative', () => {
    const f = lintQuestion(cleanQ({ question: 'Pick the best modeling element for this failure path.' }));
    expect(f.some((x) => x.code === LINT_CODES.QUESTION_NOT_INTERROGATIVE)).toBe(true);
  });

  it('flags meta-vocabulary in option text', () => {
    const q = cleanQ();
    (q.options as Array<{ id: string; text: string }>)[1].text =
      'Place a parallel gateway after the service task (incorrect; gateways do not catch errors here)';
    const f = lintQuestion(q);
    expect(f.some((x) => x.code === LINT_CODES.META_VOCAB_IN_OPTION)).toBe(true);
  });

  it('flags em-dash in option text', () => {
    const q = cleanQ();
    (q.options as Array<{ id: string; text: string }>)[2].text =
      'Insert a manual review user task before the service task \u2014 with a default assignee';
    const f = lintQuestion(q);
    expect(f.some((x) => x.code === LINT_CODES.EM_DASH_IN_OPTION)).toBe(true);
  });

  it('flags option self-rationale', () => {
    const q = cleanQ();
    (q.options as Array<{ id: string; text: string }>)[3].text =
      'Catch the failure inside the worker code, because BPMN error events are unreliable in practice';
    const f = lintQuestion(q);
    expect(f.some((x) => x.code === LINT_CODES.OPTION_SELF_RATIONALE)).toBe(true);
  });

  it('flags markdown in option text', () => {
    const q = cleanQ();
    (q.options as Array<{ id: string; text: string }>)[0].text =
      'Attach a **boundary error event** to the service task and route to a compensation handler';
    const f = lintQuestion(q);
    expect(f.some((x) => x.code === LINT_CODES.MARKDOWN_IN_OPTION)).toBe(true);
  });

  it('flags internal-ref leak', () => {
    const q = cleanQ();
    (q.options as Array<{ id: string; text: string }>)[1].text =
      'Place a parallel gateway after the service task per modeling.md:1-15 in the docs repository';
    const f = lintQuestion(q);
    expect(f.some((x) => x.code === LINT_CODES.INTERNAL_REF_LEAK)).toBe(true);
  });

  it('flags Cyrillic anywhere', () => {
    const q = cleanQ();
    (q.options as Array<{ id: string; text: string }>)[1].text =
      'Place a parallel gateway after the service task with cyrillic noise \u0413\u0440\u0435\u0448\u043a\u0430 included';
    const f = lintQuestion(q);
    expect(f.some((x) => x.code === LINT_CODES.CYRILLIC_IN_TEXT)).toBe(true);
  });

  it('flags option length ratio above 1.4', () => {
    const q = cleanQ();
    (q.options as Array<{ id: string; text: string }>)[0].text =
      'Attach a boundary error event to the service task and route the token through a compensation subprocess that refunds the customer, audits the failure, and notifies the operations team before completing';
    const f = lintQuestion(q);
    expect(f.some((x) => x.code === LINT_CODES.OPTION_LENGTH_RATIO)).toBe(true);
  });

  it('flags option too short', () => {
    const q = cleanQ();
    (q.options as Array<{ id: string; text: string }>)[2].text = 'Too short';
    const f = lintQuestion(q);
    expect(f.some((x) => x.code === LINT_CODES.OPTION_TOO_SHORT)).toBe(true);
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
    const f = lintQuestion(cleanQ({ optionExplanations: { a: { text: 'Correct. only one.' } } }));
    expect(f.some((x) => x.code === LINT_CODES.OPTION_EXPLANATIONS_MISSING)).toBe(true);
  });

  it('flags explanation verdict mismatch', () => {
    const q = cleanQ();
    (q.optionExplanations as Record<string, { text: string }>).a = {
      text: 'Incorrect. wrong verdict on the correct option.',
    };
    const f = lintQuestion(q);
    expect(f.some((x) => x.code === LINT_CODES.EXPLANATION_VERDICT_MISMATCH)).toBe(true);
  });

  it('flags correct id not in options', () => {
    const f = lintQuestion(cleanQ({ correctOptionId: 'z' }));
    expect(f.some((x) => x.code === LINT_CODES.CORRECT_ID_NOT_IN_OPTIONS)).toBe(true);
  });
});
