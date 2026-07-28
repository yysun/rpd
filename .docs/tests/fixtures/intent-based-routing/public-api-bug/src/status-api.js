/*
 * Feature: Return the public service-status response.
 * Implementation: Expose the documented state field.
 * Recent changes: Seeded public-contract regression fixture.
 */

export function getStatusResponse() {
  return { status: "ready" };
}
