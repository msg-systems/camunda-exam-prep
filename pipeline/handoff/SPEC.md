# Camunda 8.8 Practitioner Exam Pool — Regeneration Brief

You are authoring questions for a Camunda 8.8 Certified Developer practice
platform. The current source pool was machine-translated from a low-quality
exam dump and has structural defects that cannot be fixed mechanically. This
brief is the **complete contract** for producing a clean replacement.

## What you are producing

A directory of JSON files, one per question, organised by topic:

```
submission/
  modeling/q-*.json
  configuring-processes/q-*.json
  decisions-business-rules/q-*.json
  forms/q-*.json
  connectors/q-*.json
  extensions-integrations/q-*.json
  managing-development/q-*.json
  dev-environment/q-*.json
```

Total **500 questions** distributed per `BUDGET.md`. Each file must conform to
`schema.json` and pass `node lib/run-lints.mjs submission/` with **zero
findings**. Anti-examples are at the bottom of this document.

## Style contract (the part previous agents got wrong)

These rules are non-negotiable. Each is enforced by `lib/content-lints.mjs`.

### 1. An option is a self-contained statement

An option states a fact, a configuration, or a behaviour. It does **not**
explain why it is right or wrong. The reader's only job when looking at an
option is to evaluate the statement on its own merits.

**Bad** (option grades itself):
> "Use an Inclusive Gateway. This correctly models the two-way race because
> the Inclusive Gateway evaluates all outgoing conditions in parallel."

**Good** (statement only):
> "Use an Inclusive Gateway with two conditional sequence flows, one keyed on
> `photos_received = true` and one on `time_elapsed >= PT48H`, joined by a
> downstream Inclusive Gateway."

