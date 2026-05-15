# Camunda 8 C8-CP-DV Mock Exam — Set 5

> **60 въпроса • 75 минути • праг ≥ 65% (39/60) • Blueprint v8.8.0**
>
> Свежи сценарии — distinct от Set 1, 2, 3, 4. Всеки въпрос: сценарий + 4 опции (a/b/c/d) + 🔍 Explanations + per-option score 1–10 + Correct Answer + Documentation Link + 🧠 Three-Skills Decomposition.

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

**Scenario:** A B2B procurement workflow involves two **separate companies** — Vendor and Buyer. Each has their own internal process and communicates with the other only via messages (purchase orders, invoices, shipment notifications). The model must clearly show **inter-organisational boundaries**.

**Which BPMN construct fits?**

- **a)** **Two Pools — one per organisation** — connected by **Message Flows**. Each Pool is its own deployable process; communication crosses the org boundary via messages. Documentation: [Collaboration](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **b)** Single Pool with two Lanes (Vendor + Buyer). Documentation: [Lanes](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **c)** Two Call Activities calling each other reciprocally. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **d)** Single Pool with annotation text explaining who does what. Documentation: [Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Multiple Pools represent **separate participants/organisations**. Each Pool is independently deployable. Inter-Pool communication uses **Message Flows** (dashed connector) — exactly the inter-org case described.

- **Option b) — Wrong scope.** Lanes are for internal teams within one organisation/process, not separate orgs.

- **Option c) — Overcomplicates.** Two-way Call Activities create circular dependencies; Message Flows are the canonical inter-org pattern.

- **Option d) — Loses semantics.** Annotation text isn't machine-readable; defeats the inter-org modelling.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Two Pools + Message Flows.
- **b) 3/10** — wrong scope (Lanes = internal).
- **c) 3/10** — circular dependency.
- **d) 2/10** — loses semantics.

**Correct Answer:** Two Pools (one per org) connected by Message Flows.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Two separate companies + inter-org boundary" → разпознаваш че се иска **Pools + Message Flows**.

**Въпросът → Solution Framing.** "Inter-organisational boundaries" — изпитва се knowledge на Pool vs Lane scope.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Pools = separate participants, Lanes = internal teams, Message Flows = inter-Pool comm. Знание за collaboration modelling.

---

## Question 2: Modeling (Weighting: 15%)

**Scenario:** A loan-application Service Task calls a third-party credit-scoring API. The team wants: if the API throws BPMN Error `"CREDIT_UNAVAILABLE"`, **cancel the Service Task** and route to a manual-review branch. Other errors should keep retrying.

**Which BPMN construct fits?**

- **a)** **Interrupting Error Boundary Event** with `errorCode = "CREDIT_UNAVAILABLE"` attached to the Service Task; outgoing sequence flow routes to the manual-review branch. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **b)** Non-interrupting Error Boundary Event. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** Try/catch logic inside the worker; no BPMN event. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Conditional Sequence Flow on the outgoing path. Documentation: [Sequence Flows](https://docs.camunda.io/docs/components/modeler/bpmn/sequence-flows/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Interrupting Error Boundary Event** (solid border with error marker) cancels the host activity when the worker throws a matching BPMN error and routes flow out the boundary's outgoing arrow. With `errorCode = "CREDIT_UNAVAILABLE"`, only that specific code triggers; other errors continue retrying.

- **Option b) — Wrong semantics.** Non-interrupting (dashed) doesn't cancel the host — the Service Task would keep retrying alongside the manual-review branch (parallel execution).

- **Option c) — Hides BPMN flow.** Worker-internal handling buries the routing decision; BPMN should express it visually.

- **Option d) — Wrong trigger.** Conditional flows evaluate variables on **completion**, not on error throw.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Interrupting Error Boundary + errorCode.
- **b) 3/10** — wrong (would run in parallel).
- **c) 3/10** — hides routing.
- **d) 3/10** — wrong trigger.

**Correct Answer:** Interrupting Error Boundary Event with errorCode = "CREDIT_UNAVAILABLE".

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/error-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Cancel task + route on specific error" → разпознаваш че се иска **Interrupting Error Boundary**.

**Въпросът → Solution Framing.** "Fits" — изпитва се knowledge на error-event flavours.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Interrupting cancels host, Non-interrupting runs parallel, worker-internal hides flow, conditional flow ≠ error trigger. Знание за Error Boundary semantics.

---

## Question 3: Modeling (Weighting: 15%)

**Scenario:** An insurance-claim process may need to perform any combination of: photo analysis, witness interview, police-report request — based on claim metadata. Multiple checks can run **in parallel** if their conditions hold, but if no condition matches, the flow should still continue (default path).

**Which gateway construct fits the split + the join?**

- **a)** **Inclusive Gateway (OR)** for split — evaluates all outgoing conditions; activates each branch whose condition is true. **Inclusive Gateway (OR)** for join — waits for all *taken* incoming branches. Default flow handles "no condition matched." Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **b)** Parallel split + Parallel join. Documentation: [Parallel Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/parallel-gateways/)

- **c)** Exclusive split + Exclusive join. Documentation: [Exclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/)

- **d)** Event-Based Gateway. Documentation: [Event-Based Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/event-based-gateways/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Inclusive Gateway is purpose-built for "**one or many** branches" based on data conditions. The join knows which branches were taken and waits only for those. Default flow handles the zero-match case.

- **Option b) — Wrong semantics.** Parallel always runs all branches regardless of conditions.

- **Option c) — Wrong semantics.** Exclusive takes exactly one branch; can't run multiple in parallel.

- **Option d) — Wrong trigger.** Event-Based races incoming events, not condition evaluation.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Inclusive Gateway за OR semantics.
- **b) 3/10** — runs all regardless.
- **c) 3/10** — exactly one.
- **d) 2/10** — wrong trigger.

**Correct Answer:** Inclusive Gateway split + Inclusive Gateway join.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Any combination based on conditions + multiple in parallel" → разпознаваш че се иска **Inclusive (OR)**.

**Въпросът → Solution Framing.** "Split + join construct" — изпитва се gateway semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Inclusive = 1-or-many on data, Parallel = all, Exclusive = exactly one, Event-Based = race events. Знание за gateway selection.

---

## Question 4: Modeling (Weighting: 15%)

**Scenario:** A subscription-renewal process must **wait for a customer-payment confirmation message** before proceeding. The message is sent asynchronously by the payment gateway. The process should pause at this point until the message arrives.

**Which BPMN construct fits?**

- **a)** **Receive Task** (or Intermediate Message Catch Event) configured with the message name and correlation key (e.g., `=subscriptionId`). The process pauses; Zeebe correlates the published message to the waiting subscription. Documentation: [Receive Task](https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks/) + [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **b)** Service Task that polls the gateway every minute. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** User Task waiting for a human acknowledgement. Documentation: [User Task](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Timer Event with PT24H wait. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Receive Task and Intermediate Message Catch Event are BPMN's wait-for-message constructs. Configure message name + correlation key (FEEL expression matching process variable). When matching message is published, Zeebe correlates and resumes.

- **Option b) — Wastes resources.** Polling burns worker capacity for hours.

- **Option c) — Wrong semantics.** User Tasks are for human work; this is a system message.

- **Option d) — Wrong intent.** Timer fires after a fixed duration regardless of payment status.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Receive Task / Message Catch.
- **b) 2/10** — wastes resources.
- **c) 2/10** — wrong semantics.
- **d) 2/10** — wrong intent.

**Correct Answer:** Receive Task or Intermediate Message Catch Event with correlation key.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Wait for async payment message" → разпознаваш че се иска **Receive Task / Message Catch**.

**Въпросът → Solution Framing.** "Fits" — изпитва се wait-for-message construct.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Receive Task = message wait, polling = waste, User Task = human, Timer = duration. Знание за message correlation.

---

## Question 5: Modeling (Weighting: 15%)

**Scenario:** A complex fraud-detection process has multiple parallel branches investigating different aspects. If **one branch** definitively detects fraud, the team wants to **immediately stop all branches and the entire process instance**, ending without normal completion.

**Which End Event fits?**

- **a)** **Terminate End Event** — terminates the entire process instance immediately, cancelling all active tokens regardless of which branch they're in. Documentation: [Terminate End Event](https://docs.camunda.io/docs/components/modeler/bpmn/terminate-events/)

- **b)** Regular None End Event. Documentation: [End Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/)

- **c)** Error End Event. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **d)** Cancel End Event. Documentation: [Cancel Events](https://docs.camunda.io/docs/components/modeler/bpmn/cancel-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Terminate End Event** is BPMN's "kill everything in this scope" event. When reached, all active tokens in the same scope (process or subprocess) are cancelled. Designed exactly for "stop everything now."

- **Option b) — Wrong semantics.** None End just consumes one token — other parallel branches continue.

- **Option c) — Different intent.** Error End throws an error upward; doesn't cancel siblings in same scope unless caught.

- **Option d) — Wrong scope.** Cancel End is paired with **transaction subprocess** Cancel Boundary Events; not for parallel-branch termination in normal flow.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Terminate End Event.
- **b) 3/10** — only consumes one token.
- **c) 4/10** — different propagation.
- **d) 3/10** — wrong scope (transaction).

**Correct Answer:** Terminate End Event.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/terminate-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Stop all branches and entire instance" → разпознаваш че се иска **Terminate End**.

**Въпросът → Solution Framing.** "End Event fits" — изпитва се end-event types.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Terminate kills scope, None consumes 1 token, Error throws, Cancel = transaction. Знание за End Event flavours.

---

## Question 6: Modeling (Weighting: 15%)

**Scenario:** A manufacturing process has a step where an operator must **physically inspect** a product — looking for defects, no software involved. The step doesn't trigger any system; the operator's outcome is recorded later. The team wants to model "this is human work, but Camunda is not orchestrating any UI."

**Which Task type fits?**

- **a)** **Manual Task** — represents human work performed outside the workflow engine's awareness. Zeebe doesn't wait on it; effectively a documentation/visual marker. Modelers typically use it for hand-off documentation; in Camunda 8 Zeebe executes it like a pass-through. Documentation: [Manual Task](https://docs.camunda.io/docs/components/modeler/bpmn/manual-tasks/)

- **b)** User Task. Documentation: [User Task](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** Service Task. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Script Task. Documentation: [Script Task](https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Manual Task** semantically represents human work **not orchestrated** by the engine. Visual signal to readers that humans do this outside the system.

- **Option b) — Different semantics.** User Task **is** orchestrated — engine creates a task in Tasklist, waits for completion.

- **Option c) — Wrong nature.** Service Task is automated work.

- **Option d) — Wrong nature.** Script Task runs FEEL/expression scripts inside Zeebe.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Manual Task = unorchestrated human work.
- **b) 4/10** — orchestrated (different semantics).
- **c) 2/10** — automated.
- **d) 2/10** — engine script.

**Correct Answer:** Manual Task.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/manual-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Human work + no UI + no orchestration" → разпознаваш че се иска **Manual Task**.

**Въпросът → Solution Framing.** "Task type fits" — изпитва се task taxonomy.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Manual = unorchestrated, User = Tasklist-orchestrated, Service = worker, Script = engine-side. Знание за Task types.

---

## Question 7: Modeling (Weighting: 15%)

**Scenario:** A loan-application process has three steps logically grouped as "Identity Verification": ID check, address check, biometric check. The grouping is **visual only** — the steps run sequentially in the parent flow. The team wants to collapse the group into a single visual element when not needed.

**Which BPMN construct fits?**

- **a)** **Embedded Subprocess** — visually groups the three steps; can be collapsed/expanded in the diagram. All inner steps share the parent's variable scope. Documentation: [Embedded Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/)

- **b)** Call Activity referencing a separate BPMN. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **c)** Annotation box around the three tasks. Documentation: [Annotations](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** Three separate Pools. Documentation: [Pools](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Embedded Subprocess** groups inline steps in the **same definition**, sharing parent scope. Can be collapsed for readability. Right tool for visual structuring within one process.

- **Option b) — Different scope.** Call Activity points to a separate definition — different lifecycle, separate variable scope.

- **Option c) — Cosmetic.** Annotations don't form a structural group.

- **Option d) — Wrong scope.** Pools = separate participants/processes.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Embedded Subprocess = inline group.
- **b) 4/10** — different scope.
- **c) 3/10** — cosmetic.
- **d) 2/10** — wrong scope.

**Correct Answer:** Embedded Subprocess.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Visual group + same process + collapsible" → разпознаваш че се иска **Embedded Subprocess**.

**Въпросът → Solution Framing.** "Fits" — изпитва се subprocess scope knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Embedded = inline + shared scope, Call Activity = separate definition, annotation = cosmetic, Pools = separate participants. Знание за subprocess types.

---

## Question 8: Modeling (Weighting: 15%)

**Scenario:** A regulatory compliance event must be **broadcast simultaneously** to all running process instances of various types in the cluster — e.g., "Sanctions list updated." Every instance that listens should react.

**Which BPMN event type fits?**

- **a)** **Signal Throw + Signal Catch** — Signals broadcast cluster-wide. Any number of instances (of any process definition) with a Signal Catch Event subscribed to the same signal name receives it. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

- **b)** Message Throw + Message Catch. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **c)** Error Throw + Error Catch. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **d)** Escalation Throw + Escalation Catch. Documentation: [Escalation Events](https://docs.camunda.io/docs/components/modeler/bpmn/escalation-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Signal** events broadcast: one throw → all subscribed catches across **all instances/processes** receive it. Designed for cluster-wide notifications.

- **Option b) — Wrong scope.** Messages correlate to a **specific** instance via correlation key — not broadcast.

- **Option c) — Wrong scope.** Errors propagate upward in the throwing scope only.

- **Option d) — Wrong scope.** Escalation propagates upward in the same scope hierarchy.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Signal broadcast.
- **b) 3/10** — point-to-point correlation.
- **c) 2/10** — scope-local.
- **d) 2/10** — scope-local.

**Correct Answer:** Signal Throw + Signal Catch.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Broadcast to all running instances" → разпознаваш че се иска **Signal**.

**Въпросът → Solution Framing.** "Event type fits" — изпитва се event semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Signal = broadcast, Message = 1-to-1 correlation, Error = upward scope-local, Escalation = upward scope-local. Знание за event scope.

---

## Question 9: Modeling (Weighting: 15%)

**Scenario:** A process should start whenever an **inbound webhook** receives a delivery-notification from a logistics partner. The team configures an Inbound Webhook Connector wired to a Start Event.

**Which Start Event variant fits?**

- **a)** **Message Start Event** (with the Webhook Connector configured as its inbound trigger) — when the webhook fires and matches the start event's configured pattern, Zeebe creates a new process instance. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/) + [Webhook Connector](https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/)

- **b)** None Start Event. Documentation: [None Events](https://docs.camunda.io/docs/components/modeler/bpmn/none-events/)

- **c)** Timer Start Event. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Conditional Start Event. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Message Start Event is the canonical trigger for **externally-initiated** processes. Combined with an Inbound Webhook Connector, the webhook hit publishes the message and Zeebe creates a new instance.

- **Option b) — Wrong trigger.** None Start fires only on explicit `CreateProcessInstance` API call, not on events.

- **Option c) — Wrong trigger.** Timer fires on schedule, not on incoming requests.

- **Option d) — Not natively supported.** Camunda 8 doesn't expose a Conditional Start Event the same way C7 did.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Message Start + Webhook.
- **b) 3/10** — explicit API only.
- **c) 3/10** — schedule trigger.
- **d) 2/10** — not native in C8.

**Correct Answer:** Message Start Event (with Webhook Connector inbound trigger).

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/protocol/http-webhook/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Start on webhook event" → разпознаваш че се иска **Message Start + Webhook**.

**Въпросът → Solution Framing.** "Start Event variant fits" — изпитва се start-event types.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Message Start triggers on event, None = explicit API, Timer = schedule, Conditional = no C8 native. Знание за Start Event types.

---

# Section 2 — Configuring Processes (Questions 10-22)

> Weight 22% • Topics: Zeebe execution semantics, FEEL conditions, Multi-Instance, Document Handling, IDP, Element Templates, AI orchestration.

---

## Question 10: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task `send-notification` must pass a static configuration to the worker — the channel `"SMS"` and a template ID `"WELCOME_001"`. The team doesn't want to use a process variable since these values are constant per modeled task.

**Which configuration delivers static config to the worker?**

- **a)** **Task Headers** (`zeebe:taskHeader`) on the Service Task — key/value pairs that the worker reads from the activated job's custom headers. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Input Mapping with literal FEEL values. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Process variable set on Start Event. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Hardcode in the worker code. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Task Headers** (`zeebe:taskHeader`) attach static key/value config to a specific Service Task instance. The worker reads them from `activatedJob.getCustomHeaders()`. Designed exactly for "per-task static config."

- **Option b) — Workable.** Input Mapping with literal FEEL works, but headers are more idiomatic for static metadata that shouldn't pollute the variable scope.

- **Option c) — Wrong scope.** Start Event variables are global, not per-task.

- **Option d) — Defeats config-in-model.** Worker code shouldn't bake in per-task config.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Task Headers за per-task static config.
- **b) 5/10** — workable but pollutes scope.
- **c) 2/10** — wrong scope.
- **d) 2/10** — bakes config into code.

**Correct Answer:** Task Headers on the Service Task.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Static per-task config, not variables" → разпознаваш че се иска **Task Headers**.

**Въпросът → Solution Framing.** "Delivers static config" — изпитва се header vs variable knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Task Headers са per-task static, Input Mapping pollutes scope, Start Event variables са global, worker code shouldn't bake config. Знание за taskHeaders extension.

---

## Question 11: Configuring Processes (Weighting: 22%)

**Scenario:** A pricing-decision Business Rule Task calls DMN `discount-calculator`. The DMN output is a context (object) with fields `pct` and `cap`. The team wants to split this into two separate process variables `discountPct` and `discountCap` after the task.

**Which configuration achieves the split?**

- **a)** **Output Mapping** on the Business Rule Task — Target: `discountPct`, Source: `=result.pct`; Target: `discountCap`, Source: `=result.cap`. Where `result` is the resultVariable name. Documentation: [Variables I/O Mappings](https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings)

- **b)** Add a Script Task after to split. Documentation: [Script Task](https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/)

- **c)** Use multiple resultVariables on the Business Rule Task. Documentation: [Business Rule Task](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **d)** Cannot split; access as `result.pct`/`result.cap` downstream. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Output Mapping projects from the task's result into named process variables. Multiple mappings split a structured result.

- **Option b) — Workable but ugly.** Extra Script Task adds visual noise.

- **Option c) — Incorrect.** Business Rule Task has one `resultVariable`.

- **Option d) — Workable but less ergonomic.** Downstream `result.pct` works but Output Mapping makes the contract explicit.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Output Mapping split.
- **b) 4/10** — extra noise.
- **c) 2/10** — single resultVariable.
- **d) 5/10** — works, but less explicit contract.

**Correct Answer:** Output Mapping on the Business Rule Task.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Split structured result into separate variables" → разпознаваш че се иска **Output Mapping**.

**Въпросът → Solution Framing.** "Achieves the split" — изпитва се I/O mapping knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Output Mapping projects fields, че Script Task е extra noise, че resultVariable е one. Знание за Output Mapping.

---

## Question 12: Configuring Processes (Weighting: 22%)

**Scenario:** An Inclusive Gateway has 3 outgoing flows; their condition expressions are `=score > 80`, `=age >= 65`, `=isVip = true`. The modeler wants to also designate a **default flow** to take when none of the conditions match.

**Which configuration sets the default flow?**

- **a)** Set the **`default` attribute** on the Inclusive Gateway, pointing to one of the outgoing sequence flow IDs. That flow has **no condition** and is taken only if no other condition matches. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **b)** Add a condition `=true` on the default flow. Documentation: [Sequence Flows](https://docs.camunda.io/docs/components/modeler/bpmn/sequence-flows/)

- **c)** Add a fourth flow without any condition; Zeebe auto-detects default. Documentation: [Gateways](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **d)** Default flows only work on Exclusive Gateways. Documentation: [Gateways](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN gateways support a `default` attribute referencing one outgoing sequence flow. That flow has no condition and is the fallback when no other condition matches. Works on both Exclusive and Inclusive gateways.

- **Option b) — Wrong intent.** `=true` always evaluates true — would take that flow regardless of others.

- **Option c) — No auto-detection.** Must explicitly designate.

- **Option d) — Incorrect.** Inclusive also supports default flows.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. default attribute on gateway.
- **b) 2/10** — always-true ≠ default.
- **c) 3/10** — no auto.
- **d) 1/10** — невярно.

**Correct Answer:** Set the default attribute on the Inclusive Gateway.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Default flow if none match" → разпознаваш че се иска **default attribute**.

**Въпросът → Solution Framing.** "Sets default flow" — изпитва се knowledge на default semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че default = no-condition fallback, `=true` ≠ default, no auto-detection, че Inclusive supports default. Знание за gateway default flows.

---

## Question 13: Configuring Processes (Weighting: 22%)

**Scenario:** A User Task `approve-purchase` must be visible to **multiple users** in the candidate group `purchasing-managers`. Any of them can claim and complete it.

**Which configuration fits?**

- **a)** `zeebe:assignmentDefinition candidateGroups="purchasing-managers"` (FEEL or static list) — task is offered to all members of the group; first to claim becomes assignee. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** Set `assignee` to a comma-separated list. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** Create 5 parallel User Tasks (one per manager). Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Multi-Instance over manager IDs. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `candidateGroups` exposes the task to all group members in Tasklist. First user to claim becomes assignee; others can no longer claim.

- **Option b) — Wrong semantics.** `assignee` is single-user.

- **Option c) — Wasteful.** 5 tasks for one piece of work.

- **Option d) — Wrong intent.** MI runs many instances; here one task should be picked from a pool.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. candidateGroups.
- **b) 2/10** — single-user.
- **c) 2/10** — wasteful.
- **d) 3/10** — wrong semantics.

**Correct Answer:** candidateGroups attribute set to "purchasing-managers".

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Visible to multiple users + first claims" → разпознаваш че се иска **candidateGroups**.

**Въпросът → Solution Framing.** "Configuration fits" — изпитва се user-task assignment.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че candidateGroups offers to pool, assignee е single, че parallel tasks или MI са wrong intent. Знание за User Task pooling.

---

## Question 14: Configuring Processes (Weighting: 22%)

**Scenario:** A Parallel Multi-Instance over `orders` runs in parallel for each order. The team wants the subprocess to **complete as soon as 10 of N instances** have completed (not wait for all).

**Which configuration fits?**

- **a)** Set the **`completionCondition`** of the Multi-Instance to a FEEL expression — e.g., `=numberOfCompletedInstances >= 10`. When true, remaining instances are cancelled and the MI completes. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Set `loopCardinality = 10`. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** No way; must wait for all. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Wrap in Event Subprocess that cancels at count 10. Documentation: [Event Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `completionCondition` is the standard MI knob for early completion. Predefined FEEL helpers: `numberOfInstances`, `numberOfCompletedInstances`, `numberOfActiveInstances`.

- **Option b) — Wrong intent.** loopCardinality limits total instances; doesn't enable early exit.

- **Option c) — Incorrect.** completionCondition handles this.

- **Option d) — Overkill.** Event Subprocess workaround is not the canonical mechanism.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. completionCondition.
- **b) 3/10** — wrong intent.
- **c) 1/10** — невярно.
- **d) 4/10** — overkill workaround.

**Correct Answer:** Set the completionCondition FEEL expression on the Multi-Instance.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Complete when 10 of N done" → разпознаваш че се иска **completionCondition**.

**Въпросът → Solution Framing.** "Configuration fits" — изпитва се MI knobs.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че completionCondition + numberOfCompletedInstances е canonical, loopCardinality не е early-exit, и не е невъзможно. Знание за MI early completion.

---

## Question 15: Configuring Processes (Weighting: 22%)

