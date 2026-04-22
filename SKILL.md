---
name: rpd
description: >
  Use this skill when (1) the user’s intent is to architect, design, or develop software, and (2) the message contains any RPD command keyword anywhere (case-insensitive), such as RPD, REQ, AP, AR, AT, SS, CC, DF, DD, ET, TT, CR, GC, WT, !!. The detected keyword(s) trigger the corresponding workflow rules/stage behavior below. Ignore keywords that appear only inside fenced code blocks or inline code unless the user explicitly says they are invoking the keyword.
---

# RPD - Requirements, Planning, and Development Workflow

A concise software development workflow for with automatic gates for architecture review and code review.

## Command Detection

- Match keywords case-insensitively.
- Prioritize clear user intent over strict formatting.
- Multi-line prompts are valid.
- If multiple commands appear, execute the first clearly intended command.
- Ignore keywords in fenced code blocks and inline code unless explicitly requested.

## Command Keywords

- **REQ**: Create or update requirements in `.docs/reqs/{yyyy}/{mm}/{dd}/req-{name}.md`.
  - Focus on WHAT, not HOW, not optimization.
  - REQ is documentation-only: create/update the requirement doc and do not implement code.
  - Do not modify source code, tests, configs, or non-REQ docs when executing REQ.
- **AP**: Create architecture/implementation plan in `.docs/plans/{yyyy}/{mm}/{dd}/plan-{name}.md`.
  - Use markdown checkboxes for phased tasks.
  - Use Mermaid for complex structures or flows.
  - Automatically run `AR` after updating the plan.
  - If `AP` is requested standalone, stop for approval after `AR` completes and no major flaws remain.
- **AR**: Review architecture and assumptions.
  - Ensure no major flaws.
  - Provide options and tradeoffs.
  - Update existing REQ/AP docs in place (no separate review doc).
  - Automatically fix high priority issues before reporting.
  - Block progress until major flaws are resolved.
- **SS**: Implement step-by-step from the plan.
  - Update plan progress (`- [x]`) as tasks complete.
  - Wait for approval gate before starting.
  - Automatically run `CR` after implementation changes.
- **CC**: Consolidate code/comments and remove redundancy.
- **DF**: Debug and fix root cause.
  - Explain the issue clearly.
  - Provide fix options when useful.
- **DD**: Document completed work in `.docs/done/{yyyy}/{mm}/{dd}/{name}.md`.
- **TT**: Run tests and fix failures.
  - Default command: `npm test`.
  - If project uses another test command, use that instead.
- **CR**: Review uncommitted changes with git.
  - Check architecture, quality, performance, maintainability, and security.
  - Automatically fix high priority issues before reporting.
- **GC**: Commit changes with a clear conventional commit message.
  - If requested as a standalone command, run CR first.
- **AT**: Generate (or update) an E2E test spec markdown file at `.docs/tests/test-{name}.md`.
  - Write clear, human-readable test scenarios covering happy paths and key edge cases.
  - AT is documentation-only: create/update the test spec doc and do not run or implement code.
- **ET**: Run E2E tests.
  - If a path is provided after `ET`, run that single test file.
  - If no path is provided, run the canonical test for the current story (`.docs/tests/test-{name}.md`).
- **WT**: Create a new git worktree for the current story.
  - Move the matching REQ and AP docs into the new worktree.
  - Move files instead of copying them.
  - Canonical command: `git worktree add ../{project folder}.worktrees/feature-{name} -b feature/{name} {base}`.
  - Use this when planning is done in one checkout but implementation should continue in another.
- **!!**: Update all relevant docs with new requirements, clarifications, and changes.
  - Update `.docs/reqs/{yyyy}/{mm}/{dd}/req-{name}.md`, `.docs/plans/{yyyy}/{mm}/{dd}/plan-{name}.md`, and `.docs/tests/test-{name}.md` in place.
  - Do not implement code; documentation only.
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

## File Comment Blocks
- Add/update comment blocks at the top of each source file summarizing features, implementation, and changes.
- Create before editing, if missing update after changes.