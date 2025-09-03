/**
 * Process HTML content to add target="_blank" and rel="noopener noreferrer" 
 * to external links in markdown-generated HTML
 */
export function processExternalLinks(html) {
  // Regex to find all anchor tags
  return html.replace(
    /<a\s+href=["']([^"']+)["']([^>]*)>/gi,
    (match, href, rest) => {
      // Check if it's an external link
      const isExternal = 
        href.startsWith('http://') || 
        href.startsWith('https://') || 
        href.startsWith('//') ||
        href.startsWith('www.');
      
      if (isExternal && !rest.includes('target=')) {
        // Add target and rel attributes for external links
        return `<a href="${href}" target="_blank" rel="noopener noreferrer"${rest}>`;
      }
      
      return match;
    }
  );
}