**Scenario:** A document-archival process uploads files via Document Handling. After the process completes, the team wants to **explicitly delete** the document (don't wait for TTL).

**Which approach fits?**

- **a)** Call the **Documents API DELETE** endpoint at the end of the process via an HTTP Connector or Service Task, passing the document reference. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **b)** Documents are immutable; can't delete. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **c)** Set `expiresAt = now()` to expire immediately. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **d)** Operate UI provides a "Delete documents" action. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Documents API supports DELETE for explicit lifecycle management. Call from BPMN via Service Task or HTTP Connector at the appropriate point.

- **Option b) — Incorrect.** Documents are deletable.

- **Option c) — Workaround.** Setting expiresAt = now leverages TTL but is hacky vs explicit DELETE.

- **Option d) — Not a standard Operate feature.** Document lifecycle is managed via the Documents API.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Documents API DELETE.
- **b) 1/10** — невярно.
- **c) 4/10** — hacky workaround.
- **d) 2/10** — not standard.

**Correct Answer:** Call Documents API DELETE endpoint at the end of the process.

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/document-handling/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Explicitly delete after process" → разпознаваш че се иска **DELETE endpoint**.

**Въпросът → Solution Framing.** "Approach fits" — изпитва се knowledge на Documents API.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DELETE е canonical, че documents са deletable, че expiresAt е TTL hack, че Operate няма такъв action. Знание за Document lifecycle.

---

## Question 16: Configuring Processes (Weighting: 22%)

**Scenario:** An IDP Application extracts data from invoice PDFs. The extraction returns a confidence score per field. The team wants to **route low-confidence extractions** (< 0.85) to a human-review path automatically.

**Which BPMN configuration fits?**

- **a)** After the IDP task, place an **Exclusive Gateway** with condition `=idpResult.confidence < 0.85` routing to human review; else continue automated. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/idp-applications/) + [Gateways](https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/)

- **b)** Configure IDP to throw a BPMN Error if confidence < 0.85. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **c)** Set `minConfidence` in IDP; it auto-routes. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **d)** IDP doesn't expose confidence scores. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** IDP exposes confidence in the result. Standard BPMN routing via Exclusive Gateway with FEEL condition handles low-confidence paths.

- **Option b) — Wrong abstraction.** BPMN Error is for exceptional cases; low confidence is normal business outcome.

- **Option c) — Invented attribute.** No auto-routing knob; routing is BPMN-level.

- **Option d) — Incorrect.** Confidence is exposed.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Exclusive Gateway + FEEL.
- **b) 3/10** — wrong abstraction.
- **c) 2/10** — invented.
- **d) 1/10** — невярно.

**Correct Answer:** Exclusive Gateway on confidence < 0.85.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/idp/idp-applications/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Route low-confidence to human review" → разпознаваш че се иска **Exclusive Gateway on confidence**.

**Въпросът → Solution Framing.** "Configuration fits" — изпитва се IDP + gateway knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че IDP exposes confidence, че BPMN routing е via gateway, че error е wrong abstraction, че IDP няма auto-route knob. Знание за IDP integration.

---

## Question 17: Configuring Processes (Weighting: 22%)

**Scenario:** An Element Template for a "Slack Notify" custom Service Task should require the modeler to **always provide a channel name** — the template must reject deployment if the field is empty.

**Which Element Template field constraint fits?**

- **a)** Set `constraints.notEmpty: true` on the channel property. Modeler can't save/deploy without a value. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **b)** No constraints supported. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **c)** Add a Validator Service Task before. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Use FEEL precondition. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Element Template properties support constraints: `notEmpty`, `minLength`, `maxLength`, `pattern`. `notEmpty: true` rejects empty values at design-time.

- **Option b) — Incorrect.** Constraints are supported.

- **Option c) — Wrong layer.** Runtime check is too late; design-time constraint catches it earlier.

- **Option d) — Wrong layer.** FEEL evaluates at runtime; constraint is design-time.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. notEmpty constraint.
- **b) 1/10** — невярно.
- **c) 3/10** — wrong layer.
- **d) 3/10** — wrong layer.

**Correct Answer:** Set constraints.notEmpty: true.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Always require field, design-time" → разпознаваш че се иска **notEmpty constraint**.

**Въпросът → Solution Framing.** "Constraint fits" — изпитва се template constraint knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Element Templates have constraints, че runtime check е late, че FEEL precondition е runtime. Знание за Element Template constraints.

---

## Question 18: Configuring Processes (Weighting: 22%)

**Scenario:** An Ad-hoc Subprocess for **document-review** has 5 inner tasks: review images, check signatures, verify dates, scan watermark, cross-reference DB. The reviewer should complete **at least 3** before the Ad-hoc subprocess concludes.

**Which configuration fits?**

- **a)** Set the **`completionCondition`** on the Ad-hoc Subprocess — e.g., FEEL counting completed inner activities `>= 3`. When true, the Ad-hoc completes (any remaining instances are cancelled). Documentation: [Ad-hoc Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/ad-hoc-subprocesses/)

- **b)** Set `loopCardinality = 3`. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Use Inclusive Gateway with 3 paths. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **d)** Ad-hoc requires all tasks to complete. Documentation: [Ad-hoc Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/ad-hoc-subprocesses/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Ad-hoc Subprocess uses `completionCondition` to determine when it terminates. FEEL expression has access to inner activity execution state. Counting completed activities `>= 3` matches the requirement.

- **Option b) — Wrong concept.** loopCardinality is Multi-Instance, not Ad-hoc.

- **Option c) — Wrong tool.** Gateway routes flow, not Ad-hoc termination.

- **Option d) — Incorrect.** Ad-hoc supports partial completion via completionCondition.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. completionCondition.
- **b) 2/10** — wrong concept (MI).
- **c) 2/10** — wrong tool.
- **d) 1/10** — невярно.

**Correct Answer:** Set completionCondition on the Ad-hoc Subprocess (e.g., 3 completions).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/ad-hoc-subprocesses/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Complete after 3 of 5 done" → разпознаваш че се иска **Ad-hoc completionCondition**.

**Въпросът → Solution Framing.** "Configuration fits" — изпитва се Ad-hoc termination knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Ad-hoc supports completionCondition, че MI има loopCardinality but it's not Ad-hoc, че gateway routes not terminates. Знание за Ad-hoc completion.

---

## Question 19: Configuring Processes (Weighting: 22%)

**Scenario:** A report-generation process must run **every Friday at 6 PM Sofia time**. The team prefers cron syntax over ISO 8601.

**Which Timer Cycle cron expression fits?**

- **a)** `0 0 18 ? * FRI` — Camunda 8 cron format supports day-of-week token `FRI` (or `5`) and timezone via configuration. The expression fires at 18:00 every Friday. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** `0 18 * * 5` — UNIX cron. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** Camunda 8 doesn't support cron, only ISO 8601. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** `every Friday at 18:00` — natural language. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 supports Spring-style cron expressions with seconds: `seconds minutes hours day-of-month month day-of-week`. `0 0 18 ? * FRI` means at 0sec 0min 18h, any day-of-month, any month, Friday. The `?` placeholder is used when day-of-month is irrelevant.

- **Option b) — Different format.** UNIX cron (5 fields, no seconds) isn't the Camunda 8 format.

- **Option c) — Incorrect.** Cron is supported alongside ISO 8601.

- **Option d) — Not parseable.** No natural-language support.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Spring cron format.
- **b) 4/10** — UNIX cron (close but wrong format).
- **c) 1/10** — невярно.
- **d) 1/10** — natural lang not supported.

**Correct Answer:** 0 0 18 ? * FRI (Spring-style cron with seconds).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Friday 18:00 cron" → разпознаваш че се иска **Spring-style cron**.

**Въпросът → Solution Framing.** "Cron expression fits" — изпитва се knowledge на cron format в C8.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че C8 използва Spring cron with seconds, че UNIX cron е different, че cron е supported, че natural language не е. Знание за Camunda cron syntax.

---

## Question 20: Configuring Processes (Weighting: 22%)

**Scenario:** A process has a **Message Start Event**. An external system publishes a message via REST API to start a new instance.

**What about correlation key for Message Start Event?**

- **a)** Message Start Events **don't use correlation key** (no existing instance to correlate to). The message name alone selects the matching process definition for instance creation. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **b)** Correlation key is mandatory; without it the message is dropped. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **c)** Correlation key sets the new instance's businessKey. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **d)** Correlation key controls deduplication. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Correlation key is used for **Intermediate / Boundary** Message Catch (to find an existing waiting subscription). Message Start Event has no instance to correlate to — message name + matching definition is enough.

- **Option b) — Incorrect.** Not mandatory; not applicable.

- **Option c) — Misleading.** businessKey isn't auto-set from correlation key.

- **Option d) — Misleading.** Deduplication uses `messageId` (TTL window), not correlation key.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Start Events don't correlate.
- **b) 2/10** — невярно.
- **c) 3/10** — misleading.
- **d) 4/10** — wrong attribute (messageId controls dedup).

**Correct Answer:** Message Start Events don't use correlation key; message name selects the definition.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/message-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Message Start + correlation key?" → trap testing correlation-key scope.

**Въпросът → Solution Framing.** "About correlation key" — изпитва се message-event scope.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че correlation key е за existing instances (Catch), Start не correlates, messageId controls dedup. Знание за message correlation scope.

---

## Question 21: Configuring Processes (Weighting: 22%)

**Scenario:** A User Task `review-application` must **timeout after 5 days** — if not completed, the task is cancelled and the flow routes to "auto-reject" path.

**Which Boundary Event variant fits?**

- **a)** **Interrupting Timer Boundary Event** with `PT120H` (5 days = 120 hours) or `P5D` — cancels the User Task on timer expiry and routes via boundary's outgoing flow. Documentation: [Timer Boundary Event](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** Non-interrupting Timer Boundary. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** Use Task's `dueDate` only — Zeebe auto-cancels overdue tasks. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Timeouts not supported on User Tasks. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Interrupting (solid) Timer Boundary cancels the host when the timer fires and routes via boundary's outgoing arrow. Set duration to `P5D` or `PT120H`.

- **Option b) — Wrong semantics.** Non-interrupting wouldn't cancel; task stays active in parallel with auto-reject path.

- **Option c) — Misleading.** `dueDate` is informational metadata for Tasklist (shows overdue); doesn't auto-cancel.

- **Option d) — Incorrect.** Boundary Event handles it.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Interrupting Timer Boundary P5D.
- **b) 3/10** — doesn't cancel (parallel).
- **c) 3/10** — dueDate е informational.
- **d) 1/10** — невярно.

**Correct Answer:** Interrupting Timer Boundary Event with P5D.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Timeout 5 days + cancel + route" → разпознаваш че се иска **Interrupting Timer Boundary**.

**Въпросът → Solution Framing.** "Variant fits" — изпитва се interrupting vs non-interrupting + dueDate distinction.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че interrupting cancels host, non-interrupting parallel, dueDate е metadata not action. Знание за Timer Boundary semantics.

---

## Question 22: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task `process-data` is inside an Embedded Subprocess. The subprocess scope sets a local variable `tempCounter`. The team wants to know: is `tempCounter` accessible **outside** the subprocess after it completes?

**Which is true about variable scope?**

- **a)** Variables set inside an Embedded Subprocess via local scoping (Input/Output mappings on the subprocess) are **scoped to the subprocess**. They are not visible outside unless **propagated via output mapping**. Process-level variables (set without subprocess scope) remain visible. Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

- **b)** All variables are global; subprocess scope doesn't isolate. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Variables are deleted on subprocess completion. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Variables persist forever in all scopes. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 variables are scoped. A variable created within a subprocess scope (e.g., via that subprocess's Input/Output Mapping or by a task within it that scopes a local var) is visible only inside that scope. Use Output Mapping on the subprocess to propagate to parent scope.

- **Option b) — Incorrect.** Scoping isolates.

- **Option c) — Misleading.** Scoped variables go out of scope (effectively cleaned up) when scope ends, but it's not "deletion" semantics — they were never in the parent scope.

- **Option d) — Incorrect.** Scoping limits lifetime.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Subprocess-scoped variables not visible outside without propagation.
- **b) 2/10** — невярно — scope isolates.
- **c) 5/10** — misleading wording.
- **d) 1/10** — невярно.

