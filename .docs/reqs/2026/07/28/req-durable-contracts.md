# Durable Acceptance Criteria and Asserted 3.2.0 Contracts

## Problem

Two gaps surfaced while auditing this repository's own RPD artifacts.

Acceptance criteria are being written against literal values that expire. Both version-pinned
criteria found so far went stale: `remove-wt-command` required version `3.0.0` and the tree moved
past it, while `req-intent-based-routing` required `3.0.0` for a story that shipped as `2.2.0`, so
that one was never true. `VR` forbids relaxing a criterion to make it satisfiable, which means a
criterion pinned to a literal can become permanently unsatisfiable while the underlying work is
complete. Nothing in the `REQ` contract warns authors away from this.

The contracts added in `3.2.0` have no static coverage. Scenario 15 asserts exact text for the
command set, routing contract, and canonical sequence, but `AR blocked`, the planned-routing and
direct-path termini, the sequence-notation legend, the command-like-intent rules, and the `SS`
no-plan fallback are unasserted. They are the newest contracts and the likeliest to regress
unnoticed.

## Requirement

`REQ` must direct authors to write acceptance criteria that stay checkable as the project evolves,
and Scenario 15 must assert every contract introduced in `3.2.0`.

## Acceptance Criteria

- [x] The `REQ` command contract tells authors to name the property a criterion depends on rather
      than a literal value that a later release invalidates, and gives version pinning as the
      worked example.
- [x] Scenario 15 asserts that `AR` reports `AR blocked` as a third result and that it is not a
      pass.
- [x] Scenario 15 asserts the planned-routing terminus, including its stage sequence, and the
      direct-path terminus.
- [x] Scenario 15 asserts the sequence-notation legend and the command-like-intent rules in
      Conventions.
- [x] Scenario 15 asserts the `SS` no-plan fallback to planned routing.
- [x] Scenario 15 asserts the `done-{name}.md` completion-doc path in both the `DD` contract and
      the documentation-structure diagram.
- [x] The suite passes with the new assertions, and the skill validates.

## Constraints

- Add no new command and change no existing command's behavior beyond the `REQ` authoring rule.
- Keep the frontmatter description within the 1024-character skill limit.
- Assert against the sections that already exist in Scenario 15 rather than re-extracting the
  whole document.
- Do not weaken any existing assertion to accommodate a new one.

## Non-Goals

- Rewriting the stale criteria already unchecked in earlier stories.
- Running the full agent-driven scenario matrix.
- Running the network install sub-step.
- Adding assertions for contracts older than `3.2.0`.
