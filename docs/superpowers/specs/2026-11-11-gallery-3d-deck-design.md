# Gallery 3D deck (short design)

Status: awaiting owner approval. Nothing below is built yet.

## Intent and why

The gallery is now a carousel of hand-picked TikTok videos. The owner finds the plain fade between slides flat and wants something more dynamic, with more graphics and visual effects, in keeping with a DJ / lighting / party brand. A second, concrete problem: the next slide is an empty black pane until TikTok's player loads, so every transition ends with a black flash and a pop-in. TikTok gives no thumbnail (its oEmbed response has none), so there is nothing to show instead.

## Goals

- A 3D "deck": the playing video is centred; the previous and next slides are visible beside it, tilted, scaled down and dimmed. Changing slide sweeps the deck with a springy motion.
- A gold ambient glow and slow floating sparkles behind the frame, and a short light-flash on each change.
- Slides that are not playing show a branded placeholder card (not black). The active slide shows the same card until its player has loaded, then fades it out.
- Keep everything that works today: swipe/drag, arrows, dots (hidden on phones), counter, autoplay with pause on hover, 9:16 frame, shuffle with first item fixed, 20-item cap.

## Non-goals and anti-goals

- No new dependencies (GSAP is already used).
- No change to the content model (`GALLERY_ITEMS`) or to how videos are chosen.
- No preloading of the next TikTok player: TikTok already rate-limited our probing (HTTP 429), and extra players cost phones data and CPU.
- Must not make the page heavy on phones or break keyboard/screen-reader use. Effects must not make the gallery feel slower or harder to use.

## Constraints

- Only the active slide may mount a TikTok iframe (existing rule).
- Respect `prefers-reduced-motion`: fall back to the current simple crossfade, no sparkles, no flash, no 3D tilt.
- The gallery currently has only 3 playable videos (two others cannot be embedded). The deck works with 1, 2 or 3+ slides but looks best with 5+.
- CSP: no new hosts.

## Approaches considered

- **A. Light show:** glow, sparkles, flash and iris-wipe over the existing single-frame layout. Cheapest; does not fix the black placeholder or show neighbours.
- **B. 3D deck (chosen by the owner):** A's glow and flash, plus visible neighbours and branded placeholders. Most dynamic, fixes the black pop-in, more animation code.
- **C. Wipe transitions only:** smallest change; leaves the black pane and adds little "wow".

## Design (my calls, open to correction)

- **Layout:** from `md` up, show the current slide at full size plus one neighbour each side (scale 0.78, rotateY about ±28°, opacity 0.45, slight blur), with slides two away fading to nothing. Clicking a neighbour goes to it. Neighbours are decorative (`aria-hidden`, not focusable). Below `md` (phones): a single card, swipe and arrows as today, glow and flash kept, no neighbours.
- **Positioning logic:** a pure function in `domain/gallery.ts` turns "slide i, current index, total" into a signed ring offset (shortest way round, so the deck wraps) and from that the transform values. This is unit-tested; the GSAP/React code only applies the result.
- **Placeholder card:** dark espresso gradient with a slow gold shimmer, the site logo (`/logo.jpg`) small in the middle, and the event label (or a play icon). Shown for inactive slides and, on the active one, until the iframe's `onLoad` fires; then it fades out over the video.
- **Transition:** one GSAP timeline of about 0.9 s: deck moves with a soft overshoot easing; a radial gold flash pulses on the incoming frame; the glow colour eases between two brand golds.
- **Sparkles:** about 14 small gold dots drifting upward behind the frame, animated with GSAP (transforms/opacity only). Hidden under reduced motion.
- **Autoplay:** unchanged (15 s per slide, pauses while hovered or dragging).

## Testing and verification

- Unit tests for the offset/transform function (wrap-around, 1/2/3/20 slides, symmetry).
- Existing lint, typecheck, test and build in CI order.
- A Playwright screenshot of the local build for layout and placeholders (TikTok's player can't load in the sandbox).
- Final judgement of motion on the Vercel preview by the owner. I cannot see real playback from here.

## Left to the builder

Exact timings, easing curves, sparkle count and sizes, blur amount, and glow colours within the existing gold palette.
