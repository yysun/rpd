# E2E Scenarios: Intent-Based RPD Routing

## Purpose

Prove that ordinary natural-language requests route by implementation intent and concrete risk, while explicit workflow commands retain their own stage scope. All execution cases use isolated temporary Git repositories created from the deterministic fixtures under `fixtures/intent-based-routing/`.

## Common Execution Procedure

1. Run setup and every assertion block with Bash fail-fast semantics: `set -euo pipefail`.
2. Create one unique temporary root with `E2E_ROOT="$(mktemp -d /private/tmp/rpd-intent-routing-e2e.XXXXXX)"`, export it, and record the absolute value.
3. For each case below, create `E2E_ROOT/<case>`, copy the named fixture with `cp -R "FIXTURE_ROOT/." "E2E_ROOT/<case>/"` so dotfiles such as `.gitignore` are preserved, and copy the revised repository `skills/rpd/SKILL.md` to `E2E_ROOT/<case>/SKILL.md`. Replace `FIXTURE_ROOT` and the destination with their absolute paths before running the command.
4. Initialize an isolated Git repository in each case, configure the synthetic identity `RPD Test <rpd@example.invalid>`, add every seeded file, and commit with message `seed routing fixture`. Save `git -C "E2E_ROOT/<case>" rev-parse HEAD` as `E2E_ROOT/<case>-seed-sha.txt`.
5. Replace the literals `CASE_ROOT`, `EVIDENCE_ROOT`, `CASE_NAME`, and `COMMIT_POLICY` in the case prompt and fixed evidence suffix with that case's absolute path, the absolute `E2E_ROOT`, the case name, and the case's commit policy before dispatch. Use `Do not commit.` for every case except `bang-restart`; use `Complete GC after VR and DD; make exactly one scoped commit and do not push.` for `bang-restart`. Append the resolved evidence suffix and save the fully resolved prompt with exactly one terminal file-storage LF as `E2E_ROOT/<case>-prompt.txt`. Start one fresh execution agent per case with no inherited conversation when supported, otherwise with the runtime's smallest task-local context. Give it only the resolved prompt, isolated case root, copied skill, and evidence contract; never reuse an execution agent across cases. Dispatch the bytes before the storage LF as its exact user message.
6. Reserve reviewer capacity for every execution case that requires AR, CR, or VR. Use the current runtime's collaboration/subagent surface and require independent reviewers to work read-only. After each reviewer completes, require the implementation agent to save the reviewer final response verbatim outside the case repository as `EVIDENCE_ROOT/CASE_NAME-<phase>-review-<attempt>.log`, numbering attempts by completion order with zero-padded integers. Preserve blocked attempts; the highest attempt number is terminal. Before replying, require the implementation agent to save the exact text of its own final response as `EVIDENCE_ROOT/CASE_NAME-result.log`.
7. Immediately before each reviewer is spawned, have the implementation agent compute the stable snapshot hash defined below and include it in the reviewer input. Require the reviewer to recompute that hash, compare initial and final Git state, and end with the fixed evidence fields below. A review attempt is invalid if its initial hash differs from the supplied hash or its final hash/state differs from its initial state.
8. For AR, require the terminal reviewer decision to pass and its evidence to show that `src/**` and `test/**` had no changes in the reviewed snapshot. This is the observable pre-implementation gate available from the current collaboration surface. For a blocked AR, require the terminal decision to block and require no source/test changes.
9. For CR, include `.verification-ran` in the stable snapshot. The fixture creates that ignored marker only after `node --test` succeeds and stores a SHA-256 digest of the current `package.json`, `src/**`, and `test/**` inputs. Require the terminal CR reviewer to recompute the digest read-only with `node scripts/verification-digest.js`, report a match, and review a snapshot whose hash equals the final case snapshot hash. A later source, test, or test-command change invalidates the marker and fails CR evidence.
10. Before the test operator runs any verification command, require `.verification-ran` for cases that should implement. Only then may the operator rerun `npm test`.
11. Before inspecting working-tree changes in a non-committing case, require the current `HEAD` to equal the saved seed SHA. For `bang-restart`, require exactly one commit after the seed and inspect the committed path allowlist. Then run the case's remaining assertions. Any non-zero command fails the scenario immediately.
12. Temporary repositories, resolved prompts, reviewer logs, result logs, and sentinels are disposable. Report their absolute root but do not copy them into the source repository.

Fixed evidence suffix:

