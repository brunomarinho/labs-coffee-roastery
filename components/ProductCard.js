import Link from 'next/link'
import Image from 'next/image'

export default function ProductCard({ product, categories }) {
  const categoryDisplay = categories?.find(cat => cat.id === product.category)?.displayName || product.category

  return (
    <Link href={`/produtos/${product.slug}`} className="product-card">
      <div className="product-card-image">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="product-image"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {product.soldOut && (
          <div className="sold-out-badge">Esgotado</div>
        )}
      </div>
      <h2 className="product-title">{product.name}</h2>
      <h3 className="product-subtitle">
        {product.produtor || 'Ivan Santana'} {product.variedade || 'Bourbon'}
      </h3>
      <p className="product-notes">
        {product.notas || 'Acidez Média, Doce de Laranja, Especiarias.'}
      </p>
      <div className="product-card-price">
        R$ {product.price.toFixed(2).replace('.', ',')}
      </div>
    </Link>
  )
}