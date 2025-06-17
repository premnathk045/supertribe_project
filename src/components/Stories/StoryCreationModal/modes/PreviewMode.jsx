import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiDownload, FiEdit3, FiX } from 'react-icons/fi'
import { TEXT_FONTS } from '../constants'

function PreviewMode({ 
  storyData, 
  onBack, 
  onPublish, 
  onUpdateData, 
  uploading, 
  progress, 
  error 
}) {
  const [caption, setCaption] = useState(storyData.caption || '')

  const handlePublish = async () => {
    // Update story data with caption before publishing
    onUpdateData({ caption })
    await onPublish()
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
    <div className="h-full relative bg-black flex flex-col">
      {/* Content Preview */}
      <div className="flex-1 flex items-center justify-center" style={getBackgroundStyle()}>
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

      {/* Caption Input */}
      {!uploading && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-black/80 backdrop-blur-sm p-4"
        >
          <div className="max-w-md mx-auto">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full bg-white/10 text-white placeholder-white/60 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-white/60 text-xs">
                {caption.length}/200
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="bg-black/80 backdrop-blur-sm p-6">
        <div className="max-w-md mx-auto">
          {uploading ? (
            /* Upload Progress */
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-white font-medium mb-2">Publishing your story...</p>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <motion.div
                  className="bg-white rounded-full h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-white/60 text-sm">{Math.round(progress)}% complete</p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiX className="text-white text-xl" />
              </div>
              <p className="text-white font-medium mb-2">Upload failed</p>
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <div className="flex space-x-3">
                <button
                  onClick={onBack}
                  className="flex-1 bg-white/20 text-white py-3 rounded-full font-medium transition-colors"
                >
                  Edit Story
                </button>
                <button
                  onClick={handlePublish}
                  className="flex-1 bg-white text-black py-3 rounded-full font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            /* Normal Action Buttons */
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
                className="flex-1 max-w-48 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-full font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <FiSend className="text-xl" />
                <span>Share to Story</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PreviewMode