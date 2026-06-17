# Authoring task: dec-decision-table-hit-policy-27

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/decisions-business-rules/dec-decision-table-hit-policy-27.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `dec-decision-table-hit-policy-27` (use exactly this id)
- **topic**: `decisions-business-rules`
- **difficulty**: `hard`
- **style**: `scenario`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): "Unique"

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
  "id": "dec-collect-no-aggregator",
  "topic": "decisions-business-rules",
  "subtopic": "hit policy",
  "difficulty": "medium",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Catalyst Logistics built a DMN table in Camunda 8.8 that picks delivery promotions for an order of 250 shipments per day. Several rules may match a single visitor, and the team wants every matching promotion code returned to the process to display them all in an Operate-visible variable.",
  "question": "Which hit policy returns every satisfied rule's output as a list with no defined ordering and no aggregation?",
  "options": [
    { "id": "a", "text": "COLLECT hit policy with no aggregator returns the outputs of all satisfied rules as a list in arbitrary order" },
    { "id": "b", "text": "RULE ORDER hit policy returns the outputs as a list but only if you explicitly set an aggregation attribute on the decision table" },
    { "id": "c", "text": "ANY hit policy returns a list of every satisfied output, regardless of whether the outputs are equal to each other" },
    { "id": "d", "text": "UNIQUE hit policy returns a list of one item when multiple rules match the same input data combination" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. The DMN docs describe COLLECT without an aggregator as returning a list of outputs in arbitrary order." },
    "b": { "text": "Incorrect. RULE ORDER already orders its list by rule position and never requires an aggregation attribute to do so." },
    "c": { "text": "Incorrect. ANY violates the policy when satisfied rules have different outputs; it does not return a list." },
    "d": { "text": "Incorrect. UNIQUE returns one output entry and raises an error if two or more rules match." }
  },
  "explanation": "COLLECT without an aggregator returns the outputs of all satisfied rules as a list in arbitrary order, which is the documented behaviour for the case of collecting matched promotions.",
  "docs": [
    { "title": "DMN hit policy", "url": "https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/" }
  ]
}
```

**Exemplar 2** (from authored pool):

```json
{
  "id": "dec-any-hit-policy",
  "topic": "decisions-business-rules",
  "subtopic": "hit policy",
  "difficulty": "medium",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Delta Bank reviews 8000 requests per day in a Camunda 8.8 leave-application process. The DMN table refuses applications when the applicant has no vacation days left or is currently in probation. Both rules may match for one applicant, but the team wants the table to return a single refuse output without raising an error.",
  "question": "Which hit policy is the correct choice for this rule overlap pattern, given the constraints?",
  "options": [
    { "id": "a", "text": "ANY hit policy returns one output when multiple rules match, on the condition that every satisfied rule produces the same output" },
    { "id": "b", "text": "FIRST hit policy returns the first matched rule's output and does not depend on the equality of overlapping outputs" },
    { "id": "c", "text": "UNIQUE hit policy returns one output and raises an evaluation incident whenever any two rules match the same applicant input" },
    { "id": "d", "text": "COLLECT hit policy returns one output by definition whenever multiple satisfied rules produce the same refuse value" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. The DMN docs describe ANY as allowing multiple rules to match if and only if they generate the same output, which the refuse use case satisfies." },
    "b": { "text": "Incorrect. FIRST works regardless of output equality, but the question explicitly relies on the equal-output guarantee of ANY." },
    "c": { "text": "Incorrect. UNIQUE raises an incident on any second match; the scenario explicitly expects overlapping rules without an error." },
    "d": { "text": "Incorrect. COLLECT returns a list (or aggregated value) and never a single bare output without an aggregator definition." }
  },
  "explanation": "ANY allows multiple satisfied rules only when their outputs are identical and returns that common output once, matching the refuse decision scenario.",
  "docs": [
    { "title": "DMN hit policy", "url": "https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/" }
  ]
}
```

### Source chunk — ALL facts in your answer must trace back to this content

**File**: `pipeline/sources/decisions-business-rules/decision-table-hit-policy.md`
**Public URL**: https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/
**Section heading**: Unique

```markdown
## Unique

Only a single rule can be satisfied or no rule at all. The decision table result contains the output entries of the
satisfied rule.

If more than one rule is satisfied, the Unique hit policy is violated.

Refer to the following decision table.

![Hit Policy Unique](assets/decision-table/hit-policy-unique.png)

Depending on the current season the dish should be chosen. Only one dish can be chosen, since only one season can exist
at the same time.
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/decisions-business-rules/dec-decision-table-hit-policy-27.json** and nothing else.
2. The id MUST be `dec-decision-table-hit-policy-27`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".
