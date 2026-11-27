import fs from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { SCREEN_ROUTES, type PortalRole } from "../src/lib/routes";

const filterModule = process.env.TEST_MODULE;
const routesToTest = filterModule
  ? SCREEN_ROUTES.filter((r) => r.module === filterModule)
  : SCREEN_ROUTES;

type AuthRole = "admin" | "teacher" | "student" | "parent";

function resolveAuthRole(role: PortalRole): AuthRole {
  if (role === "teacher" || role === "student" || role === "parent" || role === "admin") {
    return role;
  }
  return "admin";
}

function loadStoredCookies(role: AuthRole) {
  const filePath = path.join(process.cwd(), "test-results", ".auth", `${role}.json`);
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
    cookies?: Parameters<import("@playwright/test").BrowserContext["addCookies"]>[0];
  };
  return parsed.cookies ?? [];
}

for (const item of routesToTest) {
  test(`[${item.num}] ${item.figmaName} (${item.route})`, async ({ page, context }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    if (item.role !== "public" && item.role !== "auth") {
      await context.addCookies(loadStoredCookies(resolveAuthRole(item.role)));
    }

    const res = await page.goto(item.route, { waitUntil: "load" });
    expect(res?.status()).toBeLessThan(400);
    await page.locator("main").first().waitFor({ state: "visible", timeout: 10000 });
    await page.locator("h1").first().waitFor({ state: "visible", timeout: 10000 });
    await page.evaluate(() => document.fonts.ready);

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });
    expect(overflow, `Horizontal overflow on ${item.route}`).toBe(false);

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations, `Axe violations on ${item.route}`).toEqual([]);
    expect(errors, `Console/page errors on ${item.route}`).toEqual([]);
  });
}
