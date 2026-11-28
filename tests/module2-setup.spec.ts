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

test.describe("Module 2: School Setup & Staff RBAC", () => {
  test("blocks non-admin staff from accessing /admin/setup/roles and /admin/audit-logs", async ({
    page,
    context,
  }) => {
    await context.addCookies(loadRoleCookies("staff"));
    await page.goto("/admin/setup/roles", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/403/);

    await page.goto("/admin/audit-logs", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/403/);

    await page.goto("/admin/students", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/403/);

    await page.goto("/admin/exams", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/403/);
  });

  test("loads live school settings, classes, mappings, RBAC, and users from Supabase", async ({
    page,
    context,
  }) => {
    await context.addCookies(loadRoleCookies("admin"));

    await page.goto("/admin/setup/school-profile", { waitUntil: "load" });
    await expect(page.getByLabel("School Name")).toHaveValue("Greenwood International Academy");

    await page.goto("/admin/setup/academic-years", { waitUntil: "load" });
    await expect(
      page.getByText("AY 2026–27 (Current)").filter({ visible: true }).first(),
    ).toBeVisible();

    await page.goto("/admin/setup/classes", { waitUntil: "load" });
    await expect(page.getByText("Class 10").filter({ visible: true }).first()).toBeVisible();

    await page.goto("/admin/setup/subject-mapping", { waitUntil: "load" });
    await expect(page.getByText("Mathematics").filter({ visible: true }).first()).toBeVisible();

    await page.goto("/admin/setup/roles", { waitUntil: "load" });
    await expect(page.getByText("Fees & Receipts").filter({ visible: true }).first()).toBeVisible();

    await page.goto("/admin/setup/users", { waitUntil: "load" });
    await expect(
      page.getByText("priya.lakkad@greenwood.edu").filter({ visible: true }).first(),
    ).toBeVisible();
  });

  test("persists subject create & delete round-trip in Supabase", async ({
    page,
    context,
  }, testInfo) => {
    const tag = testInfo.project.name.slice(0, 1).toUpperCase();
    const code = `E2E-${tag}-${Date.now().toString().slice(-4)}`;
    await context.addCookies(loadRoleCookies("admin"));
    await page.goto("/admin/setup/subjects", { waitUntil: "load" });

    await page.getByLabel("Subject Name").fill("Playwright Robotics Lab");
    await page.getByLabel("Subject Code").fill(code);
    await page.getByRole("button", { name: /Save Subject/i }).click();

    await expect(page.getByText(code).first()).toBeVisible();
    await page.reload({ waitUntil: "load" });
    await expect(page.getByText(code).first()).toBeVisible();

    const row = page.locator("tr", { hasText: code });
    await row.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText(code)).toHaveCount(0);
  });
});
