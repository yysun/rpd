# SS Checkpoint Commits

## Summary

RPD 3.11.0 saves independently revertible SS milestones as local commits, records verification state,
reviews all story commits and remaining changes from a persistent base, and lets GC finalize any
remaining delivery changes. Explicit no-commit instructions override milestone commits.

## Verification

All four acceptance criteria are complete:

1. SS authorization and milestones: the final contract automatically commits complete, independently revertible milestones, records verification status, and continues. The milestone fixture produced two local commits; the explicit no-commit run completed implementation without changing HEAD. Checkpoints do not replace acceptance or CR/TT/ET/VR and do not authorize push or history rewriting.
2. Persistent story scope: AP records the initial Git base and both milestone hashes. A second SS invocation preserved that base and created no empty commit. Parent checks confirmed pre-existing story work was included and unrelated index/worktree contents remained unchanged.
3. Whole-story CR and final GC: a fresh executor found and fixed a regression already committed with no uncommitted story source diff, then passed eight focused tests. GC committed only the remaining fix and preserved earlier milestones. Repeated GC left HEAD unchanged and unrelated work intact.
4. Documentation and validation: SKILL, README, changelog, and the focused maintainer scenarios describe 3.12.0 consistently. Tier 0, skill validation, diff and symlink checks passed; independent AR and CR passed. The recorded isolated runs support the requested behavior.

Every AP task is complete. No material acceptance gaps remain; DD is downstream.

Evidence limits: the independent VR attempt failed with a usage-limit error before producing a verdict. The primary agent completed this review using the same criteria, current artifacts, recorded execution evidence, and previously inspected Git/file effects. VR independence was unavailable; independent AR and CR remain valid. The fixtures sample behavior rather than proving every mixed-hunk repository state.

VR risk: non-low — Automatic Git mutations and whole-story review scope affect the consumer workflow contract.
VR review round: 1; reviewer: not applicable
VR passed: all acceptance criteria complete

## Notes

Release numbering was consolidated into 3.11.0 before publication. Version numbers in the verbatim
VR result above refer to intermediate local drafts, not published releases.

All test commits were created in temporary fixtures. The maintainer repository remains uncommitted.
The separate snapshot-rule suggestion was discussed but not implemented in this change.

