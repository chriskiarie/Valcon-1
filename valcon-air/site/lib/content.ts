import aircraftData from "@/content/aircraft.json";
import servicesData from "@/content/services.json";
import siteData from "@/content/site.json";
import type { Aircraft, Service, Site } from "@/lib/types";

const site = siteData as unknown as Site;
const aircraft = aircraftData as unknown as Aircraft[];
const services = servicesData as unknown as Service[];

export function getSite(): Site {
  return site;
}

export function getAircraft(): Aircraft[] {
  return [...aircraft].sort((a, b) => a.order - b.order);
}

export function getServices(): Service[] {
  return [...services];
}
