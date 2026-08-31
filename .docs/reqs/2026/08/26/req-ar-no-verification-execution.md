# AR Without Verification Execution

## Problem

AR sometimes executes tests or other verification commands while reviewing a plan. That duplicates
later stages, adds latency before implementation, and produces evidence about the pre-change state
rather than the planned result.

## Requirement

Keep AR focused on whether the requirement and plan are sound and verifiable. AR may inspect tests,
scripts, configurations, and prior evidence, but it must not execute verification. When runtime
evidence is necessary to establish feasibility, the plan must obtain it through a bounded first SS
task with explicit decision criteria before dependent implementation begins.

## Acceptance Criteria

- [x] AR may inspect existing tests, scripts, configurations, and prior evidence without executing
      tests, builds, typechecks, linters, benchmarks, or E2E scenarios.
- [x] Runtime evidence needed to validate feasibility becomes a bounded first SS task with explicit
      decision criteria instead of work performed during AR; it may run only a focused probe, not full
      unit, integration, or E2E suites owned by TT or ET.
- [x] When the feasibility probe fails or materially changes the architecture, SS stops dependent
      implementation, updates the requirement and plan, and reruns AR before continuing.
- [x] AR still reviews testability, validation coverage, and task executability, and may block a plan
      that cannot establish the required evidence safely.
- [x] SS, TT, and ET retain their existing verification responsibilities.
- [x] The README reflects the stage boundary without duplicating the normative skill contract.
- [x] Focused static contracts, the three existing compact Tier 2 dogfood scenarios, one focused
      AR-to-SS behavioral scenario, skill validation, diff checks, and installed-skill parity pass
      after the contract stabilizes.

## Constraints

- Keep the new rule compact and explicit enough to prevent test execution during AR.
- Preserve AR's documentation-only fix behavior, reviewer selection, result disclosures, and verdicts.

## Non-Goals

- Preventing AR from inspecting repository files or discovering available verification commands.
- Changing ordinary verification ownership outside the bounded AR-to-SS feasibility handoff.
- Allowing AR to run a test suite merely because it is described as a feasibility check.

## Open Questions

None.
