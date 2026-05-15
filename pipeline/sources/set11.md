# Camunda 8 C8-CP-DV Mock Exam — Set 11

> **60 въпроса • 75 минути • праг ≥ 65% (39/60) • Blueprint v8.8.0**
>
> Свежи сценарии — distinct от Set 1-10. Всеки въпрос: сценарий + 4 опции (a/b/c/d) + 🔍 Explanations + per-option score 1–10 + Correct Answer + Documentation Link + 🧠 Three-Skills Decomposition.

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

> Weight 15% • Topics: isExecutable=false Pools, error propagation across scopes, MI edge interactions, Standard Loop vs worker-side loops, subprocess types comparison, multi-trigger compensation, signal event flavours, MI ordering, Start Event Input Mapping.

---

## Question 1: Modeling (Weighting: 15%)

**Scenario:** A BPMN diagram has two Pools: one **isExecutable=true** (the company's internal process — Zeebe deploys it) and one **isExecutable=false** (a customer participant, descriptive only). Message Flows cross between them. The team wonders what Zeebe does with the descriptive Pool on deployment.

**What happens with a Pool marked `isExecutable=false` during Zeebe deployment?**

- **a)** **Zeebe ignores the descriptive Pool for execution** — only the executable Pool deploys as a process definition. The descriptive Pool exists in the BPMN XML for diagram readability (showing the external participant and the Message Flows crossing into / out of it) but doesn't become a runnable process in the cluster. From a deployment perspective: only one process definition is created (the executable one). The descriptive Pool informs readers but isn't orchestrated. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/) + [BPMN coverage](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **b)** Both pools deploy as separate process definitions — incorrect; only executable deploys. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

- **c)** Descriptive pool causes deployment validation error — incorrect; valid pattern. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** Zeebe converts descriptive to executable automatically — incorrect; deployment respects the attribute. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN's `isExecutable` attribute on `<bpmn:process>` controls deployability:
  - **`isExecutable="true"`**: this Pool's process is intended for engine execution. Zeebe deploys it as a process definition with version tracking.
  - **`isExecutable="false"`**: this Pool is descriptive / for documentation. Zeebe doesn't create a process definition from it.

  In multi-Pool collaborations:
  - The executable Pool represents your company's internal process — what Zeebe orchestrates.
  - Descriptive Pools represent external participants (customers, partners, regulators) whose processes you don't orchestrate but want to show for context.
  - Message Flows between Pools formalise the inter-participant exchanges visually; at runtime, Zeebe handles only the Message Throw / Catch events in the executable Pool (sends to external; waits for external messages via correlation).

  Common patterns:
  - Multi-Pool diagram for documentation; only one Pool executable per BPMN file.
  - Multiple BPMN files (each with its own executable Pool); cross-file collaboration through Message correlation.

- **Option b) — Wrong.** Only executable.

- **Option c) — Wrong.** Valid pattern.

- **Option d) — Wrong.** Respects attribute.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. isExecutable=false Pool ignored for execution; descriptive documentation.
- **b) 2/10** — wrong; only executable.
- **c) 1/10** — wrong; valid.
- **d) 1/10** — wrong; respects attribute.

**Correct Answer:** Zeebe ignores isExecutable=false Pools for execution; only the executable Pool deploys as a process definition.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/deployment/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "isExecutable=true / isExecutable=false", "descriptive Pool." Multi-Pool with mixed executability.

**Въпросът → Solution Framing.** "What happens with descriptive pool" — изпитва се knowledge на isExecutable semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че isExecutable controls deployability, че descriptive Pools documentation, че only executable deploys. Това е знание за BPMN deployment scope.

---

## Question 2: Modeling (Weighting: 15%)

**Scenario:** A process has an Embedded Subprocess "Validate Order." Inside, a Service Task throws a BPMN error `"INVALID_FORMAT"`. There's **no Error Boundary inside the subprocess** but there IS an Error Boundary on the **subprocess element itself** (in the parent scope). The team wonders how propagation works.

**What's the error propagation path from inside the subprocess?**

- **a)** The error **propagates upward through scope boundaries**: from the throwing Service Task → looking for matching Error Boundary on the task itself (none) → propagating to the subprocess scope → looking for Error Boundary on the subprocess (found, matching errorCode) → boundary fires; the entire subprocess is cancelled (interrupting boundary) and flow routes via the boundary's outgoing arrow. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **b)** Error is lost because no boundary inside — incorrect; propagates to parent scope. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** Error stops at the subprocess border without firing — wrong; propagation continues. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **d)** Errors only propagate one level — incorrect; full scope hierarchy. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN error propagation follows the scope hierarchy:
  1. **Throwing activity**: when a Service Task / Send Task / etc. throws an error (via worker `job.error()` call), the engine first checks for matching Error Boundary Events **on that specific activity**.
  2. **If no match**: error propagates to the **enclosing scope** (the subprocess containing the activity).
  3. **At subprocess scope**: engine checks for matching Error Boundary on the subprocess element itself, OR Error Start Event in an Event Subprocess at this scope level.
  4. **If no match**: continues propagating upward to grandparent scope.
  5. **At process root, unmatched**: produces an Incident (unhandled error).

  For the scenario: error → no inner boundary → up to subprocess scope → Error Boundary on subprocess (with matching errorCode) catches → interrupting boundary cancels the entire subprocess (and all activities still running inside) → flow routes via boundary's outgoing arrow.

  This hierarchy enables layered error handling: specific activities catch specific errors; subprocess-level boundaries catch "anything from inside this subprocess"; process-level boundaries catch "anything from the whole process."

- **Option b) — Wrong.** Propagation continues.

- **Option c) — Wrong.** Propagation reaches subprocess border and the boundary catches.

- **Option d) — Wrong.** Multi-level propagation.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Error propagates up scope hierarchy; subprocess Error Boundary catches; subprocess cancelled.
- **b) 2/10** — wrong; propagates.
- **c) 3/10** — wrong; doesn't stop arbitrarily.
- **d) 1/10** — wrong; multi-level.

**Correct Answer:** Error propagates up scope hierarchy; subprocess-level Error Boundary catches; interrupting cancels subprocess.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/error-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "error inside subprocess", "boundary on subprocess itself", "propagation." Cross-scope error propagation.

**Въпросът → Solution Framing.** "Propagation path" — изпитва се knowledge на BPMN propagation rules.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че errors propagate up scope hierarchy, че activity → subprocess → process root path, че first matching boundary catches. Това е знание за error propagation.

---

## Question 3: Modeling (Weighting: 15%)

**Scenario:** A Multi-Instance Subprocess has `inputCollection = []` (empty) AND `completionCondition = =numberOfCompletedInstances >= 5`. The team wonders what happens.

**What happens with empty inputCollection AND a completionCondition expecting >= 5 completions?**

- **a)** **MI completes immediately with zero inner instances** (per the empty-collection rule from Set 8 Q3) **— the completionCondition is irrelevant** because there are no inner instances to complete; the empty-collection rule short-circuits MI activation, completing it without checking completionCondition. The condition's "expect 5" is never evaluated. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** MI hangs forever waiting for 5 completions that can't happen — incorrect; empty short-circuits. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** MI raises Incident due to impossible condition — incorrect; empty is valid. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** MI starts placeholder instances to satisfy — invented. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN MI semantics for the empty-collection edge case: zero iterations, immediate completion. The completionCondition is only evaluated **after each inner instance completes** — with zero inner instances, it's never triggered.

  Execution flow:
  1. MI activates; engine evaluates `inputCollection` → empty.
  2. Engine determines: 0 instances to spawn.
  3. Engine completes the MI activity immediately (no instances, nothing to wait for).
  4. `outputCollection` (if configured) is set to `[]`.
  5. Flow continues via MI's outgoing arrow.

  The completionCondition's "expect 5" doesn't conflict — it's simply not checked when there are no inner instances. This avoids the deadlock that "wait for 5 of 0 to complete" would otherwise cause.

  Downstream activities should handle the empty-result case: FEEL checks like `=count(outputCollection) > 0` before processing the collection.

- **Option b) — Wrong.** Empty short-circuits.

- **Option c) — Wrong.** Empty is valid; no impossible condition flagged.

- **Option d) — Invented.** No placeholder spawning.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Empty collection short-circuits; completionCondition never evaluated.
- **b) 2/10** — wrong; empty short-circuits.
- **c) 2/10** — wrong; empty valid.
- **d) 1/10** — invented behaviour.

**Correct Answer:** MI completes immediately with zero instances; completionCondition is never evaluated for empty inputCollection.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "empty inputCollection AND completionCondition expecting 5." Edge case interaction.

**Въпросът → Solution Framing.** "What happens" — изпитва се knowledge на MI edge cases.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че empty inputCollection short-circuits, че completionCondition checks per-instance-complete, че empty + condition не conflict. Това е знание за MI edge semantics.

---

## Question 4: Modeling (Weighting: 15%)

**Scenario:** A polling pattern: keep calling an external API until response says "READY," then continue. The team is choosing between:
- **Standard Loop activity** (BPMN's "while-loop" marker on an activity).
- **Worker-side loop** in the Service Task's code (the worker internally retries until READY, returning only when ready).

**Which approach better fits "poll until ready" in Camunda 8?**

- **a)** **Worker-side loop** (or explicit BPMN loop via Gateway + back-edge sequence flow) is the more reliable / supported pattern in Camunda 8. **Standard Loop** marker exists in BPMN spec but **Zeebe's coverage is limited**; relying on it for production is risky. The recommended approaches: (1) worker code polls internally with a sensible max-iterations cap and returns when READY (or fails after max); (2) BPMN-level explicit loop: Service Task → Gateway "ready?" → if yes continue, if no back-edge to Timer + Service Task. The explicit loop is visible in the diagram; worker-internal is more compact. Documentation: [BPMN coverage](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/) + [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** Standard Loop activity always works — incorrect; coverage limited in Zeebe. Documentation: [BPMN coverage](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **c)** Camunda 8 doesn't allow polling — incorrect; multiple patterns possible. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **d)** Use Multi-Instance with completionCondition — works for known-count iterations; for "while polling," it's awkward (need to set high cardinality and break out). Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** "Poll until ready" patterns in Camunda 8:

  **Pattern 1: Worker-side loop** (compact)
  - Service Task's worker code internally polls external API with a delay between attempts; returns when READY (or fails after max iterations).
  - Pros: compact; one BPMN activity; worker controls the loop.
  - Cons: hides the polling from BPMN readers; worker holds the job activation throughout (long-running worker).

  **Pattern 2: BPMN-level explicit loop**
  ```
  [Service Task: Check Status] → [XOR Gateway: ready?]
                                  → yes → [continue downstream]
                                  → no → [Timer Intermediate Event: wait 30s] → [back to Check Status]
  ```
  - Pros: visible in BPMN; per-iteration observability (each "Check Status" execution in Operate); explicit timer between attempts.
  - Cons: more elements; back-edge can look messy.

  **Pattern 3: Standard Loop marker** (limited support)
  - BPMN spec: `<bpmn:standardLoopCharacteristics>` with a loop condition.
  - Zeebe's runtime support has historically been limited; verify BPMN coverage docs.

  For Camunda 8 production, Pattern 2 (explicit BPMN loop) is most robust + observable; Pattern 1 is compact but hides polling; Pattern 3 best avoided due to coverage uncertainty.

- **Option b) — Wrong.** Coverage limited.

- **Option c) — Wrong.** Multiple patterns.

- **Option d) — Awkward fit.** MI for known iterations.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Worker-side OR BPMN-level explicit loop; Standard Loop avoid in Camunda 8.
- **b) 3/10** — wrong; coverage limited.
- **c) 1/10** — wrong; multiple patterns.
- **d) 5/10** — awkward for polling.

**Correct Answer:** Worker-side loop (compact) OR BPMN-level explicit loop via Gateway + back-edge (observable); Standard Loop marker avoid due to limited Zeebe coverage.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "poll until ready", "Standard Loop vs worker-side." Polling pattern choice.

**Въпросът → Solution Framing.** "Which approach fits" — изпитва се knowledge на polling patterns.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Standard Loop limited в Zeebe, че worker-side + explicit BPMN loop работят, че explicit loop е observable. Това е знание за polling patterns.

---

## Question 5: Modeling (Weighting: 15%)

**Scenario:** A team is choosing between **Call Activity** (calls a separately-deployed process) and **Embedded Subprocess** (inline grouping) for a shared "Validate Customer Data" step. They consider all aspects: reuse, lifecycle, deployment, monitoring.

**Compare Call Activity and Embedded Subprocess across multiple dimensions.**

- **a)** **Call Activity**: ✓ reuse across multiple parents; ✓ independent lifecycle (deploy / version / migrate separately); ✓ separate visualisation in Operate; ✗ extra deployment overhead; ✗ separate variable scopes require explicit input/output mapping. **Embedded Subprocess**: ✓ shared parent scope (variables accessible directly); ✓ no extra deployment; ✓ inline visualisation; ✗ no reuse (copy-paste required); ✗ scope-local boundary events. Choose: **reuse + independent lifecycle → Call Activity**; **inline + scoped grouping → Embedded Subprocess**. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/) + [Embedded Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/embedded-subprocesses/)

- **b)** They're equivalent — incorrect; distinct properties. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **c)** Always prefer Call Activity — overstates; Embedded fits some cases better. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** Always prefer Embedded Subprocess — overstates; Call Activity better for reuse. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Comprehensive comparison:

  | Dimension | Call Activity | Embedded Subprocess |
  |---|---|---|
  | Reuse | ✓ across parents | ✗ inline only |
  | Lifecycle | independent deploy / version / migrate | tied to parent |
  | Variable scope | separate; bridge via I/O Mapping | shared with parent |
  | Visualisation | separate process; navigated to | inline expanded / collapsed in parent |
  | Deployment | extra deployment for child | one deployment |
  | Monitoring (Operate) | child instance separately tracked | inline activity in parent |
  | Ownership | can be different team / repo | typically same team as parent |
  | Versioning | independent versions | versioned with parent only |

  Decision matrix:
  - **Reused across parents** → Call Activity (DRY).
  - **One-parent grouping / scope** → Embedded Subprocess (simpler).
  - **Independent team ownership** → Call Activity (separation of concerns).
  - **Tight coupling to parent state** → Embedded Subprocess (shared scope).
  - **Boundary events on a section** → Embedded (boundaries on subprocess element).

  Many systems use both: Embedded for visual structuring within a process; Call Activity for cross-process reusable subprocesses.

- **Option b) — Wrong.** Distinct.

- **Option c) — Overstates.** Embedded fits some.

- **Option d) — Overstates.** Call Activity better for reuse.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multi-dimensional comparison; choose by reuse / scope / lifecycle.
- **b) 1/10** — wrong; distinct.
- **c) 4/10** — overstates.
- **d) 4/10** — overstates.

**Correct Answer:** Call Activity for reuse + independent lifecycle; Embedded Subprocess for inline grouping + shared scope.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Call Activity vs Embedded Subprocess", "all aspects." Subprocess types comparison.

**Въпросът → Solution Framing.** "Compare across dimensions" — изпитва се knowledge на subprocess trade-offs.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Call Activity supports reuse + lifecycle, че Embedded shares scope + simpler, че choice depends on use case. Това е знание за subprocess types.

---

## Question 6: Modeling (Weighting: 15%)

**Scenario:** A finance-process Service Task `transfer-funds` has **two Compensation Boundary Events** attached: one connected to handler `reverse-transfer` (full reversal), another to handler `partial-rollback` (partial). The team wonders if multiple Compensation Boundaries per activity are supported.

**Can an activity have multiple Compensation Boundary Events?**

- **a)** **BPMN spec generally allows one Compensation Boundary per activity** — it's the conceptual "undo for this activity." Modelling two compensation paths suggests two undo strategies for the same forward step, which is ambiguous: which handler runs when compensation fires? **Best practice**: one Compensation Boundary per activity, pointing to one handler. For conditional compensation logic, the handler itself can be a subprocess with internal branching. **Note**: Zeebe's specific implementation may enforce or warn on multiple compensation boundaries; verify the BPMN coverage docs. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **b)** Yes, multiple — engine picks one — wrong; ambiguous, not standard. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **c)** Yes, all run in parallel — wrong; not standard semantic. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **d)** Compensation isn't supported in Camunda 8 — wrong; supported. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN's compensation model: **one compensation handler per compensable activity**. The Compensation Boundary Event represents "this is the undo path for this activity." Modelling multiple boundaries with different handlers creates ambiguity about which should execute when compensation fires.

  Best practices for compensation:
  - **One Compensation Boundary per activity** → one Compensation Handler.
  - **Handler can be a subprocess**: if compensation logic is complex (conditional on state, multiple sub-steps), wrap in a subprocess inside the handler. Branching, conditional logic, etc., live inside the handler.
  - **Handler activity types**: typically Service Task (call API to reverse), but can be User Task (manual rollback), Subprocess (multi-step), etc.

  For the scenario's "full vs partial rollback" requirement:
  - **Recommended**: one Compensation Boundary → handler subprocess with internal Exclusive Gateway choosing "full" or "partial" based on a variable (e.g., `rollbackType = "FULL"` vs `"PARTIAL"`).
  - The variable is set elsewhere in the process (or based on the trigger context).

  Verify Zeebe's specific behaviour on multiple Compensation Boundaries — may warn / reject / accept-with-unspecified-behaviour depending on version.

- **Option b) — Wrong / ambiguous.** Not standard semantic.

- **Option c) — Wrong.** Parallel-compensation not standard.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. One Compensation Boundary per activity (best practice); conditional logic inside handler.
- **b) 3/10** — wrong; ambiguous.
- **c) 2/10** — wrong; not parallel.
- **d) 1/10** — wrong; supported.

**Correct Answer:** One Compensation Boundary per activity (best practice); conditional rollback logic via subprocess handler with internal gateway.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "two Compensation Boundary Events on same activity." Multi-boundary compensation question.

**Въпросът → Solution Framing.** "Multiple per activity" — изпитва се knowledge на compensation semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че one Boundary per activity е best practice, че conditional logic goes in handler subprocess, че multiple Boundaries е ambiguous. Това е знание за compensation modelling.

---

## Question 7: Modeling (Weighting: 15%)

**Scenario:** A team's BPMN throws a Signal `"SystemMaintenance"` to notify all running instances. They have two options: **Throw Signal End Event** (single-point throw, then process ends) vs **Throw Signal Intermediate Event** (throw and continue flow).

**What's the distinction between Throw Signal End Event and Throw Signal Intermediate Event?**

- **a)** **Throw Signal End Event**: fires the signal AND **ends the current flow path** (acts as an End Event). The process / scope reaching it terminates that token. Useful when signalling and ending coincide (e.g., a "system shutdown announcement" path concluding the process). **Throw Signal Intermediate Event**: fires the signal AND **continues flow** through the outgoing arrow. Useful when the signal is a side-effect during ongoing work (e.g., notify others of a milestone, then keep working). Both fire the same Signal to listeners cluster-wide; the difference is whether flow continues. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

- **b)** Same behaviour — incorrect; End ends flow, Intermediate continues. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

- **c)** End fires synchronously, Intermediate asynchronously — wrong; both fire similarly. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

- **d)** Only End is supported in C8 — wrong; both supported. Documentation: [Signal Events](https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** The Throw variant of any typed event has both **End** and **Intermediate** forms:
  - **End**: at the end of a flow path; fires the event AND terminates the token (path ends here).
  - **Intermediate**: in the middle of a flow path; fires the event AND continues via outgoing arrow.

  For Signal specifically:
  - **Throw Signal End**: fires Signal, ends path. Use when the signal is the path's final action.
  - **Throw Signal Intermediate**: fires Signal, continues. Use when the signal is part of ongoing work.

  Both broadcast the same Signal to cluster-wide listeners. The semantic difference is purely flow-control (end vs continue).

  Equivalent dichotomy for other typed events:
  - Throw Error End vs Intermediate.
  - Throw Message End vs Intermediate (Send Task is a common alternative for outbound messaging).
  - Throw Escalation End vs Intermediate.
  - Throw Compensation End vs Intermediate.

- **Option b) — Wrong.** Distinct flow behaviour.

- **Option c) — Wrong.** Both fire similarly; flow differs.

- **Option d) — Wrong.** Both supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. End fires + ends path; Intermediate fires + continues.
- **b) 2/10** — wrong; distinct.
- **c) 2/10** — wrong; sync/async not the distinction.
- **d) 1/10** — wrong; both supported.

**Correct Answer:** Throw Signal End fires and ends the path; Throw Signal Intermediate fires and continues flow.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/signal-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Throw Signal End vs Throw Signal Intermediate." Event flavour distinction.

**Въпросът → Solution Framing.** "Distinction" — изпитва се knowledge на throw event variants.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че End ends path, Intermediate continues, че both fire the same event. Това е знание за throw event flow control.

---

## Question 8: Modeling (Weighting: 15%)

**Scenario:** A Parallel Multi-Instance Subprocess has `inputCollection = [a, b, c, d, e]` and `outputCollection = results`. The team wonders if the **order** of elements in `results` matches the order in `inputCollection`.

**Is outputCollection ordering preserved in Parallel Multi-Instance?**

- **a)** **Yes — outputCollection preserves the position correspondence with inputCollection**. For Parallel MI: instances run concurrently, but the outputCollection is assembled with each instance's result at the position corresponding to its inputCollection index. So `inputCollection[1]` → `outputCollection[1]`, etc. The order matches inputCollection's order regardless of completion order. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** No — order depends on completion order — incorrect; position correspondence preserved. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Order is random — wrong. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Order preserved only in Sequential MI — partial; Parallel also preserves via position. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN MI semantics: `outputCollection` is **position-correspondent** with `inputCollection`:
  - For each `inputElement` at index `i` in `inputCollection`, the inner instance's `outputElement` lands at index `i` in `outputCollection`.
  - This holds regardless of completion order — even if Parallel MI's instance for input[4] finishes before instance for input[1], the outputCollection is still ordered `[result_of_input_1, ..., result_of_input_5]`.

  This makes downstream processing predictable: `outputCollection[i]` always corresponds to `inputCollection[i]`. You can correlate them by index.

  Example:
  ```
  inputCollection = [{id: "A"}, {id: "B"}, {id: "C"}]
  → after MI, outputCollection might be:
  [{id: "A", processed: true}, {id: "B", processed: false}, {id: "C", processed: true}]
  ```
  Position 1 corresponds to input "A," position 2 to "B," etc., regardless of which instance finished first.

  Practical: downstream FEEL can pair them: `=for i in 1..count(inputCollection) return {input: inputCollection[i], output: outputCollection[i]}`.

