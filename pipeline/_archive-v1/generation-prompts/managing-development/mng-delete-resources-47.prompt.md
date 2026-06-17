# Authoring task: mng-delete-resources-47

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/managing-development/mng-delete-resources-47.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `mng-delete-resources-47` (use exactly this id)
- **topic**: `managing-development`
- **difficulty**: `hard`
- **style**: `scenario`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/operate/userguide/delete-resources/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): "Delete process definition from Processes page"

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
  "id": "mgmt-deploy-via-web-modeler",
  "topic": "managing-development",
  "subtopic": "Web Modeler",
  "difficulty": "easy",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Junction Retail prepares 4 BPMN releases per week for 7000 orders per day in Camunda 8.8 SaaS. The team uses Web Modeler hosted by Camunda and wants to push the file from Web Modeler to the target cluster without using a local CLI or building a Maven artifact first.",
  "question": "Which Web Modeler capability ships the BPMN file to the cluster directly from the browser?",
  "options": [
    { "id": "a", "text": "Web Modeler's deploy button publishes the BPMN file directly to the connected cluster using the operator's signed-in credentials" },
    { "id": "b", "text": "Web Modeler's deploy button generates a deployment YAML file that the operator must apply manually via kubectl to the cluster" },
    { "id": "c", "text": "Web Modeler's deploy button creates a pull request on a connected GitHub repository, where a CI pipeline then deploys the file to the cluster" },
    { "id": "d", "text": "Web Modeler does not deploy directly; the BPMN file must be downloaded and pushed with zbctl from the operator's local development machine" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. Web Modeler exposes a deploy action that pushes the BPMN file (and any linked forms or DMN files) directly to a connected cluster from the browser." },
    "b": { "text": "Incorrect. Web Modeler does not generate Kubernetes YAML; deployment in Camunda 8 uses the Zeebe deployment API directly." },
    "c": { "text": "Incorrect. There is no built-in pull-request integration; Web Modeler deploys to the cluster through the engine API directly." },
    "d": { "text": "Incorrect. Direct deployment from Web Modeler is supported; downloading and using zbctl is one valid alternative but not the only one." }
  },
  "explanation": "Web Modeler can deploy BPMN, DMN, and Form files directly to a connected cluster through the engine API from the browser using the signed-in user's credentials.",
  "docs": [
    { "title": "Web Modeler deployments", "url": "https://docs.camunda.io/docs/components/modeler/web-modeler/run-or-publish-your-process/" }
  ]
}
```

**Exemplar 2** (from authored pool):

```json
{
  "id": "mgmt-business-key-vs-instance-key",
  "topic": "managing-development",
  "subtopic": "Operate",
  "difficulty": "medium",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Pinnacle Marketplace runs Camunda 8.8 with 24000 orders per day. Operators search the process-instance list view by a human-readable order id like ORD-2026-00012345, while internal tooling needs the broker-generated identifier for cross-component joins across the cluster.",
  "question": "Which two identifier fields support these two access patterns on a process instance in Camunda 8?",
  "options": [
    { "id": "a", "text": "The bpmnProcessId-scoped business key is searchable in Operate, and the broker-generated process instance key is unique across the cluster" },
    { "id": "b", "text": "The bpmnProcessId itself is the human-readable key in Operate, and the process definition key is the broker-generated id for cross-component joins" },
    { "id": "c", "text": "The process instance key is the human-readable id in Operate, and the business key is the broker-generated id for cross-component joins" },
    { "id": "d", "text": "The deployment id is the human-readable id in Operate, and the process instance key is the broker-generated id for cross-component joins" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. Camunda 8 uses a process instance key generated by the broker and an optional human-supplied business key; Operate searches both fields." },
    "b": { "text": "Incorrect. bpmnProcessId names the process definition; it is shared across every instance and not a per-instance identifier." },
    "c": { "text": "Incorrect. The process instance key is the broker-generated id, not the human-readable one; business key is the human-supplied field." },
    "d": { "text": "Incorrect. Deployment id identifies a deployment batch, not a process instance; the per-instance broker id is the process instance key." }
  },
  "explanation": "Camunda 8 supports a human-supplied business key and a broker-generated process instance key; Operate exposes both as searchable fields on the instance.",
  "docs": [
    { "title": "Process instance keys", "url": "https://docs.camunda.io/docs/components/concepts/process-instance-creation/" }
  ]
}
```

### Source chunk — ALL facts in your answer must trace back to this content

**File**: `pipeline/sources/managing-development/delete-resources.md`
**Public URL**: https://docs.camunda.io/docs/components/operate/userguide/delete-resources/
**Section heading**: Delete process definition from Processes page

```markdown
## Delete process definition from Processes page

To delete a process definition from the **Processes** page, take the following steps:

1. On the **Processes** page, select a specific process version by filtering by process name and version.

![operate-view-process-filters](./img/delete-resources/process-filters.png)

:::note
Make sure the selected process definition version has no running instances, otherwise it is not possible to delete a process definition.
You can [cancel or resolve running process instances](/components/operate/userguide/basic-operate-navigation.md) from the process instances list or from the process instance detail page.
:::

2. Click the **Delete** button at the top right.

![operate-perform-delete-button-click](./img/delete-resources/process-button.png)

3. Confirm the delete operation by checking the checkbox and clicking **Delete**.

![operate-confirm-delete-operation](./img/delete-resources/process-modal.png)

:::note
Deleting a process definition will permanently remove it and will impact the following:

- All the deleted process definition's finished process instances will be deleted from the application.
- All decision and process instances referenced by the deleted process instances will be deleted.
- If a process definition contains user tasks, they will be deleted from [Tasklist](/components/tasklist/introduction-to-tasklist.md).

:::

4. The progress of the delete operation can be seen in the **Operations** panel on the right side of the screen.

![operate-view-operations-panel](./img/delete-resources/process-operations-panel.png)
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/managing-development/mng-delete-resources-47.json** and nothing else.
2. The id MUST be `mng-delete-resources-47`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/operate/userguide/delete-resources/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".


<!-- LINT REWORK -->

### Lint feedback from previous attempt

Your previous output failed these strict lints. Fix every one of them and rewrite the JSON file:

- [scenario-missing-measurable] scenario lacks a number/currency/duration anchor @ scenario

Overwrite `pipeline/generation/outputs/managing-development/mng-delete-resources-47.json` with a corrected JSON document and stop.
