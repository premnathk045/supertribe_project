import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheck, FiUpload } from 'react-icons/fi'
import ModalHeader from './components/ModalHeader'
import BottomTabNavigation from './components/BottomTabNavigation'
import PhotoMode from './modes/PhotoMode'
import VideoMode from './modes/VideoMode'
import TextMode from './modes/TextMode'
import GalleryMode from './modes/GalleryMode'
import PreviewMode from './modes/PreviewMode'
import PermissionModal from './components/PermissionModal'
import { useStoryCreation } from './hooks/useStoryCreation'
import { useStoryUpload } from '../../../hooks/useStoryUpload'
import { STORY_MODES } from './constants'

function StoryCreationModal({ isOpen, onClose, onPublish }) {
  const {
    currentMode,
    setCurrentMode,
    storyData,
    updateStoryData,
    resetStoryData,
    permissions,
    requestPermission,
    showPermissionModal,
    setShowPermissionModal
  } = useStoryCreation()

  const { uploadStory, uploading, progress, error: uploadError, reset: resetUpload } = useStoryUpload()

  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [publishError, setPublishError] = useState(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      resetStoryData()
      resetUpload()
      setIsPreviewMode(false)
      setPublishError(null)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, resetStoryData, resetUpload])

  const handleClose = () => {
    if (isPreviewMode) {
      setIsPreviewMode(false)
    } else {
      onClose()
    }
  }

  const handleModeChange = (mode) => {
    if (mode === STORY_MODES.GALLERY) {
      if (!permissions.photos) {
        requestPermission('photos')
        return
      }
    } else if (mode === STORY_MODES.PHOTO || mode === STORY_MODES.VIDEO) {
      if (!permissions.camera) {
        requestPermission('camera')
        return
      }
      if (mode === STORY_MODES.VIDEO && !permissions.microphone) {
        requestPermission('microphone')
        return
      }
    }
    setCurrentMode(mode)
  }

  const handlePreview = () => {
    setIsPreviewMode(true)
  }

  const handlePublish = async () => {
    setPublishError(null)
    
    try {
      const publishedStory = await uploadStory(storyData)
      onPublish(publishedStory)
      onClose()
    } catch (error) {
      console.error('Error publishing story:', error)
      setPublishError(error.message)
    }
  }

  const renderCurrentMode = () => {
    if (isPreviewMode) {
      return (
        <PreviewMode
          storyData={storyData}
          onBack={() => setIsPreviewMode(false)}
          onPublish={handlePublish}
          onUpdateData={updateStoryData}
          uploading={uploading}
          progress={progress}
          error={publishError || uploadError}
        />
      )
    }

    switch (currentMode) {
      case STORY_MODES.PHOTO:
        return (
          <PhotoMode
            onCapture={(data) => updateStoryData(data)}
            onPreview={handlePreview}
          />
        )
      case STORY_MODES.VIDEO:
        return (
          <VideoMode
            onCapture={(data) => updateStoryData(data)}
            onPreview={handlePreview}
          />
        )
      case STORY_MODES.TEXT:
        return (
          <TextMode
            storyData={storyData}
            onUpdate={updateStoryData}
            onPreview={handlePreview}
          />
        )
      case STORY_MODES.GALLERY:
        return (
          <GalleryMode
            onSelect={(data) => updateStoryData(data)}
            onPreview={handlePreview}
          />
        )
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black"
          style={{ touchAction: 'none' }}
        >
          {/* Header */}
          <ModalHeader
            onClose={handleClose}
            isPreviewMode={isPreviewMode}
            currentMode={currentMode}
            uploading={uploading}
            progress={progress}
          />

          {/* Upload Progress Bar */}
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-16 left-0 right-0 z-30"
            >
              <div className="bg-black/50 backdrop-blur-sm p-4">
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">
                      Uploading story...
                    </span>
                    <span className="text-white text-sm">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div
                      className="bg-white rounded-full h-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {(publishError || uploadError) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-20 left-4 right-4 z-30"
            >
              <div className="bg-red-500 text-white px-4 py-3 rounded-lg text-center">
                <p className="text-sm font-medium">
                  {publishError || uploadError}
                </p>
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          <div className="flex-1 h-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={isPreviewMode ? 'preview' : currentMode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="h-full"
              >
                {renderCurrentMode()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation */}
          {!isPreviewMode && !uploading && (
            <BottomTabNavigation
              currentMode={currentMode}
              onModeChange={handleModeChange}
              permissions={permissions}
            />
          )}

          {/* Permission Modal */}
          <PermissionModal
            isOpen={showPermissionModal.show}
            type={showPermissionModal.type}
            onClose={() => setShowPermissionModal({ show: false, type: null })}
            onRetry={() => requestPermission(showPermissionModal.type)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default StoryCreationModal