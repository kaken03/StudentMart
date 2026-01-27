import React from 'react'
import { useAuth } from '../context/AuthContext'
import '../css/AdminDashboard.css'

export function AdminDashboard() {
  const { user, userRole } = useAuth()

  if (userRole !== 'admin') {
    return (
      <div className="unauthorized">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin dashboard.</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <h1>Admin Dashboard</h1>
        <p className="welcome-message">Welcome, {user.email}</p>

        <div className="admin-grid">
          <section className="admin-section">
            <h2>Users Management</h2>
            <p>Manage user roles and accounts</p>
            <div className="section-content">
              {/* Users management will be implemented here */}
              <p>Coming soon...</p>
            </div>
          </section>

          <section className="admin-section">
            <h2>Products Management</h2>
            <p>Manage all products in the system</p>
            <div className="section-content">
              {/* Products management will be implemented here */}
              <p>Coming soon...</p>
            </div>
          </section>

          <section className="admin-section">
            <h2>Orders Management</h2>
            <p>View and manage all orders</p>
            <div className="section-content">
              {/* Orders management will be implemented here */}
              <p>Coming soon...</p>
            </div>
          </section>

          <section className="admin-section">
            <h2>System Analytics</h2>
            <p>View system statistics and analytics</p>
            <div className="section-content">
              {/* Analytics will be implemented here */}
              <p>Coming soon...</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
