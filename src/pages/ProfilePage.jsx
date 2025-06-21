import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiSettings, 
  FiUserPlus, 
  FiMessageCircle, 
  FiGrid, 
  FiBookmark,
  FiHeart,
  FiMoreHorizontal,
  FiEdit3,
  FiSave,
  FiX,
  FiCamera
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { validateUsername } from '../utils/validation'

function ProfilePage() {
  const { username } = useParams()
  const { user, userProfile, updateUserProfile } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [savedPosts, setSavedPosts] = useState([])
  const [likedPosts, setLikedPosts] = useState([])
  const [profileStats, setProfileStats] = useState({
    postCount: 0,
    followerCount: 0,
    followingCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: ''
  })
  const [editErrors, setEditErrors] = useState({})

  const isOwnProfile = user && profileData && user.id === profileData.id

  useEffect(() => {
    if (username) {
      fetchProfileData()
    }
  }, [username])

  useEffect(() => {
    if (!profileData) return;
    // Fetch posts for the user
    const fetchUserPosts = async () => {
      setLoading(true)
      setError(null)
      try {
        // User's own posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false })
        if (postsError) throw postsError
        setUserPosts(postsData || [])
        // Saved posts
        const { data: savesData, error: savesError } = await supabase
          .from('post_saves')
          .select('post_id, posts:post_id(*)')
          .eq('user_id', profileData.id)
        if (savesError) throw savesError
        setSavedPosts((savesData || []).map(s => s.posts).filter(Boolean))
        // Liked posts
        const { data: likesData, error: likesError } = await supabase
          .from('post_likes')
          .select('post_id, posts:post_id(*)')
          .eq('user_id', profileData.id)
        if (likesError) throw likesError
        setLikedPosts((likesData || []).map(l => l.posts).filter(Boolean))
      } catch (err) {
        setError(err.message || 'Failed to load posts')
      } finally {
        setLoading(false)
      }
    }
    fetchUserPosts()
  }, [profileData])

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

      setProfileData(profile)
      
      // Initialize edit form with current data
      setEditForm({
        username: profile.username || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        website: profile.website || '',
        email: profile.email || '',
        phone: profile.phone || '',
        gender: profile.gender || '',
        is_private: profile.is_private || false
      })

    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const validateEditForm = () => {
    const errors = {}

    // Username validation
    if (!editForm.username.trim()) {
      errors.username = 'Username is required'
    } else if (!validateUsername(editForm.username)) {
      errors.username = 'Username must be 3-20 characters, letters, numbers, and underscores only'
    }

    // Display name validation
    if (!editForm.display_name.trim()) {
      errors.display_name = 'Display name is required'
    } else if (editForm.display_name.length < 2) {
      errors.display_name = 'Display name must be at least 2 characters'
    }

    // Bio validation
    if (editForm.bio && editForm.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters'
    }

    // Avatar URL validation (basic)
    if (editForm.avatar_url && editForm.avatar_url.trim()) {
      try {
        new URL(editForm.avatar_url)
        // Basic image URL validation
        if (!editForm.avatar_url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          errors.avatar_url = 'Avatar URL must be a valid image URL'
        }
      } catch {
        errors.avatar_url = 'Please enter a valid URL'
      }
    }

    setEditErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleEditInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (editErrors[field]) {
      setEditErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSaveProfile = async () => {
    if (!validateEditForm()) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Check if username is already taken (if changed)
      if (editForm.username !== profileData.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', editForm.username)
          .single()

        if (existingUser) {
          setEditErrors({ username: 'Username is already taken' })
          setSaving(false)
          return
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: editForm.username,
          display_name: editForm.display_name,
          bio: editForm.bio,
          avatar_url: editForm.avatar_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        setError('Failed to update profile')
        return
      }

      // Update local state
      setProfileData(data)
      setIsEditing(false)

      // Update auth context if this is the current user's profile
      if (isOwnProfile) {
        await updateUserProfile({
          username: data.username,
          display_name: data.display_name,
          bio: data.bio,
          avatar_url: data.avatar_url
        })
      }

    } catch (error) {
      console.error('Error updating profile:', error)
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditErrors({})
    // Reset form to original data
    setEditForm({
      username: profileData.username || '',
      display_name: profileData.display_name || '',
      bio: profileData.bio || '',
      avatar_url: profileData.avatar_url || '',
      website: profileData.website || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      gender: profileData.gender || '',
      is_private: profileData.is_private || false
    })
  }

  const tabs = [
    { id: 'posts', label: 'Posts', icon: FiGrid },
    { id: 'saved', label: 'Saved', icon: FiBookmark },
    { id: 'liked', label: 'Liked', icon: FiHeart }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

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
            onClick={() => window.history.back()}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

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
      <div className="max-w-lg mx-auto">
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-4 mt-4"
          >
            {error}
          </motion.div>
        )}

        {/* Profile Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="p-6">
            {/* Avatar and Stats */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                {isEditing ? (
                  <div className="relative group">
                    <img
                      src={editForm.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                      alt={editForm.display_name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.target.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                      <div className="bg-white/90 rounded-full p-2">
                        <FiCamera className="text-gray-700 text-lg" />
                      </div>
                    </div>
                    <button className="absolute -bottom-1 -right-1 bg-primary-500 hover:bg-primary-600 text-white rounded-full p-2 shadow-lg transition-colors duration-200">
                      <FiEdit3 className="text-sm" />
                    </button>
                  </div>
                ) : (
                  <img
                    src={profileData.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                    alt={profileData.display_name}
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
                    }}
                  />
                )}
                {profileData.user_type === 'creator' && profileData.is_verified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 border-3 border-white rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="text-sm text-gray-600">
                    <p>Edit your profile information below</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-xl font-bold text-gray-900">{profileData.display_name}</h1>
                      {profileData.user_type === 'creator' && profileData.is_verified && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">@{profileData.username}</p>
                  </div>
                )}
                
                <div className="flex space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{profileStats.postCount}</div>
                    <div className="text-gray-600">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{profileStats.followerCount}</div>
                    <div className="text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{profileStats.followingCount}</div>
                    <div className="text-gray-600">Following</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {isEditing ? (
              <div className="space-y-6 mb-8">
                {/* Profile Information Section */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                  
                  {/* Username Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => handleEditInputChange('username', e.target.value.toLowerCase())}
                        className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                          editErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        placeholder="username"
                      />
                    </div>
                    {editErrors.username && (
                      <p className="text-red-500 text-xs mt-1">{editErrors.username}</p>
                    )}
                  </div>

                  {/* Display Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editForm.display_name}
                      onChange={(e) => handleEditInputChange('display_name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        editErrors.display_name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Your display name"
                    />
                    {editErrors.display_name && (
                      <p className="text-red-500 text-xs mt-1">{editErrors.display_name}</p>
                    )}
                  </div>

                  {/* Bio Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => handleEditInputChange('bio', e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none ${
                        editErrors.bio ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Tell people about yourself..."
                    />
                    <div className="flex justify-between items-center mt-2">
                      {editErrors.bio ? (
                        <p className="text-red-500 text-xs">{editErrors.bio}</p>
                      ) : (
                        <div></div>
                      )}
                      <p className={`text-xs ${editForm.bio.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                        {editForm.bio.length}/500
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Contact Information Section */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  
                  {/* Website Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={editForm.website || ''}
                      onChange={(e) => handleEditInputChange('website', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 hover:border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => handleEditInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 hover:border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                    />
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => handleEditInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 hover:border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Avatar URL Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Photo URL
                    </label>
                    <input
                      type="url"
                      value={editForm.avatar_url}
                      onChange={(e) => handleEditInputChange('avatar_url', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        editErrors.avatar_url ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    {editErrors.avatar_url && (
                      <p className="text-red-500 text-xs mt-1">{editErrors.avatar_url}</p>
                    )}
                  </div>
                </div>

                {/* Personal Information Section */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  
                  {/* Gender Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={editForm.gender || ''}
                      onChange={(e) => handleEditInputChange('gender', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 hover:border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Privacy Settings Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                  
                  {/* Private Account Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Private Account</h4>
                      <p className="text-sm text-gray-600">When your account is private, only people you approve can see your posts</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEditInputChange('is_private', !editForm.is_private)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        editForm.is_private ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          editForm.is_private ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-gray-900 leading-relaxed">
                  {profileData.bio || 'No bio available.'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {isOwnProfile ? (
                isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:shadow-md"
                    >
                      {saving ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <FiSave className="text-lg" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-900 py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-300"
                    >
                      <FiX className="text-lg" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-300"
                  >
                    <FiEdit3 className="text-lg" />
                    <span>Edit Profile</span>
                  </button>
                )
              ) : (
                <>
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                      isFollowing
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        : 'bg-primary-500 hover:bg-primary-600 text-white'
                    }`}
                  >
                    <FiUserPlus className="text-lg" />
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>
                  
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                    <FiMessageCircle className="text-lg" />
                    <span>Message</span>
                  </button>
                  
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 p-2 rounded-lg transition-colors">
                    <FiMoreHorizontal className="text-lg" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          {!isEditing && (
            <div className="flex border-t border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-500'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="text-lg" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        {!isEditing && (
          <div className="p-4">
            {activeTab === 'posts' && userPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {userPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer"
                  >
                    {post.media_urls && post.media_urls.length > 0 ? (
                      <img
                        src={post.media_urls[0]}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex items-center space-x-4 text-white">
                        <div className="flex items-center space-x-1">
                          <FiHeart className="fill-current" />
                          <span className="font-medium">{post.like_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiMessageCircle />
                          <span className="font-medium">{post.comment_count || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Premium indicator */}
                    {post.is_premium && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                        Premium
                      </div>
                    )}

                    {/* Multiple media indicator */}
                    {post.media_urls && post.media_urls.length > 1 && (
                      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        1/{post.media_urls.length}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : activeTab === 'saved' && savedPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {savedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer"
                  >
                    {post.media_urls && post.media_urls.length > 0 ? (
                      <img
                        src={post.media_urls[0]}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex items-center space-x-4 text-white">
                        <div className="flex items-center space-x-1">
                          <FiHeart className="fill-current" />
                          <span className="font-medium">{post.like_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiMessageCircle />
                          <span className="font-medium">{post.comment_count || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Premium indicator */}
                    {post.is_premium && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                        Premium
                      </div>
                    )}

                    {/* Multiple media indicator */}
                    {post.media_urls && post.media_urls.length > 1 && (
                      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        1/{post.media_urls.length}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : activeTab === 'liked' && likedPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {likedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer"
                  >
                    {post.media_urls && post.media_urls.length > 0 ? (
                      <img
                        src={post.media_urls[0]}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex items-center space-x-4 text-white">
                        <div className="flex items-center space-x-1">
                          <FiHeart className="fill-current" />
                          <span className="font-medium">{post.like_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiMessageCircle />
                          <span className="font-medium">{post.comment_count || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Premium indicator */}
                    {post.is_premium && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                        Premium
                      </div>
                    )}

                    {/* Multiple media indicator */}
                    {post.media_urls && post.media_urls.length > 1 && (
                      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        1/{post.media_urls.length}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">
                  {activeTab === 'posts' ? '📝' : activeTab === 'saved' ? '🔖' : '❤️'}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No {activeTab} yet
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'posts' 
                    ? 'Posts will appear here when they\'re created'
                    : activeTab === 'saved' 
                    ? 'Saved posts will appear here'
                    : 'Liked posts will appear here'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ProfilePage