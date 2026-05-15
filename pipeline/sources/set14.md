# Camunda 8 C8-CP-DV — Mock Exam Set 14

> **Blueprint v8.8.0** • 60 questions • Pass ≥ 65% (39/60) • Time limit 75 minutes
> 
> Fresh scenarios distinct from Sets 1-13.
> Per-question structure: Scenario → 4 detailed options → 🔍 Explanations → Per-option scoring (1-10) → Correct Answer → Official Documentation Link → 🧠 Three-Skills Decomposition (Diagnostic Comprehension / Solution Framing / Mechanism Knowledge).

---

## Table of Contents

| Section | Questions | Weight |
|---------|-----------|--------|
| 1. Modeling | Q1-Q9 (9) | 15% |
| 2. Configuring Processes | Q10-Q22 (13) | 22% |
| 3. DMN | Q23-Q29 (7) | 11% |
| 4. Forms | Q30-Q32 (3) | 5% |
| 5. Connectors | Q33-Q36 (4) | 7% |
| 6. Extensions | Q37-Q50 (14) | 23% |
| 7. Managing Dev | Q51-Q59 (9) | 14% |
| 8. Development Environment | Q60 (1) | 2% |

---

# Section 1 — Modeling (Questions 1-9)

> Weight 15% • Topics: Inclusive vs Parallel Gateway with overlapping conditions, Event Subprocess (non-interrupting) vs Boundary, Conditional Start Event, Receive Task vs Message Catch, Call Activity data passing, Signal scope, Manual Task semantics, Sequence Flow Condition variants, Terminate End Event in subprocess.

---

## Question 1: Modeling (Weighting: 15%)

**Scenario:** A process has 3 outgoing flows from an Inclusive Gateway with conditions: `=amount > 100`, `=amount > 500`, `=customer.type = "VIP"`. For `amount=1000, type="VIP"`, all three conditions are true. The team wonders how Inclusive Gateway handles overlapping matches.

**Inclusive Gateway with all conditions true?**

- **a)** **Inclusive Gateway activates ALL outgoing flows whose conditions evaluate true** (in contrast to XOR which picks exactly one — the first true). For `amount=1000, type="VIP"`: all 3 flows activate; 3 parallel branches start. **Downstream join**: typically uses Inclusive Join Gateway (waits for all activated branches, but NOT all possible branches — only those that activated). **Implication**: model carefully to ensure proper join semantics. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **b)** First true only — wrong; that's XOR. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **c)** Random — wrong. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **d)** Engine errors on overlap — wrong; OR semantics. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Inclusive Gateway (OR) semantics:

  **Activation**:
  - Evaluates ALL outgoing flow conditions independently.
  - Activates every flow whose condition is `true`.
  - All activated flows execute in parallel.

  **For the scenario**:
  - `amount > 100`: true (1000 > 100).
  - `amount > 500`: true (1000 > 500).
  - `customer.type = "VIP"`: true.
  - All 3 branches activate; 3 parallel tokens flow downstream.

  **Comparison with other gateways**:

  | Gateway | Activation |
  |---------|-----------|
  | XOR (Exclusive) | First true flow only; if multiple match → modelling error (or first by document order) |
  | OR (Inclusive) | All true flows |
  | Parallel | All flows unconditionally (no conditions evaluated) |

  **Join semantics**:
  - **Inclusive Join**: waits for tokens from all activated branches — knows which branches activated (from the diverging Inclusive Gateway).
  - **Parallel Join**: waits for tokens from ALL incoming flows — would deadlock if some branches weren't activated.
  - **Best practice**: pair Inclusive diverge with Inclusive join.

  **Default flow**:
  - Inclusive Gateway supports a default flow (per Set 13 Q1).
  - Activates when NO other conditions are true.
  - Without default + no true: process incident (no path).

  **Use cases**:
  - **Multiple notifications**: send email + SMS + push based on user preferences (any combination).
  - **Multiple validations**: run all applicable rules in parallel.
  - **Conditional fan-out**: launch only relevant subprocesses.

  **Anti-pattern**:
  - Using Inclusive when XOR fits: overhead of parallel execution + join coordination.
  - Using XOR when overlap intended: silently drops conditions after first match.

- **Option b) — Wrong.** That's XOR.

- **Option c) — Wrong.**

- **Option d) — Wrong.** OR semantics.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Inclusive Gateway = OR; activates ALL true flows; downstream Inclusive Join waits for activated branches.
- **b) 2/10** — wrong (XOR semantic).
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Inclusive Gateway activates all outgoing flows whose conditions are true — all 3 branches in this scenario; pair with Inclusive Join.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Inclusive Gateway все 3 условия true." Gateway semantic.

**Въпросът → Solution Framing.** "How handles overlapping" — изпитва се knowledge на OR gateway.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че OR activates all true, че XOR picks first, че Parallel activates all unconditionally, че Inclusive Join pairs. Това е знание за Inclusive Gateway.

---

## Question 2: Modeling (Weighting: 15%)

**Scenario:** A long-running process needs to handle "customer cancels" anytime — but **the main flow should continue** while cancellation runs in parallel (e.g., log audit, notify CRM). Team wonders: Event Subprocess (non-interrupting) or Boundary Event.

**Non-interrupting Event Subprocess vs Interrupting Boundary Event?**

- **a)** **Non-interrupting Event Subprocess fits perfectly**:
  - **Triggers** on the configured event (e.g., Cancel Message).
  - **Doesn't interrupt** main flow — both continue in parallel.
  - **Scope** = parent (process or subprocess) where defined.
  - **Boundary Event (non-interrupting)** also possible but attaches to specific activity, not whole scope.
  
  Use **Event Subprocess** when handler applies anywhere in the scope (not bound to one activity); use **Boundary Event** when tied to a specific activity's execution. Documentation: [Event Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/) + [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **b)** Interrupting Boundary — wrong; would stop main flow. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** Both identical — wrong. Documentation: [Event Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

- **d)** Impossible — wrong. Documentation: [Event Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Event handler choices:

  **Non-interrupting Event Subprocess**:
  - **Marker**: dashed circle around event icon at subprocess start.
  - **Triggers**: Message, Signal, Timer, Error, Escalation, etc.
  - **Scope**: defined inside parent process / subprocess; listens for events anywhere in scope.
  - **Multiple firings**: can trigger multiple times if event fires repeatedly.
  - **Main flow continues**: parallel execution.

  **Use case for the scenario**:
  - "Customer cancel" Message: published anywhere during process.
  - Non-interrupting Event Subprocess with Message Start: triggers on cancel; runs log + CRM notify; main flow continues unaffected.

  **Interrupting Event Subprocess**:
  - **Marker**: solid circle around event icon.
  - **Cancels main flow** in scope; only event subprocess runs.
  - For "customer cancel = STOP process": this is the right choice.

  **Boundary Event (non-interrupting)**:
  - **Attached to specific activity** (e.g., a long-running User Task).
  - Triggers only while that activity is active.
  - **Use case**: "while waiting for review, also send reminder Timer."

  **Boundary Event (interrupting)**:
  - **Attached to activity**; cancels it.
  - **Use case**: "if Timer fires, cancel User Task and escalate."

  **Decision matrix**:

  | Pattern | Choice |
  |---------|--------|
  | Handle event anywhere in scope, continue main flow | Non-interrupting Event Subprocess |
  | Handle event anywhere in scope, cancel main flow | Interrupting Event Subprocess |
  | Handle event during specific activity, continue activity | Non-interrupting Boundary |
  | Handle event during specific activity, cancel activity | Interrupting Boundary |

  **Visual cue**:
  - **Dashed border** = non-interrupting (handler doesn't kill main).
  - **Solid border** = interrupting (handler cancels original).

  **Multiple-trigger semantics**:
  - Non-interrupting can fire multiple times if event happens multiple times (e.g., 3 cancellations → 3 audit logs).
  - Each firing spawns a new instance of the event subprocess body.
  - Interrupting fires once (then main is gone).

- **Option b) — Wrong.** Stops main.

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Non-interrupting Event Subprocess = handle event anywhere in scope, main flow continues; dashed border marker.
- **b) 2/10** — wrong.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Non-interrupting Event Subprocess — triggers on event, runs parallel handler, main flow continues; dashed border marker.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "main flow continues + parallel handler." Event handler pattern.

**Въпросът → Solution Framing.** "Event Subprocess vs Boundary" — изпитва се choice of event handler.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че non-interrupting Event Subprocess fits, че Boundary attaches to activity, че dashed = non-interrupting. Това е знание за event handlers.

---

## Question 3: Modeling (Weighting: 15%)

**Scenario:** A process should start automatically when a process variable `=stockLevel < 10` becomes true (e.g., due to inventory data update). Team wonders if BPMN supports condition-triggered process start.

**Conditional Start Event for process activation?**

- **a)** **BPMN supports Conditional Start Event** in standard spec — a process starts when a condition becomes true. **Camunda 8 / Zeebe support**: verify per version; Conditional events historically less commonly supported than Message / Signal / Timer. **Alternative patterns**:
  - **External evaluator** publishes a Message when condition becomes true; process uses Message Start Event.
  - **Timer Start** periodically + condition gate (start anyway, check, end early if not met).
  - **Custom Inbound Connector** monitoring the data source.
  
  Verify Conditional Start availability in your Camunda 8 version; fall back to Message/Signal patterns if unsupported. Documentation: [Start Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-start-events/) + [Conditional Events](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **b)** Always supported — partial; verify. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **c)** Conditional impossible in C8 — overstates. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** Use Timer Start always — partial. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Conditional Start Event vs alternative patterns:

  **BPMN Conditional Event spec**:
  - **Trigger**: when a boolean condition evaluates true (e.g., `stockLevel < 10`).
  - **At what moment**: when the condition transitions from false → true (or when data changes).
  - **Implementation**: requires the engine to monitor data sources / variables.

  **Camunda 8 support**:
  - Conditional events historically less first-class than Message / Signal / Timer.
  - Verify availability + capabilities per Camunda 8 version.
  - May be supported via specific configurations or extensions.

  **Pattern 1: Message Start via external evaluator** (common substitute):
  - **External service** monitors data (e.g., inventory DB triggers, scheduled checks).
  - On condition met: publishes Camunda Message.
  - **Process**: starts via Message Start Event.
  - **Pros**: well-supported; decouples condition logic from BPMN; reusable evaluator.
  - **Cons**: extra component to maintain.

  **Pattern 2: Timer Start + condition gate**:
  - **Process**: timer-cycle Start (e.g., every 5 min).
  - **Gateway after start**: checks condition; if true → continue; if false → end early.
  - **Pros**: simple, no external dependencies.
  - **Cons**: polling — wastes resources when condition rarely true.

  **Pattern 3: Inbound Connector for data source**:
  - Custom Connector watches inventory DB changes.
  - On change: evaluates condition; correlates Message to start process.
  - **Pros**: event-driven; **Cons**: custom build effort.

  **Pattern 4: Signal Start for system-wide events**:
  - System publishes "LOW_STOCK" Signal when condition met.
  - All listeners (including process Start Event) react.
  - **Pros**: 1-to-N fanout; **Cons**: less targeted than Message.

  **Decision matrix**:

  | Need | Pattern |
  |------|---------|
  | True event-driven | Message Start + external evaluator |
  | Simple, low-frequency | Timer Start + gate |
  | System-wide | Signal Start |
  | Native conditional (if supported) | Conditional Start |

  Always verify Camunda 8 version's exact Conditional Event support.

- **Option b) — Partial.** Verify.

- **Option c) — Overstates.**

- **Option d) — Partial.** One pattern.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. BPMN supports Conditional Start; verify C8 support; alternatives via Message/Timer/Signal/Custom Connector.
- **b) 5/10** — partial.
- **c) 3/10** — overstates.
- **d) 4/10** — partial.

**Correct Answer:** Verify Conditional Start support in your C8 version; if unavailable, use Message Start with external evaluator, Timer Start + gate, or custom Inbound Connector.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "auto-start when stockLevel < 10." Conditional trigger.

**Въпросът → Solution Framing.** "Condition-triggered process start" — изпитва се event Start options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Conditional in BPMN spec, че C8 support varies, че Message/Timer/Signal alternatives. Това е знание за Start Event patterns.

---

## Question 4: Modeling (Weighting: 15%)

**Scenario:** A process waits for an asynchronous response from a partner system. The modeler considers **Receive Task** vs **Message Catch Event**. Both seem similar. Team wonders the difference.

**Receive Task vs Message Catch Event?**

- **a)** **Functionally similar; semantic differences**:
  - **Receive Task**: a Task (work-doing element) that waits for a Message. Shows up as an Activity in the model. Some BPMN modelers / engines treat it more like a Task with reception responsibility.
  - **Message Catch Event** (Intermediate Catch with Message marker): an Event (point-in-time occurrence). Shows up as a circle (event) in the model.
  - **In Camunda 8**: typically both supported; Message Catch Event is more common modeling convention; Receive Task represents the same semantic with Task-shaped notation.
  - Visual: Task icon vs Event circle.
  - Implementation typically equivalent under the hood.
  
  Verify per Camunda 8 version; pick whichever fits modelling convention. Documentation: [Receive Task](https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks/) + [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **b)** Completely different semantics — partial. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **c)** Receive Task deprecated — wrong. Documentation: [Receive Task](https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks/)

- **d)** Message Catch always preferred — partial. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Receive Task and Message Catch Event semantics:

  **Receive Task**:
  - **Notation**: Task shape (rounded rectangle) with envelope icon.
  - **Semantic**: an Activity that waits to receive a Message before completing.
  - **BPMN spec**: a Task type; one of standard Task types alongside Service Task, User Task, etc.

  **Message Catch Event** (Intermediate):
  - **Notation**: Event circle (intermediate, double-line) with envelope icon.
  - **Semantic**: an Event that occurs when a Message arrives.
  - **BPMN spec**: an Intermediate Catch Event with Message trigger.

  **Functional equivalence**:
  - Both wait for the same Message.
  - Both correlate via Correlation Key.
  - Both proceed when matching Message arrives.
  - Camunda 8 implements both semantically equivalently typically.

  **Differences in practice**:

  **Modelling convention**:
  - **Receive Task**: emphasises "this is work the process does" — receiving the response is part of the work.
  - **Message Catch Event**: emphasises "an event occurred" — process reacts to outside event.

  **Visual distinction**:
  - Task: larger shape; might fit better in process flow visually.
  - Event: smaller circle; less visual weight.

  **Camunda Modeler / standards**:
  - Camunda's documentation may prefer Message Events as the primary modelling pattern.
  - Receive Task less commonly seen in C8 examples.

  **Boundary Events**:
  - **Message Boundary Event** attaches to an activity (e.g., User Task) — receives Message while activity is active.
  - **Receive Task with Boundary**: less common pattern.

  **Recommendation**:
  - **Default to Message Catch Event**: common, well-supported.
  - **Use Receive Task** if existing model uses it or if Task semantics fit better.

  **Compare with Send Task** (per Set 13 Q7):
  - Send Task: pushes a Message.
  - Receive Task: waits for a Message.
  - Pair for request-response patterns.

  Verify Camunda 8 version's support and recommended pattern.

- **Option b) — Partial.** Similar semantic.

- **Option c) — Wrong.**

- **Option d) — Partial.** Both work.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Receive Task = Task waiting for Message; Message Catch = Event for Message arrival; functionally equivalent; modelling convention differs.
- **b) 4/10** — partial.
- **c) 2/10** — wrong.
- **d) 5/10** — partial.

**Correct Answer:** Receive Task and Message Catch Event are functionally equivalent; differ in notation (Task vs Event) and modelling convention; pick per style preference.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Receive Task vs Message Catch." Element choice.

**Въпросът → Solution Framing.** "Difference" — изпитва се BPMN element distinction.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че functionally equivalent, че notation differs, че convention pick. Това е знание за Receive Task vs Message Catch.

---

## Question 5: Modeling (Weighting: 15%)

**Scenario:** A Call Activity invokes a child process. Parent passes variables; child returns variables. Team wonders how data passing differs between Call Activity and Embedded Subprocess.

**Call Activity data passing vs Embedded Subprocess?**

- **a)** **Different scoping models**:
  - **Embedded Subprocess**: inline in parent; variables shared (per scope rules per Set 13 Q21) — inner can read parent's variables directly; outputs land in parent scope by default.
  - **Call Activity**: separate process instance with its own scope; variables must be **explicitly mapped** in (Input) and out (Output). No automatic sharing.
  - **Mapping configuration**: `<zeebe:input>` and `<zeebe:output>` on Call Activity define what flows in/out.
  - **Pros of Call Activity**: encapsulation, reuse across processes, separate lifecycle.
  - **Pros of Embedded**: simpler data flow, no mapping ceremony, shared scope.
  
  Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/) + [Embedded Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/)

- **b)** Identical data passing — wrong. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **c)** No data passing in Call Activity — wrong. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **d)** Embedded uses mapping too — partial. Documentation: [Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Subprocess composition styles + data flow:

  **Embedded Subprocess**:
  - **Definition**: subprocess inlined in parent process model.
  - **Visual**: rectangle (possibly with [+] expand marker) containing inner elements.
  - **Scope**: inner activities have their own scope, but parent variables visible.
  - **Data flow**:
    - Inner reads parent: no mapping needed (scope inheritance).
    - Inner writes: lands in inner scope (or via Output Mapping to parent scope).
  - **Lifecycle**: same process instance; can't reuse across processes.

  **Call Activity**:
  - **Definition**: refers to a separate process definition by ID.
  - **Visual**: rectangle with thick border, calling-out icon.
  - **Scope**: child process is a separate instance with isolated scope.
  - **Data flow**:
    - **Input Mapping** on Call Activity: declares which parent variables to pass; mapped to child variables.
    - **Output Mapping** on Call Activity: declares which child outputs to pull back; mapped to parent variables.
    - Without mapping: nothing flows; child gets empty variables.
  - **Lifecycle**: separate process instance (visible in Operate as own root); reusable across multiple callers.

  **Configuration example** (Call Activity):
  ```xml
  <bpmn:callActivity id="ProcessOrder">
    <bpmn:extensionElements>
      <zeebe:calledElement processId="order-fulfillment" />
      <zeebe:ioMapping>
        <zeebe:input source="=customer.id" target="customerId"/>
        <zeebe:input source="=orderItems" target="items"/>
        <zeebe:output source="=trackingNumber" target="orderTracking"/>
      </zeebe:ioMapping>
    </bpmn:extensionElements>
  </bpmn:callActivity>
  ```

  **Choose Embedded when**:
  - **One-off composition**: subprocess specific to this process.
  - **Tight coupling acceptable**: parent and inner share data context.
  - **Visual clarity**: showing the inner steps in the diagram is valuable.

  **Choose Call Activity when**:
  - **Reusable subprocess**: invoked from multiple parent processes.
  - **Independent lifecycle**: child should be auditable as own instance.
  - **Encapsulation**: parent shouldn't see child's internal variables.
  - **Versioning**: child evolves separately from parents.

  **Hybrid patterns**:
  - **Call Activity wrapping shared logic**: standard utilities (e.g., "Send Notification" process called from many parents).
  - **Embedded for inline structuring**: visual organisation without reuse.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Partial.** Embedded uses scope inheritance, mapping optional.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Embedded shares scope (inheritance); Call Activity isolated (explicit Input/Output mapping required).
- **b) 1/10** — wrong.
- **c) 2/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** Embedded Subprocess shares scope via inheritance (no mapping needed); Call Activity is isolated, requires explicit Input/Output mapping.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Call Activity vs Embedded data passing." Subprocess composition.

**Въпросът → Solution Framing.** "Data passing differs" — изпитва се knowledge на subprocess scoping.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Embedded inherits scope, че Call Activity isolated + mapping, че pick by reuse/encapsulation. Това е знание за subprocess composition.

---

## Question 6: Modeling (Weighting: 15%)

**Scenario:** A process publishes a `"INVENTORY_UPDATED"` Signal. Team wonders if **all running process instances** receive it, or only specific ones.

**Signal Event scope — broadcast or targeted?**

- **a)** **Signals are broadcast** — every active subscription matching the Signal name receives it. Unlike Messages (which have a Correlation Key for 1-to-1 targeting), Signals fan out to all listeners by name only. **Scope**: cluster-wide by default in Camunda 8 (verify per version). **Use cases**: system-wide notifications, refresh triggers, global state changes. **Vs Message**: Message = targeted (one subscription via correlation); Signal = broadcast (all subscriptions). Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

- **b)** Only one — wrong; broadcast. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

- **c)** Cluster-isolated — partial. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

- **d)** Same as Message — wrong. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Signal vs Message semantics:

  **Signal**:
  - **Identifier**: Signal name (string).
  - **Routing**: broadcast — all active subscriptions with matching name receive.
  - **Use cases**:
    - System-wide notifications: "INVENTORY_UPDATED" → all processes interested refresh stock data.
    - Global state change: "MARKET_CLOSED" → all trading processes pause.
    - Multi-recipient triggers: "EVENT_X" → multiple processes react independently.
  - **No correlation key**: targeting is by name alone.
  - **Many-to-many**: any publisher to any number of subscribers.

  **Message** (compare):
  - **Identifier**: Message name + Correlation Key value.
  - **Routing**: targeted — one subscription matching name AND correlation key.
  - **Use cases**:
    - Order ID → specific order process.
    - Customer ID → specific customer interaction.
    - 1-to-1 conversation.

  **For the scenario** (INVENTORY_UPDATED):
  - **Multiple processes** interested in inventory changes (analytics, restocking, alerts, etc.).
  - **Signal** fits: every interested process gets the notification.
  - Message would require sending to each process individually (with correlation key per process).

  **Scope in Camunda 8**:
  - **Process instance scope**: catch within same process.
  - **Process definition scope**: any instance of a process.
  - **Cluster scope**: typically across all processes in cluster (verify per version).
  - **Cross-cluster**: separate consideration; typically not native Signal.

  **Publishing**:
  - **Via API**: publish signal by name; payload optional.
  - **Via Throw Signal Event** in BPMN: another process publishes during its execution.

  **Catching**:
  - **Signal Start Event**: process starts on signal.
  - **Signal Catch Event (intermediate)**: waits for signal during process.
  - **Signal Boundary Event**: triggered while attached activity is active.

  **Important nuance**:
  - **Signal payload**: can carry variables. Catcher can map.
  - **Multiple catchers at different stages**: all activate.

  **Anti-pattern**:
  - **Signal when Message fits**: causes accidental processing in wrong instances.
  - **Message when Signal fits**: explicit 1-to-N sending instead of 1-to-all.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Signals = broadcast; all matching subscriptions receive; vs Message which is targeted via correlation key.
- **b) 1/10** — wrong.
- **c) 5/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Signals broadcast to all matching subscriptions by name; Messages target specific subscription via correlation key.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Signal all instances or specific." Signal scope.

**Въпросът → Solution Framing.** "Broadcast or targeted" — изпитва се knowledge на Signal semantic.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Signal broadcast by name, че Message targeted by correlation, че pick by use case. Това е знание за Signal events.

---

## Question 7: Modeling (Weighting: 15%)

**Scenario:** A process has a step where a human performs work **outside Camunda** (e.g., physical inspection of a warehouse). No form, no system interaction — just "do it and confirm." Team wonders if this is a Manual Task or User Task.

**Manual Task vs User Task?**

- **a)** **Manual Task** represents work done **without system support** — outside Camunda's workflow tooling. No form, no automated step. The engine doesn't actively manage it (no Tasklist entry necessarily). **User Task** is system-supported work — assignee uses Tasklist, possibly with a form, with claim/complete via UI/API. **Camunda 8 support**: Manual Task is in BPMN spec; verify Camunda 8's specific support — some implementations may treat Manual Tasks as auto-completing pass-throughs (skipped immediately) since there's no human interaction with the engine. Documentation: [Manual Task](https://docs.camunda.io/docs/components/modeler/bpmn/manual-tasks/) + [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** Same as User Task — wrong. Documentation: [Manual Task](https://docs.camunda.io/docs/components/modeler/bpmn/manual-tasks/)

- **c)** Manual not supported — partial; verify. Documentation: [Manual Task](https://docs.camunda.io/docs/components/modeler/bpmn/manual-tasks/)

- **d)** Service Task instead — wrong; not automated. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Task types comparison:

  **Manual Task**:
  - **BPMN spec**: a Task done outside the BPMN engine's control.
  - **Notation**: Task with hand icon.
  - **Semantic**: human work happens outside system; no engine involvement during execution.
  - **In practice**: often used as documentation (showing "here's a manual step" in the diagram) without engine enforcement.
  - **Engine behavior**: depends on implementation:
    - **Auto-complete**: some engines treat as pass-through (instant complete).
    - **Wait for explicit complete**: others wait for API call.

  **User Task**:
  - **BPMN spec**: human work with system interaction.
  - **Notation**: Task with person icon.
  - **Semantic**: assignee uses Tasklist; engine tracks task state.
  - **Engine behavior**: creates task in Tasklist; waits for claim/complete via UI/API.

  **For the scenario** (physical warehouse inspection):
  - If the inspection process should appear in Tasklist with a "Complete" button: **User Task** with minimal/no form — assignee clicks done after physical work.
  - If the inspection happens completely outside Camunda and process should just move forward (Camunda is purely documentation): **Manual Task** (or arguably no element at all — just a sequence flow).

  **Most practical pattern**:
  - **User Task with simple form**: "Confirm inspection complete; signature; date" — engineer-friendly, auditable.
  - Manual Task: rare in modern Camunda 8 due to lack of engine integration for tracking.

  **Camunda 8 implementation specifics**:
  - Verify per version: some implementations may not support Manual Task as a wait state — treat as pass-through.
  - **If using Manual Task**: test behavior in your version.

  **Alternative**: use Service Task with auto-complete worker that "represents" the manual step's completion via external trigger (e.g., REST call from inspector's mobile app).

  **Best practice**:
  - **For human work tracked by Camunda**: User Task (with minimal form if needed).
  - **For pure documentation**: Manual Task or annotations.
  - **For external automation**: Service Task with appropriate trigger.

- **Option b) — Wrong.**

- **Option c) — Partial.** Verify.

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Manual Task = outside system support; User Task = system-managed via Tasklist; verify Manual Task behavior in C8 version.
- **b) 1/10** — wrong.
- **c) 5/10** — partial.
- **d) 2/10** — wrong.

**Correct Answer:** Manual Task represents work outside engine; User Task is system-managed via Tasklist; for trackable human work, User Task preferred.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/manual-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "physical inspection no form no system." Manual vs User Task.

**Въпросът → Solution Framing.** "Manual Task or User Task" — изпитва се Task type semantic.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Manual = outside engine, че User = Tasklist-managed, че pick per tracking need. Това е знание за Manual vs User Task.

---

## Question 8: Modeling (Weighting: 15%)

**Scenario:** A Sequence Flow has a condition `=amount > 100` set as the flow's `conditionExpression`. The modeler sees the visual has a small diamond marker on the flow line. Team wonders if the marker affects behavior or is just visual.

**Conditional Sequence Flow — diamond marker meaning?**

- **a)** **The diamond marker visually indicates a conditional flow** — flows with `conditionExpression` typically render with a marker (small diamond at the start) per BPMN notation. **Behaviorally**: the engine evaluates the condition at the upstream element; if true, flow activates. The marker is **notational, not behavioral** — engine evaluates conditions regardless of marker rendering. **Where it appears**: typically on flows leaving Activities (acting as implicit conditional fork) or Inclusive Gateways. **For XOR Gateway**: conditions standard but markers often omitted at gateway-leaving flows since the gateway itself indicates conditional semantics. Documentation: [Sequence Flows](https://docs.camunda.io/docs/components/modeler/bpmn/) + [BPMN Notation](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **b)** Marker required for evaluation — wrong; marker is visual. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **c)** Marker means default flow — wrong; default has slash. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** Marker disables condition — wrong. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN Sequence Flow notation:

  **Conditional flow marker (diamond at flow start)**:
  - **Visual**: small unfilled diamond at the source-end of the sequence flow line.
  - **Meaning**: this flow has a `conditionExpression` attached.
  - **Where used**: typically on flows leaving Activities (where the Activity acts as an implicit decision point) or Inclusive Gateways.
  - **Behaviorally**: the engine evaluates the condition regardless of marker rendering. The marker is for human readers of the diagram.

  **Default flow marker (slash)**:
  - **Visual**: short slash near the start of the flow line.
  - **Meaning**: this flow is the default — activates when no other conditions are true.
  - **Where used**: leaving XOR or Inclusive Gateway (or Activity with multiple outgoing conditional flows).

  **Unmarked flow**:
  - **Visual**: plain line, no marker.
  - **Meaning**: unconditional flow (always activates if upstream element completes).

  **At gateways**:
  - **XOR Gateway**: outgoing flows typically have conditions; markers often omitted since gateway shape itself signals decision.
  - **Inclusive Gateway**: similar; conditions evaluated; markers may or may not render.
  - **Parallel Gateway**: outgoing flows unconditional; no markers expected.

  **Conditional flow from Activity**:
  - **Visual**: Activity with multiple outgoing flows, some with diamond markers.
  - **Behaviorally**: Activity acts as implicit XOR / OR decider — engine evaluates conditions on outgoing flows.
  - **Modelling practice**: often clearer to use explicit Gateway for branching; conditional-flow-from-activity is BPMN-legal but less common.

  **Reading a BPMN diagram**:
  - **Diamond at flow start**: "this flow has a condition; checked before activation."
  - **Slash**: "default fallback flow."
  - **No marker**: "unconditional flow."

  **Modelling tip**:
  - **Be explicit**: use Gateway elements for clarity of decision points.
  - **Conditional flows from Activities**: acceptable but less self-documenting.
  - **Always have a default**: avoid "no path" Incidents when no condition is true.

- **Option b) — Wrong.** Visual.

- **Option c) — Wrong.** Default has slash.

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Diamond = visual marker for conditional flow; engine evaluates condition regardless; default flow has slash marker.
- **b) 1/10** — wrong.
- **c) 2/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** The diamond is visual notation indicating the flow has a condition; engine evaluates the condition regardless of marker rendering.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "diamond marker on flow." BPMN notation.

**Въпросът → Solution Framing.** "Marker meaning" — изпитва се BPMN notation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че diamond = conditional, че slash = default, че plain = unconditional. Това е знание за BPMN flow notation.

---

## Question 9: Modeling (Weighting: 15%)

**Scenario:** An embedded subprocess has multiple inner branches. One branch reaches a **Terminate End Event**. Team wonders if this terminates the entire process instance or just the subprocess.

**Terminate End Event scope in subprocess?**

- **a)** **Terminate End Event scope = enclosing subprocess only** (not the entire process instance). When triggered, it cancels all other active flows in that subprocess; subprocess completes (as if normally ending); parent process continues from the subprocess. **For full-process termination**: a Terminate End Event at the **process root level** terminates the whole instance. **Use cases**: "early exit" from a parallel branch within a subprocess when one branch's outcome makes others moot. Documentation: [End Events](https://docs.camunda.io/docs/components/modeler/bpmn/end-events/) + [Terminate](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **b)** Always terminates whole process — wrong. Documentation: [End Events](https://docs.camunda.io/docs/components/modeler/bpmn/end-events/)

- **c)** Terminates parent and child — wrong. Documentation: [End Events](https://docs.camunda.io/docs/components/modeler/bpmn/end-events/)

- **d)** Identical to normal End — wrong. Documentation: [End Events](https://docs.camunda.io/docs/components/modeler/bpmn/end-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Terminate End Event scope:

  **Terminate End Event**:
  - **Notation**: end event circle with filled black dot inside.
  - **Semantic**: terminates ALL active flows in the **enclosing scope** when reached.
  - **Scope** = the parent subprocess or process root containing the Terminate End Event.

  **In an embedded subprocess**:
  - Terminate inside subprocess: cancels all other active branches in this subprocess.
  - Subprocess then exits normally (no error / no exception).
  - **Parent flow continues** — the subprocess is just one element in the parent's flow.

  **At process root level**:
  - Terminate at root: cancels entire process instance.
  - All active branches at any scope level cancelled.
  - Process instance terminates.

  **Comparison with Normal End Event**:
  - **Normal End**: only the current branch ends; other parallel branches continue.
  - **Terminate End**: all branches in scope end.

  **Comparison with other End Events**:

  | Type | Effect |
  |------|--------|
  | None End | Current branch ends; parallel branches continue |
  | Terminate End | All branches in enclosing scope end |
  | Error End | Throws BPMN error; caught by Error Boundary / Event Subprocess |
  | Escalation End | Throws escalation event |
  | Signal End | Publishes signal to all matching subscriptions |
  | Message End | Publishes message |
  | Cancel End | Triggers compensation (within Transaction Subprocess) |

  **For the scenario**:
  - Embedded subprocess with parallel branches.
  - One branch reaches Terminate End Event.
  - Other active branches in subprocess: cancelled.
  - Subprocess: completes (normal exit).
  - Parent flow: continues after subprocess.

  **Use cases**:
  - **First-of-many wins**: parallel branches racing; first to complete a goal terminates the others (e.g., "first approver to respond cancels other approval requests").
  - **Early termination on critical event**: one branch detects a fatal condition; ends subprocess immediately.
  - **Cleanup-on-success**: one branch completes the goal; others (running diagnostics, retries, etc.) can stop.

  **At root**:
  - **Hard abort**: e.g., "fraud detected, cancel everything."
  - **Use sparingly**: like an exception bailout; avoid for routine flow control.

  **In Call Activity**:
  - **Terminate in called process**: ends called process; parent's Call Activity completes normally.
  - **To propagate to parent**: use Error End Event in called process with matching Error Boundary on Call Activity in parent.

  **Modeling tip**:
  - **Terminate is a hammer**: useful when needed; overuse complicates audit.
  - **Compare with Cancel End** (Transaction subprocess only): Cancel triggers compensation; Terminate just stops.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Terminate scope = enclosing subprocess; cancels other branches in scope; parent continues; root-level Terminate ends whole process.
- **b) 2/10** — wrong.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Terminate End Event ends all active flows in the enclosing scope (subprocess) only; parent continues; at root level it would terminate the whole instance.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/end-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Terminate End in subprocess." Terminate scope.

