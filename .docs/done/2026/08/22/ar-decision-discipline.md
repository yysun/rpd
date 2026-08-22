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
- Protected CR passed on round 1 with an independent reviewer and no findings.
- Tier 2 passed: low-risk primary CR behaved correctly; the protected current-story CR passed; the
  focused rerun fixed one real coverage finding and passed with the same reviewer on round 2.
- VR passed every acceptance criterion and plan task; no ordinary TT suite or matching story E2E spec
  exists.
- The complete installable directory was synced to `~/.agents/skills/rpd/`; byte parity passed.

## Notes

- Version remains `3.8.0` for this focused contract correction.
