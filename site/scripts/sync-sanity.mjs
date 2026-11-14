#!/usr/bin/env node
// Build-time content sync.
//
//   content/*.json            committed fallback (the seed; always valid)
//   content/generated/*.json  what the site actually reads (git-ignored)
//
// 1. Always copies the committed JSON into content/generated first.
// 2. Then, if Sanity is reachable, merges published CMS content on top and
//    downloads the images editors uploaded into public/images/cms/.
// 3. Any failure leaves the fallback in place. The build never breaks on the CMS.
//
// Env (all optional):
//   SANITY_PROJECT_ID      default 9sifbw9w
//   SANITY_DATASET         default production
//   SANITY_API_TOKEN       only needed if the dataset is private
//   SKIP_CMS_SYNC=1        skip Sanity entirely (use committed JSON)
//   CMS_SYNC_STRICT=1      fail the build if Sanity cannot be read (use on production)
//   SANITY_API_HOST / SANITY_CDN_HOST   override hosts (tests)

import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "content");
const OUT = join(SRC, "generated");
const IMG_DIR = join(root, "public/images/cms");
const IMG_URL = "/images/cms";

const PROJECT = process.env.SANITY_PROJECT_ID || "9sifbw9w";
const DATASET = process.env.SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_API_TOKEN || "";
const API_HOST = process.env.SANITY_API_HOST || `https://${PROJECT}.api.sanity.io`;
const CDN_HOST = process.env.SANITY_CDN_HOST || "https://cdn.sanity.io";
const STRICT = process.env.CMS_SYNC_STRICT === "1";
const FILES = ["site", "home", "pages", "aircraft", "services"];

const warn = (msg) => console.warn(`[content-sync] warning: ${msg}`);
const log = (msg) => console.log(`[content-sync] ${msg}`);

// ---------- 1. fallback ----------
mkdirSync(OUT, { recursive: true });
for (const name of FILES) copyFileSync(join(SRC, `${name}.json`), join(OUT, `${name}.json`));
const writeMeta = (source, detail = "") =>
  writeFileSync(join(OUT, "_meta.json"), JSON.stringify({ source, detail, syncedAt: new Date().toISOString() }, null, 2));
writeMeta("fallback", "committed JSON");

if (process.env.SKIP_CMS_SYNC === "1") {
  log("SKIP_CMS_SYNC=1, using committed JSON.");
  process.exit(0);
}

// ---------- helpers ----------
const read = (name) => JSON.parse(readFileSync(join(SRC, `${name}.json`), "utf8"));
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const has = (v) => v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "");
const stripKeys = (list) => list.map(({ _key, ...rest }) => rest);

/** Deep merge: CMS values win, but unset CMS values never erase a fallback value. */
function merge(base, cms) {
  if (!isObj(base) || !isObj(cms)) return has(cms) ? cms : base;
  const out = { ...base };
  for (const [key, value] of Object.entries(cms)) {
    if (key.startsWith("_")) continue;
    if (isObj(value) && isObj(base[key])) out[key] = merge(base[key], value);
    else if (has(value) && !(Array.isArray(value) && value.length === 0)) out[key] = value;
  }
  return out;
}

const imageStats = { downloaded: 0, failed: 0 };

/** image-<id>-<w>x<h>-<ext>  ->  parts, or null */
function parseRef(image) {
  const ref = image?.asset?._ref;
  const m = typeof ref === "string" && ref.match(/^image-([a-f0-9]+)-(\d+)x(\d+)-([a-z0-9]+)$/i);
  return m ? { id: m[1], width: Number(m[2]), height: Number(m[3]), ext: m[4].toLowerCase() } : null;
}

function imageUrl(image, ref, { w, h, fmt, q }) {
  const params = new URLSearchParams();
  const crop = image.crop;
  if (crop) {
    const x = Math.round(crop.left * ref.width);
    const y = Math.round(crop.top * ref.height);
    const cw = Math.round((1 - crop.left - crop.right) * ref.width);
    const ch = Math.round((1 - crop.top - crop.bottom) * ref.height);
    params.set("rect", `${x},${y},${cw},${ch}`);
  }
  if (w && h) {
    params.set("w", String(w));
    params.set("h", String(h));
    params.set("fit", "crop");
    if (image.hotspot) {
      params.set("crop", "focalpoint");
      params.set("fp-x", String(image.hotspot.x));
      params.set("fp-y", String(image.hotspot.y));
    }
  } else if (w) {
    params.set("w", String(w));
  }
  if (fmt) params.set("fm", fmt);
  if (q) params.set("q", String(q));
  return `${CDN_HOST}/images/${PROJECT}/${DATASET}/${ref.id}-${ref.width}x${ref.height}.${ref.ext}?${params}`;
}

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {} });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) throw new Error(`empty image for ${url}`);
  return buf;
}

