'use client'

import Image from 'next/image'


export default function ProductDetailClient({ product, categories }) {

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
        <div className="image-container">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="main-image img-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
        </div>
        <section className="product-card">
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
                Comprar
              </a>
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