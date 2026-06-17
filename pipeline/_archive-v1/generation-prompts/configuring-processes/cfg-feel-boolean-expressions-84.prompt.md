# Authoring task: cfg-feel-boolean-expressions-84

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/configuring-processes/cfg-feel-boolean-expressions-84.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `cfg-feel-boolean-expressions-84` (use exactly this id)
- **topic**: `configuring-processes`
- **difficulty**: `medium`
- **style**: `concept`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-boolean-expressions/`
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

**File**: `pipeline/sources/configuring-processes/feel-boolean-expressions.md`
**Public URL**: https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-boolean-expressions/

```markdown
### Literal

Creates a new boolean value.

```feel
true

false
```

### Comparison

Compares two values with one of the following operators.

Both values must be of the same type. Otherwise, the result is `null`.

<table>
  <tr>
    <th>Operator</th>
    <th>Description</th>
    <th>Supported types</th>
  </tr>

  <tr>
    <td>=</td>
    <td>equal to</td>
    <td>any</td>
  </tr>

  <tr>
    <td>!=</td>
    <td>not equal to</td>
    <td>any</td>
  </tr>

  <tr>
    <td>&lt;</td>
    <td>less than</td>
    <td>number, string, date, time, date-time, duration</td>
  </tr>

  <tr>
    <td>&lt;=</td>
    <td>less than or equal to</td>
    <td>number, string, date, time, date-time, duration</td>
  </tr>

  <tr>
    <td>&gt;</td>
    <td>greater than</td>
    <td>number, string, date, time, date-time, duration</td>
  </tr>

  <tr>
    <td>&gt;=</td>
    <td>greater than or equal</td>
    <td>number, string, date, time, date-time, duration</td>
  </tr>

  <tr>
    <td>between [x] and [y]</td>
    <td>same as (_ &gt;= x and _ &lt;= y)</td>
    <td>number, string, date, time, date-time, duration</td>
  </tr>

</table>

```feel
5 = 5
// true

5 != 5
// false

date("2020-04-05") < date("2020-04-06")
// true

time("08:00:00") <= time("08:00:00")
// true

duration("P1D") > duration("P5D")
// false

duration("P1Y") >= duration("P6M")
// true

5 between 3 and 7
// true

date("2020-04-06") between date("2020-04-05") and date("2020-04-09")
// true
```

:::caution Be Careful!
The equals operator has only **one** equals sign (e.g. `x = y`). In other languages, the operator has two equals signs (e.g. `x == y`).
:::

### Null check

Any value or variable can be compared with `null` to check if it is equal to `null`, or if it exists.

Comparing `null` to a value different from `null` results in `false`. It returns `true` if the
value is `null` or the variable doesn't exist.

Comparing a context entry with `null` results in `true` if the value of the entry is `null` or if
the context doesn't contain an entry with this key.

```feel
null = null
// true

"foo" = null
// false

{x: null}.x = null
// true

{}.y = null
// true
```

### Conjunction/and

Combines multiple boolean values following the ternary logic.

- The result is `true` if all values are `true`.
- The result is `false` if one value is `false`.
- Otherwise, the result is `null` (i.e. if a value is not a boolean.)

```feel
true and true
// true

true and false
// false

true and null
// null

true and "otherwise"
// null

false and null
// false

false and "otherwise"
// false
```

### Disjunction/or

Combines multiple boolean values following the ternary logic.

- The result is `true` if at least one value is `true`.
- The result is `false` if all values are `false`.
- Otherwise, the result is `null` (i.e. if a value is not a boolean.)

```feel
true or false
// true

false or false
// false

true or null
// true

true or "otherwise"
// true

false or null
// null

false or "otherwise"
// null
```

### Instance of

Checks if the value is of the given type. Available type names:

- `boolean`
- `number`
- `string`
- `date`
- `time`
- `date and time`
- `days and time duration`
- `years and months duration`
- `list`
- `context`
- `function`
- `Any`

Use the type `Any` to check if the value is not `null`.

```feel
1 instance of number
// true

1 instance of string
// false

1 instance of Any
// true

null instance of Any
// false

duration("P3M") instance of years and months duration
// true

duration("PT4H") instance of days and time duration
// true
```

### Unary-tests/in

Evaluates a [unary-tests](/components/modeler/feel/language-guide/feel-unary-tests.md) with the given value. The keyword `in` separates the value from the unary-tests.

```feel
5 in (3..7)
// true

date("2021-06-04") in [date("2021-05-01")..date("2021-05-31")]
// false

5 in (3,5,7)
// true

5 in [2,4,6,8]
// false
```
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/configuring-processes/cfg-feel-boolean-expressions-84.json** and nothing else.
2. The id MUST be `cfg-feel-boolean-expressions-84`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-boolean-expressions/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".
