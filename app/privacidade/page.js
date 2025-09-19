import fs from 'fs'
import path from 'path'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { parseMarkdown } from '../../utils/parseMarkdown'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'

export const metadata = generateSeoMetadata({
  title: 'Política de Privacidade',
  description: 'Política de privacidade e proteção de dados da Mameluca Café',
  url: '/privacidade'
})

export default async function PrivacidadePage() {
  const filePath = path.join(process.cwd(), 'content', 'privacidade.md')
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