/**
 * Utility to clear admin rate limits before running tests
 * This prevents IP blocking issues during test runs
 */

export async function clearAdminRateLimits(page) {
  try {
    // Make a direct API call to clear rate limits using test headers
    const response = await page.request.delete('/api/admin/rate-limit', {
      headers: {
        'x-test-mode': 'true',
        'user-agent': 'Playwright-Test'
      }
    });
    
    if (response.ok()) {
      console.log('Rate limits cleared successfully');
    }
  } catch (error) {
    console.log('Rate limit clearing not available, continuing with test headers');
  }
}

/**
 * Set up test environment for admin tests
 */
export async function setupAdminTestEnvironment(page) {
  // Set headers to bypass rate limiting
  await page.setExtraHTTPHeaders({
    'x-test-mode': 'true',
    'user-agent': 'Playwright-Test'
  });
  
  // Clear any existing rate limits
  await clearAdminRateLimits(page);
}

/**
 * Verify test environment is correctly configured
 */
export function verifyTestEnvironment() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD environment variable not set');
  }
  
  if (adminPassword !== 'test-admin-password-123') {
    console.warn(`Warning: Admin password is '${adminPassword}', expected 'test-admin-password-123'`);
  }
  
  return {
    password: adminPassword,
    isTestConfig: adminPassword === 'test-admin-password-123'
  };
}