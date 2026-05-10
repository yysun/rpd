# RPD - Requirements, Planning, and Development Workflow

An AI agent skill that provides a structured workflow for requirements, planning, architecture review, implementation, verification, review, documentation, E2E execution, and commit. Works with Claude Code, Cursor, Copilot, Codex, Windsurf, Cline, Aider, and other AI coding tools.

![Infographic illustrating the RPD loop.](rpd-loop.png)

RPD gives you 13 command keywords you can use in conversation to drive a systematic development process.

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

Start with `REQ` to describe a new requirement, then use the other commands as needed to create the plan, review architecture, implement step-by-step, run tests, review code, execute story E2E specs, document completion, and commit.

```
REQ Implement JWT authentication
```

Then follow up with `AP` to create the architecture plan, create needed E2E specs, and trigger architecture review, `SS` to implement step-by-step, `TT` to run unit tests and fix failures, `CR` to review code, `ET` to execute and fix the current story's E2E scenarios when applicable, `DD` to document completed work, and `GC` to commit with a clear message.

Typical sequence: `REQ → AP(+AR*) → SS(+CR*) → TT → ET? → DD → GC`

### 2. Full end-to-end workflow: `RPD`

Use `RPD` to run the full end-to-end workflow from a requirement input with automatic review loops for architecture review and code review. `RPD` is approval to run the sequence without human approval between stages, except for clarification, blockers, destructive actions, or external writes. Sequence: `REQ → AP(+AR*) → SS(+CR*) → TT → ET? → DD → GC`.

```
RPD Implement JWT authentication
```

`*` means the review stage loops until no major issues remain. `?` means the stage runs only when the current story has a matching E2E test spec. `AP` creates or updates the E2E spec when the story needs one.

Create E2E specs for user-facing flows, auth, routing, payments, data entry, cross-system integrations, and regression-prone critical paths. Skip them for pure internals unless requested.


## Artifact paths used by the RPD workflow

```
.docs/
├── reqs/{yyyy}/{mm}/{dd}/req-{name}.md
├── plans/{yyyy}/{mm}/{dd}/plan-{name}.md
├── tests/test-{name}.md  # optional existing E2E spec
└── done/{yyyy}/{mm}/{dd}/{name}.md
```
`{name}` is a short kebab-case story slug (for example: `user-auth`, `offline-sync`) reused across related docs and commands. If omitted, the skill derives one from the requirement or task description and states it in the response.

REQ, AP, and DD keep the date from when the doc was first created; later updates modify the existing doc in place. E2E test specs are created during AP when needed, then reused by ET.

## Commands Reference

| Command | Purpose |
|---------|----------|
| `REQ` | Document requirements |
| `AP` | Create architecture plan, create needed E2E specs, and trigger AR |
| `AR` | Review architecture |
| `SS` | Step-by-step implementation |
| `DF` | Diagnose and fix root cause, then run TT and CR* |
| `TT` | Run unit tests and fix failures |
| `ET` | Run E2E tests and fix failures |
| `CR` | Code review |
| `DD` | Document completed work |
| `GC` | Commit changes with clear scope |
| `WT` | Create a new git worktree under `../{project folder}.worktrees/` and move the REQ/AP docs and existing test spec into it |
| `!!` | Update all relevant docs with new requirements, clarifications, and changes |
| `RPD` | Full end-to-end flow with AR and CR review loops |

## Notes

- `REQ`, `AP`, `DD`, and `!!` are documentation-only commands.
- `SS` and `DF` are code-modifying commands. The user's `SS` command is approval to implement.
- `SS` verifies compile/build/typecheck, fixes failures, then auto-runs `CR*`; `DF` auto-runs `TT` and then `CR*`.
- Inside `RPD`, `SS` still auto-runs `CR*` before the workflow continues to `TT`.
- `RPD from SS` uses full-flow skip rules; standalone `SS` does not.
- `AR` and `CR` can also be manually triggered.
- `DD` can be invoked as a single-word message.
- `TT` and `ET` stop at the first failure when possible, fix root cause, rerun, and repeat until targeted tests pass.
- `CR` applies a review-fix-review loop until no major flaws remain; scoped verification may run after CR changes code, but CR does not become TT.
- Loops stop and report a blocker when failures are unrelated, pre-existing, flaky, ambiguous, or outside the current command's responsibility.
- `GC` does not run `CR`; it commits only when verification status and intended file scope are clear.
- `WT` and `!!` are out-of-band commands and are not auto-chained from other stages.
- Commands trigger when a keyword appears anywhere in the message with command-like intent.
- Keywords must be surrounded by message boundaries, punctuation, or whitespace.
- Supported forms include `REQ`, `REQ:`, `REQ-`, `REQ,`, `REQ -`, and `'REQ'`.
- Supported middle/end forms include `please REQ: add login` and `ship it SS`.
- Keywords do not match when a letter, digit, or underscore touches them.
- Keywords inside fenced code blocks or inline code are ignored unless surrounding prose invokes them.
- Commands that modify source files add or update a short file comment block at the top of the file, following the skill convention.


## License

MIT
