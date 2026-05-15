# Camunda 8 C8-CP-DV Mock Exam — Set 4

> **60 въпроса • 75 минути • праг ≥ 65% (39/60) • Blueprint v8.8.0**
>
> Свежи сценарии — distinct от Set 1, Set 2, Set 3. Всеки въпрос: сценарий + 4 опции (a/b/c/d) + 🔍 Explanations + per-option score 1–10 + Correct Answer + Documentation Link + 🧠 Three-Skills Decomposition.

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

**Scenario:** A logistics process tracks **package handoff** between three internal teams: Receiving, Sorting, Dispatch. Each team is a separate organisational unit but the process is one BPMN file. Management wants visual swim-lane separation so each team sees their own tasks immediately, while the **overall flow remains a single process**.

**Which BPMN construct fits this requirement?**

- **a)** Single **Pool with three Lanes** — one Lane per team. Tasks placed in their respective Lane visually segregate work; the process remains a single Zeebe-executable definition. Documentation: [Pools and Lanes](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **b)** Three separate Pools — one per team — connected by Message Flows. Documentation: [Collaboration](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **c)** Single Pool with no Lanes; use Task documentation to indicate the team. Documentation: [Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/tasks/)

- **d)** Three separate BPMN files chained via Call Activities. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Lanes are the canonical BPMN construct for **visual segregation within a single process**. One Pool = one Zeebe process definition; multiple Lanes = visual ownership swim-lanes. Tasks placed in the Sorting Lane are clearly "Sorting's work" without breaking the single-process flow.

- **Option b) — Wrong scope.** Multiple Pools represent **separate participants** that communicate via Message Flows — not internal teams of one organisation. Each Pool becomes its own process definition.

- **Option c) — Loses visibility.** Documentation strings aren't visible without inspecting; defeats the "visual swim-lane separation" requirement.

- **Option d) — Over-engineered.** Three BPMN files for internal team handoffs adds deployment/versioning overhead with no benefit.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Lanes са canonical за visual segregation в едно process definition.
- **b) 4/10** — wrong scope (Pools = different participants).
- **c) 3/10** — defeats visibility requirement.
- **d) 3/10** — over-engineered за internal teams.

**Correct Answer:** Single Pool with three Lanes — one per team.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Three internal teams + visual swim-lane separation + single overall flow" → разпознаваш che се иска **Pool + Lanes**.

**Въпросът → Solution Framing.** "Fits this requirement" — изпитва се knowledge на Pool/Lane semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Lanes са visual within единичен process, знаеш che Pools = separate participants, знаеш че Call Activity е за reusable subprocesses. Това е знание за BPMN organisational constructs.

---

## Question 2: Modeling (Weighting: 15%)

**Scenario:** A customer-support ticket process must escalate to a supervisor if **no agent picks up the User Task within 4 hours**. The escalation should leave the original task active (a regular agent can still pick it up) but **notify a supervisor in parallel**.

**Which BPMN construct best handles this?**

- **a)** **Non-interrupting Timer Boundary Event** attached to the User Task, configured with `PT4H`. When the timer fires, control branches to the supervisor-notify path while the original User Task stays active. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** Interrupting Timer Boundary Event with `PT4H`. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** Event Subprocess with Message Start Event. Documentation: [Event Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

- **d)** Add a parallel "wait 4 hours then notify" branch via Parallel Gateway. Documentation: [Gateways](https://docs.camunda.io/docs/components/modeler/bpmn/parallel-gateways/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Non-interrupting** Timer Boundary Event (dashed border) fires the timer **without cancelling** the host User Task. The supervisor-notify path runs in parallel while the original task remains active. This is canonical escalation-notify pattern.

- **Option b) — Wrong semantics.** Interrupting (solid border) would **cancel** the User Task — agent can no longer pick it up.

- **Option c) — Wrong trigger.** Event Subprocess fires on a different signal type (Message); Timer is the natural trigger for "after 4 hours."

- **Option d) — Works but ugly.** Parallel Gateway with explicit wait is more verbose; Boundary Event is purpose-built.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Non-interrupting Timer Boundary е canonical за parallel escalation.
- **b) 3/10** — cancels the original task (wrong semantics).
- **c) 5/10** — wrong trigger type for "4 hours."
- **d) 5/10** — works but verbose.

**Correct Answer:** Non-interrupting Timer Boundary Event with PT4H.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Leave task active + notify supervisor in parallel" → разпознаваш che се иска **non-interrupting** (не interrupting).

**Въпросът → Solution Framing.** "Best handles" — изпитва се interrupting vs non-interrupting boundary semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че non-interrupting (dashed) keeps host active, знаеш че interrupting (solid) cancels, знаеш че Event Subprocess fires on its own trigger. Това е знание за Boundary Event semantics.

---

## Question 3: Modeling (Weighting: 15%)

**Scenario:** An e-commerce checkout has two **alternative payment paths**: card or PayPal. The user selects one at the start, and only that path executes. The two paths converge before the order-confirmation step.

**Which gateway pair correctly models this?**

- **a)** **Exclusive Gateway (XOR)** to split, **Exclusive Gateway (XOR)** to join. Only the selected branch executes; the join waits for one token. Documentation: [Exclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/)

- **b)** Parallel Gateway to split, Parallel Gateway to join. Documentation: [Parallel Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/parallel-gateways/)

- **c)** Inclusive Gateway to split, Inclusive Gateway to join. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **d)** Event-Based Gateway to split, Exclusive Gateway to join. Documentation: [Event-Based Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Exclusive Gateway (XOR) selects **exactly one** outgoing path based on condition (e.g., `=paymentMethod = "card"`). The joining XOR merges any single token without waiting for others. Canonical "either/or" branching.

- **Option b) — Wrong semantics.** Parallel Gateway runs **both** paths — would charge the customer twice.

- **Option c) — Overkill.** Inclusive Gateway allows one or many paths; XOR is sufficient and clearer for strict either/or.

- **Option d) — Wrong trigger.** Event-Based Gateway routes on **incoming events** (Messages, Timers), not on a process variable. Used for "wait for whichever arrives first" scenarios.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. XOR–XOR е canonical за either/or.
- **b) 1/10** — двойно charge.
- **c) 6/10** — works но overkill.
- **d) 3/10** — wrong trigger (events, not variable).

**Correct Answer:** Exclusive Gateway to split, Exclusive Gateway to join.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Two alternative paths + only one executes" → разпознаваш che се иска **XOR**.

**Въпросът → Solution Framing.** "Gateway pair correctly models" — изпитва се knowledge на gateway semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че XOR = exactly one, Parallel = all branches, Inclusive = one-or-many on conditions, Event-Based = on incoming events. Това е знание за gateway types.

---

## Question 4: Modeling (Weighting: 15%)

**Scenario:** A travel-booking process must invoke a separately-maintained `payment-processing` BPMN as part of its flow. The payment-processing BPMN is owned by a different team, has its own lifecycle, and is reused by 5 other processes.

**Which BPMN construct invokes another deployed process synchronously?**

- **a)** **Call Activity** referencing the called process definition by its `processId`. The parent process pauses until the called process completes; data is passed in/out via input/output mappings. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **b)** Send Task that delivers a Message Start trigger. Documentation: [Send Task](https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/)

- **c)** Embedded Subprocess containing the payment-processing logic copied inline. Documentation: [Embedded Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/)

- **d)** Service Task with `type = "call-process"`. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Call Activity is the canonical BPMN construct for **synchronous invocation of another deployed process**. The parent suspends, the called process executes, results return via output mapping, parent resumes. Independent lifecycle of the called definition is preserved — perfect for shared, reusable subprocesses.

- **Option b) — Wrong semantics.** Send Task + Message Start triggers an **asynchronous** new instance; no automatic return-flow.

- **Option c) — Defeats reuse.** Embedded copy means 6 places to maintain the same logic.

- **Option d) — Invented type.** No `call-process` Service Task type; Call Activity is its own BPMN element.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Call Activity е canonical за synchronous reuse.
- **b) 4/10** — async; no return-flow.
- **c) 3/10** — defeats reuse (6× maintenance).
- **d) 2/10** — invented mechanism.

**Correct Answer:** Call Activity referencing the called process definition by processId.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Reused subprocess + separately maintained + 5 other processes" → разпознаваш че се иска **Call Activity**.

**Въпросът → Solution Framing.** "Invokes another deployed process synchronously" — изпитва се BPMN reuse construct.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Call Activity = sync reuse, Send Task = async, Embedded = inline copy, и че Service Task няма "call-process" type. Това е знание за BPMN reuse patterns.

---

## Question 5: Modeling (Weighting: 15%)

**Scenario:** A risk-assessment process runs **for each customer** in a list. The customer list comes from a previous step. The team wants all customers assessed **in parallel** to minimise total processing time. Each assessment produces a `score`; all scores are collected at the end.

**Which BPMN construct fits?**

