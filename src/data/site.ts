import type { Photo } from "./types";

/**
 * Central brand + business data. Everything here is DEMO content for a fictional
 * dealership. Replace with the real business's details before launch.
 * Fields left as `null` are rendered as "to be confirmed" rather than invented.
 */
export const site = {
  demo: true,
  name: "Serdika Motor House",
  shortName: "Serdika",
  tagline: "Curated performance and luxury cars",
  city: "Sofia",
  country: "Bulgaria",
  currency: "EUR",
  contact: {
    phone: null as string | null,
    email: null as string | null,
    whatsapp: null as string | null,
    street: null as string | null,
    postcode: null as string | null,
  },
  /** Demo opening hours. */
  hours: [
    { days: "Monday – Friday", time: "09:00 – 18:30" },
    { days: "Saturday", time: "10:00 – 16:00" },
    { days: "Sunday", time: "By appointment" },
  ],
  /** Time slots offered in the visit form. */
  visitSlots: ["09:30", "11:00", "13:30", "15:00", "16:30"],
};

export const nav = [
  { label: "Inventory", href: "/?page=inventory", page: "inventory" },
  { label: "Services", href: "/#services", page: null },
  { label: "Sell or trade", href: "/?page=sell", page: "sell" },
  { label: "About", href: "/#about", page: null },
  { label: "Visit", href: "/#visit", page: null },
] as const;

export const HERO_PHOTO: Photo = {
  id: "photo-1740775525864-d8cc2ec1983e",
  alt: "Overhead view of a showroom floor with a grey Porsche 911 on red wheels among other sports cars",
  ratio: 1.5,
  focus: "50% 55%",
  credit: "Unsplash",
};

export const SELL_PHOTO: Photo = {
  id: "photo-1770901157799-75ac60e5758e",
  alt: "A hand holding a Porsche key behind a black Porsche 911 in the snow",
  ratio: 0.75,
  focus: "50% 45%",
};

export const STORY_PHOTO: Photo = {
  id: "photo-1599912027667-755b68b4dd3b",
  alt: "Wood-trimmed dashboard and centre console of a luxury car",
  ratio: 0.8,
  focus: "50% 40%",
};

