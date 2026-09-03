import { routing } from "@/i18n/routing";
import es from "../messages/es.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof es;
    Pathnames: typeof routing.pathnames;
  }
}
