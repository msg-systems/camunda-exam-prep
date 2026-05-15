# Camunda 8 C8-CP-DV Mock Exam — Set 9

> **60 въпроса • 75 минути • праг ≥ 65% (39/60) • Blueprint v8.8.0**
>
> Свежи сценарии — distinct от Set 1-8. Всеки въпрос: сценарий + 4 опции (a/b/c/d) + 🔍 Explanations + per-option score 1–10 + Correct Answer + Documentation Link + 🧠 Three-Skills Decomposition.

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

> Weight 15% • Topics: Pools/Lanes, Tasks, Gateways, Events, Subprocesses, Multi-Instance, Error semantics, Compensation, Event Subprocesses.

---

## Question 1: Modeling (Weighting: 15%)

**Scenario:** A claims-processing BPMN is owned by an insurance company. The diagram should clearly show that the **company interacts with a customer Pool** (sending requests, receiving documents) but the team doesn't model the customer's internal process at all — the customer is an external participant whose internal steps are out of scope. The team wonders how to represent the customer Pool without modelling its insides.

**Which BPMN pattern fits "external participant Pool, internals not modelled"?**

- **a)** Use a **"black-box" Pool** (also called a "collapsed Pool") for the customer — a Pool drawn as an empty rectangle without internal flow content. Only the Message Flows crossing into/out of it are visible. This pattern communicates "we know the customer is a participant, we model the interactions, but the customer's internal process is opaque to us." Standard BPMN convention for external participants. Documentation: [BPMN Collaboration](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **b)** Use a regular Pool with inner placeholder Service Tasks to suggest the customer's actions — incorrect; modelling assumed steps for an external party misrepresents the model and may mislead readers. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **c)** Use a Lane within the company's Pool labelled "Customer" — wrong scope; Lanes are internal organisational units, not external participants. Documentation: [Pools and Lanes](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **d)** Use an annotation labelled "Customer" — annotations are cosmetic text; don't carry Message Flow semantics. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The **black-box Pool** (collapsed Pool) is BPMN's standard convention for representing external participants whose internal process is out of scope. The Pool is drawn as an empty rectangle with just a name (e.g., "Customer"). Message Flows (dashed lines with envelope marker) cross into / out of it, formally declaring the inter-participant interactions. Readers immediately understand: "we know this participant exists, we model the messages exchanged, but we don't claim to know their internal process."

  In Zeebe-deployed BPMN, the black-box Pool isn't an executable process (you only set `isExecutable=true` on the company's Pool). The customer Pool is purely descriptive — gives shape to the inter-participant story.

- **Option b) — Wrong.** Inventing inner steps for an external participant is speculative and may mislead. The black-box convention is precisely for "we don't know / don't model."

- **Option c) — Wrong scope.** Lanes are intra-Pool sub-divisions for organisational units within one company. External participants belong in their own Pool.

- **Option d) — Loses formal semantics.** Annotations are documentation comments; Message Flows carry the formal interaction semantics.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Black-box (collapsed) Pool е BPMN convention за external participants с opaque internals.
- **b) 3/10** — speculative; misrepresents external participant.
- **c) 3/10** — wrong scope; Lanes са intra-Pool.
- **d) 2/10** — loses formal Message Flow semantics.

**Correct Answer:** Use a black-box (collapsed) Pool for the customer; only Message Flows crossing in/out are modelled.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "external participant", "internals not modelled", "out of scope." Това е classic BPMN black-box Pool pattern.

**Въпросът → Solution Framing.** "External participant Pool without modelling internals" — изпитва се knowledge на BPMN's collaboration conventions for opaque participants.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че black-box Pool = empty rectangle + Message Flows, че inventing inner steps misrepresents, че Lanes са intra-Pool, че annotations cosmetic. Това е знание за BPMN collaboration conventions.

---

## Question 2: Modeling (Weighting: 15%)

**Scenario:** A loan-application Service Task may throw **several different BPMN error codes** depending on what went wrong: `INVALID_DATA`, `PARTNER_UNAVAILABLE`, `RATE_LIMITED`, etc. The team wants **a single Error Boundary Event** that catches **any error** thrown by this task, without listing each errorCode individually — a "catch-all" pattern.

**How is a catch-all Error Boundary Event configured?**

- **a)** Configure the Error Boundary Event **without specifying an errorCode** (leave it blank) — this is the BPMN-spec "catch-all" semantic; the boundary matches any error thrown by the host activity, regardless of code. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **b)** Configure errorCode = `"*"` (wildcard) — invented syntax; BPMN doesn't use `*` for wildcard error catching. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** Add one Error Boundary per error code (3 boundaries) — workable but verbose; the catch-all pattern avoids enumeration. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **d)** Use a Boundary Compensation Event instead — wrong tool; Compensation is for rolling back, not catching errors. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN's Error Event with **no errorCode specified** is the catch-all variant. It matches any error thrown by the host activity. Useful when:
  - All errors should route to the same handling path (e.g., a generic "log and notify ops" branch).
  - The set of possible error codes is unknown or unstable.
  - You want a fallback in addition to specific error catches (then the catch-all serves as the default; BPMN engines typically prefer specific code matches over catch-all when both are present).

  Note: combining a catch-all with specific Error Boundaries on the same host is supported and common — specific codes route to specific handling, anything else falls through to catch-all.

- **Option b) — Invented syntax.** No `*` wildcard convention; leaving errorCode blank is the BPMN-spec catch-all.

- **Option c) — Verbose.** Three boundaries works but doesn't scale if the error set grows. Catch-all is the DRY pattern.

- **Option d) — Wrong tool.** Compensation Boundary fires only when compensation is thrown, not on activity errors.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Error Boundary без errorCode = catch-all.
- **b) 2/10** — invented wildcard syntax.
- **c) 4/10** — workable но verbose; doesn't scale.
- **d) 2/10** — wrong tool (Compensation ≠ error catch).

**Correct Answer:** Configure the Error Boundary Event without specifying an errorCode (catch-all).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/error-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "single boundary", "any error", "catch-all without listing codes." BPMN error-catch flexibility.

**Въпросът → Solution Framing.** "Catch-all configured" — изпитва се knowledge на errorCode optional / wildcard semantic.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че empty errorCode = catch-all, че няма `*` wildcard syntax, че Compensation е different event family. Това е знание за Error event configuration.

---

## Question 3: Modeling (Weighting: 15%)

**Scenario:** A team is choosing between **Sequential** and **Parallel** Multi-Instance for processing 1000 customer records. Each record processing takes 100ms-1s. The team is weighing the trade-offs.

**Which captures the Sequential vs Parallel Multi-Instance trade-off?**

- **a)** **Sequential** runs one instance at a time → predictable order, lower concurrent load on downstream (good for rate-limited APIs), longer total time (~minutes for 1000 records). **Parallel** runs all instances concurrently → faster total time but higher peak load on resources / downstream (may overwhelm worker pool or external systems), order indeterminate. Choose based on **constraints**: rate limits / strict ordering → Sequential; speed / no constraints → Parallel. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Parallel is always faster, so always prefer Parallel — wrong; can overwhelm downstream and crash workers. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Sequential is always safer, prefer Sequential — overstated; for non-constrained workloads Parallel offers significant throughput. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** They're functionally identical — incorrect; they have distinct concurrency semantics. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The trade-off is **predictability + load management** (Sequential) vs **throughput** (Parallel). Concrete factors:
  - **Sequential**: one inner instance at a time. Next starts only after previous completes. Predictable order. Downstream load = 1× per-record. Total time = sum of per-record times. For 1000 records at 100ms-1s each: 100s-1000s.
  - **Parallel**: all inner instances activated together; Zeebe spawns 1000 jobs. Downstream load = up to 1000× per-record (until worker pool / downstream limits constrain). Total time = max of per-record times. For 1000 records at 100ms-1s each, with sufficient worker concurrency: ~1s. With limited workers, time approaches Sequential.

  Practical guidance:
  - **Strict ordering / rate-limited downstream** → Sequential.
  - **Many independent records, no order, throughput-sensitive** → Parallel.
  - **Bursty load**: Parallel may overwhelm; combine Parallel with explicit rate limiting in workers, or use Sequential with worker-pool-managed concurrency.

- **Option b) — Overstated.** Parallel isn't universally better; can break things downstream.

- **Option c) — Overstated.** Sequential isn't universally safer when throughput matters.

- **Option d) — Wrong.** Distinct semantics.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Trade-off: predictability/load (Sequential) vs throughput (Parallel); pick by constraints.
- **b) 3/10** — overstated; Parallel may overwhelm.
- **c) 4/10** — overstated; Sequential isn't universal default.
- **d) 1/10** — wrong; distinct.

**Correct Answer:** Sequential = ordered + low load + slow; Parallel = unordered + high load + fast; pick by constraints.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "1000 records", "weigh trade-offs". Sequential vs Parallel trade-off.

**Въпросът → Solution Framing.** "Captures trade-off" — изпитва се knowledge на MI mode semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Sequential е one-at-a-time, че Parallel runs concurrent, че pick depends on constraints (rate limits / ordering / throughput). Това е знание за MI mode selection.

---

## Question 4: Modeling (Weighting: 15%)

**Scenario:** A subscription-management BPMN handles three different external events: a **renewal-payment** message, a **cancellation** message, and a **refund-request** message. They can arrive at any time during the process; each requires a distinct handling path. The team wants a single mechanism to listen for **all three message types** concurrently.

**Which BPMN pattern fits "listen for multiple external event types concurrently throughout the process"?**

- **a)** **Multiple Event Subprocesses** within the main process, each with a Message Start Event subscribed to a different message name. Event Subprocesses activate when their start message arrives; they can be interrupting (cancel main flow) or non-interrupting (run alongside). This is the BPMN-canonical pattern for scope-level event listening across the entire process. Documentation: [Event Subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

- **b)** Add three Receive Tasks in parallel at the start — incorrect; Receive Tasks pause flow waiting for a single message; not the same as ambient event listening throughout. Documentation: [Receive Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks/)

- **c)** Three Boundary Message Events on the entire process — Boundary Events attach to specific activities, not to "the entire process"; the canonical "process-level event listener" is the Event Subprocess. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **d)** Event listening isn't supported at process level in C8 — incorrect; Event Subprocesses are the mechanism. Documentation: [Event Subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Event Subprocesses** are BPMN's mechanism for **scope-level event listening**. Placed inside the main process (or any subprocess), an Event Subprocess has a typed Start Event that triggers when the event arrives. While the main flow runs, the Event Subprocess sits dormant; on event match, it activates.

  Key properties:
  - **Interrupting** (solid border on the Start Event): activation cancels the main flow scope; only the Event Subprocess runs to completion.
  - **Non-interrupting** (dashed border): activation runs the Event Subprocess alongside the main flow.
  - **Per-event subprocess**: one Event Subprocess per event type; each with its own handling logic.

  For three different message types: three Event Subprocesses, each with its own Message Start Event subscribed to a specific message name. They concurrently listen throughout the main flow. Each activates only when its specific message arrives.

- **Option b) — Wrong scope.** Receive Tasks at the start pause initial flow waiting for a single message; doesn't provide ongoing throughout-the-process listening.

- **Option c) — Wrong placement.** Boundary Events attach to specific host activities, not to "the process." For process-level listening, Event Subprocesses are the mechanism.

- **Option d) — Wrong.** Event Subprocesses supported and canonical.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple Event Subprocesses + Message Start Events за multi-event listening.
- **b) 3/10** — wrong scope; Receive Tasks pause initial flow.
- **c) 4/10** — wrong placement; Boundary attaches to specific activity.
- **d) 1/10** — wrong; supported.

**Correct Answer:** Multiple Event Subprocesses with Message Start Events (one per message type).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "three event types", "concurrent listening", "throughout the process." Process-level event handling.

**Въпросът → Solution Framing.** "Listen for multiple events concurrently throughout process" — изпитва се knowledge на Event Subprocess pattern.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Event Subprocesses provide scope-level event listening, че Receive Task е pause-and-wait не ambient, че Boundary е activity-scoped. Това е знание за event-handling patterns.

---

## Question 5: Modeling (Weighting: 15%)

**Scenario:** A team familiar with Camunda 7 asks: "C7 had Conditional Start Events that fired when a condition became true (e.g., when `temperature > 90`). Does Camunda 8 have an equivalent?"

**Does Camunda 8 support Conditional Start Events?**

- **a)** **Camunda 8 doesn't have a built-in Conditional Start Event** that polls for a condition. The C8 alternatives: (1) Model the condition as a **Message Start Event** — an external system (or a polling Connector) publishes a message when the condition becomes true; (2) Use a **Polling Inbound Connector** that checks the data source on a schedule and publishes a message when conditions match. The "condition" is externalised to whatever evaluates it; C8 reacts to the resulting message. Documentation: [Migrating from Camunda 7](https://docs.camunda.io/docs/guides/migrating-from-camunda-7/) + [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Yes — `zeebe:conditionalStartEvent` element — invented; not part of Zeebe BPMN extensions. Documentation: [Camunda 7](https://docs.camunda.io/docs/guides/migrating-from-camunda-7/)

- **c)** Yes — wrap a regular Start Event in a Timer + condition gateway — that's a different pattern (poll-driven start), not the C7 Conditional Start Event semantic. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Yes — identical to C7 — incorrect; the C7 Conditional Start Event mental model doesn't directly transfer. Documentation: [Migrating from Camunda 7](https://docs.camunda.io/docs/guides/migrating-from-camunda-7/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8's design philosophy: keep the broker simple and let workers / Connectors evaluate conditions externally. C7's Conditional Start Event polled internal state; in C8, the equivalent is to externalise the condition evaluation:
  - **Polling Inbound Connector**: schedule, query external source, publish a message when condition matches.
  - **External system + Webhook Inbound**: external service detects condition, calls Camunda's Webhook URL.
  - **Custom worker**: subscribes to a "condition-checker" task type, runs the check, publishes a message.

  Once the condition is detected externally, C8 reacts via Message Start Event. This makes the condition logic explicit (in the polling Connector / worker) rather than hidden inside the engine.

- **Option b) — Invented.** No such Zeebe extension.

- **Option c) — Different pattern.** Timer-driven start polls on a schedule; can incorporate condition checks downstream, but it's not the C7 Conditional Start Event semantic ("fire whenever the condition transitions to true").

- **Option d) — Wrong.** No direct C7 equivalent.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. No native C8 Conditional Start; externalise via polling Connector + Message Start.
- **b) 1/10** — invented extension.
- **c) 4/10** — different pattern (timer poll ≠ condition-fire).
- **d) 1/10** — wrong; no direct equivalent.

**Correct Answer:** No built-in Conditional Start in C8; externalise via Polling Inbound Connector + Message Start Event.

**Official Documentation Link:** https://docs.camunda.io/docs/guides/migrating-from-camunda-7/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "C7 Conditional Start Event", "C8 equivalent." Migration mental-model question.

**Въпросът → Solution Framing.** "C8 support Conditional Start" — изпитва се knowledge на C7→C8 paradigm shift.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че C8 prefers externalised condition evaluation, че Polling Connector + Message Start е the canonical workaround. Това е знание за C7→C8 patterns.

---

## Question 6: Modeling (Weighting: 15%)

**Scenario:** A team learning BPMN compensation asks about the **relationship between an activity and its compensation handler**. They see in their diagram: a Service Task `charge-card`, a Compensation Boundary Event attached to it, and a connected Compensation Handler Task `refund-card`. They want to understand how these relate at runtime.

**What is the relationship between the activity, its Compensation Boundary, and the Compensation Handler at runtime?**

- **a)** The Compensation Handler is **only invoked when compensation is thrown** (Compensation Throw End Event or Intermediate Throw upstream), AND only if the host activity (`charge-card`) **previously completed successfully**. The Compensation Boundary establishes the link; the handler is dormant otherwise. The handler is NOT part of the normal flow path — its outgoing arrow (if any) doesn't lead to downstream main-flow activities; it's a "side flow." Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **b)** The handler runs every time the host completes — incorrect; that would be normal downstream, not compensation. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **c)** The handler runs concurrently with the host — incorrect; compensation runs after the host completes, conditionally. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **d)** The handler runs only when the host fails — partial misconception; "compensation" isn't "host failure"; it's "this completed work needs to be reversed because something else went wrong later." Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN compensation semantics:
  - The Compensation Boundary Event is **dormant** in normal flow. It doesn't fire when its host completes; the host completing successfully puts it into "compensable" state — meaning "if compensation is thrown for this activity, I'll run the handler."
  - A **Compensation Throw event** (End Event with compensation marker, or Intermediate Throw) triggers compensation cascade. The engine walks all previously-completed activities in reverse order; for each that has a Compensation Boundary, the engine invokes the attached handler.
  - The handler runs as a "side flow" — it executes its task (e.g., `refund-card`), then completes. Its outgoing arrow (typically empty / minimal) doesn't lead back to main flow; main flow either ended (Compensation End Event) or continues independently of compensation completion.

  Key insight: compensation isn't error handling; it's **saga rollback**. The host activity itself succeeded; the rollback fires because something downstream went wrong and the saga needs to undo successful prior work.

- **Option b) — Wrong.** Handler doesn't run on every host completion.

- **Option c) — Wrong.** Compensation runs sequentially after host (in reverse order), not concurrently.

- **Option d) — Partial misconception.** Compensation isn't triggered by host failure (that's Error Boundary). It's triggered by an explicit Compensation Throw downstream when the saga needs to undo prior successful work.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Handler dormant until Compensation Thrown + host previously completed; side flow.
- **b) 2/10** — wrong; compensation е not "every completion."
- **c) 2/10** — wrong; not concurrent.
- **d) 4/10** — partial misconception; host failure ≠ compensation trigger.

**Correct Answer:** Handler runs only when Compensation is Thrown and the host previously completed; side flow, not main path.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "compensation handler relationship", "when invoked." Compensation lifecycle question.

**Въпросът → Solution Framing.** "Relationship at runtime" — изпитва се knowledge на compensation semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че handler е dormant + invoked on Compensation Throw + only for completed hosts, че compensation ≠ error handling, че handler е side flow. Това е знание за compensation lifecycle.

---

## Question 7: Modeling (Weighting: 15%)

**Scenario:** A BPMN has an **Intermediate Throw Message Event** firing message `"OrderShipped"` to notify downstream systems, and elsewhere an **Intermediate Catch Message Event** waiting for `"PaymentReceived"`. The team is confused by the throw/catch distinction.

**What's the distinction between Intermediate Throw and Intermediate Catch Message Events?**

- **a)** **Intermediate Throw Message Event** (open envelope, often filled) — **fires** (publishes) a message at this point in the flow and continues immediately. Outbound. **Intermediate Catch Message Event** (empty envelope outline) — **waits** at this point for a matching message to arrive; correlation key matches against active subscriptions. Inbound, blocking. Visual cue: filled marker = throw (active), empty marker = catch (passive). Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **b)** Both fire messages — incorrect; they have opposite semantics. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **c)** Both wait for messages — incorrect; only Catch waits. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **d)** They're identical except for visual style — wrong; functionally distinct. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The throw/catch distinction is fundamental in BPMN's event model:
  - **Throw** (active, outbound, filled marker): "I'm firing this event." Fires the event into the engine, continues flow immediately. Examples: Message Throw fires a message (often via a Connector); Error Throw signals an error; Signal Throw broadcasts.
  - **Catch** (passive, inbound, empty marker): "I'm waiting for this event." Pauses flow until a matching event arrives. Examples: Message Catch waits for a published message (correlation-key-matched); Signal Catch waits for a broadcast Signal; Error Catch (in Event Subprocess) waits for an error to bubble up.

  For Messages specifically: Throw publishes (often integrated with a Connector for the actual external delivery); Catch creates a subscription waiting for matching message arrival.

- **Option b) — Wrong.** Opposite semantics.

- **Option c) — Wrong.** Only Catch waits.

- **Option d) — Wrong.** Functionally distinct.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Throw = fire (active, outbound); Catch = wait (passive, inbound).
- **b) 1/10** — opposite semantics.
- **c) 1/10** — only Catch waits.
- **d) 1/10** — functionally distinct.

