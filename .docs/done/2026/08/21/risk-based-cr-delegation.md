# Risk-Based CR Delegation

## Summary

- Changed CR reviewer selection from unconditional delegation to a strict evidence-backed risk gate:
  eligible low-risk CR stays with the primary agent, while uncertain or non-low-risk CR remains
  independently reviewed whenever delegation is available.
- Kept VR independently reviewed and retained AR's existing risk-based exception; CR's checklist,
  review loop, clean-context isolation, read-only guarantees, reviewer reuse, and pass standard remain
  unchanged.
- Added explicit CR classification output with six repository-evidence fields, read-only primary
  evaluation boundaries, escalation, sticky independent review, and an honest blocked outcome when a
  required reviewer cannot continue.
- Defined any subagent doing CR classification, checklist work, or the verdict as a reviewer. An
  eligible low-risk CR spawns no CR subagent and creates no reviewer snapshot or review log.
- Published the breaking terminal-contract change as skill version `4.0.0`, with aligned README,
  CHANGELOG, suite guidance, static contracts, and evidence-tier expectations.

## Verification

- Tier 0 Scenarios 0.1 through 0.7 passed after the final edits; the skill validator reported
  `Skill is valid!`, and `git diff --check` passed.
- Tier 2 Scenario 2.1 passed with low-risk primary-agent CR, all six evidence fields, no CR reviewer
  artifacts, and collaboration-tree evidence showing zero descendants under the execution agent.
- Tier 2 Scenario 2.2 passed with independent AR, CR, and VR, four focused authentication cases,
  both mutants rejected, matching verification digests, and explicit evidence that CR ran neither
  tests nor E2E.
- Tier 2 Scenario 2.3 passed at four occupied collaboration slots: escalation and sticky-review
  histories both emitted `CR blocked`, retained round 1, created no reviewer attempt, and left zero
  sentinels running after cleanup.
- `skills/rpd/` was synced with stale-file removal to `~/.agents/skills/rpd/`; recursive comparison is
  empty.
- Final review gates passed: AR round 11, CR round 8, and VR round 2. VR mapped all 12 acceptance
  criteria to concrete evidence.

## Notes

- Tier 1 was not run because intent routing, authorization, stage selection, stage order, and termini
  did not change; reviewer selection inside the existing CR stage is covered by Tier 0 and Tier 2.
- The expensive independent path remains intentionally slower for security and other non-low-risk
  changes. The latency reduction applies only to evidence-backed low-risk CR.
- CR does not run the full unit/integration suite or E2E scenarios. TT and ET own those executions;
  CR reviews the stable diff and prior verification evidence.
- No commit was created because GC was not requested.
