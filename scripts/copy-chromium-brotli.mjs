import fs from "node:fs";
import path from "node:path";

const src = path.join(process.cwd(), "node_modules", "@sparticuz", "chromium", "bin");
const dest = path.join(process.cwd(), "chromium-brotli"); // ✅ carpeta del repo (runtime bundleable)

function copyDirSync(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyDirSync(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (!fs.existsSync(src)) {
  console.error(`[copy-chromium] No existe: ${src}`);
  process.exit(1);
}

copyDirSync(src, dest);
console.log(`[copy-chromium] Copiado ${src} -> ${dest}`);