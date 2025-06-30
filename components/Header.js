import Link from 'next/link'

export default function Header() {
  const menuItems = [
    { href: '/produtos', label: 'Produtos' },
    { href: '/blog', label: 'Blog' },
    { href: '/sobre', label: 'Sobre' }
  ]

  return (
    <header className="header">
      
        <div className="header-container">
          <Link href="/" className="logo">
            Mameluca
          </Link>
          
          <Link href="/" className="logo-center">
            <svg width="35" height="26" viewBox="0 0 35 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="17" cy="13" r="12" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="5.5" cy="9.5" r="4.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="29.5" cy="9.5" r="4.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="17" cy="17" r="3" fill="black"/>
            </svg>

          </Link>
          
          <nav className="nav">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      
    </header>
  )
}