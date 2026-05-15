# Camunda 8 C8-CP-DV Mock Exam — Set 13

> **60 въпроса • 75 минути • праг ≥ 65% (39/60) • Blueprint v8.8.0**
>
> Свежи сценарии — distinct от Set 1-12. Всеки въпрос: сценарий + 4 опции (a/b/c/d) + 🔍 Explanations + per-option score 1–10 + Correct Answer + Documentation Link + 🧠 Three-Skills Decomposition.

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

> Weight 15% • Topics: Default flow vs no-condition, MI completion using outputs, error propagation to root, Start Event Output Mapping, compensation handler failure, swimlane orientation, Send Task vs Connector, Boundary scope inheritance, looping markers.

---

## Question 1: Modeling (Weighting: 15%)

**Scenario:** An XOR Gateway has 3 outgoing flows. One has condition `=approved = true`, another has `=approved = false`, the third has **no condition at all**. The team wonders what happens with the third flow — is it implicitly the default?

**Is an XOR outgoing flow without a condition automatically the default flow?**

- **a)** **No — "no condition" and "default flow" are distinct concepts**. A flow without a condition is **NOT** automatically the default. At runtime:
  - **Conditioned flows**: evaluated; first matching condition wins.
  - **Unconditioned flow (not designated as default)**: would be taken if reached during evaluation order, but XOR's semantic of "one outgoing flow" means this is ambiguous; engines often error or pick the first viable flow.
  - **Default flow**: must be **explicitly designated** via the gateway's `default` attribute (BPMN XML) or Web Modeler UI ("Default flow" checkbox). Then it's taken only when no other condition matches.

  Best practice: always explicitly mark one outgoing flow as default when other flows have conditions. Documentation: [Exclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/) + [Sequence Flows](https://docs.camunda.io/docs/components/modeler/bpmn/sequence-flows/)

- **b)** Yes — automatically default — wrong; needs explicit designation. Documentation: [Sequence Flows](https://docs.camunda.io/docs/components/modeler/bpmn/sequence-flows/)

- **c)** Validation fails on deployment — partial; some validators may flag, but designation is the fix. Documentation: [Validation](https://docs.camunda.io/docs/components/modeler/desktop-modeler/validation/)

- **d)** No condition = always taken — wrong; would conflict with conditioned flows. Documentation: [Sequence Flows](https://docs.camunda.io/docs/components/modeler/bpmn/sequence-flows/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN distinguishes two concepts that look similar:

  **Conditioned flow**: has a `<bpmn:conditionExpression>` element. Evaluated; if true, taken (for XOR — first true wins).

  **Default flow**: explicitly marked via the gateway's `default` attribute referencing the flow's ID. No condition expression on the flow itself. Taken only if no conditioned flow matches.

  **Unconditioned-but-not-default flow**: ambiguous / error case. Some engines / validators flag this; some treat unpredictably. **Avoid** — make every flow either conditioned OR explicitly default.

  **In Web Modeler**:
  - Set conditions in the flow's "Condition expression" property.
  - For default: select the flow + check "Default flow" box; the gateway's appearance updates (slash mark across the default flow's arrow).

  **In BPMN XML**:
  ```xml
  <bpmn:exclusiveGateway id="gateway_approved" default="Flow_default" />
  
  <bpmn:sequenceFlow id="Flow_yes" sourceRef="gateway_approved" targetRef="Task_publish">
    <bpmn:conditionExpression>=approved = true</bpmn:conditionExpression>
  </bpmn:sequenceFlow>
  <bpmn:sequenceFlow id="Flow_no" sourceRef="gateway_approved" targetRef="Task_reject">
    <bpmn:conditionExpression>=approved = false</bpmn:conditionExpression>
  </bpmn:sequenceFlow>
  <bpmn:sequenceFlow id="Flow_default" sourceRef="gateway_approved" targetRef="Task_review" />
  ```

  Notice: `Flow_default` has no condition AND is referenced by the gateway's `default` attribute → it's the explicit default.

  **Coverage**: ensure every possible input has a matching path — conditioned flows cover the expected cases; default handles "anything else."

- **Option b) — Wrong.** Explicit designation needed.

- **Option c) — Partial.** Some validators may warn; designation is the fix.

- **Option d) — Wrong.** Would conflict.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. No-condition ≠ default; explicit designation via `default` attribute required.
- **b) 2/10** — wrong; explicit needed.
- **c) 4/10** — partial.
- **d) 2/10** — wrong.

**Correct Answer:** No — no-condition and default are distinct; mark default explicitly via the gateway's `default` attribute.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "flow without condition", "implicitly default." Default flow semantics.

**Въпросът → Solution Framing.** "Automatically default" — изпитва се knowledge на default vs no-condition.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че default needs explicit designation, че no-condition is ambiguous, че every flow should be conditioned OR explicit default. Това е знание за gateway flow semantics.

---

## Question 2: Modeling (Weighting: 15%)

**Scenario:** A Multi-Instance Subprocess processes `tasks`. Each inner instance produces an `output` (boolean: success?). The team wants completion when **3 successes** are achieved (regardless of total instances or order).

**How is "complete on 3 successes" expressed with completionCondition?**

- **a)** **Use FEEL aggregation on outputCollection**: `=count([item in outputCollection : item = true]) >= 3`. The engine evaluates this after each inner instance completes; when 3 successes are accumulated, MI completes. **Requires**: `outputCollection` configured (per-iteration output captured). The pattern combines outputCollection accumulation + FEEL filter+count for "N successes" semantics. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** `=numberOfCompletedInstances >= 3` — partial; counts completed but not successful. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Cannot express success-counting — wrong; FEEL filters work. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Use a counter variable in parent scope — workaround; outputCollection cleaner. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Combining outputCollection + FEEL filter + count is the canonical pattern for "complete when N items satisfy criterion":

  **Setup**:
  - `inputCollection = =tasks`.
  - `outputCollection = results` (per-iteration output captured).
  - `outputElement = =output` (each instance's boolean result).
  - `completionCondition = =count([r in results : r = true]) >= 3`.

  **Evaluation**:
  - After each inner instance completes, the engine updates outputCollection with that instance's outputElement.
  - The engine re-evaluates completionCondition.
  - If true → MI completes (remaining instances cancelled).

  **Important**: outputCollection contains results from completed instances only; instances still running aren't reflected yet. So the count grows as instances complete.

  **Alternative patterns**:
  - **Parent-scope counter**: each iteration's Output Mapping increments a parent counter; completionCondition reads it. Workaround; outputCollection cleaner.
  - **Stop on first failure**: combine with Error Boundary (per Set 11) for break semantics.

  Best practice: outputCollection + FEEL filter+count is the canonical "N-of-M" pattern.

- **Option b) — Partial.** Counts completed regardless of success.

- **Option c) — Wrong.** Achievable.

- **Option d) — Workaround.** outputCollection cleaner.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. outputCollection + FEEL filter+count = "N successes" pattern.
- **b) 5/10** — partial.
- **c) 1/10** — wrong.
- **d) 4/10** — workaround.

**Correct Answer:** `=count([item in outputCollection : item = true]) >= 3` with outputCollection capturing per-iteration success flag.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "3 successes", "complete when." MI conditional completion.

**Въпросът → Solution Framing.** "Express success-counting" — изпитва се FEEL aggregation на outputCollection.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че outputCollection captures per-iteration, че FEEL filter+count aggregates, че completionCondition re-evaluates per completion. Това е знание за MI conditional completion patterns.

---

## Question 3: Modeling (Weighting: 15%)

**Scenario:** A Service Task in an Embedded Subprocess throws BPMN error `"INVALID_DATA"`. There's **no Error Boundary inside the subprocess, no Boundary on the subprocess itself, no Event Subprocess at process root**. The error has nowhere to go. What happens?

**Where does an uncaught BPMN error end up?**

- **a)** **The error propagates upward through all scopes; if not caught anywhere, it produces an Incident at the process root** — instance pauses; Operate shows Incident with the unhandled error details. Ops can: fix the issue + resolve Incident → retry; cancel instance; modify to skip. **Best practice**: have a catch-all Error Boundary at the process root or an Event Subprocess with Error Start to handle unforeseen errors gracefully (notify ops, log, alert). Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/) + [Operate Incidents](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **b)** Instance auto-cancels — wrong; pauses with Incident. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Error silently swallowed — wrong; surfaced as Incident. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **d)** Process restarts — wrong. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN error propagation rules + Camunda 8 Incident behavior:

  **Propagation chain**:
  1. Error thrown at Service Task.
  2. Engine looks for matching Error Boundary on the throwing activity → none.
  3. Propagates to containing scope (Embedded Subprocess) → checks Boundary / Event Subprocess Error Start → none.
  4. Propagates to outer scope (process root) → checks → none.
  5. Unhandled → Incident at process root.

  **Incident behaviour**:
  - **Instance pauses**: doesn't continue; stuck at the throwing activity.
  - **Visible in Operate**: incident message + stack trace + activity reference.
  - **Resolution paths**:
    - **Fix + retry**: fix the underlying issue (data, code); Resolve Incident → activity re-runs.
    - **Update variables**: if data issue, fix in Operate; resolve.
    - **Cancel instance**: if unrecoverable, cancel.
    - **Modify instance**: skip the failed activity if appropriate.

  **Best practice — catch-all at root**:
  - **Event Subprocess with Error Start at process root**: catches any unhandled error in the process.
  - **Generic handler**: log details, alert ops, mark instance as "needs review," potentially route to recovery path.
  - **Trade-off**: catches everything (incl. unknown errors) but obscures specific error types; pair with specific Error Boundaries for known errors.

  **Comparison with layered handling** (per Set 11 Q4): layered = activity-specific + scope-wide + root catch-all. Comprehensive defense.

- **Option b) — Wrong.** Pauses, doesn't cancel.

- **Option c) — Wrong.** Surfaced.

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Uncaught → Incident at process root; ops resolves; best practice = catch-all at root.
- **b) 2/10** — wrong.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Uncaught error propagates to process root as Incident; instance pauses; ops resolves via fix / cancel / modify.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/error-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "no boundary anywhere", "error nowhere to go." Uncaught error fate.

**Въпросът → Solution Framing.** "Where ends up" — изпитва се knowledge на propagation + Incident.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че uncaught → Incident, че instance pauses + ops resolves, че catch-all at root е best practice. Това е знание за error propagation fallback.

---

## Question 4: Modeling (Weighting: 15%)

**Scenario:** A None Start Event accepts incoming data. The team wants to **transform / enrich** the data at the Start Event — not in the calling API, not in a Service Task — but right at instance entry. They wonder if Start Events support Output Mapping (not just Input).

**Do Start Events support Output Mapping (in addition to Input Mapping)?**

- **a)** **Output Mapping at Start Event doesn't apply the same way** as on Service Tasks. Start Events represent instance entry — they don't "produce output" like a task does. **What works at Start Events**:
  - **Input Mapping** (`<zeebe:input>`): transforms incoming variables into process scope variables at instance start. Useful for normalisation / defaults / enrichment.
  - **Output Mapping** (`<zeebe:output>`): typically not applicable at None Start (no produced output to map). For Message Start Events, the message's payload becomes the initial variables; Output Mapping could conceptually transform that to process scope, but verify per Zeebe version's specific behavior.
  
  For transformations at entry: use Input Mapping at the Start Event (set variables, compute derived values, normalize). Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/) + [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **b)** Both Input and Output Mapping fully supported — partial; behavior varies. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Only Output Mapping — wrong; Input is the entry-transform path. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** No mappings at Start — wrong; Input supported. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Mapping behavior at Start Events:

  **Input Mapping (clearly applicable)**:
  - Transforms incoming variables before they land in process scope.
  - Useful for: normalisation (`customer_name` → `customer.fullName`), defaults (`priority` if not provided → "NORMAL"), computation (`createdAt: now()`), restructuring (flat → nested).

  **Output Mapping (less applicable)**:
  - Start Events don't produce "outputs" like tasks — there's no work happening that yields results to map.
  - **For None Start**: no concept of output; Output Mapping typically isn't meaningful.
  - **For Message Start**: the message's payload arrives; could conceptually be transformed via Output Mapping in some configurations, but verify per version. Usually Input Mapping at the Start Event handles transformation.

  **Practical pattern**:
  ```xml
  <bpmn:startEvent id="StartEvent_1">
    <bpmn:extensionElements>
      <zeebe:ioMapping>
        <zeebe:input source="=customerName" target="customer.fullName"/>
        <zeebe:input source="=if priority != null then priority else \"NORMAL\"" target="priority"/>
      </zeebe:ioMapping>
    </bpmn:extensionElements>
  </bpmn:startEvent>
  ```

  Input Mapping at Start = entry transformation; cleaner than alternative patterns (first Service Task doing transformation, or burdening caller with transformation).

- **Option b) — Partial.** Output less applicable.

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Input Mapping at Start applies; Output Mapping less applicable (no output to map).
- **b) 5/10** — partial.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Input Mapping at Start Event applies (entry transformation); Output Mapping typically not applicable (no output produced).

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Output Mapping at Start Event." Mapping direction at Start.

**Въпросът → Solution Framing.** "Output Mapping supported" — изпитва се knowledge на mapping at Start.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Input Mapping applies, че Output less applicable (no output), че entry transformation common use case. Това е знание за Start Event mappings.

---

## Question 5: Modeling (Weighting: 15%)

**Scenario:** A compensation handler `refund-card` (Service Task) **itself fails** — the refund API is down. The team wonders what happens when a compensation handler errors out.

**What happens when a Compensation Handler fails?**

- **a)** **Compensation handler failure typically propagates as an Incident** — the compensation cascade pauses at the failing handler; the instance is in an incident state. Ops can:
  - **Fix + retry**: address the underlying issue (refund API back up), resolve incident; handler retries.
  - **Manual resolution**: if can't auto-fix, manually intervene (modify instance, escalate, etc.).
  
  Important: compensation is critical recovery logic — handler failures need careful design. Best practice: handlers themselves should be reliable (retries, fallbacks, idempotent). Document the compensation strategy. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/) + [Operate Incidents](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **b)** Handler skipped, cascade continues — wrong; failure handled. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **c)** All compensation aborted — partial; depends on behavior. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **d)** Process restarts compensation from beginning — wrong. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Compensation handlers are regular activities (Service Tasks, Subprocesses, etc.); their failures follow standard error / incident handling:

  **Failure flow**:
  1. Compensation throw triggers cascade.
  2. Engine invokes Compensation Handler for completed activity.
  3. Handler (Service Task) fails — worker reports error / fail.
  4. **Standard error handling applies**: retries (per task definition), Error Boundary on handler if any, Incident if uncaught.

  **Implications**:
  - **Cascade paused**: until the failing handler is resolved, subsequent handlers in the cascade don't execute.
  - **Partial rollback state**: some compensations done, others pending → system in inconsistent state until resolved.

  **Best practices for reliable compensation handlers**:
  - **Idempotency**: handlers may run multiple times (retries); design to be safe.
  - **Retries with backoff**: configure handler's task retries for transient errors.
  - **Fallback strategies**: if primary refund API down, fall back to manual queue / alternate provider.
  - **Monitoring**: alert on compensation handler incidents — these indicate serious issues.
  - **Test failure modes**: in dev, simulate handler failures; verify ops procedures.

  **Edge cases**:
  - **Nested compensation**: handler invoking compensation throw inside itself? Verify Zeebe version's behavior.
  - **Multiple completed activities to compensate**: cascade order is reverse-completion; failure pauses at the failing one.

  Compensation handlers warrant the same rigor as primary path logic — perhaps more so, since they're recovery logic.

- **Option b) — Wrong.** Failure handled.

- **Option c) — Partial.** Depends.

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Compensation handler failure → Incident; cascade pauses; ops resolves; design handlers reliably.
- **b) 2/10** — wrong.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Compensation handler failure produces Incident; cascade pauses; design handlers with idempotency, retries, monitoring.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "compensation handler fails", "refund API down." Handler failure handling.

**Въпросът → Solution Framing.** "What happens on handler failure" — изпитва се knowledge на compensation + error layered.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че handler failures → Incident, че cascade pauses, че handlers warrant reliability design. Това е знание за compensation reliability.

---

## Question 6: Modeling (Weighting: 15%)

**Scenario:** A team's BPMN tool defaults to **horizontal swimlanes** (left-to-right flow). They want to switch to **vertical swimlanes** (top-to-bottom flow). They wonder if BPMN supports this orientation.

**Does BPMN support both horizontal and vertical swimlane orientation?**

- **a)** **Yes — BPMN supports both orientations**. **Horizontal** (most common): Pool extends horizontally, Lanes are horizontal bands; sequence flows go left-to-right. **Vertical**: Pool extends vertically, Lanes are vertical columns; sequence flows go top-to-bottom. **Choice**: cultural / tool preference; some teams prefer vertical for long processes (less horizontal scrolling). Verify your BPMN editor's support for vertical orientation. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **b)** Only horizontal — partial; vertical also valid BPMN. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **c)** Vertical not allowed — wrong. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** Orientation defined per element — partial; whole-Pool orientation typically. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN spec allows both orientations:

  **Horizontal swimlanes** (most common):
  - **Pool**: extends left-to-right; Lanes are horizontal bands stacked top-to-bottom.
  - **Flow direction**: left-to-right primarily; activities chained horizontally.
  - **Reading**: like timeline; left = earliest, right = latest.

  **Vertical swimlanes**:
  - **Pool**: extends top-to-bottom; Lanes are vertical columns side-by-side.
  - **Flow direction**: top-to-bottom primarily.
  - **Reading**: like a checklist; top = first, bottom = last.

  **Choice criteria**:
  - **Process length**: very long processes might be more readable vertically (fits screen height); short / parallel-heavy might be horizontal.
  - **Cultural preference**: some regions / teams default to one or the other.
  - **Tool support**: BPMN editors typically support both; verify your specific tool / version.

  **At runtime**:
  - Orientation doesn't affect execution semantics. Zeebe runs the model regardless of visual layout.
  - It's a presentation / readability choice.

  **Mixing in collaboration diagrams**:
  - Multiple Pools could conceptually have different orientations, but readability usually favors consistency.

  For Camunda 8 + Web Modeler: verify the current version's UI support for vertical Pool orientation; horizontal is typically the default.

- **Option b) — Partial.** Both valid.

- **Option c) — Wrong.**

- **Option d) — Partial.** Whole-Pool level typically.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Both horizontal and vertical supported; choice by readability / preference.
- **b) 5/10** — partial.
- **c) 1/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** Yes — BPMN supports both horizontal and vertical swimlanes; choice by readability / culture / tool support.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "vertical swimlanes." Orientation support.

**Въпросът → Solution Framing.** "Horizontal vs vertical" — изпитва се knowledge на BPMN orientation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че both orientations supported, че readability factor, че Zeebe runtime-agnostic. Това е знание за BPMN presentation.

---

## Question 7: Modeling (Weighting: 15%)

**Scenario:** A team needs to send a message to an external system. They consider: (1) **Send Task with Connector binding**, (2) **Service Task with Connector**, (3) **Intermediate Throw Message Event with Connector**. They wonder which is most semantically appropriate.

**Send Task vs Service Task with Connector vs Throw Message Event — semantic choice?**

- **a)** **Each has different semantic emphasis**:
  - **Send Task** (envelope-marked task): "this task sends a message to an external participant." Semantic clarity for messaging. Visually distinct (envelope marker).
  - **Service Task** (generic): "this task does work via a worker / Connector." Generic; the work might be messaging, but the model doesn't specify visually.
  - **Throw Message Event** (event marker): "an event happens at this point — fire a message." Lightweight; no task box.
  
  **For pure messaging without business work**: Send Task or Throw Message Event are semantically clearer than Service Task. Throw Message Event is lightest. Functionally similar with a Connector; choice is about diagram clarity. Documentation: [Send Task](https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/) + [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **b)** All identical — partial; semantic differences matter. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **c)** Service Task only — wrong; Send Task / Throw Message valid. Documentation: [Send Task](https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/)

- **d)** Send Task always wins — overstates; depends on context. Documentation: [Send Task](https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** All three constructs can send messages with a Connector; semantic choice:

  **Send Task** (BPMN task with envelope marker):
  - **Semantic**: "this task's purpose IS to send a message."
  - **Visual**: rectangle with envelope marker (distinguishes from generic Service Task).
  - **Use when**: messaging is a meaningful business step; readers benefit from the visual cue.

  **Service Task** (generic worker-driven task):
  - **Semantic**: "this task does work via a worker."
  - **Visual**: rectangle with gear / cog marker (or just plain).
  - **Use when**: the task's purpose is broader than just messaging (e.g., "process payment" — which happens to call a payment API).
  - **For pure messaging**: less semantically precise than Send Task.

  **Throw Message Event** (BPMN intermediate event):
  - **Semantic**: "an event happens — fire a message."
  - **Visual**: circle with envelope marker.
  - **Use when**: the messaging is a side-effect / event in the middle of flow; not a "task" with significant work.
  - **Lightest weight**: no task box overhead.

  **Choice in practice**:
  - **Slack notification on order shipped**: Throw Message Event or Send Task (both semantic; Throw lighter for "event during flow").
  - **Submit credit application to partner via API**: Send Task (it's a meaningful business step).
  - **Generic API call doing computation**: Service Task (work, not pure messaging).

  **All three** functionally similar at runtime with a Connector. Diagram readability drives choice.

- **Option b) — Partial.** Semantic differences.

- **Option c) — Wrong.** Multiple options.

- **Option d) — Overstates.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Semantic differences guide choice; Send Task for messaging steps, Service Task for generic, Throw Message Event for lightweight events.
- **b) 4/10** — partial.
- **c) 2/10** — wrong.
- **d) 5/10** — overstates.

**Correct Answer:** Send Task for messaging tasks (semantic clarity); Service Task for generic work; Throw Message Event for lightweight events. Choose by intent.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Send Task vs Service Task vs Throw Message Event." Semantic distinction.

**Въпросът → Solution Framing.** "Semantic choice" — изпитва се knowledge на BPMN element semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Send Task е messaging-specific, че Service Task е generic, че Throw Message Event е lightweight event. Това е знание за BPMN element selection by semantic.

---

## Question 8: Modeling (Weighting: 15%)

**Scenario:** A team has an Embedded Subprocess containing User Tasks + Service Tasks. They wonder if a Boundary Event attached to the subprocess element can use FEEL referencing **variables set inside the subprocess**.

**Can Boundary Event expressions (e.g., Timer Date FEEL) reference variables set inside the subprocess host?**

- **a)** **The Boundary Event evaluates at activation time** — typically when its host activity activates. At that moment, variables set later **inside** the host (e.g., by inner activities) aren't available yet. **For Timer Boundary on subprocess**: the duration / date FEEL evaluates when the subprocess starts; inner subprocess variables don't exist yet. **Workarounds**:
  - Compute the timer value **before** the subprocess (in an upstream Service Task / Output Mapping).
  - Use a Timer **inside** the subprocess (on an inner activity) if the timer depends on inner state.
  
  Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/) + [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **b)** Boundary FEEL can reference any future variable — wrong; evaluation timing matters. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** Boundary always uses static values — partial; FEEL supported but evaluated at activation. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **d)** Cannot reference any variables — wrong. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Boundary Event evaluation timing:

  **At host activation**:
  - Timer Boundary's duration / date FEEL evaluates.
  - Message Boundary's correlation key FEEL evaluates.
  - The variables in scope at that moment determine the result.

  **For a Boundary on a subprocess**:
  - "Host activation" = subprocess starts.
  - At that moment: parent's scope variables are available; subprocess's inner variables don't exist yet (the subprocess's inner activities haven't run).
  - FEEL expression can reference parent's variables, but not inner-subprocess-only variables.

  **Variables for the Boundary's FEEL**:
  - **Available**: anything in the subprocess's outer scope (process root, ancestor scopes' variables).
  - **NOT available**: variables created by inner activities inside the subprocess (they don't exist yet at activation).

  **Workarounds for "boundary depends on inner state"**:
  - **Compute before**: a Service Task before the subprocess sets the duration variable; Boundary's FEEL reads it.
  - **Move the timer inside**: attach Timer Boundary to a specific inner activity that has the right context.
  - **Multi-level timing**: chain timer-based subprocesses if dependent timings are required.

  Plan timer placement based on data availability.

- **Option b) — Wrong.** Evaluation timing matters.

- **Option c) — Partial.** FEEL supported.

