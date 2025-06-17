import { useRef } from 'react'
import { motion } from 'framer-motion'
import { FiPlus } from 'react-icons/fi'
import { useStories } from '../../hooks/useStories'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../UI/LoadingSpinner'

function StoriesCarousel({ onStoryClick, onCreateStory }) {
  const scrollRef = useRef(null)
  const { stories, loading, error } = useStories()
  const { isCreator } = useAuth()

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 100
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (loading) {
    return (
      <div className="py-4">
        <div className="max-w-lg mx-auto px-4 flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4">
        <div className="max-w-lg mx-auto px-4 text-center">
          <p className="text-red-500 text-sm">Failed to load stories</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="max-w-lg mx-auto px-4">
        <div 
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide"
        >
          {/* Add Story Button - Only for creators */}
          {isCreator() && (
            <motion.div
              whileTap={{ scale: 0.95 }}
              onClick={onCreateStory}
              className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors">
                <FiPlus className="text-gray-500 text-xl" />
              </div>
              <span className="text-xs text-gray-600 font-medium">Your Story</span>
            </motion.div>
          )}

          {/* Stories */}
          {stories.map((storyGroup, index) => (
            <motion.div
              key={storyGroup.user.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStoryClick(storyGroup)}
              className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer"
            >
              <div className={`story-ring ${!storyGroup.hasUnviewed ? 'opacity-50' : ''}`}>
                <div className="story-inner">
                  <img
                    src={storyGroup.user.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                    alt={storyGroup.user.display_name}
                    className="w-14 h-14 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
                    }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-700 font-medium truncate w-16 text-center">
                {storyGroup.user.username}
              </span>
              
              {/* Story count indicator */}
              {storyGroup.stories.length > 1 && (
                <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {storyGroup.stories.length}
                </div>
              )}
            </motion.div>
          ))}

          {/* Empty state */}
          {stories.length === 0 && (
            <div className="flex-1 text-center py-8">
              <div className="text-4xl mb-2">📖</div>
              <p className="text-gray-500 text-sm">No stories yet</p>
              {isCreator() && (
                <p className="text-gray-400 text-xs mt-1">Be the first to share a story!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StoriesCarousel