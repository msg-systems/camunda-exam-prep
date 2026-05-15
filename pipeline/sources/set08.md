# Camunda 8 C8-CP-DV Mock Exam — Set 8

> **60 въпроса • 75 минути • праг ≥ 65% (39/60) • Blueprint v8.8.0**
>
> Свежи сценарии — distinct от Set 1-7. Всеки въпрос: сценарий + 4 опции (a/b/c/d) + 🔍 Explanations + per-option score 1–10 + Correct Answer + Documentation Link + 🧠 Three-Skills Decomposition.

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

> Weight 15% • Topics: Pools/Lanes, Tasks, Gateways, Events, Subprocesses, Multi-Instance, Standard Loops, Pool collaboration.

---

## Question 1: Modeling (Weighting: 15%)

**Scenario:** A B2B supply-chain workflow involves three independent organisations: a Buyer, a Seller, and a 3PL (third-party logistics provider). Each organisation runs its own internal process — they share information only at specific handover points (purchase order sent, shipment dispatched, delivery confirmed). The team is designing a single BPMN diagram to **document the cross-organisational interaction** for governance review (not for execution by any single Zeebe deployment).

**Which BPMN collaboration construct fits this multi-org documentation use case?**

- **a)** **Three Pools — one per organisation — connected by Message Flows** at handover points. Each Pool independently describes that org's internal process (which may or may not be Zeebe-deployed). Message Flows (dashed arrows) cross Pool boundaries to show inter-org exchanges. This is BPMN's standard "collaboration diagram" pattern for multi-party workflows. Documentation: [BPMN Collaboration](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **b)** A single Pool with three Lanes — one per organisation. Lanes are for **internal organisational units** within one process, not separate organisations. They share a single Zeebe process definition, which contradicts the "three independent organisations each running their own process" requirement. Documentation: [Pools and Lanes](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **c)** Three separate BPMN files, one per organisation, with no visual connection. Loses the cross-org documentation value — readers can't see how the orgs interact at a glance. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** A single Pool with annotations referencing other orgs. Annotations are non-executable text; they don't formalise the inter-org message exchanges with proper Message Flow semantics. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Multiple Pools represent **separate participants / organisations**. Each Pool is its own contained process; the Pool boundary is the trust boundary. Message Flows (dashed-line connectors with envelope marker) cross Pool boundaries to show that one org sends a message and another receives it. For a documentation-grade BPMN of a multi-org workflow, this is the BPMN-spec canonical construct. Note: in Camunda 8, only one Pool per BPMN file can be marked as `isExecutable=true` (the rest are typically descriptive, representing external participants). For pure documentation across three peer orgs, none might need to be executable.

- **Option b) — Wrong scope.** Lanes are **intra-Pool** divisions for sub-teams or roles within one organisation. Three Lanes for three orgs misuses the construct: it implies the three orgs share one process definition, which is exactly what cross-org workflows don't do.

- **Option c) — Loses interaction visibility.** Three disconnected files defeat the documentation purpose. The whole point is showing how the orgs talk to each other.

- **Option d) — Wrong abstraction.** Annotations are documentation comments, not formal model elements. They don't carry Message Flow semantics, so the inter-org exchanges remain undefined.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Three Pools + Message Flows е BPMN collaboration canonical pattern.
- **b) 3/10** — Lanes са intra-org units; misuses scope.
- **c) 3/10** — disconnected files lose interaction visibility.
- **d) 2/10** — annotations не carry formal semantics.

**Correct Answer:** Three Pools (one per organisation) connected by Message Flows at handover points.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "three independent organisations", "share at handover points", "document cross-organisational interaction." Класически BPMN collaboration pattern.

**Въпросът → Solution Framing.** "Fits multi-org documentation" — изпитва се knowledge на Pool scope (organisation) vs Lane scope (internal unit).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Pools = separate orgs, Lanes = internal teams, Message Flows = inter-Pool, annotations = informal comments. Това е знание за BPMN collaboration constructs и proper modelling scope.

---

## Question 2: Modeling (Weighting: 15%)

**Scenario:** A customer-support process has a Service Task `assign-priority`. If this task fails because the priority-classifier API is overloaded (returns HTTP 503), the team wants to **escalate to a supervisor** for manual assignment — but the supervisor escalation is a normal business outcome, not a system error to be retried. The escalation should propagate **upward to a parent Event Subprocess** that handles supervisor notifications across multiple tasks.

**Which BPMN event-type pair fits "non-error, upward-propagating, business escalation"?**

- **a)** **Escalation Throw Event** (Intermediate or End) on the failure path inside the task's local error handling, caught by an **Escalation Start Event** in an Event Subprocess at the parent level. Escalation is BPMN's dedicated event type for **business-level upward signalling**, distinct from Error (system fault) and Signal (cluster-wide broadcast). It can be interrupting or non-interrupting at the catch side. Documentation: [Escalation Events](https://docs.camunda.io/docs/components/modeler/bpmn/escalation-events/)

- **b)** **Error Throw + Error Boundary**. Error events signal system faults / exceptional conditions — semantically inappropriate for "normal business escalation"; conflates errors with business outcomes. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** **Signal Throw + Signal Catch**. Signals broadcast cluster-wide to all matching catchers across all processes/instances. Inappropriate for an in-instance escalation — wastes broadcast scope and could trigger unintended listeners. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

- **d)** **Message Throw + Message Catch**. Messages correlate to specific instances via correlation keys; not designed for in-instance upward propagation. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN designed **Escalation** as a separate event type precisely to distinguish business-level upward signalling from system errors. Semantic value: readers of the BPMN see "Escalation" and immediately understand "this is a business escalation, not a fault." Behaviour: scope-local upward propagation (within the process instance), caught by Escalation Start (in Event Subprocess) or Escalation Boundary. Can be interrupting (parent path takes over) or non-interrupting (parent listens while main flow continues).

- **Option b) — Wrong semantic.** Error events are for "something went wrong" — system fault, exception. Treating a business outcome (overload → manual review) as an error muddies the BPMN: every reader has to dig into the model to understand whether this is a fault or a normal flow. Use Error for faults; Escalation for business outcomes that need attention.

- **Option c) — Wrong scope.** Signal broadcasts across the entire cluster (all processes, all instances). The team's intent is in-instance escalation — Signal's broadcast scope is wrong tool. Plus, Signal listeners outside the intended scope could fire unintentionally.

- **Option d) — Wrong direction.** Messages are correlation-keyed for instance-to-instance communication. In-instance upward propagation isn't their model.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Escalation е BPMN's dedicated business-escalation event type, scope-local upward.
- **b) 4/10** — Error conflates business outcome with system fault; muddies semantics.
- **c) 3/10** — Signal е broadcast; wrong scope, could trigger unintended listeners.
- **d) 3/10** — Messages са correlation-keyed inter-instance; wrong direction.

**Correct Answer:** Escalation Throw Event caught by Escalation Start in an Event Subprocess.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/escalation-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "normal business outcome", "escalate to supervisor", "propagate upward to parent." Това signal-ира че се иска Escalation (не Error, не Signal, не Message) — BPMN's dedicated business-escalation event.

**Въпросът → Solution Framing.** "Fits non-error, upward-propagating, business escalation" — изпитва се knowledge на the four event semantic types (Error / Escalation / Signal / Message) и техните различни propagation models.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Escalation е scope-local upward + business-meaning, Error е system fault, Signal е cluster broadcast, Message е correlation-keyed. Това е знание за BPMN event taxonomy и semantic precision.

---

## Question 3: Modeling (Weighting: 15%)

**Scenario:** A claims-processing flow has a Multi-Instance Subprocess that iterates over `claims = []` (a process variable that, at MI activation, **happens to be an empty list** — no claims that day). The team is unsure what happens to MI instances and the subprocess as a whole when the input collection is empty.

**What is the behaviour of a Parallel Multi-Instance Subprocess with an empty inputCollection?**

- **a)** The MI subprocess **completes immediately with zero inner instances spawned** — no work to do. Flow continues to the next BPMN element. `outputCollection` (if configured) becomes an empty list. The downstream activities see the empty result and proceed. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Zeebe raises an Incident — incorrect; empty list is a valid input, not an error. The team's intent for "iterate over claims" is naturally "iterate zero times if there are none." Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Zeebe spawns one instance with `inputElement = null` — wrong default behaviour; empty input ≠ single-instance with null. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** The process hangs waiting for the list to be non-empty — incorrect; MI doesn't poll for the list. Activation evaluates `inputCollection` once, at MI start. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN's MI semantics define the empty-collection case as "zero iterations, immediate completion." The engine reads `inputCollection`, sees zero elements, doesn't spawn any inner instances, and completes the MI activity. The subprocess's outgoing arrow is taken; downstream activities proceed. If `outputCollection` was configured, it's set to `[]` (empty list) — downstream consumers should handle this case (FEEL `count(outputCollection) > 0` etc.). This "vacuous truth" behaviour matches mathematical conventions for empty collections.

- **Option b) — Wrong.** Empty isn't an error; it's a valid degenerate case.

- **Option c) — Wrong assumption.** Zeebe doesn't substitute a null instance. Zero items = zero iterations.

- **Option d) — Wrong activation model.** MI activates once on entry; doesn't poll.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Zero inner instances, immediate completion, outputCollection = [].
- **b) 2/10** — empty list е valid degenerate case, не error.
- **c) 3/10** — wrong substitution; no null instance.
- **d) 1/10** — wrong activation model; не polls.

**Correct Answer:** MI completes immediately with zero inner instances; outputCollection becomes empty list.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "empty inputCollection", "no claims that day." Edge case на MI execution.

**Въпросът → Solution Framing.** "Behaviour with empty inputCollection" — изпитва се MI semantics for degenerate input.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че MI evaluates inputCollection once, zero items → zero instances, outputCollection е empty list, че MI не polls. Това е знание за MI execution semantics + edge cases.

---

## Question 4: Modeling (Weighting: 15%)

**Scenario:** A long-running approval User Task should send **periodic reminders** to the assignee — every 24 hours — without cancelling the task. The reminders fire **multiple times** (not just once); the task stays active throughout.

**Which Timer Boundary Event configuration fits "recurring reminders, task stays active"?**

- **a)** **Non-interrupting Timer Boundary Event** configured with a **Cycle** expression like `R/PT24H` (recurring every 24 hours, unbounded) or `R5/PT24H` (5 times, capped). Non-interrupting means the host task isn't cancelled when the timer fires; the cycle re-arms automatically. Each firing routes via the boundary's outgoing arrow to a "send reminder" path. Documentation: [Timer Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** **Interrupting Timer Boundary** with cycle — interrupting would cancel the User Task on the first fire, defeating "task stays active." Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** **Non-interrupting Timer Boundary** with **Duration** `PT24H` — fires once after 24 hours, doesn't recur. Only the first reminder is sent. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Loop the entire process with a Sub-Process containing the User Task — overkill; bound a recurring timer is the canonical solution. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Two key properties combine here: (1) **Non-interrupting** (dashed border) means the host User Task isn't cancelled when the timer fires — it stays active for the assignee. (2) **Cycle** (ISO 8601 `R/PT24H` or `Rn/PT24H`) means the timer recurs at the specified interval. Each cycle firing routes to the reminder branch (e.g., a Service Task that emails the assignee). The User Task can still be completed normally at any time, ending the cycle. This is the BPMN-canonical pattern for "recurring task reminder."

- **Option b) — Wrong semantic.** Interrupting boundary cancels the host on first fire. Task gone, no further reminders, no way for assignee to complete.

- **Option c) — Wrong timer type.** Duration is single-shot; fires once. Won't repeat.

- **Option d) — Over-engineered.** Wrapping a User Task in a Multi-Instance subprocess to simulate recurrence is far more complex than a single Timer Boundary Event with a Cycle.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Non-interrupting + Cycle = recurring reminders without task cancellation.
- **b) 3/10** — Interrupting cancels host; defeats "stays active."
- **c) 4/10** — Duration е single-shot; не recurs.
- **d) 3/10** — over-engineered; simple Timer Boundary suffices.

**Correct Answer:** Non-interrupting Timer Boundary Event with Cycle expression (R/PT24H or Rn/PT24H).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "recurring reminders", "every 24 hours", "task stays active." Това signal-ира non-interrupting + cycle.

**Въпросът → Solution Framing.** "Recurring reminders, task stays active" — изпитва се knowledge на двата critical settings: interrupting/non-interrupting boundary + cycle/duration timer.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че non-interrupting запазва host, че Cycle (R) recurs, че Duration (PT) е single-shot, че wrapper subprocesses са overkill. Това е знание за Timer Boundary configurations.

---

## Question 5: Modeling (Weighting: 15%)

**Scenario:** A finance team has a 6-step **transactional saga**: `validate-order`, `reserve-inventory`, `charge-card`, `book-shipping`, `send-confirmation`, `update-ledger`. The team specifies **strict transactional semantics**: if any step fails, **all completed steps must roll back via their compensation handlers**, then the BPMN flow takes a "rollback completed" path. This is more than ad-hoc compensation throw; it's the formal BPMN Transaction pattern.

**Which BPMN construct expresses transactional rollback with a built-in cancellation pathway?**

- **a)** A **Transaction Subprocess** (Subprocess with `transactionalSubprocess` marker — double-bordered visually) containing the 6 tasks, each with their Compensation Boundary Events + handlers. Inside, a **Cancel End Event** triggers transactional cancellation. Outside the subprocess border, a **Cancel Boundary Event** catches the cancellation and routes to "rollback completed" path; the engine invokes all completed inner activities' compensation handlers in reverse order automatically. **Note:** Zeebe's BPMN coverage for Transaction Subprocesses varies by version — verify the current docs. Documentation: [BPMN coverage](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/) + [Compensation](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **b)** Regular Embedded Subprocess with manual Compensation Throw at the end. Works functionally but doesn't carry the formal "transaction" declaration; readers don't see the transactional intent at a glance. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **c)** Six explicit Service Tasks with explicit reverse-flow paths to compensation tasks. Verbose; loses the abstraction; hard to maintain. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Camunda 8 doesn't support transactions at all. Inaccurate — compensation patterns are supported; Transaction Subprocess support varies. Documentation: [BPMN coverage](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct (with caveat).** The BPMN Transaction Subprocess is the spec-defined construct for transactional rollback patterns. Combines: (1) the double-border visual marker indicates transactional intent; (2) inner activities with Compensation Boundary Events carry their reverse logic; (3) Cancel End Event inside the transaction triggers the rollback; (4) Cancel Boundary Event outside the transaction catches the cancellation event and routes the flow. The engine automatically walks completed activities in reverse and invokes compensation. **Important practical note:** Zeebe's Transaction Subprocess support has evolved across versions; verify `BPMN coverage` docs for your specific Zeebe version. In versions with limited support, the practical fallback is Embedded Subprocess + manual Compensation Throw (option b).

- **Option b) — Workable fallback.** Embedded Subprocess + explicit Compensation Throw at the failure end achieves the same rollback behaviour but loses the formal "Transaction Subprocess" declaration. The double-border cue and Cancel End semantics are absent. Use this when Transaction Subprocess isn't supported in your Zeebe version.

- **Option c) — Loses abstraction.** 6 manual reverse paths bloat the diagram, lose the transactional intent, and require careful maintenance to keep in sync with the forward flow.

- **Option d) — Incorrect.** Compensation is supported; Transaction Subprocess support varies.

**Per-option scoring (1–10):**
- **a) 9/10** — верен с caveat. Transaction Subprocess е BPMN-spec construct; verify Zeebe version coverage.
- **b) 6/10** — workable fallback when Transaction Subprocess не е fully supported.
- **c) 3/10** — verbose; loses abstraction; manual maintenance.
- **d) 3/10** — невярно; compensation supported.

**Correct Answer:** Transaction Subprocess with Cancel End + Cancel Boundary + inner Compensation Handlers (verify Zeebe version support).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "strict transactional semantics", "all rollback", "more than ad-hoc Compensation Throw." Това signal-ира formal Transaction Subprocess.

**Въпросът → Solution Framing.** "Built-in cancellation pathway" — изпитва се knowledge на formal Transaction pattern vs ad-hoc compensation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Transaction Subprocess е double-bordered, Cancel End + Cancel Boundary е the trigger pair, че Zeebe version varies на support, че Embedded + Compensation е fallback. Това е знание за BPMN transactional patterns.

---

## Question 6: Modeling (Weighting: 15%)

**Scenario:** A KYC (Know Your Customer) process has an **Inclusive Gateway** splitting on three condition checks: `requiresIdVerification`, `requiresAddressProof`, `requiresPepCheck` — any combination may be true (zero, one, two, or all three). After the active branches complete, the flow converges at an **Inclusive Gateway** join. The team wonders: does the join wait for **all** outgoing branches from the split, or only the ones that were **actually taken**?

**Which best describes the Inclusive Gateway join semantics?**

- **a)** Inclusive Gateway join **waits only for branches that were actually taken** at the corresponding split. The engine looks at which conditions evaluated true at split time, expects tokens from those branches, and proceeds once all of them have arrived. Untaken branches are ignored. This is more sophisticated than Parallel join (which waits for all incoming) and more flexible than Exclusive join (passes through any single token). Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **b)** Waits for **all** outgoing branches like Parallel join — incorrect; this would block forever on untaken branches. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **c)** Passes through any single token like Exclusive join — incorrect; would result in premature flow continuation before sibling branches complete. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **d)** Waits for any one token, then waits an additional timeout for others — invented behaviour; no such "soft wait" semantics in BPMN Inclusive Gateways. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Inclusive Gateway's distinguishing feature is its "smart join": at the join, the engine knows which branches were taken at the corresponding split and waits only for those. This makes Inclusive cleaner than Parallel when only a subset of branches activates: with Parallel, you'd need to design all branches always to fire (e.g., via no-op paths for the "not needed" cases), bloating the diagram. With Inclusive, the model expresses "fire whatever applies, then synchronise on whatever was taken."

  Important: BPMN's specification requires Inclusive joins to be paired with an Inclusive split that can "look ahead" — the engine must know which branches will fire. For complex topologies (loops, multiple Inclusive splits intersecting) the join semantics get tricky; for the standard split-then-join pattern shown in the scenario, it works cleanly.

- **Option b) — Wrong (Parallel semantic).** Parallel join waits for every incoming arrow's token. With Inclusive split that may not produce all tokens, Parallel join would deadlock.

- **Option c) — Wrong (Exclusive semantic).** Exclusive join passes the first token through; siblings keep running, downstream proceeds prematurely.

- **Option d) — Invented.** No such timeout-based semantic.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Inclusive join waits only for actually-taken branches.
- **b) 3/10** — deadlocks on untaken branches; wrong join semantic.
- **c) 3/10** — premature continuation; wrong join semantic.
- **d) 1/10** — invented behaviour.

**Correct Answer:** Inclusive Gateway join waits only for branches that were actually taken at the corresponding split.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Inclusive Gateway join semantics", "wait for all or only taken?" Това е въпрос за Inclusive's distinctive join behaviour.

