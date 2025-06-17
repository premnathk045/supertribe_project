import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import DiscoverPage from './pages/DiscoverPage'
import CreatePostPage from './pages/CreatePostPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import MessagesPage from './pages/MessagesPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/" element={<Layout />}>
                <Route index element={
                  <ProtectedRoute requireAuth={false}>
                    <HomePage />
                  </ProtectedRoute>
                } />
                <Route path="discover" element={
                  <ProtectedRoute requireAuth={false}>
                    <DiscoverPage />
                  </ProtectedRoute>
                } />
                <Route path="create" element={
                  <ProtectedRoute>
                    <CreatePostPage />
                  </ProtectedRoute>
                } />
                <Route path="notifications" element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                } />
                <Route path="profile/:username" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="messages" element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </AnimatePresence>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App