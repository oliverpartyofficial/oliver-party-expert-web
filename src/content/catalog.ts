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
 * Gallery carousel items. To add one, append a line:
 *   { kind: "image", src: "/media/<file>.jpg", event: "wedding" }
 *   { kind: "youtube", youtubeId: "<11-char id from the URL>", event: "corporate" }
 *   { kind: "tiktok", url: "https://www.tiktok.com/@<user>/video/<number>", event: "wedding" }
 * Alt text is generated from `event` in both languages; pass altEs/altEn
 * only when you want a more specific description.
 */
export type GalleryItem = {
  event?: EventType;
  altEs?: string;
  altEn?: string;
} & (
  | { kind: "image"; src: string }
  | { kind: "youtube"; youtubeId: string; poster?: string }
  | { kind: "tiktok"; url: string }
);

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
  if (item.kind === "youtube") return item.youtubeId;
  return "tiktok:" + (tiktokVideoId(item.url) ?? item.url);
}

export function youtubePoster(item: Extract<GalleryItem, { kind: "youtube" }>): string {
  return item.poster ?? `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    kind: "image",
    src: "/media/gallery-1.jpg",
    altEs: "Cabina telefónica iluminada de Oliver Party Expert",
    altEn: "Illuminated telephone booth by Oliver Party Expert",
  },
  {
    kind: "image",
    src: "/media/gallery-2.jpg",
    altEs: "Espectáculo de fuego con iluminación de escenario",
    altEn: "Fire performance with stage lighting",
  },
  {
    kind: "image",
    src: "/media/gallery-3.jpg",
    altEs: "Pista de baile con luces y sonido Oliver Party Expert",
    altEn: "Dance floor with Oliver Party Expert lights and sound",
  },
  {
    kind: "image",
    src: "/media/gallery-4.jpg",
    altEs: "Árbol de los deseos y ambientación en rojo",
    altEn: "Wish tree décor under red lighting",
  },
  {
    kind: "image",
    src: "/media/gallery-5.jpg",
    altEs: "Food truck de hot dogs para eventos",
    altEn: "Hot dog food truck for events",
  },
  {
    kind: "image",
    src: "/media/service-neons.jpg",
    altEs: "Neones y letras luminosas para bodas",
    altEn: "Neon signs and lit letters for weddings",
  },
  {
    kind: "image",
    src: "/media/service-ice-cream.jpg",
    altEs: "Carrito de helados para bodas",
    altEn: "Ice cream trolley for weddings",
  },
  {
    kind: "image",
    src: "/media/service-photobooth.jpg",
    altEs: "Fotomatón para fiestas y bodas",
    altEn: "Photobooth for parties and weddings",
  },
  { kind: "youtube", youtubeId: "ZxkUzuG64zE", event: "corporate" },
];

export const FAQ = [
  { id: "when" },
  { id: "travel" },
  { id: "languages" },
  { id: "pack" },
] as const;
