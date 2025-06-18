import fs from 'fs'
import path from 'path'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { parseMarkdown } from '../../utils/parseMarkdown'

export const metadata = {
  title: 'Contact Us - My Store',
  description: 'Get in touch with us. We\'d love to hear from you!',
}

export default function Contact() {
  const filePath = path.join(process.cwd(), 'content', 'contact.md')
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