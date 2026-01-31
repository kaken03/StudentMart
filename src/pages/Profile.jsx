import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { Messaging } from './Messaging'
import '../css/Profile.css'

export function Profile() {
  const { user, userRole, logout } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [showMessagingModal, setShowMessagingModal] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    fetchUserData()
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


  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleContactSeller = () => {
    setShowMessagingModal(true)
  }


  return (
    <>
      <div className="profile-page">
        <div className="profile-container">
        {/* User Information Section */}
        <div className="profile-header">
          <div className="profile-info">
            <h1 className="profile-display-name">{displayName}</h1>
            <p className="profile-email">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="btn-logout-header">
            Logout
          </button>
        </div>



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

        {/* Messaging Section */}
        {userRole !== 'admin' && (
          <div className="messaging-section">
            <h2>Contact Seller</h2>
            <p>Have questions about customization or need more information? Reach out to our seller.</p>
            <button onClick={handleContactSeller} className="btn btn-primary">
              Open Messages
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Messaging Modal */}
      {showMessagingModal && (
        <div className="modal-overlay">
          <div className="messaging-modal-wrapper">
            <Messaging isModal={true} onClose={() => setShowMessagingModal(false)} />
          </div>
        </div>
      )}
    </>
  )
}
