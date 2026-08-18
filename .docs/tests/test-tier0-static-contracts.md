# Tier 0 - Static Contracts

**Cost:** no agents, no reviewers. Runs in seconds. Run this on every commit.

**Proves:** the published skill contract, the README, the CHANGELOG, and the packaged artifact all
state the same routing rules; the snapshot-hash helper is sound; the Given/When/Then structural
validator is sound.

Execute each block from a temporary script file or as one complete `bash -c` string, not by piping
it to Bash. The `npx skills add` command may consume piped standard input and prevent later
assertions from running.

## Scenario 0.1 - Skill, README, and package agree on the routing contract

```sh
set -e
RPD_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/rpd-tier0.XXXXXX")"
E2E_ROOT="${RPD_ROOT}"
perl -0777 -ne 'if (/\x60\x60\x60sh\n(snapshot_hash.*?)\x60\x60\x60/s) { print $1; exit 0 } exit 1' \
  .docs/tests/test-helpers.md > "${RPD_ROOT}/helpers.sh"
. "${RPD_ROOT}/helpers.sh"
test -z "$(rg -n '\bDF\b|Diagnose and fix root cause' skills/rpd/SKILL.md README.md || true)"
test -z "$(rg -n '\bWT\b|story worktrees|WT may|WT and' skills/rpd/SKILL.md README.md || true)"
test -z "$(rg -n 'without an explicit implementation command|then stop unless' skills/rpd/SKILL.md README.md || true)"
test "$(rg -c 'rpd-loop\.png' README.md)" = 1
test -s rpd-loop.png
file rpd-loop.png | rg -F 'PNG image data'
test ! -e SKILL.md
test ! -e skills/rpd/rpd-loop.png
test -d .docs/tests
test ! -e tests
test -z "$(rg -n '^/?\.docs/?$' .gitignore || true)"
test -f .docs/tests/fixtures/intent-based-routing/bang-restart/.docs/reqs/2026/07/27/req-public-status.md
for tracked_path in .docs/reqs .docs/plans .docs/tests \
  .docs/tests/fixtures/intent-based-routing/bang-restart/.docs/reqs/2026/07/27/req-public-status.md
do
  if git check-ignore -q "${tracked_path}"
  then
    echo "${tracked_path} is incorrectly ignored" >&2
    exit 1
  fi
  test -n "$(git ls-files "${tracked_path}")"
done
test -z "$(find skills/rpd -type d -name tests -print)"
test -z "$(find skills/rpd -path '*/.docs/tests*' -print)"
RPD_TMP_ROOT="${RPD_TMP_ROOT:-${TMPDIR:-/tmp}}"
RPD_SOURCE_ROOT="$(pwd)"
RPD_INSTALL_ROOT="$(mktemp -d "${RPD_TMP_ROOT%/}/rpd-client-install.XXXXXX")"
(
  cd "${RPD_INSTALL_ROOT}"
  npx --yes skills@latest add "${RPD_SOURCE_ROOT}" --skill rpd --agent codex --copy --yes
)
test -f "${RPD_INSTALL_ROOT}/.agents/skills/rpd/SKILL.md"
test ! -e "${RPD_INSTALL_ROOT}/.agents/skills/rpd/rpd-loop.png"
test ! -e "${RPD_INSTALL_ROOT}/.agents/skills/rpd/README.md"
test -z "$(find "${RPD_INSTALL_ROOT}/.agents/skills/rpd" -type d -name tests -print)"
test -z "$(find "${RPD_INSTALL_ROOT}/.agents/skills/rpd" -path '*/.docs/tests*' -print)"
RPD_SKILL_VALIDATOR="${RPD_SKILL_VALIDATOR:-${HOME}/.codex/skills/.system/skill-creator/scripts/quick_validate.py}"
if [ -f "${RPD_SKILL_VALIDATOR}" ]
then
  python3 "${RPD_SKILL_VALIDATOR}" skills/rpd
else
  echo "skipping frontmatter validation: set RPD_SKILL_VALIDATOR to a skill-creator quick_validate.py path" >&2
fi
perl -0777 -ne 'if (/\A---\n(.*?)\n---\n/s) { print $1; exit 0 } exit 1' skills/rpd/SKILL.md > "${E2E_ROOT}/frontmatter.txt"
test -z "$(rg -n '^(metadata:|[[:space:]]*version:|[[:space:]]*repository:)' "${E2E_ROOT}/frontmatter.txt" || true)"
test "$(rg -c '^\*\*Version:\*\* `[0-9]+\.[0-9]+\.[0-9]+`$' skills/rpd/SKILL.md)" = 1
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
rg -F 'AR blocked: <flaw and why it cannot be resolved in place>' "${E2E_ROOT}/AR-section.txt"
rg -F '`AR blocked` is not a pass' "${E2E_ROOT}/AR-section.txt"
rg -Fi 'not a literal value a later release invalidates' "${E2E_ROOT}/REQ-section.txt"
rg -F 'Planned-routing terminus' "${E2E_ROOT}/skill-intent-routing.txt"
rg -F 'SS(+CR*) → TT → ET? → VR* → DD' "${E2E_ROOT}/skill-intent-routing.txt"
rg -Fi 'Run DD only after VR passes' "${E2E_ROOT}/skill-intent-routing.txt"
rg -Fi 'stop without a completion document' "${E2E_ROOT}/skill-intent-routing.txt"
rg -Fi 'Run GC only when the user asks for it' "${E2E_ROOT}/skill-intent-routing.txt"
rg -F 'Direct-path terminus' "${E2E_ROOT}/skill-intent-routing.txt"
rg -Fi 'direct implementation ends after CR and creates no `.docs` artifacts' "${E2E_ROOT}/skill-intent-routing.txt"
for contract in \
  'A blocking open question about expected behavior does not exempt this from creating AP' \
  'let AR report `AR blocked` on it rather than stopping after REQ alone'
do
  rg -F "${contract}" "${E2E_ROOT}/skill-intent-routing.txt"
  rg -F "${contract}" "${E2E_ROOT}/readme-intent-routing.txt"
done
rg -Fi 'classify by the story'\''s subject matter' "${E2E_ROOT}/AP-section.txt"
rg -Fi 'even when currently implemented as a single pure function' "${E2E_ROOT}/AP-section.txt"
perl -0777 -ne 'if (/(?:\A|\n)(Create E2E specs .*?)(?=\n\n)/s) { print $1; exit 0 } exit 1' \
  README.md > "${E2E_ROOT}/readme-e2e-guidance.txt"
for term in 'public API' 'consumer contract'
do
  rg -Fi "${term}" "${E2E_ROOT}/AP-section.txt"
  rg -Fi "${term}" "${E2E_ROOT}/readme-e2e-guidance.txt"
done
rg -Fi 'pure function' "${E2E_ROOT}/AP-section.txt"
rg -Fi 'pure function' "${E2E_ROOT}/readme-e2e-guidance.txt"
rg -Fi 'no live' "${E2E_ROOT}/AP-section.txt"
rg -Fi 'no live' "${E2E_ROOT}/readme-e2e-guidance.txt"
rg -F 'Each `## Scenario` section must contain one or more non-empty Given, When, and Then steps, grouped in that order.' "${E2E_ROOT}/AP-section.txt"
rg -F 'Allow ordinary Markdown list markers followed by whitespace and blank lines between those steps.' "${E2E_ROOT}/AP-section.txt"
for contract in \
  'Do not add workflow bookkeeping as plan tasks' \
  'Finish and check every plan task before the final VR decision'
