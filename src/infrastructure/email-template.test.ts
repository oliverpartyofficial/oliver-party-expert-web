import { describe, expect, it } from "vitest";
import {
  formatEventType,
  formatServices,
  renderBrandedEmail,
  renderInquiryDetails,
} from "./email-template";
import type { InquiryRecord } from "@/domain/inquiry";

const inquiry: InquiryRecord = {
  id: "inq_1",
  createdAt: "2026-09-04T00:00:00.000Z",
  name: "Ana López",
  email: "ana@example.com",
  phone: "+34 600 111 222",
  eventType: "wedding",
  eventDate: "2027-06-12",
  location: "Málaga",
  services: ["dj", "photobooth"],
  message: "Queremos DJ y fotomatón para nuestra boda.",
  locale: "es",
  consent: true,
  website: "",
};

describe("email label formatting", () => {
  it("translates the event type to Spanish", () => {
    expect(formatEventType("wedding")).toBe("Boda");
    expect(formatEventType("corporate")).toBe("Corporativo");
  });

  it("translates service ids to Spanish labels", () => {
    expect(formatServices(["dj", "photobooth"])).toEqual([
      "DJ y sonido",
      "Fotomatón",
    ]);
  });

  it("falls back to the raw value for unknown ids", () => {
    expect(formatEventType("unknown")).toBe("unknown");
    expect(formatServices(["mystery"])).toEqual(["mystery"]);
  });
});

describe("renderInquiryDetails", () => {
  it("includes the Spanish event type, services and a formatted date", () => {
    const html = renderInquiryDetails(inquiry);
    expect(html).toContain("Boda");
    expect(html).toContain("DJ y sonido");
    expect(html).toContain("Fotomatón");
    expect(html).toContain("12 de junio de 2027");
    expect(html).toContain("mailto:ana@example.com");
  });

  it("escapes user-supplied content", () => {
    const html = renderInquiryDetails({
      ...inquiry,
      name: "<script>alert(1)</script>",
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("renderBrandedEmail", () => {
  it("builds a full document with the logo and social links", () => {
    const html = renderBrandedEmail({
      siteUrl: "https://www.oliverpartyexpert.com",
      preheader: "preview",
      heading: "Nueva consulta",
      contentHtml: "<p>body</p>",
    });
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("https://www.oliverpartyexpert.com/logo.jpg");
    expect(html).toContain("Instagram");
    expect(html).toContain("Facebook");
  });
});
