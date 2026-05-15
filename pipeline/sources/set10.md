# Camunda 8 C8-CP-DV Mock Exam — Set 10

> **60 въпроса • 75 минути • праг ≥ 65% (39/60) • Blueprint v8.8.0**
>
> Свежи сценарии — distinct от Set 1-9. Всеки въпрос: сценарий + 4 опции (a/b/c/d) + 🔍 Explanations + per-option score 1–10 + Correct Answer + Documentation Link + 🧠 Three-Skills Decomposition.

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

> Weight 15% • Topics: BPMN Group element, gateway mixing, nested subprocesses, Cancel events, Receive Task vs Message Catch, MI configuration constraints, Start Event variable initialisation.

---

## Question 1: Modeling (Weighting: 15%)

**Scenario:** A team's BPMN has 5 activities forming a logical cluster (the "Compliance Verification" steps) but they shouldn't be grouped as an Embedded Subprocess (no shared scope needed, no boundary events). The team wants a **purely visual grouping marker** that surrounds the activities without affecting execution.

**Which BPMN construct fits "visual grouping with no execution semantics"?**

- **a)** A **Group** element (BPMN standard — typically a rounded-rectangle frame with a dashed border) — surrounds the activities visually, labels them as a logical cluster (e.g., "Compliance Verification"), but has **no execution semantics**. Pure documentation. Activities continue to execute according to their sequence flows independent of the Group. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **b)** Embedded Subprocess — over-engineered when no shared scope or boundaries needed; introduces a new scope. Documentation: [Embedded Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/)

- **c)** Annotation text — works for labelling but doesn't visually enclose the activities. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** Pool / Lane — wrong scope; Pools/Lanes are organisational, not visual clustering. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN's **Group** element is a documentation-only artifact for visually clustering related activities. Properties:
  - **Visual**: rendered as a rounded-rectangle frame (dashed border in many tools) around the grouped activities.
  - **Label**: a descriptive name (e.g., "Compliance Verification," "Backend Processing").
  - **No execution semantics**: doesn't affect flow; activities execute per their sequence flows.
  - **No scope creation**: variables, events, and boundaries aren't affected.

  Use cases: reader-friendly clustering of activities by responsibility, phase, or domain. The group adds visual structure without changing behaviour. Distinct from Embedded Subprocess (which creates scope, supports boundaries, contains a start event).

  Note: Zeebe's coverage of the BPMN Group element is primarily visual; verify your specific BPMN editor / Modeler version's support.

- **Option b) — Over-engineered.** Embedded Subprocess introduces a scope, requires a Start Event inside, supports boundary events — all of which are unnecessary when you just want visual clustering.

- **Option c) — Doesn't enclose.** Annotations are inline text/comments; don't visually frame a region.

- **Option d) — Wrong concept.** Pools/Lanes are organisational (participants / roles), not arbitrary clustering.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Group element е BPMN visual-only cluster marker.
- **b) 4/10** — over-engineered (introduces scope).
- **c) 3/10** — doesn't visually enclose.
- **d) 3/10** — wrong concept (organisational not clustering).

**Correct Answer:** BPMN Group element — visual grouping marker with no execution semantics.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "visual grouping with no execution semantics", "no shared scope needed." Documentation-only construct.

**Въпросът → Solution Framing.** "Fits visual grouping" — изпитва се knowledge на BPMN Group element vs Embedded Subprocess.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Group е documentation-only artifact, че Embedded Subprocess introduces scope, че Pool/Lane е organisational, че annotations don't enclose. Това е знание за BPMN documentation primitives.

---

## Question 2: Modeling (Weighting: 15%)

**Scenario:** A Service Task `validate-payment` may throw two distinct BPMN error codes: `"INVALID_CARD"` (route to manual fix) and `"FRAUD_SUSPECTED"` (route to fraud team). The team wants **two Error Boundary Events** on the same activity — one for each errorCode — each routing to its own handler path.

**Can multiple Error Boundary Events attach to the same activity, each with a different errorCode?**

- **a)** **Yes** — multiple Error Boundary Events can attach to the same host activity, each filtering by a different errorCode. When the host throws an error, the boundary whose errorCode matches activates; flow routes via that boundary's outgoing arrow to its specific handler. If multiple boundaries' codes could match, behaviour follows BPMN-spec ordering (typically: the most specific match wins). A catch-all boundary (no errorCode) can additionally serve as a fallback. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **b)** No — only one Error Boundary per activity — incorrect; BPMN supports multiple. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** Yes, but all boundaries must catch the same code — wrong; per-code differentiation is the whole point. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **d)** Only via Event Subprocess — Event Subprocess works for subprocess-wide handling but Boundary Events are the activity-level mechanism for per-error-code routing. Documentation: [Event Subprocesses](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN explicitly supports **multiple Error Boundary Events per activity**, each specifying a different errorCode. This is the cleanest way to express "different errors → different handlers":
  - Boundary 1: errorCode = "INVALID_CARD" → outgoing arrow → "manual fix" path.
  - Boundary 2: errorCode = "FRAUD_SUSPECTED" → outgoing arrow → "fraud team" path.

  At runtime, the worker throws an error with one of the codes; the boundary with matching code activates; flow routes accordingly. Unmatched codes either propagate up scope (if there's no catch-all boundary or matching higher-scope catch) or produce an unhandled error → Incident.

  Composition: you can combine specific Error Boundaries with a catch-all Error Boundary (no errorCode) as a fallback. The specific ones match first; the catch-all handles anything else.

- **Option b) — Wrong.** Multiple supported.

- **Option c) — Wrong.** Per-code differentiation is the design.

- **Option d) — Wrong scope.** Boundary at activity level is direct; Event Subprocess for subprocess-wide.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple Error Boundary Events with distinct errorCodes per activity.
- **b) 2/10** — wrong; multiple supported.
- **c) 1/10** — wrong; per-code differentiation е the design.
- **d) 4/10** — wrong scope; Boundary е activity-level.

**Correct Answer:** Yes — multiple Error Boundary Events per activity, each filtering by a different errorCode.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/error-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "two distinct error codes", "different handlers per error." Multi-boundary pattern.

**Въпросът → Solution Framing.** "Multiple boundaries with different codes" — изпитва се knowledge на per-code routing capability.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че multiple Error Boundaries per activity supported, че each filters by errorCode, че catch-all combines for fallback. Това е знание за per-error-code routing.

---

## Question 3: Modeling (Weighting: 15%)

**Scenario:** A team's BPMN has a **Parallel Gateway split** with two outgoing branches. The team accidentally used an **Inclusive Gateway join** to converge them. They wonder what happens at the join.

**What happens when a Parallel split is joined by an Inclusive join (mismatched gateway pair)?**

- **a)** **Undefined / problematic behaviour** — BPMN's join semantics assume the split type matches: Parallel-Parallel for AND-join (waits for all), Inclusive-Inclusive for OR-join (waits for taken). Mixing them creates ambiguity: the Inclusive join may not know which branches were "taken" because Parallel split always activates all. Engines may treat the Inclusive join effectively like a Parallel join (waiting for all), or produce errors. **Best practice: always pair gateways correctly**. Documentation: [Gateways](https://docs.camunda.io/docs/components/modeler/bpmn/gateways/)

- **b)** Works fine — Inclusive join just waits for any tokens — incorrect; Inclusive join's semantics specifically waits for "taken" branches, which Parallel split doesn't communicate. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **c)** Both gateways are equivalent — no problem — wrong; distinct semantics. Documentation: [Gateways](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** The Inclusive join cancels both branches — invented behaviour. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN's gateway semantics assume **matched pairs** for clear behaviour:
  - **Parallel split + Parallel join**: AND-AND. Both branches activated; join waits for all.
  - **Inclusive split + Inclusive join**: OR-OR. Branches activated by condition; join waits for taken branches.
  - **Exclusive split + Exclusive join**: XOR-XOR. One branch activated; join passes through any single token.

  Mixing them creates undefined or surprising behaviour:
  - Parallel split + Inclusive join: Inclusive join's "wait for taken branches" logic may interpret all branches as taken (since Parallel activates all), effectively behaving like Parallel join. Or, depending on implementation, it might produce unexpected results.
  - Parallel split + Exclusive join: Exclusive join passes through the first token; remaining branches may produce tokens that aren't consumed, leading to dangling tokens / incomplete instances.

  **Best practice**: always match gateway types in split/join pairs. BPMN validators often warn or error on mismatched pairs.

- **Option b) — Wrong assumption.** Inclusive join has specific semantics.

- **Option c) — Wrong.** Distinct semantics.

- **Option d) — Invented.** No cancel behaviour.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Mismatched gateway pair = undefined / problematic; match types in split/join pairs.
- **b) 3/10** — wrong; specific semantics assumed.
- **c) 1/10** — wrong; distinct.
- **d) 1/10** — invented.

**Correct Answer:** Undefined / problematic behaviour; always match gateway types in split/join pairs.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Parallel split + Inclusive join", "mismatched pair." Gateway pairing.

**Въпросът → Solution Framing.** "What happens with mismatch" — изпитва се knowledge на gateway pair semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че gateways assume matched pairs, че mismatch creates undefined behaviour, че best practice е consistent pairing. Това е знание за gateway semantics.

---

## Question 4: Modeling (Weighting: 15%)

**Scenario:** A team's BPMN has an **Embedded Subprocess** "Process Order" that itself contains another **Embedded Subprocess** "Validate Items" — nested two levels deep. The team wonders if nesting is supported and what scope rules apply.

**What's the behaviour and scoping of nested Embedded Subprocesses?**

- **a)** **Nesting is fully supported** in BPMN. Each Embedded Subprocess creates its own variable scope. Variable visibility follows the **scope hierarchy**: inner scope sees its own variables + parent scope's variables (and grandparent's, etc., up to process root). Variables set in an inner scope aren't visible to outer scopes unless explicitly propagated via Output Mapping on the inner subprocess. Boundary events and Event Subprocesses behave per their attached scope. Documentation: [Embedded Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/) + [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

- **b)** Nesting limited to one level — incorrect; arbitrary nesting supported. Documentation: [Embedded Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/)

- **c)** All nested scopes share variables — wrong; each scope is isolated unless propagated. Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

- **d)** Nested subprocesses are flattened at runtime — incorrect; scope hierarchy preserved at runtime. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN supports arbitrary nesting of Embedded Subprocesses. Each level creates its own scope; the scope hierarchy mirrors the BPMN structure. Variable semantics:
  - **Read access**: inner scope reads its own variables + parent's + grandparent's + ... + process root. FEEL navigates this hierarchy transparently.
  - **Write access**: writes default to the innermost scope (the variable lives where it's first defined or assigned within a scope).
  - **Propagation upward**: if you need a value from an inner scope to be visible in the outer, use Output Mapping on the inner subprocess's outgoing arrow / completion.

  Boundary events and Event Subprocesses are scoped per their attached element — a Boundary on the outer "Process Order" subprocess catches errors propagating out of the outer; the inner "Validate Items" boundary catches its own errors first.

  Nesting trade-off: deep nesting can make diagrams hard to read; flatten when possible by extracting reusable subprocesses as Call Activities.

- **Option b) — Wrong.** Arbitrary nesting.

- **Option c) — Wrong.** Scopes are isolated.

- **Option d) — Wrong.** Hierarchy at runtime.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Nesting supported; scope hierarchy; inner reads outer + writes default to innermost.
- **b) 2/10** — wrong; arbitrary nesting.
- **c) 2/10** — wrong; scopes isolated.
- **d) 2/10** — wrong; hierarchy preserved.

**Correct Answer:** Nesting supported; each scope isolated; inner reads outer + propagate via Output Mapping.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "nested Embedded Subprocesses", "two levels deep." Subprocess nesting.

**Въпросът → Solution Framing.** "Behaviour and scoping" — изпитва се knowledge на nested scope hierarchy.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че nesting supported, че scopes form hierarchy, че inner reads outer + propagation needs Output Mapping. Това е знание за nested scope semantics.

---

## Question 5: Modeling (Weighting: 15%)

**Scenario:** A team builds a **Transaction Subprocess** with 3 inner Service Tasks. They want to **cancel** the transaction explicitly when a condition is met — not via a runtime error, just "we've decided to abort this transaction." Inside the transaction, they need a way to signal this cancellation.

**Which BPMN End Event fits "explicit transaction cancellation"?**

- **a)** **Cancel End Event** (inside a Transaction Subprocess) — triggers transactional cancellation: the transaction's Cancel Boundary Event (on the outside) catches the cancellation, all completed inner activities' Compensation Boundary handlers run (in reverse order), then flow routes via the Cancel Boundary's outgoing arrow. Cancel End is **specifically designed for Transaction Subprocesses**; using it outside is meaningless. Documentation: [Cancel Events](https://docs.camunda.io/docs/components/modeler/bpmn/cancel-events/) + [BPMN coverage](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **b)** Error End Event — wrong family; would propagate as an error, not transactional cancellation. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** Terminate End Event — kills tokens in the local scope but doesn't trigger compensation cascade. Documentation: [Terminate End Event](https://docs.camunda.io/docs/components/modeler/bpmn/terminate-events/)

- **d)** Compensation Throw End Event — fires compensation cascade in normal scope, but doesn't have transaction-specific semantics; Cancel is the dedicated event for Transaction Subprocesses. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Cancel End Event + Cancel Boundary Event is the BPMN-spec mechanism for **Transaction Subprocess cancellation**:
  - **Inside the Transaction**: Cancel End Event fires.
  - **Outside the Transaction**: Cancel Boundary Event (attached to the Transaction subprocess) catches.
  - **Effect**: all completed inner activities with Compensation Boundary Events have their handlers invoked (in reverse order); the transaction terminates; flow routes via the Cancel Boundary's outgoing arrow to the "transaction cancelled" handler path.

  This is BPMN's transactional cancellation pattern, distinct from generic error handling or compensation.

  **Caveat**: Zeebe's coverage of Transaction Subprocesses has varied; verify the current BPMN coverage docs for your Zeebe version. Where not fully supported, the practical fallback is Embedded Subprocess + explicit Compensation Throw on the cancellation path.

- **Option b) — Wrong family.** Error vs Cancel are different event categories.

- **Option c) — Wrong semantic.** Terminate kills but doesn't trigger compensation.

- **Option d) — Generic.** Compensation Throw works outside transactions; Cancel is transaction-specific.

**Per-option scoring (1–10):**
- **a) 9/10** — верен с caveat. Cancel End + Cancel Boundary за Transaction cancellation; verify Zeebe version.
- **b) 3/10** — wrong family.
- **c) 3/10** — wrong semantic; no compensation.
- **d) 6/10** — generic alternative; Cancel е transaction-specific.

**Correct Answer:** Cancel End Event (with Cancel Boundary outside the Transaction) — transactional cancellation with compensation cascade.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/cancel-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Transaction Subprocess", "cancel explicitly." Cancel event semantic.

**Въпросът → Solution Framing.** "Fits explicit transaction cancellation" — изпитва се Cancel event knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Cancel End + Cancel Boundary е the transaction-specific pair, че Error / Terminate / generic Compensation не fit. Това е знание за transaction cancellation.

---

## Question 6: Modeling (Weighting: 15%)

**Scenario:** A team's BPMN has a **Receive Task** waiting for `"OrderShipped"` and an alternative they're considering: an **Intermediate Message Catch Event**. Both wait for messages. The team wonders what distinguishes them.

**What's the distinction between Receive Task and Intermediate Message Catch Event?**

- **a)** **Functionally similar — both wait for matching messages with correlation keys — but BPMN distinguishes them semantically**. Receive Task: visualised as a rectangle (task-shape) with an envelope marker; semantically "the process is doing a task that involves receiving." Intermediate Message Catch Event: visualised as a circle with envelope; semantically "an event happens at this point in flow." From the engine's perspective they behave similarly. Style preference: Receive Task fits when the wait is a "deliberate step in the work"; Intermediate Catch fits when the wait is an "event that happens to occur during flow." Documentation: [Receive Task](https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks/) + [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **b)** Functionally completely different — incorrect; both wait for messages. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **c)** Receive Task is for async, Intermediate is for sync — incorrect; both are async waits. Documentation: [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **d)** Only one of them is supported in C8 — incorrect; both supported. Documentation: [BPMN coverage](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Functionally similar at the engine level (both create a message subscription, wait for matching message, route via outgoing arrow). The distinction is **semantic / visual**:
  - **Receive Task** (rectangle with envelope marker): "the process is performing a task — it's waiting to receive something." Use when the wait is a meaningful step that participants in the process should recognise as work (e.g., "Receive Payment Confirmation").
  - **Intermediate Message Catch Event** (circle with envelope, in-flow): "an event happens at this point — a message arrives." Use when the wait is an event interruption to the flow, less "active work" and more "pause for signal."

  Both are interchangeable in many cases; pick by which semantic communicates intent better to BPMN readers.

  Receive Task may have additional task-level features in some implementations (e.g., the task element has Input/Output mappings, etc.); event-level constructs are leaner.

- **Option b) — Wrong.** Functionally similar.

- **Option c) — Wrong.** Both async.

- **Option d) — Wrong.** Both supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Functionally similar; semantic / visual distinction; pick по intent.
- **b) 2/10** — wrong; similar.
- **c) 2/10** — wrong; both async.
- **d) 1/10** — wrong; both supported.

**Correct Answer:** Functionally similar — both wait for messages with correlation; semantic / visual distinction (task vs event).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Receive Task vs Intermediate Message Catch", "both wait for messages." Semantic distinction.

**Въпросът → Solution Framing.** "Distinction" — изпитва се knowledge на semantic vs functional differences.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че functionally similar, че semantic difference е task-vs-event framing, че choice е stylistic. Това е знание за BPMN modelling style.

---

## Question 7: Modeling (Weighting: 15%)

**Scenario:** A team configures a Multi-Instance Subprocess with both `loopCardinality = 5` AND `inputCollection = orders`. They expect the engine to iterate `orders` but also cap at 5 instances.

**Can `loopCardinality` and `inputCollection` be configured together?**

- **a)** **No — they're mutually exclusive**. BPMN MI configuration uses **either**:
  - **`loopCardinality`** (a static or FEEL-evaluated number) → exactly that many instances; no per-instance source data; `loopCounter` for indexing.
  - **`inputCollection`** + **`inputElement`** → one instance per element in the collection; `inputElement` provides the per-instance data; `loopCounter` still available.

  Setting both is invalid; the engine rejects or one takes precedence. For "iterate `orders` but cap at 5," compute a capped collection before MI: e.g., FEEL `=if count(orders) > 5 then sublist(orders, 1, 5) else orders` as the inputCollection. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Yes — both can be set; engine combines them — incorrect; mutually exclusive. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Yes — loopCardinality caps the iteration of inputCollection — wrong; not the design. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** They mean the same thing — incorrect; distinct configurations. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** MI configuration is **either-or**:
  - **Static-count style**: `loopCardinality = <number or FEEL>`. The engine spawns that many instances; no input collection; each instance's data is whatever's in scope plus the `loopCounter`.
  - **Collection-driven style**: `inputCollection = <FEEL list>`, `inputElement = <name>`. The engine spawns one instance per list element; each instance gets its element via `inputElement` variable; `loopCounter` indexes 1..N.

  For "iterate orders but cap at 5": preprocess the collection before MI. Use FEEL `sublist(orders, 1, 5)` if `orders` has more than 5 elements; otherwise use `orders` as-is. Single `inputCollection` with the capped result.

  Setting both `loopCardinality` and `inputCollection` produces undefined behaviour or deployment error; design as either-or.

- **Option b) — Wrong.** Mutually exclusive.

- **Option c) — Wrong design.** Not how engine interprets.

- **Option d) — Wrong.** Distinct configurations.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Mutually exclusive; either loopCardinality or inputCollection; preprocess for capping.
- **b) 2/10** — wrong; mutually exclusive.
- **c) 3/10** — wrong design.
- **d) 1/10** — wrong; distinct.

**Correct Answer:** Mutually exclusive — use either loopCardinality OR inputCollection; for capping, preprocess the collection.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "loopCardinality AND inputCollection", "iterate AND cap." MI configuration constraint.

**Въпросът → Solution Framing.** "Configured together" — изпитва се knowledge на MI either-or rule.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че loopCardinality е static-count, че inputCollection е collection-driven, че they're mutually exclusive, че preprocessing handles cap-and-iterate. Това е знание за MI configuration constraints.

---

## Question 8: Modeling (Weighting: 15%)

**Scenario:** A process needs **initial process variables** when an instance starts via API. E.g., when calling `POST /v2/process-instances` to create an instance of `order-fulfillment`, the request includes `{"variables": {"orderId": "ORD-123", "customer": {...}}}`. The team wonders if these variables are immediately available to all activities or only after some setup step.

**Are variables passed at instance creation immediately available to all activities?**

