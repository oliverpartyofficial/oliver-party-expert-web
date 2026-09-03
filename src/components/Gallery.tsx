"use client";

import { GALLERY_ITEMS } from "@/content/catalog";
import { COMPANY } from "@/content/company";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export function Gallery() {
  const t = useTranslations("gallery");
  const locale = useLocale();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const total = GALLERY_ITEMS.length;

  const visible = useMemo(() => {
    // Show current + next (wrap) so the carousel always looks full-width.
    return [0, 1].map((offset) => GALLERY_ITEMS[(index + offset) % total]);
  }, [index, total]);

  const goPrev = () => setIndex((current) => (current - 1 + total) % total);
  const goNext = () => setIndex((current) => (current + 1) % total);

  return (
    <section id="galeria" className="bg-cream py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-gold-dark">
              {t("kicker")}
            </p>
            <h2 className="mt-3 font-serif text-4xl text-espresso md:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-muted">{t("lead")}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              data-testid="gallery-counter"
              className="text-xs tracking-[0.2em] text-muted"
            >
              {index + 1} / {total}
            </span>
            <button
              type="button"
              aria-label={t("prev")}
              onClick={goPrev}
              className="min-h-11 min-w-11 rounded-full bg-gold px-4 py-2 text-lg text-espresso shadow-sm"
            >
              ←
            </button>
            <button
              type="button"
              aria-label={t("next")}
              onClick={goNext}
              className="min-h-11 min-w-11 rounded-full bg-gold px-4 py-2 text-lg text-espresso shadow-sm"
            >
              →
            </button>
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {visible.map((item) => {
            const alt = locale === "en" ? item.altEn : item.altEs;

            if (item.kind === "youtube") {
              return (
                <div key={`${item.id}-${index}`} className="min-w-0">
                  <div className="relative aspect-[4/5] overflow-hidden bg-espresso">
                    {playing === item.id ? (
                      <iframe
                        title={item.id}
                        src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.poster}
                          alt={alt}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-espresso/25" />
                        <button
                          type="button"
                          className="absolute inset-0 flex items-center justify-center"
                          onClick={() => setPlaying(item.id)}
                        >
                          <span className="rounded-full bg-gold px-5 py-3 text-sm text-espresso">
                            {t("playYoutube")}
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div key={`${item.id}-${index}`} className="min-w-0">
                <figure className="relative aspect-[4/5] overflow-hidden bg-espresso">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={alt}
                    className="h-full w-full object-cover"
                  />
                </figure>
              </div>
            );
          })}
        </div>
        <p className="mt-8 text-sm text-muted">
          {t("morePhotos")}{" "}
          <a
            className="text-gold-dark underline-offset-4 hover:underline"
            href={COMPANY.social.instagram}
            rel="noopener noreferrer"
            target="_blank"
          >
            Instagram
          </a>{" "}
          ·{" "}
          <a
            className="text-gold-dark underline-offset-4 hover:underline"
            href={COMPANY.social.facebook}
            rel="noopener noreferrer"
            target="_blank"
          >
            Facebook
          </a>
        </p>
      </div>
    </section>
  );
}
