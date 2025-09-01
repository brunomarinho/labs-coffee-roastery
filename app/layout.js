import '../styles/globals.css'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mamelucacafe.com.br'),
  title: 'Mameluca - Cafés Brasileiros de Torra Clara',
  description: 'Descubra nossa coleção curada de cafés brasileiros especiais com torra clara, destacando os sabores únicos de cada região.',
  keywords: 'café, torra clara, café brasileiro, café especial, cafés gourmet',
  openGraph: {
    title: 'Mameluca - Cafés Brasileiros de Torra Clara',
    description: 'Descubra nossa coleção curada de cafés brasileiros especiais',
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://mamelucacafe.com.br',
    siteName: 'Mameluca',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mameluca - Cafés Brasileiros de Torra Clara',
    description: 'Descubra nossa coleção curada de cafés brasileiros especiais',
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
