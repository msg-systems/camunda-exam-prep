# Camunda 8 C8-CP-DV Mock Exam — Set 12

> **60 въпроса • 75 минути • праг ≥ 65% (39/60) • Blueprint v8.8.0**
>
> Свежи сценарии — distinct от Set 1-11. Всеки въпрос: сценарий + 4 опции (a/b/c/d) + 🔍 Explanations + per-option score 1–10 + Correct Answer + Documentation Link + 🧠 Three-Skills Decomposition.

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

> Weight 15% • Topics: Call Activity output back-flow, Error event variants, MI timeout patterns, layered error handling (Boundary + Event Subprocess), Lane role assignment, Start trigger choice, gateway condition overlaps, rework loops, nested compensation.

---

## Question 1: Modeling (Weighting: 15%)

**Scenario:** A parent process invokes a child via Call Activity. The child computes `discountResult` and the team wants this value back in the parent's scope as `discountAmount` after the child completes.

**How does the child's value reach the parent's scope?**

- **a)** Configure **Output Mapping on the Call Activity** in the parent: `Target: discountAmount, Source: =discountResult`. When the child completes, its variables are exposed to the Call Activity's Output Mapping; the FEEL expression reads from the child's scope and writes to the parent's scope. Without explicit Output Mapping, the child's variables don't automatically appear in the parent. Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **b)** Child variables auto-propagate — incorrect; explicit mapping required (depending on Zeebe defaults). Documentation: [Call Activity](https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/)

- **c)** Use a Service Task after the Call Activity to query the child instance — over-engineered. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Parent and child share scope — incorrect; separate scopes. Documentation: [Variable Scopes](https://docs.camunda.io/docs/components/concepts/variables/#variable-scopes)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Call Activity child and parent have **separate variable scopes**. Communication crosses the scope boundary via explicit Input / Output Mappings:
  - **Input Mapping**: parent → child (what data the child receives at start).
  - **Output Mapping**: child → parent (what data the parent receives back at child completion).

  The Output Mapping is configured on the Call Activity element in the parent's BPMN. Each mapping declares Target (the parent's variable name) and Source (a FEEL expression evaluating against the child's scope at completion time).

  Practical example:
  ```xml
  <bpmn:callActivity id="invokePricing" ...>
    <bpmn:extensionElements>
      <zeebe:calledElement processId="pricing-process" />
      <zeebe:ioMapping>
        <zeebe:input source="=order" target="order"/>
        <zeebe:output source="=finalPrice" target="orderTotal"/>
        <zeebe:output source="=appliedDiscounts" target="discounts"/>
      </zeebe:ioMapping>
    </bpmn:extensionElements>
  </bpmn:callActivity>
  ```

  Without Output Mapping, the parent doesn't see child results — child's variables stay in child scope and are discarded when child completes (unless `propagateAllParentVariables` flag is set, which is a different concern). Best practice: explicit Output Mapping making the contract clear.

- **Option b) — Wrong default.** Explicit mapping required.

- **Option c) — Over-engineered.** Output Mapping is the clean path.

- **Option d) — Wrong.** Separate scopes.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Output Mapping on Call Activity: Target / Source FEEL projecting child → parent.
- **b) 3/10** — wrong; explicit mapping required.
- **c) 3/10** — over-engineered.
- **d) 2/10** — wrong; separate scopes.

**Correct Answer:** Configure Output Mapping on the Call Activity: Target=discountAmount, Source=`=discountResult`.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "child computes value", "back to parent's scope." Call Activity output flow.

**Въпросът → Solution Framing.** "How value reaches parent" — изпитва се knowledge на Call Activity I/O mapping direction.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че separate scopes, че Output Mapping bridges child→parent, че explicit declaration is clean. Това е знание за Call Activity variable contracts.

---

## Question 2: Modeling (Weighting: 15%)

**Scenario:** Inside an Embedded Subprocess, a Service Task should signal "this subprocess is done with an error" — propagating outward to a parent's Error Boundary. The team wonders whether to use Error End Event or Error Throw Intermediate Event.

**Error End Event vs Error Throw Intermediate Event — which to use inside a subprocess?**

- **a)** **Error End Event**: terminates the current flow path AND throws the error. Use when reaching this point means "no more work in this subprocess; the error is the final outcome." **Error Throw Intermediate Event**: throws the error AND continues flow via outgoing arrow. Less common — used when you want to throw an error but the same path continues to do something else. For the typical subprocess-error scenario ("we failed; bubble up to parent"), **Error End Event** is canonical. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **b)** They behave identically — wrong; flow continuation differs. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **c)** Only Throw Intermediate inside subprocess — partial; both work, End is more common. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **d)** Only End at process top-level — incorrect; End in subprocess valid. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Both variants throw the error (it propagates up the scope hierarchy), but flow control differs:

  **Error End Event** (most common):
  - Throws the error.
  - Terminates the current flow path (acts as End Event).
  - Subprocess scope reaches its end via this path; nothing further in the path.
  - Typical: "this branch fails; that's the end of this path."

  **Error Throw Intermediate Event** (rare):
  - Throws the error.
  - Continues flow via outgoing arrow.
  - Useful when you want to fire the error event but the same execution path continues.
  - Example: a "cleanup" step before continuing; rarely needed.

  For "subprocess fails; bubble up to parent's Error Boundary": Error End Event in subprocess. The error propagates from inside the subprocess to its boundary on the parent's side; flow routes via the Boundary's outgoing arrow.

  Reach to parent: the Error End Event throws error in subprocess scope; engine looks for matching Error Boundary on subprocess element (in parent); if found, Boundary fires, subprocess cancelled, parent flow continues via Boundary's outgoing arrow.

- **Option b) — Wrong.** Flow differs.

- **Option c) — Partial.** Both work; End common.

- **Option d) — Wrong.** End in subprocess valid.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Error End terminates path + throws; Throw Intermediate continues + throws.
- **b) 2/10** — wrong; flow differs.
- **c) 5/10** — partial; both work.
- **d) 1/10** — wrong; End in subprocess valid.

**Correct Answer:** Error End Event (terminates path + throws); rarely Throw Intermediate (continues + throws).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/error-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Error End vs Error Throw Intermediate." Error event flavour choice.

**Въпросът → Solution Framing.** "Which to use inside subprocess" — изпитва се knowledge на event flow variants.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Error End terminates path + throws, че Throw Intermediate continues + throws, че End е common for subprocess-fail scenarios. Това е знание за Error event flow control.

---

## Question 3: Modeling (Weighting: 15%)

**Scenario:** A Multi-Instance Subprocess processes 100 items. The team needs **overall timeout** of 1 hour for the entire MI (not per-iteration). After 1 hour, cancel everything and route to a timeout handler.

**How is overall MI timeout modelled?**

- **a)** **Attach an Interrupting Timer Boundary Event to the MI subprocess element**, configured with duration `PT1H`. The Timer starts when MI activates; if 1 hour elapses before MI completes, the Timer fires, cancelling all remaining inner instances and the MI as a whole. Flow routes via the Boundary's outgoing arrow to the timeout handler. Distinct from per-iteration timeout (which would be a Timer Boundary on the inner activity). Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/) + [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** Set MI's completionCondition to time check — workable but boundary cleaner. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Per-iteration Timer Boundary inside MI — wrong; caps each iteration, not overall. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Overall MI timeout not supported — incorrect; Timer Boundary on MI element. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** "Overall MI timeout" is achieved with a Timer Boundary on the MI subprocess element (not on inner activities):
  - **Timer starts when MI activates**: at the moment the subprocess scope begins, the timer's clock starts.
  - **Duration**: `PT1H` for 1-hour cap.
  - **Interrupting**: cancels MI on fire — all running inner instances cancelled, MI completed via the Boundary's path.
  - **Flow continues** via the Boundary's outgoing arrow to the timeout handler.

  Contrast with per-iteration Timer Boundary (inside the inner activity):
  - That would cap each individual iteration at 1 hour.
  - 100 iterations × 1 hour each = up to 100 hours overall; per-iteration timer doesn't cap that.

  For "overall 1 hour for the entire MI": Timer Boundary on the MI subprocess element. Same pattern works for any subprocess (Embedded too) — Boundary on the scope element caps the scope's duration.

  Alternative considerations:
  - **completionCondition with time check**: theoretically possible (`=now() - startTime > duration("PT1H")`) but more complex; Boundary is cleaner.
  - **Combined**: Timer Boundary + completionCondition for "complete when N done OR 1 hour elapsed" composite.

- **Option b) — Workable but heavier.** Boundary cleaner.

- **Option c) — Wrong scope.** Per-iteration.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Interrupting Timer Boundary on MI subprocess element; cancels all on fire.
- **b) 5/10** — workable but heavier.
- **c) 2/10** — wrong scope.
- **d) 1/10** — wrong; supported.

**Correct Answer:** Interrupting Timer Boundary Event on the MI subprocess element (duration PT1H).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "overall timeout 1 hour for MI." MI timeout pattern.

**Въпросът → Solution Framing.** "How modelled" — изпитва се knowledge на overall vs per-iteration timeout.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Timer Boundary on MI element caps overall, че inside-iteration timer caps per-iteration, че completionCondition + time е workaround. Това е знание за MI timeout patterns.

---

## Question 4: Modeling (Weighting: 15%)

**Scenario:** An Embedded Subprocess processes orders. The team wants **layered error handling**: (1) specific business errors caught at the activity level (e.g., `INVALID_DATA` caught and recovered with manual review); (2) any unhandled error caught at the subprocess level (logs + sends notification, then continues). They have both Error Boundary and Event Subprocess inside the subprocess.

**Can Error Boundary (activity-level) AND Event Subprocess (subprocess-level) coexist?**

- **a)** **Yes — layered error handling is a recognised pattern**:
  - **Error Boundary on specific activity**: catches specific errors (matching errorCode) from that activity. Handles them locally; activity is cancelled; flow routes via boundary's arrow.
  - **Event Subprocess with Error Start**: catches errors propagated to the subprocess scope (not caught by inner activity-level boundaries). Logs / notifies; can be interrupting (kills the main flow) or non-interrupting (runs alongside).
  
  Combined: specific errors handled near their source; unhandled errors caught broadly at subprocess scope. The two layers complement; both can exist. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/) + [Event Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

- **b)** Mutually exclusive — wrong; coexist. Documentation: [Event Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

- **c)** Only one allowed per subprocess — wrong. Documentation: [Event Subprocess](https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/)

- **d)** Event Subprocess overrides Boundary — partial; both fire at their respective scopes for matching errors. Documentation: [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Layered error handling combines:

  **Layer 1: Activity-specific Error Boundary**
  - Catches specific errors from a specific host activity (matching errorCode).
  - Handles them with local recovery logic.
  - Routes flow via Boundary's outgoing arrow.
  - Doesn't propagate further (error consumed).

  **Layer 2: Subprocess-scope Event Subprocess with Error Start**
  - Catches errors propagated to the subprocess scope (not caught by inner activity-level Boundaries).
  - "Catch-all" for the subprocess.
  - Can be interrupting (main flow cancelled) or non-interrupting (runs alongside).
  - Logs / notifies / handles broadly.

  **Propagation rules**:
  1. Activity throws error.
  2. Engine checks activity-level Error Boundaries (matching code) — if match, fire; error consumed; route via Boundary.
  3. If no match: propagate to scope (subprocess).
  4. Engine checks scope-level Event Subprocess with Error Start (matching code) — if match, fire.
  5. If no match: propagate to outer scope (process root).
  6. If no match anywhere: unhandled → Incident.

  Layered design lets you handle expected errors specifically (Layer 1) and catch unknowns broadly (Layer 2). Both add value; both can be modelled.

- **Option b) — Wrong.** Coexist.

- **Option c) — Wrong.** Multiple supported.

- **Option d) — Partial.** Both fire at their respective scopes.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Layered handling: Boundary (specific activity) + Event Subprocess (scope catch-all); both coexist.
- **b) 2/10** — wrong; coexist.
- **c) 1/10** — wrong; multiple.
- **d) 5/10** — partial; both fire.

**Correct Answer:** Yes — layered handling: activity-level Error Boundary (specific) + subprocess-level Event Subprocess Error Start (catch-all); both coexist.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/event-subprocesses/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "layered error handling", "Boundary + Event Subprocess." Multi-layer pattern.

**Въпросът → Solution Framing.** "Coexist" — изпитва се knowledge на error propagation layers.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Boundary е activity-specific, че Event Subprocess е scope-catch-all, че propagation rules order: activity → scope → parent. Това е знание за layered error handling.

---

## Question 5: Modeling (Weighting: 15%)

**Scenario:** A company has 3 organisational roles: Sales, Operations, Compliance. The team's BPMN has tasks that should be visually assigned per role. They model with one Pool, three Lanes.

**Best practice for using Lanes to represent roles?**

- **a)** **One Lane per role**: Sales Lane, Operations Lane, Compliance Lane. Place each task in its respective Lane based on which role performs it. Note: **Lanes are visual; they don't auto-assign tasks**. Actual assignment uses `assignmentDefinition` (candidateUsers / candidateGroups) on User Tasks — set these to match the Lane's role conceptually. Lanes communicate intent visually to readers; assignment configures execution. Both layers should align. Documentation: [Lanes](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/) + [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** Lanes auto-assign tasks to matching role — incorrect; visual only. Documentation: [Lanes](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **c)** Use Pools instead of Lanes — wrong scope; Pools = separate participants. Documentation: [Pools](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **d)** Lanes are obsolete — wrong; standard BPMN feature. Documentation: [Lanes](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Lanes are visual subdivisions within a Pool — for organising activities by role / department / responsibility. **Important distinction**:
  - **Visual layer (Lanes)**: communicates "which role / team does this work." Readers see which Lane a task is in.
  - **Execution layer (assignmentDefinition)**: actually configures who can claim / complete the task. Sets candidateGroups / candidateUsers.

  Lanes do NOT auto-assign tasks. They're documentation / visual organisation. Camunda's User Task assignment (which controls who can pick the task in Tasklist) uses `assignmentDefinition` attributes, NOT the Lane.

  **Best practice for role-based modelling**:
  1. Define Lanes per role: Sales, Operations, Compliance.
  2. Place each User Task in the appropriate Lane.
  3. For each User Task, configure `assignmentDefinition` with the matching role's group: e.g., `candidateGroups = "sales-team"`.
  4. The visual (Lane) and execution (assignment) align consistently.

  If a task's Lane and assignmentDefinition diverge, it confuses readers and may indicate a modelling error.

- **Option b) — Wrong.** Visual only.

- **Option c) — Wrong scope.** Pools = participants.

- **Option d) — Wrong.** Standard.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Lane per role (visual) + assignmentDefinition matching (execution); both align.
- **b) 2/10** — wrong; visual only.
- **c) 2/10** — wrong scope.
- **d) 1/10** — wrong; standard.

**Correct Answer:** One Lane per role + `assignmentDefinition` (candidateGroups) matching the Lane's role; visual + execution layers align.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "3 roles", "Lanes per role." Role assignment via Lanes.

**Въпросът → Solution Framing.** "Best practice using Lanes" — изпитва се knowledge на Lane visual vs execution.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Lanes visual, че assignmentDefinition controls execution, че both layers should align. Това е знание за role-based modelling.

---

## Question 6: Modeling (Weighting: 15%)

**Scenario:** A team designs a process where instances start from **two sources**: (1) an API call from a back-office UI, (2) a Message from a partner system. They wonder if they need two Start Events or one.

**Should two trigger sources use one Start Event or two?**

- **a)** **Two Start Events — one None Start, one Message Start** — each tied to its trigger source. The downstream BPMN can either: (1) **converge immediately** via a join (the rest of the process is shared); (2) **diverge slightly** if back-office and partner-triggered instances need different initial steps before converging. **Different triggers, different Start Events** is the BPMN-canonical pattern. Documentation: [BPMN Events](https://docs.camunda.io/docs/components/modeler/bpmn/) + [Message Events](https://docs.camunda.io/docs/components/modeler/bpmn/message-events/)

- **b)** One Start Event that handles both — incorrect; each event type has one trigger source. Documentation: [BPMN Events](https://docs.camunda.io/docs/components/modeler/bpmn/)

- **c)** Two separate process definitions — overkill; one process with two Start Events. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

- **d)** Use Conditional Start Event — invented in C8; not native. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** BPMN supports multiple Start Events per process, each with its own trigger type:
  - **None Start Event**: triggered by explicit API call (POST /v2/process-instances).
  - **Message Start Event**: triggered by a published message matching the event's name.
  - **Timer Start Event**: triggered by a schedule.
  - **Signal Start Event**: triggered by a broadcast Signal.

  For "two trigger sources" (API + Message):
  - Place a None Start Event for the API trigger.
  - Place a Message Start Event for the partner Message.
  - **Common downstream**: both Start Events' outgoing arrows converge to the shared first activity (or after a brief diverge for source-specific initial setup, then converge).

  Single BPMN file; two trigger paths; unified main flow. Operate / monitoring sees instances regardless of trigger source. This is more maintainable than two separate process definitions.

  Variations:
  - **Diverge before converge**: each Start Event has 1-2 source-specific initial activities (e.g., logging the trigger source) before converging.
  - **Variables for trigger origin**: set a `triggerSource = "API"` or `"Message"` variable in Input Mapping at each Start Event for downstream awareness.

- **Option b) — Wrong.** Single Start Event has single trigger type.

- **Option c) — Overkill.** One process with multiple Start Events.

- **Option d) — Wrong.** No Conditional Start in C8.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Two Start Events (None + Message), shared downstream flow.
- **b) 2/10** — wrong; single trigger per event.
- **c) 4/10** — overkill.
- **d) 1/10** — invented in C8.

**Correct Answer:** Two Start Events — None Start (API) + Message Start (partner) — converging to shared flow.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "two sources", "API + Message." Multi-trigger pattern.

**Въпросът → Solution Framing.** "One or two Start Events" — изпитва се knowledge на multi-Start pattern.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BPMN supports multiple Start Events per process, че each Start Event has one trigger type, че downstream converges. Това е знание за multi-trigger processes.

---

## Question 7: Modeling (Weighting: 15%)

**Scenario:** A team's XOR Gateway has 3 outgoing flows: `=age < 18`, `=age >= 65`, `=score > 80`. They wonder what happens if a record matches **multiple conditions** (e.g., age=70 AND score=85 — both `>=65` and `>80` true).

**What happens when multiple XOR Gateway conditions match?**

- **a)** **XOR takes the FIRST matching flow** in declaration / evaluation order — engine evaluates flows in their order; first one whose condition is true is taken; remaining flows are NOT evaluated. **The order is significant**. To avoid ambiguity, design mutually-exclusive conditions OR rely on the engine's deterministic ordering. If conditions can overlap, this can lead to subtle bugs — prefer either:
  - **Mutually exclusive conditions** with explicit `else` (default flow).
  - **Inclusive Gateway** for "one-or-many matching branches."
  
  Documentation: [Exclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/)

- **b)** All matching flows activated — wrong; that's Inclusive semantic. Documentation: [Inclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/inclusive-gateways/)

- **c)** Random selection — wrong; deterministic order. Documentation: [Exclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/)

- **d)** Engine raises an error — incorrect; first match wins silently. Documentation: [Exclusive Gateway](https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** **Exclusive Gateway (XOR) semantics**: exactly one outgoing flow is taken. When multiple conditions evaluate true, the engine picks the first matching flow per its evaluation order (typically the order they appear in BPMN XML). Remaining flows aren't evaluated; only the chosen path executes.

  **Implications**:
  - **Order matters**: if you have overlapping conditions, the order in BPMN determines outcome.
  - **Hidden bugs possible**: if a reader doesn't realise conditions overlap, they may be surprised by which flow is taken.

  **Best practices**:
  - **Design mutually exclusive conditions**: ensure only one matches at a time (e.g., partition the input space cleanly).
  - **Use default flow**: explicit "else" path for "no other matches"; reduces ambiguity.
  - **Document overlap intent**: if overlap is intentional (e.g., priority order encoded in flow order), comment in BPMN.
  - **Consider Inclusive Gateway**: if multiple branches should activate when conditions overlap, that's Inclusive's design.

  For the scenario (age=70, score=85 matching `>=65` and `>80`):
  - XOR takes whichever appears first in flow order. If `age >= 65` is first, that path runs; `score > 80` skipped.
  - If you wanted both to run (parallel handling), use Inclusive Gateway.

- **Option b) — Wrong.** Inclusive semantic.

- **Option c) — Wrong.** Deterministic.

- **Option d) — Wrong.** First match silent.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. XOR takes first match by flow order; design mutually exclusive or use Inclusive.
- **b) 2/10** — Inclusive semantic.
- **c) 2/10** — deterministic.
- **d) 2/10** — wrong; silent.

**Correct Answer:** XOR takes the first matching flow in declaration order; design mutually exclusive conditions or use Inclusive Gateway for overlap.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "XOR Gateway multiple conditions match." Overlap behaviour.

**Въпросът → Solution Framing.** "What happens" — изпитва се knowledge на XOR semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че XOR takes first match, че order matters, че mutually exclusive design + default flow + Inclusive alternative. Това е знание за XOR conflict semantics.

---

## Question 8: Modeling (Weighting: 15%)

**Scenario:** A document-approval process has a User Task `review-document`. If the reviewer requests changes, the document goes back for **revision** (a Service Task), then to review again. This **back-and-forth loop** can repeat several times until approved.

**Which BPMN pattern fits a rework loop with potential multiple iterations?**

- **a)** **BPMN explicit loop pattern**: User Task → XOR Gateway "approved?" → if Yes → continue downstream; if No → Service Task "Revise Document" → back-edge sequence flow → User Task (re-enters). The loop continues until "approved" branch is taken. The back-edge is a sequence flow from the revise task back to the review User Task. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/) + [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** Multi-Instance — wrong; MI is for parallel / sequential iteration over a collection, not conditional rework. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Standard Loop marker — works conceptually but Zeebe coverage limited; explicit Gateway + back-edge more reliable. Documentation: [BPMN coverage](https://docs.camunda.io/docs/components/modeler/bpmn/bpmn-coverage/)

- **d)** Compensation — wrong; compensation is saga rollback, not iterative rework. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Rework loops in BPMN: explicit Gateway + back-edge sequence flow:

  ```
  [Submit Document] → [Review (User Task)] → [XOR Gateway: approved?]
                                              → Yes → [Publish] → [End]
                                              → No  → [Revise (Service Task)] ─┐
                       ┌───────────────────────────────────────────────────────┘
                       └─ back-edge: revise → re-enters Review
  ```

  Properties:
  - **Visible**: readers see the loop structure in the diagram.
  - **Trackable in Operate**: each iteration shows as a distinct User Task activation; you can see how many revisions happened.
  - **Variable handling**: variables update each iteration; ensure no unintended state carries over.
  - **Termination**: loop exits via the "approved" branch.
  - **Safety**: consider a max-iteration safeguard (e.g., after 5 revisions, escalate). Achieve via a counter variable + condition; or wrap in a Subprocess with Timer Boundary.

  Best practice for back-edges:
  - **Visual clarity**: route the back-edge clearly; avoid crossing other elements.
  - **Annotate**: comment to explain the loop's purpose.

- **Option b) — Wrong concept.** MI iterates a collection.

- **Option c) — Coverage limited.** Explicit Gateway + back-edge more reliable.

