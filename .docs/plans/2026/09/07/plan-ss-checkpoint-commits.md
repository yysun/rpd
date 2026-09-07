# SS Checkpoint Commits

## Goal and Decisions

Add local recovery points during SS without losing whole-story review coverage. The existing contract
reviews only uncommitted changes, batches checks at SS completion, and leaves final committing to GC.

- After independently revertible implementation milestones, commit locally, record verification
  status, and continue. Reuse current evidence; run focused checks when needed. Stage commits do not
  mean acceptance or replace CR/TT/ET/VR. Do not introduce a full suite or CR after every task.
- Before SS changes/commits, record the story's Git base in AP, reconstructing an earlier story base
  from history when resuming. Preserve it across reruns and record checkpoint hashes. The scope also
  includes story changes already present at entry; exclude unrelated work even when staged.
- CR examines all story changes from that base plus remaining staged/unstaged/untracked work. GC
  handles remaining delivery changes and avoids empty commits. User no-commit instructions override
  checkpointing; neither checkpointing nor a stop before GC implies permission to push.
- This turn edits the policy only. Keep current working-tree changes uncommitted. Include this change in the
  consolidated 3.11.0 release; preserve earlier completion evidence as historical evidence.

## Tasks

- [x] Update SKILL's SS, CR, GC, routing and shared commit scope; align README and changelog.
- [x] Add an isolated maintainer scenario for checkpoints, initial staged/unstaged unrelated work,
      persisted review scope after resume, and the explicit no-commit override.
- [x] Run Tier 0, skill validation, diff and symlink checks.
- [x] Run the focused isolated scenarios and record commit contents, source behavior, verification,
      review scope, and untouched unrelated work.

## Validation and Risk

The change alters a consumer workflow's Git mutations and code-review scope, so it needs independent
AR and CR. Use temporary Git repositories with a two-milestone internal task, a seeded prior story
change, and unrelated staged/unstaged edits. Verify checkpoint contents and AP's preserved base;
exercise CR after all implementation has been checkpointed to catch an empty-diff review. A separate
no-commit run must leave HEAD unchanged. A tiny resumption check verifies that the recorded base
survives another SS invocation. These are explicitly planned maintainer checks, not a product E2E.

Static protocol checks remain structural; they cannot establish commit authorization or review scope.
No new production runtime helper or fixed checkpoint template is needed.

Independent CR follows implementation and focused checks; VR checks the completed evidence. They
remain workflow stages rather than implementation tasks.

AR risk: non-low — The policy changes automatic Git mutations and whole-story review scope.
AR review round: 1; reviewer: new
AR passed: no blocking architecture flaws

## Evidence

[The validation record](../../../../tests/results/2026-09-07-ss-checkpoints.md) covers automatic
milestone commits, no-commit override, base preservation on resume, committed-defect discovery, and
both final and no-op GC. All fixture commits are outside the maintainer repository.
