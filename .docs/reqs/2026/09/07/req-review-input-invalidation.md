# Review Input Invalidation

## Requirement

Replace repository-wide review invalidation with invalidation based on the actual review inputs.
Keep reviewers read-only and preserve valid conclusions when unrelated work proceeds.

## Acceptance Criteria

- [x] Unrelated edits, evidence-neutral progress updates, and commits preserving reviewed content and
      scope do not invalidate a review or require a repository-wide snapshot.
- [x] Material changes to relevant requirements, implementation, dependencies/configuration, tests,
      or verification evidence require reassessment of affected conclusions before passing. Scope
      expansion, protected-boundary changes, uncertain reach, or reviewer changes require full review.
- [x] SKILL, README, changelog, and targeted scenario definitions agree. Static validation and a
      reasoned review cover unchanged-content commits, unrelated edits, affected fixes, dependency
      changes, and uncertain impact. Verification limits are reported accurately.

## Non-Goals

Changing SS checkpoint authorization, permitting reviewers to edit, dropping review findings, or
committing the current maintainer working tree. This request edits the policy, not a live snapshot.
