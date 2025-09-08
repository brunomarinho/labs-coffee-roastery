import { parseMarkdown } from '@/utils/parseMarkdown'

export default async function MarkdownDescription({ content, className = '' }) {
  const htmlContent = await parseMarkdown(content)
  
  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}