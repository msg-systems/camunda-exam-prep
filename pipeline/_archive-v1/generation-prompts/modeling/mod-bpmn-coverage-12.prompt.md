# Authoring task: mod-bpmn-coverage-12

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/modeling/mod-bpmn-coverage-12.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `mod-bpmn-coverage-12` (use exactly this id)
- **topic**: `modeling`
- **difficulty**: `medium`
- **style**: `concept`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): "Events"

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

**File**: `pipeline/sources/modeling/bpmn-coverage.md`
**Public URL**: https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/
**Section heading**: Events

```markdown
## Events

import NoneStartEventSvg from './assets/bpmn-symbols/none-start-event.svg'
import NoneThrowEventSvg from './assets/bpmn-symbols/none-throw-event.svg'
import NoneEndEventSvg from './assets/bpmn-symbols/none-end-event.svg'

import MessageStartEventSvg from './assets/bpmn-symbols/message-start-event.svg'
import MessageEventSubprocessSvg from './assets/bpmn-symbols/message-event-subprocess.svg'
import MessageEventSubprocessNonInterruptingSvg from './assets/bpmn-symbols/message-event-subprocess-non-interrupting.svg'
import MessageCatchEventSvg from './assets/bpmn-symbols/message-catch-event.svg'
import MessageBoundaryEventSvg from './assets/bpmn-symbols/message-boundary-event.svg'
import MessageBoundaryEventNonInterruptingSvg from './assets/bpmn-symbols/message-boundary-event-non-interrupting.svg'
import MessageThrowEventSvg from './assets/bpmn-symbols/message-throw-event.svg'
import MessageEndEventSvg from './assets/bpmn-symbols/message-end-event.svg'

import TimerStartEventSvg from './assets/bpmn-symbols/timer-start-event.svg'
import TimerEventSubprocessSvg from './assets/bpmn-symbols/timer-event-subprocess.svg'
import TimerEventSubprocessNonInterruptingSvg from './assets/bpmn-symbols/timer-event-subprocess-non-interrupting.svg'
import TimerCatchEventSvg from './assets/bpmn-symbols/timer-catch-event.svg'
import TimerBoundaryEventSvg from './assets/bpmn-symbols/timer-boundary-event.svg'
import TimerBoundaryEventNonInterruptingSvg from './assets/bpmn-symbols/timer-boundary-event-non-interrupting.svg'

import ErrorEventSubprocessSvg from './assets/bpmn-symbols/error-event-subprocess.svg'
import ErrorBoundaryEventSvg from './assets/bpmn-symbols/error-boundary-event.svg'
import ErrorEndEventSvg from './assets/bpmn-symbols/error-end-event.svg'

import SignalStartEventSvg from './assets/bpmn-symbols/signal-start-event.svg'
import SignalEventSubprocessSvg from './assets/bpmn-symbols/signal-event-subprocess.svg'
import SignalEventSubprocessNonInterruptingSvg from './assets/bpmn-symbols/signal-event-subprocess-non-interrupting.svg'
import SignalCatchEventSvg from './assets/bpmn-symbols/signal-catch-event.svg'
import SignalBoundaryEventSvg from './assets/bpmn-symbols/signal-boundary-event.svg'
import SignalBoundaryEventNonInterruptingSvg from './assets/bpmn-symbols/signal-boundary-event-non-interrupting.svg'
import SignalThrowEventSvg from './assets/bpmn-symbols/signal-throw-event.svg'
import SignalEndEventSvg from './assets/bpmn-symbols/signal-end-event.svg'

import ConditionalStartEventSvg from './assets/bpmn-symbols/conditional-start-event.svg'
import ConditionalEventSubprocessSvg from './assets/bpmn-symbols/conditional-event-subprocess.svg'
import ConditionalEventSubprocessNonInterruptingSvg from './assets/bpmn-symbols/conditional-event-subprocess-non-interrupting.svg'
import ConditionalCatchEventSvg from './assets/bpmn-symbols/conditional-catch-event.svg'
import ConditionalBoundaryEventSvg from './assets/bpmn-symbols/conditional-boundary-event.svg'
import ConditionalBoundaryEventNonInterruptingSvg from './assets/bpmn-symbols/conditional-boundary-event-non-interrupting.svg'

import EscalationEventSubprocessSvg from './assets/bpmn-symbols/escalation-event-subprocess.svg'
import EscalationEventSubprocessNonInterruptingSvg from './assets/bpmn-symbols/escalation-event-subprocess-non-interrupting.svg'
import EscalationBoundaryEventSvg from './assets/bpmn-symbols/escalation-boundary-event.svg'
import EscalationBoundaryEventNonInterruptingSvg from './assets/bpmn-symbols/escalation-boundary-event-non-interrupting.svg'
import EscalationThrowEventSvg from './assets/bpmn-symbols/escalation-throw-event.svg'
import EscalationEndEventSvg from './assets/bpmn-symbols/escalation-end-event.svg'

import CompensationEventSubprocessSvg from './assets/bpmn-symbols/compensation-event-subprocess.svg'
import CompensationBoundaryEventSvg from './assets/bpmn-symbols/compensation-boundary-event.svg'
import CompensationThrowEventSvg from './assets/bpmn-symbols/compensation-throw-event.svg'
import CompensationEndEventSvg from './assets/bpmn-symbols/compensation-end-event.svg'

import CancelBoundaryEventSvg from './assets/bpmn-symbols/cancel-boundary-event.svg'
import CancelEndEventSvg from './assets/bpmn-symbols/cancel-end-event.svg'

import TerminationEndEventSvg from './assets/bpmn-symbols/termination-end-event.svg'

import LinkCatchEventSvg from './assets/bpmn-symbols/link-catch-event.svg'
import LinkThrowEventSvg from './assets/bpmn-symbols/link-throw-event.svg'

import MultipleStartEventSvg from './assets/bpmn-symbols/multiple-start-event.svg'
import MultipleEventSubprocessSvg from './assets/bpmn-symbols/multiple-event-subprocess.svg'
import MultipleEventSubprocessNonInterruptingSvg from './assets/bpmn-symbols/multiple-event-subprocess-non-interrupting.svg'
import MultipleCatchEventSvg from './assets/bpmn-symbols/multiple-catch-event.svg'
import MultipleBoundaryEventSvg from './assets/bpmn-symbols/multiple-boundary-event.svg'
import MultipleBoundaryEventNonInterruptingSvg from './assets/bpmn-symbols/multiple-boundary-event-non-interrupting.svg'
import MultipleThrowEventSvg from './assets/bpmn-symbols/multiple-throw-event.svg'
import MultipleEndEventSvg from './assets/bpmn-symbols/multiple-end-event.svg'

import MultipleParallelStartEventSvg from './assets/bpmn-symbols/multiple-parallel-start-event.svg'
import MultipleParallelEventSubprocessSvg from './assets/bpmn-symbols/multiple-parallel-event-subprocess.svg'
import MultipleParallelEventSubprocessNonInterruptingSvg from './assets/bpmn-symbols/multiple-parallel-event-subprocess-non-interrupting.svg'
import MultipleParallelCatchEventSvg from './assets/bpmn-symbols/multiple-parallel-catch-event.svg'
import MultipleParallelBoundaryEventSvg from './assets/bpmn-symbols/multiple-parallel-boundary-event.svg'
import MultipleParallelBoundaryEventNonInterruptingSvg from './assets/bpmn-symbols/multiple-parallel-boundary-event-non-interrupting.svg'

<table className="bpmn-coverage-event-table">
  <thead>
      <tr>
        <th>Type</th>
        <th colspan="3">Start</th>
        <th colspan="4">Intermediate</th>
        <th>End</th>
      </tr>
      <tr>
        <th></th>
        <th>Normal</th>
        <th>Event Subprocess</th>
        <th>Event Subprocess non-interrupting</th>
        <th>Catch</th>
        <th>Boundary</th>
        <th>Boundary non-interrupting</th>
        <th>Throw</th>
        <th></th>
      </tr>
  </thead>
  <tbody>
    <tr>
        <td>
            <a href="../none-events/">None</a>
        </td>
        <td>
            <a href="../none-events/">
                <NoneStartEventSvg className="implemented" />
            </a>
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>
            <a href="../none-events/">
                <NoneThrowEventSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../none-events/">
                <NoneEndEventSvg className="implemented" />
            </a>
        </td>
    </tr>
    <tr>
        <td>
            <a href="../message-events/">Message</a>
        </td>
        <td>
            <a href="../message-events/">
                <MessageStartEventSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../message-events/">
                <MessageEventSubprocessSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../message-events/">
                <MessageEventSubprocessNonInterruptingSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../message-events/">
                <MessageCatchEventSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../message-events/">
                <MessageBoundaryEventSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../message-events/">
                <MessageBoundaryEventNonInterruptingSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../message-events/">
                <MessageThrowEventSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../message-events/">
                <MessageEndEventSvg className="implemented" />
            </a>
        </td>
    </tr>
    <tr>
        <td>
            <a href="../timer-events/">Timer</a>
        </td>
        <td>
            <a href="../timer-events/">
                <TimerStartEventSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../timer-events/">
                <TimerEventSubprocessSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../timer-events/">
                <TimerEventSubprocessNonInterruptingSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../timer-events/">
                <TimerCatchEventSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../timer-events/">
                <TimerBoundaryEventSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../timer-events/">
                <TimerBoundaryEventNonInterruptingSvg className="implemented" />
            </a>
        </td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>
            <a href="../error-events/">Error</a>
        </td>
        <td></td>
        <td>
            <a href="../error-events/">
                <ErrorEventSubprocessSvg className="implemented" />
            </a>
        </td>
        <td></td>
        <td></td>
        <td>
            <a href="../error-events/">
                <ErrorBoundaryEventSvg className="implemented" />
            </a>
        </td>
        <td></td>
        <td></td>
        <td>
            <a href="../error-events/">
                <ErrorEndEventSvg className="implemented" />
            </a>
        </td>
    </tr>
    <tr>
        <td>
            <a href="../signal-events/">Signal</a>
        </td>
        <td>
            <a href="../signal-events/">
                <SignalStartEventSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../signal-events/">
                <SignalEventSubprocessSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../signal-events/">
                <SignalEventSubprocessNonInterruptingSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../signal-events/">
                <SignalCatchEventSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../signal-events/">
                <SignalBoundaryEventSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../signal-events/">
                <SignalBoundaryEventNonInterruptingSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../signal-events/">
                <SignalThrowEventSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../signal-events/">
                <SignalEndEventSvg className="implemented" />
            </a>
        </td>
    </tr>
    <tr>
        <td>
            Conditional
        </td>
        <td>
            <a href="#">
                <ConditionalStartEventSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <ConditionalEventSubprocessSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <ConditionalEventSubprocessNonInterruptingSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <ConditionalCatchEventSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <ConditionalBoundaryEventSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <ConditionalBoundaryEventNonInterruptingSvg />
            </a>
        </td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>
            <a href="../escalation-events/">Escalation</a>
        </td>
        <td></td>
        <td>
            <a href="../escalation-events/">
                <EscalationEventSubprocessSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../escalation-events">
                <EscalationEventSubprocessNonInterruptingSvg className="implemented" />
            </a>
        </td>
        <td></td>
        <td>
            <a href="../escalation-events">
                <EscalationBoundaryEventSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../escalation-events">
                <EscalationBoundaryEventNonInterruptingSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../escalation-events">
                <EscalationThrowEventSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../escalation-events">
                <EscalationEndEventSvg className="implemented" />
            </a>
        </td>
    </tr>
    <tr>
        <td>
            <a href="../compensation-events/">Compensation</a>
        </td>
        <td></td>
        <td>
            <a href="#">
                <CompensationEventSubprocessSvg />
            </a>
        </td>
        <td></td>
        <td></td>
        <td>
            <a href="../compensation-events/">
                <CompensationBoundaryEventSvg className="implemented" />
            </a>
        </td>
        <td></td>
        <td>
            <a href="../compensation-events/">
                <CompensationThrowEventSvg className="implemented" />
            </a>
        </td>
        <td>
            <a href="../compensation-events/">
                <CompensationEndEventSvg className="implemented" />
            </a>
        </td>
    </tr>
    <tr>
        <td>
            Cancel
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>
            <a href="#">
                <CancelBoundaryEventSvg />
            </a>
        </td>
        <td></td>
        <td></td>
        <td>
            <a href="#">
                <CancelEndEventSvg />
            </a>
        </td>
    </tr>
    <tr>
        <td>
            <a href="../terminate-events/">Terminate</a>
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>
            <a href="../terminate-events/">
                <TerminationEndEventSvg className="implemented" />
            </a>
        </td>
    </tr>
    <tr>
        <td>
            <a href="../link-events">Link</a>
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td>
            <a href="../link-events/">
                <LinkCatchEventSvg className="implemented"/>
            </a>
        </td>
        <td></td>
        <td></td>
        <td>
            <a href="../link-events">
                <LinkThrowEventSvg className="implemented"/>
            </a>
        </td>
        <td></td>
    </tr>
    <tr>
        <td>
            Multiple
        </td>
        <td>
            <a href="#">
                <MultipleStartEventSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <MultipleEventSubprocessSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <MultipleEventSubprocessNonInterruptingSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <MultipleCatchEventSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <MultipleBoundaryEventSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <MultipleBoundaryEventNonInterruptingSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <MultipleThrowEventSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <MultipleEndEventSvg />
            </a>
        </td>
    </tr>
    <tr>
        <td>
            Multiple Parallel
        </td>
        <td>
            <a href="#">
                <MultipleParallelStartEventSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <MultipleParallelEventSubprocessSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <MultipleParallelEventSubprocessNonInterruptingSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <MultipleParallelCatchEventSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <MultipleParallelBoundaryEventSvg />
            </a>
        </td>
        <td>
            <a href="#">
                <MultipleParallelBoundaryEventNonInterruptingSvg />
            </a>
        </td>
        <td></td>
        <td></td>
    </tr>

  </tbody>
</table>
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/modeling/mod-bpmn-coverage-12.json** and nothing else.
2. The id MUST be `mod-bpmn-coverage-12`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".
