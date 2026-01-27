import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { Header } from './components/Header'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { AdminOrdersDashboard } from './pages/AdminOrdersDashboard'
import { Profile } from './pages/Profile'
import './css/App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Orders Dashboard */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminOrdersDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Protected routes will be added here */}
              {/* Student routes: /orders */}
              {/* Seller routes: /seller-dashboard */}
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
