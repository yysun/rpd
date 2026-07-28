/*
 * Feature: Format internal display values.
 * Implementation: Preserve text and represent empty input as empty text.
 * Recent changes: Seeded regression fixture.
 */

export function formatValue(value) {
  if (!value) return "(empty)";
  return value.trim();
}
