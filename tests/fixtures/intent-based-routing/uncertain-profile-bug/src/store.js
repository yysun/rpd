/*
 * Feature: Store prepared profiles.
 * Implementation: Persist profile fields in the in-memory fixture.
 * Recent changes: Seeded ambiguous-behavior fixture.
 */

export function storeProfile(profile) {
  return { ...profile, displayName: profile.displayName || null };
}