**Correct Answer:** Variables scoped to the subprocess unless propagated via output mapping.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Subprocess variable visible outside?" → разпознаваш че се иска **scope semantics**.

**Въпросът → Solution Framing.** "Is true about scope" — изпитва се variable scoping.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че scoping isolates, че Output Mapping propagates, че variables не are auto-deleted. Знание за Variable Scopes.

---

# Section 3 — Decisions & DMN (Questions 23-29)

> Weight 11% • Topics: DRD, Decision Table, Hit Policies, FEEL in DMN, BKM, Literal Expressions.

---

## Question 23: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN table for **eligibility checks** is designed so rules are ordered by **specificity**: most specific rules first. The team wants the engine to **stop at the first matching rule** (no need to evaluate the rest).

**Which hit policy fits?**

- **a)** **FIRST** hit policy — engine evaluates rules in row order; returns the first matching rule's output and stops. Documentation: [DMN Hit Policies](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** UNIQUE. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** PRIORITY. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** ANY. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **FIRST** policy evaluates top-down by row order; returns the first match and short-circuits. Used when row order encodes priority (specific-first, generic-last).

- **Option b) — Different.** UNIQUE requires exactly one match across all rules; evaluation order irrelevant.

- **Option c) — Different.** PRIORITY picks by output-value priority, not row order.

- **Option d) — Different.** ANY returns any single match (must have identical outputs).

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FIRST = row-order first match.
- **b) 3/10** — different (exactly one).
- **c) 4/10** — different (output priority).
- **d) 4/10** — different (must be identical outputs).

**Correct Answer:** FIRST hit policy.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Most specific first + stop at first match" → разпознаваш че се иска **FIRST**.

**Въпросът → Solution Framing.** "Hit policy fits" — изпитва се policy semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FIRST = row order, UNIQUE = exactly one, PRIORITY = output pref, ANY = identical outputs. Знание за hit policy distinctions.

---

## Question 24: Decisions & DMN (Weighting: 11%)

**Scenario:** A reward-program decision table assigns badges. Multiple rules can match the same input. The team wants **all matching rules' outputs** returned as a **list ordered by rule (row) order**.

**Which hit policy fits?**

- **a)** **RULE ORDER** — returns a list of all matching rules' outputs, ordered by row order. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** COLLECT (no aggregator) — returns list, but **unordered** with respect to row sequence. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** OUTPUT ORDER — ordered by output value priority, not row order. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** FIRST — returns single value. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **RULE ORDER** policy explicitly returns matching outputs in row order. Distinct from COLLECT which doesn't guarantee row order.

- **Option b) — Different guarantee.** COLLECT returns list but doesn't promise row order — usually order-of-evaluation.

- **Option c) — Wrong order.** OUTPUT ORDER orders by output priority.

- **Option d) — Wrong cardinality.** FIRST returns single value, not list.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. RULE ORDER = row-ordered list.
- **b) 5/10** — close, returns list but order not guaranteed.
- **c) 4/10** — different ordering.
- **d) 2/10** — single value.

**Correct Answer:** RULE ORDER hit policy.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "List of all matches + row order" → разпознаваш че се иска **RULE ORDER**.

**Въпросът → Solution Framing.** "Hit policy fits" — изпитва се knowledge на ordering policies.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че RULE ORDER = row, OUTPUT ORDER = output-pref, COLLECT = no order guarantee, FIRST = single. Знание за list-returning policies.

---

## Question 25: Decisions & DMN (Weighting: 11%)

**Scenario:** A logistics decision table evaluates shipping options; multiple rules match, each with a different `cost`. The team wants the **minimum cost** across all matching rules.

**Which hit policy + aggregator fits?**

- **a)** **COLLECT** with **MIN** aggregator. Engine evaluates all matching rules, aggregates outputs via MIN → returns single number. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** PRIORITY. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** RULE ORDER + manual `min()` in downstream FEEL. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** FIRST sorted by cost. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** COLLECT supports aggregators SUM, MIN, MAX, COUNT (and bare COLLECT for list). MIN over matching cost outputs returns the smallest value directly.

- **Option b) — Wrong semantics.** PRIORITY uses output-value priority list ordering, not numeric MIN.

- **Option c) — Workable but ugly.** Manual min() in downstream FEEL works but COLLECT-MIN is canonical.

- **Option d) — Cannot sort.** DMN rules aren't dynamically sorted by output.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. COLLECT+MIN.
- **b) 3/10** — different semantics.
- **c) 5/10** — workable but verbose.
- **d) 2/10** — invented sort.

**Correct Answer:** COLLECT with MIN aggregator.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Minimum across matching" → разпознаваш че се иска **COLLECT+MIN**.

**Въпросът → Solution Framing.** "Hit policy + aggregator fits" — изпитва се COLLECT aggregators.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че COLLECT supports SUM/MIN/MAX/COUNT, че PRIORITY е output-pref не numeric, че manual min е verbose. Знание за COLLECT aggregators.

---

## Question 26: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN input represents a contract's **effective date**. The input entry must match when the date is **after 2025-01-01**. The modeler uses FEEL date literal.

**Which input entry syntax fits?**

- **a)** `> date("2025-01-01")` — FEEL `date()` constructor parses ISO string; unary test `>` compares dates. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** `> "2025-01-01"` — string comparison. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** `> 2025-01-01`. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** `> isoDate("2025-01-01")`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `date("2025-01-01")` constructs a date value; `> date(...)` is a valid unary test for dates. Type-safe and semantically correct.

- **Option b) — Wrong type.** String comparison is lexicographic; works for ISO dates by coincidence but isn't type-safe.

- **Option c) — Parsed as math.** `2025-01-01` evaluates as `2025 minus 1 minus 1 = 2023`.

- **Option d) — Invented.** No `isoDate()` function.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. date() constructor.
- **b) 4/10** — works by coincidence on ISO.
- **c) 1/10** — parses as math.
- **d) 1/10** — invented.

**Correct Answer:** > date("2025-01-01").

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Date after 2025-01-01 in DMN input" → разпознаваш че се иска **date() constructor**.

**Въпросът → Solution Framing.** "Syntax fits" — изпитва се FEEL date literals.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че date() constructs, че string compare е lexicographic, че dash е math, че няма isoDate(). Знание за FEEL temporal in DMN.

---

## Question 27: Decisions & DMN (Weighting: 11%)

**Scenario:** A complex tax-decision is structured as a DRD with 4 chained decisions. The team wants to invoke it from BPMN as a single unit (not invoke each leaf decision separately).

**Which DMN construct fits invoking the entire DRD as one decision?**

- **a)** Define a **Decision Service** in the DMN — exposes the chained decisions as a single callable unit. Invoke from Business Rule Task by referencing the Decision Service ID. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Just invoke the top-level (output) decision; the DRD chain auto-evaluates upstream dependencies. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Decision Services are not in C8. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Must invoke each chained decision in BPMN. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option b) — Correct.** Invoking the top-level (output) decision in the DRD automatically evaluates all its dependencies (per Information Requirement arrows). The DRD chain provides the data flow; the engine resolves upstream decisions transitively.

- **Option a) — Partially correct concept.** Decision Services are a DMN spec concept for exposing a curated subset, but in standard C8 practice you invoke the top-level decision and the DRD takes care of the rest.

- **Option c) — Incorrect.** Top-decision invocation auto-evaluates DRD.

- **Option d) — Incorrect.** Auto-evaluation handles chaining.

**Per-option scoring (1–10):**
- **a) 6/10** — partial; Decision Service is a DMN concept but top-decision invocation is the practical path.
- **b) 10/10** — верен. Top-decision invocation auto-evaluates DRD.
- **c) 3/10** — partial misunderstanding.
- **d) 2/10** — невярно.

**Correct Answer:** Invoke the top-level decision; the DRD chain auto-evaluates upstream dependencies.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Invoke entire DRD as one unit" → разпознаваш че се иска **top-decision auto-chains**.

**Въпросът → Solution Framing.** "Construct fits" — изпитва се DRD invocation semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che invoking top-decision triggers DRD chain, че Information Requirement arrows define dependency graph. Знание за DRD evaluation.

---

## Question 28: Decisions & DMN (Weighting: 11%)

**Scenario:** A simple decision computes `taxAmount = baseAmount * 0.20`. The team doesn't want a decision **table** (overkill for one formula). They want to express it as a single FEEL expression.

**Which DMN construct fits?**

- **a)** **Literal Expression** — a DMN decision can have a Literal Expression body (single FEEL expression) instead of a Decision Table. Suitable for simple calculations. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Use a Decision Table with one row. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** Use a Script Task with FEEL. Documentation: [Script Task](https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/)

- **d)** DMN requires a table for any decision. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN supports **Literal Expression** decision type — single FEEL expression as the decision body. Ideal for simple arithmetic / lookups that don't warrant a table.

- **Option b) — Overkill.** One-row table is more ceremony than needed; Literal Expression is the canonical lightweight form.

- **Option c) — Wrong tool.** Script Tasks are BPMN-level and have different governance/lifecycle vs DMN decisions.

- **Option d) — Incorrect.** Multiple decision types are supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Literal Expression decision.
- **b) 5/10** — overkill but works.
- **c) 4/10** — wrong tool.
- **d) 1/10** — невярно.

**Correct Answer:** Literal Expression decision type.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Single FEEL formula, not table" → разпознаваш че се иска **Literal Expression**.

**Въпросът → Solution Framing.** "Construct fits" — изпитва се DMN decision types.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN supports Literal Expression, decision tables, decision services etc. Знание за DMN decision body types.

---

## Question 29: Decisions & DMN (Weighting: 11%)

**Scenario:** Two DMN decision tables both apply the **same FEEL formula** for adjusting tax (e.g., `=tax * if region = "EU" then 1.1 else 1.0`). The team wants to **extract the formula** into a reusable artifact referenced by both tables.

**Which DMN construct fits?**

- **a)** **Business Knowledge Model (BKM)** — defines reusable logic (parameters + body). Decisions invoke the BKM via Knowledge Requirement (dashed arrow). Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Copy the formula in both tables. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Move it to BPMN Script Task. Documentation: [Script Task](https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/)

- **d)** DMN doesn't support reusable logic. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Business Knowledge Model (BKM)** is the DMN-standard construct for reusable decision logic. Parameters + body (FEEL expression or decision table). Referenced via Knowledge Requirement.

- **Option b) — Anti-DRY.** Copy = maintenance burden.

- **Option c) — Cross-tool boundary.** Mixes BPMN and DMN concerns; BKM keeps logic in DMN.

- **Option d) — Incorrect.** BKM is standard DMN.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. BKM за reusable logic.
- **b) 2/10** — anti-DRY.
- **c) 3/10** — cross-tool boundary.
- **d) 1/10** — невярно.

**Correct Answer:** Business Knowledge Model (BKM).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Reusable FEEL formula across DMN tables" → разпознаваш че се иска **BKM**.

**Въпросът → Solution Framing.** "Construct fits" — изпитва се DMN reuse pattern.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BKM е reusable logic, Knowledge Requirement е the connector, че copy е anti-DRY, че Script Task crosses tool boundary. Знание за BKM.

---

# Section 4 — Configuring Forms (Questions 30-32)

> Weight 5% • Topics: Form element library, components, validation.

---

## Question 30: Configuring Forms (Weighting: 5%)

**Scenario:** A survey form asks "Which features do you use?" with **multiple selectable answers** from a fixed list. Each selection should be independently toggleable; result should be a list of selected values.

**Which Forms component fits?**

- **a)** **Checklist** component — fixed-list multi-select. Bound variable stores a list of selected values. Documentation: [Forms element library](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/)

- **b)** Radio group. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Single Checkbox per option. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Dropdown (Select). Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Checklist** is the multi-select fixed-list component. Result is a list of values matching the selected options.

- **Option b) — Wrong cardinality.** Radio = single-select.

- **Option c) — Suboptimal.** Multiple Checkboxes work but require manual list assembly; Checklist is the canonical multi-select.

- **Option d) — Default behavior single-select.** Dropdown is typically single-select unless explicitly multi-select; Checklist is the obvious choice.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Checklist component.
- **b) 2/10** — single-select.
- **c) 5/10** — works but verbose.
- **d) 4/10** — typically single-select.

