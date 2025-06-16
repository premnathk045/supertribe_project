import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiType, 
  FiAlignLeft, 
  FiAlignCenter, 
  FiAlignRight,
  FiBold,
  FiItalic,
  FiCheck
} from 'react-icons/fi'
import { TEXT_FONTS, BACKGROUND_COLORS, GRADIENT_BACKGROUNDS, TEXT_COLORS } from '../constants'

function TextMode({ storyData, onUpdate, onPreview }) {
  const [text, setText] = useState(storyData.text || '')
  const [textStyle, setTextStyle] = useState(storyData.textStyle || {
    font: 0,
    size: 24,
    color: '#ffffff',
    align: 'center',
    bold: false,
    italic: false
  })
  const [background, setBackground] = useState(storyData.background || {
    type: 'solid',
    value: '#000000'
  })
  const [showControls, setShowControls] = useState(false)

  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  useEffect(() => {
    onUpdate({
      type: 'text',
      text,
      textStyle,
      background
    })
  }, [text, textStyle, background, onUpdate])

  const updateTextStyle = (updates) => {
    setTextStyle(prev => ({ ...prev, ...updates }))
  }

  const updateBackground = (updates) => {
    setBackground(prev => ({ ...prev, ...updates }))
  }

  const handleTextChange = (e) => {
    setText(e.target.value)
  }

  const getBackgroundStyle = () => {
    if (background.type === 'gradient') {
      return { background: background.value }
    }
    return { backgroundColor: background.value }
  }

  const getTextClassName = () => {
    const font = TEXT_FONTS[textStyle.font]
    let className = font.className
    
    if (textStyle.bold) className += ' font-bold'
    if (textStyle.italic) className += ' italic'
    
    return className
  }

  return (
    <div 
      className="h-full relative flex items-center justify-center p-8"
      style={getBackgroundStyle()}
      onClick={() => setShowControls(!showControls)}
    >
      {/* Text Input */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        placeholder="Type something..."
        className={`w-full max-w-md bg-transparent border-none outline-none resize-none text-center placeholder-white/50 ${getTextClassName()}`}
        style={{
          color: textStyle.color,
          fontSize: `${textStyle.size}px`,
          textAlign: textStyle.align,
          lineHeight: '1.2'
        }}
        rows={6}
      />

      {/* Controls Overlay */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 space-y-4"
        >
          {/* Font Selection */}
          <div className="flex justify-center space-x-2 overflow-x-auto">
            {TEXT_FONTS.map((font, index) => (
              <motion.button
                key={index}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateTextStyle({ font: index })}
                className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                  textStyle.font === index 
                    ? 'bg-white text-black' 
                    : 'bg-white/20 text-white border border-white/30'
                }`}
              >
                {font.name}
              </motion.button>
            ))}
          </div>

          {/* Text Styling */}
          <div className="flex justify-center space-x-4">
            {/* Alignment */}
            <div className="flex space-x-1 bg-white/20 rounded-lg p-1">
              {[
                { align: 'left', icon: FiAlignLeft },
                { align: 'center', icon: FiAlignCenter },
                { align: 'right', icon: FiAlignRight }
              ].map(({ align, icon: Icon }) => (
                <motion.button
                  key={align}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateTextStyle({ align })}
                  className={`p-2 rounded-md ${
                    textStyle.align === align ? 'bg-white text-black' : 'text-white'
                  }`}
                >
                  <Icon className="text-lg" />
                </motion.button>
              ))}
            </div>

            {/* Bold/Italic */}
            <div className="flex space-x-1 bg-white/20 rounded-lg p-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => updateTextStyle({ bold: !textStyle.bold })}
                className={`p-2 rounded-md ${
                  textStyle.bold ? 'bg-white text-black' : 'text-white'
                }`}
              >
                <FiBold className="text-lg" />
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => updateTextStyle({ italic: !textStyle.italic })}
                className={`p-2 rounded-md ${
                  textStyle.italic ? 'bg-white text-black' : 'text-white'
                }`}
              >
                <FiItalic className="text-lg" />
              </motion.button>
            </div>
          </div>

          {/* Font Size */}
          <div className="flex justify-center items-center space-x-4">
            <span className="text-white text-sm">Size</span>
            <input
              type="range"
              min="16"
              max="48"
              value={textStyle.size}
              onChange={(e) => updateTextStyle({ size: parseInt(e.target.value) })}
              className="flex-1 max-w-32"
            />
            <span className="text-white text-sm w-8">{textStyle.size}</span>
          </div>

          {/* Text Colors */}
          <div className="flex justify-center space-x-2 overflow-x-auto">
            {TEXT_COLORS.map((color) => (
              <motion.button
                key={color}
                whileTap={{ scale: 0.9 }}
                onClick={() => updateTextStyle({ color })}
                className={`w-8 h-8 rounded-full border-2 ${
                  textStyle.color === color ? 'border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Background Type Toggle */}
          <div className="flex justify-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => updateBackground({ type: 'solid' })}
              className={`px-4 py-2 rounded-full text-sm ${
                background.type === 'solid' 
                  ? 'bg-white text-black' 
                  : 'bg-white/20 text-white border border-white/30'
              }`}
            >
              Solid
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => updateBackground({ type: 'gradient' })}
              className={`px-4 py-2 rounded-full text-sm ${
                background.type === 'gradient' 
                  ? 'bg-white text-black' 
                  : 'bg-white/20 text-white border border-white/30'
              }`}
            >
              Gradient
            </motion.button>
          </div>

          {/* Background Colors/Gradients */}
          <div className="flex justify-center space-x-2 overflow-x-auto">
            {background.type === 'solid' ? (
              BACKGROUND_COLORS.map((color) => (
                <motion.button
                  key={color}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateBackground({ value: color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    background.value === color ? 'border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))
            ) : (
              GRADIENT_BACKGROUNDS.map((gradient, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateBackground({ value: gradient })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    background.value === gradient ? 'border-white' : 'border-transparent'
                  }`}
                  style={{ background: gradient }}
                />
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Done Button */}
      {text.trim() && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPreview}
          className="absolute top-20 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center"
        >
          <FiCheck className="text-black text-xl" />
        </motion.button>
      )}
    </div>
  )
}

export default TextMode