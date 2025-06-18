import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container">
        <div className="error" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
          <h2 style={{ marginBottom: '2rem' }}>Page Not Found</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--color-gray-dark)' }}>
            Sorry, the page you are looking for doesn&apos;t exist.
          </p>
          <Link href="/" className="btn btn-primary">
            Go Back Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}