import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AuthModal from './AuthModal'
import LoadingSpinner from '../UI/LoadingSpinner'

function ProtectedRoute({ children, requireAuth = true }) {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      setShowAuthModal(true)
    }
  }, [user, loading, requireAuth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (requireAuth && !user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Sign in required
            </h1>
            <p className="text-gray-600 mb-6">
              You need to be signed in to access this page.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="signin"
        />
      </>
    )
  }

  return children
}

export default ProtectedRoute