- **a)** **Parallel Multi-Instance Subprocess** with `inputCollection = customers`, `inputElement = customer`, `outputCollection = scores`, `outputElement = score`. All instances execute concurrently; scores accumulate into a list. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Sequential Multi-Instance Subprocess. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Loop with Exclusive Gateway iterating through customers. Documentation: [Gateways](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **d)** Single Service Task with FEEL `for customer in customers return assess(customer)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Parallel Multi-Instance executes one instance per `inputCollection` element **concurrently**. `outputElement` per instance accumulates into `outputCollection`. Designed exactly for "for each X in parallel + collect results."

- **Option b) — Wrong execution mode.** Sequential runs instances one-after-another — slower; question says "in parallel."

- **Option c) — No native loop.** BPMN doesn't have a loop gateway construct; Multi-Instance is the proper iteration pattern.

- **Option d) — Wrong place for logic.** Stuffing iteration into FEEL inside one Service Task hides what BPMN should expose visually; also limits per-instance error handling, retries, etc.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Parallel MI + inputCollection/outputCollection е canonical.
- **b) 5/10** — sequential, не parallel.
- **c) 2/10** — BPMN няма loop gateway.
- **d) 3/10** — hides iteration, lacks per-instance lifecycle.

**Correct Answer:** Parallel Multi-Instance Subprocess with inputCollection/outputCollection.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "For each + parallel + collect results" → разпознаваш че се иска **Parallel MI + collection mappings**.

**Въпросът → Solution Framing.** "Fits" — изпитва се MI configuration knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Parallel ≠ Sequential, BPMN няма loop gateway, FEEL-in-Task hides iteration. Това е знание за Multi-Instance.

---

## Question 6: Modeling (Weighting: 15%)

**Scenario:** A loan-application process must wait for either a **credit-check response message** OR a **48-hour timeout** — whichever arrives first. Only one path should execute.

**Which BPMN construct fits?**

- **a)** **Event-Based Gateway** with two outgoing paths: one to Intermediate Message Catch Event (credit-check), one to Intermediate Timer Catch Event (PT48H). First event wins; the other is cancelled. Documentation: [Event-Based Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/)

- **b)** Exclusive Gateway with FEEL condition checking which event arrived. Documentation: [Exclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/)

- **c)** Parallel Gateway; downstream Exclusive picks. Documentation: [Parallel Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/parallel-gateways/)

- **d)** Two parallel Boundary Events on a placeholder User Task. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Event-Based Gateway** is purpose-built for "first event wins" pattern. Process pauses at the gateway; downstream Intermediate Catch Events compete; first triggered event proceeds, others are cancelled atomically. This is the canonical race-condition construct.

- **Option b) — Wrong direction.** Exclusive Gateway evaluates **data conditions**, not waits for events.

- **Option c) — Wrong semantics.** Parallel runs all branches; doesn't model "first wins."

- **Option d) — Workaround, not canonical.** Boundary Events on a placeholder task technically works but the placeholder pollutes the diagram; Event-Based Gateway is purpose-built.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Event-Based Gateway е canonical race construct.
- **b) 2/10** — XOR не чака events.
- **c) 2/10** — Parallel runs all.
- **d) 5/10** — workaround.

**Correct Answer:** Event-Based Gateway with Message Catch and Timer Catch as outgoing events.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "First-wins between message and timer" → разпознаваш че се иска **Event-Based Gateway**.

**Въпросът → Solution Framing.** "Fits" — изпитва се knowledge на race-event construct.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Event-Based е racing events, XOR оценява data, Parallel runs all, Boundary на placeholder е workaround. Това е знание за event-driven gateways.

---

## Question 7: Modeling (Weighting: 15%)

**Scenario:** A claim-processing diagram has 12 tasks. The **handle exceptions** logic (notify ops, log incident, route to manual review) should be modelled in a **separate visual area** that can fire whenever a specific error message arrives during the main flow.

**Which BPMN construct fits?**

- **a)** **Event Subprocess** with Message Start Event inside the parent process. The Event Subprocess sits visually separate, listens for the message, and runs without disturbing the main flow (non-interrupting) or by replacing it (interrupting). Documentation: [Event Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

- **b)** Separate BPMN file invoked by Call Activity. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **c)** Add the exception logic at the end of the main flow with conditional gateway. Documentation: [Gateways](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **d)** Boundary Message Event on each of the 12 tasks. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Event Subprocess** is the canonical BPMN construct for **scoped event handling within a process**. It sits inside the parent (visually separate area), listens for its trigger (Message Start), and activates anytime during the parent's execution. Cleaner than 12 boundary events.

- **Option b) — Different scope.** Call Activity calls another deployed process — separate definition, separate lifecycle; doesn't share the parent's variable scope as cleanly.

- **Option c) — Wrong placement.** "At the end" doesn't fire during the main flow when needed.

- **Option d) — Diagram pollution.** 12 boundary events × 12 tasks = visual mess; Event Subprocess is the DRY solution.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Event Subprocess е canonical scoped event handler.
- **b) 4/10** — wrong scope (separate definition).
- **c) 2/10** — wrong placement (end-only).
- **d) 3/10** — diagram pollution.

**Correct Answer:** Event Subprocess with Message Start Event inside the parent process.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Separate visual area + fires on event during main flow" → разпознаваш че се иска **Event Subprocess**.

**Въпросът → Solution Framing.** "Fits" — изпитва се scoped event-handling construct.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Event Subprocess е scoped, Call Activity е separate definition, end-of-flow handler закъснява, и че 12 boundary events са pollution. Това е знание за Event Subprocess scope.

---

## Question 8: Modeling (Weighting: 15%)

**Scenario:** A manual quality-review process consists of three steps that a human reviewer performs **in any order** they prefer: visual inspection, document check, sample test. All three must complete before the process continues, but **the order is not constrained**.

**Which BPMN construct fits?**

- **a)** **Ad-hoc Subprocess** with three User Tasks inside. Reviewer picks which to perform when; the Ad-hoc subprocess completes when all are done (or per completionCondition). Documentation: [Ad-hoc Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/ad-hoc-subprocesses/)

- **b)** Parallel Gateway split with three User Tasks, Parallel Gateway join. Documentation: [Parallel Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/parallel-gateways/)

- **c)** Sequential Multi-Instance over a list of step types. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Three User Tasks in sequence with conditional skipping. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Ad-hoc Subprocess** is the BPMN construct for **unordered tasks** — performer chooses when/which to do. All inner activities are available; completion is governed by `completionCondition`. Designed for human-driven flexible flows.

- **Option b) — Imposes structure.** Parallel Gateway implies all three start simultaneously and run in parallel; in practice a human does them serially but the model misrepresents that they're flexibly-ordered.

- **Option c) — Wrong fit.** Multi-Instance iterates over a collection of similar work; here the three tasks are distinct.

- **Option d) — Imposes order.** Sequence implies order; the requirement is "in any order."

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Ad-hoc Subprocess е canonical за unordered tasks.
- **b) 6/10** — works practically but misrepresents semantics.
- **c) 3/10** — wrong fit (iteration over similar items).
- **d) 2/10** — imposes order.

**Correct Answer:** Ad-hoc Subprocess with three User Tasks inside.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/ad-hoc-subprocesses/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Any order + three distinct steps + reviewer picks" → разпознаваш че се иска **Ad-hoc Subprocess**.

**Въпросът → Solution Framing.** "Fits" — изпитва се knowledge на unordered-task construct.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Ad-hoc е unordered, Parallel implies concurrency, MI е iteration, sequence имalpose ред. Това е знание за Ad-hoc Subprocess.

---

## Question 9: Modeling (Weighting: 15%)

**Scenario:** A purchase-order process has a `place-order` Service Task and a `charge-card` Service Task. If `charge-card` fails after the order is placed, the team wants to **automatically cancel the placed order** as part of failure recovery.

**Which BPMN construct fits compensation semantics?**

- **a)** **Compensation Event** — attach a Compensation Boundary Event to `place-order` with an associated Compensation Handler (`cancel-order` Service Task). When `charge-card` fires a Compensation End Event or Compensation Throwing Event triggers, BPMN walks back through completed activities and executes their handlers. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **b)** Error Boundary Event on `charge-card`. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** Conditional Sequence Flow with FEEL `=chargeStatus != "OK"`. Documentation: [Sequence Flows](https://docs.camunda.io/docs/components/modeler/bpmn/sequence-flows/)

- **d)** Add an explicit `cancel-order` Service Task on the failure path. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Compensation** is BPMN's purpose-built mechanism for **undoing completed work** in saga-style transactions. Attach Compensation Boundary Event to the activity whose effect needs undoing (`place-order`), wire the handler (`cancel-order`). When charge-card fails and throws a Compensation Event, BPMN walks completed activities in reverse and runs each handler. Cleaner than manual recovery paths.

- **Option b) — Different semantics.** Error Boundary handles errors **on the failing task**, not undo logic for prior tasks.

- **Option c) — Misses the undo.** A conditional flow can route to a manual recovery path but doesn't express compensation semantics.

- **Option d) — Works but manual.** Explicit recovery paths get unwieldy when there are many completed steps to roll back.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Compensation е canonical за saga undo.
- **b) 3/10** — different scope (failing task error).
- **c) 3/10** — no compensation semantics.
- **d) 5/10** — works but doesn't scale.

**Correct Answer:** Compensation Event with handler attached to place-order.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Charge fails + undo placed order" → разпознаваш че се иска **Compensation**.

**Въпросът → Solution Framing.** "Fits compensation semantics" — изпитва се saga-undo construct.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Compensation walks back через completed activities, Error handles failing task, conditional flow не express undo, manual recovery не scales. Това е знание за Compensation events.

---

# Section 2 — Configuring Processes (Questions 10-22)

> Weight 22% • Topics: Zeebe execution semantics, FEEL conditions, Multi-Instance config, Document Handling, IDP, Element Templates, AI orchestration.

---

## Question 10: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task is configured to call a partner-credit-check service. In Web Modeler, the modeler must specify which Job Worker handles it. The team has a worker registered with type `credit-check-v2`.

**Which Service Task property binds the BPMN to that worker?**

- **a)** `zeebe:taskDefinition type="credit-check-v2"` — set via the **Implementation → Job Type** property in Web Modeler. Workers subscribe to this exact string; Zeebe routes activated jobs to subscribed workers. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **b)** `name` attribute on the BPMN element — workers match by task name. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** `processId` of the BPMN file. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** `id` attribute of the BPMN element. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `zeebe:taskDefinition` with `type` attribute is the canonical Zeebe extension. Workers subscribe to this type string; Zeebe routes jobs accordingly. Set via the Implementation property panel.

- **Option b) — Incorrect.** `name` is display-only.

- **Option c) — Incorrect.** `processId` identifies the process, not task binding.

- **Option d) — Incorrect.** `id` is internal element ID; workers don't match on it.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. zeebe:taskDefinition type е canonical binding.
- **b) 2/10** — name = display.
- **c) 1/10** — wrong scope.
- **d) 2/10** — wrong attribute.

**Correct Answer:** zeebe:taskDefinition type="credit-check-v2".

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Bind Service Task to worker" → разпознаваш че се иска **task type**.

**Въпросът → Solution Framing.** "Which property binds" — изпитва се Zeebe extension knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че taskDefinition type е canonical, че name е cosmetic, processId е process-level, id е internal. Знание за Zeebe Service Task config.

---

## Question 11: Configuring Processes (Weighting: 22%)

**Scenario:** An order-routing BPMN has an Exclusive Gateway splitting on order value: `> 10000 → review`, `<= 10000 → auto-approve`. The modeler writes the condition expression on the sequence flow.

**Which FEEL expression is correct for the "review" branch?**

- **a)** `=order.value > 10000` — FEEL expression prefixed with `=`, evaluating against the process variable `order.value`. Documentation: [Sequence Flows](https://docs.camunda.io/docs/components/modeler/bpmn/sequence-flows/)

- **b)** `${order.value > 10000}` — JUEL syntax from Camunda 7. Documentation: [Sequence Flows](https://docs.camunda.io/docs/components/modeler/bpmn/sequence-flows/)

- **c)** `order.value > 10000` (no prefix). Documentation: [Sequence Flows](https://docs.camunda.io/docs/components/modeler/bpmn/sequence-flows/)

- **d)** `#{order.value > 10000}` — Spring EL. Documentation: [Sequence Flows](https://docs.camunda.io/docs/components/modeler/bpmn/sequence-flows/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 uses **FEEL** with `=` prefix marker. The expression evaluates to boolean; sequence flow taken when true.

- **Option b) — Camunda 7 reflex.** JUEL `${}` is C7 syntax, not C8.

- **Option c) — Missing prefix.** Without `=` it's treated as plain text, not an expression.

- **Option d) — Wrong language.** Spring EL is not C8 FEEL.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `=` FEEL prefix.
- **b) 2/10** — C7 reflex.
- **c) 3/10** — missing prefix.
- **d) 1/10** — wrong language.

**Correct Answer:** =order.value > 10000.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/sequence-flows/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Gateway split on value + FEEL condition" → разпознаваш че се иска **FEEL `=` syntax**.

**Въпросът → Solution Framing.** "Correct expression for the branch" — изпитва се C8 FEEL prefix knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че C8 използва FEEL с `=` prefix, JUEL е C7, Spring EL не е C8, missing prefix е плеtext. Знание за FEEL invocation.

---

## Question 12: Configuring Processes (Weighting: 22%)

**Scenario:** A User Task in a claims process must be assigned to the user whose ID is stored in `claim.assignedAgent`. The team configures the User Task in Web Modeler.

**Which configuration assigns the User Task dynamically?**

- **a)** Set `zeebe:assignmentDefinition assignee="=claim.assignedAgent"` — FEEL expression evaluated at activation; result becomes the assignee for that task instance. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** Use Task Listener "on-create" to set assignee programmatically. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** Hardcode the user ID in the BPMN. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Cannot dynamically assign; must use claim. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `zeebe:assignmentDefinition` accepts FEEL expressions in `assignee` and `candidateGroups`. Evaluated at activation; result is set as the User Task's assignee.

- **Option b) — Different concept.** Task Listeners aren't a Camunda 8 concept the same way as C7; assignmentDefinition handles dynamic assignment natively.

- **Option c) — Defeats requirement.** Hardcoded contradicts "dynamically."

- **Option d) — Incorrect.** Dynamic assignment is supported via FEEL.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. assignmentDefinition + FEEL.
- **b) 4/10** — C7 reflex.
- **c) 1/10** — contradicts requirement.
- **d) 1/10** — невярно.

**Correct Answer:** zeebe:assignmentDefinition assignee="=claim.assignedAgent".

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Dynamically assign User Task" → разпознаваш че се иска **assignmentDefinition + FEEL**.

**Въпросът → Solution Framing.** "Configuration assigns dynamically" — изпитва се user-task assignment knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че assignmentDefinition accepts FEEL, че Task Listeners са C7 reflex, че hardcode противоречи. Знание за user task assignment.

---

## Question 13: Configuring Processes (Weighting: 22%)

**Scenario:** A Business Rule Task in a pricing process must invoke a deployed DMN decision with the ID `discount-calculator` and return the result into variable `discountPct`.

**Which configuration is correct?**

- **a)** `zeebe:calledDecision decisionId="discount-calculator" resultVariable="discountPct"`. Documentation: [Business Rule Task](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **b)** `zeebe:taskDefinition type="dmn-eval"` and pass decision ID as header. Documentation: [Business Rule Task](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **c)** Call Activity referencing the DMN file. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **d)** Service Task with FEEL `=invoke("discount-calculator")`. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `zeebe:calledDecision` extension on Business Rule Task is the canonical native binding. Specifies `decisionId` and `resultVariable`; Zeebe evaluates the DMN inline (no separate worker needed).

- **Option b) — Wrong approach.** Service-Task-with-DMN-worker is C7 reflex; C8 has native binding.

- **Option c) — Wrong construct.** Call Activity invokes BPMN processes, not DMN decisions.

- **Option d) — Invented function.** No `invoke()` FEEL built-in.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. zeebe:calledDecision native binding.
- **b) 3/10** — C7 reflex (worker for DMN).
- **c) 2/10** — wrong construct.
- **d) 1/10** — invented function.

**Correct Answer:** zeebe:calledDecision decisionId="discount-calculator" resultVariable="discountPct".

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Business Rule Task + DMN" → разпознаваш че се иска **calledDecision**.

**Въпросът → Solution Framing.** "Configuration correct" — изпитва се DMN binding knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Business Rule Task има native DMN binding, че Service-Task-with-worker е C7 reflex, че Call Activity е за BPMN, и че няма `invoke()` FEEL. Знание за DMN binding.

---

