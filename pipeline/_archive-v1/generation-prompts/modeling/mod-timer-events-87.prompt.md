# Authoring task: mod-timer-events-87

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/modeling/mod-timer-events-87.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `mod-timer-events-87` (use exactly this id)
- **topic**: `modeling`
- **difficulty**: `medium`
- **style**: `concept`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): "Timers"

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

**File**: `pipeline/sources/modeling/timer-events.md`
**Public URL**: https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/
**Section heading**: Timers

```markdown
## Timers

Timers must be defined by providing either a date, a duration, or a cycle.

A timer can be defined either as a [static value](/components/concepts/expressions.md#expressions-vs-static-values) (e.g. `P3D`) or as an [expression](/components/concepts/expressions.md). There are two common ways to use an expression:

- [Access a variable](/components/modeler/feel/language-guide/feel-variables.md#access-variable) (e.g. `= remainingTime`).
- [Use temporal values](/components/concepts/expressions.md#temporal-expressions) (e.g. `= date and time(expirationDate) - date and time(creationDate)`).

If the expression belongs to a timer start event of the process, it is evaluated on deploying the process. Otherwise, it is evaluated on activating the timer catch event. The evaluation must result in either a `string` that has the same ISO 8601 format as the static value, or an equivalent temporal value (i.e. a date-time, a duration, or a cycle).

:::note
Zeebe is an asynchronous system. As a result, there is no guarantee a timer triggers exactly at the configured time.

Depending on how much load the system is under, timers could trigger later than their due date. However, timers will never trigger earlier than the due date.
:::

### Time date

import ISO8601DateTime from '../assets/react-components/iso-8601-date-time.md'

<ISO8601DateTime/>

If the date is in the past at the time of deployment, the timer fires immediately.

### Time duration

A duration is defined as a ISO 8601 durations format, which defines the amount of intervening time in a time interval and are represented by the format `P(n)Y(n)M(n)DT(n)H(n)M(n)S`. Note that the `n` is replaced by the value for each of the date and time elements that follow the `n`.

The capital letters _P_, _Y_, _M_, _W_, _D_, _T_, _H_, _M_, and _S_ are designators for each of the date and time elements and are not replaced, but can be omitted.

- _P_ is the duration designator (for period) placed at the start of the duration representation.
- _Y_ is the year designator that follows the value for the number of years.
- _M_ is the month designator that follows the value for the number of months.
- _W_ is the week designator that follows the value for the number of weeks.
- _D_ is the day designator that follows the value for the number of days.
- _T_ is the time designator that precedes the time components of the representation.
- _H_ is the hour designator that follows the value for the number of hours.
- _M_ is the minute designator that follows the value for the number of minutes.
- _S_ is the second designator that follows the value for the number of seconds.

Examples:

- `PT15S` - 15 seconds
- `PT1H30M` - 1 hour and 30 minutes
- `P14D` - 14 days
- `P14DT1H30M` - 14 days, 1 hour and 30 minutes
- `P3Y6M4DT12H30M5S` - 3 years, 6 months, 4 days, 12 hours, 30 minutes and 5 seconds

If the duration is zero or negative, the timer fires immediately.

### Time cycle

A cycle defined as ISO 8601 repeating intervals format; it contains the duration and the number of repetitions. If the repetitions are not defined, the timer repeats infinitely until it is canceled.

- `R5/PT10S`: Every 10 seconds, up to five times
- `R/P1D`: Every day, infinitely

It's possible to define a start time. By doing this, the timer triggers for the first time on the given start time. Afterwards, it will follow the interval as usual.

- `R3/2022-04-27T17:20:00Z/P1D`: Every day up to three times, starting from April 27, 2022 at 5:20 p.m. UTC
- `R/2022-01-01T10:00:00+02:00[Europe/Berlin]/P1D`: Every day infinitely, starting from January 1, 2022 at 10 a.m. UTC plus 2 hours

If the start time is in the past at the time of deployment, the timer fires immediately upon deployment, and then continues with the regular interval from that point on.

Additionally, you can specify a time cycle using cron expressions. Refer to the [CronExpression Tutorial](https://spring.io/blog/2020/11/10/new-in-spring-5-3-improved-cron-expressions) for additional information about using cron expressions.

- `0 0 9-17 * * MON-FRI`: Every hour on the hour from 9-5 p.m. UTC Monday-Friday
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/modeling/mod-timer-events-87.json** and nothing else.
2. The id MUST be `mod-timer-events-87`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".
