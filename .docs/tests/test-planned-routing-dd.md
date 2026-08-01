# E2E Spec: Planned Routing Writes Completion Documentation

## Scenario 1 - Durable contract ends planned routing at DD

- **Given:** the installable skill and repository README define intent routing
- **When:** their planned-routing contracts are extracted
- **Then:** both contracts are byte-identical, include
  `SS(+CR*) → TT → ET? → VR* → DD`, require successful verification before DD,
  and reserve `GC` for explicit `RPD` or `GC` intent

```sh
set -e
RPD_E2E_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/rpd-planned-dd.XXXXXX")"
perl -0777 -ne 'if (/(?:\A|\n)## Intent Routing\n(.*?)(?=\n## )/s) { print $1; exit 0 } exit 1' \
  skills/rpd/SKILL.md > "${RPD_E2E_ROOT}/skill-intent.txt"
perl -0777 -ne 'if (/(?:\A|\n)## Intent Routing\n(.*?)(?=\n## )/s) { print $1; exit 0 } exit 1' \
  README.md > "${RPD_E2E_ROOT}/readme-intent.txt"
cmp "${RPD_E2E_ROOT}/skill-intent.txt" "${RPD_E2E_ROOT}/readme-intent.txt"
rg -F 'SS(+CR*) → TT → ET? → VR* → DD' "${RPD_E2E_ROOT}/skill-intent.txt"
rg -Fi 'after VR passes' "${RPD_E2E_ROOT}/skill-intent.txt"
rg -Fi 'Run GC only when the user asks for it' "${RPD_E2E_ROOT}/skill-intent.txt"
rg -F 'Stale, contradictory, or incomplete REQ, AP, or test docs' skills/rpd/SKILL.md README.md
rg -F 'Do not require a DD completion document to exist or be current before VR passes' skills/rpd/SKILL.md README.md
rg -F 'does not require rerunning AR or CR' skills/rpd/SKILL.md README.md
rg -F 'Each `## Scenario` section must contain one or more non-empty Given, When, and Then steps, grouped in that order.' skills/rpd/SKILL.md
rg -F 'Allow ordinary Markdown list markers followed by whitespace and blank lines between those steps.' skills/rpd/SKILL.md
```

## Scenario 2 - Planned execution proves DD without GC

- **Given:** Scenario 3 of the canonical intent-routing suite executes an ordinary natural-language
  public-contract implementation through planned routing
- **When:** that scenario asserts the completed case
- **Then:** it requires one scoped `public-status.md` completion document and requires Git `HEAD`
  to remain at the seed commit

```sh
set -e
RPD_E2E_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/rpd-planned-dd.XXXXXX")"
perl -0777 -ne 'if (/## Scenario 3 - Planned public-contract bug continues after AR\n(.*?)(?=\n## Scenario 4)/s) { print $1; exit 0 } exit 1' \
  .docs/tests/test-intent-based-routing.md > "${RPD_E2E_ROOT}/scenario-3.txt"
