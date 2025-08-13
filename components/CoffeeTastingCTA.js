import Link from 'next/link'

export default function CoffeeTastingCTA() {
  return (
    <>
      <hr className="section-divider-full" />
      <section className="coffee-tasting-cta">
        <h2>Quer provar nosso café?</h2>
        <p>
          Todo mês, selecionamos uma pessoa da lista para receber um café torrado pela 
          Mameluca. Cada e-mail tem uma chance, e quem já foi selecionado sai da 
          próxima rodada — assim mais gente tem oportunidade de experimentar.
        </p>
        <Link href="/contato" className="btn btn-primary">
          CADASTRE-SE
        </Link>
      </section>
    </>
  )
}