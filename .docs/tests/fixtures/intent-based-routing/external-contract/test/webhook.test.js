import assert from "node:assert/strict";
import test from "node:test";

import { webhookRequest } from "../src/webhook.js";

test("uses the partner v2 contract and preserves retries", () => {
  const request = webhookRequest({ id: "fixture" });
  assert.equal(request.url, "https://partner.example.invalid/v2/events");
  assert.equal(request.retries, 3);
});
