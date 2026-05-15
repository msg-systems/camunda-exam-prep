# Camunda 8 C8-CP-DV — Full Mock Exam (60 Questions, v2.0)

> **Версия:** v2.0 (May 2026) | **Базиран на:** Exam Blueprint v8.8.0 | **Стил:** scenario-first, mechanism-explained, antithetical contrast, per-option 1-10 scoring, three-skills decomposition
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

**Reading guide:**
- Each question fits ≈ 1 screen scroll
- Per-option **1-10 scoring** appears in Bulgarian after explanations
- **🧠 Three-Skills Decomposition** в края на всеки въпрос показва кои 3 умения тества (Diagnostic Comprehension / Solution Framing / Mechanism Knowledge & Trade-off Reasoning)
- Strict exam-simulation mode: read scenario + question + options, pick one, THEN scroll to explanations

---

# Section 1 — Modeling (Questions 1-9)

> Weight 15% • Topics: Pools & Lanes, 7 task types, 4 gateway types, 7 event types × 3 positions, 4 subprocess types, Multi-Instance marker.

---

## Question 1: Modeling (Weighting: 15%)

**Scenario:** A European travel platform orchestrates package bookings — airline ticket (Sabre), hotel (Booking.com), car rental (Hertz) — in a Camunda 8 Self-Managed process handling about 8,000 packages per day. Each external API has its own failure profile (~0.5% / 2% / 0.8%), and the three calls are currently modeled as three sequential Service Tasks.

Last month the operations team identified a recurring failure: when the car rental call fails after airline and hotel have already succeeded, the rollback path (an Error Boundary Event leading to "Cancel Airline" → "Cancel Hotel" Service Tasks) sometimes leaves the customer with **orphaned bookings**. If "Cancel Airline" itself fails — Sabre temporarily down — "Cancel Hotel" still runs but the airline remains valid, with no retry, no audit trail of which compensations succeeded, and no way to resume rollback cleanly without manual Operate intervention.

The architecture team wants a robust **Saga pattern** where rollback ordering, per-step retry, and audit trail are handled by the BPMN engine itself rather than ad-hoc error logic.

**Which BPMN pattern should the developer use to model this Saga?**

- **a)** Place all three booking Service Tasks inside a **Transaction Subprocess**. Attach a **Compensation Boundary Event** with a dedicated **Compensation Handler** Service Task to each booking, then throw a **Compensation End Event** when any booking fails. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **b)** Wrap the three bookings in a regular subprocess and add an **Event Subprocess** with a **non-interrupting Error Start Event** that runs all three cancellation Service Tasks in parallel via a Parallel Gateway. Documentation: [Event Subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

- **c)** Replace the booking Service Tasks with **Send Tasks** and add matching **Receive Tasks** for cancellation acknowledgements, correlating each pair via `order_id` so the engine waits for explicit cancellation responses. Documentation: [Send/Receive Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/tasks/)

- **d)** Convert the three bookings into a **Parallel Multi-instance Subprocess** with one instance per booking type, where each instance contains an Exclusive Gateway that conditionally routes to its own cancellation path when the booking fails. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Transaction Subprocess + Compensation Boundary + Compensation Handler is the BPMN-standard Saga pattern. Each completed booking automatically **registers its compensation handler** with the engine. The Compensation End Event triggers a **reverse-order (LIFO) walk** through registered handlers, executing each as a separate tracked activity. This delivers automatic ordering, per-handler retry through Zeebe's incident mechanism, and a full audit trail in Operate.

- **Option b) — Incorrect.** Event Subprocess with a non-interrupting Error Start handles **error notification**, НЕ **transactional rollback**. No engine-managed compensation registration, no reverse-order execution, no per-activity audit linkage. Running cancellations through a Parallel Gateway also breaks audit — failures appear as gateway branches, not as named compensation activities.

- **Option c) — Incorrect.** Send/Receive correlation is a real Camunda 8 feature for **async message-based integration**, НЕ **transactional rollback**. The engine waits for explicit response messages, adding latency without delivering BPMN compensation semantics. Audit appears as message events, not registered compensations, and ordering must be re-encoded in the flow.

- **Option d) — Incorrect.** Parallel Multi-instance is for **parallel execution of similar work**, НЕ **coordinated rollback across heterogeneous activities**. Three different APIs and three different cancellation procedures waste the MI abstraction. MI also gives no reverse-order rollback semantics; if hotel must be cancelled before airline, you encode that order yourself — which is exactly what Compensation gives you for free.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Compensation Subprocess е BPMN-стандартният Saga; LIFO + per-handler retry + audit идват автоматично.
- **b) 4/10** — Event Subprocess решава error notification, НЕ rollback orchestration. Липсва registered-handler механика.
- **c) 3/10** — Send/Receive correlation е real feature на **wrong axis** — за async messaging, не за transactional rollback.
- **d) 2/10** — Multi-instance е за similar parallel work, не за heterogeneous rollback. Грешен tool за задачата.

**Correct Answer:** Place all three booking Service Tasks inside a Transaction Subprocess. Attach a Compensation Boundary Event with a dedicated Compensation Handler Service Task to each booking, then throw a Compensation End Event when any booking fails.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Пробиваш през "3 sequential API calls + orphaned bookings + no retry + no audit" → разпознаваш че проблемът е **Saga rollback orchestration**, не error handling, не concurrency. Triото "ред + retry + audit trail" сочи към BPMN Compensation, не към generic Error Boundary.

**Въпросът → Solution Framing.** "Saga pattern" в въпроса е подсказка — трябва да го разпознаеш като **BPMN термин**, не microservices Saga library. "Engine-managed" изключва решения с custom orchestration код (option c). Ако четеш "Saga" като generic distributed-transactions buzzword → губиш фокуса.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Compensation Boundary регистрира handler **при завършване** на activity-то (не при start), Compensation End Event инициира **LIFO walk** на registered handlers, Event Subprocess няма compensation semantics — само error notification, Multi-instance е за similar work не за heterogeneous activities, Send/Receive е async messaging не transactional rollback. Това е BPMN state-machine знание, не познаване на елементи от диаграмата.

---

## Question 2: Modeling (Weighting: 15%)

**Scenario:** A B2C insurance platform processes claim submissions through Camunda 8 SaaS. After a claim is received, the system sends an SMS asking the claimant to upload supporting photos via a secure link. The process must wait for **either** the photo upload (a Message correlated by `claim_id`) **or** a **48-hour timeout** — whichever happens first. If photos arrive in time, the flow proceeds to "Auto-assess Claim"; if the timer fires first, the flow routes to "Send Reminder + Re-prompt".

The current model uses a Parallel Gateway with two parallel paths — one waiting on a Message Catch Event, one with a Timer — joined by an Exclusive Gateway. This is producing strange behaviour in Operate: after a successful photo upload, the timer path **continues to count down** for the full 48 hours, leaving a stale token in the process and occasionally firing the Reminder days after the claim was already processed.

The developer needs to model "wait for the first of two events to fire, and cancel the other" cleanly.

**Which BPMN element correctly models this requirement?**

- **a)** An **Event-Based Gateway** with two catching events attached: a Message Catch Event (photo upload) and a Timer Catch Event (48h). Whichever fires first activates its outgoing flow and **cancels the other catching event**. Documentation: [Event-Based Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/)

- **b)** An **Inclusive Gateway** with two conditional flows — one checking `photos_received = true`, one checking `time_elapsed >= 48h` — joined by another Inclusive Gateway downstream. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **c)** A **Receive Task** with an attached **Interrupting Timer Boundary Event** set to 48 hours. If the message arrives first, the task completes; if the timer fires first, the task is cancelled and flow follows the boundary path. Documentation: [Receive Tasks + Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks/)

- **d)** A **Parallel Gateway** with two paths (one Message, one Timer) joined by a **Terminate End Event** in each branch, so whichever path completes first terminates the process. Documentation: [Terminate End Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Event-Based Gateway is the BPMN construct designed exactly for this "wait for the first of N events, cancel the rest" pattern. When the token reaches the gateway, it subscribes to all attached catching events simultaneously. The **first event to fire claims the token** and the gateway **automatically unsubscribes** from the remaining events — no stale timers, no leaked tokens, no duplicate work downstream.

- **Option b) — Incorrect.** Inclusive Gateway evaluates **boolean conditions on variables**, НЕ **awaits events**. It doesn't wait at all — it evaluates immediately and routes based on current variable state. You would need a separate waiting mechanism (timer, receive task) to populate `photos_received` and `time_elapsed`, which puts you back at the original broken design.

- **Option c) — Partially viable but inferior.** Receive Task + Interrupting Timer Boundary technically models "wait for message OR timeout" with cancellation semantics — the boundary event cancels the task and the timer firing replaces it with the boundary path. The pattern works for a single message, but it doesn't generalise to "wait for the first of THREE OR MORE events" and it conflates the task with the wait (Receive Task is a wait state, not work). Event-Based Gateway is the idiomatic BPMN choice.

- **Option d) — Incorrect.** Parallel Gateway opens **both paths simultaneously** and both run independently until completion — exactly the broken behaviour described in the scenario. Adding Terminate End Events would kill the entire process instance the moment either path completes, including in-flight downstream activities — wrong scope, wrong semantics.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Event-Based Gateway е BPMN-стандартът за "first of N events, cancel the rest".
- **b) 3/10** — Inclusive Gateway оценява условия, НЕ чака събития. Грешен construct за timing problem.
- **c) 6/10** — работещ pattern за един message, но не идиоматичен; не се мащабира до 3+ events.
- **d) 1/10** — Parallel Gateway копира оригиналния bug (две независими нишки). Terminate End Event е грешен scope.

**Correct Answer:** An Event-Based Gateway with two catching events attached: a Message Catch Event (photo upload) and a Timer Catch Event (48h).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Сигналите са "wait for either ... or ...", "whichever happens first", "stale token continues counting" → разпознаваш race-between-events pattern + cancellation requirement. Не е error handling, не е parallel work — а "first wins, cancel the others".

**Въпросът → Solution Framing.** "Cancel the other" в въпроса е критичното — изключва всеки construct, който не дава автоматично отписване от unsubscribe-нати events. Това отрязва Parallel Gateway (опция d) и Inclusive Gateway (опция b) веднага.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Event-Based Gateway прави **subscribe-to-all-then-unsubscribe-on-first-fire** автоматично, знаеш че Inclusive Gateway оценява **synchronous condition expressions** не events, знаеш че Receive Task + Boundary е viable за single-event-with-timeout но не се обобщава, знаеш че Parallel Gateway пуска паралелни **независими** branches. Това е разбиране на event subscription lifecycle в Zeebe, не познаване на иконите.

---

## Question 3: Modeling (Weighting: 15%)

**Scenario:** A customer support platform models its ticket lifecycle in Camunda 8. After a User Task "Investigate Ticket" is assigned to an agent, the SLA requires the agent to start the investigation within 4 hours. If 4 hours pass without the agent claiming the task, the system must **escalate** by notifying the team lead **without cancelling the underlying task** — the original agent should still be able to claim it. If another 8 hours pass after escalation (12h total) and the task is still unclaimed, the system must **cancel** the original task and reassign to a senior agent via a different path.

The developer is debating how to attach two timers — one for "soft escalation at 4h" (notify only) and one for "hard cancel at 12h" (reroute flow) — to the same User Task.

**Which combination of Boundary Events models this requirement correctly?**

- **a)** Attach two **Non-interrupting Timer Boundary Events** to the User Task — one at 4h (notify team lead), one at 12h (reassign). Documentation: [Non-interrupting Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **b)** Attach one **Non-interrupting Timer Boundary Event** at 4h (notify team lead, task continues) and one **Interrupting Timer Boundary Event** at 12h (cancel task, reroute flow). Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** Attach one **Interrupting Timer Boundary Event** at 4h that cancels the task and triggers a Service Task "Notify Team Lead" → then re-instantiates the User Task with a new 8h deadline. Documentation: [Interrupting Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **d)** Place the User Task inside an Event Subprocess and attach two **Timer Start Events** (non-interrupting at 4h, interrupting at 12h) to the event subprocess. Documentation: [Event Subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

**🔍 Explanations & Correct Answer**

- **Option a) — Incorrect.** Two non-interrupting boundaries would fire both notifications correctly, but **neither cancels the User Task at 12h** — both fire and the task continues indefinitely. The requirement says "hard cancel at 12h" which requires an **interrupting** boundary; this option misses the interrupt semantics.

- **Option b) — Correct.** Non-interrupting + Interrupting on the same activity is the canonical "soft warning then hard timeout" pattern. The **non-interrupting** boundary at 4h spawns a **new token** following its outgoing flow ("Notify Team Lead") while leaving the User Task alive and claimable. The **interrupting** boundary at 12h **cancels the User Task** and the token follows the boundary's outgoing flow — main flow is terminated, boundary path takes over.

- **Option c) — Incorrect.** Cancelling at 4h and re-instantiating breaks the requirement: "the original agent should still be able to claim it." Re-instantiating creates a **new task instance** with a new ID — the original agent's bookmark, claim history, and any partial work are lost. Also adds complexity for no gain.

- **Option d) — Incorrect.** Event Subprocess with Timer Start Events fires when the **enclosing scope** matches the trigger condition, but you cannot attach it to a single User Task — Event Subprocess lives inside a parent scope (process or subprocess), not on an activity. Wrong construct for activity-level timeouts.

**Per-option scoring (1–10):**
- **a) 5/10** — частично вярно (notify работи), но липсва interrupting → задачата не се cancel-ва. Half-solution.
- **b) 10/10** — верен. Mixed boundary types са BPMN-стандартът за "soft warning then hard timeout".
- **c) 3/10** — Cancel + re-instantiate губи task identity. Грешен подход.
- **d) 2/10** — Event Subprocess е scope-level, не activity-level. Грешен construct.

**Correct Answer:** Attach one Non-interrupting Timer Boundary Event at 4h (notify team lead, task continues) and one Interrupting Timer Boundary Event at 12h (cancel task, reroute flow).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Сигналите са две: "notify without cancelling" (= non-interrupting) и "cancel and reroute" (= interrupting). Два различни лимита, две различни поведения на същата активност — класически dual-deadline SLA pattern.

**Въпросът → Solution Framing.** "Without cancelling" в първото изискване и "cancel" във второто са преки маркери на BPMN interrupt семантиката. Ако не разпознаеш разликата като термин в BPMN — отиваш към custom solutions (option c) вместо стандартния construct.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Non-interrupting Boundary **spawn-ва нов token** оставяйки оригиналния жив, знаеш че Interrupting Boundary **отнема token-а от активността** и затваря scope-а, знаеш че може да закачиш няколко boundaries на едно и също activity (всеки независимо), знаеш че Event Subprocess е scope-level не activity-level. Това е знание за token lifecycle в Zeebe.

---

## Question 4: Modeling (Weighting: 15%)

**Scenario:** A multi-product fintech company runs three different lending processes (consumer loans, business loans, mortgage applications) in Camunda 8. All three need to perform an identical 6-step **KYC (Know Your Customer) verification** — ID document validation, address verification, AML screening, sanctions check, PEP check, and risk-score computation. Currently each lending process has its own copy of these 6 steps inline; when compliance requires a change (e.g., new sanctions list provider), the dev team has to update three places and frequently misses one.

The team wants to **extract KYC into a single reusable BPMN model** that all three lending processes invoke. Versioning matters: when KYC v3 is deployed, **in-flight loan applications already past the KYC stage must continue using whatever version they started with**, while new applications use v3.

**Which BPMN construct should the developer use to model the reusable KYC?**

- **a)** Convert KYC into an **Embedded Subprocess** inside each lending process. Use **Element Templates** in Web Modeler so all three subprocess copies share the same XML configuration. Documentation: [Element Templates](https://docs.camunda.io/docs/components/concepts/element-templates/)

- **b)** Deploy KYC as a standalone process and invoke it from each lending process via a **Call Activity** referencing the KYC process by `processId`. Each invocation starts a separate KYC process instance, which the caller waits on. Documentation: [Call Activities](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **c)** Model KYC as a **Multi-Instance Subprocess** where the input collection contains the 6 check types and each iteration runs one verification. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Implement KYC as a **Custom Connector** built with the Connector SDK and invoke it from a single Service Task in each lending process. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Incorrect.** Element Templates standardise **configuration of a single element**, НЕ **reusable process logic across multiple processes**. Three Embedded Subprocesses with identical Element Templates still means three copies of the same 6-step flow — change propagation is still three deployments, three test cycles, three version-skew risks. Templates aren't a substitute for true model reuse.

- **Option b) — Correct.** Call Activity is the BPMN-standard construct for **invoking a deployed process from another deployed process**. The caller waits at the Call Activity; the callee runs as a **separate process instance** with its own version and its own variables (mapped via Call Activity input/output). Versioning naturally works: in-flight loan applications hold a reference to the KYC version they originally invoked, while new applications pick up the latest deployed version of KYC. One model, three callers, clean version isolation.

- **Option c) — Incorrect.** Multi-Instance executes the **same activity N times** with different inputs from a collection. Here we have **6 different verification steps with different inputs, different external systems, and different error handling**, not 6 instances of the same task. Wrong abstraction.

- **Option d) — Incorrect.** Connector SDK is for **single-call integrations with external systems**, не **multi-step process logic with internal flow control and audit trail**. A Service Task wrapped around a custom Connector hides the 6 KYC steps from BPMN — losing audit trail in Operate, losing per-step retry, losing per-step monitoring. Wrong abstraction level for reusable orchestration.

**Per-option scoring (1–10):**
- **a) 3/10** — Element Templates стандартизират config, не цели подпроцеси. Не решава core проблема.
- **b) 10/10** — верен. Call Activity е BPMN-стандартът за model reuse с version isolation.
- **c) 2/10** — Multi-Instance е за повторение на същата задача, не за heterogeneous steps. Грешен construct.
- **d) 4/10** — Connector е real Camunda feature на **wrong axis** — за external integration, не за internal orchestration. Hides BPMN structure.

**Correct Answer:** Deploy KYC as a standalone process and invoke it from each lending process via a Call Activity referencing the KYC process by `processId`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Identical 6 steps in 3 processes" + "in-flight apps must continue with old version" → разпознаваш че проблемът е **model reuse + version isolation**, не configuration sharing, не parallelism. Ключово е, че се иска cross-process reuse, не in-process abstraction.

**Въпросът → Solution Framing.** "Reusable BPMN" и "versioning" в въпроса определят какъв тип reuse се иска — на ниво **deployed process model**, не на ниво snippet. Това отрязва Element Templates веднага (template = config, не model).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Call Activity създава **separate process instance** със собствен version reference, знаеш че Embedded Subprocess живее **вътре в parent-а** (не се reuse-ва), знаеш че Multi-Instance прави **same activity N times** не heterogeneous steps, знаеш че Connector е external integration не internal orchestration. Това е разбиране за scope hierarchy и deployment lifecycle в Zeebe.

---

## Question 5: Modeling (Weighting: 15%)

**Scenario:** A payment processor integrates with a partner bank's REST API to settle interbank transfers. The partner bank enforces a strict **rate limit of 5 requests per second per client** — exceeding the limit returns HTTP 429 and the bank may temporarily blacklist the client for excess violations. The Camunda 8 process currently models settlement as a **Parallel Multi-Instance Service Task** that fans out to call the partner bank API for each of typically 50-200 line items per batch. Under load, the worker fires all multi-instance jobs concurrently, immediately tripping the rate limit and producing cascading 429 retries that drag the whole batch's processing time from seconds to minutes.

The team wants to keep the Multi-Instance abstraction (each line item is naturally one instance) but pace the API calls so the rate limit is respected without 429 storms.

**How should the developer configure the Multi-Instance Subprocess to fix this?**

- **a)** Keep the **Parallel** Multi-Instance and add an Exclusive Gateway after the Service Task that loops back on 429, with a 1-second Timer Catch Event before retry. Documentation: [Exclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **b)** Change the marker from **Parallel** to **Sequential** Multi-Instance. Each line item is processed one at a time in a deterministic order; the natural processing rate stays under the bank's 5 req/sec limit if each call takes ≥200 ms. Documentation: [Sequential Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Keep the Parallel Multi-Instance but configure `zeebe:taskDefinition retries=10` so Zeebe automatically retries the failed jobs after 429 responses. Documentation: [Job retries](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Replace the Multi-Instance with a single Service Task that internally batches the N line items into a single bulk API call to the partner bank. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Partially viable but wasteful.** A loop-back retry with a 1-second timer would eventually respect the rate limit but only **after** firing all N requests in parallel and triggering 429s — the bank may still blacklist for excess violations during the initial burst. Also pollutes the audit trail with N×retries entries in Operate and creates unnecessary Zeebe state churn.

- **Option b) — Correct.** Sequential Multi-Instance processes line items **one at a time, in order**: instance N+1 starts only when instance N completes. Combined with the natural API latency (assuming ~200 ms per call) this produces a sustained request rate at or below 5 req/sec — under the bank's limit by design. No 429s, no retries, predictable throughput. The trade-off is total batch latency (200 × N ms ≈ 40s for 200 items) but that is exactly the throughput ceiling imposed by the rate limit.

- **Option c) — Incorrect.** `retries` configures **how many times Zeebe re-activates a failed job** before creating an incident, не **how fast jobs are dispatched**. With Parallel MI, all N jobs still fire concurrently; if the bank returns 429 they all retry concurrently — same rate-limit violation, possibly worse. This is the classic "wrong axis" pattern: retries solve transient failures, not concurrency control.

- **Option d) — Incorrect.** Bulk API call may sound elegant but the scenario specifies the partner bank's API is **per-line-item** (5 req/sec per client) — there is no bulk endpoint mentioned, and inventing one is outside the developer's control. Also collapses the audit granularity: 200 line items in one call means one Operate row instead of 200, losing per-item retry, per-item incident, per-item observability.

**Per-option scoring (1–10):**
- **a) 5/10** — eventually-correct поведение, но през burst + retries. Risk of blacklist, dirty audit.
- **b) 10/10** — верен. Sequential MI дава вграден backpressure съответстващ на rate limit.
- **c) 3/10** — retries решават transient failures, НЕ rate limiting. Wrong axis.
- **d) 2/10** — измисля API endpoint който не съществува; губи audit granularity.

**Correct Answer:** Change the marker from Parallel to Sequential Multi-Instance.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "5 req/sec rate limit" + "Parallel MI firing concurrently" + "429 storms" → разпознаваш че проблемът е **concurrency control**, не error handling, не retry tuning. Сигнал е, че Camunda трябва да **ограничи скоростта на dispatch**, не да реагира на грешки.

**Въпросът → Solution Framing.** "Pace the API calls" е директната подсказка — търси се конфигурация която променя **темпото на изпълнение**, не error-path. Това веднага отрязва retries (option c) и error-handling loops (option a).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Parallel MI fires **all instances simultaneously** в Zeebe, знаеш че Sequential MI **chains** instance N+1 след instance N, знаеш че `retries` контролира failed-job re-activation, не dispatch rate, знаеш че Multi-Instance audit-trail-ът е per-instance не collapsed. Това е разбиране за MI execution semantics в Zeebe + Camunda's job activation model.

---

*(Section 1 Modeling — 5 of 9 questions complete. Next: Q6-Q9 Modeling continued.)*

<!-- END OF BATCH 1 — file will be appended in subsequent turns -->


## Question 6: Modeling (Weighting: 15%)

**Scenario:** A logistics company models its cross-border parcel handover process as two BPMN Pools — "Origin Carrier" (the company's own Camunda 8 process) and "Destination Customs" (an external government system). The two organisations communicate via four distinct events: the carrier sends a "Manifest Submitted" message, customs returns either "Cleared" or "Hold for Inspection", and the carrier eventually sends a "Package Delivered" notification. The current model attaches Sequence Flows between the two Pools — the carrier's Service Task "Submit Manifest" has an outgoing Sequence Flow drawn directly to the customs Pool's Receive Task "Process Manifest". The model deploys but customs side **never receives the manifest**.

The developer reviews the BPMN 2.0 specification and realises the cross-pool connection is modelled incorrectly. The two organisations are independent systems with independent process engines; the connection must reflect that.

**What is the correct BPMN construct to model communication between two Pools?**

- **a)** Replace the Sequence Flow between the Pools with a **Message Flow**, and ensure the source side uses a **Send Task** or a **Message Throw Event** while the target side uses a **Receive Task** or **Message Catch Event**. Documentation: [BPMN Message Flow](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **b)** Add a Parallel Gateway in the carrier Pool that forks one branch into the customs Pool via a Sequence Flow. Documentation: [Parallel Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **c)** Move the customs Pool into the carrier Pool as a Lane and use Sequence Flows freely between the lanes. Documentation: [Pools & Lanes](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** Use a **Signal Throw Event** in the carrier Pool to broadcast to all listening processes including the customs Pool. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** In BPMN 2.0, **Sequence Flow is intra-pool only** — it expresses token flow within a single process engine. **Message Flow** is the cross-pool construct: it represents asynchronous message passing between separate processes/organisations. On the source side a Send Task or Message Throw Event publishes the message; on the target side a Receive Task or Message Catch Event waits for it. In Zeebe specifically, the receiving side correlates incoming messages by a `correlationKey` expression evaluated against incoming message variables.

- **Option b) — Incorrect.** Parallel Gateway forks a token **within a single process**, НЕ **across organisational boundaries**. Drawing a Sequence Flow out of the gateway into another Pool is exactly the BPMN violation already in the broken model.

- **Option c) — Incorrect.** Lanes are visual subdivisions **within a single Pool** representing roles or responsibilities — they do not separate independent processes. Merging customs (an external government system) into the carrier's Pool would imply Camunda 8 controls customs' execution, which is factually wrong and breaks the separation-of-concerns the BPMN model is supposed to express.

- **Option d) — Incorrect.** Signal Events broadcast to **all listening processes globally**, НЕ specifically to a designated counterparty. A Signal is the BPMN equivalent of a system-wide event bus — used for "any process listening for X should react", not for point-to-point handover. Using a Signal for a manifest submission would also fire for any other process that happens to subscribe.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Message Flow е BPMN-стандартът за cross-pool communication.
- **b) 1/10** — Parallel Gateway forks intra-pool, не cross-pool. Не решава нищо.
- **c) 3/10** — Lanes са visual в same pool, не отделни процеси. Грешна абстракция.
- **d) 4/10** — Signal е real BPMN feature на **wrong axis** — broadcast, не point-to-point handover.

