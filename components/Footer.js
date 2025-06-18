import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-links">
            <Link href="/about">About</Link>
            <Link href="/products">Products</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <p>&copy; {currentYear} My Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}