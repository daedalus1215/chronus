import { test, expect } from '@playwright/test';

test('basic application test', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');
  
  // Verify that the page has loaded
  await expect(page).toHaveTitle(/React/);
  
  // Add more specific tests based on your application
  // For example:
  // await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
}); 