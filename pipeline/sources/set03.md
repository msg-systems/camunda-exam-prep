# Camunda 8 C8-CP-DV — Full Mock Exam Set 3 (60 Questions, v2.0)

> **Версия:** v2.0 Set 3 (May 2026) | **Базиран на:** Exam Blueprint v8.8.0
>
> **Companion of:** `full_exam_60q_v2.md` (Set 1) and `full_exam_60q_v2_set02.md` (Set 2). Fresh scenarios, same Blueprint distribution and same v2.0 anatomy.
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

**Scenario:** A regional money-transfer service runs **cross-border remittances** in Camunda 8 SaaS. Each transfer involves three sequential steps that each modify external state: charge the sender's account, perform FX currency conversion via a third-party FX desk, and credit the recipient's bank account through the recipient-country's payment rail. Each step has its own irreversible side effect — money debited from sender, FX position taken at a rate, settlement leg with the recipient's bank.

The compliance team's requirement is strict: if any step in the sequence fails — for example, recipient's bank rejects the deposit because of a sanctions hit — the transfer must be **completely unwound**, in reverse order, with proper audit. The currently-deployed model uses a regular Subprocess with an Error Boundary Event that routes to three "Reverse X" Service Tasks; last quarter a sanctions-hit on the deposit step triggered the reversal path, but the "Reverse FX" task failed (the FX desk was temporarily unreachable), and "Reverse Sender Charge" ran anyway — leaving the sender refunded but the FX position still open with the third party, producing a reconciliation gap visible only in the next-day audit.

The compliance team wants **reverse-order rollback with per-step audit and per-step retry**, all engine-managed.

**Which BPMN pattern matches this requirement?**

- **a)** Place the three transfer Service Tasks inside a **Transaction Subprocess**, attach a **Compensation Boundary Event** with a dedicated **Compensation Handler** Service Task to each, and throw a **Compensation End Event** in the error path. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **b)** Wrap the steps in a regular subprocess and use an **Inclusive Gateway** to route to "Reverse" branches based on a `failedStep` variable indicating which step to undo. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **c)** Replace the Service Tasks with **Send Tasks** publishing to a "reversal" topic; let downstream Receive Tasks correlate cancellations. Documentation: [Send/Receive Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/tasks/)

- **d)** Use a **Parallel Multi-Instance Subprocess** over the three steps with an `inputCollection` of step names; each iteration handles both the forward and reverse logic via an Exclusive Gateway. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Transaction Subprocess + Compensation Boundary + Compensation Handler is BPMN's standard Saga pattern. Each successful step **registers its compensation handler** with the engine. When the Compensation End Event fires (in the error path), Zeebe walks **only the registered handlers in reverse completion order** — steps that never completed don't register, so they're not undone; steps that did complete are reversed LIFO. Each handler is a tracked activity in Operate (per-step audit) with its own incident on failure (per-step retry). All three requirements satisfied natively by BPMN compensation semantics.

- **Option b) — Incorrect.** Inclusive Gateway evaluates synchronous conditions, not events; using it to drive reverse steps requires manually maintaining the `failedStep` variable, which is fragile. Plus order isn't engine-managed — you encode reverse order manually in flow geometry.

- **Option c) — Incorrect.** Send/Receive correlation is async messaging — **wrong axis** for transactional rollback. Adds latency, breaks audit clarity ("message correlated" ≠ "step compensated"), and depends on a separate correlation infrastructure.

- **Option d) — Incorrect.** Parallel Multi-Instance executes the same activity over a collection — wrong abstraction for three heterogeneous steps with different inputs, outputs, and reverse procedures. MI also doesn't give reverse-order semantics; you'd encode order manually.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Transaction + Compensation е BPMN-канонът; LIFO + per-handler retry + audit идват автоматично.
- **b) 4/10** — Inclusive Gateway работи но е fragile manual encoding на reverse logic.
- **c) 3/10** — Send/Receive е async messaging на **wrong axis** — не transactional rollback.
- **d) 2/10** — Multi-Instance е similar parallel work, не heterogeneous rollback.

**Correct Answer:** Place the three transfer Service Tasks inside a Transaction Subprocess, attach a Compensation Boundary Event with a dedicated Compensation Handler Service Task to each, and throw a Compensation End Event in the error path.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Three irreversible side effects + sanctions rejection + reverse with audit + retry per step" → разпознаваш problem-а като **transactional Saga rollback**, не error handling, не concurrency. Триото "ред + retry + audit" сочи към BPMN Compensation.

**Въпросът → Solution Framing.** "Engine-managed reverse-order rollback with per-step audit + per-step retry" — трите изисквания едновременно. Само Compensation отговаря и на трите. Distractor решения покриват едно или две, не и трите.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Compensation Boundary регистрира handler при successful completion, знаеш че Compensation End инициира LIFO walk на registered handlers, знаеш че Inclusive Gateway не event-handles, знаеш че Send/Receive е async messaging, знаеш че MI е similar parallel work. Това е разбиране за Compensation lifecycle в Zeebe.

---

## Question 2: Modeling (Weighting: 15%)

**Scenario:** An HR recruitment platform processes job-applicant responses to interview offers in Camunda 8. After an offer is sent, the process waits for **the first of three events**: (1) candidate accepts via a "accepted" message, (2) candidate declines via a "declined" message, (3) **72-hour timer** expires with no response. The chosen path leads to different downstream flows. Whichever fires first must **cancel the other two waits** — the recruitment ops team has been seeing stale timer subscriptions firing reminders to candidates who already accepted days ago.

**Which BPMN construct correctly models "first of three events wins, cancel the rest"?**

- **a)** An **Event-Based Gateway** with three catching events attached: two Message Catch Events ("accepted", "declined") and one Timer Catch Event (72h). The first event to fire claims the token; the engine automatically unsubscribes from the other two. Documentation: [Event-Based Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/)

- **b)** A regular Receive Task for "accepted" with two Interrupting Boundary Events attached (Message for "declined", Timer for 72h). Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** An Inclusive Gateway with three conditional flows checking `=accepted`, `=declined`, `=expired` variables. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **d)** A Parallel Gateway with three parallel branches joined by a Terminate End Event in each. Documentation: [Terminate End Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Event-Based Gateway is BPMN's construct for "race between N events with automatic cancellation of the losers". The token arrives at the gateway; the engine subscribes to all attached catching events simultaneously; the first to fire claims the token and **the engine automatically unsubscribes** from the remaining events — no stale subscriptions, no leaked timers, no orphaned tokens. Three-way race (two messages + one timer) is exactly its design point.

- **Option b) — Partially viable but inferior.** Boundary Events on a Receive Task work for a "primary wait + interrupts" asymmetric pattern. Three-way symmetric race fits Event-Based Gateway better; using Boundary Events models "accepted" as the primary outcome and "declined"/"timeout" as exceptions, which is semantically wrong (decline is a normal outcome).

- **Option c) — Incorrect.** Inclusive Gateway evaluates synchronous conditions on variables — it doesn't wait for events. Wrong construct for an event race.

- **Option d) — Incorrect.** Parallel Gateway opens all three branches simultaneously with no cancellation — exactly the broken design described in the scenario. Terminate End kills the whole instance, too heavy.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Event-Based Gateway е BPMN-стандартът за "first of N, cancel the rest".
- **b) 6/10** — работи механично за asymmetric pattern; semantically wrong за three-way symmetric race.
- **c) 2/10** — Inclusive evaluates conditions, не events.
- **d) 1/10** — Parallel + Terminate = оригиналния bug.

**Correct Answer:** An Event-Based Gateway with three catching events attached.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Wait for first of three + cancel the rest + stale timers firing late" → разпознаваш race-between-events + auto-cancellation requirement. Stale-timer-firing-late е classic Parallel-Gateway-без-cancellation pattern.

**Въпросът → Solution Framing.** "First-fires-and-rest-cancelled" + "three-way" — изключва asymmetric solutions (Boundary, option b) и synchronous Inclusive.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Event-Based Gateway прави subscribe-to-all-then-unsubscribe-on-first-fire, знаеш че Boundary Events работят за asymmetric "primary + interrupts", знаеш че Inclusive evaluates synchronous conditions, знаеш че Parallel + Terminate е the broken pattern. Това е разбиране за event subscription lifecycle.

---

## Question 3: Modeling (Weighting: 15%)

**Scenario:** A high-end restaurant manages table reservations through Camunda 8. When a reservation is created, a User Task "Confirm Reservation" is assigned to the guest (via Tasklist link). The hospitality manager wants two reminders attached to this task: at **24 hours** before the reservation, send a **friendly reminder** (notification only — guest's task continues); at **2 hours** before, if still unconfirmed, **cancel the reservation** automatically and free the table.

Previous attempts used two Interrupting Boundary Events — the first one fired at 24 hours and cancelled the User Task immediately, preventing the guest from confirming. Restaurant got complaints from confused guests whose task disappeared when they finally got around to confirming.

**Which Boundary Event configuration models this two-stage flow correctly?**

- **a)** Attach **one Non-interrupting Timer Boundary Event at 24h-before** (notify guest, task continues to be claimable) and **one Interrupting Timer Boundary Event at 2h-before** (cancel task, free the table). Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **b)** Two Interrupting Timer Boundary Events — the first one's outgoing flow re-instantiates the User Task with a new 22-hour window. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** Two Non-interrupting Timer Boundary Events — both send notifications and a downstream Exclusive Gateway chooses the cancellation handler based on a `phase` variable. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **d)** Place the User Task inside an Event Subprocess with two Timer Start Events. Documentation: [Event Subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Non-interrupting at 24h-before spawns a new token following its outgoing flow (the reminder path) while leaving the User Task **alive and claimable** — the guest can still confirm at any point. Interrupting at 2h-before **cancels the task** and the token follows the boundary's outgoing flow (cancellation + free-table path). Two different timers, two different semantics — canonical "soft reminder then hard timeout" pattern.

- **Option b) — Incorrect.** Cancelling at 24h-before and re-instantiating loses the guest's task link and bookmark — confusing UX. Plus it's complexity without benefit.

- **Option c) — Incorrect.** Two Non-interrupting boundaries means at 2h-before the task **continues** when the hospitality manager wanted it cancelled. Both fire reminders but the task is never terminated.

- **Option d) — Incorrect.** Event Subprocess fires when an enclosing scope matches the trigger, not when a specific User Task triggers an event. Wrong scope.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Mixed Non-interrupting + Interrupting е canonical "soft reminder + hard timeout" pattern.
- **b) 3/10** — re-instantiation губи task identity; original bug.
- **c) 4/10** — нарушава cancellation requirement.
- **d) 2/10** — Event Subprocess е scope-level, не activity-level.

**Correct Answer:** Attach one Non-interrupting Timer Boundary Event at 24h-before and one Interrupting Timer Boundary Event at 2h-before.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Friendly reminder without cancel + cancel-and-free" → разпознаваш две различни behaviour-а на същата активност при два различни лимита (dual-deadline mixed-semantics).

**Въпросът → Solution Framing.** "Notify without cancel" и "cancel" сигнализират за Non-interrupting + Interrupting respectively.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Non-interrupting Boundary **spawn-ва нов token** оставяйки activity-то жива, знаеш че Interrupting Boundary **отнема token-а** и затваря scope, знаеш che multiple boundaries могат да се закачат на same activity (всеки independent), знаеш че Event Subprocess е scope-level не activity-level. Това е знание за token lifecycle.

---

## Question 4: Modeling (Weighting: 15%)

**Scenario:** A university admissions office runs three distinct admissions processes — undergraduate, postgraduate, and doctoral — each modelled as a separate BPMN process in Camunda 8 Self-Managed. **All three include an identical 5-step transcript-verification sub-flow**: fetch transcript from source institution, validate seals/signatures, check grading scale, verify completion dates, archive verified copy. Currently each admissions process has an inline copy of this 5-step block. Last quarter, when the registrar adopted a new transcript-validation standard, the team updated UG and PG but missed the PhD process — producing inconsistent verifications between programs.

The admissions IT lead wants to **extract transcript verification into a single deployable artifact** so future changes touch one place. In-flight admissions that have already passed verification should continue with their original version; new admissions pick up the latest.

**Which BPMN construct fits this cross-process reuse with version isolation?**

- **a)** Deploy transcript verification as a standalone BPMN process and invoke it from each admissions process via a **Call Activity** referencing the verification process by `processId`. Documentation: [Call Activities](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **b)** Convert the verification block into an **Embedded Subprocess** in each admissions process and apply an **Element Template** to all three subprocess copies for shared configuration. Documentation: [Element Templates](https://docs.camunda.io/docs/components/concepts/element-templates/)

- **c)** Implement verification as a **Custom Connector** with the Connector SDK; a single Service Task in each admissions process calls it. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **d)** Model verification as a **Parallel Multi-Instance Subprocess** with iterations representing the 5 steps. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Call Activity is the BPMN standard for cross-process reuse with version isolation. The Call Activity references the verification process by `processId`; each invocation starts a separate process instance with its own version reference. In-flight admissions hold a version reference to whatever was latest when they started; new admissions pick up the current latest verification version. Variables are mapped via Call Activity input/output mappings.

- **Option b) — Incorrect.** Element Templates standardise **configuration of a single element** (URL, headers, etc.), not multi-step process logic. Three embedded subprocesses with identical templates still mean three copies of the 5-step flow — changes still go to three places.

- **Option c) — Incorrect.** Custom Connector is for single-call external integrations, **not multi-step internal orchestration with per-step audit trail in Operate**. Wrapping 5 internal steps inside a Connector hides them from BPMN.

- **Option d) — Incorrect.** Multi-Instance is for repeating the **same activity** N times. The 5 verification steps are heterogeneous activities, not iterations of one operation.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Call Activity е BPMN-канонът за model reuse + version isolation.
- **b) 3/10** — Element Templates са single-element config, не multi-step flow.
- **c) 4/10** — Custom Connector е **wrong axis** — external integration, не internal orchestration.
- **d) 2/10** — Multi-Instance е same activity repeated.

**Correct Answer:** Deploy transcript verification as a standalone BPMN process and invoke it from each admissions process via a Call Activity.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Same 5 steps in 3 processes + single deployable artifact + version isolation" → разпознаваш cross-process model reuse pattern.

**Въпросът → Solution Framing.** "Reusable + version isolation" определят deployable-model-level reuse, не configuration sharing, не single-call abstraction.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Call Activity създава separate process instance със собствен version reference, знаеш че Embedded Subprocess живее inline в parent (не cross-process reuse), знаеш че Element Templates са design-time configuration tooling, знаеш че Custom Connector hides multi-step audit, знаеш че Multi-Instance е similar parallel work. Това е разбиране за scope hierarchy + deployment lifecycle.

---

## Question 5: Modeling (Weighting: 15%)

**Scenario:** A smart-energy utility ingests **meter readings** every 15 minutes from 500 meters per neighbourhood. The Camunda 8 process triggers a "process-readings" workflow that uses a **Parallel Multi-Instance Subprocess** to fan out to all 500 meters and call the meter-management API to fetch and validate each reading. The meter-management API has a strict rate limit of **2 requests per second per client** — exceeding it returns HTTP 429 and persistent violators get temporarily suspended. Currently the worker fires all 500 multi-instance jobs concurrently, immediately tripping the rate limit; cascading 429 retries push neighbourhood batch processing from seconds into hours.

The utility ops team wants to **preserve the Multi-Instance abstraction** (one iteration per meter is natural) but pace API calls to fit the 2 req/sec limit.

**Which Multi-Instance configuration solves this?**

- **a)** Change the marker from **Parallel** to **Sequential** Multi-Instance. Each meter is processed one at a time; the natural pace stays at or under 2 req/sec when each call takes ≥500 ms. Documentation: [Sequential Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Keep Parallel Multi-Instance and configure `zeebe:taskDefinition retries=20` so 429-failed jobs are retried until they succeed. Documentation: [Job retries](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Keep Parallel Multi-Instance and add a Timer Catch Event inside each iteration with 500ms delay before the API call. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Replace the Multi-Instance with a single Service Task that batches all 500 meters into one bulk API call. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Sequential Multi-Instance processes iteration N+1 only after iteration N completes. With ~500 ms typical API latency per meter call, this produces a sustained request rate at or below 2 req/sec — under the API's threshold by construction. No 429s, no retry storms, predictable throughput. Trade-off is total batch latency (500 ms × 500 = 4 minutes) but that IS the rate-limit-imposed throughput ceiling.

- **Option b) — Incorrect.** `retries` controls failed-job re-activation count, not dispatch rate. With Parallel MI, all 500 jobs fire concurrently; if the API returns 429, they all retry concurrently and re-trip the rate limit. Classic wrong-axis pattern.

- **Option c) — Incorrect.** Parallel MI fires all iterations concurrently; if each iteration has an internal 500ms timer, all 500 timers tick down concurrently and all 500 API calls fire after the same 500ms wait. No effective throttle.

- **Option d) — Incorrect.** The API is described as per-meter at 2 req/sec, not bulk-accepting. Inventing a bulk endpoint that doesn't exist is non-implementable. Also collapses per-meter audit in Operate to a single row.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Sequential MI дава вграден backpressure съответстващ на rate limit.
- **b) 3/10** — retries solve transient failures, not concurrency. Wrong axis.
- **c) 2/10** — concurrent timers tick simultaneously, не serialise.
- **d) 1/10** — измисля несъществуващ bulk endpoint.

**Correct Answer:** Change the marker from Parallel to Sequential Multi-Instance.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "2 req/sec rate limit + Parallel MI firing 500 concurrent + 429 storms" → разпознаваш че проблемът е concurrency control, не error handling.