- **Option d) — Wrong concept.** Compensation = saga rollback.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Explicit Gateway + back-edge sequence flow; visible in diagram + Operate.
- **b) 3/10** — wrong concept (MI = collection iteration).
- **c) 5/10** — coverage limited.
- **d) 2/10** — wrong concept.

**Correct Answer:** XOR Gateway + back-edge sequence flow returning to the review User Task; visible explicit loop.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "rework loop", "back-and-forth." Conditional iteration.

**Въпросът → Solution Framing.** "Pattern for rework loop" — изпитва се knowledge на BPMN looping.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че explicit Gateway + back-edge е canonical loop, че MI is for collection iteration, че Standard Loop coverage limited, че Compensation е different. Това е знание за BPMN rework patterns.

---

## Question 9: Modeling (Weighting: 15%)

**Scenario:** A multi-step payment process has nested Embedded Subprocesses: outer "Process Order" contains inner "Process Payment" subprocess. Within the inner, there are compensable activities (`charge-card` etc.). The team wonders about Compensation scope in nested subprocesses.

**How does Compensation scope work in nested subprocesses?**

- **a)** **Compensation is scoped per subprocess**:
  - **Inner subprocess compensable activities** + their Compensation Boundaries: compensation thrown inside the inner subprocess affects only inner-subprocess-scoped completed activities.
  - **Throwing compensation in the outer subprocess** can affect outer-scoped activities; if you want to compensate inner-subprocess activities from the outer, the inner subprocess must propagate / re-throw compensation upward (or the compensation handler on the outer's invocation of the inner subprocess handles undoing the inner's effects).
  
  Best practice: keep compensation logic close to where the compensable work was done; throw compensation at the appropriate scope. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **b)** All compensation handlers in the whole process fire — wrong; scoped. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **c)** Compensation only at top-level — wrong; works in nested scopes. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

- **d)** Nested subprocesses don't support compensation — incorrect. Documentation: [Compensation Events](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Compensation operates within scope boundaries:
  - **Compensation Throw at scope X**: triggers compensation for completed activities **within scope X** that have attached Compensation Boundary Events.
  - **Nested scopes**: each subprocess has its own scope. Compensation thrown in an inner subprocess walks back inner-scope completed activities.

  **Cross-scope compensation patterns**:
  - **Outer needs to compensate inner's work**: the outer's invocation of the inner subprocess can have a Compensation Boundary on the subprocess element. The Boundary's handler is responsible for "undoing the inner subprocess's effects" — typically by invoking another subprocess or worker that knows how to undo what the inner did.
  - **Inner propagation**: if the inner subprocess has its own compensation logic (Throw in inner; compensates inner's activities), reaching out to compensate outer's separate completed activities requires a different mechanism (typically by throwing compensation in the outer scope after the inner completes / fails).

  Design implication: model compensation handlers at the appropriate scope. Don't expect compensation to magically reach across all subprocess boundaries — it follows the throwing event's scope.

  Verify your Zeebe version's coverage of nested compensation; complex compensation patterns can have edge-case behaviour.

- **Option b) — Wrong.** Scoped.

- **Option c) — Wrong.** Nested supported.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Compensation scoped per subprocess; cross-scope requires explicit propagation patterns.
- **b) 2/10** — wrong; scoped.
- **c) 2/10** — wrong; nested supported.
- **d) 1/10** — wrong; supported.

**Correct Answer:** Compensation is scoped per subprocess; for cross-scope, use Compensation Boundary on the outer's invocation of inner subprocess.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "nested subprocesses", "Compensation scope." Nested compensation.

**Въпросът → Solution Framing.** "How Compensation scope works" — изпитва се knowledge на compensation propagation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че compensation scoped, че cross-scope needs explicit pattern, че Compensation Boundary on subprocess invocation. Това е знание за nested compensation.

---

# Section 2 — Configuring Processes (Questions 10-22)

> Weight 22% • Topics: Job activation order, nested variable access, User Task priority, MI stable order, Document Handling cancel cleanup, IDP feedback loop, Element Template grouping, AI Agent system prompt versioning, Service Task no worker, cron alternative, multi-instance correlation, Boundary detach semantics, variable size limits.

---

## Question 10: Configuring Processes (Weighting: 22%)

**Scenario:** A high-throughput worker subscribes to `process-payment`. Many jobs queue at the broker. The team wonders if Zeebe activates jobs in **FIFO order** (first created first activated) or by some priority.

**What order does Zeebe activate jobs in for a given task type?**

- **a)** **By default, Zeebe activates jobs in roughly chronological / FIFO order** — jobs created earlier tend to be activated first. The exact ordering depends on partition distribution and worker polling patterns. **No native job priority** mechanism in the standard Zeebe API; jobs are treated equally within a task type. For prioritisation: model with separate task types (e.g., `process-payment-high`, `process-payment-normal`) and dedicated workers / different `maxJobsActive` per priority class. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **b)** Random — incorrect; chronological tendency. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** By process variable priority — incorrect; no native priority. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Most recent first — incorrect; chronological. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe's job activation is roughly chronological per partition:
  - **Within a partition**: jobs are stored as events in the partition's log; activation tends to follow creation order.
  - **Across partitions**: parallel; no global ordering guarantee.
  - **Across workers**: each worker polls; the broker delivers available jobs.

  **No native priority**: there's no "priority" attribute on jobs that the broker uses to reorder activation. All jobs of the same type are treated equally.

  **Patterns for prioritisation**:
  - **Separate task types** by priority: `process-payment-high` (handled by dedicated workers), `process-payment-normal` (handled by other workers). The BPMN uses gateways to route to the appropriate task type based on priority.
  - **Dedicated worker fleets**: high-priority workers process high-priority task type with higher `maxJobsActive` / more workers. Normal-priority workers scale based on volume.
  - **Worker-side filtering**: a worker fetches jobs and decides priority client-side; not ideal because client-side prioritisation doesn't help when jobs are already activated.

  For true priority, the **separate-task-types pattern** is the canonical Zeebe approach.

- **Option b) — Wrong.** Chronological.

- **Option c) — Wrong.** No native priority.

- **Option d) — Wrong.** Chronological (older first tendency).

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Roughly FIFO per partition; no native priority; use separate task types for prioritisation.
- **b) 2/10** — wrong; chronological.
- **c) 2/10** — wrong; no native priority.
- **d) 2/10** — wrong; older first.

**Correct Answer:** Roughly FIFO / chronological per partition; no native priority; use separate task types for prioritisation.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "FIFO or priority job activation." Job ordering.

**Въпросът → Solution Framing.** "Order of activation" — изпитва се knowledge на Zeebe job ordering.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe е roughly chronological, че no native priority, че separate task types е the prioritisation pattern. Това е знание за job ordering.

---

## Question 11: Configuring Processes (Weighting: 22%)

**Scenario:** A worker reads a nested process variable: `customer.address.city`. The team wonders if Input Mapping FEEL needs special syntax for deep nesting.

**How does Input Mapping navigate nested variable structures?**

- **a)** **Use FEEL dot navigation**: `Source: =customer.address.city, Target: deliveryCity`. FEEL handles arbitrary nesting via dots. For dynamic keys, bracket access: `customer["address"]["city"]`. Both work; dots are typical for static known keys. **Null safety**: if any intermediate is null, the expression evaluates to null (FEEL null-tolerant). For safe access in uncertain shapes: `=if customer != null and customer.address != null then customer.address.city else null`. Documentation: [I/O Mappings](https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings) + [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** Only top-level access supported — wrong; deep nesting works. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Use special path syntax — partial; FEEL dot navigation is the standard. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Flatten variables first — workaround; FEEL handles nesting directly. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL provides natural deep-nesting access:

  **Dot navigation** (static known keys):
  - `customer.name` (top-level field).
  - `customer.address.city` (two-level deep).
  - `order.lineItems[1].product.category` (deep with list indexing).

  **Bracket access** (dynamic keys):
  - `customer["address"]["city"]` — equivalent to dots.
  - `customer[dynamicFieldName]` — when key is computed.

  **Null safety**:
  - FEEL is null-tolerant: `null.field` returns null (no NullPointerException).
  - Whole expression with nested access may evaluate to null if any step is null.
  - For defensive coding: `=if customer != null and customer.address != null then customer.address.city else "unknown"`.

  Input Mapping FEEL evaluates against the current scope's variables; nested access is transparent.

  Practical use: extract specific nested fields without bringing the whole parent object into worker scope; reduces bandwidth + clarifies worker contract.

- **Option b) — Wrong.** Deep nesting works.

- **Option c) — Partial.** Dot navigation IS the path syntax.

- **Option d) — Workaround.** Not needed.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL dot navigation arbitrary depth; bracket for dynamic; null-safe with checks.
- **b) 1/10** — wrong; works.
- **c) 5/10** — partial.
- **d) 4/10** — workaround.

**Correct Answer:** Use FEEL dot navigation (`customer.address.city`); null-safe via defensive checks.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "nested customer.address.city." Deep nesting.

**Въпросът → Solution Framing.** "Navigate nested variables" — изпитва се FEEL navigation.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че dot navigation works for arbitrary depth, че bracket alternatives, че null-safety patterns. Това е знание за FEEL nested access.

---

## Question 12: Configuring Processes (Weighting: 22%)

**Scenario:** A User Task `review-request` has a `priority` attribute (in some BPMN tooling). The team wonders if Tasklist uses this for sorting or visual cues.

**Does User Task `priority` attribute affect Tasklist behaviour?**

- **a)** **Depends on Tasklist version and configuration**: many versions support priority sorting / filtering in the task list view, using either:
  - **BPMN-modelled priority attribute** on the User Task element.
  - **Process variable convention** (`priority` variable set on the task / instance).
  
  Tasklist may show priority indicators (icons / colours) and allow sort-by-priority. Verify the specific Tasklist version's support. Best practice: set priority via a process variable (more flexible than hardcoded BPMN attribute) and configure Tasklist to use it. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/) + [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** Priority always sorts in Tasklist — partial; depends on version. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **c)** Priority is informational only — partial. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **d)** No priority support — wrong; supported. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** User Task priority handling:
  - **BPMN attribute**: some BPMN tooling supports a `priority` attribute on User Task elements. Used by Camunda 8 in some versions / configurations.
  - **Process variable convention**: set `priority` as a process variable; Tasklist (if configured) reads and uses for sorting / filtering.

  Tasklist features (depending on version):
  - **Sort by priority**: users see urgent tasks first.
  - **Filter by priority**: e.g., "show only HIGH priority."
  - **Visual indicators**: badges / colours per priority level.

  Best practices:
  - **Set priority dynamically**: based on process variables, business rules. E.g., a Service Task before the User Task evaluates rules and sets `priority`.
  - **Consistent values**: enumeration like `"HIGH" / "MEDIUM" / "LOW"` for clarity.
  - **Document priority semantics**: what each level means for ops.

  Verify your Tasklist version's specific support. Camunda 8's task priority handling has evolved.

- **Option b) — Partial.** Depends on version.

- **Option c) — Partial.** Functional in many versions.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Tasklist priority sorting / filtering; via BPMN attribute or process variable.
- **b) 5/10** — partial; version-dependent.
- **c) 5/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Depends on version; Tasklist typically supports priority sorting / filtering via BPMN attribute or process variable.

**Official Documentation Link:** https://docs.camunda.io/docs/components/tasklist/userguide/using-tasklist/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "priority attribute User Task." Task priority.

**Въпросът → Solution Framing.** "Affects Tasklist" — изпитва се knowledge на Tasklist UX features.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че priority via attribute / variable, че Tasklist може to sort / filter, че version-dependent. Това е знание за Tasklist priority.

---

## Question 13: Configuring Processes (Weighting: 22%)

**Scenario:** A Sequential MI subprocess processes `tasks` list. The team needs **stable iteration order** — first item in the list processed first, second second, etc. They wonder if Sequential MI guarantees this.

**Does Sequential MI guarantee processing order matching inputCollection order?**

- **a)** **Yes — Sequential MI processes inner instances one at a time, in `inputCollection` order**. Instance 1 receives `inputCollection[1]`, completes; instance 2 receives `inputCollection[2]`, completes; etc. Stable / deterministic. Combined with `outputCollection` (position-correspondent), the result is fully ordered. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **b)** No — concurrent — incorrect; that's Parallel MI. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **c)** Order is implementation-defined — wrong; Sequential MI deterministic. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

- **d)** Only Parallel MI is supported — incorrect; both modes supported. Documentation: [Multi-Instance](https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Sequential MI semantics:
  - **One inner instance at a time**: instance N starts only after instance N-1 completes.
  - **Order**: matches inputCollection's order. Instance 1 ↔ inputCollection[1], etc.
  - **Deterministic**: same input → same processing order.
  - **outputCollection**: position-correspondent (per Set 10 Q8 — outputCollection[i] matches inputCollection[i]).

  Use cases for Sequential MI:
  - **Order matters**: process items in their list order (chronological, priority, etc.).
  - **Rate limiting**: external API requires serial processing.
  - **State accumulation**: each iteration depends on previous (via parent-scope updates or outputCollection accumulation).

  Contrast with Parallel MI:
  - All inner instances spawn concurrently.
  - Completion order is non-deterministic (which instance finishes first depends on worker availability, processing time, etc.).
  - outputCollection still position-correspondent (per inputCollection index).

  For "stable processing order": Sequential MI is the explicit choice.

- **Option b) — Wrong.** That's Parallel.

- **Option c) — Wrong.** Deterministic.

- **Option d) — Wrong.** Both supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Sequential MI processes one at a time in inputCollection order; deterministic.
- **b) 2/10** — wrong; Parallel concurrent.
- **c) 2/10** — wrong; deterministic.
- **d) 1/10** — wrong; both supported.

**Correct Answer:** Yes — Sequential MI processes in inputCollection order, deterministically; outputCollection position-correspondent.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Sequential MI stable order." Order guarantee.

**Въпросът → Solution Framing.** "Stable iteration order" — изпитва се knowledge на Sequential MI.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Sequential е one-at-a-time in inputCollection order, че Parallel е concurrent, че outputCollection position-correspondent. Това е знание за Sequential MI semantics.

---

## Question 14: Configuring Processes (Weighting: 22%)

**Scenario:** A document workflow uploads PDFs via Document Handling. If a process instance is **cancelled** (via Operate or BPMN logic), the team wonders what happens to associated documents — do they auto-delete?

**Does cancelling a process instance auto-delete its Document Handling documents?**

- **a)** **Documents typically don't auto-delete on instance cancellation** — Document Handling decouples the document lifecycle from the process instance. Cancelling the instance removes the process state but documents in the storage backend persist (subject to their own TTL if configured). For cleanup on cancel:
  - **Configure TTL** at upload: documents expire automatically after the TTL window.
  - **Explicit cleanup**: model a "cancel handler" path (Event Subprocess catching the cancel; or in the instance modify operation) that calls Documents API DELETE for cleanup.
  - **External cleanup process**: periodic batch job that finds orphan documents (no active instance referencing them) and deletes.
  
  Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **b)** Documents auto-delete on instance cancel — partial; depends on configuration; typically not. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **c)** Documents always persist forever — partial; TTL or explicit delete cleans up. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **d)** Cancelling fails if documents exist — wrong; independent. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Document Handling's decoupled design:
  - **Documents stored in storage backend** (S3 / Azure / GCS / filesystem) independently of process instance.
  - **Process variables hold references**, not the binaries.
  - **Cancelling instance**: removes process state (history may persist depending on retention); variables removed; **documents remain in storage backend**.

  For cleanup on cancel:

  **Option 1: TTL at upload**
  - Set `timeToLive` / `expiresAt` when uploading.
  - Documents auto-expire after TTL.
  - Works without explicit cleanup logic.

  **Option 2: Explicit cleanup in BPMN**
  - Model a "cancellation handler" path: when instance is cancelled (e.g., via Compensation, Event Subprocess catching cancel events, or via Modify Instance pre-cancel), call Documents API DELETE for each document the instance owned.

  **Option 3: External orphan cleanup**
  - Periodic job queries instances → finds documents referenced by cancelled / completed instances → deletes those over retention age.

  Choose based on compliance requirements:
  - **Strict cleanup (GDPR-style)**: explicit cleanup in cancel handler; TTL as defence-in-depth.
  - **Loose cleanup**: TTL-only; let documents age out.

- **Option b) — Partial.** Depends on configuration.

- **Option c) — Partial.** TTL / explicit cleanup options.

- **Option d) — Wrong.** Independent.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Documents decoupled from instance lifecycle; auto-cleanup requires TTL or explicit DELETE.
- **b) 4/10** — partial.
- **c) 5/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Documents don't auto-delete on instance cancel; use TTL at upload OR explicit Documents API DELETE in cancel handler.

**Official Documentation Link:** https://docs.camunda.io/docs/components/document-handling/document-handling/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "instance cancelled", "auto-delete documents." Cancel-cleanup question.

**Въпросът → Solution Framing.** "Auto-delete on cancel" — изпитва се knowledge на Document lifecycle.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че documents decoupled, че TTL + explicit cleanup options, че external orphan cleanup possible. Това е знание за Document Handling cleanup patterns.

---

## Question 15: Configuring Processes (Weighting: 22%)

**Scenario:** An IDP application's accuracy isn't great — frequent low-confidence extractions trigger human review. The team wants to **improve IDP accuracy over time** by feeding back human corrections.

**Does IDP support feedback loops from human corrections?**

- **a)** **IDP's typical workflow includes a feedback loop**:
  1. IDP extracts → confidence low → human reviews → corrects fields.
  2. Corrected examples are **fed back** to IDP for retraining / refinement.
  3. Over time, IDP improves accuracy on similar documents.
  
  Implementation: configure the IDP Application to **collect corrected examples**; periodically retrain. Some Camunda IDP versions automate this; others require manual review + retraining. Verify per Camunda 8 / IDP version. The BPMN pattern: human-review task that captures corrected data; the data feeds a backend retraining pipeline. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/idp-applications/)

- **b)** IDP is static — no learning — incorrect; feedback loops core to IDP value. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **c)** Corrections discarded after review — wrong; can be fed back. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

- **d)** Retrain by re-uploading samples — partial; correct but feedback loop is more structured. Documentation: [IDP](https://docs.camunda.io/docs/components/modeler/web-modeler/idp/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** IDP's lifecycle includes continuous improvement:

  **Initial training**:
  - Team uploads sample documents + correct extractions.
  - IDP trains the extraction model.

  **Production extraction**:
  - Documents come in; IDP extracts with confidence scores.
  - High-confidence → automated path.
  - Low-confidence → human review path.

  **Human review feedback**:
  - Reviewer sees IDP's extraction + original document.
  - Corrects fields where wrong; confirms where right.
  - Corrected data is the "ground truth" for that document.

  **Feedback to IDP**:
  - Corrected examples become new training samples.
  - Periodic retraining: IDP incorporates corrections; model improves.
  - Improved model → better future extractions → less human review needed.

  This virtuous cycle is the value proposition of "human-in-the-loop IDP." Over months, accuracy climbs; human reviews become the exception.

  Implementation specifics vary by Camunda 8 / IDP version:
  - **Automated**: IDP Application has built-in feedback collection + retraining triggers.
  - **Manual**: team periodically exports corrected examples; uploads to IDP for retraining.
  - **Hybrid**: automated collection; manual retraining trigger.

  Verify per current Camunda IDP version's capabilities.

- **Option b) — Wrong.** Feedback core.

- **Option c) — Wrong.** Can be fed back.

- **Option d) — Partial.** Feedback loop is more structured than ad-hoc re-upload.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Feedback loop: human corrections → retraining → improved accuracy over time.
- **b) 2/10** — wrong; feedback core.
- **c) 2/10** — wrong; can feed back.
- **d) 5/10** — partial.

**Correct Answer:** Yes — IDP supports feedback loops; human corrections become training data; periodic retraining improves accuracy.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/web-modeler/idp/idp-applications/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "IDP feedback loop", "improve over time." Continuous learning.

**Въпросът → Solution Framing.** "Feedback loops" — изпитва се knowledge на IDP lifecycle.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че IDP supports feedback, че human-in-the-loop pattern, че retraining periodic. Това е знание за IDP improvement.

---

## Question 16: Configuring Processes (Weighting: 22%)

**Scenario:** An Element Template has 12 properties. The team wants to **group them visually in the property panel** — common groups like "Authentication", "Endpoint", "Behaviour".

**How are Element Template properties visually grouped?**

- **a)** **Define `groups` in the Element Template JSON** (a top-level array of group definitions with IDs and labels), then **assign each property to a group** via the `group` field on the property. Web Modeler / Desktop Modeler renders properties under collapsible group headers in the property panel. Improves UX for templates with many properties — modelers find what they need faster. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **b)** Group by property order — partial; specific groups via `group` attribute. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **c)** Grouping not supported — incorrect; supported. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **d)** Define separate templates per group — wasteful; one template with groups. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Element Template `groups` feature for organisation:

  **JSON structure**:
  ```json
  {
    "$schema": "...",
    "name": "Slack Connector",
    "groups": [
      { "id": "auth", "label": "Authentication" },
      { "id": "target", "label": "Target Channel" },
      { "id": "message", "label": "Message Configuration" },
      { "id": "advanced", "label": "Advanced Settings" }
    ],
    "properties": [
      { "label": "OAuth Token", "type": "String", "group": "auth", ... },
      { "label": "Channel Name", "type": "String", "group": "target", ... },
      { "label": "Message Body", "type": "Text", "group": "message", ... },
      ...
    ]
  }
  ```

  **Web Modeler rendering**:
  - Property panel shows collapsible sections per group.
  - Group order in JSON determines display order.
  - Modelers expand / collapse groups as needed.

  **UX benefits**:
  - Quickly locate properties (less scrolling through long flat lists).
  - Logical clustering signals which properties relate.
  - Collapse rarely-used groups to focus on common ones.

  Best practices:
  - **Meaningful group names**: "Authentication" beats "Group 1".
  - **Don't over-group**: 3-5 groups typically optimal; too many fragments.
  - **Order groups by use frequency**: most-used first.

- **Option b) — Partial.** Specific via `group` attribute.

- **Option c) — Wrong.** Supported.

- **Option d) — Wasteful.** Single template with groups.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. groups array in JSON + group field on each property; Web Modeler renders collapsible sections.
- **b) 4/10** — partial.
- **c) 1/10** — wrong; supported.
- **d) 3/10** — wasteful.

**Correct Answer:** Define `groups` in Element Template JSON; assign each property to a group via `group` field.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "group 12 properties visually." UX for templates.

**Въпросът → Solution Framing.** "How grouped" — изпитва се knowledge на Element Template groups feature.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че groups array + property's group field, че Web Modeler renders collapsible sections, че UX benefits. Това е знание за Element Template grouping.

---

## Question 17: Configuring Processes (Weighting: 22%)

**Scenario:** A team's AI Agent has a **system prompt** that evolves over time as the team refines the agent's behaviour. They wonder about **managing system prompt versions** — track changes, A/B test, roll back if needed.

**How might a team manage AI Agent system prompt versions?**