**Correct Answer:** Replace the Sequence Flow between the Pools with a Message Flow, and ensure the source side uses a Send Task or a Message Throw Event while the target side uses a Receive Task or Message Catch Event.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/message-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Two BPMN Pools" + "two independent organisations" + "Sequence Flow drawn between Pools" + "customs never receives" → разпознаваш че проблемът е **BPMN 2.0 violation** (intra-pool vs inter-pool semantics), не Zeebe config, не network. Сигнал е, че двете страни са **независими execution domains**.

**Въпросът → Solution Framing.** "Communication between two Pools" е директна формулировка — търси се construct **специално за cross-pool**, не workaround в same-pool. Това отрязва Parallel Gateway (option b) и Lane consolidation (option c) веднага.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Sequence Flow е **token-passing within a single process engine** (cannot cross pools), знаеш че Message Flow е **async message between separate engines**, знаеш че Signal е **global broadcast** (различна семантика), знаеш че Lanes са **visual subdivision** в same pool. Това е знание за BPMN 2.0 spec, не за Zeebe-specific quirks.

---

## Question 7: Modeling (Weighting: 15%)

**Scenario:** A team migrating from Camunda 7 to Camunda 8 has a complex process containing 15 Script Tasks. In the original Camunda 7 design, these Script Tasks execute embedded **JavaScript snippets** that perform calculations, string manipulation, and date arithmetic on process variables. During the migration to Camunda 8 SaaS, the team imports the BPMN XML into Web Modeler and deploys the process; deployment succeeds but **every Script Task fails at runtime with an "unsupported language" incident** in Operate.

A senior developer reviews the situation and explains that Zeebe (Camunda 8's process engine) does not interpret embedded JavaScript the way the Camunda 7 process engine did. The Script Tasks need to be rewritten using the language Zeebe natively supports.

**Which language must the Script Tasks be rewritten in for Camunda 8?**

- **a)** **FEEL (Friendly Enough Expression Language)** — Zeebe's native expression language. The Script Task's `zeebe:script` configuration carries the FEEL expression and a `resultVariable` for the output. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

- **b)** **Groovy** — historically supported in Camunda's scripting engines; can be enabled in Camunda 8 by importing the Nashorn engine library. Documentation: [Camunda Scripting](https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/)

- **c)** **Java** with annotated classes deployed alongside the process definition. Zeebe scans the deployed JAR and binds Script Tasks to matching method signatures. Documentation: [Zeebe Java Client](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** **Python** — supported via the official Zeebe Python client; Script Tasks delegate to Python functions registered in a worker process. Documentation: [Python Client](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** In Camunda 8, the **Script Task is executed inside the Zeebe broker itself**, not by an external worker, and the only language Zeebe's broker interprets natively is **FEEL**. The Script Task's BPMN configuration carries a `zeebe:script` element with the FEEL expression string and a `resultVariable` name; when the token reaches the task, the broker evaluates the FEEL expression against the current process variables and writes the result to the named variable. No external worker needed, no JVM, no language plugin.

- **Option b) — Incorrect.** Groovy and Nashorn were Camunda 7 scripting integrations on the JVM-based engine. **Camunda 8 has no JVM-side script execution** — Zeebe is a distributed, append-only engine that does not embed scripting languages. This is a classic Camunda-7-reflex distractor.

- **Option c) — Incorrect.** Java workers exist in Camunda 8 (for **Service Tasks**, not Script Tasks). A Script Task can be **redesigned as a Service Task with a Java worker**, but that is a different BPMN element with different semantics — and the question specifies Script Task rewriting, not migration to a different element.

- **Option d) — Incorrect.** Python is a supported community client for **Service Task job workers**, not for Script Tasks. Same wrong-element confusion as option c.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL е Zeebe's единствен native script language за Script Tasks.
- **b) 1/10** — Camunda 7 reflex. Zeebe няма JVM scripting.
- **c) 3/10** — Java workers са за Service Tasks, не Script Tasks. Different BPMN element.
- **d) 3/10** — same wrong-element confusion as option c.

**Correct Answer:** FEEL (Friendly Enough Expression Language) — Zeebe's native expression language.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Camunda 7 to 8 migration" + "embedded JavaScript Script Tasks" + "unsupported language incident" → разпознаваш че проблемът е **Camunda 7 → 8 scripting paradigm shift**, не deployment bug, не XML issue. Камунда 7 има JVM-embedded scripting; Камунда 8 не. Това е fundamental engine difference.

**Въпросът → Solution Framing.** "Native language" в въпроса е критичното — изключва workarounds (custom worker, external runtime) и насочва към embedded броkeр-side execution. Ако четеш "rewritten in" като "any supported runtime" → отиваш към Java/Python workers (option c/d).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Script Task в Zeebe **се изпълнява в самия broker** (не worker), знаеш че FEEL е единственият native broker-side script language, знаеш че Groovy/Nashorn/JavaScript са Camunda 7 reflexes без analog в Zeebe, знаеш че Java/Python clients са **за Service Tasks** (различен BPMN element). Това е знание за Camunda 8 architecture, не за BPMN icons.

---

## Question 8: Modeling (Weighting: 15%)

**Scenario:** A B2B procurement process at a manufacturing company evaluates supplier offers against three independent criteria — price, quality certification, and delivery time — modelled in BPMN as three parallel paths after an Inclusive Gateway. Each path performs its own scoring Service Task; depending on the offer details, **one, two, or all three** paths may activate (the gateway uses FEEL conditions on each outgoing flow). After scoring, the paths must **merge back together** so the downstream "Compute Total Score" task only runs after **all activated paths have completed** — never partial scores.

The current model uses an Exclusive Gateway downstream to merge, which is producing incorrect behaviour: as soon as the first activated path completes, the Exclusive Gateway lets the token through and "Compute Total Score" runs with incomplete data; later-completing paths produce orphaned tokens that never reach the end event.

**Which BPMN construct correctly synchronises only the activated paths back together?**

- **a)** Replace the downstream Exclusive Gateway with an **Inclusive Gateway**. The joining Inclusive Gateway waits for **all incoming activated paths** — but only those that were activated upstream — to complete before letting the token through. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **b)** Replace the downstream Exclusive Gateway with a **Parallel Gateway**. Parallel join always waits for all incoming flows. Documentation: [Parallel Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **c)** Convert the three parallel paths into a **Multi-Instance Subprocess** with a `completionCondition` of "all three completed". Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Keep the downstream Exclusive Gateway but add a Service Task after it that polls the Operate API to verify all three scoring tasks have finished before proceeding. Documentation: [Operate API](https://docs.camunda.io/docs/apis-tools/operate-api/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Inclusive Gateway is BPMN's construct for **conditional fan-out with matching conditional join**. At fan-out, it evaluates the FEEL conditions and activates **only matching paths**. At join, it waits **specifically for the paths that were activated**, ignoring inactive paths — Zeebe tracks the path activation state and the join only requires completion of the originally activated branches. This gives exactly the "wait for all that started, not all defined" semantics.

- **Option b) — Incorrect.** Parallel Gateway always activates **all outgoing paths** at fan-out and waits for **all incoming paths** at join. It does not check activation conditions — if you use it as the join, it will block indefinitely waiting for tokens from paths that were never activated. Wrong dimension: parallel = unconditional, inclusive = conditional.

- **Option c) — Incorrect.** Multi-Instance requires the **same activity repeated** with different inputs. Here we have three **different scoring tasks** with three **different conditions** and three **different outputs**. Wrapping heterogeneous activities into a Multi-Instance is a mismodelling — the abstraction does not fit the work.

- **Option d) — Incorrect.** Operate API is **eventually consistent** and meant for human/admin querying, not for runtime control flow. Polling it from a Service Task introduces latency, race conditions (the poll might see "completed" before all variables are written), and brittle dependence on infrastructure that should be transparent to the BPMN model. Plus it adds a separate worker, monitoring overhead, and a layer that BPMN is designed to eliminate.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Inclusive Gateway join изчаква само активираните branches — точна семантика за condition-based fork-join.
- **b) 4/10** — Parallel винаги fork-ва всичко и join-ва всичко. Грешна семантика за conditional paths; ще се блокира.
- **c) 3/10** — Multi-Instance е за same activity repeated, не три heterogeneous tasks. Wrong abstraction.
- **d) 2/10** — Operate API е query layer, не runtime control. Грешен layer.

**Correct Answer:** Replace the downstream Exclusive Gateway with an Inclusive Gateway.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Conditional parallel paths" + "merge back when activated paths complete" + "Exclusive lets through first" → разпознаваш че проблемът е **conditional fork-join synchronisation**, не error handling, не concurrency control. Триото "conditional fan-out + wait-for-activated-only + clean join" сочи към Inclusive Gateway.

**Въпросът → Solution Framing.** "Only the activated paths" в въпроса е критичното — изключва Parallel Gateway (което чака всички). Ако четеш "merge all paths" без вниманието към conditional → избираш Parallel и счупваш процеса.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Inclusive Gateway fork-ва **conditionally** и join-ва **conditionally** (track-вайки activation), знаеш че Parallel Gateway е unconditional fork-and-join, знаеш че Exclusive е "first-wins" не "wait-for-all", знаеш че Multi-Instance е за repetition не heterogeneous parallel work. Това е разбиране за BPMN gateway семантика и token tracking в Zeebe.

---

## Question 9: Modeling (Weighting: 15%)

**Scenario:** An order management process at an e-commerce platform allows customers to **cancel their order** at any point before fulfillment. The cancellation is initiated by the customer clicking a "Cancel Order" button in their account portal, which publishes a `OrderCancelled` message correlated by `order_id`. When this message arrives, the process must perform a graceful cancellation flow: refund the payment, release inventory, send confirmation email. The cancellation must work regardless of which step the order is currently at — payment processing, picking, packing, or awaiting shipment.

The team wants to model the cancellation handler in a way that **lives alongside the main flow without cluttering it** and **interrupts whatever activity is currently active** when the message arrives. The handler should run only **once per process instance** (multiple cancellation messages should not trigger multiple refunds).

**Which BPMN construct models the cancellation handler correctly?**

- **a)** Wrap the main flow in a Subprocess and add an **Event Subprocess** inside it with an **Interrupting Message Start Event** correlated on `order_id`. When the message arrives, the parent subprocess is cancelled (all active activities terminate) and the event subprocess's flow takes over. Documentation: [Event Subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

- **b)** Attach a **Non-interrupting Message Boundary Event** to every Service Task in the main flow, each routing to a shared "Handle Cancellation" subprocess. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** Place a **Message Catch Event** at the start of the process before the main flow begins. Documentation: [Message Catch Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **d)** Use an **Event-Based Gateway** as the first element in every parallel branch of the main flow, with a Message Catch Event for cancellation on one branch and the next task on the other. Documentation: [Event-Based Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Event Subprocess with an **Interrupting Message Start Event** is the BPMN-canonical pattern for "asynchronous interrupt at any point in a scope". When the `OrderCancelled` message arrives, the parent scope (the outer subprocess) is terminated — Zeebe cancels whichever activity is currently active in the main flow — and the event subprocess's outgoing flow takes over. Because it's Interrupting, it cleans up the scope; because it's a Start Event (not Boundary), it doesn't clutter the main flow visually. Single triggering per scope is the default — once consumed, the message subscription closes.

- **Option b) — Incorrect.** Non-interrupting Boundary on every Service Task means **every task spawns a new parallel token** when the message arrives — that is, the main flow continues processing AND the cancellation handler runs concurrently. Refunding while still picking and packing is exactly the failure mode the scenario forbids. Also clutters the model with N identical boundaries (one per Service Task) — fragile and high maintenance.

- **Option c) — Incorrect.** A Message Catch Event before the main flow would block process start until cancellation arrives — completely backwards semantics. The process would never start the order, just wait for it to be cancelled before it began.

- **Option d) — Incorrect.** Event-Based Gateway models "first of N events wins" at a specific point — not "interrupt at any point". You would have to place this gateway before every task, which clutters the main flow worse than option b, and the gateway semantics (first event consumes the token, others unsubscribe) doesn't match a continuous "any-point" interrupt model.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Event Subprocess + Interrupting Message Start е канонът за async interrupt at any point.
- **b) 3/10** — Non-interrupting Boundary спавнва паралелен token; refund + pick едновременно. Wrong scope semantics.
- **c) 2/10** — Message Catch в началото блокира start. Грешен момент в lifecycle.
- **d) 3/10** — Event-Based Gateway е "point-in-time choice", не "anywhere interrupt". Грешна семантика + clutter.

**Correct Answer:** Wrap the main flow in a Subprocess and add an Event Subprocess inside it with an Interrupting Message Start Event correlated on `order_id`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Cancel at any point" + "interrupts whatever is active" + "once per instance" + "without cluttering main flow" → разпознаваш че проблемът е **scope-level async interrupt**, не per-task error handling, не gateway routing. Триото "any-point + interrupt + single-fire" сочи към Event Subprocess.

**Въпросът → Solution Framing.** "Lives alongside without cluttering" е визуалното изискване — изключва решения с boundary-event-on-every-task (option b). "Interrupts whatever is active" е семантичното — изключва Non-interrupting variants.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Event Subprocess живее **inside a scope** и стартира при изпълнение на trigger, знаеш че Interrupting variant **terminate-ва parent scope**, знаеш че Non-interrupting Boundary **spawn-ва паралелен token** (не отменя), знаеш че Message Catch Event е блокираща wait state, не reactive interrupt. Това е разбиране за scope hierarchy + interrupt semantics в Zeebe.

---

# Section 2 — Configuring Processes (Questions 10-22)

> Weight 22% • Topics: Task configuration for Zeebe execution, gateway/event Zeebe semantics, subprocess + call activity configuration, multi-instance configuration, Document Handling, IDP Applications, Element Templates, AI ad-hoc subprocess / AI agent connector.

---

## Question 10: Configuring Processes (Weighting: 22%)

**Scenario:** A bank's loan origination process includes a User Task "Review Credit Application" that must be **claimable by any member of the "credit-officers" group** but must also allow a specific senior officer to be **pre-assigned** when the loan amount exceeds €500,000. The team configures the User Task in Web Modeler with the following properties:

- `assignee` field set to `=if loanAmount > 500000 then "senior.officer@bank.com" else null`
- `candidateGroups` field set to `=["credit-officers"]`
- `candidateUsers` field left blank

The Tasklist behaviour is partially correct: for loans under €500K the task appears in the Tasklist of all credit-officers group members, who can claim it. But for loans over €500K — where the assignee evaluates to a specific email — the senior officer **does not see the task in their Tasklist** until they manually search by task ID. The team expected the assignee to receive a direct notification and find the task immediately in their personal queue.

**What is the correct understanding of Zeebe's User Task assignment fields?**

- **a)** Setting `assignee` directly assigns the task to that user — the task immediately appears in **only that user's personal queue**, bypassing `candidateGroups`. The senior officer should see it without searching. The fact that they don't suggests a Tasklist UI filter or sync issue, not a model issue. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** `assignee` and `candidateGroups` are **mutually exclusive at runtime** — when `assignee` is set, `candidateGroups` is ignored, and the task is locked to that user. The senior officer must be added as a `candidateUser` for it to appear in their queue. Documentation: [User Task assignment](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** Both `assignee` and `candidateGroups` apply simultaneously: the assignee is the primary owner but the candidateGroups members can also see and claim the task. The senior officer's queue **does** receive the task — the team is mistaken about the Tasklist behaviour. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Zeebe only evaluates `assignee` if `candidateGroups` is empty — since the team set both, `assignee` is silently discarded. The model needs the candidateGroups expression to evaluate to empty when loanAmount > 500K. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Incorrect.** `assignee` does NOT bypass `candidateGroups` semantically. Both fields are written to the task record but Tasklist filters tasks based on the **assignee field** for "My Tasks" view. When `assignee` is set, the task IS in that user's view — but only if the Tasklist's "My Tasks" filter is the active view. The scenario reports the task does not appear, which suggests a real model issue, not just UI.

- **Option b) — Correct.** In Zeebe, `assignee` directly identifies the user-task owner — when set, the task is **claimed** to that user automatically on task creation. Tasklist UI shows it in that user's "My Tasks" queue. `candidateGroups` and `candidateUsers` describe **who CAN claim** an unassigned task; they do not act as an additive visibility list when `assignee` is set. To make the task appear in the senior officer's group-based "Tasks I Can Claim" view, they would need to be a `candidateUser` explicitly, not just an `assignee`. The team's confusion is conflating two different lookup paths.

- **Option c) — Incorrect.** This describes a hybrid model that Zeebe does not implement. The Tasklist filter "Tasks I Can Claim" looks at `candidateUsers` and `candidateGroups` for **unassigned** tasks; once `assignee` is set, the task is claimed and falls under that user's "My Tasks" view.

- **Option d) — Incorrect.** Zeebe does not "silently discard" `assignee` when `candidateGroups` is set — both fields are recorded and both are valid simultaneously. The team's understanding of the precedence is incorrect, but the engine does not throw away the assignee.

**Per-option scoring (1–10):**
- **a) 4/10** — UI filter alibi звучи правдоподобно, но не обяснява консистентното non-appearance.
- **b) 10/10** — верен. Assignee автоматично claim-ва задачата; candidate fields са за unassigned visibility.
- **c) 3/10** — описва hybrid behaviour който Zeebe не implementira.
- **d) 2/10** — Zeebe не discard-ва silently; невярно поведение.

**Correct Answer:** `assignee` and `candidateGroups` are mutually exclusive at runtime — when `assignee` is set, `candidateGroups` is ignored, and the task is locked to that user.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Assignee set" + "candidateGroups also set" + "senior doesn't see in queue" → разпознаваш че проблемът е **Tasklist filter / claim state** не data routing, не network. Сигналът е разминаване между **очаквано visibility** и **runtime claim state**.

**Въпросът → Solution Framing.** "Correct understanding of assignment fields" е директна формулировка — търси се обяснение на **семантиката на полетата**, не workaround. Това отрязва UI alibi (option a).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Tasklist има **два различни** view-а ("My Tasks" филтрира по assignee; "Tasks I Can Claim" филтрира по candidateUsers + candidateGroups), знаеш че `assignee` set означава **автоматично claim** (не "preferred assignee"), знаеш че candidate fields са за **unassigned tasks visibility**, знаеш че Zeebe пише и двете полета simultaneously (не discard-ва). Това е знание за Tasklist UI behaviour + task lifecycle states.

---

## Question 11: Configuring Processes (Weighting: 22%)

**Scenario:** A team builds a Camunda 8 process with a Service Task that calls an external pricing service. The Service Task's `taskDefinition.type` property is set to `"pricing-calculator"`. The team deploys a Java job worker using the Spring Zeebe client annotated with `@JobWorker(type = "pricing-calculator")`. Initial smoke tests work — single instances process correctly. After enabling load testing with 500 concurrent process instances, the worker's logs show heavy job processing but **about 30% of Service Tasks remain stuck in "ACTIVATED" state in Operate for several minutes** before being processed.

The team double-checks that the worker is up, has CPU/memory headroom, and that the broker is healthy. The Job Worker is configured with default settings: `maxJobsActive=32`, `pollInterval=100ms`, `timeout=PT5M`.

**Which configuration change is most likely to resolve the activation lag?**

- **a)** Increase `maxJobsActive` from 32 to 200 so the worker can hold more in-flight jobs simultaneously. Documentation: [Job worker configuration](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Decrease `pollInterval` from 100 ms to 10 ms so the worker polls the broker ten times more frequently for new jobs. Documentation: [Job worker configuration](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Scale out by deploying **multiple worker instances** (replicas) all subscribed to the same `pricing-calculator` job type. Each broker partition can hand jobs to whichever worker polls first. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Increase `timeout` from PT5M to PT15M so Zeebe waits longer before re-activating stalled jobs. Documentation: [Job activation](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Partially viable but limited.** Raising `maxJobsActive` allows the worker to hold more concurrent jobs, but a single JVM worker has finite CPU/threads/connection-pool capacity. At 500 concurrent instances, even with 200 in-flight, you saturate the single worker's outbound HTTP connections to the pricing service. The bottleneck is **single-worker throughput**, not the activation count cap.

- **Option b) — Incorrect.** Job activation in Zeebe is **push-pull hybrid**: the worker maintains a long-poll connection to the broker, and when jobs become available the broker pushes them on the open poll. Polling more frequently does not help when the broker is already delivering jobs as fast as the worker can accept them — and excessive polling can actually overload the broker. The 100 ms default is already aggressive.

- **Option c) — Correct.** **Horizontal scaling** is the canonical Zeebe-friendly answer for activation lag under load. Multiple worker instances all subscribed to the same job type share the work — the broker hands each available job to whichever worker is polling, distributing load across the worker pool. This scales throughput linearly with worker count (until the downstream pricing service itself becomes the bottleneck). Combine with reasonable `maxJobsActive` per worker (32-64 is typical) and the activation lag disappears.

- **Option d) — Incorrect.** `timeout` is the **job lock duration** — how long the broker waits before re-activating a job that a worker started but hasn't completed. Increasing it does NOT change activation latency for waiting jobs — only changes failure recovery semantics. This is the classic wrong-axis distractor: timeout solves lock timing, not activation throughput.

**Per-option scoring (1–10):**
- **a) 5/10** — частично помага, но single worker throughput остава bottleneck.
- **b) 2/10** — pollInterval не е bottleneck; default 100ms е достатъчен. Wrong axis.
- **c) 10/10** — верен. Horizontal scaling е каноничното Zeebe решение за activation throughput.
- **d) 3/10** — `timeout` е lock duration на **wrong axis** — за recovery, не за activation latency.

**Correct Answer:** Scale out by deploying multiple worker instances (replicas) all subscribed to the same `pricing-calculator` job type.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "500 concurrent instances" + "30% stuck in ACTIVATED" + "worker has headroom" → разпознаваш че проблемът е **worker throughput saturation**, не broker congestion, не network. Сигнал е, че single worker не може да обработи activation rate-а на 500 concurrent instances.

**Въпросът → Solution Framing.** "Most likely to resolve" и "activation lag" определят какъв тип fix — нужен е **throughput increase**, не latency tweak. Това отрязва pollInterval (option b) и timeout (option d).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe activation е **push-on-poll** (не traditional polling), знаеш че `maxJobsActive` е per-worker concurrency cap (има finite limit), знаеш че `pollInterval` контролира **idle poll cadence** (irrelevant под load), знаеш че `timeout` е **lock duration не activation latency**, знаеш че horizontal scaling е **canonical answer** в distributed event-driven systems. Това е знание за Zeebe activation lifecycle + general distributed systems principles.

---

## Question 12: Configuring Processes (Weighting: 22%)

**Scenario:** An e-commerce order process publishes a `payment_received` message when the customer's payment is confirmed by the payment gateway. The order process has a Message Catch Event downstream of "Submit Order" that waits for this confirmation. The message correlation is configured with `correlationKey: =orderId` on the Catch Event and the gateway publishes the message with `correlationKey: =orderId` in the payload.

After deploying, the team observes that approximately **20% of orders never advance past the Message Catch Event** even though the payment gateway confirms it sent the message successfully. Operate shows the Message Catch Event waiting; Zeebe's message subscription store shows the message was published but **was not correlated** to any process instance.

Investigation reveals that the payment gateway's `orderId` field is sometimes formatted as an integer (`12345`) and sometimes as a string (`"12345"`), depending on which microservice published it. The order process always stores `orderId` as a string.

**What is the root cause and the fix?**

- **a)** Zeebe's correlation key comparison is **strict-typed** — `12345` (integer) does not correlate to `"12345"` (string) even though the human reader sees them as the same value. The fix is to coerce both sides to the same type in the FEEL expression, e.g., `correlationKey: =string(orderId)`. Documentation: [Message correlation](https://docs.camunda.io/docs/components/concepts/messages/)

- **b)** Zeebe is case-insensitive but type-tolerant — the issue is that `orderId` strings are sometimes capitalised differently. Use `correlationKey: =lower case(orderId)` to normalise. Documentation: [FEEL string functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **c)** Messages are stored with TTL=10 seconds by default in Zeebe; if the Catch Event subscribes after the message is published, the message expires before correlation. Increase the publish TTL on the gateway side. Documentation: [Message TTL](https://docs.camunda.io/docs/components/concepts/messages/)

- **d)** Zeebe correlation only matches the first published message; subsequent messages with the same correlation key are silently discarded. The 20% loss is from concurrent publishes for the same orderId; deduplicate at the gateway level. Documentation: [Message correlation](https://docs.camunda.io/docs/components/concepts/messages/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe's correlation engine does **strict-typed equality** comparison between the message's `correlationKey` value and the awaiting process instance's `correlationKey` value. The FEEL value `12345` (number) and `"12345"` (string) are different types and do not match. The 20% lost orders are exactly those where the upstream microservice published an integer. The fix is to **coerce types consistently** — either always publish as string (preferred, since processes store as string) using FEEL `string(orderId)`, or normalise on the receiving side.

- **Option b) — Incorrect.** Zeebe's correlation is **case-sensitive** for string comparison (not "case-insensitive"), and there is no type-tolerance — types must match. Adding `lower case()` would only normalise case differences, not type differences, and could itself create new mismatches if the upstream system uses mixed case.

- **Option c) — Incorrect.** Message TTL handles the **subscribe-after-publish race**, but the scenario states the Catch Event was already waiting (subscription exists) when the message was published. TTL is not the issue here. Also, default TTL is configurable per message and not "10 seconds by default" universally.

- **Option d) — Incorrect.** Zeebe does not "silently discard" subsequent messages with the same correlation key — by default, each message correlates to **one waiting subscription** if one exists, or is buffered (up to TTL) if no subscription exists. The "first wins, rest discarded" rule does not apply to correlation; it applies to message uniqueness if messageId is set.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Strict-typed correlation е Zeebe-каноничното поведение; FEEL `string()` coerce е стандартния fix.
- **b) 2/10** — case-sensitivity не е проблемът; и lower case не решава type mismatch.
- **c) 3/10** — TTL е за subscribe-after-publish race, не за strict-typed mismatches.
- **d) 2/10** — невярно описание на Zeebe deduplication behaviour.

