import { test, expect } from '@playwright/test';

test.describe('Authentication flow', () => {
  const testUser = {
    username: 'test',
    password: 'test123!'
  };

  test('should register a new user and login successfully', async ({ page }) => {
    // Start with registration
    await page.goto('/register');
    
    // Verify we're on the registration page
    await expect(page.getByRole('heading', { name: 'Create an Account' })).toBeVisible();
    
    // Fill out the registration form
    await page.getByLabel('Username').fill(testUser.username);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByLabel('Confirm Password').fill(testUser.password);
    
    // Submit registration
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Should be redirected to login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    
    // Fill out login form
    await page.getByLabel('Username').fill(testUser.username);
    await page.getByLabel('Password').fill(testUser.password);
    
    // Submit login
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Should be redirected to home page
    await expect(page).toHaveURL('/');
    
    // Verify header is visible with correct elements
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header.getByText('Chronus')).toBeVisible();
    await expect(header.getByRole('button', { name: 'Sign Out' })).toBeVisible();
    await expect(header.getByRole('img', { name: 'Chronus Logo' })).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Clean up: Clear local storage to remove any auth tokens
    await page.evaluate(() => window.localStorage.clear());
  });
}); 