**Въпросът → Solution Framing.** "Pace API calls" — търси се конфигурация която променя темпото на dispatch, не error-path. Изключва retries (option b) и in-iteration timers (option c — не serialise-ват).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Parallel MI fires all instances simultaneously, знаеш че Sequential MI chains iteration N+1 после N, знаеш че `retries` контролира recovery not dispatch, знаеш che concurrent timer-внутри-MI не serialise-ва. Това е разбиране за MI execution semantics + concurrent timer behaviour.

---

*(Section 1 Modeling — 5 of 9 questions complete.)*

<!-- END OF BATCH 1 — file will be appended -->


## Question 6: Modeling (Weighting: 15%)

**Scenario:** A municipal government processes **construction permit applications** with three independent parties: the **applicant** (citizen submitting), the **planning office** (reviewing zoning), and a **certified inspector** (validating engineering plans). All three are independent organisations with separate process engines. The BPMN model has three Pools: "Applicant", "Planning Office", "Certified Inspector". When the applicant submits, the planning office reviews; then the planning office sends to the certified inspector; once inspected, results return to planning office. The developer initially drew Sequence Flows between Pools and the BPMN validator rejected the model with "Sequence Flow cannot cross Pool boundary".

**What is the correct BPMN construct for communication between Pools?**

- **a)** Replace cross-pool Sequence Flows with **Message Flows**. Each cross-pool handover uses a Send Task or Message Throw Event on the sender side and a Receive Task or Message Catch Event on the receiver side. Zeebe correlates via a `correlationKey` expression. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **b)** Add Parallel Gateways at each cross-pool point with Sequence Flow branches into the other Pool. Documentation: [Parallel Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **c)** Merge the three Pools into one Pool with three Lanes. Documentation: [Pools & Lanes](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** Use Signal Events to broadcast between Pools. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Sequence Flow is intra-pool only in BPMN 2.0; **Message Flow is the cross-pool construct** representing async message passing between separate organisations/engines. Each handover (applicant→planning, planning→inspector, inspector→planning) uses Send/Throw on the sender and Receive/Catch on the receiver, correlated via a key like `=permit_id`.

- **Option b) — Incorrect.** Parallel Gateway forks within a single process; cross-pool Sequence Flow from the gateway is the same BPMN violation.

- **Option c) — Incorrect.** Lanes are visual subdivisions within one Pool representing roles in **one** organisation — not for three independent organisations.

- **Option d) — Incorrect.** Signal Events broadcast to all listening processes globally; not for point-to-point handover between specific counterparties.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Message Flow е BPMN-стандартът за cross-pool communication.
- **b) 1/10** — Parallel Gateway forks intra-pool.
- **c) 3/10** — Lanes са visual в same pool.
- **d) 4/10** — Signal е real BPMN feature на **wrong axis** — broadcast, не point-to-point.

**Correct Answer:** Replace cross-pool Sequence Flows with Message Flows.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/message-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Three Pools + cross-pool Sequence Flow + validator rejection" → разпознаваш BPMN 2.0 spec violation (Sequence Flow is intra-pool only).

**Въпросът → Solution Framing.** "Communication between Pools" — изключва same-pool workarounds.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Sequence Flow е intra-pool only, знаеш че Message Flow е async between engines, знаеш че Signal е global broadcast (different semantics), знаеш че Lanes са visual subdivisions. Това е знание за BPMN 2.0 spec.

---

## Question 7: Modeling (Weighting: 15%)

**Scenario:** A team migrating a Camunda 7 process to Camunda 8 encounters a Gateway condition that worked in 7 but breaks in 8. The Camunda 7 model has an Exclusive Gateway with sequence-flow conditions written in JUEL: `${orderAmount > 1000}`. When the BPMN is imported into Camunda 8 Web Modeler and deployed, the gateway always routes to the default flow regardless of the `orderAmount` variable value.

**Why does the JUEL condition not work, and what is the correct Camunda 8 syntax?**

- **a)** Camunda 8 uses **FEEL** as its expression language; JUEL `${...}` syntax is silently ignored by Zeebe. The correct syntax is `=orderAmount > 1000` (FEEL with `=` prefix). Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

- **b)** JUEL is supported in Camunda 8 via a compatibility shim; the issue is variable scoping. Documentation: [Zeebe](https://docs.camunda.io/docs/components/zeebe/)

- **c)** Both JUEL and FEEL work; the issue is the operator `>` should be `gt` in FEEL. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Camunda 8 doesn't evaluate sequence flow conditions; route via Service Task setting a flow variable. Documentation: [Gateways](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 7 uses **JUEL** (`${expression}`) for expressions; Camunda 8 uses **FEEL** (`=expression`). Zeebe evaluates only FEEL — JUEL syntax is unrecognised, the expression evaluates to null or default behaviour (routes through default flow), depending on context. Migration must rewrite all expressions from JUEL to FEEL: `${orderAmount > 1000}` → `=orderAmount > 1000`.

- **Option b) — Incorrect.** No JUEL compatibility in Camunda 8.

- **Option c) — Incorrect.** FEEL uses standard mathematical operators including `>`. There's no `gt` keyword.

- **Option d) — Incorrect.** Camunda 8 evaluates sequence-flow conditions; FEEL is the language.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. JUEL→FEEL migration is canonical C7→C8 trap.
- **b) 2/10** — no JUEL shim in C8.
- **c) 1/10** — invented `gt` keyword.
- **d) 1/10** — невярно — conditions ARE evaluated.

**Correct Answer:** Camunda 8 uses FEEL as its expression language; JUEL `${...}` syntax is silently ignored by Zeebe. The correct syntax is `=orderAmount > 1000`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "JUEL expression silently fails + always default flow" → разпознаваш che проблемът е **expression-language mismatch C7 vs C8**.

**Въпросът → Solution Framing.** "Correct C8 syntax" — изпитва се JUEL→FEEL migration knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че C7 = JUEL, C8 = FEEL, знаеш че FEEL prefix е `=`, знаеш че Zeebe silently ignores unknown expression syntax, знаеш че FEEL operators include standard `>`. Това е знание за C7→C8 migration.

---

## Question 8: Modeling (Weighting: 15%)

**Scenario:** A marketing platform sends customer engagement campaigns through multiple channels — email, SMS, push notification. Each customer can have preferences enabling **one or more channels**. The campaign process needs to fan out to **only the enabled channels** for each customer (some get all three, some get just email, some get email + SMS). After all dispatched channels complete, the campaign moves to "Track Delivery" once and only once.

The current model uses an Inclusive Gateway with three conditional flows (`=preferences.email`, `=preferences.sms`, `=preferences.push`), three Service Tasks (one per channel), and an Exclusive Gateway downstream. Customers with multiple enabled channels trigger "Track Delivery" multiple times — duplicate tracking entries appear.

**Which BPMN join construct is correct for "wait for only the activated parallel paths to complete"?**

- **a)** Replace the downstream Exclusive Gateway with an **Inclusive Gateway**. The joining Inclusive Gateway waits specifically for the activated paths to complete (tracked by Zeebe based on upstream activation). Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **b)** Replace the downstream Exclusive Gateway with a **Parallel Gateway**. Documentation: [Parallel Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **c)** Convert the three Service Tasks into a **Multi-Instance Subprocess**. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Add a Service Task downstream that polls Operate API for parallel-task completion. Documentation: [Operate API](https://docs.camunda.io/docs/apis-tools/operate-api/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Inclusive Gateway is BPMN's conditional fork-join: at fan-out, evaluates conditions and activates only matching paths; at join, waits specifically for **the paths that were activated upstream**, not all paths defined. Zeebe tracks path activation state. Matches the "wait for only activated parallel paths" requirement precisely.

- **Option b) — Incorrect.** Parallel Gateway always expects ALL incoming flows; would block waiting for paths that were never activated.

- **Option c) — Incorrect.** Multi-Instance is for **same activity** repeated; three heterogeneous channel-specific Service Tasks don't fit MI.

- **Option d) — Incorrect.** Operate API is eventually consistent and not for runtime control flow.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Inclusive Gateway join изчаква само активираните branches.
- **b) 4/10** — Parallel waits for all defined; ще се блокира.
- **c) 3/10** — Multi-Instance е same activity, не heterogeneous.
- **d) 2/10** — Operate API е query layer, не runtime control.

**Correct Answer:** Replace the downstream Exclusive Gateway with an Inclusive Gateway.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Conditional parallel paths + Track Delivery runs multiple times" → разпознаваш че проблемът е conditional fork-join synchronisation. Exclusive Gateway лет-ва всеки token през веднага → duplicate downstream.

**Въпросът → Solution Framing.** "Wait for only activated parallel paths" — изключва Parallel (waits for all) и Exclusive (first-wins).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Inclusive Gateway fork-ва conditionally и join-ва conditionally, знаеш che Parallel е unconditional fork-and-join, знаеш че Exclusive е first-wins, знаеш че Multi-Instance е repetition. Това е разбиране за BPMN gateway семантика.

---

## Question 9: Modeling (Weighting: 15%)

**Scenario:** A SaaS company's subscription lifecycle process must allow the customer to **upgrade their plan at any point** during the subscription term (annual billing cycle). The upgrade message `planUpgraded` arrives asynchronously, correlated by `subscription_id`. Upgrade must work regardless of which stage the subscription is at (initial provisioning, active, mid-billing, renewal pending). Each subscription can be upgraded **at most once per term** (multiple upgrade requests in the same term should be idempotent — only the first one applies).

The main flow (provisioning → active → billing → renewal pending) should stay clean and not be cluttered with upgrade handling on every step.

**Which BPMN construct models this asynchronous interrupt cleanly?**

- **a)** Wrap the main flow in a Subprocess and add an **Event Subprocess** with an **Interrupting Message Start Event** correlated on `subscription_id`. The Event Subprocess interrupts the parent scope on message arrival. Documentation: [Event Subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

- **b)** Attach Non-interrupting Message Boundary Events to every Service Task in the main flow. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** Place a Message Catch Event at the start of the process. Documentation: [Message Catch Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **d)** Use an Event-Based Gateway at every transition between main-flow steps. Documentation: [Event-Based Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Event Subprocess with **Interrupting Message Start Event** is BPMN's canonical pattern for asynchronous "interrupt at any point in a scope". The Event Subprocess lives **inside** the wrapping subprocess. When `planUpgraded` arrives, Zeebe cancels whatever is active in main flow (interrupting), and the Event Subprocess's outgoing flow takes over. Single-fire semantics are default — once consumed, the message subscription closes (multiple subsequent upgrade requests for the same subscription_id in the same term don't re-trigger). Clean main flow, scope-level interrupt.

- **Option b) — Incorrect.** Non-interrupting Boundary spawns **a new parallel token** when message arrives — main flow continues + upgrade handler runs concurrently. Upgrading a subscription while it's simultaneously being billed is the failure mode the scenario forbids.

- **Option c) — Incorrect.** Message Catch at process start blocks process start until upgrade arrives — backwards semantics.

- **Option d) — Incorrect.** Event-Based Gateway at every transition clutters the main flow; also it's a point-in-time choice, not continuous "any-point" interrupt.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Event Subprocess + Interrupting Message Start е канонът за async interrupt at any point.
- **b) 3/10** — Non-interrupting spawns parallel token; upgrade + billing concurrent.
- **c) 2/10** — Message Catch в началото блокира start.
- **d) 3/10** — Event-Based Gateway е point-in-time choice + clutter.

**Correct Answer:** Wrap the main flow in a Subprocess and add an Event Subprocess with an Interrupting Message Start Event correlated on `subscription_id`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Upgrade at any point + interrupt active step + idempotent per term" → разпознаваш scope-level async interrupt (не per-task error handling). Triото "any-point + interrupt + single-fire" сочи към Event Subprocess.

**Въпросът → Solution Framing.** "Stay clean + not cluttered" — изключва boundary-на-всеки-task. "Interrupt at any point" — изключва Non-interrupting.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Event Subprocess живее inside a scope и стартира при trigger, знаеш че Interrupting variant terminate-ва parent scope, знаеш че Non-interrupting spawn-ва паралелен token, знаеш че Message Catch е blocking wait state. Това е разбиране за scope hierarchy + interrupt semantics.

---

# Section 2 — Configuring Processes (Questions 10-22)

> Weight 22% • Topics: Task configuration for Zeebe execution, gateway/event Zeebe semantics, subprocess + call activity configuration, multi-instance, Document Handling, IDP, Element Templates, AI ad-hoc subprocess / AI agent connector.

---

## Question 10: Configuring Processes (Weighting: 22%)

**Scenario:** A health-services agency configures a User Task "Review Patient Intake" assigned to a nurse. The agency's SLA requires the task to be claimed within 2 hours; otherwise it should be flagged for management attention. The team configures the User Task with a **due date** property: `=now() + duration("PT2H")`. After deployment, the team observes the task appears in Tasklist correctly but **doesn't visually indicate "overdue"** when the 2-hour mark passes — the Tasklist view shows tasks the same way regardless of due date.

**What is the correct understanding of due dates on User Tasks?**

- **a)** **Due date is metadata** stored on the task — Tasklist UI displays it (e.g., shows "Due in 1 hour" or "Overdue by 30 min") and can sort/filter by due date. Zeebe does NOT automatically take action on due-date expiry; for automated action (notification, escalation), attach a **Timer Boundary Event** to the User Task. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** Due date automatically cancels the User Task after expiry and routes to a default error path. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** Due date triggers a Zeebe incident at expiry, requiring manual resolution. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Due date is a deprecated property; use only Timer Boundary Events. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Due date on a User Task is **metadata** — Tasklist UI uses it for display ("Due in N hours", "Overdue by M") and sorting/filtering, but Zeebe does not act on expiry automatically. For automated escalation when 2 hours pass, attach a **Timer Boundary Event** to the User Task (interrupting or non-interrupting depending on whether you want to cancel the task or just notify). The team's assumption that due date triggers escalation is incorrect; due date is informational.

- **Option b) — Incorrect.** Due date doesn't auto-cancel.

- **Option c) — Incorrect.** Due date doesn't create incidents.

- **Option d) — Incorrect.** Due date is not deprecated; it complements Timer Boundary Events.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Due date е metadata; automated action requires Timer Boundary.
- **b) 2/10** — невярно — no auto-cancel.
- **c) 1/10** — невярно — no incident.
- **d) 2/10** — невярно — not deprecated.

**Correct Answer:** Due date is metadata stored on the task. Zeebe does NOT automatically take action on expiry; for automated action, attach a Timer Boundary Event.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Due date set + no visual overdue + no automated action" → разпознаваш че due date е metadata-only, не runtime trigger.

**Въпросът → Solution Framing.** "Correct understanding" — изпитва се what-due-date-actually-does.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че due date е task metadata за Tasklist UI display + sorting, знаеш че automated escalation requires Timer Boundary Event, знаеш че Zeebe не auto-act-ва на due-date expiry. Това е знание за User Task feature semantics.

---

## Question 11: Configuring Processes (Weighting: 22%)

**Scenario:** A logistics company's BPMN process has a Service Task that calls a partner API. The partner requires a specific HTTP header `X-Partner-Account-ID` with a fixed value for the company. The team uses a generic Java Job Worker that already handles authentication; they want to pass the account ID **per Service Task** (different processes might use different partner accounts) without modifying the worker code.

**Which BPMN configuration mechanism passes a per-task static value to the worker?**

- **a)** Configure the Service Task with **Task Headers** — key/value pairs in the BPMN XML that are visible to the worker via `job.getCustomHeaders()` (Java) or equivalent in other SDKs. The worker reads `X-Partner-Account-ID` from headers per job. Documentation: [Task Headers](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **b)** Set a process variable `partnerAccountId` upstream and read it from the worker via `job.getVariables()`. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Hardcode the value in the worker code and select different workers per partner account. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Use Service Task input mapping with a constant FEEL value. Documentation: [Input mappings](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Task Headers** is exactly the mechanism for passing per-task **static configuration** to the worker without polluting process variables. Define key/value pairs in BPMN (`X-Partner-Account-ID = "ACCT-001"`); the worker receives them via `job.getCustomHeaders()`. Different Service Tasks in different processes can carry different header values without code changes — design-time configuration.

- **Option b) — Suboptimal.** Process variables are for **runtime data flow**, not static configuration. Setting a variable upstream pollutes process state with a constant; Task Headers is cleaner.

- **Option c) — Incorrect.** Hardcoding in worker requires separate worker deployments per account — anti-pattern.

- **Option d) — Working but heavier.** Input mapping with a constant works but is unusual usage; Task Headers is the canonical mechanism for static per-task config.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Task Headers е canonical for per-task static configuration.
- **b) 5/10** — variables работят но pollute state with constants.
- **c) 1/10** — anti-pattern.
- **d) 4/10** — works but unusual usage of input mapping.

**Correct Answer:** Configure the Service Task with Task Headers — key/value pairs visible to the worker via `job.getCustomHeaders()`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Per-task static value + no worker code changes" → разпознаваш che се иска **design-time per-task config**.

**Въпросът → Solution Framing.** "Per-task static value to worker" — изпитва се knowledge на Task Headers feature.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Task Headers са key/value pairs in BPMN visible to worker, знаеш che variables са за runtime data (different layer), знаеш che worker hardcoding е anti-pattern, знаеш che input mapping е runtime variable transform. Това е знание за BPMN task configuration mechanisms.

---

## Question 12: Configuring Processes (Weighting: 22%)

