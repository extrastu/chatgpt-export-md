import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const svgPath = path.join(rootDir, "icons", "icon.svg");
const sizes = [16, 32, 48, 128];

const svg = await fs.readFile(svgPath);

for (const size of sizes) {
  const outputPath = path.join(rootDir, "icons", `icon${size}.png`);
  await sharp(svg).resize(size, size).png().toFile(outputPath);
  console.log(`Generated ${outputPath}`);
}