```text
COMMIT_POLICY The evidence root is EVIDENCE_ROOT and the case name is CASE_NAME. Before each AR, CR, or VR reviewer is spawned, compute the stable snapshot hash with this exact command from any working directory: `(cd CASE_ROOT && (find . -path './.git' -prune -o -type f -print0 | sort -z | xargs -0 shasum -a 256) | shasum -a 256 | awk '{print $1}')`. Include that hash in the reviewer input and ask the reviewer to recompute it with the same command. The ignored `CASE_ROOT/.verification-ran` file must be absent during AR. The fixture writes it only after `npm test` succeeds; its content is the SHA-256 digest of the tested `package.json`, `src/**`, and `test/**` inputs. During CR and VR, require the reviewer to run this exact read-only comparison: `test "$(tr -d '\n' < CASE_ROOT/.verification-ran)" = "$(cd CASE_ROOT && node scripts/verification-digest.js)"`. Report `Verification digest: MATCH` only when that command exits 0; report `MISMATCH` when it exits non-zero, and `ABSENT` when the marker does not exist. Require the VR reviewer to include the acceptance-criteria evidence matrix before the fixed evidence block. Ask every reviewer to end its response with exactly these six lines:
`Phase: AR`, `Phase: CR`, or `Phase: VR`
`Decision: PASS` or `Decision: BLOCK`
`Snapshot: <64-lowercase-hex SHA-256>`
`Source/test changes: NONE` or `Source/test changes: PRESENT`
`Verification digest: MATCH`, `Verification digest: MISMATCH`, or `Verification digest: ABSENT`
`Snapshot unchanged: YES` or `Snapshot unchanged: NO`
After each reviewer completes, save its final response verbatim before continuing. Use the exact uppercase phase filenames EVIDENCE_ROOT/CASE_NAME-AR-review-<attempt>.log, EVIDENCE_ROOT/CASE_NAME-CR-review-<attempt>.log, and EVIDENCE_ROOT/CASE_NAME-VR-review-<attempt>.log. Number attempts by completion order as 01, 02, and so on. Preserve every blocked attempt. Before replying, save the exact text of your own final response to EVIDENCE_ROOT/CASE_NAME-result.log. In that final response, include the exact line `Verification: PASS — npm test (exit 0)` only if that command actually exited 0. Include the exact line `AR: PASS — no blocking architecture flaws` only after terminal AR passes. Include the exact line `CR: PASS — no major findings` only after terminal CR passes. Include the exact line `VR: PASS — all acceptance criteria complete` only after terminal VR passes. For a completed bug-fix implementation, also include non-empty lines beginning `Symptom:`, `Root cause:`, `Affected path:`, `Fix:`, and `Result:`. The test operator will compare these claims with the saved reviewer responses and final repository state.
```

Prepend these helpers to every assertion block that inspects AR, CR, or reviewed snapshots:

```sh
snapshot_hash() {
  local case_root="$1"
  (
    cd "${case_root}"
    find . -path './.git' -prune -o -type f -print0 |
      sort -z |
      xargs -0 shasum -a 256
  ) | shasum -a 256 | awk '{print $1}'
}

terminal_review_log() {
  local case_name="$1"
  local phase="$2"
  find "${E2E_ROOT}" -maxdepth 1 -type f -name "${case_name}-${phase}-review-[0-9][0-9].log" |
    sort |
    tail -n 1
}

assert_terminal_review() {
  local case_name="$1"
  local phase="$2"
  local decision="$3"
  local review_log
  local terminal_block
  review_log="$(terminal_review_log "${case_name}" "${phase}")"
  test -n "${review_log}"
  test "$(rg -c '^Phase: (AR|CR|VR)$' "${review_log}")" = 1
  test "$(rg -c '^Decision: (PASS|BLOCK)$' "${review_log}")" = 1
  test "$(rg -c '^Snapshot: [0-9a-f]{64}$' "${review_log}")" = 1
  test "$(rg -c '^Source/test changes: (NONE|PRESENT)$' "${review_log}")" = 1
  test "$(rg -c '^Verification digest: (MATCH|MISMATCH|ABSENT)$' "${review_log}")" = 1
  test "$(rg -c '^Snapshot unchanged: (YES|NO)$' "${review_log}")" = 1
  terminal_block="$(tail -n 6 "${review_log}")"
  test "$(printf '%s\n' "${terminal_block}" | sed -n '1p')" = "Phase: ${phase}"
  test "$(printf '%s\n' "${terminal_block}" | sed -n '2p')" = "Decision: ${decision}"
  printf '%s\n' "${terminal_block}" | sed -n '3p' | rg -x 'Snapshot: [0-9a-f]{64}'
  printf '%s\n' "${terminal_block}" | sed -n '4p' | rg -x 'Source/test changes: (NONE|PRESENT)'
  printf '%s\n' "${terminal_block}" | sed -n '5p' | rg -x 'Verification digest: (MATCH|MISMATCH|ABSENT)'
  test "$(printf '%s\n' "${terminal_block}" | sed -n '6p')" = 'Snapshot unchanged: YES'
}

assert_ar_before_code() {
  local case_name="$1"
  local review_log
  assert_terminal_review "${case_name}" AR PASS
  review_log="$(terminal_review_log "${case_name}" AR)"
  rg -Fx 'Source/test changes: NONE' "${review_log}"
  rg -Fx 'Verification digest: ABSENT' "${review_log}"
}

assert_ar_blocked() {
  local case_name="$1"
  local review_log
  assert_terminal_review "${case_name}" AR BLOCK
  review_log="$(terminal_review_log "${case_name}" AR)"
  rg -Fx 'Source/test changes: NONE' "${review_log}"
  rg -Fx 'Verification digest: ABSENT' "${review_log}"
}

assert_cr_final() {
  local case_name="$1"
  local review_log
  local reviewed_hash
  local final_hash
  local recorded_digest
  local current_digest
  assert_cr_passed "${case_name}"
  review_log="$(terminal_review_log "${case_name}" CR)"
  recorded_digest="$(tr -d '\n' < "${E2E_ROOT}/${case_name}/.verification-ran")"
  current_digest="$(cd "${E2E_ROOT}/${case_name}" && node scripts/verification-digest.js)"
  test "${recorded_digest}" = "${current_digest}"
  reviewed_hash="$(sed -n 's/^Snapshot: //p' "${review_log}")"
  final_hash="$(snapshot_hash "${E2E_ROOT}/${case_name}")"
  test "${reviewed_hash}" = "${final_hash}"
}

assert_cr_passed() {
  local case_name="$1"
  local review_log
  assert_terminal_review "${case_name}" CR PASS
  review_log="$(terminal_review_log "${case_name}" CR)"
  rg -Fx 'Source/test changes: PRESENT' "${review_log}"
  rg -Fx 'Verification digest: MATCH' "${review_log}"
}

assert_vr_passed() {
  local case_name="$1"
  local review_log
  assert_terminal_review "${case_name}" VR PASS
  review_log="$(terminal_review_log "${case_name}" VR)"
  rg -Fx 'Source/test changes: PRESENT' "${review_log}"
  rg -Fx 'Verification digest: MATCH' "${review_log}"
}
```

Case-to-fixture mapping:

| Case | Fixture |
|---|---|
| `internal-bug` | `internal-bug` |
| `internal-change` | `internal-change` |
| `public-api-bug` | `public-api-bug` |
| `uncertain-profile-bug` | `uncertain-profile-bug` |
| `security-fix` | `security-fix` |
| `external-contract` | `external-contract` |
| `explicit-ap` | `public-api-bug` plus the stated seed REQ |
| `explicit-ar` | `public-api-bug` plus the stated seed REQ and AP |
| `explicit-req` | `internal-bug` |
| `read-only` | `internal-bug` |
| `bang-restart` | `bang-restart` |
| `bang-missing` | `internal-bug` |
| `bang-ambiguous` | `internal-bug` plus the two stated seed REQs |

## Scenario 1 - Localized low-risk bug fix uses the direct path

Fixture: `fixtures/intent-based-routing/internal-bug`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. Fix the internal formatValue bug so empty input returns an empty string.
```

Expected behavior:

- Focused inspection supports every direct-path condition.
- The agent localizes the failure, fixes `src/format-value.js`, uses the seeded regression test, runs `npm test`, and runs CR.
- No REQ, AP, AR, or other `.docs/` artifact is created.
- The final response reports symptom, root cause, affected path, fix, exact verification, and CR result.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/internal-bug" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/internal-bug-seed-sha.txt")"
test "$(git -C "${E2E_ROOT}/internal-bug" status --short)" = " M src/format-value.js"
test ! -e "${E2E_ROOT}/internal-bug/.docs"
test -f "${E2E_ROOT}/internal-bug/.verification-ran"
npm --prefix "${E2E_ROOT}/internal-bug" test
rg -i 'root cause|cause' "${E2E_ROOT}/internal-bug-result.log"
for label in 'Symptom:' 'Root cause:' 'Affected path:' 'Fix:' 'Result:'
do
  rg -e "^${label}.+" "${E2E_ROOT}/internal-bug-result.log"
done
rg -Fx 'Verification: PASS — npm test (exit 0)' "${E2E_ROOT}/internal-bug-result.log"
rg -Fx 'CR: PASS — no major findings' "${E2E_ROOT}/internal-bug-result.log"
assert_cr_final internal-bug
```

## Scenario 2 - Low-risk non-bug change uses the shared direct contract

Fixture: `fixtures/intent-based-routing/internal-change`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. Update the internal renderLabel helper to trim surrounding whitespace and add focused coverage.
```

Expected behavior:

- The agent supports every direct-path condition from repository evidence.
- It changes only `src/labels.js` and `test/labels.test.js`, runs `npm test`, and runs CR.
- It does not create `.docs/`.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/internal-change" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/internal-change-seed-sha.txt")"
test "$(git -C "${E2E_ROOT}/internal-change" status --short | wc -l | tr -d ' ')" = 2
git -C "${E2E_ROOT}/internal-change" status --short | rg '^ M src/labels\.js$'
git -C "${E2E_ROOT}/internal-change" status --short | rg '^ M test/labels\.test\.js$'
test ! -e "${E2E_ROOT}/internal-change/.docs"
test -f "${E2E_ROOT}/internal-change/.verification-ran"
npm --prefix "${E2E_ROOT}/internal-change" test
rg -Fx 'Verification: PASS — npm test (exit 0)' "${E2E_ROOT}/internal-change-result.log"
rg -Fx 'CR: PASS — no major findings' "${E2E_ROOT}/internal-change-result.log"
assert_cr_final internal-change
```

## Scenario 3 - Planned public-contract bug continues after AR

Fixture: `fixtures/intent-based-routing/public-api-bug`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. Use story slug public-status. Fix the public status response so it returns the documented state field instead of status.
```

Expected behavior:

- Public API impact disqualifies direct execution even though the code change is small.
- RPD creates REQ and AP, runs AR, continues automatically into implementation, fixes `src/status-api.js`, runs relevant tests, and runs CR.
- The final response reports root cause and verification; it does not ask the user to invoke SS.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/public-api-bug" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/public-api-bug-seed-sha.txt")"
test "$(find "${E2E_ROOT}/public-api-bug/.docs/reqs" -type f -name 'req-public-status.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/public-api-bug/.docs/plans" -type f -name 'plan-public-status.md' | wc -l | tr -d ' ')" = 1
public_req="$(find "${E2E_ROOT}/public-api-bug/.docs/reqs" -type f -name 'req-public-status.md')"
public_plan="$(find "${E2E_ROOT}/public-api-bug/.docs/plans" -type f -name 'plan-public-status.md')"
perl -0777 -ne 'exit(/## Requirement\n\n(?:(?!\n## ).)*public status response(?:(?!\n## ).)*\bstate\b/s && /## Acceptance Criteria\n\n(?:(?!\n## ).)*\bstate\b/s ? 0 : 1)' "${public_req}"
perl -0777 -ne 'exit(/## Phased Tasks\n\n(?:(?!\n## ).)*src\/status-api\.js/s && /## Validation\n\n(?:(?!\n## ).)*npm test/s && /## Rollback \/ Risk\n\n.+/s ? 0 : 1)' "${public_plan}"
test -z "$(git -C "${E2E_ROOT}/public-api-bug" status --short --untracked-files=all | awk '{print $2}' | rg -v '^(src/status-api\.js|\.docs/reqs/.*/req-public-status\.md|\.docs/plans/.*/plan-public-status\.md|\.docs/tests/test-public-status\.md)$')"
git -C "${E2E_ROOT}/public-api-bug" status --short | rg ' M src/status-api\.js'
test -f "${E2E_ROOT}/public-api-bug/.verification-ran"
npm --prefix "${E2E_ROOT}/public-api-bug" test
rg -i 'AR passed|AR fixed' "${E2E_ROOT}/public-api-bug-result.log"
rg -i 'root cause|cause' "${E2E_ROOT}/public-api-bug-result.log"
for label in 'Symptom:' 'Root cause:' 'Affected path:' 'Fix:' 'Result:'
do
  rg -e "^${label}.+" "${E2E_ROOT}/public-api-bug-result.log"
