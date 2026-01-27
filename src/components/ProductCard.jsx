import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/firebase'
import { doc, deleteDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import '../css/ProductCard.css'

export function ProductCard({ product, onViewDetails, onProductUpdated, onEditProduct }) {
  const { user, userRole } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = (e) => {
    if (!user) {
      navigate('/login')
      return
    }

    if (isAdding) return // Prevent multiple clicks

    const button = e.currentTarget
    const productImage = button.closest('.product-card').querySelector('.product-image')
    
    if (productImage) {
      // Get the position of the product image
      const imageRect = productImage.getBoundingClientRect()
      
      // Get the position of the cart icon (estimate from header)
      const cartIcon = document.querySelector('.cart-icon-btn')
      let cartRect = null
      if (cartIcon) {
        cartRect = cartIcon.getBoundingClientRect()
      } else {
        // Fallback position if cart icon not found
        cartRect = { top: 20, right: 20, width: 40, height: 40 }
      }

    }

    setIsAdding(true)
    addToCart(product)

    // Re-enable button after animation
    setTimeout(() => {
      setIsAdding(false)
    }, 800)
  }

  const handleDeleteProduct = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      setDeleting(true)
      await deleteDoc(doc(db, 'products', product.id))
      if (onProductUpdated) {
        onProductUpdated()
      }
    } catch (err) {
      console.error('Error deleting product:', err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="product-card">
      {product.imageUrl && (
        <img src={product.imageUrl} alt={product.name} className="product-image" />
      )}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₱{product.price.toFixed(2)}</p>
        {product.stock !== undefined && (
          <p className="product-stock">
            {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
          </p>
        )}
        {/* {product.description && (
          <p className="product-description">{product.description}</p>
        )} */}
        <div className="product-actions">
          {userRole !== 'admin' && (
            <>
              {product.stock > 0 ? (
                <button 
                  onClick={handleAddToCart} 
                  className="btn-add-to-cart"
                  disabled={isAdding}
                >
                  {isAdding ? 'Adding...' : 'Add to cart'}
                </button>
              ) : (
                <button className="btn-add-to-cart btn-disabled" disabled>
                  Out of Stock
                </button>
              )}
            </>
          )}
          {onViewDetails && !userRole && (
            <button onClick={() => onViewDetails(product.id)} className="btn btn-secondary">
              View Details
            </button>
          )}
        </div>

        {userRole === 'admin' && (
          <div className="admin-actions">
            <button
              className="btn btn-info"
              onClick={() => onEditProduct && onEditProduct(product)}
              title="Edit product"
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDeleteProduct}
              disabled={deleting}
              title="Delete product"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
        </div>
      </div>

  )
}