- **a)** **Yes** — variables passed in the `CreateProcessInstance` command (or REST POST body) become **process-scoped variables** immediately upon instance creation, before any activity activates. All activities in the instance can read them via FEEL expressions (Input Mapping, Gateway conditions, etc.). No setup step required. Documentation: [Create Process Instance](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/specifications/create-process-instance/) + [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **b)** No — variables become available only after the Start Event completes — partial misconception; they're available throughout, including via Start Event hooks if any. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Only the first activity sees them — incorrect; process-scoped, visible everywhere. Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

- **d)** Variables must be set by the first Service Task — wrong; they can be passed at creation. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Variables passed at instance creation are immediately part of the process's variable state:
  - **API contract**: `CreateProcessInstance` gRPC or `POST /v2/process-instances` REST accept a `variables` field. The JSON value becomes the initial process-scoped variable set.
  - **Visibility**: from the moment of instance creation, all activities (when activated) and FEEL expressions (in Gateway conditions, Input Mappings, etc.) can read these variables.
  - **No setup step**: there's no "wait for initialisation" phase; they're part of the instance from creation.

  This enables passing context at start — order details, customer info, configuration flags, etc. The process logic then uses these throughout.

  Note: variables can be added or modified later via API (`PATCH /v2/process-instances/{key}/variables`), Service Task Output Mappings, etc. The initial set provides the starting context.

- **Option b) — Misconception.** Available throughout; no "after Start Event" wait.

- **Option c) — Wrong scope.** Process-scoped from creation.

- **Option d) — Wrong assumption.** Can pass at creation.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Variables at creation are process-scoped immediately; all activities see them.
- **b) 4/10** — misconception; available throughout.
- **c) 2/10** — wrong scope.
- **d) 2/10** — wrong assumption.

**Correct Answer:** Yes — variables passed at instance creation are immediately process-scoped and visible to all activities.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/specifications/create-process-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "variables at instance creation", "immediately available." Variable lifecycle at instance start.

**Въпросът → Solution Framing.** "Immediately available" — изпитва се knowledge на initial variable scope.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че creation variables са process-scoped immediately, че API accepts variables field at create, че all activities can read. Това е знание за instance creation API contract.

---

## Question 9: Modeling (Weighting: 15%)

**Scenario:** A team writes BPMN with gateways. They want to **label** the gateways in a way that distinguishes **diverging** (splits) from **converging** (joins) in the diagram.

**What's the BPMN convention for labelling diverging vs converging gateways?**

- **a)** **Diverging gateways** (splits with multiple outgoing flows) are typically labelled with a **question** (e.g., "Approved?", "VIP Customer?", "Stock Available?") — communicates the decision being made. **Converging gateways** (joins with multiple incoming flows) are typically **unlabelled** or labelled minimally (e.g., "Merged" or no label) — they don't make decisions, they synchronise. This convention helps readers quickly identify decision points vs synchronisation points. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** Both labelled with questions — incorrect; joins don't ask questions. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **c)** Both unlabelled — partial; joins typically unlabelled but splits benefit from questions. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **d)** No conventions; modelers pick freely — anti-pattern; conventions aid readability. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN best-practice labelling conventions:
  - **Diverging gateway (split)**: label with the **question** that determines routing. Example: an Exclusive Gateway with two outgoing flows might be labelled "Order Value > $1000?"; the flows are labelled "Yes" (to manual review) and "No" (to auto-approve). Readers immediately see the decision and its outcomes.
  - **Converging gateway (join)**: usually unlabelled — it just synchronises tokens, doesn't decide anything. A minimal label like "Merge" can be used for clarity in complex diagrams.

  Additional flow-labelling conventions:
  - **Sequence flow labels on splits**: name each outgoing flow ("Yes" / "No", "Approve" / "Reject"), making the routing decisions explicit.
  - **Conditions on flows**: visually display the condition (e.g., "amount > 1000") for technical readers.

  These conventions collectively make BPMN diagrams self-documenting.

- **Option b) — Wrong.** Joins don't ask questions.

- **Option c) — Partial.** Splits benefit from questions.

- **Option d) — Anti-pattern.** Conventions aid clarity.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Splits with question; joins typically unlabelled.
- **b) 3/10** — wrong; joins don't decide.
- **c) 5/10** — partial; splits benefit from questions.
- **d) 2/10** — anti-pattern.

**Correct Answer:** Diverging gateways labelled with a question; converging gateways typically unlabelled.

**Official Documentation Link:** https://docs.camunda.io/docs/components/best-practices/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "label gateways", "distinguish diverging vs converging." Labelling conventions.

**Въпросът → Solution Framing.** "Convention for labelling" — изпитва се knowledge на BPMN labelling best practices.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че splits ask questions, че joins synchronise (no question), че flow labels communicate outcomes. Това е знание за BPMN style conventions.

---

# Section 2 — Configuring Processes (Questions 10-22)

> Weight 22% • Topics: Service Task without task type, ioMapping XML structure, candidate users with FEEL, subprocess variable naming collision, Sequential MI shared accumulation, Document vs base64 comparison, IDP pass-through, Element Template attribute mapping, AI Agent memory, Boundary Event priority, message deduplication, retry layers.

---

## Question 10: Configuring Processes (Weighting: 22%)

**Scenario:** A modeler accidentally creates a Service Task without setting `zeebe:taskDefinition type` — the task has no worker subscription identifier. The team wonders what happens when this BPMN deploys and instances reach the task.

**What happens if a Service Task has no `zeebe:taskDefinition type` configured?**

- **a)** **Deployment-time validation fails (or runtime activation produces an Incident)** — `zeebe:taskDefinition type` is **required** for Service Tasks. The validator typically flags this at design time (in Web Modeler) or at deployment (Zeebe rejects with a clear error). If somehow deployed and a token reaches the task, Zeebe raises an Incident: "no task type defined." Fix: set the type in Web Modeler's Implementation property panel. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **b)** Task auto-uses a default type — incorrect; type is required, no default. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** Task skips automatically — incorrect; no auto-skip. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Task succeeds immediately — incorrect; can't succeed without worker activation. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `zeebe:taskDefinition` with at minimum `type` attribute is mandatory for executable Service Tasks. The type is what workers subscribe to (e.g., `process-payment`); without it, the engine has no way to route the activated job to a worker.

  Behaviour:
  - **Design-time validation**: Web Modeler / Desktop Modeler flag missing type as an error in the property panel and (typically) prevent saving / deploying.
  - **Deployment-time validation**: Zeebe's deployment validator rejects the BPMN with a clear error message.
  - **Runtime** (if the missing-type somehow slipped through): the activation creates an Incident with reason "no task type defined."

  Resolution: set the type via Web Modeler's "Implementation" property panel under "Task type." Conventional naming: lowercase-kebab-case identifier (e.g., `process-payment`, `validate-claim`).

- **Option b) — Wrong.** No default; required.

- **Option c) — Wrong.** No auto-skip.

- **Option d) — Wrong.** Can't succeed.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. taskDefinition type required; validation fails or Incident on runtime.
- **b) 1/10** — wrong; no default.
- **c) 1/10** — wrong; no auto-skip.
- **d) 1/10** — wrong; can't succeed.

**Correct Answer:** Validation fails (or Incident at activation) — taskDefinition type is required.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Service Task without task type", "what happens." Validation question.

**Въпросът → Solution Framing.** "What happens without type" — изпитва се knowledge на taskDefinition requirement.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че type е required, че validation catches at design/deploy, че runtime would Incident. Това е знание за Service Task validation.

---

## Question 11: Configuring Processes (Weighting: 22%)

**Scenario:** A team examines BPMN XML and sees the `<zeebe:ioMapping>` element with `<zeebe:input>` and `<zeebe:output>` children. They want to understand the structure.

**What is the structure of `zeebe:ioMapping` in BPMN XML?**

- **a)** **`<zeebe:ioMapping>`** is the container element under an activity's `<bpmn:extensionElements>`. It contains zero or more **`<zeebe:input source="..." target="..."/>`** child elements (one per Input Mapping) and zero or more **`<zeebe:output source="..." target="..."/>`** child elements (one per Output Mapping). The `source` attribute is a FEEL expression (read from); `target` names the local-scope variable (Input) or process-scope variable (Output). Documentation: [Input/Output Mappings](https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings)

- **b)** ioMapping is a single attribute on the task — incorrect; it's a structured element. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Inputs and outputs are separate top-level elements — partial; both nest under ioMapping container. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** ioMapping is a Camunda 7 concept not in C8 — incorrect; C8 uses zeebe:ioMapping namespace. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN XML structure for I/O Mapping under an activity:
  ```xml
  <bpmn:serviceTask id="..." name="...">
    <bpmn:extensionElements>
      <zeebe:taskDefinition type="..." />
      <zeebe:ioMapping>
        <zeebe:input source="=customer.email" target="emailAddress" />
        <zeebe:input source="=order.total" target="amount" />
        <zeebe:output source="=approved" target="orderApproved" />
        <zeebe:output source="=score" target="riskScore" />
      </zeebe:ioMapping>
    </bpmn:extensionElements>
  </bpmn:serviceTask>
  ```
  Each `<zeebe:input>` defines an Input Mapping: read the `source` FEEL expression's value, assign to `target` (a local-scoped variable available to the worker). Each `<zeebe:output>` defines an Output Mapping: read the `source` FEEL expression (typically referencing worker's returned values), assign to `target` in process scope.

  Web Modeler abstracts this XML — modelers configure via UI panels; the editor generates the corresponding XML.

- **Option b) — Wrong.** Structured element.

- **Option c) — Partial.** Both nest under ioMapping.

- **Option d) — Wrong.** C8 has zeebe:ioMapping.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. ioMapping container с zeebe:input / zeebe:output children; source + target attributes.
- **b) 2/10** — wrong; structured.
- **c) 4/10** — partial; both nest.
- **d) 1/10** — wrong; C8 supported.

**Correct Answer:** `<zeebe:ioMapping>` container with `<zeebe:input>` and `<zeebe:output>` children (source + target attributes).

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "zeebe:ioMapping XML structure." BPMN XML inspection.

**Въпросът → Solution Framing.** "Structure of ioMapping" — изпитва се BPMN XML knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че ioMapping nests under extensionElements, че input/output children have source + target attributes. Това е знание за Zeebe BPMN extension structure.

---

## Question 12: Configuring Processes (Weighting: 22%)

**Scenario:** A User Task `review-application` should be assignable to a **dynamic list of users computed at runtime** — e.g., the application's region determines which 2-3 reviewers are candidates. The team uses a FEEL expression that returns a list.

**How is `candidateUsers` configured with a dynamic FEEL list?**

- **a)** Set the User Task's `zeebe:assignmentDefinition candidateUsers="=getReviewers(region)"` (or similar FEEL expression). The expression evaluates at task activation; result must be a **list of strings** (user identifiers). The task is offered to all listed users; first claim wins. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** candidateUsers only accepts static comma-separated strings — incorrect; FEEL lists supported. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** Use multiple Receive Tasks one per candidate user — wrong concept; single User Task with multiple candidates is the pattern. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Compute the list in a Service Task before the User Task — workable but unnecessary; FEEL inline expression works. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `candidateUsers` accepts FEEL expressions that evaluate to a list of strings. Examples:
  - **Static list**: `candidateUsers="alice,bob"` (comma-separated literal — also supported).
  - **FEEL list expression**: `candidateUsers="=[\"alice\", \"bob\"]"` (FEEL list literal).
  - **Dynamic from variable**: `candidateUsers="=reviewers"` (where `reviewers` is a process variable holding a list).
  - **Computed**: `candidateUsers="=getReviewers(region)"` or `candidateUsers="=if region = \"EU\" then [\"alice\", \"bob\"] else [\"charlie\"]"`.

  The expression evaluates at task activation; result must be a list of strings (user identifiers known to Camunda Identity / IdP). Task is offered to all listed; first to claim becomes assignee.

  Companion: `candidateGroups` for group-based assignment with similar FEEL support.

- **Option b) — Wrong.** FEEL lists supported.

- **Option c) — Wrong concept.** Single task with multiple candidates is the canonical pattern.

- **Option d) — Workable but unnecessary.** Inline FEEL works.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. candidateUsers accepts FEEL list expression; result е list of user IDs.
- **b) 2/10** — wrong; FEEL lists supported.
- **c) 2/10** — wrong concept.
- **d) 5/10** — workable but unnecessary.

**Correct Answer:** Set candidateUsers to a FEEL expression returning a list of strings.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "dynamic list of users", "FEEL expression that returns list." Dynamic candidate assignment.

**Въпросът → Solution Framing.** "How configured с dynamic FEEL" — изпитва се knowledge на candidateUsers FEEL support.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че candidateUsers accepts FEEL, че result е list of strings, че dynamic computation supported inline. Това е знание за dynamic user assignment.

---

## Question 13: Configuring Processes (Weighting: 22%)

**Scenario:** A team has a process variable `orderId` set at process start. Inside an Embedded Subprocess, a worker creates a **task-local variable also named `orderId`** (via Input Mapping). The team wonders what happens — naming collision?

**What happens when a task-local variable has the same name as a process variable?**

- **a)** **The local variable shadows the process variable within its scope** — the task / subprocess scope reads the local value when referencing `orderId`. Outside the local scope (after the task completes, or in sibling activities), the original process variable remains intact and visible. **Scope rules**: inner scope's variable shadows outer; the outer is unmodified unless explicit Output Mapping writes to it. Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

- **b)** Deployment fails due to name collision — incorrect; shadowing is allowed. Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

- **c)** The local variable overwrites the process variable globally — incorrect; scope isolation. Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

- **d)** Both variables coexist; both readable simultaneously — close but inaccurate; in the local scope, only one name → one value (the shadowing rule applies). Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Variable scoping in Camunda 8 follows lexical scoping rules:
  - **Local variable shadows outer**: within the scope that has the local definition, the name resolves to the local value.
  - **Outer remains intact**: outside that scope (e.g., after the task completes, in parent / sibling scopes), the original outer variable is unmodified.
  - **No automatic propagation**: the local variable doesn't propagate up unless explicitly via Output Mapping.

  Example: process root has `orderId = "ORD-100"`. Inside the subprocess, Input Mapping creates local `orderId = "TEMP-XYZ"`. While that subprocess is running, FEEL references to `orderId` from within see "TEMP-XYZ". After the subprocess completes, the parent's `orderId` is still "ORD-100" (unless overwritten by Output Mapping).

  Practical recommendation: avoid name collisions when possible — it can confuse readers about which value is in effect. Use distinct names (e.g., `tempOrderId`, `formattedOrderId`) for local-scope variables.

- **Option b) — Wrong.** Shadowing allowed.

- **Option c) — Wrong.** Scope isolation.

- **Option d) — Inaccurate.** In local scope, name resolves to local value, not both.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Local shadows outer within scope; outer intact outside scope.
- **b) 1/10** — wrong; shadowing allowed.
- **c) 2/10** — wrong; scope isolation.
- **d) 4/10** — close but inaccurate on simultaneous readability.

**Correct Answer:** Local variable shadows outer within its scope; outer variable remains intact outside the scope.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "same name as process variable", "naming collision." Shadowing question.

**Въпросът → Solution Framing.** "What happens with collision" — изпитва се knowledge на variable scoping rules.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че shadowing follows lexical scoping, че outer не affected, че Output Mapping propagates if needed. Това е знание за variable scoping behaviour.

---

## Question 14: Configuring Processes (Weighting: 22%)

**Scenario:** A Sequential Multi-Instance Subprocess processes a list of orders sequentially. The team wants each iteration to **accumulate** a running total of processed amounts into a single shared variable `totalProcessed` (e.g., `totalProcessed += currentOrder.amount`). They wonder how this works with MI's scope rules.

**How does a Sequential MI accumulate a value across iterations?**

- **a)** **Use `outputCollection` to gather per-iteration results into a list, then aggregate outside the MI**. Sequential MI iterations run in **separate inner scopes**; updating a shared variable across iterations requires either: (1) accessing the parent scope's variable (FEEL navigates the scope hierarchy) AND using Output Mapping to write back to the parent; or (2) using `outputCollection` to collect each iteration's contribution, then a Service Task / FEEL expression after MI sums them. The cleaner pattern is `outputCollection` + post-MI aggregation. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/) + [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

- **b)** Set a process variable inside each iteration; values combine automatically — incorrect; per-iteration writes shadow within inner scope. Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

- **c)** Use `loopCounter` as accumulator — wrong; loopCounter is just the index. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** MI doesn't support accumulation — incorrect; outputCollection + aggregation handles it. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Sequential MI iterations each have their own inner scope. Variables set in one iteration's inner scope don't carry to the next iteration's inner scope (unless via the parent's scope). Patterns for accumulation:

  **Pattern 1: outputCollection + post-MI aggregation** (cleanest).
  - Configure `outputCollection = collectedAmounts`, `outputElement = currentOrder.amount`.
  - After each iteration, `collectedAmounts` accumulates the per-iteration `currentOrder.amount`.
  - After MI completes, use FEEL `=sum(collectedAmounts)` in an Output Mapping or downstream activity to get `totalProcessed`.

  **Pattern 2: Read-modify-write to parent scope** (less clean).
  - Inner iteration's Output Mapping writes back to parent scope's `totalProcessed`: `Target: totalProcessed (parent scope), Source: =totalProcessed + currentOrder.amount`.
  - Requires parent scope's `totalProcessed` initialised before MI starts.
  - More error-prone with concurrent or async edge cases.

  Pattern 1 is preferred for clarity and immutability.

- **Option b) — Wrong.** Per-iteration writes shadow.

- **Option c) — Wrong concept.** loopCounter е index.

- **Option d) — Wrong.** Achievable.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. outputCollection + sum() post-MI; cleanest accumulation pattern.
- **b) 3/10** — wrong; shadows within inner scope.
- **c) 2/10** — wrong concept.
- **d) 1/10** — wrong; achievable.

**Correct Answer:** Use outputCollection to gather per-iteration values; aggregate via FEEL sum() after MI completes.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Sequential MI", "accumulate running total", "shared variable." Cross-iteration accumulation.

**Въпросът → Solution Framing.** "How accumulate across iterations" — изпитва се MI scope + outputCollection knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че MI iterations have separate inner scopes, че outputCollection + post-MI sum() е clean pattern, че parent-scope-write е less clean alternative. Това е знание за MI accumulation patterns.

---

## Question 15: Configuring Processes (Weighting: 22%)

**Scenario:** A team handles 10 MB PDF documents in their process. They're choosing between **base64-encoded process variables** and **Document Handling references**. They want a quantitative sense of the trade-offs.

**Quantitative trade-offs: base64 in variables vs Document Handling references for 10 MB binaries?**

- **a)** **Base64 in variables**: ~30% size inflation (base64 encoding), so 10 MB binary = ~13.3 MB string. Broker state grows by ~13.3 MB per instance; multiplied across instances, broker storage / replication bandwidth balloons. Operate UI / API responses include the variable — slow to load, fragile network calls. **Document Handling**: process variable holds only a reference (small JSON object — few hundred bytes); binary is in configurable storage backend (in-memory dev, S3 / Azure Blob / GCS prod). Broker state stays small; queries / Operate / replication remain fast. For 10 MB binaries, Document Handling is **strongly preferred**. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **b)** Both equivalent — incorrect; major difference. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **c)** Base64 is faster — incorrect; bloated state slows everything. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **d)** Document Handling has higher latency — partial; one extra hop for binary retrieval, but the trade-off favors Document Handling for large content. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Quantitative comparison:
  - **Base64 in process variables**:
    - Storage: 10 MB binary → ~13.3 MB base64 string (33% inflation per RFC 4648).
    - Broker state: each instance carries this variable; with 1000 instances, ~13.3 GB.
    - Replication: every state change replicates across broker nodes; large variables increase replication bandwidth.
    - Operate / Tasklist UI: variable shown in lists / details; rendering / scrolling slow.
    - API responses: variable returned in instance API calls; large payloads, slow responses.
    - Memory: workers loading variables hold them in memory.

  - **Document Handling references**:
    - Variable: small JSON reference (~200-500 bytes), e.g., `{"camunda.document.type": "...", "storeId": "...", "documentId": "...", "metadata": {...}}`.
    - Binary in storage backend: cloud object store (S3, Azure, GCS) or filesystem; designed for binaries.
    - Broker state stays light; Operate fast.
    - Trade-off: one extra HTTP call to fetch the binary when needed (typically from worker to S3).

  For binaries > ~100 KB, Document Handling is strongly preferred. For tiny configuration values that happen to be binary (< 1 KB), variables can work.

- **Option b) — Wrong.** Major difference.

- **Option c) — Wrong.** Base64 slows broker.

