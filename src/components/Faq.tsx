import { FAQ } from "@/content/catalog";
import { getTranslations } from "next-intl/server";

export async function Faq() {
  const t = await getTranslations("faq");

  return (
    <section id="faq" className="bg-cream py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <p className="text-xs uppercase tracking-[0.35em] text-gold-dark">{t("kicker")}</p>
        <h2 className="mt-3 font-serif text-4xl text-espresso">{t("title")}</h2>
        <dl className="mt-10 space-y-6">
          {FAQ.map((item) => (
            <div key={item.id} className="border-b border-[var(--line)] pb-6">
              <dt className="font-serif text-2xl text-espresso">
                {t(`items.${item.id}.q`)}
              </dt>
              <dd className="mt-2 text-sm text-muted">{t(`items.${item.id}.a`)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
