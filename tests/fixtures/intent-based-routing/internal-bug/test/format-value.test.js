import assert from "node:assert/strict";
import test from "node:test";

import { formatValue } from "../src/format-value.js";

test("empty input remains empty", () => {
  assert.equal(formatValue(""), "");
});

test("text is trimmed", () => {
  assert.equal(formatValue(" value "), "value");
});