- **Option d) — Partial.** One extra hop but huge state-side savings.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Base64 bloats broker state by 33%; Document Handling keeps state light с small reference.
- **b) 2/10** — wrong; major difference.
- **c) 2/10** — wrong; base64 slows broker.
- **d) 5/10** — partial; trade-off considered.

**Correct Answer:** Document Handling keeps broker state small; base64 bloats by ~33% and slows broker / Operate. Prefer Document Handling for 10 MB.

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/document-handling/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "10 MB PDF", "base64 vs Document Handling." Quantitative trade-off.

**Въпросът → Solution Framing.** "Quantitative trade-offs" — изпитва се knowledge на broker state implications.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че base64 inflates ~33%, че Document Handling keeps state light, че broker state size impacts replication / Operate / queries. Това е знание за Document Handling architecture impact.

---

## Question 16: Configuring Processes (Weighting: 22%)

**Scenario:** An IDP application processes uploaded PDF invoices. The team wonders how the **document reference** moves between BPMN: from the form upload (User Task), to the IDP task (extraction), to subsequent activities.

**How is the document reference passed between BPMN activities in an IDP workflow?**

- **a)** The document reference is **stored as a process variable** (a JSON object representing the Camunda Document reference). When the User Task's File Picker uploads a file, it lands in Document Handling storage; the reference becomes a process variable. The IDP task reads this variable, fetches the binary via Document Handling, extracts data. Subsequent activities reference the variable to access the document. The pattern is identical to any process variable flow — IDP doesn't have special handoff semantics. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/) + [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **b)** IDP has a special hidden channel for documents — incorrect; documents flow as variables. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **c)** Documents are inlined into the IDP request — partial; the IDP task receives the reference, fetches binary internally. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **d)** Each activity uploads the document independently — wasteful; upload once, pass reference. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Document Handling and IDP integration uses standard variable-passing semantics:
  - **User Task with File Picker**: user uploads file; form binding writes the document reference (a JSON object identifying the document in Document Handling storage) to the bound process variable (e.g., `invoiceDocument`).
  - **IDP task**: configured to read from a document-typed variable (e.g., `=invoiceDocument`); the IDP runtime fetches the binary via Document Handling, runs extraction, produces extracted fields as a structured variable (e.g., `idpResult`).
  - **Subsequent activities**: read `invoiceDocument` (if they need the original) and `idpResult` (for extracted data).

  All flow via standard process variables — no special handoff. This makes the workflow composable: User Task → IDP → Service Task → Human Review → ... — each consumes documents via reference.

- **Option b) — Wrong.** Standard variables, not hidden channel.

- **Option c) — Partial.** Reference passed, binary fetched internally.

- **Option d) — Wasteful.** Upload once, reference everywhere.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Document reference stored as variable; passed between activities like any variable.
- **b) 2/10** — wrong; standard variables.
- **c) 5/10** — partial; reference passed.
- **d) 2/10** — wasteful.

**Correct Answer:** Document reference flows as a process variable; standard variable-passing semantics.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/idp/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "document reference between activities", "form upload to IDP." Document flow.

**Въпросът → Solution Framing.** "How passed between activities" — изпитва се knowledge на Document + IDP integration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че documents flow as variables, че IDP reads reference + fetches binary internally, че upload-once pattern saves resources. Това е знание за Document + IDP composition.

---

## Question 17: Configuring Processes (Weighting: 22%)

**Scenario:** An Element Template for "AWS S3 Upload" Connector has two related properties: `bucket` and `regionalEndpoint`. The team wants `regionalEndpoint` to be **automatically computed** based on the selected `region` property (not user-settable, derived).

**Can Element Template properties be derived / computed from other properties?**

- **a)** **Element Templates' property schema is primarily declarative — properties accept user input or are hidden via conditions, but they don't have a built-in "computed from other properties" mechanism**. For derived values, options: (1) compute server-side via FEEL or worker logic, not in the Template; (2) use hidden properties that the user doesn't see but are set via the binding from a FEEL expression evaluating other properties (this works only for runtime FEEL evaluation, not design-time UI derivation). Best practice: keep template properties independent; compute derived values in the Connector function or BPMN logic. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **b)** Yes — `computed: "=region + \"-endpoint\""` attribute — invented; not a real schema field. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **c)** Yes — FEEL on property `value` field for cross-references — partial truth; design-time derivation across template properties isn't a documented pattern. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **d)** Element Templates don't support any property logic — overstates; conditions / constraints exist, but not full computed-from-other-property logic. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Element Templates have **declarative property schema**:
  - **Property definitions**: type, label, description, default value, binding (zeebe:input / zeebe:taskHeader / etc.).
  - **Constraints**: pattern, min/max length, notEmpty.
  - **Conditions** (visibility): show/hide based on other property values (declared, simple condition matching).

  But there's **no cross-property computed value** mechanism — you can't say "property B's value is derived from property A via formula." Workarounds:
  - **Runtime derivation**: the Connector function (Java code) computes the derived value based on inputs. The template asks user only for the inputs (e.g., `region`); the function computes `regionalEndpoint`.
  - **FEEL in BPMN binding**: a Connector property bound via `zeebe:input` can have its FEEL expression reference other process variables, evaluating at activation. But cross-template-property design-time derivation isn't supported.

  Best practice: minimise template property surface; derive at runtime in Connector code where possible.

- **Option b) — Invented.** No such attribute.

- **Option c) — Partial misconception.** Per-property FEEL `value` isn't a documented computed-from-other-template-property mechanism.

- **Option d) — Overstates.** Conditions / constraints exist; cross-property derivation doesn't.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Templates declarative; no cross-property compute; runtime derivation in Connector function.
- **b) 2/10** — invented attribute.
- **c) 4/10** — partial misconception.
- **d) 5/10** — overstates ("no property logic").

**Correct Answer:** Element Templates don't have cross-property compute; derive at runtime in Connector function code.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "regionalEndpoint computed from region", "Element Template derivation." Cross-property compute.

**Въпросът → Solution Framing.** "Computed from other properties" — изпитва се knowledge на Element Template schema limits.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че templates са declarative, че cross-property compute не supported, че runtime Connector logic handles derivation. Това е знание за Element Template limits + Connector design.

---

## Question 18: Configuring Processes (Weighting: 22%)

**Scenario:** An AI Agent Connector handles a multi-turn customer-service conversation. Each conversation involves multiple LLM calls (user asks → agent responds → user follows up → ...). The team wonders how the agent maintains **conversation memory** across calls within a single instance.

**How does the AI Agent Connector maintain conversation memory across iterations?**

- **a)** **Memory is maintained as a process variable** — typically `conversationHistory` or similar — holding the list of past turns (user messages, agent responses, tool calls). Each LLM call passes this history as context; the agent's response is appended to the history; the updated history persists in the process variable for the next iteration. The agent loop (in the Ad-hoc Subprocess pattern) updates the variable each turn. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **b)** LLM API handles memory internally — wrong; LLM APIs are typically stateless per call; the application passes context. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **c)** Memory isn't supported — incorrect; canonical pattern for agentic flows. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **d)** Use Document Handling to store conversation — workable for very long conversations but variables suffice for typical lengths. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** LLM APIs (OpenAI, Anthropic, etc.) are largely stateless per call — the model doesn't remember previous calls; the application provides the conversation context. The standard agentic pattern:
  - **Initial state**: `conversationHistory = []` (or starts with the system prompt).
  - **Each turn**:
    1. User input arrives (or agent receives previous context).
    2. Call LLM with: system prompt + `conversationHistory` + new user message + available tools.
    3. LLM responds (possibly with tool calls).
    4. Append the LLM's response to `conversationHistory`.
    5. If tool calls: execute the tool, append result to history, loop back to LLM.
    6. Repeat until LLM signals completion.

  Memory size considerations:
  - **Context window**: LLMs have token limits (e.g., 100K-200K tokens for modern models). Long conversations may exceed; truncate / summarise older turns when needed.
  - **Cost**: each call's input tokens cost money; long history = expensive. Trim or summarise.

  For very long conversations, use Document Handling to store full history while keeping a compact summary in the active variable.

- **Option b) — Wrong.** LLM stateless; app handles state.

- **Option c) — Wrong.** Canonical pattern.

- **Option d) — Partial.** For typical lengths, variables suffice.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Conversation history as process variable; pass + append per turn.
- **b) 2/10** — wrong; LLM stateless.
- **c) 1/10** — wrong; canonical pattern.
- **d) 5/10** — partial; for typical lengths variables suffice.

**Correct Answer:** Conversation history stored as a process variable; appended each turn; passed as context in each LLM call.

**Official Documentation Link:** https://docs.camunda.io/docs/components/agentic-orchestration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "multi-turn conversation", "memory across calls." Agentic memory.

**Въпросът → Solution Framing.** "How maintain memory" — изпитва се knowledge на AI Agent + state.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че LLM APIs са stateless, че application passes history as variable, че context window + cost matter. Това е знание за agentic memory patterns.

---

## Question 19: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task has **three Boundary Events** attached: Timer (PT2M), Error (errorCode "TIMEOUT"), and Message (`"CancelRequest"`). All could potentially fire. The team wonders what happens if multiple boundaries could match simultaneously.

**What's the BPMN behaviour when multiple Boundary Events could match for the same activity?**

- **a)** **The first event to trigger wins**: events fire as their conditions become true; whichever fires first (in event-time order) is the one that interrupts (or non-interrupts) the host. Other potential triggers don't apply once one has fired (for interrupting boundaries — the host is cancelled). For non-interrupting boundaries, multiple can fire in parallel as their conditions become true; the host stays active. The semantic isn't "all fire at once" but "first wins / non-interrupting compose." Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **b)** Highest-priority boundary wins — partial; some engines have priority; BPMN spec is "first to trigger." Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** All boundaries fire simultaneously — incorrect; first-wins for interrupting. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **d)** Only one boundary type allowed per activity — wrong; multiple supported. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Boundary Events fire based on their trigger conditions, asynchronously / independently. For multiple boundaries on the same activity:
  - **Interrupting boundaries**: the first one to trigger cancels the host activity and routes via its outgoing arrow. Other boundaries become moot (host no longer active).
  - **Non-interrupting boundaries**: each can fire as its condition becomes true; the host stays active; multiple non-interrupting "side flows" can run in parallel.
  - **Mixed**: non-interrupting can fire while host is active; if an interrupting then fires, it cancels the host (and ends the activity scope, terminating non-interrupting side flows if they're still running and depend on host scope).

  Example scenario: Timer (interrupting, PT2M), Error (interrupting, "TIMEOUT"), Message (non-interrupting, "CancelRequest"):
  - Message can fire at any time (non-interrupting reminder).
  - Whichever of Timer or Error fires first cancels the host.

  Concurrent firing in the exact same instant is theoretically possible but rare; the engine handles it deterministically per its event-loop semantics.

- **Option b) — Partial.** Some engines / configurations may add priority; BPMN spec doesn't define priority for boundaries.

- **Option c) — Wrong.** Not simultaneous.

- **Option d) — Wrong.** Multiple supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. First-to-trigger wins for interrupting; non-interrupting compose in parallel.
- **b) 5/10** — partial; priority not BPMN-spec.
- **c) 2/10** — wrong; not simultaneous.
- **d) 1/10** — wrong; multiple supported.

**Correct Answer:** First-to-trigger wins (for interrupting); non-interrupting can fire in parallel.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "three Boundary Events", "multiple could match simultaneously." Boundary priority question.

**Въпросът → Solution Framing.** "What happens" — изпитва се knowledge на boundary firing semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че first-to-trigger wins for interrupting, че non-interrupting compose, че simultaneous firing rare. Това е знание за boundary firing rules.

---

## Question 20: Configuring Processes (Weighting: 22%)

**Scenario:** A team's external system publishes the **same `OrderShipped` message twice** due to a network retry — they want Camunda to **deduplicate** so the process correlates only once.

**Which message attribute enables deduplication of duplicate messages?**

- **a)** **`messageId`** — when publishing a message, set a unique `messageId` per logical message (e.g., the order's `orderId`). Zeebe deduplicates: if a message with the same `messageId` arrives within the configured time window, the duplicate is ignored. The first one correlates; subsequent duplicates are discarded. Pair with `timeToLive` to control how long the deduplication window stays active. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **b)** Camunda auto-deduplicates by content — incorrect; deduplication requires explicit messageId. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **c)** Use a Service Task to track which messages have been processed — workable workaround but messageId is the built-in mechanism. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **d)** Deduplication isn't supported — incorrect; messageId provides it. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe's `publishMessage` command supports `messageId` for deduplication:
  - **Set messageId**: when the publisher knows a unique identifier for the logical message, include it in the publish call. E.g., the external system uses the order ID, so messageId = "order-shipped-ORD-12345".
  - **Deduplication window**: configured by `timeToLive`. Within this window, duplicates with the same messageId are recognised and ignored.
  - **Behaviour**: first message with that messageId correlates (or buffers waiting for subscription); subsequent duplicates within the TTL window are discarded silently.

  This shifts deduplication responsibility from each consumer to the broker: external systems can retry safely, knowing Zeebe deduplicates. Without messageId, every publish is treated as a new message and could correlate multiple times.

  Best practice: in any "at-least-once delivery" integration (which most networked publishers are), use messageId for safety.

- **Option b) — Wrong.** Requires explicit messageId.

- **Option c) — Workaround.** messageId is built-in.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. messageId per logical message + timeToLive controls dedup window.
- **b) 1/10** — wrong; requires explicit.
- **c) 4/10** — workaround; messageId built-in.
- **d) 1/10** — wrong; supported.

**Correct Answer:** Set messageId per publishMessage call; Zeebe deduplicates duplicates within the configured timeToLive window.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/messages/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "duplicate messages", "deduplicate so correlate only once." Message deduplication.

**Въпросът → Solution Framing.** "Attribute enables deduplication" — изпитва се knowledge на messageId mechanism.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че messageId enables dedup, че timeToLive controls window, че at-least-once integration patterns need it. Това е знание за message reliability.

---

## Question 21: Configuring Processes (Weighting: 22%)

**Scenario:** A team layered retry: BPMN `zeebe:taskDefinition retries = 5`, AND the worker code has internal retry logic (e.g., the HTTP client retries 3 times). They wonder how these two retry layers interact.

**How do BPMN-level retries and worker-internal retries compose?**

- **a)** **They compose multiplicatively** — worker retries 3 times **per BPMN activation**; BPMN retries 5 times → worker has up to 5 × 3 = 15 internal retries total before incident. Each BPMN-level retry is a fresh job activation; worker's internal retries happen within one activation. **Best practice**: be aware of total retry count to avoid runaway retries; tune backoff at both levels. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Worker retries override BPMN retries — incorrect; both layers apply. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** BPMN retries don't trigger if worker is retrying internally — incorrect; worker eventually returns success or failure to Zeebe; failure triggers BPMN retry. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Only one layer applies — incorrect; both apply. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Two independent retry layers:
  - **Worker-internal retries**: within a single job activation, the worker's code (HTTP client retry library, custom try/catch loop) retries the underlying operation. Doesn't involve Zeebe.
  - **BPMN-level retries**: after a worker reports failure (via gRPC `fail-job` or by not completing within activation timeout), Zeebe decrements the `retries` counter. If > 0, re-activates the job (potentially after `retryBackoff`); if 0, creates an Incident.

  Composition: total possible retries = BPMN retries × worker retries (worst case). For 5 BPMN retries with worker doing 3 retries each: up to 15 total attempts.

  Implications:
  - **Latency**: if each worker retry has a delay, and BPMN has its own backoff, total latency for repeated failures can be long. Tune carefully.
  - **External API load**: 15 calls per failure can stress partners; coordinate with external systems' rate limits.
  - **Visibility**: BPMN-level retries are visible in Operate (jobs and retries counters); worker-internal retries are invisible to Camunda unless explicitly logged.

  Best practice: pick ONE primary retry layer for predictability. If the worker handles its own retries comprehensively (with appropriate backoff and giving up on permanent failures), set BPMN retries low (e.g., 1) — the worker has already exhausted recovery attempts. Or vice versa: worker doesn't retry; rely on BPMN retries for resilience.

- **Option b) — Wrong.** Both apply.

- **Option c) — Wrong.** Worker eventually returns to Zeebe.

- **Option d) — Wrong.** Both apply.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Layers compose multiplicatively; best practice = pick one primary retry layer.
- **b) 2/10** — wrong; both apply.
- **c) 2/10** — wrong; worker returns to Zeebe.
- **d) 1/10** — wrong; both apply.

**Correct Answer:** Both layers apply; compose multiplicatively (BPMN × worker = total). Pick one as the primary retry strategy.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "BPMN retries AND worker internal retries", "interact." Multi-layer retry interaction.

**Въпросът → Solution Framing.** "How compose" — изпитва се knowledge на retry layer composition.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че layers compose multiplicatively, че Camunda sees BPMN-level retries не worker-internal, че single-layer simpler to reason. Това е знание за retry architecture.

---

## Question 22: Configuring Processes (Weighting: 22%)

**Scenario:** A team's Service Task `enrich-customer` reads `customer.id` and produces `customer.fullProfile`. The team wonders if the worker can use **Input Mapping** to extract just `customer.id` (rather than the full `customer` object) for efficiency.

**How does Input Mapping select specific fields from a nested variable?**

- **a)** Use **Input Mapping with FEEL** extracting just the needed field: `Target: customerId, Source: =customer.id`. The worker receives `customerId` as a local-scoped string variable, not the full `customer` object. Reduces payload size and clarifies the worker's input contract. Documentation: [I/O Mappings](https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings)

- **b)** Worker must accept the full `customer` object — incorrect; Input Mapping projects fields. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Input Mapping only supports top-level variables — incorrect; FEEL navigates nested paths. Documentation: [I/O Mappings](https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings)

- **d)** Convert nested variable to flat before the task — workable but unnecessary; FEEL navigation handles it inline. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Input Mapping with FEEL is the canonical way to select specific fields. The source FEEL expression can be any FEEL expression — it doesn't have to reference a top-level variable. Examples:
  - **Extract field**: `Source: =customer.id, Target: customerId`.
  - **Compute**: `Source: =customer.firstName + " " + customer.lastName, Target: fullName`.
  - **Filter list**: `Source: =[i in items : i.status = "PENDING"], Target: pendingItems`.
  - **Default value**: `Source: =if customer.preferredCurrency != null then customer.preferredCurrency else "USD", Target: currency`.

  The worker sees only the targets — clean, explicit contract. Reduces what's sent over the wire (especially with `fetchVariables` whitelist combined with Input Mapping).

- **Option b) — Wrong.** Input Mapping enables projection.

- **Option c) — Wrong.** FEEL navigates nested.

- **Option d) — Wasteful.** Inline FEEL handles it.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Input Mapping FEEL extracts specific field; clean worker contract.
- **b) 1/10** — wrong; projection supported.
- **c) 1/10** — wrong; FEEL navigates.
- **d) 4/10** — wasteful.

**Correct Answer:** Input Mapping with FEEL: Source `=customer.id`, Target `customerId`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "extract just customer.id", "not full object." Input Mapping projection.

**Въпросът → Solution Framing.** "How select specific fields" — изпитва се knowledge на Input Mapping FEEL capability.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Input Mapping accepts any FEEL expression, че projection / computation / defaults supported, че clean worker contract benefits. Това е знание за Input Mapping flexibility.

---

# Section 3 — Decisions & DMN (Questions 23-29)

> Weight 11% • Topics: FIRST with row order, DMN imports, FEEL `in` operator, output without value list, Input Data nodes, DMN namespaces, BPMN+DMN deployment.

---

## Question 23: Decisions & DMN (Weighting: 11%)

**Scenario:** A pricing-decision DMN with **FIRST** hit policy has 5 rules. Rules are ordered from most specific to most general (specific-first design). The team wonders how FIRST evaluates and what happens if the order is wrong.

**How does FIRST hit policy evaluate rules, and does row order matter?**

- **a)** **FIRST evaluates rules top-down by row order; returns the first matching rule's output and stops**. Row order is **critical** — if a generic rule appears before specific rules, the generic one matches first and the specific ones are never reached. Best practice for FIRST: order specific-first, generic-last (default at the bottom). Documentation: [DMN Hit Policies](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** FIRST evaluates randomly — incorrect; row order. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** Row order doesn't matter for FIRST — incorrect; row order is the basis. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** FIRST evaluates all and picks alphabetically — wrong invented behaviour. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FIRST hit policy semantics:
  - Engine scans rules **top-down by row order**.
  - First rule whose inputs all match wins; its output is the result.
  - **Short-circuit**: remaining rules aren't evaluated.

  Implications:
  - **Row order is meaningful** — rearranging changes which rule matches first.
  - **Specific-first design**: put highly-specific rules (narrow matching conditions) at the top; general / fallback rules at the bottom.
  - **Catch-all** as the last row (all inputs `-` wildcard) ensures a result even when no specific rule matches.

  Example anti-pattern: a rule "if customer is VIP, give 25% discount" placed below a generic "if any customer, give 10% discount." The generic rule matches first, VIPs only get 10%. Reorder: VIP rule first, generic rule second (or as default).

  Contrast with PRIORITY hit policy: PRIORITY orders by **output value priority** (not row order). For row-order semantics, use FIRST or RULE ORDER.

