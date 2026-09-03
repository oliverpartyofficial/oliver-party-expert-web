# Oliver Party Expert

Marketing site for Oliver Party Expert (Vélez-Málaga): wedding DJ, lighting, food trucks, crepes, ice cream trolley, photobooth and décor.

- **Stack:** Next.js App Router, TypeScript, Tailwind, next-intl (ES/EN)
- **Hosting:** Vercel (Hobby). Import this Git repo; framework is auto-detected.
- **Data:** Supabase (contact form). **Email:** Resend.
- **Domain:** oliverpartyexpert.com (Cloudflare Registrar → point DNS to Vercel)

## Local development

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 — you will be redirected to `/es`.

```bash
npm test
npm run typecheck
npm run build
```

## Environment variables (Vercel + `.env.local`)

Never use `NEXT_PUBLIC_` for secrets. The browser never talks to Supabase.

| Name | Where | Notes |
| --- | --- | --- |
| `SITE_URL` | Server | Canonical origin, e.g. `https://oliverpartyexpert.com` |
| `SUPABASE_URL` | Server | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Service role only |
| `RESEND_API_KEY` | Server | API key |
| `RESEND_FROM_EMAIL` | Server | Must be a verified sender |
| `CONTACT_TO_EMAIL` | Server | Default `oliverpartyofficial@gmail.com` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional public | Turnstile site key |
| `TURNSTILE_SECRET_KEY` | Optional server | Turnstile secret |

## Supabase

Run [supabase/migrations/0001_inquiries.sql](supabase/migrations/0001_inquiries.sql) in the SQL editor once. RLS stays on with no public policies; only the service role used by `/api/contact` can write.

## Dossiers

Placeholder PDFs live in `public/dossiers/`. Replace them yearly; Vercel serves them as static files.

## Deploy on Vercel

1. Import `Oliver-Party-Expert/oliver-party-expert-web`
2. Paste the env vars above
3. Deploy (`npm run build` / `next start` are the defaults)
4. Point Cloudflare DNS to Vercel
5. Verify the sending domain in Resend (or keep Gmail as `CONTACT_TO_EMAIL` and use Resend onboarding from-address until then)
