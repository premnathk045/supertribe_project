import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/UI/LoadingSpinner'

// Import Profile components
import ProfileHeader from '../components/Profile/Header/ProfileHeader'
import StoryHighlights from '../components/Profile/Stories/StoryHighlights'
import Bio from '../components/Profile/Bio'
import ContentTabs from '../components/Profile/Content/ContentTabs'
import ContentGrid from '../components/Profile/Content/ContentGrid'
import ViewProfileActions from '../components/Profile/Actions/ViewProfileActions'

// Import hook for story highlights
import useStoryHighlights from '../hooks/useStoryHighlights'

function ProfileView() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // State
  const [profileData, setProfileData] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [profileStats, setProfileStats] = useState({
    postCount: 0,
    followerCount: 0,
    followingCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('posts')
  const [isFollowing, setIsFollowing] = useState(false)
  
  // Get story highlights data (view-only)
  const { 
    highlights, 
    loading: highlightsLoading, 
    error: highlightsError
  } = useStoryHighlights(profileData?.id)

  // Fetch profile data
  useEffect(() => {
    if (username) {
      fetchProfileData()
    }
  }, [username])

  // Fetch posts when profile data is loaded
  useEffect(() => {
    if (profileData) {
      fetchUserContent()
    }
  }, [profileData])
  
  // Check if following
  useEffect(() => {
    if (user && profileData) {
      checkFollowStatus()
    }
  }, [user, profileData])

  // Fetch profile data from Supabase
  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          setError('Profile not found')
        } else {
          setError('Failed to load profile')
        }
        console.error('Error fetching profile:', profileError)
        return
      }
      
      // Check if this is our own profile
      if (user && profile.id === user.id) {
        navigate(`/profile/${profile.username}`)
        return
      }

      setProfileData(profile)

      // Fetch profile stats
      fetchProfileStats(profile.id)

    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch profile stats
  const fetchProfileStats = async (profileId) => {
    try {
      // Fetch post count
      const { data: postsData, error: postsCountError } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profileId)
        .eq('status', 'published')
      
      // Fetch follower count (placeholder - would use a real followers table)
      const followerCount = Math.floor(Math.random() * 10000)
      
      // Fetch following count (placeholder - would use a real following table)
      const followingCount = Math.floor(Math.random() * 1000)
      
      setProfileStats({
        postCount: postsCountError ? 0 : postsData?.length || 0,
        followerCount,
        followingCount
      })
    } catch (error) {
      console.error('Error fetching profile stats:', error)
    }
  }

  // Fetch user content
  const fetchUserContent = async () => {
    setContentLoading(true)
    
    try {
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profileData.id)
        .eq('status', 'published')
        .eq('is_premium', false) // Only show public posts in view
        .order('created_at', { ascending: false })
        
      if (postsError) throw postsError
      setUserPosts(postsData || [])
      
      // Update post count in stats
      setProfileStats(prev => ({ 
        ...prev, 
        postCount: postsData?.length || 0 
      }))
    } catch (err) {
      console.error('Error fetching user content:', err)
      // Don't set error state here to avoid blocking the UI
    } finally {
      setContentLoading(false)
    }
  }
  
  // Check if current user follows the profile
  const checkFollowStatus = async () => {
    // This is a placeholder - you would check a real followers table
    // In this example, we'll simulate a 30% chance of following
    setIsFollowing(Math.random() < 0.3)
  }
  
  // Toggle follow status
  const handleToggleFollow = async () => {
    if (!user) {
      navigate('/?auth=signin')
      return
    }
    
    try {
      // Update local state first (optimistic update)
      setIsFollowing(prev => !prev)
      setProfileStats(prev => ({
        ...prev,
        followerCount: prev.followerCount + (isFollowing ? -1 : 1)
      }))
      
      // Here you would call your API to update the following status
      // For demonstration, we'll simulate API call
      const success = await new Promise((resolve) => {
        setTimeout(() => resolve(true), 500)
      })
      
      if (!success) {
        // If API call fails, revert state
        setIsFollowing(prev => !prev)
        setProfileStats(prev => ({
          ...prev,
          followerCount: prev.followerCount + (isFollowing ? 1 : -1)
        }))
      }
    } catch (error) {
      // If error occurs, revert state
      setIsFollowing(prev => !prev)
      setProfileStats(prev => ({
        ...prev,
        followerCount: prev.followerCount + (isFollowing ? 1 : -1)
      }))
      console.error('Error toggling follow status:', error)
    }
  }
  
  // Handle view highlight
  const handleViewHighlight = (highlight) => {
    // Here you would show a story viewer modal with the highlight stories
    console.log('View highlight:', highlight)
    // For now, just a placeholder
    alert(`Viewing highlight: ${highlight.title}`)
  }
  
  // Handle sending message
  const handleSendMessage = async () => {
    if (!user) {
      navigate('/?auth=signin')
      return
    }
    
    try {
      // Navigate to messages page
      navigate('/messages')
      
      // You would typically pass the profile ID or some context to the messages page
      // For now, this just navigates
    } catch (error) {
      console.error('Error navigating to messages:', error)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error}
          </h1>
          <p className="text-gray-600 mb-6">
            The profile you're looking for doesn't exist or couldn't be loaded.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // No profile data
  if (!profileData) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Back button header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="ml-4 font-semibold">@{profileData.username}</h1>
        </div>
      </div>
    
      <div className="max-w-lg mx-auto">
        {/* Profile Content */}
        <div className="bg-white border-b border-gray-200">
          <div className="p-6">
            {/* Profile Header and Stats */}
            <ProfileHeader 
              profileData={profileData}
              isOwnProfile={false}
              isEditing={false}
              stats={profileStats}
            />
            
            {/* Bio */}
            <Bio bio={profileData.bio} />
            
            {/* Profile Actions (Follow, Message) */}
            <ViewProfileActions
              isFollowing={isFollowing}
              onToggleFollow={handleToggleFollow}
              onSendMessage={handleSendMessage}
            />
            
            {/* Story Highlights */}
            {highlights && highlights.length > 0 && (
              <StoryHighlights 
                highlights={highlights} 
                isEditable={false}
                onViewHighlight={handleViewHighlight}
              />
            )}
            
            {/* Content Tabs (only Posts tab for view mode) */}
            <div className="flex border-t border-gray-200">
              <button
                className="flex-1 py-3 flex items-center justify-center space-x-2 border-b-2 border-primary-500 text-primary-500"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span className="font-medium">Posts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid (Posts only) */}
        <div className="p-4">
          <ContentGrid 
            activeTab="posts"
            posts={[userPosts, [], []]}
            loading={contentLoading}
            error={null}
            onPostClick={(post) => console.log('Post clicked:', post)}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default ProfileView