# SS Checkpoint Commits

## Problem and Requirement

SS should save useful implementation milestones as local commits so work can be recovered, reviewed,
and resumed. A milestone is a complete, independently revertible piece of implementation, not every
task or edit. Early commits must not disappear from final code review.

## Acceptance Criteria

- [x] SS, including SS entered by planned routing or `!!`, automatically creates local commits after
      complete, independently revertible implementation milestones, records verification status, and
      continues. An explicit no-commit instruction takes precedence. Stage commits do not establish
      acceptance, replace CR/TT/ET/VR, or authorize push or history rewriting.
- [x] SS records a persistent story Git base and checkpoint hashes in AP. Resuming or rerunning SS
      preserves the whole story's review scope, including relevant changes already present at entry.
      Commits include only intended story changes, preserving unrelated staged and unstaged work.
- [x] CR covers the story's committed and uncommitted changes rather than only the remaining diff.
      Checkpoints do not trigger intermediate CR or unnecessary full suites. GC commits remaining
      intended changes after verification, or reports existing commits when nothing remains.
- [x] README, changelog, and focused maintainer scenarios describe the new behavior consistently.
      Static checks, independent review, and isolated checkpoint/opt-out behavior checks pass.

## Constraints and Non-Goals

- Keep this addition compact. Preserve other commands, gates, file headers, and final VR/DD behavior.
- This request changes the workflow definition; do not retroactively commit the current repository's
  existing compact-skill work or this policy edit. All test commits belong in temporary fixtures.
- The low-risk direct path has no SS stage and gains no automatic commit behavior.

## Open Questions

None.