done
rg -Fx 'AR: PASS — no blocking architecture flaws' "${E2E_ROOT}/public-api-bug-result.log"
rg -Fx 'Verification: PASS — npm test (exit 0)' "${E2E_ROOT}/public-api-bug-result.log"
rg -Fx 'CR: PASS — no major findings' "${E2E_ROOT}/public-api-bug-result.log"
assert_ar_before_code public-api-bug
assert_cr_final public-api-bug
! rg -i 'invoke SS|ask.*SS|run SS to implement' "${E2E_ROOT}/public-api-bug-result.log"
```

## Scenario 4 - Material uncertainty selects planning and may block safely

Fixture: `fixtures/intent-based-routing/uncertain-profile-bug`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. Use story slug profile-display-name. Fix the reported bug where display names disappear after saving. Reports do not establish whether blank names should be rejected or preserved.
```

Expected behavior:

- The missing behavioral contract makes direct-path evidence unavailable.
- RPD creates REQ and AP and runs AR.
- It must not guess the product behavior or edit `src/profile.js` or `src/store.js`; it may stop on the unresolved blocking question.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/uncertain-profile-bug" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/uncertain-profile-bug-seed-sha.txt")"
test "$(find "${E2E_ROOT}/uncertain-profile-bug/.docs/reqs" -type f -name 'req-profile-display-name.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/uncertain-profile-bug/.docs/plans" -type f -name 'plan-profile-display-name.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/uncertain-profile-bug/.docs/tests" -type f -name 'test-profile-display-name.md' | wc -l | tr -d ' ')" = 1
uncertain_req="$(find "${E2E_ROOT}/uncertain-profile-bug/.docs/reqs" -type f -name 'req-profile-display-name.md')"
uncertain_plan="$(find "${E2E_ROOT}/uncertain-profile-bug/.docs/plans" -type f -name 'plan-profile-display-name.md')"
uncertain_e2e="${E2E_ROOT}/uncertain-profile-bug/.docs/tests/test-profile-display-name.md"
perl -0777 -ne 'exit(/## Requirement\n\n(?:(?!\n## ).)*display name/is && /## Open Questions\n\n(?:(?!\n## ).)*(reject|preserv)(?:(?!\n## ).)*(blank|empty)/is ? 0 : 1)' "${uncertain_req}"
perl -0777 -ne 'exit(/## Phased Tasks\n\n(?:(?!\n## ).)*src\/(profile|store)\.js/s && /## Validation\n\n(?:(?!\n## ).)*\S(?:(?!\n## ).)*/s && /## Rollback \/ Risk\n\n(?:(?!\n## ).)*\S(?:(?!\n## ).)*/s ? 0 : 1)' "${uncertain_plan}"
rg -i 'block|open question|blank|empty' "${uncertain_e2e}"
test -z "$(git -C "${E2E_ROOT}/uncertain-profile-bug" status --short --untracked-files=all | awk '{print $2}' | rg -v '^\.docs/(reqs/.*/req-profile-display-name\.md|plans/.*/plan-profile-display-name\.md|tests/test-profile-display-name\.md)$')"
test -z "$(git -C "${E2E_ROOT}/uncertain-profile-bug" status --short -- src/profile.js src/store.js)"
rg -i 'block|open question|clarif|reject.*blank|preserv.*blank' "${E2E_ROOT}/uncertain-profile-bug-result.log"
assert_ar_blocked uncertain-profile-bug
```

## Scenario 5 - Security-sensitive implementation selects planning

Fixture: `fixtures/intent-based-routing/security-fix`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. Use story slug disabled-user-auth. Fix authentication so disabled users cannot pass credential verification.
```