- **Option b) — Wrong.** Position correspondence.

- **Option c) — Wrong.** Deterministic order.

- **Option d) — Partial.** Parallel also preserves via position.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. outputCollection position-correspondent with inputCollection regardless of completion order.
- **b) 3/10** — wrong; preserved.
- **c) 1/10** — wrong; deterministic.
- **d) 5/10** — partial.

**Correct Answer:** Yes — outputCollection preserves position correspondence with inputCollection (Parallel and Sequential MI both).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "outputCollection ordering", "matches inputCollection." MI output semantics.

**Въпросът → Solution Framing.** "Order preserved" — изпитва се knowledge на MI output correspondence.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че outputCollection е position-correspondent, че Parallel preserves regardless of completion order, че pairs by index. Това е знание за MI output ordering.

---

## Question 9: Modeling (Weighting: 15%)

**Scenario:** A team wants to **set process variables at Start Event** via Input Mapping (e.g., compute initial values, transform incoming data) — without modifying the calling API to send them. They wonder if Start Events support Input Mapping.

**Do BPMN Start Events support Input Mapping (zeebe:ioMapping)?**

- **a)** **Start Events can have Input Mapping** — `zeebe:ioMapping` with `zeebe:input` elements — used to transform incoming variables, set defaults, compute initial values. E.g., normalize a passed-in `customerName` to `customer.fullName`. Output Mapping isn't applicable at Start (no work to produce output). Useful for entry-point transformations without changing the calling API. Documentation: [I/O Mappings](https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings)

- **b)** Only None Start; not other Start variants — incorrect; most Start variants support it. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Start Events can't have I/O Mapping — incorrect; supported. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Use a Service Task immediately after Start — workable but Start-level mapping is cleaner. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN Start Events (None, Message, Timer, Signal) can carry `zeebe:ioMapping` for entry-point variable transformations. Pattern:
  - **Input Mapping at Start Event**: transforms / defaults the incoming variables before process scope is finalised.
  - **Common uses**:
    - Normalize naming: incoming `cust_name` → process variable `customer.fullName`.
    - Set defaults: if `priority` not provided, set to `"NORMAL"`.
    - Compute derived: `=createdAt: now()`.
    - Restructure: incoming flat → nested process variables.

  Output Mapping doesn't apply at Start (no work / result to propagate). Input Mapping is the supported direction.

  Alternative — pre-Start transformations:
  - **Calling API does the mapping**: caller sends the variables in the right shape. Cleaner contract but couples the caller.
  - **First Service Task after Start**: normalises. Adds a task; more visible in Operate.

  Start-level Input Mapping is concise when the transformation is simple and entry-specific.

- **Option b) — Wrong.** Most Start variants support.

- **Option c) — Wrong.** Supported.

- **Option d) — Workable but heavier.** Start-level cleaner.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Start Events support Input Mapping for entry-point transformations.
- **b) 3/10** — wrong; multiple Start variants.
- **c) 1/10** — wrong; supported.
- **d) 5/10** — workable но heavier.

**Correct Answer:** Yes — Start Events support `zeebe:ioMapping` with Input Mapping for entry-point variable transformations.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "set process variables at Start Event", "Input Mapping." Start-level transformation.

**Въпросът → Solution Framing.** "Start Events support Input Mapping" — изпитва се knowledge на I/O Mapping scope.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Start supports Input Mapping (not Output), че entry-point transformations clean, че alternatives include caller mapping or first Service Task. Това е знание за entry-point patterns.

---

# Section 2 — Configuring Processes (Questions 10-22)

> Weight 22% • Topics: zeebe:taskHeader FEEL, Output Mapping null handling, formKey vs formId, MI completionCondition error break, Document Handling presigned URL alternatives, IDP overall confidence, Element Template publishing workflow, AI Agent tool selection, FEEL duration timer, FEEL function in correlation key, Timer Cycle vs single-shot, C7 listener migration patterns, JSONPath alternative to FEEL.

---

## Question 10: Configuring Processes (Weighting: 22%)

**Scenario:** A team wants Task Headers values evaluated as FEEL at deployment / activation time — they want `priority` to come from a process variable. They write `<zeebe:taskHeader key="priority" value="=customer.tier"/>` in the XML.

**Are Task Header values evaluated as FEEL expressions?**

- **a)** **No — Task Header values are static literal strings**, NOT FEEL-evaluated. The value `"=customer.tier"` would be sent to the worker as the literal string `"=customer.tier"`, not as the result of FEEL evaluation. For per-instance dynamic values, use **Input Mapping** instead: `<zeebe:input source="=customer.tier" target="priority"/>`. The worker reads `priority` as a local variable with the FEEL-evaluated result. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Yes — FEEL evaluated at activation — incorrect; static literals. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Depends on Zeebe version — partial; verify, but the canonical answer is static. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Headers don't accept any expression syntax — partial; literal strings, no FEEL. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Task Headers are **static literal key/value strings** baked into the BPMN at design time. Per-task metadata, identical across all instances of that modelled task element. The worker reads them via the activated job's `getCustomHeaders()` map; values are exactly what the BPMN XML contains.

  Writing `value="=customer.tier"` results in the worker receiving:
  ```json
  {"priority": "=customer.tier"}
  ```
  — the literal string starting with `=`. The worker doesn't get the FEEL-evaluated tier value.

  For per-instance dynamic values, use **Input Mapping** with FEEL:
  ```xml
  <zeebe:ioMapping>
    <zeebe:input source="=customer.tier" target="priority"/>
  </zeebe:ioMapping>
  ```
  The worker reads `priority` from the job's **variables** (not headers); FEEL evaluates `customer.tier` at activation; the result lands as `priority` value.

  Two API surfaces:
  - **Headers** (`getCustomHeaders()`): static metadata.
  - **Variables** (`getVariablesAsMap()`): dynamic data, including FEEL-evaluated Input Mappings.

  Match the use case: static configuration → Headers; dynamic data → Input Mapping.

- **Option b) — Wrong.** Static.

- **Option c) — Verify, but canonical static.** Verify per Zeebe version; primary answer is static.

- **Option d) — Partial.** No FEEL specifically; literal strings.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Headers static literal; use Input Mapping for FEEL evaluation.
- **b) 2/10** — wrong; static.
- **c) 5/10** — partial; canonical answer static.
- **d) 6/10** — partial; literal strings.

**Correct Answer:** Task Headers are static literal strings, not FEEL-evaluated. Use Input Mapping for FEEL-evaluated dynamic values.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Header value with FEEL expression `=customer.tier`." FEEL in Header trap.

**Въпросът → Solution Framing.** "Headers evaluated as FEEL" — изпитва се knowledge на Header static nature.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Headers static, че Input Mapping handles dynamic FEEL, че worker reads from different API surfaces. Това е знание за Headers vs Input Mapping distinction.

---

## Question 11: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task's worker returns `null` for a field that Output Mapping expects to project: `Target: customerEmail, Source: =result.email`. The worker returned `{email: null}`. The team wonders what happens.

**What does Output Mapping do when the source FEEL evaluates to null?**

- **a)** **The target variable is set to null** in process scope. FEEL doesn't error on null source; the projection produces `customerEmail = null`. Downstream activities reading `customerEmail` see null; FEEL conditions like `=customerEmail != null` can guard against it. **No automatic skipping** of the mapping or substitution with defaults — null is a valid value in FEEL. For default behaviour, use `=if result.email != null then result.email else "no-email@example.com"`. Documentation: [I/O Mappings](https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings)

- **b)** Mapping fails and creates Incident — incorrect; null is valid. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Variable not set (skipped) — incorrect; null is set, distinct from absent. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Defaults to empty string — wrong; no auto-default. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL treats null as a valid value (distinct from "absent" or "error"). Output Mapping with a FEEL source returning null sets the target variable to null in the target scope. Downstream:
  - **Reading** the variable gets null.
  - **FEEL expressions**: handle null per their semantic (`= null` returns null; `+ null` returns null; etc.). FEEL is "null-tolerant" — many operations return null when an input is null, rather than throwing.
  - **Gateway conditions**: `=customerEmail != null` is true if value is non-null. Useful for null guards.

  Variations:
  - **Provide a default**: `=if result.email != null then result.email else "default@example.com"`.
  - **Coalesce-style**: FEEL doesn't have a built-in `coalesce()`, but the if-then-else above achieves it.
  - **Conditional mapping**: some BPMN engines support conditional mappings (skip the mapping if condition false); verify Camunda 8 support.

  Best practice: explicitly handle null in mappings rather than rely on downstream behaviour, especially for variables that downstream gateways / activities depend on.

- **Option b) — Wrong.** Null is valid.

- **Option c) — Wrong.** Null set; not skipped.

- **Option d) — Wrong.** No auto-default.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Null source → null target; FEEL null-tolerant; use if-then-else for defaults.
- **b) 2/10** — wrong; null valid.
- **c) 3/10** — wrong; null set.
- **d) 1/10** — wrong; no auto-default.

**Correct Answer:** Target variable is set to null; FEEL is null-tolerant; provide defaults via if-then-else in source expression.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "worker returns null", "Output Mapping". Null handling in mappings.

**Въпросът → Solution Framing.** "What Output Mapping does с null" — изпитва се knowledge на FEEL null semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL null-tolerant, че null is set (not skipped), че if-then-else provides defaults. Това е знание за null handling.

---

## Question 12: Configuring Processes (Weighting: 22%)

**Scenario:** A User Task has BOTH `formKey` AND `formId` configured (rare but possible in some tooling). The team wonders which takes precedence.

**What happens when a User Task has both formKey and formId configured?**

- **a)** **Generally, only one should be configured** — they represent different binding mechanisms:
  - `formId`: references a Camunda Form deployed in the cluster (preferred for native Camunda Forms).
  - `formKey`: legacy / alternative reference; sometimes for external forms.
  
  Behaviour with both: depends on Zeebe / Tasklist version's resolution rules — typically one takes precedence (verify docs). **Best practice**: configure only one to avoid ambiguity. Documentation: [User Tasks Forms](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** Both render simultaneously — incorrect; only one form per task. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **c)** formKey always wins — partial; depends on version. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **d)** Deployment validation fails — partial; some validators warn. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** `formKey` and `formId` are alternate forms-binding mechanisms:
  - **`formId`** (modern Camunda Forms reference): identifies a Camunda Form by its ID; Tasklist resolves to the deployed Form definition and renders.
  - **`formKey`** (legacy / external reference): older / alternative mechanism; sometimes points to an external form URL or a legacy form key.

  Both fields existing simultaneously creates ambiguity:
  - Which one Tasklist should resolve and render?
  - Behaviour varies: some Zeebe / Tasklist versions prefer `formId`; some prefer `formKey`; some warn; some error.

  **Best practice**: configure only one. Modern Camunda 8 with native Camunda Forms uses `formId`. For external / legacy forms, use `formKey`. The modeller's UI typically shows only one option at a time per the selected form type.

  If you see both in legacy BPMN files (e.g., from old migrations), clean up to use only the appropriate one.

- **Option b) — Wrong.** Not simultaneously rendered.

- **Option c) — Partial.** Version-dependent.

- **Option d) — Partial.** Some validators warn.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Configure only one; behaviour with both varies by version.
- **b) 1/10** — wrong; not simultaneous.
- **c) 4/10** — partial; version-dependent.
- **d) 5/10** — partial; some warn.

**Correct Answer:** Configure only one (formId for modern Camunda Forms, formKey for legacy / external); behaviour with both varies.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "formKey AND formId both configured." Ambiguous form binding.

**Въпросът → Solution Framing.** "Which takes precedence" — изпитва се knowledge на form binding alternatives.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че formId е modern Camunda Forms, че formKey е legacy / external, че configure-only-one best practice. Това е знание за form binding mechanisms.

---

## Question 13: Configuring Processes (Weighting: 22%)

**Scenario:** A Multi-Instance Subprocess processes orders. Each iteration may **throw an error** (e.g., partner API failure). The team wants: if ANY iteration errors, the **whole MI breaks early** (cancel remaining iterations) and routes to an error handler.

**How does MI handle "break on first error"?**

- **a)** **Place an Interrupting Error Boundary Event on the MI subprocess element**. When any inner instance throws an error and it propagates up to the subprocess border, the boundary fires (interrupting), cancelling all remaining inner instances and the MI as a whole. Flow routes via the boundary's outgoing arrow to the error handler. Combine with **per-inner-instance error handling** if some errors should be tolerated (boundary on inner activity to catch + recover; otherwise propagate up to MI boundary). Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/) + [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **b)** completionCondition checks for error — partial; conditions can detect, but Error Boundary is the direct mechanism. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** MI auto-cancels on error — incorrect; without boundary, errors propagate without auto-cancellation. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Can't break MI early on error — incorrect; Error Boundary handles. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** "Break MI on first error" pattern:
  - **Inner instance throws error**: worker calls `job.error({errorCode: "FAILED"})` or similar.
  - **Error propagates up scope hierarchy**: from inner activity → MI subprocess border.
  - **Interrupting Error Boundary on MI subprocess**: catches the error. Cancels the MI activity (all remaining inner instances cancelled).
  - **Flow routes via boundary's outgoing arrow**: to the error handler.

  Hybrid pattern (some errors tolerated, others break):
  - **Per-inner-activity Error Boundary**: catch specific transient errors; route to recovery / retry path within the inner instance. The inner instance completes successfully despite the error (or fails non-fatally without propagating).
  - **MI-level Error Boundary**: catches errors NOT caught by inner activity (propagated up). Breaks the MI.

  This layered approach: handle expected errors per-instance; break on unhandled / fatal errors.

  Note: for "break on first error," consider also setting `completionCondition` for early exit on other criteria (e.g., enough successes). Multiple mechanisms compose for sophisticated MI control.

- **Option b) — Partial.** completionCondition can detect but Error Boundary is direct.

- **Option c) — Wrong.** Without boundary, error propagates to grandparent.

- **Option d) — Wrong.** Boundary handles.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Interrupting Error Boundary on MI subprocess element; cancels all on first error.
- **b) 5/10** — partial; completionCondition detects but Boundary direct.
- **c) 2/10** — wrong; no auto-cancel.
- **d) 1/10** — wrong; achievable.

**Correct Answer:** Place an Interrupting Error Boundary Event on the MI subprocess element; catches errors propagating up; cancels remaining iterations.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "break early on error", "cancel remaining iterations." MI error break pattern.

**Въпросът → Solution Framing.** "How break on first error" — изпитва се knowledge на Error Boundary on MI.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Error Boundary on MI element catches inner errors, че interrupting cancels all, че layered handling combines per-activity + MI-level. Това е знание за MI error patterns.

---

## Question 14: Configuring Processes (Weighting: 22%)

**Scenario:** A document workflow uses Document Handling. The team wants to **generate a pre-signed URL via the Camunda Documents API** (rather than the underlying S3 / cloud provider directly).

**Does Camunda's Documents API provide pre-signed URL generation?**

- **a)** **Verify per Camunda 8 version** — current versions may expose endpoints for generating download URLs / time-limited links via Documents API. If supported, the API generates a URL valid for a configured duration; pass to external recipients. If NOT supported in your version, fall back to: (1) generate pre-signed URL via the underlying storage backend's SDK (S3 / Azure Blob), and / or (2) proxy through your own service that authorises and serves the document. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **b)** Yes — universal feature, no version concerns — overstates; verify per version. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **c)** No — always go directly to storage backend — overstates; some versions add API-level helpers. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **d)** Pre-signed URLs not relevant for documents — incorrect; valid use case for external sharing. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Documents API features evolve across Camunda 8 versions. For pre-signed / time-limited URL generation:
  - **Latest versions**: may expose API endpoints to generate download URLs valid for a configured time window (Camunda manages the URL signing; transparent to caller).
  - **Older versions**: caller may need to: (1) fetch document reference from Camunda; (2) extract the storage backend's identifier (S3 key, etc.); (3) call the storage backend's SDK to generate a pre-signed URL.
  - **Self-Managed**: depending on the configured storage backend, pre-signed URL support varies (cloud backends typically support; filesystem doesn't natively).

  Always verify the current Documents API docs for your Camunda 8 version's specific features.

  Best practice for sharing external links:
  - **Short TTL**: minimise the window of exposure (e.g., 1 hour).
  - **Single-use** where possible: regenerate per recipient.
  - **Audit logging**: track URL generation for compliance.

- **Option b) — Overstates.** Verify per version.

- **Option c) — Overstates.** Some versions add API-level.

- **Option d) — Wrong.** Valid use case.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Verify per version; API may expose pre-signed URL gen или fall back to backend SDK.
- **b) 5/10** — overstates.
- **c) 5/10** — overstates.
- **d) 1/10** — wrong; valid use.

**Correct Answer:** Verify per Camunda 8 version; current versions may expose pre-signed URL generation in Documents API; older versions may need backend SDK fallback.

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/document-handling/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "pre-signed URL via Documents API." External sharing.

**Въпросът → Solution Framing.** "API provides pre-signed URL" — изпитва се knowledge на Documents API evolution.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че API features evolve, че backend SDK fallback exists, че short TTL + audit best practice. Това е знание за Document Handling external sharing.

---

## Question 15: Configuring Processes (Weighting: 22%)

**Scenario:** An IDP extracts data with per-field confidence. The team wonders about computing an **overall confidence** for the entire extraction — e.g., to compare across documents.

**How might "overall confidence" be computed from per-field confidences?**

- **a)** **Options**: (1) **Minimum** field confidence (`=min([f in fields : f.confidence])`) — conservative; result is only as confident as the weakest field; (2) **Average** (`=mean([f in fields : f.confidence])`) — overall feel but masks weak fields; (3) **Weighted average** based on field importance (e.g., vendorName matters more than memo). Choice depends on the use case. For "are extractions reliable enough overall?" → minimum is safest. For analytics ("how good was this batch on average?") → mean. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/) + [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** IDP auto-computes overall confidence — partial; some IDP responses may include aggregate; verify. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **c)** Overall confidence not meaningful — wrong; useful metric. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **d)** Always use mean — overstates; minimum / weighted are also valid. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** "Overall confidence" can be computed in FEEL from per-field confidences. Pick the aggregation method based on semantic:

  **Minimum (conservative)**:
  - `=min([f in fields : f.confidence])`
  - Use case: "is the extraction trustworthy?" — only as good as the weakest field. Highlights potential issues.

  **Mean (general feel)**:
  - `=mean([f in fields : f.confidence])`
  - Use case: aggregate quality reporting; masks individual weak fields.

  **Weighted average (importance-aware)**:
  - `=(0.5 * vendorName.confidence + 0.3 * invoiceDate.confidence + 0.2 * amount.confidence)`
  - Use case: business-critical fields (vendorName, amount) weighted more than secondary (memo).

  **Median (robust)**:
  - `=median([f in fields : f.confidence])`
  - Use case: less sensitive to outliers than mean.

  For "should I auto-process this?" decision: minimum is typically safest — if any critical field is low-confidence, don't auto-process. For trend analytics, mean or median.

- **Option b) — Partial.** Some IDP responses may include aggregate; check.

- **Option c) — Wrong.** Useful metric.

- **Option d) — Overstates.** Multiple valid.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Choose aggregation (min / mean / weighted / median) per use case.
- **b) 5/10** — partial; verify IDP response.
- **c) 2/10** — wrong; useful.
- **d) 4/10** — overstates.

**Correct Answer:** Compute via FEEL — minimum (conservative), mean (general), weighted (importance-aware) — based on use case.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "overall confidence", "compare across documents." Aggregation strategy.

**Въпросът → Solution Framing.** "How computed" — изпитва се knowledge на FEEL aggregations + IDP confidence.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че min / mean / weighted / median са FEEL options, че choice depends on use case, че IDP may or may not auto-aggregate. Това е знание за IDP confidence aggregation.

---

## Question 16: Configuring Processes (Weighting: 22%)

**Scenario:** A team built a custom Connector Template for "Slack POST." They uploaded it to their project. They wonder how to **publish it to organisation scope** so all projects in the org can use it.

**What's the workflow for publishing a Connector Template to organisation scope?**

- **a)** **Verify per Web Modeler version** — modern versions typically expose a **"Publish to organisation"** action (or similar) on the template, requiring an admin role. Once published, the template appears in all projects' template picker. **Unpublish / depublish** action reverses this. Alternative: deploy the template programmatically via Web Modeler API at org scope. Workflow:
  1. Develop + test the template in a project.
  2. Verify behaviour with a process.
  3. As admin, publish to org.
  4. All projects can use it.
  5. Maintain centrally — updates propagate to all projects.
  
  Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **b)** All templates are org-wide by default — wrong; project-scoped by default. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **c)** Copy the template file to every project — wasteful; org-publishing avoids. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **d)** Templates can't be shared org-wide — wrong; supported. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Modern Web Modeler tiers / versions support template visibility scoping at organisation level. Workflow:
  - **Develop the template in a project** (test bed where you iterate without affecting other teams).
  - **Verify**: model a Service Task using the template; deploy; test the Connector works.
  - **Publish to organisation**: admin user with the right permission promotes the template from project to org scope. The template now appears in all projects' template picker.
  - **Maintain**: updates to the org-scoped template apply across the org. Versioning supports controlled rollout (deprecate old versions, publish new).
  - **Unpublish**: admin can demote a template from org scope back to project (or delete).

  Use case: a centrally-curated library of Connector Templates (Slack, Microsoft Teams, internal-API templates, etc.) that all teams use consistently.

  Permission model: typically only org admins can publish / unpublish; project users can use published templates.

  Verify per Web Modeler version + tier — features evolve.

- **Option b) — Wrong.** Project-scoped by default.

