---
name: rpd
description: >
  Run or explain the RPD workflow for repository software work, including codebase
  explanation and diagnosis, requirements, architecture planning and review,
  implementation, debugging, unit and E2E testing, code review, acceptance
  verification, completion documentation, and scoped commits.
  Also use when the user invokes an RPD command with command-like intent: RPD, REQ,
  AP, AR, SS, TT, ET, CR, VR, DD, GC, or !!. A command token must be bounded by
  message boundaries, punctuation, or whitespace; do not match when a letter, digit,
  or underscore touches it. Recognize forms such as `RPD`, `RPD:`, `RPD-`, `RPD,`,
  and `'RPD'`, anywhere in the message. Several tokens are also common initialisms,
  so match only when the token reads as an instruction, not when prose uses it as a
  noun such as "the GC pauses" or "that CR was rejected". Trailing `!!` is emphasis,
  not an invocation. Tokens inside fenced or inline code are mentions unless the
  request asks to execute them.
---

# RPD - Requirements, Planning, and Development Workflow

**Version:** `3.3.0`
**Repository:** https://github.com/yysun/rpd

A concise software development workflow with automatic architecture and code review loops.

## Core Principles

- **Truthful execution**: only claim tests/build/lint ran if they actually ran.
- **Think before coding**: understand the problem, plan the approach, and consider edge cases before writing code.
- **Simplicity first**: use the minimum code that solves the problem.
- **Surgical changes**: avoid refactors or additions unrelated to the task.
- **Goal-directed**: define success criteria for each task and verify the code meets them.
- **Ask when blocked**: ask targeted questions.
- **Independent review**: use clean-context independent subagents for CR and VR, and for AR when architecture risk requires it; preserve the same review contract when delegation is unavailable.

## Intent Routing

- Interpret ordinary natural-language requests by their requested outcome. Requests limited to explanation, diagnosis, review, requirements, planning, or architecture review do not authorize implementation. Explicit CR and VR retain their documented behavior.
- Treat explicit REQ, AP, AR, and DD invocations as stage selectors. Perform only the documented stage, including any gate that stage owns; they do not implicitly authorize source changes.
- Treat explicit SS, TT, ET, CR, VR, and GC as stage selectors that may change source, tests, docs, or history within their documented scope, including the stages they auto-chain.
- Treat explicit `!!` as a current-story correction and full-flow restart. Reconcile the current story's REQ, AP, and E2E spec, then continue through the RPD sequence without asking for a second implementation approval.
- Treat a natural-language request that clearly asks to implement, fix, add, remove, or change repository behavior as implementation authorization. Do not require a special command token or ask for a second approval.
- Use direct implementation only when focused repository evidence shows that the work is localized, follows an existing pattern, changes no public API, schema, persistence, migration, authentication, security, privacy, external integration or dependency contract, infrastructure, deployment, concurrency, performance, availability, or reliability behavior, is readily reversible, and has clear expected behavior and verification.
- File count, estimated effort, and textual diff size are not routing criteria. A one-line security or public-contract change requires planned routing; a multi-file internal mechanical change may qualify for direct implementation.
- If any direct-path condition is false, uncertain, or unsupported, use planned routing: create or update REQ and AP, then run AR.
- **Planned-routing terminus**: when planning was auto-entered from a natural-language implementation request, continue `SS(+CR*) → TT → ET? → VR*` after AR passes, then stop. Run DD and GC only when the user asks for them. Explicit standalone REQ, AP, or AR still stops after its documented stage instead of continuing.
- **Direct-path terminus**: direct implementation ends after CR and creates no `.docs` artifacts. Run REQ first when the work needs a requirement doc, a plan, a completion doc, or a story that `!!` can later correct.
- For every direct implementation, make a surgical change, run relevant verification, report truthful evidence, and run CR under the existing independent-review rules.
- For direct or planned bug fixes, additionally reproduce or localize the failure when practical, identify the root cause, apply the smallest causal fix, add, update, or confirm existing regression coverage when a clear test location exists, run the relevant regression or unit verification before CR, and report the symptom, root cause, affected path, fix, and result.

## Conventions

