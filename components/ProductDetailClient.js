'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function ProductDetailClient({ product }) {
  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <>
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link href="/products">Products</Link>
        <span className="breadcrumb-separator">/</span>
        <span>{product.name}</span>
      </div>

      <div className="product-detail">
        <div className="product-images">
          <div style={{ position: 'relative', width: '100%', height: '500px' }}>
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              className="main-image"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {product.images.length > 1 && (
            <div className="image-thumbnails">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  style={{ position: 'relative', width: '80px', height: '80px', cursor: 'pointer' }}
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
          <p className="product-category">{product.category}</p>
          <p className="product-description">{product.description}</p>
          <p className="product-price-large">${product.price}</p>
          
          {Object.entries(product).map(([key, value]) => {
            if (['id', 'slug', 'name', 'description', 'price', 'category', 'images', 'featured', 'stripePaymentLink'].includes(key)) {
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
          
          <a 
            href={product.stripePaymentLink}
            className="btn btn-primary"
            style={{ display: 'inline-block', marginTop: '2rem' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy Now
          </a>
        </div>
      </div>
    </>
  )
}