- **Option d) — Wrong.** Can reference scope.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Boundary FEEL evaluates at host activation; inner-subprocess variables not yet available.
- **b) 2/10** — wrong.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Boundary FEEL evaluates at host activation; can reference outer scope but not inner-subprocess-only variables (they don't exist yet).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Boundary FEEL referencing inner variables." Evaluation timing.

**Въпросът → Solution Framing.** "Reference variables inside subprocess" — изпитва се knowledge на boundary evaluation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че boundary evaluates at host activation, че inner-scope variables not yet available, че workarounds (compute-before, move inside). Това е знание за boundary timing.

---

## Question 9: Modeling (Weighting: 15%)

**Scenario:** A BPMN activity needs to **iterate over a list AND check a per-iteration completion condition**. The team is choosing between Multi-Instance markers and Standard Loop marker.

**Multi-Instance vs Standard Loop — when to use which?**

- **a)** **Multi-Instance** (parallel or sequential bars): designed for **iterating over a collection** (`inputCollection` + `inputElement`) OR a known count (`loopCardinality`). Combined with `completionCondition` for early termination. **Standard Loop** (single curved arrow marker): designed for **while-loop semantics** — repeat the activity while a loop condition is true. Doesn't iterate a collection. **For "iterate list + completion condition"**: Multi-Instance with completionCondition is the canonical choice. Standard Loop would re-execute the same activity in a loop, not iterate elements. **Note**: Standard Loop's Zeebe coverage is limited; verify per version. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/) + [BPMN coverage](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **b)** Same construct — wrong; distinct. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **c)** Standard Loop for collections — wrong; that's MI. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Multi-Instance for while-loops — wrong; that's Standard Loop. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Two distinct BPMN looping constructs:

  **Multi-Instance** (`‖` parallel or `≡` sequential bars):
  - **Purpose**: iterate over a collection or known count.
  - **Configurations**:
    - `inputCollection + inputElement`: per-element iteration.
    - `loopCardinality`: count-based iteration.
    - `completionCondition`: early termination (when condition met, remaining instances cancel).
    - `outputCollection + outputElement`: capture per-iteration results.
  - **Modes**: Parallel (concurrent) or Sequential.
  - **Visual**: bars in the activity's lower edge.

  **Standard Loop** (single curved arrow marker):
  - **Purpose**: repeat the activity while a loop condition is true (while-loop semantics).
  - **Single execution context**: the activity executes; loop condition re-evaluated; if true, re-execute.
  - **Visual**: small circular arrow on the activity.
  - **Zeebe coverage**: limited; verify version.

  **Decision matrix**:
  - **Iterate collection** (process each order, etc.): Multi-Instance with inputCollection.
  - **Iterate count** (run check 5 times): Multi-Instance with loopCardinality.
  - **Iterate until condition** (poll until ready): Standard Loop conceptually; but in Zeebe with limited support, use explicit BPMN loop (Gateway + back-edge).
  - **Collection + early stop**: Multi-Instance + completionCondition.

  For "iterate list AND completion condition": Multi-Instance is the canonical answer. Standard Loop doesn't iterate elements; it loops the same activity.

- **Option b) — Wrong.** Distinct.

- **Option c) — Wrong.** That's MI.

- **Option d) — Wrong.** That's Standard Loop.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. MI for collections / counts; Standard Loop for while-condition; "iterate list + completion" = MI.
- **b) 1/10** — wrong.
- **c) 2/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Multi-Instance with inputCollection + completionCondition for "iterate list with completion check"; Standard Loop is for while-loop semantics (limited Zeebe coverage).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "iterate list AND completion condition." Looping construct choice.

**Въпросът → Solution Framing.** "MI vs Standard Loop" — изпитва се knowledge на looping primitives.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че MI е collection / count iteration, че Standard Loop е while-condition, че choose by semantic. Това е знание за looping construct selection.

---

# Section 2 — Configuring Processes (Questions 10-22)

> Weight 22% • Topics: Job activation timeout exceeded, formDefinition attribute, autoComplete modes, completionCondition evaluation timing, document versioning, IDP formats, Element Template properties, AI Agent token usage, error vs failure, Form-aware Timer Boundary, multi-key correlation, subprocess local visibility, variable coercion.

---

## Question 10: Configuring Processes (Weighting: 22%)

**Scenario:** A worker activates a job with 5-min activation timeout. The worker is slow — takes 6 minutes. The team wonders what happens at the 5-minute mark — does Zeebe cancel? Re-activate?

**What happens when job activation timeout is exceeded?**

- **a)** **At timeout, Zeebe makes the job re-activatable**. The original worker still holds the job conceptually (might still be processing), but the broker considers the activation expired; another worker (or the same one re-polling) can activate it again. **Critical consequence**: **duplicate execution risk** — original worker may complete the job successfully later, while a second activation also processes it. **Mitigations**:
  - **Increase activation timeout** to match worst-case processing time (with safety margin).
  - **Idempotent worker code**: handle duplicate execution safely (per Set 6 / 10 discussions).
  - **Worker reports back before timeout**: complete or fail before activation expires.
  
  Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Original worker's completion is rejected — partial; depends on timing. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Zeebe forcefully cancels the worker — wrong; broker can't cancel external worker. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Job goes to error state — partial; depends on what worker does. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Job activation timeout semantics in Zeebe:

  **Activation timeout**: when a worker activates a job, Zeebe records the activation with a deadline. If the worker doesn't complete / fail the job by the deadline, the broker considers the activation expired.

  **At expiration**:
  - Broker marks the job as available for re-activation.
  - **Original worker still holds the job conceptually**: it may complete it later if it eventually finishes. The broker can't forcibly cancel an external process.
  - **Another worker (or same after re-polling)**: can activate the job again.

  **Duplicate execution risk**:
  - Original worker: still processing → eventually calls `complete()`.
  - Second worker: activated after timeout → starts processing the same job.
  - Both may report results; broker's behavior depends on which arrives first.

  **Symptoms**:
  - Same Service Task processed twice; downstream may see duplicate effects.
  - For non-idempotent workers: bugs, duplicates, charges twice, etc.

  **Mitigations**:
  - **Right-size timeout**: set per-task activation timeout based on expected worst-case processing time. Default 5 min often fine for fast tasks; longer for slow API calls.
  - **Worker idempotency**: design worker code so duplicate execution is safe (idempotency keys passed to downstream APIs, checks for already-processed state).
  - **Monitor for timeouts**: alert when jobs frequently exceed activation timeout — indicates either sluggish workers or under-sized timeout.

  **Combined with retries**:
  - Activation timeout is independent of retries.
  - Retries = how many times to re-activate on worker-reported failure.
  - Activation timeout = how long broker waits for worker to respond before re-activating regardless of failure / success.

- **Option b) — Partial.** Depends on timing.

- **Option c) — Wrong.** Broker can't cancel external worker.

- **Option d) — Partial.** Depends.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Timeout = re-activatable; duplicate execution risk; mitigate via right-size + idempotency.
- **b) 4/10** — partial.
- **c) 1/10** — wrong.
- **d) 3/10** — partial.

**Correct Answer:** Zeebe makes the job re-activatable at timeout; duplicate execution risk; mitigate via right-sized timeout + worker idempotency.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "activation timeout exceeded." Timeout behavior.

**Въпросът → Solution Framing.** "What happens at timeout" — изпитва се knowledge на activation lifecycle.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че timeout → re-activatable, че duplicate risk, че idempotency + right-sized timeout mitigate. Това е знание за timeout semantics.

---

## Question 11: Configuring Processes (Weighting: 22%)

**Scenario:** A User Task has both `formId` (modern Camunda Form reference) and `zeebe:formDefinition formId` extension. The team wonders if these are the same or different.

**Are User Task `formId` attribute and `<zeebe:formDefinition formId="...">` extension the same?**

- **a)** **`<zeebe:formDefinition formId="...">` extension element is the modern Camunda 8 convention** for referencing deployed Camunda Forms. It's the Zeebe-specific extension under `<bpmn:extensionElements>`. A bare `formId` attribute directly on `<bpmn:userTask>` (without the extension) isn't standard Zeebe configuration. **Modern pattern**:
  ```xml
  <bpmn:userTask id="UserTask_review">
    <bpmn:extensionElements>
      <zeebe:formDefinition formId="review-form-v1" />
    </bpmn:extensionElements>
  </bpmn:userTask>
  ```
  Verify your Camunda 8 / Modeler version's exact XML schema. Documentation: [User Tasks Forms](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** Same thing — partial; depends on version. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** Both should be set — wrong; one or the other. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** `formId` not used — partial. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 form binding uses Zeebe extension elements:

  **Modern pattern** (Zeebe extension):
  ```xml
  <bpmn:userTask id="UserTask_review">
    <bpmn:extensionElements>
      <zeebe:formDefinition formId="review-form-v1" />
    </bpmn:extensionElements>
  </bpmn:userTask>
  ```

  The `formId` is a child attribute of `<zeebe:formDefinition>` — the Zeebe extension that tells Tasklist to render the referenced Camunda Form.

  **Legacy / external form pattern**:
  ```xml
  <bpmn:userTask id="UserTask_review">
    <bpmn:extensionElements>
      <zeebe:formDefinition formKey="https://external.example.com/form.html" />
    </bpmn:extensionElements>
  </bpmn:userTask>
  ```

  The `formKey` attribute (or alternate form of `formDefinition`) for external / legacy forms.

  **Direct BPMN attribute `formKey` on userTask** (legacy / Camunda 7):
  - Some older Camunda versions / standards put `camunda:formKey` directly as an attribute on `<bpmn:userTask>`.
  - Not the modern Camunda 8 convention.

  **In Web Modeler property panel**:
  - Modelers see options like "Type: Camunda Form (linked)" → sets `<zeebe:formDefinition formId>`.
  - Or "Type: External form" → sets `<zeebe:formDefinition formKey>`.
  - The XML is generated based on these UI choices.

  Verify your Camunda 8 / Zeebe version for the exact extension schema; UI handles the XML generation typically.

- **Option b) — Partial.** Modern is the extension form.

- **Option c) — Wrong.** One or the other.

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. <zeebe:formDefinition formId> е modern Camunda 8 convention; direct attribute legacy.
- **b) 5/10** — partial.
- **c) 2/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** `<zeebe:formDefinition formId="...">` extension is the modern Camunda 8 form binding convention.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "formId attribute vs zeebe:formDefinition." Form binding syntax.

**Въпросът → Solution Framing.** "Same or different" — изпитва се knowledge на Zeebe extension schema.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че zeebe:formDefinition е modern extension, че formId is child attribute, че direct on userTask е legacy. Това е знание за form binding XML structure.

---

## Question 12: Configuring Processes (Weighting: 22%)

**Scenario:** A team configures a Service Task with `autoComplete = true` (Spring Zeebe annotation). They wonder what happens **if the handler method throws an exception** — does autoComplete still trigger?

**`autoComplete = true` behaviour on exception in the handler?**

- **a)** **autoComplete only applies on successful method return** — if the handler throws an exception, the SDK catches it (per Set 7 Q42 discussion) and calls `job.fail()` (or similar), NOT `job.complete()`. autoComplete is for the happy path; exceptions trigger failure handling. **No silent success on exception**: this would be a bug-hiding anti-pattern; SDK errs on the side of marking job failed. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** autoComplete fires regardless — wrong; only on success. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** Exception is suppressed silently — wrong; would hide bugs. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** autoComplete must be false when exceptions possible — overstates; SDK handles. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Spring Zeebe's `autoComplete` semantics:

  **`autoComplete = true`** (default, the convenient mode):
  - Handler method runs.
  - **If returns normally** (no exception thrown): SDK calls `job.complete(returnValue)` automatically. Variables from the return value land in process scope.
  - **If exception thrown**: SDK catches; calls `job.fail()` (default) or applies error mapping if configured. The job's retries decrement; if 0, Incident.

  **`autoComplete = false`** (explicit control):
  - Handler method takes responsibility for calling `job.complete()` / `job.fail()` / `job.error()`.
  - Used for async patterns where the handler returns immediately but actual work / completion happens later.

  **Exception handling with autoComplete = true**:
  - **Uncaught Java exception**: → job.fail.
  - **`ZeebeBpmnError` (or similar custom BPMN error exception)**: → job.error with the BPMN errorCode. Triggers Error Boundary.
  - **Standard runtime exceptions**: → job.fail (generic failure).

  **Best practices**:
  - **Throw `ZeebeBpmnError` for business errors**: maps to BPMN errors with errorCode; routes via Error Boundary.
  - **Let unexpected exceptions propagate**: SDK fails the job; Incident surfaces; ops investigates.
  - **Don't catch exceptions to hide them**: defeats observability.

- **Option b) — Wrong.** Only on success.

- **Option c) — Wrong.** Not silenced.

- **Option d) — Overstates.** SDK handles.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. autoComplete only on success; exceptions → fail / error.
- **b) 2/10** — wrong.
- **c) 1/10** — wrong.
- **d) 5/10** — overstates.

**Correct Answer:** autoComplete=true triggers job.complete only on successful return; exceptions trigger job.fail (or job.error for BPMN errors).

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "autoComplete = true exception." autoComplete + exception.

**Въпросът → Solution Framing.** "Behaviour on exception" — изпитва се knowledge на autoComplete semantic.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че autoComplete е happy-path, че exceptions trigger fail/error, че SDK handles cleanly. Това е знание за autoComplete semantic.

---

## Question 13: Configuring Processes (Weighting: 22%)

**Scenario:** A Sequential MI Subprocess has `completionCondition`. The team wonders **when exactly** the engine evaluates the condition — after each iteration? At specific points?

**When is `completionCondition` evaluated during MI execution?**

- **a)** **Evaluated after each inner instance completes** — the engine updates state (outputCollection accumulates, completion counters increment), then re-evaluates completionCondition. If true → MI completes (remaining instances cancelled or no more started for sequential). If false → next iteration starts (or current parallel instances continue). **Not evaluated mid-iteration**: the condition can't preempt a currently-running inner instance based on external changes (other than the iteration's own completion). Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Continuously — wrong; per-instance-completion. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Only at MI start — wrong; per-iteration. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** At MI end only — wrong; per-iteration. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** MI completionCondition evaluation timing:

  **Per-iteration-completion**:
  - After each inner instance completes (success or failure), state updates:
    - `numberOfCompletedInstances` increments.
    - `numberOfActiveInstances` decrements.
    - `outputCollection` (if configured) updated with this instance's result.
  - Engine re-evaluates completionCondition with the new state.
  - **If true**: MI completes.
    - **Sequential MI**: no more inner instances will start.
    - **Parallel MI**: remaining active instances are cancelled.
  - **If false**: iteration continues.

  **Sequential MI semantics** (with completionCondition):
  - Instance N completes → check condition → if true, stop (no instance N+1).
  - Useful for "process items until condition met."

  **Parallel MI semantics** (with completionCondition):
  - All instances spawn at start; each completes asynchronously.
  - As each completes, condition re-evaluated.
  - On first true: remaining instances cancelled; MI completes.
  - Useful for "first N successes wins" patterns.

  **Important**: completionCondition can't preempt a running instance based on external state (e.g., another process publishing a Message). It's only evaluated at instance-completion boundaries.

  **For external-triggered MI termination**: use Boundary Event on MI subprocess (e.g., Message Boundary listening for cancel signal).

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. completionCondition evaluated after each inner instance completes; not continuously.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Evaluated after each inner instance completes; re-evaluates with updated state; if true, MI completes (remaining instances cancelled in Parallel).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "completionCondition evaluated when." Evaluation timing.

**Въпросът → Solution Framing.** "When evaluated" — изпитва се knowledge на MI evaluation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че per-iteration-completion evaluation, че external-trigger needs Boundary, че state updates between evaluations. Това е знание за MI evaluation timing.

---

## Question 14: Configuring Processes (Weighting: 22%)

**Scenario:** A team's contracts process versions documents — the same contract might exist as v1 (original) and v2 (amended). They wonder if Document Handling supports document versioning.

**Does Document Handling support document versioning?**

- **a)** **Document Handling's primary abstraction is per-document**; **versioning is a higher-level concern** typically handled at the application / business level:
  - **Camunda Documents API**: each upload creates a new document with a unique ID; not built-in versioning per se.
  - **Application-level versioning**: assign a logical "version" via metadata or naming convention; track versions in process variables or external DB.
  - **For true version control of binary documents**: external system (DMS, S3 with versioning enabled, Git LFS for source docs) typically suited.
  
  Verify if specific Camunda 8 versions add versioning features; the spec discusses document references + metadata, not built-in versioning. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **b)** Built-in versioning — partial; verify per version. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **c)** No versioning ever — partial; achievable via app-level. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **d)** Use Git for binary versioning — partial; Git LFS for source docs is one option. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Document Handling design vs document versioning:

  **Camunda Documents API**:
  - **Upload**: creates a document with unique ID.
  - **Reference**: the ID is passed around via process variables.
  - **Metadata**: optional metadata attached at upload (custom fields, business context).
  - **Lifecycle**: TTL-based expiry or explicit DELETE.

  **Built-in versioning**: typically NOT a primary feature — verify your Camunda 8 version's specific capabilities. Documents are individual entities.

  **Application-level versioning patterns**:

  **Pattern 1: Metadata-based**:
  - Upload v1 with metadata `{"contractId": "C-100", "version": 1}`.
  - Upload v2 with metadata `{"contractId": "C-100", "version": 2}`.
  - Query by contractId; sort by version.
  - Two documents in storage; logically a version chain.

  **Pattern 2: External DMS (Document Management System)**:
  - Use a dedicated DMS (SharePoint, Alfresco, etc.) for versioned documents.
  - Camunda Document Handling references DMS URLs / IDs.
  - DMS handles versioning, audit, retention, locking, etc.

  **Pattern 3: S3 with versioning**:
  - S3 bucket with versioning enabled.
  - Each upload to same key creates a new version automatically.
  - Camunda references S3 keys; client retrieves specific versions if needed.

  **Pattern 4: External DB tracking**:
  - Process variables store document IDs per version.
  - External database tracks version history.
  - Camunda holds references; DB is source of truth for version chain.

  Pick based on requirements (collaboration features, retention, compliance, etc.).

- **Option b) — Partial.** Verify.

- **Option c) — Partial.** Achievable via app.

- **Option d) — Partial.** One option.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Camunda Document Handling е per-document; versioning typically app-level / external DMS / S3.
- **b) 5/10** — partial.
- **c) 5/10** — partial.
- **d) 5/10** — partial.

**Correct Answer:** Built-in versioning typically not primary; achieve via metadata + application logic OR external DMS / S3 with versioning.

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/document-handling/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "document versioning v1 v2." Versioning question.

**Въпросът → Solution Framing.** "Supports document versioning" — изпитва се knowledge на Document Handling scope.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda Documents е per-document, че app-level patterns + external DMS / S3 versioning, че metadata enables logical chains. Това е знание за document version management.

---

## Question 15: Configuring Processes (Weighting: 22%)

**Scenario:** A team's IDP handles **invoices in PDF format** primarily. Customers occasionally send invoices as **images (PNG / JPG)** or **Word documents (DOCX)**. The team wonders which formats IDP supports.

**Which document formats does Camunda IDP support?**

- **a)** **Verify per Camunda IDP version + underlying engine**: typically supports common business document formats:
  - **PDF**: most common; extraction engines mature.
  - **Images** (PNG, JPG, TIFF): OCR-based extraction; quality depends on resolution / clarity.
  - **Word / DOCX**: text + structure extraction.
  - **Email** (MSG / EML): some IDP versions support email parsing.
  
  **Pre-processing options**: convert non-supported formats (e.g., HEIC images → JPG) before IDP. Quality of extraction varies by format / source quality (scanned vs digital). Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/idp-applications/)

- **b)** PDF only — partial; multiple formats supported. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **c)** Any format — overstates; some need conversion. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **d)** IDP doesn't support documents — wrong; that's its purpose. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda IDP's supported formats depend on:
  - **Camunda 8 version**: IDP features evolve.
  - **Underlying extraction engine**: IDP may use specific OCR / ML services with their own format support.

  **Typically supported**:
  - **PDF**: digital (text-based) and scanned (image-based with OCR).
  - **Images**: PNG, JPG, TIFF, etc. for scanned documents.
  - **Word / DOCX**: text + tables.
  - **Email** (MSG, EML): in some versions.
  - **Plain text**: structured / unstructured.

  **Less commonly supported (may need conversion)**:
  - **HEIC** (Apple image): convert to JPG first.
  - **Legacy formats** (DOC, very old): convert to modern equivalents.
  - **Archives** (ZIP with multiple docs): extract individual files first.

  **Pre-processing pipeline**:
  - **Convert** non-supported to supported formats.
  - **Pre-OCR optimisation**: improve image quality (rotate, de-skew, contrast) for better extraction.
  - **Split multi-page documents**: if IDP needs per-page processing.

  **Quality factors**:
  - **Digital documents** (PDF with embedded text): high extraction quality.
  - **Scanned documents** (image-PDFs, photos): OCR-dependent; quality varies with resolution / clarity / language.
  - **Handwriting**: typically harder; some engines support; quality variable.

  Verify your Camunda IDP version's exact format support + best practices for input quality.

- **Option b) — Partial.** Multiple formats.

- **Option c) — Overstates.** Some need conversion.

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. PDF + images + Word / DOCX + email typically; pre-process non-supported.
- **b) 5/10** — partial.
- **c) 4/10** — overstates.
- **d) 1/10** — wrong.

**Correct Answer:** Verify per IDP version; typically PDF + images (OCR) + Word + email; pre-process non-supported formats.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/idp/idp-applications/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "PDF + images + DOCX". IDP format support.

**Въпросът → Solution Framing.** "Formats supported" — изпитва се knowledge на IDP capabilities.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че multiple formats typical, че pre-processing for non-supported, че quality depends on input. Това е знание за IDP format handling.

---

## Question 16: Configuring Processes (Weighting: 22%)

**Scenario:** An Element Template has a property with `value: "default-channel"` AND `binding: { type: "zeebe:input", name: "channel" }`. The team wonders what `value` does vs `binding`.

**Property `value` vs `binding` in Element Template?**

- **a)** **Different concepts**:
  - **`value`**: the **default value** for this property if the modeler doesn't override. Pre-populates the property's input field. Modeler can change.
  - **`binding`**: declares **where this property's value goes** in the BPMN element. E.g., `zeebe:input` writes to an Input Mapping; `zeebe:taskHeader` writes to a Task Header; `property` writes to the BPMN element's own attribute.
  
  Together: `value` sets the default; `binding` directs where the value ends up in BPMN. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **b)** Same thing — wrong; distinct. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **c)** `value` is read-only — partial. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **d)** Only `binding` needed — wrong; value provides default UX. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Element Template property schema:

  **`value` (default value)**:
  - Optional default pre-populated in Web Modeler property panel when the template is applied.
  - Modeler can change to a different value.
  - **Use cases**: sensible defaults that most modelers will keep; example values for new users.
  - Example: `"value": "general"` for a Slack channel property defaults to `general` channel.

  **`binding` (where value goes)**:
  - **Required**: declares the destination of the property's value in BPMN.
  - **Types**:
    - **`zeebe:input`**: writes to a `<zeebe:input>` mapping. The value becomes a task-local variable named per `binding.name`.
    - **`zeebe:output`**: similarly for Output Mapping.
    - **`zeebe:taskHeader`**: writes to a Task Header with key per `binding.key`.
    - **`zeebe:property`**: writes to a Zeebe-extension property on the element.
    - **`property`**: writes to a BPMN element's own attribute (e.g., `name`).
  - Determines how the worker / engine sees the value at runtime.

  **Example combined**:
  ```json
  {
    "label": "Slack Channel",
    "type": "String",
    "value": "general",
    "binding": { "type": "zeebe:input", "name": "channel" }
  }
  ```
  - Modeler sees a property "Slack Channel" with default `"general"`.
  - At runtime, the value (whatever the modeler set) becomes a local task variable `channel` via Input Mapping.
  - The worker reads `channel` from job variables.

  **In BPMN XML** (resulting):
  ```xml
  <zeebe:ioMapping>
    <zeebe:input source="general" target="channel"/>
  </zeebe:ioMapping>
  ```

- **Option b) — Wrong.** Distinct.

- **Option c) — Partial.** value is default, editable.

- **Option d) — Wrong.** value provides UX.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. value = default; binding = destination (zeebe:input / taskHeader / property).
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 2/10** — wrong.

**Correct Answer:** value is the default; binding declares the destination (zeebe:input mapping, taskHeader, etc.). Different concepts.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "value vs binding." Property schema parts.

**Въпросът → Solution Framing.** "Difference" — изпитва се knowledge на Element Template property schema.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че value е default, че binding е destination, че binding types include input / output / taskHeader / property. Това е знание за Element Template structure.

---

## Question 17: Configuring Processes (Weighting: 22%)

**Scenario:** A team uses AI Agent Connector extensively. They wonder about **token usage tracking** — how to monitor LLM costs, set budgets, alert on overruns.

**How might token usage / costs be tracked for AI Agent Connector usage?**

- **a)** **Combination of approaches**:
  - **LLM provider's billing dashboard**: each provider (OpenAI, Anthropic, etc.) has usage dashboards + alerts. Set budget alerts at the provider level.
  - **Connector-emitted metrics**: custom Connector code logs token counts per invocation (LLMs return `usage` field in response); aggregate metrics in your observability stack.
  - **Per-process tracking**: store token counts in process variables for downstream analysis.
  - **Budget enforcement at process level**: BPMN logic checks remaining budget before invoking; if low, route to manual / cheaper path.
  
  Combine for visibility + control. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/) + LLM provider docs.

