# Camunda 8 C8-CP-DV Mock Exam — Set 6

> **60 въпроса • 75 минути • праг ≥ 65% (39/60) • Blueprint v8.8.0**
>
> Свежи сценарии — distinct от Set 1, 2, 3, 4, 5. Всеки въпрос: сценарий + 4 опции (a/b/c/d) + 🔍 Explanations + per-option score 1–10 + Correct Answer + Documentation Link + 🧠 Three-Skills Decomposition.

## Съдържание

| Секция | Q-range | Тегло |
|---|---|---|
| 1. Modeling | Q1-Q9 | 15% |
| 2. Configuring Processes | Q10-Q22 | 22% |
| 3. Decisions & DMN | Q23-Q29 | 11% |
| 4. Configuring Forms | Q30-Q32 | 5% |
| 5. Configuring Connectors | Q33-Q36 | 6% |
| 6. Extensions & Integrations | Q37-Q50 | 25% |
| 7. Managing Development | Q51-Q59 | 15% |
| 8. Dev Environment | Q60 | 1% |

---

# Section 1 — Modeling (Questions 1-9)

> Weight 15% • Topics: Pools/Lanes, Tasks, Gateways, Events, Subprocesses, Multi-Instance.

---

## Question 1: Modeling (Weighting: 15%)

**Scenario:** A process needs to **send an order-confirmation event** to an external Kafka topic. The send is **fire-and-forget** — no reply is expected; the process continues immediately.

**Which BPMN task type fits best semantically?**

- **a)** **Send Task** — semantically represents "send a message to an external participant." Visually distinct (envelope marker). Often paired with a Kafka Outbound Connector binding. Documentation: [Send Task](https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/)

- **b)** Receive Task. Documentation: [Receive Task](https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks/)

- **c)** Service Task with a generic worker. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Throwing Intermediate None Event. Documentation: [None Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Send Task** is the BPMN standard for outbound messaging — semantically clearer than a generic Service Task. Visually communicates "this is a message send."

- **Option b) — Wrong direction.** Receive Task waits for a message.

- **Option c) — Workable but less semantic.** A Service Task with a Kafka Connector functions identically, but Send Task expresses intent more clearly.

- **Option d) — Wrong purpose.** None Event marks process milestones; doesn't send anything.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Send Task семантично точен.
- **b) 2/10** — wrong direction.
- **c) 6/10** — functionally works но less semantic.
- **d) 2/10** — wrong purpose.

**Correct Answer:** Send Task.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Fire-and-forget send to Kafka" → разпознаваш че се иска **Send Task** (semantic precision).

**Въпросът → Solution Framing.** "Task type fits best semantically" — изпитва се BPMN task taxonomy.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Send Task = outbound message, Receive = inbound, Service Task = workable но less semantic, None Event = milestone. Знание за task type semantics.

---

## Question 2: Modeling (Weighting: 15%)

**Scenario:** A loan-approval process completes the **main flow** at one of three end events: "approved," "rejected," "pending-manual-review." None of them throws errors or signals; each just **finishes the path** normally.

**Which End Event type fits?**

- **a)** **None End Event** for each — represents normal completion of a path. Multiple None End Events in different branches are common when the process has alternative completion outcomes. Documentation: [None Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/)

- **b)** Terminate End Event for each. Documentation: [Terminate End Event](https://docs.camunda.io/docs/components/modeler/bpmn/terminate-events/)

- **c)** Error End Event for each. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **d)** Single shared End Event with conditional sequence flow. Documentation: [Sequence Flows](https://docs.camunda.io/docs/components/modeler/bpmn/sequence-flows/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** None End Event terminates the **current token** normally. Multiple None End Events are good BPMN style for representing distinct outcomes (e.g., approved vs rejected) — readers see at a glance how the process can end.

- **Option b) — Wrong semantics.** Terminate kills the whole instance; here each branch independently ends.

- **Option c) — Wrong intent.** Error End throws an error upward; the outcomes are normal business results, not errors.

- **Option d) — Loses clarity.** Single end + gateway works but loses the visual cue of "these are different outcomes."

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple None End Events.
- **b) 3/10** — wrong scope (whole instance kill).
- **c) 3/10** — outcomes са не errors.
- **d) 5/10** — works но less clear.

**Correct Answer:** Multiple None End Events for each outcome.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/none-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Three normal alternative outcomes" → разпознаваш че се иска **None End Events**.

**Въпросът → Solution Framing.** "Type fits" — изпитва се End Event flavours.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че None = normal completion, Terminate = whole instance, Error = thrown upward, single-end + gateway loses readability. Знание за End Event semantics.

---

## Question 3: Modeling (Weighting: 15%)

**Scenario:** A money-transfer process consists of: debit-source, credit-target, send-confirmation. If `credit-target` fails after `debit-source` succeeded, the team needs an automatic **reversal of the debit** via a compensation handler.

**Which BPMN construct fits the compensation **handler** attached to `debit-source`?**

- **a)** **Compensation Boundary Event** attached to `debit-source`, with its outgoing flow pointing to a **Compensation Handler Task** (e.g., `reverse-debit` Service Task). When a Compensation Throw upstream/downstream fires, this handler executes. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **b)** Error Boundary Event with handler. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** Timer Boundary Event with reversal task. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Service Task downstream that always reverses. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Compensation Boundary Event** attaches to a completed activity and associates a handler. When a Compensation Throw event fires, the BPMN engine walks back through completed activities in reverse order and executes each attached compensation handler. Pure undo semantics.

- **Option b) — Wrong direction.** Error handles **the failing task**, not undo for prior successes.

- **Option c) — Wrong trigger.** Timer fires on schedule, not on need-to-compensate.

- **Option d) — Always-reverse.** Reverses even when no failure occurred.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Compensation Boundary + handler.
- **b) 4/10** — handles failing task, not prior.
- **c) 2/10** — wrong trigger.
- **d) 3/10** — always-reverse breaks happy path.

**Correct Answer:** Compensation Boundary Event with handler.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Reverse debit on credit failure" → разпознаваш che се иска **Compensation Boundary + handler**.

**Въпросът → Solution Framing.** "Handler attached" — изпитва се knowledge на Compensation pattern.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Compensation walks back from completed, Error handles failing task, Timer = schedule, downstream Service = always-reverse breaks normal flow. Знание за Compensation handler placement.

---

## Question 4: Modeling (Weighting: 15%)

**Scenario:** A book-publishing process must process **chapter edits** in a fixed order — Chapter 1 first, then Chapter 2, then Chapter 3. Order is critical (later chapters depend on earlier ones being finalised). The list of chapters comes from a process variable.

**Which BPMN construct fits?**

