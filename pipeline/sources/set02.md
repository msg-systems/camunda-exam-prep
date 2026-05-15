# Camunda 8 C8-CP-DV — Full Mock Exam Set 2 (60 Questions, v2.0)

> **Версия:** v2.0 Set 2 (May 2026) | **Базиран на:** Exam Blueprint v8.8.0
>
> **Companion of:** `full_exam_60q_v2.md` (Set 1). Different scenarios, same Blueprint distribution and same v2.0 anatomy.
>
> **Exam format:** 60 MCQ × 4 options, 75 минути, 65% passing (39/60), $200 USD, 2-year validity, English language.

---

## Table of Contents (60 questions, weighted by Blueprint v8.8.0)

| # range | Topic | Weight | Count |
|---|---|---:|---:|
| Q1 – Q9 | **Modeling** | 15% | 9 |
| Q10 – Q22 | **Configuring Processes** | 22% | 13 |
| Q23 – Q29 | **Decisions & Business Rules (DMN)** | 11% | 7 |
| Q30 – Q32 | **Configuring Forms** | 5% | 3 |
| Q33 – Q36 | **Configuring Connectors** | 6% | 4 |
| Q37 – Q50 | **Developing Extensions & Integrations** | 25% | 14 |
| Q51 – Q59 | **Managing the Development Process** | 15% | 9 |
| Q60 | **Setting up a Development Environment** | 1% | 1 |
| | **Total** | **100%** | **60** |

---

# Section 1 — Modeling (Questions 1-9)

> Weight 15% • Topics: Pools & Lanes, 7 task types, 4 gateway types, 7 event types × 3 positions, 4 subprocess types, Multi-Instance marker.

---

## Question 1: Modeling (Weighting: 15%)

**Scenario:** A regional hospital orchestrates its **scheduled surgical workflow** in Camunda 8 Self-Managed. Each surgery involves several pre-operative steps: patient pre-medication, anesthesia preparation, sterile equipment setup, and operating room booking. These steps must occur in a strict order because each one consumes resources and creates state (drugs administered, equipment dedicated, OR blocked from other procedures). If the surgery is cancelled mid-prep — for example, the patient's blood test reveals a contraindication after pre-medication is already given — the hospital must **safely undo** whatever has already been done: reverse the medication where possible, return equipment to pool, release the OR.

The current implementation models the four steps as four sequential Service Tasks. When a cancellation event fires from the chief surgeon, an Error Boundary Event routes to four manually-coded "Undo X" Service Tasks. Last quarter, a cancellation hit the workflow after pre-medication but before equipment setup; the "Undo Equipment" task ran anyway (returning equipment that was never reserved) producing an inventory mismatch. There is also no record in Operate of which undo steps succeeded vs which were skipped because they were unnecessary.

The clinical operations team wants a model where **only the already-completed steps are rolled back, in reverse order, with a full audit per step**.

**Which BPMN pattern best fits this requirement?**

- **a)** Place the four surgical preparation Service Tasks inside a **Transaction Subprocess**, attach a **Compensation Boundary Event with a dedicated Compensation Handler** to each task, and throw a **Compensation End Event** when the cancellation message arrives. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **b)** Wrap the four tasks in a regular subprocess, add an **Error Boundary Event** for cancellation, and route to a sequence of four "Undo X" Service Tasks each with a conditional FEEL gateway checking `=stepCompleted.X`. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** Replace the Service Tasks with **Send Tasks** that publish to an "operations" topic, and let four downstream **Receive Tasks** listen for either "completed" or "cancelled" messages to perform compensation by correlation. Documentation: [Send/Receive Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/tasks/)

- **d)** Use a **Parallel Multi-Instance Subprocess** with input collection `["medicate","anesthesia","equipment","or-booking"]`, and inside each instance, use an Exclusive Gateway to choose between "do" and "undo" branches based on a `mode` variable. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Compensation Subprocess pattern is exactly engineered for this: each Service Task that completes successfully **registers its Compensation Handler** with the engine. When the Compensation End Event fires (triggered by the cancellation message handler), Zeebe walks **only the registered handlers in reverse completion order**. Steps that never completed have no registered handler, so they're not "undone". Each handler runs as a tracked activity in Operate — full per-step audit comes free.

- **Option b) — Incorrect.** Conditional FEEL gateways on every undo task is a manually-coded compensation map — exactly the design the scenario reports as fragile. It also leaks state (`stepCompleted.X` variables) into the process scope. Most importantly, ordering is not engine-managed: if you reorder the undo tasks in the model, you have to manually keep the FEEL conditions in sync. Compensation gives reverse order for free.

- **Option c) — Incorrect.** Send/Receive correlation is real Camunda 8 feature for **async message-based integration**, НЕ **transactional rollback**. The engine waits for response messages, introducing latency and a brittle correlation infrastructure for a problem BPMN already solves with Compensation. Audit trail also loses semantic clarity — "message correlated" doesn't read as "step X compensated".

- **Option d) — Incorrect.** Parallel Multi-Instance is for **parallel execution of similar work**, **НЕ** **coordinated rollback across heterogeneous steps**. The four surgical preparation steps differ in inputs, outputs, side effects, and undo procedures. Cramming them into MI iterations forces awkward `mode` switches and abandons reverse-order semantics — MI gives no rollback ordering at all.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Transaction + Compensation Boundary + Handler е BPMN-каноничният Saga; LIFO + per-handler audit идват автоматично.
- **b) 4/10** — manual undo-by-flag работи но е fragile; държи compensation state в process variables.
- **c) 3/10** — Send/Receive е async messaging на **wrong axis** — не transactional rollback.
- **d) 2/10** — Multi-Instance е similar parallel work, не heterogeneous rollback. Wrong tool.

**Correct Answer:** Place the four surgical preparation Service Tasks inside a Transaction Subprocess, attach a Compensation Boundary Event with a dedicated Compensation Handler to each task, and throw a Compensation End Event when the cancellation message arrives.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Sequential prep + cancel mid-flow + selective undo + reverse order + audit per step" → разпознаваш че проблемът е **Saga / transactional rollback orchestration**, не error handling, не concurrency. Сигналът "audit per step + reverse order + only completed" сочи към BPMN Compensation, не custom error logic.

**Въпросът → Solution Framing.** "Only already-completed steps" + "in reverse order" + "full audit per step" — три independent изисквания които ВСИЧКИТЕ Compensation дава автоматично. Distractors имитират решения на едно от трите (option b - manual conditional), но не и трите.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Compensation Boundary регистрира handler **при successful completion**, знаеш че Compensation End инициира **LIFO walk на registered handlers** (не на all handlers), знаеш че incomplete steps няма registered handlers (не се undo), знаеш че всеки handler е tracked activity в Operate. Това е разбиране за Compensation lifecycle в Zeebe.

---

## Question 2: Modeling (Weighting: 15%)

**Scenario:** An online auction platform built on Camunda 8 SaaS runs **timed bidding processes**. When a high-value lot opens, the process spawns a User Task "Place Bid" assigned to an interested bidder, with a strict **120-second window** to submit. The process must advance as soon as **one** of three events fires: (1) the bidder submits the bid; (2) the bidder explicitly withdraws (sends a "withdraw" message); (3) the 120-second timer expires. Whichever fires first, the other two must be **cleanly cancelled** — the team has been seeing strange behaviour where withdrawn lots still produce timer-expiry incidents minutes later, suggesting the timer is left running after the withdrawal already advanced the flow.

The current model uses a Parallel Gateway with three parallel branches: a Receive Task for "bid_placed", a Receive Task for "withdraw", and a Timer Catch Event. After any branch completes, a downstream Exclusive Gateway picks the winning branch.

**Which BPMN construct correctly models "first of N events wins, cancel the rest"?**

- **a)** An **Event-Based Gateway** with three catching events attached: two Message Catch Events (one for "bid_placed", one for "withdraw") and one Timer Catch Event (120 s). Whichever fires first claims the token; the engine **automatically unsubscribes** from the other two. Documentation: [Event-Based Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/)

- **b)** A regular **Receive Task** for "bid_placed" with two **Interrupting Boundary Events** attached — one Message Boundary for "withdraw", one Timer Boundary for 120 s. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** An **Inclusive Gateway** with three conditional flows checking `=bidReceived`, `=withdrawn`, `=timerExpired` variables. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **d)** A **Parallel Gateway** with three branches joined by a **Terminate End Event** in each so the first to complete kills the others. Documentation: [Terminate End Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Event-Based Gateway is precisely the BPMN construct for "race between N events with automatic cancellation of the losers". When the token reaches the gateway, Zeebe subscribes to all attached catching events simultaneously. The first event to fire **claims the token and the gateway unsubscribes** from the remaining events — no leaked timer subscriptions, no stale tokens, no orphaned race conditions.

- **Option b) — Partially viable but inferior.** Boundary Events on a Receive Task work for the simple "wait-for-X-with-timeout" pattern but get awkward with three competing events. You'd need the Receive Task to wait for "bid_placed" and place "withdraw" + timer as Boundary — which models the race correctly mechanically, but visually misrepresents "bid" as the primary and "withdraw" + "timeout" as exceptions. Event-Based Gateway expresses the symmetric race cleanly.

- **Option c) — Incorrect.** Inclusive Gateway evaluates **synchronous conditions on variables**, НЕ awaits events. It would route immediately based on current variable state — no waiting, no race. Wrong construct entirely.

- **Option d) — Incorrect.** Parallel Gateway opens all three branches in parallel which is the broken design described in the scenario; Terminate End Event kills the entire process instance (including downstream activities not yet started), too heavy. Same wrong semantic as the current broken model.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Event-Based Gateway е BPMN-стандартът за "first of N events, cancel the rest".
- **b) 6/10** — работи механично за 1 primary + boundaries, но visually-asymmetric за 3-way race.
- **c) 2/10** — Inclusive evaluates synchronous conditions, не awaits events.
- **d) 1/10** — Parallel + Terminate е оригиналния broken pattern.

**Correct Answer:** An Event-Based Gateway with three catching events attached: two Message Catch Events and one Timer Catch Event.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "First of N events wins" + "others must be cancelled" + "leaked timer after withdrawal" → разпознаваш race-between-events pattern with cancellation requirement. Сигналът "stale timer fires minutes after" е classic Parallel Gateway-without-cancellation bug.

**Въпросът → Solution Framing.** "First-fires-and-rest-cancelled" е директната формулировка. Изключва Parallel Gateway (no auto-cancellation) и Inclusive Gateway (no event waiting).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Event-Based Gateway прави **subscribe-to-all-then-unsubscribe-on-first-fire** автоматично, знаеш че Boundary Events работят за asymmetric "primary + interrupts" но не за symmetric N-way race, знаеш че Inclusive evaluates condition expressions synchronously, знаеш че Parallel + Terminate е оригиналния bug. Това е разбиране за event subscription lifecycle.

---

## Question 3: Modeling (Weighting: 15%)

**Scenario:** A high-volume manufacturing plant orchestrates production line monitoring via Camunda 8. When an assembly run starts, a User Task "Monitor Line" is assigned to a shift supervisor. The plant manager wants two levels of alerting attached to this task: at **15 minutes** of inactivity the system should **page the line lead** (notification only — supervisor's task continues); at **30 minutes** the system must **escalate** by force-cancelling the supervisor's task, reassigning to plant management, and starting an incident review process.

Previous attempts placed two Interrupting Boundary Events on the User Task — the first one fired correctly at 15 min but **cancelled the supervisor's task immediately** preventing them from continuing work; the line lead got notified but the supervisor was kicked out of an active task, producing data inconsistency.

**How should the developer configure the Boundary Events for correct two-stage escalation?**

- **a)** Attach **one Non-interrupting Timer Boundary Event at 15 min** (notify line lead, supervisor's task continues) and **one Interrupting Timer Boundary Event at 30 min** (cancel task, escalate to plant management). Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **b)** Attach **two Interrupting Timer Boundary Events** at 15 min and 30 min — the first one's outgoing flow can re-instantiate a new User Task assigned to the same supervisor. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** Attach **two Non-interrupting Timer Boundary Events** at 15 min and 30 min — both notify without cancelling, and an Exclusive Gateway downstream chooses the appropriate handler based on a `severity` variable. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **d)** Place the User Task inside an Event Subprocess with two Timer Start Events (non-interrupting at 15 min, interrupting at 30 min). Documentation: [Event Subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Non-interrupting Boundary at 15 min **spawns a new token** following its outgoing flow (the notify-line-lead path) while leaving the User Task active and claimable — exactly the "alert without cancellation" semantic the plant manager wants. Interrupting Boundary at 30 min **cancels the User Task** and the token follows the boundary's outgoing flow (escalation path). Two different timers with two different semantics; canonical "soft warning then hard timeout" pattern.

- **Option b) — Incorrect.** Two Interrupting Boundaries means the 15-min boundary cancels the task and re-instantiation loses the operator's bookmark, claim history, and any partial state. Plus cancelling at 15-min was the original bug.

- **Option c) — Incorrect.** Two Non-interrupting means at 30 min the task **continues** when the plant manager wanted it cancelled. Both events fire notifications but the task is never terminated.

- **Option d) — Incorrect.** Event Subprocess with Timer Start Events fires when the **enclosing scope** matches the trigger condition — works for scope-level events, but for activity-level escalation on a specific User Task you need Boundary Events on the activity. Wrong scope.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Mixed Non-interrupting + Interrupting Boundary е canonical "soft warning then hard timeout" pattern.
- **b) 3/10** — двата cancel — оригиналния bug повторен. Re-instantiation губи task identity.
- **c) 4/10** — двата notify но не cancel — нарушава 30-min escalation requirement.
- **d) 2/10** — Event Subprocess е scope-level, не activity-level.

**Correct Answer:** Attach one Non-interrupting Timer Boundary Event at 15 min and one Interrupting Timer Boundary Event at 30 min.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Notify without cancel" + "force-cancel and escalate" → разпознаваш две различни behaviour-а на същата активност при два различни лимита — класически dual-deadline SLA pattern с mixed boundary semantics.

**Въпросът → Solution Framing.** "Soft alert + hard escalation" — изключва решения с еднакъв тип boundary. Ключовите думи "supervisor's task continues" и "force-cancelling" сигнализират за Non-interrupting + Interrupting respectively.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Non-interrupting Boundary **spawn-ва нов token** оставяйки активността жива, знаеш че Interrupting Boundary **отнема token-а** и затваря scope, знаеш че може да закачиш multiple boundaries на същата активност (всеки независимо), знаеш че Event Subprocess е scope-level не activity-level. Това е знание за token lifecycle.

---

## Question 4: Modeling (Weighting: 15%)

**Scenario:** A telecommunications carrier sells four products: mobile data plan, broadband internet, IPTV service, and landline. Each product has its own provisioning workflow in Camunda 8, but **all four share an identical 7-step Credit Check sub-flow**: pull credit bureau report, check internal debt history, check fraud markers, compute risk score, decide automated vs manual review, log compliance trail, and notify compliance officer. Previously, all four product flows had inline copies of this 7-step block; when regulation required a new fraud-marker check, the team updated three of four products and discovered the miss only when an angry compliance officer escalated.

The architect wants to **extract Credit Check into a single deployable artifact** so future regulatory changes touch one place. In-flight provisioning workflows that have already passed Credit Check must continue at their original version (already validated against the old rules); new instances pick up the latest version.

**Which BPMN construct fits this reuse + version-isolation requirement?**

- **a)** Deploy Credit Check as a standalone BPMN process and invoke it from each product workflow via a **Call Activity** referencing the Credit Check process by `processId`. Each invocation starts a new Credit Check instance with its own version reference. Documentation: [Call Activities](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **b)** Convert Credit Check into an **Embedded Subprocess** in each product workflow, and configure **Element Templates** so all four embed share the same XML configuration. Documentation: [Element Templates](https://docs.camunda.io/docs/components/concepts/element-templates/)

- **c)** Build Credit Check as a **Custom Connector** using the Connector SDK and use a single Service Task in each product workflow. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **d)** Model Credit Check as a **Multi-Instance Subprocess** with input collection `[mobile, broadband, iptv, landline]`. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Call Activity is the BPMN standard for **cross-process reuse with version isolation**. The Call Activity reference (`processId`) points at the deployed Credit Check process — each invocation starts a separate process instance with its own version. In-flight provisioning workflows that called Credit Check v1.2 hold a version reference to v1.2; new workflows pick up the latest deployed version. Variables are mapped via Call Activity input/output mappings, keeping scope clean.

- **Option b) — Incorrect.** Element Templates standardise **single-element configuration** (e.g., a Service Task's URL/auth), НЕ **reusable multi-step process logic**. Four Embedded Subprocesses with identical templates still mean four copies of the 7-step flow that all need separate updates. Templates don't substitute for true model reuse.

- **Option c) — Incorrect.** Connector SDK is for **single-call integrations with external systems**, НЕ **multi-step process orchestration with internal flow control and per-step audit**. Wrapping 7 internal steps inside a Connector hides them from BPMN — no per-step audit in Operate, no per-step retry, no per-step monitoring. Wrong abstraction level.

- **Option d) — Incorrect.** Multi-Instance executes the **same activity N times with different inputs from a collection**. Here we have **one Credit Check called from four different products**, not four iterations of the same operation. Wrong abstraction.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Call Activity е BPMN-стандартът за model reuse + version isolation.
- **b) 3/10** — Element Templates стандартизират конфигурация на ниво елемент, не цял sub-flow.
- **c) 4/10** — Custom Connector е **wrong axis** — за external integration, не internal orchestration. Hides BPMN structure.
- **d) 2/10** — Multi-Instance е за repetition same activity, не cross-process reuse.

**Correct Answer:** Deploy Credit Check as a standalone BPMN process and invoke it from each product workflow via a Call Activity referencing the Credit Check process by `processId`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Same 7 steps in 4 products" + "single deployable artifact" + "in-flight at old version, new at latest" → разпознаваш че се иска **cross-process model reuse + version isolation**, не configuration sharing, не parallelism.

**Въпросът → Solution Framing.** "Reusable + version-isolation" в въпроса определят какъв тип reuse — на ниво **deployed process model**, не на ниво snippet. Това отрязва Element Templates (template = config, не model) и Connectors (single-call, not multi-step).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Call Activity създава **separate process instance** със собствен version reference, знаеш че Embedded Subprocess живее **inline в parent-а** (не cross-process reuse), знаеш че Element Templates са design-time configuration tooling, знаеш че Connectors хапсват multi-step audit. Това е разбиране за scope hierarchy и deployment lifecycle.

---

## Question 5: Modeling (Weighting: 15%)

**Scenario:** A pharmacy chain processes prescription batches via Camunda 8 SaaS. Each batch (typically 30-150 prescriptions per pharmacist's shift) is processed through a **Parallel Multi-Instance Subprocess** that validates each prescription against a federal regulator's drug-interaction database. The federal regulator's API enforces a strict **rate limit of 4 requests per second per registered client** — exceeding it returns HTTP 429 and after repeated violations the client gets temporarily suspended for compliance review. Currently the worker fires all multi-instance jobs concurrently, immediately tripping the rate limit; the resulting 429 storm and worker retries push batch processing time from seconds into the tens of minutes range.

The pharmacy operations team wants to **preserve the Multi-Instance abstraction** (one prescription per iteration is the natural model) but pace the API calls so they respect the regulator's rate limit cleanly.

**Which Multi-Instance configuration solves this?**

- **a)** Change the marker from **Parallel** to **Sequential** Multi-Instance. Each prescription is validated one at a time in deterministic order; the natural processing pace stays well within the regulator's 4 req/sec limit if each call takes ≥250 ms. Documentation: [Sequential Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Keep the Parallel Multi-Instance and configure `zeebe:taskDefinition retries=10` so Zeebe automatically retries any 429-failed jobs after a short delay. Documentation: [Job retries](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Keep Parallel Multi-Instance and add a downstream Service Task with a 250-ms Timer Catch Event before each provider call. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Replace the Multi-Instance with a single Service Task that batches all prescriptions into one bulk API call. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Sequential Multi-Instance processes prescription N+1 only when prescription N completes. With ~250 ms typical API latency per validation, this naturally produces a sustained request rate at or below 4 req/sec — under the regulator's threshold by construction. No 429s, no retry churn, predictable throughput. Trade-off is total batch latency (250 ms × 150 ≈ 37 s for max batch), but that IS the throughput ceiling the regulator imposes — sequential MI surfaces it cleanly rather than fighting it.

- **Option b) — Incorrect.** `retries` controls **how many times Zeebe re-activates a failed job before declaring an incident**, НЕ **how fast jobs are dispatched**. With Parallel MI, all N jobs fire concurrently; if the regulator returns 429, they all retry concurrently and re-trip the limit. Classic wrong-axis pattern: retries solve transient failures, not concurrency control.

- **Option c) — Incorrect.** Adding a Timer Catch Event inside each MI iteration delays each provider call by 250 ms but does NOT serialise them — Parallel MI still fires all iterations concurrently, so all timers tick down concurrently, then all calls fire after the same 250-ms wait. No effective throttle.

