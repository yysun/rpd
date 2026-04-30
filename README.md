# RPD - Requirements, Planning, and Development Workflow

An AI agent skill that provides a structured workflow for requirements, planning, architecture review, test-spec creation, implementation, verification, review, documentation, and commit. Works with Claude Code, Cursor, Copilot, Codex, Windsurf, Cline, Aider, and other AI coding tools.

![Infographic illustrating the RPD loop.](rpd-loop.png)

RPD gives you 14 command keywords you can use in conversation to drive a systematic development process.

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

### 1. Targeted command workflow

Start with `REQ` to describe a new requirement, then use the other commands as needed to create the plan, review architecture, generate or update the E2E test spec, implement step-by-step, run tests, review code, document completion, and commit.

```
REQ Implement JWT authentication
```

Then follow up with `AP` to create the architecture plan and trigger architecture review, `AT` to generate or update the E2E test spec, another `AR` pass when you want to review the full req/plan/test package together, `SS` to implement step-by-step, `TT` to run tests and fix failures, `CR` to review code, `ET` to execute the current story's E2E scenarios when applicable, `DD` to document completed work, and `GC` to commit with a clear message.

Typical sequence: `REQ → AP → AR → AT → AR → SS → TT → CR → ET? → DD → GC`

### 2. Full end-to-end workflow: `RPD`

Use `RPD` to run the full end-to-end workflow from a requirement input with automatic review loops for architecture review and code review. Sequence: `REQ → AP → AR* → AT → AR* → SS → TT → CR* → ET? → DD → GC`.

```
RPD Implement JWT authentication
```

`*` means the review stage loops until no major issues remain. `?` means the stage runs only when the current story has a matching E2E test spec. The first `AR` reviews REQ + AP; the second `AR` reviews REQ + AP + AT together.


## Artifacts created by the RPD workflow

```
.docs/
├── reqs/{yyyy}/{mm}/{dd}/req-{name}.md
├── plans/{yyyy}/{mm}/{dd}/plan-{name}.md
├── tests/test-{name}.md
└── done/{yyyy}/{mm}/{dd}/{name}.md
```
`{name}` is a short kebab-case story slug (for example: `user-auth`, `offline-sync`) reused across related docs and commands. If omitted, the skill derives one from the requirement or task description and states it in the response.

REQ, AP, and DD keep the date from when the doc was first created; later updates modify the existing doc in place. AT is long-lived and is not date-scoped.

## Commands Reference

| Command | Purpose |
|---------|----------|
| `REQ` | Document requirements |
| `AP` | Create architecture plan and trigger AR |
| `AR` | Review architecture |
| `AT` | Generate/update E2E test spec doc |
| `SS` | Step-by-step implementation |
| `DF` | Diagnose and fix root cause, then run TT and CR |
| `TT` | Run tests and fix |
| `ET` | Run E2E tests |
| `CR` | Code review |
| `DD` | Document completed work |
| `GC` | Run CR and commit with review |
| `WT` | Create a new git worktree under `../{project folder}.worktrees/` and move the REQ/AP/AT docs into it |
| `!!` | Update all relevant docs with new requirements, clarifications, and changes |
| `RPD` | Full end-to-end flow with two AR review passes |

## Notes

- `REQ`, `AP`, `AT`, `DD`, and `!!` are documentation-only commands.
- `SS` and `DF` are code-modifying commands. `SS` requires a clean architecture review and explicit approval unless it is being run inside `RPD`.
- `SS` auto-runs `CR` after implementation changes, while `DF` auto-runs `TT` and then `CR`.
- `CR` applies a review loop and re-runs tests after each fix pass.
- `WT` and `!!` are out-of-band commands and are not auto-chained from other stages.
- Messages can invoke commands case-insensitively; keywords inside fenced code blocks or inline code are ignored unless the surrounding prose explicitly invokes them.
- Commands that modify source files add or update a short file comment block at the top of the file, following the skill convention.


## License

MIT
