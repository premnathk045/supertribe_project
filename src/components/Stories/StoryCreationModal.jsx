import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiX, 
  FiCamera, 
  FiImage, 
  FiType, 
  FiRotateCcw, 
  FiZap, 
  FiZapOff,
  FiCircle,
  FiSquare,
  FiSmile,
  FiStar,
  FiHeart,
  FiArrowLeft,
  FiCheck,
  FiPalette,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiMinus,
  FiPlus,
  FiUndo,
  FiRedo
} from 'react-icons/fi'
import { useDropzone } from 'react-dropzone'

const STORY_DURATION = 15000 // 15 seconds max for video
const BACKGROUND_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
]

const GRADIENT_BACKGROUNDS = [
  'linear-gradient(45deg, #833AB4, #FD1D1D)',
  'linear-gradient(45deg, #405DE6, #5851DB)',
  'linear-gradient(45deg, #F77737, #FCAF45)',
  'linear-gradient(45deg, #667eea, #764ba2)',
  'linear-gradient(45deg, #f093fb, #f5576c)',
  'linear-gradient(45deg, #4facfe, #00f2fe)',
  'linear-gradient(45deg, #43e97b, #38f9d7)',
  'linear-gradient(45deg, #fa709a, #fee140)'
]

const FONT_STYLES = [
  { name: 'Classic', style: 'font-sans' },
  { name: 'Modern', style: 'font-mono' },
  { name: 'Typewriter', style: 'font-serif' },
  { name: 'Bold', style: 'font-sans font-bold' }
]

const TEXT_COLORS = [
  '#FFFFFF', '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
]

