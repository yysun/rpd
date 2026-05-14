---
name: rpd
version: 2.1.2
description: >
  Use this skill for software development tasks that should follow the RPD workflow:
  requirements, architecture planning, implementation, debugging, tests, E2E checks,
  code review, commits, done docs, or worktrees. Trigger on natural-language requests
  for those workflow stages, or when any of these keywords appears with command-like
  intent: RPD, REQ, AP, AR, SS, DF, DD, ET, TT, CR, VR, GC, WT, !!. The keyword must be
  surrounded by message boundaries, punctuation, or whitespace.
  Match examples like `REQ`, `REQ:`, `REQ-`, `REQ,`, `REQ -`, and `'REQ'`.
  Match middle or end forms like `please REQ: add login` or `ship it SS`.
  Do not match when a letter, digit, or underscore touches the keyword.
  Ignore keywords inside fenced code blocks or inline code spans.
---

# RPD - Requirements, Planning, and Development Workflow

A concise software development workflow with automatic architecture and code review loops.

## Core Principles

- **Truthful execution**: only claim tests/build/lint ran if they actually ran.
- **Think before coding**: understand the problem, plan the approach, and consider edge cases before writing code.
- **Simplicity first**: use the minimum code that solves the problem.
- **Surgical changes**: avoid refactors or additions unrelated to the task.
- **Goal-directed**: define success criteria for each task and verify the code meets them.
- **Ask when blocked**: ask targeted questions.

## Command Gate

RPD command keywords are authoritative execution gates.

- Finding or loading this skill is not approval to code.
- When the user invokes `REQ`, `AP`, `AR`, `DD`, `WT`, or `!!`, do only that command's allowed work.
- Documentation-only commands must not edit source code, tests, configs, dependencies, generated artifacts, or build files.
- Implement code only when the active command is `SS`, `DF`, `VR`, or `RPD` has reached its `SS` stage.
- For natural-language development requests without an explicit implementation command, create or update `REQ` and `AP` first, then stop unless the user has invoked `SS`, `DF`, `VR`, or `RPD`.
- If a command gate conflicts with the default agent behavior to keep working autonomously, the command gate wins.

## Conventions

- **`{name}`**: short kebab-case story slug.
- Derive `{name}` from the requirement when missing.
- Keep `{name}` short, descriptive, and unique.
- State `{name}` so the user can correct it.
- Reuse `{name}` across REQ, AP, SS, DD, ET, VR, !!, WT, and RPD.
- **`{yyyy}/{mm}/{dd}`**: the doc creation date.
- Later updates edit the existing dated doc.
- **Current story**: the most recently created or modified REQ doc, unless the user specifies otherwise.
- **Auto-chaining**: SS and DF run required verification, then auto-run CR.
- **Completion loop**: VR verifies the requirement against code behavior, tests, and docs. If incomplete, refine AP, run SS, CR, TT, ET when applicable, update docs, then rerun VR.
- REQ, AP, DD, and !! are documentation-only.
- WT and !! are out-of-band.
- Never auto-chain WT or !! from another command.
- **Large changes**: auto-run REQ then AP when either is missing.
- **Review loop**: AR and CR fix high-priority issues.
- Rerun review until no major flaws remain.
- **Loop blockers**: stop when scoped progress stalls.
- Report unrelated, pre-existing, flaky, or ambiguous failures.
- Ask before switching to another workflow.
- **Verification detection**: detect compile/build/typecheck/test commands from the project.
- Ask before running verification when unclear.

## File Comment Blocks

- Add a top comment block to each edited source file.
- Summarize features, implementation notes, and recent changes.
- Create the block before editing when missing.
- Update the block after changing the file.
- Applies to `SS`, `DF`, `VR`, and `RPD` once it reaches its `SS` stage.
- Does not apply to docs under `.docs/`.

## Command Keywords

- **REQ**: Create or update requirements in `.docs/reqs/{yyyy}/{mm}/{dd}/req-{name}.md`.
  - Focus on WHAT, not HOW, not optimization.
  - Create or update only the requirement doc.
  - Do not implement code.
  - Do not modify tests, configs, or non-REQ docs.
- **AP**: Create architecture/implementation plan in `.docs/plans/{yyyy}/{mm}/{dd}/plan-{name}.md`.
  - Plans must use markdown checkboxes for phased tasks.
  - Required task format:
    - [ ] Inspect relevant files
    - [ ] Make focused changes
    - [ ] Run validation
    - [ ] Update docs/status
  - Do not use prose-only task lists.
  - Use Mermaid for complex structures or flows.
  - Decide whether the story needs E2E coverage.
  - Create E2E specs for user-facing flows.
  - Create E2E specs for auth, routing, payments, or data entry.
  - Create E2E specs for cross-system integrations.
  - Create E2E specs for regression-prone critical paths.
  - Skip E2E specs for pure internals unless requested.
  - If needed, create or update `.docs/tests/test-{name}.md`.
  - Write E2E specs as human-readable scenarios.
  - Do not run tests during AP.
  - Automatically run `AR` after updating the plan.
- **AR**: Review architecture and assumptions.
  - Can be manually triggered.
  - Ensure no major flaws.
  - Provide options and tradeoffs.
  - Review REQ, AP, and any E2E spec together.
  - Update existing docs in place.
  - Do not create a separate review doc.
  - Apply the review loop.
- **SS**: Implement step-by-step from the plan.
  - Update plan progress (`- [x]`) as tasks complete.
  - Treat `SS` as approval to implement.
  - Do not ask for a second approval.
  - Run relevant compile/build/typecheck after changes.
  - Fix compile/build/typecheck failures before review.
  - Auto-run `CR*` after verification passes.