- **Option c) — Wasteful.** Org-publishing avoids.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Publish-to-org action (admin role); centrally maintain; unpublish reverses.
- **b) 2/10** — wrong; project-scoped default.
- **c) 4/10** — wasteful.
- **d) 1/10** — wrong; supported.

**Correct Answer:** Verify per version; admin publishes template to organisation scope; all projects can then use it.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "publish template to organisation scope." Template visibility management.

**Въпросът → Solution Framing.** "Workflow for publishing" — изпитва се knowledge на template promotion.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че default е project-scope, че publish-to-org promotes visibility, че admin role required. Това е знание за template lifecycle management.

---

## Question 17: Configuring Processes (Weighting: 22%)

**Scenario:** An AI Agent Connector has 4 tools available in its Ad-hoc Subprocess: `lookup-order`, `check-shipping`, `escalate-ticket`, `send-survey`. The LLM decides which to call. The team wonders **how the LLM picks** — random, weighted, strict?

**How does the LLM choose a tool in agentic orchestration?**

- **a)** **The LLM's choice is determined by its reasoning** — given the available tools (with names + descriptions), the conversation context, and any system prompt guidance, the LLM evaluates which tool best fits the next step. **Not random**: the LLM's output is largely deterministic given the same inputs (modulo temperature setting for creativity). **Tool descriptions matter**: clear, accurate descriptions help the LLM pick correctly. **System prompt steering**: instructions like "always check shipping status before escalating" guide selection. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **b)** Random selection — incorrect; LLM reasons. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **c)** Strict priority order — wrong; LLM-driven, not fixed order. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **d)** First tool in the Ad-hoc Subprocess — wrong; LLM picks contextually. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** LLM tool-calling agentic flows operate on the LLM's reasoning over:
  - **Available tools** (Ad-hoc Subprocess inner activities): the LLM sees the list of tool names, descriptions (often from the activity's `name` and / or a description property), and parameter schemas (input variable types).
  - **Conversation context**: previous turns, user inputs, system prompt.
  - **Current task**: what the user / process is currently asking for.

  The LLM evaluates and outputs a "tool call" specifying which tool to invoke and with what arguments. **Determinism**:
  - With **temperature = 0** (most deterministic), the LLM tends toward consistent choices given the same inputs.
  - With **higher temperature** (more creativity), small variations possible.
  - **Not random**: even at higher temperatures, output reflects the LLM's training and the input context, not a uniform random choice.

  **Design implications**:
  - **Clear tool names**: "lookup-order" (clear) beats "func1" (opaque).
  - **Helpful descriptions**: explain what each tool does, when to use it, when NOT to use it.
  - **System prompt guidance**: shape the LLM's reasoning (e.g., "Always confirm details before completing an order; use lookup-order to verify").
  - **Iteration**: review actual agent behaviour; refine prompts / descriptions based on observed choices.

- **Option b) — Wrong.** LLM reasons.

- **Option c) — Wrong.** LLM-driven.

- **Option d) — Wrong.** Context-based.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. LLM reasons based on tool descriptions + context + system prompt; not random.
- **b) 2/10** — wrong; reasons.
- **c) 2/10** — wrong; flexible.
- **d) 2/10** — wrong; context-based.

**Correct Answer:** LLM chooses based on its reasoning over tool descriptions, conversation context, and system prompt guidance.

**Official Documentation Link:** https://docs.camunda.io/docs/components/agentic-orchestration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "LLM picks tool", "random / weighted / strict." Tool-selection mechanism.

**Въпросът → Solution Framing.** "How LLM chooses" — изпитва се knowledge на agentic decision-making.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че LLM reasons over context + descriptions + prompt, че not random, че tool naming + system prompt steer. Това е знание за agentic tool-selection.

---

## Question 18: Configuring Processes (Weighting: 22%)

**Scenario:** A Timer Boundary needs duration **computed from a variable** — e.g., the customer's SLA tier (`bronze = PT24H`, `gold = PT4H`). The team wants the timer expression to use FEEL referencing the tier.

**Can Timer durations use FEEL expressions referencing process variables?**

- **a)** **Yes** — Timer expressions accept FEEL evaluating to a duration value. For variable-driven timer: `=if customer.tier = "GOLD" then duration("PT4H") else duration("PT24H")` (or a DMN lookup table). Engine evaluates at activation; the timer fires after the resolved duration. Supported for Timer Boundary (Date / Duration / Cycle types via FEEL). Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/) + [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** Timer durations must be static literals — incorrect; FEEL supported. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** Yes, but only via DMN lookup — partial; FEEL inline works too. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Use a Service Task to compute then a Timer with the computed variable — workable but FEEL inline simpler. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Timer Events in Camunda 8 accept FEEL expressions for duration / date / cycle. The FEEL expression evaluates at timer creation (when the timer is attached — e.g., User Task activation for Boundary, instance start for Start Event):
  - **Duration expression**: `=duration("PT4H")` literal or `=if cond then duration("PT4H") else duration("PT24H")` dynamic.
  - **Date expression**: `=date and time("2026-12-31T23:59:59Z")` literal or computed.
  - **Cycle expression**: `=cycle(R5/PT1H)` (where supported) or FEEL constructing the cycle string.

  Patterns:
  - **Tier-driven SLA**: as shown — if-then-else on customer tier.
  - **DMN lookup**: a DMN decision returns the duration; Business Rule Task sets a variable; Timer FEEL references it.
  - **Variable-based**: `=customer.slaTimer` where `customer.slaTimer` is a duration variable set earlier.

  Practical: parameterise timers based on business context. SLA-aware processes adapt automatically.

- **Option b) — Wrong.** FEEL supported.

- **Option c) — Partial.** Inline works too.

- **Option d) — Workable but heavier.** FEEL inline.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Timer FEEL expression references process variables for dynamic durations.
- **b) 1/10** — wrong; FEEL supported.
- **c) 5/10** — partial; inline FEEL works.
- **d) 4/10** — workable но heavier.

**Correct Answer:** Yes — Timer expressions accept FEEL, referencing process variables for dynamic durations.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Timer duration from variable", "customer SLA tier." Dynamic timer.

**Въпросът → Solution Framing.** "FEEL in Timer durations" — изпитва се knowledge на Timer FEEL support.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Timer accepts FEEL, че variable-driven durations supported, че if-then-else / DMN / variable patterns. Това е знание за parameterised timers.

---

## Question 19: Configuring Processes (Weighting: 22%)

**Scenario:** A Receive Task waits for `OrderShipped` message with correlation key `=tracking.id`. The team realises they need to **transform the variable**: trim whitespace and uppercase before correlating. Can the correlation key expression include FEEL function calls?

**Can Message correlation key use FEEL function calls?**

- **a)** **Yes** — the correlation key is a FEEL expression; can include function calls, string transformations, etc. Example: `=upper case(trim(tracking.id))`. Evaluated at task activation; result must be a non-null string / value used for correlation. Both the publisher and the subscription must use consistent transformation for correlation to succeed. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/) + [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** Correlation key must be a simple variable name — incorrect; FEEL supported. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **c)** Only `=variable` references — partial; full FEEL supported. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **d)** Transformations require Input Mapping before — workable but FEEL inline simpler. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Correlation key expressions are full FEEL. Common transformations:
  - **Normalisation**: `=upper case(trim(tracking.id))` — handles inconsistent casing / whitespace.
  - **Composition**: `=customer.id + "-" + order.id` — composite correlation key.
  - **Conditional**: `=if order.priority = "HIGH" then "PRIO-" + order.id else order.id`.
  - **Type coercion**: `=string(order.id)` — ensure string type.

  Important: **consistency between publisher and subscription**. Both sides must produce the same value:
  - Subscription: `=upper case(trim(tracking.id))` (transforms incoming variable).
  - Publisher: must publish the message with the **already-transformed** value as its correlation key.

  If publisher sends `"abc-123"` (lowercase) and subscription transforms to `"ABC-123"`, correlation will miss. Coordinate transformations.

  Best practice: keep correlation keys **simple and consistent** at source — transform at the publisher side (the system generating the message) rather than in the subscription. Or pick a simpler key that doesn't need transformation.

- **Option b) — Wrong.** FEEL supported.

- **Option c) — Partial.** Full FEEL.

- **Option d) — Workable but heavier.** Inline FEEL.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Full FEEL in correlation key; coordinate transformation with publisher.
- **b) 1/10** — wrong; FEEL supported.
- **c) 5/10** — partial; full FEEL.
- **d) 5/10** — workable но heavier.

**Correct Answer:** Yes — correlation key accepts full FEEL including function calls; coordinate transformation with publisher.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/messages/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "correlation key FEEL function calls", "trim + uppercase." Correlation key flexibility.

**Въпросът → Solution Framing.** "FEEL function calls в correlation key" — изпитва се knowledge на correlation expression flexibility.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че correlation key е full FEEL, че publisher / subscription consistency required, че simple keys best practice. Това е знание за correlation key design.

---

## Question 20: Configuring Processes (Weighting: 22%)

**Scenario:** A team uses Timer Cycle `R5/PT1H` for a Boundary on a User Task — wants 5 reminders every hour, non-interrupting. They wonder how this differs from a single-shot Timer Duration `PT1H`.

**Cycle vs Duration in Timer Boundaries: key differences?**

- **a)** **Cycle (recurring)**:
  - `R5/PT1H` = repeat 5 times, 1-hour interval.
  - `R/PT1H` = unbounded repeating.
  - Each repetition fires the boundary (if non-interrupting, host continues; if interrupting, first fire cancels host).
  
  **Duration (one-shot)**:
  - `PT1H` = fire once after 1 hour.
  - Single fire; subsequent moments don't re-fire.
  
  For "5 reminders" you need Cycle. For "single deadline" you need Duration. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** Same behaviour — wrong; Cycle recurs, Duration single-shot. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** Cycle only for Start Events — wrong; works on Boundaries too. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Duration is just R1 — partial; semantically equivalent for one fire but explicit Duration clearer. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Cycle and Duration are distinct Timer types:

  **Cycle** (`R[n]/[interval]` or `R/[interval]` unbounded):
  - Fires repeatedly at the specified interval.
  - `R5/PT1H`: 5 fires total, 1 hour apart.
  - `R/PT1H`: unbounded — fires every hour indefinitely.
  - Each fire either continues the host (non-interrupting) or cancels (interrupting; first fire only, since subsequent fires can't occur on a cancelled host).
  - Common use: recurring reminders on User Tasks (non-interrupting).

  **Duration** (`PT[n]H` / `P[n]D` etc.):
  - Fires once after the specified duration.
  - Single-shot.
  - Common use: deadlines / timeouts.

  **Date** (`<ISO datetime>`):
  - Fires once at the specified absolute moment.
  - Single-shot.
  - Common use: specific moment / launch / scheduled event.

  Choose based on:
  - **One-time fire** → Duration or Date.
  - **Recurring** → Cycle.
  - **Non-interrupting recurrence**: Cycle + non-interrupting boundary; classic pattern for "remind every X without cancelling task."
  - **Interrupting single timeout**: Duration + interrupting boundary.

- **Option b) — Wrong.** Distinct.

- **Option c) — Wrong.** Cycle on Boundaries too.

- **Option d) — Partial.** Semantic difference; Duration explicit.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Cycle = recurring, Duration = single-shot.
- **b) 1/10** — wrong; distinct.
- **c) 2/10** — wrong; on Boundaries too.
- **d) 5/10** — partial.

**Correct Answer:** Cycle = recurring (Rn/interval); Duration = single-shot (PT...). Pick by requirement.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Cycle vs Duration", "5 reminders." Timer type selection.

**Въпросът → Solution Framing.** "Key differences" — изпитва се knowledge на Timer types.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Cycle recurs (Rn/interval), че Duration single-shot, че Date absolute moment. Това е знание за Timer types.

---

## Question 21: Configuring Processes (Weighting: 22%)

**Scenario:** A C7-to-C8 migration team has a process with several Task Listeners: `on-create` (audit logging), `on-assignment` (notify assignee), `on-completion` (update downstream system). They wonder how to migrate each.

**Migration patterns for C7 Task Listeners in Camunda 8.**

- **a)** **Each listener type has a C8-native pattern**:
  - **on-create** (run when task is created) → **Service Task BEFORE the User Task** doing audit logging.
  - **on-assignment** (run when assignee is set) → **Event Subprocess** in process scope, triggered by an event when assignee changes (or simply a Service Task in the flow after assignment if assignment is at User Task activation).
  - **on-completion** (run after task completes) → **Service Task AFTER the User Task** doing the post-completion work.
  
  The pattern: replace hidden listeners with **explicit BPMN flow elements**. Makes behaviour visible. Documentation: [Migration from Camunda 7](https://docs.camunda.io/docs/guides/migrating-from-camunda-7/)

- **b)** No equivalent in C8 — incorrect; multiple patterns. Documentation: [Migrating from Camunda 7](https://docs.camunda.io/docs/guides/migrating-from-camunda-7/)

- **c)** Use a single Service Task wrapping all logic — partial; per-listener patterns more flexible. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Keep listeners in C7 forever — defeats migration. Documentation: [Migrating from Camunda 7](https://docs.camunda.io/docs/guides/migrating-from-camunda-7/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** C7 Task Listeners were Java code / scripts attached as lifecycle hooks. C8's philosophy: replace hidden listeners with explicit BPMN. Migration patterns:

  **on-create** → preceding Service Task:
  ```
  [Start] → [Service Task: Log task creation] → [User Task: Approve]
  ```
  The Service Task runs before the User Task activates; explicit, observable in Operate.

  **on-assignment** → Event Subprocess listening for assignment events:
  - More nuanced: C8's User Task lifecycle includes assignment moments; if you need to react to assignment specifically, use Event Subprocess with appropriate trigger.
  - Simpler: if assignment is just at User Task activation, a Service Task after activation can do "send notification."

  **on-completion** → succeeding Service Task:
  ```
  [User Task: Approve] → [Service Task: Update downstream] → [Continue]
  ```

  For complex listener logic (validation, dynamic assignment), additional patterns:
  - **Dynamic assignee**: FEEL in `assignmentDefinition` (e.g., `assignee="=manager"`).
  - **Validation**: Service Task after User Task with validation logic; Error Boundary for failure.
  - **Audit**: Service Tasks before / after + Event Subprocess for cross-cutting audit.

  The general principle: **visibility over hidden behaviour**. Diagrams show what happens; no surprises in production from hidden listener code.

- **Option b) — Wrong.** Patterns exist.

- **Option c) — Partial.** Per-listener patterns more flexible.

- **Option d) — Defeats migration.** Goal is C8 migration.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Per-listener pattern: Service Task before (on-create), after (on-completion), Event Subprocess (on-assignment).
- **b) 1/10** — wrong; patterns exist.
- **c) 5/10** — partial; flexible patterns better.
- **d) 1/10** — defeats migration.

**Correct Answer:** Replace each listener with explicit BPMN: on-create → preceding Service Task; on-completion → succeeding Service Task; on-assignment → Event Subprocess or post-activation Service Task.

**Official Documentation Link:** https://docs.camunda.io/docs/guides/migrating-from-camunda-7/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "C7 Task Listeners migration." Listener migration patterns.

**Въпросът → Solution Framing.** "Migration patterns" — изпитва се knowledge на C7→C8 listener replacement.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че per-listener-type patterns exist, че explicit BPMN replaces hidden listeners, че Event Subprocess + Service Task cover most cases. Това е знание за C7→C8 migration patterns.

---

## Question 22: Configuring Processes (Weighting: 22%)

**Scenario:** A team's process variable has deeply nested structure: `=order.shipping.address.city`. They wonder if **JSONPath-style** access (`$.order.shipping.address.city`) works as alternative to FEEL dot notation.

**Does Camunda 8 support JSONPath syntax for variable access?**

- **a)** **No — Camunda 8 uses FEEL exclusively** for expression evaluation. JSONPath syntax (`$.path.to.value`) isn't natively supported. FEEL's dot navigation (`order.shipping.address.city`) and bracket access (`order["shipping"]["address"]["city"]`) handle nested access. For dynamic keys, FEEL `get value(context, key)` function or bracket access with FEEL-computed strings work. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/) + [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** Yes — JSONPath supported alongside FEEL — incorrect; FEEL only. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** JSONPath supported for some operations — incorrect; FEEL only. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Use a Service Task to convert JSONPath to FEEL — workaround if you really need JSONPath input; otherwise just use FEEL directly. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8's expression language is FEEL exclusively. No JSONPath, no JavaScript, no Groovy. FEEL navigation patterns:
  - **Dot navigation** (for static known keys): `order.shipping.address.city`.
  - **Bracket access** (for dynamic / special keys): `order["shipping"]["address"]["city"]` — useful when keys are computed or contain special chars.
  - **List indexing** (1-based): `items[1]`, `items[3]`, `items[-1]` (last).
  - **Filter / project**: `[item in items : item.status = "ACTIVE"]`.
  - **Context lookup**: `get value(context, "dynamicKey")` for entirely dynamic key access.

  For complex queries on nested data, compose FEEL primitives. The combination of dot navigation, bracket access, filters, and projections covers what JSONPath does in other tools.

  If a team is migrating from a JSONPath-based system, they'd need to translate paths to FEEL syntax. Most translations are 1-to-1 (replace `$.` prefix with the variable name; convert `[*]` to FEEL `for` expressions or list functions).

- **Option b) — Wrong.** FEEL only.

- **Option c) — Wrong.** FEEL only.

- **Option d) — Workaround.** Direct FEEL simpler.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL only; no JSONPath; dot / bracket / filters cover navigation.
- **b) 2/10** — wrong; FEEL only.
- **c) 2/10** — wrong; FEEL only.
- **d) 4/10** — workaround.

**Correct Answer:** No — Camunda 8 uses FEEL exclusively; dot navigation, bracket access, and filters cover nested data needs.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "JSONPath syntax alternative to FEEL." Expression language question.

**Въпросът → Solution Framing.** "JSONPath supported" — изпитва се knowledge на FEEL exclusivity.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL е C8's only expression language, че dot / bracket / filters cover navigation, че JSONPath не supported. Това е знание за expression language scope.

---

# Section 3 — Decisions & DMN (Questions 23-29)

> Weight 11% • Topics: RULE ORDER distinct from FIRST / COLLECT, FEEL `instance of` type check, BKM parameter typing, multi-caller BKM reuse, DMN error propagation, DMN + BPMN versioning together, Decision Service I/O declaration.

---

## Question 23: Decisions & DMN (Weighting: 11%)

**Scenario:** A loyalty-rewards DMN may have multiple rules matching the same input — e.g., a customer qualifies for multiple discounts. The team wants **all matching rules' outputs returned as a list, ordered by row order in the table**.

**Which hit policy fits "all matches as list, in row order"?**

- **a)** **RULE ORDER** — returns the list of all matching rules' outputs, **ordered by row position** in the table. Distinct from COLLECT (no order guarantee), FIRST (single value, row-order first match), OUTPUT ORDER (sorted by output value list priority). Documentation: [DMN Hit Policies](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** COLLECT (no aggregator) — returns list without row-order guarantee. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** OUTPUT ORDER — different ordering (output value list priority). Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** FIRST — single value, not list. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **RULE ORDER** hit policy: returns a list of all matching rules' outputs, **ordered by row order** in the decision table. The first matching rule's output appears first in the list, second matching second, etc.

  Distinct from related policies:
  - **COLLECT** (no aggregator): returns list of matches, but doesn't guarantee row order — typical implementations return evaluation order, which may match row order in practice but isn't part of the spec contract.
  - **OUTPUT ORDER**: returns list ordered by the **output value list's priority** ordering, not row order.
  - **FIRST**: returns single value (first match by row order), not list.
  - **PRIORITY**: returns single value (highest-priority output per value list), not list.

  When to use RULE ORDER:
  - You want a list AND row order matters semantically (e.g., "apply discounts in priority order; rows are arranged by application priority").
  - Distinct from COLLECT for the order guarantee.

  Performance: similar to COLLECT — evaluates all rules.

- **Option b) — Different.** No row-order guarantee.

- **Option c) — Different ordering.** Output value priority.

- **Option d) — Single value.** Not list.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. RULE ORDER returns list, row-order guaranteed.
- **b) 5/10** — different; no row-order guarantee.
- **c) 4/10** — different (output value priority).
- **d) 3/10** — single value, не list.

**Correct Answer:** RULE ORDER — list of all matches ordered by row order.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "all matches as list, row order." Hit policy distinction.

**Въпросът → Solution Framing.** "Fits row-order list" — изпитва се knowledge на RULE ORDER vs COLLECT vs OUTPUT ORDER.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че RULE ORDER guarantees row-order list, че COLLECT lacks order guarantee, че OUTPUT ORDER е different basis. Това е знание за list-returning hit policies.

---

## Question 24: Decisions & DMN (Weighting: 11%)

**Scenario:** A FEEL expression must check if a variable is of type **list** vs **context** vs **scalar** — useful for polymorphic handling.

**Does FEEL have an `instance of` operator for type checking?**

- **a)** **Yes — FEEL has `instance of` operator** for runtime type checks. Syntax: `value instance of <type>`. Types include `number`, `string`, `boolean`, `date`, `time`, `date and time`, `duration`, `list`, `context`, `function`. Example: `=if customer instance of context then customer.name else "unknown"`. Useful for polymorphic data handling. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** Use `typeof()` function — invented; FEEL uses `instance of` operator. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** No type checking — incorrect; supported. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Only for primitive types — incorrect; lists, contexts, functions all checkable. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL provides `instance of` for runtime type checking. Syntax: `value instance of <type-name>`. Returns boolean. Supported types per FEEL spec:
  - **Scalars**: `number`, `string`, `boolean`.
  - **Temporals**: `date`, `time`, `date and time`, `days and time duration`, `years and months duration`.
  - **Collections**: `list`, `context` (object), `range`.
  - **Functions**: `function`.
  - **Null check**: `value = null` (not `instance of null`; null is the value, not a type).

  Use cases:
  - **Polymorphic data**: variable may be a single item OR a list; check before processing.
  - **Defensive coding**: validate variable shape before using.
  - **Type narrowing**: in complex FEEL, narrow type before accessing fields.

  Example:
  ```
  =if items instance of list
    then count(items)
    else if items instance of context
      then 1
      else 0
  ```

