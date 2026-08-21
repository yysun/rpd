# RPD 3.8.0 Simplicity Restoration

## Problem

RPD 3.8.0 made review reruns faster but left the workflow contract much larger than the last simple
baseline. The installable skill grew from 2,001 words at `9015d14` to 7,666 words, AP became a fixed
five-phase template, review reporting became a state machine, README duplicated the contract, and the
maintainer harness retained snapshot hashes and verification digests that are not needed by the
production workflow.

## Requirement

Restore the shape of the pre-`7599c05` workflow without reverting useful behavior. Keep File Comment
Blocks, `!!`, intent-based implementation authorization, the AR gate, risk-based independent review,
complete uncapped findings, CR/TT/ET test ownership, and version `3.8.0`. Remove ceremony that does not
improve review judgment or execution safety.

## Acceptance Criteria

- [x] AP uses proportional, ordered checkbox tasks instead of a mandatory five-phase template.
- [x] One protected-boundary definition drives direct/planned routing and AR/CR/VR reviewer selection.
      Protected boundaries are public APIs or consumer contracts, schema/persistence/migrations,
      authentication/security/privacy, external dependencies or integrations, infrastructure/deployment,
      and concurrency/performance/availability/reliability behavior. Low risk additionally requires a
      localized existing pattern, reversibility, clear expected behavior, and clear verification;
      uncertainty is non-low-risk.
- [x] Low-risk AR, CR, and VR stay with the primary agent; protected or uncertain work uses an
      independent reviewer when available.
- [x] Review reruns use the same reviewer when possible and focus on unresolved findings plus affected
      areas; scope, risk-boundary, or reviewer changes force a full rerun.
- [x] Review results keep one risk reason, one round/reviewer disclosure, every material finding without
      a cap, and the terminal verdict; mandatory evidence matrices, finding IDs, checklist IDs,
      inventory counts, and review-action/scope fields are removed.
- [x] Review inputs must be stable while read, but the workflow and maintainer tests require no snapshot
      hash, verification digest, retained byte bundle, or path manifest.
- [x] E2E specs are required for observable boundaries or critical flows, not subject matter with no
      executable surface; CR never executes E2E or full unit/integration suites.
- [x] File Comment Blocks and the current `!!` restart-through-DD-without-GC behavior remain intact.
- [x] `SKILL.md` is the normative contract; README preserves RPD's existing product argument, workflow
      explanation, and command guide while removing only stale contract duplication.
- [x] README recommends the full `RPD` flow first, presents targeted commands as the secondary path,
      then explains automatic routing for ordinary requests, with `!!` last. The routing explanation
      remains inside `## Workflow`, not as a separate top-level contract section.
- [x] README Quick Start uses the prompt `Install RPD skill from GitHub yysun/rpd` and does not present
      an `npx` installation command.
- [x] Tier 2 remains outside ordinary TT/ET and is reduced to targeted routing/review behavior cases.
- [x] The repository validator, static contract checks, routing decisions, and relevant maintainer
      scenarios pass; the installed skill exactly matches `skills/rpd/`.
- [x] The release remains `3.8.0`; no 4.0.0 release metadata is introduced.
- [x] The installable skill is no more than 300 lines and 3,500 words.

## Constraints

- Preserve truthful verification, surgical changes, serial review gates, and primary-agent ownership
  of fixes.
- Do not add a findings cap, round cap, review budget, hash replacement, or hidden bypass.
- Do not restore the old requirement for a special command before an explicit implementation request.
- After VR and DD pass, amend the existing local unpublished 3.8.0 commit as the authorized delivery
  action; amendment is not an acceptance criterion that VR must prove beforehand.

## Non-Goals

- Removing AR, CR, VR, File Comment Blocks, `!!`, or independent review for protected work.
- Reverting the repository wholesale to `9015d14`.
- Running full project tests or E2E inside CR.