- **Option d) — Incorrect.** Bulk batching is structurally different — the regulator's API is described as per-line-item with 4 req/sec, not bulk-accepting. Inventing a bulk endpoint that doesn't exist is non-implementable. Also collapses per-prescription audit in Operate to a single row.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Sequential MI дава вграден backpressure съответстващ на rate limit.
- **b) 3/10** — `retries` е recovery, не rate limiting. Wrong axis.
- **c) 2/10** — Parallel MI с per-iteration timer не serialise-ва — всички timers tick concurrently.
- **d) 1/10** — измисля bulk endpoint; невалидно.

**Correct Answer:** Change the marker from Parallel to Sequential Multi-Instance.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "4 req/sec rate limit" + "Parallel MI firing concurrently" + "429 storm + retry churn" → разпознаваш че проблемът е **concurrency control**, не error handling. Camunda трябва да **ограничи скоростта на dispatch**, не да реагира на грешки.

**Въпросът → Solution Framing.** "Pace the API calls" е директната подсказка — търси се конфигурация която променя **темпото на изпълнение**, не error-path. Изключва retries (option b) и downstream timers (option c — които не serialise).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Parallel MI fires **all instances simultaneously**, знаеш че Sequential MI **chains** instance N+1 после instance N, знаеш че `retries` контролира failed-job re-activation, не dispatch rate, знаеш че Timer Catch вътре в parallel MI не serialise-ва (всички timers tick concurrently). Това е разбиране за MI execution semantics + concurrent timer behaviour.

---

*(Section 1 Modeling — 5 of 9 questions complete. Next: Q6-Q9 Modeling continued.)*

<!-- END OF BATCH 1 — file will be appended in subsequent turns -->


## Question 6: Modeling (Weighting: 15%)

**Scenario:** A regional hospital integrates its patient registration system (Camunda 8 process) with an external **insurance verification service** operated by a separate government health agency. When a patient is admitted, the hospital's Camunda flow needs to: (1) submit insurance verification request to the agency, (2) wait for the agency's response, (3) proceed with admission based on whether coverage is approved.

The hospital's developer initially modeled this as a single Pool with a Service Task calling the agency's REST API. But the architect points out the BPMN model should reflect organisational reality — the hospital and agency are **separate organisations with separate process engines**, so the model must use two Pools. After the developer adds a second Pool labeled "Government Insurance Agency" and draws a Sequence Flow from the hospital's Service Task into the agency's Receive Task, the BPMN validator throws an error: "Sequence Flow cannot cross Pool boundary".

**What is the correct BPMN construct for communication between two independent organisations modeled as separate Pools?**

- **a)** Replace the cross-pool Sequence Flow with a **Message Flow**. On the hospital side, use a Send Task or Message Throw Event; on the agency side, use a Receive Task or Message Catch Event. Zeebe correlates incoming messages by a `correlationKey` expression. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **b)** Add a Parallel Gateway in the hospital Pool with one branch crossing into the agency Pool via a Sequence Flow. Documentation: [Parallel Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **c)** Move the agency Pool into the hospital Pool as a Lane labeled "Insurance Agency Role". Sequence Flows then work intra-pool. Documentation: [Pools & Lanes](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** Use a **Signal Throw Event** in the hospital Pool to broadcast to all listening processes including the agency Pool. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** In BPMN 2.0, **Sequence Flow is intra-pool only** — it expresses token flow within one process engine. **Message Flow is the cross-pool construct** representing asynchronous message passing between separate organisations/engines. The hospital Pool uses a Send Task/Message Throw to publish; the agency Pool uses a Receive Task/Message Catch to consume. In Zeebe, the receiver subscribes with a correlation key (e.g., `=patient_id`); incoming messages with matching keys activate the awaiting catch.

- **Option b) — Incorrect.** Parallel Gateway forks tokens **within a single process**, **НЕ** across organisational boundaries. Drawing a Sequence Flow from the gateway into another Pool is exactly the BPMN violation that triggered the error.

- **Option c) — Incorrect.** Lanes are **visual subdivisions within a single Pool** representing roles inside one organisation — not independent organisations. Putting the agency in a hospital Lane would imply the hospital controls agency execution, which is factually wrong.

- **Option d) — Incorrect.** Signal Events broadcast to **all listening processes globally**, **НЕ** specifically to a designated counterparty. Signal is BPMN's "system-wide event bus" — used for "any process listening for X should react", not for point-to-point handover.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Message Flow е BPMN-стандартът за cross-pool communication.
- **b) 1/10** — Parallel Gateway forks intra-pool, не cross-pool. Не решава нищо.
- **c) 3/10** — Lanes са visual subdivisions в same pool, не отделни организации.
- **d) 4/10** — Signal е real BPMN feature на **wrong axis** — broadcast, не point-to-point.

**Correct Answer:** Replace the cross-pool Sequence Flow with a Message Flow.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/message-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Two organisations + cross-pool Sequence Flow + validator error" → разпознаваш че проблемът е **BPMN 2.0 spec violation** (Sequence Flow is intra-pool only). Сигнал е, че двете страни са **независими execution domains** и BPMN има отделен construct за inter-engine communication.

**Въпросът → Solution Framing.** "Communication between two independent organisations" е директна формулировка — търси се cross-pool construct, не workaround в same-pool.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Sequence Flow е **token-passing within a single process engine**, знаеш че Message Flow е **async message between separate engines**, знаеш че Signal е **global broadcast** (различна семантика), знаеш че Lanes са **visual subdivision** в same pool. Това е знание за BPMN 2.0 spec, не Zeebe-specific.

---

## Question 7: Modeling (Weighting: 15%)

**Scenario:** A team migrating a complex BPMN process from Camunda 7 to Camunda 8 encounters Multi-Instance configuration that worked in 7 but fails to deploy in 8. The Camunda 7 model has a Multi-Instance Service Task with these BPMN extension properties:

```xml
<bpmn:multiInstanceLoopCharacteristics camunda:collection="${items}" camunda:elementVariable="item" />
```

When imported into Camunda 8 Web Modeler and deployed, the engine rejects the model with "missing multi-instance input collection". The developer is puzzled — the collection IS specified.

**What is the correct Camunda 8 Multi-Instance syntax?**

- **a)** Camunda 8 uses Zeebe namespace extensions: `zeebe:inputCollection="=items"` and `zeebe:inputElement="item"` (FEEL expression for collection, no `${}` syntax). The Camunda 7 extension properties are silently ignored by Zeebe because they're in a different namespace. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** The syntax is identical between Camunda 7 and 8; the deployment failure is from a different cause. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Camunda 8 requires the collection variable to be pre-populated by a Script Task; the Multi-Instance itself only specifies the iteration. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Camunda 8 doesn't support Multi-Instance natively; use a Loop with an Exclusive Gateway instead. Documentation: [Loops](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 7 and Camunda 8 use **different BPMN XML extension namespaces**. Camunda 7's `camunda:` extensions (e.g., `camunda:collection`, `camunda:elementVariable`) belong to the `http://camunda.org/schema/1.0/bpmn` namespace. Camunda 8's `zeebe:` extensions belong to `http://camunda.org/schema/zeebe/1.0`. Zeebe **silently ignores** anything not in its namespace — the deployment "succeeds" structurally but the Multi-Instance has no recognised collection binding, producing the runtime error. Plus FEEL syntax replaces JUEL: `=items` (FEEL expression prefix) instead of `${items}` (JUEL).

- **Option b) — Incorrect.** The syntaxes are genuinely different; namespace + expression language both changed.

- **Option c) — Incorrect.** No pre-population requirement — the Multi-Instance is configured with the collection FEEL expression directly.

- **Option d) — Incorrect.** Camunda 8 fully supports Multi-Instance with its own configuration namespace.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Namespace migration trap C7 → C8 + FEEL syntax.
- **b) 2/10** — невярна — syntax е различен.
- **c) 3/10** — invented requirement; не съществува pre-population necessity.
- **d) 1/10** — невярна — MI се support-ва.

**Correct Answer:** Camunda 8 uses Zeebe namespace extensions: `zeebe:inputCollection="=items"` and `zeebe:inputElement="item"`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Camunda 7 to 8 migration" + "MI worked in 7" + "deploy fails in 8 with 'missing collection'" → разпознаваш че проблемът е **silent namespace mismatch** (C7 extensions ignored by Zeebe).

**Въпросът → Solution Framing.** "Correct Camunda 8 Multi-Instance syntax" — изпитва се **specific syntactic knowledge на C8 extensions**.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че C7 и C8 имат **different XML extension namespaces** (camunda: vs zeebe:), знаеш че Zeebe **silently ignores** non-zeebe extensions, знаеш че FEEL `=expression` замества JUEL `${expression}` в C8, знаеш че deployment success не имплицира runtime success при namespace mismatch. Това е знание за Camunda 7→8 migration gotchas.

---

## Question 8: Modeling (Weighting: 15%)

**Scenario:** An e-commerce platform routes outbound shipments to three carriers based on destination geography — DHL for international, UPS for North America domestic, and a regional carrier for last-mile within Europe. A single order can have **multiple line items going to different destinations**, so for one order the process may need to dispatch to one, two, or all three carriers in parallel. After all dispatches finish, the order moves to "Confirm Shipment" once and only once.

The current model uses an Inclusive Gateway with three conditional flows (each checking destination region), three Service Tasks (one per carrier), and an Exclusive Gateway downstream to merge. Production traffic shows incorrect behaviour: when two carriers are activated, "Confirm Shipment" runs **twice**, producing duplicate confirmation emails to the customer.

**What is the correct join construct for "wait for only the activated parallel paths to complete"?**

- **a)** Replace the downstream Exclusive Gateway with an **Inclusive Gateway**. The joining Inclusive Gateway waits specifically for **the activated paths** (tracked by the engine based on which conditions were true at fork) before letting the token through. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **b)** Replace the downstream Exclusive Gateway with a **Parallel Gateway**. Parallel join always waits for all incoming flows. Documentation: [Parallel Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **c)** Convert the three Service Tasks into a **Multi-Instance Subprocess** with `completionCondition: =count(results) = count(carriers)`. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Keep the Exclusive Gateway downstream and add a Service Task that polls the Operate API for all parallel task completions before proceeding. Documentation: [Operate API](https://docs.camunda.io/docs/apis-tools/operate-api/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Inclusive Gateway is BPMN's construct for **conditional fan-out with matching conditional join**. At fan-out, it evaluates the FEEL conditions and activates only matching paths. **At join**, it waits **specifically for the paths that were activated upstream**, ignoring inactive paths. Zeebe tracks path activation state during execution and the joining Inclusive Gateway uses that state to know when all activated branches have arrived. This gives the precise "wait for all that started, not all defined" semantics.

- **Option b) — Incorrect.** Parallel Gateway expects ALL incoming flows (whether activated or not) — it would block indefinitely waiting for tokens from paths that were never activated at the fork. Wrong dimension: parallel = unconditional, inclusive = conditional.

- **Option c) — Incorrect.** Multi-Instance executes the **same activity N times** with different inputs. Here we have **three heterogeneous Service Tasks** (different APIs, different payloads). Wrapping them into MI is a mismodelling.

- **Option d) — Incorrect.** Operate API is **eventually consistent** and meant for human/admin querying, not runtime control flow. Polling for state in a Service Task adds latency, race conditions, and brittleness — and bypasses BPMN's native join semantics.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Inclusive Gateway join изчаква само активираните branches.
- **b) 4/10** — Parallel винаги fork-ва и join-ва всичко; ще се блокира.
- **c) 3/10** — Multi-Instance е за same activity repeated, не heterogeneous.
- **d) 2/10** — Operate API е query layer, не runtime control. Грешен layer.

**Correct Answer:** Replace the downstream Exclusive Gateway with an Inclusive Gateway.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Conditional parallel paths" + "merge after activated paths complete" + "Confirm runs twice" → разпознаваш че проблемът е **conditional fork-join synchronisation**. Exclusive Gateway downstream let-ва **всеки** входящ token през веднага → duplicate Confirm.

**Въпросът → Solution Framing.** "Wait for only the activated parallel paths" е директната формулировка. Изключва Parallel (waits for all defined) и Exclusive (lets through first).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Inclusive Gateway fork-ва conditionally и join-ва conditionally (track-вайки activation), знаеш че Parallel Gateway е unconditional fork-and-join, знаеш че Exclusive е first-wins не wait-for-all, знаеш че Multi-Instance е за repetition не heterogeneous parallel. Това е разбиране за BPMN gateway семантика.

---

## Question 9: Modeling (Weighting: 15%)

**Scenario:** A bank's wire transfer process must allow the **sender to cancel the transfer at any point** before it reaches the "Settle" step. Cancellation arrives as an asynchronous message `transferCancelled` correlated by `transfer_id`. The cancellation must work regardless of which stage the wire is at — validation, fraud check, AML screening, or awaiting clearance — and must run cleanly only **once** per transfer (multiple cancel requests should be idempotent).

The model must keep the main flow clean (not clutter with cancellation handling on every step) and the cancellation logic must **interrupt whatever step is currently active** to immediately route to the refund/notify path.

**Which BPMN construct models this asynchronous cancellation cleanly?**

- **a)** Wrap the main flow in a Subprocess and add an **Event Subprocess** with an **Interrupting Message Start Event** correlated on `transfer_id`. The Event Subprocess inside that scope will interrupt the parent when the message arrives. Documentation: [Event Subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

- **b)** Attach a **Non-interrupting Message Boundary Event** to every Service Task in the main flow, all routing to a shared "Handle Cancellation" subprocess. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** Place a **Message Catch Event** at the start of the process before validation begins. Documentation: [Message Catch Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **d)** Use an **Event-Based Gateway** with two branches at every transition between steps — one branch for the next step, one for cancellation. Documentation: [Event-Based Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Event Subprocess with an **Interrupting Message Start Event** is the BPMN-canonical pattern for "asynchronous interrupt at any point in a scope". The Event Subprocess lives **inside** the parent scope (the wrapping subprocess). When `transferCancelled` arrives, Zeebe cancels whatever is active in the main flow (interrupting), and the Event Subprocess's outgoing flow takes over (refund/notify). Single-fire semantics are default — once consumed, the message subscription closes for this scope. Clean main flow, clean scope-level interrupt.

- **Option b) — Incorrect.** Non-interrupting Boundary on every Service Task means **every task spawns a new parallel token** when the message arrives — main flow continues processing AND the cancellation handler runs concurrently. Refunding a wire that is simultaneously being settled is the failure mode the scenario forbids.

- **Option c) — Incorrect.** Message Catch Event before main flow would **block process start** until cancellation arrives — backwards semantics. The process would wait to be cancelled before it even began.

- **Option d) — Incorrect.** Event-Based Gateway at every transition clutters the main flow worse than option b and produces N gateways instead of one event subprocess. Also Event-Based Gateway is a **specific point-in-time choice**, not a continuous "any-point" interrupt.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Event Subprocess + Interrupting Message Start е канонът за async interrupt at any point.
- **b) 3/10** — Non-interrupting Boundary spawns parallel token; refund + settle едновременно. Wrong scope.
- **c) 2/10** — Message Catch в началото блокира start.
- **d) 3/10** — Event-Based Gateway е point-in-time choice + clutter.

**Correct Answer:** Wrap the main flow in a Subprocess and add an Event Subprocess with an Interrupting Message Start Event correlated on `transfer_id`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Cancel at any point" + "interrupt whatever is active" + "once per transfer" → разпознаваш че проблемът е **scope-level async interrupt** (не per-task error handling, не gateway routing). Triото "any-point + interrupt + single-fire" сочи към Event Subprocess.

**Въпросът → Solution Framing.** "Without cluttering main flow" е визуалното изискване — изключва решения с boundary-на-всеки-task (option b). "Interrupt whatever is active" е семантичното — изключва Non-interrupting.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Event Subprocess живее inside a scope и стартира при trigger, знаеш че Interrupting variant **terminate-ва parent scope**, знаеш че Non-interrupting **spawn-ва паралелен token**, знаеш че Message Catch е blocking wait state не reactive interrupt. Това е разбиране за scope hierarchy + interrupt semantics.

---

# Section 2 — Configuring Processes (Questions 10-22)

> Weight 22% • Topics: Task configuration for Zeebe execution, gateway/event Zeebe semantics, subprocess + call activity configuration, multi-instance, Document Handling, IDP, Element Templates, AI ad-hoc subprocess / AI agent connector.

---

## Question 10: Configuring Processes (Weighting: 22%)

**Scenario:** A wealth-management firm assigns "Approve Transaction" User Tasks to relationship managers. The business rule is: small transactions (under €25,000) can be claimed by any member of the "advisors" group; large transactions (≥€25,000) must be assigned directly to the customer's designated **senior advisor**. The team configures the User Task with these properties:

- `assignee` field: `=if amount >= 25000 then customerSeniorAdvisor else null`
- `candidateGroups` field: `=["advisors"]`

Production results: small transactions correctly appear in advisors' "Tasks I Can Claim" view. But for large transactions, the senior advisor expected to see them automatically claimed in their "My Tasks" view — instead the senior advisor reports seeing nothing, and a colleague says "I see all the large transactions in my Tasks I Can Claim list as if anyone could claim them".

**Which is the correct understanding of Zeebe's User Task assignment behaviour?**

- **a)** Setting `assignee` directly **claims the task to that user automatically** when the task is created. The task appears in that user's "My Tasks" view. If the senior advisor doesn't see it, the assignee expression likely evaluates incorrectly or the senior advisor's user identity in Tasklist doesn't match the FEEL-computed value. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** Zeebe requires both `assignee` AND `candidateUsers` set for direct-assigned tasks to appear; setting only `assignee` puts the task in a "ghost" state visible to no one. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** When `assignee` and `candidateGroups` are both set, `candidateGroups` takes precedence and the assignee is silently ignored. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Tasklist UI doesn't refresh after `assignee` is set dynamically — users must click "Refresh" to see direct-assigned tasks. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `assignee` set on task creation means the task is **automatically claimed** for that user — Tasklist's "My Tasks" view filters by assignee. `candidateGroups` describes who CAN claim an unassigned task — it's the "Tasks I Can Claim" filter. If the FEEL `customerSeniorAdvisor` value doesn't match the senior advisor's Tasklist identity (e.g., email format mismatch, missing identifier), the task is assigned to a non-existent user and shows up nowhere as "claimed" — but the task does still exist and the candidateGroups membership still applies, so it's visible in colleagues' "Tasks I Can Claim" list as "you can claim this even though it's already assigned to someone".

- **Option b) — Incorrect.** `assignee` alone is sufficient — no `candidateUsers` requirement.

- **Option c) — Incorrect.** `candidateGroups` does not override `assignee`; both apply simultaneously.

- **Option d) — Incorrect.** Tasklist refreshes via standard WebSocket/poll mechanisms; manual refresh isn't required for assignee updates.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Assignee + candidateGroups behaviour + identity-mismatch root cause.
- **b) 2/10** — invented requirement; assignee само е sufficient.
- **c) 3/10** — невярно — двете fields апплицират независимо.
- **d) 2/10** — Tasklist auto-refresh-ва; не е UI issue.

**Correct Answer:** Setting `assignee` directly claims the task to that user automatically. If the senior advisor doesn't see it, the assignee expression likely evaluates incorrectly or the senior advisor's user identity doesn't match the FEEL-computed value.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Assignee dynamic" + "senior advisor sees nothing" + "colleague sees it as claimable" → разпознаваш че проблемът е **assignee value mismatch с Tasklist user identity**, не configuration syntax.

**Въпросът → Solution Framing.** "Correct understanding of assignment behaviour" — изпитва se mechanism knowledge на Tasklist filters.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че `assignee` set автоматично claim-ва задачата, знаеш че "My Tasks" филтрира по assignee, знаеш че "Tasks I Can Claim" филтрира по candidate fields **for unassigned tasks**, знаеш че mismatched assignee identity може да създаде "phantom claim" state. Това е знание за Tasklist UI filters + Zeebe task model.

---

## Question 11: Configuring Processes (Weighting: 22%)

**Scenario:** A payments orchestration service uses Camunda 8 Self-Managed to process high-volume credit card authorisations. The Service Task "Authorise Payment" calls a downstream auth processor with typical latency 50-200 ms. Worker is configured: `maxJobsActive=64`, `pollInterval=100ms`, `timeout=PT5M`. Under peak load (10,000 authorisations/hour), the worker reports CPU at 30% and the auth processor reports no backpressure — yet Operate shows about 40% of Service Tasks lingering in "ACTIVATED" state for **15-30 seconds** before being processed, and average end-to-end latency has climbed from 250 ms to 8 seconds.

The team can't add CPU to the worker (CPU is idle anyway). They suspect a **scaling issue at the activation layer**.

**Which scaling approach fits this bottleneck?**

