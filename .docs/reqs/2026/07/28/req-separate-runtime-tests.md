# Separate Runtime Skill from Repository Tests

## Problem

The repository root currently doubles as the installable RPD skill directory. Any committed test fixtures under that root can therefore be copied into client agent installations, increasing package size and exposing development-only eval material.

## Requirement

Separate the installable RPD skill from repository-only documentation and tests. Client installations must receive the runtime skill files without the repository test suite, while contributors must retain a tracked, runnable test suite at the repository root.

## Acceptance Criteria

- [x] The installable skill lives under `skills/rpd/` with a valid `SKILL.md`.
- [ ] Repository tests live under root `tests/`, outside the installable skill directory.
- [x] The workflow diagram remains at the repository root and is not installed to clients.
- [x] The root README and all test commands reference the new paths.
- [x] A local client-install smoke test proves that installed RPD files do not contain the repository test suite.
- [ ] Non-test story artifacts under root `.docs/` remain ignored.

The second and sixth criteria were satisfied when this story shipped in `3.2.1` and were then
deliberately reversed by `restore-docs-layout` in `3.2.2`: the suite moved back to `.docs/tests/`
so `ET` can resolve it, and root `.docs/` became tracked so this repository versions its own RPD
artifacts. They are unchecked because current evidence no longer supports them, not because work is
outstanding. The packaging separation this story existed to deliver is intact and still verified.

## Constraints

- Preserve the RPD skill name, version, command behavior, README content, and root diagram.
- Preserve all existing intent-routing fixtures and `!!` scenarios.
- Do not introduce a custom packaging script or client-specific fallback layout.

## Non-Goals

- Change the RPD workflow contract.
- Install or update the user's global RPD skill.
- Convert RPD into a plugin.
