/** A photo served from the Unsplash CDN (Unsplash License). */
export interface Photo {
  /** Path segment after images.unsplash.com/, e.g. "photo-1614162692292-7ac56d7f7f1e" */
  id: string;
  alt: string;
  /** Native aspect ratio (width / height); used to reserve layout space. */
  ratio: number;
  /** CSS object-position for crops, e.g. "50% 60%". */
  focus?: string;
  credit?: string;
}

export type Category = "sports" | "suv" | "saloon";
export type Fuel = "Petrol" | "Diesel" | "Electric";
export type Transmission = "Automatic" | "Manual";

export interface Vehicle {
  slug: string;
  make: string;
  model: string;
  /** Optional trim/body descriptor. Only use what the photo supports. */
  variant?: string;
  year: number;
  /** Illustrative demo price in EUR. */
  price: number;
  mileageKm: number;
  fuel: Fuel;
  transmission: Transmission;
  category: Category;
  bodyStyle: string;
  powerPs: number;
  engine: string;
  drivetrain: string;
  acceleration: string;
  exterior: string;
  interior: string;
  owners: number;
  summary: string;
  features: string[];
  photos: Photo[];
  featured?: boolean;
}

export interface Service {
  id: string;
  title: string;
  body: string;
  photo: Photo;
}

export interface FaqItem {
  q: string;
  a: string;
}
