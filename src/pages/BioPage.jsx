import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { 
  FiTwitter, FiInstagram, FiYoutube, FiGithub, FiLinkedin, 
  FiFacebook, FiGlobe, FiMail, FiShare2, FiCopy, FiCheck,
  FiGrid, FiList, FiHeart, FiTag, FiFilter, FiEdit, 
  FiMusic, FiLink
} from 'react-icons/fi'

import { useAuth } from '../contexts/AuthContext'
import { fetchBioPageByUsername, getPlatformMetadata, trackBioPageEvent } from '../lib/socialAggregator'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { validateUrl } from '../utils/validation'

// Social Link Item Component
function SocialLinkItem({ link }) {
  const platformData = getPlatformMetadata(link.platform)
  
  // Determine icon to use
  let IconComponent
  switch (link.platform) {
    case 'twitter':
      IconComponent = FiTwitter
      break
    case 'instagram':
      IconComponent = FiInstagram
      break
    case 'youtube':
      IconComponent = FiYoutube
      break
    case 'github':
      IconComponent = FiGithub
      break
    case 'linkedin':
      IconComponent = FiLinkedin
      break
    case 'facebook':
      IconComponent = FiFacebook
      break
    case 'website':
      IconComponent = FiGlobe
      break
    case 'email':
      IconComponent = FiMail
      break
    default:
      IconComponent = FiGlobe
  }
  
  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all"
      style={{
        borderColor: `${platformData?.color}30` || '#e5e7eb'
      }}
      onClick={() => trackBioPageEvent('link_click', { platform: link.platform })}
    >
      <div className="flex items-center space-x-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${platformData?.color}20` || '#f3f4f6' }}
        >
          <IconComponent 
            className="text-lg" 
            style={{ color: platformData?.color || '#718096' }} 
          />
        </div>
        <span className="font-medium">{link.display_name || platformData?.name || link.platform}</span>
      </div>
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: platformData?.color || '#718096' }}
      >
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.a>
  )
}

// Content Grid Item Component
function ContentGridItem({ post }) {
  const [isHovered, setIsHovered] = useState(false)
  
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
    <motion.a
      href={post.original_url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -2 }}
      className="block rounded-lg overflow-hidden border border-gray-200 bg-white hover:shadow-md transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => trackBioPageEvent('post_click', { 
        platform: post.platform, 
        post_id: post.id 
      })}
    >
      <div className="relative aspect-video bg-gray-100">
        {post.thumbnail_url ? (
          <img 
            src={post.thumbnail_url} 
            alt={post.title || 'Post thumbnail'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2">
                {getPlatformIcon()}
              </div>
              <p className="text-gray-500 text-sm">No preview available</p>
            </div>
          </div>
        )}
        
        {/* Overlay on Hover */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity"
          style={{ opacity: isHovered ? 1 : 0 }}
        >
          <div className="text-white font-medium px-4 py-2 rounded-full bg-white bg-opacity-20">
            View
          </div>
        </div>
        
        {/* Platform Badge */}
        <div className="absolute top-2 left-2 bg-white rounded-full p-1 shadow-sm">
          <div className="w-6 h-6 flex items-center justify-center">
            {getPlatformIcon()}
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-gray-900 line-clamp-1">{post.title || 'Untitled'}</h3>
        {post.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.description}</p>
        )}
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.a>
  )
}