## Question 14: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task expects an `orderId` input. The process variable carrying this is `currentOrder.id` (nested). The modeler wants to map `currentOrder.id` to the local variable `orderId` available only inside the task.

**Which configuration achieves this?**

- **a)** **Input mapping** on the Service Task — Target: `orderId`, Source expression: `=currentOrder.id`. Documentation: [Input/Output Mappings](https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings)

- **b)** Pass full `currentOrder` to the worker; worker extracts `id`. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Rename the process variable globally to `orderId`. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Use a Script Task before to set `orderId` globally. Documentation: [Script Task](https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Input mappings on a task scope local variables to that task's execution. `Target: orderId, Source: =currentOrder.id` extracts the nested value and exposes it as `orderId` within the Service Task. Process scope unchanged.

- **Option b) — Bigger payload.** Sending full nested object is workable but exposes more than needed (LSP).

- **Option c) — Side effects.** Renaming globally affects all consumers.

- **Option d) — Pollutes process scope.** Globally-set `orderId` leaks beyond this task.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Input mapping = local scoping.
- **b) 5/10** — works но over-shares.
- **c) 3/10** — global side effects.
- **d) 4/10** — pollutes process scope.

**Correct Answer:** Input mapping: Target orderId, Source =currentOrder.id.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Map nested var to local + only inside the task" → разпознаваш че се иска **Input mapping**.

**Въпросът → Solution Framing.** "Achieves this" — изпитва се input/output mapping knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Input mapping scope local, че full payload over-shares, че rename global side effects, че Script Task pollutes. Знание за scoping.

---

## Question 15: Configuring Processes (Weighting: 22%)

**Scenario:** A claims process must store **uploaded photos and PDFs** (5-50 MB each) as part of the process state. Storing them as base64 process variables would bloat the broker state.

**Which Camunda 8.6+ feature handles this cleanly?**

- **a)** **Document Handling** — upload via the Documents API; receive a document reference; pass the reference as a process variable. Storage is configurable (in-memory dev, S3 prod, etc.). Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **b)** Base64-encode and store as a process variable. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Store outside Camunda; pass only URL in variables. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Camunda 8 doesn't support binary attachments; reject the requirement. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8.6+ **Document Handling** is the first-class document-as-variable feature. Documents API stores binary content in configured storage backend; the process variable holds a reference. Downstream tasks/Connectors fetch the document via the reference when needed.

- **Option b) — Anti-pattern.** Base64 in variables bloats broker state, hurts performance.

- **Option c) — Workable but lacks integration.** Plain URL works но loses Camunda-managed lifecycle, TTL, security integration.

- **Option d) — Incorrect.** Document Handling is the answer.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Document Handling е canonical.
- **b) 2/10** — bloats state.
- **c) 5/10** — works но lacks integration.
- **d) 1/10** — невярно.

**Correct Answer:** Document Handling — upload via Documents API, pass reference as variable.

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/document-handling/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "5-50 MB binary + state bloat concern" → разпознаваш че се иска **Document Handling**.

**Въпросът → Solution Framing.** "Handles this cleanly" — изпитва се knowledge на Document Handling feature.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Document Handling е canonical 8.6+, че base64 bloats, че external URL губи lifecycle. Знание за Document Handling.

---

## Question 16: Configuring Processes (Weighting: 22%)

**Scenario:** A Sequential Multi-Instance Subprocess iterates over `customers`. Each instance does account-validation. The team wants only **one instance at a time** because the back-end API has a 1-request-per-second limit.

**Which Multi-Instance configuration fits?**

- **a)** **Sequential Multi-Instance** with `inputCollection = customers`, `inputElement = customer`. Sequential mode runs one instance at a time — fits the rate-limit constraint naturally. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Parallel Multi-Instance with `loopCardinality = 1`. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Parallel Multi-Instance and add `sleep(1)` in the worker. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Multi-Instance can't be rate-limited; use a Queue. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Sequential mode runs instances one at a time — natural fit for serialised work. The 1-RPS limit is satisfied if each instance completes in ≥ 1 sec.

- **Option b) — Wrong semantics.** loopCardinality = 1 means one instance total, not rate-limited.

- **Option c) — Worker-side hack.** Combining Parallel with worker sleeps creates fragile timing; sequential mode is canonical.

- **Option d) — Incorrect.** Sequential mode addresses this natively.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Sequential MI = canonical serialisation.
- **b) 2/10** — wrong semantics.
- **c) 4/10** — fragile hack.
- **d) 2/10** — невярно — Sequential handles it.

**Correct Answer:** Sequential Multi-Instance with inputCollection=customers.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Rate limit + one at a time" → разпознаваш че се иска **Sequential MI**.

**Въпросът → Solution Framing.** "Configuration fits" — изпитва се MI mode knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Sequential ≠ Parallel, loopCardinality е count not mode, worker sleeps са fragile. Знание за MI mode selection.

---

## Question 17: Configuring Processes (Weighting: 22%)

**Scenario:** A bank-onboarding process uses **IDP (Intelligent Document Processing)** to extract structured data from uploaded passport scans. The IDP extraction is configured in Web Modeler. After extraction, the next Service Task needs the extracted `passport.surname`.

**How does the BPMN process access extracted IDP fields?**

- **a)** IDP Application result is exposed as a **process variable with structured fields** (e.g., `idpResult.passport.surname`). FEEL navigates the result like any nested object. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/idp-applications/)

- **b)** IDP results are stored externally; the process gets only a key. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **c)** Cannot access in FEEL; a Service Task must call IDP API to retrieve. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **d)** IDP returns plaintext; parse it in a Script Task. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** IDP Applications expose extraction results as **structured process variables**. The result object is FEEL-navigable. Modeler defines extraction schema; runtime populates the variable.

- **Option b) — Wrong model.** Results are first-class process variables, not externally keyed.

- **Option c) — Wrong abstraction.** Native integration eliminates manual API calls.

- **Option d) — Incorrect.** Structured fields, not plaintext.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Structured FEEL-navigable variable.
- **b) 2/10** — wrong model.
- **c) 2/10** — wrong abstraction.
- **d) 1/10** — невярно.

**Correct Answer:** IDP result is exposed as a process variable with structured fields, accessible via FEEL.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/idp/idp-applications/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Access IDP fields downstream" → разпознаваш че се иска **structured FEEL navigation**.

**Въпросът → Solution Framing.** "How process accesses fields" — изпитва се IDP integration model.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че IDP result е structured variable, FEEL-navigable, native integration не изисква API calls. Знание за IDP Applications.

---

## Question 18: Configuring Processes (Weighting: 22%)

**Scenario:** A team builds a custom REST Service Task that wraps the corporate API. Every team in the company uses it. The modeling group wants a **single source of truth** for its configuration: URL prefix, headers, retry policy. Different processes can override only the endpoint path.

**Which feature provides this reusable configuration shell?**

- **a)** **Element Template** published at organisation scope. Defines the Service Task's properties with defaults and constraints; modelers in any project apply it and override allowed fields only. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **b)** Custom Connector with hardcoded prefix. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/)

- **c)** Shared BPMN library with reusable subprocesses. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** Process-level start variable with all config. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Element Templates** at org scope provide DRY task definitions with sensible defaults and field-level overrides. Web Modeler offers them in the template picker; modelers select and customise allowed fields only.

- **Option b) — Heavier alternative.** Custom Connector works but requires SDK code; Element Template is config-only.

- **Option c) — Wrong scope.** Subprocess library handles BPMN reuse, not task-config reuse.

- **Option d) — Wrong scope.** Start variables aren't reusable across processes.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Element Template + org scope.
- **b) 5/10** — heavier alternative.
- **c) 3/10** — wrong scope.
- **d) 2/10** — wrong scope.

**Correct Answer:** Element Template published at organisation scope.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Reusable config across many processes + selective override" → разпознаваш че се иска **Element Template**.

**Въпросът → Solution Framing.** "Reusable configuration shell" — изпитва се template-vs-connector knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Element Template е config reuse, Custom Connector е код, subprocesses са BPMN reuse, start variables не cross processes. Знание за Element Templates.

---

## Question 19: Configuring Processes (Weighting: 22%)

**Scenario:** A customer-service process needs an LLM-driven agent to autonomously decide a sequence of tool calls — query CRM, summarise tickets, recommend response — based on conversation context. The team wants Camunda 8 to orchestrate the agent's tool selection without modelling each step.

**Which Camunda 8.8 feature fits?**

- **a)** **AI Agent Connector** with **Ad-hoc Subprocess** — Ad-hoc contains the available tools (Service Tasks for CRM query, summarisation, recommendation). AI Agent Connector calls the LLM, gets a tool plan, executes via ad-hoc, loops until completion. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **b)** Single Service Task with a long FEEL expression branching the work. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** Sequence of explicit Service Tasks; team picks the order. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** Custom RPA bot. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8.8 introduces **Agentic Orchestration** via AI Agent Connector + Ad-hoc Subprocess. The LLM decides tools dynamically; Ad-hoc Subprocess hosts the available tools; the loop continues until the LLM signals completion. Purpose-built for autonomous agents.

- **Option b) — Wrong abstraction.** FEEL doesn't drive LLM tool-selection.

- **Option c) — Defeats dynamism.** Explicit sequence prescribes order; agent must choose.

- **Option d) — Wrong feature.** RPA drives UIs, not LLM agents.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. AI Agent + Ad-hoc е canonical agentic pattern.
- **b) 2/10** — wrong abstraction.
- **c) 3/10** — prescribes order.
- **d) 2/10** — RPA ≠ LLM agent.

**Correct Answer:** AI Agent Connector with Ad-hoc Subprocess.

**Official Documentation Link:** https://docs.camunda.io/docs/components/agentic-orchestration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "LLM autonomously decides tool sequence" → разпознаваш че се иска **AI Agent + Ad-hoc**.

**Въпросът → Solution Framing.** "Fits this requirement" — изпитва се knowledge на 8.8 Agentic features.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че AI Agent + Ad-hoc е canonical agentic, FEEL не drives LLM, explicit sequence prescribes order, RPA е GUI. Знание за Agentic Orchestration.

---

## Question 20: Configuring Processes (Weighting: 22%)

**Scenario:** A document-tracking process attaches files via Document Handling. The team wants old documents to be **automatically purged 90 days** after the process completes — for compliance.

**Which Document Handling configuration fits?**

- **a)** Configure **TTL (time-to-live)** on the document at creation — `expiresAt` ~90 days from creation. Storage backend honors TTL and purges expired documents. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **b)** Cron job that scans and deletes via Documents API. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **c)** Manually delete via Operate UI. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Document Handling doesn't support TTL. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Document Handling supports per-document TTL via `expiresAt` (or `ttl` at upload). Storage backend purges expired documents automatically.

- **Option b) — Workaround.** Cron + API works but reinvents what TTL provides.

- **Option c) — Manual.** Doesn't scale.

- **Option d) — Incorrect.** TTL is supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. TTL на document.
- **b) 4/10** — reinvent wheel.
- **c) 2/10** — manual.
- **d) 1/10** — невярно.

**Correct Answer:** Configure TTL at document creation (expiresAt / ttl).

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/document-handling/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Auto-purge 90 days" → разпознаваш че се иска **TTL**.

**Въпросът → Solution Framing.** "Configuration fits" — изпитва се Document Handling TTL knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че TTL е native, cron е reinvent, manual не scale. Знание за Document Handling lifecycle.

---

## Question 21: Configuring Processes (Weighting: 22%)

**Scenario:** A subscription-renewal process has a **periodic check** every 1st of the month at midnight: "Has the customer's payment method expired?" The check should run for the duration of an active subscription (typically 12 months).

**Which Timer cycle expression fits?**

- **a)** ISO 8601 cycle `R12/2026-01-01T00:00:00Z/P1M` — repeats 12 times, anchored at the next Jan 1st midnight UTC, with 1-month period. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** Cron expression `0 0 0 1 * *`. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** Duration `P1M` with manual re-entry. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Both **a** and **b** are valid Camunda 8 timer cycle representations. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option d) — Correct.** Camunda 8 Timer Cycle accepts both ISO 8601 repeating intervals (`R12/.../P1M`) and cron expressions for more complex scheduling needs. Both are documented and supported.

- **Option a) — Partially correct.** ISO 8601 is supported.

- **Option b) — Partially correct.** Cron is supported.

- **Option c) — Suboptimal.** Manual re-entry defeats automation.

**Per-option scoring (1–10):**
- **a) 7/10** — partial — works но Cron също valid.
- **b) 7/10** — partial — works но ISO също valid.
- **c) 2/10** — manual.
- **d) 10/10** — верен — both supported.

**Correct Answer:** Both a and b — ISO 8601 cycle and cron expression are valid.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Monthly at 1st midnight + 12 times" → разпознаваш че се иска **periodic timer**.

