"use client";

import { useState } from "react";
import { COMPANY } from "@/content/company";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const LINKS = [
  { href: "/#servicios", key: "services" },
  { href: "/#galeria", key: "gallery" },
  { href: "/#opiniones", key: "reviews" },
  { href: "/#oliver", key: "about" },
  { href: "/#ubicacion", key: "location" },
  { href: "/#contacto", key: "contact" },
] as const;

export function Header({ locale }: { locale: AppLocale }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const other = locale === "es" ? "en" : "es";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--paper)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt={COMPANY.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="font-serif text-lg tracking-wide text-espresso md:text-xl">
            {COMPANY.name}
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink lg:flex">
          {LINKS.map((link) => (
            <a key={link.key} href={link.href} className="hover:text-gold-dark">
              {t(link.key)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={`tel:${COMPANY.phone}`}
            aria-label={COMPANY.phoneDisplay}
            className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-2 text-xs font-semibold text-espresso transition hover:bg-gold-dark md:px-4 md:text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4 shrink-0">
              <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">{COMPANY.phoneDisplay}</span>
          </a>
          <Link
            href={pathname}
            locale={other}
            className="rounded-full border border-[var(--line)] px-3 py-1 text-xs tracking-[0.2em]"
            aria-label={t("language")}
          >
            {t("language")}
          </Link>
          <a
            href="#contacto"
            className="hidden rounded-full bg-espresso px-4 py-2 text-sm text-ivory md:inline-block"
          >
            {t("quote")}
          </a>
          <button
            type="button"
            className="lg:hidden"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="block h-0.5 w-6 bg-espresso" />
            <span className="mt-1 block h-0.5 w-6 bg-espresso" />
          </button>
        </div>
      </div>
      {open ? (
        <nav className="flex flex-col gap-3 border-t border-[var(--line)] px-4 py-4 lg:hidden">
          {LINKS.map((link) => (
            <a
              key={link.key}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-ink"
            >
              {t(link.key)}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