// Content List Item Component
function ContentListItem({ post }) {
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
    <motion.a
      href={post.original_url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -2 }}
      className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all"
      onClick={() => trackBioPageEvent('post_click', { 
        platform: post.platform, 
        post_id: post.id 
      })}
    >
      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        {post.thumbnail_url ? (
          <img 
            src={post.thumbnail_url} 
            alt={post.title || 'Post thumbnail'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = 'https://via.placeholder.com/150?text=No+Image'
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            {getPlatformIcon()}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900 truncate">{post.title || 'Untitled'}</h3>
          <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
            {getPlatformIcon()}
          </div>
        </div>
        
        {post.description && (
          <p className="text-sm text-gray-600 line-clamp-1">{post.description}</p>
        )}
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {post.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index} 
                className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 2 && (
              <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                +{post.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.a>
  )
}

// Main Bio Page Component
function BioPage() {
  const { username } = useParams()
  const { user } = useAuth()
  
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    platform: '',
    tag: '',
    timeoutId: null
  })
  const [notFound, setNotFound] = useState(false)
  
  // Load bio page data
  useEffect(() => {
    loadBioPage()
    
    // Track page view
    trackBioPageEvent('page_view', { username })
  }, [username])
  
  const loadBioPage = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Set a timeout to show a loading state for at least 0.5 seconds
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch the bio page data
      const dataPromise = fetchBioPageByUsername(username);
      
      // Use Promise.all to wait for both the timeout and the data fetch
      const [_, data] = await Promise.all([timeoutPromise, dataPromise]);
      
      // Set a timeout for maximum 5 seconds
      const maxTimeout = setTimeout(() => {
        if (loading) {
          setError('Request timed out. Please try again.')
          setLoading(false)
        }
      }, 5000)
      
      if (data) {
        setPageData(data)
        clearTimeout(maxTimeout)
      } else {
        setNotFound(true)
        clearTimeout(maxTimeout)
      }
    } catch (err) {
      console.error('Error loading bio page:', err)
      setError('This bio page could not be found or is unavailable.')
    } finally {
      setLoading(false)
    }
  }

  // Validate URL before processing
  const validateBioUrl = (url) => {
    if (!validateUrl(url)) {
      return false;
    }
    
    // Check for specific domain whitelist (optional)
    const allowedDomains = ['instagram.com', 'twitter.com', 'youtube.com', 'tiktok.com', 'facebook.com'];
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      return allowedDomains.some(allowedDomain => domain.includes(allowedDomain));
    } catch (e) {
      return false;
    }
  }
  
  // Handle copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    
    // Track share event
    trackBioPageEvent('page_share', { username })
  }
  
  // Filter posts based on active filters
  const getFilteredPosts = () => {
    if (!pageData?.posts) return []
    
    return pageData.posts.filter(post => {
      // Platform filter
      if (activeFilters.platform && post.platform !== activeFilters.platform) {
        return false
      }
      
      // Tag filter
      if (activeFilters.tag && (!post.tags || !post.tags.includes(activeFilters.tag))) {
        return false
      }
      
      return true
    })
  }
  
  // Get unique platforms from posts
  const getPlatforms = () => {
    if (!pageData?.posts) return []
    
    return [...new Set(pageData.posts.map(post => post.platform))]
      .filter(Boolean)
      .sort()
  }
  
  // Get unique tags from posts
  const getTags = () => {
    if (!pageData?.posts) return []
    
    return [...new Set(pageData.posts.flatMap(post => post.tags || []))]
      .filter(Boolean)
      .sort()
  }
  
  // Get layout settings
  const getLayoutSettings = () => {
    return {
      backgroundColor: pageData?.bioSettings?.background_color || '#ffffff',
      textColor: pageData?.bioSettings?.text_color || '#000000',
      accentColor: pageData?.bioSettings?.accent_color || '#ec4899',
      font: pageData?.bioSettings?.font || 'Inter',
      layoutType: pageData?.bioSettings?.layout_type || 'grid'
    }
  }
  
  // Check if current user owns this bio page
  const isOwnProfile = user && pageData?.profile?.id === user.id
  
  // Check if should show social links
  const shouldShowSocialLinks = () => {
    return pageData?.bioSettings?.show_social_links !== false && pageData?.links.length > 0
  }
  
  // Check if should show content
  const shouldShowContent = () => {
    return pageData?.bioSettings?.show_aggregated_posts !== false && pageData?.posts.length > 0
  }
  
  // Apply filters with debounce
  const applyFilters = (filters) => {
    // Clear any existing timeout
    if (activeFilters.timeoutId) {
      clearTimeout(activeFilters.timeoutId);
    }
    
    // Set a new timeout for 300ms
    const timeoutId = setTimeout(() => {
      setActiveFilters({
        ...filters,
        timeoutId: null
      });
    }, 300);
    
    // Update state with the new timeout ID
    setActiveFilters({
      ...filters,
      timeoutId
    });
  }
  
  // Get filtered posts
  const filteredPosts = getFilteredPosts()

  // Get layout settings
  const layoutSettings = getLayoutSettings()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div 
          className="flex flex-col items-center justify-center h-screen"
          style={{ backgroundColor: layoutSettings.backgroundColor }}
        >
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading bio page...</p>
        </div>
      </div>
    )
  }
  
  if (notFound || error || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Bio Page Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {notFound 
              ? `@${username} doesn't exist or hasn't set up their bio page yet.`
              : `The bio page you're looking for is not available right now.`}
          </p>
          <Link
            to="/"
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors inline-block"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }
  
  // Check if bio page is not public
  if (pageData.bioSettings && !pageData.bioSettings.is_public && !isOwnProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Private Bio Page
          </h1>
          <p className="text-gray-600 mb-6">
            This bio page has been set to private by the owner.
          </p>
          <Link
            to="/"
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors inline-block"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className="min-h-screen pb-12"
      style={{ 
        backgroundColor: layoutSettings.backgroundColor,
        color: layoutSettings.textColor,
        fontFamily: layoutSettings.font + ', sans-serif'
      }}
    >
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{pageData.bioSettings?.title || `${pageData.profile.display_name || pageData.profile.username}'s Bio Page`}</title>
        <meta name="description" content={pageData.bioSettings?.description || pageData.profile.bio || `${pageData.profile.display_name || pageData.profile.username}'s bio page`} />
        {pageData.bioSettings?.seo_keywords && pageData.bioSettings.seo_keywords.length > 0 && (
          <meta name="keywords" content={pageData.bioSettings.seo_keywords.join(', ')} />
        )}
        <meta property="og:title" content={pageData.bioSettings?.title || `${pageData.profile.display_name || pageData.profile.username}'s Bio Page`} />
        <meta property="og:description" content={pageData.bioSettings?.description || pageData.profile.bio || `${pageData.profile.display_name || pageData.profile.username}'s bio page`} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="profile" />
        {pageData.profile.avatar_url && (
          <meta property="og:image" content={pageData.profile.avatar_url} />
        )}
      </Helmet>
      
      {/* Admin Edit Button (only visible to owner) */}
      {isOwnProfile && (
        <div className="fixed bottom-6 right-6 z-10">
          <Link
            to="/settings/social-aggregator"
            className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-opacity-80 transition-colors"
            style={{ backgroundColor: `${layoutSettings.accentColor}cc` }}
          >
            <FiEdit />
            <span>Edit Bio Page</span>
          </Link>
        </div>
      )}
      
      <div className="max-w-3xl mx-auto px-4">
        {/* Header Section */}
        <header className="pt-10 pb-6 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2"
            style={{ borderColor: layoutSettings.accentColor }}
          >
            <img 
              src={pageData.profile.avatar_url || '"https://placehold.co/300x200?text=No+Image"'} 
              alt={pageData.profile.display_name || pageData.profile.username} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = '"https://placehold.co/300x200?text=No+Image"'
              }}
            />
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-center items-center text-2xl font-bold mb-1"
            style={{ color: layoutSettings.textColor }}
          >
            {pageData.profile.display_name || pageData.profile.username}
            {pageData.profile.is_verified && (
              <span className="inline-block ml-2 w-5 h-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">✓</span>
            )}
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-base mb-4"
            style={{ color: `${layoutSettings.textColor}99` }}
          >
            @{pageData.profile.username}
          </motion.p>
          
          {pageData.profile.bio && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-md mx-auto text-base"
              style={{ color: layoutSettings.textColor }}
            >
              {pageData.profile.bio}
            </motion.p>
          )}
        </header>
        
        {/* Share Button */}
        <div className="flex justify-center mb-8">
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyLink}
            className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: `${layoutSettings.accentColor}20`,
              color: layoutSettings.accentColor
            }}
          >
            {copied ? (
              <>
                <FiCheck />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <FiShare2 />
                <span>Share This Page</span>
              </>
            )}
          </motion.button>
        </div>
        
        {/* Social Links */}
        {shouldShowSocialLinks() && (
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <h2 
              className="text-xl font-bold mb-4 text-center"
              style={{ color: layoutSettings.textColor }}
            >
              Connect With Me
            </h2>
            
            <div className="space-y-3">
              {pageData.links.map((link) => (
                <SocialLinkItem key={link.id} link={link} />
              ))}
            </div>
          </motion.section>
        )}
        
        {/* Content Section */}
        {shouldShowContent() && filteredPosts.length > 0 && (
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 
              className="text-xl font-bold mb-4 text-center"
              style={{ color: layoutSettings.textColor }}
            >
              My Content
            </h2>
            
            {/* Filter Controls */}
            {(getPlatforms().length > 0 || getTags().length > 0) && (
              <div 
                className="flex flex-wrap items-center justify-center gap-2 mb-6 p-3 rounded-lg"
                style={{ 
                  backgroundColor: `${layoutSettings.accentColor}10`,
                  maxWidth: '100%',
                  overflowX: 'auto'
                }}
              >
                {/* Platform Filter */}
                {getPlatforms().length > 0 && (
                  <div className="flex items-center space-x-1">
                    <select
                      value={activeFilters.platform}
                      onChange={(e) => applyFilters({ ...activeFilters, platform: e.target.value })}
                      className="text-sm border-none rounded-lg focus:outline-none focus:ring-2 px-2 py-1 min-w-[120px]"
                      style={{ 
                        backgroundColor: `${layoutSettings.accentColor}20`,
                        color: layoutSettings.accentColor
                      }}
                    >
                      <option value="">All Platforms</option>
                      {getPlatforms().map(platform => (
                        <option key={platform} value={platform}>
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Tag Filter */}
                {getTags().length > 0 && (
                  <div className="flex items-center space-x-1">
                    <select
                      value={activeFilters.tag}
                      onChange={(e) => applyFilters({ ...activeFilters, tag: e.target.value })}
                      className="text-sm border-none rounded-lg focus:outline-none focus:ring-2 px-2 py-1 min-w-[120px]"
                      style={{ 
                        backgroundColor: `${layoutSettings.accentColor}20`,
                        color: layoutSettings.accentColor
                      }}
                    >
                      <option value="">All Tags</option>
                      {getTags().map(tag => (
                        <option key={tag} value={tag}>
                          #{tag}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Clear Filters Button */}
                {(activeFilters.platform || activeFilters.tag) && (
                  <button
                    onClick={() => applyFilters({ platform: '', tag: '' })}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: `${layoutSettings.accentColor}40`,
                      color: layoutSettings.accentColor
                    }}
                  >
                    Clear Filters
                  </button>
                )}
                
                {/* Layout Toggle */}
                <div 
                  className="flex items-center space-x-1 rounded-lg overflow-hidden"
                  style={{ backgroundColor: `${layoutSettings.accentColor}20` }}
                >
                  <button
                    onClick={() => pageData.bioSettings.layout_type = 'grid'}
                    className={`p-2 ${
                      layoutSettings.layoutType === 'grid' 
                        ? '' 
                        : 'opacity-60'
                    }`}
                    style={{ 
                      backgroundColor: layoutSettings.layoutType === 'grid' 
                        ? layoutSettings.accentColor 
                        : 'transparent',
                      color: layoutSettings.layoutType === 'grid'
                        ? 'white'
                        : layoutSettings.accentColor
                    }}
                  >
                    <FiGrid />
                  </button>
                  <button
                    onClick={() => pageData.bioSettings.layout_type = 'list'}
                    className={`p-2 ${
                      layoutSettings.layoutType === 'list' 
                        ? '' 
                        : 'opacity-60'
                    }`}
                    style={{ 
                      backgroundColor: layoutSettings.layoutType === 'list' 
                        ? layoutSettings.accentColor 
                        : 'transparent',
                      color: layoutSettings.layoutType === 'list'
                        ? 'white'
                        : layoutSettings.accentColor
                    }}
                  >
                    <FiList />
                  </button>
                </div>
              </div>
            )}
            
            {/* Posts Grid/List */}
            {filteredPosts.length > 0 ? (
              layoutSettings.layoutType === 'grid' || window.innerWidth < 640 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredPosts.map((post) => (
                    <ContentGridItem key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <ContentListItem key={post.id} post={post} />
                  ))}
                </div>
              )
            ) : (
              <div 
                className="text-center py-12 rounded-lg border"
                style={{ 
                  borderColor: `${layoutSettings.accentColor}30`,
                  backgroundColor: `${layoutSettings.accentColor}05`,
                  maxWidth: '100vw',
                  overflowX: 'hidden'
                }}
              >
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ color: layoutSettings.textColor }}
                >
                  No content matches your filters
                </h3>
                <p style={{ color: `${layoutSettings.textColor}80` }}>
                  Try changing your filter selections
                </p>
              </div>
            )}
          </motion.section>
        )}
        
        {/* Footer */}
        <footer className="mt-8 md:mt-16 py-4 px-4 text-center text-sm" style={{ color: `${layoutSettings.textColor}60` }}>
          <div className="flex flex-wrap justify-center items-center gap-2">
            <Link to="/" className="hover:underline">Home</Link>
            <span>•</span>
            <span>
              &copy; {new Date().getFullYear()} {pageData.profile.display_name || pageData.profile.username}
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default BioPage