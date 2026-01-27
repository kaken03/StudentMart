import React, { useState, useEffect } from 'react'
import { db } from '../services/firebase'
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import '../css/ProductModal.css'

// Category mapping
const CATEGORY_MAP = {
  'writing': 'Writing',
  'uniform': 'Uniform',
  'accessories': 'Accessories',
  'handbook': 'Handbook',
}

export function ProductModal({ isOpen, category, editingProduct, onClose, onProductAdded }) {
  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [description, setDescription] = useState('')
  const [stock, setStock] = useState('10')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [modalCategory, setModalCategory] = useState('')
  const { user } = useAuth()

  // Populate form when editing or category changes
  useEffect(() => {
    if (category) {
      setModalCategory(category)
    }
    
    if (editingProduct) {
      setProductName(editingProduct.name || '')
      setPrice(editingProduct.price || '')
      setImageUrl(editingProduct.imageUrl || '')
      setDescription(editingProduct.description || '')
      setStock(editingProduct.stock || '10')
      setImageFile(null)
    } else {
      resetForm()
    }
  }, [editingProduct, isOpen, category])

  const resetForm = () => {
    setProductName('')
    setPrice('')
    setDescription('')
    setStock('10')
    setImageFile(null)
    setImageUrl('')
    setError('')
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
    }
  }

  const uploadToCloudinary = async () => {
    if (!imageFile) {
      return imageUrl // Return existing URL if no new file
    }

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', imageFile)
    formData.append('upload_preset', 'studentmart')

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/db3trhp0a/image/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      setUploadingImage(false)
      return data.secure_url
    } catch (err) {
      setError('Error uploading image: ' + err.message)
      setUploadingImage(false)
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!productName || !price) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      if (!editingProduct && !imageFile) {
        setError('Please select an image for new products')
        setLoading(false)
        return
      }

      if (!modalCategory) {
        setError('Category is required')
        setLoading(false)
        return
      }

      // Upload image if new file selected
      let finalImageUrl = imageUrl
      if (imageFile) {
        finalImageUrl = await uploadToCloudinary()
        if (!finalImageUrl) {
          setLoading(false)
          return
        }
      }

      const productData = {
        name: productName,
        price: parseFloat(price),
        imageUrl: finalImageUrl,
        description: description || '',
        stock: parseInt(stock) || 10,
        category: modalCategory,
        sellerId: user.uid,
      }

      if (editingProduct) {
        // Update existing product
        await updateDoc(doc(db, 'products', editingProduct.id), {
          ...productData,
          updatedAt: serverTimestamp(),
        })
      } else {
        // Add new product
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp(),
        })
      }

      resetForm()
      onProductAdded()
      onClose()
    } catch (err) {
      setError('Error saving product: ' + err.message)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingProduct ? 'Edit Product' : `Add Product to ${CATEGORY_MAP[modalCategory] || 'Category'}`}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="productName">Product Name *</label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price *</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              rows="3"
            />
          </div> */}

          <div className="form-group">
            <label htmlFor="stock">Stock Quantity</label>
            <input
              type="number"
              id="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Enter stock quantity"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Product Image {!editingProduct && '*'}</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              required={!editingProduct}
            />
            {imageFile && <p className="image-selected">✓ Image selected: {imageFile.name}</p>}
            {editingProduct && imageUrl && !imageFile && <p className="image-current">✓ Current image: Using existing</p>}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="btn btn-primary btn-full"
            >
              {loading ? 'Saving...' : uploadingImage ? 'Uploading Image...' : editingProduct ? 'Update Product' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-full"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
