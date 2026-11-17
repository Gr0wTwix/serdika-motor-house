import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { site } from "../data/site";
import { getVehicle, vehicleTitle, vehicles } from "../data/vehicles";
import { formatPrice } from "../lib/format";
import { Img } from "./Img";
import { Check, Close } from "./Icons";

export type InquiryMode = "visit" | "vehicle" | "sell" | "search" | "photos";

interface OpenOptions {
  mode: InquiryMode;
  vehicleSlug?: string;
  /** Prefilled message, so visitors don't have to explain the button they clicked. */
  message?: string;
  /** Overrides the default heading, intro and button text for this mode. */
  copy?: Partial<{ title: string; intro: string; submit: string }>;
}

const InquiryContext = createContext<(o: OpenOptions) => void>(() => {});
export const useInquiry = () => useContext(InquiryContext);

const COPY: Record<InquiryMode, { title: string; intro: string; submit: string }> = {
  visit: {
    title: "Book a visit",
    intro: "Choose a preferred day and time. We will confirm the appointment by phone or email, then have the car ready.",
    submit: "Request appointment",
  },
  vehicle: {
    title: "Enquire about this car",
    intro: "Ask about availability, history or a test drive.",
    submit: "Send enquiry",
  },
  sell: {
    title: "Request a valuation",
    intro: "Tell us about your car. An appraisal in person follows.",
    submit: "Request valuation",
  },
  photos: {
    title: "Request the full photo set",
    intro: "We will email you the full photo set for this car, usually within one working day.",
    submit: "Request photos",
  },
  search: {
    title: "Find me a car",
    intro: "Describe what you are looking for and we will search our network.",
    submit: "Send request",
  },
};

type Errors = Partial<Record<string, string>>;

