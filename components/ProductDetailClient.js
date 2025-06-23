'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function ProductDetailClient({ product, categories }) {
  const [selectedImage, setSelectedImage] = useState(0)
  
  const categoryDisplay = categories?.find(cat => cat.id === product.category)?.displayName || product.category

  return (
    <>
      <div className="breadcrumb">
        <Link href="/">Início</Link>
        <span className="breadcrumb-separator">/</span>
        <Link href="/produtos">Produtos</Link>
        <span className="breadcrumb-separator">/</span>
        <span>{product.name}</span>
      </div>

      <div className="product-detail">
        <div className="product-images">
          <div className="image-container">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="main-image img-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {product.images.length > 1 && (
            <div className="image-thumbnails">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className="thumbnail-container"
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-details">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-category">{categoryDisplay}</p>
          <p className="product-description">{product.description}</p>
          <p className="product-price-large">R$ {product.price}</p>
          
          {Object.entries(product).map(([key, value]) => {
            if (['id', 'slug', 'name', 'description', 'price', 'category', 'images', 'featured', 'stripePaymentLink', 'soldOut'].includes(key)) {
              return null
            }
            return (
              <p key={key} className="mb-sm">
                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {
                  Array.isArray(value) ? value.join(', ') : value
                }
              </p>
            )
          })}
          
          {product.soldOut ? (
            <button 
              className="btn btn-secondary btn-buy"
              disabled
              style={{ cursor: 'not-allowed', opacity: 0.6 }}
            >
              Esgotado
            </button>
          ) : (
            <a 
              href={product.stripePaymentLink}
              className="btn btn-primary btn-buy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Comprar Agora
            </a>
          )}
        </div>
      </div>
    </>
  )
}