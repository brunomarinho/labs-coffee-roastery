import ExternalLink from './ExternalLink'

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
        <ExternalLink href="https://docs.google.com/forms/d/e/1FAIpQLSdljjitU0gtP1kCssu-lP9VrLLogjLOnFhCxOLgpjT0WZslPg/viewform?usp=header" className="btn btn-primary">
          CADASTRE-SE
        </ExternalLink>
      </section>
    </>
  )
}