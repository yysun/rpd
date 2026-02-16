## Command Keywords

Use the following keywords:
- **RPD**: Run the full end-to-end workflow.
  - Sequence: `REQ → AP → AR (loop) → SS → TT → CR (loop) → DD → GC`.
  - Stop for approval after `REQ/AP/AR` before continuing to implementation/testing/commit steps.
- **REQ**: Create or update requirements to `.docs/reqs/{yyyy-mm-dd}/req-{name}.md` → focus on `what`, not `how`, not optimization.
- **AP**: Architecture Plan → Create an implementation plan using markdown check boxes → save to `.docs/plans/{yyyy-mm-dd}/plan-{name}.md`.
- **AR**: Architecture Review → think harder ensure no flaw → provide options and suggestions → update the requirement and plan docs only, do not create review doc.
- **SS**: Step-by-step implementation from plan → update plan doc with progress → wait for confirmation.
- **CC**: Consolidate code and comments block → remove redundant.
- **DF**: Debug and Fix → identify root cause → think harder to rovide a detailed explanation of the problem → suggest fix options.
- **DD**: Done and Document → create/update features implemented to `.docs/done/{yyyy-mm-dd}/{name}.md`.
- **TT**: Test and → Run 'npm test' and fix all failed tests.
- **CR**: Code Review → use git to get uncommitted change → perform a code review to ensure architecture best practices, efficiency, maintainability, and security → suggest improvements.
- **GC**: Commit changes with clear message → use git to commit all changes with a clear, concise message.

## Requirement and Planning Rules
- Requirement creation or analysis → focus on `what`, not `how`, not optimization.
- Large changes or "AP" → always create a plan first → get confirmation.
- Use mermaid diagrams for complex structures or flows.