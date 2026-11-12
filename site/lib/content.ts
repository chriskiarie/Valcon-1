// The only module that reads content. Components call these functions and never
// import the JSON directly.
//
// content/generated/*.json is written by scripts/sync-sanity.mjs before every
// dev and build: the committed content/*.json (fallback) merged with whatever
// editors have published in Sanity.
import aircraftData from "@/content/generated/aircraft.json";
import homeData from "@/content/generated/home.json";
import pagesData from "@/content/generated/pages.json";
import servicesData from "@/content/generated/services.json";
import siteData from "@/content/generated/site.json";
import type { Aircraft, Home, Pages, Service, Site } from "@/lib/types";

const site = siteData as Site;
const home = homeData as Home;
const pages = pagesData as Pages;
const aircraft = aircraftData as Aircraft[];
const services = servicesData as Service[];

export function getSite(): Site {
  return site;
}

export function getHome(): Home {
  return home;
}

export function getPages(): Pages {
  return pages;
}

export function getAircraft(): Aircraft[] {
  return [...aircraft].sort((a, b) => a.order - b.order);
}

export function getAircraftBySlug(slug: string): Aircraft | undefined {
  return aircraft.find((item) => item.slug === slug);
}

export function getServices(): Service[] {
  return services;
}
