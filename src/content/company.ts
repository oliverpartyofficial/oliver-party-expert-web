export const COMPANY = {
  name: "Oliver Party Expert",
  legalName: "Oliver Party Expert",
  taglineEs: "DJ, food trucks y experiencias para bodas en Málaga",
  taglineEn: "Wedding DJ, food trucks and party experiences in Malaga",
  email: "oliverpartyofficial@gmail.com",
  phone: "+34620956868",
  phoneDisplay: "+34 620 95 68 68",
  whatsapp: "https://wa.me/34620956868",
  address: {
    street: "Del Río 36 B",
    locality: "Vélez-Málaga",
    region: "Málaga",
    postalCode: "29700",
    country: "ES",
    countryName: "Spain",
  },
  geo: {
    latitude: 36.7825,
    longitude: -4.1006,
  },
  social: {
    facebook: "https://www.facebook.com/olivergarciadjevents",
    instagram: "https://www.instagram.com/oliverpartyexpert/",
    instagramHandle: "@oliverpartyexpert",
  },
  domain: "https://oliverpartyexpert.com",
  priceRange: "€€",
  languages: ["es", "en"] as const,
  areaServed: [
    "Vélez-Málaga",
    "Málaga",
    "Costa del Sol",
    "Marbella",
    "Granada",
    "Almería",
    "Cádiz",
    "Sevilla",
  ],
} as const;

export const SERVICE_IDS = [
  "dj",
  "lighting",
  "food-trucks",
  "crepes",
  "ice-cream",
  "photobooth",
  "neons",
  "furniture",
  "popcorn",
  "beer-tricycle",
] as const;

export type ServiceId = (typeof SERVICE_IDS)[number];

export const EVENT_TYPES = [
  "wedding",
  "communion",
  "birthday",
  "corporate",
  "other",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
