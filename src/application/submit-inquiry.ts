import { isHoneypotTriggered, parseInquiry } from "@/domain/inquiry";
import type {
  CaptchaVerifier,
  EmailNotifier,
  InquiryRepository,
  RateLimiter,
} from "./ports";

export class ValidationError extends Error {
  constructor(public readonly issues: unknown) {
    super("Invalid inquiry");
    this.name = "ValidationError";
  }
}

export class RateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super("Too many requests");
    this.name = "RateLimitError";
  }
}

export class CaptchaError extends Error {
  constructor() {
    super("Captcha failed");
    this.name = "CaptchaError";
  }
}

export class ConfigurationError extends Error {
  constructor(public readonly missing: string[]) {
    super(`Missing configuration: ${missing.join(", ")}`);
    this.name = "ConfigurationError";
  }
}

export interface SubmitInquiryDeps {
  repository: InquiryRepository;
  email: EmailNotifier;
  rateLimiter: RateLimiter;
  captcha: CaptchaVerifier;
  now?: () => Date;
}

export function createSubmitInquiry(deps: SubmitInquiryDeps) {
  return async function submitInquiry(raw: unknown, meta: { ip: string; emailKey?: string }) {
    const parsed = parseInquiry(raw);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.flatten());
    }

    const inquiry = parsed.data;
    if (isHoneypotTriggered(inquiry)) {
      return { ok: true as const, ignored: true as const };
    }

    const rateKey = `${meta.ip}:${inquiry.email.toLowerCase()}`;
    const limit = await deps.rateLimiter.consume(rateKey);
    if (!limit.ok) {
      throw new RateLimitError(limit.retryAfterSeconds);
    }

    const captchaOk = await deps.captcha.verify(inquiry.turnstileToken, meta.ip);
    if (!captchaOk) {
      throw new CaptchaError();
    }

    const record = await deps.repository.save(inquiry);

    try {
      await deps.email.notifyBusiness(record);
      await deps.email.notifyVisitor(record);
    } catch (error) {
      await deps.repository.markEmailFailed(record.id);
      throw error;
    }

    return { ok: true as const, ignored: false as const, id: record.id };
  };
}
