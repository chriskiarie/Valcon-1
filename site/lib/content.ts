// The only module that reads content. Components call these functions and never
// import the JSON directly. To move content to a CMS, change this file (or the
// sync script that writes content/*.json) and nothing else.
import aircraftData from "@/content/aircraft.json";
import homeData from "@/content/home.json";
import pagesData from "@/content/pages.json";
import servicesData from "@/content/services.json";
import siteData from "@/content/site.json";
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
