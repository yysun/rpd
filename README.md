# RPD - Requirements, Planning, and Development Workflow

An AI agent skill that provides a structured workflow for requirements, planning, architecture review, implementation, verification, review, documentation, E2E execution, and commit. Works with Claude Code, Cursor, Copilot, Codex, Windsurf, Cline, Aider, and other AI coding tools.
![Diagram of RPD routing a request by risk: a direct path that implements, tests, and stops after code review, and a planned path that runs REQ, AP, AR, SS with code review, TT, ET, VR, and DD; below them the full RPD sequence through GC, and the `!!` restart path that stops at DD without GC.](rpd-loop.png)

RPD gives you 12 workflow commands you can use in conversation to drive a systematic development process.

**Version:** `3.8.0`

The installable [skills/rpd/SKILL.md](skills/rpd/SKILL.md) is the normative workflow contract. This
README explains why RPD exists and how to use it.

## Why RPD

1. **Fast to invoke**: two- and three-letter command keywords keep prompts short and reduce friction during implementation, review, and iteration.
2. **Built on context engineering and spec-driven development**: spec-driven development helps you start correctly; RPD helps you finish correctly and improve the project's working context over time.
3. **PDCA-compatible with review gates**: the workflow follows a Plan-Do-Check-Act shape and adds explicit review gates as safety rails before work moves forward.
4. **Creates a searchable project knowledge base**: requirements, plans, tests, and completion notes accumulate into documentation that reduces technical debt and long-term context loss.
5. **Preserves intent alongside code history**: combining the history of intent with the history of code gives humans and AI agents a stable map of what the team meant, making the system easier to hand off, extend, and change safely over time.
6. **Safer incremental change**: separating requirements, planning, implementation, testing, and review reduces the chance of skipping key checks or jumping from idea straight into risky code changes.
7. **Better onboarding and recovery**: when work is interrupted or handed to a new contributor, the requirement, plan, test, and done docs make it much easier to resume with the right context.
8. **Simple to learn and use**: the command set is small, the stages are easy to remember, and the workflow is straightforward enough to adopt without heavy process overhead.

## Quick Start

```text
Install RPD skill from GitHub yysun/rpd
```

The installable skill lives in `skills/rpd/`. Repository documentation, the workflow diagram, and everything under `.docs/` stay outside that directory and are not copied into client skill installations.

This repository uses RPD on itself: its requirements, plans, and maintainer checks are tracked in git under `.docs/`, following the same artifact paths the skill writes in any project. The compact maintainer suite lives under `.docs/tests/`.

Maintainers: test instructions live in [.docs/tests/README.md](.docs/tests/README.md).

## Workflow

### 1. Recommended: Full RPD workflow

Use `RPD` as the default for feature work when you want the workflow to carry a requirement through
planning, implementation, verification, documentation, and commit. It runs automatic review loops for
architecture, code, and requirement completion without pausing for human approval between stages,
except for clarification, blockers, destructive actions, or external writes.

```text
RPD Implement JWT authentication
```

Sequence: `REQ → AP → AR* → SS(+CR*) → TT → ET? → VR* → DD → GC`

`*` means the review or completion stage loops until no major issues remain. `?` means the stage runs only when the current story has a matching E2E test spec. `AP` creates or updates the E2E spec when the story needs one. `RPD` must not enter `SS` until `AR` has reviewed REQ, AP, and any E2E spec, fixed blocking doc/spec flaws in place, and explicitly reported an AR pass.

Create E2E specs for executable user flows, observable public or external boundaries, and
regression-prone critical paths. Skip them for pure internals without such a surface unless requested.

### 2. Targeted command workflow

Use an individual command when you want to run or resume a particular stage instead of starting the
complete workflow. For example, start requirement work with:

```text
REQ Implement JWT authentication
```

Follow with `AP` to create the architecture plan and needed E2E specs, `AR` to review and fix blocking
requirement, plan, or E2E spec flaws, `SS` to implement step-by-step, `TT` to run unit and integration
tests and fix failures, `CR` to review code, `ET` to execute and fix applicable story E2E scenarios,
`VR` to verify requirement completion, `DD` to document completed work, and `GC` to commit.