The judgement ("correctly", "fails to", "this is the canonical pattern", "this
adds no value") belongs in `optionExplanations`, **never** in `options[].text`.

### 2. Never cite internal source files or line numbers

Camunda's public docs URLs are allowed in the `docs` array. Internal source
paths, line ranges, internal docs filenames, or `:line` suffixes are forbidden
**anywhere** in scenario, question, options, or option explanations.

**Forbidden patterns** (lint will reject):
- `per feel-built-in-functions-list.md`
- `md:70-93`
- `connector-sdk.md:233`
- `application.yaml:42-58`
- `See processes.feature for an example`

If a fact comes from a doc page, cite the page once in the `docs` array as a
proper `https://docs.camunda.io/docs/8.8/...` URL. Do not name the file.

### 3. No verdict vocabulary anywhere in options

Words and phrases the lint will flag inside any option's `text`:

- "wrong", "incorrect", "right", "correct", "mistaken", "misleading"
- "partial", "partially correct", "close but", "tempting but", "workable but"
- "the canonical", "the idiomatic", "is recommended", "is preferred"
- "should be preferred", "teams should", "developers should", "you should"
- "is fully achievable", "is impossible", "is not required", "is not supported"
- "this is a misconception", "common mistake", "red herring"
- "this correctly models", "this incorrectly describes"
- "adds no value", "defeats the purpose", "without adding value"
- "is appropriate for", "is suitable for", "is the standard"
- "Camunda 8 supports/allows/provides/requires..." (as a sentence in an option)
- "However,", "In reality,", "In practice,", "In fact," at the start of an
  option sentence (these are graded-essay openers)

Use these words **only** in `optionExplanations` and the question-level
`explanation`.

### 4. No markdown, no decorative punctuation

Inside `options[].text`, `scenario`, and `question`:

- No `**bold**`, `*italic*`, backticks, blockquotes, headings, list markers.
- No em-dashes (U+2014). Use `--` (two ASCII hyphens) for inline breaks.
- No emoji or wingdings (🔍, ✅, ❌).
- No "Documentation:", "Docs:", "See:" trailers with markdown links.

Code identifiers may appear in plain text (e.g. `get or else(value, default)`)
but not inside backticks.

### 5. Length and balance

| Field | Min | Max | Notes |
|---|---|---|---|
| `scenario` | 80 chars (hard floor); 150 chars (preferred) | ~700 | Must contain a domain marker (company, role, system name, "team", "service", etc.) and a measurable (number + unit, or threshold). |
| `question` | 20 chars (hard floor); 30 chars (preferred) | ~250 | Must end with `?`. Must be interrogative ("Which", "What", "How", "Why", "When", "Where", "Who"). |
| `options[].text` | 30 chars (hard floor); 60 chars (preferred) | ~400 | All four options within a 4× length ratio of each other (longest / shortest ≤ 4.0; ideally ≤ 2.5). |
| `optionExplanations[].text` | 80 chars | 600 | Must start with `Correct.` (for the right answer) or `Incorrect.` (for distractors). |
| `explanation` | 80 chars | 600 | Question-level rationale; states the principle, not the verdict. |

### 6. Distractors must be plausible and parallel

Each of the four options describes a structurally similar artefact (e.g. all
four are BPMN constructs, or all four are valid YAML keys, or all four are
real FEEL functions). At least three distractors must be things a real
developer might attempt — not strawmen. Distractors are wrong because of a
specific technical reason that you explain in `optionExplanations`.

### 7. Exactly one correct answer

`correctOptionId` matches exactly one of the four option ids `a`, `b`, `c`,
`d`. The `optionExplanations` map has an entry for **every** option, and
exactly one of them starts with `Correct.` — the one matching
`correctOptionId`.

### 8. Citations must be real Camunda 8.8 docs URLs

Every question must have at least one entry in `docs` with:

- `url` starting with `https://docs.camunda.io/docs/` (the `8.8` segment is
  optional but preferred).
- `title` is a short human-readable label ("BPMN message events", "Identity
  configuration"). Do not put filenames or line numbers in the title.

Do not invent URLs. If you are unsure a page exists, use the topic landing
page (e.g. `https://docs.camunda.io/docs/components/modeler/bpmn/`) and write
the explanation against verified behaviour.

### 9. Topic, version, and id rules

- `topic` is one of the 8 slugs in `BUDGET.md`. No other value is allowed.
- `camundaVersion` is the string `"8.8"`.
- `id` is unique across the whole submission, kebab-case, starts with the
  topic prefix abbreviation (`mod-`, `cfg-`, `dec-`, `frm-`, `con-`, `ext-`,
  `mng-`, `dev-`).
- `difficulty` is one of `easy`, `medium`, `hard`.
- `style` is one of `scenario` (preferred, ≥ 60%), `concept`, `recall`.

## Anti-examples (do not produce questions that look like these)

### Anti-example A — option fragments + doc-citation leak

```
A. score), 0) -- SQL-style coalesce built-in. FEEL does not have a coalesce()
   function. ) returns the first non-null value from the argument list...
B. score) -- explicit empty check. This expression is semantically correct
   and will return 0 when the reviews list is empty...
C. score) ?? 0 -- null-coalescing operator. The ?? operator is the
   null-coalescing operator from JavaScript (ECMAScript 2020) and TypeScript...
D. md:70-93: returns value if non-null, else default. score) extracts the
   score field from each element of the reviews list...
```

What is wrong: options start with truncated fragments (`score), 0)`), option D
leads with a doc citation (`md:70-93`), option B contains the verdict ("This
expression is semantically correct"), options vary wildly in length.

### Anti-example B — graded mini-lecture in the option

```
A. Use an Inclusive Gateway with two conditional flows. However, the Inclusive
   Gateway does not suspend and wait for future events -- it evaluates
   conditions at the moment the token arrives. This is the wrong pattern for a
   two-way race; teams should use a Receive Task with a Timer Boundary Event
   instead, which is the canonical Camunda 8 approach.
```

What is wrong: the option contains its own verdict ("This is the wrong
pattern"), a directive ("teams should use"), and an absolute affirmation ("is
the canonical Camunda 8 approach"). All of that belongs in the explanation.

**Correct version of the same option:**

```
A. Use an Inclusive Gateway with two conditional sequence flows, one keyed on
   the message-received signal and one on the 48-hour timer expression.
```

### Anti-example C — meta-vocabulary in scenario or question

```
Question: "Which of the following is the wrong answer for handling timeouts?"
```

What is wrong: meta-vocabulary ("wrong answer") in the question stem. The
question should describe the technical situation; the wrongness is determined
by which option you pick.

## Process recommendation

1. Read `BUDGET.md` and `exemplars/` end-to-end before writing anything.
2. For each topic, list the official 8.8 docs pages you intend to cover.
3. Draft questions in batches of 5 per topic. After each batch, run the lint
   runner. Fix anything it flags.
4. Sweep for duplicates and near-duplicates (same configuration, different
   wording — keep the cleaner one).
5. Verify the final blueprint distribution matches `BUDGET.md` exactly.
6. Submit only after `node lib/run-lints.mjs submission/` reports
   `0 findings` and the acceptance checklist is signed off.

## Voice

Write like the exemplars. Concrete (real company names, real numbers, real
process steps). Precise (FEEL `mean(reviews.score)`, not "the mean function").
Plain (no flourish, no marketing language, no "Importantly," / "It is worth
noting that,"). Camunda-native (use BPMN/DMN/FEEL/Tasklist/Operate/Optimize
vocabulary as it appears in the 8.8 docs).
