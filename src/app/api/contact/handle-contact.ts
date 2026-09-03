import { NextResponse } from "next/server";
import {
  CaptchaError,
  ConfigurationError,
  RateLimitError,
  ValidationError,
} from "@/application/submit-inquiry";

type SubmitFn = (
  raw: unknown,
  meta: { ip: string },
) => Promise<{ ok: true; ignored?: boolean; id?: string }>;

export function createContactHandler(deps: {
  submit: SubmitFn;
  getSiteUrl: () => string;
  missingSecrets: () => string[];
}) {
  function originAllowed(request: Request) {
    const site = deps.getSiteUrl();
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const candidate = origin || referer;
    if (!candidate) return false;
    try {
      return new URL(candidate).origin === new URL(site).origin;
    } catch {
      return false;
    }
  }

  function clientIp(request: Request) {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
    return request.headers.get("x-real-ip") || "unknown";
  }

  return async function POST(request: Request) {
    if (!originAllowed(request)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const missing = deps.missingSecrets();
    if (missing.length) {
      return NextResponse.json(
        { error: "Service unavailable", missing },
        { status: 503 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    try {
      const result = await deps.submit(body, { ip: clientIp(request) });
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { error: "Invalid input", issues: error.issues },
          { status: 400 },
        );
      }
      if (error instanceof RateLimitError) {
        return NextResponse.json(
          { error: "Too many requests" },
          {
            status: 429,
            headers: { "Retry-After": String(error.retryAfterSeconds) },
          },
        );
      }
      if (error instanceof CaptchaError) {
        return NextResponse.json({ error: "Captcha failed" }, { status: 400 });
      }
      if (error instanceof ConfigurationError) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
      }
      console.error("contact_submit_failed", error);
      return NextResponse.json({ error: "Unable to send enquiry" }, { status: 500 });
    }
  };
}