**Въпросът → Solution Framing.** "Cycle expression fits" — изпитва се knowledge на C8 timer cycle formats.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че C8 supports both ISO 8601 и cron, че manual re-entry defeats automation. Знание за Timer cycle formats.

---

## Question 22: Configuring Processes (Weighting: 22%)

**Scenario:** A KYC verification process has a **mandatory ESCALATE** path when an automated check returns "suspicious." The team wants to leave the main flow continuing (parallel audit), but immediately throw a non-blocking escalation upward to a parent enclosing scope (Event Subprocess in parent).

**Which BPMN event fires this?**

- **a)** **Throw Escalation Intermediate Event** — propagates an escalation code upward without stopping the current flow. Parent Event Subprocess with matching Escalation Start catches it. Non-interrupting by default for parent matching. Documentation: [Escalation Events](https://docs.camunda.io/docs/components/modeler/bpmn/escalation-events/)

- **b)** Throw Error End Event. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** Send Task with message to parent. Documentation: [Send Task](https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/)

- **d)** Signal Throw Event. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Escalation Throw Intermediate Event** propagates an escalation code upward in scope without interrupting the throwing flow. Matched by an Escalation Catch (Boundary or Start in Event Subprocess) in the enclosing scope. Designed for non-blocking notification of higher-level handlers.

- **Option b) — Wrong semantics.** Error End terminates the throwing flow and is for errors not escalations.

- **Option c) — Wrong scope.** Messages are inter-process, not intra-process scope propagation.

- **Option d) — Broadcast.** Signal is broadcast to all listeners across processes; Escalation is scope-local.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Escalation Throw + non-blocking parent catch.
- **b) 3/10** — terminates flow.
- **c) 4/10** — inter-process not scope.
- **d) 4/10** — broadcast scope.

**Correct Answer:** Throw Escalation Intermediate Event.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/escalation-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Throw upward + non-blocking + main flow continues" → разпознаваш че се иска **Escalation Throw**.

**Въпросът → Solution Framing.** "Fires this" — изпитва се Escalation event knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Escalation е scope-propagation non-blocking, Error terminates, Message е inter-process, Signal е broadcast. Знание за Escalation vs alternatives.

---

# Section 3 — Decisions & DMN (Questions 23-29)

> Weight 11% • Topics: DRD, Decision Table, Hit Policies (UNIQUE/FIRST/ANY/PRIORITY/COLLECT/RULE ORDER/OUTPUT ORDER), FEEL in inputs/outputs.

---

## Question 23: Decisions & DMN (Weighting: 11%)

**Scenario:** A pricing decision table determines discount per customer. The team wants to **ensure** that only **one rule matches** for any given input — if two rules ever match, the deployment should fail (model-validation-time guard).

**Which hit policy provides this guarantee?**

- **a)** **UNIQUE** hit policy. At runtime, if more than one rule matches the same input, an error is raised (UNIQUE policy contract is "exactly one rule must match"). Modelers must design rules to be mutually exclusive. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** ANY. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** FIRST. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** COLLECT. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **UNIQUE** mandates exactly one matching rule per evaluation; multiple matches throw an error. Used when rules should be mutually exclusive and overlap is a defect.

- **Option b) — Different semantics.** ANY allows multiple rules to match **as long as they produce identical output** — different intent.

- **Option c) — Different semantics.** FIRST returns the first match in row order; multiple matches don't error.

- **Option d) — Different semantics.** COLLECT gathers all matching outputs into a list.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. UNIQUE = exactly one match contract.
- **b) 4/10** — different (identical outputs allowed).
- **c) 4/10** — different (first match wins).
- **d) 3/10** — different (collects all).

**Correct Answer:** UNIQUE hit policy.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Exactly one match, multi-match = error" → разпознаваш че се иска **UNIQUE**.

**Въпросът → Solution Framing.** "Hit policy provides guarantee" — изпитва се hit-policy semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че UNIQUE = exactly one (error on multi), ANY = multi allowed if same output, FIRST = row order, COLLECT = list. Знание за hit policies.

---

## Question 24: Decisions & DMN (Weighting: 11%)

**Scenario:** An insurance-rate decision table has 8 rules. The team wants the result to be the **sum of all matching rules' premium amounts** (additive pricing model).

**Which hit policy + aggregator fits?**

- **a)** **COLLECT** with aggregator **SUM**. All matching rules' outputs are summed; result is a single number. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** COLLECT without aggregator. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** PRIORITY by output priority. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** RULE ORDER. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** COLLECT with SUM aggregator returns the sum of all matching rules' output values. Designed for additive aggregation scenarios.

- **Option b) — Wrong result type.** COLLECT without aggregator returns a list; the question asks for a sum.

- **Option c) — Different semantics.** PRIORITY picks one based on priority order.

- **Option d) — Different semantics.** RULE ORDER returns a list ordered by rule order.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. COLLECT+SUM е canonical.
- **b) 4/10** — list, not sum.
- **c) 3/10** — picks one, not aggregates.
- **d) 4/10** — list, not sum.

**Correct Answer:** COLLECT with SUM aggregator.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Sum all matching premiums" → разпознаваш че се иска **COLLECT+SUM**.

**Въпросът → Solution Framing.** "Hit policy + aggregator fits" — изпитва се COLLECT aggregator knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че COLLECT aggregators (SUM/MIN/MAX/COUNT), че PRIORITY picks one, RULE ORDER returns list. Знание за COLLECT aggregators.

---

## Question 25: Decisions & DMN (Weighting: 11%)

**Scenario:** A loan-eligibility DMN has 10 detailed rules. The team wants the engine to evaluate rules **in priority order** (output preference: PREMIUM > GOLD > SILVER > BRONZE) and return the **single highest-priority match**.

**Which hit policy fits?**

- **a)** **PRIORITY** — rules evaluated; among matching rules, the output with highest output priority (defined in output value list ordering) wins. Returns single value. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** FIRST. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** UNIQUE. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** OUTPUT ORDER — returns list ordered by output priority. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **PRIORITY** policy: among matching rules, the engine picks the one whose output value has the highest priority per the output's value-list ordering. Returns a single value. Used when multiple rules can match but output preference dominates.

- **Option b) — Row-order based.** FIRST returns first-matching by row, not by output priority.

- **Option c) — Different intent.** UNIQUE requires exactly one match.

- **Option d) — Returns list.** OUTPUT ORDER orders all matches into a list; PRIORITY returns single value.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. PRIORITY = highest output preference.
- **b) 4/10** — row-order, not output-pref.
- **c) 3/10** — different intent.
- **d) 5/10** — close but returns list.

**Correct Answer:** PRIORITY hit policy.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Highest priority single match" → разпознаваш че се иска **PRIORITY**.

**Въпросът → Solution Framing.** "Hit policy fits" — изпитва се PRIORITY vs OUTPUT ORDER knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че PRIORITY = single highest-pref output, FIRST = row order, UNIQUE = exactly one, OUTPUT ORDER = ordered list. Знание за priority-based policies.

---

## Question 26: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN decision table has 5 input columns. One input column's value range is unbounded (e.g., transaction amount 0 to ∞). The modeler wants to express the input condition "amount > 1000".

**Which FEEL input entry syntax expresses ">1000"?**

- **a)** `> 1000` — FEEL unary test syntax (supports >, <, >=, <=, =, ranges, lists). Documentation: [DMN FEEL unary tests](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** `=> 1000`. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** `> "1000"`. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** `gt(1000)`. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN input entries support FEEL unary tests: `>`, `<`, `>=`, `<=`, `=`, ranges `[1..10]`, lists `1, 2, 3`. The entry `> 1000` matches values greater than 1000.

- **Option b) — Wrong syntax.** `=>` is invalid.

- **Option c) — Wrong type.** Numeric comparison with string literal fails type check.

- **Option d) — Invented function.** FEEL doesn't have `gt()`.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `> 1000` unary test.
- **b) 1/10** — invalid syntax.
- **c) 2/10** — type mismatch.
- **d) 1/10** — invented.

**Correct Answer:** > 1000 (FEEL unary test).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Input condition > 1000" → разпознаваш че се иска **FEEL unary test**.

**Въпросът → Solution Framing.** "Syntax expresses" — изпитва се DMN input entry syntax.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че `> 1000` е unary test, `=>` е invalid, string vs number е type mismatch, няма `gt()` в FEEL. Знание за DMN unary tests.

---

## Question 27: Decisions & DMN (Weighting: 11%)

**Scenario:** A diagnostic DMN has a Decision Requirements Diagram (DRD) with 3 chained decisions: `Symptom Analysis` → `Diagnosis Group` → `Recommended Treatment`. The Treatment decision depends on Diagnosis Group's output.

**How is this dependency expressed in DMN?**

- **a)** **Information Requirement** arrow from `Diagnosis Group` (as the supplier) to `Recommended Treatment` (as the consumer). Indicates Treatment requires Diagnosis output. Documentation: [DMN DRD](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-diagram/)

- **b)** Knowledge Requirement arrow. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-diagram/)

- **c)** Authority Requirement. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-diagram/)

- **d)** Direct invocation in FEEL `=invoke("DiagnosisGroup")`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Information Requirement** (solid arrow) is the DRD connector expressing "this decision uses the output of that decision." Standard DMN dependency.

- **Option b) — Different semantics.** Knowledge Requirement (dashed) is for Business Knowledge Models (reusable decision logic), not decision-to-decision flow.

- **Option c) — Different semantics.** Authority Requirement (dashed circle) expresses "this knowledge source authorises this decision" — governance, not data flow.

- **Option d) — Wrong abstraction.** Decisions chain via DRD structure, not FEEL invocation.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Information Requirement = data flow.
- **b) 3/10** — different (BKM).
- **c) 3/10** — different (governance).
- **d) 2/10** — wrong abstraction.

**Correct Answer:** Information Requirement arrow.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-diagram/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Treatment depends on Diagnosis output" → разпознаваш че се иска **Information Requirement**.

**Въпросът → Solution Framing.** "Dependency expressed in DMN" — изпитва се DRD connector knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Information Req. е data flow, Knowledge Req. е BKM, Authority Req. е governance, FEEL invocation не е DRD pattern. Знание за DRD structure.

---

## Question 28: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN decision table has a numeric output column for `discount`. The modeler wants to express "if amount is between 100 and 1000, output 10%" — using a single rule row.

**Which input entry expresses the range "100 to 1000 (inclusive)"?**

- **a)** `[100..1000]` — FEEL inclusive-inclusive range. Documentation: [FEEL ranges](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-range/)

- **b)** `100..1000`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `between 100 and 1000`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `>= 100, <= 1000` (comma-separated). Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL range syntax `[a..b]` denotes inclusive-inclusive. Other forms: `(a..b)` exclusive-exclusive, `[a..b)` half-open.

- **Option b) — Missing brackets.** Plain `100..1000` is not the range literal; needs `[..]` markers.

- **Option c) — Wrong syntax.** No `between` keyword in FEEL.

- **Option d) — Different semantics.** Comma in unary tests is OR, not AND — `>= 100, <= 1000` matches either condition, not both.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. [100..1000] inclusive range.
- **b) 3/10** — missing brackets.
- **c) 2/10** — invented keyword.
- **d) 3/10** — comma = OR not AND.

**Correct Answer:** [100..1000].

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-range/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Range 100 to 1000 inclusive" → разпознаваш че се иска **FEEL range literal**.

**Въпросът → Solution Framing.** "Expresses range" — изпитва се range syntax knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че `[a..b]` е inclusive range, `(a..b)` exclusive, comma в unary tests е OR. Знание за FEEL ranges.

---

## Question 29: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN decision is invoked from a BPMN Business Rule Task. The decision evaluates and returns the output `eligibilityStatus` which is "APPROVED" or "REJECTED". The team wants this result available as a process variable.

**Which Business Rule Task configuration captures the result?**

- **a)** Set `resultVariable` (alongside `decisionId`) — the decision's output becomes the named process variable. Documentation: [Business Rule Task](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **b)** Skip; DMN auto-populates process variables of matching name. Documentation: [Business Rule Task](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **c)** Use Output Mapping FEEL to fetch from internal storage. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** DMN results aren't accessible as variables; trigger an Event. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `zeebe:calledDecision` extension has `resultVariable` attribute — names the process variable that receives the decision result.

- **Option b) — Incorrect.** No auto-population mechanism.

- **Option c) — Wrong mechanism.** Output Mapping is for transforming variables, not fetching from internal storage.

- **Option d) — Incorrect.** Results are accessible via resultVariable.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. resultVariable.
- **b) 2/10** — invented auto-pop.
- **c) 3/10** — wrong mechanism.
- **d) 1/10** — невярно.

**Correct Answer:** Set resultVariable on the Business Rule Task.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Capture DMN result as variable" → разпознаваш че се иска **resultVariable**.

