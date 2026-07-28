# Plan: Reuse Reviewers Within a Review Stage

## Goal

Review loops reuse one independent subagent within each AR, CR, or VR stage without weakening
review independence, snapshot integrity, or full-checklist coverage.

## Current Context

- `skills/rpd/SKILL.md` requires a clean or minimal-context independent reviewer for CR, VR, and
  non-low-risk AR, then says to prefer fresh reviewer context after material changes.
- The fresh-context preference causes each blocking-finding fix to repeat subagent startup and
  artifact discovery even though the original reviewer did not author the fix.
- `README.md` documents reruns after material changes but does not state whether the same reviewer
  should be reused.
- `.docs/tests/test-intent-based-routing.md` Scenario 15 owns static workflow-contract assertions
  and can protect the new rule without adding another agent-driven fixture.
- The change modifies the published orchestration contract, so it requires a minor version bump
  from `3.3.0` to `3.4.0`.

## Decisions

- Reuse the same independent subagent by default for every rerun inside one named review stage.
- Require a complete review of the new stable snapshot on every round; prior findings are context,
  not the scope of the rerun.
- Start a different reviewer at the next stage boundary. AR, CR, and VR remain separate gates with
  different artifacts and checklists.
- Replace a within-stage reviewer only when it is unavailable, has contributed to reviewed
  artifacts, or has invalidated the snapshot by mutating it.
- Use these three load-bearing contract sentences verbatim in both `skills/rpd/SKILL.md` and
  `README.md`, so parity and regression coverage are exact:
  - `Reuse the same independent subagent for every rerun within one AR, CR, or VR stage while it
    remains available and independent.`
  - `On every rerun, give that reviewer the new stable snapshot and raw artifacts and require the
    stage's full checklist; do not limit the review to prior findings.`
  - `Start a new independent reviewer when the next stage begins, or when the current reviewer is
    unavailable, has contributed to artifacts under review, or modified the reviewed snapshot.`
- Preserve the clean-context rule for the first reviewer in each stage and all existing read-only,
  snapshot, serial-gate, findings, edit-ownership, and final-decision safeguards.
- Rejected: always starting a fresh reviewer after fixes. It adds latency without restoring any
  independence lost by primary-agent edits.
- Rejected: fix-only reruns. They can miss regressions introduced while addressing earlier
  findings.
- Update Scenario 15 rather than create a new E2E spec because this is a static orchestration
  contract and the existing scenario already validates adjacent independent-review language.

## Phased Tasks

### Phase 1 - Installable review contract

- [x] Update `skills/rpd/SKILL.md` so the first independent reviewer in each stage still starts
      without inherited authoring context.
- [x] Update `skills/rpd/SKILL.md` so review reruns within one stage reuse the same subagent while
      it remains available and independent.
- [x] Require each reused reviewer to receive the new stable snapshot and raw artifacts, then
      inspect them with the full stage checklist rather than only prior findings.
- [x] Define stage-boundary and invalidation conditions that require a different reviewer.
- [x] Remove the contradictory preference for fresh reviewer context after material fixes.

### Phase 2 - Public documentation and release record

- [x] Add matching reviewer-reuse guidance to `README.md` without changing which stages require
      independent review.
- [x] Confirm `README.md` states the same within-stage reuse, full-rerun, stage-boundary, and
      replacement rules as `skills/rpd/SKILL.md`.
- [x] Bump the body version in `skills/rpd/SKILL.md` and the README version to `3.4.0`.
- [x] Add a `3.4.0` entry to `CHANGELOG.md` describing the review-loop latency reduction and
      preserved safeguards.

### Phase 3 - Contract regression coverage

- [x] Extend Scenario 15 in `.docs/tests/test-intent-based-routing.md` to extract and inspect the
      Independent Review Delegation section.
- [x] Extract the corresponding README review notes and assert same-subagent reuse within a stage,
      new raw artifacts and full-new-snapshot reruns, stage-boundary separation, replacement
      conditions, and absence of the old fresh-context preference on both surfaces.
- [x] Update the Scenario 15 version assertion to `3.4.0`.
- [x] Make Scenario 15 fail fast so a failed static assertion cannot be hidden by later successful
      commands.
- [x] Clarify that a newly spawned replacement reviewer receives the same clean-context startup as
      the initial reviewer in a stage.

