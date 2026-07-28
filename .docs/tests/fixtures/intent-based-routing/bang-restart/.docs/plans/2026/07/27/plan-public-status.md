# Plan: Public Status Response

## Goal

Return the documented public status response without changing its readiness value.

## Current Context

- `src/status-api.js` returns the public response.
- `test/status-api.test.js` records the required contract.

## Decisions

- Use only the public `state` field.
- Do not add a compatibility field or fallback response.

## Phased Tasks

### Phase 1 - Implement

- [x] Update `src/status-api.js` to return the readiness value in `state`.

### Phase 2 - Verify

- [x] Update `test/status-api.test.js` to cover the `state` response.
- [x] Run `npm test` and record the result.
- [x] Run CR and resolve major findings.

## Validation

- `npm test` exits 0.
- `.docs/tests/test-public-status.md` passes.

## Rollback / Risk

- Revert the response-field change if consumers reject the documented contract.