- **b)** No tracking possible — wrong; LLM responses include usage. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **c)** Only LLM provider tracks — partial; multiple layers. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **d)** Camunda auto-budgets — partial; depends on version. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** LLM token usage tracking benefits from multi-layer visibility + control:

  **Layer 1: LLM provider dashboards**:
  - OpenAI, Anthropic, etc., provide:
    - Per-day / per-month usage charts.
    - Cost breakdowns by model.
    - Budget alerts (email when approaching budget).
    - API key-level tracking (different keys for different teams / projects).
  - **Setup**: provision keys; set budget alerts; review periodically.

  **Layer 2: Connector-emitted metrics**:
  - LLM responses typically include a `usage` field: `{prompt_tokens, completion_tokens, total_tokens}`.
  - AI Agent Connector code logs these per invocation.
  - Aggregate in Prometheus / Grafana / Datadog:
    - Counter: total tokens used per model / per process.
    - Cost calculation: tokens × per-token price.
    - Per-process attribution: which BPMN processes are most expensive.

  **Layer 3: Per-process variables**:
  - Store token counts in process variables (e.g., `=outputs: append(outputs, {timestamp: now(), tokens: response.usage.total_tokens})`).
  - Downstream analysis: query Operate for high-cost instances.

  **Layer 4: Budget enforcement at process level**:
  - Track running cost per process / customer / tenant.
  - Before invoking AI Agent: check budget; if low, route to alternative.
  - Hard caps: terminate processes that exceed budget.

  **Best practices**:
  - **Estimate before deploying**: load-test to predict token usage / costs.
  - **Cap maxTokens per call**: prevent runaway responses.
  - **Use cheaper models for simpler tasks**: route to right model based on complexity.
  - **Monitor + alert**: automated thresholds reduce surprise.

- **Option b) — Wrong.** Trackable.

- **Option c) — Partial.** Multiple layers.

- **Option d) — Partial.** Verify per version.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multi-layer: LLM dashboards + Connector metrics + per-process vars + BPMN budget enforcement.
- **b) 1/10** — wrong.
- **c) 5/10** — partial.
- **d) 5/10** — partial.

**Correct Answer:** Combine LLM provider dashboards + Connector-emitted metrics + per-process variables + BPMN budget enforcement.

**Official Documentation Link:** https://docs.camunda.io/docs/components/agentic-orchestration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "token usage tracking, costs, budgets, alerts." Cost management.

**Въпросът → Solution Framing.** "How tracked" — изпитва се knowledge на multi-layer cost visibility.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че LLM dashboards + Connector metrics + variables + BPMN enforcement combine, че `usage` field per call. Това е знание за AI cost management.

---

## Question 18: Configuring Processes (Weighting: 22%)

**Scenario:** A worker uses `job.fail()` vs `job.error()` to report problems. The team wonders the difference.

**`job.fail()` vs `job.error()` in worker SDKs — when to use which?**

- **a)** **Different purposes**:
  - **`job.fail()`** (or `job.fail({errorMessage})`): reports a **generic failure** — retries decrement; if 0, Incident appears in Operate. Use for: transient errors, unexpected exceptions, technical failures. No errorCode for BPMN-level routing.
  - **`job.error({errorCode, errorMessage})`**: reports a **BPMN error** with a specific errorCode — Zeebe propagates the error; Error Boundary Events with matching errorCode catch it. Use for: business errors with defined error codes ("INVALID_DATA", "FRAUD_DETECTED"), routing to specific BPMN handlers.
  
  Choose by: is this a technical failure to retry (fail), or a business outcome to route (error)? Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/) + [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **b)** Identical — wrong. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** fail() always preferred — partial. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** error() always preferred — partial. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** SDK error reporting APIs:

  **`job.fail(errorMessage)`** (technical failure):
  - **Semantic**: "this job failed; retry if applicable."
  - **Engine action**: decrements retries; if > 0, job re-activates (potentially after backoff); if 0, Incident with errorMessage.
  - **No BPMN routing**: doesn't trigger Error Boundary Events.
  - **Use for**:
    - Transient errors (network blip, partner timeout).
    - Unexpected exceptions.
    - "Retry might help."
    - System / technical issues.

  **`job.error({errorCode, errorMessage})`** (BPMN business error):
  - **Semantic**: "a specific business error occurred."
  - **Engine action**: propagates BPMN error with errorCode; engine searches scope hierarchy for matching Error Boundary / Event Subprocess Error Start.
  - **BPMN routing**: triggers Error Boundary Events with matching errorCode.
  - **Use for**:
    - Business outcomes routed to specific paths (e.g., "INVALID_VAT" → manual review path).
    - Known error scenarios with defined recovery.
    - Domain-specific failure modes.

  **Decision matrix**:
  | Scenario | API |
  |---|---|
  | Network timeout (retryable) | `job.fail` |
  | Partner returns 500 (retryable) | `job.fail` |
  | Partner returns 400 with "invalid VAT" | `job.error({errorCode: "INVALID_VAT"})` |
  | Customer not found in DB (business) | `job.error({errorCode: "CUSTOMER_NOT_FOUND"})` |
  | Unexpected null pointer (bug) | `job.fail` (or unhandled exception → SDK fails) |
  | Insufficient funds (business) | `job.error({errorCode: "INSUFFICIENT_FUNDS"})` |

  **Combined patterns**: same worker may use both — `job.fail` for retryables, `job.error` for known business errors.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. fail() = technical retry; error() = BPMN business error with code; use per intent.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 4/10** — partial.

**Correct Answer:** fail() for technical failures (retry-eligible); error() for BPMN business errors with errorCode (Error Boundary routing).

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "job.fail() vs job.error()." Failure / error API distinction.

**Въпросът → Solution Framing.** "When to use which" — изпитва се knowledge на SDK error semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че fail() е retry-eligible technical, че error() е BPMN-routed business, че pick per intent. Това е знание за SDK error reporting.

---

## Question 19: Configuring Processes (Weighting: 22%)

**Scenario:** A User Task has a Camunda Form. The team wants a Timer Boundary firing 24 hours after the **form first becomes visible to the assignee** — not when the task is created (which may be before assignment).

**When does Timer Boundary on User Task start its clock?**

- **a)** **The Timer Boundary clock starts when the host User Task activates** — i.e., when the task is created and offered to candidates / assignee. Not specifically when the assignee "first views" the form (which is a UI-level event, not BPMN-level). **If "from view" is the requirement**: model with finer granularity — track view event externally (Tasklist customisation or analytics) and trigger BPMN logic from there; or accept "from activation" as a reasonable proxy. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/) + [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** From assignee claim — partial; specific events not native. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** Configurable — partial. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **d)** Never starts — wrong. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Timer Boundary lifecycle on User Task:

  **Timer starts**: at host User Task **activation** — the moment the task is created in Tasklist and offered to assignees / candidates.

  **Doesn't depend on**:
  - **Assignee claim**: task being claimed by a specific user doesn't restart the timer.
  - **First view**: when the assignee opens the form to view — not tracked at BPMN level.
  - **Form interactions**: editing fields, etc., don't affect timer.

  **Practical implication**:
  - Tasks waiting in queue (assigned but not yet viewed) consume timer time.
  - For SLA "from task offered to candidates," current behavior fits.
  - For SLA "from assignee opens task," would need finer modelling.

  **Workarounds for "from view" SLA**:

  **Pattern 1: Acknowledgement step**:
  - First User Task: minimal "Acknowledge receipt" step (assignee claims + completes quickly).
  - Second User Task: actual work. Timer Boundary here starts from acknowledgement.

  **Pattern 2: External tracking**:
  - Tasklist customisation / analytics tracks view events.
  - Publishes a Message to Camunda; process state updates.
  - Subsequent Timer / Message Catch references the view event.

  **Pattern 3: Accept activation as proxy**:
  - "Time from offered" ≈ "time from view" in practice (assuming reasonable response times).
  - Simpler model; one less step.

  Choose based on strictness of SLA semantic. For most "respond in 24h" semantics, the activation-based timer is acceptable.

- **Option b) — Partial.** Specific events not native.

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Timer starts at host activation; "from view" requires workaround patterns.
- **b) 4/10** — partial.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Timer starts at User Task activation (when task is created / offered); "from view" is not a native BPMN event; use workaround patterns if needed.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Timer 24h from form first visible." Timer start question.

**Въпросът → Solution Framing.** "When clock starts" — изпитва се knowledge на Timer Boundary timing.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Timer starts at host activation, че "from view" not native, че workaround patterns possible. Това е знание за Timer Boundary timing.

---

## Question 20: Configuring Processes (Weighting: 22%)

**Scenario:** A Message Catch Event needs to correlate based on **two values** — `customerId` AND `orderId` — for uniqueness. Each individually may not be unique (one customer has multiple orders, one order ID could be reused historically).

**Can Message correlation use multiple correlation keys?**

- **a)** **Compose multiple values into one correlation key string** via FEEL: `=customerId + "-" + orderId`. The single correlation key value is the composite; uniqueness via composition. Publisher and subscriber use the same composition. Native "multiple correlation keys" isn't typically a BPMN/Zeebe feature; composition is the standard pattern. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **b)** Yes, list of keys — wrong; single key. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **c)** Use two separate Message Catch Events — workaround; composition simpler. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **d)** Can't have composite — wrong; FEEL composes. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Single correlation key per message; for composite uniqueness, compose values into one string:

  **Pattern**:
  - **Correlation expression**: `=customerId + "-" + orderId` evaluates to a composite string like `"C-100-ORD-5678"`.
  - **Publisher**: must send Message with `correlationKey: "C-100-ORD-5678"` (using same composition logic).
  - **Camunda**: matches the composite string; correlates 1-to-1 to the matching subscription.

  **Composition patterns**:
  - **Hyphen-separated**: `customerId + "-" + orderId` — simple, readable.
  - **JSON-like**: `customerId + ":" + orderId` — variation; pick consistent format.
  - **Hash**: `=hash(customerId + orderId)` if you want fixed-length / opaque keys.

  **Coordination**:
  - Publisher and subscriber must agree on composition format.
  - Document the format in a shared spec.
  - Test edge cases: special characters, empty values, etc.

  **Edge cases**:
  - **Empty value in either part**: `"-ORD-5678"` if customerId is empty → may match unintended subscriptions. Use defensive FEEL: `=if customerId != null and orderId != null then customerId + "-" + orderId else null` (null correlation key fails activation per Set 5 Q20).

  **Alternative**: hash composite values for fixed length / collision-resistance, but adds opacity.

  **Native "multi-key" feature**: not a standard BPMN/Zeebe pattern; composition is the canonical approach.

- **Option b) — Wrong.** Single key.

- **Option c) — Workaround.** Composition simpler.

- **Option d) — Wrong.** FEEL composes.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Compose composite via FEEL: customerId + "-" + orderId; single correlation key.
- **b) 2/10** — wrong.
- **c) 4/10** — workaround.
- **d) 1/10** — wrong.

**Correct Answer:** Compose multiple values into one correlation key via FEEL (e.g., `=customerId + "-" + orderId`).

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/messages/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "two correlation values customerId AND orderId." Composite correlation key.

**Въпросът → Solution Framing.** "Multiple correlation keys" — изпитва се knowledge на correlation key design.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че single key per message, че composition в FEEL pattern, че publisher/subscriber must agree on format. Това е знание за correlation composition.

---

## Question 21: Configuring Processes (Weighting: 22%)

**Scenario:** An Embedded Subprocess creates a local variable `tempData` via Input Mapping. Another inner Service Task references it. The team wonders if the second task can read `tempData`.

**Are local variables created in a subprocess scope visible to its inner activities?**

- **a)** **Yes — local variables created at the subprocess scope are visible to inner activities** within that subprocess. The scope hierarchy: subprocess scope → inner activities. Variables created in the outer scope (subprocess Input Mapping, or process root) are visible to descendants. The reverse isn't true: variables created strictly inside one inner activity (local to that task only) aren't visible to siblings unless propagated up. Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

- **b)** Not visible — wrong; scope inheritance. Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

- **c)** Visible only to first inner task — wrong; all inner. Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

- **d)** Subprocess can't create local variables — wrong. Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Variable scope hierarchy in Camunda 8:

  **Scope levels** (outermost to innermost):
  1. **Process root**: variables visible everywhere.
  2. **Subprocess scope**: variables visible to all inner activities of this subprocess.
  3. **Activity-local scope** (e.g., Input Mapping on a Service Task): visible only to that activity.

  **Visibility rule**: **inner can read outer**.
  - Inner activity reads: own scope → enclosing subprocess scope → process root → ... up the chain.
  - First match wins (shadowing: if inner has same name, it shadows outer).

  **Visibility rule**: **outer cannot read inner** (without propagation).
  - Outer scope doesn't see inner activity's locals unless they're propagated via Output Mapping (writing to outer scope).

  **For the scenario**:
  - Subprocess Input Mapping creates `tempData` at the subprocess scope.
  - Inner Service Tasks: can read `tempData` (visible via scope inheritance).
  - Can each inner task modify `tempData`? Yes, via their own Output Mapping back to subprocess scope (where the variable lives).

  **Practical pattern**:
  - **Set common context at subprocess scope**: variables computed once at subprocess Input Mapping, used by multiple inner activities. DRY.
  - **Per-activity locals**: each inner task has its own Input Mapping for activity-specific variables; these stay local.

  Use scopes to control visibility — outer for shared context, inner for activity-specific.

- **Option b) — Wrong.** Visible via inheritance.

- **Option c) — Wrong.** All inner.

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Subprocess scope variables visible to all inner; scope inheritance inner reads outer.
- **b) 1/10** — wrong.
- **c) 2/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Yes — subprocess-scope variables visible to all inner activities via scope inheritance; inner can read outer, not vice versa.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "local variable in subprocess scope visible to inner." Scope inheritance.

**Въпросът → Solution Framing.** "Visibility to inner activities" — изпитва се knowledge на scope hierarchy.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че inner reads outer, че scope hierarchy enables inheritance, че outer doesn't see inner without propagation. Това е знание за scope visibility.

---

## Question 22: Configuring Processes (Weighting: 22%)

**Scenario:** An Input Mapping has `Source: =amountStr`, `Target: amount`. `amountStr` is `"123.45"` (string from form input). The team wonders if Zeebe auto-converts to number.

**Does Input Mapping auto-coerce string to number when the target expects number?**

- **a)** **No — FEEL doesn't auto-coerce types**. The Input Mapping evaluates the source expression as-is; if `amountStr` is a string, the target `amount` becomes a string. **Explicit conversion required**: `=number(amountStr)` parses the string to a number; target becomes number. Without explicit conversion, downstream arithmetic / numeric comparisons on the target would fail. **General principle**: FEEL is type-strict; convert explicitly via `number(s)`, `string(n)`, `date(s)`, etc. Documentation: [FEEL conversion](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-conversion/)

- **b)** Yes — auto-coercion — wrong; type-strict. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Depends on target type declaration — partial; variables aren't typed in BPMN. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Always fails with type error — wrong; FEEL accepts strings as values; just doesn't coerce. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's type-strict semantics:

  **No auto-coercion**:
  - `"123" + 5` → type error (can't add string and number).
  - `number("123") + 5` → 128 (explicit conversion).
  - `"123" = 123` → false (string vs number; never equal).

  **Input Mapping with type mismatch**:
  - `Source: =amountStr, Target: amount` where amountStr = "123.45"
  - Result: `amount` = "123.45" (still a string in process scope).
  - Downstream `=amount * 100` would fail (type mismatch).

  **Explicit conversion**:
  - `Source: =number(amountStr), Target: amount`
  - Result: `amount` = 123.45 (number).
  - Downstream `=amount * 100` works (= 12345).

  **Common conversions**:
  - **String → Number**: `=number(s)`.
  - **String → Date**: `=date(s)` (ISO 8601 format).
  - **String → Boolean**: no direct function; use comparison `=lower case(s) = "true"`.
  - **Number → String**: `=string(n)`.
  - **Date → String**: `=string(d)` (returns ISO 8601 representation).

  **When parsing might fail**:
  - `=number("abc")` returns null (per Set 12 Q48 discussion).
  - Defensive: validate before converting.

  **Form data note**:
  - Number Input components in Camunda Forms typically write as native numbers, not strings.
  - Text Input writes as strings.
  - Check the form field type to know what the source is.

- **Option b) — Wrong.** Type-strict.

- **Option c) — Partial.** Variables not BPMN-typed.

- **Option d) — Wrong.** Doesn't fail; just preserves type.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. No auto-coercion; explicit conversion via number() / string() / date() etc.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 2/10** — wrong.

**Correct Answer:** No — FEEL is type-strict; use explicit conversion (`number(s)`, `string(n)`, `date(s)`).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-conversion/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "string to number coercion." Type coercion question.

**Въпросът → Solution Framing.** "Auto-coerce" — изпитва се FEEL type strictness.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че no auto-coercion, че explicit conversion functions, че form data type matters. Това е знание за FEEL type system.

---

# Section 3 — DMN (Questions 23-29)

> Weight 11% • Topics: PRIORITY hit policy detail, FEEL invocation from DMN cell, annotation column purpose, DMN column input/output types, DRD vs file structure, decision backward compatibility, decision instance retention.

---

## Question 23: DMN (Weighting: 11%)

**Scenario:** A `PRIORITY` hit policy decision table has three matching rules with priorities `LOW`, `HIGH`, `MEDIUM` (output priority column with allowed values). The team wonders which row's output is returned.

**`PRIORITY` hit policy semantics — which match wins?**

- **a)** **`PRIORITY` returns the matching rule with the highest-priority output value**, where priority order is defined by the **order in the output's allowed-values list** in the DMN model. If allowed values list is `["HIGH", "MEDIUM", "LOW"]` (top-to-bottom = highest-to-lowest), the rule with `HIGH` output wins among the three matches. Single result returned. **Critical detail**: priority is on **output values**, not on rule order. Must define allowed values list with ordered priorities. Documentation: [DMN Hit Policy](https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/)

- **b)** First matching rule — wrong; that's UNIQUE/FIRST. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Last matching rule — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Returns highest-priority rule based on rule order — partial; based on output values. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** PRIORITY hit policy uses **output allowed-values list ordering** to determine priority:

  **Setup**:
  - Output column defines allowed values: `["HIGH", "MEDIUM", "LOW"]`.
  - Order in the list = priority (first = highest).

  **Evaluation**:
  - Engine evaluates all rules; multiple may match.
  - From the matching rules' outputs, engine picks the one with the **highest-priority value** per the allowed-values list.
  - Returns that single rule's outputs.

  **Example**:
  - Rule 1 (input matches): output `LOW`.
  - Rule 2 (input matches): output `HIGH`.
  - Rule 3 (input matches): output `MEDIUM`.
  - With allowed-values `["HIGH", "MEDIUM", "LOW"]`: rule 2 wins (HIGH is highest priority).

  **Difference from FIRST**:
  - FIRST: returns first rule in **rule order** that matches; ignores output values.
  - PRIORITY: returns rule with highest-priority **output value**; ignores rule order.

  **Use cases for PRIORITY**:
  - **Severity routing**: multiple risk factors evaluated; route by highest severity.
  - **Approval levels**: multiple checks; route to highest-required approver.
  - **Priority-based assignment**: multiple criteria match; assign by importance.

  **Difference from OUTPUT ORDER (O)**:
  - O hit policy: similar — returns outputs sorted by allowed-values priority, but returns ALL matching rules' outputs (sorted), not just one.
  - PRIORITY (P): returns single highest-priority rule's output.

  Define allowed values list deliberately — order matters. Add new values mindfully (priority order changes if list extended).

- **Option b) — Wrong.** That's UNIQUE/FIRST.

- **Option c) — Wrong.**

- **Option d) — Partial.** Based on output values, not rule order.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. PRIORITY uses output allowed-values list ordering; rule with highest-priority output wins.
- **b) 2/10** — wrong.
- **c) 1/10** — wrong.
- **d) 5/10** — partial.

**Correct Answer:** PRIORITY returns the matching rule whose output value has highest priority per the output's allowed-values list ordering.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table-hit-policy/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "PRIORITY hit policy LOW HIGH MEDIUM." Hit policy semantic.

**Въпросът → Solution Framing.** "Which match wins" — изпитва се PRIORITY logic.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че PRIORITY uses output allowed-values list order, че rule with highest-priority output wins, че differs from FIRST (which uses rule order). Това е знание за PRIORITY hit policy.

---

## Question 24: DMN (Weighting: 11%)

**Scenario:** A DMN decision table cell needs to call a **custom FEEL function** (e.g., a function defined elsewhere in the DMN model). The team wonders how / whether DMN supports custom-function references.

**Can DMN cells call FEEL functions defined elsewhere in the DMN model?**

- **a)** **DMN supports Function Definitions** (boxed function expressions) as model elements that can be referenced from other expressions in the same DMN model. Cells can invoke such functions by name. Also: **Business Knowledge Models (BKM)** are first-class DMN constructs for reusable logic — decisions can reference BKMs in their expressions. **Built-in FEEL functions** are always available. **Across DMN files**: typically requires importing or composing models. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/) + [DMN BKM](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Only built-in functions — wrong; DMN supports BKM. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Inline only — partial; BKM externalises. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Java functions — wrong; FEEL only. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN's logic-reuse mechanisms:

  **Built-in FEEL functions**: 
  - Always available: `contains`, `substring`, `number`, `date`, etc. (per Set 8 / 11 / 12 discussions).
  - Called inline in cells: `=contains(name, "Smith")`.

  **Business Knowledge Models (BKM)**:
  - First-class DMN constructs.
  - Encapsulate reusable logic (typically a function-like decision).
  - Referenced by decisions via `knowledgeRequirement` in the DRD.
  - Invoked in expressions: `myBKM(inputs)`.

  **Function Definitions** (inline boxed function expressions):
  - Define a function as a boxed expression with parameters and body.
  - Assign to a variable or use in invocations.
  - Less commonly seen than BKM in production models.

  **Decision-from-decision reuse**:
  - Decision A's output → Decision B's input via DRD information requirement.
  - Different pattern than function reuse (decisions vs functions semantically).

  **Across DMN files**:
  - Standard DMN supports `<import>` for importing definitions from other DMN files.
  - Camunda 8's specific support level: verify per version.

  **Best practices for DMN reuse**:
  - **BKM**: for non-trivial logic shared across multiple decisions in the same DMN model.
  - **Separate decisions**: for distinct concerns (audit each separately, version separately).
  - **Inline FEEL**: for small one-off logic.

- **Option b) — Wrong.** BKM supported.

- **Option c) — Partial.** BKM externalises.

- **Option d) — Wrong.** FEEL only.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. DMN supports BKM (Business Knowledge Models) and inline function definitions; decision cells can invoke them.
- **b) 2/10** — wrong.
- **c) 5/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Yes — via BKM (Business Knowledge Model) constructs or inline function definitions; decisions reference and invoke by name.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "custom FEEL function defined elsewhere." Function reuse.

**Въпросът → Solution Framing.** "Cells call functions" — изпитва се DMN reuse mechanisms.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BKM first-class, че inline function definitions, че built-in FEEL always. Това е знание за DMN logic reuse.

---

## Question 25: DMN (Weighting: 11%)

**Scenario:** A DMN decision table has an "Annotation" column showing free-text comments (e.g., "Applies to EU customers per regulation X"). The team wonders if annotations affect evaluation logic.

**Annotation column purpose — does it affect decision evaluation?**

- **a)** **Annotations don't affect evaluation logic** — they're **documentation** for human readers (modelers, reviewers, auditors). The engine ignores annotations when evaluating rules. **Useful for**: documenting regulatory basis ("per GDPR Article X"), explaining edge-case rules ("rule for legacy customers, sunset 2030"), audit trails (who added the rule, when, why). **Best practice**: rich annotations in production DMN improve maintainability + compliance review. Documentation: [DMN Decision Tables](https://docs.camunda.io/docs/components/modeler/dmn/decision-tables/)

- **b)** Annotations affect evaluation — wrong; ignored. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Annotations only for first match — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Annotations not part of DMN — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Annotation columns in DMN decision tables:

  **What they are**:
  - **Free-text columns** added to rule rows.
  - **Modeler-defined** content; arbitrary strings.
  - **Per-rule**: each rule can have annotation text.

  **What the engine does with them**:
  - **Ignores during evaluation**: doesn't read for inputs or outputs.
  - **May include in output trace / evaluation result**: some engines return annotations alongside outputs (for debugging / audit).

  **Practical uses**:

  **Regulatory documentation**:
  - "Required by Basel III Article 5.3" on a credit-decision rule.
  - "Per GDPR Article 22 — automated decision-making" on a customer-routing rule.

  **Business context**:
  - "Rule for premium customers (CSAT > 9)" — clarifies intent.
  - "Legacy rule for pre-2020 contracts" — context for sunset planning.

  **Audit trail**:
  - "Added by jdoe 2025-01-15 — ticket DMN-456" — change tracking.

  **Edge-case explanation**:
  - "Special case: government customers are exempt per legal review on 2024-09-12."

  **Best practices**:
  - **Production DMN should have annotations**: critical for maintenance and audit.
  - **Keep concise**: long prose → external documentation; annotations are inline summaries.
  - **Reference external IDs**: ticket numbers, regulatory citations, legal opinions.
  - **Update when rules change**: stale annotations mislead.

  **For tooling**:
  - Web Modeler shows annotations alongside rule rows.
  - Some tools export annotated DMN to documentation formats.

