import { expect, test } from "@playwright/test";

test("smoke: homepage loads @smoke", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("#root")).toBeAttached();
});