do
  rg -F "${contract}" "${E2E_ROOT}/AP-section.txt"
  rg -F "${contract}" README.md
done
rg -i 'AP checkbox tasks.*implementation.*verification.*workflow bookkeeping.*AR.*CR.*VR.*DD.*GC.*complete before VR' \
  .docs/reqs/2026/07/27/req-intent-based-routing.md
rg -i 'Keep AP checkbox state coherent.*exclude workflow-stage.*require every task complete before final VR' \
  .docs/plans/2026/07/27/plan-intent-based-routing.md
for artifact in \
  .docs/reqs/2026/07/27/req-intent-based-routing.md \
  .docs/plans/2026/07/27/plan-intent-based-routing.md
do
  rg -i 'checkbox-marker-only.*task text|checkbox-marker-only.*task'\''s text' "${artifact}"
  rg -i 'text.*order.*scope.*all other plan content.*unchanged' "${artifact}"
done
! rg -ni '^- \[[ x]\][ \t]+(?:Run|invoke)[ \t]+(?:AR|CR|VR|DD|GC)\b|^- \[[ x]\][ \t]+(?:Stage|Commit|Push|Open(?: a)? pull request)\b' \
  .docs/plans/2026/07/27/plan-intent-based-routing.md
```

## Scenario 0.2 - Planned routing terminates at DD and reserves GC

```sh
set -e
RPD_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/rpd-tier0.XXXXXX")"
perl -0777 -ne 'if (/(?:\A|\n)## Intent Routing\n(.*?)(?=\n## )/s) { print $1; exit 0 } exit 1' \
  skills/rpd/SKILL.md > "${RPD_ROOT}/skill-intent.txt"