**Correct Answer:** Zeebe's correlation key comparison is strict-typed — `12345` (integer) does not correlate to `"12345"` (string). Coerce both sides to the same type, e.g., `correlationKey: =string(orderId)`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/messages/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "20% never advance" + "gateway confirms sent" + "subscription store shows published but not correlated" + "sometimes int, sometimes string" → разпознаваш че проблемът е **strict-typed correlation mismatch**, не TTL, не network. Сигнал е, че data type drift между upstream services и process variables.

**Въпросът → Solution Framing.** "Root cause and the fix" изисква и diagnostic, и corrective action — изключва решения които предлагат коригиране на симптомите без обяснение на причината.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe correlation е **strict-typed equality** (number ≠ string), знаеш че FEEL `string(x)` coerce-ва type, знаеш че TTL handles subscribe-after-publish race (не strict-typed mismatch), знаеш че Zeebe не "discard subsequent" silently — има буфериране и messageId uniqueness, а не correlation uniqueness. Това е знание за Zeebe message subscription internals + FEEL type system.

---

## Question 13: Configuring Processes (Weighting: 22%)

**Scenario:** A subscription billing process at a SaaS company runs on Camunda 8 SaaS. After a subscriber signs up, the process must trigger a recurring monthly billing cycle: **every 30 days**, starting from the signup date, the process activates a Service Task "Charge Card" until the subscriber cancels. The cancellation must also be handled cleanly. The team models this as a loop with a Timer Catch Event configured with a 30-day cycle.

The developer is configuring the Timer Catch Event in Web Modeler and must pick the correct timer format. The options are ISO 8601 expressions, and the engine evaluates them with FEEL on the underlying `timer.value` property.

**Which timer configuration correctly expresses "every 30 days, starting now, indefinitely"?**

- **a)** `cycle: R/P30D` — an unbounded cycle of 30-day periods starting immediately. Documentation: [Timer events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** `duration: PT30D` — a fixed-duration timer; on each cycle, set a 30-day fixed wait. Documentation: [ISO 8601 Duration](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** `date: =now() + duration("P30D")` — explicitly compute the next fire time as 30 days from now. Documentation: [FEEL temporals](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **d)** `cycle: PT30M` — a 30-minute cycle is the closest ISO 8601 expression to "30 days". Documentation: [Timer events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The ISO 8601 cycle notation `R/P30D` means "**repeating** every period of **30 days**" with no upper bound (R without a count is unbounded). Zeebe parses this and re-arms the timer after each firing automatically, producing exactly the "every 30 days indefinitely" semantics. Combined with the cancellation handler (e.g., an Event Subprocess listening for `subscription_cancelled` message), this models recurring billing cleanly.

- **Option b) — Incorrect.** `duration: PT30D` is a **single 30-day wait**, not a recurring cycle. After one firing the timer is consumed; you would have to model the recurrence manually with a loop in BPMN. Functional but verbose. Also note: `PT30D` is incorrect ISO 8601 — the correct duration for 30 days is `P30D` (no T prefix, T is only for time-of-day components).

- **Option c) — Incorrect.** `date: =now() + duration("P30D")` is a **fixed date** computed once at process variable assignment. It fires once 30 days from when the variable was set, then never again. To get recurrence you would need to loop and re-set the date each iteration — much more complex than a cycle expression.

- **Option d) — Incorrect.** `PT30M` is **30 minutes**, not 30 days. The `M` after a `T` (time) prefix means minutes; after a `P` (period) prefix without T it means months. Also `PT30M` alone is a duration, not a cycle (needs `R/` prefix to repeat). A classic ISO 8601 confusion.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `R/P30D` е ISO 8601 каноничната форма за unbounded 30-day cycle.
- **b) 3/10** — single duration, не cycle; и синтаксисът `PT30D` е грешен (трябва P30D).
- **c) 4/10** — работещо за single fire, но изисква manual loop за recurrence; over-engineered.
- **d) 1/10** — `PT30M` е 30 минути, не 30 дни. ISO 8601 неразбиране.

**Correct Answer:** `cycle: R/P30D` — an unbounded cycle of 30-day periods.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Every 30 days" + "indefinitely" + "starting from signup" → разпознаваш че се иска **unbounded recurring cycle**, не single-shot timer, не fixed date. Триото "repeat + interval + no end" сочи към cycle notation.

**Въпросът → Solution Framing.** "Correctly expresses" в въпроса изисква **точен ISO 8601 синтаксис**, не приблизителна семантика. Това отрязва options които дават близка функционалност но не точно (option b, c) и грешен синтаксис (option d).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че ISO 8601 `R/P30D` е recurrence-of-duration с unbounded count, знаеш че `P30D` е "30 days" но `PT30D` е грешен синтаксис, знаеш че `PT30M` е 30 минути (T-prefix променя значението на `M` от месеци към минути), знаеш че `date: ...` дава **fixed time**, не cycle. Това е знание за ISO 8601 + Zeebe timer parser.

---

## Question 14: Configuring Processes (Weighting: 22%)

**Scenario:** A claims processing workflow at an insurance company uses a Business Rule Task to determine whether a claim is auto-approved, manually reviewed, or rejected. The team has deployed a DMN decision diagram named "claim-routing" containing three decisions: `AutoApprovalCheck`, `RiskScoring`, and `RoutingDecision` (the latter is the output decision). The Business Rule Task in the BPMN process is configured with the property `zeebe:calledDecision.decisionId: claim-routing` and `resultVariable: routingResult`.

After deploying, the Business Rule Task runs but the `routingResult` process variable receives an **unexpected nested object** containing all three decision outputs instead of just the final routing decision. The developer expected only the output of the final decision to be returned.

**Why is the result a nested object, and how should the Business Rule Task be configured?**

- **a)** `decisionId` in Zeebe references the **DMN diagram identifier**, not a specific decision within it. The result is the output of **all decisions evaluated**. To get only the final routing decision, set `decisionId` to `RoutingDecision` (the specific decision within the diagram). Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **b)** The DMN evaluator always returns the diagram-level output map; to extract just one decision, use a downstream Script Task with FEEL: `=routingResult.RoutingDecision`. Documentation: [FEEL contexts](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-context/)

- **c)** The `resultVariable` value needs to include the JSONPath suffix: `routingResult.RoutingDecision`. Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **d)** DMN decision evaluation in Zeebe always returns the full DRG output; the BPMN is correct, the team should adapt downstream logic to expect a nested object. Documentation: [DMN evaluation](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Zeebe Business Rule Task's `zeebe:calledDecision.decisionId` references the **specific decision** within the DRG (Decision Requirements Graph), not the entire DRG. When you point it at `claim-routing` (a DRG identifier or the top-level diagram name), Zeebe interprets it as a request to evaluate everything in that DRG and returns a map of all decision outputs. To get the output of a single decision, configure `decisionId: RoutingDecision` (the specific decision id within the DRG). Zeebe will then evaluate only the decision graph reachable from that decision, and the `resultVariable` receives just that decision's output.

- **Option b) — Incorrect.** Adding a downstream Script Task to extract one value is a workaround that adds noise to the BPMN and hides the misconfiguration. It's possible but it's not addressing the root cause.

- **Option c) — Incorrect.** `resultVariable` is just a variable name — it does not accept dot-notation paths. Zeebe writes whatever the decision returned to that variable name as-is.

- **Option d) — Incorrect.** This describes the current observed behaviour and accepts it as correct, but the scenario explicitly states the developer expects only the final decision's output. Camunda's DMN evaluation supports both modes — full DRG eval (returns all outputs) and specific-decision eval (returns one) — by referring to different identifiers.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `decisionId` е fine-grained reference към специфична decision в DRG.
- **b) 4/10** — workaround чрез Script Task; работи но крие root cause.
- **c) 2/10** — невярно — resultVariable е flat name, не path.
- **d) 3/10** — приема грешното поведение като coorrect; не предлага fix.

**Correct Answer:** Set `decisionId` to `RoutingDecision` (the specific decision within the diagram).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Decision returns nested object" + "expected single decision output" + "three decisions in DRG" → разпознаваш че проблемът е **DMN reference granularity** — DRG vs single decision. Сигнал е, че `decisionId` сочи към грешното ниво в DMN hierarchy.

**Въпросът → Solution Framing.** "Why is the result nested" изисква **explanation of mechanism**, не workaround. Това отрязва downstream Script Task patches (option b).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe DMN evaluator support-ва и DRG-wide и single-decision eval, знаеш че `decisionId` references **specific decision identifier** в DMN XML, знаеш че `resultVariable` е **flat variable name** (не accept-ва path notation), знаеш че DMN diagram name ≠ decision id. Това е знание за DMN model structure + Zeebe configuration semantics.

---



## Question 15: Configuring Processes (Weighting: 22%)

**Scenario:** A clinical-trial management system processes patient enrollment forms in Camunda 8 Self-Managed. Each batch of incoming forms (typically 200-2000 forms) is processed through a **Parallel Multi-Instance Subprocess** that performs eligibility checks per form. The business rule states: "complete the batch as soon as **95% of forms have been processed** (regardless of outcome), so downstream reporting can start without waiting for stragglers." The current model fully completes all instances before the batch advances, which causes 5-10% of slow forms to delay the whole batch by 20-30 minutes.

The developer needs to configure the Multi-Instance Subprocess with a **completion threshold**, but also wants the remaining 5% of forms to **continue processing in the background** without blocking the downstream flow.

**Which Multi-Instance configuration achieves this?**

- **a)** Set `completionCondition: =count(results) >= count(forms) * 0.95` on the Multi-Instance marker. When the condition is met, Zeebe **cancels all remaining in-flight inner instances** and moves the token forward. Documentation: [Multi-instance completionCondition](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Set `completionCondition: =count(results) >= count(forms) * 0.95`. Zeebe automatically moves the token forward when 95% complete, but **lets the remaining 5% continue processing as detached background tokens**. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Use a non-completion-condition approach: set `inputCollection` to only 95% of the forms; process the remaining 5% in a separate Service Task downstream. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Wrap the Multi-Instance Subprocess in a Subprocess with an **Interrupting Timer Boundary Event** set to fire when 95% of forms are processed (computed via FEEL on a `progress` variable). Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Multi-Instance `completionCondition` is a FEEL expression evaluated after each inner instance completes. When it evaluates to true, Zeebe **cancels all remaining in-flight inner instances** and moves the parent token to the outgoing flow. Yes — this means the 5% stragglers are terminated, not allowed to finish. If the business needs them to continue, the design must move them to a separate fire-and-forget worker, not inside the Multi-Instance scope.

- **Option b) — Incorrect.** Zeebe does **not** support "detached background instances" — Multi-Instance scope is unified, and `completionCondition` cancels the remaining inner instances rather than detaching them. This describes wished-for behaviour that doesn't exist.

- **Option c) — Incorrect.** Splitting the input collection means you lose visibility into which 5% were "the remaining slow ones" — you would have to know upfront which are slow. Also, the business requirement is "95% completion threshold based on actual progress", not "process 95% first then 5% later".

- **Option d) — Incorrect.** Timer Boundary Event fires on **wall-clock time**, not on progress percentages. You cannot encode "fire when 95% of inner instances complete" as a Timer. Also, even if you computed an estimate, the Boundary would interrupt the entire Multi-Instance scope (canceling all 100%), not advance the token gracefully at the 95% mark.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. completionCondition с FEEL count() е каноничният approach; remaining instances се cancel-ват (semantics документирани).
- **b) 3/10** — описва несъществуващо поведение (detached background tokens). Wishful thinking.
- **c) 4/10** — work-around който не покрива "based on progress" requirement.
- **d) 2/10** — Timer Boundary е wall-clock, не progress-based. Wrong axis.

**Correct Answer:** Set `completionCondition: =count(results) >= count(forms) * 0.95` on the Multi-Instance marker.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "95% threshold" + "stragglers delay batch" + "fire-and-forget remaining" → разпознаваш че се иска **early completion based on threshold**, не error handling, не timer. Сигнал е, че completion criterion трябва да е progress-based.

**Въпросът → Solution Framing.** "Achieves this" + двойното изискване ("threshold AND continue in background") крие подвеждащ trap — option b описва това wishful поведение което Zeebe не support-ва. Distractor разчита на това че кандидатът би искал второто да работи.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че `completionCondition` се evaluat-ва **след всяка inner instance завършване**, знаеш че при true Zeebe **cancel-ва remaining** (не detach-ва), знаеш че Multi-Instance scope е **unified** (не позволява detached subtokens), знаеш че Timer Boundary е **wall-clock not progress-based**. Това е знание за MI completion semantics в Zeebe + честа мисconception че "background continue" е възможно.

---

## Question 16: Configuring Processes (Weighting: 22%)

**Scenario:** A loan origination process contains a Subprocess "Verify Documents" that runs three Service Tasks in sequence. The parent process holds variables `applicantId`, `loanAmount`, and `documents`. Inside the subprocess, the developer wants to introduce a **local scratch variable** `verificationResults` that aggregates outcomes of the three Service Tasks. This variable should be **scoped to the subprocess only** — it must NOT leak into the parent scope or pollute the global variable namespace.

When the subprocess completes, only a clean boolean `allDocumentsVerified` should be propagated back to the parent process. The team adds `verificationResults` as a Subprocess local variable and uses Output Mapping to compute `allDocumentsVerified` from it.

**How should the developer configure the Subprocess input/output mappings to achieve correct variable scoping?**

- **a)** **Input mapping:** none required (the subprocess inherits parent scope by default). **Local variable:** `verificationResults` declared in the subprocess scope. **Output mapping:** `target = allDocumentsVerified`, `source = =all(verificationResults[*].verified)`. The subprocess's local variables are discarded automatically when it ends. Documentation: [Variable scope](https://docs.camunda.io/docs/components/concepts/variables/)

- **b)** **Input mapping:** copy all parent variables into the subprocess explicitly. **Output mapping:** copy `verificationResults` back to parent. Without explicit input mapping, the subprocess cannot read parent variables. Documentation: [Variable scope](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Use a Call Activity instead of a Subprocess — Call Activity gives a separate variable scope, Embedded Subprocess does not. Documentation: [Call Activities](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **d)** Subprocess local variables are not supported in Zeebe; declare `verificationResults` in the parent scope with a documented "internal" naming convention. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Embedded Subprocess in Zeebe inherits **read access** to all parent variables by default — no input mapping needed. Variables created **inside** the subprocess scope (via Service Task output mapping with `=` source pointing into subprocess scope, or via local variable declaration) are **local to the subprocess** and are automatically **discarded** when the subprocess ends. To propagate a result back to the parent, configure the subprocess's output mapping to compute the parent-bound variable from the local variables. The cleanup of `verificationResults` happens automatically.

- **Option b) — Incorrect.** Embedded Subprocess does NOT require input mapping to read parent variables — it has implicit read access. Adding redundant input mappings clutters the model without providing isolation.

- **Option c) — Partially correct semantics but wrong fix.** Call Activity does give scope isolation, but it also creates a **separate process instance** with its own version, deployment lifecycle, and Operate audit row — much heavier than needed for inline subprocess work. Use Call Activity when you need cross-process reuse + version isolation, not just variable scoping.

- **Option d) — Incorrect.** Subprocess-local variables ARE supported in Zeebe (variables created via output mappings or `setVariables` calls scoped to the subprocess level). The "internal naming convention" workaround is unnecessary.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Embedded Subprocess local scope е каноничното Zeebe behaviour за isolation.
- **b) 3/10** — Embedded Subprocess има implicit read access; explicit mapping е излишен.
- **c) 5/10** — Call Activity работи но е over-kill за inline scope isolation.
- **d) 2/10** — невярно — Zeebe support-ва subprocess-local variables.

**Correct Answer:** Input mapping: none required. Local variable: `verificationResults`. Output mapping: `target = allDocumentsVerified`, `source = =all(verificationResults[*].verified)`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Local scratch variable" + "must not leak to parent" + "only clean boolean propagates back" → разпознаваш че проблемът е **variable scope isolation в same-process subprocess**, не cross-process call, не naming hygiene.

**Въпросът → Solution Framing.** "Correct configuration" + "scoping" определят какво се иска — конфигурация на input/output mappings, не различен BPMN element. Това отрязва Call Activity (option c) като over-engineered.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Embedded Subprocess е **scope** в Zeebe (variable scopes са inherited читателно), знаеш че local variables се discard-ват при scope end, знаеш че output mapping е механизмът за **explicit promotion** на стойности към parent, знаеш че Call Activity създава **separate process instance** (heavier abstraction), знаеш че Zeebe variables са JSON-structured per scope. Това е знание за variable scope hierarchy в Zeebe.

---

## Question 17: Configuring Processes (Weighting: 22%)

**Scenario:** A development team at a financial services company has built five different Camunda 8 processes, each of which calls a corporate "Send Notification" REST API. Today, each process has its own Service Task with hardcoded URL, header, and authentication configuration — when the API's authentication scheme changed last quarter from API key to OAuth2, the team had to update all five processes individually and missed two, causing notification failures in production.

The team wants a **single point of change** for the notification configuration so that future updates touch one artefact, not five. They are considering Element Templates for this.

**What is the correct understanding of Element Templates' role here?**

- **a)** **Element Templates** standardise the BPMN-element-level configuration (URL, headers, auth, payload structure) for reuse across processes. Designers in Web Modeler select the template when adding a Service Task; the template's properties are bound to BPMN extension elements. Updating the template propagates to **new processes** but does not automatically update **deployed instances** — those use the configuration that was current when they were deployed. Documentation: [Element Templates](https://docs.camunda.io/docs/components/concepts/element-templates/)

- **b)** Element Templates create a **runtime binding** — when the template is updated, all deployed processes referencing it automatically pick up the new configuration at runtime, including in-flight instances. Documentation: [Element Templates](https://docs.camunda.io/docs/components/concepts/element-templates/)

- **c)** Element Templates are equivalent to Connectors — they execute the API call inside the broker without a job worker. Updating an Element Template re-deploys all using processes. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Element Templates are deprecated in Camunda 8.8; the new mechanism is a Custom Connector built with the Connector SDK. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Element Templates are **design-time tools** that define reusable configuration for BPMN elements (typically Service Tasks calling Connectors, or Task headers). When a designer selects a template, the template's defined properties are written into the BPMN XML as extension elements at design time. Updating the template (publishing a new version) affects processes that **adopt the new version** when they are re-edited and re-deployed — it does not retroactively change already-deployed processes or in-flight instances. The "single point of change" works for future deployments, not retroactively.

- **Option b) — Incorrect.** Templates are design-time, not runtime. There is no runtime binding from a template to deployed processes — the template's properties are inlined into the BPMN XML at deployment.

- **Option c) — Incorrect.** Element Templates are not Connectors. Connectors are runtime components (inbound or outbound integrations). Templates define **configuration shape** for any BPMN element, including for use with Connectors. They are complementary, not equivalent.

- **Option d) — Incorrect.** Element Templates are not deprecated; they are an active part of Camunda 8.8 and integrate with Connectors and other elements.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Element Templates са design-time с deployment-time inlining; not retroactive.
- **b) 2/10** — невярно описва runtime binding which doesn't exist.
- **c) 3/10** — обърква Templates с Connectors; различни abstractions.
- **d) 1/10** — невярно — не са deprecated.

**Correct Answer:** Element Templates standardise the BPMN-element-level configuration for reuse across processes. Updating the template propagates to new processes but does not automatically update deployed instances.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/element-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Hardcoded config in 5 places" + "missed 2 during update" + "single point of change for FUTURE updates" → разпознаваш че се иска **design-time reuse**, не runtime polymorphism. Сигналът "future updates" е критичен — разграничава compile-time от runtime.

**Въпросът → Solution Framing.** "Correct understanding of Element Templates' role" е директна формулировка — изпитва се **концептуално разбиране на Templates' семантика**, не "коя feature да изберем". Това отрязва решения които описват грешен mechanism (option b runtime, option c connectors).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Element Templates са **design-time configuration tooling** в Web Modeler, знаеш че template properties се **inline-ват в BPMN XML** при дизайн, знаеш че updates са **prospective не retroactive**, знаеш че Templates ≠ Connectors (template defines shape; Connector defines runtime integration), знаеш че Templates НЕ са deprecated. Това е знание за Camunda Modeler-broker boundary + Modeler tooling.

---

## Question 18: Configuring Processes (Weighting: 22%)

**Scenario:** A document-heavy onboarding process at a corporate bank requires customers to upload passport, proof of address, and tax form during application. The process is built in Camunda 8 SaaS. Each uploaded document needs to be **passed through several process steps**: OCR extraction, compliance check, archival to long-term storage. Documents can be large (10-50 MB). The team initially tried storing the document binary content as a Base64 string in a process variable, but this caused Zeebe to **reject the variable update with "variable size exceeds limit"** (Zeebe variable limit is around 4 MB).

The team needs a way to handle these documents in BPMN flow without exceeding variable size limits and without losing the ability to pass document references between Service Tasks.

**What is the correct Camunda 8 mechanism for handling large documents in a process?**

- **a)** Use Camunda 8's **Document Handling** API: Service Tasks call the API to store the document, receive a **document reference** (a small JSON object with `documentId` and metadata), and pass this reference as a process variable. Subsequent tasks retrieve the document via the reference. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/getting-started/)

- **b)** Increase the Zeebe variable size limit via cluster configuration to accommodate large variables. Documentation: [Zeebe configuration](https://docs.camunda.io/docs/components/zeebe/operations/configuration/)

- **c)** Store the document in an external S3 bucket and pass only the S3 URL as a string variable. Each Service Task fetches the document from S3. Documentation: [Process variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Split the document into chunks small enough to fit as separate variables (e.g., `doc_chunk_1`, `doc_chunk_2`, ...) and reassemble in each consuming task. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8.8's **Document Handling** is the canonical mechanism for this exact scenario. The Document Handling API stores documents in Camunda's managed storage (or configured external storage) and returns a **document reference** — a small JSON object that fits comfortably in process variables. Each Service Task receives the reference, retrieves the document content via the Document Handling API when needed, and updates the reference if it produces a new version. This avoids variable-size limits, keeps Zeebe variables lean, and provides a uniform abstraction for document lifecycle across the process.

- **Option b) — Incorrect.** The 4 MB variable limit is a hard architectural bound in Zeebe rooted in the underlying log/snapshot design — it is not safely increasable. Even if it were, storing 50 MB binaries in process state would tank performance (large snapshots, slow recovery, bloated audit) and is the wrong abstraction.

- **Option c) — Partially viable but reinvents Document Handling.** Storing in S3 and passing URLs is a DIY version of what Document Handling already provides — minus the integrated security, audit, lifecycle management, and BPMN modeler integration. Working but non-canonical; misses out on Camunda's built-in document features.

- **Option d) — Incorrect.** Chunking documents into multiple variables is fragile (race conditions on reassembly, ordering issues), still bloats process state, and is a clear anti-pattern. No team should adopt this in production.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Document Handling е canonical Camunda 8 механизъм за големи документи.
- **b) 1/10** — variable limit е hard architectural bound, не configuration. Опасно поведение.
- **c) 5/10** — работи (DIY) но missing built-in features; non-canonical.
- **d) 1/10** — anti-pattern. Fragile, бавно, грешен abstraction.

**Correct Answer:** Use Camunda 8's Document Handling API: Service Tasks call the API to store the document, receive a document reference, and pass this reference as a process variable.

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Large documents 10-50 MB" + "variable size limit error" + "passing through several steps" → разпознаваш че проблемът е **document lifecycle in BPMN flow**, не encoding, не variable size config. Сигналът е, че държане на blob в process state е грешен abstraction.

**Въпросът → Solution Framing.** "Correct Camunda 8 mechanism" в въпроса е директна формулировка — търси се **built-in feature**, не workaround. Това отрязва DIY S3 (option c) и chunking (option d).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 8.8 има **Document Handling** като first-class feature, знаеш че Zeebe variable size limit е **hard architectural bound**, знаеш че process state трябва да бъде **lean** (references not blobs), знаеш че external storage (S3) е работа на Document Handling под капака. Това е знание за Camunda 8.8 product features + general design principles за event-driven workflow engines.

---

## Question 19: Configuring Processes (Weighting: 22%)

**Scenario:** An insurance company processes incoming claims via email. Each email contains scanned paperwork (claim form, accident photos, repair estimates). The process needs to **extract structured data** from the email and attachments — claim number, claimant name, accident date, damage amount — and use these as process variables for downstream automation. The team has heard about Camunda's IDP (Intelligent Document Processing) feature in 8.8.

The developer is configuring an **IDP Application** in Web Modeler. They want the IDP to extract the four fields above and make them available as process variables.

**Which IDP Application configuration is correct?**

- **a)** Create an **IDP Application** in Web Modeler that defines the four extraction fields. Reference the IDP Application from a Service Task in the BPMN process using its application id. At runtime, the Service Task invokes the IDP, which uses AI vision/OCR to extract the fields from the input document(s) and returns them as a structured JSON object mapped to process variables. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **b)** IDP is configured directly in the BPMN as a special "IDP Task" type (similar to Business Rule Task). No separate Application is needed. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **c)** IDP only works with Camunda's RPA workers; the BPMN process must use an RPA Task that calls the IDP pipeline. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/getting-started/)

- **d)** IDP is a runtime-only feature configured via the Orchestration Cluster API at the cluster level — there is no design-time configuration in Web Modeler. Documentation: [Orchestration Cluster API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8.8 IDP introduces the concept of an **IDP Application** as a Web Modeler design-time artefact. You define the extraction schema (which fields to pull, their types, validation rules, AI prompt context) inside the IDP Application. The BPMN process references the IDP Application via a Service Task (or dedicated IDP element depending on the modeler version), passing the input document(s). At runtime, the IDP service performs AI-based vision/OCR/extraction and returns a structured JSON response mapped to process variables for downstream use.

- **Option b) — Incorrect.** IDP is not a "task type" inlined directly in BPMN — it is configured as a separate Application with its own schema. The BPMN references the Application; the Application defines the extraction logic. Separating concerns keeps the BPMN clean and lets the IDP schema evolve independently.

