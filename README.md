# RPD - Requirements, Planning, and Development Workflow

An AI agent skill that provides a structured workflow for software development, from requirements gathering through deployment. Works with Claude Code, Cursor, Copilot, Codex, Windsurf, Cline, Aider, and other AI coding tools.

## What It Does

RPD gives you 15 command keywords you can use in conversation to drive a systematic development process:

| Command | Purpose |
|---------|----------|
| `RPD` | Run the full end-to-end loop |
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

## Canonical Flow

`RPD` runs:

**REQ → AP → AR (loop) → AT → SS → TT → CR (loop) → ET (if any) → DD → GC**

What `loop` means:

- `AR (loop)`: repeat architecture review/update until no major flaws remain or the user approves.
- `CR (loop)`: repeat code review/fixes until no high-priority issues remain.
- `loop` has an exit condition; once met, continue to the next step.

Default trigger behavior:

- `REQ` → AR loop (auto)
- `AP` → AR loop (auto)
- `SS` → CR loop (auto)
- `GC` → CR (auto)
- `RPD` orchestrates the full flow.
- In `RPD`, use one AR pass that reviews REQ + AP together unless the user asks for separate reviews.
- `AT` generates the E2E test spec after architecture review, before implementation.
- `ET (if any)` runs E2E tests after code review when a test spec or test runner is available.
- `WT` creates a separate git worktree for the current story and moves the matching REQ/AP docs into that worktree instead of leaving copies behind.
  - Canonical command: `git worktree add ../{project folder}.worktrees/feature-{name} -b feature/{name} {base}`

## Installation

### Claude Code

Add to project or user settings (`.claude/settings.json` or `~/.claude/settings.json`):

```json
{
  "skills": ["/path/to/rpd"]
}
```

### Other Platforms

Copy the content of `SKILL.md` into your platform's instruction file:

| Platform | Instruction File |
|----------|-----------------|
| Cursor | `.cursor/rules/rpd.mdc` or `.cursorrules` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Windsurf | `.windsurfrules` |
| Cline | `.clinerules` |
| OpenAI Codex | `AGENTS.md` |
| Aider | `CONVENTIONS.md` |

You can also append it to a project-level `CLAUDE.md`, `AGENTS.md`, or any markdown file your agent reads.

## Usage

Include a command keyword in your message (no strict prefix or wrapper format required):

```
REQ - Add user authentication with JWT tokens
AP - Plan the implementation
SS - Implement the plan
TT - Run tests
GC - Commit changes
WT - Create a worktree for this story and move the req/plan docs there
```

Or run everything at once:

```
RPD - Implement JWT authentication end-to-end
```

Recommended workflow by task:

- Big feature: `REQ → AP → AR → AT → SS → TT → ET → DD → GC`
- Small feature/UI: `SS → TT → GC`
- Bug fix: `DF → TT → GC`
- Cleanup/refactor: `CC/AP → SS/TT → GC`
- Split implementation into another checkout: `REQ → AP → WT → SS → TT → GC`
- Sync docs after scope change: `!!` (updates req, plan, and E2E test spec with new requirements, clarifications, and changes)

Natural-language examples (also valid):

```
Can you run req for a JWT auth feature?
Please do AP for this payment retry system.
Let's do TT on the current branch.
```

Multi-line example (also valid):

```text
REQ do following:
- x
- y
- z
```

## Prerequisites

- **Git** (for CR and GC commands)
- **Test runner** (for TT - auto-detected from project config)

## Core Rules

- Requirements focus on WHAT (REQ/AR), not HOW.
- AR auto-fixes high priority issues before reporting.
- CR auto-fixes high priority issues before reporting.
- Run checks relevant to changed artifacts (tests/build/lint/docs preview as applicable).
- Ignore command keywords inside fenced code blocks and inline code unless explicitly requested.
- After REQ/AP/AR, ask for explicit approval before SS/DF/CC/TT/GC.
- Ask targeted clarification when blocked by ambiguity.

## File Structure

```
rpd/
├── README.md              ← Installation & usage guide
├── SKILL.md               ← Skill definition (all commands)
└── QUICK_REFERENCE.md     ← Cheat sheet
```

## Documentation

- **[SKILL.md](SKILL.md)** - Full skill documentation with all commands and workflows
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference cheat sheet

## License

MIT
