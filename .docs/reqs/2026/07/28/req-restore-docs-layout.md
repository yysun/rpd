# Restore the Documented Artifact Layout and Make the Suite Portable

## Problem

Three defects entered the repository with the `3.2.1` restructure.

The intent-routing suite moved to root `tests/`, but `ET` resolves `.docs/tests/test-{name}.md`.
The repository's own E2E spec became unreachable from the workflow the repository publishes.

`.gitignore` matched `.docs/` at any depth. Root `tests/` contained fixture directories with their
own nested `.docs/`, so the `bang-restart` fixture's seeded requirement, plan, and test spec were
silently excluded from the commit. A fresh clone had no current story for `!!` to reconcile, making
Scenario 12 unrunnable, while the files remained present on the author's disk.

Scenario 15 also asserted the pre-`3.2.0` completion-doc name and embedded absolute paths under
`/Users/esun`, so its assertions were stale and the suite could run on only one machine.

Separately, root `.docs/` was ignored, so the requirements and plans driving this project were
absent from version control. The README advertises RPD as preserving intent alongside code history;
the repository did not do this for itself.

## Requirement

Restore the artifact layout the skill documents, track this repository's own RPD artifacts, and
make the test suite runnable on any machine. Client installations must continue to receive only
`skills/rpd/`.

## Acceptance Criteria

- [x] The intent-routing spec and its fixtures live under `.docs/tests/`, so `ET` resolves the
      repository's own spec at its documented path.
- [x] Root `.docs/` is tracked in git, and the repository's requirements, plans, and E2E specs are
      committed.
- [x] No fixture file is excluded by an ignore rule; the `bang-restart` seed docs are tracked.
- [x] Scenario 12 asserts the `done-{name}.md` completion-doc name introduced in `3.2.0`.
- [x] Scenario 15 contains no machine-specific absolute path; the temporary base and validator path
      are overridable, and the validator target is repository-relative.
- [x] Scenario 15 asserts that `.docs/` is not ignored and that its artifacts are tracked, rather
      than asserting the ignore rule that caused the fixture loss.
- [x] The `3.2.1` packaging split is unchanged: client installs copy only `skills/rpd/`.
- [x] Every relative fixture reference in the spec resolves from the spec's directory.

## Constraints

- Preserve the `skills/rpd/` packaging separation and its install-layout assertions.
- Preserve the workflow contract; this story changes no command behavior.
- Keep the spec and its fixtures together so relative references remain valid.
- Absent external tooling must degrade to a skip with notice, not a hard failure.

## Non-Goals

- Changing any command's documented behavior.
- Adding static assertions for the `3.2.0` contracts.
- Running the full agent-driven scenario matrix.
- Regenerating or moving the workflow diagram.

## Open Questions

None. This requirement was written alongside the implementation it describes, after the work was
directed conversationally rather than through the RPD stages; it is recorded here so the repository
carries the intent behind `3.2.2`.
