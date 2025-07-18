import Link from 'next/link'
import Logo from './Logo'

export default function Header() {
  const menuItems = [
    { href: '/produtos', label: 'Produtos' },
    { href: '/blog', label: 'Blog' },
  ]

  return (
    <header className="header">
      
        <div className="header-container">
          <Link href="/" className="logo">
            Mameluca
          </Link>
          
          <Link className='logo-symbol' href="/">
            <Logo />
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