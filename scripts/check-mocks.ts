import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = ["src/app", "src/components", "src/services", "src/lib"].map((d) =>
  path.join(ROOT, d),
);
const MOCK_IMPORT_PATTERN = /(from\s+["'](?:@\/mocks|(?:\.\.\/)+mocks)|import\s*\(\s*["']@\/mocks)/;
const EXTENSIONS = new Set([".ts", ".tsx"]);

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

const violations: string[] = [];
for (const dir of TARGET_DIRS) {
  for (const file of walk(dir)) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (MOCK_IMPORT_PATTERN.test(line)) {
        violations.push(`${path.relative(ROOT, file)}:${idx + 1} -> ${line.trim()}`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error(`check:mocks failed (${violations.length} runtime mock imports found):`);
  for (const v of violations) {
    console.error(`  - ${v}`);
  }
  process.exit(1);
}

console.log("check:mocks passed (0 runtime imports from src/mocks).");
