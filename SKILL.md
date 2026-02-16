---
name: rpd
description: Use this skill when user intent invokes any RPD command keyword: RPD, REQ, AP, AR, SS, CC, DF, DD, TT, CR, or GC. Detection is case-insensitive and intent-first. Ignore keywords inside fenced code blocks and inline code unless the user explicitly asks to run them.
---

# RPD - Requirements, Planning, and Development Workflow

A concise command-driven workflow for software development.

## Command Detection

- Match keywords case-insensitively.
- Prioritize clear user intent over strict formatting.
- Multi-line prompts are valid.
- If multiple commands appear, execute the first clearly intended command.
- Ignore keywords in fenced code blocks and inline code unless explicitly requested.

## Command Keywords

- **RPD**: Run the full end-to-end workflow.
  - Sequence: `REQ → AP → AR (loop) → SS → TT → CR (loop) → DD → GC`.
  - Stop for approval after `REQ/AP/AR` before continuing to implementation/testing/commit steps.
- **REQ**: Create or update requirements in `.docs/reqs/{yyyy-mm-dd}/req-{name}.md`.
  - Focus on WHAT, not HOW, not optimization.
- **AP**: Create architecture/implementation plan in `.docs/plans/{yyyy-mm-dd}/plan-{name}.md`.
  - Use markdown checkboxes for phased tasks.
  - Use Mermaid for complex structures or flows.
- **AR**: Review architecture and assumptions.
  - Ensure no major flaws.
  - Provide options and tradeoffs.
  - Update existing REQ/AP docs in place (no separate review doc).
- **SS**: Implement step-by-step from the plan.
  - Update plan progress (`- [x]`) as tasks complete.
  - Wait for approval gate before starting.
- **CC**: Consolidate code/comments and remove redundancy.
- **DF**: Debug and fix root cause.
  - Explain the issue clearly.
  - Provide fix options when useful.
- **DD**: Document completed work in `.docs/done/{yyyy-mm-dd}/{name}.md`.
- **TT**: Run tests and fix failures.
  - Default command: `npm test`.
  - If project uses another test command, use that instead.
- **CR**: Review uncommitted changes with git.
  - Check architecture, quality, performance, maintainability, and security.
  - Automatically fix critical findings before reporting.
- **GC**: Commit changes with a clear conventional commit message.
  - If requested as a standalone command, run CR first.

## Automatic Triggers

Keep auto-triggers minimal to avoid accidental chaining:

- `RPD` orchestrates the full flow (`REQ → AP → AR (loop) → SS → TT → CR (loop) → DD → GC`).
- Standalone commands (`REQ`, `AP`, `AR`, `SS`, `CC`, `DF`, `DD`, `TT`, `CR`, `GC`) run only what was requested.
- Follow-up steps for standalone commands are recommendations, not implicit auto-runs, unless the user explicitly asks.

## Core Rules

- Requirements work (REQ/AR) must focus on WHAT, not HOW.
- For large changes or AP requests, create/update plan first and get approval before implementation.
- Be truthful about execution: only claim tests/build/lint ran if actually run.
- If blocked by ambiguity or tradeoffs, ask targeted clarification questions.

## Naming and Paths

- `{name}` must be short kebab-case (for example: `user-auth`, `offline-sync`).

## Documentation Structure

```
.docs/
├── reqs/{yyyy-mm-dd}/req-{name}.md
├── plans/{yyyy-mm-dd}/plan-{name}.md
└── done/{yyyy-mm-dd}/{name}.md
```
