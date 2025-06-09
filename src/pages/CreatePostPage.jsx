import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  FiX, 
  FiImage, 
  FiVideo, 
  FiDollarSign, 
  FiClock, 
  FiTag,
  FiArrowLeft,
  FiCheck
} from 'react-icons/fi'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

function CreatePostPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [postData, setPostData] = useState({
    content: '',
    media: [],
    isPremium: false,
    price: 0,
    tags: [],
    scheduledDate: null
  })
  const [uploading, setUploading] = useState(false)

  const handleMediaUpload = (files) => {
    // Simulate media upload
    setUploading(true)
    setTimeout(() => {
      const newMedia = Array.from(files).map((file, index) => ({
        id: Date.now() + index,
        type: file.type.startsWith('video') ? 'video' : 'image',
        url: URL.createObjectURL(file),
        file
      }))
      setPostData(prev => ({ ...prev, media: [...prev.media, ...newMedia] }))
      setUploading(false)
    }, 1500)
  }

  const handlePublish = () => {
    console.log('Publishing post:', postData)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {step > 1 ? <FiArrowLeft className="text-xl" /> : <FiX className="text-xl" />}
          </button>
          
          <h1 className="text-lg font-semibold">Create Post</h1>
          
          {step === 3 ? (
            <button
              onClick={handlePublish}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Publish
            </button>
          ) : (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && postData.media.length === 0}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Step 1: Media Upload */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">Add Media</h2>
            
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleMediaUpload(e.target.files)}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <FiImage className="text-4xl text-gray-400" />
                    <FiVideo className="text-4xl text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Upload photos or videos</p>
                    <p className="text-gray-500">Drag and drop or click to browse</p>
                  </div>
                </div>
              </label>
            </div>

            {/* Media Preview */}
            {postData.media.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {postData.media.map((item) => (
                  <div key={item.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {item.type === 'image' ? (
                      <img src={item.url} alt="Upload" className="w-full h-full object-cover" />
                    ) : (
                      <video src={item.url} className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => setPostData(prev => ({
                        ...prev,
                        media: prev.media.filter(m => m.id !== item.id)
                      }))}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"
                    >
                      <FiX className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="mt-2 text-gray-600">Uploading...</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Content & Settings */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">Add Details</h2>
            
            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
              <ReactQuill
                value={postData.content}
                onChange={(content) => setPostData(prev => ({ ...prev, content }))}
                placeholder="Write a caption..."
                modules={{
                  toolbar: [
                    ['bold', 'italic'],
                    ['link'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }]
                  ]
                }}
              />
            </div>

            {/* Premium Toggle */}
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Premium Content</h3>
                  <p className="text-sm text-gray-600">Charge for access to this post</p>
                </div>
                <button
                  onClick={() => setPostData(prev => ({ ...prev, isPremium: !prev.isPremium }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    postData.isPremium ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      postData.isPremium ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {postData.isPremium && (
                <div className="flex items-center space-x-2">
                  <FiDollarSign className="text-gray-400" />
                  <input
                    type="number"
                    value={postData.price}
                    onChange={(e) => setPostData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    placeholder="0.00"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex items-center space-x-2">
                <FiTag className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Add tags separated by commas"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      setPostData(prev => ({ ...prev, tags }))
                      e.target.value = ''
                    }
                  }}
                />
              </div>
              {postData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {postData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
            
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Post Header */}
              <div className="flex items-center space-x-3 p-4">
                <img
                  src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50"
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">Your Name</h3>
                  <p className="text-sm text-gray-500">Just now</p>
                </div>
              </div>

              {/* Content */}
              {postData.content && (
                <div className="px-4 pb-3">
                  <div dangerouslySetInnerHTML={{ __html: postData.content }} />
                  {postData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {postData.tags.map((tag, index) => (
                        <span key={index} className="text-primary-500 text-sm">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Media */}
              {postData.media.length > 0 && (
                <div className="aspect-square bg-gray-100">
                  <img
                    src={postData.media[0].url}
                    alt="Post media"
                    className="w-full h-full object-cover"
                  />
                  {postData.isPremium && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center text-white">
                        <FiDollarSign className="text-3xl mx-auto mb-2" />
                        <p className="font-semibold">Premium Content</p>
                        <p className="text-sm opacity-90">${postData.price}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-gray-600">
                  <div className="flex items-center space-x-6">
                    <span>❤️ 0</span>
                    <span>💬 0</span>
                    <span>📤 0</span>
                  </div>
                  <span>🔖</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default CreatePostPage