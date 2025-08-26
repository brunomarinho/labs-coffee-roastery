# Testing Best Practices - Coffee Roastery Project

## 🚀 **Pre-Commit Testing Protocol**

### **Always Run Before Committing**
```bash
# Full test suite - ensure no regressions
npm test

# Quick validation for urgent fixes
npm test tests/smoke.spec.js
```

### **After Major Changes**
```bash
# Big architectural changes, new features, or CSS updates
npm test -- --project chromium  # Single browser for faster feedback

# If chromium passes, run full cross-browser suite
npm test
```

## 🏗️ **Architecture & CSS Change Guidelines**

### **When to Update Test Scenarios**

#### **CSS/Styling Changes** 🎨
- **Component class name changes** → Update selectors in `tests/setup/test-data.js`
- **CSS Modules adoption** → Use `[class*="component-name"]` selectors
- **Layout restructuring** → Review navigation and element positioning tests
- **New UI states** → Add test cases for loading/error/success states

#### **Component Architecture Changes** ⚙️
- **New React components** → Add corresponding test helpers
- **API endpoint changes** → Update API mocking and validation tests
- **Database/Redis schema changes** → Review admin and inventory tests
- **Authentication flow changes** → Update login/session management tests

#### **Business Logic Changes** 💼
- **New product features** → Add product detail and checkout tests
- **Inventory management changes** → Update admin panel tests  
- **Payment flow modifications** → Review Stripe integration tests
- **User permission changes** → Update security and access tests

## 📋 **Test Maintenance Checklist**

### **Before Making Changes**
- [ ] Run existing tests to establish baseline
- [ ] Identify which test categories will be affected
- [ ] Plan test updates alongside code changes

### **During Development**
- [ ] Update selectors if CSS classes change
- [ ] Add new test cases for new functionality
- [ ] Update mock data if API contracts change
- [ ] Test error states and edge cases

### **After Implementation**
- [ ] Run full test suite: `npm test`
- [ ] Check test reports for new failures
- [ ] Update test documentation if needed
- [ ] Verify CI/CD pipeline still passes

## 🎯 **Common Test Scenarios to Review**

### **CSS/UI Changes**
```bash
# Test these specifically after UI changes
npm test -- --grep "displays.*correctly"
npm test -- --grep "loads and.*products" 
npm test -- --grep "navigation.*work"
```

### **Admin/Backend Changes**
```bash
# Focus on these after admin or API changes
npm test tests/admin-inventory.spec.js
npm test -- --grep "authentication"
npm test -- --grep "inventory"
```

### **Business Logic Changes**
```bash
# Critical business flows after feature changes
npm test tests/critical-flows.spec.js
npm test -- --grep "checkout"
npm test -- --grep "product.*detail"
```

## 🔍 **Test Impact Analysis**

### **High Impact Changes** (Always Update Tests)
- Authentication system modifications
- Database schema changes  
- API endpoint restructuring
- Payment processing changes
- Security policy updates

### **Medium Impact Changes** (Review Tests)
- New React components
- CSS framework changes
- Admin panel enhancements
- New business features
- Performance optimizations

### **Low Impact Changes** (Run Tests)
- Content updates
- Minor styling tweaks
- Configuration changes
- Documentation updates
- Bug fixes

## 🛠️ **Quick Test Selector Updates**

### **When CSS Classes Change**
```javascript
// In tests/setup/test-data.js
export const SELECTORS = {
  // Old CSS class
  oldButton: '.btn-primary',
  
  // CSS Modules - use partial match
  newButton: '[class*="button-primary"]',
  
  // Multiple possible classes
  flexibleButton: '.btn-primary, .button-primary, [class*="button"]'
};
```

### **When Component Structure Changes**
```javascript
// Update navigation patterns
// Old: Direct child selector
productTitle: '.product-card .title'

// New: More flexible descendant selector  
productTitle: '.product-card h2, .product-card .product-title'
```

## 📊 **Test Quality Metrics**

### **Green Flags** ✅
- All tests passing consistently
- Fast test execution (< 2 minutes)
- Clear test failure messages
- Good coverage of user journeys

### **Red Flags** ⚠️
- Flaky tests (pass/fail randomly)
- Slow test execution (> 5 minutes)
- Many skipped/ignored tests
- Tests that don't reflect real user behavior

## 🎖️ **Team Workflow Integration**

### **Pull Request Process**
1. **Developer**: Run `npm test` locally before PR
2. **CI/CD**: Automated test run on PR creation
3. **Reviewer**: Check test changes align with code changes
4. **Merge**: Only after all tests pass

### **Release Process**  
1. **Pre-release**: Full test suite on staging environment
2. **Release**: Automated tests on production deployment
3. **Post-release**: Smoke tests to verify critical functionality

---

## 💡 **Remember**

> **"Test changes with your code changes"** - When you modify the application, modify the tests that validate that functionality.

> **"Green tests = confident deployments"** - A passing test suite means your changes won't break the user experience.

This testing discipline will help maintain code quality and prevent regressions as the project grows! 🚀