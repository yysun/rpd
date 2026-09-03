---
name: rpd
description: >
  Run or explain the RPD repository workflow for requirements, planning, architecture review,
  implementation, tests, code review, acceptance verification, completion documentation, commits,
  and current-story correction. Use for ordinary repository work and command-like invocations of
  RPD, REQ, AP, AR, SS, TT, ET, CR, VR, DD, GC, or !!.
---

# RPD - Requirements, Planning, and Development Workflow

**Version:** `3.10.2`
**Repository:** https://github.com/yysun/rpd

A compact workflow with proportional planning and risk-based review.

## Principles

- Report only work and verification actually performed.
- Understand the causal path before editing; prefer the smallest sufficient change.
- Keep unrelated refactors, flags, fallbacks, compatibility layers, and artifacts out of scope.
- Ask only when a missing decision blocks correct work or an action needs new authority.
- Reviews are serial, read-only judgments. The primary agent owns every edit and fix.

## Intent and Authorization

- Explanation, diagnosis, review, requirements, and planning requests are read-only unless the user
  also asks for a change. Do not create workflow artifacts or extra review stages for ordinary
  read-only requests.
- A natural-language request to implement, fix, add, remove, or change repository behavior authorizes
  implementation. Do not require a command token or second approval.
- Explicit commands select their documented stage. `REQ`, `AP`, `AR`, and `DD` do not authorize source
  edits. `SS`, `TT`, `ET`, `CR`, `VR`, and `GC` authorize changes within their stage.
- `!!` is a current-story correction and restart through verified DD; it never authorizes GC.
- Treat command tokens as instructions only when bounded by whitespace, punctuation, or message
  boundaries and used command-like. Tokens in code or ordinary nouns such as “the GC pauses” and
  “that CR was rejected” are mentions. Trailing `!!` used as emphasis is not a command.

## Risk and Routing

**Protected boundaries:** public APIs and consumer contracts; schema, persistence, and migrations;
authentication, security, and privacy; external dependencies and integrations; infrastructure and
deployment; concurrency, performance, availability, and reliability behavior.

Start with focused repository inspection. Work is **non-low-risk** only when evidence shows that it:

- materially changes a protected boundary or needs compatibility or rollout coordination;
- spans components in a way that requires coordinated design;
- is difficult to reverse or failure has significant blast radius; or
- leaves a consequential behavior, architecture, or verification decision unresolved after inspection.

Otherwise, clear, localized, readily reversible work with straightforward verification is low risk.
A narrow edit to documentation, tests, or a contract surface is not non-low-risk unless its behavioral
impact meets a criterion above. File count, diff size, and model identity do not determine risk alone.

- Low-risk implementation uses the direct path: edit surgically, run relevant verification, then CR.
  It creates no REQ, AP, AR, VR, or DD artifact and stops after CR.
- Non-low-risk implementation uses the planned path: `REQ → AP → AR* → SS(+CR*) → TT → ET? → VR* → DD`.
  It stops before GC.
- Explicit `RPD` is the only unconditional full-process trigger and runs through GC. Explicit
  standalone stages stop according to their own command contract.
- For bug fixes, reproduce or localize the failure when practical, identify the root cause, apply the
  smallest causal fix, add or confirm focused regression coverage, and report the result.

## Conventions

- `{name}` is a short unique kebab-case story slug reused across story artifacts. Derive and announce
  it when unambiguous; ask only when ambiguity could select the wrong story.
- The current story is the user-named story, otherwise the story active in this session, otherwise the
  most recently substantively changed REQ. Checkbox-only changes do not change recency.
- `*` means repeat until the stage passes or progress blocks. `?` means run only when a matching E2E
  spec exists.
- REQ, AP, AR, and DD are documentation-only. The reconciliation part of `!!` is documentation-only.
- Detect verification from nearby scripts, manifests, CI, task runners, and docs. Prefer the narrowest
  unambiguous command and ask only when materially different choices remain.

## File Comment Blocks

- Before editing a source file, add a top comment block when absent.
- Summarize the file's features and important implementation notes.
- After editing, update the block with the relevant recent change.
- Apply this to every command that edits source. Files under `.docs/` are exempt.

## Review Contract

- AR, CR, and VR use the same risk classification. Low-risk review stays with the primary agent.
  Non-low-risk review uses an independent subagent when clean or minimal task context is available;
  otherwise the primary agent runs the same checklist and states that independence was unavailable.
