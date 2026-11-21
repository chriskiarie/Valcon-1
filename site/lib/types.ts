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
  /** Who the service suits, shown as a "Best for" line. Optional. */
  bestFor?: string;
};

export type Credit = {
  title: string;
  author: string;
  source: string;
  licence: string;
  usedFor: string;
  note?: string;
};

export type NavItem = { href: string; label: string };

/** Where a photo sits inside the fixed fleet window. top and height are CSS lengths. */
export type Focus = {
  desktop: string;
  mobile: string;
  top?: { desktop: string; mobile: string };
  height?: { desktop: string; mobile: string };
};

/** A bare asset path (no extension) with avif, webp and jpg variants beside it. */
export type ResponsiveImage = {
  desktop: string;
  mobile: string;
  alt: string;
};

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "x"
  | "tiktok"
  | "youtube";

export type Social = {
  /** Free-text label, used only when no platform is picked (older content). */
  label?: string;
  href: string;
  platform?: SocialPlatform;
};

export type LogoImage = { src: string; alt: string; width: number; height: number };

export type Site = {
  name: string;
  legalName: string;
  /** null means the text wordmark is shown instead of a logo image. */
  logo: LogoImage | null;
  /** Optional wide, short logo for the top menu. Falls back to the full logo. */
  logoCompact?: LogoImage | null;
  /** Optional emblem on its own, shown beside the compact logo in the top menu. */
  logoIcon?: LogoImage | null;
  wordmark: { primary: string; secondary: string };
  tagline: string;
  base: string;
  description: string;
  metaTitle: string;
  nav: NavItem[];
  /** Set a notice to an empty string to hide it. */
  notices: {
    conceptPill: string;
    footerNote: string;
    illustrativeImages: string;
  };
  /** "{aircraft}" in whatsappAircraft is replaced with the aircraft name. */
  messages: {
    whatsappGeneral: string;
    whatsappAircraft: string;
    contactUnconfirmed: string;
  };
  /** Street or building line, shown on the contact page, footer and home page. */
  address: string;
  /** Opening hours, one row per day range. */
  hours: { days: string; time: string }[];
  phone: string;
  phoneTel: string;
  whatsapp: string;
  email: string;
  socials: Social[];
  credits: Credit[];
};

export type Home = {
  hero: {
    eyebrow: string;
    title: string;
    support: string;
    /** One or more banner photos. Two or more crossfade. */
    slides: ResponsiveImage[];
    primaryCta: string;
    secondaryCta: string;
  };
  intro: {
    eyebrow: string;
    statement: string;
    support: string;
    image: ResponsiveImage & { caption: string };
  };
  fleet: {
    heading: string;
    pageHeading: string;
    linkLabel: string;
    window?: {
      image: string;
      focus?: Focus;
      alt: string;
      lead?: string;
      caption: string;
      tab?: string;
      openLabel: string;
      galleryLabel: string;
      galleryHref: string;
      more: { image: string; alt: string; caption?: string; tab?: string; focus?: { desktop: string; mobile: string } }[];
    };
  };
  arrival: {
    eyebrow: string;
    aircraftSlug: string;
    registrationLabel: string;
    registration: string;
    title: string;
    line: string;
    routeFrom: string;
    routeTo: string;
    buttonLabel: string;
  };
  services: {
    eyebrow: string;
    heading: string;
    imageButtonLabel: string;
    /** Label above each card's "best for" line. */
    bestForLabel: string;
    /** Label on the link that opens the quote form for that service. */
    quoteLabel: string;
  };
  howItWorks: {
    /** Set to false to hide the whole section. */
    show: boolean;
    eyebrow: string;
    heading: string;
    intro: string;
    /** One entry per stage. */
    steps: { title: string; text: string }[];
    /** Small note on how ACMI differs. An empty string hides it. */
    acmiNote: string;
  };
  about: {
    /** The story is a draft until the client approves it, so it ships hidden. */
    show: boolean;
    eyebrow: string;
    heading: string;
    /** One entry per paragraph. */
    story: string[];
    closing: string;
    values: { title: string; text: string }[];
  };
  visit: {
    eyebrow: string;
    title: string;
    line: string;
    addressLabel: string;
    phoneLabel: string;
    emailLabel: string;
    hoursLabel: string;
  };
  gallery: {
    eyebrow: string;
    heading: string;
    videos: { src: string; caption: string }[];
  };
  closing: {
    eyebrow: string;
    title: string;
    support: string;
    primaryCta: string;
  };
  socials: {
    /** Line beside the social icons. An empty string hides the band's copy. */
    title: string;
    line: string;
  };
};

export type Pages = {
  fleet: {
    metaDescription: string;
    eyebrow: string;
    title: string;
    lede: string;
  };
  contact: {
    metaDescription: string;
    title: string;
    lede: string;
    panelEyebrow: string;
    panelTitle: string;
  };
};