**Въпросът → Solution Framing.** "Entire process or subprocess" — изпитва се knowledge на Terminate scope.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Terminate scope = enclosing subprocess, че root-level kills whole instance, че differs from Normal End. Това е знание за Terminate End Event.

---

# Section 2 — Configuring Processes (Questions 10-22)

> Weight 22% • Topics: Retries vs activation timeout interaction, Input Mapping evaluation order, MI empty collection, late-arriving message buffering, document attachment, Element Template inheritance, AI Agent prompt templates, ISO 8601 timer precision, migration variable mapping, worker concurrency, Boundary Compensation, correlation conflicts, User Task assignment precedence.

---

## Question 10: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task has `retries=3` and `activationTimeout=5min`. Worker takes 6 min per attempt. Team wonders how retries and activation timeout interact in this case.

**Retries vs activation timeout interaction?**

- **a)** **Independent mechanisms**:
  - **Activation timeout**: 5 min. Worker doesn't respond → broker re-activates job (per Set 13 Q10). Doesn't decrement retries — activation timeout is a "stale activation" mechanism, not failure.
  - **Retries**: decrement on `job.fail()` (worker reports failure). Activation timeout doesn't count.
  - **Scenario**: worker takes 6 min — broker re-activates at 5 min; another worker (or same) picks up. Both may run concurrently. Whichever calls `job.complete()` first wins. **Retries unchanged** (no failure reported).
  
  **Mitigation**: right-size activation timeout to actual worst-case + buffer. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Each timeout decrements retries — wrong. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Retries always exhaust first — wrong. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Same mechanism — wrong. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Retries and activation timeout are orthogonal:

  **Activation timeout** (per-activation):
  - Set when worker activates the job; deadline = now + timeout.
  - If worker doesn't `complete` / `fail` / `throwError` by deadline: activation expires.
  - Broker considers job re-activatable; another worker (or same) can pick up.
  - **Retries: unchanged** by activation timeout — it's not a "failure," just a "no response."

  **Retries** (job-level counter):
  - Set in BPMN (e.g., `retries=3`).
  - Decrement on `job.fail()` calls.
  - At 0: Incident; process pauses.

  **Scenario analysis**:
  - **t=0**: Worker A activates job; timeout = 5 min from now.
  - **t=5min**: Worker A still working; activation expires. Retries still = 3.
  - **t=5min**: Worker B (or A re-polling) activates same job; new timeout = 5 min.
  - **t=6min**: Worker A finishes; calls `job.complete()`. Broker accepts (or rejects if another already completed; depends on implementation).
  - **If duplicate completes are rejected**: harmless duplicate work; idempotency mitigates.
  - **If duplicate completes accepted**: process advances; subsequent attempts to complete fail silently or with error log.

  **Worst-case scenarios**:

  **Scenario A: Worker eventually completes within retry budget**:
  - Activation timeouts may fire multiple times.
  - Each re-activation runs the worker code again.
  - **Concurrent executions**: multiple workers may run simultaneously.
  - **Duplicate side effects**: non-idempotent workers cause bugs.

  **Scenario B: Worker keeps failing fast**:
  - Each failure decrements retries.
  - 3 failures → Incident.
  - **Slow worker scenario distinct**: failures cause retry decrement; timeouts don't.

  **Mitigations**:
  - **Right-size activation timeout**: match worst-case worker duration + buffer (e.g., P99 + 50%).
  - **Idempotent workers**: design code so duplicate execution is safe.
  - **Monitor activation timeout events**: high rate signals undersized timeout or slow workers.

  **Best practices**:
  - Workers that take > 5 min should explicitly set longer activation timeout.
  - Monitor job processing time distribution; tune accordingly.
  - Pair with chaos testing: ensure idempotency holds under concurrent execution.

  **Important distinction**:
  - **Retries** = "how many failed attempts before giving up."
  - **Activation timeout** = "how long broker waits before re-offering."
  - Don't conflate; tune separately.

- **Option b) — Wrong.** Timeout != failure.

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Independent: timeout = re-offering, retries = failure counter; slow worker may cause concurrent execution without decrementing retries.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Retries and activation timeout are independent: timeout triggers re-activation (no retry decrement); retries decrement only on `job.fail()`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "retries=3, timeout=5min, worker 6min." Retries / timeout interaction.

**Въпросът → Solution Framing.** "Interaction" — изпитва се knowledge на retry semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че independent mechanisms, че timeout = re-offering, че retries on fail only. Това е знание за retry vs timeout.

---

## Question 11: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task has 3 Input Mappings: `Source=A → Target=x`, `Source=B+x → Target=y`, `Source=x*2 → Target=z`. Team wonders if mappings can reference earlier mappings' results.

**Input Mapping evaluation order + cross-references?**

- **a)** **Input Mappings evaluate in declaration order; later mappings can reference earlier ones' targets** as variables in their source expressions. For the scenario:
  - Mapping 1: `x = A`.
  - Mapping 2: `y = B + x` (uses x from Mapping 1).
  - Mapping 3: `z = x * 2` (uses x from Mapping 1).
  - All three available in the task scope.
  
  Verify exact ordering semantics per Camunda 8 version; some engines may evaluate all in parallel based on parent scope only (no cross-mapping reference). Documentation: [Variables Mapping](https://docs.camunda.io/docs/components/concepts/variables/)

- **b)** Parallel evaluation, no cross-ref — partial; verify. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Last wins — wrong. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Cross-ref impossible — wrong. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Input Mapping evaluation semantics (verify per Camunda 8 version):

  **Typical behavior**:
  - **Order**: mappings evaluate in declaration order (top to bottom in XML / property panel).
  - **Cross-reference**: each mapping's source expression can reference previously-evaluated mappings' targets.
  - **Initial state**: starts with parent scope variables; each mapping adds to task-local scope.

  **Example breakdown**:

  Initial parent scope: `{A: 5, B: 10}`.

  After Mapping 1 (`x = A`):
  - Task scope: `{A: 5, B: 10, x: 5}`.

  After Mapping 2 (`y = B + x`):
  - Source `B + x` = 10 + 5 = 15.
  - Task scope: `{..., y: 15}`.

  After Mapping 3 (`z = x * 2`):
  - Source `x * 2` = 5 * 2 = 10.
  - Task scope: `{..., z: 10}`.

  Final job variables: `{A: 5, B: 10, x: 5, y: 15, z: 10}` (or just task-local additions, depending on scope).

  **Use cases for cross-references**:
  - **Step-by-step derivation**: compute intermediate values used in later mappings.
  - **DRY**: extract common subexpressions.
  - **Clarity**: complex calculations broken into named steps.

  **Caveats** (verify per version):
  - Some engines may not support cross-mapping references — evaluate all from parent scope only.
  - In that case, each mapping computes independently.
  - **Test in your version**: confirm exact behavior.

  **Defensive pattern** (engine-agnostic):
  - **Compute all in one big FEEL expression**: `=number(A) + number(B)` in one mapping for the derived target.
  - Or use a `context` boxed expression to compute multiple at once.

  **Output Mappings**: similar order semantics typically; verify per version.

  **Mapping with FEEL functions**:
  ```
  Mapping 1: total = sum(items.amount)
  Mapping 2: avg = total / count(items)
  Mapping 3: bonus = if avg > 100 then avg * 0.1 else 0
  ```
  Each builds on previous.

  **Anti-pattern**:
  - **Circular references**: Mapping 1 references Mapping 2's target → undefined (Mapping 2 not yet evaluated).
  - **Always reference earlier mappings only** in declaration order.

  **Inspect in Operate**:
  - Operate shows job variables after Input Mapping applied.
  - Useful for verifying mapping behavior in dev.

- **Option b) — Partial.** Verify.

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Mappings evaluate in declaration order; later can reference earlier targets; verify per C8 version.
- **b) 5/10** — partial.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Mappings evaluate in declaration order; later mappings can reference earlier targets — verify exact semantics per Camunda 8 version.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "3 mappings cross-ref." Mapping order.

**Въпросът → Solution Framing.** "Reference earlier mappings" — изпитва се mapping evaluation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че declaration order, че cross-reference typical, че verify per version. Това е знание за Input Mapping order.

---

## Question 12: Configuring Processes (Weighting: 22%)

**Scenario:** A Multi-Instance subprocess has `inputCollection = items`. Items is empty `[]`. Team wonders what happens at MI activation.

**MI with empty collection behavior?**

- **a)** **Standard behavior**: MI activates and immediately completes — no inner instances spawn (zero iterations). Process flow proceeds past MI as if no work happened. **No error**, no incident. **Output**: `outputCollection` (if configured) is empty `[]`. **Implication**: design downstream logic to handle empty results (e.g., "if items processed > 0 then ..."). **For "must have items" semantic**: add Gateway BEFORE MI that checks `count(items) > 0`; route differently or fail. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Process fails — wrong; no incident. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Waits indefinitely — wrong. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Creates one default instance — wrong. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** MI empty-collection semantic:

  **Standard behavior** (per BPMN spec + Camunda):
  - MI activates; engine evaluates `inputCollection`.
  - Collection is empty: zero instances to spawn.
  - MI immediately "completes" (with no work done).
  - Flow proceeds past MI to next element.
  - `outputCollection` (if configured): empty list `[]`.

  **No error / no incident**:
  - Engine treats "zero items" as valid input; just nothing to iterate.
  - Process flow unaffected; continues.

  **Common pitfalls**:

  **Pitfall 1: Downstream assumes non-empty results**:
  - Downstream task references `outputCollection[1]` or similar → null/error.
  - **Fix**: handle empty case with Gateway after MI.

  **Pitfall 2: Treating MI as validation**:
  - Modeler thinks "MI fails if no items" → wrong; MI accepts empty.
  - **Fix**: add explicit check before MI.

  **Defensive pattern**:
  ```
  [Compute items] → [XOR Gateway: count(items) > 0?]
                          ├─ Yes → [MI Subprocess] → [Process results]
                          └─ No  → [Handle empty case]
  ```

  **Alternative**: in MI, use Output Mapping to set a flag indicating if any iterations ran:
  ```
  outputCollection: results
  outputElement: =result
  ```
  After MI: `=count(results) > 0` check.

  **MI for "process all customers" pattern**:
  - If `customers` is empty: no error; MI completes; process continues.
  - Downstream may need to differentiate "no customers" vs "all customers processed."

  **Combine with completionCondition** (per Set 13 Q13):
  - With empty collection: no iterations; completionCondition irrelevant (no iteration completions to evaluate).
  - MI completes immediately.

  **Sequential vs Parallel** (both behave the same on empty):
  - Sequential: no instance starts; complete.
  - Parallel: no instances spawn; complete.

  **Best practices**:
  - **Validate collection upstream**: check size before MI if "non-empty" is a precondition.
  - **Handle empty in downstream**: don't assume results.
  - **Document the semantic**: tell consumers that "empty input = no-op."

  **Edge case: null collection**:
  - **`inputCollection = null`**: typically causes Incident (can't iterate null).
  - **Defensive FEEL**: `=if items != null then items else []` → handles null gracefully.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Empty collection: 0 instances; MI completes immediately; flow proceeds; design downstream to handle.
- **b) 2/10** — wrong.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Empty `inputCollection` = zero iterations; MI completes immediately; flow continues; design downstream logic accordingly.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "empty collection MI." Empty MI semantic.

**Въпросът → Solution Framing.** "What happens" — изпитва се MI empty behavior.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че 0 iterations, че MI completes, че handle downstream. Това е знание за MI empty collection.

---

## Question 13: Configuring Processes (Weighting: 22%)

**Scenario:** A process publishes a Message correlated by `orderId=O-100` BEFORE another process instance subscribes (race condition). Team wonders if Message is lost or buffered.

**Late-arriving subscription + message buffering?**

- **a)** **Camunda 8 typically supports Message buffering** via the **message TTL** (time-to-live):
  - **Published with TTL > 0**: stored for the duration; arriving subscription within TTL correlates.
  - **Published with TTL = 0**: immediate correlation only; lost if no active subscription.
  - **TTL configurable** per publish; defaults vary (verify per version).
  
  For the scenario: configure TTL so message awaits the subscriber. **Race-condition mitigation pattern**: design publishers to wait for confirmation that subscriber is ready OR use sufficient TTL to cover expected subscription latency. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/) + [Message Correlation](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

- **b)** Always lost — wrong. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **c)** Buffered indefinitely — wrong; TTL bounds it. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **d)** Auto-retried — wrong. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Message buffering via TTL:

  **Publish API** (typical):
  - **Message name + correlation key**: identifies subscription.
  - **TTL (time-to-live)**: duration (e.g., "PT5M" for 5 min) the message persists.
  - **Variables**: payload.

  **Correlation logic**:
  - **Active subscription matching name + key exists**: immediate correlation; subscription consumed.
  - **No matching subscription yet**:
    - **TTL > 0**: message persists for TTL duration; subscriptions arriving within window correlate.
    - **TTL = 0**: message discarded if no subscription at publish time.

  **TTL semantics**:
  - **Lifecycle**:
    1. Publish at time T with TTL=5min.
    2. Message stored.
    3. Subscriber at T+2min: correlates; message consumed.
    4. (Or) No subscriber by T+5min: message expires; deleted.

  **For the race condition**:
  - **Pattern 1: Adequate TTL**: estimate worst-case subscription latency; set TTL > that.
  - **Pattern 2: Confirm-before-publish**: publisher waits for "ready" signal from subscriber side.
  - **Pattern 3: Idempotent retry from publisher**: re-publish if no acknowledgement.

  **TTL trade-offs**:
  - **Long TTL**: forgiving of race; messages accumulate if no consumers → storage growth.
  - **Short TTL**: low storage; risk of lost messages.

  **Multiple subscriptions same key**:
  - First subscription consumes the message.
  - Second arrives later: no message (already consumed).
  - **For broadcast-like semantic**: use Signal instead (per Set 14 Q6).

  **Message buffer storage**:
  - Persisted in Zeebe state.
  - Counts toward cluster resource usage.
  - Monitor: backlog of unmatched messages may indicate misconfigured TTL or wrong correlation keys.

  **Best practices**:
  - **Default to reasonable TTL** (e.g., 1-5 min) for forgiving race conditions.
  - **For critical messages**: ensure subscriber active before publish (orchestration).
  - **Idempotent publishers**: re-publish on uncertainty (Camunda dedup based on (name, key) — verify).
  - **Monitor buffered messages**: alert on growing backlog.

  **API call**:
  ```
  POST /messages
  {
    "name": "ORDER_CONFIRMED",
    "correlationKey": "O-100",
    "timeToLive": "PT5M",
    "variables": {...}
  }
  ```

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Camunda buffers messages per TTL; arriving subscription within window correlates; TTL=0 = immediate-or-lost.
- **b) 1/10** — wrong.
- **c) 2/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Messages buffer for their TTL (time-to-live); arriving subscription within window correlates; configure TTL > expected subscription latency.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/messages/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "publish BEFORE subscribe race." Message buffering.

**Въпросът → Solution Framing.** "Lost or buffered" — изпитва се knowledge на TTL.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че TTL buffers, че TTL=0 immediate, че race mitigation patterns. Това е знание за message TTL.

---

## Question 14: Configuring Processes (Weighting: 22%)

**Scenario:** A User Task needs to display an **attached PDF document** to the assignee — invoice for review. Team wonders how to attach documents to User Tasks in Tasklist.

**Document attachment to User Task?**

- **a)** **Camunda 8 Document Handling integration**:
  - **Upstream**: process uploads / receives PDF; document reference stored as process variable (e.g., `invoiceDocRef`).
  - **In Form**: use a Document component (or similar) bound to the document variable; Tasklist renders preview / download.
  - **Form-less Tasklist** (verify): may show document refs in variable list; download via link.
  - **Custom Tasklist**: fetch document via Document API; render inline (PDF.js, etc.).
  
  Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/) + [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **b)** Documents can't attach — wrong. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **c)** External link only — partial. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **d)** Embed in process variable — partial; not ideal for binary. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Document attachment patterns:

  **Lifecycle**:
  1. **Upload**: process or external system uploads document via Document API; returns document reference (ID, URL, metadata).
  2. **Store reference**: in process variable: `invoiceDoc = {id: "doc-123", contentType: "application/pdf", ...}`.
  3. **Pass to User Task**: variable visible in task scope.
  4. **Render**: Form component or Tasklist UI displays document.

  **Document API features** (verify per version):
  - **Upload**: POST with binary; returns reference.
  - **Download**: GET by ID; streams binary.
  - **Metadata**: filename, content type, size, expiry.
  - **TTL**: configurable expiration.

  **Form component for documents**:
  - **Specific Document component** in Forms (if available in version):
    - Renders preview (PDF inline, image inline).
    - Provides download button.
    - Bound to document reference variable.
  - **Fallback**: link/URL field showing download link.

  **Custom Tasklist UI**:
  - Fetch task → see document variable.
  - Call Document API to fetch binary.
  - Render: PDF.js for PDFs, `<img>` for images, generic download for others.

  **Best practices**:
  - **Store references, not binaries**: don't put base64-encoded binary in process variables (storage explosion).
  - **TTL management**: documents linger; clean up.
  - **Access control**: ensure document API auth allows task assignee to read.
  - **Caching**: download once, render multiple times.

  **Pattern: Multi-doc review**:
  - Process variable: `docs = [{id: "d1"}, {id: "d2"}, {id: "d3"}]`.
  - Form: list component showing each doc with preview/download.
  - Assignee reviews multiple; completes task.

  **Pattern: Upload during task**:
  - User Task with form containing file upload component.
  - Form upload → Camunda Document API → process variable.
  - Downstream tasks reference uploaded doc.

  **Security considerations**:
  - **Document access**: assignee should only access docs in their task scope.
  - **Sensitive content**: encryption at rest; HTTPS in transit.
  - **Audit**: log who accessed which document when.

  **External storage alternative**:
  - Documents in S3 / SharePoint / DMS.
  - Process stores URL or reference.
  - Tasklist renders link (download requires user's external auth).

  Verify Camunda 8 / Forms version's exact document component support.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Partial.** Bad pattern for binaries.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Use Document Handling API + Form Document component (or custom Tasklist) for attached documents.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 3/10** — partial.

**Correct Answer:** Use Camunda Document Handling API: upload → store reference in variable → render via Form Document component or custom Tasklist UI.

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/document-handling/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "PDF invoice attach to User Task." Document attachment.

**Въпросът → Solution Framing.** "Attach documents" — изпитва се knowledge на Document Handling integration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Document API + Form component, че references not binaries, че TTL + access control. Това е знание за document attachment.

---

## Question 15: Configuring Processes (Weighting: 22%)

**Scenario:** A team has 20 BPMN models using a "Send Slack Notification" pattern. They built a custom Element Template. New Slack-API version requires updating all 20 models. Team wonders if Element Template changes propagate automatically.

**Element Template inheritance / update propagation?**

- **a)** **Element Templates are typically applied at modelling time** — the template's configuration is baked into the BPMN XML when the template is applied to an element. **Updates to the template** don't auto-propagate to existing BPMN files; modelers need to **re-apply** the updated template to elements OR edit BPMN manually. **Versioning patterns**:
  - **Template `version` field**: increment when changing; some modelers detect version mismatch.
  - **Bulk re-apply**: tooling / scripts to update all BPMN files using the template.
  - **Backward compatibility**: design templates to support old + new formats during transition.
  
  Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/web-modeler/element-templates/)

- **b)** Auto-propagate — wrong typically. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/web-modeler/element-templates/)

- **c)** Templates immutable — partial. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/web-modeler/element-templates/)

- **d)** Templates can't change — wrong. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/web-modeler/element-templates/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Element Template propagation model:

  **Apply-time baking**:
  - Modeler selects template; modeler applies to BPMN element.
  - Template's configuration is **inlined into the BPMN XML**:
    - Properties set.
    - Bindings created (zeebe:taskHeader, zeebe:input, etc.).
    - Default values populated.
  - Template metadata (`modelerTemplate`, `modelerTemplateVersion`) noted on the element.

  **Decoupling after apply**:
  - BPMN XML self-contained: doesn't reference the template at runtime.
  - Engine executes based on BPMN XML, not template.

  **Implications**:
  - **Template updated**: existing BPMN files unchanged (still using old config).
  - **Modeler reopens existing file**: may see "template has newer version" prompt (depends on Web Modeler version).
  - **Re-apply**: explicit action to update element to new template version.

  **Update propagation patterns**:

  **Pattern 1: Manual re-apply**:
  - Modeler opens each BPMN file.
  - Selects element using template.
  - Right-click → "Update template" or similar action.
  - Template config refreshed; modeler may need to re-set custom values.

  **Pattern 2: Bulk update tooling**:
  - **Script** parses BPMN files; finds elements with old template version; updates programmatically.
  - Re-deploys updated BPMN models.
  - **Tools**: custom scripts, bpmn-js manipulation, etc.
  - **Caution**: review changes; test thoroughly.

  **Pattern 3: Versioned template names**:
  - Old template: `slack-notification-v1`.
  - New template: `slack-notification-v2`.
  - Coexist; new BPMN files use v2; old files use v1 unchanged.
  - Migrate gradually.

  **Pattern 4: Backward-compatible template**:
  - Template supports both old and new Slack API formats.
  - Conditional logic in mapping: if user sets new field, use new API; else fallback to old.
  - Single template covers both; minimal disruption.

  **For the scenario**:
  - **20 BPMN files need updating**: 
    - **Option 1**: manual re-apply (20 modeler edits).
    - **Option 2**: script to bulk-update template usages.
    - **Option 3**: backward-compatible template (no BPMN edits needed).

  **Best practices**:
  - **Bump template version** on every change.
  - **Document changes**: changelog for template versions.
  - **Test new template version**: dev / staging before broad propagation.
  - **Coordinate migration**: avoid surprise updates breaking running processes.

  **Versioning fields** in template JSON:
  ```json
  {
    "$schema": "...",
    "id": "slack-notification",
    "name": "Slack Notification",
    "version": 2,
    "description": "Updated for Slack API v2",
    ...
  }
  ```

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Templates apply-time baked; no auto-propagation; manual re-apply / bulk tooling / backward-compat patterns.
- **b) 2/10** — wrong.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Element Template config is baked into BPMN at apply-time; updates don't auto-propagate — re-apply manually, bulk-update via tooling, or use backward-compatible templates.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/element-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "20 BPMN files update Element Template." Template propagation.

**Въпросът → Solution Framing.** "Auto-propagate" — изпитва се knowledge на template lifecycle.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че apply-time baked, че manual / bulk / backward-compat patterns, че version field. Това е знание за Element Template updates.

---

## Question 16: Configuring Processes (Weighting: 22%)

**Scenario:** An AI Agent Connector uses a prompt template: `"Summarize this {documentType} for {customerName}"`. Team wonders if templates support variables and how.

**AI Agent prompt template variables?**

- **a)** **Typical pattern**: prompts use **FEEL expressions** for variable substitution. Template like `"Summarize this " + documentType + " for " + customerName` or template-literal syntax depending on Connector implementation. Camunda 8's AI Agent / LLM Connectors expose input fields for prompts; modeler writes FEEL to compose dynamic strings. **Use cases**: personalised prompts, multi-tenant prompts, context-aware queries. Documentation: [AI Agent](https://docs.camunda.io/docs/components/agentic-orchestration/) + [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** No variables — wrong. Documentation: [AI Agent](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **c)** Only hardcoded — wrong. Documentation: [AI Agent](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **d)** Use external template engine — overstates. Documentation: [AI Agent](https://docs.camunda.io/docs/components/agentic-orchestration/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** AI Agent prompt with variables:

  **FEEL expression in prompt field**:
  ```
  prompt = "Summarize this " + documentType + " for customer " + customerName + ". Focus on: " + string join(focusAreas, ", ")
  ```
  - Dynamic value substitution via FEEL string concatenation.
  - Use any process variable.
  - Functions available: `string()` (number-to-string), `string join`, `lower case`, etc.

  **Pattern: structured prompts**:
  ```
  prompt = "Context:\n" +
    "- Document type: " + documentType + "\n" +
    "- Customer: " + customerName + "\n" +
    "- Region: " + region + "\n\n" +
    "Task: " + task + "\n\n" +
    "Format response as JSON."
  ```

  **Use cases**:

  **Use case 1: Personalisation**:
  - Customer name in greeting / context.
  - Region for locale-specific responses.
  - Tier (basic/premium) affecting response depth.

  **Use case 2: Multi-tenant**:
  - Different system prompts per tenant.
  - `prompt = tenants[tenantId].systemPrompt + ...`.

  **Use case 3: Dynamic task framing**:
  - Same model used for different tasks; task description varies.
  - `prompt = "Task " + taskType + ": " + taskInstructions + ..."`.

  **Use case 4: Context injection**:
  - Inject relevant prior context (history, knowledge base snippets).
  - `prompt = "Background:\n" + string join(history, "\n") + "\n\nQuestion: " + query`.

  **Templating considerations**:

  **String escaping**:
  - User-provided strings may contain special chars (quotes, newlines).
  - FEEL `string` conversion typically handles, but verify edge cases.
  - **Avoid SQL-injection-style issues**: never inject raw user input into system-prompt portion.

  **Variable safety**:
  - **Null defense**: `=if customerName != null then customerName else "valued customer"`.
  - **Type coercion**: ensure variables are strings; convert numbers / dates as needed.

  **Length / token limits**:
  - Long variables may overflow LLM token budget.
  - **Truncate**: `substring(longField, 1, 1000)` if needed.
  - **Summarize first**: pre-compute summaries; inject.

  **Prompt iteration**:
  - **Version prompts**: store as process variables; track which version each invocation used.
  - **A/B testing**: route different process instances to different prompts; analyse outcomes.

  **Best practices**:
  - **Test prompts**: log inputs + outputs; analyse quality.
  - **Don't inline secrets**: API keys via secrets, never in prompts.
  - **Sanitize user inputs**: prevent prompt injection attacks.
  - **Document prompt evolution**: changelog of what changed when.

  **Element Template** (per Q15):
  - Could provide prompt scaffolding; modeler fills variable parts.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Overstates.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL string concatenation for dynamic prompts; full process variable access; pattern for personalisation / multi-tenant / context injection.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 3/10** — overstates.

**Correct Answer:** Prompts use FEEL expressions for variable substitution; concatenate process variables dynamically; consider null defense, length limits, and prompt-injection prevention.

**Official Documentation Link:** https://docs.camunda.io/docs/components/agentic-orchestration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Summarize {documentType} for {customerName}." Prompt variables.

**Въпросът → Solution Framing.** "Template variables" — изпитва се AI Agent prompt patterns.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL concat, че dynamic prompts, че safety considerations. Това е знание за AI Agent prompts.

---

## Question 17: Configuring Processes (Weighting: 22%)

**Scenario:** A Timer Boundary uses ISO 8601 duration `PT15M30S` (15 min 30 sec). Team wonders if Zeebe respects sub-minute precision or rounds.

**Timer precision — ISO 8601 sub-minute?**

- **a)** **Zeebe typically supports sub-minute precision** for timer durations per ISO 8601 — PT15M30S means 15 minutes 30 seconds exactly. **Precision in practice**: depends on engine's clock-tick granularity. **Real-world precision**: typically second-level or better; not millisecond-precise (broker scheduling overhead). For sub-second precision needs: timers aren't the right tool — consider external schedulers or event-driven patterns. Verify exact precision in your Camunda 8 version. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** Minute-only precision — wrong typically. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** Millisecond precision — overstates typically. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Rounded down — wrong. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Timer precision in Camunda 8:

  **ISO 8601 duration format**:
  - `PT15M30S`: 15 minutes + 30 seconds.
  - `PT1H`: 1 hour.
  - `P1D`: 1 day.
  - `PT0.5S`: 500 ms (sub-second).
  - `P1DT12H`: 1 day + 12 hours.

  **Zeebe precision**:
  - **Engine evaluates** the duration; schedules trigger at deadline.
  - **Clock tick granularity**: depends on internal scheduling; typically second-level or better.
  - **Real-world latency**: 100ms-few seconds variance from exact deadline due to:
    - Scheduling overhead.
    - Tick frequency.
    - Load on broker.
  - **Sub-second specifications**: respected in syntax; actual firing may be approximate.

  **Common timer expressions**:
  - `PT5M`: 5 minutes (very common, well-supported).
  - `PT30S`: 30 seconds (works; expect small drift).
  - `PT100ms` or `PT0.1S`: 100 ms (specifiable; firing precision varies — likely not exactly 100ms).
  - `R/PT1H`: repeat hourly (Timer Cycle).
  - `2025-12-31T23:59:59Z`: specific date (Timer Date).

  **For the scenario** (`PT15M30S`):
  - Zeebe respects the 30-second portion.
  - Expected firing ~ 15 min 30 sec after timer start.
  - Real firing may be 15:30 ± few seconds due to scheduling.

  **When timers fall short**:
  - **Sub-second precision needs**: not Zeebe's strength; use external schedulers.
  - **Real-time / hard deadlines**: BPMN engines aren't real-time systems.
  - **High-frequency repeating**: timer cycle with sub-minute period strains engine — reconsider design.

  **Best practices**:

  **For human-relevant timers (minutes / hours / days)**:
  - Zeebe's precision is more than adequate.
  - Use ISO 8601 naturally.

  **For sub-minute timers**:
  - Specify in seconds for clarity (`PT30S` not `PT0.5M`).
  - Test actual firing behavior in your environment.

  **For very precise / real-time needs**:
  - Use external systems (cron, real-time schedulers).
  - Camunda receives notifications via Message events.

  **For business-day calculations**:
  - ISO 8601 doesn't natively support "next business day."
  - Compute date externally; pass as `dueDate` variable; Timer Date references variable.

  **Time zone considerations**:
  - **Date Timer**: ISO 8601 date includes timezone; engine respects.
  - **Duration Timer**: relative to "now"; timezone-neutral.
  - **Cycle Timer**: cron-like; timezone matters for "every day at 9am" type rules.

  Verify your Camunda 8 version's exact precision for sub-minute / sub-second timers.

- **Option b) — Wrong.**

- **Option c) — Overstates.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Zeebe supports sub-minute precision; real firing has small variance; not millisecond-precise for sub-second needs.
- **b) 2/10** — wrong.
- **c) 4/10** — overstates.
- **d) 1/10** — wrong.

**Correct Answer:** Zeebe respects ISO 8601 sub-minute precision (PT15M30S = 15min 30s); real firing has small variance due to scheduling; not real-time precise.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "PT15M30S sub-minute precision." Timer precision.

**Въпросът → Solution Framing.** "Sub-minute precision" — изпитва се timer behavior.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че ISO 8601 supported, че real firing variance, че not real-time. Това е знание за timer precision.

---

## Question 18: Configuring Processes (Weighting: 22%)

**Scenario:** A team upgrades a process definition V1 → V2. In-flight V1 instances need to migrate to V2. V2 added a new variable `regionCode`. Team wonders how variable schema changes are handled during migration.

**Process migration + variable schema changes?**

