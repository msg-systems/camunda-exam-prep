# Authoring task: ext-service-integration-patterns-94

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/extensions-integrations/ext-service-integration-patterns-94.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `ext-service-integration-patterns-94` (use exactly this id)
- **topic**: `extensions-integrations`
- **difficulty**: `easy`
- **style**: `scenario`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/best-practices/development/service-integration-patterns/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): "Service task vs. send/receive task combo"

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
**Section heading**: Service task vs. send/receive task combo

```markdown
### Service task vs. send/receive task combo

For asynchronous request/response calls, you can use a send task for the request, and a following receive task to wait for the response:

![Send and receive task](service-integration-patterns-assets/send-and-receive-task.png)

You can also use a service task, which is sometimes unknown even to advanced users. A service task can technically wait for a response that happens at any time, a process instance will wait in the service task, as it would in the receive task.

![Service task](service-integration-patterns-assets/service-task.png)

Deciding between these options is not completely straightforward. You can find a table listing the decision criteria below.

As a general rule-of-thumb, we recommend using **the service task as the default option for synchronous _and_ asynchronous request/response** calls. The beauty of service tasks is that you remove visual clutter from the diagram, which makes it easier to read for most stakeholders.

This is ideal if the business problem requires a logically synchronous service invocation. It allows you to ignore the technical details about the protocol on the process model level.

The typical counter-argument is that asynchronous technical protocols might lead to different failure scenarios that you have to care about. For example, when using a separate receive task, readers of the diagram almost immediately start to think about what happens if the response will not be received. But this also has the drawback that now business people might start discussing technical concerns, which is not necessarily good.

Furthermore, this is a questionable argument, as synchronous REST service calls could also timeout. This is exactly the same situation, just hidden deeper in network abstraction layers, as every form of remote communication uses asynchronous messaging somewhere down in the network stack. On a technical level, you should always think about these failure scenarios. The talk [3 common pitfalls in microservice integration and how to avoid them](https://blog.bernd-ruecker.com/3-common-pitfalls-in-microservice-integration-and-how-to-avoid-them-3f27a442cd07) goes into more detail on this.

On a business level, you should be aware of the business implications of technical failures, but not discuss or model all the nuts and bolts around it.

However, there are also technical implications of this design choice that need to be considered.

**Technical implications of using service tasks**

You can keep a service task open and just complete it later when the response arrives, but in **to complete the service task, you need the _job instance key_** from Zeebe. This is an internal ID from the workflow engine. You can either:

- Pass it around to the third party service which sends it back as part of the response message.
- Build some kind of lookup table, where you map your own correlation information to the right job key.

:::note
Later versions of Zeebe might provide query possibilities for this job key based on user controlled data, which might open up more possibilities.
:::

Using workflow engine internal IDs can lead to problems. For example, you might cancel and restart a process instance because of operational failures, which can lead to a new ID. Outstanding responses cannot be correlated anymore in such instances.

Or, you might run multiple workflow engines which can lead to internal IDs only being unique within one workflow engine. All of this might not happen, but the nature of an internal ID is that it is internal and you have no control over it — which bears some risk.

In practice, however, using the internal job instance key is not a big problem if you get responses in very short time frames (milliseconds). Whenever you have more long-running interactions, you should consider using send and receive tasks, or build your own lookup table that can also address the problems mentioned above.

This is also balanced by the fact that service tasks are simply very handy. The concept is by far the easiest way to implement asynchronous request/response communication. The job instance key is generated for you and unique for every message interchange. You don’t have to think about race conditions or idempotency constraints yourself. [Timeout handling and retry logic](/components/concepts/job-workers.md#timeouts) is built into the service task implementation of Zeebe. There is also [a clear API to let the workflow engine know of technical or business errors](/components/concepts/job-workers.md#completing-or-failing-jobs).

**Technical implications of using send and receive tasks**

Using send and receive tasks means to use [the message concept built into Zeebe](/components/concepts/messages.md). This is a powerful concept to solve a lot of problems around cardinalities of subscriptions, correlation of the message to the right process instances, and verification of uniqueness of the message (idempotency).

When using messages, you need to provide the correlation ID yourself. This means that the correlation ID is fully under your control, but it also means that you need to generate it yourself and make sure it is unique. You will most likely end up with generated UUIDs.

You can leverage [message buffering](/components/concepts/messages.md#message-buffering) capabilities, which means that the process does not yet need to be ready to receive the message. You could, for example, do other things in between, but this also means that you will not get an exception right away if a message cannot be correlated, as it is simply buffered. This leaves you in charge of dealing with messages that can never be delivered.

Retries are not built-in, so if you need to model a loop to retry the initial service call if no response is received. And (at least in the current Zeebe version), there is no possibility to trigger error events for a receive task, which means you need to model error messages as response payload or separate message types — both are discussed later in this post.

A final note for high-performance environments: These powerful messaging capabilities do not come for free and require some overhead within the engine. For pure request/response calls that return within milliseconds, none of the features are truly required. If you are looking to build a high-performance scenario, using service tasks instead of message correlation for request/response calls, you can tune your overall performance or throughput. However, as with everything performance related, the devil is in the detail, so [reach out to us](/reference/contact.md) to discuss such a scenario in more depth.

**Summary And recommendations**

The following table summarizes the possibilities and recommendations.

| Case                   | Synchronous request/response                                                                                                | Synchronous request/response                                                                                          | Asynchronous request/response                                                                                                                                                                        | Asynchronous request/response                                                                                                                                                                     |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| BPMN element           | Service task                                                                                                                | Send task                                                                                                             | Service task                                                                                                                                                                                         | Send + receive task                                                                                                                                                                               |
|                        | ![Service task](/img/bpmn-elements/task-service.svg)                                                                        | ![Send task](/img/bpmn-elements/task-send.svg)                                                                        | ![Service task](/img/bpmn-elements/task-service.svg)                                                                                                                                                 | ![Send and receive task](/img/bpmn-elements/send-and-receive-task.png)                                                                                                                            |
| Technical implications |                                                                                                                             | Behaves like a service task                                                                                           | A unique correlation ID is generated for you. You don’t have to think about race conditions or idempotency. Timeout handling and retry logic are built-in. API to flag business or technical errors. | Correlation ID needs to be generated yourself, but is fully under control. Message buffering is possible but also necessary. Timeouts and retries need to be modeled. BPMN errors cannot be used. |
| Assessment             | Very intuitive.                                                                                                             | Might be more intuitive for fire and forget semantics, but can also lead to discussions.                              | Removes visual noise which helps stakeholders to concentrate on core business logic, but requires use of internal job instance keys.                                                                 | More visual clutter, but also more powerful options around correlation and modeling patterns.                                                                                                     |
| Recommendation         | Default option, use unless it is confusing for business stakeholders (e.g. because of fire and forget semantics of a task). | Use for fire and forget semantics, unless it leads to unnecessary discussions, in this case use service task instead. | Use when response is within milliseconds and you can pass the Zeebe-internal job instance key around.                                                                                                | Use when the response will take time (> some seconds), or you need a correlation ID you can control.                                                                                              |
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/extensions-integrations/ext-service-integration-patterns-94.json** and nothing else.
2. The id MUST be `ext-service-integration-patterns-94`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/best-practices/development/service-integration-patterns/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".


<!-- LINT REWORK -->

### Lint feedback from previous attempt

Your previous output failed these strict lints. Fix every one of them and rewrite the JSON file:

- [scenario-missing-measurable] scenario lacks a number/currency/duration anchor @ scenario

Overwrite `pipeline/generation/outputs/extensions-integrations/ext-service-integration-patterns-94.json` with a corrected JSON document and stop.
