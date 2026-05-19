# Contributing

Thanks for considering a contribution! This is a community study tool, and improvements (new questions, bug fixes, UX polish) are very welcome.

## Ways to help

- **Report a wrong / outdated question** — open an issue with the question id (e.g. `imp-s5-cfg-03`), the topic, and what's wrong. Link to the relevant Camunda 8 docs if you have them.
- **Add a new question set** — see the "Adding a new set of 60 questions" section in [README.md](README.md). Drop a `full_exam_60q_v2_setNN.json` file (matching `pipeline/sources/exam-sets/exam.schema.json`) into `pipeline/sources/exam-sets/`, run the converter, send a PR.
- **Fix a bug or improve UX** — small focused PRs preferred over large rewrites.
- **Improve the converter** — see `pipeline/import-json-sets.mjs` (source schema: `pipeline/sources/exam-sets/exam.schema.json`).

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # expect 7/7
npm run build      # expect ✓
```

A PR must keep tests green and the production build clean.

## Question authoring guidelines

- Original wording only. Do not copy from the official Camunda exam or any third-party paid material.
- Each question follows the strict Markdown template documented in [README.md](README.md#source-format) — the importer is strict, malformed sections are skipped with a logged reason.
- Every option must cite a documentation link from `docs.camunda.io`.
- Per-option scoring (1–10) is required so reviewers can see *why* an option is partial / wrong / right.
- Avoid mixed-language text in author notes — the importer strips obvious Cyrillic leftovers but English-only is preferred.

## Code style

- TypeScript strict, no `any` unless justified in a comment.
- Tailwind utility classes inline; no ad-hoc CSS files.
- Run `npm run lint` before pushing.

## License

By contributing, you agree your contribution is licensed under the [MIT License](LICENSE).
