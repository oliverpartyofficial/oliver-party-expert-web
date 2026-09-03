"use client";

import { GALLERY_ITEMS } from "@/content/catalog";
import { COMPANY } from "@/content/company";
import { AnimatePresence, motion, wrap } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.97,
  }),
};

const transition = {
  x: { type: "spring" as const, stiffness: 280, damping: 28 },
  opacity: { duration: 0.28 },
  scale: { duration: 0.28 },
};

export function Gallery() {
  const t = useTranslations("gallery");
  const locale = useLocale();
  const [[page, direction], setPage] = useState([0, 0]);
  const [playing, setPlaying] = useState<string | null>(null);
  const total = GALLERY_ITEMS.length;
  const index = wrap(0, total, page);

  const visible = useMemo(() => {
    return [0, 1].map((offset) => GALLERY_ITEMS[(index + offset) % total]);
  }, [index, total]);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

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
              onClick={() => paginate(-1)}
              className="min-h-11 min-w-11 rounded-full bg-gold px-4 py-2 text-lg text-espresso shadow-sm transition hover:scale-105 active:scale-95"
            >
              ←
            </button>
            <button
              type="button"
              aria-label={t("next")}
              onClick={() => paginate(1)}
              className="min-h-11 min-w-11 rounded-full bg-gold px-4 py-2 text-lg text-espresso shadow-sm transition hover:scale-105 active:scale-95"
            >
              →
            </button>
          </div>
        </div>
        <div className="relative mt-10 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60 || info.velocity.x < -400) {
                  paginate(1);
                } else if (info.offset.x > 60 || info.velocity.x > 400) {
                  paginate(-1);
                }
              }}
              className="grid cursor-grab gap-4 active:cursor-grabbing md:grid-cols-2"
            >
              {visible.map((item) => {
                const alt = locale === "en" ? item.altEn : item.altEs;

                if (item.kind === "youtube") {
                  return (
                    <div key={item.id} className="min-w-0">
                      <div className="relative aspect-[4/5] overflow-hidden bg-espresso shadow-md">
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
                              draggable={false}
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
                  <div key={item.id} className="min-w-0">
                    <figure className="relative aspect-[4/5] overflow-hidden bg-espresso shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.src}
                        alt={alt}
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    </figure>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
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