- **a)** Deploy **multiple worker instances (replicas)** all subscribed to the same job type. The broker distributes activations across the worker pool; each broker partition can hand jobs to whichever worker polls first. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Increase `maxJobsActive` from 64 to 1000 so the single worker holds more jobs in-flight. Documentation: [Job worker configuration](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Decrease `pollInterval` from 100 ms to 10 ms so the single worker polls 10x more frequently. Documentation: [Job worker configuration](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Increase `timeout` from PT5M to PT30M so jobs stay locked longer before re-activation. Documentation: [Job activation](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Horizontal scaling** is the canonical Zeebe-friendly answer for activation lag. Multiple worker instances all subscribed to the same job type share the work — broker hands each available job to whichever worker polls first. Each broker partition spreads activations across the worker pool, so per-worker latency drops. The scenario specifies CPU is idle and downstream has no backpressure — classic signal that the worker count itself is the bottleneck.

- **Option b) — Suboptimal.** Raising `maxJobsActive` lets one worker hold more concurrent jobs, but a single JVM has finite IO connections and event-loop capacity. At 10K/hour with 200ms avg latency, you need ~550 concurrent jobs sustained — even 1000 maxJobsActive on one worker hits coordination overhead. Multiple workers scale linearly; single-worker tuning hits ceiling.

- **Option c) — Incorrect.** Job activation in Zeebe is **push-pull hybrid**: the worker maintains a long-poll connection; broker pushes jobs as they become available on the open poll. Polling more frequently doesn't help when broker is already pushing as fast as worker can accept — and excessive polling can stress the broker.

- **Option d) — Incorrect.** `timeout` is the **job lock duration** for recovery (re-activate if worker crashes). Increasing it doesn't change activation latency for waiting jobs — wrong axis.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Horizontal scaling е каноничният Zeebe pattern за activation throughput.
- **b) 5/10** — частично помага, но single worker has IO/event-loop ceiling.
- **c) 2/10** — pollInterval не е bottleneck; default 100ms е достатъчен. Wrong axis.
- **d) 3/10** — `timeout` е lock duration на **wrong axis** — за recovery, не activation throughput.

**Correct Answer:** Deploy multiple worker instances (replicas) all subscribed to the same job type.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "10K/hr + worker CPU 30% + downstream no backpressure + 40% jobs lingering" → разпознаваш че single-worker throughput е bottleneck, не CPU, не downstream. Сигналът "CPU idle" изключва compute-bound diagnoses.

**Въпросът → Solution Framing.** "Scaling approach" + "activation layer" определят какъв тип fix — throughput increase, не latency tweak.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe activation е push-on-poll (не traditional polling), знаеш че `maxJobsActive` е per-worker concurrency cap (с finite practical limit), знаеш че `pollInterval` контролира idle poll cadence (irrelevant под load), знаеш че `timeout` е lock duration not activation latency, знаеш че horizontal scaling е canonical Zeebe answer. Това е знание за Zeebe activation lifecycle.

---

## Question 12: Configuring Processes (Weighting: 22%)

**Scenario:** An e-commerce platform's order process publishes a `inventory_reserved` message when warehouse confirms stock allocation. The order process has a Message Catch Event waiting downstream with `correlationKey = order_id`. The warehouse publishes the message with `correlationKey = order_id` in the payload. Production shows that when the warehouse publishes the message **before** the order process reaches the Message Catch Event (warehouse is faster than order processing), the message is **discarded** and the order hangs forever waiting for a message that already arrived.

The team wants Zeebe to **buffer the message** so when the order process reaches the catch, it can consume the previously-published message.

**Which configuration solves this?**

- **a)** Set a non-zero **TTL (time-to-live)** on the published message — Zeebe buffers messages without subscriptions for the TTL duration, allowing later-arriving catches to consume them. Documentation: [Message TTL](https://docs.camunda.io/docs/components/concepts/messages/)

- **b)** Configure the Message Catch Event with `zeebe:buffer=true` to enable message buffering. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **c)** Set the warehouse to publish messages with `messageId` set — Zeebe automatically buffers messages with messageId. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **d)** Zeebe doesn't support message buffering; the warehouse must retry until the catch event is ready. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe buffers published messages **with TTL > 0** that have no current subscription — they're held in the broker's message store for the specified TTL duration. When a Message Catch Event later subscribes with a matching correlation key, it consumes the buffered message immediately. Default TTL is 0 (no buffering — discard if no subscriber); setting TTL = PT10M (or similar) creates a 10-minute buffer window.

- **Option b) — Incorrect.** `zeebe:buffer=true` is not a real Zeebe configuration property. Buffering is controlled by message TTL.

- **Option c) — Incorrect.** `messageId` controls **message uniqueness** (so the same logical message published twice is deduplicated), not buffering. TTL controls buffering.

- **Option d) — Incorrect.** Zeebe does support message buffering via TTL.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. TTL > 0 е каноничният механизъм за message buffering.
- **b) 1/10** — invented property.
- **c) 2/10** — messageId е uniqueness, не buffering. Different concept.
- **d) 1/10** — невярно — buffering се поддържа.

**Correct Answer:** Set a non-zero TTL on the published message.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/messages/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Message published before catch subscribed" + "discarded" + "process hangs" → разпознаваш че проблемът е **publish-before-subscribe race** without buffering.

**Въпросът → Solution Framing.** "Buffer the message" — изпитва се **knowledge на message buffering mechanism**.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че default TTL = 0 = no buffering, знаеш че TTL > 0 enables broker-side buffer за този interval, знаеш че `messageId` е за deduplication (различна concept), знаеш че buffering не е runtime-toggleable property на catch event. Това е знание за Zeebe message subscription internals.

---

## Question 13: Configuring Processes (Weighting: 22%)

**Scenario:** A monthly billing process must fire on the **first business day** of every month at 09:00 local time. The team is in Frankfurt (CET/CEST timezone — daylight saving time twice a year). The current configuration uses a Timer Start Event with `cycle: R/P1M` — but the team observes that during the March DST transition, the next fire happened at 08:00 local instead of 09:00, and during October DST it fired at 10:00.

**Which timer configuration handles DST correctly?**

- **a)** Use a **CRON expression** like `0 0 9 1 * *` with a timezone qualifier. Zeebe supports CRON-style timer expressions including timezone awareness, handling DST transitions correctly. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** Stay with `R/P1M` but add a downstream Service Task that checks the current time and skips if not at 09:00. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** Use `cycle: R/PT720H` (720 hours = 30 days) which avoids calendar-based ambiguity. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Switch to ISO 8601 absolute date `date: 2026-09-01T09:00:00+02:00` and re-deploy each month with the next date. Documentation: [ISO 8601](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe supports **CRON-style timer expressions** in addition to ISO 8601. CRON allows finer-grained scheduling (e.g., "every 1st of month at 9 AM") with built-in timezone awareness — Zeebe interprets the expression in the configured cluster timezone or a per-timer timezone qualifier. This handles DST transitions correctly because CRON evaluates against local wall-clock time, not absolute durations.

- **Option b) — Incorrect.** Adding a downstream check is a workaround that still fires at the wrong time, just discards execution sometimes. Wasteful and brittle.

- **Option c) — Incorrect.** `R/PT720H` is a fixed-duration cycle that drifts: 30-day cycles don't align with calendar months (February has 28-29 days, others have 30-31). After a year, the timer would be days off.

- **Option d) — Incorrect.** Re-deploying every month is operationally fragile and defeats the purpose of a recurring timer.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. CRON expressions в Zeebe handle DST + calendar-aware scheduling.
- **b) 3/10** — workaround че скрива симптома; не решава root cause.
- **c) 4/10** — fixed-duration drifts away from calendar.
- **d) 2/10** — operationally fragile.

**Correct Answer:** Use a CRON expression like `0 0 9 1 * *` with a timezone qualifier.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "First business day each month" + "DST transitions shift fire time" → разпознаваш че проблемът е **DST-aware scheduling**, не fixed duration. `R/P1M` interpretира P1M като absolute duration (~30 дни), не calendar month.

**Въпросът → Solution Framing.** "Handles DST correctly" — изпитва се knowledge на calendar-aware scheduling.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe support-ва CRON в timer expressions, знаеш че CRON е local-wall-clock-aware (handles DST), знаеш че ISO 8601 fixed durations drift away from calendar (PT720H ≠ 1 month), знаеш че re-deploy всеки месец е operationally fragile. Това е знание за Zeebe timer expression options.

---

## Question 14: Configuring Processes (Weighting: 22%)

**Scenario:** A claims process has a Business Rule Task configured with `zeebe:calledDecision.decisionId: ClaimRouting`. The DMN `ClaimRouting` takes inputs `claimType`, `claimAmount`, and `customerTier`. At runtime, the developer observes that **only `claimType` and `claimAmount` are reaching the DMN engine** — `customerTier` is consistently missing, causing "Required input 'customerTier' not found" errors even though the process variable IS set just before the Business Rule Task.

The developer checks: the Business Rule Task has no input mappings configured (relying on default scope inheritance). The variable `customerTier` is set by an upstream Service Task's output mapping into a local subprocess scope (not the root process scope).

**Why is `customerTier` not reaching the DMN?**

- **a)** The Business Rule Task **inherits the parent's variable scope** which includes everything visible at the BR Task's level — INCLUDING parent scope and subprocess local scope where it executes. If `customerTier` was set in a **sibling subprocess scope** (different scope branch), it isn't visible here. Move `customerTier` to a scope that's an ancestor of the Business Rule Task. Documentation: [Variable scopes](https://docs.camunda.io/docs/components/concepts/variables/)

- **b)** Business Rule Task doesn't inherit scope variables by default; explicit input mapping is required. Add input mapping `target=customerTier, source=customerTier`. Documentation: [Variable mapping](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** DMN engine doesn't access process variables directly; the Business Rule Task wraps them in a JSON envelope. Configure `zeebe:calledDecision.inputs` array. Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **d)** Zeebe variables with non-primitive types (objects, lists) aren't passed to DMN; convert `customerTier` to a flat string first. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe variables follow **scope inheritance**: a Business Rule Task sees all variables in its scope chain — own scope, enclosing subprocess scopes, and root process scope. It does **NOT** see variables in sibling scopes (different branches of subprocess hierarchy). If `customerTier` was set as output of a Service Task whose mapping wrote to a different subprocess scope (sibling), the Business Rule Task can't see it. The fix is to either elevate the variable to a common ancestor scope (root process or shared parent subprocess) or use Service Task output mapping with explicit promotion.

- **Option b) — Incorrect.** Business Rule Task DOES inherit scope variables by default — that's Zeebe's standard variable scoping behavior. Explicit input mappings would just rename or extract, not provide what's missing.

- **Option c) — Incorrect.** No such envelope mechanism; variables pass directly.

- **Option d) — Incorrect.** Zeebe variables can be objects, lists, primitives, etc. — DMN engine consumes any structured JSON.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Variable scope inheritance + sibling scope invisibility е exact diagnosis.
- **b) 3/10** — невярно — Business Rule Task **does** inherit scope variables.
- **c) 1/10** — invented mechanism.
- **d) 2/10** — невярно — DMN consumes structured JSON.

**Correct Answer:** The Business Rule Task inherits the parent's variable scope. If `customerTier` was set in a sibling subprocess scope, it isn't visible. Move it to a scope that's an ancestor of the Business Rule Task.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Variable set just before BR Task" + "BR Task can't see it" + "set by upstream output mapping into subprocess scope" → разпознаваш че проблемът е **variable scope visibility** (set в sibling scope, не ancestor).

**Въпросът → Solution Framing.** "Why not reaching DMN" изисква **scope chain explanation**, не configuration tweak.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe variables имат **scope hierarchy** (root → subprocess → activity), знаеш че scope sees own + ancestors + не sees siblings, знаеш че output mappings могат да targetingname scope, знаеш че BR Task inherits scope автоматично. Това е знание за Zeebe variable scope model.

---



## Question 15: Configuring Processes (Weighting: 22%)

**Scenario:** A pharmaceutical clinical-trial enrollment process runs a **Parallel Multi-Instance Subprocess** that fans out to 100 institutional review board (IRB) reviewers for opinion. The business rule requires the trial to advance when **at least 60% of reviewers have responded** (regardless of approve/reject outcomes), with the assumption that 60% gives statistical validity. The current implementation waits for all 100 reviewers, which takes 7-10 days because some reviewers are slow.

The team wants to add a `completionCondition` to advance the flow earlier when the 60% threshold is hit.

**Which Multi-Instance configuration achieves this?**

- **a)** Set `completionCondition: =count(reviews) >= count(reviewers) * 0.6` on the Multi-Instance marker. Configure `outputCollection = reviews` so the FEEL expression can reference accumulated child outputs. When the condition becomes true, Zeebe cancels the remaining in-flight inner instances and advances the parent token. Documentation: [Multi-instance completionCondition](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Configure `zeebe:multiInstance.thresholdPercent=60` to declare a completion threshold. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Set `completionCondition` but **wait for all 100 reviewers to finish** before evaluating it — partial early completion is not supported in Zeebe. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Add a downstream Timer Boundary Event at 5 days that interrupts the Multi-Instance Subprocess regardless of completion state. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Multi-Instance `completionCondition` is a FEEL expression evaluated **after each inner instance completes**. When it returns `true`, Zeebe **cancels the remaining in-flight inner instances** and advances the parent token to the outgoing flow. `count(reviews) >= count(reviewers) * 0.6` checks current completion ratio; with `outputCollection = reviews`, each child's output is appended to the `reviews` list, giving the FEEL expression visibility into progress.

- **Option b) — Incorrect.** `thresholdPercent` is not a Zeebe property; the FEEL `completionCondition` is the standard mechanism.

- **Option c) — Incorrect.** Zeebe DOES support early completion via completionCondition — it cancels remaining instances when the condition becomes true. This is documented behaviour.

- **Option d) — Suboptimal.** Timer Boundary fires on wall-clock time, not on progress percentage. If reviews come in faster than expected, the timer wastes time waiting. If slower, the timer fires before 60% — wrong axis.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. completionCondition с FEEL `count` е каноничният approach.
- **b) 1/10** — invented property.
- **c) 2/10** — невярно — Zeebe support-ва early completion.
- **d) 3/10** — Timer е wall-clock, не progress-based. Wrong axis.

**Correct Answer:** Set `completionCondition: =count(reviews) >= count(reviewers) * 0.6` on the Multi-Instance marker. Configure `outputCollection = reviews`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "60% threshold" + "slow reviewers blocking" → разпознаваш че се иска **progress-based early completion**, не timer, не error handling.

**Въпросът → Solution Framing.** "Advance flow earlier" + "completionCondition" — изпитва се knowledge на Multi-Instance early-termination feature.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe MI `completionCondition` се evaluat-ва **след всяка inner completion**, знаеш че при true engine **cancel-ва remaining**, знаеш че `outputCollection` агрегира child outputs за FEEL visibility, знаеш че Timer Boundary е wall-clock not progress. Това е знание за MI completion semantics.

---

## Question 16: Configuring Processes (Weighting: 22%)

**Scenario:** A loan origination Subprocess contains four Service Tasks that compute different parts of the credit decision. The Subprocess takes input variable `applicantData` (object). Inside the Subprocess, the team wants several **scratch variables** (`computedRisk`, `internalScore`, `redFlags`) that should NOT leak back to the parent scope. When the Subprocess ends, only the clean `finalDecision` boolean should be available to the parent.

**How to configure variable scoping correctly?**

- **a)** Embedded Subprocess **inherits read access to parent variables** by default — no input mapping needed for `applicantData`. Variables created inside the Subprocess (via Service Task output mappings into the Subprocess scope, or via local variable declaration) are **scoped to the Subprocess** and discarded when it ends. Use the Subprocess's **output mapping** to promote only `finalDecision` to the parent. Documentation: [Variable scopes](https://docs.camunda.io/docs/components/concepts/variables/)

- **b)** Subprocess local variables aren't supported in Zeebe; use namespacing convention like `_internal_computedRisk`. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Configure explicit input mapping for `applicantData` and explicit output mapping for `finalDecision`. Without explicit input mapping the Subprocess can't see parent variables. Documentation: [Variable mapping](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Use a Call Activity instead of an Embedded Subprocess — only Call Activity provides scope isolation. Documentation: [Call Activities](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Embedded Subprocess in Zeebe **inherits read access** to parent variables automatically (no input mapping needed for read-only access). Variables that are **created** inside the Subprocess scope (via Service Task output mappings or local variable declarations) live only in that scope and are **discarded** when the Subprocess ends. To promote a variable to the parent, configure the Subprocess's **output mapping** with `source=finalDecision, target=finalDecision`.

- **Option b) — Incorrect.** Subprocess local scope IS supported; `_internal_` namespace workaround is unnecessary.

- **Option c) — Incorrect.** Embedded Subprocess inherits scope read access — explicit input mapping is redundant.

- **Option d) — Suboptimal.** Call Activity gives full scope isolation but is heavier (separate process instance, separate audit). Embedded Subprocess gives sufficient scope isolation here.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Embedded Subprocess scope inheritance + output mapping promotion.
- **b) 2/10** — невярно — local variables се поддържат.
- **c) 3/10** — input mapping е redundant за read inheritance.
- **d) 5/10** — работи но over-engineered за inline scope isolation.

**Correct Answer:** Embedded Subprocess inherits read access to parent variables. Variables created inside are scoped to the Subprocess. Use output mapping to promote `finalDecision` to parent.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Scratch variables + don't leak + clean boolean to parent" → разпознаваш че се иска **scope isolation in same-process subprocess**, не cross-process call.

**Въпросът → Solution Framing.** "Configure scoping correctly" — изпитва се mechanism knowledge на Embedded Subprocess scope.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Embedded Subprocess е **scope** в Zeebe, знаеш че scope inherits read access от parent, знаеш че local variables се discard-ват при scope end, знаеш че output mapping е mechanism-а за explicit promotion. Това е знание за Zeebe variable scope model.

---

## Question 17: Configuring Processes (Weighting: 22%)

**Scenario:** A company has four BPMN processes that all call the same internal "Send Notification" REST API. Currently each process has its own Service Task with hardcoded URL, headers, auth config. When the API's authentication scheme changed last quarter, the team had to update all four processes individually and missed two. The architect wants a **single point of change** for future API config changes.

The team considers Element Templates. The senior developer cautions: "Element Templates aren't a magic 'update everywhere' button — understand what they actually do."

**What is the correct understanding of Element Templates' scope of effect?**

- **a)** Element Templates standardise the **design-time configuration** of BPMN elements (URL, headers, auth structure). Designers select the template in Web Modeler when adding a Service Task; the template's properties inline into the BPMN XML. Updating the template propagates to **new processes that adopt the new version** — it does NOT retroactively update already-deployed processes or in-flight instances. Documentation: [Element Templates](https://docs.camunda.io/docs/components/concepts/element-templates/)

- **b)** Element Templates create a **runtime binding** — when the template is updated, all deployed processes pick up the new config at runtime. Documentation: [Element Templates](https://docs.camunda.io/docs/components/concepts/element-templates/)

- **c)** Element Templates are runtime Connectors — they execute the API call inside the broker. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Element Templates are deprecated in 8.8; the new mechanism is Custom Connectors. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Element Templates are **design-time tools** that define reusable configuration for BPMN elements. When a designer applies the template, the template's properties are **written into the BPMN XML as extension elements at design time**. Updating the template (publishing a new version) affects processes that **adopt the new version** when they are re-edited and re-deployed — it does NOT retroactively change already-deployed processes or in-flight instances. "Single point of change" works prospectively, not retroactively.

- **Option b) — Incorrect.** Templates are design-time, not runtime. No runtime binding from template to deployed processes — the template's properties are inlined into the XML at deployment time.

- **Option c) — Incorrect.** Element Templates are not Connectors. Connectors are runtime components; Templates define configuration shape.

- **Option d) — Incorrect.** Templates are not deprecated; active in 8.8 and integrate with Connectors.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Element Templates са design-time, prospective updates.
- **b) 2/10** — runtime binding не съществува.
- **c) 3/10** — обърква Templates с Connectors.
- **d) 1/10** — не са deprecated.

**Correct Answer:** Element Templates standardise design-time configuration. Updates propagate to new processes but do not retroactively update deployed processes or in-flight instances.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/element-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Single point of change for future updates" → разпознаваш че се иска **design-time reuse with prospective updates**, не runtime polymorphism.

**Въпросът → Solution Framing.** "Scope of effect" — изпитва се conceptual understanding на Element Templates' boundary.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Templates inline-ват properties в BPMN XML при design, знаеш че updates са prospective not retroactive, знаеш че Templates ≠ Connectors (orthogonal concepts), знаеш че Templates са active в 8.8 не deprecated. Това е знание за Modeler-broker boundary.

---

## Question 18: Configuring Processes (Weighting: 22%)

**Scenario:** A loan-origination process accepts customer-uploaded documents (passport scan, income proof). Each file can be 5-30 MB. The team initially stores the binary content as Base64 strings in process variables — Zeebe rejects with "variable size exceeds limit" (Zeebe variable limit ~4 MB). The team needs to pass these documents through several BPMN steps: OCR, compliance check, archive.

**What is the correct Camunda 8 mechanism for handling large documents in process flow?**

- **a)** Use Camunda 8's **Document Handling API**: Service Tasks call the API to store the document, receive a **document reference** (small JSON with `documentId` and metadata), and pass this reference as a process variable. Subsequent tasks retrieve content via reference. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/getting-started/)

- **b)** Increase Zeebe variable size limit via cluster configuration. Documentation: [Zeebe configuration](https://docs.camunda.io/docs/components/zeebe/operations/configuration/)

- **c)** Store the document in an external S3 bucket and pass S3 URLs as string variables. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Split the document into 4MB chunks across multiple variables and reassemble downstream. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8.8's **Document Handling** API is the canonical mechanism. The Document Handling service stores documents in Camunda's managed storage (or configured external storage) and returns a small **document reference** (just metadata, fits comfortably in process variables). Each Service Task receives the reference, retrieves the content as needed via the API, and updates the reference if it produces a new version. Lean process state, uniform abstraction.

