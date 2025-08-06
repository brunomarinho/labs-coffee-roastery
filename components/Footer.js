import Link from 'next/link'
import Logo from './Logo'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  const menuItems = [
    { href: '/produtos', label: 'Produtos' },
    { href: '/blog', label: 'Blog' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/contato', label: 'Contato' }
  ]
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-links">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="footer-logo">
            <Logo />
          </div>
          <div className="footer-bottom">
            <p>&copy; {currentYear} Mameluca. Todos os direitos reservados.</p>
            <div className="footer-legal">
              <Link href="/termos">Termos de Uso</Link>
              <span className="separator">•</span>
              <Link href="/privacidade">Política de Privacidade</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}