import { useRef } from 'react'
import { motion } from 'framer-motion'
import { FiPlus } from 'react-icons/fi'
import { stories } from '../../data/dummyData'

function StoriesCarousel({ onStoryClick, onCreateStory }) {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 100
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="py-4">
      <div className="max-w-lg mx-auto px-4">
        <div 
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide"
        >
          {/* Add Story Button */}
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

          {/* Stories */}
          {stories.map((story) => (
            <motion.div
              key={story.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStoryClick(story)}
              className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer"
            >
              <div className={`story-ring ${story.isViewed ? 'opacity-50' : ''}`}>
                <div className="story-inner">
                  <img
                    src={story.user.avatar}
                    alt={story.user.displayName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs text-gray-700 font-medium truncate w-16 text-center">
                {story.user.username}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StoriesCarousel