import Link from 'next/link'
import Image from 'next/image'

export default function ProductCard({ product, categories, index = 0 }) {
  const categoryDisplay = categories?.find(cat => cat.id === product.category)?.displayName || product.category

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="product-card animate-fade-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
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
      <h3 className="product-subtitle">
        {product.subtitle || (
          <>{product.produtor}{product.produtor && product.variedade && <br />}{product.variedade}</>
        )}
      </h3>
      {product.notas && (
        <p className="product-notes">{product.notas}</p>
      )}
      <div className="product-card-price">
        R$ {product.price.toFixed(2).replace('.', ',')}
      </div>
    </Link>
  )
}