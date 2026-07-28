# Public Status Response

## Problem

The public status response must expose a stable readiness contract to consumers.

## Requirement

Return the readiness value in the public `state` field.

## Acceptance Criteria

- [x] The public response is `{ "state": "ready" }`.
- [x] Focused tests cover the documented `state` field.

## Constraints

- Preserve the readiness value.

## Non-Goals

- Add another response field or compatibility alias.