- **Option b) — Incorrect.** The 4 MB variable limit is a hard architectural bound in Zeebe (log/snapshot design constraint). Even if increasable, storing large binaries in process state would tank performance and is the wrong abstraction.

- **Option c) — Suboptimal.** DIY S3 storage works but reinvents Document Handling, missing built-in security, audit, lifecycle, modeler integration.

- **Option d) — Incorrect.** Chunking is fragile (reassembly races, ordering issues) and still bloats process state. Anti-pattern.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Document Handling е canonical Camunda 8 механизъм за големи документи.
- **b) 1/10** — variable limit е hard architectural bound.
- **c) 5/10** — работи (DIY) но missing built-in features.
- **d) 1/10** — anti-pattern.

**Correct Answer:** Use Camunda 8's Document Handling API.

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Large documents + variable size limit" → разпознаваш че държане на blob в process state е грешен abstraction.

**Въпросът → Solution Framing.** "Correct Camunda 8 mechanism" — търси се built-in feature, не workaround.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 8.8 има Document Handling като first-class feature, знаеш че variable limit е hard architectural bound, знаеш че process state трябва да бъде lean. Това е знание за Camunda 8.8 product features.

---

## Question 19: Configuring Processes (Weighting: 22%)

**Scenario:** A real-estate firm processes incoming property inquiries via email. Each email may contain attached PDFs (broker's letter, property listing sheets, financial summary). The team wants to use **Camunda 8 IDP (Intelligent Document Processing)** to extract: property address, asking price, bedroom count, property type. The team configures an IDP Application in Web Modeler with these four extraction fields.

After deploying, the team finds the IDP correctly extracts values **but with low confidence** for some emails — particularly when property listings have unconventional formatting. They need to **automatically reject low-confidence extractions** and route them to human review.

**Which IDP Application feature handles this?**

- **a)** IDP Application supports **per-field confidence thresholds**. Configure each field's minimum confidence (e.g., 0.85). When IDP extraction confidence falls below threshold for any field, the IDP returns a status flag like `validation_failed`. BPMN routes based on this status via an Exclusive Gateway to either continue or human-review path. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **b)** IDP doesn't expose confidence scores; assume all extractions are equally reliable. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **c)** Manually review every extraction via a User Task after IDP runs; trust nothing. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **d)** Use a downstream Business Rule Task with a DMN that decides "trust or review" based on the extracted values' shape (e.g., price > 0). Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** IDP Application in Camunda 8.8 supports **per-field confidence thresholds**. The IDP service performs AI-based extraction and produces a confidence score per field (0.0 to 1.0). The Application configuration includes minimum acceptable confidence; when extraction confidence falls below threshold, the IDP marks the result as validation-failed and BPMN can route accordingly (Exclusive Gateway after the IDP Service Task).

- **Option b) — Incorrect.** IDP does expose confidence scores.

- **Option c) — Suboptimal.** Manually reviewing every extraction defeats the purpose of automated IDP.

- **Option d) — Working but limited.** A DMN can sanity-check extracted values (e.g., price > 0) but doesn't have access to AI confidence. Combined with confidence threshold (option a) would be even better, but option a is the canonical answer.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Per-field confidence thresholds е built-in IDP feature.
- **b) 1/10** — невярно — IDP exposes confidence.
- **c) 3/10** — defeats automation.
- **d) 5/10** — supplementary but doesn't use AI confidence directly.

**Correct Answer:** IDP Application supports per-field confidence thresholds. Configure each field's minimum confidence; routes via Exclusive Gateway based on validation status.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/idp/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Low confidence extractions" + "automatically route to human review" → разпознаваш че се иска **AI confidence-aware routing**, не data validation.

**Въпросът → Solution Framing.** "IDP Application feature" — изпитва се специфично IDP feature knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че IDP има per-field confidence scores, знаеш че thresholds са configurable в Application, знаеш че DMN е post-extraction sanity-check (different layer), знаеш че manual review every-time defeats automation. Това е знание за Camunda 8.8 IDP feature set.

---

## Question 20: Configuring Processes (Weighting: 22%)

**Scenario:** A customer-service platform integrates an LLM to **dynamically route complex tickets** to the right department. The LLM is given the ticket text and history; based on its reasoning, it should call one or more of: "Tag Ticket", "Search Knowledge Base", "Generate Reply Draft", "Escalate to Senior Agent". The LLM decides which actions to take, **in what order**, and how many times — the orchestration is not deterministic. The team wants the LLM agent to drive the orchestration with BPMN as the audit/control layer.

**Which Camunda 8.8 pattern fits this dynamic, agent-driven orchestration?**

- **a)** **Ad-hoc Subprocess** containing the four candidate actions as inner activities. The LLM agent inside the subprocess **dynamically selects which activities to run in what order**; the BPMN gives the audit trail and termination criteria. Documentation: [Ad-hoc subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/ad-hoc-subprocesses/)

- **b)** **AI Agent Connector** — a single BPMN element invoking the LLM with structured prompt. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/agentic-orchestration-overview/)

- **c)** A regular Subprocess with all four actions and an Inclusive Gateway routing based on `agentDecision` variable. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **d)** A Multi-Instance Subprocess with `inputCollection = agentSelectedActions`. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8.8's **Ad-hoc Subprocess** is purpose-built for **dynamic, agent-driven orchestration**. The Ad-hoc Subprocess contains candidate inner activities that can execute in any order, repeatedly, or not at all — exactly suited to an LLM agent that reasons step-by-step about which action to take next. The BPMN provides the structural boundary (which actions are allowed, termination criteria) while the agent drives the order.

- **Option b) — Suboptimal for dynamic case.** AI Agent Connector is for **structured LLM invocation** (single call with prompt + response). For multi-step agentic reasoning where the agent chooses next action based on previous result, the connector pattern is too rigid — better suited for one-shot generation tasks (option of Set 1 Q20).

- **Option c) — Working but rigid.** Inclusive Gateway requires the agent's selection to be expressed in a single decision upfront. For dynamic step-by-step orchestration where the next step depends on the previous result, this is too rigid.

- **Option d) — Incorrect.** Multi-Instance is for **repeating the same activity** with different inputs, not for choosing among heterogeneous activities dynamically.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Ad-hoc Subprocess е canonical за agentic dynamic orchestration в 8.8.
- **b) 4/10** — AI Agent Connector е за structured one-shot, не multi-step agentic.
- **c) 5/10** — Inclusive Gateway изисква single upfront decision; не dynamic.
- **d) 2/10** — Multi-Instance е same activity repeated, не heterogeneous.

**Correct Answer:** Ad-hoc Subprocess containing the four candidate actions as inner activities.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/ad-hoc-subprocesses/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Dynamic + non-deterministic + agent-driven" → разпознаваш че се иска **ad-hoc orchestration**, не structured single-shot.

**Въпросът → Solution Framing.** "Camunda 8.8 pattern" + "dynamic agent-driven" — изключва deterministic patterns (Inclusive, Multi-Instance) и single-shot patterns (AI Agent Connector).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Ad-hoc Subprocess support-ва **non-deterministic inner-activity ordering**, знаеш че AI Agent Connector е structured single-element LLM invocation, знаеш че Inclusive Gateway изисква synchronous condition decisions, знаеш че Multi-Instance е repetition not selection. Това е знание за Camunda 8.8 Agentic Orchestration feature differentiation.

---

## Question 21: Configuring Processes (Weighting: 22%)

**Scenario:** A payment process has a Service Task "Charge Card" with three distinct error scenarios: card declined (returns `CARD_DECLINED`), gateway timeout (returns `GATEWAY_TIMEOUT`), and fraud detected (returns `FRAUD_DETECTED`). Each must route to a different handler. The team initially attaches a single Error Boundary Event with `errorCode = "PAYMENT_ERROR"` and a downstream Exclusive Gateway switching on the error code, but the audit trail is muddled — Operate shows all three failures as the same error in summary views, and the Exclusive Gateway adds extra noise to the BPMN model.

**Which is the correct BPMN-native error routing for typed errors?**

- **a)** Attach **three separate Error Boundary Events** to the Service Task, each with a distinct `errorCode` matching what the worker throws (`CARD_DECLINED`, `GATEWAY_TIMEOUT`, `FRAUD_DETECTED`). Each boundary routes to its own dedicated handler. Documentation: [Error events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **b)** Attach one catch-all boundary and parse the error message in a downstream Script Task. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** Configure the Service Task with `zeebe:errorEventDefinition` listing all three error codes. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Use a Subprocess wrapping the Service Task with three Error Catch Events inside. Documentation: [Subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/subprocesses/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** In Zeebe, multiple Error Boundary Events can be attached to the same activity, each with its own `errorCode`. Zeebe routes thrown errors to the matching boundary by code. This gives **typed error routing as first-class BPMN elements** — each error type has its own named boundary, its own handler, clean Operate audit, no downstream Exclusive Gateway needed.

- **Option b) — Incorrect.** Parsing error messages downstream is fragile (text can change, parsing logic must stay in sync). BPMN's `errorCode` is exactly the mechanism for typed error routing.

- **Option c) — Incorrect.** No such Zeebe property `zeebe:errorEventDefinition` listing multiple codes. Error routing is configured on the boundary event, not the task.

- **Option d) — Suboptimal.** Wrapping in a Subprocess works mechanically but adds unnecessary scope nesting and Operate complexity for a problem that boundary events solve directly.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple Error Boundaries с distinct errorCodes е BPMN-стандартът.
- **b) 3/10** — message parsing е fragile alternative.
- **c) 2/10** — invented property.
- **d) 5/10** — works but adds scope nesting unnecessarily.

**Correct Answer:** Attach three separate Error Boundary Events to the Service Task, each with a distinct `errorCode`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/error-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Three distinct error types + different handlers + clean audit" → разпознаваш че се иска **typed error routing** на BPMN ниво, не string parsing.

**Въпросът → Solution Framing.** "BPMN-native error routing for typed errors" — изпитва се knowledge на BPMN errorCode mechanism.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Error Boundary Event е matched **by exact errorCode**, знаеш че **multiple boundaries** могат да се закачат на същата активност (всеки independent), знаеш че BPMN spec preferred typed errors над string parsing, знаеш че няма zeebe-side multi-code property. Това е знание за Zeebe Error event routing.

---

## Question 22: Configuring Processes (Weighting: 22%)

**Scenario:** A logistics company's package-tracking process calls an external carrier API (FedEx) to query shipment status. The carrier API occasionally returns transient HTTP 500 errors (~1-2%). The team expects Camunda to retry automatically a few times before reporting an incident — but currently each 500 immediately creates a permanent **Incident** in Operate, blocking shipment processing until a human resolves it.

**Which configuration correctly enables automatic retry before incident creation?**

- **a)** Set `zeebe:taskDefinition retries="3"` on the Service Task. The Java worker's `failJob` call (explicit `retries` parameter) decrements the counter; Zeebe re-activates the job. Incident is created only when retries reach zero. Documentation: [Job retries](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Set `zeebe:taskDefinition retryBackoff="PT5S,PT15S,PT45S"` for exponential backoff. Documentation: [Job retries](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Retries are configured cluster-wide; per-BPMN element retry is not supported. Documentation: [Zeebe configuration](https://docs.camunda.io/docs/components/zeebe/operations/configuration/)

- **d)** Set `zeebe:taskDefinition incidentAfter=3` to create incident only after 3 retries. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** In Zeebe's job lifecycle, the BPMN's `zeebe:taskDefinition retries` provides the initial retry budget (e.g., 3). When the worker calls `failJob(jobKey, retries: N-1)`, Zeebe re-activates the job with the decremented counter. Spring Zeebe auto-decrements when the worker throws an exception; plain Java client requires explicit decrement. When retries reach zero, Zeebe creates an Incident. Default is often 3 but should be explicitly set.

- **Option b) — Incorrect.** `retryBackoff` is not a standard Zeebe property. Backoff is worker-side (worker sleeps before completing).

- **Option c) — Incorrect.** Retries are per-task in BPMN.

- **Option d) — Incorrect.** `incidentAfter` is not a valid Zeebe property.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Standard Zeebe retries configuration.
- **b) 2/10** — `retryBackoff` не е standard Zeebe property.
- **c) 2/10** — невярно — retries са per-task.
- **d) 1/10** — invented property.

**Correct Answer:** Set `zeebe:taskDefinition retries="3"` on the Service Task.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Transient 500" + "expect auto retry" + "permanent incident instead" → разпознаваш че retries настройка липсва или е 0.

**Въпросът → Solution Framing.** "Automatic retry before incident creation" — изпитва се knowledge на retry configuration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че `retries` дава initial budget, знаеш че worker `failJob` decrements (explicit или via exception), знаеш че incident се създава **когато retries = 0**, знаеш че retries са per-task in BPMN не cluster-wide. Това е знание за Zeebe job lifecycle.

---



# Section 3 — Decisions & Business Rules (DMN) (Questions 23-29)

> Weight 11% • Topics: DRDs, Decision Tables, Hit Policies, FEEL in inputs/outputs, Business Rule Task integration.

---

## Question 23: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A health-insurance carrier evaluates pre-authorization requests against a DMN Decision Table `medical-necessity`. Each row encodes a condition (diagnosis code, treatment type, age range, plan tier) and yields output `"approved"` or `"requires_review"`. The compliance officer specifies: "If MULTIPLE rules match a request, ALL matching rules MUST yield the SAME output — otherwise the table is logically inconsistent and should error out." This guarantees the rule set is unambiguous.

**Which Hit Policy enforces this "multiple-match-must-agree" semantics?**

- **a)** **ANY** — multiple rules can match, but the engine verifies all matching outputs are **identical**. Returns the single agreed-upon output. If they disagree, raises an evaluation error. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **b)** **UNIQUE** — exactly one rule must match; multiple matches error out. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **c)** **PRIORITY** — multiple rules can match; returns the highest-priority output. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **d)** **COLLECT** with no aggregator — returns a list of all matching outputs. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The **ANY** hit policy allows multiple rules to match but enforces that all matching outputs are identical — semantically "any of the matches gives the right answer because they all agree". If the outputs disagree, the DMN engine raises an evaluation error (indicating the rule set has a consistency bug). This precisely matches the compliance officer's requirement: multiple matches are allowed, but the answer must be unambiguous.

- **Option b) — Incorrect.** UNIQUE forbids multiple matches entirely — different semantics. Compliance officer wants multiple OK, just must agree.

- **Option c) — Incorrect.** PRIORITY picks one winner among multiple matches based on output priority — doesn't enforce agreement.

- **Option d) — Incorrect.** COLLECT returns a list of all outputs without checking agreement.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. ANY enforces "multiple match must agree".
- **b) 3/10** — UNIQUE forbids multiple match entirely.
- **c) 3/10** — PRIORITY picks one winner, не проверява agreement.
- **d) 2/10** — COLLECT агрегира без agreement check.

**Correct Answer:** ANY — multiple rules can match, but the engine verifies all matching outputs are identical.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Multiple rules may match" + "must yield same output" + "otherwise error" → разпознаваш че се иска **agreement enforcement**, не selection, не aggregation.

**Въпросът → Solution Framing.** "Multiple-match-must-agree" е директната формулировка — изпитва се knowledge на ANY policy specifically.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че ANY allows multiple match но проверява agreement, знаеш че UNIQUE forbids multiple match, знаеш че PRIORITY selects single winner, знаеш че COLLECT returns list. Това е знание за 7-те DMN Hit Policies.

---

## Question 24: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A telecom company's pricing engine determines a customer's plan tier. The DMN Decision Table `plan-tier` evaluates customer attributes against multiple rules — typically 1-3 rules match per customer. The business asks: "I want to know **how many rules matched** for each customer (used as a 'qualification score' — more rules → better candidate for upgrade)."

The output column is `tier` (string). The team needs to add a way to count matching rules.

**Which Hit Policy + aggregator combination returns the count of matching rules?**

- **a)** **COLLECT** with **COUNT** aggregator. Returns the number of rules that matched as a single scalar value. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **b)** **COLLECT** without aggregator + downstream FEEL `count()` in a Script Task. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **c)** **RULE ORDER** which returns a numerically-indexed list; `count()` it. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **d)** **OUTPUT ORDER** with custom count column. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **COLLECT** with **COUNT** aggregator is the canonical DMN policy for "count matches": the engine evaluates all rules, then returns the count of matching rules as a single scalar number. No downstream processing needed.

- **Option b) — Works but suboptimal.** Adding a downstream Script Task to count works but reinvents what COLLECT-COUNT does natively. Adds an extra BPMN element for no benefit.

- **Option c) — Incorrect.** RULE ORDER returns a list of all matching outputs in rule-definition order — not a count.

- **Option d) — Incorrect.** OUTPUT ORDER returns a list sorted by output priority — not a count. "Custom count column" is not a real DMN concept.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. COLLECT-COUNT е caнonical aggregator за counting matches.
- **b) 5/10** — работи but reinvents built-in aggregator.
- **c) 2/10** — RULE ORDER returns list, not count.
- **d) 2/10** — OUTPUT ORDER не e count; invented "custom count column".

**Correct Answer:** COLLECT with COUNT aggregator.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Count of matching rules" → разпознаваш che се иска **count aggregator**, не enumeration.

**Въпросът → Solution Framing.** "Hit Policy + aggregator combination" — изпитва се knowledge на COLLECT modifiers.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че COLLECT има 4 aggregator modifiers (SUM, MIN, MAX, COUNT), знаеш че COLLECT без aggregator returns list, знаеш че RULE ORDER / OUTPUT ORDER са ordered lists not counts. Това е знание за COLLECT semantics.

---

## Question 25: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A loan officer's reporting tool queries Camunda 8 for **all decision instances** that fired for a given loan application — including which rules matched in each Decision Table along the way. The DMN diagram has three decision tables linked by Information Requirements: `EligibilityCheck` → `RiskScoring` → `LoanApproval`. Multiple rules can match in each table; the loan officer needs to see them **in rule-definition order** (the order written in the table) for audit clarity.

**Which Hit Policy preserves rule-definition order in the output?**

- **a)** **RULE ORDER** — returns a list of all matching rule outputs in the order the rules are defined in the table. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **b)** **OUTPUT ORDER** — same effect; returns list in rule order. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **c)** **COLLECT** (no aggregator) — returns list of matching outputs but **without guaranteed order**. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **d)** **FIRST** — preserves rule order by returning only the first match. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **RULE ORDER** specifically preserves the order in which rules are defined in the table. The list of matching outputs is returned in that order.

- **Option b) — Incorrect.** **OUTPUT ORDER** sorts the outputs by **declared output priority** — different ordering than rule-definition order.

- **Option c) — Partially correct but less specific.** COLLECT returns matching outputs but with implementation-dependent ordering — not guaranteed to match rule-definition order. RULE ORDER explicitly guarantees it.

- **Option d) — Incorrect.** FIRST returns only one match — not all.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. RULE ORDER preserves rule-definition order.
- **b) 4/10** — OUTPUT ORDER е sorted by output priority, не rule order.
- **c) 5/10** — COLLECT returns list but order not guaranteed; less specific.
- **d) 2/10** — FIRST returns single match, не list.

**Correct Answer:** RULE ORDER — returns a list of all matching rule outputs in the order the rules are defined.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Rule-definition order + audit clarity" → разпознаваш che се иска **explicit ordering by row position**, не by priority.

**Въпросът → Solution Framing.** "Preserves rule-definition order" — конкретно сочи RULE ORDER specifically.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че RULE ORDER preserves table-definition order, знаеш че OUTPUT ORDER preserves output-priority order (different axis), знаеш че COLLECT order е implementation-dependent. Това е знание за разликата между RULE ORDER и OUTPUT ORDER.

---

## Question 26: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A team modeling tax-calculation rules in DMN creates a Decision Requirements Diagram (DRD) with three decisions: `BaseTaxAmount`, `Deductions`, `FinalTax`. The team draws Information Requirements arrows: `BaseTaxAmount` → `FinalTax` AND `Deductions` → `FinalTax`. Then, in a moment of confused refactoring, someone draws an arrow from `FinalTax` back to `Deductions` (intending to express "deductions might depend on tax outcome" — a misunderstanding). The DMN diagram editor accepts the model. At runtime, Zeebe rejects the deployment with "Decision Requirements Graph contains a cycle".

**What is the correct understanding of DRD cycles?**

- **a)** DRDs must be **acyclic (DAG)** — no decision can depend on a decision that transitively depends on it. The engine cannot evaluate cyclic dependencies (would loop infinitely). The team must redesign — likely splitting "Deductions that depend on prelim tax" into a separate intermediate decision. Documentation: [DRD](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/)

- **b)** DRDs support cycles via "iterative evaluation" — the engine repeats evaluation until values stabilise. Documentation: [DRD](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/)

- **c)** Cycles are allowed in DRDs but warnings are emitted; configure `dmn.allowCycles=true`. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Zeebe deploys the model successfully; the cycle error is from the modeler editor only. Documentation: [DRD](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** A **DRD must be a directed acyclic graph (DAG)**. The engine evaluates decisions by traversing dependencies from leaves to roots — cycles would prevent termination. The DMN spec requires DAG semantics; Zeebe enforces this at deployment time. The team must redesign to remove the cycle, typically by introducing an intermediate decision that breaks the cyclic dependency.

- **Option b) — Incorrect.** No iterative-evaluation mode for DRDs.

