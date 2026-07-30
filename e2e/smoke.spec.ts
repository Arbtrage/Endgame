import { test, expect } from "@playwright/test";

test("demo page loads playable heading", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByRole("heading", { name: /try a demo game/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /sign up to save progress/i })).toBeVisible();
});

test("computer setup page loads for authenticated users", async ({ page }) => {
  await page.goto("/play/computer");
  await expect(page).toHaveURL(/auth\/sign-in/);
});