- **a)** **Sequential Multi-Instance Subprocess** over `chapters` — runs one instance at a time, in order. Each instance processes one chapter; the next starts only after the previous completes. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Parallel Multi-Instance — fast but defeats ordering. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Three explicit User Tasks (one per chapter). Documentation: [User Task](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Single Service Task with FEEL `for chapter in chapters return process(chapter)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Sequential Multi-Instance** processes the collection in order, one instance at a time. Each iteration runs only after the previous finishes — perfect for "Chapter N depends on N-1 being done."

- **Option b) — Wrong mode.** Parallel runs concurrently, breaking the dependency.

- **Option c) — Brittle.** Hardcodes 3 chapters; doesn't scale with variable list.

- **Option d) — Hides iteration.** FEEL loops in Service Tasks lose BPMN observability and per-iteration error handling.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Sequential MI.
- **b) 3/10** — breaks ordering.
- **c) 3/10** — hardcoded count.
- **d) 4/10** — hides iteration.

**Correct Answer:** Sequential Multi-Instance Subprocess over chapters.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Process chapters in fixed order" → разпознаваш че се иска **Sequential MI**.

**Въпросът → Solution Framing.** "Fits" — изпитва се MI mode selection.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Sequential preserves order, Parallel breaks ordering, hardcoded tasks don't scale, FEEL hides iteration. Знание за Sequential MI use cases.

---

## Question 5: Modeling (Weighting: 15%)

**Scenario:** A medical-imaging-results process waits for either: a **scan-complete message** from the imaging system, OR a **manual-override timer** (after 30 min). Whichever happens first determines the next step.

**Which BPMN construct fits the racing wait?**

- **a)** **Event-Based Gateway** with two outgoing arrows: one Intermediate Message Catch (scan complete) and one Intermediate Timer Catch (30 min). First to fire proceeds; other is cancelled. Documentation: [Event-Based Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/)

- **b)** Parallel Gateway. Documentation: [Parallel Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/parallel-gateways/)

- **c)** Exclusive Gateway. Documentation: [Exclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/)

- **d)** Two parallel Receive Tasks. Documentation: [Receive Task](https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Event-Based Gateway** races events: first event "wins" and progresses, others are atomically cancelled. Canonical for "wait for either A or B."

- **Option b) — Wrong semantics.** Parallel runs both branches; doesn't race.

- **Option c) — Wrong trigger.** XOR routes on **data conditions**, not events.

- **Option d) — Wrong primitive.** Multiple Receive Tasks don't have built-in racing semantics.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Event-Based Gateway race.
- **b) 2/10** — runs both.
- **c) 2/10** — data not events.
- **d) 3/10** — no native race.

**Correct Answer:** Event-Based Gateway with Message + Timer catch events.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Race between message and timer" → разпознаваш че се иска **Event-Based Gateway**.

**Въпросът → Solution Framing.** "Fits the racing wait" — изпитва се race-event construct.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Event-Based races events, Parallel runs both, XOR is data-driven, parallel Receives no native race. Знание за event racing.

---

## Question 6: Modeling (Weighting: 15%)

**Scenario:** A document-approval User Task should send an **escalation notification** to a manager **if it's been waiting > 24 hours**, but the task should still remain active for the original approver. The escalation must **fire only once** even if it remains pending longer.

**Which Boundary Event fits?**

- **a)** **Non-interrupting Escalation Boundary Event** (or non-interrupting Timer-triggered Escalation) — fires the escalation notification path without cancelling the host User Task. Single fire on timer expiry. Documentation: [Escalation Events](https://docs.camunda.io/docs/components/modeler/bpmn/escalation-events/) + [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** Interrupting Escalation Boundary. Documentation: [Escalation Events](https://docs.camunda.io/docs/components/modeler/bpmn/escalation-events/)

- **c)** Non-interrupting Timer Boundary that loops every 1h. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Cancel Boundary. Documentation: [Cancel Events](https://docs.camunda.io/docs/components/modeler/bpmn/cancel-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Practical pattern: Non-interrupting Timer Boundary fires after 24h → branch throws Escalation → caught (or routes directly to notify-manager). Key word: **non-interrupting** = host task stays active; single fire = configured timer expires once.

- **Option b) — Wrong.** Interrupting cancels the host User Task — original approver can no longer respond.

- **Option c) — Loops.** Cycle timer fires repeatedly; question says "fire only once."

- **Option d) — Wrong scope.** Cancel Boundary is for transaction subprocesses.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Non-interrupting + single fire.
- **b) 3/10** — cancels host.
- **c) 4/10** — fires repeatedly.
- **d) 2/10** — wrong scope.

**Correct Answer:** Non-interrupting Timer/Escalation Boundary Event firing once after 24h.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/escalation-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Escalate after 24h + task stays active + fire once" → разпознаваш che се иска **non-interrupting + single-fire timer**.

**Въпросът → Solution Framing.** "Boundary fits" — изпитва се boundary semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че non-interrupting keeps host, interrupting cancels, cycle fires repeatedly, Cancel = transaction. Знание за boundary configurations.

---

## Question 7: Modeling (Weighting: 15%)

**Scenario:** A team has a **shared `payment-processing`** logic used by 4 different parent processes. The team owns the payment logic separately and versions it independently from each parent.

**Which BPMN construct fits the shared logic reference?**

- **a)** **Call Activity** referencing the externally-deployed `payment-processing` process by `processId`. Independent lifecycle; 4 parents reference the same deployed definition. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **b)** Embedded Subprocess copied into each parent. Documentation: [Embedded Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/)

- **c)** Service Task that calls payment processing via REST. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Single parent owning payment logic; others use Pool + Message Flows. Documentation: [Pools](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Call Activity** is BPMN's reuse construct for independent-lifecycle subprocesses. 4 parents reference the same `processId`; payment team deploys updates independently.

- **Option b) — Defeats reuse.** Copy = 4 places to maintain.

- **Option c) — Workable but heavier.** REST + Service Task adds API surface area; Call Activity is purpose-built for BPMN reuse.

- **Option d) — Wrong scope.** Pool means different participant; payment-processing is internal logic.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Call Activity.
- **b) 3/10** — defeats reuse.
- **c) 5/10** — heavier alternative.
- **d) 3/10** — wrong scope.

**Correct Answer:** Call Activity referencing the deployed processId.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Shared subprocess + 4 parents + independent lifecycle" → разпознаваш че се иска **Call Activity**.

**Въпросът → Solution Framing.** "Construct fits" — изпитва се BPMN reuse pattern.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Call Activity reuses deployed process, Embedded copies inline, REST adds surface area, Pool е different participant. Знание за reuse patterns.

---

## Question 8: Modeling (Weighting: 15%)

**Scenario:** A simple billing flow: after `compute-invoice`, if amount is **above $0**, send invoice; **else** terminate without sending. Only one path applies. The modeler wonders whether to use a Gateway or a Conditional Sequence Flow.

**Which is the cleaner BPMN pattern?**

- **a)** **Exclusive Gateway** with two outgoing flows (`=amount > 0` to send; default to end). XOR explicitly communicates the branching decision at a recognised BPMN element. Documentation: [Exclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/)

- **b)** Conditional Sequence Flows directly from `compute-invoice` without a gateway — BPMN allows multiple outgoing flows with conditions. Documentation: [Sequence Flows](https://docs.camunda.io/docs/components/modeler/bpmn/sequence-flows/)

- **c)** Both **a** and **b** are valid BPMN; the Exclusive Gateway is preferred for **readability** when the decision is meaningful, while conditional flows directly from a task are technically valid for simple binary splits. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **d)** Inclusive Gateway. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

**🔍 Explanations & Correct Answer**

- **Option c) — Correct.** BPMN allows both forms. Conditional Sequence Flows directly from an activity are valid for simple binary splits. However, the **explicit Exclusive Gateway is the preferred best practice** because it makes the decision visually obvious. The exam often credits the readability-favouring choice.

- **Option a) — Partially correct.** XOR is cleaner; correct preference.

- **Option b) — Partially correct.** Technically valid.

- **Option d) — Wrong semantics.** Inclusive implies "one or many," not strict either/or.

**Per-option scoring (1–10):**
- **a) 7/10** — partial — XOR is preferred но conditional flows също valid.
- **b) 5/10** — partial — technically valid но less readable.
- **c) 10/10** — верен — both valid; XOR preferred for readability.
- **d) 3/10** — wrong semantics.

**Correct Answer:** Both valid; Exclusive Gateway preferred for readability.

**Official Documentation Link:** https://docs.camunda.io/docs/components/best-practices/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Gateway vs Conditional Flow choice" → разпознаваш че се иска **best-practice reasoning**.

**Въпросът → Solution Framing.** "Cleaner pattern" — изпитва се pattern preference.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BPMN supports both, че XOR е explicit + readable, conditional flow е concise but less obvious. Знание за BPMN style.

---

## Question 9: Modeling (Weighting: 15%)

**Scenario:** A process must **throw a message** to an external system at a specific point in the flow — but the message is **purely outbound** (no reply expected) and the team doesn't want a separate task element for it.

**Which BPMN construct fits?**

- **a)** **Intermediate Throw Message Event** — visually a circle with envelope marker. Fires a message at this point in the flow and continues. Often paired with a Connector. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **b)** Intermediate Catch Message Event. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **c)** Send Task. Documentation: [Send Task](https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/)

- **d)** Both **a** and **c** are valid for outbound messaging; **Throw Message Event** is lighter (no task wrapper), Send Task is heavier but provides job-worker integration affordances. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

**🔍 Explanations & Correct Answer**

- **Option d) — Correct.** Both **Intermediate Throw Message Event** and **Send Task** can express outbound messaging. The choice depends on whether you want lightweight event semantics (Throw Event) or task-level affordances like input/output mappings, retries, and worker subscription (Send Task).

- **Option a) — Partially correct.** Throw Event works.

- **Option b) — Wrong direction.** Catch is inbound.

- **Option c) — Partially correct.** Send Task works.

**Per-option scoring (1–10):**
- **a) 6/10** — partial — Throw Event works.
- **b) 1/10** — wrong direction.
- **c) 6/10** — partial — Send Task works.
- **d) 10/10** — верен — both options express outbound messaging.

**Correct Answer:** Both Intermediate Throw Message Event and Send Task express outbound messaging; choose by need for task-level affordances.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/message-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Throw message, no task wrapper preferred" → разпознаваш че се иска **trade-off knowledge**.

**Въпросът → Solution Framing.** "Construct fits" — изпитва се Throw Event vs Send Task.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Throw Event е lightweight, Send Task е heavier но има task-level affordances, Catch е inbound. Знание за outbound messaging options.

---

# Section 2 — Configuring Processes (Questions 10-22)

> Weight 22% • Topics: Zeebe execution semantics, FEEL conditions, Multi-Instance, Document Handling, IDP, Element Templates, AI orchestration.

---

## Question 10: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task `compose-greeting` produces a greeting from `firstName` and `lastName` already in the process variables. The team wants the worker to receive a single pre-composed `fullName` as input — assembled in BPMN rather than worker code.

**Which input mapping configuration fits?**

- **a)** **Input Mapping**: Target `fullName`, Source FEEL expression `=firstName + " " + lastName`. The mapping is evaluated at activation; the worker receives `fullName` directly. Documentation: [Input/Output Variable Mappings](https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings)

- **b)** Pass `firstName` and `lastName` separately; worker concatenates. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Add a Script Task before to set `fullName` as process variable. Documentation: [Script Task](https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/)

- **d)** Use Task Headers with FEEL. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Input Mapping with FEEL expression composes the value at activation. Local-scope `fullName` is visible only inside the task; clean encapsulation.

- **Option b) — Pushes logic to worker.** BPMN should express the composition; worker focuses on its core responsibility.

- **Option c) — Pollutes process scope.** Script Task leaks `fullName` globally.

- **Option d) — Wrong tool.** Task Headers are for static config.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Input Mapping with FEEL.
- **b) 5/10** — pushes logic to worker.
- **c) 4/10** — pollutes scope.
- **d) 3/10** — wrong tool (static config).

**Correct Answer:** Input Mapping: Target fullName, Source =firstName + " " + lastName.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Pre-compose in BPMN + local to task" → разпознаваш че се иска **Input Mapping with FEEL**.

**Въпросът → Solution Framing.** "Configuration fits" — изпитва се mapping knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Input Mapping is local + composable, че Script Task pollutes scope, че Task Headers са за static. Знание за input mapping use cases.

---

## Question 11: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task occasionally fails due to flaky network. The team wants Zeebe to **automatically retry 5 times** before raising an Incident.

**Which attribute configures this?**

- **a)** Set the **Retries** field on the Service Task (`zeebe:taskDefinition retries="5"` in XML). On worker failure, retries decrements; when 0, an Incident is created. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Set `timeout = 5 minutes`. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** Hard-code retry loop in the worker. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Add an Error Boundary loop. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `zeebe:taskDefinition retries` defines the **initial** retry count. On worker fail, Zeebe decrements; reaching 0 raises an Incident.

- **Option b) — Different concept.** Timeout is activation duration, not retry count.

- **Option c) — Bypasses Zeebe.** Worker-side retry loops fight the at-least-once delivery model and incident workflow.

- **Option d) — Wrong tool.** Error Boundary handles BPMN errors, not job failures.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. retries attribute.
- **b) 3/10** — different concept.
- **c) 3/10** — bypasses Zeebe.
- **d) 3/10** — wrong tool.

**Correct Answer:** Set Retries field to 5 on the Service Task (zeebe:taskDefinition retries).

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Auto-retry 5x before incident" → разпознаваш че се иска **retries attribute**.

**Въпросът → Solution Framing.** "Attribute configures" — изпитва се taskDefinition options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че retries е decremented on fail, timeout е different concept, че worker-side retry bypasses Zeebe model, че Error Boundary е BPMN errors. Знание за retries attribute.

---

## Question 12: Configuring Processes (Weighting: 22%)

**Scenario:** A User Task `executive-approval` should be offered to a **dynamic list of users** computed from a process variable — e.g., the requester's manager + their backup. The list is `["alice", "bob"]` for this instance.

**Which assignment configuration fits?**

- **a)** **`candidateUsers`** = FEEL list expression — e.g., `=approvers`. Task offered to listed users; first to claim becomes assignee. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** `assignee` as comma-separated string. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** `candidateGroups` only. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Create one task per user via Multi-Instance. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `assignmentDefinition.candidateUsers` accepts FEEL list expression. Each listed user sees the task; first claim wins.

- **Option b) — Wrong type.** assignee is single-user.

- **Option c) — Different concept.** Groups, not individual user lists.

- **Option d) — Wrong intent.** MI creates many tasks; here one task is shared.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. candidateUsers FEEL list.
- **b) 3/10** — single-user only.
- **c) 4/10** — different (groups vs users).
- **d) 3/10** — wrong intent.

**Correct Answer:** candidateUsers = FEEL list expression =approvers.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Dynamic list of users + first claims" → разпознаваш che се иска **candidateUsers**.

**Въпросът → Solution Framing.** "Configuration fits" — изпитва се user task pooling.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че candidateUsers за specific users, candidateGroups за groups, assignee е single-user, MI е separate-task pattern. Знание за user task assignment.

---

## Question 13: Configuring Processes (Weighting: 22%)

**Scenario:** A Parallel Multi-Instance Subprocess processes invoices. The collection is **not** a static list — it's the result of a FEEL filter `=invoices[status = "PENDING"]`. The team wants the MI to iterate this filtered subset.

**Which `inputCollection` configuration fits?**

- **a)** Set **`inputCollection` to the FEEL expression** `=invoices[status = "PENDING"]`. Evaluated at MI activation; iterates filtered subset. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Add a Script Task before to set `pendingInvoices`, then use that variable in inputCollection. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Filter inside the inner Service Task's logic. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** inputCollection must be a static reference. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `inputCollection` accepts any FEEL expression evaluating to a list — including filtered lists, transformed lists, etc. Evaluated once at MI start.

- **Option b) — Workable but verbose.** Direct FEEL avoids the extra Script Task.

- **Option c) — Spawns no-op instances.** Inner task receives all items, filter inside = wasted instances for non-matching items.

- **Option d) — Incorrect.** FEEL expressions supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. inputCollection FEEL expression.
- **b) 5/10** — verbose alternative.
- **c) 3/10** — wastes instances.
- **d) 1/10** — невярно.

**Correct Answer:** inputCollection = =invoices[status = "PENDING"].

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Iterate FEEL-filtered subset" → разпознаваш че се иска **inputCollection с FEEL filter**.

**Въпросът → Solution Framing.** "Configuration fits" — изпитва се inputCollection knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че inputCollection accepts arbitrary FEEL, че pre-filter via Script е verbose, че inside-task filter wastes instances. Знание за MI inputCollection.

---

## Question 14: Configuring Processes (Weighting: 22%)

**Scenario:** A Document Handling upload stores a PDF. The team wants the document to carry **metadata** — `customerId`, `documentCategory = "contract"`. The metadata should be inspectable later via the Documents API.

**Which approach fits?**

- **a)** Upload via Documents API with **metadata fields** in the upload request — metadata persisted alongside the document reference. Retrieved via Documents API GET. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **b)** Encode metadata into the filename. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **c)** Store metadata separately in process variables. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Metadata not supported. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Documents API upload accepts metadata as part of the request; persisted with the document. Retrievable on lookup. Designed for cases like content type, business identifiers, custom tags.

- **Option b) — Anti-pattern.** Filename-encoded metadata is brittle and unstructured.

- **Option c) — Works but disjoint.** Separate variables work but lose the document-bundled semantic.

- **Option d) — Incorrect.** Metadata is supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Metadata fields in upload.
- **b) 2/10** — anti-pattern.
- **c) 5/10** — works но disjoint.
- **d) 1/10** — невярно.

**Correct Answer:** Upload via Documents API with metadata fields.

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/document-handling/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Document + structured metadata" → разпознаваш че се иска **metadata fields on upload**.

**Въпросът → Solution Framing.** "Approach fits" — изпитва се Document Handling API.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че metadata е first-class на Document API, filename-encoded е brittle, separate variables disjoint. Знание за document metadata.

---

## Question 15: Configuring Processes (Weighting: 22%)

**Scenario:** An IDP Application for invoices was trained on 100 samples. The model occasionally misextracts vendor names. The team wants to **improve the model** by labelling new samples.

**Which IDP workflow fits?**

- **a)** **Add labelled samples to the IDP Application** in Web Modeler (the IDP UI in Web Modeler supports retraining loops). Camunda re-trains or fine-tunes the extraction model based on the curated samples. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/idp-applications/)

- **b)** Cannot improve; deploy a new IDP Application. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **c)** Edit FEEL expressions to fix outputs. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Bypass IDP; use a custom Connector. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** IDP Applications support iterative improvement: add labelled samples → retrain. The Web Modeler IDP UI orchestrates the loop.

- **Option b) — Wasteful.** No need for fresh app.

- **Option c) — Wrong layer.** FEEL doesn't change extraction model accuracy.

- **Option d) — Defeats IDP value.** Custom Connector replaces IDP's whole offering.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Add samples + retrain.
- **b) 3/10** — wasteful.
- **c) 2/10** — wrong layer.
- **d) 3/10** — defeats IDP.

**Correct Answer:** Add labelled samples and retrain in the IDP Application.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/idp/idp-applications/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Improve IDP extraction accuracy" → разпознаваш че се иска **retraining loop**.

**Въпросът → Solution Framing.** "Workflow fits" — изпитва се IDP lifecycle.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че IDP supports retraining, че FEEL не влияе на model accuracy, че custom Connector defeats IDP. Знание за IDP lifecycle.

---

## Question 16: Configuring Processes (Weighting: 22%)

**Scenario:** An Element Template for "AWS S3 Upload" Connector has 8 properties. The team wants to **visually group** them in the property panel: Credentials (apiKey, secretKey), Target (bucket, key), Options (ACL, contentType).

**Which Element Template feature fits?**

- **a)** Define **`groups`** in the template JSON — assign each property to a group via `group: "credentials"`. Properties render under collapsible group headers in Web Modeler. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **b)** Order properties manually; Web Modeler auto-groups. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **c)** Split into 3 templates. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **d)** Groups aren't supported. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Element Template JSON supports `groups` definition. Each property references a group via its `group` field. Web Modeler renders collapsible sections.

- **Option b) — Incorrect.** No auto-grouping by order.

- **Option c) — Defeats usability.** Splitting destroys the single-task abstraction.

- **Option d) — Incorrect.** Groups are supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. groups definition + property.group.
- **b) 2/10** — no auto-grouping.
- **c) 3/10** — defeats usability.
- **d) 1/10** — невярно.

**Correct Answer:** Define groups in template JSON; assign each property a group.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Visually group properties" → разпознаваш че се иска **groups in Element Template**.

**Въпросът → Solution Framing.** "Feature fits" — изпитва се Element Template structure.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че groups е first-class JSON field, че no auto-grouping by order. Знание за Element Template groups.

---

## Question 17: Configuring Processes (Weighting: 22%)

**Scenario:** A customer-service workflow uses **AI Agent Connector** as the LLM-driven orchestrator. The team must specify which **LLM model** to use (e.g., Claude Opus 4.1).

**Where is the LLM model specified?**

- **a)** In the AI Agent Connector's property panel — fields like `model`, `provider` (e.g., Anthropic), `apiKey` (via secrets). The Connector calls the chosen LLM API per its config. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **b)** Configured globally; not per-task. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Hardcoded in BPMN element ID. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Camunda manages model selection automatically. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** AI Agent Connector exposes model + provider + auth properties per task instance. Multiple tasks can use different LLMs in the same process.

- **Option b) — Inflexible.** Per-task config is more useful.

- **Option c) — Anti-pattern.** Element IDs aren't config.

- **Option d) — Incorrect.** Modeler chooses.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Per-task model/provider/apiKey.
- **b) 3/10** — inflexible.
- **c) 1/10** — невярно.
- **d) 1/10** — невярно.

**Correct Answer:** In the AI Agent Connector's property panel (model, provider, apiKey via secrets).

**Official Documentation Link:** https://docs.camunda.io/docs/components/agentic-orchestration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Which LLM model for AI Agent" → разпознаваш че се иска **per-task model config**.

**Въпросът → Solution Framing.** "Where specified" — изпитва се Agent Connector config.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Connector exposes model + provider per task, че global config е inflexible. Знание за AI Agent Connector.

---

## Question 18: Configuring Processes (Weighting: 22%)

**Scenario:** An Ad-hoc Subprocess for **deal-due-diligence** has 5 inner check tasks. The subprocess should complete when the **legal-check task** has finished, regardless of others.

**Which completionCondition fits?**

- **a)** FEEL expression referencing the specific inner activity's completion — e.g., `=completedActivities contains "legal-check"` (where `completedActivities` is the engine-exposed set of completed inner activities). Documentation: [Ad-hoc Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/ad-hoc-subprocesses/)

- **b)** `numberOfCompletedInstances >= 1` — first to complete wins. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Cannot reference specific inner activity. Documentation: [Ad-hoc Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/ad-hoc-subprocesses/)

- **d)** Use a Terminate End Event in the legal-check branch to kill the subprocess. Documentation: [Terminate End Event](https://docs.camunda.io/docs/components/modeler/bpmn/terminate-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Ad-hoc Subprocess `completionCondition` is a FEEL expression with access to inner activity state. Referencing the specific completed activity fits the requirement.

- **Option b) — Different intent.** First-to-complete might not be legal-check; could be any.

- **Option c) — Incorrect.** Specific reference is possible.

- **Option d) — Workable but heavy.** Terminate End in Ad-hoc subprocess ends the scope but is BPMN-level vs the configured completionCondition.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL referencing specific completion.
- **b) 4/10** — could match wrong activity.
- **c) 1/10** — невярно.
- **d) 6/10** — works but heavier.

**Correct Answer:** completionCondition referencing legal-check specifically.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/ad-hoc-subprocesses/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Complete when legal-check done, ignore others" → разпознаваш че се иска **specific-activity completionCondition**.

**Въпросът → Solution Framing.** "Condition fits" — изпитва се Ad-hoc termination expression.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL has access to inner activity state, че first-to-complete е different intent, че Terminate е BPMN-level alternative. Знание за Ad-hoc completion.

---

## Question 19: Configuring Processes (Weighting: 22%)

**Scenario:** A maintenance Timer Cycle should fire **3 times, every 12 hours, starting on 2026-06-01 09:00 UTC**.

**Which ISO 8601 cycle expression fits?**

- **a)** `R3/2026-06-01T09:00:00Z/PT12H` — `R3` = 3 repetitions; `2026-06-01T09:00:00Z` = anchor start; `PT12H` = interval. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** `R3/PT12H/2026-06-01T09:00:00Z`. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** `PT12H R3`. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** `every 12h x3 from 2026-06-01T09:00:00Z`. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** ISO 8601 repeating interval format: `R[n]/[start]/[interval]`. Order matters.

- **Option b) — Wrong order.** Start before interval.

- **Option c) — Wrong format.** Not ISO 8601 cycle.

- **Option d) — Not parseable.** Natural language.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. R[n]/[start]/[interval].
- **b) 3/10** — wrong order.
- **c) 1/10** — wrong format.
- **d) 1/10** — natural lang.

**Correct Answer:** R3/2026-06-01T09:00:00Z/PT12H.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "3 times, every 12h, starting at specific moment" → разпознаваш че се иска **ISO 8601 repeat**.

**Въпросът → Solution Framing.** "Expression fits" — изпитва се ISO 8601 cycle.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че R[n]/[start]/[interval] е canonical order, че wrong order не валиден. Знание за ISO 8601 cycle order.

---

## Question 20: Configuring Processes (Weighting: 22%)

**Scenario:** Two process instances are waiting on a **Receive Task** with message name `OrderPaid` and correlation key `=orderId`. A message is published with `orderId = "ORD-100"`. Both waiting instances have `orderId = "ORD-100"`.

**What happens?**

- **a)** The message is correlated to **exactly one** of the waiting subscriptions — Zeebe selects one. The other remains waiting. (Correlation key + message name combination must be unique per instance scope; if not, Zeebe's correlation behavior is implementation-defined / may error.) Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **b)** Both instances get the message simultaneously. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **c)** Both messages get rejected. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **d)** The cluster crashes. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Correlation key + message name should be unique per scope. If not, Zeebe correlates to one subscription (typically first-found). Best practice: ensure correlation keys are unique across waiting instances.

- **Option b) — Incorrect.** Messages aren't broadcast like Signals.

- **Option c) — Incorrect.** Not rejected.

- **Option d) — Incorrect.** No crash.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. One subscription correlated; best practice unique correlation keys.
- **b) 2/10** — Signals broadcast, Messages 1-to-1.
- **c) 2/10** — invented.
- **d) 1/10** — invented.

**Correct Answer:** The message is correlated to one of the waiting subscriptions; ensure uniqueness in design.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/messages/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Two instances same correlation key" → разпознаваш че се иска **uniqueness contract**.

**Въпросът → Solution Framing.** "What happens" — изпитва се message correlation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Message correlates 1-to-1, че Signals broadcast, че duplicate keys are anti-pattern. Знание за correlation uniqueness.

---

## Question 21: Configuring Processes (Weighting: 22%)

**Scenario:** A contract-renewal process User Task `customer-renew-decision` must time out **on a specific calendar date** — `2026-12-31T23:59:59Z` — when the contract expires. Not a duration, an absolute date.

**Which Timer Boundary type fits?**

- **a)** **Timer Date** type with ISO 8601 date-time literal `2026-12-31T23:59:59Z` (or FEEL expression returning a `date and time`). One-shot fire at that moment. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** Timer Duration `P30D`. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** Timer Cycle `R1/PT0S`. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Cron expression. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Timer supports `date` type (absolute moment), `duration` (PT...), and `cycle` (R...). For specific calendar moment, use Date type.

- **Option b) — Duration ≠ specific date.** PT/P duration computes from now.

- **Option c) — Cycle ≠ one-shot date.** Cycle defines repeating intervals.

- **Option d) — Cron ≠ one-shot.** Cron typically schedules recurring.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Timer Date type + absolute ISO datetime.
- **b) 3/10** — duration from now.
- **c) 3/10** — cycle for repeating.
- **d) 3/10** — cron for recurring.

**Correct Answer:** Timer Date type with absolute ISO 8601 date-time.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Timeout on specific calendar date" → разпознаваш че се иска **Timer Date type**.

**Въпросът → Solution Framing.** "Timer Boundary type fits" — изпитва се timer-type taxonomy.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Date type = absolute moment, Duration = от now, Cycle = repeating. Знание за Timer types.

---

## Question 22: Configuring Processes (Weighting: 22%)

**Scenario:** A process has a nested variable `order = {customer: {name: "Acme", address: {city: "Sofia"}}, items: [...]}`. A FEEL expression needs to extract `order.customer.address.city`.

**Which FEEL syntax fits?**

- **a)** `=order.customer.address.city` — dot navigation traverses nested objects. Returns `"Sofia"`. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **b)** `=order["customer"]["address"]["city"]` — bracket index. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Both **a** and **b** work; dot is the canonical, bracket form supports dynamic keys. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `=getNested(order, "customer.address.city")`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option c) — Correct.** FEEL supports both dot navigation (canonical for known keys) and bracket access (for dynamic keys or when key names have special chars). Both reach the same value.

- **Option a) — Partially correct.** Dot navigation works.

- **Option b) — Partially correct.** Bracket access works.

- **Option d) — Invented.** No `getNested()` function.

**Per-option scoring (1–10):**
- **a) 7/10** — partial — dot works but bracket също.
- **b) 6/10** — partial — bracket works for dynamic.
- **c) 10/10** — верен — both work, choose per use case.
- **d) 1/10** — invented.

**Correct Answer:** Both dot and bracket access work; dot canonical for known keys.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Access nested variable" → разпознаваш че се иска **FEEL navigation**.

**Въпросът → Solution Framing.** "Syntax fits" — изпитва се FEEL access patterns.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че dot е canonical for static keys, bracket за dynamic, че няма named helper. Знание за FEEL access.

---

# Section 3 — Decisions & DMN (Questions 23-29)

> Weight 11% • Topics: Hit Policies, DRD, Knowledge Source, FEEL in DMN, REST evaluation.

---

## Question 23: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN decision table for **shipping carrier selection** has 3 rules that can both match the same input, but all matching rules **return the same output value** ("DHL"). The team wants to allow this multi-match-same-output but flag any rule producing a different output.

**Which hit policy fits?**

- **a)** **ANY** — multiple rules may match, but **all matching rules must produce the same output**. If they don't, runtime raises an error. Documentation: [DMN Hit Policies](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** UNIQUE — exactly one rule must match. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** FIRST — returns first match, no error on multi. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** COLLECT — returns list. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **ANY** policy is designed exactly for "multiple matches allowed if outputs agree." Different outputs = error.

- **Option b) — Different.** UNIQUE allows only one match.

- **Option c) — Doesn't enforce.** FIRST returns the first match silently regardless of others.

- **Option d) — Different.** COLLECT returns list, doesn't enforce single value.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. ANY за multi-match-same-output.
- **b) 4/10** — different (single match required).
- **c) 3/10** — doesn't validate agreement.
- **d) 3/10** — returns list.

**Correct Answer:** ANY hit policy.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Multi-match-same-output, error if differ" → разпознаваш че се иска **ANY**.

**Въпросът → Solution Framing.** "Hit policy fits" — изпитва се hit-policy semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че ANY = multi-match same output, UNIQUE = exactly one, FIRST = row-order silent, COLLECT = list. Знание за ANY vs UNIQUE.

---

## Question 24: Decisions & DMN (Weighting: 11%)

**Scenario:** A discount-level DMN has output value list: `["MAX", "HIGH", "MID", "LOW"]` (priority-ordered). Multiple rules can match. The team wants the **list of all matching outputs ordered by their output priority**.

**Which hit policy fits?**

- **a)** **OUTPUT ORDER** — returns list of all matching outputs sorted by the output value list ordering (MAX first, LOW last). Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** PRIORITY — returns single highest. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** RULE ORDER — returns by row order. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** COLLECT no aggregator — returns list (no specific order). Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **OUTPUT ORDER** returns matching outputs ordered by the output value list priority. Distinct from PRIORITY (single) and RULE ORDER (row order).

- **Option b) — Single value.** Returns just the top match.

- **Option c) — Different ordering.** Row order, not output priority.

- **Option d) — No order guarantee.** COLLECT without specific ordering.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. OUTPUT ORDER.
- **b) 4/10** — single value.
- **c) 4/10** — different order.
- **d) 5/10** — close, but no order guarantee.

**Correct Answer:** OUTPUT ORDER hit policy.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "List sorted by output priority" → разпознаваш че се иска **OUTPUT ORDER**.

**Въпросът → Solution Framing.** "Hit policy fits" — изпитва се list-policy distinctions.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че OUTPUT ORDER = output-priority list, PRIORITY = single, RULE ORDER = row-order list. Знание за ordered list policies.

---

## Question 25: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN input column **`riskLevel`** is meant to be `"LOW"`, `"MEDIUM"`, or `"HIGH"`. The team wants the modeler / evaluator to enforce that only these values are valid — anything else should fail validation.

**Which DMN feature fits?**

- **a)** Define an **input value list** on the column (e.g., set `Allowed Values` / `Input Values` to `"LOW", "MEDIUM", "HIGH"`). Validator and runtime check enforcement. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** Use regex in input entries. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** Validate in BPMN before calling DMN. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** DMN doesn't support input constraints. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN columns support **value lists** on inputs (allowed values) and outputs (priority list). Provides design-time + (optional) runtime validation.

- **Option b) — Awkward.** Regex on enumerable values is over-engineering.

- **Option c) — Workable but DMN-internal is canonical.** External validation isn't DMN-native.

- **Option d) — Incorrect.** Value lists exist.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Input value list.
- **b) 4/10** — over-engineered.
- **c) 5/10** — workable but bypasses DMN.
- **d) 1/10** — невярно.

**Correct Answer:** Define an input value list on the column.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Enforce enum values on input" → разпознаваш че се иска **input value list**.

**Въпросът → Solution Framing.** "Feature fits" — изпитва се DMN column config.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN columns имат value lists, че regex е over-engineering, че external validation е not DMN-native. Знание за DMN input constraints.

---

## Question 26: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN input is a **list** — `customerTags = ["VIP", "EU", "WHOLESALE"]`. A rule's input entry should match when the list **contains** `"VIP"`.

**Which FEEL input entry fits?**

- **a)** `list contains(customerTags, "VIP")` — wait, but the input entry is evaluated against the **input expression**, not as standalone. In DMN unary-test context, a list-input rule entry typically uses positive literal: input expression `customerTags` with rule entry like `[item in ? : item = "VIP"]` returning true, **or** the input expression can be reshaped (e.g., `list contains(customerTags, "VIP")` as input expression and `true` as entry). Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** `"VIP"` as the unary test entry directly against the list input. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** Reshape the **input expression** to `list contains(customerTags, "VIP")` returning boolean, with rule entry `true`. This is the cleanest pattern for list-membership checks in DMN. Documentation: [FEEL list functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **d)** DMN doesn't support list inputs. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option c) — Correct (and clearest).** The clean DMN pattern: define the **input expression** as `list contains(customerTags, "VIP")` (returns boolean), and the rule entry as `true`. This makes the table easy to read.

- **Option a) — Partially correct.** Notes the FEEL function but the cleaner approach moves it into the input expression.

- **Option b) — Unclear semantics.** Bare `"VIP"` against a list input isn't a canonical DMN unary test.

- **Option d) — Incorrect.** Supported via input expression.

**Per-option scoring (1–10):**
- **a) 6/10** — partial — mentions the function but doesn't propose cleanest pattern.
- **b) 3/10** — unclear semantics.
- **c) 10/10** — верен. Cleanest pattern.
- **d) 1/10** — невярно.

**Correct Answer:** Use list contains() in the input expression, rule entry as true.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "List input + contains test" → разпознаваш че се иска **input expression + list contains()**.

**Въпросът → Solution Framing.** "Entry fits" — изпитва се DMN list-input pattern.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL list contains() е canonical, че input expression preprocesses to boolean. Знание за DMN list-input handling.

---

## Question 27: Decisions & DMN (Weighting: 11%)

**Scenario:** A BKM (Business Knowledge Model) defines `adjustForLocation(amount, country)` — returns adjusted amount per country. A decision wants to **invoke** this BKM from its body.

**Which DMN invocation form fits?**

- **a)** Use a **Boxed Invocation** — a decision body that invokes a BKM with named parameter bindings. The decision's `Knowledge Requirement` arrow points to the BKM. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Call BKM via FEEL function syntax inside the decision's Literal Expression — `=adjustForLocation(amount, country)`. The DRD's Knowledge Requirement still links them. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Both **a** and **b** are valid forms — Boxed Invocation is a visual/structured way; FEEL function call works in Literal Expressions. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** BKMs cannot be invoked. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option c) — Correct.** DMN supports both: Boxed Invocation is a structured invocation widget; calling the BKM directly via FEEL function syntax in a Literal Expression also works. Both require the Knowledge Requirement in the DRD.

- **Option a) — Partially correct.** Boxed Invocation works.

- **Option b) — Partially correct.** FEEL function call works.

- **Option d) — Incorrect.** Invocation supported.

**Per-option scoring (1–10):**
- **a) 6/10** — partial — Boxed Invocation works.
- **b) 6/10** — partial — FEEL call works.
- **c) 10/10** — верен — both forms supported.
- **d) 1/10** — невярно.

**Correct Answer:** Both Boxed Invocation and FEEL function call are valid.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Invoke BKM from decision" → разпознаваш че се иска **invocation pattern**.

**Въпросът → Solution Framing.** "Form fits" — изпитва се BKM invocation options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN supports both Boxed Invocation и FEEL function call, че Knowledge Requirement links them. Знание за BKM invocation.

---

## Question 28: Decisions & DMN (Weighting: 11%)

**Scenario:** A DRD includes a **Knowledge Source** entity — a person or document that authorises decisions (e.g., "Regulatory Compliance Officer"). The team wants to know what it signifies.

**What does a Knowledge Source represent in DMN?**

- **a)** **Authority** — a person, organisation, or document that authoritatively governs how decisions are made (e.g., "Bank Compliance Policy"). It's metadata, not executable logic. Connected via Authority Requirement (dashed arrow with circle). Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Reusable computation (like BKM). Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** External system that supplies data. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Optional — purely cosmetic. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Knowledge Source is **governance metadata** — names the authoritative source behind decision logic. Not executable, but documents who/what authorises. Connected via Authority Requirement.

- **Option b) — Wrong (BKM).** BKM is reusable logic; Knowledge Source is non-executable authority reference.

- **Option c) — Different concept.** Input Data represents incoming data; Knowledge Source represents authority.

- **Option d) — Misleading.** Cosmetic-only undersells its governance purpose.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Authority / governance metadata.
- **b) 4/10** — wrong (BKM ≠ Knowledge Source).
- **c) 3/10** — wrong (Input Data ≠ Knowledge Source).
- **d) 4/10** — misleading.

**Correct Answer:** Authority metadata (person/org/document) that governs the decision.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Knowledge Source representation" → разпознаваш che се иска **governance metadata**.

**Въпросът → Solution Framing.** "What represents" — изпитва се DRD entity types.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Knowledge Source е authority, BKM е reusable logic, Input Data е data, че не cosmetic. Знание за DRD entities.

---

## Question 29: Decisions & DMN (Weighting: 11%)

**Scenario:** A backend service wants to **evaluate a deployed DMN decision** directly without starting a BPMN process — e.g., for a real-time pricing calculator endpoint.

**Which API fits?**

- **a)** **Orchestration Cluster REST API** — POST `/v2/decision-definitions/evaluation` (or equivalent), passing `decisionId` + input variables. Returns the decision output. Documentation: [Evaluate Decision](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/)

- **b)** Start a BPMN process with a Business Rule Task. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **c)** Direct DMN engine connection. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** DMN can only be invoked from BPMN. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Orchestration Cluster REST API exposes an evaluate-decision endpoint for **standalone DMN evaluation** — no BPMN process needed. Useful for "calculator" use cases (pricing, eligibility quick checks).

- **Option b) — Workaround.** Wrapping in BPMN just to evaluate DMN is overkill.

- **Option c) — Incorrect.** No direct engine connection; use the API.

- **Option d) — Incorrect.** DMN is standalone-callable.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. /v2/decision-definitions/evaluation.
- **b) 4/10** — overkill workaround.
- **c) 2/10** — no direct engine.
- **d) 1/10** — невярно.

**Correct Answer:** Orchestration Cluster REST API — Evaluate Decision endpoint.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Evaluate DMN standalone, no BPMN" → разпознаваш che се иска **REST evaluate endpoint**.

**Въпросът → Solution Framing.** "API fits" — изпитва се DMN standalone evaluation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че REST API exposes evaluate endpoint, че BPMN wrapper е overkill, че DMN е standalone-callable. Знание за DMN evaluation API.

---

# Section 4 — Configuring Forms (Questions 30-32)

> Weight 5% • Topics: Components, layout, descriptions.

---

## Question 30: Configuring Forms (Weighting: 5%)

**Scenario:** A KYC verification form must collect a **passport scan image** from the user. The file should be attached to the process and accessible later via Document Handling.

**Which Forms component fits?**

- **a)** **File Picker / File Upload** component bound to a document variable. Uploaded file becomes a Camunda Document; reference stored in the variable. Documentation: [Forms element library](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/)

- **b)** Text Input asking for a file path. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** URL Input asking for a file URL. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Forms don't support file upload. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Forms include a **File Picker** component that integrates with Document Handling. The uploaded file is stored as a Camunda Document; the form variable holds the reference.

- **Option b) — Bad UX.** Asking for file paths is unusable for end users.

- **Option c) — Different intent.** URL Input asks for an existing URL; doesn't upload.

- **Option d) — Incorrect.** File upload supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. File Picker / File Upload component.
- **b) 2/10** — bad UX.
- **c) 3/10** — different intent.
- **d) 1/10** — невярно.

**Correct Answer:** File Picker / File Upload component bound to a document variable.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Upload passport image" → разпознаваш че се иска **File Picker**.

**Въпросът → Solution Framing.** "Component fits" — изпитва се Forms element library.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че File Picker integrates with Document Handling, че text-input for path е bad UX, че URL ≠ upload. Знание за File Picker.

---

## Question 31: Configuring Forms (Weighting: 5%)

**Scenario:** A long survey form has 30 fields. The team wants to **visually separate the fields into thematic sections** with section titles (e.g., "Personal Info," "Contact Details," "Preferences") within the **same form** (no multi-step wizard).

**Which Forms feature fits?**

- **a)** Use **Text View / Heading components** as section dividers between groups of related fields. Forms render in declared order. Documentation: [Forms element library](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/)

- **b)** Use Hidden Field as marker. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Use HTML `<h2>` tags directly. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Forms have no sectioning. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Forms element library includes static-text components (Text View, Heading) for inline section headers and explanatory text. Place between groups to organise visually.

- **Option b) — Wrong purpose.** Hidden Field stores data, not displays headings.

- **Option c) — Wrong layer.** Forms abstracts HTML; raw HTML isn't input.

- **Option d) — Incorrect.** Sectioning achievable via Heading components.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Heading / Text View as section divider.
- **b) 2/10** — wrong purpose.
- **c) 2/10** — wrong layer.
- **d) 1/10** — невярно.

**Correct Answer:** Use Text View / Heading components as section dividers.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Thematic sections в same form" → разпознаваш che се иска **Heading components**.

**Въпросът → Solution Framing.** "Feature fits" — изпитва се layout knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Forms имат Heading/Text View components, че Hidden Field е data not display, че raw HTML не fits Forms abstraction. Знание за layout components.

---

## Question 32: Configuring Forms (Weighting: 5%)

**Scenario:** A loan-application form has a "Annual Income" field. Users sometimes don't know exactly what counts as income. The team wants a **help tooltip** below the field explaining what to include (salary, bonuses, dividends, etc.).

**Which Forms field property fits?**

- **a)** Set the field's **`description`** (or `helpText`) property — renders as inline help text below the field. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **b)** Add a Text View component below each field. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Put it in the label. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Forms don't support help text. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Most Forms field components have a `description` (or `helpText`) property that renders as inline help text below the field. Dedicated UX for inline guidance.

- **Option b) — Workable.** Adds a separate component; less ergonomic when description property exists.

- **Option c) — Bad UX.** Bloats label with long explanations.

- **Option d) — Incorrect.** Description property supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. description property.
- **b) 5/10** — works but verbose.
- **c) 3/10** — bad UX.
- **d) 1/10** — невярно.

**Correct Answer:** Set the field's description (helpText) property.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Inline help below field" → разпознаваш che се иска **description property**.

**Въпросът → Solution Framing.** "Property fits" — изпитва се field options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че fields have description property, че separate component е verbose, че label е bad UX for long text. Знание за field help.

---

# Section 5 — Configuring Connectors (Questions 33-36)

> Weight 6% • Topics: Connector Secrets, Inbound (polling), Outbound (SNS, REST), error handling.

---

## Question 33: Configuring Connectors (Weighting: 6%)

**Scenario:** A process notifies a mobile-app push subscription topic via **AWS SNS** when an order ships. The team uses out-of-the-box Connectors.

**Which Connector fits?**

- **a)** **AWS SNS Outbound Connector** — configure topic ARN, AWS credentials (via secrets), message payload. Send invocation produces SNS publish. Documentation: [AWS Connectors](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/)

- **b)** REST Outbound calling SNS HTTP API directly. Documentation: [REST Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

- **c)** Custom Java Connector. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/)

- **d)** Camunda doesn't support AWS. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** AWS SNS Outbound Connector is a first-class out-of-the-box Connector. Handles AWS auth (signature v4), payload composition, error responses.

- **Option b) — Workable but verbose.** REST manually requires signing AWS requests — re-implementing what the SNS Connector handles.

- **Option c) — Over-engineered.** Out-of-the-box exists.

- **Option d) — Incorrect.** AWS Connectors exist.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. AWS SNS Outbound Connector.
- **b) 5/10** — workable но verbose.
- **c) 4/10** — over-engineered.
- **d) 1/10** — невярно.

**Correct Answer:** AWS SNS Outbound Connector.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Publish to SNS" → разпознаваш che се иска **AWS SNS Connector**.

**Въпросът → Solution Framing.** "Connector fits" — изпитва се OOB Connector library.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че AWS SNS е OOB, че REST manually е reinvent (AWS signing), че custom е overkill. Знание за OOB Connectors.

---

## Question 34: Configuring Connectors (Weighting: 6%)

**Scenario:** An Inbound Webhook Connector receives callbacks from a partner. The partner authenticates via **simple API key** in a header (`X-Api-Key: ...`), not HMAC.

**Which Webhook auth setting fits?**

- **a)** Configure **API Key authentication** in the Webhook settings: header name (`X-Api-Key`), expected value (via secret `{{secrets.PARTNER_API_KEY}}`). Connector validates header before correlating. Documentation: [Webhook Connector](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

- **b)** No auth — all webhooks public. Documentation: [Webhook Connector](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

- **c)** HMAC always — partners must use HMAC. Documentation: [Webhook Connector](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

- **d)** mTLS only. Documentation: [Webhook Connector](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Webhook supports multiple auth schemes: HMAC signature, JWT, API key header, basic auth. Configure header name + expected value (via secret).

- **Option b) — Insecure default.** Always require auth.

- **Option c) — Inflexible.** Partner may not support HMAC; API key option exists.

- **Option d) — Heavy.** mTLS overkill for simple API key requirement.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. API Key auth setting.
- **b) 1/10** — insecure.
- **c) 4/10** — inflexible.
- **d) 4/10** — overkill.

**Correct Answer:** Configure API Key authentication in Webhook settings.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Webhook + API key in header" → разпознаваш che се иска **API Key auth setting**.

**Въпросът → Solution Framing.** "Setting fits" — изпитва се Webhook auth options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Webhook supports multiple auth schemes, че HMAC не е the only option, че mTLS е overkill за simple key. Знание за Webhook auth flexibility.

---

## Question 35: Configuring Connectors (Weighting: 6%)

**Scenario:** A custom Outbound Connector needs to **read a secret** at runtime to call its external API. The Connector is written in Java with the SDK.

**Which API in the Connector code fits?**

- **a)** Use the **`OutboundConnectorContext.getSecret(secretName)`** method (or the SDK's secret-aware property binding) — returns the resolved secret value. The runtime substitutes `{{secrets.NAME}}` references in the Connector's properties. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** Read environment variable directly. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/)

- **c)** Hardcode in Connector code. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/)

- **d)** Receive as a process variable. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Connector SDK exposes secret resolution via context — abstracts over the underlying secrets provider (env, K8s, Vault, etc.) and substitutes `{{secrets.NAME}}` placeholders.

- **Option b) — Tight coupling.** Reading env directly couples Connector to a specific provider; SDK abstraction is portable.

- **Option c) — Insecure.** Hardcoded secrets in code leak via repos and binaries.

- **Option d) — Leaks audit.** Secret-as-variable visible in Operate, audit logs.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. SDK secret-aware API.
- **b) 4/10** — tight coupling.
- **c) 1/10** — insecure.
- **d) 2/10** — leaks audit.

**Correct Answer:** Use the OutboundConnectorContext / SDK secret-aware property binding.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Read secret in Connector code" → разпознаваш че се иска **SDK secret API**.

**Въпросът → Solution Framing.** "API in code fits" — изпитва се Connector SDK secret resolution.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SDK abstracts secrets provider, че env-direct couples to runtime, че hardcode/variables leak. Знание за SDK secret handling.

---

## Question 36: Configuring Connectors (Weighting: 6%)

**Scenario:** An Inbound polling Connector checks a remote API for new records **every 60 seconds**. The team is configuring the polling interval.

**Which configuration fits?**

- **a)** Set the Inbound Polling Connector's **`pollInterval`** (or equivalent) property to `60s` (or `PT60S` ISO 8601 duration). Connector runtime polls at that cadence. Documentation: [Polling Connectors](https://docs.camunda.io/docs/components/connectors/protocol/polling/)

- **b)** Polling Connectors fixed at 30s. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Use a Timer Start Event at 60s cycle instead. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Polling Connectors aren't a Camunda concept. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Polling Inbound Connectors expose interval configuration; runtime polls the remote endpoint at that cadence and publishes matching messages to the BPMN.

- **Option b) — Incorrect.** Configurable.

- **Option c) — Workable but limited.** Timer Start would start a new instance per fire, requires polling logic in BPMN — Inbound Connector handles this cleaner.

- **Option d) — Incorrect.** Polling Inbound is a concept.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. pollInterval property.
- **b) 1/10** — невярно.
- **c) 6/10** — workable alternative но less elegant.
- **d) 1/10** — невярно.

**Correct Answer:** Set the polling Inbound Connector's pollInterval to 60s.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/protocol/polling/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Poll every 60 seconds" → разпознаваш че се иска **pollInterval property**.

**Въпросът → Solution Framing.** "Configuration fits" — изпитва се polling Connector knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че polling interval е configurable, че Timer Start е workable alternative, че Inbound Polling е a concept. Знание за polling Connector.

---

# Section 6 — Extensions & Integrations (Questions 37-50)

> Weight 25% • Topics: FEEL deep dive, SDKs, Job Workers, REST/gRPC APIs, RPA, zbctl.

---

## Question 37: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression computes `totalWithTax = subtotal * 1.20`. The team wants to **round to 2 decimal places** for currency display.

**Which FEEL built-in fits?**

- **a)** `decimal(value, scale)` — e.g., `decimal(subtotal * 1.20, 2)` rounds half-even to 2 decimals. Documentation: [FEEL numeric](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/)

- **b)** `round(value, 2)` — Java reflex. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `value.toFixed(2)` — JS reflex. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** FEEL doesn't round. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's numeric built-ins include `decimal(n, scale)` (and `floor`, `ceiling`, `round up`, `round down`, etc.). `decimal()` rounds to the given scale half-even.

- **Option b) — Java reflex.** FEEL uses `decimal()` or specific `round X`.

- **Option c) — JS reflex.** No dot-method on numbers.

- **Option d) — Incorrect.** Rounding supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. decimal() with scale.
- **b) 3/10** — wrong name.
- **c) 2/10** — wrong language.
- **d) 1/10** — невярно.

**Correct Answer:** decimal(subtotal * 1.20, 2).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Round to 2 decimals" → разпознаваш че се иска **decimal()**.

**Въпросът → Solution Framing.** "Built-in fits" — изпитва се FEEL numeric ops.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL има decimal/floor/ceiling/round, че round() per se е Java reflex, че dot-method е JS reflex. Знание за FEEL rounding.

---

## Question 38: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must format a number `amount = 1234567.89` as a currency string `"$1,234,567.89"` (grouping + 2 decimals + currency symbol).

**Which FEEL approach fits?**

- **a)** FEEL doesn't have built-in locale-aware currency formatting; **the cleanest approach is to do the formatting in a worker** (Java/Node) and pass the formatted string back. For server-side or simple cases, `string(decimal(amount, 2))` produces `"1234567.89"` (no grouping/symbol). Documentation: [FEEL string](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **b)** `currency(amount, "USD")` — built-in. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `format(amount, "$#,##0.00")`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `toLocaleString(amount, "en-US", {...})`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL has no built-in locale currency formatter. The realistic approach: format in a worker (which has access to Java's NumberFormat or Node's Intl.NumberFormat) and return the formatted string. For numbers-only, `string(decimal(amount, 2))` gives you something.

- **Option b) — Invented.** No `currency()` function.

- **Option c) — Invented.** No format-string function.

- **Option d) — JS reflex.** No `toLocaleString` in FEEL.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Format in worker; FEEL minimal.
- **b) 1/10** — invented.
- **c) 1/10** — invented.
- **d) 1/10** — JS reflex.

**Correct Answer:** Format in worker; FEEL doesn't have locale currency formatting.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Locale currency formatting" → trap testing FEEL limits.

**Въпросът → Solution Framing.** "Approach fits" — изпитва се knowledge на FEEL limits.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL няма locale formatter, че Java/Node have NumberFormat/Intl, че `decimal()` дава numeric scale only. Знание за FEEL limits.

---

## Question 39: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must find the **position of the first matching element** in a list. E.g., `tasks = ["INIT", "REVIEW", "APPROVE", "PUBLISH"]` — find position of `"APPROVE"` → `3` (1-indexed).

**Which FEEL built-in fits?**

- **a)** `index of(tasks, "APPROVE")` — returns list of positions where matches occur (FEEL returns a list since multiple matches possible). For first position, take first element. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** `indexOf(tasks, "APPROVE")` — JS-style. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `find(tasks, "APPROVE")`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `tasks.indexOf("APPROVE")`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `index of(list, match)` returns positions (list) where matches occur. Use `[1]` to get first.

- **Option b) — JS reflex.** FEEL uses space-separated `index of`.

- **Option c) — Invented.** No `find()`.

- **Option d) — JS reflex.** No method-call.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. index of().
- **b) 3/10** — wrong name.
- **c) 1/10** — invented.
- **d) 2/10** — JS reflex.

**Correct Answer:** index of(tasks, "APPROVE").

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Find position in list" → разпознаваш че се иска **index of**.

**Въпросът → Solution Framing.** "Built-in fits" — изпитва се FEEL list operations.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL `index of` е space-separated, че JS reflex `indexOf` грешно. Знание за FEEL list lookup.

---

## Question 40: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must safely check whether a variable `customer` exists (is not null) before accessing `customer.name`.

**Which FEEL approach fits?**

- **a)** Use `if customer != null then customer.name else "Unknown"` — direct null check. FEEL `if-then-else` returns the appropriate branch. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** `if exists(customer) then customer.name else "Unknown"`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `customer?.name` — optional chaining. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** FEEL auto-handles null; just write `customer.name`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `if customer != null then ... else ...` is the canonical null-safe access pattern.

- **Option b) — Invented.** No `exists()` function (despite many languages having something similar).

- **Option c) — Not FEEL.** Optional chaining is Kotlin/JS/Swift; not in FEEL.

- **Option d) — Risky.** FEEL on null-property-access typically returns null but it's better to explicitly check.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. if-then-else null check.
- **b) 2/10** — invented.
- **c) 2/10** — not FEEL.
- **d) 4/10** — risky reliance on implicit null.

**Correct Answer:** if customer != null then customer.name else default.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Safe null check before access" → разпознаваш че се иска **if-then-else null check**.

**Въпросът → Solution Framing.** "Approach fits" — изпитва се FEEL null handling.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL има if-then-else, че optional chaining не е FEEL, че няма `exists()`. Знание за FEEL null safety.

---

## Question 41: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team's Java Job Worker is failing under load. They suspect **too few activated jobs in flight**. The Spring Zeebe app is configured but they're not sure which knob to tune.

**Which Spring Zeebe configuration controls jobs-in-flight per worker?**

- **a)** **`maxJobsActive`** property (in `application.yaml` or `@JobWorker(maxJobsActive=...)`) — controls how many jobs the worker keeps activated concurrently. Default is low; increase under load. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** `timeout` — controls activation timeout, not concurrency. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** `pollInterval` — poll frequency, not in-flight count. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** `name` — worker display name. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `maxJobsActive` (Spring Zeebe property, also `@JobWorker` attribute) sets concurrency cap. Increasing it allows more parallel work per worker process.

- **Option b) — Different.** Timeout governs activation duration.

- **Option c) — Different.** Poll interval affects polling frequency, not depth.

- **Option d) — Different.** Worker name is metadata.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. maxJobsActive.
- **b) 3/10** — different.
- **c) 3/10** — different.
- **d) 1/10** — different.

**Correct Answer:** maxJobsActive property.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Tune jobs-in-flight" → разпознаваш че се иска **maxJobsActive**.

**Въпросът → Solution Framing.** "Config controls" — изпитва се worker tuning knobs.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че maxJobsActive controls concurrency, че timeout е duration, че pollInterval е cadence. Знание за worker tuning.

---

## Question 42: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Node.js Job Worker using `@camunda8/sdk` polls Zeebe for jobs. The team wants the worker to **poll every 5 seconds** for new jobs (when there are no jobs to keep active).

**Which option fits?**

- **a)** Set the worker's `pollInterval` (or `requestTimeout`) to `5000` (ms) — controls how often the SDK requests jobs when none are immediately available. Documentation: [Node.js SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **b)** `setInterval(workerPoll, 5000)` manually. Documentation: [Node.js SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **c)** Polling not configurable; fixed at 100ms. Documentation: [Node.js SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **d)** Use only streaming jobs; no polling. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** SDK worker options expose polling/timing properties. Set per worker; defaults reasonable for most use cases but tunable.

- **Option b) — Bypasses SDK.** SDK already handles polling; manual setInterval reinvents.

- **Option c) — Incorrect.** Configurable.

- **Option d) — Streaming is alternative.** Both supported; streaming reduces poll latency further.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. pollInterval option.
- **b) 3/10** — bypasses SDK.
- **c) 1/10** — невярно.
- **d) 6/10** — alternative но question е за polling.

**Correct Answer:** Set the worker's pollInterval option to 5000ms.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/node-js-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Poll every 5 seconds" → разпознаваш че се иска **pollInterval option**.

**Въпросът → Solution Framing.** "Option fits" — изпитва се Node SDK options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SDK exposes pollInterval, че setInterval bypasses SDK, че polling е configurable, че streaming е alternative. Знание за SDK polling.

---

## Question 43: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team's CI pipeline deploys BPMN models to a cluster. The pipeline is shell-based and uses **zbctl** (Zeebe CLI).

**Which `zbctl` command deploys a BPMN file?**

- **a)** `zbctl deploy --resourceFile process.bpmn --address <host>:26500 --clientId ... --clientSecret ...` — deploys a BPMN (or DMN/Form) resource to the cluster. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/)

- **b)** `zbctl create deployment process.bpmn`. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/)

- **c)** `zbctl upload --file process.bpmn`. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/)

- **d)** zbctl can't deploy; use API only. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `zbctl deploy` is the canonical command for deploying resources (BPMN/DMN/Form). Auth via client credentials in SaaS, address override for Self-Managed.

- **Option b) — Wrong subcommand.** Not the canonical syntax.

- **Option c) — Wrong subcommand.** Not the canonical syntax.

- **Option d) — Incorrect.** zbctl supports deploy.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. zbctl deploy.
- **b) 3/10** — wrong syntax.
- **c) 3/10** — wrong syntax.
- **d) 1/10** — невярно.

**Correct Answer:** zbctl deploy --resourceFile process.bpmn.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/cli-client/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Deploy BPMN via zbctl" → разпознаваш che се иска **zbctl deploy command**.

**Въпросът → Solution Framing.** "Command deploys" — изпитва се zbctl knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че zbctl deploy е canonical, че други subcommands не са correct. Знание за zbctl CLI.

---

## Question 44: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team's gRPC client receives error `NOT_FOUND` when calling Zeebe to publish a message. The error code suggests the message correlation didn't find a waiting subscription.

**Is `NOT_FOUND` from `publishMessage` always a problem?**

- **a)** **No — not necessarily.** `publishMessage` to a name+correlationKey with **no waiting subscription** at that moment is **not an error** in some Zeebe configurations — the message is **buffered** for the configured TTL waiting for a future subscription. If your client received NOT_FOUND, recheck the specific operation (e.g., command-by-key on instance) and Zeebe version/contract. For real-time message correlation, the broker accepts the publish without requiring a current subscriber. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **b)** Yes, always a problem; instance not found. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **c)** Yes, always; the message was rejected. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **d)** No, NOT_FOUND is never returned by publishMessage. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Message correlation in Zeebe doesn't require a pre-existing subscription — messages are buffered for their TTL waiting for matching subscriptions. NOT_FOUND in a `publishMessage` context typically wouldn't be expected; investigate other commands (e.g., commands by instance key). Understand: messages buffer.

- **Option b) — Inaccurate.** Buffering is the design.

- **Option c) — Inaccurate.** Not rejected.

- **Option d) — Overstated.** NOT_FOUND can appear in other gRPC contexts; investigate.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Investigate; buffering is the design.
- **b) 3/10** — inaccurate.
- **c) 3/10** — inaccurate.
- **d) 4/10** — overstated absolutism.

**Correct Answer:** NOT_FOUND isn't necessarily a problem for publishMessage; messages buffer for TTL.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/messages/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "publishMessage NOT_FOUND" → разпознаваш че се иска **buffer semantics knowledge**.

**Въпросът → Solution Framing.** "Always a problem?" — изпитва се message buffering.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че messages buffer for TTL, че subscription може да arrive later, че contracts vary by Zeebe version. Знание за message buffering.

---

## Question 45: Extensions & Integrations (Weighting: 25%)

**Scenario:** A backend uses OAuth2 client-credentials to get an access token for Camunda 8 SaaS APIs. The token expires after 1 hour. The team wants to handle refresh.

**Which approach fits?**

- **a)** **Cache the token** in memory; before each API call, check expiry; if expired (or near expiry), re-request a new token from the auth endpoint. SDKs typically handle this transparently — when writing raw HTTP code, implement the refresh check. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **b)** Request a new token before every API call (no caching). Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **c)** Hardcode a long-lived token. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **d)** Tokens don't expire. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Standard OAuth2 client-credentials practice: cache + refresh on expiry. SDKs (Java, Spring Zeebe, @camunda8/sdk) handle this; raw HTTP code must implement.

- **Option b) — Wasteful.** Token-per-call slams the auth endpoint and adds latency.

- **Option c) — Doesn't exist.** SaaS tokens expire.

- **Option d) — Incorrect.** Tokens expire (typically 1h).

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Cache + refresh.
- **b) 3/10** — wasteful.
- **c) 1/10** — doesn't exist.
- **d) 1/10** — невярно.

**Correct Answer:** Cache the token; refresh when expiring.

**Official Documentation Link:** https://docs.camunda.io/docs/guides/setup-client-connection-credentials/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Token expires + refresh" → разпознаваш че се иска **cache + refresh**.

**Въпросът → Solution Framing.** "Approach fits" — изпитва се OAuth2 standard practice.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че OAuth2 best practice е cache+refresh, че per-call е wasteful, че long-lived hardcoded не съществува. Знание за OAuth2 lifecycle.

---

## Question 46: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team has separate **design-time** and **run-time** RPA environments: developers author bots in a desktop / web RPA studio (design); production RPA workers execute them headlessly (run-time).

**Which best describes the Camunda RPA architecture?**

- **a)** **Camunda RPA separates design (script authoring) from runtime (workers executing bots).** A bot script is authored (often in an RPA DSL, sometimes generated from a low-code recorder), versioned/deployed, and executed by RPA workers that subscribe to BPMN Service Tasks. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **b)** Design and runtime are the same component. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **c)** RPA design is via BPMN modeling only. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **d)** RPA bots execute in the Zeebe broker process. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Design (authoring bots) and runtime (executing them via workers) are separated. Bots are deployed/versioned; workers subscribe to RPA-typed Service Tasks and execute the bot script.

- **Option b) — Incorrect.** Architecture separates them.

- **Option c) — Misleading.** BPMN orchestrates RPA Service Tasks; bot scripts are separate artifacts.

- **Option d) — Incorrect.** RPA workers are separate processes.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Design vs runtime separation.
- **b) 2/10** — incorrect.
- **c) 4/10** — misleading.
- **d) 1/10** — incorrect.

**Correct Answer:** RPA separates design (script authoring) from runtime (workers executing bots).

**Official Documentation Link:** https://docs.camunda.io/docs/components/rpa/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Design vs runtime in RPA" → разпознаваш че се иска **separation knowledge**.

**Въпросът → Solution Framing.** "Architecture" — изпитва се RPA architecture.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че RPA separates design + runtime, че bot scripts са separate artifacts, че Zeebe broker doesn't run bots. Знание за RPA architecture.

---

## Question 47: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must return **unique values** from a list with duplicates: `tags = ["A", "B", "A", "C", "B"]` → `["A", "B", "C"]`.

**Which FEEL built-in fits?**

- **a)** `distinct values(tags)` — returns unique elements. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** `unique(tags)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `set(tags)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `dedupe(tags)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `distinct values(list)` (space-separated) returns unique elements.

- **Option b) — Wrong name.** FEEL uses `distinct values`.

