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
            className="hidden rounded-full bg-gold px-4 py-2 text-sm text-espresso md:inline-block"
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
