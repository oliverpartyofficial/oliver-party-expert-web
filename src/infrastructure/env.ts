import { COMPANY } from "@/content/company";

export function getSiteUrl() {
  return (process.env.SITE_URL || COMPANY.domain).replace(/\/$/, "");
}

export function getContactConfig() {
  return {
    siteUrl: getSiteUrl(),
    supabaseUrl: process.env.SUPABASE_URL ?? "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    resendFromEmail:
      process.env.RESEND_FROM_EMAIL ??
      `Oliver Party Expert <${COMPANY.email}>`,
    contactToEmail: process.env.CONTACT_TO_EMAIL ?? COMPANY.email,
    turnstileSecret: process.env.TURNSTILE_SECRET_KEY ?? "",
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  };
}

// Only the datastore is mandatory for the contact form to accept a submission.
// Turnstile is strongly recommended in production: when both keys are set the
// server enforces captcha before Supabase/Resend. When unset, honeypot + rate
// limits still apply. Resend remains optional (see resend-email-notifier).
export function missingContactSecrets() {
  const env = getContactConfig();
  const missing: string[] = [];
  if (!env.supabaseUrl) missing.push("SUPABASE_URL");
  if (!env.supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  return missing;
}

/** Apex and www variants of SITE_URL (Vercel often redirects between them). */
export function allowedSiteOrigins(siteUrl = getSiteUrl()): string[] {
  try {
    const primary = new URL(siteUrl).origin;
    const { protocol, hostname } = new URL(primary);
    const altHost = hostname.startsWith("www.")
      ? hostname.slice(4)
      : `www.${hostname}`;
    const alt = `${protocol}//${altHost}`;
    return primary === alt ? [primary] : [primary, alt];
  } catch {
    return [];
  }
}
