import { createHmac } from "crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./model", () => ({
  CommissionSheet: {},
  User: {},
}));

import { verify } from "./helpers";

const secret = "webhook-secret";
const body = JSON.stringify({ event: "order.status_changed" });

function signatureHeader(
  webhookSecret: string,
  rawBody: string,
  timestamp: number,
  extraV1?: string,
) {
  const v1 = createHmac("sha256", webhookSecret)
    .update(`${timestamp}.`)
    .update(rawBody)
    .digest("hex");
  const parts = [`t=${timestamp}`, `v1=${v1}`];
  if (extraV1) parts.push(`v1=${extraV1}`);
  return parts.join(",");
}

describe("verify", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts a valid HMAC signature", () => {
    const timestamp = 1_700_000_000;
    vi.useFakeTimers();
    vi.setSystemTime(timestamp * 1000);
    const header = signatureHeader(secret, body, timestamp);
    expect(verify(secret, header, body)).toBe(true);
  });

  it("rejects a signature older than the tolerance window", () => {
    const timestamp = 1_700_000_000;
    vi.useFakeTimers();
    vi.setSystemTime((timestamp + 301) * 1000);
    const header = signatureHeader(secret, body, timestamp);
    expect(verify(secret, header, body)).toBe(false);
  });

  it("rejects a signature from the wrong secret", () => {
    const timestamp = 1_700_000_000;
    vi.useFakeTimers();
    vi.setSystemTime(timestamp * 1000);
    const header = signatureHeader("other-secret", body, timestamp);
    expect(verify(secret, header, body)).toBe(false);
  });

  it("accepts when any rotated v1 signature matches", () => {
    const timestamp = 1_700_000_000;
    vi.useFakeTimers();
    vi.setSystemTime(timestamp * 1000);
    const header = signatureHeader(secret, body, timestamp, "deadbeef");
    expect(verify(secret, header, body)).toBe(true);
  });

  it("rejects a header with no timestamp", () => {
    expect(verify(secret, "v1=abc", body)).toBe(false);
  });
});
