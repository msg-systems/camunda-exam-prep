# Camunda 8 C8-CP-DV Mock Exam — Set 7

> **60 въпроса • 75 минути • праг ≥ 65% (39/60) • Blueprint v8.8.0**
>
> Свежи сценарии — distinct от Set 1-6. Всеки въпрос: сценарий + 4 опции (a/b/c/d) + 🔍 Explanations + per-option score 1–10 + Correct Answer + Documentation Link + 🧠 Three-Skills Decomposition.

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

> Weight 15% • Topics: Pools/Lanes, Tasks, Gateways, Events, Subprocesses, Multi-Instance, Compensation, Transactional patterns.

---

## Question 1: Modeling (Weighting: 15%)

**Scenario:** A saga-style flight-booking process consists of three sequential steps: `reserve-seat`, `charge-card`, `send-confirmation`. Each step has an attached Compensation Boundary Event with a handler (`release-seat`, `refund-card`, `cancel-confirmation`). If the `send-confirmation` step fails for any reason — partner system down, network blip, invalid email — the team needs to **trigger the entire compensation chain** so all previously-completed steps are rolled back in reverse order: refund card, then release seat. The trigger must be a single BPMN element placed on the failure path.

**Which BPMN construct fires this compensation cascade?**

- **a)** **Compensation Throw End Event** (or Intermediate Throw Compensation Event) — when reached, the engine looks up all completed activities in the **same scope** that have attached Compensation Boundary Events, and invokes their handlers in **reverse order of completion**. This is the canonical BPMN saga-rollback trigger; it doesn't end the process abnormally, it triggers the compensation handlers and then completes (or the flow continues past it). Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **b)** **Error End Event** with errorCode = "ROLLBACK" — throws a BPMN error that propagates upward to a matching Error Boundary / Event Subprocess Error Start. While it can route the process to an error-handling branch, it does **not** invoke Compensation Boundary handlers; compensation is a distinct event type from error. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** **Terminate End Event** — immediately kills all tokens in the current scope. Stops the process but doesn't invoke any compensation handlers; previously-completed work simply remains "completed" without rollback. Useful for "abort everything now" but not for "undo everything cleanly." Documentation: [Terminate End Event](https://docs.camunda.io/docs/components/modeler/bpmn/terminate-events/)

- **d)** **Signal End Event** with signal name "ROLLBACK" — broadcasts the signal to all subscribed listeners cluster-wide. Different propagation model from compensation (broadcast vs scope-local) and not specific to compensation handlers. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Compensation Throw is the BPMN-spec-defined mechanism for saga rollback. It traverses the **completed activities in the throw event's scope** (in reverse completion order) and invokes each attached Compensation Boundary's handler. This achieves the "undo what was done" semantics cleanly: the modeller attaches a handler per reversible step, throws compensation when needed, and the engine handles the cascade. No custom orchestration needed.

- **Option b) — Wrong event type.** Error events serve a different purpose: signalling exceptional conditions for catch-and-recover. They do not interact with Compensation Boundary Events. Using Error here would route the flow to an error-handling path but the prior reserve-seat / charge-card work would remain in the "completed" state with no rollback occurring.

- **Option c) — Wrong semantics.** Terminate kills all live tokens immediately. It's destructive, not corrective. Completed work isn't reverted — the engine simply stops further execution. For saga rollback this is the worst option: the customer's card stays charged, the seat stays reserved, and nothing notifies anyone.

- **Option d) — Different propagation model.** Signals broadcast cluster-wide. They can be caught by Signal Catch Events anywhere; this is a global notification mechanism, not scope-local rollback. Even if you wire up Signal Catch handlers, you lose the BPMN-spec compensation guarantee of reverse-order invocation in the same scope.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Compensation Throw е canonical саг rollback trigger; reverse-order traversal of completed activities.
- **b) 3/10** — wrong event family; routes flow but doesn't invoke compensation handlers.
- **c) 2/10** — destructive; kills without reverting; worst for sagas.
- **d) 3/10** — broadcast model; not scope-local; loses reverse-order guarantee.

**Correct Answer:** Compensation Throw End Event (or Intermediate Throw Compensation Event).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "saga", "rollback in reverse order", "trigger compensation chain", "attached Compensation Boundary Events." Това е учебникарски пример за BPMN compensation pattern — рaзпознаваш че се иска точно **Compensation Throw**, не error/terminate/signal.

**Въпросът → Solution Framing.** "Fires this compensation cascade" — изпитва се knowledge че BPMN има отделен event type за compensation (не error), и че throw event е trigger-ът.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Compensation walks completed activities in reverse; знаеш че Error propagates upward (different); знаеш че Terminate kills without revert (destructive); знаеш че Signal broadcasts (wrong scope). Това е знание за BPMN event taxonomy и саг pattern.

---

## Question 2: Modeling (Weighting: 15%)

**Scenario:** An e-commerce order-fulfillment process must perform two checks in parallel after the order is placed: `validate-stock` (does the warehouse have inventory?) and `reserve-stock` (lock the items for shipment). Both checks are independent — they don't share state, neither depends on the other — and **both must complete successfully** before shipping. The team wants the model to clearly express that the two run concurrently and that the downstream `ship-order` task waits for both.

**Which gateway pair correctly models this parallel split + synchronisation?**

- **a)** **Parallel Gateway** to split (creates two tokens, one per outgoing branch, both activated immediately) + **Parallel Gateway** to join (waits until all incoming tokens have arrived before producing one outgoing token). This is the BPMN-spec idiom for AND-split / AND-join: both branches run concurrently, downstream waits for both. Documentation: [Parallel Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/parallel-gateways/)

- **b)** **Exclusive Gateway** to split + **Exclusive Gateway** to join. XOR semantics select exactly one outgoing branch based on conditions; the join then passes through any single arriving token. This breaks the requirement — only one check would run, never both. Documentation: [Exclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/)

- **c)** **Inclusive Gateway** to split + **Inclusive Gateway** to join. OR semantics: activates one or more branches based on conditions; join waits for taken branches. Works for "either or both depending on data" but overkill when you always want both — the conditions reduce to `true` and Parallel is the cleaner expression. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **d)** **Event-Based Gateway** to split + Exclusive join. Event-Based races incoming events (Message/Timer/etc.), so the first to fire takes its branch; not applicable to "run two tasks concurrently." Documentation: [Event-Based Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Parallel split + Parallel join is the canonical BPMN pattern for "do A and B at the same time, then continue." The split fires both downstream activities concurrently; the join is a synchronisation point that waits for both to complete and produces a single outgoing token. This is precisely the "fork-join" pattern named in concurrency literature.

- **Option b) — Wrong cardinality.** Exclusive Gateway picks exactly one outgoing branch based on the first true condition (or the default flow). The team needs both branches to run, not just one. Even if all conditions evaluated to true, XOR still chooses the first matching — so the second task would never execute.

- **Option c) — Workable but overkill.** Inclusive runs one-or-many branches based on conditions. If you wanted optional parallel checks (e.g., "skip stock-reserve if stock is irrelevant"), Inclusive would be perfect. But here both are always required, which means conditions reduce to `true` and you've added unnecessary expressive power. Parallel is more idiomatic for unconditional fork-join.

- **Option d) — Wrong primitive.** Event-Based Gateway is a race construct over incoming events (Message/Timer/Signal); it doesn't fork concurrent task execution. The two stock checks aren't events, they're work — this gateway type doesn't fit.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Parallel split + Parallel join е canonical fork-join за AND-semantics.
- **b) 2/10** — XOR runs only one branch; breaks "both must complete."
- **c) 5/10** — works но overkill; Parallel е idiomatic за unconditional fork.
- **d) 2/10** — Event-Based races events, не forks tasks; wrong primitive.

**Correct Answer:** Parallel Gateway to split, Parallel Gateway to join.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/parallel-gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "in parallel", "independent", "both must complete." Класически AND-split / AND-join pattern; разпознаваш че се иска Parallel Gateway pair.

**Въпросът → Solution Framing.** "Gateway pair models parallel split + synchronisation" — изпитва се BPMN gateway semantics: Parallel vs Exclusive vs Inclusive vs Event-Based, кога всеки от тях е canonical.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Parallel = unconditional fork+join, Exclusive = exactly one path, Inclusive = conditional one-or-many, Event-Based = race events. Това е знание за gateway semantics и идиоматичен избор.

---

## Question 3: Modeling (Weighting: 15%)

**Scenario:** A claim-processing process has an Embedded Subprocess containing 5 inner activities. During execution, one of the inner activities may throw a BPMN error with errorCode `"INVALID_CLAIM"`. The team wants to attach an Error Boundary Event to the **subprocess itself** (not to individual inner activities), so that any error propagating out of any inner activity is caught at the subprocess level and routed to a unified error-handling branch. The team is verifying their understanding of where the boundary attaches and how propagation works.

**When a Boundary Event is attached to an Embedded Subprocess element, what does it cover?**

- **a)** **The subprocess as a whole** — the Boundary catches errors (or other events, depending on its type) that **propagate out of any inner activity** and reach the subprocess boundary. Inner activities without their own matching boundary will propagate the error up the scope hierarchy; the subprocess-level boundary is the next available catcher. When the boundary fires (if interrupting), the subprocess is cancelled and flow routes via the boundary's outgoing arrow. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **b)** Each inner activity automatically — Camunda auto-distributes the boundary to all 5 inner activities, attaching a copy of the handler to each. This isn't how BPMN works; if you want per-activity coverage, you must attach a boundary to each individually. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** Only the first inner activity — the boundary's scope is limited to whatever runs first in the subprocess. This is not BPMN semantics; the boundary attaches to its visible host, which is the entire subprocess element. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **d)** The subprocess's parent scope — events bubble all the way to the process root and the boundary effectively listens at that level. This contradicts the BPMN scope rules; boundary scope = visible host, not parent. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN boundary scope rule: a Boundary Event attaches to its visible host. For a Subprocess host, the boundary covers errors / events propagating out of **any** inner activity once they cross the subprocess border. Propagation works as follows: an inner activity throws an error → engine looks for a matching boundary on **that activity** first → if none, propagates to the enclosing scope (the subprocess) → if a matching boundary exists there, it fires. With an Interrupting boundary, the subprocess is cancelled, the inner state is discarded, and flow continues via the boundary's outgoing arrow.

- **Option b) — Wrong distribution model.** BPMN doesn't auto-distribute boundary attachment. If you wanted "every inner activity has the same error handler," you'd model 5 boundaries (or, more idiomatically, attach one boundary at the subprocess level — which is option a). The "auto-distribute" misconception likely comes from confusing Event Subprocesses (which catch in scope) with Boundary Events (which catch from a specific host).

- **Option c) — Wrong scope.** BPMN doesn't single out the first activity. A boundary's scope is its visible host element, and once the boundary is attached to the subprocess element, it covers the whole subprocess regardless of which inner activity throws.

- **Option d) — Wrong propagation rule.** Events do bubble up scope hierarchy if uncaught, but the boundary's scope is its own host — not the host's parent. If the subprocess-level boundary doesn't catch, then propagation continues to the parent (process) scope, where a different listener could pick it up. Each scope has its own boundary attachments.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Boundary covers whole subprocess; errors propagating out of inner activities are caught at the subprocess border.
- **b) 3/10** — false distribution; BPMN doesn't auto-attach to inner activities.
- **c) 2/10** — invented scope rule; doesn't reflect BPMN semantics.
- **d) 3/10** — confuses scope hierarchy; boundary scope = visible host, not parent.

**Correct Answer:** The subprocess as a whole — Boundary catches events propagating out of any inner activity to the subprocess border.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Boundary on subprocess (not inner activities)", "propagating out of any inner activity", "unified error-handling." Това е въпрос за boundary scope rule, не за избор на event type.

**Въпросът → Solution Framing.** "Boundary attached to subprocess covers" — изпитва се BPMN scope rule: к-ъм какво attach-ва boundary и как се propagate-ват events.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че boundary attach-ва towards visible host, че errors bubble up scope hierarchy, че няма auto-distribution to inner activities, че scope ≠ parent. Това е знание за BPMN propagation rules.

---

## Question 4: Modeling (Weighting: 15%)

**Scenario:** A registration process runs **exactly 5 verification checks** in sequence (or parallel — separately decidable), and the number 5 is **fixed at design time** — it doesn't depend on any process variable. The team is configuring Multi-Instance and wonders how to specify a static count without using an inputCollection.

**Which Multi-Instance configuration fits a known compile-time fixed count?**

- **a)** Set **`loopCardinality = 5`** on the Multi-Instance marker — Zeebe creates exactly 5 inner instances. No `inputCollection` / `inputElement` is needed because there's no collection to iterate; the engine simply spawns the count of instances. Each instance has access to `loopCounter` (1..5) as a built-in scope variable. This is the BPMN-spec way to express a static MI count. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Use `inputCollection = [1, 2, 3, 4, 5]` — works because the list has 5 elements, but it's verbose, encodes the count as data rather than configuration, and doesn't communicate "static count" clearly to readers. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Model 5 explicit task elements in sequence — defeats the purpose of MI (DRY, single visual element), and if the count ever changes you have to re-model. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** MI requires `inputCollection`; static count not supported — incorrect; `loopCardinality` is part of BPMN MI spec specifically for static counts. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `loopCardinality` is the BPMN-standard attribute for a static instance count. Set to a number (or a FEEL expression that evaluates to a number at MI activation), the engine spawns that many instances. Inside each instance, the built-in `loopCounter` variable (1-based index) is available for identifying which iteration you're in. This is the cleanest way to model "do N times" when N is known at design time.

- **Option b) — Workable but verbose.** Using a 5-element list as `inputCollection` produces the same runtime behaviour (5 instances). The downsides: (1) communicates "iterate this list" semantically when the intent is just "do 5 times"; (2) couples the count to a literal list; (3) requires `inputElement` even though you don't use it. `loopCardinality` is more idiomatic for static counts.

- **Option c) — Defeats MI value.** Five copy-pasted task elements lose the DRY benefit of Multi-Instance. Any future change to the inner activity must be replicated 5×, and readers must compare them to confirm they're identical. Use MI for repeated identical work.

- **Option d) — Incorrect.** `loopCardinality` is a first-class MI attribute. The BPMN spec explicitly supports it; Zeebe implements it.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. loopCardinality = static count; canonical BPMN MI attribute.
- **b) 5/10** — works но verbose; encodes count as data not config.
- **c) 2/10** — defeats DRY; 5× maintenance burden.
- **d) 1/10** — невярно; loopCardinality е supported and standard.

**Correct Answer:** Set loopCardinality = 5 on the Multi-Instance marker.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "exactly 5", "fixed at design time", "without inputCollection." Това signal-ира че се иска `loopCardinality` като alternative на collection-driven MI.

**Въпросът → Solution Framing.** "Configuration fits static count" — изпитва се knowledge на двата MI configuration modes: cardinality-based vs collection-based.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че loopCardinality е BPMN attribute за static count, че inputCollection е за dynamic lists, че loopCounter е built-in scope variable, че копиране на task elements defeats DRY. Това е знание за MI configuration knobs.

---

## Question 5: Modeling (Weighting: 15%)

**Scenario:** A document-publishing process contains an **Embedded Subprocess** ("Approve Document") with three inner User Tasks: legal review, marketing review, compliance review. The team is drawing the subprocess and wonders whether the inner flow needs its own Start Event, or whether execution simply begins at the leftmost inner activity automatically.

**Does an Embedded Subprocess require an explicit Start Event inside it?**

- **a)** **Yes** — an Embedded Subprocess must contain **exactly one None Start Event** that defines where the inner flow begins. (Event Subprocesses additionally use typed Start Events like Message/Error/Signal/Timer for their trigger conditions.) Without a Start Event, the BPMN model is invalid; Zeebe will reject deployment via the validator. Documentation: [Embedded Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/)

- **b)** No — execution starts at the leftmost activity automatically. This isn't how BPMN is specified; Start Events are required structural elements that mark entry points. Visual position doesn't determine entry. Documentation: [Embedded Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/)

- **c)** Optional — if missing, deployment auto-infers it. Validators / Zeebe don't auto-infer entry points; the model must be explicit. Documentation: [Validation](https://docs.camunda.io/docs/components/modeler/desktop-modeler/validation/)

- **d)** Start Event is required only on the top-level process, not on subprocesses. Incorrect — every executable scope (process, embedded subprocess, event subprocess) requires a defined start. Documentation: [Embedded Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN's structural rules require every scope to declare its entry point via a Start Event. For an Embedded Subprocess, that's a **None Start Event** — a circle with no marker. Exactly one is required. The outgoing arrow of the Start Event defines which inner activity is the first to run. This is enforced both by BPMN validators (in Modeler) and by Zeebe at deployment time.

- **Option b) — Wrong assumption.** "Leftmost wins" is a visual heuristic that doesn't apply to BPMN execution semantics. The model is a directed graph; entry must be explicit. A diagram with two ungrouped activities and no Start Event is ambiguous to the engine.

- **Option c) — Incorrect auto-inference.** Web Modeler / Desktop Modeler validate the model and surface errors when Start Events are missing. Zeebe's deployment validator does the same. No auto-inference happens.

- **Option d) — Misunderstanding of scope rules.** Every scope is independent: the top-level process needs a None or Message Start; each Embedded Subprocess needs a None Start; each Event Subprocess needs a typed Start; each Call Activity references an external process which has its own Start. Subprocesses are first-class scopes, not implicit extensions of the parent.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Exactly one None Start Event required inside Embedded Subprocess.
- **b) 2/10** — false heuristic; visual position не определя execution.
- **c) 2/10** — no auto-inference; validator rejects.
- **d) 2/10** — every scope requires its own Start Event.

**Correct Answer:** Yes — exactly one None Start Event is required inside an Embedded Subprocess.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Embedded Subprocess", "inner flow", "needs its own Start Event." Това е BPMN structural rule question, не sequence или branching въпрос.

**Въпросът → Solution Framing.** "Requires explicit Start Event" — изпитва се BPMN scope semantics, специфично что всеки scope (subprocess included) е independent flow.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BPMN scopes need explicit entry points, че validators enforce това, че Embedded Subprocess = None Start, че Event Subprocess = typed Start. Това е знание за BPMN structural rules.

---

## Question 6: Modeling (Weighting: 15%)

**Scenario:** A telco service-activation process must, at one specific point, dispatch SMS notifications to **two recipients in parallel**: the customer AND a partner system. Both dispatches are independent (different phone numbers, potentially different SMS gateways) but must complete (or both fail) before the process continues. The team is choosing between three modelling approaches and wants to understand the trade-offs.

**Which BPMN modelling approach fits, and what are the trade-offs?**

- **a)** Two **parallel Send Tasks** within a Parallel Gateway split / Parallel Gateway join — each Send Task carries its own task type, input mapping, retries, and Error Boundary if needed. Visually obvious that two dispatches happen in parallel; each can fail / retry independently. Best for fixed count (2) where each dispatch has distinct configuration. Documentation: [Send Task](https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/) + [Parallel Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/parallel-gateways/)

- **b)** A **single Send Task** that internally sends to both recipients — the worker code handles the two dispatches sequentially or concurrently. Hides parallelism in worker code, harder to retry one dispatch independently, but reduces BPMN diagram complexity. Documentation: [Send Task](https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/)

