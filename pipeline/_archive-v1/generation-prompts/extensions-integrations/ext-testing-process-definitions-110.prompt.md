# Authoring task: ext-testing-process-definitions-110

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/extensions-integrations/ext-testing-process-definitions-110.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `ext-testing-process-definitions-110` (use exactly this id)
- **topic**: `extensions-integrations`
- **difficulty**: `hard`
- **style**: `recall`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/best-practices/development/testing-process-definitions/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): "Testing your process in chunks"

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
**Section heading**: Testing your process in chunks

```markdown
### Testing your process in chunks

Divide and conquer by _testing your process in chunks_. Consider the important chunks and paths the invoice approval process consists of:

<div bpmn="best-practices/testing-process-definitions-assets/TestingProcess.bpmn" callouts="EndEvent_InvoiceApproved,EndEvent_InvoiceRejected,TimerEvent_ApprovalTakesTooLong,ErrorEvent_Archive," />

<span className="callout">1</span>

The _happy path_: The invoice gets approved.

<span className="callout">2</span>

The invoice gets rejected.

<span className="callout">3</span>

A timeout on waiting for approval leads to an automatic approval.

<span className="callout">4</span>

An approved invoice can't get archived.

#### Testing the happy path

The happy path is kind of the default scenario with a positive outcome, so no exceptions or errors or deviations are experienced.

Fully test the happy path in one (big) test method. This makes sure you have one consistent data flow in your process. Additionally, it is easy to read and to understand, making it a great starting point for new developers to understand your process and process test case.

You were already exposed to the happy path in our example, which is the scenario that the invoice gets approved:

```java
@Test
public void happyPath() throws Exception {
    final HashMap<String, Object> variables = new HashMap<String, Object>();
    variables.put("approver", "Zee");
    variables.put("invoice", objectMapper.readTree(invoiceJson));

    // Kick off the process instance // <1>
    final var processInstance =
        client
            .newCreateInstanceCommand()
            .bpmnProcessId("Process_InvoiceApproval")
            .latestVersion()
            .variables(variables)
            .send()
            .join();

    // assert the User Task and simulate a human decision // <2>
    assertThat(byElementId("UserTask_ApproveInvoice")).isCreated().hasAssignee("Zee");
    processTestContext.completeUserTask(
        byElementId("UserTask_ApproveInvoice"), Map.of("approved", true));

    // This should make the process instance execute till the end // <3>
    assertThat(processInstance)
        .hasCompletedElementsInOrder(
            byId("StartEvent_InvoiceReceived"),
            byId("UserTask_ApproveInvoice"),
            byId("ServiceTask_ArchiveInvoice"),
            byId("ServiceTask_AddInvoiceAccounting"),
            byId("EndEvent_InvoiceApproved"))
        .isCompleted();

    // verify that side effects have happened // <4>
    verify(archiveService).archiveInvoice("INV-1001", objectMapper.readTree(invoiceJson));
    verify(accountingService).addInvoiceToAccount("0815", "INV-1001");
  }
```

#### Testing detours

Test _forks/detours_ from the happy path as well as _errors/exceptional_ paths as chunks in separate test methods. This allows to unit test in meaningful units.

The tests for the exceptional paths are basically very similar to the happy path in our example.

<span className="callout">2</span>

The invoice gets rejected:

```java
@Test
public void testRejectionPath() throws Exception {
    final HashMap<String, Object> variables = new HashMap<String, Object>();
    variables.put("approver", "Zee");
    variables.put("invoice", objectMapper.readTree(invoiceJson));

    // We skip HTTP for the simple unit test - mock the http connector
    processTestContext.mockJobWorker("io.camunda:http-json:1").thenComplete();

    // Kick of the process instance
    final var processInstance =
        client
            .newCreateInstanceCommand()
            .bpmnProcessId("Process_InvoiceApproval")
            .latestVersion()
            .variables(variables)
            .send()
            .join();

    // assert the User Task and simulate a human decision
    assertThat(byElementId("UserTask_ApproveInvoice")).isCreated().hasAssignee("Zee");
    processTestContext.completeUserTask(
        byElementId("UserTask_ApproveInvoice"),
        Map.of( //
            "approved",
            false, //
            "rejectionReason",
            "it is a test case :-)"));

    // This should make the process instance execute till the end
    assertThat(processInstance)
        .hasCompletedElementsInOrder(
            byId("StartEvent_InvoiceReceived"),
            byId("UserTask_ApproveInvoice"),
            byId("Gateway_Approved"),
            byId("ServiceTask_SendRejection"),
            byId("EndEvent_InvoiceRejected"))
        .isCompleted();
  }
