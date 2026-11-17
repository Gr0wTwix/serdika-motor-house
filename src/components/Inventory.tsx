import { useId, useMemo, useRef } from "react";
import type { Category, Fuel } from "../data/types";
import { categories, makes, vehicles } from "../data/vehicles";
import { Close, Sliders } from "./Icons";
import { useInquiry } from "./Inquiry";
import { VehicleCard } from "./VehicleCard";

export type SortKey = "featured" | "price-asc" | "price-desc" | "year-desc" | "km-asc";

export interface Filters {
  category: "all" | Category;
  make: string; // "" = any
  fuel: "" | Fuel;
  /** Maximum price in EUR; 0 = any */
  priceMax: number;
  /** Earliest model year; 0 = any */
  yearMin: number;
  /** Maximum mileage in km; 0 = any */
  kmMax: number;
  sort: SortKey;
}

export const defaultFilters: Filters = { category: "all", make: "", fuel: "", priceMax: 0, yearMin: 0, kmMax: 0, sort: "featured" };

const PRICE_STEPS = [50000, 75000, 100000, 150000, 200000];
const YEAR_STEPS = [2014, 2018, 2020, 2022, 2024];
const KM_STEPS = [20000, 40000, 60000, 100000];
const eur = (n: number) => `${new Intl.NumberFormat("bg-BG").format(n)} €`;
const km = (n: number) => `${new Intl.NumberFormat("bg-BG").format(n)} km`;

const SORT_IDS: SortKey[] = ["featured", "price-asc", "price-desc", "year-desc", "km-asc"];
const CATEGORY_IDS = categories.map((c) => c.id);

/** Reads filters from the inventory URL, e.g. /?page=inventory&make=BMW&price=100000 */
export function filtersFromSearch(search: string): Filters {
  const p = new URLSearchParams(search);
  const num = (k: string) => {
    const n = Number(p.get(k));
    return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
  };
  const cat = p.get("type") ?? "all";
  const make = p.get("make") ?? "";
  const fuel = p.get("fuel") ?? "";
  const sort = (p.get("sort") ?? "featured") as SortKey;
  return {
    category: (CATEGORY_IDS as string[]).includes(cat) ? (cat as Filters["category"]) : "all",
    make: makes.includes(make) ? make : "",
    fuel: (fuels as string[]).includes(fuel) ? (fuel as Fuel) : "",
    priceMax: num("price"),
    yearMin: num("year"),
    kmMax: num("km"),
    sort: SORT_IDS.includes(sort) ? sort : "featured",
  };
}

/** Writes filters to an inventory query string; defaults are left out so URLs stay short. */
export function filtersToSearch(f: Filters): string {
  const p = new URLSearchParams({ page: "inventory" });
  if (f.category !== "all") p.set("type", f.category);
  if (f.make) p.set("make", f.make);
  if (f.fuel) p.set("fuel", f.fuel);
  if (f.priceMax) p.set("price", String(f.priceMax));
  if (f.yearMin) p.set("year", String(f.yearMin));
  if (f.kmMax) p.set("km", String(f.kmMax));
  if (f.sort !== "featured") p.set("sort", f.sort);
  return "?" + p.toString();
}

/** One removable chip per active filter. */
function activeChips(f: Filters): { key: keyof Filters; label: string }[] {
  const chips: { key: keyof Filters; label: string }[] = [];
  if (f.category !== "all") chips.push({ key: "category", label: categories.find((c) => c.id === f.category)?.label ?? f.category });
  if (f.make) chips.push({ key: "make", label: f.make });
  if (f.fuel) chips.push({ key: "fuel", label: f.fuel });
  if (f.priceMax) chips.push({ key: "priceMax", label: `Up to ${eur(f.priceMax)}` });
  if (f.yearMin) chips.push({ key: "yearMin", label: `${f.yearMin} or newer` });
  if (f.kmMax) chips.push({ key: "kmMax", label: `Under ${km(f.kmMax)}` });
  return chips;
}

/** Turns the current filters into a ready-to-send "find me a car" request. */
export function describeSearch(f: Filters): string {
  const type = f.category === "suv" ? "SUV" : f.category === "sports" ? "sports car or GT" : f.category === "saloon" ? "saloon or estate" : f.make ? "" : "car";
  const fuel = f.fuel ? `${f.fuel === "Electric" ? "an electric" : `a ${f.fuel.toLowerCase()}`} ` : "a ";
  let text = `I'm looking for ${fuel}${f.make ? `${f.make} ` : ""}${type}`.trimEnd().replace(/^I'm looking for a (SUV|[aeiou])/i, "I'm looking for an $1");
  const extra = [
    f.priceMax && `with a budget of up to ${eur(f.priceMax)}`,
    f.yearMin && `${f.yearMin} or newer`,
    f.kmMax && `under ${km(f.kmMax)}`,
  ].filter(Boolean);
  if (extra.length) text += `, ${extra.join(", ")}`;
  return `${text}.`;
}

const SORTS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Latest arrivals" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "year-desc", label: "Year: newest first" },
  { id: "km-asc", label: "Mileage: lowest first" },
];

