import fs from "node:fs";
import path from "node:path";
import { chromium, type FullConfig } from "@playwright/test";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const ROLE_ACCOUNTS = [
  { role: "admin", label: "Admin", email: "priya.lakkad@greenwood.edu", expectedPath: "/admin" },
  { role: "teacher", label: "Teacher", email: "kavita.nair@greenwood.edu", expectedPath: "/teacher" },
  { role: "student", label: "Student", email: "aarav.sharma@student.greenwood.edu", expectedPath: "/student" },
  { role: "parent", label: "Parent", email: "rajesh.sharma@gmail.com", expectedPath: "/parent" },
  { role: "staff", label: "Staff", email: "mohan.joshi@greenwood.edu", expectedPath: "/admin/staff" },
] as const;

export default async function globalSetup(config: FullConfig) {
  loadEnvLocal();
  const password = process.env.SEED_DEFAULT_PASSWORD?.trim();
  if (!password) {
    throw new Error("SEED_DEFAULT_PASSWORD must be set in .env.local to run authenticated E2E tests.");
  }

  const baseURL = config.projects[0]?.use?.baseURL ?? "http://127.0.0.1:3000";
  const authDir = path.join(process.cwd(), "test-results", ".auth");
  fs.mkdirSync(authDir, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const acc of ROLE_ACCOUNTS) {
      const context = await browser.newContext({ baseURL });
      const page = await context.newPage();
      await page.goto("/login", { waitUntil: "load" });
      await page.getByRole("radio", { name: acc.label }).click();
      await page.getByLabel("Email or Admission / Employee ID").fill(acc.email);
      await page.getByLabel("Password").fill(password);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(`**${acc.expectedPath}**`, { timeout: 20000 });
      await context.storageState({ path: path.join(authDir, `${acc.role}.json`) });
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
