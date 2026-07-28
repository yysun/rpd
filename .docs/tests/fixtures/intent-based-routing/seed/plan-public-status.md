# Plan: Public Status Response

## Goal

Return the documented public status response without changing its readiness value.

## Current Context

- `src/status-api.js` returns the public response.
- `test/status-api.test.js` records the required contract.

## Decisions

- Rename only the public response field.
- Do not add a compatibility field or fallback response.

## Phased Tasks

### Phase 1 - Implement

- [ ] Update `src/status-api.js` to return the readiness value in `state`.

### Phase 2 - Verify

- [ ] Run `npm test` and record the result.
- [ ] Run CR and resolve major findings.

## Validation

- `npm test` exits 0.

## Rollback / Risk

- Revert the response-field change if consumers reject the documented contract.
