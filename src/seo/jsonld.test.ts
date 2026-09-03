import { describe, expect, it } from "vitest";
import { buildJsonLd } from "./jsonld";

describe("buildJsonLd", () => {
  it("uses LocalBusiness and EntertainmentBusiness", () => {
    const json = buildJsonLd("es");
    const business = json["@graph"][0] as Record<string, unknown>;
    expect(business["@type"]).toEqual(["LocalBusiness", "EntertainmentBusiness"]);
    expect(business).toMatchObject({
      email: "oliverpartyofficial@gmail.com",
      telephone: "+34 620 95 68 68",
    });
    const address = business.address as Record<string, string>;
    expect(address.addressLocality).toBe("Vélez-Málaga");
    expect(business.sameAs).toEqual([
      "https://www.facebook.com/olivergarciadjevents",
      "https://www.instagram.com/oliverpartyexpert/",
    ]);
    expect(business.logo).toMatch(/\/logo\.jpg$/);
    expect(business.image).toEqual(
      expect.arrayContaining([expect.stringMatching(/\/logo\.jpg$/)]),
    );
    expect(JSON.stringify(json)).not.toContain("AggregateRating");
    expect(JSON.stringify(business.areaServed)).toContain("Málaga");
  });

  it("lists services in English too", () => {
    const json = buildJsonLd("en");
    expect(JSON.stringify(json)).toContain("Wedding DJ and sound");
    expect(JSON.stringify(json)).toContain("Ice cream trolley");
  });
});
