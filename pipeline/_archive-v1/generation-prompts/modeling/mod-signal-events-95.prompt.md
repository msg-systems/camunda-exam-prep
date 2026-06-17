# Authoring task: mod-signal-events-95

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/modeling/mod-signal-events-95.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `mod-signal-events-95` (use exactly this id)
- **topic**: `modeling`
- **difficulty**: `easy`
- **style**: `scenario`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): (top of page)

### JSON schema (every field is required unless marked optional)

```jsonc
{
  "id":             "string, kebab-case, regex ^(mod|cfg|dec|frm|con|ext|mng|dev)-[a-z0-9-]+$ (use the id given below)",
  "topic":          "one of: modeling | configuring-processes | decisions-business-rules | forms | connectors | extensions-integrations | managing-development | dev-environment",
  "subtopic":       "optional, kebab-case sub-area (e.g. 'subprocesses')",
  "difficulty":     "easy | medium | hard (use the value given below)",
  "style":          "scenario | concept | recall (use the value given below)",
  "camundaVersion": "must be exactly \"8.8\"",
  "scenario":       "150-800 chars. A concrete C8.8 business scene. MUST contain (1) a domain marker (a named company like 'Lattice Insurance' OR a domain noun like 'bank/insurer/retailer/...') and (2) a measurable (€/$, %, duration like PT2H, count like '3000 claims').",
  "question":       "25-300 chars, MUST end with '?', MUST start with what/which/how/when/where/why/who.",
  "options": [
    { "id": "a", "text": "40-450 chars" },
    { "id": "b", "text": "40-450 chars" },
    { "id": "c", "text": "40-450 chars" },
    { "id": "d", "text": "40-450 chars" }
  ],
  "correctOptionId": "a | b | c | d — must be one of the option ids above",
  "optionExplanations": {
    "a": { "text": "80-700 chars. MUST start with 'Correct.' or 'Incorrect.' matching whether 'a' is the correctOptionId." },
    "b": { "text": "80-700 chars. MUST start with 'Correct.' or 'Incorrect.' matching whether 'b' is the correctOptionId." },
    "c": { "text": "80-700 chars. MUST start with 'Correct.' or 'Incorrect.' matching whether 'c' is the correctOptionId." },
    "d": { "text": "80-700 chars. MUST start with 'Correct.' or 'Incorrect.' matching whether 'd' is the correctOptionId." }
  },
  "explanation":    "80-700 chars. Summary teaching note — DO NOT use 'Correct.'/'Incorrect.' here.",
  "docs": [ { "title": "Short page title 4-120 chars", "url": "https://docs.camunda.io/docs/... (use the SOURCE URL given below)" } ]
}
```

### Strict lint rules (any violation → reject)

