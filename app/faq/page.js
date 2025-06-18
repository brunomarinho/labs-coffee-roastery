import fs from 'fs'
import path from 'path'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { parseMarkdown } from '../../utils/parseMarkdown'

export const metadata = {
  title: 'FAQ - My Store',
  description: 'Frequently asked questions about our products and services.',
}

export default function FAQ() {
  const filePath = path.join(process.cwd(), 'content', 'faq.md')
  const content = fs.readFileSync(filePath, 'utf8')
  const htmlContent = parseMarkdown(content)

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