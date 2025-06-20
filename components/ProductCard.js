import Link from 'next/link'
import Image from 'next/image'

export default function ProductCard({ product }) {
  return (
    <Link href={`/produtos/${product.slug}`} className="product-card">
      <div className="product-image-container">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="product-image img-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">R$ {product.price}</p>
      </div>
    </Link>
  )
}