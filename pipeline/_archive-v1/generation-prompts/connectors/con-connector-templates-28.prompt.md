# Authoring task: con-connector-templates-28

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/connectors/con-connector-templates-28.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `con-connector-templates-28` (use exactly this id)
- **topic**: `connectors`
- **difficulty**: `medium`
- **style**: `recall`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-templates/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): "Inbound boundary event connector templates"

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

**File**: `pipeline/sources/connectors/connector-templates.md`
**Public URL**: https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-templates/
**Section heading**: Inbound boundary event connector templates

```markdown
## Inbound boundary event connector templates

You can, for example, allow the user to model and configure the following **HTTP webhook connector** for boundary events by providing
a simple JSON configuration:

<Tabs groupId="connectorTemplateInbound" defaultValue="process" values={
[
{label: 'Process modeling view', value: 'process' },
{label: 'Connector template configuration', value: 'json' }
]
}>

<TabItem value='process'>

![Webhook Inbound boundary connector Example.png](img/custom-connector-template-inbound-boundary.png)

</TabItem>

<TabItem value='json'>

```json
{
  "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
  "name": "Webhook Boundary Event connector",
  "id": "io.camunda.connectors.webhook.WebhookConnectorBoundary.v1",
  "description": "Configure webhook to receive callbacks",
  "documentationRef": "https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/http-webhook/",
  "version": 11,
  "category": {
    "id": "connectors",
    "name": "Connectors"
  },
  "appliesTo": ["bpmn:BoundaryEvent"],
  "elementType": {
    "value": "bpmn:BoundaryEvent",
    "eventDefinition": "bpmn:MessageEventDefinition"
  },
  "groups": [
    {
      "id": "endpoint",
      "label": "Webhook configuration"
    },
    {
      "id": "authentication",
      "label": "Authentication"
    },
    {
      "id": "authorization",
      "label": "Authorization"
    },
    {
      "id": "webhookResponse",
      "label": "Webhook response"
    },
    {
      "id": "activation",
      "label": "Activation"
    },
    {
      "id": "correlation",
      "label": "Correlation",
      "tooltip": "Learn more about message correlation in the <a href=\"https://docs.camunda.io/docs/components/concepts/messages/#message-correlation-overview\">documentation</a>."
    },
    {
      "id": "output",
      "label": "Output mapping"
    }
  ],
  "properties": [
    {
      "value": "io.camunda:webhook:1",
      "binding": {
        "name": "inbound.type",
        "type": "zeebe:property"
      },
      "type": "Hidden"
    },
    {
      "id": "inbound.method",
      "label": "Webhook method",
      "description": "Select HTTP method",
      "optional": false,
      "value": "any",
      "group": "endpoint",
      "binding": {
        "name": "inbound.method",
        "type": "zeebe:property"
      },
      "type": "Dropdown",
      "choices": [
        {
          "name": "Any",
          "value": "any"
        },
        {
          "name": "GET",
          "value": "get"
        },
        {
          "name": "POST",
          "value": "post"
        },
        {
          "name": "PUT",
          "value": "put"
        },
        {
          "name": "DELETE",
          "value": "delete"
        }
      ]
    },
    {
      "id": "inbound.context",
      "label": "Webhook ID",
      "description": "The webhook ID is a part of the URL",
      "optional": false,
      "constraints": {
        "notEmpty": true,
        "pattern": {
          "value": "^[a-zA-Z0-9]+([-_][a-zA-Z0-9]+)*$",
          "message": "can only contain letters, numbers, or single underscores/hyphens and cannot begin or end with an underscore/hyphen"
        }
      },
      "group": "endpoint",
      "binding": {
        "name": "inbound.context",
        "type": "zeebe:property"
      },
      "type": "String"
    },
    {
      "id": "inbound.shouldValidateHmac",
      "label": "HMAC authentication",
      "description": "Choose whether HMAC verification is enabled. <a href='https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/http-webhook/#make-your-http-webhook-connector-for-receiving-messages-executable' target='_blank'>See documentation</a> and <a href='https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/http-webhook/#example' target='_blank'>example</a> that explains how to use HMAC-related fields",
      "optional": false,
      "value": "disabled",
      "group": "authentication",
      "binding": {
        "name": "inbound.shouldValidateHmac",
        "type": "zeebe:property"
      },
      "type": "Dropdown",
      "choices": [
        {
          "name": "Enabled",
          "value": "enabled"
        },
        {
          "name": "Disabled",
          "value": "disabled"
        }
      ]
    },
    {
      "id": "inbound.hmacSecret",
      "label": "HMAC secret key",
      "description": "Shared secret key",
      "optional": true,
      "feel": "optional",
      "group": "authentication",
      "binding": {
        "name": "inbound.hmacSecret",
        "type": "zeebe:property"
      },
      "condition": {
        "property": "inbound.shouldValidateHmac",
        "equals": "enabled",
        "type": "simple"
      },
      "type": "String"
    },
    {
      "id": "inbound.hmacHeader",
      "label": "HMAC header",
      "description": "Name of header attribute that will contain the HMAC value",
      "optional": true,
      "feel": "optional",
      "group": "authentication",
      "binding": {
        "name": "inbound.hmacHeader",
        "type": "zeebe:property"
      },
      "condition": {
        "property": "inbound.shouldValidateHmac",
        "equals": "enabled",
        "type": "simple"
      },
      "type": "String"
    },
    {
      "id": "inbound.hmacAlgorithm",
      "label": "HMAC algorithm",
      "description": "Choose HMAC algorithm",
      "optional": false,
      "value": "sha_256",
      "group": "authentication",
      "binding": {
        "name": "inbound.hmacAlgorithm",
        "type": "zeebe:property"
      },
      "condition": {
        "property": "inbound.shouldValidateHmac",
        "equals": "enabled",
        "type": "simple"
      },
      "type": "Dropdown",
      "choices": [
        {
          "name": "SHA-1",
          "value": "sha_1"
        },
        {
          "name": "SHA-256",
          "value": "sha_256"
        },
        {
          "name": "SHA-512",
          "value": "sha_512"
        }
      ]
    },
    {
      "id": "inbound.hmacScopes",
      "label": "HMAC scopes",
      "description": "Set HMAC scopes for calculating signature data. See <a href='https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/http-webhook/' target='_blank'>documentation</a>",
      "optional": true,
      "feel": "required",
      "group": "authentication",
      "binding": {
        "name": "inbound.hmacScopes",
        "type": "zeebe:property"
      },
      "condition": {
        "property": "inbound.shouldValidateHmac",
        "equals": "enabled",
        "type": "simple"
      },
      "type": "String"
    },
    {
      "id": "inbound.auth.type",
      "label": "Authorization type",
      "description": "Choose the authorization type",
      "value": "NONE",
      "group": "authorization",
      "binding": {
        "name": "inbound.auth.type",
        "type": "zeebe:property"
      },
      "type": "Dropdown",
      "choices": [
        {
          "name": "None",
          "value": "NONE"
        },
        {
          "name": "Basic",
          "value": "BASIC"
        },
        {
          "name": "API key",
          "value": "APIKEY"
        },
        {
          "name": "JWT",
          "value": "JWT"
        }
      ]
    },
    {
      "id": "inbound.auth.username",
      "label": "Username",
      "description": "Username for basic authentication",
      "optional": false,
      "feel": "optional",
      "group": "authorization",
      "binding": {
        "name": "inbound.auth.username",
        "type": "zeebe:property"
      },
      "condition": {
        "property": "inbound.auth.type",
        "equals": "BASIC",
        "type": "simple"
      },
      "type": "String"
    },
    {
      "id": "inbound.auth.password",
      "label": "Password",
      "description": "Password for basic authentication",
      "optional": false,
      "feel": "optional",
      "group": "authorization",
      "binding": {
        "name": "inbound.auth.password",
        "type": "zeebe:property"
      },
      "condition": {
        "property": "inbound.auth.type",
        "equals": "BASIC",
        "type": "simple"
      },
      "type": "String"
    },
    {
      "id": "inbound.auth.apiKey",
      "label": "API key",
      "description": "Expected API key",
      "optional": false,
      "feel": "optional",
      "group": "authorization",
      "binding": {
        "name": "inbound.auth.apiKey",
        "type": "zeebe:property"
      },
      "condition": {
        "property": "inbound.auth.type",
        "equals": "APIKEY",
        "type": "simple"
      },
      "type": "String"
    },
    {
      "id": "inbound.auth.apiKeyLocator",
      "label": "API key locator",
      "description": "A FEEL expression that extracts API key from the request. <a href='https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/http-webhook/#how-to-configure-api-key-authorization'>See documentation</a>",
      "optional": false,
      "value": "=split(request.headers.authorization, \" \")[2]",
      "constraints": {
        "notEmpty": true
      },
      "feel": "required",
      "group": "authorization",
      "binding": {
        "name": "inbound.auth.apiKeyLocator",
        "type": "zeebe:property"
      },
      "condition": {
        "property": "inbound.auth.type",
        "equals": "APIKEY",
        "type": "simple"
      },
      "type": "String"
    },
    {
      "id": "inbound.auth.jwt.jwkUrl",
      "label": "JWK URL",
      "description": "Well-known URL of JWKs",
      "optional": false,
      "feel": "optional",
      "group": "authorization",
      "binding": {
        "name": "inbound.auth.jwt.jwkUrl",
        "type": "zeebe:property"
      },
      "condition": {
        "property": "inbound.auth.type",
        "equals": "JWT",
        "type": "simple"
      },
      "type": "String"
    },
    {
      "id": "inbound.auth.jwt.permissionsExpression",
      "label": "JWT role property expression",
      "description": "Expression to extract the roles from the JWT token. <a href='https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/http-webhook/#how-to-extract-roles-from-jwt-data'>See documentation</a>",
      "optional": false,
      "feel": "required",
      "group": "authorization",
      "binding": {
        "name": "inbound.auth.jwt.permissionsExpression",
        "type": "zeebe:property"
      },
      "condition": {
        "property": "inbound.auth.type",
        "equals": "JWT",
        "type": "simple"
      },
      "type": "String"
    },
    {
      "id": "inbound.auth.jwt.requiredPermissions",
      "label": "Required roles",
      "description": "List of roles to test JWT roles against",
      "optional": false,
      "feel": "required",
      "group": "authorization",
      "binding": {
        "name": "inbound.auth.jwt.requiredPermissions",
        "type": "zeebe:property"
      },
      "condition": {
        "property": "inbound.auth.type",
        "equals": "JWT",
        "type": "simple"
      },
      "type": "String"
    },
    {
      "id": "inbound.responseExpression",
      "label": "Response expression",
      "description": "Expression used to generate the HTTP response",
      "optional": true,
      "feel": "required",
      "group": "webhookResponse",
      "binding": {
        "name": "inbound.responseExpression",
        "type": "zeebe:property"
      },
      "type": "Text"
    },
    {
      "id": "inbound.verificationExpression",
      "label": "One time verification response expression",
      "description": "Specify condition and response. Learn more in the <a href='https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/#verification-expression' target='_blank'>documentation</a>",
      "optional": true,
      "feel": "required",
      "group": "webhookResponse",
      "binding": {
        "name": "inbound.verificationExpression",
        "type": "zeebe:property"
      },
      "type": "Text"
    },
    {
      "id": "activationCondition",
      "label": "Activation condition",
      "description": "Condition under which the connector triggers. Leave empty to catch all events",
      "optional": true,
      "feel": "required",
      "group": "activation",
      "binding": {
        "name": "activationCondition",
        "type": "zeebe:property"
      },
      "type": "String"
    },
    {
      "id": "consumeUnmatchedEvents",
      "label": "Consume unmatched events",
      "value": true,
      "group": "activation",
      "binding": {
        "name": "consumeUnmatchedEvents",
        "type": "zeebe:property"
      },
      "tooltip": "Unmatched events are rejected by default, allowing the upstream service to handle the error. Check this box to consume unmatched events and return a success response",
      "type": "Boolean"
    },
    {
      "id": "correlationKeyProcess",
      "label": "Correlation key (process)",
      "description": "Sets up the correlation key from process variables",
      "constraints": {
        "notEmpty": true
      },
      "feel": "required",
      "group": "correlation",
      "binding": {
        "name": "correlationKey",
        "type": "bpmn:Message#zeebe:subscription#property"
      },
      "type": "String"
    },
    {
      "id": "correlationKeyPayload",
      "label": "Correlation key (payload)",
      "description": "Extracts the correlation key from the incoming message payload",
      "constraints": {
        "notEmpty": true
      },
      "feel": "required",
      "group": "correlation",
      "binding": {
        "name": "correlationKeyExpression",
        "type": "zeebe:property"
      },
      "type": "String"
    },
    {
      "id": "messageIdExpression",
      "label": "Message ID expression",
      "description": "Expression to extract unique identifier of a message",
      "optional": true,
      "feel": "required",
      "group": "correlation",
      "binding": {
        "name": "messageIdExpression",
        "type": "zeebe:property"
      },
      "type": "String"
    },
    {
      "id": "messageTtl",
      "label": "Message TTL",
      "description": "Time-to-live for the message in the broker (ISO-8601 duration)",
      "optional": true,
      "constraints": {
        "notEmpty": false,
        "pattern": {
          "value": "^(PT.*|)$",
          "message": "must be an ISO-8601 duration"
        }
      },
      "feel": "optional",
      "group": "correlation",
      "binding": {
        "name": "messageTtl",
        "type": "zeebe:property"
      },
      "type": "String"
    },
    {
      "id": "messageNameUuid",
      "generatedValue": {
        "type": "uuid"
      },
      "group": "correlation",
      "binding": {
        "name": "name",
        "type": "bpmn:Message#property"
      },
      "type": "Hidden"
    },
    {
      "id": "resultVariable",
      "label": "Result variable",
      "description": "Name of variable to store the response in",
      "group": "output",
      "binding": {
        "name": "resultVariable",
        "type": "zeebe:property"
      },
      "type": "String"
    },
    {
      "id": "resultExpression",
      "label": "Result expression",
      "description": "Expression to map the response into process variables",
      "feel": "required",
      "group": "output",
      "binding": {
        "name": "resultExpression",
        "type": "zeebe:property"
      },
      "type": "Text"
    }
  ],
  "icon": {
    "contents": "data:image/svg+xml;base64,PHN2ZyBpZD0naWNvbicgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB3aWR0aD0nMTgnIGhlaWdodD0nMTgnIHZpZXdCb3g9JzAgMCAzMiAzMic+CiAgPGRlZnM+CiAgICA8c3R5bGU+LmNscy0xIHsgZmlsbDogbm9uZTsgfTwvc3R5bGU+CiAgPC9kZWZzPgogIDxwYXRoCiAgICBkPSdNMjQsMjZhMywzLDAsMSwwLTIuODE2NC00SDEzdjFhNSw1LDAsMSwxLTUtNVYxNmE3LDcsMCwxLDAsNi45Mjg3LDhoNi4yNTQ5QTIuOTkxNCwyLjk5MTQsMCwwLDAsMjQsMjZaJy8+CiAgPHBhdGgKICAgIGQ9J00yNCwxNmE3LjAyNCw3LjAyNCwwLDAsMC0yLjU3LjQ4NzNsLTMuMTY1Ni01LjUzOTVhMy4wNDY5LDMuMDQ2OSwwLDEsMC0xLjczMjYuOTk4NWw0LjExODksNy4yMDg1Ljg2ODYtLjQ5NzZhNS4wMDA2LDUuMDAwNiwwLDEsMS0xLjg1MSw2Ljg0MThMMTcuOTM3LDI2LjUwMUE3LjAwMDUsNy4wMDA1LDAsMSwwLDI0LDE2WicvPgogIDxwYXRoCiAgICBkPSdNOC41MzIsMjAuMDUzN2EzLjAzLDMuMDMsMCwxLDAsMS43MzI2Ljk5ODVDMTEuNzQsMTguNDcsMTMuODYsMTQuNzYwNywxMy44OSwxNC43MDhsLjQ5NzYtLjg2ODItLjg2NzctLjQ5N2E1LDUsMCwxLDEsNi44MTItMS44NDM4bDEuNzMxNSwxLjAwMmE3LjAwMDgsNy4wMDA4LDAsMSwwLTEwLjM0NjIsMi4wMzU2Yy0uNDU3Ljc0MjctMS4xMDIxLDEuODcxNi0yLjA3MzcsMy41NzI4WicvPgogIDxyZWN0IGlkPSdfVHJhbnNwYXJlbnRfUmVjdGFuZ2xlXycgZGF0YS1uYW1lPScmbHQ7VHJhbnNwYXJlbnQgUmVjdGFuZ2xlJmd0OycgY2xhc3M9J2Nscy0xJwogICAgd2lkdGg9JzMyJyBoZWlnaHQ9JzMyJy8+Cjwvc3ZnPg=="
  }
}
```

</TabItem>

</Tabs>
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/connectors/con-connector-templates-28.json** and nothing else.
2. The id MUST be `con-connector-templates-28`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-templates/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".
