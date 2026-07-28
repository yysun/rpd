# Durable Acceptance Criteria and Asserted 3.2.0 Contracts

## Summary

- `REQ` now tells authors to write each acceptance criterion against the property it depends on
  rather than a literal value a later release invalidates, with version pinning as the worked
  example and the same rule extended to counts, dates, paths, and identifiers.
- The rule closes a real failure mode: `VR` may not relax a criterion to check it off, so a pinned
  literal can become permanently unsatisfiable while the work is complete. Both version-pinned
  criteria in this repository's own stories had failed that way.
- Scenario 15 gained nine assertions covering every contract introduced in `3.2.0`: `AR blocked`
  and its not-a-pass clause, both routing termini, the sequence-notation legend, the
  command-like-intent rules, the `SS` no-plan fallback, and the `done-{name}.md` path in both
  documents.
- Released as `3.3.0`, a minor bump because the `REQ` contract gains a rule.

## Verification

- Scenario 15 static block exits 0 with the network install sub-step skipped, and the skill
  validator reports `Skill is valid!` with the description inside the character limit.
- Every new assertion was negative-tested against a mutated copy of `SKILL.md` in a temporary
  directory: all nine failed when their target text was deleted and passed against the real file,
  so none is vacuous.
- The pre-existing `! rg -Fi 'direct path'` guard on the `SS` section still passes alongside the
  new fallback assertion.
- `git diff --check` is clean.

## Notes

- The new `REQ` assertion caught a style defect during its first run: the added bullets were
  wrapped across lines while every other bullet in `SKILL.md` is a single long line, so a
  line-oriented match could not see the phrase. The bullets were unwrapped to match the file.
- Assertions anchor on labelled terms and the load-bearing clause rather than whole sentences, so
  ordinary rewording does not produce false failures.
- Still open across the repository: `intent-based-routing` has an unrun `ET` task for the full
  scenario matrix and five criteria unchecked pending it, and the `npx skills@latest add` sub-step
  remains unverified.
