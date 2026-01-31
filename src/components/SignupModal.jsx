import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getFriendlyErrorMessage } from '../utils/errorMessages'
import { useNavigate } from 'react-router-dom'
import '../css/LoginModal.css'

export function SignupModal({ isOpen, onClose, onSwitchToLogin }) {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => document.body.classList.remove('modal-open')
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(email, password, displayName, 'user')
      setDisplayName('')
      setEmail('')
      setPassword('')
      onClose()
      navigate('/shop')
    } catch (err) {
      setError(getFriendlyErrorMessage(err))
      setLoading(false)
    }
  }

  const handleClose = () => {
    setDisplayName('')
    setEmail('')
    setPassword('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="modal-overlay2" onClick={handleClose}></div>
      <div className="login-modal2">
        <div className="modal-content2">
          <button className="modal-close" onClick={handleClose}>&times;</button>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="displayName">Full Name</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password (min 6 characters)"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full">
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          <p className="modal-footer">
            Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); handleClose(); onSwitchToLogin(); }}>Login here</a>
          </p>
        </div>
      </div>
    </>
  )
}
