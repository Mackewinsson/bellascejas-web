#!/usr/bin/env node
/**
 * Convert scraped page JSON ? clean Markdown for Bellascejas content repo.
 */
const fs = require("fs");
const path = require("path");

const RAW = path.join(__dirname, "_raw");
const CONTENT = path.join(__dirname, "content");

const SKIP_EXACT = new Set([
  "Ir al contenido",
  "Scroll al inicio",
  "WhatsApp",
  "Hola",
  "¿En qué podemos ayudarte?",
  "Abrir chat",
  "Previous slide",
  "Next slide",
  "Buscar",
  "Menu",
  "Alternar menú",
]);

const NAV_NOISE = [
  /^Servicios En Miami/i,
  /^Servicios en Miami/i,
  /^Servicios En Santiago/i,
  /^Servicios en Santiago/i,
  /^Productos/i,
  /^Cursos/i,
  /^Gift Card/i,
  /^Clientes/i,
  /^Preguntas Frecuentes$/i,
  /^Contacto$/i,
  /^Cejas$/i,
  /^Depilación$/i,
  /^Electrocauterizacion$/i,
  /^Faciales$/i,
  /^Microblading/i,
  /^Retoques/i,
  /^Pestañas$/i,
  /^Curso de/i,
  /^Curso De/i,
  /^Diseño de cejas/i,
  /^Comentarios en Instagram$/i,
  /^Resultados$/i,
  /^Reseñas de Google$/i,
  /^Copyright ©/i,
  /^Powered by/i,
  /^https:\/\/diseñoswebjg/i,
  /^https:\/\/xn--/i,
];

function isNoise(text) {
  if (!text) return true;
  if (SKIP_EXACT.has(text)) return true;
  if (NAV_NOISE.some((re) => re.test(text))) return true;
  // emoji-only / flag noise
  if (/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s????????]+$/u.test(text)) return true;
  return false;
}

function blocksToMd(blocks) {
  const lines = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      lines.push("");
      inList = false;
    }
  };

  for (const b of blocks) {
    const t = (b.text || "").trim();
    if (b.type === "img") {
      flushList();
      const alt = b.alt || "imagen";
      if (b.src && !b.src.includes("data:")) {
        lines.push(`![${alt}](${b.src})`);
        lines.push("");
      }
      continue;
    }
    if (isNoise(t)) continue;

    if (b.type === "li") {
      lines.push(`- ${t}`);
      inList = true;
      continue;
    }
    flushList();

    if (b.type === "h1") lines.push(`# ${t}`, "");
    else if (b.type === "h2") lines.push(`## ${t}`, "");
    else if (b.type === "h3") lines.push(`### ${t}`, "");
    else if (b.type === "h4") lines.push(`#### ${t}`, "");
    else if (b.type === "h5") lines.push(`##### ${t}`, "");
    else if (b.type === "h6") lines.push(`###### ${t}`, "");
    else if (b.type === "a") {
      lines.push(`[${t}](${b.href})`, "");
    } else if (b.type === "table") {
      lines.push("```", t, "```", "");
    } else {
      // paragraph  skip if too short duplicate of heading style nav crumbs
      if (t.length < 2) continue;
      lines.push(t, "");
    }
  }
  flushList();

  // Collapse excessive blank lines
  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Prefer plain text fallback when blocks are too sparse */
