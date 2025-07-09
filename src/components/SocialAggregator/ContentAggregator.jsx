import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiLink, FiPlus, FiTrash2, FiImage, FiTag, FiFilter, 
  FiCheck, FiInfo, FiX, FiUpload, FiLayout, FiExternalLink,
  FiEye, FiEyeOff
} from 'react-icons/fi'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../UI/LoadingSpinner'
import { 
  fetchAggregatedPosts, 
  addAggregatedPost, 
  updateAggregatedPost, 
  deleteAggregatedPost,
  parseSocialMediaUrl
} from '../../lib/socialAggregator'

// Post Item Component
function SortablePostItem({ post, onEdit, onDelete, onToggleVisibility }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: post.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }
  
  const getPlatformIcon = () => {
    switch (post.platform) {
      case 'twitter':
        return <FiTwitter className="text-[#1DA1F2]" />
      case 'instagram':
        return <FiInstagram className="text-[#E1306C]" />
      case 'youtube':
        return <FiYoutube className="text-[#FF0000]" />
      case 'tiktok':
        return <FiMusic className="text-black" />
      default:
        return <FiLink className="text-gray-500" />
    }
  }
  
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col border rounded-lg overflow-hidden ${
        post.is_visible ? 'border-gray-200' : 'border-gray-200 bg-gray-50'
      } mb-4`}
    >
      {/* Header */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div 
            className="cursor-grab p-1" 
            {...attributes} 
            {...listeners}
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              {getPlatformIcon()}
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-1 max-w-[200px] sm:max-w-none">
              <h3 className="font-medium text-gray-900">{post.title || 'Post from ' + post.platform}</h3>
              {!post.is_visible && (
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Hidden</span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[200px] sm:max-w-none">{post.original_url}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-auto mt-2 sm:mt-0 w-full sm:w-auto justify-end">
          <button
            onClick={() => onToggleVisibility(post)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title={post.is_visible ? "Hide" : "Show"}
          >
            {post.is_visible ? <FiEye /> : <FiEyeOff />}
          </button>
          <a
            href={post.original_url}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Open original"
          >
            <FiExternalLink />
          </a>
          <button
            onClick={() => onEdit(post)}
            className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Edit"
          >
            <FiEdit2 />
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="p-1.5 sm:p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Delete"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
      
      {/* Content Preview */}
      <div className="p-3 sm:p-4 flex flex-wrap sm:flex-nowrap items-start sm:items-center">
        {post.thumbnail_url ? (
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 mr-3 sm:mr-4">
            <img 
              src={post.thumbnail_url} 
              alt={post.title || 'Post thumbnail'} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = 'https://via.placeholder.com/150?text=No+Image'
              }}
            />
          </div>
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center mr-3 sm:mr-4">
            <FiImage className="text-gray-400 text-2xl" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
            {post.title || 'No title available'}
          </h4>
          <p className="text-sm text-gray-500 line-clamp-2">
            {post.description || 'No description available'}
          </p>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
              {post.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Add Post Form Component
function AddPostForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    original_url: '',
    title: '',
    description: '',
    platform: '',
    tags: [],
    is_visible: true
  })
  const [currentTag, setCurrentTag] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [urlPreview, setUrlPreview] = useState(null)
  const [errors, setErrors] = useState({})
  
  // Parse URL when it changes
  useEffect(() => {
    const url = formData.original_url.trim()
    if (url) {
      const parsedData = parseSocialMediaUrl(url)
      if (parsedData.platform && parsedData.platform !== 'unknown') {
        setFormData(prev => ({
          ...prev,
          platform: parsedData.platform
        }))
      }
    }
  }, [formData.original_url])
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }
  
  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }
  
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }
  
  const handleExtractInfo = async () => {
    const url = formData.original_url.trim()
    if (!url) return
    
    try {
      setExtracting(true)
      
      // This would typically call an API to extract Open Graph data
      // For now, we'll simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Parsed data from URL
      const parsedData = parseSocialMediaUrl(url)
      
      // Simulate extracted data
      const mockData = {
        title: `Content from ${parsedData.platform || 'website'}`,
        description: 'This is a preview of the content from this URL. In a real implementation, this would be extracted from Open Graph tags or an API.',
        thumbnail_url: 'https://via.placeholder.com/300x200',
        platform: parsedData.platform || 'website'
      }
      
      setUrlPreview(mockData)
      
      // Update form with extracted data
      setFormData(prev => ({
        ...prev,
        title: mockData.title,
        description: mockData.description,
        platform: mockData.platform,
        thumbnail_url: mockData.thumbnail_url
      }))
      
    } catch (error) {
      console.error('Error extracting info:', error)
      setErrors({ extract: 'Failed to extract information from URL' })
    } finally {
      setExtracting(false)
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.original_url.trim()) {
      newErrors.original_url = 'URL is required'
    } else {
      try {
        new URL(formData.original_url.startsWith('http') 
          ? formData.original_url 
          : `https://${formData.original_url}`
        )
      } catch (e) {
        newErrors.original_url = 'Please enter a valid URL'
      }
    }
    
    if (!formData.platform) {
      newErrors.platform = 'Platform is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Ensure URL has protocol
    let finalUrl = formData.original_url
    if (!finalUrl.startsWith('http')) {
      finalUrl = `https://${finalUrl}`
    }
    
    onSubmit({
      ...formData,
      original_url: finalUrl
    })
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Add Content
      </h3>
      
      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content URL
        </label>
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <FiLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.original_url}
              onChange={(e) => handleInputChange('original_url', e.target.value)}
              placeholder="https://twitter.com/username/status/123456789"
              className={`w-full pl-10 pr-4 py-2 border ${
                errors.original_url ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
            />
          </div>
          <button
            type="button"
            onClick={handleExtractInfo}
            disabled={!formData.original_url.trim() || extracting}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
          >
            {extracting ? (
              <span className="flex items-center space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Extracting...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <FiUpload className="text-sm" />
                <span>Extract Info</span>
              </span>
            )}
          </button>
        </div>
        {errors.original_url && (
          <p className="mt-1 text-sm text-red-600">{errors.original_url}</p>
        )}
      </div>
      
      {/* URL Preview */}
      {urlPreview && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-start space-x-4">
          {urlPreview.thumbnail_url && (
            <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
              <img 
                src={urlPreview.thumbnail_url} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'https://via.placeholder.com/150?text=No+Image'
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{urlPreview.title}</h4>
            <p className="text-sm text-gray-500 line-clamp-2">{urlPreview.description}</p>
            <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {urlPreview.platform}
            </span>
          </div>
        </div>
      )}
      
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Title for this content"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Brief description of this content"
          rows="3"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        ></textarea>
      </div>
      
      {/* Platform */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Platform
        </label>
        <select
          value={formData.platform}
          onChange={(e) => handleInputChange('platform', e.target.value)}
          className={`w-full border ${
            errors.platform ? 'border-red-300 bg-red-50' : 'border-gray-300'
          } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500`}
        >
          <option value="">Select platform</option>
          <option value="twitter">Twitter</option>
          <option value="instagram">Instagram</option>
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
          <option value="facebook">Facebook</option>
          <option value="linkedin">LinkedIn</option>
          <option value="github">GitHub</option>
          <option value="medium">Medium</option>
          <option value="twitch">Twitch</option>
          <option value="other">Other</option>
        </select>
        {errors.platform && (
          <p className="mt-1 text-sm text-red-600">{errors.platform}</p>
        )}
      </div>
      
      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags (optional)
        </label>
        <div className="flex space-x-2 mb-2">
          <div className="flex-1 relative">
            <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              placeholder="Add tag and press Enter"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!currentTag.trim()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Add
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <FiX className="text-xs" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Visibility */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="post_is_visible"
          checked={formData.is_visible}
          onChange={(e) => handleInputChange('is_visible', e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="post_is_visible" className="text-sm font-medium text-gray-700">
          Show this post on your bio page
        </label>
      </div>
      
      {/* Extract Info Error */}
      {errors.extract && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center text-sm">
          <FiInfo className="mr-2" />
          <span>{errors.extract}</span>
        </div>
      )}
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Add Content
        </button>
      </div>
    </form>
  )
}

// Main Content Aggregator Component
function ContentAggregator() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [filters, setFilters] = useState({
    platform: '',
    tag: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  
  const fileInputRef = useRef(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )
  
  // Load aggregated posts
  useEffect(() => {
    if (user) {
      loadPosts()
    }
  }, [user, filters])
  
  const loadPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await fetchAggregatedPosts(user.id, filters)
      setPosts(data)
    } catch (err) {
      console.error('Error loading posts:', err)
      setError('Failed to load content. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle adding a new post
  const handleAddPost = async (postData) => {
    try {
      setLoading(true)
      setError(null)
      
      await addAggregatedPost(user.id, postData)
      await loadPosts()
      setShowAddForm(false)
    } catch (err) {
      console.error('Error adding post:', err)
      setError('Failed to add content. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle updating a post
  const handleUpdatePost = async (postData) => {
    try {
      if (!editingPost) return
      
      setLoading(true)
      setError(null)
      
      await updateAggregatedPost(editingPost.id, postData)
      await loadPosts()
      setEditingPost(null)
    } catch (err) {
      console.error('Error updating post:', err)
      setError('Failed to update content. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle deleting a post
  const handleDeletePost = async (postId) => {
    // Confirm deletion
    const confirmed = window.confirm('Are you sure you want to delete this content?')
    if (!confirmed) return
    
    try {
      setLoading(true)
      setError(null)
      
      await deleteAggregatedPost(postId)
      await loadPosts()
    } catch (err) {
      console.error('Error deleting post:', err)
      setError('Failed to delete content. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle toggling visibility
  const handleToggleVisibility = async (post) => {
    try {
      setLoading(true)
      setError(null)
      
      await updateAggregatedPost(post.id, {
        is_visible: !post.is_visible
      })
      await loadPosts()
    } catch (err) {
      console.error('Error toggling visibility:', err)
      setError('Failed to update content visibility. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle reordering posts
  const handleDragEnd = async (event) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      // Find the positions in the array
      const activeIndex = posts.findIndex(post => post.id === active.id)
      const overIndex = posts.findIndex(post => post.id === over.id)
      
      // Create a new array with reordered items
      const newPosts = [...posts]
      const [movedItem] = newPosts.splice(activeIndex, 1)
      newPosts.splice(overIndex, 0, movedItem)
      
      // Update local state immediately for a responsive feel
      setPosts(newPosts)
      
      // Update display order in the database
      try {
        await Promise.all(
          newPosts.map((post, index) => 
            updateAggregatedPost(post.id, { display_order: index })
          )
        )
      } catch (err) {
        console.error('Error updating post order:', err)
        setError('Failed to update content order. Please try again.')
        // Reload posts to get correct order
        loadPosts()
      }
    }
  }
  
  // Handle bulk upload
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Read file content
      const text = await file.text()
      const urls = text.split('\n')
        .map(url => url.trim())
        .filter(url => url && !url.startsWith('#'))
      
      if (urls.length === 0) {
        setError('No valid URLs found in the file')
        return
      }
      
      // Process each URL
      let successCount = 0
      let errorCount = 0
      
      for (const url of urls) {
        try {
          // Parse URL to extract platform
          const parsedUrl = parseSocialMediaUrl(url)
          
          // Add post
          await addAggregatedPost(user.id, {
            original_url: url,
            platform: parsedUrl.platform || 'other',
            title: `Content from ${parsedUrl.platform || 'website'}`,
            is_visible: true,
            published_at: new Date().toISOString()
          })
          
          successCount++
        } catch (err) {
          console.error(`Error adding URL: ${url}`, err)
          errorCount++
        }
      }
      
      // Reload posts
      await loadPosts()
      
      // Show result message
      alert(`Import completed: ${successCount} URLs imported successfully, ${errorCount} errors`)
      
    } catch (err) {
      console.error('Error with bulk upload:', err)
      setError('Failed to process bulk upload. Please try again.')
    } finally {
      setLoading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  // Get available filter options
  const getFilterOptions = () => {
    // Get unique platforms
    const platforms = [...new Set(posts.map(post => post.platform))]
      .filter(Boolean)
      .sort()
    
    // Get unique tags
    const tags = [...new Set(posts.flatMap(post => post.tags || []))]
      .filter(Boolean)
      .sort()
    
    return { platforms, tags }
  }
  
  const filterOptions = getFilterOptions()
  
  if (loading && posts.length === 0) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  return (
    <div className="divide-y divide-gray-200">
      <div className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">Content Manager</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 px-2 sm:px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              <FiFilter className="text-gray-500" />
              <span>Filter</span>
              {(filters.platform || filters.tag) && (
                <span className="flex items-center justify-center bg-primary-500 text-white rounded-full w-5 h-5 text-xs">
                  {Number(Boolean(filters.platform)) + Number(Boolean(filters.tag))}
                </span>
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleBulkUpload}
              accept=".txt, .csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <FiUpload />
              <span className="hidden sm:inline">Bulk Upload</span>
              <span className="sm:hidden">Upload</span>
            </button>
            <button
              onClick={() => {
                setShowAddForm(true)
                setEditingPost(null)
              }}
              className="flex items-center space-x-1 sm:space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-2 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <FiPlus />
              <span className="hidden sm:inline">Add Content</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-5 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-700">Filters</h3>
              <button
                onClick={() => {
                  setFilters({ platform: '', tag: '' })
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Platform Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  value={filters.platform}
                  onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Platforms</option>
                  {filterOptions.platforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Tag Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag
                </label>
                <select
                  value={filters.tag}
                  onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Tags</option>
                  {filterOptions.tags.map(tag => (
                    <option key={tag} value={tag}>
                      #{tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
            <FiInfo className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        {posts.length === 0 && !showAddForm && !loading ? (
          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No Content Yet</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
              Add your social media posts and other content to display on your bio page.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 px-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-3 sm:py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <FiUpload />
                <span>Bulk Upload</span>
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 sm:px-6 py-3 sm:py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <FiPlus />
                <span>Add First Content</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={posts.map(post => post.id)}
                strategy={verticalListSortingStrategy}
              >
                {posts.map((post) => (
                  <SortablePostItem
                    key={post.id}
                    post={post}
                    onEdit={setEditingPost}
                    onDelete={handleDeletePost}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))}
              </SortableContext>
            </DndContext>
            
            {posts.length > 0 && (
              <div className="mt-4 bg-blue-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-3">
                  <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-blue-800">
                    <strong>Tip:</strong> Drag and drop to reorder your content. The order here will be reflected on your bio page.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Add/Edit Form */}
        {showAddForm && (
          <AddPostForm
            onSubmit={handleAddPost}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  )
}

export default ContentAggregator