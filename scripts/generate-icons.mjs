/**
 * Генерация PWA-иконок из векторного макета.
 * Запуск: node scripts/generate-icons.mjs
 * Требует sharp (есть в node_modules как зависимость Next.js).
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const GOLD_GRADIENT = `
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#E8CD92"/>
    <stop offset="0.55" stop-color="#C9A365"/>
    <stop offset="1" stop-color="#8F7440"/>
  </linearGradient>`;

const BOTTLE = `
  <g>
    <rect x="216" y="96" width="80" height="58" rx="12" fill="url(#gold)"/>
    <rect x="238" y="158" width="36" height="24" rx="4" fill="#8F7440"/>
    <rect x="168" y="190" width="176" height="216" rx="30"
      fill="rgba(201,163,101,0.10)" stroke="url(#gold)" stroke-width="10"/>
    <rect x="188" y="300" width="136" height="86" rx="16" fill="url(#gold)" opacity="0.92"/>
    <path d="M356 108 L362 128 L382 134 L362 140 L356 160 L350 140 L330 134 L350 128 Z"
      fill="#E8CD92"/>
  </g>`;

function svg({ size = 512, maskable = false }) {
  const inner = maskable
    ? `<g transform="translate(${size * 0.14} ${size * 0.14}) scale(0.72)">${scaledBottle(size)}</g>`
    : scaledBottle(size);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>${GOLD_GRADIENT}</defs>
  <rect width="${size}" height="${size}" fill="#0A0A0F"/>
  ${inner}
</svg>`;
}

/** Бутылочка нарисована в поле 512 — масштабируем под нужный холст. */
function scaledBottle(size) {
  const scale = size / 512;
  return `<g transform="scale(${scale})">${BOTTLE}</g>`;
}

const targets = [
  { file: "public/icons/icon-192.png", size: 192 },
  { file: "public/icons/icon-512.png", size: 512 },
  { file: "public/icons/icon-512-maskable.png", size: 512, maskable: true },
  { file: "src/app/apple-icon.png", size: 180 },
  { file: "src/app/icon.png", size: 64 },
];

for (const target of targets) {
  const out = path.join(root, target.file);
  await mkdir(path.dirname(out), { recursive: true });
  const source = Buffer.from(
    svg({ size: target.size, maskable: Boolean(target.maskable) }),
  );
  await sharp(source, { density: 300 }).png().toFile(out);
  console.log("✓", target.file);
}

// Векторный favicon для современных браузеров
await writeFile(path.join(root, "src/app/icon.svg"), svg({ size: 512 }), "utf8");
console.log("✓ src/app/icon.svg");
