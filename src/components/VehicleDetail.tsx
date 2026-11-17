import { useEffect, useMemo, useRef, useState } from "react";
import { Lightbox } from "./Lightbox";
import { getDossier } from "../data/dossier";
import { site } from "../data/site";
import type { Vehicle } from "../data/types";
import { vehicles, vehicleTitle } from "../data/vehicles";
import { formatKm, formatPrice } from "../lib/format";
import { ArrowLeft, Check } from "./Icons";
import { Img } from "./Img";
import { useInquiry } from "./Inquiry";
import { VehicleCard } from "./VehicleCard";
import { INVENTORY_HREF, inventoryReturnHref } from "../lib/router";

/**
 * Related cars ranked by how a buyer would compare them: price first, then intended use.
 * SUVs and saloons/estates are both family cars; sports cars and GTs are a different purchase.
 */
function similarVehicles(v: Vehicle, count = 3) {
  const family = (x: Vehicle) => x.category !== "sports";
  const score = (x: Vehicle) => {
    const price = Math.abs(Math.log(x.price / v.price)); // 0 = same price; 0.69 = double or half
    const use = x.category === v.category ? 0 : family(x) === family(v) ? 0.25 : 0.8;
    return price + use;
  };
  return vehicles
    .filter((x) => x.slug !== v.slug)
    .sort((a, b) => score(a) - score(b))
    .slice(0, count);
}

