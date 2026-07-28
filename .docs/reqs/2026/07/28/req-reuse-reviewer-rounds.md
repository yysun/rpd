# Reuse Reviewers Within a Review Stage

## Problem

RPD currently tells the primary agent to prefer fresh reviewer context after material review fixes.
Starting another independent subagent for every AR, CR, or VR rerun repeats repository discovery and
artifact reconstruction, making review loops substantially slower. A reviewer remains independent
from the implementation author when it reviews multiple snapshots; replacing it after every fix is
not what creates that independence.

## Requirement

RPD must reuse the same independent subagent for every review round within one AR, CR, or VR stage
while that reviewer remains available and independent. Each rerun must judge the complete new stable
snapshot against the stage's full checklist rather than only confirm prior findings.

## Acceptance Criteria

- [x] The independent-review contract requires the same subagent to handle reruns within one AR,
      CR, or VR stage while it remains available and independent.
- [x] The contract does not prefer or require fresh reviewer context merely because the primary
      agent fixed findings.
- [x] Every rerun receives the new stable snapshot and raw artifacts and repeats the stage's full
      checklist instead of limiting review to previously reported findings.
- [x] A reviewer is not reused across AR, CR, and VR stage boundaries.
- [x] A replacement reviewer is allowed when the current reviewer is unavailable, has contributed
      to the artifacts under review, or has invalidated the review by mutating the snapshot.
- [x] Initial independent reviewers still start without inherited authoring context, reviews remain
      serial, and the primary agent still owns every edit and final pass decision.
- [x] The README describes the same reviewer-reuse behavior as the installable skill.
- [x] Static contract checks, skill validation, and `git diff --check` pass.

## Constraints

- Preserve the existing independent-review scope for AR, CR, and VR.
- Preserve read-only review, stable-snapshot, no-findings-cap, and rerun-after-material-change rules.
- Do not let reviewer reuse transfer edit ownership away from the primary agent.
- Keep the frontmatter description within its existing schema and character limit.

## Non-Goals

- Combining AR, CR, and VR into one review stage.
- Skipping independent review for low-risk implementation or verification work.
- Reducing any stage's checklist to a fix-only review.
- Reusing a reviewer after it authors or edits an artifact under review.
