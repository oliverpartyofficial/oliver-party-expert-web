import { COMPANY, type EventType, type ServiceId } from "@/content/company";
import { escapeHtml, type InquiryRecord } from "@/domain/inquiry";

// Spanish labels for the values stored as enum ids, so Oliver reads a proper
// summary instead of raw codes like "wedding" or "dj".
const EVENT_TYPE_ES: Record<EventType, string> = {
  wedding: "Boda",
  communion: "Comunión",
  birthday: "Cumpleaños",
  corporate: "Corporativo",
  other: "Otro",
};

const SERVICE_ES: Record<ServiceId, string> = {
  dj: "DJ y sonido",
  lighting: "Iluminación y efectos",
  "food-trucks": "Food trucks",
  crepes: "Creperie",
  "ice-cream": "Carrito de helados",
  photobooth: "Fotomatón",
  neons: "Neones y letras LOVE",
  furniture: "Mobiliario chill-out",
  popcorn: "Palomitas y algodón",
  "beer-tricycle": "Triciclo de cerveza",
};

const COLORS = {
  ivory: "#f6f0e6",
  paper: "#fbf7f0",
  espresso: "#2a2218",
  ink: "#3c3226",
  muted: "#6d5f4e",
  gold: "#c4a36a",
  goldDark: "#9a7b45",
  line: "rgba(42, 34, 24, 0.12)",
};

const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS = "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

export function formatEventType(eventType: string): string {
  return EVENT_TYPE_ES[eventType as EventType] ?? eventType;
}

export function formatServices(services: string[]): string[] {
  return services.map((id) => SERVICE_ES[id as ServiceId] ?? id);
}

function formatEventDate(value: string): string {
  if (!value) return "Sin especificar";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return value;
  }
}

function localeLabel(locale: string): string {
  return locale === "en" ? "Inglés" : "Español";
}

function digits(value: string): string {
  return value.replace(/[^\d]/g, "");
}

