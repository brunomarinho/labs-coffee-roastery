'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import InventoryStatus from './InventoryStatus'


export default function ProductDetailClient({ product, categories, descriptionHtml }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isReleasingReservation, setIsReleasingReservation] = useState(false)
  
  // Check if returning from Stripe checkout and release reservation
  useEffect(() => {
    const checkAndReleaseReservation = async () => {
      // Check if we have a pending reservation in localStorage
      const pendingReservation = localStorage.getItem('pendingReservation')
      
      if (pendingReservation) {
        try {
          const reservation = JSON.parse(pendingReservation)
          
          // Only release if it's for this product and was created recently (within last hour)
          const createdAt = new Date(reservation.createdAt)
          const now = new Date()
          const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)
          
          if (reservation.productId === product.id && createdAt > hourAgo) {
            console.log('User returned from checkout, releasing reservation:', reservation.sessionId)
            setIsReleasingReservation(true)
            
            // Call API to release the reservation
            const response = await fetch('/api/checkout/release', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sessionId: reservation.sessionId,
                inventoryId: reservation.inventoryId
              }),
            })
            
            const data = await response.json()
            
            if (data.released) {
              console.log('Reservation released successfully')
              // Trigger a refresh of inventory status
              window.dispatchEvent(new Event('inventoryUpdated'))
            }
          }
        } catch (error) {
          console.error('Error releasing reservation:', error)
        } finally {
          // Clear the pending reservation
          localStorage.removeItem('pendingReservation')
          setIsReleasingReservation(false)
        }
      }
    }
    
    // Check when page loads (user might have used back button)
    checkAndReleaseReservation()
    
    // Also check when page becomes visible (user switches tabs back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndReleaseReservation()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [product.id])

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

      // Store reservation info in localStorage before redirecting
      if (data.sessionId && data.inventoryId) {
        localStorage.setItem('pendingReservation', JSON.stringify({
          sessionId: data.sessionId,
          inventoryId: data.inventoryId,
          productId: product.id,
          createdAt: new Date().toISOString()
        }))
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
        <Link href="/produtos">Cafés</Link>
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
            <h3 className="product-subtitle">{product.produtor} {product.variedade}</h3>
            
            <p className="product-notes">{product.notas}</p>
            <div className="product-detail-actions">
              <div className="tag">
                {product.quantity} | R$ {product.price}
              </div>
              
              <InventoryStatus inventoryId={product.inventoryId}>
                {({ loading, available, quantity, lowStock }) => {
                  // Show sold out if inventory unavailable (quantity is 0 or null)
                  const isOutOfStock = !loading && !available
                  
                  return (
                    <>
                      
                      {isOutOfStock ? (
                        <button 
                          className="btn btn-secondary btn-buy"
                          disabled
                          style={{ cursor: 'not-allowed', opacity: 1 }}
                        >
                          Esgotado
                        </button>
                      ) : (
                        <button 
                          onClick={handleCheckout}
                          className="btn btn-primary btn-buy"
                          disabled={isLoading || loading}
                        >
                          {isLoading ? 'Processando...' : loading ? 'Verificando...' : 'Comprar'}
                        </button>
                      )}
                     
                    </>
                  )
                }}
              </InventoryStatus>
              
              
            </div>
            
          </div>
          <p className='small'>Frete incluso</p>
        </section>
        <div 
          className="product-description markdown-content"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
        
        
        <h2>Detalhes</h2>
        <div className="custom-attributes-grid">
         
          {/* Define which attributes to display */}
          {['produtor', 'fazenda', 'regiao', 'variedade', 'processo', 'altitude'].map((key) => {
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