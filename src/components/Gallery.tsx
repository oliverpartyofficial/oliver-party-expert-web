"use client";

import { galleryItemKey, tiktokVideoId, type GalleryItem } from "@/content/catalog";
import { COMPANY } from "@/content/company";
import { GalleryPlaceholder } from "@/components/GalleryPlaceholder";
import { GALLERY_MAX_ITEMS, deckSlot, ringOffset, shuffleGallery } from "@/domain/gallery";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

// Slides are TikTok videos, so give each one time to be watched.
const VIDEO_DWELL_MS = 15000;
const RESUME_DELAY_MS = 1200;
const DRAG_THRESHOLD = 70;
const DECK_PERSPECTIVE = 900;
const DECK_MS = 0.9;

// Fixed positions (not random) so server and client render the same markup.
const SPARKLES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 17) % 100,
  size: 3 + (i % 3) * 2,
  delay: (i % 7) * 0.6,
  duration: 3.5 + (i % 4) * 0.8,
}));

const arrowClass =
  "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-lg text-espresso shadow-md transition hover:scale-105 active:scale-95";

export function Gallery({ items: allItems }: { items: GalleryItem[] }) {
  const t = useTranslations("gallery");
  const locale = useLocale();

  // Server render uses the fixed order; each visit reshuffles after hydration.
  const [items, setItems] = useState(() => allItems.slice(0, GALLERY_MAX_ITEMS));
  const [index, setIndex] = useState(0);
  const total = items.length;
  // Neighbouring slides only show on wide screens and when motion is welcome;
  // otherwise the gallery is a single card that crossfades.
  const [motion, setMotion] = useState({ wide: false, reduced: false });
  const neighbours = motion.wide && !motion.reduced;

  const stageRef = useRef<HTMLDivElement>(null);
  const paneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const placeholderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const deckReady = useRef(false);
  const prevIndex = useRef(0);
  const glowRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const sparkleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const totalRef = useRef(total);

  indexRef.current = index;
  totalRef.current = total;

  useEffect(() => {
    setItems(shuffleGallery(allItems));
  }, [allItems]);

  function goTo(newIndex: number) {
    const count = totalRef.current;
    const next = ((newIndex % count) + count) % count;
    if (next === indexRef.current) return;
    indexRef.current = next;
    setIndex(next);
  }

  function pauseFor(ms: number) {
    pausedRef.current = true;
    setTimeout(() => {
      pausedRef.current = false;
    }, ms);
  }

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotion({ wide: wide.matches, reduced: reduced.matches });
    update();
    wide.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  // Lays the deck out: every slide moves to the transform for its distance
  // from the current one. The first run snaps; later runs animate.
  useEffect(() => {
    const instant = !deckReady.current;
    deckReady.current = true;
    paneRefs.current.forEach((pane, i) => {
      if (!pane) return;
      const slot = deckSlot(ringOffset(i, index, total), neighbours);
      gsap.set(pane, { zIndex: slot.zIndex, transformPerspective: DECK_PERSPECTIVE });
      gsap.to(pane, {
        xPercent: slot.x,
        scale: slot.scale,
        rotateY: slot.rotateY,
        opacity: slot.opacity,
        filter: `blur(${slot.blur}px)`,
        duration: instant ? 0 : neighbours ? DECK_MS : 0.6,
        ease: neighbours ? "back.out(1.15)" : "power2.inOut",
        overwrite: "auto",
      });
      // A slide that is not playing shows its placeholder again.
      if (slot.zIndex !== 10) gsap.set(placeholderRefs.current[i], { opacity: 1 });
    });

    // A light flash and a glow colour shift on every slide change.
    const changed = prevIndex.current !== index;
    prevIndex.current = index;
    if (changed && !motion.reduced) {
      const css = getComputedStyle(document.documentElement);
      const golds = [css.getPropertyValue("--gold").trim(), css.getPropertyValue("--gold-dark").trim()];
      gsap.to(glowRef.current, {
        backgroundColor: golds[index % 2] || golds[0],
        duration: DECK_MS,
        ease: "power2.inOut",
        overwrite: "auto",
      });
      gsap.fromTo(
        flashRef.current,
        { opacity: 0 },
        { opacity: 0.5, duration: 0.22, yoyo: true, repeat: 1, ease: "power2.out", overwrite: "auto" },
      );
    }
  }, [index, total, neighbours, items, motion.reduced]);

  // Slow gold sparkles drifting up behind the frame (skipped for reduced motion).
  useEffect(() => {
    if (motion.reduced) return;
    const ctx = gsap.context(() => {
      sparkleRefs.current.forEach((el, i) => {
        if (!el) return;
        const sp = SPARKLES[i];
        gsap.fromTo(
          el,
          { y: 24, opacity: 0 },
          { y: -90, opacity: 0.85, duration: sp.duration, delay: sp.delay, repeat: -1, yoyo: true, ease: "sine.inOut" },
        );
      });
    });
    return () => ctx.revert();
  }, [motion.reduced]);

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
    <section id="galeria" className="overflow-x-clip bg-cream py-24">
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
          <div className="relative isolate mx-auto w-full max-w-[calc(min(80vh,720px)*9/16)]">
            {/* Ambient gold glow and sparkles sit behind the deck. */}
            <div
              ref={glowRef}
              aria-hidden
              className="pointer-events-none absolute -inset-[18%] -z-10 rounded-full bg-gold opacity-30 blur-3xl"
            />
            {!motion.reduced && (
              <div aria-hidden className="pointer-events-none absolute -inset-[35%] -z-10">
                {SPARKLES.map((sp, i) => (
                  <span
                    key={i}
                    ref={(el) => {
                      sparkleRefs.current[i] = el;
                    }}
                    className="absolute rounded-full bg-gold opacity-0"
                    style={{ left: `${sp.left}%`, top: `${sp.top}%`, width: sp.size, height: sp.size }}
                  />
                ))}
              </div>
            )}
            <div
              ref={stageRef}
              className="relative aspect-[9/16] w-full touch-pan-y"
            >
              {items.map((item, i) => {
                const alt =
                  (locale === "en" ? item.altEn : item.altEs) ??
                  t("alt", { event: t(`events.${item.event ?? "other"}`) });
                const offset = ringOffset(i, index, total);
                const clickable = neighbours && Math.abs(offset) === 1;
                return (
                  <div
                    key={galleryItemKey(item)}
                    ref={(el) => {
                      paneRefs.current[i] = el;
                    }}
                    // Neighbours are decorative: hidden from assistive tech (they hold nothing focusable).
                    aria-hidden={offset !== 0 || undefined}
                    onClick={clickable ? () => goTo(i) : undefined}
                    className={`absolute inset-0 overflow-hidden rounded-sm bg-espresso shadow-md ${
                      clickable ? "cursor-pointer" : offset !== 0 ? "pointer-events-none" : ""
                    }`}
                    style={{ opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 10 : 1 }}
                  >
                    {/* TikTok offers no public thumbnail: every slide shows a branded card,
                        and only the active one loads a player, which fades the card out. */}
                    {i === index && tiktokVideoId(item.url) && (
                      <iframe
                        title={alt}
                        src={`https://www.tiktok.com/player/v1/${tiktokVideoId(item.url)}?autoplay=1&loop=1&music_info=0&description=0&rel=0`}
                        className="h-full w-full"
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        allowFullScreen
                        onLoad={() =>
                          gsap.to(placeholderRefs.current[i], { opacity: 0, duration: 0.4, overwrite: "auto" })
                        }
                      />
                    )}
                    <div
                      ref={(el) => {
                        placeholderRefs.current[i] = el;
                      }}
                      className="pointer-events-none absolute inset-0"
                    >
                      <GalleryPlaceholder label={alt} />
                    </div>
                  </div>
                );
              })}
              <div
                ref={flashRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 z-20 rounded-sm opacity-0"
                style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,240,200,0.9), rgba(196,163,106,0.35) 55%, transparent 80%)" }}
              />
            </div>

            <button
              type="button"
              aria-label={t("prev")}
              onClick={() => goTo(index - 1)}
              className={`${arrowClass} left-3 ${neighbours ? "md:left-[-60%]" : "md:-left-16"} ${total < 2 ? "hidden" : ""}`}
            >
              ←
            </button>
            <button
              type="button"
              aria-label={t("next")}
              onClick={() => goTo(index + 1)}
              className={`${arrowClass} right-3 ${neighbours ? "md:right-[-60%]" : "md:-right-16"} ${total < 2 ? "hidden" : ""}`}
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
