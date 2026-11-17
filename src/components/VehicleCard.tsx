import type { Vehicle } from "../data/types";
import { vehicleTitle } from "../data/vehicles";
import { formatKm, formatPrice } from "../lib/format";
import { vehicleHref } from "../lib/router";
import { Img } from "./Img";

export function SpecLine({ v, className = "" }: { v: Vehicle; className?: string }) {
  const items = [String(v.year), formatKm(v.mileageKm), v.fuel, v.transmission];
  return (
    <ul className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${className}`} aria-label="Key specifications">
      {items.map((t, i) => (
        <li key={t} className="flex items-center gap-3">
          {i > 0 && <span aria-hidden className="h-3 w-px bg-current opacity-30" />}
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Standard inventory card: photo first, then model, price and essential specs. */
export function VehicleCard({ v, sizes, theme = "light" }: { v: Vehicle; sizes: string; theme?: "light" | "dark" }) {
  const photo = v.photos[0]!;
  const muted = theme === "light" ? "text-muted-ink" : "text-muted";
  return (
    <a href={vehicleHref(v.slug)} className="group block">
      <div className="zoom-frame relative aspect-[4/3] bg-paper-2">
        <Img photo={photo} sizes={sizes} maxWidth={1440} />
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={`eyebrow ${muted}`}>{v.make}</p>
          <h3 className="h-card mt-2">
            {v.model}
            {v.variant && <span className={muted}> {v.variant}</span>}
          </h3>
        </div>
        <p className="shrink-0 pt-6 font-display text-lg font-medium tracking-tight">{formatPrice(v.price)}</p>
      </div>
      <SpecLine v={v} className={`mt-4 border-t pt-4 ${theme === "light" ? "border-ink/10" : "border-white/10"} ${muted}`} />
      <span className="sr-only">View details for {vehicleTitle(v)}</span>
    </a>
  );
}
