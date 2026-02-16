# RPD Quick Reference

Quick reference guide for the Requirements, Planning, and Development workflow commands.

## Command Cheat Sheet

```
RPD - Requirements, Planning, and Development Workflow

REQUIREMENTS & PLANNING
├─ REQ → Create requirement document (.docs/reqs/)
├─ AP  → Create architecture plan (.docs/plans/)
└─ AR  → Review architecture (auto after REQ/AP)

IMPLEMENTATION
├─ SS  → Step-by-step implementation
├─ DF  → Debug and fix issues
└─ CC  → Consolidate/clean code

DOCUMENTATION
└─ DD  → Document completed features (.docs/done/)

TESTING
└─ TT  → Run tests and fix failures

GIT WORKFLOW
├─ CR  → Code review via git diff
└─ GC  → Review + commit (auto CR)
```

## Quick Workflows

### New Feature (Complete)
```
REQ → AP → SS → TT → DD → GC
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
RDP (runs: REQ → AP → AR loop → SS → CR loop → DD → GC)
```

## Command Details

### REQ - Requirements
**Purpose**: Document WHAT is needed, not HOW
**Output**: `.docs/reqs/{date}/req-{name}.md`
**Auto-triggers**: AR

### AP - Architecture Plan
**Purpose**: Design implementation with phased tasks
**Output**: `.docs/plans/{date}/plan-{name}.md`
**Auto-triggers**: AR

### AR - Architecture Review
**Purpose**: Validate approach, provide alternatives
**Updates**: Existing req/plan documents in place

### SS - Step-by-Step
**Purpose**: Execute plan systematically
**Updates**: Plan checkboxes as tasks complete

### CC - Consolidate Code
**Purpose**: Remove redundancy, dead code, unused imports

### DF - Debug & Fix
**Purpose**: Find root cause and fix (not just symptoms)

### DD - Document Done
**Purpose**: Record completed work
**Output**: `.docs/done/{date}/{name}.md`

### TT - Test & Fix
**Purpose**: Run tests and fix failures
**Process**: Run → Analyze → Fix → Repeat

### CR - Code Review
**Purpose**: Review uncommitted changes via `git diff`
**Outputs**: Critical (auto-fixed), Important (should fix), Nice-to-have

### GC - Git Commit
**Purpose**: Review then commit
**Auto-runs**: CR before committing
**Format**: `<type>(<scope>): <subject>`

## Automatic Triggers

```
REQ ──→ AR (auto)
AP  ──→ AR (auto)
GC  ──→ CR (auto)
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
| New big feature | REQ → AP → SS → TT → DD → GC |
| New small feature | SS → TT → GC |
| Bug fix | DF → TT → GC |
| Code cleanup | CC → TT → GC |
| UI feature | SS → TT → GC |
| Refactoring | AP → SS → TT → GC |
| Full delivery | RDP |

## Rules

- **Requirements = WHAT only** — no how, no optimization
- **CR auto-fixes critical issues** — don't just report, fix them
- **Compile after every change** — verify no errors before moving on
- **File header comments** — summarize features, implementation, and changes at top of each source file

## Commit Types

`feat` `fix` `docs` `style` `refactor` `perf` `test` `chore` `ci` `revert`

---

**Quick Start**: Need a feature? Start with `REQ`
**Most Common**: Bug fix? Use `DF → TT → GC`
**Before Commit**: Always use `GC` (includes review)
