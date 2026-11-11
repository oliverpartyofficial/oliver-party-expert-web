import type { EventType, ServiceId } from "./company";

export interface ServiceContent {
  id: ServiceId;
  dossier: string;
  image: string;
}

export const SERVICES: ServiceContent[] = [
  { id: "dj", dossier: "/dossiers/dj.pdf", image: "/media/service-dj.jpg" },
  { id: "lighting", dossier: "/dossiers/lighting.pdf", image: "/media/service-lighting.jpg" },
  { id: "food-trucks", dossier: "/dossiers/food-trucks.pdf", image: "/media/service-food-truck.jpg" },
  { id: "crepes", dossier: "/dossiers/crepes.pdf", image: "/media/service-crepes.jpg" },
  { id: "ice-cream", dossier: "/dossiers/ice-cream.pdf", image: "/media/service-ice-cream.jpg" },
  { id: "photobooth", dossier: "/dossiers/photobooth.pdf", image: "/media/service-photobooth.jpg" },
  { id: "neons", dossier: "/dossiers/neons.pdf", image: "/media/service-neons.jpg" },
  { id: "furniture", dossier: "/dossiers/furniture.pdf", image: "/media/service-furniture.jpg" },
  { id: "popcorn", dossier: "/dossiers/popcorn.pdf", image: "/media/service-popcorn.jpg" },
  { id: "beer-tricycle", dossier: "/dossiers/beer-tricycle.pdf", image: "/media/service-beer.jpg" },
];

export const TESTIMONIALS = [
  {
    author: "Manu",
    date: "2024-06-11",
    quoteEs:
      "Tuvo a todo el mundo bailando animado y con una selección de música increíble. Un equipo de mucha calidad, excepcional sonido e iluminación. Oliver es encantador y se involucra de una manera que te hace sentir en familia.",
    quoteEn:
      "He had everyone dancing with an incredible music selection. Outstanding sound and lighting. Oliver is charming and makes you feel like family.",
  },
  {
    author: "Irene",
    date: "2023-10-17",
    quoteEs:
      "De los mejores fotomatones que he tenido la oportunidad de disfrutar. Superó con creces nuestras expectativas, incluido el álbum con fotos y dedicatorias de los invitados.",
    quoteEn:
      "One of the best photobooths we have ever used. It exceeded our expectations, including the album with guest photos and messages.",
  },
  {
    author: "Beatriz",
    date: "2022-05-18",
    quoteEs:
      "Contratamos DJ, fotomatón, máquina de palomitas y fuegos fríos. Puedes contratar todo tipo de experiencias divertidas para tu boda con una sola persona formal, comprometida y con diversión asegurada.",
    quoteEn:
      "We booked the DJ, photobooth, popcorn machine and cold sparklers. You can hire every fun extra for your wedding from one professional, committed team.",
  },
  {
    author: "Rocio",
    date: "2023-09-24",
    quoteEs:
      "Lo conocíamos de otra boda y nos gustó su forma de trabajar, con música variada y muy pendiente de la gente. Un éxito total.",
    quoteEn:
      "We knew him from another wedding and loved how he works: mixed music and always watching the crowd. A total success.",
  },
  {
    author: "Carlos",
    date: "2022-11-16",
    quoteEs:
      "Le pedimos el juego de luces y fuego frío. De las mejores decisiones que pudimos tomar. La fiesta fue de diez.",
    quoteEn:
      "We asked for the lighting rig and cold sparklers. One of the best decisions we made. The party was a ten.",
  },
  {
    author: "Verónica",
    date: "2018-10-08",
    quoteEs:
      "Oliver es una maravilla. Se adapta a tus gustos, te aconseja y hace que todo fluya. Un gran profesional, DJ y animador.",
    quoteEn:
      "Oliver is wonderful. He adapts to your taste, advises you and makes everything flow. A great professional, DJ and host.",
  },
] as const;

/**
 * Gallery carousel: hand-picked TikTok videos plus a few photos. To add one,
 * append a line. TikToks need the full link (right-click the video on a
 * computer > "Copy link address"); photo posts (/photo/) can't be embedded.
 *   { kind: "tiktok", url: "https://www.tiktok.com/@oliverpartyexpert/video/<number>", event: "wedding" }
 *   { kind: "image", src: "/media/<file>.jpg", altEs: "…", altEn: "…" }
 * Alt text is generated from `event` in both languages unless altEs/altEn is
 * set. The first item is always shown first; the rest are shuffled per visit.
 * Photos are cropped to the 9:16 frame, so vertical photos work best.
 */
export type GalleryItem = {
  event?: EventType;
  altEs?: string;
  altEn?: string;
} & ({ kind: "tiktok"; url: string } | { kind: "image"; src: string });

/**
 * The numeric video id from a full TikTok link (browser address bar or
 * desktop "Copy link"). Short vm.tiktok.com links can't be read offline and
 * return null.
 */
export function tiktokVideoId(url: string): string | null {
  return url.match(/tiktok\.com\/@[^/]+\/video\/(\d{15,22})/)?.[1] ?? null;
}

export function galleryItemKey(item: GalleryItem): string {
  if (item.kind === "image") return item.src;
  return tiktokVideoId(item.url) ?? item.url;
}

const tiktok = (id: string): GalleryItem => ({
  kind: "tiktok",
  url: `https://www.tiktok.com/@oliverpartyexpert/video/${id}`,
});

export const GALLERY_ITEMS: GalleryItem[] = [
  { kind: "image", src: "/media/gallery-1.jpg", altEs: "Cabina telefónica iluminada de Oliver Party Expert", altEn: "Illuminated telephone booth by Oliver Party Expert" },
  { kind: "image", src: "/media/gallery-2.jpg", altEs: "Espectáculo de fuego con iluminación de escenario", altEn: "Fire performance with stage lighting" },
  { kind: "image", src: "/media/gallery-3.jpg", altEs: "Pista de baile con luces y sonido Oliver Party Expert", altEn: "Dance floor with Oliver Party Expert lights and sound" },
  { kind: "image", src: "/media/gallery-4.jpg", altEs: "Árbol de los deseos y ambientación en rojo", altEn: "Wish tree décor under red lighting" },
  { kind: "image", src: "/media/gallery-5.jpg", altEs: "Food truck de hot dogs para eventos", altEn: "Hot dog food truck for events" },
  ...[
    "7703115044007005462",
    "7702362153243741462",
    "7701122042149489942",
    "7699080616465239318",
    "7688441547351723286",
    "7685743954335141142",
    "7667922180163800342",
    "7665097489741073686",
    "7648723474143268118",
    "7642791081616084246",
    "7632626625905003798",
    "7628759637457702166",
    "7627785522605296918",
    "7625256921079106838",
    "7621958057022557462",
    "7578980518927043862",
    "7560794195687050519",
    "7520582941060156694",
    "7514939621399104790",
    "7501106404091038998",
    "7505704344872881430",
  ].map(tiktok),
];

export const FAQ = [
  { id: "when" },
  { id: "travel" },
  { id: "languages" },
  { id: "pack" },
] as const;
