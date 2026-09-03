import { COMPANY } from "@/content/company";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--line)] bg-espresso text-ivory">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-serif text-2xl">{COMPANY.name}</p>
          <p className="mt-2 text-sm text-cream">
            {COMPANY.address.street}, {COMPANY.address.postalCode}{" "}
            {COMPANY.address.locality}
          </p>
          <p className="text-sm text-cream">{COMPANY.phoneDisplay}</p>
          <p className="text-sm text-cream">{COMPANY.email}</p>
        </div>
        <div className="text-sm">
          <a className="block hover:text-gold" href={COMPANY.whatsapp}>
            WhatsApp
          </a>
          <a className="mt-2 block hover:text-gold" href={COMPANY.social.instagram}>
            Instagram {COMPANY.social.instagramHandle}
          </a>
          <a className="mt-2 block hover:text-gold" href={COMPANY.social.facebook}>
            Facebook
          </a>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/privacy" className="hover:text-gold">
            {t("privacy")}
          </Link>
          <Link href="/legal" className="hover:text-gold">
            {t("legal")}
          </Link>
          <Link href="/cookies" className="hover:text-gold">
            {t("cookies")}
          </Link>
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-cream">
        © {year} {COMPANY.name}. {t("rights")}
      </p>
    </footer>
  );
}