**Correct Answer:** Throw fires (active, outbound); Catch waits (passive, inbound, correlation-keyed).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/message-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Throw vs Catch", "confused by distinction." Event direction fundamental.

**Въпросът → Solution Framing.** "Distinction" — изпитва се knowledge на throw/catch event semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Throw е active+outbound, че Catch е passive+inbound+correlation-keyed, че visual marker fill differs. Това е знание за BPMN event taxonomy.

---

## Question 8: Modeling (Weighting: 15%)

**Scenario:** A Multi-Instance Subprocess processes a list of `applicants`. The team wants the MI to **complete early** when **more than 30% of applicants have been approved** — not wait for all to finish. Combine `inputCollection` with a `completionCondition`.

**Can `inputCollection` and `completionCondition` be used together?**

- **a)** **Yes** — `inputCollection` defines the elements to iterate (e.g., applicants list), and `completionCondition` (FEEL boolean) checks after each instance completes whether to terminate the MI early. For "complete when >30% approved": `=numberOfCompletedInstances / numberOfInstances > 0.3 and someCondition`. When true, remaining instances are cancelled; MI activity completes. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** No, they're mutually exclusive — incorrect; they compose. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Yes, but only for Sequential MI — incorrect; both modes support early-completion. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Yes, but completionCondition replaces inputCollection — wrong; they have distinct roles. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Multi-Instance attributes compose:
  - **`inputCollection`** + **`inputElement`**: defines the iteration source and per-instance variable.
  - **`loopCardinality`** (alternative to inputCollection): defines static instance count.
  - **`completionCondition`**: FEEL boolean evaluated after each inner instance completes; if true, MI completes (remaining instances cancelled).
  - **`outputCollection`** + **`outputElement`** (optional): accumulates results.

  Combining inputCollection + completionCondition supports patterns like "iterate but stop early when enough completed." Engine helpers `numberOfInstances`, `numberOfCompletedInstances`, `numberOfActiveInstances` are available inside the FEEL expression.

- **Option b) — Wrong.** They compose, not exclude.

- **Option c) — Wrong.** Both modes support completionCondition.

- **Option d) — Wrong.** Distinct roles.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. inputCollection + completionCondition compose; both Sequential and Parallel support.
- **b) 2/10** — wrong; compose.
- **c) 3/10** — wrong; both modes.
- **d) 3/10** — wrong; distinct roles.

**Correct Answer:** Yes — they compose; completionCondition checks after each instance whether to terminate early.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "inputCollection AND completionCondition", "complete early when 30%." MI attribute composition.

**Въпросът → Solution Framing.** "Used together" — изпитва се knowledge на MI attribute interaction.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че MI attributes compose (inputCollection + completionCondition + outputCollection + ...), че engine helpers (numberOfCompletedInstances etc.) available в FEEL. Това е знание за MI attribute composition.

---

## Question 9: Modeling (Weighting: 15%)

**Scenario:** An order-fulfillment process has an **Embedded Subprocess** containing 4 inner activities. One inner activity may throw an error. The team wants the error caught **inside** the subprocess — not propagated to the parent. Either an Error Boundary Event attached to the failing inner activity, OR an Event Subprocess inside the Embedded Subprocess catching the Error Start.

**Which option fits "catch errors within the Embedded Subprocess scope"?**

- **a)** **Both are valid scope-local error-catching patterns.** Error Boundary on the specific failing activity catches its specific errors with minimal scope impact. **Event Subprocess with Error Start** inside the Embedded Subprocess catches errors that propagate to the subprocess border (uncaught by inner activity-level boundaries) — useful when multiple inner activities might throw the same error. Choose: Error Boundary for activity-specific handling; Event Subprocess for subprocess-wide handling. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/) + [Event Subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

- **b)** Only Error Boundary works — incorrect; Event Subprocess with Error Start is also a valid pattern. Documentation: [Event Subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

- **c)** Only Event Subprocess works — incorrect; both patterns valid. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **d)** Neither works inside a subprocess; errors always propagate to parent — incorrect; both catch in scope. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Both mechanisms catch errors at the Embedded Subprocess scope, but with different granularity:
  - **Error Boundary on inner activity**: catches errors thrown by that specific activity. Outgoing arrow handles the error case for that activity. Activity-specific.
  - **Event Subprocess with Error Start inside Embedded Subprocess**: catches errors that bubble up from any inner activity (when activity-level boundaries don't catch them). Useful when several inner activities might throw the same error type, or when you want a centralised "error handler" for the subprocess.

  BPMN propagation: an error first looks for matching catch on the throwing activity → then on the containing scope (Embedded Subprocess) — where Event Subprocess Error Start catches → if uncaught there, propagates to parent process. So you can layer: activity-specific Error Boundaries for known specific errors, plus subprocess-wide Event Subprocess Error Start for catch-all within the subprocess.

  The error doesn't propagate to the **parent process** if either inner catch handled it. The subprocess's containment provides isolation.

- **Option b) — Wrong.** Both patterns valid.

- **Option c) — Wrong.** Both patterns valid.

- **Option d) — Wrong.** Both catch in scope.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Both patterns valid; activity-specific (Boundary) vs subprocess-wide (Event Subprocess) granularity.
- **b) 3/10** — wrong; both work.
- **c) 3/10** — wrong; both work.
- **d) 1/10** — wrong; both catch in scope.

**Correct Answer:** Both Error Boundary (activity-specific) and Event Subprocess Error Start (subprocess-wide) catch errors in the subprocess scope.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "catch errors within Embedded Subprocess scope", "not propagate to parent." Scoped error handling.

**Въпросът → Solution Framing.** "Fits catch within scope" — изпитва се knowledge на multiple catching options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Error Boundary е activity-specific, че Event Subprocess Error Start е subprocess-wide, че error propagation follows scope hierarchy. Това е знание за scoped error handling.

---

# Section 2 — Configuring Processes (Questions 10-22)

> Weight 22% • Topics: zeebe:taskDefinition vs Listener (C7 reflex), Sequence Flow conditions, User Task dueDate vs Timer Boundary, MI completionCondition, Document pre-signed URL, IDP threshold rules, Element Template visibility, AI Agent output handling, Timer Date types, Message multi-instance correlation, Boundary on Call Activity, parent-child variable propagation.

---

## Question 10: Configuring Processes (Weighting: 22%)

**Scenario:** A team migrating from Camunda 7 is unsure of the relationship between Zeebe's `zeebe:taskDefinition` extension and Camunda 7's various **Task Listeners** (assignment-listener, completion-listener, etc.) attached to a User Task.

**How does Zeebe's `zeebe:taskDefinition` relate to Camunda 7 Task Listeners?**

- **a)** **They're different concepts**. `zeebe:taskDefinition` declares **how the engine activates jobs** (the task `type` for worker subscription, retries count, optional retryBackoff). C7 Task Listeners were **lifecycle hooks** firing at specific points (on create, on assignment, on completion). C8 doesn't have a direct Task Listener equivalent; cross-cutting concerns are modelled as explicit BPMN (Service Tasks before/after, Event Subprocesses, FEEL in assignmentDefinition). Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/) + [Migrating from Camunda 7](https://docs.camunda.io/docs/guides/migrating-from-camunda-7/)

- **b)** They're the same thing renamed — incorrect; entirely different concepts. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** `zeebe:taskDefinition` is a superset including listener semantics — wrong; doesn't include listener-style lifecycle hooks. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** C7 listeners migrate automatically to `zeebe:taskDefinition` — incorrect; no automatic migration; listeners need re-modelling as explicit BPMN. Documentation: [Migrating from Camunda 7](https://docs.camunda.io/docs/guides/migrating-from-camunda-7/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Two distinct concepts:
  - **`zeebe:taskDefinition`** (Zeebe BPMN extension): declares **how a Service Task / Business Rule Task / User Task is executed by the engine**. Key attributes: `type` (the task type workers subscribe to), `retries` (initial retry count), `retryBackoff` (optional delay between retries). Applied per task.
  - **C7 Task Listeners**: lifecycle hooks invoked at specific moments (User Task on-create, on-assignment, on-complete; etc.). They allowed Java code or expressions to run at those moments — for audit, dynamic assignment, validation.

  C8 doesn't have a direct Task Listener equivalent. The migration path for C7 listeners: re-model the cross-cutting concern as visible BPMN:
  - **on-create logic** → a Service Task immediately before the User Task.
  - **on-assignment logic** → assignmentDefinition with FEEL (dynamic assignment).
  - **on-completion logic** → a Service Task immediately after.
  - **Cross-cutting audit/validation** → Event Subprocess listening for relevant events.

  This makes behaviours visible in the BPMN instead of hidden in listener code.

- **Option b) — Wrong.** Different concepts.

- **Option c) — Wrong.** Doesn't include lifecycle hooks.

- **Option d) — Wrong.** Re-modelling required.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Different concepts; taskDefinition = activation config, Listeners = C7 lifecycle hooks (not in C8).
- **b) 1/10** — wrong; different concepts.
- **c) 3/10** — wrong; no listener semantics in taskDefinition.
- **d) 2/10** — wrong; manual re-modelling needed.

**Correct Answer:** Different concepts — taskDefinition = how engine activates jobs; C7 Listeners = lifecycle hooks (not in C8; re-model as explicit BPMN).

**Official Documentation Link:** https://docs.camunda.io/docs/guides/migrating-from-camunda-7/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "C7 Task Listeners", "taskDefinition", "relationship." Migration concept question.

**Въпросът → Solution Framing.** "How relates" — изпитва се C7→C8 concept mapping.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че taskDefinition = activation config, че Listeners са C7 lifecycle hooks not in C8, че migration requires re-modelling. Това е знание за C7→C8 paradigm shift.

---

## Question 11: Configuring Processes (Weighting: 22%)

**Scenario:** A BPMN Exclusive Gateway has a sequence flow with condition `expirationDate < now()`. The team wonders if this works directly, or if `now()` needs special handling.

**Can FEEL date arithmetic with `now()` be used in Sequence Flow conditions?**

- **a)** **Yes** — Sequence Flow conditions accept any FEEL expression evaluating to boolean, including those using temporal functions like `now()`, `today()`, `date()`, `duration()`. Example: `=expirationDate < now()` evaluates the condition at the moment the gateway is reached. Documentation: [Sequence Flows](https://docs.camunda.io/docs/components/modeler/bpmn/sequence-flows/) + [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** No, conditions are limited to simple variable comparisons — incorrect; full FEEL expressions are supported. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Yes, but `now()` must be assigned to a variable first via Input Mapping — workable but unnecessary; FEEL inline calls work. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Yes, but only with `=` prefix — partially correct on syntax, but the core answer "yes" is the same as (a). Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Sequence Flow conditions in C8 are FEEL expressions (prefixed with `=`) that must evaluate to boolean. The full FEEL vocabulary is available — including temporal functions, list operations, arithmetic, string functions, etc. `now()` returns current `date and time`; comparison with a `date and time` variable works directly:
  ```
  =expirationDate < now()
  ```
  Evaluated at gateway-reach moment, returns true if the date in `expirationDate` has passed.

  Practical patterns: `=dueDate > today()` (not yet due), `=creationDate >= now() - duration("P30D")` (within last 30 days), `=workingHours and weekday(today()) >= 1 and weekday(today()) <= 5` (composite conditions).

- **Option b) — Wrong.** Full FEEL supported.

- **Option c) — Unnecessary.** Inline FEEL works; no Input Mapping intermediate needed.

- **Option d) — Partially correct on syntax.** The `=` prefix is required for FEEL expressions in BPMN attributes; the core answer is the same.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Full FEEL accepted, including temporal functions.
- **b) 2/10** — wrong; full FEEL supported.
- **c) 5/10** — unnecessary intermediate step.
- **d) 7/10** — partially correct on syntax; same idea.

**Correct Answer:** Yes — full FEEL expressions, including now() and other temporal functions, work in Sequence Flow conditions.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/sequence-flows/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "FEEL date arithmetic", "now() in condition." FEEL in BPMN sequence flow.

**Въпросът → Solution Framing.** "Can use now() in condition" — изпитва се FEEL capability in sequence flows.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че sequence flow conditions accept FEEL boolean expressions, че temporal functions like now() работят, че intermediate variables не са required. Това е знание за FEEL in BPMN attributes.

---

## Question 12: Configuring Processes (Weighting: 22%)

**Scenario:** A team migrating from Camunda 7 had Sequence Flow conditions using **scripts** (Groovy / JavaScript). They wonder how to convert these for Camunda 8.

**How does Camunda 8 handle Sequence Flow conditions vs C7's script-based conditions?**

- **a)** Camunda 8 **doesn't use scripts** (Groovy / JavaScript / Python) for Sequence Flow conditions. The replacement is **FEEL** (Friendly Enough Expression Language). FEEL is a declarative, business-friendly expression language designed specifically for decision logic. Convert script conditions to FEEL: most variable comparisons / logical operators / arithmetic translate directly; complex logic may need decomposition. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** C8 supports Groovy scripts — incorrect; FEEL only. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Both FEEL and scripts work — incorrect; FEEL is the only expression language. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Scripts must be evaluated externally via Service Task and result variable — overly complex; FEEL handles most of what scripts did. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** C8's design choice: replace heterogeneous script languages with FEEL. Rationale:
  - **Determinism**: FEEL has well-defined semantics; scripts varied across engines (Groovy vs JavaScript vs Python).
  - **Security**: scripts could execute arbitrary code; FEEL is sandboxed by design.
  - **Business-friendliness**: FEEL syntax is closer to natural language than imperative scripts.
  - **Performance**: FEEL evaluator is optimised; scripts had unpredictable performance.

  Migration: most C7 script conditions translate to FEEL straightforwardly. Variable comparisons, logical operators (`and`/`or`/`not`), arithmetic, list functions, date functions all have FEEL equivalents. Complex imperative logic (loops, mutable state) needs to be decomposed into BPMN flow elements (e.g., a Service Task that performs the computation, returning a boolean variable that the gateway then reads).

- **Option b) — Wrong.** No Groovy in C8.

- **Option c) — Wrong.** Only FEEL.

- **Option d) — Over-engineered.** FEEL handles most cases inline.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. C8 uses FEEL, не scripts; convert C7 scripts to FEEL.
- **b) 2/10** — wrong; no Groovy.
- **c) 2/10** — wrong; only FEEL.
- **d) 4/10** — over-engineered.

**Correct Answer:** C8 uses FEEL, not scripts; convert C7 script conditions to FEEL.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "C7 script conditions", "C8 conversion." Migration concept question.

**Въпросът → Solution Framing.** "How handles vs scripts" — изпитва се knowledge на FEEL as C8's expression language.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че C8 uses only FEEL (not scripts), че migration converts C7 scripts to FEEL equivalents, че imperative logic може да need BPMN decomposition. Това е знание за C7→C8 expression migration.

---

## Question 13: Configuring Processes (Weighting: 22%)

**Scenario:** A User Task `approve-claim` has both a `dueDate` attribute and the team is considering adding an **Interrupting Timer Boundary Event** for the same duration. They wonder if `dueDate` and Timer Boundary are equivalent or different.

**What's the difference between User Task `dueDate` and an Interrupting Timer Boundary?**

- **a)** **Different purposes**: `dueDate` is **metadata** (informational) — shown in Tasklist for assignee awareness ("overdue" indicator), used for sorting / filtering. **Doesn't auto-cancel** the task. Interrupting Timer Boundary **auto-cancels** the task when the timer fires and routes flow via the boundary's outgoing arrow. Use `dueDate` for UI hints; Timer Boundary for hard deadlines. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/) + [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** They're equivalent — incorrect; one is informational, the other is structural. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** `dueDate` auto-cancels — incorrect; it's informational. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Timer Boundary is informational — wrong; it's structural and auto-cancels. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Clear separation:
  - **`dueDate`** (User Task attribute): metadata declaring "by when this task should ideally be done." Tasklist UI uses it to show overdue badges, sort tasks by urgency, etc. Doesn't change execution semantics — past the dueDate, the task remains active until explicitly completed or cancelled. Purely informational.
  - **Interrupting Timer Boundary**: structural BPMN element that fires when the timer expires. Interrupting variant cancels the host task and routes via the boundary's outgoing arrow to a "timeout handler" path. Hard deadline.

  Use cases together: set `dueDate` for assignee awareness ("complete by Tuesday"), and a Timer Boundary for the absolute hard deadline ("if not done by Friday, auto-route to escalation"). The two work in parallel — dueDate gives the soft cue, Timer Boundary enforces the hard limit.

- **Option b) — Wrong.** Different purposes.

- **Option c) — Wrong.** dueDate is informational.

- **Option d) — Wrong.** Timer Boundary is structural.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. dueDate = metadata; Timer Boundary = structural auto-cancel.
- **b) 1/10** — wrong; different purposes.
- **c) 2/10** — wrong; dueDate informational.
- **d) 2/10** — wrong; Timer Boundary structural.

**Correct Answer:** dueDate is informational (Tasklist UI hint); Timer Boundary is structural (auto-cancels and routes).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "dueDate vs Timer Boundary", "equivalent or different." Semantic distinction.

**Въпросът → Solution Framing.** "Difference" — изпитва се knowledge на dueDate informational vs Timer structural.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че dueDate е metadata for Tasklist UI, че Timer Boundary е structural with auto-cancel, че they can compose. Това е знание за soft vs hard deadline distinction.

---

## Question 14: Configuring Processes (Weighting: 22%)

**Scenario:** A document-review Multi-Instance Subprocess iterates over reviewers. Each reviewer provides an `approval` (boolean). The team wants the MI to **complete early when 3 reviewers have approved** (no need to wait for the rest).

**Which `completionCondition` FEEL expression fits "3+ approvals"?**

- **a)** `=count(reviewers where approval = true) >= 3` — uses FEEL's filter (`where`) and `count`. Recomputes after each instance; when reached, MI completes. Alternatively if `outputCollection` is configured: `=count([item in outputs : item.approval = true]) >= 3`. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/) + [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** `=numberOfCompletedInstances >= 3` — wrong logic; counts ALL completed instances, regardless of approval status. Doesn't distinguish approve from reject. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** `=loopCounter >= 3` — wrong concept; loopCounter is per-instance index, not aggregate count. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Cannot use complex FEEL in completionCondition — incorrect; full FEEL supported. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `completionCondition` is a FEEL boolean expression evaluated after each inner instance completes. For "3 approvals," count the approvals so far. Two approaches:
  1. **Via outputCollection** (if configured): each inner instance writes its result to outputCollection. After each instance, count the approved entries in outputCollection: `=count([item in outputs : item.approval = true]) >= 3`.
  2. **Via filter on source collection with status**: more complex; usually outputCollection is cleaner.

  When the expression returns true, MI cancels remaining instances and completes.

- **Option b) — Wrong.** Counts all completed without distinguishing approve/reject; would complete when 3 reviewers have responded (any answer), not specifically when 3 approved.

- **Option c) — Wrong concept.** loopCounter is the per-instance index.

- **Option d) — Wrong.** Full FEEL supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. count + filter on outputCollection counts approvals.
- **b) 4/10** — wrong logic; doesn't distinguish approve/reject.
- **c) 2/10** — wrong concept (loopCounter = per-instance index).
- **d) 1/10** — wrong; FEEL supported.

**Correct Answer:** `=count([item in outputs : item.approval = true]) >= 3` (or equivalent filter on output collection).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "3 approvals", "complete early", "MI completionCondition." Filter + count pattern.

**Въпросът → Solution Framing.** "FEEL expression fits" — изпитва се FEEL filter + count in MI completion.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL filter+count work in completionCondition, че numberOfCompletedInstances не distinguishes outcomes, че loopCounter е per-instance index. Това е знание за MI completion with filtering.

---

## Question 15: Configuring Processes (Weighting: 22%)

**Scenario:** A team's process generates PDF contracts and stores them via Document Handling. They want to **share the document with a customer** via a **pre-signed URL** that the customer can download from for a limited time without authenticating to Camunda.

**Does Document Handling support pre-signed URLs for external access?**

