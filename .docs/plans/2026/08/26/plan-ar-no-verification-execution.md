# AR Without Verification Execution Plan

## Goal

Make AR judge the validation strategy without executing it, eliminating duplicated pre-implementation
verification while preserving architecture and testability review.

## Current Context and Decisions

- AP already forbids tests, but AR only forbids source edits. That gap allows agents to execute tests
  and other verification commands during architecture review.
- Inspection and execution are different responsibilities. AR needs to inspect tests, scripts,
  configurations, and prior evidence to judge whether the plan is verifiable; SS, TT, and ET own
  execution.
- If feasibility genuinely depends on runtime evidence, AR should require a bounded first SS task with
  explicit decision criteria rather than run the command itself. The probe may be focused, but it must
  not absorb the full suites or E2E scenarios owned by TT and ET.
- A failed probe or material architecture change stops dependent implementation, updates the story
  artifacts, and reruns AR. Passing the initial AR does not pre-approve an architecture invalidated by
  later runtime evidence.
- No E2E spec is needed because this is an internal text contract with no executable user flow. The
  compact static contract is the durable prose regression check. The existing three Tier 2 scenarios
  remain general review regressions, and a new focused scenario must exercise the AR execution
  prohibition, bounded SS feasibility probe, and failure path back to AR.

## Tasks

- [x] Update the AR command in `skills/rpd/SKILL.md` with one compact inspection-versus-execution rule
      and route runtime feasibility evidence through a bounded first SS task with a failure path back
      to AR.
- [x] Add a concise matching note to `README.md` while preserving the skill as the normative contract.
- [x] Add focused assertions to `.docs/tests/test-tier0-static-contracts.md` that protect the AR
      execution prohibition and SS routing rule.
- [x] Extend `.docs/tests/test-tier2-evidence-integrity.md` with one isolated AR-to-SS scenario. Seed
      separate sentinels for a forbidden full test command and an allowed failing feasibility probe;
      require AR to leave both absent, then require SS to run only the probe, stop dependent work,
      update the story artifacts, and rerun AR without running the full suite or E2E.
- [x] Run Tier 0, the skill validator, size limits, and `git diff --check`.
- [x] Run the three existing Tier 2 dogfood scenarios and the focused AR-to-SS scenario after the
      contract stabilizes; do not run them during AR.
- [x] Sync the complete `skills/rpd/` directory to `~/.agents/skills/rpd/` and verify parity.

## Validation

- `sed -n '/^```sh$/,/^```$/p' .docs/tests/test-tier0-static-contracts.md | sed '1d;$d' | bash`
- `python3 /Users/esun/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/rpd`
- `test "$(wc -l < skills/rpd/SKILL.md)" -le 300`
- `test "$(wc -w < skills/rpd/SKILL.md)" -le 3500`
- `git diff --check`
- Execute Scenarios 2.1 through 2.4 in `.docs/tests/test-tier2-evidence-integrity.md` after the contract
  stabilizes and record their actual outcomes. Scenario 2.4 must prove the forbidden full-test
  sentinel remains absent while the focused-probe sentinel and return-to-AR path occur.
- `diff -ru skills/rpd ~/.agents/skills/rpd`

## Validation Results

- Tier 0 passed; `quick_validate.py` reported `Skill is valid!`; size limits and `git diff --check`
  passed; the repository and installed skill copies matched.
- Scenario 2.1 kept the localized direct fix on low-risk primary CR with focused and full tests passing,
  no story artifacts, and no E2E.
- Scenario 2.2 used an independent reviewer for this protected contract. CR fixed the Scenario 2.3
  procedure and passed on round 2 with the same reviewer.
- Scenario 2.3's corrected seed produced the intended all-whitespace finding; the focused fix and
  3/3 tests passed, and the same reviewer passed round 2.
- Scenario 2.4 left both sentinels absent during AR; SS ran only the failing probe, left the full-suite
  sentinel absent and source unchanged, updated the story artifacts, and returned to AR.

## Risk

This changes an installable workflow contract consumed by other agents. Over-broad wording could
prevent useful repository inspection or move unresolved architecture work into implementation, so
the rule must prohibit execution without weakening AR's review duties.
