import fs from 'fs'
import path from 'path'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { parseMarkdown } from '../../utils/parseMarkdown'
import { generateMetadata as generateSeoMetadata, getPageSeo } from '@/lib/seo'

const pageSeo = getPageSeo('contact')
export const metadata = generateSeoMetadata({
  title: pageSeo.title,
  description: pageSeo.description,
  keywords: pageSeo.keywords,
  url: '/contato'
})

export default async function Contact() {
  const filePath = path.join(process.cwd(), 'content', 'contato.md')
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