perl -0777 -ne 'if (/(?:\A|\n)## Intent Routing\n(.*?)(?=\n## )/s) { print $1; exit 0 } exit 1' \
  README.md > "${RPD_ROOT}/readme-intent.txt"
cmp "${RPD_ROOT}/skill-intent.txt" "${RPD_ROOT}/readme-intent.txt"
rg -F 'SS(+CR*) → TT → ET? → VR* → DD' "${RPD_ROOT}/skill-intent.txt"
rg -Fi 'after VR passes' "${RPD_ROOT}/skill-intent.txt"
rg -Fi 'Run GC only when the user asks for it' "${RPD_ROOT}/skill-intent.txt"
rg -F 'Stale, contradictory, or incomplete REQ, AP, or test docs' skills/rpd/SKILL.md README.md
rg -F 'Do not require a DD completion document to exist or be current before VR passes' skills/rpd/SKILL.md README.md
rg -F 'does not require rerunning AR or CR' skills/rpd/SKILL.md README.md
rg -F 'Each `## Scenario` section must contain one or more non-empty Given, When, and Then steps, grouped in that order.' skills/rpd/SKILL.md
rg -F 'Allow ordinary Markdown list markers followed by whitespace and blank lines between those steps.' skills/rpd/SKILL.md

# `!!` reconciles and restarts but never commits
perl -0777 -ne 'if (/(?:\A|\n)- \*\*!!\*\*:(.*?)(?=\n- \*\*[A-Z!]+\*\*:)/s) { print $1; exit 0 } exit 1' \
  skills/rpd/SKILL.md > "${RPD_ROOT}/bang-contract.txt"
rg -F 'AR* → SS(+CR*) → TT → ET? → VR* → DD' "${RPD_ROOT}/bang-contract.txt"
test -z "$(rg -F '→ GC' "${RPD_ROOT}/bang-contract.txt" || true)"
```

## Scenario 0.3 - Release artifacts expose the current contract

```sh
set -e
test "$(rg -cF '**Version:** `3.7.0`' skills/rpd/SKILL.md)" = 1
test "$(rg -cF '**Version:** `3.7.0`' README.md)" = 1
rg -F 'planned path that runs REQ, AP, AR, SS with code review, TT, ET, VR, and DD' README.md
rg -F 'full RPD sequence through GC' README.md
rg -F 'restart path that stops at DD without GC' README.md
perl -0777 -ne 'exit(/## \[3\.6\.0\].*?planned routing.*?DD.*?(?:!!).*?(?:no longer|does not|without).*?(?:GC|commit)/is ? 0 : 1)' CHANGELOG.md
perl -0777 -ne 'exit(/## \[3\.7\.0\].*?review round.*?reviewer.*?(?:reused|new).*?(?:not applicable|primary-agent)/is ? 0 : 1)' CHANGELOG.md
rg -F '`3.6.0` is an owner-directed compatibility exception' CHANGELOG.md
test -s rpd-loop.png
file rpd-loop.png | rg -F 'PNG image data'
```

## Scenario 0.4 - Snapshot hashing ignores only AR/CR progress markers

Mutates an isolated plan one property at a time. AR/CR must ignore task-marker toggles inside
`## Phased Tasks`; VR must detect them; every content, order, and scope mutation must change all
three stage hashes.

```sh
set -e
RPD_E2E_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/rpd-planned-dd.XXXXXX")"
RPD_CASE_ROOT="${RPD_E2E_ROOT}/case"
cp -R .docs/tests/fixtures/intent-based-routing/bang-restart/. "${RPD_CASE_ROOT}/"
perl -0777 -ne 'if (/\x60\x60\x60sh\n(snapshot_hash.*?)\x60\x60\x60/s) { print $1; exit 0 } exit 1' \
  .docs/tests/test-helpers.md > "${RPD_E2E_ROOT}/helpers.sh"
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
```

## Scenario 0.5 - The Given/When/Then structural validator is sound

`assert_gwt_scenarios` is the only generated-document check that survives into Tier 2. It asserts
structure — one or more non-empty Given, When, and Then steps per `## Scenario`, in that order — and
deliberately says nothing about wording.

