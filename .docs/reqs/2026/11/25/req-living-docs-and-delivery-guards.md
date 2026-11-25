# Living Docs and Delivery Guards

## Problem

A project retrospective (Shiqu 0.14 → 0.17, four releases in four days under RPD) exposed two gaps in
the workflow contract.

- **Stale docs read as current.** RPD accumulates dated requirements, plans and done notes, but never
  says which documents describe current behaviour. That project had 377 dated documents, overlapping
  long-lived specs and no index, so agents treated superseded plans as current rules.
- **Expensive changes slipped through an uninterrupted run.** Inside explicit RPD runs, three persisted
  data formats shipped in four days without a user decision; a planned cost probe was skipped and its
  gate dropped; behaviour tests were deleted while a handoff listed about fifteen guarantees with no
  replacement; plans were written after the code; and a hard-to-undo step was handed between models
  midway.

## Outcome

RPD distinguishes documents that describe current behaviour from historical story records, keeps
living docs current through normal planned work, and stops for the user before changes or gaps that
are hard to undo.

## Acceptance Criteria

### Living docs

- [x] The skill defines living docs (current behaviour, kept up to date) and story records (a story's
      requirement, plan, done note and any project reports). Later stories do not update a story's
      records except for a one-line superseded note; `!!` and reruns of the same story still update them
      in place. Living docs default to top-level `.docs/*.md` plus anything the index or project
      instructions list, which can include long-lived test specs. The index at `.docs/README.md` maps
      areas to living docs. Agents resolving context read the index when present, treat earlier stories'
      records as history to confirm against code and living docs, and report conflicts between documents
      without stopping unless the conflict blocks a decision.
- [x] REQ records any earlier requirements, plans or living docs the story supersedes, and the living
      docs whose rules it changes.
- [x] AP turns living-doc updates into named tasks, so SS makes them and CR and VR check them. DD marks
      documents the REQ lists as superseded with a one-line note, and creates or updates the index only
      when a living doc is added, superseded or changes status. No project is forced into a one-time
      audit of existing docs.
- [x] CR's stale-docs check includes living docs that contradict the change. (Superseded notes and
      index updates happen in DD, after CR, so CR does not check them.)
- [x] `!!` reopens living-doc tasks affected by the correction.

### Delivery guards

- [x] AP and AR identify one-way or breaking changes (data migrations, persisted formats older versions
      cannot read, breaking removals from a public contract). Unless the user explicitly requested or
      approved that specific change, the run stops once before SS edits for approval, including inside
      explicit RPD; the stop counts as missing authorization, so independent in-scope work continues.
      A one-way change discovered during SS is a material architecture change: it returns to AR and
      the same stop applies.
- [x] A planned probe, gate or rehearsal that is skipped, or removed or replaced through a plan update,
      cannot produce a passing verdict on what it was meant to prove, unless the user approved the
      change, or approved removing that claim from the REQ, in conversation or project instructions (a
      plan or REQ edit is not approval). The report names the unverified claim, who is
      affected, the potential loss and the recovery path, and the user decides.
- [x] CR blocks deleted or rewritten tests whose guarantees have no passing replacement, unless the
      intended behaviour change comes from the user's request or approval.
- [x] When implementation departs from the plan, the plan is updated with the reason before work
      continues; plans are not written after the code.
- [x] Whenever the agent stops or yields partway through a hard-to-undo step (migration, removing an old
      flow or its tests, switching a core flow) because of a blocker, context limit or user stop, it
      first reaches a consistent point or records decisions, open items and risks in AP.

### Package

- [x] README and CHANGELOG describe the changes consistently with the skill; the version is bumped in
      the skill, README and CHANGELOG; Tier 0 passes; the installed skill symlink still points at the
      repository.

## Constraints

- Keep additions compact and in the existing single-file skill. Preserve command set, artifact paths,
  review protocol literals, routing and authorization rules other than the new stop conditions.
- The skill must not link to project files that do not exist in this repository (Tier 0 checks links).
- New stop conditions must not add pauses for changes the user already requested or approved, and the
  low-risk direct path gains no stops.

## Non-Goals

- A new command for docs or releases; release processes stay project-specific.
- Mechanical enforcement (hooks, CI checks) in consuming projects.
- Retroactively indexing or marking this repository's own historical documents.

## Supersedes

None. This repository has no `.docs` living docs; the contract whose rules change is
`skills/rpd/SKILL.md`, explained in `README.md`.

## Open Questions

None.