Expected behavior:

- Authentication and security impact force REQ/AP/AR.
- RPD does not use the direct path, regardless of diff size.
- AR passes, implementation continues, enabled-user behavior remains intact, and relevant verification and CR run.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/security-fix" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/security-fix-seed-sha.txt")"
test "$(find "${E2E_ROOT}/security-fix/.docs/reqs" -type f -name 'req-disabled-user-auth.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/security-fix/.docs/plans" -type f -name 'plan-disabled-user-auth.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/security-fix/.docs/tests" -type f -name 'test-disabled-user-auth.md' | wc -l | tr -d ' ')" = 1
security_req="$(find "${E2E_ROOT}/security-fix/.docs/reqs" -type f -name 'req-disabled-user-auth.md')"
security_plan="$(find "${E2E_ROOT}/security-fix/.docs/plans" -type f -name 'plan-disabled-user-auth.md')"
security_e2e="${E2E_ROOT}/security-fix/.docs/tests/test-disabled-user-auth.md"
perl -0777 -ne 'exit(/## Requirement\n\n(?:(?!\n## ).)*disabled.+auth/is && /## Acceptance Criteria\n\n(?:(?!\n## ).)*disabled.+cannot.+auth(?:(?!\n## ).)*enabled/is ? 0 : 1)' "${security_req}"
perl -0777 -ne 'exit(/## Phased Tasks\n\n(?:(?!\n## ).)*src\/authenticate\.js(?:(?!\n## ).)*test\/authenticate\.test\.js/s && /## Validation\n\n(?:(?!\n## ).)*npm test/s && /## Rollback \/ Risk\n\n.+/s ? 0 : 1)' "${security_plan}"
perl -0777 -ne 'exit(/## Scenario[^\n]*disabled(?:(?!\n## Scenario).)*\*\*Given\*\*(?:(?!\n## Scenario).)*\*\*When\*\*(?:(?!\n## Scenario).)*\*\*Then\*\*(?:(?!\n## Scenario).)*(reject|cannot|fail)/is ? 0 : 1)' "${security_e2e}"
perl -0777 -ne 'exit(/## Scenario[^\n]*enabled(?:(?!\n## Scenario).)*\*\*Given\*\*(?:(?!\n## Scenario).)*\*\*When\*\*(?:(?!\n## Scenario).)*\*\*Then\*\*(?:(?!\n## Scenario).)*(authenticate|pass|succeed)/is ? 0 : 1)' "${security_e2e}"
test -z "$(git -C "${E2E_ROOT}/security-fix" status --short --untracked-files=all | awk '{print $2}' | rg -v '^(src/authenticate\.js|\.docs/reqs/.*/req-disabled-user-auth\.md|\.docs/plans/.*/plan-disabled-user-auth\.md|\.docs/tests/test-disabled-user-auth\.md)$')"
rg -i 'AR passed|AR fixed' "${E2E_ROOT}/security-fix-result.log"
git -C "${E2E_ROOT}/security-fix" status --short -- src/authenticate.js | rg '^ M src/authenticate\.js$'
test -f "${E2E_ROOT}/security-fix/.verification-ran"
npm --prefix "${E2E_ROOT}/security-fix" test
for label in 'Symptom:' 'Root cause:' 'Affected path:' 'Fix:' 'Result:'
do
  rg -e "^${label}.+" "${E2E_ROOT}/security-fix-result.log"
done
rg -Fx 'AR: PASS — no blocking architecture flaws' "${E2E_ROOT}/security-fix-result.log"
rg -Fx 'Verification: PASS — npm test (exit 0)' "${E2E_ROOT}/security-fix-result.log"
rg -Fx 'CR: PASS — no major findings' "${E2E_ROOT}/security-fix-result.log"
assert_ar_before_code security-fix
assert_cr_final security-fix
```

## Scenario 6 - External dependency contract selects planning

Fixture: `fixtures/intent-based-routing/external-contract`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. Use story slug partner-webhook-v2. Update partner webhook delivery from the v1 endpoint contract to v2 and preserve retry behavior.
```