function StoryCreationModal({ isOpen, onClose, onPublish }) {
  const [step, setStep] = useState('select') // select, camera, gallery, text, edit, preview
  const [storyType, setStoryType] = useState(null) // camera, gallery, text
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [facingMode, setFacingMode] = useState('user') // user (front) or environment (back)
  const [flashEnabled, setFlashEnabled] = useState(false)
  
  // Text story states
  const [textContent, setTextContent] = useState('')
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [backgroundColor, setBackgroundColor] = useState('#FF6B6B')
  const [backgroundType, setBackgroundType] = useState('solid') // solid, gradient
  const [selectedGradient, setSelectedGradient] = useState(0)
  const [fontSize, setFontSize] = useState(24)
  const [fontStyle, setFontStyle] = useState(0)
  const [textAlign, setTextAlign] = useState('center')
  
  // Drawing and stickers
  const [drawingMode, setDrawingMode] = useState(false)
  const [drawingColor, setDrawingColor] = useState('#FFFFFF')
  const [stickers, setStickers] = useState([])
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const recordingRef = useRef(null)
  const textareaRef = useRef(null)

  // Camera setup
  useEffect(() => {
    if (step === 'camera' && storyType === 'camera') {
      startCamera()
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [step, storyType, facingMode])

  // Recording timer
  useEffect(() => {
    let interval
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= STORY_DURATION / 1000) {
            stopRecording()
            return 0
          }
          return prev + 1
        })
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    
    return () => clearInterval(interval)
  }, [isRecording])

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 720 },
          height: { ideal: 1280 }
        },
        audio: true
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        setMediaFile(blob)
        setMediaPreview(URL.createObjectURL(blob))
        setStep('edit')
      }, 'image/jpeg', 0.9)
    }
  }

  const startRecording = () => {
    if (streamRef.current) {
      const mediaRecorder = new MediaRecorder(streamRef.current)
      const chunks = []
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' })
        setMediaFile(blob)
        setMediaPreview(URL.createObjectURL(blob))
        setStep('edit')
      }
      
      recordingRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    }
  }

  const stopRecording = () => {
    if (recordingRef.current && isRecording) {
      recordingRef.current.stop()
      setIsRecording(false)
      setRecordingTime(0)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const flipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const toggleFlash = () => {
    setFlashEnabled(prev => !prev)
    // Note: Flash control would need additional implementation
  }

  // Gallery upload
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setMediaFile(file)
        setMediaPreview(URL.createObjectURL(file))
        setStep('edit')
      }
    }
  })

  const handleTextStory = () => {
    setStep('text')
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }, 100)
  }

  const addSticker = (emoji) => {
    const newSticker = {
      id: Date.now(),
      emoji,
      x: Math.random() * 200 + 100,
      y: Math.random() * 300 + 200,
      rotation: Math.random() * 360,
      scale: 1
    }
    setStickers(prev => [...prev, newSticker])
  }

  const handlePublish = () => {
    const storyData = {
      type: storyType,
      media: mediaFile,
      preview: mediaPreview,
      text: textContent,
      textColor,
      backgroundColor: backgroundType === 'gradient' ? GRADIENT_BACKGROUNDS[selectedGradient] : backgroundColor,
      fontSize,
      fontStyle: FONT_STYLES[fontStyle],
      textAlign,
      stickers,
      createdAt: new Date()
    }
    
    onPublish(storyData)
    onClose()
    resetState()
  }

  const resetState = () => {
    setStep('select')
    setStoryType(null)
    setMediaFile(null)
    setMediaPreview(null)
    setTextContent('')
    setStickers([])
    setUndoStack([])
    setRedoStack([])
    setRecordingTime(0)
    setIsRecording(false)
  }

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    resetState()
    onClose()
  }

  const goBack = () => {
    if (step === 'edit' || step === 'text') {
      setStep('select')
    } else if (step === 'preview') {
      setStep(storyType === 'text' ? 'text' : 'edit')
    } else {
      setStep('select')
    }
  }

  const goToPreview = () => {
    setStep('preview')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        {/* Progress Bar */}
        <div className="absolute top-4 left-4 right-4 z-20">
          <div className="flex space-x-1">
            {['select', 'create', 'edit', 'preview'].map((stepName, index) => (
              <div
                key={stepName}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  ['select', 'camera', 'gallery', 'text'].includes(step) && index === 0 ? 'bg-white' :
                  ['edit'].includes(step) && index <= 1 ? 'bg-white' :
                  ['preview'].includes(step) && index <= 2 ? 'bg-white' :
                  'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
          <button
            onClick={step === 'select' ? handleClose : goBack}
            className="p-2 bg-black/50 rounded-full text-white"
          >
            {step === 'select' ? <FiX className="text-xl" /> : <FiArrowLeft className="text-xl" />}
          </button>

          {step === 'select' && (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => { setStoryType('camera'); setStep('camera') }}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  storyType === 'camera' ? 'bg-white text-black' : 'bg-black/50 text-white'
                }`}
              >
                <FiCamera className="inline mr-2" />
                Camera
              </button>
              <button
                onClick={() => { setStoryType('gallery'); setStep('gallery') }}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  storyType === 'gallery' ? 'bg-white text-black' : 'bg-black/50 text-white'
                }`}
              >
                <FiImage className="inline mr-2" />
                Gallery
              </button>
              <button
                onClick={() => { setStoryType('text'); handleTextStory() }}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  storyType === 'text' ? 'bg-white text-black' : 'bg-black/50 text-white'
                }`}
              >
                <FiType className="inline mr-2" />
                Text
              </button>
            </div>
          )}

          {(step === 'edit' || step === 'text') && (
            <button
              onClick={goToPreview}
              className="px-4 py-2 bg-white text-black rounded-full font-medium"
            >
              Next
            </button>
          )}

          {step === 'preview' && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-primary-500 text-white rounded-full font-medium"
            >
              <FiCheck className="inline mr-2" />
              Share
            </button>
          )}
        </div>

        {/* Content */}
        <div className="h-full flex items-center justify-center">
          {/* Selection Screen */}
          {step === 'select' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center text-white"
            >
              <h2 className="text-2xl font-bold mb-8">Create Your Story</h2>
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setStoryType('camera'); setStep('camera') }}
                  className="w-64 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <FiCamera className="text-4xl mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Camera</h3>
                  <p className="text-sm text-white/70">Take a photo or video</p>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setStoryType('gallery'); setStep('gallery') }}
                  className="w-64 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <FiImage className="text-4xl mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Gallery</h3>
                  <p className="text-sm text-white/70">Choose from gallery</p>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setStoryType('text'); handleTextStory() }}
                  className="w-64 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <FiType className="text-4xl mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Text</h3>
                  <p className="text-sm text-white/70">Create text story</p>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Camera Screen */}
          {step === 'camera' && (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <span>{recordingTime}s / {STORY_DURATION / 1000}s</span>
                  </div>
                </div>
              )}

              {/* Camera Controls */}
              <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center space-x-8">
                <button
                  onClick={toggleFlash}
                  className="p-3 bg-black/50 rounded-full text-white"
                >
                  {flashEnabled ? <FiZap className="text-xl" /> : <FiZapOff className="text-xl" />}
                </button>
                
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={isRecording ? toggleRecording : capturePhoto}
                  onMouseDown={!isRecording ? startRecording : undefined}
                  onMouseUp={isRecording ? stopRecording : undefined}
                  onTouchStart={!isRecording ? startRecording : undefined}
                  onTouchEnd={isRecording ? stopRecording : undefined}
                  className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center ${
                    isRecording ? 'bg-red-500' : 'bg-white/20'
                  }`}
                >
                  {isRecording ? (
                    <FiSquare className="text-2xl text-white" />
                  ) : (
                    <FiCircle className="text-2xl text-white" />
                  )}
                </motion.button>
                
                <button
                  onClick={flipCamera}
                  className="p-3 bg-black/50 rounded-full text-white"
                >
                  <FiRotateCcw className="text-xl" />
                </button>
              </div>
            </div>
          )}

          {/* Gallery Screen */}
          {step === 'gallery' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md mx-auto p-8"
            >
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-white/50 rounded-2xl p-12 text-center text-white cursor-pointer hover:border-white/70 transition-colors"
              >
                <input {...getInputProps()} />
                <FiImage className="text-6xl mx-auto mb-4 text-white/70" />
                <h3 className="text-xl font-semibold mb-2">Choose Media</h3>
                <p className="text-white/70">Drag and drop or click to browse</p>
                <p className="text-sm text-white/50 mt-2">Images and videos supported</p>
              </div>
            </motion.div>
          )}

          {/* Text Story Screen */}
          {step === 'text' && (
            <div 
              className="relative w-full h-full flex items-center justify-center"
              style={{
                background: backgroundType === 'gradient' 
                  ? GRADIENT_BACKGROUNDS[selectedGradient]
                  : backgroundColor
              }}
            >
              <textarea
                ref={textareaRef}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Type your story..."
                className={`w-full max-w-md p-4 bg-transparent border-none outline-none resize-none text-center ${FONT_STYLES[fontStyle].style}`}
                style={{
                  color: textColor,
                  fontSize: `${fontSize}px`,
                  textAlign: textAlign,
                  lineHeight: '1.2'
                }}
                rows={6}
              />

              {/* Text Controls */}
              <div className="absolute bottom-8 left-4 right-4 space-y-4">
                {/* Font Style */}
                <div className="flex justify-center space-x-2">
                  {FONT_STYLES.map((font, index) => (
                    <button
                      key={index}
                      onClick={() => setFontStyle(index)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        fontStyle === index ? 'bg-white text-black' : 'bg-black/50 text-white'
                      }`}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>

                {/* Text Alignment */}
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => setTextAlign('left')}
                    className={`p-2 rounded-full ${textAlign === 'left' ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
                  >
                    <FiAlignLeft />
                  </button>
                  <button
                    onClick={() => setTextAlign('center')}
                    className={`p-2 rounded-full ${textAlign === 'center' ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
                  >
                    <FiAlignCenter />
                  </button>
                  <button
                    onClick={() => setTextAlign('right')}
                    className={`p-2 rounded-full ${textAlign === 'right' ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
                  >
                    <FiAlignRight />
                  </button>
                </div>

                {/* Font Size */}
                <div className="flex justify-center items-center space-x-4">
                  <button
                    onClick={() => setFontSize(Math.max(16, fontSize - 4))}
                    className="p-2 bg-black/50 text-white rounded-full"
                  >
                    <FiMinus />
                  </button>
                  <span className="text-white font-medium">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize(Math.min(48, fontSize + 4))}
                    className="p-2 bg-black/50 text-white rounded-full"
                  >
                    <FiPlus />
                  </button>
                </div>

                {/* Color Pickers */}
                <div className="space-y-2">
                  {/* Text Colors */}
                  <div className="flex justify-center space-x-2">
                    {TEXT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          textColor === color ? 'border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Background Type Toggle */}
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => setBackgroundType('solid')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        backgroundType === 'solid' ? 'bg-white text-black' : 'bg-black/50 text-white'
                      }`}
                    >
                      Solid
                    </button>
                    <button
                      onClick={() => setBackgroundType('gradient')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        backgroundType === 'gradient' ? 'bg-white text-black' : 'bg-black/50 text-white'
                      }`}
                    >
                      Gradient
                    </button>
                  </div>

                  {/* Background Colors/Gradients */}
                  <div className="flex justify-center space-x-2 flex-wrap max-w-xs mx-auto">
                    {backgroundType === 'solid' ? (
                      BACKGROUND_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setBackgroundColor(color)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            backgroundColor === color ? 'border-white' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))
                    ) : (
                      GRADIENT_BACKGROUNDS.map((gradient, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedGradient(index)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            selectedGradient === index ? 'border-white' : 'border-transparent'
                          }`}
                          style={{ background: gradient }}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Screen */}
          {step === 'edit' && mediaPreview && (
            <div className="relative w-full h-full">
              {mediaFile?.type?.startsWith('video') ? (
                <video
                  src={mediaPreview}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Story preview"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Stickers */}
              {stickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className="absolute text-4xl cursor-move"
                  style={{
                    left: `${sticker.x}px`,
                    top: `${sticker.y}px`,
                    transform: `rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                  }}
                >
                  {sticker.emoji}
                </div>
              ))}

              {/* Edit Tools */}
              <div className="absolute bottom-8 left-4 right-4">
                <div className="flex justify-center space-x-4 mb-4">
                  <button
                    onClick={() => addSticker('😀')}
                    className="p-3 bg-black/50 rounded-full text-white"
                  >
                    <FiSmile className="text-xl" />
                  </button>
                  <button
                    onClick={() => addSticker('⭐')}
                    className="p-3 bg-black/50 rounded-full text-white"
                  >
                    <FiStar className="text-xl" />
                  </button>
                  <button
                    onClick={() => addSticker('❤️')}
                    className="p-3 bg-black/50 rounded-full text-white"
                  >
                    <FiHeart className="text-xl" />
                  </button>
                  <button
                    className="p-3 bg-black/50 rounded-full text-white"
                  >
                    <FiPalette className="text-xl" />
                  </button>
                </div>

                <div className="flex justify-center space-x-4">
                  <button className="p-2 bg-black/50 rounded-full text-white">
                    <FiUndo className="text-lg" />
                  </button>
                  <button className="p-2 bg-black/50 rounded-full text-white">
                    <FiRedo className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Screen */}
          {step === 'preview' && (
            <div className="relative w-full h-full">
              {storyType === 'text' ? (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: backgroundType === 'gradient' 
                      ? GRADIENT_BACKGROUNDS[selectedGradient]
                      : backgroundColor
                  }}
                >
                  <div
                    className={`max-w-md p-4 ${FONT_STYLES[fontStyle].style}`}
                    style={{
                      color: textColor,
                      fontSize: `${fontSize}px`,
                      textAlign: textAlign,
                      lineHeight: '1.2'
                    }}
                  >
                    {textContent}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full">
                  {mediaFile?.type?.startsWith('video') ? (
                    <video
                      src={mediaPreview}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Story preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Stickers overlay */}
                  {stickers.map((sticker) => (
                    <div
                      key={sticker.id}
                      className="absolute text-4xl"
                      style={{
                        left: `${sticker.x}px`,
                        top: `${sticker.y}px`,
                        transform: `rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                      }}
                    >
                      {sticker.emoji}
                    </div>
                  ))}
                </div>
              )}

              {/* Preview overlay */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-xl font-semibold mb-2">Story Preview</h3>
                  <p className="text-sm opacity-75">This is how your story will appear</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default StoryCreationModal