- Start an independent reviewer without inherited authoring history when possible. Give it only the
  applicable artifacts, stable diff or implementation paths, verification evidence, and stage
  checklist. Do not give it the author's conclusions.
- Reviewers work read-only while no other agent edits the reviewed repository. Prefer runtime-enforced
  read-only operation. Without it, any observed reviewer or concurrent mutation invalidates the result.
  No snapshot hash, digest, retained byte bundle, or path manifest is required.
- The first review in a stage is full. Reuse the same independent reviewer for a finding-fix rerun and
  focus on every unresolved finding plus affected and plausible cross-cutting areas. Use a full rerun
  when the reviewer changes, a protected boundary changes, reach is uncertain, or scope expands.
- Return every material finding in priority order without a findings cap. The primary agent fixes
  findings, runs narrow verification for the fix, and reruns review. Stop when progress stalls.
- Each result contains one concise line `STAGE risk: low|non-low — <reason>`, one line
  `STAGE review round: <n>; reviewer: <new|reused|not applicable>`, material findings when present,
  and the stage's terminal verdict. Do not require finding IDs, checklist IDs, evidence matrices,
  inventory counts, or review-action/scope fields.

## Commands

- **REQ**: Create or update `.docs/reqs/{yyyy}/{mm}/{dd}/req-{name}.md`.
  - Describe Problem, Requirement, verifiable checkbox Acceptance Criteria, Constraints, Non-Goals,
    and only blocking Open Questions. State what must become true, not implementation steps.
  - Edit only the REQ document, then stop.

- **AP**: Create or update `.docs/plans/{yyyy}/{mm}/{dd}/plan-{name}.md`.
  - Inspect the repository first. Keep the plan proportional to the work.
  - Include Goal, relevant Current Context and Decisions, ordered executable checkbox Tasks, Validation,
    and Risk when real. Tasks name concrete files, behavior, or commands; no fixed phase count applies.
  - Add `.docs/tests/test-{name}.md` only for an executable user flow, observable public or external
    boundary, or regression-prone critical path. Skip E2E for pure internals without such a surface.
  - Write each E2E scenario with explicit initial conditions, ordered executable actions, and
    observable expected outcomes. Use Given/When/Then for compact behavioral scenarios or numbered
    steps for longer multi-step flows. Do not run tests or edit source during AP.
  - Auto-run AR and do not enter SS until AR passes.

- **AR**: Review the current REQ, AP, and optional E2E spec before implementation.
  - Check testability, simplicity, architecture, boundaries, dependencies, edge cases, compatibility,
    rollback, task executability, validation, E2E coverage, constraints, and non-goals.
  - Challenge unclear or weak requirements, plans, and proposed solutions instead of only checking
    document completeness. When a consequential choice remains, offer a small set of viable options,
    name the real tradeoffs, and recommend one. Ask only the next necessary question, then stop when
    the critical ambiguity is resolved and the plan is clear enough to implement.
  - Inspect existing tests, scripts, configurations, and prior evidence as needed, but do not execute
    tests, builds, typechecks, linters, benchmarks, E2E scenarios, or other verification commands
    during AR.
  - If runtime evidence is required to resolve feasibility, require a bounded first SS task with
    explicit decision criteria; do not use a full unit/integration suite or E2E scenario as the probe.
    If the probe fails or materially changes the architecture, stop dependent implementation, update
    the story artifacts, and rerun AR.
  - Fix blocking document flaws in place and rerun. Do not edit source.
  - Report `AR passed: no blocking architecture flaws`, `AR fixed: <summary>; rerun result passed`, or
    `AR blocked: <reason>`. A block stops implementation.

- **SS**: Implement an AR-approved plan.
  - If no current plan has passed AR since its latest material change, enter planned routing instead of
    improvising implementation.
  - Read the story artifacts and execute implementation tasks in order. Mark each complete only when
    concrete repository or command evidence shows its stated outcome exists; performing the action
    alone is insufficient. Update the plan when discovery materially changes the implementation path.
  - Complete every SS implementation task before starting CR. During implementation, run immediate
    focused verification only to resolve uncertainty or prevent dependent work from building on an
    unverified assumption; do not run routine checks at task, subtask, or phase boundaries.
  - After implementation stabilizes, run one consolidated set of focused checks covering the affected
    behavior before starting CR. Defer full unit/integration suites to TT and E2E scenarios to ET.
  - Do not run CR between plan tasks, subtasks, or informal implementation phases.
  - Auto-run CR once after SS completes. Rerun CR after a CR finding is fixed.
  - If a later stage materially changes the reviewed implementation, tests, requirement, or plan,
    rerun CR once after those changes stabilize.
  - Phase completion, test execution without edits, and checkbox-only progress do not trigger CR.
  - TT and ET mark their own plan tasks complete when required evidence exists.