- **a)** **Depends on the storage backend** — when Document Handling is configured with cloud object storage (S3, Azure Blob, GCS), the storage backend's native pre-signed URL mechanism can be used. The team typically: (1) retrieves the document reference from Camunda; (2) generates a pre-signed URL via the storage backend's API or SDK; (3) shares the URL with the customer. Camunda Documents API itself may not directly issue pre-signed URLs; the integration is at the storage layer. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **b)** Yes — Camunda Documents API has built-in pre-signed URL generation — partial truth; depends on configuration and version, verify the docs. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **c)** No — documents must always be served through Camunda's authenticated API — incorrect; for cloud storage backends, pre-signed URLs are standard. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **d)** Always proxy through a custom worker — workable but unnecessary when backend supports pre-signed URLs natively. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Document Handling's architecture separates the document reference (in Camunda) from the binary storage (configurable backend). For cloud backends (S3, Azure Blob, GCS), pre-signed URLs are a backend-native feature — typically generated via the cloud SDK with a duration parameter (e.g., "valid for 1 hour"). The team's pattern:
  1. Retrieve the document reference from Camunda Documents API.
  2. Extract the storage-backend-specific identifier (S3 key, blob name, etc.).
  3. Use the cloud SDK / API to generate a pre-signed URL with the desired duration.
  4. Share the URL with the customer; they download directly from the storage backend without authenticating to Camunda.

  Some Camunda configurations may proxy this through a Camunda-managed endpoint; verify the current Document Handling docs for direct integration features.

- **Option b) — Verify per version.** Native generation may or may not be exposed by Camunda's API directly.

- **Option c) — Wrong.** Pre-signed URLs are standard for cloud-backed documents.

- **Option d) — Over-engineered.** Custom worker proxying is unnecessary when backend supports natively.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Pre-signed URL generation depends on storage backend (S3/Azure/GCS).
- **b) 6/10** — partial; verify per Camunda version.
- **c) 3/10** — wrong; pre-signed URLs standard для cloud backends.
- **d) 4/10** — over-engineered.

**Correct Answer:** Depends on storage backend — generate pre-signed URLs via the cloud backend's native mechanism (S3 / Azure / GCS).

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/document-handling/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "pre-signed URL", "external access", "limited time download." Document Handling external sharing.

**Въпросът → Solution Framing.** "Supports pre-signed URLs" — изпитва се knowledge на Document Handling architecture + cloud integration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Document Handling separates reference from storage, че pre-signed URLs са cloud-backend feature, че custom worker proxy е unnecessary. Това е знание за Document Handling + external integration.

---

## Question 16: Configuring Processes (Weighting: 22%)

**Scenario:** An IDP application extracts data with **per-field confidence**. The team wants different **confidence thresholds per field**: `vendorName` needs ≥0.95 (high stakes), `invoiceDate` needs ≥0.85, `lineItems` needs ≥0.75. If any field is below its threshold, route to human review.

**Which BPMN + FEEL pattern handles per-field confidence thresholds?**

- **a)** After the IDP task, an Exclusive Gateway with a FEEL expression checking each field's confidence against its specific threshold: `=idpResult.vendorName.confidence < 0.95 or idpResult.invoiceDate.confidence < 0.85 or idpResult.lineItems.confidence < 0.75` — true → route to human review; otherwise automated. Could be decomposed via a DMN decision for cleaner logic. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/) + [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** IDP has a single global threshold — incorrect; per-field rules are achievable in BPMN. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **c)** Use only the lowest field threshold across all fields — wrong; different fields warrant different thresholds based on importance. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **d)** Per-field thresholds aren't supported — incorrect; achievable via FEEL or DMN. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Per-field thresholds are a common IDP-with-BPMN pattern. The IDP task exposes confidence per field; the BPMN-level FEEL expression on the gateway evaluates each field's confidence against its threshold. Two implementation styles:
  - **Inline FEEL on the gateway**: as shown — explicit OR of per-field checks. Quick to model.
  - **DMN-driven**: a DMN decision encapsulates the thresholds; gateway evaluates the DMN result. Cleaner separation; thresholds become declarative data; easier to change.

  Practical pattern: also log which field(s) triggered human review for analytics on IDP model improvement.

- **Option b) — Wrong.** Per-field thresholds achievable.

- **Option c) — Wrong design.** Different fields warrant different thresholds.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Per-field FEEL expression in gateway (or DMN-driven).
- **b) 2/10** — wrong; per-field achievable.
- **c) 3/10** — wrong design.
- **d) 1/10** — wrong; supported.

**Correct Answer:** FEEL expression on Exclusive Gateway checking each field's confidence against its specific threshold (or DMN-driven).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/idp/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "per-field thresholds", "different importance per field." Granular confidence routing.

**Въпросът → Solution Framing.** "Pattern handles per-field thresholds" — изпитва се FEEL + gateway composition.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL gateway expression can encode per-field thresholds, че DMN can encapsulate, че single global threshold е bad design. Това е знание за IDP threshold patterns.

---

## Question 17: Configuring Processes (Weighting: 22%)

**Scenario:** An Element Template for an "Email" Connector has properties: `to`, `subject`, `body`, and `cc`. The team wants `cc` to be **visible in the property panel only when** a checkbox "Send copy to manager?" is checked.

**Does Element Template support conditional property visibility?**

- **a)** **Yes** — Element Template properties support a **`condition`** attribute that determines visibility based on other property values. E.g., `cc` property: `condition: { property: "sendCopy", oneOf: ["true"] }`. The modeler shows `cc` only when `sendCopy = true`. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **b)** No — all properties always visible — incorrect; conditional visibility is documented. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **c)** Yes via FEEL on each property — incorrect mechanism; templates use JSON `condition` clauses, not FEEL on visibility. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **d)** Use JavaScript hooks — wrong layer; Element Templates are declarative JSON. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Element Template properties support a `condition` clause that gates visibility based on other property values. The most common form: `condition: { property: "otherPropertyId", oneOf: ["value1", "value2"] }`. Web Modeler / Desktop Modeler renders the property only when the condition evaluates true. Use this to create progressive disclosure: simple properties always visible, advanced/optional properties shown conditionally.

  This improves UX: modelers see relevant properties for their context without being overwhelmed by all options at once.

- **Option b) — Wrong.** Conditional visibility supported.

- **Option c) — Wrong mechanism.** JSON `condition`, not FEEL.

- **Option d) — Wrong layer.** Declarative JSON, no JS.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. condition clause based on other property values controls visibility.
- **b) 1/10** — wrong; supported.
- **c) 3/10** — wrong mechanism; JSON condition не FEEL.
- **d) 1/10** — wrong layer.

**Correct Answer:** Yes — properties support a `condition` clause based on other property values.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "conditional visibility", "show only when checkbox checked." Element Template UX feature.

**Въпросът → Solution Framing.** "Supports conditional visibility" — изпитва се knowledge на Element Template condition clause.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Element Template има condition clause, че mechanism е JSON declarative, че FEEL / JS не са the mechanism. Това е знание за Element Template UX.

---

## Question 18: Configuring Processes (Weighting: 22%)

**Scenario:** An AI Agent Connector calls an LLM. Sometimes the LLM's response is **truncated** because it hit the `maxTokens` limit — the response ends mid-sentence. The team wants to detect this and handle appropriately.

**How does the AI Agent Connector signal truncated responses?**

- **a)** The Connector's response typically includes a **`finishReason`** (or similar field) — values include `"stop"` (natural completion), `"length"` (hit maxTokens limit / truncated), `"content_filter"` (safety filter triggered), etc. The BPMN downstream can check `=response.finishReason = "length"` and route to a handler (e.g., retry with higher maxTokens, summarise differently, escalate to human). Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **b)** Truncation isn't detectable — incorrect; LLM responses carry status. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **c)** Connector auto-retries on truncation — partial; some Connectors may have retry logic but signal-based detection is preferred for explicit handling. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **d)** Detect by checking if response ends with `.` punctuation — fragile heuristic; the LLM may end coherent responses without periods (lists, code, etc.). Use `finishReason` instead. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** LLM provider APIs (OpenAI, Anthropic, etc.) return structured response metadata including a finish reason. The Camunda AI Agent Connector typically surfaces this in the response object. Common finishReason values:
  - `"stop"` / `"end_turn"`: model completed naturally.
  - `"length"` / `"max_tokens"`: hit maxTokens limit; response truncated.
  - `"content_filter"`: safety filter prevented full response.
  - `"tool_use"` / `"tool_calls"`: model wants to call a tool (agentic flow).

  Downstream BPMN can route based on finishReason: if "length," loop with higher token budget or summarise; if "content_filter," escalate to human; if "tool_calls," execute the requested tool. This makes the agent flow handle LLM behaviours gracefully.

- **Option b) — Wrong.** Detectable via finishReason.

- **Option c) — Partial.** Some auto-retry exists; explicit detection via finishReason is more flexible.

- **Option d) — Fragile heuristic.** Punctuation isn't reliable.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. finishReason field in response signals truncation / other states.
- **b) 1/10** — wrong; detectable.
- **c) 5/10** — partial; auto-retry exists but explicit detection е preferred.
- **d) 3/10** — fragile heuristic.

**Correct Answer:** Check the Connector's response `finishReason` (or similar field); "length" indicates truncation.

**Official Documentation Link:** https://docs.camunda.io/docs/components/agentic-orchestration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "LLM response truncated", "maxTokens hit", "detect and handle." LLM response metadata.

**Въпросът → Solution Framing.** "How signal truncation" — изпитва се knowledge на LLM response structure.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че LLM responses carry finishReason, че "length" indicates truncation, че fragile heuristics са not reliable. Това е знание за LLM integration.

---

## Question 19: Configuring Processes (Weighting: 22%)

**Scenario:** A Timer Start Event needs to fire **once at a specific datetime** (e.g., `2026-06-01T09:00:00Z` — a product launch moment). The team is choosing between Timer Date, Timer Duration, and Timer Cycle types.

**Which Timer type fits "one-shot at specific datetime"?**

- **a)** **Timer Date** type with the ISO 8601 datetime literal: `2026-06-01T09:00:00Z`. Fires once at that absolute moment. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** **Timer Duration** with `P0D` — would fire at deployment time, not at the future date. Wrong. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** **Timer Cycle** with `R1/2026-06-01T09:00:00Z/PT0S` — workable but cycle is for repeating; one-shot is Date type. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Timer types are interchangeable — wrong; different semantics. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Timer Events support three types:
  - **Date** (absolute moment): one-shot at specified date-time. Use `2026-06-01T09:00:00Z` (ISO 8601 datetime with timezone) or FEEL expression returning a `date and time` value. For "fire at specific moment in the future."
  - **Duration** (relative): fires after the specified duration from activation. Use `PT24H`, `P7D`, etc. For "fire X time after activation."
  - **Cycle** (repeating): fires repeatedly at the specified interval. Use `R/PT1H` (unbounded), `R10/PT1H` (10 times), or include a start anchor. For "fire repeatedly."

  For "one-shot at specific datetime," Date is the canonical type.

- **Option b) — Wrong.** Duration is relative, not absolute datetime.

- **Option c) — Workaround.** Cycle for one-shot is unnecessary; Date type is direct.

- **Option d) — Wrong.** Distinct semantics.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Timer Date type for absolute one-shot.
- **b) 2/10** — wrong; Duration е relative.
- **c) 4/10** — workaround; Date е direct.
- **d) 1/10** — wrong; distinct.

**Correct Answer:** Timer Date type with ISO 8601 datetime (e.g., 2026-06-01T09:00:00Z).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "one-shot at specific datetime", "product launch moment." Timer type selection.

**Въпросът → Solution Framing.** "Timer type fits" — изпитва се knowledge на Date / Duration / Cycle distinction.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Date е absolute, че Duration е relative, че Cycle е repeating. Това е знание за Timer types.

---

## Question 20: Configuring Processes (Weighting: 22%)

**Scenario:** A process has a **Multi-Instance Subprocess** where each inner instance waits for a **Receive Task** correlated by a unique key (e.g., `=order.id` for each order). 5 inner instances are active, each waiting for a different `OrderShipped` message.

**How do Message correlations work for MI inner instances?**

- **a)** Each inner instance creates its own message subscription, **scoped to that instance**, with the per-instance correlation key value (e.g., `=order.id` for each inner instance's `order`). Published messages correlate to the matching inner instance specifically — the correlation key uniquely identifies which instance gets the message. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/) + [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **b)** All MI instances share one subscription — incorrect; per-instance subscriptions. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **c)** Messages broadcast to all inner instances — wrong (that's Signal semantics); Message correlation is 1-to-1. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **d)** MI doesn't support message correlation — incorrect; supported via per-instance correlation key. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Multi-Instance handles per-instance message subscriptions:
  - When each inner instance activates and reaches its Receive Task (or Intermediate Message Catch), it creates its own subscription with the per-instance correlation key (evaluated from the inner instance's variables — typically `inputElement`).
  - Published messages correlate to the specific subscription whose correlation key matches.
  - 5 active inner instances → 5 distinct subscriptions → published messages correlate to the right one.

  Critical detail: the correlation key must produce a **unique value per inner instance** for this to work. If two inner instances had the same correlation key value, message routing would be ambiguous. Design ensures uniqueness (e.g., orderId is unique per order).

- **Option b) — Wrong.** Per-instance subscriptions.

- **Option c) — Wrong.** That's Signal; Messages are 1-to-1.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Per-instance subscriptions with unique correlation keys.
- **b) 2/10** — wrong; per-instance.
- **c) 2/10** — Signal semantics, не Message.
- **d) 1/10** — wrong; supported.

**Correct Answer:** Each MI inner instance creates its own subscription scoped to the per-instance correlation key.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/messages/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "MI Receive Task", "per-instance correlation key." Multi-instance + Message correlation.

**Въпросът → Solution Framing.** "Correlations work for MI" — изпитва се knowledge на per-instance subscription model.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че MI inner instances create per-instance subscriptions, че correlation key must be unique per instance, че Message е 1-to-1 не broadcast. Това е знание за MI + Message correlation.

---

## Question 21: Configuring Processes (Weighting: 22%)

**Scenario:** A parent process has a **Call Activity** invoking a `payment-processing` child process. The team wants to attach a **Timer Boundary Event** to the Call Activity — if `payment-processing` takes more than 5 minutes, cancel and route to a "payment timeout" handler.

**Can Boundary Events attach to Call Activities?**

- **a)** **Yes** — Boundary Events (Timer, Error, Escalation, etc.) attach to Call Activities just like other activities. An Interrupting Timer Boundary on a Call Activity cancels the called process (and its current state) when the timer fires; flow routes via the boundary's outgoing arrow in the parent. The called process's resources are cleaned up. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/) + [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **b)** No — Boundary Events only attach to leaf activities (Service / User / etc.), not Call Activities — incorrect; Call Activities are activities and support boundaries. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** Yes, but only Error Boundary — incorrect; multiple types work. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **d)** Yes, but the boundary is on the called process, not the Call Activity in the parent — wrong; boundary attaches to the Call Activity in the **parent** scope. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Call Activities are first-class BPMN activities — boundaries attach to them just like any activity. Boundary types that work:
  - **Timer Boundary**: cancel after duration / fire on date.
  - **Error Boundary**: catch errors propagated from the called process (errors that weren't caught inside the called process bubble up to the Call Activity).
  - **Escalation Boundary**: catch escalations from the called process.
  - **Message Boundary**: catch messages while the called process is running.

  For "5-minute timeout on payment processing": Interrupting Timer Boundary with `PT5M`. When the timer fires, the called process is cancelled (along with its tokens), the parent's flow continues via the boundary's outgoing arrow to a timeout handler.

- **Option b) — Wrong.** Call Activities support boundaries.

- **Option c) — Wrong.** Multiple boundary types work.

- **Option d) — Wrong placement.** Boundary in parent scope.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Boundaries (Timer / Error / Escalation / Message) attach to Call Activities like other activities.
- **b) 2/10** — wrong; Call Activities are activities.
- **c) 3/10** — wrong; multiple types.
- **d) 2/10** — wrong placement; boundary in parent.

**Correct Answer:** Yes — Boundary Events attach to Call Activities; Timer Boundary cancels the called process on timer fire.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Boundary Event on Call Activity", "5-minute timeout." Call Activity + Boundary composition.

**Въпросът → Solution Framing.** "Can boundaries attach to Call Activities" — изпитва се knowledge на Call Activity semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Call Activity е activity (boundaries supported), че Timer / Error / Escalation / Message all attach, че parent scope holds the boundary. Това е знание за Call Activity + boundaries.

---

## Question 22: Configuring Processes (Weighting: 22%)

**Scenario:** A parent process has a Call Activity invoking `payment-child`. The parent has variables `{orderId, amount, customerEmail}`. The team wonders **which variables get passed to the child** and **how results return**.

**How does variable propagation work between parent and Call Activity child?**

- **a)** **Input mapping** on the Call Activity defines what passes from parent to child (e.g., `orderId` and `amount`, not the rest). **Output mapping** defines what returns from child to parent (e.g., `paymentReference` becomes a parent variable). Variables are NOT automatically shared — explicit mapping required. Without explicit mapping, the called process may receive no parent variables (or all, depending on configuration). Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/) + [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **b)** All parent variables auto-propagate to child — partial; some Zeebe configurations do this by default, but explicit mapping is best practice for clarity. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **c)** Child has no access to parent variables — incorrect; input mapping bridges. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **d)** Parent and child share the same variable scope — wrong; they have separate scopes; mappings cross the boundary. Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Parent and Call Activity child have **separate variable scopes**. Communication crosses the scope boundary via:
  - **Input mapping** (Call Activity's `propagateAllParentVariables` flag + explicit input mappings): determines what enters the child's scope at start. Best practice: explicit input mappings declare exactly what the child needs.
  - **Output mapping** (Call Activity's output mappings): determines what returns to parent scope at child completion.

  Zeebe's specific defaults vary; explicit mapping is the safe practice — makes the contract visible.

  Practical example for the scenario:
  - **Input mapping**: `orderId` (Target) ← `=orderId` (Source from parent), `amount` ← `=amount`. `customerEmail` not passed (child doesn't need it).
  - **Output mapping**: `paymentReference` (Target in parent) ← `=paymentRef` (Source from child).

- **Option b) — Partial.** Depends on configuration; explicit best practice.

- **Option c) — Wrong.** Input mapping bridges.

- **Option d) — Wrong.** Separate scopes.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Input/Output mappings explicit bridge separate scopes.
- **b) 5/10** — partial; defaults vary; explicit best practice.
- **c) 2/10** — wrong; bridges exist.
- **d) 2/10** — wrong; separate scopes.

**Correct Answer:** Explicit Input/Output mappings on the Call Activity bridge separate parent and child scopes.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "parent variables to child", "results return to parent." Variable propagation across Call Activity.

**Въпросът → Solution Framing.** "How variable propagation works" — изпитва се knowledge на input/output mappings across Call Activity.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че parent и child имат separate scopes, че input/output mappings bridge, че explicit mapping е best practice. Това е знание за Call Activity variable contracts.

---

# Section 3 — Decisions & DMN (Questions 23-29)

> Weight 11% • Topics: OUTPUT ORDER vs COLLECT, Decision Service exposed subset, date and time constructor, DMN XML format, FEEL lambdas, multiple Knowledge Sources, DMN evaluation error handling.

---

## Question 23: Decisions & DMN (Weighting: 11%)

**Scenario:** A team is choosing between **OUTPUT ORDER** and **COLLECT** hit policies for a DMN that returns multiple matching rules' outputs. Both return lists; the team wonders what distinguishes them in semantics.

**What's the difference between OUTPUT ORDER and COLLECT hit policies?**

- **a)** **OUTPUT ORDER** returns the list of matching outputs **sorted by the output value list priority** (the value list defines the order). **COLLECT** (without aggregator) returns the list of matching outputs **without specific ordering** (typically rule-evaluation order, which may not be semantically meaningful). When ordering by priority matters → OUTPUT ORDER; when order doesn't matter → COLLECT. Documentation: [DMN Hit Policies](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** They're identical — incorrect; ordering semantics differ. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** OUTPUT ORDER is sequential, COLLECT is parallel — wrong concept; both are about result ordering, not execution. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** OUTPUT ORDER returns a single value — wrong; both return lists. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Both policies return **lists** when multiple rules match, but with different ordering:
  - **OUTPUT ORDER**: list is sorted per the output value list (allowed values declared on the output column). Higher-priority values appear first. Requires the output column to have a defined value list.
  - **COLLECT (no aggregator)**: list contains matching outputs without specific ordering. Typically reflects rule evaluation order, but the spec doesn't guarantee any particular order.

  When **priority ordering matters** in the result, use OUTPUT ORDER. When **set-membership matters** but order doesn't, COLLECT.

  Other variants for completeness:
  - **RULE ORDER**: list ordered by row order in the table.
  - **COLLECT with aggregator**: SUM / MIN / MAX / COUNT — returns single aggregated value, not list.

