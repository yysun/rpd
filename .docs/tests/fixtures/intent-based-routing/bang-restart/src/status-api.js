/*
 * Feature: Return the public service-status response.
 * Implementation: Expose the current documented state field.
 * Recent changes: Seeded completed-story correction fixture.
 */

export function getStatusResponse() {
  return { state: "ready" };
}