**Въпросът → Solution Framing.** "Captures the result" — изпитва се knowledge на calledDecision attrs.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че resultVariable е attribute на calledDecision, че няма auto-pop, output mapping е transform не fetch. Знание за DMN result capture.

---

# Section 4 — Configuring Forms (Questions 30-32)

> Weight 5% • Topics: Form element library, data binding, conditional rendering, validation, FEEL templating.

---

## Question 30: Configuring Forms (Weighting: 5%)

**Scenario:** A medical-intake form has a Radio field "Pregnant?" (yes/no). The follow-up field "Weeks of pregnancy" should appear **only if** the user selected "yes." The team wants no JavaScript — pure declarative.

**Which Forms feature fits?**

- **a)** **Conditional rendering** via FEEL expression on the Weeks field's `conditional` property — e.g., `=pregnant = "yes"`. Field renders only when condition is true. Documentation: [Forms condition](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-conditional-rendering/)

- **b)** Use two separate forms (one with weeks, one without) and a gateway to select. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Hide via custom CSS. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** JavaScript event listener on the radio. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Forms support a `conditional` property accepting a FEEL boolean expression. Field is rendered when expression evaluates to true. Pure declarative, no scripting needed.

- **Option b) — Heavier.** Two forms duplicate fields; conditional is DRY.

- **Option c) — Wrong tool.** CSS hides the DOM element but the field is still rendered/validated; conditional removes it from form lifecycle.

- **Option d) — Defeats declarative.** Question says "no JavaScript."

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Conditional rendering = canonical.
- **b) 3/10** — duplicates fields.
- **c) 4/10** — DOM hide ≠ form lifecycle.
- **d) 2/10** — defeats requirement.

**Correct Answer:** Conditional rendering via FEEL expression on the field.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-conditional-rendering/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Show only if yes + no JS" → разпознаваш че се иска **conditional rendering**.

**Въпросът → Solution Framing.** "Forms feature fits" — изпитва се knowledge на conditional property.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че conditional е declarative FEEL, че две форми дублицират, CSS hide ≠ lifecycle, JS противоречи. Знание за conditional rendering.

---

## Question 31: Configuring Forms (Weighting: 5%)

**Scenario:** A delivery-confirmation form has a Number Input field "Quantity received" that must be a **positive integer ≤ ordered quantity** (which varies per process instance). The team wants client-side validation before submit.

**Which Forms validation approach fits?**

- **a)** Set `validate.min = 1` and `validate.max = =orderedQty` (FEEL expression bound to the process variable). Form rejects submit if outside range. Documentation: [Forms validation](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-validation/)

- **b)** Custom JS validator. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** No client validation; rely on Service Task to reject after submit. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Validation must be static; can't reference variables. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Forms validation properties (`min`, `max`, `minLength`, `maxLength`, `pattern`) accept FEEL expressions, allowing dynamic limits derived from process variables.

- **Option b) — Reinvents wheel.** Built-in validation suffices.

- **Option c) — Bad UX.** Submit-then-reject wastes user time.

- **Option d) — Incorrect.** FEEL in validation is supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. min/max with FEEL.
- **b) 4/10** — reinvent wheel.
- **c) 3/10** — bad UX.
- **d) 1/10** — невярно.

**Correct Answer:** validate.min = 1, validate.max = =orderedQty.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-validation/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Dynamic max from variable + client-side" → разпознаваш че се иска **validation with FEEL**.

**Въпросът → Solution Framing.** "Validation approach fits" — изпитва се knowledge на Forms validation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че validation properties accept FEEL, че submit-then-reject е bad UX, че custom JS reinvents. Знание за Forms validation properties.

---

## Question 32: Configuring Forms (Weighting: 5%)

**Scenario:** An expense-claim form contains a **list of expense rows** — each row has `category`, `amount`, `receiptUrl`. The user can add/remove rows. After submit, the process variable `expenses` should be a list of objects.

**Which Forms feature provides this row-list editing?**

- **a)** **Dynamic List (Table)** component bound to a list variable. Users add/remove rows via UI; each row's columns map to the bound list element's fields. Result: list of objects. Documentation: [Forms element library](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/)

- **b)** Repeat the same Text Input component 10 times. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Single Textarea where user types JSON. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Forms don't support lists; use external app. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Forms element library includes a **Dynamic List** (sometimes Table) component for variable-size lists of structured items. Bound to a list variable; UI manages add/remove; per-row fields define the item shape.

- **Option b) — Anti-pattern.** Fixed-count repeat is brittle and arbitrary.

- **Option c) — Bad UX.** Raw JSON typing is error-prone for end users.

- **Option d) — Incorrect.** Forms support lists.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Dynamic List component.
- **b) 2/10** — fixed-count brittle.
- **c) 2/10** — bad UX.
- **d) 1/10** — невярно.

**Correct Answer:** Dynamic List (Table) component bound to a list variable.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Variable-length row list + add/remove" → разпознаваш че се иска **Dynamic List component**.

**Въпросът → Solution Framing.** "Row-list editing" — изпитва се element-library knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Dynamic List е canonical, че fixed repeat е brittle, че raw JSON е bad UX. Знание за Forms element library.

---

# Section 5 — Configuring Connectors (Questions 33-36)

> Weight 6% • Topics: Connector Secrets, Inbound and Outbound Connectors.

---

## Question 33: Configuring Connectors (Weighting: 6%)

**Scenario:** An Outbound HTTP Connector calls a partner API that returns paginated results (1000 items per page; 50 pages total). The team wants to fetch all 50 pages **without manually modelling 50 calls**.

**Which BPMN+Connector pattern handles paginated fetch?**

- **a)** Service Task with HTTP Connector inside a **loop** (e.g., Multi-Instance Subprocess with `loopCardinality = totalPages` or sequential MI advancing the page token until exhausted). Each iteration fetches one page; results accumulated in outputCollection. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/) + [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Single Connector call with `paginate = true`. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Custom Connector built specifically for this. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/)

- **d)** Cannot paginate; fetch only the first page. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Pagination is a BPMN-level pattern: loop the Connector call within MI Subprocess (sequential when tokens chain, parallel when pages are independent), accumulate via outputCollection.

- **Option b) — Invented flag.** HTTP Connector doesn't have a `paginate` toggle.

- **Option c) — Over-engineered.** Standard Connector + BPMN loop suffices.

- **Option d) — Incorrect.** Pagination is solvable via BPMN constructs.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. MI loop + outputCollection.
- **b) 2/10** — invented flag.
- **c) 4/10** — over-engineered.
- **d) 1/10** — невярно.

**Correct Answer:** Multi-Instance loop around the HTTP Connector with outputCollection.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Paginated fetch without 50 manual calls" → разпознаваш че се иска **MI loop**.

**Въпросът → Solution Framing.** "Pattern handles paginated fetch" — изпитва се BPMN-loop knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че MI е canonical loop, HTTP Connector няма paginate flag, Custom Connector е overkill. Знание за loop pattern.

---

## Question 34: Configuring Connectors (Weighting: 6%)

**Scenario:** An Inbound Webhook Connector receives external system callbacks. To **prevent unauthorized calls**, the team wants to require an HMAC signature in the request, validated by the Connector before correlation.

**Which Webhook Connector feature handles HMAC verification?**

- **a)** Configure **HMAC signature validation** in the webhook's settings (algorithm e.g., SHA-256, shared secret via cluster secret, header name carrying the signature). Connector verifies before triggering the process. Documentation: [Webhook Connector](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

- **b)** Add a Service Task inside the process that validates HMAC. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** Webhook Connectors are public by design; can't authenticate. Documentation: [Webhook Connector](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

- **d)** Use a reverse proxy with mTLS in front. Documentation: [Webhook Connector](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Webhook Connector supports HMAC signature validation natively. Configure algorithm + secret + header; Connector verifies before instance creation.

- **Option b) — Too late.** By the time the Service Task runs, the instance has been created — invalid callbacks have already polluted state.

- **Option c) — Incorrect.** Webhook supports multiple auth methods.

- **Option d) — Heavier than needed.** Proxy/mTLS works but HMAC is the canonical Webhook-level mechanism.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Native HMAC validation.
- **b) 3/10** — too late (instance already created).
- **c) 1/10** — невярно.
- **d) 5/10** — heavier alternative.

**Correct Answer:** Configure HMAC signature validation in Webhook Connector settings.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Webhook + HMAC verification" → разпознаваш че се иска **native HMAC**.

**Въпросът → Solution Framing.** "Handles HMAC verification" — изпитва се Webhook auth knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Webhook supports native HMAC, че Service Task е too late, че Webhook не е public-only. Знание за Webhook auth.

---

## Question 35: Configuring Connectors (Weighting: 6%)

**Scenario:** A team uses the **Email Outbound Connector** to send order-confirmation emails. The SMTP server password is sensitive. The cluster is Self-Managed.

**Where should the password be stored?**

- **a)** As a **cluster secret** via the Self-Managed secrets provider (env variable, Kubernetes Secret, HashiCorp Vault, etc.) and referenced as `{{secrets.SMTP_PASSWORD}}`. Documentation: [Connector Secrets](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Hardcoded in BPMN XML. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Hardcoded in the Email Connector's docker-compose file. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Pass as process variable from a Start form. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** SM clusters get cluster secrets from the configured provider (env, K8s Secret, Vault). Referenced in Connector config with `{{secrets.NAME}}` placeholder. BPMN stays clean.

- **Option b) — Incorrect.** BPMN XML leaks via Git.

- **Option c) — Workable but suboptimal.** Hardcoding in compose works but ties to deployment; secrets-provider pattern is more portable.

- **Option d) — Bad practice.** Passwords as process variables leak to audit logs.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Cluster secret via provider.
- **b) 1/10** — leaks via Git.
- **c) 4/10** — works но less portable.
- **d) 2/10** — leaks via audit.

**Correct Answer:** Cluster secret via SM secrets provider, referenced as {{secrets.SMTP_PASSWORD}}.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Sensitive SMTP password + SM cluster" → разпознаваш че се иска **cluster secret**.

**Въпросът → Solution Framing.** "Where stored" — изпитва се SM secrets pattern.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SM secrets провайдери (env/K8s/Vault), че BPMN hardcode leaks, че variables leak audit. Знание за Connector Secrets.

---

## Question 36: Configuring Connectors (Weighting: 6%)

**Scenario:** An Outbound HTTP Connector calls a partner API. The partner enforces a 30-second timeout. The team wants the Connector call to time out **client-side** at 25 seconds (before partner times out) so the process can retry or fall back cleanly.

**Which Connector property fits?**

- **a)** Set the Connector's **connection/read timeout** to 25 seconds. HTTP Connector exposes timeout settings; on expiry, the Connector raises a failure that propagates per retries config. Documentation: [HTTP Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

- **b)** Set the Service Task's job-activation timeout. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** Use Timer Boundary Event on the Service Task. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Cannot configure; defaults are fixed. Documentation: [HTTP Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** HTTP Connector exposes timeout settings (connect/read). Set to 25s to abort the call before partner times out; Connector raises a failure → BPMN can handle via retries / Error Boundary.

- **Option b) — Wrong scope.** Job-activation timeout governs how long the worker holds the job, not per-call HTTP timeout.

- **Option c) — Workable BPMN-level.** Timer Boundary cancels the task on timeout but doesn't gracefully close the HTTP request; Connector-level timeout is cleaner.

- **Option d) — Incorrect.** Timeouts are configurable.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. HTTP Connector timeout setting.
- **b) 5/10** — wrong scope.
- **c) 6/10** — works but doesn't close request.
- **d) 1/10** — невярно.

**Correct Answer:** Set the Connector's connection/read timeout to 25 seconds.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Client-side timeout 25s before partner 30s" → разпознаваш че се иска **Connector timeout**.

**Въпросът → Solution Framing.** "Property fits" — изпитва се knowledge на HTTP Connector settings.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че HTTP Connector има connect/read timeout, че job-activation е different scope, че Timer Boundary не closes request gracefully. Знание за Connector timeout.

---

# Section 6 — Extensions & Integrations (Questions 37-50)

> Weight 25% • Topics: FEEL deep, Connector SDK, Job Workers, REST/gRPC APIs, RPA.

---

## Question 37: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must compute the average of a list of numbers: `prices = [12.5, 14.0, 8.75, 21.0]`. The team wants the **arithmetic mean**.

**Which FEEL built-in fits?**

- **a)** `mean(prices)` — FEEL's list aggregation function returning arithmetic mean. Documentation: [FEEL list functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** `avg(prices)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `sum(prices) / count(prices)` — manual. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Both **a** and **c** work — `mean()` is the built-in; manual division is equivalent. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option d) — Correct.** FEEL has built-in `mean(list)`. Manual `sum(list) / count(list)` produces the same result. Built-in is cleaner; manual works for educational/explicit cases.

