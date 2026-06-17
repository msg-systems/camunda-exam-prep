# Authoring task: ext-testing-process-definitions-174

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/extensions-integrations/ext-testing-process-definitions-174.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `ext-testing-process-definitions-174` (use exactly this id)
- **topic**: `extensions-integrations`
- **difficulty**: `medium`
- **style**: `scenario`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/best-practices/development/testing-process-definitions/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): "Test scope and mocking"

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
  "id": "ext-camunda-client-ts",
  "topic": "extensions-integrations",
  "subtopic": "TypeScript SDK",
  "difficulty": "easy",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Aurora Marketplace migrates a TypeScript service that consumes 18000 jobs per day from Camunda 8.7 to Camunda 8.8. The team must replace the legacy SDK class name used to construct a client and update calls to the unified surface introduced in 8.8 across the entire codebase.",
  "question": "Which client class do TypeScript developers instantiate in the Camunda 8.8 SDK?",
  "options": [
    { "id": "a", "text": "CamundaClient is the unified TypeScript SDK class in Camunda 8.8 that replaces the legacy ZeebeClient used in earlier minor versions" },
    { "id": "b", "text": "ZeebeClient is the canonical class in Camunda 8.8 and the SDK keeps the original name for the entire 8.x release series" },
    { "id": "c", "text": "OperateClient is the unified TypeScript SDK class in Camunda 8.8 and it covers Zeebe, Operate, and Tasklist APIs through a single surface" },
    { "id": "d", "text": "TasklistClient is the unified TypeScript SDK class in Camunda 8.8 and developers configure Zeebe endpoints on it via runtime options" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. Camunda 8.8 introduced CamundaClient as the unified TypeScript SDK class; ZeebeClient is the legacy name being phased out." },
    "b": { "text": "Incorrect. The class name changed in 8.8 to align with the unified API; ZeebeClient is the legacy form." },
    "c": { "text": "Incorrect. OperateClient is a single-component client, not the unified entry class." },
    "d": { "text": "Incorrect. TasklistClient is a single-component client, not the unified entry class in 8.8." }
  },
  "explanation": "Camunda 8.8 introduced CamundaClient in the TypeScript SDK as the unified client class, replacing the legacy ZeebeClient.",
  "docs": [
    { "title": "Camunda 8 TypeScript SDK", "url": "https://docs.camunda.io/docs/apis-tools/camunda-8-js-sdk/" }
  ]
}
```

**Exemplar 2** (from authored pool):

```json
{
  "id": "ext-connector-secret",
  "topic": "extensions-integrations",
  "subtopic": "Connectors",
  "difficulty": "medium",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Tessera Insurance configures an HTTP REST outbound connector for 5500 transactions per day in Camunda 8.8. The team must not embed an API key literal in the BPMN file or element template fields; instead the connector runtime must resolve the key from a managed secret at execution time.",
  "question": "Which Camunda 8 syntax references a managed secret inside a connector property?",
  "options": [
    { "id": "a", "text": "Set the property value to {{secrets.MY_API_KEY}}; the connector runtime resolves the placeholder against the configured secret store at invocation" },
    { "id": "b", "text": "Set the property value to ENV(MY_API_KEY); the connector runtime resolves the value from the broker process environment variables at every invocation" },
    { "id": "c", "text": "Set the property value to ${MY_API_KEY}; the connector runtime resolves it from broker process environment variables on every invocation" },
    { "id": "d", "text": "Set the property value to vault://MY_API_KEY; the connector runtime resolves the value from the HashiCorp Vault integration bundled with the broker" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. Camunda 8 connectors reference managed secrets via the {{secrets.NAME}} placeholder; the runtime resolves the value from the secret store at invocation." },
    "b": { "text": "Incorrect. ENV(NAME) is not the documented placeholder syntax; secrets are managed via the secret store." },
    "c": { "text": "Incorrect. Dollar-brace syntax references variables not secrets; secret references use the {{secrets.NAME}} placeholder." },
    "d": { "text": "Incorrect. There is no vault:// scheme in the connector configuration; the documented syntax is {{secrets.NAME}}." }
  },
  "explanation": "Connector secrets are referenced via the {{secrets.NAME}} placeholder; the runtime resolves the value from the secret store at invocation time.",
  "docs": [
    { "title": "Connector secrets", "url": "https://docs.camunda.io/docs/components/console/manage-clusters/manage-secrets/" }
  ]
}
```

### Source chunk — ALL facts in your answer must trace back to this content

**File**: `pipeline/sources/extensions-integrations/testing-process-definitions.md`
**Public URL**: https://docs.camunda.io/docs/components/best-practices/development/testing-process-definitions/
**Section heading**: Test scope and mocking

```markdown
### Test scope and mocking

In a test case like this, you want to test the executable BPMN process definition, plus all the glue code that logically belongs to the process definition in a broader sense. Typical examples of glue code you want to include in a process test are:

- Worker code, typically connected to a service task
- Expressions (FEEL) used in your process model for gateway decisions or input/output mappings
- Other glue code, for example, your own Client API (probably exposed via REST) that performs data mapping before calling the Camunda Client.

The following illustration shows this for the invoice approval example:

![Process test scope example](testing-process-definitions-assets/process-test-scope-example.png)

Workflow engine-independent business code should _not_ be included in the tests. In the invoice approval example, the `ArchiveService` will be mocked, and the `ArchiveInvoiceWorker` will read and transform process variables and call this mock. This way, you can test the process model, the glue code, and the data flow in your process test without calling out to the real archive system.

The following code examples highlight the important aspects around mocking.

The `ArchiveInvoiceWorker` is executed as part of the test. It does input data mapping **(1)** and also translates a specific business exception into a BPMN error **(2)**:

```java
@Component
public class ArchiveInvoiceWorker {

  private final ArchiveService service;
  public ArchiveInvoiceWorker(final ArchiveService service) {
    this.service = service;
  }

  @JobWorker(type = "archive-invoice")
  public void handleJob(
      @Variable("invoiceId") final String invoiceId, // <1>
      @Variable("invoice") final JsonNode invoiceJson) {
    try {
      service.archiveInvoice(invoiceId, invoiceJson);
    } catch (WiredLegacyException e) { // <2>
      throw new BpmnError(
          "LEGACY_ERROR_ARCHIVE", "The archive system had a problem: " + e.getMessage());
    }
  }
}
```

The `ArchiveService` is considered a business service (it could, for example, wrap the archive system client SDK to make the appropriate remote calls) and should _not_ be executed during the test. This is why this interface is mocked in the test case:

```java
@MockitoBean
private ArchiveService archiveService;

@Test
public void happyPath() throws Exception {
  // ...
  // Using Mockito you can verify a business method was called with the expected parameters
  Mockito.verify(archiveService).archiveInvoice("INV-1001", objectMapper.readTree(invoiceJson));
}

@Test
void testArchiveSystemError() throws Exception {
  // Using Mockito you can define what should happen when a method is called, in this case an exception is thrown to simulate a business error
  doThrow(new WiredLegacyException()).when(archiveService).archiveInvoice(anyString(), any());
  //...
}
```

Some workers might not delegate to a proper service class, which you can easily mock. The prime example is connectors. The invoice process uses the REST connector to trigger the invoice rejection via some REST API. To avoid calling the REST endpoint, you can mock the job worker that would be provided by the connector runtime:

```java
@Test
public void testRejectionPath() throws Exception {
  processTestContext.mockJobWorker("io.camunda:http-json:1").thenComplete();
  // ...
}
```

You could also mock the REST endpoint, which we touch on later discussing integration tests. Some projects consider REST mocking part of the unit test scope, and this is generally also fine, even if we see it as integration test scope by default.

You can use the same [utilities from Camunda Process Test](../../../apis-tools/testing/utilities.md) to mock other workers, where you simply do not want to run the job worker itself. Maybe the implementation is not clean, but beyond your control. However, we advise to use a proper service interface whenever possible instead of job worker mocking.

```java
// Define the mock
final JobWorkerMock addInvoiceJobWorkerMock =
    processTestContext
        .mockJobWorker("add-invoice-to-accounting")
        .withHandler(
            (jobClient, job) -> {
                jobClient
                    .newCompleteCommand(job)
                    // .variables(null) //  We could now also simulate setting some response values
                    .send()
                    .join();
            });

// ... drive the process ...

// and assert:
assertThat(addInvoiceJobWorkerMock.getInvocations())
    .as("add-invoice-to-accounting job worker called")
    .isEqualTo(1);

assertThat(addInvoiceJobWorkerMock.getActivatedJobs().get(0).getVariablesAsMap())
    .containsEntry("invoiceId", "INV-1001");
```
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/extensions-integrations/ext-testing-process-definitions-174.json** and nothing else.
2. The id MUST be `ext-testing-process-definitions-174`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/best-practices/development/testing-process-definitions/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".