- **Option c) — Incorrect.** No configuration toggle allows cycles.

- **Option d) — Incorrect.** Zeebe rejects cyclic DRDs at deployment, not just at editor time.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. DRD must be DAG; Zeebe rejects cycles.
- **b) 1/10** — invented mode.
- **c) 1/10** — invented configuration.
- **d) 2/10** — невярно — Zeebe enforces DAG at deploy.

**Correct Answer:** DRDs must be acyclic (DAG). The engine cannot evaluate cyclic dependencies.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Arrow back to Deductions creates cycle" + "deployment rejected" → разпознаваш che проблемът е **DAG violation in DRD**.

**Въпросът → Solution Framing.** "Correct understanding of DRD cycles" — изпитва се DMN spec knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DRD е acyclic by spec, знаеш че Zeebe enforces deploy-time, знаеш che cycle resolution е model redesign (intermediate decision), знаеш че няма iterative mode и няма config to allow cycles. Това е знание за DMN model semantics.

---

## Question 27: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A health-claims processor uses a DMN to determine reimbursement based on patient age. The Decision Table has rows like:
- Age 0-17 → "pediatric_plan"
- Age 18-64 → "adult_plan"
- Age 65+ → "senior_plan"

The developer writes the input cell for the first row as `[0..17]`. For boundary cases — a child exactly 18 years old — the developer needs the engine to NOT match the "0-17" row. They want the boundary to be **exclusive at the upper end**.

**Which FEEL range notation expresses "0 inclusive, 17 inclusive, but 18 exclusive"?**

- **a)** `[0..17]` — square brackets are **inclusive** on both ends. Age 17 matches; age 18 does not (because 18 > 17). Documentation: [Decision Table](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** `[0..18)` — left bracket inclusive, right parenthesis exclusive. Age 17 matches; age 18 does NOT match. Documentation: [DMN ranges](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** `[0..<18]` — special FEEL notation. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `(0..17]` — parenthesis on left makes lower bound exclusive (excludes 0). Documentation: [DMN ranges](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `[0..17]` with square brackets on both ends is **inclusive on both bounds**: matches ages 0, 1, 2, ..., 16, 17. Age 18 is outside the range (> 17), so does NOT match — exactly the desired semantics. The team's interpretation that they need a special "exclusive at 18" syntax is unnecessary — `[0..17]` already excludes 18 because 18 is greater than 17.

- **Option b) — Also valid syntax.** `[0..18)` means "0 inclusive, 18 exclusive" — same effective semantics for integer ages but expresses the boundary intent differently (upper bound is 18 exclusive). Both options yield identical behaviour for integer inputs.

- **Option c) — Incorrect.** `[0..<18]` is not standard FEEL/DMN range syntax.

- **Option d) — Incorrect.** `(0..17]` excludes 0, which is wrong for "pediatric starts at birth".

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `[0..17]` е caнonical and correct for integer ages 0-17.
- **b) 9/10** — also valid; identical semantic for integers; matter of style.
- **c) 2/10** — invented syntax.
- **d) 3/10** — excludes 0 incorrectly.

**Correct Answer:** `[0..17]` — square brackets are inclusive on both ends. Age 17 matches; age 18 does not.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Age boundary 18 exclusive" → разпознаваш che се иска precise range notation.

**Въпросът → Solution Framing.** "Inclusive/exclusive boundaries" — изпитва се interval notation knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che `[a..b]` е inclusive both ends, знаеш che `(a..b)` е exclusive both ends, знаеш che `[a..b)` или `(a..b]` са mixed, знаеш che `[0..17]` excludes 18 automatically (>17). Това е знание за interval notation.

---

## Question 28: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A subscription billing service uses DMN to determine the discount tier based on customer's region. The Decision Table has an input column `region` (string). The developer writes one row with the input cell `"US","CA","MX"` — intending to match customers in any of these three North American regions. But at runtime, every North American customer falls through with "no rule matched".

**What is the correct FEEL syntax for "any of these values" in a Decision Table input cell?**

- **a)** Comma-separated list of values matches any one of them (logical OR): `"US","CA","MX"` — this IS the correct syntax. The runtime failure must be from elsewhere (e.g., the input variable is not a plain string). Documentation: [Decision Table input cell](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** Use FEEL `in` operator: `region in ["US", "CA", "MX"]`. Documentation: [FEEL operators](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

- **c)** Use `or` keyword: `"US" or "CA" or "MX"`. Documentation: [FEEL operators](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

- **d)** Use FEEL list syntax: `[\"US\", \"CA\", \"MX\"]` (whole list as the input cell). Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** In DMN Decision Table input cells, **comma-separated values mean logical OR** — match if the input equals any of the values. `"US","CA","MX"` matches when `region` equals any of those strings. The syntax is correct. If the runtime fails to match, the cause is elsewhere — likely the input is a non-string type, or has whitespace, or has the wrong case. The team must verify the variable type and value, not change the syntax.

- **Option b) — Incorrect for input cells.** The `in` operator is valid in FEEL boxed expressions but **not** the canonical syntax for Decision Table input cells. Input cells use abbreviated forms.

- **Option c) — Incorrect.** `or` in FEEL is a boolean operator on boolean operands; `"US" or "CA"` doesn't evaluate to a useful predicate in input-cell context.

- **Option d) — Incorrect.** Using list syntax `["US","CA","MX"]` doesn't match individual strings — it tries to compare the input value against a list, which fails for scalar inputs.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Comma-separated в input cell означава OR.
- **b) 4/10** — `in` operator работи в boxed expressions, не canonical в input cells.
- **c) 2/10** — `or` е boolean operator, не string-match.
- **d) 3/10** — list literal не matches scalar input.

**Correct Answer:** Comma-separated values matches any one of them (logical OR): `"US","CA","MX"`. The runtime failure is elsewhere — likely the input variable type or value.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Comma-separated values + no match" → разпознаваш che syntax IS correct; problem е elsewhere.

**Въпросът → Solution Framing.** "Correct FEEL syntax for any-of" — изпитва се DMN input cell shorthand.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che DMN input cells използват abbreviated FEEL (comma = OR), знаеш che `in` operator е boxed-expression syntax, знаеш че `or` е boolean operator, знаеш че list literal е different abstraction. Това е знание за DMN input cell variant syntax.

---

## Question 29: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A team's DMN decision `RiskAssessment` is currently deployed at version 3. A new version 4 fixes a bug in the risk calculation logic. The team deploys v4 to the same cluster. Some processes that started under v3 are still in-flight and their Business Rule Tasks haven't yet evaluated `RiskAssessment`.

**What version of `RiskAssessment` will in-flight processes call when their Business Rule Task evaluates it?**

- **a)** In-flight processes call the version of `RiskAssessment` that was **latest at the time the process instance started** (v3 in this case). Decision evaluation in Zeebe is version-pinned to the calling process instance's deployment time. Documentation: [Decision deployment](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** In-flight processes always call the **latest version** (v4) — Zeebe automatically picks the newest. Documentation: [Decision deployment](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Behavior is configurable per Business Rule Task via a `versionStrategy` property. Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **d)** In-flight processes fail evaluation with "decision version mismatch" until the team explicitly migrates. Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe **pins decision references to the latest version available at the time the process instance was deployed**. So a process instance started while v3 was the latest will continue to evaluate `RiskAssessment` v3 even after v4 is deployed. New process instances started after v4's deployment will use v4. This isolation guarantees consistency — a single process instance always sees a coherent decision-and-process version pair.

- **Option b) — Incorrect.** Zeebe does NOT auto-upgrade in-flight processes to new decision versions.

- **Option c) — Incorrect.** No `versionStrategy` property exists on Business Rule Tasks.

- **Option d) — Incorrect.** No mismatch error; in-flight just continues with the pinned version.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Decision version is pinned to process instance deployment time.
- **b) 2/10** — невярно — no auto-upgrade.
- **c) 2/10** — invented property.
- **d) 1/10** — invented error behaviour.

**Correct Answer:** In-flight processes call the version of `RiskAssessment` that was latest at the time the process instance started (v3).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "New DMN version + in-flight processes" → разпознаваш che се иска **version isolation explanation**, не migration mechanism.

**Въпросът → Solution Framing.** "What version called" — изпитва се default version-binding behaviour.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Zeebe pins decision references to deployment time, знаеш che no auto-upgrade, знаеш che version isolation е default, знаеш che explicit migration е separate feature за batch upgrade. Това е знание за Zeebe versioning model.

---



# Section 4 — Configuring Forms (Questions 30-32)

> Weight 5% • Topics: Form element library, data binding, conditional rendering, table binding, FEEL templating.

---

## Question 30: Configuring Forms (Weighting: 5%)

**Scenario:** A driving-license renewal form in Camunda 8 needs a **dropdown of supported license types** that is loaded **dynamically from a process variable** (the list of available types depends on the applicant's state/region — different states issue different license types). The variable `availableLicenseTypes` is set by an upstream Service Task as a list of objects: `[{value: "STANDARD", label: "Standard License"}, ...]`.

**How should the developer configure the dropdown to use this dynamic list?**

- **a)** Configure the dropdown's **Options source** as `Input data` and set the **Input data path** to `=availableLicenseTypes`. Configure value field `value` and label field `label`. Documentation: [Form element library](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/)

- **b)** Hardcode all possible license types and use conditional `Show if` to hide irrelevant ones based on `applicantState`. Documentation: [Form options](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-options/)

- **c)** Use a separate User Task before the main form to filter the list, then a static dropdown. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Camunda 8 Forms don't support dynamic dropdowns; use a free-text input with FEEL validation. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Forms' dropdown component supports **dynamic options sourced from a process variable**. Configure the Options source to "Input data" and bind to a FEEL expression like `=availableLicenseTypes`. The dropdown reads the variable at form render time and displays each list item using the configured value/label fields.

- **Option b) — Suboptimal.** Hardcoding all options + conditional hide produces a fragile model that must be updated when new license types are added. Variable-driven is the maintainable choice.

- **Option c) — Suboptimal.** Adding an extra User Task is overhead for what the form already supports.

- **Option d) — Incorrect.** Dynamic dropdowns ARE supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Dynamic options via Input data path е canonical Forms feature.
- **b) 3/10** — fragile; requires model update per new type.
- **c) 4/10** — overhead; form natively supports dynamic options.
- **d) 1/10** — невярно — supported feature.

**Correct Answer:** Configure the dropdown's Options source as `Input data` and set the Input data path to `=availableLicenseTypes`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Dropdown dynamic from variable" → разпознаваш че се иска **variable-bound dropdown options**, не hardcoded list.

**Въпросът → Solution Framing.** "Use this dynamic list" — конкретно търси variable-driven feature.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Forms dropdown има Options source = Input data, знаеш che value/label fields configure-нат как се render-ват, знаеш che FEEL expression bind-ва variable. Това е знание за Forms component feature.

---

## Question 31: Configuring Forms (Weighting: 5%)

**Scenario:** A tax-filing form has a numeric input "annual_income". The team wants to **validate** that the value is at least 0 and at most 10,000,000 — values outside this range should show an inline error message and prevent form submission. The team is configuring this in Web Modeler Forms.

**Which Forms feature enables this validation?**

- **a)** Use the field's **Validation properties**: configure `Minimum value: 0` and `Maximum value: 10000000`. The form blocks submission if validation fails and shows inline error. Documentation: [Forms validation](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/)

- **b)** Configure a FEEL `Required if` expression: `=annual_income >= 0 and annual_income <= 10000000`. Documentation: [Forms options](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-options/)

- **c)** Add a downstream Service Task that validates the value and throws an error if out of range. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Camunda 8 Forms don't have built-in validation; use HTML5 `min`/`max` attributes directly in the form XML. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Forms numeric inputs (and other types) have **dedicated validation properties** in Web Modeler: Minimum value, Maximum value, Required, regex Pattern, and Custom FEEL validation. When the user tries to submit with out-of-range values, the form blocks submission and displays inline error messages next to the offending field.

- **Option b) — Incorrect.** `Required if` controls **whether the field is required**, not value range validation. Different mechanism.

- **Option c) — Suboptimal.** Server-side validation in a Service Task is defense-in-depth but defeats the purpose of UI validation (poor UX — user submits invalid data, then gets a downstream error after the task is done).

- **Option d) — Incorrect.** Forms do have built-in validation.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Validation properties са built-in Forms feature.
- **b) 3/10** — Required if controls required-ness, not range.
- **c) 4/10** — server-side е defense-in-depth but poor UX standalone.
- **d) 1/10** — невярно — built-in validation existing.

**Correct Answer:** Use the field's Validation properties: configure Minimum value: 0 and Maximum value: 10000000.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Validate numeric range + inline error + block submission" → разпознаваш че се иска **built-in form validation**.

**Въпросът → Solution Framing.** "Forms feature enables this" — изпитва се knowledge на Validation properties.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Forms имат dedicated Validation section (min/max/pattern/required/feel), знаеш che Required if е orthogonal feature, знаеш che server-side е defense-in-depth not replacement. Това е знание за Forms validation feature.

---

## Question 32: Configuring Forms (Weighting: 5%)

**Scenario:** A bank's wire-transfer form needs to **upload a supporting document** (PDF of the transfer authorisation form). The PDF can be up to 20 MB. The team wants the upload to integrate with Camunda 8's Document Handling so that downstream Service Tasks can retrieve the PDF by reference.

**Which Forms feature handles document upload with Document Handling integration?**

- **a)** Use the **Document Upload** form component. The form uploads the file to Camunda's Document Handling service and stores the **document reference** as a process variable. Downstream tasks retrieve content via the reference. Documentation: [Forms + Document Handling](https://docs.camunda.io/docs/components/document-handling/getting-started/)

- **b)** Use a standard Text Input for the file path and have a downstream Service Task upload the file. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** Camunda Forms doesn't support file upload; use an external file-upload widget and pass the URL as a string. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Base64-encode the file in the form's hidden input and pass as a string variable. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Forms includes a **Document Upload** component that natively integrates with Document Handling. When the user uploads a file, the form sends it to the Document Handling service which stores it and returns a document reference. The reference (small JSON with documentId, mime type, filename) is stored as a process variable. Downstream tasks retrieve the document content via the API using the reference — variables stay lean, large files don't violate the 4MB variable limit.

- **Option b) — Suboptimal.** Text input + downstream upload is DIY and doesn't leverage the integrated Document Handling.

- **Option c) — Incorrect.** Forms DO support file upload via Document Upload component.

- **Option d) — Incorrect.** Base64 in a variable would exceed the 4MB Zeebe variable limit for any non-trivial file.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Document Upload component + Document Handling integration.
- **b) 3/10** — DIY work-around.
- **c) 1/10** — невярно — supported feature.
- **d) 1/10** — violates variable size limit.

**Correct Answer:** Use the Document Upload form component. The form uploads the file to Camunda's Document Handling service and stores the document reference as a process variable.

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Document upload + Document Handling integration" → разпознаваш che се иска **native Forms + Document Handling synergy**.

**Въпросът → Solution Framing.** "Forms feature handles" — изпитва се component knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Forms има Document Upload component, знаеш che Document Handling е canonical large-file mechanism, знаеш che variable size limit prevents Base64-in-variable. Това е знание за integrated 8.8 features.

---

# Section 5 — Configuring Connectors (Questions 33-36)

> Weight 6% • Topics: Connector Secrets, Inbound and Outbound Connectors.

---

## Question 33: Configuring Connectors (Weighting: 6%)

**Scenario:** A B2B integration calls a partner API protected by **OAuth2 client credentials**. The API requires the client to fetch an access token from the partner's token endpoint, then use it as a Bearer header on each API call. The token expires after 1 hour. The team is configuring this in an Outbound HTTP Connector.

**How does the Outbound HTTP Connector handle OAuth2 token lifecycle?**

- **a)** Configure the Outbound HTTP Connector's **Authentication type** as `OAuth 2.0 Client Credentials Flow`. Provide token endpoint URL, client ID, client secret (via `{{secrets.PARTNER_CLIENT_SECRET}}`). The Connector automatically fetches a token before each call (or caches it within validity) and applies the Bearer header. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** The Outbound HTTP Connector supports only static API keys; for OAuth2, use a Custom Connector. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** Use two Service Tasks — one to fetch the token, one to call the API with the token in headers. Manual coordination. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Configure the Authentication type as `Bearer` and pass the token directly; refresh manually by re-deploying. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Outbound HTTP Connector natively supports OAuth 2.0 Client Credentials flow as an Authentication type. Configuration includes token endpoint URL, client ID, client secret (typically referenced via `{{secrets.NAME}}` placeholder), scope, and audience. The Connector manages the token lifecycle automatically — fetches a token, caches it, refreshes when near expiry — without manual coordination in BPMN.

- **Option b) — Incorrect.** OAuth2 IS natively supported.

- **Option c) — Suboptimal.** Manual token coordination is the pre-OAuth2-support workaround. Native support eliminates this.

- **Option d) — Incorrect.** Static Bearer requires manual refresh which is operationally infeasible for tokens that expire hourly.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. OAuth 2.0 Client Credentials е built-in Connector auth type.
- **b) 2/10** — невярно — OAuth2 е supported.
- **c) 4/10** — manual coordination е pre-OAuth2 workaround.
- **d) 2/10** — static Bearer не работи за expiring tokens.

**Correct Answer:** Configure the Outbound HTTP Connector's Authentication type as `OAuth 2.0 Client Credentials Flow`. The Connector automatically fetches and caches the token.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "OAuth2 client credentials + 1-hour token expiry" → разпознаваш che се иска **integrated token lifecycle**.

**Въпросът → Solution Framing.** "Handle OAuth2 token lifecycle" — изпитва се native Connector capability knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Outbound HTTP Connector има OAuth 2.0 като built-in auth type, знаеш che secrets are referenced via placeholder, знаеш che token caching/refresh е automatic. Това е знание за Connector auth feature catalog.

---

## Question 34: Configuring Connectors (Weighting: 6%)

**Scenario:** A retail platform integrates with a partner's order-confirmation webhook. The partner sends an HTTPS POST with each order confirmation. The team configures an **Inbound Webhook Connector** with correlation key `=body.orderId`. Production shows that occasionally the same order's webhook is **delivered twice** (partner's at-least-once delivery semantics) — and the Camunda process receives the message twice, advancing past the catch event with stale state on second arrival.

The team needs **idempotent webhook handling** — the second delivery of the same orderId should be silently ignored.

**Which Camunda 8.8 mechanism handles webhook idempotency?**

- **a)** Configure the Inbound Webhook Connector with a **deduplication key**: a FEEL expression identifying the unique event ID (e.g., `=body.orderId + body.timestamp`). The Connector tracks seen keys and silently discards duplicates within a TTL window. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Camunda automatically deduplicates by correlation key — duplicates are silently dropped. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **c)** Set `correlationKey` to a unique per-event value (e.g., `=body.uuid`) and add a downstream Exclusive Gateway checking a `seen` flag. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Configure the webhook endpoint with HTTP basic auth and a request rate limiter. Documentation: [Webhooks](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Inbound Webhook Connectors in Camunda 8.8 support **deduplication key configuration**. When configured, the Connector tracks recently-seen deduplication keys (typically within a configurable TTL window) and silently discards repeated webhooks with the same key. This protects downstream processes from at-least-once delivery duplicates without polluting BPMN with manual dedup logic.

- **Option b) — Incorrect.** Zeebe does NOT auto-deduplicate by correlation key. The correlation key matches messages to subscriptions, not to previous arrivals.

- **Option c) — Suboptimal.** Manual dedup via Exclusive Gateway works but pollutes the BPMN; requires maintaining a `seen` set in process state.

- **Option d) — Incorrect.** Auth and rate limiting don't address idempotency.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Deduplication key е Inbound Connector feature.
- **b) 1/10** — невярно — no auto-dedup by correlation key.
- **c) 4/10** — manual workaround; works but ugly.
- **d) 2/10** — different concerns (auth, throttling).

**Correct Answer:** Configure the Inbound Webhook Connector with a deduplication key.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Webhook delivered twice + duplicate processing" → разпознаваш che се иска **webhook deduplication**, не correlation logic.

**Въпросът → Solution Framing.** "Idempotent webhook handling" — изпитва се knowledge на Connector dedup feature.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Inbound Webhook Connector има deduplication key configuration, знаеш che correlation key е matching mechanism not dedup, знаеш che manual BPMN dedup е workaround. Това е знание за Connector configuration options.

---

## Question 35: Configuring Connectors (Weighting: 6%)

**Scenario:** A customer-onboarding process sends a welcome email with a PDF brochure attached. The email body is dynamically composed (customer name, plan details). The team is using the **Email Outbound Connector** from Camunda's catalog. The PDF is referenced by a Document Handling document reference variable `welcomePdf`.

**How should the Email Connector be configured to send the welcome email with attachment?**