- **c)** A **Parallel Multi-Instance Subprocess** over `[customerNumber, partnerNumber]` — iterates over the recipients list in parallel; each instance does one dispatch. Most flexible if recipient count grows beyond 2 in the future. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** **All three patterns are reasonable** — pick by clarity vs. flexibility. Two Send Tasks for fixed, visible count; single Send Task to hide complexity; Parallel MI for dynamic recipient count. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

**🔍 Explanations & Correct Answer**

- **Option d) — Correct.** This is a trade-off question, not a "single right pattern" question. All three modelling approaches achieve the requirement; the best choice depends on which property matters most:
  - **Two Send Tasks (a):** Best when count is fixed and each dispatch has different configuration (e.g., different SMS gateway, different retry policy). Visually clear; each task observable separately in Operate.
  - **Single Send Task (b):** Best when you want to hide the multi-dispatch detail from the BPMN reader and treat "notify recipients" as one atomic step. Drawback: cannot retry one recipient independently.
  - **Parallel MI (c):** Best when recipient count is dynamic (might be 1, 2, 5 depending on customer profile). Most flexible; future-proof.

  An experienced BPMN modeller picks based on context. The exam often tests this judgement — "all three valid, pick by trade-off" is a legitimate answer.

- **Option a) — Partially correct.** Two Send Tasks is the cleanest pattern for fixed-count parallel dispatch. Selected as primary if the question demanded clarity over flexibility.

- **Option b) — Partially correct.** Single Send Task hides complexity, which is a reasonable trade in some scenarios (e.g., the dispatches are tightly coupled and shouldn't be retried independently).

- **Option c) — Partially correct.** Parallel MI is the most flexible; if recipient count might change, this is the future-proof choice.

**Per-option scoring (1–10):**
- **a) 7/10** — partial — clean for fixed 2; loses flexibility.
- **b) 5/10** — partial — hides parallelism; loses observability.
- **c) 6/10** — partial — flexible; future-proof но overkill for fixed 2.
- **d) 10/10** — верен — all three valid; pick by clarity vs. flexibility trade-off.

**Correct Answer:** All three patterns are reasonable; pick by clarity (parallel Send Tasks), simplification (single Send Task), or flexibility (Parallel MI).

**Official Documentation Link:** https://docs.camunda.io/docs/components/best-practices/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "two recipients in parallel", "different SMS gateways", "future may grow." Multiple valid modelling approaches; задачата изпитва trade-off reasoning, не recall на единичен pattern.

**Въпросът → Solution Framing.** "Trade-offs" — explicit phrasing signal-ира че верният отговор е "depends on context", не absolutism.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че parallel Send Tasks дават visibility + independent retry, че single Send Task hides complexity, че Parallel MI scale-ва за dynamic count. Това е знание за BPMN modelling choices и contextual judgement.

---

## Question 7: Modeling (Weighting: 15%)

**Scenario:** A finance-processing workflow has a critical **transactional section** of 3 Service Tasks: `reserve-funds`, `transfer-funds`, `confirm-transfer`. The team needs strict transactional semantics: **either all 3 succeed and the section commits, or all 3 are rolled back via compensation** if any fails. The team is considering using the BPMN Transaction Subprocess construct.

**Which BPMN construct expresses transactional semantics?**

- **a)** A **Transaction Subprocess** (a specific Subprocess type rendered with a **double border**) containing the 3 tasks. Inside the transaction, each reversible task has a Compensation Boundary Event with its handler. A **Cancel End Event** inside the transaction triggers a **Cancel Boundary Event** on the transaction; the cancel propagates compensation to all attached handlers. Used for ACID-like rollback semantics in BPMN. Documentation: [Transaction Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/) + [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **b)** A regular **Embedded Subprocess** with manual Compensation Throw at the end on the failure path — works but doesn't formalise the "all-or-nothing" semantics; the modeller has to remember to throw compensation explicitly. Documentation: [Embedded Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/)

- **c)** Three separate Service Tasks with explicit reverse-paths to compensation tasks. Workable but verbose, doesn't express the transactional intent, harder to maintain. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Camunda 8 doesn't support transactions. Inaccurate — transactional patterns are supported via Compensation + (where available) Transaction Subprocess; verify your Zeebe version's support level. Documentation: [BPMN coverage](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct (with caveat).** Transaction Subprocess is the BPMN-spec construct for transactional semantics: visually double-bordered, contains tasks with compensation handlers, ends in a Cancel End Event for rollback. Cancel Boundary on the transaction triggers compensation on all completed inner activities. This is the formal "saga with transactional intent" pattern. **Caveat:** Zeebe's level of support for Transaction Subprocesses has evolved across versions; verify the current BPMN coverage docs for your Zeebe version. In some versions you may need to fall back to option b (Embedded + Compensation).

- **Option b) — Workable fallback.** Embedded Subprocess + explicit Compensation Throw at the failure end is functionally similar but doesn't carry the transactional-semantics declaration. The double-border visual cue and Cancel End Event semantics are absent. Use this when Transaction Subprocess isn't supported.

- **Option c) — Verbose and unclear.** Wiring 3 reverse paths manually loses the transactional abstraction. Each path needs explicit conditional flow; readers must reverse-engineer the intent.

- **Option d) — Incorrect.** Compensation is supported; even if pure Transaction Subprocess support varies, the underlying transactional pattern (compensation + cancel) is achievable.

**Per-option scoring (1–10):**
- **a) 9/10** — верен с caveat. Transaction Subprocess е BPMN-spec construct; verify Zeebe version support.
- **b) 6/10** — workable fallback when Transaction Subprocess unavailable.
- **c) 4/10** — verbose; loses transactional abstraction.
- **d) 3/10** — невярно; transactional patterns supported via compensation.

**Correct Answer:** Transaction Subprocess (where Zeebe version supports) with Cancel End + Compensation Boundary handlers; fallback to Embedded + Compensation if needed.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "transactional section", "all-or-nothing", "rollback via compensation." Класически BPMN Transaction Subprocess pattern.

**Въпросът → Solution Framing.** "Expresses transactional semantics" — изпитва се knowledge на specific BPMN Transaction construct vs alternatives.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Transaction Subprocess е double-bordered, Cancel End + Cancel Boundary е the trigger, че Zeebe version coverage varies, че Embedded + Compensation е fallback. Това е знание за BPMN transactional patterns + practical Zeebe coverage caveats.

---

## Question 8: Modeling (Weighting: 15%)

**Scenario:** A document-publishing process has a **None Intermediate Event** placed between two activities on the happy path. The event is unconnected to messages, timers, errors, or signals — just a plain circle. A new team member asks: "What does this empty circle do? Does the process pause?"

**What does a None Intermediate Event signify in Camunda 8?**

- **a)** **Marks a process milestone** — a visual landmark indicating something significant happened (e.g., "document approved", "data validated"). No engine action: execution passes through without pause, error, or external interaction. Useful for documentation, audit trails, and reading clarity; readers see at a glance where the process has reached significant milestones. Documentation: [None Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/)

- **b)** Pauses execution until the user clicks "continue" — incorrect; None doesn't have an interaction model. User-interaction is a User Task, not a None Event. Documentation: [None Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/)

- **c)** Generates a log event automatically — partial truth; an audit trail may record the event passage but generating a custom log isn't the primary semantic. Documentation: [None Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/)

- **d)** Splits the flow into parallel branches — None doesn't have any splitting behaviour; that's the role of a Parallel Gateway. Documentation: [None Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** A None Intermediate Event is a **passive landmark**. Execution flows through it without any side effect: no pause, no error, no message, no timer. Its purpose is documentary — to give readers a clear visual marker of progress milestones. Examples: after a "validate" task, place a None Intermediate Event labelled "Data Validated" so downstream readers see this state was achieved. Operate / Optimize may show passage through it in instance history, but the engine doesn't take any action.

- **Option b) — Wrong concept.** Pause-for-user-click would be a User Task or, more generally, a wait state (Receive Task, Message Catch Event). None Events don't wait.

- **Option c) — Partial misconception.** Event passage may appear in instance audit / history, but generating a log is a side-effect of the audit system, not the event's defined semantic. The event isn't "for logging"; it's for visual clarity.

- **Option d) — Wrong construct.** Splitting is the job of Parallel / Inclusive / Exclusive / Event-Based Gateways. None has no such role.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. None Intermediate = milestone landmark; passive pass-through.
- **b) 2/10** — невярно; не е wait state.
- **c) 4/10** — partial — audit recording е side-effect, не the primary purpose.
- **d) 1/10** — confuses event with gateway.

**Correct Answer:** Marks a process milestone — passive landmark with no engine action.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/none-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "None Intermediate Event", "empty circle", "does the process pause?" Това е въпрос за event semantics, разпознаваш че се иска knowledge за None Event behaviour.

**Въпросът → Solution Framing.** "Signify" — изпитва се event type taxonomy: какво прави всеки тип, какво **не** прави.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че None е passive marker, че User Task / Receive Task pause-ват, че Gateway-ите split-ват, че audit recording е страничен ефект. Това е знание за event semantics.

---

## Question 9: Modeling (Weighting: 15%)

**Scenario:** A user-onboarding process is required by SLA to **complete within 7 days** from instance start. If the 7 days elapse and the process is still running, the entire process must be aborted and the user notified that onboarding timed out. The 7-day cap applies to the **whole process**, not to any individual task.

**Which BPMN construct fits the overall process-level timeout?**

- **a)** Wrap the entire process flow (or the relevant section) in a **Subprocess** and attach an **Interrupting Timer Boundary Event** with duration `P7D` to that subprocess. The Timer fires at 7 days from subprocess start; being interrupting, it cancels the entire subprocess (and its inner activities) and routes to a "notify timeout" path. Documentation: [Timer Boundary Event](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/) + [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **b)** Set a "process-level due date" attribute on the process definition — Camunda 8 doesn't have a native process-level due-date attribute that auto-aborts; due dates are User-Task-level metadata for display, not auto-cancel triggers. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** Attach a 7-day Timer Boundary Event to **each** task individually — wasteful and incorrect: this caps each task at 7 days (so individual tasks could each take 7 days), not the overall process at 7 days. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Camunda 8 doesn't support process-level timeouts. Incorrect — the subprocess-wrap + Timer Boundary pattern is the canonical way to express it. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The canonical pattern for "process-level overall timeout" in BPMN: wrap the work in a Subprocess element, attach an Interrupting Timer Boundary Event with the duration. The boundary fires once the timer expires (measured from subprocess start). Being **interrupting**, it cancels the entire subprocess scope — all inner activities, in any state — and routes via the boundary's outgoing arrow to a timeout-handler path. Crucially, the timer starts when the subprocess starts, so wrapping the entire main flow gives you the "from instance start" semantics.

- **Option b) — Incorrect attribute.** There's no native process-level due-date attribute in Camunda 8 that triggers auto-cancellation. User Tasks have `dueDate` attributes (used by Tasklist for display: "overdue" badges, sorting); they don't auto-cancel anything.

- **Option c) — Wrong scope of timer.** Per-task Timer Boundaries time **each task** individually. If task A takes 6 days and task B takes 2 days, that's 8 days total — but each individual task is under 7 days, so per-task timers don't fire. The aggregate overrun is unbounded.

- **Option d) — Incorrect.** The subprocess + boundary pattern achieves process-level timeout cleanly.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Subprocess wrap + Interrupting Timer Boundary P7D е canonical pattern.
- **b) 3/10** — confuses User Task dueDate with process-level cancel.
- **c) 4/10** — wrong scope; caps individual tasks, not overall process.
- **d) 1/10** — невярно; pattern exists.

**Correct Answer:** Wrap the process flow in a Subprocess and attach an Interrupting Timer Boundary Event with duration P7D.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "complete within 7 days", "whole process", "abort if exceeds." Класически overall-timeout pattern в BPMN, не per-task timer.

**Въпросът → Solution Framing.** "Process-level timeout" — изпитва се BPMN pattern recognition за overall caps.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че subprocess-wrap + Timer Boundary е canonical, че Timer Boundary attaches to scope, че Interrupting cancels, че User Task dueDate е metadata, че per-task timers cap individual tasks. Това е знание за boundary-on-subprocess pattern.

---

# Section 2 — Configuring Processes (Questions 10-22)

> Weight 22% • Topics: Zeebe execution semantics, FEEL conditions, Multi-Instance, Document Handling, IDP, Element Templates, AI orchestration.

---

## Question 10: Configuring Processes (Weighting: 22%)

**Scenario:** A team's Java Spring Boot service hosts multiple workers subscribing to different task types (`process-payment`, `validate-claim`, `send-email`, ...). Each worker has slightly different processing time characteristics — `process-payment` is fast (seconds), `validate-claim` is slow (~minutes). The team wants to set a **default job-activation timeout** at the worker level that applies unless overridden per worker.

**Where in Spring Zeebe is the default timeout configured, and how is it overridden per worker?**

- **a)** Set a **global default** in `application.yaml` under `camunda.client.zeebe.defaults.timeout` (or equivalent property), then **override per worker** via `@JobWorker(timeout = ...)` annotation. The annotation value wins when present; otherwise the global default applies. This is the standard Spring Boot configuration cascade: properties as defaults, annotations as overrides. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** Set on the BPMN element via `zeebe:taskDefinition` extension — but BPMN-level config can't carry worker-side activation timeout; the `retries` attribute on BPMN sets retry count, not activation duration. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** Configure in the Zeebe broker's `application.yaml` — broker has its own defaults for some parameters, but worker-side activation timeout is a worker config, not a broker config; clients control how long they hold jobs. Documentation: [Zeebe](https://docs.camunda.io/docs/self-managed/concepts/architecture/)

- **d)** Activation timeout is fixed at 5 minutes for all workers; not configurable. Incorrect; SDK exposes this parameter explicitly. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Spring Zeebe follows Spring Boot conventions: properties in `application.yaml` provide defaults, annotation attributes override per usage. For `timeout`, the default-then-override cascade lets you tune broadly (e.g., 5 min global) while customising specific workers (e.g., `@JobWorker(type = "validate-claim", timeout = PT15M)` for a slow worker). The exact property name may vary by Spring Zeebe version — consult the docs — but the pattern is standard.

- **Option b) — Wrong layer.** BPMN's `zeebe:taskDefinition` extension carries `type` (task type for worker subscription) and `retries` (retry count on failure). It does **not** carry activation timeout because timeout is a property of the **worker subscription**, not the task definition. Multiple workers might subscribe to the same type with different timeouts.

- **Option c) — Wrong component.** Broker config controls broker behaviour (partitions, log settings, etc.). Worker activation timeout is exchanged via the gRPC ActivateJobs call — the worker tells the broker "give me jobs and lock them for me for N seconds." Broker doesn't set it; client does.

- **Option d) — Incorrect.** Activation timeout is configurable. Default values vary by SDK version (often 5 min as a safe default); production workers should tune per workload.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Global default in application.yaml + per-worker @JobWorker override е canonical Spring pattern.
- **b) 3/10** — wrong layer; BPMN не carries worker-side activation timeout.
- **c) 3/10** — wrong component; broker doesn't set client timeouts.
- **d) 1/10** — невярно; configurable.

**Correct Answer:** Set global default in application.yaml; override per worker via @JobWorker(timeout=...).

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "default activation timeout at the worker level", "override per worker." Spring Boot configuration cascade — properties + annotation override.

**Въпросът → Solution Framing.** "Where configured and how overridden" — изпитва се knowledge на Spring Zeebe configuration model.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че activation timeout е worker-side concern (не broker, не BPMN), че Spring Boot defaults + annotation override е standard pattern, че BPMN retries е different attribute. Това е знание за worker configuration architecture.

---

## Question 11: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task `process-refund` has `retries = 3` configured. The worker fails on first attempt with a transient error. The team is wondering: between the failure and the next activation, does Zeebe wait some interval (linear, exponential backoff), or re-activate immediately?

**What is Zeebe's default retry backoff behavior between failed attempts?**

- **a)** Zeebe does **not impose a backoff** at the broker level by default — when a worker fails a job, the retry count decrements and the job becomes **immediately re-activatable**. The next ActivateJobs call from any subscribed worker will pick it up. Backoff strategies are the worker's responsibility (sleeping before completing the fail, or applying a delay in the worker logic). For broker-controlled backoff, the BPMN can declare `zeebe:taskDefinition` with a `retryBackoff` attribute (where supported) to instruct the broker to delay re-activation. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Zeebe applies a default **linear backoff** of 1 second per retry — incorrect; no automatic broker backoff is part of Zeebe's specified behaviour. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Zeebe applies **exponential backoff** (1s, 2s, 4s, 8s...) by default — also incorrect; no default exponential strategy at broker level. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Zeebe waits 1 minute between retries — fixed default — also incorrect. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe's design philosophy: keep the broker simple and let workers / BPMN control retry timing. Default broker behaviour on `FailJob` is to decrement retries and put the job back into the activatable pool — the next worker poll picks it up. This may be milliseconds after the failure if there's a worker waiting. For controlled backoff, two options: (1) the BPMN declares `retryBackoff` on the task definition (e.g., `PT5S` after each fail) where the broker delays re-activation; (2) the worker itself sleeps before returning the FailJob, holding the activation longer. The default is "no backoff" — design accordingly.

- **Option b) — False default.** No linear backoff is part of Zeebe's spec. The misconception likely comes from C7 (legacy) defaults or other engines.

- **Option c) — False default.** No exponential backoff is the broker default. Workers may implement exponential backoff in their FailJob delay logic, but it's worker-side, not broker-side.

- **Option d) — False default.** No 1-minute wait. The broker doesn't enforce a delay.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. No default backoff; immediate re-activatable; use retryBackoff attribute or worker-side delay.
- **b) 3/10** — false default; не canonical.
- **c) 4/10** — false default; не canonical.
- **d) 2/10** — false default.

**Correct Answer:** No default backoff — immediate re-activation; use retryBackoff attribute (where supported) or worker-side delay for controlled backoff.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "default backoff", "between retries", "linear/exponential." Това е въпрос за broker's retry semantics, специфично за default behaviour.

**Въпросът → Solution Framing.** "Default behavior" — изпитва се knowledge че Zeebe не имposes backoff by default; контролът е worker-side или via retryBackoff attribute.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe broker не has default backoff, че retryBackoff attribute е the controllable knob, че workers могат да sleep before FailJob. Това е знание за retry timing architecture.

---

## Question 12: Configuring Processes (Weighting: 22%)

**Scenario:** A loan-approval process has a User Task `manual-review` that should display a **Camunda Form** in Tasklist. The team has built the form in Web Modeler (it has its own resource ID, e.g., `loan-review-form-v1`) and deployed it to the cluster. They're configuring the User Task to reference this deployed form.

**Which User Task attribute binds the task to the deployed Camunda Form?**