- **Option c) — Incorrect.** IDP and RPA are distinct features in Camunda 8.8. RPA orchestrates desktop automation workflows; IDP performs intelligent extraction from documents. They can be combined but neither requires the other.

- **Option d) — Incorrect.** IDP has substantial design-time configuration in Web Modeler (the IDP Application itself). The runtime invocation is via standard process mechanisms.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. IDP Application е Web Modeler design-time артефакт; референциран от BPMN с runtime AI-driven extraction.
- **b) 3/10** — IDP не е inlined "task type"; има отделна Application.
- **c) 2/10** — RPA ≠ IDP; объркване на features.
- **d) 2/10** — IDP има значителна design-time конфигурация в Web Modeler.

**Correct Answer:** Create an IDP Application in Web Modeler that defines the four extraction fields. Reference the IDP Application from a Service Task in the BPMN process using its application id.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/idp/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Extract structured data from scanned paperwork" + "use as process variables" + "Camunda's IDP feature" → разпознаваш че проблемът е **intelligent document extraction integration в BPMN flow**, не custom OCR worker, не form processing.

**Въпросът → Solution Framing.** "Configuration is correct" определя контекста — изпитва се **знание за IDP Application структура**, не general document processing. Това отрязва features-confusion (RPA-option c).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 8.8 IDP е **AI-driven extraction service** с design-time Application abstraction, знаеш че IDP Application живее в Web Modeler (не inline в BPMN), знаеш че RPA ≠ IDP (orthogonal features), знаеш че design-time + runtime разделение е стандартен Camunda pattern. Това е знание за Camunda 8.8 product features specifically — relatively new, often tested.

---

## Question 20: Configuring Processes (Weighting: 22%)

**Scenario:** A customer-support workflow at a SaaS company integrates an LLM (large language model) for **automated draft response generation** to support tickets. The business wants the LLM to receive the customer's ticket text and historical case data, then produce a draft response in three styles (formal, friendly, technical). The team must **choose between two new Camunda 8.8 patterns** for AI integration: an **AI Agent Connector** or an **Ad-hoc Subprocess** orchestrating multiple LLM calls.

The specific requirement is that the LLM should be invoked with **structured prompts** and the response should be **validated** against the company's tone guidelines before being shown to the support agent. The team also wants **clear audit trail** of each LLM call in Operate.

**Which Camunda 8.8 pattern fits this use case best?**

- **a)** **AI Agent Connector** — a Camunda 8.8 connector that exposes LLM invocation as a single BPMN element. Configure the system prompt, model, and validation in the connector properties. The connector handles the LLM call, retry, and response shaping. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/agentic-orchestration-overview/)

- **b)** **Ad-hoc Subprocess** containing multiple Service Tasks for prompt assembly, LLM call, response validation. Use the BPMN ad-hoc semantics to allow flexible ordering. Documentation: [Ad-hoc subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/ad-hoc-subprocesses/)

- **c)** A standard **Service Task** with a custom Java job worker that wraps the LLM SDK. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** A **DMN Decision Table** with input column for ticket text and output column for the generated response. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8.8's **AI Agent Connector** (part of the Agentic Orchestration feature set) is designed specifically for this scenario. It exposes LLM invocation as a configurable BPMN element with built-in support for system prompts, model selection, response shaping, retry, and **clear Operate audit** (each invocation appears as a tracked activity with prompt+response variables visible in instance history). The single-element abstraction gives the BPMN model clarity; the connector configuration externalises the prompts. This fits "structured prompts + validation + audit" cleanly.

- **Option b) — Partially viable but heavier than needed.** Ad-hoc Subprocess is appropriate when the LLM calls' order is genuinely dynamic and dictated at runtime by the LLM itself (e.g., agent reasoning chains). For a deterministic three-style draft generation flow, the dynamic ordering is unnecessary overhead — and the BPMN becomes more complex than the AI Agent Connector single element.

- **Option c) — Working but non-canonical.** Custom Java worker is the pre-8.8 workaround. It works but loses the built-in AI Agent Connector benefits (configuration externalisation, standardised audit, retry strategy, prompt versioning) and pushes responsibility to the worker code that the team must maintain.

- **Option d) — Incorrect.** DMN Decision Tables evaluate **rule-based logic** on structured inputs — they cannot invoke LLMs or generate free-form text. Wrong abstraction entirely.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. AI Agent Connector е canonical Camunda 8.8 pattern за structured LLM invocation с audit.
- **b) 5/10** — Ad-hoc Subprocess работи за **agentic/dynamic** orchestration; over-engineered за deterministic 3-style draft.
- **c) 4/10** — работещ pre-8.8 fallback; non-canonical в 8.8.
- **d) 1/10** — DMN не invoke-ва LLMs. Wrong tool.

**Correct Answer:** AI Agent Connector — a Camunda 8.8 connector that exposes LLM invocation as a single BPMN element.

**Official Documentation Link:** https://docs.camunda.io/docs/components/agentic-orchestration/agentic-orchestration-overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Structured prompt" + "deterministic 3-style output" + "audit in Operate" + "8.8" → разпознаваш че се иска **single-element LLM integration**, не dynamic agent loop, не custom worker. Triото "structured + deterministic + audit" сочи към AI Agent Connector, не Ad-hoc Subprocess.

**Въпросът → Solution Framing.** "Choose between AI Agent Connector OR Ad-hoc Subprocess" е честа Camunda 8.8 exam trap — двете са нови, лесно се бъркат. Solution framing изисква да разграничиш кога е dynamic (ad-hoc) кога е structured (connector). "Structured prompts" в въпроса е сигнал за connector.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че AI Agent Connector е **declarative single-element LLM invocation**, знаеш че Ad-hoc Subprocess е за **dynamic agentic orchestration** (agent reasons за следваща стъпка), знаеш че custom Java worker е **pre-8.8 fallback**, знаеш че DMN е **rule-based** не generative. Това е знание за Camunda 8.8 Agentic Orchestration feature differentiation.

---

## Question 21: Configuring Processes (Weighting: 22%)

**Scenario:** A payment processing service uses a Camunda 8 BPMN process to handle credit card transactions. The Service Task "Charge Card" calls a payment gateway. The gateway can return three failure conditions: **insufficient funds**, **card expired**, or **fraud detected**. Each failure must be handled differently in the BPMN flow — insufficient funds → ask for alternative payment method; card expired → notify customer to update; fraud detected → freeze account + alert security team.

The job worker for "Charge Card" calls `client.newThrowErrorCommand(jobKey).errorCode("INSUFFICIENT_FUNDS").send()` or similar for each failure type. The developer attaches a single **Error Boundary Event** to the Service Task with `errorCode: "PAYMENT_ERROR"` — and the boundary catches all three errors uniformly, routing all to the same handler "Generic Payment Failure".

The team wants the **three different errors to route to three different boundary events** so each is handled appropriately.

**What is the correct configuration?**

- **a)** Attach **three separate Error Boundary Events** to the Service Task, each with a distinct `errorCode` matching what the worker throws: `errorCode: "INSUFFICIENT_FUNDS"`, `errorCode: "CARD_EXPIRED"`, `errorCode: "FRAUD_DETECTED"`. Each routes to its own handler. Documentation: [Error events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **b)** Attach a single Error Boundary Event with no `errorCode` specified (catch-all) and use an Exclusive Gateway downstream to route based on a `errorType` process variable. Documentation: [Error events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** Configure the Service Task with `zeebe:errorEventDefinition` listing all three error codes; the BPMN engine routes them to the appropriate downstream task automatically. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** The worker should throw a single error code "PAYMENT_ERROR" and include the specific failure type in the error message; the boundary's downstream task parses the message. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** In Zeebe, an Error Boundary Event with a specific `errorCode` matches **only the BPMN error events with that exact code**. Attaching three Error Boundary Events with codes `INSUFFICIENT_FUNDS`, `CARD_EXPIRED`, and `FRAUD_DETECTED` lets the engine route each thrown error to its specific boundary. Each boundary has its own outgoing flow to its dedicated handler. The job worker must throw the matching `errorCode` for each failure type using `newThrowErrorCommand`.

- **Option b) — Suboptimal.** A catch-all boundary plus downstream gateway works, but moves error-routing logic from BPMN to a process variable + gateway condition — adding fragility (typos in the variable, missing routes) and obscuring the BPMN model. The whole point of error events is to express error handling as first-class BPMN elements.

- **Option c) — Incorrect.** There is no such Zeebe extension `zeebe:errorEventDefinition` listing multiple codes. Error routing is configured **on the boundary event**, not on the task itself.

- **Option d) — Suboptimal.** Parsing error messages downstream is fragile (message text can change, parsing logic must stay in sync). The BPMN spec already provides `errorCode` for exactly this purpose — semantic routing without text parsing.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple Error Boundary Events с distinct errorCodes е BPMN-стандартът за typed error routing.
- **b) 4/10** — работи но премества error logic в variable + gateway; губи BPMN изразителност.
- **c) 2/10** — несъществуваща Zeebe configuration property.
- **d) 3/10** — string parsing на error message е fragile; типизираните errorCodes са по-добре.

**Correct Answer:** Attach three separate Error Boundary Events to the Service Task, each with a distinct `errorCode`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/error-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Three distinct failure conditions" + "different handlers per error" + "single boundary catches all" → разпознаваш че проблемът е **error-routing granularity** — недостатъчна типизация на boundary events. Trio "specific errorCode per failure" сочи към canonical BPMN pattern.

**Въпросът → Solution Framing.** "Three different errors to three different boundary events" е директната формулировка — изисква BPMN-native решение, не downstream-gateway workaround. Изключва решения които парсват message text (option d) или premestват logic в variables (option b).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Error Boundary Event се match-ва по **exact errorCode** (или catches all when no code specified), знаеш че worker throws чрез `newThrowErrorCommand(jobKey).errorCode(...)`, знаеш че можеш да attach-неш **множество boundaries** към същата активност (всеки с different code), знаеш че BPMN spec предпочита **typed errors** пред string parsing. Това е знание за Zeebe Error event routing semantics.

---

## Question 22: Configuring Processes (Weighting: 22%)

**Scenario:** A high-volume telco order-management process handles 10,000 order events per hour in Camunda 8 SaaS. The process has a Service Task "Validate Address" that calls a third-party address-validation API; under load, this API occasionally returns transient HTTP 503 errors (about 1-2% of the time). The team's expectation is that Camunda will **automatically retry** the job a few times before reporting an incident — but currently each 503 immediately creates a permanent **Incident** in Operate, blocking the entire order's processing until a human resolves it.

The developer reviews the worker code and the BPMN configuration. The worker is built with the Spring Zeebe client and the Service Task's `taskDefinition` has no explicit `retries` property set.

**What is the correct configuration to handle transient failures with automatic retry before creating an incident?**

- **a)** Set `zeebe:taskDefinition retries="3"` on the Service Task. When the worker fails the job with `failJob(jobKey)`, Zeebe decrements the retry counter and re-activates the job; the incident is created only when retries reach zero. Documentation: [Job retries](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Set `zeebe:taskDefinition retries="3"` AND ensure the worker calls `failJob(jobKey, retries: <currentRetries - 1>)` explicitly to decrement the counter. Without explicit decrement, Zeebe does not retry. Documentation: [Job retries](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Set `zeebe:taskDefinition retries="3"` and configure exponential backoff via `zeebe:taskDefinition retryBackoff="PT5S,PT15S,PT45S"`. Documentation: [Job retries](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Retries are configured cluster-wide in the Zeebe broker settings, not on the BPMN element. Documentation: [Zeebe configuration](https://docs.camunda.io/docs/components/zeebe/operations/configuration/)

**🔍 Explanations & Correct Answer**

- **Option a) — Partially correct (missing nuance).** Setting `retries="3"` on the task is the right starting point, but in Zeebe **the worker must explicitly pass the decremented retries** when calling `failJob`. Without an explicit `failJob(jobKey, retries: N-1)`, the decrement depends on the worker's library: Spring Zeebe auto-decrements by default, plain Java client requires explicit decrement. This option oversimplifies.

- **Option b) — Correct.** In Zeebe's job lifecycle, `failJob` accepts a `retries` parameter that sets the remaining retry count. The Spring Zeebe client auto-decrements when the worker throws an exception, but the underlying mechanism requires the retries count to be explicitly tracked. Setting `retries="3"` on the BPMN element provides the initial budget; the worker's `failJob` call (explicit or implicit via exception) decrements it. When retries reach zero, Zeebe creates an Incident.

- **Option c) — Incorrect.** `retryBackoff` is **not** a standard Zeebe configuration property on Service Tasks. Backoff between retries is a worker-side concern (the worker can sleep before completing). Zeebe re-activates the failed job immediately by default.

- **Option d) — Incorrect.** Retries are configured **per-task in the BPMN** via `zeebe:taskDefinition retries`, not cluster-wide. Cluster-wide settings affect broker-level concerns like partition counts and gateway timeouts.

**Per-option scoring (1–10):**
- **a) 6/10** — частично — посочва правилната property но прескача worker-side decrement nuance.
- **b) 10/10** — верен. Retries configuration plus worker explicit/implicit decrement дава автоматичен retry поведение.
- **c) 3/10** — `retryBackoff` не е standard Zeebe property; backoff е worker-side.
- **d) 2/10** — retries са per-task в BPMN, не cluster-wide.

**Correct Answer:** Set `zeebe:taskDefinition retries="3"` AND ensure the worker decrements the counter (explicit `failJob(jobKey, retries: N-1)` or implicit via exception-throwing in Spring Zeebe).

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Transient HTTP 503" + "1-2% failure" + "expect automatic retry" + "instead permanent Incident" → разпознаваш че проблемът е **липсваща retry configuration**, не circuit breaker, не infrastructure. Camunda default = 3 retries, но без explicit config може да е 0 (или worker-library default).

**Въпросът → Solution Framing.** "Configuration to handle transient failures with automatic retry" е директната формулировка. Изключва решения които променят error semantics (option c с non-existent backoff property) или сочат wrong layer (option d cluster-wide).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че `zeebe:taskDefinition retries` дава initial budget, знаеш че worker `failJob` decrements (explicitly или via exception in Spring), знаеш че incident се създава **когато retries = 0**, знаеш че `retryBackoff` не е стандартна property (worker sleep между retries е custom), знаеш че cluster-wide configuration не управлява per-task retries. Това е знание за Zeebe job lifecycle + client library defaults.

---



# Section 3 — Decisions & Business Rules (DMN) (Questions 23-29)

> Weight 11% • Topics: Decision Requirements Diagrams (DRDs), Decision Tables, Hit Policy configuration, FEEL in inputs/outputs, Business Rule Task integration.

---

## Question 23: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A trade finance bank screens incoming transactions against an AML (Anti-Money Laundering) rule set encoded as a DMN Decision Table named `aml-risk-score`. The table has six rules, each contributing a risk score when its conditions match (e.g., high-value > €100K → +30 points, sanctioned country → +50 points, high-risk industry → +20 points). A transaction's **total risk score is the sum of all matched rules**. The team initially configured the Hit Policy as **UNIQUE**, expecting one rule to win — but production traffic shows most transactions match 2-4 rules, and the engine throws a "Unique Hit Policy violated" exception every time, blocking the entire transaction flow.

The compliance team's actual requirement is: "When multiple rules match, **add up their individual scores** and return a single aggregate value."

**Which Hit Policy configuration delivers the correct behaviour?**

- **a)** Switch from UNIQUE to **COLLECT with SUM aggregator**. Zeebe evaluates all matching rules, collects their output values, and **aggregates via SUM into a single scalar output**. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **b)** Switch from UNIQUE to **PRIORITY**. The rule with the highest priority's output value is returned. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **c)** Switch from UNIQUE to **FIRST**. The first matching rule by row order is returned. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **d)** Keep UNIQUE and downstream-aggregate the matched rules by collecting their outputs into a list variable and summing in a Script Task. Documentation: [FEEL list functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN's **COLLECT** hit policy gathers outputs of all matching rules. With an **aggregator** modifier (SUM, MIN, MAX, COUNT), Zeebe applies the aggregation directly inside the DMN engine and returns a single scalar value. `COLLECT-SUM` is precisely the cumulative-scoring semantic the AML team needs: matched rules contribute, sum is computed, single risk score returned. No downstream Script Task needed.

- **Option b) — Incorrect.** PRIORITY returns the **single output with the highest priority** assigned to it — it picks one winner, not aggregates. Doesn't solve cumulative scoring.

- **Option c) — Incorrect.** FIRST returns the first matching rule's output by row order. Misses all other matches. Doesn't aggregate.

- **Option d) — Incorrect.** Keeping UNIQUE means the table still throws exceptions on multi-match. Even if you used COLLECT (without aggregator), aggregating downstream in a Script Task works but is more verbose than the built-in COLLECT-SUM aggregator. Not the canonical approach.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. COLLECT-SUM е каноничният DMN policy за cumulative scoring.
- **b) 2/10** — PRIORITY избира winner, не agregira. Грешна семантика.
- **c) 2/10** — FIRST избира first match. Misses всички останали.
- **d) 4/10** — UNIQUE blocks; downstream aggregation е workaround вместо built-in feature.

**Correct Answer:** Switch from UNIQUE to COLLECT with SUM aggregator.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Multiple rules match" + "sum individual scores" + "single aggregate output" → разпознаваш че се иска **cumulative aggregation**, не selection (FIRST/PRIORITY), не listing. Сигнал е, че всеки match contribute-ва, и крайният output е скаларна сума.

**Въпросът → Solution Framing.** "Hit Policy configuration delivers the correct behaviour" е директната формулировка — изпитва се **знание за всичките 7 Hit Policy варианти** и техните агрегатори. Изключва downstream patches (option d).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Hit Policy controls **how multi-match is resolved** (UNIQUE/ANY/FIRST/PRIORITY/COLLECT/RULE_ORDER/OUTPUT_ORDER), знаеш че COLLECT има 4 aggregator modifiers (SUM, MIN, MAX, COUNT), знаеш че PRIORITY/FIRST избират **single winner**, знаеш че COLLECT без aggregator връща **list of outputs** (нужна downstream aggregation). Това е знание за пълната DMN Hit Policy таблица.

---

## Question 24: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A financial services platform models its loan-origination decision logic as a DMN diagram. The diagram contains four decisions: `CreditScoreCheck` (output: pass/fail), `IncomeVerification` (output: pass/fail), `CollateralCheck` (output: pass/fail), and a final `LoanDecision` that takes the three previous outputs as inputs and returns "approved" or "rejected". The four decisions are linked by **Information Requirements** arrows in the DRD.

When the developer invokes the DMN diagram from a Business Rule Task in BPMN with `decisionId: LoanDecision`, the engine evaluates only `LoanDecision` itself and returns an incident: "Required input variable 'creditScoreResult' is missing". The developer expected the engine to automatically run the three upstream decisions because they are linked by Information Requirements arrows.

**What is the correct understanding of how DRDs handle Information Requirements at runtime?**

- **a)** The DRD's Information Requirements arrows **declare the dependency** between decisions; at runtime, Zeebe **walks the dependency graph** from the targeted decision backward and evaluates upstream decisions automatically. The team's setup should work — the missing input means the upstream decisions failed silently or their outputs are not mapped correctly. Documentation: [DRD](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/)

- **b)** DRD Information Requirements are **purely documentational**; they do not trigger upstream evaluation. Each decision must be invoked separately or chained explicitly. The team must call each upstream decision in sequence via separate Business Rule Tasks. Documentation: [DRD](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/)

- **c)** Information Requirements work only between Decision Tables in the same DMN file; for cross-file linkage, the developer must use Decision Knowledge Models. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** When invoking `LoanDecision`, the developer must explicitly list all upstream decisions in the `zeebe:calledDecision.decisionIds` array (plural). Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda's DMN engine **does** walk the dependency graph defined by Information Requirements. When you invoke `LoanDecision`, the engine recursively resolves upstream decisions linked by Information Requirements, evaluating them as needed. The error "Required input variable missing" means **the leaf inputs to the upstream decisions** (e.g., raw `applicantData`) are not in the process variable set when the Business Rule Task is invoked. The team must supply the leaf-level inputs via the process variables; the engine handles the rest of the chain automatically.

- **Option b) — Incorrect.** This is a common misconception — Information Requirements ARE evaluated at runtime in Camunda's DMN engine. They are not purely visual.

- **Option c) — Incorrect.** DMN's Information Requirements work across decisions defined in the same DMN diagram file; cross-file linkage is more nuanced but not "Decision Knowledge Models" specifically.

- **Option d) — Incorrect.** The Business Rule Task takes a single `decisionId` (the target decision). The engine resolves upstream dependencies automatically — no array of decisionIds.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. DRD Information Requirements са runtime-active в Camunda DMN engine.
- **b) 2/10** — невярна — Information Requirements не са само documentational.
- **c) 3/10** — обърква concepts; same-file DRD evaluation работи без специален mechanism.
- **d) 2/10** — `decisionId` е singular; engine handles upstream автоматично.

**Correct Answer:** The DRD's Information Requirements arrows declare the dependency between decisions; at runtime, Zeebe walks the dependency graph from the targeted decision backward and evaluates upstream decisions automatically. The missing input means leaf-level inputs are not supplied.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-graph/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "DRD with 4 linked decisions" + "Business Rule Task references final decision" + "missing input variable" → разпознаваш че проблемът е **в leaf-input supply**, не в DRD structure. Engine **walks graph autonomously**; missing input е по-нагоре в chain-а.

**Въпросът → Solution Framing.** "Correct understanding of how DRDs handle Information Requirements at runtime" изисква **conceptual understanding**, не configuration tweak. Това отрязва option d (multiple decisionIds).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda DMN engine **traverses Information Requirements** при decision invocation, знаеш че `decisionId` сочи към **target decision** (engine resolve-ва deps), знаеш че leaf inputs трябва да са в process variables, знаеш че Information Requirements са runtime-active, не documentational. Това е знание за DMN engine evaluation model.

---

## Question 25: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A property insurance platform calculates premium adjustments via a Decision Table named `premium-adjustment`. Each row represents a risk factor (flood zone, fire zone, age of property, etc.) with an output column "adjustment_percentage". The compliance officer requires that **at most one rule should fire per property** — if multiple risk factors apply, the rule with the **highest priority** (e.g., flood zone always trumps age of property) should win. The decision table's Hit Policy must enforce this.

The team is choosing between **PRIORITY** and **FIRST** hit policies.

**Which Hit Policy correctly enforces "single winner by highest priority"?**

- **a)** **PRIORITY** — Zeebe evaluates all matching rules, then returns the **single output with the highest priority** as ranked by the output column's defined priority order. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **b)** **FIRST** — Zeebe evaluates rules in row order and returns the **first matching rule's output**, discarding later matches. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **c)** Both PRIORITY and FIRST produce the same result; the team can choose either based on preference. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **d)** Neither — for explicit priority ranking, use OUTPUT ORDER with output priorities defined. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **PRIORITY** is the canonical DMN hit policy for "single winner by ranked output priority". The output column has a defined priority order (e.g., `flood-zone-surcharge, fire-zone-surcharge, age-surcharge`), and PRIORITY returns the output with the **highest rank** among matching rules — regardless of row order. This decouples the table's row layout from the business priority semantics, making it easy to reorder rows without affecting logic.

- **Option b) — Misleading.** FIRST returns the first match by **row order**, which conflates row ordering with priority. If the team always lists flood-zone rules first, it produces the same result as PRIORITY for that case. But maintenance is fragile: reordering rows changes behaviour. The team's requirement is **priority-based, not row-based**, so PRIORITY is semantically correct.

- **Option c) — Incorrect.** PRIORITY and FIRST have different semantics — only happens to coincide when row order matches priority order. Generally different.

- **Option d) — Incorrect.** OUTPUT ORDER returns **a list of all matching outputs sorted by priority**, not a single winner. Wrong abstraction for "at most one rule fires".

**Per-option scoring (1–10):**
- **a) 10/10** — верен. PRIORITY е каноничният DMN policy за single-winner-by-ranked-output.
- **b) 5/10** — работи conditionally но conflate row order с priority; fragile maintenance.
- **c) 2/10** — невярно — две различни semantics, не interchangeable.
- **d) 3/10** — OUTPUT ORDER връща sorted list, не single winner.

**Correct Answer:** PRIORITY — Zeebe evaluates all matching rules, then returns the single output with the highest priority.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "At most one rule" + "highest priority wins" + "explicit priority ranking" → разпознаваш че се иска **priority-based single winner**, не row-order single winner. Сигнал е, че priority е business semantic а не table layout.

**Въпросът → Solution Framing.** Choice между PRIORITY и FIRST е директната формулировка. Distinction е в **separation of priority semantics from row layout** — PRIORITY е robust, FIRST е fragile.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че PRIORITY работи на output priorities (declared in output column metadata), знаеш че FIRST работи на row order (sensitive to reordering), знаеш че OUTPUT ORDER returns list not scalar, знаеш че PRIORITY/FIRST coincide само когато rows са sorted by priority (fragile coupling). Това е знание за всичките 7 Hit Policy semantics + maintenance considerations.

---

## Question 26: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A consumer lending DMN diagram has a `RiskScoring` decision that takes inputs `applicantAge`, `incomeAnnual`, and `existingDebts`. The team writes the input column `applicantAge` with the FEEL expression `applicantAge >= 18 and applicantAge <= 65`. At runtime, for an applicant with `applicantAge = 22`, the decision unexpectedly returns "no rule matched" and creates an incident.

The developer suspects the FEEL expression is incorrect. They review the DMN spec and notice that **FEEL in DMN input columns has different semantics than FEEL in general expressions**.

**What is the correct FEEL syntax for "applicantAge between 18 and 65" in a Decision Table input cell?**

