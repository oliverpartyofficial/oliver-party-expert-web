import { Resend } from "resend";
import { COMPANY } from "@/content/company";
import type { InquiryRecord } from "@/domain/inquiry";
import { escapeHtml } from "@/domain/inquiry";
import type { EmailNotifier } from "@/application/ports";
import { getContactConfig } from "./env";

function row(label: string, value: string) {
  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

export function createResendEmailNotifier(): EmailNotifier {
  function client() {
    const env = getContactConfig();
    if (!env.resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    return new Resend(env.resendApiKey);
  }

  return {
    async notifyBusiness(inquiry: InquiryRecord) {
      const env = getContactConfig();
      const html = [
        `<h1>Nueva consulta — ${escapeHtml(COMPANY.name)}</h1>`,
        row("Nombre", inquiry.name),
        row("Email", inquiry.email),
        row("Teléfono", inquiry.phone),
        row("Tipo de evento", inquiry.eventType),
        row("Fecha", inquiry.eventDate || "—"),
        row("Lugar", inquiry.location || "—"),
        row("Servicios", inquiry.services.join(", ")),
        row("Idioma", inquiry.locale),
        row("Mensaje", inquiry.message),
      ].join("");
      const { error } = await client().emails.send({
        from: env.resendFromEmail,
        to: env.contactToEmail,
        replyTo: inquiry.email,
        subject: `Consulta web: ${inquiry.name} (${inquiry.eventType})`,
        html,
      });
      if (error) throw new Error(error.message);
    },

    async notifyVisitor(inquiry: InquiryRecord) {
      const env = getContactConfig();
      const isEs = inquiry.locale === "es";
      const html = isEs
        ? `
          <p>Hola ${escapeHtml(inquiry.name)},</p>
          <p>Hemos recibido tu solicitud para ${escapeHtml(COMPANY.name)}. Oliver o su equipo te responderán lo antes posible.</p>
          <p>Teléfono: ${escapeHtml(COMPANY.phoneDisplay)}<br/>Email: ${escapeHtml(COMPANY.email)}</p>
          <p>Un saludo,<br/>${escapeHtml(COMPANY.name)}</p>
        `
        : `
          <p>Hello ${escapeHtml(inquiry.name)},</p>
          <p>We have received your enquiry for ${escapeHtml(COMPANY.name)}. Oliver or his team will get back to you as soon as possible.</p>
          <p>Phone: ${escapeHtml(COMPANY.phoneDisplay)}<br/>Email: ${escapeHtml(COMPANY.email)}</p>
          <p>Kind regards,<br/>${escapeHtml(COMPANY.name)}</p>
        `;
      const { error } = await client().emails.send({
        from: env.resendFromEmail,
        to: inquiry.email,
        subject: isEs
          ? `Hemos recibido tu consulta — ${COMPANY.name}`
          : `We received your enquiry — ${COMPANY.name}`,
        html,
      });
      if (error) throw new Error(error.message);
    },
  };
}
