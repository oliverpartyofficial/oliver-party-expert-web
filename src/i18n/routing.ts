import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "always",
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/privacy": {
      es: "/privacidad",
      en: "/privacy",
    },
    "/legal": {
      es: "/aviso-legal",
      en: "/legal-notice",
    },
    "/cookies": "/cookies",
  },
});

export type AppLocale = (typeof routing.locales)[number];
