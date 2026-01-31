import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import '../css/ProductDetailsModal.css'

export function ProductDetailsModal({ isOpen, product, onClose }) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [isAdding, setIsAdding] = useState(false)

  if (!isOpen || !product) return null

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login')
      onClose()
      return
    }

    if (isAdding) return

    setIsAdding(true)
    addToCart(product)

    setTimeout(() => {
      setIsAdding(false)
      onClose()
    }, 800)
  }

  return (
    <>
      {/* Blur Overlay */}
      <div className="product-details-blur" onClick={onClose} />

      {/* Modal */}
      <div className="product-details-modal">
        <button className="modal-close-btn" onClick={onClose} title="Close">
          ✕
        </button>

        <div className="product-details-container">
          {/* Left Side - Image */}
          <div className="product-details-image-section">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-details-image"
              />
            )}
          </div>

          {/* Right Side - Details */}
          <div className="product-details-info">
            <h2 className="product-details-name">{product.name}</h2>

            {product.description && (
              <p className="product-details-description">{product.description}</p>
            )}

            <div className="product-details-price-section">
              <p className="product-details-price">₱{product.price.toFixed(2)}</p>
              {product.stock !== undefined && (
                <p className="product-details-stock">
                  {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                </p>
              )}
            </div>

            <div className="product-details-actions">
              {product.stock > 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="btn-add-to-cart-modal"
                  disabled={isAdding}
                >
                  {isAdding ? 'Adding to Cart...' : 'Add to Cart'}
                </button>
              ) : (
                <button className="btn-add-to-cart-modal btn-disabled" disabled>
                  Out of Stock
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
