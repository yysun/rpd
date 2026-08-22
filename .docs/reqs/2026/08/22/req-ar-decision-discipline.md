# AR Decision Discipline

## Problem

AR can identify vague plans and unresolved architecture questions, but it can still review documents
too passively: checking completeness without challenging weak decisions, clarifying what matters, or
helping the user choose a better direction.

## Requirement

Make AR an active decision gate. It should challenge unclear or weak requirements and plans, offer a
small set of viable options with their real tradeoffs, recommend a choice, ask only the next necessary
question, and stop once the critical ambiguity is resolved and implementation is clear.

## Acceptance Criteria

- [x] AR challenges unclear or weak requirements, plans, and proposed solutions instead of only
      checking document completeness.
- [x] When a consequential choice remains, AR offers a small set of viable options, names the real
      tradeoffs, and recommends one without manufacturing alternatives.
- [x] AR asks only the next necessary question and stops when the critical ambiguity is resolved and
      the plan is clear enough to implement.
- [x] AR pushes back when a requirement, plan, or proposed resolution grows scope, hides risk, or
      weakens the release.
- [x] Existing AR review coverage, fix-in-place behavior, risk classification, reviewer selection,
      result disclosures, terminal verdicts, and documentation-only boundary remain intact.
- [x] README explains the new AR behavior without duplicating the normative contract.
- [x] Tier 0, skill validation, size limits, diff checks, and installed-skill parity pass.

## Constraints

- Keep `skills/rpd/SKILL.md` compact and normative.
- Keep the interaction proportional. AR is not an evidence-based audit, citation exercise, exhaustive
  decision tree, or open-ended product workshop.
- Preserve version `3.8.0` for this focused contract correction.

## Non-Goals

- Importing the Grill Me skill's literal response template into every AR result.
- Adding evidence inventories, mandatory citations, option matrices, or new reporting fields.
- Asking the user about small choices that can be safely resolved without them.
- Changing REQ, AP, SS, CR, VR, or routing semantics beyond the interaction needed to resolve AR.
