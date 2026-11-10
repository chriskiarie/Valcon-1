/*
 * Demo asset pipeline. Run from site/: node ../docs/process-images.cjs
 * Originals live in ../assets-source/photos-raw and are never deployed.
 * Only the derived files in site/public/images are shipped.
 */
const path = require("path");
const fs = require("fs");
const sharp = require(path.join(process.cwd(), "node_modules", "sharp"));

const root = path.resolve(__dirname, "..");
const raw = path.join(root, "assets-source", "photos-raw");
const pub = path.join(root, "site", "public", "images");

function ensure(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function writeVariants(input, outputDir, base, width, height, options = {}) {
  ensure(outputDir);
  const crop = options.crop;
  let pipeline = sharp(input);
  if (crop) pipeline = pipeline.extract(crop);
  pipeline = pipeline.resize(width, height, { fit: "cover", position: options.position || "centre" });

  const avif = pipeline.clone().avif({ quality: options.avifQuality || 48, effort: 6 });
  const webp = pipeline.clone().webp({ quality: options.webpQuality || 72, effort: 6 });
  await avif.toFile(path.join(outputDir, `${base}.avif`));
  await webp.toFile(path.join(outputDir, `${base}.webp`));
  if (options.jpg !== false) {
    await pipeline.clone().jpeg({ quality: options.jpgQuality || 80, mozjpeg: true }).toFile(path.join(outputDir, `${base}.jpg`));
  }
}

async function main() {
  const hero = path.join(raw, "hero-munich-sunset-raw.jpg");
  await writeVariants(hero, path.join(pub, "hero"), "hero-desktop", 1920, 1080, {
    crop: { left: 0, top: 80, width: 2000, height: 1125 },
    avifQuality: 45,
    webpQuality: 68,
    jpgQuality: 78,
  });
  await writeVariants(hero, path.join(pub, "hero"), "hero-mobile", 900, 1400, {
    crop: { left: 300, top: 0, width: 900, height: 1333 },
    avifQuality: 45,
    webpQuality: 68,
    jpgQuality: 78,
  });

  const parallax = path.join(raw, "parallax-wing-clouds-raw.jpg");
  await writeVariants(parallax, path.join(pub, "features"), "parallax-desktop", 1400, 1750, {
    crop: { left: 0, top: 120, width: 3024, height: 3780 },
    avifQuality: 42,
    webpQuality: 66,
    jpg: false,
  });
  await writeVariants(parallax, path.join(pub, "features"), "parallax-mobile", 900, 1125, {
    crop: { left: 0, top: 120, width: 3024, height: 3780 },
    avifQuality: 42,
    webpQuality: 66,
    jpg: false,
  });

  const fleet = [
    {
      src: path.join(raw, "fleet-crj-n96ap-raw.jpg"),
      base: "fleet-crj200-01",
      crop: { left: 0, top: 0, width: 2791, height: 1861 },
    },
    {
      src: path.join(raw, "fleet-crj-delta-raw.jpg"),
      base: "fleet-sample-a",
    },
    {
      src: path.join(raw, "fleet-crj-lufthansa-raw.jpg"),
      base: "fleet-sample-b",
    },
  ];
  for (const item of fleet) {
    await writeVariants(item.src, path.join(pub, "fleet"), item.base, 1200, 800, {
      crop: item.crop,
      avifQuality: 45,
      webpQuality: 68,
      jpg: false,
    });
  }

  const dirs = ["hero", "features", "fleet"];
  for (const dir of dirs) {
    console.log(`\n${dir}`);
    for (const file of fs.readdirSync(path.join(pub, dir))) {
      const stat = fs.statSync(path.join(pub, dir, file));
      console.log(`${file.padEnd(32)} ${(stat.size / 1024).toFixed(1)} KB`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
