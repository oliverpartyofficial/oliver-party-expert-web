"use client";

import { galleryItemKey, tiktokVideoId, type GalleryItem } from "@/content/catalog";
import { COMPANY } from "@/content/company";
import { GALLERY_MAX_ITEMS, shuffleGallery } from "@/domain/gallery";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

// Slides are TikTok videos, so give each one time to be watched.
const VIDEO_DWELL_MS = 15000;
const RESUME_DELAY_MS = 1200;
const DRAG_THRESHOLD = 70;

const arrowClass =
  "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-lg text-espresso shadow-md transition hover:scale-105 active:scale-95";

export function Gallery({ items: allItems }: { items: GalleryItem[] }) {
  const t = useTranslations("gallery");
  const locale = useLocale();

  // Server render uses the fixed order; each visit reshuffles after hydration.
  const [items, setItems] = useState(() => allItems.slice(0, GALLERY_MAX_ITEMS));
  const [index, setIndex] = useState(0);
  const total = items.length;

  const stageRef = useRef<HTMLDivElement>(null);
  const paneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const totalRef = useRef(total);

  indexRef.current = index;
  totalRef.current = total;

  useEffect(() => {
    setItems(shuffleGallery(allItems));
  }, [allItems]);

  function goTo(newIndex: number) {
    const prev = indexRef.current;
    const count = totalRef.current;
    const next = ((newIndex % count) + count) % count;
    if (next === prev) return;

    const outEl = paneRefs.current[prev];
    const inEl = paneRefs.current[next];

    if (outEl) gsap.to(outEl, { opacity: 0, duration: 0.6, ease: "power2.inOut", zIndex: 1 });
    if (inEl) {
      gsap.set(inEl, { opacity: 0, zIndex: 2 });
      gsap.to(inEl, { opacity: 1, duration: 0.8, ease: "power2.out" });
    }
    indexRef.current = next;
    setIndex(next);
  }

  function pauseFor(ms: number) {
    pausedRef.current = true;
    setTimeout(() => {
      pausedRef.current = false;
    }, ms);
  }

  // Autoplay: reschedules on every slide change (manual or automatic), and
  // waits while the pointer is over the gallery or a drag is in progress.
  useEffect(() => {
    if (total < 2) return;
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (pausedRef.current) {
        id = setTimeout(tick, 1000);
        return;
      }
      goTo(indexRef.current + 1);
    };
    id = setTimeout(tick, VIDEO_DWELL_MS);
    return () => clearTimeout(id);
  }, [index, total]);

  useEffect(() => {
    if (!stageRef.current) return;
    gsap.registerPlugin(Draggable);
    const [draggable] = Draggable.create(stageRef.current, {
      type: "x",
      edgeResistance: 0.65,
      onDragStart: () => {
        pausedRef.current = true;
      },
      onDragEnd(this: Draggable) {
        const dx = this.x;
        if (Math.abs(dx) > DRAG_THRESHOLD) {
          gsap.set(stageRef.current, { x: 0 });
          goTo(indexRef.current + (dx < 0 ? 1 : -1));
        } else {
          gsap.to(stageRef.current, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.6)" });
        }
        pauseFor(RESUME_DELAY_MS);
      },
    });
    return () => {
      draggable.kill();
    };
  }, []);

  return (
    <section id="galeria" className="bg-cream py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-gold-dark">
            {t("kicker")}
          </p>
          <h2 className="mt-3 font-serif text-4xl text-espresso md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-muted">{t("lead")}</p>
        </div>

        {total > 0 && (
        <div
          className="relative mx-auto mt-10 max-w-xl"
          onPointerEnter={() => {
            pausedRef.current = true;
          }}
          onPointerLeave={() => pauseFor(RESUME_DELAY_MS)}
        >
          {/* 9:16 to match vertical shorts (no pillarboxing); height-capped so it fits a laptop screen. */}
          <div className="relative mx-auto w-full max-w-[calc(min(80vh,720px)*9/16)]">
            <div
              ref={stageRef}
              className="relative aspect-[9/16] w-full touch-pan-y overflow-hidden rounded-sm bg-espresso shadow-md"
            >
              {items.map((item, i) => {
                const alt =
                  (locale === "en" ? item.altEn : item.altEs) ??
                  t("alt", { event: t(`events.${item.event ?? "other"}`) });
                return (
                  <div
                    key={galleryItemKey(item)}
                    ref={(el) => {
                      paneRefs.current[i] = el;
                    }}
                    className="absolute inset-0"
                    style={{ opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 2 : 1 }}
                  >
                    {/* TikTok offers no public thumbnail, so inactive panes stay on the
                        stage's dark background and only the active one loads a player. */}
                    {i === index && tiktokVideoId(item.url) && (
                      <iframe
                        title={alt}
                        src={`https://www.tiktok.com/player/v1/${tiktokVideoId(item.url)}?autoplay=1&loop=1&music_info=0&description=0&rel=0`}
                        className="h-full w-full"
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              aria-label={t("prev")}
              onClick={() => goTo(index - 1)}
              className={`${arrowClass} left-3 md:-left-16`}
            >
              ←
            </button>
            <button
              type="button"
              aria-label={t("next")}
              onClick={() => goTo(index + 1)}
              className={`${arrowClass} right-3 md:-right-16`}
            >
              →
            </button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-4">
            {/* Up to 20 dots: too many for a phone row, where swiping is the main control. */}
            <div className="hidden gap-2 md:flex">
              {items.map((item, i) => (
                <button
                  key={galleryItemKey(item)}
                  type="button"
                  aria-label={t("goTo", { n: i + 1 })}
                  aria-current={i === index}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-gold-dark" : "w-2 bg-espresso/20"
                  }`}
                />
              ))}
            </div>
            <span
              data-testid="gallery-counter"
              className="whitespace-nowrap text-xs tracking-[0.2em] text-muted tabular-nums"
            >
              {index + 1} / {total}
            </span>
          </div>
        </div>
        )}

        <p className="mt-8 text-center text-sm text-muted">
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
          </a>{" "}
          ·{" "}
          <a
            className="text-gold-dark underline-offset-4 hover:underline"
            href={COMPANY.social.youtube}
            rel="noopener noreferrer"
            target="_blank"
          >
            YouTube
          </a>
        </p>
      </div>
    </section>
  );
}