- **`{name}`**: short kebab-case story slug.
- Derive `{name}` from the requirement when missing.
- Keep `{name}` short, descriptive, and unique.
- Announce derived `{name}` and continue without asking for confirmation unless multiple plausible slugs exist, the slug would collide with an unrelated existing story, or the requirement is too ambiguous to name safely.
- Ask for slug clarification only when ambiguity would create the wrong doc path or attach work to the wrong story.
- Reuse `{name}` across REQ, AP, SS, DD, ET, VR, !!, and RPD.
- **`{yyyy}/{mm}/{dd}`**: the doc creation date.
- Later updates edit the existing dated doc.
- **Current story**: the story the user names; otherwise the story already worked on in this session; otherwise the REQ doc with the most recent creation or substantive content change.
- Checkbox-only edits, such as `VR` acceptance updates or `!!` uncheck operations, do not make an older story current.
- Stop and ask when two stories remain equally plausible.
- **Sequence notation**: `*` marks a review or completion loop, and `?` marks a stage that runs only when the current story has a matching E2E spec. `CR*` means run CR and loop until no major flaws remain.
- **Command-like intent**: `AR`, `CR`, `DD`, `ET`, `GC`, `SS`, and `TT` are also common technical initialisms.
- Treat such a token as a command only when it reads as an instruction: alone, leading the request, or attached to its argument.
- Treat it as a mention when surrounding prose uses it as a noun, such as `the GC pauses are long` or `that CR was rejected`.
- Treat `!!` as a command only when it introduces the correction text or stands alone as the request. Trailing `!!` used for emphasis is not an invocation.
- **Auto-chaining**: direct implementation and SS run required verification, then auto-run CR.
- **Completion loop**: VR verifies the requirement against code behavior, tests, and docs. If incomplete, refine AP, run SS, CR, TT, ET when applicable, update docs, then rerun VR.
- REQ, AP, AR, and DD are documentation-only.
- The reconciliation step of `!!` is documentation-only; after reconciliation, `!!` restarts the current story through the normal RPD architecture, implementation, verification, completion, and commit stages.
- `!!` is an out-of-band restart trigger.
- Never auto-chain `!!` from another command.
- **Planned routing**: auto-run REQ then AP when any direct-path condition is false, uncertain, or unsupported.
- **Review loop**: AR fixes high-priority requirement, plan, and E2E spec issues before implementation; CR fixes high-priority code issues after implementation.
- Rerun review until no major flaws remain.
- **Architecture gate**: AP and RPD must not enter SS until AR has explicitly passed.
- **Loop blockers**: stop when scoped progress stalls.
- Report unrelated, pre-existing, flaky, or ambiguous failures.
- Ask before switching to another workflow.
- **Verification detection**: inspect project scripts, task runners, lockfiles, build/test configs, CI workflows, Makefiles, existing docs, and nearby package manifests before asking the user.
- Prefer the narrowest unambiguous verification command that matches the command stage and changed files.
- Ask before running verification only after local inspection cannot identify a command or finds multiple plausible commands with materially different scope or side effects.

## File Comment Blocks

- Add a top comment block to each edited source file.
- Summarize features, implementation notes, and recent changes.
- Create the block before editing when missing.
- Update the block after changing the file.
- Applies to any command that edits a source file, including direct implementation, `SS`, `TT`, `ET`, `CR`, `VR`, and `RPD` once it reaches its `SS` stage.
- Does not apply to docs under `.docs/`.

## Independent Review Delegation

