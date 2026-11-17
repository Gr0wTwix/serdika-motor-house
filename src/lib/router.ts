import { useEffect, useSyncExternalStore } from "react";

/**
 * Minimal router. Pages are selected by query string so the site works on any static host
 * without rewrite rules:
 *   /                    home
 *   /?page=inventory     inventory
 *   /?page=sell          sell or trade
 *   /?vehicle=<slug>     vehicle detail
 */
export type Page = "home" | "inventory" | "sell" | "vehicle";

const subscribe = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  window.addEventListener("app:navigate", cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener("app:navigate", cb);
  };
};

const snapshot = () => window.location.search + window.location.hash;

/* Scroll memory: each page (query string) remembers where the visitor left it, so Back returns there. */
const scrollPositions = new Map<string, number>();
let currentSearch = window.location.search;
/** "pop" when the last navigation came from the browser's back/forward buttons. */
export let lastNavigation: "push" | "pop" = "push";

// Registered at import time, so it runs before React's popstate subscriber.
window.addEventListener("popstate", () => {
  scrollPositions.set(currentSearch, window.scrollY);
  currentSearch = window.location.search;
  lastNavigation = "pop";
});

export const savedScroll = (search: string) => scrollPositions.get(search) ?? 0;

export function useLocation() {
  const key = useSyncExternalStore(subscribe, snapshot, snapshot);
  const params = new URLSearchParams(window.location.search);
  const vehicle = params.get("vehicle");
  const p = params.get("page");
  const page: Page = vehicle ? "vehicle" : p === "inventory" || p === "sell" ? p : "home";
  return { key, page, vehicle, search: window.location.search, hash: window.location.hash };
}

export function navigate(href: string) {
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) {
    window.location.href = href;
    return;
  }
  const samePage = url.pathname === window.location.pathname && url.search === window.location.search;
  if (!samePage) scrollPositions.set(currentSearch, window.scrollY);
  window.history.pushState({}, "", url.pathname + url.search + url.hash);
  currentSearch = url.search;
  lastNavigation = "push";
  window.dispatchEvent(new Event("app:navigate"));
  if (samePage && url.hash) scrollToHash(url.hash);
}

/** Replaces the query string without a new history entry or scroll change (used for filters). */
export function replaceSearch(search: string) {
  const next = search && search !== "?" ? search : "";
  if (next === window.location.search) return;
  window.history.replaceState(window.history.state, "", window.location.pathname + next + window.location.hash);
  currentSearch = next;
  window.dispatchEvent(new Event("app:navigate"));
}

/** Last inventory URL the visitor saw, filters included, so "back to inventory" links keep them. */
let lastInventory = "/?page=inventory";
export const inventoryReturnHref = () => lastInventory;
const trackInventory = () => {
  if (new URLSearchParams(window.location.search).get("page") === "inventory") lastInventory = "/" + window.location.search;
};
window.addEventListener("app:navigate", trackInventory);
window.addEventListener("popstate", trackInventory);
trackInventory();

export function scrollToHash(hash: string) {
  const el = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  if (el) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }
}

/** Intercepts same-origin link clicks so the app navigates without a reload. */
export function useLinkInterception() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      e.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

/** Sets the page title and meta description while a page is mounted. */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevTitle = document.title;
    const prevDesc = meta?.content ?? "";
    document.title = title;
    if (meta) meta.content = description;
    return () => {
      document.title = prevTitle;
      if (meta) meta.content = prevDesc;
    };
  }, [title, description]);
}

export const vehicleHref = (slug: string) => `/?vehicle=${encodeURIComponent(slug)}`;
export const INVENTORY_HREF = "/?page=inventory";
export const SELL_HREF = "/?page=sell";
