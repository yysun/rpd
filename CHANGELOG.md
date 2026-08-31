# Changelog

All notable changes to the RPD skill are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning generally
follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html). `3.6.0` and `3.8.0` are
owner-directed compatibility exceptions for workflow-contract corrections.

The version of record is the `**Version:**` line at the top of `skills/rpd/SKILL.md`.

## [3.10.0] - 2026-08-31

### Changed

- Automatic routing now escalates only for material protected-boundary impact, coordinated
  cross-component design, difficult rollback or significant blast radius, or consequential uncertainty
  remaining after focused inspection. Narrow documentation, test, and contract-surface edits can stay
  on the direct path; explicit `RPD` is the only unconditional full-process trigger.
- E2E specs now require explicit initial conditions, ordered executable actions, and observable
  outcomes without forcing every scenario into Given/When/Then. Compact behaviors may use
  Given/When/Then; longer flows may use numbered steps.
- AR may inspect verification surfaces but no longer executes verification. Runtime feasibility uses a
  bounded first SS probe with explicit decision criteria and returns to AR when the result invalidates
  the architecture.
- SS now completes every implementation task and its focused verification before running CR once,
  reruns CR only after relevant changes, and lets TT and ET close their own planned verification tasks.
- Repository installation now keeps `~/.agents/skills/rpd/` linked directly to `skills/rpd/`, removing
  manual copy synchronization.

## [3.9.0] - 2026-08-22

### Changed

- AR now challenges weak or unclear requirements and plans. When a consequential choice remains, it
  offers viable options with real tradeoffs, recommends one, asks only what is necessary, and stops
  once the plan is clear enough to implement.

## [3.8.0] - 2026-08-21

### Changed

- Restored the compact shape of the pre-`7599c05` workflow while keeping intent routing, File Comment
  Blocks, `!!`, the AR gate, review loops, and CR/TT/ET ownership.
- One protected-boundary definition now drives direct/planned routing and risk-based AR, CR, and VR.
  Low-risk review stays with the primary agent; protected or uncertain work uses an independent reviewer
  when available.
- The first review is full. Same-reviewer finding fixes rerun against unresolved findings and affected
  areas; changed reviewers, protected boundaries, expanded scope, or uncertain reach force full review.
- Review results now require only a concise risk reason, round/reviewer disclosure, uncapped material
  findings, and the terminal verdict. Stable finding/checklist IDs, evidence matrices, inventory counts,
  and review-action/scope fields were removed.
- Removed review snapshot hashes, verification digests, retained bundles, and path manifests. Reviews
  remain serial and read-only; any observed mutation invalidates a result.
- AP is proportional rather than a mandatory five-phase template. E2E specs cover executable flows,
  observable boundaries, and critical paths—not subject matter without a real surface.
- Replaced the large three-tier evidence suite with one deterministic contract check and three short
  explicitly planned maintainer dogfood scenarios. They remain outside ordinary TT and ET.

### Unchanged

- Findings and review rounds remain uncapped. The primary agent owns fixes and reviewers stay read-only.
- CR still does not run full unit, integration, or E2E suites; TT and ET retain execution ownership.
- The release version remains `3.8.0`; `4.0.0` was never released.

## [3.7.0] - 2026-08-18

### Added

- `AR`, `CR`, and `VR` results now disclose which round within that stage produced them and whether
  that round's reviewer was reused from the previous round or newly started, reported on its own
  line as `<STAGE> review round: <n>; reviewer: <reused|new|not applicable>`. The reuse obligation
  already existed, but nothing reported whether it was honored, so a stage that silently swapped in
  a fresh reviewer each round looked identical to one that was converging.
- A reviewer newly started at round 2 or later must name the permitted replacement condition that
  applied — previous reviewer unavailable, contributed to the artifacts under review, or modified
  the reviewed snapshot — so an unexplained replacement is visible in the result.
- A primary-agent review, whether because delegation is unavailable or because `AR` was classified
  low-risk, reports the round and `reviewer: not applicable (primary-agent review)` instead of
  claiming a reused reviewer.
- Tier 0 gains Scenario 0.7, which asserts the disclosure contract across the skill, the README, and
  this changelog, and asserts that the preserved guarantees — the terminal phrases, the reuse
  obligation, no findings cap, full-checklist reruns, clean-context independence, serial read-only
  review, primary-agent ownership, and the unresolvable-blocker stop rule — are still stated
  verbatim. Tier 2 now asserts the disclosure line in each execution agent's own result log.

