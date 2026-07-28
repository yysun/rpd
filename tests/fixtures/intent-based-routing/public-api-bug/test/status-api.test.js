import assert from "node:assert/strict";
import test from "node:test";

import { getStatusResponse } from "../src/status-api.js";

test("uses the documented public state field", () => {
  assert.deepEqual(getStatusResponse(), { state: "ready" });
});
