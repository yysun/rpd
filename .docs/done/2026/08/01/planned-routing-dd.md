# Planned Routing Completion Documentation

## Summary

- Auto-entered planned routing now runs `SS(+CR*) → TT → ET? → VR* → DD` and stops before `GC`; DD is written only after VR passes.
- `!!` now reconciles and restarts through verified DD without committing, while direct routing still stops after CR and explicit full `RPD` still continues through GC.
- Published the contract as `3.6.0`, including the compatibility note, aligned README guidance, and a regenerated workflow diagram.
- Hardened the intent-routing harness with stage-aware review snapshots and strict human-readable Given/When/Then structure plus domain-specific runtime semantics.

## Verification

- Focused planned-routing scenarios 1–6 passed; canonical execution Scenarios 3, 4, 5, 6, and 11 passed with DD ordering, unchanged-history, mutant, and no-GC checks.
- Full Scenario 16 passed, including network packaging; the skill validator reported `Skill is valid!`, Intent Routing sections matched byte-for-byte, and `git diff --check` passed.
- `AR passed: no blocking architecture flaws`; `CR fixed: review-evidence validation and GWT grammar/semantic parsers corrected; rerun result passed`.
- `VR passed: all acceptance criteria complete` with all 11 REQ criteria and all 36 AP tasks supported.

## Notes

- Synced `skills/rpd/SKILL.md` to `/Users/esun/.agents/skills/rpd/SKILL.md`; both files have SHA-256 `101d39e8e1790b5278f7eea6ac55753fbc4aa0bd2f2ece0497183194b9e72b26`.
- This DD/global-sync continuation did not run `GC` or create a commit; repository `HEAD` is the pre-existing `d41eb55` (`add DD to planned path, remove GC from !! flow`). The `3.6.0` release remains the owner's explicit compatibility exception.
