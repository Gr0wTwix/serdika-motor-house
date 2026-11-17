import { HERO_PHOTO, site } from "../data/site";
import { vehicles } from "../data/vehicles";
import { ArrowRight } from "./Icons";
import { Img } from "./Img";
import { useInquiry } from "./Inquiry";
import { INVENTORY_HREF } from "../lib/router";

export function Hero() {
  const openInquiry = useInquiry();
  return (
    <section aria-labelledby="hero-title" className="theme-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink">
      <div className="absolute inset-0 -z-10">
        <Img photo={HERO_PHOTO} sizes="100vw" priority className="hero-img" />
        {/* Legibility scrims: a light one at the top for the header, a lower one behind the text only,
            so the cars in the middle of the frame stay bright. */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-ink/95 via-ink/60 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-[70%] bg-gradient-to-r from-ink/45 to-transparent max-md:hidden" />
      </div>

      <div className="container-wide mt-auto pb-10 pt-32 sm:pb-14 lg:pb-20">
        <p className="eyebrow hero-in text-silver" style={{ ["--d" as string]: "100ms" }}>
          {site.city} · Pre-owned performance &amp; luxury
        </p>
        <h1 id="hero-title" className="h-display hero-in mt-5 max-w-[13ch]" style={{ ["--d" as string]: "200ms" }}>
          Exceptional cars, <span className="text-silver">chosen with care in {site.city}.</span>
        </h1>

        <div className="hero-in mt-7 max-w-xl" style={{ ["--d" as string]: "350ms" }}>
          <p className="text-[1.0625rem] leading-relaxed text-paper/90">
            A short list of {vehicles.length} inspected cars, each with its history on paper. Book a viewing, or drop in
            during opening hours.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href={INVENTORY_HREF} className="btn btn-silver">
              Explore inventory <ArrowRight />
            </a>
            <button type="button" className="btn btn-ghost-dark" onClick={() => openInquiry({ mode: "visit" })}>
              Book a visit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
