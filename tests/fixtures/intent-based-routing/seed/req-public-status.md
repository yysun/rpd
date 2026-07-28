# Public Status Response

## Problem

The public status response uses a field that contradicts the documented consumer contract.

## Requirement

Return the readiness value in the public `state` field instead of `status`.

## Acceptance Criteria

- [ ] The public response is `{ "state": "ready" }`.
- [ ] Focused tests cover the documented field.

## Constraints

- Preserve the readiness value.

## Non-Goals

- Change any other public response.
