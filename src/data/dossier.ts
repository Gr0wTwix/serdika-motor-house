import type { Vehicle } from "./types";

/**
 * SAMPLE vehicle dossier: inspection, service history and warranty.
 * Generated from each demo car's year and mileage so every listing shows the kind of
 * evidence a real one should carry. Replace with the actual report for each car before launch.
 */

export interface InspectionItem {
  area: string;
  result: string;
  status: "good" | "note";
}

export interface ServiceEntry {
  date: string;
  km: number;
  work: string;
}

export interface Dossier {
  inspection: InspectionItem[];
  history: ServiceEntry[];
  warranty: { title: string; body: string };
  /** Photo views a full listing should include; shown as "available on request" in the demo. */
  photoSet: string[];
}

/** Stable small number per car, so the sample data does not change between visits. */
const seed = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

const SERVICE_INTERVAL_KM = 15000;

export function getDossier(v: Vehicle, now = new Date(2026, 10, 1)): Dossier {
  const n = seed(v.slug);
  const ageYears = Math.max(1, now.getFullYear() - v.year);
  const tread = 5 + (n % 3); // mm
  const pads = 60 + (n % 4) * 10; // % remaining
  const paint = 95 + (n % 30); // µm average
  const performance = v.category === "sports";

  const inspection: InspectionItem[] = [
    { area: "Paint and bodywork", result: `Factory paint throughout, average ${paint} µm. No accident repair found.`, status: "good" },
    { area: "Tyres", result: `${tread}.${n % 10} mm tread on all four, matching brand.`, status: tread >= 6 ? "good" : "note" },
    { area: "Brakes", result: `Pads ${pads}% remaining front and rear, discs within limits.`, status: pads >= 70 ? "good" : "note" },
    { area: "Diagnostic scan", result: "No stored fault codes after a full scan.", status: "good" },
    {
      area: v.fuel === "Electric" ? "High-voltage battery" : "Engine and gearbox",
      result: v.fuel === "Electric" ? `State of health ${94 - (n % 4)}%, measured at the inspection.` : "No leaks, cold start and gear changes normal on the road test.",
      status: "good",
    },
    {
      area: "Interior",
      result: n % 2 ? "Light wear on the driver's seat bolster, otherwise as new." : "Clean, no wear or damage worth noting.",
      status: n % 2 ? "note" : "good",
    },
  ];

  // One service per interval or per year, whichever came first, newest first.
  const count = Math.max(1, Math.min(6, Math.max(Math.round(v.mileageKm / SERVICE_INTERVAL_KM), ageYears)));
  const history: ServiceEntry[] = Array.from({ length: count }, (_, i) => {
    const step = count - i; // newest first
    const km = Math.round(((v.mileageKm * step) / (count + 0.3)) / 100) * 100;
    const year = v.year + Math.round(((now.getFullYear() - v.year) * step) / (count + 0.3));
    const month = ((n + i * 5) % 12) + 1;
    const big = step % 2 === 0;
    const work = big
      ? v.fuel === "Electric"
        ? "Major service: brake fluid, cabin filter, battery health check"
        : `Major service: oil and filters, ${v.fuel === "Diesel" ? "fuel filter" : "spark plugs"}${performance ? ", brake fluid" : ""}`
      : v.fuel === "Electric"
        ? "Annual inspection and software update"
        : "Oil and filter service, inspection";
    return { date: `${String(month).padStart(2, "0")}/${Math.min(year, now.getFullYear())}`, km, work };
  });

  const factoryLeft = Math.max(0, v.year + (v.make === "Toyota" ? 5 : 3) - now.getFullYear());
  const warranty =
    factoryLeft > 0
      ? {
          title: `Manufacturer warranty until ${v.year + (v.make === "Toyota" ? 5 : 3)}`,
          body: "The remaining factory warranty transfers with the car. Extended cover can be added from the end date.",
        }
      : {
          title: "12-month dealer warranty included",
          body: "Covers engine, gearbox and electrics. Extended cover of up to 36 months is available, priced on request.",
        };

  return {
    inspection,
    history,
    warranty,
    photoSet: ["Front and rear", "Both sides", "Dashboard and odometer", "Front seats", "Rear seats", "Boot", "Wheels and tyres", "Engine bay", "Close-ups of any marks"],
  };
}