- **a)** **Multiple approaches**:
  - **In BPMN**: prompts inline in AI Agent Connector property; versioned with the BPMN (each BPMN deployment is a snapshot). Changes require BPMN redeployment.
  - **External config**: prompts in a centralised store (database / Git repo); BPMN references via FEEL expression that fetches at runtime. More flexible; rolling out a prompt change doesn't require BPMN redeployment.
  - **A/B testing**: split traffic via XOR Gateway based on customer ID hash; some instances use prompt v1, others v2. Compare outcomes.
  - **DMN-driven**: prompt selection via DMN rules ("which prompt for which scenario?"). Easy to maintain.

  Pick based on prompt-change cadence and ops sophistication. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **b)** Hardcode prompts; never change — wrong; iteration valuable. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **c)** Camunda manages prompt versions automatically — partial; depends on configuration. Documentation: [Agentic Orchestration](https://docs.camunda.io/docs/components/agentic-orchestration/)

- **d)** Version control prompts in BPMN only — partial; multiple approaches. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** AI Agent system prompt management deserves the same rigor as any production-critical config:

  **Pattern 1: Inline in BPMN**
  - Pro: simple; versioned with BPMN.
  - Con: prompt changes require BPMN redeployment; can't A/B test easily.

  **Pattern 2: External config store**
  - Prompts in Git repo / database; BPMN AI Agent property reads via FEEL: `=lookupPrompt("customer-service-agent-v2")`.
  - Pro: prompt changes don't need BPMN redeploy; centralised; easy A/B test (lookup includes version param).
  - Con: extra layer; lookup mechanism to maintain.

  **Pattern 3: A/B testing via Gateway**
  - XOR Gateway splits traffic before AI Agent: `=hash(customerId) mod 100 < 10` → use prompt v2 (10% sample); else prompt v1.
  - Compare outcomes (customer satisfaction, completion rate, etc.) before full rollout.

  **Pattern 4: DMN-driven**
  - DMN decision returns the prompt string based on inputs (customer tier, language, context).
  - BPMN reads DMN result; passes to AI Agent.
  - Maintain prompts in DMN decision table (easy to add / remove rows).

  Production maturity: combine patterns. Source-control prompts; deploy via CI; A/B test before full rollout; monitor outcomes.

  Specific Camunda IDP / AI features may add native prompt management — verify per version.

- **Option b) — Wrong.** Iteration valuable.

- **Option c) — Partial.** Depends.

- **Option d) — Partial.** Multiple approaches.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Inline + external store + A/B + DMN-driven; pick per maturity.
- **b) 1/10** — wrong; iteration.
- **c) 4/10** — partial.
- **d) 5/10** — partial.

**Correct Answer:** Multiple approaches — inline + external config + A/B testing + DMN-driven; pick per maturity / cadence.

**Official Documentation Link:** https://docs.camunda.io/docs/components/agentic-orchestration/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "manage AI Agent system prompt versions." Prompt management.

**Въпросът → Solution Framing.** "How manage versions" — изпитва се knowledge на prompt versioning approaches.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че inline / external / A/B / DMN са options, че maturity drives choice. Това е знание за prompt management patterns.

---

## Question 18: Configuring Processes (Weighting: 22%)

**Scenario:** A Service Task has `zeebe:taskDefinition type="payment"` but **no worker is currently subscribed** to that type. An instance activates the task. What happens?

**What happens when a Service Task activates but no worker is subscribed to its type?**

- **a)** **The job is created in the broker's activatable pool, waiting for a worker** to subscribe and pick it up. The job sits indefinitely until a worker subscribes; no automatic timeout / failure. **Visibility**: in Operate, the activity shows as "active" (not stuck per se — just waiting for a worker). **Detection**: monitor with metrics ("jobs not activated within X seconds") or alerts; investigate worker fleet health. **Mitigations**:
  - **Worker health monitoring**: alert when workers stop subscribing.
  - **Timer Boundary** on the Service Task: cap how long the task can wait; route to a handler on timeout.
  
  Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/) + [Operate](https://docs.camunda.io/docs/components/operate/)

- **b)** Job auto-fails — incorrect; waits. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **c)** Instance is cancelled — incorrect; instance stays. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

- **d)** Job retries indefinitely — partial; not retries per se; waits for activation. Documentation: [Job Workers](https://docs.camunda.io/docs/components/concepts/job-workers/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Zeebe's job lifecycle when no worker subscribed:

  **Job created**: Service Task activates; Zeebe creates a job of the configured type; job enters the broker's activatable pool.

  **Waiting for activation**:
  - The job sits in the pool waiting for a worker to subscribe and request jobs of this type.
  - No timeout; no auto-failure; sits indefinitely.
  - Instance state: "active" at this activity (the activity is "in progress" — just hasn't had a worker yet).

  **Why this design**: Zeebe is designed to decouple process orchestration from worker availability. Workers can come and go without blocking process advancement. When a worker eventually subscribes, queued jobs activate.

  **Detection / monitoring**:
  - **Metric**: `jobs_pending` per type — alert if > threshold.
  - **Operate**: filter activities by state; see how long they've been active without a worker.
  - **SLA-aware**: instances with critical SLAs should have Timer Boundary to escalate if no worker by deadline.

  **Common causes for no worker**:
  - **Deployment gap**: Service Task type changed in BPMN; worker still subscribes to old type.
  - **Worker crash / network issue**: worker process down; needs restart.
  - **Configuration mismatch**: worker subscribed to wrong type.

  **Resolutions**:
  - Verify worker fleet health (logs, metrics).
  - Confirm subscription to correct task type.
  - Modify Instance if recovery needed.

- **Option b) — Wrong.** No auto-fail.

- **Option c) — Wrong.** Instance stays.

- **Option d) — Partial wording.** Waits, not retries per se.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Job waits in activatable pool indefinitely; monitor + Timer Boundary as mitigation.
- **b) 1/10** — wrong; no auto-fail.
- **c) 1/10** — wrong; stays.
- **d) 4/10** — partial wording.

**Correct Answer:** Job waits in the broker's activatable pool indefinitely until a worker subscribes; monitor + Timer Boundary as mitigation.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/job-workers/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "no worker subscribed", "what happens." Job lifecycle no-worker.

**Въпросът → Solution Framing.** "What happens" — изпитва се knowledge на Zeebe decoupling.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че job waits, че Zeebe decoupled from worker availability, че monitoring + Timer Boundary mitigations. Това е знание за job activation lifecycle.

---

## Question 19: Configuring Processes (Weighting: 22%)

**Scenario:** A team's Timer Cycle uses cron expressions extensively. They wonder if **all Camunda 8 versions** support cron syntax in Timer events, or if some only support ISO 8601.

**Cron vs ISO 8601 in Camunda 8 Timer events?**

- **a)** **Verify per Camunda 8 version**: most recent versions support **both** ISO 8601 (R/PT24H, P30D, etc.) and **cron expressions** (Spring-style, with seconds: `0 0 9 ? * MON-FRI`). Cron syntax is convenient for complex schedules (weekdays only, specific hours, etc.). ISO 8601 is the BPMN-spec format. Pick by readability for the specific schedule. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **b)** Only ISO 8601 — partial; cron also typically supported. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **c)** Only cron — wrong; ISO 8601 standard. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

- **d)** Neither — wrong; both supported. Documentation: [Timer Events](https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Timer events typically support both formats in recent versions:

  **ISO 8601** (BPMN-spec):
  - **Date**: absolute moment, `2026-12-31T23:59:59Z`.
  - **Duration**: relative, `PT4H` (4 hours), `P7D` (7 days).
  - **Cycle**: repeating, `R5/PT1H` (5 times every hour), `R/PT24H` (unbounded daily).

  **Cron** (Spring-style, with seconds):
  - **Format**: `seconds minutes hours day-of-month month day-of-week`.
  - **Examples**:
    - `0 0 9 ? * MON-FRI`: weekdays at 9 AM.
    - `0 30 14 1 * ?`: 1st of every month at 14:30.
    - `0 0 0 ? * SUN`: every Sunday at midnight.
  - Convenient for human-meaningful schedules.

  When to use which:
  - **ISO 8601 Duration / Cycle**: relative timing, well-defined intervals.
  - **Cron**: calendar-specific scheduling (specific days, business hours, etc.).
  - **ISO 8601 Date**: absolute one-shot moment.

  Choose by which is more readable / maintainable for the specific schedule. Some teams standardise on one; others use both pragmatically.

- **Option b) — Partial.** Cron also typically supported.

- **Option c) — Wrong.** ISO 8601 standard.

- **Option d) — Wrong.** Both.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Both ISO 8601 + cron supported; choose by readability.
- **b) 5/10** — partial.
- **c) 2/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Both ISO 8601 and cron (Spring-style with seconds) supported; pick by schedule readability.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/timer-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "cron syntax in Timer." Timer format options.

**Въпросът → Solution Framing.** "Cron vs ISO 8601 support" — изпитва се knowledge на Timer formats.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че both formats typically supported, че cron convenient для calendar schedules, че ISO 8601 for relative / absolute moments. Това е знание за Timer format flexibility.

---

## Question 20: Configuring Processes (Weighting: 22%)

**Scenario:** A team's process has multiple **running instances** of the same processId. They publish a Message with `name = "OrderShipped"` and `correlationKey = "ORD-123"`. Multiple instances have `orderId = "ORD-123"` (mistaken data). What happens?

**What happens when correlation matches multiple instances?**

- **a)** **Zeebe correlates the message to ONE of the matching subscriptions** — typically the first found / oldest. **Best practice**: design correlation keys to uniquely identify a single waiting subscription:
  - Use globally-unique business keys (UUID).
  - Or compose keys: `customerId + "-" + orderId` for uniqueness across customers.
  
  Multiple-match scenarios are usually a design bug; investigate and fix. The other matching subscription remains waiting (until its own correlation event or TTL expiry). Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **b)** All matching subscriptions receive the message — wrong; Message is 1-to-1. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **c)** Message is rejected — wrong; one is selected. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **d)** Random selection — partial; first-found typically; behaviour deterministic per version. Documentation: [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Message correlation in Zeebe is **1-to-1** — each published Message correlates to at most one waiting subscription (not broadcast like Signal). When multiple subscriptions match:
  - The broker picks one (typically the first / oldest matching).
  - Other matching subscriptions remain waiting; they'll correlate to a future Message with the same key (if one arrives) or expire per their own lifecycle.

  **Best practice — unique correlation keys**:
  - Design keys to identify exactly one waiting subscription at any time.
  - **Global unique IDs**: UUIDs guarantee uniqueness.
  - **Compose composite keys**: `customerId + "-" + orderId` is unique if customers don't share orderIds.
  - **Avoid shared keys**: don't reuse the same correlation key for parallel running instances unless intentional.

  **If you observe multiple-match in production**:
  - **Audit**: which instances share the key? Why?
  - **Likely data issue**: customer / order systems duplicated identifiers; investigate upstream.
  - **Resolve**: fix the upstream data; or cancel the duplicate instances.

  **Edge case — intentional multi-match**:
  - Some scenarios may legitimately want to fan out (e.g., a price-change event affecting many orders).
  - Pattern: use **Signal** (broadcast) instead of Message (1-to-1). Signal correlates to all subscriptions matching the signal name.

- **Option b) — Wrong.** Message is 1-to-1.

- **Option c) — Wrong.** One selected.

- **Option d) — Partial.** First-found typically.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. One subscription correlated; design keys for uniqueness; use Signal for broadcast.
- **b) 2/10** — Signal semantic.
- **c) 1/10** — wrong; not rejected.
- **d) 5/10** — partial; first-found typically.

**Correct Answer:** Message correlates to one matching subscription; design unique correlation keys; use Signal for broadcast semantics.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/messages/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "multiple instances same orderId", "correlation matches multiple." Multi-match correlation.

**Въпросът → Solution Framing.** "What happens" — изпитва се knowledge на Message vs Signal semantic.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Message е 1-to-1, че broker picks one matching, че unique keys design + Signal for broadcast. Това е знание за correlation semantics.

---

## Question 21: Configuring Processes (Weighting: 22%)

**Scenario:** A User Task has a non-interrupting Message Boundary. The team wonders if the boundary subscription **detaches** when the User Task completes — i.e., after the task is done, does the subscription remain or end?

**When does a Boundary Event subscription end?**

- **a)** **Boundary subscriptions are scoped to the host activity's lifetime**:
  - **Created**: when the host activity activates.
  - **Active**: while host is in progress.
  - **Destroyed**: when host completes (succeeds or is cancelled).
  
  This applies to all Boundary types (Message, Timer, Error, Escalation). When the User Task completes, all its Boundary subscriptions end; subsequent matching events don't trigger them. Same for Timer Boundaries: timer stops when host completes. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **b)** Subscriptions persist forever — wrong; bounded by host. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **c)** Subscriptions persist for the whole instance lifetime — wrong; scoped to host. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

- **d)** Subscriptions never end — wrong; lifecycle-bound. Documentation: [Boundary Events](https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Boundary Event subscriptions are tightly bound to the host activity's lifecycle:

  **Lifecycle**:
  1. **Host activates** (e.g., User Task is offered to assignee): subscription created.
  2. **Host in progress**: subscription active; events matching it can fire the boundary.
  3. **Host completes** (normally) OR **boundary fires** (interrupting → host cancelled) OR **host cancelled** (e.g., parent scope ends): subscription destroyed.

  After subscription destruction:
  - Future matching events don't trigger the boundary.
  - For Message Boundaries: published Messages with matching correlation are NOT correlated to the destroyed subscription (they may sit in the broker's buffer per TTL, awaiting a different subscription).
  - For Timer Boundaries: the timer is cancelled; remaining time is lost.

  **Implications**:
  - **Message Boundary on long-running task**: if you expect a Message after the task completes, the Boundary won't catch it. Use a Message Catch Event downstream instead.
  - **Timer Boundary on a quickly-completing task**: if task completes before timer fires, the timer is moot. Common pattern: Timer Boundary for the worst-case timeout; usually task completes before timer fires.
  - **Compensation Boundary**: special case — it doesn't "fire" until a Compensation Throw downstream; the activity must have completed for the compensation to be relevant. Compensation Boundaries are dormant until triggered.

- **Option b) — Wrong.** Bounded.

- **Option c) — Wrong.** Host-scoped, not instance-scoped.

- **Option d) — Wrong.** Bounded by host completion.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Boundary subscriptions scoped to host activity lifetime; end on completion / cancellation.
- **b) 1/10** — wrong; bounded.
- **c) 3/10** — wrong; host-scoped.
- **d) 1/10** — wrong.

**Correct Answer:** Boundary subscriptions are scoped to the host activity's lifetime; end when host completes or is cancelled.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/boundary-events/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Boundary subscription detach when host completes." Subscription lifecycle.

**Въпросът → Solution Framing.** "When subscription ends" — изпитва се knowledge на boundary lifecycle.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Boundary subscriptions host-scoped, че end on completion / cancel, че Compensation Boundary special. Това е знание за boundary lifecycle.

---

## Question 22: Configuring Processes (Weighting: 22%)

**Scenario:** A team's process has variables with **large JSON payloads** (50 KB per instance: customer data with many nested fields). They wonder about variable size limits.

**Are there size limits on Camunda 8 process variables?**

- **a)** **Yes — Zeebe has practical limits** on individual variable size and overall instance state:
  - **Per-variable size**: typically limited (e.g., few MB per variable depending on configuration); configurable per cluster.
  - **Overall instance state**: large state hurts broker performance (replication, serialisation, etc.).
  - **Single message / job payload**: gRPC has request-size limits; large variable payloads can hit them.
  
  **Mitigations**:
  - **Document Handling**: for large binaries, use Documents (reference in variables, binary in storage backend).
  - **Variable hygiene**: don't carry data unnecessarily; use Input / Output Mappings to filter.
  - **External storage**: very large data in a dedicated store (S3, database); variables hold references.
  - **Monitor**: variable size as part of cluster monitoring.
  
  Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/) + [Self-Managed concepts](https://docs.camunda.io/docs/self-managed/concepts/architecture/)

- **b)** No limits — wrong; practical limits exist. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Hard 4 KB per variable — incorrect specific number; depends on config. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **d)** Variables can't be more than 1 byte — clearly wrong. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Practical limits on variable size and instance state:

  **Per-variable limit**:
  - Zeebe has configurable maximum sizes (typically a few MB).
  - Verify exact limit in your version's docs / configuration.

  **Overall instance state size**:
  - Larger state increases broker memory, replication bandwidth, snapshot size.
  - Affects performance under high throughput.

  **gRPC request size**:
  - When activating a job, Zeebe serialises variables into the gRPC response.
  - Large variables increase response size; can hit gRPC limits.

  **Mitigations for large data**:

  1. **Document Handling** (recommended for binaries / large structured data):
     - Upload to storage backend; variable holds reference.
     - Per Sets 4/10 discussions.

  2. **Variable hygiene**:
     - Don't carry whole-object state; project specific fields.
     - Use Input Mappings to pull just what each task needs.
     - Use Output Mappings to write only relevant fields.

  3. **External storage for very large**:
     - Customer profiles, big JSON blobs, etc. → dedicated store (database, KV store).
     - Variables hold reference (customer ID, key).
     - Workers fetch on demand.

  4. **Monitoring**:
     - Track variable size as cluster health metric.
     - Alert on large variables.

  For 50 KB JSON: probably within limits but on the larger side. Best practice: assess if all 50 KB is needed throughout the process, or if you can carry just an identifier and fetch on demand.

- **Option b) — Wrong.** Limits exist.

- **Option c) — Wrong specific.** Configurable.

- **Option d) — Wrong.** Way more.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Practical limits on size; mitigations via Document Handling / external storage / hygiene.
- **b) 1/10** — wrong; limits.
- **c) 2/10** — wrong specific.
- **d) 1/10** — clearly wrong.

**Correct Answer:** Yes — practical limits exist (per-variable + overall state + gRPC); mitigate via Document Handling / external storage / hygiene.

**Official Documentation Link:** https://docs.camunda.io/docs/components/concepts/variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "variable size limits", "50 KB payloads." Variable size constraints.

**Въпросът → Solution Framing.** "Size limits" — изпитва се knowledge на variable limits.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че practical limits exist, че mitigations include Document Handling + external storage + hygiene. Това е знание за variable size best practices.

---

# Section 3 — Decisions & DMN (Questions 23-29)

> Weight 11% • Topics: ANY hit policy deep dive, FEEL `not()` function vs operator, DMN performance considerations, multiple decisions in one file, reusable decision invocation, DMN evaluation context, DMN testing tooling.

---

## Question 23: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN table has hit policy **ANY**. Three rules match the input, all producing the same output `"APPROVED"`. The team wonders if ANY allows this — and what happens if outputs differ.

**Deep dive: what's the exact contract of the ANY hit policy?**

- **a)** **ANY hit policy**: multiple rules may match a single input, but **ALL matching rules must produce the SAME output value**. If they do, the result is that single value. If they DON'T agree, evaluation throws an error (treated as Incident in BPMN context). Used when rules can overlap but the modeller wants to enforce consistency — "any of these reasons leads to the same outcome." Distinct from UNIQUE (requires exactly one match). Documentation: [DMN Hit Policies](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **b)** ANY returns any matching value at random — wrong; consistency required. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **c)** ANY returns the list of all outputs — wrong; that's COLLECT. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

- **d)** ANY allows no match — incorrect; matches required. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/decision-table/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** ANY hit policy has a specific, often-confused semantic:
  - **Matching rules**: zero, one, or many rules may match the input.
  - **Consistency check**: if multiple match, all their outputs must agree (be equal).
  - **Result**: the single value (when consistent).
  - **Error case**: if matching rules disagree, evaluation fails → BPMN Incident.

  Use case: redundant rules that all lead to the same outcome. Example:
  - Customer is VIP (rule 1: tier=PLATINUM → DISCOUNT_25).
  - Customer has high lifetime value (rule 2: ltv>10000 → DISCOUNT_25).
  - Customer in promotional segment (rule 3: segment="VIP_CAMPAIGN" → DISCOUNT_25).

  A customer matching all three rules: ANY returns "DISCOUNT_25" (consistent). If one rule had output "DISCOUNT_30", evaluation fails — modelers must fix inconsistency.

  ANY enforces a design contract: "these rules represent the same decision; if they disagree, that's a modelling bug." Useful for catching subtle rule drift.

  Comparison:
  - **UNIQUE**: exactly one match; multi-match = error.
  - **ANY**: multiple matches OK if outputs agree; disagreement = error.
  - **FIRST**: first match wins; ignores later matches silently.
  - **COLLECT** (no aggregator): returns list of all matches.
  - **COLLECT-SUM/MIN/MAX/COUNT**: aggregated single value.

- **Option b) — Wrong.** Consistency required.

- **Option c) — Wrong.** That's COLLECT.

- **Option d) — Wrong.** Matches required.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. ANY: multi-match OK if outputs agree; disagreement → error.
- **b) 2/10** — wrong; not random.
- **c) 2/10** — COLLECT.
- **d) 2/10** — wrong; matches.

**Correct Answer:** ANY allows multiple matching rules; all must produce the same output; disagreement raises an error.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/decision-table/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "ANY", "all produce same output." Hit policy semantic.

**Въпросът → Solution Framing.** "Exact contract of ANY" — изпитва се knowledge на ANY semantics.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че ANY enforces consistency, че UNIQUE forbids multi, че COLLECT returns list. Това е знание за hit policy distinctions.

---

## Question 24: Decisions & DMN (Weighting: 11%)

**Scenario:** A FEEL expression uses `not(isVip)` to negate a boolean. The team wonders if `not` is a function `not()` or an operator like `!` in some languages.

**Is FEEL `not` a function or an operator?**

- **a)** **FEEL has `not()` as a built-in function**: `not(boolean)` returns the negation. Syntax: `=not(isVip)` parses as function call. **No `!` operator** in FEEL (JS-style negation). For unary tests in DMN context, `not(...)` can also wrap a value/range to negate the test: `not("VIP")` in a unary test means "any value except VIP." Documentation: [FEEL boolean](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-boolean/)

- **b)** `not` is an operator like `!` — JS reflex; FEEL uses function. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** No negation in FEEL — wrong; supported. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Both `not()` function and `!` operator — partial; only function. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's negation:

  **`not(boolean)`** — function:
  - **Expression context**: `=not(isVip)` returns true if isVip is false (and vice versa).
  - **Boolean operations**: combine with `and`, `or` — also operators.
  - **Null handling**: `not(null)` typically returns null (FEEL's three-valued logic).

  **`not(...)`** — unary test (DMN context):
  - **In rule cells**: `not("VIP")` matches any value EXCEPT "VIP".
  - **With ranges**: `not([18..65])` matches values outside 18-65.
  - Useful for "exclusion" rules.

  **No `!` operator**: JS / C-family negation syntax isn't FEEL. Use `not()` exclusively.

  Boolean operations summary:
  - **`and`**: logical AND. `=a and b`.
  - **`or`**: logical OR. `=a or b`.
  - **`not(x)`**: logical NOT.
  - **No `xor`**: emulate via `or` + `not` if needed.

  FEEL's boolean ops follow three-valued logic (true/false/null), handling null gracefully.

- **Option b) — JS reflex.** Function.

- **Option c) — Wrong.** Supported.

- **Option d) — Partial.** Only function.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. `not()` function in FEEL; also used in unary tests.
- **b) 2/10** — JS reflex.
- **c) 1/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** FEEL has `not()` as a function; no `!` operator; also usable in DMN unary tests.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-boolean/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "not(isVip)", "function or operator." Negation syntax.

**Въпросът → Solution Framing.** "Function or operator" — изпитва се knowledge на FEEL boolean ops.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че `not()` е function, че no `!` operator, че also unary-test usage. Това е знание за FEEL negation.

---

## Question 25: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN table has grown to 200 rules. The team wonders about **performance**: is a large table slow? Should they split into smaller tables linked via DRD?

**Performance considerations for large DMN tables vs decomposed DRDs?**