**Въпросът → Solution Framing.** "Best describes join semantics" — изпитва се knowledge на Inclusive's "smart join."

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Inclusive join е smart (waits only for taken), че Parallel join waits all (deadlocks on untaken), че Exclusive passes one (premature continuation). Това е знание за gateway join semantics.

---

## Question 7: Modeling (Weighting: 15%)

**Scenario:** A document-publishing flow has a **None Throw Intermediate Event** placed between two activities. The new team member asks "Doesn't None Catch do nothing? What's the point of None **Throw**?"

**What does a None Throw Intermediate Event signify?**

- **a)** Like None Catch, **None Throw is a passive marker** — represents a process milestone moment where "something noteworthy happens" but the engine takes no action. Used for documentation / audit trail clarity. The "throw" vs "catch" distinction matters for typed events (Message/Signal/Error/Escalation) where throw fires the event and catch waits for it — but for None, both forms are documentary. Documentation: [None Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/)

- **b)** None Throw triggers a process restart — invented behaviour. Documentation: [None Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/)

- **c)** None Throw silently logs the event to broker logs — partial truth; audit recording is a side effect of normal event passage, not the primary semantic. Documentation: [None Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/)

- **d)** None Throw is equivalent to an End Event — incorrect; None End ends a flow path while None Intermediate Throw is a pass-through marker mid-flow. Documentation: [None Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** For **typed** events (Message, Signal, Error, Escalation), Throw and Catch are functionally distinct: Throw fires the event into the engine; Catch waits to receive a matching event. For **None** events, both are passive markers — visual cues for "something happens here" without engine action. The distinction lives only in shape conventions: None Catch in the middle of a flow indicates a pause-point (often paired with implicit timing context — like the human reader knowing this is when payment arrives); None Throw indicates a milestone reached. Functionally, the engine passes through both without action. Use either for documentation clarity per local team convention.

- **Option b) — Invented.** No restart trigger.

- **Option c) — Partial.** Broker may log event passage; not the primary purpose.

- **Option d) — Wrong scope.** None End terminates a flow path; None Intermediate is a pass-through.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. None Throw е passive marker; functional equivalent to None Catch.
- **b) 1/10** — invented restart behaviour.
- **c) 4/10** — partial; logging е side effect не primary purpose.
- **d) 3/10** — wrong scope distinction.

**Correct Answer:** Passive milestone marker; like None Catch, no engine action — just a documentary cue.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/none-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "None Throw", "what's the point?" Distinction between None Catch and None Throw.

**Въпросът → Solution Framing.** "What does None Throw signify" — изпитва се None-event semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че None events са passive markers, че Throw/Catch distinction matters само за typed events, че None Intermediate е pass-through. Това е знание за None event variants.

---

## Question 8: Modeling (Weighting: 15%)

**Scenario:** A data-import process has a single Task that retries until success: read from an external system, if data isn't ready (returns 404), wait and try again. The retry should continue indefinitely until data is available. The team is considering BPMN's "Standard Loop" marker (a small circular arrow on the Task) as an alternative to Multi-Instance.

**What is the BPMN Standard Loop marker, and how does it differ from Multi-Instance?**

- **a)** **Standard Loop** repeatedly executes the activity while a **loop condition is true**. Like a `while` loop in code — fundamentally different from Multi-Instance (which iterates over a known count/collection). Standard Loop checks the condition before/after each iteration. **Important caveat:** Zeebe's coverage of Standard Loop varies by version — many modellers prefer Multi-Instance with an explicit collection or a BPMN-level loop pattern (e.g., Exclusive Gateway + back-edge to the Task) for clearer semantics. Documentation: [BPMN coverage](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **b)** Standard Loop and Multi-Instance are identical — incorrect; they have distinct semantics. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Standard Loop iterates over a collection — that's Multi-Instance. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Standard Loop is just a visual annotation with no behaviour — incorrect; it represents repeated execution, though Zeebe support varies. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN distinguishes two looping markers:
  - **Standard Loop** (small circular arrow): "while-loop" semantics — repeat the activity while a loop condition is true. Single execution context maintained across iterations.
  - **Multi-Instance** (parallel bars `‖` or sequential bars `=`): instance-per-element over a known collection; each instance is its own execution context.

  Use cases differ: Standard Loop for "retry until success" patterns; Multi-Instance for "iterate over orders." **Caveat:** Camunda 8 / Zeebe's coverage for Standard Loop has historically been limited; in many cases the recommended pattern is explicit BPMN — Exclusive Gateway with a back-edge sequence flow to the Task, with a condition checking "retry?" This is more verbose but unambiguous and well-supported. Always verify the BPMN coverage docs.

- **Option b) — Wrong.** Distinct semantics (condition-based vs collection-based).

- **Option c) — Wrong.** That's Multi-Instance specifically.

- **Option d) — Wrong.** Standard Loop has behavioural semantics; Zeebe's support varies.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Standard Loop е while-loop; Multi-Instance е collection iteration; caveat за Zeebe coverage.
- **b) 2/10** — wrong; distinct semantics.
- **c) 3/10** — describes Multi-Instance.
- **d) 2/10** — wrong; has semantics.

**Correct Answer:** Standard Loop repeats while a condition is true (while-loop); Multi-Instance iterates a collection (foreach). Zeebe coverage varies — often modelled as explicit Gateway + back-edge instead.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Standard Loop marker", "differs from Multi-Instance", "retry until success." Това е въпрос за loop construct types.

**Въпросът → Solution Framing.** "What is Standard Loop and how it differs" — изпитва се knowledge на BPMN looping primitives.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Standard Loop е while-condition, MI е collection-foreach, че Zeebe coverage varies, че explicit Gateway+back-edge е workable alternative. Това е знание за BPMN looping options + practical caveats.

---

## Question 9: Modeling (Weighting: 15%)

**Scenario:** A travel-booking process needs to handle an interesting case: after a customer pays for a trip, **either** the flight gets confirmed OR a "no-availability" message arrives within 30 minutes. The team wants the BPMN to express **race between two specific outcomes**, **then take a different downstream path per outcome**.

**Which BPMN gateway + event pattern fits "race between message and timer, with diverging downstream paths"?**

- **a)** **Event-Based Gateway** with three outgoing paths to events: (1) Intermediate Message Catch ("flight-confirmed"), (2) Intermediate Message Catch ("no-availability"), (3) Intermediate Timer Catch (PT30M). Each event's outgoing arrow leads to a distinct downstream path. The first event to fire wins; the gateway atomically cancels the others. Each downstream path can have its own activities. Documentation: [Event-Based Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/)

- **b)** Exclusive Gateway evaluating a flag variable — wrong trigger model; Exclusive evaluates **data conditions**, not waits for incoming events. Documentation: [Exclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/)

- **c)** Parallel Gateway split + a downstream Exclusive picking based on which event arrived — Parallel runs all branches, including waiting for both events; doesn't express "race." Documentation: [Parallel Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/parallel-gateways/)

- **d)** Two parallel Receive Tasks racing — doesn't have built-in cancellation; both Receive Tasks would run; one would eventually time out without semantics. Documentation: [Receive Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Event-Based Gateway is BPMN's race construct over incoming events. Its semantics: pause execution at the gateway, all outgoing events become "candidate listeners," the first to fire takes its branch, all sibling listeners are atomically cancelled. With three outgoing paths (two messages + one timer), exactly one of the three downstream paths runs based on which event arrived first. Each downstream path is independent — no need for an additional gateway. This is the canonical "race with diverging outcomes" pattern.

- **Option b) — Wrong trigger model.** Exclusive evaluates conditions on data variables — it can't wait for incoming events. You'd have to manually update a variable and then evaluate; that's not the race semantic.

- **Option c) — Wrong semantic.** Parallel split runs both branches; would activate both waiting events simultaneously and wait for both to fire — defeats the "race" intent.

- **Option d) — Wrong primitive.** Multiple Receive Tasks don't have a built-in race semantic.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Event-Based Gateway races events + diverging downstream paths per event.
- **b) 2/10** — Exclusive evaluates data; не waits for events.
- **c) 3/10** — Parallel runs all; defeats race semantic.
- **d) 3/10** — no built-in race on multiple Receive Tasks.

**Correct Answer:** Event-Based Gateway with three outgoing events (two Message Catch + one Timer Catch), each with its own downstream path.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "race between two messages and timer", "diverging downstream paths." Многократен race + per-outcome routing.

**Въпросът → Solution Framing.** "Gateway + event pattern fits race + divergent paths" — изпитва се knowledge на Event-Based Gateway race construct.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Event-Based Gateway е race construct over events, че Exclusive evaluates data, че Parallel runs all, че multiple Receive Tasks нямат native race. Това е знание за event racing patterns.

---

# Section 2 — Configuring Processes (Questions 10-22)

> Weight 22% • Topics: Variable scopes, Headers vs Input Mapping, dynamic retries, Inclusive Gateway with default, dynamic MI, Document Handling, IDP human-in-the-loop, Element Template inheritance, AI Agent prompts, Timer cycles, Message subscription scope, recurring boundary timer, variable serialisation.

---

## Question 10: Configuring Processes (Weighting: 22%)

**Scenario:** A loan-processing BPMN sets `applicationDate` as a process variable at the start. Later in the flow, a Service Task `validate-loan` sets a local input variable `formattedDate` (via Input Mapping) for the worker's use. After the task completes, downstream activities reference `applicationDate`. The team is confirming variable scopes.

**Which is true about `applicationDate` and `formattedDate`?**

- **a)** `applicationDate` is a **process-scoped variable** (visible to all activities in the instance); `formattedDate` is a **task-local variable** (created by Input Mapping, visible only inside the `validate-loan` task). After `validate-loan` completes, `formattedDate` goes out of scope; `applicationDate` remains accessible. Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

- **b)** Both are process-scoped; Input Mapping creates a process variable — incorrect; Input Mapping creates task-local variables. Documentation: [I/O Mapping](https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings)

- **c)** Both are task-local — incorrect; `applicationDate` was set at process start, so it's process-scoped. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Variable scope is undefined in Camunda 8 — incorrect; scopes are explicit and consistently defined. Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 variables have **explicit scopes** following the BPMN scope hierarchy: process root, embedded subprocesses, and individual activities. The scope where a variable is created determines its lifetime and visibility:
  - **Process-scoped** (set at process start, via Output Mapping into process scope, or via API): visible to all activities in the instance.
  - **Task-local** (created by Input Mapping at activation): visible only inside that specific task's scope; discarded when the task completes (unless propagated via Output Mapping).
  - **Subprocess-scoped** (created inside an Embedded Subprocess): visible only inside that subprocess.

  This scoping enables clean separation: task-local for ephemeral computations, process-scoped for persistent state. Output Mapping is the bridge from task-local to higher scope.

- **Option b) — Wrong.** Input Mapping creates task-local variables, not process-scoped.

- **Option c) — Wrong.** `applicationDate` was set at process start; it's process-scoped.

- **Option d) — Wrong.** Scoping is well-defined.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Process-scoped vs task-local; explicit scope rules.
- **b) 3/10** — wrong; Input Mapping = task-local.
- **c) 3/10** — wrong; applicationDate е process-scoped.
- **d) 1/10** — невярно.

**Correct Answer:** applicationDate is process-scoped; formattedDate is task-local (Input Mapping creates task-local).

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "process-scoped vs task-local", "Input Mapping creates", "out of scope after task." Variable scope question.

**Въпросът → Solution Framing.** "True about variables" — изпитва се variable scoping model.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Input Mapping creates task-local, че Output Mapping propagates upward, че process root е outermost scope. Това е знание за variable scope rules.

---

## Question 11: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task `send-email` needs metadata that varies between two cases: instance-specific values (customer email) AND static-per-task config (the email template ID, which is the same for every instance of this task). The team is deciding which metadata mechanism fits each.

**Which is correct about Task Headers vs Input Mapping?**

- **a)** **Task Headers** for static-per-task metadata (template ID, channel name) — set in BPMN model, identical across all instances; the worker reads via `getCustomHeaders()`. **Input Mapping** for dynamic per-instance values (customer email derived from process variables) — FEEL evaluated at activation, exposed as task-local variables. Different mechanisms for different data lifetimes. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Use Task Headers for both — incorrect; Headers are static, can't carry per-instance dynamic values. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Use Input Mapping for both — workable but mixes concerns; Headers are conceptually clearer for static metadata. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Combine static + dynamic in one Header — incorrect; Headers are flat key/value with literal values, no FEEL evaluation. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The semantic distinction:
  - **Task Headers** carry **static metadata** declared at design time — template IDs, channel names, classification tags, etc. They're identical for every instance of this task element. The worker reads them via the activated job's `getCustomHeaders()` map. No FEEL, no per-instance variation.
  - **Input Mapping** evaluates **FEEL expressions at activation** — produces dynamic, per-instance task-local variables. Customer email derived from a process variable would be `Target: customerEmail, Source: =customer.email`.

  Using both side by side keeps concerns separated: static config in Headers, dynamic data in Input Mapping. The worker reads them through different APIs.

- **Option b) — Wrong.** Headers can't carry dynamic values.

- **Option c) — Workable but conflates.** Putting static config in Input Mapping mixes design-time and runtime concerns; Headers express "this is config" clearly.

- **Option d) — Wrong.** Headers don't evaluate FEEL.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Headers = static, Input Mapping = dynamic.
- **b) 3/10** — Headers не carry dynamic; wrong tool.
- **c) 5/10** — workable но conflates concerns.
- **d) 2/10** — Headers са flat literals, не FEEL.

**Correct Answer:** Task Headers for static-per-task config; Input Mapping for dynamic per-instance values.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "static-per-task config" + "instance-specific values" → distinct mechanisms.

**Въпросът → Solution Framing.** "Headers vs Input Mapping" — изпитва се knowledge на metadata mechanisms.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Headers са literal static, че Input Mapping е FEEL dynamic, че worker APIs differ (getCustomHeaders vs getVariables). Това е знание за separation of static config vs dynamic data.

---

## Question 12: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task `external-api-call` has variable retry needs: for some customer tiers (`PREMIUM`) the team wants more retries (5), for standard customers fewer (2). The retry count should be **dynamic per instance** based on the `customer.tier` variable.

**Can the BPMN's `retries` attribute use a FEEL expression for dynamic per-instance retries?**

- **a)** **Yes** — the `zeebe:taskDefinition retries` attribute accepts a **FEEL expression** evaluated at activation. For example: `retries = "= if customer.tier = \"PREMIUM\" then 5 else 2"`. The engine evaluates the expression when the task is activated and sets the job's retries counter to the result. Documentation: [Service Task retries](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **b)** No — retries is a static integer attribute — incorrect; Zeebe supports FEEL in retries. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** Yes, but only with `=` prefix and specific FEEL syntax — partially correct on syntax requirement; the key point is "yes, FEEL is supported." Documentation: [FEEL in BPMN](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Must be static; for per-tier retries, model two separate Service Tasks — over-engineered when FEEL handles it. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe's `zeebe:taskDefinition retries` attribute supports FEEL expressions (with `=` prefix). The engine evaluates the expression at task activation and the resulting number sets the job's initial retries. This allows per-instance retry counts based on any process variable. Practical use cases beyond customer tier: vary retries by priority (`= if priority = "HIGH" then 10 else 3`), by environment (`= if env = "PROD" then 5 else 1`), by retry budget tracking, etc.

  Note: this is a relatively recent capability; if you're on an older Zeebe version, the support may differ. Verify the docs for your version.

- **Option b) — Wrong.** FEEL is supported in many Zeebe BPMN attributes including `retries`.

- **Option c) — Partially correct on syntax.** The `=` prefix is the canonical FEEL expression marker, but the answer's core point (FEEL supported in retries) is the same as (a).

- **Option d) — Over-engineered.** Two Service Tasks with different static retries would require Gateway routing, doubled maintenance. FEEL handles it inline.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. zeebe:taskDefinition retries accepts FEEL expression.
- **b) 2/10** — wrong; FEEL supported.
- **c) 7/10** — partially correct on syntax detail; same idea as (a).
- **d) 3/10** — over-engineered.

**Correct Answer:** Yes — retries accepts a FEEL expression (with `=` prefix) evaluated at activation.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "dynamic per-instance retries", "based on customer tier." FEEL in attribute question.

**Въпросът → Solution Framing.** "Can use FEEL expression for retries" — изпитва се knowledge на FEEL support в Zeebe BPMN attributes.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL се supports в retries, че the engine evaluates at activation, че splitting в separate tasks е over-engineered. Това е знание за FEEL in BPMN attributes.

---

## Question 13: Configuring Processes (Weighting: 22%)

**Scenario:** An Inclusive Gateway has 4 outgoing flows: `=score > 90`, `=score > 70 and customerLoyalty = "GOLD"`, `=specialOffer != null`, and a **default flow**. The team is unclear on when the default flow is taken — only if no other condition matches, or in some other scenario?

**Which best describes Inclusive Gateway default flow behaviour?**

- **a)** Default flow is taken **only if no other outgoing condition evaluates to true**. The engine evaluates all conditioned flows; if any are true, those branches activate; the default is **not taken** in addition. If all conditioned flows are false, the default activates as a fallback. Ensures the gateway always produces at least one outgoing token. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **b)** Default is always taken in addition to any matching conditioned flows — wrong; default is a fallback, not an "always-also" branch. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **c)** Default is taken if exactly one condition matches — incorrect; defaults don't trigger based on match count. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **d)** Default flows aren't allowed on Inclusive Gateways — incorrect; defaults are standard on Exclusive and Inclusive (not on Parallel where all branches always fire). Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Default flow semantic on conditional gateways (Exclusive and Inclusive): "take this flow if no other outgoing flow's condition matched." For Inclusive, this means: evaluate all 3 conditioned flows; if at least one is true, activate those; default is not taken. If all 3 are false, default is taken. The default ensures the gateway always emits at least one token, preventing deadlock when no condition matches.

  Modelling note: the default flow doesn't have a condition expression (it's "no condition"); some modelers indicate it visually with a diagonal slash on the arrow.

- **Option b) — Wrong.** Default is fallback, not always-also.

- **Option c) — Wrong.** Defaults don't track match count.

- **Option d) — Wrong.** Defaults are valid on Inclusive.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Default taken само когато no other condition matches.
- **b) 2/10** — always-also е wrong; defaults са fallbacks.
- **c) 2/10** — invented match-count logic.
- **d) 1/10** — defaults са supported на Inclusive.

**Correct Answer:** Default flow is taken only if no other outgoing condition evaluates to true.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "default flow behaviour", "Inclusive Gateway", "when taken." Default semantic question.

**Въпросът → Solution Framing.** "Describes default behaviour" — изпитва се knowledge на default flow semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че default = fallback when nothing else matches, че defaults са не "always-also" branches, че Exclusive и Inclusive support default. Това е знание за gateway default semantics.

---

## Question 14: Configuring Processes (Weighting: 22%)

**Scenario:** A campaign-execution Multi-Instance Subprocess processes `campaigns`. The team wants the **number of inner instances** to be **dynamic** — based on a FEEL expression that consults process variables at MI activation. For example, `loopCardinality = =if priority = "HIGH" then count(campaigns) else 5`.

