import { describe, expect, it } from "vitest";
import { escapeHtml, parseInquiry } from "./inquiry";

const valid = {
  name: "Ana López",
  email: "ana@example.com",
  phone: "+34600111222",
  eventType: "wedding",
  eventDate: "2027-06-12",
  location: "Málaga",
  services: ["dj"],
  message: "Queremos DJ y fotomatón para nuestra boda.",
  locale: "es",
  consent: true,
  website: "",
};

describe("parseInquiry", () => {
  it("accepts a complete enquiry", () => {
    const result = parseInquiry(valid);
    expect(result.success).toBe(true);
  });

  it("rejects missing consent", () => {
    const result = parseInquiry({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = parseInquiry({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects empty services", () => {
    const result = parseInquiry({ ...valid, services: [] });
    expect(result.success).toBe(false);
  });
});

describe("escapeHtml", () => {
  it("escapes markup", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
  });
});