- **Option b) — Wrong.** Ordering semantics differ.

- **Option c) — Wrong concept.** Both about result ordering; execution is similar.

- **Option d) — Wrong.** Both return lists.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. OUTPUT ORDER = sorted by output value list priority; COLLECT = unordered.
- **b) 2/10** — wrong; ordering differs.
- **c) 1/10** — wrong concept.
- **d) 2/10** — wrong; both lists.

**Correct Answer:** OUTPUT ORDER sorts the list by output value list priority; COLLECT returns the list without specific ordering.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "OUTPUT ORDER vs COLLECT", "both return lists." Hit policy distinction.

**Въпросът → Solution Framing.** "Difference" — изпитва се knowledge на list-returning policies.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че OUTPUT ORDER е sorted by value list priority, че COLLECT е unordered, че both return lists. Това е знание за DMN list-policy variants.

---

## Question 24: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN model has a DRD with 5 decisions interconnected by Information Requirements. The team wants to expose **only 2 of them** (the top-level decisions) as the public API surface — internal decisions shouldn't be invokable from outside.

**Which DMN construct exposes a curated public interface?**

- **a)** A **Decision Service** — a DMN construct that bundles a set of decisions and exposes them as a callable unit. The Decision Service declares which decisions are **outputs** (publicly invocable) and which are **inputs / internal supports** (used internally, not directly invokable). Callers see only the output decisions; the implementation details (internal supporting decisions) are hidden. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Mark decisions as `private = true` in DMN XML — invented attribute; Decision Service is the canonical mechanism. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Deploy only the top-level decisions in a separate DMN file — incorrect; DRD dependencies require all referenced decisions to be present. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Decision Service support varies by Zeebe version — not always available — partial truth; verify the docs. The principle of exposing curated interface is option (a). Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN's Decision Service entity defines a callable interface around a set of decisions. It specifies:
  - **Output decisions**: the publicly-invocable decisions. These are what callers reference.
  - **Encapsulated decisions**: internal supporting decisions hidden from callers.
  - **Input decisions / Input data**: the inputs the Decision Service expects.

  Callers invoke the Decision Service by name; it produces the output decisions' results. The internal computation graph is opaque.

  **Caveat**: Zeebe's coverage of Decision Service has evolved over versions; verify the current BPMN-DMN coverage docs. Where not fully supported, the practical workaround is to model the top-level decisions as the BPMN-invoked entry points and let DRD dependency resolution pull in the internal decisions automatically.

- **Option b) — Invented attribute.** Decision Service is the spec's mechanism.

- **Option c) — Wrong.** All referenced decisions must be deployed for the DRD to resolve.

- **Option d) — Partial.** Coverage caveat is real, but option (a) is conceptually the right answer per DMN spec.

**Per-option scoring (1–10):**
- **a) 9/10** — верен с caveat. Decision Service exposes curated interface; verify Zeebe version coverage.
- **b) 2/10** — invented attribute.
- **c) 3/10** — wrong; DRD dependencies require all.
- **d) 5/10** — partial truth on coverage; option (a) е principle.

**Correct Answer:** Use a Decision Service to declare output (public) decisions and encapsulated (internal) decisions.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "expose 2 of 5 decisions", "curated public API." Decision Service pattern.

**Въпросът → Solution Framing.** "Construct exposes curated interface" — изпитва се knowledge на Decision Service.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Decision Service е DMN's API-curation construct, че separate DMN files break DRD, че attributes like `private` не съществуват. Това е знание за DMN encapsulation.

---

## Question 25: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN computes a deadline as `applicationDate + duration("P30D")` (30 days after application). The team wants to combine this with a **time component** to produce a `date and time` value at midnight UTC.

**Which FEEL constructor combines a date and a time into a `date and time` value?**

- **a)** **`date and time(date, time)`** — FEEL's two-argument constructor. Combines a date value and a time value into a single date-and-time value. Example: `=date and time(applicationDate + duration("P30D"), time("00:00:00"))`. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** Date + time addition: `date + time` — wrong; arithmetic between date and time isn't a FEEL-spec operation. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `concat(date, time)` — wrong; concat is for strings, doesn't compose date-time. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** FEEL doesn't combine date and time — incorrect; the constructor exists. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL has explicit constructors for date / time / date and time / duration. The `date and time(date, time)` two-argument form combines a date value and a time value into a date-and-time. Used when you have a date from one source and a time from another and need to combine them.

  Single-argument forms exist too: `date and time("2026-06-01T09:00:00Z")` parses an ISO 8601 string directly. `date("2026-06-01")` parses a date string. `time("09:00:00")` parses a time string. These are constructors from strings.

  Practical: for "midnight of a computed date," use `date and time(computedDate, time("00:00:00"))`.

- **Option b) — Wrong.** Date+time arithmetic isn't a defined operation.

- **Option c) — Wrong tool.** concat is for strings.

- **Option d) — Wrong.** Constructor exists.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. date and time(date, time) two-argument constructor.
- **b) 2/10** — wrong; arithmetic doesn't compose date+time.
- **c) 2/10** — wrong tool.
- **d) 1/10** — wrong; constructor exists.

**Correct Answer:** date and time(date, time) — two-argument FEEL constructor.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "combine date and time", "date and time value at midnight." FEEL constructor.

**Въпросът → Solution Framing.** "Constructor combines" — изпитва се FEEL temporal constructors.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL има date and time() constructor (1-arg from string, 2-arg from date+time), че arithmetic не compose date+time, че concat е strings. Това е знание за FEEL temporal constructors.

---

## Question 26: Decisions & DMN (Weighting: 11%)

**Scenario:** A team examines the **XML file** of a deployed DMN and is curious about its structure — what's the format / standard?

**What is the DMN XML format?**

- **a)** **DMN XML** is a standardised XML format defined by the **OMG DMN specification** (similar to BPMN being OMG-standardised). The root element is `<definitions>` with DMN namespaces; children include `<decision>`, `<businessKnowledgeModel>`, `<decisionService>`, `<inputData>`, `<knowledgeSource>`, etc. Each decision contains a body (decision table, literal expression, etc.). Camunda 8 adheres to the OMG DMN standard with some Zeebe-specific extensions for execution. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Camunda-proprietary XML — incorrect; OMG-standardised. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** JSON, not XML — incorrect; DMN is XML-based. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Plain text with custom syntax — incorrect; XML. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN (Decision Model and Notation) is an **OMG (Object Management Group) standard**, like BPMN. Both use XML as their serialisation format with formal XSD schemas. The DMN specification defines:
  - Element types: `<decision>`, `<businessKnowledgeModel>`, `<decisionService>`, `<inputData>`, `<knowledgeSource>`.
  - Expression types: `<decisionTable>`, `<literalExpression>`, `<context>`, `<invocation>`, `<list>`, `<functionDefinition>`.
  - FEEL embedded in expression bodies.
  - Diagram interchange (DMNDI namespace) for visual layout.

  Camunda 8 uses standard DMN XML and adds Zeebe-specific extensions (in a separate Zeebe namespace) for execution semantics. The XSD is publicly available from OMG.

  Practical implication: DMN files are portable across DMN-compliant engines (with caveats around vendor-specific extensions); use standard tooling (DMN-compliant editors).

- **Option b) — Wrong.** OMG-standardised, not proprietary.

- **Option c) — Wrong.** XML.

- **Option d) — Wrong.** XML.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. OMG DMN standard XML format with XSD.
- **b) 2/10** — wrong; standardised.
- **c) 1/10** — wrong; XML.
- **d) 1/10** — wrong; XML.

**Correct Answer:** OMG DMN standard XML format with XSD; same family as BPMN.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "DMN XML file structure", "format / standard." DMN file format.

**Въпросът → Solution Framing.** "DMN XML format" — изпитва се knowledge на DMN standardisation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN е OMG standard XML, че Camunda adds Zeebe-specific extensions, че formats portable across compliant engines. Това е знание за DMN standardisation.

---

## Question 27: Decisions & DMN (Weighting: 11%)

**Scenario:** A team wants to define a **reusable calculation** in DMN: "compute compound interest given principal, rate, and years." They want it callable as a function from other decisions.

**Which DMN construct fits "reusable function defined in DMN"?**

- **a)** **Business Knowledge Model (BKM)** with a **Boxed Function Expression** (FEEL lambda) as the body. The BKM declares parameters (principal, rate, years) and the function body computes the result. Other decisions reference the BKM via Knowledge Requirement (dashed arrow) and call it like a function: `=computeCompoundInterest(principal, rate, years)`. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Just put the calculation in a Literal Expression in each calling decision — works for one caller but defeats reuse. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** FEEL doesn't support lambdas — incorrect; FEEL supports function definitions / lambdas. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Use a Service Task in BPMN instead — cross-tool path; DMN-internal BKM is the canonical DMN-spec mechanism for reusable functions. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN's **Business Knowledge Model (BKM)** is the spec entity for reusable decision logic. The BKM has:
  - **Name** (identifier for callers).
  - **Parameters** (typed inputs).
  - **Body** (a FEEL expression — typically a Boxed Function Expression / lambda; or a Decision Table; or a Boxed Context).

  Decisions or other BKMs declare a Knowledge Requirement (dashed arrow with circle head) to the BKM in the DRD; in their bodies, they call the BKM by name with arguments. FEEL handles the function-call semantics.

  Use cases:
  - Reusable calculations (compound interest, currency conversion, tax computation).
  - Reusable lookups (status mappings).
  - Centralised business rules that several decisions need.

  This keeps DMN models DRY and the logic in one place.

- **Option b) — Defeats reuse.** Duplication for multi-caller logic.

- **Option c) — Wrong.** FEEL supports lambdas via `function (params) ...` syntax.

- **Option d) — Cross-tool.** DMN should handle its own reusable logic via BKM.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. BKM with Boxed Function Expression (FEEL lambda) as body.
- **b) 3/10** — defeats reuse.
- **c) 2/10** — wrong; FEEL supports functions.
- **d) 3/10** — cross-tool; BKM е canonical DMN mechanism.

**Correct Answer:** Business Knowledge Model (BKM) with a Boxed Function Expression body.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "reusable calculation in DMN", "callable as function." BKM + FEEL lambda.

**Въпросът → Solution Framing.** "Construct fits reusable function" — изпитва се knowledge на BKM + lambda.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BKM е reusable logic, че Boxed Function Expression е FEEL lambda body, че Knowledge Requirement links callers. Това е знание за BKM + FEEL functions.

---

## Question 28: Decisions & DMN (Weighting: 11%)

**Scenario:** A regulatory-compliance DMN has multiple **Knowledge Sources**: "GDPR Regulation," "Internal Compliance Policy," "Industry Best Practice Guide." The team wonders if multiple Knowledge Sources can attach to the same decision.

**Can a DMN decision have multiple Knowledge Sources attached?**

- **a)** **Yes** — a decision can have multiple Authority Requirements (dashed arrows with circle heads) pointing to multiple Knowledge Sources. Each Knowledge Source represents a separate authoritative origin governing the decision's logic. Useful for compliance-heavy decisions where multiple regulations / policies apply. Documentation: [DMN DRD](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-diagram/)

- **b)** No — only one Knowledge Source per decision — incorrect; multiple supported. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Yes, but they don't affect execution — partial truth and worth stating: Knowledge Sources are **documentation metadata**, not executable; they record authority but don't change runtime behaviour. Multiple are supported for governance clarity. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Knowledge Sources don't exist in DMN — incorrect; standard DMN entity. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN allows multiple Authority Requirements per decision, each pointing to a different Knowledge Source. This supports compliance documentation: a decision may be governed by multiple authorities (e.g., GDPR + PCI-DSS + internal policy + industry standard). The DRD shows all of them; readers immediately see the governance landscape.

  Knowledge Sources are **documentation metadata** — they don't execute. They record:
  - Person (e.g., "Compliance Officer Jane Doe").
  - Organisation (e.g., "EU GDPR Authority").
  - Document (e.g., "Compliance Policy v3.2").

  Audit / governance reviews use them to trace authority for each decision.

- **Option b) — Wrong.** Multiple supported.

- **Option c) — Worth noting.** Knowledge Sources are documentation, not executable — true but the main answer is "yes, multiple supported."

- **Option d) — Wrong.** Standard DMN entity.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple Knowledge Sources via multiple Authority Requirements supported.
- **b) 2/10** — wrong; multiple supported.
- **c) 7/10** — partial truth (documentation only) но primary answer е "yes multiple supported."
- **d) 1/10** — wrong; standard entity.

**Correct Answer:** Yes — multiple Knowledge Sources via multiple Authority Requirements (Knowledge Sources are documentation metadata).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-diagram/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "multiple Knowledge Sources", "GDPR + Internal Policy + Industry Guide." Multi-authority decision.

**Въпросът → Solution Framing.** "Can have multiple Knowledge Sources" — изпитва се DRD attachment capability.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Authority Requirements support multiple, че Knowledge Sources са documentation metadata, че DRD supports the governance modelling. Това е знание за DMN governance modelling.

---

## Question 29: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN with UNIQUE hit policy is evaluated, but **no rule matches** the input — perhaps the rules don't cover this combination. The team wants to know what happens.

**What happens when a DMN evaluates with no matching rule?**

- **a)** **Depends on the hit policy + default output configuration**: for UNIQUE / FIRST / PRIORITY / ANY, no match typically raises an evaluation error (which surfaces as a BPMN Incident when called from a Business Rule Task). If the decision has a **default output value** configured, that's returned instead. For COLLECT, an empty list is returned (no match = no items collected). Best practice: design DMN tables with full coverage (catch-all rule or default output) to avoid no-match errors. Documentation: [DMN Hit Policies](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** Always returns null silently — incorrect; depends on hit policy and default config. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** Always raises an exception — partial; only for some hit policies; COLLECT returns empty list. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** DMN auto-creates a "default no-match" rule — incorrect; coverage is the modeller's responsibility. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** No-match handling depends on hit policy + configuration:
  - **UNIQUE, FIRST, PRIORITY, ANY**: expect a match. No-match typically raises an evaluation error → BPMN Incident if called from Business Rule Task. Mitigations: (1) design a catch-all rule that always matches (e.g., last row with all unary tests as `-` wildcard); (2) configure a default output value on the output column for use when no rule matches.
  - **COLLECT (no aggregator)**: returns empty list when no match. No error.
  - **COLLECT with SUM/COUNT**: COUNT returns 0 (count of zero matches); SUM returns 0 (sum of empty list).
  - **RULE ORDER, OUTPUT ORDER**: empty list (similar to COLLECT).

  Best practice: design DMN tables with explicit coverage (catch-all rule at bottom) for UNIQUE-style policies; rely on empty-list semantics for COLLECT-style.

- **Option b) — Wrong default.** Behaviour depends on policy.

- **Option c) — Partial.** Only some policies raise errors.

- **Option d) — Wrong.** No auto-generation.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Depends on hit policy + default output config; design for coverage.
- **b) 3/10** — wrong default; varies by policy.
- **c) 5/10** — partial; only some policies raise errors.
- **d) 1/10** — wrong; no auto-generation.

**Correct Answer:** Depends on hit policy + default output config; UNIQUE/FIRST/PRIORITY raise errors on no match, COLLECT returns empty list. Design for coverage.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "UNIQUE hit policy", "no rule matches", "what happens." DMN no-match behaviour.

**Въпросът → Solution Framing.** "What happens on no match" — изпитва се knowledge на per-hit-policy no-match handling.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че UNIQUE/FIRST/PRIORITY raise error on no match, че COLLECT returns empty list, че default output configures fallback, че catch-all rule е the standard mitigation. Това е знание за DMN coverage best practices.

---

# Section 4 — Configuring Forms (Questions 30-32)

> Weight 5% • Topics: Validation patterns (regex vs min/max), submission lifecycle, responsive design.

---

## Question 30: Configuring Forms (Weighting: 5%)

**Scenario:** A Form has a "Bulgarian VAT number" field. Bulgarian VAT format: 9 or 10 digits. The team wants to validate this. They're choosing between regex pattern and length range.

**Which validation pattern fits "exact 9 or 10 digit format"?**

- **a)** **Regex `^[0-9]{9,10}$`** via `validate.pattern` — enforces both digits-only AND length range 9-10. Single pattern handles both constraints. Documentation: [Forms validation](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-validation/)

- **b)** `validate.minLength: 9, validate.maxLength: 10` — handles length but doesn't enforce digits-only. Could pass "abcdefghi" (9 letters). Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-validation/)

- **c)** Use a Number field — number doesn't preserve leading zeros if VAT starts with 0; not safe for ID-like strings. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Validate post-submit in a Service Task — works but loses UX feedback; design-time form validation is preferable. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Regex `^[0-9]{9,10}$` enforces both constraints in one validation:
  - `^` and `$` anchor to start/end of string.
  - `[0-9]` matches a digit.
  - `{9,10}` quantifier: between 9 and 10 occurrences inclusive.

  Form submit rejects strings that don't match (e.g., "12345678" — 8 digits, "12345678901" — 11 digits, "abc123def4" — contains non-digits). Single property handles the joint constraint cleanly.

- **Option b) — Incomplete.** minLength/maxLength handle range but not type; allows non-digits.

- **Option c) — Wrong type.** Number field loses leading zeros (some IDs start with 0); also semantically VAT is an identifier, not a quantity.

- **Option d) — Too late.** Catching at form level gives immediate UX feedback; Service Task is reactive.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Regex pattern enforces digits-only AND length in one property.
- **b) 5/10** — incomplete; misses digits-only.
- **c) 3/10** — wrong type; loses leading zeros.
- **d) 3/10** — too late; loses UX feedback.

**Correct Answer:** validate.pattern with regex `^[0-9]{9,10}$`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-validation/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "9 or 10 digits exact format", "Bulgarian VAT." Pattern + range validation.

**Въпросът → Solution Framing.** "Validation pattern fits" — изпитва се regex vs minLength/maxLength choice.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че regex pattern handles complex format (type + range together), че minLength/maxLength miss type, че Number type loses leading zeros. Това е знание за validation primitive selection.

---

## Question 31: Configuring Forms (Weighting: 5%)

**Scenario:** A team has a Form with 10 fields. The assignee fills the form and clicks "Complete Task." The team wonders **when** the form data is written to process variables — at every keystroke, on submit, or asynchronously?

**When are Form data values written to process variables?**

- **a)** **On task completion** — form data lands in process scope when the user clicks "Complete." Before completion, data lives in the form's local UI state (browser memory) but isn't yet in Zeebe. Failures before completion (browser crash, lost connection) lose the unsaved data; the task remains active for re-entry. Some Forms / Tasklist versions support "save draft" for partial-fill persistence; verify the docs. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/) + [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **b)** On every keystroke (real-time) — overstated; would generate massive write load. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **c)** Asynchronously every 5 seconds — not the default; Tasklist may have auto-save features per version but the canonical write is on complete. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **d)** Never — form is purely visual — incorrect; form data writes to variables. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The canonical model: Form data writes to process variables when the user **completes the task** (clicks Complete). Before that, data is local to the user's browser (UI state). This means:
  - Browser crash before Complete = data lost; task remains active; user re-enters.
  - User can change values multiple times before Complete; only the final state is persisted.
  - On Complete, the form's data merges into process scope according to the form's field bindings (with Output Mapping rules if configured).

  Some Forms / Tasklist versions add **"save draft"** functionality for long forms — allows persisting partial state without completing. Verify per current version. Without draft support, users finishing a long form should be aware that browser-level recovery is on them.

- **Option b) — Overstated.** Per-keystroke writes would overwhelm.

- **Option c) — Not default.** Auto-save varies by version.

