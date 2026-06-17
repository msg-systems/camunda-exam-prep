# Authoring task: con-rest-20

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/connectors/con-rest-20.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `con-rest-20` (use exactly this id)
- **topic**: `connectors`
- **difficulty**: `medium`
- **style**: `scenario`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/connectors/protocol/rest/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): "Error handling"

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
  "id": "con-rest-feel-map-headers",
  "topic": "connectors",
  "subtopic": "REST connector",
  "difficulty": "easy",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Beacon Energy, a utility provider with 400000 customers, configures a Camunda 8.8 REST connector to call a billing API requiring 3 HTTP headers: Authorization (Bearer token), X-Tenant-Id (process variable tenantId), and Accept (literal application/json) for every customer-balance query.",
  "question": "Which HTTP Headers field value is the documented format?",
  "options": [
    { "id": "a", "text": "= { Authorization: \"Bearer {{secrets.BILLING_TOKEN}}\", \"X-Tenant-Id\": tenantId, Accept: \"application/json\" } as a FEEL context map" },
    { "id": "b", "text": "Authorization: Bearer {{secrets.BILLING_TOKEN}}; X-Tenant-Id: tenantId; Accept: application/json as a semicolon-separated plain-text header list" },
    { "id": "c", "text": "[ \"Authorization=Bearer {{secrets.BILLING_TOKEN}}\", \"X-Tenant-Id=tenantId\", \"Accept=application/json\" ] as a FEEL list of key-value strings" },
    { "id": "d", "text": "= { headers: [ { name: \"Authorization\", value: \"Bearer {{secrets.BILLING_TOKEN}}\" } ] } as a nested context with a headers list inside" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. HTTP Headers in the REST connector accept a FEEL context (map) where keys are header names and values are FEEL expressions or quoted strings including secrets." },
    "b": { "text": "Incorrect. The field expects a FEEL context value, not a semicolon-separated plain-text string, and secrets must be quoted inside FEEL." },
    "c": { "text": "Incorrect. The format is a map, not a list of equal-delimited strings; the connector does not parse that shape into header pairs." },
    "d": { "text": "Incorrect. The connector reads the headers from the field's direct map; there is no nested headers list inside another context object." }
  },
  "explanation": "The REST connector Query parameters and HTTP Headers fields are configured using the FEEL context (map) data type. Each entry maps a header name to a FEEL expression or quoted string.",
  "docs": [
    { "title": "REST connector - HTTP Headers", "url": "https://docs.camunda.io/docs/components/connectors/protocol/rest/" }
  ]
}
```

**Exemplar 2** (from authored pool):

```json
{
  "id": "con-bpmn-error-vs-job-error",
  "topic": "connectors",
  "subtopic": "error expression",
  "difficulty": "medium",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Pinnacle Retail, a marketplace handling 90000 orders per day, calls a tax-rate REST API from Camunda 8.8. When the API returns HTTP 404, the order is a business case that must route to a manual-review user task via a boundary error event; when it returns HTTP 504, the call should fail the job with 2 retries and a 30 second backoff.",
  "question": "Which Error Expression correctly distinguishes these two outcomes?",
  "options": [
    { "id": "a", "text": "Return bpmnError(\"404\", \"not found\") for code 404 and jobError(\"gateway timeout\", {}, job.retries - 1, @\"PT30S\") for code 504 from a single FEEL expression" },
    { "id": "b", "text": "Return bpmnError(\"504\", \"timeout\") for code 504 and ignoreError() for code 404 so the workflow continues with no boundary handling needed" },
    { "id": "c", "text": "Throw a ConnectorException with code 404 and a different ConnectorException with code 504 directly from the FEEL Error Expression in the modeler properties panel" },
    { "id": "d", "text": "Use jobError for both codes and rely on the boundary event configuration on the BPMN element to differentiate the 2 outcomes at runtime" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. The bpmnError function triggers a BPMN error event for business outcomes, and jobError fails the job with custom retries and an ISO 8601 retry backoff for transient technical failures." },
    "b": { "text": "Incorrect. The 404 case is the business outcome that must route to manual review, so it requires bpmnError, not ignoreError, which would complete the job silently." },
    "c": { "text": "Incorrect. FEEL Error Expressions cannot throw Java exceptions directly; they return BPMN error or job error contexts via the provided helper functions." },
    "d": { "text": "Incorrect. jobError for both eliminates the boundary-event routing entirely and merges a business outcome with a transient technical failure." }
  },
  "explanation": "Error Expression uses bpmnError to raise BPMN errors for business outcomes that boundary events should catch, and jobError to fail the job with optional retries and an ISO 8601 retry backoff for transient failures.",
  "docs": [
    { "title": "How to use connectors - BPMN errors and failing jobs", "url": "https://docs.camunda.io/docs/components/connectors/use-connectors/" }
  ]
}
```

### Source chunk — ALL facts in your answer must trace back to this content

**File**: `pipeline/sources/connectors/rest.md`
**Public URL**: https://docs.camunda.io/docs/components/connectors/protocol/rest/
**Section heading**: Error handling

```markdown
## Error handling

If an error occurs, the connector throws an error and includes the error response in the `error` variable in Operate. Click on the REST connector in Operate to see this variable.

The following example shows the `error` variable in an error response:

```json
{
  "code": "400",
  "variables": {
    "response": {
      "headers": {
        "Content-Length": "70",
        "Date": "Thu, 17 Oct 2024 09:31:51 GMT",
        "Content-Type": "application/json"
      },
      "body": {
        "temperature": 36,
        "message": "My custom error message",
        "booleanField": true
      }
    }
  },
  "message": "Bad Request",
  "type": "io.camunda.connector.api.error.ConnectorException"
}
```

You can handle this error using an Error Boundary Event and the following error expression:

```json
if matches(error.code, "400") and error.variables.response.body.temp = 36
then bpmnError("Too hot", error.variables.response.body.message, error.variables.response.body)
else null
```

In this example, passing `error.variables.response.body` as the third argument to the `bpmnError` function allows you to pass additional information about the error to the error boundary event. For example, the `message`, `temperature` and `booleanField` fields from the error response are passed to the error boundary event.
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/connectors/con-rest-20.json** and nothing else.
2. The id MUST be `con-rest-20`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/connectors/protocol/rest/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".


<!-- LINT REWORK -->

### Lint feedback from previous attempt

Your previous output failed these strict lints. Fix every one of them and rewrite the JSON file:

- [scenario-missing-measurable] scenario lacks a number/currency/duration anchor @ scenario

Overwrite `pipeline/generation/outputs/connectors/con-rest-20.json` with a corrected JSON document and stop.