- **a)** **Camunda 8 supports process instance migration** (verify per version):
  - **Migration plan**: maps V1 elements to V2 elements (e.g., "V1 ReviewTask → V2 ReviewTask"); engine moves in-flight tokens accordingly.
  - **Variables**: existing variables preserved; new variables (like `regionCode`) are NOT auto-populated — they're absent until set.
  - **Default values**: V2 process logic should handle absent variables (defensive FEEL: `=if regionCode = null then "UNKNOWN" else regionCode`).
  - **Pre-migration scripting**: set new variables via Modify API before migration if needed.
  
  Documentation: [Process Instance Migration](https://docs.camunda.io/docs/components/concepts/process-instance-migration/)

- **b)** Migration impossible with schema changes — wrong. Documentation: [Migration](https://docs.camunda.io/docs/components/concepts/process-instance-migration/)

- **c)** Auto-populates new variables — wrong. Documentation: [Migration](https://docs.camunda.io/docs/components/concepts/process-instance-migration/)

- **d)** Must wait for V1 instances to complete — partial. Documentation: [Migration](https://docs.camunda.io/docs/components/concepts/process-instance-migration/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Process instance migration concepts:

  **Migration plan**:
  - Defines mapping from V1 process definition to V2.
  - **Element mappings**: which V1 element corresponds to which V2 element.
  - **For unchanged elements**: typically auto-mapped by ID.
  - **For renamed / replaced elements**: explicit mapping required.

  **Migration process**:
  1. Define migration plan (programmatically via API).
  2. Apply to one / batch / all in-flight V1 instances.
  3. Engine moves tokens from V1 elements to mapped V2 elements.
  4. Variables preserved.

  **Variable handling**:

  **Preserved variables**:
  - All V1 variables remain at their current scopes.
  - V2 process logic uses them as before.

  **New variables in V2**:
  - **Not auto-populated**: simply absent in migrated instances.
  - **V2 logic must handle**: 
    - Defensive FEEL: null checks, default values.
    - Or set explicitly before migration via Modify API.

  **Removed variables in V2**:
  - **Still present in instance**: not auto-deleted.
  - **V2 ignores**: doesn't reference them.
  - **For cleanup**: explicit Modify API call to remove.

  **Renamed variables in V2**:
  - **Migration plan** may include variable rename mapping (verify support).
  - **Else**: manual scripting before migration (rename via API).

  **For the scenario** (V2 adds `regionCode`):
  - Migrate V1 instances; `regionCode` absent.
  - V2 logic referencing `regionCode`:
    - **Best**: defensive `=if regionCode = null then "UNKNOWN" else regionCode`.
    - **Alternative**: pre-migration script sets `regionCode` based on other variables (e.g., infer from `country`).

  **Migration constraints**:
  - **Active wait states**: tokens at User Tasks, Receive Tasks, Timer Catches typically migratable.
  - **In-flight activities**: depends on element type and migration plan.
  - **Process state compatibility**: drastic structural changes (e.g., removing entire branches with active tokens) may not migrate cleanly.

  **Migration alternative: Cohabitation**:
  - **V1 + V2 coexist**: new instances start on V2; old V1 instances finish naturally.
  - **No migration needed**: simpler operationally; takes longer for V1 to drain.
  - **Trade-off**: split logic in two versions; longer transition.

  **Best practices**:

  **For minor changes** (adding optional variables, new optional steps):
  - **Defensive V2 logic**: handle absent / new fields gracefully.
  - **Cohabitation often easiest**.

  **For major changes** (restructured flow, removed steps):
  - **Explicit migration plan**.
  - **Test in dev**: validate token movement.
  - **Coordinate with stakeholders**.

  **Variable migration tooling**:
  - **Modify Process Instance API**: set / unset variables before migration.
  - **Migration API**: applies plan to instances.
  - **Operate UI**: may offer migration features (verify per version).

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Partial.** Alternative is cohabitation.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Migration plan + variable preservation; new V2 vars absent until set; V2 logic must handle defensively.
- **b) 1/10** — wrong.
- **c) 2/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** Migration plan maps elements; existing vars preserved; new V2 vars absent — use defensive V2 logic or pre-set via Modify API; cohabitation alternative.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/process-instance-migration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "V1 → V2 migration regionCode." Process migration + variables.

**Въпросът → Solution Framing.** "Variable schema changes" — изпитва се migration semantic.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че migration plan, че new vars absent, че cohabitation alternative. Това е знание за process migration.

---

## Question 19: Configuring Processes (Weighting: 22%)

**Scenario:** A Spring Zeebe worker handles a high-throughput Task Type. By default, workers handle one job at a time. Team wonders if Spring Zeebe supports concurrent job handling.

**Spring Zeebe worker concurrency?**

- **a)** **Spring Zeebe supports concurrent job handling**:
  - **`maxJobsActive`** (or similar config): how many jobs to fetch in one polling round.
  - **`@JobWorker` `maxJobsActive` parameter**: per-worker override.
  - **Thread pool**: each fetched job runs in a thread; pool size configurable.
  - **Tuning**:
    - **CPU-bound workers**: pool size ≈ CPU cores.
    - **I/O-bound workers**: pool size higher (10s-100s; tune to bottleneck).
  - **Long-poll timeout**: tune to balance latency vs polling load.
  
  Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** Sequential only — wrong. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** Use separate workers — partial. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** Concurrency unsafe — overstates. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Spring Zeebe concurrency knobs:

  **Configuration options** (verify per Spring Zeebe version):

  **maxJobsActive**:
  - Max jobs fetched per poll.
  - Default may be 32 or similar.
  - Tune up for high-throughput, tune down for resource constraints.

  **Thread pool / executor**:
  - SDK provides a thread pool for executing handler methods.
  - Pool size configurable.
  - Each fetched job runs on a thread.

  **Per-worker config**:
  ```java
  @JobWorker(type = "process-payment", maxJobsActive = 64)
  public Map<String, Object> processPayment(@Variable String orderId) {
      // ...
  }
  ```

  **Global config**:
  ```yaml
  camunda:
    client:
      zeebe:
        execution-threads: 32
        default-job-worker-max-jobs-active: 64
  ```

  **Tuning guidelines**:

  **CPU-bound work** (e.g., heavy computation):
  - Pool size ≈ CPU cores (e.g., 4-8 for 8-core machine).
  - More threads = context switching, no real throughput gain.

  **I/O-bound work** (e.g., REST calls, DB queries):
  - Pool size higher (10s-100s).
  - Threads spend most time blocked on I/O; can handle many concurrently.

  **Mixed workloads**:
  - Profile to find bottleneck.
  - Use async patterns (CompletableFuture, etc.) for I/O-heavy steps.

  **Concurrency safety**:

  **Stateless workers** (preferred):
  - No shared mutable state.
  - Each invocation independent.
  - Thread-safe by design.

  **Shared resources** (DB connections, HTTP clients):
  - **Connection pools**: use libraries that manage pools (HikariCP for JDBC, etc.).
  - **HTTP clients**: most modern clients (OkHttp, Apache HttpClient) thread-safe.

  **Shared mutable state**:
  - **Avoid**: instance variables, static counters.
  - **If needed**: synchronisation (locks), or use thread-safe collections.

  **Monitoring concurrency**:
  - **Active threads metric**: how many handlers running.
  - **Queue depth**: jobs waiting for thread.
  - **Latency**: high concurrency may increase per-job latency due to contention.

  **Polling vs streaming**:
  - **Long-poll** (default): worker periodically polls broker.
  - **Streaming** (newer SDKs): broker pushes jobs to worker.
  - **Streaming**: lower latency, fewer empty polls.

  **Anti-patterns**:
  - **Too many threads**: OOM, GC pressure, broker overload.
  - **Too few threads**: throughput bottleneck.
  - **Tune iteratively**: monitor + adjust.

  **Scaling out**:
  - **Multiple worker instances**: horizontal scaling beyond single-machine limits.
  - **Each instance**: independent thread pool.
  - **Broker distributes**: workers share workload.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Overstates.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. maxJobsActive + thread pool config; tune per CPU vs I/O bound; horizontal scaling for higher throughput.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 3/10** — overstates.

**Correct Answer:** Spring Zeebe supports concurrent jobs via maxJobsActive + thread pool; tune per workload type (CPU vs I/O); scale horizontally for high throughput.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "high-throughput concurrent." Worker concurrency.

**Въпросът → Solution Framing.** "Concurrent job handling" — изпитва се SDK concurrency.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че maxJobsActive + thread pool, че CPU vs I/O tuning, че scale horizontally. Това е знание за worker concurrency.

---

## Question 20: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task has a Compensation Boundary Event. The boundary handler (separate Service Task) is the compensation. Team wonders how compensation is triggered.

**Boundary Compensation Event semantics?**

- **a)** **Compensation triggered by Compensation Throw Event** (or Compensation End Event in transaction subprocess):
  - Process explicitly throws compensation; engine finds activities that have completed with Compensation Boundary; runs their compensation handlers.
  - **Order**: reverse order of completion (LIFO — undo most recent first).
  - **Scope**: compensation throwers in scope find boundaries in same scope.
  - **Activity must have completed** for its compensation to fire.
  
  Documentation: [Compensation](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **b)** Auto on failure — wrong. Documentation: [Compensation](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **c)** Manual API call — partial. Documentation: [Compensation](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **d)** Same as Error — wrong. Documentation: [Compensation](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Compensation event mechanics:

  **Setup**:
  - **Activity A** (e.g., "Charge Card"): completes; has a Compensation Boundary Event attached.
  - **Boundary Event** → connected to compensation handler (e.g., "Refund Card" Service Task).
  - **Handler waits dormant** until compensation thrown.

  **Triggering compensation**:

  **Trigger 1: Compensation Throw Event**:
  - Intermediate Throw Event or End Event with Compensation marker.
  - Placed in the same scope (or parent) as the activities with Compensation Boundaries.
  - When reached: engine searches for completed activities in scope with Compensation Boundaries; runs their handlers.

  **Trigger 2: Cancel End Event (Transaction Subprocess)**:
  - In a Transaction Subprocess (BPMN's transactional construct).
  - Cancel End Event reached → engine compensates all completed activities in subprocess.

  **Execution order**:
  - **LIFO** (reverse completion order): most-recently-completed compensated first.
  - **Reflects "undo" semantics**: undo last action first.

  **Example flow**:
  ```
  [Start] → [A: Charge Card] → [B: Update Inventory] → [C: Send Email] → [Some condition]
                ↓ comp                ↓ comp                ↓ comp                ↓
            [Refund Card]        [Restore Inventory]    [Send Cancellation]   [Compensation Throw]
  ```

  When compensation throw fires:
  1. C compensated first (Send Cancellation runs).
  2. Then B (Restore Inventory).
  3. Then A (Refund Card).

  **Activity must have completed**:
  - Compensation only for COMPLETED activities.
  - Activities still in-flight: not compensated (just cancel them via normal cancellation).
  - Activities never reached: nothing to compensate.

  **Use case: Saga pattern**:
  - Long-running business transaction across multiple services.
  - Each step has a compensation action (the "undo").
  - On error: trigger compensation; engine unwinds completed steps.

  **In Transaction Subprocess**:
  - Container groups related activities into a transactional scope.
  - Cancel End Event: triggers compensation for the subprocess.
  - Commit / cancel semantics:
    - **Commit**: normal end; no compensation.
    - **Cancel**: Cancel End fires; engine compensates completed activities.

  **Compensation handler can fail**:
  - Per Set 13 Q5: compensation failure → Incident.
  - Compensation isn't infinite-retry; design handlers to be robust.

  **Compensation can't compensate compensation**:
  - Handlers themselves don't have Compensation Boundaries typically.
  - Avoid recursive complexity.

  **Best practices**:
  - **Idempotent handlers**: compensation may be invoked multiple times in some scenarios.
  - **Log compensation actions**: audit trail of what was undone.
  - **Test compensation paths**: harder than happy path; often neglected.

- **Option b) — Wrong.**

- **Option c) — Partial.** Via API typically not standard.

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Compensation triggered by Compensation Throw / Cancel End; LIFO order; only completed activities compensated.
- **b) 2/10** — wrong.
- **c) 3/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Compensation triggered by Compensation Throw Event (or Cancel End in Transaction); LIFO order; activities must have completed; design handlers robustly.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Compensation Boundary handler trigger." Compensation mechanics.

**Въпросът → Solution Framing.** "How triggered" — изпитва се compensation flow.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Compensation Throw / Cancel End, че LIFO, че completed activities only. Това е знание за compensation.

---

## Question 21: Configuring Processes (Weighting: 22%)

**Scenario:** Two process instances both subscribe to Message `"PAYMENT_CONFIRMED"` with correlation key `customerId="C-100"`. Publisher sends one such message. Team wonders if both instances get it or if a conflict arises.

**Multiple subscriptions same key — conflict?**

- **a)** **Camunda's correlation typically enforces 1-to-1 matching** — Message correlates to ONE active subscription matching (name, key). If two instances have same (name, key) active: which one matches is **undefined / engine-specific**; this is a modeling error indicating ambiguous correlation. **For 1-to-N broadcast**: use Signal instead (per Set 14 Q6). **For 1-to-1**: ensure correlation keys are globally unique across active instances (typical pattern: `customerId + orderId` composite). Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **b)** Both receive — wrong typically for Message. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **c)** Error thrown — partial. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **d)** Random — wrong. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Multiple subscriptions same key — modelling error scenario:

  **Camunda 8 correlation model**:
  - Message correlates by (Message name, Correlation Key value).
  - Active subscriptions waiting on this pair: typically one expected.
  - **Multiple subscriptions same pair**: undefined which gets the message (engine implementation detail).
  - **Generally**: indicates a correlation design flaw.

  **Why this is a problem**:
  - **Ambiguous routing**: which instance should receive?
  - **Non-deterministic**: hard to debug, may behave differently in different versions.
  - **Race conditions**: timing-dependent results.

  **Common causes of the scenario**:

  **Cause 1: Over-broad correlation key**:
  - Using only `customerId` when there are multiple parallel orders for same customer.
  - Each order process subscribes with same `customerId`; can't tell apart.
  - **Fix**: include order-specific key: `customerId + orderId`.

  **Cause 2: Stale subscriptions**:
  - Old process instances stuck in catch state but should have completed.
  - Multiple "ghosts" waiting on same key.
  - **Fix**: clean up via Operate; ensure processes complete cleanly.

  **Cause 3: Genuine many-to-one need**:
  - Multiple instances genuinely need same event.
  - **Wrong tool**: Message; **right tool**: Signal (broadcast).

  **Solutions**:

  **Solution 1: Make correlation key unique per instance**:
  - Composite keys: `customerId + "-" + orderId` (per Set 13 Q20).
  - Ensure across all active subscriptions, the key value is unique.

  **Solution 2: Switch to Signal**:
  - If multiple instances genuinely need same event: Signal broadcasts.
  - Each instance with Signal subscription receives.

  **Solution 3: Aggregator process**:
  - Single "router" process receives the Message.
  - Router determines which downstream instance(s) need to know; publishes targeted Messages or Signals.
  - Centralised correlation logic.

  **Solution 4: Cancel one of the duplicates**:
  - If duplicate subscriptions are accidental: cancel duplicate instances.
  - Investigate why duplicates created.

  **Detecting the issue**:
  - **Operate**: filter subscriptions by name/key; spot duplicates.
  - **Logging**: log subscription creation; alert on duplicates.
  - **Tests**: integration tests exercising correlation paths.

  **For the scenario** (two instances same (name, key)):
  - Undefined behavior; one (random) wins.
  - **Fix**: make keys unique per instance, OR use Signal if broadcast needed.

  **In some engine versions**:
  - May throw an error at subscription time (duplicate detection).
  - May silently accept; ambiguous correlation later.
  - Verify your Camunda 8 version's exact behavior.

- **Option b) — Wrong typically.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. 1-to-1 correlation expected; duplicate (name, key) = ambiguous; fix via unique composite keys OR use Signal for broadcast.
- **b) 2/10** — wrong.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Duplicate (name, key) subscriptions are a modelling flaw — one matches ambiguously; fix via unique composite keys, or switch to Signal for broadcast semantics.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/messages/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "two instances same customerId." Correlation conflict.

**Въпросът → Solution Framing.** "Conflict" — изпитва се knowledge на correlation 1-to-1.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Message 1-to-1, че composite keys, че Signal for broadcast. Това е знание за correlation conflicts.

---

## Question 22: Configuring Processes (Weighting: 22%)

**Scenario:** A User Task has `assignee = "alice"` AND `candidateGroups = "reviewers"`. Alice is also in "reviewers" group. Team wonders who can claim/work on this task.

**User Task assignment vs candidate group precedence?**

- **a)** **Both set: typically `assignee` takes precedence**:
  - **`assignee`** specifies a direct individual assignment.
  - **`candidateGroups`** specifies a pool from which anyone can claim.
  - **If both**: the task is directly assigned to `assignee`; candidate groups may still be displayed in Tasklist as additional context but primary owner is the assignee.
  - **Behavioral nuance**: verify per Tasklist version — some versions may treat assignee as "claimed by this user," and candidate groups as "or anyone in this group can take over."
  
  **Practical pattern**: set ONE, not both, to avoid ambiguity. Use assignee for direct assignment; candidate groups for pool-based assignment. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** Only candidate groups apply — partial. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** Neither — wrong. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Random pick — wrong. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** User Task assignment semantics:

  **Assignment attributes**:

  **`assignee`**:
  - **Specifies a direct assignment** to a specific user.
  - Tasklist shows the task in this user's "My Tasks" view.
  - User can complete without claiming (already claimed implicitly).
  - **Override**: can be reassigned via API.

  **`candidateGroups`**:
  - **Specifies a pool** of groups.
  - Members of any listed group can claim the task.
  - Once claimed: becomes that user's task.
  - Tasklist shows in "Group Tasks" / "Available Tasks" view.

  **`candidateUsers`**:
  - **Specifies a pool** of users (vs groups).
  - Similar semantic to candidateGroups but user-specific.

  **When both `assignee` and `candidateGroups` set**:

  **Typical behavior**:
  - **`assignee` takes precedence** — task is directly assigned.
  - **`candidateGroups` may be informational** — shown but no different routing.
  - **OR** different Tasklist versions may interpret differently:
    - Some: assignee = "claimed by"; candidate groups = "anyone in this group can re-claim."
    - Some: assignee = primary; candidates not shown if assignee set.

  **Best practice: set one, not both**:

  **Pattern 1: Direct assignment**:
  - Set `assignee` to specific user.
  - Skip candidate groups.

  **Pattern 2: Pool-based**:
  - Skip `assignee`.
  - Set `candidateGroups` (and/or candidateUsers).
  - User in the group claims.

  **Pattern 3: Assignment via expression**:
  - `=if isManager then "alice" else null` for `assignee`.
  - Conditionally direct-assign or leave to candidate groups.

  **Common pitfalls**:

  **Pitfall 1: Setting both causes confusion**:
  - Users wonder why they see task in two places.
  - Tasklist UI may show task differently based on user's perspective (assignee vs group member).

  **Pitfall 2: Assignee not in candidate groups**:
  - Edge case: assignee = "alice", candidate groups = "reviewers", alice NOT in reviewers.
  - Some interpretations: alice has the task (assignee overrides).
  - Verify Tasklist version's behavior.

  **Pitfall 3: Reassignment**:
  - Original assignee absent (on vacation, etc.).
  - Need to reassign.
  - **With candidate groups**: easier — anyone in group can claim.
  - **Without**: manager / admin must reassign via API.

  **Recommended decision tree**:

  | Need | Setting |
  |------|---------|
  | Specific user must do this | `assignee` only |
  | Any of N people can do this | `candidateGroups` or `candidateUsers` only |
  | Specific user but with fallback group | Two-step: assign with assignee; expression-based unassign on timeout; reassign to group |

  **For dynamic assignment**:
  - FEEL expressions resolved at task activation.
  - `assignee = userByRegion[customer.region]` — lookup.
  - Process variables driving assignment.

- **Option b) — Partial.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Both set: assignee typically precedence; set only one for clarity (assignee for direct, candidateGroups for pool).
- **b) 4/10** — partial.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** When both set: assignee typically takes precedence (direct assignment); avoid ambiguity — set ONE (assignee for direct, candidateGroups for pool-based).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "assignee alice AND candidateGroups reviewers." Assignment precedence.

**Въпросът → Solution Framing.** "Who claims" — изпитва се assignment semantic.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че assignee precedence, че set one for clarity, че patterns differ. Това е знание за User Task assignment.

---

# Section 3 — DMN (Questions 23-29)

> Weight 11% • Topics: COLLECT aggregators, `every`/`some` quantifiers, decision input variable mapping, deployment versioning strategy, default rule placement, REST API invocation, DMN testing strategy.

---

## Question 23: DMN (Weighting: 11%)

**Scenario:** A DMN table with `COLLECT` hit policy and an aggregator like `+` (sum), `min`, `max`, or `count`. Team wonders how aggregators change the COLLECT output.

**COLLECT hit policy with aggregator?**

- **a)** **COLLECT** alone returns a **list** of all matching rules' outputs (unordered). **COLLECT with aggregator** (C+, C<, C>, C#) returns a **single aggregated scalar**:
  - **`C+` (sum)**: sums all matching outputs (numeric).
  - **`C<` (min)**: minimum of outputs.
  - **`C>` (max)**: maximum of outputs.
  - **`C#` (count)**: count of matching rules.
  
  Output type changes from list to scalar; useful for "total fees," "minimum risk score," "max discount," "number of applicable rules." Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **b)** Always returns list — partial; without aggregator. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Aggregator does nothing — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Returns error — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** COLLECT hit policy variants:

  **COLLECT (no aggregator)**:
  - Returns a list of all matching rules' outputs.
  - Order: undefined (or implementation-specific).
  - Example: rules output `[10, 20, 30]` if 3 rules match.

  **COLLECT with aggregator**:

  **`C+` (Sum)**:
  - Sums all matching outputs.
  - Outputs `[10, 20, 30]` → result `60`.
  - **Use case**: total fees, accumulated discounts, points sum.

  **`C<` (Min)**:
  - Minimum value among matching outputs.
  - Outputs `[10, 20, 30]` → result `10`.
  - **Use case**: minimum risk score (most conservative), minimum acceptable.

  **`C>` (Max)**:
  - Maximum value among matching outputs.
  - Outputs `[10, 20, 30]` → result `30`.
  - **Use case**: maximum discount, peak risk level.

  **`C#` (Count)**:
  - Count of matching rules.
  - Outputs `[anything, anything, anything]` (3 matches) → result `3`.
  - **Use case**: "how many rules apply"; doesn't care about output values.

  **Output type implications**:
  - **C**: list type (use `count()`, `sum()`, etc. in downstream FEEL).
  - **C+/C</C>**: number (single scalar).
  - **C#**: number (count).

  **Example DMN table** (COLLECT C+):
  ```
  Inputs: orderAmount, customerTier
  Outputs: discount (number)
  Rules:
    1. orderAmount > 100, *           → 5
    2. *,                  "premium"  → 10
    3. orderAmount > 500, *           → 5
  ```
  
  For `orderAmount=600, customerTier="premium"`:
  - Rules 1, 2, 3 all match → outputs [5, 10, 5].
  - **C+** aggregates: 5 + 10 + 5 = **20** (total discount %).

  **Practical use cases**:

  **Sum (C+)**:
  - Total tax = sum of applicable tax rules.
  - Total discount = sum of stackable discounts.
  - Total fees = sum of applicable service fees.

  **Min (C<)**:
  - Risk gating = most conservative limit.
  - Approval threshold = minimum required signoff.

  **Max (C>)**:
  - Best offer = max discount among eligible.
  - Severity = max severity across triggered alerts.

  **Count (C#)**:
  - Compliance check = how many rules applied (for audit).
  - Eligibility = if count > 0, eligible.

  **Output column type**:
  - Numeric for C+/C</C>; otherwise error.
  - String list works only with plain C (no aggregator).

  **Anti-patterns**:
  - **Wrong aggregator type**: C+ on string outputs → error.
  - **Aggregator without need**: use plain C, then downstream FEEL aggregates.

- **Option b) — Partial.** Without aggregator.

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. C+ sum / C< min / C> max / C# count; transforms list output to scalar; numeric aggregators.
- **b) 4/10** — partial.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** COLLECT with aggregator (C+, C<, C>, C#) returns scalar (sum, min, max, count); without aggregator returns list of matching outputs.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "COLLECT sum min max count." Aggregator semantics.

**Въпросът → Solution Framing.** "How aggregator changes" — изпитва се COLLECT variants.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че C+ sum, C< min, C> max, C# count, че list → scalar. Това е знание за COLLECT aggregators.

---

## Question 24: DMN (Weighting: 11%)

**Scenario:** A DMN expression needs to check if **all items** in a list meet a condition (e.g., all order items priced > 0). Team wonders if FEEL supports `every`/`some` quantifiers.

**FEEL `every` and `some` quantifiers?**

- **a)** **FEEL supports quantifier expressions**:
  - **`every x in list satisfies condition`**: returns true if ALL elements satisfy.
  - **`some x in list satisfies condition`**: returns true if AT LEAST ONE element satisfies.
  - Examples:
    - `every item in items satisfies item.price > 0` — all positive.
    - `some item in items satisfies item.flagged = true` — any flagged.
  - **Empty list**: `every` returns `true` (vacuous truth); `some` returns `false`.
  
  Documentation: [FEEL Language Guide](https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-control-flow/)

- **b)** No quantifiers — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Filter only — partial. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Use for-loop — overcomplicated. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL quantifier expressions:

  **Syntax**:
  - **`every variable in list satisfies condition`**: universal quantifier (∀).
  - **`some variable in list satisfies condition`**: existential quantifier (∃).

  **Examples**:

  **`every`**:
  ```feel
  every item in items satisfies item.price > 0
  every order in orders satisfies order.status = "PAID"
  every customer in customers satisfies customer.kycVerified
  ```

  **`some`**:
  ```feel
  some item in items satisfies item.flagged
  some order in orders satisfies order.totalAmount > 1000
  some risk in riskFactors satisfies risk.severity = "HIGH"
  ```

  **Empty list edge cases**:

  **`every`** on empty list:
  - Returns `true` (vacuous truth).
  - "All zero elements satisfy the condition" → trivially true.
  - **Watch out**: business logic might want false for empty.
  - **Defensive**: `count(items) > 0 and every item in items satisfies ...`.

  **`some`** on empty list:
  - Returns `false`.
  - "No element to satisfy" → false.
  - **More intuitive** for "are there any matching" queries.

  **Use cases**:

  **Validation**:
  - `every field in requiredFields satisfies field != null and field != ""`.

  **Eligibility checks**:
  - `every check in complianceChecks satisfies check.passed`.

  **Aggregate conditions**:
  - `some order in customer.orders satisfies order.disputeOpen`.

  **Combination patterns**:

  **Mixed conditions**:
  ```feel
  every item in items satisfies (
    item.price > 0 and
    item.quantity > 0 and
    item.sku != null
  )
  ```

  **Negation**:
  ```feel
  not(some item in items satisfies item.outOfStock)
  ```
  Equivalent to `every item in items satisfies not(item.outOfStock)`.

  **Multi-variable quantifier**:
  ```feel
  every order in orders, item in order.items satisfies item.priceCheck = true
  ```
  Iterates over Cartesian product of orders × their items.

  **Performance**:
  - `every` short-circuits on first false.
  - `some` short-circuits on first true.
  - Efficient for large lists with early termination.

  **Compare with `filter`**:
  - `filter(items, item.flagged)` returns the matching elements.
  - `some item in items satisfies item.flagged` returns just true/false.
  - Use filter when need the matches; quantifiers when need boolean answer.

  **Compare with `count`**:
  - `count(items[item.flagged = true]) > 0` is equivalent to `some ... satisfies item.flagged`.
  - Quantifier expressions are more readable and short-circuit faster.

  **In DMN tables**:
  - Quantifiers usable in input expressions, input entries, output entries.
  - Powerful for list-aware decision logic.

  **Best practices**:
  - **Prefer quantifiers** over manual loops / filter+count for boolean queries.
  - **Be aware of empty-list semantics**: combine with count check if business requires non-empty.
  - **Use parentheses** for clarity in complex satisfies expressions.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Overcomplicated.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL supports every/some quantifiers; vacuous truth for empty list with every; false with some.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 3/10** — overcomplicated.

**Correct Answer:** `every x in list satisfies cond` (universal) and `some x in list satisfies cond` (existential); empty list: every=true, some=false.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-control-flow/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "all items > 0 every some." Quantifiers.

**Въпросът → Solution Framing.** "Every / some support" — изпитва се FEEL quantifier features.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че every/some, че empty list edge cases, че short-circuit. Това е знание за FEEL quantifiers.

---

## Question 25: DMN (Weighting: 11%)

**Scenario:** A Business Rule Task invokes decision `creditCheck`. Decision needs `customerId`, `loanAmount`. Process variables are `customer.id`, `loan.amount`. Team wonders how to map.

**Decision input variable mapping?**

- **a)** **Camunda 8 typically uses Input Mapping on the Business Rule Task** to shape variables before decision invocation:
  - Map `Source: =customer.id` → `Target: customerId`.
  - Map `Source: =loan.amount` → `Target: loanAmount`.
  - Decision sees `customerId`, `loanAmount` as inputs.
  - Alternatively: BPMN may expose direct binding configuration for decision inputs (verify per version).
  
  **Output Mapping**: similarly shapes the decision result back into process variables. Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **b)** Decision auto-finds variables — partial. Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **c)** Decisions don't take inputs — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Manual API call — overstates. Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Business Rule Task variable mapping:

  **Standard pattern**:

  **Input Mapping** (BPMN-side):
  - Maps process variables to decision-required input names.
  - Uses FEEL expressions for transformation.

  ```xml
  <bpmn:businessRuleTask id="CreditCheck">
    <bpmn:extensionElements>
      <zeebe:calledDecision decisionId="creditCheck" resultVariable="creditDecision" />
      <zeebe:ioMapping>
        <zeebe:input source="=customer.id" target="customerId"/>
        <zeebe:input source="=loan.amount" target="loanAmount"/>
        <zeebe:output source="=creditDecision.approved" target="loanApproved"/>
      </zeebe:ioMapping>
    </bpmn:extensionElements>
  </bpmn:businessRuleTask>
  ```

  **Flow**:
  1. Process reaches Business Rule Task.
  2. Input Mapping evaluates; creates task-scope variables `customerId`, `loanAmount`.
  3. Decision invoked with these variables.
  4. Decision evaluates; produces result.
  5. Result stored in `creditDecision` (process variable per resultVariable).
  6. Output Mapping (optional): shapes result for downstream use.

  **For the scenario**:
  - Source expressions extract from nested structures.
  - Target names match decision's expected input names.
  - Decision sees clean, top-level variables.

  **Alternative: decision-direct access**:
  - **If decision references nested paths directly**: e.g., decision uses `customer.id` directly in FEEL — works without mapping.
  - **Trade-off**: decision coupled to process variable structure; harder to reuse across processes with different variable shapes.

  **Best practice**:
  - **Input Mapping for decoupling**: process and decision evolve independently.
  - **Reuse decisions**: same decision usable from processes with different variable structures (each maps).
  - **Clear contract**: decision documents required inputs; processes adapt.

  **Variable types**:
  - **Decision input types** matter (per Set 13 Q26).
  - Mapping should produce correct types:
    - `=number(amountStr)` if process has string but decision expects number.
    - Defensive null handling.

  **Output Mapping**:
  - Decision output structure (e.g., `{approved: true, limit: 5000}`) shaped for process consumers.
  - Or store entire decision output and let downstream access fields.

  **For multi-output decisions** (Decision Table with multiple output columns):
  - Result is a structure (or list for COLLECT).
  - Output mapping extracts specific fields.

  **Result variable**:
  - **`resultVariable`** attribute: name of process variable to hold decision result.
  - **Without resultVariable**: result lost unless Output Mapping captures it.

  **Versioning concerns** (per Set 13 Q28):
  - Decision binding (latest vs sticky) affects which decision version invoked.
  - Input names must match the invoked version's expectations.

- **Option b) — Partial.** Depends on direct access vs mapping.

- **Option c) — Wrong.**

- **Option d) — Overstates.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Input Mapping on Business Rule Task shapes variables; Output Mapping captures result.
- **b) 4/10** — partial.
- **c) 1/10** — wrong.
- **d) 2/10** — overstates.

**Correct Answer:** Use Input Mapping on Business Rule Task to map process variables to decision input names; Output Mapping for result; decouple via mapping.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "customer.id loan.amount → customerId loanAmount." Decision input mapping.

**Въпросът → Solution Framing.** "Map variables" — изпитва се knowledge на Business Rule Task IO.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Input Mapping shapes, че decoupling benefit, че resultVariable + Output Mapping. Това е знание за decision invocation.

---

## Question 26: DMN (Weighting: 11%)

**Scenario:** A team has 50+ DMN decisions. They deploy each separately. Team wonders if there's a **versioning strategy** — version each individually, or bundle.

**DMN deployment versioning strategy?**

