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

  // Prepare media array: preview video (if exists) first, then media_urls
  let media = []
  if (post.preview_video_url) {
    media.push({
      type: 'video',
      url: post.preview_video_url,
      thumbnail: '', // Optionally add thumbnail if you have it
      isPreview: true,
      description: "Preview video"
    })
  }
  if (Array.isArray(post.media_urls)) {
    post.media_urls.forEach((url) => {
      // Guess type by extension
      const ext = url.split('.').pop().toLowerCase()
      media.push({
        type: ext === 'mp4' || ext === 'webm' ? 'video' : 'image',
        url,
        thumbnail: url, 
        isPreview: false,
        description: `${post.user?.displayName || post.profiles?.display_name || ''}'s post`
      })
    })
  }
  
  // If no media, create an empty array to avoid errors
  if (media.length === 0) {
    media = [{
      type: 'image',
      url: 'https://images.pexels.com/photos/1149831/pexels-photo-1149831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      thumbnail: '',
      isPreview: false,
      description: "Placeholder image"
    }]
  }

  // Determine if current media is preview (should not be blurred/locked)
  const isCurrentPreview = media[currentMediaIndex]?.isPreview

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
            src={post.user?.avatar || post.profiles?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40'}
            alt={post.user?.displayName || post.profiles?.display_name || 'User'}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center space-x-1">
              <h3 className="font-semibold text-gray-900">{post.user?.displayName || post.profiles?.display_name || post.user?.username || post.profiles?.username || 'Unknown'}</h3>
              {(post.user?.isVerified || post.profiles?.is_verified) && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt || post.created_at), { addSuffix: true })}
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
        {/* Blur and unlock only if premium, not preview, and not unlocked */}
        {post.is_premium && !isCurrentPreview && (
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

        {/* Only allow click if not premium or is preview */}
        {/* onClick will only trigger if not premium or is preview */}
        <MediaCarousel
          media={media}
          currentIndex={currentMediaIndex}
          onIndexChange={setCurrentMediaIndex}
          onClick={() => (!post.is_premium || isCurrentPreview) && onClick()}
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
              <span className="font-medium">{post.likeCount ?? post.like_count ?? 0}</span>
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onComment}
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-500 transition-colors"
            >
              <FiMessageCircle className="text-xl" />
              <span className="font-medium">{post.commentCount ?? post.comment_count ?? 0}</span>
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onShare}
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-500 transition-colors"
            >
              <FiShare className="text-xl" />
              <span className="font-medium">{post.shareCount ?? post.share_count ?? 0}</span>
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