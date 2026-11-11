# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing site for **Oliver Party Expert** (Vélez-Málaga): wedding DJ, lighting, food trucks, crepes, ice cream trolley, photobooth and décor. Bilingual (ES/EN, Spanish default). Built with Next.js App Router + TypeScript, originally scaffolded in Cursor.

Deployed on **Vercel** under the client's own account/domain (`oliverpartyexpert.com` via Cloudflare DNS) — Claude has admin access to that Vercel project, but it isn't "our" account. Data lives in **Supabase** (contact form storage) and **Resend** (email). All three (Vercel, Supabase, Resend) are on free tiers; there's a plan to move to paid tiers if traffic grows, but nothing in the code should assume paid-tier capacity today.

## Commands

```bash
npm ci                 # install (matches CI)
npm run dev             # dev server on 0.0.0.0:3000 — redirects to /es
npm run build            # production build
npm run lint            # eslint
npm run typecheck       # tsc --noEmit
npm test                # vitest run (single run)
npm run test:watch      # vitest watch mode
```

Run a single test file: `npx vitest run src/domain/inquiry.test.ts`
Run tests matching a name: `npx vitest run -t "honeypot"`

CI (`.github/workflows/ci.yml`) runs lint → typecheck → test → build in that order on every push/PR to `main`; match that order locally before pushing.

