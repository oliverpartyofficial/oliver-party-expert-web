"use client";

import { GALLERY_ITEMS } from "@/content/catalog";
import { COMPANY } from "@/content/company";
import useEmblaCarousel from "embla-carousel-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export function Gallery() {
  const t = useTranslations("gallery");
  const locale = useLocale();
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: true });
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <section id="galeria" className="bg-cream py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="text-xs uppercase tracking-[0.35em] text-gold-dark">{t("kicker")}</p>
        <h2 className="mt-3 font-serif text-4xl text-espresso md:text-5xl">{t("title")}</h2>
        <p className="mt-4 max-w-2xl text-muted">{t("lead")}</p>
        <div className="mt-10 overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {GALLERY_ITEMS.map((item) => {
              const alt = locale === "en" ? item.altEn : item.altEs;

              if (item.kind === "youtube") {
                return (
                  <div
                    key={item.id}
                    className="min-w-0 shrink-0 basis-[85%] md:basis-[45%]"
                  >
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
                <div
                  key={item.id}
                  className="min-w-0 shrink-0 basis-[85%] md:basis-[45%]"
                >
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
