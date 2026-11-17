import { vehicles, vehicleTitle } from "../data/vehicles";
import { formatPrice } from "../lib/format";
import { INVENTORY_HREF, vehicleHref } from "../lib/router";
import { ArrowRight, ArrowUpRight } from "./Icons";
import { Img } from "./Img";
import { SpecLine } from "./VehicleCard";

/** Makes strip + featured vehicles. The make buttons pre-filter the inventory. */
export function MakesStrip({ onPickMake }: { onPickMake: (make: string) => void }) {
  const counts = vehicles.reduce<Record<string, number>>((acc, v) => ({ ...acc, [v.make]: (acc[v.make] ?? 0) + 1 }), {});
  return (
    <section aria-label="Makes in stock" className="theme-dark border-t border-white/10 bg-ink">
      <div className="container-wide">
        <ul
          className="no-scrollbar -mx-4 flex snap-x overflow-x-auto px-4 lg:mx-0 lg:grid lg:px-0"
          style={{ gridTemplateColumns: `repeat(${Object.keys(counts).length}, minmax(0, 1fr))` }}
        >
          {Object.entries(counts).map(([make, n], i) => (
            <li key={make} className={`shrink-0 snap-start ${i > 0 ? "border-l border-white/10" : ""}`}>
              <button
                type="button"
                onClick={() => onPickMake(make)}
                className="group flex h-24 w-full min-w-36 flex-col items-start justify-center px-5 text-left md:px-6"
                aria-label={`Show ${n} ${make} ${n === 1 ? "car" : "cars"} in the inventory`}
              >
                <span className="font-display text-lg tracking-tight text-paper/70 transition-colors group-hover:text-paper">{make}</span>
                <span className="mt-1 text-xs text-muted">{n} in stock</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Featured() {
  const featured = vehicles.filter((v) => v.featured);
  const [lead, ...rest] = featured;
  if (!lead) return null;
  return (
    <section aria-labelledby="featured-title" className="theme-light section-y bg-paper text-ink">
      <div className="container-wide">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
          <div>
            <p className="eyebrow text-muted-ink">Featured</p>
            <h2 id="featured-title" className="h-section mt-4 max-w-[16ch]">
              Three cars worth the trip this month
            </h2>
          </div>
          <a href={INVENTORY_HREF} className="inline-flex min-h-11 items-center gap-2 self-start text-[0.9375rem] font-semibold md:self-auto">
            <span className="link-underline">View all {vehicles.length} vehicles</span> <ArrowRight />
          </a>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:mt-16">
          {/* Lead vehicle: wide cinematic frame with caption overlay */}
          <a href={vehicleHref(lead.slug)} className="group relative block md:col-span-2" data-reveal>
            <div className="zoom-frame relative aspect-[4/5] bg-ink sm:aspect-[16/10] lg:aspect-[21/9]">
              <Img photo={lead.photos[0]!} sizes="100vw" style={{ objectPosition: "50% 82%" }} />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
              <div className="theme-dark absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 text-paper sm:flex-row sm:items-end sm:justify-between sm:p-8">
                <div>
                  <p className="eyebrow text-silver">{lead.make}</p>
                  <h3 className="mt-2 text-4xl tracking-tight sm:text-5xl">{lead.model}</h3>
                  <SpecLine v={lead} className="mt-4 text-paper/75" />
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-display text-2xl tracking-tight">{formatPrice(lead.price)}</p>
                  <span className="grid size-12 place-items-center rounded-full bg-paper text-ink transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight />
                  </span>
                </div>
              </div>
              <span className="sr-only">View details for {vehicleTitle(lead)}</span>
            </div>
          </a>

          {rest.map((v, i) => (
            <a
              key={v.slug}
              href={vehicleHref(v.slug)}
              className="group block"
              data-reveal
              style={{ ["--reveal-delay" as string]: `${(i + 1) * 120}ms` }}
            >
              <div className="zoom-frame relative aspect-[16/10] bg-paper-2">
                <Img photo={v.photos[0]!} sizes="(min-width: 768px) 48vw, 100vw" maxWidth={1920} />
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-muted-ink">{v.make}</p>
                  <h3 className="h-card mt-2">{v.model}</h3>
                </div>
                <p className="shrink-0 pt-6 font-display text-lg font-medium tracking-tight">{formatPrice(v.price)}</p>
              </div>
              <SpecLine v={v} className="mt-4 border-t border-ink/10 pt-4 text-muted-ink" />
              <span className="sr-only">View details for {vehicleTitle(v)}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