- **a)** **Trade-offs**:
  - **Large flat table** (200 rules): evaluation iterates rules; for HIT policies that don't short-circuit (COLLECT, RULE ORDER), all 200 evaluated. FIRST short-circuits on first match. Memory + parsing cost scales with table size. Maintainability suffers — 200 rules hard to review.
  - **Decomposed DRD** (multiple smaller tables linked): each evaluation is smaller (less iteration); cleaner separation by concern (e.g., "validate inputs" + "compute discount" + "apply tax" as separate decisions). Engine evaluates them in dependency order. Easier maintenance.
  
  **For performance**: typically decomposition helps both runtime (per-decision faster) and ops (clearer). 200 rules in a single table is usually a code smell — refactor. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/) + [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** Large tables always faster — wrong; decomposition often wins. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Decomposition always faster — overstates; depends. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Performance is identical — wrong; differs. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN performance + maintainability trade-offs:

  **Large flat table**:
  - **Hit policy matters**: FIRST short-circuits (best case: row 1 matches, no further eval); UNIQUE / ANY / PRIORITY may short-circuit on first match too. COLLECT / RULE ORDER / OUTPUT ORDER must evaluate all rules.
  - **Linear scan**: each rule evaluated against inputs; cost scales with rule count.
  - **Maintainability**: 200 rules hard to mentally model; subtle bugs (overlapping conditions, missing coverage) likely.

  **Decomposed DRD**:
  - **Smaller tables** with focused responsibilities; each evaluation smaller.
  - **DRD dependency order**: engine evaluates per Information Requirement chain; intermediate results cached within evaluation.
  - **Maintenance**: each table's purpose clear; changes localised.

  **Practical guideline**:
  - **< 20 rules**: flat table usually fine.
  - **20-50 rules**: starts to be hard to review; consider decomposing.
  - **50+ rules**: strong signal to decompose; review for natural decision splits.
  - **200+ rules**: almost always benefits from decomposition.

  **Decomposition patterns**:
  - **Stages**: validate → compute → adjust → finalise — each as separate decision.
  - **Categories**: per customer tier; per region; etc.
  - **BKM extraction**: common sub-logic as BKM, called from multiple decisions.

- **Option b) — Wrong.** Decomposition often wins.

- **Option c) — Overstates.** Depends.

- **Option d) — Wrong.** Differs.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Decomposition usually wins on both performance and maintainability; 200 flat rules code smell.
- **b) 2/10** — wrong.
- **c) 4/10** — overstates.
- **d) 1/10** — wrong.

**Correct Answer:** Decomposition typically wins on performance + maintainability; 200-rule flat table is a code smell — refactor.

**Official Documentation Link:** https://docs.camunda.io/docs/components/best-practices/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "200 rules", "performance large vs decomposed." DMN scaling.

**Въпросът → Solution Framing.** "Performance considerations" — изпитва се knowledge на DMN scaling.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че large flat tables have eval + maintain costs, че decomposition reduces both, че hit policy affects short-circuit. Това е знание за DMN architecture.

---

## Question 26: Decisions & DMN (Weighting: 11%)

**Scenario:** A team's DMN file contains **multiple decisions** (5 decision tables related to pricing). They wonder if Camunda supports multi-decision files or if each decision needs its own file.

**Can one DMN file contain multiple decisions?**

- **a)** **Yes — one DMN file can contain multiple decisions** (and BKMs, Decision Services, Knowledge Sources, etc.), forming a DRD. Each decision has its own ID and can be invoked independently from BPMN. The file is a container for related decisions sharing the same DRD context. Standard pattern: group decisions that work together. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** One decision per file — wrong; multi-decision files standard. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Camunda only deploys one decision at a time — wrong; deploys all. Documentation: [Deployment](https://docs.camunda.io/docs/components/concepts/deployment/)

- **d)** Multi-decision deprecated — wrong; standard. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** A DMN file (with `<definitions>` root) can contain:
  - **Multiple Decisions**: each with its own ID, name, body (table / literal expression / etc.).
  - **BKMs**: shared business knowledge models.
  - **Decision Services**: curated public interfaces.
  - **Input Data**: declared external inputs.
  - **Knowledge Sources**: governance metadata.

  All connected via Information / Knowledge / Authority Requirements forming the DRD.

  Each decision in the file:
  - Has its own ID.
  - Can be invoked independently from BPMN (Business Rule Task references by decision ID).
  - Shares the file's namespace + imports.

  **Deployment**:
  - Deploy the DMN file → all decisions / BKMs / etc. become available in the cluster.
  - Versioning: file-level (all elements share the same version per deployment).

  **When to group decisions in one file**:
  - Tightly related decisions (e.g., all pricing-related logic).
  - Shared BKMs.
  - Shared input data.

  **When to split into multiple files**:
  - Independent domains (pricing vs. compliance vs. eligibility — separate files for separation of concerns).
  - Different ownership / lifecycle (different teams maintain).

- **Option b) — Wrong.** Multi-decision standard.

- **Option c) — Wrong.** Deploys all.

- **Option d) — Wrong.** Standard.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. One DMN file can contain multiple decisions + BKMs + Decision Services; standard pattern.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Yes — one DMN file can contain multiple decisions + BKMs + Decision Services, forming a DRD.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/dmn/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "multiple decisions in one file." File structure.

**Въпросът → Solution Framing.** "Multi-decision file" — изпитва се knowledge на DMN file structure.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN file е container, че multiple entities supported, че deployment includes all. Това е знание за DMN file organisation.

---

## Question 27: Decisions & DMN (Weighting: 11%)

**Scenario:** A team wants to **call the same DMN decision from multiple BPMN processes**. They wonder if this is supported and best practice.

**Can a DMN decision be invoked from multiple BPMN processes?**

- **a)** **Yes — DMN decisions are deployed cluster-wide and can be invoked by any BPMN process** via Business Rule Task with `decisionId` reference. Single source of truth for the decision logic; reused across processes. **Best practices**:
  - Stable decisionId across versions (treat as public interface).
  - Backward-compatible changes when evolving (don't break callers).
  - Document the decision's inputs / outputs for caller awareness.
  - Test changes against representative callers.
  
  Documentation: [Business Rule Task](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/) + [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **b)** One process per decision — wrong; multi-caller designed. Documentation: [Business Rule Task](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **c)** Duplicate the DMN per process — anti-DRY. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Use BKM instead — partial; BKM is DMN-internal reuse; multi-BPMN-process reuse via decision invocation. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN decisions, like BPMN processes, are deployed cluster-wide and referenced by ID. Multiple BPMN processes can invoke the same decision:

  **Setup**:
  1. Deploy DMN with decision `discount-calculator`.
  2. BPMN Process A: Business Rule Task with `decisionId="discount-calculator"`.
  3. BPMN Process B: Business Rule Task with same `decisionId`.
  4. Each invocation evaluates the decision independently; results don't share state.

  **Benefits**:
  - **Single source of truth**: one decision implementation; all callers use it.
  - **Consistency**: updating the decision propagates to all callers' next invocations.
  - **Maintainability**: centralised logic.

  **Best practices**:
  - **Stable interface (decisionId)**: don't change ID across versions; callers depend on it.
  - **Backward-compatible evolution**: add inputs / outputs without removing existing ones.
  - **Communication**: when changing the decision, notify caller process owners.
  - **Versioning awareness**: decisions evolve; running instances of older BPMN versions may use older decision versions depending on resolution semantics.
  - **Testing**: changes tested against representative input sets covering all callers' use cases.

  **Anti-pattern**: copy-pasting the same DMN logic into multiple files for separate callers — diverges over time; bug fixes don't propagate; defeats DRY.

- **Option b) — Wrong.** Multi-caller designed.

- **Option c) — Anti-DRY.**

- **Option d) — Partial.** BKM is DMN-internal; multi-process reuse via decision invocation.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. DMN cluster-wide; multi-process invocation supported; stable interface best practice.
- **b) 1/10** — wrong.
- **c) 2/10** — anti-DRY.
- **d) 5/10** — partial.

**Correct Answer:** Yes — DMN decisions cluster-wide; multiple BPMN processes invoke same decisionId; maintain stable interface.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "same DMN from multiple BPMN." Multi-caller reuse.

**Въпросът → Solution Framing.** "Invoked from multiple processes" — изпитва се knowledge на DMN reuse.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN cluster-wide, че stable interface important, че backward-compatible evolution. Това е знание за DMN reuse architecture.

---

## Question 28: Decisions & DMN (Weighting: 11%)

**Scenario:** A DMN decision is called from a BPMN Business Rule Task. The team wonders **what variables the DMN can access** during evaluation — only what's passed in, or all caller's process variables?

**What's the DMN evaluation context — caller's whole scope or specific inputs?**

- **a)** **The DMN evaluation context typically includes the caller's process variables** at the moment of evaluation. The DMN can reference any process variable in its input expressions. **Best practice**: declare expected inputs explicitly (via DMN's input data elements OR via input expressions referencing specific variable names), so the DMN's interface is documented. Avoid the DMN deeply navigating caller's structures — couples DMN to caller's data shape. Documentation: [Business Rule Task](https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/)

- **b)** Only what's explicitly passed — partial; some configurations allow scoping. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** DMN can't access process variables — wrong; access via input expressions. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Variables auto-translate to DMN inputs — partial. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN evaluation in Camunda 8:
  - **Caller's variables in scope**: the DMN can reference process variables by name in its input expressions.
  - **Decision body sees the context**: input expressions evaluate FEEL against this context.

  **Example**:
  ```xml
  <!-- BPMN Business Rule Task -->
  <zeebe:calledDecision decisionId="discount-calc" resultVariable="discount" />
  ```
  ```xml
  <!-- DMN decision table input expression -->
  <inputExpression>customer.tier</inputExpression>
  ```
  When evaluation happens, FEEL evaluates `customer.tier` against the caller's variable set; the result feeds the input column's value tests.

  **Implications**:
  - **Convenience**: don't need explicit Input Mapping bridging BPMN→DMN for variables already in process scope.
  - **Coupling**: DMN depends on caller's variable names; renaming a BPMN variable could break the DMN.

  **Best practices for cleanish coupling**:
  - **Declare Input Data nodes in DRD**: document what data the DMN expects (even if not enforced at runtime, it's good architecture).
  - **Use input expressions that pull specific fields**: rather than navigating deep, keep input expressions shallow (e.g., expect `tier` at top-level; caller's Input Mapping flattens nested fields).
  - **Don't navigate caller's internal structure deeply**: makes DMN brittle to caller changes.

  Some Camunda 8 configurations may allow narrower context (only declared inputs); verify per version.

- **Option b) — Partial.** Depends on configuration.

- **Option c) — Wrong.** Access.

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. DMN sees caller's variables; declare inputs explicitly; avoid deep navigation.
- **b) 5/10** — partial.
- **c) 1/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** DMN typically sees caller's process variables; declare expected inputs explicitly + keep input expressions shallow for clean coupling.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "DMN access caller variables." Evaluation context scope.

**Въпросът → Solution Framing.** "Context scope" — изпитва се knowledge на BPMN-DMN context coupling.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че DMN sees caller's variables, че declare inputs + shallow expressions best practice, че deep nav couples. Това е знание за BPMN-DMN coupling.

---

## Question 29: Decisions & DMN (Weighting: 11%)

**Scenario:** A team writes DMN decisions and wants to **unit test them** with various input combinations to verify correctness. They wonder about tooling.

**What tools support DMN testing?**

- **a)** **Multiple options**:
  - **Web Modeler / Desktop Modeler DMN Tester / Play**: interactive testing in the editor — supply inputs, see which rules fire and outputs.
  - **REST API**: POST inputs to the evaluate-decision endpoint; verify outputs. Scriptable for automated tests.
  - **dmn-eval-js / community libraries**: FEEL evaluation libraries that can test DMN logic outside of Camunda (for unit tests in app code).
  - **Java DMN engine libraries**: integrate the DMN engine into JUnit tests.

  Combine: interactive in Modeler for development; scripted via API for CI. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/) + [Orchestration REST API](https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/)

- **b)** No testing tools — incorrect. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **c)** Only manual testing — incorrect; automation possible. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

- **d)** Start a process instance every test — partial; faster alternatives exist. Documentation: [DMN](https://docs.camunda.io/docs/components/modeler/dmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** DMN testing tooling spans interactive and automated:

  **Interactive (development-time)**:
  - **Web Modeler / Desktop Modeler DMN Tester / Play**: built-in UI for supplying inputs + viewing results. Fast iteration during DMN design.

  **REST API (automated)**:
  - **POST /v2/decision-definitions/evaluation** (or equivalent): scriptable test invocations. CI can run a test suite hitting this endpoint.

  **Library-based (unit testing in app code)**:
  - **dmn-eval-js / FEEL libraries**: evaluate DMN logic in JS / Node tests without cluster.
  - **Java DMN engine libraries**: similar for Java unit tests.

  **End-to-end testing**:
  - Start a process instance with controlled inputs; verify the Business Rule Task's outcome.
  - Slower; appropriate for integration / regression tests.

  **Test strategy** for DMN-heavy systems:
  - **Unit-style** (fast, in CI): API-based evaluation tests per decision.
  - **Coverage**: design tests covering each rule + edge cases (boundary values, no-match scenarios).
  - **Regression**: lock down current behaviour; alert on changes.

  Build a test culture for DMN — same rigour as BPMN / code tests.

- **Option b) — Wrong.** Tools exist.

- **Option c) — Wrong.** Automation possible.

- **Option d) — Partial.** Faster alternatives.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Interactive (Modeler) + REST API automation + libraries + end-to-end testing.
- **b) 1/10** — wrong.
- **c) 2/10** — wrong.
- **d) 4/10** — partial.

**Correct Answer:** Multiple options — Modeler DMN Tester (interactive), REST API (automated), libraries (unit tests), full process instances (E2E).

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "unit test DMN", "tooling." DMN testing.

**Въпросът → Solution Framing.** "Tools for testing" — изпитва се knowledge на DMN test tooling.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Modeler interactive + REST API + libraries + E2E options, че layered test strategy. Това е знание за DMN testing.

---

# Section 4 — Configuring Forms (Questions 30-32)

> Weight 5% • Topics: Form variable scope vs process scope, custom components, readonly view-only mode.

---

## Question 30: Configuring Forms (Weighting: 5%)

**Scenario:** A Form has 10 fields. Some are temporary calculations / scratch values; others should land in process scope on completion. The team wonders how to control which Form values become process variables.

**How does the team control which Form values become process variables?**

- **a)** **Form field `key` attribute determines the variable name** in process scope on completion. **All fields with a `key`** write their values; **fields without a `key`** (display-only components like Text View) don't write. For "scratch" intermediate calculations: use display-only components (no key) or fields without persistence intent. For final outputs: declare clear keys. **Plus User Task Output Mapping**: filter / transform what the form wrote before it lands in process scope — give finer control. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/) + [I/O Mappings](https://docs.camunda.io/docs/components/concepts/variables/#inputoutput-variable-mappings)

- **b)** All Form fields auto-write — wrong; depends on key. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Use Service Task after Form to filter — workable but Output Mapping cleaner. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

- **d)** Forms have no control — wrong; key + Output Mapping. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Form-to-process variable flow:

  **1. Field-level `key`**:
  - Each editable Form field has a `key` attribute (path / variable name).
  - On task completion, fields with `key` write their values to process scope at the specified path.
  - Display-only components (Text View, Heading, Spacer) don't have `key` — don't write.

  **2. Strategy for "scratch" values**:
  - Use display-only / computed components for values you don't want persisted (e.g., a Text View showing a computed total derived from other fields — not a separate field with key).
  - Truly editable scratch values: create them, but exclude via Output Mapping (next layer).

  **3. User Task Output Mapping**:
  - Layer between Form data and process scope.
  - Declare which Form values propagate: `Target: customerEmail, Source: =email`.
  - Filter / transform / rename before writing.

  Example:
  - Form has fields: `firstName, lastName, ageRaw, ageRoundedDisplay`.
  - Output Mapping keeps: `firstName`, `lastName`, transforms ageRaw to `customer.age`.
  - `ageRoundedDisplay` stays in form local scope; not in process scope.

  This layered approach (Form keys → Output Mapping) gives clean control over the data contract.

- **Option b) — Wrong.** Depends on key.

- **Option c) — Workable but heavier.**

- **Option d) — Wrong.** Controls available.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Form field `key` writes; Output Mapping filters / transforms; layered control.
- **b) 3/10** — wrong.
- **c) 5/10** — workable but heavier.
- **d) 1/10** — wrong.

**Correct Answer:** Form field `key` determines what writes; combine with User Task Output Mapping for filtering / transforming before process scope.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "control which Form values become process variables." Variable contract.

**Въпросът → Solution Framing.** "How control" — изпитва се knowledge на Form-to-process flow.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че key writes, че display-only don't, че Output Mapping filters / transforms. Това е знание за Form variable control.

---

## Question 31: Configuring Forms (Weighting: 5%)

**Scenario:** A team wants a Form component that doesn't exist in the standard element library — e.g., a signature pad for capturing handwritten signatures. They wonder if they can extend Forms with custom components.

**Can Camunda Forms be extended with custom components?**

- **a)** **Yes, but it requires development**:
  - **form-js library**: the underlying renderer can be extended via the library's plugin / component API.
  - **Custom component**: implement (JS / TypeScript); register with form-js; component becomes available in form schemas.
  - **Embedded usage**: typically for custom-app embedding rather than Tasklist (Tasklist may have limited extension surface).
  - **Trade-off**: requires JS development; ongoing maintenance with form-js version updates.

  Some teams contribute components back to community libraries; others maintain internally. Verify form-js extension API in current version. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **b)** No customisation — wrong; extension possible. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Use external page via iframe — workaround; native extension preferred. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** Build a fully custom form app — overkill if just adding one component. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Custom form components can be added via the form-js library's extension API:

  **form-js library**:
  - The underlying JS library that renders Camunda Forms.
  - Open-source (verify license / version).
  - Has a component / plugin API for extensions.

  **Custom component development**:
  1. Implement component in JS / TypeScript (rendering, validation, value handling).
  2. Define schema for the component (what JSON to expect in form definition).
  3. Register with form-js renderer.
  4. Use in form schemas.

  **Deployment context**:
  - **Tasklist**: extension support may be limited; verify per version.
  - **Custom embedded app**: full flexibility; load form-js with your extensions; render forms in your own UI.

  **Trade-offs**:
  - **Pro**: tailored UX (signature pads, drawings, specialised widgets).
  - **Con**: JS dev required; ongoing maintenance; tests; compatibility with form-js updates.

  **Alternatives**:
  - **Composite with existing components**: maybe a signature can be approximated with Image upload + text comment.
  - **External signing service**: integrate via Connector + Webhook (signing service handles capture; result returned via callback).

  For specialised needs, custom components are powerful; for typical needs, the standard library + composition usually suffices.

- **Option b) — Wrong.** Extensible.

- **Option c) — Workaround.** Native preferred.

- **Option d) — Overkill.** Component-level extension.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. form-js library supports custom components; requires JS dev + maintenance.
- **b) 1/10** — wrong.
- **c) 4/10** — workaround.
- **d) 3/10** — overkill.

**Correct Answer:** Yes — via form-js library extension API; requires JS development; consider alternatives first.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "custom components", "signature pad." Form extensibility.

**Въпросът → Solution Framing.** "Can be extended" — изпитва се knowledge на form-js extension.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че form-js extensible, че JS dev required, че composite alternatives + external services. Това е знание за Form extension.

---

## Question 32: Configuring Forms (Weighting: 5%)

**Scenario:** After a User Task completes, the team wants to **show the same Form in read-only mode** later (e.g., in a "view past tasks" dashboard) — display the values without allowing edits.

**How can a completed task's Form be shown read-only?**

- **a)** **Embed form-js library with `readOnly: true` option**:
  - Custom dashboard app embeds form-js.
  - Loads the original form schema + the completed task's variable values.
  - Renders with `readOnly: true` flag — fields display values; user can't edit.
  
  **Tasklist's own UI**: depending on version, may show completed tasks differently (likely in a separate "completed" view); whether it renders Forms in readOnly varies. **Custom embedding** gives full control. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **b)** Forms can't be readonly — wrong; supported. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **c)** Modify the form schema to disable all fields — workable but maintains parallel schemas. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

- **d)** No way to view completed forms — wrong; achievable. Documentation: [Forms](https://docs.camunda.io/docs/components/modeler/forms/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** form-js supports a readOnly mode for rendering forms without editing:

  **Implementation**:
  ```javascript
  import { FormViewer } from '@bpmn-io/form-js-viewer';
  const formViewer = new FormViewer({
    schema: originalFormSchema,
    data: completedTaskVariables,
    readOnly: true
  });
  formViewer.render(targetElement);
  ```

  **Custom dashboard workflow**:
  1. Fetch completed task's variables (from Operate API or Tasklist history).
  2. Fetch the original Form schema (associated with the task's form ID).
  3. Render form-js with `readOnly: true` + the variables.
  4. User sees the form's structure + the values they / others submitted; can't edit.

  **Use cases**:
  - **Audit trail**: review past task completions.
  - **Reference**: customer service viewing past customer interactions.
  - **Compliance**: read-only access to historical decisions.

  **Tasklist's built-in completed-task UI**:
  - Verify per Tasklist version what it shows for completed tasks.
  - May provide some readonly view; custom embedding gives full control.

  **Alternatives**:
  - **Plain HTML rendering of variables**: simpler but loses form's visual structure.
  - **PDF generation**: render to PDF at completion; archive PDF; show later.

- **Option b) — Wrong.** Supported.

- **Option c) — Workable но maintenance.**

- **Option d) — Wrong.** Achievable.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. form-js readOnly: true renders form with values + no edits.
- **b) 1/10** — wrong.
- **c) 4/10** — maintenance burden.
- **d) 1/10** — wrong.

**Correct Answer:** Embed form-js with `readOnly: true`; load original schema + completed task variables.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/forms/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "show form read-only after completion." Readonly view.

**Въпросът → Solution Framing.** "How shown readonly" — изпитва се knowledge на form-js readOnly mode.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че form-js supports readOnly, че custom embedding gives full control, че PDF / HTML alternatives. Това е знание за Form readonly rendering.

---

# Section 5 — Configuring Connectors (Questions 33-36)

> Weight 6% • Topics: Redis cache Connector, JDBC database Connector, Connector telemetry, environment variable config.

---

## Question 33: Configuring Connectors (Weighting: 6%)

**Scenario:** A team's process needs to cache pricing data — write/read from **Redis**. They wonder if there's a Redis Connector or how to integrate.

**How does a team integrate with Redis from BPMN?**

