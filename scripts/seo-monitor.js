#!/usr/bin/env node

/**
 * SEO Monitoring Script
 * Validates SEO implementation across all pages
 */

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import matter from 'gray-matter'
import seoConfig from '../config/seo.config.js'
import getProductsData from '../utils/loadProducts.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const checks = {
  passed: [],
  warnings: [],
  errors: []
}

function log(type, message) {
  const prefix = {
    passed: '✅',
    warning: '⚠️',
    error: '❌'
  }[type]

  console.log(`${prefix} ${message}`)
  checks[type === 'passed' ? 'passed' : type === 'warning' ? 'warnings' : 'errors'].push(message)
}

// Check SEO configuration
function checkSeoConfig() {
  console.log('\n📋 Checking SEO Configuration...\n')

  // Check site configuration
  if (seoConfig.site.url) {
    log('passed', 'Site URL is configured')
  } else {
    log('error', 'Site URL is missing')
  }

  if (seoConfig.site.name && seoConfig.site.fullName) {
    log('passed', 'Site names are configured')
  } else {
    log('error', 'Site names are missing')
  }

  // Check contact information
  if (!seoConfig.contact.email) {
    log('warning', 'Contact email is missing')
  }

  if (!seoConfig.contact.whatsapp || seoConfig.contact.whatsapp.includes('999999')) {
    log('warning', 'Real WhatsApp number not configured')
  }

  if (!seoConfig.contact.address.streetAddress) {
    log('warning', 'Street address is missing')
  }

  if (!seoConfig.contact.address.postalCode) {
    log('warning', 'Postal code is missing')
  }

  // Check social media
  if (!seoConfig.social.twitter.handle) {
    log('warning', 'Twitter handle not configured')
  }

  if (!seoConfig.social.instagram.handle) {
    log('warning', 'Instagram handle not configured')
  }

  // Check monitoring
  if (!seoConfig.monitoring.googleSearchConsole) {
    log('warning', 'Google Search Console verification not configured')
  }
}

// Check static pages
function checkStaticPages() {
  console.log('\n📄 Checking Static Pages...\n')

  const pages = [
    { path: 'app/page.js', name: 'Home' },
    { path: 'app/produtos/page.js', name: 'Products' },
    { path: 'app/sobre/page.js', name: 'About' },
    { path: 'app/contato/page.js', name: 'Contact' },
    { path: 'app/blog/page.js', name: 'Blog' },
    { path: 'app/termos/page.js', name: 'Terms' },
    { path: 'app/privacidade/page.js', name: 'Privacy' }
  ]

  pages.forEach(page => {
    const filePath = join(dirname(__dirname), page.path)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')

      // Check for SEO imports
      if (content.includes('@/lib/seo')) {
        log('passed', `${page.name} page uses centralized SEO`)
      } else if (content.includes('export const metadata')) {
        log('warning', `${page.name} page uses old metadata pattern`)
      } else if (page.name !== 'Home') {
        log('error', `${page.name} page missing metadata`)
      }

      // Check for structured data
      if (content.includes('JsonLd') || content.includes('structured-data')) {
        log('passed', `${page.name} page has structured data`)
      }
    } else {
      log('error', `${page.name} page not found`)
    }
  })
}

// Check dynamic pages
function checkDynamicPages() {
  console.log('\n🔄 Checking Dynamic Pages...\n')

  // Check product pages
  const productPagePath = join(dirname(__dirname), 'app/produtos/[slug]/page.js')
  if (fs.existsSync(productPagePath)) {
    const content = fs.readFileSync(productPagePath, 'utf-8')

    if (content.includes('generateProductSchema')) {
      log('passed', 'Product pages have product schema')
    } else {
      log('error', 'Product pages missing product schema')
    }

    if (content.includes('generateBreadcrumbSchema')) {
      log('passed', 'Product pages have breadcrumb schema')
    } else {
      log('warning', 'Product pages missing breadcrumb schema')
    }
  }

  // Check blog pages
  const blogPagePath = join(dirname(__dirname), 'app/blog/[slug]/page.js')
  if (fs.existsSync(blogPagePath)) {
    const content = fs.readFileSync(blogPagePath, 'utf-8')

    if (content.includes('generateArticleSchema')) {
      log('passed', 'Blog pages have article schema')
    } else {
      log('error', 'Blog pages missing article schema')
    }
  }
}

// Check products data
function checkProductsData() {
  console.log('\n🛍️ Checking Products SEO...\n')

  const productsData = getProductsData()
  let missingImages = 0
  let missingDescriptions = 0

  productsData.products.forEach(product => {
    if (!product.description || product.description.length < 50) {
      missingDescriptions++
    }

    if (!product.images || product.images.length === 0) {
      missingImages++
    }
  })

  if (missingDescriptions === 0) {
    log('passed', 'All products have descriptions')
  } else {
    log('warning', `${missingDescriptions} products have short/missing descriptions`)
  }

  if (missingImages === 0) {
    log('passed', 'All products have images')
  } else {
    log('error', `${missingImages} products missing images`)
  }
}

// Check blog posts
function checkBlogPosts() {
  console.log('\n📝 Checking Blog Posts SEO...\n')

  const blogDir = join(dirname(__dirname), 'content/blog')
  if (fs.existsSync(blogDir)) {
    const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'))

    files.forEach(file => {
      const content = fs.readFileSync(join(blogDir, file), 'utf-8')
      const { data } = matter(content)

      if (!data.title) {
        log('error', `Blog post ${file} missing title`)
      }

      if (!data.date) {
        log('warning', `Blog post ${file} missing date`)
      }

      if (!data.description && content.length < 100) {
        log('warning', `Blog post ${file} needs description`)
      }
    })

    if (files.length > 0) {
      log('passed', `${files.length} blog posts found`)
    }
  }
}

// Check sitemap and robots
function checkSitemapRobots() {
  console.log('\n🗺️ Checking Sitemap & Robots...\n')

  const sitemapPath = join(dirname(__dirname), 'app/sitemap.js')
  if (fs.existsSync(sitemapPath)) {
    const content = fs.readFileSync(sitemapPath, 'utf-8')
    if (content.includes('getBaseUrl')) {
      log('passed', 'Sitemap uses centralized config')
    } else {
      log('warning', 'Sitemap not using centralized config')
    }
  } else {
    log('error', 'Sitemap not found')
  }

  const robotsPath = join(dirname(__dirname), 'app/robots.js')
  if (fs.existsSync(robotsPath)) {
    const content = fs.readFileSync(robotsPath, 'utf-8')
    if (content.includes('getBaseUrl')) {
      log('passed', 'Robots.txt uses centralized config')
    } else {
      log('warning', 'Robots.txt not using centralized config')
    }
  } else {
    log('error', 'Robots.txt not found')
  }
}

// Run all checks
console.log('\n🔍 SEO Monitoring Report\n')
console.log('=' . repeat(50))

checkSeoConfig()
checkStaticPages()
checkDynamicPages()
checkProductsData()
checkBlogPosts()
checkSitemapRobots()

// Summary
console.log('\n' + '=' . repeat(50))
console.log('\n📊 Summary:\n')
console.log(`✅ Passed: ${checks.passed.length}`)
console.log(`⚠️  Warnings: ${checks.warnings.length}`)
console.log(`❌ Errors: ${checks.errors.length}`)

if (checks.errors.length > 0) {
  console.log('\n🔴 Critical issues found:')
  checks.errors.forEach(err => console.log(`  - ${err}`))
}

if (checks.warnings.length > 0) {
  console.log('\n🟡 Improvements suggested:')
  checks.warnings.slice(0, 5).forEach(warn => console.log(`  - ${warn}`))
  if (checks.warnings.length > 5) {
    console.log(`  ... and ${checks.warnings.length - 5} more`)
  }
}

if (checks.errors.length === 0 && checks.warnings.length === 0) {
  console.log('\n🎉 Perfect! Your SEO implementation is fully optimized!')
}

process.exit(checks.errors.length > 0 ? 1 : 0)