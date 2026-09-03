import { COMPANY } from "@/content/company";
import { getTranslations } from "next-intl/server";

const MAPS =
  "https://www.google.com/maps?q=Del+R%C3%ADo+36+B,+29700+V%C3%A9lez-M%C3%A1laga&output=embed";

export async function Location() {
  const t = await getTranslations("location");

  return (
    <section id="ubicacion" className="mx-auto max-w-6xl px-4 py-24 md:px-6">
      <p className="text-xs uppercase tracking-[0.35em] text-gold-dark">{t("kicker")}</p>
      <h2 className="mt-3 font-serif text-4xl text-espresso md:text-5xl">{t("title")}</h2>
      <p className="mt-4 max-w-2xl text-muted">{t("lead")}</p>
      <address className="mt-6 not-italic text-ink">
        {COMPANY.name}
        <br />
        {COMPANY.address.street}
        <br />
        {COMPANY.address.postalCode} {COMPANY.address.locality} (
        {COMPANY.address.region})
        <br />
        <a href={`tel:${COMPANY.phone}`}>{COMPANY.phoneDisplay}</a>
        <br />
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </address>
      <p className="mt-4 text-sm text-muted">
        {t("areas")}: {COMPANY.areaServed.join(" · ")}
      </p>
      <div className="mt-8 overflow-hidden rounded-lg border border-[var(--line)]">
        <iframe
          title="Oliver Party Expert map"
          src={MAPS}
          className="h-80 w-full md:h-96"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a
        href={`https://www.google.com/maps?q=${encodeURIComponent(
          `${COMPANY.address.street}, ${COMPANY.address.postalCode} ${COMPANY.address.locality}`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-sm text-gold-dark underline-offset-2 hover:underline"
      >
        {t("openMap")} ↗
      </a>
    </section>
  );
}