Typical sequence: `REQ → AP → AR* → SS(+CR*) → TT → ET? → VR* → DD → GC`

`AP` should be proportional to the work. A useful plan records the relevant goal, context, decisions,
ordered executable checkbox tasks, validation, and real risks. It has no mandatory phase count. Each
task should name a concrete file, behavior, artifact, or command so `SS` can execute it without
rediscovering the architecture. AR, CR, VR, DD, GC, staging, and committing are workflow stages or
delivery actions, not plan tasks.

`AR` challenges weak or unclear requirements and plans instead of merely checking completeness. When
a consequential choice remains, it offers viable options with real tradeoffs, recommends one, asks
only what is necessary, and stops once the plan is clear enough to implement.

### 3. Automatic routing for ordinary requests

You do not need a workflow command for every request:

- Explanation, diagnosis, review, requirements, and planning requests stay read-only.
- A clear request to implement or fix something authorizes implementation without a special command.
- Localized, reversible work that follows an existing pattern and changes no protected boundary takes
  the direct path: implement, verify, and stop after CR.
- Protected or uncertain work takes the planned path through REQ, AP, AR, implementation, testing,
  verification, and DD. Explicit `RPD` continues through GC.
- Explicit commands select their named stage; the installable skill defines the exact authorization
  and risk rules.

### 4. Correct and restart the current story: `!!`

Use `!!` when a requirement changes after a story already exists:

```
!! SSO is enterprise-only; remove the fallback login flow
```

The command reconciles the latest correction across the current story's REQ, AP, and E2E spec. It removes contradictions, reopens acceptance criteria and plan tasks whose evidence is stale, invalidates the previous AR pass, and then runs `AR* → SS(+CR*) → TT → ET? → VR* → DD`.

`!!` is approval to continue through implementation and documented completion after AR passes. It does not authorize `GC`; invoke `GC` separately to commit the corrected story. It also stops when no current story can be identified, when the target story is ambiguous, or for the same blockers, destructive actions, and external writes that pause `RPD`.


## Artifact paths used by the RPD workflow

```
.docs/
├── reqs/{yyyy}/{mm}/{dd}/req-{name}.md
├── plans/{yyyy}/{mm}/{dd}/plan-{name}.md
├── tests/test-{name}.md  # optional existing E2E spec
└── done/{yyyy}/{mm}/{dd}/{name}.md
```
`{name}` is a short kebab-case story slug (for example: `user-auth`, `offline-sync`) reused across related docs and commands. If omitted, the skill derives one from the requirement or task description, announces it, and continues unless the slug is ambiguous, collides with an unrelated story, or could attach work to the wrong docs.

REQ, AP, and DD keep the date from when the doc was first created; later updates modify the existing doc in place. E2E test specs are created during AP when needed, then reused by ET.

The **current story** — what `!!`, `VR`, and mid-sequence `RPD` operate on — is the story you name, otherwise the one already worked on in the session, otherwise the REQ doc with the most recent creation or substantive content change. Checkbox-only edits, such as `VR` acceptance updates, do not make an older story current, and the skill asks when two stories are equally plausible.

## Commands Reference

| Command | Purpose |
|---------|----------|
| `REQ` | Document requirements |
| `AP` | Create architecture plan and needed E2E specs; then trigger the required AR gate |
| `AR` | Review architecture and fix blocking requirement, plan, or E2E spec flaws before implementation |
| `SS` | Step-by-step implementation |
| `TT` | Run unit and integration tests and fix failures |
| `ET` | Run E2E tests and fix failures |
| `CR` | Code review |
| `VR` | Verify the requirement is fully implemented in code and docs; if not, refine AP, run SS, CR, TT, ET when applicable, update docs, then verify again |
| `DD` | Document completed work as a short PR-style summary |
| `GC` | Commit changes with clear scope |
| `!!` | Reconcile the current story, restart through verified DD, and stop before GC |
| `RPD` | Full end-to-end flow with AR, CR, and VR loops |