- **a)** **Each DMN file** deploys as a unit; **each decision** within gets versioned per its decisionId. Two main strategies:
  - **Per-decision files** (1 decision per .dmn): each evolves independently; granular versioning; many small deployments.
  - **Logical-grouping files** (related decisions in same .dmn via DRD): atomic deployment of related decisions; one version bump affects all in file.
  
  **Trade-offs**:
  - **Granular**: fine-grained version control; high deployment count.
  - **Grouped**: atomic deploys for related decisions; coarser versioning.
  
  Choose based on coupling — tightly coupled decisions benefit from grouping. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Single big file — wrong typically. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Bundle all in one — partial. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** No versioning needed — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN deployment + versioning patterns:

  **Camunda 8 deployment unit**:
  - One `.dmn` file = one deployment resource.
  - **Versioning per decision**: each `decisionId` in the file gets versioned independently when the file is redeployed.
  - **Atomic file deployment**: all decisions in one file deploy together.

  **Strategy 1: Per-decision files**:

  **Setup**:
  - 1 decision per `.dmn` file.
  - 50 decisions = 50 files.

  **Pros**:
  - **Granular changes**: edit one decision; redeploy one file.
  - **Clear ownership**: easier to track per-decision history.
  - **Independent evolution**: each decision versions independently.

  **Cons**:
  - **Many files to manage**: directory cluttered.
  - **Manual coordination**: related decisions evolve separately; may drift.
  - **More deployment events**: 50 separate deploys.

  **Strategy 2: Logical-grouping files** (DRD-based):

  **Setup**:
  - Group related decisions in same `.dmn` file via DRD (per Set 13 Q27).
  - E.g., "credit-decisioning.dmn" with 5 decisions composing credit logic.
  - 10 grouped files cover 50 decisions.

  **Pros**:
  - **Atomic deploys**: related decisions update together; consistent state.
  - **DRD visible**: see decision relationships in modeler.
  - **Easier reuse**: BKM + dependent decisions in same file.

  **Cons**:
  - **Coarser versioning**: changing one decision bumps version for all in file.
  - **Larger deployment payload**: more change visible in audit log per deploy.

  **Strategy 3: Hybrid**:
  - **Group tightly-coupled decisions**: in DRD files.
  - **Standalone decisions**: in own files.
  - Mix per real coupling.

  **Decision version semantics** (per Set 13 Q28):
  - Process invokes by `decisionId` (typically latest version).
  - When file redeployed: all decisions in file get new version (even if logic unchanged).
  - **Side effect**: re-deploying a file with one change forces version bump for unchanged decisions in same file.

  **For 50 decisions**:

  **Approach A: Per-decision files (50 files)**:
  - Easy to track changes; each decision has clean history.
  - Modular but high file count.

  **Approach B: Domain grouping (5-10 files)**:
  - "credit-decisions.dmn" (10 decisions), "fraud-decisions.dmn" (8), etc.
  - Each file represents a domain.
  - Group based on real coupling.

  **Approach C: Mix**:
  - DRD groups for genuinely-related decisions.
  - Standalone files for unrelated.

  **Operational considerations**:

  **CI / CD**:
  - **Automate deployment**: detect changed files; deploy only those.
  - **Atomic releases**: deploy related changes together.
  - **Rollback**: deploy previous version of file.

  **Audit / Compliance**:
  - **Per-decision history**: regulators may need per-decision evolution.
  - **Track decisionId + version + deployment timestamp**.

  **Best practices**:
  - **Match deployment unit to coupling**: tightly coupled → group; independent → separate.
  - **Document grouping rationale**: explain in README why decisions co-located.
  - **Version major changes deliberately**: when breaking, signal via clear messaging.

- **Option b) — Wrong typically.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Per-decision or logical-grouping (DRD); pick based on coupling; trade-offs granular vs atomic.
- **b) 2/10** — wrong.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Choose per-decision files (granular) or logical-grouping via DRD (atomic for related); match deployment unit to real coupling.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "50+ decisions versioning strategy." DMN deployment.

**Въпросът → Solution Framing.** "Versioning strategy" — изпитва се DMN organisation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че per-decision vs DRD grouping, че coupling drives choice, че atomic vs granular trade-offs. Това е знание за DMN deployment.

---

## Question 27: DMN (Weighting: 11%)

**Scenario:** A FIRST hit policy table has rules covering most cases but a possible "no match" scenario. Team wonders where to place a default / catch-all rule.

**Default rule placement convention?**

- **a)** **For FIRST hit policy**: place the **default / catch-all rule LAST** in the table (after specific rules). Engine evaluates top-to-bottom; first match wins; default catches anything not matched earlier. **Convention**:
  - Specific rules at top (narrow conditions).
  - Default rule at bottom (input conditions `-` meaning "any value").
  - Always have a default if "no match" is undesired (Incident otherwise).
  
  **For other hit policies (UNIQUE, ANY, COLLECT)**: default rule semantics differ; UNIQUE/ANY may not need default; COLLECT may use to ensure at least one match. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **b)** Default rule at top — wrong typically. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** No default needed — partial; depends on hit policy. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Random — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Default rule conventions per hit policy:

  **FIRST (F)**:
  - **Evaluation**: top-to-bottom; first matching rule wins.
  - **Default placement**: LAST.
  - **Default condition**: typically `-` (any) on all inputs → matches everything.
  - **Result**: specific rules at top catch their cases; default catches rest.

  **Example**:
  ```
  Rules (FIRST):
    1. age < 18           → "minor"
    2. age >= 65          → "senior"
    3. -                  → "adult"  ← default at bottom
  ```

  **UNIQUE (U)**:
  - **Evaluation**: expects exactly one match.
  - **Multiple matches**: error (modelling problem).
  - **No match**: depends on default rule presence:
    - With default: catches no-match case.
    - Without: error / null.

  **ANY (A)**:
  - **Multiple matches expected**: all return same output (modeler responsibility).
  - **No match**: depends on default presence; otherwise null/error.

  **COLLECT (C)**:
  - **All matches return list**.
  - **No match**: returns empty list `[]`.
  - **Default rule** (matching everything): adds a baseline output to every evaluation.

  **PRIORITY (P) / OUTPUT ORDER (O)**:
  - **Output values have priority ordering**.
  - **Default**: typically not needed; lowest-priority output covers fallback.

  **RULE ORDER (R)**:
  - **Returns matching rules in rule order**.
  - Similar to COLLECT but ordered.

  **General defaulting strategies**:

  **Strategy 1: Catch-all rule**:
  - Input conditions all `-` (any).
  - Placed LAST for FIRST policy.
  - Provides fallback output.

  **Strategy 2: No default; handle null downstream**:
  - DMN may return null on no match.
  - Process logic handles null (FEEL `if result = null then ...`).

  **Strategy 3: Throw error**:
  - Decision invocation incidents if no match.
  - Operator investigates; manual fix.

  **Best practice for FIRST**:

  ```
  Rules:
    1. Specific case A → output A
    2. Specific case B → output B
    3. Specific case C → output C
    ...
    N. - - -            → default output
  ```

  **In Web Modeler**:
  - Default condition (`-`) is typically explicit; modeler ticks "any" or leaves blank.
  - Tool may visualize default differently.

  **Anti-patterns**:

  **Anti-pattern 1: Default at top (FIRST)**:
  - Default fires first; specific rules never reached.
  - Likely bug; specific cases ignored.

  **Anti-pattern 2: No default with FIRST and incomplete rules**:
  - No-match scenario causes null/error.
  - Production surprises.

  **Anti-pattern 3: Overlapping rules without UNIQUE check**:
  - With FIRST: silent overlap (first match wins, others ignored).
  - With UNIQUE: error on overlap.
  - Pick policy that catches overlap if undesired.

  **Documentation**:
  - **Annotate the default rule**: "Default for unmatched cases" (per Set 13 Q25).
  - **Make default visible**: high contrast in diagram or notes.

- **Option b) — Wrong typically.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Default LAST for FIRST policy; specific rules at top; "any" conditions on default.
- **b) 2/10** — wrong.
- **c) 5/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** For FIRST hit policy: default / catch-all rule at the BOTTOM with "any" (`-`) conditions; specific rules first; engine matches top-to-bottom.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "default catch-all FIRST hit policy." Default rule placement.

**Въпросът → Solution Framing.** "Where to place" — изпитва се DMN default convention.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FIRST = top-to-bottom, че default LAST, че anti-pattern at top. Това е знание за default rule placement.

---

## Question 28: DMN (Weighting: 11%)

**Scenario:** A team wants to expose a DMN decision as an **API endpoint** (call directly without BPMN). Team wonders if Camunda 8 supports standalone decision invocation.

**Standalone decision invocation via API?**

- **a)** **Camunda 8 typically supports invoking decisions standalone via REST API** (verify per version):
  - **Endpoint**: e.g., `/v1/decisions/evaluate` or similar.
  - **Request**: decisionId + input variables (JSON).
  - **Response**: decision output (JSON).
  - **No BPMN process needed**: decision evaluates as standalone.
  - **Auth**: standard OAuth client credentials (SaaS) or other (Self-Managed).
  
  **Use cases**: validation services, scoring APIs, embedded business rules in non-Camunda apps. Documentation: [Decisions API](https://docs.camunda.io/docs/apis-tools/zeebe-api/) + [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Only via BPMN — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Decisions can't be standalone — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Use external DMN engine — partial. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Standalone DMN evaluation via Camunda 8 API:

  **API endpoint** (verify per version):
  - **REST**: HTTP POST to decision evaluation endpoint.
  - **gRPC**: similar via Zeebe gRPC API.
  - **Returns**: synchronous decision output.

  **Example REST call**:
  ```http
  POST /v1/decisions/evaluate
  Content-Type: application/json
  Authorization: Bearer <token>
  
  {
    "decisionId": "creditCheck",
    "variables": {
      "customerId": "C-100",
      "loanAmount": 5000
    }
  }
  ```

  **Response**:
  ```json
  {
    "decisionId": "creditCheck",
    "decisionVersion": 3,
    "result": {
      "approved": true,
      "limit": 10000,
      "interestRate": 0.05
    },
    "decisionInstanceId": "di-12345"
  }
  ```

  **Use cases**:

  **Use case 1: Validation microservice**:
  - External app needs to validate input against business rules.
  - Calls DMN endpoint; gets decision.
  - No process needed; just rule evaluation.

  **Use case 2: Scoring service**:
  - Risk scoring exposed as API.
  - Apps consume; route customers based on score.

  **Use case 3: Embedded in non-Camunda apps**:
  - Microservice architecture; DMN engine as one service.
  - Business rules centralised; multiple consumers.

  **Use case 4: A/B testing rules**:
  - Deploy two decision versions.
  - Route requests; analyse outcomes.
  - Camunda Decisions become testable as services.

  **vs BPMN-embedded**:
  - **BPMN Business Rule Task**: decision is part of a process flow.
  - **Standalone**: decision evaluated outside any process.
  - **Audit / instance tracking**: both produce decision instances recorded in Operate (per Set 13 Q29).

  **Auth**:
  - **SaaS**: OAuth client credentials; cluster endpoint.
  - **Self-Managed**: Identity / Keycloak or token-based per setup.

  **Performance**:
  - **Synchronous**: typical evaluation is fast (ms-level for simple decisions).
  - **Caching**: decisions deterministic given inputs → cacheable if inputs repeat.
  - **Concurrency**: API scales per cluster capacity.

  **Decision input validation**:
  - API validates input types (per declared input column types).
  - Mismatches return error response.

  **Result structure**:
  - **Single output decision** (one output column): result is the value.
  - **Multiple outputs**: result is an object.
  - **COLLECT**: result is a list.
  - **COLLECT with aggregator** (per Q23): result is the aggregated scalar.

  **Operational considerations**:

  **Decision deployment**:
  - Deploy DMN files via API or Web Modeler.
  - Each deployment creates a new version.
  - API calls reference by decisionId; latest version typically.

  **Versioning**:
  - **Specify version** in request: pin to specific version.
  - **Default**: latest.

  **Decision instance retention**:
  - Each invocation logged (per Set 13 Q29).
  - Useful for audit / replay.

  **Best practices**:

  - **Define clear input contracts**: decisions are public API.
  - **Version explicitly when breaking**: avoid surprises.
  - **Monitor decision invocations**: latency, error rate.
  - **Document for consumers**: input/output schemas, error responses.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Standalone decision evaluation via REST API; decisionId + inputs → result; no BPMN process needed.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** Camunda 8 supports standalone decision evaluation via REST API (decisionId + inputs → result); useful as validation / scoring service.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/zeebe-api/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "decision as API endpoint." Standalone decision.

**Въпросът → Solution Framing.** "Invoke standalone" — изпитва се DMN API support.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че REST API, че decisionId + inputs, че use cases. Това е знание за standalone DMN.

---

## Question 29: DMN (Weighting: 11%)

**Scenario:** A complex DMN decision has 50+ rules. Team wants to **test it thoroughly** before deployment. They wonder about DMN testing strategy.

**DMN testing strategy?**

- **a)** **Multi-layered approach**:
  - **Unit tests per decision**: input/output pairs covering rules + edge cases. Use Camunda's testing tools / community frameworks (verify per version).
  - **Coverage**: aim for each rule to be hit by at least one test; aim for all hit-policy paths exercised.
  - **Boundary tests**: values right at rule boundaries (e.g., `amount = 100` if rule is `amount > 100`).
  - **Empty / null inputs**: defensive checks.
  - **Integration tests**: decision invoked from BPMN; assert process state.
  - **Regression tests**: when changing rules, ensure old test cases still pass.
  
  Documentation: [DMN Tester / Testing Frameworks](https://docs.camunda.io/docs/components/modeler/dmn/) + community tools.

- **b)** Manual testing only — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Test in production — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Tests not needed — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN testing strategy:

  **Layered testing pyramid**:

  **Layer 1: Unit tests per decision**:

  **What**:
  - Pre-deployment: feed inputs, assert outputs.
  - Validates logic per decision.

  **Tools**:
  - **Camunda Modeler DMN tester** (if available): inline testing in Modeler UI.
  - **Programmatic frameworks**:
    - Java: invoke Camunda DMN engine; assert outputs.
    - JavaScript: dmn-js library or Camunda's JS DMN evaluator.
    - Other languages: less native; may invoke REST API.
  - **Spec files**: declarative test cases (JSON / YAML mapping inputs to expected outputs).

  **Example test cases**:
  ```
  Test 1: amount=50, customerTier="basic" → discount=0
  Test 2: amount=150, customerTier="basic" → discount=5
  Test 3: amount=50, customerTier="premium" → discount=10
  Test 4: amount=150, customerTier="premium" → discount=15
  ```

  **Coverage**:
  - **Each rule hit at least once**: ensures rule logic exercised.
  - **Hit policy paths**: for FIRST, test which rule matches; for COLLECT, test list / aggregator.
  - **Boundary tests**: 
    - `amount=100` (just below threshold).
    - `amount=101` (just above).
    - `amount=null` (defensive).
  - **Default rule**: test inputs that fall to default.

  **Layer 2: Integration tests**:

  **What**:
  - Decision invoked from BPMN process or API.
  - Validates wiring + IO mapping.

  **Approach**:
  - Spin up Camunda 8 (dev / test cluster).
  - Deploy DMN + BPMN.
  - Start process / invoke decision; assert outcomes.
  - Use Spring Zeebe Test (or equivalent) for assertions.

  **Layer 3: Regression tests**:

  **What**:
  - When decision changes, re-run previous test cases.
  - Catches unintended behavior changes.

  **Approach**:
  - Maintain historical test suite.
  - Run on every change.
  - Fail build if regression.

  **Layer 4: End-to-end tests**:

  **What**:
  - Full flow: input → process → decision → downstream effects.
  - Less common for DMN; high-value for complex orchestrations.

  **Testing edge cases**:

  **Edge case 1: Null inputs**:
  - DMN may handle gracefully or produce null result.
  - Test both with and without nulls.

  **Edge case 2: Type mismatches**:
  - String where number expected (per Set 13 Q26).
  - Test conversion behavior.

  **Edge case 3: Empty list inputs**:
  - For decisions with collection-based inputs.
  - Verify quantifier behavior (per Q24).

  **Edge case 4: Boundary values**:
  - Right at threshold (>=, >, <, <=).
  - Off-by-one bugs.

  **Edge case 5: Multiple matches** (for FIRST):
  - Ensure deliberate order; first match wins.
  - Test that "wrong rule" doesn't accidentally win.

  **Continuous integration**:
  - DMN tests run on every commit / PR.
  - Fail CI if tests fail.
  - Block deployment on test failures.

  **Best practices**:

  - **Test rules incrementally**: as rules added, add tests.
  - **Document test rationale**: why does this case matter?
  - **Use realistic data**: production-like inputs.
  - **Separate test data**: don't hard-code; use fixtures.
  - **Performance tests**: for high-throughput decisions, benchmark evaluation latency.

  **For 50+ rules**:
  - Aim for 50-100 test cases (rule coverage + edge cases).
  - Group tests by domain / scenario.
  - Use parameterised tests (one test function, many input rows).

  **Anti-patterns**:

  - **Test only happy path**: misses edge cases; production surprises.
  - **No regression tests**: changes break silently.
  - **Test in production**: customer-visible bugs.
  - **Manual-only**: doesn't scale; not repeatable.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multi-layered: unit + integration + regression + edge cases; coverage per rule + boundaries.
- **b) 2/10** — wrong.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Multi-layered: unit tests per decision (rule coverage + boundaries), integration tests (BPMN invocation), regression tests, edge case coverage; automate in CI.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "50+ rules test thoroughly." Testing strategy.

**Въпросът → Solution Framing.** "Testing strategy" — изпитва се DMN testing approach.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че layered approach, че rule coverage + boundaries, че CI automation. Това е знание за DMN testing.

---

# Section 4 — Forms (Questions 30-32)

> Weight 5% • Topics: Select vs Radio buttons, conditional field visibility, validation regex vs custom.

---

## Question 30: Forms (Weighting: 5%)

**Scenario:** A form has a Country selector with 200 options. Designer wonders if to use **Select dropdown** or **Radio buttons**.

**Form Select vs Radio buttons?**

- **a)** **For 200 options, Select dropdown** is the right choice:
  - **Radio buttons**: best for 2-5 options where all should be visible at once.
  - **Select dropdown**: best for many options where space is constrained.
  - **For search-heavy lists**: Searchable Select / Autocomplete (verify component availability).
  - **UX trade-offs**: Radio = faster scan for few options; Select = scalable for many.
  
  Documentation: [Camunda Forms](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/)

- **b)** Radio always — wrong. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Both identical UX — wrong. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Use Text Field — wrong. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Form component selection per use case:

  **Radio buttons**:
  - Visual: list of options, all visible, one selected.
  - **Best for**: 2-5 options (yes/no, small enumerations).
  - **Pros**: instant scan; visible alternatives.
  - **Cons**: takes vertical space; impractical for many options.

  **Select dropdown**:
  - Visual: collapsed; expands on click; one option visible at a time.
  - **Best for**: 5+ options.
  - **Pros**: compact; scalable.
  - **Cons**: requires interaction to see options.

  **Searchable Select / Autocomplete** (verify availability):
  - Combines Select with search field.
  - **Best for**: very long lists (countries, currencies, products).
  - **Pros**: fast filtering; keyboard-friendly.
  - **Cons**: more complex; component may need configuration.

  **Checkbox group** (for multi-select):
  - Multiple selections allowed.
  - Visual similar to radio but with checkmarks.

  **Multi-select dropdown**:
  - Compact multi-select.
  - For many options with multiple choices.

  **For 200-country list**:
  - **Searchable Select**: ideal UX (type "ger" → see Germany).
  - **Plain Select**: works but slow to scroll.
  - **Radio**: terrible UX (200 buttons).

  **Decision matrix**:

  | Options count | Single-select | Multi-select |
  |---------------|---------------|--------------|
  | 2-5 | Radio | Checkbox group |
  | 5-20 | Select | Multi-select dropdown |
  | 20+ | Searchable Select | Multi-select with search |

  **Accessibility considerations**:
  - **Keyboard navigation**: all components should support.
  - **Screen readers**: ensure labels properly associated.
  - **High contrast**: visual indicators clear.

  **Data binding**:
  - **Select / Radio**: bound to a single variable (the selected value).
  - **Multi-select / Checkbox group**: bound to a list variable.

  **Option sources**:
  - **Static**: hardcoded in form definition.
  - **Dynamic**: from process variable (e.g., countries list passed in).
  - **External**: fetch from API (component-dependent).

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Select for many options; Radio for few (2-5); Searchable Select for very long lists.
- **b) 2/10** — wrong.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Select dropdown (or Searchable Select) for 200 options; Radio buttons for 2-5; component choice by option count + UX needs.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/form-element-library/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Country 200 options Select Radio." Form component choice.

**Въпросът → Solution Framing.** "Select vs Radio" — изпитва се UX appropriate component.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Radio 2-5, Select 5+, Searchable for very long. Това е знание за Form components.

---

## Question 31: Forms (Weighting: 5%)

**Scenario:** A form has a field "Company Name" that should only be shown when "Account Type = Business" (vs "Individual"). Team wonders if Camunda Forms support conditional visibility.

**Form conditional field visibility?**

- **a)** **Camunda Forms typically support conditional visibility** via **field conditions**:
  - **Condition expression** per field: FEEL expression evaluated against form data.
  - **Example**: Company Name field has condition `=accountType = "Business"`.
  - **Behavior**: field hidden when condition false; shown when true.
  - **Dynamic re-evaluation**: changes to dependency fields re-evaluate visibility.
  
  Verify exact syntax / capability per Forms version. Documentation: [Camunda Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **b)** No conditional — wrong typically. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Custom JS only — partial. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Two separate forms — overstates. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda Forms conditional visibility:

  **Field-level condition**:
  - Each field has an optional condition property.
  - FEEL expression evaluating against current form data.
  - **True** → field visible.
  - **False** → field hidden.

  **Example**:
  ```json
  {
    "type": "select",
    "key": "accountType",
    "label": "Account Type",
    "values": [
      {"value": "Individual", "label": "Individual"},
      {"value": "Business", "label": "Business"}
    ]
  },
  {
    "type": "textfield",
    "key": "companyName",
    "label": "Company Name",
    "conditional": {
      "hide": "=accountType = \"Individual\""
    }
  }
  ```

  **Behavior**:
  - User selects "Business": Company Name shows.
  - User selects "Individual": Company Name hidden.
  - Smooth UI experience; relevant fields only.

  **Use cases**:

  **Use case 1: Type-dependent fields**:
  - Account type → different required fields.
  - Customer type → tier-specific options.

  **Use case 2: Progressive disclosure**:
  - Optional advanced fields; show only if user expands.
  - Reduce form length for typical use.

  **Use case 3: Validation-driven**:
  - Field A invalid → show help/hint field.
  - Inline guidance based on form state.

  **Use case 4: Multi-step within one form**:
  - Show / hide sections based on progress.

  **Conditional types**:
  - **Hide if true** (`hide` condition).
  - **Show if true** (`show` condition; opposite logic).
  - **Disable** (rather than hide) — field visible but read-only.

  **Re-evaluation triggers**:
  - Changes to referenced variables in the condition.
  - Form re-renders affected fields.

  **Validation interaction**:
  - **Hidden fields**: typically not required; validation skipped.
  - **Re-shown fields**: validate when re-visible.
  - **Submitted values**: hidden fields may or may not submit their value (depends on form config).

  **Complex conditions**:
  ```feel
  =accountType = "Business" and revenue > 1000000
  ```
  Multi-field dependencies.

  **Best practices**:

  - **Test combinations**: ensure all paths through visibility logic produce sensible forms.
  - **Avoid deep nesting**: too many conditional fields → confusing UX.
  - **Required + conditional**: thoughtfully design; hidden + required is contradictory.
  - **Default values**: hidden fields may have defaults that submit if not changed.

  **Limitations**:
  - **Complex business logic**: may exceed form capabilities; defer to BPMN logic.
  - **Cross-form dependencies**: each form typically self-contained.

  Verify exact syntax in your Camunda Forms version (`conditional`, `hide`, `show` may vary).

- **Option b) — Wrong typically.**

- **Option c) — Partial.**

- **Option d) — Overstates.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Field conditions via FEEL expressions; hide/show based on form data; dynamic re-evaluation.
- **b) 2/10** — wrong.
- **c) 4/10** — partial.
- **d) 3/10** — overstates.

**Correct Answer:** Camunda Forms support field-level conditional visibility via FEEL expressions (`hide` / `show` based on form data).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Company Name only if Business." Conditional visibility.

**Въпросът → Solution Framing.** "Conditional visibility" — изпитва се knowledge на Form conditional logic.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че field-level conditions, че FEEL expression, че dynamic re-evaluation. Това е знание за Form conditionals.

---

## Question 32: Forms (Weighting: 5%)

**Scenario:** A form needs to validate input — Email must match RFC 5322 pattern; ZIP code must be 5 digits. Team wonders Form validation options.

**Form validation — regex vs custom?**

- **a)** **Camunda Forms typically support multiple validation types**:
  - **Required**: field must have value.
  - **Min / max length**: for strings.
  - **Min / max value**: for numbers.
  - **Pattern (regex)**: regex pattern to match (e.g., `^\d{5}$` for 5-digit ZIP).
  - **Type-specific**: email-format, number format, date range.
  - **Custom validation**: via FEEL expressions or custom validators (verify per version).
  
  Multiple validators can apply per field; all must pass. Documentation: [Camunda Forms Validation](https://docs.camunda.io/docs/components/modeler/forms/)

- **b)** Only required — partial. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Custom JS only — partial. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** No validation — wrong. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda Forms validation capabilities:

  **Built-in validators**:

  **Required**:
  - Field must have a value.
  - Empty string typically counts as missing.

  **Length validators** (for strings):
  - `minLength`: minimum string length.
  - `maxLength`: maximum.

  **Value validators** (for numbers):
  - `min`: minimum value.
  - `max`: maximum.

  **Pattern (regex)**:
  - Field value must match regex pattern.
  - **Common patterns**:
    - Email: `^[^@]+@[^@]+\.[^@]+$` (simple; real RFC 5322 is more complex).
    - ZIP (US 5-digit): `^\d{5}$`.
    - Phone: depends on locale.
    - SSN, IBAN, etc.

  **Type-specific**:
  - **Email** type: built-in format validation (may or may not be RFC-strict).
  - **Number** type: digits only.
  - **Date** type: valid date format.

  **Custom validation** (verify per version):
  - **FEEL expression**: e.g., `=zip = null or matches(zip, "^\\d{5}$")`.
  - **Custom validator function**: if Forms support extensibility.

  **Multiple validators per field**:
  - All must pass for field to be valid.
  - Example: ZIP field with `required` + `pattern: ^\d{5}$` + `maxLength: 5`.

  **Validation timing**:
  - **On blur**: when user leaves field.
  - **On submit**: before form submits.
  - **Live (typing)**: as user types (more disruptive, less common).

  **Error display**:
  - **Inline error message** below field.
  - **Form-level summary**: all errors at top.
  - **Visual indicator**: red border, icon.

  **Error messages**:
  - **Default messages**: "This field is required" etc.
  - **Custom messages**: per validator.

  **For the scenario**:

  **Email field**:
  - **Type**: Email (built-in format validation).
  - **Required**: Yes.
  - **Pattern**: optional additional regex for stricter validation.

  **ZIP field**:
  - **Type**: Text Field.
  - **Pattern**: `^\d{5}$`.
  - **Custom error message**: "ZIP code must be 5 digits."

  **JSON example**:
  ```json
  {
    "type": "textfield",
    "key": "email",
    "label": "Email",
    "validate": {
      "required": true,
      "validationType": "email"
    }
  },
  {
    "type": "textfield",
    "key": "zip",
    "label": "ZIP Code",
    "validate": {
      "required": true,
      "pattern": "^\\d{5}$",
      "minLength": 5,
      "maxLength": 5
    }
  }
  ```

  **Server-side validation**:
  - **Form validates client-side**: UX feedback.
  - **Process logic re-validates**: defense in depth (e.g., FEEL validation after submit).
  - **Don't trust client**: malicious clients can bypass.

  **Validation patterns**:

  **Pattern 1: Form + process double-check**:
  - Form validates for UX.
  - Process Service Task validates programmatically.
  - Reject invalid submissions before continuing.

  **Pattern 2: Validation-driven flow**:
  - If invalid: error path returns user to form.
  - Loop until valid.

  **Pattern 3: Async validation**:
  - Pre-submit: call API to validate (e.g., check if email exists).
  - For complex business validation.

  **Best practices**:

  - **Use built-in validators first**: simpler, well-tested.
  - **Add patterns for stricter rules**: complement type-based.
  - **Clear error messages**: tell user what's wrong.
  - **Test edge cases**: empty, very long, special chars.

- **Option b) — Partial.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple validators: required, length, value, pattern, type-specific, custom FEEL.
- **b) 4/10** — partial.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Multiple validators: required, length, value range, regex pattern, type-specific, custom FEEL; combine for thorough validation.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Email RFC 5322 ZIP 5 digits." Form validation.

**Въпросът → Solution Framing.** "Regex vs custom" — изпитва се Form validators.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че multiple validators, че regex + type + length, че server-side check. Това е знание за Form validation.

---

# Section 5 — Connectors (Questions 33-36)

> Weight 7% • Topics: SOAP vs REST, SMTP Email outbound, Connector retry vs Service Task retry, Custom Connector to SaaS.

---

## Question 33: Connectors (Weighting: 7%)

**Scenario:** A legacy partner system exposes only **SOAP/XML APIs**. Team wonders if Camunda has a SOAP Connector or only REST.

**SOAP Connector availability vs REST?**

- **a)** **Verify per Camunda 8 version**: typical Connector catalog includes both:
  - **REST Outbound Connector**: HTTP-based JSON / XML.
  - **SOAP Connector**: dedicated for SOAP/XML protocols (WSDL-aware in some versions; may require manual XML composition in others).
  - **Alternative**: Generic HTTP Connector + manual SOAP envelope composition in FEEL.
  
  For complex SOAP scenarios (WS-Security, MTOM, etc.): may need custom Connector or external service. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/)

- **b)** SOAP impossible — wrong. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **c)** REST only — partial. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **d)** Must build custom — overstates. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** SOAP integration patterns:

  **SOAP Outbound Connector** (typical features when available):
  - **WSDL parsing**: import WSDL; auto-generate input/output schemas.
  - **SOAP envelope composition**: handles envelope wrapping.
  - **Authentication**: WS-Security, basic auth, custom headers.
  - **Output**: parses SOAP response; extracts relevant fields.

  **Alternative: Generic HTTP / REST Connector with manual SOAP**:
  - Compose SOAP envelope as XML string.
  - POST with content type `text/xml` or `application/soap+xml`.
  - Parse XML response manually.
  - **More work**; useful when dedicated SOAP Connector unavailable.

  **Example: manual SOAP request**:
  ```xml
  <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <GetWeather xmlns="http://example.com/weather">
        <City>London</City>
      </GetWeather>
    </soap:Body>
  </soap:Envelope>
  ```

  **In FEEL**:
  ```feel
  body = "<soap:Envelope xmlns:soap=...>" + ... + "</soap:Envelope>"
  ```

  **REST Connector configuration for SOAP**:
  - **URL**: SOAP endpoint URL.
  - **Method**: POST.
  - **Headers**: 
    - `Content-Type: text/xml; charset=utf-8`.
    - `SOAPAction: "operation-name"`.
  - **Body**: SOAP envelope XML.
  - **Response handling**: parse XML.

  **Response parsing**:
  - **XML to JSON** (verify FEEL capability or custom worker).
  - **Custom worker**: pre-parse XML; pass structured data to BPMN.

  **For WS-Security / advanced features**:
  - **WS-Security headers** (UsernameToken, signatures, encryption): complex.
  - **MTOM** (binary attachments): non-trivial.
  - **Specialised tools**: external SOAP client service; Camunda calls via REST.

  **When SOAP Connector isn't sufficient**:
  - Build a Service Task with a custom worker.
  - Worker uses a SOAP library (Apache CXF for Java, etc.).
  - Worker handles complexity; exposes clean variables to BPMN.

  **Migration patterns**:
  - **SOAP legacy → REST modernised**: build adapter service; BPMN uses REST.
  - **Coexistence**: BPMN uses both; route per partner.

  **Trade-offs**:

  | Approach | Pros | Cons |
  |----------|------|------|
  | Dedicated SOAP Connector | WSDL-aware, less manual work | Verify availability + capabilities |
  | REST Connector + manual SOAP | Flexible, no extra Connector | More work; manual XML handling |
  | Custom worker with SOAP library | Full SOAP support, libraries handle complexity | More engineering |
  | External adapter service | Modernises API; reusable | Extra service to maintain |

  Verify Camunda 8 version's exact SOAP Connector capabilities.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Overstates.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Verify catalog; SOAP Connector or REST Connector + manual SOAP envelope; custom worker for advanced.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 3/10** — overstates.

