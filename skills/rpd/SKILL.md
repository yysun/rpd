---
name: rpd
description: >
  Run or explain the RPD development workflow. Use for ordinary repository work and command-like
  invocations of RPD, REQ, AP, AR, SS, TT, ET, CR, VR, DD, GC, or !!.
---

# RPD - Requirements, Planning, and Development Workflow

**Version:** `3.11.0`
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
- Make the smallest sufficient change after understanding its cause and constraints.

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
  non-low-risk work uses an independent subagent when available, otherwise local review with disclosure.
- Give reviewers artifacts, stable implementation/diff paths, evidence, and the stage checklist without
  authoring history or the author's conclusions. Reviewers stay read-only; the primary agent owns fixes.
- Review inputs include the story base, requirements, implementation, dependencies/configuration,
  tests, and evidence. Unrelated concurrent work, evidence-neutral progress, and commits preserving
  inputs and scope leave conclusions valid; no repository-wide snapshot is required.
- After material input changes stabilize, reassess affected conclusions before passing. Judge impact
  by behavior and evidence, not paths alone. Reuse the reviewer to cover unresolved findings, affected
  areas, and cross-cutting effects. First review, changed reviewer, protected-boundary changes, expanded
  scope, or uncertain reach require full review.
- Report all material findings in priority order. Fix, narrowly verify, and rerun until passed or
  blocked. Include stage evidence, its exact terminal verdict, and:
  `STAGE risk: low|non-low — <reason>`
  `STAGE review round: <n>; reviewer: <new|reused|not applicable>`

## Commands

- **REQ** — Create/update `.docs/reqs/{yyyy}/{mm}/{dd}/req-{name}.md`, then stop.
  Record the problem, outcome, verifiable checkbox acceptance criteria, constraints, non-goals, and blocking
  questions; specify outcomes rather than implementation steps.

- **AP** — Create/update `.docs/plans/{yyyy}/{mm}/{dd}/plan-{name}.md`; auto-run AR. Standalone AP stops there.
  Inspect first; record goals, decisions, ordered executable checkbox tasks, validation, and risks. Name files,
  behavior, or commands; omit downstream review/delivery bookkeeping. Apply AR's feasibility-probe rule.
  Create `.docs/tests/test-{name}.md` for executable user flows, observable public/external boundaries,
  or regression-prone critical paths; skip pure internals without such a surface. Scenarios need
  initial conditions, actions, and observable outcomes. AP executes no tests and edits no source;
  implementation requires AR to pass.

- **AR** — Review REQ, AP, and any E2E spec for testability, simplicity, architecture, boundaries,
  dependencies, edge cases, compatibility/rollback, executable tasks, coverage, constraints, and
  non-goals. Challenge weak choices; present viable options, tradeoffs, and a recommendation when a
  consequential decision remains. Inspect tests, configuration, and evidence without executing
  verification commands. Required runtime feasibility becomes a bounded first SS probe with decision
  criteria, not a full suite or E2E. Failed probes or material architecture changes stop dependent work,
  update story artifacts, and return to AR.
  Fix blocking document flaws and rerun; no source edits.
  Report `AR passed: no blocking architecture flaws`, `AR fixed: <summary>; rerun result passed`, or
  `AR blocked: <reason>`. A block stops implementation.

- **SS** — Implement the current plan; without an AR pass since its latest material change, enter
  planned routing. Read story artifacts, execute implementation tasks in order, and update the plan
  for material discoveries. Check off tasks only when repository/command evidence proves their
  outcomes; TT/ET close their own tasks.
  Before editing, record the story's Git base in AP; recover the earlier story base when resuming and
  preserve it across reruns. Include relevant changes already present at entry in the story scope.
  After completing an independently revertible implementation milestone, automatically commit locally,
  record its hash and verification status in AP, and continue. SS authorizes these commits unless the
  user forbids them. Stage commits do not mean acceptance or replace CR/TT/ET/VR.
  Reuse current verification; run focused checks for uncertainty, dependent work, or milestones.
  Batch remaining checks after implementation stabilizes, then auto-run CR. Later material changes
  to implementation, tests, requirements, or plan trigger CR under the Review Contract. Task boundaries,
  commits, test execution without edits, and checkbox updates alone trigger neither checks nor CR.

- **TT** — Run every applicable unit/integration suite; report absent suites. Stop at the first failure
  when possible, fix the cause without weakening tests, rerun affected tests, then finish the suites.

- **CR** — Review the story's entire change since its Git base: all story commits plus remaining
  staged, unstaged, and untracked changes. Recover a missing base from story/history before reviewing
  committed work; use the uncommitted diff when there are no story commits. Evaluate the change against
  requirements, plan, and tests for scope, architecture, correctness, edge cases, performance,
  maintainability, security, migrations, compatibility, coverage, and stale docs.
  Report `CR passed: no major findings`, `CR fixed: <summary>; rerun result passed`, or
  `CR blocked: <reason>`.

- **VR** — Compare each acceptance criterion with the plan, E2E spec, code behavior, tests, docs,
  and review state. Record complete/incomplete/blocked with concrete evidence; update REQ checkboxes
  and uncheck stale claims. Do not relax criteria to pass. Tests alone do not prove completion.
  Pass only with every criterion evidenced and every AP task complete; DD is not a prerequisite.
  Report `VR passed: all acceptance criteria complete` or `VR incomplete: <missing work>`.
  When incomplete, update story artifacts, run `SS → CR* → TT → ET?`, and rerun VR.

- **ET** — Execute the named E2E file or current story's matching spec. If absent, ask for its path;
  do not create one. Stop at the first failure when possible, record expected/observed behavior,
  fix its cause, and rerun until the targeted scenarios pass.

- **DD** — After implementation and verification, write `.docs/done/{yyyy}/{mm}/{dd}/{name}.md`.
  Use a short PR-style Summary, Verification, and specific Notes. Include the complete final VR result
  verbatim, preserving structure and detail. Otherwise avoid duplicating story documents or changelog.

- **GC** — Finalize delivery: inspect status, ensure relevant verification is current, and commit any
  remaining intended story changes with a conventional delivery message. Preserve earlier milestone
  commits and report the hashes; if nothing remains, report existing commits without an empty commit.
  Stop on ambiguous unrelated changes. GC does not trigger CR.

- **!!** — Resolve the current story or stop on absence/ambiguity. Reconcile the correction across
  REQ, AP, and E2E spec; reopen stale criteria/tasks, reapply AP's E2E decision, and invalidate AR.
  Reconciliation is documentation-only. Run `AR* → SS(+CR*) → TT → ET? → VR* → DD`; stop before GC.

- **RPD** — Run `REQ → AP → AR* → SS(+CR*) → TT → ET? → VR* → DD → GC` without inter-stage approval.
  Pause only for a blocker or action needing new authority. Mid-sequence entry skips only fresh
  matching artifacts and gates passed after their latest material update.
