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
        <div className="error error-page">
          <h1 className="error-code">404</h1>
          <h2 className="error-heading">Page Not Found</h2>
          <p className="error-message">
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