**Correct Answer:** Checklist component.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Multi-select fixed list → list of values" → разпознаваш че се иска **Checklist**.

**Въпросът → Solution Framing.** "Component fits" — изпитва се element library knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Checklist = multi-select, Radio = single, Dropdown = single, individual checkboxes = verbose. Знание за Forms components.

---

## Question 31: Configuring Forms (Weighting: 5%)

**Scenario:** A booking form requires the user to pick a **future delivery date**. The form should display a calendar picker, restrict selection to today or later, format the result as ISO date string.

**Which Forms component + configuration fits?**

- **a)** **Datepicker** component with `validate.min = =today()` (FEEL `today()` built-in). Result is ISO date string. Documentation: [Forms element library](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/)

- **b)** Text Input with regex validation. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Number Input. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Forms has no date picker. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Forms element library includes a **Datepicker** component. Combined with min/max FEEL constraints using `today()`, restricts selection. Outputs ISO date string.

- **Option b) — Suboptimal UX.** Text + regex provides no calendar picker.

- **Option c) — Wrong type.** Number ≠ date.

- **Option d) — Incorrect.** Datepicker exists.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Datepicker + min FEEL.
- **b) 3/10** — bad UX.
- **c) 1/10** — wrong type.
- **d) 1/10** — невярно.

**Correct Answer:** Datepicker component with validate.min = =today().

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Future date with calendar picker" → разпознаваш че се иска **Datepicker + today()**.

**Въпросът → Solution Framing.** "Component + config fits" — изпитва се Forms components.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Datepicker exists, че FEEL today() е built-in, че Text+regex е bad UX. Знание за date input.

---

## Question 32: Configuring Forms (Weighting: 5%)

**Scenario:** A donation form's "Amount" field accepts numbers but the team wants to **constrain to multiples of 5** (e.g., $5, $10, $15...). Users should not be able to enter $7.

**Which Number Input property fits?**

- **a)** Set `step = 5` and `validate.min`/`max` accordingly. Form rejects values that aren't multiples of step (and the up/down arrows in the UI step by 5). Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **b)** Use regex pattern. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Cannot constrain to multiples. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Custom JS validator. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Number Input supports `step` (HTML5-style) constraining valid values to multiples of step (offset by min). Browser validation rejects non-multiples on submit.

- **Option b) — Awkward.** Regex on numbers is possible but `step` is the canonical numeric constraint.

- **Option c) — Incorrect.** Step works.

- **Option d) — Reinvents.** Built-in step suffices.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. step property.
- **b) 4/10** — awkward for numerics.
- **c) 1/10** — невярно.
- **d) 3/10** — reinvents.

**Correct Answer:** Set step = 5 on the Number Input.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Multiples of 5 only" → разпознаваш че се иска **step constraint**.

**Въпросът → Solution Framing.** "Property fits" — изпитва се Number Input options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че step е HTML5-style numeric constraint, че regex е awkward за numerics. Знание за Number Input properties.

---

# Section 5 — Configuring Connectors (Questions 33-36)

> Weight 6% • Topics: Secrets, Inbound (Kafka, Webhook), Outbound (REST, custom).

---

## Question 33: Configuring Connectors (Weighting: 6%)

**Scenario:** A team integrates with **Kafka** — when a message arrives on `order-events` topic, a process instance should start. The cluster is Self-Managed.

**Which Connector type fits?**

- **a)** **Kafka Inbound Connector** — subscribes to topic + consumer group; on message receipt, publishes BPMN Message to trigger the process Start Event. Documentation: [Kafka Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/kafka/)

- **b)** Kafka Outbound Connector. Documentation: [Kafka Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/kafka/)

- **c)** Custom Service Task that polls Kafka. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Kafka is not supported in Camunda 8 Connectors. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Kafka Inbound Connector** is the canonical out-of-the-box solution for Kafka-triggered processes. Configure topic + consumer group + auth (via secrets). Map message payload to process variables.

- **Option b) — Wrong direction.** Outbound = produce; question requires consume.

- **Option c) — Reinvents.** Custom Service Task duplicates what the Inbound Connector provides.

- **Option d) — Incorrect.** Kafka is supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Kafka Inbound Connector.
- **b) 2/10** — wrong direction.
- **c) 4/10** — reinvents.
- **d) 1/10** — невярно.

**Correct Answer:** Kafka Inbound Connector.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/kafka/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Kafka message starts process" → разпознаваш че се иска **Kafka Inbound**.

**Въпросът → Solution Framing.** "Connector type fits" — изпитва се Inbound vs Outbound knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Inbound = consume + trigger, Outbound = produce, че custom polling reinvents. Знание за Kafka Connector.

---

## Question 34: Configuring Connectors (Weighting: 6%)

**Scenario:** An Outbound REST Connector POSTs to an order-creation endpoint. The body must include `customerId`, `lineItems` (an array), and `timestamp` (current time). The team wants to compose the body cleanly without manual JSON concatenation.

**Which FEEL expression in the Body field fits?**

- **a)** FEEL **context literal**: `={customerId: customerId, lineItems: lineItems, timestamp: now()}` — FEEL builds the JSON-serialisable object. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** String concatenation: `="{\"customerId\":\"" + customerId + "\"...}"`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Use a Script Task to build JSON string. Documentation: [Script Task](https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/)

- **d)** Connector accepts only static JSON. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL context literal `{key: value, ...}` constructs an object. Nested objects and arrays compose naturally. Connector serializes to JSON at request time.

- **Option b) — Anti-pattern.** Manual string concatenation is error-prone and brittle.

- **Option c) — Extra noise.** Script Task adds a task to the diagram for what's a one-line FEEL.

- **Option d) — Incorrect.** Dynamic body via FEEL is supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL context literal.
- **b) 2/10** — brittle.
- **c) 4/10** — adds diagram noise.
- **d) 1/10** — невярно.

**Correct Answer:** FEEL context literal {customerId: ..., lineItems: ..., timestamp: now()}.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Compose dynamic JSON body" → разпознаваш че се иска **FEEL context literal**.

**Въпросът → Solution Framing.** "Expression fits" — изпитва се FEEL composition.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че context literals build objects, че string concat е brittle, че Script Task is overkill. Знание за FEEL JSON composition.

---

## Question 35: Configuring Connectors (Weighting: 6%)

**Scenario:** A custom Outbound Connector built with the SDK has a property `apiUrl` that should appear in the Web Modeler property panel under "Endpoint Configuration." The team is wiring up the Element Template.

**Which `binding` type in the Element Template applies the value to the Connector's internal config?**

- **a)** `binding: { type: "zeebe:input", name: "apiUrl" }` — creates an Input Mapping on the Service Task that injects the value as a local variable named `apiUrl` available to the Connector function. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **b)** `binding: { type: "property", name: "name" }` — binds to BPMN element's name attribute. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **c)** `binding: { type: "zeebe:taskHeader", key: "apiUrl" }` — binds as task header. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **d)** Both **a** and **c** are valid bindings for custom Connector properties; choice depends on whether the value should appear in process variables (a) or only in headers (c). Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

**🔍 Explanations & Correct Answer**

- **Option d) — Correct.** Both bindings work for Connector properties. `zeebe:input` injects as a local variable (good when the Connector function reads from input mappings). `zeebe:taskHeader` writes to job headers (good for static config not needed downstream as a variable). Choose based on integration style.

- **Option a) — Partially correct.** Input binding works.

- **Option b) — Wrong direction.** Property binding writes the BPMN element's own attribute, not a Connector config.

- **Option c) — Partially correct.** Header binding works.

**Per-option scoring (1–10):**
- **a) 6/10** — partial — input works.
- **b) 2/10** — wrong binding for this.
- **c) 6/10** — partial — header works.
- **d) 10/10** — верен — both valid; pick per integration style.

**Correct Answer:** Both zeebe:input and zeebe:taskHeader work; choose by integration style.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Inject Connector config" → разпознаваш че се иска **input or header binding**.

**Въпросът → Solution Framing.** "Binding applies value" — изпитва се Element Template bindings.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Element Template има multiple binding types, че input + header са both valid, че property е different scope. Знание за Element Template binding types.

---

## Question 36: Configuring Connectors (Weighting: 6%)

**Scenario:** An Outbound HTTP Connector occasionally returns transient HTTP 503. The team wants the **Connector itself** to retry with exponential backoff before the BPMN-level retry kicks in.

**Which approach fits?**

- **a)** Configure **Connector-level retry policy** (where supported by the Connector / via `retryBackoff` settings) **OR** rely on BPMN-level retries (`retries` + Error Boundary). For HTTP Connector, retries are commonly modelled at BPMN level via Error Boundary catching `CONNECTOR_RETRY` errors. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** Loop with Timer Boundary Event manually. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** Cannot retry transient 503s. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Connector reads `Retry-After` header automatically (no config needed). Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 retries are typically modelled at BPMN level using the Service Task's `retries` attribute combined with Error Boundary Events catching specific Connector error codes. Some Connectors expose internal retry semantics; the BPMN-level approach is the canonical, observable mechanism.

- **Option b) — Manual workaround.** Timer + loop reinvents the wheel.

- **Option c) — Incorrect.** Retries are supported.

- **Option d) — Misleading.** No automatic Retry-After honoring built-in to all Connectors.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. BPMN retries + Error Boundary.
- **b) 4/10** — manual workaround.
- **c) 1/10** — невярно.
- **d) 3/10** — misleading.

**Correct Answer:** BPMN-level retries (Service Task retries attribute) + Error Boundary for handling.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Transient 503 + retry" → разпознаваш че се иска **BPMN retries + Error Boundary**.

**Въпросът → Solution Framing.** "Approach fits" — изпитва се knowledge на retry handling.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BPMN-level retries е canonical, че Error Boundary catches error codes, че manual loop reinvents. Знание за Connector retry patterns.

---

# Section 6 — Extensions & Integrations (Questions 37-50)

> Weight 25% • Topics: FEEL deep dive, Connector SDK, Job Workers, REST/gRPC APIs, RPA.

---

## Question 37: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression needs to **negate** a complex boolean condition: `=isPremium and totalSpend > 1000`. The team wants the negated form to handle non-premium OR low spenders.

**Which FEEL approach fits?**

- **a)** Wrap in `not()` function: `=not(isPremium and totalSpend > 1000)`. Returns boolean inverse. Equivalent: `=not isPremium or totalSpend <= 1000` (De Morgan). Documentation: [FEEL boolean](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-boolean/)

- **b)** Prefix with `!`: `=!(isPremium and totalSpend > 1000)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Use `xor`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** FEEL doesn't support negation. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL provides `not(boolean)` function for boolean negation. There's also a `not` unary-test operator (in DMN contexts) but for arithmetic boolean inversion, `not(expr)` is canonical.

- **Option b) — Wrong syntax.** `!` is JavaScript / C-family, not FEEL.

- **Option c) — Different semantics.** xor isn't generally available; not = negation.

- **Option d) — Incorrect.** not() supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. not() built-in.
- **b) 1/10** — wrong language.
- **c) 2/10** — different op.
- **d) 1/10** — невярно.

**Correct Answer:** not(isPremium and totalSpend > 1000).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-boolean/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Negate a boolean condition" → разпознаваш че се иска **not()**.

**Въпросът → Solution Framing.** "Approach fits" — изпитва се FEEL boolean ops.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че not() е built-in, че `!` е JS не FEEL. Знание за FEEL boolean.

---

## Question 38: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must check whether **any** order in a list has `total > 10000` (return true if at least one does). Another need: check whether **every** order in the list has `status = "PAID"`.

**Which FEEL built-ins fit?**

- **a)** `any(list of booleans)` and `every(list of booleans)` — both accept lists of booleans (or projection via for-expression). E.g., `any([o in orders : o.total > 10000])` and `every([o in orders : o.status = "PAID"])`. Documentation: [FEEL boolean](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-boolean/)

- **b)** `some()` and `all()` — Python-style. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Manual loop with `for` + accumulator. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** FEEL doesn't support quantifiers. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `any(list)` returns true if any element is true; `every(list)` returns true if all elements are true. Use with for-expression projection for non-boolean lists.

- **Option b) — Wrong names.** FEEL uses `any` and `every` (not `some` or `all`).

- **Option c) — Reinvents.** Built-ins exist.

- **Option d) — Incorrect.** Quantifiers exist.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. any() и every().
- **b) 3/10** — wrong names.
- **c) 4/10** — reinvents.
- **d) 1/10** — невярно.

**Correct Answer:** any() and every().

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-boolean/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Any + every checks" → разпознаваш че се иска **any() и every()**.

**Въпросът → Solution Framing.** "Built-ins fit" — изпитва се FEEL list quantifiers.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL има any/every (not some/all), че те accept booleans, че for-expr projects to booleans. Знание за FEEL quantifiers.

---

## Question 39: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must convert a number to a string for logging: `customerId = 12345` → `"12345"`. The result is used as a string elsewhere.

**Which FEEL built-in fits?**

- **a)** `string(customerId)` — FEEL's type-conversion function. Documentation: [FEEL conversion](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-conversion/)

- **b)** `toString(customerId)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Implicit cast — `customerId + ""`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `cast(customerId, "string")`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `string(value)` converts to string. FEEL conversion built-ins include `string`, `number`, `date`, `time`, `date and time`, `duration`.