- **Option b) — Wrong.** Row order, not random.

- **Option c) — Wrong.** Row order matters.

- **Option d) — Wrong invented.** No alphabetical logic.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FIRST = row-order top-down; specific-first design.
- **b) 1/10** — wrong; row order.
- **c) 1/10** — wrong; row order matters.
- **d) 1/10** — wrong invented.

**Correct Answer:** FIRST evaluates rules top-down; row order is critical; specific-first design recommended.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "FIRST policy", "row order matters." Hit policy evaluation order.

**Въпросът → Solution Framing.** "How evaluates" — изпитва се knowledge на FIRST semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FIRST е row-order short-circuit, че specific-first design recommended, че PRIORITY differs (output value priority). Това е знание за FIRST hit policy.

---

## Question 24: Decisions & DMN (Weighting: 11%)

**Scenario:** A team has multiple DMN files: `tax-rules.dmn` (defines tax calculations), `discount-rules.dmn` (defines discounts), `pricing-decision.dmn` (uses both). The team wonders if DMN supports **importing** definitions across files.

**Does DMN support imports / cross-file references?**

- **a)** **Yes — DMN supports an `<import>` element** that allows referencing definitions from another DMN file (BKMs, decisions, etc.). The importing DMN declares the import; uses the imported elements via their qualified names. Useful for modular DMN architectures — shared rules / BKMs across multiple decision files. **Caveat**: Zeebe's coverage of DMN imports has varied; verify the current docs for your version. In versions with limited import support, the practical alternative is to deploy related decisions in a single DMN file and use DRD dependencies. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** No — each DMN file is self-contained — partial; without imports, it's true. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Yes — automatic discovery via deployment namespace — wrong mechanism. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Use BPMN Call Activity to call DMN cross-file — wrong abstraction; Call Activity invokes BPMN processes. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct (with caveat).** DMN spec defines `<import>` for cross-file referencing — analogous to import statements in programming languages. An importing DMN declares which other DMN file's definitions it depends on; references them by qualified name.

  Practical caveat: **Camunda 8 / Zeebe's DMN runtime coverage for imports has historically been limited**. Verify the current BPMN coverage docs to see what's supported. Where imports aren't supported:
  - **Practical workaround**: keep related decisions in a single DMN file; use DRD's internal Information / Knowledge / Authority Requirements for in-file modularity.
  - **For truly shared logic across processes**: invoke separately-deployed decisions from BPMN (via Business Rule Tasks); use the deployment-time decision ID as the cross-process binding.

- **Option b) — Partial.** Without imports, files self-contained.

- **Option c) — Wrong mechanism.** Imports are explicit, not auto-discovery.

- **Option d) — Wrong tool.** Call Activity is BPMN.

**Per-option scoring (1–10):**
- **a) 9/10** — верен с caveat. DMN spec supports imports; Zeebe coverage varies.
- **b) 4/10** — partial; without imports, true.
- **c) 2/10** — wrong mechanism.
- **d) 2/10** — wrong tool.

**Correct Answer:** DMN spec supports `<import>` for cross-file references; Zeebe coverage varies — verify per version.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "multiple DMN files", "import definitions across files." DMN modularity.

**Въпросът → Solution Framing.** "Supports imports" — изпитва се knowledge на DMN spec + Zeebe coverage.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN spec defines import, че Zeebe coverage varies, че single-file + DRD е practical alternative. Това е знание за DMN modularity.

---

## Question 25: Decisions & DMN (Weighting: 11%)

**Scenario:** A FEEL expression checks if a value is in a set of allowed values: `=customerTier in ["GOLD", "PLATINUM", "DIAMOND"]`. The team wonders if `in` is a FEEL operator.

**Is `in` a FEEL operator for membership tests?**

- **a)** **Yes** — FEEL supports `in` for membership / range / set tests. Forms:
  - **List membership**: `=value in ["A", "B", "C"]` (true if value equals any list element).
  - **Range membership**: `=value in [1..10]` (true if value is in the range; inclusive endpoints).
  - **In unary tests (DMN input entries)**: more compact than equality alternation.

  Useful for clean conditional logic. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** No — use `or`-chained equality (`value = "A" or value = "B" or value = "C"`) — workable workaround, but `in` is the FEEL operator. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `in` works only inside DMN tables — incorrect; FEEL `in` works in expressions generally. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `contains` operator instead — `contains` is the inverse direction (list contains value). Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `in` is a binary operator with overloaded semantics:
  - **`value in list`**: true if value equals any list element. `="EU" in ["US", "EU", "APAC"]` returns true.
  - **`value in range`**: true if value falls in the range. `=score in [70..90]` returns true if 70 ≤ score ≤ 90.
  - **`value in unary test`** (DMN context): the rule's input entry can use `in` for compact set membership.

  Concise and readable; avoids `or`-chained equality. Performance: typically equivalent or better than chained equality for short lists.

  Counterpart: `list contains(list, value)` is FEEL's list-contains function (callable form). `in` is the operator form; both achieve similar semantics from different angles.

- **Option b) — Workaround.** `in` is the operator.

- **Option c) — Wrong.** `in` works in expressions generally.

- **Option d) — Inverse direction.** `list contains(list, value)` flips it.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `in` operator for list / range / unary test membership.
- **b) 5/10** — workaround.
- **c) 2/10** — wrong; works generally.
- **d) 4/10** — inverse direction; different.

**Correct Answer:** `in` is a FEEL operator for list / range membership tests.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "value in set of allowed values", "in operator." Membership test.

**Въпросът → Solution Framing.** "in а FEEL operator" — изпитва се knowledge на FEEL operators.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL има `in` operator, че works with lists / ranges / unary tests, че list contains() е inverse-direction function. Това е знание за FEEL operators.

---

## Question 26: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN output column `discount` doesn't have a **value list** (no enumerated allowed values declared). The column is numeric. The team wonders if PRIORITY hit policy works on this column.

**Does PRIORITY hit policy work on output columns without a value list?**

- **a)** **PRIORITY requires the output column to have a value list** that defines the priority order. Without it, the engine has no way to determine "which output is higher priority." Validation typically catches this at design time (or runtime evaluation fails). For numeric outputs where higher number = higher priority, alternatives: (1) use COLLECT with **MAX aggregator** to pick the highest numeric value; (2) add a value list defining priority order. Documentation: [DMN Hit Policies](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** PRIORITY works on any output, sorts numerically — incorrect; PRIORITY uses value-list-based priority, not numeric sort. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** PRIORITY works on alphabetical order — wrong invented behaviour. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** Value lists aren't part of DMN — incorrect; standard DMN feature. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** PRIORITY hit policy depends on the output column's **value list** (allowed values) to define priority order. The list's element order **is** the priority order. Without a value list:
  - PRIORITY can't determine which output is "higher" — undefined behaviour.
  - Design-time validation (in Web Modeler / DMN Tester) typically flags this.
  - If somehow deployed, runtime evaluation likely fails.

  Alternatives for numeric "highest priority" without value lists:
  - **COLLECT with MAX**: when multiple rules match, returns the highest numeric output.
  - **COLLECT with MIN**: returns lowest.
  - Configure FIRST: order rules so the highest-priority condition is first.

  Best practice for PRIORITY use:
  - Declare a value list on the output column with the priority order (e.g., `["EXTREME", "HIGH", "MEDIUM", "LOW"]` — EXTREME wins).
  - Ensure all rule outputs come from this list.
  - PRIORITY then deterministically returns the single highest-priority output.

- **Option b) — Wrong.** Value-list-based, not numeric sort.

- **Option c) — Wrong.** No alphabetical default.

- **Option d) — Wrong.** Value lists are standard.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. PRIORITY needs value list; COLLECT-MAX е alternative for numeric.
- **b) 3/10** — wrong; uses value list not numeric sort.
- **c) 1/10** — wrong invented.
- **d) 1/10** — wrong; standard.

**Correct Answer:** PRIORITY requires a value list on the output column; alternative for numeric = COLLECT with MAX/MIN.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "PRIORITY without value list", "numeric output." PRIORITY requirements.

**Въпросът → Solution Framing.** "Works without value list" — изпитва се PRIORITY constraint.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че PRIORITY uses value list ordering, че COLLECT-MAX/MIN е numeric alternative, че value list е DMN standard. Това е знание за PRIORITY semantics.

---

## Question 27: Decisions & DMN (Weighting: 11%)

**Scenario:** A DRD has a decision `Pricing` that uses inputs `productCategory`, `customerTier`, `quantity`. The team is unclear about **Input Data** nodes in the DRD vs simply listing inputs in the decision's column.

**What's the role of Input Data nodes in a DRD?**

- **a)** **Input Data nodes represent external data flowing into the decision graph** — visually appear as rounded rectangles in the DRD. They formalise "what data the decision needs from outside." Connected to decisions via **Information Requirements** (dashed arrows). For executable DMN, the actual input column values come from the calling BPMN's variables; Input Data nodes are primarily documentation / contract specification. Documentation: [DMN DRD](https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-diagram/)

- **b)** Input Data nodes are mandatory for runtime execution — partial; visual documentation primarily; actual input from calling context. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Input Data nodes ARE the input columns — wrong; columns are inside the decision table; Input Data is at DRD level. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Input Data nodes are deprecated — incorrect; standard DRD entity. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Input Data** is one of the DRD entity types (alongside Decision, Business Knowledge Model, Decision Service, Knowledge Source):
  - **Visual**: rounded rectangle.
  - **Purpose**: declare what external data the decision graph requires. Examples: "Customer Profile," "Order Details," "Date Of Birth."
  - **Connections**: Information Requirements (dashed arrows) from Input Data to Decisions / BKMs that use them.
  - **Documentation value**: makes the data flow explicit — readers see what the decision needs without parsing decision bodies.

  For **executable DMN**: the actual values come from the calling context (BPMN's variables, or REST evaluate-decision API's input). The Input Data node's role is contract specification / DRD readability.

  Practical use: declare Input Data nodes for major data sources; the DRD becomes a clear data-flow diagram showing inputs → decisions → outputs.

- **Option b) — Partial.** Visual documentation; not mandatory for execution.

- **Option c) — Wrong.** Columns vs DRD-level distinction.

- **Option d) — Wrong.** Standard entity.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Input Data nodes represent external data inputs at DRD level; documentation value.
- **b) 6/10** — partial; documentation primarily.
- **c) 3/10** — wrong; distinct from columns.
- **d) 1/10** — wrong; standard.

**Correct Answer:** Input Data nodes represent external data flowing into the decision graph; visual documentation of data requirements.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-requirements-diagram/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Input Data nodes in DRD", "vs decision columns." DRD entity question.

**Въпросът → Solution Framing.** "Role of Input Data" — изпитва се DRD vocabulary.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Input Data е DRD entity, че represents external data inputs, че documentation primarily, че distinct from internal columns. Това е знание за DRD entities.

---

## Question 28: Decisions & DMN (Weighting: 11%)

**Scenario:** A team examines DMN XML and sees multiple **namespaces** declared: standard DMN, FEEL, and a Zeebe-specific one. They want to understand the namespace structure.

**What namespaces are used in Camunda 8 DMN XML?**

- **a)** **Multiple namespaces compose the DMN XML**:
  - **OMG DMN namespace** (e.g., `http://www.omg.org/spec/DMN/...`) for standard DMN elements (decision, decision table, etc.).
  - **OMG FEEL namespace** for FEEL expressions.
  - **OMG DMNDI namespace** (`http://www.omg.org/spec/DMN/.../DMNDI/`) for diagram interchange (visual layout).
  - **Zeebe namespace** (`http://camunda.org/schema/zeebe/...`) for Zeebe-specific execution extensions (similar to Zeebe extensions in BPMN).
  
  This layered namespace approach lets Camunda extend standard DMN with execution-specific metadata without breaking spec compliance. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Single Camunda-only namespace — incorrect; layered with OMG. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** No namespaces; flat XML — incorrect; namespaces are XML standard. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Identical to BPMN namespaces — wrong; DMN has its own namespaces. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 DMN XML follows the OMG DMN spec, using multiple namespaces:
  - **`http://www.omg.org/spec/DMN/...`**: the main DMN namespace; contains `<definitions>`, `<decision>`, `<businessKnowledgeModel>`, `<decisionTable>`, etc.
  - **`http://www.omg.org/spec/DMN/.../FEEL`**: FEEL namespace for expression elements.
  - **`http://www.omg.org/spec/DMN/.../DMNDI`**: DMN Diagram Interchange — visual layout (positions of nodes, edge waypoints, etc.).
  - **`http://camunda.org/schema/zeebe/...`**: Camunda Zeebe extensions — execution-specific metadata for Zeebe.

  This layered design:
  - **Spec compliance**: the OMG-namespaced parts are portable across DMN-compliant engines.
  - **Vendor extensions**: Zeebe-specific runtime hints go in the Zeebe namespace without polluting OMG elements.
  - **Diagram preservation**: DMNDI captures layout for tools to render the DRD consistently.

  Parallel: BPMN XML similarly mixes OMG BPMN namespace + Zeebe extension namespace + BPMNDI (diagram interchange).

- **Option b) — Wrong.** Layered with OMG.

- **Option c) — Wrong.** Namespaces standard.

- **Option d) — Wrong.** DMN-specific namespaces.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple OMG + Zeebe namespaces layered.
- **b) 2/10** — wrong; OMG + Zeebe layered.
- **c) 1/10** — wrong; namespaces standard.
- **d) 2/10** — wrong; DMN-specific.

**Correct Answer:** Multiple namespaces — OMG DMN + FEEL + DMNDI + Zeebe extension — layered.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "DMN XML namespaces", "OMG and Zeebe." Namespace structure.

**Въпросът → Solution Framing.** "Namespaces used" — изпитва се knowledge на DMN spec structure.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN XML layers OMG + Zeebe namespaces, че separation enables spec compliance + vendor extensions, че parallel to BPMN. Това е знание за DMN XML architecture.

---

## Question 29: Decisions & DMN (Weighting: 11%)

**Scenario:** A team deploys a BPMN and a DMN together in one deployment. The BPMN's Business Rule Task references the DMN's decision. The team wonders about **atomic deployment**.

**Are BPMN and DMN deployed atomically when packaged together?**

- **a)** **Yes — Zeebe supports atomic deployment of multiple resources in a single deployment request**. Submit BPMN + DMN + Forms + other resources together via the deployment API; Zeebe deploys them as a unit. Either all succeed or all are rolled back (validation failure on any resource cancels the deployment). After successful deployment, instance-creation can immediately use both BPMN and DMN — no separate deployment sequencing concerns. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

- **b)** Each resource deploys independently — incorrect; atomic deployment supported. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

- **c)** BPMN deploys first, then DMN — wrong sequencing concern; atomic deployment handles it. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

- **d)** Atomic deployment only for BPMN — incorrect; multi-resource deployments are atomic. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe's deployment API accepts multiple resources in a single request and processes them as an atomic transaction:
  - **Validation**: each resource is validated (BPMN structural checks, DMN well-formedness, etc.). If any fails, the deployment is rejected; no resources are deployed.
  - **Atomicity**: on success, all resources become available simultaneously. The BPMN can immediately reference the DMN; both are queryable.
  - **Versioning**: each resource gets its version (separately tracked per resource type).

  Practical benefits:
  - **No partial deployments**: avoid the "BPMN deployed but DMN not yet" race condition.
  - **CI/CD simplicity**: one deployment command for related resources.
  - **Atomic rollback**: if any resource has issues, none deploy — you fix and re-deploy.

  zbctl example:
  ```
  zbctl deploy --resourceFile order.bpmn --resourceFile pricing.dmn --resourceFile form.form
  ```
  All deploy atomically.

- **Option b) — Wrong.** Atomic.

- **Option c) — Wrong sequencing concern.** Atomic, no sequence needed.

- **Option d) — Wrong.** Multi-resource atomic.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multi-resource atomic deployment; all-or-nothing.
- **b) 2/10** — wrong; atomic.
- **c) 3/10** — wrong sequencing.
- **d) 1/10** — wrong; multi-resource atomic.

**Correct Answer:** Yes — Zeebe deploys multiple resources atomically in a single request; all-or-nothing.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/deployment/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "BPMN and DMN packaged together", "atomic deployment." Multi-resource deployment.

**Въпросът → Solution Framing.** "Deployed atomically" — изпитва се knowledge на deployment atomicity.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe supports atomic multi-resource deployment, че all-or-nothing simplifies CI/CD, че individual versioning per resource. Това е знание за deployment atomicity.

---

# Section 4 — Configuring Forms (Questions 30-32)

> Weight 5% • Topics: Expression vs binding distinction, theming, versioning per deployment.

---

## Question 30: Configuring Forms (Weighting: 5%)

**Scenario:** A Form's field has both a **`key`** property (the variable name to bind to) and an **`expression`** property in some component types. The team wonders what's the difference between them.

**What's the distinction between a Form field's `key` (binding) and `expression`?**

- **a)** **`key` is the binding identifier** — the process variable / nested path the field reads from and writes to. E.g., `key: "customer.name"` binds the field to that variable. **`expression`** (when supported on display-only components like Text View) is a **FEEL expression for computed display** — the displayed value is derived from other values, not a direct binding. So: `key` for editable / round-tripped fields; `expression` for read-only / derived display. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **b)** They're the same thing — incorrect; distinct properties. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** `expression` is for validation, `key` for binding — wrong; validation has its own properties. Documentation: [Forms validation](https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-validation/)

- **d)** Only `key` exists; no expression — incorrect; both exist for different component types. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Form components have distinct properties for different purposes:
  - **`key`** (binding identifier): for **editable / round-tripped** fields (Text Input, Number Input, Checkbox, Datepicker, etc.). The key specifies which process variable (or nested path) the field reads on form load and writes on form submit.
  - **`expression`** (FEEL expression for display): for **display-only / computed** components (Text View, Heading, sometimes others). The expression evaluates against form data + process context; the result is shown but not stored anywhere — purely visual.

  Use case for `expression`: derived display values. E.g., "Total: $X" where X is computed from other fields. The Text View component shows the total; user can't edit it; it updates as other fields change.

  Use case for `key`: actual data input. E.g., "First Name" Text Input bound to `customer.firstName`. User types; on submit, the value writes to that variable.

  Some components might support both — `key` for the bound variable plus an `expression` for derived alternative display. Verify per component.

- **Option b) — Wrong.** Distinct.

- **Option c) — Wrong.** Validation has separate properties (`validate.required` etc.).

- **Option d) — Wrong.** Both exist.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. key = binding for editable; expression = FEEL for computed display.
- **b) 1/10** — wrong; distinct.
- **c) 2/10** — wrong; validation е separate.
- **d) 1/10** — wrong; both exist.

**Correct Answer:** `key` is for binding editable fields to variables; `expression` is FEEL for computed display values.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "key vs expression", "form field properties." Form property distinction.

**Въпросът → Solution Framing.** "Distinction" — изпитва се knowledge на Form field properties.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че key е binding identifier, че expression е FEEL for display, че editable vs display-only components use different properties. Това е знание за Form component schema.

---

## Question 31: Configuring Forms (Weighting: 5%)

**Scenario:** A company's brand requires Forms to use specific colours, fonts, button styles — matching corporate identity. The team wants to **customise the visual styling** of Tasklist forms beyond defaults.

**How can Camunda Forms be visually customised / themed?**

- **a)** **Limited theming in Tasklist** itself (some configurations may allow brand colours / logo); for **deep customisation, embed the form-js library** in a custom UI / portal and apply **custom CSS / themes**. The form schema (BPMN-deployable Form definition) is rendering-agnostic; the renderer applies styling. For full brand alignment, embedding into a custom app is the canonical path. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/) + [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **b)** No customisation; defaults only — incorrect; embedding enables deep customisation. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Apply CSS through process variables — wrong mechanism. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Tasklist supports full theming out of the box — partial; Tasklist may allow some branding but deep customisation typically requires embedding. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Two paths for Form visual customisation:
  - **Tasklist-level theming** (limited): Tasklist may support some configuration (logo, primary colour, etc.) per deployment. Verify Tasklist version's capabilities. For SaaS, theming options may be in Console.
  - **Embedded form-js** (deep customisation): the form-js library (the JS renderer for Camunda Forms) can be embedded into a custom React / Angular / Vue / etc. app. Apply custom CSS, themes, component overrides. The Form schema (deployed BPMN-attached Form) is rendering-agnostic — embed wherever you need.

  Practical pattern:
  - **Internal Tasklist users**: live with Tasklist's default styling (or its theming options); good enough for most internal use.
  - **Customer-facing portals**: embed form-js in your branded portal; apply your company's design system; users never see Tasklist.

  This separation (Form schema vs rendering) enables Forms to work in many contexts without duplicating the form definition.