- **Option d) — Wrong.** Form data writes on complete.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Form data lands в process scope on task completion.
- **b) 3/10** — overstated; no per-keystroke writes.
- **c) 5/10** — partial truth; auto-save varies, canonical е on-complete.
- **d) 1/10** — wrong; data writes.

**Correct Answer:** Form data writes to process variables on task completion.

**Official Documentation Link:** https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "when form data written", "every keystroke / on submit / async." Form lifecycle question.

**Въпросът → Solution Framing.** "When values written" — изпитва се knowledge на Form data lifecycle.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че default е on-complete, че per-keystroke би overwhelm, че save-draft е version-specific addition. Това е знание за Form persistence.

---

## Question 32: Configuring Forms (Weighting: 5%)

**Scenario:** Tasklist users access the app from desktop and mobile. The team's Forms have 12 fields. They want the form to **render well on mobile** — responsive layout, touch-friendly inputs.

**How does Camunda Forms handle responsive design for mobile?**

- **a)** Camunda Forms render in **responsive layouts** by default — the form's renderer (in Tasklist or custom apps embedding the form-js library) adapts to viewport width. Fields stack vertically on narrow screens, side-by-side on wider screens. Modelers don't typically need to configure responsive behaviour explicitly; the renderer handles it. For custom UI / embedding, theming hooks let teams customise. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **b)** Forms don't support mobile — incorrect; mobile-friendly by design. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Set `responsive: true` per field — incorrect; behaviour is renderer-level, not per-field. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Render two versions (desktop and mobile) — wasteful; single form renders responsively. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda Forms are built with responsive design as a baseline. The form-js renderer (used by Tasklist and embeddable apps) uses responsive CSS techniques (typically flexbox / grid + media queries) to adapt to viewport width. Common adaptations:
  - **Narrow viewports (mobile)**: fields stack vertically, full-width.
  - **Medium viewports (tablet)**: fields may wrap intelligently.
  - **Wide viewports (desktop)**: fields can be side-by-side.

  For specific layout fine-tuning, some Forms element libraries support grouping / columns that scale with viewport. For deep customisation (e.g., embedded in a corporate-branded portal), the form-js library can be themed / styled with custom CSS.

- **Option b) — Wrong.** Mobile-friendly.

- **Option c) — Wrong mechanism.** Renderer-level, not per-field.

- **Option d) — Wasteful.** Single responsive form.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Forms responsive by default; renderer adapts to viewport.
- **b) 1/10** — wrong; mobile-friendly.
- **c) 3/10** — wrong mechanism.
- **d) 3/10** — wasteful.

**Correct Answer:** Forms render responsively by default; renderer adapts layout to viewport.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "responsive layout", "render well on mobile." Mobile UX question.

**Въпросът → Solution Framing.** "How handles responsive design" — изпитва се knowledge на Forms renderer capabilities.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Forms responsive by default, че renderer-level not per-field, че single form covers all viewports. Това е знание за Forms responsive rendering.

---

# Section 5 — Configuring Connectors (Questions 33-36)

> Weight 6% • Topics: Microsoft Teams / Outlook, Google Maps, secrets in CI/CD, SOAP integrations.

---

## Question 33: Configuring Connectors (Weighting: 6%)

**Scenario:** A team wants to send **Microsoft Teams** messages from BPMN — e.g., notify a channel when a critical incident occurs.

**Which Connector option fits Microsoft Teams integration?**

- **a)** **Microsoft Teams Connector** (if available in Camunda's OOB library) **OR** the generic HTTP Connector calling a **Teams Incoming Webhook URL** (configured in the Teams channel). Both approaches work; OOB Connector offers better ergonomics if available. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/) + [HTTP Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

- **b)** Microsoft Teams isn't integrable from Camunda — incorrect; HTTP/Webhook makes it possible. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Must build a custom Connector — workable but unnecessary if Teams Incoming Webhook URL is accepted. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/)

- **d)** Email the Teams support — Teams doesn't accept email-to-channel as a primary integration; use Webhook. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Microsoft Teams supports **Incoming Webhooks** for channels — admins configure a webhook URL in the Teams channel; posting JSON to that URL pushes a message to the channel. Any HTTP-capable client can call it. Camunda options:
  - **Dedicated Microsoft Teams Connector** (where available in Camunda's library): better ergonomics — separate fields for channel, title, message, mentions, etc. Auth via secrets.
  - **Generic HTTP Outbound Connector**: POST to the Teams Webhook URL with appropriate JSON payload (typically a Teams "MessageCard" format or Adaptive Card).

  Configure the Webhook URL as a cluster secret. Some advanced Teams scenarios (e.g., bot interactions, user authentication) require Microsoft Graph API and more complex auth (OAuth2 with Microsoft Identity); the HTTP Connector handles that too.

- **Option b) — Wrong.** Integrable via Webhook URL.

- **Option c) — Workable but unnecessary.** HTTP Connector covers Webhook URL calls.

- **Option d) — Wrong path.** Webhook is the standard.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Dedicated Teams Connector (if available) or HTTP Connector to Teams Webhook URL.
- **b) 1/10** — wrong; integrable.
- **c) 4/10** — workable но unnecessary.
- **d) 1/10** — wrong path.

**Correct Answer:** Dedicated Microsoft Teams Connector (if available) or generic HTTP Connector to Teams Incoming Webhook URL.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Microsoft Teams messages", "notify channel." Teams integration.

**Въпросът → Solution Framing.** "Connector option fits Teams" — изпитва се knowledge на dedicated vs generic Connector approaches.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Teams accepts Incoming Webhook URLs, че dedicated Connector provides better UX where available, че HTTP Connector е the fallback. Това е знание за Connector library + HTTP integration.

---

## Question 34: Configuring Connectors (Weighting: 6%)

**Scenario:** A delivery-routing process needs to **geocode customer addresses** — convert "123 Main St, Sofia, Bulgaria" to latitude/longitude. The team uses Google Maps Geocoding API.

**How does the team integrate Google Maps Geocoding via Camunda?**

- **a)** **HTTP Outbound Connector** calling the Google Maps Geocoding API endpoint (`https://maps.googleapis.com/maps/api/geocode/json`) with: query parameter `address`, header `Authorization` or query parameter `key` (the Google API key, stored as cluster secret). Parse the response (JSON) — extract lat/lng via FEEL Output Mapping. Documentation: [HTTP Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

- **b)** Camunda has a built-in Geocoding Connector — verify per version; if not, HTTP Connector is the canonical path. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Geocoding isn't supported — incorrect; HTTP Connector calls any REST API. Documentation: [HTTP Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

- **d)** Custom Java Connector required — over-engineered; HTTP Connector handles this simple REST call. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Most third-party REST APIs (Google Maps, Twilio, Stripe, etc.) integrate via the generic HTTP Outbound Connector:
  - **URL**: the API endpoint.
  - **Method**: typically GET (Geocoding) or POST.
  - **Auth**: API key in query parameter or header — store as cluster secret, reference via `{{secrets.GOOGLE_MAPS_API_KEY}}`.
  - **Query params / body**: FEEL expression building the request.
  - **Output Mapping**: parse the response JSON, extract relevant fields into process variables.

  For Google Maps Geocoding specifically: GET to `https://maps.googleapis.com/maps/api/geocode/json?address=...&key=...`, response includes `results[0].geometry.location.lat` and `lng`. Output Mapping: `Target: lat, Source: =response.results[1].geometry.location.lat` (FEEL 1-indexed).

- **Option b) — Verify per version.** Specific Connectors come and go; HTTP is the always-available baseline.

- **Option c) — Wrong.** HTTP Connector covers it.

- **Option d) — Over-engineered.** Simple GET; no custom code needed.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. HTTP Connector with Google Maps API + API key secret.
- **b) 6/10** — partial; verify per version.
- **c) 1/10** — wrong; HTTP covers it.
- **d) 3/10** — over-engineered.

**Correct Answer:** HTTP Outbound Connector calling Google Maps Geocoding API with API key (via secret).

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "geocode address", "Google Maps API." External REST integration.

**Въпросът → Solution Framing.** "Integrate Google Maps" — изпитва се knowledge на HTTP Connector for REST APIs.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че HTTP Connector calls any REST API, че secrets store API keys, че Output Mapping extracts fields, че custom Connector е unnecessary. Това е знание за REST integration pattern.

---

## Question 35: Configuring Connectors (Weighting: 6%)

**Scenario:** A team's CI/CD pipeline deploys BPMN to multiple environments (dev, staging, production). Connectors reference secrets that differ per environment (different API keys, URLs). The team wants to **provision secrets per environment** automatically as part of CI.

**How does the team manage per-environment secrets in CI/CD?**

- **a)** **Configure cluster secrets per environment** outside the BPMN — secrets live in the cluster's secrets provider (Console UI for SaaS, env / Kubernetes / Vault for SM). BPMN references secrets by name (`{{secrets.PARTNER_API_KEY}}`); the actual value differs per environment. CI/CD: deploy the same BPMN to each environment; provision secrets per environment via cluster API or IaC (Terraform / scripts). The BPMN is environment-agnostic. Documentation: [Connector Secrets](https://docs.camunda.io/docs/components/console/manage-clusters/manage-secrets/) + [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Embed environment-specific values in BPMN — defeats DRY; need separate BPMN files per environment. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Use a separate BPMN per environment — workable but loses single-source-of-truth. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** Camunda doesn't support per-environment secrets — incorrect; cluster secrets handle this. Documentation: [Connector Secrets](https://docs.camunda.io/docs/components/console/manage-clusters/manage-secrets/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The canonical pattern: **separate BPMN model from environment-specific values**. BPMN references secrets by name; secrets are environment-resident. Workflow:
  - **BPMN model**: identical across environments. Connectors reference `{{secrets.PARTNER_API_KEY}}`, `{{secrets.PARTNER_URL}}`, etc.
  - **Cluster secrets**: provisioned per cluster (per environment). Dev cluster has dev values; prod cluster has prod values.
  - **CI/CD pipeline**: (1) deploy BPMN to each environment's cluster (identical BPMN); (2) provision secrets to each environment via API (Console API for SaaS, env / K8s / Vault tooling for SM) — typically using IaC tooling for repeatability.

  This separation:
  - Keeps BPMN environment-agnostic (single source of truth).
  - Allows independent rotation of secrets per environment.
  - Prevents accidentally deploying dev credentials to prod.

- **Option b) — Wrong.** Defeats DRY.

- **Option c) — Loses SSoT.** Single-source-of-truth principle violated.

- **Option d) — Wrong.** Secrets supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Cluster secrets per environment + BPMN references by name; CI provisions secrets.
- **b) 2/10** — defeats DRY.
- **c) 4/10** — loses single-source-of-truth.
- **d) 1/10** — wrong; supported.

**Correct Answer:** BPMN references secrets by name; provision cluster secrets per environment via CI / IaC.

**Official Documentation Link:** https://docs.camunda.io/docs/components/console/manage-clusters/manage-secrets/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "per-environment secrets", "dev / staging / prod." Multi-environment configuration.

**Въпросът → Solution Framing.** "Manage per-environment secrets" — изпитва се knowledge на secrets architecture.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че secrets са cluster-resident, че BPMN references by name, че IaC provisions per environment. Това е знание за environment configuration patterns.

---

## Question 36: Configuring Connectors (Weighting: 6%)

**Scenario:** A legacy partner system exposes only a **SOAP** web service (XML-based, not REST). The team needs to call it from BPMN.

**How does the team integrate SOAP from Camunda 8?**

- **a)** **HTTP Outbound Connector with content-type `application/xml` (or `text/xml`) and the SOAP envelope in the request body** — SOAP is HTTP under the hood with XML bodies. The Connector posts the SOAP envelope, partner replies with SOAP response XML, the team parses via FEEL or a Service Task. For complex SOAP scenarios (WS-Security, attachments), a **custom Connector** wrapping a Java SOAP library (Apache CXF, etc.) may be cleaner. Documentation: [HTTP Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/) + [Custom Connector](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/)

- **b)** SOAP isn't supported — incorrect; SOAP is HTTP-based, HTTP Connector handles it. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Dedicated SOAP Connector available out of the box — verify per Camunda version; HTTP-based path is always available. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Convert SOAP to REST first via a proxy — over-engineered when HTTP Connector handles SOAP directly. Documentation: [HTTP Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** SOAP is XML over HTTP. The generic HTTP Connector handles it:
  - **Method**: POST.
  - **URL**: SOAP endpoint URL.
  - **Headers**: `Content-Type: text/xml; charset=utf-8` (or `application/soap+xml` for SOAP 1.2), `SOAPAction: "<action>"` (for SOAP 1.1).
  - **Body**: the SOAP envelope as a string. Often built via FEEL string concatenation with embedded variables.

  Parse the SOAP response (XML) — for simple responses, FEEL string functions extract values; for complex responses, a Service Task with a Java SOAP library is cleaner.

  For complex SOAP (WS-Security, attachments, complex WSDL types), a **custom Connector** using Apache CXF, JAX-WS, or similar provides better ergonomics than manual SOAP-XML composition.

- **Option b) — Wrong.** SOAP is HTTP-based.

- **Option c) — Verify per version.** Dedicated Connectors come and go.

- **Option d) — Over-engineered.** HTTP Connector directly handles SOAP.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. HTTP Connector with SOAP envelope body, or custom Connector for complex scenarios.
- **b) 1/10** — wrong; SOAP е HTTP.
- **c) 6/10** — verify per version.
- **d) 3/10** — over-engineered.

**Correct Answer:** HTTP Outbound Connector with SOAP envelope as XML body; custom Connector for complex SOAP (WS-Security etc.).

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "legacy SOAP web service", "XML-based, not REST." SOAP integration question.

**Въпросът → Solution Framing.** "Integrate SOAP" — изпитва се knowledge на HTTP Connector flexibility + custom for complex.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SOAP = XML over HTTP, че HTTP Connector handles это с appropriate headers + body, че custom Connector е за complex scenarios. Това е знание за legacy integration via Connectors.

---

# Section 6 — Extensions & Integrations (Questions 37-50)

> Weight 25% • Topics: FEEL split / boolean / floor/ceiling/round / even/odd / before-after, Spring Zeebe fetchAllVariables, Node ZBClient setup, zbctl set variables, Camunda 8 Identity, declarative Connector retries, Inbound status query, RPA DSL, gRPC long-polling.

---

## Question 37: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression receives a CSV-style string `tags = "GOLD,EU,WHOLESALE"` and must split it into a list `["GOLD", "EU", "WHOLESALE"]`.

**Which FEEL built-in fits "split string by separator"?**

- **a)** `split(s, regex)` — FEEL's string-split built-in. Splits the string by the regex pattern (a comma in this case) and returns a list. `split("GOLD,EU,WHOLESALE", ",")` returns `["GOLD", "EU", "WHOLESALE"]`. Documentation: [FEEL string](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **b)** `s.split(",")` — JS reflex; not FEEL syntax. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Iterate character-by-character with for-expression — works but verbose; `split()` handles it directly. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `tokenize(s, ",")` — invented function name. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's `split(string, regex)` returns a list of strings, splitting at each regex match. Important detail: **the second argument is a regex**, not a literal — special regex characters need escaping. For simple delimiters like comma, this works directly. For complex separators (e.g., "split on any whitespace": `split(s, "\\s+")`), regex flexibility is useful.

  Companion built-ins:
  - `substring(s, start, length)` — extracts a portion.
  - `string join(list, sep)` — the inverse (list to string).
  - `string length(s)` — character count.

- **Option b) — JS reflex.** Method-call syntax isn't FEEL.

- **Option c) — Verbose.** Reinvents `split()`.

- **Option d) — Invented.** Not a FEEL name.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. split(s, regex) returns list of strings.
- **b) 2/10** — JS reflex.
- **c) 4/10** — verbose; reinvents.
- **d) 1/10** — invented.

**Correct Answer:** split(tags, ",").

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "split CSV string by comma", "list of strings." String-split.

**Въпросът → Solution Framing.** "Built-in fits split" — изпитва се FEEL string ops.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че split() returns list, че second arg е regex (escape carefully), че JS method-call е wrong syntax. Това е знание за FEEL string splitting.

---

## Question 38: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must convert a string `"true"` to a boolean `true` (e.g., the value came from a form text input where user wrote "true" or "false").

**Which FEEL built-in fits "string to boolean conversion"?**

- **a)** **No direct `boolean()` constructor in FEEL** for string-to-boolean. Workaround: explicit comparison `=s = "true"` — returns boolean by comparison semantics. Or for case-insensitivity: `=lower case(s) = "true"`. Documentation: [FEEL conversion](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-conversion/)

- **b)** `boolean(s)` — verify per FEEL version; not universally part of FEEL conversion built-ins. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `s = "true" or s = "True"` — works case-by-case; `lower case(s) = "true"` is cleaner. Documentation: [FEEL string](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **d)** Forms only return boolean type, so no conversion needed — partially true if you use a Checkbox field (returns boolean) but Text Input returns string. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's conversion built-ins include `number(s)`, `string(n)`, `date(s)`, `time(s)`, `date and time(s)`, `duration(s)` — well-known and documented. A bare **`boolean(s)`** conversion isn't part of the standard FEEL spec in the same way. The practical recourse is explicit comparison, which returns boolean by FEEL semantics:
  - `=s = "true"` — returns true if s equals "true", false otherwise.
  - `=lower case(s) = "true"` — case-insensitive comparison (recommended; users might type "True" or "TRUE").

  Best practice: avoid string-encoded booleans from user input in the first place. Use a Checkbox or Toggle field in the Form (which returns a real boolean). Use string-to-boolean conversion only when the data source forces it.

- **Option b) — Verify per version.** Some FEEL implementations may have added it; not safe to rely on without checking.

- **Option c) — Workable но less concise.** `lower case(s) = "true"` covers case variations.

- **Option d) — Partial.** Checkbox returns boolean; Text Input doesn't.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. No standard boolean(s); use explicit comparison + lower case() for case-insensitivity.
- **b) 4/10** — verify per version.
- **c) 6/10** — workable но less concise than lower case() approach.
- **d) 5/10** — partial; depends on form field type.

**Correct Answer:** No standard boolean(s) conversion; use comparison `=lower case(s) = "true"`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-conversion/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "string to boolean", "form text input." String-to-boolean conversion.

**Въпросът → Solution Framing.** "Built-in fits" — изпитва се FEEL conversion gap + workaround.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL conversion built-ins не include direct boolean(s), че comparison returns boolean, че lower case() handles case variations, че Checkbox fields return native boolean. Това е знание за FEEL conversion + best practices.

---

## Question 39: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression computes a numeric value `12.7` and needs to apply different rounding strategies: round down to `12`, round up to `13`, round to nearest `13`. The team wants to know FEEL's rounding functions.

**Which FEEL functions provide floor, ceiling, and round?**

- **a)** **`floor(n)`** rounds down (toward negative infinity), **`ceiling(n)`** rounds up (toward positive infinity), **`round half even(n, scale)`** rounds half-even (banker's rounding) to the given scale. There are also `round up`, `round down`, `round half up` variants. Each handles different rounding semantics; pick based on requirement. Documentation: [FEEL numeric](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/)

- **b)** Only `round()` exists; no floor / ceiling — incorrect; multiple rounding functions. Documentation: [FEEL numeric](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/)

- **c)** `Math.floor()`, `Math.ceil()`, `Math.round()` — JS reflex; FEEL uses bare function names. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** FEEL doesn't support rounding — incorrect; documented support. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's numeric built-ins include rounding variants:
  - **`floor(n)`**: rounds toward negative infinity. `floor(12.7)` = 12; `floor(-12.3)` = -13.
  - **`ceiling(n)`**: rounds toward positive infinity. `ceiling(12.3)` = 13; `ceiling(-12.7)` = -12.
  - **`round half even(n, scale)`**: rounds half-even (banker's rounding — ties go to even). Reduces statistical bias for repeated rounding. `round half even(12.5, 0)` = 12, `round half even(13.5, 0)` = 14.
  - **`round up(n, scale)`**: rounds away from zero.
  - **`round down(n, scale)`**: rounds toward zero.
  - **`round half up(n, scale)`**: rounds half-up (school rounding).

  Choose based on requirement: floor/ceiling for "always toward one side"; round-half-even for unbiased rounding in financial calculations; round-half-up for everyday "round to nearest."

  Also relevant: `decimal(n, scale)` rounds to a specific decimal scale (similar effect to round-half-even).

- **Option b) — Wrong.** Multiple rounding functions.

