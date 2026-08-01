# Tier 1 - Routing Decisions

**Cost:** 13 execution agents, zero reviewers. Each agent stops at the first review gate its route
requires, so planned-route cases never implement and direct-route cases never review.

**Proves:** the thesis the suite is named for — that ordinary natural-language requests route by
implementation intent and concrete risk, and that explicit commands stay inside their own stage
scope. It does **not** prove that the reviewed evidence is honest; that is [Tier 2](test-tier2-evidence-integrity.md).

## Common Execution Procedure

1. Run setup and every assertion block with `set -euo pipefail`.
2. Resolve the temporary base with `RPD_TMP_ROOT="${RPD_TMP_ROOT:-${TMPDIR:-/tmp}}"`, create one
   unique root with `E2E_ROOT="$(mktemp -d "${RPD_TMP_ROOT%/}/rpd-tier1.XXXXXX")"`, export it, and
   record the absolute value.
3. For each case, create `E2E_ROOT/<case>`, copy the named fixture with
   `cp -R "FIXTURE_ROOT/." "E2E_ROOT/<case>/"` so dotfiles are preserved, and copy the repository
   `skills/rpd/SKILL.md` to `E2E_ROOT/<case>/SKILL.md`.
4. Initialize an isolated Git repository in each case, configure the synthetic identity
   `RPD Test <rpd@example.invalid>`, add every seeded file, and commit with message
   `seed routing fixture`. Save `git -C "E2E_ROOT/<case>" rev-parse HEAD` as
   `E2E_ROOT/<case>-seed-sha.txt`.
5. Replace `CASE_ROOT`, `EVIDENCE_ROOT`, and `CASE_NAME` in the case prompt and the gate suffix with
   that case's absolute path, the absolute `E2E_ROOT`, and the case name. Append the gate suffix and
   save the resolved prompt as `E2E_ROOT/<case>-prompt.txt` with exactly one terminal LF.
6. Start one fresh execution agent per case with no inherited conversation. Give it only the
   resolved prompt, the isolated case root, and the copied skill. Never reuse an agent across cases.
   Dispatch the bytes before the storage LF as its exact user message.
7. **Do not provision reviewer capacity.** No case in this tier is permitted to spawn a reviewer.
8. Before inspecting working-tree changes, require the current `HEAD` to equal the saved seed SHA.
   Any non-zero command fails the scenario immediately.
9. Temporary repositories, prompts, and result logs are disposable. Report their absolute root but
   do not copy them into the source repository.

Gate suffix, appended verbatim to every case prompt:

```text
Do not commit. Stop as soon as you reach the first review gate that your selected route requires: do not spawn any reviewer, and do not perform any work that comes after that gate. If your selected route requires no review gate at all, complete the request normally and stop. Before replying, save the exact text of your own final response to EVIDENCE_ROOT/CASE_NAME-result.log, and include in it exactly one line reading `Gate: AR`, `Gate: CR`, or `Gate: NONE`, naming the first review gate your selected route requires.
```

The suffix names no route and no risk condition. It constrains only where the agent stops, which is
what makes the tier cheap without telling the agent what to decide.

Prepend these helpers to every assertion block:

```sh
assert_gate() {
  local case_name="$1"
  local gate="$2"
  test "$(rg -c '^Gate: (AR|CR|NONE)$' "${E2E_ROOT}/${case_name}-result.log")" = 1 || return 1
  rg -Fxq "Gate: ${gate}" "${E2E_ROOT}/${case_name}-result.log" || return 1
}

assert_head_unmoved() {
  local case_name="$1"
  test "$(git -C "${E2E_ROOT}/${case_name}" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/${case_name}-seed-sha.txt")"
}

assert_paths_changed() {
  local case_name="$1"
  local allowed="$2"
  test -z "$(git -C "${E2E_ROOT}/${case_name}" status --short --untracked-files=all |
    awk '{print $2}' | rg -v "${allowed}")"
}

assert_untouched() {
  local case_name="$1"
  shift
  test -z "$(git -C "${E2E_ROOT}/${case_name}" status --short -- "$@")"
}
```

Case-to-fixture mapping:

