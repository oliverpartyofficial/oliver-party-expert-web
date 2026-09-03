import type { InquiryInput, InquiryRecord } from "@/domain/inquiry";

export interface InquiryRepository {
  save(inquiry: InquiryInput): Promise<InquiryRecord>;
  markEmailFailed(id: string): Promise<void>;
}

export interface EmailNotifier {
  notifyBusiness(inquiry: InquiryRecord): Promise<void>;
  notifyVisitor(inquiry: InquiryRecord): Promise<void>;
}

export interface RateLimiter {
  consume(key: string): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }>;
}

export interface CaptchaVerifier {
  verify(token: string | undefined, ip: string): Promise<boolean>;
}
