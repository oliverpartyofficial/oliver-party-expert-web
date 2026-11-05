"use client";

import { GALLERY_ITEMS } from "@/content/catalog";
import { COMPANY } from "@/content/company";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const AUTOPLAY_MS = 4500;
const RESUME_DELAY_MS = 1200;
const DRAG_THRESHOLD = 70;

export function Gallery() {
  const t = useTranslations("gallery");
  const locale = useLocale();
  const total = GALLERY_ITEMS.length;

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const paneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const kenBurnsTween = useRef<gsap.core.Tween | null>(null);
  const indexRef = useRef(0);
  const playingRef = useRef<string | null>(null);
  const pausedRef = useRef(false);
  const lastManualRef = useRef(0);

  indexRef.current = index;
  playingRef.current = playing;

  function mediaOf(i: number) {
    return paneRefs.current[i]?.querySelector<HTMLElement>(".pane-media") ?? null;
  }

  function goTo(newIndex: number) {
    const prev = indexRef.current;
    const next = ((newIndex % total) + total) % total;
    if (next === prev) return;

    const prevItem = GALLERY_ITEMS[prev];
    if (prevItem.id === playingRef.current) setPlaying(null);

    const outEl = paneRefs.current[prev];
    const inEl = paneRefs.current[next];
    const outMedia = mediaOf(prev);
    const inMedia = mediaOf(next);

    kenBurnsTween.current?.kill();

    if (outEl) {
      gsap.to(outEl, { opacity: 0, duration: 0.9, ease: "power2.inOut", zIndex: 1 });
      if (outMedia) gsap.to(outMedia, { scale: 1.06, filter: "blur(8px)", duration: 0.9, ease: "power2.inOut" });
    }
    if (inEl) {
      gsap.set(inEl, { opacity: 0, zIndex: 2 });
      gsap.to(inEl, { opacity: 1, duration: 1, ease: "power2.out" });
      if (inMedia) {
        gsap.fromTo(
          inMedia,
          { scale: 1.1, filter: "blur(8px)" },
          {
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power2.out",
            onComplete: () => {
              kenBurnsTween.current = gsap.to(inMedia, { scale: 1.08, duration: 6, ease: "none" });
            },
          },
        );
      }
    }
    setIndex(next);
  }

  function navigate(delta: number) {
    lastManualRef.current = Date.now();
    goTo(indexRef.current + delta);
  }

  // Kick off the first pane's Ken Burns zoom once on mount.
  useEffect(() => {
    const firstMedia = mediaOf(0);
    if (firstMedia) {
      kenBurnsTween.current = gsap.to(firstMedia, { scale: 1.08, duration: 6, ease: "none" });
    }
    return () => {
      kenBurnsTween.current?.kill();
    };
  }, []);

  // Autoplay: ticks on a fixed interval, skipped while paused, a video is
  // playing, or shortly after a manual interaction.
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current || playingRef.current) return;
      if (Date.now() - lastManualRef.current < AUTOPLAY_MS) return;
      goTo(indexRef.current + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drag-to-swipe: translate the whole stage with the pointer, decide
  // commit vs. snap-back on release.
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
        if (dx < -DRAG_THRESHOLD || dx > DRAG_THRESHOLD) {
          gsap.set(stageRef.current, { x: 0 });
          navigate(dx < 0 ? 1 : -1);
        } else {
          gsap.to(stageRef.current, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.6)" });
        }
        setTimeout(() => {
          pausedRef.current = false;
        }, RESUME_DELAY_MS);
      },
    });
    return () => {
      draggable.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              onClick={() => { navigate(-1); setTimeout(() => (pausedRef.current = false), RESUME_DELAY_MS); }}
              className="min-h-11 min-w-11 rounded-full bg-gold px-4 py-2 text-lg text-espresso shadow-sm transition hover:scale-105 active:scale-95"
            >
              ←
            </button>
            <button
              type="button"
              aria-label={t("next")}
              onClick={() => { navigate(1); setTimeout(() => (pausedRef.current = false), RESUME_DELAY_MS); }}
              className="min-h-11 min-w-11 rounded-full bg-gold px-4 py-2 text-lg text-espresso shadow-sm transition hover:scale-105 active:scale-95"
            >
              →
            </button>
          </div>
        </div>
        <div
          className="relative mx-auto mt-10 aspect-[4/5] max-h-[560px] max-w-xl touch-pan-y overflow-hidden rounded-sm bg-espresso shadow-md"
          ref={stageRef}
          onPointerEnter={() => { pausedRef.current = true; }}
          onPointerLeave={() => { setTimeout(() => (pausedRef.current = false), RESUME_DELAY_MS); }}
        >
          {GALLERY_ITEMS.map((item, i) => {
            const alt = locale === "en" ? item.altEn : item.altEs;
            return (
              <div
                key={item.id}
                ref={(el) => { paneRefs.current[i] = el; }}
                className="absolute inset-0"
                style={{ opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 2 : 1 }}
              >
                {item.kind === "youtube" ? (
                  playing === item.id ? (
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
                        className="pane-media h-full w-full object-cover"
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
                  )
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.src}
                    alt={alt}
                    className="pane-media h-full w-full object-cover"
                    draggable={false}
                  />
                )}
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
