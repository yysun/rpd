# Compact RPD Skill

## Summary

RPD 3.11.0 consolidates repeated guidance into a shorter single-file contract. File headers remain
useful starting context: they describe responsibilities, constraints, and design reasons, and change
only when those facts change. README and maintainer checks follow the revised contract.

## Verification

All six acceptance criteria are complete:

1. **Compression and self-containment:** The recorded reduction is 2,197 → 1,441 words (34.4%) and 227 → 157 lines. [SKILL.md](/Users/esun/Documents/Projects/rpd/skills/rpd/SKILL.md) contains the runtime contract in one file, consolidating shared principles, routing, verification ownership, and review rules. Baseline comparison found no remaining workflow-guarantee omission.

2. **Workflow preservation:** All 12 commands remain. The final contract preserves authorization, risk routing, endpoints, AR’s execution ban and bounded SS probe, SS/CR/TT/ET responsibilities, independent review and reuse, exact disclosures/verdicts, evidence-backed VR, verbatim VR preservation in DD, and scoped GC with current verification.

3. **Header policy:** The contract describes responsibilities, constraints, and necessary design reasons; reuses effective module documentation; and updates it only when those facts change. Actual fixture diffs show an absent header added, an accurate header unchanged, and a stale constraint updated alongside implementation and tests. No duplicate summary, inventory, or change history appeared.

4. **README and release consistency:** [README.md](/Users/esun/Documents/Projects/rpd/README.md) retains the product rationale and all four usage paths. The duplicated Notes section is replaced with explanations and normative links. README, skill metadata, and the latest changelog entry agree on 3.11.0.

5. **Validation coverage and independent CR:** [Tier 0](/Users/esun/Documents/Projects/rpd/.docs/tests/test-tier0-static-contracts.md) checks package structure, metadata, commands, artifact paths, links, and protocol literals without asserting ordinary explanatory prose. Recorded behavioral runs cover low-risk routing, all three header cases, reviewer reuse, and AR → SS → AR feasibility handling. Final independent CR passed in round 3 with the reviewer reused.

6. **Passing evidence and installation:** The [validation record](/Users/esun/Documents/Projects/rpd/.docs/tests/results/2026-09-07-compact-skill.md) and supplied latest checks report passing skill validation, Tier 0, diff checks, and installation-symlink verification. Actual locale fixture artifacts show a measured unavailable capability, a probe marker, and documentation-only blocker updates; source/tests remained unchanged. Its expected blocked feature outcome completes the handoff scenario.

Every AP task is complete. No material acceptance gaps remain; DD is downstream.

Evidence limits: This review was read-only and executed no verification commands. Earlier fixture copies predate only the unrelated GC/RPD wording restorations; exercised rules are unchanged, and final wording received independent contract review. Behavioral runs sample compliance. Only text reduction was measured; no model-quality or latency gain was established.

VR risk: non-low — Broad contract rewording and the header-policy change affect the consumer workflow contract.  
VR review round: 1; reviewer: new  
VR passed: all acceptance criteria complete

## Notes

No commit or publication was performed. The installed skill continues to resolve directly to the
repository through the existing symlink.
