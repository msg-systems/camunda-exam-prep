# Acceptance gates

A submission is accepted into the platform only after **all** gates below
report PASS. Run them in order; do not advance past a failed gate.

## Gate 1 — Schema validation

Every JSON file under `submission/` conforms to `schema.json`.

```sh
# Optional: use ajv-cli if you have it
npx ajv-cli validate -s schema.json -d 'submission/**/*.json'
```

The shape rules in the schema overlap with lint rules; this gate is a
fast-fail for malformed JSON.

## Gate 2 — Lint runner reports zero findings

```sh
node lib/run-lints.mjs submission/
```

Required output:

- `Files scanned:` ≥ `500` (or whatever your final count is)
- `Clean:` equals `Files scanned`
- `With findings: 0`
- `Duplicate ids: 0`
- `Result: PASS`

If any code shows up in `Findings by code`, fix every offender. The lint
contract is non-negotiable.

## Gate 3 — Blueprint distribution

`node lib/run-lints.mjs` prints a per-topic line. Required:

- All eight topics show `OK`.
- `dev-environment` may be between `5` and `9` (carve-out).
- No `UNKNOWN TOPICS` line.

## Gate 4 — Duplicate detection

Beyond exact id duplicates (Gate 2), perform near-duplicate detection:

1. For each pair of questions in the same topic, compute the Jaccard
   similarity of the lowercased word-set of `scenario + question + options`.
2. Flag any pair with similarity ≥ 0.65.
3. Either rewrite one of the pair to differentiate, or drop the weaker one.

A pragmatic shell sweep:

```sh
node lib/run-lints.mjs submission/  # writes a sorted id list
# then a manual review of near-collisions you already noticed during authoring
```

## Gate 5 — Docs URL spot-check

Pick 25 random questions. For each:

- `docs[0].url` resolves (HTTP 200) on `https://docs.camunda.io/docs/`.
- The page actually discusses the question's subject matter.
- The url is not just a generic landing page when a more specific page exists.

## Gate 6 — Manual spot-audit (25 random questions)

For each, confirm:

- Scenario reads like a real customer situation (company/team/system name,
  numbers, version).
- Question is one clear interrogative sentence.
- Each of the four options reads as a self-contained statement. Cover the
  other three with your hand; the visible option should still make sense
  without commentary.
- Only `optionExplanations[correctOptionId]` says "Correct."; the other three
  say "Incorrect."
- `explanation` states a principle, not just "A is right because the others
  are wrong."
- No internal file paths, line numbers, em-dashes, markdown, emoji, or
  verdict words leaked into option text.

## Gate 7 — Platform smoke test

After ingestion into the platform:

```sh
cd ../..               # back to camunda-exam-prep repo root
node pipeline/import-regenerated.mjs --src=pipeline/handoff/submission/
node pipeline/build-pool.mjs
node pipeline/curate-top.mjs --size=500 --min-score=55 --apply
npm test
```

Required:

- `import-regenerated.mjs` accepts ≥ 95% of submissions cleanly. If < 95%,
  the brief needs sharpening — return to the agent with the rejection list.
- `build-pool.mjs` reports the new tier accepted with `0 quality-*` findings.
- `curate-top.mjs --size=500 --min-score=55 --apply` produces 500 (or 496
  with dev-environment carve-out) at meanScore ≥ 80.
- `npm test` → 29/29 passing.

## Gate 8 — End-to-end mock exam

Start the platform (`npm run dev`), run a full 60-question Mock Exam. Walk
through every question. Flag anything that reads odd. If the flag count is
> 2/60 (3.3%), the submission is rejected.