- **Option b) — Wrong.** Customisable.

- **Option c) — Wrong mechanism.** CSS at renderer / build level, not via process variables.

- **Option d) — Partial.** Tasklist has some theming; deep customisation typically requires embedding.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Tasklist limited theming; embedded form-js for deep customisation.
- **b) 1/10** — wrong; customisable.
- **c) 2/10** — wrong mechanism.
- **d) 5/10** — partial; Tasklist limited.

**Correct Answer:** Tasklist has limited theming; embed form-js in a custom UI for deep customisation.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "custom branding", "corporate identity styling." Form customisation.

**Въпросът → Solution Framing.** "How customised" — изпитва се knowledge на Form rendering options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Tasklist има limited theming, че form-js embed enables deep customisation, че schema is renderer-agnostic. Това е знание за Form rendering customisation.

---

## Question 32: Configuring Forms (Weighting: 5%)

**Scenario:** A team updates a Form (adds a new field, changes a label). They wonder if **redeploying the Form** affects running instances that already have the old Form version associated.

**How does Form versioning relate to running instances?**

- **a)** **Each Form deployment creates a new version**; running instances reference the **specific version** their BPMN was deployed with (or the latest at activation time, depending on the form-key resolution semantics). New User Task activations after the new Form deployment may use the latest version (or stay pinned per the BPMN's reference). For breaking Form changes during running instances, plan migration / version pinning carefully. Verify the specific version-binding semantics for your Camunda 8 version. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/) + [Versioning](https://docs.camunda.io/docs/components/concepts/process-instance-versioning/)

- **b)** Forms don't version; latest always used — partial; depends on configuration. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Running instances are immune to Form changes — partial; depends on resolution. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Form changes break running instances — overstated; pinning usually protects. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Forms in Camunda 8 are deployed resources with versions, similar to BPMN/DMN. When a BPMN's User Task references a Form by ID, the resolution mechanism determines which Form version is shown:
  - **Pin to specific version**: the BPMN reference includes the version explicitly, so running instances always see that version.
  - **Latest at activation**: the BPMN references the form ID without version pinning; each User Task activation uses the latest Form version at that moment.
  - **Pin to BPMN's deployment time**: the form version is fixed when the BPMN deploys.

  Exact semantics depend on the version-binding configuration in your BPMN and Camunda 8 version. Verify the docs.

  Practical implications:
  - **Breaking Form changes during running instances**: a new field added with `required = true` might surprise an in-flight instance whose User Task already activated with the old form. If using "latest" resolution, the user might see a form expecting fields not in process scope.
  - **Mitigation**: pin to specific version in the BPMN reference (where supported); or design Form changes to be backward-compatible (only adding optional fields).
  - **Migration**: for major Form overhauls, plan a deployment window with low in-flight task counts; or migrate process instances explicitly.

- **Option b) — Partial.** Configuration-dependent.

- **Option c) — Partial.** Pinning protects.

- **Option d) — Overstated.** Usually pinning protects.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Form versioning; resolution depends on pinning vs latest; plan breaking changes carefully.
- **b) 5/10** — partial; configuration-dependent.
- **c) 5/10** — partial; pinning protects.
- **d) 4/10** — overstated.

**Correct Answer:** Forms are versioned; resolution depends on pinning vs latest; plan breaking changes carefully (pin or design backward-compatible).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "redeploy Form", "affect running instances." Form versioning impact.

**Въпросът → Solution Framing.** "Versioning relates to running" — изпитва се knowledge на Form version binding.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Forms versioned, че resolution е pin-or-latest, че breaking changes affect in-flight tasks, че backward-compatible changes safer. Това е знание за Form lifecycle management.

---

# Section 5 — Configuring Connectors (Questions 33-36)

> Weight 6% • Topics: Multiple outputs, chaining, message idempotency, custom inbound.

---

## Question 33: Configuring Connectors (Weighting: 6%)

**Scenario:** An HTTP Outbound Connector calls a partner API. The response includes both a **body** (JSON with product data) and **headers** (rate-limit info, request ID). The team wants both available downstream.

**How does the Connector expose response body AND headers?**

- **a)** The Connector's response is typically a **structured object** with `body` and `headers` (and `statusCode`) properties. Use **Output Mapping** to extract what you need into process variables: `Target: data, Source: =response.body` and `Target: rateLimit, Source: =response.headers["X-RateLimit-Remaining"]`. Different parts of the response go to different variables. Documentation: [HTTP Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

- **b)** Only body is accessible — incorrect; headers are part of response. Documentation: [HTTP Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

- **c)** Headers in custom Service Task after — workable but unnecessary; Output Mapping handles it. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Configure two Connectors — wrong; one Connector exposes both. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The HTTP Outbound Connector exposes the full HTTP response as a structured object accessible in Output Mapping FEEL:
  - **`response.body`**: parsed body (JSON object if `Content-Type: application/json`; otherwise string).
  - **`response.headers`**: object with header keys / values (typically lowercase keys).
  - **`response.statusCode`**: HTTP status code (200, 404, etc.).

  Output Mappings select parts and write to process variables. Example mappings:
  - `Target: productData, Source: =response.body.products` (extract products array).
  - `Target: rateLimitRemaining, Source: =response.headers["x-ratelimit-remaining"]` (header value).
  - `Target: requestId, Source: =response.headers["x-request-id"]`.

  Downstream activities use these variables — gateway conditions on rate-limit info, logging the request ID, etc.

  Different Connectors expose their results in their own schemas (Slack returns a message ID, Email returns delivery status, etc.); verify the response shape in the Connector docs.

- **Option b) — Wrong.** Headers accessible.

- **Option c) — Workaround.** Output Mapping handles.

- **Option d) — Wrong.** One Connector.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. response.body, response.headers, response.statusCode accessible via Output Mapping.
- **b) 1/10** — wrong; headers accessible.
- **c) 4/10** — workaround.
- **d) 1/10** — wrong; one Connector.

**Correct Answer:** Use Output Mapping with FEEL to extract `response.body`, `response.headers`, etc.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "body and headers", "expose both." Multi-part response.

**Въпросът → Solution Framing.** "How expose body and headers" — изпитва се knowledge на Connector response structure.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че response е structured object, че Output Mapping FEEL extracts parts, че one Connector exposes all. Това е знание за Connector response handling.

---

## Question 34: Configuring Connectors (Weighting: 6%)

**Scenario:** A process workflow has three sequential external calls: (1) call CRM to fetch customer; (2) call pricing API; (3) call fulfillment API. Each is a Service Task with its own Connector. The team wonders about composition / orchestration.

**How does Camunda 8 orchestrate sequential Connector calls?**

- **a)** **Place each Connector as its own Service Task in BPMN sequence**. Each Service Task has its own Output Mapping that writes results to process variables; the next Service Task's Input Mapping reads from those variables. BPMN naturally chains the calls; data flows via process variables; error handling per task via Error Boundary Events. Standard composition. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/) + [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **b)** Combine all three into one Service Task with composite logic — over-engineered; loses observability. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **c)** Use a Subprocess wrapping all three — workable but adds nesting; sequential tasks at main level work fine. Documentation: [Embedded Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/)

- **d)** Connectors can't be sequenced — incorrect; standard BPMN composition. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN's main value proposition: visual orchestration of work. Sequential Connector calls compose naturally as a sequence of Service Tasks:
  ```
  [Start] → [Fetch Customer (CRM)] → [Get Pricing] → [Submit Order (Fulfillment)] → [End]
  ```
  Each Service Task is its own Connector activation; results flow via process variables:
  - **Task 1 (CRM)**: Output Mapping writes `customer` variable.
  - **Task 2 (Pricing)**: Input Mapping reads `customer` (e.g., for pricing tier), calls Pricing API; Output Mapping writes `pricing` variable.
  - **Task 3 (Fulfillment)**: Input Mapping reads `customer + pricing`, submits order; Output Mapping writes `orderConfirmation`.

  **Error handling**: each task can have Error Boundary Events for HTTP errors / Connector failures. Compensation patterns if needed.

  **Observability**: each step visible in Operate as a distinct activity; latencies, errors, retries tracked separately.

  This is BPMN's primary use case — orchestrate distinct work units with clear data flow.

- **Option b) — Over-engineered.** Single task hides composition.

- **Option c) — Workable but unnecessary.** Sequential at main level cleaner.

- **Option d) — Wrong.** Standard composition.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Sequential Service Tasks with Connectors; data flow via variables; standard BPMN composition.
- **b) 3/10** — over-engineered; loses observability.
- **c) 5/10** — workable но unnecessary nesting.
- **d) 1/10** — wrong; standard.

**Correct Answer:** Each Connector as its own Service Task in BPMN sequence; data flows via process variables.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "three sequential external calls", "composition." Connector chaining.

**Въпросът → Solution Framing.** "How orchestrate sequential Connectors" — изпитва се knowledge на BPMN composition.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BPMN sequences Service Tasks naturally, че Output/Input Mappings carry data, че separate tasks improve observability. Това е знание за BPMN orchestration.

---

## Question 35: Configuring Connectors (Weighting: 6%)

**Scenario:** A team uses an HTTP Outbound Connector to **publish a message to a partner's queue**. Due to at-least-once delivery, the same Connector might publish the same message twice. The team needs **message-level idempotency** at the partner.

**How does the team ensure message-level idempotency despite at-least-once delivery?**

- **a)** Pass a **deterministic idempotency key** in the message — e.g., the BPMN element instance key, or a business-level message ID (orderId + event type). The partner's queue / consumer deduplicates based on this key. Without idempotency, duplicates cause double-processing. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/) + [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Camunda guarantees exactly-once delivery — wrong; at-least-once is the contract. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Set BPMN retries to 1 — partial; reduces retry count but doesn't eliminate duplicates from worker timeouts. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Trust the partner to handle duplicates — partial; some partners handle, some don't; idempotency key makes it explicit. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Distributed messaging is inherently at-least-once; the canonical recourse is **idempotency at the consumer**. Camunda's at-least-once delivery means a Connector may publish the same message twice (e.g., due to worker timeout causing re-activation). To prevent duplicate processing at the partner:

  - **Include a deterministic idempotency key** in every message — derived from Camunda's BPMN context (instance key, element instance key) or business data (orderId + event type). The key is the same for the same logical message; differs for distinct messages.
  - **Partner deduplicates**: the partner's message queue or consumer maintains a record of processed keys; duplicates are recognised and discarded.

  This pattern requires cooperation: the publisher includes the key; the consumer enforces deduplication. If the partner's queue (e.g., AWS SQS FIFO, Kafka with idempotent producers) supports built-in deduplication, leverage it.

  Practical implementation: in the Connector's request payload, include a header (`X-Idempotency-Key: <key>`) or body field (`messageId: <key>`). Pass a deterministic value derived from Camunda's context.

- **Option b) — Wrong.** At-least-once.

- **Option c) — Partial.** Reducing retries doesn't eliminate worker-timeout duplicates.

- **Option d) — Partial.** Idempotency key makes it explicit and reliable.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Pass deterministic idempotency key in message; partner deduplicates.
- **b) 1/10** — wrong; at-least-once.
- **c) 4/10** — partial; doesn't eliminate.
- **d) 5/10** — partial; explicit key better.

**Correct Answer:** Pass a deterministic idempotency key in the message; partner deduplicates.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "publish message twice", "message-level idempotency." Idempotent messaging.

**Въпросът → Solution Framing.** "Ensure idempotency" — изпитва се knowledge на at-least-once delivery + idempotency pattern.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че at-least-once е the contract, че idempotency key е the recourse, че partner cooperation required. Това е знание за idempotent messaging.

---

## Question 36: Configuring Connectors (Weighting: 6%)

**Scenario:** A team needs a **custom Inbound Connector** for a niche protocol — they're implementing it in Java using the Connector SDK. They want to know the main interface and lifecycle.

**What's the main Java interface for a custom Inbound Connector, and what lifecycle methods does it expose?**

- **a)** Implement **`InboundConnectorExecutable`** (or its modern variants — verify per SDK version). Lifecycle: **`activate(InboundConnectorContext)`** — called when the Connector subscribes (process deployed / instance ready to receive); start listening to your protocol / data source. **`deactivate()`** — called when the subscription is removed (process undeployed); stop listening, clean up resources. Inside `activate`, publish events to the context (`context.correlate(...)` or similar) when external triggers occur. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** No interface; just annotate a class — partial; annotations may exist but interface specifies the contract. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** Use `OutboundConnectorFunction` — wrong direction. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **d)** Custom Inbound requires extending Zeebe core — incorrect; SDK provides clean integration point. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Inbound Connector contract:
  - **Interface**: `InboundConnectorExecutable` (or specialised variants for specific patterns — e.g., webhook-typed). Verify the current SDK version's interface hierarchy.
  - **Lifecycle**:
    - `activate(InboundConnectorContext context)`: called by the Connector Runtime when the Connector should start listening. Inside this method:
      - Read configuration from `context` (URL, credentials, filters, etc., bound from Element Template properties).
      - Start your protocol listener (open a queue connection, register a callback, etc.).
      - When events arrive that should trigger BPMN, call `context.correlate(...)` (or similar) with the event payload — Camunda then publishes a message correlating to the BPMN's waiting subscription.
    - `deactivate()`: called when the Connector should stop listening (process undeployed). Clean up resources (close connections, unregister callbacks).
  - **Annotations**: `@InboundConnector` on the class typically declares metadata.

  Example use cases: custom message broker integration (proprietary protocol), email IMAP polling, FTP file-arrival triggers, etc.

  The SDK manages the activation lifecycle, threading, and BPMN correlation — your Java code focuses on the protocol-specific listening.

- **Option b) — Partial.** Annotations + interface together; interface gives the contract.

- **Option c) — Wrong direction.** Outbound vs Inbound interfaces.

- **Option d) — Wrong.** SDK abstracts.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. InboundConnectorExecutable; activate / deactivate lifecycle; context.correlate triggers BPMN.
- **b) 5/10** — partial; interface + annotations together.
- **c) 2/10** — wrong direction.
- **d) 1/10** — wrong; SDK abstracts.

**Correct Answer:** InboundConnectorExecutable interface; activate(context) starts listening, deactivate() stops; correlate via context to trigger BPMN.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "custom Inbound Connector", "Java", "interface and lifecycle." Inbound SDK contract.

**Въпросът → Solution Framing.** "Main interface and lifecycle" — изпитва се knowledge на InboundConnectorExecutable.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че InboundConnectorExecutable е the interface, че activate / deactivate are the lifecycle, че context.correlate triggers BPMN. Това е знание за Inbound Connector SDK.

---

# Section 6 — Extensions & Integrations (Questions 37-50)

> Weight 25% • Topics: FEEL median / floor-with-negatives / string contains / chained if-then-else, Spring Zeebe concurrencyLimit, Node SDK uncaught exception, zbctl with credentials, Camunda Console for SaaS, Connector SDK lifecycle, multi-subscription Inbound, RPA bot input/output, time-zone date arithmetic, range/interval types, gRPC vs REST auth.

---

## Question 37: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must compute the **median** of a list of numbers — for statistical analysis. `prices = [10, 15, 12, 18, 14]` → median = 14.

**Which FEEL built-in fits "compute median"?**

- **a)** `median(list)` — FEEL's median function. Returns the middle value (or average of two middles for even-length lists). `median([10, 15, 12, 18, 14])` returns 14 (after sorting: 10, 12, 14, 15, 18 → middle = 14). Companion: `mean(list)` for average; `stddev(list)` for standard deviation; `mode(list)` for most frequent. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** `mean(list)` is median — incorrect; different functions (median = middle, mean = average). Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **c)** No median in FEEL — incorrect; built-in exists. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Sort then take middle index manually — works but reinvents the wheel. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL provides statistical functions for lists:
  - `mean(list)`: arithmetic mean (average).
  - `median(list)`: middle value; for even-length lists, average of two middles.
  - `stddev(list)`: standard deviation (sample).
  - `mode(list)`: most frequent value(s) — returns list of modes.

  All handle lists of numbers. They handle edge cases (empty list, single element) gracefully or return null / error per spec.

  Use cases:
  - **mean**: average calculations.
  - **median**: robust central tendency (less sensitive to outliers than mean).
  - **stddev**: variability measurement.
  - **mode**: most common value.

- **Option b) — Wrong.** Mean = average; median = middle.

- **Option c) — Wrong.** Built-in exists.

- **Option d) — Reinvents.** Direct function exists.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. median(list) returns middle value.
- **b) 2/10** — wrong; mean ≠ median.
- **c) 1/10** — wrong; exists.
- **d) 4/10** — reinvents.

**Correct Answer:** median(list).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "compute median", "middle value." FEEL statistical function.

**Въпросът → Solution Framing.** "Built-in for median" — изпитва се FEEL statistics vocabulary.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че median е middle (≠ mean=average), че FEEL има mean / median / stddev / mode. Това е знание за FEEL statistical built-ins.

---

## Question 38: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression: `floor(-3.7)`. The team wonders if the result is `-3` (rounded toward zero) or `-4` (rounded toward negative infinity).

**What does `floor()` return for negative numbers?**

- **a)** `floor(-3.7)` returns **-4** — `floor` rounds **toward negative infinity** (always rounds down). For positive numbers: `floor(3.7)` = 3 (rounds toward 0). For negative: `floor(-3.7)` = -4 (rounds further from 0). This is mathematically standard floor behaviour. Companion: `ceiling(-3.7)` = -3 (rounds toward positive infinity). Documentation: [FEEL numeric](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/)

- **b)** -3 (rounds toward zero) — wrong; that's `round down`, not `floor`. Documentation: [FEEL numeric](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/)

- **c)** -3.7 (unchanged) — wrong; floor returns integer. Documentation: [FEEL numeric](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/)

- **d)** undefined for negatives — wrong; well-defined. Documentation: [FEEL numeric](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Standard mathematical definitions:
  - **`floor(x)`**: greatest integer ≤ x. Rounds toward negative infinity. `floor(3.7) = 3`, `floor(-3.7) = -4`.
  - **`ceiling(x)`**: smallest integer ≥ x. Rounds toward positive infinity. `ceiling(3.7) = 4`, `ceiling(-3.7) = -3`.
  - **`round down(x, scale)`**: rounds toward zero. `round down(-3.7, 0) = -3`, `round down(3.7, 0) = 3`.
  - **`round up(x, scale)`**: rounds away from zero.
  - **`round half even(x, scale)`**: banker's rounding (half goes to even).

  Important distinction for negative numbers:
  - `floor` and `round down` differ for negatives: `floor(-3.7) = -4` (further negative); `round down(-3.7, 0) = -3` (toward zero).
  - Similarly `ceiling` and `round up` differ.

  Pick the right function based on your semantic requirement.

- **Option b) — Wrong.** That's `round down`.

- **Option c) — Wrong.** Returns integer.

- **Option d) — Wrong.** Well-defined.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. floor rounds toward negative infinity; floor(-3.7) = -4.
- **b) 3/10** — wrong; that's round down semantic.
- **c) 1/10** — wrong; returns integer.
- **d) 1/10** — wrong; well-defined.

**Correct Answer:** floor(-3.7) = -4 (rounds toward negative infinity).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "floor with negative numbers", "rounded toward negative infinity vs zero." Rounding semantics.

**Въпросът → Solution Framing.** "What floor returns for negatives" — изпитва се knowledge на rounding direction.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че floor е toward -∞, че round down е toward 0, че for negatives те differ. Това е знание за rounding mode distinctions.

---

## Question 39: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must check if a string `description` **contains** the substring `"urgent"` (case-insensitive).

**Which FEEL approach checks substring containment?**

- **a)** `contains(string, substring)` — FEEL string built-in returning boolean. For case-insensitive: `=contains(lower case(description), "urgent")`. Documentation: [FEEL string](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **b)** `description.includes("urgent")` — JS reflex; not FEEL. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `indexOf` — partial; can compute position but `contains` is direct. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** `description matches ".*urgent.*"` — regex works but `contains` is simpler. Documentation: [FEEL string](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `contains(string, substring)` returns boolean true if `string` contains `substring`. Case-sensitive by default — for case-insensitive, lowercase both sides first:
  - `=contains(lower case(description), "urgent")` — case-insensitive containment check.

  Important: there are two `contains` functions in FEEL, distinguished by argument types:
  - `contains(string, substring)`: string contains substring.
  - `list contains(list, value)`: list contains element.

  Both return boolean; FEEL resolves the right one by argument types.

  Alternative for complex patterns: `matches(string, regex)` for regex-based matching.

- **Option b) — JS reflex.** Method-call syntax isn't FEEL.

