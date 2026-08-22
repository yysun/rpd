# Tier 0 - Compact Static Contract

Run the single block from the repository root. It checks durable behavior without duplicating the
entire skill or enforcing incidental prose.

```sh
set -euo pipefail

skill=skills/rpd/SKILL.md

rg -Fxq '**Version:** `3.8.0`' "$skill"
rg -Fxq '**Version:** `3.8.0`' README.md
rg -q '^## \[3\.8\.0\]' CHANGELOG.md
test "$(wc -l < "$skill")" -le 300
test "$(wc -w < "$skill")" -le 3500

rg -q '^\*\*Protected boundaries:\*\*' "$skill"
rg -q 'Uncertain or unsupported classification is non-low-risk' "$skill"
rg -q 'Low-risk implementation uses the direct path' "$skill"
rg -q 'Non-low-risk implementation uses the planned path' "$skill"
rg -q 'File count, diff size, documentation-only' "$skill"
rg -q 'Explanation, diagnosis, review, requirements, and planning requests are read-only' "$skill"
rg -q '`REQ`, `AP`, `AR`, and `DD` do not authorize source' "$skill"
rg -q 'If no current plan has passed AR' "$skill"

rg -q 'Challenge unclear or weak requirements, plans, and proposed solutions' "$skill"
rg -q 'offer a small set of viable options' "$skill"
rg -q 'name the real tradeoffs, and recommend one' "$skill"
rg -q 'Ask only the next necessary question' "$skill"
rg -q 'plan is clear enough to implement' "$skill"

rg -q 'Low-risk review stays with the primary agent' "$skill"
rg -q 'Non-low-risk review uses an independent subagent' "$skill"
rg -q 'The first review in a stage is full' "$skill"
rg -q 'focus on every unresolved finding plus affected' "$skill"
rg -q 'without a findings cap' "$skill"
rg -q 'STAGE risk: low|non-low' "$skill"
rg -q 'STAGE review round: <n>; reviewer:' "$skill"
rg -q 'any observed reviewer or concurrent' "$skill"

test -z "$(rg -l 'snapshot_hash|verification-digest|Verification digest|Snapshot unchanged|Review action:|Review scope:|Carried-forward checklist|stable finding ID|checklist-area universe' skills/rpd README.md .docs/tests/README.md .docs/tests/test-tier2-evidence-integrity.md .docs/tests/fixtures || true)"
test -z "$(find .docs/tests/fixtures -name '.verification-ran' -o -name 'verification-digest.js')"
test -z "$(rg -l '\.verification-ran' .docs/tests/fixtures || true)"

rg -q 'Before editing a source file, add a top comment block when absent' "$skill"
rg -q 'After editing, update the block' "$skill"
rg -q 'Files under `.docs/` are exempt' "$skill"

rg -Fq '`!!` is a current-story correction and restart through verified DD' "$skill"
rg -Fq 'reopen acceptance criteria and tasks whose evidence became stale' "$skill"
rg -Fq 'invalidate the prior AR pass' "$skill"
rg -Fq 'Run `AR* → SS(+CR*) → TT → ET? → VR* → DD`, then stop without GC' "$skill"

rg -q 'no fixed phase count applies' "$skill"
! rg -q 'Phased task template|Classify by the story.s subject matter' "$skill"
rg -q 'observable public or external' "$skill"
rg -q 'boundary, or regression-prone critical path' "$skill"
rg -q 'Skip E2E for pure internals' "$skill"

rg -q 'Do not run full unit/integration suites or E2E scenarios' "$skill"
rg -q 'TT owns full unit/integration execution' "$skill"
rg -q 'ET owns E2E' "$skill"

rg -q 'normative.*skills/rpd/SKILL.md|skills/rpd/SKILL.md.*normative' README.md
rg -q '`AR` challenges weak or unclear requirements and plans' README.md
test -z "$(rg '^## Intent Routing$' README.md || true)"
rg -Fxq '### 1. Recommended: Full RPD workflow' README.md
rg -Fxq '### 2. Targeted command workflow' README.md
rg -Fxq '### 3. Automatic routing for ordinary requests' README.md
rg -Fxq '### 4. Correct and restart the current story: `!!`' README.md
quick_start="$(perl -0777 -ne 'if (/## Quick Start\n(.*?)(?=\n## )/s) { print $1; exit } exit 1' README.md)"
printf '%s\n' "$quick_start" | rg -Fxq 'Install RPD skill from GitHub yysun/rpd'
test -z "$(printf '%s\n' "$quick_start" | rg -i '\bnpx\b' || true)"
workflow_headings="$(perl -0777 -ne 'if (/## Workflow\n(.*?)(?=\n## )/s) { $section=$1; while ($section =~ /^(### .+)$/mg) { print "$1\n" } exit } exit 1' README.md)"
test "$workflow_headings" = "$(printf '%s\n' \
  '### 1. Recommended: Full RPD workflow' \
  '### 2. Targeted command workflow' \
  '### 3. Automatic routing for ordinary requests' \
  '### 4. Correct and restart the current story: `!!`')"
test "$(find skills/rpd -type f | wc -l | tr -d ' ')" = 1

for package in .docs/tests/fixtures/intent-based-routing/*/package.json
do
  if rg -q '"test"' "$package"; then
    rg -q '"test": "node --test"' "$package"
  fi
done

printf '%s\n' 'Tier 0 passed'
```
