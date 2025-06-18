import fs from 'fs'
import path from 'path'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { parseMarkdown } from '../../utils/parseMarkdown'

export const metadata = {
  title: 'About Us - My Store',
  description: 'Learn more about our story and mission.',
}

export default function About() {
  const filePath = path.join(process.cwd(), 'content', 'about.md')
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