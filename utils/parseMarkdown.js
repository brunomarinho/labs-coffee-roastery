import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'

export async function parseMarkdown(content) {
  const result = await remark()
    .use(remarkGfm)
    .use(html)
    .process(content)
  
  return result.toString()
}