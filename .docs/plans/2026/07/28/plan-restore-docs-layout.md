# Plan: Restore the Documented Artifact Layout and Make the Suite Portable

## Goal

`ET` resolves this repository's own E2E spec at `.docs/tests/test-{name}.md`, root `.docs/` is
tracked so the project versions its RPD artifacts, no fixture file is reachable by an ignore rule,
and Scenario 15 runs on any machine. The `3.2.1` packaging split is untouched.

## Current Context

- `3.2.1` moved the skill to `skills/rpd/` (correct, keep) and the suite to root `tests/` (revert).
- `.gitignore` held `.docs/`, matching at any depth. Three `bang-restart` seed files existed on disk
  but were never committed.
- Scenario 15 asserted `^/\.docs/$` in `.gitignore`, so it encoded the anchoring workaround rather
  than the tracking outcome.
- Scenario 12 asserted `public-status.md`; `3.2.0` renamed completion docs to `done-{name}.md`.
- Scenario 15 embedded `/Users/esun` twice and `/private/tmp` in two places.
- Every fixture reference in the spec is relative to the spec's own directory, so spec and fixtures
  must move together.

## Decisions

- Move the whole suite rather than splitting spec from fixtures: a split would require rewriting
  15 relative references to repository-relative form for no gain.
- Track root `.docs/` outright rather than keeping an anchored ignore rule. Anchoring fixes the
  fixture loss but leaves the dogfooding gap; tracking fixes both, and the anchor becomes moot.
- Assert tracking with `git ls-files`, not file presence. Presence on disk is what made the
  original loss invisible.
- Degrade the external validator to a skip with notice rather than a hard failure, so a missing
  local tool does not fail the suite for contributors.
- Rejected: relaxing `ET` to accept a project-level spec root. The `.docs/tests/` convention is
  sound and generally applicable; this repository was the outlier.
- Rejected: renaming or regenerating any artifact path beyond the revert.

## Phased Tasks

### Phase 1 - Contain the data loss

- [x] Anchor `.gitignore` to `/.docs/` and confirm the nested fixture path is no longer matched by
      `git check-ignore -v`.
- [x] Stage the three untracked `bang-restart` seed docs under
      `fixtures/intent-based-routing/bang-restart/.docs/`.
- [x] Correct the Scenario 12 `find` check and committed-path allowlist to `done-public-status.md`.

### Phase 2 - Restore the documented layout

- [x] Remove the `.docs/` rule from `.gitignore` entirely, leaving only `.DS_Store`.
- [x] `git mv tests .docs/tests`, keeping spec and fixtures together.
- [x] Track the repository's own `.docs/reqs` and `.docs/plans`.
- [x] Confirm every relative `fixtures/intent-based-routing/*` reference still resolves from the
      spec's new directory.

### Phase 3 - Rewrite the layout assertions

- [x] Replace the `^/\.docs/$` ignore assertion with a check that `.docs/` is not ignored.
- [x] Assert `test -d .docs/tests` and `test ! -e tests`.
- [x] Add a loop asserting `git check-ignore` misses and `git ls-files` hits for `.docs/reqs`,
      `.docs/plans`, `.docs/tests`, and the `bang-restart` seed requirement.

### Phase 4 - Remove machine-specific paths

- [x] Introduce `RPD_TMP_ROOT="${RPD_TMP_ROOT:-${TMPDIR:-/tmp}}"` in the Common Execution Procedure
      and in Scenario 15.
- [x] Introduce `RPD_SKILL_VALIDATOR` with a `$HOME` default and an `[ -f ]` guard that skips with
      a notice when absent.
- [x] Make the validator target repository-relative (`skills/rpd`).

### Phase 5 - Documentation and status

- [x] Bump `SKILL.md` and `README.md` to `3.2.2` and update the Scenario 15 version assertion.
- [x] Record the revert, the fixture-loss fix, and the portability change in `CHANGELOG.md`, and
      annotate the `3.2.1` entry as reverted.
- [x] Update the README install section to describe `.docs/` and state that the repository
      dogfoods RPD.
- [x] Record final evidence showing every acceptance criterion is satisfied.

## Validation

- `git check-ignore -v` misses the `bang-restart` seed requirement; `git check-ignore -q .docs/reqs`
  returns non-zero.
- `git ls-files` returns entries for `.docs/reqs`, `.docs/plans`, and `.docs/tests`.
- `git status --short --untracked-files=all` reports no untracked paths.
- Every `fixtures/intent-based-routing/*` reference in the spec resolves relative to
  `.docs/tests/`.
- The Scenario 15 static block exits 0, with the network install sub-step skipped.
- The validator guard runs the real validator when present and prints the skip notice when
  `RPD_SKILL_VALIDATOR` points at a missing file, exiting 0 in both cases.
- `RPD_TMP_ROOT` resolves to a usable directory when unset and honors an explicit override.
- No `/Users/esun` or `/private/tmp` literal remains in the spec.

## Rollback / Risk

- The move is a `git mv`, fully reversible by moving the tree back and restoring the ignore rule.
- Main risk is a stale reference to root `tests/`; mitigated by the `test ! -e tests` assertion and
  by resolving every relative fixture reference.
- Tracking `.docs/` publishes working notes. Accepted deliberately: the README advertises a
  versioned intent history, so the repository should keep one.
- The installed-layout assertions depend on a network install step that was not run here.

## Verification Evidence

Recorded 2026-07-28 alongside the implementation.

- `git check-ignore -v` on the `bang-restart` seed requirement: no match. `git check-ignore -q
  .docs/reqs`: non-zero. Both correct.
- `git status --short --untracked-files=all`: no untracked paths.
- All fixture references resolve; a scripted check over the unique reference set reported no
  missing paths.
- Scenario 15 static block: exit 0.
- Validator present: `Skill is valid!`. With `RPD_SKILL_VALIDATOR=/nonexistent/qv.py`: prints
  `skipping frontmatter validation…` and exits 0.
- `RPD_TMP_ROOT` unset resolves to the `TMPDIR` value; `RPD_TMP_ROOT=/private/tmp` honored.
- `grep` for `/Users/esun` and `/private/tmp` in the spec: no matches.
- The `done-public-status.md` allowlist regex was checked directly: it matches the prefixed name
  and rejects the old one.

## Notes

This plan was written after the implementation, which was directed conversationally rather than
through `REQ → AP → AR`. Tasks are marked complete because the work and evidence exist, not because
the plan preceded them. No `AR` gate was run for this story.