Local setup: `cp .env.example .env.local` before `npm run dev` — the contact form needs `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` at minimum (see README's env var table for the full list and Turnstile/captcha behavior).

## Architecture

The contact form is built hexagonal (ports & adapters); everything else is a fairly conventional Next.js App Router site.

- **`src/domain/inquiry.ts`** — pure logic: the `inquirySchema` (zod), honeypot check, HTML escaping. No I/O, no framework imports.
- **`src/application/`** — use cases and their ports:
  - `ports.ts` defines the interfaces (`InquiryRepository`, `EmailNotifier`, `RateLimiter`, `CaptchaVerifier`) that infrastructure adapters implement.
  - `submit-inquiry.ts` (`createSubmitInquiry`) is the orchestration: validate → honeypot → **captcha before rate limit** (so bots never burn IP rate-limit slots or Supabase/Resend quota) → IP-scoped limit, then IP+email-pair limit (softens shared-NAT false positives) → save → notify business + visitor. If email notification throws after save, it marks the record `markEmailFailed` and rethrows.
- **`src/infrastructure/`** — concrete adapters wired only at the route boundary: `supabase-inquiry-repository.ts`, `resend-email-notifier.ts`, `turnstile.ts`, `env.ts` (env var access + `allowedSiteOrigins` for apex/www CSRF-style origin checks), `rate-limiter.ts`.
  - `rate-limiter.ts` is an **in-memory** limiter (`Map` in module scope). This resets whenever a serverless instance cold-starts/recycles and does not share state across instances — it's a soft deterrent, not a hard guarantee, on Vercel.
- **`src/app/api/contact/`** — `handle-contact.ts` (`createContactHandler`) is the framework-facing adapter: origin allow-list check, missing-secrets 503, JSON parsing, and mapping domain/application errors to HTTP status codes. `route.ts` wires the real adapters together and exports `POST` (forced `runtime = "nodejs"` since Supabase/Resend SDKs aren't edge-safe).

When changing contact-form behavior, prefer editing at the layer that owns it (schema/business rule → `domain`, orchestration/ordering → `application`, provider specifics → `infrastructure`, HTTP concerns → `handle-contact.ts`) rather than reaching across layers.

### i18n

`next-intl`, locales `es` (default) and `en`, always-prefixed URLs (`/es/...`, `/en/...`), no auto-detection (`localeDetection: false` in `src/i18n/routing.ts`). Routes are localized (`/privacidad` vs `/privacy`, `/aviso-legal` vs `/legal-notice`) via `routing.pathnames`. Translation strings live in `messages/es.json` and `messages/en.json`. `src/proxy.ts` is the next-intl middleware (matcher excludes `api`, `_next`, `_vercel`, and anything with a file extension).

### Content model

Static content — service catalog, testimonials, gallery, FAQ ids — lives in `src/content/` (`company.ts` for company/business facts used in SEO and JSON-LD, `catalog.ts` for services/testimonials/gallery), not in components. `SERVICE_IDS` in `company.ts` is the source of truth for which services exist; `SERVICES` in `catalog.ts` maps each id to its hero image and, optionally, its dossier PDF (`public/dossiers/<id>.pdf`; no `dossier` = no download button, as for `popcorn` and `beer-tricycle`). The dossiers are page ranges cut from the client's PDFs: `dj` = DJ dossier pp. 5–21, `lighting` = DJ dossier p. 26, `food-trucks` = Catálogo 2026 pp. 8–11, `crepes` and `ice-cream` = Catálogo pp. 12–15, `neons` = pp. 4–7, `furniture` = pp. 16–22, `photobooth` = the whole fotomatones dossier. Their images were re-encoded as JPEG quality 65 (transparent images keep a lossless soft mask) so each file stays under 2 MB, which `catalog.test.ts` enforces.

The gallery (`components/Gallery.tsx`, GSAP-animated) is a carousel of hand-picked **TikTok** videos plus a few photos: `GALLERY_ITEMS` in `catalog.ts` (`kind: "image"` with a `public/` path, or `kind: "tiktok"` with the full `tiktok.com/@user/video/<id>` link; TikTok `/photo/` posts cannot be embedded (TikTok has no public feed and no thumbnail; short `vm.tiktok.com` links are rejected by the tests; alt text is generated from `event` unless `altEs`/`altEn` is set). Only the active slide loads a player (`https://www.tiktok.com/player/v1/<id>`). The client keeps the first item fixed and shuffles the rest on every visit (`shuffleGallery` in `domain/gallery.ts`, no cap); photos dwell 5 s, videos 15 s; with no items the section shows only its heading and the Instagram / Facebook / YouTube links (`COMPANY.social`); YouTube also has a button in the footer. The stage is 9:16 for every slide and the carousel is a 3D "deck": on `md`+ screens with motion allowed, the previous/next slides show tilted and dimmed beside the playing one (click to jump); below `md` or under `prefers-reduced-motion` it is a single card that crossfades. Each slide's transform comes from the pure `ringOffset`/`deckSlot` functions in `domain/gallery.ts` (unit-tested; positive CSS `rotateY` pulls the right edge toward the viewer, hence the sign), applied with GSAP in `Gallery.tsx`, which also drives a gold glow, floating sparkles and a light flash on each change. Every TikTok slide shows `GalleryPlaceholder` (logo + shimmer, since TikTok has no thumbnail) until its player's `onLoad` fades it out (the iframe mounts only after hydration so that load event can't be missed). A slide whose ring offset jumps by more than one (`wrapsAcrossDeck`) reappears on its new side instead of crossing the deck. The CSP allows `frame-src` for `https://www.tiktok.com`. YouTube is just a link, not embedded in the gallery.

### SEO

`src/seo/metadata.ts` builds page metadata per locale; `src/seo/jsonld.ts` builds structured data from `COMPANY`. `src/app/sitemap.ts` and `src/app/robots.ts` are Next's file-convention routes.

### Security headers / CSP

Defined centrally in `next.config.ts` (`securityHeaders`, `scriptSrc`). `'unsafe-eval'` is only added in development (React Fast Refresh). Any new third-party embed (scripts, iframes, fonts) needs an entry added here or it will be silently blocked by CSP in production only — dev's looser `script-src` can mask this.

### Testing

Vitest, `environment: "node"`, tests colocated as `*.test.ts` next to the module they cover (e.g. `src/domain/inquiry.test.ts`, `src/app/api/contact/handle-contact.test.ts`). No DOM/component tests currently exist — coverage is for domain/application/infrastructure logic, not UI components.
