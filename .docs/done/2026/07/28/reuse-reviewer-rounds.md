# Reuse Reviewers Within a Review Stage

## Summary

- AR, CR, and VR reruns now reuse the same independent subagent within one stage while it remains
  available and independent, avoiding repeated startup and repository discovery.
- Every rerun still receives the new stable snapshot, raw artifacts, and full stage checklist; a
  prior finding cannot narrow the next review.
- New stages and invalidated reviewers still start a clean or minimal-context independent reviewer.
- README guidance, the `3.4.0` changelog, and fail-fast Scenario 15 assertions now enforce the same
  contract.

## Verification

- Final independent CR rerun: no material findings.
- Fail-fast offline Scenario 15: exit 0.
- Skill validator: `Skill is valid!`; `git diff --check`: exit 0.
- Independent VR: all eight acceptance criteria complete.

## Notes

- No story-specific E2E spec or conventional unit-test runner exists; Scenario 15 is the applicable
  executable contract verification.
- The preceding no-prefix completion-document commit was amended separately as `653c534` with its
  matching README and Scenario 15 updates.