- **Option b) — Wrong name.** Use `string()` not `toString()`.

- **Option c) — Wrong semantics.** FEEL `+` on strings doesn't coerce numerics implicitly.

- **Option d) — Invented.** No `cast()` function.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. string() conversion.
- **b) 3/10** — wrong name.
- **c) 2/10** — wrong semantics.
- **d) 1/10** — invented.

**Correct Answer:** string(customerId).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-conversion/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Convert number to string" → разпознаваш че се иска **string() built-in**.

**Въпросът → Solution Framing.** "Built-in fits" — изпитва се FEEL conversion ops.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че string() е canonical, че toString() е Java/JS reflex, че няма implicit coercion. Знание за FEEL conversion built-ins.

---

## Question 40: Extensions & Integrations (Weighting: 25%)

**Scenario:** A SaaS cluster operator wants their tenant `acme` to be isolated from tenant `globex`. Workers should only pick up jobs for their tenant. A Java Job Worker uses Spring Zeebe.

**Which `@JobWorker` parameter handles tenant scoping?**

- **a)** Set `tenantIds = {"acme"}` on the `@JobWorker` annotation — worker only activates jobs whose process instance is owned by tenant `acme`. Documentation: [Multi-Tenancy](https://docs.camunda.io/docs/self-managed/concepts/multi-tenancy/)

- **b)** No tenant scoping in workers; rely on app-level filtering. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Set `tenantId` to a process variable expression. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** Multi-tenancy not supported in Camunda 8. Documentation: [Multi-Tenancy](https://docs.camunda.io/docs/self-managed/concepts/multi-tenancy/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Spring Zeebe `@JobWorker` supports `tenantIds` array attribute — worker activates jobs only for matching tenant(s). Critical for multi-tenant deployments.

- **Option b) — Wrong layer.** Tenant filtering at app level is brittle; broker-side scoping is authoritative.

- **Option c) — Wrong scope.** Process variables are instance-level; tenant is broker/job-level.

- **Option d) — Incorrect.** Multi-tenancy is supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. tenantIds on @JobWorker.
- **b) 3/10** — brittle.
- **c) 3/10** — wrong scope.
- **d) 1/10** — невярно.

**Correct Answer:** Set tenantIds = {"acme"} on @JobWorker.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/concepts/multi-tenancy/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Tenant-isolated worker" → разпознаваш че се иска **tenantIds parameter**.

**Въпросът → Solution Framing.** "Parameter handles" — изпитва се multi-tenancy knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че @JobWorker.tenantIds scopes activation, че app-layer filtering е brittle, че variables ≠ tenant. Знание за multi-tenancy.

---

## Question 41: Extensions & Integrations (Weighting: 25%)

**Scenario:** A TypeScript Job Worker handles `validate-vat` Service Tasks. The handler must occasionally **fail the job with a specific BPMN error code** (e.g., `INVALID_VAT`) — to trigger an Error Boundary Event.

**Which `@camunda8/sdk` API call fits?**

- **a)** Call `job.error({errorCode: "INVALID_VAT", errorMessage: "..."})` — completes the job with a BPMN error that propagates to the matching Error Boundary Event. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **b)** Call `job.fail(...)` — generic failure, no errorCode. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **c)** Throw a JS Error; SDK auto-converts. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **d)** Return `{__error: "INVALID_VAT"}`. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `job.error(...)` (or equivalent SDK method) signals a BPMN-level error. The runtime propagates errorCode to the nearest matching Error Catch (Boundary or Event Subprocess).

- **Option b) — Different semantics.** `job.fail()` decrements retries and (when retries=0) creates an Incident; doesn't propagate BPMN error code.

- **Option c) — Default behavior different.** JS Error converts to failure, not BPMN error with errorCode.

- **Option d) — Invented.** No magic-field convention.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. job.error with errorCode.
- **b) 4/10** — different semantics (fail ≠ BPMN error).
- **c) 4/10** — converts to failure, not BPMN error.
- **d) 1/10** — invented.

**Correct Answer:** Call job.error({errorCode: "INVALID_VAT", errorMessage: "..."}).

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/node-js-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Throw BPMN error with code" → разпознаваш че се иска **job.error API**.

**Въпросът → Solution Framing.** "API call fits" — изпитва се SDK error semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш che job.error → BPMN error, job.fail → retries+incident, JS Error → failure. Знание за SDK error vs fail.

---

## Question 42: Extensions & Integrations (Weighting: 25%)

**Scenario:** A custom Outbound Connector is implemented in Java. The team is writing the entry-point class.

**Which interface must the Java class implement?**

- **a)** **`OutboundConnectorFunction`** — defines `Object execute(OutboundConnectorContext context)`. The Connector Runtime calls this when the Service Task activates. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** `InboundConnectorExecutable` — wrong direction. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** `JobHandler` — for Job Workers, not Connectors. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Implement no interface; annotate the class with `@Connector`. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Outbound Connectors implement `OutboundConnectorFunction` — single `execute(context)` method. Result is returned from execute; Connector Runtime maps it to Job complete.

- **Option b) — Wrong direction.** Inbound interface for events; Outbound for active calls.

- **Option c) — Wrong abstraction.** JobHandler is the lower-level Job Worker API.

- **Option d) — Misleading.** Annotation alone insufficient; interface contract needed.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. OutboundConnectorFunction interface.
- **b) 2/10** — wrong direction.
- **c) 3/10** — wrong abstraction.
- **d) 2/10** — annotation alone insufficient.

**Correct Answer:** OutboundConnectorFunction interface.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Java Outbound Connector entry-point" → разпознаваш че се иска **OutboundConnectorFunction**.

**Въпросът → Solution Framing.** "Interface to implement" — изпитва се SDK API knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Outbound е OutboundConnectorFunction, Inbound е InboundConnectorExecutable, JobHandler е different abstraction. Знание за Connector SDK.

---

## Question 43: Extensions & Integrations (Weighting: 25%)

**Scenario:** A CI/CD pipeline must **deploy a BPMN file** to a Web Modeler project automatically when a Git PR merges. The pipeline uses curl / a script.

**Which API endpoint fits?**

- **a)** **Web Modeler API** — POST `/api/v1/files` (or equivalent) to upload BPMN file to a project; deploy via deployment endpoint. Documentation: [Web Modeler API](https://docs.camunda.io/docs/apis-tools/web-modeler-api/)

- **b)** Orchestration Cluster API. Documentation: [Orchestration API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/)

- **c)** Optimize API. Documentation: [Optimize API](https://docs.camunda.io/docs/components/optimize/)

- **d)** Direct gRPC deploy to Zeebe. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler API exposes endpoints for file/folder/project management — perfect for CI/CD automation of model uploads + deployment.

- **Option b) — Different scope.** Orchestration handles instance lifecycle, not model upload.

- **Option c) — Wrong tool.** Optimize is read-only analytics.

- **Option d) — Bypasses Web Modeler.** Direct Zeebe gRPC deploy works for deployment but skips Web Modeler project organisation.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Web Modeler API.
- **b) 3/10** — different scope.
- **c) 1/10** — wrong tool.
- **d) 6/10** — works for deploy but bypasses Web Modeler.

**Correct Answer:** Web Modeler API.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/web-modeler-api/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Upload BPMN file via API" → разпознаваш че се иска **Web Modeler API**.

**Въпросът → Solution Framing.** "Endpoint fits" — изпитва се API surface mapping.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler API е model-management, Orchestration е runtime, Optimize е analytics, Zeebe direct bypasses Web Modeler. Знание за API boundaries.

---

## Question 44: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team's BI dashboard needs **historical metrics** — average instance duration, throughput by process type, bottlenecks. The data should aggregate across millions of instances.

**Which Camunda 8 component / API fits this analytics use case?**

- **a)** **Optimize API** — Camunda's analytics platform. Reports + heatmaps + duration analytics across historical instance data. Documentation: [Optimize](https://docs.camunda.io/docs/components/optimize/)

- **b)** Operate's API. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Direct Elasticsearch queries on Zeebe events. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Zeebe gRPC API. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Optimize** is Camunda's analytics tool — purpose-built for historical reporting, duration KPIs, bottleneck analysis. Exposes API for embedding into BI dashboards.

- **Option b) — Wrong scope.** Operate is operational monitoring (current instances, incidents); not historical analytics.

- **Option c) — Bypasses API contract.** Direct ES queries are unsupported and break on upgrades.

- **Option d) — Wrong scope.** Zeebe gRPC is for command/query API, not analytics.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Optimize е analytics.
- **b) 3/10** — operational, not historical.
- **c) 2/10** — bypasses API contract.
- **d) 2/10** — wrong scope.

**Correct Answer:** Optimize API.

**Official Documentation Link:** https://docs.camunda.io/docs/components/optimize/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Historical metrics + BI" → разпознаваш че се иска **Optimize**.

**Въпросът → Solution Framing.** "Component fits analytics" — изпитва се component boundaries.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Optimize е analytics, Operate е operational, ES direct е bypass, Zeebe gRPC е not analytics. Знание за component scope.

---

## Question 45: Extensions & Integrations (Weighting: 25%)

**Scenario:** An ops team must manage Self-Managed cluster members — add a new region, configure roles, manage tenants. They want to script these admin operations.

**Which Camunda 8 API fits SM administration?**

- **a)** **Administration SM API** (or Console API for SaaS) — manages cluster-level entities (members, clusters, regions, roles, tenants). Documentation: [Administration API](https://docs.camunda.io/docs/apis-tools/administration-sm-api/)

- **b)** Zeebe gRPC. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

- **c)** Orchestration Cluster API. Documentation: [Orchestration API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/)

- **d)** Operate API. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Administration API** handles cluster-level entities (Identity, tenants, etc. in SM; clusters, members, IP whitelists in SaaS Console).

- **Option b) — Wrong scope.** Zeebe handles instance/job commands.

- **Option c) — Wrong scope.** Orchestration is instance lifecycle.

- **Option d) — Wrong scope.** Operate is monitoring.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Administration API.
- **b) 2/10** — wrong scope.
- **c) 2/10** — wrong scope.
- **d) 2/10** — wrong scope.

**Correct Answer:** Administration SM API (or Console API for SaaS).

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/administration-sm-api/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Cluster admin operations" → разпознаваш че се иска **Administration API**.

**Въпросът → Solution Framing.** "API fits admin" — изпитва се API surface.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Administration е cluster mgmt, че Zeebe/Orchestration/Operate са different scopes. Знание за administrative APIs.

---

## Question 46: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team has an RPA bot for SAP automation. They want the bot to be triggered **when an SQS message arrives**, not by a BPMN process. The orchestration is event-driven.

**Which architecture fits?**