- **Option b) — Wrong.** Ignored.

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Annotations = documentation; ignored by engine; valuable for maintainability + audit.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Annotation columns are documentation; engine ignores during evaluation; use for regulatory / business context / audit.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-tables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Annotation column free-text." Annotation purpose.

**Въпросът → Solution Framing.** "Affects evaluation" — изпитва се knowledge на annotation semantic.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че annotations = documentation, че engine ignores, че valuable for maintainability + audit. Това е знание за annotation column.

---

## Question 26: DMN (Weighting: 11%)

**Scenario:** A DMN input column declares type `number`. A rule cell has `=> 100`. The input passed at runtime is `"100"` (string). The team wonders if evaluation succeeds.

**Type mismatch between declared column type and runtime input value?**

- **a)** **Type mismatches typically cause evaluation issues**:
  - Declared type sets expected type for cell comparisons.
  - If runtime value is a different type (string `"100"` vs number 100), the cell comparison may evaluate to false (string ≠ number in FEEL per Set 12 Q22 discussion).
  - **Mitigations**:
    - Convert at process variable / Input Mapping layer before DMN invocation: `=number(amountStr)`.
    - Don't declare strict types if inputs vary — leave untyped (less safe, but tolerant).
    - Validate inputs before DMN call.
  
  **Best practice**: ensure type consistency end-to-end; declare types in DMN; coerce upstream. Documentation: [DMN Decision Tables](https://docs.camunda.io/docs/components/modeler/dmn/decision-tables/) + [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** Auto-coerced — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Always errors — partial. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Type declarations irrelevant — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Type mismatches in DMN cause issues; type discipline matters:

  **Effects of mismatch**:
  - **Cell comparison fails to match**: `=> 100` (number) compared against `"100"` (string) evaluates to false; rule doesn't match.
  - **Quiet bugs**: no error per se, but unexpected results (rule that should match doesn't).
  - **Output of wrong type**: if rule does match and outputs cast inputs to wrong type, downstream consumers see wrong type.

  **Why this happens**:
  - DMN/FEEL is type-strict (per Set 13 Q22 discussion).
  - String `"100"` ≠ number 100.
  - Comparison operators (>, <, =) require matching types.

  **Mitigations**:

  **At process layer** (preferred):
  - **Input Mapping with conversion**: `Source: =number(amountStr), Target: amount` before calling DMN.
  - **Form fields with correct types**: use Number Input components in Camunda Forms instead of Text Input for numeric data.
  - **API contracts**: ensure upstream services return correctly-typed JSON values.

  **At DMN layer**:
  - **Declare types deliberately**: typed columns catch mismatches at evaluation.
  - **Conversion in cells**: `=number(amountStr)` in cells — less clean than process-layer conversion.

  **At validation layer**:
  - **Schema validation** at process boundaries (REST endpoints, message receivers).
  - **Reject invalid types** early rather than letting them propagate.

  **Common pitfalls**:
  - **Form text inputs feeding numeric DMN inputs**: classic source of bugs.
  - **JSON parsing inconsistencies**: some libraries quote numbers as strings.
  - **Variable shadowing with different types**: same variable name at different scopes with different types.

  Be type-disciplined end-to-end.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Type mismatches cause evaluation issues; convert upstream; declare types deliberately.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Type mismatches cause silent evaluation issues; ensure type consistency via upstream conversion (e.g., `=number()` in Input Mapping).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-tables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "type number cell input '100' string." Type mismatch.

**Въпросът → Solution Framing.** "Evaluation succeeds" — изпитва се type strictness в DMN/FEEL.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че type mismatches silent bug, че convert upstream, че type discipline matters. Това е знание за DMN type handling.

---

## Question 27: DMN (Weighting: 11%)

**Scenario:** A team has DMN models stored as files. They wonder if **a DRD (Decision Requirements Diagram) is a separate file** or part of the DMN file.

**DRD vs DMN file structure?**

- **a)** **A DRD is a visualization / structural representation of decision dependencies within a DMN file** — it's not a separate file. A DMN XML file (`.dmn`) contains the decisions, their inputs / outputs, and dependency relationships (information requirements, knowledge requirements). The DRD is the visual graph of these dependencies; rendered by tools (Modeler) from the file's structure. **Modular alternatives**: split decisions across multiple DMN files with imports if very complex; depends on Camunda 8 support for DMN imports. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Separate file — wrong; visualisation of file. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Tool-specific — partial. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** DMN doesn't have diagrams — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN file vs DRD relationship:

  **DMN file** (`.dmn`):
  - **XML format** following the OMG DMN standard.
  - **Contents**:
    - `<definitions>` root element.
    - One or more `<decision>` elements (each with logic — typically decision tables or boxed expressions).
    - `<inputData>` elements (external inputs to the DRD).
    - `<businessKnowledgeModel>` for BKM (per Q24).
    - `<knowledgeSource>` for documentation references.
    - `<informationRequirement>`, `<knowledgeRequirement>` — relationships between elements.
  - **Diagram info** (DI):
    - `<dmndi:DMNDI>` section with visual positioning info.

  **DRD (Decision Requirements Diagram)**:
  - **Visual representation** of the decision dependencies declared in the DMN file.
  - **Generated by tools** (Web Modeler, Desktop Modeler) from the file's structure.
  - **Shows**:
    - Decision nodes (rectangles).
    - InputData (ovals).
    - BKM (with hat icon).
    - Knowledge sources (documents).
    - Arrows indicating dependencies.

  **Single file holds everything**:
  - All decisions in one DMN file.
  - DRD generated from that file.
  - One file, one DRD (in standard DMN).

  **Multiple decisions in one file**:
  - Typical: a DRD might have 5-10 decisions composing a complex one.
  - One file holds the whole composition.

  **Modular alternatives**:
  - **Multiple DMN files** with imports: standard DMN supports `<import>` to reference definitions in other DMN files.
  - **Camunda 8 support for DMN imports**: verify per version.
  - **Trade-off**: modularity vs deployment complexity.

  **Typical workflow**:
  1. Modeler opens a DMN file.
  2. Sees the DRD canvas.
  3. Edits decisions / dependencies.
  4. Saves the .dmn file.
  5. Deploys via Web Modeler or zbctl.

- **Option b) — Wrong.** Same file.

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. DRD = visualisation of dependencies в same DMN file; not separate.
- **b) 2/10** — wrong.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** DRD is the visual graph of dependencies within a single DMN file; not a separate file.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "DRD separate file or part of DMN." File structure.

**Въпросът → Solution Framing.** "Separate file" — изпитва се knowledge на DMN file structure.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DRD = visualisation, че single .dmn file holds everything, че modular import possible. Това е знание за DMN file organisation.

---

## Question 28: DMN (Weighting: 11%)

**Scenario:** A team deployed Decision V1; now V2 changes a rule. Running process instances mid-flight call this decision. The team wonders **which version** in-flight instances use.

**DMN version selection when in-flight processes invoke a decision?**

- **a)** **Standard behavior**: process instance invoking a decision typically uses the **latest deployed version** of that decision (decision binding is dynamic per invocation, unlike process model binding which can be sticky). **Implication**: deploy V2 → all subsequent invocations from in-flight instances use V2. **For sticky versioning**: pin specific versions (e.g., via decisionVersion attribute) — verify your Camunda 8 version's exact decision-binding semantics. Documentation: [DMN Versioning](https://docs.camunda.io/docs/components/concepts/decisions/) + [Versions in Camunda 8](https://docs.camunda.io/docs/components/concepts/process-instance-creation/)

- **b)** Original version sticky — partial. Documentation: [Decisions](https://docs.camunda.io/docs/components/concepts/decisions/)

- **c)** Random version — wrong. Documentation: [Decisions](https://docs.camunda.io/docs/components/concepts/decisions/)

- **d)** Process can't invoke decisions — wrong. Documentation: [Business Rule Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Decision version binding when invoked from BPMN:

  **Standard behavior** (latest):
  - Business Rule Task invokes a decision by `decisionId`.
  - Engine looks up the **latest deployed version** of that decisionId.
  - Per-invocation lookup; in-flight processes pick up new versions automatically.

  **Implication for upgrades**:
  - **V1 deployed; processes running, some yet to reach the Business Rule Task**.
  - **V2 deployed** (logic change).
  - **Subsequent invocations** (including from in-flight instances): use V2 logic.

  **When this is desired**:
  - Bug fix in decision logic: want all (including in-flight) to benefit.
  - Tax rate change: latest rates apply to all decisions evaluated after change.
  - Compliance update: apply new rules immediately.

  **When this might be undesired**:
  - **Long-running processes need consistency**: instance started under V1 should keep V1 throughout.
  - **Audit / replay**: need to know which version produced which outcome.

  **For sticky versioning** (verify per Camunda 8 version):
  - **`decisionVersion` attribute**: pin to specific version on Business Rule Task.
  - **`decisionBinding` attribute**: "latest" (default) vs "deployment" (deployment-time binding) vs "version".
  - **Process-instance versioning**: process model itself pinned to deployment-time decision.

  **Best practices**:
  - **Backward-compatible decision changes**: keep new versions compatible with old inputs / outputs so in-flight processes work.
  - **For breaking changes**: bump decisionId (new decision entirely) rather than changing existing.
  - **Track decision-to-instance**: log which decision version each instance invoked (for audit).

  Verify exact binding semantics in your Camunda 8 version (Spec evolves).

- **Option b) — Partial.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Standard: latest version dynamically; pin via decisionVersion if sticky needed.
- **b) 4/10** — partial.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Standard: latest deployed version invoked dynamically; pin to specific version if sticky semantics needed.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/decisions/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "V1 / V2 in-flight instances." Decision version binding.

**Въпросът → Solution Framing.** "Which version" — изпитва се decision version selection.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че standard = latest, че pin if sticky needed, че backward compatibility recommended. Това е знание за decision versioning.

---

## Question 29: DMN (Weighting: 11%)

**Scenario:** A process is heavy-DMN — invokes 50+ decisions per process instance for compliance checks. The team wonders if **decision instances are retained for audit** and how to query / clean up.

**Decision instance retention + audit query?**

- **a)** **Decision instances are recorded** (typically in Operate / dedicated decision tables) for audit / replay. **Retention**: typically configurable; defaults vary by SaaS plan / Self-Managed config. **Query**: Operate's decision-instances view + APIs let you inspect individual decision invocations (inputs, outputs, evaluation trace). **Cleanup**: data retention policy controls how long; old instances expire / are archived per config. **For heavy-DMN processes**: monitor storage growth; tune retention; consider archiving instead of permanent retention if long-term audit needed. Documentation: [Operate Decisions](https://docs.camunda.io/docs/components/operate/userguide/process-instances/) + [Data Retention](https://docs.camunda.io/docs/components/concepts/data-retention/)

- **b)** Not retained — wrong; audit recorded. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Retained forever — partial; configurable. Documentation: [Data Retention](https://docs.camunda.io/docs/components/concepts/data-retention/)

- **d)** Query via SQL — partial; via APIs / Operate. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Decision instance lifecycle in Camunda 8:

  **Recording**:
  - Each decision invocation is recorded as a "decision instance."
  - Captured data:
    - **Decision ID + version invoked**.
    - **Inputs** at evaluation time.
    - **Outputs** produced.
    - **Evaluation trace**: which rules matched, intermediate outputs.
    - **Timestamp**, parent process instance reference.
  - Stored in Operate / dedicated decision data store.

  **Retention**:
  - **SaaS**: retention policies per plan; defaults retain for a period (verify per plan tier).
  - **Self-Managed**: configurable via Operate / Tasklist / data store config.
  - **Variable**: ranges from days to indefinite based on config.

  **Querying**:
  - **Operate UI**: decision-instances view; filter by decision, by process, by date range, by status.
  - **Operate REST API**: programmatic queries; export to external systems.
  - **Direct database**: for Self-Managed deployments, can query underlying store directly (but typically discouraged — use APIs).

  **For heavy-DMN processes**:
  - **Storage growth**: 50 decisions × thousands of process instances = large data volume.
  - **Tune retention**: balance audit requirements with cost / performance.
  - **Archive strategy**: export old instances to cheaper storage (S3, data warehouse) before purge.
  - **Sampling**: if full retention is too expensive, sample instances for audit; full retention only for flagged / high-value processes.

  **Audit requirements**:
  - **Regulatory**: financial / healthcare may require 7+ years retention.
  - **Engine retention is short-term**: typically design for cold-storage archive for long-term audit.
  - **Pipeline**: Camunda → S3 / data lake → BI / audit tools.

  **Cleanup options**:
  - Automatic per retention policy.
  - Manual via API for bulk operations (verify per Camunda 8 version's available APIs).

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Decision instances recorded with retention policy; query via Operate UI / APIs; tune for heavy use.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 5/10** — partial.

**Correct Answer:** Decision instances recorded with configurable retention; query via Operate UI / APIs; design retention + archiving strategy for heavy-DMN systems.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instances/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "50+ decisions retained for audit cleanup." Decision retention.

**Въпросът → Solution Framing.** "Retention + audit query" — изпитва се knowledge на decision data lifecycle.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че recorded with retention, че query via Operate, че heavy-DMN needs tuning + archive strategy. Това е знание за decision retention.

---

# Section 4 — Forms (Questions 30-32)

> Weight 5% • Topics: Rich text formatting in Camunda Forms, Form versioning breaking changes, Locale / i18n for Forms.

---

## Question 30: Forms (Weighting: 5%)

**Scenario:** A team's User Task collects free-text feedback. The product owner asks if assignees can format text — bold, lists, links — in the form field.

**Does Camunda Forms support rich-text input fields?**

- **a)** **Verify per Camunda 8 / Forms version**: typical text components in Camunda Forms are plain-text inputs (Text Field for single-line, Text Area for multi-line). **Rich-text editors** (with formatting toolbars) may be supported via specific component types or extensions — check the Forms component catalog. **If not natively supported**: external embed (custom front-end), Markdown convention (modeler stores Markdown; downstream renders), or use external rich-text editor + sync to Camunda. Documentation: [Camunda Forms](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library-text-field/)

- **b)** Yes always available — partial; verify per version. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Plain text only ever — partial; varies by version. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Forms don't support text — wrong. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda Forms text-input options:

  **Standard text components** (typically available):
  - **Text Field**: single-line plain text.
  - **Text Area**: multi-line plain text.
  - Both store as plain string variables.

  **Rich-text formatting** (verify per Camunda 8 / Forms version):
  - Some versions may add a Rich Text or HTML editor component.
  - Output: HTML / Markdown string in process variable.
  - Modeler-side: WYSIWYG toolbar for bold / italic / links / lists.

  **If natively unavailable, workarounds**:

  **Pattern 1: Markdown convention**:
  - Use a Text Area component.
  - Train users to write Markdown syntax (`**bold**`, `* list item`, `[link](url)`).
  - Downstream renderer (custom web view) renders Markdown to HTML.
  - Pros: works with any plain-text field; cross-platform.
  - Cons: users need Markdown knowledge.

  **Pattern 2: HTML in textarea**:
  - User writes HTML directly (advanced users only).
  - Risk: XSS if not sanitised downstream.

  **Pattern 3: External rich editor**:
  - Build custom front-end with TinyMCE / Quill / etc.
  - Sync result to Camunda via API.
  - Most flexibility; most engineering work.

  **Pattern 4: Pre-defined templates**:
  - Form provides structured fields (subject, body sections) instead of free-form rich text.
  - Compose final document from structured fields.
  - Reduces need for rich formatting.

  **Best practice**:
  - For most workflows, plain text + Markdown convention suffices.
  - For polished customer-facing documents, external editors more appropriate.

  Always check current Forms component catalog — features evolve.

- **Option b) — Partial.** Verify.

- **Option c) — Partial.** Varies.

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Verify per Forms version; plain-text Text Field / Text Area standard; rich-text may be available or use Markdown / external editor.
- **b) 5/10** — partial.
- **c) 5/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Verify per Forms version; Text Field / Text Area for plain text; rich-text via specific component (if supported) or Markdown convention / external editor.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library-text-field/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "bold lists links text formatting." Rich-text input question.

**Въпросът → Solution Framing.** "Rich-text input supported" — изпитва се knowledge на Forms component capabilities.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че plain-text standard, че rich-text varies per version, че workarounds via Markdown / external. Това е знание за Forms components.

---

## Question 31: Forms (Weighting: 5%)

**Scenario:** A team has a deployed Camunda Form V1 referenced by multiple User Tasks. They need a **breaking change** (rename a field from `customerEmail` to `email`). They wonder how to manage migration without breaking in-flight tasks.

**Form versioning + breaking changes strategy?**

- **a)** **Form versioning supports gradual migration**:
  - **Deploy V2** as a new version (typically incremented automatically on deploy).
  - **In-flight tasks**: continue using V1 (the form ID / version they were bound to at User Task creation, per typical binding semantics — verify Camunda 8 version's exact binding rules).
  - **New tasks**: bind to latest (or specific version via configuration).
  - **For renamed fields**: V2's field name differs from V1; downstream consumers of the variable need to handle both names (transitional) or migrate gradually.
  - **Migration scripts**: if needed, transform V1 data to V2 schema before re-saving.
  
  Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/) + [Versioning](https://docs.camunda.io/docs/components/concepts/process-instance-creation/)

- **b)** Break all in-flight tasks — wrong; isolated by version. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** No versioning support — wrong. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Auto-migration — overstates. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Form versioning + breaking-change strategy:

  **Form deployment**:
  - Each Form has a `formId` (logical name) and version (auto-incremented or explicit).
  - Process model references via `<zeebe:formDefinition formId="...">` (per Q11).

  **Binding semantics** (verify per Camunda 8 version):
  - **Latest binding** (typical default): User Task references latest deployed version of formId at task activation.
  - **Sticky binding** (some configurations): once a task references a form, that version sticks until task completes.

  **For renamed-field breaking change**:

  **Phase 1: Preparation**:
  - Plan V2 with both names temporarily? Or single new name?
  - Decide on transitional vs immediate cutover.

  **Phase 2: Deployment**:
  - Deploy V2 form with new field name.
  - In-flight tasks: continue with V1 if sticky-bound, OR refresh to V2 (would break form rendering for those tasks because field names differ).

  **Phase 3: Migration patterns**:

  **Pattern A: Field aliasing (transitional)**:
  - V2 includes both `customerEmail` (deprecated, hidden) and `email` (new).
  - Old data continues to work; new submissions use new name.
  - Eventually drop `customerEmail`.

  **Pattern B: Data migration**:
  - Migrate existing process variables to new names via Modify API / script.
  - Risky; coordinate with form deployment.

  **Pattern C: New form, new task**:
  - V2 is a completely new form (different formId).
  - Old process model continues using V1; new process model uses V2.
  - Coexist; deprecate V1 over time.

  **Pattern D: Cut over with migration window**:
  - Wait for in-flight V1 tasks to complete.
  - Then deploy V2.
  - Minimum disruption but requires waiting.

  **Best practices**:
  - **Test thoroughly**: in-flight task continuation under V2.
  - **Document field migrations**: clear changelog for consumers.
  - **Consider both upstream and downstream**: forms feed variables; variables feed many consumers; rename impacts all.

- **Option b) — Wrong.** Isolated by version.

- **Option c) — Wrong.**

- **Option d) — Overstates.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Form versioning supports gradual migration; in-flight tasks isolated per binding semantics; pattern depends on breaking change type.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 4/10** — overstates.

**Correct Answer:** Form versioning enables gradual migration; pick pattern (aliasing / data migration / new form / cutover) per breaking-change type.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "rename customerEmail to email breaking change." Form versioning + migration.

**Въпросът → Solution Framing.** "Breaking changes strategy" — изпитва се knowledge на migration patterns.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че versioning supports, че binding semantics matter, че migration patterns (aliasing / data / new form). Това е знание за Form versioning + migration.

---

## Question 32: Forms (Weighting: 5%)

**Scenario:** A team's Tasklist has assignees in Bulgaria, Germany, and Japan. They wonder about **i18n / localisation** — can forms show labels in each user's preferred language?

**Localisation / i18n for Camunda Forms?**

- **a)** **Verify per Camunda 8 / Forms version**: Tasklist UI itself has language localisation (English, German, French, etc.) for the chrome (menus, buttons). Form **content** (field labels, descriptions, help text) is typically authored once per form deployment; native multi-language switching within a form depends on Forms support — check current capabilities. **Workarounds**:
  - Multiple forms per language (separate forms for each locale; route by user preference).
  - JavaScript-based locale switching in custom Tasklist.
  - External rendering layer with i18n.
  
  Documentation: [Tasklist Localisation](https://docs.camunda.io/docs/components/tasklist/) + [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **b)** Auto-translated — wrong. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **c)** Only English — partial. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **d)** No i18n support — wrong. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda Forms / Tasklist i18n landscape:

  **Tasklist UI chrome**:
  - Standard UI elements (menus, navigation, buttons) typically have multi-language support.
  - User preference via Tasklist settings.
  - Languages supported: depends on Camunda 8 version — typically English, German, French, etc.

  **Form content** (the form fields themselves):
  - **Authored once per form**: field labels, descriptions, help texts in the language the modeler chose.
  - **Native per-user switching**: not always a primary feature in standard Camunda Forms; verify current version.

  **Workarounds for true per-user form i18n**:

  **Pattern 1: Multiple forms per language**:
  - Form "review-form-en" (English labels).
  - Form "review-form-bg" (Bulgarian labels).
  - Form "review-form-de" (German labels).
  - At Service Task before User Task: set `formId` based on user's preferred language.
  - Pros: simple, native; cons: maintenance overhead (n × forms to keep in sync).

  **Pattern 2: Field-label keys + lookup**:
  - Form labels are static keys (e.g., `field.customerName.label`).
  - JavaScript-side: lookup translations from a dictionary based on user locale.
  - Requires Tasklist customisation; not vanilla.

  **Pattern 3: External rendering**:
  - Custom front-end fetches task data via Tasklist API.
  - Renders fields with own i18n stack (React + react-i18next, etc.).
  - Full control; significant build.

  **Pattern 4: Server-side localisation in form**:
  - If forms support dynamic labels via FEEL / template expressions:
    - Use process variable `userLocale` to render appropriate labels.
    - Verify support per Forms version.

  **For data values** (not labels):
  - Localised content stored in localized resources (DB tables by locale, etc.).
  - Process variables look up per user.

  **Best practices**:
  - **Decouple labels from data**: labels = i18n concern (UI); data = process concern (engine).
  - **Engineering vs business trade-off**: native + multi-form simplest, customisation most flexible.

  Verify exact form i18n capabilities per Camunda 8 / Forms version.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Tasklist UI chrome localised; form content typically authored per locale; multiple forms / external rendering for per-user switching.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Tasklist UI is localised; Form content typically single-locale per form; use multiple forms per language or external rendering for full i18n.

**Official Documentation Link:** https://docs.camunda.io/docs/components/tasklist/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Bulgaria Germany Japan i18n." Localisation question.

**Въпросът → Solution Framing.** "Localised forms" — изпитва се knowledge на Forms / Tasklist i18n.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Tasklist chrome localised, че form content per-locale, че multiple forms / external rendering for full switching. Това е знание за Forms i18n.

---

# Section 5 — Connectors (Questions 33-36)

> Weight 7% • Topics: Kafka Connector, WebSocket Connector, SaaS-specific Connectors, Connector mocking for tests.

---

## Question 33: Connectors (Weighting: 7%)

**Scenario:** A team consumes events from a Kafka topic + needs to react in BPMN. They wonder if Camunda provides a **Kafka Connector** out-of-the-box.

**Kafka Connector availability + use?**

- **a)** **Verify per Camunda 8 version + edition (SaaS / Self-Managed)**: Camunda's Connector marketplace typically includes Kafka Connectors for both **Inbound** (consume topic events) and **Outbound** (publish to topic). **Configuration**: broker address, topic name, security (SASL, SSL), consumer group ID for Inbound. **Outbound**: produces messages from process to topic. **Inbound**: BPMN Message / Signal Catch correlates Kafka events to process instances. **Alternatives if Connector unavailable**: build custom Connector via SDK; use external worker integration. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/)

- **b)** No Kafka support — wrong. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **c)** Outbound only — partial. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **d)** Must build custom — overstates; standard Connectors typically available. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Kafka Connector ecosystem in Camunda 8:

  **Out-of-the-box Connectors** (typical):
  - **Kafka Outbound Connector**: Service Task publishes a message to a Kafka topic.
  - **Kafka Inbound Connector**: Receives messages from a topic and correlates to process instances (via Message Start, Boundary, Catch).

  **Outbound configuration**:
  - **Bootstrap servers**: Kafka broker addresses.
  - **Topic**: target topic name.
  - **Key**: optional partition key (for ordering / partitioning).
  - **Value**: message payload (string, JSON, etc.).
  - **Security**: SASL_PLAINTEXT, SASL_SSL credentials.
  - **Headers**: custom message headers.

  **Inbound configuration**:
  - **Bootstrap servers + topic**: source.
  - **Consumer group ID**: for tracking offset.
  - **Activation condition** (FEEL): filter messages.
  - **Correlation key expression**: extract correlation key from message.
  - **Variable mapping**: extract fields from message body to process variables.

  **Use cases**:
  - **Event-driven BPMN**: process reacts to events on shared topics (order events, payment events, etc.).
  - **Asynchronous fan-out**: process publishes events for other consumers.
  - **Cross-system integration**: Kafka as integration backbone.

  **Operational considerations**:
  - **Consumer group**: dedicated group per Inbound Connector to avoid offset conflicts.
  - **Backpressure**: high-throughput topics need careful tuning.
  - **Schema management**: typically pair with Schema Registry (Avro / Protobuf) for typed messages.

  **Security**:
  - Credentials via Camunda secrets (`{{secrets.KAFKA_PASSWORD}}`).
  - Never inline credentials in BPMN.

  **If unavailable in your version / plan**:
  - Build custom Connector via Connector SDK.
  - Use external worker pattern: external service consumes Kafka + publishes Camunda Messages via REST API.

  Verify exact availability + capabilities per Camunda 8 version.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Overstates.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Verify per version; Kafka Inbound + Outbound Connectors typically available; SASL + Schema Registry for production.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 3/10** — overstates.

