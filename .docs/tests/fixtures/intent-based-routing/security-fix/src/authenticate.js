/*
 * Feature: Authenticate fixture users.
 * Implementation: Verify supplied credentials against the stored value.
 * Recent changes: Seeded security-routing fixture.
 */

export function authenticate(user, suppliedCredential) {
  return user.credential === suppliedCredential;
}
