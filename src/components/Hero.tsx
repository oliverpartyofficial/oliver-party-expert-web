import { getTranslations } from "next-intl/server";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="relative isolate min-h-[88vh] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/media/hero.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/50 to-espresso/20" />
      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-20 pt-32 md:px-6">
        <p className="text-xs uppercase tracking-[0.35em] text-gold">{t("kicker")}</p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-ivory md:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-xl text-base text-cream md:text-lg">{t("lead")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#contacto"
            className="rounded-full bg-gold px-6 py-3 text-sm text-espresso"
          >
            {t("cta")}
          </a>
          <a
            href="#servicios"
            className="rounded-full border border-ivory/50 px-6 py-3 text-sm text-ivory"
          >
            {t("secondary")}
          </a>
        </div>
      </div>
    </section>
  );
}
