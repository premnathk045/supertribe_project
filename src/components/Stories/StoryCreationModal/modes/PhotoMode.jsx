import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiCircle, 
  FiRotateCcw, 
  FiZap, 
  FiZapOff, 
  FiGrid,
  FiCheck
} from 'react-icons/fi'
import { CAMERA_CONSTRAINTS } from '../constants'

function PhotoMode({ onCapture, onPreview }) {
  const [stream, setStream] = useState(null)
  const [facingMode, setFacingMode] = useState('user')
  const [flashMode, setFlashMode] = useState('off') // off, on, auto
  const [showGrid, setShowGrid] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [focusPoint, setFocusPoint] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [facingMode])

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const constraints = {
        video: {
          ...CAMERA_CONSTRAINTS.PHOTO,
          facingMode: facingMode
        }
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(newStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const flipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const toggleFlash = () => {
    setFlashMode(prev => {
      switch (prev) {
        case 'off': return 'auto'
        case 'auto': return 'on'
        case 'on': return 'off'
        default: return 'off'
      }
    })
  }

  const handleTapToFocus = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setFocusPoint({ x, y })
    
    // Clear focus point after animation
    setTimeout(() => setFocusPoint(null), 1000)
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      
      // Apply flash effect
      if (flashMode === 'on') {
        // Flash effect would be implemented here
      }
      
      ctx.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        setCapturedPhoto(url)
        
        onCapture({
          type: 'photo',
          media: blob,
          mediaUrl: url
        })
      }, 'image/jpeg', 0.9)
      
    } catch (error) {
      console.error('Error capturing photo:', error)
    } finally {
      setIsCapturing(false)
    }
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto)
    }
  }

  const confirmPhoto = () => {
    onPreview()
  }

  if (capturedPhoto) {
    return (
      <div className="h-full relative bg-black">
        <img
          src={capturedPhoto}
          alt="Captured"
          className="w-full h-full object-cover"
        />
        
        {/* Action Buttons */}
        <div className="absolute bottom-20 left-0 right-0 flex items-center justify-center space-x-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={retakePhoto}
            className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/30 flex items-center justify-center"
          >
            <FiRotateCcw className="text-white text-xl" />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={confirmPhoto}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
          >
            <FiCheck className="text-black text-xl" />
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full relative bg-black overflow-hidden">
      {/* Camera View */}
      <div 
        className="w-full h-full relative cursor-pointer"
        onClick={handleTapToFocus}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        )}
        
        {/* Focus Point */}
        {focusPoint && (
          <motion.div
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute w-16 h-16 border-2 border-white rounded-full pointer-events-none"
            style={{
              left: `${focusPoint.x}%`,
              top: `${focusPoint.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </div>

      {/* Top Controls */}
      <div className="absolute top-40 left-4 right-4 flex items-center justify-between z-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleFlash}
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
        >
          {flashMode === 'off' ? (
            <FiZapOff className="text-white text-lg" />
          ) : (
            <FiZap className="text-white text-lg" />
          )}
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowGrid(!showGrid)}
          className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center ${
            showGrid ? 'bg-white/30' : 'bg-black/30'
          }`}
        >
          <FiGrid className="text-white text-lg" />
        </motion.button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-32 left-0 right-0 flex items-center justify-center space-x-8 z-10">
        {/* Camera Flip */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={flipCamera}
          className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/30 flex items-center justify-center"
        >
          <FiRotateCcw className="text-white text-xl" />
        </motion.button>

        {/* Capture Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={capturePhoto}
          disabled={isCapturing}
          className="relative"
        >
          <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
            <motion.div
              animate={{
                scale: isCapturing ? 0.8 : 1,
                backgroundColor: isCapturing ? '#ffffff' : 'transparent'
              }}
              transition={{ duration: 0.1 }}
              className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center"
            >
              <FiCircle className="text-white text-2xl" />
            </motion.div>
          </div>
        </motion.button>

        {/* Placeholder for symmetry */}
        <div className="w-12 h-12" />
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default PhotoMode