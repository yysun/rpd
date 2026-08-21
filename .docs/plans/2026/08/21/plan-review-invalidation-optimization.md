# RPD 3.8.0 Simplicity Restoration Plan

## Goal

Make the 3.8.0 workflow materially smaller and faster to apply while preserving its useful safety
boundaries and the user's required File Comment Blocks and `!!` behavior.

## Current Context

- `9015d14`, immediately before `7599c05`, is the structural baseline: 238 skill lines and 2,001 words.
- `7599c05` expanded AP from 20 to 55 lines with a fixed five-phase template.
- `98a47cd` through `d363613` introduced independent review; later commits added reviewer state,
  stable finding/checklist IDs, mandatory evidence fields, and retained-input mechanics.
- `8c76eaf` added snapshot hashes and verification digests to the maintainer harness.
- 3.8.0 correctly moved Tier 2 out of ordinary TT/ET and stopped CR from running full suites or E2E.

## Decisions

- Preserve behavior, not wording: keep intent routing, protected-boundary planning, AR gating,
  risk-based review, same-reviewer reruns, full fallback, uncapped findings, and test ownership.
- Define protected boundaries once and reference that definition everywhere.
- Protected boundaries are public APIs or consumer contracts, schema/persistence/migrations,
  authentication/security/privacy, external dependencies or integrations, infrastructure/deployment,
  and concurrency/performance/availability/reliability behavior. Low risk also requires a localized
  existing pattern, reversibility, clear behavior, and clear verification. Uncertainty is non-low-risk.
- Make all AR/CR/VR delegation risk-based. A concise risk line replaces six mandatory evidence lines.
- A review is read-only over a stable diff. A finding fix rerun checks unresolved findings and affected
  areas; the first review is full, and a changed reviewer, risk boundary, concurrent repository change,
  or uncertain reach gets a full rerun. Reviews are serial and reviewers are instructed to work
  read-only. Runtime read-only enforcement is preferred; otherwise any observed reviewer or concurrent
  mutation invalidates the result. No exact before/after identity proof, retained copy, hash, digest,
  manifest, checklist universe, or stable finding ID is required.
- VR uses the same risk classification as the story and reviewed implementation. When delegation is
  unavailable, the primary agent runs the same checklist; it never fabricates independence.
- Keep the one-line round/reviewer disclosure because it cheaply exposes repeated review work.
- Make plans proportional and require only goal/context, ordered executable tasks, validation, and
  relevant risk. Remove the phase template.
- Require E2E only where behavior crosses an observable boundary or protects a critical flow.
- Treat `skills/rpd/SKILL.md` as normative. Preserve README's existing product argument, quick start,
  workflow narrative, command guide, artifact explanation, and self-hosting context; change only stale
  review, planning, E2E, and test-suite details.

## Tasks

- [x] Rewrite `skills/rpd/SKILL.md` as a compact normative contract, preserving File Comment Blocks,
      `!!`, version 3.8.0, command semantics, and CR/TT/ET ownership. Keep it at or below 300 lines and
      3,500 words. File Comment Blocks retain source-file scope, creation before editing when absent,
      update after editing, and the `.docs/` exemption. `!!` retains current-story resolution,
      REQ/AP/spec reconciliation, stale checkbox/task reopening, AR invalidation, no source edits before
      AR passes, `AR* → SS(+CR*) → TT → ET? → VR* → DD`, and no GC.
- [x] Update `README.md` surgically: preserve its structure and RPD rationale, point exact behavior to
      `skills/rpd/SKILL.md`, and correct only stale review, planning, E2E, and test-suite details.
- [x] Move the existing README intent-routing summary under `## Workflow` as `### How RPD chooses a
      path`, reduce it to read-only/direct/planned/full-RPD decisions, and replace the Quick Start
      command with `Install RPD skill from GitHub yysun/rpd` while preserving the surrounding README.
