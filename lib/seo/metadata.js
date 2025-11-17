import seoConfig, { formatTitle, getCanonicalUrl } from '@/config/seo.config'

/**
 * Generate metadata for any page
 * @param {Object} options - Metadata options
 * @returns {Object} Next.js metadata object
 */
export function generateMetadata({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noindex = false,
  nofollow = false,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  ...customMeta
}) {
  // Use defaults if not provided
  const pageTitle = title ? formatTitle(title) : seoConfig.defaults.title
  const pageDescription = description || seoConfig.defaults.description
  const pageKeywords = keywords || seoConfig.defaults.keywords
  const canonicalUrl = url ? getCanonicalUrl(url) : getCanonicalUrl()

  // Build robots directive
  const robotsDirectives = []
  if (noindex) robotsDirectives.push('noindex')
  else robotsDirectives.push('index')
  if (nofollow) robotsDirectives.push('nofollow')
  else robotsDirectives.push('follow')

  const robots = robotsDirectives.join(', ')

  // Generate base metadata
  const metadata = {
    metadataBase: new URL(seoConfig.site.url),
    title: pageTitle,
    description: pageDescription,
    keywords: Array.isArray(pageKeywords) ? pageKeywords.join(', ') : pageKeywords,
    authors: author ? [{ name: author }] : [{ name: seoConfig.defaults.author }],
    creator: seoConfig.defaults.author,
    publisher: seoConfig.site.fullName,
    robots,
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: seoConfig.business.favicon,
    },

    // Open Graph
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: seoConfig.site.fullName,
      type: type === 'product' ? 'website' : type, // Next.js doesn't support 'product' type
      locale: seoConfig.site.locale,
      images: image ? [processImage(image)] : [],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },

    // Twitter
    twitter: {
      card: seoConfig.social.twitter.cardType,
      site: seoConfig.social.twitter.handle,
      creator: seoConfig.social.twitter.creator,
      title: pageTitle,
      description: pageDescription,
      images: image ? [processImageUrl(image)] : [],
    },

    // Additional custom metadata
    ...customMeta,
  }

  return metadata
}

/**
 * Generate product metadata
 */
export function generateProductMetadata(product) {
  const title = product.subtitle
    ? `${product.name} - ${product.subtitle}`
    : `${product.name} - ${product.produtor} ${product.variedade}`
  const description = product.description || `${product.name} - ${product.processo} de ${product.regiao}. ${product.notas}`
  const keywords = [
    product.name,
    `café ${product.processo}`,
    product.regiao,
    product.variedade,
    product.fazenda,
    product.produtor,
    'café especial brasileiro',
    'comprar café online',
    'torra clara'
  ].filter(Boolean)

  return generateMetadata({
    title,
    description,
    keywords,
    image: product.images?.[0],
    url: `/produtos/${product.slug}`,
    type: 'product',
  })
}

/**
 * Generate blog post metadata
 */
export function generateBlogMetadata(post) {
  const keywords = [
    ...extractKeywordsFromTitle(post.title),
    'blog café',
    'mameluca blog',
    'artigo café especial'
  ]

  return generateMetadata({
    title: post.title,
    description: post.description || post.excerpt,
    keywords,
    image: post.image,
    url: `/blog/${post.slug}`,
    type: 'article',
    author: post.author || seoConfig.defaults.author,
    publishedTime: post.date,
    modifiedTime: post.updatedAt || post.date,
    section: post.category || 'Café',
    tags: post.tags || [],
  })
}

/**
 * Process image for Open Graph
 */
function processImage(image) {
  if (typeof image === 'string') {
    return {
      url: image.startsWith('http') ? image : `${seoConfig.site.url}${image}`,
      width: 1200,
      height: 630,
      alt: 'Mameluca Café',
    }
  }

  return {
    url: image.url.startsWith('http') ? image.url : `${seoConfig.site.url}${image.url}`,
    width: image.width || 1200,
    height: image.height || 630,
    alt: image.alt || 'Mameluca Café',
  }
}

/**
 * Process image URL
 */
function processImageUrl(image) {
  if (typeof image === 'string') {
    return image.startsWith('http') ? image : `${seoConfig.site.url}${image}`
  }
  return image.url.startsWith('http') ? image.url : `${seoConfig.site.url}${image.url}`
}

/**
 * Extract keywords from title
 */
function extractKeywordsFromTitle(title) {
  const stopWords = ['de', 'da', 'do', 'e', 'o', 'a', 'para', 'com', 'em', 'no', 'na']
  return title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 5)
}