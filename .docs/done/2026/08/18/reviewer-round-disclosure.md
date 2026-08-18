# Disclose Reviewer Round and Reuse

## Summary

- Every `AR`, `CR`, and `VR` result now states which round within that stage produced it and whether
  that round's reviewer was reused or newly started, on its own line beginning with the stage token:
  `<STAGE> review round: <n>; reviewer: <reused|new|not applicable>`.
- A reviewer newly started at round 2 or later must name the permitted replacement condition that
  applied, so an unexplained substitution is visible in the result rather than only in a runtime
  trace. Round 1 is always `new` and names no condition.
- A primary-agent review — delegation unavailable, or a low-risk `AR` — reports the round and
  `reviewer: not applicable (primary-agent review)` rather than claiming a reviewer that never ran.
- The disclosure is additive and carries no verdict wording: the three terminal phrases are
  byte-unchanged and a caller still reads the verdict from those phrases alone.
- The contract states explicitly that disclosure is a report, not a budget: no round limit, no
  findings cap, no fix-only rerun, and an unresolvable blocking finding still stops the loop.
- Version `3.6.0` → `3.7.0` across the skill and README, with a matching `CHANGELOG.md` entry.
- Tier 0 gains Scenario 0.7, asserting the disclosure in the skill, README, and changelog, and
  asserting that nine preserved guarantees still appear verbatim. Tier 2 now asserts the disclosure
  line in each execution agent's own result log — a line only `SKILL.md` mandates.

## Verification

- Tier 0 static contracts, Scenarios 0.1 through 0.7: each exit 0, run from extracted script files
  after the final edit.
- Mutation-checked the new assertions: removing the primary-agent rule, weakening the reuse
  obligation, altering a terminal phrase, dropping the README disclosure, and dropping the Tier 2
  assertion each fail Scenario 0.7 or 0.6 as intended; all mutants reverted.
- `python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/rpd`:
  `Skill is valid!`
- `git diff --check`: exit 0.
- `skills/rpd/` synced to `~/.agents/skills/rpd/`; `diff` against the repository copy is empty.
  `~/.claude/skills/rpd/SKILL.md` is the same inode, so it is covered by that sync.

## Notes

- Tier 1 was not run: it covers intent routing, which this story does not touch.
- Tier 2 was not run: it requires two long execution-agent runs plus four reviewers. Its new
  assertions ship as contract and are verified statically by Tier 0 Scenario 0.6.
- `AR`, `CR`, and `VR` for this story all ran as primary-agent reviews: this runtime does not permit
  spawning subagents unless the user asks, so independent delegation was unavailable — the exact
  case the new `reviewer: not applicable (primary-agent review)` disclosure exists to make visible.
- The story is uncommitted. Run `GC` to commit it.
