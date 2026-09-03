import { About } from "@/components/About";
import { ContactForm } from "@/components/ContactForm";
import { Faq } from "@/components/Faq";
import { Gallery } from "@/components/Gallery";
import { Hero } from "@/components/Hero";
import { Location } from "@/components/Location";
import { Services } from "@/components/Services";
import { Testimonials } from "@/components/Testimonials";
import { routing } from "@/i18n/routing";
import { buildJsonLd } from "@/seo/jsonld";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { AppLocale } from "@/i18n/routing";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const jsonLd = buildJsonLd(locale as AppLocale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Services />
      <Gallery />
      <Testimonials />
      <About />
      <Location />
      <Faq />
      <ContactForm />
    </>
  );
}
