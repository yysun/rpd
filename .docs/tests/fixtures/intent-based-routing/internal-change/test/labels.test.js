import assert from "node:assert/strict";
import test from "node:test";

import { renderLabel } from "../src/labels.js";

test("renders an internal label", () => {
  assert.equal(renderLabel("Label"), "Label");
});
