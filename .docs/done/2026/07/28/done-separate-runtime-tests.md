# Separate Runtime Skill from Repository Tests

## Summary

- Moved the installable skill to `skills/rpd/` so client installations receive runtime files
  without repository documentation, the workflow diagram, or the eval suite. Shipped in `3.2.1`.
- Added install-layout coverage to Scenario 15 asserting both the source layout and the installed
  layout, which is the durable part of this story and remains in force.
- Also relocated the intent-routing suite from `.docs/tests/` to root `tests/`, and kept root
  `.docs/` ignored. Both of those were reversed by `restore-docs-layout` in `3.2.2`.

## Verification

- Scenario 15's source-layout assertions pass: `skills/rpd/` contains no `tests` directory and no
  `.docs/tests` path, `rpd-loop.png` is absent from the skill directory, and no `SKILL.md` remains
  at the repository root.
- The skill validator reports `Skill is valid!` against `skills/rpd`.
- The client-install smoke test (`npx skills add … --skill rpd`) is defined in Scenario 15 and was
  the author's evidence at release. It was not re-run while writing this document, so the
  installed-layout assertions are unverified here.

## Notes

- Two acceptance criteria were unchecked after delivery. The suite location and the ignored root
  `.docs/` were intentionally reversed by `restore-docs-layout`, not left unfinished; the
  requirement carries a note explaining the supersession.
- The relocation half of this story caused a defect: root `tests/` sat under an unanchored
  `.docs/` ignore rule, so the `bang-restart` fixture's seeded story docs were silently excluded
  from the `3.2.1` commit. Fixed in `3.2.2`.
- The packaging separation was achieved entirely by the `skills/rpd/` move. Relocating the tests
  contributed nothing to it, which is why that half was safe to revert.