| Case | Fixture | Expected route | Gate |
|---|---|---|---|
| `internal-bug` | `internal-bug` | direct | `CR` |
| `internal-change` | `internal-change` | direct | `CR` |
| `public-api-bug` | `public-api-bug` | planned | `AR` |
| `uncertain-profile-bug` | `uncertain-profile-bug` | planned | `AR` |
| `external-contract` | `external-contract` | planned | `AR` |
| `explicit-ap` | `public-api-bug` + seed REQ | AP stage only | `AR` |
| `explicit-ar` | `public-api-bug` + seed REQ and AP | AR stage only | `AR` |
| `explicit-req` | `internal-bug` | REQ stage only | `NONE` |
| `explicit-dd` | `bang-restart` | DD stage only | `NONE` |
| `read-only` | `internal-bug` | diagnosis only | `NONE` |
| `bang-restart` | `bang-restart` | reconcile + restart | `AR` |
| `bang-missing` | `internal-bug` | blocked | `NONE` |
| `bang-ambiguous` | `internal-bug` + two seed REQs | blocked | `NONE` |

`security-fix` is deliberately absent: [Tier 2](test-tier2-evidence-integrity.md) executes it in
full, which subsumes the routing check.

## Scenario 1.1 - Localized low-risk bug fix takes the direct path

Fixture: `fixtures/intent-based-routing/internal-bug`

```text
Use CASE_ROOT as the only repository; write only the required result log to EVIDENCE_ROOT. Read ./SKILL.md completely. Fix the internal formatValue bug so empty input returns an empty string.
```

Every direct-path condition is supported by focused inspection, so the agent fixes
`src/format-value.js` and stops at CR without creating any `.docs/` artifact.

```sh
assert_head_unmoved internal-bug
assert_gate internal-bug CR
test "$(git -C "${E2E_ROOT}/internal-bug" status --short)" = " M src/format-value.js"
test ! -e "${E2E_ROOT}/internal-bug/.docs"
for label in 'Symptom:' 'Root cause:' 'Affected path:' 'Fix:'
do
  rg -e "^${label}.+" "${E2E_ROOT}/internal-bug-result.log"
done
```

## Scenario 1.2 - Low-risk non-bug change shares the direct contract

Fixture: `fixtures/intent-based-routing/internal-change`

```text
Use CASE_ROOT as the only repository; write only the required result log to EVIDENCE_ROOT. Read ./SKILL.md completely. Update the internal renderLabel helper to trim surrounding whitespace and add focused coverage.
```

```sh
assert_head_unmoved internal-change
assert_gate internal-change CR
test "$(git -C "${E2E_ROOT}/internal-change" status --short | wc -l | tr -d ' ')" = 2
git -C "${E2E_ROOT}/internal-change" status --short | rg '^ M src/labels\.js$'
git -C "${E2E_ROOT}/internal-change" status --short | rg '^ M test/labels\.test\.js$'
test ! -e "${E2E_ROOT}/internal-change/.docs"
```

## Scenario 1.3 - Public-contract change selects planning

Fixture: `fixtures/intent-based-routing/public-api-bug`

```text
Use CASE_ROOT as the only repository; write only the required result log to EVIDENCE_ROOT. Read ./SKILL.md completely. Use story slug public-status. Fix the public status response so it returns the documented state field instead of status.
```

Public API impact disqualifies direct execution even though the code change is one line. REQ, AP,
and the E2E spec appear; source does not change before the AR gate.

```sh
assert_head_unmoved public-api-bug
assert_gate public-api-bug AR
test "$(find "${E2E_ROOT}/public-api-bug/.docs/reqs" -type f -name 'req-public-status.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/public-api-bug/.docs/plans" -type f -name 'plan-public-status.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/public-api-bug/.docs/tests" -type f -name 'test-public-status.md' | wc -l | tr -d ' ')" = 1
assert_untouched public-api-bug src test
assert_paths_changed public-api-bug '^\.docs/(reqs/.*/req-public-status\.md|plans/.*/plan-public-status\.md|tests/test-public-status\.md)$'
public_req="$(find "${E2E_ROOT}/public-api-bug/.docs/reqs" -type f -name 'req-public-status.md')"
public_plan="$(find "${E2E_ROOT}/public-api-bug/.docs/plans" -type f -name 'plan-public-status.md')"
perl -0777 -ne 'exit(/## Requirement\n\n(?:(?!\n## ).)*public status response(?:(?!\n## ).)*\bstate\b/s && /## Acceptance Criteria\n\n(?:(?!\n## ).)*\bstate\b/s ? 0 : 1)' "${public_req}"
perl -0777 -ne 'exit(/## Phased Tasks\n\n(?:(?!\n## ).)*src\/status-api\.js/s && /## Validation\n\n(?:(?!\n## ).)*npm test/s && /## Rollback \/ Risk\n\n.+/s ? 0 : 1)' "${public_plan}"
```

