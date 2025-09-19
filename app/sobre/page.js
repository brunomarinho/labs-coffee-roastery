import fs from 'fs'
import path from 'path'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { parseMarkdown } from '../../utils/parseMarkdown'
import { generateMetadata as generateSeoMetadata, getPageSeo } from '@/lib/seo'

const pageSeo = getPageSeo('about')
export const metadata = generateSeoMetadata({
  title: pageSeo.title,
  description: pageSeo.description,
  keywords: pageSeo.keywords,
  url: '/sobre'
})

export default async function About() {
  const filePath = path.join(process.cwd(), 'content', 'sobre.md')
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