- **a)** `[18..65]` — the DMN input cell interprets a range expression. The input column header is `applicantAge`; the cell value is the constraint. Documentation: [Decision Table](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** `applicantAge >= 18 and applicantAge <= 65` — full FEEL expression as written. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

- **c)** `between 18 and 65` — DMN-style natural language. Documentation: [Decision Table](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** `>= 18, <= 65` — comma-separated constraints. Documentation: [Decision Table](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** In DMN Decision Table input cells, **the input column header names the variable** (e.g., `applicantAge`) and the **cell value is the constraint expression** evaluated against that variable. The range syntax `[18..65]` is **interval notation** — square brackets are inclusive, parentheses would be exclusive. The DMN engine evaluates whether the input value lies within the interval. Writing the full expression like `applicantAge >= 18 and applicantAge <= 65` would be a syntactic error in an input cell — the column header already implies the variable; the cell only carries the constraint.

- **Option b) — Incorrect.** This is the **boxed expression** style used for invocation-level FEEL but not for input cells. Input cells reference the variable implicitly via the column header. Writing the full expression results in a parse error or always-false evaluation.

- **Option c) — Incorrect.** `between 18 and 65` is not standard DMN/FEEL syntax. Range notation `[18..65]` is the canonical form.

- **Option d) — Incorrect.** Comma-separated lists in DMN input cells mean "OR" (any of the comma-separated values match), not "AND". `>= 18, <= 65` would mean "value is >=18 OR value is <=65", which matches everything.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `[18..65]` е каноничната DMN interval notation за input cells.
- **b) 2/10** — full FEEL expression в input cell е syntactic mismatch; works as boxed expression context, не input cell.
- **c) 1/10** — `between` не е DMN/FEEL syntax.
- **d) 2/10** — comma означава OR в DMN input cells, не AND.

**Correct Answer:** `[18..65]` — the DMN input cell interprets a range expression with inclusive boundaries.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "FEEL expression написан като full predicate" + "no rule matches" → разпознаваш че проблемът е **DMN input cell syntax mismatch** — input cells имат different FEEL semantics от standalone expressions.

**Въпросът → Solution Framing.** "FEEL syntax for input cell" е директна формулировка — изпитва се **специфика на DMN input cell semantics**, не general FEEL. Това отрязва full expressions (option b) и invented syntax (option c).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN input cells използват **abbreviated FEEL** (column header = variable, cell = constraint), знаеш че range notation `[a..b]` е DMN standard (inclusive с brackets, exclusive с parens), знаеш че comma в input cells означава OR, знаеш че full predicate стилът е за **boxed expressions** не input cells. Това е знание за DMN spec input cell syntax variants.

---

## Question 27: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A SaaS-based pricing engine determines monthly subscription tiers based on the customer's account age and usage. The DMN Decision Table `pricing-tier` takes inputs `accountAgeMonths` (integer) and `usageTier` (string: "low", "medium", "high"). The output is `subscriptionTier` (string: "starter", "growth", "enterprise"). The team needs the table to handle the case where `accountAgeMonths` is **less than 0** (data quality issue) by defaulting to "starter".

The developer is debating between two approaches:
1. Add a special rule at the top with `accountAgeMonths < 0` → "starter".
2. Use the Hit Policy default semantics.

**Which approach is BPMN/DMN-correct for default handling in a Decision Table?**

- **a)** Add an explicit "first-line" rule with `accountAgeMonths < 0` → "starter". Combined with FIRST or PRIORITY hit policy, this rule fires when account age is invalid; otherwise the regular rules apply. Documentation: [Decision Table](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** Configure the Hit Policy to **DEFAULT** which is automatically applied when no other rule matches. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **c)** Add a **catch-all rule at the bottom** of the table with `-` (don't-care) for both inputs and "starter" as output. With FIRST hit policy, this fires only if no specific rule matched above. Documentation: [Decision Table](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** Use FEEL `default` keyword in the output cell of the last rule. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Partially viable.** An explicit invalid-data rule at the top works for `accountAgeMonths < 0` cases but is too narrow — it doesn't handle other "no rule matched" cases (e.g., usageTier = "unknown").

- **Option b) — Incorrect.** DMN does not have a "DEFAULT" hit policy. The Hit Policies are UNIQUE, ANY, FIRST, PRIORITY, COLLECT, RULE ORDER, OUTPUT ORDER. There is no "default" mode.

- **Option c) — Correct.** A **catch-all rule** at the bottom with `-` (don't-care, matches anything) in each input column is the DMN-canonical way to provide a default. Combined with **FIRST** hit policy (which returns the first matching rule by row order), the catch-all only fires if no preceding specific rule matched. This handles both the explicit invalid-data case (no rule matches `accountAgeMonths < 0`) and any other unmatched input combinations.

- **Option d) — Incorrect.** There is no `default` keyword in FEEL output cell syntax. Output cells contain expressions whose value is the rule's output when fired.

**Per-option scoring (1–10):**
- **a) 5/10** — работи за специфичен invalid case но не cover-ва other unmatched scenarios.
- **b) 1/10** — несъществуваща Hit Policy.
- **c) 10/10** — верен. Catch-all rule с `-` + FIRST hit policy е DMN-каноничният default pattern.
- **d) 1/10** — несъществуваща FEEL feature.

**Correct Answer:** Add a catch-all rule at the bottom of the table with `-` (don't-care) for both inputs and "starter" as output. With FIRST hit policy, this fires only if no specific rule matched above.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Data quality issue with negative age" + "default to starter" → разпознаваш че се иска **default fallback rule**, не error handling, не data validation.

**Въпросът → Solution Framing.** "BPMN/DMN-correct for default handling" е директна формулировка — търси се DMN-native mechanism, не PHP-style default or BPMN error event.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN има **точно 7 Hit Policies** (UNIQUE/ANY/FIRST/PRIORITY/COLLECT/RULE ORDER/OUTPUT ORDER), знаеш че `-` (dash) в input cell означава "any value", знаеш че FIRST hit policy + bottom catch-all rule е стандарт за defaults, знаеш че FEEL output cells contain expressions не keywords. Това е знание за DMN spec coverage.

---

## Question 28: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A logistics company's pricing engine returns multiple types of output values from a single DMN Decision Table: `baseRate` (number), `surcharge` (number), `expediteAvailable` (boolean), `serviceClass` (string from enum "standard", "express", "priority"). The team configures the DMN Decision Table with **four output columns**, one for each value. After deployment, the Business Rule Task receives the result and the developer expects to access each value as a separate process variable.

When the team inspects the result in Operate after process execution, they see the entire output as a **single JSON object** in the `resultVariable` named `pricingResult`. They wanted four flat variables: `baseRate`, `surcharge`, `expediteAvailable`, `serviceClass` directly accessible in downstream tasks.

**Which configuration ensures the output is flattened into individual process variables?**

- **a)** Configure the Business Rule Task with **Output Mappings**: source `=pricingResult.baseRate`, target `baseRate`; repeat for each output. Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **b)** Omit the `resultVariable` configuration on the Business Rule Task. By default, all output columns become flat variables. Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **c)** Use FEEL `flatten()` function in the DMN output cell. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

- **d)** Configure the DMN Decision Table with `output:multiple=true` annotation. Documentation: [Decision Table](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Business Rule Task's `resultVariable` stores the entire DMN output as a single object. To get flat process variables, configure **Output Mappings** on the Business Rule Task — each mapping has a FEEL source expression extracting one field from `resultVariable` and a target variable name. This is the standard Zeebe variable-mapping pattern applicable to any task type.

- **Option b) — Incorrect.** Omitting `resultVariable` results in the DMN output being written with a system-generated name or being discarded — not "automatic flattening". The flattening must be explicit via output mappings.

- **Option c) — Incorrect.** There is no `flatten()` FEEL function for this purpose, and it would not solve the BPMN variable mapping issue anyway.

- **Option d) — Incorrect.** `output:multiple` is not a valid DMN annotation.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Output Mappings on Business Rule Task е каноничният Zeebe pattern.
- **b) 3/10** — невярно — омитането не дава автоматично flattening.
- **c) 1/10** — несъществуваща FEEL function за този use case.
- **d) 1/10** — невалидна DMN annotation.

**Correct Answer:** Configure the Business Rule Task with Output Mappings: source `=pricingResult.baseRate`, target `baseRate`; repeat for each output.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "DMN returns JSON object with 4 fields" + "want 4 flat variables" → разпознаваш че проблемът е **post-DMN variable mapping**, не DMN structure, не resultVariable naming.

**Въпросът → Solution Framing.** "Configuration ensures output is flattened" е директна формулировка — търси се конфигурация на BPMN side, не DMN modification.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe **Output Mappings** са стандартен pattern за **flattening structured outputs** от Service Task / Business Rule Task / Call Activity, знаеш че `resultVariable` държи the **whole DMN return value** (single object/scalar), знаеш че FEEL няма `flatten()` за този use case, знаеш че DMN output structure се определя от output columns в table. Това е знание за Zeebe variable scope mapping mechanisms.

---

## Question 29: Decisions & Business Rules (Weighting: 11%)

**Scenario:** A team is migrating a Camunda 7 process to Camunda 8. The Camunda 7 process has a Business Rule Task that calls a DMN named "approval-flow" via the property `camunda:decisionRef="approval-flow"`. In Camunda 7, the DMN evaluation was performed by the embedded DMN engine in the same JVM as the process engine, with the result automatically bound to a process variable named `decisionResult`.

When the team imports the BPMN XML into Web Modeler for Camunda 8 deployment, the Business Rule Task **deploys without errors** but **fails at runtime with "no decision found for id 'approval-flow'"** — even though the DMN file was uploaded to the Web Modeler project and shows status "Deployed".

**What is likely the cause and the fix?**

- **a)** The Business Rule Task's Camunda 8 configuration uses `zeebe:calledDecision.decisionId` instead of Camunda 7's `camunda:decisionRef`. The deployed BPMN still contains the Camunda 7 property which Zeebe ignores. Reconfigure the Business Rule Task in Web Modeler to use the Camunda 8 property. Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **b)** The DMN file must be deployed via the Zeebe gRPC API, not through Web Modeler. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

- **c)** Camunda 8 requires DMN files to be deployed in the same XML file as the BPMN process. Combine them. Documentation: [DMN deployment](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** The DMN file's `<definitions>` element must reference the BPMN process via a `processRef` attribute. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 7 and Camunda 8 use **different BPMN XML extension namespaces**. Camunda 7's `camunda:decisionRef` is in the `http://camunda.org/schema/1.0/bpmn` namespace; Camunda 8's Zeebe extension is `zeebe:calledDecision.decisionId` in `http://camunda.org/schema/zeebe/1.0`. Zeebe **silently ignores** Camunda 7 properties because they're in a different namespace and not part of Zeebe's schema — the Business Rule Task deploys without errors but has no decision binding at runtime. The fix is to re-edit the Business Rule Task in Web Modeler so it uses the Zeebe-specific property; Web Modeler can also rewrite the XML during import if you use the proper migration option.

- **Option b) — Incorrect.** DMN files can be deployed via Web Modeler, Zeebe Java client, or REST. There is no "must use gRPC" restriction.

- **Option c) — Incorrect.** BPMN and DMN are separate XML files in both Camunda 7 and 8. Combining them is not required and would not be standard.

- **Option d) — Incorrect.** DMN files do not reference BPMN process IDs in their `<definitions>` element. The linkage is from BPMN's Business Rule Task → DMN's decisionId, not the reverse.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Camunda 7 → 8 namespace migration trap.
- **b) 2/10** — невярно — Web Modeler деплоймент работи перфектно.
- **c) 2/10** — невярно — отделни XML файлове.
- **d) 1/10** — невалидна DMN concept.

**Correct Answer:** The Business Rule Task's Camunda 8 configuration uses `zeebe:calledDecision.decisionId` instead of Camunda 7's `camunda:decisionRef`. Reconfigure the Business Rule Task in Web Modeler.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Camunda 7 to 8 migration" + "deploys without errors" + "no decision found at runtime" → разпознаваш че проблемът е **silent namespace mismatch** (C7 properties ignored by Zeebe).

**Въпросът → Solution Framing.** "Likely cause and fix" изисква и diagnostic, и corrective action. Това отрязва hypothetical scenarios които не обясняват root cause.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 7 и 8 имат **different XML extension namespaces** (camunda: vs zeebe:), знаеш че Zeebe **silently ignores** non-zeebe extensions, знаеш че Web Modeler editor показва Zeebe-specific properties (не C7), знаеш че deployment success не имплицира runtime success. Това е знание за Camunda 7/8 migration gotchas.

---



# Section 4 — Configuring Forms (Questions 30-32)

> Weight 5% • Topics: Form element library, data binding (single value + table), conditional rendering, FEEL templating syntax.

---

## Question 30: Configuring Forms (Weighting: 5%)

**Scenario:** A government tax-filing portal uses Camunda 8 Forms (built in Web Modeler) to collect taxpayer data. The form has fields for `firstName`, `lastName`, `dateOfBirth`, and a nested object `address` with `street`, `city`, `postalCode`. The User Task assigns this form, and the process expects to read the submitted values as process variables. After deployment, the developer notices that the simple fields work but the **nested `address` object is not populated** — the form submits but `address` remains null in the process scope.

The team's developer reviews the Forms documentation and notices that **data binding for nested structures** is configured differently than for simple scalar fields.

**How should the developer configure data binding to capture the nested `address` structure?**

- **a)** Set the form field's **Binding path** to `address.street` (and similar `address.city`, `address.postalCode`). The Forms engine writes to the nested path within the form variable. Documentation: [Form data binding](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-data-binding/)

- **b)** Set each form field's name to `address.street`, `address.city`, `address.postalCode` — the Forms engine writes these as separate flat process variables. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/)

- **c)** Nested structures are not supported in Camunda 8 Forms; flatten the address into top-level fields. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Use the Forms templating syntax `{{address.street}}` in the field label, which auto-binds. Documentation: [Forms templating](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-templating-syntax/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Forms supports nested binding via **path notation in the field's Binding configuration**. Setting `Key/Path = address.street` on a text input tells the Forms engine to write the user-provided value to `address.street` within the form variable structure. The Forms runtime materialises the nested object correctly when the User Task completes. Other address fields use `address.city`, `address.postalCode` similarly.

- **Option b) — Incorrect.** Using `address.street` as the field name might appear similar but does not necessarily produce a nested object — the form library treats names as flat keys unless the Binding path is explicitly nested. The naming convention alone is insufficient.

- **Option c) — Incorrect.** Camunda 8 Forms supports nested data binding; flattening is not required.

- **Option d) — Incorrect.** Forms templating syntax `{{...}}` is for **dynamic content interpolation** in labels and conditions, not data binding. It does not auto-bind data on submit.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Binding path `address.street` е стандарт за nested data в Camunda 8 Forms.
- **b) 4/10** — naming-only подход е inconsistent; without explicit binding, поведението е variable.
- **c) 2/10** — невярно — nested binding се поддържа.
- **d) 2/10** — templating е за rendering, не data binding.

**Correct Answer:** Set the form field's Binding path to `address.street` (and similar `address.city`, `address.postalCode`).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-data-binding/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Simple fields work, nested object null" → разпознаваш че проблемът е **nested data binding configuration**, не form validation, не process variable scope.

**Въпросът → Solution Framing.** "Configure data binding to capture nested" е директна формулировка — изпитва се **знание за Forms binding mechanism**, не workaround.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 8 Forms има **dedicated Binding configuration** на ниво field, знаеш че path notation (`a.b.c`) creates nested object, знаеш че field names sa **identifiers** (не data paths сами по себе си), знаеш че templating syntax е за rendering. Това е знание за Camunda Forms config model.

---

## Question 31: Configuring Forms (Weighting: 5%)

**Scenario:** An insurance claim form has a "policy type" dropdown with options "auto", "home", "life". When the user selects "auto", an additional section with "vehicle make", "vehicle model", and "license plate" fields should appear. When they select "home", a different section with "address", "year built", "square footage" should appear. The form should NOT show irrelevant sections to keep the UI clean. The team is implementing this in Camunda 8 Forms.

**Which Forms feature enables this dynamic UI behaviour?**

- **a)** **Conditional rendering** — each form field/section has a "Show if" or "Conditional value" property accepting a FEEL expression. Setting `Show if = policyType = "auto"` on the vehicle fields makes them appear only when that condition is true. Documentation: [Form options](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-options/)

- **b)** **Multiple forms per User Task** — assign three forms (auto, home, life) and select the appropriate one based on a pre-task variable. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** **Form templating** with `{{#if policyType="auto"}}...{{/if}}` blocks. Documentation: [Forms templating](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-templating-syntax/)

- **d)** Custom JavaScript embedded in form properties controlling visibility programmatically. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Forms supports **conditional rendering** at the field/section level. Each field has a "Show if" or "Conditional" property that accepts a **FEEL expression**. The form re-renders reactively as user input changes — when `policyType` is set to "auto", fields with `Show if = policyType = "auto"` appear; "home"-conditional fields hide. This is the form-native way to implement dynamic UI.

- **Option b) — Incorrect.** Camunda 8 User Tasks bind to a single form. Multiple forms per task is not a configuration option.

- **Option c) — Incorrect.** Forms templating syntax `{{...}}` is for **value interpolation in labels and text**, not for conditional logic blocks. There is no `{{#if}}` Handlebars-style control flow.

- **Option d) — Incorrect.** Forms do not embed custom JavaScript. Logic is declarative via FEEL expressions in property values.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Conditional rendering чрез FEEL Show-if е каноничният Camunda Forms подход.
- **b) 2/10** — single form per task; multi-form не е feature.
- **c) 2/10** — templating е interpolation only, не conditional blocks.
- **d) 1/10** — без custom JavaScript; declarative FEEL only.

**Correct Answer:** Conditional rendering — each form field/section has a "Show if" property accepting a FEEL expression.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-options/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Show different fields based on selection" → разпознаваш че се иска **conditional rendering**, не multi-form switching, не client-side scripting.

**Въпросът → Solution Framing.** "Camunda 8 Forms" е критичен — изпитва се native Forms feature, не custom solution.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda Forms са **declarative** (FEEL expressions in field properties), знаеш че "Show if" property е стандарт за conditional rendering, знаеш че Forms не support-ват embedded JavaScript, знаеш че templating е interpolation не conditional blocks. Това е знание за Forms feature set.

---

## Question 32: Configuring Forms (Weighting: 5%)

**Scenario:** A B2B procurement form needs to capture an **invoice line-items table** where the user can add/remove rows dynamically. Each row has columns "item description", "quantity", "unit price". The form should output the line items as a **list of objects** in a process variable named `lineItems`, e.g., `[{description: "Widget A", quantity: 5, unitPrice: 12.50}, ...]`.

The developer is building this in Camunda 8 Forms using the **Table** component.

**How should the developer configure the Table component for correct data binding?**

- **a)** Set the Table's Binding to `lineItems` (the process variable). Define three column fields: `description`, `quantity`, `unitPrice`. Each column's Binding is relative to the row, automatically nested under `lineItems[*]`. Documentation: [Table data binding](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-table-data-binding/)

- **b)** Define three separate top-level fields: `lineItems_description`, `lineItems_quantity`, `lineItems_unitPrice`, each as an array. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Use a Group component with three text fields and FEEL `for...return` expression on submit to reshape into a list. Documentation: [FEEL list functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **d)** Tables in Camunda 8 Forms support only single-row data; for dynamic rows, use a Multi-Instance User Task. Documentation: [Multi-instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Forms' **Table component** supports dynamic-row table data binding. The Table binds to a single process variable (here `lineItems`) which is a list. Each column field has its own binding relative to the row — the Forms engine handles the list-of-objects shape automatically. Add/remove row UI is built into the Table component out of the box.

- **Option b) — Incorrect.** Separate flat-array fields lose the row structure (no per-row grouping); also clunky UX (three separate add buttons, no coherent row).

- **Option c) — Incorrect.** Building a custom Group + FEEL reshape is over-engineered when the Table component does exactly this natively.

- **Option d) — Incorrect.** Tables do support multi-row data. Multi-Instance User Task is a BPMN modeling concept, not a Forms feature.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Table component с list binding е каноничният подход.
- **b) 3/10** — flat arrays губят row structure; non-canonical.
- **c) 4/10** — over-engineering; reinventing what Table already does.
- **d) 1/10** — невярно — Tables подкрепят multi-row.

**Correct Answer:** Set the Table's Binding to `lineItems` (the process variable). Define three column fields: `description`, `quantity`, `unitPrice`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-table-data-binding/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Dynamic rows with add/remove" + "list of objects output" → разпознаваш че се иска **Table component с row-level binding**, не Multi-Instance, не custom group.

**Въпросът → Solution Framing.** "Configure Table component" — конкретно name-drop на Forms feature, изпитва се точно знание за Table binding.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda Forms Table component support-ва list-of-objects binding, знаеш че column fields binding е relative to row, знаеш че add/remove row UI е built-in, знаеш че Multi-Instance е BPMN concept (не Forms). Това е знание за Forms component library.

---

# Section 5 — Configuring Connectors (Questions 33-36)

> Weight 6% • Topics: Connector Secrets (SaaS vs Self Managed), Inbound and Outbound Connectors.

---

## Question 33: Configuring Connectors (Weighting: 6%)

**Scenario:** A team builds a Camunda 8 SaaS process that calls a third-party CRM API. The CRM API requires an API key passed in the `X-API-Key` request header. The team initially hardcodes the API key directly in the Outbound HTTP Connector's "Headers" property field — visible in the BPMN XML. During a security audit, this practice is flagged as a critical vulnerability: secrets in version-controlled BPMN files leak via Git history.

The team needs to **externalise the secret** so it lives in a secure store, not in the BPMN model.

**Which Camunda 8 SaaS mechanism stores the secret and how is it referenced in the Connector?**

- **a)** Define the secret in the **cluster's Secrets** view (Console UI for the SaaS cluster). Reference it in the Connector property as `{{secrets.CRM_API_KEY}}`. The Connector engine resolves the placeholder at runtime by looking up the cluster-level secret store. Documentation: [Connector Secrets](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Define the secret as a process-level variable with the value of the API key. Reference it in the Connector as `=apiKey`. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Store the secret in a `.env` file deployed alongside the BPMN. Reference it via `${env.CRM_API_KEY}`. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Encrypt the secret with a Camunda-provided key and embed the ciphertext in the BPMN. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 SaaS provides **cluster-level Secrets** managed via the Console UI. Each cluster has a secret store (separate from BPMN); users define `name → value` pairs. Connectors reference secrets via the **`{{secrets.NAME}}` placeholder syntax**. At runtime, the Connector engine substitutes the actual value before making the HTTP call. The BPMN XML contains only the placeholder, not the secret — safe to commit to Git.

- **Option b) — Incorrect.** Storing the secret in a process variable still leaks it into process state (visible in Operate), audit logs, and possibly downstream task contexts. Not a security-grade solution.

- **Option c) — Incorrect.** Camunda 8 SaaS does not use `.env` files; cluster secrets are managed in the Console UI.

- **Option d) — Incorrect.** Camunda does not offer client-side encryption of BPMN secrets; the proper mechanism is the externalised Secrets store.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Cluster Secrets store + `{{secrets.NAME}}` placeholder е стандартът.
- **b) 2/10** — process variable секрет leak-ва в audit logs / Operate; не е security-grade.
- **c) 2/10** — `.env` файлове не са Camunda SaaS pattern.
- **d) 1/10** — няма BPMN-embedded encryption mechanism.

**Correct Answer:** Define the secret in the cluster's Secrets view (Console UI). Reference as `{{secrets.CRM_API_KEY}}`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Secret in BPMN file" + "Git history leak" → разпознаваш че се иска **externalisation на secrets**, не encryption, не obfuscation.

**Въпросът → Solution Framing.** "Camunda 8 SaaS mechanism" е критично — конкретно SaaS, не Self Managed. Разликата е, че SaaS използва Console UI; SM използва Kubernetes secrets или Helm values.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SaaS Secrets живеят в **Console UI на cluster level**, знаеш че placeholder syntax е `{{secrets.NAME}}`, знаеш че process variables НЕ са secure store (visible in audit), знаеш че няма BPMN-embedded encryption. Това е знание за SaaS security architecture.

---

## Question 34: Configuring Connectors (Weighting: 6%)

**Scenario:** A retail merchant integration uses an **Inbound Webhook Connector** to receive payment notifications from a payment gateway. The webhook is configured on a Message Start Event in the BPMN process. The payment gateway sends an HTTPS POST with a JSON body to the Camunda 8 SaaS cluster's webhook URL. The Inbound Connector parses the body, **correlates** the payment to a running process instance via `order_id`, and triggers the Message Catch Event.

The team observes that for high-volume merchants (1000+ payments/hour), some webhooks are **silently lost** — Camunda accepts the HTTP 200 acknowledgement but the corresponding process instance never receives the message. Operate's incident view shows no errors.

**What is the most common root cause and the correct configuration?**

- **a)** The webhook's **correlation key expression** is incorrect — when it can't extract `order_id` from the payload (e.g., wrong JSONPath), the Connector logs an internal error but **returns HTTP 200 to the gateway anyway**, silently dropping the event. Verify the correlation key FEEL expression against actual payload structure. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** The webhook endpoint is being rate-limited by Camunda SaaS infrastructure; requests above 100/min are dropped. Documentation: [SaaS rate limits](https://docs.camunda.io/docs/components/console/manage-clusters/)

- **c)** The webhook is processed asynchronously and TTL on the messages is too short; increase TTL to 24 hours. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **d)** Camunda 8 webhooks have a per-cluster maximum of 1000 messages per day; merchants above this need self-managed deployment. Documentation: [SaaS limits](https://docs.camunda.io/docs/components/console/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Inbound Webhook Connectors in Camunda 8 work by extracting a **correlation key** from the incoming payload using a configured FEEL expression (e.g., `=body.metadata.order_id`). If the expression fails to resolve (typo, missing field, wrong path), the Connector typically returns HTTP 200 to avoid retries from the source, then logs the error in cluster logs. Without explicit error visibility in Operate, this manifests as "silent loss". The fix is to validate the correlation key expression against actual payload samples, ensure the field always exists, and configure error handling (e.g., dead-letter queue or alert via cluster log monitoring).

- **Option b) — Incorrect.** Camunda SaaS does have rate limits but they are explicitly documented and the rejection is visible (HTTP 429). The scenario states HTTP 200 is returned — not consistent with rate limiting.

- **Option c) — Incorrect.** TTL is for messages buffered awaiting subscription, not for inbound webhook processing. Setting longer TTL doesn't address correlation key failure.

