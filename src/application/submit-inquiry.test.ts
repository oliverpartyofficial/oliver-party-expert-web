import { describe, expect, it, vi } from "vitest";
import {
  CaptchaError,
  RateLimitError,
  ValidationError,
  createSubmitInquiry,
} from "./submit-inquiry";
import type { InquiryRecord } from "@/domain/inquiry";

const valid = {
  name: "Ana López",
  email: "ana@example.com",
  phone: "+34600111222",
  eventType: "wedding",
  eventDate: "2027-06-12",
  location: "Málaga",
  services: ["dj", "photobooth"],
  message: "Queremos DJ y fotomatón para nuestra boda.",
  locale: "es",
  consent: true,
  website: "",
};

function record(overrides: Partial<InquiryRecord> = {}): InquiryRecord {
  return {
    ...valid,
    id: "inq_1",
    createdAt: "2026-09-03T00:00:00.000Z",
    ...overrides,
  } as InquiryRecord;
}

describe("submitInquiry", () => {
  it("persists then emails on success", async () => {
    const saved = record();
    const repository = {
      save: vi.fn().mockResolvedValue(saved),
      markEmailFailed: vi.fn(),
    };
    const email = {
      notifyBusiness: vi.fn().mockResolvedValue(undefined),
      notifyVisitor: vi.fn().mockResolvedValue(undefined),
    };
    const submit = createSubmitInquiry({
      repository,
      email,
      rateLimiter: { consume: async () => ({ ok: true }) },
      captcha: { verify: async () => true },
    });

    const result = await submit(valid, { ip: "1.1.1.1" });
    expect(result).toEqual({ ok: true, ignored: false, id: "inq_1" });
    expect(repository.save).toHaveBeenCalledOnce();
    expect(email.notifyBusiness).toHaveBeenCalledOnce();
    expect(email.notifyVisitor).toHaveBeenCalledOnce();
  });

  it("throws ValidationError for bad payload", async () => {
    const submit = createSubmitInquiry({
      repository: { save: vi.fn(), markEmailFailed: vi.fn() },
      email: { notifyBusiness: vi.fn(), notifyVisitor: vi.fn() },
      rateLimiter: { consume: async () => ({ ok: true }) },
      captcha: { verify: async () => true },
    });
    await expect(submit({ ...valid, email: "bad" }, { ip: "1.1.1.1" })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("ignores honeypot without writing", async () => {
    const repository = { save: vi.fn(), markEmailFailed: vi.fn() };
    const submit = createSubmitInquiry({
      repository,
      email: { notifyBusiness: vi.fn(), notifyVisitor: vi.fn() },
      rateLimiter: { consume: async () => ({ ok: true }) },
      captcha: { verify: async () => true },
    });
    const result = await submit({ ...valid, website: "http://spam" }, { ip: "1.1.1.1" });
    expect(result).toEqual({ ok: true, ignored: true });
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("throws RateLimitError", async () => {
    const submit = createSubmitInquiry({
      repository: { save: vi.fn(), markEmailFailed: vi.fn() },
      email: { notifyBusiness: vi.fn(), notifyVisitor: vi.fn() },
      rateLimiter: { consume: async () => ({ ok: false, retryAfterSeconds: 30 }) },
      captcha: { verify: async () => true },
    });
    await expect(submit(valid, { ip: "1.1.1.1" })).rejects.toBeInstanceOf(RateLimitError);
  });

  it("throws CaptchaError before rate limiting or persistence", async () => {
    const repository = { save: vi.fn(), markEmailFailed: vi.fn() };
    const rateLimiter = { consume: vi.fn().mockResolvedValue({ ok: true }) };
    const submit = createSubmitInquiry({
      repository,
      email: { notifyBusiness: vi.fn(), notifyVisitor: vi.fn() },
      rateLimiter,
      captcha: { verify: async () => false },
    });
    await expect(submit(valid, { ip: "1.1.1.1" })).rejects.toBeInstanceOf(CaptchaError);
    expect(rateLimiter.consume).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("verifies captcha before rate limit and Supabase write", async () => {
    const order: string[] = [];
    const saved = record();
    const submit = createSubmitInquiry({
      repository: {
        save: vi.fn().mockImplementation(async () => {
          order.push("save");
          return saved;
        }),
        markEmailFailed: vi.fn(),
      },
      email: {
        notifyBusiness: vi.fn().mockResolvedValue(undefined),
        notifyVisitor: vi.fn().mockResolvedValue(undefined),
      },
      rateLimiter: {
        consume: vi.fn().mockImplementation(async () => {
          order.push("rate");
          return { ok: true };
        }),
      },
      captcha: {
        verify: vi.fn().mockImplementation(async () => {
          order.push("captcha");
          return true;
        }),
      },
    });
    await submit({ ...valid, turnstileToken: "token" }, { ip: "1.1.1.1" });
    expect(order[0]).toBe("captcha");
    expect(order.slice(1, 3)).toEqual(["rate", "rate"]);
    expect(order[3]).toBe("save");
  });

  it("marks email_failed if mail throws after persist", async () => {
    const saved = record();
    const repository = {
      save: vi.fn().mockResolvedValue(saved),
      markEmailFailed: vi.fn().mockResolvedValue(undefined),
    };
    const submit = createSubmitInquiry({
      repository,
      email: {
        notifyBusiness: vi.fn().mockRejectedValue(new Error("smtp")),
        notifyVisitor: vi.fn(),
      },
      rateLimiter: { consume: async () => ({ ok: true }) },
      captcha: { verify: async () => true },
    });
    await expect(submit(valid, { ip: "1.1.1.1" })).rejects.toThrow("smtp");
    expect(repository.markEmailFailed).toHaveBeenCalledWith("inq_1");
  });
});
