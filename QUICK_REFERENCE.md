# RPD Quick Reference

Quick reference guide for the Requirements, Planning, and Development workflow commands.

## Canonical Flow

```
RPD = REQ → AP → AR (loop) → SS → TT → CR (loop) → DD → GC
```

## Quick Workflows

### New Feature (Complete)
```
REQ → AP → AR → SS → TT → DD → GC
```

### Bug Fix (Quick)
```
DF → TT → GC
```

### Code Cleanup
```
CC → TT → GC
```

### End-to-End (One Command)
```
RPD (runs: REQ → AP → AR (loop) → SS → TT → CR (loop) → DD → GC)
```

## Commands

| Command | Purpose |
|---------|---------|
| `RPD` | Full end-to-end flow |
| `REQ` | Requirements (WHAT only) |
| `AP` | Architecture and phased plan |
| `AR` | Review REQ/AP and update in place; auto-fix high priority issues |
| `SS` | Implement tasks phase-by-phase |
| `DF` | Debug root cause and fix |
| `CC` | Consolidate/clean code |
| `TT` | Test and fix failures |
| `CR` | Review changes; auto-fix high priority issues |
| `DD` | Document completed work |
| `GC` | Commit with conventional message |

## Automatic Triggers

```
REQ → AR loop (auto)
AP → AR loop (auto)
SS → CR loop (auto)
GC → CR (auto)
RPD orchestrates full flow
In RPD, prefer one AR pass that reviews REQ + AP together unless user asks for separate reviews
```

## Documentation Trail

```
REQ creates: .docs/reqs/{date}/req-{name}.md
AP creates:  .docs/plans/{date}/plan-{name}.md
SS updates:  checkboxes in plan
DD creates:  .docs/done/{date}/{name}.md
```

## Decision Matrix

| Situation | Commands |
|-----------|----------|
| New big feature | REQ → AP → AR → SS → TT → DD → GC |
| New small feature | SS → TT → GC |
| Bug fix | DF → TT → GC |
| Code cleanup | CC → TT → GC |
| UI feature | SS → TT → GC |
| Refactoring | AP → SS → TT → GC |
| Full delivery | RPD |

## Rules

- **Requirements = WHAT only** — no how, no optimization
- **AR auto-fixes high priority issues** — before reporting
- **CR auto-fixes high priority issues** — don't just report, fix them
- **Validate relevant checks** — run tests/build/lint/docs preview based on changed artifacts
- **Approval gate** — after REQ/AP/AR, ask for approval before SS/DF/CC/TT/GC
- **File header comments** — add/update only when consistent with project conventions

## Invocation Notes

- Match command keywords case-insensitively and prioritize clear user intent.
- Plain-language requests are valid; no strict command format is required.
- Multi-line messages are valid; detect command keywords on the first non-empty line or any clear command line.
- Ignore keywords inside fenced code blocks and inline code unless explicitly requested.

Example:

```text
REQ do following:
- x
- y
- z
```

## Commit Types

`feat` `fix` `docs` `style` `refactor` `perf` `test` `chore` `ci` `revert`

---

**Quick Start**: Need a feature? Start with `REQ`
**Most Common**: Bug fix? Use `DF → TT → GC`
**Before Commit**: Always use `GC` (includes review)