- **Option b) — Invented.** `instance of` operator, not function.

- **Option c) — Wrong.** Supported.

- **Option d) — Wrong.** Covers complex types too.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `instance of` operator for type checking; covers scalars, temporals, lists, contexts, functions.
- **b) 2/10** — invented.
- **c) 1/10** — wrong; supported.
- **d) 2/10** — wrong; complex types covered.

**Correct Answer:** Yes — FEEL has `instance of` operator: `value instance of <type>`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "check if list / context / scalar", "type checking." FEEL type system.

**Въпросът → Solution Framing.** "instance of operator" — изпитва се knowledge на FEEL type checking.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че `instance of` е operator (не function), че covers all FEEL types, че polymorphic handling enabled. Това е знание за FEEL type system.

---

## Question 25: Decisions & DMN (Weighting: 11%)

**Scenario:** A team defines a **BKM (Business Knowledge Model)** with a Boxed Function Expression: `function (principal, rate, years) { principal * power((1 + rate), years) }`. They wonder if parameters can be **typed**.

**Are BKM parameters typed in DMN?**

- **a)** **Yes — DMN's spec supports typed parameters** for BKMs (and decisions). The `function` declaration can include type annotations: `function (principal: number, rate: number, years: number)`. Typing helps:
  - **Validation**: callers passing wrong types get clear errors.
  - **Tooling**: editors offer type-aware suggestions.
  - **Documentation**: readers see the expected types.
  
  Type names align with FEEL types (`number`, `string`, `boolean`, `date`, etc.). Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** No — all parameters are untyped — incorrect; typing supported. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Type checking happens at deploy time only — partial; typing also helps tooling. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Use FEEL `instance of` inside the function body — workaround for runtime checks; design-time typing better. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN spec supports typed parameters in function definitions. The Boxed Function Expression syntax declares parameter names and types:
  ```
  function (principal: number, rate: number, years: number) {
    principal * power((1 + rate), years)
  }
  ```

  Type names: standard FEEL types (`number`, `string`, `boolean`, `date`, `time`, `date and time`, `days and time duration`, `years and months duration`, `list`, `context`, `any`).

  Benefits:
  - **Caller validation**: if a caller passes a string where number expected, validator / runtime can detect (depending on coverage).
  - **Tooling**: DMN editors / FEEL editors can highlight type mismatches.
  - **Documentation**: function signature shows what's expected.

  Verify Zeebe's coverage of type checking in DMN — some versions enforce at runtime; others rely on tooling-level checks. The typing in the model is always beneficial for clarity.

- **Option b) — Wrong.** Typing supported.

- **Option c) — Partial.** Also tooling benefit.

- **Option d) — Workaround.** Design-time typing preferred.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. DMN spec supports typed parameters; type annotations like `: number`.
- **b) 1/10** — wrong; supported.
- **c) 4/10** — partial; tooling benefits too.
- **d) 4/10** — workaround.

**Correct Answer:** Yes — DMN supports typed parameters in BKMs (e.g., `principal: number`).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "BKM parameter typed." DMN type system.

**Въпросът → Solution Framing.** "Parameters typed" — изпитва се knowledge на DMN typing.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN supports typed params, че types align с FEEL, че typing helps validation + tooling + docs. Това е знание за DMN typing.

---

## Question 26: Decisions & DMN (Weighting: 11%)

**Scenario:** A team has a BKM `applyTax(amount, region)` used by **multiple decisions** in the same DRD: `Pricing`, `Refund`, `Discount`. Each decision invokes the BKM with its own amount + region. The team wonders if multiple decisions can share one BKM.

**Can multiple decisions reference the same BKM?**

- **a)** **Yes — that's the BKM's main value**: define logic once, reuse across multiple decisions. Each decision wanting to use the BKM declares a Knowledge Requirement (dashed arrow with circle head) to the BKM. In the decision's FEEL body, call the BKM by name with arguments. Each invocation is independent — the BKM is stateless / pure logic. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** No — one BKM per decision — incorrect; sharing is the design. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Yes, but with side effects — incorrect; BKMs are pure / stateless. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Multiple decisions must have their own copies — anti-DRY. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BKMs are the DMN equivalent of reusable functions / utilities. **Designed for multi-caller scenarios**:
  - Define once.
  - Multiple decisions / BKMs reference via Knowledge Requirement.
  - Each invocation independent — pure / stateless function.
  - Single source of truth for the logic.

  DRD example:
  ```
  [Input: amount] → [Pricing] ← Knowledge Req. ← [BKM: applyTax]
  [Input: amount] → [Refund]  ← Knowledge Req. ← [BKM: applyTax]
  [Input: amount] → [Discount] ← Knowledge Req. ← [BKM: applyTax]
  ```

  Each decision's FEEL body calls `applyTax(amount, region)`; the engine resolves to the shared BKM definition. Updates to the BKM ripple to all callers (consistent application of tax logic).

  Best practice for shared BKMs:
  - **Stable interface**: minimise changes to parameter signature; changes break callers.
  - **Clear naming + docs**: callers should understand without re-reading the body.
  - **Test independently**: BKM-level tests (call with various inputs; verify outputs).
  - **Version awareness**: when BKM evolves, evaluate caller impact.

- **Option b) — Wrong.** Sharing designed.

- **Option c) — Wrong.** Pure / stateless.

- **Option d) — Anti-DRY.** Defeats BKM value.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. BKM designed for multi-caller reuse; Knowledge Requirement per caller.
- **b) 1/10** — wrong; sharing designed.
- **c) 2/10** — wrong; pure / stateless.
- **d) 1/10** — anti-DRY.

**Correct Answer:** Yes — multiple decisions reference the same BKM via Knowledge Requirements; BKMs are pure / reusable.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "multiple decisions reference same BKM." Multi-caller reuse.

**Въпросът → Solution Framing.** "Can multiple decisions share BKM" — изпитва се knowledge на BKM reuse model.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BKMs designed for multi-caller, че Knowledge Requirements link callers, че single source of truth е the value. Това е знание за BKM reuse.

---

## Question 27: Decisions & DMN (Weighting: 11%)

**Scenario:** A BPMN Business Rule Task invokes a DMN. The DMN evaluation **throws an error** — e.g., FEEL expression error in an output entry, type mismatch, no-match with UNIQUE policy.

**How does a DMN evaluation error propagate to the BPMN?**

- **a)** **The error surfaces as a BPMN Incident** on the Business Rule Task. Ops sees the incident in Operate with details (which DMN, which rule / entry erred, error message). The instance pauses at the task awaiting resolution. Options to resolve:
  1. Fix the underlying issue (DMN logic, data, or coverage); resolve the incident → re-evaluate.
  2. Update process variables (if data issue); resolve incident → re-evaluate.
  3. Modify the instance to skip the Business Rule Task.
  
  Documentation: [Business Rule Task](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/) + [Operate Incidents](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **b)** Instance auto-cancels — incorrect; incident lets ops resolve. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** DMN errors silently return null — wrong; surfaces as incident. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Process throws BPMN error — partial; some DMN-side error patterns may translate to BPMN Error events (e.g., FEEL `throw error`), but typical evaluation errors become Incidents. Documentation: [Business Rule Task](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN evaluation errors at a Business Rule Task surface as **BPMN Incidents**:
  - The Business Rule Task pauses (it didn't complete successfully).
  - An Incident appears in Operate, attached to the task instance.
  - Incident details include: error message, DMN involved, which evaluation step failed.

  Typical error causes:
  - **No-match with strict policy** (UNIQUE / FIRST / PRIORITY with no rule matching, no default output): "no matching rule."
  - **FEEL evaluation error** in an output entry: type mismatch, division by zero, etc.
  - **Multi-match with UNIQUE**: violates single-match contract.
  - **Type mismatch** between input value and column type.

  Resolution path:
  - **Fix the data**: update the variable causing the issue; resolve incident → re-evaluate.
  - **Fix the DMN**: deploy a fixed DMN (catch-all rule, default output, type-safe expressions); for running instances, the running evaluation uses the originally-deployed DMN; mitigate via "modify instance" or wait for next instance.
  - **Skip the task**: modify the instance to bypass the Business Rule Task — only when the decision is dispensable for this specific instance.

  Best practice prevention:
  - **Design with coverage**: catch-all rule + default output for UNIQUE / FIRST / PRIORITY.
  - **Validate input ranges**: ensure callers pass values within input column expectations.
  - **Test DMN extensively** before production: edge cases, no-match scenarios.

- **Option b) — Wrong.** Incident.

- **Option c) — Wrong.** Surfaces as incident.

- **Option d) — Partial.** Some scenarios; typical is Incident.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. DMN error surfaces as BPMN Incident; ops resolves.
- **b) 1/10** — wrong; incident path.
- **c) 2/10** — wrong; surfaces.
- **d) 4/10** — partial; FEEL throw error possible but typical is Incident.

**Correct Answer:** DMN error surfaces as a BPMN Incident on the Business Rule Task; ops resolves via data fix / DMN fix / modify instance.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "DMN evaluation throws error", "propagation to BPMN." Error handling.

**Въпросът → Solution Framing.** "How error propagates" — изпитва се knowledge на DMN-BPMN integration error flow.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN errors → BPMN Incident, че ops resolves via Operate, че best practice е coverage / validation in DMN design. Това е знание за DMN error propagation.

---

## Question 28: Decisions & DMN (Weighting: 11%)

**Scenario:** A team versions BPMN and the DMN it references — they wonder if updating just the DMN (without changing BPMN) **rolls** the BPMN's effective behaviour for running instances.

**Does updating a DMN affect running BPMN instances that reference it?**

- **a)** **Depends on the BPMN's DMN binding**: typical Camunda 8 binding uses `decisionId` referencing the DMN by ID. By default, the **latest deployed DMN version** is invoked at evaluation time. So updating the DMN deploys a new version; **subsequent evaluations** in running instances pick up the new version. **Past evaluations** (already-completed Business Rule Tasks) keep their cached results. **Caveat**: some BPMN configurations may pin to a specific DMN version. Verify your version's exact binding semantics. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/) + [Process Versioning](https://docs.camunda.io/docs/components/concepts/process-instance-versioning/)

- **b)** Always latest — wrong; binding configurable. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Always pinned to BPMN deployment time — wrong; latest by default. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** DMN can't be updated independently of BPMN — incorrect; separate deployment lifecycles. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN-DMN binding behaviour:
  - **Default `zeebe:calledDecision decisionId="..."`**: typically resolves to **latest deployed version** at Business Rule Task evaluation time.
  - **Already-evaluated tasks**: results cached in the instance's history; don't re-evaluate.
  - **Pending Business Rule Tasks**: when they reach evaluation, use the latest DMN at that moment.

  Implications for running instances:
  - **Update DMN with backward-compatible change** (add a new rule, refine logic): running instances picking up future evaluations benefit immediately.
  - **Update DMN with breaking change** (remove a rule, change input/output schema): risk of running instances seeing inconsistent behaviour mid-process.

  Mitigations:
  - **Version pinning** (where supported): BPMN explicitly references a specific DMN version; updates require new BPMN deployment.
  - **Backward-compatible DMN evolution**: only add rules, keep schemas stable.
  - **Migration coordination**: deploy new BPMN + new DMN atomically; migrate running instances if needed.

  Verify your Zeebe / Camunda 8 version's exact binding behaviour.

- **Option b) — Wrong.** Binding configurable.

- **Option c) — Wrong.** Latest default.

- **Option d) — Wrong.** Independent.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Default uses latest DMN; pending evaluations use new version; cached results unchanged.
- **b) 4/10** — wrong; configurable.
- **c) 3/10** — wrong; latest default.
- **d) 1/10** — wrong; independent.

**Correct Answer:** Depends on binding — default latest version; pending Business Rule Tasks pick up new DMN; cached results unchanged.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "updating DMN affect running BPMN." Cross-resource versioning.

**Въпросът → Solution Framing.** "Affect running instances" — изпитва се knowledge на DMN version binding.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че default uses latest, че pending evaluations pick up new version, че breaking changes need migration coordination. Това е знание за DMN-BPMN version interaction.

---

## Question 29: Decisions & DMN (Weighting: 11%)

**Scenario:** A team defines a **Decision Service** in their DMN — a curated public API around several decisions. They wonder how to declare **what input data the Decision Service expects** and **what decisions it exposes as outputs**.

**How does a Decision Service declare inputs and outputs?**

- **a)** **Decision Service has explicit declarations**:
  - **Output decisions**: list of decisions whose results are returned to callers (the "public outputs" of the service).
  - **Encapsulated decisions**: list of internal supporting decisions invoked by the output decisions (hidden from callers).
  - **Input decisions** (or input data): list of decisions / input data that the service expects from callers.
  
  The Decision Service acts as a façade: callers invoke it, provide inputs, receive outputs from the declared output decisions. Internal flow is opaque. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** Implicit from DRD structure — partial; DRD provides graph, but Decision Service declares the public interface. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Hidden from callers — caller invokes blindly — wrong; explicit interface. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** All decisions in DRD are exposed — wrong; Decision Service curates. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN's Decision Service is the spec's way to define a curated public interface over a subset of decisions. It declares:
  - **Output decisions**: explicitly listed; their results become the Decision Service's output (callers see these).
  - **Encapsulated decisions**: internal supporting decisions; computed as part of the service evaluation but not directly exposed to callers.
  - **Input decisions / Input data**: explicitly listed inputs the service requires. Callers must provide values for these.

  Comparable to a function signature in programming:
  - Function name = Decision Service name.
  - Parameters = input decisions / input data.
  - Return value(s) = output decisions.
  - Function body = encapsulated decisions + invocation graph.

  Benefits:
  - **Encapsulation**: callers don't depend on internal decision structure.
  - **Versioning**: internal restructuring possible without breaking callers (as long as public interface stable).
  - **Composability**: Decision Services can be reused across BPMN processes / other Decision Services.

  **Caveat**: Zeebe's coverage of Decision Service has varied; verify the current docs. Where not fully supported, the practical fallback is to model the top-level decision as the BPMN entry point and let DRD dependencies handle internal evaluation.

- **Option b) — Partial.** DRD provides graph; Decision Service is the curated interface.

- **Option c) — Wrong.** Explicit interface.

- **Option d) — Wrong.** Curated subset.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Decision Service declares output / encapsulated / input decisions explicitly.
- **b) 4/10** — partial; DRD е graph but Decision Service curates.
- **c) 2/10** — wrong; explicit.
- **d) 2/10** — wrong; curated.

**Correct Answer:** Decision Service declares output decisions (public), encapsulated decisions (internal), and input decisions / data explicitly.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Decision Service declare inputs and outputs." Public API curation.

**Въпросът → Solution Framing.** "How declare inputs / outputs" — изпитва се knowledge на Decision Service structure.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Decision Service declares output / encapsulated / input decisions, че encapsulation + composability benefits, че Zeebe coverage varies. Това е знание за Decision Service interface.

---

# Section 4 — Configuring Forms (Questions 30-32)

> Weight 5% • Topics: Form schema versioning vs published version, Group components, output FEEL transformation.

---

## Question 30: Configuring Forms (Weighting: 5%)

**Scenario:** A Form's **schema** (JSON definition) is what's stored / version-controlled in Web Modeler. The team wonders if there's a distinction between **schema versions** and **deployed (published) versions** of a Form.

**What's the distinction between Form schema versions and deployed Form versions?**

- **a)** **Schema versions** are revisions of the Form's JSON definition stored / tracked in Web Modeler (each save / commit creates a new version in the project's history). **Deployed versions** are snapshots of the Form deployed to a cluster — when a Form is deployed, the cluster's Tasklist sees that specific snapshot at that version. Multiple schema saves don't auto-deploy; explicit deploy creates a cluster-side Form definition version. Same model as BPMN: Web Modeler tracks drafts; deployment creates cluster-side versions. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/) + [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **b)** They're the same — incorrect; distinct lifecycle. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** No versioning at all — incorrect; both layers version. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Only cluster-side versioning — partial; Web Modeler also tracks history. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Two distinct version concepts:

  **Web Modeler schema versions** (development-side):
  - Each save / commit in Web Modeler creates a version in the project's history.
  - Track drafts as the Form evolves: add a field, change validation, refine layout.
  - Diff between versions; revert to a prior version; collaborate on changes.
  - Not deployed to any cluster yet.

  **Deployed Form versions** (cluster-side):
  - Triggered by explicit "Deploy" action (or programmatic API).
  - Creates a Form definition version in the target Zeebe cluster.
  - Tasklist resolves form references against deployed versions.

  Workflow:
  1. Modeler iterates the Form in Web Modeler (creating schema versions).
  2. When ready, modeler deploys → cluster receives Form definition v1.
  3. Continued schema iteration → eventual redeploy → cluster receives v2.
  4. Tasklist uses the appropriate cluster-side version based on the BPMN's form reference.

  Same model as BPMN / DMN: development versions (Web Modeler) vs deployment versions (cluster).

- **Option b) — Wrong.** Distinct.

- **Option c) — Wrong.** Both version.

- **Option d) — Partial.** Web Modeler also tracks.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Schema versions in Web Modeler; deployed versions in cluster; distinct lifecycle.
- **b) 1/10** — wrong; distinct.
- **c) 1/10** — wrong; both version.
- **d) 5/10** — partial.

**Correct Answer:** Schema versions are Web Modeler revisions; deployed versions are cluster-side snapshots; distinct lifecycle.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "schema versions vs deployed versions." Form versioning model.

**Въпросът → Solution Framing.** "Distinction" — изпитва се knowledge на dev vs deployment versioning.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Web Modeler tracks schema versions, че deployment creates cluster-side versions, че same model as BPMN / DMN. Това е знание за Form versioning lifecycle.

---

## Question 31: Configuring Forms (Weighting: 5%)

**Scenario:** A complex Form has 30 fields. The team wants to **group related fields visually** — Personal Info, Contact, Preferences, Consents — with sub-sections of the form clearly separated.

**Which Form component supports nested layout / grouping of fields?**

- **a)** **`Group` component** — visually groups child fields with optional label / heading. Provides nesting: a Group can contain other components (Text Inputs, Datepickers, etc.) and even other Groups (nested). Renders as a visually-distinct section. Combined with Headings / Text Views for section titles, organises complex forms readably. Documentation: [Forms element library](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/)

- **b)** Use Section component — partial; some versions have specific section components; verify per element library. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Multiple separate Forms — wasteful; one Form with Groups simpler. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Layout grouping isn't supported — incorrect; component library supports. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda Forms' element library typically includes a **Group** component for nested layout / clustering:
  - **Visual grouping**: child fields are rendered in a visually-distinct group (often with a label / heading).
  - **Nesting**: Group can contain any other Form components, including other Groups (deep nesting if needed).
  - **Optional title / label**: provides section heading.

  Combined with other layout components:
  - **Heading / Text View**: section titles, instructions, help text.
  - **Spacer**: vertical / horizontal spacing.
  - **Group**: cluster related fields.

  Example structure for a complex form:
  ```
  - Heading: "Customer Registration"
  - Group: "Personal Info"
    - Text Input: First Name
    - Text Input: Last Name
    - Datepicker: Date of Birth
  - Group: "Contact"
    - Text Input: Email
    - Text Input: Phone
  - Group: "Preferences"
    - Checklist: Communication channels
  - Group: "Consents"
    - Checkbox: Privacy Policy
    - Checkbox: Marketing
  ```

  Renders as a structured form with clear sections; readers see the logical grouping.

  Verify the specific Group / Section components in your Web Modeler version's element library.

- **Option b) — Partial.** Section may exist; Group is the canonical mechanism in many versions.

- **Option c) — Wasteful.** One form simpler.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Group component для nested layout / field clustering.
- **b) 6/10** — partial; specific section components vary by version.
- **c) 3/10** — wasteful.
- **d) 1/10** — wrong; supported.

**Correct Answer:** Use the Group component (or equivalent in element library) for nested layout / field clustering.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/form-element-library/forms-element-library/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "group related fields visually", "sub-sections." Form layout.

**Въпросът → Solution Framing.** "Component for nested layout" — изпитва се knowledge на Form element library.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Group component clusters fields, че nesting supported, че Headings + Spacers complement. Това е знание за Form layout composition.

---

## Question 32: Configuring Forms (Weighting: 5%)

**Scenario:** A Form has a Number Input for amount in cents. When the user submits, the process variable should store the amount in **dollars** (divided by 100). The team wonders if there's a way to **transform on submit** without a Service Task after.

**Can Form data be transformed via FEEL before writing to process variables?**

- **a)** **Yes — Form fields can have FEEL expressions in their binding** that transform the value on read / write. The specifics vary by Form element library — some components support a `valueExpression` or output FEEL that transforms the field's value before it lands in the process variable. Alternative: write the raw field to a local Form variable, then use Output Mapping on the User Task to transform to the desired process variable shape: `Target: amountDollars, Source: =amountCents / 100`. The User Task's Output Mapping happens on complete; transforms the form data before it reaches process scope. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/) + [I/O Mappings](https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings)

- **b)** No — only raw form values stored — incorrect; transformation possible. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Always need a Service Task — wrong; Output Mapping / FEEL transformation alternatives exist. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Use Document Handling — wrong tool. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Transformations between form inputs and process variables can happen at multiple layers:

  **Option 1: Form field expression** (where supported):
  - Some components / form-js versions support a value expression that transforms the displayed / submitted value.
  - Example: a Number Input could expose `displayExpression` (for display) and `valueExpression` (for the underlying value).
  - Verify your element library's specific capabilities.

  **Option 2: User Task Output Mapping** (always available):
  - The form writes raw values to local task variables.
  - Output Mapping on the User Task transforms: `Target: amountDollars, Source: =amountCents / 100`.
  - The transformed value lands in process scope; original raw stays local.

  **Option 3: Service Task after the User Task**:
  - Heavier; an extra task to do trivial transformation.
  - Use when transformation is complex / requires external lookups.

  Best practice: Output Mapping is the canonical, lightweight transformation point. Forms themselves are best kept as data-collection surfaces; transformation logic lives in BPMN / process configuration where it's easier to manage.

