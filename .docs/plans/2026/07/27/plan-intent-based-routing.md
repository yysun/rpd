# Plan: Intent-Based RPD Routing

## Goal

Make RPD respect explicit natural-language implementation intent, send only genuinely risky or uncertain changes through REQ/AP/AR, and remove DF without losing disciplined root-cause diagnosis or regression verification.

## Current Context

- `skills/rpd/SKILL.md` and `README.md` contain the current intent-routing contract and expose 12 commands after the separate DF and WT removals.
- Direct implementation is intended to stop after CR with no REQ/AP/AR/VR artifacts; planned natural-language implementation continues after AR through TT, optional ET, and VR.
- The first isolated E2E attempt over-routed a localized internal fix because the shared evidence suffix appeared to require every review stage and did not define `Source/test changes` relative to the reviewed Git snapshot.
- Read-only requests need an explicit no-review assertion because reviewer logs live outside the isolated repository and can otherwise escape repository-cleanliness checks.
- `README.md` retains `rpd-loop.png`, which now depicts both risk-based direct and planned paths.
- The repository has no application build or unit-test runner. Validation is skill-schema validation, contract searches, isolated routing scenarios, Git diff inspection, and review.

## Decisions

- Replace the rigid `Command Gate` with intent-and-risk routing. Explicit workflow keywords remain authoritative stage selectors; ordinary language is interpreted by requested outcome.
- Define a direct path using the existing low-risk architecture criteria because they already name the material boundaries. Require concrete repository evidence for every condition; uncertainty selects planned routing.
- Keep explicit stage behavior precise: `REQ` runs REQ only, `AP` runs AP and its existing AR gate, `AR` reviews existing artifacts, and full `RPD` runs its complete sequence. Automatically run the REQ/AP/AR trio only for implementation work that fails any direct-path condition.
- Continue automatically from AR to implementation only when RPD auto-entered REQ/AP/AR from an ordinary natural-language implementation request or is running full `RPD`. Explicit standalone REQ/AP/AR remains stage-scoped even if its argument mentions later implementation.
- Remove DF completely without a compatibility alias. Merge its causal-debugging duties into direct bug-fix routing and the SS contract for planned bug fixes.
- Keep standalone SS as implementation from an existing approved plan. Natural-language direct execution is a routing path, not a renamed SS mode.
- Give every direct implementation one shared execution contract: make a surgical change, run relevant verification, report truthful evidence, and run CR under the existing delegation rules. Add failure localization, causal diagnosis, minimal root-cause repair, added, updated, or confirmed existing regression coverage, relevant regression or unit verification before CR, and cause reporting when the direct or planned change is a bug fix.
- Do not use file count, estimated effort, or diff size as the routing rule. Those are weak proxies for contract and operational risk.
- Treat this as a breaking workflow change and advance the skill's major version.
- Do not add feature flags, environment variables, fallback modes, or deprecated DF behavior.
- Keep the routing E2E spec host-orchestrated and human-readable, as required by the existing AP contract. Use the current runtime's collaboration/subagent results plus isolated repository state: have each execution agent save nested reviewer responses verbatim to a supplied evidence root, validate exactly one terminal evidence block, require stable snapshot hashes and unchanged reviewer state, bind the post-test marker to the tested package/source/test digest, and compare the terminal CR snapshot with final repository state. Do not depend on a host event exporter that the runtime does not expose.
- Treat public API and consumer-contract changes as E2E-requiring subject matter even when the current implementation exposes only a pure function with no live transport.
- Keep AP checkbox state coherent with the review lifecycle: plan implementation and verification work, exclude workflow-stage and delivery bookkeeping, require every task complete before final VR so later DD/GC stages do not mutate the reviewed plan, and exempt checkbox-marker-only progress updates from AR invalidation only when task text, order, scope, and all other plan content are unchanged.

## Phased Tasks

### Phase 1 - Discovery and scope lock

- [x] Inspect every `DF`, `Command Gate`, natural-language routing, `Large changes`, SS-entry, AP-auto-AR, and full-RPD reference in `skills/rpd/SKILL.md` and `README.md` so no contradictory execution path remains.
- [x] Confirm `agents/openai.yaml` is absent and therefore needs no stale interface update.

### Phase 2 - Replace the routing contract

