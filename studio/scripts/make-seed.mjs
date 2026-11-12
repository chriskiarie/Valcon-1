// Turns the committed site content (site/content/*.json) into a Sanity NDJSON seed.
// Run:    node scripts/make-seed.mjs
// Import: npx sanity dataset import seed/seed.ndjson production --replace
// Photos are not seeded: until an editor uploads one, the site keeps using the
// image already in site/public (see site/scripts/sync-sanity.mjs).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const content = join(here, "../../site/content");
const read = (name) => JSON.parse(readFileSync(join(content, name), "utf8"));

const key = (value, i) => ({ _key: `k${i}`, ...value });
const keyed = (list = []) => list.map(key);
// Sanity drops unset fields; empty strings and nulls would trip validation later.
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const c = clean(v);
      if (c === null || c === undefined || c === "") continue;
      if (Array.isArray(c) && c.length === 0) continue;
      if (c && typeof c === "object" && !Array.isArray(c) && Object.keys(c).length === 0) continue;
      out[k] = c;
    }
    return out;
  }
  return value;
};

const site = read("site.json");
const home = read("home.json");
const pages = read("pages.json");
const aircraft = read("aircraft.json");
const services = read("services.json");

const docs = [];

docs.push({
  _id: "siteSettings",
  _type: "siteSettings",
  name: site.name,
  legalName: site.legalName,
  wordmarkPrimary: site.wordmark.primary,
  wordmarkSecondary: site.wordmark.secondary,
  tagline: site.tagline,
  base: site.base,
  description: site.description,
  metaTitle: site.metaTitle,
  phone: site.phone,
  phoneTel: site.phoneTel,
  whatsapp: site.whatsapp,
  email: site.email,
  socials: keyed(site.socials),
  nav: keyed(site.nav),
  notices: site.notices,
  messages: site.messages,
  credits: keyed(site.credits),
});

const withoutPaths = (img) => ({ alt: img.alt, ...(img.caption ? { caption: img.caption } : {}) });
docs.push({
  _id: "homePage",
  _type: "homePage",
  hero: { ...home.hero, image: withoutPaths(home.hero.image) },
  intro: { ...home.intro, image: withoutPaths(home.intro.image) },
  fleet: home.fleet,
  arrival: home.arrival,
  services: home.services,
  closing: home.closing,
});

docs.push({ _id: "pagesContent", _type: "pagesContent", fleet: pages.fleet, contact: pages.contact });

for (const a of aircraft) {
  docs.push({
    _id: `aircraft-${a.slug}`,
    _type: "aircraft",
    name: a.name,
    slug: { _type: "slug", current: a.slug },
    registrations: a.registrations,
    status: a.status,
    isPlaceholder: a.isPlaceholder,
    summary: a.summary,
    specs: a.specs,
    features: a.features,
    hero: { alt: a.hero.alt },
    order: a.order,
  });
}

services.forEach((s, i) => {
  docs.push({
    _id: `service-${s.slug}`,
    _type: "service",
    title: s.title,
    slug: { _type: "slug", current: s.slug },
    summary: s.summary,
    isPlaceholder: s.isPlaceholder,
    order: i + 1,
  });
});

const lines = docs.map((d) => JSON.stringify(clean(d)));
writeFileSync(join(here, "../seed/seed.ndjson"), lines.join("\n") + "\n");
console.log(`Wrote ${docs.length} documents to seed/seed.ndjson`);
