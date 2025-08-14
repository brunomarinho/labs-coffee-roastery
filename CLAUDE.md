# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js ecommerce template that uses server-side Stripe checkout with custom fields for Brazilian business requirements. It uses hybrid rendering (SSG + API routes) that allows merchants to quickly launch an online store with enhanced payment processing. Products are managed via a JSON file and payments are processed through Stripe's hosted checkout with required CPF and cellphone collection.

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
- Remark for markdown processing (CommonMark + GFM)
- Gray Matter for frontmatter parsing in blog posts

## Project Structure

```
/app              # Next.js App Router pages
  /api            # API routes for server-side functionality
    /checkout     # Stripe checkout session creation
  /blog           # Blog listing and post pages
/components       # React components
/content         # Markdown content files
  /blog          # Blog post markdown files
/data            # Product data (products.json)
/public          # Static assets and images
/styles          # Global CSS
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
```

## Architecture

### Data Flow
1. Products are defined in `/data/products.json`
2. Static pages are generated at build time using this data
3. Product images are stored in `/public/images/products/`
4. Server-side API creates Stripe checkout sessions with custom fields
5. Checkout process collects CPF and cellphone data through Stripe's hosted interface
6. Markdown content is processed at build time using Remark
7. Blog posts are stored as markdown files in `/content/blog/`
8. Blog pages are statically generated from markdown content

### Key Components
- **Header**: Navigation with centered SVG logo
- **ProductCard**: Product display with background image effect and action buttons
- **ProductDetailClient**: Client component for product details and checkout initiation
- **Hero**: Homepage hero section
- **SelectedProducts**: Featured products display
- **Footer**: Site footer with links
- **Blog Components**: Blog listing and individual post pages

### Page Structure
- Homepage: Hero + Featured Products + About snippet
- Products: Category-grouped product listing with available/sold out sections
- Product Detail: Image gallery + Product info + Buy button (disabled for sold out)
- Content Pages: Markdown-rendered About, FAQ, Contact
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

### Product Schema
```json
{
  "id": "unique-id",
  "slug": "url-friendly-name",
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "category-id",
  "images": ["/images/products/image.jpg"],
  "featured": true,
  "soldOut": false,
  "stripePriceId": "price_1ABC123DEF456",
  "customField": "value"
}
```

### Categories
Categories are defined in the same `products.json` file with display names.

### Blog Post Schema
```yaml
---
title: "Post Title"
date: "YYYY-MM-DD"
visibility: true  # Set to false to hide post
---

Markdown content here...
```

## SEO Considerations

- Dynamic metadata generation for all pages
- Open Graph tags for social sharing
- Automatic sitemap generation
- robots.txt configuration
- Semantic HTML structure

## Client vs Server Components

- Most components are server components by default
- Client components are used only when needed (state, interactivity)
- Example: `ProductDetailClient` handles image gallery interaction
- Blog pages are server components with static generation
- Important: In Next.js 15, dynamic route params must be awaited before use

## Security Guidelines

1. **Stripe Integration**: Server-side checkout with secure API key handling
2. **Hybrid Architecture**: Static pages with secure server-side API routes
3. **Environment Variables**: Sensitive keys (STRIPE_SECRET_KEY) never exposed to client
4. **Input Validation**: Server-side validation of product data before checkout
5. **Content Security**: Markdown content is parsed safely without executing scripts
6. **Image Optimization**: Next.js Image component prevents XSS through images

## Development Guidelines

1. **Component Creation**: Follow existing patterns in `/components`
2. **Styling**: Use CSS tokens and utility classes before adding custom styles
3. **Images**: Always use Next.js Image component for optimization
4. **Links**: Use Next.js Link component for internal navigation
5. **Data Updates**: Modify `/data/products.json` and rebuild to update products
6. **Environment Setup**: Use `.env.local` for API keys (never commit secrets)
6. **Content Updates**: Edit markdown files in `/content` for page content
7. **Markdown Support**: Full CommonMark + GitHub Flavored Markdown syntax supported

## Common Tasks

### Adding a New Product
1. Add product object to `/data/products.json` with `soldOut: false`
2. Add product images to `/public/images/products/`
3. Create Stripe price and add price ID to product data
4. Run `npm run build` to regenerate static pages

### Managing Sold Out Products
1. Set `"soldOut": true` in the product data to mark as sold out
2. Product will display "Esgotado" badge next to "Detalhes" button
3. Sold out products appear in "Cafés anteriores" section on products page
4. Section automatically hides when no products are sold out

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

## Important Notes

- Uses hybrid rendering - static pages with dynamic API routes
- No database - all product data comes from JSON files
- Server-side Stripe checkout requires Node.js runtime
- Images should be optimized before adding to the project
- Static export is disabled to enable API routes (`output: 'export'` commented out)
- Markdown pages use async components due to Remark's async processing
- Blog posts include SEO-optimized metadata generation
- Dynamic route parameters must be awaited in Next.js 15 (e.g., `const { slug } = await params`)
- Requires environment variables: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`