- **Option b) — Wrong.** Transformation possible.

- **Option c) — Wrong.** Lighter alternatives.

- **Option d) — Wrong tool.** Document Handling for binaries.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Form field expressions (where supported) или Output Mapping FEEL transformation.
- **b) 1/10** — wrong; transformation possible.
- **c) 4/10** — wrong; lighter alternatives.
- **d) 1/10** — wrong tool.

**Correct Answer:** Yes — use Form field expressions (where supported) or Output Mapping on the User Task to transform.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "transform on submit", "cents to dollars." Form data transformation.

**Въпросът → Solution Framing.** "Transform via FEEL" — изпитва се knowledge на transformation layers.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Form field expressions exist (verify), че Output Mapping е always-available transformation point, че Service Task е heavier alternative. Това е знание за Form transformation patterns.

---

# Section 5 — Configuring Connectors (Questions 33-36)

> Weight 6% • Topics: Inline secrets vs environment-resident, Connector timeouts levels, packaging, versioning across deployments.

---

## Question 33: Configuring Connectors (Weighting: 6%)

**Scenario:** A team developing a Connector wonders if they can **inline a secret value** (e.g., `apiKey: "actual-secret-value"`) in the BPMN for quick testing, vs always going through cluster secrets (`{{secrets.API_KEY}}`).

**Is it OK to inline secrets in BPMN for development?**

- **a)** **No — never inline secrets in BPMN, even for development**. BPMN files are typically committed to Git, deployed to clusters, shared with team members; inlining a secret leaks it to: (1) version control history (hard to scrub even after removal); (2) deployment artifacts; (3) any reader of the file. Best practice: ALWAYS use cluster secrets via `{{secrets.NAME}}` placeholders; for dev environments, provision **dev-specific secrets** with non-production values (test API keys, sandbox accounts). The same pattern as production; just different secret values per environment. Documentation: [Connector Secrets](https://docs.camunda.io/docs/components/console/manage-clusters/manage-secrets/)

- **b)** Yes for dev, no for production — partial; even dev leakage is risky. Documentation: [Connector Secrets](https://docs.camunda.io/docs/components/console/manage-clusters/manage-secrets/)

- **c)** Yes if encrypted — partial; better than plain but cluster secrets simpler + standard. Documentation: [Connector Secrets](https://docs.camunda.io/docs/components/console/manage-clusters/manage-secrets/)

- **d)** Only secrets in BPMN — wrong; cluster secrets best practice. Documentation: [Connector Secrets](https://docs.camunda.io/docs/components/console/manage-clusters/manage-secrets/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Inlining secrets in BPMN is a **persistent security risk**:
  - **Git history**: even if you remove the secret later, Git keeps the entire history; the secret is recoverable from earlier commits.
  - **Shared files**: BPMN files are shared via Web Modeler, exported as ZIP for backup, included in CI artifacts, etc. — many touchpoints for leakage.
  - **Audit / compliance**: secret-in-file violates most security policies.

  Always use cluster secrets:
  - **Production**: real production secrets in production cluster.
  - **Dev**: dev-specific secrets in dev cluster (non-production credentials, sandbox accounts).
  - **CI**: secrets from CI provider (GitHub Actions secrets, GitLab CI variables, Vault).

  BPMN files contain only `{{secrets.NAME}}` placeholders — safe to commit, share, deploy.

  Migration: if a secret was accidentally committed, rotate the credential immediately (revoke + issue new), scrub Git history (carefully — easy to mess up), audit downstream usage.

- **Option b) — Partial.** Dev leakage also risky.

- **Option c) — Partial.** Cluster secrets simpler standard.

- **Option d) — Wrong.** Cluster secrets best practice.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Never inline secrets; always use cluster secrets via {{secrets.NAME}}.
- **b) 4/10** — partial; even dev risky.
- **c) 5/10** — partial; cluster secrets simpler.
- **d) 1/10** — wrong; cluster secrets standard.

**Correct Answer:** Never inline secrets in BPMN; use cluster secrets via `{{secrets.NAME}}` placeholders even in dev.

**Official Documentation Link:** https://docs.camunda.io/docs/components/console/manage-clusters/manage-secrets/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "inline secret for dev." Secret management.

**Въпросът → Solution Framing.** "OK to inline" — изпитва се knowledge на security best practices.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че inline leaks via Git / shares / artifacts, че cluster secrets are the standard, че dev-specific secrets handle dev needs. Това е знание за secret management.

---

## Question 34: Configuring Connectors (Weighting: 6%)

**Scenario:** A team's Outbound HTTP Connector calls a slow partner API. Sometimes it takes 30+ seconds. They want to set timeouts at multiple levels and understand the relationship.

**What timeouts exist around a Connector call, and how do they interact?**

- **a)** **Multiple timeout layers**:
  1. **Connector-internal timeout** (HTTP client level): how long the Connector waits for the HTTP response before giving up. Typically configured in the Connector's properties (e.g., `connectionTimeout`, `readTimeout`). On timeout, Connector reports failure.
  2. **Job activation timeout** (Zeebe / worker level): how long the worker holds the activated job. If the worker (Connector Runtime) doesn't complete / fail / handle by this time, Zeebe re-activates the job (potential duplicate execution).
  3. **Process-level timeout** (BPMN Timer Boundary on the Service Task): if the entire task takes too long, the Timer Boundary fires and routes elsewhere.

  Set them with awareness:
  - HTTP timeout < Job activation timeout < Timer Boundary timeout.
  - Otherwise duplicate executions or premature cancellations.
  
  Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/) + [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Only one timeout layer — incorrect; multiple. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Timeouts auto-coordinate — incorrect; configure manually. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** No timeouts at all — incorrect; multiple available. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Three timeout layers around a Connector call:

  **1. Connector-internal (HTTP client level)**
  - Where: configured in the Connector's properties (HTTP Connector: `connectionTimeout`, `readTimeout`; other Connectors: their own settings).
  - Scope: how long the Connector waits for the external system to respond.
  - On timeout: Connector reports failure to Zeebe.

  **2. Job activation timeout (Zeebe / Connector Runtime level)**
  - Where: Spring Zeebe `@JobWorker(timeout = ...)` or equivalent in the Connector Runtime.
  - Scope: how long Zeebe waits for the worker to handle the job before re-activating.
  - On timeout (worker not responding): Zeebe re-activates the job; if the original worker still processes when re-activated, you have duplicate execution.

  **3. Process-level (Timer Boundary on Service Task)**
  - Where: BPMN — attach Interrupting Timer Boundary to the Service Task.
  - Scope: how long the entire task is allowed before BPMN intervenes.
  - On timeout: Boundary cancels the task; flow routes to handler.

  **Correct ordering** (to avoid issues):
  - `Connector HTTP timeout` < `Job activation timeout` < `Timer Boundary timeout`.
  - HTTP timeout fires first → Connector reports failure → Zeebe processes failure normally.
  - If HTTP > job activation: worker re-activated while still processing → duplicate.
  - If Timer Boundary < job activation: task cancelled while worker still active → orphan worker.

  Tune based on expected response times + safety margins.

- **Option b) — Wrong.** Multiple.

- **Option c) — Wrong.** Manual.

- **Option d) — Wrong.** Available.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Three layers: HTTP / job activation / Timer Boundary; order them correctly.
- **b) 2/10** — wrong; multiple.
- **c) 2/10** — wrong; manual.
- **d) 1/10** — wrong; available.

**Correct Answer:** Three layers — Connector HTTP timeout, job activation timeout, Timer Boundary; order them HTTP < activation < Boundary.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "timeouts at multiple levels", "relationship." Multi-level timeout.

**Въпросът → Solution Framing.** "Timeouts and interaction" — изпитва се knowledge на timeout layers.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че 3 layers exist, че order matters (HTTP < activation < Boundary), че mis-ordering causes duplicates / orphans. Това е знание за multi-level timeout coordination.

---

## Question 35: Configuring Connectors (Weighting: 6%)

**Scenario:** A team builds a custom Java Connector. They debate **packaging**: uber-JAR (all dependencies bundled), thin library JAR (dependencies external), Spring Boot application, Docker container.

**What's the recommended packaging for custom Connectors?**

- **a)** **Depends on deployment model**:
  - **Java JAR (uber-JAR or thin)**: built using Connector SDK Maven plugin or similar. Uploaded to the Connector Runtime (where deployed). The Runtime loads the JAR and registers the Connector. Most common for self-managed Connector Runtimes.
  - **Spring Boot application**: a full Connector Runtime application bundled with custom Connectors. Run as a process; manages its own lifecycle.
  - **Docker container**: deploy the Connector Runtime + custom Connectors as a containerised service; common in Kubernetes deployments.

  For most cases: build as JAR + deploy to existing Connector Runtime (the Camunda-managed one in SaaS, or your own in SM). Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/) + [Connector Runtime](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/)

- **b)** Always Docker — overstates; JAR usually simpler. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** Always Spring Boot app — partial; depends on deployment model. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **d)** No packaging needed — wrong; built artifact required. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Connector packaging depends on the Connector Runtime deployment model:

  **JAR upload to existing Connector Runtime**:
  - Most common pattern. Build with Maven (Camunda provides Connector SDK Maven plugin).
  - Resulting JAR deployed to a Connector Runtime that's already running (SaaS-managed or SM self-hosted).
  - Runtime hot-reloads or restarts to register the new Connector.
  - Pros: simple deployment; lightweight.
  - Cons: depends on the Runtime's compatibility / availability.

  **Spring Boot application** (custom Connector Runtime):
  - The team runs their own Connector Runtime application bundling their custom Connectors.
  - More control; isolated from Camunda's runtime updates.
  - More operational burden (lifecycle, scaling, monitoring).

  **Docker container**:
  - Containerised Connector Runtime (with custom Connectors) for Kubernetes / cloud deployments.
  - Combines the Spring Boot model with container infrastructure benefits.

  Decision matrix:
  - **Most teams**: build JAR; deploy to existing Runtime. Simplest.
  - **Specific Java versions / heavy custom logic / many internal libraries**: custom Spring Boot Connector Runtime.
  - **Containerised infra**: Docker / Kubernetes deployment.

  Verify Camunda's docs for the supported packaging formats in your version.

- **Option b) — Overstates.** JAR simpler often.

- **Option c) — Partial.** JAR-to-Runtime more common.

- **Option d) — Wrong.** Packaging required.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. JAR to Runtime / Spring Boot app / Docker — pick by deployment model.
- **b) 4/10** — overstates.
- **c) 5/10** — partial.
- **d) 1/10** — wrong; needed.

**Correct Answer:** Depends on deployment — JAR to existing Connector Runtime (common), Spring Boot Runtime (custom), Docker container (Kubernetes).

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "packaging custom Connector." Build artefact format.

**Въпросът → Solution Framing.** "Recommended packaging" — изпитва се knowledge на Connector deployment options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че JAR-to-Runtime е common, че Spring Boot / Docker са options for specific needs, че choice depends on infrastructure. Това е знание за Connector packaging.

---

## Question 36: Configuring Connectors (Weighting: 6%)

**Scenario:** A team's custom Connector has 5 deployed versions in their cluster's Connector Runtime. Different BPMN processes use different versions. They wonder how Connector versioning works.

**How are Connector versions managed across deployments?**

- **a)** **Connector definitions** can have versions tracked at the runtime / Connector Runtime level. **BPMN Element Templates** reference a specific Connector + version (via the template's JSON metadata). When a process is modeled with a specific template version, the template embeds version metadata in the BPMN. Runtime resolution: the Connector Runtime invokes the Connector version specified by the template. Versioning enables:
  - **Coexistence**: multiple versions of the same Connector deployed simultaneously.
  - **Gradual rollout**: deploy v2; some BPMN models use it; others continue on v1.
  - **Rollback**: revert specific BPMN models to older Connector version if v2 has issues.
  
  Verify your Connector SDK / Runtime version's specific versioning semantics. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** Only one version supported at a time — incorrect; multiple supported. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Versions auto-upgrade for all BPMN — wrong; explicit references via templates. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **d)** Versioning not supported for Connectors — incorrect; supported. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Connector versioning involves multiple layers:

  **Connector Runtime level**:
  - The Runtime can host multiple versions of the same Connector simultaneously (where supported).
  - Each version has its own implementation JAR / package.

  **Element Template level**:
  - Each version of a Connector typically has its own Element Template (or template versions).
  - The template's JSON metadata includes the Connector identifier + version.

  **BPMN model level**:
  - When a modeler applies a template to a Service Task, the template's metadata is embedded in the BPMN.
  - The BPMN at deployment carries the Connector + version reference.

  **Runtime resolution**:
  - When a Service Task with this metadata activates, Connector Runtime routes to the matching Connector version.

  Versioning enables:
  - **Coexistence**: deploy v2 alongside v1; modelers continue using v1 templates until ready to switch.
  - **Gradual rollout**: new templates use v2; old ones continue on v1.
  - **A/B testing**: different processes use different versions.
  - **Rollback**: switch back to v1 if v2 has issues.

  Camunda's specific Connector versioning semantics vary by SDK / Runtime version; verify the docs.

- **Option b) — Wrong.** Multiple supported.

- **Option c) — Wrong.** Explicit references.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multi-layer versioning: Runtime hosts multiple, templates reference specific, BPMN embeds reference.
- **b) 2/10** — wrong; multiple supported.
- **c) 2/10** — wrong; explicit.
- **d) 1/10** — wrong; supported.

**Correct Answer:** Connector versions tracked at Runtime + referenced via Element Templates + embedded in BPMN; enables coexistence and gradual rollout.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "5 deployed Connector versions", "different processes use different." Connector versioning.

**Въпросът → Solution Framing.** "How versions managed" — изпитва се knowledge на Connector versioning architecture.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Runtime hosts multiple, че Element Templates reference, че BPMN embeds, че coexistence + rollback enabled. Това е знание за Connector versioning.

---

# Section 6 — Extensions & Integrations (Questions 37-50)

> Weight 25% • Topics: FEEL abs / power / coalesce-workaround / upper case, Spring Zeebe @ZeebeWorker vs @JobWorker, Node SDK retry config, zbctl scripting, Camunda Identity scopes, Connector unit testing, Inbound health, RPA on-prem vs cloud, FEEL string-to-date edge, null propagation, gRPC connection pooling.

---

## Question 37: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression computes absolute value: `abs(-15.5)` → 15.5. The team wonders if FEEL has an `abs()` function.

**Which FEEL built-in returns absolute value?**

- **a)** `abs(n)` — FEEL numeric built-in. Returns absolute value (sign stripped). Works on numbers and durations. `abs(-15.5)` = 15.5; `abs(duration("-P5D"))` = `P5D`. Documentation: [FEEL numeric](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/)

- **b)** `Math.abs(n)` — JS reflex; FEEL uses bare `abs`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `if n < 0 then -n else n` — manual; works but `abs()` direct. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** No abs in FEEL — incorrect; built-in. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `abs(n)` returns absolute value. Works on:
  - **Numbers**: `abs(-15.5)` = 15.5; `abs(0)` = 0; `abs(15.5)` = 15.5.
  - **Days-and-time durations**: `abs(duration("-P5D"))` = `P5D`.
  - **Years-and-months durations**: same idea.

  Other FEEL numeric built-ins:
  - `floor`, `ceiling`, `round half even`, `round up`, `round down`, `round half up`: rounding variants.
  - `decimal(n, scale)`: round to specific scale.
  - `min`, `max`, `mean`, `median`, `mode`, `stddev`, `sum`, `product`: aggregations.
  - `power`, `sqrt`, `exp`, `log`, `modulo`: math functions.
  - `even`, `odd`: parity.

  Combine for expressions: `abs(actual - expected) > tolerance` (tolerance comparison), `floor(abs(n))` (rounded absolute), etc.

- **Option b) — JS reflex.** Bare `abs`.

- **Option c) — Manual.** Direct function.

- **Option d) — Wrong.** Built-in.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. abs(n) returns absolute value; works on numbers and durations.
- **b) 2/10** — JS reflex.
- **c) 4/10** — manual; reinvents.
- **d) 1/10** — wrong; built-in.

**Correct Answer:** abs(n) — FEEL numeric built-in.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "absolute value." Math built-in.

**Въпросът → Solution Framing.** "Built-in для abs" — изпитва се FEEL math vocabulary.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че abs() е FEEL built-in, че works on numbers + durations, че FEEL has rich math functions. Това е знание за FEEL math.

---

## Question 38: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression computes compound interest exponent: base `1.05` to the power of 10 years. They wonder about exponentiation.

**Which FEEL built-in computes power / exponentiation?**

- **a)** `power(base, exponent)` — FEEL built-in for exponentiation. `power(1.05, 10)` ≈ 1.628. Standard math function. Companion: `sqrt(n)` for square root, `exp(n)` for `e^n`, `log(n)` for natural log. Documentation: [FEEL numeric](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/)

- **b)** `base ** exponent` — Python / JS reflex; FEEL uses `power()` function. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `pow(base, exponent)` — JS reflex; FEEL uses `power`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Manual multiplication loop — works for small integer exponents but tedious. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL `power(base, exponent)` is the exponentiation function. Standard usage:
  - `power(2, 10)` = 1024.
  - `power(1.05, 10)` ≈ 1.629 (5% compound growth over 10 periods).
  - `power(10, -2)` = 0.01.
  - `power(2, 0.5)` ≈ 1.414 (square root of 2; though `sqrt(2)` is direct).

  Related math functions:
  - `sqrt(n)`: square root. Equivalent to `power(n, 0.5)`.
  - `exp(n)`: natural exponential, `e^n`.
  - `log(n)`: natural logarithm (verify FEEL version — some implementations use `log(n, base)` for arbitrary base).
  - `modulo(divisor, dividend)`: remainder; or `dividend mod divisor`.

  Use cases: financial calculations (compound interest, present value), exponential decay / growth models, polynomial expressions.

- **Option b) — Python / JS reflex.** Function form.

- **Option c) — JS reflex.** FEEL uses `power`.

- **Option d) — Tedious.** Direct function.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. power(base, exponent) FEEL built-in.
- **b) 2/10** — Python reflex.
- **c) 3/10** — JS reflex.
- **d) 3/10** — tedious.

**Correct Answer:** power(base, exponent).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "compound interest exponent." Math function.

**Въпросът → Solution Framing.** "Built-in for power" — изпитва се FEEL math vocabulary.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че power() е FEEL function, че `**` / `pow()` са JS / Python reflex. Това е знание за FEEL math functions.

---

## Question 39: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression needs `coalesce` behaviour — return the first non-null value from a list of candidates. E.g., return `customer.preferredEmail`, else `customer.primaryEmail`, else `"unknown@example.com"`. They wonder if FEEL has `coalesce()`.

**Does FEEL have a built-in coalesce function (first-non-null)?**

- **a)** **FEEL doesn't have a built-in `coalesce()`** function per the standard. Workarounds:
  - **Nested if-then-else**: `=if customer.preferredEmail != null then customer.preferredEmail else if customer.primaryEmail != null then customer.primaryEmail else "unknown@example.com"` — verbose but explicit.
  - **`or` with default**: in some FEEL implementations, `null or X` might return X (verify behaviour).
  - **Custom helper function**: define via Boxed Function Expression in DMN: `function(a, b, c) { if a != null then a else if b != null then b else c }`.
  
  For multi-candidate fallback, nested if-then-else is the standard approach. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** Yes — `coalesce(a, b, c)` built-in — invented; not standard FEEL. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Use `firstNonNull()` — invented function name. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** FEEL doesn't allow null fallback — incorrect; workarounds exist. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL spec doesn't include a coalesce / firstNonNull function. Workarounds:

  **Pattern 1: Nested if-then-else** (canonical):
  ```
  =if a != null
    then a
    else if b != null
      then b
      else if c != null
        then c
        else "default"
  ```
  Verbose for many candidates but explicit and readable.

  **Pattern 2: List + filter + first** (for many candidates):
  ```
  =[item in [a, b, c, "default"] : item != null][1]
  ```
  Filter the list keeping non-nulls; take the first.

  **Pattern 3: Custom BKM** (in DMN context):
  Define a Boxed Function Expression as a reusable helper.

  **Pattern 4: `or` operator** (caveat — depends on FEEL implementation; verify):
  Some implementations let `a or b` return `b` when `a` is null/false; not portable.

  Standard recommendation: use Pattern 1 (nested if) for clarity, Pattern 2 for many candidates with a clear list.

- **Option b) — Invented.** Not standard.

- **Option c) — Invented.** Not standard.

- **Option d) — Wrong.** Workarounds exist.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. No native coalesce; use nested if-then-else or filter+first patterns.
- **b) 2/10** — invented.
- **c) 1/10** — invented.
- **d) 1/10** — wrong; workarounds.

**Correct Answer:** No native coalesce; use nested if-then-else or filter+first pattern for null fallback.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "coalesce behaviour", "first non-null." Null fallback pattern.

**Въпросът → Solution Framing.** "FEEL coalesce" — изпитва се knowledge на FEEL null handling.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че няма native coalesce, че nested if + filter+first са patterns, че BKM defines reusable helper. Това е знание за FEEL null patterns.

---

## Question 40: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression normalises customer names: convert to lowercase, then capitalise first letter. The team wonders about FEEL string functions.

**Which FEEL string built-ins handle case conversion?**

- **a)** **`upper case(s)`** (all uppercase), **`lower case(s)`** (all lowercase). For "Title Case" / capitalise (first letter uppercase, rest lowercase) FEEL **doesn't have a single built-in** — combine: `=upper case(substring(s, 1, 1)) + lower case(substring(s, 2))`. Or use `replace` with regex for word boundaries. Verify your FEEL version for any added title-case functions. Documentation: [FEEL string](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/)

