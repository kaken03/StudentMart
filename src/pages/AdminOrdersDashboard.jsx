import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/firebase'
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import '../css/AdminOrdersDashboard.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export function AdminOrdersDashboard() {
  const { user, userRole } = useAuth()
  const navigate = useNavigate()
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('month')
  const [activeView, setActiveView] = useState('orders')

  useEffect(() => {
    if (!user || userRole !== 'admin') {
      navigate('/')
      return
    }

    fetchAllOrders()
  }, [user, userRole, navigate])

  const fetchAllOrders = async () => {
    try {
      setLoading(true)
      // Fetch all orders, sorted by creation date (oldest first - FCFS)
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'asc'))
      const querySnapshot = await getDocs(q)
      const ordersList = []

      querySnapshot.forEach((doc) => {
        ordersList.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      setAllOrders(ordersList)
      setError('')
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId)
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date(),
      })

      // Update local state
      setAllOrders(
        allOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
    } catch (err) {
      console.error('Error updating order status:', err)
      alert('Failed to update order status. Please try again.')
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

  const getOrdersByTimeframe = () => {
    const now = new Date()
    const grouped = {}

    allOrders.forEach((order) => {
      const orderDate = order.createdAt?.toDate?.() || new Date(order.createdAt)
      let key

      if (analyticsTimeframe === 'day') {
        // Last 30 days
        const daysAgo = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24))
        if (daysAgo <= 30) {
          key = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
      } else if (analyticsTimeframe === 'week') {
        // Last 12 weeks
        const weeksAgo = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24 * 7))
        if (weeksAgo <= 12) {
          const weekStart = new Date(orderDate)
          weekStart.setDate(orderDate.getDate() - orderDate.getDay())
          key = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        }
      } else if (analyticsTimeframe === 'month') {
        // Last 12 months
        const monthsAgo = (now.getFullYear() - orderDate.getFullYear()) * 12 + (now.getMonth() - orderDate.getMonth())
        if (monthsAgo <= 12) {
          key = orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        }
      } else if (analyticsTimeframe === 'year') {
        // All years
        key = orderDate.getFullYear().toString()
      }

      if (key) {
        if (!grouped[key]) {
          grouped[key] = { total: 0, pending: 0, confirmed: 0, ready_for_pickup: 0, completed: 0, cancelled: 0 }
        }
        grouped[key].total++
        grouped[key][order.status] = (grouped[key][order.status] || 0) + 1
      }
    })

    // Sort and return
    return Object.entries(grouped).sort()
  }

  const analyticsData = getOrdersByTimeframe()

  // Calculate product statistics
  const getProductStats = () => {
    const productMap = {}
    let totalProducts = 0

    allOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const productName = item.name || 'Unknown Product'
        if (!productMap[productName]) {
          productMap[productName] = 0
        }
        const quantity = item.quantity || 1
        productMap[productName] += quantity
        totalProducts += quantity
      })
    })

    return { productMap, totalProducts }
  }

  const { productMap, totalProducts } = getProductStats()

  // Prepare bar chart data
  const barChartData = {
    labels: analyticsData.map(([period]) => period),
    datasets: [
      {
        label: 'Total Orders',
        data: analyticsData.map(([, data]) => data.total),
        backgroundColor: '#007bff',
        borderColor: '#0056b3',
        borderWidth: 1,
      },
      {
        label: 'Completed',
        data: analyticsData.map(([, data]) => data.completed),
        backgroundColor: '#28a745',
        borderColor: '#218838',
        borderWidth: 1,
      },
      {
        label: 'Pending',
        data: analyticsData.map(([, data]) => data.pending),
        backgroundColor: '#ffc107',
        borderColor: '#ff9800',
        borderWidth: 1,
      },
    ],
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Orders Over Time (${analyticsTimeframe.charAt(0).toUpperCase() + analyticsTimeframe.slice(1)})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  // Prepare pie chart data
  const pieChartData = {
    labels: Object.keys(productMap),
    datasets: [
      {
        data: Object.values(productMap),
        backgroundColor: [
          '#007bff',
          '#28a745',
          '#ffc107',
          '#dc3545',
          '#17a2b8',
          '#6f42c1',
          '#e83e8c',
          '#fd7e14',
          '#20c997',
          '#6c757d',
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || ''
            const value = context.parsed
            const percentage = ((value / totalProducts) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          },
        },
      },
      title: {
        display: true,
        text: 'Products Ordered Distribution',
      },
    },
  }

  // Filter orders based on status
  const filteredOrders = filterStatus === 'all' 
    ? allOrders 
    : allOrders.filter(order => order.status === filterStatus)

  const stats = {
    total: allOrders.length,
    pending: allOrders.filter(o => o.status === 'pending').length,
    confirmed: allOrders.filter(o => o.status === 'confirmed').length,
    ready_for_pickup: allOrders.filter(o => o.status === 'ready_for_pickup').length,
    completed: allOrders.filter(o => o.status === 'completed').length,
    cancelled: allOrders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-container">
        {/* Header */}
        <div className="dashboard-header">
          <h1>📊 Orders Dashboard</h1>
          <p>Manage all customer orders</p>
        </div>

        {/* View Toggle Tabs */}
        <div className="view-toggle-section">
          <button 
            className={`view-toggle-btn ${activeView === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveView('orders')}
          >
            📋 Orders List
          </button>
          <button 
            className={`view-toggle-btn ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveView('analytics')}
          >
            📈 Analytics
          </button>
        </div>

        {/* Analytics Section - Conditional Render */}
        {activeView === 'analytics' && (
          <div className="analytics-section">
            <h2>📈 Orders Analytics</h2>
            <div className="analytics-controls">
              <button 
                className={`time-filter-btn ${analyticsTimeframe === 'day' ? 'active' : ''}`}
                onClick={() => setAnalyticsTimeframe('day')}
              >
                Day
              </button>
              <button 
                className={`time-filter-btn ${analyticsTimeframe === 'week' ? 'active' : ''}`}
                onClick={() => setAnalyticsTimeframe('week')}
              >
              Week
            </button>
            <button 
              className={`time-filter-btn ${analyticsTimeframe === 'month' ? 'active' : ''}`}
              onClick={() => setAnalyticsTimeframe('month')}
            >
              Month
            </button>
            <button 
              className={`time-filter-btn ${analyticsTimeframe === 'year' ? 'active' : ''}`}
              onClick={() => setAnalyticsTimeframe('year')}
            >
              Year
            </button>
          </div>

          <div className="charts-container">
            {/* Bar Chart */}
            <div className="chart-wrapper bar-chart-wrapper">
              {analyticsData.length === 0 ? (
                <div className="chart-empty">
                  <p>No data available for this period</p>
                </div>
              ) : (
                <Bar data={barChartData} options={barChartOptions} />
              )}
            </div>

            {/* Pie Chart */}
            <div className="chart-wrapper pie-chart-wrapper">
              {Object.keys(productMap).length === 0 ? (
                <div className="chart-empty">
                  <p>No products ordered yet</p>
                </div>
              ) : (
                <Pie data={pieChartData} options={pieChartOptions} />
              )}
            </div>
          </div>

          {Object.keys(productMap).length > 0 && (
            <div className="product-stats-summary">
              <h3>Product Order Summary</h3>
              <div className="product-stats-table">
                <table>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Quantity Ordered</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(productMap)
                      .sort(([, a], [, b]) => b - a)
                      .map(([productName, quantity]) => (
                        <tr key={productName}>
                          <td className="product-name">{productName}</td>
                          <td className="product-quantity">{quantity}</td>
                          <td className="product-percentage">
                            {((quantity / totalProducts) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Orders List Section - Conditional Render */}
        {activeView === 'orders' && (
          <>
        {/* Filters */}
        <div className="filters-section">
          <h2>Filter Orders</h2>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({stats.total})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Pending ({stats.pending})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('confirmed')}
            >
              Confirmed ({stats.confirmed})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'ready_for_pickup' ? 'active' : ''}`}
              onClick={() => setFilterStatus('ready_for_pickup')}
            >
              Ready for Pickup ({stats.ready_for_pickup})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completed')}
            >
              Completed ({stats.completed})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilterStatus('cancelled')}
            >
              Cancelled ({stats.cancelled})
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-section">
          <h2>Orders List</h2>

          {loading && <div className="loading">Loading orders...</div>}
          {error && <div className="error-message">{error}</div>}

          {!loading && filteredOrders.length === 0 && (
            <div className="empty-state">
              <p>No orders found</p>
            </div>
          )}

          {!loading && filteredOrders.length > 0 && (
            <div className="orders-list-container">
              {filteredOrders.map((order) => (
                <div key={order.id} className="order-card-admin">
                  <div className="order-card-header">
                    <div className="order-info">
                      <span className="order-id">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className="order-customer">👤 {order.userEmail}</span>
                    </div>
                    <span className={`order-status status-${order.status}`}>{order.status}</span>
                  </div>

                  <div className="order-card-content">
                    <div className="order-column">
                      <p className="label">Date & Time</p>
                      <p className="value">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="order-column">
                      <p className="label">Items</p>
                      <p className="value">{order.items?.length || 0} item(s)</p>
                    </div>
                    <div className="order-column">
                      <p className="label">Total Amount</p>
                      <p className="value amount">₱{order.totalAmount?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="order-column">
                      <p className="label">Payment</p>
                      <p className="value">{order.paymentMethod || 'N/A'}</p>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="order-items">
                      <p className="items-label">Items Ordered:</p>
                      <ul>
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} x{item.quantity} - ₱{(item.price * item.quantity).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="order-actions">
                    {order.status === 'pending' && (
                      <button
                        className="action-btn confirm-btn"
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      >
                        ✓ Confirm Order
                      </button>
                    )}

                    {order.status === 'confirmed' && (
                      <button
                        className="action-btn ready-btn"
                        onClick={() => updateOrderStatus(order.id, 'ready_for_pickup')}
                      >
                        📦 Ready for Pickup
                      </button>
                    )}

                    {order.status === 'ready_for_pickup' && (
                      <button
                        className="action-btn complete-btn"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                      >
                        ✅ Mark Completed
                      </button>
                    )}

                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <button
                        className="action-btn cancel-btn"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this order?')) {
                            updateOrderStatus(order.id, 'cancelled')
                          }
                        }}
                      >
                        ❌ Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  )
}
