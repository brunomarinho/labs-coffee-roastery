import Link from 'next/link'

export default function AboutSnippet() {
  return (
    <section className="container mt-lg mb-lg">
      <div className="text-center">
        <h2>Sobre Nossa Loja</h2>
        <p className="mb-lg content-centered">
          Somos apaixonados por trazer a você a melhor seleção de produtos. 
          Cada item em nossa coleção é cuidadosamente escolhido por sua qualidade, design 
          e valor. De roupas confortáveis a acessórios únicos, temos 
          algo especial para todos.
        </p>
        <Link href="/sobre" className="btn btn-primary">
          Saiba Mais
        </Link>
      </div>
    </section>
  )
}