**Scenario:** An order process has a Message Catch Event waiting for a `shipment_status_update` from a third-party logistics partner. The partner sends updates correlated by `tracking_number`. However, the **same `tracking_number`** can carry multiple updates over time (pickup, in-transit, out-for-delivery, delivered) — the process should advance only on the **specific update type** matching its current expectation (e.g., waiting for "delivered").

The team configures `correlationKey: =tracking_number`. All updates with the same tracking number arrive at the catch event regardless of update type, advancing the process too early.

**Which Camunda 8 mechanism handles this "filter by update type" scenario?**

- **a)** Configure the correlation key to include both fields: `correlationKey: =tracking_number + "-" + expected_update_type` on the catch event, and have the partner publish with the same composite key. Documentation: [Message correlation](https://docs.camunda.io/docs/components/concepts/messages/)

- **b)** Configure the Message Catch Event with a **message name** specific to update type (e.g., `shipment_delivered` instead of `shipment_status_update`) and have the partner publish with the matching name. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **c)** Camunda automatically filters messages by content; the team must verify the correlation key matches. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **d)** Use Event Subprocess that catches all updates and routes via Exclusive Gateway. Documentation: [Event Subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

**🔍 Explanations & Correct Answer**

- **Option b) — Correct.** Messages in Zeebe are matched on **both name and correlation key**. Using a generic message name (`shipment_status_update`) for different events is bad design — splitting into specific names (`shipment_picked_up`, `shipment_in_transit`, `shipment_delivered`) lets the catch event subscribe specifically to the type it needs. The correlation key (`=tracking_number`) still scopes to the right process instance.

- **Option a) — Working but more complex.** Composite correlation key works but requires the partner to publish with the composite — coordination overhead. Message name is the cleaner abstraction.

- **Option c) — Incorrect.** Camunda doesn't filter messages by arbitrary content — match is on name + correlation key.

- **Option d) — Suboptimal.** Event Subprocess + downstream routing works but is heavier than message-name specificity.

**Per-option scoring (1–10):**
- **a) 6/10** — works but coordination overhead.
- **b) 10/10** — верен. Message name specificity е canonical for type-distinguished events.
- **c) 2/10** — невярно — content filtering not automatic.
- **d) 5/10** — works but heavier than name-based filter.

**Correct Answer:** Configure the Message Catch Event with a message name specific to update type.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/messages/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Same correlation key + different update types + premature advance" → разпознаваш che проблемът е **insufficient message-name specificity**.

**Въпросът → Solution Framing.** "Filter by update type" — изпитва се knowledge на message matching (name + key).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe matches messages on **name AND correlation key**, знаеш че name specificity е cleaner than composite key encoding, знаеш че Camunda не filter-ва by arbitrary content, знаеш че Event Subprocess routing е heavier alternative. Това е знание за message subscription matching.

---

## Question 13: Configuring Processes (Weighting: 22%)

**Scenario:** A periodic data-cleanup process must run **5 times** in a year — quarterly plus one ad-hoc end-of-year cleanup. The Timer Cycle Start Event should fire 5 times then stop. The team writes `cycle: R5/PT90D` expecting "repeat 5 times, every 90 days".

**Which timer expression is correct for a bounded repetition?**

- **a)** `cycle: R5/P3M` — repeat 5 times, every 3 months (calendar-aware). After the 5th fire, the timer stops. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** `cycle: R5/PT90D` — repeat 5 times, every 90-day duration (fixed). Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** `cycle: R/P3M with limit 5` — explicit limit clause. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** `cycle: 5 × P3M` — multiplication syntax. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** ISO 8601 cycle notation: `R{N}/{duration}` where N is the repetition count. `R5/P3M` repeats 5 times, every 3 months (period notation — calendar-aware for months). After 5 firings, the timer is exhausted and the event no longer fires.

- **Option b) — Partially correct but uses wrong notation.** `PT90D` is invalid ISO 8601 — `T` prefix is for time-of-day components (PT15M = 15 minutes, PT2H = 2 hours), not days. `P90D` is correct for "90 days". Also calendar months ≠ 90 days exactly — using duration-based PT/P syntax drifts from calendar quarters.

- **Option c) — Incorrect.** "with limit" is not ISO 8601 syntax.

- **Option d) — Incorrect.** Multiplication syntax doesn't exist.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `R5/P3M` е ISO 8601 каноничен bounded cycle с calendar months.
- **b) 5/10** — wrong notation (`PT90D` invalid) + drifts from calendar quarters.
- **c) 1/10** — invented syntax.
- **d) 1/10** — invented syntax.

**Correct Answer:** `cycle: R5/P3M` — repeat 5 times, every 3 months.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "5 times per year + quarterly" → разпознаваш че се иска bounded cycle with calendar quarter, не fixed-day duration.

**Въпросът → Solution Framing.** "Bounded repetition" — изпитва се ISO 8601 syntax knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че `R{N}/...` е bounded repetition (без N = unbounded), знаеш че `P3M` е "3 months" calendar-aware, знаеш че `PT90D` е invalid (T prefix несъвместим с D), знаеш че "with limit" / multiplication са invented syntax. Това е знание за ISO 8601 в Zeebe.

---

## Question 14: Configuring Processes (Weighting: 22%)

**Scenario:** A team writes a Business Rule Task that calls DMN `priceCheck`. The team forgets to configure a `resultVariable` on the Business Rule Task. At runtime, the DMN evaluates successfully, but **the result is not visible anywhere downstream** — subsequent tasks expecting the price tier see no variable.

**What happens to the DMN result when `resultVariable` is not configured?**

- **a)** The DMN result is **discarded** — no process variable is created. Subsequent tasks see no variable. Configure `resultVariable` to capture the output. Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **b)** Zeebe stores the result under a default name like `dmnResult` or `decisionOutput`. Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **c)** The task throws an incident "missing resultVariable". Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **d)** The result is auto-flattened into individual variables matching the DMN output column names. Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Without `resultVariable` configured, the DMN result has no name to be stored under — Zeebe simply discards it after evaluation. The team must configure `resultVariable: priceTier` (or another descriptive name) for the result to be persisted as a process variable accessible downstream.

- **Option b) — Incorrect.** No default variable name; the result is discarded.

- **Option c) — Incorrect.** No automatic incident; the missing configuration is silent.

- **Option d) — Incorrect.** No auto-flattening; the result is discarded entirely.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. No resultVariable = result discarded silently.
- **b) 2/10** — невярно — no default name.
- **c) 2/10** — невярно — no incident.
- **d) 2/10** — невярно — no auto-flattening.

**Correct Answer:** The DMN result is discarded — no process variable is created.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Missing resultVariable + result not visible" → разпознаваш che missing config means silent discard.

**Въпросът → Solution Framing.** "What happens when resultVariable not configured" — изпитва се behaviour knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че resultVariable е the persistence binding, знаеш че without binding = discarded, знаеш че Zeebe doesn't invent default names или auto-flatten silently. Това е знание за Business Rule Task configuration requirements.

---



## Question 15: Configuring Processes (Weighting: 22%)

**Scenario:** A national payroll processor runs **monthly batch payroll** for 50,000 employees per company-batch through a Parallel Multi-Instance Subprocess. Each iteration computes one employee's net pay (calls tax service, deducts contributions, computes net). The business wants to capture **per-employee net pay totals** in an aggregated output collection so the parent process can produce a summary report (total payroll, total tax, etc.) without making 50,000 separate database lookups after MI completes.

**Which Multi-Instance configuration captures per-iteration outputs into an aggregated collection?**

- **a)** Configure `outputCollection = netPayResults` on the Multi-Instance marker, plus configure `outputElement = {employee_id: employee.id, net_pay: computed_net}` (FEEL expression). Each iteration appends its output to the collection; after MI completes, parent sees `netPayResults` as a list of all per-iteration outputs. Documentation: [Multi-instance output](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Output collection is automatic — Zeebe collects every variable created in each iteration into a unified collection named `mi_outputs`. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Use a downstream Script Task with FEEL that scans all instances via Operate API and aggregates. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Place a Service Task inside each MI iteration that writes results to an external database; parent reads via separate query. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Multi-Instance supports `outputCollection` to name a list-shaped accumulator + `outputElement` to specify what each iteration contributes (FEEL expression evaluated in iteration scope). After MI completes, the parent process has access to `netPayResults` as a list of objects — one per iteration. Used together they let the parent compute summary metrics natively in FEEL without external queries.

- **Option b) — Incorrect.** No automatic `mi_outputs` collection; the developer must configure outputCollection + outputElement explicitly.

- **Option c) — Incorrect.** Operate API is for operational queries, not real-time aggregation in process flow; eventually-consistent and wrong layer.

- **Option d) — Suboptimal.** External database round-trip works but adds infrastructure and latency; outputCollection is built-in.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. outputCollection + outputElement е canonical MI aggregation pattern.
- **b) 2/10** — invented automatic collection.
- **c) 3/10** — wrong layer (Operate API).
- **d) 4/10** — works but external dependency adds complexity.

**Correct Answer:** Configure `outputCollection = netPayResults` plus `outputElement = ...` on the Multi-Instance marker.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Per-iteration outputs aggregated + parent computes summary" → разпознаваш че се иска **MI output collection mechanism**.

**Въпросът → Solution Framing.** "Captures per-iteration outputs into aggregated collection" — изпитва се knowledge на outputCollection feature.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че MI има outputCollection + outputElement configuration, знаеш че Zeebe не auto-aggregate-ва, знаеш че Operate API е query layer not runtime, знаеш че external DB е workaround. Това е знание за MI output semantics.

---

## Question 16: Configuring Processes (Weighting: 22%)

**Scenario:** A team's BPMN process has nested subprocesses: an outer Embedded Subprocess containing an inner Embedded Subprocess. The inner subprocess sets a variable `intermediateResult` via Service Task output mapping. The outer subprocess wants to read `intermediateResult` after the inner subprocess completes. The parent process should NOT see `intermediateResult` — it's an internal computation.

**How does variable scope work in nested Embedded Subprocesses?**

- **a)** Variables created inside the inner Subprocess are scoped to **the inner Subprocess only**. After inner Subprocess ends, those variables are discarded — the outer Subprocess cannot see them unless inner's **output mapping** explicitly promotes them to outer's scope. Documentation: [Variable scopes](https://docs.camunda.io/docs/components/concepts/variables/)

- **b)** Variables auto-promote one scope level up on subprocess completion. Outer can see `intermediateResult` automatically; parent cannot. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Both outer and parent see all variables created at any inner scope; scope is informational only. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Variables are global to the process instance; subprocess scoping is deprecated. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe variable scoping is strict: variables live in the scope they were created in and are discarded when that scope ends. To make a variable available in an enclosing scope, the inner scope's **output mapping** must explicitly promote it (source = `intermediateResult`, target = same or different name). Without explicit promotion, the inner variable is invisible outside. The outer-to-parent boundary works the same way: outer's output mapping must promote anything it wants the parent to see.

- **Option b) — Incorrect.** No auto-promotion; explicit output mapping is required.

- **Option c) — Incorrect.** Scope is enforced — not informational.

- **Option d) — Incorrect.** Variables are not global; subprocess scoping is active.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Strict scope + explicit output mapping promotion.
- **b) 2/10** — невярно — no auto-promotion.
- **c) 1/10** — невярно — scope is enforced.
- **d) 1/10** — невярно — scoping not deprecated.

**Correct Answer:** Variables created inside the inner Subprocess are scoped to the inner Subprocess only. Use inner's output mapping to promote them.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Nested subprocesses + intermediate variable + selective visibility" → разпознаваш че се иска **scope hierarchy explanation**.

**Въпросът → Solution Framing.** "How does variable scope work" — изпитва се mechanism knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe scope е hierarchical, знаеш че variables live в creation scope + discarded at end, знаеш че output mapping е mechanism за explicit promotion, знаеш че няма auto-promotion. Това е знание за Zeebe variable scope model.

---

## Question 17: Configuring Processes (Weighting: 22%)

**Scenario:** A team has built a library of 12 Element Templates for common Service Task patterns (HTTP REST call, Email send, S3 upload, etc.). New developers join the team and the lead wants to **share these templates** across the entire organisation's Web Modeler projects — not just within one project.

**How are Element Templates shared across Web Modeler projects in Camunda 8 SaaS?**

- **a)** Configure Element Templates at the **organisation level** in Web Modeler — they become available to all projects within the organisation. Documentation: [Element Templates](https://docs.camunda.io/docs/components/concepts/element-templates/)

- **b)** Copy the Element Template JSON files into each project individually. Documentation: [Element Templates](https://docs.camunda.io/docs/components/concepts/element-templates/)

- **c)** Element Templates are only available within the single project where they're defined; cross-project sharing requires Custom Connectors. Documentation: [Element Templates](https://docs.camunda.io/docs/components/concepts/element-templates/)

- **d)** Publish Element Templates to a Git repository and configure Web Modeler to pull from it on startup. Documentation: [Element Templates](https://docs.camunda.io/docs/components/concepts/element-templates/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler supports **organisation-level Element Templates** — templates defined at the organisation scope are available to designers in all projects within that organisation. This is the canonical mechanism for shared component libraries. Per-project templates also exist for project-specific patterns.

- **Option b) — Suboptimal.** Manual copying is fragile (must remember to sync when templates update) — defeats the purpose of shared library.

- **Option c) — Incorrect.** Cross-project sharing via org-level scope is supported.

- **Option d) — Incorrect.** No Git-pull mechanism for templates.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Organisation-level templates е canonical sharing mechanism.
- **b) 3/10** — manual copying е maintenance burden.
- **c) 2/10** — невярно — cross-project sharing supported.
- **d) 1/10** — невалиден mechanism.

**Correct Answer:** Configure Element Templates at the organisation level in Web Modeler.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/element-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Share templates across all projects" → разпознаваш che се иска **organisation-scope template sharing**.

**Въпросът → Solution Framing.** "Shared across Web Modeler projects" — изпитва се knowledge на template scoping.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler има org-level + project-level template scope, знаеш че manual copying е maintenance burden, знаеш че няма Git-pull mechanism за templates. Това е знание за Web Modeler template scoping.

---

## Question 18: Configuring Processes (Weighting: 22%)

**Scenario:** A loan-application process uses Document Handling for uploaded passport scans. The team wants documents to be **auto-deleted after 90 days** to comply with data retention policy. The team is wondering whether Document Handling has built-in TTL.

**How does Document Handling lifecycle work?**

- **a)** Document Handling stores documents with configurable **TTL (time-to-live)**; after the TTL expires, the document is automatically removed from storage. TTL can be set per-document at upload time or via a cluster-default policy. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/getting-started/)

- **b)** Documents are stored indefinitely; for retention compliance, implement a separate cleanup job that calls a delete API. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/getting-started/)

- **c)** Document Handling automatically deletes documents 30 days after the process instance completes; hard-coded, not configurable. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/getting-started/)

- **d)** Document Handling doesn't store documents; references point to external storage where TTL is the storage provider's concern. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8.8 Document Handling supports **TTL configuration** for stored documents. Per-document TTL can be set at upload time (e.g., 90 days for passport scans), or a cluster-default policy applies for documents without explicit TTL. After expiry, documents are auto-removed. The team can configure 90 days at upload time to comply with retention policy.

- **Option b) — Incorrect.** TTL is built-in, not requiring custom cleanup.

- **Option c) — Incorrect.** No 30-day hard-coded deletion; TTL is configurable.

- **Option d) — Partially correct mechanically but misses the feature.** Document Handling can use external storage backends, but it provides a unified TTL abstraction over them.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. TTL configuration е built-in Document Handling feature.
- **b) 3/10** — невярно — TTL is built-in.
- **c) 2/10** — invented hard-coded TTL.
- **d) 4/10** — partially correct on external storage but misses feature.

**Correct Answer:** Document Handling stores documents with configurable TTL.

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Auto-delete after 90 days + data retention" → разпознаваш che се иска **TTL configuration на documents**.

**Въпросът → Solution Framing.** "Lifecycle work" — изпитва се Document Handling feature knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Document Handling има TTL configuration, знаеш че няма hard-coded 30-day deletion, знаеш che external storage support-ва TTL through unified abstraction. Това е знание за Document Handling lifecycle features.

---

## Question 19: Configuring Processes (Weighting: 22%)

**Scenario:** An insurance claims process uses IDP to extract claim details from a scanned PDF — claim number, date of incident, claim amount. The IDP Application is configured with these three extraction fields. Once extracted, the BPMN process uses these fields as inputs to a downstream DMN that determines claim category.

**How does the team wire the IDP output to subsequent BPMN steps?**

- **a)** The IDP Service Task's **output is automatically a structured JSON object** with the configured field names. Configure the Business Rule Task's input mapping to extract individual fields (e.g., `claimNumber` ← `=idpResult.claimNumber`) or directly reference `idpResult.fieldname` in downstream FEEL expressions. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **b)** IDP output is written to per-field process variables automatically — no mapping needed. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **c)** IDP output requires a downstream Script Task to parse and unpack into individual variables. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **d)** IDP output stays inside the IDP Application; subsequent BPMN steps query IDP via REST API to get fields. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** IDP Service Task writes its extraction result as a **structured JSON object** to a process variable (configured at IDP Service Task setup, e.g., `idpResult`). Downstream BPMN tasks access individual fields via FEEL path navigation (`idpResult.claimNumber`) or via input mappings on subsequent tasks. This is the canonical Camunda 8 IDP wiring pattern.