- [x] Update the `skills/rpd/SKILL.md` frontmatter trigger description and major version so `DF` is removed and the breaking routing behavior is discoverable.
- [x] Replace `Command Gate` in `skills/rpd/SKILL.md` with intent routing that distinguishes read-only requests, explicit stage commands, direct implementation, and planned implementation.
- [x] Use the same `## Intent Routing` contract text in `skills/rpd/SKILL.md` and `README.md`, including stage scoping for REQ, AP, AR, and DD, the documentation-only pre-AR reconciliation boundary for `!!`, and preservation of explicit CR/VR behavior.
- [x] Define every direct-path condition in `skills/rpd/SKILL.md` with repository-evidence requirements and route any false or uncertain condition through REQ, AP, and AR.
- [x] State in `skills/rpd/SKILL.md` that file count and diff size are not routing conditions.
- [x] Make planned natural-language implementation continue from a passed AR into implementation without requesting a second approval.
- [x] Update the AP E2E classification in `skills/rpd/SKILL.md` and `README.md` so public API and consumer-contract changes cannot be excluded merely because the current implementation is a pure function.
- [x] Exclude AR/CR/VR/DD/GC and delivery actions from AP checkboxes in `skills/rpd/SKILL.md` and `README.md`, require all AP tasks complete before VR, allow marker-only AP progress without rerunning AR only when task text/order/scope and all other plan content stay unchanged, preserve AR invalidation for substantive plan edits, and add static plus restart-route coverage for the invariant.

### Phase 3 - Remove DF and consolidate bug execution

- [x] Remove the DF command definition and every DF reference from `skills/rpd/SKILL.md` conventions, file-comment rules, implementation gates, trigger keywords, and workflow summaries.
- [x] Add a shared direct-implementation contract to `skills/rpd/SKILL.md` requiring surgical scope, relevant verification, truthful evidence, and CR for every direct change.
- [x] Add bug-specific duties to direct execution and planned SS in `skills/rpd/SKILL.md`: failure localization, root-cause explanation, minimal causal repair, added, updated, or confirmed existing regression coverage when a clear test location exists, relevant regression or unit verification before CR, and cause/result reporting.
- [x] Preserve standalone SS in `skills/rpd/SKILL.md` as implementation from an existing approved plan; do not use SS as the natural-language direct-routing mechanism.
- [x] Add explicit non-implementation/source-safety wording to the REQ, AP, AR, DD, and `!!` command sections so each retained stage contract is independently testable.
- [x] Confirm full `RPD` continues to use `REQ → AP → AR → SS → TT → ET? → VR → DD → GC` without introducing a replacement DF stage.

### Phase 4 - Align public documentation and scenarios

- [x] Update `README.md` to explain intent-and-risk routing, the exact direct-path conditions, and when REQ/AP/AR run.
- [x] Remove the `rpd-loop.png` embed from `README.md` so the old universal pre-code REQ/AP/AR visual does not contradict direct routing; do not modify the image asset. **Superseded 2026-07-28.** This task was marked complete when the story shipped, but the embed was never removed: it is present at `3189302` and in every commit since. The task's goal was met on 2026-07-28 by the opposite means, regenerating the diagram around risk-based routing so it no longer contradicts the direct path. The embed and the modified asset are both intentional.
- [x] Remove DF from the `README.md` command table and every workflow note, preserve the remaining command descriptions, and reconcile the later WT removal to the current 12-command set.
- [x] Add deterministic fixtures and an execution procedure to `.docs/tests/test-intent-based-routing.md` for a low-risk localized fix, a low-risk non-bug change, a materially uncertain fix, public API or schema work, security-sensitive work, external-integration or dependency-contract work, explicit REQ/AP/AR stop behavior, planned implementation continuation after AR, read-only diagnosis, and absence of DF semantics.
- [x] Add read-only verification-digest helpers to the executable fixtures so terminal CR can prove the reviewed package/source/test inputs are the same inputs that passed `npm test`.
- [x] Make the shared evidence suffix conditional so it cannot authorize AR, CR, or VR outside the route selected from the request and skill.
- [x] Define `Source/test changes` as Git-visible reviewed-snapshot state relative to `HEAD`, separate from reviewer non-mutation.
- [x] Assert every execution route runs all and only its owned review stages, including planned-route VR/ET and standalone DD scope.
- [x] Confirm the routing docs do not add a compatibility alias, feature flag, fallback, numeric size threshold, or automatic commit for ordinary fixes.

### Phase 5 - Validate and review

- [x] Run the skill-creator `quick_validate.py` command against the repository skill and record a successful result.
- [x] Run targeted `rg` assertions proving `DF` and the old natural-language stop rule are absent from `skills/rpd/SKILL.md` and `README.md`, while every remaining command is still documented.
- [x] Run `ET` to execute the complete intent-routing scenario matrix from its dotfile-safe fixture-copy, resolved-prompt, seed-SHA, full-repository change allowlist, section-bounded artifact-content, saved terminal-review evidence, final-result, stable-snapshot, digest-bound verification marker, and fail-fast assertion procedure in isolated temporary workspaces with clean-context agents.
- [x] Inspect `git diff --check`, the complete `git diff -- skills/rpd/SKILL.md README.md`, and direct contents of the new or updated `.docs/` files.
- [x] Mark tasks complete only when the corresponding edit or evidence exists.