- **Option a) — Partial.** Correct alone but manual also works.

- **Option b) — Wrong name.** FEEL uses `mean`, not `avg`.

- **Option c) — Partial.** Works but built-in exists.

**Per-option scoring (1–10):**
- **a) 7/10** — partial — works but manual също valid.
- **b) 2/10** — wrong name.
- **c) 7/10** — partial — works но built-in exists.
- **d) 10/10** — верен — both supported.

**Correct Answer:** Both mean() and sum()/count() work.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Arithmetic mean на list" → разпознаваш че се иска **mean built-in**.

**Въпросът → Solution Framing.** "FEEL built-in fits" — изпитва се list aggregation knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че `mean()` е built-in, `avg()` не съществува, sum/count е equivalent manual. Знание за FEEL list aggregators.

---

## Question 38: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must transform a list of products by extracting just their `name` field: `products = [{name: "A", price: 10}, {name: "B", price: 20}]` → `["A", "B"]`.

**Which FEEL expression performs this projection?**

- **a)** `[p in products : p.name]` — FEEL **for-expression** maps each element to a projection. Result: `["A", "B"]`. Documentation: [FEEL list functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** `products.name` — bulk property access. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `map(products, "name")` — invented function. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `products[*].name` — JSONPath-like. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL for-expression iterates and projects: `for x in list return expression` or its filter-like shorthand `[item in list : expr]`. Returns a list of projected values.

- **Option b) — Different semantics.** `products.name` doesn't bulk-project; it tries to access `name` on the list itself (which is null/error).

- **Option c) — Invented.** No `map()` function in FEEL.

- **Option d) — Wrong language.** FEEL is not JSONPath.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. For-expression projection.
- **b) 3/10** — wrong semantics.
- **c) 2/10** — invented function.
- **d) 1/10** — wrong language.

**Correct Answer:** [p in products : p.name].

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Project name field" → разпознаваш че се иска **for-expression**.

**Въпросът → Solution Framing.** "Performs this projection" — изпитва се FEEL projection syntax.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че for-expression е canonical, че няма bulk dot access, че `map()`/JSONPath не са FEEL. Знание за FEEL for-expressions.

---

## Question 39: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must check whether a string **starts with** a prefix. The variable `email` is a string; the team wants to check if it starts with `"admin@"`.

**Which FEEL built-in fits?**

- **a)** `starts with(email, "admin@")` — FEEL string built-in (note space-separated function name). Documentation: [FEEL string functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **b)** `email.startsWith("admin@")` — method call. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `prefix(email, "admin@")`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `email[0..5] = "admin@"` — substring slice. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL string built-ins use space-separated multi-word names: `starts with`, `ends with`, `string length`, `upper case`, `lower case`, `substring`, etc.

- **Option b) — Wrong syntax.** FEEL doesn't use method-call dot notation; uses function calls.

- **Option c) — Invented.** No `prefix()` function.

- **Option d) — Suboptimal.** Substring slice works but is awkward; built-in is cleaner.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. starts with built-in.
- **b) 2/10** — wrong syntax.
- **c) 1/10** — invented.
- **d) 4/10** — workable but ugly.

**Correct Answer:** starts with(email, "admin@").

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Starts with prefix" → разпознаваш че се иска **starts with built-in**.

**Въпросът → Solution Framing.** "FEEL built-in fits" — изпитва се string built-ins knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL използва space-separated names, че dot-method не e FEEL, че substring е workaround. Знание за FEEL string built-ins.

---

## Question 40: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Java Job Worker built with Spring Zeebe handles `payment-validation` Service Tasks. The worker is annotated `@JobWorker(type = "payment-validation", autoComplete = false)`. The team is unsure of the implication of `autoComplete = false`.

**What does `autoComplete = false` mean?**

- **a)** The worker is responsible for **explicitly calling** `jobClient.newCompleteCommand(...).send()` (or fail/throw) — Spring Zeebe will not auto-complete after the method returns. Useful when the worker wants async completion or to return after starting background work. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** The job is never completed; the instance hangs. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** The worker is read-only; cannot modify variables. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** The worker auto-fails on every invocation. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `autoComplete = false` tells Spring Zeebe **not** to auto-complete the job after the handler returns. The handler takes responsibility for completion. Common use case: async work where the handler delegates to a thread pool / external system and completes the job later.

- **Option b) — Misleading.** Hangs only if handler doesn't complete; not automatic hang.

- **Option c) — Incorrect.** Variable modification is independent.

- **Option d) — Incorrect.** No auto-fail behavior.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Handler explicit completes.
- **b) 4/10** — misleading.
- **c) 1/10** — невярно.
- **d) 1/10** — невярно.

**Correct Answer:** Worker must explicitly call jobClient.newCompleteCommand or fail.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "autoComplete = false" → разпознаваш че се иска **explicit completion semantics**.

**Въпросът → Solution Framing.** "What it means" — изпитва се Spring Zeebe annotation knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че autoComplete=false → worker explicit completes, че не auto-hangs, че variables independent, че не auto-fails. Знание за Spring Zeebe lifecycle.

---

## Question 41: Extensions & Integrations (Weighting: 25%)

**Scenario:** A TypeScript Job Worker uses `@camunda8/sdk`. The worker must subscribe to `process-receipt` jobs. The team wants the worker to **process 10 jobs concurrently** to maximise throughput.

**Which SDK option controls concurrency?**

- **a)** Set **`maxJobsActive`** (or equivalent worker option) to 10 — controls how many jobs the worker keeps activated at once. Documentation: [Node.js SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **b)** Spawn 10 worker processes. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Use Promise.all() in handler. Documentation: [Node.js SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **d)** Concurrency is fixed at 1; cannot tune. Documentation: [Node.js SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Worker options like `maxJobsActive` (Node SDK; Java equivalent is `maxJobsActive`) tune how many concurrent jobs the worker holds. Set to 10 to handle 10 in flight.

- **Option b) — Heavier.** 10 processes adds OS overhead; per-worker concurrency is the simpler scale knob.

- **Option c) — Wrong place.** Promise.all inside a single-job handler doesn't increase job concurrency.

- **Option d) — Incorrect.** Concurrency is tunable.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. maxJobsActive option.
- **b) 4/10** — heavier alternative.
- **c) 2/10** — wrong scope.
- **d) 1/10** — невярно.

**Correct Answer:** Set maxJobsActive worker option to 10.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/node-js-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "10 concurrent jobs" → разпознаваш че се иска **maxJobsActive**.

**Въпросът → Solution Framing.** "SDK option controls concurrency" — изпитва се worker tuning knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че maxJobsActive е canonical, че 10 processes е heavier, че Promise.all не увеличава job-level concurrency. Знание за worker concurrency tuning.

---

## Question 42: Extensions & Integrations (Weighting: 25%)

**Scenario:** A backend service must **publish a Message** to correlate with a waiting process instance (e.g., to release an Intermediate Message Catch Event). The correlation key is `orderId = "ORD-9876"`.

**Which Orchestration Cluster REST API endpoint fits?**

- **a)** POST `/v2/messages/publication` with `{name: "PaymentReceived", correlationKey: "ORD-9876", variables: {...}}`. Zeebe correlates the message to a waiting subscription with matching name + correlationKey. Documentation: [Publish Message](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/specifications/publish-message/)

- **b)** POST `/v2/process-instances` to start new. Documentation: [Create Process Instance](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/specifications/create-process-instance/)

- **c)** POST `/v2/signals/broadcast`. Documentation: [Signals](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

- **d)** PATCH the instance variables. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `POST /v2/messages/publication` publishes a Message; Zeebe correlates by name + correlationKey to a waiting Message Catch / Receive Task / Boundary subscription.

- **Option b) — Different intent.** Starts new instance; doesn't correlate to waiting one.

- **Option c) — Different semantics.** Signal broadcast fires Signal Catch Events (different from Message), and broadcasts to all listeners, not correlation-key targeted.

- **Option d) — Wrong operation.** Variables PATCH doesn't trigger Message Catch.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. /v2/messages/publication.
- **b) 2/10** — wrong intent.
- **c) 4/10** — wrong event type.
- **d) 2/10** — wrong operation.

**Correct Answer:** POST /v2/messages/publication with name and correlationKey.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/specifications/publish-message/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Publish Message correlate to waiting instance" → разпознаваш че се иска **/v2/messages/publication**.

**Въпросът → Solution Framing.** "Endpoint fits" — изпитва се REST API surface.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che messages/publication = correlation, че process-instances = start new, че signals/broadcast = different event type, че variables PATCH не triggers event. Знание за Orchestration REST API endpoints.

---

## Question 43: Extensions & Integrations (Weighting: 25%)

**Scenario:** A custom Outbound Connector built with the SDK has a property in its element template marked with `binding: { type: "zeebe:input", name: "apiUrl" }`. The team is unsure what this binding type does.

**What does `zeebe:input` binding type mean?**

- **a)** Maps the property to a **Zeebe Input Variable mapping** on the Service Task — the property value becomes a local variable named `apiUrl` available to the Connector at execution. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **b)** Sets the property as a process-wide input. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Maps to a BPMN attribute. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **d)** No effect; cosmetic only. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Element Template binding types include `zeebe:input` (input mapping), `zeebe:output` (output mapping), `zeebe:taskDefinition`, `zeebe:taskHeader`, `property`, etc. `zeebe:input` creates an Input Mapping at the BPMN level — the property's value becomes a local variable.

- **Option b) — Wrong scope.** Process-wide is different from task-local Input Mapping.

- **Option c) — Wrong.** Maps to extension element, not core BPMN attribute.

- **Option d) — Incorrect.** Bindings have semantic effect.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. zeebe:input = Input Mapping.
- **b) 3/10** — wrong scope.
- **c) 3/10** — wrong target.
- **d) 1/10** — невярно.

**Correct Answer:** Maps the property to a Zeebe Input Variable mapping on the Service Task.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "zeebe:input binding type" → разпознаваш че се иска **Input Mapping binding**.

**Въпросът → Solution Framing.** "What it means" — изпитва се Element Template binding knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Element Template binding types map to specific Zeebe elements, че zeebe:input → Input Mapping, че няма cosmetic-only bindings. Знание за Element Template bindings.

---

## Question 44: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Java Job Worker handles a high-volume `enrich-event` Service Task. The team is profiling — they want to monitor **how many jobs per second** the worker is processing, in real time.

**Which approach gives this throughput observability?**

- **a)** Instrument the worker with **metrics** (Micrometer or similar) — expose Prometheus-format counters/timers (`jobs_processed_total`, processing time). Grafana dashboard plots rate. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Tail the worker's stdout log. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Query Operate for completed task counts. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Camunda exposes worker metrics natively; configure in Console. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Workers are user code; the canonical way to instrument throughput is to add Micrometer/Prometheus metrics in worker code and scrape via Grafana. Spring Zeebe integrates well with Micrometer auto-config.

- **Option b) — Crude.** Log parsing is fragile; metrics-platform integration is standard.

- **Option c) — Different scope.** Operate counts tasks but doesn't give per-second rate at the worker.

- **Option d) — Misleading.** Camunda Console shows cluster-level metrics; per-worker throughput is the worker's responsibility.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Worker-instrumented metrics.
- **b) 3/10** — crude.
- **c) 4/10** — different scope.
- **d) 4/10** — misleading.

**Correct Answer:** Instrument the worker with metrics (Micrometer/Prometheus).

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Throughput per second" → разпознаваш че се иска **worker-instrumented metrics**.

**Въпросът → Solution Framing.** "Observability" — изпитва се knowledge на worker monitoring.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че worker metrics са worker's responsibility, че logs са crude, че Operate е different scope. Знание за worker observability.

---

## Question 45: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Java worker using Spring Zeebe needs to **fetch process variables** by name. The handler is `@JobWorker(type="enrich")` and declares `void enrich(@Variable String customerId, @Variable Order order)`.

**What does the `@Variable` annotation do?**

- **a)** Binds the parameter to a **process variable** of the same name — Spring Zeebe extracts it from the job's variables and deserialises into the parameter type. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** Marks the parameter as required to start the worker. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** Creates a new variable in the process. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** No effect; pure documentation. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `@Variable` is Spring Zeebe's parameter-binding annotation — extracts a process variable of the same name (or `@Variable("explicitName")`) from the activated job and deserialises into the parameter type. Cleaner than manual `activatedJob.getVariablesAsMap().get(...)`.

- **Option b) — Misleading.** Required-ness is a different concern.

- **Option c) — Wrong direction.** Reads, doesn't create.

- **Option d) — Incorrect.** Has functional effect.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. @Variable binding.
- **b) 3/10** — misleading.
- **c) 2/10** — wrong direction.
- **d) 1/10** — невярно.