- **a)** Set the User Task's **`formId`** attribute (in Web Modeler property panel: "Form ID" field) to reference the deployed form by its ID — Tasklist auto-fetches the form definition and renders it. Alternative for external forms: `formKey` referencing an external URL or formal Camunda Form key. The exact attribute name varies; in current Camunda 8 the canonical reference is `zeebe:formDefinition formId="..."`. Documentation: [User Tasks Forms](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** Set `formUrl` to a hosted form page — possible for external forms but external-URL forms lose Camunda's built-in form rendering features (variable binding, validation). Use only when integrating with an external form system. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** Use `externalReference` to an HTML page — same caveat as (b); external rendering, less integrated. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Embed the Form XML inline in the BPMN — incorrect; Camunda 8 keeps Forms as separate deployed resources, not inlined in BPMN. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8's canonical form binding for User Tasks references a deployed Form by ID. In BPMN XML this appears as `<zeebe:formDefinition formId="loan-review-form-v1" />` inside the User Task's extensionElements. Web Modeler exposes this via the property panel ("Type: Camunda Form (linked)" + Form ID field). Tasklist sees the formId on the activated task, fetches the form definition from the cluster, and renders it. Form data binds to process variables on completion.

- **Option b) — External form binding.** `formKey` (or equivalent external-URL property) is for hosting forms outside Camunda — e.g., a custom React app or third-party form service. Useful for advanced UI but loses the integrated Tasklist experience.

- **Option c) — Misleading.** "External reference" is similar to (b) — for integrating with external systems. Not the canonical path for Camunda-deployed forms.

- **Option d) — Wrong architecture.** Forms are first-class deployed resources, not embedded in BPMN. Inlining would break Web Modeler's form-editing workflow.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. formId references deployed Camunda Form.
- **b) 5/10** — workable for external forms; loses integrated rendering.
- **c) 5/10** — similar to b; external integration.
- **d) 1/10** — wrong architecture; Forms are separate resources.

**Correct Answer:** Set formId attribute referencing the deployed Form's ID.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "deployed form", "Tasklist auto-render", "formId reference." Това е въпрос за User Task → deployed Form binding.

**Въпросът → Solution Framing.** "Attribute binds task to form" — изпитва се knowledge на formId vs formKey vs external.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че formId е canonical за Camunda Forms, че formKey е external/URL, че forms не са inline. Това е знание за форм integration architecture.

---

## Question 13: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task `compute-decision` is implemented by a worker that returns a structured result `{"approved": true, "score": 87, "comments": "All checks passed"}`. The team wants the next BPMN step (an Exclusive Gateway) to route based on `approved`, but they don't want `score` and `comments` polluting the process variable scope — those should be ignored.

**Which Output Mapping configuration selectively propagates only `approved`?**

- **a)** On the Service Task, add an **Output Mapping**: Target = `decision`, Source FEEL expression = `=approved`. Only `decision` lands in process scope (bound to the worker's `approved` field); `score` and `comments` are discarded. The downstream gateway condition becomes `=decision = true` (or similar). This is the canonical way to control variable propagation. Documentation: [I/O Variable Mappings](https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings)

- **b)** Don't configure any mapping — all three fields propagate to process scope automatically, then ignore the unused ones — works but pollutes scope; downstream gateway must access `=approved` directly; `score` and `comments` clutter variable lists, Operate views, etc. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Use `resultVariable` to capture the whole object as `result`, then access fields via `result.approved` — `resultVariable` is a Business Rule Task attribute (DMN), not a Service Task attribute. Wrong tool. Documentation: [Business Rule Task](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **d)** Modify the worker to return only `approved` — pushes filtering responsibility to the worker. Workable but BPMN-side Output Mapping is the canonical separation of concerns: worker returns its full result, BPMN decides what to propagate. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Output Mapping is BPMN's mechanism for **selective propagation** from task local scope to process scope. Each mapping specifies a target name (becomes a process variable) and a FEEL source expression (read from task local scope, including the worker's returned values). Unmapped task locals are discarded. This keeps process scope tidy and explicitly contracted: only declared mappings appear.

- **Option b) — Workable but pollutes.** Without Output Mapping, Camunda 8's default is typically to merge all returned worker values into process scope. Functional but: (1) all fields visible in Operate (clutters), (2) downstream nodes can accidentally rely on undocumented fields (tight coupling), (3) larger payloads slow broker writes.

- **Option c) — Wrong attribute.** `resultVariable` is for Business Rule Tasks (DMN-returning) and configures the variable name that captures the DMN result. Doesn't apply to Service Tasks.

- **Option d) — Pushes filtering to worker.** Workable but mixes concerns: worker logic is about computing the answer; BPMN logic is about routing and state. Output Mapping puts variable contract decisions in BPMN — easier to change without re-deploying worker code.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Output Mapping selectively propagates fields; clean separation.
- **b) 5/10** — works но pollutes process scope.
- **c) 2/10** — wrong attribute (resultVariable е DMN).
- **d) 5/10** — works но mixes concerns; BPMN-side mapping е cleaner.

**Correct Answer:** Output Mapping: Target=decision, Source=`=approved` (selective propagation).

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "selectively propagate", "ignore other fields", "don't pollute scope." Canonical Output Mapping use case.

**Въпросът → Solution Framing.** "Configuration selectively propagates" — изпитва се knowledge на I/O Mapping vs alternative approaches.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Output Mapping selectively propagates with FEEL, че default merges all, че resultVariable е DMN-specific, че worker-side filtering mixes concerns. Това е знание за variable scope management.

---

## Question 14: Configuring Processes (Weighting: 22%)

**Scenario:** A Multi-Instance Subprocess processes a list of `invoices`. Inside each instance, the team wants to log a message like "Processing invoice 3 of 7" — they need to know which iteration is currently running.

**Which engine-provided variable inside MI instances holds the 1-based index?**

- **a)** **`loopCounter`** — engine sets this variable inside each MI inner-instance scope as a 1-based index (1, 2, 3, ..., N for N instances). Available as a FEEL variable in any expression inside the MI scope, including for logging. The BPMN spec defines this as part of standard MI semantics. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** `iterationIndex` — invented name; not a FEEL / BPMN variable. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** `instanceNumber` — also invented; not the variable. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** No engine-provided index — the team must compute it from inputCollection / inputElement positions manually. Incorrect; `loopCounter` is part of the MI engine. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `loopCounter` is BPMN's standard MI scope variable. Camunda 8 / Zeebe exposes it inside each inner-instance scope. Typical use: log messages ("Iteration 3"), conditional logic per index, debugging output. 1-based — important detail (some languages use 0-based; FEEL/BPMN use 1-based). Available alongside the `inputElement` variable (the current item from `inputCollection`) and the additional engine helpers like `numberOfInstances`, `numberOfActiveInstances`, `numberOfCompletedInstances`.

- **Option b) — Wrong name.** `iterationIndex` isn't a FEEL / BPMN variable. Modellers sometimes invent it from familiarity with other languages.

- **Option c) — Wrong name.** `instanceNumber` similarly not in the spec.

- **Option d) — Incorrect.** Engine provides `loopCounter`; manual computation isn't needed.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. loopCounter — BPMN/Zeebe MI 1-based scope variable.
- **b) 3/10** — wrong name.
- **c) 3/10** — wrong name.
- **d) 1/10** — невярно; engine provides it.

**Correct Answer:** loopCounter (1-based, engine-set inside each MI instance).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "iteration index", "engine-provided", "1-based." Това е въпрос за MI built-in scope variable.

**Въпросът → Solution Framing.** "Variable holds 1-based index" — изпитва се knowledge на MI engine helpers.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BPMN MI стандарт се enforce-ва loopCounter, че FEEL/BPMN са 1-indexed, че engine provides additional helpers (numberOfInstances etc.). Това е знание за MI scope variables.

---

## Question 15: Configuring Processes (Weighting: 22%)

**Scenario:** A multi-step contract-processing workflow uploads several PDF documents (the original contract, amendments, signed final version) via Document Handling. After the process completes, a compliance officer wants to retrieve **all documents** that were attached to a specific process instance for audit.

**Which approach fits "list all documents for a given instance"?**

- **a)** Query the **Documents API** filtered by process instance ID (or by custom metadata you set at upload time — e.g., `processInstanceKey`). Returns a list of document references with their metadata. The Documents API is designed for this kind of programmatic retrieval; metadata at upload makes filtering straightforward. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **b)** Scan the process variables of the instance via Operate API — each document reference would be stored as a variable; iterate to find them. Workable as a secondary approach, but the Documents API is the canonical metadata-aware path. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Operate UI doesn't expose document attachments — partial truth; Operate may show document-typed variables but isn't an audit-grade document explorer. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Not possible — incorrect; the Documents API supports listing. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Documents API supports filtered listing by metadata. The canonical pattern: at upload, set metadata including `processInstanceKey` (or a custom business identifier). Then query the API filtering on that key — get back the list of documents with their references, sizes, MIME types, upload timestamps. This is the audit-ready path: stable contract, programmatic, indexed (depending on storage backend).

- **Option b) — Workable secondary.** Process variables hold document references; you could enumerate variables and pick out those of document type. But this couples to variable naming conventions and doesn't catch documents uploaded outside the variable model.

- **Option c) — Partially.** Operate shows variables (including document references), but it's a monitoring UI, not an audit-grade document explorer. For programmatic retrieval, use the API.

- **Option d) — Incorrect.** Documents API supports this use case.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Documents API filtered by metadata е canonical audit path.
- **b) 5/10** — workable secondary; coupling to var naming.
- **c) 3/10** — Operate е monitoring, не audit-grade.
- **d) 1/10** — невярно.

**Correct Answer:** Query the Documents API filtered by process instance ID / custom metadata.

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/document-handling/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "list all documents", "specific instance", "for audit." Documents API canonical use case.

**Въпросът → Solution Framing.** "Approach fits listing" — изпитва се knowledge на Documents API filtered listing.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Documents API supports metadata-based filter, че variables couple to naming convention, че Operate е monitoring. Това е знание за Documents API capabilities.

---

## Question 16: Configuring Processes (Weighting: 22%)

**Scenario:** An IDP Application extracts data from invoices. Each extracted field comes with a **confidence score** (0.0 to 1.0). The team wants a downstream gateway to route to human review **if ANY field has confidence below 0.85**, otherwise continue automated processing.

**Which BPMN routing approach fits?**

- **a)** After the IDP task, add an **Exclusive Gateway** with FEEL condition using the `every` quantifier: `=every f in extractedFields satisfies f.confidence >= 0.85` for the automated branch (true = all high-confidence), and the default flow goes to human review. Alternative form: `=some f in extractedFields satisfies f.confidence < 0.85` true → human review. Documentation: [FEEL boolean](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-boolean/) + [Gateways](https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/)

- **b)** Configure IDP to auto-route to human review on low confidence — IDP doesn't have a built-in routing knob; routing is BPMN-level concern. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **c)** Set a `minConfidence` threshold on IDP — IDP may produce confidence scores but doesn't typically auto-fail / route on a global threshold; the threshold check is yours to express in BPMN. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **d)** Cannot check confidence per field in FEEL — incorrect; FEEL has list/quantifier operations for exactly this pattern. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** IDP exposes extracted fields with per-field confidence in the result. FEEL's `every` (universal quantifier) and `some` (existential quantifier) operate on lists/collections. For the "any field below threshold → human review" requirement, the natural expression is either `every confidence >= threshold` (for the all-good path) or `some confidence < threshold` (for the needs-review path). Use one or the other on the Exclusive Gateway's outgoing arrows.

- **Option b) — Wrong layer.** IDP's job is extraction, not orchestration. Routing decisions belong in BPMN. (Some IDP integrations may bundle simple rules, but the canonical separation is: IDP extracts, BPMN routes.)

- **Option c) — Wrong assumption.** Even if you could set a global confidence threshold in IDP, the team often wants different thresholds per field (`vendorName` requires 0.9, `invoiceDate` requires 0.85). BPMN-level routing is more flexible.

- **Option d) — Incorrect.** FEEL's quantifiers (`every`, `some`, `any`) work over lists.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL `every` / `some` quantifier + Exclusive Gateway е canonical.
- **b) 3/10** — IDP не routes; BPMN layer.
- **c) 4/10** — IDP confidence е per-field; routing е BPMN-level.
- **d) 1/10** — невярно; FEEL has quantifiers.

**Correct Answer:** FEEL quantifier (`every` / `some`) on Exclusive Gateway condition over extracted fields.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-boolean/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "any field below 0.85", "route to human review", "confidence per field." Quantifier pattern в FEEL.

**Въпросът → Solution Framing.** "Routing approach fits" — изпитва се FEEL quantifier knowledge + BPMN gateway placement.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL има `every` / `some` quantifiers, че IDP exposes per-field confidence, че routing е BPMN-level concern. Това е знание за FEEL quantifiers + IDP integration.

---

## Question 17: Configuring Processes (Weighting: 22%)

**Scenario:** A custom Connector's Element Template has a property `Slack Channel`. Modellers must enter a value starting with `#` (e.g., `#general`, `#alerts`). The team wants the template to **reject non-conforming input at design time** — before deployment.

**Which Element Template constraint enforces this format?**

- **a)** Add a **regex pattern constraint** in the property's JSON: `"constraints": { "pattern": { "value": "^#[a-zA-Z0-9_-]+$", "message": "Channel must start with # followed by alphanumerics, _, or -" } }`. Web Modeler validates at design time, blocking save or flagging an error. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **b)** Invented constraint `constraints.startsWith: "#"` — not a real Element Template attribute. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **c)** Element Templates don't support regex constraints — incorrect; pattern + min/max-length are standard. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **d)** Use a FEEL precondition — FEEL evaluates at runtime, not design time; the goal is design-time validation. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Element Template constraints include `pattern` (regex), `notEmpty`, `minLength`, `maxLength`. The `pattern` constraint with a meaningful `message` provides immediate design-time feedback in Web Modeler / Desktop Modeler — the modeller sees the error before deploying. This catches typos and convention violations early.

- **Option b) — Invented constraint.** No such field. Modellers sometimes invent names hoping they match; for exact constraint names check the docs.

- **Option c) — Incorrect.** Regex pattern is part of the Element Template constraints schema.

- **Option d) — Wrong layer.** FEEL runs at process runtime — when the Service Task activates and the Connector evaluates its config. By then the BPMN is already deployed. To catch issues at design time, use Element Template constraints.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. constraints.pattern с regex + message е design-time validation.
- **b) 3/10** — invented; не real attribute.
- **c) 1/10** — невярно; pattern е standard.
- **d) 3/10** — wrong layer; FEEL е runtime.

**Correct Answer:** Add constraints.pattern with regex `^#[a-zA-Z0-9_-]+$` to the property.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "must start with #", "reject at design time." Element Template design-time constraint.

**Въпросът → Solution Framing.** "Constraint enforces format" — изпитва се knowledge на Element Template constraints.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че template constraints include pattern / notEmpty / lengths, че FEEL е runtime, че design-time validation е Element Template concern. Това е знание за Element Template constraint schema.

---

## Question 18: Configuring Processes (Weighting: 22%)

**Scenario:** An **AI Agent Connector** orchestrates a customer-service agent. The LLM decides which tool to call next based on conversation context. The team's agent has 4 tools: `lookup-order`, `check-shipping-status`, `escalate-to-human`, `send-survey`. They're configuring where these tools are defined.

**Where are the tools (the agent's callable actions) defined in the BPMN?**

- **a)** As **inner Service Tasks within an Ad-hoc Subprocess** linked from the AI Agent Connector. Each Service Task = one callable tool. The AI Agent reads the available activities, builds a tool registry for the LLM, and at each turn lets the LLM choose which to invoke. The Service Task's task type, input mapping, and description (often visible to the LLM as the tool's docstring) describe what each tool does. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **b)** As JSON config in the AI Agent Connector's property panel — partial truth; the Connector might have some metadata properties, but the **activities themselves** are the source of truth for what tools exist. Tool registration is BPMN-driven, not JSON-config-driven. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **c)** Inside the LLM provider's tool registry on the provider side (e.g., OpenAI Functions, Anthropic Tool Use) — that's how tools are passed **to** the LLM at inference time, but the source-of-truth definition is in BPMN, not on the LLM provider. Camunda passes BPMN-defined tools as functions in the LLM call. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **d)** Tools aren't configurable; the AI Agent has a hardcoded list — incorrect; the entire value proposition is BPMN-defined orchestration. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The canonical Camunda 8 agentic orchestration pattern: AI Agent Connector + Ad-hoc Subprocess. The Ad-hoc Subprocess hosts the available tools as inner activities (typically Service Tasks). The AI Agent at runtime reads the activity list (and their descriptions / schemas) and presents them to the LLM. Per turn: LLM picks one, Camunda executes it, result returns to LLM, repeat until done. The activities are the source of truth — change the tool by editing the BPMN.

- **Option b) — Partially.** Connector properties may carry agent-level config (model, system prompt, etc.) but tool definitions live in the Ad-hoc Subprocess.

- **Option c) — Misleading direction.** Tools are passed from Camunda to the LLM at call time as part of the request (e.g., function definitions for OpenAI). Source of truth is Camunda-side BPMN; LLM-side is just the transient request payload.

- **Option d) — Incorrect.** Tools are fully configurable via BPMN.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Tools = Ad-hoc inner Service Tasks; LLM sees activity list as tool registry.
- **b) 4/10** — partial — Connector може да има agent-level config, но tools са inner activities.
- **c) 3/10** — confuses serialization direction; source-of-truth е BPMN.
- **d) 1/10** — невярно; fully configurable.

**Correct Answer:** As inner Service Tasks within an Ad-hoc Subprocess linked from the AI Agent Connector.

**Official Documentation Link:** https://docs.camunda.io/docs/components/agentic-orchestration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "LLM decides which tool", "tools = lookup-order etc." Camunda 8 agentic orchestration pattern.

**Въпросът → Solution Framing.** "Where tools are defined" — изпитва се knowledge на AI Agent + Ad-hoc pattern.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Ad-hoc Subprocess inner activities = tools, че Camunda е source-of-truth и serializes to LLM at call time, че Connector properties carry agent-level config не tools list. Това е знание за agentic orchestration architecture.

---

## Question 19: Configuring Processes (Weighting: 22%)

**Scenario:** A process must wait **until tomorrow at 8:00 AM local time** before continuing. The current time isn't known in advance — the timer must compute the moment dynamically based on `now()`.

**Which Timer Date FEEL expression fits a "next day 8 AM" relative computation?**

- **a)** A FEEL expression combining `today()` (returns today's date), adding `duration("P1D")` (one day), and combining with `time("08:00:00")` to form a `date and time` value. Example: `=date and time(today() + duration("P1D"), time("08:00:00"))` (exact form varies by FEEL implementation). The Timer Date type accepts FEEL date-and-time expressions, so this is dynamic per instance. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/) + [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** A static ISO 8601 datetime like `2026-05-15T08:00:00` — doesn't generalise; works for the next firing only, then becomes stale. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** A natural-language expression `"tomorrow at 8 AM"` — not parseable by FEEL or BPMN. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Cannot compute relative to `now()` — incorrect; FEEL temporal arithmetic handles this. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL provides date constructors (`date()`, `time()`, `date and time()`, `today()`, `now()`) and duration arithmetic (`duration("P1D")`). Compose them to express any relative moment. The Timer Date attribute accepts a FEEL expression; at activation, the expression evaluates and the timer is scheduled for the resulting absolute moment. This pattern works for any "X days from now at time T" requirement.

- **Option b) — Static, brittle.** A literal ISO datetime fires once at that specific moment. For an instance that activates later, it might be in the past — timer fires immediately. Not "relative tomorrow."

- **Option c) — Not parseable.** Natural language isn't a FEEL syntax.