- **b)** `toUpperCase()` / `toLowerCase()` — JS / Java reflex. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** `capitalize(s)` built-in for title case — invented. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** No case conversion in FEEL — incorrect; supported. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL string built-ins for case:
  - **`upper case(s)`**: returns string converted to uppercase. Note FEEL's space-separated name.
  - **`lower case(s)`**: returns string converted to lowercase.

  For more complex case manipulations:
  - **Title case** (capitalise first letter of each word): not a single built-in; compose with `substring`, `upper case`, `lower case`, and possibly `split` + `string join` + map operations.
  - **First-letter-upper-rest-lower**: `=upper case(substring(s, 1, 1)) + lower case(substring(s, 2))` (assuming s is non-empty).

  Example for full title case:
  ```
  =string join(
    [w in split(s, " ") :
      upper case(substring(w, 1, 1)) + lower case(substring(w, 2))
    ],
    " "
  )
  ```

  Use cases:
  - **Normalisation for comparison**: `lower case(a) = lower case(b)` for case-insensitive match.
  - **Display formatting**: convert user input to standard case for display.

- **Option b) — JS / Java reflex.** Method-call syntax.

- **Option c) — Invented.** No `capitalize` built-in.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. upper case / lower case built-ins; title case via composition.
- **b) 2/10** — JS / Java reflex.
- **c) 2/10** — invented.
- **d) 1/10** — wrong.

**Correct Answer:** `upper case(s)` and `lower case(s)`; title case via composition (substring + upper case + lower case).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-string/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "case conversion", "capitalise first letter." String case ops.

**Въпросът → Solution Framing.** "Built-ins for case" — изпитва се FEEL string vocabulary.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че upper case / lower case са built-ins, че title case requires composition, че FEEL uses space-separated function names. Това е знание за FEEL case conversion.

---

## Question 41: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team migrating from older Spring Zeebe versions sees `@ZeebeWorker` annotations in legacy code, and newer code uses `@JobWorker`. They wonder about the difference.

**What's the difference between `@ZeebeWorker` and `@JobWorker` in Spring Zeebe?**

- **a)** **`@ZeebeWorker` is the legacy annotation** (older Spring Zeebe versions); **`@JobWorker` is the modern annotation**. Functionally similar — both mark a method as a job handler subscribed to a task type. Migration: replace `@ZeebeWorker` with `@JobWorker`; attributes may have renamed (verify migration docs). Spring Zeebe deprecates / removes the legacy annotation in newer versions. For new code, always use `@JobWorker`. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** They're identical aliases — partial; functionally similar but `@JobWorker` is the current canonical. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** `@ZeebeWorker` is for Zeebe gRPC only — wrong; both work for Zeebe. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** Different features — wrong; functionally similar. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Spring Zeebe evolved its annotation naming:
  - **`@ZeebeWorker`** (legacy): the original annotation in older Spring Zeebe versions.
  - **`@JobWorker`** (modern): renamed in later versions; aligned with the abstract "job" concept (a job in Zeebe is what a worker handles).

  Migration:
  - Replace `@ZeebeWorker` with `@JobWorker`.
  - Attributes (type, retries, autoComplete, etc.) carried over; verify per migration docs for any renamed parameters.
  - The legacy annotation may be deprecated or removed in newer Spring Zeebe versions.

  For new code: always use `@JobWorker`. For legacy code being migrated: update the annotation as part of the migration.

  Practical scope (per docs evolution):
  - Both subscribe to a Zeebe task type and handle activated jobs.
  - Both support similar configuration (type, timeout, autoComplete, fetchVariables, etc.).
  - Implementation details differ slightly between Spring Zeebe versions; verify per version.

- **Option b) — Partial.** Modern naming.

- **Option c) — Wrong.** Both for Zeebe.

- **Option d) — Wrong.** Functionally similar.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. @ZeebeWorker legacy; @JobWorker modern; functionally similar; migrate to @JobWorker.
- **b) 6/10** — partial; modern naming.
- **c) 2/10** — wrong; both Zeebe.
- **d) 2/10** — wrong; similar.

**Correct Answer:** @ZeebeWorker is legacy; @JobWorker is the modern annotation; functionally similar; use @JobWorker for new code.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "@ZeebeWorker legacy vs @JobWorker modern." Annotation evolution.

**Въпросът → Solution Framing.** "Difference" — изпитва се knowledge на Spring Zeebe versioning.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че @ZeebeWorker е legacy, че @JobWorker е modern, че functionally similar but migrate to @JobWorker. Това е знание за Spring Zeebe migration.

---

## Question 42: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Node.js worker handles `process-payment`. The team wants the worker to **retry transient HTTP errors** automatically (e.g., 503) before reporting failure to Zeebe.

**Where does retry-on-transient-error logic typically live in a Node SDK worker?**

- **a)** **Inside the worker's handler code** — implement retry logic using a library (`axios-retry`, `got` with retry, manual `for` loop with backoff). Distinguish transient (HTTP 5xx, network) from permanent (HTTP 4xx, validation) errors; retry transients up to N times with backoff; on permanent or exhaustion, report failure to Zeebe (`job.error()` or `job.fail()`). **Combining with BPMN retries**: BPMN's `retries` count applies on top — if worker exhausts internal retries AND reports failure, BPMN retries can re-activate (each re-activation re-runs worker's internal retry loop). Be mindful of total retry count and time. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/) + [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** SDK auto-retries on all errors — partial; default behaviour varies. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **c)** Use BPMN retries exclusively — workable but less flexible than worker-internal retry. Documentation: [Service Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Retry not possible — wrong; multiple layers possible. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Retry logic typically lives in the worker's handler code:
  - **HTTP libraries with retry support**: `axios-retry`, `got` (built-in retry config), `fetch` with retry wrappers. Configure retry count, backoff, retry-on conditions.
  - **Manual loop**: `for i in 1..maxRetries: try call; if success return; if transient, wait + retry; if permanent, fail.`
  - **Distinguish error types**: transient (5xx, network errors, rate limiting) vs permanent (4xx, validation errors, business rule violations). Only retry transients.

  Example:
  ```javascript
  async function processPayment(job) {
    for (let i = 1; i <= 3; i++) {
      try {
        const result = await callPaymentAPI(job.variables);
        return { paymentResult: result };
      } catch (e) {
        if (isTransient(e) && i < 3) {
          await sleep(1000 * i); // Linear backoff
          continue;
        } else if (isPermanent(e)) {
          await job.error({ errorCode: "PAYMENT_REJECTED", errorMessage: e.message });
          return;
        } else {
          throw e; // Let SDK / Zeebe fail the job
        }
      }
    }
  }
  ```

  **Combine with BPMN retries**: BPMN-level retries (e.g., `retries = 3`) provide an additional safety net. If the worker exhausts its internal 3 retries and reports failure, BPMN's 3 retries kick in (each re-activates the worker, which retries internally 3 more times). Total: up to 9 attempts. Be aware of total time / load implications.

- **Option b) — Partial.** SDK default varies.

- **Option c) — Workable but less flexible.** Worker-internal more granular.

- **Option d) — Wrong.** Multiple layers.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Retry logic in worker; distinguish transient vs permanent; combine with BPMN retries.
- **b) 4/10** — partial; SDK default varies.
- **c) 5/10** — workable но less flexible.
- **d) 1/10** — wrong; multiple layers.

**Correct Answer:** Implement retry in the worker handler (via library or manual loop); distinguish transient vs permanent; combine with BPMN retries for layered safety.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/node-js-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "retry transient HTTP errors". Worker retry pattern.

**Въпросът → Solution Framing.** "Where retry lives" — изпитва се knowledge на retry architecture.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че worker-internal retry handles transient, че distinguish error types matter, че BPMN retries compose. Това е знание за multi-layer retry.

---

## Question 43: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team scripts zbctl in a CI pipeline. They want to **parse the output** programmatically — e.g., extract the deployed process definition's key for downstream automation.

**How can zbctl output be parsed in shell scripts?**

- **a)** **zbctl supports `--json` flag (or equivalent)** to output structured JSON instead of human-readable text. Pipe to `jq` (JSON parser CLI) for field extraction. Example: `zbctl deploy --resourceFile process.bpmn --json | jq '.deployments[0].processDefinition.processDefinitionKey'`. JSON output is stable / parseable; text output may evolve cosmetically across versions. Verify the exact JSON flag name in your zbctl version. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/)

- **b)** Only human-readable text — incorrect; structured output options exist. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/)

- **c)** zbctl can't be scripted — incorrect; CI-friendly. Documentation: [zbctl](https://docs.camunda.io/docs/apis-tools/cli-client/)

- **d)** Use REST API directly — workable alternative; both supported. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** zbctl CLI tools typically support structured output formats for scripting:
  - **JSON output flag** (e.g., `--json` or `--output json`): emit JSON instead of human-readable text.
  - **Parse with `jq`** (or other JSON tools): extract specific fields.
  - **Stable contract**: JSON schema is more stable across zbctl versions than text formatting.

  Example CI workflow:
  ```bash
  # Deploy and capture the process definition key
  PROCESS_KEY=$(zbctl deploy --resourceFile process.bpmn --json | \
                jq -r '.deployments[0].processDefinition.processDefinitionKey')
  echo "Deployed process key: $PROCESS_KEY"
  
  # Use for downstream
  zbctl create instance --processDefinitionKey $PROCESS_KEY --variables '{"orderId": "ORD-123"}'
  ```

  Alternative: use the **REST API** directly with `curl + jq` — equivalent functionality without zbctl. Some teams prefer REST for CI to avoid an extra binary dependency.

  Verify your zbctl version's specific flags and JSON schema.

- **Option b) — Wrong.** Structured output exists.

- **Option c) — Wrong.** CI-friendly.

- **Option d) — Alternative.** Both supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. zbctl --json flag + jq for parsing.
- **b) 1/10** — wrong; structured output.
- **c) 1/10** — wrong; CI-friendly.
- **d) 7/10** — alternative; valid path.

**Correct Answer:** zbctl supports JSON output (e.g., --json); pipe to jq for parsing.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/cli-client/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "parse zbctl output programmatically." Scripting integration.

**Въпросът → Solution Framing.** "How parsed in shell" — изпитва се knowledge на zbctl scripting flags.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че zbctl supports JSON output, че jq parses, че REST API е alternative. Това е знание за CLI scripting.

---

## Question 44: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team's Camunda Identity (or SaaS Identity) has multiple API clients. Each client should have **specific access scopes** — one for read-only Operate access, one for full Zeebe writes, etc.

**How are API client scopes / permissions managed in Camunda Identity?**

- **a)** **Identity manages scopes / permissions per API client**:
  - **Scopes** define what an API client can do — e.g., `read:process-instances`, `write:process-instances`, `evaluate:decisions`, `read:tasks`.
  - **Provision client + assign scopes** in Identity / Console UI.
  - **Token issuance**: when the client requests a token via OAuth2, the token carries its assigned scopes.
  - **API enforcement**: each API endpoint checks the token's scopes; rejects if missing.
  
  Specific scope names / granularity vary by Camunda version; verify the docs. Documentation: [Camunda Identity](https://docs.camunda.io/docs/self-managed/identity/) + [Authentication](https://docs.camunda.io/docs/guides/setup-client-connection-credentials/)

- **b)** All clients have full access — wrong; least-privilege via scopes. Documentation: [Identity](https://docs.camunda.io/docs/self-managed/identity/)

- **c)** Scopes only for OAuth2 metadata — partial; scopes are enforced. Documentation: [Identity](https://docs.camunda.io/docs/self-managed/identity/)

- **d)** No granular permissions — wrong; supported. Documentation: [Identity](https://docs.camunda.io/docs/self-managed/identity/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda Identity (and SaaS Identity / Console) implements scope-based access control:
  - **Scopes** define what an API client can do, granularly:
    - Read scopes: `read:process-instances`, `read:tasks`, `read:decisions`, etc.
    - Write scopes: `write:process-instances`, `write:tasks`, etc.
    - Admin scopes: cluster management, etc.
  - **API clients are provisioned in Identity / Console**:
    - Create the client.
    - Assign the scopes (least-privilege: only what the client needs).
    - Generate client credentials (client ID + secret).
  - **OAuth2 token**:
    - Client requests token; specifies scopes (or accepts default for the client).
    - Token issued with assigned scopes.
    - APIs verify token's scopes before processing.

  Best practice: **least privilege** — each client / service gets only the scopes it actually needs. Read-only services don't get write scopes. Audit clients periodically.

  Specific scope names + granularity evolve across Camunda versions and editions; verify per docs.

- **Option b) — Wrong.** Least-privilege.

- **Option c) — Partial.** Enforced.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Scopes per API client; assign in Identity; enforce on APIs; least-privilege.
- **b) 2/10** — wrong; least-privilege.
- **c) 4/10** — partial; enforced.
- **d) 1/10** — wrong; supported.

**Correct Answer:** Scopes managed per API client in Identity / Console; tokens carry scopes; APIs enforce.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/identity/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "API client scopes / permissions." Identity scope management.

**Въпросът → Solution Framing.** "How scopes managed" — изпитва се knowledge на Identity access control.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че scopes са per-client, че OAuth2 tokens carry scopes, че least-privilege е best practice. Това е знание за Identity scope architecture.

---

## Question 45: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team builds a custom Connector. They want to **write unit tests** for the Connector's `execute()` method — verify behaviour given various inputs without needing a live Zeebe cluster.

**Does the Connector SDK provide test utilities?**

- **a)** **Yes — Connector SDK provides test utilities** (typically a "test" or "testing" module / artifact) that allows running Connector functions in unit tests:
  - **Mock OutboundConnectorContext** (or InboundConnectorContext): create a context with test inputs / secrets / variables.
  - **Call `execute()`** directly with the mock context.
  - **Assert** outputs / side effects.
  - **JUnit / Jest / standard testing frameworks** apply.
  
  This enables fast feedback during Connector development without deploying to a Camunda cluster. Documentation: [Connector SDK testing](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** No test support — incorrect; SDK includes test utilities. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** Only via integration tests against a cluster — partial; integration tests valuable, unit tests faster. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **d)** Test utilities only for Inbound — wrong; both directions. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Connector SDK provides test utilities to support TDD / unit testing of Connectors. Typical pattern (Java):

  ```java
  @Test
  void testHttpConnectorExecute() {
    var connector = new MyHttpConnector();
    var context = new MockOutboundConnectorContext(
      Map.of("url", "https://example.com/api",
             "method", "POST",
             "body", "{\"foo\":\"bar\"}"),
      Map.of("API_KEY", "test-secret-value") // mock secrets
    );
    
    var result = connector.execute(context);
    
    assertThat(result.getStatusCode()).isEqualTo(200);
    assertThat(result.getBody()).contains("expected response");
  }
  ```

  Benefits:
  - **Fast feedback** during development.
  - **Coverage**: test edge cases (invalid input, mocked partner failures, etc.).
  - **CI**: integrate into normal test pipeline.
  - **No cluster required**: unit-level isolation.

  Combine with integration tests (against a real Camunda cluster) for end-to-end verification of Connector + BPMN integration.

  For Inbound Connectors, similar test utilities exist for testing the `activate` lifecycle and event correlation.

- **Option b) — Wrong.** Test utilities exist.

- **Option c) — Partial.** Integration tests valuable; unit tests faster.

- **Option d) — Wrong.** Both directions.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. SDK provides test utilities (MockContext); unit-test Connector functions.
- **b) 1/10** — wrong; exists.
- **c) 5/10** — partial; integration valuable too.
- **d) 2/10** — wrong; both.

**Correct Answer:** Yes — Connector SDK provides test utilities (MockContext) for unit-testing Connector functions.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "unit tests for Connector". Connector TDD.

**Въпросът → Solution Framing.** "Test utilities" — изпитва се knowledge на Connector SDK testing support.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SDK provides MockContext, че fast feedback enables, че integration tests complement. Това е знание за Connector testing.

---

## Question 46: Extensions & Integrations (Weighting: 25%)

**Scenario:** Ops wants to monitor an **Inbound Connector's health** — verify it's still listening for events, has correct subscription state, recent error rate. They want metrics / observability.

**Where does Inbound Connector observability come from?**

- **a)** **Connector Runtime exposes metrics / logs** for Inbound Connectors:
  - **Subscription health**: which Connectors are actively subscribed; their last-active timestamps.
  - **Event throughput**: events received / correlated per second per Connector.
  - **Error rate**: failures (auth errors, parse errors, correlation failures).
  - **Latency**: time from external event to BPMN correlation.
  
  Scrape via Prometheus / Grafana for visualisation; alert on subscription staleness, error spikes. **Per-instance Operate visibility**: processes started by an Inbound Connector show the trigger source in their history. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/) + [Operate](https://docs.camunda.io/docs/components/operate/)

- **b)** No monitoring — incorrect; observable. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Only via Operate UI — partial; Operate + Connector Runtime metrics. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Build custom monitoring — partial; built-in metrics available. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Inbound Connector observability comes from multiple layers:

  **Connector Runtime metrics** (Prometheus):
  - Subscription count + health: how many Inbound Connectors are subscribed; their state (active / failed / restarting).
  - Event throughput: events received per second per Connector.
  - Correlation success / failure rate: of received events, how many correlated successfully to BPMN.
  - Latency: external event → BPMN trigger latency.
  - Errors: auth failures, parse errors, downstream Zeebe errors.

  **Connector Runtime logs**:
  - Detailed events for debugging (event payloads, correlation attempts, errors with stack traces).

  **Operate**:
  - Process instances started by Inbound Connectors show in Operate.
  - The instance's history shows the trigger source.
  - Use Operate's filters to find Inbound-triggered instances.

  **Monitoring stack**:
  - Prometheus scrapes Connector Runtime metrics.
  - Grafana visualises dashboards (per-Connector throughput, subscription staleness, error rates).
  - Alerts on thresholds (subscription dropped > 5 min, error rate > 5%).
  - Log aggregation (ELK / Loki) for detailed debugging.

- **Option b) — Wrong.** Observable.

- **Option c) — Partial.** Multiple layers.

- **Option d) — Partial.** Built-in available.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Connector Runtime metrics + logs + Operate visibility combine.
- **b) 1/10** — wrong; observable.
- **c) 5/10** — partial; multiple sources.
- **d) 4/10** — partial; built-in available.

**Correct Answer:** Connector Runtime exposes Prometheus metrics + logs + Operate process-instance visibility.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "monitor Inbound Connector health." Connector observability.

**Въпросът → Solution Framing.** "Observability comes from" — изпитва се knowledge на Connector monitoring layers.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Connector Runtime exposes Prometheus metrics, че logs detail debugging, че Operate shows triggered instances. Това е знание за Connector observability stack.

---

## Question 47: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team running Camunda 8 SaaS wonders if **RPA** is also a SaaS-managed service or if they need to deploy their own RPA workers.

**Is Camunda RPA a SaaS-managed service or self-hosted?**

- **a)** **Depends on the offering**: RPA can be **deployed as self-hosted RPA workers** that the team manages (running on machines where they need to interact with desktop apps / private network resources) OR (in some Camunda offerings / partner integrations) **managed RPA infrastructure**. For Windows-desktop automation specifically, the worker typically runs on machines that have access to the target applications — usually self-hosted. For cloud-only automations (web app scraping, REST integrations), workers can run in cloud-managed environments. Verify Camunda's specific RPA offering details per version / tier. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **b)** Always SaaS-managed — incorrect; depends on automation target. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **c)** Always self-hosted — partial; cloud-managed options exist for some scenarios. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **d)** RPA not part of SaaS — incorrect; SaaS supports RPA. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda RPA architecture supports flexible deployment:

  **Self-hosted RPA workers** (typical for desktop automation):
  - The team deploys RPA workers on machines that need to interact with target applications.
  - For Windows desktop automations (SAP GUI, Excel macros, legacy Win32 apps), workers run on Windows machines with those apps installed.
  - For Linux-hosted web app automation, Linux workers with Selenium / Playwright.
  - The team manages the workers' lifecycle, security, network access.

  **Cloud-managed automation** (for some scenarios):
  - Some Camunda offerings / integrations provide cloud-managed RPA infrastructure.
  - Suitable for cloud-native automations (web app interactions, API integrations).
  - Trade-off: less control, more managed.

  **Hybrid**: SaaS-managed Camunda 8 (Zeebe + Operate + Tasklist + Web Modeler) + self-hosted RPA workers on the team's infrastructure for desktop interaction. RPA workers connect to the SaaS Camunda for subscription / job activation.

  The right answer for any specific team depends on:
  - **Automation targets**: desktop apps in private network → self-hosted; cloud APIs → either.
  - **Security / compliance**: data residency requirements may force self-hosting.
  - **Operational capacity**: managed services reduce ops burden.

- **Option b) — Wrong.** Depends.

- **Option c) — Partial.** Both options.

- **Option d) — Wrong.** SaaS supports.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Hybrid possible; self-hosted for desktop / private network; cloud-managed for some scenarios.
- **b) 2/10** — wrong; depends.
- **c) 5/10** — partial; cloud also.
- **d) 1/10** — wrong; SaaS supports.

**Correct Answer:** Depends on automation target — self-hosted workers for desktop / private; cloud-managed for some cloud-native scenarios.

**Official Documentation Link:** https://docs.camunda.io/docs/components/rpa/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "RPA SaaS or self-hosted." RPA deployment model.

**Въпросът → Solution Framing.** "SaaS-managed or self-hosted" — изпитва се knowledge на RPA architecture.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че RPA architecture flexible, че desktop automation typically self-hosted, че hybrid works (SaaS Camunda + self-hosted workers). Това е знание за RPA deployment.

---

## Question 48: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression parses a date from a string: `=date("not-a-date")` — what happens? Or `=date("2026-02-30")` (invalid date)?

**How does FEEL `date()` handle invalid input strings?**

