import Link from 'next/link'
import Image from 'next/image'

export default function ProductCard({ product, categories }) {
  const categoryDisplay = categories?.find(cat => cat.id === product.category)?.displayName || product.category

  return (
    <Link href={`/produtos/${product.slug}`} className="product-card">
      {/*
      <div className="product-image-container">
         
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="product-image img-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
      </div>
      */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <h3>{product.produtor}</h3>
        <h3>{product.variedade}</h3>
        <p>{product.notes}</p>
        {product.soldOut && <p className="sold-out-badge">Esgotado</p>}
      </div>
    </Link>
  )
}