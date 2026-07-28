/*
 * Feature: Prepare profiles for persistence.
 * Implementation: Forward user-entered display names to storage.
 * Recent changes: Seeded ambiguous-behavior fixture.
 */

export function prepareProfile(input) {
  return { displayName: input.displayName?.trim() ?? "" };
}
