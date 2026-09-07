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

// Supabase + Turnstile are mandatory before the contact form accepts traffic.
// Turnstile must be configured so bots cannot burn Supabase/Resend quota.
// Resend is optional: when it is not configured the inquiry is still persisted
// and the email notification is simply skipped (see resend-email-notifier).
export function missingContactSecrets() {
  const env = getContactConfig();
  const missing: string[] = [];
  if (!env.supabaseUrl) missing.push("SUPABASE_URL");
  if (!env.supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!env.turnstileSiteKey) missing.push("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
  if (!env.turnstileSecret) missing.push("TURNSTILE_SECRET_KEY");
  return missing;
}
