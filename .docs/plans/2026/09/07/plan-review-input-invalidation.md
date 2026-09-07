# Review Input Invalidation

## Decisions and Tasks

- [x] Replace the global mutation/serialization rule with review-input scope, read-only reviewers,
      primary-owned fixes, and affected-conclusion reassessment. Preserve full-rerun triggers.
- [x] Align README and targeted maintainer scenario expectations; include in the consolidated 3.11.0 release.
- [x] Run package/protocol validation, skill validation, diff and installation checks. Review the
      change against the three criteria and the relevant mutation cases.

## Validation and Risk

This changes a consumer review contract. Attempt independent AR/CR when available; the earlier
independent VR exhausted agent usage, so fall back to disclosed primary review if that persists.
Do not claim model-driven behavioral execution when unavailable. Check semantics as well as text:
an apparently unrelated dependency/configuration change can affect reviewed behavior, and a commit
with unchanged files can still alter review scope. No new snapshot manifests or hashes are required.

Existing workflow stages and SS/CR/GC authorization remain intact. The user requested a policy edit;
retain the existing uncommitted maintainer work. DD records the final verification after completion.

AR risk: non-low — changes the consumer-facing review validity contract.
AR review round: 1; reviewer: new
AR passed: no blocking architecture flaws
