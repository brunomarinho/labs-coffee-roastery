# Playwright Testing Documentation

This directory contains comprehensive Playwright tests for the coffee roastery ecommerce application.

## Test Structure

```
tests/
├── setup/
│   └── test-data.js          # Test constants and selectors
├── critical-flows.spec.js    # Core business functionality tests
├── admin-inventory.spec.js   # Admin panel and inventory tests
├── helpers.js                # Shared helper functions
└── README.md                 # This file
```

## Test Coverage

### Critical Business Flows (`critical-flows.spec.js`)

- **Homepage**: Featured products display, navigation
- **Product Listing**: YAML data loading, product categorization
- **Product Detail**: Information display, image gallery, buy buttons
- **Checkout Flow**: Stripe integration, sold out protection
- **Inventory Integration**: Real-time stock checking, low stock warnings
- **Error Handling**: API failures, non-existent products
- **Responsive Design**: Mobile and tablet compatibility

### Admin Inventory Management (`admin-inventory.spec.js`)

- **Authentication**: Password protection, session management
- **Inventory Display**: Product listing, stock levels
- **Inventory Updates**: Stock modifications, persistence
- **Auto-Detection**: New product recognition, Redis sync
- **Security**: API protection, session validation
- **Error Handling**: Redis failures, network timeouts

## Running Tests

### Local Development

```bash
# Run all tests
npm test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug specific test
npm run test:debug

# View test report
npm run test:report
```

### Test Configuration

Tests are configured to:
- Run against `http://localhost:3000`
- Automatically start dev server if not running
- Take screenshots on failure
- Generate traces for debugging
- Support multiple browsers (Chrome, Firefox, Safari)

### Environment Setup

1. **Copy test environment template:**
   ```bash
   cp .env.test .env.local
   ```

2. **Update with your credentials:**
   - Stripe test keys
   - Test admin password
   - Test Redis instance (optional)

3. **Start development server:**
   ```bash
   npm run dev
   ```

## Test Data

### Products Used in Tests
- `cafe-002` - Available product for checkout tests
- `blend` - Featured product for homepage tests  
- `cafe-003` - Used for sold out state tests

### Admin Credentials
- Default test password: `test-admin-password-123`
- Configure in `.env.local` as `ADMIN_PASSWORD`

## Helper Functions

The `helpers.js` file provides utilities for:
- Admin authentication and logout
- Inventory management operations
- Product navigation and verification
- Checkout flow testing
- Error handling validation

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main`

GitHub Actions workflow:
- Installs dependencies and Playwright browsers
- Sets up test environment variables
- Runs full test suite
- Uploads test reports and results

## Writing New Tests

### Test Structure Pattern
```javascript
test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Arrange
    await page.goto('/some-route');
    
    // Act
    await page.click('button');
    
    // Assert
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### Best Practices

1. **Use Data Constants**: Import selectors and test data from `setup/test-data.js`
2. **Helper Functions**: Leverage existing helpers for common operations
3. **Assertions**: Use Playwright's built-in expect matchers
4. **Timeouts**: Configure appropriate timeouts for async operations
5. **Isolation**: Each test should be independent and clean up after itself

### Adding New Selectors

Update `setup/test-data.js` with new selectors:
```javascript
export const SELECTORS = {
  // Add new selectors here
  newFeature: '[data-testid="new-feature"]',
};
```

## Debugging Tests

### Local Debugging
```bash
# Run specific test file
npx playwright test critical-flows.spec.js

# Run specific test
npx playwright test --grep "homepage loads"

# Debug mode (step through)
npm run test:debug

# Record new tests
npx playwright codegen localhost:3000
```

### CI Debugging
- Check uploaded test reports in GitHub Actions artifacts
- Review screenshots and traces for failed tests
- Monitor test timings for performance issues

## Common Issues

### Test Failures
- **Timeouts**: Check if dev server is running and responsive
- **Selectors**: Verify UI elements match expected selectors
- **Authentication**: Ensure admin password is set correctly
- **Inventory**: Redis connection may be required for full functionality

### Performance
- Tests run in parallel by default
- Disable parallelization in CI with `workers: 1`
- Adjust timeouts for slower environments

## Integration with Development

### Pre-Commit Testing
Consider adding a pre-commit hook:
```bash
# In package.json scripts
"precommit": "npm test"
```

### Continuous Integration
Tests provide safety net for:
- Feature development
- Bug fixes
- Deployment validation
- Regression prevention

## Maintenance

### Regular Tasks
- Update test data when products change
- Review and update selectors if UI changes
- Maintain helper functions for common operations
- Monitor test execution times and optimize slow tests

### Test Data Management
- Keep test products in YAML files current
- Maintain separate test Redis instance if possible
- Use mock data for external service integration (Stripe)