## Notes

- Explicit commands select their documented stage. `REQ`, `AP`, `AR`, and `DD` do not authorize source changes. `!!` is the exception: its reconciliation step is documentation-only, then it authorizes architecture, implementation, verification, and DD after AR passes, but not GC.
- A clear natural-language request to implement or fix repository behavior is implementation authorization. Direct-path work starts immediately; planned-path work continues automatically after AR passes.
- Direct implementation requires concrete repository evidence for every low-risk condition in the normative skill contract. Any false, uncertain, or unsupported condition selects REQ, AP, and AR first.
- Every direct implementation runs relevant verification and CR. Bug fixes also localize the failure, identify and fix the root cause, confirm regression coverage, and report symptom, cause, affected path, fix, and result.
- Standalone `SS` implements an existing approved plan; it is not the natural-language direct-routing mechanism. When the current story has no plan, or its plan has not passed `AR` since its latest material update, `SS` switches to planned routing instead of improvising an implementation.
- A new `REQ` should capture a testable problem, requirement, acceptance criteria, constraints, non-goals, and only blocking open questions.
- Acceptance criteria should name the property they depend on rather than a literal value a later release invalidates. Because `VR` may not relax a criterion to check it off, a criterion pinned to a literal version, count, or path can become permanently unsatisfiable while the work itself is complete. Prefer `a major version bump accompanies the breaking change` over `the version is 3.0.0`.
- `AP` and `RPD` must not enter `SS` until `AR` explicitly reports either `AR passed: no blocking architecture flaws` or `AR fixed: <summary>; rerun result passed`.
- `AR blocked: <flaw and why it cannot be resolved in place>` is the third possible `AR` result. It is not a pass: the flow stops and reports the blocker instead of entering `SS`. A blocking open question about expected behavior still requires AP to be created; the question is captured in REQ and AP, and AR is the mechanism that reports the block.
- A completed `CR` reports exactly one of `CR passed: no major findings` or `CR fixed: <summary>; rerun result passed`. A CR that cannot continue reports `CR blocked: <reason>`. `VR` reports exactly one of `VR passed: all acceptance criteria complete` or `VR incomplete: <summary of missing work>`.
- `AR` should block vague plans, missing validation evidence, unresolved architecture questions, and unnecessary compatibility or fallback machinery.
- One protected-boundary definition drives routing and AR, CR, and VR. It covers public and consumer contracts, data and migrations, authentication/security/privacy, external integrations, infrastructure/deployment, and concurrency/performance/availability/reliability behavior.
- Low-risk work must also be localized, follow an existing pattern, be reversible, and have clear behavior and verification. Uncertainty is non-low-risk; file count, diff size, documentation-only scope, test-only scope, and model identity are not evidence.
- The primary agent reviews low-risk work. A clean-context independent reviewer checks protected or uncertain work when available; otherwise the primary runs the same checklist and states that independence was unavailable.
- Reviews are serial and read-only. The first review is full. Reuse the same reviewer for a finding-fix rerun focused on every unresolved finding plus affected and plausible cross-cutting areas. Changed reviewers, protected boundaries, expanded scope, or uncertain reach force full review.
- Report one concise risk reason, one reviewer/round line, every material finding without a cap, and the terminal verdict. Stable finding/checklist IDs, evidence matrices, inventory counts, and review-action/scope fields are not required.
- No snapshot hash, verification digest, retained byte bundle, or path manifest is required. Any observed reviewer or concurrent mutation invalidates the result.
- `SS` verifies compile/build/typecheck, fixes failures, then auto-runs `CR*`.
- `SS`, `TT`, `ET`, `CR`, and `VR` should report concrete evidence: commands, failing cases, fixes, reruns, review findings, and acceptance-criteria status.
- Before asking which verification to run, inspect project scripts, task runners, lockfiles, build/test configs, CI workflows, Makefiles, docs, and nearby manifests; ask only when no unambiguous command exists or choices have materially different scope or side effects.
- Inside `RPD`, `SS` still auto-runs `CR*` before the workflow continues to `TT`.
- `VR` checks the original requirement against code behavior, implementation, tests, E2E spec, RPD docs, and review state; passing tests alone are not proof of completion.
- During `VR`, each REQ acceptance criterion is checked off only when concrete evidence proves it complete. Incomplete or blocked criteria remain unchecked, and `VR` cannot pass until every criterion is checked and evidenced.
- `VR` changes a previously checked criterion back to unchecked whenever current implementation, test, documentation, or review evidence no longer supports it.
- Stale, contradictory, or incomplete REQ, AP, or test docs make `VR` incomplete even when the code works.
- Do not require a DD completion document to exist or be current before VR passes. Planned routing, `!!`, and `RPD` run DD only after VR, so a matching completion document is downstream evidence rather than a VR prerequisite.
- `VR` does not pass while any AP task remains unchecked. AP contains implementation and verification work, not later DD or GC bookkeeping.
- When `VR` finds missing work, it updates the existing plan, test spec, and requirement docs when needed, runs `SS → CR* → TT → ET?`, updates affected docs, then reruns `VR` until complete or blocked.
- `RPD from SS` uses full-flow skip rules; standalone `SS` does not. Skip stages only when artifacts are fresh, match the current story and requirement, and were gated after the latest relevant update.
- `AR` and `CR` can also be manually triggered.
- `DD` can be invoked as a single-word message.
- `DD` runs once implementation, verification, and reviews are complete, whether or not the work is committed. Planned routing and `!!` run it after `VR` passes and then stop. Inside `RPD` it runs before `GC` so the commit can reference the completion summary.
- `DD` writes a short PR-style completion summary with `Summary`, `Verification`, and `Notes`; it should not duplicate the full requirement, plan, test spec, or changelog.
- `TT` runs every applicable unit and integration suite, stops at the first failure when possible, fixes the root cause, and repeats until every applicable suite passes; it reports an absent suite instead of inventing a command. `ET` applies the same failure-fix-rerun loop to the targeted E2E scope.
- Tier 2 dogfood is a maintainer check, not part of ordinary `TT` or `ET`. Run it only when explicitly planned for changes to RPD routing or review behavior; fixture reviews never become parent-story review rounds.
- `CR` applies a review-fix-review loop until no major flaws remain. It does not run full unit or integration suites or execute E2E scenarios: `TT` owns full unit and integration test execution and `ET` owns E2E execution. After CR changes code, it may run only narrow verification directly covering the fix, such as one test case or file, targeted typecheck, lint, or build verification; broader verification is deferred to `TT` and `ET`.
- During review-contract iteration, run Tier 0 and the three compact Tier 2 dogfood scenarios after the contract stabilizes.
- Loops stop and report a blocker when failures are unrelated, pre-existing, flaky, ambiguous, or outside the current command's responsibility.
- `GC` does not run `CR`; it commits only when verification status and intended file scope are clear.
- `!!` is an out-of-band restart command and is not auto-chained from other stages. It reconciles the current story, invalidates stale completion and AR evidence, then continues through DD and stops before GC.
- Commands trigger when a keyword appears anywhere in the message with command-like intent.
- Keywords must be surrounded by message boundaries, punctuation, or whitespace.
- Supported forms include `REQ`, `REQ:`, `REQ-`, `REQ,`, `REQ -`, and `'REQ'`.
- Supported middle/end forms include `please REQ: add login` and `ship it SS`.
- Keywords do not match when a letter, digit, or underscore touches them.
- `AR`, `CR`, `DD`, `ET`, `GC`, `SS`, and `TT` are also common technical initialisms. They match only when the token reads as an instruction, and are treated as mentions when prose uses them as nouns, as in `the GC pauses are long` or `that CR was rejected`.
- `!!` matches only when it introduces the correction text or stands alone as the request; trailing `!!` used for emphasis is not an invocation.
- Keywords inside fenced code blocks or inline code are ignored unless surrounding prose invokes them.
- Commands that modify source files add or update a short file comment block at the top of the file, following the skill convention.


## License

MIT
