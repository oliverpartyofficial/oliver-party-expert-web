import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function LegalNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  return (
    <article className="mx-auto max-w-3xl px-4 py-20 md:px-6">
      <h1 className="font-serif text-4xl text-espresso">{t("legalTitle")}</h1>
      <p className="mt-8 text-sm leading-7 text-muted">{t("legalBody")}</p>
    </article>
  );
}