**Can `loopCardinality` use a FEEL expression for dynamic instance count?**

- **a)** **Yes** — `loopCardinality` accepts a FEEL expression that evaluates to a number at MI activation. Common patterns: limit by priority, cap by available budget, derive from another collection's size. Note: when combined with `inputCollection`, use either `loopCardinality` (static count) **or** `inputCollection` (iterate the list), not both simultaneously — they're alternative configurations. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** No — `loopCardinality` is a literal integer only — incorrect; FEEL is supported. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Yes, but only basic arithmetic, no function calls — overly restrictive; full FEEL is available. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Must be static at design time; for dynamic counts, build the collection then use `inputCollection` — workable alternative but not the only option. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `loopCardinality` accepts FEEL. Use cases beyond the simple `if`: derive from `count(someList)`, compute from a configuration variable, etc. The evaluation happens once at MI activation; the result is the number of instances. **Important rule:** `loopCardinality` and `inputCollection` are mutually exclusive — pick one. With `loopCardinality`, you typically don't have an `inputElement` (no list to iterate); inner instances are spawned by count, and `loopCounter` identifies them.

- **Option b) — Wrong.** FEEL supported.

- **Option c) — Wrong.** Full FEEL available.

- **Option d) — Workable but not the only option.** Building a collection then iterating with `inputCollection` is an alternative, but `loopCardinality` with FEEL handles the simpler case directly.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. loopCardinality accepts FEEL; alternative to inputCollection.
- **b) 2/10** — wrong; FEEL supported.
- **c) 3/10** — restrictively wrong; full FEEL.
- **d) 5/10** — workable alternative но не only option.

**Correct Answer:** Yes — loopCardinality accepts a FEEL expression evaluated at MI activation.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "dynamic instance count", "FEEL expression for loopCardinality." MI dynamic count question.

**Въпросът → Solution Framing.** "Can use FEEL for loopCardinality" — изпитва се knowledge на MI attribute FEEL support.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че loopCardinality accepts FEEL, че те и inputCollection са mutually exclusive, че full FEEL е available. Това е знание за MI configuration.

---

## Question 15: Configuring Processes (Weighting: 22%)

**Scenario:** A document-management process uploads files via Document Handling. The team has practical concerns about **document size limits** — they handle some very large files (200 MB legal contracts) and want to know the design guidance.

**What's the recommended design guidance regarding Document Handling and file sizes?**

- **a)** **Camunda 8 Document Handling supports varying file sizes depending on the storage backend** configuration (in-memory dev, S3 prod, etc.). Best practice: **don't pass large files as process variables** (that would bloat broker state); use Document Handling to store the binary externally and pass only the **document reference** in process variables. For very large files (>100 MB), use cloud storage with multipart upload directly to S3 / object storage and let Camunda Documents reference it. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **b)** Camunda has a hard 10 KB limit on documents — invented limit; Document Handling supports varied sizes per storage backend. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **c)** Always inline files into BPMN — never; bloats broker state. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Document Handling supports unlimited files with no design considerations — overly optimistic; practical limits exist per deployment. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Document Handling's value proposition is exactly this: separate large binary content from process state. The broker's state remains small (just references); the binaries live in configurable storage backends (in-memory for dev, S3 / object storage / file system for production). Best practice: never embed large binaries in process variables; always use Document Handling references. For very large files, design the upload to go directly to your storage backend (multipart S3 upload) and have Camunda's Document Handling reference the result.

- **Option b) — Invented limit.** No hard 10 KB; that would be impractical.

- **Option c) — Anti-pattern.** Inlining large binaries kills broker performance.

- **Option d) — Overly optimistic.** Always design with storage backend capacity in mind.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Document Handling separates binaries from state; use references, large files via direct storage upload.
- **b) 1/10** — invented limit.
- **c) 1/10** — anti-pattern.
- **d) 3/10** — overly optimistic.

**Correct Answer:** Use Document Handling for binary storage; pass references in variables; for very large files, upload directly to backend storage.

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/document-handling/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "very large files", "200 MB", "design guidance." Document size design pattern.

**Въпросът → Solution Framing.** "Recommended guidance" — изпитва се knowledge на Document Handling architecture + best practice.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Document Handling decouples binaries from state, че inline бы bloat broker, че storage backend варира configurations. Това е знание за Document Handling design.

---

## Question 16: Configuring Processes (Weighting: 22%)

**Scenario:** An IDP-based invoice-processing flow has extraction confidence around 92% across fields. The team wants a **human-in-the-loop** validation step for edge cases — when confidence is low, route to a User Task showing the extracted data + original document for review, allowing the human to correct any field before continuing.

**Which BPMN pattern implements "IDP → conditional human review → continue"?**

- **a)** IDP Task → Exclusive Gateway (`=every f in fields satisfies f.confidence >= threshold`) → if all-confident, automated path; if any low, **User Task** displaying the extracted fields (via a Camunda Form bound to the IDP result) and the document (via Document Handling reference), letting the human edit fields, then continue. The corrected values overwrite the IDP results downstream. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/) + [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** IDP only — no human review possible — incorrect; human-in-the-loop is a common IDP pattern. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **c)** Always route everything to human review (no automation) — defeats IDP value. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **d)** IDP automatically routes to human review based on a global threshold — IDP exposes confidence but routing is BPMN-side concern. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Human-in-the-loop IDP is a canonical BPMN pattern. IDP extracts → confidence evaluation at gateway → if all confident, fully automated; if any low, User Task for review. The User Task's Camunda Form is bound to the extracted fields (pre-populated from IDP result); the form lets the human inspect and correct. The Form also shows the original document (via Document Handling reference / file picker preview). On task complete, the corrected values write back to process scope; downstream continues with the human-verified data.

  Design refinements: per-field confidence thresholds (different fields need different sensitivity); audit logging of human corrections (for training future IDP iterations); analytics on which fields get corrected most often (informing IDP model retraining).

- **Option b) — Incorrect.** Human review is achievable via BPMN-level pattern.

- **Option c) — Defeats automation.** All-human defeats IDP's value.

- **Option d) — Wrong layer.** IDP extracts; BPMN routes.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. IDP → confidence gateway → conditional User Task → continue.
- **b) 1/10** — wrong; HITL achievable.
- **c) 2/10** — defeats automation.
- **d) 3/10** — wrong layer; IDP не routes.

**Correct Answer:** IDP → confidence gateway → User Task with form pre-populated from IDP result → continue with corrections.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/idp/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "human-in-the-loop", "low confidence", "edit fields then continue." IDP HITL pattern.

**Въпросът → Solution Framing.** "BPMN pattern implements" — изпитва се IDP + User Task + Form composition.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че IDP exposes per-field confidence, че BPMN gateway routes, че User Task + Form е HITL UI, че corrections write back. Това е знание за HITL pattern.

---

## Question 17: Configuring Processes (Weighting: 22%)

**Scenario:** A team has a base Connector Element Template for "Generic REST Call" with common properties (URL, method, headers). They want to create a **specialised "Slack POST" template** that extends the base, adding Slack-specific defaults (channel parameter, specific authentication).

**Does Element Template support inheritance / extension?**

- **a)** **Element Templates don't have first-class inheritance** in the JSON schema sense. The practical pattern: **duplicate the base template's properties** and customise; or use shared snippets (where supported). Some Web Modeler versions support template-extending or template-overriding mechanisms — verify the current schema docs. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **b)** Yes — use `extends: "generic-rest-template-id"` in the JSON — invented attribute; not standard. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **c)** Yes — Element Templates are object-oriented with class inheritance — overstates; the schema doesn't model OOP. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **d)** No, templates are isolated; no extension at all — partially correct; the practical answer is "duplicate-and-customise" rather than first-class inheritance. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Element Templates are JSON documents describing properties and bindings for a specific BPMN element type. The schema doesn't define a formal inheritance / extension primitive. In practice, teams handle reuse by:
  - **Duplicating** the base template's JSON and customising for each specialisation (verbose but explicit).
  - **Composing JSON snippets** via build-time tooling (if your workflow includes preprocessing).
  - **Maintaining a base + variants** with shared groups / shared property definitions copied across.

  Some Web Modeler tooling may offer template-management features (publishing variants, etc.) — verify the current docs for tooling-level support. The practical answer in 2025-era Camunda 8: no first-class inheritance; manage variants via duplication or generation.

- **Option b) — Invented attribute.** No `extends` field.

- **Option c) — Overstates.** Element Templates are JSON schema, not OOP.

- **Option d) — Partially correct.** "No first-class extension" is accurate but the practical answer adds the duplicate-and-customise workflow.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. No first-class inheritance; practical = duplicate + customise.
- **b) 2/10** — invented attribute.
- **c) 2/10** — overstates.
- **d) 6/10** — partially correct; (a) gives the practical workflow.

**Correct Answer:** No first-class inheritance; practical approach is to duplicate the base template and customise.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "specialised template extending base", "Slack POST specialisation." Template reuse question.

**Въпросът → Solution Framing.** "Supports inheritance / extension" — изпитва се knowledge на Element Template schema + reuse patterns.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че templates са JSON without inheritance primitive, че duplication е practical, че tooling може да offers variants. Това е знание за template architecture.

---

## Question 18: Configuring Processes (Weighting: 22%)

**Scenario:** An AI Agent Connector orchestrates a customer-service agent. The team needs to configure the **system prompt** — the persistent instructions that shape the agent's behaviour ("You are a helpful customer-service agent. Be polite. Don't make refund commitments without checking policy.").

**Where is the system prompt configured in the AI Agent Connector?**

- **a)** **As a property of the AI Agent Connector** — typically a `systemPrompt` (or similar) field in the property panel. Accepts a string, often supporting FEEL templating for dynamic insertion (e.g., customer name into prompt). Configured per Service Task instance of the AI Agent. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **b)** As a constant in the LLM provider's account — incorrect; system prompt is process-specific, not global. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **c)** As a separate deployed resource — partial; some agentic patterns use external prompt management, but the Connector property is the canonical Camunda-side configuration. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **d)** Hardcoded in the Connector's Java source — wrong layer; the Connector reads its prompt from configuration. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** AI Agent Connectors expose configuration properties for the agent's behaviour: `systemPrompt` (instructions for the LLM), `model` (which LLM to use), `temperature` (creativity / determinism balance), `maxTokens` (response length cap), `apiKey` (via secrets), etc. The system prompt typically supports FEEL templating so dynamic content (customer name, conversation history, business rules) can be injected at activation time. Multiple Service Task instances of the same AI Agent can use different prompts (variant agents) by setting different property values.

- **Option b) — Wrong scope.** LLM provider accounts typically don't have a "global system prompt" — prompts are per-request.

- **Option c) — Partial.** Advanced setups may externalise prompts; the Connector property is the standard Camunda path.

- **Option d) — Wrong layer.** Connector reads from configuration, not hardcoded.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. systemPrompt property on AI Agent Connector; FEEL templating supported.
- **b) 2/10** — wrong scope.
- **c) 5/10** — partial alternative.
- **d) 1/10** — wrong layer.

**Correct Answer:** As a property of the AI Agent Connector (e.g., `systemPrompt`); often supports FEEL templating.

**Official Documentation Link:** https://docs.camunda.io/docs/components/agentic-orchestration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "system prompt", "shape agent behaviour", "persistent instructions." AI Agent configuration question.

**Въпросът → Solution Framing.** "Where configured" — изпитва се knowledge на AI Agent Connector property model.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Connector exposes properties like systemPrompt / model / apiKey, че FEEL templating е supported, че hardcoding е wrong layer. Това е знание за AI Agent configuration.

---

## Question 19: Configuring Processes (Weighting: 22%)

**Scenario:** A daily-report process should run **at most 30 times** (a month of reports), then stop. The team configures a Start Event Timer Cycle. They write `R30/PT24H` and wonder if this is correct.

**What does the cycle `R30/PT24H` express?**

- **a)** **"Repeat 30 times, every 24 hours"** — bounded ISO 8601 repeating interval. The cycle fires 30 times total, each 24 hours after the previous, then stops. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** "Wait 30 hours, then repeat every 24 hours unbounded" — wrong parse; `R30` is "30 repetitions," not "30 hours wait." Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** "Repeat unbounded, every 30 hours, with 24h additional" — invented parse. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Cycle syntax must include start time; `R30/PT24H` is incomplete — partial truth depending on engine strictness; many engines accept `R[n]/[duration]` without explicit start, anchoring at deployment/instance start time. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** ISO 8601 repeating interval format: `R[n]/[start]/[interval]` (with optional start). `R30/PT24H` reads as "30 repetitions / 24-hour duration interval." The cycle fires 30 times, 24 hours apart, then completes. Bounded by `R30`. The unbounded form is `R/PT24H` (no number after R) — repeat indefinitely.

  Note: when start is omitted, the engine typically anchors at the moment of activation (instance start or deployment time, depending on context). For deterministic start, include the start: `R30/2026-06-01T09:00:00Z/PT24H`.

- **Option b) — Wrong parse.** R30 = 30 reps, not 30 hours.

- **Option c) — Invented.** Not how ISO 8601 cycles parse.

- **Option d) — Partial.** Some implementations require start, others anchor at activation. The expression `R30/PT24H` is generally accepted in Zeebe.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. R30 = 30 repetitions; PT24H = 24-hour interval.
- **b) 2/10** — wrong parse of R30.
- **c) 1/10** — invented.
- **d) 4/10** — partial; some engines require start.

**Correct Answer:** Repeat 30 times, every 24 hours (R[n]/[interval] = n repetitions).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "at most 30 times", "every 24 hours". ISO 8601 cycle bounded.

**Въпросът → Solution Framing.** "What R30/PT24H expresses" — изпитва се ISO 8601 cycle syntax.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че R[n]/[interval] = n repetitions of interval, че R е bounded когато followed by number. Това е знание за ISO 8601 cycle format.

---

## Question 20: Configuring Processes (Weighting: 22%)

**Scenario:** A process has a **Message Boundary Event** attached to a User Task `manual-review`. The boundary catches message `"REVIEW_TIMEOUT"`. The team is curious about the **scope and lifetime** of this subscription — when does Zeebe create it, when does it end?

**When is the Message Boundary subscription active?**

- **a)** The subscription is **active while the host User Task is active** — created when the User Task activates (so messages published before the task starts won't correlate to this instance, unless using TTL buffering), destroyed when the User Task completes or is cancelled. The subscription is **scoped to the activity's lifetime**. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/) + [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **b)** Subscription persists for the entire process instance lifetime — wrong scope; boundary subscriptions are activity-scoped, not instance-scoped. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** Subscription exists at the cluster level for all instances — wrong scope; per-instance. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **d)** Subscription is one-shot — created on first message, destroyed after — incorrect; the subscription waits for messages, doesn't disappear after one. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Boundary Event subscriptions are scoped to the activity they're attached to. Lifecycle:
  - **Creation:** when the host activity activates (e.g., User Task is offered to assignee).
  - **Active:** while the host is in progress, the subscription listens for matching messages (name + correlation key match).
  - **Destruction:** when the host completes, is cancelled, or the boundary fires (in interrupting case).

  Important implications:
  - Messages published **before** the activity activates won't correlate (unless message TTL is set high enough that they're still buffered when the activity activates).
  - Messages published **after** the activity completes won't correlate (no subscription exists).
  - The team should consider publish timing carefully relative to expected activation timing.

- **Option b) — Wrong scope.** Process-instance scope would be a different construct (e.g., Event Subprocess with Message Start, which is process-instance-wide).

- **Option c) — Wrong scope.** Subscriptions are per-instance.

- **Option d) — Wrong lifecycle.** Subscription waits for matching messages indefinitely (while activity is active).

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Subscription scoped to activity lifetime: activate → listen → destroy on completion/cancel.
- **b) 3/10** — wrong scope; would be Event Subprocess Message Start.
- **c) 2/10** — wrong scope; per-instance not cluster.
- **d) 3/10** — wrong lifecycle; subscription persists during host active.

**Correct Answer:** Subscription is active while the host User Task is active; created on activation, destroyed on completion / cancellation.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Message Boundary subscription", "scope and lifetime", "when active." Subscription lifecycle question.

**Въпросът → Solution Framing.** "When active" — изпитва се knowledge на boundary subscription scope.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че boundary subscriptions са activity-scoped, че they create on activation + destroy on completion, че messages před activation не correlate (unless buffered via TTL). Това е знание за subscription lifecycle.

---

## Question 21: Configuring Processes (Weighting: 22%)

**Scenario:** A daily-summary report process has a Service Task that runs every morning at 7 AM. The team has a Timer Start Event with cycle `0 0 7 * * *` (cron syntax). They observe the report fires correctly but want to **also enable a one-off ad-hoc trigger** for end-users to start the process manually outside the schedule.

**How can a process support both scheduled (Timer Start) AND ad-hoc (API-triggered) starts?**

- **a)** Add **multiple Start Events**: one Timer Start (for the daily schedule) and one **None Start** (for the ad-hoc API trigger). Both Start Events lead into the same downstream flow. The API call `POST /v2/process-instances` with no message correlation triggers the None Start. The two paths converge naturally (or are explicitly joined). Documentation: [BPMN Start Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/) + [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** A process can only have one Start Event — incorrect; BPMN supports multiple Start Events, each a separate entry trigger. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **c)** Use a Message Start Event instead of Timer — would shift the trigger model entirely; both schedule AND ad-hoc API would have to use messages. Workable but option (a) cleanly separates trigger types. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **d)** Deploy two separate process definitions — overkill; one process with two Start Events handles both triggers. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN supports multiple Start Events of different types in a single process. Each is a distinct entry trigger:
  - **None Start** is triggered by an explicit API call (`POST /v2/process-instances` with process ID).
  - **Timer Start** fires on the configured schedule (the engine creates instances at the timer's tick).
  - **Message Start** is triggered by a published message matching the start event's name.

  Different Start Events can lead into the same downstream flow, or different paths (e.g., the ad-hoc path skips a "schedule-validation" step). The process model unifies both trigger sources behind a single executable definition.

- **Option b) — Wrong.** Multiple Start Events supported.

- **Option c) — Workable but conflates.** Forcing all triggers through Messages adds correlation overhead and shifts the ad-hoc API contract.

- **Option d) — Overkill.** Two definitions for two trigger types of one process is fragmented.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple Start Events (None + Timer) in one process; unified downstream.
- **b) 1/10** — wrong; multiple supported.
- **c) 4/10** — workable но conflates trigger model.
- **d) 3/10** — overkill.

**Correct Answer:** Use multiple Start Events: one Timer Start (scheduled) and one None Start (API-triggered) leading into the same flow.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/none-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "scheduled AND ad-hoc starts", "two trigger types." Multi-start-event pattern.

**Въпросът → Solution Framing.** "Support both" — изпитва се knowledge че BPMN supports multiple Start Events.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BPMN supports multiple Start Events, че None Start е API trigger, че Timer Start е schedule trigger, че unified downstream е cleaner. Това е знание за multi-trigger processes.