**Correct Answer:** Kafka Connectors (Inbound + Outbound) typically out-of-the-box; configure brokers / topic / security / correlation; verify per version.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Kafka topic consume react." Kafka integration.

**Въпросът → Solution Framing.** "Kafka Connector" — изпитва се knowledge на standard Connector catalog.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Inbound + Outbound typical, че SASL security + Schema Registry, че correlation expression links Kafka events. Това е знание за Kafka Connector.

---

## Question 34: Connectors (Weighting: 7%)

**Scenario:** A team's process needs to listen on a **WebSocket connection** for real-time events. They wonder if Camunda has a WebSocket Connector or if external infrastructure is needed.

**WebSocket Connector / pattern for real-time events?**

- **a)** **Verify per Camunda 8 version**: WebSocket-as-an-Inbound-Connector may or may not be standard; verify catalog. **Common patterns when not native**:
  - **External WebSocket gateway**: dedicated service maintains the WebSocket connection; converts events to Camunda Messages via REST API.
  - **Camunda Webhook Inbound Connector**: if peer can push HTTP-style events, use Webhook (not WebSocket per se).
  - **Custom Connector via SDK**: build Inbound Connector that opens WebSocket; bridges events.
  
  **Trade-off**: WebSockets are stateful long-lived connections; Connectors traditionally event-driven / request-driven. Dedicated gateway services often better operationally. Documentation: [Connectors SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** Native WebSocket Connector always — partial; verify. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **c)** WebSocket impossible — wrong. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **d)** Use Kafka instead — overstates; different paradigm. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** WebSocket integration considerations:

  **Why WebSockets are tricky for Connectors**:
  - **Long-lived stateful connections**: client maintains a connection; receives push events.
  - **Connectors traditionally**: stateless event-driven (Webhook = HTTP push) or polling.
  - **Operationally**: keeping WebSocket connections alive within Connector runtime requires careful lifecycle management.

  **Pattern 1: External WebSocket gateway** (most common):
  - **Dedicated service** (e.g., Node.js / Java service) maintains WebSocket connection to the source.
  - On event: service translates to a Camunda Message (REST API call) or Kafka topic event.
  - Camunda Message Catch / Kafka Inbound Connector correlates.
  - Pros: separation of concerns; gateway can reconnect, buffer, transform.
  - Cons: extra service to operate.

  **Pattern 2: Camunda Webhook Inbound Connector**:
  - If source can push HTTP webhook events (not WebSocket): use Webhook Connector directly.
  - Many SaaS systems offer webhooks as an alternative.

  **Pattern 3: Custom Connector via SDK**:
  - Build an Inbound Connector that opens a WebSocket.
  - Handles reconnection, event parsing, correlation key extraction.
  - Pros: integrated; cons: complex to do right (reconnection, buffering).

  **Pattern 4: Translate to event stream**:
  - WebSocket events → Kafka topic (via gateway) → Camunda Kafka Inbound Connector.
  - Decouples Camunda from WebSocket's stateful nature.

  **Considerations**:
  - **Reconnection**: WebSocket disconnects need automated retry.
  - **Event buffering**: while reconnecting, events may be missed (depending on protocol).
  - **Backpressure**: high-rate events may overwhelm Camunda.
  - **Auth + lifecycle**: tokens / handshakes / heartbeats — robust handling needed.

  Verify what Connectors are available; prefer external gateway for production WebSocket integrations unless native Connector exists and is mature.

- **Option b) — Partial.**

- **Option c) — Wrong.**

- **Option d) — Overstates.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Verify catalog; common patterns: external gateway + Camunda Webhook / Kafka / custom Inbound Connector.
- **b) 5/10** — partial.
- **c) 1/10** — wrong.
- **d) 3/10** — overstates.

**Correct Answer:** Verify per version; common pattern: external WebSocket gateway → Camunda Message / Kafka / Webhook; consider lifecycle complexity.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "WebSocket real-time events listen." WebSocket pattern.

**Въпросът → Solution Framing.** "WebSocket Connector" — изпитва се knowledge на Connector patterns for stateful protocols.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че WebSocket stateful, че external gateway pattern common, че lifecycle management complex. Това е знание за WebSocket integration.

---

## Question 35: Connectors (Weighting: 7%)

**Scenario:** A team uses Camunda 8 SaaS. They wonder if **SaaS-specific Connectors** exist (e.g., to Camunda's own Operate, Tasklist, OAuth, etc.) that are unavailable / different in Self-Managed.

**Are there Connectors specific to SaaS edition?**

- **a)** **Verify per Camunda 8 version + edition**: most standard Connectors (REST, Kafka, SMTP, Slack, etc.) typically work identically in SaaS and Self-Managed. **Camunda-specific Connectors** (e.g., to internal Operate / Tasklist) may have shared APIs but different deployment / auth (SaaS uses OAuth client credentials with managed Identity; Self-Managed uses your Identity / Keycloak). **Functionality typically equivalent**; setup details differ. Documentation: [Connectors Catalog](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/) + [SaaS vs Self-Managed](https://docs.camunda.io/docs/components/concepts/)

- **b)** Completely different sets — overstates. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **c)** Identical — partial; some auth / config differences. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **d)** SaaS has no Connectors — wrong. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Connectors in SaaS vs Self-Managed:

  **Most Connectors are edition-agnostic**:
  - REST, GraphQL, SOAP: HTTP-based; same in both.
  - Kafka, RabbitMQ, MQTT: message brokers; same in both.
  - Email (SMTP, IMAP), Slack, Teams: communication; same in both.
  - GitHub, GitLab, Bitbucket: VCS; same in both.
  - AWS Services (S3, Lambda, etc.), Google Cloud, Azure: cloud; same in both.

  **Configuration differences**:
  - **Secrets management**:
    - **SaaS**: secrets configured in cluster settings UI; referenced via `{{secrets.NAME}}`.
    - **Self-Managed**: secrets typically environment variables or external secret managers.
  - **Network access**:
    - **SaaS**: outbound from Camunda's cloud to your services; firewall rules / IP allowlists needed.
    - **Self-Managed**: same network as your services; direct access typically.

  **Camunda-specific operations** (e.g., from one process to query Operate):
  - **SaaS**: typically OAuth client credentials via managed Identity; cluster endpoint URLs in cluster settings.
  - **Self-Managed**: configured against your Identity / Keycloak; on-prem endpoints.
  - **Functionality equivalent**; auth flow + endpoints differ.

  **SaaS-exclusive features** (verify per version):
  - **Web Modeler integration**: deeper in SaaS (one-click deploys, etc.).
  - **Console**: SaaS-specific control plane.
  - **AI Agent Connector**: typically available in both, but credentials / billing differ.

  **Self-Managed-exclusive considerations**:
  - **Custom Connectors**: deploy own packaged Connectors more easily (mount in Connector Runtime).
  - **SaaS**: custom Connector deployment requires specific support / patterns.

  **Practical advice**:
  - **Develop edition-agnostic**: avoid hard-coding edition-specific assumptions in BPMN.
  - **Use secrets**: same `{{secrets.NAME}}` syntax works across editions.
  - **Test in target edition**: networking + auth surprises common.

- **Option b) — Overstates.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Most Connectors edition-agnostic; config / auth differs (secrets, network, Camunda-internal auth).
- **b) 3/10** — overstates.
- **c) 5/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Most Connectors work in both; configuration / auth differs (secrets, network, Camunda-internal endpoint auth).

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "SaaS-specific Connectors vs Self-Managed." Edition differences.

**Въпросът → Solution Framing.** "Connectors specific to SaaS" — изпитва се knowledge на edition parity.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че most edition-agnostic, че config / auth / networking differ, че edition parity goal. Това е знание за SaaS vs Self-Managed Connectors.

---

## Question 36: Connectors (Weighting: 7%)

**Scenario:** A team runs **integration tests** of BPMN models. They wonder how to **mock Connectors** so tests don't hit real external services (e.g., REST APIs, Slack).

**Connector mocking for integration tests?**

- **a)** **Combination of approaches**:
  - **Override at deployment**: deploy test-specific BPMN where Connector tasks are replaced with mock workers (Service Tasks with same job type, registered to a test worker that returns canned responses).
  - **Camunda Process Test framework** (if available for the testing language): provides mocking utilities for Connectors.
  - **External service stubbing**: tools like WireMock / Hoverfly stand up fake HTTP endpoints; Connector points to stub URLs.
  - **Conditional Connector activation** via deployment-time variable: prod = real Connector, test = mock variant.
  
  Documentation: [Process Tests](https://docs.camunda.io/docs/components/concepts/process-instance-creation/) + [Connectors SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** Can't mock — wrong. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **c)** Always hit real — wrong. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

- **d)** Disable Connectors entirely — partial. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Mocking strategies for Connector-heavy BPMN tests:

  **Pattern 1: Test-specific BPMN with mock workers**:
  - **Replace Connector tasks with Service Tasks** in test BPMN that use a mock job type.
  - **Register a mock worker** in test setup: returns canned responses based on inputs.
  - **Pros**: full control, no external dependencies, deterministic tests.
  - **Cons**: maintain dual BPMN (prod with Connector, test with mock) — drift risk.

  **Pattern 2: Camunda Process Test framework** (if available):
  - Camunda 8 testing libraries (Spring Zeebe Test, etc.) may provide:
    - Job mocking: register mock workers programmatically.
    - Process state assertions.
    - Time control (advance simulated time).
  - Verify support for Connector mocking in current libraries.

  **Pattern 3: External stub services**:
  - **WireMock**: stand up fake HTTP server; configure expected responses per URL.
  - **Hoverfly**: similar; supports HTTPS + recording / replay.
  - **TestContainers**: dockerised stub services.
  - Configure Connector to point to stub URL via environment variable / secret.
  - **Pros**: no BPMN changes; tests real Connector code paths.
  - **Cons**: stub maintenance.

  **Pattern 4: Conditional activation via env**:
  - **Connector input includes** `=if env.testMode = "true" then "mock-url" else "real-url"`.
  - Deployment-time variable determines target.
  - Simpler than dual BPMN; less clean than full mocking framework.

  **Pattern 5: Real Connector against test environment**:
  - Connector hits real service, but in a test environment (sandbox API, test database).
  - **Pros**: tests real integration; cons: external dependency, network reliance, side effects.

  **Strategy selection**:
  - **Unit tests** (process logic only): mock workers / Camunda Process Test framework — fast.
  - **Integration tests** (Connector + process): stub services or sandbox APIs — medium.
  - **End-to-end tests**: real services in dedicated test environment — slow but comprehensive.

  **Best practices**:
  - **Layer your test pyramid**: many unit tests, fewer integration tests, fewest E2E tests.
  - **Deterministic tests**: avoid flaky tests dependent on external state.
  - **Document mocking strategy**: clear convention so team adds tests consistently.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple mocking patterns: mock workers + framework + stubs + conditional activation; layered test pyramid.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** Combine mock workers, testing framework support, external stub services, conditional Connector activation; layer the test pyramid.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "integration tests mock Connectors." Test mocking.

**Въпросът → Solution Framing.** "Connector mocking" — изпитва се knowledge на test strategies.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че multiple patterns, че layered pyramid, че stubs vs full mocking trade-offs. Това е знание за Connector test mocking.

---

# Section 6 — Extensions (Questions 37-50)

> Weight 23% • Topics: FEEL replace-all, contains case-sensitivity, decision literal expression, function invocation, Spring config override hierarchy, Node Promise/Async, REST pagination, SDK reconnection, Connector input validation, Inbound pre-correlation transformation, RPA screenshot capture, decimal precision, list partition, gRPC TLS.

---

## Question 37: Extensions (Weighting: 23%)

**Scenario:** A FEEL expression needs to replace ALL occurrences of `"foo"` with `"bar"` in a string, not just the first. The team wonders which function and how.

**FEEL function for replace-all in strings?**

- **a)** **`replace(input, pattern, replacement)`** uses a regex pattern; by default, regex `replace` is global (replaces all occurrences) — verify per FEEL implementation. For literal replacement (no regex semantics), escape special chars or use `string` manipulations. Example: `=replace("foo bar foo", "foo", "x")` → `"x bar x"`. **Distinct from `substring`** (returns substring) and `replace` on lists. Documentation: [FEEL String Functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **b)** `replaceFirst` — partial; verify exact functions. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** No replace function — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Substring-based loop — overcomplicated. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `replace` function:

  **Signature** (verify per FEEL implementation):
  - `replace(input: string, pattern: string, replacement: string)` 
  - Some FEEL implementations: also `replace(input, pattern, replacement, flags)` for regex flags.

  **Behavior**:
  - **Pattern is a regex**: by DMN FEEL spec, replace uses regex semantics (global by default).
  - **Replacement**: may support backreferences (`$1`, `$2`) for captured groups.
  - **Returns**: new string with replacements.

  **Examples**:
  ```feel
  replace("foo bar foo", "foo", "x")   → "x bar x"
  replace("a1b2c3", "[0-9]", "*")      → "a*b*c*"
  replace("hello world", "(\w+) (\w+)", "$2 $1")  → "world hello"
  ```

  **Literal (non-regex) replace pattern**:
  - To replace a string containing regex special chars literally: escape them.
  - Special chars: `. * + ? ( ) [ ] { } | \ ^ $`.
  - Example: replace literal `"."` → use `\.` in pattern.

  **For simple literal replacement on safe strings**: `replace` works without escaping.

  **Combined with other functions**:
  ```feel
  replace(upper case(input), "FOO", "BAR")
  ```

  **For more complex transforms**: chain or use multiple replace calls.

  **Don't confuse with**:
  - `substring(string, start, length)`: extract part of string.
  - `string length(s)`: get string length.
  - `split(s, delimiter)`: split into list.

  Verify `replace`'s exact signature + regex behavior in your Camunda FEEL version.

- **Option b) — Partial.** Verify.

- **Option c) — Wrong.**

- **Option d) — Overcomplicated.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. replace(input, pattern, replacement) with regex (global by default per DMN FEEL).
- **b) 5/10** — partial.
- **c) 1/10** — wrong.
- **d) 2/10** — overcomplicated.

**Correct Answer:** `replace(input, pattern, replacement)` — regex-based, global by default per DMN FEEL spec.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "replace ALL occurrences." String replace.

**Въпросът → Solution Framing.** "Replace-all function" — изпитва се knowledge на FEEL string functions.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че replace() with regex, че global by default. Това е знание за FEEL replace.

---

## Question 38: Extensions (Weighting: 23%)

**Scenario:** FEEL `contains(string, search)` checks substring. The team wonders if it's case-sensitive — does `contains("Hello", "hello")` return true or false?

**`contains` case-sensitivity?**

- **a)** **`contains` is case-sensitive in FEEL** (typical default per DMN FEEL spec). `contains("Hello", "hello")` returns `false` because `"hello"` (lowercase) is not literally found in `"Hello"` (capital H). **For case-insensitive matching**: normalise both sides first: `contains(lower case(s), lower case(search))`. Verify exact behavior per FEEL implementation. Documentation: [FEEL String Functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **b)** Case-insensitive — wrong typically. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Configurable — partial. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Returns null — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `contains` semantic (per DMN FEEL spec):

  **Case-sensitive matching**:
  - `contains("Hello World", "Hello")` → `true`.
  - `contains("Hello World", "hello")` → `false` (lowercase differs).
  - `contains("Hello World", "World")` → `true`.
  - `contains("Hello World", "world")` → `false`.

  **For case-insensitive**:
  ```feel
  contains(lower case(name), lower case("smith"))
  ```
  - Normalise both to lowercase (or uppercase) first.
  - Then `contains` checks against same-case strings.

  **Locale considerations**:
  - `lower case` / `upper case`: typically Unicode-aware (e.g., Greek capital Σ → lowercase σ).
  - Some locale-specific edge cases (e.g., Turkish dotted/dotless I) may behave unexpectedly with default case folding.

  **Related case-sensitive functions** (typically):
  - `starts with(s, prefix)`: also case-sensitive.
  - `ends with(s, suffix)`: also case-sensitive.
  - `matches(s, regex)`: regex flag controls case (some FEEL implementations).

  **Best practices**:
  - **Document expected case-sensitivity** in input data contracts.
  - **Normalise at entry**: convert inputs to canonical case in Input Mapping.
  - **For user-typed search**: always lower-case both sides for forgiving UX.

  **Anti-patterns**:
  - Relying on `contains` for fuzzy matching: it's strict literal.
  - Mixing case-sensitive and case-insensitive checks in same model: inconsistency bugs.

  Verify exact `contains` semantic in your FEEL version's docs.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. contains case-sensitive; normalise via lower/upper case for case-insensitive.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Case-sensitive; use `contains(lower case(s), lower case(search))` for case-insensitive matching.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Hello vs hello contains." Case sensitivity.

**Въпросът → Solution Framing.** "contains case-sensitive" — изпитва се FEEL string semantic.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че case-sensitive default, че normalise for case-insensitive. Това е знание за FEEL case.

---

## Question 39: Extensions (Weighting: 23%)

**Scenario:** A DMN decision has a **single output cell with FEEL expression** (no decision table, no DRG dependency). Team calls this a "literal expression." They wonder how it differs from a decision table.

**DMN Literal Expression vs Decision Table?**

- **a)** **Literal Expression** is a decision logic type where the decision's body is a **single FEEL expression** that produces the output. Useful when logic is more naturally a formula or function call than tabular rules. **Decision Table** is the tabular logic type (rules with inputs / outputs / hit policy). **Both are first-class DMN constructs**; choose by which represents the logic best. Decisions in a DMN file can mix types — one decision uses a table, another uses a literal expression. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Same thing — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Literal Expression deprecated — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Decision Table is wrapper — partial. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN decision body types:

  **Literal Expression**:
  - Body = single FEEL expression.
  - Example: `=if income > 100000 then "high" else "normal"`.
  - Output is whatever the expression evaluates to.
  - **Best for**: short logic, calculations, conditional formulas.

  **Decision Table**:
  - Body = table with rules (rows), inputs (columns), outputs (columns), hit policy.
  - Each rule: input conditions + output values.
  - **Best for**: enumerable cases, business-rule-style logic, regulatory mappings.

  **Other DMN decision body types** (per DMN spec):
  - **Boxed Expression**: structured editor for complex FEEL expressions; nested boxes for sub-expressions.
  - **Context**: name-value pairs forming a structured output.
  - **Function Definition**: defines a callable function (commonly within BKM).
  - **Invocation**: calls a BKM with bound arguments.
  - **Iteration**: list / for-each boxed expressions.

  **Picking the right type**:
  - **Tabular enumerated logic**: Decision Table.
  - **Single formula / lookup**: Literal Expression.
  - **Reusable function-like logic**: BKM with Function Definition.
  - **Structured composite output**: Context.

  **In DMN file**:
  - `<decision>` element has child indicating type:
    - `<literalExpression>`: literal type.
    - `<decisionTable>`: tabular type.
    - `<context>`, `<functionDefinition>`, etc.

  **In Web Modeler**:
  - When creating a decision, choose type.
  - UI tailored per type (table editor vs FEEL editor).

  **Mixing types**:
  - Single DMN file can have decisions of different types.
  - Composition via DRD relationships.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Literal Expression = single FEEL expression as body; Decision Table = tabular rules; both first-class.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** Literal Expression's body is a single FEEL expression; Decision Table's body is tabular rules; both first-class DMN types.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "literal expression vs decision table." Decision body types.

**Въпросът → Solution Framing.** "Differ from decision table" — изпитва се DMN decision logic types.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Literal Expression = single FEEL, че Decision Table = tabular, че picking right type matters. Това е знание за DMN body types.

---

## Question 40: Extensions (Weighting: 23%)

**Scenario:** A FEEL expression invokes a function with **named arguments** (`myFunc(a: 1, b: 2)`) vs **positional** (`myFunc(1, 2)`). Team wonders if both syntaxes are supported.

**Function invocation syntaxes in FEEL?**

- **a)** **FEEL typically supports both positional and named-argument syntax** per DMN spec:
  - **Positional**: `myFunc(1, 2)` — arguments by order.
  - **Named**: `myFunc(a: 1, b: 2)` — arguments by parameter name (order doesn't matter).
  - Named is useful for: clarity, optional arguments, future-compat (adding new optional params without breaking callers).
  - Built-in FEEL functions: many can be called either way (e.g., `substring(s, 2, 5)` or `substring(string: s, start position: 2, length: 5)`).
  
  Verify exact named-call support per FEEL version. Documentation: [FEEL Expressions](https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-functions/)

- **b)** Positional only — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Named only — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Neither — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL function invocation syntaxes:

  **Positional invocation**:
  ```feel
  substring("hello world", 2, 5)
  ```
  - Arguments in declaration order.
  - Concise; familiar from most languages.

  **Named invocation** (DMN FEEL spec):
  ```feel
  substring(string: "hello world", start position: 2, length: 5)
  ```
  - Arguments by parameter name (built-in FEEL parameters often have spaces; quoting / escape rules vary).
  - Order-independent.
  - Clarity at call site.

  **Benefits of named**:
  - **Self-documenting**: reader knows what each argument is.
  - **Optional arguments**: skip parameters with default values.
  - **Forward compatibility**: adding new optional params doesn't break callers.

  **Built-in FEEL functions**:
  - Have parameter names defined.
  - Both call styles work (typically).

  **User-defined functions** (in DMN BKM or via inline function definitions):
  - Defined parameters can be referenced by name.

  **Mixing**:
  - Some FEEL implementations may allow mixing positional + named in one call.
  - Verify per FEEL version.

  **Pitfalls**:
  - **Parameter names with spaces**: built-in FEEL uses parameter names like `start position`, `match` — call syntax may need backticks or specific escaping.
  - **Renamed parameters**: if FEEL spec changes parameter name in a version, named callers may break.

  **Best practices**:
  - **Positional** for short, well-known functions (`upper case(s)`).
  - **Named** for functions with many optional params or non-obvious order.
  - **Test invocation syntax** in your Camunda FEEL version before production use.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL supports both positional and named invocation per DMN spec; named for clarity / optional params.
- **b) 2/10** — wrong.
- **c) 2/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Both positional `myFunc(1, 2)` and named `myFunc(a: 1, b: 2)` syntaxes supported per DMN FEEL spec.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-functions/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "named vs positional arguments." Function invocation syntax.

**Въпросът → Solution Framing.** "Both supported" — изпитва се FEEL invocation flexibility.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че both syntaxes, че named for clarity, че built-ins typically support both. Това е знание за FEEL function calls.

---

## Question 41: Extensions (Weighting: 23%)

**Scenario:** Spring Boot app configures Zeebe client via `application.yaml`. Same property is also set via environment variable `CAMUNDA_CLIENT_BROKER_URL`. The team wonders which wins.

**Spring config override hierarchy?**

- **a)** **Standard Spring Boot config precedence** (highest to lowest, simplified):
  1. **Command-line arguments** (e.g., `--camunda.client.broker.url=...`).
  2. **JNDI attributes**.
  3. **OS environment variables** (e.g., `CAMUNDA_CLIENT_BROKER_URL`).
  4. **System properties** (`-D` JVM flags).
  5. **application-{profile}.yaml** (active profile).
  6. **application.yaml** (default).
  
  Environment variables override application.yaml. Verify Spring Boot version's exact ordering. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/) + Spring Boot docs.

