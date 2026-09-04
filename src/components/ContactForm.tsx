"use client";

import { EVENT_TYPES, SERVICE_IDS } from "@/content/company";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export function ContactForm() {
  const t = useTranslations("contact");
  const ts = useTranslations("services");
  const locale = useLocale();
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error" | "unavailable" | "invalid"
  >("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const KNOWN_FIELDS = [
    "name",
    "email",
    "phone",
    "eventType",
    "services",
    "message",
    "consent",
  ] as const;

  function fieldError(name: (typeof KNOWN_FIELDS)[number]) {
    if (!fieldErrors[name]) return null;
    return (
      <span role="alert" className="text-xs text-red-800">
        {fieldErrors[name]}
      </span>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const services = data.getAll("services").map(String);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      eventType: String(data.get("eventType") ?? "wedding"),
      eventDate: String(data.get("eventDate") ?? ""),
      location: String(data.get("location") ?? ""),
      services,
      message: String(data.get("message") ?? ""),
      locale,
      consent: data.get("consent") === "on",
      website: String(data.get("website") ?? ""),
    };

    setStatus("sending");
    setFieldErrors({});
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.status === 503) {
        setStatus("unavailable");
        return;
      }
      if (response.status === 400) {
        const data = (await response.json().catch(() => null)) as {
          issues?: { fieldErrors?: Record<string, string[]> };
        } | null;
        const rawErrors = data?.issues?.fieldErrors ?? {};
        const mapped: Record<string, string> = {};
        for (const key of KNOWN_FIELDS) {
          if (rawErrors[key]?.length) {
            mapped[key] = t(`fieldErrors.${key}`);
          }
        }
        setFieldErrors(mapped);
        setStatus("invalid");
        return;
      }
      if (!response.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contacto" className="mx-auto max-w-6xl px-4 py-24 md:px-6">
      <p className="text-xs uppercase tracking-[0.35em] text-gold-dark">{t("kicker")}</p>
      <h2 className="mt-3 font-serif text-4xl text-espresso md:text-5xl">{t("title")}</h2>
      <p className="mt-4 max-w-2xl text-muted">{t("lead")}</p>
      <form onSubmit={onSubmit} className="mt-10 grid gap-4 md:grid-cols-2" noValidate>
        <label className="grid gap-1 text-sm">
          {t("name")}
          <input required name="name" className="border border-[var(--line)] bg-paper px-3 py-2" />
          {fieldError("name")}
        </label>
        <label className="grid gap-1 text-sm">
          {t("email")}
          <input
            required
            type="email"
            name="email"
            className="border border-[var(--line)] bg-paper px-3 py-2"
          />
          {fieldError("email")}
        </label>
        <label className="grid gap-1 text-sm">
          {t("phone")}
          <input required name="phone" className="border border-[var(--line)] bg-paper px-3 py-2" />
          {fieldError("phone")}
        </label>
        <label className="grid gap-1 text-sm">
          {t("eventType")}
          <select name="eventType" className="border border-[var(--line)] bg-paper px-3 py-2">
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`types.${type}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          {t("eventDate")}
          <input type="date" name="eventDate" className="border border-[var(--line)] bg-paper px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          {t("eventLocation")}
          <input name="location" className="border border-[var(--line)] bg-paper px-3 py-2" />
        </label>
        <fieldset className="md:col-span-2">
          <legend className="text-sm">{t("services")}</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SERVICE_IDS.map((id) => (
              <label key={id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="services" value={id} />
                {ts(`items.${id}.title`)}
              </label>
            ))}
          </div>
          <div className="mt-2">{fieldError("services")}</div>
        </fieldset>
        <label className="grid gap-1 text-sm md:col-span-2">
          {t("message")}
          <textarea
            required
            name="message"
            rows={5}
            minLength={10}
            className="border border-[var(--line)] bg-paper px-3 py-2"
          />
          <span className="text-xs text-muted">{t("messageHint")}</span>
          {fieldError("message")}
        </label>
        <label className="hidden" aria-hidden="true">
          website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <div className="grid gap-1 md:col-span-2">
          <label className="flex items-start gap-2 text-sm">
            <input required type="checkbox" name="consent" className="mt-1" />
            <span>
              {t("consent")}{" "}
              <Link href="/privacy" className="underline">
                {locale === "es" ? "privacidad" : "privacy"}
              </Link>
            </span>
          </label>
          {fieldError("consent")}
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-gold px-6 py-3 text-sm text-espresso disabled:opacity-60"
        >
          {status === "sending" ? t("sending") : t("submit")}
        </button>
        {status === "success" ? (
          <p className="md:col-span-2 text-sm text-gold-dark">{t("success")}</p>
        ) : null}
        {status === "error" ? (
          <p className="md:col-span-2 text-sm text-red-800">{t("error")}</p>
        ) : null}
        {status === "invalid" ? (
          <p className="md:col-span-2 text-sm text-red-800">{t("fixErrors")}</p>
        ) : null}
        {status === "unavailable" ? (
          <p className="md:col-span-2 text-sm text-muted">{t("unavailable")}</p>
        ) : null}
      </form>
    </section>
  );
}
