# Next.js Ecommerce Template with Stripe Checkout

A modern ecommerce template built with Next.js 14 App Router and Stripe's server-side checkout with custom fields for Brazilian business requirements. Perfect for quickly launching an online store with enhanced payment processing.

## Features

- 🛍️ **Product Catalog** - Organized by categories with detail pages
- 💳 **Stripe Server-Side Checkout** - Custom checkout with required CPF and cellphone fields for Brazilian businesses
- 📊 **Real-Time Inventory Management** - Redis-powered inventory system with secure admin interface
- 🔐 **Enterprise Security** - Session-based admin authentication with audit logging and rate limiting
- 📱 **Fully Responsive** - Mobile-first design with responsive breakpoints
- 🚀 **Hybrid Rendering** - Static site generation with dynamic API routes for checkout processing
- 🎨 **Tokenized CSS System** - Consistent design with CSS variables
- 📝 **Markdown Content** - Easy content management with full CommonMark support via Remark
- 🔍 **SEO Ready** - Dynamic meta tags, sitemap, and Open Graph support
- ⚡ **Low Stock Warnings** - Automatic alerts when products are running low
- 🎯 **Modern UI Design** - Clean interface with sharp corners and minimalist aesthetics
- 🖼️ **Background Image Effects** - Product cards with subtle background images using opacity and blend modes
- 📰 **Blog System** - Markdown-based blog with static generation and SEO optimization
- 🛡️ **Audit Trail** - Complete logging of admin actions with timestamps and IP tracking

## Project Structure

```
/app
  /api
    /checkout/route.js     # Server-side Stripe checkout API
    /inventory/check/route.js  # Inventory checking API
    /admin/auth/route.js   # Admin authentication (login/logout)
    /admin/inventory/route.js  # Admin inventory management API
    /admin/inventory/sync/route.js  # Product inventory sync
    /admin/audit/route.js  # Admin audit log API
    /webhooks/stripe/route.js  # Stripe webhook handler
  /admin/inventory/page.js   # Admin inventory management interface
  /about/page.js          # About page (renders markdown)
  /blog/page.js          # Blog listing page
  /blog/[slug]/page.js   # Individual blog post pages
  /faq/page.js           # FAQ page (renders markdown)
  /contact/page.js       # Contact page (renders markdown)
  /products/page.js      # Product listing page
  /products/[slug]/      # Dynamic product detail pages
  layout.js              # Root layout with metadata
  page.js                # Homepage
  not-found.js          # 404 error page
  sitemap.js            # Dynamic sitemap generation
  robots.js             # robots.txt configuration
/components
  Header.js              # Navigation header with centered logo
  Footer.js              # Site footer
  ProductCard.js         # Product card with background image and action buttons
  Hero.js                # Homepage hero section
  SelectedProducts.js    # Featured products display
  AboutSnippet.js        # Homepage about section
  ProductDetailClient.js # Client component for product details
  InventoryStatus.js     # Real-time inventory checking component
  ProductsWithInventory.js # Server component for inventory-aware product listing
/content
  about.md               # About page content
  faq.md                 # FAQ page content
  contact.md             # Contact page content
  /blog/                 # Blog posts directory
    post-slug.md         # Individual blog posts
/data
  categories.yaml        # Category definitions
  /products/             # Individual product YAML files with inventoryId
    001.yaml            # Product files (one per product)
    002.yaml
    blend.yaml
/lib
  redis.js              # Redis client and inventory management functions
  auth-middleware.js    # Admin authentication middleware
  audit-log.js          # Audit logging system
/public
  /images
    /products           # Product images directory
/scripts
  migrate-json-to-yaml.js # Migration script (for reference)
  new-product.js         # Helper script to create new products
/styles
  globals.css           # Global styles with CSS tokens
/utils
  loadProducts.js       # YAML product loader utility
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Stripe account with test/live API keys
- Upstash Redis database (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd labs-stripe-link-template
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Set up required services:
   - Create a free Upstash Redis database at https://upstash.com
   - Get your Stripe API keys from the Stripe dashboard

5. Add your environment variables to `.env.local`:
```
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here

# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Admin Configuration
ADMIN_PASSWORD=your-secure-password-here

# Optional: Allowed IPs (comma-separated, leave empty to allow all)
ADMIN_ALLOWED_IPS=

# Stripe Webhook Secret (for production)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your site.

7. Set up inventory (first time only):
   - Visit http://localhost:3000/admin/inventory
   - Enter your admin password (session expires after 1 hour)
   - Click "Sincronizar Produtos" to initialize inventory
   - Set stock levels for your products
   - All actions are logged for security audit

## Configuration

### 1. Managing Products (YAML-Based System)

