import { createSubmitInquiry } from "@/application/submit-inquiry";
import { getSiteUrl, missingContactSecrets } from "@/infrastructure/env";
import { createMemoryRateLimiter } from "@/infrastructure/rate-limiter";
import { createResendEmailNotifier } from "@/infrastructure/resend-email-notifier";
import { createSupabaseInquiryRepository } from "@/infrastructure/supabase-inquiry-repository";
import { createTurnstileVerifier } from "@/infrastructure/turnstile";
import { createContactHandler } from "./handle-contact";

export const runtime = "nodejs";

const POST = createContactHandler({
  submit: createSubmitInquiry({
    repository: createSupabaseInquiryRepository(),
    email: createResendEmailNotifier(),
    rateLimiter: createMemoryRateLimiter(),
    captcha: createTurnstileVerifier(),
  }),
  getSiteUrl,
  missingSecrets: missingContactSecrets,
});

export { POST };
