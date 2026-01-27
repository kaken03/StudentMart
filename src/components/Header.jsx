import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import '../css/Header.css'

export function Header() {
  const { user, userRole, logout } = useAuth()
  const { cart, getTotalItems } = useCart()
  const navigate = useNavigate()
  const [showCartDropdown, setShowCartDropdown] = useState(false)

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <h1>StudentMart</h1>
        </Link>
        <nav className="header-nav">
          {user ? (
            <>
              {userRole === 'admin' && (
                <Link to="/admin-dashboard" className="nav-link dashboard-link">
                  📊 Dashboard
                </Link>
              )}

              <div className="nav-icon-wrapper">
                <button
                  className="nav-icon-btn profile-btn"
                  onClick={() => navigate('/profile')}
                  title="Profile"
                >
                  👤
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
