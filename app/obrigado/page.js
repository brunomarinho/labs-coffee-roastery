import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Link from 'next/link'
import ClearReservation from '../../components/ClearReservation'

export const metadata = {
  title: 'Obrigado pela sua compra - Mameluca',
  description: 'Agradecemos pela sua compra. Você receberá um email de confirmação em breve.',
}

export default function Obrigado() {
  return (
    <>
      <ClearReservation />
      <Header />
      <main className="container">
        <div className="thank-you-content">
          <h1>Obrigado pela sua compra!</h1>
          <p>
            Seu pedido foi recebido com sucesso. Você receberá um email de confirmação 
            com os detalhes da sua compra em breve. Avisaremos por email quando seu pedido for enviado.
          </p>
          <p>
            Se tiver alguma dúvida, entre em <Link href="/contato">contato</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}