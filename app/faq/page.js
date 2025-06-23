import fs from 'fs'
import path from 'path'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { parseMarkdown } from '../../utils/parseMarkdown'

export const metadata = {
  title: 'FAQ - Mameluca',
  description: 'Perguntas frequentes sobre nossos produtos e serviços.',
}

export default async function FAQ() {
  const filePath = path.join(process.cwd(), 'content', 'faq.md')
  const content = fs.readFileSync(filePath, 'utf8')
  const htmlContent = await parseMarkdown(content)

  return (
    <>
      <Header />
      <main className="container">
        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </main>
      <Footer />
    </>
  )
}