**Correct Answer:** Verify Camunda 8 version; typically SOAP Connector available, or use REST Connector with manual SOAP envelope; custom worker for advanced WS-Security / MTOM.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "SOAP/XML legacy partner." SOAP support.

**Въпросът → Solution Framing.** "SOAP vs REST" — изпитва се SOAP integration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SOAP Connector or manual, че WS-Security custom, че trade-offs. Това е знание за SOAP integration.

---

## Question 34: Connectors (Weighting: 7%)

**Scenario:** A process sends email notifications via SMTP. Team wonders if Camunda has an Email Connector and how it's configured.

**SMTP Email Outbound Connector?**

- **a)** **Camunda 8 typically includes an SMTP / Email Outbound Connector**:
  - **Configuration**: SMTP server (host, port), credentials (via secrets), TLS settings.
  - **Message fields**: from, to, cc, bcc, subject, body (text / HTML), attachments.
  - **Variables**: bind to process variables for dynamic content.
  - **Templates**: use FEEL for body composition.
  - **Attachments**: reference Document Handling variables.
  
  Verify per version. Documentation: [Email Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/email/)

- **b)** Use external service — partial. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **c)** No email Connector — wrong typically. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **d)** Only Gmail-specific — wrong. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** SMTP / Email Outbound Connector typical features:

  **Configuration**:

  **SMTP server**:
  - **Host**: smtp.example.com.
  - **Port**: 587 (TLS), 465 (SSL), 25 (plain — rarely used).
  - **Auth**: username + password (via secrets).
  - **TLS / SSL**: enable for production.

  **From SMTP secret reference**:
  - `host: smtp.company.com`.
  - `port: 587`.
  - `username: {{secrets.SMTP_USERNAME}}`.
  - `password: {{secrets.SMTP_PASSWORD}}`.

  **Message fields**:
  - **From**: sender address (often static; `noreply@company.com`).
  - **To**: recipient(s); comma-separated or list.
  - **CC, BCC**: optional.
  - **Subject**: short string.
  - **Body**: text or HTML.
  - **Attachments**: file references (Document Handling).

  **Dynamic content via FEEL**:
  ```
  to: =customer.email
  subject: ="Order " + orderNumber + " confirmation"
  body: ="Dear " + customer.name + ",\n\nYour order has been received.\n\nTotal: " + string(order.total)
  ```

  **HTML body**:
  ```feel
  bodyHtml: "<html><body><h1>Welcome " + customer.name + "</h1><p>Your account is active.</p></body></html>"
  ```

  **Attachments**:
  - Reference Document Handling variables.
  - PDF invoice generated upstream; attached to email.

  **Error handling**:
  - SMTP errors (auth fail, server down, invalid recipient): Connector throws error.
  - Boundary Error Event catches.
  - Retry logic: standard Service Task retries.

  **Security considerations**:

  - **Credentials in secrets**: never inline in BPMN.
  - **TLS**: always for production.
  - **SPF / DKIM / DMARC**: configure DNS for deliverability.
  - **Rate limiting**: SMTP providers may throttle; respect limits.
  - **Sensitive content**: encrypt or avoid PII in subject (subjects often unencrypted).

  **Common use cases**:

  - **Order confirmations**: customer.
  - **Internal notifications**: ops alerts.
  - **Reminders**: user actions pending.
  - **Reports**: generated PDFs as attachments.

  **Alternatives** (when SMTP-direct insufficient):
  - **SendGrid / Mailgun / SES Connector** (if available): SaaS email APIs.
  - **REST Connector** + custom auth.
  - **Custom Connector** for special needs.

  **Inbound email** (IMAP / POP3):
  - **Email Inbound Connector** (verify availability): listens for incoming emails.
  - **Use case**: parse incoming email → start process / continue.

  **Best practices**:

  - **Use secrets**: never plaintext credentials.
  - **Test in staging**: verify deliverability.
  - **Monitor send rates / bounce rates**: deliverability matters.
  - **Templates**: maintain email templates external from BPMN if complex.
  - **Unsubscribe links**: for marketing-like email; legal requirement.
  - **HTML + plaintext both**: max compatibility.

- **Option b) — Partial.**

- **Option c) — Wrong typically.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. SMTP / Email Connector typical; configure server + auth (secrets) + message fields; dynamic content via FEEL.
- **b) 4/10** — partial.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Camunda 8 typically includes Email Outbound Connector for SMTP; configure server + auth (via secrets) + message fields; dynamic FEEL content.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/email/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "SMTP email notifications." Email Connector.

**Въпросът → Solution Framing.** "Email Connector" — изпитва се knowledge на Email integration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SMTP Connector typical, че secrets + TLS, че dynamic content. Това е знание за Email Connector.

---

## Question 35: Connectors (Weighting: 7%)

**Scenario:** A Connector fails intermittently (partner API has occasional 500s). Team wonders if the **Connector has its own retry** or relies on standard Service Task retries.

**Connector retry vs Service Task retry?**

- **a)** **Service Task retries (BPMN-level)** apply to Connector tasks — when Connector throws, retries decrement, fail/Incident at 0 (per Set 13 Q10 / Set 14 Q10). **Some Connectors may also have internal retry logic** (e.g., HTTP Connector might retry on connection errors at a lower level). **Best practice**:
  - **BPMN-level retries**: for "this whole task should be re-attempted" semantics.
  - **Connector-internal**: for transient low-level errors (TCP retries, etc.).
  - **Both can coexist**: layered resilience.
  - **Idempotency**: critical because retries may cause duplicate calls.
  
  Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/) + [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Connector ignores retries — wrong. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **c)** No retry possible — wrong. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **d)** Only Connector retry — partial. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Connector + Service Task retry layering:

  **Layer 1: BPMN Service Task retries** (Camunda 8 standard):
  - `retries` configured on the task (default typically 3).
  - When Connector fails (throws / returns error): `job.fail()` decrements retries.
  - At 0: Incident raised; operator intervention needed.

  **Layer 2: Connector-internal retries** (optional, per Connector):
  - Some Connectors retry low-level operations (e.g., HTTP Connector retries on connection refused).
  - Transparent to BPMN: only after all internal retries fail does the Connector fail to BPMN level.

  **Coordination**:

  **Example**: HTTP Connector with internal retries (3) + BPMN retries (3):
  - Connection fails: Connector internally retries up to 3 times.
  - All 3 internal retries fail: Connector reports failure to BPMN.
  - BPMN decrements retries (now 2 left).
  - BPMN re-activates Connector job; Connector again retries internally up to 3 times.
  - Up to 3 × 3 = 9 actual HTTP attempts before Incident.

  **Configuration**:

  **BPMN-level**:
  ```xml
  <bpmn:serviceTask id="CallPartner">
    <bpmn:extensionElements>
      <zeebe:taskDefinition type="io.camunda:http-json:1" retries="3" />
      <zeebe:taskHeaders>
        <zeebe:header key="url" value="https://partner.example.com/api" />
        <zeebe:header key="method" value="POST" />
      </zeebe:taskHeaders>
    </bpmn:extensionElements>
  </bpmn:serviceTask>
  ```

  **Connector-internal** (depends on Connector):
  - May not be exposed in standard config.
  - Implementation detail.

  **For transient errors**:

  **Strategy 1: BPMN retries with backoff**:
  - Standard BPMN retries (3, 5, 10) cover transient issues.
  - Each retry typically immediate (no backoff in basic BPMN).
  - For backoff: use Timer between retries (custom flow).

  **Strategy 2: Backoff via process model**:
  - Connector → Error Boundary → Timer (delay) → loop back.
  - Custom retry loop with controllable delay.

  **Strategy 3: Custom retry logic in worker**:
  - For custom Connectors / Service Tasks.
  - Code-level retry with exponential backoff.

  **For permanent errors**:
  - **BPMN error code mapping**: Connector throws specific error codes (404, 401, 500-class differently).
  - **Error Boundary**: route based on error type.
  - **400-class (client error)**: don't retry; investigate input.
  - **500-class (server error)**: retry; may resolve.
  - **Network errors**: retry; likely transient.

  **Idempotency** (critical with retries):
  - Same request may be sent multiple times (network retries, BPMN retries).
  - Partner should handle idempotently (idempotency keys, deduplication).
  - If partner not idempotent: design retry to be safe (read-only operations, etc.).

  **Monitoring**:
  - **Retry counts**: high retry rates signal partner issues.
  - **Incidents**: alert on exhausted retries.
  - **Latency**: retries add latency; track to detect degradation.

  **Best practices**:

  - **Sensible retry counts**: 3-5 for transient; don't retry permanent errors.
  - **Idempotency**: critical for safe retries.
  - **Backoff**: avoid hammering failing partners.
  - **Monitor + alert**: on retry rates and incidents.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. BPMN Service Task retries apply to Connector; Connector may have internal retries; layered resilience; idempotency critical.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** Connector tasks use BPMN Service Task retries; Connector may also have internal retries; layered resilience; ensure idempotency.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Connector intermittent fail 500 retries." Retry layers.

**Въпросът → Solution Framing.** "Connector retry vs Service Task retry" — изпитва се retry coordination.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BPMN retries apply, че Connector-internal optional, че layered + idempotent. Това е знание за retry layering.

---

## Question 36: Connectors (Weighting: 7%)

**Scenario:** A team builds a custom Connector for their internal CRM. They use Camunda 8 SaaS. Team wonders how to **deploy** the custom Connector to SaaS.

**Custom Connector deployment to SaaS?**

- **a)** **Custom Connector deployment to SaaS depends on Camunda 8 SaaS feature set** (verify per version):
  - **Connector SDK**: build Connector as JAR (Java) or package (other languages).
  - **SaaS deployment options**:
    - **Camunda-supported custom Connectors**: upload package to cluster (via Console / API).
    - **Webhook + external service**: easier alternative — external service exposes endpoint; BPMN uses Webhook Inbound or REST Outbound to call.
    - **Connector Runtime hosted externally**: deploy custom Connector Runtime instance you control; cluster pulls jobs.
  
  **Self-Managed** alternatives offer more direct custom Connector deployment.
  
  Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/) + [Console SaaS](https://docs.camunda.io/docs/components/console/)

- **b)** SaaS doesn't allow custom — partial; verify. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **c)** Direct deploy like BPMN — partial; differs. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **d)** Self-Managed only for custom — overstates. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Custom Connector + SaaS considerations:

  **Custom Connector basics**:

  **Build**:
  - **Java**: Connector SDK; build JAR.
  - **Other languages**: may have alternative SDKs / runtimes.
  - **Element Template**: define for Web Modeler property panel.
  - **Implementation**: handle input, perform action, return output.

  **For Self-Managed** (simpler for custom):
  - Mount Connector JAR in Connector Runtime container.
  - Restart Runtime; Connector available.
  - Or: build custom image with Connectors bundled.

  **For SaaS** (verify per version):

  **Option 1: Camunda-supported uploads**:
  - SaaS may allow uploading custom Connector packages.
  - Console UI / API for upload.
  - Cluster runs them.
  - Verify specific support + size limits.

  **Option 2: External Connector Runtime**:
  - Deploy your own Connector Runtime instance (e.g., as Kubernetes pod).
  - Runtime connects to Camunda SaaS via OAuth client credentials.
  - Runtime polls SaaS for jobs of your Connector's type.
  - **Pros**: full control; **Cons**: extra infrastructure.

  **Option 3: Webhook + external service**:
  - **Webhook Inbound Connector** in SaaS catches HTTP webhook.
  - External service exposes business logic via HTTP.
  - BPMN ↔ External via Webhook.
  - **Pros**: no Connector SDK needed; **Cons**: less integrated; more network hops.

  **Option 4: REST Outbound + external service**:
  - **REST Outbound Connector** calls your custom service.
  - Custom logic in service.
  - Simple integration via HTTP.

  **For the CRM scenario**:

  **Approach A: Webhook / REST integration**:
  - Build CRM API endpoint.
  - BPMN uses REST Connector to invoke.
  - No custom Connector deployment; just standard REST.
  - **Pros**: simple, works in SaaS; **Cons**: less native UX (no custom Element Template polish unless using Element Templates).

  **Approach B: External Connector Runtime with custom Connector**:
  - Build custom Connector (CrmConnector class).
  - Deploy to your-controlled Connector Runtime.
  - Runtime registers Connector type with SaaS cluster (via OAuth).
  - BPMN uses custom Connector type.
  - **Pros**: native Connector UX, custom Element Template; **Cons**: maintain Runtime.

  **Approach C: Upload to SaaS (if supported)**:
  - Verify SaaS version's custom Connector upload feature.
  - Upload JAR via Console.
  - Cluster integrates.

  **Element Templates** (regardless of deployment approach):
  - Upload Element Template JSON to Web Modeler project.
  - Provides nice UI for modelers regardless of Connector implementation.

  **Best practices**:

  - **Start simple**: use REST/Webhook for low-investment integration.
  - **Upgrade to custom Connector**: when polished UX matters and team has SDK skills.
  - **Document the architecture**: which layer handles what.
  - **Versioning**: custom Connectors need versioning like any code.

  **Trade-offs**:

  | Approach | UX | Effort | Maintenance |
  |----------|-----|--------|-------------|
  | REST Connector + custom API | Generic; modeler types URL | Low | Low |
  | Element Template + REST | Polished UX, calls REST | Medium | Low |
  | External Connector Runtime | Native | High | Medium (Runtime ops) |
  | SaaS-uploaded Connector | Native | Medium | Low (Camunda manages) |

- **Option b) — Partial.**

- **Option c) — Partial.**

- **Option d) — Overstates.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. SaaS custom Connector: verify upload support, OR external Connector Runtime, OR Webhook / REST integration.
- **b) 4/10** — partial.
- **c) 4/10** — partial.
- **d) 3/10** — overstates.

**Correct Answer:** Verify SaaS custom Connector upload feature; alternatively use external Connector Runtime with OAuth, or Webhook / REST integration for simpler cases.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "custom Connector CRM SaaS deploy." Custom Connector SaaS.

**Въпросът → Solution Framing.** "Deploy to SaaS" — изпитва се custom Connector lifecycle.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че multiple approaches, че trade-offs, че Element Template + various backends. Това е знание за custom Connector deploy.

---

# Section 6 — Extensions (Questions 37-50)

> Weight 23% • Topics: FEEL flatten, distinct values, BKM typing, date arithmetic, @Variable vs @VariablesAsType, Node max concurrent, REST timeout, identity token caching, custom Connector secrets, Webhook auth modes, RPA orchestration, decimal rounding modes, list union/intersection, gRPC keepalive.

---

## Question 37: Extensions (Weighting: 23%)

**Scenario:** A FEEL variable `data = [[1, 2], [3, 4], [5]]` is a list of lists. Team wants a flat `[1, 2, 3, 4, 5]`.

**FEEL `flatten` for nested lists?**

- **a)** **FEEL typically provides `flatten` function**: `flatten([[1,2], [3,4], [5]])` → `[1, 2, 3, 4, 5]`. Flattens one level by default; some implementations support multi-level via parameter or recursion. Verify exact signature per FEEL version. **Alternative**: nested for-loops with concatenate. Documentation: [FEEL List Functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** No flatten function — wrong typically. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Manual loop only — overcomplicated. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Use `concatenate` — partial. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `flatten`:

  **Signature** (typical):
  - `flatten(list)`: flattens one level of nesting.
  - Some versions: depth parameter for multi-level.

  **Examples**:
  ```feel
  flatten([[1, 2], [3, 4], [5]])         → [1, 2, 3, 4, 5]
  flatten([["a", "b"], ["c"]])            → ["a", "b", "c"]
  flatten([])                             → []
  ```

  **Multi-level**:
  - `flatten([[[1, 2]], [[3]]])` → may produce `[[1,2], [3]]` (one level) or `[1,2,3]` (full) per version.
  - Verify exact depth semantics.

  **Use cases**:

  **Use case 1: Aggregating MI outputs**:
  - MI subprocess where each iteration returns a list.
  - `outputCollection` becomes list of lists.
  - `flatten(outputCollection)` produces flat list.

  **Use case 2: Combining lookups**:
  - For each customer, lookup their orders → list of orders per customer.
  - `flatten(allCustomerOrders)` → flat list of all orders.

  **Use case 3: Multiple search results**:
  - Multi-page API results: each page = list.
  - All pages = list of pages.
  - `flatten(pages)` → all items.

  **Compare with concatenate**:
  - `concatenate(list1, list2, list3)` joins explicit lists.
  - `flatten(listOfLists)` flattens a single list of lists.
  - Concatenate when you know the lists; flatten when you have a nested structure.

  **Compare with for-loop**:
  ```feel
  for inner in nested
    return inner
  ```
  This actually produces a flat list too (FEEL for returns list; inner being a list each yields the inner; result is concatenation of inner lists when used appropriately).

  **Defensive null handling**:
  - `flatten(null)` may error.
  - `=if data != null then flatten(data) else []`.

  **Empty inner lists**:
  - `flatten([[1,2], [], [3]])` → `[1, 2, 3]` (empty contributes nothing).

  **Mixed types in inner lists**:
  - `flatten([[1, "a"], [true]])` → `[1, "a", true]`.
  - Type-agnostic; preserves inner element types.

- **Option b) — Wrong typically.**

- **Option c) — Overcomplicated.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `flatten(list)` flattens nested list; one level typically; verify multi-level support.
- **b) 2/10** — wrong.
- **c) 3/10** — overcomplicated.
- **d) 5/10** — partial.

**Correct Answer:** `flatten(list)` flattens nested list (one level typically); use for aggregating list-of-lists into flat list.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "[[1,2],[3,4],[5]] → flat." List flatten.

**Въпросът → Solution Framing.** "Flatten function" — изпитва се FEEL list functions.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че flatten() typical, че MI outputs use case, че null defense. Това е знание за FEEL flatten.

---

## Question 38: Extensions (Weighting: 23%)

**Scenario:** A list has duplicates: `[1, 2, 2, 3, 3, 3]`. Team wants unique: `[1, 2, 3]`.

**FEEL `distinct values` for deduplication?**

- **a)** **FEEL provides `distinct values(list)`**: returns list with duplicates removed; order preserved (first occurrence kept typically). Example: `distinct values([1, 2, 2, 3, 3, 3])` → `[1, 2, 3]`. **Equality semantics**: based on FEEL equality (type-aware). Verify exact name per FEEL version (some use `distinct`, some `distinct values`). Documentation: [FEEL List Functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** No dedup function — wrong typically. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Set conversion — partial. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Manual filter — overcomplicated. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL deduplication:

  **`distinct values`** (DMN FEEL spec):
  - Removes duplicates from a list.
  - Returns deduplicated list.
  - Order: typically preserves order of first occurrence.

  **Examples**:
  ```feel
  distinct values([1, 2, 2, 3, 3, 3])        → [1, 2, 3]
  distinct values(["a", "b", "a"])             → ["a", "b"]
  distinct values([])                          → []
  distinct values([1, "1", 1])                 → [1, "1"]  (type-strict: 1 ≠ "1")
  ```

  **Equality semantics**:
  - **Type-strict**: number 1 ≠ string "1".
  - **Structural equality** for compounds: `{a: 1}` and `{a: 1}` may be considered equal.

  **Use cases**:

  **Use case 1: Unique customer IDs from order list**:
  ```feel
  distinct values(for order in orders return order.customerId)
  ```
  Returns unique customer IDs.

  **Use case 2: Deduplicate after aggregation**:
  ```feel
  distinct values(flatten(allTags))
  ```
  Combine: flatten nested tag lists, then deduplicate.

  **Use case 3: Set-like operations**:
  - FEEL doesn't have native Set type; use distinct values for set semantics.
  - Intersect: `for x in list1 satisfies (some y in list2 satisfies y = x)` — combine with distinct.

  **For complex objects**:
  - **Dedupe by key**: more involved; may need custom logic.
  - **Native distinct values** compares whole objects.

  **Example with objects**:
  ```feel
  distinct values([{id: 1}, {id: 1}, {id: 2}])
  ```
  - If FEEL structural equality matches: returns `[{id: 1}, {id: 2}]`.
  - If not: may return all 3 (treating each `{id:1}` as distinct).
  - Verify per FEEL version.

  **For dedupe-by-field**:
  - Workaround: project to keys, dedupe, then look up originals.
  ```feel
  let uniqueIds = distinct values(for o in objs return o.id)
  return for id in uniqueIds 
    return (objs[item.id = id])[1]
  ```

  **Compare with `union`** (if available):
  - `union(list1, list2)` may implicitly deduplicate when joining.

  **Performance**:
  - O(n²) typical for distinct (each element compared with all previous).
  - For large lists: consider preprocessing in workers.

  **Anti-patterns**:
  - **Not deduplicating when needed**: downstream surprised by duplicates.
  - **Distinct on wrong key**: dedupes by whole-object equality when by-field intended.

- **Option b) — Wrong typically.**

- **Option c) — Partial.**

- **Option d) — Overcomplicated.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `distinct values(list)` removes duplicates; order-preserving; type-strict equality.
- **b) 2/10** — wrong.
- **c) 4/10** — partial.
- **d) 3/10** — overcomplicated.

**Correct Answer:** `distinct values(list)` removes duplicates; verify exact function name in your FEEL version.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "[1,2,2,3,3,3] dedupe." List deduplication.

**Въпросът → Solution Framing.** "Distinct values" — изпитва се FEEL dedup function.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че distinct values, че type-strict, че complex object caveats. Това е знание за FEEL dedup.

---

## Question 39: Extensions (Weighting: 23%)

**Scenario:** A BKM (Business Knowledge Model) parameter is declared as `number`. Caller passes `"42"` (string). Team wonders if BKM parameters are type-enforced.

**BKM parameter typing?**

- **a)** **BKM parameters declared with types are type-enforced per FEEL semantics**:
  - **Caller passes wrong type**: depends on FEEL implementation — may produce null or error.
  - **Type-strict** (FEEL's typical mode): no auto-coercion (per Set 13 Q22).
  - **Caller responsibility**: convert before invocation: `myBKM(number(amountStr))`.
  
  **For untyped parameters**: no enforcement; accepts any type.
  **Best practice**: declare types for clarity + early error detection. Documentation: [DMN BKM](https://docs.camunda.io/docs/components/modeler/dmn/) + [FEEL Types](https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-data-types/)

- **b)** Auto-coerced — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** No types in BKM — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Always errors — partial. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BKM parameter typing:

  **BKM declaration**:
  - **Parameter list**: name + type per parameter.
  - **Types**: `string`, `number`, `boolean`, `date`, list types, structured types.
  - **Untyped option**: parameter without type; accepts any.

  **Example BKM**:
  ```
  BKM: calculateTax
  Parameters: 
    - amount: number
    - rate: number
  Body: amount * rate
  ```

  **Invocation**:
  ```feel
  calculateTax(amount: 100, rate: 0.2)        → 20  (number both)
  calculateTax(100, 0.2)                       → 20 (positional)
  calculateTax(amount: "100", rate: 0.2)       → may error or return null (string passed to number param)
  ```

  **Type-strict behavior**:
  - **String passed to number param**: rejected; null / error per FEEL semantics.
  - **No auto-coercion** (per Set 13 Q22).

  **Caller's responsibility**:
  ```feel
  calculateTax(number(amountStr), rate)
  ```
  Convert explicitly.

  **Untyped parameter**:
  - **No type check**; any type accepted.
  - **Use with care**: less safe; type errors surface inside BKM body.

  **Benefits of typing**:

  **Early error detection**:
  - Type mismatch caught at invocation.
  - Easier debugging than mid-evaluation errors.

  **Documentation**:
  - Clear contract: callers know expected types.
  - Self-documenting BKM.

  **Tool support**:
  - Modelers may catch type mismatches at design time.
  - Web Modeler property panel hints.

  **Best practices**:

  - **Always declare types** for BKM parameters.
  - **Document types in BKM name / description**: "calculateTaxNum(amountNum, rateNum)".
  - **Defensive callers**: convert types before invocation.
  - **Test boundary cases**: null, type mismatches, edge values.

  **Compare with decision input types**:
  - Decision input columns also typed (per Set 13 Q26).
  - Same FEEL semantics; same type-strict behavior.

  **List parameters**:
  - **`list<number>`**: list of numbers; elements typed.
  - **`list<any>`**: untyped list elements.

  **Complex types** (structured):
  - **`{name: string, age: number}`**: structured type.
  - Verify FEEL implementation supports complex type declarations.

  **For untyped BKM** (no parameter types):
  - Useful for generic utility BKMs.
  - More flexible; less safe.
  - Document expected types in description.

  **Anti-patterns**:
  - **Over-coercion in BKM body**: `body: number(amount) * number(rate)` — defensive but obscures intent. Better: enforce types in parameters; callers convert.
  - **No types**: silent type errors deep in evaluation.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. BKM parameter types enforced per FEEL strict semantics; no auto-coercion; caller converts.
- **b) 1/10** — wrong.
- **c) 2/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** BKM parameters with types are FEEL-strict enforced; caller must convert before invocation; declare types for clarity + safety.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-data-types/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "BKM parameter number caller string." BKM typing.

**Въпросът → Solution Framing.** "Type-enforced" — изпитва се FEEL typing for BKM.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че type-strict, че caller responsibility, че typing benefits. Това е знание за BKM types.

---

## Question 40: Extensions (Weighting: 23%)

**Scenario:** Team needs `daysBetween = endDate - startDate` in FEEL. Wonders syntax / type.

**FEEL date arithmetic — date subtraction?**

- **a)** **FEEL supports date arithmetic per DMN spec**:
  - **`date - date`**: returns a `days and time duration`.
  - **Extract days**: `days(duration)` or via duration accessor.
  - Example: `date("2026-05-15") - date("2026-05-10")` → duration of 5 days.
  - **`date + duration`**: returns new date.
  - **`duration + duration`**: combine durations.
  
  Verify exact accessor syntax per FEEL version. Documentation: [FEEL Date and Time](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** No date arithmetic — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Convert to days first — partial. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Errors on date subtraction — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL temporal arithmetic:

  **Types**:
  - **`date`**: `2026-05-15`.
  - **`time`**: `09:30:00`.
  - **`date and time`**: `2026-05-15T09:30:00`.
  - **`days and time duration`**: `PT24H` or `P1D`.
  - **`years and months duration`**: `P1Y2M`.

  **Arithmetic operations**:

  **date - date** = duration:
  ```feel
  date("2026-05-15") - date("2026-05-10")    → P5D (5 days)
  ```

  **date + duration** = new date:
  ```feel
  date("2026-05-10") + duration("P7D")        → date("2026-05-17")
  ```

  **date - duration** = earlier date:
  ```feel
  date("2026-05-15") - duration("P7D")        → date("2026-05-08")
  ```

  **duration + duration** = combined:
  ```feel
  duration("P5D") + duration("P3D")           → P8D
  ```

  **date and time arithmetic**:
  ```feel
  date and time("2026-05-15T10:00:00") - date and time("2026-05-15T08:30:00")  → PT1H30M
  ```

  **Extracting components from duration**:

  - **`days(duration)`**: get days portion (verify exact accessor).
  - **`hours(duration)`**: hours.
  - **`minutes(duration)`**: minutes.
  - **`seconds(duration)`**: seconds.

  Or via property access (some FEEL implementations):
  - `duration.days`, `duration.hours`, etc.

  **For "daysBetween" specifically**:
  ```feel
  daysBetween = (endDate - startDate).days
  ```
  Or:
  ```feel
  daysBetween = days(endDate - startDate)
  ```
  Verify exact syntax per version.

  **Common date functions**:

  - **`today()`**: current date.
  - **`now()`**: current date and time.
  - **`year(date)`, `month(date)`, `day(date)`**: extract components.
  - **`day of week(date)`**: weekday.
  - **`day of year(date)`**: day number in year.
  - **`week of year(date)`**: week number.

  **Date construction**:
  ```feel
  date("2026-05-15")
  date and time("2026-05-15T09:30:00")
  date(2026, 5, 15)           // depends on FEEL version
  ```

  **Use cases**:

  **Use case 1: Age calculation**:
  ```feel
  ageInYears = (today() - birthDate).years     // years and months duration component
  ```

  **Use case 2: Due date check**:
  ```feel
  isOverdue = today() > dueDate
  ```

  **Use case 3: Business day calculation**:
  - Native FEEL doesn't have "business day" function.
  - Combine date + day of week + loop.
  - Or pre-compute externally.

  **Use case 4: SLA tracking**:
  ```feel
  elapsed = now() - taskStartedAt
  isOverSLA = elapsed > duration("PT2H")
  ```

  **Time zone considerations**:
  - **date and time with time zone**: `2026-05-15T09:30:00+02:00`.
  - **Arithmetic respects time zones** typically.
  - **Comparisons**: convert to common time zone for clarity.

  **Pitfalls**:

  **Pitfall 1: Type mismatch**:
  - `date + number` (without explicit days unit): error.
  - Always use duration for "add days".

  **Pitfall 2: Date vs date and time confusion**:
  - `date("2026-05-15") - date and time("2026-05-15T00:00:00")`: type mismatch likely.
  - Convert one to match.

  **Pitfall 3: Negative durations**:
  - `endDate - startDate` may be negative if endDate < startDate.
  - Be aware in calculations.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. date - date = duration; date + duration = date; extract via accessors / functions.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** FEEL supports date arithmetic per DMN spec: date − date = duration; date + duration = date; extract days via accessors.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "daysBetween endDate - startDate." Date arithmetic.

**Въпросът → Solution Framing.** "Date subtraction" — изпитва се FEEL temporal.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че date - date = duration, че arithmetic types, че extractors. Това е знание за FEEL date math.

---

## Question 41: Extensions (Weighting: 23%)

**Scenario:** Spring Zeebe worker uses `@Variable` for individual variables vs `@VariablesAsType` for whole object. Team wonders when to use which.

**Spring Zeebe @Variable vs @VariablesAsType?**

- **a)** **Different injection styles**:
  - **`@Variable String orderId`**: inject specific variable by name.
  - **`@VariablesAsType OrderContext order`**: inject whole variable set (or subset) as a typed Java object.
  - **`@Variable`** when you need 1-2 specific values.
  - **`@VariablesAsType`** when working with structured data; benefits from type-safe access.
  - **Combine**: a handler can use both.
  
  Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** Identical — wrong. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** Only @Variable — wrong. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** @VariablesAsType deprecated — wrong. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Variable injection styles in Spring Zeebe:

  **@Variable (single variable)**:
  ```java
  @JobWorker(type = "process-order")
  public Map<String, Object> handle(
      @Variable String orderId,
      @Variable BigDecimal amount,
      @Variable String customerId
  ) {
      // use orderId, amount, customerId
  }
  ```
  - Each annotation binds one process variable.
  - Type conversion attempted (JSON → Java type).
  - **Pros**: explicit; minimal data brought into handler.
  - **Cons**: many annotations if handler needs many variables.

  **@VariablesAsType (whole object)**:
  ```java
  public class OrderContext {
      private String orderId;
      private BigDecimal amount;
      private Customer customer;
      // getters / setters
  }
  
  @JobWorker(type = "process-order")
  public Map<String, Object> handle(
      @VariablesAsType OrderContext order
  ) {
      // use order.getOrderId() etc.
  }
  ```
  - All process variables mapped to a single typed object.
  - Type conversion via Jackson (typical) — JSON deserialisation.
  - **Pros**: clean code; type-safe; works with nested structures.
  - **Cons**: brings all variables (may be inefficient if many unused); fragile if process variables change shape.

  **When to use @Variable**:

  - **Few variables**: 1-3 specific values.
  - **Simple types**: strings, numbers, booleans.
  - **Cherry-pick**: only what's needed.
  - **Performance**: minimal data transfer.

  **When to use @VariablesAsType**:

  - **Many related variables**: structured business data.
  - **Complex types**: nested objects, lists.
  - **Type safety**: prefer object-oriented access.
  - **Code clarity**: less ceremony than many @Variable annotations.

  **Combine both**:
  ```java
  @JobWorker(type = "process-order")
  public Map<String, Object> handle(
      @Variable String orderId,
      @VariablesAsType OrderDetails details
  ) {
      // orderId for logging
      // details for richer access
  }
  ```

  **Return value handling**:
  - Handler returns `Map<String, Object>` → variables to set in process scope.
  - Or annotated POJO with `@VariablesAsType` return (verify version).

  **Customising serialisation**:
  - Jackson annotations on POJO: `@JsonIgnore`, `@JsonProperty`, etc.
  - Custom serialisers / deserialisers for special types.

  **Edge cases**:

  **Missing variable**:
  - **@Variable**: may inject null or throw (configurable).
  - **@VariablesAsType**: missing fields → null in POJO.

  **Type mismatch**:
  - **@Variable**: type conversion fails → error.
  - **@VariablesAsType**: Jackson deserialisation may fail; handle exceptions.

  **Naming**:
  - **@Variable("explicit_name")**: override default (parameter name).
  - **@VariablesAsType**: field names match variable names; use Jackson annotations for renames.

  **Best practices**:

  - **Match style to needs**: prefer @Variable for simple cases.
  - **Use POJOs for structured data**: cleaner code.
  - **Document POJO contracts**: process variables must match POJO shape.
  - **Versioning**: changing POJO shape may break in-flight workers.

  **Other annotations**:
  - **`@CustomHeaders`**: inject task headers.
  - **`@ActivatedJob job`**: access raw job object for advanced needs.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. @Variable for cherry-picked; @VariablesAsType for typed POJO of whole / structured data; combine for clarity.