### Unchanged

- The exact terminal phrases are untouched and remain the only verdict a caller needs to parse; the
  disclosure line is additive and contains no verdict wording.
- No round limit, no findings cap, and no fix-only rerun is introduced. A rerun still judges the
  complete new stable snapshot against the stage's full checklist, and an unresolvable blocking
  finding still stops the loop instead of triggering another review of an unchanged snapshot.

## [3.6.0] - 2026-07-31

### Changed

- Auto-entered planned routing now closes a successfully verified story with `DD`: its terminus is
  `SS(+CR*) → TT → ET? → VR* → DD`. If `VR` remains incomplete or blocked, the flow
  stops without writing a misleading completion document.
- Planned routing still does not run `GC`. Committing remains explicitly authorized by `RPD` or
  `GC`, while direct routing remains unchanged and stops after `CR` without RPD artifacts.
- **Compatibility note:** `!!` now reconciles and restarts through `AR* → SS(+CR*) → TT → ET? →
  VR* → DD`, then stops with uncommitted changes. It no longer runs `GC`; invoke `GC` separately
  when the corrected story should be committed.
- Updated the workflow diagram and intent-routing execution/static coverage to distinguish
  documented completion from committing.

## [3.5.0] - 2026-07-28

Fixes from the first full run of `.docs/tests/test-intent-based-routing.md` against real execution
agents (13 cases, 8 pass / 5 fail against v3.3.0). See `.docs/done/2026/07/28/e2e-run-fixes.md`
for the run's findings and evidence.

### Added

- `CR` and `VR` now report exactly one mandated phrase each (`CR passed: ...` / `CR fixed: ...`;
  `VR passed: ...` / `VR incomplete: ...`), matching the format `AR` already had. Neither existed
  before, so nothing enforced a consistent, testable CR/VR outcome string.
- `AR`, `CR`, and `VR`'s mandated report phrases now state explicitly that the phrase is required
  verbatim even when a caller also requires its own status format, and that the two are not
  interchangeable. Three independent, uncoached execution agents used only a differently-formatted
  evidence-log line and never the skill's own required phrase.
- Planned routing now states that a blocking open question about expected behavior does not exempt
  the flow from creating `AP`; the question belongs in REQ's Open Questions, and `AR` is the
  mechanism that reports the block. An execution agent stopped after `REQ` alone on a genuinely
  uncertain story, skipping `AP` and `AR` entirely.
- `AP`'s E2E-coverage guidance now says to classify by the story's subject matter, not by whether
  today's implementation has a live UI, network call, or transport. Two independent execution agents,
  each with a concurring independent reviewer, skipped an E2E spec for stories SKILL.md already names
  explicitly (auth, external integration) because the current implementation was a pure function.

### Changed

- Narrowed the independent-review rerun exemption. It previously allowed skipping a rerun for
  changes made "solely for editorial corrections," which one execution agent used to justify an
  unreviewed source edit made after both CR and VR had already passed — so the final on-disk state
  was never seen by any reviewer. The exemption is now limited to one case: updating REQ
  acceptance-criteria checkboxes to record a VR determination, which independent reviewers cannot do
  themselves because they work read-only. Every other post-pass edit invalidates that pass.

### Fixed

- The E2E suite's shared snapshot-hash function included `.docs/reqs` in its hash. Because `VR`
  legitimately updates REQ checkboxes after `CR` has already passed and reported its own snapshot,
  `assert_cr_final` was unsatisfiable by construction for any scenario that reaches `VR` — three
  independent runs failed this assertion for that reason alone. The hash (used identically by the
  primary agent and every independent reviewer) now excludes `.docs/reqs`.
- Scenario 11's completion-doc assertions still expected the `done-{name}.md` prefix removed in the
  unreleased naming revert; updated to the current `{name}.md` convention.

## [3.4.0] - 2026-07-28

### Changed

- AR, CR, and VR review loops now reuse the same independent subagent for reruns within one stage
  while it remains available and independent. Each rerun still receives the new stable snapshot,
  raw artifacts, and the stage's complete checklist, so fixing one finding cannot narrow the next
  review to that finding alone.
- A new independent reviewer starts at each review-stage boundary and whenever the current reviewer
  becomes unavailable, contributes to an artifact under review, or mutates the reviewed snapshot.
  The initial clean-context rule, serial gates, read-only safeguards, and primary-agent edit
  ownership are unchanged.

