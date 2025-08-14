'use client'

import Image from 'next/image'
import { useState } from 'react'


export default function ProductDetailClient({ product, categories }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    // Prevent double-clicks
    if (isLoading) {
      return
    }

    setIsLoading(true)

    try {
      // Call our API to create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento. Tente novamente.')
      }

      // Redirect to Stripe checkout
      window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
      alert(err.message || 'Erro ao processar pagamento. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/*
      <div className="breadcrumb">
        <Link href="/">Início</Link>
        <span className="breadcrumb-separator">/</span>
        <Link href="/produtos">Produtos</Link>
        <span className="breadcrumb-separator">/</span>
        <span>{product.name}</span>
      </div>
      */}
        <div className="product-detail-hero-image">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="detail-image"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
        </div>
        <section className="product-detail-card">
          <div className="product-detail-info">
            <h2 className="product-title">{product.name}</h2>
            <h3 className="product-subtitle">{product.produtor}</h3>
            <h3 className="product-subtitle">{product.variedade}</h3>
            <p className="product-notes">{product.notas}</p>
            <div className="product-detail-actions">
              <div className="tag">
                {product.quantity} | R$ {product.price}
              </div>
              {product.soldOut ? (
                <button 
                  className="btn btn-secondary btn-buy"
                  disabled
                  style={{ cursor: 'not-allowed', opacity: 0.6 }}
                >
                  Esgotado
                </button>
            ) : (
              <button 
                onClick={handleCheckout}
                className="btn btn-primary btn-buy"
                disabled={isLoading}
              >
                {isLoading ? 'Processando...' : 'Comprar'}
              </button>
            )}
              
            </div>
          </div>
        </section>
        <p className="product-description">{product.description}</p>
        
        
        <h2>Detalhes</h2>
        <div className="custom-attributes-grid">
         
          {/* Define which attributes to display */}
          {['produtor', 'fazenda', 'regiao', 'variedade', 'processo', 'torra'].map((key) => {
            // Only render if the product has this attribute
            if (!product[key]) return null
            
            return (
              <p key={key} className="custom-attribute">
                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong> <br /> {
                  Array.isArray(product[key]) ? product[key].join(', ') : product[key]
                }
              </p>
            )
          })}
        </div>

        <h2>Recomendações</h2>
        <div className="custom-attributes-grid">
         
          {/* Define which attributes to display */}
          {['descanso', 'filtrados', 'espresso'].map((key) => {
            // Only render if the product has this attribute
            if (!product[key]) return null
            
            return (
              <p key={key} className="custom-attribute">
                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong> <br /> {
                  Array.isArray(product[key]) ? product[key].join(', ') : product[key]
                }
              </p>
            )
          })}
        </div>
        
        {/*
        <div className="product-details">
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
        </div>
      </div>
      */}
    </>
  )
}