- **b)** application.yaml wins — wrong. Documentation: [Spring Boot](https://spring.io/projects/spring-boot)

- **c)** First loaded wins — wrong; specific precedence rules. Documentation: [Spring Boot](https://spring.io/projects/spring-boot)

- **d)** Random — wrong. Documentation: [Spring Boot](https://spring.io/projects/spring-boot)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Spring Boot property-resolution precedence (high to low, simplified):

  **Standard order**:
  1. **DevTools global settings** (`~/.spring-boot-devtools.properties` in dev mode).
  2. **@TestPropertySource** annotations in tests.
  3. **Command line arguments**: `java -jar app.jar --foo=bar`.
  4. **Properties from `SPRING_APPLICATION_JSON`**.
  5. **ServletConfig init parameters**.
  6. **ServletContext init parameters**.
  7. **JNDI attributes from `java:comp/env`**.
  8. **Java System properties**: `-Dfoo=bar`.
  9. **OS environment variables**: `FOO=bar` in shell.
  10. **`@PropertySource` annotations**.
  11. **`application-{profile}.yaml/properties`** for active profile.
  12. **`application.yaml/properties`** (default).
  13. **`@PropertySource` annotations in `@Configuration`**.
  14. **Default properties** (e.g., set via SpringApplication.setDefaultProperties).

  **For the scenario**:
  - `application.yaml`: position 12 (default profile) or 11 (active profile).
  - **`CAMUNDA_CLIENT_BROKER_URL`**: environment variable (position 9) — **wins over yaml**.

  **Property name mapping**:
  - YAML: `camunda.client.broker.url`.
  - Env var: `CAMUNDA_CLIENT_BROKER_URL` (uppercased, dots → underscores).
  - Spring Boot's relaxed binding handles the mapping.

  **Profiles**:
  - `application-prod.yaml` (active profile): wins over `application.yaml`.
  - But env var still wins over both.

  **Practical implications**:
  - **Container deployments**: env vars are the standard way to override config — works with Kubernetes / Docker secrets / etc.
  - **Local dev**: application.yaml convenient.
  - **Tests**: @TestPropertySource overrides yaml for test scenarios.

  **Anti-patterns**:
  - **Mixing config sources**: setting same property in 3+ places → confusion. Pick canonical source.
  - **Secrets in application.yaml**: anti-pattern; use env vars or external secret managers.

  Verify exact Spring Boot version's docs for full precedence list (changes over versions).

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Env vars override application.yaml per Spring Boot precedence; CLI args > env > system props > yaml.
- **b) 1/10** — wrong.
- **c) 2/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Env var `CAMUNDA_CLIENT_BROKER_URL` wins over `application.yaml` per Spring Boot precedence (env > yaml).

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "yaml vs env var same property." Spring config precedence.

**Въпросът → Solution Framing.** "Override hierarchy" — изпитва се Spring Boot config order.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че env > yaml, че CLI > env, че relaxed binding maps names. Това е знание за Spring config precedence.

---

## Question 42: Extensions (Weighting: 23%)

**Scenario:** Node.js worker using @camunda8/sdk processes jobs. Handler is `async function` returning a Promise. Team wonders if SDK properly waits for the Promise to resolve before considering the job complete.

**Node.js SDK + async handlers — does Promise resolution dictate job completion?**

- **a)** **Yes — typical Node.js Zeebe SDKs handle async handlers**:
  - **Async function returns a Promise**.
  - **SDK awaits the Promise**:
    - **Resolves with a value**: SDK calls `job.complete(value)` (auto-complete equivalent).
    - **Rejects with an error**: SDK calls `job.fail(error)`.
    - **Throws a specific BPMN error class**: SDK calls `job.error(...)` (if supported).
  - Without awaiting, the SDK would return "instantly" and consider the job done before async work finishes — incorrect for async workers.
  
  Documentation: [Node.js SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/) + [JS Workers](https://docs.camunda.io/docs/apis-tools/working-with-apis-tools/)

- **b)** No — fire-and-forget — wrong. Documentation: [Node SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **c)** Only with explicit await — partial. Documentation: [Node SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **d)** Promise must be returned in callback — partial. Documentation: [Node SDK](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Node.js Camunda SDK handles async handlers properly:

  **Handler pattern** (idiomatic):
  ```js
  zbc.createWorker({
    taskType: "process-payment",
    taskHandler: async (job) => {
      const result = await callPaymentAPI(job.variables);
      return { paymentId: result.id, status: "completed" };
    }
  });
  ```

  **SDK behavior**:
  - **Awaits the returned Promise**.
  - **On resolve**: takes the resolved value; calls `job.complete(value)` (or equivalent auto-complete).
  - **On reject**: catches the error; calls `job.fail(error)` (or maps BPMN errors).
  - **On thrown BpmnError-like**: maps to `job.error(errorCode, errorMessage)`.

  **Without async (callback / sync pattern)**:
  - Older Node SDKs may have used callback patterns.
  - Modern SDKs typically support async/await.
  - Sync handlers: SDK awaits the returned value (resolved Promise wraps).

  **Common pitfalls**:

  **Pitfall 1: Not returning the Promise**:
  ```js
  taskHandler: async (job) => {
    callPaymentAPI(job.variables);  // fire-and-forget — BAD
    return "ok";  // returns before API call completes
  }
  ```
  - SDK sees handler complete; calls job.complete prematurely.
  - API call may complete much later (or fail silently).
  - **Fix**: `await` the call.

  **Pitfall 2: Unhandled rejection**:
  ```js
  taskHandler: async (job) => {
    Promise.reject(new Error("fail"));  // unhandled rejection — BAD
  }
  ```
  - Promise rejection not awaited; SDK may not see it.
  - **Fix**: `await` or return the Promise.

  **Pitfall 3: Handling errors manually**:
  ```js
  taskHandler: async (job) => {
    try {
      await callAPI();
      return "ok";
    } catch (e) {
      // swallows error — SDK sees success — BAD
    }
  }
  ```
  - Caught error hides failure from SDK.
  - **Fix**: re-throw or explicitly call `job.fail`.

  **Best practices**:
  - **Let the SDK handle errors**: rethrow to let SDK call fail/error.
  - **Use BpmnError class** for business errors (if SDK supports).
  - **autoComplete defaults**: SDK auto-completes on resolve; opt-out for manual control.

  Verify SDK version's exact API and behavior.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. SDK awaits returned Promise; resolves → complete; rejects → fail; BpmnError-like → error.
- **b) 1/10** — wrong.
- **c) 5/10** — partial.
- **d) 5/10** — partial.

**Correct Answer:** SDK awaits the returned Promise; resolution = job.complete, rejection = job.fail; BPMN error throws = job.error.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/node-js-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "async function Promise resolve." Node async handler.

**Въпросът → Solution Framing.** "SDK waits for Promise" — изпитва се Node SDK async semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SDK awaits, че resolve → complete, че pitfalls (no await, unhandled rejection, swallowed errors). Това е знание за Node async handlers.

---

## Question 43: Extensions (Weighting: 23%)

**Scenario:** A REST Outbound Connector fetches data from an external paginated API: `?page=1&pageSize=100` returns 100 items + nextPage = 2. Team needs to fetch all pages until exhausted. They wonder how to model this in BPMN.

**Pagination pattern for REST Connector?**

- **a)** **BPMN-level pagination loop**:
  - **Loop**: standard loop subprocess or a Looping pattern.
  - **State**: current page number, accumulator for all items.
  - **Inside loop**: REST Connector fetches one page; appends items to accumulator; updates page number; checks if more pages.
  - **Exit condition**: response.nextPage == null OR last page indicator.
  - **Output**: accumulated items in process variable.
  
  Alternative: external worker (custom) handles paging entirely in one job. Choose based on complexity / observability needs (loop visible in Operate). Documentation: [REST Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/) + [Loops](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Connector auto-paginates — partial; verify per Connector. Documentation: [REST Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

- **c)** Pagination impossible — wrong. Documentation: [REST Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

- **d)** Manual single-page only — partial. Documentation: [REST Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Pagination patterns in Camunda 8:

  **Standard REST Outbound Connector**:
  - Single HTTP call per invocation; doesn't auto-paginate.
  - For pagination: need loop logic in BPMN or in a custom worker.

  **Pattern 1: BPMN-level loop (Standard Loop / Loop subprocess)**:

  ```
  [Start] → [Initialize: page=1, items=[]] → [Loop Subprocess]
                                                     ↓
                                            [REST Call (page)]
                                                     ↓
                                            [Update: items ⊕ response.data, page=response.nextPage]
                                                     ↓
                                            [Check: more pages?]
  ```
  - Loop subprocess with `loopCharacteristics` (Standard Loop) or Sequential MI (if knowing total upfront).
  - Continue while nextPage != null.
  - Final `items` variable has accumulated list.

  **Pattern 2: External worker handles full pagination**:
  - Service Task with custom job worker.
  - Worker code paginates internally:
    ```js
    let allItems = [];
    let page = 1;
    while (true) {
      const resp = await fetch(`/api?page=${page}`);
      const data = await resp.json();
      allItems.push(...data.items);
      if (!data.nextPage) break;
      page = data.nextPage;
    }
    return { items: allItems };
    ```
  - Process sees single Service Task; pagination invisible.
  - Pros: simpler BPMN; cons: less observable (no per-page progress in Operate).

  **Pattern 3: Camunda 8.x Connector auto-pagination** (verify per version):
  - Some Connectors / future versions may have built-in pagination support.
  - Configure: pagination type (page-number / cursor / link-header), max pages, etc.

  **Trade-offs**:

  | Aspect | BPMN loop | Worker pagination | Connector built-in |
  |---|---|---|---|
  | Observability | High (each call visible) | Low | Medium |
  | Complexity | High (state management) | Low | Low if available |
  | Performance | Slower (BPMN overhead per call) | Faster | Best |
  | Process duration impact | Long-running | Short | Short |
  | Error handling | Per-call retries | Per-page in worker | Built-in |

  **Best practices**:
  - **Small pagination** (few pages): BPMN loop fine.
  - **Large pagination** (many pages): worker preferred; less Operate noise.
  - **Streaming results downstream**: BPMN loop with per-page processing in sub-tasks.
  - **Cap max pages**: prevent runaway loops on misbehaving APIs.

- **Option b) — Partial.** Verify per Connector.

- **Option c) — Wrong.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. BPMN loop or external worker; trade-offs on observability / complexity / performance.
- **b) 5/10** — partial.
- **c) 1/10** — wrong.
- **d) 5/10** — partial.

**Correct Answer:** BPMN-level loop or external worker handles pagination; choose based on observability / complexity trade-offs.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "paginated API page=1 pageSize=100 nextPage." Pagination.

**Въпросът → Solution Framing.** "Pagination pattern" — изпитва се pagination strategies.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BPMN loop visible, че worker simpler, че trade-offs on observability. Това е знание за pagination patterns.

---

## Question 44: Extensions (Weighting: 23%)

**Scenario:** A Java SDK worker loses gRPC connection to Zeebe (network blip). Team wonders if the SDK auto-reconnects or if the worker process crashes.

**SDK reconnection behavior on network issues?**

- **a)** **Camunda SDKs typically have built-in resilience**:
  - **Automatic reconnection**: SDK monitors connection; on disconnect, retries with backoff.
  - **In-flight jobs**: jobs currently being processed locally complete (or fail) and report back when connection restores.
  - **New job polling**: pauses until connection restored.
  - **Process continues**: worker process doesn't crash on transient network issues.
  - **Configurable**: retry intervals, max retries, backoff strategy via SDK config.
  
  For prolonged outages: alerting via health endpoints; worker eventually backs off / surfaces issue. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/) + [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Worker crashes — wrong. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** No retry — wrong. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** Must restart manually — wrong. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** SDK resilience to connection issues:

  **Built-in reconnection**:
  - SDK uses gRPC's connection management.
  - On disconnect (TCP reset, broker restart, network partition): SDK detects.
  - **Backoff retry**: typically exponential or configurable.
  - **Polling pauses**: long-poll for jobs stops; resumes on reconnection.
  - **Local state preserved**: worker doesn't lose in-progress jobs.

  **In-flight jobs during outage**:
  - **Already-activated job**: local processing continues (no need for connection during compute).
  - **On completion**: SDK tries to send `job.complete` / `job.fail`; if connection still down, retries.
  - **If activation timeout exceeds**: broker re-activates job to another worker → duplicate execution risk (per Set 13 Q10).
  - **Mitigation**: idempotent worker code.

  **Long outages**:
  - Worker keeps trying; doesn't crash.
  - May exhaust retry budget; SDK logs warnings.
  - Health endpoints (Spring Actuator `/actuator/health`) surface connection state for monitoring.
  - Ops dashboards detect unhealthy workers.

  **Configuration knobs** (verify per SDK version):
  - **Initial retry delay**.
  - **Max retry delay** (backoff cap).
  - **Multiplier** (e.g., 2.0 = exponential).
  - **Max retries** (or unlimited).
  - **Connection timeout** + **keepalive settings**.

  **Health monitoring patterns**:
  - **Spring Actuator**: `/actuator/health/zeebeClient` indicator.
  - **Prometheus metrics**: connection state, retry counters.
  - **Logs**: SDK logs connection events at INFO / WARN level.

  **What happens in extreme cases**:
  - **Broker fully down**: SDK keeps retrying; jobs not processed; backlog grows.
  - **Network partition**: same as above.
  - **Broker accepting some workers, refusing others**: SDK retries; may surface auth / quota issues in logs.

  **Best practices**:
  - **Monitor connection health**: alert on disconnection.
  - **Idempotent workers**: critical given duplicate-execution risk.
  - **Test failure scenarios**: chaos engineering (kill broker, network glitches) — validate worker recovery.
  - **Worker process resilience**: ensure worker doesn't crash on transient SDK errors (let SDK handle).

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. SDK auto-reconnects with backoff; worker stays alive; idempotency mitigates duplicate execution.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** SDK auto-reconnects with configurable backoff; worker process stays alive; idempotent code handles duplicate execution risk.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "gRPC connection lost network blip." Connection resilience.

**Въпросът → Solution Framing.** "Auto-reconnects" — изпитва се SDK resilience.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че auto-retry with backoff, че worker stays alive, че idempotency mitigates. Това е знание за SDK reconnection.

---

## Question 45: Extensions (Weighting: 23%)

**Scenario:** A custom Connector accepts a numeric input. Team wants to validate it's positive non-zero before any side effects. They wonder if Connector SDK provides input validation.

**Connector SDK input validation?**

- **a)** **Connector SDK typically supports input validation**:
  - **Schema-based validation**: declare input types + constraints in OutboundConnectorTemplate (or equivalent), Connector framework validates at deployment + invocation.
  - **Programmatic validation**: in Connector code, validate inputs early; throw `ConnectorInputException` (or similar) with clear messages.
  - **JSR-303 annotations** (for Java SDK): `@NotNull`, `@Positive`, etc., on input bean fields; framework validates via Bean Validation.
  - **Custom validation logic**: arbitrary checks before main logic.
  
  Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** No validation support — wrong. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** Only after side effects — wrong. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **d)** Validation outside SDK — partial. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Connector SDK input validation patterns:

  **Java SDK with Bean Validation (JSR-303)**:
  ```java
  public class PaymentInput {
      @NotNull
      private String customerId;
      
      @Positive
      @NotNull
      private BigDecimal amount;
      
      @Pattern(regexp = "^(EUR|USD|GBP)$")
      private String currency;
      
      // getters / setters
  }
  ```
  - SDK framework validates inputs before invoking main `execute` method.
  - Validation failure: Connector throws `ConnectorInputException` (or similar); Camunda surfaces Incident.

  **Element Template constraints**:
  - In JSON template, declare type + constraints:
    ```json
    {
      "label": "Amount",
      "type": "Number",
      "binding": { ... },
      "constraints": {
        "notEmpty": true,
        "minLength": 1,
        "pattern": "^[0-9]+$"
      }
    }
    ```
  - Web Modeler validates at design-time (red error indicator if invalid).
  - Some constraints enforced at runtime by Connector framework.

  **Programmatic validation in Connector code**:
  ```java
  @Override
  public Object execute(OutboundConnectorContext context) {
      PaymentInput input = context.bindVariables(PaymentInput.class);
      if (input.getAmount().signum() <= 0) {
          throw new ConnectorInputException(
              "Amount must be positive, got: " + input.getAmount());
      }
      // proceed with logic
  }
  ```

  **Best practices**:
  - **Fail fast**: validate inputs at the top of `execute`, before any side effects.
  - **Clear error messages**: include the bad value + expected constraint.
  - **Use Bean Validation**: standardised, declarative, less boilerplate.
  - **Element Template constraints**: catch modeler errors at design-time, before deployment.

  **Layered validation**:
  - **Design-time**: Element Template constraints + Web Modeler checks.
  - **Deployment-time**: BPMN linter, schema checks.
  - **Runtime-pre**: framework validates inputs to Connector.
  - **Runtime-execute**: domain-specific business validation.

  Verify exact SDK features per version (Java / JS / Python SDKs differ).

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Connector SDK supports input validation (Bean Validation, Element Template constraints, programmatic checks).
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** Connector SDK supports input validation via Bean Validation annotations, Element Template constraints, and programmatic checks.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "validate positive non-zero before side effects." Input validation.

**Въпросът → Solution Framing.** "Validation in SDK" — изпитва се knowledge на SDK validation features.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Bean Validation, че Element Template constraints, че programmatic + layered. Това е знание за Connector validation.

---

## Question 46: Extensions (Weighting: 23%)

**Scenario:** An Inbound Connector receives an event with payload `{customer: {id: 100, email: "alice@example.com"}}`. Team wants to **flatten + transform** the payload before correlating — e.g., set `customerId = customer.id, customerEmail = customer.email`.

**Pre-correlation transformation for Inbound Connectors?**

- **a)** **Inbound Connectors typically support FEEL-based variable mapping** before correlation:
  - **Variable mapping expressions**: declare in Connector config; FEEL extracts / transforms fields from incoming payload.
  - **Correlation key expression**: FEEL evaluates a value from the (transformed) payload for correlation.
  - **Activation condition**: FEEL filter; only correlates if condition met.
  - **Result variables**: shape what lands in process scope after correlation.
  
  Example: variable mapping `=customer.id` extracts ID; correlation key uses that ID. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/inbound/) + [Webhook Connector](https://docs.camunda.io/docs/components/connectors/protocol/webhook/)

- **b)** Payload always raw — wrong. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/inbound/)

- **c)** Must transform in publisher — partial. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/inbound/)

- **d)** Cannot transform — wrong. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/inbound/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Inbound Connector data flow + transformation:

  **Lifecycle**:
  1. **External event arrives** (HTTP webhook, Kafka message, etc.).
  2. **Connector receives raw payload**.
  3. **Activation condition** (FEEL) evaluated; skip if false.
  4. **Correlation key expression** (FEEL) extracts correlation value from payload.
  5. **Variable mapping** (FEEL) transforms payload to process variables.
  6. **Camunda correlates**: finds matching subscription; activates process / continues instance with mapped variables.

  **Variable mapping** (FEEL):
  ```feel
  {
    customerId: customer.id,
    customerEmail: customer.email,
    customerName: customer.firstName + " " + customer.lastName,
    isPremium: contains(customer.tags, "premium"),
    receivedAt: now()
  }
  ```
  - Restructure nested payload to flat process variables.
  - Compute derived values (concatenations, calculations).
  - Drop fields that aren't needed.

  **Correlation key extraction**:
  - For Webhook with key in URL: `=request.headers.x-customer-id` or similar.
  - For Kafka with key in payload: `=customer.id` (after parsing).
  - For composite keys: `=customer.region + "-" + customer.id` (per Set 13 Q20).

  **Activation condition** (filter):
  - `=customer.country = "DE"` — only correlate German customer events.
  - `=event.type = "ORDER_PLACED"` — filter event types.
  - Reduces noise; only relevant events trigger BPMN.

  **Result variables** (per-Connector spec):
  - Some Connectors offer `resultExpression` for output shaping after correlation completes.
  - For Inbound: mapping happens BEFORE correlation typically.

  **Best practices**:
  - **Validate payload structure**: defensive FEEL handles missing fields (`=if customer != null then customer.id else null`).
  - **Decouple from external schema**: variable mapping is the boundary layer; future external-schema changes only impact mapping, not downstream BPMN.
  - **Test edge cases**: empty payloads, missing fields, type mismatches.

  Verify exact Connector capabilities per version.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Inbound Connectors support FEEL-based variable mapping + correlation key extraction + activation condition.
- **b) 1/10** — wrong.
- **c) 3/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Inbound Connectors use FEEL for variable mapping, correlation key extraction, and activation conditions — pre-correlation transformation is supported.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/inbound/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "flatten + transform before correlating." Pre-correlation transformation.

**Въпросът → Solution Framing.** "Inbound transformation" — изпитва се knowledge на Connector data flow.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че variable mapping FEEL, че correlation key + activation condition, че mapping is boundary layer. Това е знание за Inbound Connector mapping.

---

## Question 47: Extensions (Weighting: 23%)

**Scenario:** An RPA bot interacting with a legacy app fails sporadically. Team wants **automatic screenshot capture on failure** to debug.

**RPA screenshot-on-failure for debugging?**

- **a)** **Typical RPA frameworks** support automatic screenshot capture on failures — verify per Camunda RPA / underlying framework. **Configuration**:
  - **Auto-capture on exception**: framework hooks; screenshot taken when bot throws.
  - **Storage**: local file system / cloud storage; attached to bot run result.
  - **Retention**: configurable; may be limited by storage policy.
  - **Privacy**: screenshots may contain PII / sensitive data; consider redaction or restricted access.
  
  Camunda integration: bot result includes screenshot reference; downstream BPMN can route based on failure type. Documentation: [Camunda RPA](https://docs.camunda.io/docs/components/rpa/) + RPA framework docs.

- **b)** Not supported — wrong typically. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/)

- **c)** Always full-screen — partial. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/)

- **d)** Manual screenshots only — overstates. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** RPA screenshot-on-failure patterns:

  **Auto-capture mechanisms** (typical):
  - **Exception hooks**: framework catches uncaught exceptions; captures screenshot before propagating.
  - **Per-step capture**: optional screenshots after each action for full visual trace.
  - **On-demand capture**: bot code calls `screenshot()` explicitly at points of interest.

  **Configuration**:
  - **Enabled / disabled**: typically configurable per project.
  - **Capture scope**: full screen vs target window vs region.
  - **Resolution**: native vs reduced (for storage efficiency).
  - **Format**: PNG / JPEG.

  **Storage**:
  - **Local**: bot worker writes to filesystem; later uploaded.
  - **Cloud**: directly to S3 / Azure Blob.
  - **Camunda integration**: screenshot URL / ID stored in process variables for BPMN visibility.

  **Retention**:
  - Driven by privacy / cost / debugging needs.
  - Critical failures: keep long-term.
  - Routine successes: short-term or none.

  **Privacy + security considerations**:
  - **PII risk**: screenshots may show customer data, passwords, internal screens.
  - **Redaction**: difficult automatically; better to skip screenshots when on sensitive screens.
  - **Access control**: restrict who can view screenshots (audit log access).
  - **Compliance**: GDPR / HIPAA may require explicit handling rules.

  **Integration with BPMN**:
  - Bot completion: returns variables including screenshot reference.
  - Error Boundary on RPA Task: catches bot failure; downstream process can:
    - Route to manual review with screenshot displayed in form.
    - Send alert to ops with screenshot attached.
    - Trigger retry with diagnostic info.

  **Debugging workflow**:
  1. RPA bot fails.
  2. Screenshot captured + uploaded.
  3. Process Incident in Operate with screenshot URL.
  4. Engineer opens Operate; clicks link; sees screenshot.
  5. Diagnoses (e.g., "popup blocked the action" or "page changed structure").
  6. Fixes bot or retries.

  Verify exact RPA features per Camunda 8 RPA edition / version.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Overstates.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. RPA frameworks support auto screenshot on failure; configurable; integrate with BPMN for debugging.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 3/10** — overstates.

**Correct Answer:** Typical RPA frameworks support auto screenshot-on-failure; configure scope / storage / privacy; integrate with BPMN for debugging.

**Official Documentation Link:** https://docs.camunda.io/docs/components/rpa/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "automatic screenshot on failure debug." RPA observability.

**Въпросът → Solution Framing.** "Screenshot-on-failure" — изпитва се knowledge на RPA debugging features.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че auto-capture typical, че configurable, че privacy + integration considerations. Това е знание за RPA debugging.

---

## Question 48: Extensions (Weighting: 23%)

**Scenario:** FEEL arithmetic on financial calculations: `=2.5 * 0.1`. Team wonders if floating-point quirks (e.g., `0.1 + 0.2 = 0.30000000000000004` in JS) affect FEEL.

**FEEL decimal arithmetic precision?**

- **a)** **FEEL typically uses arbitrary-precision decimals** (BigDecimal-style in Java implementations) for number arithmetic per DMN spec — avoids floating-point quirks. `=2.5 * 0.1` returns exact `0.25`. `=0.1 + 0.2` returns exact `0.3`. Verify exact behavior in your FEEL version (some implementations may behave differently). **Pitfalls when crossing language boundaries**: JSON / JS engines use IEEE 754 floats; values may lose precision when serialised through them. Documentation: [FEEL Data Types](https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-data-types/)

