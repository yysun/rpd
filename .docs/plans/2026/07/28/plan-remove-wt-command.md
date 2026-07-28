# Plan: Remove the WT Command

## Goal

Remove `WT` from the public RPD command set without changing the core workflow or unrelated Git worktree terminology used by review safeguards.

## Current Context

- `SKILL.md` includes `WT` in its metadata description, intent routing, story-name conventions, out-of-band rules, and command definition.
- `README.md` includes `WT` in intent-routing guidance, the command reference, stage-selector notes, and out-of-band notes.
- `README.md` currently states that RPD has 13 commands; removing `WT` leaves 12.
- `rpd-loop.png` presents the core lifecycle and does not mention `WT`.
- `.docs/tests/test-intent-based-routing.md` contains active static command-contract assertions in Scenario 12 and must be updated for the 12-command set.
- The preceding intent-routing requirement already classifies command removal as breaking and requires version `3.0.0`; the current `2.2.0` body value is stale.
- The latest repository contract intentionally keeps `version` and `repository` out of YAML frontmatter.

## Decisions

- Remove `WT` completely instead of deprecating it. A deprecation alias would preserve the host-orchestration conflict and add compatibility machinery for an out-of-band command.
- Do not replace `WT` with generic worktree instructions. Users and agents can use host-native capabilities or ordinary Git requests outside RPD.
- Preserve references to Git-visible `worktree state` in independent-review safeguards because those references are unrelated to the command.
- Report version `3.0.0` in the skill body because this removal is a breaking public-contract change and the existing intent-routing requirement already selected that major version.
- Preserve the lean YAML frontmatter with only `name` and `description`; do not reintroduce `version`, `repository`, or a `metadata` block.
- Update the existing intent-routing static scenario rather than creating a separate E2E spec.
- Preserve the core RPD sequence, artifact paths, and infographic.

## Phased Tasks

### Phase 1 - Scope lock

- [x] Inspect every bounded `WT` and worktree reference in `SKILL.md`, `README.md`, and `rpd-loop.png` to distinguish command-contract text from unrelated review terminology.
- [x] Confirm the remaining public command count is 12 and that no other file advertises the removed command.
- [x] Record the rejection of aliases, deprecation behavior, replacement commands, and manual Git instructions in the requirement and plan.

### Phase 2 - Remove the command contract

- [x] Update `SKILL.md` metadata and intent-routing language so `WT` is not recognized as an RPD command.
- [x] Remove `WT` from `SKILL.md` naming and out-of-band conventions without changing `!!` behavior.
- [x] Delete the `WT` command definition from `SKILL.md` while preserving unrelated review references to Git-visible worktree state.
- [x] Update the `SKILL.md` body to report major version `3.0.0` while preserving the lean YAML frontmatter.

### Phase 3 - Align user documentation

- [x] Update `README.md` intent-routing and command-count text for the 12-command set.
- [x] Delete the `WT` row and special-behavior notes from `README.md`.
- [x] Confirm `README.md` does not introduce replacement worktree policy or alter the canonical RPD sequence.
- [x] Update Scenario 12 in `.docs/tests/test-intent-based-routing.md` to require 12 commands and reject residual `WT` contract text.

### Phase 4 - Verification

- [x] Run `rg -n --hidden --glob '!.git/**' --glob '!.docs/**' '\bWT\b|story worktrees|WT may|WT and' .` and confirm it returns no matches anywhere in the shipped repository content.
- [x] Run `rg -n 'worktree' SKILL.md README.md` and confirm any remaining matches concern Git-visible review state only.
- [x] Count command rows under `README.md`'s `Commands Reference` section and confirm the heading states 12 workflow commands while the table contains exactly 12 entries.
- [x] Run the static assertions in `.docs/tests/test-intent-based-routing.md` Scenario 12 and confirm the skill schema, body version, lean frontmatter, trigger list, command sets, and canonical workflow contract pass.
- [x] Inspect `git diff --check` and the final diff to confirm clean Markdown and scope limited to the requirement, plan, test spec, `SKILL.md`, and `README.md`.

### Phase 5 - Status

- [x] Record verification evidence in this plan and mark tasks complete only after the corresponding edits or checks succeed.
- [x] Verify each acceptance criterion against the final repository state.

## Validation