- **b) 1/10** — wrong.
- **c) 2/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** @Variable injects single variables; @VariablesAsType maps to typed POJO; choose by complexity / clarity needs.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "@Variable vs @VariablesAsType." Variable injection.

**Въпросът → Solution Framing.** "When to use which" — изпитва се Spring Zeebe annotations.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че @Variable single, че @VariablesAsType POJO, че combine for clarity. Това е знание за variable injection.

---

## Question 42: Extensions (Weighting: 23%)

**Scenario:** Node.js SDK worker. Team wants to limit max concurrent jobs to 10 (e.g., to respect downstream API rate limits).

**Node.js SDK max concurrent jobs config?**

- **a)** **Node SDKs typically expose concurrency config**:
  - **`maxJobsActive`** or similar option on worker creation: how many jobs to handle concurrently.
  - **Long-poll batching**: SDK fetches up to maxJobsActive; processes in parallel.
  - **Timeout**: per-job activation timeout.
  - **Backpressure**: when at max, no new fetches until some complete.
  
  Example: `zbc.createWorker({ taskType: "...", maxJobsActive: 10, taskHandler: ... })`. Verify exact API per SDK version. Documentation: [Node SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **b)** Always unlimited — wrong. Documentation: [Node SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **c)** Always 1 — wrong. Documentation: [Node SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **d)** Not configurable — wrong. Documentation: [Node SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Node SDK concurrency tuning:

  **Configuration** (verify per SDK version):
  ```js
  const zbc = new ZeebeClient({...});
  
  zbc.createWorker({
    taskType: "process-payment",
    maxJobsActive: 10,
    timeout: 60000,  // 60s activation timeout
    taskHandler: async (job) => {
      // handler
    }
  });
  ```

  **Key options**:
  - **`maxJobsActive`**: max concurrent jobs (e.g., 10).
  - **`timeout`**: activation timeout per job.
  - **`pollInterval`**: how often to poll if no jobs available.
  - **`longPoll`**: long-poll duration.

  **Backpressure**:
  - SDK fetches batch (up to maxJobsActive).
  - Handles in parallel (async).
  - When all complete: fetches next batch.
  - Doesn't fetch more than maxJobsActive at once.

  **For rate-limited downstream**:
  - Set maxJobsActive ≤ downstream rate budget.
  - Combined with proper timeout, gives controlled throughput.

  **Tuning examples**:

  **Conservative** (slow downstream):
  - `maxJobsActive: 5`, `timeout: 120000` (2 min).
  - 5 jobs/2min = 2.5 jobs/min throughput cap.

  **Aggressive** (fast downstream):
  - `maxJobsActive: 100`, `timeout: 30000` (30s).
  - High concurrency; fast cycling.

  **Mixed workloads** (multiple workers):
  - Different task types with different concurrency settings.
  - Each worker independent.

  **Beyond single-process limits**:
  - One Node process: thread-pool / event-loop limits.
  - **Horizontal scaling**: multiple Node instances.
  - Combined throughput = sum of per-instance maxJobsActive.

  **Per-job latency**:
  - Independent of concurrency setting.
  - But high concurrency may saturate downstream → increased latency.

  **Compared to Java (Spring Zeebe)** (per Set 14 Q19):
  - Similar concepts: maxJobsActive + thread pool.
  - Java: thread pool explicit.
  - Node: async/await + event loop; concurrent doesn't mean parallel threads.

  **Async-specific considerations** (Node):
  - **Event loop**: single-threaded; concurrency = interleaved async tasks.
  - **CPU-bound work**: blocks event loop; reduces effective concurrency.
  - **For CPU-bound**: use worker threads or child processes.
  - **For I/O-bound** (HTTP, DB calls): event loop handles well.

  **Monitoring**:
  - Track active jobs count.
  - Track completion rate vs maxJobsActive.
  - Alert if at max for extended periods (under-provisioned).

  **Best practices**:

  - **Right-size maxJobsActive**: match downstream capacity + buffer.
  - **Activation timeout > worst-case job duration**: avoid duplicate execution (per Set 13 Q10).
  - **Monitor saturation**: scale horizontally if consistently at max.
  - **Test under load**: validate before production.

  **For rate limiting**:
  - Combine maxJobsActive with explicit rate limiting in handler (token bucket etc.).
  - Or use external rate limiter (Redis-based).
  - maxJobsActive alone doesn't enforce time-based rate limits.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Node SDKs expose maxJobsActive; backpressure-based; tune per downstream capacity.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Configure `maxJobsActive` (or similar) on worker creation; backpressure-based concurrency limit; tune per downstream rate budget.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/node-js-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "max concurrent jobs to 10 rate limit." Concurrency limit.

**Въпросът → Solution Framing.** "Max concurrent" — изпитва се Node SDK config.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че maxJobsActive, че backpressure, че tune per downstream. Това е знание за Node concurrency.

---

## Question 43: Extensions (Weighting: 23%)

**Scenario:** REST Outbound Connector calls a slow API; default timeout 30s. Team wants 5min timeout for specific calls.

**REST Connector timeout configuration?**

- **a)** **REST Outbound Connector typically allows configurable timeout**:
  - **Per-task config**: timeout property; FEEL expression possible.
  - **Default**: vary per version (typically 30s-60s).
  - **Override**: set in BPMN task config or Element Template binding.
  - **Connection timeout vs read timeout**: may be separate settings.
  
  For very long-running APIs: REST may not be ideal — consider async patterns (return immediately with operation ID, poll for result). Documentation: [REST Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

- **b)** Default only — wrong. Documentation: [REST Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

- **c)** Cannot configure — wrong. Documentation: [REST Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

- **d)** Use external service — overstates. Documentation: [REST Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** REST Connector timeout settings:

  **Timeout types** (typical):

  **Connection timeout**:
  - How long to wait for TCP connection establishment.
  - Default: typically 10-30s.
  - Tune: 5s for fast networks; 30s for unreliable.

  **Read timeout** / **Request timeout**:
  - How long to wait for response after sending request.
  - Default: 30-60s typically.
  - Tune: based on API's expected response time.

  **Total timeout** (some implementations):
  - Combined max time for whole request.

  **Configuration in BPMN**:
  ```xml
  <bpmn:serviceTask id="CallSlowAPI">
    <bpmn:extensionElements>
      <zeebe:taskDefinition type="io.camunda:http-json:1" />
      <zeebe:taskHeaders>
        <zeebe:header key="url" value="https://slow.example.com/api" />
        <zeebe:header key="method" value="POST" />
        <zeebe:header key="connectionTimeoutInSeconds" value="30" />
        <zeebe:header key="readTimeoutInSeconds" value="300" />
      </zeebe:taskHeaders>
    </bpmn:extensionElements>
  </bpmn:serviceTask>
  ```

  Verify exact header / property names per Connector version.

  **In Web Modeler / Element Template**:
  - Properties for timeouts exposed in UI.
  - Modeler sets values per task.

  **Trade-offs**:

  **Short timeout**:
  - **Pros**: fast failure detection; quick retry cycle.
  - **Cons**: legitimate slow responses fail.

  **Long timeout**:
  - **Pros**: handles slow APIs; fewer false failures.
  - **Cons**: blocks task for long time; resource consumption; harder to detect actual failures.

  **For 5min timeout**:
  - Acceptable for known-slow APIs (e.g., report generation, complex queries).
  - Combine with activation timeout (per Set 14 Q10): activation timeout > read timeout + buffer.
  - **Anti-pattern**: very long REST timeouts indicate maybe the API should be async.

  **Async patterns** (for very long operations):

  **Pattern 1: Submit + poll**:
  - REST Connector POST: returns operation ID.
  - Then: Timer wait → REST Connector GET (poll) for status.
  - Loop until completed.
  - **Pros**: short-lived API calls; resilient to slow processing.
  - **Cons**: more complex BPMN.

  **Pattern 2: Submit + webhook**:
  - REST Connector POST: returns operation ID; partner promises webhook on completion.
  - BPMN waits for Message Catch correlated by operation ID.
  - **Pros**: no polling; event-driven.
  - **Cons**: requires partner support; webhook plumbing.

  **Pattern 3: Long-running job worker**:
  - Custom worker handling the slow call.
  - Activation timeout long.
  - Idempotent handling for safety.

  **Timeout in Element Template**:
  ```json
  {
    "label": "Read Timeout (seconds)",
    "type": "Number",
    "binding": {
      "type": "zeebe:taskHeader",
      "key": "readTimeoutInSeconds"
    },
    "value": 300,
    "constraints": {
      "min": 1,
      "max": 3600
    }
  }
  ```

  **Activation timeout coordination**:
  - **Service Task activation timeout** (per Set 13 Q10): must be longer than expected REST call time.
  - If REST timeout = 5min but activation timeout = 1min: broker re-activates while worker still in REST call → duplicate execution.
  - **Always**: activation timeout > REST timeout + buffer.

  **Best practices**:

  - **Profile your APIs**: P99 response time → timeout = P99 × 2.
  - **Different timeouts per call**: not all REST calls are the same.
  - **Test failure modes**: simulate slow responses; verify behavior.
  - **Async for very slow**: 1-5+ min responses → reconsider sync REST.
  - **Coordinate activation timeout**: > REST timeout.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Overstates.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. REST Connector configurable timeout; per-task setting; connection + read timeout types; coordinate with activation timeout.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 3/10** — overstates.

**Correct Answer:** REST Connector supports configurable timeout via task headers (connection + read); set per-task; coordinate with activation timeout to avoid duplicate execution.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "slow API 5min timeout." REST timeout.

**Въпросът → Solution Framing.** "Timeout config" — изпитва се Connector config.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че configurable per-task, че connection vs read, че coordinate with activation. Това е знание за REST timeout.

---

## Question 44: Extensions (Weighting: 23%)

**Scenario:** Java SDK worker authenticates via OAuth client credentials. Token has 1h expiry. Team wonders if SDK auto-refreshes tokens.

**SDK token caching + refresh?**

- **a)** **Camunda SDKs typically auto-manage OAuth tokens**:
  - **Initial token**: SDK requests on first API call.
  - **Cache**: holds token until near expiry.
  - **Refresh**: requests new token before expiry (often a few minutes ahead).
  - **Transparent to worker code**: worker doesn't see auth complexity.
  - **Failure handling**: token refresh failures surface as auth errors.
  
  Verify per SDK version. Documentation: [Spring Zeebe Auth](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** Manual refresh required — wrong typically. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** No caching — wrong; would be inefficient. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** Token per request — wrong typically. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** SDK token management:

  **OAuth client credentials flow**:
  1. SDK has client_id + client_secret (from config / secrets).
  2. POSTs to OAuth token endpoint with credentials.
  3. Receives access_token + expires_in (e.g., 3600 sec).
  4. Uses token in Authorization header for API calls.
  5. Before expiry: requests new token; replaces in cache.

  **SDK auto-management features**:

  **Token caching**:
  - In-memory cache; lives with SDK instance.
  - Avoids requesting new token per call (inefficient).
  - Lifetime tracking based on `expires_in` value.

  **Proactive refresh**:
  - Refreshes typically a few minutes before expiry.
  - Avoids "token expired during request" race conditions.
  - May refresh: 5 min before expiry, or 80% of TTL elapsed, etc.

  **Failure handling**:

  - **Token request fails** (auth server down, wrong creds): error propagates; subsequent API calls fail.
  - **Token expired and refresh fails**: similar.
  - **Logs**: SDK logs auth events at INFO / WARN.

  **Configuration knobs** (verify per SDK):

  - **Client ID / Secret**: required.
  - **OAuth token endpoint URL**: typically auto-detected from cluster config.
  - **Token cache TTL**: usually auto from `expires_in`.
  - **Refresh threshold**: % or absolute time before expiry to refresh.

  **Spring Zeebe example**:
  ```yaml
  camunda:
    client:
      auth:
        client-id: ${CLIENT_ID}
        client-secret: ${CLIENT_SECRET}
        token-url: https://login.cloud.camunda.io/oauth/token
        audience: zeebe.camunda.io
  ```
  SDK fetches + caches + refreshes automatically.

  **For Self-Managed Identity / Keycloak**:
  - Configure URLs to your Keycloak.
  - Same flow; different endpoints.

  **Multiple audience tokens**:
  - Camunda has multiple APIs (Zeebe, Operate, Tasklist, etc.).
  - Each may have separate token audience.
  - SDK manages each independently typically.

  **Thread safety**:
  - Token cache is thread-safe (multiple workers can share).
  - Refresh is coordinated to avoid stampedes.

  **Best practices**:

  - **Don't manually manage tokens**: let SDK handle.
  - **Monitor auth errors**: alert on repeated failures.
  - **Rotate secrets regularly**: SDK config update.
  - **Test with short token TTLs**: verify refresh works.

  **Anti-patterns**:

  - **Logging tokens**: sensitive; never log full tokens (per Set 13 Q11 LOGFIRE_TRACKING memory).
  - **Hard-coding credentials**: use env vars / secrets.
  - **Manual token handling**: unnecessary complexity.

  **For long-running processes**:
  - Tokens refresh as needed during process.
  - No special handling for processes spanning days.

  **For idle workers**:
  - Token may expire while idle.
  - Next API call: SDK refreshes; transparent.

  **Custom auth providers**:
  - For non-standard auth: implement custom auth provider interface.
  - Override default OAuth flow.
  - Rare; only for specific enterprise needs.

- **Option b) — Wrong typically.**

- **Option c) — Wrong.**

- **Option d) — Wrong typically.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. SDKs auto-cache + auto-refresh OAuth tokens; transparent to worker code; configure creds + endpoints.
- **b) 2/10** — wrong.
- **c) 1/10** — wrong.
- **d) 2/10** — wrong.

**Correct Answer:** Camunda SDKs auto-manage OAuth tokens (cache + proactive refresh before expiry); transparent to worker code.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "token 1h expiry refresh." Token management.

**Въпросът → Solution Framing.** "Auto-refresh" — изпитва се SDK auth.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че auto-cache + refresh, че transparent, че proactive before expiry. Това е знание за token caching.

---

## Question 45: Extensions (Weighting: 23%)

**Scenario:** Custom Connector needs to access a third-party API key. Team wonders how to handle secrets in custom Connectors.

**Custom Connector secrets binding?**

- **a)** **Custom Connectors access secrets via Camunda's secrets binding**:
  - **`{{secrets.NAME}}`** syntax in Element Template properties — same as built-in Connectors.
  - **At runtime**: Connector Runtime substitutes secret value before passing to Connector code.
  - **In Connector code**: receives the actual secret value (already substituted).
  - **Configuration**: secrets stored in cluster config; never in BPMN XML or code.
  - **Best practice**: design custom Connectors to accept secret values via standard binding.
  
  Documentation: [Connector SDK Secrets](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/) + [Secrets](https://docs.camunda.io/docs/components/console/manage-clusters/manage-secrets/)

- **b)** Hardcode in code — wrong; security anti-pattern. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** Pass via process variable — partial; less secure. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **d)** Custom Connectors can't use secrets — wrong. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Secrets in custom Connectors:

  **Camunda secrets system**:
  - **Storage**: secrets registered with cluster (Console UI / API).
  - **Reference syntax**: `{{secrets.SECRET_NAME}}`.
  - **Resolution**: at task execution time, Connector Runtime substitutes the placeholder with actual value.
  - **In BPMN XML**: only the placeholder appears; actual secret never written to model.

  **Element Template definition**:
  ```json
  {
    "label": "API Key",
    "type": "String",
    "binding": {
      "type": "zeebe:input",
      "name": "apiKey"
    },
    "description": "Use {{secrets.MY_API_KEY}} to reference a cluster secret"
  }
  ```

  **In modeler**: user types `{{secrets.MY_API_KEY}}` in the field.

  **BPMN XML stores**:
  ```xml
  <zeebe:input source="{{secrets.MY_API_KEY}}" target="apiKey"/>
  ```

  **At runtime**:
  - Connector Runtime sees `{{secrets.MY_API_KEY}}` in input.
  - Looks up cluster's secret store.
  - Substitutes with actual value.
  - Passes actual value to Connector code.

  **In Connector code** (Java example):
  ```java
  public class MyApiConnector implements OutboundConnectorFunction {
      @Override
      public Object execute(OutboundConnectorContext context) {
          MyInput input = context.bindVariables(MyInput.class);
          String apiKey = input.getApiKey();  // already substituted
          // use apiKey directly
      }
  }
  ```
  - Connector code never knows the secret syntax; just receives the value.

  **Why this design**:

  - **BPMN audit-safe**: BPMN models can be shared / version-controlled without leaking secrets.
  - **Centralised secret management**: cluster admin controls; rotate without touching BPMN.
  - **Environment-specific**: dev / staging / prod each have own secrets; same BPMN.

  **Connector SDK conventions**:

  - **Document expected secret usage**: in Connector docs / Element Template.
  - **Validate input**: detect if placeholder wasn't substituted (e.g., starts with `{{secrets.`) and error.
  - **Don't log secrets**: never log full input that may contain auth (per Set 13 Q11 LOGFIRE_TRACKING redaction memory).

  **Secret management lifecycle**:

  - **Create**: via Console UI, API, or Kubernetes Secret (Self-Managed).
  - **Update**: rotate periodically; new BPMN deploys use new value automatically.
  - **Delete**: when no longer needed.
  - **Audit**: log access if regulatory requirements.

  **Anti-patterns**:

  - **Hard-coding secret in Connector code**: defeats secret management; rebuild needed for rotation.
  - **Passing secret via process variable**: visible in Operate / logs; not secure.
  - **Logging secrets**: even unintentionally; redact aggressively.
  - **Storing in BPMN comments**: visible to anyone with model access.

  **For Self-Managed**:
  - Secrets in env vars / Kubernetes Secrets / Vault.
  - Connector Runtime config points to source.
  - Same `{{secrets.NAME}}` syntax in BPMN typically.

  **Best practices**:

  - **Use secrets binding consistently**: standard pattern across all Connectors.
  - **Document required secrets**: in Connector docs.
  - **Validate at runtime**: if secret missing, fail with clear error.
  - **Rotate regularly**: security hygiene.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. {{secrets.NAME}} binding; Connector Runtime substitutes; Connector code receives actual value.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Use Camunda secrets binding `{{secrets.NAME}}`; Connector Runtime substitutes before passing to code; never hardcode.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "third-party API key custom Connector." Secrets binding.

**Въпросът → Solution Framing.** "Secrets binding" — изпитва се Connector secrets.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че placeholder syntax, че substitution at runtime, че never hardcode. Това е знание за Connector secrets.

---

## Question 46: Extensions (Weighting: 23%)

**Scenario:** A Webhook Inbound Connector exposes an HTTP endpoint to receive partner events. Team wonders about **auth modes** — HMAC signature, basic auth, no auth.

**Webhook Connector authentication modes?**

- **a)** **Camunda Webhook Inbound Connector typically supports multiple auth modes**:
  - **None**: open endpoint (only for safe / public webhooks).
  - **Basic Auth**: username + password.
  - **API Key**: header-based key check.
  - **HMAC signature**: partner signs request with shared secret; Camunda validates.
  - **JWT validation**: token-based.
  - **IP allowlist** (in some configs): restrict source IPs.
  
  Use the strongest auth your partner supports; never expose unauthenticated webhooks for sensitive operations. Documentation: [Webhook Connector](https://docs.camunda.io/docs/components/connectors/protocol/webhook/)

- **b)** No auth — wrong; insecure. Documentation: [Webhook](https://docs.camunda.io/docs/components/connectors/protocol/webhook/)

- **c)** Basic only — partial. Documentation: [Webhook](https://docs.camunda.io/docs/components/connectors/protocol/webhook/)

- **d)** Only IP restriction — partial. Documentation: [Webhook](https://docs.camunda.io/docs/components/connectors/protocol/webhook/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Webhook auth modes:

  **None (no auth)**:
  - **Open endpoint**.
  - **Risk**: anyone can trigger process instances.
  - **Use case**: only for completely public / safe webhooks (rare in production).
  - **Better**: at minimum, require API key.

  **Basic Auth**:
  - **Header**: `Authorization: Basic <base64(user:pass)>`.
  - **Pros**: simple; widely supported.
  - **Cons**: credentials in every request; need HTTPS to be secure.
  - **Use case**: partners that prefer simple auth.

  **API Key**:
  - **Header**: typically `X-API-Key: <secret>` or similar.
  - **Pros**: simple; one credential to manage.
  - **Cons**: same key used by all callers; rotation impacts everyone.
  - **Use case**: machine-to-machine integration.

  **HMAC signature**:
  - Partner signs request body with shared secret (HMAC-SHA256 typically).
  - Includes signature in header (e.g., `X-Signature: <hash>`).
  - Camunda re-computes signature; validates match.
  - **Pros**: cryptographically secure; secret never sent; body integrity verified.
  - **Cons**: more setup; partner must implement signing.
  - **Use case**: high-security webhooks (e.g., financial events).

  **JWT validation**:
  - Partner sends JWT in `Authorization: Bearer <token>`.
  - Camunda validates signature against issuer's public key.
  - **Pros**: rich claims; expiry; revocation.
  - **Cons**: complex setup; requires JWT issuer.
  - **Use case**: enterprise integrations.

  **IP allowlist** (network-level):
  - Restrict source IPs.
  - **Pros**: additional layer; restricts to known partners.
  - **Cons**: IPs change; cloud providers use dynamic IPs.
  - **Use case**: combined with other auth modes.

  **Multi-layered**:
  - **HMAC + IP allowlist + HTTPS**: defense in depth.
  - Each layer independent.

  **Configuration in Element Template**:
  ```json
  {
    "label": "Auth Type",
    "type": "Dropdown",
    "choices": [
      {"value": "NONE", "name": "None"},
      {"value": "BASIC", "name": "Basic Auth"},
      {"value": "API_KEY", "name": "API Key"},
      {"value": "HMAC", "name": "HMAC Signature"}
    ]
  }
  ```

  **HMAC signature setup**:
  - **Shared secret**: store as Camunda secret (`{{secrets.PARTNER_HMAC_KEY}}`).
  - **Algorithm**: HMAC-SHA256 typical.
  - **Body**: signed.
  - **Header name**: depends on partner spec.

  **For the scenario**:

  - **Choose strongest auth partner supports**.
  - **For payment / sensitive events**: HMAC ideal.
  - **For status updates**: Basic / API Key may suffice.
  - **Always**: HTTPS.

  **Best practices**:

  - **Never expose unauthenticated webhooks for sensitive operations**.
  - **HTTPS always**: encrypt in transit.
  - **Rotate secrets**: periodic rotation.
  - **Validate body integrity**: HMAC verifies body wasn't tampered.
  - **Rate limit**: prevent abuse.
  - **Logging**: log authentication events; alert on failures.

  **Anti-patterns**:

  - **No auth in production**: exposes process triggers.
  - **HTTP (not HTTPS)**: credentials in cleartext.
  - **Reusing secrets across partners**: compromise of one affects all.
  - **Long-lived shared secrets without rotation**.

- **Option b) — Wrong; insecure for production.**

- **Option c) — Partial.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple auth modes: None, Basic, API Key, HMAC, JWT; combine for defense in depth.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 4/10** — partial.

**Correct Answer:** Webhook Inbound supports None / Basic / API Key / HMAC / JWT auth; choose strongest partner supports; combine with HTTPS + IP allowlist for defense in depth.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/protocol/webhook/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "HMAC basic no auth." Webhook auth modes.

**Въпросът → Solution Framing.** "Auth modes" — изпитва се knowledge на Webhook security.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че multiple modes, че HMAC strongest, че defense in depth. Това е знание за Webhook auth.

---

## Question 47: Extensions (Weighting: 23%)

**Scenario:** Team's RPA bot pool has 5 bots; demands fluctuate (some hours need 1 bot, peak hours need 5). Team wonders about **bot orchestration** patterns.

**RPA bot orchestration patterns?**

- **a)** **Camunda RPA orchestration typically supports**:
  - **Bot pool**: multiple bots registered to same task type.
  - **Camunda routes jobs**: brokers across available bots (like standard worker pool).
  - **Per-bot capacity**: each bot handles one (or few) jobs concurrently.
  - **Scaling**: add / remove bots dynamically (manual or automated).
  - **Bot status**: monitor health; remove unhealthy.
  
  For dynamic scaling: integrate with bot management tooling (verify per RPA edition). Documentation: [Camunda RPA](https://docs.camunda.io/docs/components/rpa/)

- **b)** One bot per task — partial. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/)

- **c)** No orchestration — wrong. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/)

- **d)** Manual assignment — overcomplicated. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** RPA bot orchestration patterns:

  **Bot pool model**:
  - Multiple bot instances (machines / VMs) running RPA agent.
  - All register for the same task type(s).
  - Camunda treats as worker pool: distributes jobs across available bots.

  **Job distribution**:
  - **Camunda activates jobs**: bot polls Camunda; gets next job.
  - **Concurrency**: one bot typically handles one task at a time (RPA tasks often need exclusive desktop).
  - **Load balancing**: implicit — busy bots don't poll; idle ones do.

  **For fluctuating demand**:

  **Pattern 1: Fixed pool, queue-based**:
  - 5 bots always running.
  - Off-peak: most idle.
  - Peak: queue forms naturally; bots handle as available.
  - **Pros**: simple; predictable cost.
  - **Cons**: paying for idle capacity.

  **Pattern 2: Auto-scaling pool**:
  - Bot management tool detects queue depth.
  - Spawns / stops bot instances accordingly.
  - **Pros**: cost-efficient.
  - **Cons**: more complex setup; bot spin-up time may delay peak handling.

  **Pattern 3: Tiered bots**:
  - Some bots handle multiple task types.
  - Specialised bots for specific tasks.
  - Routing based on bot capabilities.

  **Pattern 4: Scheduled scaling**:
  - Known peak times (e.g., end-of-month batch).
  - Scale up before; scale down after.
  - **Pros**: simple; predictable.
  - **Cons**: requires knowing patterns.

  **Bot health monitoring**:

  - **Heartbeat**: bots periodically check in.
  - **Dead bot detection**: missed heartbeats → remove from pool.
  - **Failed jobs**: bot reports failure; standard retry / Incident logic.
  - **Bot-specific failures**: bot down vs all-bots-down distinguished.

  **Configuration considerations**:

  **Activation timeout**:
  - RPA tasks can be slow (browser navigation, etc.).
  - Set generous activation timeout.
  - Per Set 13 Q10: balance against duplicate execution risk.

  **Concurrency per bot**:
  - **One concurrent job per bot**: typical for desktop automation (RPA bots need exclusive desktop).
  - **Multiple concurrent**: only if bot handles parallel-safe tasks.

  **Camunda 8 RPA editions**:
  - Verify exact orchestration features per edition.
  - Some editions integrate with specific RPA platforms (UiPath, Blue Prism, etc.).

  **For the scenario** (5 bots, fluctuating demand):

  **Approach A: Fixed 5 bots, queue-based**:
  - All bots always available.
  - Peak: queue forms; bots process as available.
  - Off-peak: most idle (cost-inefficient).

  **Approach B: Auto-scaling**:
  - Min 1 bot off-peak.
  - Up to 5 at peak.
  - Trigger on Camunda job queue depth metric.

  **Approach C: Mixed task assignment**:
  - 5 bots handle multiple task types.
  - Camunda routes; bots handle whichever they get.
  - Better utilisation.

  **Operational practices**:

  - **Monitor bot pool**: health, throughput, latency.
  - **Alert on bot failures**: detect issues quickly.
  - **Capacity planning**: model peak vs off-peak.
  - **Test failover**: kill a bot; verify others handle load.

  **Best practices**:

  - **Idempotent bot scripts**: re-execution safe (per Set 13 Q10).
  - **Snapshot / screenshot on failure**: debugging (per Set 13 Q47).
  - **Avoid long-running bot tasks**: break into smaller sub-tasks if possible.
  - **Document bot capabilities**: which bots can do what.

- **Option b) — Partial.**

- **Option c) — Wrong.**

- **Option d) — Overcomplicated.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Bot pool with Camunda routing; fixed or auto-scaling; tiered bots; health monitoring.
- **b) 4/10** — partial.
- **c) 1/10** — wrong.
- **d) 3/10** — overcomplicated.

**Correct Answer:** Bot pool with Camunda routing; choose fixed or auto-scaling; monitor health; idempotent scripts; one concurrent job per bot typical.

**Official Documentation Link:** https://docs.camunda.io/docs/components/rpa/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "5 bots fluctuating peak." Bot orchestration.

**Въпросът → Solution Framing.** "Orchestration patterns" — изпитва се RPA pool management.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че pool model, че auto-scaling vs fixed, че health monitoring. Това е знание за RPA orchestration.

---

## Question 48: Extensions (Weighting: 23%)

**Scenario:** Financial calculation: `decimal(0.125, 2)` — does it round to 0.12 or 0.13? Team wonders FEEL's rounding mode.

**FEEL `decimal` rounding mode?**

- **a)** **FEEL `decimal(value, scale)` uses banker's rounding** (round half to even) per DMN spec typically: 
  - `decimal(0.125, 2)` → `0.12` (rounds to even; 2 is even).
  - `decimal(0.135, 2)` → `0.14` (rounds to even; 4 is even).
  - **Banker's rounding** avoids bias compared to "round half up."
  - Verify exact rounding mode per FEEL version — some may use different modes.
  
  **For specific rounding modes**: may need custom logic if banker's rounding doesn't fit. Documentation: [FEEL Numeric Functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/)

- **b)** Always rounds up — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Always rounds down — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Configurable — partial. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `decimal` rounding:

  **Banker's rounding (round half to even)** per DMN spec typically:
  - When the value is exactly halfway between two representable decimals, round to the nearest even digit.
  - **Less bias** than always rounding up.

  **Examples**:
  ```feel
  decimal(0.125, 2)   → 0.12  (half-to-even: 2 is even)
  decimal(0.135, 2)   → 0.14  (half-to-even: 4 is even)
  decimal(0.145, 2)   → 0.14  (half-to-even: 4 is even)
  decimal(0.155, 2)   → 0.16  (half-to-even: 6 is even)
  decimal(0.124, 2)   → 0.12  (round down; not halfway)
  decimal(0.126, 2)   → 0.13  (round up; not halfway)
  ```

  **Other rounding modes** (for context):
  - **Round half up** (common in many languages):
    - `0.125 → 0.13` (always rounds .5 up).
  - **Round half down**:
    - `0.125 → 0.12` (always rounds .5 down).
  - **Round half to even** (banker's): the DMN FEEL standard.
  - **Round half to odd**: rare.
  - **Round towards zero (truncate)**:
    - `0.127 → 0.12`.
  - **Round away from zero**:
    - `0.123 → 0.13`.

  **Why banker's rounding**:

  - **Unbiased**: half the time rounds up, half down (on average).
  - **Financial standard**: many financial regulations require banker's rounding.
  - **DMN spec**: prescribes this mode.

  **For specific rounding modes**:

  **Round half up** (if needed):
  ```feel
  =decimal(value + (if value >= 0 then 0.005 else -0.005), 2)
  // Adds 0.005 (or subtracts for negative) then truncates via decimal
  ```
  - **Caveat**: this hack doesn't perfectly replicate; verify edge cases.

  **Custom rounding in worker**:
  - For complex rounding: do in worker code (Java BigDecimal with explicit RoundingMode).
  - Pass result back as variable.

  **For the scenario**:

  - `decimal(0.125, 2)` → `0.12` (banker's rounding; 2 is even).
  - Surprising if expecting "round half up."

  **Pitfalls**:

  **Pitfall 1: Assuming round-half-up**:
  - Developers from other languages may expect 0.125 → 0.13.
  - Banker's gives 0.12; surprise.
  - **Test rounding behavior** explicitly.

  **Pitfall 2: Cumulative rounding errors**:
  - Rounding many times accumulates differences.
  - **Best practice**: round once, at end of calculation.

  **Pitfall 3: Different rounding in process variables vs reports**:
  - FEEL banker's; reporting tool may use round-half-up.
  - **Reconciliation issues** if not consistent.

  **Compare with floor / ceiling**:
  - **`floor(value)`**: round down to integer (truncate towards negative infinity).
  - **`ceiling(value)`**: round up to integer (truncate towards positive infinity).
  - **`round(value)`**: round to integer (mode depends on FEEL version).

  **Best practices**:

  - **Test rounding behavior**: never assume mode.
  - **Document expected rounding**: in business spec.
  - **Use decimal for final result**: avoid float-point artefacts (per Set 13 Q48).
  - **Round once at end**: avoid cumulative errors.
  - **For regulatory rounding**: verify FEEL matches required mode; use custom logic if not.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL decimal uses banker's rounding (half to even) per DMN spec; 0.125 → 0.12.
- **b) 2/10** — wrong.
- **c) 1/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** FEEL `decimal` uses banker's rounding (round half to even) per DMN spec; `decimal(0.125, 2)` → `0.12`; verify per FEEL version.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "decimal(0.125, 2) 0.12 or 0.13." Rounding mode.