## Validation

- Skill schema and version: run `python3 /Users/esun/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/rpd` and require a successful result; confirm the documented major version still represents the breaking DF removal without pinning a routine later release.
- Removed command: run `rg -n '\\bDF\\b|Diagnose and fix root cause' skills/rpd/SKILL.md README.md` and require no matches.
- Removed rigid gate: run `rg -n 'without an explicit implementation command|then stop unless|approval to code|approval to implement' skills/rpd/SKILL.md README.md` and inspect every remaining match; none may require a special keyword for a clear natural-language implementation request.
- Routing contract: isolate the intent-routing sections and require explicit coverage of localized scope, existing pattern, public API, schema, persistence, migration, authentication, security, privacy, external integration, dependency contract, infrastructure, deployment, concurrency, performance, availability, reliability, reversibility, expected behavior, and verification; confirm `skills/rpd/SKILL.md` and `README.md` agree that any false, uncertain, or unsupported condition selects planned routing.
- E2E classification: require `skills/rpd/SKILL.md` and `README.md` to state that public API and consumer-contract stories need E2E coverage even when implemented as a pure function without a live UI, network call, or transport.
- AP task lifecycle: require AP checkboxes to exclude AR/CR/VR/DD/GC and delivery bookkeeping, require VR to block on any unchecked AP task, and require the `!!` restart scenario to finish with no unchecked plan tasks before DD/GC claims are accepted.
- Review invalidation: static assertions must prove marker-only AP progress is the sole AP exception after AR and that the general rerun rule still covers any task-text, order, scope, or other substantive plan change.
- Command preservation: confirm `REQ`, `AP`, `AR`, `SS`, `TT`, `ET`, `CR`, `VR`, `DD`, `GC`, `!!`, and `RPD` remain in the command reference and WT remains absent.
- Explicit scope and full-flow preservation: inspect the revised REQ/AP/AR/DD/`!!`/SS and RPD command sections; require every named non-implementing or out-of-band stage to state its source boundary, standalone SS to name an existing approved plan, and the exact full sequence `REQ → AP → AR* → SS(+CR*) → TT → ET? → VR* → DD → GC` to remain present in both SKILL and README.
- README visual: require `rg -n 'rpd-loop\\.png' README.md` to return no matches and require `git diff HEAD --exit-code -- rpd-loop.png` to pass. **Superseded 2026-07-28.** Both halves are now inverted deliberately. The embed stays, so Scenario 16 requires exactly one reference, and the asset was regenerated, so an unchanged-image check no longer applies. The current requirement is that the diagram must not present REQ/AP/AR as mandatory before every code change.
- Intent contract identity and read-only scope: extract `## Intent Routing` from SKILL and README and require byte equality; require both copies to name explanation, diagnosis, review, requirements, planning, and architecture-review requests as non-implementing absent change intent, while preserving explicit CR and VR behavior.
- README command count: within the Commands Reference table, require exactly 12 command rows and exactly one row for each of `REQ`, `AP`, `AR`, `SS`, `TT`, `ET`, `CR`, `VR`, `DD`, `GC`, `!!`, and `RPD`; require WT to be absent.
- Scenario evidence: isolated direct runs must modify only the expected source/test artifacts, create no REQ/AP/AR docs, leave post-success pre-operator verification markers bound to the current package/source/test digest, and show terminal CR reviewed the final stable snapshot; planned bug runs must create exactly one expected REQ/AP pair, show terminal AR reviewed a source/test-clean snapshot, include a matching digest-bound verification marker in the terminal CR snapshot, implement only allowlisted files, and report non-empty symptom/cause/path/fix/result evidence; explicit REQ/AP/AR runs must stop without source edits, and explicit AP must preserve its seeded REQ byte-for-byte; external-integration cases must select planned routing.
- Diff integrity: `git diff --check` must pass, and every `skills/rpd/SKILL.md` and `README.md` hunk must belong to the routing and DF-removal scope.

## Rollback / Risk

- The main risk is replacing a clear but cumbersome authorization gate with ambiguous intent inference. Requiring explicit change intent and concrete evidence for every direct-path condition keeps non-implementing requests read-only and sends uncertainty to planning.
- Removing DF and replacing the natural-language authorization gate are breaking command-contract changes. A major version makes that break explicit; rollback is restoring the complete baseline routing contract, including the former gate, DF trigger and command section, README workflow text and visual, and affected routing tests.
- The direct-path criteria could still over-route simple fixes if evidence gathering is shallow. The contract must require a focused repository inspection but must not equate unfamiliarity with architectural risk after the evidence is available.
- The direct path could under-route deceptively small security, schema, or public-contract changes. Any affected risk boundary must force planned routing regardless of diff size.
