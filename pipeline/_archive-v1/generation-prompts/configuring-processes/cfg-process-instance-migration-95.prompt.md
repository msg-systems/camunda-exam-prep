# Authoring task: cfg-process-instance-migration-95

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/configuring-processes/cfg-process-instance-migration-95.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `cfg-process-instance-migration-95` (use exactly this id)
- **topic**: `configuring-processes`
- **difficulty**: `medium`
- **style**: `scenario`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/concepts/process-instance-migration/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): "Internal Execution"

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
  "id": "cp-custom-headers",
  "topic": "configuring-processes",
  "subtopic": "service task",
  "difficulty": "medium",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Forge Bank processes 14000 transactions per day in Camunda 8.8. The job worker for service tasks needs static configuration (an endpoint URL and a region code) that varies by task instance in the BPMN but never changes across process instances and is not stored as a process variable.",
  "question": "Which Camunda 8 service task field carries static per-element configuration to the job worker?",
  "options": [
    { "id": "a", "text": "Custom headers on the service task; the broker copies them onto the activated job and the worker reads them from the job metadata" },
    { "id": "b", "text": "Input mappings on the service task; the broker evaluates them once per process deployment and the worker reads them from the job variables" },
    { "id": "c", "text": "Process variables defined at deployment; the broker treats them as immutable header data and the worker reads them as task headers" },
    { "id": "d", "text": "Documentation on the service task; the broker passes the documentation string as a header and the worker parses key-value pairs from it" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. Custom headers on a service task are static per-element metadata that the broker copies onto the activated job for the worker to read." },
    "b": { "text": "Incorrect. Input mappings produce variables per activation against process scope, not per-element static metadata." },
    "c": { "text": "Incorrect. Process variables flow with the instance and are mutable; they are not the documented vehicle for static per-element configuration." },
    "d": { "text": "Incorrect. Documentation is human-readable text and is not parsed for configuration in Camunda 8." }
  },
  "explanation": "Custom headers attach static metadata per service task element; the broker copies them onto the activated job so the worker can use them as configuration.",
  "docs": [
    { "title": "Service task custom headers", "url": "https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/" }
  ]
}
```

**Exemplar 2** (from authored pool):

```json
{
  "id": "cp-call-activity-process-id",
  "topic": "configuring-processes",
  "subtopic": "call activity",
  "difficulty": "medium",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Lattice Bank picks one of 5 child process definitions at runtime based on the variable productType (loan, mortgage, card, deposit, fx) across 11000 transactions per day in Camunda 8.8. The call activity must resolve the target processId dynamically per instance.",
  "question": "How is the target processId configured on a call activity for runtime selection of the child definition?",
  "options": [
    { "id": "a", "text": "Set a FEEL processId expression on the call activity like =productType + \"-process\"; the engine resolves the target definition at activation" },
    { "id": "b", "text": "Set the processId on the call activity to one of the 5 literal ids and route to alternatives through a downstream exclusive gateway" },
    { "id": "c", "text": "Set the processId to *.process on the call activity; the engine performs a wildcard lookup using the productType process variable at activation" },
    { "id": "d", "text": "Set the implementation type to dynamic-call on the call activity; the engine reads the target id from a custom header named processId" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. Call activities accept a FEEL processId expression in Camunda 8; the engine resolves the target definition id at activation time." },
    "b": { "text": "Incorrect. Static literals plus exclusive gateways add ceremony; the documented mechanism is a FEEL expression on the call activity itself." },
    "c": { "text": "Incorrect. There is no wildcard processId resolution in Camunda 8; FEEL expressions are the documented mechanism." },
    "d": { "text": "Incorrect. There is no dynamic-call implementation type; the FEEL processId expression on the call activity is the supported control." }
  },
  "explanation": "Call activities accept a FEEL processId expression that the engine evaluates at activation to resolve the target child process definition.",
  "docs": [
    { "title": "BPMN call activity", "url": "https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/" }
  ]
}
```

### Source chunk — ALL facts in your answer must trace back to this content

**File**: `pipeline/sources/configuring-processes/process-instance-migration.md`
**Public URL**: https://docs.camunda.io/docs/components/concepts/process-instance-migration/
**Section heading**: Internal Execution

```markdown
## Internal Execution

In the following example, we will explain the internal execution steps of process instance migration.
It is recommended that you read these steps to fully understand the power of process instance migration.

Migration of a process instance consists of the following steps:

- Validation
- Migration of process instance, and global variables
- Migration of each active element (including associated jobs, incidents, local variables, and event subscriptions)

If any of the steps fail, the migration is rejected and a rejection message that explains the reason is returned.
For example, if a mapping is not provided for an active element, the migration is rejected with an error message indicating that the mapping is missing.
As a result, the process instance will not be migrated and remains in its current state.
The migration runs in a **transactional** manner, meaning that it is migrating all active elements or nothing.

### Validation

The migration plan is validated before the migration is executed.
The validation starts with validating the mapping instructions provided in the migration plan.
For example, the validation checks if the source element ID refers to an existing element in the process instance's process definition.
Later, while attempting to migrate each active element, each limitation mentioned in the [limitations section](#limitations) is validated.
For example, the flow scope of an active element is validated to ensure that it is not changed during migration.

### Migration of process instance, and global variables

After all validations are successful, the migration of the outermost active element which is the process instance itself is started.
At this point, the process instance's `processDefinitionKey`, `bpmnProcessId`, and `version` properties are updated to the target process definition.
The global variables are also migrated to the target process definition.

### Migration of each active element

The execution of the migration is done in a breadth-first manner.
The first active child instance of the process instance is migrated followed by the migration of the next active child instance.
Later, the migration of the active child instances of each active child instance is executed.
In this stage, jobs, incidents, local variables, and event subscriptions contained in each active element is also migrated.

While traversing each active element, the migration plan is used to determine the target element for each active element.
For each active element, `processDefinitionKey`, `bpmnProcessId`, `elementId`, `version` properties are updated to the target process definition.

#### Migration of catch event subscriptions

The following operations are performed in respective order for each active element as the execution continues to migrate each active element:

- If a catch event exists in the source process instance and is not part of the migration plan, the subscription to the catch event is removed.
- If a catch event exists in the target process definition and is not part of the migration plan, a new subscription is created for the catch event.
- If a catch event in the source process is mapped to a catch event in the target process, the subscription is migrated.

While migrating each catch event subscriptions, the catch event's `processDefinitionKey`, `bpmnProcessId`, `elementId` properties are updated to the target process definition.
:::note
It is **possible** to change the interrupting status during catch event subscription migration.
:::
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/configuring-processes/cfg-process-instance-migration-95.json** and nothing else.
2. The id MUST be `cfg-process-instance-migration-95`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/concepts/process-instance-migration/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".


<!-- LINT REWORK -->

### Lint feedback from previous attempt

Your previous output failed these strict lints. Fix every one of them and rewrite the JSON file:

- [scenario-missing-measurable] scenario lacks a number/currency/duration anchor @ scenario

Overwrite `pipeline/generation/outputs/configuring-processes/cfg-process-instance-migration-95.json` with a corrected JSON document and stop.