- **Option c) — Wrong abstraction.** No `set()` constructor.

- **Option d) — Wrong name.** Not a FEEL built-in.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. distinct values().
- **b) 3/10** — wrong name.
- **c) 2/10** — wrong abstraction.
- **d) 2/10** — wrong name.

**Correct Answer:** distinct values(tags).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Unique values from list" → разпознаваш че се иска **distinct values**.

**Въпросът → Solution Framing.** "Built-in fits" — изпитва се FEEL list ops.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL `distinct values` е canonical, че други names не са FEEL. Знание за FEEL deduplication.

---

## Question 48: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must **sort** a list of objects by their `priority` field: `tasks = [{name: "A", priority: 3}, {name: "B", priority: 1}, ...]`. Result: ascending by priority.

**Which FEEL approach fits?**

- **a)** `sort(tasks, function(a, b) a.priority < b.priority)` — FEEL `sort()` takes a list and a comparator function. Result is sorted ascending. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** `tasks.sort()`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `orderBy(tasks, "priority")`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** FEEL doesn't sort. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `sort(list, comparator)` takes a list and a comparator function (returning true if first < second). Result is sorted.

- **Option b) — Wrong syntax.** No method-call.

- **Option c) — Invented.** No `orderBy()`.

- **Option d) — Incorrect.** Sort supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. sort(list, comparator).
- **b) 2/10** — wrong syntax.
- **c) 1/10** — invented.
- **d) 1/10** — невярно.

