import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const ALLOWED_FILES = new Set([
  path.normalize(path.join(SRC_DIR, "app", "globals.css")),
  path.normalize(path.join(SRC_DIR, "styles", "tokens.css")),
]);

const COLOR_PATTERN =
  /(#[0-9a-fA-F]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\(|(?:bg|text|border|ring|fill|stroke)-\[#[^\]]+\]|(?:bg|text|border|ring)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b)/g;

const EXTENSIONS = new Set([".ts", ".tsx", ".css"]);

function walk(dir: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(path.normalize(full));
    }
  }
  return files;
}

const violations: string[] = [];
for (const file of walk(SRC_DIR)) {
  if (ALLOWED_FILES.has(file)) continue;
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
    const matches = line.match(COLOR_PATTERN);
    if (matches) {
      violations.push(`${path.relative(ROOT, file)}:${idx + 1} -> ${matches.join(", ")}`);
    }
  });
}

if (violations.length > 0) {
  console.error("Token check failed! Raw or non-token color values found outside theme tokens:");
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

console.log("check:tokens passed (0 raw color violations outside theme tokens).");