- **a)** **`date(invalid string)` returns null** (or raises an error depending on FEEL implementation). For "not-a-date" the parser can't produce a date value; result is null or evaluation error. For "2026-02-30" (Feb has only 28/29 days), the parser may detect the invalid date and return null. **Best practice**: validate / sanitize date strings before passing to `date()`, or wrap in safe handling: `=if matches(s, "^\\d{4}-\\d{2}-\\d{2}$") and ... then date(s) else null`. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** Returns the closest valid date — incorrect; no auto-correction. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Returns today's date as default — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Auto-corrects to ISO format — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's `date(string)` constructor:
  - **Valid ISO 8601 date format** (e.g., `"2026-05-14"`): returns the parsed date.
  - **Invalid format / unparseable** (e.g., `"not-a-date"`, `"2026/05/14"` if FEEL strict about ISO `-`): returns null or evaluation error.
  - **Semantically invalid** (e.g., `"2026-02-30"`, `"2026-13-45"`): typically returns null (the parser detects logical impossibility).

  Behaviour varies per FEEL implementation; verify per Zeebe version. Some return null; some raise errors that propagate.

  Best practice for safe parsing:
  ```
  =if matches(dateString, "^[0-9]{4}-[0-9]{2}-[0-9]{2}$")
    then date(dateString)
    else null
  ```
  Or with downstream null check:
  ```
  =if date(dateString) != null
    then date(dateString) + duration("P30D")
    else date("2026-12-31")  // fallback
  ```

  For external input (form, API response), assume potentially-invalid input; validate / sanitize early.

  Related edge cases:
  - **Empty string**: `date("")` typically returns null or error.
  - **Null input**: `date(null)` typically propagates null per FEEL's null-tolerant semantics.

- **Option b) — Wrong.** No auto-correction.

- **Option c) — Wrong.** No today default.

- **Option d) — Wrong.** No auto-correction.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Invalid input → null or error; validate before parsing.
- **b) 1/10** — wrong; no auto-correction.
- **c) 1/10** — wrong; no default.
- **d) 1/10** — wrong; no auto-correction.

**Correct Answer:** date(invalid string) returns null (or raises error); validate before parsing.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "date(invalid string)", "date(2026-02-30)." Date parsing edge.

**Въпросът → Solution Framing.** "How handles invalid" — изпитва се knowledge на FEEL date parsing.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че invalid → null / error, че no auto-correction, че validate before parse. Това е знание за FEEL date parsing edge.

---

## Question 49: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression: `=customer.address.street + ", " + customer.address.city`. If `customer.address` is null, what happens?

**How does FEEL handle null propagation in nested expressions?**

- **a)** **FEEL is null-tolerant — operations on null typically return null**:
  - Accessing a field on null: `null.street` → null.
  - String concatenation with null: `null + ", " + null` → null.
  - **Whole expression evaluates to null** without throwing an error.
  - The downstream code receives null and should handle it.
  
  For safe defaults: `=if customer.address != null then customer.address.street + ", " + customer.address.city else "no address"`. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** Raises NullPointerException — JS / Java reflex; FEEL is null-tolerant. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Returns empty string — wrong; null. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** FEEL stops execution — wrong; null propagates. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's null-tolerant semantics:
  - **Field access on null**: `null.field` returns null (no NullPointerException).
  - **Arithmetic with null**: `null + 5` returns null.
  - **String concat with null**: `"text" + null` returns null.
  - **List operations with null**: similar — null typically propagates.
  - **Boolean operations**: `null and X`, `null or X` return null (three-valued logic).

  This means complex expressions with intermediate nulls evaluate to null without crashing. **Caveat**: the downstream code receives null and must handle appropriately. If a Gateway condition evaluates to null, the gateway may not behave as expected (typically the flow is taken or not based on null-handling rules).

  Best practices:
  - **Defensive checks** before risky access: `=if customer != null and customer.address != null then ...`.
  - **Default fallbacks**: `=if x != null then x else default`.
  - **Validate inputs** at process entry to ensure expected structure.

  Three-valued logic: null is neither true nor false; boolean expressions with null can produce null. FEEL handles this consistently.

- **Option b) — JS / Java reflex.** Null-tolerant.

- **Option c) — Wrong.** Null specifically.

- **Option d) — Wrong.** Continues.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL null-tolerant; null propagates through expressions; defensive checks recommended.
- **b) 1/10** — JS / Java reflex.
- **c) 2/10** — wrong; null specifically.
- **d) 1/10** — wrong; continues.

**Correct Answer:** FEEL is null-tolerant; null propagates through expressions; use defensive checks (`if X != null then ...`).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "customer.address is null", "null propagation." Null handling.

**Въпросът → Solution Framing.** "How handles null propagation" — изпитва се knowledge на FEEL null semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL null-tolerant, че operations на null return null, че defensive checks best practice. Това е знание за FEEL null semantics.

---

## Question 50: Extensions & Integrations (Weighting: 25%)

**Scenario:** A high-throughput worker maintains a long-lived gRPC connection to the Zeebe gateway. The team wonders about **connection pooling / reuse** in gRPC clients.

**Does the Zeebe gRPC client pool / reuse connections?**

- **a)** **Yes — gRPC clients pool connections** by design. A single gRPC `Channel` (Java) or equivalent multiplexes multiple requests over a single TCP connection (HTTP/2). The Zeebe SDK (Java, Node, Go) creates a Channel at initialisation and reuses it for all subsequent calls (job activations, completions, message publishes, etc.). **Connection reuse** is critical for performance — avoiding new TLS handshakes per call. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/) + [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** New connection per call — incorrect; HTTP/2 + pooling. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

- **c)** Pool size configurable per worker — partial; depends on client; typically auto-managed. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** Pooling not relevant — wrong; major performance factor. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** gRPC's underlying transport is HTTP/2, which natively multiplexes multiple streams over a single TCP connection. Zeebe SDKs leverage this:
  - **Single Channel** (Java) / equivalent abstraction created at SDK initialisation.
  - **Multiple operations** (ActivateJobs, CompleteJob, PublishMessage, etc.) reuse the same Channel.
  - **HTTP/2 multiplexing**: multiple concurrent requests share the same TCP connection without head-of-line blocking.

  Benefits of connection reuse:
  - **Avoid TLS handshake overhead** per call (handshake is expensive).
  - **Lower latency** for subsequent calls (warm connection).
  - **Reduced resource usage** (fewer sockets, fewer file descriptors).

  Practical implications:
  - **Don't create new clients per call** — share the SDK client across handlers within the same application.
  - **Spring Zeebe** manages this automatically — one client per application.
  - **Worker scaling**: increase `maxJobsActive` rather than spawning multiple clients.

  For connection failure handling: SDKs typically auto-reconnect on transient network issues; retry policies handle gRPC-level errors.

- **Option b) — Wrong.** Pooled / reused.

- **Option c) — Partial.** Auto-managed typically.

- **Option d) — Wrong.** Major factor.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. gRPC pools / reuses connections (HTTP/2 multiplexing); SDK reuses Channel.
- **b) 2/10** — wrong; pooled.
- **c) 5/10** — partial; auto-managed.
- **d) 1/10** — wrong; major factor.

**Correct Answer:** Yes — gRPC clients pool / reuse connections (HTTP/2 multiplexing); Zeebe SDKs share a single Channel.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/zeebe-api/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "gRPC connection pooling / reuse." Connection management.

**Въпросът → Solution Framing.** "Pool / reuse" — изпитва се knowledge на gRPC + SDK connection management.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че gRPC uses HTTP/2 multiplexing, че SDK reuses Channel, че connection reuse е performance critical. Това е знание за gRPC client architecture.

---

# Section 7 — Managing the Development Process (Questions 51-59)

> Weight 15% • Topics: Connector Templates library curation, Operate slow queries troubleshooting, Modify Instance activate with variables, Tasklist responsive design, idempotent token gen, Decision instance audit, CI/CD integration patterns, cluster backup / DR, process modelling for observability.

---

## Question 51: Managing the Development Process (Weighting: 15%)

**Scenario:** A growing organisation has 50 Connector Templates across many projects — Slack, Microsoft Teams, internal APIs, partner integrations, etc. The team lead wants to **curate a central library** so all teams use approved templates consistently.

**How can a team curate a central Connector Template library?**

- **a)** **Combine multiple practices**:
  1. **Publish approved templates at organisation scope** (where supported) so all projects see them in the picker.
  2. **Version templates** clearly (semantic versioning); deprecate old versions.
  3. **Document templates** (purpose, parameters, examples, contact for issues).
  4. **Governance process**: review + approve before org-publishing; lifecycle ownership.
  5. **Central repo / Git**: source-of-truth for template JSON; CI deploys to Camunda via Web Modeler API.
  6. **Tagging / categorisation**: help modelers find the right template.
  
  Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **b)** Just upload templates to a shared folder — partial; central scoping more robust. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **c)** Each team manages their own — defeats curation. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **d)** Curation not possible — incorrect; multiple mechanisms. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Central Connector Template library curation is a governance + tooling challenge. Comprehensive approach:

  **1. Organisation-scope publishing**: leverage Web Modeler's org-publish feature to make approved templates org-wide visible. Project-scoped templates remain for experimentation; promote to org when ready.

  **2. Versioning**: each template includes a version field; SemVer (major.minor.patch). Major = breaking changes; minor = backward-compatible additions; patch = fixes.

  **3. Documentation**: each template has a clear description, parameter docs, usage examples, contact / Slack channel for help. Co-locate with the template JSON in Git.

  **4. Governance**:
  - Proposed → reviewed by template team / architecture → approved → published.
  - Updates: same review; major versions trigger migration plan.
  - Deprecation: announce; provide migration path; eventual removal.

  **5. Source-of-truth in Git**: template JSON in a Git repo; CI deploys via Web Modeler API on merge. Version control + diff + history.

  **6. Discoverability**: categories / tags (Slack, AWS, internal, etc.); searchable in Web Modeler picker.

  **7. Metrics**: track template adoption (which templates are used in which BPMNs); identify unused / popular ones.

  **8. Lifecycle**: appoint template owners; periodic reviews; retire stale templates.

  Outcome: consistent, governed, discoverable template library that scales across many teams.

- **Option b) — Partial.** Central scoping more robust.

- **Option c) — Defeats curation.** Inconsistent.

- **Option d) — Wrong.** Mechanisms exist.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multi-faceted: org-publish + versioning + docs + governance + Git + discoverability.
- **b) 4/10** — partial; less robust.
- **c) 2/10** — defeats curation.
- **d) 1/10** — wrong; mechanisms.

**Correct Answer:** Combine: org-publish approved templates + versioning + docs + governance + Git source-of-truth + categorisation.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "central library", "50 templates across projects." Library curation.

**Въпросът → Solution Framing.** "How curate" — изпитва се knowledge на multi-faceted governance.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че org-publish + governance + versioning + Git source-of-truth combine, че single mechanism insufficient. Това е знание за template library curation.

---

## Question 52: Managing the Development Process (Weighting: 15%)

**Scenario:** Operate's process instance search is **slow** — taking 10-20 seconds for queries that should be fast. The team wonders how to troubleshoot.

**How to troubleshoot slow Operate queries?**

- **a)** **Multi-step troubleshooting**:
  1. **Identify the slow query**: check Operate logs / metrics for slow query patterns; reproduce.
  2. **Elasticsearch health**: check ES cluster status (yellow/red/green); shard distribution; node load.
  3. **Index size**: how many documents in relevant indexes; retention policy.
  4. **Query selectivity**: is the filter highly selective (few hits) or broad (many hits)? Broad queries scan more.
  5. **Resources**: ES CPU / memory / disk I/O metrics during query.
  6. **Indexing strategy**: are commonly-filtered fields properly indexed?
  
  Mitigations: scale ES (more nodes, more shards), add specific indexes for hot fields, reduce data retention, archive old data, optimise query patterns. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/) + [Self-Managed](https://docs.camunda.io/docs/self-managed/)

- **b)** Wait — Operate auto-optimises — incorrect; manual tuning often required. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Switch to Optimize — partial; for analytics workloads Optimize is better but for Operate-specific queries, fix Operate. Documentation: [Optimize](https://docs.camunda.io/docs/components/optimize/)

- **d)** Slow queries can't be diagnosed — wrong; multiple diagnostic levers. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's performance is tied to its Elasticsearch / OpenSearch backend. Troubleshooting slow queries:

  **Identify**:
  - Operate's logs may show slow query warnings.
  - ES slow log can capture queries exceeding a threshold.
  - Reproduce manually to confirm reproducibility.

  **ES health**:
  - Cluster status (`_cluster/health`): green, yellow (warning), red (problem).
  - Shard count + size: too many shards or too-large shards hurt performance.
  - Node load: CPU / memory / disk on ES nodes.

  **Query characteristics**:
  - **Selectivity**: highly-selective filters (e.g., unique customer ID) → ES quickly narrows hits → fast. Broad filters (e.g., state = ACTIVE across all definitions) → ES scans many docs → slow.
  - **Sort fields**: sorting on non-indexed fields can be slow.
  - **Cross-field**: complex multi-field filters with low selectivity each are slow.

  **Mitigations**:
  - **Scale ES**: more nodes / shards / replicas; better hardware.
  - **Custom mappings**: ensure hot fields are indexed (keyword for exact match, text for full-text).
  - **Reduce retention**: less data → smaller indexes → faster queries.
  - **Archive old data**: cold storage for old instances; ES holds only recent.
  - **Query patterns**: design UI / API queries to use selective filters first.

  For production: monitor query latency as a SLI; alert on degradation; capacity-plan ES sizing.

- **Option b) — Wrong.** Manual tuning often needed.

- **Option c) — Partial.** Optimize is analytics; Operate-specific tuning relevant.

- **Option d) — Wrong.** Diagnosable.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Identify slow query + ES health + selectivity + index strategy + mitigations.
- **b) 1/10** — wrong; manual tuning.
- **c) 5/10** — partial; Optimize different scope.
- **d) 1/10** — wrong; diagnosable.

**Correct Answer:** Multi-step: identify query, check ES health, analyze selectivity / indexing, scale + tune.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Operate slow queries", "troubleshoot." Performance diagnosis.

**Въпросът → Solution Framing.** "How troubleshoot" — изпитва се knowledge на Operate + ES performance.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate е ES-backed, че query speed depends on selectivity + indexing, че mitigations include scale + tune + archive. Това е знание за Operate performance troubleshooting.

---

## Question 53: Managing the Development Process (Weighting: 15%)

**Scenario:** A team uses **Operate's Modify Process Instance** to add a token at a downstream Service Task. They want the new token to have **specific variables** set before processing. They wonder if Modify supports setting variables at activation.

**Can Modify Process Instance set variables when activating a new token?**

- **a)** **Yes — Modify Process Instance supports activating tokens at specific flow nodes WITH variable updates** at that scope. The Modify operation can:
  - Cancel tokens at specified flow nodes.
  - Activate new tokens at specified flow nodes.
  - **Set variables** in the activated token's scope before it processes.
  
  Useful for "skip ahead and pre-populate" scenarios — recovering from data issues by injecting the missing data + jumping past the failure point. Documentation: [Operate Modify](https://docs.camunda.io/docs/components/operate/userguide/modify-instance/)

- **b)** No — variables can't be modified — incorrect; supported. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/modify-instance/)

- **c)** Only cancel tokens — incorrect; add too. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/modify-instance/)

- **d)** Variables must be set in a separate operation — workable but Modify integrates. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/modify-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's Modify Instance feature is comprehensive:
  - **Cancel existing tokens**: at specific flow nodes (skip / abort).
  - **Activate new tokens**: at specific flow nodes (inject / jump).
  - **Set variables at activated token's scope**: pre-populate data the activated work expects.
  - **All in one atomic operation**: the changes apply together.

  Use case for "skip ahead with variables":
  - Process is stuck because of a missing `customerId` at Service Task `T3`.
  - Ops realises the customer ID is "C-789" but can't easily fix the upstream.
  - Modify Instance: cancel token at T3, activate new token at T7 (downstream), set variable `customerId = "C-789"` in the activated scope.
  - Result: process continues from T7 with the right data.

  Compared with separate operations:
  - **Update Variables alone**: doesn't move tokens.
  - **Cancel + Activate without variables**: doesn't bring the data.
  - **Modify Instance with all three**: atomic, comprehensive intervention.

  Best practice: Modify operations are surgical; use sparingly for one-off recovery. Frequent need indicates BPMN model gaps that should be addressed structurally.

- **Option b) — Wrong.** Supported.

- **Option c) — Wrong.** Add too.

- **Option d) — Workable but Modify integrates.** Atomic operation cleaner.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Modify supports cancel + activate + variables atomically.
- **b) 1/10** — wrong; supported.
- **c) 2/10** — wrong; add too.
- **d) 5/10** — workable но not atomic.

**Correct Answer:** Yes — Modify Process Instance supports activating tokens with variable updates in one atomic operation.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/modify-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Modify activate с variables." Modify with data injection.

**Въпросът → Solution Framing.** "Variables at activation" — изпитва се knowledge на Modify capabilities.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Modify combines cancel + activate + variables, че atomic operation, че surgical use case. Това е знание за Modify Instance comprehensive features.

---

## Question 54: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's customer support agents use Tasklist on their **mobile devices** (tablets, phones) when in the field. They want to ensure the experience is mobile-friendly.

**Is Tasklist mobile-friendly out of the box?**

- **a)** **Tasklist's web UI is responsively designed** to work across viewport sizes — desktop, tablet, mobile. Task list, task details, form rendering adapt to narrow screens. **Mobile-specific considerations**:
  - **Forms-based interactions**: forms render responsively (per Set 9 Q32).
  - **Touch interactions**: standard web touch behaviour.
  - **Offline mode**: typically not supported out of the box — requires connectivity.
  - **Native mobile app**: not a primary Camunda offering; some integrations / partner apps may exist.

  For deep mobile UX (offline, push notifications, native gestures), embed Tasklist API in a custom mobile app. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **b)** Mobile not supported — incorrect; responsive. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **c)** Only desktop optimised — partial; responsive supports mobile too. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **d)** Native mobile app provided — partial; primary is web; verify per offering. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Tasklist's web UI uses responsive design — adapts to viewport. Mobile experience:
  - **Functional**: task list, task details, completion all work on tablets and phones via web browsers.
  - **Forms render responsively**: form-js library adapts.
  - **Standard web touch**: tap, scroll, etc.
  - **Limitations**: requires connectivity (no offline cache by default); web-app limitations on iOS / Android (no native push notifications, etc.).

  For richer mobile UX:
  - **Embed Tasklist API**: build a custom mobile app using the Tasklist API; provides full control over UX (offline, push notifications, native gestures, etc.).
  - **Progressive Web App (PWA)**: configure as PWA for installable web app with limited offline.
  - **Native partner integrations**: some Camunda partners offer mobile apps.

  For typical field service / approval use cases: responsive web Tasklist is usually sufficient. For specialised needs, custom app development is the path.

- **Option b) — Wrong.** Responsive.

- **Option c) — Partial.** Responsive supports mobile.

- **Option d) — Partial.** Primary is web.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Tasklist responsive; mobile-functional; custom apps for richer UX.
- **b) 1/10** — wrong; responsive.
- **c) 4/10** — partial.
- **d) 5/10** — partial; web primary.

**Correct Answer:** Tasklist responsive web UI works on mobile; for richer UX (offline, native), embed Tasklist API in a custom app.

**Official Documentation Link:** https://docs.camunda.io/docs/components/tasklist/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "mobile devices", "tablets, phones." Mobile UX.

**Въпросът → Solution Framing.** "Mobile-friendly" — изпитва се knowledge на Tasklist responsive design.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Tasklist responsive, че mobile-functional via web, че custom apps for advanced needs. Това е знание за mobile Tasklist.

---

## Question 55: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's messages have idempotency keys derived from `processInstanceKey + activityId`. But for **starting new process instances** (no instance yet), they need a different key derivation strategy.

**Best practice for idempotency keys when starting new process instances?**

- **a)** **Derive from business-level identifiers — order ID, transaction ID, request ID, etc.** — that are unique to the logical operation. Examples:
  - **Order processing**: idempotency key = order ID (`"ORD-12345"`).
  - **Payment**: key = transaction reference (`"TXN-abc-789"`).
  - **Customer signup**: key = combination (email + timestamp at first-attempt).
  
  These keys are stable across retries, recognisable in audit logs, and don't depend on Camunda-internal identifiers (which don't exist before instance creation). Combine with broker-side message TTL for deduplication of duplicate publishes. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** Generate UUID at publish — incorrect; UUID per publish doesn't deduplicate (each retry generates a new UUID). Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **c)** No idempotency for new instances — incorrect; achievable via business keys. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **d)** Reuse the failing publish's UUID — partial; works if you keep the UUID across retries. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Idempotency for new-instance creation requires a stable key derived from the **logical operation**, not the act of publishing:

  **Good key sources**:
  - **Business identifiers**: order ID, transaction reference, customer ID + request timestamp, etc. — naturally unique to the logical event.
  - **Caller-generated UUIDs persisted alongside the request**: caller generates UUID once for the operation, retries use the same UUID.
  - **Deterministic hash of payload**: hash of normalized request body if no business ID available.

  **Bad practices**:
  - **UUID generated at publish-time**: each retry generates a new UUID; doesn't deduplicate.
  - **Random per-attempt**: same as UUID-per-publish; defeats dedup.

  **Mechanism**:
  - Caller stores the idempotency key (e.g., in their database, alongside the order record).
  - Publishes with `messageId = idempotencyKey`.
  - On retry, same key → Camunda's broker recognises duplicate within TTL window → discards.

  For starting **process instances** specifically:
  - **API call POST /v2/process-instances** doesn't have a native idempotency key like Message publishing's `messageId`.
  - **Caller responsibility**: check if a process instance already exists for the business ID before creating; if exists, don't re-create. Query: `POST /v2/process-instances/search` with filter on the business ID variable.

- **Option b) — Wrong.** UUID per publish doesn't dedup.

- **Option c) — Wrong.** Achievable.

- **Option d) — Partial.** Works if UUID is persisted.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Business identifiers (order ID, transaction reference) as stable idempotency keys.
- **b) 2/10** — wrong; per-publish UUID doesn't dedup.
- **c) 1/10** — wrong; achievable.
- **d) 6/10** — partial; works if persisted.

**Correct Answer:** Derive idempotency keys from business identifiers (order ID, transaction reference); stable across retries.

**Official Documentation Link:** https://docs.camunda.io/docs/components/best-practices/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "idempotency keys for new instances." Idempotent instance creation.

**Въпросът → Solution Framing.** "Best practice for keys" — изпитва се knowledge на idempotency design.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че business identifiers са stable keys, че per-publish UUIDs don't dedup, че caller must persist key across retries. Това е знание за idempotency key design.

