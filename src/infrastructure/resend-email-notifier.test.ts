import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createResendEmailNotifier } from "./resend-email-notifier";
import type { InquiryRecord } from "@/domain/inquiry";

const record: InquiryRecord = {
  id: "inq_1",
  createdAt: "2026-09-04T00:00:00.000Z",
  name: "Ana López",
  email: "ana@example.com",
  phone: "+34600111222",
  eventType: "wedding",
  eventDate: "2027-06-12",
  location: "Málaga",
  services: ["dj"],
  message: "Queremos DJ para nuestra boda.",
  locale: "es",
  consent: true,
  website: "",
};

describe("resend notifier without an API key", () => {
  let saved: string | undefined;

  beforeEach(() => {
    saved = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    if (saved === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = saved;
  });

  it("no-ops instead of throwing so the inquiry can still be persisted", async () => {
    const notifier = createResendEmailNotifier();
    await expect(notifier.notifyBusiness(record)).resolves.toBeUndefined();
    await expect(notifier.notifyVisitor(record)).resolves.toBeUndefined();
  });
});