- **Option b) — Partially correct (depends on output mapping configuration).** IDP CAN auto-flatten via output mappings if configured, but the default is a structured object. The "no mapping needed" claim is overstated.

- **Option c) — Incorrect.** No Script Task needed; FEEL path navigation handles unpacking.

- **Option d) — Incorrect.** IDP output is part of the process flow, not an external lookup.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. IDP output как structured object + FEEL path navigation.
- **b) 5/10** — overstated; depends on output mapping config.
- **c) 3/10** — invented Script Task requirement.
- **d) 2/10** — invented external lookup.

**Correct Answer:** The IDP Service Task's output is automatically a structured JSON object; reference via FEEL path navigation downstream.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/idp/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "IDP output + use in downstream DMN" → разпознаваш che се иска **IDP→BPMN data flow understanding**.

**Въпросът → Solution Framing.** "Wire IDP output to subsequent steps" — изпитва се integration mechanism knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che IDP output е structured JSON в a variable, знаеш че FEEL path navigation е canonical access pattern, знаеш че auto-flatten възможно но не default. Това е знание за Camunda 8.8 IDP wiring.

---

## Question 20: Configuring Processes (Weighting: 22%)

**Scenario:** A customer-service platform wants to integrate an LLM for ticket triage. Two scenarios:
- **Scenario A:** Categorise the ticket into one of 5 predefined categories (single LLM call, structured response, no follow-up).
- **Scenario B:** Investigate complex tickets where the LLM may need to call search APIs, summarise findings, request human review — multi-step agentic reasoning.

**For each scenario, which Camunda 8.8 pattern fits best?**

- **a)** Scenario A: **AI Agent Connector** (single structured call). Scenario B: **Ad-hoc Subprocess** (dynamic multi-step agentic orchestration). Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/agentic-orchestration-overview/)

- **b)** Both scenarios use AI Agent Connector since it's the LLM-specific feature. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/agentic-orchestration-overview/)

- **c)** Both scenarios use Ad-hoc Subprocess for consistency. Documentation: [Ad-hoc subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/ad-hoc-subprocesses/)

- **d)** Scenario A: regular Service Task. Scenario B: Multi-Instance Subprocess. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The two patterns target different use cases:
  - **AI Agent Connector** = single-element LLM invocation with structured prompt and response. Best for **deterministic, single-shot** LLM calls (categorisation, summarisation, draft generation).
  - **Ad-hoc Subprocess** = container with candidate inner activities; an agent (LLM-driven or rule-driven) dynamically selects which activities to run, in what order, repeatedly. Best for **non-deterministic agentic orchestration**.

- **Option b) — Incorrect.** AI Agent Connector doesn't fit multi-step dynamic agentic reasoning — it's a single call.

- **Option c) — Incorrect.** Ad-hoc Subprocess is overkill for single-shot categorisation; AI Agent Connector is cleaner.

- **Option d) — Incorrect.** Regular Service Task lacks the LLM-specific structuring; Multi-Instance is wrong abstraction for dynamic agentic reasoning.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Right tool for each use case: structured (Connector) vs dynamic (Ad-hoc).
- **b) 4/10** — Connector mismatches Scenario B's dynamic requirement.
- **c) 5/10** — Ad-hoc е overkill за Scenario A.
- **d) 3/10** — generic Service Task misses LLM-specific feature.

**Correct Answer:** Scenario A: AI Agent Connector. Scenario B: Ad-hoc Subprocess.

**Official Documentation Link:** https://docs.camunda.io/docs/components/agentic-orchestration/agentic-orchestration-overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Categorisation vs investigation" → разпознаваш discrete vs agentic patterns.

**Въпросът → Solution Framing.** "For each scenario, which fits best" — изпитва се knowledge differentiation на двата 8.8 patterns.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che AI Agent Connector е single-shot structured invocation, знаеш che Ad-hoc Subprocess е dynamic agentic container, знаеш че Service Task lacks LLM-specific structuring, знаеш че Multi-Instance е repetition pattern. Това е знание за Camunda 8.8 Agentic Orchestration feature differentiation.

---

## Question 21: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task's worker (Java) hits an unexpected runtime exception (NullPointerException). The worker code calls `throwError(jobKey, errorCode: null, errorMessage: "NPE encountered")` — passing `null` for the errorCode because the developer isn't sure what code to use. The Service Task has one Error Boundary Event configured with `errorCode = "PROCESSING_ERROR"`.

**What happens at runtime?**

- **a)** The thrown error has no errorCode, so the boundary event (which expects "PROCESSING_ERROR") does NOT match. The error propagates **upward** — to enclosing subprocesses, eventually to the top level — looking for an error handler. If no handler is found, Zeebe creates an Incident. Documentation: [Error events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **b)** Zeebe treats null errorCode as wildcard — matches any Error Boundary Event. The boundary fires. Documentation: [Error events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** Throwing error with null errorCode produces an Incident immediately, bypassing boundary events. Documentation: [Error events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **d)** Zeebe substitutes a default errorCode ("UNCAUGHT") which matches only Error Boundary Events configured with that exact code. Documentation: [Error events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN error handling propagates **upward through enclosing scopes** until a matching Error Catch (boundary or event subprocess) is found. An error with a specific errorCode matches only events with that exact code; an error with no code matches a "catch-all" Error Catch (one without specified code). If neither matches at any enclosing scope, Zeebe creates an Incident. The team's boundary expecting "PROCESSING_ERROR" doesn't match an empty errorCode, so the error propagates up — and if no enclosing scope has an Error Catch, Incident is created.

- **Option b) — Incorrect.** Null errorCode doesn't wildcard-match.

- **Option c) — Partially correct outcome (eventually Incident if no handler), but the mechanism description is wrong.** Propagation happens first.

- **Option d) — Incorrect.** No default substitution; null stays null.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Error propagation upward + Incident if uncaught.
- **b) 2/10** — невярно — null не е wildcard.
- **c) 4/10** — partially correct outcome but wrong mechanism description.
- **d) 1/10** — invented default substitution.

**Correct Answer:** The thrown error has no errorCode, so the boundary event (which expects "PROCESSING_ERROR") does NOT match. The error propagates upward looking for a handler; eventually creates Incident if none found.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/error-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Throw error with null code + boundary expects specific code" → разпознаваш че се иска **error propagation behaviour**.

**Въпросът → Solution Framing.** "What happens at runtime" — изпитва се error catch matching + propagation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че errorCode matches exact (null не match-ва specific), знаеш che errors propagate upward through scopes, знаеш че Catch без code catches any error (catch-all), знаеш че Incident е fallback when no handler matches. Това е знание за BPMN error propagation semantics.

---

## Question 22: Configuring Processes (Weighting: 22%)

**Scenario:** A travel-booking process has an Embedded Subprocess "Book Flight" that internally throws an **Escalation Event** with code "FLIGHT_PRICE_INCREASED" when the airline's price has changed since quote. The team wants the parent process to **continue normal flow** but also **notify the customer** of the price change via a parallel side-flow.

**Which BPMN construct routes the Escalation to the parent for notification while keeping main flow active?**

- **a)** Attach a **Non-interrupting Escalation Boundary Event** to the Embedded Subprocess in the parent, matching code "FLIGHT_PRICE_INCREASED". When the inner throws, the boundary spawns a new parallel token following its outgoing flow (notify customer); the subprocess continues normally. Documentation: [Escalation Events](https://docs.camunda.io/docs/components/modeler/bpmn/escalation-events/)

- **b)** Attach an **Interrupting Error Boundary Event** instead — Error events are the standard mechanism for inter-scope notification. Documentation: [Error events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** Use a Signal Throw inside the subprocess and Signal Catch in the parent. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

- **d)** Throw the escalation as an Error event with isInterrupting=false. Documentation: [Error events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Escalation Events** are BPMN's mechanism for **non-blocking notifications** between scopes — different from Error events which are interrupting. A Non-interrupting Escalation Boundary Event on the parent matches the inner-thrown escalation and **spawns a parallel token** (notify customer flow) while leaving the inner subprocess running. The main flow continues, the parallel flow handles notification.

- **Option b) — Incorrect.** Interrupting Error Boundary cancels the inner subprocess — wrong, the scenario wants to continue.

- **Option c) — Suboptimal.** Signal events are global broadcasts; Escalation is the typed scope-bubble construct. Wrong abstraction.

- **Option d) — Incorrect.** Error events don't have "non-interrupting" mode in BPMN spec; Escalation is the non-interrupting equivalent.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Non-interrupting Escalation Boundary е BPMN canonical pattern for parallel notification.
- **b) 3/10** — Error Boundary е interrupting (cancels subprocess); wrong dimension.
- **c) 4/10** — Signal е global broadcast; не scope-typed.
- **d) 2/10** — Error events don't have non-interrupting mode.

**Correct Answer:** Attach a Non-interrupting Escalation Boundary Event to the Embedded Subprocess in the parent.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/escalation-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Notify parent + main flow continues + parallel side-flow" → разпознаваш че се иска **non-blocking escalation pattern**.

**Въпросът → Solution Framing.** "Routes Escalation to parent + main flow active" — изключва interrupting options (Error Boundary).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Escalation = non-blocking by default (vs Error = blocking), знаеш che Non-interrupting Boundary spawn-ва parallel token, знаеш che Signal е global broadcast (different scope semantics), знаеш че Error events нямат non-interrupting variant. Това е знание за Escalation vs Error semantics.

---



# Section 3 — Decisions & Business Rules (DMN) (Questions 23-29)

> Weight 11% • Topics: DRDs, Decision Tables, Hit Policies, FEEL in inputs/outputs, Business Rule Task integration.

---

## Question 23: Decisions & Business Rules (Weighting: 11%)

**Scenario:** An e-commerce platform's discount engine uses DMN to determine which discount tier applies. The rules are: (1) loyalty customers get base discount; (2) bulk orders get base discount; (3) seasonal sale adds extra. A customer could match multiple rules. The marketing team's requirement is "if multiple rules match, **the order matters** — earlier rules (by row position) take precedence, and the engine should return only the first match".

**Which Hit Policy fits this "first-match-wins by row order"?**

- **a)** **FIRST** — evaluates rules in row-definition order, returns the first matching rule's output, ignores later matches. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **b)** **UNIQUE** — exactly one rule must match; multiple matches error out. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **c)** **PRIORITY** — multiple matches OK; returns the highest-priority output. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **d)** **ANY** — multiple matches must agree. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **FIRST** is the canonical Hit Policy for "first-match-wins by row order". The engine evaluates rules top-down in row position; the first rule whose conditions match has its output returned, all subsequent matches are ignored. Use when row order encodes priority semantics.

- **Option b) — Incorrect.** UNIQUE forbids multiple matches — different semantics.

- **Option c) — Incorrect.** PRIORITY orders by **declared output priority**, not row position. Different ordering dimension.

- **Option d) — Incorrect.** ANY requires agreement, not first-wins.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FIRST е BPMN-canonical for row-order first-match.
- **b) 2/10** — UNIQUE forbids multi-match.
- **c) 4/10** — PRIORITY е output-priority based, не row.
- **d) 2/10** — ANY enforces agreement.

**Correct Answer:** FIRST.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Order matters + earlier rules take precedence + return first match" → разпознаваш FIRST policy.

**Въпросът → Solution Framing.** "First-match-wins by row order" — изпитва се knowledge на 7 Hit Policies.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FIRST = row order, PRIORITY = output priority order (different axis), UNIQUE forbids multi-match, ANY enforces agreement. Това е знание за Hit Policy semantics.

---

## Question 24: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A retail analytics report queries the highest discount that applied to each order. The DMN `discount-rules` matches multiple rules per order and outputs discount percentages. The team wants the final result to be **the maximum discount across all matching rules** (e.g., if both "loyalty" and "bulk" matched at 10% and 15%, return 15%).

**Which Hit Policy + aggregator returns the MAX of all matching outputs?**

- **a)** **COLLECT** with **MAX** aggregator — evaluates all matches, returns the maximum output value. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **b)** **PRIORITY** — returns highest-priority output. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **c)** **COLLECT** without aggregator + downstream FEEL `max()` in Script Task. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** **OUTPUT ORDER** — returns outputs sorted, take first. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **COLLECT** with **MAX** aggregator is the canonical DMN policy for "max of matching outputs". The DMN engine evaluates all matching rules, computes max of their outputs, returns single scalar. No downstream processing needed.

- **Option b) — Incorrect.** PRIORITY is about output's declared priority, not numerical max value.

- **Option c) — Works but reinvents built-in aggregator.** Adding a Script Task with `max()` works but COLLECT-MAX does it natively.

- **Option d) — Incorrect.** OUTPUT ORDER returns sorted list, not single max.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. COLLECT-MAX е canonical aggregator.
- **b) 3/10** — PRIORITY е output priority, не numeric max.
- **c) 5/10** — works но reinvents built-in.
- **d) 3/10** — sorted list, не single max.

**Correct Answer:** COLLECT with MAX aggregator.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Maximum discount across matches" → разпознаваш che се иска **numerical max aggregation**.

**Въпросът → Solution Framing.** "MAX of matching outputs" — изпитва се COLLECT aggregator knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che COLLECT има 4 aggregators (SUM, MIN, MAX, COUNT), знаеш че PRIORITY е different ordering, знаеш че Script Task workaround reinvents built-in. Това е знание за COLLECT modifiers.

---

## Question 25: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A logistics DMN determines if a package qualifies for "fragile handling". The team writes a Decision Table with two input columns: `weightKg` and `containsGlass` (boolean). The team writes one row: `weightKg = -` (any value) and `containsGlass = true` → output "fragile". For all other cases, the table should return "standard".

**How does the team configure the "default" or "fall-through" case?**

- **a)** Add a catch-all bottom rule with `weightKg = -` (don't-care) and `containsGlass = -` (don't-care) outputting "standard". With FIRST or PRIORITY hit policy, this fires only if no specific rule matched. Documentation: [Decision Table](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** Configure the table's "default output" property to "standard". Documentation: [Decision Table](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** Use an Exclusive Gateway downstream of the Business Rule Task to handle the "no rule matched" case. Documentation: [Gateways](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **d)** DMN automatically returns the output column's default value when no rule matches. Documentation: [Decision Table](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN handles defaults via a **catch-all bottom rule** with all input columns set to `-` (don't-care, matches anything). Combined with FIRST hit policy (or single-matching policy), the catch-all fires only when no preceding rule matched. This is the canonical idiomatic DMN approach for defaults.

- **Option b) — Incorrect.** No "default output" property at table level in standard DMN.

- **Option c) — Suboptimal.** Pushing default handling into BPMN works but defeats the encapsulation that DMN provides.

- **Option d) — Incorrect.** DMN doesn't auto-return defaults — without a matching rule, the result is null (or empty).

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Catch-all rule + don't-care е DMN-canonical default.
- **b) 2/10** — invented property.
- **c) 4/10** — works но pushes logic into BPMN.
- **d) 1/10** — невярно — no auto-default.

**Correct Answer:** Add a catch-all bottom rule with all inputs as don't-care outputting "standard".

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Default for unmatched cases" → разпознаваш че се иска **DMN-native default pattern**.

**Въпросът → Solution Framing.** "Default or fall-through" — изпитва се DMN idiom knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che `-` (dash) е don't-care input, знаеш че catch-all bottom + FIRST е default pattern, знаеш che DMN не auto-return defaults, знаеш че BPMN-side handling е workaround. Това е знание за DMN default patterns.

---

## Question 26: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A complex tax-calculation DRD has 5 decisions: `BaseTax`, `Deductions`, `Credits`, `Adjustments`, `FinalTax`. The first four are independent decisions that each take from the same shared inputs (`income`, `taxYear`, `filingStatus`). They feed into `FinalTax`. The team draws four arrows from the shared input to each of the four decisions and observes that the diagram visually clutters with parallel arrows.

**Which DRD element cleanly represents a shared input referenced by multiple decisions?**

- **a)** A **single Input Data node** (representing the shared inputs) connected to all four decisions with Information Requirement arrows. The Input Data is defined once; the multiple arrows simply show which decisions consume it. Documentation: [DRD](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/)

- **b)** Duplicate the Input Data into four separate nodes (one per decision). Documentation: [DRD](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/)

- **c)** Combine all four decisions into one "supernode" with shared inputs. Documentation: [DRD](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/)

- **d)** Input Data isn't a DRD element; inputs must be passed via Business Rule Task input mappings. Documentation: [DRD](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN's **Input Data** node is the canonical element representing inputs shared across decisions. Define once, connect to all consumers via Information Requirement arrows. The diagram cleanly expresses "these 4 decisions all consume these inputs" with one input node + 4 arrows.

- **Option b) — Incorrect.** Duplicating Input Data clutters the diagram and breaks the "single source of truth" principle.

- **Option c) — Incorrect.** No "supernode" concept in DMN.

- **Option d) — Incorrect.** Input Data IS a DMN element.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Single Input Data + multiple arrows е canonical DRD pattern.
- **b) 3/10** — duplication clutters and breaks single-source.
- **c) 2/10** — invented concept.
- **d) 1/10** — невярно — Input Data IS DMN element.

**Correct Answer:** A single Input Data node connected to all four decisions with Information Requirement arrows.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Shared inputs + multiple decisions + visual clutter" → разпознаваш che се иска **DRD shared-input element**.

**Въпросът → Solution Framing.** "DRD element for shared input" — изпитва се DRD element types knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DRD има Input Data, Decision, Knowledge Source, Business Knowledge Model elements, знаеш che Input Data е shared-input абстракцията, знаеш che duplication clutters diagram. Това е знание за DRD element vocabulary.