- Repository-wide text-contract check: `rg -n --hidden --glob '!.git/**' --glob '!.docs/**' '\bWT\b|story worktrees|WT may|WT and' .` must return no matches. `.docs` is excluded because the requirement and plan intentionally retain the removed command name as historical decision evidence.
- Residual-term check: `rg -n 'worktree' SKILL.md README.md` may return only independent-review descriptions of Git-visible worktree state.
- Command-count check: `awk '/^## Commands Reference/{in_table=1; next} in_table && /^## /{in_table=0} in_table && /^\| `/ {count++} END {print count+0}' README.md` must print `12`, and `rg -n '^RPD gives you 12 workflow commands' README.md` must find the matching heading text.
- Skill schema and version: run `python3 /Users/esun/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/esun/Documents/Projects/rpd` successfully, require no `metadata`, `version`, or `repository` key in frontmatter, and require the body to contain exactly one `**Version:** \`3.0.0\`` line.
- Existing regression spec: run the static assertion block in `.docs/tests/test-intent-based-routing.md` Scenario 12 with a unique temporary `E2E_ROOT`.
- Formatting check: `git diff --check` must pass.
- Manual diff review must show no changes to the canonical workflow, other commands, artifact paths, or `rpd-loop.png`.
- No new E2E spec is needed because the existing intent-routing Scenario 12 owns the static command contract.

## Verification Evidence

- The repository-wide removed-contract search returned no matches.
- The residual `worktree` search returned only the independent-review safeguards in `SKILL.md:92` and `README.md:110`.
- The command-table count printed `12`, and the README heading states `12 workflow commands`.
- The skill-creator validator reported `Skill is valid!`; frontmatter contains no `metadata`, `version`, or `repository` key, while the body contains exactly one `**Version:** \`3.0.0\`` line.
- Scenario 12 passed after replacing its stale image and frontmatter-version assertions and adding exact trigger-list coverage for all 12 retained commands.

## Retroactive Verification - 2026-07-28

The Phase 5 acceptance-criteria check was never run when the story shipped, so all six criteria sat
unchecked while the removal was already released in `3.0.0`. It was run on 2026-07-28 against the
working tree. Three validation commands above no longer match the repository and were adapted; the
originals are left in place as the record of what was intended at the time.

- The removed-contract search needs `--glob '!CHANGELOG.md'` alongside the existing `.docs`
  exclusion. `CHANGELOG.md` did not exist when this plan was written and now names `WT` as release
  history, for the same reason `.docs` is excluded. With that glob added the search returns no
  matches.
- The skill path is now `skills/rpd/SKILL.md`, and the validator is invoked through
  `RPD_SKILL_VALIDATOR` rather than a hardcoded path. It reported `Skill is valid!`, frontmatter
  carries no `metadata`, `version`, or `repository` key, and the body holds exactly one
  `**Version:**` line.
- The static assertion block is Scenario 15, not Scenario 12; the suite gained scenarios after this
  plan was written. The block passes end to end, with its network install sub-step skipped.
- Residual `worktree` matches are limited to the independent-review descriptions of Git-visible
  state at `skills/rpd/SKILL.md:106` and `README.md:135`, which the requirement's constraint allows.
- The `Commands Reference` table holds exactly 12 rows and the README heading states 12 workflow
  commands.
- No deprecation notice, compatibility alias, or manual worktree policy appears in either document.
- `rpd-loop.png` is unmodified; its last commit remains `b170dca` from 2026-04-04.
- `git diff --check` is clean for both staged and unstaged changes.
- The fourth criterion pins version `3.0.0`, which the working tree has moved past. It is evidenced
  against `git show d501852:SKILL.md`, the commit that shipped the removal, which advanced `2.2.0`
  to `3.0.0`. The criterion text was not relaxed to keep it satisfiable.
- `git diff --check` passed with no output.
- Manual diff review confirmed changes are limited to removing `WT` contract text and correcting the count; the canonical sequence, other commands, artifact paths, and infographic are unchanged.

## Rollback / Risk

- Removing a published command is a compatibility break for users who still invoke `WT`; the deliberate rollback is to restore the removed command text from version control.
- Partial removal could leave stale routing behavior or an incorrect command count. Repository-wide text checks mitigate that risk.
- Over-broad deletion could remove review safeguards that use `worktree` in its ordinary Git sense; residual-term inspection protects that distinction.
