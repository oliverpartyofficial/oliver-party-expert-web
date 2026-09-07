import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { allowedSiteOrigins, missingContactSecrets } from "./env";

const KEYS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
] as const;

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

  it("treats Resend and Turnstile as optional when Supabase is configured", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    // RESEND_API_KEY and Turnstile intentionally unset.
    expect(missingContactSecrets()).toEqual([]);
  });

  it("reports the Supabase secrets when they are missing", () => {
    expect(missingContactSecrets()).toEqual([
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]);
  });
});

describe("allowedSiteOrigins", () => {
  it("includes www and apex variants", () => {
    expect(allowedSiteOrigins("https://oliverpartyexpert.com")).toEqual([
      "https://oliverpartyexpert.com",
      "https://www.oliverpartyexpert.com",
    ]);
    expect(allowedSiteOrigins("https://www.oliverpartyexpert.com")).toEqual([
      "https://www.oliverpartyexpert.com",
      "https://oliverpartyexpert.com",
    ]);
  });
});
