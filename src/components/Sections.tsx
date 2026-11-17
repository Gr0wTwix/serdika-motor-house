import { useId, useState } from "react";
import { faq, principles, sellBring, sellChecks, sellSteps, services } from "../data/content";
import { SELL_PHOTO, STORY_PHOTO, nav, site } from "../data/site";
import type { Service } from "../data/types";
import { INVENTORY_HREF } from "../lib/router";
import { ArrowRight, Check, Plus } from "./Icons";
import { Img } from "./Img";
import { useInquiry } from "./Inquiry";
import { Wordmark } from "./Header";

/* ---------------------------------- Services ---------------------------------- */

function ServiceTile({ s, index, className, frame, sizes }: { s: Service; index: number; className: string; frame: string; sizes: string }) {
  return (
    <article className={`group flex flex-col ${className}`} data-reveal style={{ ["--reveal-delay" as string]: `${index * 90}ms` }}>
      <div className={`zoom-frame relative bg-surface ${frame}`}>
        <Img photo={s.photo} sizes={sizes} maxWidth={1920} />
      </div>
      <div className="mt-5 grid grid-cols-[2.5rem_1fr] gap-x-2 border-t border-white/10 pt-5">
        <span className="pt-1.5 font-display text-sm text-muted" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
        <div>
          <h3 className="h-card">{s.title}</h3>
          <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-muted">{s.body}</p>
        </div>
      </div>
    </article>
  );
}

