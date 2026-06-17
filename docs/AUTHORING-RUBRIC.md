# Authoring Rubric — Camunda 8.8 Exam Practice Questions

Every question must match the **Camunda mock-exam PDF style** and is mechanically enforced by [pipeline/lib/content-lints.mjs](../pipeline/lib/content-lints.mjs). Failing the lint blocks the build.

This pool targets the official **C8-CP-DV v8.8.0** exam: 60 questions, 75 minutes, 65% pass, **Single Correct Response — Four Options**, English.

## The voice you are writing in

The mock PDFs (Mock 1 / 2 / 3) define the style. Compare a real exam-style stem:

> A user task `Review document` has a non-interrupting boundary timer `R3/PT1H` whose outgoing flow leads to a send task `Send reminder`. The user completes the review after 2.5 hours. How many reminders are sent, and what happens to the user task?

to the kind of stem the old pool produced and that is now banned:

> At Aurora Retail, a Camunda 8.8 process handles 6000 reviews per day with a non-interrupting boundary timer attached to the `Review document` user task. The team must decide how the timer's `R3/PT1H` cycle interacts with the task lifecycle when reviewers complete reviews late, especially under SLA constraints that require…

Rules of voice:
- **Runtime situation, not company narrative.** Name the BPMN elements, FEEL expressions, ISO 8601 tokens, error codes, annotations. Do **not** name fictional companies or invent KPIs.
- **One short paragraph at most.** Two or three sentences. If you need more, the question is too compound.
- **Inline tech tokens with backticks.** `R3/PT1H`, `customer.country`, `@JobWorker(type = "X")`, `OrderPlaced`, etc.
- **FEEL and code go in `codeBlocks`, never bare in option text.** See exemplars.
- **No padded options.** A correct answer like `true` or `"unda"` is fine. Distractors do not need to be parallel-length.

## Question structure

| Field | Constraint |
| --- | --- |
| `id` | kebab-case, globally unique. Prefix: `mod-` modeling, `cfg-` configuring-processes, `dec-` decisions, `frm-` forms, `con-` connectors, `ext-` extensions-integrations, `mng-` managing-development, `dev-` dev-environment. |
| `topic` | One of the 8 official blueprint slugs (see [src/data/topics.ts](../src/data/topics.ts)). |
| `subtopic` | Free text, helps grouping in the UI. Optional. |
| `difficulty` | `easy` \| `medium` \| `hard`. Default `medium`. |
| `style` | `scenario` (default) \| `concept` \| `recall`. |
| `kind` | `single` (default, 1-of-4) \| `negative` (still 1-of-4, asks for the wrong/false option). |
| `camundaVersion` | `"8.8"`. |
| `scenario` | **Optional.** Use only when the runtime situation needs more than one sentence to set up. Prefer integrating context into `question` directly. |
| `question` | 20–400 chars, ends with `?`. For `kind: negative`, must contain uppercase `NOT` or `FALSE`. |
| `options` | Exactly 4, ids `a`/`b`/`c`/`d`. **No length floor, no length-ratio cap.** Crisp short options like `true`, `null`, `"unda"`, or `"approve"` are encouraged when the docs support them. |
| `correctOptionId` | One of `a`/`b`/`c`/`d`. |
| `optionExplanations` | Map keyed by `a`/`b`/`c`/`d`, all four required. Natural prose; **no mandatory "Correct."/"Incorrect." prefix**. ≥10 chars each. |
| `explanation` | One short paragraph summarising the docs-grounded rationale. |
| `docs` | At least one entry, `url` matching `^https://docs\.camunda\.io/docs/`. The claim must be literally supported by the linked page. |
| `codeBlocks` | Optional. `stem` is rendered as `<pre><code>` under the question text; `perOption.{a,b,c,d}` is rendered under each option. |
| `diagramUrl` / `diagramAlt` | Optional inline diagram image. |

## What is forbidden

- **Multi-select.** Camunda's official exam is single-correct-only. We mirror it.
- **More than 4 options.** Exactly 4.
- **Fictional company narratives.** No "Aurora Retail processes 6000 orders/day". Just describe the BPMN/FEEL/DMN scenario directly.
- **Manufactured measurables.** Do not invent SLA numbers, costs, or volumes to satisfy a rubric. Use only counts/durations that the docs themselves specify (e.g. "default 3 retries", `PT5M` TTL).
- **Internal source references** in any text field: `foo.md:23`, `(:32-43)`, `application.yaml:42-58`.
- **Cyrillic characters** anywhere.

## Distractor design

Every distractor encodes a *real misconception* a half-prepared Camunda 8 developer could hold. Strong examples:

- Confusing Camunda 7's `${...}` JUEL with Camunda 8's plain FEEL.
- Treating signals as messages (broadcast vs. correlation-key).
- Expecting an inclusive merge to deadlock when only some branches activated.
- Assuming `every` over an empty list returns `false` (it returns `true`).
- Calling `assertProcessCompleted(pi)` (old static API) instead of `assertThat(pi).isCompleted()` (CTP).
- Thinking `R/PT1H` is a duration (it is a cycle: infinite repeats, 1-hour period).

Strawmen ("the process explodes", "the cluster reboots") are rejected.

## Docs grounding

Each question links to **one** canonical `https://docs.camunda.io/docs/...` page that supports the claim. The critic (run in Phase 4) must quote one literal sentence from that page that supports the correct answer. If you cannot find one, you cannot author the question.

The blueprint's official Recommended Reading list (pp. 14, 16, 17, 18, 19, 21, 23, 24 of the v8.8.0 blueprint PDF) is the seed set for `docs[0].url`.

## File layout

One question per file:

```
pipeline/authored/<topic-slug>/q-<short-slug>.json
```

## Pool target

Per the official blueprint weights, scaled to 10 full 60Q mocks (≈600 questions):

| Topic                                   | Official % | Per-60Q exam | Pool target |
| --------------------------------------- | ---------: | -----------: | ----------: |
| modeling                                |        15% |            9 |          90 |
| configuring-processes                   |        22% |           13 |         132 |
| decisions-business-rules                |        11% |            7 |          66 |
| forms                                   |         5% |            3 |          30 |
| connectors                              |         6% |            4 |          36 |
| extensions-integrations                 |        25% |           15 |         150 |
| managing-development                    |        15% |            9 |          90 |
| dev-environment                         |         1% |          0–1 |           6 |
| **Total**                               |    **100%**|       **60** |     **600** |

Item-kind distribution: ~90% `single`, ~10% `negative`.

## Exemplars

See [pipeline/handoff/exemplars/](../pipeline/handoff/exemplars/) — one or two per topic, hand-authored in the mock-PDF style and lint-clean. These are embedded as few-shot context in every generation prompt.
