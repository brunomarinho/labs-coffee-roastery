/**
 * Converts standalone Instagram URLs in HTML to embed blockquotes
 * Used server-side during markdown processing
 *
 * Usage in markdown: Just paste the Instagram URL on its own line
 * Example: https://www.instagram.com/p/DR16mpKjNSU/
 */
export function processInstagramEmbeds(html) {
  // Match Instagram URLs that are alone in a paragraph tag
  // Supports: instagram.com/p/XXX, instagram.com/reel/XXX, instagram.com/tv/XXX
  const instagramUrlRegex = /<p>\s*<a[^>]*href="(https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)\/?[^"]*)"[^>]*>[^<]*<\/a>\s*<\/p>/gi

  return html.replace(instagramUrlRegex, (match, url, www, type, postId) => {
    const cleanUrl = `https://www.instagram.com/${type}/${postId}/`

    return `<blockquote class="instagram-media" data-instgrm-permalink="${cleanUrl}" style="max-width:400px;">
  <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">Ver no Instagram</a>
</blockquote>`
  })
}
