# Plan: Fix Findings From the First Full Intent-Routing E2E Run

## Goal

Every confirmed finding from the 13-case E2E run is closed: the skill contracts are strengthened
where independent agents recurringly deviated, the harness's reviewed-snapshot invariant is
satisfiable by construction for planned-path scenarios, and stale assertions match the current
skill.

## Current Context

- Run evidence: 8/13 cases passed against v3.3.0. `public-api-bug`, `security-fix`/
  `security-fix-clean`, and `external-contract` each omitted `AR`'s mandated report phrase and
  failed `assert_cr_final`. `external-contract` and `security-fix-clean` each skipped an E2E spec
  for a story SKILL.md already names (external integration, auth). `uncertain-profile-bug` stopped
  after `REQ` alone instead of completing `AP` and `AR`. `bang-restart`'s reconciled REQ dropped a
  literal value (separate, not addressed here).
- `assert_cr_final` in the E2E suite computes `snapshot_hash()` over the whole case tree and requires
  it to equal the CR reviewer's recorded snapshot. `VR` runs after `CR` and, per the skill, updates
  REQ acceptance-criteria checkboxes — a write only the primary agent can make, since independent
  reviewers work read-only. That write happens after CR's snapshot was taken, so the invariant fails
  whenever a scenario reaches `VR`, regardless of agent behavior.
- `public-api-bug`'s failure had a second, independent cause: the primary agent applied a source
  comment-block edit after both CR and VR had passed, justified as "editorial," and never reran
  either reviewer. The skill's exemption for "editorial corrections" was broad enough to cover this.
- Two commits landed on `skills/rpd/SKILL.md` during the run (`653c534`, `17d878b`), moving the
  version from 3.3.0 to 3.4.0 and reverting the `done-{name}.md` completion-doc prefix. Confirmed
  intentional by the user. Scenario 11's assertions still expected the reverted prefix.
- `SKILL.md`'s Intent Routing section must stay byte-identical to `README.md`'s (Scenario 15).
  `AP`, `AR`, `CR`, `VR`, and Independent Review Delegation sections are each independently
  extractable by Scenario 15's existing perl blocks; `CR` and `VR` were not yet extracted.

## Decisions

- Add `CR` and `VR` mandated report phrases in the same two-outcome style as `AR`
  (`<stage> passed: ...` / `<stage> fixed: ...` for CR, `<stage> passed: ...` / `<stage> incomplete:
  ...` for VR, since VR's failure mode is incompleteness rather than a fixable-and-rerun cycle in
  the same sense as AR/CR) rather than inventing a different shape, so the three stages stay
  consistent and the new strings are trivial to remember alongside the existing one.
- State the verbatim/non-interchangeable requirement inline on all three phrases rather than as a
  separate rule elsewhere, so it travels with the instruction it modifies.
- Fix the harness's `assert_cr_final` invariant by excluding `.docs/reqs` from the shared
  `snapshot_hash()` function, used identically by the primary agent and every independent reviewer,
  rather than by weakening the assertion itself or exempting VR-driven scenarios from the check.
  This keeps the invariant meaningful — it still catches an unreviewed source, test, or plan edit,
  which is what caught `public-api-bug`'s real defect — while making it satisfiable for the one
  legitimate case.
- Narrow the "editorial corrections" exemption to exactly the REQ-checkbox case, rather than
  removing the exemption outright (which would make VR's own checkbox-update duty impossible to
  perform without an always-required, likely-vacuous rerun) or leaving it as vague prose (which is
  what let the public-api-bug edit through).
- Reject inventing a new "E2E applicability" checklist. The existing category list (user-facing
  flows, auth, routing, payments, data entry, cross-system integrations, regression-prone paths) is
  correct; the gap is that agents evaluated the current implementation's surface instead of the
  story's subject. One clarifying sentence closes that gap without expanding the list.
- Reject relaxing the bang-restart reconciled-REQ content assertion. It caught a real regression
  (the literal `"ready"` value was paraphrased away); the fix belongs to a future story about
  reconciliation quality, not this one.

## Phased Tasks

### Phase 1 - Skill contract edits

- [x] Add the uncertain-path AP/AR completion rule to `skills/rpd/SKILL.md`'s Intent Routing
      section, immediately after the existing "use planned routing" bullet.
- [x] Mirror the identical bullet into `README.md`'s Intent Routing section so the two stay
      byte-identical.
