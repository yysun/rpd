# Risk-Based CR Delegation

## Problem

RPD currently requires an independent subagent for every CR whenever delegation is available. That
preserves author-reviewer independence, but it imposes the same startup and review-loop cost on a
localized documentation edit as on a security, persistence, or public-contract change. The blanket
rule makes routine work slower without reserving the extra review cost for changes where author
blind spots carry material consequence.

## Requirement

CR delegation must be risk-based. The primary agent may complete CR itself only when concrete
repository evidence proves the reviewed change is low-risk. Any uncertain or non-low-risk CR must
continue to use a clean-context independent reviewer when delegation is available. The CR checklist,
review loop, terminal phrases, round disclosure, and final-pass standard must remain unchanged
regardless of who performs the review. Independent reviewers remain read-only; primary-agent CR must
separate read-only evaluation from fixes between rounds so no pass survives a mutation.

## Acceptance Criteria

- [x] Before choosing a CR reviewer, the primary agent classifies the stable diff against explicit
      low-risk criteria and records criterion-by-criterion repository evidence in the CR result.
- [x] A CR is low-risk only when it is localized, follows an existing pattern, changes none of the
      named public-contract or operational risk areas, is readily reversible, and has unambiguous
      expected behavior and verification.
- [x] Any false, uncertain, unsupported, or debatable low-risk criterion makes CR non-low-risk.
- [x] The primary agent may complete a low-risk CR itself; a non-low-risk CR still requires an
      independent reviewer when delegation is available.
- [x] VR still requires an independent reviewer whenever delegation is available, and AR retains its
      existing risk-based reviewer selection.
- [x] Primary-agent low-risk CR reports its review round and
      `reviewer: not applicable (primary-agent review)` without weakening the CR checklist or pass
      criteria.
- [x] Every CR result reports an overall risk classification plus non-empty repository evidence for
      each low-risk criterion, and the direct low-risk execution fixture verifies those evidence
      fields at runtime.
- [x] Primary-agent CR reclassifies after any fix; if a later snapshot becomes non-low-risk it
      escalates to a new independent reviewer, while a stage that has escalated or already used an
      independent reviewer blocks when no eligible reviewer is available and never downgrades to
      primary-agent review.
- [x] A blocked CR reports an explicit blocked outcome instead of either success phrase, retains the
      latest risk evidence and completed-round disclosure, and never invents a review round that did
      not run.
- [x] Independent-review context isolation, read-only operation, reviewer reuse within a stage,
      stable-snapshot integrity, full-checklist reruns, and primary-agent ownership of fixes remain
      intact whenever CR uses an independent reviewer.
- [x] README, CHANGELOG, test-suite guidance, static contracts, and evidence-tier expectations state
      the same reviewer-selection behavior as the installable skill.
- [x] The installable skill receives a major version bump for the new blocked CR outcome, relevant static
      contract checks and skill validation pass, and the global installation exactly matches
      `skills/rpd/`.

## Constraints

- Diff size and file count alone must not classify CR as low-risk.
- Documentation-only and test-only changes are not automatically low-risk; the named criteria still
  require evidence.
- The identity of the model or agent host is not risk evidence.
- Preserve the existing exact AR, CR, and VR terminal phrases.
- Scope CR's existing pass/fixed phrases to completed reviews; adding an explicit blocked outcome
  must not alter either success phrase.
- Treat the expanded CR terminal-result set and the post-escalation no-fallback rule as breaking
  contract changes.
- Do not remove CR from direct or planned implementation paths.
- A primary-agent CR evaluation that discovers a finding may edit only after invalidating that
  evaluation; the changed snapshot must be reclassified and reviewed in a new round.

## Non-Goals

- Removing independent review from non-low-risk CR.
- Making VR risk-based or weakening VR acceptance verification.
- Broadening the existing low-risk AR exception.
- Adding a feature flag, environment variable, reviewer budget, or user prompt to select review mode.
- Replacing CR with tests, TT, ET, or VR.
