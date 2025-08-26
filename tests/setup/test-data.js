// Test data constants for Playwright tests
export const TEST_PRODUCTS = {
  // Available products for testing
  available: {
    id: '002',
    slug: 'cafe-002',
    name: '002',
    inventoryId: 'inv_002'
  },
  featured: {
    id: '000',
    slug: 'blend',
    name: 'Blend',
    inventoryId: 'inv_000'
  },
  // Product that can be marked as sold out for testing
  testSoldOut: {
    id: '003',
    slug: 'cafe-003',
    inventoryId: 'inv_003'
  }
};

export const TEST_ADMIN = {
  password: process.env.ADMIN_PASSWORD || 'test-admin-password-123',
};

export const SELECTORS = {
  // Product card selectors - based on ProductCard.js
  productCard: '.product-card, a.product-card', 
  productCardLink: 'a.product-card, a[href*="/produtos/"]',
  productTitle: '.product-title, h2.product-title',
  buyButton: 'button.btn-buy, button:has-text("Comprar")',
  soldOutButton: 'button:has-text("Esgotado")',
  priceDisplay: '.product-card-price',
  lowStockWarning: '.low-stock, [data-testid="low-stock"]',
  
  // Product detail selectors - based on ProductDetailClient.js
  productDetailTitle: '.product-title, h2.product-title',
  productDetailPrice: '.tag, .product-detail-price',
  productDetailDescription: '.product-description',
  productImageGallery: '.product-detail-hero-image, .product-images',
  
  // Navigation
  headerLogo: '.logo',
  navProducts: 'a[href="/produtos"]',
  navHome: 'a[href="/"]',
  
  // Admin panel selectors - based on inventory page
  adminPasswordInput: 'input[type="password"]',
  adminLoginButton: 'button[type="submit"], button:has-text("Entrar")',
  inventoryTable: 'table',
  inventoryRow: 'tbody tr, table tr', // Admin table rows
  inventoryInput: 'input[type="number"]',
  updateButton: 'button:has-text("Salvar")', // Save button, not individual update buttons
  syncButton: 'button:has-text("Sincronizar")', // No sync button in current implementation
  successMessage: '[class*="success"]',
  errorMessage: '[class*="error"]',
  logoutButton: 'button:has-text("Sair")',
  
  // Additional admin selectors
  saveButton: 'button:has-text("Salvar")',
  cancelButton: 'button:has-text("Cancelar")',
  refreshButton: 'button:has-text("Atualizar")',
  
  // Sections - based on actual component structure
  featuredSection: '.product-grid', 
  availableSection: '.product-grid',
  soldOutSection: '.sold-out-products',
};

export const ROUTES = {
  home: '/',
  products: '/produtos',
  adminInventory: '/admin/inventory',
  productDetail: (slug) => `/produtos/${slug}`,
};

export const TEST_TIMEOUTS = {
  navigation: 5000,
  api: 10000,
  stripe: 15000,
};