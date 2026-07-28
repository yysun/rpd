# Intent-Routing Suite - Partial Run, 2026-07-28

Aborted before completion. The account hit its monthly spend limit and every execution agent
terminated with `You've hit your monthly spend limit`. This is an external constraint, not a
failure of the skill, the fixtures, or the specification. **No scenario failed.**

Harness root (disposable, machine-local): `/var/folders/94/k0wlg43d5zz2mw5yfcp79ws54k83kd/T/rpd-intent-routing-e2e.uLODMD`

## Fully verified - every assertion in the scenario's own block passed

| Scenario | Case | Assertions |
|---|---|---|
| 1 | `internal-bug` | 10/10, including `assert_cr_final` |
| 9 | `explicit-req` | 4/4 |
| 10 | `read-only` | 4/4 |

Scenario 1's `assert_cr_final` is the suite's anti-fabrication check and it held: the CR reviewer's
recorded snapshot equalled the final repository snapshot, and the `.verification-ran` digest equalled
a freshly recomputed digest, proving the passing test run was against the reviewed tree.

## Partial evidence - real but not a scenario pass

- `public-api-bug` (Scenario 3): `assert_ar_before_code` passes. The AR reviewer recorded
  `Decision: PASS`, `Source/test changes: NONE`, `Verification digest: ABSENT`,
  `Snapshot unchanged: YES`, and `src/status-api.js` was modified only afterwards. The
  architecture gate demonstrably held. The case died before CR, TT, and VR.
- `security-fix` (5), `external-contract` (6), `uncertain-profile-bug` (4): each selected planned
  routing and wrote planning artifacts with zero edits under `src/` or `test/`, which is the routing
  behavior those scenarios exist to prove. None reached its reviewer gates.
- `internal-change` (Scenario 2): implemented and verified on the direct path, then died before CR.

## Not started

`explicit-ap` (7), `explicit-ar` (8), `bang-restart` (11), `bang-missing` (12), `bang-ambiguous` (13).

## Status of the blocking task

The `ET` task in `plan-intent-based-routing` stays open, and the routing-scenarios acceptance
criterion stays unchecked. Three of thirteen cases is not the proof that criterion requires.

## To resume

Re-seed with the Common Execution Procedure and dispatch the ten unverified cases. Nested delegation
was confirmed working, so the suite is runnable as specified once budget allows. Note that `Explore`
and `Plan` agent types cannot spawn reviewers; use `general-purpose` or `claude`.