---

## Question 22: Configuring Processes (Weighting: 22%)

**Scenario:** A team's process variables include complex nested structures: `customer = {profile: {name, age}, orders: [...]}`. They wonder about the **serialisation format** Zeebe uses internally — JSON, Protobuf, XML, custom?

**What is the serialisation format for Camunda 8 process variables?**

- **a)** **JSON** — Camunda 8 process variables are JSON-typed: scalars (number, string, boolean), null, lists (`[]`), objects/contexts (`{}`). Nested structures work naturally. FEEL navigates them with dot/bracket access. Internally, Zeebe stores variables in efficient binary form (likely MessagePack or similar for performance), but the API contract and conceptual model is JSON. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **b)** XML — incorrect; Camunda 8 uses JSON for variables (XML is for the BPMN model definition itself). Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Protocol Buffers — partial truth; gRPC messages use Protobuf, but variables themselves are JSON-typed in the contract. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Custom Camunda-specific format — incorrect; the conceptual model is JSON. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8's variable model is JSON. The API contract: send variables as JSON in REST calls; gRPC encodes them via Protobuf wrappers but the conceptual content is JSON. FEEL operates on JSON-shaped data: scalars, lists, contexts (objects). Nesting works naturally — `customer.profile.name` navigates the structure. The internal broker storage may use a more compact representation for performance, but that's an implementation detail; the contract is JSON.

- **Option b) — Wrong.** XML is for BPMN model definitions, not variables.

- **Option c) — Partial.** gRPC uses Protobuf for transport encoding of the call envelope, but variable content is JSON-typed.

- **Option d) — Wrong.** Standard JSON, not custom.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. JSON е the contract; internal binary е implementation detail.
- **b) 1/10** — wrong; XML е for BPMN model not variables.
- **c) 4/10** — partial; gRPC transport е Protobuf но content е JSON.
- **d) 2/10** — wrong; standard JSON.

**Correct Answer:** JSON — scalars, lists, and objects; FEEL navigates naturally with dot/bracket access.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "serialisation format", "nested structures." Variable encoding question.

**Въпросът → Solution Framing.** "Serialisation format" — изпитва се knowledge на C8 variable model.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че variables са JSON-typed, че XML е за BPMN models, че Protobuf е gRPC transport не variable content. Това е знание за variable serialisation.

---

# Section 3 — Decisions & DMN (Questions 23-29)

> Weight 11% • Topics: PRIORITY semantics, input expression vs input entry, context expressions, string outputs, boxed lists, DMN versioning, DMN Tester.

---

## Question 23: Decisions & DMN (Weighting: 11%)

**Scenario:** A risk-assessment DMN table has output column `riskLevel` with a value list defining priority order: `["EXTREME", "HIGH", "MEDIUM", "LOW", "NONE"]`. Multiple rules can match. The team wants to return the **single highest-priority risk** — if rules match outputs `MEDIUM` and `HIGH`, return `HIGH` (because `HIGH` appears earlier in the priority list).

**Which hit policy fits "single highest-priority output"?**

- **a)** **PRIORITY** — among matching rules, the engine picks the one whose output value appears **earliest in the output's value list** (highest priority). Returns a single value. Designed exactly for this "highest-of-many" pattern with explicit priority ordering. Documentation: [DMN Hit Policies](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** **FIRST** — returns the first matching rule by **row order**, not output priority. Different ordering basis. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** **OUTPUT ORDER** — returns a **list** of matching outputs ordered by priority. Caller would have to pick the first element. PRIORITY returns the single value directly. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** **UNIQUE** — requires exactly one match; multiple matches error. Wrong intent (multiple matches expected). Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** PRIORITY hit policy uses the output column's value list ordering to determine priority. Earlier values = higher priority. Among all matching rules, the engine picks the one whose output is highest-priority. Returns single value. Perfect for "select the most severe / most preferred / most urgent." Distinct from FIRST (row order) and OUTPUT ORDER (returns list).

  Important detail: the output column **must have a value list** (allowed values) for PRIORITY to use; the order in that list defines priority. Without a value list, PRIORITY can't determine ordering.

- **Option b) — Different basis.** FIRST orders by row position in the table; PRIORITY orders by output value position in the value list. They produce different results when rules are ordered differently than their outputs' priorities.

- **Option c) — Returns list.** OUTPUT ORDER gives the full list ordered by priority; caller picks first. PRIORITY does the picking inside DMN.

- **Option d) — Wrong intent.** UNIQUE forbids multiple matches.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. PRIORITY uses output value list ordering; returns single highest.
- **b) 4/10** — FIRST е row-order based, не output-priority.
- **c) 5/10** — OUTPUT ORDER returns list; PRIORITY е directer for single value.
- **d) 2/10** — UNIQUE forbids multi-match; wrong intent.

**Correct Answer:** PRIORITY hit policy — uses output value list ordering; returns the single highest-priority matching value.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "single highest-priority output", "explicit priority list." PRIORITY hit policy.

**Въпросът → Solution Framing.** "Fits single highest-priority" — изпитва се knowledge на PRIORITY semantic.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че PRIORITY uses output value list, че FIRST uses row order, че OUTPUT ORDER returns list. Това е знание за PRIORITY distinctness.

---

## Question 24: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN decision table has 5 columns. The team distinguishes between the column **header** (defining what the column represents — e.g., `customerAge`, `applicationDate`) and the **rule cells** (the input entries per rule — e.g., `> 65`, `< date("2025-01-01")`). They want to understand the formal DMN terminology.

**What's the formal distinction between "input expression" and "input entry" in DMN?**

- **a)** **Input expression** = the column header's FEEL expression (typically just a variable name like `customerAge`, but can be any FEEL expression like `customer.age * 12`). Evaluated once at decision evaluation. **Input entry** = the cell in each rule for that column — a **unary test** (e.g., `> 65`, `[18..65]`, `"VIP"`). For each rule, the input entry is tested against the input expression's value; if all entries in a rule match, the rule matches. Documentation: [DMN Decision Table](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** They're synonymous — incorrect; they refer to distinct parts of the table. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** Input expression is the rule cell; input entry is the header — reversed; standard terminology has them the other way. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** Input entry is the type, input expression is the name — wrong concept entirely. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN's formal vocabulary:
  - **Input expression** (column header): a FEEL expression evaluated to produce a value. Often just a variable reference (`customer.age`), but can be any FEEL expression. Evaluated once per decision invocation; its result is what input entries test against.
  - **Input entry** (rule cell): a **unary test** — a FEEL construct that's not a full expression but a test. Forms: comparison operators (`> 65`), ranges (`[18..65]`), value match (`"VIP"`), negation (`not("VIP")`), disjunction (comma-separated alternatives), the wildcard `-` (always matches), etc.

  This distinction matters: input entries follow unary test syntax, which is more restrictive than full FEEL expressions. You can't put any arbitrary FEEL in a rule cell — only unary tests.

- **Option b) — Wrong.** Distinct concepts.

- **Option c) — Reversed.** Standard terminology has expression at header, entry in rule cell.

- **Option d) — Wrong concept.** Not about type vs name.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Input expression = header FEEL; input entry = rule cell unary test.
- **b) 2/10** — synonymous е wrong.
- **c) 3/10** — reversed.
- **d) 1/10** — wrong concept.

**Correct Answer:** Input expression = column header (FEEL expression); input entry = rule cell (unary test).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "column header vs rule cells", "formal DMN terminology." Vocabulary question.

**Въпросът → Solution Framing.** "Distinction" — изпитва се DMN formal vocabulary.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че input expression е header (full FEEL), че input entry е rule cell (unary test), че unary tests са restricted FEEL subset. Това е знание за DMN structure terminology.

---

## Question 25: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN decision uses a **Boxed Context** expression to compute a derived value — combining multiple intermediate calculations into a single decision output. The team has seen "Context" in DMN tooling but isn't clear on its purpose.

**What is a DMN Boxed Context expression?**

- **a)** A **structured FEEL expression** consisting of named entries (key-value pairs) where each entry computes a sub-expression; the final entry (or named "final result") becomes the decision's output. Used for **decompositional logic** — break a complex calculation into named intermediate steps within a single decision. Reads like local variables in code. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/) + [FEEL context](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** A wrapper around a decision table for tooling reasons — incorrect; Context is a distinct expression type, not a wrapper. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** A namespace for DMN decisions — wrong concept; Context isn't a namespace. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Context is the calling BPMN process — confuses DMN's "Context" expression with the concept of "execution context." Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN supports multiple decision body types: Decision Table, Literal Expression, **Boxed Context**, Boxed Invocation (BKM call), Boxed List (more on these below). A **Boxed Context** is a list of named entries, each computing a sub-result via FEEL. Conceptually like a context object `{step1: ..., step2: ..., final: ...}` where the named entries become locally-bound names for use in subsequent entries. The final result is either the last entry's value or an entry explicitly designated as the result.

  Use case: a complex pricing calculation broken into "base price," "tax," "discount," "shipping," "total" — each computed step-by-step in a single Context expression. Easier to read than a single nested FEEL expression.

- **Option b) — Wrong concept.** Context isn't a wrapper.

- **Option c) — Wrong concept.** Not a namespace.

- **Option d) — Wrong concept.** Confuses DMN-Context (expression type) with BPMN-context (execution).

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Boxed Context = decomposed FEEL with named intermediate steps.
- **b) 2/10** — wrong concept.
- **c) 1/10** — wrong concept.
- **d) 2/10** — confuses with execution context.

**Correct Answer:** A structured FEEL expression with named entries computing sub-results; useful for decomposing complex calculations.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Boxed Context expression", "intermediate calculations." DMN expression type question.

**Въпросът → Solution Framing.** "What is Boxed Context" — изпитва се DMN expression types.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN supports multiple decision bodies (Table, Literal, Context, Invocation, List), че Context decomposes complex FEEL. Това е знание за DMN expression types.

---

## Question 26: Decisions & DMN (Weighting: 11%)

**Scenario:** A welcome-message DMN constructs a personalised greeting: "Hello, [name], your status is [tier]." The output is a single string composed from inputs. The team is constructing the output entry as a FEEL expression.

**Which FEEL syntax composes the greeting string?**

- **a)** **String concatenation** with `+`: `="Hello, " + name + ", your status is " + tier + "."`. FEEL's `+` operator concatenates strings (also adds numbers; type-context determines behaviour). Documentation: [FEEL string](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **b)** Template literal `=`Hello, ${name}...`` — JS/Kotlin reflex; not FEEL syntax. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `=concat("Hello, ", name, ", your status is ", tier, ".")` — invented variadic; FEEL uses `+` for concatenation or `string join(list, sep)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Use a Boxed Context to assemble the string — over-engineered; simple `+` chain works inline. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's `+` operator overloads: between numbers it's addition, between strings it's concatenation. Construct multi-piece strings by chaining `+`. The values being concatenated must be strings; if any are not (e.g., numbers), use `string(value)` to convert: `="You owe " + string(amount) + " EUR."`. Otherwise FEEL may complain about type mismatch.

- **Option b) — Wrong syntax.** Template literals are JS/Kotlin/Python features; FEEL uses `+`.

- **Option c) — Invented function.** `concat` isn't a FEEL string built-in; `string join` exists for joining a list with a separator.

- **Option d) — Over-engineered.** Boxed Context for a single string concatenation is excessive.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `+` concatenates strings in FEEL.
- **b) 2/10** — template literal не FEEL syntax.
- **c) 3/10** — invented function.
- **d) 3/10** — over-engineered.

**Correct Answer:** Use `+` for string concatenation: `="Hello, " + name + ", your status is " + tier + "."`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "compose greeting string from inputs", "FEEL output." String concatenation in DMN output.

**Въпросът → Solution Framing.** "Syntax composes string" — изпитва се FEEL string concatenation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че `+` overloads на FEEL (number=add, string=concat), че template literals са JS, че concat() не съществува. Това е знание за FEEL string composition.

---

## Question 27: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN decision needs to return **a fixed list of strings**: `["VIP", "ESCALATED", "PRIORITY"]` regardless of input. The team is choosing between a decision body type.

**Which DMN body type fits "return a fixed list"?**

- **a)** **Boxed List** expression — a DMN body type that produces a list value. List items can be FEEL expressions or literal values. For a fixed list, the items are literal strings. Alternative: a **Literal Expression** body with FEEL `=["VIP", "ESCALATED", "PRIORITY"]` works equally — both produce the list. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Decision Table with one row — overkill for a fixed list; Boxed List or Literal Expression are simpler. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** Boxed Context — wrong shape; Context returns a single value (often built from sub-entries), not a list. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** DMN can't return fixed lists — incorrect; multiple body types support list output. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Boxed List** is a DMN body type specifically for list outputs. Items can be literals or FEEL expressions. For pure fixed lists, both Boxed List and Literal Expression (`=["item1", "item2"]`) work. Boxed List is more visually structured (each item in its own row in the modeler); Literal Expression is one-line. Use either based on team preference and list complexity.

- **Option b) — Overkill.** Decision Table with one row is overkill for a constant output.

- **Option c) — Wrong shape.** Context returns single composite value, not list.

- **Option d) — Wrong.** Lists are supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Boxed List or Literal Expression both work.
- **b) 4/10** — overkill за fixed output.
- **c) 3/10** — wrong shape.
- **d) 1/10** — wrong; lists supported.

**Correct Answer:** Boxed List expression (or Literal Expression with `=[item1, item2, ...]`).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "return fixed list of strings", "regardless of input." DMN body type for list output.

**Въпросът → Solution Framing.** "Body type fits fixed list" — изпитва се knowledge на DMN expression types.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Boxed List и Literal Expression и са valid за list outputs, че Decision Table е overkill, че Context returns single value. Това е знание за DMN body types.

---

## Question 28: Decisions & DMN (Weighting: 11%)

**Scenario:** A team deploys DMN `pricing-rules-v1` and runs 200 instances. Later, the team deploys `pricing-rules-v2` with refined logic. The 200 running instances are mid-execution — they have already cached the v1 result for their decision step.

**What happens to running instances when DMN is re-deployed with a new version?**

- **a)** Running instances **continue to reference the version they invoked**. If an instance has already evaluated `pricing-rules-v1`, its cached result remains valid. If an instance hasn't yet reached the decision step, it evaluates against the **version pinned at process activation** (typically the latest at activation time, but the pinning happens at evaluation, not later). For new instances starting after v2 deployment, they invoke v2. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/) + [Versioning](https://docs.camunda.io/docs/components/concepts/process-instance-versioning/)

- **b)** All instances auto-migrate to v2 — incorrect; no auto-migration. Versioning preserves running instances. Documentation: [Versioning](https://docs.camunda.io/docs/components/concepts/process-instance-versioning/)

- **c)** Running instances fail because v1 was replaced — incorrect; v1 remains accessible. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** DMN doesn't support versioning — incorrect; DMN supports versions like BPMN. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN versioning follows similar principles to BPMN versioning. Each deployed DMN is a version; older versions remain accessible. A process invoking a DMN by `decisionId` typically gets the latest version at invocation time. Once a DMN has been evaluated for an instance, the result is recorded in the instance's history (Operate Decision Instance view); the cached result remains stable. New instances starting after v2 deployment get v2 logic when they reach the decision step.

  Important nuance: the exact version-binding semantics (latest at activation vs latest at evaluation) depend on the specific Zeebe and runtime version; verify the docs. The key principle is "running instances aren't disrupted by re-deployments."

- **Option b) — Wrong.** No auto-migration.

- **Option c) — Wrong.** v1 remains accessible.

- **Option d) — Wrong.** DMN supports versions.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Versioning preserves running; new instances get latest.
- **b) 2/10** — no auto-migration.
- **c) 2/10** — v1 remains.
- **d) 1/10** — DMN supports versions.

**Correct Answer:** Running instances continue with the version they invoked / cached; new instances after v2 use v2.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/process-instance-versioning/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "running instances", "DMN re-deployed", "v1 to v2." DMN versioning behaviour.

**Въпросът → Solution Framing.** "What happens to running" — изпитва се versioning model.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че versioning preserves running instances, че няма auto-migration, че DMN supports versions like BPMN. Това е знание за versioning principles.

---

## Question 29: Decisions & DMN (Weighting: 11%)

**Scenario:** A team has developed a DMN with 50 rules. They want to **test individual rules** in isolation — provide input values, see which rule fires, see the result — without going through a full BPMN process invocation. They want a quick feedback loop during development.

**Which Camunda 8 tool supports DMN-only testing?**

- **a)** **DMN Tester / Test Run feature in Web Modeler** — supplies test inputs, sees which rule fires, the output. Available within the Web Modeler DMN editor. Or use the **Evaluate Decision REST API endpoint** (POST `/v2/decision-definitions/evaluation`) to evaluate the DMN directly with test inputs from curl/Postman. Both bypass BPMN orchestration. Documentation: [DMN Tester](https://docs.camunda.io/docs/components/modeler/dmn/) + [Evaluate Decision API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/)

- **b)** Tasklist — wrong tool; Tasklist is for User Tasks. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **c)** Only by starting a full BPMN process — slower feedback loop; defeats the "quick test" intent. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** DMN testing isn't supported — incorrect; both Web Modeler and REST API support it. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler's DMN editor typically includes a "Test" or "Play" feature where modelers can supply input values, run the DMN, see which rules fire and the output. Quick feedback loop for development. For programmatic / CI testing, the REST API's evaluate-decision endpoint accepts inputs and returns outputs without needing a BPMN process. Combine both: Web Modeler for interactive design-time testing; REST API for automated test suites.

- **Option b) — Wrong tool.** Tasklist scope.

- **Option c) — Slower.** Full BPMN invocation is unnecessary for unit-testing DMN.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Web Modeler DMN Tester + REST evaluate-decision endpoint.
- **b) 1/10** — wrong tool.
- **c) 4/10** — works но slow feedback.
- **d) 1/10** — wrong.

**Correct Answer:** DMN Tester in Web Modeler (interactive) + Evaluate Decision REST API (programmatic).

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "test individual rules", "quick feedback loop", "without BPMN." DMN testing question.

**Въпросът → Solution Framing.** "Tool supports DMN-only testing" — изпитва се knowledge на DMN tester + REST evaluate endpoint.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler има DMN Tester, че REST API exposes evaluate-decision endpoint, че BPMN invocation е slow feedback. Това е знание за DMN testing tools.

---

# Section 4 — Configuring Forms (Questions 30-32)

> Weight 5% • Topics: Read-only computed fields, nested variable binding, dynamic list columns.

---

## Question 30: Configuring Forms (Weighting: 5%)

**Scenario:** An insurance-quote Form shows the customer's `monthlyPremium` as a **read-only computed field** — the value derives from other Form fields (`coverageAmount`, `term`, `age`) and updates as the user changes those inputs. The customer can't edit `monthlyPremium` directly; it's a calculated display.

**Which Form configuration fits a "read-only computed field that updates live"?**

