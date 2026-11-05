import type { Metadata } from "next";
import { COMPANY } from "@/content/company";
import { getSiteUrl } from "@/infrastructure/env";
import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

/** A non-homepage route's own title/description, keyed by its untranslated pathname. */
export type PageMetadataOverride = {
  path: "/privacy" | "/legal" | "/cookies";
  title: string;
  description: string;
};

export function buildPageMetadata(
  locale: AppLocale,
  page?: PageMetadataOverride,
): Metadata {
  const site = getSiteUrl();
  const isEs = locale === "es";
  const href = page?.path ?? "/";
  const pathname = getPathname({ locale, href });
  const esPathname = getPathname({ locale: "es", href });
  const enPathname = getPathname({ locale: "en", href });

  const title = page
    ? `${page.title} | ${COMPANY.name}`
    : isEs
      ? "Organización de eventos en Vélez-Málaga | Oliver Party Expert"
      : "Event planning in Vélez-Málaga | Oliver Party Expert";
  const description = page
    ? page.description
    : isEs
      ? "Creamos eventos que dejan huella en Vélez-Málaga y la Costa del Sol: música, iluminación, tecnología, gastronomía y entretenimiento para bodas y celebraciones."
      : "We create events that leave a mark in Vélez-Málaga and the Costa del Sol: music, lighting, technology, catering and entertainment for any celebration.";

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
          "DJ y sonido para bodas",
          "comuniones y cumpleaños Málaga",
          "eventos corporativos Málaga",
          "food truck para eventos",
          "fotomatón para bodas y eventos",
          "decoración de bodas y eventos",
          "carrito de helados para eventos",
        ]
      : [
          "event planning Vélez-Málaga",
          "event organiser Malaga",
          "events Costa del Sol",
          "wedding DJ and sound",
          "communions and birthdays Malaga",
          "corporate events Malaga",
          "food truck for events",
          "photobooth for weddings and events",
          "wedding and event decor",
          "ice cream trolley for events",
        ],
    alternates: {
      canonical: pathname,
      languages: {
        "es-ES": esPathname,
        en: enPathname,
        "x-default": esPathname,
      },
    },
    openGraph: {
      type: "website",
      locale: isEs ? "es_ES" : "en_GB",
      alternateLocale: isEs ? ["en_GB"] : ["es_ES"],
      url: pathname,
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