- **a)** **Verify per Camunda 8 version**: a dedicated Redis Connector may or may not exist in the OOB library. If not, options:
  - **Custom Connector**: implement using a Redis client library (Jedis for Java, ioredis for Node); package as Connector; deploy.
  - **HTTP Connector + Redis HTTP gateway**: if Redis is behind an HTTP API (less common), call via HTTP Connector.
  - **Job Worker with Redis client**: write a regular worker (not a Connector) that handles Redis operations; subscribe to specific task type.

  For Redis specifically, a custom Connector or dedicated worker is the typical path since OOB Redis Connector availability varies. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/) + [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** Redis not integrable — wrong; achievable. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Use HTTP Connector — partial; Redis is typically TCP, not HTTP. Documentation: [HTTP Connector](https://docs.camunda.io/docs/components/connectors/out-of-the-box-connectors/rest/)

- **d)** Camunda has built-in Redis support — verify per version. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Redis integration paths depend on Camunda 8 version + OOB Connector availability:

  **Path 1: Dedicated Redis Connector** (if available):
  - Configure as Element Template; properties for connection URL, credentials, operation (GET / SET / etc.), key, value.
  - Most ergonomic.

  **Path 2: Custom Connector** (if no OOB):
  - Implement Java Connector using Jedis library; expose properties for typical Redis ops.
  - Deploy to Connector Runtime.
  - Use across all BPMN processes.

  **Path 3: Job Worker** (alternative):
  - Write a regular worker (not a Connector) using Spring Zeebe or @camunda8/sdk.
  - Worker subscribes to e.g., `redis-get`, `redis-set` task types.
  - Embeds Redis client; handles operations.
  - Slightly less integrated than Connector but simpler to develop.

  **Path 4: HTTP via Redis HTTP proxy**:
  - Some setups front Redis with an HTTP API (Webdis, custom proxy).
  - HTTP Connector calls the proxy.
  - Suboptimal: extra hop; only if no choice.

  For production Redis caching: dedicated Connector (build / find) is best long-term; Job Worker is good interim.

- **Option b) — Wrong.** Achievable.

- **Option c) — Partial.** Redis is TCP; HTTP needs proxy.

- **Option d) — Verify per version.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Verify OOB; custom Connector or Job Worker if not.
- **b) 1/10** — wrong.
- **c) 4/10** — partial (needs proxy).
- **d) 6/10** — verify.

**Correct Answer:** Verify per version; if no OOB Redis Connector, build custom Connector with Jedis or use a Job Worker.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Redis cache from BPMN." Cache integration.

**Въпросът → Solution Framing.** "Integrate with Redis" — изпитва се knowledge на Connector options.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че OOB varies, че custom Connector / Job Worker са paths, че HTTP Connector needs Redis HTTP proxy. Това е знание за Redis integration.

---

## Question 34: Configuring Connectors (Weighting: 6%)

**Scenario:** A team's process needs to query a **PostgreSQL database** — read customer records, write order records, etc. They wonder if BPMN should do SQL directly or use a service layer.

**Best practice: BPMN process directly executing SQL vs going through a service?**

- **a)** **Generally prefer service-layer abstraction**:
  - **Direct SQL from BPMN**: a Database / JDBC Connector executing SQL queries. Possible (if OOB Connector exists or custom Connector implemented), but couples BPMN to database schema. Schema changes break BPMN. Hard to test. SQL injection risk if queries are dynamic.
  - **Service layer**: a Microservice / API encapsulates database operations; exposes business-meaningful operations ("get customer", "create order"). BPMN calls service via HTTP Connector. Decouples BPMN from schema; service evolution doesn't break BPMN.

  Use direct SQL only for one-off scripts / migrations; for production process orchestration, service layer is the recommended pattern. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** Always direct SQL — anti-pattern. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **c)** Service layer always — overstates; direct SQL has use cases. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **d)** BPMN can't talk to databases — wrong; possible via Connectors. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Architecturally, BPMN orchestrates business logic; databases are infrastructure detail. Best practice:

  **Service-layer pattern (recommended)**:
  - **Microservice or API** owns the database; exposes business operations (REST / gRPC).
  - **BPMN Service Tasks call services** via HTTP Connector (or domain-specific Connector).
  - **Benefits**:
    - **Decoupling**: BPMN doesn't know database schema; schema changes contained in service.
    - **Testability**: services unit-testable independently.
    - **Security**: service applies auth / authorisation; BPMN doesn't have raw DB credentials.
    - **Performance**: service can cache, batch, optimise; BPMN consumes results.
    - **Evolvability**: replace database, refactor schema, change tech without BPMN impact.

  **Direct SQL from BPMN (occasional use)**:
  - **JDBC / Database Connector** (if available OOB) executes SQL.
  - **Use cases**: one-off data migration processes, low-stakes reports, internal admin processes where coupling is acceptable.
  - **Avoid for core business processes**: tight coupling, harder maintenance.

  **Anti-patterns to watch**:
  - **SQL with FEEL-templated values**: risk of "SQL injection via FEEL" if user-supplied data flows in unchecked. Always parameterise.
  - **Complex business logic in SQL**: belongs in BPMN / service, not buried in queries.

  Camunda 8 may or may not have an OOB JDBC Connector; verify per version. If exists, use sparingly with the trade-offs in mind.

- **Option b) — Anti-pattern.** Direct SQL couples.

- **Option c) — Overstates.** Direct has limited use cases.

- **Option d) — Wrong.** Possible.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Service layer recommended; direct SQL for one-off / admin processes.
- **b) 2/10** — anti-pattern.
- **c) 5/10** — overstates.
- **d) 1/10** — wrong.

**Correct Answer:** Prefer service-layer abstraction (microservice owns DB; BPMN calls via Connector); direct SQL for one-off / admin processes.

**Official Documentation Link:** https://docs.camunda.io/docs/components/best-practices/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "BPMN directly executing SQL vs service." Database integration architecture.

**Въпросът → Solution Framing.** "Best practice" — изпитва се knowledge на architectural patterns.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че service layer decouples, че direct SQL couples but has use cases, че BPMN orchestrates business не infrastructure. Това е знание за integration architecture.

---

## Question 35: Configuring Connectors (Weighting: 6%)

**Scenario:** A custom Connector occasionally has issues (transient errors, slow responses). The team wants the Connector to **emit telemetry / custom log events** to their observability stack (Datadog, OpenTelemetry, etc.) — for debugging.

**How can a custom Connector emit telemetry?**

- **a)** **Custom Connector code uses standard observability libraries**:
  - **Logging**: SLF4J / Logback (Java); standard logger (Node).
  - **Metrics**: Micrometer / Prometheus client (Java); equivalent in other langs.
  - **Tracing**: OpenTelemetry SDK; emit spans for Connector executions; correlate with downstream service spans.
  - **Custom events**: emit structured logs with relevant context (job key, BPMN element, inputs hash).
  
  Integrate with the team's observability stack via standard exporters. Connector Runtime can configure logging / metrics export. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/) + [Self-Managed monitoring](https://docs.camunda.io/docs/self-managed/)

- **b)** Connectors can't emit telemetry — wrong; standard libs apply. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/)

- **c)** Only via Operate — wrong; Operate is process-level. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Use a separate logging Service Task — workable but inline logging cleaner. Documentation: [Service Task](https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Custom Connectors are standard application code; integrate observability with standard libraries:

  **Logging**:
  - Java: SLF4J facade + Logback / Log4j2 backend. Configure log levels per package; structured JSON logs for log aggregation.
  - Node: standard `console` or `winston` / `pino` for structured.
  - **What to log**: Connector activation, execution start / end, errors with stack traces, key inputs (excluding secrets).

  **Metrics**:
  - **Counters**: total invocations, errors per type.
  - **Histograms**: execution time distribution.
  - **Gauges**: in-flight count.
  - **Tools**: Micrometer (Java) → Prometheus / Datadog / etc.

  **Tracing (OpenTelemetry)**:
  - **Spans**: each Connector execution becomes a span.
  - **Attributes**: BPMN element ID, process instance key, input hash.
  - **Trace propagation**: pass trace context to downstream API calls (W3C trace context headers).
  - **End-to-end visibility**: trace a request from BPMN start → Connector → external service → back.

  **Best practices**:
  - **Structured logs**: JSON for machine parsing; include correlation IDs.
  - **Don't log secrets**: filter / mask sensitive fields.
  - **Sampling**: in high-throughput scenarios, sample traces to balance cost vs visibility.
  - **Alerting**: thresholds on metrics (error rate > X%, latency > Y).

  Integration with team's stack: standard exporters (Prometheus scraper, Datadog agent, OTel collector) pull / receive from Connector Runtime.

- **Option b) — Wrong.** Standard libs.

- **Option c) — Wrong scope.** Operate process-level.

- **Option d) — Workable но inline cleaner.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Standard observability libs (SLF4J / Micrometer / OpenTelemetry) in Connector code; integrate with team's stack.
- **b) 1/10** — wrong.
- **c) 3/10** — wrong scope.
- **d) 5/10** — workable but heavier.

**Correct Answer:** Use standard observability libraries (SLF4J / Micrometer / OpenTelemetry) in Connector code; integrate with team's stack.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Connector telemetry / log events." Observability.

**Въпросът → Solution Framing.** "How emit telemetry" — изпитва се knowledge на observability libraries.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че standard libs apply (SLF4J / Micrometer / OTel), че structured logs + metrics + tracing, че secrets must be masked. Това е знание за Connector observability.

---

## Question 36: Configuring Connectors (Weighting: 6%)

**Scenario:** A custom Connector has many configuration values — API endpoints, retry settings, feature flags. The team wonders if Connectors should read these from **environment variables** vs Element Template properties.

**Environment variables vs Element Template properties for Connector configuration?**

- **a)** **Different purposes — combine both**:
  - **Element Template properties**: per-task configuration set by modelers in BPMN (channel name, target URL, message content). Modelers customise per Service Task instance.
  - **Environment variables / config files**: per-deployment / per-cluster configuration set by ops (retry defaults, feature flags, infrastructure endpoints). Modelers don't touch.
  
  Use Element Template for "what this task does" (modeler concern); env vars for "how the Connector Runtime behaves" (ops concern). Mix appropriately. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **b)** Always env vars — partial; some config belongs in BPMN. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

- **c)** Always Element Template — partial; some config is cross-cutting / ops-level. Documentation: [Element Templates](https://docs.camunda.io/docs/components/modeler/desktop-modeler/element-templates/about-templates/)

- **d)** Hardcode in Connector — anti-pattern; defeats flexibility. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Configuration layers serve different purposes:

  **Element Template properties (per-task, modeler concern)**:
  - **What**: properties specific to each Service Task usage — channel name, recipient address, message template, target URL per partner.
  - **Who configures**: modelers via Web Modeler property panel.
  - **Scope**: per BPMN element instance; varies across uses.
  - **Examples**: Slack channel name; HTTP endpoint URL; subject line for an email.

  **Environment variables / config files (per-deployment, ops concern)**:
  - **What**: cross-cutting Connector Runtime settings — default timeouts, retry behaviour, feature flags, infrastructure URLs.
  - **Who configures**: ops / deployment engineers via env vars / Kubernetes ConfigMaps / Vault / etc.
  - **Scope**: per Connector Runtime instance / cluster.
  - **Examples**: default HTTP timeout; max concurrent requests; enable / disable a feature flag; logging level.

  **Cluster secrets (per-environment secrets, ops concern)**:
  - Sensitive values — API keys, OAuth secrets, credentials.
  - Stored via secrets provider; referenced in Element Templates via `{{secrets.NAME}}`.

  **Combined**:
  - Element Template references a property → modeler sets value → at runtime, the Connector reads it.
  - Connector code also reads env vars at startup for runtime config.
  - Secrets accessed via SDK's secret API.

  **Anti-patterns**:
  - Putting infrastructure URLs (CRM endpoint per environment) in Element Template properties — modeler shouldn't have to know dev vs prod URLs.
  - Putting per-task values in env vars — every modeler can't customise.

- **Option b) — Partial.** Some config belongs in BPMN.

- **Option c) — Partial.** Some config is ops-level.

- **Option d) — Anti-pattern.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Element Templates per-task (modeler) + env vars per-deployment (ops) + secrets (sensitive); combine.
- **b) 4/10** — partial.
- **c) 4/10** — partial.
- **d) 1/10** — anti-pattern.

**Correct Answer:** Combine — Element Template properties for per-task (modeler concern); env vars / config files for per-deployment (ops concern); secrets for sensitive values.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "env vars vs Element Template for Connector config." Configuration layers.

**Въпросът → Solution Framing.** "Env vars vs properties" — изпитва се knowledge на configuration scope.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Element Templates са modeler concern, че env vars / config files са ops concern, че secrets are separate, че layered config best. Това е знание за Connector configuration architecture.

---

# Section 6 — Extensions & Integrations (Questions 37-50)

> Weight 25% • Topics: FEEL `sum` on empty list, decimal precision, nested context navigation, multi-iterator for-expression, Spring DI in worker, Node SDK variable types, SDK comparison, REST rate limiting, Connector DI, Inbound dedup, RPA error handling, FEEL timezone arithmetic, `today()` vs `now()`, gRPC interceptors.

---

## Question 37: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression computes `=sum(amounts)` on an empty list. The team wonders if result is 0 (mathematical convention for empty sum) or null.

**What does FEEL's `sum([])` return for an empty list?**

- **a)** **`sum([])` returns 0** by FEEL spec — mathematical convention for empty sum. Similarly `count([])` returns 0; `min([])` and `max([])` may return null (depending on FEEL implementation — empty min/max is undefined). For safety with potentially-empty lists, the empty case behaves sensibly for additive aggregations. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

- **b)** Returns null — partial; depends on aggregation. `sum` typically returns 0. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Throws error — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Returns 0 for `sum`, errors for `min/max` — partially correct, mostly accurate. Documentation: [FEEL list](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL list aggregations on empty lists:
  - **`sum([])`**: 0 (mathematical convention — sum of nothing is 0).
  - **`count([])`**: 0.
  - **`product([])`**: 1 (mathematical convention — product of nothing is 1).
  - **`mean([])`**: typically null (mean of empty is undefined; can't divide by zero).
  - **`median([])`**: typically null.
  - **`min([])`** / **`max([])`**: typically null (no values to compare; depends on FEEL implementation).
  - **`stddev([])`**: typically null.

  Practical implications:
  - **Safe for additive aggregations**: `sum(filteredList)` is 0 if no items matched; downstream FEEL handles 0 like any number.
  - **Risky for averaged / boundary aggregations**: `mean(empty)`, `min(empty)`, `max(empty)` can return null; downstream needs null check.

  Pattern for safe handling:
  ```
  =if count(items) > 0 then mean(items) else 0
  ```
  Default to a sensible value when empty.

  Verify your FEEL version's exact empty-list semantics; the spec defines most but edge cases may vary.

- **Option b) — Partial.** `sum` specifically returns 0.

- **Option c) — Wrong.** No error.

- **Option d) — Partially correct.** `min/max` may return null, not error.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. sum([]) = 0; count([]) = 0; product([]) = 1; mean / min / max may return null.
- **b) 4/10** — partial.
- **c) 1/10** — wrong.
- **d) 7/10** — partially correct.

**Correct Answer:** sum([]) returns 0; count([]) = 0; product([]) = 1; mean/min/max may return null on empty.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-list/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "sum on empty list." Empty aggregation behaviour.

**Въпросът → Solution Framing.** "Sum([]) returns" — изпитва се knowledge на empty aggregation conventions.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че sum / count = 0, че product = 1, че mean / min / max may be null. Това е знание за FEEL aggregation edge cases.

---

## Question 38: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL financial computation uses `decimal(value, 2)` for precision. The team wonders about FEEL's underlying numeric **precision** — can it handle precise decimal arithmetic (like banking apps need)?

**FEEL numeric precision — suitable for financial calculations?**

- **a)** **FEEL uses arbitrary-precision decimal arithmetic** (similar to Java's BigDecimal). Multiplication, addition, etc., preserve precision. `decimal(value, scale)` rounds to specified scale (banker's rounding by default). Suitable for financial calculations as long as operations are explicit about scaling. **Avoid float-style errors**: traditional float arithmetic (e.g., `0.1 + 0.2 != 0.3`) doesn't happen — FEEL handles decimals correctly. **Caveat**: very large numbers / very many digits can have performance / memory implications. Documentation: [FEEL numeric](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/)

- **b)** Float precision — incorrect; FEEL uses decimal. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Limited to 6 decimal places — incorrect; arbitrary. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** No precision guarantee — wrong; FEEL spec defines decimal arithmetic. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's number type is **decimal** (arbitrary precision), not float. This means:
  - **`0.1 + 0.2`** in FEEL = exactly `0.3` (no float rounding error).
  - **`100 / 3`** = exact representation up to the implementation's precision limit.
  - **Multiplication / addition / subtraction**: preserve full precision.
  - **Division**: may introduce repeating decimals; the implementation handles up to a defined precision.

  **For financial calculations**:
  - **Safe**: FEEL's decimal arithmetic mirrors what financial systems expect.
  - **Explicit rounding**: use `decimal(value, 2)` to round to 2 decimal places (typical for currency). Banker's rounding (round-half-even) by default — reduces statistical bias over many rounding operations.

  **Pitfalls to avoid**:
  - **Implicit truncation**: don't assume FEEL truncates; it preserves. Round explicitly when needed.
  - **Display formatting**: FEEL's decimal preserves precision but display (e.g., in Operate) may show many digits; round before display.

  **Performance**:
  - Arbitrary precision has memory + computation cost for very large numbers.
  - Practical: financial calculations with values up to billions and 4-decimal precision are fast.

  **Caveat**: FEEL implementation specifics vary; verify with FEEL test cases for your Zeebe version if precision is critical.

- **Option b) — Wrong.** Decimal.

- **Option c) — Wrong.** Arbitrary.

- **Option d) — Wrong.** Spec defined.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL uses arbitrary-precision decimal; suitable for financial; explicit rounding via decimal().
- **b) 2/10** — wrong.
- **c) 2/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** FEEL uses arbitrary-precision decimal arithmetic; suitable for financial; round explicitly via decimal(value, scale).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-numeric/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "FEEL precision financial calculations." Numeric precision.

**Въпросът → Solution Framing.** "Suitable for financial" — изпитва се knowledge на FEEL number type.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL decimal arbitrary precision, че safe for finance, че explicit rounding via decimal(). Това е знание за FEEL number semantics.

---

## Question 39: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression navigates deeply nested: `customer.orders[1].lineItems[3].product.specs.color`. The team wonders about syntax limits and readability.

**Recommendations for FEEL deep nested navigation?**

- **a)** **FEEL supports arbitrary nesting** — dot navigation works for any depth. For readability + maintainability:
  - **Intermediate variables**: break long chains into shorter steps. `=let firstOrder = customer.orders[1] in firstOrder.lineItems[3].product.specs.color`. (Note: `let-in` syntax availability depends on FEEL implementation; verify.)
  - **Multiple Input Mappings**: project relevant nested values to top-level local variables for the task, simplifying worker access.
  - **Restructure data**: if frequently accessing deep paths, consider flattening / restructuring upstream.
  - **Null safety**: long chains amplify null risk; defensive checks at each level.
  
  Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/) + [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **b)** FEEL limits nesting depth — incorrect. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Deep navigation always fails — wrong. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** Use JSONPath — wrong; FEEL only. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL navigation supports arbitrary depth, but readability suffers with long chains. Recommendations:

  **1. Intermediate variables via `let-in`** (if supported in your FEEL version):
  ```
  =let order = customer.orders[1],
       item = order.lineItems[3],
       specs = item.product.specs
   in specs.color
  ```
  Cleaner; each step named; easier to debug.

  **2. Project to top-level via Input Mapping**:
  ```xml
  <zeebe:input source="=customer.orders[1].lineItems[3].product.specs.color" target="productColor"/>
  ```
  Worker just reads `productColor`; the nesting concern is in BPMN-side mapping, not worker code.

  **3. Restructure data upstream**:
  - If many tasks need deep paths, consider an earlier Service Task that flattens / restructures into more accessible shape.

  **4. Null safety with deep paths**:
  - FEEL null-tolerant: `null.anything` returns null without exception.
  - But the result is null; downstream must handle. Defensive: `=if customer.orders[1] != null and customer.orders[1].lineItems[3] != null then customer.orders[1].lineItems[3].product.specs.color else null`.
  - Verbose; intermediate variables help here too.

  **5. Performance**:
  - FEEL evaluation of deep paths is fast; not a concern.
  - Readability + maintainability are the real concerns.

  Treat deep navigation as a smell — consider data restructuring if it's pervasive.

- **Option b) — Wrong.** No depth limit.

- **Option c) — Wrong.** Supported.

- **Option d) — Wrong.** No JSONPath.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Arbitrary depth supported; use intermediate variables / Input Mappings / restructure for readability.
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** FEEL supports arbitrary nesting; use intermediate variables (let-in if supported), Input Mappings, or restructure for readability.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "deeply nested navigation." Deep navigation recommendations.

**Въпросът → Solution Framing.** "Recommendations" — изпитва се knowledge на FEEL navigation + readability.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че arbitrary depth supported, че intermediate variables + Input Mappings improve readability, че restructure if pervasive. Това е знание за FEEL navigation patterns.

---

## Question 40: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must compute the **Cartesian product** of two lists: for every pair `(customer, product)`, generate a record. They wonder if FEEL's `for` expression supports multiple iterators.

**Does FEEL `for` expression support multiple iterators?**

- **a)** **Yes — FEEL `for` supports multiple iterators**, producing Cartesian product:
  ```
  =for c in customers, p in products
   return {customer: c, product: p}
  ```
  Result: a list with `|customers| × |products|` entries, one per (customer, product) pair. Useful for generating combinations. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **b)** Only one iterator — incorrect; multiple supported. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **c)** Use nested `for` — workable but multi-iterator is direct. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

- **d)** No `for` expression — wrong; core FEEL feature. Documentation: [FEEL](https://docs.camunda.io/docs/components/modeler/feel/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's `for` expression syntax:
  ```
  for <iterator> [, <iterator>]* return <expression>
  ```

  Each iterator is `variableName in collection`. Multiple iterators produce Cartesian product:
  ```
  =for c in [1, 2], d in [10, 20]
   return c * d
  ```
  Result: `[10, 20, 20, 40]` — products of all (c, d) pairs.

  **Practical use**:
  - **Generate all combinations**: `=for c in customers, p in products return {customer: c, product: p}` — every customer × every product.
  - **Range-based**: `=for i in 1..10, j in 1..10 return {i: i, j: j}` — 10×10 = 100 records.
  - **With filter**: `=for c in customers, p in products where matches(c, p) return ...` — combined with filter conditions.

  **Comparison with nested `for`**:
  ```
  =for c in customers return for p in products return {customer: c, product: p}
  ```
  This produces a **list of lists** (one inner list per customer). Different result shape: flatten for the same Cartesian result. Multi-iterator `for` is flatter and more idiomatic.

  **Performance**: Cartesian product can be large; `1000 × 1000 = 1,000,000` records. Be mindful of resulting list size.

- **Option b) — Wrong.** Multiple supported.

- **Option c) — Workable but indirect.**

- **Option d) — Wrong.** Core feature.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Multi-iterator for produces Cartesian product directly.
- **b) 1/10** — wrong.
- **c) 5/10** — workable but flatter alternative exists.
- **d) 1/10** — wrong.

**Correct Answer:** Yes — FEEL `for` supports multiple iterators (comma-separated), producing Cartesian product.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Cartesian product", "two lists." Multi-iterator for.

**Въпросът → Solution Framing.** "Multiple iterators" — изпитва се knowledge на FEEL for.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че multi-iterator for produces Cartesian, че nested for produces lists-of-lists, че result size considerations. Това е знание за FEEL iteration.

---

## Question 41: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Java Spring Zeebe worker handles `process-payment`. The worker needs to call a `PaymentService` Spring bean. They wonder about dependency injection.

**Can Spring Zeebe workers use `@Autowired` (Spring DI)?**

