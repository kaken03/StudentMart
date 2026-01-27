import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import '../css/CheckoutPage.css'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, getTotalPrice, clearCart } = useCart()
  const { user, userRole } = useAuth()
  const [loading, setLoading] = useState(false)

  // Silently redirect admin users away from checkout page
  useEffect(() => {
    if (user && userRole === 'admin') {
      navigate('/', { replace: true })
    }
  }, [user, userRole, navigate])
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    address: 'Campus Pickup',
    pickupLocation: 'main-campus',
    notes: '',
  })

  if (!user) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="empty-state">
            <p>Please log in to proceed with checkout</p>
            <button onClick={() => navigate('/login')} className="login-btn">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="empty-state">
            <p>Your cart is empty. Add items to checkout</p>
            <button onClick={() => navigate('/')} className="continue-shopping-btn">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="order-confirmation">
            <div className="confirmation-icon">✓</div>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for your order</p>
            <div className="order-id-box">
              <p className="order-id-label">Order ID:</p>
              <p className="order-id-text">{orderId}</p>
            </div>
            {/* <div className="order-details">
              <p><strong>Payment Method:</strong> Cash on Pickup</p>
              <p><strong>Total Amount:</strong> ₱{getTotalPrice().toFixed(2)}</p>
              <p><strong>Status:</strong> Pending</p>
            </div> */}
            <div className="confirmation-message">
              <p>Your order has been placed and is being prepared. Please prepare the exact cash amount for pickup.</p>
            </div>
            <button onClick={() => navigate('/')} className="back-home-btn">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (cart.length === 0) {
      setError('Cart is empty')
      return
    }

    setLoading(true)

    try {
      // Prepare order items
      const orderItems = cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.imageUrl || item.image,
      }))

      // Create order document in Firestore
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        deliveryAddress: formData.address,
        pickupLocation: formData.pickupLocation,
        notes: formData.notes,
        items: orderItems,
        totalAmount: getTotalPrice(),
        paymentMethod: 'cash-on-pickup',
        status: 'pending',
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'orders'), orderData)

      // Clear cart
      clearCart()

      // Show confirmation
      setOrderId(docRef.id)
      setOrderPlaced(true)
    } catch (err) {
      console.error('Error placing order:', err)
      setError('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const totalPrice = getTotalPrice()

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-wrapper">
          {/* Checkout Form */}
          <div className="checkout-form-section">
            <h1>Checkout</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handlePlaceOrder}>
              {/* Payment Method */}
              <fieldset className="form-section">
                <h4>Payment Method</h4>
                <div className="payment-method">
                  <div className="payment-option selected">
                    <input type="radio" name="payment" value="cash" checked readOnly />
                    <div className="payment-info">
                      <p className="payment-name">💵 Cash on Pickup</p>
                      <p className="payment-description">Pay the exact amount when you pick up your order</p>
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate('/cart')}
                  disabled={loading}
                >
                  Back to Cart
                </button>
                <button type="submit" className="place-order-btn" disabled={loading}>
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <h2>Order Summary</h2>

            <div className="summary-items">
              {cart.map((item) => (
                <div key={item.id} className="summary-item">
                  <div className="item-image">
                    <img src={item.imageUrl || item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">Qty: {item.quantity}</p>
                  </div>
                  <p className="item-subtotal">₱{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              {/* <div className="total-row">
                <span>Subtotal:</span>
                <span>₱{totalPrice.toFixed(2)}</span>
              </div> */}
              {/* <div className="total-row">
                <span>Shipping:</span>
                <span>₱0.00</span>
              </div>
              <div className="total-row">
                <span>Tax:</span>
                <span>₱0.00</span>
              </div> */}
              <div className="total-row final">
                <span>Total:</span>
                <span>₱{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* <div className="payment-method-summary">
              <p className="summary-label">Payment Method</p>
              <p className="summary-value">💵 Cash on Pickup</p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}