- **a)** Use a **Text View** component (read-only display) bound via a **FEEL expression** referencing the editable inputs: `=coverageAmount * 0.001 * term * (1 + age * 0.02)`. As the user changes inputs, the form re-evaluates the FEEL and updates the displayed value. Read-only by definition (Text View doesn't accept input). Documentation: [Forms element library](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/) + [Forms templating](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-templating-syntax/)

- **b)** Use a Number Input with `disabled: true` — visually similar (disabled field) but doesn't usually update live; Text View with FEEL expression is the canonical pattern. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Compute server-side via a Service Task before the User Task — wrong direction; the requirement is live in-form update as user types, not pre-computed once. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Custom JavaScript — wrong layer; Forms abstract above JS. FEEL-based live computation is the declarative path. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda Forms support FEEL templating in display components like Text View. The expression references other form fields by their `key` (which mirrors the variable name); as the user edits those fields, the form recalculates the FEEL and updates the displayed value in real time. Read-only is intrinsic to Text View (it's a display, not an input). This is the canonical "live computed field" pattern in Camunda Forms.

- **Option b) — Suboptimal.** A disabled Number Input shows a value but doesn't typically auto-update from other fields; it's bound to a static variable. Achievable with extra wiring, but Text View + FEEL is the direct path.

- **Option c) — Wrong direction.** Pre-computing means the value is fixed at task activation; user changes to inputs wouldn't reflect.

- **Option d) — Wrong layer.** Forms intentionally abstract above raw JS for portability across renderers.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Text View + FEEL expression живо updates as inputs change.
- **b) 5/10** — disabled Number Input не auto-updates; suboptimal.
- **c) 3/10** — wrong direction; pre-computed, не live.
- **d) 3/10** — wrong layer; Forms abstract over JS.

**Correct Answer:** Text View component with FEEL expression referencing editable inputs.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-templating-syntax/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "read-only computed field", "updates as user changes inputs." Live computed display.

**Въпросът → Solution Framing.** "Configuration fits live read-only computed" — изпитва се knowledge на Text View + FEEL templating.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Text View е read-only display, че FEEL templating updates live, че pre-computed Service Task е different model. Това е знание за Forms reactive computation.

---

## Question 31: Configuring Forms (Weighting: 5%)

**Scenario:** A customer-onboarding Form must bind to **nested process variables**. The variable shape is `customer = {profile: {firstName, lastName}, address: {city, postalCode}}`. The Form's "First Name" field should read from `customer.profile.firstName` AND write back to the same path on submit.

**How does Form data binding handle nested paths?**

- **a)** The Form field's **`key`** (or `path`) property accepts **dot-notation paths** like `customer.profile.firstName`. The form renderer reads from / writes to that nested path in the process variables. On submit, the form data is merged into process scope, preserving / creating the nested structure. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **b)** Forms can only bind to top-level variables; for nested structures, flatten the variables — incorrect; nested paths are supported. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Use FEEL expression in `key` — close: FEEL is for computed values, not for binding paths. Binding uses path notation. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Use a Service Task to flatten before the User Task — works but adds overhead; native nested binding handles it. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda Forms support dot-notation paths in field bindings. A field with `key: "customer.profile.firstName"` reads from that nested location at form load and writes back there on submit. The form abstracts the nesting from the user (the user just sees the "First Name" input) while preserving the variable structure in process scope. Cleaner than flattening + un-flattening manually.

- **Option b) — Wrong.** Nested binding supported.

- **Option c) — Wrong tool.** FEEL is for computed values, not binding paths.

- **Option d) — Over-engineered.** Native binding handles nesting.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Dot-notation paths в field key bind to nested variables.
- **b) 2/10** — wrong; nested binding supported.
- **c) 3/10** — wrong tool; FEEL ≠ path.
- **d) 4/10** — over-engineered.

**Correct Answer:** Form field's key supports dot-notation paths like customer.profile.firstName.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "nested process variables", "customer.profile.firstName." Form binding to nested data.

**Въпросът → Solution Framing.** "Binding handles nested paths" — изпитва се knowledge на Form path binding.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че dot-notation paths са supported, че FEEL е за computed values не binding, че flattening е workaround. Това е знание за nested data binding.

---

## Question 32: Configuring Forms (Weighting: 5%)

**Scenario:** A purchase-order Form has a "Line Items" section as a **Dynamic List (Table)** component. Each row has columns: SKU, Quantity, Unit Price, Notes. The team wants to **define the column schema** for the table component.

**How are columns defined for a Dynamic List (Table) component?**

- **a)** As a **list of column definitions** in the Table component's configuration — each column specifies its `label`, the **child component type** (Text Input, Number Input, etc.), and the binding `key` (relative to the row item). Each row of the table becomes an instance of those child components. Documentation: [Forms element library](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/)

- **b)** Columns auto-inferred from the bound variable's first item — incorrect; explicit schema required. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** As FEEL expressions returning column lists — overly dynamic for a typically schema-stable component. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Dynamic List doesn't have columns; it's a single-column list — incorrect; multi-column tables are supported. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Dynamic List (Table) component is configured with a schema of column definitions. Each column has: a label (header text), a child component type (the input shown in cells of that column), and a binding key (relative to the row's item object). At runtime, the form renders the column headers and lets the user add / remove rows; each new row produces a row item with fields per the column bindings. Result variable shape: list of objects, each shaped per column keys.

- **Option b) — Wrong.** No auto-inference; schema is explicit.

- **Option c) — Misuse.** Table schemas are typically static; using FEEL for dynamic column lists complicates the renderer.

- **Option d) — Wrong.** Multi-column tables supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Column schema explicit; each column = label + child component type + binding key.
- **b) 2/10** — no auto-inference.
- **c) 3/10** — misuse; static schema е canonical.
- **d) 1/10** — wrong; multi-column supported.

**Correct Answer:** As a list of column definitions in the Table component config (label, child component type, binding key per column).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Dynamic List (Table)", "define column schema." Table component configuration.

**Въпросът → Solution Framing.** "How columns defined" — изпитва се knowledge на Table schema model.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че schema е explicit list of column definitions, че FEEL-based dynamic columns са over-complication, че multi-column е supported. Това е знание за Table schema.

---

# Section 5 — Configuring Connectors (Questions 33-36)

> Weight 6% • Topics: Polling vs Webhook trade-offs, idempotency, AWS S3 upload, GraphQL.

---

## Question 33: Configuring Connectors (Weighting: 6%)

**Scenario:** A team integrates with a partner API that **doesn't support webhooks** — they only allow polling. The team is evaluating whether to use a Polling Inbound Connector or a custom Service Task that polls on its own.

**Which is the trade-off between Polling Inbound Connector vs custom polling Service Task?**

- **a)** **Polling Inbound Connector** — managed polling lifecycle, declarative config (URL, interval, auth via secrets), automatic process triggering on match, observable in Operate. **Custom Service Task polling** — write code, manage state (last-poll-cursor), trigger downstream BPMN manually. For typical polling patterns, the Inbound Connector is more declarative and easier to maintain; custom code is for unusual / complex polling logic. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Inbound Connector is slower than custom code — incorrect; both rely on similar HTTP calls; performance is similar. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Custom code is always preferred — incorrect; declarative Connectors save engineering time for standard patterns. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Polling Inbound Connector doesn't exist — incorrect; polling is a documented Inbound Connector pattern. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The trade-off is **declarative vs imperative**:
  - **Polling Inbound Connector** (declarative): configure URL, polling interval, auth, response-to-message mapping. The Connector runtime handles the polling lifecycle, retry on errors, BPMN event triggering. Visible in Operate / Connector Runtime. Less code, more configuration.
  - **Custom Service Task polling** (imperative): write Java/TypeScript code that polls in a worker, manages state (last-fetched cursor), and triggers downstream BPMN (via Message Publish or by setting variables). More flexible for complex / non-standard polling logic.

  For standard "poll URL X every Y seconds, trigger process on result" patterns, Inbound Connector wins on simplicity and observability.

- **Option b) — Wrong.** Performance comparable.

- **Option c) — Wrong.** Declarative tools save engineering for standard patterns.

- **Option d) — Wrong.** Polling Inbound Connector documented.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Inbound Connector е declarative + observable; custom е imperative за complex logic.
- **b) 3/10** — wrong; performance comparable.
- **c) 2/10** — wrong; declarative saves engineering.
- **d) 1/10** — невярно.

**Correct Answer:** Trade-off is declarative (Inbound Connector) vs imperative (custom code); prefer Connector for standard patterns, custom for complex.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "partner only allows polling", "Connector vs custom polling Service Task." Trade-off question.

**Въпросът → Solution Framing.** "Trade-off" — изпитва се knowledge на declarative vs imperative integration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Inbound Connector е declarative + managed, че custom code е imperative + more flexible, че performance е comparable. Това е знание за Connector trade-offs.

---

## Question 34: Configuring Connectors (Weighting: 6%)

**Scenario:** A custom Connector calls a payment API. Due to Zeebe's at-least-once delivery, the Connector might be invoked twice for the same job activation (e.g., transient network error causes re-activation). The team is concerned about **double-charging** customers.

**Which Connector design pattern prevents double-charging?**

- **a)** **Idempotency** — pass a deterministic idempotency key to the payment API (e.g., the BPMN element instance key, or a business-level idempotency key like `paymentId`). The payment API uses this key to deduplicate — repeated calls with same key are recognised and don't re-charge. The Connector includes the key in its API call. Documentation: [Connector SDK best practices](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/) + [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Increase Service Task `retries` to 0 — incorrect; the issue isn't retries on failure, it's re-activations. Setting retries to 0 makes the system more fragile, not more idempotent. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** Use a Boundary Error Event — handles errors but doesn't prevent duplicate calls when the Connector is re-activated. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **d)** Camunda guarantees exactly-once delivery for Connectors — incorrect; at-least-once is the contract. Idempotency is the design recourse. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** At-least-once delivery is a fundamental property of distributed messaging systems including Zeebe. Combined with worker timeouts, network blips, and retries, a single logical operation may produce multiple API calls. **Idempotency** is the engineering recourse: design the downstream API call so that repeated invocations with the same idempotency key are recognized and produce the same effect as a single call. For payments, the API typically accepts an `Idempotency-Key` header (Stripe convention, PSP standard); pass a deterministic key derived from the BPMN context (e.g., the process instance key + element ID).

  Implementation: in the Connector's `execute()`, build the idempotency key as `processInstanceKey + "-" + elementId` (or a business-level `paymentId` if available), pass to the payment API. The API deduplicates; result: customer is charged exactly once regardless of how many times the Connector is invoked.

- **Option b) — Wrong tool.** Retries don't address re-activation duplicates.

- **Option c) — Wrong tool.** Error Boundary handles errors, not duplicates.

- **Option d) — Wrong assumption.** Zeebe is at-least-once.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Idempotency key passed to downstream API е canonical pattern.
- **b) 2/10** — wrong tool; retries ≠ duplicate prevention.
- **c) 3/10** — wrong tool.
- **d) 1/10** — wrong assumption.

**Correct Answer:** Implement idempotency — pass a deterministic idempotency key to the payment API.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "at-least-once delivery", "double-charging", "Connector invoked twice." Idempotency design question.

**Въпросът → Solution Framing.** "Pattern prevents double-charging" — изпитва се knowledge на idempotency.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че at-least-once е the contract, че idempotency key е the recourse, че retries / Error Boundary не address duplicates. Това е знание за distributed-systems idempotency.

---

## Question 35: Configuring Connectors (Weighting: 6%)

**Scenario:** A photo-sharing platform's process uploads user photos to **AWS S3**. The team is using Camunda's out-of-the-box AWS S3 Connector.

**Which authentication mechanism does the S3 Connector typically support?**

- **a)** **IAM credentials** (access key + secret key) configured via cluster secrets, OR **IAM role assumption** (where the worker / Connector runtime runs with an IAM role). The Connector signs requests using AWS Signature V4. Documentation: [AWS Connectors](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/)

- **b)** AWS S3 supports anonymous uploads — only for public buckets with specific bucket policies; not the default; relies on bucket configuration, not Connector. Documentation: [AWS S3](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/)

- **c)** Username + password — incorrect; AWS uses IAM credentials. Documentation: [AWS](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/)

- **d)** mTLS to AWS endpoints — wrong protocol layer. Documentation: [AWS](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** AWS authentication uses IAM:
  - **Access keys** (long-lived): `accessKeyId` + `secretAccessKey`. Configure as cluster secrets, reference in Connector. Suitable for non-AWS deployments (e.g., Camunda 8 SaaS, self-hosted on non-AWS infra).
  - **IAM roles** (short-lived): when the Connector runtime runs on AWS (EC2, EKS, ECS), it can assume an IAM role and use temporary credentials automatically. Preferred for AWS-hosted deployments.

  The Connector signs all S3 API requests with AWS Signature V4. The team configures via secrets and (optionally) role ARN.

- **Option b) — Edge case.** Anonymous works only with specific bucket policies (public buckets); not the typical pattern.

- **Option c) — Wrong.** AWS uses IAM.

- **Option d) — Wrong protocol.** mTLS isn't AWS's API auth.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. IAM access keys или role assumption.
- **b) 3/10** — edge case (public buckets), не the default.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong protocol.

**Correct Answer:** IAM credentials (access key + secret key) via secrets, or IAM role assumption when running on AWS.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "AWS S3 Connector authentication." AWS auth model.

**Въпросът → Solution Framing.** "Authentication mechanism" — изпитва се knowledge на AWS Connector auth.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че AWS използва IAM (access keys или role assumption), че anonymous е edge case, че mTLS не е AWS standard. Това е знание за AWS Connector auth.

---

## Question 36: Configuring Connectors (Weighting: 6%)

**Scenario:** A team integrates with a **GraphQL** API. They want to send queries / mutations from BPMN. Camunda's out-of-the-box Connector library may or may not include a dedicated GraphQL Connector — they want to know their options.

**How can the team integrate with a GraphQL API from BPMN?**

- **a)** **Dedicated GraphQL Connector** (if available in your Connector library version) OR use the **generic HTTP / REST Connector** with a POST request to the GraphQL endpoint and the GraphQL query in the JSON body (`{"query": "...", "variables": {...}}`). Both approaches work; the dedicated Connector (where available) typically provides better ergonomics (separated query and variables fields, syntax highlighting). Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/) + [HTTP REST Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

- **b)** GraphQL isn't supported — incorrect; works via REST Connector minimum. Documentation: [HTTP](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

- **c)** Custom Connector only — workable but unnecessary; REST Connector covers GraphQL endpoint calls. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/)

- **d)** GraphQL endpoints must be wrapped in a REST proxy first — wrong; GraphQL endpoints accept POST directly, no proxy needed. Documentation: [HTTP](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** GraphQL endpoints are HTTP endpoints accepting POST with a JSON body containing `query` (the GraphQL query string) and `variables` (the variable bindings). Any HTTP client — including Camunda's REST / HTTP Outbound Connector — can call them. If Camunda's Connector library includes a dedicated GraphQL Connector, it offers a better UX (separate fields for query and variables); the REST Connector is the always-available fallback.

  Practical setup with REST Connector: method=POST, URL=GraphQL endpoint, body=FEEL constructing `{query: "...", variables: {...}}`, headers include Content-Type: application/json + Authorization.

- **Option b) — Wrong.** Supported via REST.

- **Option c) — Workable but unnecessary.** REST Connector handles the simple case.

- **Option d) — Wrong.** GraphQL accepts POST directly.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Dedicated GraphQL Connector (if available) or REST Connector POST.
- **b) 1/10** — wrong; supported.
- **c) 4/10** — workable но unnecessary.
- **d) 2/10** — wrong; GraphQL accepts POST.

**Correct Answer:** Use a dedicated GraphQL Connector (if available) or the generic HTTP/REST Connector with POST.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "GraphQL API integration", "from BPMN." GraphQL Connector options.

**Въпросът → Solution Framing.** "Integrate with GraphQL" — изпитва се knowledge на dedicated vs generic Connector options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че GraphQL accepts POST с {query, variables} body, че REST Connector handles it, че dedicated Connectors (when available) provide better ergonomics. Това е знание за Connector library + HTTP integration.

---

# Section 6 — Extensions & Integrations (Questions 37-50)

> Weight 25% • Topics: FEEL deep (string join, substring, matches, replace, time-zone), SDK async pattern, Node complete API, zbctl commands, SaaS vs SM, Connector validation, Webhook URL structure, RPA versioning, year-month duration, gRPC vs REST.

---

## Question 37: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must take a list of customer tags `["GOLD", "EU", "WHOLESALE"]` and combine them into a single comma-separated string `"GOLD, EU, WHOLESALE"` — for display in a notification.

**Which FEEL built-in fits "join list elements into a string with a separator"?**

- **a)** `string join(list, separator)` — FEEL string built-in that joins list elements (which must be strings or string-coercible) using the given separator. Result: a single string. `string join(["GOLD", "EU", "WHOLESALE"], ", ")` returns `"GOLD, EU, WHOLESALE"`. Documentation: [FEEL string functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **b)** `concatenate(list)` — concatenates lists into a list, not list into string. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **c)** `list.join(", ")` — JS reflex; not FEEL method-call syntax. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Manual `for` expression building the string with `+` — works but reinvents what `string join` does directly. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `string join(list, separator)` is FEEL's standard list-to-string joiner. Note the FEEL function naming convention: space-separated multi-word names. The list must contain string-coercible elements (typically strings); the separator is any string. Result is the joined single string.

- **Option b) — Wrong tool.** `concatenate` joins lists into a list (e.g., `concatenate([1,2], [3])` = `[1,2,3]`). Different purpose.

- **Option c) — JS reflex.** FEEL doesn't use method-call dot syntax.

- **Option d) — Reinvents.** A manual for-loop building the string with `+` works but is verbose; `string join` is the direct primitive.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. string join(list, sep) joins list to single string.
- **b) 3/10** — wrong; concatenate joins lists into list.
- **c) 2/10** — JS reflex.
- **d) 4/10** — reinvents wheel.

**Correct Answer:** string join(list, ", ").

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "join list into single string with separator." String-join operation.

**Въпросът → Solution Framing.** "Built-in fits join" — изпитва се FEEL string vocabulary.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че string join е the function (space-separated name), че concatenate е за lists-into-list, че JS method-call е wrong syntax. Това е знание за FEEL string functions.

---

## Question 38: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must extract a **substring**: from `phoneNumber = "+359-888-123456"`, get the area code (characters 2-4 = `"359"`).

**Which FEEL built-in fits "substring with start position and length"?**

- **a)** `substring(s, start, length)` — FEEL's string slicing function. 1-indexed start, length parameter. `substring("+359-888-123456", 2, 3)` returns `"359"`. Documentation: [FEEL string](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **b)** `s[2..4]` — string range indexing; not part of FEEL string syntax. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `s.substring(1, 4)` — Java method-call reflex; not FEEL syntax. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `slice(s, 2, 4)` — invented function. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `substring(string, start, length)` is FEEL's substring function. Important details: **1-indexed** (FEEL is 1-indexed throughout) and uses **length** (not end-position). Negative start counts from the end. Variants exist for "substring from start to end of string" (`substring(s, start)` without length).

