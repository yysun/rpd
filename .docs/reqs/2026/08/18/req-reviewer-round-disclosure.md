# Disclose Reviewer Round and Reuse

## Problem

The independent-review contract already requires reusing the same subagent for every rerun within one
AR, CR, or VR stage while it remains available and independent. Nothing reports whether that happened,
so a violation is invisible to the primary agent, to a caller, and to a human reading the result.

Measured across four multi-task runs, reuse was honored in roughly a third of reviewer sessions, and
almost never at AR: of 42 AR reviewer sessions, 36 received exactly one message, and a single AR gate
started fourteen one-shot reviewers in sequence.

The cost is not the wasted context. It is that the stage stops converging. A reviewer with no memory
of what earlier rounds adjudicated re-derives "blocking" from the artifacts alone and reliably
produces a finding that is new and *resolvable*. The existing terminal — stop and report the blocker
when a blocking finding cannot be resolved — is therefore never reached, because every round produces
something that can be resolved. The loop ends when the primary agent stops asking rather than when
the review reaches a fixed point. Reviewer churn measured 42%, 52%, and 59% of depth-2 agents across
three runs, rising with task complexity rather than falling.

A stage that silently substitutes a fresh reviewer looks identical to a stage that is converging
normally. Both show a live reviewer and recent activity.

## Requirement

Every AR, CR, and VR stage result must state which round produced it and whether that round's reviewer
was reused or newly started, so that a departure from the reuse obligation is visible in the result
rather than only in a runtime trace.

The obligation itself does not change, no limit is placed on rounds or findings, and the verdict a
stage reports must remain exactly what it reports today.

## Acceptance Criteria

- [x] Each AR, CR, and VR stage result states which round within that stage produced it.
- [x] Each stage result states whether that round's reviewer was reused from the previous round
      within the stage or newly started.
- [x] When a reviewer is newly started at any round after the first, the result names which permitted
      replacement condition applied.
- [x] The exact terminal phrases each stage already reports are unchanged, and a caller can still
      determine the verdict from those phrases alone without reading the disclosure.
- [x] The reuse obligation retains its current strength: the contract still requires the same
      independent subagent for every rerun within a stage while it remains available and independent.
- [x] No round limit, no findings cap, and no fix-only review is introduced. A rerun still judges the
      complete new stable snapshot against the stage's full checklist and still reports every
      material finding in priority order.
- [x] An unresolvable blocking finding still stops the loop and is reported, rather than causing
      another review of an unchanged snapshot.
- [x] When delegation is unavailable and the primary agent runs the same checklist, the result still
      states the round, and reports reviewer reuse as not applicable rather than claiming a reused
      reviewer.
- [x] Independent reviewers still start without inherited authoring context, reviews remain serial and
      read-only, and the primary agent still owns every edit and the final pass decision.
- [x] The README and the CHANGELOG describe the same disclosure behavior as the installable skill.
- [x] Static contract checks, skill validation, and `git diff --check` pass.

## Constraints

- Preserve the existing independent-review scope, replacement conditions, read-only review,
  stable-snapshot rule, no-findings-cap rule, and rerun-after-material-change rule.
- Preserve the primary agent's ownership of edits, fixes, completion loops, and final pass decisions.
- Do not alter the exact terminal phrases. Callers parse them: an external evidence validator requires
  exactly one verdict line per stage and treats additional lines as inert, so disclosure must be
  additive rather than a change to those lines.
- RPD must remain correct standalone. Disclosure adds no dependency on a caller, and a human running
  RPD directly must see the same behavior apart from the added statement.
- Keep the frontmatter description within its existing schema and character limit.

## Non-Goals

- **Introducing a round budget or cap in RPD.** A cap gives the primary agent a legible incentive to
  reclassify a blocking finding as advisory to stay under it, which pressures truthful execution — the
  one property that held across every analyzed run. A budget is a resource policy and belongs to
  whoever is spending the resource: a human running RPD directly, or an orchestrator that dispatches
  it.
- **Converting a rerun into a delta review scoped to prior findings.** Full re-review is what catches
  a regression introduced by the fix in ground an earlier round already cleared.
- **Making advisory findings non-gating.** The contract already scopes gating to major and blocking
  findings; restating it would add reclassification pressure without adding a rule.
- **Enforcing reuse mechanically.** The contract states an obligation and now requires it to be
  reported. Policing the runtime from inside the contract is out of scope.
- **Changing what a reviewer may report, or the criteria by which a stage passes.**