---

## Question 27: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A DMN decides loan-rate adjustments based on the applicant's `birthDate`. The team wants to determine if the applicant was born **between 1960-01-01 and 1980-12-31 (inclusive)** for a specific rate offer. The team writes the input cell for the `birthDate` column as a range.

**Which DMN range syntax expresses "between 1960-01-01 and 1980-12-31 inclusive"?**

- **a)** `[date("1960-01-01")..date("1980-12-31")]` — square brackets inclusive on both ends, date() built-in to parse string literals. Documentation: [Decision Table FEEL ranges](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** `>= "1960-01-01" and <= "1980-12-31"` — comparison operators with string dates. Documentation: [FEEL operators](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

- **c)** `between date("1960-01-01") and date("1980-12-31")` — between keyword. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `(date("1960-01-01")..date("1980-12-31"))` — parentheses are inclusive in DMN. Documentation: [DMN ranges](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN/FEEL range syntax `[a..b]` with square brackets is **inclusive on both bounds**. For date ranges, use `date("YYYY-MM-DD")` to convert string literals to date type — comparisons then work on dates. `[date("1960-01-01")..date("1980-12-31")]` matches any date from Jan 1, 1960 through Dec 31, 1980, inclusive.

- **Option b) — Partially correct mechanism but wrong syntax for input cells.** Comparison operators with strings work in standalone FEEL but Decision Table input cells expect abbreviated FEEL forms; comparing strings without `date()` conversion also yields lexicographic comparison, not date comparison.

- **Option c) — Incorrect.** `between` is not standard DMN/FEEL syntax.

- **Option d) — Incorrect.** Parentheses are **exclusive** in DMN range notation, not inclusive.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `[date(a)..date(b)]` е canonical DMN date range.
- **b) 4/10** — works as raw FEEL но не как input cell standard.
- **c) 2/10** — `between` не e DMN syntax.
- **d) 2/10** — parentheses са exclusive не inclusive.

**Correct Answer:** `[date("1960-01-01")..date("1980-12-31")]`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Date range + inclusive both bounds" → разпознаваш che се иска **DMN/FEEL date range syntax**.

**Въпросът → Solution Framing.** "Inclusive on both ends" — изпитва се interval notation specifically.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че `[a..b]` = inclusive, `(a..b)` = exclusive, знаеш че `date("YYYY-MM-DD")` converts string to date type, знаеш че FEEL няма `between` keyword. Това е знание за DMN range syntax + FEEL type conversion.

---

## Question 28: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A DRD has Decision A that takes inputs `customerType` and `region`. Decision B depends on A and additionally takes input `orderAmount`. When invoking the DRD from a Business Rule Task with `decisionId: B`, what inputs must be supplied as process variables?

**Which set of process variables is required?**

- **a)** `customerType`, `region`, `orderAmount` — all leaf-level inputs needed by the entire chain. Zeebe walks the DRD backward from B, identifies upstream A, gathers all leaf inputs (A's: customerType + region; B's additional: orderAmount). Documentation: [DRD](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/)

- **b)** Only `orderAmount` — B's direct inputs; A's outputs are computed automatically without their inputs. Documentation: [DRD](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/)

- **c)** All variables present in the process scope — Zeebe doesn't filter. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** `customerType`, `region`, `orderAmount`, plus A's output variable name pre-populated. Documentation: [DRD](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** When invoking decision B which transitively depends on A, Zeebe traverses the DRD's Information Requirements backward from B to find all leaf-level Input Data. All leaf inputs needed by A AND B must be supplied as process variables. A's output is computed at evaluation time using its inputs — the caller doesn't supply A's outputs.

- **Option b) — Incorrect.** A needs its own inputs (`customerType`, `region`) to compute; can't skip the upstream needs.

- **Option c) — Partially correct mechanism.** Zeebe does see all process variables (scope inheritance), but only the leaf inputs are USED by the DRD. The team should ensure at least the leaf inputs are present; surplus variables are ignored.

- **Option d) — Incorrect.** A's output is computed at evaluation time; doesn't need pre-population.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. All leaf inputs traversed from target backward.
- **b) 3/10** — невярно — A needs its inputs to compute.
- **c) 5/10** — partial — Zeebe sees variables but only leaf inputs are used.
- **d) 2/10** — pre-populating A's output bypasses evaluation.

**Correct Answer:** `customerType`, `region`, `orderAmount` — all leaf-level inputs.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Chained DRD + invoke downstream decision" → разпознаваш che се иска **leaf input requirement understanding**.

**Въпросът → Solution Framing.** "Inputs as process variables" — изпитва се DRD evaluation mechanism.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN engine traverses DRD backward from target, знаеш че all leaf inputs must be supplied, знаеш че intermediate outputs са computed at eval time (не supplied), знаеш че surplus variables ignored. Това е знание за DRD evaluation traversal.

---

## Question 29: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A team wants to **test a DMN decision in isolation** before deploying — provide inputs, evaluate, observe outputs and which rules matched. They have the DMN file open in Web Modeler.

**Which Web Modeler feature enables interactive DMN testing?**

- **a)** Web Modeler's **DMN Tester** lets you provide test inputs, evaluate the decision, and see which rules matched and what output was produced. Iterates quickly without process deployment. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Deploy the DMN to a test cluster and use Operate's Decision Instance view. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/basic-operate-navigation/)

- **c)** Write a unit test in Java using the Camunda DMN engine library. Documentation: [Testing](https://docs.camunda.io/docs/components/best-practices/development/testing-process-definitions/)

- **d)** DMN can only be tested by integration with a BPMN process via Camunda Play. Documentation: [Camunda Play](https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/play-your-process/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler includes a **DMN testing facility** that lets the developer supply test inputs and evaluate the decision interactively — without process deployment. The result shows the matched rule(s) and output(s), enabling rapid iteration during decision authoring.

- **Option b) — Working but heavier.** Test cluster + Operate works but requires deployment + invocation through a BPMN process; DMN Tester is the lighter-weight in-editor approach.

- **Option c) — Working alternative for automated tests.** Java unit tests are for CI; DMN Tester is for interactive exploration.

- **Option d) — Incorrect.** DMN can be tested in isolation, not only through BPMN.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. DMN Tester е purpose-built for interactive DMN testing.
- **b) 5/10** — works but heavyweight для quick iteration.
- **c) 5/10** — automated tests; different use case.
- **d) 2/10** — невярно — DMN може isolated testing.

**Correct Answer:** Web Modeler's DMN Tester lets you provide test inputs and evaluate the decision interactively.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Test DMN in isolation + interactive" → разпознаваш che се иска **Modeler-side interactive tester**.

**Въпросът → Solution Framing.** "Interactive DMN testing" — изпитва се Modeler tooling knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler има built-in DMN Tester, знаеш че Operate's Decision Instance view е post-deployment, знаеш че Java unit tests са automated CI, знаеш че Camunda Play е BPMN-flow testing (не DMN isolation). Това е знание за Modeler tooling.

---



# Section 4 — Configuring Forms (Questions 30-32)

> Weight 5% • Topics: Form element library, data binding, conditional rendering, table binding, FEEL templating.

---

## Question 30: Configuring Forms (Weighting: 5%)

**Scenario:** A claims-filing form displays an applicant's name and date of birth pulled from earlier in the process. The user must confirm them but **cannot edit** these fields (they came from a verified source). The team wants the fields visible and visually clear that they're read-only.

**Which Forms feature provides read-only field display?**

- **a)** Use a **Text View** component (read-only text display) with FEEL expression `=applicant.fullName` and `=applicant.birthDate`. Form designers also can mark a regular Text Input as `readonly: true` for visual editability lock. Documentation: [Forms element library](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/)

- **b)** Hide the fields and trust the data downstream. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Use a Text Input with `disabled: true` so the field is unfocusable. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Add a Service Task before the form that wraps the values into a special read-only variable. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Forms element library includes a **Text View** component specifically for displaying read-only computed/static text. FEEL expressions in the Text View bind to process variables — the user sees the value but can't modify. Alternative: Text Input with read-only setting (same value display, just a different component choice).

- **Option b) — Incorrect.** Hiding defeats the "user must confirm" requirement.

- **Option c) — Partially viable.** `disabled` makes the field non-interactive but is intended for unavailable inputs (e.g., conditionally disabled fields); Text View is the cleaner choice for purely display values.

- **Option d) — Incorrect.** No special read-only variable type; over-engineering.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Text View component е canonical for read-only display.
- **b) 1/10** — defeats confirmation requirement.
- **c) 6/10** — workable but different intent.
- **d) 2/10** — over-engineering.

**Correct Answer:** Use a Text View component with FEEL expressions binding to the variables.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Read-only display + user confirms but can't edit" → разпознаваш che се иска **read-only display component**.

**Въпросът → Solution Framing.** "Read-only field display" — изпитва се Forms component library knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Forms има Text View component (display-only), знаеш che Text Input + readonly е alternative, знаеш че hide defeats user confirmation, знаеш че extra variables са over-engineering. Това е знание за Forms component types.

---

## Question 31: Configuring Forms (Weighting: 5%)

**Scenario:** A long onboarding form has 30+ fields organised into logical groups: Personal Info, Employment, Banking, Tax Details. The user is overwhelmed seeing all fields at once. The UX team wants a **wizard-style multi-page flow** where the user fills one section, clicks "Next", proceeds to the next section.

**Which Camunda 8 Forms approach implements this multi-step wizard?**

- **a)** Split the form into **multiple User Tasks**, each with its own focused form for one section. The BPMN process chains them sequentially with Sequence Flow. State accumulates in process variables. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** Single form with a **Wizard component** that has Next/Previous buttons. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Use Group components within a single form to visually separate sections. User sees all groups simultaneously, no Next/Previous. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Forms doesn't support multi-page; redirect users to an external multi-page web app. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Forms are designed as **single-step forms per User Task**. To create a wizard-style multi-page flow, model the BPMN with **multiple User Tasks chained sequentially**. Each User Task has its own focused form. After the user completes section N, the process advances to User Task N+1; variables accumulate as the user progresses. This is the canonical wizard pattern in Camunda 8.

- **Option b) — Incorrect.** No "Wizard component" with Next/Previous in Camunda Forms.

- **Option c) — Suboptimal.** Group components separate visually but don't paginate — overwhelming for 30+ fields.

- **Option d) — Incorrect.** External app integration is heavier than the canonical multi-User-Task pattern.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple User Tasks + sequential flow е canonical wizard pattern.
- **b) 2/10** — invented component.
- **c) 5/10** — works for shorter forms но overwhelm at 30+ fields.
- **d) 3/10** — external app е heavy alternative.

**Correct Answer:** Split the form into multiple User Tasks, each with its own focused form for one section.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Wizard-style multi-page" → разпознаваш che се иска **BPMN-level wizard, не Form-level**.

**Въпросът → Solution Framing.** "Multi-step wizard" — изпитва се knowledge на Forms scope (single-step) vs BPMN orchestration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Camunda Forms са single-step (no built-in wizard component), знаеш che BPMN orchestrates flow между forms via User Tasks, знаеш che Group components са visual organization не pagination. Това е знание за Forms scope.

---

## Question 32: Configuring Forms (Weighting: 5%)

**Scenario:** A global SaaS rollout deploys the same Camunda 8 onboarding form across 3 regions — EN-US, DE-DE, FR-FR. The form labels, placeholders, validation messages must be **localised** per region's language. The form is the same shape; only text changes.

**Which Forms localisation approach is canonical?**

- **a)** Use **FEEL templating in labels** with a process variable `language` indicating the user's locale. Each field's label is a FEEL expression returning the appropriate string for the locale. Documentation: [Forms templating](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-templating-syntax/)

- **b)** Deploy 3 separate forms (one per locale) and have a Service Task before the form pick the right one based on user language. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Camunda Forms has built-in i18n via `lang` attribute on each label. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Forms don't support localisation; render external i18n via separate web app. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda Forms support **FEEL templating in label/placeholder/help text fields**. Combined with a process variable `=language`, the FEEL expression can return the appropriate string per locale (e.g., `=if language="de" then "Vorname" else if language="fr" then "Prénom" else "First name"`). This is the canonical i18n pattern in Camunda Forms — single form, multi-language at runtime.

- **Option b) — Suboptimal.** 3 separate forms means triple maintenance — when adding a field, you update three files. Not DRY.

- **Option c) — Incorrect.** No built-in `lang` attribute mechanism.

- **Option d) — Incorrect.** Forms support i18n via FEEL templating.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL templating + language variable е canonical i18n.
- **b) 3/10** — 3x maintenance burden.
- **c) 1/10** — invented attribute.
- **d) 1/10** — невярно — i18n supported.

**Correct Answer:** Use FEEL templating in labels with a process variable indicating the user's locale.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-templating-syntax/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Localised labels per region" → разпознаваш che се иска **runtime i18n in Forms**.

**Въпросът → Solution Framing.** "Localisation approach canonical" — изпитва се Forms i18n knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Forms templating syntax support-ва FEEL expressions, знаеш che single-form + variable-driven е DRY, знаеш че 3 forms = 3x maintenance. Това е знание за Forms templating feature.

---

# Section 5 — Configuring Connectors (Questions 33-36)

> Weight 6% • Topics: Connector Secrets, Inbound and Outbound Connectors.

---

## Question 33: Configuring Connectors (Weighting: 6%)

**Scenario:** A team's incident-management process notifies on-call engineers via **Slack** when a critical error fires. They use the **Slack Outbound Connector** from Camunda's catalog. The Slack workspace's webhook URL is sensitive and must not appear in BPMN XML.

**How should the Slack URL be configured?**

- **a)** Store the webhook URL as a **cluster secret** (via Console UI for SaaS, or via env/K8s/Vault for SM) and reference it in the Slack Connector property as `{{secrets.SLACK_WEBHOOK_URL}}`. The runtime resolves the placeholder at execution. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Hardcode it in the Slack Connector property; cluster encryption automatically protects BPMN XML. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Pass the URL via a process variable set by a Service Task that reads from environment. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Slack Connector has a special `webhookUrl` property that's encrypted at rest in BPMN. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Cluster Secrets + placeholder syntax is the canonical secret-handling pattern across all Connectors. Define the webhook URL as a secret named `SLACK_WEBHOOK_URL` in Console UI (SaaS) or via configured provider (SM). Reference in the Connector config as `{{secrets.SLACK_WEBHOOK_URL}}`. BPMN XML contains only the placeholder — safe to commit to Git.

- **Option b) — Incorrect.** BPMN XML is not auto-encrypted; hardcoded values leak via Git/audit.

- **Option c) — Suboptimal.** Process-variable-passing leaks the URL to audit logs / Operate / downstream tasks.

- **Option d) — Incorrect.** No special encrypted-property mechanism in BPMN.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Cluster Secrets + placeholder е canonical Connector secret pattern.
- **b) 1/10** — невярно — no auto-encryption.
- **c) 2/10** — leaks to audit.
- **d) 1/10** — invented mechanism.

**Correct Answer:** Store the webhook URL as a cluster secret and reference as `{{secrets.SLACK_WEBHOOK_URL}}`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Sensitive URL + don't appear in BPMN XML" → разпознаваш че се иска **secret externalisation pattern**.

**Въпросът → Solution Framing.** "Configured" + sensitive — изпитва се knowledge на Secrets mechanism.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che `{{secrets.NAME}}` placeholder е canonical syntax, знаеш che BPMN не e auto-encrypted, знаеш che process variables leak to audit. Това е знание за Secrets management.

---

## Question 34: Configuring Connectors (Weighting: 6%)

**Scenario:** A team integrates with AWS — when an SQS message arrives on a configured queue, a Camunda 8 process should start. They configure the **AWS SQS Inbound Connector** with the queue ARN and AWS credentials (via secrets). After deploying, the team observes that messages on the SQS queue are consumed by the Connector but **process instances are not started**.

**What is the most likely cause?**

- **a)** The Connector requires a **process start configuration** — specifying which process definition to start, and how to extract correlation keys / variables from the SQS message. Without this, the Connector consumes messages but doesn't trigger anything. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** AWS credentials are wrong; SQS messages are silently discarded. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Inbound Connectors only support Message Catch Events, not Process Start. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** SQS queue must be FIFO; standard queues aren't supported. Documentation: [AWS SQS](https://docs.camunda.io/docs/components/connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Inbound Connectors (whether webhook, SQS, Kafka, etc.) require **proper wiring to a BPMN element** — typically either a Process Start Event (creates new instance) or a Message Catch Event (correlates to existing instance). The Connector configuration must include: which BPMN process to start (if Start Event) and how to extract message data into process variables. Without this configuration, the Connector successfully consumes messages but has no target to trigger.

- **Option b) — Incorrect.** Bad credentials would produce errors visible in logs, not silent discard.

- **Option c) — Incorrect.** Inbound Connectors support both Start Events and Catch Events.

- **Option d) — Incorrect.** SQS Connector supports both standard and FIFO queues.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Connector wiring to BPMN element е mandatory configuration.
- **b) 3/10** — bad creds produce visible errors, не silent discard.
- **c) 2/10** — невярно — both supported.
- **d) 2/10** — невярно — both queue types supported.

**Correct Answer:** The Connector requires a process start configuration specifying which process definition to start.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Messages consumed but no instances started" → разпознаваш che се иска **Connector → BPMN wiring**.