- **DF**: Diagnose and fix root cause.
  - Think harder to find the root cause.
  - Explain the issue clearly.
  - Provide fix options when useful.
  - Automatically run `TT` to confirm the fix, then `CR*`.
- **TT**: Run unit tests and fix failures.
  - Detect the unit test command from the project.
  - Ask before running tests when unclear.
  - Stop at the first failure when the runner supports it.
  - Fix the root cause of that failure.
  - Rerun unit tests after each fix.
  - Repeat until all unit tests pass.
- **CR**: Review uncommitted changes with git.
  - Can be manually triggered.
  - Check architecture, quality, performance, maintainability, and security.
  - Fix high-priority findings.
  - Rerun CR after fixes.
  - Continue until no major flaws remain.
  - After CR changes code, run scoped verification when clear.
  - Report unrelated or pre-existing failures.
  - Do not convert CR into TT.
- **VR**: Verify the requirement is fully implemented in both code and docs.
  - Compare the current REQ doc, AP doc, optional E2E spec, implementation code, user-facing behavior, and latest verification results.
  - Decide whether each requirement acceptance point is implemented in code, covered by appropriate tests or E2E checks, reflected in the relevant RPD docs, and free of known blocking review issues.
  - Treat stale, contradictory, or incomplete REQ/AP/test/done docs as incomplete work, not as a documentation-only cleanup.
  - Do not treat passing tests as proof of completion when requirements are visibly unmet.
  - If complete, report the evidence and either stop for standalone `VR` or continue the parent `RPD` sequence.
  - If incomplete, update the existing AP doc with the missing code, test, and documentation work.
  - If missing work changes E2E coverage, update or create `.docs/tests/test-{name}.md`.
  - If requirement text is stale or contradictory, update the existing REQ doc before continuing.
  - Run `SS` to implement the refined plan.
  - Run `CR*` after implementation.
  - Run `TT`.
  - Run `ET` when a matching E2E spec exists or when the refined plan adds one.
  - Update plan progress and any affected RPD docs after code/test changes.
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
  - Stage only the intended files and report the final commit hash.
- **ET**: Run E2E tests.
  - If a path is provided after `ET`, run that single test file.
  - Otherwise use `.docs/tests/test-{name}.md`.
  - Ask for a path when no matching spec exists.
  - Do not generate a new spec during ET.
  - For markdown specs, execute the scenarios with available tools.
  - For executable specs, detect the E2E test command.
  - Ask before running E2E tests when unclear.
  - Stop at the first E2E failure when possible.
  - Fix the root cause of that failure.
  - Rerun E2E tests after each fix.
  - Repeat until all targeted E2E tests pass.
- **DD**: Document completed work in `.docs/done/{yyyy}/{mm}/{dd}/{name}.md`.
  - Can be invoked as a single-word `DD` message.
  - Run after work is committed or a feature is complete; do not fire mid-stream.
  - Write a short PR-style completion summary.
  - Keep it concise: roughly 5-12 bullets total.
  - Required sections:
    - `## Summary`: what changed and why it matters.
    - `## Verification`: commands, tests, E2E checks, and reviews actually run.
    - `## Notes`: follow-ups, risks, non-goals, skipped checks, or unrelated failures when real.
  - Do not duplicate the full REQ, AP, test spec, or changelog.
  - Do not claim verification that did not run.
- **WT**: Create a new git worktree for the current story.
  - Move matching REQ and AP docs into the new worktree.
  - Move the existing test spec when present.
  - Move files instead of copying them.
  - Canonical command: `git worktree add ../{project folder}.worktrees/feature-{name} -b feature/{name} {base}`.
  - Use this when planning is done in one checkout but implementation should continue in another.
- **!!**: Update relevant docs from the latest user message.
  - Update current REQ docs in place.
  - Update current AP docs in place.
  - Apply the AP E2E criteria to new requirement changes.
  - Create `.docs/tests/test-{name}.md` if E2E coverage is now needed.
  - Update the current test spec when present.
  - Do not implement code; documentation only.
- **RPD**: Run the full end-to-end workflow from a requirement input.
  - Accept a requirement description as input.
  - Example: `RPD add OAuth login`.
  - Treat `RPD` as approval to run the full sequence without human approval between stages.
  - Pause only for clarification, blockers, destructive actions, or external writes.
  - Derive `{name}` when missing.
  - Confirm `{name}` before proceeding.
  - Sequence: `REQ → AP(+AR*) → SS(+CR*) → TT → ET? → VR* → DD → GC`.
  - `*` means review loop.
  - For `VR*`, `*` means completion loop.
  - `?` means only if test spec exists.
  - AP creates E2E specs when needed.
  - AR reviews REQ, AP, and any E2E spec before implementation.
  - Inside RPD, SS still runs compile/build/typecheck.
  - Inside RPD, SS still fixes verification failures.
  - Inside RPD, SS still auto-runs CR*.
  - RPD continues to TT after SS completes.
  - RPD runs VR before DD so completion is checked against the original requirement, not only tests.
  - May be entered mid-sequence.
  - Example: `RPD from SS`.
  - Mid-sequence entry uses RPD skip rules, not standalone command rules.
  - Skip a stage only when its artifact exists.
  - Skip a gated stage only when its gate passed.


## Documentation Structure

```
.docs/
├── reqs/{yyyy}/{mm}/{dd}/req-{name}.md
├── plans/{yyyy}/{mm}/{dd}/plan-{name}.md
├── tests/test-{name}.md  # optional existing E2E spec
└── done/{yyyy}/{mm}/{dd}/{name}.md
```