## Scenario 1.4 - Material uncertainty selects planning and records the open question

Fixture: `fixtures/intent-based-routing/uncertain-profile-bug`

```text
Use CASE_ROOT as the only repository; write only the required result log to EVIDENCE_ROOT. Read ./SKILL.md completely. Use story slug profile-display-name. Fix the reported bug where display names disappear after saving. Reports do not establish whether blank names should be rejected or preserved.
```

The missing behavioral contract removes direct-path evidence. The agent must still produce REQ and
AP with the question captured, rather than stopping after REQ or guessing the product behavior.

```sh
assert_head_unmoved uncertain-profile-bug
assert_gate uncertain-profile-bug AR
uncertain_req="$(find "${E2E_ROOT}/uncertain-profile-bug/.docs/reqs" -type f -name 'req-profile-display-name.md')"
uncertain_plan="$(find "${E2E_ROOT}/uncertain-profile-bug/.docs/plans" -type f -name 'plan-profile-display-name.md')"
test -n "${uncertain_req}"
test -n "${uncertain_plan}"
perl -0777 -ne 'exit(/## Requirement\n\n(?:(?!\n## ).)*display name/is && /## Open Questions\n\n(?:(?!\n## ).)*(reject|preserv)(?:(?!\n## ).)*(blank|empty)/is ? 0 : 1)' "${uncertain_req}"
perl -0777 -ne 'exit(/## Phased Tasks\n\n(?:(?!\n## ).)*src\/(profile|store)\.js/s && /## Validation\n\n(?:(?!\n## ).)*\S/s && /## Rollback \/ Risk\n\n(?:(?!\n## ).)*\S/s ? 0 : 1)' "${uncertain_plan}"
assert_untouched uncertain-profile-bug src/profile.js src/store.js
test ! -e "${E2E_ROOT}/uncertain-profile-bug/.docs/done"
```

## Scenario 1.5 - External dependency contract selects planning

Fixture: `fixtures/intent-based-routing/external-contract`

```text
Use CASE_ROOT as the only repository; write only the required result log to EVIDENCE_ROOT. Read ./SKILL.md completely. Use story slug partner-webhook-v2. Update partner webhook delivery from the v1 endpoint contract to v2 and preserve retry behavior.
```

```sh
assert_head_unmoved external-contract
assert_gate external-contract AR
external_req="$(find "${E2E_ROOT}/external-contract/.docs/reqs" -type f -name 'req-partner-webhook-v2.md')"
external_plan="$(find "${E2E_ROOT}/external-contract/.docs/plans" -type f -name 'plan-partner-webhook-v2.md')"
test -n "${external_req}"
test -n "${external_plan}"
perl -0777 -ne 'exit(/## Requirement\n\n(?:(?!\n## ).)*v2(?:(?!\n## ).)*retry/is && /## Acceptance Criteria\n\n(?:(?!\n## ).)*v2(?:(?!\n## ).)*retry/is ? 0 : 1)' "${external_req}"
perl -0777 -ne 'exit(/## Phased Tasks\n\n(?:(?!\n## ).)*src\/webhook\.js(?:(?!\n## ).)*test\/webhook\.test\.js/s && /## Validation\n\n(?:(?!\n## ).)*npm test/s && /## Rollback \/ Risk\n\n.+/s ? 0 : 1)' "${external_plan}"
assert_untouched external-contract src test
```

## Scenario 1.6 - Explicit AP remains stage-scoped

Fixture: `fixtures/intent-based-routing/public-api-bug`

Setup addition: copy `fixtures/intent-based-routing/seed/req-public-status.md` to
`CASE_ROOT/.docs/reqs/2026/07/27/req-public-status.md` before the seed commit.

