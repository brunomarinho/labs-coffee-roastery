# Next.js Ecommerce Template with Stripe Payment Links

A modern, fully static ecommerce template built with Next.js 14 App Router and Stripe payment links. Perfect for quickly launching an online store without backend complexity.

## Features

- 🛍️ **Product Catalog** - Organized by categories with detail pages
- 💳 **Stripe Payment Links** - Direct checkout without backend setup
- 📱 **Fully Responsive** - Mobile-first design with responsive breakpoints
- 🚀 **Static Site Generation** - Fast loading with SEO optimization
- 🎨 **Tokenized CSS System** - Consistent design with CSS variables
- 📝 **Markdown Content** - Easy content management with full CommonMark support via Remark
- 🔍 **SEO Ready** - Dynamic meta tags, sitemap, and Open Graph support
- 🚫 **Sold Out Management** - Support for sold out products with disabled checkout

## Project Structure

```
/app
  /about/page.js          # About page (renders markdown)
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
  Header.js              # Navigation header with mobile menu
  Footer.js              # Site footer
  ProductCard.js         # Product card component
  Hero.js                # Homepage hero section
  SelectedProducts.js    # Featured products display
  AboutSnippet.js        # Homepage about section
  ProductDetailClient.js # Client component for product details
/content
  about.md               # About page content
  faq.md                 # FAQ page content
  contact.md             # Contact page content
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

3. Run the development server:
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
      "stripePaymentLink": "https://buy.stripe.com/...",
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

### 3. Update Stripe Payment Links

Replace the sample Stripe payment links with your actual payment links from your Stripe dashboard.

### 4. Managing Sold Out Products

To mark a product as sold out:
- Set `"soldOut": true` in the product data
- The product will show "Esgotado" badge and disabled checkout button
- On the products page, sold out items appear in a separate "Cafés anteriores" section
- The "Cafés anteriores" section is automatically hidden when no products are sold out

### 5. Customize Content

- Edit markdown files in `/content/` for About, FAQ, and Contact pages
- Markdown supports full CommonMark specification plus GitHub Flavored Markdown
- Update store name and metadata in `/app/layout.js`
- Modify hero text in `/components/Hero.js`
- Customize colors and styling in `/styles/globals.css`

### 6. Update Site URLs

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

# Static Export
npm run build        # Generates static files in 'out' directory
```

## Deployment

This template is configured for static export. After building, you can deploy the `out` directory to any static hosting service:

### Vercel
```bash
vercel --prod
```

### Netlify
1. Build command: `npm run build`
2. Publish directory: `out`

### GitHub Pages
1. Build the project: `npm run build`
2. Deploy the `out` directory

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