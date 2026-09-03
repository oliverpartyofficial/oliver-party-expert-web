import { SERVICES } from "@/content/catalog";
import { getTranslations } from "next-intl/server";

export async function Services() {
  const t = await getTranslations("services");

  return (
    <section id="servicios" className="mx-auto max-w-6xl px-4 py-24 md:px-6">
      <p className="text-xs uppercase tracking-[0.35em] text-gold-dark">{t("kicker")}</p>
      <h2 className="mt-3 font-serif text-4xl text-espresso md:text-5xl">{t("title")}</h2>
      <p className="mt-4 max-w-2xl text-muted">{t("lead")}</p>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {SERVICES.map((service) => (
          <article
            key={service.id}
            id={service.id}
            className="overflow-hidden rounded-sm border border-[var(--line)] bg-paper"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={service.image}
              alt=""
              className="h-56 w-full object-cover"
            />
            <div className="p-6">
              <h3 className="font-serif text-2xl text-espresso">
                {t(`items.${service.id}.title`)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t(`items.${service.id}.text`)}
              </p>
              <a
                href={service.dossier}
                download
                className="mt-6 inline-flex rounded-full border border-gold px-4 py-2 text-sm text-gold-dark"
              >
                {t("download")}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