- Before AR, CR, or VR, check whether the current runtime exposes subagent spawning, has capacity, and permits delegation. Do not infer support from the model name.
- Before deciding how to run AR, have the primary agent perform the AR checklist as a preflight and fix obvious requirement, plan, and E2E spec flaws.
- Treat AR as low-risk only when all of these are true: the plan follows an existing architecture pattern; stays within one component or subsystem; changes no public API, schema, persistence, migration, authentication, security, privacy, external integration or dependency contract, infrastructure, deployment, concurrency, performance, availability, or reliability behavior; is readily reversible; and has unambiguous acceptance criteria and implementation boundaries.
- Record the low-risk classification criterion by criterion with concrete repository evidence in the AR result. If any criterion lacks evidence or is uncertain or debatable, treat AR as non-low-risk.
- The primary agent may complete low-risk AR itself. Otherwise, require independent AR when delegation is available. Require independent CR and VR whenever delegation is available.
- For an independent review, use a subagent that did not author the artifacts under review. Start it with no inherited authoring conversation when the runtime supports that option; otherwise pass the smallest task-local context the runtime permits. Do not use full-history inheritance.
- If the runtime cannot start a reviewer with either no inherited authoring history or a minimal task-local context, treat independent delegation as unavailable and run the primary-agent fallback.
- Give the reviewer only the raw artifacts needed for its command: the applicable REQ, AP, E2E spec, stable diff or implementation paths, verification evidence, and command-specific checklist. Do not pass the author's conclusions, suspected flaws, intended fixes, or claims that the work should pass.
- Require the reviewer to reconstruct its judgment from those artifacts, work read-only, and return every material finding in priority order without a findings cap. For VR, require the acceptance-criteria evidence matrix in addition to the findings. Run the review only after the relevant artifacts form a stable snapshot.
- Use runtime-enforced read-only tools when supported. Otherwise record the reviewed snapshot and Git-visible worktree state, instruct the reviewer not to edit, and verify both are unchanged afterward. If they changed, invalidate the review and stop for safe primary-agent recovery before rerunning it.
- Keep AR, CR, and VR as serial gates. Do not let a reviewer inspect files while another agent is mutating them.
- The primary agent owns edits, fixes, tests, documentation updates, completion loops, and the final pass decision. Rerun the independent review after material changes, including fixes for blocking findings, but not solely for editorial corrections. If a blocking finding cannot be resolved, stop and report the blocker instead of reviewing the unchanged snapshot again. Prefer fresh reviewer context when capacity permits.
- If subagents are unavailable, run the same checklist in the primary agent and produce the same required output. Delegation changes review independence, not the pass criteria.

## Command Keywords

- **REQ**: Create or update requirements in `.docs/reqs/{yyyy}/{mm}/{dd}/req-{name}.md`.
  - Focus on WHAT, not HOW, not optimization.
  - Required sections:
    - `## Problem`: the user-visible or system-visible problem and why it matters.
    - `## Requirement`: the behavior, contract, or outcome that must become true.
    - `## Acceptance Criteria`: checkbox criteria that can be verified by code behavior, tests, docs, or observable output.
    - `## Constraints`: compatibility, data, UX, performance, security, migration, or operational constraints.
    - `## Non-Goals`: tempting but out-of-scope work, including unnecessary feature flags, fallback modes, and compatibility layers.
    - `## Open Questions`: only questions that block correct planning; omit the section when none exist.
  - Acceptance criteria must be specific enough for `VR` to judge complete or incomplete.
  - Write each criterion against the property it depends on, not a literal value a later release invalidates. `VR` may not relax a criterion to check it off, so a pinned literal can become permanently unsatisfiable while the work is complete.
  - Prefer `a major version bump accompanies the breaking change` over `the version is 3.0.0`, and apply the same rule to counts, dates, paths, and identifiers that routine work changes.
  - Do not include implementation steps, file-level plans, or speculative architecture.
  - Create or update only the requirement doc.
  - Do not implement code.
  - Do not modify tests, configs, or non-REQ docs.
  - Do not edit source code, dependencies, generated artifacts, or build files.