- **a)** **Inbound Connector** (SQS) — starts a BPMN process whose first activity is the RPA-typed Service Task. The RPA worker picks up and runs the bot. The BPMN is the orchestration layer. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/) + [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **b)** RPA bot polls SQS directly. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **c)** RPA workers can subscribe to Kafka/SQS topics directly. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **d)** Use a Custom Connector that wraps the bot. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 RPA bots are triggered via BPMN Service Tasks (type `camunda::rpa`). External event triggering = wrap in BPMN: Inbound Connector starts process → RPA Service Task → bot executes. BPMN remains the orchestration plane.

- **Option b) — Wrong layer.** Bot shouldn't poll directly; BPMN handles event orchestration.

- **Option c) — Incorrect.** RPA workers subscribe to BPMN-Service-Task activation, not external topics.

- **Option d) — Overkill.** Standard pattern (Inbound Connector → BPMN → RPA Task) suffices.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Inbound Connector → BPMN → RPA.
- **b) 3/10** — wrong layer.
- **c) 2/10** — incorrect arch.
- **d) 4/10** — overkill.

**Correct Answer:** Inbound Connector starts BPMN whose first activity is the RPA Service Task.

**Official Documentation Link:** https://docs.camunda.io/docs/components/rpa/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Event-driven RPA trigger" → разпознаваш че се иска **Inbound Connector + BPMN + RPA**.

**Въпросът → Solution Framing.** "Architecture fits" — изпитва се RPA orchestration model.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че RPA триггерира се чрез BPMN Service Task, че BPMN е orchestration layer, че bots не са event subscribers. Знание за RPA orchestration.

---

## Question 47: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must extract a sub-portion of a list: from `items = [a, b, c, d, e, f, g, h]`, get **3 elements starting at position 4** → `[d, e, f]`.

**Which FEEL built-in fits?**

- **a)** `sublist(items, 4, 3)` — returns 3 elements starting at index 4 (FEEL is 1-indexed). Result: `[d, e, f]`. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** `items[4..6]` — range index. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `slice(items, 4, 7)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `items.subList(3, 6)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `sublist(list, start, length)` returns a sub-list. FEEL is 1-indexed, so position 4 is the 4th element (`d`).

- **Option b) — Wrong syntax.** Range indexing on lists isn't FEEL.

- **Option c) — Invented.** No `slice()` in FEEL.

- **Option d) — Java reflex.** Method-call syntax + 0-indexed.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. sublist(list, start, length).
- **b) 3/10** — wrong syntax.
- **c) 1/10** — invented.
- **d) 2/10** — Java reflex.

**Correct Answer:** sublist(items, 4, 3).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Extract 3 elements starting at position 4" → разпознаваш че се иска **sublist()**.

**Въпросът → Solution Framing.** "Built-in fits" — изпитва се FEEL sublist semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL е 1-indexed, sublist(list, start, length) сиг е canonical, че slice/subList са Java reflex. Знание за FEEL sublist.

---

## Question 48: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression has a list of lists: `groups = [[1,2,3], [4,5], [6,7,8,9]]`. The team wants a single flat list: `[1,2,3,4,5,6,7,8,9]`.

**Which FEEL built-in fits?**

- **a)** `flatten(groups)` — recursively flattens nested lists into a single list. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** `concat(groups)` — string concatenation. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Manual `for` loop. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** FEEL doesn't support nested-list flattening. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `flatten(list)` flattens nested lists into a single-level list.

- **Option b) — Wrong domain.** `concat` is for strings (or `concatenate` for lists in some FEEL versions but `flatten` is the standard recursive flattener).

- **Option c) — Reinvents.** Built-in exists.

- **Option d) — Incorrect.** flatten() exists.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. flatten() built-in.
- **b) 3/10** — wrong domain.
- **c) 4/10** — reinvents.
- **d) 1/10** — невярно.

**Correct Answer:** flatten(groups).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Flatten nested list" → разпознаваш че се иска **flatten()**.

**Въпросът → Solution Framing.** "Built-in fits" — изпитва се FEEL list ops.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че flatten() е canonical, че concat е strings. Знание за FEEL list flattening.

---

## Question 49: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team is deciding between **gRPC** and **REST** API for their Java service that issues Camunda 8 commands. They want better performance for high-throughput command issuance (10,000 commands/min).

**Which API choice fits the throughput requirement?**

- **a)** **gRPC** (Zeebe Java client / Spring Zeebe) — binary protocol, persistent connections, multiplexed streams. Generally lower latency and higher throughput than REST for command issuance at scale. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/gateway-service/)

- **b)** REST (Orchestration Cluster API). Documentation: [Orchestration REST API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/)

- **c)** Both equally performant. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/)

- **d)** Polling via REST is faster than gRPC. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** gRPC's binary protocol + persistent connections + streaming generally provides better performance for high-throughput scenarios than REST. Zeebe's primary client is gRPC; SDKs (Java, Spring Zeebe) use gRPC under the hood.

- **Option b) — Higher latency typically.** REST adds HTTP per-request overhead; usable but suboptimal for 10k+ rpm.

- **Option c) — Incorrect.** gRPC measurably faster for sustained throughput.

- **Option d) — Incorrect.** Polling is slower than push.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. gRPC for high throughput.
- **b) 5/10** — works but slower.
- **c) 3/10** — incorrect generalization.
- **d) 1/10** — невярно.

**Correct Answer:** gRPC.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/zeebe-api/gateway-service/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "High throughput command issuance" → разпознаваш че се иска **gRPC**.

**Въпросът → Solution Framing.** "API choice fits" — изпитва се API performance characteristics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че gRPC е binary + persistent, че REST adds HTTP overhead, че polling е slower. Знание за gRPC vs REST trade-offs.

---

## Question 50: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must work with **string** lengths. The variable `comment = "Great product!"`. The team wants its character count.

**Which FEEL built-in fits?**

