# Plan: Risk-Based CR Delegation

## Goal

Allow the primary agent to complete evidence-backed low-risk CR while preserving independent review
for every uncertain or non-low-risk CR and leaving the review standard unchanged.

## Current Context

- `skills/rpd/SKILL.md` currently permits primary-agent AR only for a strict low-risk plan but
  requires independent CR and VR whenever delegation is available.
- The current AR criteria already name the architecture and operational risk areas needed for a
  conservative CR classifier. CR needs implementation-specific evidence: localized stable diff,
  existing pattern, unchanged public and operational contracts, reversibility, expected behavior,
  and verification.
- `README.md` mirrors the unconditional CR rule and the primary-agent disclosure only names
  delegation-unavailable and low-risk AR cases.
- `CHANGELOG.md` records behavioral contract releases. Risk-based selection alone is compatible, but
  the new `CR blocked` terminal result and post-escalation no-fallback rule expand the caller-visible
  contract and require a major version.
- `.docs/tests/test-tier0-static-contracts.md` Scenario 0.7 already extracts the delegation contract
  and asserts disclosure, isolation, reuse, and stable review guarantees. It is the right place to
  assert risk-based CR parity.
- `.docs/tests/test-tier2-evidence-integrity.md` currently provisions an independent reviewer for the
  localized direct-path fixture and requires `assert_cr_final`. Under the new contract that fixture
  should exercise primary-agent low-risk CR, while the planned security fixture continues to prove
  independent CR evidence integrity.
- `.docs/tests/README.md` reports Tier 2 as two agents plus four reviewers; removing the direct case's
  reviewer reduces the expected reviewer count to three. It also overstates Tier 2 as proving every
  claimed pass against an independently reviewed snapshot and currently triggers Tier 1 for any
  command-contract edit even when routing, authorization, and stage order are unchanged.
- `AGENTS.md` requires syncing the complete `skills/rpd/` directory to
  `~/.agents/skills/rpd/` after editing the installable skill.

## Decisions

- Reuse the existing low-risk risk-area list, but classify CR against the implemented stable diff
  rather than the plan. Require criterion-by-criterion repository evidence in the CR result;
  uncertainty or debate selects independent review.
- Keep primary-agent preflight for AR and add explicit CR classification before reviewer selection.
- Permit primary-agent CR only when every criterion passes. Rejected: automatic exceptions for small
  diffs, documentation-only changes, test-only changes, or a particular model.
- Require every CR result to state `CR risk classification: low-risk|non-low-risk` and six non-empty
  evidence lines covering localized change, existing pattern, public and operational contracts,
  reversibility, expected behavior, and verification. Tier 2's direct fixture asserts this runtime
  evidence rather than only the absence of a reviewer log.
- Reclassify primary-agent CR after every fix. If a later snapshot becomes non-low-risk, start a
  clean-context independent reviewer and name the replacement condition in the round disclosure. If
  no eligible independent reviewer can start or continue after escalation, block the stage rather
  than falling back. If any round already used an independent reviewer, reuse it for all later rounds
  and never downgrade that stage to primary-agent review even when the new snapshot appears low-risk.
- When CR blocks for lack of an eligible independent reviewer, report
  `CR blocked: <reason>` instead of either completed-review success phrase. Preserve the latest risk
  classification, six evidence lines, and last completed-round disclosure; do not increment the
  round or claim a reviewer for an evaluation that never ran.
- Treat each primary-agent CR evaluation as read-only. A discovered finding invalidates that
  evaluation before the primary agent edits; the changed snapshot starts a new classified round.
- Keep VR independently reviewed whenever delegation is available. AR keeps its current low-risk
  exception. Independent CR keeps clean context, read-only operation, reviewer reuse, full reruns,
  and snapshot-integrity rules.
- Primary-agent low-risk CR uses the existing round disclosure with
  `reviewer: not applicable (primary-agent review)`. It still runs the complete CR checklist and
  loops after fixes; independence changes, not the pass standard.
- Update Tier 2's direct fixture to assert no CR reviewer was spawned and the primary-agent disclosure
  plus all six classification evidence lines were emitted. Keep `assert_cr_final` on the planned
  security fixture, where independent CR remains mandatory.
- Narrow the Tier 1 trigger in `.docs/tests/README.md` to intent routing, stage selection,
  authorization, or stage-order/terminus changes. Reviewer selection inside an unchanged CR stage is
  covered by Tier 0 contract parity and Tier 2 execution; running thirteen routing agents would not
  exercise the changed branch.