Expected behavior:

- The external integration and dependency contract force REQ/AP/AR.
- RPD does not use the direct path.
- Passed AR continues into implementation without a second approval.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/external-contract" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/external-contract-seed-sha.txt")"
test "$(find "${E2E_ROOT}/external-contract/.docs/reqs" -type f -name 'req-partner-webhook-v2.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/external-contract/.docs/plans" -type f -name 'plan-partner-webhook-v2.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/external-contract/.docs/tests" -type f -name 'test-partner-webhook-v2.md' | wc -l | tr -d ' ')" = 1
external_req="$(find "${E2E_ROOT}/external-contract/.docs/reqs" -type f -name 'req-partner-webhook-v2.md')"
external_plan="$(find "${E2E_ROOT}/external-contract/.docs/plans" -type f -name 'plan-partner-webhook-v2.md')"
external_e2e="${E2E_ROOT}/external-contract/.docs/tests/test-partner-webhook-v2.md"
perl -0777 -ne 'exit(/## Requirement\n\n(?:(?!\n## ).)*v2(?:(?!\n## ).)*retry/is && /## Acceptance Criteria\n\n(?:(?!\n## ).)*v2(?:(?!\n## ).)*retry/is ? 0 : 1)' "${external_req}"
perl -0777 -ne 'exit(/## Phased Tasks\n\n(?:(?!\n## ).)*src\/webhook\.js(?:(?!\n## ).)*test\/webhook\.test\.js/s && /## Validation\n\n(?:(?!\n## ).)*npm test/s && /## Rollback \/ Risk\n\n.+/s ? 0 : 1)' "${external_plan}"
perl -0777 -ne 'exit(/## Scenario(?:(?!\n## Scenario).)*\*\*Given\*\*(?:(?!\n## Scenario).)*\*\*When\*\*(?:(?!\n## Scenario).)*\bv2\b(?:(?!\n## Scenario).)*\*\*Then\*\*(?:(?!\n## Scenario).)*\bv2\b(?:(?!\n## Scenario).)*retry/is ? 0 : 1)' "${external_e2e}"
test -z "$(git -C "${E2E_ROOT}/external-contract" status --short --untracked-files=all | awk '{print $2}' | rg -v '^(src/webhook\.js|\.docs/reqs/.*/req-partner-webhook-v2\.md|\.docs/plans/.*/plan-partner-webhook-v2\.md|\.docs/tests/test-partner-webhook-v2\.md)$')"
rg -i 'AR passed|AR fixed' "${E2E_ROOT}/external-contract-result.log"
git -C "${E2E_ROOT}/external-contract" status --short -- src/webhook.js | rg '^ M src/webhook\.js$'
test -f "${E2E_ROOT}/external-contract/.verification-ran"
npm --prefix "${E2E_ROOT}/external-contract" test
rg -Fx 'AR: PASS — no blocking architecture flaws' "${E2E_ROOT}/external-contract-result.log"
rg -Fx 'Verification: PASS — npm test (exit 0)' "${E2E_ROOT}/external-contract-result.log"
rg -Fx 'CR: PASS — no major findings' "${E2E_ROOT}/external-contract-result.log"
assert_ar_before_code external-contract
assert_cr_final external-contract
! rg -i 'invoke SS|ask.*SS|run SS to implement' "${E2E_ROOT}/external-contract-result.log"
```

## Scenario 7 - Explicit AP remains stage-scoped

Fixture: `fixtures/intent-based-routing/public-api-bug`

Setup addition: copy `fixtures/intent-based-routing/seed/req-public-status.md` to `CASE_ROOT/.docs/reqs/2026/07/27/req-public-status.md` before the seed commit.

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. The current story is public-status. AP: plan how to implement the public status response change.
```

Expected behavior:

- AP creates or updates the plan and auto-runs AR.
- Mentioning implementation in the AP argument does not authorize source changes or auto-continuation.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/explicit-ap" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/explicit-ap-seed-sha.txt")"
test "$(find "${E2E_ROOT}/explicit-ap/.docs/plans" -type f -name 'plan-public-status.md' | wc -l | tr -d ' ')" = 1
git -C "${E2E_ROOT}/explicit-ap" diff --exit-code -- .docs/reqs/2026/07/27/req-public-status.md
test -z "$(git -C "${E2E_ROOT}/explicit-ap" status --short --untracked-files=all | awk '{print $2}' | rg -v '^\.docs/(plans/.*/plan-public-status\.md|tests/test-public-status\.md)$')"
rg -i 'AR passed|AR fixed|block' "${E2E_ROOT}/explicit-ap-result.log"
assert_ar_before_code explicit-ap
```

## Scenario 8 - Explicit AR remains stage-scoped

Fixture: `fixtures/intent-based-routing/public-api-bug`

Setup addition: copy `fixtures/intent-based-routing/seed/req-public-status.md` and `fixtures/intent-based-routing/seed/plan-public-status.md` to their canonical dated REQ and AP paths before the seed commit.

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. The current story is public-status. AR: review the public status plan before implementation.
```

Expected behavior:

- AR reviews and, if necessary, corrects existing REQ/AP artifacts.
- Mentioning future implementation does not authorize source changes or auto-continuation.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/explicit-ar" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/explicit-ar-seed-sha.txt")"
test -z "$(git -C "${E2E_ROOT}/explicit-ar" status --short --untracked-files=all | awk '{print $2}' | rg -v '^\.docs/(reqs/2026/07/27/req-public-status\.md|plans/2026/07/27/plan-public-status\.md|tests/test-public-status\.md)$')"
rg -i 'AR passed|AR fixed|block' "${E2E_ROOT}/explicit-ar-result.log"
assert_ar_before_code explicit-ar
```

## Scenario 9 - Explicit REQ remains documentation-only

Fixture: `fixtures/intent-based-routing/internal-bug`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. REQ: require formatValue to return an empty string for empty input.
```

Expected behavior:

