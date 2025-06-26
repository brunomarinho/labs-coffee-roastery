import Link from 'next/link'

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <h1>Cafés brasileiros com torra clara.</h1>
        <p><a href='/sobre'>Entenda</a> nosso estilo.</p>
      </div>
    </section>
  )
}