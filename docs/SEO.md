# Enterprise SEO Implementation Guide

## Overview

This project now uses a **centralized, enterprise-level SEO system** that consolidates all SEO configuration into a single source of truth. This approach ensures consistency, maintainability, and comprehensive search optimization across the entire website.

## Architecture

### Core Components

1. **Central Configuration** (`/config/seo.config.js`)
   - Single source of truth for all SEO settings
   - Site information, contact details, social media
   - Page-specific SEO configurations
   - Schema templates

2. **SEO Utilities** (`/lib/seo/`)
   - `metadata.js` - Dynamic metadata generation
   - `structured-data.js` - Schema.org structured data builders
   - `JsonLd.js` - JSON-LD rendering component
   - `index.js` - Unified exports

3. **Monitoring** (`/scripts/seo-monitor.js`)
   - Automated SEO validation
   - Configuration checks
   - Schema verification
   - Content analysis

## Features

### 🎯 Metadata Management
- **Dynamic generation** based on content type
- **Automatic fallbacks** to default values
- **Smart keyword extraction** from content
- **Canonical URL management**
- **Open Graph & Twitter Cards** optimization

### 🏗️ Structured Data
- **Organization Schema** - Company information
- **Website Schema** - Site search capability
- **Product Schema** - Enhanced product listings
- **Article Schema** - Blog post optimization
- **Breadcrumb Schema** - Navigation structure
- **FAQ Schema** - Q&A content
- **HowTo Schema** - Tutorial content
- **Recipe Schema** - Coffee preparation guides

### 📊 Page-Specific SEO

#### Product Pages
- Product-specific metadata
- Rich product schema with inventory status
- Breadcrumb navigation
- Dynamic pricing and availability
- Custom attributes (producer, farm, region, etc.)

#### Blog Pages
- Article schema with author information
- Publication/modification dates
- Automatic excerpt generation
- Category and tag support
- Reading time estimation

#### Static Pages
- Pre-configured SEO for common pages
- Consistent branding across all pages
- Proper canonical URLs

## Configuration Guide

### Basic Setup

Edit `/config/seo.config.js`:

```javascript
// Update site information
site: {
  name: 'Your Brand',
  url: 'https://yourdomain.com',
  description: 'Your description',
}

// Add contact details
contact: {
  email: 'contact@yourdomain.com',
  whatsapp: '+5511999999999',
  address: {
    streetAddress: 'Your street',
    addressLocality: 'Your city',
    postalCode: '00000-000',
  }
}

// Configure social media
social: {
  instagram: {
    handle: '@yourhandle',
  }
}
```

### Adding New Pages

For new static pages:

```javascript
import { generateMetadata, getPageSeo } from '@/lib/seo'

const pageSeo = getPageSeo('yourpage') // or use custom config
export const metadata = generateMetadata({
  title: pageSeo.title,
  description: pageSeo.description,
  url: '/yourpage'
})
```

For dynamic pages with structured data:

```javascript
import {
  generateProductMetadata,
  JsonLd,
  generateProductSchema,
  generateBreadcrumbSchema,
  combineSchemas
} from '@/lib/seo'

// In generateMetadata function
export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug)
  return generateProductMetadata(product)
}

// In page component
export default async function Page({ params }) {
  const schemas = combineSchemas([
    generateBreadcrumbSchema(breadcrumbs),
    generateProductSchema(product, inventory)
  ])

  return (
    <>
      <JsonLd data={schemas} />
      {/* Page content */}
    </>
  )
}
```

## Monitoring & Validation

### Running SEO Checks

```bash
# Run comprehensive SEO validation
npm run seo:check

# Check specific aspects
node scripts/seo-monitor.js
```

### What Gets Checked

1. **Configuration Completeness**
   - Site URL and names
   - Contact information
   - Social media handles
   - Monitoring setup

2. **Page Implementation**
   - Metadata presence
   - Structured data implementation
   - Centralized SEO usage

3. **Content Quality**
   - Product descriptions
   - Image availability
   - Blog post metadata

4. **Technical SEO**
   - Sitemap generation
   - Robots.txt configuration
   - Canonical URLs

## Best Practices

### Do's ✅

1. **Always use centralized functions**
   ```javascript
   // Good
   import { generateMetadata } from '@/lib/seo'
   export const metadata = generateMetadata({ ... })

   // Bad
   export const metadata = { title: '...', description: '...' }
   ```

2. **Include structured data on all pages**
   ```javascript
   <JsonLd data={structuredData} />
   ```

3. **Provide complete product information**
   - Detailed descriptions (100+ characters)
   - Multiple images
   - All custom attributes

4. **Keep configuration updated**
   - Real contact information
   - Active social media handles
   - Current business details

### Don'ts ❌

1. **Don't hardcode SEO values**
   - Use `seo.config.js` for all static values
   - Use generator functions for dynamic content

2. **Don't skip structured data**
   - Every page should have appropriate schema
   - Combine multiple schemas when relevant

3. **Don't ignore validation warnings**
   - Run `npm run seo:check` regularly
   - Address warnings before deployment

## Advanced Features

### Custom Schema Types

Create custom schema builders in `/lib/seo/structured-data.js`:

```javascript
export function generateCustomSchema(data) {
  return {
    '@context': 'https://schema.org',
    '@type': 'YourType',
    // ... schema properties
  }
}
```

### Multi-language Support

Configure alternate languages in metadata:

```javascript
alternates: {
  languages: {
    'en-US': '/en',
    'pt-BR': '/pt',
  }
}
```

### A/B Testing Metadata

Use environment variables for testing:

```javascript
title: process.env.AB_TEST === 'B'
  ? 'Alternative Title'
  : 'Original Title'
```

## Troubleshooting

### Common Issues

1. **"Invalid OpenGraph type" error**
   - Next.js doesn't support all OG types
   - Use 'website' or 'article' only

2. **Missing metadata on dynamic pages**
   - Ensure async params are awaited
   - Check data fetching in generateMetadata

3. **Structured data not appearing**
   - Verify JsonLd component placement
   - Check data format with Google's Rich Results Test

### Validation Tools

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Schema.org Validator](https://validator.schema.org/)

## Migration from Old System

If migrating from scattered SEO implementation:

1. **Install dependencies** (already done)
2. **Update all page files** to use centralized SEO
3. **Run validation** `npm run seo:check`
4. **Test build** `npm run build`
5. **Verify with external tools**

## Performance Impact

The centralized SEO system:
- **Reduces bundle size** by eliminating duplicate code
- **Improves build time** with cached configurations
- **Enhances maintainability** with single configuration file
- **Ensures consistency** across all pages

## Future Enhancements

Planned improvements:
- [ ] Automatic meta description generation from content
- [ ] Image optimization recommendations
- [ ] SEO score calculation
- [ ] Competitive analysis tools
- [ ] Automated sitemap submission
- [ ] Real-time SEO monitoring dashboard

## Support

For SEO-related questions:
1. Run `npm run seo:check` for immediate validation
2. Check this documentation
3. Review `/config/seo.config.js` for configuration options
4. Inspect page source for rendered metadata