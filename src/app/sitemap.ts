import { getPathname } from "@/i18n/navigation";
import { getSiteUrl } from "@/infrastructure/env";
import type { MetadataRoute } from "next";

const PATHS = ["/", "/privacy", "/legal", "/cookies"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  return PATHS.flatMap((href) => {
    const es = getPathname({ locale: "es", href });
    const en = getPathname({ locale: "en", href });
    return [
      {
        url: `${site}${es}`,
        lastModified: new Date(),
        alternates: { languages: { "es-ES": `${site}${es}`, en: `${site}${en}` } },
      },
      {
        url: `${site}${en}`,
        lastModified: new Date(),
        alternates: { languages: { "es-ES": `${site}${es}`, en: `${site}${en}` } },
      },
    ];
  });
}