- **Option d) — Incorrect.** SaaS has scaling tiers but does not impose hard 1000/day limits silently. The scenario's "silent loss" pattern is consistent with correlation key issues, not infrastructure caps.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Webhook correlation key failure с silent HTTP 200 е classic Connector trap.
- **b) 3/10** — rate limiting е visible (429), не silent. Wrong axis.
- **c) 2/10** — TTL е за message buffering, не webhook processing.
- **d) 2/10** — invented limit; не е документиран.

**Correct Answer:** The webhook's correlation key expression is incorrect — when it can't extract `order_id` from the payload, the Connector logs an internal error but returns HTTP 200 anyway, silently dropping the event.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Silently lost" + "HTTP 200 acknowledged" + "no errors in Operate" → разпознаваш че проблемът е **correlation failure between Connector and process** (нещо между webhook receipt и process activation), не infrastructure.

**Въпросът → Solution Framing.** "Silently lost" е критичен сигнал — изключва решения с visible errors (rate limit 429). Търси се корен на silent drop.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Inbound Connectors extract correlation key чрез FEEL expression от payload, знаеш че failed correlation typically returns 200 (за да предотврати source retry storm), знаеш че TTL е за message buffering not webhook handling, знаеш че SaaS rate limits returns 429 visibly. Това е знание за Connector engine internals + common silent-failure modes.

---

## Question 35: Configuring Connectors (Weighting: 6%)

**Scenario:** A bank's loan-origination process orchestrates calls to multiple back-office systems: credit bureau (Experian REST API), document storage (S3), email notifications (SendGrid). Each system has a stable, well-documented REST API. The team is deciding **for each integration** whether to use the **out-of-the-box Outbound Connectors** (Camunda's bundled HTTP REST Connector, S3 Connector, SendGrid Connector) or to write **custom Java Job Workers** that call the APIs.

The architect needs to articulate a decision framework: "when does an Outbound Connector fit, and when does a custom Job Worker fit?"

**Which of the following correctly describes the trade-off?**

- **a)** **Outbound Connectors** fit when the integration is **declarative** (standard HTTP/REST, no complex business logic during the call) and the API has a stable contract. **Custom Job Workers** fit when the integration needs imperative logic (state tracking, conditional retries, complex error handling, transformations not expressible in FEEL). Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Outbound Connectors are always preferred — Job Workers are legacy and being deprecated. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Custom Job Workers are always preferred — Outbound Connectors are limited to specific vendor integrations. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Outbound Connectors and Job Workers are functionally identical; the choice is purely stylistic. Documentation: [Connectors vs Workers](https://docs.camunda.io/docs/components/connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** This is the canonical decision framework. **Outbound Connectors** shine for declarative integrations: HTTP REST with simple JSON payloads, standard authentication (Bearer, API key, OAuth2), and predictable error handling. Configuration is in the BPMN model (XML), making the integration **transparent and version-controlled**. **Custom Job Workers** are needed when the integration involves **imperative orchestration** that doesn't fit Connector configuration: chained API calls with shared state, custom retry policies, polling loops, complex error transformation, type marshalling that exceeds FEEL's capability.

- **Option b) — Incorrect.** Job Workers are not deprecated — they remain the foundation for custom integrations in Camunda 8.

- **Option c) — Incorrect.** Outbound Connectors are not limited to specific vendors; the generic HTTP REST Connector handles any REST API. Camunda also has specific bundled Connectors (S3, SendGrid, etc.) for convenience.

- **Option d) — Incorrect.** They have meaningful functional differences (declarative vs imperative, BPMN-embedded vs external code), not just stylistic preferences.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Декларативна vs imperative е каноничното разграничение.
- **b) 2/10** — Job Workers не са deprecated.
- **c) 2/10** — обратно невярно — Outbound Connectors не са vendor-limited.
- **d) 1/10** — false equivalence.

**Correct Answer:** Outbound Connectors fit when the integration is declarative (standard HTTP/REST, no complex business logic). Custom Job Workers fit when the integration needs imperative logic.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "When does Connector fit vs Worker" → разпознаваш че въпросът е архитектурен trade-off, не feature-comparison.

**Въпросът → Solution Framing.** "Decision framework" в въпроса е за **principled choice**, не "which is better". Това отрязва extremist answers (option b/c).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Outbound Connectors са **configuration-driven** (declarative, в BPMN), знаеш че Job Workers са **code-driven** (imperative, in worker process), знаеш че FEEL capability limit-ва Connector flexibility, знаеш че Job Workers са foundation на Camunda 8 (не deprecated). Това е знание за integration architecture choices.

---

## Question 36: Configuring Connectors (Weighting: 6%)

**Scenario:** A team migrating a Camunda 8 self-managed (SM) deployment from version 8.7 to 8.8 reads in the upgrade notes that **Connector secret resolution** differs between SM and SaaS. In SaaS, secrets are configured via the Console UI; in SM, the team has been using environment variables on the Connector runtime container. After the 8.8 upgrade, an Outbound Connector's reference `{{secrets.DB_PASSWORD}}` fails with "secret not found".

The team checks the Connector runtime container's environment — the `DB_PASSWORD` env var **is set correctly**. They check the BPMN — the placeholder syntax is correct. Yet the Connector cannot resolve the secret at runtime.

**What is the likely cause specific to Self-Managed Connector secret configuration?**

- **a)** In Self-Managed, the Connector runtime needs to be **explicitly configured to read secrets from environment variables** via the `CAMUNDA_CONNECTOR_SECRETS_PROVIDER` setting. Without this, the runtime defaults to a different provider that returns "not found". Documentation: [Connector Secrets](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Self-Managed only supports secrets via Kubernetes Secrets, not environment variables. Migrate the secret to a Kubernetes Secret. Documentation: [Self-Managed deployment](https://docs.camunda.io/docs/self-managed/)

- **c)** Connector secret references must be prefixed with `env.` for SM: `{{env.DB_PASSWORD}}`. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Self-Managed does not support Connector secrets; hardcode the value in the BPMN with explicit security review approval. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Self-Managed Connector runtime supports **multiple secret providers**: environment variables, Kubernetes Secrets, AWS Secrets Manager, HashiCorp Vault, etc. The provider is selected via configuration (typically `CAMUNDA_CONNECTOR_SECRETS_PROVIDER=ENVIRONMENT` for env vars). Without explicit configuration, the runtime falls back to a default provider (usually empty or non-functional), producing "secret not found" even when the env var is correctly set. The fix is to explicitly configure the secret provider in the Connector runtime container's environment.

- **Option b) — Incorrect.** SM supports multiple providers; Kubernetes Secrets is one option but not the only one.

- **Option c) — Incorrect.** The placeholder syntax `{{secrets.NAME}}` is unified across SaaS and SM. There is no `env.` prefix.

- **Option d) — Incorrect.** SM fully supports Connector secrets; hardcoding is never acceptable.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. SM Connector runtime изисква **explicit secret provider configuration**.
- **b) 4/10** — частично — K8s Secrets е една опция, но не задължителна.
- **c) 2/10** — invented syntax; placeholder е unified.
- **d) 1/10** — невалидна препоръка.

**Correct Answer:** In Self-Managed, the Connector runtime needs to be explicitly configured to read secrets from environment variables via the `CAMUNDA_CONNECTOR_SECRETS_PROVIDER` setting.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Env var set" + "placeholder correct" + "secret not found" → разпознаваш че проблемът е **в Connector runtime's secret provider selection**, не в env var presence, не в BPMN syntax.

**Въпросът → Solution Framing.** "Specific to Self-Managed" е критично — изпитва се **SM-vs-SaaS difference** в secret configuration. Това отрязва решения базирани на BPMN-side syntax (option c).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SM Connector runtime е **separate component** (от Zeebe broker), знаеш че secret providers са **pluggable** (env, K8s Secrets, Vault, AWS SM), знаеш че default behaviour може да е non-functional, знаеш че placeholder syntax е uniform across SaaS/SM. Това е знание за SM deployment architecture + Connector runtime internals.

---



# Section 6 — Developing Extensions & Integrations (Questions 37-50)

> Weight 25% • Topics: FEEL Expressions, Custom Connectors (Connector SDK), Job Workers, Camunda APIs (Administration, Orchestration Cluster, Optimize, Web Modeler, Zeebe gRPC), RPA Workers.

---

## Question 37: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A loan approval process uses a Business Rule Task that calls a DMN decision evaluating the applicant's eligibility. The DMN takes a FEEL input column expression `applicantBirthDate < date("2008-01-01")` to check whether the applicant is at least 18 years old as of a fixed regulatory cutoff. Production users start reporting "FEEL evaluation failure: cannot compare strings with dates" incidents. Investigation shows that the upstream system sometimes provides `applicantBirthDate` as a string (`"1990-05-15"`) and sometimes as a proper FEEL date (`date and time("1990-05-15")`), depending on how the data flows in.

The team needs a FEEL expression that **defensively handles both cases** — string and native date — and returns a comparable date.

**Which FEEL expression correctly normalises the input?**

- **a)** `date(applicantBirthDate) < date("2008-01-01")` — FEEL's `date()` function accepts both ISO-8601 strings and date objects, returning a date in either case. Documentation: [FEEL temporal functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** `if applicantBirthDate is string then date(applicantBirthDate) else applicantBirthDate < date("2008-01-01")` — explicit type check before comparison. Documentation: [FEEL conditional](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

- **c)** `applicantBirthDate as date < date("2008-01-01")` — FEEL `as` keyword forces type coercion. Documentation: [FEEL type coercion](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

- **d)** `try date(applicantBirthDate) catch (date("1900-01-01")) < date("2008-01-01")` — try/catch for safe parsing. Documentation: [FEEL error handling](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's `date(x)` built-in function is **overloaded**: it accepts a string in ISO-8601 format (`"YYYY-MM-DD"`) and returns a date; it also accepts an existing date value and returns it unchanged. This means `date(applicantBirthDate)` works for both shapes — string or date — returning a comparable date in either case. The comparison `< date("2008-01-01")` then operates on two date values cleanly.

- **Option b) — Working but verbose.** Explicit type checking via `if applicantBirthDate is string then ... else ...` works but is more code than needed. The `date()` function's overload handles both cases natively.

- **Option c) — Incorrect.** FEEL does not have an `as` keyword for type coercion in this form. Type checks are done via `is` (predicate) and value conversion via function calls like `date()`, `string()`, `number()`.

- **Option d) — Incorrect.** FEEL does not have `try/catch` syntax. Error handling in FEEL is via null-propagation (operations on null return null), not exceptions.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `date(x)` overload е каноничното FEEL pattern.
- **b) 6/10** — работи но verbose; излишен type check.
- **c) 2/10** — `as` не е FEEL syntax.
- **d) 1/10** — `try/catch` не е FEEL syntax.

**Correct Answer:** `date(applicantBirthDate) < date("2008-01-01")` — FEEL's `date()` function accepts both ISO-8601 strings and date objects.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Sometimes string, sometimes date" + "evaluation failure on type mismatch" → разпознаваш че проблемът е **defensive type normalisation в FEEL**, не data quality upstream fix, не engine bug.

**Въпросът → Solution Framing.** "Defensively handles both cases" е директна формулировка — изпитва се **FEEL built-in function knowledge** и conscious choice of idiomatic vs verbose patterns.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL `date()` е overloaded function (string или date input), знаеш че FEEL **няма** try/catch / as syntax (различно от Java/TypeScript), знаеш че type predicates са `is string`, `is date`, etc., знаеш че null propagation е FEEL's error handling model. Това е знание за FEEL standard library и language semantics.

---

## Question 38: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A team is computing a customer's monthly spending category breakdown using FEEL. The input is a process variable `transactions` — a list of objects, each with `category` (string) and `amount` (number). The team needs to produce a single FEEL expression returning a **filtered subset**: only the transactions where category is "groceries" AND amount > 50.

**Which FEEL expression is correct?**

- **a)** `transactions[category = "groceries" and amount > 50]` — filter via predicate inside square brackets. Documentation: [FEEL list filter](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** `filter(transactions, function(t) t.category = "groceries" and t.amount > 50)` — explicit FEEL filter function with lambda. Documentation: [FEEL filter](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **c)** `transactions.filter(item -> item.category = "groceries" && item.amount > 50)` — JavaScript-style filter. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `for t in transactions return if t.category = "groceries" and t.amount > 50 then t else null` — for...return pattern with conditional. Documentation: [FEEL for return](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's **list filter** syntax uses square brackets after the list expression with a predicate inside. The predicate references item attributes directly (no need for variable name like `t`) — FEEL implicitly scopes each item's fields. Multi-condition filters use FEEL's logical operators `and`, `or`. This produces a filtered list of matching items.

- **Option b) — Suboptimal.** While FEEL does have a `filter()` function and supports anonymous functions, the bracket notation `[predicate]` is the idiomatic and more concise FEEL form. Both work but `[predicate]` is what the DMN/FEEL spec recommends.

- **Option c) — Incorrect.** FEEL is not JavaScript. There is no `.filter()` method on lists, no `=>` arrow functions, and `&&` is `and` in FEEL.

- **Option d) — Working but produces nulls.** The `for...return` with conditional produces a list with nulls for non-matching items, which is different from a filtered list. Would need `[remove null values]` or `filter` to clean up.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `list[predicate]` е каноничният FEEL filter syntax.
- **b) 7/10** — работи но не е idiomatic; bracket form е preferred.
- **c) 1/10** — JavaScript syntax, не FEEL.
- **d) 4/10** — for-return с conditional дава list с nulls; не е true filter.

**Correct Answer:** `transactions[category = "groceries" and amount > 50]` — filter via predicate inside square brackets.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Filter list by predicate with AND condition" → разпознаваш че се иска **FEEL idiomatic list filter syntax**, не general FP-style filter, не SQL-style query.

**Въпросът → Solution Framing.** Изпитва се **знание за FEEL list syntax**, конкретно bracket filter notation срещу alternative styles. Distractors imitirat други езици — typical "trapping by familiarity" pattern.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL list filter е `list[predicate]` syntax, знаеш че predicate references item fields **implicitly** (no `t.` prefix), знаеш че FEEL логически операторите са `and` / `or` / `not` (не `&&`/`||`/`!`), знаеш че FEEL has `filter()` function но bracket notation е preferred. Това е знание за FEEL syntax purity.

---

## Question 39: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression computes the average review score for a product: `avg(reviews[*].score)`. In testing, when the `reviews` list is empty (a new product with no reviews), the expression returns `null`. Downstream tasks then receive null and fail. The team wants to ensure the expression returns `0` (or some default) when the list is empty.

**Which FEEL expression handles the empty list case correctly?**

- **a)** `if count(reviews) = 0 then 0 else avg(reviews[*].score)` — explicit null/empty check. Documentation: [FEEL conditional](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

- **b)** `avg(reviews[*].score) ?? 0` — null-coalescing operator. Documentation: [FEEL operators](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

- **c)** `coalesce(avg(reviews[*].score), 0)` — coalesce built-in. Documentation: [FEEL functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-introduction/)

- **d)** `avg(reviews[*].score) or 0` — boolean OR fallback. Documentation: [FEEL operators](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Idiomatic FEEL handles null/empty with **explicit `if-then-else`**. `count(reviews) = 0` checks emptiness; if empty, return 0; otherwise compute the average. This is the canonical FEEL pattern for "default when empty" because FEEL prefers explicit logic over implicit operator magic.

- **Option b) — Incorrect.** FEEL does not have a `??` null-coalescing operator. This is JavaScript/TypeScript/Kotlin syntax, not FEEL.

- **Option c) — Incorrect.** FEEL does not have a built-in `coalesce()` function. This syntax is from SQL or some other FEEL-like languages but not Camunda's FEEL.

- **Option d) — Incorrect.** FEEL's `or` operator is **boolean only** — `null or 0` doesn't return `0`. It returns null because `or` operates on boolean values; `null or 0` is a type error.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Explicit `if-then-else` е idiomatic FEEL за null/default handling.
- **b) 1/10** — `??` не е FEEL operator.
- **c) 1/10** — `coalesce` не е FEEL built-in.
- **d) 1/10** — `or` е boolean, не value-fallback.

**Correct Answer:** `if count(reviews) = 0 then 0 else avg(reviews[*].score)` — explicit null/empty check.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Empty list returns null" + "downstream fails" → разпознаваш че се иска **FEEL null-defensive expression**, не data fix, не downstream handler.

**Въпросът → Solution Framing.** "Handles empty list case correctly" — търси се FEEL-native syntax, а не familiar-from-other-languages operators. Distractor philosophy използва programmer reflexes (`??`, `coalesce`, `or`).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL **няма** `??` или `coalesce()` (различно от TS/Kotlin/SQL), знаеш че FEEL `or` е strict boolean (type-checked), знаеш че explicit `if-then-else` е canonical, знаеш че `count()` е FEEL built-in за length. Това е знание за FEEL spec и общите trap-ове от cross-language reflexes.

---

## Question 40: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A Camunda 8 process variable named `customer` is a complex context (object) with fields `name`, `email`, `address` (nested context with `street`, `city`, `country`), and `orders` (list). A FEEL expression elsewhere needs to access `customer.address.country` to determine VAT calculation. Sometimes `customer.address` is null (customers who haven't completed onboarding).

The team needs a FEEL expression that safely returns the country string OR `"UNKNOWN"` if the address is missing.

**Which FEEL expression correctly handles the nullable nested access?**

- **a)** `if customer.address = null then "UNKNOWN" else customer.address.country` — explicit null check on parent before nested access. Documentation: [FEEL conditional](https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/)

- **b)** `customer.address.country ?? "UNKNOWN"` — null-coalescing. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `customer.address?.country ?: "UNKNOWN"` — null-safe navigation + Elvis operator. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Accessing `customer.address.country` when `customer.address` is null automatically returns `null` in FEEL, so wrap with `if customer.address.country = null then "UNKNOWN" else customer.address.country`. Documentation: [FEEL contexts](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-context/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Idiomatic FEEL approach: check the **parent** for null before nested access. FEEL's path navigation `customer.address.country` is null-propagating — accessing a field of null returns null — but explicit conditional makes the logic clear and the FEEL evaluator handles all edge cases cleanly.

- **Option b) — Incorrect.** No `??` operator in FEEL.

- **Option c) — Incorrect.** Neither `?.` (null-safe navigation) nor `?:` (Elvis) exist in FEEL. These are TypeScript/Kotlin operators.

- **Option d) — Partially correct mechanism, suboptimal pattern.** FEEL **does** propagate null through path navigation (so `customer.address.country` returns null when `customer.address` is null), so the wrapped expression works. But it's idiomatically inferior to checking the parent — and there's a subtle danger: if `customer` itself is null, you still need to check at the right level. Option a is cleaner.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Explicit null check на parent е canonical и safe.
- **b) 1/10** — `??` не е FEEL.
- **c) 1/10** — `?.` / `?:` не са FEEL.
- **d) 6/10** — relies on null propagation; работи но less idiomatic.

**Correct Answer:** `if customer.address = null then "UNKNOWN" else customer.address.country` — explicit null check on parent before nested access.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Sometimes address is null" + "safe access to nested country" → разпознаваш че се иска **null-safe nested navigation в FEEL**, не data validation.

**Въпросът → Solution Framing.** "Correctly handles" — изпитва се knowledge of FEEL operators (или липсата им). Trap-ovete заемат syntax от популярни езици (TS, Kotlin).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL **няма** `?.` / `?:` / `??` operators (NO syntactic sugar за null), знаеш че FEEL **does** propagate null through path navigation, знаеш че explicit `if-then-else` на parent е idiomatic, знаеш че path navigation е safe от runtime exception но може да върне null надолу. Това е знание за FEEL evaluation model.

---

## Question 41: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A high-throughput payment processing system runs in Camunda 8 SaaS. The team has a Java Job Worker subscribed to type `"process-payment"`. Initially the worker uses traditional polling (`pollInterval = 100ms`, `requestTimeout = 1000ms`). Under load, the team observes high P99 latency on payment processing — average 200 ms but P99 can spike to 1500 ms even when the worker is otherwise idle.

A colleague suggests migrating to **streamJobs** (gRPC streaming activation), introduced in Camunda 8.5+, for push-based delivery.

**What is the correct understanding of streamJobs vs polling, and why might it reduce P99 latency here?**

- **a)** `streamJobs` opens a **long-lived gRPC stream** between worker and broker; new jobs are **pushed to the worker as soon as they appear** in the broker, eliminating the polling-interval wait. Polling has unavoidable wakeup latency (poll, wait, return). Streaming eliminates this for the activation half of the latency budget. Documentation: [Job worker streaming](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** `streamJobs` and polling are functionally equivalent; the latency difference comes from worker-side processing speed, not activation. Documentation: [Job workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** `streamJobs` is for read-only observation of jobs; it doesn't activate them. Polling remains required for activation. Documentation: [Job workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** `streamJobs` is a Self-Managed-only feature; SaaS clusters cannot use it. Documentation: [SaaS features](https://docs.camunda.io/docs/components/console/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Polling-based activation has a structural latency floor: even if the broker has a job ready immediately, the worker only learns about it on the next poll. With `pollInterval = 100ms`, the worst-case activation wakeup wait is 100 ms (idle case, the worker is between polls). Adding broker processing + network adds to this. **`streamJobs`** changes this model: the worker opens a long-lived gRPC stream and the broker **pushes** new jobs immediately. Activation half of latency drops from ~100 ms-worst to effectively a network round trip (~1-5 ms). This explains why P99 spikes when polling — pollInterval timing variability dominates. Streaming smooths this out.

- **Option b) — Incorrect.** They are not functionally equivalent — polling has structural wakeup latency that streaming eliminates.

- **Option c) — Incorrect.** `streamJobs` does activate jobs; it's the streaming version of `activateJobs`.

- **Option d) — Incorrect.** `streamJobs` is available in both SaaS and SM.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. streamJobs eliminates polling wakeup latency; explains P99 spikes.
- **b) 2/10** — невярно — не са functionally equivalent.
- **c) 2/10** — невярно — streamJobs activate jobs.
- **d) 2/10** — невярно — налично в SaaS и SM.

**Correct Answer:** `streamJobs` opens a long-lived gRPC stream between worker and broker; new jobs are pushed to the worker as soon as they appear in the broker, eliminating the polling-interval wait.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "P99 latency spikes when idle" + "polling at 100ms" + "streamJobs suggestion" → разпознаваш че проблемът е **polling wakeup latency**, не worker speed, не broker throughput. P99 spike pattern е classic polling-interval signal.

**Въпросът → Solution Framing.** "Why might it reduce P99 latency" изисква **mechanism explanation**, не feature comparison. Изключва equivalence claims.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че polling activation има **structural minimum wakeup latency** (pollInterval), знаеш че streaming е push-based чрез long-lived gRPC stream, знаеш че P99 латентност е sensitive to polling interval timing variability, знаеш че streaming е достъпно в both SaaS и SM в 8.5+. Това е знание за Zeebe gRPC API + general distributed-systems push/pull patterns.

---

## Question 42: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A team's Spring Zeebe-based Java Job Worker processes claims via a Service Task. The worker's `@JobWorker` method takes a couple of minutes on average to call out to a slow downstream legacy system. Recently, ops noticed that **some jobs are being processed twice** — the legacy system has internal deduplication so business-impact is low, but the logs show duplicate worker invocations for the same `jobKey`. The worker's `timeout` is set to default (5 minutes).

The team checks worker logs: the duplicated invocations are spaced **about 5 minutes apart** — the first invocation, then 5 minutes later a second invocation for the same job, even though the worker completed the job successfully between them.

**What is the most likely cause?**

- **a)** The worker's job processing takes longer than the timeout for a small fraction of jobs (network spike, GC pause, JVM hiccup). When the timeout expires, **Zeebe re-activates the job**, sending it to another worker (or the same worker again) which causes the duplicate invocation. Increase timeout or implement idempotency. Documentation: [Job worker timeout](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Spring Zeebe has a bug where it sometimes re-invokes the same `@JobWorker` method twice. Upgrade Spring Zeebe library. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** Zeebe creates a duplicate job in the broker when the worker's `completeJob` ACK doesn't arrive within 100 ms. Tune ACK timeout. Documentation: [Job workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** The legacy system is sending duplicate webhooks back to Camunda, triggering the same process twice. Investigate the legacy system. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** This is the **at-least-once delivery** behaviour of Zeebe: when a worker activates a job, it holds a **lock** for the configured `timeout`. If the worker doesn't call `completeJob` or `failJob` within that window, **Zeebe re-activates the job** (sends it back to the pool) so that it can be picked up — possibly by the same worker on next poll. The "5 minutes apart" pattern in logs strongly indicates the original worker's processing exceeded the timeout, even if it completed successfully before the timeout (the ACK might have been late). The fix is to set timeout longer than P99.9 processing time AND implement idempotency in the worker or downstream.

- **Option b) — Incorrect.** Spring Zeebe does not have this bug; the duplicate-invocation pattern is Zeebe's documented at-least-once delivery, not a library defect.

- **Option c) — Incorrect.** ACK timeout is not 100 ms; complete-job ACK semantics are different from job lock expiry.

- **Option d) — Incorrect.** The scenario specifies the worker's invocations are duplicated, not that new process instances are starting. Legacy system webhooks would create new instances, not duplicate worker invocations on the same `jobKey`.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. At-least-once delivery + timeout expiry е canonical Zeebe behaviour за this pattern.
- **b) 2/10** — Spring Zeebe няма този bug.
- **c) 2/10** — невярна ACK semantics.
- **d) 3/10** — webhook ducplicate би създало нови процеси, не worker duplicate invocations.

**Correct Answer:** The worker's job processing takes longer than the timeout for a small fraction of jobs. When the timeout expires, Zeebe re-activates the job.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Duplicate worker invocations" + "5 minutes apart" + "default timeout 5 min" → разпознаваш че проблемът е **job timeout expiry + at-least-once re-activation**. 5-минутен interval е exact match за default timeout — strong signal.

**Въпросът → Solution Framing.** "Most likely cause" изисква **probabilistic diagnosis** — coincidence на 5-min interval с default timeout е почти сигурно root cause.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe е at-least-once delivery by design, знаеш че job timeout = lock duration, знаеш че timeout expiry без completeJob → re-activation, знаеш че идемпотентност + adequate timeout е стандартния fix. Това е знание за Zeebe job lifecycle.

