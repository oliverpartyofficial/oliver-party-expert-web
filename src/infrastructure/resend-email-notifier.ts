import { Resend } from "resend";
import { COMPANY } from "@/content/company";
import { escapeHtml, type InquiryRecord } from "@/domain/inquiry";
import type { EmailNotifier } from "@/application/ports";
import { getContactConfig } from "./env";
import { renderBrandedEmail, renderInquiryDetails } from "./email-template";

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
      // Resend is optional: skip the notification when no API key is set so the
      // inquiry is still captured in the database.
      if (!env.resendApiKey) return;

      const html = renderBrandedEmail({
        siteUrl: env.siteUrl,
        preheader: `${inquiry.name} · ${inquiry.eventType} · ${inquiry.email}`,
        heading: "Nueva consulta",
        subheading: "Habéis recibido una nueva solicitud de presupuesto desde la web.",
        contentHtml: renderInquiryDetails(inquiry),
      });

      const { error } = await client().emails.send({
        from: env.resendFromEmail,
        to: env.contactToEmail,
        replyTo: inquiry.email,
        subject: `Nueva consulta: ${inquiry.name} · ${inquiry.eventType}`,
        html,
      });
      if (error) throw new Error(error.message);
    },

    async notifyVisitor(inquiry: InquiryRecord) {
      const env = getContactConfig();
      if (!env.resendApiKey) return;
      const isEs = inquiry.locale === "es";

      const heading = isEs
        ? `¡Gracias, ${inquiry.name}!`
        : `Thank you, ${inquiry.name}!`;
      const subheading = isEs
        ? `Hemos recibido tu solicitud para ${COMPANY.name}. Oliver o su equipo te responderán lo antes posible.`
        : `We have received your enquiry for ${COMPANY.name}. Oliver or his team will get back to you as soon as possible.`;
      const contentHtml = isEs
        ? `
          <p style="margin:0 0 14px;">Mientras tanto, si quieres adelantarnos cualquier detalle puedes escribirnos o llamarnos directamente:</p>
          <p style="margin:0;">
            <strong>Teléfono:</strong> ${escapeHtml(COMPANY.phoneDisplay)}<br />
            <strong>Email:</strong> ${escapeHtml(COMPANY.email)}
          </p>
          <p style="margin:18px 0 0;">Un saludo,<br />${escapeHtml(COMPANY.name)}</p>`
        : `
          <p style="margin:0 0 14px;">In the meantime, feel free to share any extra details by email or phone:</p>
          <p style="margin:0;">
            <strong>Phone:</strong> ${escapeHtml(COMPANY.phoneDisplay)}<br />
            <strong>Email:</strong> ${escapeHtml(COMPANY.email)}
          </p>
          <p style="margin:18px 0 0;">Kind regards,<br />${escapeHtml(COMPANY.name)}</p>`;

      const html = renderBrandedEmail({
        siteUrl: env.siteUrl,
        preheader: subheading,
        heading,
        subheading,
        contentHtml,
      });

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
