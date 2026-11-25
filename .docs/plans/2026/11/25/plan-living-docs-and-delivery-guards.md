# Plan: Living Docs and Delivery Guards

Requirement: [req-living-docs-and-delivery-guards](../../../../reqs/2026/11/25/req-living-docs-and-delivery-guards.md)

Story Git base: `d076e95cfe92b9a9557b5552aadb4f4e8b6a470e`

## Decisions

- **Version 3.12.0.** New stop conditions and doc duties change the consumer contract additively; no
  command, path or protocol literal is removed.
- **Living docs are updated in SS, not DD.** AP lists them as tasks so CR and VR review the rule text
  before delivery and DD stays within its edit boundary. DD only marks superseded documents and touches
  the index. This story follows the same rule: `SKILL.md` and `README.md` are SS tasks.
- **One place per rule.** The living-docs definition goes in Conventions; the skipped-check rule goes in
  the Review Contract because it governs AR, CR and VR alike; the one-way-change stop is identified in
  AP/AR and enforced before SS; plan-first and stopping-midway rules go in SS; per-command duties go in
  REQ, AP, DD, CR and `!!`.
- **One-way-change stop.** Scoped to data migrations, persisted formats older versions cannot read and
  breaking public-contract removals that the user has not explicitly requested or approved. It happens
  once, before SS edits, and counts as missing authorization under RPD's existing rule, so independent
  work continues and ordinary runs gain no new stops.
- **Stopping midway is agent-actionable.** The rule covers what the agent controls: when it stops or
  yields during a hard-to-undo step, not which model a user picks.
- **No Markdown link to `.docs/README.md`.** The skill names it in code formatting so Tier 0 link checks
  stay valid in this repository.

## Tasks

- [x] `skills/rpd/SKILL.md`: version 3.12.0; Conventions gains the living-docs/story-records definition
      (later stories add only a superseded note; `!!` and reruns update in place), default location,
      index-first reading and report-only conflicts.
- [x] `skills/rpd/SKILL.md`: Review Contract gains the skipped-planned-check rule, including checks
      removed or replaced through plan updates.
- [x] `skills/rpd/SKILL.md`: REQ records superseded documents and changed living docs; AP lists
      living-doc update tasks and identifies one-way changes; AR confirms the identification; DD marks
      superseded documents and maintains the index lazily; CR's stale-docs check is made concrete and
      blocks retired guarantees without replacements; `!!` reopens affected living-doc tasks.
- [x] `skills/rpd/SKILL.md`: SS stops once before editing unapproved one-way changes (one found during SS
      returns to AR first), updates the plan before continuing after a departure, and handles stopping
      midway through hard-to-undo steps.
- [x] `README.md`: version 3.12.0; RPD pause list includes unapproved one-way changes; knowledge-base
      text explains living docs versus story records and the index.
- [x] `CHANGELOG.md`: `[3.12.0] - 2026-11-25` entry.
- [x] Verify `~/.agents/skills/rpd` still resolves to `skills/rpd/` in this repository.

## Progress

- SS complete (uncommitted; small single-file change, no separate milestone commit). Tier 0 passed after implementation. Symlink `~/.agents/skills/rpd` → `skills/rpd/` verified.

## Validation

- **TT:** Tier 0 from `.docs/tests/README.md` (version agreement, command set, artifact paths, protocol
  literals, links).
- **Review:** non-low risk, so AR, CR and VR use an independent read-only reviewer, which checks each
  criterion against the skill text and walks the Shiqu failure cases (format change inside RPD, cost
  probe skipped or dropped from the plan, deleted tests, plan after code, stopping midway, stale plan
  read as current) through the new wording.
- **Tier 2 not run; evidence limit.** Scenario 2.1 and the SS checkpoint scenarios would give
  regression evidence for the constraint that ordinary and low-risk runs gain no new stops. They are
  not run in this story, so that constraint is checked only by review of the text, and no fixture run
  exercises the new stop conditions.
- No E2E spec: the change has no executable user flow beyond the maintainer scenarios above.

## Risks

- **Extra pauses.** A loose reading of the one-way-change stop could stop ordinary runs. Mitigated by
  the narrow change list, the explicit-approval exemption and a single stop before editing the change.
- **Doc bookkeeping creep.** Mitigated by touching the index only on add, supersede or status change.
- **Skill length.** Each rule is one or two sentences in the existing section.

## CR Round 1 Follow-up

CR round 1 passed with non-blocking findings; fixed before delivery: CR no longer checks DD's
superseded notes and index (they run after CR); story-record rule narrowed to earlier stories with
a confirm-against-code rule; "that specific change" restored; removing a REQ claim to skip a check or
retire tests needs user approval; plan rule scoped to departures; README pause, `!!` and artifact tree
updated. REQ criteria adjusted to match. Tier 0 passed after the fixes.
