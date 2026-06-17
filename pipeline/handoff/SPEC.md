# Camunda 8.8 Exam Pool — Authoring Brief (v2 — Mock-PDF Style)

You are authoring questions for a Camunda 8.8 Certified Professional —
Developer (C8-CP-DV) practice platform. The previous pool (now archived
under `pipeline/_archive-v1/`) was rejected: questions were padded with
fictional company narratives and parallel-length options that tested
puzzle-solving rather than Camunda knowledge.

This brief is the **complete contract** for the replacement.

## What you are producing

A directory of JSON files, one per question, organised by topic under
`pipeline/authored/<topic-slug>/q-<short-slug>.json`. Each file must conform
to [schema.json](schema.json) and pass [pipeline/lib/content-lints.mjs](../lib/content-lints.mjs)
with **zero findings**.

## Style — match the Camunda mock-exam PDFs exactly

The voice is captured by the three Camunda Mock Exam PDFs. Three rules:

### 1. Runtime situation, not company narrative

Name the BPMN elements, FEEL expressions, ISO 8601 tokens, error codes,
annotations. Do **not** name fictional companies or invent KPIs.

**Bad** (old rubric):
> At Aurora Retail, a Camunda 8.8 process handles 6000 reviews per day with a
> non-interrupting boundary timer attached to the Review document user task.
> The team must decide how the timer's R3/PT1H cycle interacts with the task
> lifecycle when reviewers complete reviews late, especially under SLA
> constraints…

**Good** (mock-PDF style):
> A user task `Review document` has a non-interrupting boundary timer
> `R3/PT1H` whose outgoing flow leads to a send task `Send reminder`. The
> user completes the review after 2.5 hours. How many reminders are sent,
> and what happens to the user task?

### 2. Crisp options — no padded length parity

A correct answer like `true`, `"unda"`, or `"approve"` is fine. Distractors
do **not** need to be the same length as the correct answer. Forcing
parallelism padded the old pool with noise.

**Bad**:
> A. `senior` — returned because age ≥ 65 matches the first row condition
> B. `adult` — returned because age ≥ 18 also matches but is shadowed
> C. `["senior", "adult"]` — returned as a list because two rules matched
> D. An error is raised because two rules matched the input

**Good**:
> A. `"senior"`
> B. `"adult"`
> C. `["senior", "adult"]`
> D. An error, because two rules match.

### 3. FEEL / code blocks go in `codeBlocks`, not in option text

```json
{
  "question": "What is the result of the FEEL expression above when `orders` is an empty list `[]`?",
  "codeBlocks": { "stem": "every order in orders satisfies order.total > 0" },
  "options": [
    { "id": "a", "text": "true" },
    { "id": "b", "text": "false" },
    { "id": "c", "text": "null" },
    { "id": "d", "text": "An error, because the list is empty." }
  ],
  "correctOptionId": "a"
}
```

The UI renders `codeBlocks.stem` as a `<pre><code>` under the question.
`codeBlocks.perOption.{a,b,c,d}` renders under each option (useful when
each option *is* a code snippet).

## Schema

Authoritative: [schema.json](schema.json). Highlights:

- `id`: kebab-case, prefix `mod-`/`cfg-`/`dec-`/`frm-`/`con-`/`ext-`/`mng-`/`dev-`.
- `topic`: one of `modeling`, `configuring-processes`, `decisions-business-rules`, `forms`, `connectors`, `extensions-integrations`, `managing-development`, `dev-environment`.
- `style`: `scenario` | `concept` | `recall`.
- `kind`: `single` (default, 1-of-4) or `negative` (still 1-of-4, asks for the wrong/false option — stem must contain uppercase `NOT` or `FALSE`).
- `camundaVersion`: `"8.8"` (string, exactly).
- `scenario`: **optional** — use only when the runtime situation needs more than one sentence to set up.
- `question`: 20–400 chars, ends with `?`.
- `options`: exactly 4, ids `a`/`b`/`c`/`d`. **No length floor, no length-ratio cap.** Crisp short options encouraged when the docs support them.
- `correctOptionId`: one of `a`/`b`/`c`/`d`.
- `optionExplanations`: all 4 required, ≥10 chars each, natural prose (no mandatory "Correct."/"Incorrect." prefix).
- `explanation`: one short paragraph.
- `docs`: ≥1 entry on `https://docs.camunda.io/docs/`. The claim **must** be literally supported by the linked page.
- `codeBlocks`: optional `{ stem?, perOption?: { a?, b?, c?, d? } }`.

## Forbidden

- **Multi-select.** Camunda official exam is single-correct-only.
- **More than 4 options.**
- **Fictional company narratives** ("Aurora Retail…", "Verdant Marketplace…").
- **Manufactured KPIs.** Use only counts/durations the docs themselves state.
- **Internal source references** anywhere in text: `foo.md:23`, `(:32-43)`, `application.yaml:42-58`.
- **Cyrillic characters** anywhere.

## Distractor design

Every distractor encodes a *real misconception* a half-prepared Camunda 8
developer could hold. Examples that work well in the mock PDFs:

- Camunda 7 → Camunda 8 confusion: `${amount > 1000}` (JUEL) vs `amount > 1000` (FEEL).
- Signals vs messages: signal = broadcast (no correlation key); message = 1:1 (needs correlation key + TTL).
- Inclusive-merge "smart wait": inspects upstream to know how many tokens to wait for; not a deadlock.
- Vacuous truth: `every X in [] satisfies …` returns `true`.
- Call activity variable propagation: defaults to ALL parent vars (not isolated).
- Default job retries: `3`.
- `@JobWorker(autoComplete = false)`: you own the complete/fail/throw lifecycle.
- ISO 8601: `R3/PT1H` (3 repeats, 1 hour each) vs `PT3H` (one 3-hour duration).
- DMN hit policies: `First`, `Unique`, `Any`, `Priority`, `Collect`, `Rule Order`, `Output Order` — `Cascade`, `Atomic`, `Random` are not valid.

Strawmen ("the process explodes", "the cluster reboots") are rejected.

## Docs grounding

Each question links to **one** canonical `https://docs.camunda.io/docs/...`
page that supports the answer. The critic pass (Phase 4) will require a
literal quoted sentence from that page that supports the correct option.
If you cannot find one, do not author the question.

The blueprint's official Recommended Reading URLs (v8.8.0 blueprint pp.
14, 16, 17, 18, 19, 21, 23, 24) are the seed set for `docs[0].url`.

## Pool target

| Topic                                   | Official % | Pool target |
| --------------------------------------- | ---------: | ----------: |
| modeling                                |        15% |          90 |
| configuring-processes                   |        22% |         132 |
| decisions-business-rules                |        11% |          66 |
| forms                                   |         5% |          30 |
| connectors                              |         6% |          36 |
| extensions-integrations                 |        25% |         150 |
| managing-development                    |        15% |          90 |
| dev-environment                         |         1% |           6 |
| **Total**                               |    **100%**|     **600** |

`dev-environment` has limited surface area (c8run / docker-compose). Landing
at 4–6 is acceptable; absorb slack into `extensions-integrations`.

Item-kind distribution per topic: ~90% `single`, ~10% `negative`.

## Exemplars

Hand-authored, lint-clean exemplars in the new style live at
[exemplars/](exemplars/) — one or two per topic. The generation pipeline
embeds them as few-shot context in every prompt.
