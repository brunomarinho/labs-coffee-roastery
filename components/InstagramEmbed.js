'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

/**
 * Client component that loads Instagram's embed.js script
 * and processes any .instagram-media blockquotes on the page
 *
 * Note: The server-side URL processing utility is in utils/processInstagramEmbeds.js
 * They're separate because this component requires 'use client' while the utility runs on the server
 */
export default function InstagramEmbed() {
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    const processEmbeds = () => {
      const embeds = document.querySelectorAll('.instagram-media')
      if (window.instgrm && embeds.length > 0) {
        window.instgrm.Embeds.process()
      }
    }

    // Try multiple times with increasing delays to ensure DOM is ready
    const timers = [100, 500, 1000].map(delay =>
      setTimeout(processEmbeds, delay)
    )

    return () => timers.forEach(clearTimeout)
  }, [scriptLoaded])

  return (
    <Script
      src="https://www.instagram.com/embed.js"
      strategy="afterInteractive"
      onLoad={() => setScriptLoaded(true)}
    />
  )
}
