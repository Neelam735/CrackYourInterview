// Captures every slide of every visualization as a PNG, plus its narration text.
//
//   node scripts/video/capture.mjs [--base http://localhost:3000] [--out .video-build] [id ...]
//
// Needs the site running (npm run build && npm start). Set CHROMIUM_PATH to use
// a specific Chromium binary; otherwise Playwright's default browser is used.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const [value] = args.splice(i, 2).slice(1);
  return value;
};
const base = option("--base", "http://localhost:3000");
const outDir = option("--out", ".video-build");

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
// 1280×720 layout rendered at 1.5× gives 1920×1080 frames.
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });

const ids = args.length > 0 ? args : await listIds();
for (const id of ids) {
  await page.goto(`${base}/render/${id}`, { waitUntil: "networkidle" });
  await page.waitForSelector("body[data-video-ready]");
  const script = await page.evaluate(() => ({ id: window.__video.id, title: window.__video.title, narration: window.__video.narration }));
  const dir = path.join(outDir, id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (let slide = 0; slide < script.narration.length; slide++) {
    await page.evaluate((n) => window.__video.show(n), slide);
    const overflow = await page.evaluate(() => {
      const stage = document.getElementById("video-stage");
      return [...stage.querySelectorAll("*")].some((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > 1281 || r.bottom > 721);
      });
    });
    if (overflow) console.warn(`  warning: ${id} slide ${slide} overflows the frame`);
    await page.locator("#video-stage").screenshot({ path: path.join(dir, `slide-${String(slide).padStart(3, "0")}.png`) });
  }
  fs.writeFileSync(path.join(dir, "script.json"), JSON.stringify(script, null, 2));
  console.log(`${id}: ${script.narration.length} slides`);
}
await browser.close();

async function listIds() {
  await page.goto(`${base}/render`);
  return JSON.parse(await page.locator("#video-ids").textContent());
}
