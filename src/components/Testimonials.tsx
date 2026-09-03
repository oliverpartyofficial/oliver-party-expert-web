import { TESTIMONIALS } from "@/content/catalog";
import { getLocale, getTranslations } from "next-intl/server";

export async function Testimonials() {
  const t = await getTranslations("reviews");
  const locale = await getLocale();

  return (
    <section id="opiniones" className="mx-auto max-w-6xl px-4 py-24 md:px-6">
      <p className="text-xs uppercase tracking-[0.35em] text-gold-dark">{t("kicker")}</p>
      <h2 className="mt-3 font-serif text-4xl text-espresso md:text-5xl">{t("title")}</h2>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {TESTIMONIALS.map((item) => (
          <blockquote
            key={item.author}
            className="border border-[var(--line)] bg-paper p-6"
          >
            <p className="text-sm leading-relaxed text-ink">
              “{locale === "en" ? item.quoteEn : item.quoteEs}”
            </p>
            <footer className="mt-4 font-serif text-lg text-gold-dark">
              {item.author}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
