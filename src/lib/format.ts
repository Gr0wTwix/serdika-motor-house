import { site } from "../data/site";

const price = new Intl.NumberFormat("bg-BG", { style: "currency", currency: site.currency, maximumFractionDigits: 0 });
const km = new Intl.NumberFormat("bg-BG");

export const formatPrice = (n: number) => price.format(n);
export const formatKm = (n: number) => `${km.format(n)} km`;