---

## Question 43: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A team is integrating a Camunda 8 process with an external SAP ERP system. The integration needs to:
1. Call SAP's BAPI service to fetch order details
2. Process the response (transform JSON, enrich with local data)
3. Write back to SAP via another BAPI call

The team is debating between two architectural choices: **(A)** build the integration as **three sequential Outbound HTTP Connectors** with FEEL transforms in between, or **(B)** build a **single Custom Connector** using the Connector SDK that internally orchestrates the three calls and the transformation. The SAP integration is unlikely to be reused in other processes.

**Which choice fits this scenario best, and why?**

- **a)** Three sequential Outbound Connectors with FEEL transforms — **declarative integration** stays in the BPMN model, FEEL handles transforms, easy to audit each step in Operate, no custom code to maintain. Best for one-off integrations where logic is straightforward. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Single Custom Connector — encapsulates the three calls and transform inside one Connector element; the BPMN remains clean (one element instead of three). Custom Connector SDK gives full Java control. Best for reusable, complex integrations. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** A **standard Service Task with a Java Job Worker** — fully imperative, no Connector overhead, full control over orchestration. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** An **RPA worker** — RPA is designed for complex multi-step integrations with legacy systems. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** For a **one-off, straightforward integration** where each step is a simple HTTP call with FEEL-expressible transformations, three sequential Outbound Connectors is the canonical choice. Each Connector is a separate BPMN element — auditable individually in Operate (per-step status, per-step retries), easy to debug, and configuration lives in the BPMN model. There is no custom Java code to build, test, or maintain. Custom Connector SDK is appropriate when you need reuse across processes or when the orchestration logic exceeds Connector + FEEL capability.

- **Option b) — Suboptimal for one-off.** Custom Connector hides three steps inside one BPMN element, sacrificing per-step audit in Operate. The Connector SDK requires Java development, testing, deployment, versioning — overhead unjustified for a one-off integration. Best reserved for genuinely reusable integrations.

- **Option c) — Suboptimal.** Job Worker with imperative Java works but loses the Connector-driven declarative configuration benefits — no Element Template, no Web Modeler integration, more code than Connectors require.

- **Option d) — Incorrect.** RPA is for **UI automation** of legacy desktop applications without APIs; SAP has BAPI APIs and is reachable via HTTP. RPA is the wrong tool entirely.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Three sequential Outbound Connectors + FEEL е best fit за one-off declarative integration.
- **b) 5/10** — работещо choice но overhead за one-off; губи per-step audit.
- **c) 4/10** — works but loses Connector declarative benefits.
- **d) 1/10** — RPA е за UI automation, не API integration.

**Correct Answer:** Three sequential Outbound Connectors with FEEL transforms.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Three API calls + transform" + "one-off (not reused)" + "SAP has APIs" → разпознаваш че се иска **declarative simple-integration choice**, не custom code, не RPA.

**Въпросът → Solution Framing.** "Fits best, and why" изисква **reasoning chain** (rationale), не само verdict. "One-off" в scenario е критичен сигнал — изключва reusability arguments.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Outbound Connectors дават per-step audit в Operate, знаеш че FEEL може да handle прости transformations, знаеш че Custom Connector SDK е overhead за one-off use, знаеш че RPA ≠ API integration. Това е знание за Camunda 8 integration architecture trade-offs.

---



## Question 44: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A team builds a Java Job Worker using **Spring Zeebe** (the Spring-Boot-friendly Zeebe client library). They want a single Spring Boot application to host **three workers** subscribed to different job types: `validate-claim`, `enrich-claim-data`, `archive-claim`. Each worker has its own business logic.

A junior developer attempts to register the workers by creating three classes each with a `@Component` annotation and a method named `handle`. The expectation is that Spring Zeebe auto-discovers them. After deployment, **only the first registered worker actually subscribes to the broker** — the other two never receive jobs.

**Which annotation pattern correctly registers multiple workers in a Spring Zeebe Boot application?**

- **a)** Each worker method is annotated with `@JobWorker(type = "validate-claim")`, `@JobWorker(type = "enrich-claim-data")`, `@JobWorker(type = "archive-claim")`. Spring Zeebe auto-discovers all methods with `@JobWorker` and subscribes each to its declared job type. Documentation: [Spring Zeebe SDK](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** Each worker class is annotated with `@Component` and `@WorkerScope("validate-claim")` — class-level scope tells Spring Zeebe which job type to subscribe. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** Each worker method must be inside a class annotated with `@RestController` for Spring Zeebe to detect it. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** Spring Zeebe supports only one worker per JVM; deploy three separate applications. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Spring Zeebe SDK uses the `@JobWorker(type = "...")` method-level annotation to identify worker methods. Each annotated method becomes a separate subscription to the broker. The library auto-discovers all `@JobWorker` annotations at startup and registers them. The junior developer's mistake was using `@Component` alone without `@JobWorker` per method — auto-discovery doesn't trigger without the specific annotation.

- **Option b) — Incorrect.** `@WorkerScope` is not a Spring Zeebe annotation. Worker registration is method-level via `@JobWorker`.

- **Option c) — Incorrect.** `@RestController` is for HTTP REST endpoints, unrelated to Spring Zeebe worker registration.

- **Option d) — Incorrect.** Spring Zeebe supports many workers per JVM — that's the whole point of the SDK pattern.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `@JobWorker(type)` е каноничната Spring Zeebe annotation.
- **b) 2/10** — `@WorkerScope` не е реална annotation.
- **c) 2/10** — `@RestController` е HTTP, irrelevant.
- **d) 1/10** — невярно — много workers per JVM.

**Correct Answer:** Each worker method is annotated with `@JobWorker(type = "validate-claim")`, etc.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Only first worker subscribes" + "missing @JobWorker annotation" → разпознаваш че проблемът е **липсваща Spring Zeebe annotation**, не Spring Boot config, не Java packaging.

**Въпросът → Solution Framing.** "Correct annotation pattern" — изпитва се knowledge на specific Spring Zeebe SDK conventions.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Spring Zeebe е method-level discovery (не class-level), знаеш че `@JobWorker(type)` carries job type binding, знаеш че разни annotations (@RestController, @WorkerScope) са inventions или irrelevant, знаеш че много workers per JVM е стандарт. Това е знание за Spring Zeebe SDK conventions.

---

## Question 45: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A team builds a Node.js-based microservice that needs to handle Camunda 8 Service Tasks via a job worker. The team chooses the official **TypeScript Zeebe SDK** (Camunda 8 supports both JavaScript and TypeScript clients). They want to register a worker that:
- Subscribes to job type `"send-email"`
- Has a 30-second job timeout
- Processes max 10 jobs concurrently
- Calls SendGrid API to send the email
- Reports success or failure back to Zeebe

**Which TypeScript SDK pattern is correct?**

- **a)** Use `zbc.createWorker({ taskType: "send-email", timeout: Duration.seconds.of(30), maxJobsToActivate: 10, taskHandler: async (job) => { ... return job.complete(...) or job.fail(...) } })` — declarative single-call worker creation. Documentation: [TypeScript SDK](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

- **b)** Implement a Node.js HTTP server on port 8081 that Camunda's broker calls via webhook for each job. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Use `zbc.subscribeToJobs("send-email", function callback(jobs) { ... })` — synchronous callback registration. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

- **d)** Use `zbc.activateJobs("send-email")` in a setInterval loop. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The TypeScript SDK exposes `zbc.createWorker(...)` as the canonical worker registration API. The configuration object includes `taskType`, `timeout` (with the `Duration` helper for type-safe durations), `maxJobsToActivate`, and an `async taskHandler` function. Inside the handler, the worker receives a job object, performs work, and calls `job.complete(variables)` or `job.fail(errorMessage)` to ACK back to Zeebe. This is declarative, type-safe, and the framework handles polling/streaming, timeout, retries internally.

- **Option b) — Incorrect.** Camunda's broker does not call workers via webhook. Workers initiate the connection (poll or stream) to the broker.

- **Option c) — Incorrect.** No such API; not the canonical SDK shape.

- **Option d) — Incorrect.** `activateJobs` is a low-level command; using it in setInterval bypasses the SDK's worker infrastructure (retry, ACK, timeout handling).

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `createWorker` с declarative config е каноничен TS SDK pattern.
- **b) 1/10** — broker не calls webhooks; workers initiate.
- **c) 2/10** — invented API.
- **d) 4/10** — low-level activateJobs работи, но bypass-ва SDK lifecycle management.

**Correct Answer:** `zbc.createWorker({ taskType: "send-email", timeout: Duration.seconds.of(30), maxJobsToActivate: 10, taskHandler: async (job) => { ... } })`.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Node.js + TypeScript Zeebe SDK + worker registration" → разпознаваш че се иска **SDK-canonical worker creation pattern**, не low-level API access.

**Въпросът → Solution Framing.** "Correct pattern" — изпитва се knowledge на TS SDK API shape.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe TS SDK има `createWorker({...})` с declarative options, знаеш че workers са pull-based (не push-from-broker), знаеш че `Duration.seconds.of(N)` е type-safe helper, знаеш че `activateJobs` е low-level RPC. Това е знание за TS SDK API contract.

---

## Question 46: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A team is building a custom dashboard for ops monitoring of running process instances. They need to:
1. List all process instances with status "ACTIVE" filtered by `customerSegment = "enterprise"`
2. Modify specific variables on a running instance (manually move a variable's value to override a bug)
3. Trigger a process instance migration from version 1.2 to 1.3

**Which Camunda 8 API best fits these three operational tasks?**

- **a)** **Orchestration Cluster REST API** — modern unified API in Camunda 8.8 that exposes process instance search, modification, and migration operations. Documentation: [Orchestration Cluster API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview/)

- **b)** **Zeebe gRPC API** — direct broker-level commands; lowest latency for state-changing operations. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

- **c)** **Operate API** — primary UI-backing API; supports queries and instance modification. Documentation: [Operate API](https://docs.camunda.io/docs/apis-tools/operate-api/overview/)

- **d)** **Administration API** — cluster administration (user management, cluster config); does not handle instance-level operations. Documentation: [Administration API](https://docs.camunda.io/docs/apis-tools/administration-api/administration-api-reference/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The **Orchestration Cluster REST API** (introduced in Camunda 8.8) is the **unified, supported API** for application integration. It consolidates what previously required mixing Operate API (search), Tasklist API (user tasks), and Zeebe gRPC (commands) into a single REST surface. It supports process instance search/filter (operation 1), variable modification on running instances (operation 2), and migration (operation 3). For new application development in 8.8+, this is the canonical choice.

- **Option b) — Partially viable.** Zeebe gRPC API does support modification and migration commands, but **lacks a rich query API** for instance listing. It's command-oriented, not query-oriented.

- **Option c) — Partially viable but legacy.** Operate API was historically used for queries + some modification; for new 8.8 applications, the Orchestration Cluster API is the migration target. Operate API remains available but is being de-emphasised.

- **Option d) — Incorrect.** Administration API focuses on cluster setup, user/group management, not process operations.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Orchestration Cluster API е unified canonical API в 8.8 за operational tasks.
- **b) 5/10** — gRPC поддържа command-side но липсва rich queries.
- **c) 6/10** — Operate API работи но е legacy спрямо Orchestration Cluster API в 8.8.
- **d) 2/10** — Administration API е за cluster admin, не process operations.

**Correct Answer:** Orchestration Cluster REST API.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Three operational tasks: list, modify, migrate" → разпознаваш че се иска **unified instance-operations API**, не cluster admin, не Modeler API.

**Въпросът → Solution Framing.** "Best fits" + three different operations изпитва **knowledge of API catalog** в Camunda 8.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 8 има **5 distinct APIs** (Orchestration Cluster, Operate, Administration, Optimize, Web Modeler, Zeebe gRPC), всеки с distinct purpose. Знаеш че Orchestration Cluster API е **unified replacement в 8.8** за app integration. Това е знание за Camunda 8 API surface.

---

## Question 47: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A SaaS platform's reporting subsystem needs to extract **analytical metrics** from Camunda 8 process executions: average instance duration per process definition, frequency of incident creation, completion rates per User Task. The data should feed into the company's BI tool (Tableau). The reporting team prefers a REST API for periodic polling.

**Which Camunda 8 API is purpose-built for analytical/reporting queries?**

- **a)** **Optimize API** — Camunda's analytics product API; exposes process instance reports, duration metrics, incident summaries, and BI-friendly aggregations. Designed exactly for this use case. Documentation: [Optimize API](https://docs.camunda.io/docs/apis-tools/optimize-api/overview/)

- **b)** **Zeebe gRPC API** — direct broker queries; lowest-level access to runtime state. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

- **c)** **Operate API** — primarily for instance-level operational queries; can be aggregated client-side for reports. Documentation: [Operate API](https://docs.camunda.io/docs/apis-tools/operate-api/overview/)

- **d)** **Web Modeler API** — provides modeled resources; can include execution metadata. Documentation: [Web Modeler API](https://docs.camunda.io/docs/apis-tools/web-modeler-api/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda **Optimize** is the dedicated analytics product in the Camunda 8 stack. Its REST API exposes pre-computed reports, time-series metrics, instance duration aggregations, incident statistics, and configurable dashboards. It's the **canonical choice for BI integration** — Optimize handles the historical-data warehousing, OLAP-style queries, and aggregation; downstream BI tools just consume the REST endpoints.

- **Option b) — Incorrect.** Zeebe gRPC is broker-level command/query for runtime state, not for analytical aggregations.

- **Option c) — Suboptimal.** Operate is for **operational** dashboards (current state of running instances), not analytical history. Client-side aggregation works but is reinventing what Optimize provides.

- **Option d) — Incorrect.** Web Modeler API gives access to **modeled resources** (BPMN/DMN/Forms files, project structure), not execution data.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Optimize е purpose-built за analytics + BI integration.
- **b) 2/10** — gRPC е broker-level runtime, не analytics.
- **c) 5/10** — Operate работи but reinvents Optimize.
- **d) 1/10** — Web Modeler API е за modeled resources, не execution data.

**Correct Answer:** Optimize API — Camunda's analytics product API.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/optimize-api/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Analytical metrics + BI tool integration" → разпознаваш че се иска **analytics-purposed API**, не operational, не runtime.

**Въпросът → Solution Framing.** "Purpose-built for analytical/reporting" — конкретно търси analytics product.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda Optimize е dedicated analytics tool с REST API, знаеш че Operate е operational dashboards (current state), знаеш че Web Modeler е modeled resources, знаеш че Zeebe gRPC е runtime commands. Това е знание за пълния Camunda 8 API catalog.

---

## Question 48: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A DevOps team automates the deployment of BPMN processes from a Git repository to multiple Camunda 8 SaaS clusters (dev, staging, production). They want a script that:
1. Reads BPMN files from the Git repo
2. Uploads/updates the corresponding files in Web Modeler
3. Triggers deployment to the designated Zeebe cluster
4. Verifies successful deployment

**Which Camunda 8 API automates the Web Modeler operations (upload/update/deployment)?**

- **a)** **Web Modeler API** — REST API for programmatic access to Web Modeler resources (projects, files, deployments). Supports CRUD on files, deployments to clusters, and access management. Documentation: [Web Modeler API](https://docs.camunda.io/docs/apis-tools/web-modeler-api/overview/)

- **b)** **Zeebe gRPC API** — broker-level direct deployment via the `deployResource` command. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

- **c)** **Administration API** — cluster admin tasks include deployment. Documentation: [Administration API](https://docs.camunda.io/docs/apis-tools/administration-api/administration-api-reference/)

- **d)** **Operate API** — Operate is the deployment dashboard; deployments happen via Operate. Documentation: [Operate API](https://docs.camunda.io/docs/apis-tools/operate-api/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The **Web Modeler API** provides programmatic access to Web Modeler's resource management — projects, files (BPMN, DMN, Forms), folder structures, sharing/permissions — and triggering deployments to Camunda 8 clusters from those files. For CI/CD pipelines deploying BPMN from Git, Web Modeler API is the canonical integration: the script syncs Git contents to Web Modeler, then uses Web Modeler's deployment trigger to push to target clusters.

- **Option b) — Partially viable but bypasses Web Modeler.** Direct Zeebe `deployResource` skips the Web Modeler audit/sharing layer; works for raw deployment but doesn't keep Web Modeler's resource view in sync with Git contents.

- **Option c) — Incorrect.** Administration API is for user/cluster admin, not file management or deployments.

- **Option d) — Incorrect.** Operate is for operational viewing, not deployment.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Web Modeler API е canonical за programmatic Modeler operations.
- **b) 5/10** — работи за raw deployment но bypass-ва Web Modeler audit layer.
- **c) 1/10** — Administration API не handles file resources.
- **d) 1/10** — Operate API е operational view, не deployment.

**Correct Answer:** Web Modeler API.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/web-modeler-api/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Git → Web Modeler → Zeebe cluster deployment" → разпознаваш че се иска **Web Modeler resource management API**, не broker direct.

**Въпросът → Solution Framing.** "Automates Web Modeler operations" е директната формулировка — конкретно търси Web Modeler-specific API.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler има API за projects/files/deployments, знаеш че Zeebe `deployResource` е raw deployment (bypass-ва Modeler), знаеш че Administration API е cluster admin scope, знаеш че Operate API е runtime view. Това е знание за Camunda 8 component-level API responsibilities.

---

## Question 49: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A team builds a custom **Inbound Connector** using the Connector SDK that subscribes to Kafka topics. When a message arrives on the configured topic, the Connector publishes a Camunda message correlated to a process instance. The team wants to ensure the Connector is **deployable to both Camunda 8 SaaS and Self-Managed clusters** without separate code paths.

**What is the correct understanding of Connector SDK portability across SaaS and SM?**

- **a)** Custom Connectors built with the Connector SDK use a **portable runtime layer** — the same Connector JAR runs on both SaaS and SM. Configuration (e.g., Kafka bootstrap server) is parameterised; **secrets are resolved via the cluster's secret provider** (SaaS Console UI for SaaS; environment variables or K8s Secrets for SM). Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** Connector SDK Connectors only work in Self-Managed. SaaS has a separate restricted catalog of certified Connectors. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** SaaS and SM require completely separate Connector code; the SDK does not provide portability. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Custom Connectors must be re-compiled for each Camunda version because of internal SDK API changes; portability is across cluster-types only, not across versions. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Connector SDK is designed for **portability** — the same Connector code runs on SaaS and SM. The SDK abstracts away the secrets provider (the runtime resolves `{{secrets.NAME}}` placeholders using whichever provider is configured: SaaS Console UI, K8s Secrets, env vars, Vault, etc.). The Connector developer writes against the SDK interface; the runtime in each deployment type provides the platform-specific resolution.

- **Option b) — Incorrect.** SaaS supports custom Connectors built with the SDK (with appropriate cluster permissions). Not restricted to a fixed catalog.

- **Option c) — Incorrect.** The SDK provides portability between SaaS and SM.

- **Option d) — Partially correct but overstated.** The SDK has stability commitments; minor version bumps usually require recompile but not code rewrites.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. SDK portability + secret provider abstraction е каноничен design.
- **b) 2/10** — невярно — SaaS support-ва custom Connectors.
- **c) 2/10** — невярно — SDK има portability.
- **d) 4/10** — частична нюанса but the framing is misleading.

**Correct Answer:** Custom Connectors built with the Connector SDK use a portable runtime layer — the same Connector JAR runs on both SaaS and SM.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Custom Inbound Connector" + "deployable to both SaaS and SM" → разпознаваш че се иска **portability mechanism explanation**, не platform comparison.

**Въпросът → Solution Framing.** "Correct understanding of Connector SDK portability" — изпитва se architectural concept knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Connector SDK е portable design, знаеш че secrets resolver е pluggable (SaaS Console UI / K8s / env / Vault), знаеш че SaaS support-ва custom Connectors с подходящи permissions, знаеш че SDK има stability commitments. Това е знание за Connector SDK architecture.

---

## Question 50: Developing Extensions & Integrations (Weighting: 25%)

**Scenario:** A team wants to integrate Camunda 8 with their legacy desktop accounting application that lacks any REST API or programmatic interface — the only way to drive it is through its Windows desktop UI (click buttons, fill fields, navigate menus). The accounting app must perform an end-of-day reconciliation operation as part of a larger Camunda 8 business process.

**Which Camunda 8 feature is purpose-built for automating legacy UI-only applications?**

- **a)** **Camunda RPA** — Robotic Process Automation feature designed for UI automation of legacy desktop applications. RPA workers execute UI automation scripts; Camunda BPMN orchestrates the RPA workers as part of larger end-to-end processes. Documentation: [Camunda RPA](https://docs.camunda.io/docs/components/rpa/getting-started/)

- **b)** **Custom Outbound Connector** — write a Connector that programmatically drives the UI via libraries like Selenium. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** **External Job Worker with RDP automation library** — Java job worker that connects via RDP and replays clicks. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** **Connector Element Template** — pre-defined Element Template can encapsulate UI automation patterns. Documentation: [Element Templates](https://docs.camunda.io/docs/components/concepts/element-templates/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8.8 includes **RPA (Robotic Process Automation)** as a first-class feature for exactly this use case. RPA workers execute UI automation scripts (using Camunda's built-in RPA scripting engine or integration with third-party RPA tools like UiPath/Blue Prism). BPMN orchestrates RPA workers as job execution targets — when a Service Task is configured for RPA, the RPA worker runs the automation. This is the supported, canonical approach.

- **Option b) — Suboptimal.** Custom Connector with Selenium is theoretically possible but loses the Camunda RPA-specific features (script management, recording, error handling specific to UI automation). Reinvents Camunda RPA poorly.

- **Option c) — Suboptimal.** RDP automation in a generic Job Worker is the pre-Camunda-RPA workaround. Working but non-canonical, lacks the RPA-specific tooling.

- **Option d) — Incorrect.** Element Templates are for **configuration standardisation**, not execution. Templates do not run UI automation.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Camunda RPA е purpose-built feature за legacy UI automation.
- **b) 4/10** — работи but reinvents Camunda RPA without its tooling.
- **c) 4/10** — pre-RPA workaround; non-canonical.
- **d) 1/10** — Element Templates не run UI automation.

**Correct Answer:** Camunda RPA — Robotic Process Automation feature designed for UI automation of legacy desktop applications.

**Official Documentation Link:** https://docs.camunda.io/docs/components/rpa/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Legacy desktop app + no API + UI only" → разпознаваш че се иска **UI automation feature**, не API integration.

**Въпросът → Solution Framing.** "Purpose-built for automating legacy UI-only applications" — конкретно сочи RPA.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 8.8 има **RPA като first-class feature** (нов в 8.8), знаеш че Element Templates не са execution mechanism, знаеш че custom Connector + Selenium е DIY equivalent но less mature, знаеш че RPA worker integration в BPMN е standard. Това е знание за Camunda 8.8 RPA feature.

---



# Section 7 — Managing the Development Process (Questions 51-59)

> Weight 15% • Topics: Web Modeler projects & resources, client credentials, Process/Decision/Task instance management, validation, troubleshooting via Play and Operate.

---

## Question 51: Managing the Development Process (Weighting: 15%)

**Scenario:** A team of 8 developers is collaborating on a complex BPMN process across three Camunda 8 SaaS environments (dev, staging, production). They have a Web Modeler project containing the BPMN file plus several DMN decisions and Forms. The team lead wants to:
1. Restrict who can edit the model (some are reviewers, some are editors)
2. Track changes with a clear version history
3. Allow simultaneous editing on different parts of the model

**Which Web Modeler features support this collaboration setup?**

- **a)** Web Modeler supports **Project-level access controls** (admin/editor/viewer roles per project member), **version history** with snapshots and named versions, and **real-time collaborative editing** with conflict resolution. Documentation: [Web Modeler collaboration](https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/)

- **b)** Web Modeler is single-user — concurrent editing must be managed via Git locking. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** Permissions are configured at the cluster level only; per-project access is not supported. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** Web Modeler supports version history only via integration with external Git; native versioning is not available. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler supports the full collaboration model: per-project access controls assigning roles to team members (admin = full control, editor = modify, viewer = read-only), version history with both auto-saves and named milestones (e.g., "v1.0 published to production"), and real-time multi-user editing with conflict awareness (similar to Google Docs — multiple users see each other's cursors and edits live).

- **Option b) — Incorrect.** Web Modeler is explicitly multi-user with real-time collaboration.

- **Option c) — Incorrect.** Permissions are project-level, not just cluster-level.

- **Option d) — Incorrect.** Web Modeler has native version history; Git integration is supplementary, not required.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Project access controls + version history + collaborative editing са все Web Modeler features.
- **b) 1/10** — невярно — multi-user collaboration е built-in.
- **c) 2/10** — невярно — project-level permissions съществуват.
- **d) 3/10** — native versioning съществува.

**Correct Answer:** Web Modeler supports Project-level access controls, version history with snapshots and named versions, and real-time collaborative editing.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "8 developers + 3 environments + roles + history + simultaneous edit" → разпознаваш че се иска **collaboration feature inventory**, не workaround.

**Въпросът → Solution Framing.** "Web Modeler features support" — изпитва се **direct feature knowledge** на Web Modeler.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler е cloud-based multi-user editor (similar to Figma/Google Docs), знаеш че projects имат role-based access, знаеш че version history е built-in. Това е знание за Web Modeler feature set.

---

## Question 52: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's CI/CD pipeline needs to authenticate to a Camunda 8 SaaS cluster to deploy BPMN processes automatically. The pipeline runs in GitHub Actions and uses a generic Job Worker also authenticated to the same cluster. The team is configuring **client credentials** in Camunda Console.

**What is the correct pattern for client credentials in Camunda 8 SaaS?**

- **a)** Create a **dedicated Client** in the Console UI for the cluster — Console generates a **client ID + client secret** pair scoped to the cluster. The pipeline stores the client ID/secret as GitHub Actions secrets and uses them for OAuth2 client credentials grant against the cluster's token endpoint. The same credentials grant access for deployments and job worker operations. Documentation: [Manage API clients](https://docs.camunda.io/docs/components/console/manage-clusters/manage-api-clients/)

- **b)** Reuse the team lead's user credentials in the pipeline — works but is non-portable. Documentation: [Console](https://docs.camunda.io/docs/components/console/)