- **b)** Same as JS floats — wrong typically. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Integer only — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Configurable precision — partial. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL number type per DMN spec:

  **Arbitrary-precision decimals**:
  - DMN FEEL number type is logically arbitrary precision (BigDecimal in Java implementations).
  - **Result**: standard arithmetic operations preserve precision.
  - `=0.1 + 0.2` → `0.3` (exact).
  - `=2.5 * 0.1` → `0.25` (exact).
  - `=1 / 3` → some representable decimal (terminating); FEEL handles per spec.

  **Comparison with IEEE 754** (JS / float32 / float64):
  - JS: `0.1 + 0.2` → `0.30000000000000004` (binary float can't exactly represent 0.1).
  - Java float / double: same issue.
  - FEEL BigDecimal: exact decimal representation; no binary-float artifact.

  **Boundary issues**:

  **Serialization through JSON**:
  - FEEL computes precise value.
  - Variable stored as decimal type.
  - **If serialised via standard JSON** (which uses double): precision may be lost.
  - Example: FEEL value `0.30` → JSON `0.3` → reparse as JS → `0.3` (or with float artifact in some libs).
  - For high precision: use string-encoded decimals.

  **REST APIs**:
  - JSON payload precision depends on parser library (Jackson can preserve via BigDecimal; default Java may use Double).
  - Spring Zeebe SDK: typically preserves precision for FEEL variables.

  **Worker languages**:
  - **Java**: BigDecimal preserves.
  - **JS / Node**: Number is double; precision loss possible.
  - **Python**: int / Decimal vs float matters.

  **Best practices for financial calculations**:
  - **Compute in FEEL**: leverage exact arithmetic.
  - **Store as decimal string**: when crossing JSON / language boundaries, use string-encoded decimals to avoid float drift.
  - **Round explicitly**: use `decimal(value, scale)` FEEL function to control precision (per Set 11 Q49 discussion).
  - **Test edge cases**: division by 3, repeating decimals, very small / large numbers.

  Verify exact arithmetic semantics in your Camunda FEEL version.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL uses arbitrary-precision decimals per DMN spec; no IEEE 754 quirks within FEEL; boundary issues at serialisation.
- **b) 2/10** — wrong.
- **c) 1/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** FEEL uses arbitrary-precision decimals (BigDecimal-style); exact arithmetic; precision may be lost at JSON / cross-language boundaries.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/language-guide/feel-data-types/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "floating-point quirks 0.1 + 0.2." Decimal precision.

**Въпросът → Solution Framing.** "FEEL decimal precision" — изпитва се FEEL number semantic.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL = arbitrary precision, че IEEE 754 doesn't apply within FEEL, че boundary issues at JSON / cross-language. Това е знание за FEEL numerics.

---

## Question 49: Extensions (Weighting: 23%)

**Scenario:** A FEEL expression needs to **split a list into chunks of 3**: e.g., `[1,2,3,4,5,6,7,8]` → `[[1,2,3], [4,5,6], [7,8]]`. Team wonders if FEEL has a partition / chunk function.

**FEEL list partition / chunk?**

- **a)** **No standard FEEL function for chunking** typically; use **for-loop with index** to partition:
  ```feel
  for i in 1..ceiling(count(items) / 3)
     return items[(i-1)*3+1..min(i*3, count(items))]
  ```
  Computes chunk count (ceil(N/3)); slices each chunk via range indexing. Or: build via `concatenate` / recursion patterns. Verify exact FEEL list functions per version — some may add `partition` natively. Documentation: [FEEL List Functions](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** Built-in `partition` — partial; verify per version. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Impossible — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Use external worker — overstates. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL list partitioning via expression composition:

  **Standard FEEL list functions** (verify per version):
  - `count(list)`: length.
  - `sublist(list, start, length)`: slice.
  - `range[a..b]` indexing: `items[1..3]` → first three elements.
  - `for x in list return ...`: list comprehension.
  - `filter(list, predicate)`: predicate filter.
  - `concatenate(l1, l2, ...)`: combine.

  **Partition via for-loop + slicing**:
  ```feel
  for i in 1..ceiling(count(items) / 3)
    return items[(i-1)*3+1..min(i*3, count(items))]
  ```

  **Explanation**:
  - `count(items) / 3`: how many full chunks (decimal if remainder).
  - `ceiling(...)`: round up for partial last chunk.
  - `1..n`: range from 1 to n.
  - `items[(i-1)*3+1..min(i*3, count(items))]`: for chunk i, slice indices.
    - Chunk 1: items[1..3].
    - Chunk 2: items[4..6].
    - Chunk 3: items[7..min(9, 8)] = items[7..8].
  - Returns list of lists.

  **Alternative: predicate-based**:
  - More complex; for-loop approach typically clearer.

  **Edge cases**:
  - Empty list: `count = 0`, loop range `1..0` → empty result.
  - Less than chunk size: single chunk with all items.
  - Exact multiple: clean chunks; no partial last.

  **If FEEL adds `partition` natively** (verify):
  - `partition(list, chunkSize)`: cleaner API.
  - Functional equivalence to the manual expression.

  **For very large lists**:
  - FEEL expression-level loops may be slow for huge inputs.
  - Consider doing the partition in a worker (Java / Node) instead.

  **Practical use cases**:
  - Batch processing: chunk N items per API call to fit rate limits.
  - UI display: pagination of results.
  - Parallel processing: MI subprocess on chunks.

- **Option b) — Partial.** Verify.

- **Option c) — Wrong.**

- **Option d) — Overstates.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. No standard partition; compose via for-loop with index slicing.
- **b) 5/10** — partial.
- **c) 1/10** — wrong.
- **d) 3/10** — overstates.

**Correct Answer:** Compose via for-loop + range indexing: `for i in 1..ceiling(count(items)/3) return items[(i-1)*3+1..min(i*3, count(items))]`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "split list into chunks of 3 partition." List partition.

**Въпросът → Solution Framing.** "Partition function" — изпитва се FEEL list-manipulation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че no standard partition, че for-loop + slicing compose, че range indexing supports. Това е знание за FEEL list partition.

---

## Question 50: Extensions (Weighting: 23%)

**Scenario:** A team's worker connects to Zeebe via gRPC over public internet. Security team requires TLS. They wonder how to enable + verify TLS in the SDK.

**gRPC TLS configuration + verification?**

- **a)** **Camunda SDKs typically default to TLS for gRPC** (especially SaaS endpoints). Configuration:
  - **`ZEEBE_GRPC_ADDRESS`**: typically uses TLS port (often 443 / 26500).
  - **`ZEEBE_USE_PLAINTEXT`** or `usePlaintext`: control flag; default `false` (= TLS).
  - **Server certificate verification**: SDK verifies against CA bundle (system / configured).
  - **Custom CA**: for self-signed / private CA, configure trust store.
  - **Verification**: logs / health check confirm TLS handshake; broker rejects plaintext connections in TLS-required mode.
  
  For Self-Managed: ensure broker is configured for TLS; certificate matches DNS name. Documentation: [Zeebe TLS](https://docs.camunda.io/docs/self-managed/concepts/) + [SDK Auth](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** TLS not supported — wrong. Documentation: [Zeebe](https://docs.camunda.io/docs/components/zeebe/)

- **c)** Always plaintext — wrong. Documentation: [Zeebe](https://docs.camunda.io/docs/components/zeebe/)

- **d)** External proxy needed — partial. Documentation: [Zeebe](https://docs.camunda.io/docs/components/zeebe/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe gRPC TLS configuration:

  **SaaS** (production-ready TLS by default):
  - Endpoint: `<cluster-id>.<region>.zeebe.camunda.io:443` (typically).
  - TLS enabled and required.
  - SDK validates server cert against public CA.
  - No additional client-side TLS config needed beyond authentication.

  **Self-Managed**:
  - **Broker TLS configuration**: 
    - `zeebe.broker.gateway.security.enabled: true`.
    - `zeebe.broker.gateway.security.certificateChainPath`: server cert.
    - `zeebe.broker.gateway.security.privateKeyPath`: server private key.
  - **Client configuration**:
    - `usePlaintext: false` (default).
    - **CA certificate**: SDK validates against JVM truststore (`cacerts`) by default.
    - **Custom CA**: configure via `caCertificatePath` or import to truststore.

  **SDK config examples**:

  **Spring Zeebe**:
  ```yaml
  camunda:
    client:
      mode: self-managed  # or saas
      zeebe:
        grpc-address: https://zeebe.example.com:26500
      auth:
        client-id: ${CLIENT_ID}
        client-secret: ${CLIENT_SECRET}
  ```
  - HTTPS scheme implies TLS.

  **Node SDK**:
  ```js
  const zbc = new ZeebeClient({
    ZEEBE_ADDRESS: "zeebe.example.com:26500",
    ZEEBE_USE_PLAINTEXT: "false",  // explicit, but default
    // ... auth
  });
  ```

  **Verification methods**:

  **Method 1: Connection logs**:
  - SDK logs "TLS handshake" or similar at INFO / DEBUG level.

  **Method 2: Network inspection**:
  - `openssl s_client -connect host:port`: see cert details.
  - Verify cert chain, expiry, DNS SAN matches.

  **Method 3: Plaintext test**:
  - Try `usePlaintext: true` against TLS-required broker → connection rejected.
  - Confirms broker enforces TLS.

  **Method 4: Server-side audit**:
  - Broker logs incoming connections; verify TLS protocol version.

  **Common issues**:
  - **DNS / hostname mismatch**: cert valid for hostname but client uses IP → fails verification.
  - **Self-signed cert without trust**: SDK rejects; configure custom CA or import to truststore.
  - **Expired cert**: production fail; rotation needed.
  - **Old TLS version**: TLS 1.0 / 1.1 deprecated; ensure 1.2 or 1.3.

  **Best practices**:
  - **Always TLS in production**: never plaintext over public internet.
  - **Cert rotation automation**: avoid expiry incidents.
  - **Monitor TLS handshakes**: alert on TLS errors.
  - **mTLS** (client certs): optional extra; verify SDK support.

- **Option b) — Wrong.**

- **Option c) — Wrong.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. SDKs support TLS; default in SaaS; configure cert chain + truststore in Self-Managed; verify via logs / openssl.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** SDKs support TLS by default; configure server certs in Self-Managed broker; client validates against truststore; verify via logs / openssl handshake.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/concepts/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "gRPC public internet TLS required." TLS configuration.

**Въпросът → Solution Framing.** "TLS config + verification" — изпитва се knowledge на SDK TLS.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SaaS TLS default, че Self-Managed needs cert config, че verify via logs / openssl. Това е знание за gRPC TLS.

---

# Section 7 — Managing Dev (Questions 51-59)

> Weight 14% • Topics: Connector palette customisation, decision instance retry, Modify partial cancellation, Tasklist variable display, BPMN element ID conventions, metric export, Web Modeler activity log, cluster patching, error code naming.

---

## Question 51: Managing Dev (Weighting: 14%)

**Scenario:** A team's Web Modeler has 50+ Connectors in the palette; most modelers only use 5. They wonder if the palette can be **customised per project / per user** to declutter.

**Connector palette customisation?**

- **a)** **Verify per Camunda 8 / Web Modeler version**: palette customisation features may include:
  - **Project-level Connector restrictions**: admin enables specific Connectors per project.
  - **Custom Element Templates**: deploy company-specific templates; modelers pick from curated set.
  - **Palette grouping / favorites**: UI-level (verify support).
  - **Hide unused Connectors**: admin controls.
  
  **For org-wide governance**: combine with Element Templates as the curated catalog (project-specific templates supplement standard Connectors). Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/) + [Element Templates](https://docs.camunda.io/docs/components/modeler/web-modeler/element-templates/)

- **b)** No customisation — wrong typically. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** Per-user only — partial. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** Edit Camunda source — overstates. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler palette governance:

  **Standard out-of-the-box Connectors**:
  - Always in palette by default.
  - May not be removable globally; may be hidden / deprioritised.

  **Element Template customisation**:
  - Deploy custom templates per project.
  - Templates appear in palette / property panel.
  - Curate company-specific patterns (e.g., "Approved Internal REST API Connector").
  - Restrict pattern usage indirectly.

  **Project-level features** (verify):
  - Some Web Modeler versions: project admin controls which Connectors are visible.
  - Reduces choice overload for modelers.

  **Governance patterns**:

  **Pattern 1: Approved-only Connectors**:
  - Admin curates which standard Connectors are enabled.
  - Modelers see only approved set.
  - Reduces risk of accidental use of restricted services.

  **Pattern 2: Custom wrappers**:
  - Build custom Connectors / Templates wrapping standard ones with company defaults / security policies.
  - Modelers see "Company REST Connector" with mandatory auth headers, not raw REST Connector.

  **Pattern 3: Documentation + linting**:
  - All Connectors visible; CI / BPMN linting validates usage policies.
  - Modelers educated via internal docs.

  **Pattern 4: Project templates**:
  - Process model templates with pre-configured Connectors.
  - Modelers start from template; don't re-pick from full palette.

  **Considerations**:
  - **Over-restriction**: blocks legitimate use cases; forces workarounds.
  - **Under-restriction**: anarchic palette; inconsistent patterns.
  - **Balance**: curated set + escape hatch for exceptional needs.

  **Operational**:
  - Track which Connectors are used; deprecate truly unused.
  - Survey modelers periodically; align palette with real needs.

  Verify exact palette customisation features per Camunda 8 / Web Modeler version.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Overstates.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Verify per version; combine project-level controls + Element Templates + custom wrappers for governance.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 2/10** — overstates.

**Correct Answer:** Verify per Web Modeler version; combine project-level Connector controls + curated Element Templates + custom wrappers for palette governance.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "50+ Connectors palette customise declutter." Palette governance.

**Въпросът → Solution Framing.** "Palette customisation" — изпитва се knowledge на Web Modeler governance.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че project-level + Element Templates + custom wrappers, че governance balance. Това е знание за palette governance.

---

## Question 52: Managing Dev (Weighting: 14%)

**Scenario:** A DMN decision evaluation failed mid-flight (incident raised). Operator wonders if they can **retry the decision evaluation** without re-running the whole process.

**Decision instance retry from Operate?**

- **a)** **Decision evaluation typically happens within a Business Rule Task in a process** — if it fails, the failure surfaces as an Incident on the Business Rule Task (not separately on the decision). **Retry**: standard Operate "increment retries" on the task triggers re-evaluation of the decision. **For standalone DMN evaluation outside processes**: typically invoked via API; retry is caller-driven (re-call API). **Editing decision** while incident is open: deploy fixed version; new evaluation invokes latest. Documentation: [Decisions](https://docs.camunda.io/docs/components/concepts/decisions/) + [Operate](https://docs.camunda.io/docs/components/operate/userguide/process-instances/)

- **b)** Decisions can't fail — wrong. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Must cancel process — overstates. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Auto-retries forever — wrong. Documentation: [Decisions](https://docs.camunda.io/docs/components/concepts/decisions/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Decision retry semantics:

  **In-process decision (Business Rule Task)**:
  - Process flow reaches Business Rule Task.
  - Task evaluates referenced decision; uses process variables as inputs.
  - **Failure cases**:
    - Input type mismatch (per Q26).
    - Output validation failure.
    - FEEL evaluation error (e.g., null pointer in expression).
    - PRIORITY hit policy with no matching rule (depending on table config).
  - **On failure**: Incident raised on the Business Rule Task; process pauses.

  **Retry from Operate**:
  - **Increment retries** on the task: triggers re-evaluation with current variables.
  - **If process variables can be modified**: edit variables → re-evaluate.
  - **If decision needs to be fixed**: deploy new decision version; re-evaluate uses latest.

  **Modify Process Instance API**:
  - Power-user move: directly jump past the decision; provide outputs manually via variables.
  - Use sparingly; audit trail important.

  **Standalone decision evaluation** (via API, no process):
  - Camunda 8 supports evaluating decisions directly via API.
  - Failure: returns error to caller.
  - **Retry**: caller decides (re-invoke API).

  **Decision instance retention** (per Q29):
  - Failed evaluations also recorded in decision-instances log.
  - Query in Operate to inspect inputs / partial evaluation trace.
  - Useful for diagnosing failure pattern.

  **Common failure causes + fixes**:

  | Cause | Fix |
  |---|---|
  | Input type mismatch | Convert at process level; deploy V2 decision |
  | Missing input variable | Set variable; retry |
  | Hit policy error (no match) | Add default rule; redeploy |
  | FEEL bug in cell | Fix; deploy V2; retry |
  | Stale data in inputs | Update variables; retry |

  **Best practices**:
  - **Defensive FEEL in cells**: handle null / missing inputs gracefully.
  - **Test decisions before deployment**: catch issues in dev.
  - **Monitor decision failures**: alert on high failure rate.

- **Option b) — Wrong.**

- **Option c) — Overstates.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Failure = Incident on Business Rule Task; retry via Operate; standalone API = caller retries.
- **b) 1/10** — wrong.
- **c) 3/10** — overstates.
- **d) 1/10** — wrong.

**Correct Answer:** Decision failure surfaces as Incident on Business Rule Task; retry via Operate's increment-retries; deploy fixed decision if needed.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instances/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "DMN evaluation failed retry." Decision retry.

**Въпросът → Solution Framing.** "Retry decision evaluation" — изпитва се knowledge на decision failure handling.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Incident on Business Rule Task, че Operate retry, че deploy fix if needed. Това е знание за decision retry.

---

## Question 53: Managing Dev (Weighting: 14%)

**Scenario:** A parallel branch in a process needs to be cancelled while another branch continues. Operator wonders if Modify Process Instance API can cancel **just one branch**.

**Modify API for partial branch cancellation?**

- **a)** **Yes — Modify Process Instance API supports "cancel activity instance" operation** targeting specific element instances. Use cases:
  - Cancel one parallel branch while others continue.
  - Cancel a wait state (e.g., a timer) without affecting the rest.
  - Move flow from one element to another (jump operations).
  
  **Use cautiously**: changes process state imperatively; audit / traceability important. Document why each modification was done. Documentation: [Operate Modify](https://docs.camunda.io/docs/components/operate/userguide/process-instances/) + [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

- **b)** All-or-nothing — wrong. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Only via Operate UI — partial. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** API doesn't support cancel — wrong. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Modify Process Instance API capabilities:

  **Operations** (typical):
  - **Activate**: start a new element instance (jump into the middle of process).
  - **Terminate**: cancel a specific element instance (one branch / wait state).
  - **Move**: combination — terminate old + activate new (jump).
  - **Variable modification**: scoped variable updates as part of modification.

  **Partial branch cancellation**:
  - Process has parallel branches: Branch A, B, C.
  - Branch B has incident; want to abandon B but keep A and C.
  - **Modify operation**: terminate the active element instance in Branch B.
  - Process state: A + C continue; B is gone.
  - Eventual completion when all remaining branches reach end.

  **For diamond / join with parallel-gateway**:
  - **Parallel join**: waits for all branches.
  - If one branch terminated mid-flight: behavior depends on engine semantics.
  - **Typical**: terminated branch counts as completed for join purposes (verify per version).
  - **Else**: join may hang waiting for cancelled branch (anti-pattern, avoid via specific configurations).

  **Operate UI vs API**:
  - **Operate UI**: visual modify wizard; safer for ad-hoc one-off.
  - **API**: programmatic / scripted; for automation, batch operations.
  - Same underlying operations.

  **Use cases**:

  **Case 1: Stuck branch**:
  - Branch waiting on external system; external system down indefinitely.
  - Cancel branch; let other branches complete; deal with stuck case separately.

  **Case 2: Business decision change**:
  - Mid-process, business decides not to pursue one branch anymore.
  - Cancel that branch; continue.

  **Case 3: Recovery from data error**:
  - Branch processing wrong data; cancel + restart with correct data via Modify.

  **Caution**:
  - **Audit trail**: log every Modify operation; who, when, why.
  - **Avoid as routine workflow**: if branches need to be cancellable, model with Boundary Cancel Events instead.
  - **Test patterns**: validate Modify works as expected before applying to production.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Modify supports per-element terminate; partial branch cancel; document audit trail.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Modify API supports terminating specific element instances; cancel one branch while others continue; audit trail important.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instances/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "cancel one branch other continues." Partial cancellation.

**Въпросът → Solution Framing.** "Cancel just one branch" — изпитва се knowledge на Modify API.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Modify supports per-element terminate, че audit trail, че not for routine workflow. Това е знание за Modify partial cancel.

---

## Question 54: Managing Dev (Weighting: 14%)

**Scenario:** A User Task has 20+ process variables. Tasklist UI shows them all by default, cluttering the assignee's view. Team wonders if they can **filter / curate which variables show**.

**Tasklist variable display customisation?**

- **a)** **Approaches**:
  - **Form-based display**: User Task with a Form shows form fields, not raw variables. Form curates what's visible.
  - **Custom Tasklist**: build a custom Tasklist UI using Tasklist API; full control over display.
  - **Variable naming + filtering**: name variables with prefixes; client-side filter (if Tasklist supports).
  - **Tasklist filtering features** (verify per version): some versions may offer per-task variable visibility config.
  
  **Best practice**: form-based User Tasks (per Q11) curate the assignee's view; raw variable display rare in user-facing tasks. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/userguide/) + [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **b)** All variables always shown — partial. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/userguide/)

- **c)** Can't customise — wrong. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/userguide/)

- **d)** API only — partial. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/userguide/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Tasklist variable display approaches:

  **Standard pattern: Form-based User Tasks**:
  - User Task referenced a Camunda Form (per Q11).
  - **Tasklist shows the form** for assignee.
  - **Form curates** which fields are visible / editable.
  - Variables not in form: not shown in primary UI (may be in detail view or hidden).

  **Without form**:
  - Tasklist may show raw variables list (depends on version + config).
  - Less curated; can be cluttered.
  - Modern Tasklist: typically requires forms for User Tasks.

  **Tasklist variable filtering** (verify per version):
  - Some Tasklist versions: per-task or per-user filters.
  - Hide specific variables by name pattern.
  - Pin / favorite important variables.

  **Custom Tasklist**:
  - Use Tasklist API:
    - Query tasks (filters, pagination).
    - Get task details (variables, form info).
    - Claim / unclaim, complete / save draft.
  - Build own UI:
    - Show only relevant variables.
    - Custom rendering (charts, document previews).
    - Branded look-and-feel.
  - **Pros**: maximum flexibility.
  - **Cons**: significant engineering effort.

  **Variable naming convention**:
  - Prefix internal variables: `_internal_state`, `_temp`.
  - Form rendering / Tasklist could hide prefix-matched variables.
  - Cleaner intent.

  **Variable scope strategy**:
  - **Subprocess scopes**: keep internal computation variables in inner scopes; not visible to outer User Tasks.
  - **Process root**: only "important" variables; UI doesn't see internal noise.

  **Best practices**:
  - **Form for every user-facing task**: curated display, validated input.
  - **Internal variables in inner scopes**: encapsulation.
  - **API + custom UI**: for complex / specialized workflows.

- **Option b) — Partial.**

- **Option c) — Wrong.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Form-based User Tasks curate display; custom Tasklist for full control; naming + scope strategies.
- **b) 4/10** — partial.
- **c) 1/10** — wrong.
- **d) 5/10** — partial.

**Correct Answer:** Form-based User Tasks curate variable display; custom Tasklist API for full control; naming + scope strategies hide internals.

**Official Documentation Link:** https://docs.camunda.io/docs/components/tasklist/userguide/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "20+ variables clutter Tasklist." Variable display.

**Въпросът → Solution Framing.** "Filter / curate" — изпитва се knowledge на Tasklist UX customisation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че forms curate, че custom Tasklist for control, че naming + scopes help. Това е знание за Tasklist UX.

---

## Question 55: Managing Dev (Weighting: 14%)

**Scenario:** BPMN element IDs in a model are auto-generated (`Activity_07hf9k2`, `Event_3xjk1m4`). Team wants meaningful IDs (`SendInvoice_Service`, `OrderReceived_Start`) for easier traceability in logs / Operate. They wonder if there are conventions / best practices.

**BPMN element ID naming conventions?**

- **a)** **Best practices**:
  - **Use semantically meaningful IDs**: `SendInvoice_Service`, `OrderReceived_Start`, `ApproveOrder_User`.
  - **Include element type suffix**: distinguishes Service Task, User Task, Event types in logs.
  - **Use camelCase or snake_case** consistently — pick org-wide convention.
  - **Avoid spaces and special chars**: stick to alphanumeric + underscores / hyphens (BPMN spec allows but tools / engines may have edge cases).
  - **Stable IDs**: don't rename in production; references in queries / logs / external integrations may break.
  - **Document in BPMN style guide**: org-wide.
  
  Documentation: [BPMN Conventions](https://docs.camunda.io/docs/components/modeler/bpmn/) + [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **b)** Auto-generated only — wrong. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **c)** Names matter, IDs don't — partial. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** Any string — partial. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN element ID best practices:

  **Why IDs matter**:
  - **Operate / Tasklist queries**: filter by element ID.
  - **Logs**: identify which task in stack traces / monitoring.
  - **Job worker registration**: `@JobWorker(type = "send-invoice")` matches Task Type, but ID-based lookups in API.
  - **Process metrics**: dashboards group by element ID.
  - **External integrations**: external systems may reference specific element IDs.

  **Auto-generated IDs**:
  - Web Modeler / Desktop Modeler generates random IDs by default.
  - `Activity_07hf9k2`, `Event_3xjk1m4` — meaningless to humans.
  - **Fine for transient prototypes**; problematic for production.

  **Meaningful ID conventions**:

  **Convention 1: Action + Type**:
  - `SendInvoice_Service` — clear what it does, type.
  - `ApproveOrder_User` — user action.
  - `WaitForPayment_Event` — event type.

  **Convention 2: Domain prefix**:
  - `OrderModule_SendInvoice`, `BillingModule_ChargePayment`.
  - Useful when domain spans multiple processes.

  **Convention 3: Type prefix**:
  - `ST_SendInvoice` (Service Task), `UT_ApproveOrder` (User Task).
  - Compact but less self-explanatory.

  **Casing**:
  - **camelCase**: `sendInvoiceService` — common in JS / Java code.
  - **snake_case**: `send_invoice_service` — readable.
  - **PascalCase**: `SendInvoiceService` — class-like.
  - Pick one; document; enforce via lint.

  **Avoid**:
  - **Spaces**: `Send Invoice` — invalid in BPMN id attribute.
  - **Special chars beyond `-` `_`**: `Send/Invoice` — may break.
  - **Starting with digit**: `1_SendInvoice` — XML id rules may reject.
  - **Reserved words / collision-prone**: avoid generic like `Task1`.

  **Stability**:
  - **Don't rename in production**: external systems may reference old ID.
  - **Renaming as breaking change**: treat like API change; coordinate.
  - **For evolution**: new process version with new IDs; deprecate old.

  **Tooling**:
  - **BPMN linter** (e.g., `bpmnlint`): rules for ID naming patterns.
  - **CI checks**: enforce conventions automatically.

  **Names vs IDs**:
  - **`name`** attribute: human-readable, displayed in diagrams.
  - **`id`** attribute: machine identifier; references / queries.
  - Both matter: name for visual; id for programmatic.

- **Option b) — Wrong.**

