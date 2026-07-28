# E2E Scenarios: Public Status Response

## Scenario 1 - Ready response uses the state field

**Given** the service is ready

**When** a consumer requests public status

**Then** the response is `{ "state": "ready" }`

**And** no compatibility field is returned