**Correct Answer:** sort(tasks, function(a, b) a.priority < b.priority).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Sort list by field" → разпознаваш че се иска **sort() with comparator**.

**Въпросът → Solution Framing.** "Approach fits" — изпитва се FEEL sort signature.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL sort() takes comparator function, че method-call не е FEEL, че `orderBy` не съществува. Знание за FEEL sort.

---

## Question 49: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Java Job Worker handles `process-payment` jobs. The worker doesn't need **all process variables** — just `amount` and `currency`. Activating with all variables would waste bandwidth on large state.

**Which Spring Zeebe option fits?**

- **a)** Set `fetchVariables = {"amount", "currency"}` on `@JobWorker` — only those variables are fetched on activation; other process state stays on the broker. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** All variables always fetched. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** Use `@Variable` parameters; SDK auto-detects needed vars. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** Fetch all then drop in worker. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `fetchVariables` whitelist on `@JobWorker` (or worker builder option) limits activation payload to specified vars — saves bandwidth.

- **Option b) — Inefficient.** Default may fetch all; whitelist optimises.

- **Option c) — Sometimes correct.** Some SDKs auto-detect; Spring Zeebe historically did but verifying explicit `fetchVariables` is safest.

- **Option d) — Wasteful.** Defeats the optimisation.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. fetchVariables whitelist.
- **b) 3/10** — inefficient if default.
- **c) 6/10** — depends on SDK auto-detection.
- **d) 2/10** — wasteful.

