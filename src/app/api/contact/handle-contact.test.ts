import { describe, expect, it, vi } from "vitest";
import { RateLimitError, ValidationError } from "@/application/submit-inquiry";
import { createContactHandler } from "./handle-contact";

const site = "https://oliverpartyexpert.com";

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://oliverpartyexpert.com/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: site,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("contact handler", () => {
  it("returns 200 on success", async () => {
    const POST = createContactHandler({
      submit: vi.fn().mockResolvedValue({ ok: true, ignored: false, id: "1" }),
      getSiteUrl: () => site,
      missingSecrets: () => [],
    });
    const res = await POST(request({ name: "Ana" }));
    expect(res.status).toBe(200);
  });

  it("returns 400 on validation error", async () => {
    const POST = createContactHandler({
      submit: vi.fn().mockRejectedValue(new ValidationError({})),
      getSiteUrl: () => site,
      missingSecrets: () => [],
    });
    const res = await POST(request({}));
    expect(res.status).toBe(400);
  });

  it("returns 429 on rate limit", async () => {
    const POST = createContactHandler({
      submit: vi.fn().mockRejectedValue(new RateLimitError(12)),
      getSiteUrl: () => site,
      missingSecrets: () => [],
    });
    const res = await POST(request({}));
    expect(res.status).toBe(429);
  });

  it("returns 403 on bad origin", async () => {
    const POST = createContactHandler({
      submit: vi.fn(),
      getSiteUrl: () => site,
      missingSecrets: () => [],
    });
    const res = await POST(request({}, { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });

  it("returns 503 when secrets missing", async () => {
    const POST = createContactHandler({
      submit: vi.fn(),
      getSiteUrl: () => site,
      missingSecrets: () => ["SUPABASE_URL"],
    });
    const res = await POST(request({}));
    expect(res.status).toBe(503);
  });
});
