# Compact RPD Skill

## Goal and Context

Reduce repeated and over-specified guidance while keeping RPD's decisions stable. The baseline skill
is 227 lines / 2,197 words; Tier 0 and the skill validator pass, and the installed skill resolves to
the repository. All runtime instructions fit in one file. Historical review disclosures and AR's
no-execution rule address known failures and remain requirements.

## Decisions

- Consolidate evidence/scope principles, stage permissions, verification ownership, review reruns,
  and artifact paths. Preserve command tokens, terminal verdicts, and disclosure formats.
- Keep source headers, reuse effective module descriptions, and update them when responsibilities,
  constraints, or design reasons change. Remove per-edit change logs.
- Replace README's duplicated Notes with short explanations and contract links; retain its product
  rationale and four workflow entry points. Record the revised contract as 3.11.0.
- Replace prose-matching Tier 0 assertions with checks for frontmatter, metadata consistency,
  command/path coverage, exact review protocol strings, and working documentation links.
- Use existing Tier 2 scenarios for behavioral evidence. Extend the low-risk fixture with three
  temporary variants: remove its source header and expect a concise responsibility/constraint
  header to be created; seed an accurate module description and expect it to survive a bug fix
  unchanged; change the intended empty-input behavior and expect its now-stale description to be
  updated. Inspect source diffs for duplicate summaries, symbol inventories, dates, and change-log
  entries. Use fresh execution context for each variant and record focused test results.
- No current-story E2E spec is needed: this change has no application flow, and explicit maintainer
  scenarios exercise its consumer-facing instruction behavior.

## Tasks

- [x] Rewrite `skills/rpd/SKILL.md`, checking retained decisions against the baseline.
- [x] Align README, changelog, and the focused maintainer checks with the final contract.
- [x] Run skill validation, Tier 0, diff checks, and installation-symlink verification after edits
      stabilize; then run independent CR and resolve material findings.
- [x] Run the isolated low-risk/header, AR-to-SS, and same-reviewer scenarios from Tier 2 against the
      final skill. Use the maintainer story's independent CR for Scenario 2.2. Record actual evidence.

## Validation and Risk

This is a material consumer-contract change because file-header behavior changes and instructions
are broadly rephrased. Independent AR and CR are appropriate. Static checks cannot establish model
behavior; only the isolated scenarios provide behavioral evidence, and a few runs cannot prove a
GPT-6 performance improvement. All fixture edits stay in temporary workspaces.

Review for lost permissions, ambiguous routing, accidental test execution during AR, premature CR,
weakening of acceptance criteria, and header churn. Failed scenarios trigger a focused correction and
rerun of affected checks. The change is reversible as an uncommitted documentation diff.

## Architecture Review

AR risk: non-low — The rewrite affects the consumer workflow contract and changes header behavior.
AR review round: 2; reviewer: reused
AR fixed: specified executable header-policy coverage; rerun result passed

## Verification Evidence

All planned scenarios are recorded in [the validation result](../../../../tests/results/2026-09-07-compact-skill.md).
The artificial transport fixture was rejected for missing executable detail and replaced with an
actual ICU capability probe. The replacement exercised the intended AR → SS → AR blocker handoff.
No runtime skill changes were required by the behavioral scenarios.