### Fixed

- Scenario 15 now fails fast instead of silently continuing after a failed assertion.
- Replacement reviewers now explicitly receive the same clean or minimal-context startup as the
  initial reviewer in a stage. Reused reviewers retain their review context; newly spawned
  replacements do not inherit authoring context.

## [3.3.0] - 2026-07-28

### Added

- `REQ` now directs authors to write each acceptance criterion against the property it depends on
  rather than a literal value a later release invalidates. Because `VR` may not relax a criterion
  to check it off, a criterion pinned to a literal version, count, or path can become permanently
  unsatisfiable while the work itself is complete. Both version-pinned criteria found in this
  repository's own stories had failed exactly this way.
- Scenario 15 now asserts every contract introduced in `3.2.0`: the `AR blocked` result and its
  not-a-pass clause, the planned-routing terminus with its stage sequence, the direct-path
  terminus, the sequence-notation legend, the command-like-intent rules, the `SS` no-plan
  fallback, and the `done-{name}.md` completion-doc path in both documents. Each assertion was
  negative-tested against a mutated copy to confirm it fails when its contract text is removed.
- Regenerated the workflow diagram around current risk-based routing, planned/direct
  terminuses, requirement verification, and `!!` reconciliation. The previous diagram said
  requirements are defined "before any code is generated" and framed `REQ | AP | AR` as step one
  of a canonical workflow, contradicting the direct path in the routing section directly beneath
  it. The replacement carries no version number, so ordinary releases do not make it stale, and
  the README alt text now describes the routing it shows.

## [3.2.2] - 2026-07-28

No change to workflow behavior. Repository layout, test-suite portability, and the first pass of
RPD artifacts for this repository's own stories.

### Added

- `.docs/done/` and the project's first completion documents. `remove-wt-command` shipped in
  `3.0.0` with its acceptance-criteria task never run, so all six criteria sat unchecked against
  released work; they are now verified and the story is closed. `separate-runtime-tests` and
  `restore-docs-layout` also have completion documents.
- Requirement and plan documents for `restore-docs-layout`, covering the changes in this release.
  Both state that they were written after the implementation, which was directed conversationally,
  and that no `AR` gate ran for the story.

### Fixed

- `.gitignore` matched `.docs/` at any depth, so the `bang-restart` fixture's seeded story docs
  (`req-`, `plan-`, and `test-public-status.md`) were silently excluded from the 3.2.1 commit. A
  fresh clone had no current story for `!!` to reconcile, making Scenario 12 unrunnable. Those
  three files are now tracked.
- Scenario 12 still asserted the pre-3.2.0 completion-doc name. Both the `find` check and the
  committed-path allowlist now expect `done-public-status.md`.
- `req-intent-based-routing` carried five acceptance criteria that current evidence does not
  support: three superseded by the `WT` removal, one whose proof depends on an `ET` run that has
  never happened, and one requiring version `3.0.0` when the story shipped as `2.2.0`, which was
  never true. All five are unchecked with the reasons recorded in the requirement.

### Changed

- Reverted the 3.2.1 test relocation: the intent-routing suite moves back from root `tests/` to
  `.docs/tests/`, restoring the artifact path the skill documents. `ET` resolves
  `.docs/tests/test-{name}.md`, so the suite was previously unreachable from this repository's own
  workflow. Moving the spec and its fixtures together keeps every relative fixture reference valid.
  The 3.2.1 packaging split is unaffected: client installs still copy only `skills/rpd/`.
- `.docs/` is now tracked in git rather than ignored, so this repository's requirements, plans, and
  E2E specs are versioned the way the skill claims they should be.
- Replaced hardcoded machine paths in the E2E suite. The temporary base is
  `RPD_TMP_ROOT="${RPD_TMP_ROOT:-${TMPDIR:-/tmp}}"`, the validator path is `RPD_SKILL_VALIDATOR`
  with a `$HOME` default and a skip when absent, and the validator target is repo-relative.
  Scenario 15 previously referenced `/Users/esun/...` and could only run on one machine.

## [3.2.1] - 2026-07-28

### Changed

- Moved the installable skill to `skills/rpd/` so client installations contain runtime files
  without repository-only docs, the workflow diagram, or evals.
- Moved the intent-routing suite from `.docs/tests/` to root `tests/` (reverted in 3.2.2).
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

- Scenario 15 of `.docs/tests/test-intent-based-routing.md` asserted that no line may say
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
