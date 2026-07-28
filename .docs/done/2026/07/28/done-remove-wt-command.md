# Remove the WT Command

## Summary

- Removed `WT` from RPD's public command contract and all user-facing workflow guidance, leaving
  the skill neutral about how an agent host provisions or selects a worktree.
- The command set returned to 12, and the removal shipped as a breaking major bump in `3.0.0`
  (commit `d501852`).
- No replacement command, compatibility alias, deprecation path, or manual worktree policy was
  introduced, per the requirement's non-goals.
- Ordinary uses of the word `worktree` that describe Git-visible review state were preserved.

## Verification

All checks below were run on 2026-07-28, after the change had already shipped. They were not run
at release time — the plan's acceptance-criteria task went unclosed, so this is a retroactive pass
recorded as such rather than a contemporaneous one.

- Removed-contract search across shipped content returned no matches, using the plan's command plus
  a `CHANGELOG.md` exclusion for the same historical-record reason `.docs` is excluded.
- `Commands Reference` holds exactly 12 rows; the README heading states 12 workflow commands.
- Skill validator reported `Skill is valid!`; frontmatter carries no `metadata`, `version`, or
  `repository` key, and the body holds exactly one `**Version:**` line.
- Scenario 15 of `.docs/tests/test-intent-based-routing.md` passes end to end, with its network
  install sub-step skipped.
- Residual `worktree` matches are limited to the two independent-review descriptions the
  requirement's constraint permits.
- `rpd-loop.png` is unmodified; `git diff --check` is clean staged and unstaged.
- Version criterion evidenced against `git show d501852:SKILL.md` (`2.2.0` to `3.0.0`), since the
  working tree has advanced past `3.0.0`.

## Notes

- The requirement's fourth criterion names an exact version, so it stops matching the working tree
  as soon as another release lands. It was evidenced against the shipping commit rather than
  reworded, but future criteria should name the property rather than a literal version.
- Three of the plan's validation commands had decayed: the skill moved to `skills/rpd/`, the static
  assertion block moved from Scenario 12 to Scenario 15, and the validator path was hardcoded. The
  adaptations are recorded in the plan's dated section; the originals were left as written.
- The Scenario 15 install sub-step (`npx skills@latest add`) was not run, so the installed-layout
  assertions are unverified here.
- This is the repository's first completion document. `intent-based-routing` and
  `separate-runtime-tests` remain without one: the former still has an open `ET` task for the full
  scenario matrix, and the latter was partly reverted in `3.2.2`.
