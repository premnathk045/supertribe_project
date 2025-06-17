import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiDownload, FiEdit3 } from 'react-icons/fi'
import { TEXT_FONTS } from '../constants'

function PreviewMode({ storyData, onBack, onPublish, onUpdateData }) {
  const [isPublishing, setIsPublishing] = useState(false)

  const handlePublish = async () => {
    setIsPublishing(true)
    
    // Simulate publishing delay
    setTimeout(() => {
      onPublish()
      setIsPublishing(false)
    }, 1500)
  }

  const getBackgroundStyle = () => {
    if (storyData.type === 'text') {
      if (storyData.background?.type === 'gradient') {
        return { background: storyData.background.value }
      }
      return { backgroundColor: storyData.background?.value || '#000000' }
    }
    return {}
  }

  const getTextClassName = () => {
    if (storyData.type !== 'text') return ''
    
    const font = TEXT_FONTS[storyData.textStyle?.font || 0]
    let className = font.className
    
    if (storyData.textStyle?.bold) className += ' font-bold'
    if (storyData.textStyle?.italic) className += ' italic'
    
    return className
  }

  return (
    <div className="h-full relative bg-black">
      {/* Content Preview */}
      <div className="w-full h-full flex items-center justify-center" style={getBackgroundStyle()}>
        {storyData.type === 'text' ? (
          /* Text Story */
          <div
            className={`max-w-md p-4 text-center ${getTextClassName()}`}
            style={{
              color: storyData.textStyle?.color || '#ffffff',
              fontSize: `${storyData.textStyle?.size || 24}px`,
              textAlign: storyData.textStyle?.align || 'center',
              lineHeight: '1.2'
            }}
          >
            {storyData.text}
          </div>
        ) : storyData.type === 'photo' ? (
          /* Photo Story */
          <img
            src={storyData.mediaUrl}
            alt="Story preview"
            className="w-full h-full object-cover"
          />
        ) : storyData.type === 'video' ? (
          /* Video Story */
          <video
            src={storyData.mediaUrl}
            controls
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>

      {/* Preview Overlay */}
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white pointer-events-auto"
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 max-w-xs">
            <h3 className="text-lg font-semibold mb-2">Story Preview</h3>
            <p className="text-sm opacity-90 mb-4">
              This is how your story will appear to your followers
            </p>
            
            {/* Story Info */}
            <div className="text-xs opacity-75 space-y-1">
              <div>Type: {storyData.type}</div>
              {storyData.duration && (
                <div>Duration: {Math.round(storyData.duration)}s</div>
              )}
              {storyData.text && (
                <div>Characters: {storyData.text.length}</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 left-0 right-0 px-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Edit Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm border border-white/30 flex items-center justify-center"
          >
            <FiEdit3 className="text-white text-xl" />
          </motion.button>

          {/* Download Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm border border-white/30 flex items-center justify-center"
          >
            <FiDownload className="text-white text-xl" />
          </motion.button>

          {/* Publish Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex-1 max-w-48 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white py-4 rounded-full font-semibold transition-all flex items-center justify-center space-x-2"
          >
            {isPublishing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <FiSend className="text-xl" />
                <span>Share to Story</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default PreviewMode