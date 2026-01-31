import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoginModal } from '../components/LoginModal'
import { SignupModal } from '../components/SignupModal'
import greennestLogo from '../images/greennestlogo1-Photoroom.png'
import '../css/LandingPage.css'

export function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleGetStarted = () => {
    if (user) {
      navigate('/products')
    } else {
      setShowLoginModal(true)
    }
  }

  return (
    <div className="landing-page">
      {/* Hero Section */}

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Why Choose GreenNest?</h2>
        <div className="cta-grid">
          <div className="cta-card">
            <div className="cta-icon">🌱</div>
            <h3>Eco-Friendly Materials</h3>
            <p>Bamboo is a fast-growing, renewable resource that regenerates naturally without replanting.</p>
          </div>
          <div className="cta-card">
            <div className="cta-icon">🏡</div>
            <h3>Beautiful Design</h3>
            <p>Modern, minimalist aesthetics that complement any home décor style perfectly.</p>
          </div>
          <div className="cta-card">
            <div className="cta-icon">💪</div>
            <h3>Durable & Strong</h3>
            <p>Bamboo furniture is stronger than many hardwoods and built to last for years.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <h2>Our Process</h2>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-image">
              <img 
                src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop" 
                alt="Bamboo Cultivation"
              />
              <div className="feature-badge">Step 1</div>
            </div>
            <div className="feature-text">
              <h3>Sustainable Sourcing</h3>
              <p>We partner with certified sustainable bamboo farms that prioritize environmental conservation and fair labor practices.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-image">
              <img 
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop" 
                alt="Craftsmanship"
              />
              <div className="feature-badge">Step 2</div>
            </div>
            <div className="feature-text">
              <h3>Expert Craftsmanship</h3>
              <p>Our skilled Filipino artisans transform raw bamboo into stunning furniture pieces using traditional and modern techniques.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-image">
              <img 
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=300&fit=crop" 
                alt="Quality Furniture"
              />
              <div className="feature-badge">Step 3</div>
            </div>
            <div className="feature-text">
              <h3>Your Dream Home</h3>
              <p>Receive premium bamboo furniture that brings natural beauty and sustainability into your living space.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="final-cta">
        <h2>Ready to Transform Your Space?</h2>
        <p>Join thousands of customers making sustainable choices for their homes</p>
        <button className="cta-btn" onClick={handleGetStarted}>
          Explore Our Collection
        </button>
      </section>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false)
          setShowSignupModal(true)
        }}
      />
      <SignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false)
          setShowLoginModal(true)
        }}
      />
    </div>
  )
}