- **a)** **Yes — Spring Zeebe workers are Spring-managed beans** by default; full Spring features apply:
  - **`@Autowired`** to inject dependencies.
  - **`@Component`** / `@Service` to register the worker class.
  - **`@JobWorker`** annotation on the handler method.
  - **Spring configuration**: profiles, properties, conditional beans, etc.
  
  Example:
  ```java
  @Component
  public class PaymentWorker {
    @Autowired private PaymentService paymentService;
    
    @JobWorker(type = "process-payment")
    public PaymentResult handle(@Variable String orderId) {
      return paymentService.process(orderId);
    }
  }
  ```
  Standard Spring DI throughout. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** No DI — workers are isolated — wrong; Spring DI works. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **c)** Only constructor injection — partial; field + constructor + setter all work. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **d)** Manually instantiate dependencies — partial; works but DI cleaner. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Spring Zeebe is built on Spring Boot; worker classes are first-class Spring beans:
  - **`@Component` / `@Service`**: register the worker class as Spring bean.
  - **`@Autowired`** (field / constructor / setter): inject any other Spring beans.
  - **`@JobWorker`** annotation: tells Spring Zeebe to subscribe this method to a Zeebe task type.
  - **`@Variable`** annotation: inject process variables as method parameters.

  Full Spring features available:
  - **Dependency injection**: services, repositories, configuration.
  - **Aspects**: AOP for cross-cutting concerns (logging, transactions).
  - **Profiles**: `@Profile("prod")` for env-specific beans.
  - **Configuration**: `@ConfigurationProperties` for typed config.

  **Best practices**:
  - **Constructor injection preferred**: makes dependencies explicit; easier to test.
  - **Avoid field injection in production code**: harder to test; reflection-based.
  - **Don't `new` services in handlers**: defeats DI.

  Example with constructor injection:
  ```java
  @Component
  public class PaymentWorker {
    private final PaymentService paymentService;
    
    public PaymentWorker(PaymentService paymentService) {
      this.paymentService = paymentService;
    }
    
    @JobWorker(type = "process-payment")
    public PaymentResult handle(@Variable String orderId) {
      return paymentService.process(orderId);
    }
  }
  ```

  Standard Spring DI integration — Spring Zeebe doesn't reinvent the wheel.

- **Option b) — Wrong.** DI works.

- **Option c) — Partial.** All injection styles work.

- **Option d) — Workable но wrong default.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Spring DI fully supported; @Autowired / @Component / @JobWorker compose.
- **b) 1/10** — wrong.
- **c) 5/10** — partial.
- **d) 4/10** — works but defeats DI.

**Correct Answer:** Yes — workers are Spring beans; @Autowired, constructor injection, all standard Spring features apply.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "@Autowired in worker." Spring DI.

**Въпросът → Solution Framing.** "Use @Autowired" — изпитва се knowledge на Spring integration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Spring DI fully supported, че constructor injection preferred, че full Spring features apply. Това е знание за Spring Zeebe DI.

---

## Question 42: Extensions & Integrations (Weighting: 25%)

**Scenario:** A Node.js worker handles process variables. The team wonders what **JavaScript types** Zeebe's variables map to.

**How do Camunda 8 process variable types map to JavaScript types in Node SDK?**

- **a)** **Mostly direct mapping**:
  - **JSON number** → JS `Number` (potential precision loss for very large numbers; consider strings for IDs).
  - **JSON string** → JS `String`.
  - **JSON boolean** → JS `Boolean`.
  - **JSON null** → JS `null`.
  - **JSON array** → JS `Array`.
  - **JSON object** → JS `Object` (plain).
  - **Date / time** (FEEL types): may serialize as strings; SDK or your code parses to Date objects if needed.
  
  Direct, idiomatic. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/) + [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **b)** All strings — wrong; native types preserved. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **c)** Need explicit type conversion — partial; SDK handles most. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

- **d)** Complex objects not supported — wrong; nested objects supported. Documentation: [@camunda8/sdk](https://docs.camunda.io/docs/apis-tools/node-js-sdk/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8's variable model is JSON-typed. Node SDK maps directly:

  **Primitive types**:
  - JSON number → JS `Number` (float64). **Caveat**: JS Number precision is limited to ~2^53; very large IDs (above this) lose precision. Use strings for large identifiers.
  - JSON string → JS `String`.
  - JSON boolean → JS `Boolean`.
  - JSON null → JS `null` or `undefined` (verify SDK convention).

  **Collections**:
  - JSON array → JS `Array`.
  - JSON object → JS `Object` (plain, not Class instance).

  **Dates / Times** (FEEL-style):
  - Typically serialised as ISO 8601 strings.
  - SDK may or may not parse to JS Date; your code typically does the conversion if needed: `new Date(variable.timestamp)`.

  **Nested**:
  - JSON nested objects map to nested JS objects.
  - `job.variables.customer.address.city` works naturally in JS.

  **Special considerations**:
  - **Large numbers**: pass as strings to avoid precision loss.
  - **Dates**: be consistent — store as ISO strings in process variables; parse to JS Date in worker if needed for date math.
  - **Type checking**: worker code can use `typeof` / `Array.isArray` / `instanceof` for runtime type checks.

  Same model as standard JSON parsing.

- **Option b) — Wrong.** Native types.

- **Option c) — Partial.** SDK handles most; date/time may need manual parsing.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Direct mapping JSON ↔ JS native types; large numbers / dates may need attention.
- **b) 1/10** — wrong.
- **c) 5/10** — partial; SDK handles most.
- **d) 1/10** — wrong.

**Correct Answer:** Mostly direct mapping — JSON types ↔ JS native types; watch out for large numbers (precision loss) and dates (manual parsing).

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/node-js-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "variable types in JS." Type mapping.

**Въпросът → Solution Framing.** "How variables map" — изпитва се knowledge на JSON-JS type correspondence.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че direct mapping, че large numbers precision concern, че dates may need parsing. Това е знание за Node SDK type handling.

---

## Question 43: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team's polyglot architecture has Java services + Node.js services + Go microservices. They need to integrate all with Camunda 8.

**Comparison of Camunda 8 SDKs across languages — Java, Node.js, Go?**

- **a)** **Camunda 8 provides first-class SDKs in multiple languages**:
  - **Java**: most mature; Spring Zeebe with full Spring integration; @JobWorker annotation.
  - **Node.js (@camunda8/sdk)**: comprehensive for JS/TS; modern API; well-maintained.
  - **Go**: also supported; idiomatic Go API.
  - **Python**: not first-class; use REST API directly or community libraries.
  - **Other languages**: REST API available; gRPC clients can be generated from proto files.
  
  Choose by team expertise / existing stack; all support the core Camunda 8 operations (job activation, completion, message publishing, etc.). Documentation: [APIs and Tools](https://docs.camunda.io/docs/apis-tools/)

- **b)** Only Java supported — wrong; multiple. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/)

- **c)** All languages equally featured — partial; maturity varies. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/)

- **d)** SDKs identical across languages — partial; idiomatic differences. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8's first-class SDKs:

  **Java (most mature)**:
  - **Spring Zeebe**: full Spring Boot integration; auto-configuration; @JobWorker for handlers; @Variable for parameter binding.
  - **Plain Zeebe Java client**: lower-level, gRPC-based; useful for non-Spring apps.
  - **Camunda 8 SDK Java**: unified SDK across Zeebe + Operate + Tasklist APIs.

  **Node.js (@camunda8/sdk)**:
  - **TypeScript-first**: full type definitions.
  - **Modern API**: async/await; handler returns auto-complete jobs; explicit `job.complete()` / `job.error()` / `job.fail()` available.
  - **Cross-component**: Zeebe + Operate + Tasklist APIs.

  **Go**:
  - **Idiomatic Go**: context, errors as values, etc.
  - **gRPC-native**.
  - **Comprehensive**: similar to Java's coverage.

  **Python**:
  - **Not first-class** historically.
  - **Community libraries**: verify maintenance.
  - **REST API direct**: language-agnostic alternative.

  **Other languages**:
  - **REST API** (Orchestration Cluster API): any HTTP client.
  - **gRPC generated**: codegen from Zeebe's proto files.

  **Choose by**:
  - **Team expertise**: pick the language your team knows.
  - **Existing stack**: align with your services' tech.
  - **Performance needs**: gRPC (Java / Node / Go SDKs) faster than REST; high-throughput workers prefer SDKs.

- **Option b) — Wrong.** Multiple.

- **Option c) — Partial.** Maturity varies.

- **Option d) — Partial.** Idiomatic differences.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Java / Node / Go first-class; Python community; REST API for others.
- **b) 1/10** — wrong.
- **c) 5/10** — partial.
- **d) 5/10** — partial.

**Correct Answer:** Java (most mature, Spring Zeebe) / Node.js (TypeScript) / Go first-class; Python via community libs or REST; REST API for any language.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Java + Node + Go", "SDK comparison." Multi-language support.

**Въпросът → Solution Framing.** "SDK comparison" — изпитва се knowledge на SDK availability.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Java most mature, че Node + Go first-class, че Python community / REST, че choose by team / stack. Това е знание за SDK landscape.

---

## Question 44: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team's backend service makes many concurrent API calls to Camunda 8 (creating instances, completing tasks, etc.). They worry about **hitting rate limits** on the Camunda 8 side.

**Does Camunda 8 enforce API rate limits?**

- **a)** **Verify per tier / version**: Camunda 8 SaaS clusters may have per-tier rate limits (requests per second, per minute) — enforced at the gateway. Self-Managed clusters can be configured with custom limits. **Symptoms of hitting limits**: gRPC `RESOURCE_EXHAUSTED` (429-equivalent) or HTTP 429 Too Many Requests. **Mitigation**:
  - **Client-side rate limiting**: token bucket / semaphore to cap outgoing requests.
  - **Backoff on errors**: exponential backoff on RESOURCE_EXHAUSTED responses.
  - **Bulk operations**: batch where possible (e.g., publishMessage instead of N individual calls).
  - **Coordinate with capacity planning**: tier up if consistent throughput exceeds limits.
  
  Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/) + [Camunda SaaS](https://docs.camunda.io/docs/components/console/)

- **b)** No rate limits — partial; depends on tier. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/)

- **c)** Hard limit 100/sec for all — wrong specific. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/)

- **d)** Camunda 8 throttles automatically — partial; backpressure exists but client should rate-limit too. Documentation: [APIs](https://docs.camunda.io/docs/apis-tools/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 API rate limiting:

  **SaaS** (managed by Camunda):
  - Per-cluster tier limits (varies by plan).
  - Enforced at the gateway / API layer.
  - Returns rate-limit errors when exceeded.

  **Self-Managed**:
  - Default no hard limits in the broker / API.
  - Operator may configure custom limits (e.g., via API gateway / ingress controllers / Zeebe gateway settings).
  - Cluster capacity is the practical limit (CPU / memory / disk I/O).

  **Symptoms when exceeded**:
  - **gRPC**: `RESOURCE_EXHAUSTED` status (status code 8).
  - **REST**: HTTP 429 Too Many Requests.
  - **Slow responses**: under heavy load, gateway may queue and respond slowly.

  **Client mitigations**:
  - **Rate limit client-side**: cap outgoing rate to stay under limits.
  - **Backoff on rate-limit errors**: exponential backoff with jitter.
  - **Batch when possible**: fewer, larger requests vs many small.
  - **Concurrency cap**: limit parallel in-flight requests.
  - **Multiple workers / instances**: distribute load across worker fleet.

  **Capacity planning**:
  - Monitor request rate over time.
  - If consistently approaching limits, scale up (tier change in SaaS; cluster scaling in SM).

- **Option b) — Partial.** Depends.

- **Option c) — Wrong specific.**

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. SaaS tier limits; SM configurable; mitigate via client rate-limit + backoff + batch.
- **b) 4/10** — partial.
- **c) 2/10** — wrong specific.
- **d) 5/10** — partial.

**Correct Answer:** SaaS has per-tier rate limits; SM configurable; mitigate via client-side rate limiting + backoff + batching.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/zeebe-api/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "hitting rate limits API." Rate limit awareness.

**Въпросът → Solution Framing.** "Enforce rate limits" — изпитва се knowledge на API limits.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че SaaS tiers, че SM configurable, че mitigation via client rate-limit + backoff + batch. Това е знание за API rate handling.

---

## Question 45: Extensions & Integrations (Weighting: 25%)

**Scenario:** A custom Java Connector depends on several Spring beans (HTTP client, logger, config). The team wonders if Connector code can use Spring DI.

**Can custom Connector code use Spring DI?**

- **a)** **Depends on the Connector Runtime model**:
  - **Standalone Connector Runtime** (e.g., embedded in your Spring Boot app): full Spring DI; Connectors are Spring beans.
  - **Camunda's bundled Connector Runtime** (e.g., in SM deployment): may use a different model; the Connector SDK's `@InboundConnector` / `@OutboundConnectorFunction` Connectors are typically instantiated by the SDK / runtime; Spring DI in your Connector class may not auto-work.
  - **Alternative DI patterns**: pass dependencies via Connector configuration / properties; or instantiate via static / factory if needed; or wrap Spring-DI code in a helper Spring app and call via API.
  
  Verify your Connector Runtime model. For Spring-heavy applications: embed Connector Runtime in your Spring Boot app to leverage Spring DI seamlessly. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/) + [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** Always full Spring DI — partial; depends on Runtime model. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/)

- **c)** Never Spring DI — partial; depends. Documentation: [Connector SDK](https://docs.camunda.io/docs/components/connectors/custom-built-connectors/)

- **d)** Spring DI is anti-pattern — wrong; legitimate when supported. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Spring DI in custom Connectors depends on the Connector Runtime deployment model:

  **Embedded Connector Runtime in Spring Boot app**:
  - Your team operates a Spring Boot application that hosts the Connector Runtime AND your custom Connectors.
  - Connectors are Spring beans; @Autowired works.
  - **Pro**: full Spring features; DI; lifecycle management; profiles; configuration.
  - **Con**: you operate the Connector Runtime (deployment, scaling, monitoring).

  **Bundled Connector Runtime** (Camunda-managed in SM / SaaS):
  - The Connector Runtime is provided by Camunda; you upload custom Connector JARs.
  - The SDK / Runtime instantiates Connector classes; Spring DI in your Connector class may not auto-work (depends on the Runtime's wiring).
  - Workarounds:
    - Pass dependencies via Connector properties / context.
    - Static / factory-pattern dependencies.
    - Wrap Spring-DI in a separate service; Connector calls it via HTTP / gRPC.

  **Recommendation for Spring-heavy teams**:
  - **Self-host the Connector Runtime** in a Spring Boot app (option 1). Full DI; easier to maintain Spring services in Connectors.
  - For SaaS / managed Runtime: rely on context-passed dependencies or external service calls.

  Verify the specific Connector Runtime model in your Camunda 8 setup.

- **Option b) — Partial.** Depends.

- **Option c) — Partial.** Depends.

- **Option d) — Wrong.** Legitimate.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Depends on Runtime model; embedded в Spring Boot enables DI; bundled may need workarounds.
- **b) 5/10** — partial.
- **c) 5/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Depends on Connector Runtime — embedded in Spring Boot app: full DI; bundled Runtime: may need workarounds.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Connector code Spring DI." DI in Connectors.

**Въпросът → Solution Framing.** "Can use Spring DI" — изпитва се knowledge на Runtime model.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че embedded Runtime enables DI, че bundled may need workarounds, че self-host gives full Spring. Това е знание за Connector Runtime architecture.

---

## Question 46: Extensions & Integrations (Weighting: 25%)

**Scenario:** An Inbound Webhook Connector receives events. Due to partner's retry behaviour, the same event may arrive multiple times. The team wonders if the Connector deduplicates events.

**Does Inbound Connector deduplicate events from external sources?**

- **a)** **Built-in deduplication varies**:
  - Some Connectors (e.g., Webhook) may have configuration for deduplication keys.
  - For broad Inbound Connectors: deduplication is **typically your responsibility**:
    - Configure the partner to send an idempotency key in the event (header / body).
    - Use the key as `messageId` when correlating; Camunda's Message deduplication then handles duplicates within TTL.
    - Or implement deduplication in a Service Task after the Connector (check + skip if duplicate).
  
  For mission-critical idempotency: don't rely on Connector built-ins alone; design idempotency end-to-end. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/) + [Messages](https://docs.camunda.io/docs/components/concepts/messages/)

- **b)** Always automatic dedup — wrong; depends on Connector. Documentation: [Inbound Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Never — wrong; some Connectors support it. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** Dedup happens in Tasklist — wrong scope. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Event deduplication for Inbound Connectors is a layered concern:

  **Connector-specific dedup**:
  - Some Connectors (especially Webhook variants) may expose configuration for dedup keys.
  - Verify per Connector + version.

  **Message correlation dedup (general pattern)**:
  - Partner includes idempotency key in event (header / body).
  - Connector extracts key, uses as `messageId` when correlating.
  - Camunda's broker dedups: same messageId within TTL window → discarded.
  - Effect: even if partner retries the event, only one correlates.

  **Application-level dedup**:
  - After event triggers a process, a Service Task / DMN checks if this event has been processed before (by querying a state store).
  - Skip duplicates; record processed events.

  **End-to-end idempotency**:
  - Combine layers for mission-critical scenarios.
  - Partner: send idempotency key.
  - Connector: pass through as messageId.
  - Camunda: dedup via TTL.
  - Application: state-store check as safety net.

  Don't assume Connector dedups automatically; design idempotency intentionally.

- **Option b) — Wrong.** Depends.

- **Option c) — Wrong.** Some support.

- **Option d) — Wrong scope.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Dedup varies per Connector; design end-to-end with idempotency keys + messageId + app-level checks.
- **b) 2/10** — wrong; depends.
- **c) 2/10** — wrong.
- **d) 1/10** — wrong scope.

**Correct Answer:** Varies per Connector; design end-to-end idempotency with idempotency keys + Camunda Message dedup + app-level safeguards.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "duplicate events", "Connector deduplicate." Event dedup.

**Въпросът → Solution Framing.** "Connector deduplicates" — изпитва се knowledge на dedup layers.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Connector dedup varies, че messageId-based dedup standard, че app-level safety net. Това е знание за event idempotency.

---

## Question 47: Extensions & Integrations (Weighting: 25%)

**Scenario:** An RPA bot fails mid-way through automating a desktop app (e.g., target app crashed). The team wonders how RPA errors propagate and how to handle them in BPMN.

**How does RPA error handling integrate with BPMN?**

- **a)** **RPA bot errors typically surface as BPMN errors** on the RPA Service Task:
  - Bot script handles its errors (try/catch in bot DSL).
  - On unrecoverable failure, bot reports error to the RPA worker; worker reports to Zeebe (via job.fail or job.error with BPMN errorCode).
  - **BPMN Error Boundary** on the RPA Service Task catches by errorCode; routes to handler (notify ops, retry, skip).
  - **Retries**: BPMN-level `retries` apply; bot may be re-activated.
  
  Design RPA scripts with explicit error handling — distinguish recoverable (network blip, retry) from unrecoverable (app missing, escalate). Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/) + [Error Events](https://docs.camunda.io/docs/components/modeler/bpmn/error-events/)

- **b)** Bot errors crash the worker — partial; bad design but possible. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **c)** No error integration — wrong. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

- **d)** Bot must succeed always — wrong; failures common. Documentation: [RPA](https://docs.camunda.io/docs/components/rpa/overview/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** RPA error handling spans bot script + BPMN layers:

  **Bot script layer** (Robot Framework or other RPA DSL):
  - **Try/catch / error handlers**: bot script handles errors at the DSL level.
  - **Distinguish error types**: transient (retry-eligible) vs permanent.
  - **Report status**: bot communicates success / failure back to the RPA worker (via DSL constructs or exit codes).

  **RPA Worker layer**:
  - Worker subscribes to RPA Service Task type.
  - Receives bot result on completion.
  - **On success**: completes the Zeebe job with bot's output variables.
  - **On failure**: calls `job.error({errorCode: "..."})` for BPMN-level error (if applicable) or `job.fail()` for generic failure.

  **BPMN layer**:
  - **Error Boundary** on RPA Service Task catches by errorCode (e.g., "TARGET_APP_DOWN" routes to "notify IT" path).
  - **Retries** (`zeebe:taskDefinition retries`): for transient errors, BPMN-level retries re-activate the bot.
  - **Compensation**: if RPA work needs reversing on downstream failure.

  **Common bot error scenarios**:
  - Target application not running → distinct errorCode → escalate.
  - Window not found / element missing → distinct errorCode → retry or escalate.
  - Authentication failed → distinct errorCode → notify.
  - Network connectivity → typically transient → BPMN retries.

  **Best practices**:
  - **Explicit errorCodes** for distinct failure modes.
  - **Logging in bot**: capture context for debugging.
  - **Monitoring**: alert on bot failure rate spikes.
  - **Graceful degradation**: design BPMN to handle bot unavailability (e.g., manual fallback path).

- **Option b) — Partial.** Bad design.

- **Option c) — Wrong.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Bot errors → worker → BPMN error / fail → Error Boundary; layered handling.
- **b) 4/10** — partial; bad design.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Bot errors propagate via worker → BPMN error / fail → Error Boundary catches by errorCode; layered handling with retries.

**Official Documentation Link:** https://docs.camunda.io/docs/components/rpa/overview/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "RPA bot fails", "error handling." RPA error propagation.

**Въпросът → Solution Framing.** "How errors integrate" — изпитва се knowledge на RPA + BPMN error flow.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че bot → worker → BPMN error layer, че errorCodes enable routing, че retries layer. Това е знание за RPA error architecture.

---

## Question 48: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression must compute "30 days from now in Berlin time": `=date and time(today() + duration("P30D"), time("09:00:00@Europe/Berlin"))`. The team wonders about timezone-aware date arithmetic.

**Does FEEL support timezone-aware date arithmetic?**

- **a)** **Yes — FEEL handles timezones for `date and time` values**:
  - **Construct with TZ**: `date and time("2026-05-14T09:00:00@Europe/Berlin")` or `time("09:00:00+02:00")`.
  - **Operations preserve TZ semantics**: comparisons normalise to UTC; arithmetic handles DST correctly (mostly).
  - **Extract / convert**: get TZ-specific components; convert between zones.
  
  **Caveats**:
  - **DST transitions**: arithmetic during DST jumps can have edge cases (e.g., "1 hour from 1:30 AM on spring-forward day" — what's the result?). FEEL implementations should handle correctly but verify for critical scenarios.
  - **Date (date-only) vs date-and-time**: pure `date` has no TZ; `date and time` does.
  
  Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** No timezone support — wrong; supported. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **c)** Only UTC — partial; named zones + offsets supported. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **d)** Timezone breaks FEEL — wrong. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's temporal types support timezones:

  **Constructors with TZ**:
  - **Named zone**: `date and time("2026-05-14T09:00:00@Europe/Berlin")` — IANA zone name.
  - **Offset**: `date and time("2026-05-14T09:00:00+02:00")` — fixed offset from UTC.
  - **UTC explicit**: `date and time("2026-05-14T09:00:00Z")` — Z = UTC.

  **Arithmetic**:
  - **Add duration**: `dt + duration("PT24H")` — adds 24 hours; preserves zone.
  - **Add years/months duration**: `dt + duration("P1M")` — adds 1 calendar month.
  - **Subtract**: `dt2 - dt1` returns duration.

  **DST handling**:
  - Adding "1 day" handles DST transitions (e.g., spring-forward / fall-back days are 23 / 25 hours).
  - Adding "24 hours" is strictly 24 hours (may produce same wall-clock time on different days).
  - Subtle semantics; FEEL implementations should follow ISO 8601 / RFC standards.

  **Comparisons**:
  - Two `date and time` values compared: engine normalises to UTC equivalent; result is consistent regardless of input zones.
  - `2026-05-14T11:00:00+02:00` and `2026-05-14T09:00:00Z` represent the same moment; FEEL treats them as equal.

  **Best practices**:
  - **Store in UTC**: process variables hold UTC date-and-time values; display in user's zone if needed.
  - **Explicit zones in expressions**: avoid implicit zone assumptions.
  - **Test DST edges**: critical for scheduling around transition dates.