- **Option d) — Incorrect.** FEEL temporal arithmetic is the canonical solution.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL temporal composition computes relative moments dynamically.
- **b) 3/10** — static; not relative.
- **c) 1/10** — natural language невъзможна.
- **d) 1/10** — невярно.

**Correct Answer:** FEEL expression composing today() + duration("P1D") with time("08:00:00") as the Timer Date.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "tomorrow at 8 AM", "relative to now". FEEL temporal arithmetic за relative timing.

**Въпросът → Solution Framing.** "Expression fits relative computation" — изпитва се FEEL date composition + Timer Date.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL provides today/now/duration/date constructors, че static ISO е brittle, че Timer Date accepts FEEL expressions. Това е знание за temporal expressions.

---

## Question 20: Configuring Processes (Weighting: 22%)

**Scenario:** A Receive Task waits for a message named `OrderShipped` with correlation key FEEL expression `=orderId`. When the task activates, the process variable `orderId` happens to be `null` (it wasn't set upstream due to a data issue).

**What happens at the moment of Receive Task activation with a null correlation key?**

- **a)** The activation **fails / creates an Incident** — Zeebe requires the correlation key value to be non-null (and typically non-empty for strings) at the moment the subscription is created. Ops must fix the data (set `orderId`) and resolve the incident; the subscription is then created and the task waits for matching messages. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **b)** The task waits forever silently — incorrect; Zeebe doesn't accept null correlation keys silently. The runtime surfaces an Incident so ops can act. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **c)** The correlation key defaults to an empty string — no such default; null is an error case. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **d)** A random correlation key is generated — definitely not; random keys would mismatch any sane publish-message correlation. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe's contract for Message correlation: at the moment a subscription is created (Receive Task activated or Message Catch Event reached), the correlation key value must be defined and non-null. If the FEEL expression evaluates to null, Zeebe creates an Incident with a clear error message ("correlation key is null" or similar). Ops sees this in Operate, updates the variable, resolves the incident, and the subscription is then created. This guard prevents silent miscorrelation issues.

- **Option b) — Wrong default behaviour.** Silent waiting would be the worst outcome — the team wouldn't know anything's wrong until a published message inexplicably fails to correlate. Operate's incident-on-null is the right design.

- **Option c) — No empty-string default.** Empty string would correlate to "" message keys, which is also dangerous. Null is an error case, not a default case.

- **Option d) — Not random.** Random correlation would mismatch published messages; defeats the purpose.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Null correlation key → Incident; ops fixes data and resolves.
- **b) 3/10** — silent wait би било worst outcome.
- **c) 2/10** — no empty-string default.
- **d) 1/10** — random correlation би било dangerous.

**Correct Answer:** Activation creates an Incident; correlation key must be non-null.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/messages/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "null correlation key", "what happens at activation." Edge-case около correlation key validity.

**Въпросът → Solution Framing.** "What happens" — изпитва се Zeebe's contract for correlation keys.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe enforces non-null correlation, че Incident е the surfacing mechanism, че няма empty / random defaults. Това е знание за message correlation contract.

---

## Question 21: Configuring Processes (Weighting: 22%)

**Scenario:** A Camunda 7 veteran joining a Camunda 8 team asks: "I used Task Listeners (on-create, on-assignment, on-complete) extensively in C7 for cross-cutting concerns like audit logging, dynamic assignment, validation. How do I model the equivalent in Camunda 8?"

**What is Camunda 8's approach to Task-Listener-style cross-cutting concerns?**

- **a)** Camunda 8 **doesn't have Task Listeners** like C7. The recommended approach is **explicit BPMN modelling** — express the cross-cutting concern as a visible BPMN element (e.g., a Service Task before/after for audit logging, an Event Subprocess with Message Start for dynamic concerns, FEEL expressions in assignmentDefinition for dynamic assignment). The philosophy: visible behaviour over hidden listeners. Documentation: [Migrating from Camunda 7](https://docs.camunda.io/docs/guides/migrating-from-camunda-7/)

- **b)** Use the `zeebe:taskListener` extension element — invented; not a Zeebe attribute. Documentation: [Migrating from Camunda 7](https://docs.camunda.io/docs/guides/migrating-from-camunda-7/)

- **c)** Set a `listenTo` attribute on Service Tasks — invented; doesn't exist. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Camunda 8 has a native Listener pattern equivalent to C7 — incorrect; the C7 listener mental model is not part of C8's design. Documentation: [Migrating from Camunda 7](https://docs.camunda.io/docs/guides/migrating-from-camunda-7/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8's design philosophy intentionally moves away from hidden listeners. Cross-cutting concerns become explicit BPMN elements: audit logging = a Service Task before/after; dynamic assignment = FEEL expression in assignmentDefinition; validation = Service Task with worker that performs validation. The trade-off: BPMN diagrams have more visible elements, but the behaviour is transparent — no hidden execution sneaking in via listeners. This makes processes more readable and reasoning easier; C7 listeners were often invisible-but-impactful.

- **Option b) — Invented extension.** `zeebe:taskListener` isn't part of the Zeebe BPMN extension schema.

- **Option c) — Invented attribute.** No `listenTo` attribute.

- **Option d) — Inaccurate.** No 1:1 listener equivalent; the migration path requires re-thinking listener uses as explicit BPMN.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. C8 prefers explicit BPMN over hidden listeners.
- **b) 1/10** — invented extension.
- **c) 1/10** — invented attribute.
- **d) 2/10** — wrong; no native equivalent.

**Correct Answer:** C8 doesn't have Task Listeners — use explicit BPMN (Service Tasks, Event Subprocesses, FEEL).

**Official Documentation Link:** https://docs.camunda.io/docs/guides/migrating-from-camunda-7/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Camunda 7 Task Listeners equivalent in C8." Migration-knowledge question.

**Въпросът → Solution Framing.** "Approach to listener-style concerns" — изпитва се C7-to-C8 mental model migration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че C8 преферира explicit BPMN, че няма zeebe:taskListener, че Event Subprocess / Service Task / FEEL express ширсе cutting concerns explicitly. Това е знание за C7→C8 paradigm shift.

---

## Question 22: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task has Task Headers configured: `{priority: "high", retryHint: "5min"}`. These values are static — the same for every instance of this task. A new team member asks: "Can the headers be **dynamic per instance** — e.g., `priority` varying by customer tier?"

**Can Task Headers be dynamic (vary per process instance)?**

- **a)** **No** — Task Headers are **static metadata defined at design time** (per modelled task, identical for every instance). They're not evaluated as FEEL expressions per instance. For dynamic per-instance values, use **Input Mapping** with FEEL expressions (which evaluate at activation and pass to the worker as local-scoped variables). Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Yes — Headers can contain FEEL expressions that evaluate per instance. Incorrect; Headers carry literal string values, not FEEL. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Yes — Zeebe re-reads Header values each activation. Misleading; the broker reads the BPMN-modelled Headers, which are static. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Yes — Headers support a mix of static and dynamic values via syntax markers. Incorrect; no such mixed-mode syntax. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Task Headers are part of the BPMN model — string key/value pairs attached to a specific task element. Modelled once at design time; identical across instances. The worker reads them from `activatedJob.getCustomHeaders()`. For dynamic per-instance metadata, use **Input Mapping**: define a local variable via FEEL that evaluates against process variables / context, and pass it to the worker as a local-scoped variable. This separates "static config" (Headers) from "dynamic data" (variables).

- **Option b) — Incorrect.** Headers are not FEEL-evaluated. They're literal string values.

- **Option c) — Misleading wording.** The broker does read Headers each time the job activates, but the values themselves don't change between activations — they're static in the BPMN.

- **Option d) — Invented feature.** No mixed-mode syntax.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Headers static; use Input Mapping за dynamic per-instance values.
- **b) 3/10** — Headers не са FEEL-evaluated.
- **c) 3/10** — misleading wording; Headers са static.
- **d) 2/10** — invented mixed-mode syntax.

**Correct Answer:** No — Task Headers are static at design time; use Input Mapping with FEEL for dynamic per-instance values.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "headers dynamic per instance", "varying by customer tier." Това е въпрос за Headers vs Variables semantics.

**Въпросът → Solution Framing.** "Can be dynamic" — trap; изпитва се difference между static metadata (Headers) и dynamic data (Variables / Input Mapping).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Headers са static literal key/value, не FEEL-evaluated, че Input Mapping е the dynamic alternative. Това е знание за Headers vs Input Mapping separation.

---

# Section 3 — Decisions & DMN (Questions 23-29)

> Weight 11% • Topics: Hit Policies (COLLECT-COUNT, ANY, ordering), Decision Service vs Literal Expression, DRD entities (Knowledge Source, BKM), FEEL in DMN inputs/outputs, REST evaluation.

---

## Question 23: Decisions & DMN (Weighting: 11%)

**Scenario:** A risk-assessment DMN evaluates a customer against various risk indicators (history, geography, transaction patterns). Multiple rules can match a single customer. The team wants the decision to return a **single number** — the **count of matching rules** — representing how many risk indicators triggered. The downstream BPMN uses this count to route (0-1 indicators = low risk, 2+ = high risk).

**Which hit policy + aggregator returns the count of matching rules?**

- **a)** **COLLECT** with **COUNT** aggregator — engine evaluates all rules, counts how many matched, returns the count as a single number. Designed exactly for cardinality reporting. Documentation: [DMN Hit Policies](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** **COLLECT** with **SUM** aggregator over a constant `1` output — workable workaround: each matching rule outputs `1`, SUM gives the count. Achieves same result but COUNT is the direct expression. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** **UNIQUE** — requires exactly one match; multiple matches raise an error. Wrong intent (we want multiple). Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** **RULE ORDER** — returns the matches as a list ordered by rule order. The caller would then have to compute `count(matches)` separately; less direct. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** COLLECT supports four aggregators: SUM, MIN, MAX, COUNT. COUNT specifically counts how many rules matched, returning a single number. Perfect for cardinality questions like "how many risk indicators?" or "how many discounts apply?" The downstream consumer gets one number, no list parsing.

- **Option b) — Workable workaround.** SUM over constant-1 outputs reproduces COUNT semantically. Sometimes useful when an output column already represents the contribution; e.g., "how many points does this rule add?" with variable point values would use SUM directly. For pure cardinality, COUNT is more declarative.

- **Option c) — Wrong policy.** UNIQUE forbids multiple matches — exactly what we want to allow.

- **Option d) — Indirect.** RULE ORDER returns a list; counting it requires downstream FEEL `count(list)`. COLLECT-COUNT does it inside the DMN.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. COLLECT-COUNT е canonical за cardinality.
- **b) 6/10** — workaround; SUM(1) achieves same но COUNT е direct.
- **c) 3/10** — UNIQUE забранява multi-match; wrong intent.
- **d) 4/10** — RULE ORDER returns list; downstream count() needed.

**Correct Answer:** COLLECT hit policy with COUNT aggregator.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "count of matching rules", "single number", "0-1 vs 2+ routing." Cardinality aggregator pattern.

**Въпросът → Solution Framing.** "Hit policy + aggregator returns count" — изпитва се knowledge на COLLECT aggregators.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че COLLECT supports SUM/MIN/MAX/COUNT, че SUM(1) е equivalent workaround, че UNIQUE forbids multi, че RULE ORDER е list-returning. Това е знание за aggregator selection.

---

## Question 24: Decisions & DMN (Weighting: 11%)

**Scenario:** A customer-tagging DMN evaluates a customer and may apply **multiple tags** like `"VIP"`, `"LOYAL"`, `"AT_RISK"`. The output is intentionally a **list of strings** — the BPMN downstream uses this list as the customer's tags collection.

**Can a DMN decision return a list as its output, and how does the caller receive it?**

- **a)** **Yes** — DMN supports list outputs natively. The most common way: **COLLECT** hit policy (no aggregator) returns a list of all matching rules' outputs as a list. The caller (Business Rule Task) receives this list as the `resultVariable`. Downstream FEEL: `=tags contains "VIP"`. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** No, DMN outputs are scalars only — incorrect; DMN spec supports lists via COLLECT and via list-typed outputs. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** Yes, but only if all matching rules produce identical values — that's the ANY policy semantics (multi-match same output → single value). For lists you want COLLECT. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** Yes, but the list requires manual decoding from a JSON string — incorrect; the engine returns structured list values, not JSON strings. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN decisions can return lists in two main ways: (1) COLLECT hit policy collects all matching rules' outputs into a list (no aggregator means "give me the list"); (2) a single output column typed as `list` returning a FEEL list expression. The Business Rule Task's `resultVariable` captures whatever the decision returns — list, scalar, or context — preserving structure. The caller's FEEL has full access: `tags contains "VIP"`, `count(tags) > 0`, `tags[1]`, etc.

- **Option b) — Wrong.** DMN supports lists.

- **Option c) — Wrong policy.** ANY allows multiple matches but constrains them to produce identical outputs; result is the single value (not a list). For a list of varied tags, COLLECT is the right policy.

- **Option d) — Wrong serialization.** The engine returns native list values, FEEL-navigable. No JSON-string decoding step.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. COLLECT returns list natively.
- **b) 1/10** — DMN supports lists.
- **c) 3/10** — confuses ANY with COLLECT.
- **d) 2/10** — no JSON serialization.

**Correct Answer:** Yes — DMN returns lists via COLLECT (or list-typed output); resultVariable preserves structure.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "multiple tags as list", "DMN list output." DMN list-output capability check.

**Въпросът → Solution Framing.** "Can return list" — изпитва се DMN result-type knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че COLLECT (no aggregator) returns list, че ANY е single-value-with-identical-match, че engine returns structured lists. Това е знание за DMN return types.

---

## Question 25: Decisions & DMN (Weighting: 11%)

**Scenario:** A BPMN Business Rule Task invokes a DMN decision. The DMN's table has output columns named `category` (string) and `score` (number). The task has `resultVariable = "decision"`. The team is wondering how to access the two output fields downstream.

**How are DMN output columns exposed to downstream BPMN via resultVariable?**

- **a)** The `resultVariable` (here `decision`) holds the **entire result object**. DMN output column names become **field names** of that object. Downstream FEEL: `=decision.category`, `=decision.score`. For decisions with a single output column, some engines flatten to the bare value; check your Zeebe / DMN runtime semantics. Documentation: [Business Rule Task](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **b)** Output column names become process variables directly (so `=category` and `=score` work without resultVariable) — partial truth in some engines, but Camunda 8's canonical contract uses resultVariable as the named result holder. Documentation: [Business Rule Task](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **c)** DMN auto-creates a variable named after the decision ID — invented; resultVariable is the canonical naming knob. Documentation: [Business Rule Task](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **d)** Always called `result` regardless of configuration — incorrect; resultVariable specifies the name. Documentation: [Business Rule Task](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The contract: `resultVariable` names the top-level holder; DMN output columns become its fields. So with `resultVariable = "decision"` and outputs `category` + `score`, you get `decision.category` and `decision.score` in process scope. The structure preserves the DMN model. Note: when the DMN has a single output column (no name needed), some engines flatten the result to the bare value; multi-column always gives a structured object. Always verify with the Zeebe version's docs.

- **Option b) — Partial misconception.** Some DMN runtimes allow column names to become top-level variables directly. Camunda 8's contract makes resultVariable the explicit holder; column names appear as its fields.

- **Option c) — Invented.** No auto-naming-from-decision-ID.

- **Option d) — Incorrect.** resultVariable can be any name.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. resultVariable е the holder; output columns са fields.
- **b) 5/10** — partial — depends on engine flavour; не canonical в C8.
- **c) 2/10** — invented auto-naming.
- **d) 2/10** — incorrect; resultVariable е custom.

**Correct Answer:** resultVariable holds the result object; output column names become its fields.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "DMN output columns", "access downstream", "resultVariable = decision." DMN result structure.

**Въпросът → Solution Framing.** "How exposed via resultVariable" — изпитва се BPMN-DMN result contract.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че resultVariable = holder name, output columns = field names, че single-column може да flatten. Това е знание за result-variable semantics.

---

## Question 26: Decisions & DMN (Weighting: 11%)

**Scenario:** A commission-calculation DMN table has an output column `commission`. The team wants a rule to compute commission as a FEEL expression based on inputs — e.g., `=input.amount * 0.1`. They're confirming that FEEL expressions are allowed in output entries.

**Are FEEL expressions allowed in DMN output entries (the cells in the output column)?**

- **a)** **Yes** — DMN output entries are FEEL expressions. They can reference any input value, call FEEL built-in functions (like `decimal()`, `if-then-else`, list functions), and reference variables in context. The cell's value at evaluation time is the result of the FEEL expression. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/) + [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** No, output entries are literals only — incorrect; FEEL expressions are core to DMN. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Yes, but only for numeric outputs (strings must be literals) — partial misconception; FEEL works for all types. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Yes, but the expression must be prefixed with `=` (or similar marker) — depending on tooling, some modellers require the prefix; others treat output cells as FEEL by default. Check your Web Modeler's convention. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN's value proposition is declarative decision logic using FEEL. Output entries are FEEL expressions that evaluate against the rule's matching inputs (and any other context variables). Common uses: arithmetic from inputs (`=input.amount * 0.1`), conditional outputs (`=if input.tier = "GOLD" then "PREMIUM" else "STANDARD"`), list constructions, date arithmetic. Full FEEL is available.

- **Option b) — Wrong.** Literal-only outputs would be very limiting; DMN explicitly supports expressions.

- **Option c) — Wrong type restriction.** No type-based limitation; FEEL works for numerics, strings, dates, booleans, lists, contexts.

- **Option d) — Tooling-specific quirk.** Web Modeler's DMN editor sometimes treats output entries as FEEL by default (no `=` needed), sometimes requires the prefix. The functional answer is "yes, FEEL expressions are allowed"; the prefix convention is a syntactic detail.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL expressions allowed; full FEEL power in output entries.
- **b) 1/10** — wrong; output FEEL е core.
- **c) 3/10** — wrong type restriction.
- **d) 6/10** — partial — tooling-specific prefix detail.

**Correct Answer:** Yes — FEEL expressions allowed in DMN output entries; full FEEL power available.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "FEEL expression in output", "compute commission". DMN expressivity question.

**Въпросът → Solution Framing.** "Allowed in output entries" — изпитва се DMN FEEL capability.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN е FEEL-powered, че output entries support full FEEL, че няма type-based restriction. Това е знание за DMN expressivity.

---

## Question 27: Decisions & DMN (Weighting: 11%)

**Scenario:** A complex DMN model has Decision A and Decision B. Decision A's body references Decision B's result — e.g., A computes a final score by combining B's risk rating with other inputs. The DRD shows an Information Requirement arrow from B (supplier) to A (consumer).

**How does Decision A invoke Decision B in its FEEL body?**

- **a)** Reference **Decision B's name** in a FEEL expression in A's body — the engine resolves the reference using the DRD dependency. When A evaluates, the engine first evaluates B (per the Information Requirement arrow), makes B's result available in A's evaluation context, then evaluates A. Example: A's expression might be `=B + otherFactor`. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-diagram/)