**Въпросът → Solution Framing.** "Rounding mode" — изпитва се FEEL decimal behavior.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че banker's rounding, че half-to-even, че pitfalls. Това е знание за FEEL rounding.

---

## Question 49: Extensions (Weighting: 23%)

**Scenario:** Two lists: `listA = [1, 2, 3]`, `listB = [3, 4, 5]`. Team wants union `[1, 2, 3, 4, 5]` and intersection `[3]`.

**FEEL list union and intersection patterns?**

- **a)** **FEEL provides `union` function** (or similar) for combining; for **intersection**, compose via filter + contains:
  - **Union**: `union(listA, listB)` → `[1, 2, 3, 4, 5]` (verify exact name; some versions use `list contains`-based predicates).
  - Alternative: `distinct values(concatenate(listA, listB))` → `[1, 2, 3, 4, 5]`.
  - **Intersection**: `for x in listA satisfies (some y in listB satisfies y = x)` (filter approach) — returns items in both. Or: `listA[list contains(listB, item)]` style.
  
  Verify exact function names per FEEL version. Documentation: [FEEL List Functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** No list operations — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Manual loop only — overcomplicated. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Convert to sets — partial. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL set-like operations on lists:

  **Union**:

  **Approach 1: `union` function** (if available):
  ```feel
  union(listA, listB)    → [1, 2, 3, 4, 5]
  ```
  Returns combined list with duplicates removed.

  **Approach 2: concatenate + distinct values**:
  ```feel
  distinct values(concatenate(listA, listB))    → [1, 2, 3, 4, 5]
  ```
  Concatenate joins; distinct values dedupes.

  **For multiple lists**:
  ```feel
  union(listA, listB, listC)
  // or
  distinct values(concatenate(listA, listB, listC))
  ```

  **Intersection**:

  **Approach 1: Filter with quantifier**:
  ```feel
  listA[some b in listB satisfies b = item]
  ```
  Filter listA to elements that also exist in listB.

  **Approach 2: List comprehension**:
  ```feel
  for x in listA
    return if (some y in listB satisfies y = x) then x else null
  ```
  Returns list with intersections (and nulls for non-matches); may need null filter.

  **Approach 3: Built-in `list contains` predicate**:
  ```feel
  filter(listA, list contains(listB, item))
  ```
  Verify exact syntax per FEEL version.

  **Difference (A - B)**:

  ```feel
  listA[not(some b in listB satisfies b = item)]
  ```
  Returns items in listA not in listB.

  **Symmetric difference**:

  ```feel
  concatenate(
    listA[not(some b in listB satisfies b = item)],
    listB[not(some a in listA satisfies a = item)]
  )
  ```
  Items in either but not both.

  **For complex object lists**:

  **Intersection by ID**:
  ```feel
  let bIds = for b in listB return b.id
  return listA[list contains(bIds, item.id)]
  ```

  **Performance**:

  - **Nested quantifiers**: O(n × m) for intersection of n × m elements.
  - **For large lists**: pre-process (e.g., extract IDs to a set).
  - **For very large**: consider doing in worker (more efficient algorithms).

  **Compare with `distinct values`** (per Q38):
  - `distinct values` removes duplicates within one list.
  - `union` combines two lists deduplicated.
  - Related but distinct.

  **Use cases**:

  **Use case 1: Combine eligible customers from multiple campaigns**:
  ```feel
  union(campaignAEligible, campaignBEligible)
  ```

  **Use case 2: Find customers in both segments**:
  ```feel
  segmentA[some s in segmentB satisfies s = item]
  ```

  **Use case 3: Identify excluded items**:
  ```feel
  allItems[not(some e in excluded satisfies e = item)]
  ```

  **Best practices**:

  - **Verify FEEL version's exact function names**: `union`, `intersect` may or may not be available.
  - **Compose if not available**: filter / quantifier patterns work universally.
  - **For complex sets**: extract keys; operate on key lists; look up originals.
  - **Performance**: profile for large datasets; worker may be better.

  **Alternative: do set ops in worker**:
  - For complex / large set operations: Java / Node code with proper set types is much faster.
  - FEEL: best for simple cases.

- **Option b) — Wrong.**

- **Option c) — Overcomplicated.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. union via function or concatenate+distinct; intersection via filter+quantifier; verify exact names.
- **b) 1/10** — wrong.
- **c) 3/10** — overcomplicated.
- **d) 4/10** — partial.

**Correct Answer:** Union via `union()` or `distinct values(concatenate())`; intersection via filter with `some` quantifier; verify FEEL function names per version.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "union [1,2,3] [3,4,5] intersection." Set ops.

**Въпросът → Solution Framing.** "Union and intersection" — изпитва се FEEL set ops.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че union via concatenate+distinct, че intersection via quantifier, че complex objects need keys. Това е знание за FEEL set ops.

---

## Question 50: Extensions (Weighting: 23%)

**Scenario:** Java SDK worker uses gRPC. Long-lived connection; team wonders about **gRPC keepalive** vs **HTTP/2 ping** for detecting dead connections.

**gRPC keepalive vs HTTP/2 ping?**

- **a)** **gRPC uses HTTP/2 underneath; keepalive is a gRPC-level feature on top**:
  - **HTTP/2 PING frame**: low-level; ensures connection alive at transport level.
  - **gRPC keepalive**: configurable interval; sends PINGs periodically; detects dead connections.
  - **Camunda SDKs**: typically have sensible keepalive defaults; configurable.
  - **Tuning**: 
    - **Short interval** (e.g., 30s): faster dead-connection detection; more network chatter.
    - **Long interval** (e.g., 5min): less chatter; slower detection.
  
  Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/) + gRPC docs

- **b)** Identical — wrong. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** Not configurable — wrong. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** gRPC doesn't use HTTP/2 — wrong. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** gRPC + HTTP/2 keepalive:

  **Layered model**:
  - **gRPC**: protocol layer (RPC semantics, message framing).
  - **HTTP/2**: transport (multiplexed streams, binary framing).
  - **TLS**: encryption (if used).
  - **TCP**: underlying byte stream.

  **HTTP/2 PING frame**:
  - **Spec-defined**: built into HTTP/2 protocol.
  - **Purpose**: keep connections alive through firewalls/NATs; detect dead.
  - **Lightweight**: 8-byte payload.
  - **Response**: peer sends PING ACK back.
  - **Round-trip**: confirms bidirectional connectivity.

  **gRPC keepalive**:
  - **Built on HTTP/2 PING**: uses underlying frame.
  - **gRPC-level configuration**: intervals, timeouts, permit-without-calls.
  - **Bidirectional**: clients and servers can configure.

  **Why keepalive matters**:

  **Problem 1: Idle connections through firewalls/NATs**:
  - Stateful middleboxes may drop idle TCP connections.
  - Without keepalive: next RPC fails with cryptic error.
  - **Keepalive**: regular traffic prevents middlebox timeout.

  **Problem 2: Dead peer detection**:
  - Peer crashes / network partition.
  - Without keepalive: client doesn't know until next RPC fails.
  - **Keepalive**: PING fails quickly; SDK reconnects.

  **Problem 3: Long-running streaming RPCs**:
  - Worker long-polls for jobs.
  - Connection idle on the wire (no data flowing).
  - Without keepalive: middlebox or peer may close.
  - **Keepalive**: keeps connection healthy.

  **Configuration knobs** (typical):

  **`keepAliveTime`**: how often to send PING (e.g., 30s).
  **`keepAliveTimeout`**: how long to wait for PING ACK (e.g., 10s).
  **`permitWithoutCalls`**: send PINGs even when no active RPCs (boolean).

  **Spring Zeebe / Java client**:
  ```yaml
  camunda:
    client:
      zeebe:
        keep-alive: PT30S      # 30 seconds
  ```
  Or programmatic API.

  **Server-side keepalive policy**:
  - Servers may enforce min keepalive intervals.
  - Clients with too-aggressive PINGs may be disconnected.
  - **`GOAWAY` frame**: server tells client to back off.

  **Trade-offs**:

  **Aggressive keepalive (frequent PINGs)**:
  - **Pros**: fast dead-connection detection.
  - **Cons**: network chatter; server load.

  **Lax keepalive (infrequent PINGs)**:
  - **Pros**: less chatter.
  - **Cons**: slower detection; middleboxes may still drop.

  **Best practices**:

  - **Default SDK settings often fine**: tested defaults.
  - **Tune for specific networks**: e.g., aggressive corporate firewalls may need shorter intervals.
  - **Coordinate with server policy**: client interval ≥ server's accepted minimum.

  **Detection vs recovery**:

  - **Detection**: keepalive notices dead connection.
  - **Recovery**: SDK reconnects (per Set 13 Q44).
  - **Both essential**: keepalive accelerates detection; reconnect handles the recovery.

  **Monitoring**:

  - **Connection state metrics**: how many connections healthy.
  - **Keepalive failures**: alert on rate.
  - **Reconnect counts**: track frequency.

  **For Camunda 8 workers**:

  - Long-running connections to Zeebe gateway.
  - Workers idle when no jobs.
  - Keepalive prevents disconnection.
  - SDK auto-handles; verify config defaults appropriate for your network.

  **Anti-patterns**:

  - **Disabling keepalive**: dead connections silently linger.
  - **Too-aggressive client keepalive**: server rejects with GOAWAY.
  - **Not coordinating with server policy**: connection thrash.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. gRPC built on HTTP/2; keepalive uses HTTP/2 PING frames; configurable interval; tune for network.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** gRPC keepalive built on HTTP/2 PING frames; configure interval (e.g., 30s) for dead-connection detection through firewalls/NATs.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "gRPC keepalive HTTP/2 ping." Connection liveness.

**Въпросът → Solution Framing.** "Keepalive vs HTTP/2 ping" — изпитва се connection management.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че layered, че HTTP/2 PING frame, че SDK configurable. Това е знание за gRPC keepalive.

---

# Section 7 — Managing Dev (Questions 51-59)

> Weight 14% • Topics: Flow node breakdown, bulk operations, migration tooling, SSO provisioning, API key vs OAuth, multi-cluster deploy, Operate variable filtering, resource exhaustion, BPMN linting.

---

## Question 51: Managing Dev (Weighting: 14%)

**Scenario:** A specific process has high latency. Operate's process detail view shows total time but not per-element breakdown. Team wonders how to diagnose **which element is slow**.

**Process flow node performance breakdown?**

- **a)** **Operate typically provides per-element instance-time data**:
  - **Process instance detail view**: shows flow node instances with start/end timestamps.
  - **Computed per-element duration**: end - start time per node.
  - **Aggregate metrics**: average / P95 / P99 across many instances via APIs / Prometheus.
  - **For deep analysis**: export instance data; analyse in BI / data tools.
  
  Verify exact UI features per Operate version. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/process-instances/)

- **b)** No per-element data — wrong. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Only via API — partial. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Manual logging — partial. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Performance diagnosis in Operate:

  **Per-instance breakdown**:

  **Process instance detail view**:
  - List of flow nodes activated in this instance.
  - **Start time** + **end time** per node.
  - **Duration** = end - start.
  - **State**: completed, active, terminated.

  **Identifying slow nodes**:
  - Sort / filter by duration.
  - Long-duration nodes are candidates for optimization.
  - Compare to expected duration.

  **Aggregate analysis**:

  **Aggregate APIs / metrics** (per Set 13 Q56):
  - Prometheus metrics: per-element completion / duration histograms.
  - Grafana dashboards: visualize P50 / P95 / P99 latencies.
  - Detect: which elements are consistently slow.

  **Sample analysis workflow**:

  1. **Identify slow instances**: filter process instances by duration > threshold.
  2. **Drill in**: inspect each slow instance's flow node breakdown.
  3. **Find common bottleneck**: same node slow across many instances.
  4. **Investigate root cause**: external dependency? Heavy computation? Resource contention?
  5. **Fix**: optimize, parallelize, add caching, etc.

  **Common bottleneck patterns**:

  **Pattern 1: External API slow**:
  - Service Task waits for partner; partner is the bottleneck.
  - Fix: cache, async patterns, partner SLAs.

  **Pattern 2: Heavy worker computation**:
  - CPU-intensive logic in worker.
  - Fix: optimize algorithm, parallelize, scale workers.

  **Pattern 3: User Task waiting**:
  - Long wait for human action.
  - Fix: reminders, escalation, auto-assignment.

  **Pattern 4: Sequential where parallel possible**:
  - Independent steps in sequence.
  - Fix: redesign with Parallel Gateway.

  **Pattern 5: Job activation delay**:
  - Job available but no worker polling.
  - Fix: scale workers, tune polling interval.

  **Pattern 6: Database / Operate query latency**:
  - Internal cluster operations slow.
  - Fix: scale cluster, optimize indices.

  **Tools beyond Operate UI**:

  **Custom dashboards**:
  - Pull instance data via API.
  - BI tools (Tableau, Power BI) visualize trends.

  **Distributed tracing**:
  - OpenTelemetry tracing through Camunda + workers.
  - Track requests end-to-end including external calls.

  **Logging**:
  - Workers log timestamps; logs aggregated; analyze.

  **Best practices**:

  - **Set SLA expectations per element**: know what's acceptable.
  - **Monitor + alert**: per-element latency exceeded threshold.
  - **Sample slow instances**: don't analyze every instance; statistical approach.
  - **Track over time**: detect regressions after deployments.

  **For the scenario** (high latency, find slow element):
  - Open Operate; navigate to a slow instance.
  - Inspect flow node start/end times.
  - Identify longest-running node.
  - Cross-check across multiple slow instances; find pattern.
  - Investigate specific element + dependencies.

  **Future-proofing**:
  - Add custom metrics from workers (latency histograms per task type).
  - Centralize observability stack (Prometheus + Grafana + tracing).
  - Build runbooks for common bottleneck patterns.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Operate provides per-element timestamps + duration; aggregate via metrics + APIs; identify bottlenecks.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 4/10** — partial.

**Correct Answer:** Operate shows per-element start/end timestamps; combine with Prometheus metrics + aggregated dashboards to identify slow elements across instances.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instances/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "high latency which element slow." Performance diagnosis.

**Въпросът → Solution Framing.** "Per-element breakdown" — изпитва се Operate diagnostic features.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че per-element timestamps in Operate, че aggregate via metrics, че common bottleneck patterns. Това е знание за performance diagnosis.

---

## Question 52: Managing Dev (Weighting: 14%)

**Scenario:** A bug deployed; 5,000 process instances have Incidents on same Service Task. Team wonders how to **resolve all 5,000 at once** without one-by-one clicks.

**Bulk operation API for thousands of incidents?**

- **a)** **Camunda 8 typically supports bulk operations**:
  - **Operate UI**: select multiple instances; apply action (resolve / retry / cancel) to batch.
  - **Operate API**: programmatic batch operations.
  - **For thousands**: script via API; iterate / batch.
  - **Tasklist API** for user task bulk actions.
  
  **Strategy for 5,000 incidents**:
  - Verify root cause fixed first.
  - Filter incidents by process / element / error.
  - Bulk retry via API in batches (e.g., 100 at a time).
  - Monitor success rate.
  
  Documentation: [Operate API](https://docs.camunda.io/docs/components/operate/) + [Bulk Operations](https://docs.camunda.io/docs/components/operate/userguide/process-instances/)

- **b)** One-by-one only — wrong. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Cancel all — overstates. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Wait for auto-retry — wrong. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Bulk operations for many incidents:

  **Operate UI bulk operations**:

  **Filter + select**:
  - Filter instances by process / element / incident state.
  - Multi-select via checkbox.
  - Bulk actions: resolve incident, retry, cancel.

  **Use case**: tens to hundreds of incidents; manageable via UI.

  **For thousands**: API scripting more practical.

  **Operate API**:

  **Endpoints** (verify per version):
  - `/v1/incidents/search`: query incidents with filters.
  - `/v1/process-instances/{id}/operations`: per-instance operations.
  - Batch operations API for multi-instance actions.

  **Scripting pattern** (Python pseudocode):
  ```python
  # 1. Find all matching incidents
  incidents = api.search_incidents(
      processDefinitionKey="my-process-key",
      hasIncident=True,
      errorType="JOB_NO_RETRIES"
  )
  
  # 2. Iterate in batches
  for batch in chunks(incidents, 100):
      for incident in batch:
          api.update_job_retries(
              jobKey=incident.jobKey,
              retries=3
          )
      time.sleep(1)  # rate limit
  
  # 3. Monitor progress; log results
  ```

  **Strategy for the 5,000-incident scenario**:

  **Step 1: Fix root cause first**:
  - Deploy bug fix to workers / process.
  - Verify new instances don't hit same incident.

  **Step 2: Categorize incidents**:
  - Same root cause: retry-able.
  - Different causes: may need different handling.

  **Step 3: Test on small batch**:
  - Retry 10 incidents.
  - Verify they succeed (not just immediately re-fail).

  **Step 4: Bulk retry**:
  - Script through all matching incidents.
  - Batch sizes (100-1000) to avoid overwhelming cluster.
  - Rate limit to prevent overload.

  **Step 5: Monitor**:
  - Track success vs failure rate.
  - Stop if failure rate too high (something still wrong).

  **Step 6: Handle remaining**:
  - Some may not recover with retry.
  - Investigate individually; may need Modify API.

  **Bulk operation types**:

  **Incident retry**:
  - Increment retries; job re-activates.
  - Workers process again.

  **Process instance cancellation**:
  - Cancel stuck / unrecoverable instances.
  - Audit trail of cancellations.

  **Variable modification**:
  - Bulk update variables (via Modify API) before retry.
  - Useful when stuck on bad data.

  **Process migration** (per Set 14 Q18):
  - Bulk migrate to V2 of process.
  - For schema/structure changes.

  **Considerations**:

  **Performance impact**:
  - Bulk operations consume cluster resources.
  - Test in dev / staging first.
  - Monitor cluster health during bulk operations.

  **Audit trail**:
  - Log who did what bulk operation when.
  - Compliance / accountability.

  **Idempotency**:
  - Re-running script should be safe.
  - Track which incidents already processed.

  **Coordination**:
  - **Stop creating new bad instances**: ensure bug fix deployed first.
  - **Communicate**: tell stakeholders about bulk operation.

  **Best practices**:

  - **Test on subset first**: validate approach.
  - **Use API for >100 incidents**: UI doesn't scale.
  - **Batch + rate limit**: don't hammer cluster.
  - **Log everything**: for audit + debugging.
  - **Monitor cluster health**: bulk ops can be heavy.
  - **Have rollback plan**: in case bulk operation makes things worse.

  **Anti-patterns**:

  - **Bulk retry without fixing root cause**: just retries same failure.
  - **No batching**: thousands of simultaneous operations may overwhelm.
  - **No audit log**: can't reconstruct what happened.

- **Option b) — Wrong.**

- **Option c) — Overstates.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. UI bulk operations for tens-to-hundreds; API for thousands; fix root cause first; batch + rate limit.
- **b) 1/10** — wrong.
- **c) 3/10** — overstates.
- **d) 1/10** — wrong.

**Correct Answer:** Camunda 8 supports bulk operations via Operate UI (tens-to-hundreds) or API scripting (thousands); fix root cause first; batch + rate limit.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instances/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "5000 incidents same Service Task bulk." Bulk operations.

**Въпросът → Solution Framing.** "Resolve all at once" — изпитва се bulk operation tooling.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че UI + API, че batch + rate limit, че fix root cause first. Това е знание за bulk operations.

---

## Question 53: Managing Dev (Weighting: 14%)

**Scenario:** Process definition V2 deployed; 1,000 V1 instances in-flight need migration. Team wonders about **migration tooling** — manual via API or UI features.

**Process migration tooling?**

- **a)** **Camunda 8 typically supports process instance migration** (per Set 14 Q18):
  - **API**: programmatic migration; useful for automation.
  - **Operate UI** (verify per version): may have migration features for manual / batch.
  - **Migration plan**: defines mappings between V1 and V2 elements.
  - **Apply**: per-instance or batch.
  
  For 1,000 instances: scripted via API typical. Documentation: [Process Instance Migration](https://docs.camunda.io/docs/components/concepts/process-instance-migration/)

- **b)** No migration support — wrong. Documentation: [Migration](https://docs.camunda.io/docs/components/concepts/process-instance-migration/)

- **c)** Only API — partial. Documentation: [Migration](https://docs.camunda.io/docs/components/concepts/process-instance-migration/)

- **d)** Manual per-instance click — partial. Documentation: [Migration](https://docs.camunda.io/docs/components/concepts/process-instance-migration/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Migration tooling options:

  **Migration plan**:
  - **Definition**: maps V1 element IDs to V2 element IDs.
  - **Auto-mapping**: elements with same ID in both versions.
  - **Explicit mapping**: for renamed / restructured elements.
  - **JSON / API format**: programmatic.

  **API-based migration**:

  **Endpoint** (verify per version):
  - POST migration plan + target process instance(s).

  **Pattern**:
  ```python
  # 1. Define migration plan
  plan = {
      "sourceProcessDefinitionKey": "process-v1-key",
      "targetProcessDefinitionKey": "process-v2-key",
      "mappingInstructions": [
          {"sourceElementId": "ReviewTask", "targetElementId": "ReviewTask"},
          {"sourceElementId": "OldStep", "targetElementId": "NewStep"}
      ]
  }
  
  # 2. Find V1 instances
  v1_instances = api.search_instances(processDefinitionKey="v1-key")
  
  # 3. Migrate in batches
  for batch in chunks(v1_instances, 100):
      api.migrate_instances(plan, [i.key for i in batch])
      time.sleep(1)
  
  # 4. Verify
  ```

  **Operate UI migration** (verify per version):
  - Some Operate versions may have migration UI.
  - Visual mapping; preview impact.
  - Apply to selected instances.

  **For 1,000 instances**:

  **Approach A: Scripted API migration**:
  - Define plan.
  - Iterate instances in batches.
  - Monitor progress.
  - Pros: repeatable, auditable.
  - Cons: requires API access + scripting.

  **Approach B: Cohabitation (no migration)**:
  - V1 instances continue with V1.
  - New instances on V2.
  - Wait for V1 to drain naturally.
  - Pros: simplest; no migration risk.
  - Cons: V1 logic must remain available; longer transition.

  **Approach C: Hybrid**:
  - Migrate critical V1 instances (newly-blocked, escalations).
  - Let routine V1 instances finish naturally.

  **Migration safety**:

  **Pre-migration checks**:
  - **Compatible plan**: all V1 active elements map to valid V2 elements.
  - **Variables compatible**: per Set 14 Q18.
  - **Test in staging**: migrate sample instances first.

  **Migration execution**:
  - **Dry-run**: if API supports; preview without applying.
  - **Batch sizes**: 50-200 typical; balance speed vs cluster load.
  - **Rate limit**: pause between batches.

  **Post-migration verification**:
  - **Spot-check**: pick migrated instances; verify state correct.
  - **Re-activate workers**: ensure they process migrated instances.
  - **Monitor errors**: incident rate post-migration.

  **Risks + mitigations**:

  **Risk: Plan mismatch (element ID not in V2)**:
  - **Mitigation**: validate plan against V2 model before deploying.

  **Risk: Variables incompatible**:
  - **Mitigation**: pre-migration Modify API to set new variables; or defensive V2 logic.

  **Risk: In-flight tokens at incompatible state**:
  - **Mitigation**: check token positions; some may not migrate cleanly.

  **Risk: Cluster overload during bulk migration**:
  - **Mitigation**: small batches; rate limit; monitor.

  **Rollback**:
  - **Migration is one-way** typically.
  - **Backup before** for emergency restore.
  - **Test migration in staging**: validate before prod.

  **Best practices**:

  - **Define migration plan early**: as part of V2 development.
  - **Test migration in dev / staging**: with real-like data.
  - **Document migration runbook**: step-by-step.
  - **Communicate**: stakeholders aware of migration window.
  - **Monitor**: post-migration health.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Migration via API (scripted for 1,000s) + possibly Operate UI; migration plan defines mappings; test in staging.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 4/10** — partial.

**Correct Answer:** Camunda supports process migration via API + possibly Operate UI; migration plan maps elements; script batch migration for 1,000 instances; test in staging.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/process-instance-migration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "V1 V2 1000 instances migration." Migration tooling.

**Въпросът → Solution Framing.** "Migration tooling" — изпитва се migration capabilities.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че API + possibly UI, че migration plan, че safety considerations. Това е знание за migration tooling.

---

## Question 54: Managing Dev (Weighting: 14%)

**Scenario:** Team uses corporate SSO (Okta). Users authenticate to Tasklist via Okta. Team wonders how to **provision users** + groups from Okta to Camunda Identity.

**SSO user provisioning patterns?**

- **a)** **Camunda Identity integrates with external IdPs**:
  - **OIDC / SAML connector**: configures Identity to delegate auth to Okta.
  - **Just-in-time (JIT) provisioning**: users created in Camunda on first login (typical).
  - **SCIM**: protocol for pre-provisioning users / groups (verify support).
  - **Group mapping**: Okta groups → Camunda roles / candidate groups.
  - **Self-Managed vs SaaS** auth setups differ.
  
  Documentation: [Identity](https://docs.camunda.io/docs/self-managed/identity/) + [SSO Setup](https://docs.camunda.io/docs/self-managed/identity/configuration/)

- **b)** Manual user creation — wrong typically. Documentation: [Identity](https://docs.camunda.io/docs/self-managed/identity/)

- **c)** Camunda doesn't support SSO — wrong. Documentation: [Identity](https://docs.camunda.io/docs/self-managed/identity/)

- **d)** Direct LDAP only — partial. Documentation: [Identity](https://docs.camunda.io/docs/self-managed/identity/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** SSO + user provisioning in Camunda:

  **Camunda Identity layer**:
  - **Self-Managed**: Identity = Camunda's auth service (often Keycloak-based).
  - **SaaS**: Camunda Console handles users; can integrate external IdP.

  **SSO setup with Okta** (or similar IdP):

  **OIDC** (OpenID Connect — recommended):
  - Modern protocol; built on OAuth 2.0.
  - Identity (Keycloak) configured with Okta as identity broker.
  - User → Camunda → redirect to Okta → authenticate → back to Camunda.

  **SAML**:
  - Older but widely supported.
  - Similar flow; different protocol.

  **Setup steps** (Self-Managed):
  1. Configure Okta with new application (OIDC / SAML).
  2. Get client ID + secret + endpoints from Okta.
  3. Configure Camunda Identity (Keycloak realm) with Okta as identity provider.
  4. Test login flow.

  **User provisioning models**:

  **Model 1: Just-in-time (JIT)**:
  - User logs in via Okta.
  - First time: Camunda creates user record automatically.
  - Subsequent: existing user authenticated.
  - **Pros**: minimal setup; users created on demand.
  - **Cons**: user records appear only after first login.

  **Model 2: SCIM** (System for Cross-domain Identity Management):
  - Protocol for IdP to push user / group changes to apps.
  - Okta pushes users / changes to Camunda Identity.
  - **Pros**: proactive provisioning; deprovisioning when users leave.
  - **Cons**: more complex setup; verify support per Camunda version.

  **Model 3: Periodic sync**:
  - Script / cron job pulls users from Okta API; syncs to Camunda.
  - Custom; less standardized.

  **Model 4: Pre-provisioned via API**:
  - Operations team creates users in Camunda directly.
  - Updates as people join / leave.
  - **Pros**: full control; **Cons**: manual.

  **Group mapping**:

  **Goal**: Okta groups → Camunda groups / roles / candidate groups.

  **Pattern A: Group claims in token**:
  - Okta includes group memberships in OIDC token.
  - Camunda reads claims; assigns to internal groups.

  **Pattern B: SCIM-pushed groups**:
  - Okta pushes group memberships via SCIM.
  - Camunda updates internal mappings.

  **Pattern C: Mapping config**:
  - Static mapping in Camunda Identity config.
  - `okta-group-X → camunda-role-Y`.

  **Authorization model**:

  **Camunda authorities**:
  - **Users**: individuals.
  - **Groups**: collections of users.
  - **Roles**: collections of permissions.
  - **Tenants**: multi-tenancy boundary.

  **For BPMN**:
  - **`candidateGroups`** on User Tasks (per Set 14 Q22): reference group names.
  - **Group names** must align with provisioning (Okta group → Camunda group).

  **Provisioning best practices**:

  - **Source of truth**: Okta (or central IdP) — don't manage users in Camunda directly.
  - **Automate**: minimise manual user management.
  - **Deprovision promptly**: when users leave Okta, remove from Camunda.
  - **Audit**: log auth events; track who accessed what.
  - **Test**: verify SSO works for various user / group scenarios.

  **For SaaS**:
  - Camunda Console handles users via Camunda's auth.
  - Some plans support external IdP integration.
  - Verify per plan tier.

  **Service accounts** (not human users):
  - For worker / API auth: OAuth client credentials (per Set 13 Q11).
  - Separate from human user provisioning.
  - Managed in cluster settings / Identity.

  **Common issues**:

  **Issue 1: Group names don't match BPMN**:
  - BPMN uses "reviewers"; Okta group is "review-team-emea".
  - **Fix**: align naming OR use mapping in Identity.

  **Issue 2: Stale users after Okta deprovisioning**:
  - User removed in Okta; still exists in Camunda.
  - **Fix**: SCIM or periodic sync; remove stale users.

  **Issue 3: Auth failures**:
  - Token validation issues; clock skew; misconfigured endpoints.
  - **Fix**: review logs; check config; test step by step.

- **Option b) — Wrong typically.**

- **Option c) — Wrong.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. OIDC / SAML integration; JIT or SCIM provisioning; group mapping; centralised IdP as source of truth.
- **b) 2/10** — wrong.
- **c) 1/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** Camunda Identity integrates with Okta via OIDC / SAML; JIT or SCIM provisioning; group mapping from Okta to Camunda groups.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/identity/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Okta SSO provision users." SSO provisioning.

**Въпросът → Solution Framing.** "Provision users + groups" — изпитва се knowledge на Identity integration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че OIDC / SAML, че JIT / SCIM, че group mapping. Това е знание за SSO provisioning.

---

## Question 55: Managing Dev (Weighting: 14%)

**Scenario:** External service needs to query Operate API. Team wonders: use **API key** (simple) or **OAuth client credentials** (more setup).

**API key vs OAuth client credentials choice?**

