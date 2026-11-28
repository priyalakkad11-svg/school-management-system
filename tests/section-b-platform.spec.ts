import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

function loadRoleCookies(role: "admin" | "staff") {
  const filePath = path.join(process.cwd(), "test-results", ".auth", `${role}.json`);
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
    cookies?: Parameters<import("@playwright/test").BrowserContext["addCookies"]>[0];
  };
  return parsed.cookies ?? [];
}

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

test.describe("Section B: Platform Guards, Dual Login & Per-School Microsites", () => {
  test("unauthenticated request to /platform redirects to /login?next=%2Fplatform", async ({ page }) => {
    await page.goto("/platform", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/login\?next=%2Fplatform/);
  });

  test("tenant school admin & staff are blocked from /platform", async ({ page, context }) => {
    await context.addCookies(loadRoleCookies("admin"));
    await page.goto("/platform", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/403/);
  });

  test("supports dual login via School Code + User ID (?school=GIA01)", async ({ page }) => {
    const password = getSeedPassword();
    await page.goto("/login?school=GIA01", { waitUntil: "load" });
    await page.getByRole("radio", { name: "Student" }).click();
    await page.getByLabel("School Code").fill("GIA01");
    await page.getByLabel("Email or Admission / Employee ID").fill("ADM-2026-0142");
    await page.getByLabel("Password").fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/student**", { timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Student Dashboard/i })).toBeVisible();
  });

  test("renders public school microsite /s/GIA01 & subpages with JSON-LD", async ({ page }) => {
    await page.goto("/s/GIA01", { waitUntil: "load" });
    await expect(page.getByRole("heading", { name: /Greenwood International Academy/i })).toBeVisible();
    const orgScript = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(orgScript).toContain("EducationalOrganization");

    await page.goto("/s/GIA01/admissions", { waitUntil: "load" });
    await expect(page.getByRole("heading", { name: /Admissions/i })).toBeVisible();

    await page.goto("/s/GIA01/events", { waitUntil: "load" });
    const evScript = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(evScript).toContain("Event");

    await page.goto("/s/GIA01/notices", { waitUntil: "load" });
    await expect(page.getByRole("heading", { name: /Notice Board/i })).toBeVisible();

    await page.goto("/s/GIA01/contact", { waitUntil: "load" });
    await expect(page.getByRole("heading", { name: /Contact/i })).toBeVisible();
  });
});
