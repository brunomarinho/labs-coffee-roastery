# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js ecommerce template that uses Stripe payment links for checkout. It's a fully static site (SSG) that allows merchants to quickly launch an online store without backend infrastructure. Products are managed via a JSON file and payments are processed through Stripe's hosted payment links.

## Development Principles

- Always use DRY (Don't Repeat Yourself) when applicable
- Follow existing patterns and conventions in the codebase

## Tech Stack

- Next.js 14 (App Router)
- React 18
- JavaScript (no TypeScript)
- CSS with tokenized design system
- Static Site Generation (SSG)
- Stripe Payment Links
- Remark for markdown processing (CommonMark + GFM)

## Project Structure

```
/app              # Next.js App Router pages
/components       # React components
/content         # Markdown content files
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

# Build for production (static export)
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
4. Stripe payment links handle the checkout process externally
5. Markdown content is processed at build time using Remark

### Key Components
- **Header**: Navigation with centered SVG logo
- **ProductCard**: Product display with background image effect and action buttons
- **ProductDetailClient**: Client component for interactive product features
- **Hero**: Homepage hero section
- **SelectedProducts**: Featured products display
- **Footer**: Site footer with links

### Page Structure
- Homepage: Hero + Featured Products + About snippet
- Products: Category-grouped product listing with available/sold out sections
- Product Detail: Image gallery + Product info + Buy button (disabled for sold out)
- Content Pages: Markdown-rendered About, FAQ, Contact

## Styling

- Uses a tokenized CSS system in `/styles/globals.css`
- CSS variables for fonts, spacing, colors, and shadows
- Sharp corners design (no border-radius)
- Mobile-first, responsive design with breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px  
  - Desktop: > 1024px
- Utility classes for common patterns
- Product cards feature subtle background images with 0.05 opacity and luminosity blend mode

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
  "stripePaymentLink": "https://buy.stripe.com/...",
  "customField": "value"
}
```

### Categories
Categories are defined in the same `products.json` file with display names.

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

## Security Guidelines

1. **Stripe Integration**: Payment links are external - no sensitive payment data is handled
2. **Static Site**: No server-side code means reduced attack surface
3. **Content Security**: Markdown content is parsed safely without executing scripts
4. **Image Optimization**: Next.js Image component prevents XSS through images

## Development Guidelines

1. **Component Creation**: Follow existing patterns in `/components`
2. **Styling**: Use CSS tokens and utility classes before adding custom styles
3. **Images**: Always use Next.js Image component for optimization
4. **Links**: Use Next.js Link component for internal navigation
5. **Data Updates**: Modify `/data/products.json` and rebuild to update products
6. **Content Updates**: Edit markdown files in `/content` for page content
7. **Markdown Support**: Full CommonMark + GitHub Flavored Markdown syntax supported

## Common Tasks

### Adding a New Product
1. Add product object to `/data/products.json` with `soldOut: false`
2. Add product images to `/public/images/products/`
3. Set up Stripe payment link and add URL to product data
4. Run `npm run build` to regenerate static pages

### Managing Sold Out Products
1. Set `"soldOut": true` in the product data to mark as sold out
2. Product will display "Esgotado" badge next to "Detalhes" button
3. Sold out products appear in "Cafés anteriores" section on products page
4. Section automatically hides when no products are sold out

### Adding a New Category
1. Add category to the categories array in `products.json`
2. Use the category ID in product objects
3. Products will automatically group by category on the products page

### Customizing Design
1. Update CSS variables in `/styles/globals.css`
2. Modify component styles using existing utility classes
3. Keep mobile-first approach in mind

## Important Notes

- This is a static site - changes require rebuilding
- No backend or database - all data comes from JSON files
- Stripe handles all payment processing externally
- Images should be optimized before adding to the project
- The site is configured for static export (`output: 'export'`)
- Markdown pages use async components due to Remark's async processing