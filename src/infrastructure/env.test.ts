import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { missingContactSecrets } from "./env";

const KEYS = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY"] as const;

describe("missingContactSecrets", () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of KEYS) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  it("treats Resend as optional when Supabase is configured", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    // RESEND_API_KEY intentionally unset.
    expect(missingContactSecrets()).toEqual([]);
  });

  it("reports the Supabase secrets when they are missing", () => {
    expect(missingContactSecrets()).toEqual([
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]);
  });
});
