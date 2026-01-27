import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/firebase'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ProductCard } from '../components/ProductCard'
import { ProductModal } from '../components/ProductModal'
import '../css/HomePage.css'

const CATEGORIES = [
  { id: 'writing', name: 'Writing', icon: '✏️' },
  { id: 'uniform', name: 'Uniform', icon: '👕' },
  { id: 'accessories', name: 'Accessories', icon: '🎒' },
  { id: 'handbook', name: 'Handbook', icon: '📖' },
]

export function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductModal, setShowProductModal] = useState(false)
  const [modalCategory, setModalCategory] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const { getTotalItems } = useCart()
  const { user, userRole } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      let q

      if (selectedCategory) {
        q = query(collection(db, 'products'), where('category', '==', selectedCategory))
      } else {
        // Show all products (not just popular)
        q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
      }

      const querySnapshot = await getDocs(q)
      const productList = []

      querySnapshot.forEach((doc) => {
        productList.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      setProducts(productList)
      setError('')
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="home-page">
      {/* <section className="hero">
        <div className="hero-content">
          <h1>Welcome to StudentMart</h1>
          <p>Your one-stop shop for student essentials</p>
        </div>
      </section> */}

      

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Explore by Category</h2>
          {user && userRole !== 'admin' && (
            <button 
              className="cart-icon-btn"
              onClick={() => navigate('/cart')}
              title="View Cart"
            >
              🛒 <span className="cart-count">{getTotalItems()}</span>
            </button>
          )}
        </div>
        <div className="categories-grid">
          {CATEGORIES.map((category) => (
            <div key={category.id} className="category-item">
              <button
                className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              >
                <div className="category-icon">{category.icon}</div>
                <div className="category-name">{category.name}</div>
              </button>
              {userRole === 'admin' && (
                <button
                  className="add-product-btn"
                  onClick={() => {
                    setModalCategory(category.id)
                    setEditingProduct(null)
                    setShowProductModal(true)
                  }}
                  title="Add product to this category"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
          {/* Search Bar */}
      <section className="search-section">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </section>
      {/* Products Section */}
      <section className="products-section">
        <div className="section-header">
          <h2>{selectedCategory ? `${CATEGORIES.find(c => c.id === selectedCategory)?.name} Products` : 'All Products'}</h2>
          {selectedCategory && (
            <a href="#" className="see-all-link" onClick={(e) => {
              e.preventDefault()
              setSelectedCategory(null)
            }}>
              See all
            </a>
          )}
        </div>

        {loading && <div className="loading">Loading products...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && filteredProducts.length === 0 && (
          <div className="empty-state">
            <p>No products found. Check back soon!</p>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={(id) => navigate(`/product/${id}`)}
                onProductUpdated={() => fetchProducts()}
                onEditProduct={(productToEdit) => {
                  setEditingProduct(productToEdit)
                  setModalCategory(productToEdit.category)
                  setShowProductModal(true)
                }}
              />
            ))}
          </div>
        )}
      </section>
        
      {/* Product Modal */}
      <ProductModal
        isOpen={showProductModal}
        category={modalCategory}
        editingProduct={editingProduct}
        onClose={() => {
          setShowProductModal(false)
          setEditingProduct(null)
          setModalCategory(null)
        }}
        onProductAdded={() => fetchProducts()}
      />
    </div>
  )
}