- **a)** Configure the Email Connector's **To** field with `=customerEmail`, **Subject** with a FEEL expression like `="Welcome, " + customer.firstName`, **Body** with HTML/text template, and **Attachments** field with `=[welcomePdf]` (list of document references). The Connector retrieves the document content from Document Handling and attaches it. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Email Connectors don't support attachments; convert the PDF to a base64 string and embed in the email body. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Send the email via an Outbound HTTP Connector calling SendGrid's API directly; Camunda's Email Connector is too limited. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **d)** Use two Service Tasks — one to extract the PDF as base64, one to send via Email Connector with base64-encoded content as an attachment string. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda's Email Outbound Connector natively supports attachments via document references. The Attachments field accepts a list of Document Handling references; the Connector resolves each reference to its content and attaches it to the email. FEEL expressions can dynamically compose To/Subject/Body fields from process variables.

- **Option b) — Incorrect.** Email Connectors DO support attachments via document references.

- **Option c) — Incorrect.** Camunda's Email Connector supports attachments; rebuilding it is unnecessary.

- **Option d) — Incorrect.** Manual base64 conversion is unnecessary and inflates variable size.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Email Connector + Document Handling reference е canonical.
- **b) 2/10** — невярно — attachments са supported.
- **c) 3/10** — reinvents existing Connector.
- **d) 2/10** — manual conversion unnecessary.

**Correct Answer:** Configure the Email Connector's Attachments field with `=[welcomePdf]` (list of document references).

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Email with attachment + Document Handling reference" → разпознаваш che се иска **native Connector + Document Handling integration**.

**Въпросът → Solution Framing.** "Configure Email Connector with attachment" — изпитва се built-in feature knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Email Connector accept-ва document references in Attachments field, знаеш che Document Handling е первичният mechanism за large files, знаеш che FEEL composition работи за dynamic email composition. Това е знание за Connector + Document Handling synergy.

---

## Question 36: Configuring Connectors (Weighting: 6%)

**Scenario:** An Outbound HTTP Connector calls a partner API that occasionally returns **HTTP 503 Service Unavailable** during partner maintenance windows. Currently each 503 immediately creates an Incident in Operate. The team wants the Connector to **automatically retry** transient 5xx errors with exponential backoff before reporting an incident.

**Which Connector configuration enables retry with backoff?**

- **a)** Outbound Connectors run as job workers internally — configure `zeebe:taskDefinition retries="3"` on the underlying Service Task. The Connector's worker decrements retries on failure; Zeebe re-activates the job (re-runs the Connector). Backoff is implemented by the Connector's worker code with built-in exponential delay. Documentation: [Job retries](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Configure `zeebe:retryBackoff` array property on the Connector element. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Wrap the Connector in a Subprocess with an Error Boundary Event looping back. Documentation: [Subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/subprocesses/)

- **d)** Camunda Connectors don't support retries; use a Custom Connector with retry logic. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda Outbound Connectors execute as job workers internally — the same `retries` property that controls Service Task retry applies to Connector elements. Set `zeebe:taskDefinition retries="3"` on the Connector. The Connector's worker is responsible for the retry/backoff behaviour internally (typically with exponential backoff for transient errors like 5xx). When retries reach zero, the Connector reports the failure as an incident.

- **Option b) — Incorrect.** `retryBackoff` is not a standard property on Connector elements. Backoff is implemented worker-side.

- **Option c) — Suboptimal.** Manual loop-back is fragile and clutters the BPMN.

- **Option d) — Incorrect.** Built-in Connectors do support retries via standard task retry property.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Connector retry чрез standard taskDefinition retries.
- **b) 2/10** — invented property.
- **c) 3/10** — manual loop е workaround.
- **d) 2/10** — невярно — built-in Connectors support retries.

**Correct Answer:** Configure `zeebe:taskDefinition retries="3"` on the underlying Service Task. The Connector worker handles backoff internally.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Transient 5xx + immediate incident + want auto retry with backoff" → разпознаваш che се иска **standard retry configuration**.

**Въпросът → Solution Framing.** "Enables retry with backoff" — изпитва се knowledge of Connector retry mechanism.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Connectors run as job workers internally, знаеш che retries property е standard, знаеш che backoff е worker-implementation detail. Това е знание за Connector internals.

---



# Section 6 — Developing Extensions & Integrations (Questions 37-50)

> Weight 25% • Topics: FEEL Expressions, Custom Connectors (Connector SDK), Job Workers, Camunda APIs, RPA Workers.

---

## Question 37: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A scheduling process computes the next business day given an arbitrary date. The team needs to skip weekends — given a Friday, return Monday; given a Saturday or Sunday, also return Monday. The team writes a FEEL expression but struggles with the date arithmetic.

**Which FEEL expression correctly computes "next business day"?**

- **a)** `if day of week(date) = "Friday" then date + duration("P3D") else if day of week(date) in ["Saturday","Sunday"] then date + duration("P3D") - duration("P" + string(day of week(date) = "Saturday" then 1 else 2) + "D") else date + duration("P1D")` — verbose but explicit branches. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** Decompose with helper FEEL: `let dow = day of week(date), inc = if dow = "Friday" then 3 else if dow = "Saturday" then 2 else if dow = "Sunday" then 1 else 1 in date + duration("P" + string(inc) + "D")` — `let-in` for readability. Documentation: [FEEL contexts](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-context/)

- **c)** Use FEEL `business day(date)` built-in. Documentation: [FEEL functions](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** FEEL doesn't support business-day arithmetic; compute in a Service Task with Java. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option b) — Correct.** FEEL's `let-in` expression provides a clean way to bind intermediate values for readability. `day of week()` returns the weekday as a string; we compute the day-increment based on weekday, then add a P{N}D duration. The expression is readable, FEEL-native, and doesn't need a worker.

- **Option a) — Works but ugly.** Inline branching works but is hard to read and maintain. Same logic, worse form.

- **Option c) — Incorrect.** No `business day()` built-in in FEEL.

- **Option d) — Incorrect.** FEEL handles this fine; worker is overkill.

**Per-option scoring (1–10):**
- **a) 5/10** — works but unreadable; verbose branching.
- **b) 10/10** — верен. let-in е clean, FEEL-native, readable.
- **c) 1/10** — invented function.
- **d) 3/10** — overkill; FEEL handles it.

**Correct Answer:** `let dow = day of week(date), inc = if dow = "Friday" then 3 else if dow = "Saturday" then 2 else if dow = "Sunday" then 1 else 1 in date + duration("P" + string(inc) + "D")`

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Skip weekends + business day arithmetic" → разпознаваш che се иска **FEEL temporal arithmetic**, не worker.

**Въпросът → Solution Framing.** "Correctly computes" + readability — изпитва се FEEL idiom knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che FEEL има `let-in` expression, знаеш che `day of week()` връща string ("Monday" .. "Sunday"), знаеш che `duration("P{N}D")` add-ва дни към date, знаеш che FEEL няма `business day()` built-in. Това е знание за FEEL temporal + let-in idioms.

---

## Question 38: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must validate that a customer's email address looks like a valid email — present, has `@`, has a domain with at least one dot. The team needs a single FEEL boolean expression.

**Which FEEL expression correctly validates the basic email shape?**

- **a)** `matches(email, "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")` — FEEL `matches()` built-in tests a regex against a string. Returns boolean. Documentation: [FEEL string functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **b)** `email like "%@%.%"` — FEEL SQL-style LIKE. Documentation: [FEEL operators](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

- **c)** `email.indexOf("@") > 0 and email.indexOf(".", email.indexOf("@")) > 0` — JavaScript-style. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `contains(email, "@") and contains(substring after(email, "@"), ".")` — using FEEL contains and substring after. Documentation: [FEEL string functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's `matches(string, regex)` built-in tests a regular expression and returns boolean. This is the canonical way to validate string patterns. The regex `^[^@\s]+@[^@\s]+\.[^@\s]+$` enforces: chars before @, one @, chars after @, one dot, chars after dot — a basic email shape.

- **Option b) — Incorrect.** FEEL doesn't have SQL-style LIKE operator.

- **Option c) — Incorrect.** FEEL doesn't have `.indexOf()` method on strings; that's JavaScript.

- **Option d) — Working alternative but less robust.** `contains` and `substring after` are FEEL built-ins; the composed expression works but doesn't enforce the structure as precisely as regex (e.g., `"@."` would pass — empty local part). Regex is the better tool.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. matches() with regex е canonical FEEL string validation.
- **b) 1/10** — невярна — no LIKE operator in FEEL.
- **c) 1/10** — JavaScript syntax.
- **d) 5/10** — работи но less precise than regex.

**Correct Answer:** `matches(email, "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")`

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Validate email shape" → разпознаваш che се иска **regex-based string validation в FEEL**.

**Въпросът → Solution Framing.** "Boolean expression" — изключва multi-step Service Task approach.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che FEEL `matches()` приема regex, знаеш che `contains()` и `substring after()` са FEEL built-ins за simple checks, знаеш che FEEL няма JS-style methods (`.indexOf`) или SQL `LIKE`. Това е знание за FEEL standard library.

---

## Question 39: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must merge two context (object) variables `customer` and `orderDetails` into a single context for downstream use. Both have non-overlapping keys. The team writes various attempts but none compile cleanly.

**Which FEEL expression correctly merges two contexts?**

- **a)** `put all(customer, orderDetails)` — FEEL `put all()` built-in merges two contexts, returning a new context with keys from both. Documentation: [FEEL context functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-context/)

- **b)** `{**customer, **orderDetails}` — FEEL spread operator like Python/JavaScript. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `customer + orderDetails` — `+` operator on contexts performs merge. Documentation: [FEEL operators](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

- **d)** `merge(customer, orderDetails)` — FEEL `merge()` built-in. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's `put all(context1, context2, ...)` built-in returns a new context combining the entries of all input contexts. If keys overlap, later values overwrite earlier ones. This is the canonical FEEL way to merge contexts.

- **Option b) — Incorrect.** FEEL doesn't have spread operator `**` or `...`. That's Python/JavaScript.

- **Option c) — Incorrect.** FEEL `+` is for numeric addition or string concatenation, not context merge.

- **Option d) — Incorrect.** No `merge()` built-in in FEEL; the function is `put all()`.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `put all()` е FEEL canonical context merge.
- **b) 1/10** — spread operator не е FEEL.
- **c) 2/10** — `+` не работи на contexts.
- **d) 2/10** — invented function name; правилно е `put all()`.

**Correct Answer:** `put all(customer, orderDetails)`

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-context/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Merge two contexts" → разпознаваш che се иска **FEEL context merging built-in**.

**Въпросът → Solution Framing.** "Correctly merges" — изпитва се knowledge на FEEL context library.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che `put all()` е canonical context merge, знаеш che FEEL **няма** spread operator или JS-style operators, знаеш che `+` е numeric/string only, знаеш че `merge()` не съществува (common assumption from other languages). Това е знание за FEEL context function names.

---

## Question 40: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression aggregates customer orders by region. The input is `orders` — list of objects, each with `region` (string) and `amount` (number). The team wants to return a list of `{region, totalAmount}` objects — one per distinct region.

**Which FEEL expression correctly groups and sums?**

- **a)** `for region in distinct values(orders[*].region) return {region: region, totalAmount: sum(orders[region = region][*].amount)}` — using FEEL `for-in-return` + filter + sum. Documentation: [FEEL list functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** `orders.groupBy("region").sum("amount")` — JavaScript-style chained methods. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `select region, sum(amount) from orders group by region` — SQL syntax in FEEL. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `aggregateBy(orders, "region", "amount", "sum")` — FEEL `aggregateBy()` built-in. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct (with minor scope caveat).** FEEL's `for-in-return` produces a list. `distinct values(orders[*].region)` gives the unique regions. For each region, filter the orders by matching region (note: the inner `region` reference shadows the outer; for clarity, rename to e.g., `r`: `for r in distinct values(orders[*].region) return {region: r, totalAmount: sum(orders[region = r][*].amount)}`). FEEL idiomatic.

- **Option b) — Incorrect.** FEEL doesn't have JS-style chained methods like `.groupBy()` or `.sum()`.

- **Option c) — Incorrect.** FEEL doesn't have SQL syntax.

- **Option d) — Incorrect.** No `aggregateBy()` built-in.

**Per-option scoring (1–10):**
- **a) 9/10** — верен idiomatically; небрежна shadowing на name `region` (минорен issue).
- **b) 1/10** — JS syntax не е FEEL.
- **c) 1/10** — SQL не е FEEL.
- **d) 1/10** — invented function.

**Correct Answer:** `for r in distinct values(orders[*].region) return {region: r, totalAmount: sum(orders[region = r][*].amount)}`

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Group by region + sum" → разпознаваш che се иска **FEEL list aggregation idiom**.

**Въпросът → Solution Framing.** "Group and sum" — изпитва се FEEL composability knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che `for-in-return` е FEEL iteration, знаеш che `distinct values()` е unique-filter built-in, знаеш che list filter `[predicate]` syntax + projection `[*].field`, знаеш che FEEL **няма** JS chained methods или SQL. Това е знание за FEEL composability of list functions.

---

## Question 41: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A Camunda 8 Self-Managed deployment has 4 broker partitions. The team has one Java worker subscribed to job type `"validate-claim"` with `maxJobsActive=32`. Under sustained load, the worker processes about 8 jobs concurrently, even though `maxJobsActive` allows 32. The other 24 slots remain unused. The team also notices broker logs showing job activations distributed unevenly — partition 0 hands out most jobs, partitions 1-3 rarely.

**What is the most likely cause of this under-utilization?**

- **a)** Each Zeebe partition activates jobs **independently** for its own subset of process instances. With one worker and 4 partitions, each partition's activation share is limited — but maxJobsActive caps the total across partitions, not per partition. The team should **add more workers** to better distribute activation across partitions. Documentation: [Job workers + partitions](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Decrease `pollInterval` to poll the broker more frequently across all partitions. Documentation: [Job worker configuration](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Set `maxJobsActive` to 8 to match the actual concurrency. Documentation: [Job worker configuration](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Re-balance partitions via Operate's partition manager. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe distributes process instances across partitions; each partition handles activation for its own instances independently. A single worker polls all partitions but might get more activations from one partition (due to round-robin or load distribution quirks). Adding more worker instances helps because each worker can independently poll, and the broker tries to keep activations balanced across the worker pool. Plus, with more workers the partition-skewed distribution matters less.

- **Option b) — Incorrect.** Polling frequency isn't the bottleneck — the broker pushes jobs as available.

- **Option c) — Incorrect.** Lowering maxJobsActive doesn't increase utilization; it just caps lower.

- **Option d) — Incorrect.** No "partition manager" in Operate; partitions are configured at cluster setup, not rebalanced runtime.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Horizontal scaling + partition distribution insight.
- **b) 2/10** — pollInterval not the issue.
- **c) 2/10** — lower cap doesn't help under-utilization.
- **d) 1/10** — невярна — no runtime partition rebalance.

**Correct Answer:** Each Zeebe partition activates jobs independently. Add more workers to better distribute activation across partitions.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "4 partitions + 1 worker + uneven activation + only 8/32 used" → разпознаваш che проблемът е **single-worker partition skew**, не configuration.

**Въпросът → Solution Framing.** "Cause of under-utilization" — изпитва се distributed-systems knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Zeebe partitions handle separate instance sets independently, знаеш che single worker може да get skewed activation, знаеш che horizontal scaling balances across partitions, знаеш че pollInterval е idle cadence not throughput. Това е знание за Zeebe partition + worker model.

---

## Question 42: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A Java worker processes Service Tasks for `"compute-pricing"`. The process instance has many variables, but the worker only needs `productId` and `quantity` for its computation. Currently the worker receives the full variable payload (~50 KB per job) on every activation, slowing down job processing and inflating network traffic. The team wants to **reduce the activated variables to just what's needed**.

**Which Job Worker configuration limits the variables fetched?**

- **a)** Configure the worker with `fetchVariables = ["productId", "quantity"]` (Java SDK) or equivalent property in other SDKs. Zeebe sends only these variables in the job activation payload. Documentation: [Job worker configuration](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Configure the Service Task's `zeebe:taskDefinition variableNames` property in BPMN. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** Use input mapping on the Service Task to copy only those variables to a sub-scope. Documentation: [Variable mapping](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Variables are always sent fully; size cannot be reduced at activation time. Documentation: [Job workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe Java client (and other SDKs) supports `fetchVariables` configuration on the JobWorker builder. When set, Zeebe filters the variables sent in job activations to only those listed — drastically reducing network payload and worker memory for variable-heavy processes.

- **Option b) — Partially viable but different mechanism.** Input mapping at the BPMN level performs scope copying, but the activation payload to the worker still includes whatever's visible in scope. fetchVariables is the worker-side filter.

- **Option c) — Partially viable.** Input mapping helps if used carefully but doesn't replace fetchVariables for the worker's network payload.

- **Option d) — Incorrect.** fetchVariables exists exactly to reduce payload.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. fetchVariables е canonical worker-side filter.
- **b) 4/10** — не e standard property; input mapping е different mechanism.
- **c) 5/10** — input mapping helps но не e the worker-side filter.
- **d) 1/10** — невярно — payload може да се намали.

**Correct Answer:** Configure the worker with `fetchVariables = ["productId", "quantity"]`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Many variables but worker needs few + inflated payload" → разпознаваш che се иска **variable fetch filter at worker level**.

**Въпросът → Solution Framing.** "Limits the variables fetched" — изпитва се worker SDK feature knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che SDK имат fetchVariables config option, знаеш che input mapping е BPMN-level scope copying (different layer), знаеш che payload size IS reducible. Това е знание за SDK worker configuration.

---

## Question 43: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A Spring Boot application uses Spring Zeebe to host job workers. The team wants the Spring Boot application to **automatically deploy** any BPMN/DMN/Form files placed in `src/main/resources/processes/` to the Zeebe cluster on startup. Currently each deployment is manual via CLI.

**Which Spring Zeebe feature enables auto-deployment of process resources?**

- **a)** Annotate the Spring Boot application class with `@Deployment(resources = "classpath:processes/*.bpmn")`. Spring Zeebe scans the classpath and deploys matching resources at startup. Documentation: [Spring Zeebe SDK](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** Use a `@PostConstruct` method that manually iterates the directory and calls `zeebeClient.newDeployResourceCommand()`. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

- **c)** Spring Zeebe doesn't support auto-deployment; use Camunda Web Modeler API instead. Documentation: [Web Modeler API](https://docs.camunda.io/docs/apis-tools/web-modeler-api/overview/)

- **d)** Configure the Maven plugin `camunda-deploy-plugin` to deploy on build. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Spring Zeebe provides the `@Deployment` annotation (typically placed on the main application class or a configuration class) that triggers auto-deployment of classpath resources matching a pattern on application startup. This eliminates the need for manual deployment steps.

- **Option b) — Working but reinvents the feature.** Manual `@PostConstruct` works but defeats the purpose of using Spring Zeebe's conventions.

- **Option c) — Incorrect.** Spring Zeebe DOES support auto-deployment.

- **Option d) — Incorrect.** No such Maven plugin in the Camunda ecosystem.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `@Deployment` annotation е Spring Zeebe canonical feature.
- **b) 5/10** — работи но reinvents existing convenience.
- **c) 2/10** — невярно — Spring Zeebe supports auto-deploy.
- **d) 1/10** — invented plugin.

**Correct Answer:** Annotate the Spring Boot application class with `@Deployment(resources = "classpath:processes/*.bpmn")`.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Auto-deploy on startup" → разпознаваш che се иска **Spring Zeebe convention feature**.

**Въпросът → Solution Framing.** "Spring Zeebe feature" — изпитва се specific SDK convention.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Spring Zeebe има `@Deployment` annotation, знаеш че classpath scanning patterns са standard Spring, знаеш че manual `@PostConstruct` е reinventing. Това е знание за Spring Zeebe conventions.

---



## Question 44: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A Node.js worker built with the TypeScript Zeebe SDK occasionally encounters runtime errors (network blip, downstream 500, malformed payload). The team wants the worker to gracefully fail the job (with retry budget) when an error occurs, instead of crashing the process.

**Which TypeScript SDK pattern handles errors correctly within a `taskHandler`?**

- **a)** Wrap the task handler body in try/catch. On caught error, call `job.fail("Error message", retries: job.retries - 1)` to decrement retries and signal failure. Documentation: [TypeScript SDK](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

- **b)** Let the exception propagate out of the handler; the SDK auto-handles it as failJob with retries decremented. Documentation: [TypeScript SDK](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

- **c)** Call `process.exit(1)` so the worker crashes and another instance picks up the job. Documentation: [Node.js](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

- **d)** Set `errorHandler` callback at worker level; the handler invokes failJob internally. Documentation: [TypeScript SDK](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** TypeScript Zeebe SDK's idiomatic error handling: wrap the handler logic in try/catch, on caught error call `job.fail("description", { retries: job.retries - 1 })` to inform Zeebe of failure with decremented retry budget. Zeebe re-activates the job until retries reach 0, then creates an incident.

- **Option b) — Partially correct in some SDKs but not the cleanest.** The TS SDK does have unhandled-error handling in some versions, but explicit job.fail is the canonical pattern that gives the worker control over the error message and retry count.

- **Option c) — Incorrect.** Crashing the worker is wasteful — Zeebe will eventually re-activate the job (after timeout) but the worker process exits, requiring restart. Bad pattern.

- **Option d) — Incorrect.** Worker-level errorHandler is not the standard pattern; handler-level try/catch is.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Try/catch + job.fail е canonical TS SDK error pattern.
- **b) 5/10** — partially works in some SDK versions; не e canonical.
- **c) 1/10** — wasteful; crashes worker.
- **d) 3/10** — non-standard pattern.

