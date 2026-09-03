import type { CaptchaVerifier } from "@/application/ports";
import { getContactConfig } from "./env";

export function createTurnstileVerifier(): CaptchaVerifier {
  return {
    async verify(token, ip) {
      const { turnstileSecret, turnstileSiteKey } = getContactConfig();
      if (!turnstileSecret || !turnstileSiteKey) {
        return true;
      }
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
