import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiCircle, 
  FiSquare, 
  FiRotateCcw, 
  FiZap, 
  FiZapOff,
  FiCheck,
  FiMic,
  FiMicOff
} from 'react-icons/fi'
import { CAMERA_CONSTRAINTS, VIDEO_CONSTRAINTS } from '../constants'

function VideoMode({ onCapture, onPreview }) {
  const [stream, setStream] = useState(null)
  const [facingMode, setFacingMode] = useState('user')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [flashMode, setFlashMode] = useState('off')
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [recordedVideo, setRecordedVideo] = useState(null)

  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [facingMode, audioEnabled])

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const constraints = {
        video: {
          ...CAMERA_CONSTRAINTS.VIDEO,
          facingMode: facingMode
        },
        audio: audioEnabled
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
    setFlashMode(prev => prev === 'off' ? 'on' : 'off')
  }

  const toggleAudio = () => {
    setAudioEnabled(prev => !prev)
  }

  const startRecording = () => {
    if (!stream) return

    try {
      chunksRef.current = []
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setRecordedVideo(url)
        
        onCapture({
          type: 'video',
          media: blob,
          mediaUrl: url,
          duration: recordingTime
        })
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          if (newTime >= VIDEO_CONSTRAINTS.MAX_DURATION / 1000) {
            stopRecording()
            return prev
          }
          return newTime
        })
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const retakeVideo = () => {
    setRecordedVideo(null)
    setRecordingTime(0)
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo)
    }
  }

  const confirmVideo = () => {
    onPreview()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = (recordingTime / (VIDEO_CONSTRAINTS.MAX_DURATION / 1000)) * 100

  if (recordedVideo) {
    return (
      <div className="h-full relative bg-black">
        <video
          src={recordedVideo}
          controls
          className="w-full h-full object-cover"
        />
        
        {/* Action Buttons */}
        <div className="absolute bottom-20 left-0 right-0 flex items-center justify-center space-x-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={retakeVideo}
            className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/30 flex items-center justify-center"
          >
            <FiRotateCcw className="text-white text-xl" />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={confirmVideo}
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
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Recording Indicator */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-3 h-3 bg-white rounded-full"
            />
            <span className="font-mono font-medium">{formatTime(recordingTime)}</span>
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      {isRecording && (
        <div className="absolute top-16 left-0 right-0 h-1 bg-white/20 z-10">
          <motion.div
            className="h-full bg-red-500"
            style={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}

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
          onClick={toggleAudio}
          className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center ${
            audioEnabled ? 'bg-black/30' : 'bg-red-500'
          }`}
        >
          {audioEnabled ? (
            <FiMic className="text-white text-lg" />
          ) : (
            <FiMicOff className="text-white text-lg" />
          )}
        </motion.button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-32 left-0 right-0 flex items-center justify-center space-x-8 z-10">
        {/* Camera Flip */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={flipCamera}
          disabled={isRecording}
          className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/30 flex items-center justify-center disabled:opacity-50"
        >
          <FiRotateCcw className="text-white text-xl" />
        </motion.button>

        {/* Record Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleRecording}
          className="relative"
        >
          <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${
            isRecording ? 'border-red-500' : 'border-white'
          }`}>
            <motion.div
              animate={{
                scale: isRecording ? 0.6 : 1,
                borderRadius: isRecording ? '20%' : '50%'
              }}
              transition={{ duration: 0.2 }}
              className={`w-16 h-16 ${
                isRecording ? 'bg-red-500' : 'bg-transparent border-2 border-white'
              } rounded-full flex items-center justify-center`}
            >
              {isRecording ? (
                <FiSquare className="text-white text-xl" />
              ) : (
                <FiCircle className="text-white text-2xl" />
              )}
            </motion.div>
          </div>
        </motion.button>

        {/* Placeholder for symmetry */}
        <div className="w-12 h-12" />
      </div>
    </div>
  )
}

export default VideoMode