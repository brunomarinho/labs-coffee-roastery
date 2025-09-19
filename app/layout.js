import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/react'
import { generateMetadata as generateSeoMetadata, JsonLd, generateOrganizationSchema, generateWebsiteSchema, combineSchemas } from '@/lib/seo'

export const metadata = generateSeoMetadata({
  title: null, // Use default title for home
  url: '/',
})

export default function RootLayout({ children }) {
  // Combine organization and website schemas for site-wide structured data
  const structuredData = combineSchemas([
    generateOrganizationSchema(),
    generateWebsiteSchema(),
  ])

  return (
    <html lang="pt">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/jtt4bay.css"></link>
        <JsonLd data={structuredData} id="site-structured-data" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