- [x] Reorder the README Workflow narrative so the recommended full `RPD` flow comes first, targeted
      commands come second, automatic routing for ordinary requests comes third, and `!!` remains the
      final correction path. Update the Tier 0 ordering assertion without changing unrelated README
      content.
- [x] Remove obsolete `.docs/tests/test-helpers.md`; rewrite `.docs/tests/test-tier0-static-contracts.md`
      and `.docs/tests/test-tier2-evidence-integrity.md`; remove `snapshot_hash`, verification digests,
      retained-input/path-manifest assertions, mandatory evidence matrices, finding/checklist IDs,
      inventory counts, and review-action/scope fields.
- [x] Remove obsolete `scripts/verification-digest.js` files from the intent-routing fixtures and update
      their `package.json` files so `npm test` remains the only verification contract.
- [x] Retire the expensive Tier 1 matrix after moving its direct, planned, uncertain, explicit-stage,
      read-only, and `!!` routing invariants into Tier 0. Keep Tier 2 as three short post-implementation
      dogfood scenarios: low-risk primary CR, protected independent review, and same-reviewer focused rerun.
- [x] Make Tier 0 assert behavior for low/protected/uncertain review selection, first-full and focused
      reruns, mutation invalidation, uncapped findings, CR/TT/ET ownership, E2E boundary selection,
      File Comment Blocks, `!!`, version consistency, and absence of removed machinery.
- [x] Update CHANGELOG and the existing 3.8.0 completion record with the simplicity restoration.
- [x] Run the Tier 0 block, skill validator, line/word limits, version checks, and `git diff --check`.
      After the rewrite, run the compact Tier 2 low-risk fixture with a fresh execution agent and use
      this story's post-implementation CR for the protected independent-review branch. If CR produces
      a finding, dogfood the same-reviewer focused rerun in the live story; never manufacture a finding.
      Independently run compact Tier 2 Scenario 2.3 so focused-rerun behavior is always exercised.
      Record actual round counts and whether hashes, retained bundles, full-suite tests, or E2E execution
      were used. This is planned maintainer validation, not an ET-discoverable story spec.
- [x] Sync the complete installable directory to `~/.agents/skills/rpd/` with stale removal and verify
      byte parity. Commit amendment is a post-VR/DD delivery action, not an SS task.

## Validation

- Keep one executable `sh` block in `.docs/tests/test-tier0-static-contracts.md` and run it exactly with
  `sed -n '/^```sh$/,/^```$/p' .docs/tests/test-tier0-static-contracts.md | sed '1d;$d' | bash`;
  expect exit 0 and the final line `Tier 0 passed`.
- Run `python3 /Users/esun/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/rpd`;
  expect `Skill is valid!`.
- Run `test "$(wc -l < skills/rpd/SKILL.md)" -le 300`,
  `test "$(wc -w < skills/rpd/SKILL.md)" -le 3500`, `git diff --check`, and
  `diff -ru skills/rpd ~/.agents/skills/rpd`; expect every command to exit 0.
- For post-implementation dogfood, run Scenario 2.1 from
  `.docs/tests/test-tier2-evidence-integrity.md` in an isolated copy with a fresh agent and expect
  `CR risk: low` plus primary-agent review. Run this story's CR with an independent reviewer and expect
  `CR risk: non-low — installable workflow contract`; record any actual focused rerun without assuming
  a fixed round number. Run Scenario 2.3 unconditionally and expect the same reviewer to evaluate the
  seeded finding fix plus affected areas without repeating unrelated checklist areas.

## Risk

Over-compression could remove a real safety boundary. Preserve externally visible stage behavior and
test the boundary decisions; remove only duplicated wording and evidence ceremony. Before sync, copy
the installed skill to a temporary directory; restore that copy if parity or validation fails. Before
amendment, verify HEAD is the local unpublished 3.8.0 commit and the worktree contains only this story;
the pre-amend commit remains recoverable from the reflog.