- State Tier 2's evidence boundary honestly: the low-risk direct fixture proves verification digest,
  classification evidence, disclosure, and absence of reviewer delegation, but not independent
  snapshot attestation. The security fixture retains independent snapshot proof for non-low-risk CR.
- Add one Tier 2 transition-conformance scenario with two prepared case roots and one fresh execution
  agent. The escalation root copies `public-api-bug`, commits the broken baseline, applies the public
  `status` to `state` fix, and records a prior primary-agent round-1 disclosure. The sticky root copies
  `internal-change`, commits its baseline, applies a low-risk source-comment fix, and records a prior
  independent round-1 disclosure. Both run their fixture tests before dispatch.
- Control reviewer availability through the actual collaboration surface: fill every available
  subagent slot with waiting sentinel agents, release exactly one slot, dispatch the fresh transition
  agent into it, and keep the remaining sentinels active until both results are saved. The execution
  agent can inspect both roots and write only the two result logs, but no reviewer slot is available.
  Assertions require escalation to report non-low-risk and preserve the round-1 primary disclosure;
  sticky review to report low-risk and preserve the round-1 independent disclosure; both to emit
  `CR blocked`, omit any round-2 disclosure, and leave both roots unchanged.
- Give every sentinel an exact repeated one-hour `wait_agent` loop and verify each retained sentinel
  has a running turn. Start the transition agent behind a follow-up gate; release it only after
  `list_agents` confirms the transition turn and every retained sentinel turn are running. Record
  total slots `C`, peak occupied slots `C`, retained sentinels `C - 2`, and one transition agent;
  require `C >= 3` and at least one retained sentinel.
- Wrap the capacity probe and transition dispatch in unconditional cleanup. On success or any setup,
  dispatch, agent, or assertion failure, interrupt every sentinel and the transition agent if still
  active, then verify zero sentinel turns remain running before later CR or VR work. Interrupted
  agents may remain addressable; they must not consume a running slot. Record the capacity equations,
  pre-release running-status evidence, and zero-running cleanup result in Tier 2 guidance.
- Bump `3.7.0` to `4.0.0`. No workflow diagram change is needed because stage order is unchanged.
- E2E coverage is required because reviewer selection is an externally observable workflow contract.
  Use the existing consolidated Tier 0 and Tier 2 specifications rather than creating a fragmented
  per-story test file. Execute the relevant Tier 0 scenarios and the full Tier 2 suite because this
  change alters a review gate.

## Phased Tasks

### Phase 1 - Contract and evidence scope

- [x] Inspect `skills/rpd/SKILL.md` Independent Review Delegation and CR sections to identify the
      unconditional CR rule, low-risk AR precedent, disclosure behavior, and preserved guarantees.
- [x] Inspect `README.md`, `CHANGELOG.md`, `.docs/tests/test-tier0-static-contracts.md`,
      `.docs/tests/test-tier2-evidence-integrity.md`, and `.docs/tests/README.md` for mirrored or
      executable assumptions about mandatory independent CR.
- [x] Record that file count, diff size, documentation-only scope, test-only scope, and model identity
      are insufficient classifiers and must not become shortcuts.

### Phase 2 - Skill reviewer-selection contract

- [x] Update `skills/rpd/SKILL.md` Core Principles and Independent Review Delegation so AR and CR use
      evidence-backed low-risk classification while VR remains independently reviewed.
- [x] Add CR-specific low-risk criteria and require criterion-by-criterion evidence in the CR result;
      make false, uncertain, unsupported, or debatable criteria select independent review.
- [x] Update the CR command section and primary-agent round disclosure to cover low-risk CR without
      weakening the checklist, review loop, or exact terminal phrases.
- [x] Define primary-agent rerun reclassification, escalation to a new independent reviewer, sticky
      reuse after any independent round, and read-only evaluation separated from fixes.
- [x] Define blocked CR reporting so reviewer unavailability cannot produce a false pass/fixed phrase
      or a fabricated review-round disclosure.
- [x] Bump the installable skill version from `3.7.0` to `4.0.0`.

### Phase 3 - Repository documentation parity

- [x] Update `README.md` reviewer-selection notes and version so low-risk CR, non-low-risk independent
      CR, unconditional independent VR, and the primary-agent disclosure match the skill.
