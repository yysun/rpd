---
name: rpd
description: >
  Run or explain the RPD development workflow. Use for ordinary repository work and command-like
  invocations of RPD, REQ, AP, AR, SS, TT, ET, CR, VR, DD, GC, or !!.
---

# RPD - Requirements, Planning, and Development Workflow

**Version:** `3.12.1`
**Repository:** https://github.com/yysun/rpd

## Principles

- Explicit user instructions override this skill. If a skill rule causes a pause, permission request,
  unfinished work, or departure from user intent, link its SKILL.md, quote the rule, and explain its
  application, distinguishing requirements from interpretation.
- Continue authorized work to its endpoint; resolve routine choices from context. Ask only for a
  blocking decision or missing authority.
- Report actual work and evidence limits: versions, environments, verification levels, and pending
  runtime conditions. Establish feasibility before promising outcomes; declarations and local checks
  alone do not prove overall behavior.
- Understand the cause and constraints; make the smallest sufficient change that meets current
  requirements and preserves unaffected contracts. Keep unrelated refactors and speculative
  abstractions, flags, fallbacks, compatibility layers, and artifacts out of scope.

## Intent and Routing

Natural-language implementation requests authorize changes; explanation, diagnosis, review,
requirements, and planning are read-only unless changes or artifacts are requested. Explicit commands
permit their stage's changes; REQ, AP, AR, and DD edit only their documented artifacts. Commands need
whitespace, punctuation, or message boundaries; code, noun uses (“GC pauses”), and trailing emphasis
`!!` are not invocations.

Inspect the repository before classifying risk. **Protected boundaries:** public/consumer contracts;
data/persistence, schemas, and migrations; authentication/security/privacy; external dependencies/integrations;
infrastructure/deployment; concurrency/performance/availability/reliability.

**Non-low-risk** work has material protected-boundary impact, compatibility/rollout coordination,
coordinated cross-component design, difficult reversal, significant blast radius, or an unresolved
consequential behavior/design/verification decision. Clear, localized, reversible work with straightforward
verification is low risk. File count, diff size, model identity, or touching a protected surface alone
does not escalate risk.

- **Low risk:** implement, verify affected behavior, run CR, then stop without story artifacts.
- **Non-low risk:** `REQ → AP → AR* → SS(+CR*) → TT → ET? → VR* → DD`; stop before GC.
- **Explicit RPD:** the only unconditional full-process trigger; continue through GC.
- Standalone commands stop at their documented endpoint. `!!` restarts through DD without GC.

Stopping before GC can include SS milestone commits; GC is final delivery, not the first commit.

For bugs, reproduce or localize the failure, fix its cause, and verify regression coverage.

## Conventions

- Use one unique kebab-case `{name}` per story; derive and announce it unless ambiguous. Resolve the
  current story from the user's selection, this session, then the most recently substantively changed
  REQ; checkbox-only edits do not change recency. Update existing documents in place.
- Living docs describe current behavior and stay current: top-level `.docs/*.md` by default, plus
  anything the index `.docs/README.md` (areas mapped to living docs) or project instructions list.
  A story's REQ, AP, E2E spec, done note, and any project reports are story records: later stories
  change them only with a one-line superseded note, while `!!` and reruns of the same story update them
  in place. Read the index when present. Earlier stories' records are history: confirm their rules
  against code and living docs before relying on them. Report conflicts between documents; stop only
  when one blocks a decision.
- `*` repeats until pass or blocked; `?` runs only with a matching E2E spec. Stop stalled loops and
  report failures outside the current task's scope.
- Discover verification commands from scripts, manifests, CI, and docs. Full unit/integration suites
  belong to TT; E2E execution belongs to ET. RPD maintainer scenarios run only when explicitly planned
  and never substitute for the current story's TT/ET.
- Commits include only intended story changes and preserve unrelated staged/unstaged work. They do
  not authorize automatic push or history rewriting.

## File Comment Blocks

For every source-editing command, add a short header when effective module documentation is absent.
Describe responsibilities, important constraints, and necessary design reasons; update only when those
facts change. Reuse existing documentation; omit code inventories and change histories. Exempt `.docs/`.

## Review Contract

- AR, CR, and VR use the routing risk definition. The primary agent reviews low-risk work;
  non-low-risk work uses an independent subagent when available, otherwise the same checklist locally
  with disclosure.
- Give reviewers artifacts, stable implementation/diff paths, evidence, and the stage checklist without
  authoring history or the author's conclusions. Reviewers stay read-only; the primary agent owns fixes.