- **Option b) — Wrong syntax.** FEEL doesn't use `[..]` range indexing on strings.

- **Option c) — Java reflex.** Method-call dot syntax isn't FEEL.

- **Option d) — Invented function.** Not a FEEL name.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. substring(s, start, length); 1-indexed; length-based.
- **b) 2/10** — wrong syntax.
- **c) 2/10** — Java reflex.
- **d) 1/10** — invented.

**Correct Answer:** substring(s, 2, 3) — returns "359" (1-indexed, length parameter).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "extract substring", "characters 2-4." String slicing.

**Въпросът → Solution Framing.** "Built-in fits" — изпитва се FEEL substring function.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL substring е 1-indexed + length-based, че Java method-call е wrong syntax, че няма slice() function. Това е знание за FEEL substring.

---

## Question 39: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must validate an email's format using a regular expression — accept if it matches `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`.

**Which FEEL built-in fits "test string against regex pattern"?**

- **a)** `matches(s, pattern)` — FEEL string built-in that returns boolean: true if the string matches the regex pattern. Used in input entries / output entries / Gateway conditions to validate text formats. Documentation: [FEEL string](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **b)** `s.match(pattern)` — JS reflex. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `regexTest(s, pattern)` — invented. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** FEEL doesn't support regex — incorrect; matches() exists. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `matches(string, regex)` is FEEL's regex testing function. Returns boolean. The regex syntax is XPath/XML-Schema-style (which is similar to but not identical to PCRE — for example, character classes work the standard way; lookaheads / lookbehinds may differ; verify the docs). For complex patterns, test in a FEEL playground.

  Companion function: `replace(string, regex, replacement)` for regex-based replacement (not just matching).

- **Option b) — JS reflex.** FEEL doesn't use method-call.

- **Option c) — Invented.** Not a FEEL name.

- **Option d) — Wrong.** Regex supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. matches(s, regex) returns boolean.
- **b) 2/10** — JS reflex.
- **c) 1/10** — invented.
- **d) 1/10** — wrong; supported.

**Correct Answer:** matches(s, pattern) returns boolean.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "regex pattern", "validate format." FEEL regex matching.

**Въпросът → Solution Framing.** "Built-in tests against regex" — изпитва се FEEL regex function vocabulary.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че matches() returns boolean, че replace() handles regex replacement, че FEEL uses XPath-style regex. Това е знание за FEEL regex.

---

## Question 40: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must **redact** a phone number in a string: replace all digits with `X`. Input: `"Call me at +359 888 123456"`. Desired output: `"Call me at +XXX XXX XXXXXX"`.

**Which FEEL built-in fits "regex-based string replacement"?**

- **a)** `replace(string, regex, replacement)` — FEEL's regex-replace function. `replace("Call me at +359 888 123456", "[0-9]", "X")` replaces every digit with `X`. Documentation: [FEEL string](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **b)** `s.replaceAll(pattern, value)` — Java method-call reflex; not FEEL. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Manual character substitution via for-loop — works but verbose; `replace()` handles it directly. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `regex_replace(s, pattern, val)` — invented function name. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `replace(string, regex, replacement)` is FEEL's string replacement. The regex matches all occurrences (no need for a global flag — FEEL replace is globally-acting). The replacement string can include backreferences for capturing groups (if regex includes them). Common use cases: redaction (replace sensitive data), normalisation (strip whitespace), formatting (e.g., format phone numbers).

  Companion: `replace(string, regex, replacement, flags)` — some FEEL implementations support optional flags for case-insensitivity, etc.

- **Option b) — Java reflex.** Method-call syntax isn't FEEL.

- **Option c) — Verbose reinvention.** `replace()` exists.

- **Option d) — Invented.** Use `replace`.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. replace(s, regex, replacement) globally replaces.
- **b) 2/10** — Java reflex.
- **c) 3/10** — verbose reinvention.
- **d) 1/10** — invented name.

**Correct Answer:** replace("Call me at +359 888 123456", "[0-9]", "X").

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "redact phone digits", "replace with X." Regex replacement.

**Въпросът → Solution Framing.** "Built-in fits regex replacement" — изпитва се FEEL replace function.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че replace(s, regex, replacement) globally replaces, че Java method-call е wrong syntax, че manual for-loop е reinvent. Това е знание за FEEL string transformation.

---

## Question 41: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Java Job Worker handles `archive-large-file` — the worker triggers an async backup process that takes several minutes. The worker doesn't want to **block** on the async work; instead, it wants to signal "I've started the work; complete the job later when the async work finishes."

**Which Spring Zeebe pattern fits "start async work, complete the job later"?**

- **a)** Annotate the `@JobWorker` with `autoComplete = false`, get the `JobClient` and `ActivatedJob` as method parameters, start the async work in a background thread (or hand off to a separate component), and from that thread call `client.newCompleteCommand(job.getKey()).variables(...).send()` when the async work finishes. The worker method returns immediately after starting the async work; Zeebe holds the job's activation timeout window. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** Always use `autoComplete = true` and return — incorrect; the job would complete immediately, before the async work finishes. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** Use a Boundary Event — wrong tool; Boundary Events handle external triggers, not async-from-worker patterns. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **d)** Async patterns aren't supported in Spring Zeebe — incorrect; `autoComplete = false` is the documented async pattern. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `autoComplete = false` is Spring Zeebe's async pattern. By default (`autoComplete = true`), Spring Zeebe automatically calls `complete()` after the method returns. With `autoComplete = false`, the worker assumes responsibility for completing the job — typically from a different thread / callback / event handler. The method body can: (1) start the async work and return, leaving the job activation in place; (2) the async completion callback later calls `client.newCompleteCommand(jobKey).send()` to mark the job complete.

  Critical concerns:
  - **Timeout management:** the job has an activation timeout. If the async work exceeds it, Zeebe re-activates the job (potentially leading to duplicate execution). Tune the timeout to the expected async work duration.
  - **Persistence of jobKey:** the worker must store the jobKey somewhere accessible from the async completion thread (typically in-memory map keyed by a business identifier, with appropriate cleanup).
  - **Failure handling:** if the async work fails, call `client.newFailCommand(jobKey).send()` to signal failure (decrements retries) or `client.newThrowErrorCommand(jobKey).errorCode(...).send()` for BPMN errors.

- **Option b) — Wrong.** Auto-completion before async work finishes is wrong.

- **Option c) — Wrong tool.** Boundary Events are external; not for worker-async.

- **Option d) — Wrong.** Async supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. autoComplete=false + explicit complete from async thread.
- **b) 2/10** — completes too early.
- **c) 3/10** — wrong tool.
- **d) 1/10** — wrong; supported.

**Correct Answer:** Set autoComplete = false; complete the job explicitly from the async thread via JobClient.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "async work", "complete job later", "don't block." Async worker pattern.

**Въпросът → Solution Framing.** "Pattern fits async" — изпитва се Spring Zeebe async-complete model.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че autoComplete=false е the async pattern, че jobKey трябва да persists across threads, че activation timeout матерial-ничен. Това е знание за async worker pattern.

---

## Question 42: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Node.js Job Worker using `@camunda8/sdk` handles `compute-tax` and returns the computed tax amount as a process variable `tax`. The team is reviewing the handler code: should they `return { tax: 42.50 }` from the handler, or call `job.complete({tax: 42.50})` explicitly?

**What's the canonical Node SDK completion pattern?**

- **a)** **Both patterns work**: the SDK supports returning a variables object from the handler (auto-complete) AND explicit `job.complete({...})` call. **Returning from the handler** is the more ergonomic / concise pattern; **explicit complete** is useful when you need more control (e.g., conditional return, async completion). Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **b)** Only explicit `job.complete()` — incorrect; SDK supports return value auto-complete. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **c)** Only return from handler — incorrect; explicit complete is also supported. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **d)** Set `job.variables = {...}` and return — invented assignment pattern; not the documented API. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda's Node SDK supports both completion styles for ergonomic flexibility:
  - **Return-based** (concise): `async function handle(job) { return { tax: 42.50 }; }` — the SDK auto-completes the job with the returned variables. Cleanest for simple cases.
  - **Explicit-call** (controlled): `async function handle(job) { ... await job.complete({tax: 42.50}); }` — useful when completion is conditional or in a complex flow.

  For async work that completes from a different code path (long-running operations), explicit complete is mandatory. For simple synchronous compute-and-return, the return-based form is more idiomatic.

- **Option b) — Wrong.** Both supported.

- **Option c) — Wrong.** Both supported.

- **Option d) — Wrong.** Not the API; use return value or explicit `complete()`.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Both patterns supported; return-based е ergonomic, explicit-call е controlled.
- **b) 3/10** — wrong; both supported.
- **c) 3/10** — wrong; both supported.
- **d) 1/10** — invented pattern.

**Correct Answer:** Both work — return value (concise) or explicit job.complete() (controlled).

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/node-js-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "return from handler" vs "explicit job.complete()." SDK completion ergonomics.

**Въпросът → Solution Framing.** "Canonical pattern" — изпитва се knowledge на SDK completion options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SDK supports both styles, че return-based е ergonomic, че explicit-call е controlled / async. Това е знание за Node SDK API.

---

## Question 43: Extensions & Integrations (Weighting: 25%)

**Scenario:** Ops wants to inspect a specific running process instance from the command line — see its current state, active tasks, variables — without opening Operate UI. They use `zbctl` and want to know the right subcommand.

**Which zbctl subcommand inspects a running instance's state?**

- **a)** **The querying side of zbctl is limited** — zbctl is primarily command-oriented (deploy, publish-message, complete-job, etc.). For querying / inspecting running instances, use the **Orchestration Cluster REST API** (`/v2/process-instances/{key}`) via `curl` or **operate the cluster from `curl` / Postman**. Or use **Operate's API** for richer state. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/) + [Orchestration API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/)

- **b)** `zbctl get instance <key>` — invented subcommand for many zbctl versions. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/)

- **c)** `zbctl describe <key>` — also typically not a zbctl subcommand. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/)

- **d)** zbctl can't inspect; only Operate UI works — partially correct; the canonical CLI query path is REST API via curl, not zbctl. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** zbctl's strength is in **commands** (write operations): deploy, publish-message, complete-job, fail-job, throw-error, cancel-instance, update-retries, etc. For **queries** (read operations), zbctl historically had limited support; modern workflows use the REST API directly with `curl`/Postman or use Operate's API for richer queries.

  Practical CLI inspection: `curl -H "Authorization: Bearer <token>" "$CLUSTER/v2/process-instances/<key>"` returns the instance's current state. For active tasks, `curl /v2/user-tasks/search` with filter. For variables, `curl /v2/variables/search`.

- **Option b) — Invented subcommand.** Not a standard zbctl command (verify per version).

- **Option c) — Invented subcommand.** Same.

- **Option d) — Partially.** zbctl is limited for queries; REST API is the CLI path.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. zbctl е command-oriented; queries via REST API.
- **b) 3/10** — invented subcommand.
- **c) 3/10** — invented subcommand.
- **d) 5/10** — partially correct (zbctl limited за queries) но Operate UI не е the only path.

**Correct Answer:** zbctl is command-oriented; use the Orchestration REST API (or Operate API) for instance inspection.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/cli-client/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "inspect running instance from CLI", "zbctl subcommand." zbctl scope question.

**Въпросът → Solution Framing.** "Subcommand inspects state" — изпитва се knowledge на zbctl capabilities + REST API integration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че zbctl е command-oriented, че REST API е query path, че Operate API has richer state. Това е знание за tooling boundaries.

---

## Question 44: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team is moving from Camunda 8 SaaS to **Self-Managed**. They wrote integrations using the Orchestration REST API. They wonder if the same code works in both environments.

**Which best describes API portability between Camunda 8 SaaS and Self-Managed?**

- **a)** **The REST APIs are largely the same** — same endpoints, request/response shapes, OAuth2 client-credentials auth model. **Differences** are mostly in: (1) the **base URL** (SaaS uses Camunda's domain, SM uses your own); (2) the **auth endpoint** (SaaS uses Camunda's identity provider, SM uses your configured identity — Keycloak by default or external IdP); (3) **multi-tenancy** features may differ between editions. Code that abstracts the base URL and auth flow ports well. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/) + [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **b)** Completely different APIs — incorrect; the API contract is consistent. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/)

- **c)** Same APIs, no differences — overstates; URL + auth differ. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/)

- **d)** SaaS uses REST, SM uses gRPC only — incorrect; both support REST + gRPC. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 maintains API consistency between SaaS and Self-Managed editions. The same REST endpoint paths, request/response schemas, and conceptual model apply. The practical migration concerns are deployment / configuration: base URL of the cluster, OAuth2 token endpoint (Camunda's hosted identity for SaaS vs your configured IdP for SM), feature availability (some advanced features may be edition-gated; verify the docs).

  Practical migration pattern:
  - Extract base URL + auth endpoint as configuration values.
  - Use OAuth2 client-credentials flow in both — same code, different credentials.
  - Test integrations against both environments in CI before cutover.

- **Option b) — Wrong.** Contract is consistent.

- **Option c) — Overstates.** Differences exist but are minor (URL + auth).

- **Option d) — Wrong.** Both editions support REST + gRPC.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Same APIs; differences in base URL + auth endpoint.
- **b) 1/10** — wrong; contract consistent.
- **c) 4/10** — overstates "no differences"; URL/auth differ.
- **d) 1/10** — wrong; both support REST.

**Correct Answer:** Largely the same APIs; differences in base URL + auth endpoint configuration.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "SaaS to Self-Managed", "same code work in both." Portability question.

**Въпросът → Solution Framing.** "API portability" — изпитва се knowledge на edition consistency.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че APIs са consistent, че base URL + auth endpoint differ, че OAuth2 model е same. Това е знание за SaaS-SM portability.

---

## Question 45: Extensions & Integrations (Weighting: 25%)

**Scenario:** A custom Outbound Connector receives Element Template properties as inputs — including a URL and a numeric `timeout` value. The team wants to **validate** that the URL has the expected `https://` prefix and that `timeout` is in range [100, 30000] ms. Where in the Connector code should validation happen?

**Where should Connector input validation happen?**

- **a)** **Both layers** in coordination: (1) **Element Template constraints** at design time (regex pattern for URL, min/max for timeout) — catches typos before deployment; (2) **Java validation** in the Connector function (e.g., using `javax.validation` Bean Validation annotations, or explicit checks) — catches edge cases at runtime (e.g., variable substitution producing an invalid value). Design-time validation prevents bad configs from reaching production; runtime validation guards against dynamic values. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/) + [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** Only at design time — partial; misses dynamic runtime values from FEEL evaluations. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **c)** Only at runtime — partial; misses design-time typos that could be caught earlier. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **d)** Validation isn't supported — incorrect; both layers offer validation tools. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Defence in depth:
  - **Design-time (Element Template constraints):** static literals can be validated against regex / min / max before deployment. Catches typos like "htpp://..." or `timeout = "abc"`. Modeler shows errors in the property panel.
  - **Runtime (Connector code):** when values come from FEEL expressions evaluating against process variables, the resulting value might not be valid (e.g., FEEL returns null, or returns a value outside the expected range). Java validation (Bean Validation annotations like `@Pattern`, `@Min`, `@Max`, or explicit checks) catches these at execution. On invalid input, throw a clear exception that translates to a BPMN incident with a meaningful message.

  Together they cover: static configuration typos AND dynamic value validation.

- **Option b) — Partial.** Misses runtime issues from FEEL evaluation.

- **Option c) — Partial.** Misses catching design-time typos early.

- **Option d) — Wrong.** Validation supported at both layers.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Design-time constraints + runtime Java validation.
- **b) 5/10** — partial; misses runtime FEEL-evaluation issues.
- **c) 5/10** — partial; misses design-time typos.
- **d) 1/10** — wrong.

**Correct Answer:** Both layers — Element Template constraints (design-time) + Java validation in Connector code (runtime).

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "validate URL prefix", "timeout range", "where validation happens." Defence-in-depth validation.

**Въпросът → Solution Framing.** "Where validation happens" — изпитва се knowledge на multi-layer validation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че design-time + runtime е canonical pair, че single-layer misses cases, че both layers са supported. Това е знание за Connector validation patterns.

---

## Question 46: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team deploys an Inbound Webhook Connector. They need the **URL the partner should call** to trigger their process. Where do they get it?

**Where is the Webhook URL exposed?**

- **a)** After deployment, the Webhook URL is **shown in Web Modeler** (typically in the Connector's property panel or in a "Deployed Endpoints" view) and/or **constructible from the cluster's webhook base URL + the Connector's path identifier**. Pattern: `https://<cluster>.connectors.camunda.io/<tenant>/webhook/<endpoint-id>` (SaaS pattern; SM varies by Connector Runtime config). Documentation: [Webhook Connector](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

- **b)** Camunda emails the partner directly — incorrect; the team gives the URL to the partner. Documentation: [Webhook](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

- **c)** Generated randomly per request — incorrect; URL is stable per deployed Connector. Documentation: [Webhook](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

- **d)** Webhook URLs aren't exposed; partners can't call them — defeats the whole purpose. Documentation: [Webhook](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** After deploying a process containing an Inbound Webhook Connector, the URL becomes accessible. Web Modeler shows the deployment outcome including the endpoint; alternatively, the team constructs the URL from the cluster's webhook base URL pattern. Typical SaaS pattern: `https://<cluster-region>.connectors.camunda.io/<tenant>/webhook/<endpoint-identifier>`. Self-Managed: depends on Connector Runtime configuration (where the Connector Runtime listens for inbound requests).

  Team workflow: deploy → grab URL from Web Modeler → share with partner (likely via secure channel) → partner POSTs to URL → process instances start.

- **Option b) — Wrong.** Team responsible for sharing.

- **Option c) — Wrong.** Stable URL.

- **Option d) — Wrong.** URL exposed.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. URL shown in Web Modeler + constructible from cluster base URL.
- **b) 1/10** — wrong; team shares.
- **c) 1/10** — wrong; stable URL.
- **d) 1/10** — wrong.

**Correct Answer:** URL is shown in Web Modeler after deployment (and constructible from cluster's webhook base URL pattern).

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Webhook URL", "partner should call." URL discovery question.

**Въпросът → Solution Framing.** "Where exposed" — изпитва се knowledge на Webhook URL structure.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че URL is shown post-deployment, че pattern follows cluster base + endpoint identifier. Това е знание за Webhook URL discovery.

---

## Question 47: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team has an **RPA bot script** that automates a SAP integration. They've improved the script across versions (v1, v2, v3 — each fixing edge cases). The team wonders about **versioning** — how does Camunda 8 handle RPA bot script versions?

**How does Camunda 8 RPA handle bot script versioning?**

- **a)** **Bot scripts are versioned resources** in Camunda 8 — deploy a new version of the bot, running tasks continue with whichever version they invoked, new instances use the latest. Similar to BPMN / DMN versioning. The exact deployment mechanism (file upload, API, etc.) depends on your RPA tooling. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **b)** RPA bots aren't versioned — incorrect; versioning is documented support. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **c)** Each bot version requires a new BPMN — incorrect; the BPMN references the bot by name/type, not by version. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **d)** Running tasks auto-migrate to new bot versions — incorrect; same versioning principle as BPMN — running stays with original version. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 RPA bot scripts are versioned similarly to BPMN and DMN: each deployment is a version; older versions remain accessible; running tasks continue with the version they invoked; new task activations use the latest version. This preserves running work during bot improvements.

  Practical workflow: improve the bot, deploy as a new version, monitor — running tasks finish with v(n-1), new tasks use v(n). For breaking changes, consider explicit migration or graceful coexistence period.

