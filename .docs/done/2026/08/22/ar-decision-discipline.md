# AR Decision Discipline

## Summary

- Made AR challenge weak or unclear requirements, plans, and proposed solutions instead of only
  checking document completeness.
- Added concise option framing: offer viable choices, name real tradeoffs, recommend one, ask only the
  next necessary question, and stop once implementation is clear.
- Kept the behavior judgment-led and proportional; no evidence audit, citations, matrices, inventories,
  new reporting fields, or bespoke behavioral harness were added.

## Verification

- Tier 0 static contract passed; skill validation, size/version limits, and `git diff --check` passed.
- Release AR passed on round 3; protected CR passed on round 2 with the same reviewer after correcting
  stale version wording in this completion note.
- Tier 2 passed: low-risk primary CR behaved correctly; the protected current-story CR passed; the
  focused rerun fixed one real coverage finding and passed with the same reviewer on round 2.
- Fresh release VR passed every acceptance criterion and plan task; no ordinary TT suite or matching
  story E2E spec exists.
- The complete installable directory was synced to `~/.agents/skills/rpd/`; byte parity passed.

## Notes

- The additive AR behavior is released as minor version `3.9.0`.
