import { test, expect } from "@playwright/test";

test("AI setup page loads for unauthenticated users", async ({ page }) => {
  await page.goto("/play/ai");
  await expect(page).toHaveURL(/auth\/sign-in/);
});

test("coach setup page loads for unauthenticated users", async ({ page }) => {
  await page.goto("/play/coach");
  await expect(page).toHaveURL(/auth\/sign-in/);
});

test("coach chat page loads for unauthenticated users", async ({ page }) => {
  await page.goto("/coach");
  await expect(page).toHaveURL(/auth\/sign-in/);
});
