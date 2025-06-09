import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  FiArrowLeft, 
  FiSend, 
  FiImage, 
  FiSmile, 
  FiMoreVertical,
  FiPhone,
  FiVideo
} from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { messages, conversation, users } from '../data/dummyData'

function MessagesPage() {
  const navigate = useNavigate()
  const [selectedChat, setSelectedChat] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [chatMessages, setChatMessages] = useState(conversation)

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        senderId: 1, // Current user
        content: newMessage,
        createdAt: new Date(),
        isRead: true
      }
      setChatMessages(prev => [...prev, message])
      setNewMessage('')
    }
  }

  const currentUser = users[0] // Current user
  const otherUser = selectedChat ? selectedChat.participants.find(p => p.id !== currentUser.id) : null

  return (
    <div className="h-screen bg-white flex flex-col">
      {!selectedChat ? (
        // Chat List View
        <>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiArrowLeft className="text-xl" />
              </button>
              <h1 className="text-xl font-semibold">Messages</h1>
              <div className="w-10"></div>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-lg mx-auto">
              {messages.map((chat, index) => {
                const otherParticipant = chat.participants.find(p => p.id !== currentUser.id)
                
                return (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedChat(chat)}
                    className="flex items-center space-x-4 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                  >
                    <div className="relative">
                      <img
                        src={otherParticipant.avatar}
                        alt={otherParticipant.displayName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {otherParticipant.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {otherParticipant.displayName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(chat.lastMessage.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          chat.lastMessage.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'
                        }`}>
                          {chat.lastMessage.content}
                        </p>
                        {chat.unreadCount > 0 && (
                          <div className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        // Chat View
        <>
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiArrowLeft className="text-xl" />
                </button>
                <img
                  src={otherUser.avatar}
                  alt={otherUser.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold text-gray-900">{otherUser.displayName}</h2>
                  <p className="text-sm text-gray-500">
                    {otherUser.isOnline ? 'Active now' : 'Last seen recently'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <FiPhone className="text-xl text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <FiVideo className="text-xl text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <FiMoreVertical className="text-xl text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="max-w-lg mx-auto space-y-4">
              {chatMessages.map((message, index) => {
                const isCurrentUser = message.senderId === currentUser.id
                const sender = users.find(u => u.id === message.senderId)
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isCurrentUser
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-lg mx-auto">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FiImage className="text-xl" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <FiSmile className="text-lg" />
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-full transition-colors"
                >
                  <FiSend className="text-lg" />
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default MessagesPage