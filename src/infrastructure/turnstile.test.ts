import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTurnstileVerifier } from "./turnstile";

const KEYS = ["TURNSTILE_SECRET_KEY", "NEXT_PUBLIC_TURNSTILE_SITE_KEY"] as const;

describe("createTurnstileVerifier", () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of KEYS) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    for (const key of KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
    vi.unstubAllGlobals();
  });

  it("skips captcha when Turnstile keys are unset", async () => {
    const verify = createTurnstileVerifier().verify;
    await expect(verify("", "1.1.1.1")).resolves.toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects partial Turnstile configuration", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    const verify = createTurnstileVerifier().verify;
    await expect(verify("token", "1.1.1.1")).resolves.toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects an empty token when keys are set", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site";
    const verify = createTurnstileVerifier().verify;
    await expect(verify("", "1.1.1.1")).resolves.toBe(false);
    await expect(verify(undefined, "1.1.1.1")).resolves.toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns Cloudflare siteverify success", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site";
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    const verify = createTurnstileVerifier().verify;
    await expect(verify("ok-token", "203.0.113.1")).resolves.toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("rejects failed siteverify responses", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site";
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 200 }),
    );
    const verify = createTurnstileVerifier().verify;
    await expect(verify("bad-token", "1.1.1.1")).resolves.toBe(false);
  });
});
