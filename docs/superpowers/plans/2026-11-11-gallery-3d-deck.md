# Gallery 3D Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the TikTok carousel into a 3D deck (visible tilted neighbours, branded placeholders, gold glow, sparkles, light flash) without changing which videos play or how.

**Architecture:** A pure function in `domain/gallery.ts` maps each slide's ring offset from the current slide to transform values; `Gallery.tsx` applies them with GSAP (already a dependency) and owns effects. A small presentational component draws the placeholder card. Only the active slide mounts a TikTok iframe (unchanged).

**Tech Stack:** Next.js App Router, React, TypeScript, GSAP + Draggable, Tailwind v4 (`@theme` tokens in `src/app/globals.css`), Vitest (node environment, no DOM tests).

**Spec:** `docs/superpowers/specs/2026-11-11-gallery-3d-deck-design.md`

## Global Constraints

- No new dependencies; no new CSP hosts.
- Only the active slide mounts a TikTok iframe; do not preload the next player.
- Keep: swipe/drag, arrows, dots (hidden below `md`), counter, autoplay 15 s with pause on hover/drag, 9:16 frame, shuffle with first item fixed, 20-item cap.
- Neighbours: scale 0.78, rotateY about ±28°, opacity 0.45, slight blur; slides two or more away fade to opacity 0.
- Neighbours are decorative: `aria-hidden`, not focusable; clicking one goes to it.
- Below `md`: single card, no neighbours (glow and flash kept).
- `prefers-reduced-motion: reduce`: no neighbours, tilt, sparkles or flash; plain crossfade only.
- Transition about 0.9 s with soft overshoot; about 14 sparkles; transforms/opacity only.
- Colours come from the existing gold/espresso tokens.

## Review Focus

- One slide only: no neighbours, arrows do nothing harmful, no crash in the offset math.
- Two slides: the single neighbour appears on one side only; wrap-around works both ways.
- Rapid arrow clicks mid-transition: no stuck or half-faded slides (tweens must overwrite).
- Neighbours visible at 768-1100 px wide: no horizontal page scrolling.
- An active iframe that never fires `onLoad`: the placeholder simply stays (no error, no blank).
- Zero slides: section still renders heading and links (existing behaviour, keep).

---

### Task 1: Deck positioning math

**Files:**
- Modify: `src/domain/gallery.ts`
- Test: `src/domain/gallery.test.ts`

**Interfaces:**
- Produces: `ringOffset(index: number, current: number, total: number): number` — signed shortest distance from `current` to `index` around a ring of `total` slides; 0 when `total <= 1`; when `total` is even and the distance is exactly half the ring, return the positive value.
- Produces: `type DeckSlot = { x: number; scale: number; rotateY: number; opacity: number; blur: number; zIndex: number }` where `x` is a percentage of the frame width.
- Produces: `deckSlot(offset: number, neighbours: boolean): DeckSlot` — offset 0 is `{ x: 0, scale: 1, rotateY: 0, opacity: 1, blur: 0, zIndex: 10 }`; with `neighbours` true, offset ±1 gives scale 0.78, opacity 0.45, rotateY `-offset * 28`, blur 3, x `offset * 78`, zIndex 5; any `|offset| >= 2` gives opacity 0, scale 0.6, x `sign * 110`, zIndex 1; with `neighbours` false every non-zero offset gives opacity 0, scale 1, rotateY 0, x 0, zIndex 1.

- [ ] **Step 1: Write failing tests** in `src/domain/gallery.test.ts` (name them `ringOffset` and `deckSlot`): offsets for total 5 / current 0 are `[0, 1, 2, -2, -1]`; wrap from current 4 gives index 0 → +1; total 1 → 0; total 2 → `ringOffset(1, 0, 2)` and `ringOffset(0, 1, 2)` are both +1; total 4 half-ring gives +2; `deckSlot(0, true)` equals the centre value above; `deckSlot(-1, true).rotateY` is +28 and `deckSlot(1, true).rotateY` is -28; `deckSlot(3, true).opacity` is 0; `deckSlot(1, false).opacity` is 0 and `.scale` is 1.
- [ ] **Step 2: Run** `npx vitest run src/domain/gallery.test.ts`. Expected: FAIL (functions not exported).
- [ ] **Step 3: Implement** both functions and the `DeckSlot` type in `src/domain/gallery.ts` (pure, no imports from React/GSAP).
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit** `git add src/domain/gallery.ts src/domain/gallery.test.ts && git commit -m "Add deck positioning math for the gallery"`.

### Task 2: Branded placeholder card

