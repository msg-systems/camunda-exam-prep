# Authoring task: frm-forms-element-library-number-29

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/forms/frm-forms-element-library-number-29.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `frm-forms-element-library-number-29` (use exactly this id)
- **topic**: `forms`
- **difficulty**: `medium`
- **style**: `scenario`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library-number/`
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
  "id": "frm-group-path-prefix",
  "topic": "forms",
  "subtopic": "data binding - groups",
  "difficulty": "medium",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Vanta Health, a regional hospital network, processes 2500 admissions per week through Camunda 8.8 Forms. The admission form has a group named Patient with the group path patient.info and a child text field with key age, and the team expects a submission value of 42 to land in the variable patient.info.age within 5 seconds of task completion.",
  "question": "What happens to the resulting variable structure when the form is submitted?",
  "options": [
    { "id": "a", "text": "The runtime prefixes the field key with the group path, producing the nested variable patient.info.age set to 42 on submission" },
    { "id": "b", "text": "The runtime ignores the group path because only top-level keys are supported, producing a single variable named age set to 42" },
    { "id": "c", "text": "The runtime concatenates the group label and the field key with an underscore, producing a variable named Patient_age on submission" },
    { "id": "d", "text": "The runtime requires the developer to repeat patient.info.age inside the child field key for the nested structure to materialise" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. A group's path acts as a prefix to the key of each child field, so patient.info plus age produces patient.info.age on submission." },
    "b": { "text": "Incorrect. The group path is the documented mechanism to extend keys; the runtime does not ignore it for top-level outputs." },
    "c": { "text": "Incorrect. The group label is presentation only and does not influence how the submitted variable is named or nested." },
    "d": { "text": "Incorrect. Repeating the path on each child field would defeat the purpose of group path extension and is not required." }
  },
  "explanation": "When a group has a path set, that path acts as a prefix for the key of every child field, producing the corresponding nested structure on submission without any duplication.",
  "docs": [
    { "title": "Forms data binding - path extension via groups", "url": "https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-data-binding/" }
  ]
}
```

**Exemplar 2** (from authored pool):

```json
{
  "id": "frm-dynamic-list-array-output",
  "topic": "forms",
  "subtopic": "data binding - dynamic list",
  "difficulty": "hard",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Meridian Logistics processes 12000 shipments per month, each handled by up to 5 contracted carriers. The Camunda 8.8 form uses a dynamic list with path contacts and two child fields, name and phone, so each row collects one carrier and the submission must produce an array of objects under contacts that downstream FEEL can iterate within 30 seconds.",
  "question": "Which output structure does the dynamic list produce on submission?",
  "options": [
    { "id": "a", "text": "An array of objects under contacts where each object contains the child field keys name and phone for one row of the list" },
    { "id": "b", "text": "An object under contacts whose keys are the index numbers and whose values hold the name and phone for that row" },
    { "id": "c", "text": "A flat list of variables named contacts.0.name, contacts.0.phone, contacts.1.name, and so on, one variable per cell" },
    { "id": "d", "text": "A single concatenated string under contacts that joins each row with a comma and each cell with a colon for downstream parsing" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. Dynamic lists are bound to arrays and output an array of objects under the list's path, with each object using the child field keys." },
    "b": { "text": "Incorrect. The list output is a JSON array, not an object keyed by row index, so downstream FEEL can use list-comprehension expressions directly." },
    "c": { "text": "Incorrect. Dotted-index variables are not how the dynamic list serialises rows; it emits a proper array of objects." },
    "d": { "text": "Incorrect. The form runtime does not collapse rows into a string; structured array output is exactly what dynamic lists are designed to produce." }
  },
  "explanation": "Dynamic lists output an array of objects under the list's path. Each object is built from the child field keys for that row, which is what downstream FEEL list operations expect.",
  "docs": [
    { "title": "Forms data binding - dynamic lists", "url": "https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-data-binding/" }
  ]
}
```

### Source chunk — ALL facts in your answer must trace back to this content

**File**: `pipeline/sources/forms/forms-element-library-number.md`
**Public URL**: https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library-number/

```markdown
A number field allowing the user to read and edit numeric data.

<img src="/img/form-icons/form-number.svg" alt="Form Number Symbol" />

### Configurable properties

- **Field label**: Label displayed on top of the number field. Can either be an [expression](../../feel/language-guide/feel-expressions-introduction.md), plain text, or [templating syntax](../configuration/forms-config-templating-syntax.md).
- **Field description**: Description provided below the number field. Can either be an [expression](../../feel/language-guide/feel-expressions-introduction.md), plain text, or [templating syntax](../configuration/forms-config-templating-syntax.md).
- **Key**: Binds the field to a form variable, refer to [data binding docs](../configuration/forms-config-data-binding.md).
- **Default value**: Provides a default value for the number field in case no input data exists for the given key.
- **Decimal digits**: Defines the maximum number of digits after the decimal.
- **Increment**: Defines the increment between valid field values.
- **Read only**: Makes the number field read-only, meaning the user can't change but only read its state. Can be dynamically set using an [expression](../../feel/language-guide/feel-expressions-introduction.md).
- **Disabled**: Disables the number field, for use during development.
- **Hide if**: [Expression](../../feel/language-guide/feel-expressions-introduction.md) to hide the number.
- **Columns**: Space the field will use inside its row. **Auto** means it will automatically adjust to available space in the row. Read more about the underlying grid layout in the [Carbon Grid documentation](https://carbondesignsystem.com/elements/2x-grid/overview/).
- **Serialize to string**: Configures the output format of the datetime value. This enables unlimited precision digits.
- **Validation**: Given that one of the following properties is set, the form will only submit when the respective condition is fulfilled. Otherwise, a validation error will be displayed.
  - **Required**: Number field must contain a value.
  - **Minimum**: Number field value must be at least `n`. Can either be an [expression](../../feel/language-guide/feel-expressions-introduction.md) or a number.
  - **Maximum**: Number field value must be no larger than `n`. Can either be an [expression](../../feel/language-guide/feel-expressions-introduction.md) or a number.
- **Appearance**: Changes the visual appearance of the number field.
  - **Prefix**: Adds an appendage before the input. Can either be an [expression](../../feel/language-guide/feel-expressions-introduction.md), plain text, or [templating syntax](../configuration/forms-config-templating-syntax.md).
  - **Suffix**: Adds an appendage after the input. Can either be an [expression](../../feel/language-guide/feel-expressions-introduction.md), plain text, or [templating syntax](../configuration/forms-config-templating-syntax.md).

### Datatypes

Number can be bound to numeric data, or `strings` which can be parsed to numeric data (as per [JavaScript's tryParse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt)), but will always output strictly `integer` data.
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/forms/frm-forms-element-library-number-29.json** and nothing else.
2. The id MUST be `frm-forms-element-library-number-29`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library-number/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".
