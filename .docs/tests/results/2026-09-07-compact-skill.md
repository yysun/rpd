# Compact Skill Validation

## Scope

RPD 3.11.0 keeps the single-file workflow and changes file-header maintenance. The original skill was
227 lines / 2,197 whitespace-separated words; the revised skill is 157 lines / 1,441 words, a 34.4%
word-count reduction. This is a size measurement, not a measured model-quality or latency gain.

## Static and Contract Evidence

- Tier 0 package/protocol checks passed using the command in the maintainer test guide.
- `python3 /Users/esun/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/rpd` passed.
- `git diff --check` passed after implementation and again after the CR fixes.
- The global `/Users/esun/.agents/skills/rpd` path is a symlink resolving to this repository's
  `skills/rpd`; no installation copy was made.
- Independent AR initially required concrete header variants. After the plan specified absent,
  accurate, and stale descriptions, the same reviewer passed round 2.
- Independent CR identified two unintended weakenings: GC verification freshness and RPD pause
  conditions. Both were restored. The same reviewer completed a full contract rereview in round 2.

CR risk: non-low — Validation supports a material consumer workflow contract change.
CR review round: 3; reviewer: reused
CR passed: no major findings

## Tier 2 Observations

Temporary fixtures were created under the system temporary directory as `rpd-compact-eval-e_27p1yp`.
Each header executor received only its fixture, copied skill, and the user request. Expected header
outcomes were not given to executors. The parent inspected actual diffs and confirmed no story docs
or new commits in the three low-risk runs.

| Scenario | Observed result |
|---|---|
| 2.1 absent header | Added a one-line description of trimming and empty input, fixed the regression, and passed both tests with `npm test`. No history or symbol inventory. |
| 2.1 accurate header | Preserved the existing module description byte-for-byte while changing the implementation. Executor reported the regression failed before the fix and both focused tests passed afterward. |
| 2.1 stale header | Updated the old empty-marker constraint in the header, changed the implementation and regression expectation, added whitespace-only coverage, and passed all 3 tests with `npm test`. |
| 2.2 protected contract | Independent maintainer CR above passed after restoring the two contract guarantees. |
| 2.3 reviewer reuse | The first read-only reviewer found whitespace-only labels returned untrimmed. The parent added a regression, observed 3 pass / 1 fail, fixed the source, and ran `node --test test/labels.test.js`: 4 pass. The same reviewer passed round 2. |
| 2.4 AR/SS handoff | Initial artificial transport fixture was correctly blocked by AR. The replacement locale fixture passed independent AR with no execution markers or changes. SS ran only `node probe.js`, which exited 1 with `available: false`; REQ/AP were updated and the same AR reviewer reported the runtime blocker in round 2. Source/tests stayed unchanged and the full-suite sentinel stayed absent. |

All three low-risk executors reported `CR risk: low`, round 1, `reviewer: not applicable`, and
`CR passed: no major findings`. The reuse fixture explicitly dispatches a reviewer to exercise reuse;
it is not evidence that ordinary low-risk work should delegate. Its round 2 result was:

CR risk: low — localized, reversible internal behavior with straightforward verification.
CR review round: 2; reviewer: reused
CR passed: no major findings

The locale fixture's terminal result was:

AR risk: non-low — public locale behavior depends on native ICU availability.
AR review round: 2; reviewer: reused
AR blocked: native iu-CA support is absent in the tested runtime; owner decision required on runtime provisioning or stopping the feature.

This is the expected stop for the fixture, not a blocker in the compact-skill story. The parent
inspected the probe marker (`targetLocale: iu-CA`, `available: false`), absence of `.full-suite-ran`,
and unchanged source. The executor reported updating only the story documents before the AR rerun.

## Limits

The header, reuse, and initial transport fixture skills were copied before the two main CR fixes,
which only restored GC freshness and RPD pause conditions. Neither command is invoked by these
fixtures; their exercised rules are unchanged. The replacement locale fixture uses the final skill.
The final GC/RPD wording is covered by independent contract rereview. No GPT-6 benchmark or comparison
against an earlier model was run. The scenarios sample behavior and do not prove all possible routing
or completion outcomes. The parent independently checked file effects; executor test counts are
identified as executor evidence rather than repeated tests.
