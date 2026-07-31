# Include Completion Documentation in Planned Routing

## Problem

Planned routing creates a durable requirement, implementation plan, and verification record, but
currently stops immediately after `VR`. That leaves the story's documentation describing intent
and execution without the completion summary that records what actually changed and which checks
ran. Conversely, `!!` currently includes `GC` merely because it restarts the full sequence. Treating
`DD` like `GC`, or treating a correction as commit authorization, conflates reversible workflow
actions with a history-changing commit.

## Requirement

When a natural-language implementation request automatically selects planned routing, the workflow
must write the story's `DD` completion document after `VR` passes, then stop without committing.
The `!!` correction-and-restart flow must use the same `VR* → DD` terminus and must not run `GC`.

## Acceptance Criteria

- [ ] The planned-routing terminus is `SS(+CR*) → TT → ET? → VR* → DD`, with `DD`
      running only after verified completion.
- [ ] Planned routing still stops before `GC`; committing requires explicit `RPD` or `GC` intent.
- [ ] `!!` reconciles and re-executes the current story through `VR* → DD`, then stops without
      committing or pushing.
- [ ] When `!!` restarts a story with an existing matching completion document, that document stays
      unchanged until `VR` passes and is refreshed by the downstream `DD` stage; its existence does
      not create a VR/DD dependency cycle.
- [ ] An incomplete or blocked planned route does not write a misleading completion document.
- [ ] Direct routing remains unchanged: it stops after `CR` and creates no RPD artifacts.
- [ ] `skills/rpd/SKILL.md`, `README.md`, the workflow diagram, and static contract coverage agree
      on the new planned-route and `!!` termini.
- [ ] At least one agent-execution scenario for an ordinary planned implementation requires a
      scoped completion document and unchanged Git history.
- [ ] Agent-created Markdown E2E specs use `## Scenario` sections with one or more non-empty Given,
      When, and Then steps grouped in that order; canonical assertions accept ordinary list markers
      followed by whitespace and blank-line spacing while rejecting missing, empty, or reordered
      steps.
- [ ] Checkbox-only AP progress recorded after CR for later `TT` or `ET` work does not invalidate
      CR when task text, order, scope, and all other plan content remain unchanged; substantive AP
      edits still require CR to rerun.
- [ ] The skill version and changelog identify the behavior change, and repository validation
      passes.

## Constraints

- Preserve standalone `DD` and explicit full `RPD` behavior, and preserve every `!!` behavior other
  than its automatic commit.
- Do not make `DD` an AP checkbox task; `VR` must still finish every implementation and
  verification task before completion documentation runs.
- Keep `README.md`'s Intent Routing section byte-identical to the corresponding skill section.
- Keep the installable skill self-contained under `skills/rpd/`; the diagram and repository E2E
  suite remain repository-only assets.
- Publish this contract change as `3.6.0`, per the repository owner's explicit release decision.
- Qualify the repository's versioning-policy claim so it does not falsely describe the
  owner-directed `3.6.0` compatibility decision as strict Semantic Versioning.

## Non-Goals

- Automatically committing planned-route changes.
- Automatically committing `!!` correction changes.
- Adding completion documentation to the direct path.
- Changing the command set, artifact paths, review loops, or E2E applicability rules.
- Rerunning the entire multi-agent intent-routing suite.
