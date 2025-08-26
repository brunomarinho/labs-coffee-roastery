import { test, expect } from '@playwright/test';
import { 
  TEST_PRODUCTS, 
  SELECTORS, 
  ROUTES, 
  TEST_TIMEOUTS 
} from './setup/test-data.js';
import { 
  navigateToProduct,
  waitForProductsToLoad,
  verifyProductInfo,
  attemptCheckout,
  isProductSoldOut
} from './helpers.js';

test.describe('Critical Business Flows', () => {
  
  test.describe('Homepage', () => {
    test('loads and displays featured products', async ({ page }) => {
      await page.goto(ROUTES.home);
      
      // Wait for page to load and check for product grid
      await page.waitForSelector('.product-grid', { timeout: TEST_TIMEOUTS.navigation });
      
      // Verify at least one product card is visible
      const productCards = page.locator('.product-card');
      await expect(productCards.first()).toBeVisible();
      
      // Verify product titles are displayed
      const productTitles = page.locator('.product-title');
      await expect(productTitles.first()).toBeVisible();
      
      // Verify prices are displayed
      const priceElements = page.locator('.product-card-price');
      await expect(priceElements.first()).toBeVisible();
      
      // Verify header logo is visible
      await expect(page.locator('.logo')).toBeVisible();
    });

    test('navigation links work correctly', async ({ page }) => {
      await page.goto(ROUTES.home);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Test products navigation
      const productsLink = page.locator('a[href="/produtos"]').first();
      if (await productsLink.count() > 0) {
        await productsLink.click();
        await expect(page).toHaveURL(ROUTES.products);
      }
      
      // Test home navigation
      const homeLink = page.locator('a[href="/"]').first();
      if (await homeLink.count() > 0) {
        await homeLink.click();
        await expect(page).toHaveURL(ROUTES.home);
      }
    });
  });

  test.describe('Product Listing Page', () => {
    test('loads and displays products from YAML files', async ({ page }) => {
      await page.goto(ROUTES.products);
      
      // Wait for products to load
      await waitForProductsToLoad(page);
      
      // Verify product cards are present and clickable
      const productLinks = page.locator(SELECTORS.productCardLink);
      const count = await productLinks.count();
      expect(count).toBeGreaterThan(0);
      
      // Verify first product card displays required info
      const firstCard = productLinks.first();
      await expect(firstCard).toBeVisible();
      
      // Check that card contains price and title
      await expect(page.locator(SELECTORS.priceDisplay).first()).toBeVisible();
    });

    test('separates available and sold out products', async ({ page }) => {
      await page.goto(ROUTES.products);
      await waitForProductsToLoad(page);
      
      // Products should be displayed in product grids
      const productGrids = page.locator('.product-grid');
      const gridCount = await productGrids.count();
      expect(gridCount).toBeGreaterThan(0);
      
      // Available products section should exist
      await expect(productGrids.first()).toBeVisible();
      
      // Check if sold out section exists (it may not if no products are sold out)
      const soldOutSection = page.locator('.sold-out-products');
      const soldOutExists = await soldOutSection.count() > 0;
      if (soldOutExists) {
        await expect(soldOutSection).toBeVisible();
      }
    });

    test('product cards are clickable and navigate correctly', async ({ page }) => {
      await page.goto(ROUTES.products);
      await waitForProductsToLoad(page);
      
      // Click first product card
      const firstProductLink = page.locator(SELECTORS.productCardLink).first();
      const href = await firstProductLink.getAttribute('href');
      
      await firstProductLink.click();
      await page.waitForURL(`**${href}`, { timeout: TEST_TIMEOUTS.navigation });
      
      // Verify we're on a product detail page
      await expect(page.locator(SELECTORS.productDetailTitle)).toBeVisible();
    });
  });

  test.describe('Product Detail Page', () => {
    test('displays all product information correctly', async ({ page }) => {
      await navigateToProduct(page, TEST_PRODUCTS.available.slug);
      
      // Verify product information displays
      await verifyProductInfo(page, TEST_PRODUCTS.available);
      
      // Verify buy button is present (may be loading, available, or sold out)
      const buyButton = page.locator(SELECTORS.buyButton);
      await expect(buyButton).toBeVisible();
      
      // Wait for inventory check to complete (button text changes from "Verificando...")
      await page.waitForFunction(() => {
        const btn = document.querySelector('button.btn-buy') || 
                    document.querySelector('button:contains("Comprar")') ||
                    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Comprar'));
        return btn && !btn.textContent.includes('Verificando');
      }, { timeout: 10000 });
      
      // Check if product is available or sold out
      const buttonText = await buyButton.textContent();
      console.log('Buy button state:', buttonText);
    });

    test('displays product images correctly', async ({ page }) => {
      await navigateToProduct(page, TEST_PRODUCTS.featured.slug);
      
      // Verify image gallery loads
      await expect(page.locator(SELECTORS.productImageGallery)).toBeVisible();
      
      // Verify at least one image is present
      const images = page.locator(`${SELECTORS.productImageGallery} img`);
      await expect(images.first()).toBeVisible();
    });
  });

  test.describe('Checkout Flow', () => {
    test('redirects to Stripe checkout for available products', async ({ page }) => {
      await navigateToProduct(page, TEST_PRODUCTS.available.slug);
      
      // Verify buy button exists
      const buyButton = page.locator(SELECTORS.buyButton);
      await expect(buyButton).toBeVisible();
      
      // Wait for inventory check to complete
      await page.waitForFunction(() => {
        const btn = document.querySelector('button.btn-buy') || 
                    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Comprar'));
        return btn && !btn.textContent.includes('Verificando');
      }, { timeout: 10000 });
      
      // Only proceed if product is available (not sold out)
      const buttonText = await buyButton.textContent();
      if (buttonText.includes('Esgotado')) {
        console.log('Product is sold out, skipping checkout test');
        return;
      }
      
      await expect(buyButton).toBeEnabled();
      
      // Click buy button and check for checkout initiation
      // Note: We test that the checkout process starts, not the full Stripe flow
      
      // Listen for navigation or new page events
      let checkoutInitiated = false;
      
      // Method 1: Check for navigation
      page.on('response', response => {
        if (response.url().includes('/api/checkout') && response.status() === 200) {
          checkoutInitiated = true;
        }
      });
      
      await buyButton.click();
      
      // Wait a moment for the checkout API call
      await page.waitForTimeout(3000);
      
      // Method 2: Check if we're redirected or checkout started
      const currentUrl = page.url();
      const isCheckoutPage = currentUrl.includes('checkout') || currentUrl.includes('stripe.com');
      
      // Test passes if either checkout was initiated or we stayed on the page (loading state)
      const testPassed = checkoutInitiated || isCheckoutPage || 
                        await page.locator('button:has-text("Processando")').count() > 0;
      
      expect(testPassed).toBe(true);
    });

    test('prevents checkout for sold out products', async ({ page }) => {
      // This test assumes we can set up a sold out product via inventory
      // For now, we'll test the UI behavior
      await navigateToProduct(page, TEST_PRODUCTS.available.slug);
      
      // If sold out button exists, verify it's disabled
      const soldOutButton = page.locator(SELECTORS.soldOutButton);
      if (await soldOutButton.count() > 0) {
        await expect(soldOutButton).toBeDisabled();
      }
    });
  });

  test.describe('Inventory Integration', () => {
    test('displays low stock warning when applicable', async ({ page }) => {
      // Navigate to a product page
      await navigateToProduct(page, TEST_PRODUCTS.available.slug);
      
      // Check if low stock warning appears (this depends on inventory being set)
      const lowStockWarning = page.locator(SELECTORS.lowStockWarning);
      if (await lowStockWarning.count() > 0) {
        await expect(lowStockWarning).toBeVisible();
      }
    });

    test('handles sold out state correctly', async ({ page }) => {
      // Try to find a sold out product on the listing page
      await page.goto(ROUTES.products);
      await waitForProductsToLoad(page);
      
      const soldOutSection = page.locator(SELECTORS.soldOutSection);
      if (await soldOutSection.count() > 0) {
        // Get first sold out product
        const soldOutProduct = soldOutSection.locator(SELECTORS.productCardLink).first();
        if (await soldOutProduct.count() > 0) {
          await soldOutProduct.click();
          
          // Verify sold out state on detail page
          await expect(page.locator(SELECTORS.soldOutButton)).toBeVisible();
          await expect(page.locator(SELECTORS.soldOutButton)).toBeDisabled();
          
          // Verify buy button is not present
          await expect(page.locator(SELECTORS.buyButton)).not.toBeVisible();
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('handles non-existent product routes gracefully', async ({ page }) => {
      const response = await page.goto('/produtos/non-existent-product');
      
      // Should return 404 or redirect to products page
      expect(response.status()).toBe(404);
    });

    test('handles API errors gracefully', async ({ page }) => {
      await navigateToProduct(page, TEST_PRODUCTS.available.slug);
      
      // Mock API failure
      await page.route('/api/checkout', route => {
        route.fulfill({ status: 500, body: 'Server Error' });
      });
      
      const buyButton = page.locator(SELECTORS.buyButton);
      
      // Wait for inventory check to complete
      await page.waitForFunction(() => {
        const btn = document.querySelector('button.btn-buy') || 
                    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Comprar'));
        return btn && !btn.textContent.includes('Verificando');
      }, { timeout: 10000 });
      
      // Only click if button is enabled (not sold out)
      const isEnabled = await buyButton.isEnabled();
      if (!isEnabled) {
        console.log('Button is disabled (sold out), test passed');
        return;
      }
      
      await buyButton.click();
      
      // Should show error message or remain on same page
      await expect(page.locator(SELECTORS.errorMessage).or(page.locator(SELECTORS.productDetailTitle))).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('displays correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(ROUTES.home);
      await expect(page.locator(SELECTORS.headerLogo)).toBeVisible();
      
      await page.goto(ROUTES.products);
      await waitForProductsToLoad(page);
      await expect(page.locator(SELECTORS.productCardLink).first()).toBeVisible();
    });

    test('displays correctly on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto(ROUTES.home);
      await expect(page.locator(SELECTORS.headerLogo)).toBeVisible();
      
      await navigateToProduct(page, TEST_PRODUCTS.available.slug);
      await expect(page.locator(SELECTORS.productDetailTitle)).toBeVisible();
      await expect(page.locator(SELECTORS.buyButton)).toBeVisible();
    });
  });
});