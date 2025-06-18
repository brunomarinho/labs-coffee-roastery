import Link from 'next/link'

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <h1>Welcome to My Store</h1>
        <p>Discover our curated collection of high-quality products</p>
        <Link href="/products" className="btn btn-secondary">
          Shop Now
        </Link>
      </div>
    </section>
  )
}