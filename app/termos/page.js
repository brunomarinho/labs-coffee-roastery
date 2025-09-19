import fs from 'fs'
import path from 'path'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { parseMarkdown } from '../../utils/parseMarkdown'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'

export const metadata = generateSeoMetadata({
  title: 'Termos de Uso',
  description: 'Termos de uso e condições gerais da Mameluca Café',
  url: '/termos'
})

export default async function TermosPage() {
  const filePath = path.join(process.cwd(), 'content', 'termos.md')
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