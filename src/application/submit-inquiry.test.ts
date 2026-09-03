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

  it("throws CaptchaError", async () => {
    const submit = createSubmitInquiry({
      repository: { save: vi.fn(), markEmailFailed: vi.fn() },
      email: { notifyBusiness: vi.fn(), notifyVisitor: vi.fn() },
      rateLimiter: { consume: async () => ({ ok: true }) },
      captcha: { verify: async () => false },
    });
    await expect(submit(valid, { ip: "1.1.1.1" })).rejects.toBeInstanceOf(CaptchaError);
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
