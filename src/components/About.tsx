import { getTranslations } from "next-intl/server";

export async function About() {
  const t = await getTranslations("about");

  return (
    <section id="oliver" className="bg-espresso text-ivory">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-24 md:grid-cols-2 md:px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/about.jpg"
          alt=""
          className="h-full max-h-[520px] w-full object-cover"
        />
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">{t("kicker")}</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">{t("title")}</h2>
          <p className="mt-6 text-cream">{t("lead")}</p>
          <p className="mt-4 text-cream/90">{t("p1")}</p>
          <p className="mt-4 text-cream/90">{t("p2")}</p>
        </div>
      </div>
    </section>
  );
}
