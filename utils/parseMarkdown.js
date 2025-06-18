export function parseMarkdown(content) {
  let html = content
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // Bold
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
  
  // Paragraphs
  html = html.split('\n\n').map(paragraph => {
    if (paragraph.startsWith('<h') || paragraph.startsWith('<ul>')) {
      return paragraph
    }
    return paragraph.trim() ? `<p>${paragraph}</p>` : ''
  }).join('\n')
  
  // Lists
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)\n/gs, '$1')
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
  
  return html
}