```sh
set -e
RPD_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/rpd-tier0-gwt.XXXXXX")"
perl -0777 -ne 'if (/\x60\x60\x60sh\n(snapshot_hash.*?)\x60\x60\x60/s) { print $1; exit 0 } exit 1' \
  .docs/tests/test-helpers.md > "${RPD_ROOT}/helpers.sh"
. "${RPD_ROOT}/helpers.sh"

printf '%s\n' \
  '## Scenario: valid one' 'Given a webhook exists' 'When the request is built' 'Then the endpoint uses v2' \
  '' \
  '## Scenario: valid two' '- **Given:** a webhook exists' '- **When:** the request is built' '- **Then:** retries are preserved' \
  > "${RPD_ROOT}/valid.md"
assert_gwt_scenarios "${RPD_ROOT}/valid.md" 2
! assert_gwt_scenarios "${RPD_ROOT}/valid.md" 3

printf '%s\n' '## Scenario: empty body' 'Given:' 'When the request is built' 'Then the endpoint uses v2' \
  > "${RPD_ROOT}/empty.md"
! assert_gwt_scenarios "${RPD_ROOT}/empty.md" 1

printf '%s\n' '## Scenario: reversed' 'When the request is built' 'Given a webhook exists' 'Then the endpoint uses v2' \
  > "${RPD_ROOT}/reversed.md"
! assert_gwt_scenarios "${RPD_ROOT}/reversed.md" 1

printf '%s\n' '## Scenario: no then' 'Given a webhook exists' 'When the request is built' \
  > "${RPD_ROOT}/no-then.md"
! assert_gwt_scenarios "${RPD_ROOT}/no-then.md" 1

printf '%s\n' \
  'Given a webhook exists' 'When the request is built' 'Then the endpoint uses v2' \
  '' \
  '## Scenario: the only owned scenario' 'Given a webhook exists' 'When the request is built' 'Then retries are preserved' \
  > "${RPD_ROOT}/preamble.md"
! assert_gwt_scenarios "${RPD_ROOT}/preamble.md" 2

printf '%s\n' \
  '## Scenario: valid' 'Given a webhook exists' 'When the request is built' 'Then the endpoint uses v2' \
  '' \
  '## Scenario: malformed sibling' 'When it starts' 'Given the contract exists' 'Then it fails' \
  > "${RPD_ROOT}/mixed.md"
! assert_gwt_scenarios "${RPD_ROOT}/mixed.md" 2
```

## Scenario 0.6 - Tier 2 still carries the anti-fabrication assertions

Guards against the evidence contract being quietly weakened.

```sh
set -e
rg -F 'Follow only the selected route' .docs/tests/test-tier2-evidence-integrity.md
rg -F 'Completion document before VR decision: ABSENT' .docs/tests/test-tier2-evidence-integrity.md
rg -F 'assert_cr_final internal-bug' .docs/tests/test-tier2-evidence-integrity.md
rg -F 'assert_ar_before_code security-fix' .docs/tests/test-tier2-evidence-integrity.md
rg -F 'assert_dd_after_vr security-fix disabled-user-auth.md ABSENT' .docs/tests/test-tier2-evidence-integrity.md
rg -F "! rg -q '^GC:'" .docs/tests/test-tier2-evidence-integrity.md
rg -F 'review round: [0-9]+; reviewer: (reused|new|not applicable)' .docs/tests/test-tier2-evidence-integrity.md
test "$(rg -c '^\s*rg -e .\^..*review round: \[0-9\]\+; reviewer:' .docs/tests/test-tier2-evidence-integrity.md)" -ge 2
```
## Scenario 0.7 - Review-round disclosure is stated everywhere and preserves the existing contract

Asserts the additive disclosure — round number and reviewer reuse — in the skill, the README, and the
changelog, and asserts that every guarantee the disclosure must not weaken is still stated verbatim.

