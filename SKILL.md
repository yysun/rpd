---
name: rpd
description: >
  Trigger when the message contains any RPD command keyword (case-insensitive), used as a command, label, or shorthand: 
  RPD, REQ, AP, AR, AT, SS, CC, DF, DD, ET, TT, CR, GC, WT, !!. 
  Each keyword activates its corresponding workflow rules/stage behavior below.
  Ignore keywords appearing only inside fenced code blocks or inline code spans unless the surrounding prose invokes them.
---

# RPD - Requirements, Planning, and Development Workflow

A concise software development workflow for with automatic gates for architecture review and code review.

## Core Principles

- **Truthful execution**: only claim tests/build/lint ran if they actually ran.
- **Think before coding**: understand the problem, plan the approach, and consider edge cases before writing code.
- **Simplicity first**: use the minimum code that solves the problem.
- **Surgical changes**: avoid refactors or additions unrelated to the task.
- **Goal-directed**: define success criteria for each task and verify the code meets them.
- **Ask when blocked**: if ambiguity or tradeoffs block progress, ask targeted clarification questions rather than guess.

## Conventions

- **`{name}`**: short kebab-case slug for the current story (e.g., `user-auth`, `offline-sync`), supplied by the user on first REQ/AP and reused across all related commands (REQ, AP, AT, SS, DD, ET, !!, WT). If not supplied, ask before creating docs. Choose names unique within the project to avoid conflicts between req/plan/test/done docs sharing the same `{name}`.
- **`{yyyy}/{mm}/{dd}`**: the date the doc was first created, not today's date. Subsequent updates edit the existing doc in place.
- **Current story**: the most recently created or modified REQ doc, unless the user specifies otherwise.
- **Auto-chaining**: code-modifying commands (SS, DF, CC) auto-run CR after changes. Doc-only commands (REQ, AP, AT, DD, !!) do not auto-chain. WT and !! are out-of-band and never auto-chained from other commands.
- **Large changes**: before implementing a large change, auto-run `REQ` then `AP` if either is missing for the current story.
- **Review loop**: AR and CR fix high-priority issues, rerun the review, and continue until no major flaws remain.
- **Test command detection**: detect from the project (`package.json` scripts, `Makefile`, `pyproject.toml`, etc.). If unclear, ask before running.

## File Comment Blocks

- Add a comment block at the top of each source file summarizing its features, implementation notes, and recent changes.
- Create the block before editing a file that lacks one; update the block after changes when one already exists.
- Applies to any command that modifies source files (SS, DF, CC, and ad-hoc edits). Does not apply to docs under `.docs/`.

## Command Keywords

- **REQ**: Create or update requirements in `.docs/reqs/{yyyy}/{mm}/{dd}/req-{name}.md`.
  - Focus on WHAT, not HOW, not optimization.
  - REQ is documentation-only: create/update the requirement doc and do not implement code.
  - Do not modify source code, tests, configs, or non-REQ docs when executing REQ.
- **AP**: Create architecture/implementation plan in `.docs/plans/{yyyy}/{mm}/{dd}/plan-{name}.md`.
  - Use markdown checkboxes for phased tasks.
  - Use Mermaid for complex structures or flows.
  - Automatically run `AR` after updating the plan.
- **AR**: Review architecture and assumptions.
  - Ensure no major flaws.
  - Provide options and tradeoffs.
  - Update existing REQ/AP/AT docs in place (no separate review doc).
  - Apply the review loop: fix high-priority issues, rerun review, continue until clean.
- **AT**: Generate (or update) an E2E test spec markdown file at `.docs/tests/test-{name}.md`.
  - Write clear, human-readable test scenarios covering happy paths and key edge cases.
  - AT is documentation-only: create/update the test spec doc and do not run or implement code.
  - Test specs are long-lived and not date-scoped (unlike REQ/AP/DD).
- **SS**: Implement step-by-step from the plan.
  - Update plan progress (`- [x]`) as tasks complete.
  - Wait for approval gate before starting: confirm the latest AR review passed cleanly, then ask the user to approve before implementing. Skip the prompt when invoked from within RPD.
  - Automatically run `CR` after implementation changes.
- **CC**: Consolidate code/comments and remove redundancy.
  - Default scope: uncommitted changes. Use the current story's files if no uncommitted changes exist.
  - Automatically run `CR` after changes.
- **DF**: Debug and fix root cause.
  - Explain the issue clearly.
  - Provide fix options when useful.
  - Automatically run `TT` to confirm the fix, then `CR`.
- **TT**: Run tests and fix failures.
  - Detect the test command from the project. If unclear, ask before running.
- **CR**: Review uncommitted changes with git.
  - Check architecture, quality, performance, maintainability, and security.
  - Apply the review loop: fix high-priority issues, rerun review, continue until clean.
  - Re-run `TT` after fixes to confirm tests still pass.
- **GC**: Commit changes with a clear conventional commit message.
  - If requested as a standalone command, run CR first — unless CR has already passed cleanly on the current uncommitted diff.
- **ET**: Run E2E tests.
  - If a path is provided after `ET`, run that single test file.
  - If no path is provided, run the canonical test for the current story (`.docs/tests/test-{name}.md`).
  - Detect the E2E test command from the project. If unclear, ask before running.
- **DD**: Document completed work in `.docs/done/{yyyy}/{mm}/{dd}/{name}.md`.
  - Run after work is committed or a feature is complete; do not fire mid-stream.
- **WT**: Create a new git worktree for the current story.
  - Move the matching REQ and AP docs into the new worktree.
  - Move files instead of copying them.
  - Canonical command: `git worktree add ../{project folder}.worktrees/feature-{name} -b feature/{name} {base}`.
  - Use this when planning is done in one checkout but implementation should continue in another.
- **!!**: Update all relevant docs with new requirements, clarifications, and changes from the latest user message or recent conversation.
  - Update `.docs/reqs/{yyyy}/{mm}/{dd}/req-{name}.md`, `.docs/plans/{yyyy}/{mm}/{dd}/plan-{name}.md`, and `.docs/tests/test-{name}.md` in place.
  - Operate on the most recent matching docs for the current story.
  - Do not implement code; documentation only.
- **RPD**: Run the full end-to-end workflow from a requirement input.
  - Accepts a requirement description as input (e.g., `RPD add OAuth login with Google and GitHub providers`).
  - If `{name}` is not provided, derive a kebab-case slug from the requirement and confirm with the user before proceeding.
  - Sequence: `REQ → AP → AR (loop) → AT → AR (loop) → SS → CC → TT → CR (loop) → ET (if test spec exists) → DD → GC`.
  - The second AR pass reviews the test spec alongside REQ/AP for consistency.
  - SS does not prompt for approval when running inside RPD; the RPD invocation is the approval.
  - May be entered mid-sequence by the user (e.g., "RPD from SS") to skip completed stages.


## Documentation Structure

```
.docs/
├── reqs/{yyyy}/{mm}/{dd}/req-{name}.md
├── plans/{yyyy}/{mm}/{dd}/plan-{name}.md
├── tests/test-{name}.md
└── done/{yyyy}/{mm}/{dd}/{name}.md
```