**Въпросът → Solution Framing.** "Most likely cause" — изпитва се knowledge of Inbound Connector configuration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Inbound Connectors require explicit BPMN wiring, знаеш че bad credentials produce visible errors, знаеш че Connectors support multiple event types и queue types. Това е знание за Inbound Connector configuration.

---

## Question 35: Configuring Connectors (Weighting: 6%)

**Scenario:** A team built a Custom Outbound Connector in 2024 against Camunda 8.5 SDK. They're now upgrading to Camunda 8.8 SaaS. They want to know if the existing Connector JAR can be uploaded to the 8.8 cluster's Connector Runtime, or if it needs rebuilding.

**What is the correct understanding of Connector SDK version compatibility?**

- **a)** **Test in staging first.** The Connector SDK has stability commitments across minor versions; an 8.5-compatible Connector typically works on 8.8 but may benefit from recompilation against the matching SDK version. Major version jumps (e.g., to a hypothetical 9.x) may break compatibility. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** Always requires rebuild — minor versions break binary compatibility. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** Forever compatible; no testing needed for any version bump. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **d)** Custom Connectors aren't portable; rewrite per-cluster. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** SDK provides stability commitments across minor versions (8.5 → 8.8). Practical approach: test the existing JAR on 8.8 staging cluster. If it works, deploy; if it doesn't, recompile against 8.8 SDK. Major version bumps may require code changes. Always test before production rollout.

- **Option b) — Overstated.** Minor versions usually maintain binary compatibility.

- **Option c) — Understated.** Forever-compatible is unrealistic; testing is always prudent.

- **Option d) — Incorrect.** Connectors are portable across cluster types.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Test in staging + minor-version stability е practical answer.
- **b) 3/10** — overstated; minor versions usually compatible.
- **c) 2/10** — overly optimistic.
- **d) 1/10** — невярно — Connectors portable.

**Correct Answer:** Test in staging first. SDK has stability commitments across minor versions.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "8.5 Connector + upgrade to 8.8" → разпознаваш che се иска **compatibility expectations**.

**Въпросът → Solution Framing.** "Version compatibility" — изпитва се SDK release-policy knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SDK has minor-version stability, знаеш че testing е recommended, знаеш че major version bumps може да изискват recompile. Това е знание за practical version handling.

---

## Question 36: Configuring Connectors (Weighting: 6%)

**Scenario:** An Outbound HTTP Connector calls a partner API. The request body must include data from process variables (customer ID, order details) plus some computed fields (current timestamp, signature hash). The team wants to compose the request body cleanly without manual JSON string construction.

**Which Connector configuration handles structured request body composition?**

- **a)** Use **FEEL expression** in the Connector's Body field to construct a context (object) literal. Example: `={customerId: customer.id, order: order, timestamp: now(), signature: hash(customer.id + order.total)}`. The FEEL evaluator produces a JSON-serialisable object. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Build the JSON manually in a Script Task before the Connector. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** Connector body must be a static JSON string; computed fields aren't supported. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Use process variables directly; Connector interpolates them with `${var}` syntax. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Outbound HTTP Connector accepts a **FEEL context expression** in its Body field for structured composition. The FEEL evaluator builds the object at runtime — process variables, computed fields, FEEL built-ins (like `now()`), nested objects all work. The runtime serializes the object to JSON. Cleaner than string concatenation.

- **Option b) — Working but ugly.** Script Task to build JSON works but pollutes the BPMN with an extra task; FEEL handles this inline.

- **Option c) — Incorrect.** Computed fields supported via FEEL.

- **Option d) — Incorrect.** Camunda 8 uses FEEL (`=`), not JUEL (`${}`).

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL context expression е canonical for structured body composition.
- **b) 4/10** — works но adds extra task.
- **c) 2/10** — невярно — computed fields supported.
- **d) 1/10** — JUEL syntax не C8.

**Correct Answer:** Use FEEL expression in the Connector's Body field to construct a context (object) literal.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Compose request body with vars + computed fields" → разпознаваш che се иска **FEEL inline composition**.

**Въпросът → Solution Framing.** "Structured request body" — изпитва се FEEL context literal knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che FEEL context literal `{...}` builds objects, знаеш che FEEL built-ins (now(), hash()) available, знаеш че Script Task workaround works but unnecessary, знаеш че JUEL ≠ FEEL. Това е знание за FEEL composition in Connectors.

---



# Section 6 — Extensions & Integrations (Questions 37-50)

> Weight 25% • Topics: FEEL, Connector SDK, Job Workers, REST/gRPC APIs, RPA.

---

## Question 37: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression in a Service Task's input mapping computes a discount: `discount = if customer.tier = "GOLD" then 0.15 else if customer.tier = "SILVER" then 0.10 else 0.05`. At runtime, when `customer.tier` is null, the FEEL evaluator's behavior is observed.

**Which best describes FEEL semantics for null in this if-elif-else?**

- **a)** `null = "GOLD"` returns `null` (not `false`). The `if null then ... else ...` falls through to the else branch returning `0.05`. The expression evaluates without raising an exception, but a `null = "GOLD"` is conceptually "unknown not equal." Documentation: [FEEL boolean expressions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-boolean/)

- **b)** Raises an evaluation error; the Service Task creates an Incident. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Returns `null` from the entire expression; discount becomes null. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Returns `0.15` because null is treated as a default match. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's `if` statement evaluates the condition; if it's not strictly `true`, the else branch executes. `null = "GOLD"` returns `null`, which in `if` context is treated as falsy → fall through to else. No exception, expression returns `0.05`.

- **Option b) — Incorrect.** FEEL `=` on null is graceful, not exception-raising for this case.

- **Option c) — Incorrect.** else branch executes; result is 0.05 not null.

- **Option d) — Incorrect.** null doesn't match GOLD or SILVER.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL falsy-on-null + else fall-through.
- **b) 3/10** — невярно — no exception for this case.
- **c) 3/10** — невярно — else branch runs.
- **d) 1/10** — невярно — null ≠ "GOLD".

**Correct Answer:** null = "GOLD" returns null; if falls through to else returning 0.05.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-boolean/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "FEEL `=` against null in if-elif" → разпознаваш che се иска **FEEL null semantics**.

**Въпросът → Solution Framing.** "Best describes FEEL semantics" — изпитва се FEEL behavior knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL null-comparison gracefully returns null, знаеш che if treats non-true as false, знаеш che else fall-through gives default. Това е знание за FEEL null handling.

---

## Question 38: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression filters a list of orders to keep only those over $1000: `large_orders = [o in orders : o.total > 1000]`. The team wants to extend this — they also want to know the **total count** of large orders.

**Which FEEL approach computes both the filtered list and its count?**

- **a)** `large_orders = orders[total > 1000]` (filter shorthand) and `count = count(large_orders)`. FEEL provides `count(list)` built-in for list cardinality. Documentation: [FEEL list functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** FEEL doesn't support counting filtered lists; do it in a Service Task. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `count = orders[total > 1000].count` (property access). Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `count = length(large_orders)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL has two equivalent filter syntaxes: `[item in list : condition]` and shorthand `list[condition]`. For counting, the built-in is `count(list)` — returns number of elements. Two-step expression captures both.

- **Option b) — Incorrect.** FEEL supports this natively.

- **Option c) — Incorrect.** FEEL lists don't expose a `.count` property; use `count(list)`.

- **Option d) — Incorrect.** FEEL uses `count(list)`, not `length(list)`. (`string length(s)` exists for strings.)

**Per-option scoring (1–10):**
- **a) 10/10** — верен. count() built-in за list cardinality.
- **b) 1/10** — невярно — FEEL supports natively.
- **c) 2/10** — invented property.
- **d) 3/10** — close-but-wrong function name.

**Correct Answer:** large_orders = orders[total > 1000]; count = count(large_orders).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Filtered list + count" → разпознаваш che се иска **FEEL list built-ins**.

**Въпросът → Solution Framing.** "Filter and count" — изпитва се FEEL built-in function knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL filter shorthand `list[cond]`, знаеш че `count(list)` е list built-in (not `length`), знаеш che lists нямат `.count` property. Това е знание за FEEL list functions.

---

## Question 39: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL date computation determines whether a contract's `start_date` is at least 30 days before `end_date`. The dates come as ISO strings from a process variable.

**Which FEEL expression correctly performs the date arithmetic?**

- **a)** `date(end_date) - date(start_date) >= duration("P30D")`. FEEL's `date(string)` parses ISO date; subtraction returns days-and-time duration; `duration("P30D")` is a 30-day duration. Comparison works between durations. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** `(end_date - start_date) > 30`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `daysBetween(start_date, end_date) >= 30`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** FEEL doesn't support date arithmetic; do this in a Service Task. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's `date(string)` parses ISO date strings to date values. Subtraction of two dates yields a `days and time duration`. Comparison with `duration("P30D")` (ISO 8601 duration) tests whether elapsed time is ≥ 30 days.

- **Option b) — Incorrect.** Subtracting raw strings doesn't work — they're not numbers.

- **Option c) — Incorrect.** No `daysBetween` built-in in FEEL (Java/legacy Camunda 7 expression libraries had something similar).

- **Option d) — Incorrect.** FEEL has rich temporal arithmetic.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. date() + duration() + subtraction е canonical FEEL temporal.
- **b) 1/10** — string arithmetic не работи.
- **c) 2/10** — invented function.
- **d) 1/10** — невярно — FEEL has temporal support.

**Correct Answer:** date(end_date) - date(start_date) >= duration("P30D").

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "ISO strings + date arithmetic + 30-day check" → разпознаваш che се иска **FEEL date() + duration()**.

**Въпросът → Solution Framing.** "Correctly performs date arithmetic" — изпитва се FEEL temporal knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че `date(string)` parses ISO, знаеш че subtraction yields duration, знаеш че `duration("P30D")` е canonical syntax, знаеш че FEEL не има `daysBetween`. Това е знание за FEEL temporal arithmetic.

---

## Question 40: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Java Job Worker built with Spring Zeebe handles `payment-processing` Service Tasks. The worker is annotated with `@JobWorker(type = "payment-processing")`. Under heavy load, the team observes the worker times out activated jobs (jobs return to the broker, re-activate, repeat).

**Which Spring Zeebe `@JobWorker` parameter primarily controls how long the worker has before the job times out?**

- **a)** `timeout` — sets the job-activation timeout (typical default 5 min). If the worker doesn't complete/fail/handle the job within this window, Zeebe re-activates it. Increase to match real processing time. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** `maxRetries` — controls how many times job retries on failure. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** `pollInterval` — how often the worker polls for jobs. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** `requestTimeout` — gRPC connection timeout. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `@JobWorker(type="...", timeout=...)` sets the **job-activation timeout** — how long Zeebe waits for the worker to handle this job before re-activating it. If your payment processing takes 8 minutes but default is 5, jobs time out and re-activate, causing the symptom observed.

- **Option b) — Different concern.** maxRetries handles failure retry, not timeout.

- **Option c) — Different concern.** pollInterval controls polling frequency.

- **Option d) — Different concern.** requestTimeout handles gRPC-level timeouts, not job processing.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. timeout е job-activation duration.
- **b) 3/10** — different concept (retry on failure).
- **c) 3/10** — different concept (polling).
- **d) 3/10** — different concept (gRPC).

**Correct Answer:** timeout — sets the job-activation timeout.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Worker times out + re-activates" → разпознаваш che се иска **job-activation timeout parameter**.

**Въпросът → Solution Framing.** "Primary parameter" — изпитва се Spring Zeebe annotation API.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che `timeout` е activation duration, знаеш che `maxRetries` е failure retry, знаеш че `pollInterval` е poll frequency, знаеш че `requestTimeout` е gRPC layer. Това е знание за Spring Zeebe Job Worker config.

---

## Question 41: Extensions & Integrations (Weighting: 25%)

**Scenario:** A TypeScript Job Worker (using `@camunda8/sdk`) handles `image-thumbnail` Service Tasks. The Service Task expects two outputs: `thumbnailUrl` and `width`. The handler computes these and wants to return them to Zeebe.

**Which return shape from the handler function is correct?**

- **a)** Return an object `{ thumbnailUrl, width }` — the SDK serializes it as the job's complete-payload and Zeebe merges into process variables per Output Mapping. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **b)** Call `job.complete({ variables: { thumbnailUrl, width } })` explicitly; do not return a value. Documentation: [Node SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **c)** Set Process variables via API call; the handler return is ignored. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Both **a** and **b** work — return object is auto-completed; explicit complete() is also supported. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

**🔍 Explanations & Correct Answer**

- **Option d) — Correct.** `@camunda8/sdk` supports both ergonomic styles. Return an object → SDK auto-completes the job with those as variables. Or call `job.complete({variables: {...}})` explicitly for fine control (e.g., custom complete options). Both are documented and supported.

- **Option a) — Partially correct.** Return-object style works, but explicit complete() also works.

- **Option b) — Partially correct.** Explicit complete() works, but return-object also works.

- **Option c) — Incorrect.** Worker handler is the completion mechanism.

**Per-option scoring (1–10):**
- **a) 6/10** — partial — return works, but explicit also valid.
- **b) 6/10** — partial — explicit works, but return-object also valid.
- **c) 1/10** — невярно — worker IS the completion.
- **d) 10/10** — верен — both styles supported.

**Correct Answer:** Both a and b work — return object is auto-completed; explicit complete() is also supported.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/node-js-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Return outputs from TS handler" → разпознаваш che се иска **SDK return-shape patterns**.

**Въпросът → Solution Framing.** "Correct return shape" — изпитва се knowledge на @camunda8/sdk API.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SDK supports both ergonomic (return) и explicit (job.complete()), знаеш че worker handler е the completion mechanism. Това е знание за SDK API styles.

---

## Question 42: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team wants to **start process instances** programmatically from a backend service. They have credentials for the cluster's REST API. The process model is `customer-onboarding` and they need to pass `customerId` and `email` as initial variables.

**Which API and endpoint pattern starts the instance?**

- **a)** **Orchestration Cluster REST API**, POST `/v2/process-instances` with body `{"processDefinitionId": "customer-onboarding", "variables": {...}}`. Documentation: [Orchestration Cluster API REST](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/specifications/create-process-instance/)

- **b)** Web Modeler API to deploy the process and then start. Documentation: [Web Modeler API](https://docs.camunda.io/docs/apis-tools/web-modeler-api/)

- **c)** Administration API for cluster-level start operations. Documentation: [Administration API](https://docs.camunda.io/docs/apis-tools/administration-sm-api/)

- **d)** Optimize API has a process-start endpoint. Documentation: [Optimize API](https://docs.camunda.io/docs/apis-tools/optimize-api/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The **Orchestration Cluster REST API** is the canonical API for process instance lifecycle operations. POST `/v2/process-instances` creates a new instance for the specified processDefinitionId (or processDefinitionKey), with initial variables. This API replaces the legacy Tasklist/Operate APIs for instance start.

- **Option b) — Wrong API.** Web Modeler API handles modeling and deployment, not instance lifecycle.

- **Option c) — Wrong API.** Administration API handles cluster-level admin (members, clusters, regions), not instance start.

- **Option d) — Wrong API.** Optimize is read-only analytics.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. /v2/process-instances POST е canonical.
- **b) 2/10** — wrong API surface.
- **c) 2/10** — wrong API surface.
- **d) 1/10** — wrong API surface.

**Correct Answer:** Orchestration Cluster REST API, POST /v2/process-instances.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/specifications/create-process-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Start instances programmatically" → разпознаваш che се иска **Orchestration Cluster REST API**.

**Въпросът → Solution Framing.** "Which API and endpoint" — изпитва се API surface mapping.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che Orchestration Cluster API е canonical за process operations, знаеш че Web Modeler API е modeling, знаеш че Administration е cluster-level, знаеш че Optimize е analytics. Това е знание за API surface boundaries.

---

## Question 43: Extensions & Integrations (Weighting: 25%)

**Scenario:** A custom Outbound Connector authored with the Connector SDK must call a partner API that returns large response payloads (5-50 MB). The team is concerned about memory usage and timeouts.

**Which Connector SDK feature/strategy handles large response payloads efficiently?**

- **a)** Stream the response and use **Document Handling** — store the large payload as a Camunda Document and pass the document reference (not the body) as a Connector output. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **b)** Return the full payload as a process variable string. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Connector SDK doesn't support large payloads; use a Job Worker instead. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **d)** Return only summary headers; ignore body. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8.6+ Document Handling provides first-class document-as-variable support. For large Connector responses, the Connector code creates a Document (stores in configured storage) and returns the document reference as the variable. Process variables stay small; downstream tasks can read the document when needed.

- **Option b) — Bad practice.** Multi-MB process variables degrade broker performance and bloat state.

- **Option c) — Incorrect.** SDK supports this scenario via Document Handling.

- **Option d) — Suboptimal.** Loses data; not a valid solution.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Document Handling е canonical за large payloads.
- **b) 2/10** — leads to bloated state.
- **c) 3/10** — невярно — SDK supports this.
- **d) 2/10** — loses needed data.

**Correct Answer:** Use Document Handling — store payload as a Camunda Document and pass the reference.

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/document-handling/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "5-50 MB Connector response" → разпознаваш che се иска **Document Handling**.

**Въпросът → Solution Framing.** "Handles large response payloads" — изпитва се knowledge че variables трябва да са small.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Document Handling е canonical, знаеш че variables трябва да са small, знаеш че SDK supports document creation. Това е знание за large-payload patterns.

---