export function Services() {
  const [inspection, history, warranty, financing, detailing] = services;
  if (!inspection || !history || !warranty || !financing || !detailing) return null;
  return (
    <section id="services" aria-labelledby="services-title" className="theme-dark section-y bg-ink text-paper">
      <div className="container-wide">
        <div className="grid gap-6 lg:grid-cols-12" data-reveal>
          <div className="lg:col-span-6">
            <p className="eyebrow text-silver">More than a sale</p>
            <h2 id="services-title" className="h-section mt-4 max-w-[14ch]">
              Prepared before you arrive, supported after you leave
            </h2>
          </div>
          <p className="max-w-md self-end text-muted lg:col-span-5 lg:col-start-8">
            Demo service list. Each service would be confirmed by the dealership before going live.
          </p>
        </div>

        {/* One lead image, then a compact list: keeps the section spacious without five full-size photos. */}
        <div className="mt-12 grid gap-x-12 gap-y-10 lg:mt-16 lg:grid-cols-12">
          <ServiceTile s={inspection} index={0} className="lg:col-span-6" frame="aspect-[4/3]" sizes="(min-width: 1024px) 48vw, 100vw" />
          <ul className="border-t border-white/10 lg:col-span-6">
            {[history, warranty, financing, detailing].map((s, i) => (
              <li
                key={s.id}
                className="grid grid-cols-[5.5rem_1fr] gap-x-5 border-b border-white/10 py-5 sm:grid-cols-[8rem_1fr] sm:gap-x-6"
                data-reveal
                style={{ ["--reveal-delay" as string]: `${(i + 1) * 80}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                  <Img photo={s.photo} sizes="(min-width: 640px) 128px, 88px" maxWidth={480} alt="" />
                </div>
                <div>
                  <h3 className="flex items-baseline gap-3 text-xl tracking-tight">
                    <span className="font-display text-sm text-muted" aria-hidden>{String(i + 2).padStart(2, "0")}</span>
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Sell / trade -------------------------------- */

/** Sell or trade page: split intro with the three steps, then what to bring, what we check and a closing call to action. */
export function SellTrade() {
  const openInquiry = useInquiry();
  return (
    <>
    <section id="sell" aria-labelledby="sell-title" className="theme-light bg-paper-2 text-ink">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[14rem] bg-ink sm:min-h-[22rem] lg:order-last lg:min-h-full">
          <div className="absolute inset-0">
            <Img photo={SELL_PHOTO} sizes="(min-width: 1024px) 50vw, 100vw" maxWidth={1920} priority />
          </div>
        </div>
        <div className="px-4 pb-20 pt-10 sm:px-8 lg:px-16 lg:pb-24 lg:pt-14 xl:px-24">
          <div className="max-w-xl">
            <p className="eyebrow text-muted-ink">Sell or trade</p>
            <h1 id="sell-title" className="h-section mt-3">Ready for your next car?</h1>
            <p className="mt-4 text-[1.0625rem] text-muted-ink">
              Sell your car outright or use its value towards one of ours. Three steps, no obligation.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" className="btn btn-ink" onClick={() => openInquiry({ mode: "sell" })}>
                Request a valuation <ArrowRight />
              </button>
              <a href={INVENTORY_HREF} className="btn btn-ghost-light">Browse cars to trade towards</a>
            </div>
          </div>
          <h2 className="eyebrow mt-14 text-muted-ink">How it works</h2>
          <ol className="mt-4 max-w-xl border-t border-ink/15">
            {sellSteps.map((step, i) => (
              <li
                key={step.title}
                className="grid grid-cols-[3.5rem_1fr] gap-x-2 border-b border-ink/15 py-7"
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 110}ms` }}
              >
                <span className="font-display text-3xl tracking-tight text-ink/35" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="h-card">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] text-muted-ink">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>

    <section aria-labelledby="sell-prep-title" className="theme-light section-y bg-paper text-ink">
      <div className="container-wide grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4" data-reveal>
          <p className="eyebrow text-muted-ink">The appraisal</p>
          <h2 id="sell-prep-title" className="h-section mt-4 max-w-[12ch]">What to expect on the day</h2>
          <p className="mt-6 max-w-sm text-muted-ink">About 45 minutes at the showroom. You leave with a written offer, whether or not you accept it.</p>
        </div>
        <div className="grid gap-14 sm:grid-cols-2 lg:col-span-7 lg:col-start-6 lg:gap-12">
          <div data-reveal>
            <h3 className="eyebrow text-muted-ink">Bring with you</h3>
            <ul className="mt-5 border-t border-ink/15 text-[0.9375rem]">
              {sellBring.map((item) => (
                <li key={item} className="flex items-start gap-3 border-b border-ink/15 py-4">
                  <Check className="mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal style={{ ["--reveal-delay" as string]: "120ms" }}>
            <h3 className="eyebrow text-muted-ink">What we look at</h3>
            <dl className="mt-5 border-t border-ink/15 text-[0.9375rem]">
              {sellChecks.map((c) => (
                <div key={c.title} className="border-b border-ink/15 py-4">
                  <dt className="font-semibold">{c.title}</dt>
                  <dd className="mt-1 text-muted-ink">{c.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="sell-cta-title" className="theme-dark bg-ink text-paper">
      <div className="container-wide flex flex-col items-start justify-between gap-8 py-16 lg:flex-row lg:items-end lg:py-24" data-reveal>
        <div>
          <h2 id="sell-cta-title" className="h-section max-w-[16ch]">Start with the details you have</h2>
          <p className="mt-4 max-w-md text-muted">Make, model, year and mileage are enough for a first estimate.</p>
        </div>
        <button type="button" className="btn btn-silver" onClick={() => openInquiry({ mode: "sell" })}>
          Request a valuation <ArrowRight />
        </button>
      </div>
    </section>
    </>
  );
}

/* ------------------------------------ Story ----------------------------------- */

export function Story() {
  return (
    <section id="about" aria-labelledby="about-title" className="theme-dark section-y border-t border-white/10 bg-ink text-paper">
      <div className="container-wide grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5" data-reveal>
          <div className="relative aspect-[4/5] bg-surface">
            <Img photo={STORY_PHOTO} sizes="(min-width: 1024px) 40vw, 100vw" maxWidth={1440} />
          </div>
        </div>
        <div className="flex flex-col justify-between lg:col-span-6 lg:col-start-7">
          <div data-reveal>
            <p className="eyebrow text-silver">About {site.shortName}</p>
            <h2 id="about-title" className="h-section mt-4 max-w-[15ch]">A smaller showroom, on purpose</h2>
            <p className="mt-8 max-w-lg text-[1.0625rem] leading-relaxed text-paper/75">
              {site.name} is a fictional dealership created for this demo. The idea: keep a handful of cars, know each one
              properly, and give buyers the time and paperwork to decide well.
            </p>
          </div>
          <ul className="mt-14 border-t border-white/10">
            {principles.map((p, i) => (
              <li key={p.title} className="grid gap-2 border-b border-white/10 py-6 sm:grid-cols-[1fr_1.4fr] sm:gap-8" data-reveal style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}>
                <h3 className="text-xl tracking-tight">{p.title}</h3>
                <p className="text-[0.9375rem] text-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------- FAQ ------------------------------------ */

export function Faq() {
  const uid = useId();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" aria-labelledby="faq-title" className="theme-light section-y bg-paper text-ink">
      <div className="container-wide grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4" data-reveal>
          <p className="eyebrow text-muted-ink">Questions</p>
          <h2 id="faq-title" className="h-section mt-4">Before you visit</h2>
        </div>
        <div className="border-t border-ink/15 lg:col-span-7 lg:col-start-6">
          {faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-b border-ink/15">
                <h3>
                  <button
                    type="button"
                    id={`${uid}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-a${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left font-display text-lg tracking-tight sm:text-xl"
                  >
                    <span className="transition-colors duration-300 group-hover:text-ink/70">{item.q}</span>
                    <span
                      aria-hidden
                      className={`grid size-9 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,color] duration-300 ${
                        isOpen ? "border-ink bg-ink text-paper" : "border-ink/15 group-hover:border-ink/40"
                      }`}
                    >
                      <Plus className="accordion-icon" data-open={isOpen} />
                    </span>
                  </button>
                </h3>
                {/* Height animates via grid rows; collapsed panels are visibility:hidden, so they leave the tab order and accessibility tree. */}
                <div id={`${uid}-a${i}`} role="region" aria-labelledby={`${uid}-q${i}`} className="accordion-panel" data-open={isOpen}>
                  <div className="min-h-0 overflow-hidden">
                    <p className="accordion-inner max-w-2xl pb-7 pr-14 text-[0.9375rem] leading-relaxed text-muted-ink">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------ Visit ----------------------------------- */

const TBC = <span className="text-muted">To be confirmed</span>;

export function Visit() {
  const openInquiry = useInquiry();
  const c = site.contact;
  return (
    <section id="visit" aria-labelledby="visit-title" className="theme-dark bg-surface text-paper">
      <div className="container-wide section-y grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5" data-reveal>
          <p className="eyebrow text-silver">Visit the showroom</p>
          <h2 id="visit-title" className="h-section mt-4 max-w-[13ch]">See the cars in person in {site.city}</h2>
          <p className="mt-6 max-w-md text-paper/75">Request a preferred time and we will confirm it by phone or email. The car you are interested in will then be ready, with its paperwork on the table. Walk-ins are welcome during opening hours.</p>
          <button type="button" className="btn btn-silver mt-10" onClick={() => openInquiry({ mode: "visit" })}>
            Book a visit <ArrowRight />
          </button>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:col-span-6 lg:col-start-7 lg:gap-12" data-reveal>
          <div>
            <h3 className="eyebrow text-silver">Opening hours</h3>
            <dl className="mt-5 border-t border-white/15 text-[0.9375rem]">
              {site.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4 border-b border-white/15 py-3">
                  <dt className="whitespace-nowrap text-paper/75">{h.days}</dt>
                  <dd className="whitespace-nowrap text-right">{h.time}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-muted">Demo hours</p>
          </div>
          <div>
            <h3 className="eyebrow text-silver">Contact</h3>
            <dl className="mt-5 border-t border-white/15 text-[0.9375rem]">
              <div className="border-b border-white/15 py-3">
                <dt className="text-paper/75">Address</dt>
                <dd className="mt-1">{c.street ? `${c.street}, ${c.postcode} ${site.city}` : <>{site.city}, {site.country} · {TBC}</>}</dd>
              </div>
              <div className="border-b border-white/15 py-3">
                <dt className="text-paper/75">Phone</dt>
                <dd className="mt-1">{c.phone ? <a className="link-underline" href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a> : TBC}</dd>
              </div>
              <div className="border-b border-white/15 py-3">
                <dt className="text-paper/75">Email</dt>
                <dd className="mt-1">{c.email ? <a className="link-underline" href={`mailto:${c.email}`}>{c.email}</a> : TBC}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------ Footer ---------------------------------- */

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="theme-dark border-t border-white/10 bg-ink text-paper">
      <div className="container-wide grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-5">
          <a href="/" className="inline-flex min-h-11 items-center" aria-label={`${site.name}, home`}>
            <Wordmark />
          </a>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
            {site.tagline} in {site.city}. A demo website for a fictional dealership: all vehicles, prices and services are sample content.
          </p>
        </div>
        <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-7">
          <h2 className="eyebrow text-silver">Explore</h2>
          <ul className="mt-3 grid text-[0.9375rem]">
            {nav.map((n) => (
              <li key={n.href}>
                <a className="link-underline inline-flex min-h-11 items-center text-paper/80 hover:text-paper" href={n.href}>{n.label}</a>
              </li>
            ))}
            <li>
              <a className="link-underline inline-flex min-h-11 items-center text-paper/80 hover:text-paper" href="/#faq">FAQ</a>
            </li>
          </ul>
        </nav>
        <div className="lg:col-span-3">
          <h2 className="eyebrow text-silver">Hours</h2>
          <ul className="mt-5 grid gap-3 text-[0.9375rem] text-paper/80">
            {site.hours.map((h) => (
              <li key={h.days}>
                {h.days}<br /><span className="text-muted">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p>© {year} {site.name} (fictional). Demo content.</p>
          <p>
            Photography from{" "}
            <a className="link-underline -my-3 inline-block py-3" href="https://unsplash.com/license" target="_blank" rel="noreferrer">
              Unsplash
            </a>
            , used under the Unsplash License.
          </p>
        </div>
      </div>
    </footer>
  );
}
