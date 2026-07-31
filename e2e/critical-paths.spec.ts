import { test, expect } from "@playwright/test";

test.describe("Critical paths", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("demo page loads without auth", async ({ page }) => {
    await page.goto("/demo");
    await expect(page.getByText(/demo|try|sign up/i).first()).toBeVisible();
  });

  test("sign-in page loads", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("analyze page redirects or shows auth", async ({ page }) => {
    await page.goto("/analyze");
    await expect(page).toHaveURL(/sign-in|analyze/);
  });

  test("train page redirects or shows content", async ({ page }) => {
    await page.goto("/train");
    await expect(page).toHaveURL(/sign-in|train/);
  });

  test("progress page redirects or shows content", async ({ page }) => {
    await page.goto("/progress");
    await expect(page).toHaveURL(/sign-in|progress/);
  });
});