| Code                          | Rule |
| ----------------------------- | ---- |
| scenario-too-short            | scenario < 150 chars |
| scenario-missing-domain-marker | scenario lacks a named company or domain noun (bank/insurer/saas/healthcare/fintech/logistics/retailer/airline/marketplace/...) |
| scenario-missing-measurable   | scenario lacks a number with unit: €/$ amount, %, duration (PT2H / "2 hours"), or count ("3000 claims") |
| question-too-short            | question < 25 chars |
| question-not-interrogative    | question doesn't end with '?' |
| option-count-not-4            | options array length ≠ 4 |
| option-id-not-abcd            | option ids ≠ a/b/c/d (exact, in order) |
| option-too-short              | any option text < 40 chars |
| option-length-ratio           | max(option lengths) / min(option lengths) > 1.4 — keep the four options length-parallel |
| meta-vocab-in-option          | option text contains: incorrect, wrong, partial, anti-pattern, misnomer, overstates, understates, misleading, not supported, deprecated |
| em-dash-in-option             | U+2014 em-dash in an option — use '--' instead |
| option-self-rationale         | option starts with 'because' or 'since' — options must be statements, not justifications |
| markdown-in-option            | option text contains markdown (** _ ` [text](url)) |
| internal-ref-leak             | option text contains an internal ref like 'foo.md:23' or '(:32-43)' |
| correct-id-not-in-options     | correctOptionId not one of the option ids |
| option-explanations-missing   | optionExplanations missing any of a/b/c/d |
| explanation-verdict-mismatch  | per-option explanation doesn't start with 'Correct.' (when id == correctOptionId) or 'Incorrect.' (otherwise) |
| docs-url-missing-or-wrong-host | no docs[] entry, or url not on https://docs.camunda.io/docs/ |
| version-marker-missing        | camundaVersion ≠ '8.8' |
| topic-not-in-blueprint        | topic not one of the 8 listed in the schema |

Additionally:
- Options must be parallel statements — same grammatical form, similar length, no embedded sub-clauses that grade themselves ("which correctly handles..."). The OPTIONS state WHAT, the EXPLANATIONS state WHY.
- Never include phrases like "This approach...", "This pattern...", "Camunda 8 supports/allows/requires...", "teams should...", "is the canonical/recommended approach", "However,...", "In reality,..." inside option text. Save all that for the explanation fields.
- Distractors must be plausible Camunda traps (Camunda-7 confusion, version drift, similar-but-different element, wrong scope, wrong direction of mapping, wrong cardinality). They must NOT be obviously absurd.
- Every fact (the correct answer AND why each distractor is wrong) must be supported by the SOURCE chunk below. No facts pulled from outside the chunk except universally-known C8.8 schema constants.

### Authoring rubric (distilled)

- **Style "scenario"** (most items): scenario sets a concrete C8.8 situation with a named company + measurable; question asks a single targeted question; options are 4 parallel WHAT-statements; explanations carry the WHY.
- **Style "concept"**: scenario can be lighter on narrative but must still cite a measurable from the docs (e.g. "default retry count of 3"). Question targets a definition or rule.
- **Style "recall"**: scenario describes a real configuration choice; question asks which value/expression/property is required. Still needs domain marker + measurable.

### Exemplars (same topic — match this voice and structure, NOT the subject)

**Exemplar 1** (from authored pool):

```json
{
  "id": "mod-business-rule-task",
  "topic": "modeling",
  "subtopic": "tasks",
  "difficulty": "easy",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Catalyst Bank scores 18000 transactions per day for fraud risk in Camunda 8.8. A deployed DMN decision named fraudScore must run as part of the BPMN flow and write its result into a process variable to drive a downstream gateway condition.",
  "question": "Which BPMN element invokes a deployed DMN decision and writes its result to a process variable?",
  "options": [
    { "id": "a", "text": "Business rule task with the decision ID and result variable configured invokes the deployed DMN decision and exposes the result" },
    { "id": "b", "text": "Service task with a special dmn job type invokes the deployed DMN decision and exposes the result on the configured variable" },
    { "id": "c", "text": "Script task with FEEL as the script language invokes the deployed DMN decision and writes the result to a process variable" },
    { "id": "d", "text": "Send task with the decision ID configured under message reference invokes the DMN decision through internal message correlation" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. Camunda 8 business rule tasks invoke deployed DMN decisions by ID and expose the result through the configured resultVariable property." },
    "b": { "text": "Incorrect. There is no dmn-typed service task pattern; DMN evaluation is the role of the business rule task element." },
    "c": { "text": "Incorrect. Script tasks evaluate inline FEEL but do not invoke a separately deployed DMN decision artefact." },
    "d": { "text": "Incorrect. Send tasks are for outbound message correlation; they do not invoke DMN decisions in Camunda 8." }
  },
  "explanation": "The business rule task is the documented BPMN element for evaluating a deployed DMN decision and exposing its result under a configured process variable.",
  "docs": [
    { "title": "BPMN business rule task", "url": "https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/" }
  ]
}
```

**Exemplar 2** (from authored pool):

```json
{
  "id": "mod-boundary-timer-non-interrupting",
  "topic": "modeling",
  "subtopic": "events",
  "difficulty": "medium",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Lattice Insurance asks adjusters to review 3000 claims per day in Camunda 8.8. After a user task is created, a reminder email must be sent 2 hours later, but the adjuster must still be able to complete the same user task without the task being cancelled by the timer firing.",
  "question": "Which boundary event variant attaches to the user task to send the reminder without cancelling the activity?",
  "options": [
    { "id": "a", "text": "A non-interrupting boundary timer event with a duration of PT2H attaches to the user task and triggers the reminder branch independently" },
    { "id": "b", "text": "An interrupting boundary timer event with a duration of PT2H attaches to the user task and cancels the user task when the timer fires" },
    { "id": "c", "text": "A non-interrupting boundary error event with code REMINDER attaches to the user task and triggers the reminder branch after 2 hours" },
    { "id": "d", "text": "An event subprocess timer with a duration of PT2H replaces the user task with a reminder flow when the timer reaches its threshold" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. Non-interrupting boundary timer events fire without cancelling the attached activity; the reminder branch runs concurrently with the user task." },
    "b": { "text": "Incorrect. Interrupting boundary timer events cancel the attached activity when they fire; the user task would no longer be completable." },
    "c": { "text": "Incorrect. Boundary error events are interrupting only and require a thrown BPMN error, not a timed reminder." },
    "d": { "text": "Incorrect. Event subprocesses do not replace the host activity; the question requires a boundary event on the user task itself." }
  },
  "explanation": "Non-interrupting boundary timers fire on the configured timer expression while leaving the attached activity in place, which is the documented reminder pattern.",
  "docs": [
    { "title": "BPMN timer events", "url": "https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/" }
  ]
}
```

### Source chunk — ALL facts in your answer must trace back to this content

**File**: `pipeline/sources/modeling/signal-events.md`
**Public URL**: https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/

```markdown
Signal events are events which reference a [signal](../../../concepts/signals.md).
Broadcasting a signal will trigger _all_ signal events matching the name of the broadcasted signal.

![Process with multiple different signal events](assets/signal-events.png)

Signal events are typically used if you want to communicate with multiple listeners. For intermediate events, a signal will trigger all process instances with a token waiting at a corresponding catch event, even across different processes. For start events, a signal will start one instance per process that has a corresponding signal start. Thus, signals form a single sender to several-recipient relationship.

These differ from [message events](/components/modeler/bpmn/message-events/message-events.md), which are used if a single process instance needs to wait for a message from a secondary process or an external system. This is a single sender to a single recipient relationship (1:1), as the message cannot have more than one recipient.

Both event types are methods of collaboration within BPMN.
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/modeling/mod-signal-events-95.json** and nothing else.
2. The id MUST be `mod-signal-events-95`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".


<!-- LINT REWORK -->

### Lint feedback from previous attempt

Your previous output failed these strict lints. Fix every one of them and rewrite the JSON file:

- [scenario-missing-measurable] scenario lacks a number/currency/duration anchor @ scenario

Overwrite `pipeline/generation/outputs/modeling/mod-signal-events-95.json` with a corrected JSON document and stop.
