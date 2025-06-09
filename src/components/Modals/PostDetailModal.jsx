import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiHeart, FiMessageCircle, FiShare, FiBookmark, FiSend } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import MediaCarousel from '../Media/MediaCarousel'

function PostDetailModal({ isOpen, post, onClose, onShare }) {
  const [comment, setComment] = useState('')
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  if (!post) return null

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (comment.trim()) {
      // Handle comment submission
      console.log('Comment submitted:', comment)
      setComment('')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-lg max-h-[90vh] bg-white rounded-3xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
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
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Media */}
              <MediaCarousel
                media={post.media}
                currentIndex={currentMediaIndex}
                onIndexChange={setCurrentMediaIndex}
              />

              {/* Post Content */}
              <div className="p-4">
                <p className="text-gray-900 leading-relaxed mb-3">{post.content}</p>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
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

                {/* Actions */}
                <div className="flex items-center justify-between py-3 border-y border-gray-200">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-1 text-gray-700 hover:text-red-500 transition-colors">
                      <FiHeart className="text-xl" />
                      <span className="font-medium">{post.likeCount}</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 text-gray-700 hover:text-primary-500 transition-colors">
                      <FiMessageCircle className="text-xl" />
                      <span className="font-medium">{post.commentCount}</span>
                    </button>
                    
                    <button 
                      onClick={onShare}
                      className="flex items-center space-x-1 text-gray-700 hover:text-primary-500 transition-colors"
                    >
                      <FiShare className="text-xl" />
                      <span className="font-medium">{post.shareCount}</span>
                    </button>
                  </div>
                  
                  <button className="text-gray-700 hover:text-primary-500 transition-colors">
                    <FiBookmark className="text-xl" />
                  </button>
                </div>

                {/* Comments Section */}
                <div className="space-y-4 mt-4">
                  <h4 className="font-semibold text-gray-900">Comments</h4>
                  
                  {/* Sample Comments */}
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <img
                        src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=50"
                        alt="Commenter"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="font-medium text-sm">Sarah Wilson</p>
                          <p className="text-gray-700">Amazing work! Love the colors.</p>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">2h ago</span>
                          <button className="text-xs text-gray-500 hover:text-primary-500">Like</button>
                          <button className="text-xs text-gray-500 hover:text-primary-500">Reply</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSubmitComment} className="flex items-center space-x-3">
                <img
                  src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50"
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full pl-4 pr-12 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim()}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-primary-500 disabled:text-gray-400 transition-colors"
                  >
                    <FiSend className="text-lg" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PostDetailModal