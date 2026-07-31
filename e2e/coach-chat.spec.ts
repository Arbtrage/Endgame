import { test, expect } from "@playwright/test";

test("coach chat page loads for unauthenticated users", async ({ page }) => {
  await page.goto("/coach");
  await expect(page).toHaveURL(/auth\/sign-in/);
});

test("coach chat route is registered", async ({ page }) => {
  const response = await page.request.get("/coach");
  expect([200, 307, 308]).toContain(response.status());
});
