/*
 * Feature: Deliver events to a partner webhook.
 * Implementation: Use the partner endpoint while retaining retry configuration.
 * Recent changes: Seeded external-contract routing fixture.
 */

export function webhookRequest(event) {
  return {
    url: "https://partner.example.invalid/v1/events",
    retries: 3,
    body: event,
  };
}