### Phase 4 - Verification and story status

- [x] Run the Scenario 15 static contract block with the exact offline command in Validation and
      require exit 0.
- [x] Run the skill validator and require `Skill is valid!`.
- [x] Run `git diff --check` and inspect the scoped diff.
- [x] Record verification evidence and mark tasks complete only when their changes or evidence
      exist.

## Validation

- Scenario 15's fail-fast static block exits 0 with the network install sub-step removed in memory:

  ```sh
  env E2E_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/rpd-scenario-15.XXXXXX")" bash -c \
    "$(perl -0777 -ne 'if (/## Scenario 15 .*?```sh\n(.*?)\n```/s) { $block = $1; $block =~ s/RPD_TMP_ROOT=.*?RPD_SKILL_VALIDATOR=/RPD_SKILL_VALIDATOR=/s; print $block; exit 0 } exit 1' .docs/tests/test-intent-based-routing.md)"
  ```

  The Perl substitution removes only the `npx skills@latest add` install segment, from
  `RPD_TMP_ROOT=` through the line immediately before `RPD_SKILL_VALIDATOR=`.
- `python3 /Users/esun/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/rpd`
  prints `Skill is valid!`.
- `git diff --check` exits 0.
- Manual diff review confirms AR, CR, and VR remain serial independent gates and no review
  checklist or primary-agent responsibility was removed.
- No matching E2E spec is needed because Scenario 15 owns static workflow-contract validation.

## Verification Evidence

Recorded 2026-07-28.

- Scenario 15 fail-fast offline static block: exit 0 after adding `set -e`. The earlier
  non-fail-fast result was invalidated and is not completion evidence.
- Skill validator: `Skill is valid!`.
- `git diff --check`: exit 0 with no output.
- TT discovery found no package manifest, task runner, test config, or standalone unit-test file.
  The repository's applicable fail-fast Scenario 15 contract block was rerun after CR and exited 0.
- Manual diff review: AR, CR, and VR remain serial independent gates; the first reviewer in each
  stage still starts without authoring context; read-only safeguards, full checklists,
  primary-agent edit ownership, and final pass ownership remain intact.
- Scope: reviewer-reuse changes in the installable skill, README, changelog, Scenario 15, and this
  story's REQ/AP artifacts only. The concurrent no-prefix completion-document fix was amended
  separately with its README and Scenario 15 updates after the user confirmed that contract.

## CR Result

The first independent CR found that Scenario 15 ignored failed assertions, the completion-document
contract was contradictory, and replacement-reviewer clean context was underspecified. The user
confirmed the concurrent preceding commit intentionally removed the `done-` prefix, so that commit
was amended with matching README and Scenario 15 updates. After the primary agent fixed the two
reviewer-story findings, the same CR subagent received the complete new snapshot, raw artifacts,
and full checklist and passed the rerun. The same CR subagent then repeated the complete checklist
after the amended baseline and user correction invalidated the first passing snapshot; the final
rerun also passed:

`CR fixed: made Scenario 15 fail fast and clarified replacement-reviewer context; the separate
completion-path contradiction was resolved according to the user's no-prefix decision; rerun result
passed`

## VR Result

The independent VR reviewer verified all eight acceptance criteria against the corrected HEAD,
installable skill, README, changelog, fail-fast Scenario 15, plan, and verification evidence. It
independently reran Scenario 15, the skill validator, and `git diff --check`; all passed.

`VR passed: all acceptance criteria complete`

## Rollback / Risk

- Revert the scoped commit to restore fresh-context preference.
- A reused reviewer could anchor on earlier findings and miss a newly introduced defect. Requiring
  the complete new snapshot and full checklist on every round addresses that risk.
- Reusing one reviewer across stage boundaries would blur distinct AR, CR, and VR responsibilities;
  the contract explicitly forbids that.
- Partial documentation could make the README and installable skill disagree; Scenario 15 checks
  both surfaces.

## AR Result

AR fixed the validation-command and acceptance-coverage gaps found in two independent review
rounds. A final clean-context review passed the unchanged snapshot:

`AR fixed: made validation directly executable, covered raw-artifact resubmission and README
parity, removed an unsupported mutation-test claim; rerun result passed`
