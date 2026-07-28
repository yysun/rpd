import assert from "node:assert/strict";
import test from "node:test";

import { authenticate } from "../src/authenticate.js";

test("disabled users cannot authenticate", () => {
  assert.equal(
    authenticate({ disabled: true, credential: "fixture-value" }, "fixture-value"),
    false,
  );
});

test("enabled users retain credential verification", () => {
  assert.equal(
    authenticate({ disabled: false, credential: "fixture-value" }, "fixture-value"),
    true,
  );
});
