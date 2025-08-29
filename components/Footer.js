import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  const menuItems = [
    { href: '/produtos', label: 'Produtos' },
    { href: '/blog', label: 'Blog' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/contato', label: 'Contato' }
  ]
  
  return (
    <>
      <hr className="section-divider-full" />
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
          
          <div className="footer-bottom">
            <div>&copy; {currentYear} Mameluca. Todos os direitos reservados.</div>
            <div className="footer-legal">
              <Link href="/termos">Termos de Uso</Link>
              <span className="separator">•</span>
              <Link href="/privacidade">Política de Privacidade</Link>
            </div>
          </div>
          <div className="footer-logo">
            <Image 
              src="/images/symbol.png"
              alt="Mameluca Logo"
              width={64}
              height={88}
            />
          </div>
        </div>
      </div>
    </footer>
    </>
  )
}