rg -F 'public-api-bug-seed-sha.txt' "${RPD_E2E_ROOT}/scenario-3.txt"
rg -F '.docs/done' "${RPD_E2E_ROOT}/scenario-3.txt"
rg -F 'assert_dd_after_vr public-api-bug public-status.md ABSENT' "${RPD_E2E_ROOT}/scenario-3.txt"
```

## Scenario 3 - Diagram and version expose the changed contract

- **Given:** the repository publishes the skill contract and workflow diagram together
- **When:** the release artifacts are inspected
- **Then:** version `3.6.0` is consistent, the diagram is present, and README alt text describes the
  planned path through DD, the full RPD path through GC, and the restart path stopping at DD

```sh
set -e
test "$(rg -cF '**Version:** `3.6.0`' skills/rpd/SKILL.md)" = 1
test "$(rg -cF '**Version:** `3.6.0`' README.md)" = 1
rg -F 'planned path that runs REQ, AP, AR, SS with code review, TT, ET, VR, and DD' README.md
rg -F 'full RPD sequence through GC' README.md
rg -F 'restart path that stops at DD without GC' README.md
perl -0777 -ne 'exit(/## \[3\.6\.0\].*?planned routing.*?DD.*?(?:!!).*?(?:no longer|does not|without).*?(?:GC|commit)/is ? 0 : 1)' CHANGELOG.md
rg -F '`3.6.0` is an owner-directed compatibility exception' CHANGELOG.md
test -s rpd-loop.png
file rpd-loop.png | rg -F 'PNG image data'
```

## Scenario 4 - Bang restart documents corrections without committing

- **Given:** `!!` reconciles and re-executes a current story
- **When:** its command contract and canonical execution scenario are inspected
- **Then:** the flow ends at DD, Scenario 11 requires unchanged Git history and scoped uncommitted
  changes, and no GC success claim is allowed

```sh
set -e
RPD_E2E_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/rpd-planned-dd.XXXXXX")"
perl -0777 -ne 'if (/(?:\A|\n)- \*\*!!\*\*:(.*?)(?=\n- \*\*[A-Z!]+\*\*:)/s) { print $1; exit 0 } exit 1' \
  skills/rpd/SKILL.md > "${RPD_E2E_ROOT}/bang-contract.txt"
rg -F 'AR* → SS(+CR*) → TT → ET? → VR* → DD' "${RPD_E2E_ROOT}/bang-contract.txt"
test -z "$(rg -F '→ GC' "${RPD_E2E_ROOT}/bang-contract.txt" || true)"
perl -0777 -ne 'if (/## Scenario 11 - Explicit `!!` reconciles and restarts the current story\n(.*?)(?=\n## Scenario 12)/s) { print $1; exit 0 } exit 1' \
  .docs/tests/test-intent-based-routing.md > "${RPD_E2E_ROOT}/scenario-11.txt"
rg -F 'bang-restart-seed-sha.txt' "${RPD_E2E_ROOT}/scenario-11.txt"
rg -F 'rev-parse HEAD)" = "${seed_sha}"' "${RPD_E2E_ROOT}/scenario-11.txt"
rg -F 'DD: PASS — completion document written' "${RPD_E2E_ROOT}/scenario-11.txt"
! rg -F 'Do not commit.' "${RPD_E2E_ROOT}/scenario-11.txt"
rg -F 'assert_dd_after_vr bang-restart public-status.md UNCHANGED' "${RPD_E2E_ROOT}/scenario-11.txt"
rg -Fi 'GC: PASS' "${RPD_E2E_ROOT}/scenario-11.txt" && exit 1 || true
```

## Scenario 5 - Canonical planned routes prove DD ordering and scope

- **Given:** Scenarios 3, 5, and 6 are successful natural-language planned routes
- **When:** their canonical harness contracts are inspected
- **Then:** each uses neutral route-authorized commit policy, requires terminal VR evidence that DD
  was absent before the decision, requires a scoped DD afterward, and leaves Git history unchanged

```sh
set -e
RPD_E2E_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/rpd-planned-dd.XXXXXX")"
rg -F 'Follow only the selected route' .docs/tests/test-intent-based-routing.md
rg -F 'Completion document before VR decision: ABSENT' .docs/tests/test-intent-based-routing.md
rg -F 'Completion document before VR decision: UNCHANGED' .docs/tests/test-intent-based-routing.md
rg -F './.docs/plans/*' .docs/tests/test-intent-based-routing.md
for RPD_HEADING in \
  'Scenario 3 - Planned public-contract bug continues after AR' \
  'Scenario 5 - Security-sensitive implementation selects planning' \
  'Scenario 6 - External dependency contract selects planning'
