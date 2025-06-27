import fs from 'fs'
import path from 'path'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { parseMarkdown } from '../../utils/parseMarkdown'

export const metadata = {
  title: 'Sobre Nós - Mameluca',
  description: 'Conheça nossa história e missão.',
}

export default async function About() {
  const filePath = path.join(process.cwd(), 'content', 'sobre.md')
  const content = fs.readFileSync(filePath, 'utf8')
  const htmlContent = await parseMarkdown(content)

  return (
    <>
      <Header />
      
      <main className="container">
        <h1>Sobre</h1>
        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </main>
      <Footer />
    </>
  )
}