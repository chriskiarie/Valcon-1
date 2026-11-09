export type AircraftStatus = "active" | "coming-soon";

export type Aircraft = {
  slug: string;
  name: string;
  registrations: string[];
  status: AircraftStatus;
  isPlaceholder: boolean;
  summary: string;
  specs: {
    seats: number | null;
    range: string | null;
    cruiseSpeed: string | null;
  };
  features: string[];
  hero: {
    desktop: string;
    mobile: string;
    alt: string;
  };
  gallery: {
    src: string;
    alt: string;
  }[];
  order: number;
};

export type Service = {
  slug: string;
  title: string;
  summary: string;
  isPlaceholder: boolean;
  image: string;
};

export type Credit = {
  title: string;
  author: string;
  source: string;
  licence: string;
  usedFor: string;
  note?: string;
};

export type Site = {
  name: string;
  legalName: string;
  tagline: string;
  base: string;
  description: string;
  phone: string;
  phoneTel: string;
  whatsapp: string;
  email: string;
  socials: {
    label: string;
    href: string;
  }[];
  credits: Credit[];
};