async function download(url, file) {
  const buf = await fetchBuffer(url);
  writeFileSync(join(IMG_DIR, file), buf);
  return buf.length;
}

// Sanity's image CDN does not serve AVIF (it answers 400), so AVIF is made here from a
// high-quality JPEG. sharp is a direct dependency of the site.
async function downloadAvif(url, file, q) {
  const { default: sharp } = await import("sharp");
  const buf = await sharp(await fetchBuffer(url)).avif({ quality: Math.max(30, q - 15), effort: 4 }).toBuffer();
  writeFileSync(join(IMG_DIR, file), buf);
  return buf.length;
}

/**
 * Downloads one uploaded image in the given formats.
 * Returns the public path without extension, or null if anything failed (caller keeps the fallback).
 */
async function fetchImage(image, name, { w, h, formats, q = 72 }) {
  const ref = parseRef(image);
  if (!ref) return null;
  const stem = `${name}-${ref.id.slice(0, 8)}`;
  try {
    for (const fmt of formats) {
      const file = `${stem}.${fmt === "jpg" ? "jpg" : fmt}`;
      const size =
        fmt === "avif"
          ? await downloadAvif(imageUrl(image, ref, { w, h, fmt: "jpg", q: 92 }), file, q)
          : await download(imageUrl(image, ref, { w, h, fmt, q }), file);
      imageStats.downloaded++;
      if (size > 250 * 1024) warn(`${file} is ${Math.round(size / 1024)} KB. Ask the editor for a lighter photo or lower q.`);
    }
    return `${IMG_URL}/${stem}`;
  } catch (err) {
    imageStats.failed++;
    warn(`image ${name} failed, keeping previous image: ${err.message}`);
    return null;
  }
}

// ---------- 2. fetch ----------
const QUERY = `*[_type in ["siteSettings","homePage","pagesContent","aircraft","service"] && !(_id in path("drafts.**"))]`;

