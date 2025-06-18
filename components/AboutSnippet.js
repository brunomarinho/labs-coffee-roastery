import Link from 'next/link'

export default function AboutSnippet() {
  return (
    <section className="container mt-lg mb-lg">
      <div className="text-center">
        <h2>About Our Store</h2>
        <p className="mb-lg" style={{ maxWidth: '800px', margin: '0 auto' }}>
          We&apos;re passionate about bringing you the finest selection of products. 
          Each item in our collection is carefully chosen for its quality, design, 
          and value. From comfortable apparel to unique accessories, we have 
          something special for everyone.
        </p>
        <Link href="/about" className="btn btn-primary">
          Learn More
        </Link>
      </div>
    </section>
  )
}