- **Option c) — Partial.** `indexOf` for list / position; for substring containment, `contains` is direct.

- **Option d) — Works but heavier.** `matches` with `.*urgent.*` works; `contains` simpler.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. contains(string, substring) returns boolean.
- **b) 2/10** — JS reflex.
- **c) 5/10** — partial; contains е direct.
- **d) 6/10** — works но heavier.

**Correct Answer:** contains(string, substring); for case-insensitive use lower case() on both sides.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "string contains substring", "case-insensitive." Substring check.

**Въпросът → Solution Framing.** "Built-in for containment" — изпитва се FEEL string vocabulary.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че contains() returns boolean, че lower case() handles case-insensitivity, че matches() е regex alternative for complex patterns. Това е знание за FEEL string ops.

---

## Question 40: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression has multiple branching: based on `tier`, return different discounts. The team writes nested `if-then-else`. They wonder about readability.

**How does FEEL handle chained if-then-else with multiple branches?**

- **a)** **FEEL supports nested if-then-else**: `=if tier = "GOLD" then 0.20 else if tier = "SILVER" then 0.10 else if tier = "BRONZE" then 0.05 else 0`. Reads naturally; each `else` chains to the next condition. For more than 3-4 branches, consider a **DMN decision** for clarity (decision tables are designed for this kind of "if-elif-elif-else" logic). Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** FEEL doesn't support nesting — incorrect; nesting works. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Use `switch`/`case` instead — wrong; FEEL doesn't have switch syntax. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Each branch needs its own variable — wrong; if-then-else is an expression. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's `if-then-else` is an expression that returns a value. Nesting:
  ```
  =if cond1 then val1
  else if cond2 then val2
  else if cond3 then val3
  else default
  ```
  Reads like "if-elif-else" in code. Each `else` chains to the next condition.

  For many branches (5+ tiers, complex conditions, etc.), inline FEEL becomes hard to read. Consider:
  - **DMN decision table**: each row = one condition + output. Easier to add / remove / modify rows than nest more FEEL.
  - **Map lookup**: define a context with tier → discount mappings; FEEL `discountMap[tier]` looks up.

  Practical guideline: 2-3 branches inline; 4+ branches consider DMN or context lookup.

- **Option b) — Wrong.** Nesting works.

- **Option c) — Wrong.** No switch.

- **Option d) — Wrong.** if-then-else is expression.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Nested if-then-else; for many branches consider DMN.
- **b) 1/10** — wrong; nesting works.
- **c) 2/10** — no switch in FEEL.
- **d) 1/10** — wrong; expression.

**Correct Answer:** FEEL supports nested if-then-else; for many branches, consider DMN.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "chained if-then-else", "multiple branches." Conditional expression.

**Въпросът → Solution Framing.** "How handles chained" — изпитва се knowledge на FEEL if-then-else.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че nested if-then-else works, че FEEL няма switch, че DMN е alternative for many branches. Това е знание за FEEL conditional patterns.

---

## Question 41: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Java Spring Zeebe worker subscribes to `process-payment`. The team wants to **limit concurrency** — at most 5 payment jobs processing simultaneously across this worker — to respect a partner API's rate limit.

**Which Spring Zeebe configuration limits per-worker concurrency?**

- **a)** Set **`maxJobsActive = 5`** on the `@JobWorker` annotation (or in application.yaml). The worker activates at most 5 jobs concurrently; subsequent jobs queue at the broker until one completes. Combined with worker thread pool sizing, this caps concurrent processing. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** No way to limit — incorrect; `maxJobsActive` exists. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** Set BPMN-level retries = 5 — incorrect; retries is per-job failure count, not concurrency. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Run only 5 worker processes — heavyweight; per-worker concurrency tunable. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `maxJobsActive` is Spring Zeebe's per-worker concurrency cap. Behaviour:
  - Worker activates up to `maxJobsActive` jobs at a time.
  - When a job completes (success or failure), worker can activate the next.
  - Excess jobs remain queued at the broker (other workers / same worker on next free slot can pick them up).

  Combined considerations:
  - **Thread pool sizing**: ensure your worker's thread pool can handle `maxJobsActive` jobs concurrently. Otherwise threads bottleneck.
  - **External rate limits**: if the partner allows 5 concurrent requests, set `maxJobsActive = 5` to respect.
  - **Across worker fleet**: if you run multiple worker instances, the per-instance `maxJobsActive` × instances = total concurrency. Coordinate fleet sizing.

  For very strict rate limiting (e.g., 5 requests per second, not per concurrent), use a token bucket / rate limiter in worker code in addition to `maxJobsActive`.

- **Option b) — Wrong.** Configurable.

- **Option c) — Wrong concept.** retries е failure-retry count.

- **Option d) — Heavyweight.** Per-worker concurrency tunable.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. maxJobsActive limits per-worker concurrent jobs.
- **b) 1/10** — wrong; configurable.
- **c) 1/10** — wrong concept.
- **d) 4/10** — heavyweight alternative.

**Correct Answer:** Set maxJobsActive on the @JobWorker annotation to limit concurrent jobs.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "limit concurrency", "5 jobs simultaneously", "rate limit partner API." Per-worker concurrency cap.

**Въпросът → Solution Framing.** "Configuration limits concurrency" — изпитва се knowledge на worker concurrency knobs.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че maxJobsActive caps per-worker, че retries е different concept, че worker thread pool + fleet size combine. Това е знание за worker concurrency tuning.

---

## Question 42: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Node.js Job Worker's handler throws an **uncaught exception** (e.g., `JSON.parse` failure on malformed input). The team wonders what happens — does the job auto-fail, hang, or what?

**What happens when a Node SDK handler throws an uncaught exception?**

- **a)** **The SDK catches the exception and treats it as job failure** — typically calls `job.fail()` (decrements retries, may create incident if retries = 0). The error message and stack trace are usually captured in the job's failure details, visible in Operate. **Best practice**: catch exceptions explicitly to add context (errorCode for BPMN routing, custom error messages) rather than relying on uncaught fallback. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **b)** Job hangs indefinitely — incorrect; SDK catches and reports. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **c)** Worker process crashes — depends; uncaught exceptions in async contexts can crash Node processes if not handled at the SDK level, but well-designed SDKs catch handler exceptions. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **d)** Job succeeds with empty result — incorrect; exception means failure. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Well-designed Node SDKs (including `@camunda8/sdk`) wrap handler invocations in error boundaries:
  - **Uncaught exception in handler**: SDK catches, calls `job.fail()` with the error details (or equivalent).
  - **Effect**: Zeebe records the failure, decrements retries; if retries > 0, re-activates after backoff; if 0, creates an Incident with the error message visible in Operate.
  - **Default behaviour**: similar to explicit `job.fail()` but with less control over the error reporting (no errorCode for BPMN routing, generic error message).

  **Best practice**: always explicit handling:
  ```javascript
  async function handle(job) {
    try {
      const data = JSON.parse(job.variables.input);
      return { result: processed(data) };
    } catch (e) {
      if (e instanceof SyntaxError) {
        await job.error({ errorCode: 'INVALID_JSON', errorMessage: e.message });
      } else {
        throw e; // or job.fail() with more context
      }
    }
  }
  ```

  This gives BPMN-level error routing (errorCode → Error Boundary Event) instead of generic failure.

- **Option b) — Wrong.** SDK catches.

- **Option c) — Depends.** Quality SDK design catches; bad design could crash process. Verify SDK version.

- **Option d) — Wrong.** Failure, not success.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. SDK catches, calls job.fail(); best practice = explicit try/catch + job.error for BPMN routing.
- **b) 1/10** — wrong; SDK catches.
- **c) 4/10** — depends; quality SDK catches.
- **d) 1/10** — wrong; failure.

**Correct Answer:** SDK catches the exception and treats as job failure; best practice = explicit try/catch + job.error() for BPMN routing.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/node-js-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "uncaught exception in handler", "what happens." Error handling default.

**Въпросът → Solution Framing.** "What happens" — изпитва се knowledge на SDK error catching.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SDK catches handler exceptions, че default = job.fail() generic, че explicit try/catch + job.error gives BPMN routing. Това е знание за SDK error handling.

---

## Question 43: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team uses `zbctl` from a CI script. The cluster is SaaS — requires **OAuth2 client credentials**. The team wonders how to pass credentials to zbctl.

**How are zbctl credentials configured for SaaS?**

- **a)** Set **environment variables**: `ZEEBE_ADDRESS` (cluster gRPC address), `ZEEBE_CLIENT_ID`, `ZEEBE_CLIENT_SECRET`, `CAMUNDA_OAUTH_URL` (token endpoint). zbctl reads them and handles OAuth2 token exchange automatically. Alternative: pass via command-line flags (`--clientId ...`, `--clientSecret ...`). In CI, env vars from CI secrets are typical. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/) + [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **b)** zbctl doesn't support OAuth — incorrect; supports it. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/)

- **c)** Pass credentials in BPMN — wrong; that would leak. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/)

- **d)** No auth needed for zbctl — wrong; auth required for SaaS. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** zbctl supports SaaS OAuth2 client-credentials authentication via standard environment variables or command-line flags:
  - **Environment variables** (typical for CI):
    - `ZEEBE_ADDRESS`: e.g., `mycluster.zeebe.camunda.io:443`.
    - `ZEEBE_CLIENT_ID`: API client ID from Console.
    - `ZEEBE_CLIENT_SECRET`: API client secret.
    - `CAMUNDA_OAUTH_URL`: token endpoint (e.g., Auth0 URL).
  - **Command-line flags**: `--address`, `--clientId`, `--clientSecret`, `--audience`, etc.

  zbctl performs OAuth2 token exchange transparently and uses the Bearer token for gRPC calls.

  CI pattern:
  - Store credentials as CI secrets (GitHub Actions secrets, GitLab CI variables, etc.).
  - Inject as env vars in the CI step.
  - Run `zbctl deploy ...` — credentials used automatically.

  For Self-Managed: same env vars; the OAuth URL points to your IdP (Keycloak, etc.).

- **Option b) — Wrong.** Supports OAuth.

- **Option c) — Wrong.** Don't embed credentials in BPMN.

- **Option d) — Wrong.** Auth required.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Environment variables (or flags); zbctl handles OAuth2 automatically.
- **b) 1/10** — wrong; OAuth supported.
- **c) 1/10** — wrong; leakage.
- **d) 1/10** — wrong; auth required.

**Correct Answer:** Set environment variables (ZEEBE_ADDRESS, ZEEBE_CLIENT_ID, ZEEBE_CLIENT_SECRET, CAMUNDA_OAUTH_URL); zbctl handles OAuth2 transparently.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/cli-client/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "zbctl credentials for SaaS", "OAuth2 client credentials." CI authentication.

**Въпросът → Solution Framing.** "How configured" — изпитва се knowledge на zbctl OAuth2 auth.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че zbctl supports OAuth2, че env vars / flags са the configuration, че CI secrets manage credentials. Това е знание за zbctl SaaS auth.

---

## Question 44: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team uses Camunda 8 **SaaS**. They want to manage their cluster — create new clusters, manage API clients, view billing, configure regions. They wonder which tool / UI fits.

**Which Camunda 8 component manages SaaS cluster lifecycle?**

- **a)** **Camunda Console** — the web UI for SaaS account management. Features: create / configure / delete clusters; manage API clients (OAuth2 credentials); view usage / billing; configure regional preferences; manage organisation members and roles. Distinct from Operate / Tasklist / Web Modeler (which manage process-level operations). Documentation: [Camunda Console](https://docs.camunda.io/docs/components/console/)

- **b)** Operate — wrong scope; operational instance management. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Tasklist — wrong scope; User Task UI. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **d)** Web Modeler — wrong scope; modelling. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Camunda Console** is the SaaS account / cluster management interface:
  - **Cluster lifecycle**: create new clusters (specify region, generation, size); resize / scale; pause / resume; delete.
  - **API clients**: provision OAuth2 credentials (client ID + secret + audience URLs) for SDK / API access.
  - **Cluster secrets**: manage Connector secrets per cluster.
  - **Organisation management**: members, roles, permissions.
  - **Billing / usage**: track cluster resource consumption, plan limits, billing details.
  - **Region / multi-cluster setup**: configure regional preferences for multi-region deployments.

  Distinct from process-level tools (Operate, Tasklist, Web Modeler), which operate on the cluster's runtime / modelling concerns.

  For Self-Managed: equivalent functionality (cluster management, identity, etc.) handled by Camunda Identity + your own infrastructure tooling (Kubernetes, Helm, etc.).

- **Option b) — Wrong scope.** Operate operational.

- **Option c) — Wrong scope.** Tasklist user tasks.

- **Option d) — Wrong scope.** Web Modeler modelling.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Camunda Console manages SaaS clusters / API clients / billing.
- **b) 2/10** — wrong scope.
- **c) 1/10** — wrong scope.
- **d) 1/10** — wrong scope.

**Correct Answer:** Camunda Console manages SaaS cluster lifecycle, API clients, secrets, billing.

**Official Documentation Link:** https://docs.camunda.io/docs/components/console/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "SaaS cluster management", "API clients, billing, regions." SaaS admin UI.

**Въпросът → Solution Framing.** "Manages SaaS cluster lifecycle" — изпитва се knowledge на Console.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Console manages SaaS clusters + clients + billing, че Operate/Tasklist/Web Modeler са different scopes. Това е знание за Camunda 8 component boundaries.

---

## Question 45: Extensions & Integrations (Weighting: 25%)

**Scenario:** A custom Outbound Connector needs to perform **cleanup at process completion** — e.g., close an external session, release a license token. The team wonders if the Connector SDK supports lifecycle hooks.

**Does the Connector SDK support lifecycle hooks beyond the main execute method?**

- **a)** **Outbound Connectors are stateless per-invocation** — `execute()` is called per Service Task activation; no concept of "process completion hook" at the Connector level. For per-process cleanup: model an explicit Service Task at the end of the process that calls a "release" Connector. The cleanup is part of the BPMN flow, not a hidden lifecycle hook. **Inbound Connectors** have `activate` / `deactivate` lifecycle (called on subscription start / stop) — see custom Inbound docs. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** Yes — `onProcessComplete` hook — invented; not in the SDK. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** Use Compensation Boundary Events for cleanup — partial; compensation is a BPMN-level pattern for transactional rollback, not Connector lifecycle. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **d)** Inbound Connectors have lifecycle but Outbound don't — close to correct but slightly nuanced; Outbound is per-invocation, no "process completion" hook. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Outbound Connector lifecycle is **per-invocation**:
  - `execute(context)`: called once per Service Task activation; performs the work; returns / completes.
  - No "process started," "process completed," "before activation," "after activation" hooks at the Connector level.

  For per-process cleanup (e.g., releasing a license token, closing an external session):
  - **Model it as a Service Task** at the end of the process. The cleanup is explicit in the BPMN; readers see "Release Session" at the end.
  - Use **Compensation Events** if the cleanup is conditional on process success / failure paths.
  - Use **End Events with cleanup logic** in the form of preceding Service Tasks.

  Inbound Connectors are different: they have a subscription lifecycle (`activate` when process / instance / subscription becomes ready; `deactivate` when subscription ends).

- **Option b) — Invented.** No such hook.

- **Option c) — Partial.** Compensation pattern; not the lifecycle hook.

- **Option d) — Close.** Outbound is per-invocation, no process-level hooks.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Outbound stateless per-invocation; cleanup as explicit BPMN Service Task.
- **b) 2/10** — invented hook.
- **c) 5/10** — partial; Compensation е BPMN pattern.
- **d) 6/10** — close; partially correct distinction.

**Correct Answer:** Outbound Connectors are stateless per-invocation; model per-process cleanup as an explicit Service Task in BPMN.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "cleanup at process completion", "Connector lifecycle hooks." Lifecycle question.

**Въпросът → Solution Framing.** "Lifecycle hooks beyond execute" — изпитва се knowledge на Outbound stateless design.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Outbound = per-invocation stateless, че Inbound has activate/deactivate, че cleanup е explicit BPMN task. Това е знание за Connector lifecycle.

---

## Question 46: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team has **3 different processes** that all need to listen for the same external event (e.g., `OrderShipped` from a partner). They wonder if **one Inbound Webhook Connector can trigger multiple processes**.

**Can a single Inbound Connector trigger multiple processes?**

- **a)** **Each Inbound Connector instance is tied to a specific BPMN Start / Catch Event** — one Connector → one BPMN target. For multiple processes to react to the same external event: (1) deploy one Inbound Connector per process (each with its own webhook URL / subscription); the external system publishes to multiple URLs; OR (2) use a **fan-out pattern**: one Inbound Connector starts a "dispatch" process that fires Signal Throw events; multiple processes have Signal Start / Catch Events subscribed to the same Signal. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/) + [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

- **b)** One Connector triggers all processes that match its message — partial; depends on the BPMN target setup. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** No — multi-target not possible — partial; achievable via fan-out. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Use multiple Connectors for everything — overstates; fan-out via Signal is cleaner for one source → many consumers. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Inbound Connectors are tied to specific BPMN target events. For "one external event → multiple processes":

  **Pattern 1: Multiple Connectors (one per process)**
  - Each process has its own Inbound Webhook Connector with its own URL.
  - External system publishes to all URLs (multi-target webhook configuration on their end).
  - Each Connector triggers its process.
  - Trade-off: external system manages multiple URLs.

  **Pattern 2: Fan-out via Signal**
  - One Inbound Connector wired to a "dispatch" process (single URL).
  - Dispatch process throws a Signal (`OrderShippedReceived`) via Signal Throw Event.
  - 3 target processes have Signal Start Events (or Signal Catch in running instances) subscribed to the same Signal.
  - Single external endpoint; internal Signal broadcast fans out.
  - Trade-off: extra dispatch hop; cleaner external integration.

  **Pattern 3: Message correlation to multiple instances** (if processes are running, not starting)
  - One Inbound Connector publishes a Message.
  - Multiple Message Catch Events in different process instances correlate.

  Pick based on whether you're starting new processes (pattern 1 or 2) or correlating to running ones (pattern 3).

- **Option b) — Partial.** Depends on target setup.

- **Option c) — Partial.** Fan-out enables.

- **Option d) — Overstates.** Signal fan-out cleaner.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple Connectors or fan-out via Signal; pick by integration shape.
- **b) 5/10** — partial; depends на target.
- **c) 4/10** — partial; fan-out enables.
- **d) 4/10** — overstates.

**Correct Answer:** One Connector → one BPMN target; for multi-process triggering use multiple Connectors OR fan-out via Signal Throw.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "one external event", "trigger multiple processes." Multi-process trigger pattern.

**Въпросът → Solution Framing.** "One Connector trigger multiple" — изпитва се knowledge на Connector → BPMN relationship + fan-out patterns.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че one Connector = one target, че Signal broadcast enables fan-out, че Message correlation handles running instances. Това е знание за multi-process trigger patterns.

---

## Question 47: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team's RPA bot script needs **input parameters** from BPMN (e.g., the customer ID to look up in SAP) and produces **output values** (extracted data). The team wonders how data flows between BPMN and the RPA bot.

**How do BPMN process variables and RPA bot input/output values map?**

- **a)** **The RPA Service Task uses BPMN's standard Input / Output Mappings** to pass data to and from the bot. **Input Mapping**: BPMN process variables → bot script's input parameters (the bot reads from its input). **Output Mapping**: bot script's returned values → BPMN process variables (the bot returns data; BPMN captures via output mapping). Standard Camunda variable-flow semantics applied to RPA bots. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **b)** RPA bots can't receive input from BPMN — incorrect; integration designed for it. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **c)** Manually copy variables in / out — wrong workaround; native integration handles it. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **d)** Use Document Handling for all data — over-engineered for simple parameters. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** RPA Service Tasks (BPMN tasks of type `camunda::rpa` or equivalent) follow standard Service Task variable conventions:
  - **Input Mapping** on the RPA Service Task: declares which BPMN variables become input parameters for the bot. E.g., `Target: customerId, Source: =customer.id`. The bot receives `customerId` as a known parameter.
  - **Output Mapping** on the RPA Service Task: declares which bot outputs become BPMN variables. The bot's script returns values (defined in its DSL — Robot Framework keywords, etc.); the output mapping projects them to process scope.

  The RPA worker (executing the bot) reads the bot's input parameters from the activated job's variables; runs the bot script; on completion, returns the bot's output values to Zeebe, which applies the BPMN's Output Mapping.

  This makes RPA tasks composable with regular BPMN flow — variables in, variables out, like any Service Task.

- **Option b) — Wrong.** Integration designed for parameter passing.

- **Option c) — Wrong workaround.** Native integration.

