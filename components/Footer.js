import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-links">
            <Link href="/sobre">Sobre</Link>
            <Link href="/produtos">Produtos</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contato">Contato</Link>
          </div>
          <p>&copy; {currentYear} Mameluca. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}