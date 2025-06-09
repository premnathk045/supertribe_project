import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiSettings, 
  FiUserPlus, 
  FiMessageCircle, 
  FiGrid, 
  FiBookmark,
  FiHeart,
  FiMoreHorizontal
} from 'react-icons/fi'
import { users, posts } from '../data/dummyData'

function ProfilePage() {
  const { username } = useParams()
  const [activeTab, setActiveTab] = useState('posts')
  const [isFollowing, setIsFollowing] = useState(false)
  
  // Find user by username
  const user = users.find(u => u.username === username) || users[0]
  const userPosts = posts.filter(post => post.user.username === username)

  const tabs = [
    { id: 'posts', label: 'Posts', icon: FiGrid },
    { id: 'saved', label: 'Saved', icon: FiBookmark },
    { id: 'liked', label: 'Liked', icon: FiHeart }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-lg mx-auto">
        {/* Profile Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="p-6">
            {/* Avatar and Stats */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-20 h-20 rounded-full object-cover"
                />
                {user.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-xl font-bold text-gray-900">{user.displayName}</h1>
                  {user.isVerified && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  {user.isPremium && (
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  )}
                </div>
                <p className="text-gray-600 mb-3">@{user.username}</p>
                
                <div className="flex space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{user.postCount}</div>
                    <div className="text-gray-600">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{user.followerCount.toLocaleString()}</div>
                    <div className="text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{user.followingCount}</div>
                    <div className="text-gray-600">Following</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-gray-900 mb-6 leading-relaxed">{user.bio}</p>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {username === 'johndoe' ? (
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <FiSettings className="text-lg" />
                  <span>Edit Profile</span>
                </button>
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

          {/* Highlights */}
          <div className="px-6 pb-4">
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
              <div className="flex flex-col items-center space-y-2 flex-shrink-0">
                <div className="w-16 h-16 bg-gray-200 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-2xl">+</span>
                </div>
                <span className="text-xs text-gray-600">New</span>
              </div>
              
              {[1, 2, 3].map((highlight) => (
                <div key={highlight} className="flex flex-col items-center space-y-2 flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-0.5">
                    <div className="w-full h-full bg-white rounded-full p-0.5">
                      <img
                        src={`https://images.pexels.com/photos/${1000000 + highlight}/pexels-photo-${1000000 + highlight}.jpeg?auto=compress&cs=tinysrgb&w=100`}
                        alt={`Highlight ${highlight}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">Story {highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
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
        </div>

        {/* Content Grid */}
        <div className="p-4">
          {activeTab === 'posts' && (
            <div className="grid grid-cols-3 gap-1">
              {userPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer"
                >
                  <img
                    src={post.media[0]?.url}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center space-x-4 text-white">
                      <div className="flex items-center space-x-1">
                        <FiHeart className="fill-current" />
                        <span className="font-medium">{post.likeCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiMessageCircle />
                        <span className="font-medium">{post.commentCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Premium indicator */}
                  {post.isPremium && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                      Premium
                    </div>
                  )}

                  {/* Multiple media indicator */}
                  {post.media.length > 1 && (
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      1/{post.media.length}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {(activeTab === 'saved' || activeTab === 'liked') && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {activeTab === 'saved' ? '🔖' : '❤️'}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {activeTab} posts yet
              </h3>
              <p className="text-gray-600">
                {activeTab === 'saved' 
                  ? 'Posts you save will appear here'
                  : 'Posts you like will appear here'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProfilePage