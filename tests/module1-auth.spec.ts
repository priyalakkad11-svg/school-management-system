import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

function getSeedPassword(): string {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^SEED_DEFAULT_PASSWORD=(.*)$/);
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  return process.env.SEED_DEFAULT_PASSWORD ?? "";
}

test.describe("Module 1: Supabase Auth & Role Guards", () => {
  test("unauthenticated request to /admin redirects to /login?next=%2Fadmin", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin/);
  });

  test("rejects mismatched portal role login", async ({ page }) => {
    const password = getSeedPassword();
    await page.goto("/login", { waitUntil: "load" });
    await page.getByRole("radio", { name: "Student" }).click();
    await page.getByLabel("Email or Admission / Employee ID").fill("priya.lakkad@greenwood.edu");
    await page.getByLabel("Password").fill(password);
    await page.locator('button[type="submit"]').click();
    await expect(page.getByText(/belongs to the admin portal/i)).toBeVisible();
  });

  test("allows sign-in via Admission ID and sign-out", async ({ page }) => {
    const password = getSeedPassword();
    await page.goto("/login", { waitUntil: "load" });
    await page.getByRole("radio", { name: "Student" }).click();
    await page.getByLabel("Email or Admission / Employee ID").fill("ADM-2026-0142");
    await page.getByLabel("Password").fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/student**", { timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Student Dashboard/i })).toBeVisible();

    if ((page.viewportSize()?.width ?? 1440) < 1024) {
      await page.getByRole("button", { name: /Open navigation menu/i }).click();
    }

    await page.getByRole("button", { name: /Sign Out/i }).click();
    await page.waitForURL("**/login**", { timeout: 15000 });
  });
});