const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export function InquiryProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [opts, setOpts] = useState<OpenOptions>({ mode: "visit" });
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState<string>("");
  const [formKey, setFormKey] = useState(0);
  const uid = useId();

  const open = useCallback((o: OpenOptions) => {
    setOpts(o);
    setStatus("idle");
    setErrors({});
    setFormKey((k) => k + 1);
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
  }, []);

  const close = () => dialogRef.current?.close();

  // Close when clicking the backdrop
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClick = (e: MouseEvent) => {
      if (e.target === d) d.close();
    };
    d.addEventListener("click", onClick);
    return () => d.removeEventListener("click", onClick);
  }, []);

  const vehicle = opts.vehicleSlug ? getVehicle(opts.vehicleSlug) : undefined;
  const copy = { ...COPY[opts.mode], ...opts.copy };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const val = (k: string) => String(data.get(k) ?? "").trim();
    const next: Errors = {};
    const short = opts.mode === "photos"; // one-car request: email and an optional note only
    if (!short && !val("name")) next.name = "Please enter your name.";
    const email = val("email");
    if (!email) next.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email address, like name@domain.bg.";
    const phone = val("phone");
    if (phone && !/^[+()\d\s-]{6,}$/.test(phone)) next.phone = "Use digits, spaces and an optional leading +.";
    if (opts.mode === "visit") {
      const date = val("date");
      if (!date) next.date = "Please choose a date.";
      else if (date < todayISO()) next.date = "Please choose today or a later date.";
      if (!val("time")) next.time = "Please choose a time.";
    }
    if (opts.mode === "sell") {
      if (!val("car")) next.car = "Please enter the make and model.";
      const year = Number(val("year"));
      if (!year || year < 1950 || year > new Date().getFullYear() + 1) next.year = "Please enter a valid year.";
      const mileage = val("mileage");
      if (!mileage || Number.isNaN(Number(mileage)) || Number(mileage) < 0) next.mileage = "Please enter the mileage in km.";
      const files = data.getAll("photos").filter((x): x is File => x instanceof File && x.size > 0);
      if (files.length > 10) next.photos = "Please choose up to 10 photos.";
      else if (files.some((f) => !f.type.startsWith("image/"))) next.photos = "Please choose image files only.";
    }
    if (opts.mode === "search" && !val("message")) next.message = "Tell us briefly what you are looking for.";

    setErrors(next);
    const firstInvalid = Object.keys(next)[0];
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    setStatus("submitting");
    const parts = [copy.title];
    const v = val("vehicle");
    if (v) parts.push(vehicleTitle(getVehicle(v)!));
    if (opts.mode === "visit") parts.push(`${val("date")} at ${val("time")}`);
    if (opts.mode === "photos") parts.push(`full photo set to ${val("email")}`);
    if (opts.mode === "sell") {
      const n = data.getAll("photos").filter((x) => x instanceof File && x.size > 0).length;
      parts.push(`${val("car")}, ${val("year")}, ${val("mileage")} km${n ? `, ${n} photo${n === 1 ? "" : "s"}` : ""}`);
    }
    setSummary(parts.join(" · "));
    // No backend: simulate a short processing step, then show an honest demo result.
    window.setTimeout(() => setStatus("done"), 600);
  };

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${uid}-${k}-err`} className="field-error">
        {errors[k]}
      </p>
    ) : null;
  const a11y = (k: string) => ({
    "aria-invalid": errors[k] ? (true as const) : undefined,
    "aria-describedby": errors[k] ? `${uid}-${k}-err` : undefined,
  });

  return (
    <InquiryContext.Provider value={open}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby={`${uid}-title`}
        className="modal theme-light m-auto max-h-[calc(100svh-2rem)] w-[min(40rem,calc(100vw-2rem))] overflow-y-auto bg-paper p-0 text-ink"
      >
        <div className="flex items-start justify-between gap-6 border-b border-ink/10 px-6 py-4 sm:px-8">
          <div>
            <p className="eyebrow text-muted-ink">{site.name}</p>
            <h2 id={`${uid}-title`} className="mt-1.5 text-2xl sm:text-3xl">
              {status === "done" ? "Demo submission received" : copy.title}
            </h2>
          </div>
          <button type="button" onClick={close} className="-mr-2 grid size-11 place-items-center rounded-full hover:bg-ink/5" aria-label="Close dialog">
            <Close />
          </button>
        </div>

        {status === "done" ? (
          <div className="px-6 py-8 sm:px-8" role="status">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-ink text-paper">
                <Check width={14} height={14} />
              </span>
              <p className="text-[0.9375rem] leading-relaxed">
                <strong>Nothing was sent.</strong> This website is a demo and the form is not connected to a backend, so no
                appointment was booked and no message reached anyone.
              </p>
            </div>
            <p className="mt-5 border-l border-ink/15 pl-4 text-sm text-muted-ink">What you would have submitted: {summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="btn btn-ink" onClick={close}>
                Close
              </button>
              <button type="button" className="btn btn-ghost-light" onClick={() => open(opts)}>
                Start again
              </button>
            </div>
          </div>
        ) : (
          <form key={formKey} noValidate onSubmit={onSubmit} className="px-6 pt-5 sm:px-8 sm:pt-6">
            <p className="text-[0.9375rem] text-muted-ink">{copy.intro}</p>
            <p className="mt-3 bg-paper-2 px-4 py-2.5 text-sm">
              <strong>Demo form.</strong> Submitting shows a preview only. Nothing is sent or stored.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              {(opts.mode === "vehicle" || opts.mode === "visit") && (
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor={`${uid}-vehicle`}>
                    Vehicle {opts.mode === "visit" && <span className="font-normal text-muted-ink">(optional)</span>}
                  </label>
                  <select id={`${uid}-vehicle`} name="vehicle" className="field" defaultValue={vehicle?.slug ?? ""}>
                    <option value="">{opts.mode === "visit" ? "General visit" : "Select a vehicle"}</option>
                    {vehicles.map((v) => (
                      <option key={v.slug} value={v.slug}>
                        {v.year} {vehicleTitle(v)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Photo request: the car is fixed (it's the one the visitor was looking at), shown as a summary */}
              {opts.mode === "photos" && vehicle && (
                <div className="flex min-w-0 items-center gap-4 border border-ink/10 bg-paper-2 p-3 sm:col-span-2">
                  <input type="hidden" name="vehicle" value={vehicle.slug} />
                  <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden bg-paper">
                    <Img photo={vehicle.photos[0]!} sizes="96px" maxWidth={480} alt="" />
                  </div>
                  <div className="min-w-0">
                    <p className="eyebrow text-muted-ink">{vehicle.make}</p>
                    <p className="mt-1 truncate font-semibold">
                      {vehicle.year} {vehicle.model} {vehicle.variant}
                    </p>
                    <p className="text-sm text-muted-ink">{formatPrice(vehicle.price)}</p>
                  </div>
                </div>
              )}

              {opts.mode === "sell" && (
                <>
                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor={`${uid}-car`}>Make and model</label>
                    <input id={`${uid}-car`} name="car" placeholder="e.g. Porsche Cayenne S" className="field" {...a11y("car")} />
                    {err("car")}
                  </div>
                  <div>
                    <label className="field-label" htmlFor={`${uid}-year`}>Year</label>
                    <input id={`${uid}-year`} name="year" inputMode="numeric" className="field" {...a11y("year")} />
                    {err("year")}
                  </div>
                  <div>
                    <label className="field-label" htmlFor={`${uid}-mileage`}>Mileage (km)</label>
                    <input id={`${uid}-mileage`} name="mileage" inputMode="numeric" className="field" {...a11y("mileage")} />
                    {err("mileage")}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor={`${uid}-photos`}>
                      Photos <span className="font-normal text-muted-ink">(optional, up to 10)</span>
                    </label>
                    <input
                      id={`${uid}-photos`}
                      name="photos"
                      type="file"
                      accept="image/*"
                      multiple
                      aria-describedby={`${uid}-photos-hint${errors.photos ? ` ${uid}-photos-err` : ""}`}
                      aria-invalid={errors.photos ? true : undefined}
                      className="field file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-paper"
                    />
                    <p id={`${uid}-photos-hint`} className="mt-1.5 text-xs text-muted-ink">
                      Front, rear, interior and the odometer help most. In this demo, photos stay on your device.
                    </p>
                    {err("photos")}
                  </div>
                </>
              )}

              {opts.mode !== "photos" && (
                <div>
                  <label className="field-label" htmlFor={`${uid}-name`}>Full name</label>
                  <input id={`${uid}-name`} name="name" autoComplete="name" className="field" {...a11y("name")} />
                  {err("name")}
                </div>
              )}
              <div className={opts.mode === "photos" ? "sm:col-span-2" : ""}>
                <label className="field-label" htmlFor={`${uid}-email`}>
                  {opts.mode === "photos" ? "Email the photos to" : "Email"}
                </label>
                <input id={`${uid}-email`} name="email" type="email" autoComplete="email" className="field" {...a11y("email")} />
                {err("email")}
              </div>
              {opts.mode !== "photos" && (
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor={`${uid}-phone`}>
                    Phone <span className="font-normal text-muted-ink">(optional)</span>
                  </label>
                  <input id={`${uid}-phone`} name="phone" type="tel" autoComplete="tel" className="field" {...a11y("phone")} />
                  {err("phone")}
                </div>
              )}

              {opts.mode === "visit" && (
                <>
                  <div>
                    <label className="field-label" htmlFor={`${uid}-date`}>Preferred date</label>
                    <input id={`${uid}-date`} name="date" type="date" min={todayISO()} className="field" {...a11y("date")} />
                    {err("date")}
                  </div>
                  <div>
                    <label className="field-label" htmlFor={`${uid}-time`}>Preferred time</label>
                    <select id={`${uid}-time`} name="time" className="field" defaultValue="" {...a11y("time")}>
                      <option value="" disabled>Choose a time</option>
                      {site.visitSlots.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {err("time")}
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="field-label" htmlFor={`${uid}-message`}>
                  {opts.mode === "search" ? "What are you looking for?" : opts.mode === "photos" ? "Anything specific?" : "Message"}{" "}
                  {opts.mode !== "search" && <span className="font-normal text-muted-ink">(optional)</span>}
                </label>
                <textarea
                  id={`${uid}-message`}
                  name="message"
                  rows={opts.mode === "sell" || opts.mode === "photos" ? 2 : 3}
                  placeholder={opts.mode === "photos" ? "e.g. close-ups of the wheels and the driver's seat" : undefined}
                  defaultValue={opts.message ?? ""}
                  className="field resize-y"
                  {...a11y("message")}
                />
                {err("message")}
              </div>

            </div>

            <div className="sticky bottom-0 -mx-6 mt-6 flex flex-wrap items-center gap-4 border-t border-ink/10 bg-paper px-6 py-4 sm:-mx-8 sm:px-8">
              <button type="submit" className="btn btn-ink" disabled={status === "submitting"} aria-busy={status === "submitting"}>
                {status === "submitting" ? "Checking…" : copy.submit}
              </button>
              <button type="button" className="text-sm font-semibold link-underline" onClick={close}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </dialog>
    </InquiryContext.Provider>
  );
}
