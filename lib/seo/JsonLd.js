import Script from 'next/script'

/**
 * Component to render JSON-LD structured data
 */
export default function JsonLd({ data, id = 'structured-data' }) {
  if (!data) return null

  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2)
      }}
    />
  )
}