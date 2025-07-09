import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiTrash2, FiEdit2, FiLink, FiEye, FiEyeOff, FiInfo, FiTwitter, FiInstagram, FiYoutube, FiGithub, FiLinkedin, FiFacebook, FiGlobe, FiMail } from 'react-icons/fi'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../UI/LoadingSpinner'
import { 
  fetchSocialMediaLinks, 
  addSocialMediaLink, 
  updateSocialMediaLink, 
  deleteSocialMediaLink,
  getPlatformMetadata
} from '../../lib/socialAggregator'

// Mapping of platform to icon component
const platformIcons = {
  twitter: FiTwitter,
  instagram: FiInstagram,
  youtube: FiYoutube,
  github: FiGithub,
  linkedin: FiLinkedin,
  facebook: FiFacebook,
  website: FiGlobe,
  email: FiMail,
  // Add more platform icons as needed
}

// Platform options for the dropdown
const platformOptions = [
  { value: 'twitter', label: 'Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'twitch', label: 'Twitch' },
  { value: 'discord', label: 'Discord' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'behance', label: 'Behance' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'medium', label: 'Medium' },
  { value: 'patreon', label: 'Patreon' },
  { value: 'website', label: 'Website' },
  { value: 'email', label: 'Email' },
  { value: 'other', label: 'Other' }
]

// Sortable social link item component
function SortableSocialLinkItem({ link, onEdit, onDelete, onToggleVisibility }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: link.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const platformData = getPlatformMetadata(link.platform)
  const IconComponent = platformIcons[link.platform] || FiLink

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between p-4 border rounded-lg ${
        link.is_visible ? 'border-gray-200' : 'border-gray-200 bg-gray-50'
      } mb-3`}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div 
          className="cursor-grab p-2" 
          {...attributes} 
          {...listeners}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${platformData?.color}20` || '#f3f4f6' }}
          >
            <IconComponent 
              className="text-lg" 
              style={{ color: platformData?.color || '#718096' }} 
            />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h3 className="font-medium text-gray-900 truncate">
              {link.display_name || platformData?.name || link.platform}
            </h3>
            {!link.is_visible && (
              <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Hidden</span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{link.url}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onToggleVisibility(link)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          title={link.is_visible ? "Hide" : "Show"}
        >
          {link.is_visible ? <FiEye /> : <FiEyeOff />}
        </button>
        <button
          onClick={() => onEdit(link)}
          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="Edit"
        >
          <FiEdit2 />
        </button>
        <button
          onClick={() => onDelete(link.id)}
          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Delete"
        >
          <FiTrash2 />
        </button>
      </div>
    </motion.div>
  )
}

// Form for adding/editing social links
function SocialLinkForm({ isEditing, linkData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    display_name: '',
    is_visible: true
  })
  const [errors, setErrors] = useState({})
  
  useEffect(() => {
    if (isEditing && linkData) {
      setFormData({
        platform: linkData.platform || '',
        url: linkData.url || '',
        display_name: linkData.display_name || '',
        is_visible: linkData.is_visible !== false
      })
    }
  }, [isEditing, linkData])
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
    
    // If platform changes, suggest display name
    if (field === 'platform') {
      const platformData = getPlatformMetadata(value)
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        display_name: prev.display_name || platformData?.name || ''
      }))
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.platform) {
      newErrors.platform = 'Platform is required'
    }
    
    if (!formData.url) {
      newErrors.url = 'URL is required'
    } else {
      // Basic URL validation
      try {
        // Special case for email
        if (formData.platform === 'email') {
          if (!formData.url.includes('@')) {
            newErrors.url = 'Please enter a valid email address'
          }
        } else {
          new URL(formData.url.startsWith('http') ? formData.url : `https://${formData.url}`)
        }
      } catch (e) {
        newErrors.url = 'Please enter a valid URL'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Prepare data for submission
    let finalUrl = formData.url
    
    // Ensure URLs start with http:// or https://
    if (formData.platform === 'email' && !finalUrl.startsWith('mailto:')) {
      finalUrl = `mailto:${finalUrl}`
    } else if (formData.platform !== 'email' && !finalUrl.startsWith('http')) {
      finalUrl = `https://${finalUrl}`
    }
    
    onSubmit({
      ...formData,
      url: finalUrl
    })
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-3 md:p-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">
        {isEditing ? 'Edit Social Link' : 'Add Social Link'}
      </h3>
      
      {/* Platform Dropdown */}
      <div>
        <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
          Platform
        </label>
        <select
          id="platform"
          value={formData.platform}
          onChange={(e) => handleInputChange('platform', e.target.value)}
          className={`w-full border ${
            errors.platform ? 'border-red-300 bg-red-50' : 'border-gray-300'
          } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500`}
        >
          <option value="">Select a platform</option>
          {platformOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.platform && (
          <p className="mt-1 text-sm text-red-600">{errors.platform}</p>
        )}
      </div>
      
      {/* Display Name */}
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1">
          Display Name (optional)
        </label>
        <input
          type="text"
          id="display_name"
          value={formData.display_name}
          onChange={(e) => handleInputChange('display_name', e.target.value)}
          placeholder="How to display this link"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      
      {/* URL / Username */}
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          {formData.platform === 'email' ? 'Email Address' : 'URL / Username'}
        </label>
        <input
          type={formData.platform === 'email' ? 'email' : 'text'}
          id="url"
          value={formData.url}
          onChange={(e) => handleInputChange('url', e.target.value)}
          placeholder={formData.platform === 'email' ? 'your@email.com' : 'https://...'}
          className={`w-full border ${
            errors.url ? 'border-red-300 bg-red-50' : 'border-gray-300'
          } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500`}
        />
        {errors.url && (
          <p className="mt-1 text-sm text-red-600">{errors.url}</p>
        )}
      </div>
      
      {/* Visibility Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_visible"
          checked={formData.is_visible}
          onChange={(e) => handleInputChange('is_visible', e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="is_visible" className="text-sm font-medium text-gray-700">
          Show this link on your bio page
        </label>
      </div>
      
      {/* Form Actions */}
      <div className="flex flex-col md:flex-row md:justify-end space-y-2 md:space-y-0 md:space-x-2 pt-4 sticky bottom-14 md:bottom-auto md:static bg-white p-2 md:p-0">
        <button
          type="button"
          onClick={onCancel}
          className="w-full md:w-auto px-4 py-3 md:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full md:w-auto px-4 py-3 md:py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {isEditing ? 'Save Changes' : 'Add Link'}
        </button>
      </div>
    </form>
  )
}

