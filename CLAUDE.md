# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js ecommerce template that uses server-side Stripe checkout with custom fields for Brazilian business requirements. It uses hybrid rendering (SSG + API routes) that allows merchants to quickly launch an online store with enhanced payment processing. Products are managed via individual YAML files and payments are processed through Stripe's hosted checkout with required CPF and cellphone collection.

## Development Principles

- Always use DRY (Don't Repeat Yourself) when applicable
- Follow existing patterns and conventions in the codebase

## Tech Stack

- Next.js 14 (App Router)
- React 18
- JavaScript (no TypeScript)
- CSS with tokenized design system
- Hybrid Rendering (SSG + API Routes)
- Server-side Stripe Checkout with Custom Fields
- Brazilian Business Requirements (CPF, Cellphone)
- YAML-based Product Management with js-yaml parser
- Upstash Redis for Real-time Inventory Management
- Remark for markdown processing (CommonMark + GFM)
- Gray Matter for frontmatter parsing in blog posts

## Project Structure

```
/app              # Next.js App Router pages
  /api            # API routes for server-side functionality
    /checkout     # Stripe checkout session creation
    /inventory    # Inventory management API
    /admin        # Admin management (auth, inventory, audit)
      /auth       # Authentication endpoints
      /inventory  # Inventory management API
      /audit      # Audit log API
    /webhooks     # Stripe webhook handlers
  /admin          # Admin interface pages
    /inventory    # Inventory management UI
  /blog           # Blog listing and post pages
/components       # React components
/content         # Markdown content files
  /blog          # Blog post markdown files
/data            # Product data
  categories.yaml         # Category definitions
  /products/             # Individual product YAML files
/lib             # Utility libraries
  redis.js           # Redis client and inventory functions
  auth-middleware.js # Admin authentication middleware
  audit-log.js       # Audit logging system
/public          # Static assets and images
/scripts         # Utility scripts for product management
/styles          # Global CSS
/utils           # YAML loader and other utilities
```

## Commands

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (hybrid rendering)
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Create new product template
node scripts/new-product.js <product-id>
```

## Architecture

### Data Flow
1. Products are defined in individual YAML files in `/data/products/`
2. Categories are defined in `/data/categories.yaml`
3. YAML loader utility (`/utils/loadProducts.js`) reads and combines all product data
4. Static pages are generated at build time using this data
5. Product images are stored in `/public/images/products/`
6. **Inventory data is stored in Upstash Redis using inventoryId keys**
7. Server-side API creates Stripe checkout sessions with custom fields
8. **Checkout process validates inventory before payment**
9. Checkout process collects CPF and cellphone data through Stripe's hosted interface
10. **Stripe webhooks automatically update inventory after successful payments**
11. Markdown content is processed at build time using Remark
12. Blog posts are stored as markdown files in `/content/blog/`
13. Blog pages are statically generated from markdown content

### Key Components
- **Header**: Navigation with centered SVG logo
- **ProductCard**: Product display with background image effect and action buttons
- **ProductDetailClient**: Client component for product details and checkout initiation
- **InventoryStatus**: Real-time inventory checking component
- **ProductsWithInventory**: Server component that fetches inventory data
- **Hero**: Homepage hero section
- **SelectedProducts**: Featured products display
- **Footer**: Site footer with links
- **Blog Components**: Blog listing and individual post pages

### Page Structure
- Homepage: Hero + Featured Products + About snippet
- Products: Category-grouped product listing with available/sold out sections
- Product Detail: Image gallery + Product info + Buy button (disabled for sold out)
- Content Pages: Markdown-rendered About, Contact
- Blog: Post listing page + Individual blog post pages

### Blog Architecture
- **Routes**: `/blog` for listing, `/blog/[slug]` for individual posts
- **Content**: Markdown files with gray-matter frontmatter
- **Static Generation**: Uses `generateStaticParams()` for build-time rendering
- **SEO**: Dynamic metadata for each post
- **Navigation**: Integrated into main header navigation

## Styling

- Uses a tokenized CSS system in `/styles/globals.css`
- CSS variables for fonts, spacing, colors, shadows, and font weights
- Font weight tokens:
  - `--font-weight-light: 300`
  - `--font-weight-regular: 350` (default for body text, optimized for variable font)
  - `--font-weight-medium: 500`
  - `--font-weight-bold: 700`
- Sharp corners design (no border-radius)
- Mobile-first, responsive design with breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px  
  - Desktop: > 1024px
- Utility classes for common patterns
- Product cards feature subtle background images with 0.05 opacity and luminosity blend mode
- Blog has dedicated styles for post listings and article content
- Custom attributes on product pages use smaller font size for better hierarchy

## Data Management

### YAML-Based Product System

#### Product Schema (Individual YAML Files)
Each product is stored in `/data/products/<id>.yaml`:

```yaml
# Café 001 - Bourbon Natural
# Ivan Santana - Fazenda Jangada

id: "001"
inventoryId: "inv_001"
slug: cafe-001
name: "001"
featured: false
visible: true  # Optional: set to false to hide product (defaults to true)
category: coffee

# Descrição e Notas
description: >
  Esse Bourbon me lembrou do Letty Bermudez, um café excepcional 
  da Colombia, refrescante, com textura de suco de fruta, suave 
  e de final marcante.
notas: Acidez Média, Fruta Vermelha, Suculento

# Comercial
price: 60
quantity: 100g                                    # Package size (NOT inventory stock)
stripePriceId: price_1RsXgZ7jQouLiFSsNcGbtoZy

# Informações do Café
produtor: Ivan Santana
fazenda: Jangada
regiao: Boa Vista, MG
variedade: Bourbon
processo: Natural Fermentado
torra: Clara

# Recomendações de Preparo
descanso: 2-3 semanas pós torra
filtrados: 85c, 1:17, pouca agitação
espresso: 94c, 1:3

# Imagens
images:
  - /images/products/001a.jpg
  - /images/products/001b.jpg
```

#### Categories Schema
Categories are defined in `/data/categories.yaml`:

```yaml
categories:
  - id: coffee
    displayName: Café
```

#### Data Loading
- Uses `/utils/loadProducts.js` to read all YAML files
- Caches data in production, reloads in development
- Sorts products by ID for consistent ordering
- Handles parsing errors gracefully

### Blog Post Schema
```yaml
---
title: "Post Title"
date: "YYYY-MM-DD"
visibility: true  # Set to false to hide post
---

Markdown content here...
```

### Inventory Management System

The ecommerce platform includes a real-time inventory management system powered by Upstash Redis.

#### Key Features
- **Real-time stock tracking** with automatic updates
- **Secure admin interface** for inventory management at `/admin/inventory`
- **Session-based authentication** with 1-hour expiration and rate limiting
- **Comprehensive audit logging** of all admin actions
- **Checkout validation** prevents overselling
- **Low stock warnings** when inventory < 5 units
- **Stripe webhook integration** for automatic inventory decrements
- **Fallback handling** when Redis is unavailable (fail-open approach)

#### Environment Variables Required
```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://mamelucacafe.com.br

# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Admin Configuration
ADMIN_PASSWORD=your-secure-password-here

# Optional: Allowed IPs (comma-separated, leave empty to allow all)
ADMIN_ALLOWED_IPS=

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### Inventory Architecture
1. **Product YAML files** include `inventoryId` field (e.g., `inv_001`)
2. **Redis storage** uses keys like `inventory:inv_001` 
3. **API endpoints** for checking and updating inventory
4. **Admin interface** provides GUI for stock management
5. **Stripe webhooks** automatically decrement on successful purchases
6. **Client components** check inventory in real-time

#### API Endpoints

**Public Endpoints:**
- `POST /api/inventory/check` - Check inventory for a product
- `POST /api/webhooks/stripe` - Handle Stripe payment webhooks

**Admin Authentication:**
- `POST /api/admin/auth` - Admin login (returns session token)
- `DELETE /api/admin/auth` - Admin logout (invalidates session)

**Admin Endpoints (require authentication):**
- `GET /api/admin/inventory` - Get all inventory levels
- `POST /api/admin/inventory` - Update inventory levels
- `POST /api/admin/inventory/sync` - Initialize inventory for new products
- `GET /api/admin/audit` - View audit logs and statistics

#### Inventory Logic
- Products with `quantity: 0` show "Esgotado" (Sold Out)
- Products with `quantity < 5` show low stock warning
- Checkout is prevented when inventory reaches 0
- The `soldOut` field has been removed from YAML files in favor of inventory-based logic

#### InventoryId Naming Convention
- Format: `inv_{productId}` (e.g., `inv_001`, `inv_002`, `inv_blend`)
- Each product YAML file must include an `inventoryId` field
- The inventoryId links the product to its Redis inventory record
- When creating new products, use: `inventoryId: "inv_{productId}"`
- Example: For product with `id: "005"`, use `inventoryId: "inv_005"`

## SEO Configuration

### Environment Variables
```bash
# Site Configuration (required for proper SEO)
NEXT_PUBLIC_SITE_URL=https://mamelucacafe.com.br
```

### SEO Features
- **Dynamic Metadata Generation**: All pages generate contextual meta tags
- **Structured Data**: JSON-LD schema for products with pricing and availability
- **Open Graph & Twitter Cards**: Optimized social sharing with proper image dimensions
- **Canonical URLs**: Prevents duplicate content issues across all pages
- **Automatic Sitemap**: Includes products, blog posts, and static pages with proper dates
- **robots.txt**: Dynamic configuration with sitemap reference
- **Blog SEO**: Auto-extracted descriptions from content, article-specific metadata
- **metadataBase**: Proper URL resolution for all relative paths
- **Keywords**: Context-aware keyword generation for products and blog posts

## Client vs Server Components

- Most components are server components by default
- Client components are used only when needed (state, interactivity)
- Example: `ProductDetailClient` handles image gallery interaction
- Blog pages are server components with static generation
- Important: In Next.js 15, dynamic route params must be awaited before use

## Security Guidelines

### Authentication & Authorization
1. **Session-Based Authentication**: Secure token-based sessions with 1-hour expiration
2. **Rate Limiting**: Max 5 login attempts per IP per hour to prevent brute force
3. **IP Binding**: Sessions are tied to IP addresses to prevent hijacking
4. **Time-Safe Operations**: Constant-time password comparison prevents timing attacks
5. **Audit Logging**: All admin actions logged with timestamps, IPs, and change tracking

### Application Security
6. **Stripe Integration**: Server-side checkout with secure API key handling
7. **Hybrid Architecture**: Static pages with secure server-side API routes
8. **Environment Variables**: Sensitive keys never exposed to client
9. **Input Validation**: Server-side validation of all user inputs
10. **Content Security**: Markdown content parsed safely without script execution
11. **Image Optimization**: Next.js Image component prevents XSS through images

### Admin Panel Security
12. **Bearer Token Authentication**: All admin endpoints require valid session tokens
13. **Automatic Session Cleanup**: Sessions expire and are cleaned up automatically
14. **Security Headers**: `X-Requested-With` and proper CORS handling
15. **Optional IP Allowlist**: Restrict admin access to specific IP addresses

## Development Guidelines

1. **Component Creation**: Follow existing patterns in `/components`
2. **Styling**: Use CSS tokens and utility classes before adding custom styles
3. **Images**: Always use Next.js Image component for optimization
4. **Links**: Use Next.js Link component for internal navigation
5. **Data Updates**: Modify individual YAML files in `/data/products/` - no rebuild needed in development
6. **Environment Setup**: Use `.env.local` for API keys (never commit secrets)
6. **Content Updates**: Edit markdown files in `/content` for page content
7. **Markdown Support**: Full CommonMark + GitHub Flavored Markdown syntax supported

## Common Tasks

### Adding a New Product
1. Create new product with helper script: `node scripts/new-product.js <product-id>`
2. Edit the generated YAML file in `/data/products/<product-id>.yaml`
3. Add product images to `/public/images/products/`
4. Create Stripe price and update `stripePriceId` in the YAML file
5. Set initial inventory: Visit `/admin/inventory` and sync products, then set stock levels
6. For production, run `npm run build` to regenerate static pages

### Managing Inventory (Sold Out Products)
1. Visit `/admin/inventory` and authenticate with admin password
2. Session tokens are valid for 1 hour with automatic warnings before expiry
3. Set inventory to `0` to mark products as sold out
4. Products with zero inventory automatically show "Esgotado" badge
5. Sold out products appear in "Cafés anteriores" section on products page
6. Section automatically hides when no products are sold out
7. Use the sync button to initialize inventory for new products
8. All inventory changes are logged in audit trail

### Editing Products
1. Edit individual YAML files in `/data/products/` directly
2. Changes are reflected immediately in development
3. Use comments and structured sections for organization
4. All data preserved from original JSON structure

### Managing Product Attributes
1. Product details page displays custom attributes in a grid layout
2. Attributes are explicitly defined using an allowlist approach
3. Current attributes displayed in "Detalhes" section: `produtor`, `fazenda`, `regiao`, `variedade`, `processo`, `torra`
4. Attributes displayed in "Recomendações" section: `descanso`, `filtrados`, `espresso`
5. To modify displayed attributes, update the arrays in `ProductDetailClient.js`

### Adding a New Category
1. Add category to the categories array in `products.json`
2. Use the category ID in product objects
3. Products will automatically group by category on the products page

### Customizing Design
1. Update CSS variables in `/styles/globals.css`
2. Modify component styles using existing utility classes
3. Keep mobile-first approach in mind

### Managing Blog Posts
1. Create markdown files in `/content/blog/` with frontmatter
2. Set `visibility: false` to hide posts without deleting
3. Posts are automatically sorted by date (newest first)
4. Run `npm run build` to regenerate static pages
5. Blog supports full CommonMark + GitHub Flavored Markdown

### Admin Authentication & Security
1. **Initial Setup**: Set `ADMIN_PASSWORD` in environment variables
2. **Login Process**: Visit `/admin/inventory`, enter password to get session token
3. **Session Management**: 
   - Sessions expire after 1 hour automatically
   - Warning displayed 5 minutes before expiry
   - Sessions tied to IP address for security
   - Automatic logout on session expiry
4. **Rate Limiting**: Maximum 5 failed login attempts per IP per hour
5. **Audit Trail**: All admin actions logged with timestamps and IP addresses
6. **Security Features**:
   - Time-safe password comparison
   - Secure session token generation
   - Automatic session cleanup
   - Optional IP allowlist (`ADMIN_ALLOWED_IPS`)
7. **Viewing Audit Logs**: Access via API at `/api/admin/audit?stats=true` for statistics
8. **Logout**: Use logout button or sessions expire automatically

### Server-Side Checkout Implementation

#### API Route Structure
- **Endpoint**: `/api/checkout` (POST)
- **Purpose**: Creates Stripe checkout sessions with Brazilian custom fields
- **Location**: `/app/api/checkout/route.js`

#### Custom Fields Configuration
The checkout session includes these required fields for Brazilian compliance:

1. **CPF Field**:
   - Key: `cpf`
   - Label: `CPF (000.000.000-00 ou 00000000000)`
   - Type: `text`
   - Validation: Required, 11-14 characters
   - Purpose: Brazilian tax identification
   - Format: Accepts both formatted (000.000.000-00) and unformatted (00000000000)
   - Note: Real-time masking not available in Stripe hosted checkout

2. **Cellphone Field**:
   - Key: `cellphone`
   - Label: `Celular (WhatsApp)`
   - Type: `text`
   - Validation: Required, 10-15 characters
   - Purpose: Customer contact via WhatsApp

#### Request Flow
1. User clicks "Comprar" button on product page
2. `ProductDetailClient.js` sends POST request to `/api/checkout` with product ID
3. API validates product exists and is not sold out
4. Creates Stripe checkout session with custom fields and Brazil-only shipping
5. Returns checkout URL for client-side redirect
6. User completes payment with CPF and cellphone data collection
7. Stripe processes payment and stores custom field data

#### Error Handling
- Product not found: "Produto não encontrado"
- Product sold out: "Produto esgotado"
- Server errors: "Erro ao processar pagamento. Tente novamente."
- Missing environment variables: Proper server-side validation

#### Environment Variables Required
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Client-side key
STRIPE_SECRET_KEY=sk_test_...                   # Server-side key (never exposed)
```

## Inventory Management System

This project uses a **dual-system approach** that separates product catalog from inventory management:

- **YAML Files**: Store product information (name, price, description, images)
- **Redis + Admin Panel**: Manage inventory levels (stock quantities, reservations)

### Key Principles

1. **Separation of Concerns**: 
   - YAML `quantity` field = Package size (e.g., "100g", "250g")
   - Redis inventory = Stock levels (e.g., 25 units available)

2. **Auto-Detection**: Admin panel automatically detects all YAML products
3. **Zero Configuration**: New products start with 0 inventory (safe default)
4. **On-Demand Creation**: Redis entries created when first setting inventory

### Inventory ID Convention
- Format: `inv_{productId}`
- Examples: `inv_001`, `inv_002`, `inv_blend`
- Must be included in every product YAML file

### Admin Workflow
1. Create YAML product file (no inventory/stock fields needed)
2. Deploy to production
3. Visit `/admin/inventory` - product appears with "Não configurado" status
4. Set desired stock quantity - Redis entry created automatically
5. Product immediately available for sale with reservation system

See `INVENTORY.md` for complete documentation.

## Webhook & Payment Processing

### Stripe Webhook Configuration

**Critical**: Webhook URL must match your production domain exactly:
- ✅ `https://www.mamelucacafe.com.br/api/webhooks/stripe` (correct)
- ❌ `https://mamelucacafe.com.br/api/webhooks/stripe` (will cause 307 redirects)

### Required Events
- `checkout.session.completed` - For inventory updates after payment
- `checkout.session.expired` - For releasing reservations

### Environment Variables
```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Must match webhook endpoint secret

# Site Configuration (required for proper URL handling)
NEXT_PUBLIC_SITE_URL=https://www.mamelucacafe.com.br
```

### Webhook Processing Flow
1. **Payment completed** → Stripe sends `checkout.session.completed`
2. **Webhook validates** signature and payment status
3. **Inventory updated** via `confirmPurchase()` - atomic operation
4. **Reservation cleared** - frees up stock for other customers
5. **Fallback handling** - cleans up stale reservations if needed

### Common Webhook Issues & Solutions

#### Issue: Webhook returns 307 redirects
**Cause**: Domain mismatch or URL redirects
**Solution**: Ensure webhook URL matches production domain exactly (including www)

#### Issue: Reservations not clearing after payment
**Cause**: Webhook not processing due to async/await issues
**Solution**: Process webhook synchronously, not fire-and-forget

#### Issue: `cleanUrls` interference
**Cause**: Vercel `cleanUrls: true` setting conflicts with Next.js App Router
**Solution**: Remove `cleanUrls` and `trailingSlash` from `vercel.json`

### Debugging Tools
- `scripts/debug-webhook.js` - Check reservation status and clear manually
- `scripts/fix-reservations.js` - Diagnose and fix reservation mismatches
- `/api/admin/inventory/clear-reservations` - Admin endpoint to clear all stale reservations

## Production Logging

### Logger Implementation
- Development: Full console logging for debugging
- Production: Logs suppressed for clean deployment
- Location: `/lib/logger.js`

### Usage
```javascript
import logger from '@/lib/logger';

// Only logs in development
logger.log('Debug information');
logger.error('Error details');
logger.warn('Warning message');
```

**Never use `console.log` directly in production code** - always use the logger.

## Important Notes

- Uses hybrid rendering - static pages with dynamic API routes
- No database - all product data comes from YAML files
- YAML-based product management for easier editing and scalability
- Server-side Stripe checkout requires Node.js runtime
- Images should be optimized before adding to the project
- Static export is disabled to enable API routes (`output: 'export'` commented out)
- Markdown pages use async components due to Remark's async processing
- Blog posts include SEO-optimized metadata generation
- Dynamic route parameters must be awaited in Next.js 15 (e.g., `const { slug } = await params`)
- **Webhook URL must include www subdomain** to avoid 307 redirects
- **Never use `cleanUrls: true` in vercel.json** with Next.js App Router - causes API route conflicts