- **Option c) — JS reflex.** FEEL uses bare function names.

- **Option d) — Wrong.** Rounding supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. floor / ceiling / round half even (banker's) + round up/down/half up variants.
- **b) 3/10** — wrong; multiple functions.
- **c) 2/10** — JS reflex.
- **d) 1/10** — wrong; supported.

**Correct Answer:** floor(n), ceiling(n), round half even(n, scale) (and round up / round down / round half up variants).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "rounding strategies", "floor / ceiling / round." FEEL numeric functions.

**Въпросът → Solution Framing.** "Functions for rounding" — изпитва се FEEL numeric vocabulary.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL има multiple rounding variants, че floor/ceiling са specific-direction, че round half even е banker's rounding. Това е знание за FEEL rounding semantics.

---

## Question 40: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must check if a number is **even** — useful for partitioning data, alternating logic, etc.

**Which FEEL built-in fits "is number even"?**

- **a)** `even(n)` — FEEL numeric built-in returning boolean. `even(4)` = true, `even(7)` = false. Companion: `odd(n)`. Documentation: [FEEL numeric](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/)

- **b)** `n mod 2 = 0` — works (modulo arithmetic) but `even()` is the direct primitive. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `n % 2 == 0` — JS reflex; FEEL uses `mod` operator, not `%`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** FEEL doesn't have even/odd checks — incorrect; built-ins exist. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL provides `even(n)` and `odd(n)` as primitives. Both return boolean; the implementation is internally equivalent to modulo checks but the named functions are more readable. The standard FEEL spec includes these.

  Modulo operator: FEEL uses `modulo(divisor, dividend)` or `dividend mod divisor` syntax in some implementations. Not `%`.

- **Option b) — Workable but verbose.** Modulo arithmetic works; `even()` is direct.

- **Option c) — JS reflex.** FEEL doesn't use `%` operator or `==`.

- **Option d) — Wrong.** Built-ins exist.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. even(n) and odd(n) FEEL built-ins.
- **b) 6/10** — workable но less direct.
- **c) 2/10** — JS reflex.
- **d) 1/10** — wrong; built-ins exist.

**Correct Answer:** even(n) and odd(n).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "is number even", "alternating logic." FEEL even/odd primitive.

**Въпросът → Solution Framing.** "Built-in fits" — изпитва се FEEL numeric primitives.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че even() / odd() са FEEL primitives, че modulo works but indirect, че JS `%` `==` не FEEL syntax. Това е знание за FEEL numeric built-ins.

---

## Question 41: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Java Spring Zeebe worker subscribes to `enrich-data`. The worker doesn't know in advance which process variables it might need — they vary per process. The team is considering `fetchAllVariables`.

**What does `fetchAllVariables = true` do, and what's the trade-off vs `fetchVariables` whitelist?**

- **a)** **`fetchAllVariables = true`** — the worker activation includes **all** process variables in the job payload. Trade-off: simplicity (no need to declare which variables) vs **bandwidth + memory** (the entire process scope serialised per activation; for large processes this is wasteful). Use it when the worker truly needs ad-hoc variable access; use `fetchVariables = {"...", "..."}` whitelist for known-variable workers (recommended for performance). Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** Always use `fetchAllVariables = true` — incorrect; whitelist is more efficient for known cases. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** `fetchAllVariables` doesn't exist — verify per Spring Zeebe version; both options typically supported. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** All workers fetch all variables by default — partial; the default may vary by SDK version; explicit configuration recommended for clarity. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Trade-off:
  - **`fetchAllVariables = true`**: gets all process variables on each activation. Simple to use (no list to maintain); wasteful if the process has many variables and the worker uses only a few. Bandwidth cost (variables serialised on the wire); memory cost (worker holds them).
  - **`fetchVariables = {"a", "b"}`** whitelist: only specified variables included. Efficient; explicit contract (the worker declares what it needs).

  Default behaviour varies by SDK version and configuration; explicit setting is best practice.

  Decision rule:
  - **Known fixed variables** the worker uses → `fetchVariables` whitelist (efficient + explicit).
  - **Ad-hoc / dynamic variable access** (e.g., a logging worker that dumps everything) → `fetchAllVariables = true`.

- **Option b) — Wrong default.** Whitelist preferred for known cases.

- **Option c) — Verify per version.** Both typically supported.

- **Option d) — Partial.** Verify default.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. fetchAllVariables trade-off: simplicity vs efficiency; whitelist preferred for known.
- **b) 3/10** — wrong default recommendation.
- **c) 6/10** — verify per version.
- **d) 5/10** — partial; verify defaults.

**Correct Answer:** fetchAllVariables=true gets all variables (simple, wasteful); fetchVariables whitelist preferred for known cases (efficient, explicit).

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "fetchAllVariables", "trade-off vs whitelist." Worker variable fetching.

**Въпросът → Solution Framing.** "What it does + trade-off" — изпитва се knowledge на variable-fetch options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че fetchAllVariables е simple но wasteful, че whitelist е efficient + explicit, че choice depends on variable usage pattern. Това е знание за worker tuning.

---

## Question 42: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Node.js application is setting up `@camunda8/sdk` to communicate with a SaaS cluster. The dev wants to know **how the ZBClient (or equivalent) is created** — what config it needs.

**How is the Node SDK client typically configured for SaaS?**

- **a)** Create the client with config including: **cluster ID** (cluster address), **OAuth2 credentials** (client ID + secret), **OAuth2 token endpoint** (Auth0 for SaaS). The SDK handles OAuth2 flow (token fetch / refresh / caching) internally. Code: `import { Camunda8 } from '@camunda8/sdk'; const c8 = new Camunda8({ ZEEBE_ADDRESS, ZEEBE_CLIENT_ID, ZEEBE_CLIENT_SECRET, CAMUNDA_OAUTH_URL });`. Documentation: [Node.js SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **b)** No config needed; SDK auto-detects — incorrect; auth credentials required. Documentation: [Node.js SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **c)** Username + password — wrong auth model; SaaS uses OAuth2 client credentials. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **d)** Only an API key — wrong auth model; OAuth2 client-credentials. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 SaaS uses OAuth2 client-credentials grant for SDK authentication. SDK setup:
  1. **Console UI**: provision an API Client → get client ID + client secret + audience URLs.
  2. **SDK config**: pass cluster address, client credentials, and OAuth2 token endpoint.
  3. **SDK runtime**: on first call, exchanges credentials for an access token at the OAuth2 endpoint; uses Bearer token in subsequent gRPC / REST calls; refreshes before expiry.

  Environment-variable convention (typical):
  - `ZEEBE_ADDRESS`: cluster's Zeebe gRPC address (e.g., `<cluster>.zeebe.camunda.io:443`).
  - `ZEEBE_CLIENT_ID`: API client ID.
  - `ZEEBE_CLIENT_SECRET`: API client secret.
  - `CAMUNDA_OAUTH_URL`: Auth0 token endpoint.

  The SDK reads from environment by default, or accept explicit config object in code.

  For Self-Managed clusters: same OAuth2 model; just point to your IdP's token endpoint.

- **Option b) — Wrong.** Credentials required.

- **Option c) — Wrong auth model.** Not basic auth.

- **Option d) — Wrong auth model.** OAuth2, not API key.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. ZBClient config: cluster address + OAuth2 credentials + token endpoint.
- **b) 1/10** — wrong; credentials required.
- **c) 1/10** — wrong; not basic auth.
- **d) 1/10** — wrong; OAuth2 not API key.

**Correct Answer:** Provide cluster address + OAuth2 client credentials + token endpoint; SDK handles OAuth2 flow.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/node-js-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Node SDK config for SaaS", "create client." SDK setup question.

**Въпросът → Solution Framing.** "How configured" — изпитва се knowledge на SaaS authentication.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SaaS uses OAuth2 client credentials, че SDK handles flow internally, че config includes address + credentials + token endpoint. Това е знание за SDK setup.

---

## Question 43: Extensions & Integrations (Weighting: 25%)

**Scenario:** Ops needs to **set a process variable on a running instance** to recover from an incident — the variable `customerId` is missing. They use `zbctl`.

**Which zbctl subcommand sets a variable on a running instance?**

- **a)** `zbctl set variables <instanceKey> --variables '{"customerId":"C-123"}'` (or similar — verify exact syntax for your zbctl version). zbctl supports set-variables-on-instance as one of its command operations. Alternative: REST API `PATCH /v2/process-instances/{key}/variables`. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/) + [Orchestration API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/)

- **b)** zbctl doesn't support setting variables on running instances — incorrect; supported as a command. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/)

- **c)** Only via Operate UI manually — Operate works but zbctl provides programmatic / scriptable access. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **d)** Cancel and recreate — heavyweight workaround; setting variables is the targeted action. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** zbctl is command-oriented; among its commands is setting variables on instances. The exact syntax / subcommand name varies across versions (`zbctl set variables`, `zbctl publish-message`, `zbctl create instance`, etc.). For setting variables:
  ```
  zbctl set variables <instance-key> --variables '{"customerId": "C-123"}'
  ```
  Refreshes the variable scope of the instance; if it was part of an Incident due to missing variable, ops can then resolve the Incident, and the job re-activates with the variable now present.

  Alternative: REST API `PATCH /v2/process-instances/{key}/variables` does the same programmatically without zbctl.

- **Option b) — Wrong.** Supported.

- **Option c) — Manual.** Operate UI works for one-off; zbctl / REST for scriptable.

- **Option d) — Heavyweight.** Not needed.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. zbctl set variables (or REST PATCH equivalent).
- **b) 2/10** — wrong; supported.
- **c) 5/10** — manual; not scriptable.
- **d) 2/10** — heavyweight workaround.

**Correct Answer:** zbctl set variables <instanceKey> --variables (or REST API PATCH /v2/process-instances/{key}/variables).

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/cli-client/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "set variable on running instance", "recover from incident." Variable update operation.

**Въпросът → Solution Framing.** "zbctl subcommand sets variable" — изпитва се knowledge на zbctl + REST API.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че zbctl supports set variables, че REST PATCH е alternative, че Operate UI е humans-only. Това е знание за scriptable incident recovery.

---

## Question 44: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team using **Self-Managed** Camunda 8 needs to manage users / groups / permissions. The SaaS edition has Console / Identity SaaS; Self-Managed uses a different mechanism.

**What identity provider does Self-Managed Camunda 8 typically use?**

- **a)** **Camunda Identity** — Self-Managed Camunda 8 ships with an **Identity component** built on top of **Keycloak** (an open-source IdP). Out of the box, Self-Managed deployments include a Keycloak instance configured for Camunda. The team can also configure Camunda Identity to delegate to **external IdPs** (Active Directory, Azure AD, Okta, etc.) for enterprise SSO. Documentation: [Camunda Identity](https://docs.camunda.io/docs/self-managed/identity/) + [Self-Managed concepts](https://docs.camunda.io/docs/self-managed/concepts/architecture/)

- **b)** Camunda Identity for SaaS only; SM has no IdP — incorrect; SM has Identity. Documentation: [Camunda Identity](https://docs.camunda.io/docs/self-managed/identity/)

- **c)** Users embedded in BPMN models — wrong scope; users live in IdP, BPMN references them. Documentation: [Identity](https://docs.camunda.io/docs/self-managed/identity/)

- **d)** SM has no permission system — incorrect; Identity provides RBAC. Documentation: [Identity](https://docs.camunda.io/docs/self-managed/identity/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Self-Managed includes an **Identity** component for user / group / permission management. The default IdP is **Keycloak** — a battle-tested open-source IdP. Capabilities:
  - **User / group management**: create users, assign to groups, manage credentials.
  - **OAuth2 / OIDC token issuance**: workers and SDKs authenticate via standard OAuth2 client-credentials flow.
  - **External IdP delegation**: configure Identity to federate with corporate IdPs (Azure AD, Okta, AD via LDAP) for SSO.
  - **Permissions**: define what users / groups can do in Camunda components (Web Modeler, Operate, Tasklist, etc.).

  For SaaS: Camunda's Console provides similar functionality hosted by Camunda.

  Deployment pattern for SM: deploy Identity + Keycloak alongside Zeebe / Operate / Tasklist; configure components to use Identity as auth provider; configure Keycloak (or delegate to external IdP).

- **Option b) — Wrong.** SM has Identity.

- **Option c) — Wrong scope.** Users in IdP, BPMN references.

- **Option d) — Wrong.** Identity provides RBAC.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Self-Managed Camunda Identity built on Keycloak; supports external IdP federation.
- **b) 1/10** — wrong; SM has Identity.
- **c) 2/10** — wrong scope.
- **d) 1/10** — wrong; RBAC supported.

**Correct Answer:** Camunda Identity (built on Keycloak by default; can federate with external IdPs).

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/identity/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Self-Managed identity provider", "users / groups / permissions." SM IdP architecture.

**Въпросът → Solution Framing.** "What IdP" — изпитва се knowledge на SM Identity component.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SM ships with Identity + Keycloak, че external IdP federation possible, че permissions / RBAC supported. Това е знание за SM authentication architecture.

---

## Question 45: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team's HTTP Outbound Connector calls a partner API. The partner is occasionally flaky — returns 503 Service Unavailable. The team wants the Connector to **retry automatically with exponential backoff** without explicit BPMN-level Error Boundary.

**Can Connectors have built-in retry-with-backoff configuration?**

- **a)** **Depends on the Connector**: some out-of-the-box Connectors expose internal retry / backoff configuration directly. The BPMN-level approach (`zeebe:taskDefinition retries` + retryBackoff attribute) provides retry control at the BPMN layer regardless. Combination: Connector-internal retry (if available) handles low-level retries; BPMN-level retries handle remaining cases. For HTTP Connector specifically, verify the current docs for built-in retry options; otherwise rely on BPMN retries + Error Boundary. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/) + [retries](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** All Connectors auto-retry with backoff by default — overstated; depends per Connector. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** No retries supported in Connectors — incorrect; BPMN-level retries always available. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Must implement retries in custom code — partial; for OOB Connectors, BPMN-level retries suffice. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Retry handling in Camunda 8 Connectors operates at two layers:
  - **BPMN-level retries** (always available): `zeebe:taskDefinition retries` sets initial retry count; `retryBackoff` attribute (where supported) sets delay between retries. When the Connector returns failure, Zeebe decrements retries; if > 0, re-activates after backoff; if 0, Incident.
  - **Connector-internal retries** (Connector-specific): some Connectors implement internal retry logic (e.g., handle transient HTTP errors internally before reporting failure). Verify per Connector — features vary.

  For an HTTP Connector facing flaky partner: declare BPMN retries = 5, retryBackoff = `PT10S` (10-second linear) or `PT10S, PT20S, PT40S, PT80S` (exponential). On 503, Connector returns failure; Zeebe waits, re-activates; Connector retries the call; pattern continues until success or retries exhausted.

  For more aggressive retry policies, custom Connector can implement HTTP-specific retry logic (e.g., honour `Retry-After` header) before reporting failure to Zeebe.

- **Option b) — Overstated.** Per-Connector.

- **Option c) — Wrong.** BPMN-level retries available.

- **Option d) — Partial.** For OOB Connectors, BPMN retries suffice.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. BPMN retries + retryBackoff always available; Connector-internal varies.
- **b) 3/10** — overstated.
- **c) 1/10** — wrong; BPMN-level always.
- **d) 4/10** — partial; OOB doesn't need custom.

**Correct Answer:** BPMN-level retries + retryBackoff always available; Connector-internal retry varies per Connector.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Connector retry with backoff", "flaky partner 503." Connector retry options.

**Въпросът → Solution Framing.** "Built-in retry config" — изпитва се knowledge на BPMN-level vs Connector-internal retries.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BPMN retries + retryBackoff е the always-available layer, че Connector-internal varies, че custom Connectors can add HTTP-aware retry logic. Това е знание за multi-layer retry architecture.

---

## Question 46: Extensions & Integrations (Weighting: 25%)

**Scenario:** Ops wants to monitor an **Inbound Webhook Connector** — verify it's actively listening, see recent message correlation activity, check for errors.

**How does ops monitor Inbound Connector status?**

- **a)** **Connector Runtime exposes metrics + logs**: subscription counts, correlation success/failure rates, recent errors. Integrate with monitoring infrastructure (Prometheus / Grafana for metrics, log-aggregation for logs). For per-instance event details, **Operate's instance views** show whether instances were started by Inbound triggers and any correlation errors. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/) + [Operate](https://docs.camunda.io/docs/components/operate/)

- **b)** No way to monitor Inbound Connectors — incorrect; logs + metrics available. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Only via Operate UI — partial; Operate shows process-level visibility, but Connector Runtime has its own metrics. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Custom monitoring required — partially correct that integration with monitoring infrastructure is the team's responsibility, but the Connector Runtime exposes the data. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Multi-layer observability for Inbound Connectors:
  - **Connector Runtime**: as a separate process (in SM) or managed component (in SaaS), exposes operational metrics (subscription counts, throughput, error rates) and logs. Typically Spring Boot Actuator endpoints for metrics + structured logs.
  - **Process Engine (Zeebe / Operate)**: when an Inbound Connector triggers a process instance, Operate sees the new instance. The instance's history shows it was started by the inbound trigger.
  - **Cluster monitoring**: aggregate metrics across components via Prometheus / Grafana.

  Practical monitoring setup:
  - Scrape Connector Runtime metrics → Grafana dashboard for subscription health, error rates, latency.
  - Aggregate logs → search for correlation failures, auth errors.
  - Alert on Connector Runtime health endpoint, on metric thresholds, on Operate Incident growth tied to Inbound-triggered instances.

- **Option b) — Wrong.** Monitoring available.

- **Option c) — Partial.** Operate е one part; Connector Runtime metrics are separate.

- **Option d) — Partial.** Integration is team's work; raw data exposed.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Connector Runtime metrics/logs + Operate process visibility.
- **b) 1/10** — wrong; observable.
- **c) 4/10** — partial; Connector Runtime separate.
- **d) 5/10** — partial; raw data exposed.

**Correct Answer:** Connector Runtime exposes metrics + logs (Prometheus / Grafana) + Operate shows process-level visibility.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "monitor Inbound Connector status", "subscriptions / errors." Connector observability.

**Въпросът → Solution Framing.** "How monitor" — изпитва се knowledge на multi-layer observability.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Connector Runtime exposes metrics + logs, че Operate shows instance-level details, че Grafana / log-aggregation handle visualization. Това е знание за Connector observability.

---

## Question 47: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team writes RPA bot scripts using **Camunda's RPA scripting language**. They wonder if it's a custom DSL or based on something familiar.

**What language do Camunda 8 RPA bots typically use?**

- **a)** **Camunda RPA** uses a scripting language familiar to RPA developers — often **Robot Framework DSL** (Python-based RPA framework) or a Camunda-specific extension. The script defines steps: open application, perform UI interactions, extract data, return results. The exact DSL varies by Camunda RPA version — verify the current docs. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **b)** Java only — incorrect; RPA bots use higher-level DSLs, not raw Java. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **c)** BPMN — incorrect; BPMN orchestrates RPA tasks but isn't the bot script language. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** RPA bots are visual no-code only — partial; visual recorders may generate scripts, but the underlying representation is scriptable DSL. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 RPA's scripting layer typically uses an RPA-oriented DSL — often **Robot Framework** (open-source RPA framework popular in Python ecosystems) or a Camunda-extension. Robot Framework's DSL is keyword-driven: scripts express test / automation steps in readable form ("Open Browser", "Click Element", "Extract Text", "Return Result"). Custom keywords extend the vocabulary.

  Practical pattern:
  - **Bot author**: writes the Robot Framework script (or uses a visual recorder that emits it).
  - **Deploy**: the script is deployed to Camunda's RPA worker fleet.
  - **Runtime**: BPMN Service Task of type `camunda::rpa` activates the bot; worker runs the script; result returns to the process.

  Some Camunda RPA versions may support multiple scripting backends (Robot Framework, custom Python, etc.) — verify the docs for your version's supported DSLs.

- **Option b) — Wrong.** RPA uses higher-level DSLs.