- **AP**: Create architecture/implementation plan in `.docs/plans/{yyyy}/{mm}/{dd}/plan-{name}.md`.
  - Plans must be detailed, phased, and ordered by dependency.
  - Do not create a shallow four-item checklist; expand the work into the real implementation sequence.
  - Required sections:
    - `## Goal`: one or two sentences tying the plan back to the REQ. State what must become true, not what the agent intends to try.
    - `## Current Context`: relevant files, entry points, constraints, existing behavior, and known unknowns discovered during AP inspection.
    - `## Decisions`: architecture choices, rejected alternatives, tradeoffs, compatibility decisions, and non-goals. Explicitly reject unnecessary feature flags, environment variables, fallback modes, and compatibility layers unless required by the REQ.
    - `## Phased Tasks`: markdown checkbox tasks grouped under numbered phase headings. These tasks are for the AI agent to execute, not for a human project tracker.
    - `## Validation`: build, typecheck, unit, integration, E2E, manual checks, and expected evidence. Include exact commands or observable outputs the agent must report.
    - `## Rollback / Risk`: risky areas, migration/data concerns, compatibility concerns, cleanup concerns, and rollback strategy when relevant.
  - Phased task template:
    - `### Phase 1 - Discovery and scope lock`
    - `- [ ] Inspect <specific files/modules> to confirm <specific assumption, dependency, boundary, or current behavior>.`
    - `- [ ] Identify <specific legacy path/fallback/flag/compatibility behavior> that must be preserved, changed, or removed according to the REQ.`
    - `- [ ] Record <specific non-goals/rejected alternatives> so the implementation does not introduce out-of-scope behavior.`
    - `### Phase 2 - Foundation changes`
    - `- [ ] Update <specific component/module/API/schema/type/config> so <required behavior or contract> is represented directly.`
    - `- [ ] Remove or simplify <specific obsolete path/option/env var/fallback> so the new behavior is not hidden behind unnecessary compatibility.`
    - `- [ ] Update <specific validation/error handling/loading path> so invalid or unsupported states fail clearly.`
    - `### Phase 3 - Feature implementation`
    - `- [ ] Implement <specific behavior> in <specific place>, preserving <specific constraint or invariant>.`
    - `- [ ] Wire <specific integration point/call path/artifact generation step> so <expected end-to-end behavior>.`
    - `- [ ] Confirm <specific rejected alternative or non-goal> was not introduced during implementation.`
    - `### Phase 4 - Tests and verification wiring`
    - `- [ ] Add or update <specific tests/specs/evals> for <acceptance point, edge case, or failure mode>.`
    - `- [ ] Run <specific command> and record <expected evidence/output>.`
    - `- [ ] Verify <specific cleanup/removal/absence condition> so stale behavior cannot silently remain.`
    - `### Phase 5 - Documentation and status`
    - `- [ ] Update <specific docs/examples/status artifacts> with <exact new behavior, command, or contract>.`
    - `- [ ] Record final evidence showing <REQ requirement> is satisfied.`
    - `- [ ] Mark completed tasks complete only after the corresponding change or evidence exists.`
  - Add, remove, rename, or split phases to match the story; keep the sequence logical from investigation through validation.
  - `## Phased Tasks` rules:
    - Every task must start with `- [ ]`.
    - Every task must name a specific file, module, API, schema, command, test, artifact, or behavior.
    - Every task must describe an observable state change or verification action.
    - Do not use vague tasks such as `- [ ] Improve implementation`, `- [ ] Update tests`, or `- [ ] Clean up code`.
    - Do not mark a task complete unless the agent has performed the work and, where applicable, recorded evidence.
    - Prefer tasks that produce a durable repository change or a concrete verification result.
    - Keep phases in logical execution order: discover, decide, change foundation, implement, verify, document.
  - Every phase must have enough tasks that `SS` can execute without rediscovering the whole design.
  - Call out dependencies between phases when order is not obvious.
  - Do not use prose-only task lists.
  - Mermaid is optional and usually unnecessary; use it only when a diagram makes dependencies, data flow, state transitions, or system boundaries clearer than concise text.
  - Do not add Mermaid for simple task sequences, prose decoration, or plans that are already clear as phased checkboxes.
  - Decide whether the story needs E2E coverage.
  - Create E2E specs for user-facing flows.
  - Create E2E specs for auth, routing, payments, or data entry.
  - Create E2E specs for cross-system integrations.
  - Create E2E specs for regression-prone critical paths.
  - Skip E2E specs for pure internals unless requested.
  - If needed, create or update `.docs/tests/test-{name}.md`.
  - Write E2E specs as human-readable scenarios.
  - Do not run tests during AP.
  - Automatically run `AR` after updating the plan. The AR gate belongs to AP's documented stage, and both stay documentation-only.
  - Do not enter `SS` until `AR` has explicitly passed.
  - Do not implement code or edit source files during AP or its AR review.
