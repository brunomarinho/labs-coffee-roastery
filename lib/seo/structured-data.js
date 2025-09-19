import seoConfig from '@/config/seo.config'

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(items) {
  const breadcrumbItems = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    ...(item.url && { item: `${seoConfig.site.url}${item.url}` }),
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  }
}

/**
 * Generate product structured data with inventory
 */
export function generateProductSchema(product, inventory = null) {
  const availability = inventory === 0
    ? 'https://schema.org/OutOfStock'
    : inventory && inventory < 5
      ? 'https://schema.org/LimitedAvailability'
      : 'https://schema.org/InStock'

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${seoConfig.site.url}/produtos/${product.slug}#product`,
    name: product.name,
    description: product.description,
    image: product.images?.map(img =>
      img.startsWith('http') ? img : `${seoConfig.site.url}${img}`
    ),
    brand: {
      '@type': 'Brand',
      name: seoConfig.site.name,
    },
    manufacturer: {
      '@type': 'Organization',
      name: product.produtor || seoConfig.site.name,
    },
    offers: {
      '@type': 'Offer',
      url: `${seoConfig.site.url}/produtos/${product.slug}`,
      priceCurrency: 'BRL',
      price: product.price,
      availability,
      seller: {
        '@type': 'Organization',
        name: seoConfig.site.fullName,
        url: seoConfig.site.url,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'BR',
        },
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '15',
          currency: 'BRL',
        },
      },
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Produtor', value: product.produtor },
      { '@type': 'PropertyValue', name: 'Fazenda', value: product.fazenda },
      { '@type': 'PropertyValue', name: 'Região', value: product.regiao },
      { '@type': 'PropertyValue', name: 'Variedade', value: product.variedade },
      { '@type': 'PropertyValue', name: 'Processo', value: product.processo },
      { '@type': 'PropertyValue', name: 'Torra', value: product.torra },
      { '@type': 'PropertyValue', name: 'Quantidade', value: product.quantity },
    ].filter(prop => prop.value),
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 1,
    } : undefined,
    category: 'Café Especial',
    sku: product.id,
    gtin: product.gtin,
    mpn: product.id,
  }
}

/**
 * Generate article structured data for blog posts
 */
export function generateArticleSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${seoConfig.site.url}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.description || post.excerpt,
    image: post.image ?
      (post.image.startsWith('http') ? post.image : `${seoConfig.site.url}${post.image}`)
      : `${seoConfig.site.url}/images/default-blog.jpg`,
    datePublished: post.date,
    dateModified: post.updatedAt || post.date,
    author: {
      '@type': 'Person',
      name: post.author || seoConfig.defaults.author,
      url: seoConfig.site.url,
    },
    publisher: {
      '@type': 'Organization',
      name: seoConfig.site.fullName,
      logo: {
        '@type': 'ImageObject',
        url: `${seoConfig.site.url}${seoConfig.business.logo}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${seoConfig.site.url}/blog/${post.slug}`,
    },
    wordCount: post.wordCount,
    keywords: post.tags?.join(', '),
    articleSection: post.category || 'Café',
    inLanguage: seoConfig.site.language,
  }
}

/**
 * Generate FAQ structured data
 */
export function generateFAQSchema(questions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }
}

/**
 * Generate How-To structured data
 */
export function generateHowToSchema(data) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.name,
    description: data.description,
    image: data.image,
    totalTime: data.totalTime,
    estimatedCost: data.cost ? {
      '@type': 'MonetaryAmount',
      currency: 'BRL',
      value: data.cost,
    } : undefined,
    supply: data.supplies?.map(supply => ({
      '@type': 'HowToSupply',
      name: supply,
    })),
    tool: data.tools?.map(tool => ({
      '@type': 'HowToTool',
      name: tool,
    })),
    step: data.steps?.map((step, index) => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text,
      image: step.image,
      url: `#step-${index + 1}`,
    })),
  }
}

/**
 * Generate Recipe structured data (for coffee recipes)
 */
export function generateRecipeSchema(recipe) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.name,
    description: recipe.description,
    image: recipe.image,
    author: {
      '@type': 'Person',
      name: recipe.author || seoConfig.defaults.author,
    },
    datePublished: recipe.date,
    prepTime: recipe.prepTime,
    cookTime: recipe.brewTime,
    totalTime: recipe.totalTime,
    keywords: recipe.keywords,
    recipeYield: recipe.yield,
    recipeCategory: 'Bebida',
    recipeCuisine: 'Brasileira',
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.instructions?.map((instruction, index) => ({
      '@type': 'HowToStep',
      name: `Passo ${index + 1}`,
      text: instruction,
    })),
    nutrition: recipe.nutrition ? {
      '@type': 'NutritionInformation',
      calories: recipe.nutrition.calories,
      caffeineContent: recipe.nutrition.caffeine,
    } : undefined,
  }
}

/**
 * Generate organization structured data
 */
export function generateOrganizationSchema() {
  return {
    ...seoConfig.schemas.organization,
    address: seoConfig.contact.address,
    email: seoConfig.contact.email,
    telephone: seoConfig.contact.whatsapp,
  }
}

/**
 * Generate website structured data with search
 */
export function generateWebsiteSchema() {
  return seoConfig.schemas.website
}

/**
 * Generate local business structured data
 */
export function generateLocalBusinessSchema() {
  return {
    ...seoConfig.schemas.localBusiness,
    address: seoConfig.contact.address,
    telephone: seoConfig.contact.whatsapp,
    openingHours: seoConfig.contact.openingHours,
  }
}

/**
 * Combine multiple schemas into one script
 */
export function combineSchemas(schemas) {
  const validSchemas = schemas.filter(Boolean)
  if (validSchemas.length === 0) return null
  if (validSchemas.length === 1) return validSchemas[0]

  return {
    '@context': 'https://schema.org',
    '@graph': validSchemas,
  }
}