// Main component
function SocialProfileConfig() {
  const { user } = useAuth()
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLink, setEditingLink] = useState(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )
  
  // Load social media links
  useEffect(() => {
    if (user) {
      loadSocialLinks()
    }
  }, [user])
  
  const loadSocialLinks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await fetchSocialMediaLinks(user.id)
      setLinks(data)
    } catch (err) {
      console.error('Error loading social links:', err)
      setError('Failed to load social media links. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle adding a new social link
  const handleAddLink = async (linkData) => {
    try {
      setLoading(true)
      setError(null)
      
      await addSocialMediaLink(user.id, linkData)
      await loadSocialLinks()
      setShowAddForm(false)
    } catch (err) {
      console.error('Error adding social link:', err)
      setError('Failed to add social link. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle updating a social link
  const handleUpdateLink = async (linkData) => {
    try {
      if (!editingLink) return
      
      setLoading(true)
      setError(null)
      
      await updateSocialMediaLink(editingLink.id, linkData)
      await loadSocialLinks()
      setEditingLink(null)
    } catch (err) {
      console.error('Error updating social link:', err)
      setError('Failed to update social link. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle deleting a social link
  const handleDeleteLink = async (linkId) => {
    try {
      setLoading(true)
      setError(null)
      
      await deleteSocialMediaLink(linkId)
      await loadSocialLinks()
    } catch (err) {
      console.error('Error deleting social link:', err)
      setError('Failed to delete social link. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle toggling visibility
  const handleToggleVisibility = async (link) => {
    try {
      setLoading(true)
      setError(null)
      
      await updateSocialMediaLink(link.id, {
        is_visible: !link.is_visible
      })
      await loadSocialLinks()
    } catch (err) {
      console.error('Error toggling visibility:', err)
      setError('Failed to update link visibility. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle reordering links
  const handleDragEnd = async (event) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      // Find the positions in the array
      const activeIndex = links.findIndex(link => link.id === active.id)
      const overIndex = links.findIndex(link => link.id === over.id)
      
      // Create a new array with reordered items
      const newLinks = [...links]
      const [movedItem] = newLinks.splice(activeIndex, 1)
      newLinks.splice(overIndex, 0, movedItem)
      
      // Update local state immediately for a responsive feel
      setLinks(newLinks)
      
      // Update display order in the database
      try {
        await Promise.all(
          newLinks.map((link, index) => 
            updateSocialMediaLink(link.id, { display_order: index })
          )
        )
      } catch (err) {
        console.error('Error updating link order:', err)
        setError('Failed to update link order. Please try again.')
        // Reload links to get correct order
        loadSocialLinks()
      }
    }
  }
  
  if (loading && links.length === 0) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  return (
    <div className="divide-y divide-gray-200 pb-20 md:pb-0">
      <div className="p-3 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-3 md:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">Social Media Links</h2>
          <button
            onClick={() => {
              setShowAddForm(true)
              setEditingLink(null)
            }}
            className="flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 md:py-2 rounded-lg text-sm font-medium transition-colors w-full md:w-auto"
          >
            <FiPlus />
            <span>Add Link</span>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
            <FiInfo className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        {links.length === 0 && !showAddForm && !loading ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-5xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Links Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Add your social media links to display them on your bio page.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Add Your First Link
            </button>
          </div>
        ) : (
          <div>
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={links.map(link => link.id)}
                strategy={verticalListSortingStrategy}
              >
                {links.map((link) => (
                  <SortableSocialLinkItem
                    key={link.id}
                    link={link}
                    onEdit={setEditingLink}
                    onDelete={handleDeleteLink}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))}
              </SortableContext>
            </DndContext>
            
            {links.length > 0 && (
              <div className="mt-4 bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FiInfo className="text-blue-500 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Tip:</strong> Drag and drop to reorder your links. The order here will be reflected on your bio page.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Add/Edit Form */}
        {(showAddForm || editingLink) && (  
          <SocialLinkForm
            isEditing={!!editingLink}
            linkData={editingLink}
            onSubmit={editingLink ? handleUpdateLink : handleAddLink}
            onCancel={() => {
              setShowAddForm(false)
              setEditingLink(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default SocialProfileConfig