do
  export RPD_HEADING
  perl -0777 -ne '$h=$ENV{RPD_HEADING}; if (/## \Q$h\E\n(.*?)(?=\n## Scenario)/s) { print $1; exit 0 } exit 1' \
    .docs/tests/test-intent-based-routing.md > "${RPD_E2E_ROOT}/planned.txt"
  rg -F '.docs/done' "${RPD_E2E_ROOT}/planned.txt"
  rg -F 'assert_dd_after_vr' "${RPD_E2E_ROOT}/planned.txt"
  rg -F 'rev-parse HEAD' "${RPD_E2E_ROOT}/planned.txt"
  rg -F "! rg -q '^GC:'" "${RPD_E2E_ROOT}/planned.txt"
done
```

## Scenario 6 - Snapshot hashing ignores only AR/CR progress markers

- **Given:** stable review hashing distinguishes plan content from checkbox-only progress
- **When:** an isolated plan is mutated one property at a time
- **Then:** AR/CR ignore only task-marker toggles inside `## Phased Tasks`, VR detects those toggles,
  and every content/order/scope mutation changes all stage hashes

```sh
set -e
RPD_E2E_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/rpd-planned-dd.XXXXXX")"
RPD_CASE_ROOT="${RPD_E2E_ROOT}/case"
cp -R .docs/tests/fixtures/intent-based-routing/bang-restart/. "${RPD_CASE_ROOT}/"
perl -0777 -ne 'if (/Prepend these helpers.*?\x60\x60\x60sh\n(.*?)\x60\x60\x60/s) { print $1; exit 0 } exit 1' \
  .docs/tests/test-intent-based-routing.md > "${RPD_E2E_ROOT}/helpers.sh"
. "${RPD_E2E_ROOT}/helpers.sh"
RPD_PLAN="${RPD_CASE_ROOT}/.docs/plans/2026/07/27/plan-public-status.md"
cp "${RPD_PLAN}" "${RPD_E2E_ROOT}/plan-original.md"
RPD_AR_BASE="$(snapshot_hash "${RPD_CASE_ROOT}" AR)"
RPD_CR_BASE="$(snapshot_hash "${RPD_CASE_ROOT}" CR)"
RPD_VR_BASE="$(snapshot_hash "${RPD_CASE_ROOT}" VR)"

perl -0pi -e 's/(## Phased Tasks.*?\n- )\[x\]/${1}[ ]/s' "${RPD_PLAN}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" AR)" = "${RPD_AR_BASE}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" CR)" = "${RPD_CR_BASE}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" VR)" != "${RPD_VR_BASE}"

cp "${RPD_E2E_ROOT}/plan-original.md" "${RPD_PLAN}"
perl -0pi -e 's/(## Phased Tasks.*?- \[[ x]\][^\n]*)/$1 changed/s' "${RPD_PLAN}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" AR)" != "${RPD_AR_BASE}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" CR)" != "${RPD_CR_BASE}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" VR)" != "${RPD_VR_BASE}"

cp "${RPD_E2E_ROOT}/plan-original.md" "${RPD_PLAN}"
perl -0pi -e 's/(## Phased Tasks.*?### [^\n]+\n\n)(- \[[ x]\][^\n]*\n)(- \[[ x]\][^\n]*\n)/$1$3$2/s' "${RPD_PLAN}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" AR)" != "${RPD_AR_BASE}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" CR)" != "${RPD_CR_BASE}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" VR)" != "${RPD_VR_BASE}"

cp "${RPD_E2E_ROOT}/plan-original.md" "${RPD_PLAN}"
perl -0pi -e 's/(## Phased Tasks.*?### [^\n]+\n\n)/${1}- [ ] Added scope\n/s' "${RPD_PLAN}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" AR)" != "${RPD_AR_BASE}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" CR)" != "${RPD_CR_BASE}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" VR)" != "${RPD_VR_BASE}"

cp "${RPD_E2E_ROOT}/plan-original.md" "${RPD_PLAN}"
perl -0pi -e 's/(## Phased Tasks.*?\n)- \[[ x]\][^\n]*\n/$1/s' "${RPD_PLAN}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" AR)" != "${RPD_AR_BASE}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" CR)" != "${RPD_CR_BASE}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" VR)" != "${RPD_VR_BASE}"

cp "${RPD_E2E_ROOT}/plan-original.md" "${RPD_PLAN}"
perl -0pi -e 's/(## Decisions\n)/$1\nChanged non-marker prose.\n/' "${RPD_PLAN}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" AR)" != "${RPD_AR_BASE}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" CR)" != "${RPD_CR_BASE}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" VR)" != "${RPD_VR_BASE}"

cp "${RPD_E2E_ROOT}/plan-original.md" "${RPD_PLAN}"
perl -0pi -e 's/(## Decisions\n)/$1\n- [x] Checkbox-shaped decision\n/' "${RPD_PLAN}"
RPD_OUTSIDE_AR="$(snapshot_hash "${RPD_CASE_ROOT}" AR)"
RPD_OUTSIDE_CR="$(snapshot_hash "${RPD_CASE_ROOT}" CR)"
RPD_OUTSIDE_VR="$(snapshot_hash "${RPD_CASE_ROOT}" VR)"
perl -0pi -e 's/- \[x\] Checkbox-shaped decision/- [ ] Checkbox-shaped decision/' "${RPD_PLAN}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" AR)" != "${RPD_OUTSIDE_AR}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" CR)" != "${RPD_OUTSIDE_CR}"
test "$(snapshot_hash "${RPD_CASE_ROOT}" VR)" != "${RPD_OUTSIDE_VR}"

E2E_ROOT="${RPD_E2E_ROOT}/review-evidence"
mkdir -p "${E2E_ROOT}"
RPD_HASH_A="$(printf 'a%.0s' {1..64})"
RPD_HASH_B="$(printf 'b%.0s' {1..64})"
RPD_HASH_C="$(printf 'c%.0s' {1..64})"
printf '%s\n' \
  'Phase: AR' \
  'Decision: PASS' \
  "Snapshot: ${RPD_HASH_A}" \
  'Source/test changes: NONE' \
  'Verification digest: ABSENT' \
  'Snapshot unchanged: YES' \
  > "${E2E_ROOT}/demo-AR-review-01.log"
printf '%s\n' \
  'Phase: AR' \
  'Decision: PASS' \
  "Snapshot: ${RPD_HASH_B}" \
  'Source/test changes: PRESENT' \
  'Verification digest: MATCH' \
  'Snapshot unchanged: YES' \
  > "${E2E_ROOT}/demo-AR-review-02.log"
printf '%s\n' "${RPD_HASH_B}" > "${E2E_ROOT}/demo-AR-snapshot-02.txt"
if assert_ar_before_code demo 2>/dev/null
then
  exit 1
fi
printf '%s\n' "${RPD_HASH_C}" > "${E2E_ROOT}/demo-AR-snapshot-01.txt"
if assert_ar_before_code demo 2>/dev/null
then
  exit 1
fi
printf '%s\n' "${RPD_HASH_A}" > "${E2E_ROOT}/demo-AR-snapshot-01.txt"
assert_ar_before_code demo
rg -F 'assert_gwt_scenarios "${public_e2e}" 1' .docs/tests/test-intent-based-routing.md
rg -F 'assert_gwt_scenarios "${security_e2e}" 2' .docs/tests/test-intent-based-routing.md
rg -F 'assert_gwt_scenarios "${external_e2e}" 2' .docs/tests/test-intent-based-routing.md
rg -F 'mixed-valid-malformed-scenarios.md' .docs/tests/test-intent-based-routing.md
rg -F 'duplicate-out-of-order-scenario.md' .docs/tests/test-intent-based-routing.md
rg -F 'empty-middle-scenario.md' .docs/tests/test-intent-based-routing.md
rg -F 'sibling-heading-escape.md' .docs/tests/test-intent-based-routing.md
rg -F 'tab-sibling-heading-escape.md' .docs/tests/test-intent-based-routing.md
rg -F 'bare-crlf-sibling-heading-escape.md' .docs/tests/test-intent-based-routing.md
rg -F 'valid-crlf-public.md' .docs/tests/test-intent-based-routing.md
rg -F 'trailing-empty-scenario.md' .docs/tests/test-intent-based-routing.md
rg -F 'invalid-scenario-heading-boundary.md' .docs/tests/test-intent-based-routing.md
rg -F 'bare-scenario-heading.md' .docs/tests/test-intent-based-routing.md
rg -F 'label-prefix-lookalikes.md' .docs/tests/test-intent-based-routing.md
rg -F 'fused-bold-labels.md' .docs/tests/test-intent-based-routing.md
rg -F 'malformed-public-semantic-decoy.md' .docs/tests/test-intent-based-routing.md
rg -F 'negated-public-outcome.md' .docs/tests/test-intent-based-routing.md
rg -F 'opposite-public-value.md' .docs/tests/test-intent-based-routing.md
rg -F 'documentation-suffix-public.md' .docs/tests/test-intent-based-routing.md
rg -F 'documentation-context-public.md' .docs/tests/test-intent-based-routing.md
rg -F 'non-operational-public-context.md' .docs/tests/test-intent-based-routing.md
rg -F 'negated-public-execution.md' .docs/tests/test-intent-based-routing.md
rg -F 'public-given-suffix.md' .docs/tests/test-intent-based-routing.md
rg -F 'invalid-public-access.md' .docs/tests/test-intent-based-routing.md
rg -F 'invalid-public-when-access.md' .docs/tests/test-intent-based-routing.md
rg -F 'absent-public-outcomes.md' .docs/tests/test-intent-based-routing.md
rg -F 'malformed-security-semantic-decoy.md' .docs/tests/test-intent-based-routing.md
rg -F 'same-scenario-security-proof.md' .docs/tests/test-intent-based-routing.md
rg -F 'negated-security-preconditions.md' .docs/tests/test-intent-based-routing.md
rg -F 'adjective-security-preconditions.md' .docs/tests/test-intent-based-routing.md
rg -F 'opposite-security-preconditions.md' .docs/tests/test-intent-based-routing.md
rg -F 'documentation-suffix-security.md' .docs/tests/test-intent-based-routing.md
rg -F 'documentation-context-security.md' .docs/tests/test-intent-based-routing.md
rg -F 'negated-security-execution.md' .docs/tests/test-intent-based-routing.md
rg -F 'cannot-security-execution.md' .docs/tests/test-intent-based-routing.md
rg -F 'security-runtime-suffix.md' .docs/tests/test-intent-based-routing.md
rg -F 'invalid-credential-complements.md' .docs/tests/test-intent-based-routing.md
rg -F 'contradictory-security-adjectives.md' .docs/tests/test-intent-based-routing.md
rg -F 'prose-only-external-semantics.md' .docs/tests/test-intent-based-routing.md
rg -F 'same-scenario-external-proof.md' .docs/tests/test-intent-based-routing.md
rg -F 'opposite-external-outcomes.md' .docs/tests/test-intent-based-routing.md
rg -F 'post-term-negated-v2.md' .docs/tests/test-intent-based-routing.md
rg -F 'v1-instead-of-v2.md' .docs/tests/test-intent-based-routing.md
rg -F 'non-retry-preservation.md' .docs/tests/test-intent-based-routing.md
rg -F 'documentation-only-retry.md' .docs/tests/test-intent-based-routing.md
rg -F 'documentation-prefixed-external.md' .docs/tests/test-intent-based-routing.md
rg -F 'documentation-suffix-external.md' .docs/tests/test-intent-based-routing.md
rg -F 'documentation-context-external.md' .docs/tests/test-intent-based-routing.md
rg -F 'negated-external-execution.md' .docs/tests/test-intent-based-routing.md
rg -F 'cannot-external-execution.md' .docs/tests/test-intent-based-routing.md
rg -F 'external-runtime-suffix.md' .docs/tests/test-intent-based-routing.md
rg -F 'mention-only-external-outcomes.md' .docs/tests/test-intent-based-routing.md
```