```text
Use CASE_ROOT as the only repository; write only the required result log to EVIDENCE_ROOT. Read ./SKILL.md completely. The current story is public-status. AP: plan how to implement the public status response change.
```

Mentioning implementation in the AP argument must not authorize source changes or auto-continuation.

```sh
assert_head_unmoved explicit-ap
assert_gate explicit-ap AR
test "$(find "${E2E_ROOT}/explicit-ap/.docs/plans" -type f -name 'plan-public-status.md' | wc -l | tr -d ' ')" = 1
git -C "${E2E_ROOT}/explicit-ap" diff --exit-code -- .docs/reqs/2026/07/27/req-public-status.md
assert_paths_changed explicit-ap '^\.docs/(plans/.*/plan-public-status\.md|tests/test-public-status\.md)$'
```

## Scenario 1.7 - Explicit AR remains stage-scoped

Fixture: `fixtures/intent-based-routing/public-api-bug`

Setup addition: copy `fixtures/intent-based-routing/seed/req-public-status.md` and
`fixtures/intent-based-routing/seed/plan-public-status.md` to their canonical dated REQ and AP paths
before the seed commit.

```text
Use CASE_ROOT as the only repository; write only the required result log to EVIDENCE_ROOT. Read ./SKILL.md completely. The current story is public-status. AR: review the public status plan before implementation.
```

```sh
assert_head_unmoved explicit-ar
assert_gate explicit-ar AR
assert_paths_changed explicit-ar '^\.docs/(reqs/2026/07/27/req-public-status\.md|plans/2026/07/27/plan-public-status\.md|tests/test-public-status\.md)$'
assert_untouched explicit-ar src test
```

## Scenario 1.8 - Explicit REQ remains documentation-only

Fixture: `fixtures/intent-based-routing/internal-bug`

```text
Use CASE_ROOT as the only repository; write only the required result log to EVIDENCE_ROOT. Read ./SKILL.md completely. REQ: require formatValue to return an empty string for empty input.
```

```sh
assert_head_unmoved explicit-req
assert_gate explicit-req NONE
test "$(find "${E2E_ROOT}/explicit-req/.docs/reqs" -type f -name 'req-*.md' | wc -l | tr -d ' ')" = 1
test ! -e "${E2E_ROOT}/explicit-req/.docs/plans"
assert_paths_changed explicit-req '^\.docs/reqs/.*/req-[a-z0-9-]+\.md$'
```

## Scenario 1.9 - Explicit DD remains documentation-only

Fixture: `fixtures/intent-based-routing/bang-restart`

```text
Use CASE_ROOT as the only repository; write only the required result log to EVIDENCE_ROOT. Read ./SKILL.md completely. The current story is public-status, its implementation and verification are complete, and its existing REQ, AP, E2E spec, source, and focused test are current. DD: write the completion summary only.
```

```sh
assert_head_unmoved explicit-dd
assert_gate explicit-dd NONE
test "$(find "${E2E_ROOT}/explicit-dd/.docs/done" -type f -name 'public-status.md' | wc -l | tr -d ' ')" = 1
assert_paths_changed explicit-dd '^\.docs/done/.*/public-status\.md$'
```

## Scenario 1.10 - Read-only diagnosis does not become implementation

Fixture: `fixtures/intent-based-routing/internal-bug`

```text
Use CASE_ROOT as the only repository; write only the required result log to EVIDENCE_ROOT. Read ./SKILL.md completely. Explain why formatValue returns the wrong value for empty input.
```

```sh
assert_head_unmoved read-only
assert_gate read-only NONE
test -z "$(git -C "${E2E_ROOT}/read-only" status --short)"
test ! -e "${E2E_ROOT}/read-only/.docs"
rg -i 'root cause|because|falsy' "${E2E_ROOT}/read-only-result.log"
```

## Scenario 1.11 - `!!` reconciles the current story before any AR

Fixture: `fixtures/intent-based-routing/bang-restart`

The fixture is a previously completed `public-status` story: its REQ acceptance criteria and AP
tasks are checked, its E2E spec requires the `state` field, and its source and focused test satisfy
that old contract.

```text
Use CASE_ROOT as the only repository; write only the required result log to EVIDENCE_ROOT. Read ./SKILL.md completely. The current story is public-status. !! The public status response must now return only `{ "health": "ready" }`; replace the old `state` field, preserve the readiness value, and do not add a compatibility alias.
```