async function fetchDocs() {
  const url = `${API_HOST}/v2025-01-01/data/query/${DATASET}?perspective=published&query=${encodeURIComponent(QUERY)}`;
  const res = await fetch(url, { headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {} });
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status} ${res.statusText}`);
  const { result } = await res.json();
  if (!Array.isArray(result)) throw new Error("Sanity returned no result array");
  return result;
}

// ---------- 3. per-document mappers (each failure falls back for that document only) ----------
async function syncLogo(image, name, fallbackAlt) {
  const ref = parseRef(image);
  const isSvg = ref.ext === "svg";
  const stem = `${name}-${ref.id.slice(0, 8)}`;
  const file = `${stem}.${isSvg ? "svg" : "png"}`;
  try {
    const params = isSvg ? "" : "?w=640&fm=png";
    await download(`${CDN_HOST}/images/${PROJECT}/${DATASET}/${ref.id}-${ref.width}x${ref.height}.${ref.ext}${params}`, file);
    imageStats.downloaded++;
    const width = isSvg ? ref.width : Math.min(ref.width, 640);
    const height = isSvg ? ref.height : Math.round((ref.height * width) / ref.width);
    return { src: `${IMG_URL}/${file}`, alt: image.alt || fallbackAlt, width, height };
  } catch (err) {
    imageStats.failed++;
    warn(`${name} failed, keeping previous: ${err.message}`);
    return null;
  }
}

async function mapSite(base, doc) {
  const out = merge(base, {
    name: doc.name,
    legalName: doc.legalName,
    tagline: doc.tagline,
    base: doc.base,
    description: doc.description,
    metaTitle: doc.metaTitle,
    messages: doc.messages,
  });
  // Contact details, notices and socials are authoritative: clearing a field removes it.
  // Phone, email, address and hours fall back to the committed company details when left empty.
  const dialable = (value) => {
    const digits = value.replace(/[^\d+]/g, "");
    return digits.startsWith("0") ? `+254${digits.slice(1)}` : digits;
  };
  out.phone = has(doc.phone) ? doc.phone.trim() : (base.phone ?? "");
  out.phoneTel = has(doc.phoneTel) ? doc.phoneTel.trim() : has(doc.phone) ? dialable(doc.phone) : (base.phoneTel ?? "");
  out.address = has(doc.address) ? doc.address.trim() : (base.address ?? "");
  out.hours = Array.isArray(doc.hours) && doc.hours.length ? stripKeys(doc.hours) : (base.hours ?? []);
  out.whatsapp = (doc.whatsapp ?? "").replace(/\D/g, "");
  out.email = has(doc.email) ? doc.email.trim() : (base.email ?? "");
  out.socials = stripKeys(doc.socials ?? []);
  out.notices = {
    conceptPill: doc.notices?.conceptPill ?? "",
    footerNote: doc.notices?.footerNote ?? "",
    illustrativeImages: doc.notices?.illustrativeImages ?? "",
  };
  if (has(doc.wordmarkPrimary) || has(doc.wordmarkSecondary)) {
    out.wordmark = {
      primary: doc.wordmarkPrimary ?? base.wordmark.primary,
      secondary: doc.wordmarkSecondary ?? base.wordmark.secondary,
    };
  }
  if (doc.nav?.length) out.nav = stripKeys(doc.nav);
  if (Array.isArray(doc.credits)) out.credits = stripKeys(doc.credits);

  // Logos: an uploaded logo replaces the committed default; with nothing uploaded the default stays.
  for (const [field, name] of [["logo", "logo"], ["logoCompact", "logo-compact"], ["logoIcon", "logo-icon"]]) {
    if (parseRef(doc[field])) {
      const synced = await syncLogo(doc[field], name, out.name);
      if (synced) out[field] = synced;
    } else {
      out[field] = base[field] ?? null;
    }
  }
  return out;
}

async function responsive(base, cms, name, sizes) {
  const out = { ...base, alt: has(cms?.alt) ? cms.alt : base.alt };
  if ("caption" in base || cms?.caption !== undefined) out.caption = cms?.caption ?? "";
  for (const key of ["desktop", "mobile"]) {
    const stem = cms?.[key] ? await fetchImage(cms[key], `${name}-${key}`, { ...sizes[key], formats: ["avif", "webp", "jpg"] }) : null;
    if (stem) out[key] = stem;
  }
  return out;
}

// Banner photos. With none in the CMS the committed photos stay. A slide without its own phone photo
// uses the wide photo, cropped around its focal point.
async function mapSlides(base, cms) {
  const out = [];
  for (const [i, slide] of (Array.isArray(cms) ? cms : []).entries()) {
    if (!slide?.desktop) continue;
    const alt = has(slide.alt) ? slide.alt : (base[i]?.alt ?? "");
    const desktop = await fetchImage(slide.desktop, `hero-${i + 1}-desktop`, { w: 1920, h: 1080, q: 65, formats: ["avif", "webp", "jpg"] });
    const mobile = await fetchImage(slide.mobile ?? slide.desktop, `hero-${i + 1}-mobile`, { w: 900, h: 1400, q: 65, formats: ["avif", "webp", "jpg"] });
    if (desktop && mobile) out.push({ desktop, mobile, alt });
  }
  return out.length ? out : base;
}

async function mapHome(base, doc) {
  const out = merge(base, {
    hero: { ...doc.hero, image: undefined, slides: undefined },
    intro: { ...doc.intro, image: undefined },
    fleet: doc.fleet,
    arrival: doc.arrival,
    services: doc.services,
    visit: doc.visit,
    closing: doc.closing,
  });
  // Gallery videos are uploaded files served straight from the Sanity CDN.
  const videos = (Array.isArray(doc.gallery?.videos) ? doc.gallery.videos : []).flatMap((item) => {
    const m = typeof item?.video?.asset?._ref === "string" && item.video.asset._ref.match(/^file-([a-f0-9]+)-([a-z0-9]+)$/i);
    return m ? [{ src: `${CDN_HOST}/files/${PROJECT}/${DATASET}/${m[1]}.${m[2]}`, caption: item.caption ?? "" }] : [];
  });
  out.gallery = {
    eyebrow: has(doc.gallery?.eyebrow) ? doc.gallery.eyebrow : base.gallery.eyebrow,
    heading: has(doc.gallery?.heading) ? doc.gallery.heading : base.gallery.heading,
    videos: videos.length ? videos : base.gallery.videos,
  };
  out.hero.slides = await mapSlides(base.hero.slides, doc.hero?.slides);
  out.intro.image = await responsive(base.intro.image, doc.intro?.image, "feature", {
    desktop: { w: 1400, h: 1750, q: 70 },
    mobile: { w: 900, h: 1125, q: 70 },
  });
  return out;
}

async function mapAircraft(baseList, docs) {
  if (docs.length === 0) return baseList;
  const sorted = [...docs].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const out = [];
  for (const doc of sorted) {
    const slug = doc.slug?.current;
    if (!slug || !has(doc.name) || !["active", "coming-soon"].includes(doc.status)) {
      warn(`aircraft "${doc.name ?? doc._id}" skipped: needs a name, web address name and status.`);
      continue;
    }
    const base = baseList.find((a) => a.slug === slug);
    const item = {
      slug,
      name: doc.name,
      registrations: doc.registrations ?? [],
      status: doc.status,
      isPlaceholder: doc.isPlaceholder ?? false,
      summary: doc.summary ?? "",
      specs: { seats: doc.specs?.seats ?? null, range: doc.specs?.range ?? null, cruiseSpeed: doc.specs?.cruiseSpeed ?? null },
      features: doc.features ?? [],
      hero: { ...(base?.hero ?? { desktop: "", mobile: "", alt: "" }) },
      gallery: base?.gallery ?? [],
      order: doc.order ?? out.length + 1,
    };
    if (has(doc.hero?.alt)) item.hero.alt = doc.hero.alt;
    if (doc.hero?.desktop) {
      const stem = await fetchImage(doc.hero.desktop, `aircraft-${slug}`, { w: 1200, h: 800, formats: ["avif", "webp"], q: 70 });
      if (stem) item.hero = { ...item.hero, desktop: `${stem}.avif`, mobile: `${stem}.avif` };
    }
    if (doc.gallery?.length) {
      const gallery = [];
      for (const [i, g] of doc.gallery.entries()) {
        const stem = g.image ? await fetchImage(g.image, `aircraft-${slug}-g${i + 1}`, { w: 1200, h: 800, formats: ["webp"], q: 72 }) : null;
        if (stem) gallery.push({ src: `${stem}.webp`, alt: g.alt ?? "" });
      }
      item.gallery = gallery;
    }
    out.push(item);
  }
  return out.length ? out : baseList;
}

async function mapServices(baseList, docs) {
  if (docs.length === 0) return baseList;
  const sorted = [...docs].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const out = [];
  for (const doc of sorted) {
    const slug = doc.slug?.current;
    if (!slug || !has(doc.title)) {
      warn(`service "${doc.title ?? doc._id}" skipped: needs a title and web address name.`);
      continue;
    }
    const base = baseList.find((s) => s.slug === slug);
    let image = base?.image ?? "";
    if (doc.image) {
      const stem = await fetchImage(doc.image, `service-${slug}`, { w: 1200, h: 800, formats: ["jpg"], q: 78 });
      if (stem) image = `${stem}.jpg`;
    }
    out.push({ slug, title: doc.title, summary: doc.summary ?? "", isPlaceholder: doc.isPlaceholder ?? false, image });
  }
  return out.length ? out : baseList;
}

// ---------- 4. run ----------
async function main() {
  const docs = await fetchDocs();
  const byType = (type) => docs.filter((d) => d._type === type);
  const single = (id) => docs.find((d) => d._id === id);

  rmSync(IMG_DIR, { recursive: true, force: true });
  mkdirSync(IMG_DIR, { recursive: true });

  const result = {};
  const steps = {
    site: async () => (single("siteSettings") ? mapSite(read("site"), single("siteSettings")) : read("site")),
    home: async () => (single("homePage") ? mapHome(read("home"), single("homePage")) : read("home")),
    pages: async () => (single("pagesContent") ? merge(read("pages"), single("pagesContent")) : read("pages")),
    aircraft: () => mapAircraft(read("aircraft"), byType("aircraft")),
    services: () => mapServices(read("services"), byType("service")),
  };
  const fromCms = [];
  for (const [name, run] of Object.entries(steps)) {
    try {
      result[name] = await run();
      fromCms.push(name);
    } catch (err) {
      warn(`${name} failed, using committed JSON: ${err.message}`);
      result[name] = read(name);
    }
  }
  for (const [name, value] of Object.entries(result)) {
    writeFileSync(join(OUT, `${name}.json`), JSON.stringify(value, null, 2) + "\n");
  }
  writeMeta("sanity", `${docs.length} documents, ${imageStats.downloaded} images`);
  log(`Synced from Sanity (${PROJECT}/${DATASET}): ${docs.length} documents, ${imageStats.downloaded} images downloaded, ${imageStats.failed} failed.`);
}

try {
  await main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  if (STRICT) {
    console.error(`[content-sync] FAILED (CMS_SYNC_STRICT=1): ${message}`);
    process.exit(1);
  }
  warn(`Sanity not used, building from committed JSON. Reason: ${message}`);
  writeMeta("fallback", message);
  if (!existsSync(join(OUT, "site.json"))) process.exit(1);
}