- **Option d) — Over-engineered.** Document Handling for binaries; simple data via variables.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Standard Input / Output Mappings for RPA Service Task; variables in, variables out.
- **b) 1/10** — wrong; designed for it.
- **c) 4/10** — wrong workaround.
- **d) 3/10** — over-engineered.

**Correct Answer:** Use BPMN Input / Output Mappings on the RPA Service Task to pass variables to / from the bot.

**Official Documentation Link:** https://docs.camunda.io/docs/components/rpa/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "RPA bot input parameters", "output values back." Variable flow in RPA.

**Въпросът → Solution Framing.** "How variables map" — изпитва се knowledge на RPA integration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че RPA Service Tasks use standard Input/Output Mappings, че variables flow in/out как regular Service Task, че Document Handling е за binaries. Това е знание за RPA composition.

---

## Question 48: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression handles dates from multiple time zones — orders come from EU customers and Asia customers. The team needs to compare dates correctly across time zones.

**How does FEEL handle time zones in date and time values?**

- **a)** **`date and time` values carry time zone information** (e.g., `2026-05-14T15:30:00+02:00` for CET). Comparisons (`<`, `>`, `=`) normalise across time zones — both sides converted to UTC for comparison. Time-zone-aware constructors: `date and time("2026-05-14T15:30:00", "Europe/Sofia")` or with offset. Best practice: store and compare in UTC; convert for display. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** FEEL ignores time zones — incorrect; supported. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **c)** All dates treated as UTC — partial; depends on the value's actual time zone. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **d)** Time zone conversion requires Service Task — incorrect; FEEL handles natively. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's temporal types support time zones:
  - **`date and time`**: includes a date component, time component, and time zone (offset or named zone). E.g., `2026-05-14T15:30:00+02:00` (offset) or `@"2026-05-14T15:30:00@Europe/Sofia"` (named zone, syntax may vary).
  - **Comparisons**: when comparing two date-and-time values with different zones, FEEL normalises to UTC. `2026-05-14T09:00:00Z` and `2026-05-14T11:00:00+02:00` represent the same moment; FEEL treats them as equal.
  - **Conversions**: extract date or time components from a date-and-time; construct with specific zones.

  Best practice for multi-zone applications:
  - **Storage**: store in UTC (with timezone designator `Z`); avoid local-zone storage.
  - **Display**: convert to user's preferred zone for UI display.
  - **Comparison**: FEEL handles transparently when both values have zones.

  Edge cases: ambiguous local times during DST transitions; verify FEEL spec for your version.

- **Option b) — Wrong.** Supported.

- **Option c) — Partial.** Depends on value's actual zone.

- **Option d) — Wrong.** FEEL native.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL supports time zones; comparisons normalise to UTC.
- **b) 1/10** — wrong; supported.
- **c) 4/10** — partial.
- **d) 1/10** — wrong; native.

**Correct Answer:** FEEL's date and time values carry time zone info; comparisons normalise across zones.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "time zones", "EU and Asia customers." FEEL temporal across zones.

**Въпросът → Solution Framing.** "How FEEL handles time zones" — изпитва се FEEL temporal knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че date and time carries TZ, че comparisons normalise UTC, че storage best practice е UTC. Това е знание за FEEL time zones.

---

## Question 49: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression checks if a value `score = 75` falls in the range "70 to 90 inclusive." The team wonders if FEEL has range / interval types and operators.

**Does FEEL support range / interval types and operators?**

- **a)** **Yes** — FEEL has a **range / interval** type with notation: `[a..b]` (closed-closed), `(a..b)` (open-open), `[a..b)` (closed-open), `(a..b]` (open-closed). Operators: `in` tests membership (`=score in [70..90]` true), and the named range operators (`before`, `after`, `during`, `meets`, `overlaps`, etc.) work between ranges and values. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/) + [FEEL range](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-range/)

- **b)** Only DMN supports ranges — partial; FEEL (used in BPMN and DMN) supports them. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Use boolean compound (`score >= 70 and score <= 90`) — workable but `in [70..90]` is more concise. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** No range type — incorrect; supported. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's range / interval type is useful for compact boundary expressions:
  - **Notation**: `[a..b]` (closed: both endpoints included), `(a..b)` (open: both excluded), `[a..b)` and `(a..b]` (half-open). For date / time ranges, use date / time values as endpoints: `[date("2026-01-01")..date("2026-12-31")]`.
  - **Membership**: `value in range` is true if value falls in the range. `=75 in [70..90]` is true.
  - **Range operators**: `before`, `after`, `during`, `meets`, `metBy`, `overlaps`, `overlapsBefore`, `overlapsAfter`, `starts`, `startedBy`, `finishes`, `finishedBy`, `coincides` — for relations between ranges or between a value and a range.

  Use cases:
  - **Date range validation**: contract validity periods, age brackets.
  - **DMN unary tests**: rule cells can use ranges directly (e.g., a rule matches if input is in `[18..65]`).
  - **Numeric bracket conditions**: tax brackets, discount tiers.

- **Option b) — Partial.** FEEL is shared between BPMN and DMN; both support.

- **Option c) — Workable but verbose.** `in [a..b]` more concise.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Range type with [a..b] notation; in operator; range operators.
- **b) 4/10** — partial; FEEL works in both.
- **c) 5/10** — verbose alternative.
- **d) 1/10** — wrong; supported.

**Correct Answer:** Yes — FEEL has a range type with `[a..b]` notation and `in` / range operators.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-range/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "range or interval", "70 to 90 inclusive." FEEL range type.

**Въпросът → Solution Framing.** "Supports range types and operators" — изпитва се FEEL range knowledge.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL has range type, че `[a..b]` syntax, че `in` operator + range operators (before/after/during/etc.). Това е знание за FEEL range arithmetic.

---

## Question 50: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team's worker uses gRPC for Zeebe access; their backend service uses REST for the Orchestration API. They wonder about **authentication differences** between gRPC and REST.

**Are gRPC and REST authentication mechanisms different in Camunda 8?**

- **a)** **Both use OAuth2 client-credentials with Bearer tokens** — the auth model is the same. Differences are in transport / metadata:
  - **gRPC**: the Bearer token is sent in gRPC metadata (typically `authorization: Bearer <token>`).
  - **REST**: the Bearer token is sent in HTTP `Authorization: Bearer <token>` header.

  Same token works for both (within scope permissions). SDKs handle the protocol-specific delivery automatically. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/) + [APIs](https://docs.camunda.io/docs/apis-tools/)

- **b)** gRPC uses certificates, REST uses tokens — partial; gRPC over TLS uses certs for transport but auth is also token-based. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **c)** Completely different auth models — wrong; same OAuth2 model. Documentation: [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **d)** gRPC doesn't require auth — wrong; auth required. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 uses a unified OAuth2 client-credentials authentication model across both gRPC and REST APIs:
  - **Token acquisition**: same — POST to OAuth2 token endpoint with `client_id`, `client_secret`, `audience`; receive access token with TTL.
  - **gRPC**: include the token in gRPC call metadata: `authorization: Bearer <token>`. gRPC clients (Java, Go, Node SDKs) handle this transparently.
  - **REST**: include in HTTP header: `Authorization: Bearer <token>`. Standard REST client config.

  The **same access token** authorises both gRPC and REST calls (within the scopes granted to the API Client at provisioning). One client can speak both protocols.

  Transport layer:
  - **TLS**: both gRPC and REST use TLS in SaaS / production. mTLS optional in some configs.
  - **Encryption**: standard TLS encryption.

  Practical SDK handling: SDKs (Java, Spring Zeebe, @camunda8/sdk, Go SDK) typically handle the OAuth2 flow + token cache + protocol-specific delivery automatically. App code passes credentials + cluster address; SDK handles the rest.

- **Option b) — Partial.** gRPC over TLS uses transport certs; auth is also token-based.

- **Option c) — Wrong.** Same model.

- **Option d) — Wrong.** Auth required.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Both use OAuth2 client-credentials Bearer tokens; transport differs.
- **b) 4/10** — partial; transport vs auth distinction.
- **c) 1/10** — wrong; same model.
- **d) 1/10** — wrong; auth required.

**Correct Answer:** Both use OAuth2 client-credentials with Bearer tokens; transport-specific delivery (gRPC metadata vs HTTP header).

**Official Documentation Link:** https://docs.camunda.io/docs/guides/setup-client-connection-credentials/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "gRPC vs REST authentication", "different mechanisms." Auth model question.

**Въпросът → Solution Framing.** "Different auth mechanisms" — изпитва се knowledge на unified OAuth2.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че OAuth2 unified, че same token works for both, че transport delivers differently. Това е знание за Camunda 8 auth architecture.

---

# Section 7 — Managing the Development Process (Questions 51-59)

> Weight 15% • Topics: Web Modeler import from Desktop, Operate filter combinations, migration plan reusability, Tasklist variable filtering, BPMN versioning naming, Operate retention, Web Modeler API, cluster sizing, error handling strategies.

---

## Question 51: Managing the Development Process (Weighting: 15%)

**Scenario:** A team has Desktop Modeler files in a shared folder. They want to **import these into Web Modeler** for the rest of the team to access via the web UI.

**How are Desktop Modeler files imported into Web Modeler?**

- **a)** Use Web Modeler's **Upload action** (typically a "+" button or "Import" option in the project view) — select the local `.bpmn` / `.dmn` / `.form` file; Web Modeler imports it into the chosen project. Multiple files can be uploaded sequentially. Alternative: Git Sync — commit the files to a Git repo linked to a Web Modeler project; Web Modeler picks them up. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **b)** Desktop Modeler can't be migrated to Web Modeler — incorrect; import supported. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** Manual recreation in Web Modeler — wasteful; import works. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** Convert to a different format first — wrong; standard BPMN / DMN files import directly. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler accepts standard BPMN, DMN, Form, and other supported file types via upload. Workflows:
  - **UI upload**: open the target project in Web Modeler; use the "+" / "Upload" / "Import" action; select files from local disk; Web Modeler validates and imports. Each becomes a versioned resource in the project.
  - **Git Sync** (where configured): the Web Modeler project is linked to a Git repository; commits to the repo bring files into Web Modeler (and vice versa). Useful for ongoing sync.
  - **Web Modeler API**: programmatic import — POST file content to the project's resource endpoint. Useful for CI / automation.

  Files from Desktop Modeler are standard BPMN / DMN / Form formats; no conversion needed. Camunda's Modelers (Desktop and Web) share the same file formats.

- **Option b) — Wrong.** Import supported.

- **Option c) — Wasteful.** Import bypasses recreation.

- **Option d) — Wrong.** Direct import; standard formats.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Web Modeler upload action или Git Sync.
- **b) 1/10** — wrong; import supported.
- **c) 4/10** — wasteful.
- **d) 1/10** — wrong; direct.

**Correct Answer:** Use Web Modeler's upload action (or Git Sync) to import .bpmn / .dmn / .form files from Desktop.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Desktop Modeler files", "import to Web Modeler." Modeler migration.

**Въпросът → Solution Framing.** "How imported" — изпитва се knowledge на Web Modeler import options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler supports upload / Git Sync / API, че standard BPMN е cross-Modeler portable, че recreation е wasteful. Това е знание за Modeler interoperability.

---

## Question 52: Managing the Development Process (Weighting: 15%)

**Scenario:** Ops wants to find process instances matching **multiple criteria simultaneously**: state = ACTIVE AND processDefinitionId = "order-fulfillment" AND variable `priority = "HIGH"`. They use Operate's UI.

**Does Operate support combining multiple filter criteria in one query?**

- **a)** **Yes** — Operate's filter UI supports combining multiple criteria via implicit **AND** logic — all selected filters must match for an instance to appear. Standard filters: state, process definition + version, start / end date, parent instance, variables, etc. Combining them narrows the result set. The REST API supports the same combinations via filter object. Documentation: [Operate filters](https://docs.camunda.io/docs/components/operate/userguide/process-instance-summary/)

- **b)** Only one filter at a time — incorrect; combine supported. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Only via API, not UI — partial; UI supports too. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Combining filters is OR logic — wrong; AND. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's filter capabilities:
  - **UI filters**: a panel with multiple criteria (process definition, version, state, start / end date, business key, parent instance, variables, etc.). Selecting multiple narrows by AND.
  - **REST API filters**: pass a filter object with multiple fields; same AND logic.

  Example combined query for the scenario:
  - State: ACTIVE
  - Process Definition: order-fulfillment
  - Variable filter: name `priority`, value `"HIGH"`

  Result: only instances matching all three. The intersection.

  **OR semantics**: typically achieved by running multiple separate queries and combining results client-side; some Operate versions may add UI-level OR support — verify.

  **Performance**: complex combined filters are evaluated against Elasticsearch indexes; selectivity matters (most-selective filter applied first internally).

- **Option b) — Wrong.** Combine supported.

- **Option c) — Partial.** Both UI and API.

- **Option d) — Wrong.** AND.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple filters AND-combined; UI and API both support.
- **b) 1/10** — wrong; combine supported.
- **c) 4/10** — partial; UI works too.
- **d) 2/10** — wrong; AND semantics.

**Correct Answer:** Yes — Operate's filter UI combines multiple criteria via AND logic.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-summary/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "multiple criteria simultaneously", "state AND definition AND variable." Filter combination.

**Въпросът → Solution Framing.** "Combine criteria" — изпитва се knowledge на Operate filter UI.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate filters combine AND-wise, че UI and API both support, че OR requires multiple queries. Това е знание за Operate filter logic.

---

## Question 53: Managing the Development Process (Weighting: 15%)

**Scenario:** A team prepares a migration plan from `order-v3` to `order-v4`. They have 1000 instances spread across two clusters (production + production-failover). They wonder if the migration plan is **reusable** across clusters.

**Is a Process Instance Migration plan reusable across clusters?**

- **a)** **The plan structure (mappings from source to target flow nodes) is reusable** — defined as JSON / via Operate UI; can be applied to any cluster where both source and target process definitions are deployed. **Cluster-specific elements** (instance keys, process definition keys, which Operate to use) are cluster-bound. Best practice: define the migration plan as code / config (version-controlled); apply to each cluster's Operate / API individually. Documentation: [Process Instance Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **b)** Each cluster needs its own plan from scratch — partial; mapping logic is reusable. Documentation: [Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **c)** Plans are per-instance, not reusable — incorrect; plans are per-definition pair. Documentation: [Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

- **d)** Camunda auto-applies plans across clusters — incorrect; per-cluster application required. Documentation: [Migration](https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Migration plan structure (source flow node ID → target flow node ID mappings) is logical / definition-bound, not cluster-bound:
  - **Reusable**: the JSON / configuration describing the mappings can be saved (version-controlled) and applied to any cluster where the source and target process definitions are deployed.
  - **Per-cluster application**: actual migration runs against each cluster's Operate / API independently. The plan structure is the same; the specific instance keys to migrate differ per cluster.

  Practical workflow for multi-cluster migration:
  1. **Develop the plan**: in one cluster (e.g., staging), test the migration plan against representative instances.
  2. **Save the plan**: export the mappings as JSON / config; version-control it.
  3. **Apply to production**: use Operate UI / REST API in production to apply the same plan against production instances.
  4. **Apply to production-failover**: same plan, different cluster.

  This pattern works because process definitions deployed across clusters (assuming same source/target processes deployed everywhere) have the same flow node IDs; the migration plan references IDs, not cluster-specific keys.

- **Option b) — Partial.** Mapping reusable; per-cluster application.

- **Option c) — Wrong.** Plans per definition pair.

- **Option d) — Wrong.** Per-cluster application.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Plan structure reusable; apply per cluster.
- **b) 5/10** — partial; reuse possible.
- **c) 2/10** — wrong; per-definition.
- **d) 1/10** — wrong; per-cluster.

**Correct Answer:** Migration plan structure (mappings) is reusable across clusters; apply per-cluster.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/process-instance-migration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "migration plan reusable across clusters." Plan portability.

**Въпросът → Solution Framing.** "Reusable across clusters" — изпитва се knowledge на migration plan structure.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че plans са definition-bound not cluster-bound, че mappings reference flow node IDs, че per-cluster application required. Това е знание за migration plan portability.

---

## Question 54: Managing the Development Process (Weighting: 15%)

**Scenario:** A Tasklist user has 50 pending tasks. They want to **filter to tasks with `urgency = "HIGH"`** to focus on urgent work first.

**Does Tasklist support filtering by task variables?**

- **a)** **Yes** — Tasklist's task list view supports filtering by variables (name + value match), in addition to standard filters (assignee, candidate group, state, due date, etc.). For "urgency = HIGH": configure a variable filter; result narrowed. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/)

- **b)** Only by candidate group — incorrect; multiple filters. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **c)** Variables filterable only via API — partial; UI supports variable filtering. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **d)** No filtering supported — incorrect; standard feature. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Tasklist's task management UI supports filtering by:
  - **Assignment**: assigned to me, unassigned, assigned to other.
  - **Candidate group**: tasks I'm a candidate for.
  - **State**: open, in progress, completed (where supported).
  - **Due date / follow-up date**: overdue, due today, etc.
  - **Variables**: filter by process variable name + value match.

  Combining filters narrows the visible task list. Variables filtering is critical for business-context filtering — "show me only urgent claims," "show me only orders over $1000," etc.

  REST API mirrors the same filtering for programmatic access.

  Performance: similar to Operate, ES-backed; variable filters' speed depends on indexing + selectivity.

- **Option b) — Wrong.** Multiple filters.

- **Option c) — Partial.** UI supports too.

- **Option d) — Wrong.** Filtering supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Tasklist supports variable filtering + others.
- **b) 2/10** — wrong; multiple filters.
- **c) 5/10** — partial; UI works.
- **d) 1/10** — wrong; supported.

**Correct Answer:** Yes — Tasklist supports filtering by task variables (name + value match) and other criteria.

**Official Documentation Link:** https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "filter to tasks с urgency = HIGH", "Tasklist variable filtering." Task variable filter.

**Въпросът → Solution Framing.** "Filter by variables" — изпитва се Tasklist filter capability.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Tasklist filters by variables + other criteria, че combinations narrow result, че API mirrors UI. Това е знание за Tasklist filtering.

---

## Question 55: Managing the Development Process (Weighting: 15%)

**Scenario:** A team versions their BPMN files. They wonder about **naming conventions for process IDs across versions** — should the ID include the version (e.g., `order-fulfillment-v2`)?

**Best practice for process ID versioning naming?**

- **a)** **Generally NOT include version in the process ID**: Camunda 8 tracks process versions automatically (each deployment of the same processId creates a new version). Including version in the ID (`order-fulfillment-v2`) fragments the version tracking — Camunda sees `order-fulfillment-v1` and `order-fulfillment-v2` as **different processes**, not versions of the same one. Migration, instance listing, "latest version" semantics break. **Best practice**: keep processId stable across versions (`order-fulfillment`), let Camunda manage versions automatically. Use version in the ID only for **truly distinct processes** (different business logic, not just upgrades). Documentation: [Process Versioning](https://docs.camunda.io/docs/components/concepts/process-instance-versioning/) + [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** Always include version in ID — incorrect; fragments version tracking. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **c)** Use timestamp in ID — wrong; fragments. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **d)** Camunda doesn't track versions automatically — wrong; auto-versions per processId. Documentation: [Process Versioning](https://docs.camunda.io/docs/components/concepts/process-instance-versioning/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8's process versioning model:
  - **Same processId across deployments**: each new deployment of the BPMN with the same `<bpmn:process id="...">` increments the version automatically. Camunda tracks v1, v2, v3 of `order-fulfillment`.
  - **Different processId**: deploying with a different ID is a different process, not a new version. Migration features wouldn't work to move from v1 of `order-fulfillment` to v1 of `order-fulfillment-v2`.

  Implications for naming:
  - **Keep processId stable**: `order-fulfillment` across all versions. Camunda's version tracking handles the rest.
  - **In BPMN comments / documentation**: note the version, change history.
  - **For major rewrites with different intent**: use a different processId (e.g., `order-fulfillment-async`) only when truly a different process.

  Practical: version is metadata in Camunda's deployment system, not in the ID. Treat processId like a stable identifier; let Camunda handle versions.

- **Option b) — Wrong.** Fragments tracking.

- **Option c) — Wrong.** Same fragmentation issue.

- **Option d) — Wrong.** Auto-versions per processId.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Keep processId stable; Camunda auto-versions per processId.
- **b) 2/10** — wrong; fragments.
- **c) 2/10** — wrong; fragments.
- **d) 1/10** — wrong; auto-versions.

**Correct Answer:** Keep processId stable across versions; Camunda auto-tracks versions per processId. Include version in ID only for truly distinct processes.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/process-instance-versioning/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "processId versioning naming." Naming convention.

**Въпросът → Solution Framing.** "Best practice for ID versioning" — изпитва се Camunda versioning model + best practice.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda auto-versions per processId, че version в ID fragments tracking, че stable ID is best practice. Това е знание за versioning best practices.

