import fs from 'fs'
import path from 'path'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { parseMarkdown } from '../../utils/parseMarkdown'

export const metadata = {
  title: 'Política de Privacidade | Mameluca Café',
  description: 'Política de privacidade e proteção de dados da Mameluca Café',
}

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