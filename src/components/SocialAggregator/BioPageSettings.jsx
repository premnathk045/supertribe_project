import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiInfo, FiLayout, FiGrid, FiList, FiLink, 
  FiGlobe, FiEdit, FiCopy, FiCheck, FiType, FiEyeOff
} from 'react-icons/fi'
import { HexColorPicker } from 'react-colorful'
import { useAuth } from '../../contexts/AuthContext'

function BioPageSettings({ settings, onSave, saving }) {
  const { userProfile } = useAuth()
  
  const [formData, setFormData] = useState({
    custom_url: '',
    title: '',
    description: '',
    theme: 'default',
    background_color: '#ffffff',
    text_color: '#000000',
    accent_color: '#ec4899',
    font: 'Inter',
    show_social_links: true,
    show_aggregated_posts: true,
    layout_type: 'grid',
    is_public: true,
    seo_keywords: []
  })
  
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [colorPickerOpen, setColorPickerOpen] = useState(null)
  const [copied, setCopied] = useState(false)
  const [errors, setErrors] = useState({})
  
  // Initialize form data from settings
  useEffect(() => {
    if (settings) {
      setFormData({
        custom_url: settings.custom_url || '',
        title: settings.title || userProfile?.display_name || '',
        description: settings.description || userProfile?.bio || '',
        theme: settings.theme || 'default',
        background_color: settings.background_color || '#ffffff',
        text_color: settings.text_color || '#000000',
        accent_color: settings.accent_color || '#ec4899',
        font: settings.font || 'Inter',
        show_social_links: settings.show_social_links !== false,
        show_aggregated_posts: settings.show_aggregated_posts !== false,
        layout_type: settings.layout_type || 'grid',
        is_public: settings.is_public !== false,
        seo_keywords: settings.seo_keywords || []
      })
    }
  }, [settings, userProfile])
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }
  
  const handleColorChange = (color, field) => {
    setFormData(prev => ({ ...prev, [field]: color }))
  }
  
  const handleAddKeyword = () => {
    if (currentKeyword.trim() && !formData.seo_keywords.includes(currentKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        seo_keywords: [...(prev.seo_keywords || []), currentKeyword.trim()]
      }))
      setCurrentKeyword('')
    }
  }
  
  const handleRemoveKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      seo_keywords: (prev.seo_keywords || []).filter(k => k !== keyword)
    }))
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (formData.custom_url) {
      const urlRegex = /^[a-zA-Z0-9_-]+$/
      if (!urlRegex.test(formData.custom_url)) {
        newErrors.custom_url = 'Custom URL can only contain letters, numbers, hyphens, and underscores'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    onSave(formData)
  }
  
  const getBioPageUrl = () => {
    if (!userProfile) return null
    
    const baseUrl = window.location.origin
    const username = userProfile.username
    
    if (formData.custom_url) {
      return `${baseUrl}/bio/${formData.custom_url}`
    }
    
    return `${baseUrl}/bio/${username}`
  }
  
  const copyBioPageUrl = () => {
    const url = getBioPageUrl()
    if (url) {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  // Available fonts
  const fonts = [
    { value: 'Inter', label: 'Inter (Default)' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS' }
  ]
  
  return (
    <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6 md:space-y-8">
      <h2 className="text-xl font-semibold text-gray-900">Bio Page Settings</h2>
      
      {/* Bio Page URL */}
      <div className="border border-gray-200 rounded-lg p-3 md:p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800 flex items-center">
            <FiGlobe className="mr-2" />
            Your Bio Page URL
          </h3>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={copyBioPageUrl}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
            >
              {copied ? (
                <>
                  <FiCheck className="text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center text-gray-800 overflow-x-auto whitespace-nowrap mb-2 sm:mb-0 text-sm">
            <span className="text-gray-500 mr-1 text-xs sm:text-sm">{window.location.origin}/bio/</span>
            <span className="font-medium">
              {formData.custom_url || userProfile?.username || 'username'}
            </span>
          </div>
          <a
            href={getBioPageUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View Page
          </a>
        </div>
      </div>
      
      {/* Custom URL */}
      <div className="space-y-3 md:space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">URL & Discoverability</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom URL (optional)
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <span className="text-gray-500 bg-gray-100 w-full sm:w-auto px-3 py-2 rounded-lg sm:rounded-l-lg sm:rounded-r-none border border-b-0 sm:border-b sm:border-r-0 border-gray-300 text-xs sm:text-sm">
              {window.location.origin}/bio/
            </span>
            <input
              type="text"
              value={formData.custom_url}
              onChange={(e) => handleInputChange('custom_url', e.target.value.toLowerCase())}
              placeholder={userProfile?.username || 'username'}
              className={`flex-1 border ${
                errors.custom_url ? 'border-red-300 bg-red-50' : 'border-gray-300' 
              } rounded-lg sm:rounded-l-none sm:rounded-r-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full`}
            />
          </div>
          {errors.custom_url ? (
            <p className="mt-1 text-sm text-red-600">{errors.custom_url}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              Only letters, numbers, hyphens, and underscores. Leave blank to use your username.
            </p>
          )}
        </div>
        
        {/* Visibility */}
        <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <FiEyeOff className={`${formData.is_public ? 'text-gray-400' : 'text-red-500'}`} />
            <div>
              <h4 className="font-medium text-gray-900">Bio Page Privacy</h4>
              <p className="text-sm text-gray-500">
                {formData.is_public 
                  ? 'Your bio page is publicly visible to anyone with the link' 
                  : 'Your bio page is hidden from the public'}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) => handleInputChange('is_public', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
          </label>
        </div>
        
        {/* Content Display */}
        <div className="space-y-3 p-3 md:p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 flex items-center">
            <FiLayout className="mr-2" />
            Content Display
          </h4>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Show Social Media Links</p>
              <p className="text-sm text-gray-500">Display your social media links on your bio page</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.show_social_links}
                onChange={(e) => handleInputChange('show_social_links', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Show Aggregated Posts</p>
              <p className="text-sm text-gray-500">Display your content on your bio page</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.show_aggregated_posts}
                onChange={(e) => handleInputChange('show_aggregated_posts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
          
          {formData.show_aggregated_posts && (
            <div>
              <p className="font-medium text-gray-800">Content Layout</p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-2">
                <label className={`flex items-center justify-center w-32 h-24 border-2 rounded-lg cursor-pointer ${
                  formData.layout_type === 'grid' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="layout_type"
                    value="grid"
                    checked={formData.layout_type === 'grid'}
                    onChange={() => handleInputChange('layout_type', 'grid')}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <FiGrid className={`text-2xl mx-auto mb-2 ${
                      formData.layout_type === 'grid' ? 'text-primary-500' : 'text-gray-500'
                    }`} />
                    <span className={formData.layout_type === 'grid' ? 'text-primary-700' : 'text-gray-700'}>
                      Grid View
                    </span>
                  </div>
                </label>
                
                <label className={`flex items-center justify-center w-32 h-24 border-2 rounded-lg cursor-pointer ${
                  formData.layout_type === 'list' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="layout_type"
                    value="list"
                    checked={formData.layout_type === 'list'}
                    onChange={() => handleInputChange('layout_type', 'list')}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <FiList className={`text-2xl mx-auto mb-2 ${
                      formData.layout_type === 'list' ? 'text-primary-500' : 'text-gray-500'
                    }`} />
                    <span className={formData.layout_type === 'list' ? 'text-primary-700' : 'text-gray-700'}>
                      List View
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* SEO & Metadata */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 mt-4 md:mt-0">SEO & Metadata</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Page Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Your Bio Page Title"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            This appears in browser tabs and search results.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Page Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Brief description of your bio page"
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          ></textarea>
          <p className="mt-1 text-xs text-gray-500">
            This appears in search engine results.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SEO Keywords (optional)
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={currentKeyword}
              onChange={(e) => setCurrentKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddKeyword()
                }
              }}
              placeholder="Add keyword and press Enter"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              disabled={!currentKeyword.trim()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Add
            </button>
          </div>
          {formData.seo_keywords && formData.seo_keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.seo_keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <FiX className="text-xs" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No keywords added yet</p>
          )}
        </div>
      </div>
      
      {/* Appearance */}
      <div className="space-y-3 md:space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
          <FiEdit className="mr-2" />
          Appearance
        </h3>
        
        {/* Font Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font
          </label>
          <select
            value={formData.font}
            onChange={(e) => handleInputChange('font', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {fonts.map(font => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Color Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <div className="relative">
              <div
                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer flex items-center justify-between px-3"
                onClick={() => setColorPickerOpen(colorPickerOpen === 'background' ? null : 'background')}
                style={{ backgroundColor: formData.background_color }}
              >
                <span className="text-sm" style={{ 
                  color: formData.background_color === '#ffffff' ? '#000000' : formData.background_color === '#000000' ? '#ffffff' : undefined 
                }}>
                  {formData.background_color}
                </span>
                <div 
                  className="w-6 h-6 rounded-full border border-gray-300" 
                  style={{ backgroundColor: formData.background_color }}
                ></div>
              </div>
              {colorPickerOpen === 'background' && (
                <div className="absolute z-10 mt-2">
                  <HexColorPicker 
                    color={formData.background_color} 
                    onChange={(color) => handleColorChange(color, 'background_color')}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Text Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Color
            </label>
            <div className="relative">
              <div
                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer flex items-center justify-between px-3"
                onClick={() => setColorPickerOpen(colorPickerOpen === 'text' ? null : 'text')}
                style={{ backgroundColor: 'white' }}
              >
                <span className="text-sm" style={{ color: formData.text_color }}>
                  {formData.text_color}
                </span>
                <div 
                  className="w-6 h-6 rounded-full border border-gray-300" 
                  style={{ backgroundColor: formData.text_color }}
                ></div>
              </div>
              {colorPickerOpen === 'text' && (
                <div className="absolute z-10 mt-2">
                  <HexColorPicker 
                    color={formData.text_color} 
                    onChange={(color) => handleColorChange(color, 'text_color')}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Accent Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accent Color
            </label>
            <div className="relative">
              <div
                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer flex items-center justify-between px-3"
                onClick={() => setColorPickerOpen(colorPickerOpen === 'accent' ? null : 'accent')}
                style={{ backgroundColor: 'white' }}
              >
                <span className="text-sm" style={{ color: formData.accent_color }}>
                  {formData.accent_color}
                </span>
                <div 
                  className="w-6 h-6 rounded-full border border-gray-300" 
                  style={{ backgroundColor: formData.accent_color }}
                ></div>
              </div>
              {colorPickerOpen === 'accent' && (
                <div className="absolute z-10 mt-2">
                  <HexColorPicker 
                    color={formData.accent_color} 
                    onChange={(color) => handleColorChange(color, 'accent_color')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Color Theme Preview */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: formData.background_color }}>
          <h4 className="font-medium mb-2" style={{ color: formData.text_color }}>Theme Preview</h4>
          <div className="flex items-center space-x-4">
            <div 
              className="px-4 py-2 rounded-lg font-medium"
              style={{ 
                backgroundColor: formData.accent_color,
                color: formData.accent_color === '#ffffff' ? '#000000' : '#ffffff'
              }}
            >
              Button
            </div>
            <div 
              className="px-3 py-1 rounded-full text-sm"
              style={{ 
                backgroundColor: `${formData.accent_color}20`,
                color: formData.accent_color
              }}
            >
              Tag
            </div>
            <div style={{ color: formData.text_color }}>
              Text
            </div>
            <div style={{ color: formData.accent_color }}>
              Link
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <FiInfo className="text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p>These settings affect the appearance of your public bio page. You can customize colors, fonts, and layout to match your personal brand.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="pt-4 flex justify-end sticky bottom-14 md:bottom-0 md:static bg-white p-2 md:p-0">
        <button
          type="submit"
          disabled={saving}
          className="w-full md:w-auto px-6 py-3 md:py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-center space-x-2"
        >
          {saving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FiCheck />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default BioPageSettings