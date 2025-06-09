import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FiHeart, 
  FiMessageCircle, 
  FiShare, 
  FiBookmark, 
  FiMoreHorizontal,
  FiLock 
} from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import MediaCarousel from '../Media/MediaCarousel'

function PostCard({ post, onLike, onSave, onComment, onShare, onClick }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  return (
    <motion.article 
      className="bg-white post-shadow border border-gray-100 overflow-hidden"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.user.avatar}
            alt={post.user.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center space-x-1">
              <h3 className="font-semibold text-gray-900">{post.user.displayName}</h3>
              {post.user.isVerified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              {post.user.isPremium && (
                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <FiMoreHorizontal className="text-gray-600" />
        </button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-gray-900 leading-relaxed">{post.content}</p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-primary-500 text-sm hover:underline cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Media */}
      <div className="relative">
        {post.isPremium && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center text-white">
              <FiLock className="text-3xl mx-auto mb-2" />
              <p className="font-semibold">Premium Content</p>
              <p className="text-sm opacity-90">${post.price}</p>
              <button className="mt-3 bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors">
                Unlock
              </button>
            </div>
          </div>
        )}
        
        <MediaCarousel
          media={post.media}
          currentIndex={currentMediaIndex}
          onIndexChange={setCurrentMediaIndex}
          onClick={() => !post.isPremium && onClick()}
        />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onLike}
              className={`flex items-center space-x-1 ${
                post.isLiked ? 'text-red-500' : 'text-gray-700'
              } hover:text-red-500 transition-colors`}
            >
              <FiHeart 
                className={`text-xl ${post.isLiked ? 'fill-current animate-heart' : ''}`} 
              />
              <span className="font-medium">{post.likeCount}</span>
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onComment}
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-500 transition-colors"
            >
              <FiMessageCircle className="text-xl" />
              <span className="font-medium">{post.commentCount}</span>
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onShare}
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-500 transition-colors"
            >
              <FiShare className="text-xl" />
              <span className="font-medium">{post.shareCount}</span>
            </motion.button>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onSave}
            className={`${
              post.isSaved ? 'text-primary-500' : 'text-gray-700'
            } hover:text-primary-500 transition-colors`}
          >
            <FiBookmark className={`text-xl ${post.isSaved ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}

export default PostCard