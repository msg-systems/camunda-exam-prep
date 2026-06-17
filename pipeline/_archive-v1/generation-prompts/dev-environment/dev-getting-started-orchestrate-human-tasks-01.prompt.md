# Authoring task: dev-getting-started-orchestrate-human-tasks-01

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/dev-environment/dev-getting-started-orchestrate-human-tasks-01.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `dev-getting-started-orchestrate-human-tasks-01` (use exactly this id)
- **topic**: `dev-environment`
- **difficulty**: `easy`
- **style**: `scenario`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/guides/getting-started-orchestrate-human-tasks/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): "Step 2: Design a form"

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
  "id": "dev-docker-compose-lightweight-components",
  "topic": "dev-environment",
  "subtopic": "Docker Compose included components",
  "difficulty": "medium",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Helios Logistics has 3 developers running the lightweight Docker Compose configuration on macOS to evaluate Camunda 8.8 for 30 days. A team member assumes Web Modeler and Optimize will be available at first run and reports an issue when those URLs return 404 errors after the 5-minute startup completes.",
  "question": "Which set of components is included in the default lightweight Docker Compose configuration?",
  "options": [
    { "id": "a", "text": "Orchestration Cluster, Connectors, and Elasticsearch as the default secondary storage for indexing and search" },
    { "id": "b", "text": "Orchestration Cluster, Connectors, Elasticsearch, Optimize, Console, Web Modeler, Keycloak, and PostgreSQL as the unified default" },
    { "id": "c", "text": "Orchestration Cluster, Connectors, H2 as the default secondary storage, plus an embedded Keycloak for local identity" },
    { "id": "d", "text": "Orchestration Cluster and Connectors only, with no secondary storage configured so the user must add an Elasticsearch container" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. The lightweight Docker Compose configuration ships with the Orchestration Cluster, Connectors, and Elasticsearch as the default secondary storage." },
    "b": { "text": "Incorrect. Optimize, Console, Web Modeler, Keycloak, and PostgreSQL belong to the full Docker Compose configuration, not the lightweight default." },
    "c": { "text": "Incorrect. H2 is the default secondary storage for Camunda 8 Run, not for the Docker Compose lightweight configuration which uses Elasticsearch." },
    "d": { "text": "Incorrect. The lightweight Docker Compose ships with Elasticsearch as default secondary storage out of the box; users do not have to add a container." }
  },
  "explanation": "The lightweight Docker Compose configuration includes the Orchestration Cluster, Connectors, and Elasticsearch. The full configuration additionally bundles Optimize, Console, Management Identity, Web Modeler, Keycloak, and PostgreSQL.",
  "docs": [
    { "title": "Developer quickstart with Docker Compose", "url": "https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/docker-compose/" }
  ]
}
```

**Exemplar 2** (from authored pool):

```json
{
  "id": "dev-c8run-vs-docker-compose-vs-helm",
  "topic": "dev-environment",
  "subtopic": "local dev environment selection",
  "difficulty": "easy",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Aurora Bank is onboarding 12 new Camunda 8 developers who need a local environment to model BPMN, deploy to a local Orchestration Cluster, and try inbound webhook connectors. The platform team wants the lightest possible footprint on each developer laptop, and the same setup must NOT be promoted to production for the upcoming payments rollout.",
  "question": "Which local-environment option matches both the laptop-footprint and the no-production constraint?",
  "options": [
    { "id": "a", "text": "Use Camunda 8 Run on each laptop for local development, and switch to Kubernetes with Helm when the team is ready for production" },
    { "id": "b", "text": "Use Camunda 8 Run on each laptop for local development, and promote the same Camunda 8 Run installation to a shared production server" },
    { "id": "c", "text": "Use the full Docker Compose stack with Optimize, Console, Web Modeler, and Keycloak on every laptop for both local development and production" },
    { "id": "d", "text": "Use Kubernetes with Helm on each laptop for local development to keep parity with production and avoid switching deployment tooling later" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. Camunda 8 Run is the lightweight local distribution intended for development and prototyping, and the docs explicitly direct teams to Kubernetes with Helm for production deployments." },
    "b": { "text": "Incorrect. The Camunda 8 Run docs state the distribution is not intended for production use; production should run via the manual Java install or Helm." },
    "c": { "text": "Incorrect. The Docker Compose files are documented as local development and evaluation only, and the full stack is the heaviest option, not the lightest." },
    "d": { "text": "Incorrect. Running the full Kubernetes Helm stack on every laptop is the heaviest footprint and conflicts with the laptop-footprint requirement the platform team set." }
  },
  "explanation": "Camunda 8 Run is the documented lightweight local option for developers. Production deployments should use Kubernetes with Helm; Docker Compose files are explicitly local-only.",
  "docs": [
    { "title": "Developer quickstart – Camunda 8 Run", "url": "https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/" }
  ]
}
```

### Source chunk — ALL facts in your answer must trace back to this content

**File**: `pipeline/sources/dev-environment/getting-started-orchestrate-human-tasks.md`
**Public URL**: https://docs.camunda.io/docs/guides/getting-started-orchestrate-human-tasks/
**Section heading**: Step 2: Design a form

```markdown
## Step 2: Design a form

You have now designed the process. To allow the user to make the decision, you will now design a [form](../components/modeler/forms/camunda-forms-reference.md). Forms can be added to user tasks and start events to capture user input, and the user input can be used to route the process flow, to make calls to APIs, or to orchestrate your services.

<Tabs groupId="install" className="tabs-hidden">
<TabItem value="saas">

1. Select the user task you created in **[Step 1](#step-1-create-a-new-process)**.
2. Click the blue **link icon** in the lower right corner. A menu expands that allows you to create a new form.
   <img src={ModelerFormMenuImg} style={{width: 400}} alt="Annotation to open the form menu" />
3. Click **Create new form**. A form will be created and opened in the form editor. The form is automatically named.

:::note
Don't worry about saving your process diagram. Modeler automatically saves every change you make.
:::

5. Click and drag the **Text view** component (found under Presentation) to the empty form.
   <img src={FormEditorImg} alt="Dragging a component to a form" />

6. Open the **General** section in the properties panel and enter a text, such as `What's for dinner?`.
7. Click and drag the **Radio** component to the form to create a radio group. Give it a descriptive name within the properties panel.
8. Additionally, set a **key** which maps to a process variable. The value of the component will be stored in this variable, and it can be read by the process that uses this form. As already defined by the conditions in the process earlier, use the variable `meal`.
   <img src={FormValuesTop} style={{width: 250}} alt="Defining a radio group's name and key" />
9. Scroll down to the **Static options** section of the properties panel to add radio options. Since there are two options for the dinner, add an extra value by clicking on the plus sign. Enter the value `Chicken` with the same label as `Chicken` and enter the value `Salad` with the label as `Salad` in the other value.
   <img src={FormValuesBottom} style={{width: 250}} alt="Defining a radio group's static option values" />

</TabItem>
<TabItem value="sm">

1. Create a new Form in Desktop Modeler by navigating to **File -> New File -> Form (Camunda 8)**.
2. Click and drag the **Text view** component (found under Presentation) to the empty form.
3. <img src={FormEditorImg} alt="Dragging a component to a form" />

4. Open the **General** section in the properties panel and enter a text, such as `What's for dinner?`.
5. Click and drag the **Radio** component to the form to create a radio group. Give it a descriptive name within the properties panel.
6. Additionally, set a **key** which maps to a process variable. The value of the component will be stored in this variable, and it can be read by the process that uses this form. As already defined by the conditions in the process earlier, use the variable `meal`.

   <img src={FormValuesTop} style={{width: 250}} alt="Defining a radio group's name and key" />

7. Scroll down to the **Static options** section of the properties panel to add radio options. Since there are two options for the dinner, add an extra value by clicking on the plus sign. Enter the value `Chicken` with the same label as `Chicken` and enter the value `Salad` with the label as `Salad` in the other value.

   <img src={FormValuesBottom} style={{width: 250}} alt="Defining a radio group's static option values" />

8. In your form's properties panel, copy the Form ID for use in your process.

   <img src={FormId} style={{width: 250}} alt="The form properties panel, showing the form ID" />

:::note
If the properties panel for your form doesn't open automatically, navigate to **Window -> Toggle Properties Panel** to open it manually.
:::

</TabItem>
</Tabs>
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/dev-environment/dev-getting-started-orchestrate-human-tasks-01.json** and nothing else.
2. The id MUST be `dev-getting-started-orchestrate-human-tasks-01`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/guides/getting-started-orchestrate-human-tasks/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".
