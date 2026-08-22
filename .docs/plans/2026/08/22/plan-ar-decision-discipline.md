# AR Decision Discipline Plan

## Goal

Turn AR from passive flaw detection into a concise decision gate that challenges weak thinking,
clarifies the important choice, and clears the path to implementation.

## Current Context and Decisions

- `skills/rpd/SKILL.md` already requires AR to review and fix blocking document flaws, but it does not
  define how to challenge a weak decision or help the user choose when a consequential choice remains.
- The general RPD principles already discourage unnecessary questions. AR only needs a compact
  stage-specific instruction to challenge weak decisions, offer useful options, and stop when clear.
- Preserve AR's terminal verdicts. A genuinely blocking user decision still produces the existing
  blocked verdict, but the interaction needs no new fields, evidence inventory, or decision matrix.
- Adapt Grill Me's decision discipline, not its literal three-label response template. The AR output
  remains compact and compatible with its current risk, round, and verdict lines.
- Release the additive AR behavior as minor version `3.9.0`; tag `v3.9.0` after the scoped commit and
  push the branch and tag to `origin` as explicitly authorized by the user.
- No story E2E spec is needed: this changes an internal text contract and has no executable user flow
  or observable runtime boundary. Tier 0 covers the durable contract; the existing Tier 2 scenarios
  preserve cross-cutting review behavior without adding a bespoke audit harness.

## Tasks

- [x] Update the AR command in `skills/rpd/SKILL.md` with one compact rule: challenge weak or unclear
      requirements and plans, offer viable options with tradeoffs and a recommendation when needed,
      ask only the next necessary question, and stop when implementation is clear.
- [x] Update `README.md` with a short explanation of AR's decision behavior and preserve the normative
      role of the installable skill.
- [x] Add focused durable assertions to `.docs/tests/test-tier0-static-contracts.md` and document the
      behavior change in `CHANGELOG.md`.
- [x] Run the three compact Tier 2 scenarios in `.docs/tests/test-tier2-evidence-integrity.md` after
      the contract stabilizes. Record actual outcomes without inventing findings.
- [x] Sync the complete `skills/rpd/` directory to the global installation with stale removal and
      verify byte parity before VR.
- [x] Update the skill, README, and Tier 0 version assertions to `3.9.0`; move the AR behavior entry
      from the `3.8.0` changelog section into a new `3.9.0` section; resync the complete installable
      directory and verify parity.
- [x] Run the Tier 0 block, skill validator, size limits, version checks, and `git diff --check` for
      the `3.9.0` release state.

## Validation

- `sed -n '/^```sh$/,/^```$/p' .docs/tests/test-tier0-static-contracts.md | sed '1d;$d' | bash`
- `python3 /Users/esun/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/rpd`
- `test "$(wc -l < skills/rpd/SKILL.md)" -le 300`
- `test "$(wc -w < skills/rpd/SKILL.md)" -le 3500`
- `git diff --check`
- `rg -Fq '3.9.0' skills/rpd/SKILL.md README.md` passes; the changelog contains
  `## [3.9.0] - 2026-08-22`.
- Execute Scenarios 2.1 through 2.3 in `.docs/tests/test-tier2-evidence-integrity.md`; expect their
  stated risk, reviewer, read-only, and rerun behavior.
- `diff -ru skills/rpd ~/.agents/skills/rpd`

## Delivery

After VR, confirm the DD completion note and acceptance checkboxes reflect the `3.9.0` release. Then
commit only this story's release files, create annotated tag `v3.9.0`, push `main` and the tag to
`origin`, and confirm the remote refs.

## Risk

Over-specifying the interaction would turn AR into the process burden this change is meant to avoid.
Keep the contract short, judgment-led, and compatible with the existing verdicts.
