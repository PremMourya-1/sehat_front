// Regenerates public/og-image.jpg from src/assets/onShare.png, and writes
// its real output dimensions to src/Data/ogImageMeta.json so app/layout.js
// can read the correct og:image:width/height without anyone needing to
// hand-edit those numbers whenever the source image changes.
//
// Runs automatically before `npm run dev` and `npm run build` (see the
// "predev"/"prebuild" scripts in package.json) — swap out
// src/assets/onShare.png for a new image and the next dev/build picks it
// up on its own. To regenerate without starting either, run this directly:
//   node scripts/generate-og-image.js
const path = require("path");
const fs = require("fs");

let sharp;
try {
  sharp = require("sharp");
} catch {
  console.warn("generate-og-image: sharp isn't installed, skipping (public/og-image.jpg left as-is)");
  process.exit(0);
}

const SOURCE = path.join(__dirname, "..", "src", "assets", "onShare.png");
const OUTPUT_IMAGE = path.join(__dirname, "..", "public", "og-image.jpg");
const OUTPUT_META = path.join(__dirname, "..", "src", "Data", "ogImageMeta.json");

// 1200px wide comfortably clears the Open Graph spec's 1200x630 minimum
// width regardless of the source image's own resolution or aspect ratio.
const TARGET_WIDTH = 1200;

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.warn(`generate-og-image: ${SOURCE} not found, skipping (public/og-image.jpg left as-is)`);
    return;
  }

  const source = sharp(SOURCE);
  const { width: sourceWidth, height: sourceHeight } = await source.metadata();
  const targetHeight = Math.round((sourceHeight / sourceWidth) * TARGET_WIDTH);

  await source
    .resize(TARGET_WIDTH, targetHeight)
    // Flattens any transparency onto a brand-cream background instead of
    // compositing onto black (JPEG has no alpha channel) — matches
    // --background in globals.css.
    .flatten({ background: "#f5ede0" })
    .jpeg({ quality: 87 })
    .toFile(OUTPUT_IMAGE);

  fs.mkdirSync(path.dirname(OUTPUT_META), { recursive: true });
  fs.writeFileSync(
    OUTPUT_META,
    JSON.stringify({ width: TARGET_WIDTH, height: targetHeight }, null, 2) + "\n",
  );

  console.log(`generate-og-image: wrote ${OUTPUT_IMAGE} (${TARGET_WIDTH}x${targetHeight})`);
}

main().catch((err) => {
  console.error("generate-og-image failed:", err);
  // Non-fatal — an out-of-date OG image is far better than a broken
  // dev/build over a share-preview asset issue.
  process.exit(0);
});
