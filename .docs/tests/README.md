# RPD Test Suite

Three tiers, ordered by cost. Run the cheap ones often; run the expensive one when the routing
contract or the review gates change.

| Tier | File | Agents | Runtime | Run it |
|---|---|---|---|---|
| 0 | [test-tier0-static-contracts.md](test-tier0-static-contracts.md) | 0 | seconds | every commit |
| 1 | [test-tier1-routing-decisions.md](test-tier1-routing-decisions.md) | 13 short | minutes | on any change to Intent Routing or a command contract |
| 2 | [test-tier2-evidence-integrity.md](test-tier2-evidence-integrity.md) | 2 + 4 reviewers | long | before a release, or when a review gate changes |

[test-helpers.md](test-helpers.md) holds the shared shell functions. Every tier extracts them with
the same one-liner; nothing else should define them.

## What each tier is for

**Tier 0** checks that the skill, the README, the CHANGELOG, and the packaged artifact all state the
same contract, and that the two shell helpers with real logic — `snapshot_hash` and
`assert_gwt_scenarios` — behave correctly. No model is involved, so it cannot flake and costs
nothing.

**Tier 1** checks the actual thesis: that natural-language requests route by implementation intent
and concrete risk rather than by diff size, and that explicit commands stay stage-scoped. Each agent
stops at the first review gate its route requires, so a planned case ends after REQ/AP and a direct
case ends after the edit. No reviewers are provisioned. The route is observable from three things:
which `.docs/` artifacts appeared, whether `src/**` changed, and the single `Gate:` line the agent
reports.

**Tier 2** checks that a claimed pass is a real pass. This is where the snapshot hashes, the
`.verification-ran` digest, and the completion-document ordering live. It runs two cases — one per
terminus — because the apparatus proves a property of the evidence chain, not of any particular
fixture, and running it six times proves the same property six times.

## Ordering

Tier 1 assumes Tier 0 passes; Tier 2 assumes both. A Tier 1 failure usually means the routing
contract changed. A Tier 2 failure usually means an agent claimed something it did not do, which is
the failure mode the whole apparatus exists to catch.

## What this replaces

The previous suite lived in `test-intent-based-routing.md` (1,883 lines) and
`test-planned-routing-dd.md` (271 lines). It ran 14 full-pipeline cases with reviewers, and its
[one recorded run](results/2026-07-28-partial-run.md) exhausted a monthly spend limit after verifying
3 of 13 cases without a single scenario failing.

Two things were dropped deliberately:

- **The prose-matching semantic assertions.** `assert_public_status_semantics`,
  `assert_security_auth_semantics`, and `assert_external_contract_semantics` were ~135 lines of Perl
  that regex-matched English wording in generated Given/When/Then documents, plus ~750 lines and 61
  decoy fixtures testing those regexes. They asserted phrasing, not behavior, and a correctly
  specified scenario worded differently would fail. Mutant testing in Tier 2 covers the behavior
  those assertions were reaching for, and `assert_gwt_scenarios` still enforces document structure.
- **Redundant full pipelines.** Scenarios 3, 5, and 6 each drove `AR → SS → TT → ET → VR → DD` to
  prove the same terminus, differing only in which risk condition selected planning. That predicate
  is now a Tier 1 assertion; the terminus is proven once, in Tier 2.