- **Option b) — Wrong.** Supported.

- **Option c) — Partial.** Named zones + offsets.

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. FEEL supports TZ for date and time; named zones / offsets; DST-aware (with caveats).
- **b) 1/10** — wrong.
- **c) 5/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** FEEL supports timezone-aware date arithmetic via named zones / offsets; DST handled (verify edge cases).

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "Berlin time", "timezone-aware." TZ arithmetic.

**Въпросът → Solution Framing.** "Timezone arithmetic" — изпитва се knowledge на FEEL TZ support.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че FEEL supports TZ via named / offset, че DST handled с caveats, че store UTC + display in user TZ best practice. Това е знание за FEEL TZ.

---

## Question 49: Extensions & Integrations (Weighting: 25%)

**Scenario:** A FEEL expression uses `today()` for date calculations; another uses `now()`. The team wonders about the difference.

**`today()` vs `now()` in FEEL — when to use which?**

- **a)** **`today()`** returns the current **`date`** value (date only, no time component). E.g., `2026-05-14`. Useful for date arithmetic where time-of-day doesn't matter. **`now()`** returns the current **`date and time`** value (date + time + zone). E.g., `2026-05-14T09:30:00Z`. Useful for timestamps, precise moments, time-of-day-aware logic. Use `today()` when comparing dates only ("is order overdue if dueDate < today?"); use `now()` for precise moments ("how long since this event?"). Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **b)** Identical — wrong. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **c)** today() includes time — wrong. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

- **d)** now() is date only — wrong. Documentation: [FEEL temporal](https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** FEEL's "current moment" functions differ in return type:

  **`today()`**:
  - Returns: `date` type — year, month, day only.
  - Example: `today()` = `date("2026-05-14")`.
  - Use when: date-only comparisons, day-level arithmetic.
  - Examples:
    - `=dueDate < today()` — is the dueDate in the past?
    - `=birthDate + duration("P18Y") <= today()` — is the person at least 18?
    - `=eventDate = today()` — is the event today?

  **`now()`**:
  - Returns: `date and time` type — full timestamp with zone.
  - Example: `now()` = `date and time("2026-05-14T09:30:45.123Z")`.
  - Use when: time-of-day-sensitive comparisons, precise timing.
  - Examples:
    - `=lastModified < now() - duration("PT1H")` — was it modified more than 1 hour ago?
    - `=auditLog: append({when: now(), what: "modified"})` — record exact timestamp.
    - `=eventStart < now() and eventEnd > now()` — is event happening right now?

  **Choosing**:
  - **Date-only logic** (deadlines by date, age in years, calendar comparisons): `today()`.
  - **Time-of-day or duration-based** (latency, freshness, "happening now"): `now()`.

  **Implicit conversion**:
  - `today()` can be combined with `time(...)` to get a date-and-time at a specific time of day.
  - `now()` can be converted to date via `date(now())` — strips time.

- **Option b) — Wrong.** Different types.

- **Option c) — Wrong.** Date only.

- **Option d) — Wrong.** Includes time.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. today() = date (no time); now() = date and time (full timestamp).
- **b) 1/10** — wrong.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** today() returns `date` (date-only); now() returns `date and time` (full timestamp); use today() for date logic, now() for precise moments.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/feel/builtin-functions/feel-built-in-functions-temporal/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "today() vs now() difference." Date function distinction.

**Въпросът → Solution Framing.** "When to use which" — изпитва се knowledge на FEEL temporal functions.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че today() = date, че now() = date and time, че choose by precision needed. Това е знание за FEEL date/time functions.

---

## Question 50: Extensions & Integrations (Weighting: 25%)

**Scenario:** A team's gRPC worker needs to **log every gRPC call** to Zeebe (request, response, latency) for audit / debugging. They wonder about gRPC interceptors.

**Can gRPC interceptors be used to instrument Camunda 8 SDK gRPC calls?**

- **a)** **Yes — gRPC client libraries support interceptors** (Java, Node, Go all have similar concepts). Use cases:
  - **Logging**: log every request / response / latency.
  - **Tracing**: inject trace context into metadata; correlate spans.
  - **Authentication**: add custom headers (e.g., custom tokens beyond standard OAuth2).
  - **Retry / circuit-breaker**: implement custom resilience.
  
  Configure interceptors when building the gRPC channel / client; they wrap all subsequent calls. **Caveat**: heavy interceptors add latency; use sparingly. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/) + [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

- **b)** No interceptors — wrong; gRPC supports. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

- **c)** Interceptors only for Java — partial; most gRPC languages have them. Documentation: [Zeebe API](https://docs.camunda.io/docs/apis-tools/zeebe-api/)

- **d)** Interceptors break SDK — wrong; designed for extensibility. Documentation: [Spring Zeebe](https://docs.camunda.io/docs/apis-tools/spring-zeebe-sdk/getting-started/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** gRPC interceptors are a standard mechanism for cross-cutting concerns on gRPC calls. All major gRPC client libraries support them:

  **Java**:
  ```java
  ManagedChannel channel = ManagedChannelBuilder.forAddress(host, port)
    .intercept(new LoggingInterceptor())
    .intercept(new TracingInterceptor())
    .build();
  ```

  **Node.js**:
  ```javascript
  const interceptor = (options, nextCall) => {
    return new InterceptingCall(nextCall(options), {
      start: (metadata, listener, next) => {
        // log / modify metadata
        next(metadata, listener);
      }
    });
  };
  client = new ServiceClient(address, credentials, { interceptors: [interceptor] });
  ```

  **Go**:
  ```go
  conn, err := grpc.Dial(address, grpc.WithUnaryInterceptor(loggingInterceptor))
  ```

  **For Camunda 8 SDKs**:
  - **Java Zeebe client**: built on grpc-java; interceptors apply.
  - **Spring Zeebe**: provides configuration hooks for interceptors.
  - **@camunda8/sdk (Node)**: built on grpc-js; interceptors apply (verify exact config in SDK docs).

  **Use cases**:
  - **Audit logging**: every call logged with timestamp, method, args (excluding secrets), result.
  - **Distributed tracing**: inject trace context; correlate Camunda's calls with downstream service traces.
  - **Custom auth**: in addition to Bearer token, add custom headers (e.g., correlation IDs).
  - **Metrics**: histogram of call latencies per method.
  - **Retry / circuit-breaker**: wrap calls with resilience patterns.

  **Performance impact**:
  - Each interceptor adds processing per call.
  - Lightweight interceptors (logging, header injection) negligible.
  - Heavy interceptors (synchronous external calls) can dominate latency.

- **Option b) — Wrong.** Supported.

- **Option c) — Partial.** Most languages.

- **Option d) — Wrong.** Designed for it.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. gRPC interceptors supported in Java / Node / Go; use for logging / tracing / auth / metrics; mind performance.
- **b) 1/10** — wrong.
- **c) 5/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Yes — gRPC interceptors supported in all major SDKs; use for logging / tracing / auth / metrics; mind performance.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/zeebe-api/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "gRPC interceptors", "log every call." Interceptor pattern.

**Въпросът → Solution Framing.** "Interceptors usable" — изпитва се knowledge на gRPC extensibility.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че interceptors standard gRPC concept, че all SDKs support, че use cases: logging / tracing / auth / metrics, че performance considerations. Това е знание за gRPC interceptor pattern.

---

# Section 7 — Managing the Development Process (Questions 51-59)

> Weight 15% • Topics: Web Modeler search across projects, Operate variable JSON tree view, Modify cancel current execution, Tasklist auto-claim, gateway naming, Operate alerts, template marketplace, cluster scaling, process variables vs documents.

---

## Question 51: Managing the Development Process (Weighting: 15%)

**Scenario:** A growing organisation has 200 projects in Web Modeler. A team lead wants to **search across all projects** for processes referencing a specific Connector or variable name.

**Does Web Modeler support cross-project search?**

- **a)** **Verify per version**: Web Modeler typically supports search within a project, but **cross-project / org-wide search** capabilities vary. **Workarounds**:
  - **Web Modeler API**: list all projects programmatically; for each, list resources; download contents; grep / search locally.
  - **Git-synced content**: if projects sync to Git, search the Git repo directly with standard tools (`grep`, IDE search).
  - **Search UI**: some Web Modeler versions add cross-project search features.
  
  For governance / discovery use cases (e.g., "which BPMNs use deprecated Connector X?"), Git-based search is often the most practical. Documentation: [Web Modeler API](https://docs.camunda.io/docs/apis-tools/web-modeler-api/)

- **b)** Full cross-project search built-in — partial; depends on version. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **c)** No search at all — wrong; project-level search typical. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

- **d)** Only by file name — partial. Documentation: [Web Modeler](https://docs.camunda.io/docs/components/modeler/web-modeler/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Web Modeler search capabilities evolve across versions:

  **Project-level search**: typical baseline — search within a project for resource names / content.

  **Cross-project search**: may or may not be a native feature depending on version. Workarounds:

  **Workaround 1: Web Modeler API**
  ```python
  # Pseudo-code
  for project in list_projects():
    for resource in list_resources(project):
      content = download_resource(resource)
      if "ConnectorX" in content:
        print(f"Found in {project.name}/{resource.name}")
  ```

  **Workaround 2: Git-synced content**
  - If projects use Git Sync, content is in a Git repo.
  - Standard tools: `git grep "ConnectorX"`, IDE's project-wide search.
  - Often the most practical for discovery / governance.

  **Workaround 3: Custom dashboards**
  - Build internal tools that aggregate Web Modeler content; index for search.

  **Use cases**:
  - **Deprecation**: "which BPMNs use Connector X v1?" before deprecating.
  - **Refactoring**: find all uses of a Form / DMN before changing.
  - **Audit**: find process references for compliance.

  **Best practice**: combine Web Modeler with Git Sync for project-wide content + Git-based search. Camunda-native tooling may catch up over versions.

- **Option b) — Partial.** Depends.

- **Option c) — Wrong.** Project-level search.

- **Option d) — Partial.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Cross-project varies; workarounds via API + Git Sync + custom tools.
- **b) 5/10** — partial.
- **c) 2/10** — wrong; project-level.
- **d) 4/10** — partial.

**Correct Answer:** Cross-project search varies by version; workarounds via Web Modeler API + Git Sync + Git search.

**Official Documentation Link:** https://docs.camunda.io/docs/apis-tools/web-modeler-api/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "search across all projects." Cross-project search.

**Въпросът → Solution Framing.** "Cross-project search" — изпитва се knowledge на Web Modeler search.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че project-level search standard, че cross-project varies, че API + Git са workarounds. Това е знание за Web Modeler discovery.

---

## Question 52: Managing the Development Process (Weighting: 15%)

**Scenario:** A process variable holds a complex nested JSON: `{customer: {name: "...", orders: [...]}}`. Ops viewing it in Operate sees a long text representation; they want a **tree view** for easier exploration.

**Does Operate support JSON tree view for complex variables?**

- **a)** **Yes — Operate's variable detail view typically renders structured / nested JSON as a tree** — expand / collapse nodes, see structure visually. Modern Operate versions support this well; older versions may show raw JSON text. Verify per version. **For very complex variables**: consider whether they belong in process scope at all (vs Document Handling); large nested state is hard to navigate even with a tree view. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/)

- **b)** Only raw text — partial; depends on version. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** No variable view — wrong. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Use external JSON viewer — workable but Operate built-in. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Operate's variable rendering for complex JSON:

  **Modern Operate**: typically supports tree / hierarchical view:
  - Click to expand object fields and arrays.
  - Collapse to focus on specific paths.
  - Easy to navigate even with deep nesting.

  **Older Operate**: may show as flat JSON text — less ergonomic but works for simple cases.

  **Use case examples**:
  - **Inspect customer object**: expand `customer`, see nested `address`, expand `address`, see `city`, etc.
  - **Inspect array of items**: expand `orders`, see each order; expand individual orders.
  - **Diff between versions** (some Operate features): see what changed in variables across instance lifecycle.

  **Limitations**:
  - **Very large variables** (10+ MB JSON): UI may slow / paginate.
  - **Sensitive data**: anyone with Operate access sees variable content; consider what to put in process variables.

  **Design implication**: don't dump everything into process variables. For large nested state, consider:
  - **Document Handling**: large binary / structured docs.
  - **External storage**: variables hold IDs / references; full data in separate store.
  - **Hygiene**: only carry what's needed for downstream BPMN logic.

- **Option b) — Partial.** Depends on version.

- **Option c) — Wrong.**

- **Option d) — Built-in works.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Modern Operate tree view for nested JSON; design for variable size.
- **b) 5/10** — partial.
- **c) 1/10** — wrong.
- **d) 4/10** — workable; built-in works.

**Correct Answer:** Yes — modern Operate renders nested JSON as a tree; for very large variables, use Document Handling instead.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/resolve-incidents-update-variables/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "JSON tree view complex variables." Variable rendering.

**Въпросът → Solution Framing.** "Tree view" — изпитва се knowledge на Operate variable UI.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Operate renders tree, че large variables design concern, че Document Handling alternative. Това е знание за Operate variable UI.

---

## Question 53: Managing the Development Process (Weighting: 15%)

**Scenario:** A process instance has an active token at Service Task `T-Failure` that's in an error state. Ops wants to **cancel this specific token without killing the whole instance** — perhaps another parallel branch is fine and should continue.

**Does Modify Process Instance support per-token cancellation?**

- **a)** **Yes — Modify Process Instance supports per-flow-node cancellation** — specify which token (at which flow node) to cancel; other tokens / parallel branches continue. **Surgical control**: useful when:
  - One parallel branch has issues, others are healthy.
  - Want to skip a specific stuck step without affecting siblings.
  - Recover from partial failures.
  
  Combined with activate-token + variables (per Set 10 Q53), Modify is comprehensive for surgical intervention. Documentation: [Operate Modify](https://docs.camunda.io/docs/components/operate/userguide/modify-instance/)

- **b)** Only entire instance cancel — wrong; per-token supported. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/modify-instance/)

- **c)** Only via Cancel Process Instance — wrong; that kills whole instance. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Per-token cancellation not supported — wrong. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/userguide/modify-instance/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Modify Process Instance provides surgical control over individual tokens within an instance:

  **Operations**:
  - **Cancel tokens at specific flow nodes**: pick the troubled tokens; cancel only those.
  - **Activate new tokens at specific flow nodes**: create tokens at downstream / alternate positions.
  - **Update variables in specific scopes**: set / change variable values.
  - **All in one atomic operation**: combine cancel + activate + variable update.

  **Use case for per-token cancellation**:
  ```
  Process has Parallel split:
    Branch A: [Validate] → [Process A] → [Ship A]
    Branch B: [Validate] → [Process B] → [Ship B]
  
  Branch B's [Process B] is in error state.
  Branch A is healthy.
  ```
  
  **Without Modify**: cancel whole instance → loses Branch A's progress.
  
  **With Modify**: cancel just Branch B's token at [Process B]; Branch A continues; instance reaches Parallel join eventually (with Branch B's token absent — verify join semantics).
  
  Or: cancel Branch B's token + activate new token at [Ship B] with variables to skip the failed step.

  **Caveats**:
  - **Parallel join semantics**: cancelling a token at a Parallel split's downstream branch may cause join to wait forever (Parallel join expects all branches). Modify carefully or use Inclusive join semantics.
  - **Compensation**: cancelled tokens don't trigger their activities' compensation; consider whether undo is needed.
  - **Audit**: Modify operations are logged in Operate; ops should document the why.

- **Option b) — Wrong.** Per-token.

- **Option c) — Wrong.** Cancel kills whole.

- **Option d) — Wrong.** Supported.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Modify supports per-token cancel + activate + variables; surgical control.
- **b) 1/10** — wrong.
- **c) 2/10** — wrong; cancel kills whole.
- **d) 1/10** — wrong.

**Correct Answer:** Yes — Modify Process Instance supports per-token cancellation; surgical control over individual tokens.

**Official Documentation Link:** https://docs.camunda.io/docs/components/operate/userguide/modify-instance/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "cancel specific token without killing instance." Per-token cancel.

**Въпросът → Solution Framing.** "Per-token cancellation" — изпитва се knowledge на Modify surgical control.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Modify е surgical, че cancel + activate + variables atomic, че Parallel join caveat. Това е знание за Modify per-token control.

---

## Question 54: Managing the Development Process (Weighting: 15%)

**Scenario:** A help-desk team's Tasklist shows 50 unassigned tasks. The team uses round-robin distribution. They wonder if Tasklist can **auto-claim** tasks for users based on rules (load balancing across candidates).

**Does Tasklist support auto-claim / auto-distribution of tasks?**

- **a)** **Auto-claim depends on Tasklist version + integration**:
  - **Native auto-claim**: some versions / configurations may offer auto-claim features.
  - **Custom auto-claim**: implement via Tasklist API + scheduler / worker — periodically claim unassigned tasks for least-loaded users.
  - **BPMN-driven auto-assignment**: use `assignmentDefinition` with FEEL to compute assignee at task creation (e.g., least-loaded user from a database).
  - **External task management tools**: integrate with workforce management systems that handle distribution.

  For sophisticated auto-distribution: typically requires custom logic / external tooling; Tasklist's UI is primarily designed for human claim. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/) + [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

- **b)** Tasklist auto-claims by default — wrong; explicit claim typical. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **c)** No auto-claim — wrong; achievable. Documentation: [Tasklist](https://docs.camunda.io/docs/components/tasklist/)

- **d)** Use BPMN to auto-assign in `assignmentDefinition` — partial; one approach. Documentation: [User Tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Auto-distribution of tasks in Camunda 8 spans multiple layers:

  **BPMN-driven (compile / activation time)**:
  - `zeebe:assignmentDefinition assignee="=...FEEL..."` — assignee evaluated at task activation.
  - Logic: FEEL expression / DMN call returns assignee (e.g., least-loaded user from queue length, round-robin counter, business rules).
  - Compute the assignee BEFORE the task lands in Tasklist; task arrives pre-assigned.

  **External orchestration**:
  - Custom service polls Tasklist API for unassigned tasks; applies distribution algorithm; calls assign API.
  - Sophisticated: factor user availability, skill match, current load, fairness.
  - Externalises the distribution logic; flexible.

  **Tasklist native features**:
  - Verify per version — Tasklist may add auto-claim / auto-distribution features over time.

  **Workforce management integration**:
  - Enterprise scenarios: integrate with WFM systems (Verint, Calabrio, etc.) that handle agent allocation.
  - Camunda exposes tasks via API; WFM consumes; assigns; calls back to Camunda.

  **For 50 tasks round-robin**:
  - **Simple**: external service polls every minute; assigns next task to next user in rotation. Stateful counter or random selection.
  - **Skill-aware**: match task type / priority to user capabilities.
  - **Load-balanced**: query current load per user; assign to least-loaded.

  Choose by complexity needs.

- **Option b) — Wrong.** Explicit claim default.

- **Option c) — Wrong.** Achievable.

- **Option d) — Partial.** One approach.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. BPMN assignmentDefinition + external orchestration + WFM integration; native varies.
- **b) 2/10** — wrong.
- **c) 1/10** — wrong.
- **d) 5/10** — partial.

**Correct Answer:** Auto-distribution via BPMN assignmentDefinition (at activation) or external orchestration via Tasklist API; native features vary.

**Official Documentation Link:** https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "auto-claim", "round-robin distribution." Task distribution.

**Въпросът → Solution Framing.** "Auto-claim support" — изпитва се knowledge на distribution patterns.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че BPMN assignment + external orchestration + WFM integration, че Tasklist primarily human claim, че native auto-claim varies. Това е знание за task distribution patterns.

---

## Question 55: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's BPMN diagrams have gateways labeled inconsistently — some labels are questions, some are commands, some are blank. The team lead wants a **naming convention** for gateways.

**Recommended naming conventions for BPMN gateways?**

- **a)** **Per gateway type**:
  - **Exclusive (XOR) split**: **question** — "Approved?", "Amount > 1000?", "VIP customer?". Each outgoing flow labeled with the answer ("Yes" / "No" / specific values).
  - **Inclusive (OR) split**: **question / condition descriptor** — "Which checks apply?". Outgoing flows labeled with their specific conditions.
  - **Parallel (AND) split**: typically unlabeled or descriptive ("Split for parallel processing").
  - **Event-Based split**: descriptor — "First event wins". Outgoing flows labeled with event types.
  - **Joins (any type)**: typically unlabeled or minimal ("Merge").

  Consistent across team; documented in BPMN style guide. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** No convention needed — anti-pattern; consistency aids reading. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **c)** All gateways same label format — partial. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **d)** Auto-generated labels — incorrect; modeler-defined. Documentation: [BPMN](https://docs.camunda.io/docs/components/modeler/bpmn/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Per-gateway-type conventions clarify intent:

  **Exclusive (XOR) split** — decision point:
  - **Gateway label**: question form. "Approved?", "Customer tier?", "Order value > 1000?"
  - **Flow labels**: the answer or value. "Yes" / "No"; "GOLD" / "SILVER" / "BRONZE"; ">1000" / "<=1000".
  - **Reader sees**: question + answers → decision branching is obvious.

  **Inclusive (OR) split** — conditional branches:
  - **Gateway label**: descriptive or question. "Which validations apply?", "Applicable discounts?".
  - **Flow labels**: specific condition / branch name. "Address check", "Credit score check", "ID verification".
  - **Reader sees**: multiple branches may activate; conditions per branch.

  **Parallel (AND) split** — concurrent branches:
  - **Gateway label**: typically unlabeled (the split itself doesn't make a decision) or short descriptive ("Split for parallel processing").
  - **Flow labels**: optional descriptors of each parallel path's purpose.
  - **Reader sees**: all branches activate concurrently.

  **Event-Based split** — race condition:
  - **Gateway label**: descriptor — "First event wins" / "Race timeout vs response".
  - **Each outgoing event**: clearly labelled by what it represents.
  - **Reader sees**: pause-and-race semantic.

  **Joins (all types)**:
  - Typically unlabeled — joins don't add decision logic.
  - "Merge" if helpful for clarity in complex diagrams.

  **Team-level**:
  - Document conventions in a BPMN style guide.
  - Code review BPMN as you do code: enforce consistency.
  - Inconsistency hurts readability; consistency aids understanding.

- **Option b) — Anti-pattern.**

- **Option c) — Partial.** Same format doesn't fit all gateways.

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Per-gateway-type conventions: XOR question, Parallel typically unlabeled, etc.
- **b) 2/10** — anti-pattern.
- **c) 4/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Per-gateway-type conventions: XOR with question; Parallel typically unlabeled; flow labels carry answers / conditions.

**Official Documentation Link:** https://docs.camunda.io/docs/components/best-practices/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "gateway naming convention." Modelling style.

**Въпросът → Solution Framing.** "Recommended conventions" — изпитва се knowledge на BPMN style.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че per-gateway-type conventions, че XOR question + flow answers, че team style guide. Това е знание за BPMN conventions.

---

## Question 56: Managing the Development Process (Weighting: 15%)

**Scenario:** Ops wants real-time alerts when **process incidents spike** — e.g., notify Slack / PagerDuty when 5+ incidents fire in 1 minute.