- Review inputs include the story base, requirements, implementation, dependencies/configuration,
  tests, and evidence. Unrelated concurrent work, evidence-neutral progress, and commits preserving
  inputs and scope leave conclusions valid; no repository-wide snapshot is required.
- After material input changes stabilize, reassess affected conclusions before passing. Judge impact
  by behavior and evidence, not paths alone. Reuse the reviewer to cover unresolved findings, affected
  areas, and cross-cutting effects; reopen settled conclusions only when new evidence invalidates them.
  First review, changed reviewer, protected-boundary changes, expanded scope, or uncertain reach require
  full review.
- Block only on unmet requirements, violated constraints, missing required evidence, or concrete
  material risks within the change's impact. Explain the failure condition and consequence;
  speculative improvements and stylistic preferences are non-blocking.
- A planned probe, gate, or rehearsal that is skipped, or removed or replaced by a plan update, cannot
  pass what it was meant to prove unless the user approved that change, or approved removing the claim
  from the REQ, in conversation or project instructions; a plan or REQ edit is not approval. Report
  the unverified claim, who is affected, the potential loss, and the recovery path; the user decides.
- When review stops making substantive progress, identify the unresolved decision or missing evidence
  instead of repeating the same review. Provide evidence sufficient for the verdict without extra
  tracking fields or reporting artifacts beyond the stage contract.
- Report all material findings in priority order. Fix blocking findings, narrowly verify, and rerun
  until passed or blocked. Include stage evidence, its exact terminal verdict, and:
  `STAGE risk: low|non-low — <reason>`
  `STAGE review round: <n>; reviewer: <new|reused|not applicable>`

## Commands

- **REQ** — Create/update `.docs/reqs/{yyyy}/{mm}/{dd}/req-{name}.md`, then stop.
  Record the problem, outcome, verifiable checkbox acceptance criteria, constraints, non-goals, and blocking
  questions; specify outcomes rather than implementation steps. Name earlier requirements, plans, or
  living docs the story supersedes, and the living docs whose rules it changes.

- **AP** — Create/update `.docs/plans/{yyyy}/{mm}/{dd}/plan-{name}.md`; auto-run AR. Standalone AP stops there.
  Inspect first; keep the plan proportional to the work. Record outcomes, boundaries, consequential
  decisions, ordered executable checkbox tasks, sufficient validation, and real risks. Tasks name files,
  behavior, or commands and serve requirements or preserved contracts; leave routine implementation
  choices to SS. Omit downstream review/delivery bookkeeping. Apply AR's feasibility-probe rule.
  Include tasks updating the living docs whose rules change. Identify one-way changes: data migrations,
  persisted formats older versions cannot read, and breaking removals from a public contract.
  Create `.docs/tests/test-{name}.md` for executable user flows, observable public/external boundaries,
  or regression-prone critical paths; skip pure internals without such a surface. Scenarios need
  initial conditions, actions, and observable outcomes. AP executes no tests and edits no source;
  implementation requires AR to pass.

- **AR** — Review REQ, AP, and any E2E spec for testability, simplicity, architecture, boundaries,
  dependencies, edge cases, compatibility/rollback, one-way changes, executable tasks, coverage,
  constraints, and non-goals. Challenge the REQ and plan rather than audit them: for each part, ask
  whether it needs to exist; whether project code, the platform or standard library, or an installed
  dependency already covers it; and whether removing or changing code beats adding it. Cut what the
  outcome does not justify, never safety, data protection, compatibility or verification the
  requirements need. Resolve blocking decisions with viable options, tradeoffs, and a recommendation;
  when one turns on what the user wants, block with one plain question. Pass once the plan is feasible,
  sufficiently verifiable, and has no blocking flaws; do not manufacture alternatives or require routine
  implementation details. Inspect tests, configuration, and evidence without executing
  verification commands. Required runtime feasibility becomes a bounded first SS probe with decision
  criteria, not a full suite or E2E. Failed probes or material architecture changes stop dependent work,
  update story artifacts, and return to AR.
  Fix blocking document flaws and rerun; no source edits.
  Report `AR passed: no blocking architecture flaws`, `AR fixed: <summary>; rerun result passed`, or
  `AR blocked: <reason>`. A block stops implementation.