**Files:**
- Create: `src/components/GalleryPlaceholder.tsx`
- Modify: `src/app/globals.css` (add a `gallery-shimmer` keyframe and `.gallery-shimmer` class, disabled under `prefers-reduced-motion: reduce`)

**Interfaces:**
- Produces: `export function GalleryPlaceholder({ label }: { label: string }): JSX.Element` — fills its parent (`absolute inset-0`), dark espresso gradient with a slow gold shimmer, `/logo.jpg` small and centred (decorative, empty alt), `label` as small text underneath. Purely presentational; no state.

- [ ] **Step 1: Implement** the component and CSS using existing `espresso`/`gold` tokens.
- [ ] **Step 2: Run** `npm run lint && npm run typecheck`. Expected: exit 0.
- [ ] **Step 3: Commit** with message "Add branded placeholder card for gallery slides".

### Task 3: Deck layout, neighbours and placeholder handover

**Files:**
- Modify: `src/components/Gallery.tsx`
- Modify: `messages/es.json`, `messages/en.json` only if a new accessible label is needed (keep keys identical in both)

**Interfaces:**
- Consumes: `ringOffset`, `deckSlot` (Task 1); `GalleryPlaceholder` (Task 2).

- [ ] **Step 1:** Track `neighbours` in state: true when `window.matchMedia("(min-width: 768px)")` matches and `(prefers-reduced-motion: reduce)` does not; update on change events.
- [ ] **Step 2:** Replace the single 9:16 clipped stage with a perspective container whose children are the 9:16 slide frames; position each pane with `gsap.to(pane, { ...deckSlot(ringOffset(i, index, total), neighbours), duration: 0.9, ease: "back.out(1.2)", overwrite: "auto" })` (x as `xPercent`, blur as a CSS filter). Remove the old per-pane opacity/zIndex fade code. Panes with offset ≠ 0 get `aria-hidden`, `inert`, and an `onClick` that calls `goTo(i)`.
- [ ] **Step 3:** Every pane renders `GalleryPlaceholder` (label = generated alt text). The active pane's iframe renders above it; on the iframe's `onLoad`, fade the placeholder to opacity 0 (`gsap.to`, 0.4 s) and reset it to visible when the pane becomes inactive.
- [ ] **Step 4:** Make sure the section clips horizontal overflow (`overflow-x-clip` on the gallery section or container) so tilted neighbours never cause page-wide horizontal scroll; keep Draggable on the frame container and verify drag still changes slides.
- [ ] **Step 5:** Run `npm run lint && npm run typecheck && npm test`. Expected: all exit 0.
- [ ] **Step 6: Commit** "Gallery: 3D deck with neighbours and branded placeholders".

### Task 4: Glow, sparkles and flash

**Files:**
- Modify: `src/components/Gallery.tsx`

- [ ] **Step 1:** Add a glow element behind the frame container (radial gradient from the `gold` token, blurred); on each slide change tween its colour/opacity between two golds over the transition duration.
- [ ] **Step 2:** Add about 14 absolutely positioned gold dots behind the frame, each looping upward drift with random delay/size via one GSAP timeline created in `useEffect` and killed on cleanup.
- [ ] **Step 3:** Add a flash overlay over the active frame: on `goTo`, tween a radial gold gradient from opacity 0 → 0.5 → 0 in about 0.5 s (`pointer-events-none`).
- [ ] **Step 4:** Skip steps 2 and 3's tweens and hide the glow animation when `prefers-reduced-motion: reduce` is set (read once in the same effect as Task 3, Step 1).
- [ ] **Step 5:** Run `npm run lint && npm run typecheck && npm test`. Expected: all exit 0.
- [ ] **Step 6: Commit** "Gallery: gold glow, sparkles and light flash".

### Task 5: Verify, document, ship

**Files:**
- Modify: `CLAUDE.md` (gallery paragraph: mention the 3D deck, `deckSlot`/`ringOffset`, placeholder card, reduced-motion fallback)

- [ ] **Step 1:** Run `npm run lint && npm run typecheck && npm test && npm run build` in that order. Expected: every command exits 0.
- [ ] **Step 2:** Start the production build and take Playwright screenshots (1280 px and 390 px wide) of the gallery section, plus one at 900 px to confirm no horizontal scroll (`document.documentElement.scrollWidth <= innerWidth`). TikTok's player cannot load in the sandbox, so placeholders are expected in the frames.
- [ ] **Step 3:** Update `CLAUDE.md`, commit, push to `claude/busy-dijkstra-hqezds`, and update the PR #17 description to mention the deck.
- [ ] **Step 4:** Tell the owner what was and was not verified (layout checked locally; motion and real playback only on the Vercel preview).