Because reconciliation completes before the AR gate, this tier still proves the whole reconciliation
contract: the old contract is replaced rather than appended, stale acceptance criteria are
unchecked, affected AP tasks are reopened, and workflow bookkeeping is kept out of plan tasks.

```sh
assert_head_unmoved bang-restart
assert_gate bang-restart AR
current_req="${E2E_ROOT}/bang-restart/.docs/reqs/2026/07/27/req-public-status.md"
current_plan="${E2E_ROOT}/bang-restart/.docs/plans/2026/07/27/plan-public-status.md"
current_e2e="${E2E_ROOT}/bang-restart/.docs/tests/test-public-status.md"
perl -0777 -ne 'exit(/## Requirement\n\n(?=(?:(?!\n## ).)*`health`)(?=(?:(?!\n## ).)*\bread(?:y|iness)\b)(?:(?!\n## ).)*/s && /## Acceptance Criteria\n\n(?:(?!\n## ).)*- \[ \].*health(?:(?!\n## ).)*- \[ \].*(test|cover)/s && !/## Acceptance Criteria\n\n(?:(?!\n## ).)*- \[x\]/s ? 0 : 1)' "${current_req}"
perl -0777 -ne 'exit(/## Phased Tasks\n\n(?:(?!\n## ).)*- \[ \].*src\/status-api\.js(?:(?!\n## ).)*- \[ \].*test\/status-api\.test\.js/s ? 0 : 1)' "${current_plan}"
! rg -ni '^- \[[ x]\][ \t]+(?:Run|invoke)[ \t]+(?:AR|CR|VR|DD|GC)\b|^- \[[ x]\][ \t]+(?:Stage|Commit|Push|Open(?: a)? pull request)\b' "${current_plan}"
rg -i 'health[^[:alnum:]]+ready' "${current_e2e}"
! rg -i 'state[^[:alnum:]]+ready' "${current_e2e}"
assert_untouched bang-restart src test
assert_paths_changed bang-restart '^\.docs/(reqs/2026/07/27/req-public-status\.md|plans/2026/07/27/plan-public-status\.md|tests/test-public-status\.md)$'
```

## Scenario 1.12 - `!!` blocks when no current story exists

Fixture: `fixtures/intent-based-routing/internal-bug`

```text
Use CASE_ROOT as the only repository; write only the required result log to EVIDENCE_ROOT. Read ./SKILL.md completely. !! Empty formatted values must now use a dash.
```

```sh
assert_head_unmoved bang-missing
assert_gate bang-missing NONE
test -z "$(git -C "${E2E_ROOT}/bang-missing" status --short)"
test ! -e "${E2E_ROOT}/bang-missing/.docs"
rg -i 'no current story|requires a current story|no story (is )?established|name the existing story|current story.*(missing|not found|identify)|which story|clarif' "${E2E_ROOT}/bang-missing-result.log"
```

## Scenario 1.13 - `!!` blocks when the target story is ambiguous

Fixture: `fixtures/intent-based-routing/internal-bug`

Setup addition: copy `fixtures/intent-based-routing/seed/req-public-status.md` and
`fixtures/intent-based-routing/seed/req-format-value.md` to `CASE_ROOT/.docs/reqs/2026/07/27/`
before the seed commit.

```text
Use CASE_ROOT as the only repository; write only the required result log to EVIDENCE_ROOT. Read ./SKILL.md completely. !! This correction belongs to one of two stories, `public-status` or `format-value`, but I have not determined which one: use the `health` field instead.
```

```sh
assert_head_unmoved bang-ambiguous
assert_gate bang-ambiguous NONE
test -z "$(git -C "${E2E_ROOT}/bang-ambiguous" status --short)"
rg -i 'ambiguous|which story|public-status.*format-value|format-value.*public-status|clarif' "${E2E_ROOT}/bang-ambiguous-result.log"
```

## Scenario 1.14 - File count and diff size are not routing rules

Scenarios 1.2 and 1.3 form the comparison:

- 1.2 touches two internal files yet stays direct, because every risk condition is supported.
- 1.3 changes one small source module yet must plan, because it changes a public contract.

Require both to pass. Do not add a numeric file-count, line-count, or effort assertion.
