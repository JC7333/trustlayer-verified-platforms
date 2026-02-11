import { expect, test } from "@playwright/test";

test("smoke: homepage loads @smoke", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#root")).toBeVisible();
});