// Branded shell shared by every email so both messages match the website.
export function renderBrandedEmail(opts: {
  siteUrl: string;
  preheader: string;
  heading: string;
  subheading?: string;
  contentHtml: string;
}): string {
  const { siteUrl, preheader, heading, subheading, contentHtml } = opts;
  const logo = `${siteUrl.replace(/\/$/, "")}/logo.jpg`;
  const social = COMPANY.social;

  const socialLink = (href: string, label: string) =>
    `<a href="${href}" style="display:inline-block;margin:0 4px;padding:9px 18px;border:1px solid ${COLORS.gold};border-radius:999px;color:${COLORS.goldDark};font-family:${SANS};font-size:13px;text-decoration:none;">${label}</a>`;

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:${COLORS.ivory};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${COLORS.ivory};">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.ivory};margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${COLORS.paper};border:1px solid ${COLORS.line};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:36px 32px 18px;text-align:center;">
                <img src="${logo}" width="76" height="76" alt="Oliver Party Expert" style="width:76px;height:76px;border-radius:50%;display:block;margin:0 auto 14px;border:2px solid ${COLORS.gold};" />
                <div style="font-family:${SERIF};font-size:24px;color:${COLORS.espresso};letter-spacing:0.5px;">Oliver Party Expert</div>
                <div style="font-family:${SANS};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${COLORS.goldDark};margin-top:8px;">Vélez-Málaga · Costa del Sol</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;">
                <div style="height:2px;background:${COLORS.gold};opacity:0.5;border-radius:2px;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 32px 4px;">
                <h1 style="margin:0;font-family:${SERIF};font-size:26px;font-weight:500;color:${COLORS.espresso};">${escapeHtml(heading)}</h1>
                ${subheading ? `<p style="margin:10px 0 0;font-family:${SANS};font-size:15px;line-height:1.55;color:${COLORS.muted};">${escapeHtml(subheading)}</p>` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 4px;font-family:${SANS};font-size:15px;line-height:1.6;color:${COLORS.ink};">
                ${contentHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 34px;">
                <div style="height:1px;background:${COLORS.line};margin-bottom:22px;"></div>
                <div style="text-align:center;margin-bottom:16px;">
                  ${socialLink(social.instagram, "Instagram")}${socialLink(social.facebook, "Facebook")}${socialLink(COMPANY.whatsapp, "WhatsApp")}
                </div>
                <div style="text-align:center;font-family:${SANS};font-size:12px;line-height:1.7;color:${COLORS.muted};">
                  <a href="tel:${COMPANY.phone}" style="color:${COLORS.goldDark};text-decoration:none;">${escapeHtml(COMPANY.phoneDisplay)}</a>
                  &nbsp;·&nbsp;
                  <a href="mailto:${COMPANY.email}" style="color:${COLORS.goldDark};text-decoration:none;">${escapeHtml(COMPANY.email)}</a>
                  <br />
                  ${escapeHtml(`${COMPANY.address.street}, ${COMPANY.address.postalCode} ${COMPANY.address.locality}`)}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// The rich detail block Oliver receives for each new enquiry.
export function renderInquiryDetails(inquiry: InquiryRecord): string {
  const eventTypeEs = formatEventType(inquiry.eventType);
  const servicesEs = formatServices(inquiry.services);
  const waPhone = digits(inquiry.phone);

  const chip = (label: string) =>
    `<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 12px;background:rgba(196,163,106,0.16);border:1px solid ${COLORS.gold};border-radius:999px;font-family:${SANS};font-size:13px;color:${COLORS.espresso};">${escapeHtml(label)}</span>`;

  const detailRow = (label: string, valueHtml: string) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${COLORS.line};font-family:${SANS};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${COLORS.goldDark};width:150px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:12px 0;border-bottom:1px solid ${COLORS.line};font-family:${SANS};font-size:15px;color:${COLORS.ink};vertical-align:top;">${valueHtml}</td>
    </tr>`;

  const link = (href: string, text: string) =>
    `<a href="${href}" style="color:${COLORS.goldDark};text-decoration:none;">${escapeHtml(text)}</a>`;

  return `
  <div style="margin:4px 0 20px;">
    <span style="display:inline-block;padding:7px 16px;background:${COLORS.espresso};border-radius:999px;font-family:${SANS};font-size:13px;letter-spacing:0.5px;color:${COLORS.paper};">${escapeHtml(eventTypeEs)}</span>
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    ${detailRow("Nombre", escapeHtml(inquiry.name))}
    ${detailRow("Email", link(`mailto:${inquiry.email}`, inquiry.email))}
    ${detailRow("Teléfono", `${link(`tel:${inquiry.phone}`, inquiry.phone)}${waPhone ? ` &nbsp;·&nbsp; ${link(`https://wa.me/${waPhone}`, "WhatsApp")}` : ""}`)}
    ${detailRow("Fecha del evento", escapeHtml(formatEventDate(inquiry.eventDate || "")))}
    ${detailRow("Lugar", escapeHtml(inquiry.location || "Sin especificar"))}
    ${detailRow("Idioma", escapeHtml(localeLabel(inquiry.locale)))}
  </table>

  <div style="margin:22px 0 6px;font-family:${SANS};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${COLORS.goldDark};">Servicios de interés</div>
  <div style="margin-bottom:4px;">
    ${servicesEs.length ? servicesEs.map(chip).join("") : `<span style="font-family:${SANS};font-size:15px;color:${COLORS.muted};">Sin especificar</span>`}
  </div>

  <div style="margin:22px 0 6px;font-family:${SANS};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${COLORS.goldDark};">Mensaje</div>
  <div style="padding:16px 18px;background:${COLORS.ivory};border-left:3px solid ${COLORS.gold};border-radius:0 8px 8px 0;font-family:${SANS};font-size:15px;line-height:1.65;color:${COLORS.ink};white-space:pre-wrap;">${escapeHtml(inquiry.message)}</div>

  <div style="margin:26px 0 6px;text-align:center;">
    <a href="mailto:${inquiry.email}" style="display:inline-block;padding:13px 30px;background:${COLORS.gold};border-radius:999px;font-family:${SANS};font-size:14px;color:${COLORS.espresso};text-decoration:none;">Responder a ${escapeHtml(inquiry.name)}</a>
  </div>`;
}
