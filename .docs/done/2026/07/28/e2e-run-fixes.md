# Fix Findings From the First Full Intent-Routing E2E Run

## Summary

- Ran all 13 cases in `.docs/tests/test-intent-based-routing.md` against real execution agents for
  the first time: 8 passed, 5 failed against skill v3.3.0.
- Fixed the harness: every planned-path scenario reaching `VR` failed `assert_cr_final`, not from
  agent behavior but because `VR` legitimately updates REQ checkboxes after `CR`'s snapshot was
  taken. The shared snapshot hash now excludes `.docs/reqs`.
- Fixed the skill: `AR`'s mandated report phrase now states it is required verbatim regardless of
  other formats a caller requires (three independent agents omitted it); `CR` and `VR` gained the
  same mandated phrase, which they lacked entirely.
- Fixed the skill: `AP`'s E2E guidance now classifies by the story's subject, not by whether today's
  implementation has a live surface (two independent agents, plus their reviewers, skipped E2E specs
  for auth and external-integration stories on that basis).
- Fixed the skill: planned routing now states a blocking open question does not exempt the flow from
  creating `AP` (one agent stopped after `REQ` alone).
- Fixed the skill: the review-rerun exemption is narrowed to the REQ-checkbox case only, closing the
  "editorial corrections" gap one agent used to slip an unreviewed source edit past both `CR` and
  `VR`; also fixed a stale Scenario 11 assertion still expecting the `done-{name}.md` prefix reverted
  separately.

## Verification

- Scenario 15's static block passes end to end; all eight new/changed assertions were individually
  negative-tested and each failed when its target text was removed.
- `snapshot_hash()` verified directly: a `.docs/reqs`-only edit leaves the hash unchanged, a `src/**`
  edit changes it.
- `SKILL.md`'s Intent Routing section remains byte-identical to `README.md`'s; skill validator
  reports success. Released as `3.5.0`.

## Notes

- `bang-restart`'s separate defect (reconciled REQ dropped the literal `"ready"` value) is real but
  out of scope here — a content-quality issue in one run's output, not a contract gap.
- None of the 13 cases have been rerun against the fixed skill; this story fixes what the failures
  pointed to, but the fixes are unexercised against a live agent.
- `security-fix`'s first attempt was discarded (accidentally coached beyond the exact prompt);
  `security-fix-clean` is the counted, uncoached result.
