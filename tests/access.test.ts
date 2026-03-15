import test from "node:test";
import { strict as assert } from "node:assert";
import { createAccessToken, readAccessToken } from "../lib/access";

test("createAccessToken round-trips a valid team payload", async () => {
  process.env.LMD_ACCESS_SECRET = "test-secret-1234567890";

  const token = await createAccessToken("kia", 5);
  const payload = await readAccessToken(token);

  assert.equal(typeof token, "string");
  assert.equal(payload?.team, "kia");
  assert.ok(payload !== null);
  assert.equal(typeof payload.exp, "number");
  assert.ok((payload.exp ?? 0) > Date.now());
});

test("readAccessToken rejects expired tokens", async () => {
  process.env.LMD_ACCESS_SECRET = "test-secret-1234567890";

  const token = await createAccessToken("lg", -1);
  const payload = await readAccessToken(token);

  assert.equal(payload, null);
});

test("createAccessToken supports non-expiring URL tokens", async () => {
  process.env.LMD_ACCESS_SECRET = "test-secret-1234567890";

  const token = await createAccessToken("doosan", 0);
  const payload = await readAccessToken(token);

  assert.equal(payload?.team, "doosan");
  assert.equal(payload?.exp, null);
});
