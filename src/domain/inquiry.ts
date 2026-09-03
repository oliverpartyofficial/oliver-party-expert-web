import { z } from "zod";
import { EVENT_TYPES, SERVICE_IDS } from "@/content/company";

export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(40),
  eventType: z.enum(EVENT_TYPES),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
    .optional()
    .or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  services: z.array(z.enum(SERVICE_IDS)).min(1).max(SERVICE_IDS.length),
  message: z.string().trim().min(10).max(4000),
  locale: z.enum(["es", "en"]),
  consent: z.literal(true),
  website: z.string().max(200).optional().or(z.literal("")),
  turnstileToken: z.string().max(4000).optional().or(z.literal("")),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export type InquiryRecord = InquiryInput & {
  id: string;
  createdAt: string;
};

export function parseInquiry(raw: unknown) {
  return inquirySchema.safeParse(raw);
}

export function isHoneypotTriggered(input: InquiryInput) {
  return Boolean(input.website && input.website.length > 0);
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
