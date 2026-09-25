import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/seo/metadata";
import type { AppLocale } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "legal" });
  return buildPageMetadata(locale as AppLocale, {
    path: "/privacy",
    title: t("privacyTitle"),
    description: t("privacyMetaDescription"),
  });
}

async function LegalPage({
  params,
  kind,
}: {
  params: Promise<{ locale: string }>;
  kind: "privacy" | "legal" | "cookies";
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const title =
    kind === "privacy"
      ? t("privacyTitle")
      : kind === "legal"
        ? t("legalTitle")
        : t("cookiesTitle");
  const body =
    kind === "privacy"
      ? t("privacyBody")
      : kind === "legal"
        ? t("legalBody")
        : t("cookiesBody");

  return (
    <article className="mx-auto max-w-3xl px-4 py-20 md:px-6">
      <h1 className="font-serif text-4xl text-espresso">{title}</h1>
      <p className="mt-8 text-sm leading-7 text-muted">{body}</p>
    </article>
  );
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <LegalPage params={params} kind="privacy" />;
}
