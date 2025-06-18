import '../styles/globals.css'

export const metadata = {
  title: 'My Store - Quality Products for Everyone',
  description: 'Discover our curated collection of high-quality products including apparel, accessories, and prints.',
  keywords: 'ecommerce, store, shop, apparel, accessories, prints',
  openGraph: {
    title: 'My Store - Quality Products for Everyone',
    description: 'Discover our curated collection of high-quality products',
    type: 'website',
    locale: 'en_US',
    url: 'https://mystore.com',
    siteName: 'My Store',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