**How can Camunda 8 integrate with external alerting (Slack / PagerDuty)?**

- **a)** **Multiple paths**:
  1. **Metrics + Grafana / Datadog**: monitor incident-related metrics (`incidents_total`, `incidents_by_type`); configure alerting rules in the observability platform. The platform sends notifications to Slack / PagerDuty / email per its integrations.
  2. **Operate API polling**: custom service polls Operate's incident endpoints periodically; on thresholds, triggers notifications.
  3. **BPMN Event Subprocess on Error**: model alerting as BPMN — process catches its own errors and sends notifications via Slack Connector. Inside the process scope.
  4. **Webhook from Camunda's observability** (where supported): Camunda may emit events / alerts directly to webhook endpoints.

  Most teams: Prometheus metrics → Grafana / Alertmanager → Slack / PagerDuty. Standard observability stack. Documentation: [Self-Managed monitoring](https://docs.camunda.io/docs/self-managed/) + [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** No external alerting — wrong; achievable. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **c)** Only via Operate UI — partial; UI for browsing; alerting needs external. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

- **d)** Built-in Slack integration in Operate — partial. Documentation: [Operate](https://docs.camunda.io/docs/components/operate/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** External alerting integration for Camunda 8:

  **Path 1: Metrics-based (recommended)**:
  - Camunda components expose Prometheus metrics (incidents, latencies, error rates).
  - Prometheus scrapes; Alertmanager routes alerts based on rules.
  - Alertmanager integrates with Slack / PagerDuty / email / etc.
  - **Pro**: standard observability pattern; rule-based; suppression / grouping; multi-channel.
  - Setup once; alerts on any metric thresholds.

  **Path 2: Operate API polling**:
  - Custom service polls `/v2/process-instances/search` with state=ACTIVE + has-incident filter.
  - On threshold (e.g., > 5 new incidents per minute), POST to Slack webhook.
  - **Pro**: customisable; integrates Operate's incident details.
  - **Con**: polling overhead; latency.

  **Path 3: BPMN-modeled alerting**:
  - Process has Event Subprocess with Error Start (catch-all errors).
  - Inside: Service Task with Slack Connector → notify ops.
  - **Pro**: alerts are BPMN-visible; per-process semantics.
  - **Con**: only catches errors thrown by that process; doesn't cover infrastructure incidents.

  **Path 4: Camunda-emitted webhooks**:
  - If Camunda supports emitting events to external webhooks (verify per version).
  - **Pro**: real-time; no polling.
  - **Con**: limited filtering.

  **Production stack**:
  - **Prometheus + Alertmanager + Slack / PagerDuty**: industry standard.
  - **Camunda Console** (SaaS): may offer alert configuration for cluster-level events.
  - **Custom thresholds**: tune over time based on baseline.

- **Option b) — Wrong.** Achievable.

- **Option c) — Partial.** UI for browsing.

- **Option d) — Partial.** Verify per version.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Metrics + Alertmanager → Slack standard; alternatives for specific needs.
- **b) 1/10** — wrong.
- **c) 4/10** — partial.
- **d) 5/10** — partial.

**Correct Answer:** Multiple paths — Prometheus metrics + Alertmanager → Slack / PagerDuty is the standard observability integration.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "real-time alerts incidents spike", "Slack / PagerDuty." External alerting.

**Въпросът → Solution Framing.** "Integrate with external alerting" — изпитва се knowledge на observability integration.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Prometheus + Alertmanager standard, че Operate polling alternative, че BPMN-modeled per-process. Това е знание за alerting integration.

---

## Question 57: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's Web Modeler has many custom Connector Templates. They wonder if there's a **community marketplace / sharing** for Connector Templates across organisations.

**Is there a Connector Template marketplace / community sharing?**

- **a)** **Camunda community / official channels share Connector resources**:
  - **Camunda Marketplace / Hub**: official catalog of OOB Connectors + community contributions (verify current state).
  - **Camunda GitHub repos**: open-source Connector templates; clone / adapt for your use.
  - **Internal team sharing**: many enterprises develop templates internally; some publish to community.
  - **Forum / community discussions**: share + discuss templates on Camunda's community forum.

  For your team: check Camunda's official Connector library + GitHub for existing templates before building from scratch. Documentation: [Camunda Marketplace](https://marketplace.camunda.com/) (verify URL) + [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **b)** No sharing — wrong; community exists. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **c)** Only within one org — wrong; cross-org sharing via marketplace / Git. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

- **d)** All Connectors must be built from scratch — wrong. Documentation: [Connectors](https://docs.camunda.io/docs/components/connectors/use-connectors/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda ecosystem includes shared Connector resources:

  **Official Camunda channels**:
  - **OOB Connector library**: ships with Camunda 8; tested + maintained by Camunda.
  - **Camunda Marketplace / Hub** (verify current state): catalog of Camunda + partner + community Connectors.
  - **Documentation**: includes Connector list, examples.

  **Open-source on GitHub**:
  - **Camunda's own repos**: Connector SDK + sample Connectors + templates.
  - **Community contributions**: developers share custom Connectors; clone, adapt, contribute back.

  **Community channels**:
  - **Camunda Community Forum**: ask, share, discuss.
  - **Discord / Slack**: real-time discussion (verify current channels).
  - **Conferences / events**: CamundaCon talks, workshops.

  **Partner ecosystem**:
  - Camunda partners may offer Connector libraries for specific tech stacks.

  **For your team**:
  - Before building a Connector: check existing offerings.
  - When building: consider open-sourcing useful Connectors (give back to community; gain external testers).
  - Best practice: use OOB Connectors for standard integrations (Slack, AWS, etc.); custom for unique needs.

- **Option b) — Wrong.** Community exists.

- **Option c) — Wrong.** Cross-org sharing.

- **Option d) — Wrong.** Pre-built available.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Camunda Marketplace + GitHub + community forum for sharing Connector templates.
- **b) 1/10** — wrong.
- **c) 2/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Yes — Camunda Marketplace + GitHub + community forum share Connector templates; check before building from scratch.

**Official Documentation Link:** https://docs.camunda.io/docs/components/connectors/use-connectors/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "community marketplace / sharing." Template ecosystem.

**Въпросът → Solution Framing.** "Marketplace / sharing" — изпитва се knowledge на Camunda ecosystem.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че marketplace + GitHub + forum, че check before building, че contribute back valuable. Това е знание за Camunda ecosystem.

---

## Question 58: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's cluster experiences growing load — process instances per minute climbing. They wonder about **vertical vs horizontal scaling** of Camunda 8 components.

**Vertical vs horizontal scaling — which fits which Camunda 8 components?**

- **a)** **Different components scale differently**:
  
  **Zeebe brokers**: scale **horizontally via partitions** — add brokers to host more partitions; replication factor determines fault tolerance. Each partition is independent; total throughput scales with partition count.
  
  **Elasticsearch / OpenSearch** (Operate / Tasklist / Optimize backing): scale **both** — vertically (bigger nodes) for per-query speed; horizontally (more nodes / shards) for total capacity.
  
  **Operate / Tasklist / Web Modeler / Identity** (Spring Boot apps): scale **horizontally** — run multiple instances behind load balancer for HA + capacity. Stateless typically; sessions / state in databases.
  
  **Connector Runtime**: scale **horizontally** — more Connector Runtime instances handle more parallel Connector executions.
  
  **Workers** (your code): scale **horizontally** — more worker processes / containers for more parallel job processing.
  
  Plan capacity per component based on load characteristics. Documentation: [Self-Managed concepts](https://docs.camunda.io/docs/self-managed/concepts/architecture/) + [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

- **b)** Only vertical — wrong; horizontal critical for Zeebe. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

- **c)** Only horizontal — partial; vertical also valuable. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

- **d)** Camunda 8 doesn't scale — wrong. Documentation: [Self-Managed](https://docs.camunda.io/docs/self-managed/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Component-specific scaling strategies:

  **Zeebe brokers** (the runtime engine):
  - **Horizontal**: more brokers → more partitions → more throughput.
  - **Partition count** (configured at cluster init): tune for expected peak throughput.
  - **Replication factor**: typically 3 for fault tolerance; affects how many brokers needed (minimum = replication factor).
  - **Per broker**: each broker handles partition leadership + replica roles; CPU / memory / disk I/O per broker matters for individual partition performance.
  - **Practical**: start with 3 brokers + 3 partitions; scale up as needed.

  **Elasticsearch / OpenSearch**:
  - **Horizontal** (more nodes + shards): more total query / write capacity.
  - **Vertical** (bigger nodes): faster per-query response; useful for hot data.
  - **Read replicas**: scale read load.

  **Spring Boot apps** (Operate, Tasklist, Web Modeler, Identity):
  - **Horizontal**: multiple instances behind LB.
  - **State**: in databases / shared ES; instances typically stateless / session-less.
  - **Health checks + auto-scaling**: standard Kubernetes patterns.

  **Connector Runtime**:
  - **Horizontal**: more Connector Runtime instances for more concurrent Connector executions.
  - **Per-instance tuning**: thread pool sizes, concurrency caps.

  **Workers**:
  - **Horizontal**: more worker processes (containers / pods) for more parallel job processing.
  - **Per-worker tuning**: maxJobsActive, thread pool.

  **Capacity planning**:
  - Load test: measure where bottlenecks emerge.
  - Monitor: metrics on each component; scale where needed.
  - Tune incrementally: changes one component at a time; observe impact.

- **Option b) — Wrong.** Horizontal critical.

- **Option c) — Partial.** Vertical also valuable.

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Component-specific: Zeebe horizontal (partitions), ES both, apps horizontal, workers horizontal.
- **b) 2/10** — wrong.
- **c) 5/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Different components scale differently — Zeebe horizontal (partitions), ES both, Spring apps + Connector Runtime + workers horizontal.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/concepts/architecture/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "vertical vs horizontal scaling." Scaling strategy.

**Въпросът → Solution Framing.** "Which scales which" — изпитва се knowledge на per-component scaling.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Zeebe е horizontal (partitions), че ES е both, че Spring apps + Connectors + workers са horizontal. Това е знание за scaling architecture.

---

## Question 59: Managing the Development Process (Weighting: 15%)

**Scenario:** A team's process has **customer profiles** (~5 KB JSON), **product catalogs** (~2 MB JSON), and **document attachments** (~10 MB PDFs). They wonder which data should be Process Variables vs Documents.

**Best practice: which data fits process variables vs Document Handling?**

- **a)** **Decision matrix by size + access pattern**:
  - **Process Variables** (< few KB; accessed by FEEL in BPMN):
    - Small structured data: customer ID, order ID, status, key flags.
    - Data needed for routing / decisions (gateway conditions on it).
    - Customer profile at 5 KB: borderline — if heavily accessed in FEEL, OK; otherwise consider externalising.
  
  - **Document Handling** (> ~100 KB; large structured or binary):
    - Product catalogs at 2 MB: yes (large structured data).
    - Document attachments at 10 MB: definitely yes.
    - Anything passed primarily as opaque blob to workers (vs FEEL'd over).
  
  - **External Storage (DB / KV)** (variable size; reference-based):
    - Anything that has its own lifecycle separate from the process.
    - Customer profile if maintained externally: store in customer DB; process holds customerId only.
  
  **General principle**: variables hold what the process needs to reason about; large content lives elsewhere with references. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/) + [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **b)** Everything as variables — wrong; bloats state. Documentation: [Variables](https://docs.camunda.io/docs/components/concepts/variables/)

- **c)** Everything as Documents — partial; small data fine as variables. Documentation: [Document Handling](https://docs.camunda.io/docs/components/document-handling/document-handling/)

- **d)** No best practice — wrong; principles exist. Documentation: [Best Practices](https://docs.camunda.io/docs/components/best-practices/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Data placement decision matrix:

  **Process Variables**: best for small, BPMN-relevant data:
  - **Size**: < few KB ideally; up to ~10 KB OK.
  - **Access**: read frequently in FEEL (gateway conditions, mappings, Connector params).
  - **Lifecycle**: tied to process instance.
  - **Examples**: orderId, customerId, status, priority flag, FEEL-derived flags.

  **Document Handling**: best for large content:
  - **Size**: > ~100 KB or binary.
  - **Access**: typically opaque blob accessed by specific workers; not FEEL'd over deeply.
  - **Lifecycle**: tied to process or configured TTL.
  - **Examples**: PDFs, images, large structured exports, audio / video.

  **External Storage**: best for data with own lifecycle:
  - **Size**: any.
  - **Access**: lookup by ID; cached if needed.
  - **Lifecycle**: independent of process (customer DB, product catalog DB, etc.).
  - **Examples**: customer profile maintained in CRM; product catalog in product service.

  **For the scenario**:
  - **Customer profile 5 KB**: borderline. If actively used in FEEL (e.g., gateway routing on customer attributes), variable OK. If just passed to one task, external + ID reference. If processed by many tasks, variable OK.
  - **Product catalog 2 MB**: too large for variable. Document Handling OR external (with product IDs in variables).
  - **Document attachments 10 MB**: definitely Document Handling.

  **Anti-patterns**:
  - **Whole-state-in-variable**: load up customer + orders + products as one giant variable. Bloats; hurts performance; hard to navigate.
  - **Document Handling for tiny data**: overhead of reference lookup outweighs savings. < 1 KB stays as variable.

- **Option b) — Wrong.** Bloats.

- **Option c) — Partial.**

- **Option d) — Wrong.**

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Decision matrix: small + BPMN-accessed → variable; large → Document; with-own-lifecycle → external.
- **b) 2/10** — wrong.
- **c) 5/10** — partial.
- **d) 1/10** — wrong.

**Correct Answer:** Decision matrix by size + access pattern — variables for small BPMN-accessed data; Documents for large content; external for data with own lifecycle.

**Official Documentation Link:** https://docs.camunda.io/docs/components/best-practices/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "customer profile + product catalog + PDFs." Data placement.

**Въпросът → Solution Framing.** "Variables vs Documents" — изпитва се knowledge на data architecture.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че decision matrix по size + access pattern, че small variables + large Documents + external for own-lifecycle. Това е знание за data placement strategy.

---

# Section 8 — Dev Environment Setup (Question 60)

> Weight 1% • Topics: Camunda 8 Run Identity / authentication for local dev.

---

## Question 60: Dev Environment Setup (Weighting: 1%)

**Scenario:** A developer running **Camunda 8 Run** locally wants to test authentication — provision an API client, get OAuth2 token, call APIs with the token. They wonder about Identity setup in local Camunda 8 Run.

**How is authentication / Identity configured in local Camunda 8 Run?**

- **a)** **Camunda 8 Run typically bundles Identity** (Keycloak-based) for local development:
  - **Identity UI**: web UI for managing users / clients / scopes.
  - **Default admin user**: created during setup (or first start).
  - **API client provisioning**: create via Identity UI; get client ID + secret + token endpoint.
  - **Test authentication**: use credentials with zbctl / SDKs / REST API.
  
  For pure local dev with no auth concerns, some configurations may disable auth (basic / no auth mode). For realistic testing (matching prod auth flow), provision properly via Identity. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/) + [Identity](https://docs.camunda.io/docs/self-managed/identity/)

- **b)** No authentication in Camunda 8 Run — partial; depends on configuration. Documentation: [Camunda 8 Run](https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/)

- **c)** Use cloud Identity — wrong; local Identity bundled. Documentation: [Identity](https://docs.camunda.io/docs/self-managed/identity/)

- **d)** Identity not available locally — wrong; bundled. Documentation: [Identity](https://docs.camunda.io/docs/self-managed/identity/)

**🔍 Explanations & Correct Answer**

- **Option a) — Correct.** Camunda 8 Run for local development typically includes Identity:

  **What's bundled**:
  - **Identity component**: web UI for user / client management.
  - **Keycloak**: the IdP that Identity uses (or directly Keycloak in some setups).
  - **Default admin credentials**: created during init / setup process.

  **Initial setup flow**:
  1. Start Camunda 8 Run (`start.sh` / `start.bat`).
  2. Wait for all components to initialise.
  3. Access Identity UI (e.g., `http://localhost:8084/identity` — verify per version).
  4. Log in with default admin credentials (provided in docs / setup output).
  5. Create API Client: get client ID + secret + audience URLs.
  6. Use credentials with `zbctl` / SDK / curl for API calls.

  **Token endpoint** for local OAuth2:
  - Typically `http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token` (Keycloak default; verify).
  - Set `CAMUNDA_OAUTH_URL` env var to point here.

  **Realistic dev testing**:
  - **Provision clients with appropriate scopes**: matches prod auth flow.
  - **Test SDK / app auth flow**: client_credentials grant; token caching; refresh.
  - **Test failure modes**: bad credentials, expired tokens, missing scopes.

  **Simplified setup (less realistic)**:
  - Some Camunda 8 Run configurations may offer "no auth" mode for quick demos.
  - Trade-off: faster setup but doesn't match prod auth.

  Verify your Camunda 8 Run version's exact Identity setup steps + default credentials in the docs.

- **Option b) — Partial.** Depends.

- **Option c) — Wrong.** Local bundled.

- **Option d) — Wrong.** Bundled.

**Per-option scoring (1–10):**
- **a) 10/10** — верен. Camunda 8 Run bundles Identity (Keycloak); provision clients via UI; use credentials for OAuth2 flows.
- **b) 5/10** — partial.
- **c) 1/10** — wrong.
- **d) 1/10** — wrong.

**Correct Answer:** Camunda 8 Run bundles Identity / Keycloak; provision API clients via Identity UI; use credentials for OAuth2 flows.

**Official Documentation Link:** https://docs.camunda.io/docs/self-managed/quickstart/developer-quickstart/c8run/

**🧠 Three-Skills Decomposition**

**Сценарият → Diagnostic Comprehension.** Ключови думи "test authentication", "Camunda 8 Run local dev." Local Identity setup.

**Въпросът → Solution Framing.** "Authentication configured" — изпитва се knowledge на Camunda 8 Run Identity.

**Отговорите → Mechanism Knowledge + Trade-off Reasoning.** Знаеш че Camunda 8 Run bundles Identity, че provision via UI, че credentials enable OAuth2 testing. Това е знание за local dev auth setup.

---

# Закриваща секция — Set 12

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

**Чести грешки в Set 12 (грешен axis вместо грешен отговор):**
- **Q1 (Call Activity Output Mapping)** — пътане с "child variables auto-propagate"; explicit mapping required.
- **Q3 (overall MI timeout)** — пътане с per-iteration timer.
- **Q4 (layered Error Boundary + Event Subprocess)** — пътане с "mutually exclusive"; coexist.
- **Q5 (Lanes are visual)** — пътане с "Lanes auto-assign"; need assignmentDefinition.
- **Q7 (XOR first match wins)** — пътане с "all matching activate"; that's Inclusive.
- **Q10 (Zeebe roughly FIFO no priority)** — пътане с "process variable priority sorts"; no native priority.
- **Q13 (Sequential MI deterministic order)** — пътане с "concurrent" (that's Parallel).
- **Q15 (IDP feedback loop)** — пътане с "IDP is static"; feedback loops are core IDP value.
- **Q18 (Service Task no worker)** — пътане с "job auto-fails"; waits indefinitely.
- **Q21 (Boundary scoped to host)** — пътане с "instance-scoped"; host-scoped.
- **Q23 (ANY hit policy)** — пътане с "returns random matching"; consistency required.
- **Q28 (DMN sees caller's variables)** — пътане с "only what's explicitly passed"; whole scope accessible.
- **Q34 (service-layer for DB)** — пътане с "direct SQL always OK"; couples to schema.
- **Q41 (Spring DI in worker)** — пътане с "no DI"; Spring beans fully supported.
- **Q49 (today() vs now())** — пътане с "identical"; today = date, now = date and time.
- **Q53 (Modify per-token cancel)** — пътане с "only whole instance cancel"; surgical control.
- **Q58 (component-specific scaling)** — пътане с "always horizontal" or "always vertical"; depends on component.

**Свежи Set 12 теми (distinct от Sets 1-11):**

Modeling: Call Activity output back-flow, Error End vs Throw Intermediate inside subprocess, overall MI timeout via Boundary, layered Error Boundary + Event Subprocess Error Start, Lanes as visual + assignmentDefinition execution, multiple Start Events (None + Message), XOR first-match-wins on overlap, BPMN explicit loop с Gateway + back-edge, Compensation scope per subprocess.

Configuring Processes: Zeebe FIFO no native priority, deep nested FEEL navigation, User Task priority attribute, Sequential MI deterministic order, Documents not auto-delete on instance cancel, IDP feedback loop с human corrections, Element Template groups for property panel, AI Agent prompt versioning (multiple approaches), Service Task no worker = wait indefinitely, cron + ISO 8601 both supported, multi-instance message correlation (1-to-1 broker selects), Boundary subscriptions host-scoped lifetime, variable size limits + Document Handling mitigation.

DMN: ANY hit policy multi-match-same-output, FEEL `not()` function (no `!` operator), large flat table vs decomposed DRD performance, multi-decision DMN file, multi-caller DMN invocation best practice, DMN sees caller's variables context, DMN testing tools (Modeler + REST + libraries + E2E).

Forms: Form field key vs display-only writes, custom form-js components, form-js readOnly mode for completed tasks.

Connectors: Redis integration (custom Connector or Job Worker), service-layer pattern vs direct SQL, Connector telemetry via standard libs (SLF4J / Micrometer / OTel), Element Template properties + env vars + secrets layered config.

Extensions: FEEL sum([])=0 / decimal precision arbitrary / nested navigation patterns / for multi-iterator Cartesian, Spring @Autowired in workers, Node SDK variable types (large numbers + dates caveats), SDK comparison (Java most mature / Node Go first-class / Python REST), API rate limits per tier, Spring DI in custom Connectors (depends on Runtime model), Inbound event dedup layered, RPA error → BPMN errorCode → Error Boundary, FEEL TZ-aware date arithmetic, today() vs now() distinction, gRPC interceptors for cross-cutting.

Managing Dev: Web Modeler cross-project search workarounds (API + Git), Operate JSON tree view, Modify per-token cancellation, Tasklist auto-distribution patterns (BPMN + external + WFM), gateway naming conventions per type, Camunda metrics + Alertmanager + Slack standard alerting, Connector Marketplace + GitHub + community sharing, component-specific scaling (Zeebe horizontal partitions, ES both, apps + workers horizontal), data placement matrix (variables / Documents / external).

Dev Env: Camunda 8 Run bundles Identity / Keycloak for local auth testing.

**Успех на изпита! 🎓**

---

# 🎉 Серия Sets 1-12 = 720 unique въпроса

Sets 1-12 покриват **720 unique въпроса** разпределени по Blueprint v8.8.0 — extensive practice library за Camunda 8 C8-CP-DV certification.

**Препоръка за финална подготовка:**
1. **Преди изпита**: пройди през Sets 7-12 (свежи + квалитетни) closed-book.
2. **Идентифицирай области с грешки** — за всяка грешка определи кой от 3-те skills беше слаб (Diagnostic / Solution Framing / Mechanism Knowledge); фокусирай review там.
3. **Документация**: прегледай official Camunda 8.8 docs за често появяващи се теми — FEEL, MI, Connectors, Operate, Migration, Document Handling, Identity, Best Practices.
4. **Практика**: ако възможно, deploy локален Camunda 8 Run; experimentirai с примерни процеси; тренирай Operate / Tasklist UI; build a custom Connector; configure Identity.

**Успех на C8-CP-DV изпита! 🎓**