- **b)** Explicit `invoke(B)` call — invented; FEEL doesn't have such a function. The DRD dependency + name reference is the mechanism. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Auto-resolved without explicit reference — incorrect; A must reference B by name to use its result. The DRD arrow declares the dependency; the FEEL reference uses it. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Manual coordination at BPMN level — invoke B's Business Rule Task first, then A's — incorrect for DMN-internal chaining; the BPMN should invoke only the top-level decision, and the DRD handles the chain. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN's DRD specifies the dependency graph; FEEL references use names declared in the DRD. The engine evaluates dependencies in topological order: when A's evaluation begins, B has already been evaluated (because of the arrow), and B's result is in A's context. A's FEEL body can reference `B` like any other variable.

- **Option b) — Invented function.** No `invoke()` FEEL function; the DRD + name reference is the mechanism.

- **Option c) — Misconception.** The DRD doesn't auto-substitute; A still must reference B's name in its body. The DRD only declares "A may use B"; FEEL provides the use.

- **Option d) — Wrong scope.** Multiple Business Rule Tasks for chained decisions is the BPMN-level orchestration anti-pattern when DMN can handle the chain internally. BPMN should invoke the top-level decision; DMN handles upstream dependencies automatically.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL reference + DRD dependency.
- **b) 2/10** — invented function.
- **c) 4/10** — misconception about auto-substitution.
- **d) 3/10** — wrong scope; BPMN over-decomposes.

**Correct Answer:** Reference Decision B by name in FEEL; DRD arrow declares dependency, engine resolves at evaluation time.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-diagram/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Decision A references B", "DRD Information Requirement arrow." DMN chained decisions pattern.

**Въпросът → Solution Framing.** "How invokes B in FEEL body" — изпитва се DRD + FEEL name resolution.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL references resolve via DRD declared dependency, че няма invoke() function, че BPMN-side chain е anti-pattern когато DMN може internally. Това е знание за DRD topological evaluation.

---

## Question 28: Decisions & DMN (Weighting: 11%)

**Scenario:** A team's Business Rule Task evaluates a DMN. The team is curious about the **runtime architecture** — does Zeebe spawn a separate process / call out to a DMN engine, or evaluate inline?

**How does Zeebe evaluate DMN decisions invoked from Business Rule Tasks?**

- **a)** **Native engine** — Zeebe has a built-in DMN evaluator (the FEEL engine + DMN runtime). Business Rule Tasks evaluate the referenced decision inline within the broker (or via the deployed component handling decision evaluation). No external worker subscription, no separate DMN engine process. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Via a Job Worker subscribed to a special DMN task type — C7-style pattern; not how C8 handles DMN. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Via an external DMN service — incorrect; native. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** On a different broker partition dedicated to DMN — incorrect; DMN evaluation is part of normal broker work. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8's runtime architecture includes native DMN evaluation. The FEEL engine and DMN runtime are bundled; Business Rule Tasks evaluate decisions inline without needing a separate worker subscription. This means: deploy the DMN, reference it from a Business Rule Task, instances evaluate it directly. Less moving parts, lower latency than C7's external-engine pattern.

- **Option b) — C7 reflex.** In C7, DMN was sometimes handled by external workers. C8 builds it in; no need for a `dmn-eval` worker.

- **Option c) — Wrong architecture.** No external DMN service.

- **Option d) — Wrong partition concept.** DMN evaluation is just regular broker work; no dedicated partition.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Native DMN evaluation в Zeebe.
- **b) 3/10** — C7 reflex.
- **c) 1/10** — wrong architecture.
- **d) 1/10** — wrong partition concept.

**Correct Answer:** Zeebe has a native built-in DMN evaluator; evaluation is inline.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "runtime architecture", "evaluate DMN". C8 DMN execution model.

**Въпросът → Solution Framing.** "How Zeebe evaluates" — изпитва се knowledge of C8 vs C7 DMN architecture.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че C8 има native DMN engine, че C7 използваше external workers, че няма dedicated partitions. Това е знание за C8 DMN runtime.

---

## Question 29: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN decision-table input column `applicationDate` is typed as `date`. A rule's input entry is `< date("2025-01-01")`. The input value at evaluation is `date("2024-12-15")`.

**Does the rule match?**

- **a)** **Yes** — FEEL's date comparison is **temporal** (chronological): `date("2024-12-15") < date("2025-01-01")` is `true`. The unary test `< date("2025-01-01")` matches any date earlier than 2025-01-01, which includes 2024-12-15. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** No, dates must be exactly equal — incorrect; FEEL supports `<`, `<=`, `>`, `>=` on dates. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **c)** Type mismatch error — strings can't compare to dates — incorrect; both sides are `date()` values (the constructor parses ISO strings to date type). Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Depends on time zone — partial truth; pure `date` values don't carry time zones (they're date-only). For `date and time` values, time zone matters. Here both are `date` only, so no time-zone ambiguity. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL implements temporal arithmetic for dates: `<`, `<=`, `>`, `>=`, `=`, `!=` all work and respect chronological order. `2024-12-15 < 2025-01-01` is `true`. The DMN rule with input entry `< date("2025-01-01")` matches.

- **Option b) — Wrong.** FEEL supports comparison operators, not just equality.

- **Option c) — Wrong type analysis.** Both `date("2024-12-15")` and `date("2025-01-01")` are date values (constructor converts strings). Comparison is between dates, not string-vs-date.

- **Option d) — Wrong type concern.** Pure `date` type is date-only (no time, no zone). Time zone matters for `date and time` type. Question uses `date()` constructor; no time component.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Temporal comparison; 2024-12-15 < 2025-01-01.
- **b) 1/10** — exact-equal-only is wrong.
- **c) 2/10** — wrong type analysis; both са date values.
- **d) 4/10** — partial — time zone matters for date and time, не за date only.

**Correct Answer:** Yes — temporal comparison; 2024-12-15 is before 2025-01-01.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "date comparison", "<", "date() constructor". FEEL temporal comparison check.

**Въпросът → Solution Framing.** "Does rule match" — изпитва се FEEL date arithmetic + DMN unary test semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL date comparison е temporal, че date() constructor returns date type, че time zone matters само за date and time. Това е знание за FEEL date semantics.

---

# Section 4 — Configuring Forms (Questions 30-32)

> Weight 5% • Topics: Required validation, edge cases (allowing 0), Markdown rendering.

---

## Question 30: Configuring Forms (Weighting: 5%)

**Scenario:** A registration form has an "Email" field that must be **required** — users can't submit the form without filling it. The team also wants the form's UI to **visually indicate** which fields are mandatory (typically a red asterisk next to the label).

**Which Form field property handles required validation AND triggers the visual indicator?**

- **a)** Set `validate.required: true` on the field. The Form renderer applies validation at submit time (rejecting empty inputs) **and** automatically adds the visual required indicator (asterisk) next to the field label. One property handles both UX requirements. Documentation: [Forms validation](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-validation/)

- **b)** Manually add `*` to the label text — workable cosmetic shortcut but doesn't actually validate; users can still submit empty. Splits concerns: cosmetic indicator separate from real validation. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Configure CSS in a custom theme to highlight required fields — wrong layer; CSS doesn't validate. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Required validation isn't supported in Camunda Forms — incorrect; required is a basic validation feature. Documentation: [Forms validation](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-validation/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda Forms' validation property `required` does double duty: (1) at submit time, the form rejects empty values and shows an error message; (2) at render time, the field gets the required indicator (typically an asterisk) next to the label. This is the canonical, single-source-of-truth way to express mandatory fields. The indicator is automatic — no manual styling needed.

- **Option b) — Cosmetic but unsafe.** Adding `*` to the label visually communicates "required" but doesn't actually enforce. Users see the indicator, submit empty, form accepts — defeats the contract. Always pair visual cues with real validation.

- **Option c) — Wrong layer.** CSS handles visual styling, not validation. Even if CSS detected empty fields (via `:invalid`), it can't reject submission.

- **Option d) — Incorrect.** `validate.required` is a foundational property.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. validate.required handles both validation и visual indicator.
- **b) 3/10** — cosmetic only; не enforces.
- **c) 3/10** — wrong layer; CSS не validates.
- **d) 1/10** — невярно; required is supported.

**Correct Answer:** validate.required: true.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-validation/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "required field", "visual asterisk indicator", "can't submit without." Required validation + UX indication.

**Въпросът → Solution Framing.** "Property handles required AND visual" — изпитва се knowledge че required е unified validation+UX in Forms.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че validate.required е the canonical, че manual `*` без validation е unsafe, че CSS не valida-ва, че required е core feature. Това е знание за Forms validation properties.

---

## Question 31: Configuring Forms (Weighting: 5%)

**Scenario:** A medical-intake form has a Numeric field "Number of dependents." The team needs the field to be **mandatory** (user must fill it), but `0` is a **valid value** (a single person has 0 dependents). They're nervous that "required" might confuse with "non-zero."

**Which validation expresses "user must enter a value, including 0"?**

- **a)** `validate.required: true` — the required check is "field has a value present" (not blank, not null). `0` counts as a valid present value; it's a number, not "absence." So `required: true` correctly allows 0 while requiring an entry. Documentation: [Forms validation](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-validation/)

- **b)** `validate.min: 0` — covers "value ≥ 0" but doesn't catch blank input; user could submit nothing and `min` wouldn't trigger (because there's no value to compare). Documentation: [Forms validation](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-validation/)

- **c)** Regex pattern `^[0-9]+$` — partial: works if you treat the field as a string, but blank input matches the empty regex `^$`? No — `^[0-9]+$` requires at least one digit, so empty input would fail regex. But this conflates validation purposes; required is the right tool for presence. Documentation: [Forms validation](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-validation/)

- **d)** Mark the field as `notNullable` in schema — invented attribute; not part of Camunda Forms validation vocabulary. Documentation: [Forms validation](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-validation/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda Forms' `required: true` enforces **presence** — a value must be entered. For numeric fields, this means the user submitted a number (any number, including 0). The semantic gap between "required" (presence) and "non-zero" (numeric value) is well-defined: required = "did you fill it?"; min/max = "is the value in range?" They compose: `required: true, min: 0` means "fill it, and the number must be ≥ 0."

- **Option b) — Misses presence check.** `min: 0` checks numeric bounds **when a value is present**. If the user leaves the field blank, `min` has nothing to compare and doesn't trigger. Use `required` for presence.

- **Option c) — Awkward for numerics.** Regex on numeric inputs is generally a code smell; numeric validation has dedicated tools (`min`, `max`, `step`). The regex `^[0-9]+$` would technically work but is opaque.

- **Option d) — Invented.** `notNullable` isn't a Camunda Forms attribute.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. required = presence check; 0 е valid present value.
- **b) 5/10** — partial; misses presence check (blank passes).
- **c) 4/10** — awkward for numerics; regex code smell.
- **d) 3/10** — invented attribute.

**Correct Answer:** validate.required: true — checks presence; 0 is a valid present value.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-validation/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "mandatory", "0 is valid", "concerned required might confuse with non-zero." Validation semantics question.

**Въпросът → Solution Framing.** "Expression for 'must enter, including 0'" — изпитва се understanding на required (presence) vs min (numeric).

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че required = presence check (covers 0), че min = numeric bound (когато value present), че regex е awkward за numerics. Това е знание за validation orthogonality.

---

## Question 32: Configuring Forms (Weighting: 5%)

**Scenario:** A complex onboarding form needs **rich-text static content** between fields — section headers in bold, bulleted lists of instructions, hyperlinks to policy docs. The team wants to use Markdown for the rich text.

**Which Forms component supports Markdown rendering for static rich-text content?**

- **a)** The **Text View** component (or equivalent heading / paragraph components) typically supports Markdown rendering. Set the content property to a Markdown string; the form renders it as formatted HTML (bold, lists, links, etc.). Documentation: [Forms element library](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/)

- **b)** No Markdown support; plain text only — incorrect; rich-text rendering is part of the Forms element library. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Embed HTML directly — wrong abstraction; Forms abstracts above HTML to enable cross-renderer compatibility (Tasklist web UI, embedded React app, etc.). Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Embed an `<iframe>` pointing to an external Markdown renderer — overkill; Forms render Markdown natively. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda Forms' element library includes static-text components (Text View, Heading, etc.) that support Markdown. The modeller types Markdown in the content property; the renderer converts to HTML at display time. Standard Markdown features work: **bold**, *italic*, bullet lists, numbered lists, hyperlinks, headings, blockquotes. This is the canonical way to embed rich documentation/help text in a form.

- **Option b) — Wrong.** Markdown support is documented in the Forms element library.

- **Option c) — Wrong layer.** Forms abstract above HTML for portability across renderers. Raw HTML embedding isn't the form-spec way; Markdown is.

- **Option d) — Overkill.** iframes for static text inside a form would be wasteful and break form integration.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Text View / Heading components support Markdown.
- **b) 2/10** — wrong; Markdown supported.
- **c) 3/10** — wrong layer; Forms abstract above HTML.
- **d) 1/10** — overkill.

**Correct Answer:** Text View (or equivalent) component supports Markdown rendering.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "rich-text static content", "Markdown formatting", "bold lists links." Markdown rendering capability.

**Въпросът → Solution Framing.** "Component supports Markdown" — изпитва се element library knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Text View supports Markdown, че Forms абстрахира above HTML за portability, че iframe е overkill. Това е знание за Forms rich-text components.

---

# Section 5 — Configuring Connectors (Questions 33-36)

> Weight 6% • Topics: Slack auth, debugging Connectors, custom JWT auth, Webhook testing.

---

## Question 33: Configuring Connectors (Weighting: 6%)

**Scenario:** A retail process sends Slack notifications for high-value orders. The team adds a **Slack Outbound Connector** to a Service Task. They're configuring authentication — Slack offers several mechanisms.

**Which authentication methods does the Slack Outbound Connector typically support?**

- **a)** **OAuth Bot/User tokens** OR **Incoming Webhook URLs** — Slack apps can be installed in a workspace yielding an OAuth token (bot or user-scoped); alternatively, an Incoming Webhook URL targets a specific channel without an app install. The Slack Connector supports both modes; configure via secrets to avoid leaking credentials in BPMN. Documentation: [Slack Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/slack/)

- **b)** Username + password — incorrect; Slack deprecated password-based API access years ago. Documentation: [Slack](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/slack/)

- **c)** Anonymous — incorrect; Slack APIs always require some authentication. Documentation: [Slack](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/slack/)

- **d)** mTLS only — wrong protocol layer; Slack uses HTTPS with token-based auth, not mTLS for individual API calls. Documentation: [Slack](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/slack/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Slack's modern auth model uses OAuth (Bot tokens for app-style integration, User tokens for user-context calls) or Incoming Webhook URLs (simpler, channel-specific). The Connector exposes both options. Bot tokens are best for rich integrations (post to multiple channels, read messages); Webhook URLs are simplest when you just need to post to one channel. Both go through cluster secrets.

- **Option b) — Deprecated.** Slack removed password-based API access for security.

- **Option c) — Incorrect.** Slack APIs require auth.

- **Option d) — Wrong protocol.** mTLS isn't Slack's API auth model.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. OAuth tokens / Incoming Webhook URLs.
- **b) 1/10** — deprecated.
- **c) 1/10** — incorrect.
- **d) 1/10** — wrong protocol.

**Correct Answer:** OAuth Bot/User tokens OR Incoming Webhook URLs (via secrets).

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/slack/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Slack auth", "Outbound Connector." Slack auth model knowledge.

**Въпросът → Solution Framing.** "Methods supported" — изпитва се Slack Connector auth options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Slack има OAuth tokens + Incoming Webhook URLs, че password auth е deprecated, че mTLS не е Slack's model. Това е знание за Slack auth.

---

## Question 34: Configuring Connectors (Weighting: 6%)

**Scenario:** An Outbound HTTP Connector calls a partner API. The team needs to **debug** an intermittent failure — they want to see the **HTTP response body** the partner returned, but don't want the response stored as a process variable (privacy + scope cleanliness).

**Which approach lets the team see the Connector's response body for debugging without persisting it as a process variable?**

- **a)** Use **Operate's execution details view** — for Service Task instances with Connectors, Operate shows execution metadata including (where supported) Connector responses, request/response logs, and error messages. The data lives in Operate's history, not in the process variable scope. For ephemeral debug, this is the canonical observability path. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/) + [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Camunda auto-logs all HTTP responses to a central log — partial truth depending on configuration; logs may capture some details but accessing them requires log infrastructure. Operate's execution details is the integrated path. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Operate doesn't show Connector responses — incorrect; Operate has visibility into Connector execution. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Cannot view responses; HTTP Connector silently discards body — incorrect; the Connector keeps the response, and Operate / logs surface it. Documentation: [HTTP Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's instance detail page provides observability into individual flow nodes, including Connector executions. For HTTP Connector calls, you can see the request, response body (where the integration captures it), error messages on failure, and timing. This is the integrated debugging path that doesn't pollute process variables. For deeper inspection, configure structured logging in the Connector runtime.

- **Option b) — Partial.** Logs exist but accessing them requires log-aggregation tooling (ELK / Loki etc.). Operate is the integrated, in-product path.

- **Option c) — Incorrect.** Operate does provide visibility.

- **Option d) — Incorrect.** Connectors don't discard responses; they keep them for Output Mapping / debugging.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Operate execution details + Connector logs.
- **b) 5/10** — partial — log aggregation, не integrated.
- **c) 2/10** — wrong; Operate has visibility.
- **d) 2/10** — wrong; responses не discarded.

**Correct Answer:** Operate's execution details view shows Connector responses.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "debug HTTP response body", "without storing as variable." Observability question.

**Въпросът → Solution Framing.** "Approach lets the team see" — изпитва се Operate's Connector observability.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate exposes execution details, че logs са secondary path, че Connectors не discard responses. Това е знание за Connector observability.

---

## Question 35: Configuring Connectors (Weighting: 6%)

**Scenario:** A team's **custom Outbound Connector** must call a partner API requiring **JWT authentication** — the partner gave them a client ID and secret, and a token endpoint to exchange for short-lived JWT access tokens. The team is implementing the auth flow inside the Connector code.

**Where is the JWT auth logic implemented?**

- **a)** Inside the Connector's `OutboundConnectorFunction.execute()` method (or equivalent SDK entry point) — implement the OAuth2 / JWT flow: POST to the token endpoint with client credentials, receive the JWT, attach `Authorization: Bearer <jwt>` to outbound API calls. Cache the token (e.g., in a static field with expiry) to avoid re-fetching on every call. The Connector SDK exposes secrets via context to read client credentials safely. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** Camunda Connector SDK has built-in auto-JWT — partial truth; some specific Connectors handle their auth internally, but for a custom Connector with a partner-specific token flow, the implementation is in your code. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** Skip JWT entirely; rely on the cluster's auth — incorrect; cluster auth governs Camunda's own APIs, not the partner's. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **d)** Pass JWT as a BPMN process variable from upstream — leaks credentials to process scope (visible in Operate, audit logs); insecure. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Custom Outbound Connectors are responsible for whatever auth their target API requires. Inside the `execute()` method (or equivalent), implement the OAuth2 / JWT flow: read client_id and client_secret from `context.getSecret(...)` (via cluster secrets, never hardcoded), POST to the token endpoint, parse the JWT response, attach as Bearer. Cache the token using its `expiresIn`; only re-fetch when expired. Most JWT libraries provide caching helpers.

- **Option b) — Misleading.** No "auto-JWT" magic in the generic SDK. Specific OOB Connectors handle their auth; custom Connectors handle theirs.

- **Option c) — Wrong concept.** Cluster auth doesn't apply to partner APIs.