- **TT**: Run applicable unit and integration suites and fix failures.
  - Detect every applicable command. Report absent suites instead of inventing commands.
  - Stop at the first failure when possible, fix its root cause without weakening tests, rerun affected
    tests, then continue until applicable suites pass.
  - RPD's model-driven maintainer scenarios are not ordinary TT. Run them only when explicitly planned
    for changes to RPD routing or review behavior.

- **CR**: Review the current uncommitted diff against its requirement, plan, and tests.
  - Check scope, architecture, correctness, edge cases, performance, maintainability, security,
    migrations, compatibility, coverage, and stale docs.
  - Do not run full unit/integration suites or E2E scenarios. TT owns full unit/integration execution;
    ET owns E2E. After a CR fix, run only narrow verification directly covering that fix.
  - Report `CR passed: no major findings`, `CR fixed: <summary>; rerun result passed`, or
    `CR blocked: <reason>` when required review cannot continue. Do not convert CR into TT.

- **VR**: Verify the implemented story against every acceptance criterion.
  - Compare requirements, plan tasks, optional E2E spec, code behavior, tests, docs, and review state.
    Tests alone do not prove completion.
  - Record each criterion as complete, incomplete, or blocked with concrete evidence. Update REQ
    checkboxes to reflect that evidence and uncheck stale claims. Do not require DD before VR.
  - Pass only when every criterion is evidenced and every AP task is complete.
  - Report `VR passed: all acceptance criteria complete` or `VR incomplete: <missing work>`.
  - When incomplete, update the story artifacts, run `SS → CR* → TT → ET?`, then rerun VR.

- **ET**: Execute the named E2E file or the current story's matching spec.
  - Ask for a path when no matching spec exists; do not create one during ET.
  - Stop at the first failure when possible, record expected versus observed behavior, fix the root
    cause, and rerun until the targeted scenarios pass.
  - Maintainer routing/review scenarios are not automatically the current story's ET spec.

- **DD**: Write `.docs/done/{yyyy}/{mm}/{dd}/{name}.md` after implementation and verification finish.
  - Keep a short PR-style Summary, Verification, and specific Notes. Verification must include the
    complete final VR result exactly as reported by the VR stage, preserving its structure and detail
    without summarizing or rewriting it.
  - Apart from the required final VR result, do not duplicate the requirement, plan, spec, or
    changelog. DD never edits source.

- **GC**: Commit only the current story's intended changes.
  - Inspect status, ensure relevant verification is current, stop on ambiguous unrelated changes, stage
    only story files, use a conventional message describing the delivered change, and report the hash.
  - GC does not automatically run CR.

- **!!**: Reconcile the latest correction into the current story and restart it.
  - Resolve the current story or stop on absence/ambiguity. Reconcile contradictions across REQ, AP,
    and the E2E spec; reopen acceptance criteria and tasks whose evidence became stale.
  - Reapply AP's E2E decision, invalidate the prior AR pass, and do not edit source before AR passes.
  - Run `AR* → SS(+CR*) → TT → ET? → VR* → DD`, then stop without GC.

- **RPD**: Run `REQ → AP → AR* → SS(+CR*) → TT → ET? → VR* → DD → GC`.
  - Accept a requirement description and continue without approvals between stages. Pause only for a
    real ambiguity, blocker, destructive action, external write, or scope requiring new authority.
  - Mid-sequence entry may skip only fresh matching artifacts and gates that passed after their latest
    material update.

## Artifact Layout

```text
.docs/reqs/{yyyy}/{mm}/{dd}/req-{name}.md
.docs/plans/{yyyy}/{mm}/{dd}/plan-{name}.md
.docs/tests/test-{name}.md
.docs/done/{yyyy}/{mm}/{dd}/{name}.md
```
