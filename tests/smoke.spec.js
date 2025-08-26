import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Core Functionality', () => {
  
  test('homepage loads and shows products', async ({ page }) => {
    await page.goto('/');
    
    // Wait for product grid to load
    await page.waitForSelector('.product-grid', { timeout: 10000 });
    
    // Verify products are displayed
    const productCards = page.locator('.product-card');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify basic product information
    await expect(productCards.first().locator('.product-title')).toBeVisible();
    await expect(productCards.first().locator('.product-card-price')).toBeVisible();
  });
  
  test('product detail page loads', async ({ page }) => {
    await page.goto('/produtos/cafe-002');
    
    // Wait for product detail to load
    await page.waitForSelector('.product-title', { timeout: 10000 });
    
    // Verify product information displays
    await expect(page.locator('.product-title')).toBeVisible();
    await expect(page.locator('.product-description')).toBeVisible();
    await expect(page.locator('.btn-buy, button:has-text("Esgotado")')).toBeVisible();
  });
  
  test('admin login page loads', async ({ page }) => {
    await page.goto('/admin/inventory');
    
    // Verify login form appears
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('h1:has-text("Acesso Administrativo")')).toBeVisible();
  });
  
  test('products page loads and displays products', async ({ page }) => {
    await page.goto('/produtos');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify product cards are present
    const productCards = page.locator('.product-card');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });
});