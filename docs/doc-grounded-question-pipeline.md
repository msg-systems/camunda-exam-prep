# Doc-Grounded Question Generation — Plan & Source List

**Goal:** Generate high-quality Camunda 8 Certified Developer scenario questions by feeding curated official documentation pages into an LLM pipeline, with a critic pass and human review queue.

**Why scoped (not a full crawl):** `docs.camunda.io` is large; the certified-developer blueprint touches only a subset. A targeted source list keeps generation aligned with the exam blueprint and avoids wasting effort on ops/admin pages.

**Target output:** A growing pool of scenario-style questions (`style: "scenario"`) in our existing JSON schema, with verifiable doc citations.

---

## 1. Source Strategy

- Prefer **GitHub markdown source** over rendered HTML — easier to parse, stable URLs, commit SHA = provenance.
  - Repo: [`camunda/camunda-docs`](https://github.com/camunda/camunda-docs) (Docusaurus).
  - Raw pattern: `https://raw.githubusercontent.com/camunda/camunda-docs/main/docs/<path>.md`
- Pin to a specific commit / release branch when generating, so questions are reproducible against a known doc snapshot.
- Cache fetched markdown locally in `pipeline/cache/<sha>/<path>.md` before generation.

---

## 2. Curated URL List by Blueprint Topic

The 8 topics below match the official blueprint weights in `src/data/topics.ts`. Each topic has its core pages; supplementary pages are noted where useful.

### 2.1 Modeling (15%)
- https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/
- https://docs.camunda.io/docs/components/modeler/bpmn/tasks/
- https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/
- https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/
- https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/
- https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/
- https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/
- https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks/
- https://docs.camunda.io/docs/components/modeler/bpmn/manual-tasks/
- https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/
- https://docs.camunda.io/docs/components/modeler/bpmn/subprocesses/
- https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/
- https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/
- https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/
- https://docs.camunda.io/docs/components/modeler/bpmn/gateways/
- https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/
- https://docs.camunda.io/docs/components/modeler/bpmn/parallel-gateways/
- https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/
- https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/
- https://docs.camunda.io/docs/components/modeler/bpmn/none-events/
- https://docs.camunda.io/docs/components/modeler/bpmn/message-events/
- https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/
- https://docs.camunda.io/docs/components/modeler/bpmn/error-events/
- https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/
- https://docs.camunda.io/docs/components/modeler/bpmn/escalation-events/
- https://docs.camunda.io/docs/components/modeler/bpmn/terminate-events/
- https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/
- https://docs.camunda.io/docs/components/modeler/bpmn/link-events/
- https://docs.camunda.io/docs/components/modeler/bpmn/undefined-task/

### 2.2 Configuring Processes (20%)
- https://docs.camunda.io/docs/components/concepts/variables/
- https://docs.camunda.io/docs/components/concepts/expressions/
- https://docs.camunda.io/docs/components/concepts/messages/
- https://docs.camunda.io/docs/components/concepts/signals/
- https://docs.camunda.io/docs/components/concepts/incidents/
- https://docs.camunda.io/docs/components/concepts/process-instance-creation/
- https://docs.camunda.io/docs/components/concepts/process-instance-modification/
- https://docs.camunda.io/docs/components/concepts/process-instance-migration/
- https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/
- https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-data-types/
- https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-expressions-introduction/
- https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-context-expressions/
- https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-list-expressions/
- https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-temporal-expressions/
- https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-boolean-expressions/
- https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-conversion/
- https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/
- https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/
- https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/
- https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/
- https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-context/

### 2.3 Decisions & Business Rules (10%)
- https://docs.camunda.io/docs/components/modeler/dmn/dmn/
- https://docs.camunda.io/docs/components/modeler/dmn/decision-table/
- https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/
- https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/
- https://docs.camunda.io/docs/components/modeler/dmn/literal-expression/
- https://docs.camunda.io/docs/components/modeler/dmn/relation/
- https://docs.camunda.io/docs/components/modeler/dmn/list/
- https://docs.camunda.io/docs/components/modeler/dmn/context/
- https://docs.camunda.io/docs/components/modeler/dmn/invocation/
- https://docs.camunda.io/docs/components/modeler/dmn/function/

### 2.4 Forms (5%)
- https://docs.camunda.io/docs/components/modeler/forms/camunda-forms-reference/
- https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-data-binding/
- https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-validation/
- https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-conditional-rendering/
- https://docs.camunda.io/docs/components/modeler/forms/form-element-library/
- https://docs.camunda.io/docs/components/modeler/forms/use-forms/

### 2.5 Connectors (5%)
- https://docs.camunda.io/docs/components/connectors/use-connectors/
- https://docs.camunda.io/docs/components/connectors/use-connectors/inbound/
- https://docs.camunda.io/docs/components/connectors/use-connectors/secrets/
- https://docs.camunda.io/docs/components/connectors/protocol/rest/
- https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/
- https://docs.camunda.io/docs/components/connectors/protocol/polling/
- https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/available-connectors-overview/
- https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/
- https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-templates/

### 2.6 Extensions & Integrations (25%) — *highest weight*
- https://docs.camunda.io/docs/components/concepts/job-workers/
- https://docs.camunda.io/docs/apis-tools/working-with-apis-tools/
- https://docs.camunda.io/docs/apis-tools/java-client/
- https://docs.camunda.io/docs/apis-tools/java-client/job-worker/
- https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/
- https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/configuration/
- https://docs.camunda.io/docs/apis-tools/node-js-sdk/
- https://docs.camunda.io/docs/apis-tools/community-clients/
- https://docs.camunda.io/docs/apis-tools/zeebe-api/grpc/
- https://docs.camunda.io/docs/apis-tools/zeebe-api-rest/zeebe-api-rest-overview/
- https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview/
- https://docs.camunda.io/docs/apis-tools/operate-api/overview/
- https://docs.camunda.io/docs/apis-tools/tasklist-api-rest/tasklist-api-rest-overview/
- https://docs.camunda.io/docs/components/concepts/process-instance-creation/
- https://docs.camunda.io/docs/components/best-practices/development/dealing-with-problems-and-exceptions-c8/
- https://docs.camunda.io/docs/components/best-practices/development/handling-data-in-processes/
- https://docs.camunda.io/docs/components/best-practices/development/invoking-services-from-the-process/

### 2.7 Managing Development (15%)
- https://docs.camunda.io/docs/components/operate/operate-introduction/
- https://docs.camunda.io/docs/components/operate/userguide/basic-operate-navigation/
- https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/
- https://docs.camunda.io/docs/components/operate/userguide/process-instance-modification/
- https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/
- https://docs.camunda.io/docs/components/operate/userguide/batch-operations/
- https://docs.camunda.io/docs/components/operate/userguide/delete-resources/
- https://docs.camunda.io/docs/components/tasklist/introduction-to-tasklist/
- https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/
- https://docs.camunda.io/docs/components/optimize/what-is-optimize/
- https://docs.camunda.io/docs/components/console/introduction-to-console/
- https://docs.camunda.io/docs/components/concepts/process-instance-migration/
- https://docs.camunda.io/docs/components/concepts/process-instance-modification/

### 2.8 Development Environment (5%)
- https://docs.camunda.io/docs/guides/getting-started-orchestration-cluster/
- https://docs.camunda.io/docs/components/modeler/desktop-modeler/
- https://docs.camunda.io/docs/components/modeler/web-modeler/
- https://docs.camunda.io/docs/self-managed/setup/deploy/local/c8run/
- https://docs.camunda.io/docs/self-managed/setup/deploy/local/docker-compose/
- https://docs.camunda.io/docs/guides/setting-up-development-project/

---

## 3. Pipeline Architecture

```
┌──────────────────────┐
│ 1. Fetcher           │  fetch raw .md from camunda-docs@<sha>, cache locally
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 2. Chunker           │  split long pages into ≤3k-token sections, keep heading path
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 3. Generator (LLM)   │  per chunk: produce N candidate questions in our JSON schema
│                      │  + verbatim _sourceQuote field for grounding proof
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 4. Schema validator  │  enforce: 4 options, valid correctOptionId, https docs link,
│                      │  unique id, topic ∈ blueprint, no leaked answer in stem
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 5. Critic (LLM)      │  separate prompt+model: "Is the correct answer truly correct
│                      │  given this source? Are any distractors also defensible?"
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 6. Dedup             │  embedding similarity vs existing pool; drop >0.85 cosine
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 7. Pending queue     │  src/data/questions/_pending/<topic>.json
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 8. Human review (UI) │  /review route: approve / edit / reject → promotes to live
└──────────────────────┘
```

### Repository layout (proposed)
```
pipeline/
├── fetch.ts          # downloads + caches markdown
├── chunk.ts          # splits + tags with heading path
├── generate.ts       # LLM call per chunk
├── validate.ts       # schema check
├── critic.ts         # second-pass review
├── dedup.ts          # embedding similarity
├── promote.ts        # _pending → live JSON
├── prompts/
│   ├── generator.md
│   └── critic.md
└── cache/
    └── <docs-sha>/...
src/data/questions/_pending/   # review queue
src/modes/ReviewMode.tsx        # human approval UI
```

---

## 4. Generator Prompt (sketch)

```
SYSTEM: You write Camunda 8 Certified Developer exam questions. Output must be
strict JSON matching the provided schema. Style = "scenario": each question has a
Context+Action+Condition block in the `scenario` field and a direct question in
`question`. Distractors must be plausible Camunda-7 traps or version-confusion
items. NEVER invent API names, properties, or URLs. Every fact must be supported
by the SOURCE below; copy the supporting sentence verbatim into `_sourceQuote`.

INPUTS:
- topic: <blueprint topic id>
- existing_question_ids: [...] (avoid duplication of concept)
- source_url: <docs.camunda.io URL>
- source_markdown: <≤3k tokens of the page>

OUTPUT: array of {id, topic, subtopic, difficulty, style:"scenario", scenario,
question, options[4], correctOptionId, explanation, docs[{title,url}],
_sourceQuote}.
```

## 5. Critic Prompt (sketch)

```
SYSTEM: You grade an exam question against its source. Answer ONLY in JSON:
{verdict: "keep"|"fix"|"reject", reasons: [...], suggestedFix: "..."}.
Reject if:
- correct answer contradicts source
- two or more options are defensibly correct
- distractors are obviously wrong (no learning value)
- answer is leaked in the stem
- source quote does not actually support the claim
```

---

## 6. Quality Gates (CI)

Add to existing `tests/questions.test.ts`:
1. Every question's `docs[].url` must be in the curated source list (no hallucinated URLs).
2. Schema test (already exists): unique ids, 4 options a/b/c/d, correctOptionId resolves, https docs.
3. NEW: stem length < 600 chars; scenario < 1500 chars (catches runaway generation).
4. NEW: stem must not contain the literal text of the correct option (answer-leak guard).
5. NEW: no two questions share >0.85 embedding similarity (semantic dedup).

---

## 7. Execution Phases

| Phase | Scope | Output |
|---|---|---|
| **0. Bootstrap** | Build `pipeline/fetch.ts` + cache 1 page; manually walk it through generator + critic in a notebook | Validated end-to-end on a single page |
| **1. MVP** | Run pipeline over Modeling (~29 pages) → generate 3 candidates / page → critic → human-review | ~40-50 reviewed scenarios for one topic |
| **2. Scale** | Same for the other 7 topics | Total ~300 reviewed scenarios |
| **3. Review UI** | Build `/review` mode in the webapp so reviewing is fast (approve/edit/reject + bulk actions) | Faster human pass |
| **4. Maintenance** | On Camunda release, re-run for changed pages only (compare doc SHAs) | Continuously current pool |

---

## 8. Estimated Cost (rough order of magnitude)

- ~110 curated pages × ~3 chunks/page × 3 candidates/chunk ≈ **~1000 candidate questions** in a full run.
- After dedup + critic rejection (~40-50% drop): ~500 promoted to pending queue.
- After human review (~30s/question): ~5 hours of review time for the full run.
- LLM cost: dominated by generator + critic; with a reasonably-priced model, full run is in the low tens of USD.

---

## 9. Open Decisions for Colleague

1. **Which LLM(s)?** Same model for generator + critic, or different (e.g. one big, one small)?
2. **Where does the pipeline run?** Local script vs. GitHub Action on push to `pipeline/`?
3. **Review UI**: lightweight CLI vs. building it into the existing React app?
4. **Question count target**: do we want ~500 total, or ~1000+ (changes whether we need an embedding store)?
5. **Localisation**: stay English-only, or also generate German (DE) variants from the same sources?

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| LLM hallucinates API names / URLs | `_sourceQuote` verifier + URL allow-list test |
| Subtle wrong answers slip through | Critic pass + human review queue (no auto-promote) |
| Doc-license compliance (CC BY 4.0) | Paraphrase, keep `docs[]` attribution, no verbatim long quotes in shipped JSON |
| Duplicate concepts vs existing 220 questions | Embedding dedup against current pool |
| Doc URL drift after Camunda releases | Pin doc SHA per generation run; periodic re-validate job |
| Pipeline non-determinism | Log `{model, temperature, sourceSha, promptVersion}` with each generated question |

---

*Last updated 2026-05-14. Source list reflects `docs.camunda.io` for Camunda 8.9.*
