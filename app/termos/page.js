import fs from 'fs'
import path from 'path'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { parseMarkdown } from '../../utils/parseMarkdown'

export const metadata = {
  title: 'Termos de Uso | Mameluca Café',
  description: 'Termos de uso e condições gerais da Mameluca Café',
}

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