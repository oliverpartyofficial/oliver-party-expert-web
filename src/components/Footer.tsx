import { COMPANY } from "@/content/company";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311C2.499 19.483 2.225 18.216 2.163 16.85 2.105 15.584 2.093 15.204 2.093 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608C4.449 2.499 5.716 2.225 7.082 2.163 8.348 2.105 8.728 2.093 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.085 1.855.601 3.697 1.942 5.038 1.341 1.341 3.183 1.857 5.038 1.942C8.332 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 1.855-.085 3.697-.601 5.038-1.942 1.341-1.341 1.857-3.183 1.942-5.038C23.986 15.668 24 15.259 24 12c0-3.259-.014-3.668-.072-4.948-.085-1.855-.601-3.697-1.942-5.038C20.645.673 18.803.157 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--line)] bg-espresso text-ivory">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
            <p className="font-serif text-2xl">{COMPANY.name}</p>
          </div>
          <p className="mt-2 text-sm text-cream">
            {COMPANY.address.street}, {COMPANY.address.postalCode}{" "}
            {COMPANY.address.locality}
          </p>
          <a href={`tel:${COMPANY.phone}`} className="mt-1 flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-dark">
            📞 {COMPANY.phoneDisplay}
          </a>
          <p className="mt-1 text-sm text-cream">{COMPANY.email}</p>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cream/60">{t("followUs")}</p>
          <div className="flex flex-col gap-3">
            <a
              href={COMPANY.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <InstagramIcon />
              Instagram {COMPANY.social.instagramHandle}
            </a>
            <a
              href={COMPANY.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <FacebookIcon />
              Facebook · olivergarciadjevents
            </a>
            <a
              href={COMPANY.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          </div>
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