**Correct Answer:** Wrap the task handler body in try/catch. On caught error, call `job.fail("Error message", retries: job.retries - 1)`.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Runtime errors + graceful failure + retry budget" → разпознаваш che се иска **explicit error reporting от worker**.

**Въпросът → Solution Framing.** "Handles errors correctly within taskHandler" — изпитва се SDK API knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che `job.fail()` decrements retries (или sets explicit value), знаеш che incident се създава при retries=0, знаеш che worker crash е wasteful (Zeebe ще re-activate-не след timeout). Това е знание за TS SDK error handling pattern.

---

## Question 45: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A team is debating: for an **operational dashboard** that lists running process instances and lets users update variables / cancel instances, should they use **Zeebe gRPC API** or **Orchestration Cluster REST API**?

**Which choice fits operational dashboards best in Camunda 8.8?**

- **a)** **Orchestration Cluster REST API** — designed for application integration, supports both **commands** (cancel, update variables, modify) and **queries** (list instances with filters). REST is easier to consume in browser-based UIs. Documentation: [Orchestration Cluster API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview/)

- **b)** **Zeebe gRPC API** — broker-level direct, lowest latency, command-only (no rich queries). Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

- **c)** **Operate API** — primary UI-backing API for Operate, legacy approach for new apps. Documentation: [Operate API](https://docs.camunda.io/docs/apis-tools/operate-api/overview/)

- **d)** Use both gRPC (for commands) and Operate API (for queries). Documentation: [Zeebe + Operate](https://docs.camunda.io/docs/apis-tools/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Orchestration Cluster REST API in Camunda 8.8 is the **unified API for application integration**. It supports both commands (cancel, modify, update variables) and queries (search/filter/list instances). REST is consumer-friendly for browser UIs. This is the recommended choice for new operational dashboards in 8.8+.

- **Option b) — Suboptimal.** gRPC is excellent for high-throughput backend workers but is command-oriented; lacks rich queries needed for dashboards.

- **Option c) — Suboptimal.** Operate API works but is **being de-emphasised in 8.8** as the Orchestration Cluster API consolidates these capabilities.

- **Option d) — Suboptimal.** Mixing two APIs adds complexity for a use case that the Orchestration Cluster API now covers in one place.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Orchestration Cluster API е unified canonical choice в 8.8.
- **b) 4/10** — gRPC е command-only; lacks rich queries.
- **c) 6/10** — Operate API работи но e legacy в 8.8.
- **d) 5/10** — split API works but added complexity.

**Correct Answer:** Orchestration Cluster REST API.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Operational dashboard + list + update + cancel" → разпознаваш che се иска **unified app integration API**.

**Въпросът → Solution Framing.** "Fits operational dashboards best in 8.8" — изпитва се 8.8 API positioning.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Orchestration Cluster API е unified в 8.8, знаеш che gRPC е command-only (low latency но lacks queries), знаеш che Operate API е legacy в 8.8, знаеш che REST е consumer-friendly за UI. Това е знание за Camunda 8.8 API catalog positioning.

---

## Question 46: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A custom Outbound Connector built with the Connector SDK calls a partner API. The team configures input parameters (URL, headers) via FEEL expressions evaluated at runtime, and the output is mapped to a process variable. The connector definition specifies `input` and `output` mapping properties.

**Which approach correctly defines Connector input/output handling?**

- **a)** Connector SDK lets the developer **annotate Java method parameters** with `@OutboundConnectorInput` (or equivalent) to declare input shape. The Connector runtime resolves FEEL expressions from the BPMN element's properties and binds to the Java method's parameters. Output return value or an explicit response object becomes the process variable. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** Connector defines its own input mapping XML schema; FEEL is not supported in Custom Connectors. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** Inputs/outputs are hardcoded in the Connector's Java code; BPMN designers cannot customise them. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **d)** Connector inputs are passed via the Job Worker's variable payload directly; no SDK-specific abstraction. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Connector SDK's Java idiom: developers define a request POJO (record class) with fields, and the SDK auto-resolves FEEL expressions from the BPMN element's properties to populate the POJO. The output of the connector's main method (response POJO or JSON) becomes the connector output, which the BPMN element maps to process variables. The SDK takes care of FEEL evaluation, type conversion, and variable binding.

- **Option b) — Incorrect.** Custom Connectors support FEEL; SDK does the resolution.

- **Option c) — Incorrect.** Inputs are externalised via the BPMN element's properties (with element templates for design-time UI).

- **Option d) — Partially correct mechanically but misses SDK abstraction.** Yes, Connectors are Job Workers internally, but the SDK provides a higher-level abstraction (input POJO mapping, response handling, type-safe FEEL eval).

**Per-option scoring (1–10):**
- **a) 10/10** — верен. SDK input/output handling via annotated POJOs + FEEL resolution.
- **b) 2/10** — невярно — FEEL supported.
- **c) 2/10** — невярно — inputs externalised.
- **d) 5/10** — partially true mechanically; misses SDK abstraction.

**Correct Answer:** Connector SDK lets developers annotate Java method parameters to declare input shape. The SDK resolves FEEL expressions from the BPMN properties and binds them. Output becomes process variable.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Custom Connector + FEEL inputs + output to variable" → разпознаваш che се иска **SDK input/output abstraction**.

**Въпросът → Solution Framing.** "Correctly defines input/output handling" — изпитва се SDK conventions.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SDK има annotated POJO approach, знаеш che FEEL evaluation е built-in за Connector inputs, знаеш che Connectors run as Job Workers under the hood but SDK abstracts that, знаеш че BPMN designer externalise properties via element templates. Това е знание за Connector SDK design.

---

## Question 47: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A team developed a Custom Outbound Connector for their partner integration in 2024 (Camunda 8.5 era). Now they're upgrading to Camunda 8.8. They want to know whether the existing Connector JAR will continue to work on 8.8 without modification, or if recompilation/code changes are needed.

**What is the correct understanding of Connector SDK version compatibility?**

- **a)** The SDK provides **stability commitments across minor versions** — a Connector built against 8.5 SDK typically works on 8.6/8.7/8.8 runtimes without code changes, though recompilation against the matching SDK version is recommended for major version bumps. Test before production rollout. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** Connector SDK has no compatibility guarantees; every Camunda version requires a full rewrite. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** Connectors built against any Camunda 8.x version run forever without compatibility issues. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **d)** Custom Connectors must be re-built with each minor version upgrade due to mandatory binary changes. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Connector SDK provides reasonable stability guarantees across minor versions, with a recommended practice to test and possibly recompile when upgrading. Major version bumps may introduce binary or API changes; minor bumps typically don't. The team should test the existing JAR on 8.8 staging before production rollout.

- **Option b) — Incorrect.** Overstates the instability.

- **Option c) — Incorrect.** Understates — long-term across multiple major versions is risky.

- **Option d) — Incorrect.** Overstates — minor versions usually maintain compatibility.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Stability across minor versions + testing recommendation.
- **b) 1/10** — overstated instability.
- **c) 2/10** — understated; long-term forever isn't realistic.
- **d) 3/10** — overstated; minor bumps usually compatible.

**Correct Answer:** The SDK provides stability commitments across minor versions; test before production rollout.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "8.5 Connector + upgrade to 8.8" → разпознаваш che се иска **compatibility expectation knowledge**.

**Въпросът → Solution Framing.** "Version compatibility understanding" — изпитва се SDK release-policy knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che SDK has minor-version stability, знаеш че testing е recommended, знаеш че major version bumps може да изискват recompile. Това е знание за practical version handling.

---

## Question 48: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A bank's reporting tool calls the **Optimize API** to fetch monthly operational metrics. The tool uses OAuth2 client credentials to authenticate. After a 6-month period of stable operation, the tool's auth fails with HTTP 401 "Invalid token". The OAuth2 client credentials haven't changed.

**Which is the most likely cause and the fix?**

- **a)** The client's access token has expired (typical lifespan 1 hour) and the tool isn't refreshing. **Implement token refresh logic** — re-fetch a new access token from the OAuth2 token endpoint when the cached token expires or when a 401 is returned. Documentation: [Authentication](https://docs.camunda.io/docs/apis-tools/optimize-api/overview/)

- **b)** Camunda Cluster's OAuth2 keys rotated; the client must re-register. Documentation: [Console](https://docs.camunda.io/docs/components/console/)

- **c)** Optimize API requires a new authentication scheme starting 8.8; switch to API keys. Documentation: [Optimize API](https://docs.camunda.io/docs/apis-tools/optimize-api/overview/)

- **d)** The cluster's network rules changed; whitelist the tool's IP. Documentation: [Network](https://docs.camunda.io/docs/components/console/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** OAuth2 client credentials grant typically yields tokens valid for **1 hour** (sometimes longer based on issuer config). A long-running tool that caches the token forever will eventually find it expired. The fix is to implement token refresh — many client libraries handle this automatically; otherwise, catch 401 → re-fetch token → retry the request, or pre-emptively refresh near expiry.

- **Option b) — Incorrect.** Camunda doesn't routinely rotate OAuth2 keys; the issue is token lifecycle, not key rotation.

- **Option c) — Incorrect.** API keys aren't the replacement.

- **Option d) — Incorrect.** Network rules don't produce 401 (would be connection failure or 403).

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Token expiry + missing refresh logic е most common cause.
- **b) 2/10** — key rotation не e standard cause.
- **c) 1/10** — невярно — no scheme change.
- **d) 2/10** — network issues give different errors.

**Correct Answer:** The client's access token has expired. Implement token refresh logic.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/optimize-api/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Stable for 6 months + suddenly 401 + credentials unchanged" → разпознаваш че проблемът е **token lifecycle**, не credentials, не network.

**Въпросът → Solution Framing.** "Most likely cause + fix" — изпитва се OAuth2 lifecycle knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che OAuth2 tokens имат TTL (typically 1 hour), знаеш че refresh е client responsibility, знаеш che 401 ≠ 403 ≠ network error, знаеш че Camunda не rotate-ва OAuth keys routine-но. Това е знание за OAuth2 patterns.

---

## Question 49: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** An RPA worker automates a legacy Windows accounting application. The RPA script logs into the app with **credentials** (username/password). The team wants the credentials handled securely — not embedded in the RPA script visible to all developers.

**Which Camunda 8.8 RPA approach handles credentials securely?**

- **a)** RPA workers can reference **Connector Secrets** (or equivalent cluster-level secret store) via placeholder syntax in the RPA configuration. Secrets are resolved at runtime; never appear in script source. Documentation: [Camunda RPA](https://docs.camunda.io/docs/components/rpa/getting-started/)

- **b)** Hardcode credentials in the RPA script and rely on file-system permissions to restrict access. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/getting-started/)

- **c)** Pass credentials as plaintext process variables; RPA worker reads from variable payload. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/getting-started/)

- **d)** RPA doesn't support credentials handling; manually log in before running the script. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda RPA integration with the Secrets mechanism allows RPA scripts to reference secrets via placeholders (e.g., `{{secrets.LEGACY_APP_PASSWORD}}`) — the runtime resolves them at execution, keeping the script source free of credentials. This is the canonical secure pattern, consistent with Outbound Connector secret handling.

- **Option b) — Incorrect.** Hardcoding credentials is anti-pattern; defeats secrets management.

- **Option c) — Incorrect.** Plaintext in process variables leaks to Operate audit, downstream tasks, etc.

- **Option d) — Incorrect.** RPA does support credentials.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Secrets placeholder pattern works for RPA scripts.
- **b) 1/10** — anti-pattern.
- **c) 2/10** — leaks plaintext to audit.
- **d) 2/10** — невярно — credentials handled in RPA.

**Correct Answer:** RPA workers can reference Connector Secrets via placeholder syntax.

**Official Documentation Link:** https://docs.camunda.io/docs/components/rpa/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "RPA + credentials + secure handling" → разпознаваш che се иска **secret store integration за RPA**.

**Въпросът → Solution Framing.** "Camunda 8.8 RPA approach" — изпитва се knowledge на RPA + Secrets integration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che RPA + Secrets са integrated в 8.8, знаеш che hardcoded credentials и plaintext variables са anti-patterns, знаеш че placeholder syntax е consistent across Connectors and RPA. Това е знание за RPA security integration.

---

## Question 50: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A team needs to integrate with a partner system that exposes only a **legacy SOAP API** (no REST, no gRPC). The SOAP API has 12 operations the team needs to call from various BPMN processes.

**Which Camunda 8 integration approach fits SOAP integration best?**

- **a)** Build a **Custom Outbound Connector** using the Connector SDK that wraps the SOAP client library (e.g., Apache CXF). Configure the SOAP operation as a Connector property; users of the Connector see only configuration in BPMN, not SOAP details. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** Use the generic **Outbound HTTP Connector** with raw HTTP POST containing the SOAP envelope as XML body. Manually handle SOAP-specific details (envelope, action header) per operation. Documentation: [HTTP Connector](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Camunda 8 doesn't support SOAP; convert the partner API to REST via a proxy. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **d)** Use Camunda RPA to drive a browser that submits SOAP requests via a web UI. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** A Custom Outbound Connector wrapping a SOAP client library (like Apache CXF or javax.xml.ws) gives a clean BPMN-side abstraction. Users configure the operation name, parameters, and the Connector handles SOAP envelope construction, WSDL parsing, and response unwrapping. This is the canonical approach for 12 SOAP operations: build once, use many times in BPMN.

- **Option b) — Working but ugly.** Generic HTTP POST with manually-constructed SOAP envelopes is fragile (each operation has its own envelope structure, namespace declarations, etc.) and clutters every BPMN process.

- **Option c) — Incorrect.** Camunda 8 supports SOAP via Custom Connector; no proxy needed.

- **Option d) — Incorrect.** RPA is for UI automation, not API integration.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Custom Connector + SOAP library е canonical for SOAP integrations.
- **b) 4/10** — works manually but ugly and fragile.
- **c) 2/10** — невярно — Custom Connector supports SOAP.
- **d) 1/10** — RPA е за UI, не API.

**Correct Answer:** Build a Custom Outbound Connector using the Connector SDK that wraps the SOAP client library.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Legacy SOAP API + 12 operations + multiple processes" → разпознаваш che се иска **reusable abstraction**, не one-off integration.

**Въпросът → Solution Framing.** "SOAP integration best" — изпитва се integration architecture knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Custom Connector SDK позволява wrapping на специфични clients (SOAP), знаеш che generic HTTP е fragile за SOAP, знаеш че RPA е за UI not API, знаеш че proxy conversion е workaround. Това е знание за integration architecture choices.

---



# Section 7 — Managing the Development Process (Questions 51-59)

> Weight 15% • Topics: Web Modeler projects, client credentials, instance management, validation, troubleshooting via Play and Operate.

---

## Question 51: Managing the Development Process (Weighting: 15%)

**Scenario:** A development team's workflow includes mandatory **peer review of BPMN changes** before deployment to staging. They want to enforce: developer modifies BPMN, opens a pull-request-style review in Web Modeler, second developer reviews and approves, then deployment happens. The team wants this **enforced by Web Modeler** rather than relying on team discipline.

**Which Web Modeler feature enables enforced peer review?**

- **a)** Use **Web Modeler's Reviewer role** combined with **Restricted deployment** — projects can be configured so deployments require approval from a Reviewer. The editor submits a change for review; the Reviewer approves before deployment. Documentation: [Web Modeler collaboration](https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/)

- **b)** Set up a Git integration with branch protection rules in GitHub/GitLab. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** Web Modeler doesn't enforce review workflows; rely on team process. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** Use Camunda Optimize to track deployments and flag unreviewed ones. Documentation: [Optimize](https://docs.camunda.io/docs/components/optimize/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler provides role-based collaboration features including Reviewer roles and review workflows that gate deployment on approval. Project-level configuration determines who can edit, who can review, and who can deploy. This enforces the peer-review process via the tool rather than relying on team discipline.

- **Option b) — Suboptimal but viable.** Git integration with branch protection works as defense-in-depth but requires extra setup and doesn't tie directly to Web Modeler's deployment workflow.

- **Option c) — Incorrect.** Web Modeler does have review/approval features.

- **Option d) — Incorrect.** Optimize is analytics, not deployment governance.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Web Modeler Reviewer role + Restricted deployment е canonical enforcement.
- **b) 6/10** — works as defense-in-depth но extra setup и не tied to Modeler.
- **c) 2/10** — невярно — review features existing.
- **d) 1/10** — Optimize е analytics, not governance.

**Correct Answer:** Use Web Modeler's Reviewer role combined with Restricted deployment.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Enforced peer review of BPMN" → разпознаваш che се иска **Modeler-side review workflow**.

**Въпросът → Solution Framing.** "Enforced by Web Modeler" — изключва external solutions (Git, Optimize).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Web Modeler има role-based collaboration, знаеш che Reviewer role + Restricted deployment е canonical, знаеш че Git integration е orthogonal mechanism. Това е знание за Web Modeler governance features.

---

## Question 52: Managing the Development Process (Weighting: 15%)

**Scenario:** A team uses Camunda 8 SaaS for development. They have three environments (dev cluster, staging cluster, production cluster) and want **client credentials scoped per environment** — the dev token cannot access staging or production, etc.

**Which Camunda 8 SaaS configuration enforces this isolation?**

- **a)** Create **separate Clients in Camunda Console** for each environment (dev-client, staging-client, prod-client). Each Client is scoped to a specific cluster — its credentials authenticate only against that cluster's APIs. Documentation: [Manage API clients](https://docs.camunda.io/docs/components/console/manage-clusters/manage-api-clients/)

- **b)** Use one Client and configure environment-specific scopes via OAuth2 scope parameter. Documentation: [Console](https://docs.camunda.io/docs/components/console/)

- **c)** Per-environment isolation isn't supported in SaaS; use Self-Managed for stronger isolation. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

- **d)** Configure IAM policies in Console restricting the same Client to specific cluster IDs at runtime. Documentation: [Console](https://docs.camunda.io/docs/components/console/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 SaaS Clients are **scoped per cluster** by design. Creating one Client per environment (dev/staging/prod) gives clean isolation — each Client's credentials authenticate only against its target cluster's OAuth2 token endpoint and gRPC/REST APIs. Credential leakage in dev doesn't compromise production.

- **Option b) — Incorrect.** SaaS Clients are cluster-scoped at the Client level, not via OAuth2 scopes.

- **Option c) — Incorrect.** SaaS does support per-environment isolation through per-cluster Clients.

- **Option d) — Incorrect.** SaaS doesn't have IAM policies as described.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Per-cluster Clients е canonical SaaS isolation.
- **b) 3/10** — OAuth scopes не е the isolation mechanism в SaaS.
- **c) 2/10** — невярно — isolation supported.
- **d) 2/10** — invented IAM model.

**Correct Answer:** Create separate Clients in Camunda Console for each environment.

**Official Documentation Link:** https://docs.camunda.io/docs/components/console/manage-clusters/manage-api-clients/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Per-environment client credential isolation" → разпознаваш che се иска **cluster-scoped Clients pattern**.

**Въпросът → Solution Framing.** "Camunda 8 SaaS configuration" — изпитва се SaaS Client model.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che SaaS Clients са cluster-scoped, знаеш че credential per-Client е the isolation unit, знаеш че OAuth scopes са fine-grained permission within a Client (different layer). Това е знание за SaaS Client architecture.

---

## Question 53: Managing the Development Process (Weighting: 15%)

**Scenario:** A production cluster has 50,000 in-flight process instances. The team needs to find all instances of process definition `OrderProcess` that are currently waiting at a specific Service Task `"validate-payment"` AND have variable `priorityCustomer = true`. They will manually intervene on those (modify variables, retry).

**Which Operate query mechanism is best for this targeted search?**

- **a)** Use **Operate's instance search filters**: select process definition, filter by activity (waiting at "validate-payment"), filter by variable (priorityCustomer = true). Operate's UI builds this query. For programmatic access, the Orchestration Cluster API REST endpoint accepts the same filters. Documentation: [Operate navigation](https://docs.camunda.io/docs/components/operate/userguide/basic-operate-navigation/)

- **b)** Query Zeebe's broker directly via gRPC `ListProcessInstances` API. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

- **c)** Export all 50K instances to CSV via Operate and filter in Excel. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Use Optimize API which has SQL-like query capability. Documentation: [Optimize](https://docs.camunda.io/docs/components/optimize/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate is purpose-built for operational instance queries with filters on process definition, current activity, variables, and instance state. The UI provides interactive filters; the equivalent REST query is available via Orchestration Cluster API for programmatic access. This combination handles 50K-scale queries efficiently.

- **Option b) — Incorrect.** Zeebe gRPC doesn't have a rich `ListProcessInstances` query API with variable filters; that's Operate's domain.

- **Option c) — Incorrect.** Exporting and filtering offline defeats the purpose of an operational dashboard.

- **Option d) — Suboptimal.** Optimize is analytics, not operational — slower, eventually-consistent data, not real-time runtime state.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Operate filters + Orchestration Cluster API е canonical for targeted operational queries.
- **b) 2/10** — gRPC не e query-rich; не за this use case.
- **c) 2/10** — defeats operational purpose.
- **d) 3/10** — analytics layer, not operational.

