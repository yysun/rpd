# Restore the Documented Artifact Layout and Make the Suite Portable

## Summary

- Reverted the `3.2.1` test relocation: the intent-routing suite moved from root `tests/` back to
  `.docs/tests/`, so `ET` resolves this repository's own spec at the path the skill documents. Spec
  and fixtures moved together, keeping all 15 relative fixture references valid.
- Root `.docs/` is now tracked, putting six requirement and plan docs covering this project's recent
  releases into version control for the first time.
- Recovered three `bang-restart` fixture seed docs that an unanchored `.docs/` ignore rule had
  silently excluded from the `3.2.1` commit, which left `!!` with no story to reconcile on a fresh
  clone.
- Corrected Scenario 12 to the `done-{name}.md` completion-doc name introduced in `3.2.0`, and
  replaced every machine-specific path with `RPD_TMP_ROOT` and `RPD_SKILL_VALIDATOR`.
- The `3.2.1` packaging split is unchanged; client installs still copy only `skills/rpd/`.

## Verification

- Scenario 15 static block exits 0 from the new location, with its network install sub-step skipped.
- `git check-ignore` misses the `bang-restart` seed requirement and `.docs/reqs`; `git ls-files`
  returns entries for `.docs/reqs`, `.docs/plans`, and `.docs/tests`. Presence-on-disk checks were
  deliberately avoided, since that is what hid the original loss.
- A fresh `git clone` into a temporary directory contains all three recovered seed docs.
- Portability checks: the validator guard was exercised both ways (`Skill is valid!` when present,
  skip notice and exit 0 when `RPD_SKILL_VALIDATOR` points at a missing file), `RPD_TMP_ROOT` was
  verified unset and overridden, no `/Users/esun` or `/private/tmp` literal remains in the spec, and
  the completion-doc allowlist regex was checked against both filenames.

## Notes

- The requirement and plan were written after the implementation, which was directed
  conversationally rather than through the RPD stages, and no `AR` gate was run. Both artifacts say
  so plainly.
- Two acceptance criteria in `separate-runtime-tests` were unchecked as superseded by this story,
  with a note in that requirement explaining the reversal was deliberate rather than abandoned work.
- Still open: `intent-based-routing` has an unrun `ET` task for the full scenario matrix, the
  `3.2.0` contracts have no static assertions, and the installed-layout assertions remain unverified.