- **Option d) — Insecure.** Process variables are observable; credentials shouldn't appear there.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. JWT flow inside Connector code, secrets via context.
- **b) 3/10** — misleading; no auto-JWT для custom.
- **c) 1/10** — wrong concept.
- **d) 2/10** — insecure; credentials leak.

**Correct Answer:** Implement JWT auth flow inside the Connector code; read credentials via context.getSecret(); cache token.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "custom Connector", "JWT auth", "partner-specific flow." Custom Connector auth implementation.

**Въпросът → Solution Framing.** "Where logic implemented" — изпитва се Connector SDK auth pattern.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че custom Connectors implement their own auth, че secrets-via-context е the safe path, че variables leak credentials. Това е знание за Connector SDK auth.

---

## Question 36: Configuring Connectors (Weighting: 6%)

**Scenario:** An **Inbound Webhook Connector** is configured to start a process when a partner POSTs to it. The team wants to **test the webhook locally before the partner integrates** — they want to confirm: (1) the webhook URL is reachable, (2) a POST starts a process instance, (3) the body is correctly mapped to variables.

**Which approach lets the team test the webhook without partner involvement?**

- **a)** After deploying the BPMN, get the Webhook URL from Web Modeler / Operate (or compute from cluster URL + Connector ID). Send test POST requests with **curl, Postman, or any HTTP client** — same body shape the partner will send. Verify in Operate that a process instance starts and that variables hold the expected values. This is the standard integration-testing path. Documentation: [Webhook Connector](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

- **b)** Webhook can't be tested without the partner system being live — incorrect; the URL is exposed and accepts any HTTP POST matching its auth/schema rules. Documentation: [Webhook](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

- **c)** Set up a mock partner service that produces realistic POSTs — overkill for testing; curl / Postman is faster. Documentation: [Webhook](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

- **d)** Webhook auto-tests itself on deploy — incorrect; no auto-test. Manual test required. Documentation: [Webhook](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Webhooks are HTTP endpoints — any HTTP client can POST to them. The standard workflow: deploy, copy the Webhook URL, craft a test POST with curl or Postman matching the expected body shape, observe in Operate that a new instance starts with the right variables. Iterate until correct. Once it works, give the URL to the partner. Quick, deterministic, no partner dependency.

- **Option b) — Wrong.** The URL accepts any matching POST; partner involvement is needed only for the real production traffic, not for testing.

- **Option c) — Overkill.** Mock partner is useful for testing complex multi-step interactions, not for simple webhook validation.

- **Option d) — Incorrect.** No auto-test.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. curl/Postman POST to deployed Webhook URL.
- **b) 1/10** — wrong; URL accepts any POST.
- **c) 5/10** — overkill за simple webhook test.
- **d) 2/10** — no auto-test.

**Correct Answer:** Send test POST to the deployed Webhook URL via curl or Postman; verify in Operate.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "test webhook locally", "without partner." Webhook integration testing.

**Въпросът → Solution Framing.** "Approach lets team test" — изпитва се knowledge на Webhook URL + HTTP client testing.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Webhook URL accepts any HTTP POST, че curl/Postman are standard tools, че mock partner е overkill. Това е знание за Webhook testing workflow.

---

# Section 6 — Extensions & Integrations (Questions 37-50)

> Weight 25% • Topics: FEEL deep (append/remove/now/reverse/number/max), Spring Zeebe tuning, SDK error mapping, Camunda 8 REST API, zbctl, gRPC errors, RPA, message TTL, Python integration.

---

## Question 37: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must **add a value to the end of a list**: `tags = ["A", "B"]` → produce `["A", "B", "C"]`. The team is choosing between FEEL built-ins and operators.

**Which FEEL built-in fits "append element to list"?**