- **Option c) — Wrong.** BPMN orchestrates, doesn't script bots.

- **Option d) — Partial.** Visual + scriptable both possible; scriptable DSL underlies.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. RPA DSL (often Robot Framework) defines bot scripts.
- **b) 2/10** — wrong; not raw Java.
- **c) 2/10** — wrong; BPMN orchestrates.
- **d) 5/10** — partial; visual + scriptable underlie.

**Correct Answer:** RPA DSL (often Robot Framework) for bot scripts; verify per Camunda RPA version.

**Official Documentation Link:** https://docs.camunda.io/docs/components/rpa/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "RPA scripting language", "custom DSL or familiar." Bot scripting question.

**Въпросът → Solution Framing.** "Language for bots" — изпитва се knowledge на RPA DSL.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че RPA uses higher-level DSL (often Robot Framework), че BPMN orchestrates но е not the script, че Java raw е too low-level. Това е знание за RPA architecture.

---

## Question 48: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression compares two dates: `=startDate before endDate` and wonders about the `before` / `after` operators — are they FEEL-spec?

**Are `before` and `after` operators part of FEEL for date/range comparison?**

- **a)** **Yes** — FEEL has **interval / range operators** including `before`, `after`, `meets`, `metBy`, `overlaps`, `during`, `includes`, etc. for date / interval comparisons. `date1 before date2` is true if date1 is strictly before date2. Useful for date / time arithmetic. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** No — only `<` and `>` operators — partial; `<` `>` work too, but FEEL has named operators for semantic clarity. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **c)** `before` and `after` are FEEL functions, not operators — close but typically operators in unary tests / expressions. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** FEEL only handles ranges via `[..]` syntax — partial; range syntax exists, but `before` / `after` operators are also part of FEEL. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's range / interval operators are particularly useful for date arithmetic and unary tests in DMN. The full set (per DMN/FEEL spec):
  - `before` / `after`: strict ordering (e.g., `date1 before date2`).
  - `meets` / `metBy`: ranges touch at a single point.
  - `overlaps` / `overlapsBefore` / `overlapsAfter`: ranges overlap.
  - `during` / `includes`: containment relations.
  - `starts` / `startedBy` / `finishes` / `finishedBy`: boundary matching.
  - `coincides`: identical ranges.

  Use cases: contract date overlap checks, scheduling conflict detection, range queries.

  Comparison operators (`<`, `>`, `<=`, `>=`, `=`) also work for date comparisons; `before` / `after` are sometimes more readable for business-domain logic.

- **Option b) — Partial.** `<` `>` work but `before` / `after` add semantic clarity.

- **Option c) — Close.** They're commonly described as operators in expression context.

- **Option d) — Partial.** Both range syntax and named operators exist.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. before / after (and meets / overlaps / during etc.) са FEEL range operators.
- **b) 6/10** — partial; works но less complete picture.
- **c) 7/10** — close; operators in expression context.
- **d) 5/10** — partial; both exist.

**Correct Answer:** Yes — before, after (and meets, overlaps, during, etc.) are FEEL range/interval operators for date/time comparisons.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "before / after operators", "date comparison." FEEL range operators.

**Въпросът → Solution Framing.** "Are before/after FEEL-spec" — изпитва се knowledge на FEEL range operators.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL има named range operators (before/after/meets/overlaps/during/...), че comparison operators също work, че operators add semantic clarity. Това е знание за FEEL range/interval operators.

---

## Question 49: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must divide a duration by a number to get a per-unit duration. E.g., total contract duration `P12M` divided by 12 (months) = `P1M` per month.

**Does FEEL support arithmetic between durations and numbers?**

- **a)** **Yes** — FEEL supports arithmetic between durations and numbers (multiplication / division yield durations). `duration("P12M") / 12` returns `P1M`. Note: division must use numbers, not other durations (dividing duration by duration gives a number ratio in some specs; verify per FEEL implementation). Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** Durations can't be divided — incorrect; arithmetic supported. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **c)** Only addition / subtraction between durations — partial; multiplication / division by numbers also work. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **d)** Convert duration to seconds first — workable but cumbersome; direct arithmetic preferred. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL supports a useful range of duration arithmetic:
  - **Duration + Duration** = Duration (e.g., `P1M + P1W`).
  - **Duration − Duration** = Duration.
  - **Duration × Number** = Duration (e.g., `P1M * 12` = `P12M`).
  - **Duration ÷ Number** = Duration (e.g., `P12M / 12` = `P1M`).
  - **Duration ÷ Duration** = Number (ratio; verify support per implementation).
  - **Date + Duration** = Date (e.g., `today() + P30D`).
  - **Date − Date** = Duration.

  These compose for date / time / interval computations. The duration types (`days and time duration` vs `years and months duration`) have nuanced arithmetic rules — verify your specific case in the FEEL temporal docs.

- **Option b) — Wrong.** Arithmetic supported.

- **Option c) — Partial.** Mult/div with numbers also supported.

- **Option d) — Cumbersome.** Direct arithmetic preferred.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Duration arithmetic с numbers (mul/div) supported, plus addition / subtraction.
- **b) 1/10** — wrong; supported.
- **c) 5/10** — partial; mul/div also work.
- **d) 4/10** — cumbersome workaround.

**Correct Answer:** Yes — FEEL supports duration × number, duration ÷ number, duration ± duration, etc.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "divide duration by number", "P12M / 12." Duration arithmetic.

**Въпросът → Solution Framing.** "Supports arithmetic between durations and numbers" — изпитва се FEEL duration math.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL supports duration mul/div with numbers, че also addition / subtraction with durations, че date + duration = date. Това е знание за FEEL duration arithmetic.

---

## Question 50: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team's worker uses gRPC `ActivateJobs` to fetch jobs. The dev wonders about the **long-polling** semantics — does the call block waiting for jobs, or return immediately if no jobs available?

**What is the gRPC `ActivateJobs` long-polling behaviour?**

- **a)** **Long-polling**: the gRPC call blocks for a configured **request timeout** waiting for jobs to become available. If jobs arrive during the wait, the call returns with the activated jobs. If no jobs arrive by the timeout, the call returns with an empty list. The worker then re-issues the call. This avoids busy-polling. Configure via `request timeout` (typical: tens of seconds). Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/gateway-service/) + [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Returns immediately if no jobs — wrong; would force workers to busy-poll. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

- **c)** Blocks indefinitely until jobs arrive — incorrect; there's a request timeout. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

- **d)** Only `streamJobs` is long-polling; `ActivateJobs` returns immediately — partial; both have variations, but ActivateJobs typically supports long-polling via request timeout. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe's gRPC `ActivateJobs` implements **long-polling**: the client specifies a `request timeout`; the gateway holds the request open for up to that duration. If jobs of the requested type appear during the wait, they're returned immediately. If the timeout elapses with no jobs, the call returns empty. Workers then re-issue the call.

  Benefits:
  - **Lower latency** than fixed-interval polling: as soon as a job is created, the gateway can return it to the waiting worker.
  - **Lower load** on broker / network: fewer calls vs busy-polling.
  - **Standard pattern** for activation in Zeebe SDKs (all implementations use it).

  Tuning: typical request timeout is 1-60 seconds. Longer = lower load but slower failure detection if connection breaks; shorter = more responsive to network issues but more polling overhead.

  Alternative: **streamJobs** — a streaming gRPC API where the gateway pushes activated jobs to the worker without explicit polling. Available in some Zeebe versions; offers even lower latency than long-polling.

- **Option b) — Wrong.** Would force busy-polling.

- **Option c) — Wrong.** Bounded by request timeout.

- **Option d) — Partial.** ActivateJobs uses long-polling; streamJobs adds streaming.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Long-polling with configurable request timeout; jobs returned during wait or empty on timeout.
- **b) 2/10** — wrong; busy-polling avoided.
- **c) 3/10** — wrong; bounded by timeout.
- **d) 5/10** — partial; ActivateJobs uses long-polling.

**Correct Answer:** Long-polling — blocks up to request timeout; returns jobs as available or empty on timeout.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/zeebe-api/gateway-service/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "ActivateJobs long-polling", "blocks waiting for jobs." gRPC activation semantics.

**Въпросът → Solution Framing.** "Long-polling behaviour" — изпитва се knowledge на Zeebe gRPC API.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че ActivateJobs blocks up to request timeout, че long-polling reduces latency vs busy-polling, че streamJobs е streaming alternative. Това е знание за Zeebe gRPC activation.

---

# Section 7 — Managing the Development Process (Questions 51-59)

> Weight 15% • Topics: Web Modeler resource lifecycle, Operate query performance, migration validation, Tasklist API task assignment, BPMN naming conventions, audit logs, real-time collaboration, monitoring metrics, business identifiers.

---

## Question 51: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's workflow: draft a BPMN in Web Modeler → review → publish → deploy to cluster. They wonder if Web Modeler has explicit lifecycle states for resources.

**Does Web Modeler distinguish "draft / published / deployed" resource states?**

- **a)** Web Modeler maintains **draft** (in-progress edits, possibly not validated) and **deployed** (a specific version uploaded to a Zeebe cluster) states; some versions also support **published / promoted** intermediates. The lifecycle typically: draft (editable) → save → deploy to cluster (version pinned at deployment). Each deployment is a snapshot; later edits create a new draft until next deploy. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/) + [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

- **b)** No lifecycle — every save is "final" — incorrect; draft + deployed distinction exists. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** Web Modeler has only "saved" state — partial; the deployment step is distinct from save. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** Lifecycle is configurable per project — partially correct; some Web Modeler tiers may offer customisable lifecycle (e.g., approval gates), but basic draft/deployed states are standard. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler distinguishes:
  - **Draft / editing state**: the resource exists in the project; modelers can edit and save changes. Not yet deployed to any cluster.
  - **Saved state**: the resource's current content (preserved across sessions; collaboration synchronises).
  - **Deployed state**: at a moment in time, the modeler clicks "Deploy" — the current saved content is uploaded to a target Zeebe cluster, getting a process definition version there.

  Each deployment is a snapshot — subsequent edits in Web Modeler don't auto-update the deployed version; another deployment creates a new version.

  Some Camunda 8 tiers / configurations may add **publishing** or **promotion** workflows (e.g., editor publishes a draft, admin promotes to a release version for deploy). Verify per Web Modeler version.

  Practical workflow: draft → save (often) → review (via diff / collaboration) → deploy to dev cluster → test → deploy to staging → deploy to prod.

- **Option b) — Wrong.** Lifecycle states exist.

- **Option c) — Partial.** Deploy is distinct.

- **Option d) — Partially correct.** Customisable per tier; basic states standard.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Draft / saved / deployed states; deployment е snapshot.
- **b) 2/10** — wrong; lifecycle exists.
- **c) 5/10** — partial; deploy distinct.
- **d) 6/10** — partially correct; basic states standard.

**Correct Answer:** Web Modeler distinguishes draft / saved / deployed states; deployment is a snapshot per cluster.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "draft / published / deployed", "lifecycle states." Resource lifecycle.

**Въпросът → Solution Framing.** "Lifecycle states" — изпитва се knowledge на Web Modeler resource workflow.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че draft / deployed distinction exists, че deploy е snapshot, че advanced lifecycle varies per tier. Това е знание за Web Modeler resource lifecycle.

---

## Question 52: Managing the Development Process (Weighting: 15%)

**Scenario:** Ops queries Operate's variable filter to find instances where `customerId = "C-789"` across millions of historical instances. They notice the query takes 10+ seconds. They want to understand the performance characteristics.

**What are the performance considerations for variable filtering in Operate?**

- **a)** Variable filters scan the **Elasticsearch / OpenSearch index** that Operate uses as its data store. Performance depends on: (1) **indexing**: by default, variables may not be deeply indexed for filter performance; ES indexes are designed for various queries but cold queries on rare variables can be slow; (2) **dataset size**: more instances = larger index = longer scans for non-selective queries; (3) **selectivity**: a unique customer ID is highly selective (returns 1-few hits) — should be fast; a common value (e.g., `country = "US"`) returns many hits — slower. For frequent queries on specific variables, consider custom indexing / dedicated analytics views. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **b)** All queries are instant — incorrect; performance varies with index design + dataset. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Operate caches all query results — partial; some caching exists but isn't the main performance lever. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Variable filtering isn't supported — incorrect; supported. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/process-instance-summary/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate is backed by Elasticsearch (or OpenSearch). Variable filters scan ES indexes; performance is shaped by:
  - **Index design**: which fields are indexed and how. Variables are stored in a generic schema; deep queries on arbitrary variable values may not benefit from optimal indexing.
  - **Dataset size**: at multi-million instance scale, ES scans become noticeable.
  - **Selectivity**: highly selective filters (e.g., unique customer ID) → fast result; low selectivity (e.g., common attribute) → slow.
  - **Cluster sizing**: more ES nodes / shards → better parallelism for queries.

  Performance optimisation for production-scale Operate:
  - Scale ES cluster appropriately for instance volume.
  - Configure variable-specific indexing if needed.
  - For frequent / known query patterns, use Optimize (which has its own optimised indexing) or a dedicated analytics pipeline.
  - For ad-hoc deep queries on huge datasets, accept some latency or build custom views.

- **Option b) — Wrong.** Performance varies.

- **Option c) — Partial.** Caching helps for repeated queries; not a primary lever.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Performance depends on ES index design, dataset size, query selectivity.
- **b) 1/10** — wrong; not instant.
- **c) 4/10** — partial; caching не primary lever.
- **d) 1/10** — wrong; supported.

**Correct Answer:** Performance depends on ES index design, dataset size, and query selectivity; scale ES, use Optimize for frequent analytics.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "variable filter takes 10 seconds", "millions of instances." Performance question.

**Въпросът → Solution Framing.** "Performance considerations" — изпитва се knowledge на Operate backend architecture.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate uses ES, че query speed depends on index/dataset/selectivity, че Optimize е alternative for analytics. Това е знание за Operate scaling.

---

## Question 53: Managing the Development Process (Weighting: 15%)

**Scenario:** A team prepares a Process Instance Migration plan from `order-v3` to `order-v4`. Before applying it to 500 production instances, they want to **validate the plan** — catch issues like unmapped flow nodes or type mismatches.

**Does Operate support pre-migration validation?**

- **a)** **Yes** — Operate's migration UI (and the REST API) typically supports a **validation step** before applying — checks that all active flow nodes in source instances are mapped, that mapping targets exist in the new model, that variable shapes are compatible. Issues are reported per-instance before any actual migration happens. Best practice: validate on a **small sample** first, fix any issues in the migration plan, then apply to the full set. Documentation: [Process Instance Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **b)** No, validation happens only at migration time — partial; some validation may run only during apply, but pre-validation exists for known cases. Documentation: [Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **c)** Validation isn't supported — incorrect. Documentation: [Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **d)** Migrate then rollback — workable in dev but not for production-scale plans. Documentation: [Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Pre-migration validation is standard for production safety:
  - **Operate UI**: shows the migration plan, source → target mapping; flags issues (unmapped flow nodes, type changes, etc.) before apply.
  - **REST API**: similar — validate-and-report mode before apply mode.
  - **Best practice**:
    1. **Small sample run**: pick a few representative running instances; apply migration to them; verify outcomes.
    2. **Full plan dry-run**: validate the plan against all target instances; report issues.
    3. **Apply with monitoring**: full migration with active monitoring.
    4. **Rollback plan**: have a clear rollback / mitigation path for failures.

  Production migrations are operations to be done carefully; validation prevents many surprises.

- **Option b) — Partial.** Pre-validation exists.

- **Option c) — Wrong.** Supported.

- **Option d) — Workable in dev not prod scale.** Validation prevents the need.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Pre-migration validation + small-sample best practice.
- **b) 5/10** — partial; pre-validation exists.
- **c) 1/10** — wrong; supported.
- **d) 4/10** — workable в dev.

**Correct Answer:** Yes — Operate supports pre-migration validation; best practice = small-sample test first.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "validate migration plan", "before 500 instances." Migration safety.

**Въпросът → Solution Framing.** "Pre-migration validation" — изпитва се knowledge на migration tools.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че pre-validation exists, че small-sample testing е best practice, че rollback plan е prudent. Това е знание за production migration management.

---

## Question 54: Managing the Development Process (Weighting: 15%)

**Scenario:** A team has 1000 User Tasks pending. They want to **bulk-assign** them: half to `alice`, half to `bob`, programmatically via API (not through Tasklist UI manually).

**Which API supports programmatic task assignment?**

- **a)** **Tasklist API (or Orchestration API depending on Camunda 8 version)** — supports task management operations including assign / claim / unclaim / complete. Programmatic assignment: POST or PATCH to `/v1/tasks/{taskId}/assign` (or equivalent) with the assignee. For bulk: iterate via API. Authenticate via OAuth2 client credentials. Documentation: [Tasklist API](https://docs.camunda.io/docs/apis-tools/tasklist-api-rest/) + [Orchestration API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/)

- **b)** Only Tasklist UI manually — incorrect; API supports programmatic. Documentation: [Tasklist API](https://docs.camunda.io/docs/apis-tools/tasklist-api-rest/)

- **c)** Modify BPMN to assign — wrong scope; per-instance assignment is runtime, not model-level. Documentation: [Tasklist API](https://docs.camunda.io/docs/apis-tools/tasklist-api-rest/)

- **d)** Zeebe gRPC for User Tasks — partial; Zeebe API can complete jobs but task-specific API for User Tasks is Tasklist API. Documentation: [Tasklist API](https://docs.camunda.io/docs/apis-tools/tasklist-api-rest/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Tasklist exposes a REST API for programmatic task management. Operations:
  - **Search / query tasks**: filter by candidate group, state, variables, etc.
  - **Claim / unclaim**: assign / release assignee.
  - **Assign / reassign**: explicit assignee change.
  - **Complete**: complete the task with variables.

  For bulk operations: write a script that queries tasks (with filter), then assigns each via API call. Authentication: OAuth2 client credentials.

  Note: in newer Camunda 8 versions, some Tasklist API functionality may consolidate into the **Orchestration Cluster API** (`/v2/...`); verify the current docs.

- **Option b) — Wrong.** API supports.

- **Option c) — Wrong scope.** Runtime per-instance.

- **Option d) — Partial.** Zeebe gRPC for jobs; Tasklist API for User Tasks.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Tasklist API (or Orchestration API) for programmatic task management.
- **b) 1/10** — wrong; API exists.
- **c) 2/10** — wrong scope.
- **d) 5/10** — partial; Tasklist API е the canonical for User Tasks.

**Correct Answer:** Tasklist API (or Orchestration API per version) supports programmatic task assignment.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/tasklist-api-rest/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "bulk-assign tasks", "programmatic via API." Task assignment automation.

**Въпросът → Solution Framing.** "API supports programmatic assignment" — изпитва се knowledge на Tasklist API.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Tasklist API exposes task management, че operations include assign/claim/complete, че iterating handles bulk. Това е знание за Tasklist programmatic access.

---

## Question 55: Managing the Development Process (Weighting: 15%)

**Scenario:** A growing team writes more BPMN diagrams. The team lead wants to establish **naming conventions** — process IDs, task names, event names — so diagrams are consistent and readable. They wonder what conventions are recommended.

**What BPMN naming convention best practices apply?**

- **a)** **Best practices** (general, not Camunda-mandated):
  - **Process ID**: lowercase-kebab-case unique identifier (e.g., `order-fulfillment-v1`); used in deploy and runtime references.
  - **Process Name**: human-readable label (e.g., "Order Fulfillment"); used in documentation.
  - **Task names**: verb + noun (e.g., "Validate Order", "Send Email", "Approve Claim"); describes what the task does.
  - **Event names**: noun describing the event (e.g., "Order Submitted", "Payment Received").
  - **Gateways**: question format (e.g., "Approved?", "VIP Customer?").

  These conventions improve readability and align with BPMN community standards. Camunda doesn't enforce them; teams establish per-organisation guidelines. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** No conventions; modelers pick freely — partial; freedom isn't best practice for team consistency. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **c)** Camunda enforces strict naming — incorrect; conventions are team-defined. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** All identifiers must be in English — partial; common practice but not enforced; local-language conventions also work. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN best practices for naming align around clarity and consistency:
  - **Process IDs** as stable machine-friendly identifiers (used in deploy / API calls / migration plans). Lowercase, hyphens or underscores, no spaces.
  - **Process Names** as human-readable display.
  - **Tasks** as actions (verb-object): "Validate Order" not just "Order."
  - **Events** as states / occurrences (noun): "Payment Received," not "Receive Payment."
  - **Gateways** as questions: "Approved?" or "Inventory available?" — readers immediately know it's a decision point.

  Beyond naming: arrow direction conventions (left-to-right or top-to-bottom), consistent use of pools/lanes, modular subprocesses, and clear documentation comments all improve diagram quality.

  Camunda's Best Practices documentation captures many of these conventions.

