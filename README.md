# RPD - Requirements, Planning, and Development Workflow

An AI agent skill that provides a structured workflow for software development, from requirements gathering through deployment. Works with Claude Code, Cursor, Copilot, Codex, Windsurf, Cline, Aider, and other AI coding tools.

## What It Does

RPD gives you 12 command keywords you can use in conversation to drive a systematic development process:

| Command | Purpose |
|---------|---------|
| `RDP` | Run the full end-to-end loop |
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

Just include a command keyword in your message:

```
REQ - Add user authentication with JWT tokens
AP - Plan the implementation
SS - Implement the plan
TT - Run tests
GC - Commit changes
```

Or run everything at once:

```
RDP - Implement JWT authentication end-to-end
```

## Prerequisites

- **Git** (for CR and GC commands)
- **Test runner** (for TT - auto-detected from project config)

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
