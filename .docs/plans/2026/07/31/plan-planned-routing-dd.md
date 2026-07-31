# Plan: Include Completion Documentation in Planned Routing

## Goal

Auto-entered planned routing and `!!` corrections close a successfully verified story with `DD`
and then stop, while `GC` remains explicitly authorized and direct routing remains unchanged.

## Current Context

- `skills/rpd/SKILL.md` and `README.md` currently define the planned-routing terminus as
  `SS(+CR*) → TT → ET? → VR*`, followed by a sentence that reserves both `DD` and `GC`
  for explicit requests.
- `DD` already requires completed implementation, verification, and reviews, and writes a concise
  `.docs/done/{yyyy}/{mm}/{dd}/{name}.md` summary. No DD command behavior needs redesign.
- `RPD` and `!!` already run `DD` after `VR` and before `GC`. Planned routing should reuse that
  ordering and stop after `DD`; `!!` should also stop there because correction intent is not commit
  intent. Only explicit `RPD` retains the full sequence through `GC`.
- `README.md` embeds `rpd-loop.png`. The planned-path lane currently ends at `VR*` and says “Stop
  after verified completion,” while the red restart lane ends at `GC`. The amber lane must show
  documented completion, and the red lane must stop at `DD`, without changing the direct or
  full-RPD lanes.
- Scenario 3 in `.docs/tests/test-intent-based-routing.md` is an ordinary natural-language public
  contract fix that exercises planned routing and already asserts unchanged Git history. It is the
  narrowest execution case for requiring the new completion document.
- Scenarios 5 and 6 are also successful natural-language planned routes. Their DD expectations and
  path allowlists must change with Scenario 3 or they will reject compliant behavior.
- Scenario 16 statically asserts the current terminus sequence and exact version shape. It can
  enforce the new sequence in both contract copies.
- The planned sequence runs CR inside SS before TT and ET. AP checkbox markers for those later tasks
  therefore change after CR even when plan content does not; hashing raw markers makes the final CR
  snapshot invariant unsatisfiable.
- Canonical Scenario 11 executes `!!` and currently requires one commit. It is the direct execution
  proof to invert: require DD, unchanged seed `HEAD`, scoped uncommitted changes, and no GC claim.
- Canonical Scenarios 3, 5, and 6 assert Given/When/Then E2E structure, but the public AP contract
  currently says only “human-readable scenarios.” Clean execution agents therefore produced valid
  numbered scenarios that failed an unstated harness format requirement. The contract and static
  coverage must make that structure explicit before those cases can serve as canonical evidence.
- A corrected story may already have a matching DD. The current VR wording treats stale done docs
  as incomplete even though DD runs after VR, creating a cycle. VR must ignore the freshness of its
  downstream completion summary while still requiring current REQ/AP/test docs.
- Adding DD to planned routing is backward-compatible, while removing automatic GC from `!!` can
  affect callers that relied on its documented commit. The repository owner explicitly selected
  `3.6.0` for the combined release despite that compatibility impact; the changelog must state the
  behavior change plainly.

## Decisions

- Treat `DD` as story closure, not delivery: it is automatically included only after a successful
  planned-route `VR`, while `GC` remains the explicit history-changing boundary.
- Treat `!!` as correction and re-execution authorization, not commit authorization. It uses
  `AR* → SS(+CR*) → TT → ET? → VR* → DD` and stops.
- State the pause rule directly: if `VR` cannot pass, planned routing stops without `DD`.
- Preserve the direct path exactly. It intentionally creates no RPD artifacts, so adding `DD`
  there would contradict its purpose.
- Update the existing Scenario 3 execution contract rather than adding another expensive agent
  case with the same fixture and route.
- Give successful planned routes and `!!` a neutral commit policy in the harness: follow only the
  route's authorization, with the evidence contract neither requiring nor forbidding GC. An
  injected “Do not commit” instruction would mask whether the workflow contract itself stops at DD.
- Make DD ordering observable in the terminal VR evidence: the VR reviewer must verify and report
  that a new story has no matching completion document, or that a restarted story's tracked
  matching document is unchanged from `HEAD`, before its decision. Final assertions then require
  post-VR creation or refresh by DD.