- Only a REQ document is created.
- Source, tests, and configuration remain unchanged.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/explicit-req" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/explicit-req-seed-sha.txt")"
test "$(find "${E2E_ROOT}/explicit-req/.docs/reqs" -type f -name 'req-*.md' | wc -l | tr -d ' ')" = 1
test ! -e "${E2E_ROOT}/explicit-req/.docs/plans"
test -z "$(git -C "${E2E_ROOT}/explicit-req" status --short --untracked-files=all | awk '{print $2}' | rg -v '^\.docs/reqs/.*/req-[a-z0-9-]+\.md$')"
```

## Scenario 10 - Read-only diagnosis does not become implementation

Fixture: `fixtures/intent-based-routing/internal-bug`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. Explain why formatValue returns the wrong value for empty input.
```

Expected behavior:

- The agent diagnoses and explains the bug.
- It makes no repository changes and creates no workflow artifacts.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/read-only" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/read-only-seed-sha.txt")"
test -z "$(git -C "${E2E_ROOT}/read-only" status --short)"
test ! -e "${E2E_ROOT}/read-only/.docs"
rg -i 'root cause|because|falsy' "${E2E_ROOT}/read-only-result.log"
```

## Scenario 11 - Explicit `!!` reconciles and restarts the current story

Fixture: `fixtures/intent-based-routing/bang-restart`

The fixture is a previously completed `public-status` story. Its REQ acceptance criteria and AP tasks are checked, its E2E spec requires the `state` field, and its source and focused test currently satisfy that old contract.

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence files to EVIDENCE_ROOT. Read ./SKILL.md completely. The current story is public-status. !! The public status response must now return only `{ "health": "ready" }`; replace the old `state` field, preserve the readiness value, and do not add a compatibility alias. After reconciling the current REQ, AP, and E2E spec, but before spawning the first AR reviewer or editing `src/**` or `test/**`, copy the reconciled REQ to `EVIDENCE_ROOT/bang-restart-reconciled-req.md`, the reconciled AP to `EVIDENCE_ROOT/bang-restart-reconciled-plan.md`, and the reconciled E2E spec to `EVIDENCE_ROOT/bang-restart-reconciled-test.md`. In your final response include the exact line `ET: PASS — test-public-status.md` only after executing the reconciled Markdown E2E scenario successfully, `DD: PASS — completion document written` only after DD is written, and `GC: PASS — one scoped commit created` only after GC creates the commit.
```

Expected behavior:

- `!!` resolves the existing `public-status` story and updates its existing REQ, AP, and E2E spec in place.
- Reconciliation replaces the old contract rather than appending a contradictory requirement, unchecks the stale acceptance criteria, reopens affected AP tasks, and invalidates the old AR pass.
- A new AR runs against reconciled docs before any source or focused-test edit.
- After AR passes, the command continues without another approval through implementation, CR, TT, ET, VR, DD, and GC.
- VR checks the reconciled acceptance criteria, and GC creates exactly one scoped commit without pushing.

Assertions:

```sh
seed_sha="$(cat "${E2E_ROOT}/bang-restart-seed-sha.txt")"
test "$(git -C "${E2E_ROOT}/bang-restart" rev-list --count "${seed_sha}..HEAD")" = 1
test -z "$(git -C "${E2E_ROOT}/bang-restart" status --short)"

test -f "${E2E_ROOT}/bang-restart-reconciled-req.md"
test -f "${E2E_ROOT}/bang-restart-reconciled-plan.md"
test -f "${E2E_ROOT}/bang-restart-reconciled-test.md"
perl -0777 -ne 'exit(/## Requirement\n\n(?:(?!\n## ).)*`health`(?:(?!\n## ).)*ready/s && /## Acceptance Criteria\n\n(?:(?!\n## ).)*- \[ \].*health(?:(?!\n## ).)*- \[ \].*(test|cover)/s && !/## Acceptance Criteria\n\n(?:(?!\n## ).)*- \[x\]/s ? 0 : 1)' \
  "${E2E_ROOT}/bang-restart-reconciled-req.md"
perl -0777 -ne 'exit(/## Phased Tasks\n\n(?:(?!\n## ).)*- \[ \].*src\/status-api\.js(?:(?!\n## ).)*- \[ \].*test\/status-api\.test\.js/s ? 0 : 1)' \
  "${E2E_ROOT}/bang-restart-reconciled-plan.md"
rg -i 'health[^[:alnum:]]+ready' "${E2E_ROOT}/bang-restart-reconciled-test.md"
! rg -i 'state[^[:alnum:]]+ready' "${E2E_ROOT}/bang-restart-reconciled-test.md"

current_req="${E2E_ROOT}/bang-restart/.docs/reqs/2026/07/27/req-public-status.md"
current_plan="${E2E_ROOT}/bang-restart/.docs/plans/2026/07/27/plan-public-status.md"
current_e2e="${E2E_ROOT}/bang-restart/.docs/tests/test-public-status.md"
perl -0777 -ne 'exit(/## Acceptance Criteria\n\n(?:(?!\n## ).)*- \[x\].*health(?:(?!\n## ).)*- \[x\].*(test|cover)/s && !/## Acceptance Criteria\n\n(?:(?!\n## ).)*- \[ \]/s ? 0 : 1)' "${current_req}"
test -z "$(rg '^- \[ \]' "${current_plan}" || true)"
rg -i 'health[^[:alnum:]]+ready' "${current_e2e}"
! rg -i 'state[^[:alnum:]]+ready' "${current_e2e}"
rg -i '\bhealth\b' "${E2E_ROOT}/bang-restart/src/status-api.js"
! rg -i '\bstate\b' "${E2E_ROOT}/bang-restart/src/status-api.js"
rg -i '\bhealth\b' "${E2E_ROOT}/bang-restart/test/status-api.test.js"
! rg -i '\bstate\b' "${E2E_ROOT}/bang-restart/test/status-api.test.js"
test "$(find "${E2E_ROOT}/bang-restart/.docs/done" -type f -name 'public-status.md' | wc -l | tr -d ' ')" = 1

test -z "$(git -C "${E2E_ROOT}/bang-restart" diff --name-only "${seed_sha}..HEAD" | rg -v '^(src/status-api\.js|test/status-api\.test\.js|\.docs/reqs/2026/07/27/req-public-status\.md|\.docs/plans/2026/07/27/plan-public-status\.md|\.docs/tests/test-public-status\.md|\.docs/done/.*/public-status\.md)$')"
test -f "${E2E_ROOT}/bang-restart/.verification-ran"
npm --prefix "${E2E_ROOT}/bang-restart" test
assert_ar_before_code bang-restart
assert_cr_passed bang-restart
assert_vr_passed bang-restart
rg -Fx 'AR: PASS — no blocking architecture flaws' "${E2E_ROOT}/bang-restart-result.log"
rg -Fx 'CR: PASS — no major findings' "${E2E_ROOT}/bang-restart-result.log"
rg -Fx 'VR: PASS — all acceptance criteria complete' "${E2E_ROOT}/bang-restart-result.log"
rg -Fx 'Verification: PASS — npm test (exit 0)' "${E2E_ROOT}/bang-restart-result.log"
rg -Fx 'ET: PASS — test-public-status.md' "${E2E_ROOT}/bang-restart-result.log"
rg -Fx 'DD: PASS — completion document written' "${E2E_ROOT}/bang-restart-result.log"
rg -Fx 'GC: PASS — one scoped commit created' "${E2E_ROOT}/bang-restart-result.log"
commit_sha="$(git -C "${E2E_ROOT}/bang-restart" rev-parse HEAD)"
rg -F "${commit_sha:0:7}" "${E2E_ROOT}/bang-restart-result.log"
```

## Scenario 12 - `!!` blocks when no current story exists

Fixture: `fixtures/intent-based-routing/internal-bug`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. !! Empty formatted values must now use a dash.
```

