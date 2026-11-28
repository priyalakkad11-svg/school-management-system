import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "src/app");
const EXTENSIONS = new Set([".ts", ".tsx"]);

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTENSIONS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const BACKED_PATTERN = /(from\s+["']@\/(?:app\/actions|services)\/|createClient\(|fetch\()/;
const violations: string[] = [];

for (const file of walk(APP_DIR)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  // Ignore UI shell / platform preview / test utilities
  if (!rel.endsWith("page.tsx")) continue;
  const content = fs.readFileSync(file, "utf8");
  if (!content.includes("showToast(")) continue;
  if (!BACKED_PATTERN.test(content)) {
    violations.push(`${rel} calls showToast() without importing a server action, fetch(), or Supabase client`);
  }
}

if (violations.length > 0) {
  console.error(`check:toasts failed (${violations.length} unbacked toast pages):`);
  for (const v of violations) {
    console.error(`  - ${v}`);
  }
  process.exit(1);
}

console.log("check:toasts passed (all page showToast calls are backend-backed).");