**Correct Answer:** Set fetchVariables = {"amount", "currency"} on @JobWorker.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Fetch only specific vars" → разпознаваш че се иска **fetchVariables**.

**Въпросът → Solution Framing.** "Option fits" — изпитва се worker bandwidth optimization.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че fetchVariables е whitelist, че all-by-default е inefficient, че auto-detection varies by SDK version. Знание за worker payload control.

---

## Question 50: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must check whether a string `email` **ends with** `"@company.com"`.

**Which FEEL built-in fits?**

- **a)** `ends with(email, "@company.com")` — FEEL string built-in (space-separated name). Returns boolean. Documentation: [FEEL string](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **b)** `email.endsWith("@company.com")` — method call. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `endsWith(email, "@company.com")` — Java style. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `email matches ".*@company.com$"` — regex. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `ends with(s, suffix)` (space-separated) tests suffix. Companion to `starts with`.

- **Option b) — JS reflex.** No method-call.

- **Option c) — Wrong format.** FEEL uses space-separated.

- **Option d) — Works but overkill.** `matches` (regex) works but `ends with` is the direct primitive.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. ends with().
- **b) 2/10** — JS reflex.
- **c) 3/10** — wrong format.
- **d) 5/10** — works but overkill.

**Correct Answer:** ends with(email, "@company.com").

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Ends with check" → разпознаваш че се иска **ends with**.

