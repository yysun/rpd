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

### Install with npx skills

If your coding agent supports the open Agent Skills format, you can install RPD directly from GitHub:

```bash
# Install into the current project for detected agent(s)
npx skills add yysun/rpd

# Install for a specific agent
npx skills add yysun/rpd -a github-copilot -y
npx skills add yysun/rpd -a claude-code -y
npx skills add yysun/rpd -a cursor -y

# Install globally instead of in the current project
npx skills add yysun/rpd -g -a github-copilot -y
```

This repository exposes a root `SKILL.md`, so `npx skills` can discover and install it without any extra flags.

### Manual installation

If you do not want to use `npx skills`, create a folder named `rpd` in the agent's skills directory and place this repository, or at minimum `SKILL.md`, inside it.

| Agent | Project folder | Global folder |
|-------|----------------|---------------|
| Claude Code | `.claude/skills/rpd/` | `~/.claude/skills/rpd/` |
| GitHub Copilot | `.agents/skills/rpd/` | `~/.copilot/skills/rpd/` |
| Cursor | `.agents/skills/rpd/` | `~/.cursor/skills/rpd/` |
| Codex | `.agents/skills/rpd/` | `~/.codex/skills/rpd/` |
| Cline | `.agents/skills/rpd/` | `~/.agents/skills/rpd/` |
| Windsurf | `.windsurf/skills/rpd/` | `~/.codeium/windsurf/skills/rpd/` |
| OpenCode | `.agents/skills/rpd/` | `~/.config/opencode/skills/rpd/` |

For agents that do not support native skill folders, use their instruction file instead:

| Agent | Instruction file |
|-------|------------------|
| Aider | `CONVENTIONS.md` |

As a generic fallback, you can also append the contents of `SKILL.md` to a project-level `CLAUDE.md`, `AGENTS.md`, or another markdown instruction file your agent reads.

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
