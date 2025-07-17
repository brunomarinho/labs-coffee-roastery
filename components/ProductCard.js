import Link from 'next/link'
import Image from 'next/image'

export default function ProductCard({ product, categories }) {
  const categoryDisplay = categories?.find(cat => cat.id === product.category)?.displayName || product.category

  return (
    <Link href={`/produtos/${product.slug}`} className="product-card">
      <div className="product-card-bg">
        <Image
          src={product.images[0]}
          alt=""
          fill
          className="product-card-bg-image"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="product-info">
        <h2 className="product-name">{product.name}</h2>
        <h3>{product.produtor}</h3>
        <h3>{product.variedade} {product.processo}</h3>
        <p>{product.notas}</p>
        <div className="product-card-actions">
          <div className="tag">
            {product.quantity} | R$ {product.price}
          </div>
          <div className="btn btn-primary btn-details">Detalhes</div>
          {product.soldOut && <div className="sold-out-badge">Esgotado</div>}
        </div>
      </div>
    </Link>
  )
}