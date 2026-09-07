import type { CaptchaVerifier } from "@/application/ports";
import { getContactConfig } from "./env";

/**
 * Verifies Cloudflare Turnstile tokens via siteverify.
 *
 * - Both keys unset: captcha is skipped (rate limit + honeypot still apply).
 * - Both keys set: fail-closed — missing/invalid tokens never reach Supabase/Resend.
 * - Only one key set: treat as misconfiguration and reject.
 */
export function createTurnstileVerifier(): CaptchaVerifier {
  return {
    async verify(token, ip) {
      const { turnstileSecret, turnstileSiteKey } = getContactConfig();
      const configured = Boolean(turnstileSecret && turnstileSiteKey);
      const partial = Boolean(turnstileSecret || turnstileSiteKey) && !configured;

      if (partial) return false;
      if (!configured) return true;
      if (!token) return false;

      const body = new URLSearchParams({
        secret: turnstileSecret,
        response: token,
        remoteip: ip,
      });

      const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body,
        },
      );
      if (!response.ok) return false;
      const data = (await response.json()) as { success?: boolean };
      return data.success === true;
    },
  };
}
