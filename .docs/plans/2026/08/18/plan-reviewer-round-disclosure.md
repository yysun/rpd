# Plan: Disclose Reviewer Round and Reuse

## Goal

Every AR, CR, and VR stage result states the round within that stage and whether that round's
reviewer was reused or newly started, additively, without changing the exact terminal verdict
phrases or weakening the reuse obligation.

## Current Context

- `skills/rpd/SKILL.md` `## Independent Review Delegation` already carries the obligation
  ("Reuse the same independent subagent for every rerun within one AR, CR, or VR stage while it
  remains available and independent."), the rerun-scope rule ("do not limit the review to prior
  findings"), the replacement conditions ("unavailable, has contributed to artifacts under review,
  or modified the reviewed snapshot"), the no-findings-cap rule, and the primary-agent fallback.
  Nothing requires reporting whether reuse happened.
- The three terminal phrases live in the `AR`, `CR`, and `VR` command sections and are asserted
  verbatim by Tier 0 (`AR blocked: <flaw and why it cannot be resolved in place>`) and by Tier 2
  result-log assertions (`AR: PASS — ...`, `CR: PASS — ...`, `VR: PASS — ...`, which are the
  harness's own format, not the skill's). Callers parse one verdict line per stage and treat other
  lines as inert, so disclosure must be a separate line that contains no verdict wording.
- `README.md` mirrors the delegation rules as `## Notes` bullets, including the three reuse bullets
  added by the `reuse-reviewer-rounds` story. `README.md:8` and `skills/rpd/SKILL.md` each carry one
  `**Version:** \`3.6.0\`` line.
- `CHANGELOG.md` records contract changes per version; its preamble sentence
  "`3.6.0` is an owner-directed compatibility exception" is asserted by Tier 0 and must survive.
- `.docs/tests/test-tier0-static-contracts.md` Scenario 0.3 pins both `3.6.0` version literals and a
  changelog content regex; Scenario 0.6 asserts that Tier 2 still carries named assertions. Tier 0 is
  the executable static-contract check and runs offline apart from `npx skills@latest add`.
- `.docs/tests/test-tier2-evidence-integrity.md` runs two real execution agents (`internal-bug`,
  direct, CR only; `security-fix`, planned, AR/CR/VR) and asserts exact lines in each agent's saved
  `*-result.log`. Its fixed evidence suffix mandates harness lines; a line mandated only by
  `SKILL.md` is the honest behavioral check for a new contract requirement.
- `.docs/tests/test-helpers.md` owns the two helpers with real logic; Tier 0 Scenario 0.5 tests their
  soundness. A new plain `rg` assertion needs no helper and adds no helper-soundness obligation.
- `AGENTS.md` requires syncing `skills/rpd/` to `~/.agents/skills/rpd/` after any change to the
  installable skill. `~/.claude/skills/rpd/SKILL.md` is the same inode, so one sync covers both.
- Known unknown: Tier 2 requires two long execution-agent runs plus reviewers and cannot be executed
  as part of this story; its new assertions ship as contract, verified statically by Tier 0.

## Decisions

- Disclosure is one additive line per stage result with a fixed shape:
  `<STAGE> review round: <n>; reviewer: <reused|new|not applicable>`. Round 1 is the stage's first
  review; each rerun increments. The line carries no verdict word, so a caller still reads the
  verdict from the terminal phrase alone and an evidence validator treats the line as inert.
- `reviewer: new` at round 2 or later must name the permitted replacement condition in parentheses,
  drawn from the conditions the contract already permits. Round 1 needs no condition because there is
  no previous reviewer to replace.
- Primary-agent review — delegation unavailable, or low-risk AR completed by the primary agent —
  reports `reviewer: not applicable (primary-agent review)`. Reporting `reused` there would claim a
  reviewer that never existed.
- State explicitly that disclosure is a report and not a budget. Rejected: adding a round cap, a
  findings cap, or a delta-scoped rerun; the REQ names all three as non-goals, and a cap creates
  pressure to reclassify a blocking finding to stay under it.
- Rejected: mechanically enforcing reuse from inside the contract, adding a feature flag or opt-out
  for disclosure, and adding a fourth terminal phrase or a variant verdict line.
- Version moves `3.6.0` → `3.7.0`. The change adds a required report to every review stage and is
  backward-compatible for callers that parse the verdict line, which is a minor bump.
- E2E coverage is required: this changes the stage-result contract that callers parse. It ships in
  the existing tiered suite rather than a new `.docs/tests/test-reviewer-round-disclosure.md`,
  because the suite was deliberately consolidated into tiers and a per-story file would fragment it.
  Tier 0 gains a static parity scenario that is executable now; Tier 2 gains the behavioral
  result-log assertions that run before a release. `ET` runs against
  `.docs/tests/test-tier0-static-contracts.md`.
- No change to `rpd-loop.png`: the stage sequence is unchanged.

## Phased Tasks

### Phase 1 - Discovery and scope lock

- [x] Re-read `## Independent Review Delegation` in `skills/rpd/SKILL.md` and confirm the exact
      wording of the reuse obligation, the replacement conditions, the no-findings-cap rule, the
      full-checklist rerun rule, and the primary-agent fallback that disclosure must leave intact.
- [x] Confirm the three terminal phrases in the `AR`, `CR`, and `VR` sections of
      `skills/rpd/SKILL.md` and record them verbatim so Phase 4 can assert they are byte-unchanged.
- [x] Record the non-goals — round cap, findings cap, delta-scoped rerun, non-gating advisory
      findings, mechanical reuse enforcement — so no phase introduces them.

### Phase 2 - Skill contract change

- [x] Add disclosure rules to `## Independent Review Delegation` in `skills/rpd/SKILL.md`
      immediately after the reuse, full-rerun, and replacement-condition bullets: the round count,
      the exact line shape `<STAGE> review round: <n>; reviewer: <reused|new|not applicable>`, and
      the rule that it is reported on its own line separate from the terminal phrase.
- [x] Add the `reviewer: new` rule to the same section requiring a named permitted replacement
      condition at round 2 or later: previous reviewer unavailable, contributed to the artifacts
      under review, or modified the reviewed snapshot.
- [x] Add the primary-agent rule to the same section: report the round and
      `reviewer: not applicable (primary-agent review)` when delegation is unavailable or a low-risk
      AR was completed by the primary agent, and never report a reused reviewer for a round no
      independent subagent performed.
- [x] Add the scope-guard sentence to the same section stating that disclosure imposes no round
      limit, no findings cap, and no fix-only rerun, does not weaken the reuse obligation, and does
      not change that an unresolvable blocking finding stops the loop.
- [x] Add one disclosure bullet to each of the `AR`, `CR`, and `VR` command sections in
      `skills/rpd/SKILL.md`, directly after that command's terminal-phrase bullet, requiring the
      disclosure line alongside the unchanged phrase.
- [x] Verify by diff that the three terminal-phrase bullets in `skills/rpd/SKILL.md` are unchanged
      and that the frontmatter description is unchanged.
- [x] Update the `**Version:**` line in `skills/rpd/SKILL.md` to `3.7.0`.

### Phase 3 - README and CHANGELOG parity

- [x] Add `## Notes` bullets to `README.md` after the existing reuse bullets stating the same
      disclosure line shape, the `new` replacement-condition requirement, the primary-agent
      `not applicable` case, and that disclosure adds no round or findings limit and leaves the
      verdict phrases unchanged.
- [x] Update the `**Version:**` line in `README.md` to `3.7.0`.
- [x] Add a `## [3.7.0] - 2026-08-18` entry to `CHANGELOG.md` describing the round-and-reuse
      disclosure, its additive line shape, the unchanged terminal phrases, and the explicit absence
      of a round or findings cap; leave the `3.6.0` preamble exception sentence intact.

### Phase 4 - Static and evidence-tier coverage

- [x] Update `.docs/tests/test-tier0-static-contracts.md` Scenario 0.3 to assert
      `**Version:** \`3.7.0\`` in both `skills/rpd/SKILL.md` and `README.md`, and add a changelog
      assertion that the `3.7.0` entry documents round and reuse disclosure.
- [x] Add Scenario 0.7 to `.docs/tests/test-tier0-static-contracts.md` asserting, against the
      extracted delegation section and the `AR`/`CR`/`VR` sections: the disclosure line shape, the
      three reviewer states, the named replacement conditions, the primary-agent `not applicable`
      case, the no-cap sentence, one disclosure bullet per review command, and the same statements
      present in `README.md`.
- [x] Extend Scenario 0.7 to assert that the three terminal phrases still appear verbatim in
      `skills/rpd/SKILL.md`, that the reuse obligation sentence is still present verbatim, and that
      the disclosure line shape contains none of `passed`, `fixed`, `blocked`, or `incomplete`.
- [x] Extend Scenario 0.7 to assert that the preserved-guarantee sentences are still present verbatim
      in `skills/rpd/SKILL.md`: the unresolvable-blocking-finding stop rule, the no-inherited-
      authoring-context rule, the serial-gate rule, the read-only rule, the no-findings-cap and
      full-checklist rerun rules, and the primary agent's ownership of edits and the final pass
      decision.
- [x] Add result-log assertions to `.docs/tests/test-tier2-evidence-integrity.md` Scenario 2.1 (CR)
      and Scenario 2.2 (AR, CR, VR) requiring a line matching
      `^(AR|CR|VR) review round: [0-9]+; reviewer: (reused|new|not applicable)` for each phase that
      case actually runs, and note in each scenario's expected behavior that the line is mandated by
      `SKILL.md` rather than by the evidence suffix.
- [x] Extend `.docs/tests/test-tier0-static-contracts.md` Scenario 0.6 so it asserts Tier 2 still
      carries the new disclosure assertions.

### Phase 5 - Verification, sync, and evidence

- [x] Run Tier 0 Scenarios 0.1 through 0.7 from a script file and record the exact commands and exit
      status, including the `quick_validate.py` skill validation and `git diff --check`.
- [x] Sync `skills/rpd/` to `~/.agents/skills/rpd/` per `AGENTS.md` and confirm the installed
      `SKILL.md` is byte-identical to the repository copy.
- [x] Record final evidence that every REQ acceptance criterion is satisfied, and state explicitly
      that Tier 2 was not executed because it requires two long execution-agent runs plus reviewers.

## Validation

- Tier 0 static contracts: execute each `sh` block of
  `.docs/tests/test-tier0-static-contracts.md` (Scenarios 0.1-0.7) as a script file with `set -e`;
  expected evidence is exit 0 per scenario, reported per scenario.
- Skill validation: `python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/rpd`;
  expected evidence is the validator's success output.
- Whitespace: `git diff --check`; expected evidence is exit 0 with no output.
- Parity check: `diff ~/.agents/skills/rpd/SKILL.md skills/rpd/SKILL.md`; expected evidence is no
  output after the sync.
- Not run: Tier 1 and Tier 2. Tier 1 covers intent routing, which this story does not touch. Tier 2
  requires two execution agents and four reviewers; its new assertions are verified statically by
  Tier 0 Scenario 0.6 and must be reported as shipped-but-unexecuted.

## Rollback / Risk

- Risk: a disclosure line that a caller's validator mistakes for a verdict. Mitigated by the fixed
  line shape, the no-verdict-word assertion in Scenario 0.7, and keeping the terminal-phrase bullets
  byte-unchanged.
- Risk: a reader infers a round budget from a reported round number. Mitigated by the explicit
  no-cap sentence in the skill and the README, and by a Tier 0 assertion on that sentence.
- Risk: Tier 0 Scenario 0.1 requires network access for `npx skills@latest add`. If it is
  unavailable, report the scenario as blocked rather than claiming a pass.
- Rollback: the change is confined to `skills/rpd/SKILL.md`, `README.md`, `CHANGELOG.md`, and two
  Tier documents. Reverting the commit and re-syncing `~/.agents/skills/rpd/` restores `3.6.0`
  behavior; no data, schema, or migration is involved.