- Treat AP checkbox markers as recorded progress, not reviewed plan content. Normalize only task
  markers inside `## Phased Tasks` for AR and CR hashes, retain raw markers for VR, and exempt
  marker-only progress from AR/CR reruns when task text, order, scope, and every other plan byte
  remain unchanged; substantive AP edits still invalidate all affected stages.
- Add a focused story E2E spec that checks the durable contract and points to Scenario 3 for the
  execution proof, keeping the story independently verifiable without duplicating the full harness.
- Update the existing diagram rather than tolerating a visual contradiction. Preserve its layout
  and style; extend the amber planned-path lane with `DD`, change its stop label to “Stop after
  documented completion,” and remove only `GC` from the red restart lane.
- Reject making `DD` an AP task. Workflow stages remain outside implementation checkboxes, and
  `VR` must pass before the completion summary is truthful.
- Reject auto-running `GC` from either planned routing or `!!`. A local commit changes history and
  remains a separate authorization boundary granted by explicit `RPD` or `GC` intent.
- Reject a major version bump for this release because the repository owner explicitly selected
  `3.6.0`; preserve the compatibility warning in release notes instead of hiding it.
- Qualify the changelog's strict SemVer claim for this owner-directed exception rather than leaving
  an objectively false policy statement.
- Reject feature flags, environment variables, fallback modes, and compatibility layers. This is
  one unconditional workflow contract; parallel behavior would make routing ambiguous.

## Phased Tasks

### Phase 1 - Contract and version

- [x] Update the Planned-routing terminus in `skills/rpd/SKILL.md` to append `DD`, require `VR` to
      pass before it runs, and reserve only `GC` for explicit intent.
- [x] Update the `!!` contract in `skills/rpd/SKILL.md` so reconciliation restarts through `DD` and
      stops without `GC`, preserving all current-story, stale-gate, and completion-loop behavior.
- [x] Reconcile every duplicated `!!` commit reference in `skills/rpd/SKILL.md`: Intent Routing,
      Conventions, the DD section, and the `!!` command sequence must all stop at DD.
- [x] Update `VR` in `skills/rpd/SKILL.md` and README Notes so neither requires a downstream DD
      artifact to be fresh before VR can pass; keep stale REQ/AP/test docs as incomplete work and
      keep the two public contracts aligned.
- [x] Mirror the revised Intent Routing text byte-for-byte in `README.md` and adjust nearby planned
      routing guidance, the dedicated `!!` workflow section, the Commands Reference, and Notes so
      every restart description stops at DD.
- [x] Bump the version in `skills/rpd/SKILL.md` and `README.md` from `3.5.0` to `3.6.0`.
- [x] Add a `3.6.0` changelog entry explaining both changes: planned routing closes with `DD`, and
      `!!` no longer auto-commits.
- [x] Qualify `CHANGELOG.md`'s version-policy statement to disclose the owner-directed `3.6.0`
      compatibility exception.
- [x] Add focused and Scenario 16 assertions for the qualified `3.6.0` version-policy statement so
      strict SemVer adherence is not claimed unconditionally.

### Phase 2 - Visual and executable contract coverage

- [x] Update `rpd-loop.png` so the planned lane ends in `DD`, its stop label says documented
      completion, and the red restart lane ends in `DD`, without changing the direct or full-RPD
      lanes.
- [x] Update the README image alt text so it describes the planned path through `DD` and the full
      RPD path through `GC`, and states that `!!` stops at DD without GC.
- [x] Update Scenario 3 in `.docs/tests/test-intent-based-routing.md` to require exactly one scoped
      `public-status.md` completion document while preserving the unchanged-HEAD assertion.
- [x] Update successful planned-route Scenarios 5 and 6 in
      `.docs/tests/test-intent-based-routing.md` to require their scoped DD artifacts, allow those
      paths, and describe completion through DD.
- [x] Update Scenario 16 in `.docs/tests/test-intent-based-routing.md` to assert the new planned
      sequence, the new `!!` sequence, their no-automatic-`GC` boundary, and the unchanged
      direct-path and explicit-RPD termini; also assert that SKILL and README exclude downstream DD
      freshness from VR while stale REQ/AP/test docs still block it.