```

<span className="callout">3</span>

A timeout on waiting for approval leads to an automatic approval:

```java
@Test
public void testApprovalTimeout() throws Exception {
    final HashMap<String, Object> variables = new HashMap<String, Object>();
    variables.put("approver", "Zee");
    variables.put("invoice", objectMapper.readTree(invoiceJson));

    final var processInstance =
        client
            .newCreateInstanceCommand()
            .bpmnProcessId("Process_InvoiceApproval")
            .latestVersion()
            .variables(variables)
            .send()
            .join();

    // assert the User Task and simulate the timeout
    assertThat(processInstance).hasActiveElements("UserTask_ApproveInvoice");
    processTestContext.increaseTime(Duration.ofDays(5));

    // This should make the process instance auto approve and run till the end
    assertThat(processInstance)
        .isCompleted()
        .hasCompletedElementsInOrder(
            byId("StartEvent_InvoiceReceived"),
            byId("ServiceTask_ArchiveInvoice"),
            byId("ServiceTask_AddInvoiceAccounting"),
            byId("EndEvent_InvoiceApproved"))
        .hasTerminatedElements(byId("UserTask_ApproveInvoice"));
  }
```

<span className="callout">4</span>

An approved invoice can't get archived:

```java
@Test
public void testArchiveSystemError() throws Exception {
    final HashMap<String, Object> variables = new HashMap<String, Object>();
    variables.put("approver", "Zee");
    variables.put("invoice", objectMapper.readTree(invoiceJson));

    doThrow(new WiredLegacyException()).when(archiveService).archiveInvoice(anyString(), any());

    final var processInstance =
        client
            .newCreateInstanceCommand()
            .bpmnProcessId("Process_InvoiceApproval")
            .latestVersion()
            .variables(variables)
            .send()
            .join();

    // approve the request
    assertThat(byElementId("UserTask_ApproveInvoice")).isCreated();
    processTestContext.completeUserTask(byElementId("UserTask_ApproveInvoice"),
      Map.of("approved", true));

    // This should lead to the exception being thrown, causing the process to end up in the user task designed to handle the problem.
    assertThat(byElementId("UserTask_ManuallyArchiveInvoice"))
        .isCreated();
        // The test for .hasCandidateGroup("archive-team") is probably not worth implementing
        // as it limits flexibility in model changes.
    processTestContext.completeUserTask(byElementId("UserTask_ManuallyArchiveInvoice"));

    assertThat(processInstance)
        .isCompleted()
        .hasCompletedElementsInOrder(
            byId("StartEvent_InvoiceReceived"),
            byId("UserTask_ApproveInvoice"),
            byId("UserTask_ManuallyArchiveInvoice"),
            byId("ServiceTask_AddInvoiceAccounting"),
            byId("EndEvent_InvoiceApproved"))
        .hasTerminatedElements(byId("ServiceTask_ArchiveInvoice"));
    verify(accountingService).addInvoiceToAccount("0815", "INV-1001");
  }
```

<!--
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/extensions-integrations/ext-testing-process-definitions-110.json** and nothing else.
2. The id MUST be `ext-testing-process-definitions-110`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/best-practices/development/testing-process-definitions/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".
