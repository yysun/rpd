# Tier 2 - Review Dogfood

**Cost:** two isolated fixture runs plus the current story's protected CR. Run only when an approved
maintainer change affects routing or review behavior. These are not ordinary TT or ET scenarios.

No scenario uses a hash, digest, retained bundle, path manifest, mandatory evidence matrix, stable
finding ID, or checklist ID. Record the actual risk line, reviewer/round line, findings, verdict, and
whether the review stayed read-only.

## Scenario 2.1 - Low-risk direct change stays primary

1. Copy `fixtures/intent-based-routing/internal-bug` and the current `skills/rpd/SKILL.md` into an
   isolated temporary Git repository.
2. Give a fresh execution agent only that repository and this request:

   `Fix formatValue so empty input returns an empty string. Follow the copied RPD skill. Do not commit.`

3. Expect the source regression fix and focused test to pass, no `.docs` story artifacts, and CR to
   report `CR risk: low` with `reviewer: not applicable`.
4. Fail if the agent spawns a CR reviewer, runs an E2E scenario, or emits removed evidence machinery.

## Scenario 2.2 - Protected workflow contract uses independent review

Use the current RPD maintainer story after implementation. Its installable workflow contract is a
protected consumer boundary, so CR must report `CR risk: non-low` and use a clean-context independent
reviewer when available. The reviewer reads the stable diff and verification evidence, works read-only,
and returns every material finding plus the verdict. CR does not run Tier 0, full suites, or E2E.

## Scenario 2.3 - Same-reviewer rerun stays focused

1. Copy `fixtures/intent-based-routing/internal-change` and the current skill into an isolated Git
   repository. Seed an uncommitted whitespace-trimming implementation whose focused test misses the
   all-whitespace case.
2. Have one reviewer perform full CR and identify the missing edge-case coverage.
3. Add only that focused regression case, run only the affected test file, and ask the same reviewer
   to rerun CR.
4. Expect the rerun to inspect the unresolved finding, changed test, implementation interaction, and
   plausible test-coverage cross-cutting area. It must not repeat unrelated security, migration, or
   infrastructure analysis unless the fix creates such reach.
5. Expect `reviewer: reused` and a passing terminal verdict. Any changed reviewer, expanded scope,
   protected-boundary change, or uncertain reach requires a full rerun instead.
