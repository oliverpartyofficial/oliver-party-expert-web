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

Static content — service catalog, testimonials, gallery, FAQ ids — lives in `src/content/` (`company.ts` for company/business facts used in SEO and JSON-LD, `catalog.ts` for services/testimonials/gallery), not in components. `SERVICE_IDS` in `company.ts` is the source of truth for which services exist; `SERVICES` in `catalog.ts` maps each id to its dossier PDF (`public/dossiers/<id>.pdf`) and hero image.

`GalleryItem` (`catalog.ts`) is already a discriminated union of `kind: "image" | "youtube"` — the YouTube variant is defined but `GALLERY_ITEMS` currently only populates `"image"` entries. The CSP in `next.config.ts` already allows `frame-src https://www.youtube-nocookie.com`, so embedding via `youtube-nocookie.com` needs no CSP change.

### SEO

`src/seo/metadata.ts` builds page metadata per locale; `src/seo/jsonld.ts` builds structured data from `COMPANY`. `src/app/sitemap.ts` and `src/app/robots.ts` are Next's file-convention routes.

### Security headers / CSP

Defined centrally in `next.config.ts` (`securityHeaders`, `scriptSrc`). `'unsafe-eval'` is only added in development (React Fast Refresh). Any new third-party embed (scripts, iframes, fonts) needs an entry added here or it will be silently blocked by CSP in production only — dev's looser `script-src` can mask this.

### Testing

Vitest, `environment: "node"`, tests colocated as `*.test.ts` next to the module they cover (e.g. `src/domain/inquiry.test.ts`, `src/app/api/contact/handle-contact.test.ts`). No DOM/component tests currently exist — coverage is for domain/application/infrastructure logic, not UI components.
