# Plan: Durable Acceptance Criteria and Asserted 3.2.0 Contracts

## Goal

`REQ` warns authors off criteria pinned to literal values, and Scenario 15 fails if any contract
introduced in `3.2.0` is removed or reworded.

## Current Context

- `REQ`'s contract already requires criteria specific enough for `VR` to judge, and `VR` forbids
  weakening a criterion to check it off. The gap is authoring guidance, not enforcement.
- Scenario 15 already extracts `## Intent Routing` (byte-identical between `SKILL.md` and
  `README.md`), the `!!` section, the `SS` section, and per-command sections for `REQ`, `AP`, `AR`,
  and `DD`. New assertions should reuse those extractions.
- The `AR` and Conventions text is not extracted today; `AR` can reuse the existing per-command
  loop pattern, and Conventions needs a new extraction.
- The existing `! rg -Fi 'direct path'` guard on the `SS` section must keep passing; the fallback
  wording says "planned routing", so it is unaffected.
- Adding a `REQ` authoring rule changes skill behavior, so this is a minor bump to `3.3.0`.

## Decisions

- Phrase the `REQ` rule around the property versus the literal, using version pinning as the worked
  example, since both observed failures were version pins.
- Assert the termini from the shared Intent Routing extraction so one check covers both documents.
- Assert `AR blocked` from an `AR` section extraction rather than a whole-file search, so the
  assertion fails if the text moves out of the `AR` contract.
- Rejected: asserting the full sentence of each contract. Anchor on the labelled term and the
  load-bearing clause so ordinary editing does not produce false failures.
- Rejected: bumping to `3.2.3`. The `REQ` contract gains a rule, which is a behavior change.

## Phased Tasks

### Phase 1 - REQ authoring rule

- [x] Add a bullet to the `REQ` contract in `skills/rpd/SKILL.md` directing authors to name the
      property rather than a literal value, with version pinning as the example.
- [x] Add the matching note to the `README.md` Notes list.

### Phase 2 - Scenario 15 assertions

- [x] Assert `AR blocked` and its not-a-pass clause from an extracted `AR` section.
- [x] Assert `Planned-routing terminus` with its `SS(+CR*) → TT → ET? → VR*` sequence and
      `Direct-path terminus` from the shared Intent Routing extraction.
- [x] Assert `Sequence notation` and `Command-like intent` from a new Conventions extraction.
- [x] Assert the `SS` no-plan fallback from the existing `SS` section extraction.
- [x] Assert `done-{name}.md` in both the `DD` contract line and the documentation-structure
      diagram.

### Phase 3 - Version and documentation

- [x] Bump `skills/rpd/SKILL.md` and `README.md` to `3.3.0` and update the Scenario 15 version
      assertion.
- [x] Record the release in `CHANGELOG.md`.

### Phase 4 - Verification

- [x] Run the Scenario 15 static block and require exit 0.
- [x] Run the skill validator and require `Skill is valid!` with the description inside the
      character limit.
- [x] Confirm each new assertion fails when its contract text is removed, so the coverage is real.

## Validation

- Scenario 15 static block exits 0 with the network install sub-step skipped.
- The skill validator prints `Skill is valid!`.
- Every new assertion is negative-tested against a mutated copy of `SKILL.md`; each must fail when
  its target text is deleted.
- The pre-existing `! rg -Fi 'direct path'` guard on the `SS` section still passes.
- `git diff --check` exits 0.

## Rollback / Risk

- Documentation-only; revert the commit to restore the previous contract text.
- The main risk is an over-tight assertion that fails on innocuous rewording. Mitigated by
  anchoring on labelled terms and the load-bearing clause rather than whole sentences.
- Negative testing is done on a temporary copy so the working tree is never mutated.

## Verification Evidence

Recorded 2026-07-28.

- Scenario 15 static block: exit 0.
- Validator: `Skill is valid!`.
- Negative test: each of the new assertions failed against a mutated copy with its target text
  removed, and all passed against the real file.
- `git diff --check`: clean.
