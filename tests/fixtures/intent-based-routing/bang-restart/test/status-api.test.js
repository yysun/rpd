/*
 * Feature: Verify the public service-status contract.
 * Implementation: Assert the previously completed story's response field and value.
 * Recent changes: Seeded completed-story correction fixture.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { getStatusResponse } from "../src/status-api.js";

test("uses the documented public state field", () => {
  assert.deepEqual(getStatusResponse(), { state: "ready" });
});