- **Option c) — Partial.** IDs matter too.

- **Option d) — Partial.** Conventions help.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Meaningful IDs with type suffix; consistent casing; avoid special chars; stable in production.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 4/10** — partial.

**Correct Answer:** Use meaningful IDs with type suffix; consistent casing; avoid spaces / special chars; keep stable in production.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "auto-generated meaningful IDs traceability." ID conventions.

**Въпросът → Solution Framing.** "Naming conventions" — изпитва се knowledge на BPMN ID best practices.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че meaningful IDs help, че type suffix common, че stability matters. Това е знание за BPMN ID conventions.

---

## Question 56: Managing Dev (Weighting: 14%)

**Scenario:** Self-Managed Camunda 8 cluster needs to export **process / job metrics** to Prometheus for ops dashboards. Team wonders how Zeebe exposes metrics.

**Zeebe metrics export to Prometheus?**

- **a)** **Zeebe typically exposes Prometheus-compatible metrics endpoints** (per component: broker, gateway, etc.):
  - **`/actuator/prometheus`** or similar HTTP endpoint on a management port.
  - **Metric examples**: process instance creation rate, job activation rate, partition health, processing latency.
  - **Prometheus scrape config**: configure Prometheus to scrape these endpoints periodically.
  - **Grafana dashboards**: visualize; community + Camunda-provided dashboards available.
  - **Custom metrics**: extend via Java micrometer / similar in custom components (e.g., custom workers).
  
  For SaaS: managed metrics + dashboards typically built-in (Camunda Console). Documentation: [Zeebe Metrics](https://docs.camunda.io/docs/self-managed/concepts/) + [Monitoring](https://docs.camunda.io/docs/self-managed/concepts/)

- **b)** No metrics — wrong. Documentation: [Zeebe](https://docs.camunda.io/docs/self-managed/concepts/)

- **c)** Logs only — partial. Documentation: [Zeebe](https://docs.camunda.io/docs/self-managed/concepts/)

- **d)** Build custom — overstates; standard exports exist. Documentation: [Zeebe](https://docs.camunda.io/docs/self-managed/concepts/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe metrics ecosystem:

  **Metrics endpoints**:
  - **Zeebe broker**: exposes Prometheus metrics on management port.
  - **Zeebe gateway**: separate metrics endpoint.
  - **Operate / Tasklist**: their own metrics for UI / API operations.
  - **Connector Runtime**: metrics for Connector executions.

  **Common metric categories**:

  **Process metrics**:
  - `zeebe_process_instances_created_total`: counter of new instances.
  - `zeebe_process_instances_completed_total`: completions.
  - Element-instance creation / completion rates.

  **Job metrics**:
  - `zeebe_jobs_activated_total`: jobs picked up by workers.
  - `zeebe_jobs_completed_total`: successful completions.
  - `zeebe_jobs_failed_total`: failures (job.fail or job.error).
  - Job activation latency histograms.

  **Partition metrics**:
  - Health per partition.
  - Leader / follower roles.
  - Lag indicators.

  **System metrics**:
  - JVM heap, GC.
  - Network throughput.
  - Disk usage.

  **Prometheus configuration**:
  ```yaml
  scrape_configs:
    - job_name: 'zeebe-broker'
      scrape_interval: 15s
      static_configs:
        - targets: ['zeebe-broker:9600']
      metrics_path: '/actuator/prometheus'
  ```

  **Grafana dashboards**:
  - Camunda provides reference dashboards for common metrics.
  - Community dashboards on grafana.com.
  - Custom dashboards for org-specific KPIs.

  **Alerting**:
  - **Alert on high failure rate**: jobs_failed_total / jobs_completed_total ratio.
  - **Alert on slow processes**: process duration percentiles.
  - **Alert on partition health**: unavailable partitions.
  - **Alert on backlog**: jobs_activated_total - jobs_completed_total growing.

  **SaaS**:
  - Camunda Console: built-in dashboards.
  - Some metrics may be exported via custom integrations.
  - Less direct control vs Self-Managed.

  **Custom metrics**:
  - **Workers**: add Micrometer / Prometheus client libraries; expose own metrics.
  - **Connectors**: similar.
  - Useful for business KPIs not covered by standard metrics.

  **Best practices**:
  - **Scrape regularly**: 15s common.
  - **Retention**: balance vs cost; 30-90 days typical.
  - **Aggregate**: per-process-definition group for clarity.
  - **Document dashboards**: clear ownership + alerting policy.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Overstates.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Zeebe exposes Prometheus metrics on management port; scrape + Grafana dashboards + alerting.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 3/10** — overstates.

**Correct Answer:** Zeebe exposes Prometheus metrics on management port; scrape + Grafana dashboards + alerting on key indicators.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/concepts/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Prometheus metrics export ops dashboards." Metrics observability.

**Въпросът → Solution Framing.** "Metrics export" — изпитва се knowledge на Zeebe observability.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Prometheus endpoints, че Grafana dashboards, че custom via Micrometer. Това е знание за Zeebe metrics.

---

## Question 57: Managing Dev (Weighting: 14%)

**Scenario:** Multiple modelers edit a BPMN file in Web Modeler. Team needs **audit / activity log** — who changed what, when, in case of unwanted edits.

**Web Modeler activity log / version history?**

- **a)** **Web Modeler typically supports**:
  - **Version history**: snapshots of file at each save / publish; navigate / restore prior versions.
  - **Per-version metadata**: author, timestamp, optional commit message.
  - **Diff view**: compare versions to see what changed.
  - **Activity log** (verify per version): broader log of project activity (deploy events, sharing changes, etc.).
  
  Combine with deployment audit (which version was deployed when) for end-to-end audit. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/launch-web-modeler/)

- **b)** No history — wrong. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** Latest only — partial. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** External Git — partial. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler audit features (verify per Camunda 8 / Web Modeler version):

  **Version history**:
  - Each save / explicit version creates a snapshot.
  - **Auto-saves**: may keep transient revisions; explicit saves more durable.
  - **Named versions / tags**: optionally label versions ("v1.0", "release candidate").

  **Per-version metadata**:
  - **Author**: who saved / created the version.
  - **Timestamp**: when.
  - **Description**: optional commit-style message.

  **Diff view**:
  - Visual / textual diff between two versions.
  - Identifies added / removed / changed elements.
  - Useful for code reviews.

  **Restore prior version**:
  - Roll back to a previous version if mistake.
  - Either replace current state or branch.

  **Project activity log** (broader):
  - File-level: created, renamed, deleted, moved.
  - Sharing: who got access; permissions changes.
  - Deployments: which version deployed to which cluster, by whom.

  **Audit use cases**:

  **Use case 1: Compliance**:
  - Regulatory: prove "who changed what, when."
  - Export audit log periodically; archive.

  **Use case 2: Debugging**:
  - "When did this rule change?" → version history.
  - Diff old vs new; understand drift.

  **Use case 3: Rollback after bad deploy**:
  - Restore prior version; deploy to overwrite buggy version.

  **Integration with Git**:
  - For richer source control: export BPMN to Git via API or manual workflow.
  - Web Modeler primary; Git for backup / external audit.
  - Bidirectional sync: complex; verify supported patterns per version.

  **Best practices**:
  - **Frequent saves with descriptions**: enables granular audit.
  - **Tag releases**: clear version markers for deployments.
  - **Backup audit log externally**: rely on multiple sources.
  - **Review changes before deploy**: diff view in PR-like flow.

  **Limitations**:
  - **Edit-during-edit conflicts**: multiple modelers editing simultaneously may need conflict resolution.
  - **Granularity**: per-save snapshot vs per-action log varies by version.
  - **Retention**: how long history kept may have limits.

- **Option b) — Wrong.**

- **Option c) — Partial.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Web Modeler typically supports version history + per-version metadata + diff + activity log.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 5/10** — partial.

**Correct Answer:** Web Modeler supports version history + per-version metadata + diff + activity log; combine with deployment audit for end-to-end traceability.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/launch-web-modeler/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "audit who changed what when." Web Modeler audit.

**Въпросът → Solution Framing.** "Activity log / version history" — изпитва се knowledge на Web Modeler features.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че version history + diff + activity log, че integrate with Git, че audit use cases. Това е знание за Web Modeler audit.

---

## Question 58: Managing Dev (Weighting: 14%)

**Scenario:** Self-Managed Camunda cluster needs **patching / version upgrades** with **minimum downtime**. Team wonders about rolling upgrade support.

**Cluster patching / rolling upgrade strategy?**

- **a)** **Standard approaches** (verify per Camunda 8 deployment / version):
  - **Rolling upgrade**: upgrade nodes one at a time; cluster remains available; new version compatible with old during transition.
  - **Blue-green deployment**: stand up new cluster alongside; cutover traffic; retire old.
  - **Backup before upgrade**: snapshot data; rollback if issues.
  - **Compatibility matrix**: check upgrade path supported (some versions may require intermediate steps).
  - **Test in staging**: validate upgrade on non-prod first.
  
  Camunda releases typically follow rolling-upgrade-compatible patterns; check release notes. Documentation: [Self-Managed Upgrade](https://docs.camunda.io/docs/self-managed/concepts/) + Operations docs.

- **b)** Full shutdown required — overstates. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/concepts/)

- **c)** Auto-upgrades — partial; SaaS managed, Self-Managed manual. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/concepts/)

- **d)** Cluster can't be upgraded — wrong. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/concepts/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Cluster upgrade strategies (Self-Managed):

  **Rolling upgrade**:
  - **Process**:
    1. Upgrade one Zeebe broker node to new version.
    2. New node joins cluster; data synced from existing nodes.
    3. Remaining old-version nodes serve traffic.
    4. Repeat for next node; gradually all nodes on new version.
  - **Requires**: protocol compatibility between adjacent versions (typically guaranteed within minor/patch upgrades; verify for major versions).
  - **Cluster stays available**: traffic served by remaining nodes during each node's upgrade.

  **Blue-green deployment**:
  - **Process**:
    1. Stand up new cluster (new version) alongside old (running).
    2. Migrate data / state to new cluster (snapshot + import, or live replication).
    3. Switch traffic from old to new (DNS / load balancer change).
    4. Decommission old cluster after validation.
  - **Pros**: clean separation; easy rollback (switch back).
  - **Cons**: requires 2x resources during transition; state migration complexity.

  **Major version upgrades**:
  - **Check release notes**: may require:
    - Intermediate upgrade steps (e.g., must go through version X before Y).
    - Schema migrations.
    - Configuration changes.
  - **Verify backward compatibility** of:
    - BPMN models (most should be compatible).
    - DMN models.
    - Forms.
    - APIs / SDK versions.

  **Backup + rollback plan**:
  - **Snapshot data** before upgrade: filesystem snapshots / database backups.
  - **Test rollback**: rehearse restore procedure.
  - **Have rollback runbook**: clear steps if upgrade goes wrong.

  **Test in staging**:
  - **Mirror production setup**: same config, similar data volume.
  - **Apply upgrade**: validate process / job behavior.
  - **Load test**: ensure no perf regressions.
  - **Run for hours**: catch slow leaks.

  **SaaS** (managed):
  - Camunda handles upgrades; ops team mostly observes.
  - Maintenance windows announced.
  - Less control vs Self-Managed.

  **Kubernetes-based deployments**:
  - StatefulSet rolling update.
  - PodDisruptionBudget to ensure availability during upgrade.
  - Helm chart updates with `--upgrade` flag.

  **Best practices**:
  - **Stay on supported versions**: avoid lagging too far behind.
  - **Apply patches promptly**: security + bug fixes.
  - **Document upgrade procedure**: org-specific runbook.
  - **Coordinate with stakeholders**: schedule windows, communicate.

- **Option b) — Overstates.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Rolling upgrade + blue-green + backup + staging test; check compatibility matrix.
- **b) 3/10** — overstates.
- **c) 5/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Rolling upgrade common (compatibility-permitting); blue-green for major changes; always backup + test in staging first.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/concepts/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "patching upgrades minimum downtime rolling." Cluster upgrade.

**Въпросът → Solution Framing.** "Rolling upgrade strategy" — изпитва се knowledge на cluster ops.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че rolling + blue-green options, че compatibility check, че backup + staging. Това е знание за cluster upgrade.

---

## Question 59: Managing Dev (Weighting: 14%)

**Scenario:** A process has many BPMN errors with codes `ERR_001`, `ERR_002`, ..., `ERR_050`. Team wonders if there are **naming conventions** for error codes — e.g., readable names vs numeric IDs.

**BPMN error code naming conventions?**

- **a)** **Best practices**:
  - **Readable, semantic names**: `INVALID_VAT_NUMBER`, `INSUFFICIENT_FUNDS`, `CUSTOMER_NOT_FOUND` — self-documenting in logs / FEEL expressions / Error Boundary configuration.
  - **Hierarchical prefixes**: `BILLING_INSUFFICIENT_FUNDS`, `BILLING_INVALID_VAT` — group by domain.
  - **UPPER_SNAKE_CASE convention**: standard for error codes; visible distinction from variable names.
  - **Document codes catalog**: org-wide registry of codes + meanings.
  - **Avoid pure numerics**: `ERR_001` is opaque; lookup needed for meaning.
  - **Stable codes**: once published, don't rename; new errors get new codes.
  
  Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **b)** Numeric only — partial. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** No conventions — partial; conventions help. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **d)** Empty codes OK — wrong; codes essential for routing. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Error code naming best practices:

  **Why naming matters**:
  - **In logs**: readable name surfaces the issue immediately.
  - **In Error Boundary Events**: BPMN model self-documents via error name.
  - **In worker code**: `throw new BpmnError("INSUFFICIENT_FUNDS", "...")` — intent clear.
  - **In Operate**: filter / search by error code; readable improves discoverability.
  - **In audits / compliance**: stable, meaningful codes for evidence.

  **Recommended conventions**:

  **Convention 1: UPPER_SNAKE_CASE**:
  - `INSUFFICIENT_FUNDS`, `INVALID_VAT`, `PAYMENT_DECLINED`.
  - Distinguishes from variables (camelCase) and English text.
  - Industry standard for error codes.

  **Convention 2: Domain prefix**:
  - `BILLING_INSUFFICIENT_FUNDS`, `BILLING_INVALID_VAT`.
  - `KYC_DOCUMENT_EXPIRED`, `KYC_NAME_MISMATCH`.
  - Group by business domain.
  - Easier to scan / filter.

  **Convention 3: Severity prefix** (less common):
  - `RETRYABLE_TIMEOUT`, `FATAL_DATA_CORRUPTION`.
  - Telegraphs handling strategy.

  **Convention 4: Numeric + name** (hybrid):
  - `ERR_001_INSUFFICIENT_FUNDS`.
  - Numeric ID for stable reference; name for readability.
  - Overkill for most uses; useful in heavily-regulated domains.

  **Anti-conventions** (avoid):
  - **Generic**: `ERROR`, `FAIL`, `OOPS`.
  - **Implementation-leaking**: `NPE` (NullPointerException), `500_ERROR`.
  - **Ambiguous**: `BAD_DATA` — too vague.
  - **Cryptic numerics**: `ERR_001` without name.
  - **Inconsistent casing**: `insufficient_funds` mixed with `INVALID_VAT`.

  **Catalog / registry**:
  - **Maintain a doc**: list of all error codes + descriptions + recovery actions.
  - **Versioned**: track new codes, deprecated codes.
  - **Linked from BPMN docs**: developers / ops reference.

  **Stability**:
  - **Once published, don't rename**: external systems / dashboards may filter on codes.
  - **For evolution**: introduce new codes; deprecate old gradually.
  - **Mappings for renaming**: maintain mapping during transition.

  **In worker code**:
  - **Constants for codes**: avoid magic strings.
    ```java
    public static final String INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS";
    ```
  - **Enum**: even better for type safety.

  **In BPMN modelling**:
  - **Error Code Variable**: dynamic codes via FEEL expression.
  - **Static codes**: explicit in Error Boundary config.

- **Option b) — Partial.**

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. UPPER_SNAKE_CASE + domain prefix + stable codes + documented catalog.
- **b) 4/10** — partial.
- **c) 3/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Readable UPPER_SNAKE_CASE codes with domain prefix; documented catalog; stable once published; avoid generic / cryptic / inconsistent.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/error-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "ERR_001 ERR_050 naming conventions." Error code naming.

**Въпросът → Solution Framing.** "Naming conventions" — изпитва се knowledge на error code best practices.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че readable UPPER_SNAKE_CASE + domain prefix, че stable + documented, че anti-patterns. Това е знание за error code naming.

---

# Section 8 — Development Environment (Question 60)

> Weight 2% • Topics: Camunda 8 Run port conflict resolution.

---

## Question 60: Development Environment (Weighting: 2%)

**Scenario:** Developer runs Camunda 8 Run locally; another local app is already using port 8080. C8 Run fails to start with "port already in use." They wonder how to **resolve the conflict** — change C8 Run's port or kill the other process.

**Camunda 8 Run port conflict resolution?**

- **a)** **Two valid approaches**:
  - **Change C8 Run's port** via config (`application.yaml` / env vars): e.g., set `server.port: 8090` or `OPERATE_SERVER_PORT=8090`. Per-component ports may exist (Operate, Tasklist, Zeebe gateway gRPC, etc.) — change as needed.
  - **Identify + stop the conflicting process**: on Windows `netstat -ano | findstr :8080` shows PID; `taskkill /F /PID <pid>` stops it. Linux / macOS: `lsof -i :8080` + `kill <pid>`.
  
  **Prefer changing C8 Run port** if the other process is needed (less risk of breaking unrelated app). Document custom ports in team setup guide. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/setup/deploy/local/c8run/)

- **b)** Reboot machine — overkill. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/setup/deploy/local/c8run/)

- **c)** Cannot resolve — wrong. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/setup/deploy/local/c8run/)

- **d)** Only change C8 — partial; kill is also valid. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/setup/deploy/local/c8run/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Port conflict resolution for local dev:

  **Approach 1: Change Camunda 8 Run's port**:

  **Discovery**:
  - C8 Run starts multiple components; each has its own port.
  - Common defaults:
    - **Operate**: 8080.
    - **Tasklist**: 8081 (or similar).
    - **Zeebe gateway gRPC**: 26500.
    - **Zeebe gateway REST**: 8088 (varies).
    - **Identity**: 8084 (varies).
  - Check C8 Run's documentation / config files for exact ports.

  **Configuration**:
  - **application.yaml**: 
    ```yaml
    server:
      port: 8090
    ```
  - **Environment variable**:
    - `SERVER_PORT=8090` (Spring Boot).
    - Component-specific: `OPERATE_SERVER_PORT=8090`.
  - **CLI args**: 
    - `--server.port=8090`.

  **Verify after change**:
  - Start C8 Run.
  - Check logs for actual listening port.
  - Browse: `http://localhost:8090/operate`.

  **Approach 2: Stop conflicting process**:

  **Windows**:
  ```cmd
  netstat -ano | findstr :8080
  ```
  - Returns lines with PID.
  ```cmd
  taskkill /F /PID 12345
  ```
  - Force-kills process.

  **Linux / macOS**:
  ```bash
  lsof -i :8080
  ```
  - Shows process info.
  ```bash
  kill -9 12345
  ```
  - Force-kills.

  **Caution**:
  - **Don't kill arbitrary processes**: may be system or critical apps.
  - **Identify first**: confirm it's a leftover dev process, not something important.

  **Persistent fix patterns**:

  **Pattern 1: Dedicated dev ports**:
  - Reserve specific ports for Camunda; document org-wide.
  - Avoid conflict with common defaults (8080 used everywhere).
  - Suggest range like 8090-8099 for Camunda local.

  **Pattern 2: Docker Compose**:
  - Run C8 Run via Docker; map to non-conflicting host ports.
  - Containerised; less host-port pollution.

  **Pattern 3: Different startup scripts**:
  - Devs have multiple "profiles" (default vs custom-port).
  - Easy switch when conflicts arise.

  **Pattern 4: Document team conventions**:
  - Onboarding doc: "Use ports 80xx for Camunda components."
  - Reduces ad-hoc conflicts.

  **Camunda 8 Run specifics**:
  - **C8 Run = developer convenience bundle**: zip / installer with all components.
  - **Cross-platform**: Windows, Linux, macOS.
  - **Quick start**: typically `c8run start` or similar.
  - **Config**: bundled config files; customize as needed.

- **Option b) — Overkill.**

- **Option c) — Wrong.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Two approaches: change C8 Run port via config OR stop conflicting process; prefer change-port if other app needed.
- **b) 2/10** — overkill.
- **c) 1/10** — wrong.
- **d) 5/10** — partial.

**Correct Answer:** Two approaches: change C8 Run's port via config (server.port / env vars) OR identify + stop conflicting process (netstat / lsof + kill); prefer port change if other app needed.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/setup/deploy/local/c8run/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "port 8080 already in use." Port conflict.

**Въпросът → Solution Framing.** "Resolve conflict" — изпитва се knowledge на dev environment troubleshooting.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че change port OR kill process, че netstat / lsof tooling, че patterns for persistent fixes. Това е знание за local dev port conflict resolution.

---

# 🎯 Set 13 — Closing Summary

**60 questions completed** across the Camunda 8 C8-CP-DV Blueprint v8.8.0 distribution:

| Section | Questions | Weight | Topics |
|---------|-----------|--------|--------|
| **1. Modeling** | Q1-Q9 (9) | 15% | Default flow vs no-condition, MI completionCondition via outputCollection, uncaught error propagation, Start Event Output Mapping limits, compensation handler failure cascade, swimlane orientation, Send Task semantics, Boundary FEEL timing, MI vs Standard Loop |
| **2. Configuring Processes** | Q10-Q22 (13) | 22% | Job activation timeout, formDefinition extension, autoComplete exception handling, completionCondition evaluation timing, document versioning, IDP formats, Element Template value vs binding, AI Agent token tracking, fail() vs error(), Timer Boundary lifecycle, multi-key correlation, subprocess local visibility, type coercion |
| **3. DMN** | Q23-Q29 (7) | 11% | PRIORITY hit policy, BKM reuse, annotation columns, type mismatch handling, DRD vs DMN file, version binding, decision instance retention |
| **4. Forms** | Q30-Q32 (3) | 5% | Rich-text support, Form versioning breaking changes, i18n / localisation |
| **5. Connectors** | Q33-Q36 (4) | 7% | Kafka Connector, WebSocket pattern, SaaS vs Self-Managed parity, mocking for tests |
| **6. Extensions** | Q37-Q50 (14) | 23% | FEEL replace (global), contains case-sensitivity, Literal Expression vs Decision Table, function invocation (named vs positional), Spring config precedence, Node async/Promise, REST pagination patterns, SDK reconnection, Connector input validation, Inbound pre-correlation mapping, RPA screenshot capture, FEEL arbitrary-precision decimals, list partition via for-loop, gRPC TLS |
| **7. Managing Dev** | Q51-Q59 (9) | 14% | Connector palette governance, decision instance retry, Modify partial cancellation, Tasklist variable display, BPMN element ID conventions, Prometheus metrics export, Web Modeler activity log, cluster rolling upgrade, error code naming |
| **8. Development Environment** | Q60 (1) | 2% | Camunda 8 Run port conflict resolution |

**Total:** 60 questions • Blueprint v8.8.0 compliant • All fresh scenarios distinct from Sets 1-12.

**Three-Skills coverage per question:** Diagnostic Comprehension (scenario interpretation) / Solution Framing (option evaluation) / Mechanism Knowledge (underlying Camunda 8 semantic).

**Passing criterion:** ≥39/60 correct (~65%) within 75 minutes.

**Recommended study path after this set:**
1. Review FEEL string / list / type functions (Section 6 was the heaviest).
2. Practice MI subprocess + completionCondition patterns (recurring concepts).
3. Drill error semantics: BPMN error code vs Incident vs job.fail vs job.error.
4. Memorize Spring config precedence + Camunda secrets reference syntax.
5. Hands-on: deploy a process with all 4 task types (Service, User, Send/Receive, RPA) + Boundary Events.

---

**Good luck with the certification! 🎓**
