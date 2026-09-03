import { COMPANY, SERVICE_IDS } from "@/content/company";
import { getSiteUrl } from "@/infrastructure/env";
import type { AppLocale } from "@/i18n/routing";

const SERVICE_NAMES: Record<
  AppLocale,
  Record<(typeof SERVICE_IDS)[number], string>
> = {
  es: {
    dj: "DJ y sonido para bodas",
    lighting: "Iluminación y efectos",
    "food-trucks": "Food trucks",
    crepes: "Creperie",
    "ice-cream": "Carrito de helados",
    photobooth: "Fotomatón",
    neons: "Neones y letras LOVE",
    furniture: "Mobiliario y chill-out",
    popcorn: "Palomitas y algodón de azúcar",
    "beer-tricycle": "Triciclo de cerveza",
  },
  en: {
    dj: "Wedding DJ and sound",
    lighting: "Lighting and effects",
    "food-trucks": "Food trucks",
    crepes: "Crepe station",
    "ice-cream": "Ice cream trolley",
    photobooth: "Photobooth",
    neons: "Neon signs and LOVE letters",
    furniture: "Lounge furniture hire",
    popcorn: "Popcorn and candy floss",
    "beer-tricycle": "Beer tricycle",
  },
};

export function buildJsonLd(locale: AppLocale) {
  const site = getSiteUrl();
  const url = `${site}/${locale}`;
  const names = SERVICE_NAMES[locale];
  const inLanguage = locale === "es" ? "es-ES" : "en-GB";

  const business = {
    "@type": ["LocalBusiness", "EntertainmentBusiness"],
    "@id": `${site}/#business`,
    name: COMPANY.name,
    image: [`${site}/logo.jpg`, `${site}/media/og.jpg`],
    logo: `${site}/logo.jpg`,
    url,
    telephone: COMPANY.phoneDisplay,
    email: COMPANY.email,
    priceRange: COMPANY.priceRange,
    currenciesAccepted: "EUR",
    knowsLanguage: ["es", "en"],
    category: [
      "DJ",
      "Wedding service",
      "Party equipment rental",
      "Photo booth rental",
      "Food truck",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.locality,
      addressRegion: COMPANY.address.region,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: COMPANY.geo.latitude,
      longitude: COMPANY.geo.longitude,
    },
    areaServed: COMPANY.areaServed.map((name) => ({
      "@type": "Place",
      name,
    })),
    sameAs: [COMPANY.social.facebook, COMPANY.social.instagram],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: COMPANY.phoneDisplay,
      email: COMPANY.email,
      contactType: "customer service",
      availableLanguage: ["Spanish", "English"],
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "es" ? "Servicios para bodas y eventos" : "Wedding and event services",
      itemListElement: SERVICE_IDS.map((id) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: names[id],
          provider: { "@id": `${site}/#business` },
          areaServed: COMPANY.areaServed.map((place) => ({
            "@type": "Place",
            name: place,
          })),
        },
      })),
    },
  };

  const webSite = {
    "@type": "WebSite",
    "@id": `${site}/#website`,
    url: site,
    name: COMPANY.name,
    inLanguage: ["es-ES", "en-GB"],
    publisher: { "@id": `${site}/#business` },
  };

  const webPage = {
    "@type": "WebPage",
    "@id": `${url}/#webpage`,
    url,
    name:
      locale === "es"
        ? "DJ y animación para bodas en Málaga | Oliver Party Expert"
        : "Wedding DJ in Malaga | Oliver Party Expert",
    inLanguage,
    isPartOf: { "@id": `${site}/#website` },
    about: { "@id": `${site}/#business` },
  };

  const breadcrumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: COMPANY.name,
        item: url,
      },
    ],
  };

  const faq = {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name:
          locale === "es"
            ? "¿Con cuánta antelación hay que reservar?"
            : "How far in advance should we book?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "es"
              ? "Recomendamos contactar con al menos tres meses de antelación para DJ y sonido, y de 6 a 8 meses para packs de decoración y food trucks en temporada alta."
              : "We recommend getting in touch at least three months ahead for DJ and sound, and 6–8 months for décor and food-truck packages in peak season.",
        },
      },
      {
        "@type": "Question",
        name:
          locale === "es"
            ? "¿Os desplazáis fuera de Vélez-Málaga?"
            : "Do you travel outside Vélez-Málaga?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "es"
              ? "Sí. Cubrimos Málaga, Costa del Sol, Marbella, Granada, Almería, Cádiz y Sevilla. El desplazamiento puede tener un cargo según kilómetros."
              : "Yes. We cover Malaga, the Costa del Sol, Marbella, Granada, Almeria, Cadiz and Seville. Travel may be charged by distance.",
        },
      },
      {
        "@type": "Question",
        name:
          locale === "es"
            ? "¿Atendéis en inglés?"
            : "Do you work in English?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "es"
              ? "Sí. Trabajamos con parejas locales e internacionales en español e inglés."
              : "Yes. We work with local and destination-wedding couples in Spanish and English.",
        },
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [business, webSite, webPage, breadcrumbs, faq],
  };
}
