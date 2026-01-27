import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/firebase'
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import '../css/Profile.css'

export function Profile() {
  const { user, userRole, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [cancellingOrderId, setCancellingOrderId] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [cancelSuccess, setCancelSuccess] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    fetchUserData()
    fetchOrders()
  }, [user, navigate])

  const fetchUserData = async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid)
      const userDocSnap = await getDoc(userDocRef)
      if (userDocSnap.exists()) {
        setDisplayName(userDocSnap.data().displayName || 'User')
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, 'orders'), where('userId', '==', user.uid))
      const querySnapshot = await getDocs(q)
      const ordersList = []

      querySnapshot.forEach((doc) => {
        ordersList.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      // Sort by date descending
      ordersList.sort((a, b) => (b.createdAt?.toDate?.() || new Date(0)) - (a.createdAt?.toDate?.() || new Date(0)))
      setOrders(ordersList)
      setError('')
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate?.() || new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleCancelClick = (orderId) => {
    setCancellingOrderId(orderId)
    setShowCancelModal(true)
    setCancelError('')
  }

  const handleConfirmCancel = async () => {
    if (!cancellingOrderId) return

    try {
      const orderRef = doc(db, 'orders', cancellingOrderId)
      await updateDoc(orderRef, {
        status: 'cancelled',
      })

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === cancellingOrderId ? { ...order, status: 'cancelled' } : order,
        ),
      )

      setCancelSuccess('Order cancelled successfully')
      setShowCancelModal(false)
      setCancellingOrderId(null)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setCancelSuccess('')
      }, 3000)
    } catch (err) {
      console.error('Error cancelling order:', err)
      setCancelError('Failed to cancel order. Please try again.')
    }
  }

  const handleCloseCancelModal = () => {
    setShowCancelModal(false)
    setCancellingOrderId(null)
    setCancelError('')
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* User Information Section */}
        <div className="profile-header">
          <div className="profile-avatar">👤</div>
          <div className="profile-info">
            <h1 className="profile-display-name">{displayName}</h1>
            <p className="profile-email">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="btn-logout-header">
            Logout
          </button>
        </div>

        {/* Success Message */}
        {cancelSuccess && <div className="success-message">{cancelSuccess}</div>}

        {/* Orders Section - Only for non-admin users */}
        {userRole !== 'admin' && (
          <div className="orders-section">
            <h2>Your Orders</h2>

            {loading && <div className="loading">Loading orders...</div>}
            {error && <div className="error-message">{error}</div>}

            {!loading && orders.length === 0 && (
              <div className="empty-state">
                <p>No orders yet. Start shopping!</p>
              </div>
            )}

            {!loading && orders.length > 0 && (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <span className="order-id">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className={`order-status status-${order.status}`}>{order.status}</span>
                    </div>
                    <div className="order-details">
                      <p className="order-date">{formatDate(order.createdAt)}</p>
                      <p className="order-items">Items: {order.items?.length || 0}</p>
                      <p className="order-total">Total: ₱{order.totalAmount?.toFixed(2) || '0.00'}</p>
                      {order.paymentMethod && (
                        <p className="order-payment">Payment: {order.paymentMethod}</p>
                      )}
                    </div>
                    {order.status === 'pending' && (
                      <div className="order-actions">
                        <button
                          className="btn-cancel-order1"
                          onClick={() => handleCancelClick(order.id)}
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin Message */}
        {userRole === 'admin' && (
          <div className="admin-message">
            <div className="admin-icon">⚙️</div>
            <h2>Admin Dashboard</h2>
            <p>View all orders and manage your store from the Dashboard in the header.</p>
            <button onClick={() => navigate('/admin-dashboard')} className="btn btn-primary">
              Go to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={handleCloseCancelModal}>
          <div className="modal-content cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Order?</h3>
              <button className="modal-close" onClick={handleCloseCancelModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to cancel this order?</p>
              <p className="warning-text">This action cannot be undone. Your order will be marked as cancelled.</p>

              {cancelError && <div className="error-message">{cancelError}</div>}

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={handleCloseCancelModal}>
                  Keep Order
                </button>
                <button className="btn btn-danger" onClick={handleConfirmCancel}>
                  Yes, Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