---

## Question 56: Managing the Development Process (Weighting: 15%)

**Scenario:** Auditors ask for **all DMN evaluations** done in the past year — what decisions were evaluated, with what inputs / outputs, when, for which process instance.

**Where does Camunda 8 store DMN evaluation history?**

- **a)** **Operate's Decision Instances view** captures each DMN evaluation as a Decision Instance record:
  - Decision evaluated (ID, name, version).
  - Inputs provided.
  - Outputs produced.
  - Timestamp.
  - Parent process instance (for evaluations called from BPMN).
  - Hit policy + matched rules (for decision tables).

  Searchable / filterable; queryable via Operate API. For long-term audit, ensure retention is configured appropriately (per the team's compliance window). Documentation: [Operate Decision Instances](https://docs.camunda.io/docs/components/operate/userguide/decision-instances-summary/)

- **b)** Only Optimize — partial; Optimize aggregates; Operate per-instance details. Documentation: [Optimize](https://docs.camunda.io/docs/components/optimize/)

- **c)** Custom logging required — partial; built-in available. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** DMN evaluations not tracked — wrong. Documentation: [Operate Decision Instances](https://docs.camunda.io/docs/components/operate/userguide/decision-instances-summary/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's Decision Instances feature captures per-evaluation records:
  - **Searchable**: by decision ID, time range, parent process instance, input values.
  - **Detailed view**: inputs, outputs, matched rules, hit policy semantics.
  - **Linked to parent process**: when evaluated from BPMN Business Rule Task, the decision instance links to the process instance.

  For audit / compliance:
  - **Retention**: configure Operate's retention to cover the compliance window (e.g., 7 years).
  - **Export**: programmatic export via Operate API to long-term store for archival.
  - **Filtering**: ops can search for specific decisions / instances / time periods.

  Operate is for **per-instance and per-evaluation audit** — granular records.

  **Optimize** complements:
  - **Aggregate analytics**: how many evaluations per day; trends; rule hit frequencies.
  - **Insights**: rules that never fire (possible removal candidates); rules that always fire (possible default).

  For "all evaluations in the past year for audit," Operate provides the records; Optimize provides aggregate views.

- **Option b) — Partial.** Both useful; Operate has per-instance.

- **Option c) — Partial.** Built-in works.

- **Option d) — Wrong.** Tracked.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Operate Decision Instances captures detailed evaluation records; searchable.
- **b) 5/10** — partial; Optimize complements.
- **c) 4/10** — partial; built-in works.
- **d) 1/10** — wrong; tracked.

**Correct Answer:** Operate's Decision Instances view captures each DMN evaluation with inputs / outputs / metadata; searchable for audit.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/decision-instances-summary/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "all DMN evaluations past year." Decision audit.

**Въпросът → Solution Framing.** "Where stored" — изпитва се knowledge на Decision Instances.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate captures Decision Instances, че searchable + filterable, че retention configurable. Това е знание за DMN audit.

---

## Question 57: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's CI/CD pipeline deploys BPMN / DMN / Form changes. They want to **automate the full flow**: PR merge → CI pipeline → deploy to dev → deploy to staging → deploy to prod (with manual approvals between stages).

**Which CI/CD patterns fit Camunda 8 multi-environment deployment?**

- **a)** **Multi-stage pipeline with manual gates**:
  1. **Source**: BPMN / DMN / Form files in Git (Web Modeler can sync via GitHub Sync, or developers commit directly).
  2. **PR + review**: code review on changes; CI runs validation (`bpmnlint`, structural checks).
  3. **Auto-deploy to dev**: on merge, CI deploys to dev cluster via zbctl / REST API.
  4. **Test in dev**: smoke tests, integration tests.
  5. **Manual approval gate**: human approves promotion to staging.
  6. **Deploy to staging**: same artifacts, different cluster.
  7. **Staging tests**: pre-production validation.
  8. **Manual approval gate**: human approves production.
  9. **Deploy to prod**: same artifacts.
  10. **Post-deploy verification**: smoke tests + monitoring.

  Cluster-specific config (secrets) provisioned per environment separately. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** Just deploy to prod directly — incorrect; risks production. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **c)** Manual deployment only — wastes CI value. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **d)** Camunda doesn't fit CI/CD — wrong; designed for it. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Multi-environment Camunda 8 CI/CD pipeline best practices:

  **Source-controlled BPMN / DMN / Forms**:
  - Git as source of truth.
  - Web Modeler Git Sync (where supported) or developers commit directly.
  - Branch protection: require PR + review.

  **Validation in CI**:
  - `bpmnlint` for BPMN structural checks.
  - DMN syntax validation.
  - Form schema validation.
  - Custom tests: process flow correctness (using Play API), Connector unit tests.

  **Multi-environment deployment**:
  - **Dev**: auto-deploy on merge for fast feedback.
  - **Staging**: gated; pre-production validation.
  - **Prod**: gated; manual approval; deploy via zbctl / REST API.

  **Same artifacts across environments**:
  - Build once (validated BPMN / DMN / Form files); deploy same to all envs.
  - Environment-specific values via cluster secrets (not in artifacts).

  **Verification**:
  - Each stage: smoke test after deploy.
  - Roll forward (deploy fix) preferred over roll back; preserve audit.

  **Tooling**:
  - GitHub Actions / GitLab CI / Jenkins as orchestration.
  - zbctl or REST API for deployment.
  - Vault / cloud provider's secret manager for cluster secrets.

  **Observability**:
  - Each deployment logged; trace artifact version to deployment.
  - Monitoring alerts on post-deploy issues (incidents spike, latency degradation).

- **Option b) — Risky.** Direct to prod skips validation.

- **Option c) — Wastes CI.** Automation valuable.

- **Option d) — Wrong.** Designed for CI/CD.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multi-stage с auto-dev + gated staging/prod; same artifacts; per-env secrets.
- **b) 2/10** — risky.
- **c) 3/10** — wastes CI.
- **d) 1/10** — wrong.

**Correct Answer:** Multi-stage pipeline: source-controlled artifacts → validation → auto-deploy dev → gated staging → gated prod; same artifacts, per-env secrets.

**Official Documentation Link:** https://docs.camunda.io/docs/components/best-practices/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "CI/CD multi-environment", "dev / staging / prod." Multi-env pipeline.

**Въпросът → Solution Framing.** "CI/CD patterns" — изпитва се knowledge на deployment automation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че multi-stage с gates + same artifacts + per-env secrets best practice, че Git source-of-truth + zbctl / REST deploy. Това е знание за CI/CD architecture.

---

## Question 58: Managing the Development Process (Weighting: 15%)

**Scenario:** A team plans **disaster recovery (DR)** for their Self-Managed Camunda 8 cluster. They want to back up data and have a recovery plan.

**What backup / DR strategies fit Self-Managed Camunda 8?**

- **a)** **Multi-component backup strategy**:
  1. **Zeebe broker data** (state + journal): use Zeebe's built-in backup API to create snapshots. Snapshots represent the cluster state at a point in time; restorable to a new cluster.
  2. **Elasticsearch / OpenSearch** (Operate, Tasklist, Optimize backing store): use ES snapshot API to back up indexes. Restore creates a comparable ES cluster.
  3. **Web Modeler database** (project / resource metadata): standard database backup (Postgres dump / equivalent).
  4. **Identity database** (users / groups / permissions): same as Web Modeler.
  5. **Connector Runtime config + custom Connectors**: source-control + redeploy.

  **Recovery process**: restore each component to a target cluster; reconnect; verify integrity. Test DR procedures regularly (drills). Documentation: [Zeebe backup](https://docs.camunda.io/docs/self-managed/zeebe-deployment/operations/backups/) + [Self-Managed](https://docs.camunda.io/docs/self-managed/)

- **b)** Just back up the VM disks — partial; backs up data but consistency complex. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

- **c)** No backup needed — wrong; production needs DR. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

- **d)** Camunda 8 doesn't support backups — wrong; APIs provided. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 SM is a multi-component system; DR strategy covers each:

  **Zeebe broker** (the runtime engine):
  - **Backup API**: Zeebe exposes a backup mechanism that creates point-in-time snapshots.
  - **Snapshot includes**: process state, partition data, etc.
  - **Restore**: provision a new cluster; restore from snapshot; resume.
  - **Frequency**: depends on data criticality; nightly or more frequent for high-stakes.

  **Elasticsearch / OpenSearch** (Operate / Tasklist / Optimize storage):
  - **ES snapshot repository**: configure (S3 / Azure / GCS / shared filesystem).
  - **Periodic snapshots**: schedule via Curator or similar.
  - **Restore**: create new ES cluster; restore from snapshots.
  - **Coordination with Zeebe**: ideally Zeebe + ES snapshots are taken at coordinated points for consistency.

  **Web Modeler database** (typically Postgres):
  - **Database backups**: `pg_dump` or cloud DB backup features.
  - **Frequency**: per change rate.

  **Identity (Keycloak)** database:
  - **Keycloak's data**: Postgres or similar; backup standard.

  **Connector Runtime config + custom Connectors**:
  - **Source control**: configurations + custom JARs in Git.
  - **Restore**: redeploy from Git.

  **DR drills**:
  - **Restore to test cluster periodically**: verify backups are valid.
  - **Document procedures**: step-by-step recovery runbooks.
  - **RPO (Recovery Point Objective)**: how much data loss is acceptable (drives backup frequency).
  - **RTO (Recovery Time Objective)**: how long to restore (drives infrastructure preparedness).

- **Option b) — Partial.** VM snapshots can work but cross-component consistency hard.

- **Option c) — Wrong.** DR needed.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multi-component backup: Zeebe + ES + databases + config; coordinated; tested.
- **b) 4/10** — partial; consistency challenging.
- **c) 1/10** — wrong; DR needed.
- **d) 1/10** — wrong; supported.

**Correct Answer:** Multi-component backup: Zeebe backup API + ES snapshots + database dumps + config in Git; tested DR drills.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/zeebe-deployment/operations/backups/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "disaster recovery", "back up data." Multi-component DR.

**Въпросът → Solution Framing.** "DR strategies" — изпитва се knowledge на multi-component backup.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че multi-component backup needed, че Zeebe + ES + DBs + config, че coordinated snapshots + DR drills. Това е знание за DR architecture.

---

## Question 59: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's process is critical and needs **high observability**. They want their BPMN modelling choices to support good Operate / Optimize visibility — clear instance state, meaningful metrics.

**How can BPMN modelling improve process observability?**

- **a)** **Modelling best practices for observability**:
  1. **Meaningful element names**: descriptive task / event names (e.g., "Validate Customer Data" not "Task1") — readable in Operate.
  2. **Granular activities**: split monolithic logic into distinct tasks — Operate shows each separately; track per-step latency.
  3. **Explicit error handling**: Error Boundary Events with specific errorCodes — Operate shows which error type fired.
  4. **Set business-meaningful variables**: at key points, set variables for filtering / search (customer ID, order ID, status).
  5. **Use None Intermediate Events as milestones**: optional landmarks for "passed key step."
  6. **Subprocess for grouping**: visual structure; subprocess instances tracked separately in Operate.
  7. **Comments / documentation**: BPMN annotations explain non-obvious logic.

  These choices make the process "self-documenting" in Operate, enable quick troubleshooting, and feed meaningful data to Optimize for analytics. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/) + [Operate](https://docs.camunda.io/docs/components/operate/)

- **b)** Modelling doesn't affect observability — wrong; significant impact. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **c)** Add many None Events — partial; landmarks help, others matter more. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **d)** Use only big monolithic activities — opposite of best practice. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN modelling choices have major impact on operational observability:

  **1. Naming**: clear element names appear in Operate's UI. "Validate Customer Address" reads better than "T-12" when debugging.

  **2. Granularity**: split big monolithic tasks into smaller ones:
  - Per-step latency visible in Operate.
  - Per-step retry counts.
  - Per-step error rates.
  - Easier root cause analysis.

  **3. Explicit error handling**: Error Boundary Events with specific codes:
  - Operate shows "INVALID_DATA" vs "TIMEOUT" vs "RATE_LIMITED" distinctly.
  - Filter incidents by error type.
  - Targeted troubleshooting.

  **4. Business-meaningful variables**:
  - Set `customerId`, `orderId`, `status` at key points.
  - Operate's variable filter finds instances by business attributes.
  - Audit trail with business context.

  **5. Milestones**:
  - None Intermediate Events label significant transitions ("Order Confirmed", "Payment Received").
  - Operate's instance history shows passage; quick visual scan.

  **6. Subprocess**:
  - Visual structure: collapsible groupings.
  - Subprocess instances tracked separately.
  - Boundary events at subprocess level for scoped handling.

  **7. Documentation**:
  - BPMN annotations: "Why" of complex logic.
  - Readers understand without spelunking.

  **Effect on Optimize**:
  - Clear naming → readable reports.
  - Granular tasks → per-step duration analytics.
  - Variable-driven business context → filterable analytics.

  Modelling for observability is investment in long-term ops productivity.

- **Option b) — Wrong.** Significant impact.

- **Option c) — Partial.** Multi-faceted.

- **Option d) — Anti-pattern.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multi-faceted: naming + granularity + error handling + variables + milestones + subprocess + docs.
- **b) 1/10** — wrong; significant.
- **c) 4/10** — partial.
- **d) 1/10** — anti-pattern.

**Correct Answer:** Multi-faceted: meaningful names + granular activities + explicit error handling + business-meaningful variables + milestones + subprocess + documentation.

**Official Documentation Link:** https://docs.camunda.io/docs/components/best-practices/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "BPMN modelling support observability." Modelling for ops.

**Въпросът → Solution Framing.** "How modelling improves" — изпитва се knowledge на ops-friendly modelling.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че naming + granularity + error handling + variables compose, че investment for ops productivity. Това е знание за modelling for observability.

---

# Section 8 — Dev Environment Setup (Question 60)

> Weight 1% • Topics: Camunda 8 Run customisation via .env file.

---

## Question 60: Dev Environment Setup (Weighting: 1%)

**Scenario:** A developer wants to customise their Camunda 8 Run setup with several environment variables — JAVA_HOME, custom port, data directory. They wonder if a **.env file** is supported (vs setting env vars manually each session).

**Does Camunda 8 Run support .env file for configuration?**

- **a)** **Verify per Camunda 8 Run version**: some versions ship with a `.env` file or environment-config file in the distribution that the start scripts read; modify it to set persistent customisations. Alternative: shell profile (`.bashrc` / `.zshrc` on Unix) or system env vars on Windows. The .env approach is convenient for the distribution-local config — edits survive across sessions without polluting global shell config. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **b)** No .env support — partial; depends on version. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **c)** Must set env vars in shell every session — workable but inconvenient if .env supported. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **d)** Edit the JAR directly — wrong; configuration external. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Run's configuration approach evolves across versions. Common patterns:

  **Distribution-local config file**:
  - A `.env` file or similar (e.g., `c8run.env`) in the Camunda 8 Run directory.
  - Defines environment variables read by `start.sh` / `start.bat`.
  - Edit the file; restart Camunda 8 Run; config applies.
  - Convenient: tied to the specific Camunda 8 Run installation; doesn't pollute global shell config.

  **Shell environment variables**:
  - Set in `.bashrc` / `.zshrc` / Windows system properties.
  - Apply globally to all command-line sessions.
  - Less local; can interfere with other applications.

  **Per-invocation flags**:
  - Pass on the command line: `JAVA_OPTS="-Xmx2g" ./start.sh`.
  - Per-session; doesn't persist.

  **application.yaml inside the JAR**:
  - Spring Boot's config; some properties may be inside.
  - Don't typically edit; use external overrides.

  Best for development:
  - **.env file in the Camunda 8 Run dir** (if version supports): local, persistent.
  - Combine with `start.sh` / `start.bat` which read the .env.

  Verify the specific config file name and structure in your Camunda 8 Run version's docs.

- **Option b) — Partial.** Depends on version.

- **Option c) — Workable but inconvenient.**

- **Option d) — Wrong.** External config.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Verify per version; .env or similar config file convenient for persistent local config.
- **b) 5/10** — partial.
- **c) 5/10** — workable но inconvenient.
- **d) 1/10** — wrong; external.

**Correct Answer:** Verify per Camunda 8 Run version — .env file or similar typically supported for persistent local config; alternative is shell env vars.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи ".env file for customisation." Local config persistence.

**Въпросът → Solution Framing.** "Support .env" — изпитва се knowledge на Camunda 8 Run config options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 8 Run typically supports config file, че convenient for local persistent settings, че shell env е alternative. Това е знание за Camunda 8 Run config.

---

# Закриваща секция — Set 11

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

**Препоръка за тренировка (Set 11):**
1. **Open-book проход** — чети всеки 🔍 Explanations + Three-Skills Decomposition; не таймирай.
2. **Closed-book timed run** — 75-минутен таймер; запиши отговорите си; цел: ≥ 39/60.
3. **Анализ на грешки:** за всяка грешка кои от 3-те skills ти липсваше (Diagnostic / Solution / Mechanism).

**Чести грешки в Set 11 (грешен axis вместо грешен отговор):**
- **Q1 (isExecutable=false ignored for execution)** — пътане с "both Pools deploy."
- **Q3 (empty MI + completionCondition)** — пътане с "hang waiting for impossible condition."
- **Q4 (poll until ready)** — пътане с relying on Standard Loop marker; coverage limited in Zeebe.
- **Q6 (multiple Compensation Boundaries per activity)** — пътане с "yes engine picks one"; one Boundary best practice.
- **Q8 (outputCollection ordering)** — пътане с "order depends on completion"; position-correspondent.
- **Q10 (Task Headers static)** — пътане с "FEEL evaluated at activation"; static literal strings.
- **Q11 (null in Output Mapping)** — пътане с "creates Incident"; null is valid; FEEL null-tolerant.
- **Q13 (MI Error Boundary)** — пътане с "completionCondition checks error"; Error Boundary on MI is direct.
- **Q22 (no JSONPath)** — пътане с "supported alongside FEEL"; FEEL only.
- **Q23 (RULE ORDER row order)** — пътане с COLLECT semantic; RULE ORDER guarantees row order.
- **Q24 (FEEL instance of)** — пътане с "no type checking"; operator exists.
- **Q33 (no inline secrets)** — пътане с "OK for dev"; even dev leakage risky.
- **Q34 (timeout layers order)** — пътане с "auto-coordinate"; manual ordering required.
- **Q41 (@JobWorker modern)** — пътане с "same as @ZeebeWorker"; migrate to @JobWorker.
- **Q49 (FEEL null-tolerant)** — пътане с "NullPointerException"; null propagates.
- **Q55 (business identifiers for idempotency)** — пътане с "UUID per publish"; stable business keys.

**Свежи Set 11 теми (distinct от Sets 1-10):**

Modeling: isExecutable=false Pools, error propagation across scope hierarchy, empty MI + completionCondition interaction, polling patterns (worker-side / BPMN-explicit / Standard Loop coverage caveat), Call Activity vs Embedded multi-dimensional comparison, one Compensation Boundary per activity best practice, Throw Signal End vs Intermediate, outputCollection position-correspondent ordering, Start Event Input Mapping.

Configuring Processes: Task Headers static (not FEEL), Output Mapping null propagation, formKey vs formId precedence, MI Error Boundary for break-on-error, Document Handling pre-signed URL alternatives, IDP overall confidence aggregation (min / mean / weighted), Element Template publishing workflow (admin role), AI Agent tool selection (LLM reasoning), Timer FEEL duration from variables, FEEL function in correlation key, Cycle vs Duration vs Date timer types, C7 Task Listener migration patterns (per-listener), FEEL exclusive (no JSONPath).

DMN: RULE ORDER row-order list, FEEL `instance of` type checker, BKM typed parameters, multi-caller BKM reuse, DMN error → BPMN Incident propagation, DMN-BPMN version binding semantics, Decision Service explicit input/output declaration.

Forms: schema versions vs deployed versions, Group component for nested layout, Output Mapping transformation on Form data.

Connectors: never inline secrets even in dev, three timeout layers (HTTP / activation / Timer Boundary) order, packaging (JAR / Spring Boot / Docker), Connector versioning across deployments (Runtime + Element Templates + BPMN reference).

Extensions: FEEL abs / power / coalesce-workaround / upper case + lower case, @ZeebeWorker legacy vs @JobWorker modern, Node SDK retry in handler code (transient vs permanent), zbctl JSON output + jq scripting, Camunda Identity scopes per API client, Connector SDK test utilities (MockContext), Inbound observability (Connector Runtime metrics + Operate visibility), RPA hybrid SaaS+self-hosted, FEEL date() invalid input → null, FEEL null propagation, gRPC HTTP/2 connection pooling.

Managing Dev: Connector Template library curation (multi-faceted), Operate slow query troubleshooting (ES health + selectivity), Modify Instance with variables (atomic), Tasklist responsive design + custom mobile apps, business-identifier idempotency keys, Operate Decision Instances audit, multi-stage CI/CD with manual gates, multi-component DR (Zeebe + ES + DBs + config), BPMN modelling for observability.

Dev Env: Camunda 8 Run config via .env file (verify per version).

**Успех на изпита! 🎓**

---

# 🎉 Серия Sets 1-11 = 660 unique въпроса

Sets 1-11 покриват **660 unique въпроса** разпределени по Blueprint v8.8.0 — extensive practice library за Camunda 8 C8-CP-DV certification.

**Препоръка за финална подготовка:**
1. **Преди изпита**: пройди през Sets 7-11 (свежи + квалитетни) closed-book.
2. **Идентифицирай области с грешки** — за всяка грешка определи кой от 3-те skills беше слаб (Diagnostic / Solution Framing / Mechanism Knowledge); фокусирай review там.
3. **Документация**: прегледай official Camunda 8.8 docs за често появяващи се теми — FEEL, MI, Connectors, Operate, Migration, Document Handling.
4. **Практика**: ако възможно, deploy локален Camunda 8 Run; experimenitirai с примерни процеси; тренирай Operate / Tasklist UI.

**Успех на C8-CP-DV изпита! 🎓**
