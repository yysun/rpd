# RPD - Requirements, Planning, and Development Workflow

An AI agent skill that provides a structured workflow for requirements, planning, implementation, testing, review, documentation, and commit. Works with Claude Code, Cursor, Copilot, Codex, Windsurf, Cline, Aider, and other AI coding tools.

![Infographic illustrating the RPD loop.](rpd-loop.png)

RPD gives you 15 command keywords you can use in conversation to drive a systematic development process.

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

```bash
npx skills add yysun/rpd
```

## Workflow

Start with `RPD` unless you intentionally want to enter at a specific stage:

```
REQ - Implement JWT authentication end-to-end
```

Then, use the individual commands for focused actions:

**(REQ) → AP → AR → SS → CR → DD → GC**

Artifacts created by the workflow:

```
.docs/
├── reqs/{yyyy}/{mm}/{dd}/req-{name}.md
├── plans/{yyyy}/{mm}/{dd}/plan-{name}.md
└── done/{yyyy}/{mm}/{dd}/{name}.md
```
`{name}` is short kebab-case (for example: `user-auth`, `offline-sync`).


## Commands Reference

| Command | Purpose |
|---------|----------|
| `REQ` | Document requirements |
| `AP` | Create architecture plan |
| `AR` | Review architecture |
| `AT` | Generate/update E2E test spec doc |
| `SS` | Step-by-step implementation |
| `DF` | Debug and fix |
| `CC` | Code consolidation |
| `TT` | Run tests and fix |
| `ET` | Run E2E tests |
| `CR` | Code review |
| `DD` | Document completed work |
| `GC` | Git commit with review |
| `WT` | Create a new git worktree under `../{project folder}.worktrees/` and move the REQ/AP docs into it |
| `!!` | Update all relevant docs with new requirements, clarifications, and changes |
| `RPD` | Full end-to-end flow (Experimental) |


## License

MIT