**Въпросът → Solution Framing.** "Built-in fits" — изпитва се FEEL string ops.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL multi-word names са space-separated, че method-call не е FEEL, че regex е overkill. Знание за FEEL string built-ins.

---

# Section 7 — Managing the Development Process (Questions 51-59)

> Weight 15% • Topics: Web Modeler resources, Play, Operate, Tasklist, troubleshooting, migration.

---

## Question 51: Managing the Development Process (Weighting: 15%)

**Scenario:** A Web Modeler project contains multiple types of resources. The team is adding artifacts to support a new feature.

**Which resource types can a Web Modeler project hold?**

- **a)** **BPMN diagrams, DMN decisions, Forms, Connector Templates** — Web Modeler is a unified modelling environment for all four core artifact types. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **b)** BPMN only. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** BPMN + DMN; Forms and Templates are external. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** BPMN + DMN + Forms + RPA scripts (all four). Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler hosts BPMN, DMN, Forms, and Connector Templates as first-class artifacts. RPA scripts are managed via the RPA tooling (separate). Verify the current docs for the full list — the canonical four are BPMN/DMN/Forms/Templates.

- **Option b) — Too narrow.** Multi-artifact support is core to Web Modeler.

- **Option c) — Outdated.** Forms and Templates supported.

- **Option d) — Mostly correct but RPA scripts are typically separate.** Verify per version.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. BPMN/DMN/Forms/Templates са canonical.
- **b) 3/10** — too narrow.
- **c) 4/10** — outdated.
- **d) 6/10** — mostly correct но RPA typically separate.

