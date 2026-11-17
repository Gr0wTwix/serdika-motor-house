import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Featured, MakesStrip } from "./components/Featured";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { InquiryProvider } from "./components/Inquiry";
import { defaultFilters, filtersFromSearch, filtersToSearch, Inventory, type Filters } from "./components/Inventory";
import { Faq, Footer, SellTrade, Services, Story, Visit } from "./components/Sections";
import { NotFound, VehicleDetail } from "./components/VehicleDetail";
import { site } from "./data/site";
import { getVehicle, vehicles } from "./data/vehicles";
import { useReveal } from "./lib/reveal";
import {
  lastNavigation,
  navigate,
  replaceSearch,
  savedScroll,
  scrollToHash,
  useLinkInterception,
  useLocation,
  usePageMeta,
} from "./lib/router";

function Home() {
  return (
    <main id="main">
      <Hero />
      <MakesStrip onPickMake={(make) => navigate("/" + filtersToSearch({ ...defaultFilters, make }))} />
      <Featured />
      <Services />
      <Story />
      <Faq />
      <Visit />
    </main>
  );
}

function InventoryPage({ search }: { search: string }) {
  usePageMeta(
    `Inventory — ${vehicles.length} performance and luxury cars | ${site.name} (demo)`,
    `Browse ${vehicles.length} sample performance and luxury cars at ${site.name} in ${site.city}. Filter by budget, year, mileage, make and fuel. Demo website with illustrative prices.`,
  );
  // Filters live in the URL, so a filtered list can be shared and survives Back from a detail page.
  const filters = useMemo(() => filtersFromSearch(search), [search]);
  const setFilters = (f: Filters) => replaceSearch(filtersToSearch(f));
  return (
    <main id="main" className="bg-paper pt-[4.5rem] lg:pt-20">
      <Inventory filters={filters} setFilters={setFilters} />
    </main>
  );
}

function SellPage() {
  usePageMeta(
    `Sell or trade your car | ${site.name} (demo)`,
    `Sell your car or trade it towards one of ours at ${site.name} in ${site.city}. Three steps, a written offer and no obligation. Demo website.`,
  );
  return (
    <main id="main" className="bg-paper-2 pt-[4.5rem] lg:pt-20">
      <SellTrade />
    </main>
  );
}

export default function App() {
  useLinkInterception();
  const loc = useLocation();
  // A "route" is the page itself; filter changes on the inventory page keep the same route.
  const route = `${loc.page}:${loc.vehicle ?? ""}`;
  const prevRoute = useRef(route);

  // On route change: hash target, the remembered position on Back/Forward, otherwise the top.
  useLayoutEffect(() => {
    const changed = prevRoute.current !== route;
    prevRoute.current = route;
    if (!changed) return;
    if (loc.hash) requestAnimationFrame(() => scrollToHash(loc.hash));
    else window.scrollTo(0, lastNavigation === "pop" ? savedScroll(loc.search) : 0);
  }, [route, loc.key, loc.search, loc.hash]);

  // First load with a hash
  useEffect(() => {
    if (loc.hash) requestAnimationFrame(() => scrollToHash(loc.hash));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useReveal(route);

  const vehicle = loc.vehicle ? getVehicle(loc.vehicle) : undefined;

  let page;
  if (loc.page === "vehicle") page = vehicle ? <VehicleDetail v={vehicle} /> : <NotFound />;
  else if (loc.page === "inventory") page = <InventoryPage search={loc.search} />;
  else if (loc.page === "sell") page = <SellPage />;
  else page = <Home />;

  return (
    <InquiryProvider>
      <a href="#main" className="sr-only z-50 bg-silver px-4 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Header alwaysSolid={loc.page !== "home"} current={loc.page} />
      {page}
      <Footer />
    </InquiryProvider>
  );
}
