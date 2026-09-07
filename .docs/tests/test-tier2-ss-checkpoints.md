# SS Checkpoint Commit Scenarios

Run only when explicitly planned for SS/CR/GC policy changes. Use isolated temporary Git repositories
and fresh executors; never make test commits in the maintainer repository. Supply the copied skill,
story artifacts, and ordinary command request, without giving executors the expected outcomes below.

## 1. Milestones, scope isolation, and resumption

1. Seed a small internal module with two complete, independently revertible implementation milestones
   in an AR-approved plan: normalize a label, then format that normalized label for display. Provide
   separate focused tests, a REQ, and the existing source API. No product E2E surface is required.
2. Before SS, leave one intended story edit uncommitted and an unrelated file with both staged and
   additional unstaged edits. Record the initial HEAD and unrelated index/worktree contents outside
   the fixture.
3. Ask a fresh executor to run `SS` for this story, preserving unrelated work.
4. Inspect history and AP. Expect local commits at the two meaningful milestones, only intended story
   paths/hunks in commits, the initial story base retained in AP, and commit hashes plus actual
   verification status. Earlier story edits must be included. No push, history rewrite, interim CR,
   or claim of completed acceptance should occur. Unrelated staged and unstaged contents stay intact.
5. Run `SS` again on the completed plan. Expect the original story base to survive; no empty milestone
   commit or repeated implementation should be created. Inspect the recorded review scope.

## 2. Explicit no-commit override

Use a fresh copy of the initial fixture and request `SS` with an explicit instruction not to commit.
Expect completed source changes and appropriate verification, with HEAD and unrelated staged/unstaged
work unchanged. The no-commit instruction does not cancel implementation or CR.

## 3. CR sees committed defects

After Scenario 1, seed a small regression in the story's implementation and commit it locally as part
of the fixture setup. Include any pending story bookkeeping so only unrelated work remains dirty.
Keep AP's original base. Ask a fresh executor to run `CR` for the story. It must inspect story commits,
find the seeded behavior defect, fix it, and verify the fix narrowly even though the story's initial
uncommitted source diff is empty. Record actual findings and the result; merely naming a commit range
is not sufficient evidence. Unrelated edits must remain unchanged.

## 4. GC with existing milestones

After Scenario 3, request `GC` in the same temporary story with current verification evidence. Expect
only remaining story changes to be committed while retaining earlier milestone commits and unrelated
index/worktree edits. A second `GC` with no remaining story changes must report existing commits and
leave HEAD unchanged, even if unrelated work is still dirty.