- [x] Add a `4.0.0` CHANGELOG entry explaining the latency tradeoff, strict low-risk evidence gate,
      unchanged review standard, and preserved independent-review guarantees.
- [x] Confirm `rpd-loop.png` remains unchanged because reviewer selection does not alter stage order.

### Phase 4 - Contract and evidence-tier tests

- [x] Extend `.docs/tests/test-tier0-static-contracts.md` to assert version parity, CR low-risk
      criteria, evidence reporting, uncertainty fallback, non-low-risk independent review, unchanged
      VR independence, and README/CHANGELOG parity.
- [x] Update `.docs/tests/test-tier2-evidence-integrity.md` so the localized direct fixture expects
      primary-agent low-risk CR with no CR review log and asserts all six risk-evidence fields, while
      the security fixture retains independent AR, CR, and VR evidence assertions.
- [x] Update `.docs/tests/README.md` cost and reviewer counts to match the revised Tier 2 contract.
- [x] Update `.docs/tests/README.md` and Tier 2's introduction/direct scenario so they no longer
      overclaim independent snapshot proof for primary-agent low-risk CR, and narrow Tier 1's trigger
      to changes that actually affect routing, authorization, stage selection, or stage order.
- [x] Add a Tier 2 transition-conformance scenario that prepares `public-api-bug` escalation and
      `internal-change` sticky-review roots, saturates collaboration capacity with sentinels, executes
      both histories through one fresh agent, and asserts blocked output, preserved completed-round
      disclosure, unchanged roots, suppression of a fabricated round 2, unconditional sentinel
      interruption, pre-release running-status evidence, capacity-accounting equations, and zero
      running sentinel turns afterward.

### Phase 5 - Verification and installation sync

- [x] Run the complete Tier 0 static-contract suite and record its exit status.
- [x] Run the full Tier 2 evidence-integrity suite and record that the direct fixture used
      primary-agent low-risk CR, the security fixture retained independent AR, CR, and VR, and the
      transition-conformance case blocked both unavailable-reviewer histories correctly.
- [x] Run the skill frontmatter validator and `git diff --check`.
- [x] Sync the complete `skills/rpd/` directory to `~/.agents/skills/rpd/` with stale-file removal and
      verify recursive parity.
- [x] Confirm Tier 0 structurally asserts the revised Tier 2 expectations and the executed Tier 2
      evidence matches those expectations.

## Validation

- Extract and run every scenario from `.docs/tests/test-tier0-static-contracts.md` with Bash fail-fast
  semantics; expected result is exit 0 for the complete Tier 0 suite.
- Run `python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/rpd`; expected
  result is successful skill validation.
- Run `git diff --check`; expected result is exit 0 with no output.
- Sync with `rsync -a --delete skills/rpd/ ~/.agents/skills/rpd/`, then run
  `diff -ru skills/rpd ~/.agents/skills/rpd`; expected result is no output.
- Do not execute Tier 1 because intent routing, authorization, stage selection, and stage order do
  not change. Update `.docs/tests/README.md` so its trigger reflects that boundary; Tier 2 uses the
  latest passing Tier 1 baseline when those behaviors are unchanged.
- Execute `.docs/tests/test-tier2-evidence-integrity.md` with its Common Execution Procedure and the
  sentinel-capacity procedure in Scenario 2.3. Expected
  result: the direct fixture completes CR with primary-agent low-risk evidence and no CR reviewer;
  the security fixture completes independently reviewed AR, CR, and VR; the transition-conformance
  case blocks both histories without fabricating a round; all assertions pass.

## Rollback / Risk

- Risk: agents self-classify meaningful changes as low-risk to save time. Mitigation: every criterion
  requires concrete repository evidence, any uncertainty selects independent review, and file count
  and change type are explicitly insufficient shortcuts.
- Risk: removing the direct fixture's reviewer weakens Tier 2 anti-fabrication coverage. Mitigation:
  the security fixture retains independent `assert_cr_final`; the direct fixture instead proves the
  new primary-agent branch and still requires verification evidence.
- Risk: README, skill, and tests drift on who owns review. Mitigation: Tier 0 extracts and asserts the
  reviewer-selection contract across artifacts.
- Rollback: revert the `4.0.0` blocked-result and no-fallback contract, remove the transition scenario,
  restore the previous Tier 2 reviewer counts and direct CR reviewer, and resync `skills/rpd/`; no
  schema, data, dependency, or generated artifact is involved.