function plainToMd(plain) {
  if (!plain) return "";
  const lines = plain.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const out = [];
  for (const line of lines) {
    if (isNoise(line)) continue;
    if (NAV_NOISE.some((re) => re.test(line))) continue;
    out.push(line, "");
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

const MANIFEST = [
  {
    json: "home.json",
    out: "home.md",
    title: "Inicio",
    source_url: "https://bellascejas.com/",
  },
  {
    json: "cejas.json",
    out: "servicios-miami/cejas.md",
    title: "Cejas",
    source_url: "https://bellascejas.com/cejas/",
  },
  {
    json: "depilacion.json",
    out: "servicios-miami/depilacion.md",
    title: "Depilación",
    source_url: "https://bellascejas.com/depilacion/",
  },
  {
    json: "electrocauterizacion.json",
    out: "servicios-miami/electrocauterizacion.md",
    title: "Electrocauterización",
    source_url: "https://bellascejas.com/electrocauterizacion/",
  },
  {
    json: "faciales.json",
    out: "servicios-miami/faciales.md",
    title: "Faciales",
    source_url: "https://bellascejas.com/faciales/",
  },
  {
    json: "microblading-micropigmentacion.json",
    out: "servicios-miami/microblading-micropigmentacion.md",
    title: "Microblading / Micropigmentación",
    source_url: "https://bellascejas.com/microblading-micropigmentacion/",
  },
  {
    json: "retoques-mantenimientos.json",
    out: "servicios-miami/retoques-mantenimientos.md",
    title: "Retoques & Mantenimientos",
    source_url: "https://bellascejas.com/retoques-mantenimientos/",
  },
  {
    json: "pestanas.json",
    out: "servicios-miami/pestanas.md",
    title: "Pestañas",
    source_url: "https://bellascejas.com/pestanas/",
  },
  {
    json: "curso-de-microblading.json",
    out: "cursos/microblading.md",
    title: "Curso de Microblading",
    source_url: "https://bellascejas.com/curso-de-microblading/",
  },
  {
    json: "curso-de-eyelash-extensions.json",
    out: "cursos/eyelash-extensions.md",
    title: "Curso de Eyelash Extensions",
    source_url: "https://bellascejas.com/curso-de-eyelash-extensions/",
  },
  {
    json: "diseno-cejas-brow-lamination.json",
    out: "cursos/diseno-cejas-brow-lamination.md",
    title: "Diseño de cejas + Brow lamination y pestañas por racimo",
    source_url:
      "https://bellascejas.com/diseno-de-cejas-brown-lamination-y-pestanas-por-racimo/",
  },
  {
    json: "gift-card.json",
    out: "gift-card.md",
    title: "Gift Card",
    source_url: "https://bellascejas.com/gift-card/",
  },
  {
    json: "comentarios-instagram.json",
    out: "clientes/comentarios-instagram.md",
    title: "Comentarios en Instagram",
    source_url: "https://bellascejas.com/comentarios-en-instagram/",
  },
  {
    json: "resultados.json",
    out: "clientes/resultados.md",
    title: "Resultados",
    source_url: "https://bellascejas.com/resultados/",
  },
  {
    json: "resenas-google.json",
    out: "clientes/resenas-google.md",
    title: "Reseñas de Google",
    source_url: "https://bellascejas.com/4980-2/",
  },
  {
    json: "faq.json",
    out: "preguntas-frecuentes.md",
    title: "Preguntas Frecuentes",
    source_url: "https://bellascejas.com/faq/",
  },
  {
    json: "contacto.json",
    out: "contacto.md",
    title: "Contacto",
    source_url: "https://bellascejas.com/contacto/",
  },
  {
    json: "servicio-chile.json",
    out: "servicios-santiago/index.md",
    title: "Servicios en Santiago, Chile",
    source_url:
      "https://bellascejas.com/servicio-en-chile-%f0%9f%87%a8%f0%9f%87%b1/",
  },
];

for (const item of MANIFEST) {
  const rawPath = path.join(RAW, item.json);
  const data = JSON.parse(fs.readFileSync(rawPath, "utf8"));
  let body = blocksToMd(data.blocks || []);
  // If body is too thin, use plain
  if (body.length < 120 && data.plain) {
    body = plainToMd(data.plain);
  }
  const pageTitle = data.h1 || item.title;
  const fm = [
    "---",
    `title: "${pageTitle.replace(/"/g, '\\"')}"`,
    `source_url: "${item.source_url}"`,
    `locale_hint: es`,
    "---",
    "",
  ].join("\n");

  const outPath = path.join(CONTENT, item.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, fm + body + "\n", "utf8");
  console.log("wrote", item.out, "(" + (fm + body).length + " chars)");
}

console.log("done", MANIFEST.length, "pages");
