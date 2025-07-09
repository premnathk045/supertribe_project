import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import SocialProfileConfig from '../components/SocialAggregator/SocialProfileConfig'
import ContentAggregator from '../components/SocialAggregator/ContentAggregator'
import BioPageSettings from '../components/SocialAggregator/BioPageSettings'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { fetchBioPageSettings, updateBioPageSettings } from '../lib/socialAggregator'

function SocialAggregatorSettingsPage() {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [bioPageSettings, setBioPageSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    
    loadBioPageSettings()
  }, [user, navigate])
  
  const loadBioPageSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const settings = await fetchBioPageSettings(user.id)
      setBioPageSettings(settings)
    } catch (err) {
      console.error('Error loading bio page settings:', err)
      setError('Failed to load settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSaveSettings = async (settings) => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      const updatedSettings = await updateBioPageSettings(user.id, settings)
      setBioPageSettings(updatedSettings)
      setSuccess('Settings saved successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error saving bio page settings:', err)
      setError('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }
  
  const getBioPageUrl = () => {
    if (!userProfile) return null
    
    const baseUrl = window.location.origin
    const username = userProfile.username
    
    if (bioPageSettings?.custom_url) {
      return `${baseUrl}/bio/${bioPageSettings.custom_url}`
    }
    
    return `${baseUrl}/bio/${username}`
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          
          <h1 className="text-lg font-semibold">Link in Bio</h1>
          
          <a
            href={getBioPageUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-500 hover:text-primary-600 text-sm font-medium"
          >
            View Bio Page
          </a>
        </div>
        
        {/* Tabs */}
        <div className="flex border-t border-gray-200 px-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Social Media Links
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3 px-4 font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Content Manager
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Page Settings
          </button>
        </div>
      </div>
      
      {/* Error/Success Messages */}
      {(error || success) && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center"
            >
              <FiAlertTriangle className="text-red-500 mr-2" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto p-1 hover:bg-red-100 rounded-full transition-colors"
              >
                <FiX className="text-red-500" />
              </button>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center"
            >
              <FiCheck className="text-green-500 mr-2" />
              <span>{success}</span>
            </motion.div>
          )}
        </div>
      )}
      
      {/* Page Content */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SocialProfileConfig />
              </motion.div>
            )}
            
            {activeTab === 'posts' && (
              <motion.div
                key="posts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ContentAggregator />
              </motion.div>
            )}
            
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <BioPageSettings
                  settings={bioPageSettings}
                  onSave={handleSaveSettings}
                  saving={saving}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default SocialAggregatorSettingsPage