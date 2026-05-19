# Authoring Rubric — Camunda 8.8 Exam Practice Questions

Every question must match the style of the PDF exemplars (Q1–Q18). This rubric is mechanically enforced by `pipeline/lib/content-lints.mjs`. Any new question that fails the lint will not enter the pool.

## Question structure

| Field | Constraint |
| --- | --- |
| `id` | kebab-case, globally unique, prefixed with topic slug (`mod-`, `cp-`, `dec-`, `frm-`, `con-`, `ext-`, `mgmt-`, `dev-`). |
| `topic` | One of the 8 blueprint slugs. |
| `subtopic` | Free text; helps grouping in the UI. |
| `difficulty` | `easy` \| `medium` \| `hard`. Default to `medium`. |
| `style` | Always `scenario`. |
| `camundaVersion` | `"8.8"`. |
| `scenario` | ≥ 150 chars, names a real industry/system, includes a number or proper noun, ends with the constraint that motivates the question. |
| `question` | ≥ 25 chars, ends with `?`. |
| `options` | Exactly 4, ids `a/b/c/d`, each ≥ 40 chars, length ratio max/min ≤ 1.4. Full sentences, parallel grammatical shape. |
| `correctOptionId` | One of `a/b/c/d`, must appear in `options`. |
| `optionExplanations` | Map keyed by `a/b/c/d`, all four present; each `text` starts with `Correct.` (for the correct option) or `Incorrect.` (for distractors). |
| `explanation` | One paragraph summarising the docs-grounded rationale. |
| `docs` | At least one entry with `url` matching `^https://docs\.camunda\.io/docs/`. |

## Forbidden in any option `text`

- Meta vocabulary: `incorrect`, `wrong`, `partial`, `anti-pattern`, `misnomer`, `overstates`, `understates`, `misleading`, `not supported`, `deprecated`.
- Em-dash (`—`).
- Self-rationale: leading `because`, `since` clauses that justify the option to the reader.
- Markdown (`**`, single underscores, backticks).
- Internal refs (`per modeling.md`, `:1-15`, etc).
- Cyrillic characters.

## Required in the scenario

- A domain-anchor noun (one of: bank, banking, insurance, insurer, logistics, retailer, e-commerce, marketplace, SaaS, healthcare, hospital, fintech, telco, utility, government, airline, broker, payments, lender, manufacturer, fulfilment, warehouse, dealership, payroll, supplier, customer, merchant) **or** a proper noun (a fictional company name like `ACME Bank`, `NovaPay`).
- A measurable detail: currency amount, count, percentage, or duration (e.g. `€500K`, `30 seconds`, `5 attempts`).

## Distractor design

Every distractor must encode a *real misconception* a half-prepared developer could hold (e.g. confusing interrupting vs non-interrupting boundary events, expecting FEEL `if` to short-circuit, treating a parallel gateway as a synchronization barrier when only one token arrived). Strawmen are rejected.

## Docs grounding

Every question links to one canonical page on `https://docs.camunda.io/docs/...` for version 8.8. Author the question only **after** reading that page. The URL goes in `docs[0].url` and `docs[0].title` should be the docs page H1.

## File layout

One question per file:

```
pipeline/authored/<topic-slug>/q-<short-slug>.json
```

## Blueprint targets (120 questions total)

| Topic | Target |
| --- | --- |
| modeling | 18 |
| configuring-processes | 26 |
| decisions-business-rules | 13 |
| forms | 6 |
| connectors | 7 |
| extensions-integrations | 30 |
| managing-development | 18 |
| dev-environment | 2 |
