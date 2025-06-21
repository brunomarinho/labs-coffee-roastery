import Link from 'next/link'

export default function Header() {
  const menuItems = [
    { href: '/produtos', label: 'Produtos' },
    { href: '/sobre', label: 'Sobre' }
  ]

  return (
    <header className="header">
      
        <div className="header-container">
          <Link href="/" className="logo">
            Mameluca
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