- **a)** **Camunda 8 SaaS / Self-Managed typically use OAuth client credentials** as primary auth for APIs (per Set 14 Q44):
  - **OAuth client credentials**: client_id + client_secret → token; token in requests.
  - **API keys** (simple bearer tokens): less common; may be available in some configurations.
  - **OAuth advantages**: token expiry, scopes, revocation, standardised.
  - **For service-to-service**: OAuth is the modern standard.
  - **For SaaS**: client credentials configured in Console; provided to external services.
  
  Documentation: [API Authentication](https://docs.camunda.io/docs/apis-tools/) + [Identity](https://docs.camunda.io/docs/self-managed/identity/)

- **b)** API key only — partial. Documentation: [API Auth](https://docs.camunda.io/docs/apis-tools/)

- **c)** OAuth only — partial; verify. Documentation: [API Auth](https://docs.camunda.io/docs/apis-tools/)

- **d)** Either / both — partial; OAuth typical. Documentation: [API Auth](https://docs.camunda.io/docs/apis-tools/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** API authentication in Camunda 8:

  **OAuth Client Credentials** (modern standard):

  **Flow**:
  1. Client has `client_id` + `client_secret`.
  2. POST to OAuth token endpoint.
  3. Receive access_token (JWT typically) + expires_in.
  4. Include `Authorization: Bearer <token>` in API requests.
  5. Refresh before expiry (per Set 14 Q44).

  **Configuration in Camunda SaaS**:
  - Console → cluster → API → create client.
  - Get client_id + client_secret.
  - Provide to external service.
  - External service uses for OAuth.

  **For Self-Managed**:
  - Camunda Identity manages clients.
  - Or external Keycloak / OIDC provider.
  - Same flow.

  **Pros of OAuth**:
  - **Token expiry**: limits credential exposure.
  - **Scopes**: limit what client can access.
  - **Revocation**: invalidate compromised credentials.
  - **Standard**: widely supported tooling.
  - **Auditable**: token claims include client identity.

  **API Keys** (simpler, less standard):

  **Flow**:
  - Client has long-lived API key.
  - Include in `Authorization: ApiKey <key>` or similar header.
  - Server validates against database.

  **Pros**:
  - **Simple**: no token exchange.
  - **No expiry handling** in client.

  **Cons**:
  - **Long-lived**: compromised key valid until manually rotated.
  - **No scopes typically**: all-or-nothing access.
  - **Manual rotation**: need to update clients.

  **In Camunda**:
  - **API keys may be available** in some configurations.
  - **Verify per version**: not always primary auth.
  - **For new integrations**: prefer OAuth.

  **For Operate / Tasklist APIs specifically**:

  - **SaaS**: typically OAuth client credentials.
  - **Self-Managed**: depends on Identity config.
  - **Documentation**: check API auth section for current method.

  **Best practices**:

  - **Use OAuth** for new integrations (modern, secure).
  - **Migrate from API keys** to OAuth if older systems.
  - **Store secrets securely**: never inline in code; use secret managers.
  - **Rotate periodically**: security hygiene.
  - **Monitor auth failures**: alert on attacks / config issues.
  - **Use scopes**: limit each client's access.

  **For the scenario**:

  - **External service queries Operate**: OAuth client credentials.
  - **Create dedicated client** for the service (not shared with others).
  - **Limit scope**: read-only if only querying.
  - **Implement token refresh** in service.
  - **Monitor**: track service's API usage.

  **Security considerations**:

  - **HTTPS always**: encrypt tokens in transit.
  - **Token TTL**: short-lived (e.g., 1h) reduces compromise window.
  - **Secret storage**: use secret manager (Vault, AWS Secrets Manager) for client_secret.
  - **Rotation**: rotate secrets regularly.

  **Tooling**:

  - **OAuth client libraries**: most languages have libraries handling token flow.
  - **Camunda SDKs**: handle OAuth automatically (per Set 14 Q44).
  - **For custom integrations**: implement OAuth client credentials flow.

- **Option b) — Partial.**

- **Option c) — Partial; verify.**

- **Option d) — Partial; OAuth typical.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. OAuth client credentials typical for Camunda APIs; modern, secure, scoped, token-based.
- **b) 4/10** — partial.
- **c) 5/10** — partial.
- **d) 5/10** — partial.

**Correct Answer:** Camunda APIs typically use OAuth client credentials (token-based, expiry, scoped); use OAuth for new integrations; API keys may be available in some configs.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "API key OAuth external service." Auth choice.

**Въпросът → Solution Framing.** "API key vs OAuth" — изпитва се API auth options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че OAuth modern, че API keys simpler but less secure, че Camunda typical OAuth. Това е знание за API auth.

---

## Question 56: Managing Dev (Weighting: 14%)

**Scenario:** Team has dev / staging / prod clusters. Same Web Modeler project. They wonder if they can **deploy to different clusters** from the same Web Modeler project.

**Multi-cluster deployment from Web Modeler?**

- **a)** **Web Modeler typically supports deploying to multiple clusters**:
  - **Cluster selection** at deploy time: choose target cluster.
  - **Cluster credentials**: each cluster has its own client credentials.
  - **Same project**: can deploy any file to any cluster.
  - **Promotion workflow**: dev → staging → prod via successive deploys.
  
  Verify per Web Modeler version's cluster management. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/) + [Console](https://docs.camunda.io/docs/components/console/)

- **b)** One project per cluster — overstates. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** Cannot deploy from Web Modeler — wrong. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** Only via API — partial. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Multi-cluster deployment from Web Modeler:

  **Cluster targets**:
  - **Dev**: development cluster; experimentation.
  - **Staging**: pre-prod; validation.
  - **Prod**: production; live processes.

  **Web Modeler integration with Console**:
  - Console manages clusters.
  - Web Modeler knows about user's clusters.
  - At deploy: pick target.

  **Deployment from Web Modeler**:

  **Steps** (typical):
  1. Open file in Web Modeler.
  2. Click "Deploy" button.
  3. Select target cluster from dropdown.
  4. Confirm; deployment happens.
  5. View deployment status.

  **Authentication**:
  - Each cluster has its own API credentials.
  - Web Modeler uses appropriate credentials per target.
  - User's permissions per cluster determine access.

  **Promotion workflow**:

  **Step 1: Develop in dev**:
  - Edit BPMN; deploy to dev cluster.
  - Test with sample data.
  - Iterate.

  **Step 2: Promote to staging**:
  - When dev-tested, deploy same file to staging.
  - Validate with prod-like data.
  - User acceptance testing.

  **Step 3: Promote to prod**:
  - After staging approval, deploy to prod.
  - Monitor; verify production behavior.

  **Workflows**:

  **Manual promotion**:
  - Person clicks "Deploy to staging," then later "Deploy to prod."
  - Simple; works for low-frequency deploys.

  **API-based CI/CD**:
  - Pipeline (Jenkins / GitHub Actions / etc.) calls deploy API.
  - Automated; reproducible.
  - Better for high-frequency deploys.

  **Tag / version promotion**:
  - Web Modeler may support tags / versions per file.
  - Promote specific version (not latest).
  - Avoid promoting in-progress work.

  **Cluster credentials management**:

  **Per-cluster client credentials**:
  - Each cluster has its own client_id + client_secret.
  - Web Modeler stores / uses appropriately.
  - User permissions per cluster control access.

  **Best practices**:

  - **Same BPMN across environments**: ensure dev/staging/prod use identical models.
  - **Environment-specific config via secrets / variables**: not in BPMN.
  - **Version files in Web Modeler**: tag versions for promotion clarity.
  - **CI/CD for production**: avoid manual prod deploys.
  - **Approval gates**: prod requires approval / review.
  - **Rollback plan**: prior version deployable if new fails.

  **Common patterns**:

  **Pattern A: Single Web Modeler project, multi-cluster**:
  - All envs target same project.
  - Promote by deploy.
  - Simple; works for small teams.

  **Pattern B: Project per environment**:
  - Separate Web Modeler projects for dev / staging / prod.
  - File copies / syncs between projects.
  - More isolation; more management overhead.

  **Pattern C: Git-based source of truth**:
  - BPMN files in Git.
  - CI deploys to clusters based on branch / tag.
  - Web Modeler edits via Git integration (if supported) or in-place.

  **Considerations**:

  - **Schema compatibility across clusters**: same Camunda version typically.
  - **Cluster size differences**: prod may be larger; ensure load tests.
  - **Migration impact**: deploying new version may need in-flight migration (per Q53).

  **Anti-patterns**:

  - **Different BPMN per env**: drift; hard to debug.
  - **Hard-coded env-specific URLs in BPMN**: use secrets / variables.
  - **Direct prod deploys without staging**: high risk.

- **Option b) — Overstates.**

- **Option c) — Wrong.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Web Modeler supports multi-cluster deploys; pick target at deploy time; CI/CD for production.
- **b) 3/10** — overstates.
- **c) 1/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** Web Modeler supports deploying to multiple clusters; choose target at deploy; promotion workflow dev → staging → prod; CI/CD for production.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "dev staging prod same project." Multi-cluster deploy.

**Въпросът → Solution Framing.** "Deploy to different clusters" — изпитва се Web Modeler features.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че multi-cluster supported, че promotion workflow, че CI/CD for prod. Това е знание за multi-cluster deploy.

---

## Question 57: Managing Dev (Weighting: 14%)

**Scenario:** Team needs to triage instances by **specific variable value** in Operate — e.g., "show all instances where `customerId = C-100`." Team wonders Operate's variable filtering.

**Operate filtering by variable values?**

- **a)** **Operate typically supports variable-based filtering**:
  - **Variable name + operator + value**: filter expression.
  - **Operators**: equals, contains, exists, etc.
  - **Multiple filters**: AND combinations.
  - **API equivalent**: same filtering via API.
  
  Verify exact UI / API capability per Operate version. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/process-instances/)

- **b)** Only by process ID — wrong typically. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** No filtering — wrong. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Manual SQL — partial. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate variable filtering:

  **Standard filters**:
  - **Process definition / version**.
  - **State**: active, completed, terminated, with incident.
  - **Start date range, end date range**.
  - **Process instance ID / key**.
  - **Parent process** (for subprocesses).
  - **Variables**: name + operator + value.

  **Variable filter examples**:

  **Equals**:
  - `customerId = "C-100"`: instances with this specific customer.

  **Multiple variable conditions**:
  - `customerId = "C-100" AND status = "PENDING"`: combine.

  **Operators** (verify per version):
  - **Equals (=)**: exact match.
  - **Contains**: substring (for strings).
  - **Greater / less than**: numeric / date comparisons.
  - **Exists**: variable is set (any value).
  - **Range**: between values.

  **UI workflow**:
  1. Open Operate process instances view.
  2. Click "Add filter" or similar.
  3. Choose variable name (or type if dynamic).
  4. Select operator.
  5. Enter value.
  6. Apply; results filtered.

  **API equivalent**:
  ```json
  POST /v1/process-instances/search
  {
    "filter": {
      "variables": [
        {"name": "customerId", "value": "C-100", "operator": "EQUALS"}
      ]
    }
  }
  ```

  **Use cases**:

  **Use case 1: Customer support**:
  - Customer calls; find their active processes.
  - Filter by customerId; see their order, support tickets, etc.

  **Use case 2: Investigation**:
  - Bug report mentions specific orderId.
  - Filter by orderId; find affected instance.

  **Use case 3: Operational metrics**:
  - "How many high-priority orders pending?".
  - Filter by priority and status.

  **Use case 4: Audit**:
  - "Find all instances touched by user X."
  - Filter by user variable.

  **Performance considerations**:

  **Indexing**:
  - Operate may index common variables for fast filtering.
  - Unindexed variable filters: slower; full scan.
  - **For frequent filters**: ensure indexing (verify Operate version config).

  **Large result sets**:
  - Pagination on result lists.
  - Don't expect to view 10,000 results all at once.
  - Refine filters or use aggregate APIs.

  **Custom queries**:

  - **Operate API**: programmatic filtering for custom dashboards.
  - **Direct DB access** (Self-Managed): for power users; ensure proper indices.
  - **Export to BI**: ETL Operate data to data warehouse for advanced analytics.

  **Best practices**:

  - **Train operators on filtering**: don't open every instance manually.
  - **Save common filters**: if Operate supports bookmarking.
  - **Combine with date ranges**: limit scope of search.
  - **For complex queries**: API + scripts, not UI.

  **Anti-patterns**:

  - **No filters; browse all**: doesn't scale.
  - **Filtering on non-indexed variables on huge datasets**: slow.
  - **Variable name typos**: silent no-match (variable doesn't exist that way).

  **For the scenario** (find by customerId = "C-100"):
  - Operate UI → filter → variables → name: `customerId`, operator: `=`, value: `C-100`.
  - Returns matching instances.
  - Inspect each as needed.

- **Option b) — Wrong typically.**

- **Option c) — Wrong.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Operate supports variable filtering (name + operator + value); equivalent API; multiple conditions.
- **b) 2/10** — wrong.
- **c) 1/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** Operate supports variable-based filtering (name + operator + value); use UI for ad-hoc, API for programmatic; indexed variables for performance.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instances/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "customerId = C-100 filter." Variable filtering.

**Въпросът → Solution Framing.** "Variable filtering" — изпитва се Operate filter features.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че variable filter, че operators, че indexing matters. Това е знание за Operate filtering.

---

## Question 58: Managing Dev (Weighting: 14%)

**Scenario:** Cluster shows symptoms: jobs piling up unactivated, high CPU on broker, slow API responses. Team wonders **resource exhaustion** symptoms + mitigation.

**Resource exhaustion symptoms + mitigation?**

- **a)** **Common cluster resource issues + mitigations**:
  - **CPU saturation**: scale up nodes; profile hot paths; check for hot loops.
  - **Memory pressure**: increase heap; check for leaks; tune GC.
  - **Disk full**: increase storage; clean old data per retention policies.
  - **Network saturation**: scale gateway nodes; check for high-volume clients.
  - **Backlog growth**: scale workers; check downstream bottlenecks.
  - **Slow API responses**: scale gateway; check Operate/database load.
  
  Use **Prometheus metrics + alerts** to detect; have runbooks for each scenario. Documentation: [Self-Managed Operations](https://docs.camunda.io/docs/self-managed/concepts/) + [Monitoring](https://docs.camunda.io/docs/self-managed/concepts/)

- **b)** Restart cluster — partial; not root cause. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/concepts/)

- **c)** Cluster auto-handles — wrong. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/concepts/)

- **d)** Symptoms unrelated — wrong. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/concepts/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Cluster resource exhaustion playbook:

  **Common symptoms + causes**:

  **CPU saturation**:
  - **Symptoms**: high CPU on broker / gateway nodes; slow operations.
  - **Causes**: high load (many concurrent processes), expensive operations, GC pressure.
  - **Mitigations**:
    - Scale horizontally (more nodes).
    - Profile hot paths (FlameGraph, JFR).
    - Reduce process complexity if possible.

  **Memory pressure**:
  - **Symptoms**: OOM errors, frequent GC, slow operations.
  - **Causes**: undersized heap, memory leak, large variable payloads.
  - **Mitigations**:
    - Increase heap size.
    - Check for leaks (heap dump analysis).
    - Reduce variable payload sizes (use document references instead of inline binaries).

  **Disk full**:
  - **Symptoms**: write failures, snapshot failures.
  - **Causes**: history accumulation, large process state, log buildup.
  - **Mitigations**:
    - Increase storage.
    - Tune data retention (per Set 13 Q29).
    - Archive old data.

  **Network saturation**:
  - **Symptoms**: high latency, timeouts, packet loss.
  - **Causes**: high throughput, many clients, hot partition.
  - **Mitigations**:
    - Scale gateway nodes.
    - Distribute traffic.
    - Check client patterns (chatty workers?).

  **Backlog growth**:
  - **Symptoms**: jobs piling up, processes pending.
  - **Causes**: workers can't keep up, downstream APIs slow, worker crashes.
  - **Mitigations**:
    - Scale workers (per Set 14 Q19).
    - Investigate downstream bottlenecks.
    - Fix worker errors.

  **Slow API responses (Operate / Tasklist)**:
  - **Symptoms**: UI slow, queries time out.
  - **Causes**: too much data, missing indices, undersized Elasticsearch.
  - **Mitigations**:
    - Scale Operate / Elasticsearch.
    - Tune retention (less data).
    - Add indices for common queries.

  **For the scenario** (jobs piling up, high CPU on broker, slow APIs):

  **Initial assessment**:
  1. **Check broker CPU**: > 80%? Saturation likely.
  2. **Check job backlog**: how many unactivated?
  3. **Check API latency**: which APIs slow?
  4. **Check worker health**: are workers running? Polling?
  5. **Check downstream**: are external APIs slow?

  **Likely diagnosis**:
  - Broker overloaded; can't service all worker polls efficiently.
  - **Mitigations**:
    - Scale broker nodes.
    - Reduce poll frequency (workers may be polling too aggressively).
    - Investigate root cause (sudden spike? misconfigured workload?).

  **Diagnostic tools**:

  **Prometheus + Grafana**:
  - CPU / memory / disk dashboards.
  - Job backlog metrics.
  - API latency histograms.

  **Logs**:
  - Broker logs for errors, warnings.
  - GC logs for memory pressure.
  - Slow query logs.

  **JVM tools** (for JVM-based components):
  - Heap dumps.
  - Thread dumps.
  - JFR recordings.

  **Cluster status APIs**:
  - Camunda may expose health endpoints.
  - Per-node status.

  **Mitigation strategies**:

  **Short-term (incident response)**:
  - **Scale up**: add capacity quickly.
  - **Restart problem nodes**: if memory leak suspected.
  - **Reduce load**: throttle clients; cancel non-critical processes.

  **Medium-term**:
  - **Tune configuration**: heap sizes, thread pools, etc.
  - **Optimise workloads**: reduce hot paths.
  - **Improve workers**: more efficient code.

  **Long-term**:
  - **Capacity planning**: model load growth.
  - **Architecture review**: design for scale.
  - **Continuous monitoring**: detect early.

  **Best practices**:

  - **Alerting**: set thresholds; alert on resource exhaustion early.
  - **Runbooks**: documented procedures for each scenario.
  - **Load testing**: regularly test cluster capacity.
  - **Capacity headroom**: don't run near 100%; have buffer.
  - **Chaos engineering**: test failure modes.

  **For SaaS**:
  - Camunda manages cluster scaling typically.
  - Plan tier may limit capacity.
  - Contact support for capacity issues.

  **Anti-patterns**:

  - **Restart-and-hope**: doesn't fix root cause.
  - **Ignore symptoms**: minor issues escalate to major outages.
  - **No monitoring**: blind to issues until customers complain.

- **Option b) — Partial; not root cause.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple exhaustion types: CPU, memory, disk, network, backlog, API latency; each has specific mitigations.
- **b) 3/10** — partial.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Common exhaustion types: CPU, memory, disk, network, backlog, API latency; each with specific mitigations; use Prometheus + runbooks.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/concepts/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "jobs piling high CPU slow APIs." Resource exhaustion.

**Въпросът → Solution Framing.** "Symptoms + mitigation" — изпитва се knowledge на cluster ops.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че multiple symptoms, че scale + tune + investigate, че Prometheus alerts. Това е знание за resource management.

---

## Question 59: Managing Dev (Weighting: 14%)

**Scenario:** Team wants **BPMN linting** to enforce conventions (naming, structure, no unauthorized Connectors) in CI before deployment. Team wonders about lint tools.

**BPMN linting / CI rules?**

- **a)** **BPMN linting tools exist**:
  - **`bpmnlint`** (community / open-source): configurable rules for BPMN files.
  - **Custom checks**: scripts parsing BPMN XML; validate company rules.
  - **CI integration**: run on every PR; fail if violations.
  - **Rule examples**: element naming conventions, max process complexity, banned elements, required documentation.
  - **Element Templates** as part of governance (per Set 13 Q51).
  
  Documentation: [BPMN.io](https://bpmn.io/) + bpmnlint community + [Element Templates](https://docs.camunda.io/docs/components/modeler/web-modeler/element-templates/)

- **b)** No linting — wrong. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **c)** Only Camunda's linting — partial. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** Cannot enforce in CI — wrong. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN linting + governance options:

  **bpmnlint** (community tool):

  **What**: open-source linter for BPMN files.
  - Run via CLI or as JavaScript library.
  - Configurable rules.
  - Plugins for custom rules.

  **Built-in rules**:
  - Element labels (require name attribute).
  - End event presence.
  - Sequence flow validity.
  - Gateway divergence-convergence balance.
  - Many more (depending on bpmnlint version).

  **Custom rules**:
  - Write JavaScript plugins.
  - Implement organisation-specific conventions.

  **CI integration**:
  ```yaml
  # .github/workflows/lint.yml
  - name: Lint BPMN files
    run: |
      npm install -g bpmnlint
      bpmnlint diagrams/*.bpmn
  ```

  Fail build on violations; require modeler to fix.

  **Custom XML parsing**:

  For custom rules not covered by bpmnlint:
  ```python
  # Parse BPMN XML; check custom rules
  from xml.etree import ElementTree as ET
  
  tree = ET.parse('process.bpmn')
  root = tree.getroot()
  
  # Rule: All Service Tasks must have specific job worker prefix
  for task in root.iter('{http://www.omg.org/spec/BPMN/...}serviceTask'):
      # Check task definition extension
      # Validate type starts with "com.company:"
      ...
  ```

  **Rule examples**:

  **Naming conventions**:
  - All element IDs follow pattern.
  - All elements have non-empty `name` attributes.
  - Element names not blank / too long / too short.

  **Structure**:
  - No more than N tasks per process (complexity limit).
  - All paths have End events.
  - No orphan elements.

  **Governance**:
  - Only approved Connector types used.
  - Required documentation on User Tasks.
  - No empty BPMN annotations.

  **Versioning**:
  - Element Template versions consistent.
  - Process IDs follow versioning convention.

  **Domain rules**:
  - Specific Service Tasks for billing must have retries ≥ 3.
  - Customer-facing processes must have Timer Boundary (SLA enforcement).

  **For DMN, FEEL, Forms**:

  **DMN linting**:
  - Custom XML parsers.
  - Verify hit policy + default rule.
  - Check decision IDs.

  **FEEL linting**:
  - Inline expressions in BPMN/DMN.
  - Validate syntax (use FEEL parser).
  - Check for common mistakes (type coercions, null handling).

  **Form linting**:
  - Form JSON structure.
  - Required fields conventions.
  - Validation rules presence.

  **CI workflow**:

  ```yaml
  on: [pull_request]
  jobs:
    lint:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Setup Node
          uses: actions/setup-node@v3
        - run: npm install -g bpmnlint
        - run: bpmnlint diagrams/**/*.bpmn
        - name: Custom checks
          run: python scripts/lint-bpmn.py diagrams/
  ```

  **Pre-commit hooks**:

  ```yaml
  # .pre-commit-config.yaml
  - repo: local
    hooks:
      - id: bpmn-lint
        name: BPMN Lint
        entry: bpmnlint
        files: \.bpmn$
  ```

  Catches violations before commit.

  **Element Templates as governance** (per Set 13 Q51):
  - Constrain modelers to use approved patterns.
  - Element Templates encode conventions.
  - BPMN linter verifies template usage.

  **Combined approach**:
  1. **Element Templates**: positive control — provide approved options.
  2. **BPMN Linter**: negative control — block violations.
  3. **Web Modeler design-time checks**: immediate feedback.
  4. **CI checks**: enforce before deploy.
  5. **Code review**: human eyes on changes.

  **For the scenario** (linting BPMN in CI):

  **Step 1: Define organization rules**:
  - Naming conventions.
  - Approved Connectors.
  - Required elements.
  - Complexity limits.

  **Step 2: Configure bpmnlint** (or build custom):
  - Use built-in rules where possible.
  - Add custom plugins for org-specific.

  **Step 3: Integrate in CI**:
  - PR / branch hooks.
  - Fail build on violations.

  **Step 4: Educate team**:
  - Document conventions.
  - Provide examples.
  - Iterate based on common violations.

  **Best practices**:

  - **Start with minimal rules**: build up gradually.
  - **Document why**: each rule has a reason.
  - **Provide auto-fix where possible**: e.g., automatic ID generation.
  - **Allow exceptions with justification**: not every rule fits every case.
  - **Review rules periodically**: stale rules accumulate.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. bpmnlint + custom scripts; CI integration; rule examples; combine with Element Templates for governance.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Use bpmnlint or custom parsing for BPMN linting; integrate in CI / pre-commit; rules cover naming, structure, governance; combine with Element Templates.

**Official Documentation Link:** https://bpmn.io/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "BPMN linting CI conventions." Linting.

**Въпросът → Solution Framing.** "Lint tools + CI" — изпитва се BPMN governance.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че bpmnlint exists, че custom XML parsing, че combine with Element Templates. Това е знание за BPMN linting.

---

# Section 8 — Development Environment (Question 60)

> Weight 2% • Topic: Docker Compose vs C8 Run for dev.

---

## Question 60: Development Environment (Weighting: 2%)

**Scenario:** Developer chooses between **Docker Compose** vs **C8 Run** for local dev. Wonders the trade-offs.

**Docker Compose vs C8 Run for dev setup?**

- **a)** **Two valid options with different trade-offs**:
  - **C8 Run**: bundled installer; quick start; runs natively. **Pros**: easy, no Docker; **Cons**: less control over individual components.
  - **Docker Compose**: containerized stack (zeebe / operate / tasklist / connectors / identity). **Pros**: full control, matches prod-like deployments; **Cons**: requires Docker; more setup.
  - **Choose**: C8 Run for quick exploration; Docker Compose for production-similar dev / multi-developer alignment.
  
  Both supported officially. Documentation: [Local Setup](https://docs.camunda.io/docs/self-managed/setup/deploy/local/c8run/) + [Docker Compose](https://docs.camunda.io/docs/self-managed/setup/deploy/local/docker-compose/)

- **b)** Only Docker Compose — wrong. Documentation: [Local Setup](https://docs.camunda.io/docs/self-managed/setup/deploy/local/)

- **c)** Only C8 Run — wrong. Documentation: [Local Setup](https://docs.camunda.io/docs/self-managed/setup/deploy/local/)

- **d)** Neither works locally — wrong. Documentation: [Local Setup](https://docs.camunda.io/docs/self-managed/setup/deploy/local/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Local dev options for Camunda 8:

  **C8 Run (Camunda 8 Run)**:

  **What it is**:
  - Bundled installer with all Camunda 8 components.
  - Pre-configured for dev use.
  - Cross-platform: Windows, macOS, Linux.

  **What's included**:
  - Zeebe (broker + gateway).
  - Operate.
  - Tasklist.
  - Connectors.
  - Web Modeler (some versions).
  - Identity (some versions).

  **Pros**:
  - **Easy start**: download + run.
  - **No Docker required**: helpful if Docker unavailable / restricted.
  - **Sensible defaults**: ready out of the box.
  - **Lightweight**: smaller resource footprint than full container stack.

  **Cons**:
  - **Less customisable**: hard to swap individual versions.
  - **Less production-like**: prod is usually containerised.
  - **Port conflicts** (per Set 13 Q60): may conflict with other apps.

  **Use cases**:
  - First-time exploration.
  - Quick proof-of-concept.
  - Local development without infrastructure overhead.

  **Docker Compose**:

  **What it is**:
  - Stack definition (docker-compose.yml) with all components as containers.
  - Spin up entire Camunda 8 stack with one command.

  **Setup**:
  ```bash
  git clone https://github.com/camunda/camunda-platform
  cd camunda-platform
  docker compose up -d
  ```

  **Pros**:
  - **Production-like**: containers similar to prod deployment.
  - **Version control**: pin specific versions of each component.
  - **Customisable**: edit yaml to suit needs.
  - **Reproducible**: same setup across team.
  - **Easy reset**: tear down + recreate.

  **Cons**:
  - **Requires Docker**: not always available.
  - **Resource-heavy**: full stack uses significant RAM / CPU.
  - **More complex**: yaml to understand + maintain.
  - **Startup time**: slower than native binary.

  **Use cases**:
  - Production-like dev.
  - Team consistency.
  - CI / automated testing.
  - Customisations (e.g., custom Connectors).

  **Decision matrix**:

  | Need | Recommendation |
  |------|----------------|
  | Just trying things out | C8 Run |
  | Hate Docker | C8 Run |
  | Need prod-similar dev | Docker Compose |
  | Multiple devs need same setup | Docker Compose |
  | Custom Connectors / extensions | Docker Compose |
  | Limited resources | C8 Run |
  | CI testing | Docker Compose |

  **Hybrid approaches**:

  **Pattern 1: C8 Run + selective container**:
  - C8 Run for core; add containers for extras.
  - Custom mix.

  **Pattern 2: Docker Compose with subset**:
  - Comment out unneeded services.
  - Lighter Docker stack.

  **Pattern 3: Camunda SaaS for dev**:
  - Use a SaaS cluster for dev (free trial / cheap tier).
  - No local infra at all.
  - Pros: real cloud; Cons: requires internet, may not be air-gapped.

  **For onboarding**:

  - **Document chosen approach**: clear getting-started guide.
  - **Provide quick-start script**: one-command setup.
  - **Troubleshoot common issues**: port conflicts, etc.

  **For long-running dev**:

  - **Consider Docker** even if C8 Run easier initially.
  - **Production parity** pays off in fewer surprises.

  **Other considerations**:

  **Network**:
  - Both expose default ports (8080, 26500, etc.).
  - Configurable; useful for port conflict resolution.

  **Persistence**:
  - **C8 Run**: state in local filesystem.
  - **Docker Compose**: volumes; can persist or reset.

  **Updates**:
  - **C8 Run**: download new version.
  - **Docker Compose**: pull new images; recreate.

  **Multi-instance**:
  - **C8 Run**: one instance per machine (port collisions).
  - **Docker Compose**: can run multiple stacks with different ports.

  **Best practices**:

  - **Match dev to prod**: closer the better.
  - **Reset frequently**: clean state catches issues.
  - **Source-control config**: yaml in Git for team alignment.
  - **Document quirks**: ports, paths, etc.

  **Anti-patterns**:

  - **Dev only on SaaS**: high cost; vendor lock-in.
  - **Inconsistent setups across team**: works-on-my-machine bugs.
  - **No teardown**: stale state accumulates.

  **For the scenario** (developer choosing):

  - **Pure exploration / first try**: C8 Run.
  - **Real development**: Docker Compose.
  - **Team alignment**: Docker Compose.
  - **Custom stack**: Docker Compose.

  Both officially supported; pick based on needs.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Both valid: C8 Run easy + lightweight; Docker Compose customisable + production-like; pick per need.
- **b) 2/10** — wrong.
- **c) 2/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Both C8 Run (easy, native) and Docker Compose (production-like, customisable) are officially supported; choose based on need (exploration vs prod-similar dev).

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/setup/deploy/local/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Docker Compose vs C8 Run." Dev setup choice.

**Въпросът → Solution Framing.** "Trade-offs" — изпитва се knowledge на dev options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че both supported, че C8 Run easy, че Docker Compose prod-like. Това е знание за local dev setup.

---

# 🎯 Set 14 — Closing Summary

**60 questions completed** across the Camunda 8 C8-CP-DV Blueprint v8.8.0 distribution:

| Section | Questions | Weight | Topics |
|---------|-----------|--------|--------|
| **1. Modeling** | Q1-Q9 (9) | 15% | Inclusive Gateway overlap, Event Subprocess non-interrupting, Conditional Start Event, Receive Task vs Message Catch, Call Activity vs Embedded data passing, Signal scope broadcast, Manual Task semantics, Sequence Flow diamond marker, Terminate End scope |
| **2. Configuring Processes** | Q10-Q22 (13) | 22% | Retries vs activation timeout interaction, Input Mapping order, MI empty collection, message TTL buffering, Document attachment to User Task, Element Template propagation, AI Agent prompt templates, ISO 8601 sub-minute precision, migration variable handling, worker concurrency tuning, Boundary Compensation, correlation conflicts, assignee vs candidateGroups precedence |
| **3. DMN** | Q23-Q29 (7) | 11% | COLLECT aggregators (C+/C</C>/C#), every/some quantifiers, decision input variable mapping, deployment versioning strategy, default rule placement, standalone REST API invocation, multi-layered testing strategy |
| **4. Forms** | Q30-Q32 (3) | 5% | Select vs Radio for 200 options, conditional field visibility, regex + custom validation |
| **5. Connectors** | Q33-Q36 (4) | 7% | SOAP Connector availability, SMTP Email outbound, Connector retry vs Service Task retry layered, custom Connector deployment to SaaS |
| **6. Extensions** | Q37-Q50 (14) | 23% | FEEL flatten, distinct values, BKM parameter typing, date arithmetic, @Variable vs @VariablesAsType, Node maxJobsActive, REST timeout, SDK token auto-refresh, custom Connector secrets binding, Webhook auth modes (HMAC/Basic/JWT), RPA bot orchestration, decimal banker's rounding, list union/intersection, gRPC keepalive HTTP/2 PING |
| **7. Managing Dev** | Q51-Q59 (9) | 14% | Flow node performance breakdown, bulk operations API for 1000s, process migration tooling, SSO provisioning (OIDC/SAML/SCIM), API key vs OAuth choice, multi-cluster deploy from Web Modeler, Operate variable filtering, resource exhaustion playbook, BPMN linting in CI (bpmnlint) |
| **8. Development Environment** | Q60 (1) | 2% | Docker Compose vs C8 Run trade-offs |

**Total:** 60 questions • Blueprint v8.8.0 compliant • All fresh scenarios distinct from Sets 1-13.

**Three-Skills coverage per question:** Diagnostic Comprehension (scenario interpretation) / Solution Framing (option evaluation) / Mechanism Knowledge (underlying Camunda 8 semantic).

**Passing criterion:** ≥39/60 correct (~65%) within 75 minutes.

**Recommended study path after this set:**
1. Master FEEL list operations: flatten, distinct values, every/some, union/intersection patterns.
2. Practice gateway semantics: XOR vs OR vs Parallel + their join behaviors.
3. Drill compensation + transaction subprocess flows.
4. Memorize SDK concurrency tuning knobs (Java + Node).
5. Practice migration planning for V1→V2 process upgrades.
6. Hands-on: configure SSO with a local IdP (Keycloak / Auth0); test BPMN candidate groups.

---

**Good luck with the certification! 🎓**