- [x] Narrow the independent-review rerun exemption in `skills/rpd/SKILL.md`'s Independent Review
      Delegation section to the REQ-checkbox case only, removing the "editorial corrections" phrase.
- [x] Mirror the equivalent rule into `README.md`'s Notes list.
- [x] Strengthen `AR`'s mandated-phrase bullet in `skills/rpd/SKILL.md` with the verbatim/
      non-interchangeable clause.
- [x] Add `CR`'s mandated-phrase bullet to `skills/rpd/SKILL.md`'s `CR` command section with the
      same clause.
- [x] Add `VR`'s mandated-phrase bullet to `skills/rpd/SKILL.md`'s `VR` command section with the
      same clause.
- [x] Add the E2E classify-by-subject clarification to `skills/rpd/SKILL.md`'s `AP` command section,
      immediately after "Skip E2E specs for pure internals unless requested."
- [x] Update `README.md`'s workflow section (E2E paragraph) and Notes list to reflect the new CR/VR
      phrases, the narrowed exemption, and the E2E classification clarification.
- [x] Bump `skills/rpd/SKILL.md` and `README.md` to `3.5.0`.

### Phase 2 - Harness fixes

- [x] Update the shared `snapshot_hash()` helper in `.docs/tests/test-intent-based-routing.md` to
      exclude `.docs/reqs` from the hashed tree.
- [x] Update the identical inline snapshot-hash command embedded in the fixed evidence suffix (the
      command every reviewer independently runs) to match, and add a sentence explaining why
      `.docs/reqs` is excluded.
- [x] Update the Common Execution Procedure's prose (step 9) to state the exclusion and its reason.
- [x] Update Scenario 11's two completion-doc assertions from `done-public-status.md` to
      `public-status.md`.

### Phase 3 - Static coverage for every new contract

- [x] Assert the uncertain-path AP/AR bullet in both the extracted `SKILL.md` and `README.md` Intent
      Routing text.
- [x] Assert the E2E classify-by-subject text in the extracted `AP` section.
- [x] Assert the narrowed exemption's key phrases in both the extracted Independent Review
      Delegation text and the extracted `README.md` Notes text, and assert the removed "editorial
      corrections" phrase is gone from `SKILL.md`.
- [x] Extract `CR` and `VR` command sections (not previously extracted) and assert their new
      mandated phrases.
- [x] Assert the verbatim/non-interchangeable clause is present in the `AR`, `CR`, and `VR`
      extracted sections.
- [x] Bump the Scenario 15 version assertion to `3.5.0`.

### Phase 4 - Verification

- [x] Run the Scenario 15 static block and require exit 0.
- [x] Negative-test every new or changed assertion against a mutated copy of the relevant file;
      require each to fail when its target text is removed.
- [x] Directly verify the `snapshot_hash()` exclusion: confirm a `.docs/reqs`-only change does not
      change the hash and a `src/**` change does.
- [x] Confirm `SKILL.md`'s Intent Routing section remains byte-identical to `README.md`'s.
- [x] Run the skill validator and require success.

## Validation

- Scenario 15 static block exits 0 with the network install sub-step skipped.
- Every new/changed assertion fails against a mutated copy with its target text removed and passes
  against the real files.
- A standalone script confirms `snapshot_hash()` is unchanged by a `.docs/reqs`-only edit and changed
  by a `src/**` edit.
- `cmp` on the extracted Intent Routing sections reports byte-identical.
- The skill validator reports success.
- `git diff --check` exits 0.

## Rollback / Risk

- Documentation and test-harness only; no source-execution behavior changes. Revert the commit to
  restore prior text.
- Main risk: narrowing the review-rerun exemption could make legitimate, harmless post-pass touch-ups
  (e.g., typo fixes) require a rerun they previously didn't. Accepted deliberately — the alternative
  is the vague "editorial" carve-out that already let one real defect through.
- The CR/VR mandated-phrase addition is new required behavior; existing callers that only checked
  for AR's phrase are unaffected, since CR/VR previously had no mandated phrase to break.

## Verification Evidence

Recorded 2026-07-28.

- Scenario 15 static block: exit 0.
- Eight new/changed assertions negative-tested individually; all eight detected removal of their
  target text, all eight passed against the unmodified files.
- `snapshot_hash()` direct test: REQ-only edit produced an identical hash; a subsequent `src/**` edit
  changed it.
- Intent Routing `cmp`: byte-identical.
- Skill validator: `Skill is valid!`.