**Correct Answer:** Binds the parameter to a process variable of the same name.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "@Variable annotation behavior" → разпознаваш че се иска **parameter binding**.

**Въпросът → Solution Framing.** "What annotation does" — изпитва се Spring Zeebe annotation knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че @Variable е binding annotation, че Spring Zeebe deserialises into typed param, че не е cosmetic. Знание за Spring Zeebe API.

---

## Question 46: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team wants to fetch **all completed process instances** of a particular process definition for an export job. They have OAuth2 credentials and want to use a single REST endpoint with pagination.

**Which Orchestration Cluster API endpoint fits?**

- **a)** POST `/v2/process-instances/search` with filter `state = "COMPLETED"` + `processDefinitionId` + pagination (`page`/`pageSize`). Returns paginated process instance summaries. Documentation: [Search Process Instances](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/)

- **b)** GET `/v2/process-instances` (list-all). Documentation: [Orchestration API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/)

- **c)** Operate's Elasticsearch directly. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Optimize export endpoint. Documentation: [Optimize](https://docs.camunda.io/docs/components/optimize/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Orchestration Cluster REST API exposes search endpoints (POST `.../search` with filter body + pagination) for various entities — instances, decisions, tasks, etc. The canonical way to query.

- **Option b) — Wrong shape.** No bulk GET; filtered queries use POST search.

- **Option c) — Bypasses API contract.** Direct ES queries are not the supported API surface; breaks on version upgrades.

- **Option d) — Different tool.** Optimize is analytics, not transactional listing.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. POST search with filter + pagination.
- **b) 3/10** — wrong shape.
- **c) 2/10** — bypasses API.
- **d) 3/10** — different tool.

**Correct Answer:** POST /v2/process-instances/search with state filter and pagination.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Query completed instances + pagination" → разпознаваш че се иска **search endpoint**.

**Въпросът → Solution Framing.** "Endpoint fits" — изпитва се API surface knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че search endpoints са POST + filter body, че ES direct е bypass, че Optimize е analytics. Знание за Orchestration API.

---

## Question 47: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team wants to **stream activated jobs** efficiently — instead of polling, they want jobs pushed to the worker as they become available. Spring Zeebe uses the gRPC streamJobs API under the hood.

**What's the benefit of streamJobs over poll-based job activation?**

- **a)** **Lower latency** — jobs are pushed to the worker as soon as they're created, eliminating the polling interval delay. Reduces tail latency in high-throughput scenarios. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/gateway-service/)

- **b)** Lower memory usage on the broker. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/gateway-service/)

- **c)** Streams allow exactly-once delivery. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/gateway-service/)

- **d)** Streams support backwards compatibility with C7. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/gateway-service/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** streamJobs is the gRPC server-streaming API where the gateway pushes jobs to subscribed workers as they're created. Eliminates poll-interval latency. Particularly beneficial when poll interval > job creation rate.

- **Option b) — Incorrect.** Broker memory isn't reduced by streaming model.

- **Option c) — Incorrect.** Zeebe semantics remain at-least-once regardless of polling vs streaming.

- **Option d) — Incorrect.** No C7 compatibility implication.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Lower latency push-based.
- **b) 3/10** — incorrect.
- **c) 2/10** — incorrect (at-least-once unchanged).
- **d) 1/10** — incorrect.

**Correct Answer:** Lower latency — jobs pushed as soon as created.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/zeebe-api/gateway-service/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "streamJobs over polling" → разпознаваш че се иска **lower latency**.

**Въпросът → Solution Framing.** "Benefit" — изпитва се knowledge на streamJobs.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че streamJobs = push, latency reduction, че at-least-once е invariant, че broker memory unchanged. Знание за gRPC streaming.

---

## Question 48: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must **decode** a JSON-string variable (`payload = '{"orderId": "ABC", "amount": 100}'`) into a usable context.

**Which FEEL handles this?**

- **a)** Decoding embedded JSON strings within FEEL is **not natively supported**; instead, configure the upstream task to return the value already deserialised (process variables are JSON-typed at the boundary). Or use a Service Task that parses and writes a structured variable. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **b)** `parse(payload)` — built-in. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `fromJson(payload)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `payload.orderId` works directly. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL doesn't have a native JSON-string parsing function. The recommended approach: structure variables at the boundary so they're deserialised when written. If you really have a string, a Service Task can parse and re-write.

- **Option b) — Invented.** No `parse()`.

- **Option c) — Invented.** No `fromJson()`.

- **Option d) — Wrong.** Dot access on a string fails.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Не е native; structure at boundary.
- **b) 1/10** — invented.
- **c) 1/10** — invented.
- **d) 2/10** — incorrect.

**Correct Answer:** Not natively supported; structure at boundary or parse in Service Task.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Parse JSON string in FEEL" → разпознаваш че се иска **boundary handling not FEEL**.

**Въпросът → Solution Framing.** "Which FEEL handles this" — trap question testing FEEL boundaries.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL няма JSON parse built-in, че variables трябва да са structured at boundary. Знание за FEEL limits.

---

## Question 49: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL date expression must compute the **first day of next month** from a given date. E.g., from `2026-05-14`, return `2026-06-01`.

**Which FEEL approach fits?**

- **a)** Combine `date()`, `year of()` / `month of()` (or `.year` / `.month` field access), and arithmetic — e.g., compute next month's year/month and construct a new date with day=1. Or use `date and time` arithmetic adding `duration("P1M")` to the start-of-month. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** `nextMonth(date)` — built-in. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `firstOfNextMonth(date)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Not solvable in FEEL. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL provides primitives — date access (`.year`, `.month`, `.day`), date constructor `date(y, m, d)`, duration arithmetic. Compose them: construct `date(year(d), month(d), 1)` then add `P1M` duration → first of next month.

- **Option b) — Invented.** No `nextMonth()`.

- **Option c) — Invented.** No such built-in.

- **Option d) — Incorrect.** Solvable via composition.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Compose primitives.
- **b) 1/10** — invented.
- **c) 1/10** — invented.
- **d) 1/10** — невярно.

**Correct Answer:** Compose date(), .year/.month access, and duration("P1M") arithmetic.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "First day of next month" → разпознаваш че се иска **composition of FEEL temporal primitives**.

**Въпросът → Solution Framing.** "Approach fits" — изпитва се FEEL date composition.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL има date(), `.year`/`.month` access, duration arithmetic, че няма named helper. Знание за FEEL temporal composition.

---

## Question 50: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team is building an **RPA bot** that logs into the corporate SAP UI, navigates menus, runs a report, exports CSV. They want to **deploy the bot as a worker** that subscribes to RPA-typed Service Tasks in a BPMN.

**Which Camunda 8 RPA worker pattern fits?**

- **a)** Deploy the bot script to a **Camunda 8 RPA worker** (separate process from Zeebe gateway). The worker subscribes to a Service Task type configured for RPA (e.g., `camunda::rpa`). When a BPMN instance reaches that task, the worker executes the bot. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **b)** Embed the bot script in BPMN as Script Task. Documentation: [Script Task](https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/)

- **c)** Service Task with HTTP Connector calling a RPA-vendor API. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** RPA isn't a first-class Camunda 8 concept. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 RPA architecture: bot script + RPA worker process + Service Task with RPA-specific task type. The worker subscribes and executes the bot when activated.

- **Option b) — Wrong scope.** Script Task runs FEEL or BPMN-engine-side scripts; not full-blown RPA bots.

- **Option c) — Workable but external.** Calling an external RPA vendor API works but uses no Camunda-native RPA features.

- **Option d) — Incorrect.** RPA is first-class in C8.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. RPA worker + bot script + Service Task type.
- **b) 3/10** — wrong scope.
- **c) 5/10** — works but external.
- **d) 1/10** — невярно.

**Correct Answer:** Deploy bot script to a Camunda 8 RPA worker subscribing to RPA-typed Service Task.

**Official Documentation Link:** https://docs.camunda.io/docs/components/rpa/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Deploy bot as worker + subscribe to RPA tasks" → разпознаваш че се иска **RPA worker pattern**.

**Въпросът → Solution Framing.** "RPA worker pattern fits" — изпитва се C8 RPA architecture.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че RPA workers са separate process, че Script Task е BPMN-engine-side, че external vendor е workaround. Знание за C8 RPA architecture.

---

# Section 7 — Managing the Development Process (Questions 51-59)

> Weight 15% • Topics: Web Modeler, client credentials, Operate, Process Instances, troubleshooting, validation, migration.

---

## Question 51: Managing the Development Process (Weighting: 15%)

**Scenario:** A modeler in Web Modeler creates a `procurement-approval` process. The BPMN has an XOR Gateway with two outgoing flows that **both** lack condition expressions. The modeler clicks Deploy.

**What happens?**

- **a)** Web Modeler's **validation** flags the issue at design time (and Zeebe rejects deployment at runtime) because an XOR Gateway with multiple unconditional outgoing flows is non-deterministic. Modeler must add conditions or designate one as `default`. Documentation: [Validation](https://docs.camunda.io/docs/components/modeler/desktop-modeler/validation/)

- **b)** Deploys successfully; runtime picks the first flow alphabetically. Documentation: [Gateways](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **c)** Deploys but raises a warning. Documentation: [Validation](https://docs.camunda.io/docs/components/modeler/desktop-modeler/validation/)

- **d)** Deploys; Zeebe randomly selects a path at runtime. Documentation: [Gateways](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler validates BPMN against Zeebe execution rules; XOR with multiple unconditional outgoing flows fails validation. Fix: add conditions on all but one and designate that one as `default`.

- **Option b) — Incorrect.** No alphabetical fallback in BPMN semantics.

- **Option c) — Misleading.** This is an error, not a warning.

- **Option d) — Incorrect.** Random selection isn't BPMN semantics.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Validation rejects.
- **b) 1/10** — invented behavior.
- **c) 3/10** — misleading severity.
- **d) 1/10** — invented behavior.

**Correct Answer:** Web Modeler validation flags it; deployment is rejected.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/validation/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "XOR with unconditional flows" → разпознаваш че се иска **validation error**.

**Въпросът → Solution Framing.** "What happens" — изпитва се validation knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler validates BPMN, че няма alphabetical fallback, че random selection не е BPMN semantics. Знание за validation rules.

---

## Question 52: Managing the Development Process (Weighting: 15%)

**Scenario:** A team has a deployed `order-fulfillment` v3. They discover that 50 in-flight instances are blocked because v3 has a defect in a downstream task. They want to **migrate the 50 instances to v4** (the fix).

**Which Operate feature handles this?**

- **a)** **Process Instance Migration** in Operate — define a migration plan mapping flow-node IDs from v3 to v4. Apply the migration to selected instances; they transition to v4 logic preserving their current state. Documentation: [Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **b)** Cancel + restart each instance manually. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/operate-actions/)

- **c)** Auto-migration on deploy. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

- **d)** Migration isn't supported. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate exposes Process Instance Migration: define mapping of source flow-nodes to target flow-nodes; apply to selected instances. Zeebe rebases the instances onto the target version preserving state where mappings exist.

- **Option b) — Loses state.** Cancel/restart loses work-in-progress.

- **Option c) — Wrong default.** No auto-migration; opt-in via migration feature.

- **Option d) — Incorrect.** Migration is supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Process Instance Migration.
- **b) 3/10** — loses state.
- **c) 2/10** — wrong default.
- **d) 1/10** — невярно.

**Correct Answer:** Process Instance Migration in Operate with a migration plan.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Migrate 50 in-flight instances to v4" → разпознаваш че се иска **Process Instance Migration**.

**Въпросът → Solution Framing.** "Feature handles" — изпитва се Operate migration knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Migration е canonical, че cancel/restart губи state, че auto-migration не е default. Знание за Process Instance Migration.

---

## Question 53: Managing the Development Process (Weighting: 15%)

**Scenario:** A backend service must call the Camunda REST API. Devs are setting up client credentials. In SaaS, they need to provision a **Client** in Console.

**What artifacts does a Console Client provide?**

- **a)** **`client_id` + `client_secret` + audience URLs** — the trio needed for OAuth2 client-credentials grant. Granted scopes (Operate, Tasklist, Zeebe, etc.) determine which APIs the client may call. Documentation: [API Clients](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **b)** Username + password. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **c)** Just a single API key. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **d)** mTLS client certificate. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Console Clients = OAuth2 client credentials. Provision a Client → get client_id + client_secret + audience URL (per cluster service). Use in OAuth2 token request; access scopes are configured per-client.

- **Option b) — Wrong model.** SaaS doesn't use basic auth.

- **Option c) — Wrong model.** Not a single-key model.

- **Option d) — Wrong model.** Not mTLS at the API level.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. client_id + secret + audience.
- **b) 1/10** — wrong model.
- **c) 1/10** — wrong model.
- **d) 1/10** — wrong model.