- **a)** `append(tags, "C")` — FEEL's standard list-append built-in. Returns a new list with the value added at the end. Documentation: [FEEL list functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** `tags.push("C")` — JavaScript-style method call; not part of FEEL syntax. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `tags + ["C"]` — looks like list concatenation, but `+` operator on lists isn't FEEL-spec; lists concatenate via `concatenate(...)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `concatenate(tags, ["C"])` — works because `concatenate` joins lists, but for adding a single element `append` is the direct, semantic choice. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's `append(list, item)` is the dedicated function for "list + single element." Returns a new list (FEEL lists are immutable; functions return new lists rather than mutating). Semantic and concise.

- **Option b) — Wrong syntax.** Method-call dot notation isn't FEEL. FEEL uses function-call syntax: `function(args)`.

- **Option c) — Wrong operator.** `+` is numeric addition / string concatenation in FEEL, not list concatenation. Using `+` on lists is a type error.

- **Option d) — Workable.** `concatenate(list1, list2)` joins lists; wrapping the single item in a singleton list `["C"]` works, but `append(tags, "C")` is more direct for the single-item case.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. append() е the dedicated FEEL function.
- **b) 2/10** — JS reflex; не FEEL syntax.
- **c) 3/10** — `+` не lists concatenation в FEEL.
- **d) 6/10** — workable; concatenate works но append е directer.

**Correct Answer:** append(tags, "C").

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "add element to end of list", `["A", "B"]` → `["A", "B", "C"]`. FEEL list append operation.

**Въпросът → Solution Framing.** "Built-in fits append" — изпитва се FEEL list-function knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че append(list, item) е dedicated FEEL function, че JS dot-method не работи, че `+` не concatenate-ва lists, че concatenate е за list-to-list. Това е знание за FEEL list ops.

---

## Question 38: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must **remove an element by position** from a list: `tags = ["A", "B", "C"]` → remove position 2 → `["A", "C"]`. (Position 2 is "B" since FEEL is 1-indexed.)

**Which FEEL built-in fits?**

- **a)** `remove(tags, 2)` — FEEL's dedicated function for "list minus element at position." Returns a new list excluding the element at the given 1-indexed position. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** `tags.splice(2, 1)` — JavaScript Array method; not part of FEEL. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `delete(tags, 2)` — invented function name; FEEL uses `remove`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `tags[!2]` — invented syntax; FEEL doesn't have a negate-index operator. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `remove(list, position)` is FEEL's element-removal-by-position function. 1-indexed. Returns a new list (immutable lists). Use this when you know the position; for removal by value, FEEL has different patterns (filter / `[item in list : item != target]`).

- **Option b) — JS reflex.** Method-call syntax with `.splice()` isn't FEEL.

- **Option c) — Wrong name.** Not a FEEL function. Sometimes JS / Python users guess names.

- **Option d) — Invented syntax.** FEEL list indexing supports positive integers (1-based) and negative integers (counting from end), but no `!` negate-index.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. remove(list, position) е FEEL standard.
- **b) 2/10** — JS reflex.
- **c) 3/10** — wrong name.
- **d) 1/10** — invented syntax.

**Correct Answer:** remove(tags, 2).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "remove element by position", "1-indexed". FEEL list removal.

**Въпросът → Solution Framing.** "Built-in fits" — изпитва се FEEL function vocabulary.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че remove() е FEEL standard, че FEEL е 1-indexed, че JS / Python guess-names не работят. Това е знание за FEEL list manipulation.

---

## Question 39: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must return the **current date and time** for use as a timestamp — e.g., to log when something happened.

**Which FEEL built-in fits?**

- **a)** `now()` — returns the current `date and time` value. The canonical FEEL function for "current moment." Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** `currentTime()` — invented function name; FEEL uses `now()` for date-time and `today()` for date only. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **c)** `time()` — `time()` is a constructor that parses a time string (e.g., `time("08:30:00")`), not "current time." Used to build time values from literals. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `Date.now()` — JavaScript syntax; not FEEL. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `now()` returns the current `date and time` value (zoned). Use it as a timestamp source. Companion: `today()` returns just the current date (no time component). Both are zero-argument; the engine resolves them at expression evaluation.

- **Option b) — Wrong name.** Modellers familiar with other languages sometimes try `currentTime()`. FEEL's spec uses `now()`.

- **Option c) — Wrong purpose.** `time(str)` is a constructor — parses a time string to a time value. Doesn't give "now."

- **Option d) — JS reflex.** Not FEEL syntax.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. now() е canonical для current moment.
- **b) 3/10** — wrong name.
- **c) 4/10** — wrong purpose (constructor, не current).
- **d) 1/10** — JS reflex.

**Correct Answer:** now().

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "current date and time", "timestamp." FEEL temporal "now" function.

**Въпросът → Solution Framing.** "Built-in fits current moment" — изпитва се FEEL temporal vocabulary.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че now() returns current date-time, че today() е date-only, че time(str) е constructor. Това е знание за FEEL temporal built-ins.

---

## Question 40: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Java application uses Spring Zeebe and hosts many workers handling many small jobs. The team observes underutilisation — the workers seem to wait for jobs instead of running them concurrently. They want **intra-JVM parallelism** — multiple threads handling jobs concurrently within one process.

**Which Spring Zeebe configuration tunes intra-JVM concurrency?**

- **a)** Configure the **executor thread pool size** (Spring Zeebe property like `camunda.client.zeebe.execution-threads` or equivalent) and ensure **`maxJobsActive`** is high enough to keep threads fed. The pool's threads process activated jobs concurrently; maxJobsActive controls how many jobs the worker holds at once. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** Spring Zeebe is single-threaded per JVM; spawn multiple JVMs for parallelism — incorrect; Spring Zeebe supports multi-threaded execution within a JVM. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** Spawn multiple JVMs (Docker containers) to get parallelism — workable for horizontal scaling but doesn't tune intra-JVM; should also tune pool size. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** Not configurable; tuning is hands-off — incorrect; multiple Spring Zeebe properties tune concurrency. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Intra-JVM parallelism in Spring Zeebe is controlled by two related knobs: (1) **executor thread pool** — how many threads in the JVM process activated jobs in parallel; (2) **maxJobsActive** — how many jobs the worker subscription activates at a time. For full utilisation, threads ≥ maxJobsActive (otherwise threads sit idle while jobs queue). Tune based on workload: CPU-bound work → match thread count to CPU cores; I/O-bound work → can over-subscribe (more threads than cores).

- **Option b) — Wrong.** Spring Zeebe is multi-threaded; default pool sizes may be conservative but are tunable.

- **Option c) — Horizontal scaling.** Multiple JVMs adds horizontal scaling but doesn't address intra-JVM efficiency. Best to tune both.

- **Option d) — Incorrect.** Tuning is explicitly supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Thread pool + maxJobsActive tunes intra-JVM concurrency.
- **b) 2/10** — wrong; multi-threaded supported.
- **c) 5/10** — horizontal scaling; doesn't address intra-JVM tuning.
- **d) 1/10** — невярно; configurable.

**Correct Answer:** Configure executor thread pool size + maxJobsActive.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "intra-JVM parallelism", "underutilisation." Worker tuning question.

**Въпросът → Solution Framing.** "Tunes intra-JVM concurrency" — изпитва се Spring Zeebe tuning knobs.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че thread pool + maxJobsActive са the knobs, че single-JVM multi-threading е supported, че multiple JVMs е horizontal scaling. Това е знание за worker concurrency tuning.

---

## Question 41: Extensions & Integrations (Weighting: 25%)

**Scenario:** A TypeScript Job Worker using `@camunda8/sdk` handles a `validate-vat` task. The validator throws custom error classes like `InvalidVatError`, `RegionMismatchError`, `ExternalApiTimeoutError`. The team wants each custom error class to be mapped to a specific **BPMN error code** so the BPMN can route appropriately via Error Boundary Events.

**Which pattern in the handler maps JS errors to BPMN errors with error codes?**

- **a)** Wrap the handler body in **try/catch**; on caught error, inspect the error's class / type and call `job.error({errorCode, errorMessage})` with the appropriate code based on the error class. E.g., `InvalidVatError` → `errorCode: "INVALID_VAT"`. The BPMN's Error Boundary catches by errorCode. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **b)** SDK auto-converts JS Error → BPMN error with errorCode = error class name — partial truth; some SDK versions may have heuristics, but explicit mapping is safer. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **c)** Configure global error mapper in SDK options — some SDK versions expose this; check current docs. Cleaner for many error classes vs many handlers. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **d)** Don't catch; let the error propagate and Zeebe fails the job — loses the BPMN-error-with-code mapping; the BPMN can't route by code. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Explicit try/catch + `job.error({...})` mapping is the canonical, reliable pattern. Inside the handler, wrap the logic; in catch, inspect `error instanceof InvalidVatError`, build the right errorCode/message, call `job.error()`. This produces a BPMN error event in Zeebe that propagates to a matching Error Boundary Event with that errorCode. Result: BPMN-level routing by error type.

- **Option b) — Avoid relying on heuristics.** Even if some SDK versions auto-map, explicit mapping is more maintainable — the mapping is visible in code, doesn't depend on undocumented behaviour.

- **Option c) — Cleaner for scale.** A global error mapper (configured at SDK init) centralises the JS-error-to-BPMN-error mapping for all workers. Useful when you have many error classes and many handlers; reduces duplication. Verify your SDK version supports this.

- **Option d) — Loses code mapping.** Unhandled errors become generic Zeebe job failures (Incident with stack trace), not BPMN errors. BPMN can't route by code; ops must intervene manually.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Explicit try/catch + job.error mapping; clear and reliable.
- **b) 4/10** — partial; auto-mapping е heuristic-dependent.
- **c) 7/10** — valid alternative за scale; verify SDK version.
- **d) 2/10** — loses code mapping; manual incident handling needed.

**Correct Answer:** Try/catch + explicit job.error({errorCode, errorMessage}) mapping in the handler.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/node-js-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "custom error classes", "map to BPMN error codes", "Error Boundary routing." JS-error-to-BPMN-error mapping.

**Въпросът → Solution Framing.** "Pattern maps JS errors to BPMN" — изпитва се SDK error API.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че job.error({errorCode, errorMessage}) е the BPMN-error API, че try/catch е the wrapping pattern, че auto-mapping е heuristic. Това е знание за SDK error handling.

---

## Question 42: Extensions & Integrations (Weighting: 25%)

**Scenario:** Ops needs to know **how many running instances of `daily-batch`** exist at this moment for capacity planning. They want a programmatic check — not Operate UI clicks.

**Which Camunda 8 API + endpoint fits?**

- **a)** **Orchestration Cluster REST API** — POST `/v2/process-instances/search` with filter `processDefinitionId = "daily-batch"` and `state = "ACTIVE"`. The response includes a list of matching instances; the response metadata (pagination) gives the total count. Documentation: [Orchestration API search](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/)

- **b)** Operate UI only — humans can browse, but ops wants programmatic. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Zeebe gRPC API — Zeebe's gRPC is command-oriented (start instances, complete jobs, etc.), not query-oriented; query operations are in the Orchestration REST API. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

- **d)** Optimize API — Optimize is for historical analytics; not realtime counting of current active instances. Documentation: [Optimize](https://docs.camunda.io/docs/components/optimize/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Orchestration Cluster REST API's `/v2/process-instances/search` endpoint is the canonical programmatic query. Filter by processDefinitionId and state; the response carries the matching list. For just the count, request `pageSize=0` or check the response metadata for the total. This API is the modern unified query interface (replaces legacy Operate/Tasklist API queries).

- **Option b) — UI only.** Operate is for humans. For programmatic queries (CI checks, capacity planning, alerts), use the API.

- **Option c) — Wrong scope.** Zeebe gRPC is command-side (write operations). Query-side is the Orchestration REST API.

- **Option d) — Wrong purpose.** Optimize answers "how did instances behave historically?" — not "how many are running right now?"

**Per-option scoring (1–10):**
- **a) 10/10** — верен. /v2/process-instances/search filtered by state.
- **b) 4/10** — UI works за humans, не programmatic.
- **c) 3/10** — wrong scope (command, не query).
- **d) 3/10** — wrong purpose (analytics, не realtime count).

**Correct Answer:** Orchestration Cluster REST API — POST /v2/process-instances/search with state=ACTIVE filter.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "count running instances", "programmatic check", "capacity planning." Realtime query.

**Въпросът → Solution Framing.** "API + endpoint fits" — изпитва се knowledge на API surface boundaries.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Orchestration REST API е query interface, че Zeebe gRPC е commands, че Optimize е historical, че Operate UI е human-facing. Това е знание за API surface mapping.

---

## Question 43: Extensions & Integrations (Weighting: 25%)

**Scenario:** A custom Java Connector has an Element Template property bound via `zeebe:input` named `apiUrl`. The Connector function needs to read this at execution time.

**Which Connector SDK API exposes the bound input to Java code?**

- **a)** Define a **Java class with annotated fields** representing the inputs; in `execute()`, call `context.bindVariables(InputClass.class)` (or similar SDK method) — the SDK reads the bound inputs into the class instance. Or use field-level annotations like `@TemplateProperty` for declarative binding. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** Read from `System.getenv("apiUrl")` — incorrect; inputs aren't environment variables. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** Parse BPMN XML at runtime — incorrect; SDK abstracts the BPMN. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **d)** Receive as a process variable in the Output Mapping — wrong direction; Output Mapping is for what comes OUT of the task, not what goes IN. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Connector SDK exposes a type-safe binding API. The canonical pattern: declare a Java class (e.g., `MyConnectorInput`) with fields matching template properties; in `execute(context)`, call `context.bindVariables(MyConnectorInput.class)` to get a populated instance. Annotations like `@TemplateProperty` declare per-field metadata (validation, default values, group). This approach is type-safe, IDE-supported, and refactor-friendly.

- **Option b) — Wrong source.** Environment variables aren't Connector inputs. Connectors operate per-task-instance; env vars are JVM-process-wide.

- **Option c) — Wrong layer.** SDK abstracts the BPMN; you don't parse it manually.

- **Option d) — Wrong direction.** Output Mapping comes after task completion; inputs come from `zeebe:input` mappings + context.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. context.bindVariables(InputClass) + @TemplateProperty annotations.
- **b) 1/10** — wrong source (env vars).
- **c) 1/10** — wrong layer.
- **d) 3/10** — wrong direction.

**Correct Answer:** Define a Java input class; call context.bindVariables(InputClass.class).

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "read input in Java code", "bound via zeebe:input." Connector SDK input binding.

**Въпросът → Solution Framing.** "SDK API exposes bound input" — изпитва се SDK Java API.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SDK supports type-safe binding via class + annotations, че env vars / BPMN parsing / Output Mapping са wrong layers. Това е знание за Connector SDK Java API.

---

## Question 44: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team's worker logs show recurring `gRPC RESOURCE_EXHAUSTED` errors when polling for jobs. The cluster is healthy — other workers in different namespaces don't see this error.

**What does `RESOURCE_EXHAUSTED` typically indicate?**

- **a)** **Throttling / capacity limit** — the gateway is rejecting requests because the worker is sending faster than the cluster's quota allows (per-tenant rate limit, gateway thread pool exhaustion, broker backpressure, etc.). Mitigations: reduce request rate, tune `maxJobsActive`, increase `pollInterval`, scale gateway, check cluster quotas. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/) + [gRPC status codes](https://grpc.github.io/grpc/core/md_doc_statuscodes.html)

- **b)** Network outage — would typically be `UNAVAILABLE` or `DEADLINE_EXCEEDED`, not RESOURCE_EXHAUSTED. Documentation: [gRPC status](https://grpc.github.io/grpc/core/md_doc_statuscodes.html)

- **c)** Auth failure — would be `UNAUTHENTICATED` or `PERMISSION_DENIED`. Documentation: [gRPC status](https://grpc.github.io/grpc/core/md_doc_statuscodes.html)

- **d)** Process not deployed — different error path; would surface as `NOT_FOUND` or specific Zeebe error responses. Documentation: [gRPC status](https://grpc.github.io/grpc/core/md_doc_statuscodes.html)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** gRPC's standard `RESOURCE_EXHAUSTED` (code 8) signals that some resource (rate quota, memory, threads, etc.) is at capacity. In Zeebe context, common causes: per-tenant rate limit hit, gateway thread pool saturated, broker applying backpressure. Diagnostic approach: check the cluster metrics, look at backpressure indicators, reduce the worker's request rate or increase the cluster's capacity.

- **Option b) — Different code.** Network issues typically surface as UNAVAILABLE.

- **Option c) — Different code.** Auth issues surface as UNAUTHENTICATED.

- **Option d) — Different code.** Missing process would surface as NOT_FOUND when starting an instance of it.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. RESOURCE_EXHAUSTED = throttling / capacity limit.
- **b) 3/10** — would be UNAVAILABLE.
- **c) 3/10** — would be UNAUTHENTICATED.
- **d) 2/10** — would be NOT_FOUND.

**Correct Answer:** Throttling / capacity limit; reduce request rate or scale capacity.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/zeebe-api/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "RESOURCE_EXHAUSTED", "polling for jobs." gRPC error code semantic.

**Въпросът → Solution Framing.** "What indicates" — изпитва се knowledge на gRPC status codes.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че RESOURCE_EXHAUSTED = throttling, че network = UNAVAILABLE, че auth = UNAUTHENTICATED, че missing = NOT_FOUND. Това е знание за gRPC standard codes.

---

## Question 45: Extensions & Integrations (Weighting: 25%)

**Scenario:** A data team has Python scripts for analytics. They want to integrate with Camunda 8 — start process instances, query state, publish messages. They're looking for a Python SDK.

**What's the canonical integration approach for Python?**

- **a)** Use the **Orchestration Cluster REST API** directly from Python — Python has excellent HTTP libraries (`requests`, `httpx`); the REST API is language-agnostic. Camunda 8 officially provides SDKs for Java, Node.js, Go (and others as community projects); for Python the REST API is the canonical path. Documentation: [APIs and Tools](https://docs.camunda.io/docs/apis-tools/)

- **b)** Camunda provides an official Python SDK with feature parity — historically not the case; verify per current version. Documentation: [APIs and Tools](https://docs.camunda.io/docs/apis-tools/)

- **c)** Run the Java SDK via Jython — Jython is largely unmaintained; not a recommended path. Documentation: [APIs and Tools](https://docs.camunda.io/docs/apis-tools/)

- **d)** Python isn't supported with Camunda 8 — incorrect; REST API enables any HTTP-capable client. Documentation: [APIs and Tools](https://docs.camunda.io/docs/apis-tools/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8's REST API is the language-agnostic integration interface. Python integrates via standard HTTP libraries: handle OAuth2 token exchange (`requests-oauthlib` or manual), call `/v2/process-instances`, `/v2/messages/publication`, etc. For Job Workers in Python, the REST-based job activation is more complex than the SDK-managed flow but workable. Community Python SDKs exist (verify maintenance level before adopting).

- **Option b) — Verify per version.** Camunda may add or recognise Python SDKs over time; always check current docs.

- **Option c) — Unmaintained route.** Jython hasn't kept pace with modern Python; avoid.

- **Option d) — Incorrect.** Python is supported via REST.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. REST API from Python с standard HTTP libraries.
- **b) 4/10** — verify per version; не canonical historically.
- **c) 2/10** — Jython unmaintained.
- **d) 1/10** — невярно; REST API enables any client.

**Correct Answer:** Use the Orchestration Cluster REST API from Python via standard HTTP libraries.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Python integration", "looking for SDK." Language support question.

**Въпросът → Solution Framing.** "Canonical approach for Python" — изпитва се knowledge на SDK availability + REST fallback.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че REST API е language-agnostic, че SDK availability varies (Java/Node/Go първи-class), че Jython е unmaintained. Това е знание за integration options.

---

## Question 46: Extensions & Integrations (Weighting: 25%)

**Scenario:** A backend service publishes a Message to correlate with a waiting subscription. The team wants the message to **expire after 1 hour** if no subscription correlates — they don't want it to buffer indefinitely.

**Which message attribute controls TTL?**

- **a)** **`timeToLive`** (or TTL) on the `publishMessage` command — specifies how long the message buffers waiting for a matching subscription. After TTL expires without correlation, the message is discarded. Default may be 0 (no buffering, requires existing subscription); set explicitly for buffered correlation. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **b)** TTL not supported — incorrect; message TTL is a documented feature. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **c)** TTL fixed at 24h — configurable, not fixed. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **d)** Implement a separate cleanup process to delete old messages — unnecessary; built-in TTL handles it. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe's `PublishMessage` command accepts `timeToLive` (TTL). The message is buffered in the broker for the specified duration, waiting for a matching subscription. If correlation happens, the message is consumed; if TTL elapses first, the message is discarded. Use TTL to control how long unmatched messages live — match your business expectation for "this event should still be processable for X time."

- **Option b) — Incorrect.** TTL is core.

- **Option c) — Configurable.** No fixed default; the publisher sets it.

- **Option d) — Unnecessary.** Built-in TTL handles message expiration.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. timeToLive controls message buffer lifetime.
- **b) 1/10** — невярно.
- **c) 3/10** — configurable, не fixed.
- **d) 2/10** — unnecessary; built-in.

**Correct Answer:** Set timeToLive on the publishMessage command.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/messages/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "message TTL", "expire after 1 hour." Message lifecycle question.

**Въпросът → Solution Framing.** "Attribute controls TTL" — изпитва се publishMessage parameters.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че timeToLive е publishMessage parameter, че message buffers за TTL duration, че cleanup process е redundant. Това е знание за message lifecycle.

---

## Question 47: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team has an RPA bot that automates a **Windows-only desktop application** (SAP GUI client). Their Linux-based RPA workers can't run it. Adding a Windows worker is the architectural question.

**What does Camunda 8 RPA architecture support for OS-specific bots?**

- **a)** Deploy a **Windows-based RPA worker** dedicated to Windows-only automations. Camunda 8 RPA workers can be deployed on multiple OSes; configure routing so Windows-only bots subscribe through Windows workers. Service Tasks with `camunda::rpa` type can be matched by worker capability (or business naming convention). Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **b)** RPA only works on Linux — incorrect; Windows workers are supported. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **c)** Use Wine on Linux to run the Windows app — hacky, fragile for production. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **d)** Rewrite the Windows app to be cross-platform — unrealistic for a legacy desktop app the team doesn't control. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 RPA architecture decouples bot scripts from the Zeebe broker. Workers can run on any OS that supports the bot script's runtime. For Windows-only automations, deploy a Windows worker; for cross-platform automations, Linux workers may suffice. Routing matches via task subscription. Multiple worker fleets can coexist, each handling different bot types / OSes.

- **Option b) — Incorrect.** Windows workers supported.

- **Option c) — Fragile workaround.** Wine compatibility for enterprise apps (SAP, MS Office) is unreliable; not for production.

- **Option d) — Unrealistic.** Legacy desktop apps often can't be rewritten.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Deploy Windows worker за OS-specific bots.
- **b) 1/10** — incorrect; Windows supported.
- **c) 3/10** — fragile workaround.
- **d) 2/10** — unrealistic.

**Correct Answer:** Deploy a Windows-based RPA worker for Windows-only automations.

**Official Documentation Link:** https://docs.camunda.io/docs/components/rpa/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Windows-only desktop app", "Linux workers can't run." OS-specific RPA placement.

**Въпросът → Solution Framing.** "RPA architecture supports" — изпитва се knowledge на multi-OS worker deployment.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че RPA workers run on multiple OSes, че Wine е fragile, че legacy rewrites са unrealistic. Това е знание за RPA worker placement.

---

## Question 48: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must **reverse a list**: `[1, 2, 3, 4, 5]` → `[5, 4, 3, 2, 1]`.

**Which FEEL built-in fits?**

- **a)** `reverse(list)` — returns a new list with the same elements in reverse order. FEEL standard list function. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** `list.reverse()` — JS reflex; not FEEL syntax. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `sort(list, function(a,b) a > b)` — works only if the list is sorted in some natural order; reverses for numeric lists but doesn't generally "reverse" — it re-sorts. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **d)** No built-in for reverse — incorrect; `reverse()` exists. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `reverse(list)` is FEEL's standard list function. Returns a new list with elements in reverse order. Preserves any duplicate values.

- **Option b) — JS reflex.** No method-call syntax in FEEL.

- **Option c) — Different semantic.** Sort by `a > b` orders by descending comparison; for `[1, 2, 3]` it gives `[3, 2, 1]` (matches reverse), but for `[3, 1, 2]` it gives `[3, 2, 1]` (a sorted result, not a "reversed" `[2, 1, 3]`). Not equivalent to reverse.

- **Option d) — Incorrect.** Built-in exists.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. reverse() е FEEL standard.
- **b) 2/10** — JS reflex.
- **c) 4/10** — sort ≠ reverse semantically.
- **d) 1/10** — невярно; built-in existing.

**Correct Answer:** reverse(list).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "reverse a list." Single FEEL function check.

**Въпросът → Solution Framing.** "Built-in fits" — изпитва се FEEL list-function vocabulary.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че reverse() е FEEL standard, че sort с descending е different semantic (re-orders), че JS method-call не работи. Това е знание за FEEL list ops.

---

## Question 49: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must **convert a string to a number**: `"123.45"` → `123.45`. The string comes from a User Task form input or external API response.

**Which FEEL built-in fits?**

- **a)** `number(s)` — FEEL's standard string-to-number constructor. Parses the string as a decimal number. Companion to `string(n)` (number-to-string). Documentation: [FEEL conversion](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-conversion/)

- **b)** `parseFloat(s)` — JavaScript reflex; not FEEL. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `s * 1` — implicit numeric coercion; FEEL doesn't auto-coerce strings to numbers, so this would be a type error. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `toNumber(s)` — JS-camelCase-style guess; FEEL uses lowercase `number()`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `number(string)` parses the string to a number. Companions: `string(n)` to-string, `date(s)` parse-date, `boolean(s)` parse-boolean. FEEL's conversion functions are explicit, single-argument, no-coercion. The function name is lowercase `number`.

- **Option b) — JS reflex.** Different language.

- **Option c) — Type error.** FEEL doesn't auto-coerce; `*` requires both operands to be numbers.

- **Option d) — Wrong name.** FEEL doesn't use camelCase.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. number(s) е FEEL string-to-number.
- **b) 2/10** — JS reflex.
- **c) 2/10** — type error; no implicit coercion.
- **d) 3/10** — wrong name (camelCase, не FEEL).

**Correct Answer:** number("123.45").

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-conversion/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "string to number", "from form/API." FEEL conversion function.

**Въпросът → Solution Framing.** "Built-in fits" — изпитва се FEEL conversion vocabulary.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че number() е FEEL conversion, че FEEL не auto-coerce, че camelCase / JS-style names не работят. Това е знание за FEEL conversions.

---

## Question 50: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must return the **maximum** of two numeric values (or a list of them) — e.g., the higher of `bidA = 1500` and `bidB = 1700` → `1700`.

**Which FEEL built-in fits?**

- **a)** `max(a, b)` — FEEL's variadic max function. Accepts two or more arguments OR a single list argument: `max(1500, 1700)` = `1700`; `max([1500, 1700, 1600])` = `1700`. Companion: `min()`. Documentation: [FEEL numeric](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/)

- **b)** `Math.max(a, b)` — JS reflex; FEEL uses bare `max`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `greatestOf(a, b)` — invented function. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `if a > b then a else b` — manual conditional; works for two values but doesn't scale to N values. `max(...)` is the idiomatic choice. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's `max` is variadic: accepts multiple arguments or a single list. Works on numerics, dates, durations (any comparable type). Companion is `min`. Both are idiomatic and concise.

- **Option b) — JS reflex.** No `Math.` namespace.

- **Option c) — Invented.** Not in FEEL.

- **Option d) — Works for two, doesn't scale.** Manual conditional handles two values; for three or more you'd nest if-thens or use a list-based approach. `max(a, b)` and `max([a, b, c])` are cleaner.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. max(a, b) variadic или max(list).
- **b) 2/10** — JS reflex.
- **c) 1/10** — invented.
- **d) 5/10** — works for 2 values; doesn't scale.

**Correct Answer:** max(a, b) (variadic; also accepts list).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "maximum of two values." FEEL max function check.

**Въпросът → Solution Framing.** "Built-in fits" — изпитва се FEEL numeric/list functions.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че max() е variadic / list-aware, че Math.max е JS reflex, че manual if-then doesn't scale. Това е знание за FEEL aggregation functions.

---

# Section 7 — Managing the Development Process (Questions 51-59)

> Weight 15% • Topics: BPMN validation (isExecutable), Modeler integration, Operate Update Retries, Tasklist variable editing, REST verification, Optimize analytics, template scoping, project export, batch migration results.

---

## Question 51: Managing the Development Process (Weighting: 15%)

**Scenario:** A team deploys a BPMN file via `zbctl deploy` and receives an error: `"no executable process: the process is not marked as executable"`. The team is unsure why a deployable BPMN is rejected.

**What does this error mean and how is it fixed?**

- **a)** The `<bpmn:process>` element in the BPMN XML must have the attribute `isExecutable="true"`. Without it, the process is treated as a **descriptive model** (documentation-only) and Zeebe refuses to deploy. Fix in Web Modeler via the property panel ("Executable" toggle on the process element) or by editing the BPMN XML directly. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

- **b)** Re-deploy the BPMN — incorrect; the issue is structural, re-deploy without fixing the attribute will fail again. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

- **c)** Add a worker for the missing task type — wrong layer; the error is about deployment, not runtime worker subscription. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Restart Zeebe — incorrect; the issue is BPMN-side. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN distinguishes **executable** processes (intended for engine execution) from **descriptive** models (modelling artefacts used for documentation, design discussion, governance, etc.). The `isExecutable` attribute marks the distinction. Zeebe refuses to deploy non-executable processes because there's nothing to execute. Fix: enable the toggle in Web Modeler, or edit `<bpmn:process isExecutable="true" id="..." name="...">`. After that, redeploy succeeds.

- **Option b) — Wrong approach.** Re-deploying the same broken file fails identically. The model itself needs the attribute.

- **Option c) — Wrong scope.** Worker subscription is a runtime concern (after deployment); deployment fails before that.

- **Option d) — Incorrect.** Restart doesn't fix BPMN attributes.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Set isExecutable="true" on the bpmn:process element.
- **b) 2/10** — re-deploy без fix още fail-ва.
- **c) 1/10** — wrong layer (runtime, не deploy).
- **d) 1/10** — невярно.

**Correct Answer:** Set isExecutable="true" on the bpmn:process element (Web Modeler property panel: "Executable" toggle).

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/deployment/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "no executable process", "deployment fails." BPMN attribute validation error.

**Въпросът → Solution Framing.** "What it means and how to fix" — изпитва се BPMN isExecutable rule.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BPMN distinguishes executable vs descriptive models, че isExecutable="true" е required for Zeebe deployment, че re-deploy / worker / restart не fix-ват the attribute. Това е знание за BPMN deployment requirements.

---

## Question 52: Managing the Development Process (Weighting: 15%)

**Scenario:** A team uses **Desktop Modeler** for offline / local BPMN authoring with Git as their version control. Meanwhile, the rest of the team uses **Web Modeler** for collaboration. A developer wants to **share a BPMN authored in Desktop Modeler with the team via Web Modeler**.

**Which workflow brings a Desktop-authored BPMN into Web Modeler?**

- **a)** **Upload the `.bpmn` file** to a Web Modeler project (via Web Modeler's UI upload action), OR if the project has **Git Sync** configured, commit the file to the connected Git repository and let the sync bring it in. Both paths are valid; choose by team's collaboration model. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/) + [GitHub Sync](https://docs.camunda.io/docs/components/modeler/web-modeler/github-sync/)

- **b)** Sync is automatic without setup — incorrect; Git Sync requires explicit configuration on the Web Modeler project. Documentation: [GitHub Sync](https://docs.camunda.io/docs/components/modeler/web-modeler/github-sync/)

- **c)** Email the `.bpmn` to a teammate to upload — workable but error-prone (versioning, attachments lost); upload / Git sync are canonical. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** Desktop Modeler can't share with Web Modeler — incorrect; the BPMN file format is the shared interchange. Documentation: [Modelers](https://docs.camunda.io/docs/components/modeler/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN is a standardised XML format shared between Modelers. To bring a Desktop-authored BPMN into Web Modeler: either drag-drop / upload via the Web Modeler UI, or use Git Sync (configure the Web Modeler project to sync with a Git repo, commit the file in Desktop / via git CLI, Web Modeler picks it up). The two paths suit different workflows: Upload is one-off; Git Sync is continuous integration.

- **Option b) — Wrong default.** Git Sync requires explicit project-level configuration.

- **Option c) — Email is suboptimal.** Loses version history, easy to miss attachments. Use upload or Git.

- **Option d) — Wrong.** Sharing supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Upload .bpmn OR commit to Git-synced repo.
- **b) 3/10** — automatic sync misconception.
- **c) 4/10** — workable но error-prone.
- **d) 1/10** — невярно.

**Correct Answer:** Upload the .bpmn file to Web Modeler, or commit to a Git-Synced repository.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Desktop → Web Modeler share." Modeler integration paths.

**Въпросът → Solution Framing.** "Workflow brings BPMN" — изпитва се knowledge на Web Modeler import paths.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Upload и Git Sync са the canonical paths, че Git Sync requires explicit config, че email е suboptimal. Това е знание за Modeler integration.

---

## Question 53: Managing the Development Process (Weighting: 15%)

**Scenario:** A Service Task instance has an Incident: `"Retries: 0"`. The team has fixed the underlying issue (worker bug resolved) and wants to **increase the retries** for this specific job back to 3 so it can be re-activated.

**Which Operate action fits "increase retries on a failed job"?**

- **a)** In Operate, on the job (visible in the instance detail or the incidents list), use the **"Update Retries"** action — set a new positive integer (e.g., 3). The job's retries counter is updated; if the value is > 0, the job becomes re-activatable and the next worker subscription picks it up. The incident is resolved when retries > 0 and the job is reactivated. Documentation: [Operate Incidents](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **b)** Cancel the instance and re-deploy the BPMN — heavyweight; loses progress, doesn't address the per-job concern. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Delete the Incident manually — Operate doesn't have a generic "delete incident" without addressing the underlying cause; resolving incidents goes through Update Retries / Update Variables / Modify. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **d)** Wait for auto-retry — Zeebe doesn't auto-retry when retries reach 0; manual intervention required. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's "Update Retries" is the surgical Incident-resolution action for failed jobs. Ops sees the failed job (often via the incident list), picks Update Retries, enters a positive integer. Zeebe updates the job's retries counter and re-activates the job. A worker picks it up, processes it (now that the bug is fixed), success. Incident clears.

- **Option b) — Heavyweight.** Cancel + re-deploy is for completely-different scenarios (e.g., BPMN changes that fundamentally break running instances). For a single job's transient failure, Update Retries is targeted.

- **Option c) — Wrong action.** Incidents resolve when their cause is addressed (job activatable, variable correct, etc.), not by manual deletion.

- **Option d) — Wrong assumption.** Zeebe's contract: retries = 0 ⇒ Incident, requires manual resolution. There's no auto-retry beyond the configured retries count.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Update Retries action на job.
- **b) 2/10** — heavyweight; loses progress.
- **c) 3/10** — wrong action; incidents resolved through specific actions.
- **d) 1/10** — wrong assumption; no auto-retry.

**Correct Answer:** Use Operate's "Update Retries" action on the failed job.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "increase retries", "after fixing bug." Targeted incident resolution.

**Въпросът → Solution Framing.** "Action fits" — изпитва се Operate Incident handling actions.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Update Retries е the canonical action, че cancel/re-deploy е heavyweight, че incidents resolve through specific actions. Това е знание за Operate Incident workflow.

---

## Question 54: Managing the Development Process (Weighting: 15%)

**Scenario:** A User Task in Tasklist shows process variables. The assignee needs to **update one variable** (`approvalComment`) before completing the task — e.g., enter their decision rationale. The team wonders whether Tasklist supports variable editing.

**How does Tasklist support variable editing by the assignee?**

- **a)** **Tasklist supports variable editing** — typically through a **Camunda Form** bound to the User Task (the form's input components write back to variables on submission). For simple direct editing without a form, Tasklist may also expose variable edit affordances in the task detail UI. Variables update on completion. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/)

- **b)** Variables are read-only in Tasklist — incorrect; editing is a core feature. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **c)** Edit via Operate only — Operate edits variables for ops/admin purposes, but Tasklist is the user-facing path for end users completing tasks. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Use a Connector to edit variables — over-engineered; Form-based editing is the canonical pattern. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Tasklist's primary editing flow uses Camunda Forms: the User Task references a deployed Form (`formId`); Tasklist renders the form; user fills in / edits fields; on Complete, the form's values write back to process variables. For tasks without a Form, Tasklist may show variable values and (depending on version) allow direct editing. Forms are the recommended UX pattern.

- **Option b) — Wrong.** Editing is supported.

- **Option c) — Wrong scope.** Operate is for ops/admin; Tasklist is user-facing.

- **Option d) — Over-engineered.** Forms handle user-facing editing well.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Tasklist supports variable editing via Forms (или direct UI).
- **b) 1/10** — wrong; editing supported.
- **c) 3/10** — wrong scope.
- **d) 2/10** — over-engineered.

**Correct Answer:** Tasklist supports variable editing through Camunda Forms (or direct UI affordances).

**Official Documentation Link:** https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "update variable", "Tasklist user editing." User-facing variable manipulation.

**Въпросът → Solution Framing.** "Supports variable editing" — изпитва се Tasklist UX model.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Forms е the canonical editing pattern, че Tasklist е user-facing, че Operate е ops/admin. Това е знание за Tasklist UX.

---

## Question 55: Managing the Development Process (Weighting: 15%)

**Scenario:** A CI pipeline deploys BPMN to a SaaS cluster. After the `zbctl deploy` command, the pipeline wants to **verify programmatically** that the deployment succeeded and that the latest version is now the one referenced — for audit and to gate downstream pipeline steps.

**Which API approach lets the CI verify the deployment?**

- **a)** Query the **Orchestration Cluster REST API** — search for process definitions filtered by `processDefinitionId`, get the list of versions. Check that the latest version matches the just-deployed timestamp / file hash. Alternatively, parse the deployment response from `zbctl` (which includes the deployed definition's metadata). Documentation: [Orchestration API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/)

- **b)** Take a screenshot of Operate UI — not programmatic, not auditable. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Ping the cluster's `/health` endpoint — verifies the cluster is up but doesn't verify the deployment succeeded. Documentation: [Quickstart](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **d)** No way to verify programmatically — incorrect; REST API supports this. Documentation: [Orchestration API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Orchestration REST API exposes process-definition queries. Post-deployment, the CI can query the API: filter by processId, get back the version list, compare the latest version's timestamp/key to what `zbctl deploy` returned. If they match, deployment is confirmed; if not, alert. This pattern is auditable, scriptable, and idempotent.

- **Option b) — Not programmatic.** Screenshots are for humans.

- **Option c) — Wrong scope.** Health checks cluster liveness, not deployment status.

- **Option d) — Incorrect.** Verification is straightforward.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Orchestration REST API process-definition search.
- **b) 1/10** — not programmatic.
- **c) 2/10** — wrong scope.
- **d) 1/10** — невярно.

**Correct Answer:** Query the Orchestration Cluster REST API for process definitions to verify the deployment.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "verify deployment programmatically", "CI gate." API-based verification.

**Въпросът → Solution Framing.** "Approach lets CI verify" — изпитва се knowledge на REST API for deployment verification.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че REST API exposes process-definition queries, че screenshots / health checks са wrong scope. Това е знание за CI integration.

---

## Question 56: Managing the Development Process (Weighting: 15%)

**Scenario:** A monitored process `order-fulfillment` has been running smoothly, but the team's SLA dashboard shows the **95th-percentile end-to-end duration** jumped from 30 seconds to 2 minutes over the past week. The team needs to investigate the trend and find the root cause.

**Which Camunda 8 component is purpose-built for this kind of historical analytics?**

- **a)** **Optimize** — Camunda's analytics platform built for historical reporting: trend lines, duration percentiles (p50, p90, p95, p99), bottleneck analysis (which flow node consumes the most time on average?), heatmaps, and dashboards. The 95th-percentile metric is exactly Optimize's bread and butter. Documentation: [Optimize](https://docs.camunda.io/docs/components/optimize/)

- **b)** Operate — operational tool for current state (active instances, current incidents). Limited historical analytics; not built for percentile / trend reporting. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Tasklist — User Task UI; not for analytics. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **d)** zbctl — CLI for commands; not for analytics. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Optimize aggregates historical instance data and surfaces it through dashboards and reports. Use cases: percentile durations, bottleneck analysis, comparative reports across time periods, alerts on KPI degradation. For "p95 duration regression last week," Optimize's report can plot the trend, drill into the slow instances, and identify which flow node became the bottleneck.

- **Option b) — Wrong tool.** Operate is operational, focused on the now.

- **Option c) — Wrong scope.** Tasklist handles User Tasks for end users.

- **Option d) — Wrong tool.** zbctl is for commands.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Optimize за historical analytics + percentiles.
- **b) 3/10** — Operate е operational, не analytics.
- **c) 1/10** — wrong scope.
- **d) 1/10** — wrong tool.

**Correct Answer:** Optimize — historical analytics + percentile / trend reports.

**Official Documentation Link:** https://docs.camunda.io/docs/components/optimize/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "p95 duration trend", "investigate root cause." Analytics tooling question.

**Въпросът → Solution Framing.** "Component purpose-built for analytics" — изпитва се knowledge на C8 component boundaries.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Optimize е analytics, че Operate е operational current state, че Tasklist + zbctl са different scopes. Това е знание за C8 component scope.

---

## Question 57: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's Web Modeler project has a custom Connector Template uploaded. Modelers in this project can use it on Service Tasks. Other teams in the organisation also want access — but only members of the original team are seeing it.

**Is the Template scope project-specific or org-wide?**

- **a)** **Project-specific by default** — Connector Templates uploaded to a project are visible only within that project. To make them available organisation-wide, **publish at organisation scope** (where supported) so all projects can use them. Templates support a hierarchy of scopes; verify the current Web Modeler version's exact options. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **b)** Auto org-wide on upload — incorrect; defaults to the upload's project scope. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **c)** Only the uploader's other projects — also incorrect; default is the specific project. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **d)** Templates can't be shared — incorrect; sharing via org scope is supported. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler's template scoping defaults to the project where the template was uploaded. For org-wide availability, publish at the organisation scope (typically requires elevated permission). This scoping model lets teams develop their own custom Connectors privately while still sharing approved ones across the org. Note: scope-modification capabilities vary by Web Modeler version and tier (SaaS vs SM); verify current docs.

- **Option b) — Wrong default.** Defaults to upload's project.

- **Option c) — Wrong scope.** Not "uploader's projects" — specifically the project where uploaded.

- **Option d) — Wrong.** Sharing supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Project-scoped by default; publish at org for wider access.
- **b) 3/10** — wrong default.
- **c) 4/10** — wrong scope.
- **d) 1/10** — wrong; sharing supported.

**Correct Answer:** Project-specific by default; publish at organisation scope for wider access.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Template scope", "other teams want access." Template visibility model.

**Въпросът → Solution Framing.** "Project-specific or org-wide" — изпитва се Web Modeler scoping.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че default е project scope, че org publish е needed for wider access, че sharing model е hierarchical. Това е знание за template scoping.

---

## Question 58: Managing the Development Process (Weighting: 15%)

**Scenario:** A team uses Web Modeler in SaaS. They want to **back up** an entire project — all BPMN, DMN, and Form files — as a single archive (e.g., for compliance, off-site backup, or migration to another cluster).

**Which Web Modeler feature fits "export entire project as ZIP"?**

- **a)** Web Modeler's **project-level export** action — typically a UI action that bundles all the project's resources into a ZIP archive. Downloadable for backup, version control commit, or migration. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **b)** Manually open each file and copy XML into a folder — tedious, error-prone for large projects. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** Web Modeler doesn't export — incorrect; export is a standard feature. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** Use API to fetch each resource — workable but requires custom scripting; built-in export is faster. Documentation: [Web Modeler API](https://docs.camunda.io/docs/apis-tools/web-modeler-api/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Project-level export is the canonical backup path. Bundles all resources (BPMN, DMN, Forms, Connector Templates) into a ZIP. Easy to commit to Git, store off-site, or import to another cluster. Verify the exact UI flow per Web Modeler version.

- **Option b) — Tedious.** Per-file copy doesn't scale.

- **Option c) — Incorrect.** Export feature exists.

- **Option d) — Workable but more work.** API-based fetch is good for automation (CI backups), but for one-off backup the UI export is simpler.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Project-level export to ZIP.
- **b) 4/10** — tedious; doesn't scale.
- **c) 1/10** — невярно.
- **d) 6/10** — workable за automation; UI е simpler за one-off.

**Correct Answer:** Web Modeler's project-level export action (bundles resources into ZIP).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "backup entire project as archive." Backup workflow.

**Въпросът → Solution Framing.** "Feature fits ZIP export" — изпитва се knowledge на Web Modeler export.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че project-level export bundles to ZIP, че API-based fetch е alternative for automation. Това е знание за Web Modeler backup.

---

## Question 59: Managing the Development Process (Weighting: 15%)

**Scenario:** A team migrates 200 instances of `order-v3` to `order-v4` using Operate's Process Instance Migration feature. After applying the migration, 195 instances succeeded and **5 failed**. The team needs to see which 5 and why.

**Which Operate view shows the per-instance migration results?**

- **a)** **Operate's batch operation result view** — after running a batch migration, Operate shows per-instance success/failure with reasons (e.g., "no mapping for flow node X", "variable type mismatch"). Drill into failures to see error details. Documentation: [Operate Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **b)** Tasklist — User Task UI, not migration results. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **c)** Optimize — analytics, not operation results. Documentation: [Optimize](https://docs.camunda.io/docs/components/optimize/)

- **d)** Build a custom dashboard — unnecessary; Operate has the data. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate tracks batch operations (cancel, retry, modify, migrate) and exposes a results view: which instances were targeted, which succeeded, which failed, and (for failures) the reason. After a 200-instance migration with 5 failures, the team opens the batch op result, filters to failures, sees the 5 with specific error reasons, addresses each (typically by adjusting the migration plan and retrying the failed subset).

- **Option b) — Wrong tool.** Tasklist handles User Tasks, not batch op results.

- **Option c) — Wrong tool.** Optimize is analytics, not operations.

- **Option d) — Unnecessary.** Operate has it built-in.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Operate batch operation result view.
- **b) 1/10** — wrong tool.
- **c) 3/10** — wrong tool.
- **d) 4/10** — unnecessary; built-in.

**Correct Answer:** Operate's batch operation result view shows per-instance migration outcomes.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "5 failed migrations", "see which and why." Batch operation result inspection.

**Въпросът → Solution Framing.** "View shows per-instance results" — изпитва се Operate batch op observability.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate tracks batch operations with per-instance results, че Tasklist / Optimize са different scopes. Това е знание за Operate batch ops.

---

# Section 8 — Dev Environment Setup (Question 60)

> Weight 1% • Topics: Camunda 8 health checks, component endpoints.

---

## Question 60: Dev Environment Setup (Weighting: 1%)

**Scenario:** A developer running a local Camunda 8 stack (Self-Managed via Docker Compose or Camunda 8 Run) wants to **programmatically check** the health of each component (Zeebe gateway, Operate, Tasklist, Identity). They want a shell command they can put in a CI smoke test or local readiness check.

**Which endpoints expose component health?**

- **a)** Each Camunda 8 component (built on Spring Boot) exposes an **`/actuator/health`** endpoint reporting overall liveness/readiness — `curl http://localhost:8080/actuator/health` for Operate, `:8082/actuator/health` for Tasklist, etc. The Zeebe gateway typically has its own management endpoint (`/actuator/health` on its management port). Documentation: [Self-Managed concepts](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **b)** No health check endpoint available — incorrect; Spring Boot Actuator health endpoints are standard in Camunda 8 components. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