- [x] Update Scenario 11 in `.docs/tests/test-intent-based-routing.md` to remove its local `Do not
      commit.` instruction, require `!!` to write DD, leave `HEAD` at the seed commit with only
      scoped uncommitted story changes, and make no GC claim.
- [x] Update the shared Common Execution Procedure so successful planned cases and `bang-restart`
      receive a neutral route-authorized policy and an unchanged-seed-HEAD precondition, removing
      both the old one-commit exception and the masking `Do not commit.` instruction.
- [x] Extend the VR evidence contract and helpers so terminal VR review logs prove `.docs/done` was
      absent for a new story or unchanged for a restarted completed story before the pass, then
      require post-VR creation/refresh evidence in Scenarios 3, 5, 6, and 11.
- [x] Seed Scenario 11's completed fixture with a tracked `public-status.md` completion document,
      require terminal VR evidence that it remained unchanged, and require downstream DD to modify
      it after the pass.
- [x] Update the canonical `assert_ar_before_code` helper and Common Execution Procedure so they
      require at least one passing pre-implementation AR snapshot with no source/test changes plus a
      passing terminal AR snapshot, allowing a legitimate post-implementation completion-loop plan
      repair to rerun AR without erasing proof of the original gate.
- [x] Update Independent Review Delegation in `skills/rpd/SKILL.md` and README Notes so AP
      checkbox-marker-only progress does not invalidate AR or CR when all plan content is unchanged,
      while substantive plan edits still require reruns.
- [x] Normalize AP checkbox markers alongside REQ acceptance markers in both canonical snapshot
      hash implementations for AR/CR only, limit normalization to tasks inside `## Phased Tasks`,
      retain raw AP markers for VR, and update the explanatory text.
- [x] Save the operator-supplied snapshot hash for every AR/CR/VR attempt, compare it with the
      reviewer's recomputed hash in `assert_terminal_review`, pass the review phase explicitly to
      every `snapshot_hash` call, and compare terminal VR with the final VR-stage hash.
- [x] Add Scenario 16 and focused assertions for the marker-only CR exemption and normalized-plan
      snapshot contract.
- [x] Add temporary-copy mutation checks proving AR/CR hashes ignore only Phased Tasks marker
      toggles, detect task text/order/addition/removal and non-marker plan edits, and VR detects the
      marker toggles; also prove checkbox-shaped content outside Phased Tasks changes every hash.
      Use canonical execution cases' saved supplied hashes to compare reviewer and operator hash
      implementations on real AR/CR/VR snapshots.
- [x] Add an explicit no-DD assertion to canonical Scenario 4 so an AR-blocked planned route cannot
      produce a completion document.
- [x] Add `.docs/tests/test-planned-routing-dd.md` with focused static and execution-evidence
      scenarios for the changed public workflow contract.
- [x] Require Markdown E2E specs to use `## Scenario` sections with one or more non-empty Given,
      When, and Then steps grouped in that order; make canonical assertions accept ordinary list
      markers followed by whitespace and blank-line spacing; and add positive plus
      missing/empty/reordered negative coverage.

### Phase 3 - Verification

- [x] Extract and execute every fenced shell block in `.docs/tests/test-planned-routing-dd.md`
      independently with Bash; require all six to exit 0.
- [x] Execute canonical Scenario 3's Common Execution Procedure against a fresh
      `public-api-bug` fixture using a clean-context agent; require the completion-document,
      unchanged-HEAD, review, test, and E2E assertions to pass.
- [x] Execute canonical Scenario 4's Common Execution Procedure against a fresh
      `uncertain-profile-bug` fixture using a clean-context agent; require `AR blocked`, unchanged
      source/history, and the explicit no-DD assertion to pass.
- [x] Execute canonical Scenario 11's Common Execution Procedure against a fresh `bang-restart`
      fixture using a clean-context agent; require reconciliation, DD, unchanged `HEAD`, scoped
      uncommitted changes, and absence of a GC claim.
