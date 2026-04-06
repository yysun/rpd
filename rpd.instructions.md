---
applyTo: '**'
---

## File Comment Blocks
- Add/update comment blocks at the top of each source file summarizing features, implementation, and changes.
- Create before editing, if missing update after changes.

## Command Keywords

Use the following keywords:
- **REQ**: Create or update requirements to `.docs/reqs/{yyyy}/{mm}/{dd}/req-{name}.md` → focus on `what`, not `how`, not optimization.
- **AP**: Architecture Plan → Create an implementation plan using markdown check boxes → save to `.docs/plans/{yyyy}/{mm}/{dd}/plan-{name}.md`.
- **AR**: Architecture Review → think harder ensure no flaw → provide options and suggestions → update the requirement and plan docs only, do not create review doc.
- **SS**: Step-by-step implementation from plan → update plan doc with progress → wait for confirmation.
- **CC**: Consolidate code and comments block → remove redundant.
- **DF**: Debug and Fix → identify root cause → think harder to rovide a detailed explanation of the problem → suggest fix options.
- **DD**: Done and Document → create/update features implemented to `.docs/done/{yyyy}/{mm}/{dd}/{name}.md`.
- **TT**: Test and → Run 'npm test' and fix all failed tests.
- **CR**: Code Review → use git to get uncommitted change → perform a code review to ensure architecture best practices, efficiency, maintainability, and security → suggest improvements.
- **GC**: Commit changes with clear message → use git to commit all changes with a clear, concise message.
- **AT**: Generate (or update) E2E test spec → save to `.docs/tests/test-{name}.md` → cover happy paths and key edge cases → documentation only, do not run or implement code.
- **ET**: Run E2E tests → if a path is provided after `ET`, run that file; otherwise run the story's canonical test (`.docs/tests/test-{name}.md`).
- **WT**: Worktree → create a new git worktree for the current story and move the matching requirement and plan docs into that worktree → move files, do not copy them.
	- Canonical command: `git worktree add ../{project folder}.worktrees/feature-{name} -b feature/{name} {base}`
- **!!**: Update all relevant docs with new requirements, clarifications, and changes → update `.docs/reqs/{yyyy}/{mm}/{dd}/req-{name}.md`, `.docs/plans/{yyyy}/{mm}/{dd}/plan-{name}.md`, and `.docs/tests/test-{name}.md` in place → documentation only, no code changes.
- **RPD**: Run the full end-to-end workflow. Sequence: `REQ → AP → AR (loop) → AT → SS → TT → CR (loop) → ET (if any) → DD → GC`.

## Core Rules

- For large changes, auto run `REQ` and `AP` before implementation.
- If blocked by ambiguity or tradeoffs, ask targeted clarification questions.
- Be truthful about execution: only claim tests/build/lint ran if actually run.


## Naming and Paths

- `{name}` must be short kebab-case (for example: `user-auth`, `offline-sync`).
- Choose names that are unique within the project to avoid conflicts between req, plan, test, and done docs that share the same `{name}`.

## Documentation Structure

```
.docs/
├── reqs/{yyyy}/{mm}/{dd}/req-{name}.md
├── plans/{yyyy}/{mm}/{dd}/plan-{name}.md
├── tests/test-{name}.md
└── done/{yyyy}/{mm}/{dd}/{name}.md
```