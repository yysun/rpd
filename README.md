# RPD - Requirements, Planning, and Development Workflow

An AI agent skill that provides a structured workflow for software development, from requirements gathering through deployment. Works with Claude Code, Cursor, Copilot, Codex, Windsurf, Cline, Aider, and other AI coding tools.

## What It Does

RPD gives you 11 command keywords you can use in conversation to drive a systematic development process:

| Command | Purpose |
|---------|---------|
| `RPD` | Run the full end-to-end loop |
| `REQ` | Document requirements |
| `AP` | Create architecture plan |
| `AR` | Review architecture |
| `SS` | Step-by-step implementation |
| `DF` | Debug and fix |
| `CC` | Code consolidation |
| `DD` | Document completed work |
| `TT` | Run tests and fix |
| `CR` | Code review |
| `GC` | Git commit with review |

## Canonical Flow

`RPD` runs:

**REQ → AP → AR (loop) → SS → TT → CR (loop) → DD → GC**

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
```

Or run everything at once:

```
RPD - Implement JWT authentication end-to-end
```

Recommended workflow by task:

- Big feature: `REQ → AP → AR → SS → TT → DD → GC`
- Small feature/UI: `SS → TT → GC`
- Bug fix: `DF → TT → GC`
- Cleanup/refactor: `CC/AP → SS/TT → GC`

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
