export type SocialLink = {
  label: string;
  href: string;
};

export type Site = {
  name: string;
  legalName: string;
  tagline: string;
  base: string;
  phone: string;
  phoneTel: string;
  whatsapp: string;
  email: string;
  socials: SocialLink[];
};

export type Aircraft = {
  slug: string;
  name: string;
  registrations: string[];
  isPlaceholder: boolean;
  summary: string;
  specs: {
    seats: number | null;
    range: string | null;
    cruiseSpeed: string | null;
  };
  features: string[];
  hero: { desktop: string; mobile: string; alt: string };
  gallery: { src: string; alt: string }[];
  order: number;
};

export type Service = {
  slug: string;
  title: string;
  summary: string;
};