**Correct Answer:** BPMN, DMN, Forms, and Connector Templates.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Resource types in Web Modeler" → разпознаваш че се иска **artifact taxonomy**.

**Въпросът → Solution Framing.** "Can hold" — изпитва се Web Modeler scope.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler е multi-artifact. Знание за Web Modeler scope.

---

## Question 52: Managing the Development Process (Weighting: 15%)

**Scenario:** A team uses Play to test a process. The process has a Service Task that calls a real external API. During Play, the team wants to **use real workers** (not mocks) to test end-to-end including the actual API call.

**Can Play use real workers?**

- **a)** **Yes** — when workers are deployed and subscribed, Play execution can use them. Configure Play's cluster target to a dev cluster where workers are running; activation routes to real workers. Otherwise Play offers mock UI for tasks without workers. Documentation: [Play](https://docs.camunda.io/docs/components/modeler/web-modeler/play-your-process/)

- **b)** No, Play always mocks. Documentation: [Play](https://docs.camunda.io/docs/components/modeler/web-modeler/play-your-process/)

- **c)** Only if you deploy first. Documentation: [Play](https://docs.camunda.io/docs/components/modeler/web-modeler/play-your-process/)

- **d)** Play is offline-only. Documentation: [Play](https://docs.camunda.io/docs/components/modeler/web-modeler/play-your-process/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Play uses a backing cluster — if real workers are subscribed there, they pick up activated jobs. Use mock UI for unimplemented tasks. Practical workflow: implement workers in dev cluster + use Play for orchestration testing.

- **Option b) — Incorrect.** Real workers usable when subscribed.

- **Option c) — Partially.** "Deploy first" is unclear — Play deploys to its sandbox.

- **Option d) — Incorrect.** Play uses cluster.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Real workers if subscribed.
- **b) 3/10** — incorrect.
- **c) 5/10** — partially clear.
- **d) 1/10** — невярно.

**Correct Answer:** Yes — when workers are deployed and subscribed to the Play target cluster.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/play-your-process/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Play with real workers" → разпознаваш че се иска **cluster + subscribed workers**.

**Въпросът → Solution Framing.** "Can use real workers" — изпитва се Play setup knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Play executes on cluster, че subscribed workers handle jobs, че mock е fallback. Знание за Play modes.

---

## Question 53: Managing the Development Process (Weighting: 15%)

**Scenario:** A Service Task incident shows error "Connection refused" — the worker was offline. The worker is now back. Ops wants to **retry the job manually** without resetting all incidents.

**Which Operate action fits?**

- **a)** Use Operate's **"Retry Job"** action on the specific incident — increments retries and re-activates the job. Distinct from "Resolve Incident" which resets retries to the original count. Both work; "Retry" is finer-grained. Documentation: [Operate Incidents](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **b)** Restart Zeebe to clear stuck jobs. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Edit variables. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Cancel and recreate. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate provides job-level retry. "Resolve Incident" resets retries to original configured count and re-activates; "Retry Job" is similar but finer-grained per Zeebe version. Both achieve the goal here.

- **Option b) — Disproportionate.** Cluster restart for one stuck job is overkill.

- **Option c) — Wrong tool.** Variable edit doesn't trigger retry.

- **Option d) — Loses state.** Recreate destroys progress.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Retry Job / Resolve Incident.
- **b) 1/10** — disproportionate.
- **c) 3/10** — wrong tool.
- **d) 2/10** — loses state.

**Correct Answer:** Use Operate's Retry Job (or Resolve Incident) action.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Retry job manually after worker offline" → разпознаваш че се иска **Retry / Resolve Incident**.

**Въпросът → Solution Framing.** "Action fits" — изпитва се Operate Incident handling.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Retry/Resolve е canonical, че cluster restart е disproportionate, че variable edit не triggers retry. Знание за Operate Incident actions.

---

## Question 54: Managing the Development Process (Weighting: 15%)

**Scenario:** A User Task `process-claim` was assigned to user `alice` who is on vacation. Ops needs to **reassign** to `bob` so processing continues.

**Which Tasklist action fits?**

