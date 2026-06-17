# Authoring task: frm-utilizing-forms-12

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/forms/frm-utilizing-forms-12.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `frm-utilizing-forms-12` (use exactly this id)
- **topic**: `forms`
- **difficulty**: `medium`
- **style**: `scenario`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/modeler/forms/utilizing-forms/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): "Quickstart"

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

**File**: `pipeline/sources/forms/utilizing-forms.md`
**Public URL**: https://docs.camunda.io/docs/components/modeler/forms/utilizing-forms/
**Section heading**: Quickstart

```markdown
## Quickstart

### Create new form

To start building a form, log in to your [Camunda 8](https://camunda.io) account or open [Desktop Modeler](/components/modeler/about-modeler.md) and take the following steps:

1. Navigate to Web Modeler or alternatively open the **File** menu in Desktop Modeler.
2. Open any project from your Web Modeler home view.
3. Click **Create new** and choose **Form**.

### Build your form

Now you can start to build your form by dragging elements from the palette to the canvas, or by using the AI Form Generator at the bottom of the palette. For the purpose of this guide, we'll build a form from scratch.

Right after creating your form, you can name it by replacing the **New Form** text with the name of your choice. In this example, we'll build a form to help with a task in obtaining an email message.

![form email example](./img/form-email-example.png)

Add your desired elements from the palette on the left side by dragging and dropping them onto the canvas.

![form palette](./img/form-palette.png)

Within Forms, we have the option to add text fields, numerical values, checkboxes, radio elements, selection menus, text components, and buttons.

In the properties panel on the right side of the page, view and edit attributes that apply to the selected form element. For example, apply a minimum or maximum length to a text field, or require a minimum or maximum value within a number element. In this case, we have labeled the field, described the field, and required an input for our email message.

![email properties](./img/form-properties-email.png)

Refer to the [camunda forms reference](/components/modeler/forms/camunda-forms-reference.md) to explore all form elements and configuration options in detail.

### Save your form

To save your form in Camunda 8, you don't have to do anything. Web Modeler will autosave every change you make.

### Link your form to a BPMN diagram {#connect-your-form-to-a-bpmn-diagram}

Next, let's implement a task form into a diagram. In tandem, we can link your form to a user task or start event.

Navigate to Modeler and open any project from your Web Modeler home view.

Take the following steps:

1. Select the diagram where you'd like to apply your form.
2. Select the user task requiring the help of a form.
3. On the right side of the selected user task, select the blue overlay with the link icon to open the navigation menu.
4. Navigate to the form you want to link and click the blue **Link** button.
5. When a user task has a linked form, the blue overlay will always stay visible on the right side of the task.

:::note
When using Camunda Forms, any submit button present in the form schema is hidden so we can control when a user can complete a task.
:::

:::tip Improvements for linked forms
With Camunda 8.4, we improved the way you can link forms to BPMN diagrams in Web Modeler:

- Diagrams will always have the latest form updates.
- No need to manually re-link forms or use a JSON configuration.
- Forms will be automatically deployed with the diagram.

See the [form linking reference](/components/modeler/web-modeler/advanced-modeling/form-linking.md#camunda-form-linked) for more details.
:::
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/forms/frm-utilizing-forms-12.json** and nothing else.
2. The id MUST be `frm-utilizing-forms-12`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/modeler/forms/utilizing-forms/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".


<!-- LINT REWORK -->

### Lint feedback from previous attempt

Your previous output failed these strict lints. Fix every one of them and rewrite the JSON file:

- [option-length-ratio] option length ratio 1.44 > 1.4 @ options

Overwrite `pipeline/generation/outputs/forms/frm-utilizing-forms-12.json` with a corrected JSON document and stop.
