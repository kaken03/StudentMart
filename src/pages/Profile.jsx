import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/firebase'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import '../css/Profile.css'

export function Profile() {
  const { user, userRole, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [displayName, setDisplayName] = useState('')

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
                      <p className="order-total">Total: ₱{order.total?.toFixed(2) || '0.00'}</p>
                      {order.paymentMethod && (
                        <p className="order-payment">Payment: {order.paymentMethod}</p>
                      )}
                    </div>
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
    </div>
  )
}
