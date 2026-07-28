# Plan: Separate Runtime Skill from Repository Tests

## Goal

Make `skills/rpd/` the only installable skill boundary while keeping repository evals under root `tests/`.

## Current Context

- Root `SKILL.md` makes the entire repository root eligible as a skill directory.
- Root `.docs/tests/` contains the intent-routing suite and deterministic fixtures.
- `.gitignore` was temporarily scoped to expose `.docs/tests/`, but story artifacts should remain ignored.
- `README.md` references the root diagram and uses `npx skills add yysun/rpd`.
- The static suite assumes `SKILL.md` is at the repository root.

## Decisions

- Move only `SKILL.md` into `skills/rpd/`; keep `rpd-loop.png` at the repository root so it
  remains repository documentation rather than installed runtime content.
- Move `.docs/tests/` to root `tests/`; do not place evals inside the installable skill directory.
- Restore root `.docs/` ignoring because contributor tests no longer need an exception.
- Keep one standard skill layout and reject packaging scripts, duplicated skill files, symlink fallbacks, and client-specific copies.
- Keep the root README and diagram as repository documentation and update the install command
  for the nested skill.

## Phased Tasks

### Phase 1 - Lock the distribution boundary

- [x] Move root `SKILL.md` to `skills/rpd/SKILL.md` without changing the RPD command contract.
- [x] Keep root `rpd-loop.png` outside `skills/rpd/` and keep the root README image reference.
- [x] Update the root README install example to select the nested `rpd` skill explicitly.

### Phase 2 - Relocate repository tests

- [x] Move `.docs/tests/` to root `tests/` while preserving every scenario and fixture.
- [x] Update `tests/test-intent-based-routing.md` setup, validation, and static assertions to read `skills/rpd/SKILL.md`.
- [x] Add static assertions proving `tests/` is outside `skills/rpd/` and the installable directory contains no test suite.
- [x] Restore `.gitignore` to ignore root `.docs/` without hiding root `tests/`.

### Phase 3 - Validate the package boundary

- [x] Run the deterministic `bang-restart` fixture with `npm test`.
- [x] Parse every shell assertion block in `tests/test-intent-based-routing.md` with `bash -n`.
- [x] Run `quick_validate.py` against `skills/rpd/`.
- [x] Install the local nested skill into an isolated temporary client directory and confirm no
  diagram, `tests/`, or `.docs/tests/` path is installed.
- [x] Run `git diff --check` and verify no stale root `SKILL.md` or `.docs/tests/` paths remain.

## Validation

- `npm --prefix <temporary bang-restart fixture> test` exits 0.
- All shell blocks extracted from `tests/test-intent-based-routing.md` pass `bash -n`.
- `python3 /Users/esun/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/esun/Documents/Projects/rpd/skills/rpd` prints `Skill is valid!`.
- An isolated `npx skills add` installation contains only `SKILL.md`, with no diagram or
  repository test paths.
- `git diff --check` exits 0.

## Rollback / Risk

- The main risk is breaking discovery for users who install from the repository root. Explicitly selecting `--skill rpd` and a local install smoke test cover that boundary.
- Path assertions can silently keep testing the old root skill; static absence checks must reject stale root references.
- Roll back by restoring the root skill files and `.docs/tests/` only if the nested skill cannot be discovered by the supported installer.
