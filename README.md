# Next.js Ecommerce Template with Stripe Checkout

A modern ecommerce template built with Next.js 14 App Router and Stripe's server-side checkout with custom fields for Brazilian business requirements. Perfect for quickly launching an online store with enhanced payment processing.

## Features

- 🛍️ **Product Catalog** - Organized by categories with detail pages
- 💳 **Stripe Server-Side Checkout** - Custom checkout with required CPF and cellphone fields for Brazilian businesses
- 📱 **Fully Responsive** - Mobile-first design with responsive breakpoints
- 🚀 **Hybrid Rendering** - Static site generation with dynamic API routes for checkout processing
- 🎨 **Tokenized CSS System** - Consistent design with CSS variables
- 📝 **Markdown Content** - Easy content management with full CommonMark support via Remark
- 🔍 **SEO Ready** - Dynamic meta tags, sitemap, and Open Graph support
- 🚫 **Sold Out Management** - Support for sold out products with disabled checkout
- 🎯 **Modern UI Design** - Clean interface with sharp corners and minimalist aesthetics
- 🖼️ **Background Image Effects** - Product cards with subtle background images using opacity and blend modes
- 📰 **Blog System** - Markdown-based blog with static generation and SEO optimization

## Project Structure

```
/app
  /api
    /checkout/route.js     # Server-side Stripe checkout API
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
/content
  about.md               # About page content
  faq.md                 # FAQ page content
  contact.md             # Contact page content
  /blog/                 # Blog posts directory
    post-slug.md         # Individual blog posts
/data
  products.json          # Product data and categories
/public
  /images
    /products           # Product images directory
/styles
  globals.css           # Global styles with CSS tokens
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Stripe account with test/live API keys

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

4. Add your Stripe keys to `.env.local`:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your site.

## Configuration

### 1. Update Product Data

Edit `/data/products.json` to add your products:

```json
{
  "products": [
    {
      "id": "unique-id",
      "slug": "url-friendly-name",
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "category": "category-name",
      "images": [
        "/images/products/product1-1.jpg",
        "/images/products/product1-2.jpg"
      ],
      "featured": true,
      "soldOut": false,
      "stripePriceId": "price_1ABC123DEF456",
      "customField1": "value",
      "customField2": "value"
    }
  ],
  "categories": [
    {
      "id": "category-name",
      "displayName": "Category Display Name"
    }
  ]
}
```

### 2. Add Product Images

Place your product images in `/public/images/products/`. Use the filenames referenced in your products.json.

### 3. Set Up Stripe Products

1. **Create products in Stripe Dashboard:**
   - Go to your [Stripe Dashboard](https://dashboard.stripe.com/products)
   - Create a new product with name and price
   - Copy the price ID (starts with `price_`)
   
2. **Update products.json:**
   - Replace placeholder price IDs with your actual Stripe price IDs
   - Example: `"stripePriceId": "price_1ABC123DEF456"`

3. **Test with Stripe Test Mode:**
   - Use test API keys during development
   - Test card number: 4242 4242 4242 4242
   - Any future expiry date and any 3-digit CVV
   - Custom fields (CPF and cellphone) will appear in checkout form
   - Test data will appear in your Stripe dashboard after successful payment

### 4. Managing Sold Out Products

To mark a product as sold out:
- Set `"soldOut": true` in the product data
- The product will show "Esgotado" badge next to the "Detalhes" button
- On the products page, sold out items appear in a separate "Cafés anteriores" section
- The "Cafés anteriores" section is automatically hidden when no products are sold out

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

### 8. Update Site URLs

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