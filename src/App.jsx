import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import DiscoverPage from './pages/DiscoverPage'
import CreatePostPage from './pages/CreatePostPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import MessagesPage from './pages/MessagesPage'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="discover" element={<DiscoverPage />} />
              <Route path="create" element={<CreatePostPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile/:username" element={<ProfilePage />} />
              <Route path="messages" element={<MessagesPage />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  )
}

export default App