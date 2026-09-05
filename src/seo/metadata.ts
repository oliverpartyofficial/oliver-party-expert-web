import type { Metadata } from "next";
import { COMPANY } from "@/content/company";
import { getSiteUrl } from "@/infrastructure/env";
import type { AppLocale } from "@/i18n/routing";

export function buildPageMetadata(locale: AppLocale): Metadata {
  const site = getSiteUrl();
  const isEs = locale === "es";
  const title = isEs
    ? "DJ, bodas y eventos en Vélez-Málaga | Oliver Party Expert"
    : "Wedding & event DJ in Vélez-Málaga | Oliver Party Expert";
  const description = isEs
    ? "Organización de bodas y eventos en Vélez-Málaga: DJ, iluminación, food trucks, crepes, carrito de helados, fotomatón y neones en Málaga y la Costa del Sol."
    : "Wedding and event services in Vélez-Málaga: DJ, lighting, food trucks, crepes, ice cream trolley, photobooth and neon décor in Malaga and the Costa del Sol.";

  return {
    metadataBase: new URL(site),
    title,
    description,
    applicationName: COMPANY.name,
    authors: [{ name: COMPANY.name }],
    creator: COMPANY.name,
    publisher: COMPANY.name,
    category: "entertainment",
    keywords: isEs
      ? [
          "organización de eventos Vélez-Málaga",
          "organizador de eventos Málaga",
          "eventos Costa del Sol",
          "DJ bodas Málaga",
          "DJ Vélez-Málaga",
          "food truck boda Costa del Sol",
          "fotomatón boda Málaga",
          "carrito de helados boda",
          "crepes boda",
          "neones boda Málaga",
        ]
      : [
          "event planner Malaga",
          "event services Vélez-Málaga",
          "party organiser Costa del Sol",
          "wedding DJ Malaga",
          "wedding DJ Costa del Sol",
          "food truck wedding Malaga",
          "photobooth hire Malaga",
          "ice cream trolley wedding Spain",
          "crepe station wedding",
        ],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "es-ES": "/es",
        en: "/en",
        "x-default": "/es",
      },
    },
    openGraph: {
      type: "website",
      locale: isEs ? "es_ES" : "en_GB",
      alternateLocale: isEs ? ["en_GB"] : ["es_ES"],
      url: `/${locale}`,
      siteName: COMPANY.name,
      title,
      description,
      images: [{ url: "/media/og.jpg", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/media/og.jpg"],
    },
    robots: { index: true, follow: true },
    icons: {
      icon: [{ url: "/logo.jpg", type: "image/jpeg" }],
      apple: [{ url: "/apple-touch-icon.png", type: "image/png" }],
    },
  };
}