- **AR**: Review architecture and assumptions.
  - Can be manually triggered.
  - Run the primary-agent preflight, classify the plan using the low-risk criteria, and follow the Independent Review Delegation rules. Use a read-only independent subagent unless every low-risk condition is satisfied or delegation is unavailable.
  - Review for blocking flaws before implementation, not style preferences.
  - Check that the REQ is testable, the AP covers every acceptance criterion, phases are dependency-ordered, validation evidence is explicit, E2E coverage is correctly included or excluded, and risks/non-goals are handled.
  - Challenge unnecessary feature flags, environment variables, fallback modes, compatibility layers, broad refactors, and vague validation.
  - Provide options and tradeoffs only when a real architecture choice remains.
  - Review REQ, AP, and any E2E spec together.
  - Fix blocking requirement, plan, or E2E spec flaws by updating existing docs in place.
  - Do not pass AR with unresolved blocking questions, missing validation, or a plan that `SS` cannot execute directly.
  - Do not create a separate review doc.
  - Report exactly one of `AR passed: no blocking architecture flaws`, `AR fixed: <summary>; rerun result passed`, or `AR blocked: <flaw and why it cannot be resolved in place>`.
  - `AR blocked` is not a pass. Stop the flow, apply the loop blocker rules, and report the blocker instead of entering `SS`.
  - Apply the review loop.
  - Do not implement code or edit source files during standalone AR.
- **SS**: Implement step-by-step from an approved plan.
  - Read the current REQ, AP, and optional E2E spec before editing code.
  - Require the current AP to have passed AR after its latest material update.
  - If the current story has no AP, or its AP has not passed AR since its latest material update, do not improvise an implementation. Switch to planned routing, create or update REQ and AP, run AR, then implement.
  - Execute AP tasks in order unless a discovered constraint makes the order wrong.
  - If implementation requires a material plan change, update the AP task list before or alongside the code change and keep the scope tied to the REQ.
  - Update plan progress (`- [x]`) as tasks complete.
  - Mark a task complete only after the code/docs/test change or verification evidence exists.
  - Do not silently add unplanned features, compatibility layers, fallback modes, environment variables, or broad refactors.
  - Treat `SS` as approval to implement.
  - Do not ask for a second approval.
  - Run relevant compile/build/typecheck after changes.
  - Report the exact verification command and result.
  - Fix relevant verification failures before review.
  - For a bug fix, reproduce or localize the failure when practical, identify the root cause, apply the smallest causal fix, add, update, or confirm existing regression coverage when a clear test location exists, run the relevant regression or unit verification before CR, and report the symptom, root cause, affected path, fix, and result.
  - Auto-run `CR*` after verification passes.
- **TT**: Run unit tests and fix failures.
  - Detect the unit test command using the Verification detection rules.
  - Ask only after local inspection cannot identify one unambiguous command.
  - Stop at the first failure when the runner supports it.
  - Record the exact failing test, error, suspected cause, fix, and rerun result.
  - Fix the root cause of that failure.
  - Do not skip, delete, weaken, or rename tests to force a pass unless the REQ explicitly changes the expected behavior.
  - Rerun unit tests after each fix.
  - Repeat until all unit tests pass.
- **CR**: Review uncommitted changes with git.
  - Can be manually triggered.
  - Use the Independent Review Delegation rules; when available, have a read-only independent subagent review the stable diff and return prioritized findings to the primary agent.
  - Review the diff against the REQ, AP, and E2E spec, not just local code style.
  - Check scope control, architecture, correctness, edge cases, performance, maintainability, security, migrations, compatibility, test coverage, and stale docs.
  - Prioritize findings by impact; ignore cosmetic churn unless it hides a real defect.
  - Fix high-priority findings.
  - Rerun CR after fixes.
  - Continue until no major flaws remain.
  - After CR changes code, run scoped verification when clear.
  - Report unrelated or pre-existing failures.
  - Do not convert CR into TT.
