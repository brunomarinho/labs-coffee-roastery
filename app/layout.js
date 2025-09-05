import '../styles/globals.css'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mamelucacafe.com.br'),
  title: 'Mameluca - Cafés Brasileiros com Torra Clara',
  description: 'Nano-torrefação experimental de cafés brasileiros com foco em torra clara.',
  keywords: 'café, torra clara, café brasileiro, café especial, nano-torrefação, mameluca, cafés de origem,',
  openGraph: {
    title: 'Mameluca - Cafés Brasileiros com Torra Clara',
    description: 'DNano-torrefação experimental de cafés brasileiros com foco em torra clara.',
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://mamelucacafe.com.br',
    siteName: 'Mameluca',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mameluca - Cafés Brasileiros com Torra Clara',
    description: 'Nano-torrefação experimental de cafés brasileiros com foco em torra clara.',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://mamelucacafe.com.br',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/jtt4bay.css"></link>
      </head>
      <body>{children}</body>
    </html>
  )
}