## Question 44: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Java Job Worker handles `validate-document` Service Tasks. The validation produces multiple possible outcomes: SUCCESS, INVALID_FORMAT, EXPIRED, MISSING_DATA. Each outcome should route to a different BPMN path. The team wants the BPMN to use exclusive gateway routing on a clean `validationStatus` variable.

**Which Job Worker handler pattern produces the cleanest BPMN?**

- **a)** Worker returns `{validationStatus: "SUCCESS"}` (or "INVALID_FORMAT" / "EXPIRED" / etc.) as job-complete variables. The BPMN Exclusive Gateway then checks `=validationStatus = "SUCCESS"` etc. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Worker throws a BPMN Error with errorCode for non-success cases; Error Boundary Event catches each errorCode. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** Worker returns full validation report (~50 fields); BPMN gateway evaluates complex FEEL on it. Documentation: [Gateways](https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/)

- **d)** Worker fails the job with retries=0 for non-success; ops manually resolves. Documentation: [Incidents](https://docs.camunda.io/docs/components/concepts/incidents/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Clean separation of concerns: Worker computes the business outcome and returns a simple status enum + supporting variables. BPMN gateway routes on the status. The diagram is readable, business analysts see the routing logic clearly.

- **Option b) — Different semantics.** BPMN Errors are for exceptional cases, not normal business outcomes. Treating "INVALID_FORMAT" as an error makes the BPMN harder to read and conflates error handling with normal routing.

- **Option c) — Bad practice.** Complex FEEL on raw validation reports in the gateway puts business logic in the wrong place.

- **Option d) — Wrong semantics.** Failing the job creates Incidents; non-success is normal business outcome, not failure.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Status enum + Exclusive Gateway е clean pattern.
- **b) 4/10** — works but conflates errors with normal outcomes.
- **c) 3/10** — gateway logic too complex.
- **d) 2/10** — wrong semantics for business outcome.

**Correct Answer:** Worker returns a status enum; BPMN Exclusive Gateway routes on the status.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Multiple business outcomes + clean BPMN" → разпознаваш che се иска **status enum + gateway**.

**Въпросът → Solution Framing.** "Cleanest BPMN" — изпитва се BPMN design pattern knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че status enums + gateways са clean separation, знаеш che BPMN errors са exceptional NOT normal outcomes, знаеш че complex FEEL on raw data is bad practice. Това е знание за BPMN design patterns.

---

## Question 45: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team uses Spring Zeebe to write a Job Worker that handles `archive-document` Service Tasks. The handler does its work but **doesn't need to return any variables** — the success itself is the signal. They want the simplest possible handler.

**Which Spring Zeebe handler signature is the simplest valid form?**

- **a)** `@JobWorker(type = "archive-document")` annotated method with `void` return type and zero parameters (or with `@Variable` parameters for input). Spring Zeebe automatically completes the job after the method returns. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** Method must return `Map<String, Object>` (empty map is allowed). Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** Method must accept `ActivatedJob` and call `client.newCompleteCommand().send()`. Documentation: [Java SDK](https://docs.camunda.io/docs/apis-tools/java-client/)

- **d)** Method must throw an exception on completion. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Spring Zeebe's `@JobWorker` annotation supports `void` return type. Spring Zeebe auto-completes the job after the annotated method returns successfully (no exception thrown). For the simplest "do work, no outputs" case, this is the cleanest signature. `@Variable` parameter binding extracts process variables ergonomically.

- **Option b) — Incorrect.** Map return is allowed but not required; void is simpler.

- **Option c) — Incorrect.** That's plain Java client; Spring Zeebe abstracts this.

- **Option d) — Incorrect.** Exceptions signal failure, not completion.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. void method + @JobWorker annotation е simplest form.
- **b) 5/10** — allowed but unnecessarily verbose.
- **c) 4/10** — bypasses Spring Zeebe ergonomics.
- **d) 1/10** — невярно — exceptions = failure.

**Correct Answer:** @JobWorker annotated method with void return type.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Simplest handler + no return vars" → разпознаваш che се иска **void method**.

**Въпросът → Solution Framing.** "Simplest valid form" — изпитва се Spring Zeebe minimal API.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Spring Zeebe auto-completes after void method returns, знаеш че Map<String, Object> is allowed but verbose, знаеш че plain Java client е bypassing Spring. Това е знание за Spring Zeebe annotations.

---

## Question 46: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team builds a custom **Inbound Connector** that listens for events from RabbitMQ. The Connector should be deployable as a JAR to the Connector Runtime. The team is unfamiliar with the SDK structure.

**Which is the main SDK interface that an Inbound Connector must implement?**

- **a)** `InboundConnectorExecutable` (or its newer variants) — defines `activate(InboundConnectorContext)` and `deactivate()` lifecycle methods that the Connector Runtime calls when subscribing/unsubscribing to events. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** `OutboundConnectorFunction` — handles both inbound and outbound. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** `ZeebeJobWorker` — subclass for inbound. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** No interface needed; Connectors are just POJOs. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Connector SDK defines `InboundConnectorExecutable` (and subtypes for specific event-handling shapes like `MessageInboundConnectorExecutable`). Implement `activate()` to subscribe to the external event source (RabbitMQ queue), and `deactivate()` to release resources when the process is undeployed. The Connector Runtime calls these.

- **Option b) — Wrong interface.** `OutboundConnectorFunction` is for outbound; inbound has its own interface.

- **Option c) — Wrong interface.** Job Workers are a different abstraction; Inbound Connectors run in Connector Runtime.

- **Option d) — Incorrect.** SDK requires interface implementation.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. InboundConnectorExecutable е the interface.
- **b) 2/10** — wrong interface (outbound).
- **c) 2/10** — wrong abstraction (Job Worker).
- **d) 1/10** — невярно — SDK requires interface.

**Correct Answer:** InboundConnectorExecutable (or its variants).

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Custom Inbound Connector + RabbitMQ + SDK" → разпознаваш че се иска **InboundConnectorExecutable**.

**Въпросът → Solution Framing.** "Main SDK interface" — изпитва се SDK structure knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Inbound has separate interface from Outbound, знаеш че activate/deactivate е lifecycle, знаеш че Job Worker е different abstraction. Това е знание за Connector SDK structure.

---

## Question 47: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team needs to invoke a legacy desktop application (no API, only GUI) as part of a Camunda 8 process — open Excel, fill a template, save and email it. Standard Connectors can't do this; the GUI must be driven.

**Which Camunda 8 feature is purpose-built for this scenario?**

- **a)** **RPA (Robotic Process Automation)** — Camunda 8 has RPA workers that drive UI automation (mouse clicks, keyboard input, GUI manipulation). RPA tasks are configured as Service Tasks with type `camunda::rpa`, and a deployed bot script handles the GUI work. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **b)** Custom Job Worker with Selenium or Robot Framework wrapped in code. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** AI Agent Connector — let the LLM drive the GUI. Documentation: [Agentic AI](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **d)** Manual User Task with instructions for the human to do it. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 RPA is the purpose-built feature for UI automation of legacy systems. A bot script (written in RPA DSL) is deployed to an RPA worker that subscribes to RPA-typed Service Tasks. The bot performs GUI actions; process flow continues when bot completes.

- **Option b) — Workable but more work.** Custom Job Worker with Selenium can do this but reinvents what RPA provides natively.

- **Option c) — Incorrect.** AI Agent Connector is for LLM-driven decisions, not GUI manipulation.

- **Option d) — Defeats automation goal.** Manual User Task is the opposite of automation.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. RPA е purpose-built за UI automation.
- **b) 5/10** — workable but reinvents wheel.
- **c) 2/10** — wrong feature (LLM ≠ GUI).
- **d) 1/10** — defeats automation purpose.

**Correct Answer:** RPA (Robotic Process Automation).

**Official Documentation Link:** https://docs.camunda.io/docs/components/rpa/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Legacy GUI app + Excel automation" → разпознаваш che се иска **RPA**.

**Въпросът → Solution Framing.** "Purpose-built for this scenario" — изпитва се knowledge на Camunda RPA.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че RPA е canonical за GUI automation, знаеш че AI Agent е LLM-driven decisions, знаеш че Manual User Task е not automation. Това е знание за Camunda 8 RPA capability.

---

## Question 48: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression on a Service Task input mapping checks whether a customer is VIP based on multiple criteria: account age > 5 years OR total spend > $50,000. The expression must combine these with OR.

**Which FEEL syntax is correct for combining boolean conditions with OR?**

- **a)** `accountAgeYears > 5 or totalSpend > 50000` — FEEL uses lowercase keywords `and`, `or`, `not()`. Documentation: [FEEL boolean expressions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-boolean/)

- **b)** `accountAgeYears > 5 || totalSpend > 50000` — pipe-pipe like JavaScript. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `accountAgeYears > 5 OR totalSpend > 50000` — uppercase keyword. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `or(accountAgeYears > 5, totalSpend > 50000)` — function-call form. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL uses **lowercase keywords** `and`, `or`, `not`. (`not` is also a function: `not(boolean)`.) The expression `accountAgeYears > 5 or totalSpend > 50000` is valid FEEL — produces a boolean.

- **Option b) — Incorrect.** `||` is JavaScript/C-family, not FEEL.

- **Option c) — Incorrect.** FEEL is case-sensitive; uppercase OR is invalid.

- **Option d) — Misleading.** While FEEL has built-in functions like `any(list)` for "true if any element is true," there's no `or(a, b)` function form for two booleans. Use the operator.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. lowercase `or` е canonical.
- **b) 1/10** — JS syntax не FEEL.
- **c) 2/10** — uppercase невалиден.
- **d) 3/10** — invented function form.

**Correct Answer:** accountAgeYears > 5 or totalSpend > 50000 (lowercase or).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-boolean/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Combine boolean conditions with OR" → разпознаваш che се иска **FEEL boolean operators**.

**Въпросът → Solution Framing.** "Correct FEEL syntax for OR" — изпитва се FEEL syntax knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL използва lowercase `and`/`or`/`not`, знаеш che case-sensitive, знаеш че не e JavaScript. Това е знание за FEEL keyword syntax.

---

## Question 49: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team's RPA bot opens a CRM web app, scrapes customer data, and returns it to the Camunda process. The bot occasionally fails (e.g., page didn't load fast enough). The team wants the process to retry the RPA task automatically up to 3 times before incident-ing.

**Which configuration handles RPA retry semantics?**

- **a)** Set `zeebe:taskDefinition retries="3"` on the RPA-typed Service Task. Zeebe re-activates the job on bot failure up to the configured retries; after exhaustion an Incident fires. Same Job Worker retry mechanism applies to RPA. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/) + [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **b)** RPA has its own retry mechanism configured in the bot script. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **c)** Wrap the RPA task in a Boundary Error Event that loops back. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **d)** Retries aren't supported for RPA; failures always create incidents. Documentation: [Incidents](https://docs.camunda.io/docs/components/concepts/incidents/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** RPA tasks use the same job-worker retry semantics as any Service Task. `retries="3"` (set in Web Modeler "Retries" property) means Zeebe re-activates the job on bot failure up to 3 times. Bot fails on activation 1 → retry → activation 2 → fail → retry → activation 3 → fail → Incident. Set retries based on expected transient-failure probability.

- **Option b) — Different scope.** Bot-script internal retries (loops within the script) are possible but separate from job-level retries; the question asks about Zeebe-level retry.

- **Option c) — Workable.** Boundary Error + loop is BPMN-level pattern; works but the simpler answer is built-in retries.

- **Option d) — Incorrect.** Retries are supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. retries attribute на task definition.
- **b) 4/10** — different scope (script-level).
- **c) 5/10** — works but unnecessary BPMN complexity.
- **d) 1/10** — невярно — retries supported.

**Correct Answer:** Set zeebe:taskDefinition retries="3" on the RPA-typed Service Task.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "RPA retry up to 3 times" → разпознаваш che се иска **retries attribute**.

**Въпросът → Solution Framing.** "Handles RPA retry semantics" — изпитва се knowledge на task retry mechanism.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че RPA tasks share Service Task retry semantics, знаеш че retries attribute е canonical, знаеш че Boundary Error loop е workaround. Това е знание за RPA + Zeebe retry.

---

## Question 50: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team wants to invoke an external system that requires asynchronous interaction — they send a request, then receive the response via a callback (webhook) **hours later** when the external system finishes. The Camunda process should wait for the callback before continuing.

**Which BPMN + Connector pattern fits asynchronous callback?**

- **a)** Use **Send Task** (or Service Task with Outbound Connector) to send the request, followed by an **Intermediate Message Catch Event** with a correlation key (e.g., correlationKey = requestId). When the callback arrives, an Inbound Connector (webhook) correlates the message to the waiting instance. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/) + [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Use a single Service Task that polls the external system every minute for hours. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** Use a User Task that waits indefinitely. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Increase the Service Task's job-activation timeout to hours; the worker blocks. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Asynchronous-callback pattern is canonical async correlation: Send Task triggers the external request (or Service Task with outbound HTTP), then Intermediate Message Catch Event waits with correlation key. When callback arrives at the Inbound webhook Connector, the Connector publishes a Message with matching correlation key → Zeebe correlates to the waiting instance → flow continues.

- **Option b) — Wastes resources.** Polling for hours burns Job Worker capacity.

- **Option c) — Wrong semantics.** User Tasks are for human work; callbacks are system events.

- **Option d) — Bad practice.** Long-blocking workers are anti-pattern (resource hold, fragile).

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Send + Message Catch + correlation е canonical async pattern.
- **b) 2/10** — wastes resources.
- **c) 2/10** — wrong semantics (User Task ≠ system event).
- **d) 1/10** — anti-pattern.

**Correct Answer:** Send Task + Intermediate Message Catch Event with correlation key, callback via Inbound Connector.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/message-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Async callback + waits hours" → разпознаваш che се иска **Send + Message Catch + correlation**.

**Въпросът → Solution Framing.** "Fits async callback" — изпитва се async pattern knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Send + Message Catch + correlation е canonical async pattern, знаеш че polling wastes resources, знаеш че User Task ≠ system callback, знаеш че long-blocking workers са anti-pattern. Това е знание за BPMN async correlation patterns.

---



# Section 7 — Managing the Development Process (Questions 51-59)

> Weight 15% • Topics: Web Modeler collaboration, client credentials, Operate, Process Instances, troubleshooting, validation, instance modification, migration.

---

## Question 51: Managing the Development Process (Weighting: 15%)

**Scenario:** A team of 5 modelers collaborates on a `claim-processing` BPMN in Web Modeler SaaS. Two designers open the same file simultaneously. One adds a Service Task; the other adds an Exclusive Gateway. They save within seconds of each other.

**Which Web Modeler collaboration behavior applies?**

- **a)** Web Modeler supports **real-time collaborative editing** — both modelers see each other's changes live (similar to Google Docs). Cursors and presence are shown; conflicts on the same element are arbitrated by Web Modeler. Documentation: [Web Modeler collaboration](https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/)

- **b)** Web Modeler is single-editor; the second person sees a "file locked" message. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** Web Modeler uses optimistic save — last-write-wins overwrites the first save. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** Web Modeler requires the second editor to "fork" the file. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler supports real-time collaborative editing — multiple users edit the same file simultaneously with presence indicators, live updates, conflict arbitration. Designed for team modeling without manual lock/check-out flows.

- **Option b) — Incorrect.** Single-editor locking is a different paradigm; Web Modeler is collaborative.

- **Option c) — Incorrect.** Web Modeler arbitrates concurrent edits, not last-write-wins.

- **Option d) — Incorrect.** No fork-required model.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Real-time collaboration е the model.
- **b) 2/10** — single-editor paradigm.
- **c) 2/10** — last-write-wins не корect.
- **d) 1/10** — invented fork model.

**Correct Answer:** Real-time collaborative editing.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "5 modelers + simultaneous edits" → разпознаваш che се иска **real-time collaboration**.

**Въпросът → Solution Framing.** "Collaboration behavior" — изпитва се knowledge на Web Modeler collaboration model.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler е real-time collaborative, знаеш че няма locking, няма last-write-wins, няма fork. Това е знание за Web Modeler collaboration paradigm.

---

## Question 52: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's Java backend service needs to call the Orchestration Cluster REST API to start process instances. The cluster is a SaaS cluster with OAuth2 client-credentials authentication. The team needs to obtain a token.

**Which approach correctly fetches an OAuth2 token for the cluster API?**

- **a)** Use Camunda's documented OAuth2 flow: POST to the Auth0 token endpoint with `client_id`, `client_secret`, `audience` (the cluster's audience URL), and `grant_type=client_credentials`. The response contains an access token; pass it as `Authorization: Bearer <token>` to the API. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **b)** Use the cluster's username/password basic auth. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **c)** No authentication needed for the Orchestration Cluster API; it's open. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **d)** Use an API key passed as a query parameter. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 SaaS uses OAuth2 client-credentials grant: provision an API Client in Console for the cluster, get client_id + client_secret, exchange for access token at the auth endpoint, use as Bearer token. Standard OAuth2 flow.

- **Option b) — Incorrect.** Username/password basic auth is not the SaaS authentication model.

- **Option c) — Incorrect.** All cluster APIs require auth.

- **Option d) — Incorrect.** Camunda 8 SaaS uses OAuth2 Bearer tokens, not query params.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. OAuth2 client-credentials е canonical.
- **b) 1/10** — wrong auth model.
- **c) 1/10** — невярно — auth required.
- **d) 1/10** — wrong auth model.

**Correct Answer:** OAuth2 client-credentials flow with Bearer token.