- **c)** Only Operate UI provides health status — UI shows some health, but programmatic check needs the API endpoint. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** SSH into the broker container and inspect process — for a programmatic check the HTTP endpoint is far cleaner. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 components leverage Spring Boot's actuator framework. Each component exposes management endpoints on its configured port — `/actuator/health`, `/actuator/info`, `/actuator/metrics`. The health endpoint returns JSON like `{"status":"UP"}` (or "DOWN" with details). Use these for CI smoke tests, Kubernetes liveness/readiness probes, monitoring integrations. Exact ports vary by deployment; for Camunda 8 Run defaults: Operate :8080, Tasklist :8082; Zeebe gateway on its management port (separate from the gRPC port).

- **Option b) — Incorrect.** Actuator endpoints are standard.

- **Option c) — Partial.** UI shows visual health but programmatic check via HTTP is canonical.

- **Option d) — Crude.** Container-level inspection is far less useful than HTTP health endpoints.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. /actuator/health on each component's port.
- **b) 1/10** — невярно; standard endpoint.
- **c) 4/10** — partial; UI shows но programmatic = API.
- **d) 2/10** — crude.

**Correct Answer:** Each component exposes /actuator/health on its port (Spring Boot Actuator).

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "programmatic health check", "shell command for smoke test." HTTP health endpoint question.

**Въпросът → Solution Framing.** "Endpoints expose health" — изпитва се knowledge на Spring Boot Actuator integration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 8 components са Spring Boot apps with /actuator/health, че UI inspection е visual not programmatic, че container inspection е crude. Това е знание за Camunda 8 component health endpoints.

---

# Закриваща секция — Set 7

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

**Препоръка за тренировка (Set 7):**
1. **Open-book проход** — чети всеки 🔍 Explanations + Three-Skills Decomposition; не таймирай.
2. **Closed-book timed run** — 75-минутен таймер; запиши отговорите си; цел: ≥ 39/60.
3. **Анализ на грешки:** за всяка грешка кои от 3-те skills ти липсваше (Diagnostic Comprehension / Solution Framing / Mechanism Knowledge).

**Чести грешки в Set 7 (грешен axis вместо грешен отговор):**
- **Q1 (Compensation Throw)** — пътане с Error / Terminate / Signal end events; compensation е dedicated event type.
- **Q3 (Boundary on subprocess scope)** — пътане с "auto-distributed to inner activities" — BPMN не auto-distributes; boundary covers the visible host.
- **Q6 (parallel Send Tasks vs single vs MI)** — trap; all three patterns valid, pick by trade-off (clarity vs flexibility vs hiding complexity).
- **Q9 (subprocess wrap + Timer Boundary)** — пътане с "process-level due date attribute" — User Task dueDate е metadata, не auto-cancel trigger.
- **Q11 (no default backoff)** — пътане с "Zeebe applies exponential / linear backoff" — broker default е immediate re-activation; backoff е worker-side или retryBackoff attribute.
- **Q20 (null correlation key = Incident)** — пътане с "task waits silently" — Zeebe surfaces null correlation as Incident.
- **Q21 (no Task Listeners in C8)** — C7 reflex trap; C8 prefers explicit BPMN (Service Tasks / Event Subprocess / FEEL).
- **Q22 (Headers static)** — пътане с "Headers FEEL-evaluated per instance" — Headers са static design-time; use Input Mapping за dynamic.
- **Q28 (Zeebe native DMN engine)** — пътане с "DMN worker subscription" — C7 reflex; C8 has native built-in DMN evaluator.
- **Q44 (RESOURCE_EXHAUSTED = throttling)** — gRPC status codes; не confuse с UNAVAILABLE (network) или UNAUTHENTICATED (auth).
- **Q57 (project-scoped templates)** — пътане с "auto org-wide" — templates default to project scope; explicit publish to org needed.

**Свежи Set 7 сценарии (distinct от Sets 1-6):**

Modeling: flight saga Compensation Throw End, Validate+Reserve Stock Parallel pair, Boundary on Subprocess scope, loopCardinality static count, Embedded Subprocess None Start required, telco dual Send Tasks trade-offs, Transaction Subprocess pattern, None Intermediate milestone, 7-day overall Subprocess wrap.

Configuring Processes: Spring Zeebe worker timeout config (global + override), no broker retry backoff default (worker-side), formId User Task Form binding, selective Output Mapping (decision = =approved), loopCounter MI built-in, Document list by instance (Documents API filtered), IDP multi-field confidence FEEL `every`, regex pattern constraint on Element Template, AI Agent tools = Ad-hoc inner Service Tasks, tomorrow 8AM FEEL temporal arithmetic, null correlation key = Incident, no Task Listener in C8 (explicit BPMN), static Task Headers limitation.

DMN: COLLECT-COUNT для cardinality, DMN list output via COLLECT, resultVariable + column field structure, FEEL in output entry, DMN chained decision via FEEL reference + DRD, Zeebe native DMN engine, date unary test temporal comparison.

Forms: validate.required (dual validation + visual indicator), required vs allowing 0 (presence vs value), Markdown via Text View.

Connectors: Slack OAuth/Webhook auth, Connector debug via Operate execution details, JWT auth in custom Connector code, Webhook curl test.

Extensions: FEEL append / remove / now / reverse / number / max, Spring thread pool tuning, TS error mapping via job.error, count running instances via REST search, @TemplateProperty / context.bindVariables, RESOURCE_EXHAUSTED gRPC throttle, Python via REST, message timeToLive, Windows RPA worker for OS-specific bots.

Managing Dev: isExecutable=true fix, Desktop→Web upload / Git Sync, Update Retries Operate action, Tasklist variable editing via Forms, REST API verify deploy, Optimize p95 analytics, project-scoped templates с org publish, Export ZIP from Web Modeler, batch migration result view.

Dev Env: /actuator/health Spring Boot endpoints.

**Успех на изпита!**