- **a)** `string length(comment)` — FEEL string built-in (space-separated function name). Returns character count. Documentation: [FEEL string](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **b)** `length(comment)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `comment.length`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `count(comment)`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `string length(string)` returns string character count. The space-separated function name is a FEEL convention for multi-word built-ins.

- **Option b) — Wrong name.** No bare `length`.

- **Option c) — Java reflex.** No method-call syntax in FEEL.

- **Option d) — Wrong domain.** `count(list)` is for lists.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. string length() built-in.
- **b) 3/10** — wrong name.
- **c) 2/10** — Java reflex.
- **d) 3/10** — wrong domain.

**Correct Answer:** string length(comment).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Character count of string" → разпознаваш че се иска **string length()**.

**Въпросът → Solution Framing.** "Built-in fits" — изпитва се FEEL string ops.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL multi-word names са space-separated, че count е за lists, че няма dot-method. Знание за FEEL string built-ins.

---

# Section 7 — Managing the Development Process (Questions 51-59)

> Weight 15% • Topics: Web Modeler, Git sync, client credentials, Operate, Tasklist, troubleshooting, validation, migration.

---

## Question 51: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's BPMN files live in a Git repo. They want **bidirectional sync** between their Web Modeler project and Git — pushes from Modeler land in Git, and Git changes appear in Modeler.

**Which Web Modeler feature fits?**

- **a)** **Web Modeler Git sync** (where available in the SaaS / SM offering) — configure a Git repo connection on the project; bidirectional sync keeps BPMN/DMN files in both places. Documentation: [Web Modeler GitHub Sync](https://docs.camunda.io/docs/components/modeler/web-modeler/github-sync/)

- **b)** Manual export to ZIP; commit to Git. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** No Git integration; Web Modeler is closed-loop. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** Use Desktop Modeler with Git instead. Documentation: [Desktop Modeler](https://docs.camunda.io/docs/components/modeler/desktop-modeler/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler offers Git/GitHub sync — configure the connection at the project level; commits flow both ways.

- **Option b) — Manual reinvents.** Built-in sync supersedes.

- **Option c) — Incorrect.** Git sync is available.

- **Option d) — Workaround.** Web Modeler is the question's tool; switching defeats the workflow.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Web Modeler Git sync.
- **b) 4/10** — manual.
- **c) 1/10** — невярно.
- **d) 4/10** — workaround.

**Correct Answer:** Web Modeler Git sync.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/github-sync/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Bidirectional Git sync" → разпознаваш че се иска **Git sync feature**.

**Въпросът → Solution Framing.** "Feature fits" — изпитва се Web Modeler integrations.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler има Git sync, че manual export е reinvent, че Desktop Modeler е different tool. Знание за Web Modeler-Git integration.

---

## Question 52: Managing the Development Process (Weighting: 15%)

**Scenario:** A CI pipeline must call the Web Modeler API. The pipeline doesn't have an interactive user; it needs a non-human auth token.

**Which credential type fits?**

- **a)** **Personal Access Token (PAT)** or service-account API key configured for the project / org. Used in `Authorization: Bearer <token>` header. Documentation: [Web Modeler API auth](https://docs.camunda.io/docs/apis-tools/web-modeler-api/)

- **b)** Username + password. Documentation: [Web Modeler API](https://docs.camunda.io/docs/apis-tools/web-modeler-api/)

- **c)** Use the CI user's password. Documentation: [Web Modeler API](https://docs.camunda.io/docs/apis-tools/web-modeler-api/)

- **d)** No auth needed; API is public. Documentation: [Web Modeler API](https://docs.camunda.io/docs/apis-tools/web-modeler-api/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Personal Access Token (PAT) or service-account based token is the canonical pattern for headless / CI scenarios. Avoids interactive login; can be rotated.

- **Option b) — Wrong model.** Not the auth model.

- **Option c) — Bad practice.** Using human credentials in CI is insecure.

- **Option d) — Incorrect.** Auth required.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. PAT / service-account token.
- **b) 1/10** — wrong model.
- **c) 2/10** — bad practice.
- **d) 1/10** — невярно.

**Correct Answer:** Personal Access Token / service-account token.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/web-modeler-api/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Non-human auth for CI" → разпознаваш че се иска **PAT/service token**.

**Въпросът → Solution Framing.** "Credential fits" — изпитва се auth pattern.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че PAT е canonical CI pattern, че user creds в CI са insecure, че auth required. Знание за headless auth.

---

## Question 53: Managing the Development Process (Weighting: 15%)

**Scenario:** An ops engineer finds **400 stuck instances** of an old process version, all with Incidents on the same task. The fix is in v2; the team wants to **migrate all 400 at once** rather than per-instance clicks.

**Which Operate feature fits?**

- **a)** **Batch operations** — Operate supports selecting multiple instances and applying operations (cancel, retry, modify, migrate) as a single batch. Documentation: [Operate batch ops](https://docs.camunda.io/docs/components/operate/userguide/operate-actions/)

- **b)** Per-instance only; click 400 times. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Script via Zeebe API in a loop. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

- **d)** Delete the BPMN definition. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate supports batch operations on selected/filtered instance sets — cancel, retry, modify, migrate. Cuts 400 clicks to one batch action.

- **Option b) — Wasteful.** Batch ops exist.

- **Option c) — Workable but unnecessary.** UI batch is faster for ad-hoc work.

- **Option d) — Wrong action.** Deleting BPMN doesn't fix stuck instances.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Batch operations.
- **b) 2/10** — wasteful.
- **c) 5/10** — works but unnecessary.
- **d) 1/10** — wrong action.

**Correct Answer:** Use Operate batch operations.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/operate-actions/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Migrate 400 instances at once" → разпознаваш че се иска **batch ops**.

**Въпросът → Solution Framing.** "Feature fits" — изпитва се Operate ops at scale.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate supports batch ops, че per-instance е wasteful, че API loop е workable but unnecessary. Знание за Operate batch ops.

---

## Question 54: Managing the Development Process (Weighting: 15%)

**Scenario:** A new agent joins a customer-support team. They open **Tasklist**. The team uses candidateGroups for User Tasks. The new agent should see all unassigned tasks they can work on.

**What does Tasklist show by default?**

- **a)** Tasklist's view shows tasks assigned to the user OR for which they are a candidate (via candidateGroups membership) — both "my tasks" and "available tasks I can claim." Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/)

- **b)** Only tasks explicitly assigned to the user. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/)

- **c)** All tasks in the cluster. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/)

- **d)** Tasklist requires manual filter setup per user. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Tasklist filters by user identity — assigned tasks + candidate tasks for groups the user belongs to. New agent sees claimable work immediately.

- **Option b) — Too narrow.** Misses candidate-pool tasks.

- **Option c) — Privacy violation.** Showing all cluster tasks would violate isolation.

- **Option d) — Default works.** Built-in filtering applies without setup.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Assigned + candidate visible.
- **b) 4/10** — too narrow.
- **c) 1/10** — privacy issue.
- **d) 3/10** — default works.

**Correct Answer:** Tasks assigned to the user OR for which they are a candidate.

**Official Documentation Link:** https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Default Tasklist view" → разпознаваш че се иска **assigned + candidate**.

**Въпросът → Solution Framing.** "What shown by default" — изпитва се Tasklist UX.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Tasklist filtra по identity + group membership. Знание за Tasklist defaults.

---

## Question 55: Managing the Development Process (Weighting: 15%)

**Scenario:** A process instance is stuck on task `T3`. Ops needs to **skip T3** and jump to a downstream task `T7`, since T3's logic isn't applicable for this customer.

**Which Operate feature fits?**

- **a)** **Modify Process Instance** — Operate's modify operation can cancel the active token at T3 and activate a new token at T7. Documentation: [Operate Modify](https://docs.camunda.io/docs/components/operate/userguide/modify-instance/)

- **b)** Cancel + restart with skip. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Edit variables to skip. Documentation: [Operate variables](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **d)** Not possible. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Modify Instance is Operate's surgical-edit feature: cancel tokens at specific flow nodes, activate tokens at others. Designed for cases like skipping a task or recovering from data corruption.

- **Option b) — Loses state.** Cancel/restart wastes prior progress.

- **Option c) — Wrong tool.** Editing variables won't move the token.

- **Option d) — Incorrect.** Modify supports this.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Modify Process Instance.
- **b) 3/10** — loses state.
- **c) 3/10** — wrong tool.
- **d) 1/10** — невярно.

**Correct Answer:** Modify Process Instance (cancel token at T3, activate at T7).

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/modify-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Skip T3 jump to T7" → разпознаваш че се иска **Modify Instance**.

**Въпросът → Solution Framing.** "Feature fits" — изпитва се Operate modify capability.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Modify е surgical edit, че cancel/restart loses state, че variables don't move tokens. Знание за Modify Instance.

---

## Question 56: Managing the Development Process (Weighting: 15%)

**Scenario:** Before each production deployment, the team wants to **verify** the BPMN against best practices and Zeebe execution rules — no Service Task without retries, no orphan flows, etc. They want this in the CI pipeline.

**Which approach fits?**

- **a)** Use the **bpmnlint** (or Camunda Modeler's validation) integrated into CI — run on each PR; fail build on violations. Web Modeler's validation can also be invoked via API or by checking before deploy. Documentation: [Validation](https://docs.camunda.io/docs/components/modeler/desktop-modeler/validation/)

- **b)** Manual review by lead. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **c)** Wait until production fails. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Validation isn't available in CI. Documentation: [Validation](https://docs.camunda.io/docs/components/modeler/desktop-modeler/validation/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** bpmnlint is a community/Camunda-recommended lint tool with rule sets for Zeebe deployment. Integrate into CI for design-time guardrails.

- **Option b) — Doesn't scale.** Manual review is necessary but not sufficient.

- **Option c) — Wasteful.** Production isn't a test environment.

- **Option d) — Incorrect.** Lint tools are CI-friendly.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. bpmnlint в CI.
- **b) 4/10** — doesn't scale.
- **c) 1/10** — wasteful.
- **d) 1/10** — невярно.

**Correct Answer:** bpmnlint integrated into CI.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/validation/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Validate BPMN in CI" → разпознаваш че се иска **bpmnlint**.

**Въпросът → Solution Framing.** "Approach fits" — изпитва се CI integration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че bpmnlint exists, че manual reviews don't scale, че prod fail е wasteful. Знание за CI BPMN validation.

---

## Question 57: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's Job Worker for `send-email` was scheduled to run with at-least-once delivery. Zeebe re-activates a job after timeout; the worker may receive the same job twice. The team wants to ensure emails aren't sent **twice** to the customer.

**Which best practice fits?**

- **a)** Make the worker **idempotent** — use a deduplication key (e.g., the job's `elementInstanceKey`) when calling the email API to ensure repeated sends are deduplicated downstream. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Increase timeout so retries never happen. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Use exactly-once delivery in Zeebe config. Documentation: [Zeebe](https://docs.camunda.io/docs/components/concepts/architecture/)

- **d)** Don't retry on failure. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe's at-least-once semantics mean workers must be **idempotent**. Use a unique key per job (e.g., elementInstanceKey or a business-level id) when calling external systems; the system deduplicates.

- **Option b) — Workaround at scale.** Long timeouts hide the issue and create slow incident detection.

- **Option c) — Misleading.** Zeebe is at-least-once by design; no "exactly-once" config flag.

- **Option d) — Loses reliability.** Disabling retries undermines reliability guarantees.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Idempotent worker + dedup key.
- **b) 3/10** — hides issue.
- **c) 2/10** — at-least-once е invariant.
- **d) 2/10** — loses reliability.

**Correct Answer:** Make the worker idempotent using deduplication keys.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Avoid double email + at-least-once" → разпознаваш че се иска **idempotency**.

**Въпросът → Solution Framing.** "Best practice" — изпитва се distributed-systems knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че at-least-once е invariant в Zeebe, че idempotency е the recourse, че timeouts hide issues. Знание за worker idempotency.

---

## Question 58: Managing the Development Process (Weighting: 15%)

**Scenario:** An ops team sees 50 Incidents across various processes. They want to filter to incidents whose error message contains "Timeout" to triage similar problems together.

**Which Operate feature fits?**

- **a)** Operate's **Incident filter** supports filtering by error message / type / process. Apply substring filter "Timeout" to surface matching incidents. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/process-instance-summary/)

- **b)** Manually scroll through 50. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Export to CSV and grep. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Operate doesn't support text filters. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's filters include error message/type filtering. Use substring search to triage.

- **Option b) — Wasteful.** Filtering exists.

- **Option c) — Workaround.** Built-in filters suffice for substring search.

- **Option d) — Incorrect.** Text filtering supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Incident filter.
- **b) 2/10** — wasteful.
- **c) 4/10** — workaround.
- **d) 1/10** — невярно.

**Correct Answer:** Operate Incident filter by error message substring.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-summary/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Filter Incidents by message" → разпознаваш че се иска **Incident filter**.

**Въпросът → Solution Framing.** "Feature fits" — изпитва се Operate filtering capabilities.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate има incident filters, че manual scroll е wasteful, че CSV export е workaround. Знание за Operate filters.

---

## Question 59: Managing the Development Process (Weighting: 15%)

**Scenario:** A team needs to audit which **DMN decisions** were evaluated by a specific process instance, with the input/output values for each evaluation. The compliance team needs this for the past month.

**Which Camunda 8 component holds this audit data?**

- **a)** **Operate** stores **Decision Instances** — every DMN evaluation produces a record with inputs, outputs, and the decision definition reference. Searchable per process instance. Documentation: [Operate decisions](https://docs.camunda.io/docs/components/operate/userguide/decision-instances-summary/)

- **b)** Tasklist. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **c)** Optimize only. Documentation: [Optimize](https://docs.camunda.io/docs/components/optimize/)

- **d)** Not stored; recompute from rules. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's Decision Instances view captures each DMN evaluation: inputs, outputs, decision definition. Searchable + auditable.

- **Option b) — Wrong tool.** Tasklist handles User Tasks.

- **Option c) — Partially correct.** Optimize has historical analytics but Operate has per-instance audit.

- **Option d) — Incorrect.** Stored in Operate.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Operate Decision Instances.
- **b) 1/10** — wrong tool.
- **c) 5/10** — partial — Optimize has aggregate but Operate has per-instance.
- **d) 1/10** — невярно.

**Correct Answer:** Operate Decision Instances view.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/decision-instances-summary/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Audit DMN evaluations per instance" → разпознаваш че се иска **Operate Decision Instances**.

**Въпросът → Solution Framing.** "Component holds audit" — изпитва се Operate scope.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate captures Decision Instances, че Tasklist е User Tasks, че Optimize е aggregate analytics. Знание за Operate decision audit.

---

# Section 8 — Dev Environment Setup (Question 60)

> Weight 1% • Topics: Camunda 8 Run, Docker Compose, default ports.

---

## Question 60: Dev Environment Setup (Weighting: 1%)

**Scenario:** A team uses the official **Docker Compose** quickstart for local Camunda 8 Self-Managed. After `docker compose up -d`, they want to access the UIs.

**Which port mapping is canonical for the bundled services?**

- **a)** **Operate → :8080, Tasklist → :8082, Identity → :8084, Zeebe gRPC → :26500, Connectors → :8085.** (Exact bindings depend on the specific compose file version; the team should check `docker-compose.yaml`.) Documentation: [Docker Compose](https://docs.camunda.io/docs/self-managed/setup/deploy/local/docker-compose/)

- **b)** All services on :8080. Documentation: [Docker Compose](https://docs.camunda.io/docs/self-managed/setup/deploy/local/docker-compose/)

- **c)** All services on :80. Documentation: [Docker Compose](https://docs.camunda.io/docs/self-managed/setup/deploy/local/docker-compose/)

- **d)** Ports are randomly assigned. Documentation: [Docker Compose](https://docs.camunda.io/docs/self-managed/setup/deploy/local/docker-compose/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Each Camunda component has its own port in the bundled Compose. Always verify the specific bindings in the compose file shipped with your version — the rough scheme is: Operate :8080, Tasklist :8082, Zeebe gRPC :26500, Identity :8084, Connectors :8085 (some setups vary). Don't assume; check.

- **Option b) — Incorrect.** Each service on its own port.

- **Option c) — Incorrect.** Default isn't :80.

- **Option d) — Incorrect.** Fixed by compose file.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Per-service distinct ports.
- **b) 1/10** — невярно.
- **c) 1/10** — невярно.
- **d) 1/10** — невярно.

**Correct Answer:** Each service on its own port; check the compose file (Operate :8080, Tasklist :8082, Zeebe gRPC :26500, etc.).

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/setup/deploy/local/docker-compose/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** "Docker Compose ports access" → разпознаваш че се иска **per-service distinct ports**.

**Въпросът → Solution Framing.** "Port mapping canonical" — изпитва се deployment port knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че всеки сервис има own port, че compose определя bindings, че не са on :80 или random. Знание за Compose port layout.

---

# Закриваща секция — Set 5

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

**Препоръка за тренировка (Set 5):**
1. **Open-book проход** — чети всеки 🔍 Explanations + Three-Skills Decomposition; не таймирай.
2. **Closed-book timed run** — 75-минутен таймер; запиши отговорите си; цел: ≥ 39/60.
3. **Анализ на грешки:** за всяка грешка кои от 3-те skills ти липсваше (Diagnostic Comprehension / Solution Framing / Mechanism Knowledge).

**Чести грешки в Set 5 (грешен axis вместо грешен отговор):**
- Q1 (Pools vs Lanes) → пътане с Lanes за inter-org (Pools е правилния scope за separate participants).
- Q5 (Terminate End) → пътане с Cancel End (което е за transaction subprocesses), или Error End (което throws upward).
- Q6 (Manual Task) → пътане с User Task (orchestrated) или Service Task (automated).
- Q8 (Signal) → пътане с Message (1-to-1 correlation) — Signal е broadcast.
- Q20 (Message Start + correlation key) → trap — Start Events не correlate; correlation key е за Catch.
- Q22 (subprocess variable scope) → пътане с "all variables global" — Embedded subprocess scopes са isolated.
- Q27 (DRD top-decision invocation) → пътане с "must invoke each chained decision" — top-decision auto-chains via Information Requirement.
- Q35 (Element Template binding) → trap — both zeebe:input и zeebe:taskHeader са valid; choose by integration style.
- Q47 (FEEL 1-indexed) → пътане с Java/JS 0-indexing — FEEL е 1-indexed.
- Q57 (idempotent workers) → пътане с "exactly-once delivery" — Zeebe е at-least-once by design; idempotency е the workaround.

**Успех на изпита!**
