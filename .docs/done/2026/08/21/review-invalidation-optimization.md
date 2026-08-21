# RPD 3.8.0 Simplicity Restoration

## Summary

- Restored the installable skill to a compact proportional workflow while preserving intent routing,
  File Comment Blocks, `!!`, the AR gate, uncapped findings, and CR/TT/ET ownership.
- Unified routing and AR/CR/VR reviewer selection around one protected-boundary definition.
- Kept low-risk review with the primary agent and independent review for protected or uncertain work.
- Removed mandatory evidence matrices, stable finding/checklist IDs, review-action/scope fields,
  snapshot hashes, verification digests, retained bundles, and path manifests.
- Replaced the fixed five-phase AP template and large three-tier harness with proportional plans, one
  deterministic contract check, and three short planned maintainer dogfood scenarios.
- Preserved README's product argument, quick start, workflow narrative, command guide, and artifact model;
  only stale planning, review, E2E, and maintainer-test details changed.
- Moved README intent routing into the Workflow narrative and replaced command-line installation with
  the agent prompt `Install RPD skill from GitHub yysun/rpd`.
- Made the complete `RPD` flow the recommended README path, followed by targeted commands, automatic
  routing for ordinary requests, and the `!!` correction flow.

## Verification

- Tier 0 compact static contract: passed.
- Skill-creator `quick_validate.py skills/rpd`: `Skill is valid!`.
- Low-risk dogfood: focused formatter fix stayed primary, ran one focused test file, and passed CR.
- Focused-rerun dogfood: the same reviewer found the seeded whitespace edge case; after a narrow fix and
  3/3 focused tests, round 2 reused that reviewer and was materially narrower than round 1.
- Architecture dogfood: the initial full AR was followed by focused reruns that stayed on unresolved
  blockers; no hash or retained evidence bundle was used.
- Protected CR: one invalidated attempt after a concurrent README edit, then one full round and two
  materially narrower same-reviewer reruns; round 3 passed with no remaining findings.
- Independent VR: all 13 acceptance criteria complete with concrete evidence; round 1 passed.
- README continuation: Tier 0 passed; focused CR fixed the Workflow-heading boundary assertion, and
  independent VR confirmed the recommended flow order, structure preservation, exact prompt text, and
  removal of `npx` guidance. No full suite or E2E was run for the documentation-only continuation.
- `git diff --check`, fixture JSON parsing, size limits, version checks, and removed-script checks passed.

## Notes

- A README edit made after CR started invalidated that attempt; CR restarted fully on the stable diff.
  This exercised the new serial read-only mutation rule without snapshot machinery.
- The installable skill is 193 lines and remains version 3.8.0. Historical story records were preserved.
