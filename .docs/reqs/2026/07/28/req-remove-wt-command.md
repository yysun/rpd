# Remove the WT Command

## Problem

RPD exposes `WT` as a dedicated command for creating a Git worktree and moving story documents into it. Modern agent hosts increasingly manage isolated worktrees themselves, while RPD's fixed branch, directory, and document-moving policy can conflict with host-native behavior. Worktree provisioning is environment orchestration rather than a stage in the RPD delivery lifecycle.

## Requirement

Remove `WT` from RPD's public command contract and all user-facing workflow guidance. RPD must remain neutral about how an agent host provisions or selects a worktree.

## Acceptance Criteria

- [x] `SKILL.md` no longer advertises, routes, defines, or applies conventions to a `WT` command.
- [x] `README.md` no longer lists, explains, or applies special behavior to a `WT` command.
- [x] The documented command count matches the remaining command set.
- [x] `SKILL.md` reports major version `3.0.0` for the breaking command-contract change.
- [x] No replacement command, compatibility alias, deprecation path, or manual worktree policy is introduced.
- [x] The core RPD sequence and infographic remain unchanged.

Criteria were verified retroactively on 2026-07-28; see the dated section in the matching plan for
the commands and results. The fourth criterion names an exact version, so it is evidenced against
the commit that shipped the removal (`d501852`, `2.2.0` to `3.0.0`) rather than the working tree,
which has since advanced. The criterion text is left as written rather than relaxed to `3.x`.

## Constraints

- Preserve ordinary uses of the word `worktree` that describe Git-visible review state rather than the removed command.
- Keep the change limited to the RPD command contract and its documentation.
- Do not alter any other command behavior.

## Non-Goals

- Teaching users how to create worktrees manually.
- Standardizing host-specific branch or worktree conventions.
- Changing the RPD lifecycle, review gates, or artifact paths.
- Regenerating the infographic, which does not include `WT`.