Expected behavior:

- No current REQ exists, so the command cannot safely determine a story.
- The agent asks for targeted clarification and does not create a story, plan, test spec, source change, review, or commit.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/bang-missing" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/bang-missing-seed-sha.txt")"
test -z "$(git -C "${E2E_ROOT}/bang-missing" status --short)"
test ! -e "${E2E_ROOT}/bang-missing/.docs"
test -z "$(find "${E2E_ROOT}" -maxdepth 1 -type f -name 'bang-missing-*-review-[0-9][0-9].log' -print)"
rg -i 'no current story|current story.*(missing|not found|identify)|which story|clarif' "${E2E_ROOT}/bang-missing-result.log"
```

## Scenario 13 - `!!` blocks when the target story is ambiguous

Fixture: `fixtures/intent-based-routing/internal-bug`

Setup addition: copy `fixtures/intent-based-routing/seed/req-public-status.md` and `fixtures/intent-based-routing/seed/req-format-value.md` to `CASE_ROOT/.docs/reqs/2026/07/27/` before the seed commit.

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. This correction belongs to one of two stories, `public-status` or `format-value`, but I have not determined which one: use the `health` field instead. !!
```

Expected behavior:

- The message explicitly identifies two plausible target stories and does not select one.
- The agent asks which story to update and makes no repository, review, or commit change.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/bang-ambiguous" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/bang-ambiguous-seed-sha.txt")"
test -z "$(git -C "${E2E_ROOT}/bang-ambiguous" status --short)"
test -z "$(find "${E2E_ROOT}" -maxdepth 1 -type f -name 'bang-ambiguous-*-review-[0-9][0-9].log' -print)"
rg -i 'ambiguous|which story|public-status.*format-value|format-value.*public-status|clarif' "${E2E_ROOT}/bang-ambiguous-result.log"
```

## Scenario 14 - File count and diff size are not routing rules

Scenarios 2 and 3 form the comparison:

- Scenario 2 may touch two internal files yet remains direct because every risk condition is supported.
- Scenario 3 changes only one small source module yet must plan because it changes a public contract.

Require both scenarios to pass; do not add a numeric file-count, line-count, or effort assertion.

## Scenario 15 - Static routing and command contracts are exact

Run these static assertions against the revised source repository:

```sh
test -z "$(rg -n '\bDF\b|Diagnose and fix root cause' skills/rpd/SKILL.md README.md || true)"
test -z "$(rg -n '\bWT\b|story worktrees|WT may|WT and' skills/rpd/SKILL.md README.md || true)"
test -z "$(rg -n 'without an explicit implementation command|then stop unless' skills/rpd/SKILL.md README.md || true)"
test "$(rg -c 'rpd-loop\.png' README.md)" = 1
test -s rpd-loop.png
file rpd-loop.png | rg -F 'PNG image data'
test ! -e SKILL.md
test ! -e skills/rpd/rpd-loop.png
test -d tests
test "$(rg -c '^/\.docs/$' .gitignore)" = 1
test -f tests/fixtures/intent-based-routing/bang-restart/.docs/reqs/2026/07/27/req-public-status.md
if git check-ignore -q tests/fixtures/intent-based-routing/bang-restart/.docs/reqs/2026/07/27/req-public-status.md
then
  echo "nested test fixture is incorrectly ignored" >&2
  exit 1
fi
test -z "$(find skills/rpd -type d -name tests -print)"
test -z "$(find skills/rpd -path '*/.docs/tests*' -print)"
RPD_SOURCE_ROOT="$(pwd)"
RPD_INSTALL_ROOT="$(mktemp -d /private/tmp/rpd-client-install.XXXXXX)"
(
  cd "${RPD_INSTALL_ROOT}"
  npx --yes skills@latest add "${RPD_SOURCE_ROOT}" --skill rpd --agent codex --copy --yes
)
test -f "${RPD_INSTALL_ROOT}/.agents/skills/rpd/SKILL.md"
test ! -e "${RPD_INSTALL_ROOT}/.agents/skills/rpd/rpd-loop.png"
test ! -e "${RPD_INSTALL_ROOT}/.agents/skills/rpd/README.md"
test -z "$(find "${RPD_INSTALL_ROOT}/.agents/skills/rpd" -type d -name tests -print)"
test -z "$(find "${RPD_INSTALL_ROOT}/.agents/skills/rpd" -path '*/.docs/tests*' -print)"
python3 /Users/esun/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/esun/Documents/Projects/rpd/skills/rpd
perl -0777 -ne 'if (/\A---\n(.*?)\n---\n/s) { print $1; exit 0 } exit 1' skills/rpd/SKILL.md > "${E2E_ROOT}/frontmatter.txt"
test -z "$(rg -n '^(metadata:|[[:space:]]*version:|[[:space:]]*repository:)' "${E2E_ROOT}/frontmatter.txt" || true)"
test "$(rg -c '^\*\*Version:\*\* `3\.2\.1`$' skills/rpd/SKILL.md)" = 1
perl -0777 -ne 'if (/intent: (.*?)\. A command token/s) { $value = $1; $value =~ s/\s+/ /g; print $value; exit 0 } exit 1' \
  "${E2E_ROOT}/frontmatter.txt" > "${E2E_ROOT}/trigger-commands.txt"