**Correct Answer:** Use Operate's instance search filters.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/basic-operate-navigation/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Targeted query + 50K instances + multiple filter criteria" → разпознаваш che се иска **operational query layer**.

**Въпросът → Solution Framing.** "Query mechanism for targeted search" — изпитва се knowledge of Operate vs other APIs.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Operate е runtime operational layer, знаеш che Optimize е analytics (different consistency), знаеш че Zeebe gRPC е command-oriented (not query-rich), знаеш че CSV-and-filter е anti-pattern. Това е знание за Camunda API positioning.

---

## Question 54: Managing the Development Process (Weighting: 15%)

**Scenario:** A team identifies that one running process instance has a bug — it's stuck at a Service Task that's calling a deprecated endpoint, and the team has fixed the worker but the in-flight job is in retry-loop hitting the old endpoint. The team wants to **cancel just that specific Service Task** (let the rest of the flow continue) and **manually advance** the token to the next activity.

**Which Operate feature handles this?**

- **a)** **Process Instance Modification** — Operate's feature for runtime in-place intervention. Operator selects the instance, cancels the specific flow node, optionally moves token to a different node, updates variables. The rest of the flow continues. Documentation: [Process Instance Modification](https://docs.camunda.io/docs/components/operate/userguide/process-instance-modification/)

- **b)** Cancel the entire instance and re-start; downstream logic preserves state. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/operate-introduction/)

- **c)** Wait for retries to exhaust; then resolve the incident. Documentation: [Resolve incidents](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **d)** Modify the BPMN model to remove the buggy task and re-deploy; in-flight instances pick up the new version. Documentation: [Process versioning](https://docs.camunda.io/docs/components/concepts/process-instances/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Process Instance Modification** is exactly the feature for targeted runtime intervention on a single instance. The operator can cancel a specific flow node (skip the buggy Service Task), move the token to a different node (next activity), and update variables — all without affecting other instances or canceling the entire flow.

- **Option b) — Incorrect.** Cancel + restart loses state, contradicts the "let the rest of the flow continue" requirement.

- **Option c) — Suboptimal.** Waiting for retries then resolving works, but doesn't bypass the buggy task — it just keeps retrying. Modification skips the problematic task.

- **Option d) — Incorrect.** In-flight instances don't auto-pick-up new versions (need explicit migration).

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Process Instance Modification е purpose-built for this.
- **b) 1/10** — destructive.
- **c) 4/10** — works for some cases but doesn't bypass the buggy task.
- **d) 1/10** — невярна — no auto-migration.

**Correct Answer:** Process Instance Modification.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-modification/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Stuck instance + want to skip and continue + preserve other state" → разпознаваш che се иска **targeted in-place runtime intervention**.

**Въпросът → Solution Framing.** "Operate feature handles" — конкретно сочи Operate-specific feature.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Modification supports cancel-and-skip + variable updates + token moves, знаеш che cancel+restart loses state, знаеш че version migration ≠ skip-buggy-task, знаеш che incident resolution не bypass-ва задачата. Това е знание за Operate's runtime intervention features.

---

## Question 55: Managing the Development Process (Weighting: 15%)

**Scenario:** A production process instance has an Incident on a Service Task because the worker called a downstream API that returned 401 Unauthorized. The team fixed the worker (auth issue) and now wants to **retry** the failed Service Task — but they also need to **set a variable** `apiRetryAttempt = 2` to signal to the worker that this is a retry (for downstream telemetry).

**What is the correct workflow in Operate?**

- **a)** Select the incident in Operate, **update the variable** in the variables panel, then click **Retry** on the incident. Operate updates the variable, resets job retries, and re-activates the job. Documentation: [Resolve incidents](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **b)** Cancel the instance, modify the BPMN to set the variable as a default, redeploy, and start a new instance. Documentation: [Process versioning](https://docs.camunda.io/docs/components/concepts/process-instances/)

- **c)** Manually edit the database to update the variable; then call Zeebe API to retry. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

- **d)** Wait for Zeebe to retry automatically; the variable will be updated by the worker on retry. Documentation: [Job workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's incident resolution workflow supports combining variable updates with retry — both done from the incident's UI panel. The operator sets the variable, then clicks Retry, and Operate sends both changes atomically.

- **Option b) — Incorrect.** Cancel + redeploy destroys state and is heavy.

- **Option c) — Incorrect.** Direct DB editing is dangerous and unsupported.

- **Option d) — Incorrect.** Once retries are exhausted (incident created), automatic retry doesn't happen until reset.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Update variable + Retry в Operate е canonical workflow.
- **b) 1/10** — destructive.
- **c) 1/10** — dangerous direct DB.
- **d) 2/10** — невярна — incidents don't auto-retry.

**Correct Answer:** Select the incident in Operate, update the variable in the variables panel, then click Retry.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Incident + variable update + retry" → разпознаваш che се иска **combined update + retry workflow**.

**Въпросът → Solution Framing.** "Correct workflow in Operate" — изпитва се integrated incident resolution.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Operate combines variable updates + retry actions, знаеш che incidents са terminal until manually resolved, знаеш че direct DB е forbidden. Това е знание за Operate's incident workflow.

---

## Question 56: Managing the Development Process (Weighting: 15%)

**Scenario:** A team wants to validate that a complex BPMN process correctly handles its DMN decisions. They want to **step through the process flow** interactively, providing values for the DMN inputs at each Business Rule Task, and observe the DMN's output before continuing. The process has 10+ Business Rule Tasks across various branches.

**Which Camunda 8 feature supports this interactive validation?**

- **a)** **Camunda Play** — Web Modeler's interactive playground that runs the process step-by-step in a sandbox. For Business Rule Tasks, the user provides input values and Play shows the actual DMN evaluation result (which rule fired, outputs). Documentation: [Camunda Play](https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/play-your-process/)

- **b)** Deploy to a dedicated test cluster and inspect via Operate. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/operate-introduction/)

- **c)** Use Camunda's process testing framework with stubbed DMN responses. Documentation: [Testing](https://docs.camunda.io/docs/components/best-practices/development/testing-process-definitions/)

- **d)** Manually trigger each Business Rule Task in isolation via Web Modeler's DMN editor. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda Play is **interactive process exploration** — runs the BPMN in a sandbox, supports providing inputs at each step including DMN inputs at Business Rule Tasks, and shows actual DMN evaluation results. For exploring how DMN decisions affect process flow, this is the canonical tool.

- **Option b) — Working but heavier.** Test cluster deployment works but lacks the interactive step-through.

- **Option c) — Suboptimal.** Process testing framework with stubbed responses is for automated tests, not exploratory validation.

- **Option d) — Incorrect.** DMN editor tests DMN in isolation, not within the BPMN flow.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Camunda Play е purpose-built for interactive validation.
- **b) 5/10** — works but lacks interactivity.
- **c) 5/10** — for automated tests, not exploration.
- **d) 4/10** — DMN-only, not BPMN flow.

**Correct Answer:** Camunda Play — Web Modeler's interactive playground.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/play-your-process/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Step-through + DMN inputs + observe outputs" → разпознаваш че се иска **interactive exploration**.

**Въпросът → Solution Framing.** "Interactive validation" — изпитва se Modeler tooling knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda Play е interactive sandbox в Web Modeler, знаеш che testing framework е automated CI tests (different use case), знаеш че DMN editor е isolated DMN-only testing. Това е знание за Modeler interactive tools.

---

## Question 57: Managing the Development Process (Weighting: 15%)

**Scenario:** A team deploys process v3.0. After deployment, in-flight v2.0 instances continue at v2.0 as expected. The team wants to **migrate** the 200 in-flight instances of v2.0 to v3.0 so they pick up new logic going forward. The v3.0 model has the same flow structure but renames some element IDs (e.g., `task_validate_v2` → `task_validate_v3`).

**Which Operate feature handles this migration with renamed elements?**

- **a)** **Process Instance Migration** with a **migration plan** that maps element IDs from v2.0 to v3.0 (`task_validate_v2 → task_validate_v3`, etc.). Operate applies the plan to selected instances, repositioning tokens to mapped elements. Documentation: [Process Instance Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **b)** Process Instance Modification — manually move each token in each instance. Documentation: [Modification](https://docs.camunda.io/docs/components/operate/userguide/process-instance-modification/)

- **c)** Cancel v2.0 instances and re-start at v3.0. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/operate-introduction/)

- **d)** Element ID changes break migration; the team must keep the same element IDs across versions. Documentation: [Process versioning](https://docs.camunda.io/docs/components/concepts/process-instances/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Process Instance Migration's **migration plan** explicitly handles element-ID changes. The plan maps source element ID → target element ID. Operate applies the plan to a batch of instances at once, repositioning each token to the mapped target element. This is purpose-built for the renamed-elements migration case.

- **Option b) — Suboptimal.** Modification is per-instance — 200 instances would require 200 manual operations.

- **Option c) — Incorrect.** Destroys state.

- **Option d) — Incorrect.** Migration plan handles renames; no constraint on keeping same IDs.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Migration plan handles renames + batch operation.
- **b) 3/10** — manual per-instance, не batch.
- **c) 1/10** — destructive.
- **d) 2/10** — невярно — migration plan handles renames.

**Correct Answer:** Process Instance Migration with a migration plan that maps element IDs from v2.0 to v3.0.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "200 v2.0 instances + v3.0 deployed + renamed elements + migrate" → разпознаваш che се иска **batch migration with element mapping**.

**Въпросът → Solution Framing.** "Operate feature handles + renamed elements" — изпитва се Migration feature knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Migration plan е element-id-mapping mechanism, знаеш че Modification е per-instance (not batch), знаеш che cancel+restart destroys state, знаеш че migration не изисква same element IDs. Това е знание за Migration capability.

---

## Question 58: Managing the Development Process (Weighting: 15%)

**Scenario:** An audit team needs to verify, for a sample of 50 completed process instances, **which decisions fired and with which inputs/outputs**. The DMN evaluations happened weeks ago. The team wants a single query that returns per-instance: list of decision instances, their inputs, outputs, and which rules matched.

**Which Camunda 8 view supports this audit query?**

- **a)** **Operate's Decision Instance view** retains evaluation history (subject to data retention policy). For each completed process instance, drill into the Business Rule Tasks to see the linked Decision Instances with full evaluation details (inputs, outputs, matched rules). Documentation: [Operate navigation](https://docs.camunda.io/docs/components/operate/userguide/basic-operate-navigation/)

- **b)** Camunda Optimize's audit logs include all DMN evaluations. Documentation: [Optimize](https://docs.camunda.io/docs/components/optimize/)

- **c)** Camunda doesn't store DMN evaluation history beyond the instance's lifecycle; cold data is purged. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Query Zeebe's append-only log directly. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's Decision Instance view is the canonical audit trail for DMN evaluations. Each evaluation produces a Decision Instance record with inputs, outputs, matched rules — linked to the parent process instance. Data retention depends on cluster configuration (default is reasonable for audit windows) but evaluations are preserved beyond the parent instance's completion.

- **Option b) — Incorrect.** Optimize stores aggregated metrics, not detailed audit logs of individual DMN evaluations.

- **Option c) — Partially correct caveat.** Retention IS configurable, but the default supports audit-window queries. Not "purged immediately".

- **Option d) — Incorrect.** Direct Zeebe log query isn't supported for application use.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Operate Decision Instance view + drill-down е audit canonical.
- **b) 3/10** — Optimize е aggregates, не detailed audit.
- **c) 3/10** — overstated retention concern.
- **d) 1/10** — direct Zeebe log query не e supported.

**Correct Answer:** Operate's Decision Instance view retains evaluation history.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/basic-operate-navigation/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Audit DMN evaluations weeks later" → разпознаваш che се иска **historical audit query**.

**Въпросът → Solution Framing.** "Camunda 8 view supports audit" — изпитва се Operate's audit feature.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate retains Decision Instance history (subject to retention), знаеш che Optimize aggregates differently, знаеш че direct log access isn't supported. Това е знание за Camunda data retention.

---

## Question 59: Managing the Development Process (Weighting: 15%)

**Scenario:** A team wants to ensure that **every deployment to production** is preceded by a successful run of integration tests on staging. They're setting up a CI/CD pipeline using GitHub Actions that should: (1) build the BPMN/DMN artifacts, (2) deploy to staging, (3) run an integration test suite, (4) on success, deploy to production.

**Which Camunda 8 mechanism is most appropriate for automated programmatic deployment in CI/CD?**

- **a)** Use the **Zeebe Java/TypeScript client's `deployResource` command** with cluster-specific credentials. Each pipeline step authenticates to the target cluster (staging or prod) and deploys the BPMN/DMN files. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

- **b)** Use the **Web Modeler API** to push files into a Modeler project and trigger deployment from there. Documentation: [Web Modeler API](https://docs.camunda.io/docs/apis-tools/web-modeler-api/overview/)

- **c)** Both Zeebe `deployResource` and Web Modeler API are valid; choice depends on whether you want Modeler audit/sharing layer in the pipeline (yes → Web Modeler API; no → Zeebe direct). Documentation: [Zeebe + Web Modeler](https://docs.camunda.io/docs/apis-tools/)

- **d)** Camunda CLI tool deployed inside CI/CD runners. Documentation: [Camunda CLI](https://docs.camunda.io/docs/)

**🔍 Explanations & Correct Answer**

- **Option c) — Correct.** Both options work; the choice depends on whether you want the Modeler's project/audit layer involved. **Zeebe `deployResource`** is direct and minimal — fits when the BPMN is treated as code-in-Git only. **Web Modeler API** routes deployment through the Modeler project (file sync + trigger deployment), which keeps Modeler's view of "what's deployed where" accurate. Many teams prefer Web Modeler API for visibility; some prefer Zeebe direct for simplicity.

- **Option a) — Partially correct.** Working answer, but ignores the alternative.

- **Option b) — Partially correct.** Working answer, but ignores the alternative.

- **Option d) — Incorrect.** No standalone Camunda CLI tool of that scope; deployment is via SDK/API.

**Per-option scoring (1–10):**
- **a) 7/10** — works but не reflects full picture.
- **b) 7/10** — works but не reflects full picture.
- **c) 10/10** — верен. Both options valid; choice по контекст.
- **d) 2/10** — invented CLI.

**Correct Answer:** Both Zeebe `deployResource` and Web Modeler API are valid; choice depends on whether you want Modeler audit/sharing layer in the pipeline.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "CI/CD + automated deployment" → разпознаваш che се иска **programmatic deployment options**.

**Въпросът → Solution Framing.** "Most appropriate" + multiple options — изпитва се knowledge на trade-offs.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe deployResource е direct broker deployment, знаеш che Web Modeler API maintains Modeler project state, знаеш che двете are valid с different trade-offs. Това е знание за deployment architecture options.

---



# Section 8 — Setting up a Development Environment (Question 60)

> Weight 1% • Topics: Camunda 8 Run / Docker Compose for local dev.

---

## Question 60: Setting up a Development Environment (Weighting: 1%)

**Scenario:** A team is setting up local Camunda 8 development environments for 5 developers. Each developer needs an isolated environment to test changes before pushing to the shared staging cluster. The team has Docker installed and uses Camunda 8 Run for its simplicity. By default, Camunda 8 Run binds Zeebe gRPC on port 26500, Operate on 8081, Tasklist on 8082, and the bundled web server on 8080. Developer #2 reports a port conflict — they already use 8080 for another local app.

**How should Developer #2 reconfigure Camunda 8 Run to use a different port?**

- **a)** Set the relevant environment variable (e.g., `SERVER_PORT=8090`) before launching Camunda 8 Run. Camunda 8 Run reads environment variables to override default port bindings; the binary picks up the new port without code changes. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **b)** Camunda 8 Run has hardcoded ports; the developer must use Docker Compose for port flexibility. Documentation: [Docker Compose](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/docker-compose/)

- **c)** Modify the Camunda 8 Run JAR's bundled `application.properties`. Requires JAR repackaging. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **d)** Camunda 8 Run only supports default ports; the developer should free up port 8080 from the other app. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Run is configured via standard Spring Boot conventions, including environment variable overrides (e.g., `SERVER_PORT`). The launching shell sets the env var; Camunda 8 Run reads it at startup and binds to the new port. No JAR modification needed. Per-developer port assignment via environment variable is the canonical pattern for shared-host multi-developer setups.

- **Option b) — Incorrect.** Camunda 8 Run does support port customisation; Docker Compose is an alternative, not a requirement.

- **Option c) — Incorrect.** Modifying the JAR is unnecessary; env vars handle this.

- **Option d) — Incorrect.** Camunda 8 Run does support custom ports.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Spring Boot env var override е canonical.
- **b) 3/10** — невярно — port customisation supported.
- **c) 2/10** — JAR modification unnecessary.
- **d) 2/10** — невярно — port customisation supported.

**Correct Answer:** Set the relevant environment variable (e.g., `SERVER_PORT=8090`) before launching Camunda 8 Run.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Port conflict + Camunda 8 Run + need custom port" → разпознаваш che се иска **configuration via env var**.

**Въпросът → Solution Framing.** "Reconfigure Camunda 8 Run" — изпитва се knowledge на C8 Run configurability.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 8 Run uses Spring Boot conventions (env vars override defaults), знаеш че env vars е the lightweight customisation path, знаеш che JAR modification не e needed. Това е знание за developer-quickstart customisation.

---

# Exam Completion Summary (Set 2)

## Quick reference

| Section | Topic | Weight | Questions | Cumulative |
|---|---|---:|:-:|---:|
| 1 | Modeling | 15% | Q1-Q9 | 9 |
| 2 | Configuring Processes | 22% | Q10-Q22 | 22 |
| 3 | Decisions & Business Rules (DMN) | 11% | Q23-Q29 | 29 |
| 4 | Configuring Forms | 5% | Q30-Q32 | 32 |
| 5 | Configuring Connectors | 6% | Q33-Q36 | 36 |
| 6 | Developing Extensions & Integrations | 25% | Q37-Q50 | 50 |
| 7 | Managing the Development Process | 15% | Q51-Q59 | 59 |
| 8 | Setting up a Development Environment | 1% | Q60 | **60** |

**Passing score:** ≥ 39/60 (65%).

## What's different from Set 1

Set 2 uses **completely fresh scenarios**: hospital surgical workflow (instead of travel booking), online auction bidding (instead of insurance claim photos), manufacturing alarms (instead of support tickets), telecom credit check (instead of fintech KYC), pharmacy regulator throttling (instead of payment processor), hospital + insurance agency (instead of logistics), bank wire cancellation (instead of e-commerce order), Operate-API scope-mismatch traps, OAuth2 token-lifecycle traps, partition-skew under-utilization, business-day FEEL arithmetic, regex email validation, `put all()` context merge, group-by-sum FEEL, deduplication keys for webhooks, SOAP integration via custom Connectors, CI/CD deployment trade-offs, port conflicts in Camunda 8 Run — all topics same as Set 1 distribution but contextualised differently.

## Common Camunda 7 reflex traps to avoid

- `Job Executor` (Camunda 7) vs Zeebe broker
- Relational DB savepoints (Camunda 7) vs Zeebe append-only log
- Embedded scripting languages: JavaScript / Groovy / Nashorn (Camunda 7) — Camunda 8 uses FEEL only
- `camunda:` namespace properties (Camunda 7) vs `zeebe:` namespace properties (Camunda 8)
- JUEL `${...}` expressions (Camunda 7) vs FEEL `=...` expressions (Camunda 8)
- Auto-migration on deploy (Camunda 7 conventions) vs Camunda 8 explicit migration

## Common "wrong axis" traps (v2.0 distractor philosophy)

| Trap | Right axis | Wrong axis |
|---|---|---|
| Pharmacy rate limit | Sequential MI | Retries tuning |
| Activation under-utilization | Horizontal scaling | pollInterval / maxJobsActive tuning |
| OAuth2 401 after 6 months | Token refresh implementation | Re-register Client |
| Webhook duplicates | Deduplication key in Connector | Correlation key auto-dedup |
| Saga rollback orchestration | Compensation Subprocess | Error Boundary + Exclusive Gateway |
| Cross-pool communication | Message Flow (BPMN spec) | Sequence Flow / Parallel Gateway |
| Conditional fan-out + join | Inclusive Gateway | Parallel Gateway |
| Webhook silent loss | Correlation key FEEL expression | Rate limit / TTL tuning |
| DMN agreement enforcement | ANY hit policy | UNIQUE / PRIORITY |
| Group-by-sum aggregation | COLLECT-SUM aggregator | PRIORITY / FIRST |

## Three-Skills Decomposition reminder

Every question tests THREE distinct skills:

1. **Diagnostic Comprehension** — read scenario, extract technical pattern
2. **Solution Framing** — interpret what kind of solution the question wants ("durable", "purpose-built", "most likely")
3. **Mechanism Knowledge + Trade-off Reasoning** — know how Camunda features actually behave

Practical experience hardens all three simultaneously — pure docs-reading hardens only the third.

---

**End of mock exam Set 2 — full 60 questions.**

**File location:** `C:\Users\ivayl\camunda-cert-prep\_full_exam_simulation\full_exam_60q_v2_set02.md`

**Generated:** May 2026 | **Spec version:** v2.0 | **Blueprint base:** v8.8.0 (Camunda 8.8.0, released October 2025)