- **Option b) — Wrong.** Versioning supported.

- **Option c) — Wrong.** BPMN references bot by identifier, not version.

- **Option d) — Wrong.** No auto-migration; running stays with original.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Bot scripts versioned; running tasks stay with original.
- **b) 1/10** — wrong; versioning supported.
- **c) 2/10** — wrong; BPMN references by id.
- **d) 2/10** — wrong; no auto-migration.

**Correct Answer:** Bot scripts are versioned; running tasks stay with their version, new instances use the latest.

**Official Documentation Link:** https://docs.camunda.io/docs/components/rpa/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "bot script versioning", "improved across versions." RPA versioning model.

**Въпросът → Solution Framing.** "How handles versioning" — изпитва се knowledge на RPA versioning consistency with BPMN/DMN.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че versioning principle е consistent across BPMN/DMN/RPA, че running stays with original, че new instances use latest. Това е знание за RPA versioning.

---

## Question 48: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must compute **duration in years and months** between two dates: `birthDate = date("1990-06-15")` and `currentDate = date("2026-05-14")` → 35 years 10 months.

**Which FEEL built-in fits "years-and-months duration"?**

- **a)** `years and months duration(date1, date2)` — FEEL's specific function for year-month duration. Returns a value of type `years and months duration` (distinct from `days and time duration`). Useful for age calculations, contract terms, etc. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** `(date2 - date1)` — wrong type; subtraction of dates yields a `days and time duration`, not `years and months`. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **c)** `duration(date2 - date1)` — same issue; date subtraction gives days/time, not year-month. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `dateDiff(date1, date2, "years")` — invented function. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL distinguishes two duration types:
  - **`days and time duration`** (`PT...H...M...S`, `P...D`): for sub-day precision and exact wall-clock durations.
  - **`years and months duration`** (`P...Y...M`): for calendar-based durations like age, contract terms — where months aren't a fixed number of days.

  `years and months duration(date1, date2)` returns the year-month duration between two dates. For age, accessor functions like `years` and `months` on the duration value extract the components.

- **Option b) — Wrong type.** Date subtraction yields `days and time duration`.

- **Option c) — Wrong type.** Same as (b).

- **Option d) — Invented.** Not a FEEL name.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. years and months duration(d1, d2) for calendar-based duration.
- **b) 3/10** — wrong type; days/time не years/months.
- **c) 3/10** — same wrong type.
- **d) 1/10** — invented function.

**Correct Answer:** years and months duration(birthDate, currentDate).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "years and months between dates", "age calculation." FEEL year-month duration.

**Въпросът → Solution Framing.** "Built-in fits years-and-months" — изпитва се knowledge на duration types.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL има 2 duration types (days/time vs years/months), че date subtraction yields days/time, че years and months duration() е the dedicated function. Това е знание за FEEL duration types.

---

## Question 49: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Service Task must call a partner API that **rate-limits** to 10 requests per minute. The team uses Camunda 8 to orchestrate calls. The Service Task's BPMN configures retries, but the team is concerned about hitting the rate limit on retries.

**Which architecture pattern fits "respect partner rate limits"?**

- **a)** **Sequential Multi-Instance Subprocess** (rate-by-design) OR **worker-side throttling** (e.g., a token bucket / semaphore in the worker that limits how many jobs it activates per minute). For partners with strict per-minute limits, combine both: sequential MI ensures one-at-a-time at BPMN level + worker rate limiter caps total throughput across multiple workers. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/) + [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Camunda has a built-in rate limiter — incorrect; rate limiting is the team's responsibility. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Set BPMN retries low — addresses retry storms but doesn't address baseline rate. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** No way to respect rate limits — incorrect; multiple patterns work. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Rate limiting in distributed processes is a real engineering concern. Camunda doesn't impose rate limits itself (workers activate jobs as fast as configured); the team designs for partner constraints:
  - **BPMN-level sequential MI:** force one-at-a-time at the model level. Combined with a sufficient interval (Timer Boundary or sleep in worker), respects partner pace.
  - **Worker-side throttling:** the worker code includes a rate limiter (token bucket, semaphore, third-party lib). Caps total throughput regardless of how many jobs Zeebe activates.
  - **For more sophisticated patterns:** message-based queue with dedicated consumer respecting partner rate; backoff on 429 responses (partner-side rate-limit signal); dedicated rate-limited Connector wrapper.

  Combine BPMN-level sequencing with worker-side throttling for robustness.

- **Option b) — Wrong.** Camunda doesn't impose rate limits.

- **Option c) — Partial.** Low retries help with retry storms but not baseline rate.

- **Option d) — Wrong.** Multiple patterns work.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Sequential MI + worker-side throttling е canonical rate-respecting pattern.
- **b) 1/10** — wrong; no built-in.
- **c) 5/10** — partial; addresses retries не baseline rate.
- **d) 1/10** — wrong.

**Correct Answer:** Sequential MI + worker-side rate limiter (token bucket / semaphore).

**Official Documentation Link:** https://docs.camunda.io/docs/components/best-practices/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "partner rate-limits", "10 requests per minute", "respect rate limits." Rate-limiting design.

**Въпросът → Solution Framing.** "Architecture pattern fits" — изпитва се knowledge на rate-limiting patterns.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda не imposes rate limits, че Sequential MI sequences at BPMN level, че worker-side rate limiter каp-ва throughput, че retries не addresses baseline rate. Това е знание за rate-limiting design.

---

## Question 50: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team is choosing between **gRPC** and **REST** for a new integration. They want broad compatibility — the integration should work from Java, Python, browsers, mobile apps.

**Which API style fits the broadest compatibility requirement?**

- **a)** **REST (HTTP/JSON)** — universally supported across languages, runtimes, and environments. Every HTTP-capable client (browsers, mobile, CLI tools, all server languages) can call REST. gRPC is faster and stricter-typed but requires gRPC libraries / proto codegen, which isn't available everywhere (browsers especially require gRPC-Web). For broadest compatibility, REST wins. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/) + [Orchestration REST API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/)

- **b)** gRPC — incorrect for the requirement; gRPC has narrower runtime support, particularly for browsers. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

- **c)** Both equally compatible — wrong; significant difference in cross-runtime support. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/)

- **d)** Custom protocol — invented; Camunda offers REST + gRPC, no custom. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** REST's strength is **universal compatibility**: any HTTP client speaks it. Browsers (via fetch/XMLHttpRequest), mobile apps, CLI tools (curl), every server-side language. gRPC requires gRPC client libraries (typically auto-generated from .proto files) and isn't natively browser-compatible (needs gRPC-Web or a proxy). For broad reach, REST is the default.

  When to use gRPC instead: high-throughput scenarios (lower latency, binary encoding), bidirectional streaming, type-safety at compile time. For browser-facing and mobile-facing integrations, REST.

- **Option b) — Wrong for requirement.** gRPC narrower in browser support.

- **Option c) — Wrong.** Significant difference.

- **Option d) — Invented.** No custom protocol.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. REST = universal compatibility across browsers / mobile / servers.
- **b) 3/10** — wrong for broad compatibility; gRPC narrower in browser.
- **c) 2/10** — wrong; significant difference.
- **d) 1/10** — invented.

**Correct Answer:** REST (HTTP/JSON) for broadest compatibility across languages, browsers, mobile.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "broad compatibility", "Java, Python, browsers, mobile." Cross-runtime support question.

**Въпросът → Solution Framing.** "API style fits broad compatibility" — изпитва се REST vs gRPC trade-offs.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че REST универсален, gRPC narrower (browser needs gRPC-Web), че Camunda offers both. Това е знание за API style selection.

---

# Section 7 — Managing the Development Process (Questions 51-59)

> Weight 15% • Topics: Web Modeler permissions, Operate refresh model, modify-add-token, Tasklist priority sorting, Call Activity vs Subprocess choice, Operate duration filter, Web Modeler diff, cluster failure recovery, migration impossibility.

---

## Question 51: Managing the Development Process (Weighting: 15%)

**Scenario:** A Web Modeler project has 8 people working in it. The team wants different permission levels: 2 admins can manage settings, 4 editors can modify resources, 2 viewers can only read. They need to assign roles.

**How does Web Modeler manage per-project permissions?**

- **a)** **Role-based access** at the project level: typical roles include Project Admin (full control, manages members + settings), Editor (modify resources), Viewer (read-only). Members are invited (typically by email) and assigned a role. The roles map to permissions on the project's resources (BPMN, DMN, Forms, Templates, deployments). Documentation: [Web Modeler collaboration](https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/)

- **b)** All members have equal permission — incorrect; role-based access is supported. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** Permissions are configured via API only, no UI — incorrect; Web Modeler UI exposes member management. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** Web Modeler has no permission system; use external SSO controls — partial; SSO controls authentication, but Web Modeler has its own role authorisation layer. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler implements role-based access at project granularity. Each project has its own member list with role assignments. Roles bundle permissions: Admin manages everything in the project including members; Editor reads + modifies resources; Viewer reads only. Some Web Modeler versions also support read+execute roles (e.g., a "Deployer" role that can deploy but not edit).

  Practical workflow: project owner invites members by email → assigns roles → members access per their permission level. For org-wide policies, integrate with the underlying identity provider's group membership.

- **Option b) — Wrong.** RBAC supported.

- **Option c) — Wrong.** UI exposes management.

- **Option d) — Partial.** SSO is authentication; RBAC is the authorisation layer on top.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Role-based access (Admin / Editor / Viewer) per project.
- **b) 2/10** — wrong; RBAC supported.
- **c) 3/10** — wrong; UI manages members.
- **d) 4/10** — partial; SSO ≠ RBAC layer.

**Correct Answer:** Role-based access at the project level (Admin / Editor / Viewer roles).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "8 people", "different permission levels", "admin / editor / viewer." Role-based access question.

**Въпросът → Solution Framing.** "Manages per-project permissions" — изпитва се knowledge на Web Modeler RBAC.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler има role-based access, че roles bundle permissions, че SSO е authentication layer не authorisation. Това е знание за project access control.

---

## Question 52: Managing the Development Process (Weighting: 15%)

**Scenario:** Ops keeps Operate open on the active-incidents dashboard for monitoring. They notice the data doesn't update **instantly** when new incidents appear in Zeebe — there's a delay. They want to understand Operate's update model.

**How does Operate keep its data up to date with Zeebe events?**

- **a)** Operate uses **Elasticsearch / OpenSearch exporters** — Zeebe streams events to a search backend; Operate queries that backend. There's an inherent **export latency** (sub-seconds typically, but can be tens of seconds under load) between an event happening in Zeebe and its appearance in Operate. UI also polls / refreshes at intervals. So total latency = export + UI refresh. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/) + [Self-Managed architecture](https://docs.camunda.io/docs/self-managed/concepts/architecture/)

- **b)** Real-time push from Zeebe to Operate UI — incorrect; the architecture uses exporters + ES, not direct push. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Manual refresh required — partial; auto-refresh exists but data has inherent export delay. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Operate queries Zeebe directly via gRPC for each UI update — incorrect; uses the search backend. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8's architecture decouples runtime (Zeebe) from observability (Operate, Tasklist, Optimize). Zeebe exports events to Elasticsearch (or OpenSearch); Operate queries ES. This decoupling enables:
  - **Horizontal scalability** of the observability layer independently from the broker.
  - **Eventual consistency** — there's a measurable lag between Zeebe event happening and its appearance in Operate (typically sub-second; can stretch under high load or backpressure).

  Operate's UI then polls / refreshes at configured intervals (often around tens of seconds). So total user-visible latency = exporter lag + UI refresh interval.

- **Option b) — Wrong architecture.** No real-time push.

- **Option c) — Partial.** Auto-refresh exists but inherent export delay also matters.

- **Option d) — Wrong.** Operate uses ES, not direct Zeebe gRPC.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Exporter to ES + UI polling; eventual consistency.
- **b) 2/10** — wrong architecture.
- **c) 5/10** — partial; auto-refresh + export delay both contribute.
- **d) 2/10** — wrong; ES, не direct Zeebe.

**Correct Answer:** Operate queries Elasticsearch (populated by Zeebe exporters); there's export latency + UI refresh.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Operate doesn't update instantly", "delay." Operate update model.

**Въпросът → Solution Framing.** "How keep up to date" — изпитва се architecture knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че architecture decouples Zeebe от Operate via ES exporter, че exporter lag е inherent, че UI polls. Това е знание за C8 observability architecture.

---

## Question 53: Managing the Development Process (Weighting: 15%)

**Scenario:** A process instance has an active token at Service Task `T5`. The team realises the customer needs an additional review step they hadn't modelled — they want to **add a parallel branch** to the running instance (without modifying the BPMN definition or cancelling the instance). They want to inject a new token at task `T-Review` for this specific instance.

**Can Operate's Modify Process Instance feature add new tokens at specific locations?**

- **a)** **Yes** — Operate's "Modify Process Instance" feature supports two main actions: (1) **cancel** existing tokens at specified flow nodes; (2) **add** new tokens at specified flow nodes (with optional variable updates for that scope). For one-off interventions on specific instances, this is the canonical tool. The change applies only to the targeted instance, not to the BPMN definition. Documentation: [Operate Modify Instance](https://docs.camunda.io/docs/components/operate/userguide/modify-instance/)

- **b)** No — Operate only cancels, doesn't add — incorrect; both cancel + add are supported. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/modify-instance/)

- **c)** Yes, but only by modifying the BPMN definition — wrong scope; Modify Instance is per-instance, not per-definition. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/modify-instance/)

- **d)** Modify isn't supported — incorrect. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/modify-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's Modify Process Instance is a surgical instance-editing tool. Capabilities:
  - **Cancel tokens** at specific flow nodes — useful when an instance is stuck or routed wrong.
  - **Add tokens** at specific flow nodes — useful for adding work that wasn't originally modelled, or for skipping ahead to a downstream task.
  - **Update scope variables** at the added-token's scope — for setting up data the new token expects.

  Use cases: one-off interventions for specific cases (the BPMN definition is fine in general; this instance needs special handling); recovery from incidents; testing flows in production-like scenarios.

  Important: Modify Instance is per-instance; doesn't change the BPMN definition (other instances continue normally). Use sparingly — frequent need for modify might indicate BPMN model gaps.

- **Option b) — Wrong.** Add supported.

- **Option c) — Wrong scope.** Per-instance, not per-definition.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Modify Instance supports add + cancel + variable update; per-instance.
- **b) 3/10** — wrong; add supported.
- **c) 2/10** — wrong scope.
- **d) 1/10** — wrong.

**Correct Answer:** Yes — Modify Process Instance supports adding tokens (and cancelling tokens, and updating scope variables).

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/modify-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "add parallel branch", "running instance", "inject new token." Modify Instance capability.

**Въпросът → Solution Framing.** "Can Modify add tokens" — изпитва се knowledge на Modify capabilities.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Modify supports add + cancel + variable update, че е per-instance, че за structural changes use migration. Това е знание за Modify Instance feature.

---

## Question 54: Managing the Development Process (Weighting: 15%)

**Scenario:** A support agent's Tasklist shows 30 pending User Tasks. The agent wants to **prioritise** — handle the urgent ones first. The User Tasks have a `priority` variable (HIGH / MEDIUM / LOW) and a `dueDate` attribute.

**How does Tasklist support task prioritisation by the assignee?**

- **a)** Tasklist's task list view supports **sorting and filtering** — sort by priority (custom variable or built-in dueDate / creation date), filter by status, candidate group, due-date bucket. The assignee picks tasks in priority order from the sorted list. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/)

- **b)** Tasklist automatically orders by priority — partial; sort defaults vary, but customisation supported. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **c)** Priority isn't supported — incorrect; sorting / filtering are standard. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **d)** Use Operate for prioritisation — wrong tool; Tasklist is the user-facing UI for User Tasks. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Tasklist's primary value is helping assignees manage their work. Sorting / filtering options include: by dueDate (earliest first / latest first), by creation date, by priority (if your modelling sets a `priority` variable or uses the built-in priority concept), by candidate group, by other filters. The exact UI affordances vary by Tasklist version; verify current docs.

  Modelling tip: explicitly set a `priority` variable on each User Task (via Input Mapping with a FEEL expression), then Tasklist filtering / sorting works on that. Or use the User Task's built-in priority attribute (where supported).

- **Option b) — Partial.** Auto-ordering depends on configuration; user can typically override.

- **Option c) — Wrong.** Prioritisation supported.

- **Option d) — Wrong tool.** Tasklist user-facing.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Sorting + filtering by priority / dueDate / etc.
- **b) 6/10** — partial; depends on default sort config.
- **c) 1/10** — wrong; supported.
- **d) 2/10** — wrong tool.

**Correct Answer:** Tasklist supports sorting and filtering — by priority, dueDate, candidate group, and custom variables.

**Official Documentation Link:** https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "30 pending tasks", "prioritise", "urgent first." Tasklist prioritisation.

**Въпросът → Solution Framing.** "How support prioritisation" — изпитва се Tasklist UX features.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Tasklist supports sorting + filtering, че variables / dueDate / priority drive ordering. Това е знание за Tasklist UX.

---

## Question 55: Managing the Development Process (Weighting: 15%)

**Scenario:** A team is deciding between **Call Activity** (calls a separately-deployed process) and **Embedded Subprocess** (inline grouping) for a "payment-processing" block of 5 tasks. The block is **used in 4 different parent processes** across the company.

**Which best guides "Call Activity vs Embedded Subprocess" decision?**

- **a)** **Call Activity** when the block is **reused** across multiple parent processes (4 parents = reuse); the called process has its **own lifecycle**, is owned independently, can be deployed independently. **Embedded Subprocess** when the block is **specific to one parent** (no reuse), used for visual grouping / scoping within the parent. For "5 tasks used in 4 parents," Call Activity wins on DRY / lifecycle independence. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/) + [Embedded Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/)

- **b)** Always Embedded Subprocess — incorrect; reuse calls for Call Activity. Documentation: [Embedded Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/)

