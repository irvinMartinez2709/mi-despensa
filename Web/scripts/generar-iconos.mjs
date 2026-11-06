import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

/**
 * Genera los iconos de Android (legacy + adaptativos) de Mi Despensa
 * a partir de la tesela con degradado del icono oficial.
 *
 * Uso (desde Web/):  npm install --no-save sharp && node scripts/generar-iconos.mjs
 * En CI se ejecuta DESPUÉS de `npx cap add android` + `npx cap sync`.
 */

const SRC = path.resolve("public/iconos/icono-transparente-512.png");
const ANDROID = path.resolve("android/app/src/main/res");

// Color de fondo del icono adaptativo: azul cielo promedio del borde del icono.
const BG = { r: 108, g: 189, b: 235 }; // #6CBDEB
const BG_HEX = "#6CBDEB";
const PROP_FOREGROUND = 0.66; // tesela dentro de la zona segura (66/108 dp)

// Base: se usa a resolución nativa y de ahí solo se reduce (mejor calidad).
const BASE = await sharp(SRC).ensureAlpha().png().toBuffer();

const DENSIDADES = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
// Canvas del ícono adaptativo por densidad (108dp base): mdpi=108 … xxxhdpi=432
const CANVAS = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };

// Ícono legacy: la tesela tal cual (ya trae sus esquinas redondeadas).
async function legacy(tam) {
  return sharp(BASE)
    .resize(tam, tam, { fit: "fill" })
    .png()
    .toBuffer();
}

// Foreground adaptativo: tesela centrada sobre lienzo del color de marca.
async function foreground(canvas) {
  const lado = Math.max(8, Math.round(canvas * PROP_FOREGROUND));
  const tesela = await sharp(BASE)
    .resize(lado, lado, { fit: "fill" })
    .png()
    .toBuffer();
  return sharp({
    create: { width: canvas, height: canvas, channels: 4, background: { ...BG, alpha: 1 } },
  })
    .composite([
      { input: tesela, top: Math.round((canvas - lado) / 2), left: Math.round((canvas - lado) / 2) },
    ])
    .png()
    .toBuffer();
}

// Color de fondo del icono adaptativo
fs.mkdirSync(path.join(ANDROID, "values"), { recursive: true });
fs.writeFileSync(
  path.join(ANDROID, "values", "ic_launcher_background.xml"),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${BG_HEX}</color>
</resources>`
);

for (const d of Object.keys(DENSIDADES)) {
  const dir = path.join(ANDROID, `mipmap-${d}`);
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) {
    if (/^ic_launcher/.test(f)) fs.rmSync(path.join(dir, f), { force: true });
  }
}

for (const [d, tam] of Object.entries(DENSIDADES)) {
  const dir = path.join(ANDROID, `mipmap-${d}`);
  const leg = await legacy(tam);
  const fg = await foreground(CANVAS[d]);
  await sharp(leg).toFile(path.join(dir, "ic_launcher.png"));
  await sharp(leg).toFile(path.join(dir, "ic_launcher_round.png"));
  await sharp(fg).toFile(path.join(dir, "ic_launcher_foreground.png"));
  console.log(`mipmap-${d}: legacy ${tam}px, foreground ${CANVAS[d]}px`);
}

const xml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;
const anydpi = path.join(ANDROID, "mipmap-anydpi-v26");
fs.mkdirSync(anydpi, { recursive: true });
fs.writeFileSync(path.join(anydpi, "ic_launcher.xml"), xml);
fs.writeFileSync(path.join(anydpi, "ic_launcher_round.xml"), xml);

console.log("Iconos de Mi Despensa escritos en android/app/src/main/res");
