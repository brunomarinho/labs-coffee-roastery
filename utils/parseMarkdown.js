import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import { processExternalLinks } from './processMarkdownLinks'

export async function parseMarkdown(content) {
  const result = await remark()
    .use(remarkGfm)
    .use(html)
    .process(content)
  
  // Automatically add target="_blank" to external links
  return processExternalLinks(result.toString())
}