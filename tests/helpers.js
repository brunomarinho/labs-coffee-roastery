import { expect } from '@playwright/test';
import { TEST_ADMIN, SELECTORS, TEST_TIMEOUTS } from './setup/test-data.js';

/**
 * Login to admin panel with password
 */
export async function loginAdmin(page, password = TEST_ADMIN.password) {
  // Set test mode header to bypass rate limiting
  await page.setExtraHTTPHeaders({
    'x-test-mode': 'true',
    'user-agent': 'Playwright-Test'
  });
  
  await page.goto('/admin/inventory');
  
  // Wait for password form to be visible
  await page.waitForSelector(SELECTORS.adminPasswordInput, { timeout: TEST_TIMEOUTS.navigation });
  
  // Clear any previous error messages
  const errorMessage = page.locator(SELECTORS.errorMessage);
  if (await errorMessage.count() > 0) {
    console.log('Previous error found, continuing...');
  }
  
  // Fill password and submit
  await page.fill(SELECTORS.adminPasswordInput, password);
  await page.press(SELECTORS.adminPasswordInput, 'Enter');
  
  // Wait for either success (table appears) or error message
  try {
    await page.waitForSelector(SELECTORS.inventoryTable, { timeout: TEST_TIMEOUTS.api });
  } catch (error) {
    // Check for error message to provide better debugging
    const errorText = await page.locator(SELECTORS.errorMessage).textContent().catch(() => null);
    if (errorText) {
      throw new Error(`Admin login failed: ${errorText}`);
    }
    throw new Error(`Admin login timeout - inventory table not found. Password used: ${password}`);
  }
}

/**
 * Set inventory quantity for a specific product
 */
export async function setInventory(page, inventoryId, quantity) {
  // Wait for inventory table to be ready
  await page.waitForSelector(SELECTORS.inventoryTable, { timeout: TEST_TIMEOUTS.api });
  
  // Find the row containing the inventoryId
  const rows = page.locator('tbody tr');
  const targetRow = rows.filter({ hasText: inventoryId }).first();
  
  // Wait for the row to be visible
  await targetRow.waitFor({ timeout: TEST_TIMEOUTS.navigation });
  
  // Update the input field
  const input = targetRow.locator('input[type="number"]');
  await input.fill(String(quantity));
  
  // Click the global save button
  await page.locator(SELECTORS.saveButton).click();
  
  // Wait for success message
  await page.waitForSelector(SELECTORS.successMessage, { timeout: TEST_TIMEOUTS.api });
}

/**
 * Navigate to product detail page and verify it loads
 */
export async function navigateToProduct(page, productSlug) {
  await page.goto(`/produtos/${productSlug}`);
  
  // Wait for product detail to load
  await page.waitForSelector(SELECTORS.productDetailTitle, { timeout: TEST_TIMEOUTS.navigation });
}

/**
 * Wait for product cards to load on listing page
 */
export async function waitForProductsToLoad(page) {
  // Wait for at least one product card or empty state
  await page.waitForFunction(() => {
    const productCards = document.querySelectorAll('[data-testid="product-card"], a[href*="/produtos/"]');
    const emptyState = document.querySelector('.no-products, .empty-state');
    return productCards.length > 0 || emptyState !== null;
  }, { timeout: TEST_TIMEOUTS.navigation });
}

/**
 * Check if a product appears as sold out
 */
export async function isProductSoldOut(page, productSlug) {
  await navigateToProduct(page, productSlug);
  
  // Check if sold out button is present and buy button is not
  const soldOutButton = page.locator(SELECTORS.soldOutButton);
  const buyButton = page.locator(SELECTORS.buyButton);
  
  const isSoldOut = await soldOutButton.count() > 0;
  const hasBuyButton = await buyButton.count() > 0;
  
  return isSoldOut && !hasBuyButton;
}

/**
 * Attempt to initiate checkout and verify redirect
 */
export async function attemptCheckout(page) {
  const buyButton = page.locator(SELECTORS.buyButton);
  
  // Verify buy button is enabled
  await expect(buyButton).toBeEnabled();
  
  // Click buy button and wait for navigation
  await Promise.all([
    page.waitForURL('**/checkout/**', { timeout: TEST_TIMEOUTS.stripe }),
    buyButton.click()
  ]);
  
  // Verify we're on Stripe checkout
  await expect(page).toHaveURL(/stripe\.com.*checkout/);
}

/**
 * Verify product information displays correctly
 */
export async function verifyProductInfo(page, expectedProduct) {
  // Check title
  if (expectedProduct.name) {
    await expect(page.locator(SELECTORS.productDetailTitle)).toContainText(expectedProduct.name);
  }
  
  // Check price is displayed
  await expect(page.locator(SELECTORS.productDetailPrice)).toBeVisible();
  
  // Check description is present
  await expect(page.locator(SELECTORS.productDetailDescription)).toBeVisible();
  
  // Check images load
  await expect(page.locator(SELECTORS.productImageGallery)).toBeVisible();
}

/**
 * Logout from admin panel
 */
export async function logoutAdmin(page) {
  const logoutButton = page.locator(SELECTORS.logoutButton);
  if (await logoutButton.count() > 0) {
    await logoutButton.click();
    
    // Wait for redirect back to login form
    await page.waitForSelector(SELECTORS.adminPasswordInput, { timeout: TEST_TIMEOUTS.navigation });
  }
}

/**
 * Sync products in admin panel (create Redis entries for new products)
 * Note: Current implementation doesn't have a sync button, products are auto-detected
 */
export async function syncProducts(page) {
  // Refresh the page to trigger auto-detection
  await page.locator(SELECTORS.refreshButton).click();
  await page.waitForSelector(SELECTORS.inventoryTable, { timeout: TEST_TIMEOUTS.api });
}

/**
 * Get current inventory quantity for a product by inventoryId
 */
export async function getInventoryQuantity(page, inventoryId) {
  const rows = page.locator('tbody tr');
  const targetRow = rows.filter({ hasText: inventoryId }).first();
  const input = targetRow.locator('input[type="number"]');
  return await input.inputValue();
}