- **c)** Use an API key — Camunda 8 supports simple API keys for cluster access. Documentation: [Console](https://docs.camunda.io/docs/components/console/)

- **d)** Configure mTLS — Camunda 8 SaaS requires client TLS certificates for programmatic access. Documentation: [Authentication](https://docs.camunda.io/docs/components/console/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 SaaS uses **OAuth2 client credentials** as the standard for programmatic cluster access. In Console UI, you create a new Client per cluster; Console issues a client ID and a client secret (shown once for security). The pipeline (or worker) sends these to the cluster's OAuth2 token endpoint, receives a short-lived access token, and uses the token in subsequent API/gRPC calls. The same client credentials can be scoped to multiple permissions (deploy, Zeebe access, Operate read, etc.).

- **Option b) — Incorrect.** Reusing user credentials in pipelines is anti-pattern (no rotation, no audit, no scope isolation).

- **Option c) — Incorrect.** Camunda 8 SaaS does not use simple API keys; OAuth2 client credentials is the supported scheme.

- **Option d) — Incorrect.** mTLS is not the standard pattern for SaaS programmatic access; OAuth2 is.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. OAuth2 client credentials е стандартът за SaaS programmatic access.
- **b) 1/10** — user credentials reuse е anti-pattern.
- **c) 1/10** — SaaS не support-ва прости API keys.
- **d) 2/10** — mTLS не е стандартния pattern.

**Correct Answer:** Create a dedicated Client in the Console UI; use OAuth2 client credentials grant.

**Official Documentation Link:** https://docs.camunda.io/docs/components/console/manage-clusters/manage-api-clients/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "CI/CD pipeline + Job Worker authentication" → разпознаваш че се иска **service account/client credentials pattern**, не user-based auth.

**Въпросът → Solution Framing.** "Correct pattern for client credentials in Camunda 8 SaaS" — изпитва се SaaS-specific authentication mechanism.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 8 SaaS използва OAuth2 client credentials grant, знаеш че Clients се creat-ват в Console, знаеш че secrets са показват веднъж и трябва да се store-нат securely, знаеш че user credentials reuse е anti-pattern. Това е знание за SaaS authentication architecture.

---

## Question 53: Managing the Development Process (Weighting: 15%)

**Scenario:** A team has a production process with hundreds of in-flight instances at process version 1.5. A new version 1.6 fixes a critical bug in the "Verify Customer Identity" step — instead of calling a deprecated KYC vendor, it calls a new compliant one. The team wants the **in-flight instances to be migrated to the new version**, but to **continue from wherever they currently are in the flow** — most are already past the Verify step (don't re-trigger), but some are still at the Verify step (must re-execute with new logic).

**Which Operate feature handles this migration?**

- **a)** **Process Instance Migration** — define a migration plan mapping element IDs from v1.5 to v1.6 (which elements correspond between versions). Operate applies the plan to selected in-flight instances, repositioning tokens to the equivalent element in v1.6. Documentation: [Process Instance Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **b)** **Process Instance Modification** — manually move each token via the Modification feature in Operate. Documentation: [Process Instance Modification](https://docs.camunda.io/docs/components/operate/userguide/process-instance-modification/)

- **c)** **Cancel and Restart** — cancel all in-flight instances and re-start them at v1.6 from the beginning. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/operate-introduction/)

- **d)** Zeebe automatically migrates in-flight instances when a new version is deployed. Documentation: [Process versioning](https://docs.camunda.io/docs/components/concepts/process-instances/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Process Instance Migration** is Operate's dedicated feature for exactly this scenario. The developer defines a migration plan that maps element IDs from the source version (v1.5) to the target version (v1.6) — telling Operate "this element corresponds to that element". When applied, Operate repositions each instance's tokens to the mapped elements in v1.6, preserving variables, history, and current execution state. Instances past the Verify step stay at their current location (mapped); instances at the Verify step continue from there with the new logic.

- **Option b) — Suboptimal.** Modification works for one-off token moves but is manual per instance — not appropriate for batch migration of hundreds of instances.

- **Option c) — Incorrect.** Cancel and restart loses variables, history, and the customer's progress — terrible UX.

- **Option d) — Incorrect.** Zeebe does NOT auto-migrate. In-flight instances stay at their deployed version unless explicitly migrated.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Process Instance Migration е purpose-built feature за batch version migration.
- **b) 3/10** — Modification е manual one-off, не batch.
- **c) 1/10** — destructive; губи state.
- **d) 1/10** — невярно — версии са explicit not implicit.

**Correct Answer:** Process Instance Migration — define a migration plan mapping element IDs from v1.5 to v1.6.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Hundreds of in-flight + new version + preserve state + selective re-execute" → разпознаваш че се иска **batch version migration**, не cancellation.

**Въпросът → Solution Framing.** "Operate feature handles this migration" — конкретно сочи Operate-specific feature.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Process Instance Migration използва element-id mapping за version transitions, знаеш че Modification е manual one-off token moves, знаеш че Zeebe **не** auto-migrate (in-flight stay at deployed version), знаеш че cancel+restart destroys state. Това е знание за Operate's lifecycle management features.

---

## Question 54: Managing the Development Process (Weighting: 15%)

**Scenario:** A production process has a bug — a Service Task occasionally produces wrong output because of a recent code regression. Instead of stopping all 2000 in-flight instances, the team wants to **resolve the bug "in-place" for instances currently stuck at the buggy Service Task**: skip the buggy task and jump to the next one with manually-corrected variables.

**Which Operate feature enables this targeted intervention?**

- **a)** **Process Instance Modification** — supports moving tokens (skip activity, jump to another point), updating variables, and adding/removing tokens. Targeted per instance — operator selects the instance, moves the token, sets correct variables. Documentation: [Process Instance Modification](https://docs.camunda.io/docs/components/operate/userguide/process-instance-modification/)

- **b)** **Process Instance Migration** — change to a fixed version. Documentation: [Process Instance Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **c)** **Incident Resolution** — resolve the incidents and re-trigger. Documentation: [Resolve incidents](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **d)** **Cancel and re-deploy** — cancel instances and re-deploy a fixed version. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/operate-introduction/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Process Instance Modification** is the in-place runtime surgery feature. From Operate UI (or API), operator selects a running instance, then can: cancel a flow node (skip), move a token to a different flow node, add a new token at a specific flow node, and update variables — all as part of a single Modification operation. Specifically suited to bypassing buggy activities or correcting state without redeploying.

- **Option b) — Incorrect.** Migration changes the version reference; doesn't bypass current execution point per-instance.

- **Option c) — Partially viable.** Incident Resolution handles **incident** state; if the Service Task created incidents, you can resolve them by editing variables and retrying. But this scenario specifies the Service Task is producing **wrong output silently**, not creating incidents — Modification is more appropriate.

- **Option d) — Incorrect.** Cancel and re-deploy destroys state.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Modification е операцията за in-place token manipulation.
- **b) 3/10** — Migration changes version, not point of execution.
- **c) 5/10** — Resolution adresses incidents; не bypass.
- **d) 1/10** — destructive.

**Correct Answer:** Process Instance Modification — supports moving tokens, updating variables, and adding/removing tokens.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-modification/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Resolve bug in-place + skip buggy task + correct variables" → разпознаваш че се иска **runtime instance surgery**, не version migration.

**Въпросът → Solution Framing.** "Targeted intervention" + "per instance" — изключва batch operations.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Modification supports token moves + variable updates + add/remove, знаеш че Migration е за version change (different axis), знаеш че Incident Resolution е за incident state specifically, знаеш че cancel+restart loses state. Това е знание за Operate's lifecycle operations.

---

## Question 55: Managing the Development Process (Weighting: 15%)

**Scenario:** A process instance in production has stopped progressing — Operate shows the instance has an **Incident** at a Service Task "Send Notification". The incident message reads: "Failed to acquire SMS gateway connection — connection timeout". The team has fixed the SMS gateway issue. Now they want the instance to **retry** the Service Task without losing state.

**What is the correct procedure to resolve the incident?**

- **a)** In Operate, navigate to the instance, click the **Incident**, optionally update relevant variables (e.g., a retry-attempt counter), and click **"Retry"**. Zeebe re-activates the job; the worker picks it up and retries the SMS call. Documentation: [Resolve incidents](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **b)** Wait for Zeebe to automatically retry — incidents are temporary. Documentation: [Incidents](https://docs.camunda.io/docs/components/operate/operate-introduction/)

- **c)** Cancel the process instance and start a new one. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/operate-introduction/)

- **d)** Delete the incident from the database directly. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/operate-introduction/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's incident resolution flow: select the incident, optionally update process variables (sometimes the cause is a variable value), and click "Retry". This **resets the job retries** on the affected job and Zeebe makes the job activatable again — the worker picks it up and re-attempts. State (other variables, history, other in-flight activities) is preserved.

- **Option b) — Incorrect.** Incidents are **terminal** until manually resolved — Zeebe does not auto-retry after job retries reach zero (which is when the incident was created). Auto-retry happens within the retry budget, not after incident creation.

- **Option c) — Incorrect.** Destroys state.

- **Option d) — Incorrect.** Bypasses the orchestrator — dangerous and unsupported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Operate's incident retry е стандартния workflow.
- **b) 1/10** — невярно — incidents не са temporary.
- **c) 1/10** — destructive.
- **d) 1/10** — bypasses orchestrator; никога.

**Correct Answer:** In Operate, navigate to the instance, click the Incident, optionally update variables, and click "Retry".

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Incident at Service Task" + "fix applied externally" + "retry without losing state" → разпознаваш че се иска **standard incident resolution workflow**.

**Въпросът → Solution Framing.** "Correct procedure to resolve incident" — изпитва се standard Operate UI workflow.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че incidents са terminal state until manual resolution, знаеш че Retry resets job retries + re-activates, знаеш че Operate UI има dedicated incident management view, знаеш че direct DB manipulation е forbidden. Това е знание за Operate operational workflow.

---

## Question 56: Managing the Development Process (Weighting: 15%)

**Scenario:** A team wants to **test a complex BPMN flow** before deploying it to a real cluster. The flow has 30+ elements including Service Tasks (which would call real external systems), User Tasks, and a Decision Table. The team wants to simulate runtime execution without actually invoking external systems — they want to step through the process, set variable values manually, and verify the path is correct.

**Which Camunda 8 feature is purpose-built for this kind of pre-deployment testing?**

- **a)** **Camunda Play** — interactive BPMN process playground in Web Modeler. Run the process step-by-step, manually provide variable values, simulate task outcomes (including Service Task results), and visualise the path taken. Documentation: [Camunda Play](https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/play-your-process/)

- **b)** Deploy the process to a dedicated test cluster and run it. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/operate-introduction/)

- **c)** Write **process tests** with the Camunda 8 Test Framework — unit-style tests of the BPMN with mocked workers. Documentation: [Testing](https://docs.camunda.io/docs/components/best-practices/development/testing-process-definitions/)

- **d)** Use **DMN evaluation** in Web Modeler to test decisions in isolation. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Camunda Play** is the interactive process playground specifically designed for pre-deployment testing. From Web Modeler, the developer "plays" the process: starts an instance, sees the token visualised on the diagram, interactively provides Service Task outcomes (no real worker needed), responds to User Tasks, and watches the path execute. Variables can be inspected and modified live. It's the canonical answer for "walk through the process before deploying".

- **Option b) — Working but heavier.** Test cluster deployment works but requires real Zeebe + real workers (or mocks). Heavier setup than Play.

- **Option c) — Complementary.** Unit-style process tests are great for CI/CD regression but require code; Play is for interactive exploration.

- **Option d) — Incorrect.** DMN testing in Modeler tests decisions in isolation, not the full BPMN process flow.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Camunda Play е purpose-built за interactive pre-deployment testing.
- **b) 5/10** — работещо но heavier overhead.
- **c) 7/10** — complementary за CI but не interactive walkthrough.
- **d) 3/10** — DMN-specific, не end-to-end.

**Correct Answer:** Camunda Play — interactive BPMN process playground in Web Modeler.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/play-your-process/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Test BPMN flow before deploy + step-through + manual variables" → разпознаваш че се иска **interactive Modeler-side simulator**, не cluster deployment.

**Въпросът → Solution Framing.** "Purpose-built for pre-deployment testing" — конкретно сочи Camunda Play.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda Play е interactive sandbox в Web Modeler, знаеш че unit tests са programmatic alternatives (различен use case), знаеш че DMN-only testing е narrow scope, знаеш че real deployment е heavyweight. Това е знание за Modeler tooling.

---

## Question 57: Managing the Development Process (Weighting: 15%)

**Scenario:** A team deploys a new version of a process — v2.0 — to the production cluster. The cluster already has v1.0 with 500 in-flight instances. After v2.0 deployment, new process instances should start at **v2.0**, but the 500 in-flight v1.0 instances should **continue to run at v1.0** (their original version) until they complete naturally — no auto-migration.

**What is the default version-handling behaviour after deploying a new version?**

- **a)** Zeebe **automatically uses the latest deployed version for new process instances** but keeps in-flight instances at their original version. No explicit configuration needed. Documentation: [Process versioning](https://docs.camunda.io/docs/components/concepts/process-instances/)

- **b)** Zeebe migrates all in-flight instances to v2.0 automatically. Documentation: [Process versioning](https://docs.camunda.io/docs/components/concepts/process-instances/)

- **c)** Zeebe requires explicit version selection via API — without specifying, new instances fail. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/overview/)

- **d)** Zeebe runs in-flight instances on whatever version is **currently deployed** — they auto-pick-up v2.0 on next token movement. Documentation: [Versioning](https://docs.camunda.io/docs/components/concepts/process-instances/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe's default versioning: **new process instances start at the latest deployed version**, **in-flight instances continue at their original version** (the one they were started on). This isolation ensures consistency — a v1.0 instance always sees v1.0's logic from start to finish, regardless of new deployments. This is the default; no explicit configuration is needed.

- **Option b) — Incorrect.** No auto-migration. Migration is explicit (Operate's Process Instance Migration).

- **Option c) — Incorrect.** New instances default to the latest version; explicit selection is optional.

- **Option d) — Incorrect.** In-flight instances do not "pick up" newer versions; they continue at their original.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Default Zeebe versioning behaviour.
- **b) 1/10** — невярно — no auto-migrate.
- **c) 2/10** — невярно — version selection е optional default-в.
- **d) 1/10** — невярно — in-flight stay at original.

**Correct Answer:** Zeebe automatically uses the latest deployed version for new process instances but keeps in-flight instances at their original version.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/process-instances/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Deploy v2.0 + existing v1.0 instances + no auto-migrate desired" → разпознаваш че се иска **default versioning behaviour explanation**.

**Въпросът → Solution Framing.** "Default version-handling behaviour" — конкретно се търси default, не custom config.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe version isolation е default (in-flight на original version), знаеш че migration е explicit feature не automatic, знаеш че latest version е default за нови instances. Това е знание за Zeebe deployment lifecycle.

---

## Question 58: Managing the Development Process (Weighting: 15%)

**Scenario:** A process instance has variable `customerEmail = "wrong@example.com"`. The team realised this is the result of a data ingestion bug. They want to correct it to `"correct@example.com"` while the instance is still in-flight, before it reaches a "Send Notification" Service Task downstream.

**Which is the correct approach to update the variable?**

- **a)** Use **Operate UI** — navigate to the running instance, find the variable in the Variables panel, click edit, set the new value. Operate writes the update via the Orchestration Cluster API. The instance picks up the new value on next read. Documentation: [Update variables](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **b)** Use the **Orchestration Cluster API directly** — `PATCH /process-instances/{id}/variables` with the new value. Same effect as Operate UI. Documentation: [Orchestration Cluster API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview/)

- **c)** Both Operate UI and Orchestration Cluster API are valid; choose based on whether human or programmatic access. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/operate-introduction/)

- **d)** Variables are immutable once set — cancel the instance and re-start with corrected variables. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option c) — Correct.** Both Operate UI and Orchestration Cluster API (the modern equivalent of Operate API for state-changing operations) support runtime variable updates. The choice is operational: a one-off human-driven fix uses Operate UI (faster, immediate); a recurring or automated fix uses the API (scriptable, repeatable). Both write the new value to the variable record; downstream tasks read the updated value when they activate.

- **Options a) and b) are partially correct individually** — both ARE valid, but option c) acknowledges both work.

- **Option d) — Incorrect.** Variables are mutable; update without instance loss.

**Per-option scoring (1–10):**
- **a) 8/10** — частично — Operate UI работи, но игнорира API option.
- **b) 8/10** — частично — API работи, но игнорира UI option.
- **c) 10/10** — верен. И двете са валидни; choice по контекст.
- **d) 1/10** — variables не са immutable.

**Correct Answer:** Both Operate UI and Orchestration Cluster API are valid; choose based on whether human or programmatic access.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Update variable in running instance" → разпознаваш че се иска **standard runtime variable update workflow**.

**Въпросът → Solution Framing.** "Correct approach" с множество valid options — изпитва се **complete knowledge на available mechanisms**.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate UI има inline variable edit, знаеш че Orchestration Cluster API support-ва programmatic update, знаеш че variables са mutable, знаеш че choice е operational не technical. Това е знание за operational options.

---

## Question 59: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's Business Rule Task occasionally produces wrong decision outputs. Operate shows the BPMN process completed, but customer support reports incorrect outcomes. The team needs to **audit which DMN decision rule fired** for a specific instance to understand whether the rule logic is wrong or the input data was wrong.

**Where in Operate can the team see DMN evaluation history per process instance?**

- **a)** **Decision Instance** view in Operate — every DMN evaluation produces a Decision Instance with inputs, fired rules, and outputs, linked to the parent Process Instance. Documentation: [Operate basic navigation](https://docs.camunda.io/docs/components/operate/userguide/basic-operate-navigation/)

- **b)** **Process Instance history** — DMN evaluation is logged as an activity in the process instance audit log; click the Business Rule Task to see the details. Documentation: [Process Instance modification](https://docs.camunda.io/docs/components/operate/userguide/process-instance-modification/)

- **c)** **Audit log API** — DMN evaluations are written to the Camunda audit log; query via API. Documentation: [Audit log](https://docs.camunda.io/docs/components/operate/operate-introduction/)

- **d)** Operate does not store DMN evaluation history; check Optimize for analytical history. Documentation: [Optimize](https://docs.camunda.io/docs/components/operate/operate-introduction/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate has a dedicated **Decision Instance** view that records every DMN evaluation as a first-class entity. For each evaluation, you see: the decision ID, inputs passed in, which rules fired (with their row numbers), outputs produced, and a back-link to the parent process instance. This is the canonical audit trail for DMN debugging.

- **Option b) — Partially correct.** The Business Rule Task in the process instance view does link to the Decision Instance, but the Decision Instance is a separate entity with its own dedicated view in Operate.

- **Option c) — Incorrect.** "Audit log API" is not the canonical Camunda 8 mechanism; Operate's Decision Instance view is.

- **Option d) — Incorrect.** Operate stores Decision Instance history.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Operate Decision Instance view е canonical DMN audit trail.
- **b) 7/10** — partially right (via Business Rule Task drill-down) but Decision Instance is the dedicated view.
- **c) 2/10** — invented API.
- **d) 1/10** — невярно — Operate has Decision Instance view.

**Correct Answer:** Decision Instance view in Operate — every DMN evaluation produces a Decision Instance with inputs, fired rules, and outputs.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/basic-operate-navigation/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Audit which DMN rule fired" → разпознаваш че се иска **DMN-specific audit view в Operate**.

**Въпросът → Solution Framing.** "Where in Operate" — изпитва се знание за Operate's view hierarchy.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate има отделна Decision Instance view (както Process Instance view), знаеш че Decision Instance показва inputs/rules/outputs, знаеш че Business Rule Task в Process Instance има back-link, знаеш че Camunda не reli-ва на generic audit log API. Това е знание за Operate UI structure.

---



# Section 8 — Setting up a Development Environment (Question 60)

> Weight 1% • Topics: Camunda 8 Run / Docker Compose for local dev.

---

## Question 60: Setting up a Development Environment (Weighting: 1%)

**Scenario:** A new developer joining the team wants to set up a **local Camunda 8 environment on their laptop** to develop and test BPMN processes before deploying to the team's dev cluster. They have Docker installed but no Kubernetes. They need: Zeebe broker, Operate, Tasklist, and (optionally) Web Modeler. They also want the local environment to be **lightweight** (laptop-friendly resource usage) and **easy to tear down/restart**.

The senior architect mentions there are two main options: **Camunda 8 Run** and **Docker Compose**. Both are documented as developer-quickstart paths.

**What is the correct understanding of these two options?**

- **a)** **Camunda 8 Run** is a **single bundled distribution** — one Java executable that includes Zeebe + Operate + Tasklist + (optional) Connectors runtime, started with one command. It's the lightest option for local development. **Docker Compose** spins up the same components as **separate containers** orchestrated by a docker-compose.yml file — more configurable but heavier. Both are supported developer-quickstart paths. Documentation: [C8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/) | [Docker Compose](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/docker-compose/)

- **b)** **Camunda 8 Run** is a deprecated option; only Docker Compose is supported. Documentation: [Docker Compose](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/docker-compose/)

- **c)** Both options are for production use; local dev should use the cloud SaaS Free Tier instead. Documentation: [SaaS](https://docs.camunda.io/docs/components/console/)

- **d)** **Camunda 8 Run** requires a Kubernetes cluster; Docker Compose is the only Docker-only option. Documentation: [C8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Both are supported developer-quickstart paths in Camunda 8. **Camunda 8 Run** is a **single bundled Java distribution** that starts all components in one process — easiest setup, lowest resource usage, best for laptop developers. **Docker Compose** runs the same components as **separate containers** linked via docker-compose.yml — more configurable (per-component scaling, networking customisation), but heavier resource-wise. The choice is operational: Camunda 8 Run for "one command, everything running" simplicity; Docker Compose for "I want container isolation and per-service configurability".

- **Option b) — Incorrect.** Camunda 8 Run is actively supported and recommended for the simplest developer experience.

- **Option c) — Incorrect.** Local dev with Camunda 8 Run or Docker Compose is supported and common; SaaS Free Tier is an alternative but not the only option.

- **Option d) — Incorrect.** Camunda 8 Run requires Java (no Kubernetes); Docker Compose requires Docker (no Kubernetes either). Both run on a developer laptop without K8s.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Точно описание на двете developer-quickstart options.
- **b) 1/10** — невярно — Camunda 8 Run не е deprecated.
- **c) 2/10** — невярно — local dev е официално поддържан.
- **d) 1/10** — невярно — Camunda 8 Run не изисква K8s.

**Correct Answer:** Camunda 8 Run is a single bundled distribution; Docker Compose spins up the same components as separate containers. Both are supported developer-quickstart paths.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Local dev + laptop + no K8s + easy teardown" → разпознаваш че се иска **developer-quickstart options comparison**.

**Въпросът → Solution Framing.** "Correct understanding of these two options" — изпитва се **comparative knowledge** на двете paths.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 8 Run е single-binary bundled distribution (Java), знаеш че Docker Compose е multi-container orchestration, знаеш че и двете targeted-ват local dev (no K8s), знаеш че choice е operational (simplicity vs configurability). Това е знание за developer-quickstart tooling.

---

# Exam Completion Summary

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

## Recommended exam strategy

1. **First pass (≈ 50 min):** answer the questions you're confident about. Flag uncertain ones using the exam UI's "Flag for review" checkbox.
2. **Second pass (≈ 20 min):** revisit flagged questions. Apply elimination — kill obvious wrong distractors first.
3. **Final 5 min:** trust your gut on remaining unsure; do not change answers without clear reason.

## Common Camunda 7 reflex traps to avoid

- `Job Executor` (Camunda 7) vs Zeebe broker
- Relational DB savepoints (Camunda 7) vs Zeebe append-only log
- Embedded scripting languages: JavaScript / Groovy / Nashorn (Camunda 7) — **Camunda 8 uses FEEL only** for Script Tasks
- `camunda:decisionRef` (Camunda 7) vs `zeebe:calledDecision.decisionId` (Camunda 8)
- `ACT_RE_*` SQL tables (Camunda 7) vs Operate's Decision Instance view (Camunda 8)
- Auto-migration on deploy (Camunda 7 conventions) vs Camunda 8 explicit migration

## Common "wrong axis" traps (v2.0 distractor philosophy)

| Trap | Right axis | Wrong axis |
|---|---|---|
| Job duplicate execution under load | At-least-once idempotency at receiver | Tuning timeout / maxJobsActive |
| Activation latency spikes (P99) | Switch to streamJobs (push delivery) | Tuning pollInterval |
| Saga rollback orchestration | Compensation Subprocess (LIFO walk) | Error Boundary + downstream gateway |
| Cross-pool communication | Message Flow (BPMN spec) | Sequence Flow / Inclusive Gateway |
| Large document handling | Document Handling API (references) | Increasing variable size limit |
| Conditional fan-out + join | Inclusive Gateway (conditional) | Parallel Gateway (unconditional) |
| Cumulative DMN scoring | COLLECT-SUM hit policy | PRIORITY / FIRST (selection) |
| Webhook silent loss | Correlation key FEEL expression | Rate limit / TTL tuning |

## Three-Skills Decomposition reminder

Every question in this exam tests THREE distinct skills:

1. **Diagnostic Comprehension** — read scenario, extract technical pattern
2. **Solution Framing** — interpret what kind of solution the question wants ("durable", "most likely", "purpose-built")
3. **Mechanism Knowledge + Trade-off Reasoning** — know how Camunda features actually behave

If you fail at any one of the three skills, the question scores 0. Practical experience hardens all three simultaneously — pure docs-reading hardens only the third.

## Post-exam review

- For each missed question, identify which of the three skills was the weak link
- Build practice habits accordingly: scenario-reading drills (1), question-keyword highlighting (2), hands-on Web Modeler + Operate work (3)

---

**End of mock exam — full 60 questions.**

**File location:** `C:\Users\ivayl\camunda-cert-prep\_full_exam_simulation\full_exam_60q_v2.md`

**Generated:** May 2026 | **Spec version:** v2.0 | **Blueprint base:** v8.8.0 (Camunda 8.8.0, released October 2025)
