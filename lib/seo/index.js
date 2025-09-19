/**
 * Main SEO module - exports all SEO utilities
 */

export {
  generateMetadata,
  generateProductMetadata,
  generateBlogMetadata,
} from './metadata'

export {
  generateBreadcrumbSchema,
  generateProductSchema,
  generateArticleSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateRecipeSchema,
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateLocalBusinessSchema,
  combineSchemas,
} from './structured-data'

export { default as JsonLd } from './JsonLd'

// Re-export config helpers
export {
  default as seoConfig,
  getPageSeo,
  formatTitle,
  getBaseUrl,
  getCanonicalUrl
} from '@/config/seo.config'