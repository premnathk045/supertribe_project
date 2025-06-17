import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiChevronLeft, FiChevronRight, FiHeart, FiSend, FiMoreHorizontal } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { useStories } from '../../hooks/useStories'
import { useStoryInteractions } from '../../hooks/useStoryInteractions'
import { useAuth } from '../../contexts/AuthContext'

function StoryViewer({ isOpen, storyGroup, onClose }) {
  const { user } = useAuth()
  const { markStoryAsViewed, toggleStoryLike } = useStories()
  const { addStoryReaction, shareStory } = useStoryInteractions()
  
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showReactions, setShowReactions] = useState(false)

  const currentStory = storyGroup?.stories[currentStoryIndex]
  const totalStories = storyGroup?.stories.length || 0

  useEffect(() => {
    if (!isOpen || !currentStory) return

    // Mark story as viewed
    if (user && !currentStory.isViewed) {
      markStoryAsViewed(currentStory.id)
    }

    setProgress(0)
  }, [isOpen, currentStory, user, markStoryAsViewed])

  useEffect(() => {
    if (!isOpen || isPaused) return

    const duration = currentStory?.duration || 5000 // 5 seconds default
    const interval = 50 // Update every 50ms
    const increment = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Auto advance to next story
          if (currentStoryIndex < totalStories - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1)
            return 0
          } else {
            onClose()
            return 0
          }
        }
        return prev + increment
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isOpen, currentStoryIndex, totalStories, isPaused, currentStory, onClose])

  const goToPrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1)
      setProgress(0)
    }
  }

  const goToNext = () => {
    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }

  const handleLike = async () => {
    if (!user || !currentStory) return
    
    try {
      await toggleStoryLike(currentStory.id, currentStory.isLiked)
    } catch (error) {
      console.error('Error liking story:', error)
    }
  }

  const handleReaction = async (emoji) => {
    if (!user || !currentStory) return
    
    try {
      await addStoryReaction(currentStory.id, emoji)
      setShowReactions(false)
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  const handleShare = async () => {
    if (!user || !currentStory) return
    
    try {
      await shareStory(currentStory.id)
    } catch (error) {
      console.error('Error sharing story:', error)
    }
  }

  const getStoryContent = () => {
    if (!currentStory) return null

    switch (currentStory.content_type) {
      case 'photo':
        return (
          <img
            src={currentStory.media_url}
            alt="Story"
            className="w-full h-full object-cover"
          />
        )
      case 'video':
        return (
          <video
            src={currentStory.media_url}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
            onPlay={() => setIsPaused(false)}
            onPause={() => setIsPaused(true)}
          />
        )
      case 'text':
        return (
          <div 
            className="w-full h-full flex items-center justify-center p-8"
            style={currentStory.background_style || { backgroundColor: '#000000' }}
          >
            <div
              className="text-center max-w-md"
              style={currentStory.text_style || { color: '#ffffff', fontSize: '24px' }}
            >
              {currentStory.text_content}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (!isOpen || !storyGroup || !currentStory) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="relative w-full max-w-sm h-full max-h-screen bg-black"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bars */}
          <div className="absolute top-4 left-4 right-4 z-10 flex space-x-1">
            {storyGroup.stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-100"
                  style={{
                    width: index === currentStoryIndex 
                      ? `${progress}%` 
                      : index < currentStoryIndex 
                      ? '100%' 
                      : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={storyGroup.user.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40'}
                alt={storyGroup.user.display_name}
                className="w-8 h-8 rounded-full object-cover border-2 border-white"
              />
              <div>
                <h3 className="text-white font-semibold text-sm flex items-center space-x-1">
                  <span>{storyGroup.user.display_name}</span>
                  {storyGroup.user.is_verified && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </h3>
                <p className="text-white/70 text-xs">
                  {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <span className="text-white text-xs">
                  {isPaused ? '▶️' : '⏸️'}
                </span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX className="text-white text-xl" />
              </button>
            </div>
          </div>

          {/* Story Content */}
          <div className="w-full h-full flex items-center justify-center">
            {getStoryContent()}
          </div>

          {/* Caption */}
          {currentStory.caption && (
            <div className="absolute bottom-20 left-4 right-4 z-10">
              <p className="text-white text-sm bg-black/50 backdrop-blur-sm rounded-lg p-3">
                {currentStory.caption}
              </p>
            </div>
          )}

          {/* Navigation Areas */}
          <button
            className="absolute left-0 top-0 w-1/3 h-full z-10"
            onClick={goToPrevious}
          />
          <button
            className="absolute right-0 top-0 w-1/3 h-full z-10"
            onClick={goToNext}
          />

          {/* Bottom Actions */}
          {user && (
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    className={`p-2 rounded-full transition-colors ${
                      currentStory.isLiked ? 'text-red-500' : 'text-white'
                    }`}
                  >
                    <FiHeart className={`text-xl ${currentStory.isLiked ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={() => setShowReactions(!showReactions)}
                    className="p-2 text-white rounded-full transition-colors"
                  >
                    😊
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-2 text-white rounded-full transition-colors"
                  >
                    <FiSend className="text-xl" />
                  </button>
                </div>
                
                <button className="p-2 text-white rounded-full transition-colors">
                  <FiMoreHorizontal className="text-xl" />
                </button>
              </div>

              {/* Reaction Picker */}
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-black/80 backdrop-blur-sm rounded-full p-2 flex space-x-2"
                >
                  {['❤️', '😂', '😮', '😢', '😡', '👍'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors text-xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStoryIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full"
            >
              <FiChevronLeft className="text-xl" />
            </button>
          )}
          
          {currentStoryIndex < totalStories - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full"
            >
              <FiChevronRight className="text-xl" />
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default StoryViewer