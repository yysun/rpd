# SS Checkpoint Validation

## Scope and Static Evidence

This run validates the 3.12.0 SS/CR/GC policy change against the previously completed 3.11.0 working
tree. The maintainer repository is intentionally uncommitted; all commits below belong to temporary
fixtures under `rpd-ss-checkpoints-f3xglul6` in the system temporary directory.

- Tier 0, the skill-creator validator, and `git diff --check` passed.
- The installed skill remains a symlink resolving to the repository's `skills/rpd`.
- Independent AR passed in round 1. Its non-blocking plan cleanup was applied.
- Independent CR compared against the pre-task working-tree files, not the older maintainer HEAD.
  No material policy findings remained.

CR risk: non-low — Changes automatic Git mutations and whole-story review scope.
CR review round: 1; reviewer: new
CR passed: no major findings

## Behavioral Evidence

Executors received their isolated repository, copied final skill, and an ordinary stage request.
Expected outcomes and seeded-defect explanations were not given to execution agents. The initial
fixture has a pending normalization edit and unrelated `notes.txt` content in both index and worktree.

| Scenario | Actual result |
|---|---|
| SS milestones | Created `c54b79075fcf91e9d596aa28c62d6c9d515e59af` for normalization and `fd43a170abacd19b1c6ebf376c30a1196e35cfad` for rendering. Both focused test files passed 4 tests. AP records the original base, both hashes, and verification. |
| SS resumption | Reused the completed milestones and current verification. No implementation edits or new commits; AP's original base survived. |
| Explicit no-commit | Both milestones and focused tests completed, with no commits or staging changes. HEAD remained at entry and five story files stayed unstaged. |
| CR of committed work | The cloned fixture had three story commits and no uncommitted story changes. CR found the seeded uppercase regression in committed code, reproduced 4 test failures, restored lowercase behavior, and passed all 8 focused tests. Only the source fix remained uncommitted. |
| GC and repeat GC | GC committed only the remaining source fix as `4cf8b7d0f663b7c80e36edd7e1f8bc5ca6b778aa`, preserving both milestone commits and unrelated notes. The second GC created no commit; HEAD stayed unchanged and only unrelated notes remained dirty. |

The story base was `ff919de0e1cb2cd04c6e7f2fd92e79f380c2ea13`. The parent independently checked
the original base in AP, checkpoint hashes, commit path lists, unchanged HEAD in the no-commit run,
and exact index/worktree contents of `notes.txt`. Neither milestone included unrelated notes.
After both GC runs, the parent again checked the unchanged notes index/worktree, retained milestone
ancestry, empty remaining story diff, and unchanged final HEAD on repeated GC.

The fresh committed-work executor reported:

CR risk: low — localized, reversible internal helpers with straightforward verification and no protected-boundary impact.
CR review round: 2; reviewer: not applicable
CR fixed: restored required lowercase normalization and dependent rendering; rerun result passed

## Limits

Behavioral evidence samples a small internal two-milestone story. It does not prove every possible
mixed-hunk repository state or model behavior. Test counts above are execution-agent evidence;
the parent separately inspected observable Git/file effects without duplicating successful suites.
No push, history rewrite, or commit in the original maintainer repository was performed.

The independent VR attempt failed with a usage-limit error before a verdict. The primary agent
completed final VR against the same acceptance criteria and existing evidence; no independent VR
pass is claimed. Independent AR and CR had already passed.

Release note: the draft versions referenced in this execution record were consolidated into 3.11.0
before publication. Historical fixture and verification descriptions are preserved.