- **VR**: Verify the requirement is fully implemented in both code and docs.
  - Use the Independent Review Delegation rules; when available, have a read-only independent subagent build the acceptance-criteria evidence matrix. The primary agent owns all follow-up edits and the completion loop.
  - Compare the current REQ doc, AP doc, optional E2E spec, implementation code, user-facing behavior, and latest verification results.
  - Decide whether each requirement acceptance point is implemented in code, covered by appropriate tests or E2E checks, reflected in the relevant RPD docs, and free of known blocking review issues.
  - Produce an acceptance-criteria matrix with `complete`, `incomplete`, or `blocked` status and concrete evidence for each item.
  - Update the REQ acceptance-criteria checkboxes during VR. Change `- [ ]` to `- [x]` only when concrete evidence proves that criterion complete; leave incomplete or blocked criteria unchecked.
  - Change `- [x]` back to `- [ ]` whenever current implementation, test, documentation, or review evidence no longer supports the criterion. Never preserve a stale checkmark.
  - Treat the checkbox as recorded status, not proof. Keep the evidence in the VR matrix and do not weaken or rewrite a criterion merely to check it off.
  - Do not pass VR until every acceptance criterion in the REQ is checked and supported by evidence appropriate to that criterion.
  - Treat stale, contradictory, or incomplete REQ/AP/test/done docs as incomplete work, not as a documentation-only cleanup.
  - Do not treat passing tests as proof of completion when requirements are visibly unmet.
  - Do not pass VR when planned cleanup/removal work, E2E coverage, docs, or review fixes are missing.
  - If complete, report the evidence and either stop for standalone `VR` or continue the parent `RPD` sequence.
  - If incomplete, update the existing AP doc with the missing code, test, and documentation work.
  - If missing work changes E2E coverage, update or create `.docs/tests/test-{name}.md`.
  - If requirement text is stale or contradictory, update the existing REQ doc before continuing.
  - Run `SS` to implement the refined plan.
  - Run `CR*` after implementation.
  - Run `TT`.
  - Run `ET` when a matching E2E spec exists or when the refined plan adds one.
  - Update plan progress and any affected RPD docs after code/test changes.
  - After completion-loop fixes, update the REQ checkboxes from the new evidence before rerunning the final VR decision.
  - Rerun `VR` after TT and ET complete.
  - Repeat until the requirement is complete or a loop blocker is reached.
  - Apply loop blocker rules when progress stalls, failures are unrelated, or the requirement is ambiguous.
- **GC**: Commit changes with a clear conventional commit message.
  - Do not run CR automatically.
  - Use the latest relevant verification for intended changes.
  - If verification is unknown, ask or run scoped verification.
  - If verification is stale, ask or run scoped verification.
  - Report verification status before committing.
  - If CR changes code, rerun relevant verification.
  - If failures are unrelated or pre-existing, report them.
  - Ask before committing with unrelated or pre-existing failures.
  - Inspect git status before staging.
  - Stop when unrelated or ambiguous changes are present.
  - Stage only files that belong to the current story; never sweep in unrelated work because it is convenient.
  - Commit message must reflect the user-visible or system-visible change, not the workflow stage.
  - Report the final commit hash.
- **ET**: Run E2E tests.
  - If a path is provided after `ET`, run that single test file.
  - Otherwise use `.docs/tests/test-{name}.md`.
  - Ask for a path when no matching spec exists.
  - Do not generate a new spec during ET.
  - For markdown specs, execute the scenarios with available tools.
  - For executable specs, detect the E2E test command using the Verification detection rules.
  - Ask only after local inspection cannot identify one unambiguous command.
  - Stop at the first E2E failure when possible.
  - Record the scenario, step, observed result, expected result, fix, and rerun evidence.
  - Fix the root cause of that failure.
  - Do not rewrite the E2E spec during ET except to correct stale wording after behavior is verified.
  - Rerun E2E tests after each fix.
  - Repeat until all targeted E2E tests pass.