**Official Documentation Link:** https://docs.camunda.io/docs/guides/setup-client-connection-credentials/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Java backend + Orchestration Cluster API + SaaS" → разпознаваш che се иска **OAuth2 client-credentials**.

**Въпросът → Solution Framing.** "Correctly fetches OAuth2 token" — изпитва се auth model knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SaaS използва OAuth2, знаеш че client-credentials grant е canonical, знаеш че няма basic auth и query API keys. Това е знание за SaaS authentication.

---

## Question 53: Managing the Development Process (Weighting: 15%)

**Scenario:** A process instance has an active **Incident** because a Service Task's worker repeatedly fails (NullPointerException in handler). The team fixes the worker code and redeploys. The process instance now needs to **resume** from the failed point — restart the worker activation.

**Which Operate action resumes a process instance after fixing the underlying cause?**

- **a)** **Resolve the Incident** in Operate. This sets the job's retries back to the configured value (e.g., 3) and Zeebe re-activates the job; the now-fixed worker picks it up and completes. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **b)** Cancel and restart the process instance. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/operate-actions/)

- **c)** Modify the instance to skip the failed task. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/modify-instance/)

- **d)** Redeploy the BPMN; existing instances auto-resume. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** "Resolve Incident" in Operate is the canonical action: sets job retries back to configured value, Zeebe re-activates the job, the fixed worker (now running with patched code) picks up and processes successfully. Instance continues from where it failed.

- **Option b) — Overkill.** Cancelling loses all process state and history; Resolve Incident is cleaner.

- **Option c) — Wrong action.** Modify to skip is for cases where you don't want to retry — not the standard "fix-and-retry" flow.

- **Option d) — Misconception.** Redeploying the BPMN doesn't auto-resume incidents; you must explicitly resolve.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Resolve Incident е canonical recovery action.
- **b) 3/10** — overkill (loses state).
- **c) 3/10** — wrong action (skip ≠ retry).
- **d) 2/10** — misconception (deployment не resolves).

**Correct Answer:** Resolve the Incident in Operate.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Worker fixed + resume from failed point" → разпознаваш che се иска **Resolve Incident**.

**Въпросът → Solution Framing.** "Operate action" — изпитва се knowledge на Operate features.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Resolve Incident sets retries + re-activates, знаеш че Cancel loses state, знаеш че Modify-skip е different intent, знаеш че Deploy doesn't auto-resolve. Това е знание за Operate Incident handling.

---

## Question 54: Managing the Development Process (Weighting: 15%)

**Scenario:** A production process model `order-fulfillment` v1 has 500 active instances. The team wants to deploy v2 with a fixed bug in a downstream Service Task. They want existing instances to continue with v1 logic until completion, but new instances to use v2.

**Which Camunda 8 deployment behavior fits this scenario?**

- **a)** Deploy v2 — by default, **already-running instances continue on their original version (v1)** until completion. New instances created after v2 deployment use v2. No migration is required for this scenario. Documentation: [Process Versioning](https://docs.camunda.io/docs/components/concepts/process-instance-versioning/)

- **b)** All running instances auto-migrate to v2 upon deployment; old version disappears. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

- **c)** Must explicitly migrate each instance one-by-one. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **d)** Cancel all v1 instances; only one version can exist. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe's default versioning: when you deploy v2 of a process with the same `id`, running instances pinned on v1 continue executing the v1 model. New instance starts after v2 deployment use v2. This is the safe default — bug fixes don't disrupt in-flight work.

- **Option b) — Incorrect.** No auto-migration; this would be unsafe for many fixes.

- **Option c) — Misleading.** Migration is supported but not required for this scenario.

- **Option d) — Incorrect.** Multiple versions coexist by design.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Default versioning preserves running instances.
- **b) 1/10** — невярно — no auto-migration.
- **c) 4/10** — misleading (not required).
- **d) 1/10** — невярно — versions coexist.

**Correct Answer:** Already-running instances continue on v1; new instances use v2.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/process-instance-versioning/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Existing instances continue v1 + new use v2" → разпознаваш che се иска **default versioning behavior**.

**Въпросът → Solution Framing.** "Deployment behavior fits" — изпитва се Process Versioning knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe versions coexist, знаеш че instances pinned on deployment version, знаеш че auto-migration не е default, знаеш че migration не е required. Това е знание за Process Versioning.

---

## Question 55: Managing the Development Process (Weighting: 15%)

**Scenario:** A process model has 4 Service Tasks. The team is testing it before production: they want to execute the process step-by-step **without deploying** to a cluster — verifying logic, FEEL expressions, gateway routing — using sample variables.

**Which Camunda 8 feature enables this local simulation?**

- **a)** **Play mode** in Web Modeler — execute the BPMN against a sandbox runtime without deploying to production. Step through tasks, inject variables, observe routing. Useful for validation before deployment. Documentation: [Play](https://docs.camunda.io/docs/components/modeler/web-modeler/play-your-process/)

- **b)** Operate's "Test Run" tab on the process definition. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Tasklist's simulation mode. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **d)** No simulation; must deploy to a dev cluster. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Play** in Web Modeler is the canonical pre-deployment simulator. It runs the BPMN in a sandbox cluster, lets the modeler set initial variables, executes tasks step-by-step with mocked outputs (for tasks that would call real workers), and visualises flow execution.

- **Option b) — Incorrect.** Operate is for live monitoring, not simulation; "Test Run" doesn't exist as a feature there.

- **Option c) — Incorrect.** Tasklist is for User Tasks; no simulation mode.

- **Option d) — Outdated.** Play replaces the dev-cluster-only workflow.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Play mode е canonical pre-deploy simulator.
- **b) 2/10** — Operate е live monitoring.
- **c) 2/10** — Tasklist е runtime task UI.
- **d) 3/10** — outdated (Play replaces).

**Correct Answer:** Play mode in Web Modeler.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/play-your-process/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Local simulation + no deploy" → разпознаваш che се иска **Play**.

**Въпросът → Solution Framing.** "Enables local simulation" — изпитва се feature awareness.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Play е canonical pre-deploy simulator, знаеш че Operate е live monitoring, знаеш че Tasklist е task UI. Това е знание за Play feature.

---

## Question 56: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's process model has accumulated 12 versions across 6 months. Looking at v8, the team wants to compare it against v7 to see what changed.

**Which Web Modeler feature shows version-to-version differences?**

- **a)** **Version history with diff view** — Web Modeler tracks all saved versions and displays diffs between any two versions (BPMN element-level changes, attribute changes, removed/added elements). Documentation: [Versioning](https://docs.camunda.io/docs/components/modeler/web-modeler/versions/)

- **b)** Git-style external diff; copy BPMN XML to compare. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** No version history; the modeler only shows current. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** Operate's process definition comparison. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler's version history feature shows all versions chronologically and provides a diff view comparing any two versions — visual highlighting of added, removed, or changed BPMN elements.

- **Option b) — Workable but unnecessary.** Web Modeler has built-in diff; external diff isn't needed.

- **Option c) — Incorrect.** Web Modeler maintains version history.

- **Option d) — Incorrect.** Operate doesn't have BPMN-element-level diff comparison; it's runtime monitoring.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Version history + diff е built-in.
- **b) 4/10** — workable workaround but unneeded.
- **c) 1/10** — невярно — history exists.
- **d) 2/10** — wrong feature scope.

**Correct Answer:** Version history with diff view.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/versions/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Compare v8 against v7" → разпознаваш che се иска **version diff**.

**Въпросът → Solution Framing.** "Version-to-version differences" — изпитва се Web Modeler versioning feature.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler има version history + diff, знаеш че external diff е workaround, знаеш че Operate е runtime monitoring. Това е знание за Web Modeler versioning.

---

## Question 57: Managing the Development Process (Weighting: 15%)

**Scenario:** A team manually starts a process instance via Operate (for testing). When prompted for initial variables, they must provide a JSON object. The variable schema requires `customer: {id: string, tier: string}`, `items: list of {sku, qty}`.

**What is the correct JSON shape for these variables?**

- **a)** A flat JSON object: `{"customer": {"id": "C123", "tier": "GOLD"}, "items": [{"sku": "A1", "qty": 2}]}`. JSON object keys map to process variable names; nested objects and arrays are FEEL contexts and lists. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **b)** Newline-separated key-value pairs. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** XML with variable name as attribute. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** YAML with type declarations. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 process variables are JSON. Operate's manual-start UI takes a JSON object where each top-level key becomes a process variable. Nested objects and arrays map naturally to FEEL contexts and lists.

- **Option b) — Incorrect.** Not the format.

- **Option c) — Incorrect.** Not XML.

- **Option d) — Incorrect.** Not YAML.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. JSON е canonical.
- **b) 1/10** — wrong format.
- **c) 1/10** — wrong format.
- **d) 1/10** — wrong format.

**Correct Answer:** Flat JSON object with top-level keys as variables; nested objects and arrays for FEEL contexts/lists.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Initial variables JSON" → разпознаваш che се иска **JSON shape**.

**Въпросът → Solution Framing.** "Correct JSON shape" — изпитва се knowledge на variable format.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 8 variables са JSON, знаеш че top-level keys мапват към variables, знаеш че nested objects/arrays = FEEL contexts/lists. Това е знание за variable JSON shape.

---

## Question 58: Managing the Development Process (Weighting: 15%)

**Scenario:** A team must investigate why a `process-application` instance took 4 hours to complete when normal time is 30 minutes. They open Operate.

**Which Operate views best aid this duration investigation?**

- **a)** Open the instance detail; review the **execution timeline / flow node duration** to identify which task took the longest. Operate shows per-task duration so a stuck or slow task is immediately visible. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/process-instance-details/)

- **b)** Look at Optimize's process duration KPI — Operate doesn't have task-level timing. Documentation: [Optimize](https://docs.camunda.io/docs/components/optimize/)

- **c)** Re-deploy the BPMN with debug enabled to capture timing. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

- **d)** Use the gRPC Zeebe API to dump raw events. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's instance detail view shows the execution timeline with per-flow-node start/end timestamps and durations. For a slow instance, the slow task is immediately visible in the timeline — start with that.

- **Option b) — Misleading.** Optimize aggregates KPIs across many instances; for a single slow instance, Operate's per-instance view is the right tool. Operate does have task-level timing.

- **Option c) — Wrong approach.** No "debug mode" needed; timing is always recorded.

- **Option d) — Overkill.** Raw gRPC events are deep diagnostic; Operate's UI is the right starting point.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Operate instance detail timeline е canonical.
- **b) 4/10** — wrong tool for single instance.
- **c) 1/10** — invented mode.
- **d) 3/10** — overkill.

**Correct Answer:** Open the instance detail in Operate; review the execution timeline / flow node duration.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-details/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Investigate 4-hour duration" → разпознаваш че се иска **Operate timeline view**.

**Въпросът → Solution Framing.** "Operate views aid investigation" — изпитва се knowledge of Operate UI.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate има per-flow-node timing, знаеш че Optimize е aggregate KPIs, знаеш че няма debug mode flag, знаеш che gRPC raw е overkill. Това е знание за Operate views.

---

## Question 59: Managing the Development Process (Weighting: 15%)

**Scenario:** A team accidentally started an instance of `dev-test-process` in production (wrong cluster). The instance is stuck waiting on a User Task that will never be completed because no one will work on it. They want to **terminate** this instance cleanly so it doesn't appear in active counts.

**Which Operate action ends the instance?**

- **a)** **Cancel process instance** — terminates execution. Operate provides this action; the instance moves to "Cancelled" state. Historical record preserved. Documentation: [Operate cancel](https://docs.camunda.io/docs/components/operate/userguide/operate-actions/)

- **b)** Delete the BPMN definition; instances auto-cancel. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

- **c)** Set retries to 0 on the User Task. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Wait for the User Task due date; instance auto-fails. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** "Cancel process instance" in Operate cleanly terminates the instance — Zeebe transitions it to Cancelled state. Historical record preserved in Operate for audit. The standard cleanup action.

- **Option b) — Wrong action.** Deleting BPMN doesn't cancel running instances.

- **Option c) — Wrong mechanism.** User Tasks don't have retries on job-completion semantics relevant here.

- **Option d) — Wrong action.** User Task due dates surface as metadata, not auto-fail.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Cancel instance е canonical termination.
- **b) 2/10** — wrong action.
- **c) 2/10** — wrong mechanism for User Tasks.
- **d) 2/10** — due date ≠ auto-fail.

**Correct Answer:** Cancel process instance in Operate.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/operate-actions/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Terminate stuck instance" → разпознаваш che се иска **Cancel action**.

**Въпросът → Solution Framing.** "Ends the instance" — изпитва се Operate action knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Cancel е canonical termination, знаеш че BPMN delete не cancels instances, знаеш че User Task retries е different concept, знаеш che due date ≠ auto-fail. Това е знание за Operate Cancel.

---



# Section 8 — Dev Environment Setup (Question 60)

> Weight 1% • Topics: Camunda 8 Run, Docker Compose, ports, environment variables, basic auth dev setup.

---

## Question 60: Dev Environment Setup (Weighting: 1%)

**Scenario:** A developer wants to run a local Camunda 8 environment on their laptop for fast development iteration — Zeebe broker, Operate, Tasklist, Identity, Connectors. They want a **single-binary setup** that bundles everything, no Docker required.

**Which Camunda 8 distribution fits this use case?**

- **a)** **Camunda 8 Run** — a single binary that bundles Zeebe + Operate + Tasklist + Identity + Connectors + Elasticsearch in one launchable package. Designed for local development and proof-of-concept work. Run with `./start.sh` (Linux/Mac) or `.\start.bat` (Windows). Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **b)** Camunda 8 SaaS local trial cluster. Documentation: [SaaS](https://docs.camunda.io/docs/components/concepts/clusters/)

- **c)** Docker Compose with the full Camunda 8 stack. Documentation: [Docker Compose](https://docs.camunda.io/docs/self-managed/setup/deploy/local/docker-compose/)

- **d)** Helm chart deployed to a local Kubernetes cluster (e.g., kind). Documentation: [Helm](https://docs.camunda.io/docs/self-managed/setup/install/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Camunda 8 Run** is purpose-built for fast local development: single binary, no Docker required, bundles all components, starts in seconds. It's the recommended "I want to try / iterate fast" distribution. Once started (typical ports: 8080 Operate, 8082 Tasklist, 26500 Zeebe gRPC), the developer can deploy processes immediately.

- **Option b) — Wrong scope.** SaaS is cloud; the question is local.

- **Option c) — Workable but heavier.** Docker Compose requires Docker; the question explicitly excludes Docker.

- **Option d) — Overkill.** Helm + kind is a heavier setup for production-like local dev, not "fastest iteration."

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Camunda 8 Run е single-binary за local dev.
- **b) 2/10** — wrong scope (cloud).
- **c) 5/10** — workable but requires Docker.
- **d) 4/10** — overkill за fastest iteration.

**Correct Answer:** Camunda 8 Run — single binary bundling all components.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Single-binary + no Docker + local dev" → разпознаваш che се иска **Camunda 8 Run**.

**Въпросът → Solution Framing.** "Distribution fits this use case" — изпитва се knowledge на C8 distribution options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 8 Run е single-binary, знаеш че SaaS е cloud, знаеш че Docker Compose изисква Docker, знаеш че Helm/kind е overkill. Това е знание за C8 distributions.

---

# Закриваща секция — Тренировъчни препоръки за Set 3

**Чек-лист за самопроверка (60 въпроса = 100% на изпита Camunda 8 C8-CP-DV):**

| Секция | Q-range | Брой | Тегло |
|---|---|---|---|
| 1. Modeling | Q1-Q9 | 9 | 15% |
| 2. Configuring Processes | Q10-Q22 | 13 | 22% |
| 3. Decisions & DMN | Q23-Q29 | 7 | 11% |
| 4. Configuring Forms | Q30-Q32 | 3 | 5% |
| 5. Configuring Connectors | Q33-Q36 | 4 | 6% |
| 6. Extensions & Integrations | Q37-Q50 | 14 | 25% |
| 7. Managing Development | Q51-Q59 | 9 | 15% |
| 8. Dev Environment | Q60 | 1 | 1% |
| **TOTAL** | **Q1-Q60** | **60** | **100%** |

**Време за изпита:** 75 минути → ≈ 1 минута 15 секунди на въпрос.

**Праг за полагане:** 65% → минимум 39 от 60 верни.

**Препоръка за тренировка:**
1. **Първи проход (open-book):** работи бавно, чети 🔍 Explanations + Three-Skills Decomposition. Не таймирай.
2. **Втори проход (timed, closed-book):** 75-минутен таймер, отбележи отговорите си преди да погледнеш Correct Answer. Цел: ≥ 39/60.
3. **Анализ на грешки:** за всяка грешка попитай "коя skill ми липсваше — Diagnostic Comprehension, Solution Framing или Mechanism Knowledge?" — насочи следващото четене.

**Чести грешки в Set 3 (грешен axis вместо грешен отговор):**
- Q15 (Element Templates) → погрешно избиране на team-shared scope вместо org-shared scope.
- Q19 (AI Agent vs Ad-hoc) → погрешно избиране на Ad-hoc когато прагматично се иска ИЛ orchestration → AI Agent Connector.
- Q22 (Non-interrupting Escalation) → грешка между interrupting и non-interrupting boundary semantics.
- Q34 (SQS Inbound) → ловушка "messages consumed but no instance" — забравяне на BPMN wiring.
- Q44 (status enum vs BPMN errors) → погрешно използване на BPMN Errors за бизнес-резултати.

**Успех!**

