# Intent-Based RPD Routing

## Problem

RPD currently treats every natural-language development request as planning-only work: it creates REQ and AP, runs AR, and then stops until the user supplies another workflow keyword. This ignores explicit implementation intent and makes small, low-risk fixes pay the same documentation and review cost as architectural changes.

The separate DF command also creates an unnecessary second implementation path. Its useful root-cause, regression-test, and verification behavior belongs in ordinary bug-fix execution rather than behind a special keyword.

## Requirement

RPD must route ordinary development requests from the user's expressed intent and the change's risk. Explicit workflow commands must retain their documented stage scope, but natural-language implementation requests must not require a special command token before source code can be changed.

An ordinary natural-language implementation request must use a direct path without creating REQ, AP, or AR artifacts only when every direct-path condition is supported by repository evidence. If any condition is false, uncertain, or unsupported, RPD must use REQ, AP, and AR before implementation. When RPD auto-enters those stages from that implementation request, a successful AR must continue into implementation without asking for another approval.

Remove DF as a command and fold its useful bug-diagnosis obligations into direct bug-fix execution and planned implementation where applicable.

## Acceptance Criteria

- [x] No RPD contract says that ordinary natural-language implementation requests require `SS`, `DF`, `VR`, or `RPD` authorization before editing source code.
- [ ] Explicit `REQ`, `AP`, `AR`, `DD`, `WT`, and `!!` invocations remain limited to their documented stage and do not implicitly authorize source changes.
- [x] A natural-language request that clearly asks to implement or fix a change proceeds without a second approval; direct-path work starts directly, while planned-path work continues after AR only when RPD auto-entered REQ/AP/AR from that request.
- [x] A change bypasses REQ, AP, and AR only when repository evidence shows it is localized, follows an existing pattern, changes no public API, schema, persistence, migration, authentication, security, privacy, external integration or dependency contract, infrastructure, deployment, concurrency, performance, availability, or reliability behavior, is readily reversible, and has clear expected behavior and verification.
- [x] After ordinary natural-language implementation intent is established, any false, uncertain, or unsupported direct-path condition causes RPD to create or update REQ and AP, run AR, and continue into implementation after AR passes.
- [x] File count alone does not select the planned path, and a small textual diff alone does not select the direct path.
- [x] Ordinary natural-language requests limited to explanation, diagnosis, review, requirements, planning, or architecture review remain non-implementing unless the user also requests a change; explicit workflow commands such as `CR` and `VR` retain their documented behavior.
- [x] `DF` is absent from the skill trigger keywords, command definitions, routing rules, workflow summaries, and user-facing command reference.
- [x] Every direct implementation makes a surgical change, runs relevant verification, reports truthful evidence, and runs CR under the existing review-delegation contract.
- [x] Direct and planned bug-fix execution additionally reproduces or localizes the failure when practical, identifies the root cause, applies the smallest causal fix, adds, updates, or confirms existing regression coverage when a clear test location exists, runs the relevant regression or unit verification before CR, and reports the symptom, cause, affected path, fix, and result.
- [x] Standalone `SS` remains implementation from an approved plan and does not become the natural-language direct-routing mechanism.
- [ ] Existing `REQ`, `AP`, `AR`, `SS`, `TT`, `ET`, `CR`, `VR`, `DD`, `GC`, `WT`, `!!`, and full `RPD` workflows remain available.
- [ ] Routing examples or scenarios prove that a localized low-risk bug fix skips REQ/AP/AR, while a public-contract, security-sensitive, cross-system, or materially uncertain change runs REQ/AP/AR.
- [x] README text and visuals do not present REQ/AP/AR as mandatory before every code change.
- [ ] The README reports 13 commands after DF removal.
- [ ] The skill metadata validates after the breaking command removal and reports version `3.0.0`.

Five criteria were unchecked on 2026-07-28 during a review of this repository's own RPD artifacts.
They fall into three groups.

Superseded by `remove-wt-command` in `3.0.0`, which removed `WT` and reduced the command set to 12:
the second criterion, the "existing workflows remain available" criterion, and the "README reports
13 commands" criterion. All three held when this story shipped in `2.2.0` and were reversed by a
later, deliberate decision rather than left unfinished.

Unsupported pending execution: the routing-scenarios criterion. The scenarios are written in
`.docs/tests/test-intent-based-routing.md`, but the proof it claims is behavioral, and the matching
`ET` task in this story's plan has never been run. Written scenarios are not executed scenarios.

Never satisfied: the version criterion. It requires `3.0.0`, but `git show 3189302:SKILL.md` shows
this story shipped as `2.2.0`; `3.0.0` arrived later with the `WT` removal. The criterion was
checked in error. The metadata-validation half does hold. Like the version criterion in
`remove-wt-command`, this one pins a literal rather than naming the property, and it is left as
written rather than relaxed.

## Constraints

- Keep explicit documentation-only commands safe and stage-scoped; removing the natural-language gate must not turn `REQ`, `AP`, or `AR` into implementation approval.
- Base routing on concrete repository evidence and risk, not estimated line count or a vague “large change” label.
- Preserve independent AR and CR review requirements where their existing conditions apply.
- Do not weaken truthful verification, surgical-change, or blocker handling rules.

## Non-Goals

- Preserve `DF` as an alias, compatibility command, fallback mode, or deprecated synonym.
- Make every natural-language development message an implementation request.
- Eliminate REQ, AP, AR, or the full RPD workflow.
- Introduce a numeric file-count, line-count, or effort threshold for planning.
- Automatically commit ordinary natural-language fixes unless the user invokes a workflow that includes GC or separately asks for a commit.
