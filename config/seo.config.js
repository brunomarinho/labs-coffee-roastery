/**
 * Centralized SEO Configuration
 * Single source of truth for all SEO settings
 */

const seoConfig = {
  // Site Information
  site: {
    name: 'Mameluca',
    fullName: 'Mameluca Café',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://mamelucacafe.com.br',
    domain: 'mamelucacafe.com.br',
    tagline: 'Cafés Brasileiros com Torra Clara',
    description: 'Nano-torrefação experimental de cafés brasileiros com foco em torra clara.',
    longDescription: 'Nano-torrefação experimental especializada em cafés brasileiros de alta qualidade com torra clara. Nossa missão é destacar os sabores únicos e complexos dos melhores grãos do Brasil através de uma torra cuidadosa que preserva suas características originais.',
    locale: 'pt_BR',
    language: 'pt',
    type: 'ecommerce',
    category: 'Alimentos e Bebidas',
    foundingYear: 2024,
  },

  // Contact & Location
  contact: {
    email: 'mamelucacafe@gmail.com',
    whatsapp: '', // Update with real number
    instagram: '@mamelucacafe',
    address: {
      streetAddress: '', // Add your street address
      addressLocality: 'Rio de Janeiro',
      addressRegion: 'RJ',
      postalCode: '22775060', // Add postal code
      addressCountry: 'BR'
    },
    openingHours: 'Mo-Fr 10:00-17:00', // Update with real hours
  },

  // Business Information
  business: {
    priceRange: '$$',
    paymentAccepted: ['Credit Card', 'Debit Card', 'PIX'],
    currencyAccepted: 'BRL',
    areaServed: 'Brasil',
    logo: '/images/symbol.png',
    favicon: '/favicon.png',
  },

  // Default SEO Values
  defaults: {
    titleTemplate: '%s | Mameluca',
    title: 'Mameluca - Cafés Brasileiros com Torra Clara',
    description: 'Nano-torrefação experimental de cafés brasileiros com foco em torra clara.',
    keywords: [
      'café especial',
      'torra clara',
      'café brasileiro',
      'nano-torrefação',
      'mameluca',
      'cafés de origem',
      'coffee shop',
      'café artesanal',
      'microlote',
      'bourbon',
      'catuaí',
      'mundo novo'
    ],
    author: 'Mameluca Café',
    robots: 'index, follow',
    ogType: 'website',
  },

  // Social Media
  social: {
    twitter: {
      handle: '@mamelucacafe',
      creator: '@mamelucacafe',
      cardType: 'summary_large_image',
    },
    instagram: {
      handle: '@mamelucacafe',
      url: 'https://instagram.com/mamelucacafe',
    }
  },

  // Page-specific SEO
  pages: {
    home: {
      title: 'Mameluca - Cafés Brasileiros com Torra Clara',
      description: 'Nano-torrefação experimental de cafés brasileiros.',
      keywords: ['café especial brasileiro', 'torra clara', 'nano-torrefação', 'café artesanal'],
    },
    products: {
      title: 'Nossos Cafés',
      titleTemplate: 'Nossos Cafés - %s',
      description: 'Explore nossa seleção de cafés brasileiros.',
      keywords: ['comprar café', 'café online', 'café especial', 'microlotes'],
    },
    blog: {
      title: 'Blog',
      titleTemplate: '%s - Blog Mameluca',
      description: 'Artigos sobre café, métodos de preparo, origem dos grãos e cultura cafeeira brasileira.',
      keywords: ['blog café', 'dicas preparo café', 'cultura café', 'métodos extração'],
    },
    about: {
      title: 'Nossa História',
      description: 'Conheça a filosofia da Mameluca.',
      keywords: ['sobre mameluca', 'história', 'missão', 'valores'],
    },
    contact: {
      title: 'Contato',
      description: 'Entre em contato conosco.',
      keywords: ['contato', 'fale conosco', 'atendimento'],
    },
    checkout: {
      title: 'Finalizar Compra',
      description: 'Finalize sua compra de forma segura e rápida.',
      noindex: true,
    },
    admin: {
      title: 'Admin',
      description: 'Área administrativa',
      noindex: true,
      nofollow: true,
    },
    legal: {
      terms: {
        title: 'Termos de Uso',
        description: 'Termos e condições de uso do site Mameluca Café.',
      },
      privacy: {
        title: 'Política de Privacidade',
        description: 'Como coletamos, usamos e protegemos suas informações.',
      },
    },
  },

  // Structured Data Templates
  schemas: {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': '#organization',
      name: 'Mameluca Café',
      url: 'https://mamelucacafe.com.br',
      logo: 'https://mamelucacafe.com.br/images/symbol.png',
      description: 'Nano-torrefação experimental de cafés brasileiros com foco em torra clara',
      foundingDate: '2025',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: 'Portuguese',
        areaServed: 'BR',
      },
      sameAs: [
        'https://instagram.com/mamelucacafe',
      ],
    },

    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': '#website',
      url: 'https://mamelucacafe.com.br',
      name: 'Mameluca Café',
      description: 'Nano-torrefação experimental de cafés brasileiros',
      publisher: { '@id': '#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://mamelucacafe.com.br/produtos?search={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },

    localBusiness: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': '#localbusiness',
      name: 'Mameluca Café',
      image: 'https://mamelucacafe.com.br/images/symbol.png',
      url: 'https://mamelucacafe.com.br',
      priceRange: '$$',
      servesCuisine: 'Café',
      acceptsReservations: false,
      paymentAccepted: 'Credit Card, Debit Card, PIX',
      currenciesAccepted: 'BRL',
    },
  },

  // Rich Results Features
  features: {
    breadcrumbs: true,
    sitelinks: true,
    faq: true,
    howTo: true,
    recipes: false,
    reviews: true,
    events: false,
    products: true,
    articles: true,
  },

  // Monitoring & Validation
  monitoring: {
    googleSearchConsole: '', // Add your GSC verification
    bingWebmaster: '', // Add Bing verification
    yandexWebmaster: '', // Add Yandex verification
    enableValidation: true,
    enableAutoReport: false,
  },
}

// Helper function to get page config
export function getPageSeo(pageName) {
  return seoConfig.pages[pageName] || seoConfig.defaults
}

// Helper function to format title
export function formatTitle(title, template = seoConfig.defaults.titleTemplate) {
  if (!title) return seoConfig.defaults.title
  return template.replace('%s', title)
}

// Helper function to get base URL
export function getBaseUrl() {
  return seoConfig.site.url
}

// Helper function to get canonical URL
export function getCanonicalUrl(path = '') {
  const baseUrl = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

export default seoConfig