```sh
set -e
RPD_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/rpd-tier0-disclosure.XXXXXX")"
perl -0777 -ne 'if (/(?:\A|\n)## Independent Review Delegation\n(.*?)(?=\n## )/s) { print $1; exit 0 } exit 1' \
  skills/rpd/SKILL.md > "${RPD_ROOT}/delegation.txt"
test -s "${RPD_ROOT}/delegation.txt"

# The disclosure itself: round counting, line shape, and the three reviewer states.
rg -F 'Count the stage'"'"'s first review as round 1' "${RPD_ROOT}/delegation.txt"
rg -F '`<STAGE> review round: <n>; reviewer: <reused|new|not applicable>`' "${RPD_ROOT}/delegation.txt"
rg -F 'on its own line' "${RPD_ROOT}/delegation.txt"
rg -F 'That line begins with the stage token' "${RPD_ROOT}/delegation.txt"
rg -F 'A stage'"'"'s round 1 is always `reviewer: new`' "${RPD_ROOT}/delegation.txt"
rg -F 'Report `reviewer: reused` when the round used the same independent subagent as the previous round' "${RPD_ROOT}/delegation.txt"
rg -F 'Report `reviewer: not applicable (primary-agent review)`' "${RPD_ROOT}/delegation.txt"
rg -Fi 'never report a reused reviewer for a round no independent subagent performed' "${RPD_ROOT}/delegation.txt"

# A replacement at round 2 or later names one of the already-permitted conditions.
rg -Fi 'At round 2 or later' "${RPD_ROOT}/delegation.txt"
for condition in \
  'previous reviewer unavailable' \
  'previous reviewer contributed to the artifacts under review' \
  'previous reviewer modified the reviewed snapshot'
do
  rg -F "${condition}" "${RPD_ROOT}/delegation.txt"
  rg -F "${condition}" README.md
done

# The disclosure is a report, not a budget.
rg -F 'a report, not a budget' "${RPD_ROOT}/delegation.txt"
rg -F 'a report, not a budget' README.md
rg -Fi 'no round limit, no findings cap, and no fix-only rerun' "${RPD_ROOT}/delegation.txt"
rg -Fi 'no round limit, no findings cap, and no fix-only rerun' README.md

# The line shape carries no verdict wording, so a caller still parses one verdict line per stage.
perl -0777 -ne 'if (/(\Q`<STAGE> review round: <n>; reviewer: <reused|new|not applicable>`\E)/) { print $1; exit 0 } exit 1' \
  "${RPD_ROOT}/delegation.txt" > "${RPD_ROOT}/line-shape.txt"
test -z "$(rg -ni 'passed|fixed|blocked|incomplete' "${RPD_ROOT}/line-shape.txt" || true)"

# Each review command requires the disclosure alongside its unchanged terminal phrase.
for command in AR CR VR
do
  RPD_STAGE="${command}" perl -0777 -ne 'my $command = $ENV{RPD_STAGE}; if (/(?:\A|\n)- \*\*\Q$command\E\*\*:(.*?)(?=\n- \*\*[A-Z!]+\*\*:)/s) { print $1; exit 0 } exit 1' \
    skills/rpd/SKILL.md > "${RPD_ROOT}/${command}-section.txt"
  rg -F 'Report the round-and-reuse disclosure defined in Independent Review Delegation on its own line alongside that phrase' \
    "${RPD_ROOT}/${command}-section.txt"
  rg -F "\`${command} review round: " "${RPD_ROOT}/${command}-section.txt"
done

# The terminal phrases are unchanged and still the sole verdict.
rg -F 'Report exactly one of `AR passed: no blocking architecture flaws`, `AR fixed: <summary>; rerun result passed`, or `AR blocked: <flaw and why it cannot be resolved in place>`.' "${RPD_ROOT}/AR-section.txt"
rg -F 'Report exactly one of `CR passed: no major findings` or `CR fixed: <summary>; rerun result passed`.' "${RPD_ROOT}/CR-section.txt"
rg -F 'Report exactly one of `VR passed: all acceptance criteria complete` or `VR incomplete: <summary of missing work>`.' "${RPD_ROOT}/VR-section.txt"

# Preserved guarantees the disclosure must not weaken.
for guarantee in \
  'Reuse the same independent subagent for every rerun within one AR, CR, or VR stage while it remains available and independent.' \
  'On every rerun, give that reviewer the new stable snapshot and raw artifacts and require the stage'"'"'s full checklist; do not limit the review to prior findings.' \
  'return every material finding in priority order without a findings cap' \
  'Start it with no inherited authoring conversation when the runtime supports that option' \
  'Do not use full-history inheritance.' \
  'Keep AR, CR, and VR as serial gates.' \
  'work read-only' \
  'The primary agent owns edits, fixes, tests, documentation updates, completion loops, and the final pass decision.' \
  'If a blocking finding cannot be resolved, stop and report the blocker instead of reviewing the unchanged snapshot again.'
do
  rg -F "${guarantee}" skills/rpd/SKILL.md
done

# README states the same disclosure behavior as the skill.
rg -F '`<STAGE> review round: <n>; reviewer: <reused|new|not applicable>`' README.md
rg -F 'reviewer: not applicable (primary-agent review)' README.md
rg -Fi 'still carries the verdict by itself' README.md
rg -F 'on its own line beginning with the stage token' README.md
rg -F 'A stage'"'"'s round 1 is always `reviewer: new`' README.md
rg -F 'Reuse the same independent subagent for every rerun within one AR, CR, or VR stage while it remains available and independent.' README.md
```
