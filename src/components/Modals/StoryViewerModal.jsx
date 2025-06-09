import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { stories } from '../../data/dummyData'

function StoryViewerModal({ isOpen, story, onClose }) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isOpen || !story) return

    const storyIndex = stories.findIndex(s => s.id === story.id)
    setCurrentStoryIndex(storyIndex)
    setProgress(0)
  }, [isOpen, story])

  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Auto advance to next story
          if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1)
            return 0
          } else {
            onClose()
            return 0
          }
        }
        return prev + 2 // 5 second duration (100 / 2 = 50 intervals)
      })
    }, 100)

    return () => clearInterval(timer)
  }, [isOpen, currentStoryIndex, onClose])

  const currentStory = stories[currentStoryIndex]

  const goToPrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1)
      setProgress(0)
    }
  }

  const goToNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && currentStory && (
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
              {stories.map((_, index) => (
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
                  src={currentStory.user.avatar}
                  alt={currentStory.user.displayName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <h3 className="text-white font-semibold text-sm">{currentStory.user.displayName}</h3>
                  <p className="text-white/70 text-xs">2h ago</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX className="text-white text-xl" />
              </button>
            </div>

            {/* Story Content */}
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={currentStory.media.url}
                alt="Story"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Navigation Areas */}
            <button
              className="absolute left-0 top-0 w-1/3 h-full z-10"
              onClick={goToPrevious}
            />
            <button
              className="absolute right-0 top-0 w-1/3 h-full z-10"
              onClick={goToNext}
            />

            {/* Navigation Buttons */}
            {currentStoryIndex > 0 && (
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full"
              >
                <FiChevronLeft className="text-xl" />
              </button>
            )}
            
            {currentStoryIndex < stories.length - 1 && (
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full"
              >
                <FiChevronRight className="text-xl" />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default StoryViewerModal