**Correct Answer:** client_id + client_secret + audience URLs.

**Official Documentation Link:** https://docs.camunda.io/docs/guides/setup-client-connection-credentials/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Console Client artifacts" → разпознаваш че се иска **OAuth2 client-credentials trio**.

**Въпросът → Solution Framing.** "What it provides" — изпитва се knowledge на Console.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SaaS използва OAuth2, че не е basic-auth/single-key/mTLS. Знание за Console Clients.

---

## Question 54: Managing the Development Process (Weighting: 15%)

**Scenario:** An ops engineer sees in Operate that 30 instances of `kyc-verification` are **stuck on the same task** for 6+ hours. The task is a Service Task with type `external-credit-check`. The team needs to diagnose.

**Which first investigation step?**

- **a)** Check **worker subscription** — verify whether any worker is subscribed to `external-credit-check` and processing jobs. If no worker subscribed, jobs sit in the activation pool until a worker connects. Verify in Operate (task counts) and in worker logs. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Restart the Zeebe cluster. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Re-deploy the BPMN. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

- **d)** Cancel all stuck instances. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Stuck-on-Service-Task pattern almost always means worker not running, not subscribed to correct task type, or crashing on activation. First check: is the worker subscribed and processing? Verify via worker logs and Operate's job/task counts.

- **Option b) — Premature.** Cluster restart is heavy and likely unrelated.

- **Option c) — Premature.** Redeploy doesn't fix worker subscription.

- **Option d) — Premature.** Cancel is destructive; diagnose first.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Worker subscription check first.
- **b) 2/10** — premature.
- **c) 3/10** — premature.
- **d) 2/10** — destructive premature.

**Correct Answer:** Check worker subscription for the task type.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Stuck on Service Task 6+ hours" → разпознаваш че се иска **worker-subscription check**.

**Въпросът → Solution Framing.** "First step" — изпитва се troubleshooting heuristic.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че stuck-on-Service-Task = worker не е subscribed, че cluster restart и redeploy са premature. Знание за worker troubleshooting.

---

## Question 55: Managing the Development Process (Weighting: 15%)

**Scenario:** A team uses Play mode in Web Modeler to test a `refund-process` BPMN before deployment. The process has a Service Task with type `refund-payment`. Play executes; the task pauses.

**What does Play do at a Service Task during simulation?**

- **a)** Play provides a **mock/manual completion** UI — the user supplies the output variables that would result from a real worker. Useful for testing flow without deploying workers. Documentation: [Play](https://docs.camunda.io/docs/components/modeler/web-modeler/play-your-process/)

- **b)** Play deploys a temporary worker. Documentation: [Play](https://docs.camunda.io/docs/components/modeler/web-modeler/play-your-process/)

- **c)** Play skips Service Tasks. Documentation: [Play](https://docs.camunda.io/docs/components/modeler/web-modeler/play-your-process/)

- **d)** Play fails because no worker is subscribed. Documentation: [Play](https://docs.camunda.io/docs/components/modeler/web-modeler/play-your-process/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Play's value proposition: simulate execution without requiring deployed workers. At Service Tasks, user provides mock output variables; flow continues.

- **Option b) — Incorrect.** No auto-worker.

- **Option c) — Incorrect.** Doesn't skip; pauses for input.

- **Option d) — Incorrect.** Failing would defeat the simulation purpose.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Mock/manual completion UI.
- **b) 3/10** — invented.
- **c) 3/10** — incorrect.
- **d) 2/10** — incorrect.

**Correct Answer:** Play provides a mock/manual completion UI for Service Tasks.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/play-your-process/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Play at Service Task" → разпознаваш че се иска **mock completion UI**.

**Въпросът → Solution Framing.** "What Play does" — изпитва се Play simulation knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Play simulates без deployed workers, че няма auto-worker spawn, че не skips. Знание за Play behavior.

---

## Question 56: Managing the Development Process (Weighting: 15%)

**Scenario:** An ops user opens Operate and sees an **Incident** on a Business Rule Task: "Failed to evaluate expression: ... no rule matched and no default output". The DMN was UNIQUE policy.

**What's the root cause and fix?**

- **a)** UNIQUE policy with no matching rule and no default output → DMN evaluator can't return a value, raising an Incident. Fix: **add a default catch-all rule** at the bottom (or define a default output value). Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** Resolve Incident — DMN auto-retries. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **c)** Redeploy the BPMN. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

- **d)** Change UNIQUE to ANY policy. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** UNIQUE policy means "exactly one match"; with no match the evaluator can't return. The fix is to ensure all possible input combinations are covered — typically by adding a catch-all default rule with broad input ranges and a default output value.

- **Option b) — No fix.** Retrying without the data fix loops.

- **Option c) — Premature.** Redeploying without DMN fix doesn't help.

- **Option d) — Changes semantics.** ANY allows multiple matches with same output — but the issue is "no match," not "multiple matches."

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Default catch-all rule.
- **b) 2/10** — loops.
- **c) 2/10** — premature.
- **d) 3/10** — changes semantics, doesn't fix.

**Correct Answer:** Add a default catch-all rule or define a default output.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "UNIQUE no match Incident" → разпознаваш че се иска **default rule**.

**Въпросът → Solution Framing.** "Root cause and fix" — изпитва се DMN troubleshooting.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че UNIQUE no-match raises Incident, че retry без fix loops, че policy change не fix-ва coverage gap. Знание за DMN no-match handling.

---

## Question 57: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's Web Modeler project has 15 resources (BPMN, DMN, Forms). They want to share the **whole project** with a new partner organisation's modelers — readonly is acceptable.

**Which Web Modeler feature fits?**

- **a)** **Project Sharing** — invite users (by email) and assign roles (Project Admin, Editor, Viewer). For external partners, invite and assign Viewer. Documentation: [Web Modeler collaboration](https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/)

- **b)** Export all resources to ZIP; email to partner. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** Create a public link to the project. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** Web Modeler doesn't support project sharing. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler has project-level sharing with role-based permissions. Invite by email; assign Viewer for read-only access.

- **Option b) — Loses collaboration.** ZIP export loses real-time updates.

- **Option c) — Misleading.** Public links are not the canonical share model.

- **Option d) — Incorrect.** Sharing is supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Project sharing with roles.
- **b) 4/10** — loses collaboration.
- **c) 3/10** — misleading.
- **d) 1/10** — невярно.

**Correct Answer:** Project Sharing with Viewer role.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Share project with external partner readonly" → разпознаваш че се иска **Project Sharing + Viewer role**.

**Въпросът → Solution Framing.** "Feature fits" — изпитва се knowledge на Web Modeler sharing.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler има role-based sharing, че ZIP export губи real-time, че sharing е supported. Знание за Web Modeler collaboration.

---

## Question 58: Managing the Development Process (Weighting: 15%)

**Scenario:** A process instance is **Incident-blocked** on a Service Task with error "Variable 'orderId' not found." Ops sees the upstream task didn't set `orderId` due to a data issue. They want to **set `orderId` manually** and retry.

**Which Operate workflow fits?**

- **a)** **Edit process variables** in Operate (set `orderId = "ORD-1234"`), then **Resolve Incident** — job re-activates and worker proceeds with the now-present variable. Documentation: [Operate variables](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **b)** Cancel and restart the instance with correct variables. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Variables can't be set after instance creation. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Modify instance to move past the failed task. Documentation: [Modify](https://docs.camunda.io/docs/components/operate/userguide/modify-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's "Edit variables" + "Resolve Incident" is the canonical recovery flow for missing-data Incidents. Set the missing variable; resolve makes Zeebe re-activate the job; worker now finds the variable.

- **Option b) — Loses state.** Cancel/restart wastes earlier progress.

- **Option c) — Incorrect.** Variables are editable in Operate.

- **Option d) — Wrong action.** "Modify to move past" skips the task — fixes the symptom by avoiding the work, not the cause.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Edit variables + Resolve Incident.
- **b) 3/10** — loses state.
- **c) 1/10** — невярно.
- **d) 3/10** — skips work.

**Correct Answer:** Edit process variables, then Resolve Incident.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Missing variable + set manually + retry" → разпознаваш че се иска **Edit + Resolve**.

**Въпросът → Solution Framing.** "Workflow fits" — изпитва се Operate recovery knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Edit-then-Resolve е canonical, че cancel/restart loses state, че variables editable, че modify-skip е different intent. Знание за Operate variable editing.

---

## Question 59: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's `weekly-report` process has 5 versions deployed over 3 months. Operate's "Process" filter shows confusing data because instances from old versions are still completing. The team wants to **filter dashboards to v5 only**.

**Which Operate filter fits?**

- **a)** Use the **Version filter** on the process list — select v5 only. The dashboard then reflects only v5 instances. Documentation: [Operate filters](https://docs.camunda.io/docs/components/operate/userguide/process-instance-summary/)

- **b)** Operate doesn't support version filtering. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Manually cancel old-version instances. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Re-deploy v5 with a new processId. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's process-instance views allow filtering by version. Select v5 to see only those instances.

- **Option b) — Incorrect.** Version filter exists.

- **Option c) — Destructive.** Cancelling running work to clean up dashboards is destructive.

- **Option d) — Wrong fix.** Rename creates a new process, doesn't fix the filtering.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Version filter.
- **b) 1/10** — невярно.
- **c) 2/10** — destructive.
- **d) 2/10** — wrong fix.

**Correct Answer:** Use the Version filter to select v5 only.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-summary/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Filter to v5 only" → разпознаваш че се иска **Version filter**.

**Въпросът → Solution Framing.** "Filter fits" — изпитва се Operate filter knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate има version filter, че cancel е destructive, че rename е wrong fix. Знание за Operate filters.

---

# Section 8 — Dev Environment Setup (Question 60)

> Weight 1% • Topics: Camunda 8 Run, Docker Compose, ports, environment variables.

---

## Question 60: Dev Environment Setup (Weighting: 1%)

**Scenario:** A developer has Camunda 8 Run started locally. They want to deploy a BPMN from the command line using `zbctl`. They need the **Zeebe gateway address**.

**Which is the default Zeebe gateway gRPC address for Camunda 8 Run?**

- **a)** `localhost:26500` — the default gRPC port for the Zeebe gateway in Camunda 8 Run (and most Self-Managed setups). Operate UI is `localhost:8080`, Tasklist `localhost:8082`. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **b)** `localhost:8080` — same as Operate UI. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **c)** `localhost:9000`. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **d)** `https://localhost:443`. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe's gateway exposes gRPC on port **26500** by default — both in Camunda 8 Run and standard SM deployments. zbctl/SDKs connect there. Operate at 8080, Tasklist at 8082 (HTTP UIs).

- **Option b) — Incorrect.** 8080 is Operate's HTTP UI, not Zeebe gRPC.

- **Option c) — Incorrect.** Not a default port.

- **Option d) — Incorrect.** Not the gRPC default.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. 26500 е default Zeebe gRPC.
- **b) 2/10** — wrong (Operate).
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** localhost:26500.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Zeebe gateway gRPC address" → разпознаваш че се иска **port 26500**.

**Въпросът → Solution Framing.** "Default address" — изпитва се port knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че 26500 е Zeebe gRPC default, че 8080 е Operate, че други портове не са canonical. Знание за C8 default ports.

---

# Закриваща секция — Set 4

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

**Препоръка за тренировка (Set 4):**
1. **Open-book проход** — чети всеки 🔍 Explanations + Three-Skills Decomposition; не таймирай.
2. **Closed-book timed run** — 75-минутен таймер; запиши отговорите си; цел: ≥ 39/60.
3. **Анализ на грешки:** за всяка грешка кои от 3-те skills ти липсваше (Diagnostic Comprehension / Solution Framing / Mechanism Knowledge).

**Чести грешки в Set 4 (грешен axis вместо грешен отговор):**
- Q2 (Non-interrupting Timer) → пътане с interrupting Timer Boundary, което би cancel-нало User Task.
- Q15 (Document Handling) → base64 в variables вместо Documents API references.
- Q19 (AI Agent + Ad-hoc) → пътане с FEEL-driven Service Task за autonomous tool selection.
- Q23 (UNIQUE) → пътане с ANY (което позволява multiple matches при еднакъв output).
- Q40 (autoComplete=false) → грешно тълкуване като auto-fail или auto-hang.
- Q47 (streamJobs benefit) → нещо да не объркваш с "exactly-once delivery" — at-least-once е invariant.
- Q48 (FEEL JSON parse) — trap: не е native built-in, structure at boundary вместо това.
- Q54 (stuck on Service Task) → premature restart вместо worker-subscription check.
- Q56 (UNIQUE no-match) → policy change ≠ coverage fix; default rule е the answer.

**Успех на изпита!**