- **a)** In Tasklist (or via Tasklist API), **unclaim** the task — returns it to the candidate pool — and have `bob` claim it. Alternative: directly **reassign** if Tasklist UI / API supports it. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/)

- **b)** Cancel the process instance. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Wait for `alice` to return. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **d)** User Tasks can't be reassigned. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Tasklist supports unclaiming a task (releases assignee, returns to candidates) and claiming as another user. Alternatively, direct reassign via API. Designed for exactly this scenario.

- **Option b) — Destructive.** Loses progress.

- **Option c) — Blocking.** Ops can act.

- **Option d) — Incorrect.** Reassignment supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Unclaim + bob claims (или reassign).
- **b) 1/10** — destructive.
- **c) 2/10** — blocking.
- **d) 1/10** — невярно.

**Correct Answer:** Unclaim the task; bob claims it (or directly reassign via API).

**Official Documentation Link:** https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Reassign User Task" → разпознаваш че се иска **unclaim/reassign**.

**Въпросът → Solution Framing.** "Action fits" — изпитва се Tasklist task management.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Tasklist supports unclaim/reassign, че cancel destroys progress. Знание за Tasklist task lifecycle.

---

## Question 55: Managing the Development Process (Weighting: 15%)

**Scenario:** A team is **decomposing a large monolithic BPMN** (50+ tasks) into smaller, reusable subprocesses. Their goal is maintainability and clarity.

**Which best practice fits?**

- **a)** **Decompose by business domain** — extract subprocesses with cohesive responsibility (e.g., `payment-processing`, `customer-notification`) as **Call Activities** for reuse, **Embedded Subprocesses** for internal grouping. Keep each diagram readable in one page. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** Keep as one big diagram for visibility. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **c)** Decompose into 10-task chunks regardless of meaning. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **d)** Split arbitrarily; team intuition. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Decomposition principles: cohesive responsibility, single-screen readability, reuse where applicable (Call Activity), inline grouping where contextual (Embedded Subprocess). Domain boundaries align with BPMN best practices.

- **Option b) — Hard to maintain.** Large diagrams become illegible.

- **Option c) — Arbitrary.** Mechanical chunking ignores semantic boundaries.

- **Option d) — Arbitrary.** Intuition without principles produces inconsistent diagrams.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Decompose by domain + readability.
- **b) 3/10** — hard to maintain.
- **c) 3/10** — arbitrary.
- **d) 3/10** — arbitrary.

**Correct Answer:** Decompose by business domain into cohesive subprocesses.

**Official Documentation Link:** https://docs.camunda.io/docs/components/best-practices/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Decompose monolithic BPMN" → разпознаваш че се иска **domain decomposition**.

**Въпросът → Solution Framing.** "Best practice fits" — изпитва се BPMN modelling principles.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че principle е cohesive responsibility + readability, че mechanical chunking е arbitrary. Знание за BPMN decomposition.

---

## Question 56: Managing the Development Process (Weighting: 15%)

**Scenario:** A team must audit **historical variable values** of a process instance — what `orderStatus` was set to at various points during execution.

**Which feature fits?**

- **a)** Operate's **variable history** — shows variable values over time per instance. Operate stores variable updates as historical records. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **b)** Variables are only "current" — no history. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Optimize variable history. Documentation: [Optimize](https://docs.camunda.io/docs/components/optimize/)

- **d)** Audit via Zeebe broker logs. Documentation: [Zeebe](https://docs.camunda.io/docs/components/concepts/architecture/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate captures variable updates over the lifetime of an instance. Per-instance view shows variable evolution.

- **Option b) — Incorrect.** History exists.

- **Option c) — Partial.** Optimize has aggregate analytics; Operate has per-instance audit.

- **Option d) — Wrong tool.** Logs aren't structured audit.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Operate variable history.
- **b) 1/10** — невярно.
- **c) 5/10** — partial (Optimize е aggregate).
- **d) 2/10** — wrong tool.

**Correct Answer:** Operate's variable history.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Historical variable values per instance" → разпознаваш че се иска **Operate variable history**.

**Въпросът → Solution Framing.** "Feature fits" — изпитва се Operate scope.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate has variable history, че Optimize е aggregate analytics. Знание за per-instance audit.

---

## Question 57: Managing the Development Process (Weighting: 15%)

**Scenario:** A team has many process instances correlated by `customerId` for the same customer over time. They want to **find all instances** for `customerId = "C-789"` in Operate.

**Which Operate feature fits?**

- **a)** Operate's **variable filter** — filter instances by variable name and value (`customerId = "C-789"`). Documentation: [Operate filters](https://docs.camunda.io/docs/components/operate/userguide/process-instance-summary/)

- **b)** Tasklist search. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **c)** Optimize. Documentation: [Optimize](https://docs.camunda.io/docs/components/optimize/)

- **d)** Search by process instance key only. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate supports filtering instances by variable name+value. Critical for customer-specific search.

- **Option b) — Wrong tool.** Tasklist filters User Tasks, not arbitrary instances.

- **Option c) — Aggregate, not per-customer search.** Optimize is analytics.

- **Option d) — Limited.** Need to find by business identifier, not internal key.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Variable filter.
- **b) 3/10** — wrong tool.
- **c) 4/10** — different scope.
- **d) 3/10** — limited.

**Correct Answer:** Operate's variable filter on customerId.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-summary/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Find instances by customer ID" → разпознаваш че се иска **variable filter**.

**Въпросът → Solution Framing.** "Feature fits" — изпитва се Operate filtering.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate supports variable filtering, че Tasklist е user-task scope, че Optimize е aggregate. Знание за Operate variable search.

---

## Question 58: Managing the Development Process (Weighting: 15%)

**Scenario:** Ops keeps Operate open on a high-traffic process dashboard. They wonder how often Operate **refreshes**.

**Which describes Operate's update model?**

- **a)** Operate views typically **auto-refresh** on a configurable interval (e.g., every 10-30 seconds), or update on user action. Real-time push isn't the default; expect near-real-time. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **b)** Real-time push updates (millisecond latency). Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Once per day. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Manual refresh only. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate is near-real-time — its data comes from broker exporters into Elasticsearch/OpenSearch; UI polls/refreshes at intervals. Not millisecond-real-time push.

- **Option b) — Overstated.** Operate isn't push.

- **Option c) — Understated.** Updates more frequently.

- **Option d) — Understated.** Auto-refresh exists.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Near-real-time auto-refresh.
- **b) 3/10** — overstated.
- **c) 1/10** — understated.
- **d) 4/10** — understated.

**Correct Answer:** Near-real-time auto-refresh on configurable interval.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Operate refresh model" → разпознаваш че се иска **near-real-time**.

**Въпросът → Solution Framing.** "Describes update model" — изпитва се knowledge на Operate architecture.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate е near-real-time, че data flows via exporters, че не е push. Знание за Operate update mechanism.

---

## Question 59: Managing the Development Process (Weighting: 15%)

**Scenario:** A team is migrating instances from `order-v1` to `order-v2`. v2 added a new Service Task between `validate` and `ship`. Mapping is straightforward for most flow nodes, but the **new task** has no v1 counterpart. The team wants to know how the migrated instances handle the new task.

**What happens to migrated instances regarding the new flow node?**

- **a)** Migrated instances that are **past** the new task's position continue normally (the new task was never on their path). Instances **before** that position will encounter the new task when execution reaches it. Migration plans don't auto-execute new tasks for completed positions. Documentation: [Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **b)** All migrated instances re-execute the new task retrospectively. Documentation: [Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **c)** Migration fails because of the new task. Documentation: [Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **d)** New tasks are auto-skipped for migrated instances. Documentation: [Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Migration applies the new model definition to existing instances at their current execution state. Instances whose token is **after** the new task position simply continue on v2; instances **before** that position will encounter the new task when they progress there. No retroactive execution; no auto-skipping.

- **Option b) — Incorrect.** No retroactive re-execution.

- **Option c) — Misleading.** Migration handles inserted nodes — only conflicting mappings might fail.

- **Option d) — Incorrect.** Not auto-skipped.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Migration applies state forward.
- **b) 2/10** — incorrect.
- **c) 4/10** — misleading.
- **d) 3/10** — incorrect.

**Correct Answer:** Tokens past the new task continue; tokens before encounter it when execution reaches there.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Migration with new task" → разпознаваш че се иска **forward-execution semantics**.

**Въпросът → Solution Framing.** "What happens" — изпитва се migration semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че migration applies state forward, no retroactive, no auto-skip. Знание за migration semantics.

---

# Section 8 — Dev Environment Setup (Question 60)

> Weight 1% • Topics: Camunda 8 Run lifecycle, shutdown, environment.

---

## Question 60: Dev Environment Setup (Weighting: 1%)

**Scenario:** A developer using **Camunda 8 Run** wants to **cleanly stop** the local stack and **restart** with fresh state for the next test.

**Which workflow fits?**

- **a)** Stop via the provided **shutdown script** (`./shutdown.sh` on Linux/Mac, `shutdown.bat` on Windows). Restart with `start.sh` / `start.bat`. To reset state, delete or recreate the data directory (e.g., remove the `c8run` data folder). Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **b)** Kill the process with `kill -9`. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **c)** Camunda 8 Run can't be cleanly stopped; reboot the laptop. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **d)** Restart automatically refreshes data; no manual delete needed. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Run ships with start/shutdown scripts for graceful lifecycle. State persists in a data directory between starts; remove it to reset.

- **Option b) — Ungraceful.** kill -9 risks data corruption.

- **Option c) — Incorrect.** Graceful stop supported.

- **Option d) — Incorrect.** Restart preserves state unless data dir is removed.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. shutdown.sh/.bat + delete data for reset.
- **b) 2/10** — ungraceful.
- **c) 1/10** — невярно.
- **d) 2/10** — incorrect.

**Correct Answer:** Use shutdown.sh/.bat to stop; remove data directory for fresh state.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Stop + restart fresh" → разпознаваш че се иска **shutdown script + data dir delete**.

**Въпросът → Solution Framing.** "Workflow fits" — изпитва се lifecycle knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че shutdown script е graceful, че kill -9 е ungraceful, че data persists между starts. Знание за Camunda 8 Run lifecycle.

---

# Закриваща секция — Set 6

**Чек-лист по Blueprint (60 въпроса = 100% на изпита):**

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

**Време:** 75 минути → ≈ 1m 15s на въпрос.
**Праг:** 65% → ≥ 39/60.

**Препоръка за тренировка (Set 6):**
1. **Open-book проход** — чети всеки 🔍 Explanations + Three-Skills Decomposition; не таймирай.
2. **Closed-book timed run** — 75-минутен таймер; запиши отговорите си; цел: ≥ 39/60.
3. **Анализ на грешки:** за всяка грешка кои от 3-те skills ти липсваше (Diagnostic Comprehension / Solution Framing / Mechanism Knowledge).

**Чести грешки в Set 6 (грешен axis вместо грешен отговор):**
- Q1 (Send Task) — пътане с generic Service Task (functionally works но less semantic).
- Q8 (Gateway vs Conditional Flow) — trap; both valid но best-practice prefers Gateway.
- Q9 (Throw Message Event vs Send Task) — both express outbound messaging; choose by task-level affordances.
- Q20 (Message correlation uniqueness) — design contract — duplicate correlation keys са anti-pattern; broker correlates to one.
- Q23 (ANY hit policy) — пътане с UNIQUE (which forbids multi-match) vs ANY (which allows multi if same output).
- Q26 (DMN list contains) — cleanest pattern е input expression + boolean rule entry, not raw unary test.
- Q28 (Knowledge Source) — пътане с BKM (reusable logic) или Input Data (data) — Knowledge Source е governance metadata.
- Q40 (FEEL null check) — `?.` optional chaining не е FEEL; explicit if-then-else canonical.
- Q44 (NOT_FOUND on publishMessage) — messages buffer for TTL; absence of subscription не е error.
- Q59 (migration with new task) — forward-execution semantics; no retroactive, no auto-skip.

**Успех на изпита!**