---

## Question 56: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's compliance requirement: **retain process instance history for 7 years**. They're checking Operate's default retention.

**What's Operate's data retention default and how is it configured?**

- **a)** **Operate's default retention is typically configurable but defaults to a relatively short window** (e.g., 30 days or similar — verify current docs). For long retention (7 years for compliance), configure Operate's retention settings explicitly OR archive data to a long-term store (separate ES cluster, data warehouse, S3 archive). Documentation: [Operate](https://docs.camunda.io/docs/components/operate/) + [Self-Managed retention](https://docs.camunda.io/docs/self-managed/)

- **b)** Default is forever — incorrect; default has bounds. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** No retention; data deleted immediately — incorrect; retention exists. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Retention not configurable — incorrect; configurable. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**�ileged 🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's storage backend (Elasticsearch / OpenSearch) supports retention configuration. Default depends on Camunda 8 version / deployment type:
  - **SaaS**: defaults set by Camunda; verify in Console / docs.
  - **Self-Managed**: configurable at deployment time. Default may be short for resource reasons.

  For **long retention** (7 years for compliance):
  - **Increase Operate retention**: configure ES indices / retention policies for long lifespan. Plan for storage costs (ES grows with retained data).
  - **Archive to long-term store**: periodically export old data from Operate / ES to a cheap long-term store (S3, Glacier, data warehouse). Operate's UI remains fast for recent data; archive holds older records for compliance retrieval.
  - **Dedicated compliance pipeline**: stream Zeebe events to a compliance-grade store (immutable, tamper-proof) parallel to Operate. Operate for ops; compliance store for audit.

  Practical: 7 years is a lot of data; pure Operate retention may be expensive. Hybrid (Operate for short-term ops + archive for long-term compliance) often best.

- **Option b) — Wrong.** Defaults bounded.

- **Option c) — Wrong.** Retention exists.

- **Option d) — Wrong.** Configurable.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Default configurable; for 7 years configure or archive to long-term store.
- **b) 2/10** — wrong; bounded.
- **c) 1/10** — wrong; retention exists.
- **d) 1/10** — wrong; configurable.

**Correct Answer:** Operate retention is configurable; default may be short. For 7-year compliance, increase retention or archive to long-term store.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "retain history for 7 years", "Operate retention." Long-term retention.

**Въпросът → Solution Framing.** "Default + configuration" — изпитва се knowledge на retention configuration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че retention configurable, че default bounded, че long-term е via increased retention or archival pipeline. Това е знание за data retention strategies.

---

## Question 57: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's CI pipeline must **query Web Modeler** for all resources in a project — get the file list, last modification time, etc. They want to use Web Modeler's API.

**Does Web Modeler expose an API for resource queries?**

- **a)** **Yes — Web Modeler has a REST API** for project / resource management. Operations: list projects, list resources in a project, get resource content (BPMN XML, DMN XML, etc.), upload new resources, update existing, delete. Authentication via OAuth2 with appropriate scopes. Useful for CI / audit / automation. Documentation: [Web Modeler API](https://docs.camunda.io/docs/apis-tools/web-modeler-api/)

- **b)** No API; UI only — incorrect; API exists. Documentation: [Web Modeler API](https://docs.camunda.io/docs/apis-tools/web-modeler-api/)

- **c)** API only for writes, not queries — wrong; CRUD supported. Documentation: [Web Modeler API](https://docs.camunda.io/docs/apis-tools/web-modeler-api/)

- **d)** Use Operate API for Web Modeler queries — wrong; separate API. Documentation: [Web Modeler API](https://docs.camunda.io/docs/apis-tools/web-modeler-api/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler exposes a REST API for programmatic access:
  - **Projects**: list, create, update, delete projects.
  - **Resources**: list resources within a project; get content; upload / update / delete.
  - **Metadata**: modification timestamps, creators, versions.
  - **Deployment**: deploy resources to clusters via API.

  Authentication: OAuth2 with Web Modeler-specific scopes; provision API client in Console.

  Use cases:
  - **CI/CD**: programmatically deploy from CI; verify deployed versions.
  - **Audit**: query for all resources in projects; track changes over time.
  - **Migration**: bulk-import / export resources.
  - **Integration**: feed Web Modeler resources into custom dashboards / governance tools.

  REST endpoints typically under `/api/v1/...`; verify current docs for the schema and operations.

- **Option b) — Wrong.** API exists.

- **Option c) — Wrong.** CRUD support.

- **Option d) — Wrong.** Separate APIs.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Web Modeler REST API for projects / resources / deployment.
- **b) 1/10** — wrong; API exists.
- **c) 3/10** — wrong; CRUD.
- **d) 2/10** — wrong; separate APIs.

**Correct Answer:** Yes — Web Modeler has a REST API for projects, resources, deployment.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/web-modeler-api/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "query Web Modeler API", "resources, modification time." Web Modeler programmatic access.

**Въпросът → Solution Framing.** "Exposes API for queries" — изпитва се knowledge на Web Modeler API.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler има REST API, че projects + resources + deployment supported, че OAuth2 auth. Това е знание за Web Modeler API surface.

---

## Question 58: Managing the Development Process (Weighting: 15%)

**Scenario:** A team plans a Camunda 8 Self-Managed cluster for production. Estimated load: 100 process instances / second sustained, peak 500 / second. They wonder about **cluster sizing**.

**What considerations drive Camunda 8 cluster sizing?**

- **a)** **Multiple factors**: (1) **Zeebe brokers** — partitions, replication factor, broker count; for 500/s peak, multiple partitions across multiple broker nodes; (2) **Operate / ES** — instance volume × retention determines ES storage / cluster size; (3) **Tasklist / Web Modeler** — typically lighter; sized for concurrent users; (4) **Connector Runtime** — sized for concurrent Connector executions; (5) **Network / storage**: throughput requirements, latency requirements. Camunda provides reference sizing guides; for production, **start with reference + load-test** with representative workloads. Documentation: [Self-Managed concepts](https://docs.camunda.io/docs/self-managed/concepts/architecture/) + [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** Single broker sufficient for all loads — incorrect; HA requires multiple. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

- **c)** Cluster size irrelevant — wrong; sizing critical. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

- **d)** SaaS only, can't self-manage at scale — wrong; SM supports production scale. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Production cluster sizing for Camunda 8 SM is multi-faceted:

  **Zeebe brokers**:
  - **Partitions**: 100/s sustained might fit in 1-2 partitions; 500/s peak might need 4+. More partitions = more parallelism but also more replication overhead.
  - **Replication factor**: 3 typical for fault tolerance.
  - **Broker count**: at least `replicationFactor` brokers; for partition / leadership balance, more.

  **Operate / Elasticsearch**:
  - Indexes grow with instance volume × variable size × retention duration.
  - 500/s × seconds in retention period × variables-per-instance × ~bytes-per-variable = rough storage estimate.
  - ES cluster sizing: master nodes + data nodes + shards; depends on query latency requirements.

  **Tasklist / Web Modeler**:
  - Typically smaller; sized for concurrent users (modeling sessions, task assignees).

  **Connector Runtime**:
  - Concurrent Connector executions / external API call latency / number of subscriptions.

  **Reference + load-test**:
  - Camunda publishes reference sizings for various tiers (small / medium / large).
  - For accurate sizing, load-test with representative workloads and measure.
  - Provision with headroom for growth + traffic spikes.

  Other considerations: network bandwidth, disk I/O (Zeebe is write-heavy), CPU / memory per component.

- **Option b) — Wrong.** HA + scale need multiple brokers.

- **Option c) — Wrong.** Sizing critical.

- **Option d) — Wrong.** SM scales.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multiple factors (Zeebe / Operate / Tasklist / Connectors / network); reference + load-test.
- **b) 2/10** — wrong; HA + scale.
- **c) 1/10** — wrong; critical.
- **d) 1/10** — wrong; SM scales.

**Correct Answer:** Multi-factor sizing — Zeebe brokers + partitions, Operate / ES storage, Tasklist / Web Modeler users, Connector Runtime; reference + load-test.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/concepts/architecture/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "100/s sustained, 500/s peak", "cluster sizing." Production sizing.

**Въпросът → Solution Framing.** "Considerations drive sizing" — изпитва се knowledge на multi-component sizing.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че sizing covers Zeebe / Operate / Tasklist / Connectors, че partitions + replication + ES storage matter, че load-test confirms. Това е знание за production cluster sizing.

---

## Question 59: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's BPMN models have varying error-handling approaches: some use Error Boundary, some rely on retries, some have no handling. The team lead wants to establish **best-practice error-handling strategies**.

**What are recommended error-handling strategies in Camunda 8 BPMN?**

- **a)** **Layered approach**:
  1. **Retries for transient errors** — `zeebe:taskDefinition retries` with appropriate backoff; let Zeebe re-activate. Catches network blips, transient API errors.
  2. **Error Boundary Events for known business errors** — workers throw BPMN errors with codes; boundaries catch and route to business handling.
  3. **Incident + manual intervention for unknown errors** — when retries exhausted and no boundary catches, Incident appears in Operate; ops investigates.
  4. **Compensation for saga rollback** — when one step succeeds but later steps fail and need rollback.
  5. **Timeout for hung tasks** — Timer Boundary on long-running activities.

  Apply per task type's failure characteristics. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/) + [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** Always use catch-all Error Boundary — partial; catch-all is one tool, not the strategy. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** Never handle errors; let them propagate — wrong; without handling, every error becomes an Incident requiring manual fix. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **d)** Single strategy fits all — wrong; layered approach. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Robust error-handling strategy in BPMN combines multiple mechanisms by error category:

  **1. Transient errors (network blip, partner overload)**
  - **Mechanism**: BPMN retries (`retries = 3` or 5) + retryBackoff.
  - **Outcome**: Zeebe auto-retries; usually succeeds on retry; no human attention.

  **2. Known business errors (validation failure, invalid input, business rule violation)**
  - **Mechanism**: Worker throws BPMN error with errorCode (`INVALID_DATA`, `INSUFFICIENT_FUNDS`); Error Boundary Event catches by code; routes to business-appropriate handling.
  - **Outcome**: Explicit business flow for these cases (e.g., manual review, customer notification, escalation).

  **3. Unknown errors (bugs, unforeseen edge cases)**
  - **Mechanism**: Retries exhausted; no matching Error Boundary; Incident in Operate.
  - **Outcome**: Ops sees incident; investigates; fixes data / code / retries.

  **4. Saga rollback (one step succeeded, later failed, need to undo)**
  - **Mechanism**: Compensation Boundary Events on completable activities; Compensation Throw on failure path.
  - **Outcome**: Engine walks back, runs compensation handlers; clean rollback.

  **5. Timeout / SLA violations**
  - **Mechanism**: Timer Boundary on long-running activities; SLA-based routing.
  - **Outcome**: Cap latencies; escalate slow processes.

  **6. Process-level overall timeout**
  - **Mechanism**: Subprocess wrap + Interrupting Timer Boundary.
  - **Outcome**: Bound total process duration.

  Apply combinations based on each task / process's needs. Document the strategy in BPMN comments / company standards.

- **Option b) — Partial.** Catch-all is one mechanism; full strategy combines.

- **Option c) — Wrong.** Without handling, everything becomes incident.

- **Option d) — Wrong.** Multi-strategy.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Layered strategy: retries + Error Boundary + Incident + Compensation + Timer Boundary.
- **b) 5/10** — partial; one mechanism.
- **c) 1/10** — wrong; defeats reliability.
- **d) 1/10** — wrong; multi-strategy.

**Correct Answer:** Layered strategy — retries for transient errors, Error Boundary for known business errors, Incident for unknown, Compensation for rollback, Timer Boundary for timeouts.

**Official Documentation Link:** https://docs.camunda.io/docs/components/best-practices/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "error-handling strategies", "varying approaches." Strategy formulation.

**Въпросът → Solution Framing.** "Recommended strategies" — изпитва се knowledge на error-handling repertoire.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че layered strategy covers transient / business / unknown / rollback / timeout, че each mechanism fits different categories, че mixing tools е the design. Това е знание за error handling architecture.

---

# Section 8 — Dev Environment Setup (Question 60)

> Weight 1% • Topics: Camunda 8 Run Java version requirement.

---

## Question 60: Dev Environment Setup (Weighting: 1%)

**Scenario:** A developer downloads **Camunda 8 Run** to start local development. They have **Java 11** installed on their machine. They wonder if it will work with Camunda 8 Run.

**What Java version does Camunda 8 Run require?**

- **a)** Camunda 8 components (built on Spring Boot 3.x in recent versions) typically require **Java 17 or higher** (LTS). Verify the specific Camunda 8 Run version's requirement in its docs — older Camunda 8 versions may have run on Java 11, but current versions have moved to Java 17+. If only Java 11 is installed, install Java 17+ (Oracle JDK, OpenJDK, Adoptium / Temurin) and configure `JAVA_HOME` to point to it. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **b)** Java 11 works for all versions — incorrect; current versions require 17+. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **c)** Java 8 is fine — wrong; long deprecated for modern Spring Boot. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

- **d)** No Java needed; Camunda 8 Run uses Go — wrong; built on JVM. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 components (Zeebe, Operate, Tasklist, Identity, Connector Runtime) are built on Spring Boot. Spring Boot version determines minimum Java version:
  - **Spring Boot 3.x** (used by recent Camunda 8 versions): requires **Java 17 LTS or higher**.
  - **Spring Boot 2.x** (older Camunda 8 versions, no longer current): supported Java 11.

  For current Camunda 8 Run:
  - Install Java 17+ (OpenJDK / Adoptium / Oracle JDK / etc.).
  - Set `JAVA_HOME` environment variable to the install path (e.g., `JAVA_HOME=/usr/lib/jvm/temurin-17-jdk`).
  - The Camunda 8 Run launcher scripts (`start.sh` / `start.bat`) use `JAVA_HOME` to invoke the JVM.

  If only Java 11 is present, Camunda 8 Run will fail to start (or warn about incompatibility). Resolve by installing Java 17+ alongside or replacing Java 11.

  Verify the exact required version in the docs for your Camunda 8 Run download.

- **Option b) — Wrong.** Current requires 17+.

- **Option c) — Wrong.** Java 8 long deprecated.

- **Option d) — Wrong.** JVM-based.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Current Camunda 8 Run requires Java 17+ (Spring Boot 3.x); verify per version.
- **b) 3/10** — wrong; current versions need 17+.
- **c) 1/10** — wrong; long deprecated.
- **d) 1/10** — wrong; JVM-based.

**Correct Answer:** Java 17+ required for current Camunda 8 Run (Spring Boot 3.x); verify specific version's requirement.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Java 11 installed", "will it work for Camunda 8 Run." Java version requirement.

**Въпросът → Solution Framing.** "Java version required" — изпитва се knowledge на Camunda 8 Run prerequisites.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda built on Spring Boot, че Spring Boot 3.x requires Java 17+, че JAVA_HOME configures runtime. Това е знание за Camunda 8 Run environment.

---

# Закриваща секция — Set 10

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

**Препоръка за тренировка (Set 10):**
1. **Open-book проход** — чети всеки 🔍 Explanations + Three-Skills Decomposition; не таймирай.
2. **Closed-book timed run** — 75-минутен таймер; запиши отговорите си; цел: ≥ 39/60.
3. **Анализ на грешки:** за всяка грешка кои от 3-те skills ти липсваше (Diagnostic Comprehension / Solution Framing / Mechanism Knowledge).

**Чести грешки в Set 10 (грешен axis вместо грешен отговор):**
- **Q1 (Group element)** — пътане с Embedded Subprocess за visual grouping; Group е documentation-only.
- **Q3 (mismatched gateway pair)** — overconfidence that Inclusive join handles Parallel split; mismatched = undefined behaviour.
- **Q6 (Receive Task vs Message Catch)** — пътане с "completely different" — functionally similar, semantic distinction.
- **Q7 (loopCardinality vs inputCollection mutually exclusive)** — пътане с "both works together" — mutually exclusive.
- **Q10 (Service Task without type)** — пътане с "auto-uses default" — validation fails.
- **Q13 (shadowing of variables)** — пътане с "name collision deployment fails" — shadowing allowed.
- **Q15 (10 MB base64 vs Document Handling)** — пътане с "both equivalent" — major quantitative difference.
- **Q19 (multiple boundary first-to-trigger)** — пътане с "all fire simultaneously" — first wins for interrupting.
- **Q23 (FIRST row order critical)** — пътане с "row order doesn't matter" — critical for FIRST.
- **Q26 (PRIORITY needs value list)** — пътане с "numeric sort default" — needs value list ordering.
- **Q29 (atomic multi-resource deployment)** — пътане с "deploy independently" — atomic.
- **Q34 (sequential Service Tasks с Connectors)** — пътане с "single composite task" — standard BPMN composition.
- **Q41 (maxJobsActive concurrency)** — пътане с "BPMN retries = 5" — retries е different concept.
- **Q49 (FEEL range type)** — пътане с "only DMN ranges" — FEEL has range type used in both BPMN and DMN.
- **Q55 (processId stable across versions)** — пътане с "include version in ID" — fragments tracking.

**Свежи Set 10 сценарии (distinct от Sets 1-9):**

Modeling: Group element visual-only, multiple Error Boundary Events per activity, mismatched Parallel-Inclusive gateway pair, nested Embedded Subprocesses scope hierarchy, Cancel End Event + Cancel Boundary in Transaction Subprocess, Receive Task vs Intermediate Message Catch semantic distinction, loopCardinality vs inputCollection mutually exclusive, variables at instance creation immediately available, diverging gateway labels vs converging.

Configuring Processes: Service Task without task type validation fails, zeebe:ioMapping XML structure, candidateUsers with FEEL list expression, variable shadowing in nested scope, Sequential MI accumulation via outputCollection, base64 vs Document Handling quantitative comparison (33% inflation), IDP document reference flow as variable, Element Template no cross-property computed values, AI Agent conversation memory as process variable, multiple Boundary Events first-to-trigger wins, message deduplication via messageId, layered BPMN-level + worker-internal retries, Input Mapping with FEEL projection.

DMN: FIRST row-order critical specific-first design, DMN imports cross-file (caveat Zeebe coverage), FEEL `in` operator for membership / range / unary tests, PRIORITY requires value list, Input Data nodes for DRD documentation, layered OMG + Zeebe namespaces, atomic multi-resource deployment.

Forms: key (binding) vs expression (computed display) distinction, Tasklist limited theming + form-js embedded customisation, Form versioning per deployment with resolution semantics.

Connectors: response.body + response.headers + statusCode via Output Mapping, sequential Connector tasks standard BPMN composition, idempotency key for message deduplication, InboundConnectorExecutable interface + activate/deactivate lifecycle.

Extensions: FEEL median() / floor(-3.7) = -4 toward negative infinity / contains() substring + lower case() for case-insensitivity / nested if-then-else, maxJobsActive concurrency cap, Node SDK catches uncaught exceptions to job.fail(), zbctl OAuth2 via env vars, Camunda Console for SaaS cluster lifecycle, Outbound Connector stateless per-invocation (no process lifecycle hook), Inbound Connector → one BPMN target + fan-out via Signal, RPA bot input/output via standard Input/Output Mappings, FEEL date and time with time zones + UTC normalisation, FEEL range type [a..b] notation, gRPC and REST both OAuth2 Bearer (transport differs).

Managing Dev: Web Modeler upload from Desktop or Git Sync, Operate filter AND-combination, migration plan reusable across clusters, Tasklist variable filtering, BPMN processId stable across versions (Camunda auto-versions), Operate retention configurable + archive for 7-year compliance, Web Modeler REST API for resource queries, multi-component cluster sizing for production scale, layered error-handling strategy (retries + Error Boundary + Incident + Compensation + Timer).

Dev Env: Camunda 8 Run requires Java 17+ (Spring Boot 3.x).

**Успех на изпита!**

---

# 🎉 Завършена серия от 10 сета (Sets 1-10)

Sets 1-10 покриват **600 unique въпроса** разпределени по Blueprint v8.8.0. Това е comprehensive practice library за Camunda 8 C8-CP-DV certification.

**Препоръка за финална подготовка:**
1. **Преди изпита**: пройди през Sets 7-10 (свежи + квалитетни) closed-book.
2. **Идентифицирай области с грешки** — за всяка грешка определи кой от 3-те skills беше слаб (Diagnostic / Solution Framing / Mechanism Knowledge); фокусирай review там.
3. **Документация**: прегледай official Camunda 8.8 docs за често появяващи се теми — FEEL, MI, Connectors, Operate, Migration, Document Handling.
4. **Практика**: ако възможно, deploy локален Camunda 8 Run; experimenitirai с примерни процеси; тренирай Operate / Tasklist UI.

**Успех на C8-CP-DV изпита! 🎓**