- **c)** Always Call Activity — overstated; Embedded is the right choice when no reuse needed (avoids deployment overhead). Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **d)** Both are interchangeable — incorrect; they have distinct semantics. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Distinct constructs for distinct purposes:
  - **Call Activity:** invokes a **separately-deployed** process by ID. Independent lifecycle (the called process can be deployed / versioned / migrated separately). Variables passed in via input mapping, returned via output mapping. Best for **reuse across parents**.
  - **Embedded Subprocess:** **inline** in the parent's BPMN. Same lifecycle / scope as the parent. Used for visual grouping, scoping variables, attaching boundary events to a section. Best for **one-parent-specific structure**.

  Decision heuristic: "Will this block be reused?" Yes → Call Activity. No → Embedded Subprocess. Also consider ownership: independent team ownership of the block argues for Call Activity (independent deployment).

  For "5 tasks used in 4 parents": Call Activity. The 4 parents reference the same payment-processing process; updates to it (e.g., adding a new step) ripple to all 4 parents without modifying each parent's BPMN.

- **Option b) — Wrong default.** Reuse calls for Call Activity.

- **Option c) — Overstated.** Embedded is right when no reuse.

- **Option d) — Wrong.** Distinct semantics.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Call Activity за reuse + independent lifecycle; Embedded за one-parent grouping.
- **b) 3/10** — wrong default; reuse needs Call Activity.
- **c) 5/10** — overstated; Embedded valid for non-reuse.
- **d) 1/10** — wrong; distinct.

**Correct Answer:** Call Activity for reuse across parents; Embedded Subprocess for one-parent grouping.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "5 tasks used in 4 parents", "reuse." Call Activity vs Embedded choice.

**Въпросът → Solution Framing.** "Best guides decision" — изпитва се BPMN reuse pattern.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Call Activity е reusable + independent lifecycle, че Embedded е inline + one-parent. Това е знание за BPMN composition.

---

## Question 56: Managing the Development Process (Weighting: 15%)

**Scenario:** An ops team wants to find **all process instances that took longer than 1 hour to complete**, across all process definitions, in the past 30 days. They use Operate.

**Which Operate filter / view fits "completed instances filtered by duration"?**

- **a)** Operate's process instance search supports filtering by **state (COMPLETED), start/end date, and duration** (or computed via start date + end date filters). For aggregate analytics (avg / p95 / trend), Optimize is more appropriate; for spot-checks and per-instance investigation, Operate's filtering works. Documentation: [Operate filters](https://docs.camunda.io/docs/components/operate/userguide/process-instance-summary/) + [Optimize](https://docs.camunda.io/docs/components/optimize/)

- **b)** Operate doesn't filter by duration — incorrect; duration-related filters supported. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Use zbctl for duration queries — wrong tool; zbctl is command-oriented. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/)

- **d)** Custom SQL on Elasticsearch — workable but bypasses the API contract. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's process-instance filters typically include state, start/end date, process definition, variables, etc. Duration can be approximated via date range filters. For "longer than 1 hour completed": filter state=COMPLETED, end date in past 30 days, and then sort / filter by duration (if direct duration filter is available, otherwise compute manually from start/end timestamps in the returned list).

  For aggregate metrics (average duration, p95, trends), **Optimize** is the analytics layer with dedicated reports. Operate is for spot-checks and per-instance investigation.

- **Option b) — Wrong.** Duration-related filters supported.

- **Option c) — Wrong tool.** zbctl is commands.

- **Option d) — Bypasses contract.** Direct ES queries are unsupported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Operate filters by state / date / duration; Optimize за aggregates.
- **b) 3/10** — wrong; supported.
- **c) 1/10** — wrong tool.
- **d) 2/10** — bypasses API contract.

**Correct Answer:** Operate's process instance search filters by state, dates, and (related to) duration; Optimize for aggregate analytics.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-summary/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "completed instances", "longer than 1 hour", "past 30 days." Duration filtering question.

**Въпросът → Solution Framing.** "Filter fits" — изпитва се Operate filter options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate filters by state / date / duration, че Optimize е analytics layer, че ES direct е bypass. Това е знание за Operate filters.

---

## Question 57: Managing the Development Process (Weighting: 15%)

**Scenario:** A modeler in Web Modeler accidentally removed a critical task from a BPMN. They want to **see the diff** between the current version and the previous version, and **revert** if needed.

**How does Web Modeler support version history and diff?**

- **a)** Web Modeler maintains a **version history** of each resource — modelers can view previous versions, see diffs (visual highlighting of changes), and revert to a previous version. Documentation: [Web Modeler versioning](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **b)** No version history; once you save, the previous version is gone — incorrect; versioning is core feature. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** Only via Git Sync — partial; if Git Sync is configured, Git provides versioning; but Web Modeler also has its own. Documentation: [GitHub Sync](https://docs.camunda.io/docs/components/modeler/web-modeler/github-sync/)

- **d)** Web Modeler tracks last save only — incorrect; full version history supported. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler retains version history for each resource. Capabilities typically include:
  - **View previous versions:** see the BPMN/DMN/Form as it was at a past save point.
  - **Diff:** see what changed between two versions (visual highlighting in BPMN editor).
  - **Revert:** restore a previous version as the current.

  The exact UX varies by Web Modeler version — verify the docs. For Git-synced projects, you also have Git history as a parallel mechanism.

- **Option b) — Wrong.** Versioning core feature.

- **Option c) — Partial.** Both Web Modeler versioning and Git work.

- **Option d) — Wrong.** Full history.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Version history + diff + revert.
- **b) 1/10** — wrong; versioning core.
- **c) 5/10** — partial; both Web Modeler and Git provide versioning.
- **d) 1/10** — wrong; full history.

**Correct Answer:** Web Modeler maintains version history; supports viewing previous versions, diff, and revert.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "see diff", "revert if needed", "accidentally removed task." Version history question.

**Въпросът → Solution Framing.** "Supports version history and diff" — изпитва се Web Modeler versioning.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler keeps history, че diff + revert supported, че Git е parallel mechanism. Това е знание за Web Modeler versioning.

---

## Question 58: Managing the Development Process (Weighting: 15%)

**Scenario:** A SaaS cluster experiences a partial outage — one broker node is temporarily unreachable. The team wonders about **impact on running processes** and **recovery**.

**How does Camunda 8 handle partial cluster failure?**

- **a)** **Distributed architecture with replication:** Zeebe partitions are replicated across broker nodes (configurable replication factor). If one broker is unreachable, requests route to other nodes hosting replicas. Running processes continue with minimal interruption. Once the failed node recovers, it catches up via replication. Multi-region SaaS clusters have additional regional failover. Documentation: [Zeebe architecture](https://docs.camunda.io/docs/components/concepts/architecture/) + [Self-Managed concepts](https://docs.camunda.io/docs/self-managed/concepts/architecture/)

- **b)** All processes pause until full recovery — incorrect; replication enables continued operation. Documentation: [Zeebe](https://docs.camunda.io/docs/components/concepts/architecture/)

- **c)** Processes are lost — incorrect; durable storage + replication preserve state. Documentation: [Zeebe](https://docs.camunda.io/docs/components/concepts/architecture/)

- **d)** Camunda 8 doesn't support high availability — incorrect; HA is a core architectural feature. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe's architecture for HA:
  - **Partitions:** the process state is sharded across partitions; each partition is independent.
  - **Replication:** each partition has a leader + followers (replication factor typically 3). The leader handles writes; followers maintain copies.
  - **Quorum:** for fault tolerance, a majority of replicas must be available for a partition to operate. With replication factor 3, the partition tolerates 1 failed node.
  - **Recovery:** when a failed node returns, it catches up by replicating from the current leader.

  SaaS clusters extend this with multi-region replication for regional disaster recovery. Operators / clients see minimal interruption; some requests may briefly fail over to other nodes / regions.

- **Option b) — Wrong.** Continued operation via replicas.

- **Option c) — Wrong.** Durable + replicated state.

- **Option d) — Wrong.** HA is core.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Replication + quorum + recovery; continued operation under partial failure.
- **b) 2/10** — wrong; replication enables operation.
- **c) 1/10** — wrong; durable + replicated.
- **d) 1/10** — wrong; HA is core.

**Correct Answer:** Distributed replication + quorum; running processes continue with minimal interruption; failed nodes catch up on recovery.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/architecture/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "partial outage", "broker node unreachable", "impact and recovery." HA / fault-tolerance question.

**Въпросът → Solution Framing.** "How handles partial failure" — изпитва се knowledge на Zeebe architecture.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe има partitioned + replicated + quorum-based architecture, че HA е core, че recovery е automatic. Това е знание за Zeebe distributed architecture.

---

## Question 59: Managing the Development Process (Weighting: 15%)

**Scenario:** A team plans to migrate running instances from BPMN v3 to v4. v4 made a **breaking change** — a Service Task was renamed and the worker subscribes to a different task type now. The team wants to know if this migration is feasible.

**What kinds of BPMN changes make Process Instance Migration impossible (or risky)?**

- **a)** Migration requires the source and target flow nodes to be **mappable** — for each active token in a source flow node, the migration plan must declare which target flow node it moves to. **Breaking changes** that complicate this: (1) a flow node was **removed** with no equivalent in v4 → must cancel or modify; (2) the **flow node type changed** (e.g., Service Task → User Task) → migration may fail or produce inconsistent state; (3) **internal state shape changed** drastically. For the scenario's "task renamed + different task type": map the old node ID to the new node ID in the migration plan; running tokens move to the renamed node. The new task type means the worker subscription must be in place for the new type. Migration is feasible **with proper mapping**. Documentation: [Process Instance Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **b)** Any breaking change makes migration impossible — overstated; many breaking changes are migration-mappable. Documentation: [Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **c)** Renaming is always fine; no mapping needed — wrong; explicit mapping required. Documentation: [Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **d)** Migration is always possible — wrong; some changes (e.g., removing a flow node that has active tokens with no equivalent) are problematic. Documentation: [Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Process Instance Migration requires a **migration plan** that maps source flow nodes to target flow nodes (by ID). For each running instance, active tokens are moved per the mapping. Changes that work:
  - **Renaming** flow nodes (just map old ID → new ID).
  - **Inserting** new flow nodes (active tokens past the insertion point don't see them; ones before see them when execution reaches there).
  - **Changing flow node attributes** that don't break execution semantics.

  Changes that don't work cleanly (and may require pre-migration cancellation or Modify-Instance interventions):
  - **Removing** flow nodes that have active tokens (no target to map to).
  - **Changing flow node type** (Service Task → User Task) — engine may reject or produce unexpected behaviour.
  - **Drastically different scope structures** (subprocess restructuring).

  For "renamed Service Task with new task type": yes, migrate by mapping old node ID → new node ID. The worker subscription change is independent — ensure the new worker is registered before activating migrated tokens.

- **Option b) — Overstated.** Many breaking changes are mappable.

- **Option c) — Wrong.** Explicit mapping needed.

- **Option d) — Wrong.** Some changes don't migrate cleanly.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Migration requires explicit mapping; some changes are mappable, others problematic.
- **b) 4/10** — overstated; many breaking changes mappable.
- **c) 3/10** — wrong; mapping required.
- **d) 4/10** — wrong; not always possible.

**Correct Answer:** Migration requires explicit source→target node mapping; renames are mappable; some changes (remove, type change) are problematic.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "breaking change", "renamed", "different task type." Migration feasibility question.

**Въпросът → Solution Framing.** "What changes make migration impossible" — изпитва се migration constraints.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че migration plan maps source→target, че renames mappable, че removals + type changes problematic. Това е знание за migration constraints.

---

# Section 8 — Dev Environment Setup (Question 60)

> Weight 1% • Topics: Camunda 8 Run configuration customisation.

---

## Question 60: Dev Environment Setup (Weighting: 1%)

**Scenario:** A developer running **Camunda 8 Run** locally wants to **customise configuration** — change the default port (Operate from 8080 to 9090 to avoid a clash with another local service), set a custom data directory, configure log levels. They're looking for the right configuration mechanism.

**How does Camunda 8 Run support configuration customisation?**

- **a)** Camunda 8 Run typically supports configuration via **environment variables** (set before starting the binary), **command-line arguments** (passed at start), and **application.yaml-style config files** (typical Spring Boot mechanism). For port changes: set `OPERATE_SERVER_PORT=9090` (env var) or pass `--server.port=9090`. For data directory: configure via env var or config file. Log levels: standard Spring Boot logging config (`logging.level.root=DEBUG`, etc.). The exact env var names depend on the Camunda 8 Run version — check the official docs. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **b)** Camunda 8 Run has no configuration options; defaults are hardcoded — incorrect; customisation is supported. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **c)** Configure only via UI after starting — incorrect; pre-startup configuration is the canonical path. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **d)** Customisation requires source code modification — incorrect; configuration mechanisms are exposed externally. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Run is built on Spring Boot conventions for each component (Operate, Tasklist, Zeebe gateway, Identity). Configuration follows the standard Spring Boot precedence:
  - **Command-line arguments** (highest precedence): `--server.port=9090`.
  - **Environment variables** (typical for containerised / OS-level config): `OPERATE_SERVER_PORT=9090` (the env var name maps from the property by uppercasing + replacing `.` with `_`).
  - **application.yaml / application.properties files** (the default config file in the binary's config directory; can be overridden by external file via `--spring.config.location=...`).
  - **Defaults** (lowest precedence; baked into the application).

  For Camunda 8 Run specifically: common customisations include port (`server.port`), data directory (`camunda.data.dir` or similar), Identity / IDP setup (for advanced auth), log levels. Verify the docs for current property names per Camunda 8 Run version.

- **Option b) — Wrong.** Customisation supported.

- **Option c) — Wrong.** Pre-startup config.

- **Option d) — Wrong.** No source modification needed.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Spring Boot precedence: command-line > env vars > config file > defaults.
- **b) 1/10** — wrong; customisation supported.
- **c) 2/10** — wrong; pre-startup config canonical.
- **d) 1/10** — wrong; configuration externalised.

**Correct Answer:** Spring Boot-style config — command-line arguments, environment variables, application.yaml file; in precedence order.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "customise configuration", "change port", "data directory", "log levels." Configuration mechanism question.

**Въпросът → Solution Framing.** "How supports customisation" — изпитва се knowledge на Spring Boot configuration precedence + Camunda 8 Run packaging.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 8 components са Spring Boot apps, че config follows command-line > env > file > defaults precedence, че Camunda 8 Run external configuration. Това е знание за Camunda 8 Run customisation.

---

# Закриваща секция — Set 8

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

**Препоръка за тренировка (Set 8):**
1. **Open-book проход** — чети всеки 🔍 Explanations + Three-Skills Decomposition; не таймирай.
2. **Closed-book timed run** — 75-минутен таймер; запиши отговорите си; цел: ≥ 39/60.
3. **Анализ на грешки:** за всяка грешка кои от 3-те skills ти липсваше (Diagnostic Comprehension / Solution Framing / Mechanism Knowledge).

**Чести грешки в Set 8 (грешен axis вместо грешен отговор):**
- **Q1 (3 Pools + Message Flows)** — пътане с Lanes за multi-org; Lanes = internal teams, Pools = separate orgs.
- **Q2 (Escalation Throw + Event Subprocess)** — пътане с Error Throw за business escalation; Error е system fault, Escalation е business event with semantic meaning.
- **Q3 (empty MI = zero iterations)** — пътане с "Incident on empty" или "1 instance with null"; empty list е valid degenerate case.
- **Q4 (Non-interrupting + Cycle для recurring reminders)** — пътане с Interrupting (cancels host) или Duration (single-shot).
- **Q6 (Inclusive join waits only for taken branches)** — пътане с Parallel-style "wait for all" semantic; Inclusive's smart join.
- **Q11 (Headers vs Input Mapping)** — пътане с "use Headers for both" — Headers са static, Input Mapping е dynamic.
- **Q13 (default flow taken only когато no other matches)** — пътане с "always-also" semantic; default е fallback.
- **Q20 (Boundary subscription scoped to activity lifetime)** — пътане с "process-instance scope" — boundary е activity-scoped.
- **Q23 (PRIORITY vs FIRST vs OUTPUT ORDER)** — пътане between PRIORITY (single highest by output-value list) and FIRST (single by row order).
- **Q34 (idempotency for at-least-once)** — пътане с "retries = 0" или "Error Boundary"; idempotency е the canonical recourse for double-charging.
- **Q41 (autoComplete = false async pattern)** — пътане с "Boundary Event" — autoComplete=false е the Spring Zeebe async pattern.
- **Q44 (SaaS vs SM API consistency)** — пътане с "completely different" — APIs consistent, differences in base URL + auth endpoint.
- **Q53 (Modify supports add + cancel + variables)** — пътане с "only cancel" — Modify Instance handles add and cancel.
- **Q55 (Call Activity for reuse, Embedded for one-parent)** — пътане с "always one" — depends on reuse.
- **Q59 (migration requires explicit mapping)** — пътане с "always possible" or "renames need no mapping" — mapping always required, some changes problematic.

**Свежи Set 8 сценарии (distinct от Sets 1-7):**

Modeling: B2B supply-chain 3 Pools + Message Flows, Escalation Throw + Event Subprocess for business escalation, empty MI = zero iterations, Non-interrupting + Cycle for recurring reminders, Transaction Subprocess detailed pattern, Inclusive Gateway "smart join", None Throw passive marker, Standard Loop vs Multi-Instance distinction, Event-Based Gateway race with diverging paths.

Configuring Processes: process-scoped vs task-local variable scopes, Headers (static) vs Input Mapping (dynamic), dynamic retries via FEEL expression, Inclusive Gateway default flow semantics, dynamic loopCardinality via FEEL, Document Handling large file design, IDP human-in-the-loop pattern, Element Template inheritance (none + duplicate-and-customise), AI Agent system prompt configuration, R30/PT24H bounded cycle, Boundary subscription activity-scoped lifecycle, multiple Start Events (Timer + None), JSON variable serialisation.

DMN: PRIORITY uses output value list ordering, input expression vs input entry vocabulary, Boxed Context decomposed FEEL, FEEL `+` for string concatenation, Boxed List or Literal Expression for fixed lists, DMN versioning preserves running instances, DMN Tester + Evaluate Decision REST API.

Forms: Text View + FEEL templating for live computed read-only, dot-notation paths for nested binding, Dynamic List Table column schema.

Connectors: Inbound Connector vs custom polling Service Task trade-off, idempotency key for at-least-once, AWS S3 IAM credentials / role assumption, GraphQL via REST or dedicated Connector.

Extensions: FEEL string join / substring / matches / replace / now / max / years and months duration, autoComplete=false async pattern, Node SDK return-or-explicit-complete, zbctl command-orientation + REST API queries, SaaS-SM API consistency, multi-layer Connector validation, Webhook URL discovery, RPA bot versioning, rate limiting via Sequential MI + worker throttling, REST для broad compatibility.

Managing Dev: Web Modeler role-based access (Admin/Editor/Viewer), Operate ES exporter + UI polling architecture, Modify Instance add + cancel + variables, Tasklist sorting + filtering, Call Activity for reuse + Embedded for one-parent, Operate duration filter + Optimize aggregates, Web Modeler version history + diff + revert, Zeebe replication + quorum HA, migration explicit mapping requirements.

Dev Env: Camunda 8 Run Spring Boot config precedence (command-line > env > file > defaults).

**Успех на изпита!**
