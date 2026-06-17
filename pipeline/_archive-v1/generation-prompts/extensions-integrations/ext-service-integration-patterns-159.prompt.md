# Authoring task: ext-service-integration-patterns-159

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/extensions-integrations/ext-service-integration-patterns-159.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `ext-service-integration-patterns-159` (use exactly this id)
- **topic**: `extensions-integrations`
- **difficulty**: `medium`
- **style**: `scenario`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/best-practices/development/service-integration-patterns/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): "Handling different response messages"

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
  "id": "ext-camunda-client-ts",
  "topic": "extensions-integrations",
  "subtopic": "TypeScript SDK",
  "difficulty": "easy",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Aurora Marketplace migrates a TypeScript service that consumes 18000 jobs per day from Camunda 8.7 to Camunda 8.8. The team must replace the legacy SDK class name used to construct a client and update calls to the unified surface introduced in 8.8 across the entire codebase.",
  "question": "Which client class do TypeScript developers instantiate in the Camunda 8.8 SDK?",
  "options": [
    { "id": "a", "text": "CamundaClient is the unified TypeScript SDK class in Camunda 8.8 that replaces the legacy ZeebeClient used in earlier minor versions" },
    { "id": "b", "text": "ZeebeClient is the canonical class in Camunda 8.8 and the SDK keeps the original name for the entire 8.x release series" },
    { "id": "c", "text": "OperateClient is the unified TypeScript SDK class in Camunda 8.8 and it covers Zeebe, Operate, and Tasklist APIs through a single surface" },
    { "id": "d", "text": "TasklistClient is the unified TypeScript SDK class in Camunda 8.8 and developers configure Zeebe endpoints on it via runtime options" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. Camunda 8.8 introduced CamundaClient as the unified TypeScript SDK class; ZeebeClient is the legacy name being phased out." },
    "b": { "text": "Incorrect. The class name changed in 8.8 to align with the unified API; ZeebeClient is the legacy form." },
    "c": { "text": "Incorrect. OperateClient is a single-component client, not the unified entry class." },
    "d": { "text": "Incorrect. TasklistClient is a single-component client, not the unified entry class in 8.8." }
  },
  "explanation": "Camunda 8.8 introduced CamundaClient in the TypeScript SDK as the unified client class, replacing the legacy ZeebeClient.",
  "docs": [
    { "title": "Camunda 8 TypeScript SDK", "url": "https://docs.camunda.io/docs/apis-tools/camunda-8-js-sdk/" }
  ]
}
```

**Exemplar 2** (from authored pool):

```json
{
  "id": "ext-connector-secret",
  "topic": "extensions-integrations",
  "subtopic": "Connectors",
  "difficulty": "medium",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Tessera Insurance configures an HTTP REST outbound connector for 5500 transactions per day in Camunda 8.8. The team must not embed an API key literal in the BPMN file or element template fields; instead the connector runtime must resolve the key from a managed secret at execution time.",
  "question": "Which Camunda 8 syntax references a managed secret inside a connector property?",
  "options": [
    { "id": "a", "text": "Set the property value to {{secrets.MY_API_KEY}}; the connector runtime resolves the placeholder against the configured secret store at invocation" },
    { "id": "b", "text": "Set the property value to ENV(MY_API_KEY); the connector runtime resolves the value from the broker process environment variables at every invocation" },
    { "id": "c", "text": "Set the property value to ${MY_API_KEY}; the connector runtime resolves it from broker process environment variables on every invocation" },
    { "id": "d", "text": "Set the property value to vault://MY_API_KEY; the connector runtime resolves the value from the HashiCorp Vault integration bundled with the broker" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. Camunda 8 connectors reference managed secrets via the {{secrets.NAME}} placeholder; the runtime resolves the value from the secret store at invocation." },
    "b": { "text": "Incorrect. ENV(NAME) is not the documented placeholder syntax; secrets are managed via the secret store." },
    "c": { "text": "Incorrect. Dollar-brace syntax references variables not secrets; secret references use the {{secrets.NAME}} placeholder." },
    "d": { "text": "Incorrect. There is no vault:// scheme in the connector configuration; the documented syntax is {{secrets.NAME}}." }
  },
  "explanation": "Connector secrets are referenced via the {{secrets.NAME}} placeholder; the runtime resolves the value from the secret store at invocation time.",
  "docs": [
    { "title": "Connector secrets", "url": "https://docs.camunda.io/docs/components/console/manage-clusters/manage-secrets/" }
  ]
}
```

### Source chunk — ALL facts in your answer must trace back to this content

**File**: `pipeline/sources/extensions-integrations/service-integration-patterns.md`
**Public URL**: https://docs.camunda.io/docs/components/best-practices/development/service-integration-patterns/
**Section heading**: Handling different response messages

```markdown
### Handling different response messages

Very often the response payload of the message will be examined to determine how to move on in the process.

![Gateway handling response](service-integration-patterns-assets/response-gateway.png)

In this case, you receive exactly one type of message for the response. As an alternative, you could also use different message types, to which the process can react differently. For example, you might wait for the validation message, but also accept a cancellation or rejection message instead:

![Boundary message event to capture different response messages](service-integration-patterns-assets/response-boundary-message-events.png)

This modeling has the advantage that it is much easier to note the expected flow of the process (also called the happy path), with exceptions deviating from it. On the other hand, this pattern mixes receive tasks and events in one model, which can confuse readers. Keep in mind that it only works for a limited number of non-happy messages.

To avoid the task/event mixture you could use a so-called event-based gateway instead, this gateway waits for one of a list of possible message types to be received:

![Event based gateway to capture different response messages](service-integration-patterns-assets/response-event-based-gateway.png)

We typically try to avoid the event-based gateway, as it is hard to understand for non-BPMN professionals. At the same time, it shares the downside of the first pattern with the decision gateway after the receive task: the happy path cannot be easily spotted.

As a fourth possibility, you can add event subprocesses, which get activated whenever some event is received while the process is still active in some other area. In the above example, you could model the happy path and model all deviations as event subprocesses.

![Event subprocess to capture different response messages](service-integration-patterns-assets/response-event-subprocess.png)

This pattern is pretty handy, but also needs some explanation to people new to BPMN. It has one downside you need to know: once your process instance moves to the subprocess, you can’t easily go back to the typical flow. To some extent this problem can be solved by advanced modeling patterns like shown in the [allow for order cancellation anytime](../../modeling/building-flexibility-into-bpmn-models/#allow-for-order-cancellation-any-time) example.

At the same time, the event subprocess has a superpower worth mentioning: you can now wait for cancellation messages in whole chunks of your process — it could arrive anytime.

|                   | Receive task with boundary events                                                                     | Payload and XOR-gateway                                                                   | Event-based gateway                                                                          | Event subprocess                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
|                   | ![Boundary Events](service-integration-patterns-assets/response-boundary-message-events.png)          | ![XOR Gateway](service-integration-patterns-assets/response-gateway.png)                  | ![Event-based Gateway](service-integration-patterns-assets/response-event-based-gateway.png) | ![Event Subprocess](service-integration-patterns-assets/response-event-subprocess.png) |
| Understandability | Easy                                                                                                  | Very easy                                                                                 | Hard                                                                                         | Medium                                                                                 |
| Assessment        | Limitation on how many message types are possible                                                     | Happy path not easily visible                                                             |                                                                                              | Might need some explanation for readers of the model                                   |
| Recommendation    | Use when it is important to observe message types in the visual, limit to two boundary message events | Use when there are more response types or if the response type can be treated as a result | Try to avoid                                                                                 | Use if you need bigger scopes where you can react to events                            |
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/extensions-integrations/ext-service-integration-patterns-159.json** and nothing else.
2. The id MUST be `ext-service-integration-patterns-159`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/best-practices/development/service-integration-patterns/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".
