"use client";

import { GALLERY_ITEMS } from "@/content/catalog";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

function embedSrc(item: (typeof GALLERY_ITEMS)[number]) {
  if (item.kind === "facebook") {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(item.href)}&show_text=false`;
  }
  if (item.kind === "instagram") {
    return `https://www.instagram.com/oliverpartyexpert/embed`;
  }
  return null;
}

export function Gallery() {
  const t = useTranslations("gallery");
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
              const src = embedSrc(item);
              const network =
                item.kind === "instagram" ? t("instagram") : t("facebook");
              return (
                <div
                  key={item.id}
                  className="min-w-0 shrink-0 basis-[85%] md:basis-[45%]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-espresso">
                    {playing === item.id && src ? (
                      <iframe
                        title={item.id}
                        src={src}
                        className="h-full w-full"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.poster}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-espresso/30" />
                        {src ? (
                          <button
                            type="button"
                            className="absolute inset-0 flex items-center justify-center"
                            onClick={() => setPlaying(item.id)}
                          >
                            <span className="rounded-full bg-gold px-5 py-3 text-sm text-espresso">
                              {t("play", { network })}
                            </span>
                          </button>
                        ) : (
                          <a
                            href={item.href}
                            className="absolute inset-0 flex items-center justify-center"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            <span className="rounded-full bg-gold px-5 py-3 text-sm text-espresso">
                              {t("play", { network })}
                            </span>
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