- **DD**: Document completed work in `.docs/done/{yyyy}/{mm}/{dd}/{name}.md`.
  - Can be invoked as a single-word `DD` message.
  - Run once the story's implementation, verification, and reviews are complete, whether or not it is committed; do not fire mid-stream.
  - Inside `RPD` and `!!`, DD runs before `GC` so the commit can reference the completion summary.
  - Write a short PR-style completion summary.
  - Keep it concise: roughly 5-12 bullets total.
  - Required sections:
    - `## Summary`: what changed and why it matters.
    - `## Verification`: commands, tests, E2E checks, and reviews actually run.
    - `## Notes`: follow-ups, risks, non-goals, skipped checks, or unrelated failures when real.
  - Do not duplicate the full REQ, AP, test spec, or changelog.
  - Do not claim verification that did not run.
  - Mention unresolved risks, skipped checks, or unrelated failures only when they are real and specific.
  - Do not implement code or edit source files during DD.
- **!!**: Reconcile the current story from the latest user message and restart the RPD flow.
  - Treat `!!` as approval to reconcile the current story and continue the full workflow without approval between stages.
  - Resolve the current story using the Current story rules in Conventions.
  - Stop for clarification when no current story exists or the target story is ambiguous; do not create an unrelated story from the correction alone.
  - Treat the latest user message as a requirement change, clarification, or scope correction.
  - Reconcile contradictions across REQ, AP, and test specs instead of appending stale text.
  - Update current REQ docs in place.
  - Update the matching AP docs in place, or create the matching AP when the current story does not have one.
  - Apply the AP E2E criteria to new requirement changes.
  - Create `.docs/tests/test-{name}.md` if E2E coverage is now needed.
  - Update the current test spec when present.
  - Record new non-goals, removed scope, changed validation, and affected phases when the clarification changes implementation direction.
  - Uncheck acceptance criteria and reopen plan tasks when the correction invalidates their existing completion evidence.
  - Treat the reconciled REQ, AP, and optional test spec as materially updated; any earlier AR pass is stale.
  - After reconciliation, run `AR* → SS(+CR*) → TT → ET? → VR* → DD → GC`.
  - Do not edit source files during reconciliation or before AR explicitly passes.
  - Apply the same pause conditions, review loops, completion loop, E2E decision, and truthful verification rules as `RPD`.
- **RPD**: Run the full end-to-end workflow from a requirement input.
  - Accept a requirement description as input.
  - Example: `RPD add OAuth login`.
  - Treat `RPD` as approval to run the full sequence without human approval between stages.
  - Pause only for clarification, blockers, destructive actions, or external writes.
  - Derive `{name}` when missing.
  - Announce derived `{name}` and continue unless slug ambiguity would attach work to the wrong story.
  - Sequence: `REQ → AP → AR* → SS(+CR*) → TT → ET? → VR* → DD → GC`.
  - Read `*` and `?` under Sequence notation in Conventions. For `VR*`, `*` is the completion loop.
  - AP creates E2E specs when needed.
  - AR reviews REQ, AP, and any E2E spec before implementation.
  - RPD must not enter `SS` until AR has fixed blocking doc/spec flaws and explicitly passed.
  - Inside RPD, SS still runs compile/build/typecheck.
  - Inside RPD, SS still fixes verification failures.
  - Inside RPD, SS still auto-runs CR*.
  - RPD continues to TT after SS completes.
  - RPD runs VR before DD so completion is checked against the original requirement, not only tests.
  - May be entered mid-sequence.
  - Example: `RPD from SS`.
  - Mid-sequence entry uses RPD skip rules, not standalone command rules.
  - Skip a stage only when its artifact is fresh, matches the current `{name}` and requirement, and is not contradicted by newer user messages, code changes, or docs.
  - Do not skip `REQ` when acceptance criteria are missing, stale, ambiguous, or tied to a different story.
  - Do not skip `AP` when the plan lacks current phased tasks, validation evidence, E2E coverage decision, or risk/non-goal handling.
  - Skip a gated stage only when its gate passed after the latest matching artifact update.
  - If freshness or matching is uncertain, update or rerun the stage instead of skipping it.


## Documentation Structure

```
.docs/
├── reqs/{yyyy}/{mm}/{dd}/req-{name}.md
├── plans/{yyyy}/{mm}/{dd}/plan-{name}.md
├── tests/test-{name}.md  # optional existing E2E spec
└── done/{yyyy}/{mm}/{dd}/{name}.md
```