- **Option b) — Anti-pattern.** Inconsistency hurts maintainability.

- **Option c) — Wrong.** Conventions are team-defined.

- **Option d) — Partial.** English common but not enforced.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Naming conventions per element type; team-defined alignment.
- **b) 3/10** — anti-pattern.
- **c) 1/10** — wrong; not enforced.
- **d) 5/10** — partial; English common но not enforced.

**Correct Answer:** Best practices: process ID kebab-case, task names verb-object, event names noun, gateway questions.

**Official Documentation Link:** https://docs.camunda.io/docs/components/best-practices/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "naming conventions", "consistent and readable." BPMN naming best practices.

**Въпросът → Solution Framing.** "Conventions apply" — изпитва се knowledge на BPMN best practices.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че naming conventions are team-defined, че verb-object for tasks, че noun for events, че question for gateways. Това е знание за BPMN style.

---

## Question 56: Managing the Development Process (Weighting: 15%)

**Scenario:** Auditors ask for **who-did-what** records on process instances: who started this instance, who completed task X, who modified variables, etc.

**Where does Camunda 8 expose audit / who-did-what records?**

- **a)** Multiple sources: **Operate's instance history** shows operations (start, complete, cancel, modify) and the user who performed them (where authenticated through Camunda's auth). **Cluster audit logs** (where configured) capture authentication events, API calls, and security-relevant operations. For deep audit (Tasklist task completions with assignees), **Tasklist's task history** shows assignment and completion details. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/) + [Identity](https://docs.camunda.io/docs/self-managed/identity/)

- **b)** No audit available — incorrect; multiple sources. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Only via Optimize — Optimize is analytics; specific user actions live in Operate / Tasklist / Identity. Documentation: [Optimize](https://docs.camunda.io/docs/components/optimize/)

- **d)** Build custom audit logging — workable for advanced needs; built-in sources cover basics. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Audit data lives across multiple Camunda 8 components:
  - **Operate's instance history**: shows the timeline of an instance — when each flow node activated / completed / failed, who performed batch operations (cancel, retry, modify), variable changes.
  - **Tasklist's task history**: shows assignee, completion timestamp, completion variables for User Tasks.
  - **Identity / Keycloak logs**: authentication events, role changes.
  - **Cluster API access logs**: API calls (who, what endpoint, when) — typically configured at the cluster gateway / network ingress level.

  For comprehensive audit, aggregate these into a central log store (ELK, Splunk, etc.) and build dashboards. For compliance-heavy use cases, plan for:
  - **Long retention**: Operate's default retention may be too short; configure retention or export to long-term store.
  - **Immutability**: protect audit records from tampering.
  - **Per-instance audit reports**: query by instance for "who touched this."

- **Option b) — Wrong.** Multiple sources.

- **Option c) — Wrong scope.** Optimize is analytics.

- **Option d) — Partial.** Built-in covers basics; custom for advanced.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Operate + Tasklist + Identity + cluster logs combine for audit.
- **b) 1/10** — wrong; multiple sources.
- **c) 3/10** — wrong scope.
- **d) 5/10** — partial; built-in covers basics.

**Correct Answer:** Multiple sources — Operate instance history + Tasklist task history + Identity auth logs + cluster API logs.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "who-did-what audit records." Audit data sources.

**Въпросът → Solution Framing.** "Where exposed audit" — изпитва се knowledge на multi-component audit.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че audit spans Operate + Tasklist + Identity + cluster logs, че aggregation needed for comprehensive view. Това е знание за C8 audit architecture.

---

## Question 57: Managing the Development Process (Weighting: 15%)

**Scenario:** Two modelers open the same BPMN in Web Modeler simultaneously. They want to know how Web Modeler handles **real-time collaboration** — does it use WebSocket / Operational Transforms / CRDT?

**How does Web Modeler implement real-time collaborative editing?**

- **a)** Web Modeler's **collaborative editing** typically uses **WebSocket** for real-time bidirectional communication and a conflict-resolution mechanism (similar to Operational Transforms or CRDTs used in tools like Google Docs). When two modelers edit, changes propagate via WebSocket; the server applies them in order and resolves conflicts. Presence indicators show where each user is editing. The exact mechanism is internal implementation detail; from the modeler's perspective: edits appear in near-real-time, conflicts are merged intelligently. Documentation: [Web Modeler collaboration](https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/)

- **b)** Last-write-wins on save — incorrect; that would lose work. Real collaborative editing merges. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/)

- **c)** First-come-first-served lock — only one editor at a time — incorrect; Web Modeler supports simultaneous editing. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/)

- **d)** Real-time collaboration isn't supported — incorrect; canonical feature. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler implements real-time collaboration similar to modern collaborative editing tools (Google Docs, Figma, etc.). Technical components:
  - **WebSocket**: persistent bidirectional connection between browser and server; low-latency event propagation.
  - **Conflict resolution**: when two edits affect the same element / property, the server applies them in a deterministic order or merges. The exact algorithm (Operational Transforms, CRDT, or custom) is internal to Camunda.
  - **Presence**: see other users' cursors / selections; helps coordinate.
  - **Auto-save**: changes persist as users type / drag, not only on explicit save.

  User experience: edits appear within milliseconds; conflicts are rare and resolved automatically. Modelers can coordinate via the presence cues.

- **Option b) — Wrong.** Last-write-wins would lose work.

- **Option c) — Wrong.** Simultaneous editing supported.

- **Option d) — Wrong.** Canonical feature.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. WebSocket + conflict-resolution + presence; real-time collaborative editing.
- **b) 2/10** — wrong; last-write-wins anti-pattern.
- **c) 2/10** — wrong; simultaneous supported.
- **d) 1/10** — wrong; canonical feature.

**Correct Answer:** WebSocket + conflict-resolution mechanism + presence indicators (similar to Google Docs).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/collaboration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "real-time collaboration", "WebSocket / OT / CRDT." Collaborative editing mechanism.

**Въпросът → Solution Framing.** "How implements" — изпитва се knowledge на Web Modeler collaboration internals.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler uses WebSocket + conflict resolution, че last-write-wins would lose work, че simultaneous editing standard. Това е знание за Web Modeler collaboration architecture.

---

## Question 58: Managing the Development Process (Weighting: 15%)

**Scenario:** An ops team wants to set up **Prometheus / Grafana** monitoring for their Self-Managed Camunda 8 cluster. They want to know which metrics are most important to monitor.

**Which Camunda 8 metrics are typically monitored in production?**

- **a)** Key categories:
  - **Cluster health**: broker liveness/readiness, partition health, replication lag.
  - **Throughput**: process instances started/completed/cancelled per second; jobs activated/completed per second per task type.
  - **Latency**: instance duration percentiles (p50/p95/p99); job activation latency.
  - **Errors**: incident count, gRPC error rates by status code, exporter errors.
  - **Resource utilisation**: CPU, memory, disk, network of broker / Operate / Tasklist / ES.
  - **Connector Runtime**: subscription health, polling success rate (for inbound).

  Camunda components expose Prometheus metrics via `/actuator/prometheus`. Aggregate into Grafana; set alerts on thresholds. Documentation: [Self-Managed monitoring](https://docs.camunda.io/docs/self-managed/) + [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** Only basic up/down — incorrect; rich metrics available. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

- **c)** Build custom metrics from scratch — partial; Camunda components expose standard metrics; custom metrics extend. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

- **d)** Camunda has no metrics — incorrect; Spring Boot Actuator exposure standard. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 components (Zeebe, Operate, Tasklist, Identity, Connector Runtime) are Spring Boot applications exposing standard Prometheus metrics via `/actuator/prometheus` endpoint. Categories worth monitoring:
  - **Cluster health**: are brokers up? Partitions healthy? Replication caught up? ES / opensearch reachable?
  - **Throughput**: how many instances / jobs / messages / decisions per second? Is the system keeping up with load?
  - **Latency**: instance durations? Job activation delays? Time-to-completion percentiles?
  - **Errors**: are incidents accumulating? Are gRPC errors elevated? Are exporters failing?
  - **Resources**: CPU / memory / disk / network usage of each component?
  - **Application-specific**: Connector Runtime subscription / polling health, worker queue depths.

  Set alerts: incidents > N, gRPC error rate > X%, p99 latency > Y seconds, disk usage > 80%, replication lag > Z seconds. Tune to your SLAs.

  Use Camunda's recommended dashboards / Helm charts (where available) as starting templates.

- **Option b) — Wrong.** Rich metrics.

- **Option c) — Partial.** Standard metrics + custom for app-specific.

- **Option d) — Wrong.** Metrics exposed.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple metric categories; cluster health + throughput + latency + errors + resources + Connector specifics.
- **b) 2/10** — wrong; rich metrics.
- **c) 4/10** — partial; standard metrics exist.
- **d) 1/10** — wrong; exposed.

**Correct Answer:** Multiple categories — cluster health, throughput, latency, errors, resources, Connector Runtime; via /actuator/prometheus.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Prometheus / Grafana monitoring", "important metrics." Production monitoring.

**Въпросът → Solution Framing.** "Metrics to monitor" — изпитва се knowledge на Camunda monitoring.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda exposes Prometheus metrics, че categories include health/throughput/latency/errors/resources, че Grafana visualises + alerts on thresholds. Това е знание за production monitoring.

---

## Question 59: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's process refers to orders. The team wonders whether to use Camunda's process instance keys (long integers like `2251799813700123`) or **business identifiers** (like order numbers `ORD-2026-005678`) when communicating with external systems.

**Best practice: use process instance keys or business identifiers in external communications?**

- **a)** **Use business identifiers** (e.g., `ORD-2026-005678`) for external-facing references. Process instance keys are **Camunda internal identifiers** — change across environments (different clusters → different keys for the same logical order), opaque to business users, not meaningful in audits. Business identifiers are stable, meaningful, environment-independent. Store the business identifier as a process variable (e.g., `orderId`); use it in messages, correlation keys, external API calls, customer communications. The process instance key remains useful for Camunda-internal operations (Operate searches, API calls within Camunda). Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** Always use process instance keys externally — incorrect; they're internal. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **c)** Both interchangeably — partial; serve different purposes; use accordingly. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **d)** Avoid identifiers altogether — incorrect; identifiers are essential. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The two ID types serve different purposes:
  - **Process instance key** (Camunda-internal): long integer generated by Zeebe; unique per cluster; not portable across environments / clusters; used in Camunda API calls and internal references.
  - **Business identifier** (your domain): order number, customer ID, transaction reference, etc. Generated by your business logic; meaningful to humans; stable across environments; used in external communications (emails to customers, API calls to partners, audit records).

  Best practice:
  - **Store business identifiers as process variables**: e.g., `orderId = "ORD-2026-005678"` set at instance start.
  - **Use business identifiers in external interactions**: customer emails reference the order number, not the Camunda key.
  - **Use business identifiers as correlation keys**: Message correlation by `orderId` is meaningful and environment-portable.
  - **Use process instance key for Camunda-internal operations**: querying / commanding via API.

  This separation makes the system more maintainable: when you migrate to a new cluster, the business identifiers stay the same; only the internal keys change.

- **Option b) — Wrong.** Internal identifiers.

- **Option c) — Partial.** Different purposes.

- **Option d) — Wrong.** Identifiers essential.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Business identifiers externally; process instance keys internally.
- **b) 3/10** — wrong; internal identifiers.
- **c) 5/10** — partial; different purposes.
- **d) 1/10** — wrong; identifiers essential.

**Correct Answer:** Use business identifiers externally; process instance keys for Camunda-internal operations.

**Official Documentation Link:** https://docs.camunda.io/docs/components/best-practices/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "process instance key vs business identifier", "external communications." Identifier strategy.

**Въпросът → Solution Framing.** "Best practice" — изпитва се knowledge на identifier semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че process instance key е Camunda-internal, че business identifier е stable + meaningful, че separation of concerns matters. Това е знание за identifier management.

---

# Section 8 — Dev Environment Setup (Question 60)

> Weight 1% • Topics: Camunda 8 Run startup scripts across operating systems.

---

## Question 60: Dev Environment Setup (Weighting: 1%)

**Scenario:** A developer downloads **Camunda 8 Run** for local development. They notice the distribution includes `start.bat`, `start.sh`, and possibly other launcher scripts. They wonder which to use on each operating system.

**Which Camunda 8 Run launcher script fits each OS?**

- **a)** **`start.sh`** (Bourne/Bash shell script) for **Linux, macOS, WSL, Git Bash on Windows**. **`start.bat`** (Windows batch) for **Windows native command-line / PowerShell**. Both perform the same logical operations: set environment, start the bundled Camunda 8 components (Zeebe gateway, Operate, Tasklist, Identity, Connectors). Pair with `shutdown.sh` / `shutdown.bat` for graceful stop. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **b)** Both scripts work identically on any OS — incorrect; OS-specific shell syntax. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **c)** Use `start.bat` on all systems — wrong; bash-based environments don't run .bat. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **d)** Camunda 8 Run requires manual command for each component — incorrect; bundled launcher scripts. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Run ships with platform-specific launcher scripts:
  - **`start.sh`** (executable shell script): works on Linux, macOS, WSL (Windows Subsystem for Linux), Git Bash on Windows, and other POSIX-compatible shells. Run with `./start.sh` after `chmod +x start.sh` if needed.
  - **`start.bat`** (Windows batch file): for native Windows Command Prompt / PowerShell. Double-click or run from the prompt.
  - **`shutdown.sh` / `shutdown.bat`**: graceful stop counterparts.

  Both perform the same logical work: set required environment variables (JAVA_HOME if needed, ports, data directory), start the bundled components in proper order (Zeebe, then dependent services), wait for readiness, output URLs for the UIs.

  Practical: on Windows + WSL, prefer `start.sh` inside WSL for Linux-like behaviour. On native Windows for non-developer audiences, `start.bat` is more familiar.

- **Option b) — Wrong.** Shell syntax differs.

- **Option c) — Wrong.** Bash environments don't run .bat.

- **Option d) — Wrong.** Bundled launchers exist.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. start.sh on POSIX shells; start.bat on Windows native.
- **b) 2/10** — wrong; OS-specific syntax.
- **c) 2/10** — wrong; .bat не run-able in bash.
- **d) 1/10** — wrong; launchers bundled.

**Correct Answer:** start.sh for Linux / macOS / WSL / Git Bash; start.bat for Windows native command-line.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "start.bat / start.sh", "different OS launchers." Cross-OS launcher question.

**Въпросът → Solution Framing.** "Which script fits each OS" — изпитва се knowledge на Camunda 8 Run packaging.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че start.sh е POSIX shell, че start.bat е Windows batch, че they perform the same logical work. Това е знание за Camunda 8 Run launcher scripts.

---

# Закриваща секция — Set 9

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

**Препоръка за тренировка (Set 9):**
1. **Open-book проход** — чети всеки 🔍 Explanations + Three-Skills Decomposition; не таймирай.
2. **Closed-book timed run** — 75-минутен таймер; запиши отговорите си; цел: ≥ 39/60.
3. **Анализ на грешки:** за всяка грешка кои от 3-те skills ти липсваше (Diagnostic Comprehension / Solution Framing / Mechanism Knowledge).

**Чести грешки в Set 9 (грешен axis вместо грешен отговор):**
- **Q1 (black-box Pool)** — пътане с inner placeholder activities for external participants; black-box convention preserves "we don't model the customer."
- **Q2 (catch-all without errorCode)** — пътане с invented `*` wildcard syntax; leave errorCode blank.
- **Q5 (no Conditional Start Event в C8)** — C7 reflex trap; externalise via Polling Connector + Message Start.
- **Q6 (Compensation handler dormant until Throw)** — пътане с "runs every completion" or "runs on host failure"; compensation е different from error handling.
- **Q9 (Error Boundary vs Event Subprocess Error Start in subprocess)** — both valid; activity-specific vs subprocess-wide granularity.
- **Q10 (taskDefinition vs Listeners)** — пътане с "same renamed"; entirely different concepts.
- **Q12 (FEEL vs scripts)** — C7 reflex trap; C8 uses only FEEL.
- **Q13 (dueDate vs Timer Boundary)** — пътане с "equivalent"; dueDate е metadata, Timer Boundary е structural auto-cancel.
- **Q20 (per-instance MI subscriptions)** — пътане с "shared subscription" or "broadcast"; per-instance with unique correlation keys.
- **Q22 (Call Activity variable scopes)** — пътане с "same scope" or "all variables auto-propagate"; explicit input/output mappings bridge separate scopes.
- **Q24 (Decision Service exposes curated)** — пътане с invented `private` attribute; Decision Service е the canonical encapsulation.
- **Q29 (no-match behaviour varies by hit policy)** — пътане с "always raises exception" or "always returns null"; depends on policy and default config.
- **Q41 (fetchAllVariables trade-off)** — пътане с "always true"; whitelist preferred for known cases.
- **Q44 (SM Identity = Keycloak)** — пътане с "SaaS only" or "no IdP"; SM has Identity built on Keycloak.
- **Q59 (business identifiers vs process instance keys)** — пътане с "use keys externally"; business IDs are stable + meaningful; keys are Camunda-internal.

**Свежи Set 9 сценарии (distinct от Sets 1-8):**

Modeling: black-box Pool for external participants, catch-all Error Boundary, Sequential vs Parallel MI throughput trade-off, multiple Event Subprocesses for multi-event listening, no Conditional Start Event in C8, compensation handler relationship runtime, Throw vs Catch Message Events, inputCollection + completionCondition compose, Error catching in subprocess (Boundary vs Event Subprocess).

Configuring Processes: zeebe:taskDefinition vs C7 Listeners (different concepts), FEEL temporal in Sequence Flow conditions, no scripts in C8 (FEEL only), dueDate vs Timer Boundary (metadata vs structural), completionCondition with FEEL filter for "3 approvals", Document Handling pre-signed URLs depend on backend, per-field IDP confidence thresholds, Element Template conditional visibility, AI Agent finishReason for truncation detection, Timer Date type for absolute moment, per-instance MI message correlation, Boundary Events on Call Activities, parent-child variable scopes with input/output mappings.

DMN: OUTPUT ORDER (sorted by output value list) vs COLLECT (unordered), Decision Service exposes curated subset, date and time(date, time) two-argument constructor, OMG DMN XML standardisation, BKM with Boxed Function Expression (FEEL lambda), multiple Knowledge Sources via Authority Requirements, no-match behaviour varies by hit policy.

Forms: regex pattern validation for VAT format, data written on task completion, responsive design by default.

Connectors: Microsoft Teams via dedicated or HTTP Connector to Webhook URL, Google Maps Geocoding via HTTP Connector, per-environment cluster secrets, SOAP via HTTP Connector with XML body.

Extensions: FEEL split / boolean comparison workaround / floor/ceiling/round half even / even/odd / before / duration arithmetic / split / string conversions, Spring Zeebe fetchAllVariables trade-off, Node SDK ZBClient setup, zbctl set variables, Camunda Identity built on Keycloak, BPMN-level retries + retryBackoff, Connector Runtime metrics + Operate visibility, RPA DSL (Robot Framework family), gRPC ActivateJobs long-polling.

Managing Dev: Web Modeler draft / saved / deployed states, Operate ES backend performance considerations, pre-migration validation + small-sample testing, Tasklist API for programmatic assignment, naming conventions (kebab-case ID, verb-object task names, etc.), audit across Operate + Tasklist + Identity + cluster logs, Web Modeler WebSocket-based real-time collaboration, Prometheus metrics categories, business identifiers vs process instance keys.

Dev Env: Camunda 8 Run start.sh / start.bat OS-specific launchers.

**Успех на изпита!**