- [x] Execute canonical Scenarios 5 and 6 against fresh fixtures using clean-context agents;
      require each successful planned route to prove pre-VR DD absence, post-VR scoped DD presence,
      unchanged `HEAD`, and no GC claim.
- [x] Extract and execute Scenario 16's complete fenced static-contract block with Bash and a fresh
      `E2E_ROOT`; require exit 0, including its isolated `npx skills add` packaging check.
- [x] Resolve `RPD_SKILL_VALIDATOR` to its documented default, require the file to exist, and run
      `python3 "${RPD_SKILL_VALIDATOR}" skills/rpd`; require `Skill is valid!`.
- [x] Render or inspect `rpd-loop.png` and confirm the planned lane, stop label, full-RPD lane, and
      restart lane are legible and semantically correct at 1672×941; compare against the original
      composition so the direct, full-RPD, restart, title, and legend content remain intact.
- [x] Run `git diff --check` and review the scoped diff for contradictions or unintended workflow
      changes.

## Validation

- For each scenario number `1`, `2`, `3`, `4`, `5`, and `6`, extract its fenced `sh` block to a
  separate temporary script with Perl and run `bash <script>`; all six exit 0 without shared shell
  state.
- The canonical Scenario 3 agent case passes every assertion, including exactly one DD artifact and
  unchanged Git history; canonical Scenario 4 passes every assertion, including no DD artifact.
- Canonical Scenarios 5 and 6 pass every assertion, including pre-VR DD absence, post-VR DD
  presence, unchanged Git history, scoped working-tree paths, and no GC result.
- The canonical Scenario 11 agent case passes every assertion, including DD, unchanged seed `HEAD`,
  a pre-VR unchanged completion document, a post-VR refreshed completion document, scoped
  uncommitted changes, and no GC result.
- Extract Scenario 16's fenced block with Perl, set `E2E_ROOT` to a fresh temporary directory, and
  run it with Bash; the complete block exits 0.
- `RPD_SKILL_VALIDATOR="${RPD_SKILL_VALIDATOR:-${HOME}/.codex/skills/.system/skill-creator/scripts/quick_validate.py}"`; `test -f "${RPD_SKILL_VALIDATOR}"`; `python3 "${RPD_SKILL_VALIDATOR}" skills/rpd` prints `Skill is valid!`.
- Extracted Intent Routing sections from `skills/rpd/SKILL.md` and `README.md` compare identical.
- Visual inspection confirms `rpd-loop.png` shows planned routing ending at `DD`, before `GC`.
- `git diff --check` exits 0.

## Rollback / Risk

- This changes workflow behavior for every future natural-language implementation that selects
  planning: it creates one additional tracked documentation artifact after successful completion.
- Removing GC from `!!` has compatibility impact: existing users who expect a finished commit will
  now receive verified, documented, uncommitted story changes and must invoke `GC` explicitly. The
  owner-directed `3.6.0` version does not remove that migration concern.
- A poorly worded terminus could accidentally imply that blocked work writes `DD` or that planned
  work auto-commits. Static assertions and the Scenario 3 unchanged-HEAD check guard both risks.
- A harness-level “Do not commit” instruction can create a false positive for the no-GC contract;
  neutral commit policy plus unchanged-HEAD assertions make route authorization causal.
- Raw AP checkbox markers in the CR snapshot would make the documented `CR → TT → ET` ordering
  self-invalidating. Normalize markers only; never normalize task text or other plan content.
- Final DD existence alone cannot prove ordering. Terminal VR reviewer evidence must record that a
  new story's DD was absent or a restarted story's existing DD was unchanged before the VR pass.
- Requiring all of `.docs/done` to be absent would block repositories with unrelated history and
  completed-story restarts. Evidence and updates must target only the current story's DD.
- Diagram generation can introduce text or layout defects. Edit from the current PNG with the
  image-generation workflow, constrain the change to the amber planned lane, its stop label, and
  removal of the red `GC` box, retain the 1672×941 canvas, and inspect the result at full resolution
  against the original.
- Rollback is a clean revert of the contract, version, diagram, test, and release-note changes; no
  migration or compatibility layer is needed.
