import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = {
  title: '404 - Página Não Encontrada',
  description: 'A página que você está procurando não existe.',
}

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container">
        <div className="error error-page">
          <h1 className="error-code">404</h1>
          <h2 className="error-heading">Página Não Encontrada</h2>
          <p className="error-message">
            Desculpe, a página que você está procurando não existe.
          </p>
          <Link href="/" className="btn btn-primary">
            Voltar ao Início
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}