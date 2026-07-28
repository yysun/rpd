# Changelog

All notable changes to the RPD skill are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The version of record is the `**Version:**` line at the top of `skills/rpd/SKILL.md`.

## [3.2.1] - 2026-07-28

### Changed

- Moved the installable skill to `skills/rpd/` so client installations contain runtime files
  without repository-only docs, the workflow diagram, or evals.
- Moved the intent-routing suite from `.docs/tests/` to root `tests/`.
- Kept `rpd-loop.png` at the repository root and updated the install command and validation
  paths for the nested skill layout.

## [3.2.0] - 2026-07-28

Consistency pass over the command contracts. No command was added or removed.

### Added

- `AR blocked: <flaw and why it cannot be resolved in place>` as a third `AR` result. It is
  explicitly not a pass: the flow stops and reports the blocker instead of entering `SS`.
- **Planned-routing terminus**: planning auto-entered from a natural-language implementation
  request now continues `SS(+CR*) → TT → ET? → VR*` and stops. `DD` and `GC` run only on request.
- **Direct-path terminus**: direct implementation ends after `CR` and creates no `.docs`
  artifacts; `REQ` must run first when the work needs a story.
- **Sequence notation** in Conventions, so `CR*` and `ET?` are defined where they are used
  rather than only inside the `RPD` section.
- **Command-like intent** rules for tokens that are also common technical initialisms
  (`AR`, `CR`, `DD`, `ET`, `GC`, `SS`, `TT`), plus an explicit rule that trailing `!!` is
  emphasis rather than an invocation.
- Explicit `SS` fallback: when the current story has no plan, or its plan has not passed `AR`
  since its latest material update, `SS` switches to planned routing instead of improvising.
- Intent Routing now classifies `SS`, `TT`, `ET`, `CR`, `VR`, and `GC` as stage selectors,
  alongside the existing documentation-only `REQ`, `AP`, `AR`, and `DD` classification.

### Changed

- Completion docs are now written to `.docs/done/{yyyy}/{mm}/{dd}/done-{name}.md`, matching the
  `req-`, `plan-`, and `test-` prefixes used by the other artifact paths. Existing undated
  completion docs are still readable; only newly written docs use the prefix.
- `DD` now runs once implementation, verification, and reviews are complete, whether or not the
  work is committed. The previous wording ("after work is committed") contradicted the documented
  `VR* → DD → GC` sequence, in which `DD` precedes the commit.
- File comment blocks now apply to any command that edits a source file, adding `TT`, `ET`, and
  `CR` to the list. `README.md` already described the broader rule; `SKILL.md` now matches.
- **Current story** resolution no longer keys on "most recently created or modified REQ doc".
  Checkbox-only edits, such as `VR` acceptance updates, can no longer make an older story current.
- `TT` and `ET` now defer to the Verification detection rules instead of "ask when unclear",
  matching the inspect-before-asking rule the rest of the skill uses.
- `AP` states that its automatic `AR` gate is part of its documented stage and stays
  documentation-only.
- Frontmatter description tightened to stay within the 1024-character skill limit while adding
  the initialism and `!!` guards.

### Fixed

- Scenario 15 of `tests/test-intent-based-routing.md` asserted that no line may say
  ``` `!!` is documentation-only ```, which incorrectly matched the accurate line "The
  reconciliation step of `!!` is documentation-only". The assertion was already failing before
  this release; the regex now excludes the reconciliation wording.
- The same scenario's version assertion was updated from `3.1.0` to `3.2.0`.

## [3.1.0] - 2026-07-28

### Changed

- Reworked the `!!` command into a current-story correction plus full-flow restart: it reconciles
  `REQ`, `AP`, and the E2E spec, invalidates any earlier `AR` pass, reopens stale acceptance
  criteria and plan tasks, then runs `AR* → SS(+CR*) → TT → ET? → VR* → DD → GC`.

## [3.0.0] - 2026-07-28

### Removed

- **Breaking**: the `WT` command and all git-worktree contract text. The command set returns to 12.

## [2.2.0] - 2026-07-28

### Added

- Intent Routing: natural-language requests are interpreted by requested outcome, with a
  direct-implementation path gated on explicit risk conditions and a planned path through
  `REQ → AP → AR` for everything else. File count, effort, and diff size are explicitly
  not routing criteria.

### Removed

- The `DF` command; ordinary bug-fix duties moved into the routing and `SS` contracts.

### Changed

- The command gate was replaced by intent routing.
- The version moved out of the frontmatter into a `**Version:**` line in the body.

## [2.1.10] - 2026-07-19

### Added

- Risk-adaptive architecture review: `AR` is classified low-risk only against explicit criteria
  recorded with repository evidence, and the primary agent may complete only low-risk `AR` itself.

## [2.1.9] - 2026-07-18

### Changed

- Independent reviews run in a subagent when the runtime supports one.

## [2.1.8] - 2026-07-18

### Added

- Independent review process documentation for `AR`, `CR`, and `VR`.

## [2.1.7] - 2026-06-03

### Changed

- Tightened workflow documentation and skill metadata.

## [2.1.6] - 2026-06-03

### Changed

- Strengthened the per-command contracts.

## [2.1.5] - 2026-06-03

### Changed

- Tightened `AP` planning instructions toward detailed, dependency-ordered phased tasks.

## [2.1.3] - 2026-05-16

### Added

- The `AR` gate: `AP` and `RPD` must not enter `SS` until `AR` has explicitly passed.

## [2.1.2] - 2026-05-14

### Changed

- `DD` now writes a short PR-style completion summary with `Summary`, `Verification`, and `Notes`.

## [2.1.1] - 2026-05-14

### Added

- The `VR` command, verifying the requirement against code, tests, and docs, with a completion loop.

## [2.0.0] - 2026-05-10

First versioned release.

### Removed

- **Breaking**: the `AT` command.
- `rpd.instructions.md`, in favor of `README.md` and `SKILL.md`.

### Changed

- Refined command keyword descriptions, workflow sequences, E2E spec guidance, the approval
  process, and mid-sequence entry rules.

## Pre-2.0.0 (unversioned)

Between the initial commit on 2026-02-15 and 2026-04-30 the skill carried no version field.
Notable changes in that period, newest first:

- 2026-04-30 - Command keyword detection rules, refined core principles, file comment block guidelines.
- 2026-04-22 - File comment blocks section.
- 2026-04-05 - Removed `QUICK_REFERENCE.md`.
- 2026-04-04 - Refined the workflow description and approval process; added the loop infographic.
- 2026-04-03 - `npx skills add` installation instructions.
- 2026-03-06 - Added the `WT` command (removed in 3.0.0).
- 2026-03-03 - Added the `AT` (removed in 2.0.0), `ET`, and `!!` commands.
- 2026-02-27 - Switched artifact paths to `{yyyy}/{mm}/{dd}`.
- 2026-02-15 - Initial commit.

---

Entries before 3.2.0 were reconstructed from git history, and the version for each was read from
the `SKILL.md` version field at that commit. Version numbers 2.1.0 and 2.1.4 were never released.
Descriptions at that granularity come from commit subjects and diffs rather than from release
notes written at the time.
