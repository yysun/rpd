# Fix Findings From the First Full Intent-Routing E2E Run

## Problem

`.docs/tests/test-intent-based-routing.md` had never been run to completion against real execution
agents. Running all 13 cases against skill v3.3.0 produced 8 passes and 5 failures, revealing three
categories of gap: real skill-behavior gaps that recurred across independent, uncoached agents; a
structural defect in the harness's own reviewed-snapshot invariant; and stale assertions left over
from an unreleased naming revert.

## Requirement

Fix every confirmed gap: strengthen the skill contracts that recurring failures point to, correct
the harness invariant that was unsatisfiable by construction, and update the assertions that no
longer match the current skill.

## Acceptance Criteria

- [x] `AR`'s mandated report phrase states it is required verbatim even when a caller also requires
      its own status format, and that the two are not interchangeable.
- [x] `CR` and `VR` each have their own mandated report phrase, in the same two-outcome style as
      `AR`, with the same verbatim/non-interchangeable statement.
- [x] Planned routing states that a blocking open question about expected behavior does not exempt
      the flow from creating `AP`, and that `AR` is the mechanism that reports the block.
- [x] `AP`'s E2E guidance states that classification follows the story's subject matter, not whether
      today's implementation has a live UI, network call, or transport.
- [x] The independent-review rerun exemption is narrowed to exactly one case — recording a `VR`
      determination via REQ checkbox updates — and no longer permits skipping a rerun for edits
      described only as "editorial."
- [x] The E2E suite's shared snapshot-hash function excludes `.docs/reqs`, so a `VR`-driven REQ
      checkbox update does not by itself invalidate a prior `CR` pass's reviewed-snapshot invariant.
- [x] Scenario 11's completion-doc assertions match the current `{name}.md` naming convention.
- [x] Every new or changed static assertion in Scenario 15 fails when its target text is removed, and
      passes against the real files.
- [x] `SKILL.md`'s Intent Routing section remains byte-identical to `README.md`'s, and the skill
      validator reports success.

## Constraints

- Do not relax the bang-restart reconciliation content check that correctly caught a real content
  regression (a dropped literal value); only the naming assertion was stale.
- Keep the primary agent's REQ-checkbox exemption narrow: it is the one case where an independent
  reviewer's read-only constraint makes a post-pass edit unavoidable, not a general allowance.
- Preserve every existing passing assertion; add coverage rather than replacing working checks.

## Non-Goals

- Rerunning the full 13-case suite against the fixed skill in this story; that is tracked separately.
- Fixing `bang-restart`'s dropped-literal-value content issue in the skill; that is an execution
  quality issue in one run, not a contract gap.
- Adding assertions for contracts unrelated to this run's findings.