- **SS** — Implement the current plan; without an AR pass since its latest material change, enter
  planned routing. Read story artifacts, execute the approved implementation tasks in order without
  adjacent improvements. When implementation departs from the plan, update the plan with the reason
  before continuing, not after the code. Check off tasks only when repository/command evidence proves
  their outcomes; TT/ET close their own tasks.
  Before editing a one-way change the user has not explicitly requested or approved as that specific
  change, stop once for approval, even in explicit RPD; this is missing authorization, so independent
  in-scope work continues. A one-way change found during SS is a material architecture change and
  returns to AR. When stopping or yielding partway through a hard-to-undo step (a migration, removing
  an old flow or its tests, switching a core flow), first reach a consistent point or record decisions,
  open items, and risks in AP.
  Before editing, record the story's Git base in AP; recover the earlier story base when resuming and
  preserve it across reruns. Include relevant changes already present at entry in the story scope.
  After completing an independently revertible implementation milestone, automatically commit locally,
  record its hash and verification status in AP, and continue. SS authorizes these commits unless the
  user forbids them. Stage commits do not mean acceptance or replace CR/TT/ET/VR.
  Reuse current verification; run additional focused checks only for changed behavior or unresolved
  uncertainty. Complete SS implementation tasks and batch remaining checks before auto-running CR.
  Do not insert CR between tasks or milestones. Later material changes to implementation, tests,
  requirements, or plan trigger CR under the Review Contract. Task boundaries,
  commits, test execution without edits, and checkbox updates alone trigger neither checks nor CR.

- **TT** — Run every applicable unit/integration suite; report absent suites. Stop at the first failure
  when possible, fix the cause without weakening tests, rerun affected tests, then finish the suites.

- **CR** — Review the story's entire change since its Git base: all story commits plus remaining
  staged, unstaged, and untracked changes. Recover a missing base from story/history before reviewing
  committed work; use the uncommitted diff when there are no story commits. Evaluate the change against
  requirements, plan, and tests for scope, architecture, correctness, edge cases, performance,
  maintainability, security, migrations, compatibility, coverage, and stale docs, including living docs
  that contradict the change. Block deleted or rewritten tests whose guarantees have no passing
  replacement unless the intended behavior change comes from the user's request or approval.
  Report `CR passed: no major findings`, `CR fixed: <summary>; rerun result passed`, or
  `CR blocked: <reason>`.

- **VR** — Compare each acceptance criterion with the plan, E2E spec, code behavior, tests, docs,
  and review state without adding goals or preferred designs. Reuse valid review and test evidence;
  investigate gaps or contradictions rather than repeating completed verification. Record
  complete/incomplete/blocked with concrete evidence; update REQ checkboxes and uncheck stale claims.
  Do not relax criteria to pass. Tests alone do not prove completion.
  Pass only with every criterion evidenced and every AP task complete; DD is not a prerequisite.
  Report `VR passed: all acceptance criteria complete` or `VR incomplete: <missing work>`.
  When incomplete, update story artifacts, run `SS → CR* → TT → ET?`, and rerun VR.

- **ET** — Execute the named E2E file or current story's matching spec. If absent, ask for its path;
  do not create one. Stop at the first failure when possible, record expected/observed behavior,
  fix its cause, and rerun until the targeted scenarios pass.

- **DD** — After implementation and verification, write `.docs/done/{yyyy}/{mm}/{dd}/{name}.md`.
  Use a short PR-style Summary, Verification, and specific Notes. Include the complete final VR result
  verbatim, preserving structure and detail. Otherwise avoid duplicating story documents or changelog.
  Mark documents the REQ lists as superseded with a one-line note. Create or update `.docs/README.md`
  only when a living doc is added, superseded, or changes status.

- **GC** — Finalize delivery: inspect status, ensure relevant verification is current, and commit any
  remaining intended story changes with a conventional delivery message. Preserve earlier milestone
  commits and report the hashes; if nothing remains, report existing commits without an empty commit.
  Stop on ambiguous unrelated changes. GC does not trigger CR.

- **!!** — Resolve the current story or stop on absence/ambiguity. Reconcile the correction across
  REQ, AP, and E2E spec; reopen stale criteria/tasks, including affected living-doc tasks, reapply AP's E2E decision, and invalidate AR.
  Reconciliation is documentation-only. Run `AR* → SS(+CR*) → TT → ET? → VR* → DD`; stop before GC.

- **RPD** — Run `REQ → AP → AR* → SS(+CR*) → TT → ET? → VR* → DD → GC` without inter-stage approval.
  Once VR passes, complete DD and then GC before reporting the story complete. Report the final local
  delivery commit hash or, if GC finds nothing left to commit, the existing story commit hashes.
  Treat SS milestone commits as progress and continue through the remaining stages.
  If a blocker or missing authorization prevents a step, finish all remaining in-scope work that can
  proceed independently before ending the run. Report the blocked stage or acceptance criteria, what
  prevents progress, and what is needed to resume. Mid-sequence entry skips only fresh matching
  artifacts and gates passed after their latest material update.