This template uses a modern YAML-based product management system where each product has its own file for easier editing and management.

#### Adding a New Product

Use the helper script to create a new product:

```bash
node scripts/new-product.js 005
```

This creates `/data/products/005.yaml` with a template structure:

```yaml
# Café 005 - [Variedade]
# [Produtor] - [Fazenda]

id: "005"
inventoryId: "inv_005"
slug: cafe-005
name: "005"
featured: false
category: coffee

# Descrição e Notas
description: >
  Descrição do café aqui...
notas: Notas de degustação

# Comercial
price: 60
quantity: 100g
stripePriceId: price_PLACEHOLDER

# Informações do Café
produtor: Nome do Produtor
fazenda: Nome da Fazenda
regiao: Região, Estado
variedade: Variedade
processo: Processamento
torra: Clara

# Recomendações de Preparo
descanso: 2-3 semanas pós torra
filtrados: temperatura, proporção, método
espresso: temperatura, proporção

# Imagens
images:
  - /images/products/005a.jpg
  - /images/products/005b.jpg
```

#### Editing Products

Simply edit the individual YAML files in `/data/products/`:

```bash
# Edit a specific product
code data/products/003.yaml

# Make it featured on homepage
featured: true

# Note: Sold out status is now managed through the inventory system
```

#### Product Categories

Categories are defined in `/data/categories.yaml`:

```yaml
categories:
  - id: coffee
    displayName: Café
```

### 2. Add Product Images

Place your product images in `/public/images/products/`. Use the filenames referenced in your product YAML files.

### 3. Set Up Stripe Products

