# Authoring task: dev-getting-started-orchestrate-human-tasks-04

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/dev-environment/dev-getting-started-orchestrate-human-tasks-04.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `dev-getting-started-orchestrate-human-tasks-04` (use exactly this id)
- **topic**: `dev-environment`
- **difficulty**: `easy`
- **style**: `concept`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/guides/getting-started-orchestrate-human-tasks/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): "Step 4: Run your process"

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
**Section heading**: Step 4: Run your process

```markdown
## Step 4: Run your process

Your process is now ready to run. Given its human-centric nature, it is well suited to be run in Tasklist. In order to make it accessible from Tasklist, the process must be deployed first.

:::tip
Human-centric processes involving user tasks seamlessly unfold within Tasklist, offering a cost-effective orchestration solution for human work with forms. However, the versatility of these processes extends beyond Tasklist, encompassing various alternative methods and applications. For instance, users can be redirected to external applications to fulfill tasks, bespoke task applications can be developed for any domain, or interactions with the physical world can be captured through event signals from sensors and IoT devices.
:::

### Deploy and test run

<Tabs groupId="install" className="tabs-hidden">
<TabItem value="saas">

1. Click **Deploy** to deploy the process to your cluster. If you have not yet created a cluster, clicking **Deploy** will take you to Console to [create a cluster](create-cluster.md) first.
2. After you deploy your process, it can be executed on the cluster. There are multiple ways to run a process. This time, click **Run** in Modeler for a test run.

:::tip
Other options to run a process are to start it via Tasklist, test it in the Play mode, or call it via the API or an inbound trigger. Read more about [run options](/components/modeler/web-modeler/run-or-publish-your-process.md).
:::

</TabItem>
<TabItem value="sm">

:::note
Ensure your installation of [Camunda 8 Run](/self-managed/quickstart/developer-quickstart/c8run.md) is running prior to deploying your process.
:::

1. Click the rocket-shaped **Deploy** icon to begin deploying your process, and provide the following configuration:
   - **Target:** Self-Managed
   - **Cluster endpoint:** `http://localhost:8080/v2`
   - **Authentication:** None
2. Click **Deploy** to deploy your process.
3. To run your new process, click the arrow-shaped **Run** icon, and provide your form input as JSON (for example, `{"meal": "chicken"}`).

   <img src={RunProcessSM} style={{width: 300}} alt="Enter optional variables to use and run your process" />

4. Click **Run** to run your process with the provided variables.

</TabItem>
</Tabs>

### Check successful start in Operate

<Tabs groupId="install" className="tabs-hidden">
<TabItem value="saas">

1. The process start will be confirmed via a notification message on the screen. Click the **chevron icon** next to **Run** to open more options. Click **View process instances** to see the running process in Operate.
   <img src={RunProcessImg} style={{width: 300}} alt="Run action in Modeler" />

2. In Operate, you will see a visualization of the running process instance. Notice that a green **token** is waiting at the user task. This means that a task is waiting to be worked on in Tasklist.
   <img src={OperateHumanTasks} alt="Process instance monitoring in Operate" />

:::tip
In production, Operate is used to monitor both long-running and straight-through, high-throughput processes. In development environments, use Operate to confirm if the process flow works as expected. For faster in-place validation during development, use the [Play mode](/components/modeler/web-modeler/collaboration/play-your-process.md).
:::

</TabItem>
<TabItem value="sm">

1. Open Operate at `http://localhost:8080/operate`, and select **Processes** from the top bar.
2. In the **Process** panel, use the **Name** drop-down to select your process.
3. A visualization of your running process instance now displays in Operate, and your user task is marked with a green **token** icon. This means that a task is waiting to be worked on in Tasklist.

   <img src={OperateHumanTasks} alt="Process instance monitoring in Operate" />

</TabItem>
</Tabs>
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/dev-environment/dev-getting-started-orchestrate-human-tasks-04.json** and nothing else.
2. The id MUST be `dev-getting-started-orchestrate-human-tasks-04`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/guides/getting-started-orchestrate-human-tasks/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".


<!-- LINT REWORK -->

### Lint feedback from previous attempt

Your previous output failed these strict lints. Fix every one of them and rewrite the JSON file:

- [scenario-missing-measurable] scenario lacks a number/currency/duration anchor @ scenario

Overwrite `pipeline/generation/outputs/dev-environment/dev-getting-started-orchestrate-human-tasks-04.json` with a corrected JSON document and stop.