const fuels = Array.from(new Set(vehicles.map((v) => v.fuel)));

export function applyFilters(f: Filters) {
  const list = vehicles.filter(
    (v) =>
      (f.category === "all" || v.category === f.category) &&
      (!f.make || v.make === f.make) &&
      (!f.fuel || v.fuel === f.fuel) &&
      (!f.priceMax || v.price <= f.priceMax) &&
      (!f.yearMin || v.year >= f.yearMin) &&
      (!f.kmMax || v.mileageKm <= f.kmMax),
  );
  const sorted = [...list];
  switch (f.sort) {
    case "price-asc": sorted.sort((a, b) => a.price - b.price); break;
    case "price-desc": sorted.sort((a, b) => b.price - a.price); break;
    case "year-desc": sorted.sort((a, b) => b.year - a.year); break;
    case "km-asc": sorted.sort((a, b) => a.mileageKm - b.mileageKm); break;
    // Default: featured cars already lead the home page, so the full list opens with the rest of the stock.
    default: sorted.sort((a, b) => Number(!!a.featured) - Number(!!b.featured));
  }
  return sorted;
}

function SortControl({ f, set, idPrefix, compact }: { f: Filters; set: (p: Partial<Filters>) => void; idPrefix: string; compact?: boolean }) {
  return (
    <div>
      <label
        className={compact ? "mb-1 block text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-ink" : "field-label"}
        htmlFor={`${idPrefix}-sort`}
      >
        Sort by
      </label>
      <select id={`${idPrefix}-sort`} className="field" value={f.sort} onChange={(e) => set({ sort: e.target.value as SortKey })}>
        {SORTS.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}

function SelectControls({ f, set, idPrefix, stacked }: { f: Filters; set: (p: Partial<Filters>) => void; idPrefix: string; stacked?: boolean }) {
  // Desktop: one compact row with small persistent labels above each control.
  const cls = stacked ? "grid gap-5" : "grid grid-cols-6 gap-3";
  const lab = stacked ? "field-label" : "mb-1 block text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-ink";
  return (
    <div className={cls}>
      <div>
        <label className={lab} htmlFor={`${idPrefix}-price`}>Budget</label>
        <select id={`${idPrefix}-price`} className="field" value={f.priceMax} onChange={(e) => set({ priceMax: Number(e.target.value) })}>
          <option value={0}>Any price</option>
          {PRICE_STEPS.map((n) => (
            <option key={n} value={n}>Up to {eur(n)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={lab} htmlFor={`${idPrefix}-year`}>Year</label>
        <select id={`${idPrefix}-year`} className="field" value={f.yearMin} onChange={(e) => set({ yearMin: Number(e.target.value) })}>
          <option value={0}>Any year</option>
          {YEAR_STEPS.map((n) => (
            <option key={n} value={n}>{n} or newer</option>
          ))}
        </select>
      </div>
      <div>
        <label className={lab} htmlFor={`${idPrefix}-km`}>Mileage</label>
        <select id={`${idPrefix}-km`} className="field" value={f.kmMax} onChange={(e) => set({ kmMax: Number(e.target.value) })}>
          <option value={0}>Any mileage</option>
          {KM_STEPS.map((n) => (
            <option key={n} value={n}>Up to {km(n)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={lab} htmlFor={`${idPrefix}-make`}>Make</label>
        <select id={`${idPrefix}-make`} className="field" value={f.make} onChange={(e) => set({ make: e.target.value })}>
          <option value="">All makes</option>
          {makes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={lab} htmlFor={`${idPrefix}-fuel`}>Fuel</label>
        <select id={`${idPrefix}-fuel`} className="field" value={f.fuel} onChange={(e) => set({ fuel: e.target.value as Filters["fuel"] })}>
          <option value="">Any fuel</option>
          {fuels.map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>
      </div>
      <SortControl f={f} set={set} idPrefix={idPrefix} compact={!stacked} />
    </div>
  );
}

export function Inventory({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  const uid = useId();
  const sheetRef = useRef<HTMLDialogElement>(null);
  const openInquiry = useInquiry();
  const results = useMemo(() => applyFilters(filters), [filters]);
  const set = (p: Partial<Filters>) => setFilters({ ...filters, ...p });
  const activeCount = [filters.make, filters.fuel, filters.priceMax, filters.yearMin, filters.kmMax, filters.sort !== "featured"].filter(Boolean).length;
  const chips = activeChips(filters);
  const summary = [
    filters.make && `from ${filters.make}`,
    filters.priceMax && `up to ${eur(filters.priceMax)}`,
    filters.yearMin && `${filters.yearMin} or newer`,
    filters.kmMax && `under ${km(filters.kmMax)}`,
  ].filter(Boolean).join(", ");

  return (
    <section id="inventory" aria-labelledby="inventory-title" className="theme-light bg-paper pb-24 pt-6 text-ink lg:pb-36 lg:pt-10">
      <div className="container-wide">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div>
            <p className="eyebrow text-muted-ink">Inventory</p>
            <h1 id="inventory-title" className="h-section mt-2">In the showroom now</h1>
          </div>
          <p className="max-w-md text-sm text-muted-ink">
            Sample inventory for this demo. Prices are illustrative, in line with similar cars on the Bulgarian market.
          </p>
        </div>

        {/* Toolbar */}
        <div className="sticky top-[4.5rem] z-20 -mx-4 mt-6 border-y border-ink/10 bg-paper px-4 lg:top-20 lg:mx-0 lg:px-0">
          <div className="flex items-center justify-between gap-4 py-3 lg:pb-1 lg:pt-2">
            <div role="group" aria-label="Category" className="no-scrollbar chip-fade -my-1 flex gap-2 overflow-x-auto py-1 pr-6 lg:pr-0">
              {categories.map((c) => {
                const active = filters.category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => set({ category: c.id })}
                    className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
                      active ? "bg-ink text-paper" : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="btn btn-ghost-light min-h-11 shrink-0 px-4 text-sm lg:hidden"
              aria-haspopup="dialog"
              onClick={() => sheetRef.current?.showModal()}
            >
              <Sliders /> Filters{activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-ink text-[0.6875rem] text-paper">{activeCount}</span>}
            </button>
          </div>
          <div className="hidden pb-3 pt-1 lg:block">
            <SelectControls f={filters} set={set} idPrefix={`${uid}-d`} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p aria-live="polite" className="text-sm text-muted-ink">
              <strong className="font-semibold text-ink">{results.length}</strong> {results.length === 1 ? "vehicle" : "vehicles"}
              {summary && <span className="sr-only"> {summary}</span>}
            </p>
            {chips.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Active filters">
                {chips.map((c) => (
                  <li key={c.key}>
                    <button
                      type="button"
                      onClick={() => set({ [c.key]: defaultFilters[c.key] } as Partial<Filters>)}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-ink/15 bg-paper-2 py-1 pl-3.5 pr-2.5 text-sm font-medium transition-colors hover:border-ink/40"
                      aria-label={`Remove filter: ${c.label}`}
                    >
                      {c.label}
                      <Close width={14} height={14} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {chips.length > 1 && (
            <button type="button" className="min-h-11 text-sm font-semibold link-underline" onClick={() => setFilters({ ...defaultFilters, sort: filters.sort })}>
              Clear filters
            </button>
          )}
        </div>

        {results.length > 0 ? (
          <ul className="mt-5 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((v) => (
              <li key={v.slug}>
                <VehicleCard v={v} sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 grid place-items-start gap-5 border border-ink/10 px-6 py-14 sm:px-12">
            <h3 className="h-card">No cars match these filters right now</h3>
            <p className="max-w-lg text-muted-ink">
              Stock changes every week. Clear the filters to see everything, or tell us what you want and we will look for it.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn btn-ink" onClick={() => setFilters(defaultFilters)}>
                Show all vehicles
              </button>
              <button type="button" className="btn btn-ghost-light" onClick={() => openInquiry({ mode: "search", message: describeSearch(filters) })}>
                Ask us to find one
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile filter sheet */}
      <dialog
        ref={sheetRef}
        aria-labelledby={`${uid}-sheet-title`}
        className="sheet theme-light mx-0 mb-0 mt-auto max-h-[85dvh] w-full max-w-none bg-paper p-0 text-ink"
        onClick={(e) => {
          if (e.target === sheetRef.current) sheetRef.current?.close();
        }}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h2 id={`${uid}-sheet-title`} className="text-2xl">Filters</h2>
          <button type="button" className="grid size-11 place-items-center rounded-full hover:bg-ink/5" aria-label="Close filters" onClick={() => sheetRef.current?.close()}>
            <Close />
          </button>
        </div>
        <div className="px-5 py-6">
          <SelectControls f={filters} set={set} idPrefix={`${uid}-m`} stacked />
        </div>
        <div className="sticky bottom-0 flex gap-3 border-t border-ink/10 bg-paper px-5 py-4">
          <button type="button" className="btn btn-ghost-light flex-1" onClick={() => setFilters({ ...defaultFilters, category: filters.category })}>
            Reset
          </button>
          <button type="button" className="btn btn-ink flex-[2]" onClick={() => sheetRef.current?.close()}>
            Show {results.length} {results.length === 1 ? "vehicle" : "vehicles"}
          </button>
        </div>
      </dialog>
    </section>
  );
}
