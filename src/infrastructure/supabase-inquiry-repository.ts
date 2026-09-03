import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { InquiryInput, InquiryRecord } from "@/domain/inquiry";
import type { InquiryRepository } from "@/application/ports";
import { getContactConfig } from "./env";

function client(): SupabaseClient {
  const { supabaseUrl, supabaseServiceRoleKey } = getContactConfig();
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase is not configured");
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createSupabaseInquiryRepository(): InquiryRepository {
  return {
    async save(inquiry: InquiryInput): Promise<InquiryRecord> {
      const { data, error } = await client()
        .from("inquiries")
        .insert({
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          event_type: inquiry.eventType,
          event_date: inquiry.eventDate || null,
          location: inquiry.location || null,
          services: inquiry.services,
          message: inquiry.message,
          locale: inquiry.locale,
          status: "new",
        })
        .select("id, created_at")
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to save inquiry");
      }

      return {
        ...inquiry,
        id: data.id as string,
        createdAt: data.created_at as string,
      };
    },

    async markEmailFailed(id: string) {
      const { error } = await client()
        .from("inquiries")
        .update({ status: "email_failed" })
        .eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
  };
}