test "$(cat "${E2E_ROOT}/trigger-commands.txt")" = 'RPD, REQ, AP, AR, SS, TT, ET, CR, VR, DD, GC, or !!'
perl -0777 -ne 'if (/(?:\A|\n)## Intent Routing\n(.*?)(?=\n## )/s) { print $1; exit 0 } exit 1' skills/rpd/SKILL.md > "${E2E_ROOT}/skill-intent-routing.txt"
perl -0777 -ne 'if (/(?:\A|\n)## Intent Routing\n(.*?)(?=\n## )/s) { print $1; exit 0 } exit 1' README.md > "${E2E_ROOT}/readme-intent-routing.txt"
cmp "${E2E_ROOT}/skill-intent-routing.txt" "${E2E_ROOT}/readme-intent-routing.txt"
for contract in "${E2E_ROOT}/skill-intent-routing.txt" "${E2E_ROOT}/readme-intent-routing.txt"
do
  for term in \
    'localized' 'existing pattern' 'public API' 'schema' 'persistence' \
    'migration' 'authentication' 'security' 'privacy' 'external integration' \
    'dependency contract' 'infrastructure' 'deployment' 'concurrency' \
    'performance' 'availability' 'reliability' 'reversible' \
    'expected behavior' 'verification'
  do
    rg -Fi "${term}" "${contract}"
  done
  rg -Fi 'false, uncertain, or unsupported' "${contract}"
  for intent in 'explanation' 'diagnosis' 'review' 'requirements' 'planning' 'architecture review'
  do
    rg -Fi "${intent}" "${contract}"
  done
done
rg -i -e 'explicit.*REQ.*AP.*AR.*DD.*stage|REQ.*AP.*AR.*DD.*documented' "${E2E_ROOT}/skill-intent-routing.txt"
rg -i -e 'explicit.*!!.*current-story.*restart|!!.*correction.*restart' "${E2E_ROOT}/skill-intent-routing.txt"
rg -i -e 'explicit.*CR.*VR.*documented behavior|explicit CR and VR.*documented behavior' "${E2E_ROOT}/skill-intent-routing.txt"
for command in REQ AP AR DD
do
  RPD_STAGE="${command}" perl -0777 -ne 'my $command = $ENV{RPD_STAGE}; if (/(?:\A|\n)- \*\*\Q$command\E\*\*:(.*?)(?=\n- \*\*[A-Z!]+\*\*:)/s) { print $1; exit 0 } exit 1' \
    skills/rpd/SKILL.md > "${E2E_ROOT}/${command}-section.txt"
  rg -i -e 'do not (implement|edit source)|documentation-only|only.*documented|only.*worktree' "${E2E_ROOT}/${command}-section.txt"
done
perl -0777 -ne 'if (/(?:\A|\n)- \*\*!!\*\*:(.*?)(?=\n- \*\*[A-Z!]+\*\*:)/s) { print $1; exit 0 } exit 1' \
  skills/rpd/SKILL.md > "${E2E_ROOT}/bang-section.txt"
for contract in \
  'current story' \
  'without approval between stages' \
  'any earlier AR pass is stale' \
  'AR* → SS(+CR*) → TT → ET? → VR* → DD → GC' \
  'before AR explicitly passes'
do
  rg -F "${contract}" "${E2E_ROOT}/bang-section.txt"
done
test -z "$(rg -n '`!!` is documentation-only|!!.*do not authorize source changes|REQ, AP, AR, DD, and `!!`' skills/rpd/SKILL.md README.md | rg -v 'reconciliation step of `!!` is documentation-only' || true)"
perl -0777 -ne 'if (/(?:\A|\n)- \*\*SS\*\*:(.*?)(?=\n- \*\*[A-Z!]+\*\*:)/s) { print $1; exit 0 } exit 1' skills/rpd/SKILL.md > "${E2E_ROOT}/ss-section.txt"
rg -Fi 'approved plan' "${E2E_ROOT}/ss-section.txt"
! rg -Fi 'direct path' "${E2E_ROOT}/ss-section.txt"
rg -F 'Sequence: `REQ → AP → AR* → SS(+CR*) → TT → ET? → VR* → DD → GC`' skills/rpd/SKILL.md
rg -F 'Sequence: `REQ → AP → AR* → SS(+CR*) → TT → ET? → VR* → DD → GC`' README.md
perl -0777 -ne 'if (/(?:\A|\n)## Command Keywords\n(.*?)(?=\n## Documentation Structure)/s) { print $1; exit 0 } exit 1' skills/rpd/SKILL.md > "${E2E_ROOT}/command-keywords.txt"
test "$(rg -c '^- \*\*[^*]+\*\*:' "${E2E_ROOT}/command-keywords.txt")" = 12
for command in REQ AP AR SS TT ET CR VR DD GC '!!' RPD
do
  test "$(rg -c "^- \\*\\*${command}\\*\\*:" "${E2E_ROOT}/command-keywords.txt")" = 1
done
sed -n '/^## Commands Reference$/,/^## Notes$/p' README.md > "${E2E_ROOT}/commands-reference.txt"
test "$(rg -c '^\| `[A-Z!]+` \|' "${E2E_ROOT}/commands-reference.txt")" = 12
for command in REQ AP AR SS TT ET CR VR DD GC '!!' RPD
do
  test "$(rg -c "^\\| \`${command}\` \\|" "${E2E_ROOT}/commands-reference.txt")" = 1
done
```

The exact 12-row count plus one match for every expected command rejects missing, duplicate, and unexpected command rows. The explicit absence check rejects residual `WT` contract text. Ordinary bug-fix duties are proved by Scenarios 1 and 3 rather than a replacement alias.
