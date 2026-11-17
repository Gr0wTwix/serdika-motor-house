import type { FaqItem, Service } from "./types";

/** Demo service offering. Present as real only once the business confirms each one. */
export const services: Service[] = [
  {
    id: "inspection",
    title: "Technical inspection",
    body: "Every car is inspected on a lift before it is listed. You receive the full report, not a summary.",
    photo: {
      id: "photo-1790972414392-cfbc29562347",
      alt: "Open engine bay of a performance car during inspection",
      ratio: 1.5,
      focus: "50% 50%",
    },
  },
  {
    id: "history",
    title: "Verified history",
    body: "Service records, ownership and import papers are checked and kept with the car.",
    photo: {
      id: "photo-1613921568536-555645be4032",
      alt: "White Porsche sports car parked under showroom lights",
      ratio: 1.417,
      focus: "50% 62%",
    },
  },
  {
    id: "warranty",
    title: "Warranty support",
    body: "Help choosing and registering an extended warranty that suits the car and how you drive it.",
    photo: {
      id: "photo-1761014586544-53fe5e1f1e25",
      alt: "One hand passing a car key to another against a pale background",
      ratio: 0.667,
      focus: "50% 45%",
    },
  },
  {
    id: "financing",
    title: "Financing and leasing",
    body: "Leasing and financing quotes from partner banks, explained line by line before you sign.",
    photo: {
      id: "photo-1649136378672-b965cb9935d5",
      alt: "Tan leather sports seats inside an Audi R8 Spyder",
      ratio: 1.778,
      focus: "50% 55%",
    },
  },
  {
    id: "detailing",
    title: "Detailing and protection",
    body: "Paint correction, ceramic coating and interior care before handover, or at any time after.",
    photo: {
      id: "photo-1780558852670-3f49298ecc1f",
      alt: "A detailer polishing a dark blue car bonnet with an orbital polisher",
      ratio: 2.295,
      focus: "40% 50%",
    },
  },
];

export const sellSteps = [
  {
    title: "Share the details",
    body: "Tell us the make, model, year and mileage. Photos help but are optional.",
  },
  {
    title: "Get an appraisal",
    body: "We look at the car in person and give you a written offer you can keep.",
  },
  {
    title: "Sell or trade",
    body: "Take the payment, or put the value towards a car from our inventory.",
  },
];

/** Sell or trade page: what to bring to the appraisal. */
export const sellBring = [
  "Registration certificate (both parts)",
  "Your ID card or passport",
  "Service book and repair invoices",
  "All keys and the spare",
  "Proof of any finance still owed",
];

/** Sell or trade page: what the appraisal looks at. */
export const sellChecks = [
  { title: "History", body: "Service record, mileage plausibility and previous ownership." },
  { title: "Condition", body: "Bodywork, paint depth, tyres, interior and a diagnostic scan." },
  { title: "Drive", body: "A short test drive to check the gearbox, brakes and suspension." },
  { title: "Market", body: "Asking prices of comparable cars currently for sale in Bulgaria." },
];

export const principles = [
  {
    title: "Fewer cars, chosen better",
    body: "A short list of cars we would own ourselves, rather than a lot full of compromises.",
  },
  {
    title: "Everything on paper",
    body: "Inspection reports, history and costs are shared before you visit, not after.",
  },
  {
    title: "Time to decide",
    body: "Book a viewing and the car is prepared for you, with a test drive on roads you choose. Walk-ins are welcome too.",
  },
];

export const faq: FaqItem[] = [
  {
    q: "Do I need an appointment to view a car?",
    a: "Walk-ins are welcome during opening hours, but an appointment means the car is prepared, charged or warmed up, and someone is free to show you around.",
  },
  {
    q: "Can I test drive before buying?",
    a: "Yes. Bring a valid driving licence. Test drives on high-performance cars are accompanied and planned around your route.",
  },
  {
    q: "Do you accept part exchange?",
    a: "Yes. We appraise your car in person and deduct the agreed value from the price of the car you buy.",
  },
  {
    q: "Can you deliver outside Sofia?",
    a: "Delivery can be arranged across Bulgaria and the rest of the EU on an enclosed transporter. Ask for a quote with your enquiry.",
  },
  {
    q: "What paperwork comes with the car?",
    a: "The inspection report, service records, registration documents and any remaining manufacturer warranty paperwork.",
  },
  {
    q: "Are the prices on this site real?",
    a: "No. This is a demo website for a fictional dealership. All vehicles, prices and services shown are sample content.",
  },
];
