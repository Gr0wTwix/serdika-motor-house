import { useEffect, useRef, useState } from "react";
import type { Page } from "../lib/router";
import { nav, site } from "../data/site";
import { Close, Menu } from "./Icons";
import { useInquiry } from "./Inquiry";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span className="font-display text-[1.05rem] font-semibold tracking-[0.32em]">SERDIKA</span>
      <span className="mt-1 text-[0.625rem] font-semibold tracking-[0.42em] text-current/60">MOTOR HOUSE</span>
    </span>
  );
}

export function Header({ alwaysSolid = false, current }: { alwaysSolid?: boolean; current?: Page }) {
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const openInquiry = useInquiry();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = alwaysSolid || scrolled;
  const closeMenu = () => menuRef.current?.close();

  return (
    <header
      className={`theme-dark fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        solid ? "border-b border-white/10 bg-ink" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-wide flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
        <a href="/" className="inline-flex min-h-11 items-center text-paper" aria-label={`${site.name}, home`}>
          <Wordmark />
        </a>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-9 text-[0.9375rem] text-paper/80">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  className={`link-underline py-2 transition-colors hover:text-paper ${item.page && item.page === current ? "text-paper [background-size:100%_1px]" : ""}`}
                  href={item.href}
                  aria-current={item.page && item.page === current ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-silver min-h-11 px-5 text-sm" onClick={() => openInquiry({ mode: "visit" })}>
            Book a visit
          </button>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full text-paper hover:bg-white/10 lg:hidden"
            aria-label="Open menu"
            aria-haspopup="dialog"
            onClick={() => menuRef.current?.showModal()}
          >
            <Menu width={22} height={22} />
          </button>
        </div>
      </div>

      <dialog
        ref={menuRef}
        aria-label="Menu"
        className="theme-dark m-0 h-[100dvh] max-h-none w-screen max-w-none bg-ink p-0 text-paper"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) closeMenu();
        }}
      >
        <div className="container-wide flex h-[4.5rem] items-center justify-between">
          <Wordmark />
          <button type="button" className="grid size-11 place-items-center rounded-full hover:bg-white/10" aria-label="Close menu" onClick={closeMenu}>
            <Close width={22} height={22} />
          </button>
        </div>
        <nav aria-label="Mobile" className="container-wide mt-8">
          <ul className="border-t border-white/10">
            {nav.map((item) => (
              <li key={item.href} className="border-b border-white/10">
                <a
                  href={item.href}
                  aria-current={item.page && item.page === current ? "page" : undefined}
                  className="flex min-h-16 items-center font-display text-3xl tracking-tight aria-[current=page]:text-silver"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn-silver mt-10 w-full"
            onClick={() => {
              closeMenu();
              openInquiry({ mode: "visit" });
            }}
          >
            Book a visit
          </button>
          <p className="mt-6 text-sm text-muted">Demo website · fictional dealership in {site.city}</p>
        </nav>
      </dialog>
    </header>
  );
}