export function VehicleDetail({ v }: { v: Vehicle }) {
  const openInquiry = useInquiry();
  const [active, setActive] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaGone, setCtaGone] = useState(false);

  // Show the compact enquiry bar (phones) once the main buttons have scrolled away.
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const el = ctaRef.current;
      // 80px = fixed header height; buttons tucked under the header count as gone.
      if (el) setCtaGone(el.getBoundingClientRect().bottom < 80);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [v.slug]);
  const title = vehicleTitle(v);

  useEffect(() => {
    setActive(0);
    const prevTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.content ?? "";
    document.title = `${v.year} ${title} — ${formatPrice(v.price)} | ${site.name} (demo)`;
    if (meta) meta.content = `${v.year} ${title}, ${formatKm(v.mileageKm)}, ${v.fuel.toLowerCase()}, ${v.transmission.toLowerCase()}. ${v.summary} Sample listing on a demo website.`;
    return () => {
      document.title = prevTitle;
      if (meta) meta.content = prevDesc;
    };
  }, [v, title]);

  const photo = v.photos[active] ?? v.photos[0]!;
  const dossier = useMemo(() => getDossier(v), [v]);
  const requestPhotos = () =>
    openInquiry({
      mode: "photos",
      vehicleSlug: v.slug,
      copy: {
        intro: `We will email you every view of this car (${dossier.photoSet.slice(2).join(", ").toLowerCase()}), usually within one working day.`,
      },
    });
  const specs: [string, string][] = [
    ["Year", String(v.year)],
    ["Mileage", formatKm(v.mileageKm)],
    ["Fuel", v.fuel],
    ["Transmission", v.transmission],
    ["Body style", v.bodyStyle],
    ["Engine", v.engine],
    ["Power", `${v.powerPs} PS`],
    ["Drivetrain", v.drivetrain],
    ["Acceleration", v.acceleration],
    ["Exterior", v.exterior],
    ["Interior", v.interior],
    ["Previous owners", String(v.owners)],
  ];
  const similar = useMemo(() => similarVehicles(v), [v]);

  return (
    <main id="main" className="theme-light bg-paper pt-[4.5rem] text-ink max-lg:pb-20 lg:pt-20">
      <div className="container-wide pt-8 lg:pt-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-3 text-sm text-muted-ink">
          <a href={inventoryReturnHref()} className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink">
            <ArrowLeft /> <span className="link-underline">Inventory</span>
          </a>
          <span aria-hidden>/</span>
          <span aria-current="page">{title}</span>
        </nav>
      </div>

      <div className="container-wide grid gap-10 pb-20 pt-6 lg:grid-cols-12 lg:gap-12 lg:pb-32">
        {/* Gallery */}
        <div className="lg:col-span-8">
          <button
            type="button"
            onClick={() => setViewer(active)}
            aria-label={`Open full-screen gallery, photo ${active + 1} of ${v.photos.length}`}
            className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-paper-2 sm:aspect-[16/10]"
          >
            <Img key={photo.id} photo={photo} sizes="(min-width: 1024px) 64vw, 100vw" priority className="transition-transform duration-500 group-hover:scale-[1.02]" />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-ink/75 px-3.5 py-2 text-xs font-semibold text-paper backdrop-blur">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
              </svg>
              {active + 1} / {v.photos.length} · View full screen
            </span>
          </button>
          <Lightbox photos={v.photos} index={viewer} onIndex={(i) => { setViewer(i); setActive(i); }} onClose={() => setViewer(null)} label={title} />
          {v.photos.length > 1 && (
            <ul className="mt-3 grid grid-cols-4 gap-2 sm:flex sm:gap-3" aria-label="Gallery">
              {v.photos.map((p, i) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show photo ${i + 1} of ${v.photos.length}`}
                    aria-current={i === active}
                    className={`relative block aspect-[4/3] w-full overflow-hidden bg-paper-2 transition-opacity sm:w-32 ${
                      i === active ? "outline-2 outline-offset-2 outline-ink" : "opacity-85 hover:opacity-100"
                    }`}
                  >
                    <Img photo={p} sizes="128px" maxWidth={480} alt="" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 flex flex-col gap-2 border border-ink/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className="text-sm text-muted-ink">
              <strong className="font-semibold text-ink">Full photo set on request:</strong>{" "}
              {dossier.photoSet.slice(2).join(", ").toLowerCase()}.
            </p>
            <button
              type="button"
              className="min-h-11 shrink-0 self-start text-sm font-semibold link-underline sm:self-auto"
              onClick={requestPhotos}
            >
              Request photos
            </button>
          </div>
        </div>

        {/* Summary + CTA */}
        <aside className="lg:col-span-4" aria-labelledby="vehicle-title">
          <div className="lg:sticky lg:top-28">
            <h1 id="vehicle-title" className="text-4xl tracking-tight sm:text-5xl">
              <span className="eyebrow mb-3 block text-muted-ink">{v.make}</span>
              <span className="sr-only"> </span>
              {v.model}
              {v.variant && <span className="block text-2xl text-muted-ink sm:text-3xl">{v.variant}</span>}
            </h1>
            <p className="mt-6 font-display text-3xl font-medium tracking-tight">{formatPrice(v.price)}</p>
            <p className="mt-1 text-sm text-muted-ink">Illustrative demo price · sample listing</p>

            <ul className="mt-8 grid grid-cols-2 border-t border-ink/10">
              {[
                ["Year", String(v.year)],
                ["Mileage", formatKm(v.mileageKm)],
                ["Fuel", v.fuel],
                ["Gearbox", v.transmission],
              ].map(([k, val], i) => (
                <li key={k} className={`border-b border-ink/10 py-4 ${i % 2 ? "pl-5" : "border-r pr-5"}`}>
                  <span className="block text-xs text-muted-ink">{k}</span>
                  <span className="mt-1 block font-semibold">{val}</span>
                </li>
              ))}
            </ul>

            <p className="mt-8 leading-relaxed text-muted-ink">{v.summary}</p>

            <div ref={ctaRef} className="mt-8 grid gap-3">
              <button type="button" className="btn btn-ink w-full" onClick={() => openInquiry({ mode: "vehicle", vehicleSlug: v.slug })}>
                Enquire about this car
              </button>
              <button type="button" className="btn btn-ghost-light w-full" onClick={() => openInquiry({ mode: "visit", vehicleSlug: v.slug })}>
                Book a viewing
              </button>
            </div>
          </div>
        </aside>

        {/* Specs, features and evidence on the left; a compact sticky enquiry panel on the right */}
        <div className="grid min-w-0 grid-cols-1 gap-16 lg:col-span-8">
        <section aria-labelledby="specs-title">
          <h2 id="specs-title" className="text-3xl tracking-tight">Specification</h2>
          <dl className="mt-6 grid border-t border-ink/10 sm:grid-cols-2 sm:gap-x-10">
            {specs.map(([k, val]) => (
              <div key={k} className="flex justify-between gap-6 border-b border-ink/10 py-4 text-[0.9375rem]">
                <dt className="text-muted-ink">{k}</dt>
                <dd className="text-right font-medium">{val}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted-ink">Specifications are representative of the model generation shown and are for demonstration only.</p>

          <h2 className="mt-16 text-3xl tracking-tight">Features</h2>
          <ul className="mt-6 grid gap-x-10 sm:grid-cols-2">
            {v.features.map((f) => (
              <li key={f} className="flex items-center gap-3 border-b border-ink/10 py-4 text-[0.9375rem]">
                <Check className="shrink-0 text-muted-ink" /> {f}
              </li>
            ))}
          </ul>
        </section>

        {/* Evidence: inspection, history, warranty */}
        <section aria-labelledby="inspection-title">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="inspection-title" className="text-3xl tracking-tight">Inspection report</h2>
            <span className="text-xs text-muted-ink">Sample report · demo listing</span>
          </div>
          <dl className="mt-6 border-t border-ink/10">
            {dossier.inspection.map((it) => (
              <div key={it.area} className="grid gap-1 border-b border-ink/10 py-4 text-[0.9375rem] sm:grid-cols-[13rem_1fr] sm:gap-6">
                <dt className="flex items-start justify-between gap-3 font-semibold sm:justify-start">
                  {it.area}
                  <span
                    className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] sm:hidden ${
                      it.status === "good" ? "bg-ink text-paper" : "border border-ink/30 text-ink"
                    }`}
                  >
                    {it.status === "good" ? "Passed" : "Noted"}
                  </span>
                </dt>
                <dd className="flex items-start justify-between gap-4 text-ink/80">
                  <span>{it.result}</span>
                  <span
                    className={`mt-0.5 hidden shrink-0 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] sm:inline-block ${
                      it.status === "good" ? "bg-ink text-paper" : "border border-ink/30 text-ink"
                    }`}
                  >
                    {it.status === "good" ? "Passed" : "Noted"}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted-ink">“Noted” items are recorded for transparency and need no action before sale.</p>

          <div className="mt-16 grid gap-14 md:grid-cols-[1.4fr_1fr] md:gap-10">
            <div>
              <h2 className="text-3xl tracking-tight">Service history</h2>
              <ol className="mt-6 border-t border-ink/10">
                {dossier.history.map((h) => (
                  <li key={`${h.date}-${h.km}`} className="grid grid-cols-[5.5rem_1fr] gap-x-4 border-b border-ink/10 py-4 text-[0.9375rem]">
                    <span className="font-medium tabular-nums">{h.date}</span>
                    <span>
                      {h.work}
                      <span className="mt-0.5 block text-sm text-muted-ink">{formatKm(h.km)} · stamped service book</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className="text-3xl tracking-tight">Warranty</h2>
              <div className="mt-6 border-t border-ink/10 pt-5">
                <p className="font-semibold">{dossier.warranty.title}</p>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-ink">{dossier.warranty.body}</p>
                <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted-ink">
                  {v.owners} previous {v.owners === 1 ? "owner" : "owners"}. Registration documents and the full inspection
                  report are shared before you visit.
                </p>
              </div>
            </div>
          </div>
          <p className="mt-6 text-xs text-muted-ink">
            Inspection, service and warranty details on this demo site are illustrative samples, not records of a real car.
          </p>
        </section>
        </div>

        <div className="hidden lg:col-span-4 lg:block">
          <div
            className={`sticky top-28 border border-ink/10 bg-paper-2 p-6 transition-opacity duration-300 ${ctaGone ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden={!ctaGone}
          >
            <p className="eyebrow text-muted-ink">{v.make}</p>
            <p className="mt-2 text-xl tracking-tight">
              {v.model}
              {v.variant && <span className="text-muted-ink"> {v.variant}</span>}
            </p>
            <p className="mt-1 text-sm text-muted-ink">
              {v.year} · {formatKm(v.mileageKm)} · {v.fuel}
            </p>
            <p className="mt-4 font-display text-2xl font-medium tracking-tight">{formatPrice(v.price)}</p>
            <div className="mt-5 grid gap-2">
              <button type="button" tabIndex={ctaGone ? 0 : -1} className="btn btn-ink w-full" onClick={() => openInquiry({ mode: "vehicle", vehicleSlug: v.slug })}>
                Enquire
              </button>
              <button type="button" tabIndex={ctaGone ? 0 : -1} className="btn btn-ghost-light w-full" onClick={() => openInquiry({ mode: "visit", vehicleSlug: v.slug })}>
                Book a viewing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Phones: a slim bar keeps the enquiry one tap away after the main buttons scroll off */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper px-4 py-3 shadow-[0_-8px_24px_rgb(11_13_16/0.06)] transition-transform duration-300 lg:hidden ${
          ctaGone ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!ctaGone}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{v.make} {v.model}</p>
            <p className="text-sm text-muted-ink">{formatPrice(v.price)}</p>
          </div>
          <button type="button" tabIndex={ctaGone ? 0 : -1} className="btn btn-ink min-h-11 shrink-0 px-5" onClick={() => openInquiry({ mode: "vehicle", vehicleSlug: v.slug })}>
            Enquire
          </button>
        </div>
      </div>

      <section aria-labelledby="similar-title" className="section-y border-t border-ink/10 bg-paper-2">
        <div className="container-wide">
          <h2 id="similar-title" className="h-section">Comparable cars</h2>
          <p className="mt-3 text-muted-ink">Closest in price and intended use.</p>
          <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <li key={s.slug}>
                <VehicleCard v={s} sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

export function NotFound() {
  return (
    <main id="main" className="theme-light grid min-h-[80svh] place-items-center bg-paper px-4 pt-20 text-ink">
      <div className="max-w-lg text-center">
        <p className="eyebrow text-muted-ink">Not found</p>
        <h1 className="h-section mt-4">This car is no longer listed</h1>
        <p className="mt-5 text-muted-ink">It may have been sold or the link may be out of date.</p>
        <a href={INVENTORY_HREF} className="btn btn-ink mt-8">Browse the inventory</a>
      </div>
    </main>
  );
}
