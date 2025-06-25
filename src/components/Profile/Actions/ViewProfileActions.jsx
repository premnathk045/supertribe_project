import { motion } from 'framer-motion'
import { FiUserPlus, FiMessageCircle, FiMoreHorizontal } from 'react-icons/fi'

function ViewProfileActions({ isFollowing, onToggleFollow, onSendMessage }) {
  return (
    <div className="flex space-x-3 mb-6">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggleFollow}
        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
          isFollowing
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            : 'bg-primary-500 hover:bg-primary-600 text-white'
        }`}
      >
        <FiUserPlus className="text-lg" />
        <span>{isFollowing ? 'Following' : 'Follow'}</span>
      </motion.button>
      
      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={onSendMessage}
        className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
      >
        <FiMessageCircle className="text-lg" />
        <span>Message</span>
      </motion.button>
      
      <motion.button 
        whileTap={{ scale: 0.95 }}
        className="bg-gray-100 hover:bg-gray-200 text-gray-900 p-2 rounded-lg transition-colors"
      >
        <FiMoreHorizontal className="text-lg" />
      </motion.button>
    </div>
  )
}

export default ViewProfileActions