1. **Create products in Stripe Dashboard:**
   - Go to your [Stripe Dashboard](https://dashboard.stripe.com/products)
   - Create a new product with name and price
   - Copy the price ID (starts with `price_`)
   
2. **Update product YAML files:**
   - Replace placeholder price IDs with your actual Stripe price IDs
   - Example: `stripePriceId: price_1ABC123DEF456`

3. **Test with Stripe Test Mode:**
   - Use test API keys during development
   - Test card number: 4242 4242 4242 4242
   - Any future expiry date and any 3-digit CVV
   - Custom fields (CPF and cellphone) will appear in checkout form
   - Test data will appear in your Stripe dashboard after successful payment

### 4. Managing Inventory

The template includes a secure, real-time inventory management system:

#### Admin Authentication
- **Login**: Visit `/admin/inventory` and enter your admin password
- **Session Security**: Sessions expire after 1 hour with 5-minute warning
- **Rate Limiting**: Maximum 5 failed login attempts per IP per hour
- **IP Binding**: Sessions are tied to IP addresses to prevent hijacking
- **Audit Logging**: All admin actions are logged with timestamps and IP addresses

#### Admin Interface
- **Product Sync**: Use "Sincronizar Produtos" to initialize inventory for new products
- **Stock Management**: Set levels using input fields or quick action buttons (+10, +1, -1, -10)
- **Real-time Updates**: Inventory changes affect product availability immediately
- **Session Info**: View current session expiry time in the admin header
- **Logout**: Use logout button or sessions expire automatically

#### Inventory Features  
- **Real-time updates**: Inventory changes are immediately reflected on the frontend
- **Low stock warnings**: Products with < 5 units show "Apenas X unidades disponíveis" 
- **Sold out handling**: Products with 0 inventory automatically show "Esgotado"
- **Automatic updates**: Stripe webhooks automatically decrement inventory after successful purchases
- **Graceful fallback**: If Redis is unavailable, products remain purchasable (fail-open)

#### Sold Out Products
- Products with zero inventory automatically show "Esgotado" badge 
- On the products page, sold out items appear in a separate "Cafés anteriores" section
- The "Cafés anteriores" section is automatically hidden when no products are sold out
- No more manual `soldOut: true` in YAML files - it's all inventory-based now

### 5. Customize Content

- Edit markdown files in `/content/` for About, FAQ, and Contact pages
- Markdown supports full CommonMark specification plus GitHub Flavored Markdown
- Update store name and metadata in `/app/layout.js`
- Modify hero text in `/components/Hero.js`
- Customize colors and styling in `/styles/globals.css`

### 6. Managing Blog Posts

The template includes a blog system for content marketing:

#### Creating Blog Posts

1. Create a new markdown file in `/content/blog/` (e.g., `my-post.md`)
2. Add frontmatter at the top of the file:

```yaml
---
title: "Your Blog Post Title"
date: "2024-01-15"
visibility: true
---

Your blog post content here using markdown...
```

3. The slug (URL) will be the filename without `.md` extension
4. Set `visibility: false` to hide a post without deleting it
5. Run `npm run build` to regenerate the site with new posts

#### Blog Features

- **Automatic listing** - All visible posts appear on `/blog`
- **Date sorting** - Posts are ordered newest first
- **SEO optimization** - Each post has dynamic meta tags
- **Full markdown support** - CommonMark + GitHub Flavored Markdown
- **Static generation** - Posts are pre-rendered at build time

### 7. Brazilian Checkout Requirements

The checkout system includes custom fields required for Brazilian businesses:

#### Custom Fields

- **CPF (Cadastro de Pessoas Físicas)**
  - Required field for Brazilian tax identification
  - Accepts 11-14 characters (formatted or unformatted)
  - Appears as "CPF" in checkout form

- **Cellphone (WhatsApp)**
  - Required field for customer contact
  - Accepts 10-15 characters for phone numbers
  - Labeled as "Celular (WhatsApp)" in checkout

#### Data Collection

- Both fields are mandatory during checkout
- Data is collected through Stripe's hosted checkout interface
- Information appears in Stripe dashboard after successful payment
- Shipping address collection is limited to Brazil only (`allowedCountries: ['BR']`)

#### API Architecture

- Server-side checkout session creation via `/api/checkout`
- Product validation (exists, not sold out) before creating session
- Secure handling of Stripe secret keys server-side
- Portuguese error messages for all scenarios

### 8. Security Configuration

The template includes enterprise-grade security features:

#### Authentication Security
- **Password-based login** with secure session token generation
- **Time-safe comparison** prevents timing attacks during login
- **Rate limiting** blocks brute force attacks (5 attempts/hour per IP)
- **Session expiration** automatically logs out after 1 hour of inactivity
- **IP allowlist** (optional) restricts admin access to specific IP addresses

#### Audit & Monitoring
- **Comprehensive logging** of all admin actions in Redis
- **30-day retention** for audit logs with automatic cleanup
- **IP tracking** for all login attempts and admin actions
- **Change tracking** logs old and new values for inventory updates
- **Security events** logged including IP mismatches and failed logins

#### API Security
- **Bearer token authentication** for all admin API endpoints
- **Session invalidation** on security violations or suspicious activity
- **Secure headers** including `X-Requested-With` validation
- **Input validation** and sanitization on all endpoints

#### Configuration
Set these optional security environment variables:
```bash
# Restrict admin access to specific IPs (comma-separated)
ADMIN_ALLOWED_IPS=192.168.1.1,10.0.0.1

# Strong admin password (required)
ADMIN_PASSWORD=your-very-secure-password-here
```

#### Monitoring Admin Activity
View audit logs and statistics:
```bash
# Get audit statistics
curl -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
     "http://localhost:3000/api/admin/audit?stats=true"

# Get recent admin actions
curl -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
     "http://localhost:3000/api/admin/audit"
```

### 9. Update Site URLs

Update the site URL in:
- `/app/sitemap.js` - Change baseUrl
- `/app/robots.js` - Update sitemap URL
- `/app/layout.js` - Update OpenGraph URL

## CSS Customization

The template uses a tokenized CSS system. Update these variables in `/styles/globals.css`:

```css
:root {
  /* Font Sizes */
  --font-xs: 0.75rem;
  --font-sm: 0.875rem;
  --font-md: 1rem;
  --font-lg: 1.25rem;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  
  /* Colors */
  --color-primary: #0070f3;
  --color-secondary: #6366f1;
  --color-text: #1a1a1a;
  --color-background: #ffffff;
  --color-accent: #f97316;
}
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint

# Product Management
node scripts/new-product.js <id>  # Create new product template
```

## Deployment

This template uses hybrid rendering (static pages + API routes) and requires a Node.js server environment:

### Vercel (Recommended)
```bash
vercel --prod
```
Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `ADMIN_PASSWORD`
- `ADMIN_ALLOWED_IPS` (optional)
- `STRIPE_WEBHOOK_SECRET` (for webhook handling)

### Netlify
1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables in Netlify dashboard
4. Enable "Functions" for API routes

### Other Node.js Hosting
1. Build the project: `npm run build`
2. Start with: `npm start`
3. Ensure environment variables are set

**Note:** Static export is disabled to support server-side checkout API routes. The site requires a Node.js runtime for the checkout functionality.

## Technical Features

### Markdown Processing
- Uses [Remark](https://github.com/remarkjs/remark) for markdown parsing
- Full CommonMark specification support
- GitHub Flavored Markdown (tables, strikethrough, task lists, etc.)
- Secure HTML output with built-in sanitization

### SEO Features
- Dynamic page titles and descriptions
- Open Graph tags for social sharing
- Automatic sitemap generation at `/sitemap.xml`
- robots.txt configuration
- Semantic HTML structure

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this template for your projects!

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.