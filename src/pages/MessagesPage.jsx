import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  FiArrowLeft, 
  FiSend, 
  FiImage, 
  FiSmile, 
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiEdit2,
  FiTrash2,
  FiCornerUpLeft,
  FiCheck,
  FiX,
  FiSearch,
  FiPlus,
  FiUsers
} from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { useLongPress, isValidImage } from '../lib/messageUtils'
import { useConversations } from '../hooks/useConversations'
import { useMessages } from '../hooks/useMessages'
import { usePresence } from '../hooks/usePresence'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { supabase } from '../lib/supabase'

function MessagesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const messagesEndRef = useRef(null)
  const messageInputRef = useRef(null)
  const [selectedChat, setSelectedChat] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [showOptions, setShowOptions] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [userSearchError, setUserSearchError] = useState(null)
  const fileInputRef = useRef(null)

  // Fetch conversations
  const { 
    conversations, 
    loading: conversationsLoading, 
    error: conversationsError,
    getOrCreateDirectConversation
  } = useConversations()

  // Fetch messages for selected conversation
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sending,
    imageUpload,
    sendMessage,
    sendImageMessage,
    editMessage,
    deleteMessage,
    setImagePreview,
    clearImagePreview,
    markAsRead
  } = useMessages(selectedChat?.id)

  // User presence
  const {
    fetchPresence,
    setTypingIndicator,
    clearTypingIndicator,
    isUserTyping,
    getUserStatus
  } = usePresence()

  // Fetch users from the database
  const fetchUsers = async () => {
    if (!user) return
    
    try {
      setIsLoadingUsers(true)
      setUserSearchError(null)
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          avatar_url,
          is_verified,
          user_type
        `)
        .neq('id', user.id)
        .limit(10)
      
      if (error) throw error
      
      setSuggestedUsers(data || [])
      setFilteredUsers(data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
      setUserSearchError('Failed to load users')
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Filter users based on search query
  const filterUsers = (query) => {
    if (!query.trim()) {
      setFilteredUsers(suggestedUsers)
      return
    }
    
    const lowercaseQuery = query.toLowerCase().trim()
    const filtered = suggestedUsers.filter(user => {
      const displayName = user.display_name?.toLowerCase() || ''
      const username = user.username?.toLowerCase() || ''
      
      return displayName.includes(lowercaseQuery) || 
             username.includes(lowercaseQuery)
    })
    
    setFilteredUsers(filtered)
  }

  // Handle user search input changes
  const handleUserSearchChange = (e) => {
    const query = e.target.value
    setUserSearchQuery(query)
    filterUsers(query)
  }

  // Fetch presence data for conversation participants
  useEffect(() => {
    if (conversations.length > 0) {
      const userIds = conversations.flatMap(conv => 
        conv.participants.map(p => p.user_id)
      )
      fetchPresence(userIds)
    }
  }, [conversations, fetchPresence])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedChat) {
      markAsRead()
    }
  }, [selectedChat, messages, markAsRead])

  // Fetch users when opening the new chat modal
  useEffect(() => {
    if (showNewChatModal) {
      fetchUsers()
    }
  }, [showNewChatModal])

  // Filter conversations based on search query
  const filteredConversations = searchQuery
    ? conversations.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = isValidImage(file)
    if (!validation.valid) {
      setShowErrorModal({
        title: 'Invalid File',
        message: validation.reason,
        type: 'error'
      })
      return
    }

    setImageFile(file)
    setImagePreview(file)
  }

  // Handle removing selected image
  const handleRemoveImage = () => {
    setImageFile(null)
    clearImagePreview()
  }

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && !imageFile) || !selectedChat) return

    try {
      if (imageFile) {
        // Send image message
        await sendImageMessage(imageFile, newMessage)
        setImageFile(null)
      } else {
        // Send text message
        await sendMessage(
          newMessage, 
          'text', 
          null, 
          replyingTo ? replyingTo.id : null
        )
      }
      setNewMessage('')
      setReplyingTo(null)
      clearTypingIndicator()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // Handle typing indicator
  const handleTyping = () => {
    if (selectedChat) {
      setTypingIndicator(selectedChat.id)
    }
  }

  // Handle message edit
  const handleEditMessage = async () => {
    if (!editingMessage || !editingMessage.id || !newMessage.trim()) return

    try {
      await editMessage(editingMessage.id, newMessage)
      setEditingMessage(null)
      setNewMessage('')
    } catch (error) {
      console.error('Failed to edit message:', error)
    }
  }

  // Start editing a message
  const startEditMessage = (message) => {
    if (message.sender_id !== user.id) return
    setEditingMessage(message)
    setNewMessage(message.content)
    setShowOptions(null)
    if (messageInputRef.current) {
      messageInputRef.current.focus()
    }
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingMessage(null)
    setNewMessage('')
  }

  // Handle message deletion with confirmation
  const handleConfirmDeleteMessage = async (message) => {
    try {
      await deleteMessage(message)
      setShowDeleteConfirm(null)
      setShowOptions(null)
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }

  // Handle message deletion
  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId)
      setShowOptions(null)
    } catch (error) {
      setShowErrorModal({
        title: 'Delete Failed',
        message: 'Could not delete this message',
        type: 'error'
      })
      console.error('Failed to delete message:', error)
    }
  }

  // Handle image upload error
  const [showErrorModal, setShowErrorModal] = useState(null)
  const handleErrorModalClose = () => {
    setShowErrorModal(null)
  }

  // Start a new conversation
  const handleStartNewConversation = async (userId) => {
    try {
      const conversationId = await getOrCreateDirectConversation(userId)
      if (conversationId) {
        const conversation = conversations.find(c => c.id === conversationId)
        setSelectedChat(conversation)
      }
      setShowNewChatModal(false)
    } catch (error) {
      console.error('Failed to start conversation:', error)
    }
  }

  // Render message time
  const renderMessageTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  // Get user status color
  const getStatusColor = (userId) => {
    const status = getUserStatus(userId)
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      default: return 'bg-gray-400'
    }
  }

  // Setup long press handler
  const handleLongPress = (messageId) => setShowOptions(messageId)

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
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiPlus className="text-xl" />
              </button>
            </div>

            {/* Search */}
            <div className="mt-4 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner size="lg" />
              </div>
            ) : conversationsError ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-2">Failed to load conversations</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  Try again
                </button>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? 'Try a different search term' 
                    : 'Start a conversation with someone'}
                </p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
                >
                  <FiPlus className="mr-2" />
                  New Message
                </button>
              </div>
            ) : (
              <div className="max-w-lg mx-auto">
                {filteredConversations.map((chat, index) => {
                  const hasUnread = chat.unreadCount > 0
                  
                  return (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedChat(chat)}
                      className={`flex items-center space-x-4 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                        hasUnread ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={chat.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                          alt={chat.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {chat.participants.length > 0 && (
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${
                            getStatusColor(chat.participants[0].user_id)
                          } border-2 border-white rounded-full`}></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-semibold ${hasUnread ? 'text-gray-900' : 'text-gray-700'} truncate`}>
                            {chat.name}
                          </h3>
                          {chat.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(chat.lastMessage.createdAt, { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          {chat.lastMessage ? (
                            <p className={`text-sm truncate ${
                              hasUnread ? 'text-gray-900 font-medium' : 'text-gray-600'
                            }`}>
                              {chat.lastMessage.isFromCurrentUser && 'You: '}
                              {chat.lastMessage.content}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No messages yet</p>
                          )}
                          {hasUnread && (
                            <div className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
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
                  onClick={() => {
                    setSelectedChat(null)
                    setNewMessage('')
                    setReplyingTo(null)
                    setEditingMessage(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiArrowLeft className="text-xl" />
                </button>
                <div className="relative">
                  <img
                    src={selectedChat.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                    alt={selectedChat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {selectedChat.participants.length > 0 && (
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${
                      getStatusColor(selectedChat.participants[0].user_id)
                    } border-2 border-white rounded-full`}></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedChat.name}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedChat.participants.length > 0 && (
                      getUserStatus(selectedChat.participants[0].user_id) === 'online'
                        ? 'Active now'
                        : getUserStatus(selectedChat.participants[0].user_id) === 'away'
                        ? 'Away'
                        : 'Last seen recently'
                    )}
                    {selectedChat.type === 'group' && `${selectedChat.participants.length + 1} members`}
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
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messagesLoading ? (
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner size="lg" />
              </div>
            ) : messagesError ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-2">Failed to load messages</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  Try again
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No messages yet
                </h3>
                <p className="text-gray-600">
                  Send a message to start the conversation
                </p>
              </div>
            ) : (
              <div className="max-w-lg mx-auto space-y-4">
                {messages.map((message, index) => {
                  const isCurrentUser = message.sender_id === user.id
                  const isOptionsOpen = showOptions === message.id
                  const isTyping = selectedChat.participants.length > 0 && 
                                  isUserTyping(selectedChat.participants[0].user_id, selectedChat.id)

                  // Create long press handler
                  const longPressProps = useLongPress(() => {
                    if (isCurrentUser) {
                      handleLongPress(message.id)
                    }
                  }, 500)
                  
                  return (
                    <div key={message.id} className="space-y-1">
                      {/* Reply reference */}
                      {message.reply_to && (
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-3 py-1 rounded-lg text-xs ${
                            isCurrentUser
                              ? 'bg-primary-100 text-primary-800 mr-4'
                              : 'bg-gray-200 text-gray-800 ml-4'
                          }`}>
                            <p className="font-medium">
                              {message.reply_to.sender?.profiles?.display_name || 'User'}
                            </p>
                            <p className="truncate">{message.reply_to.content}</p>
                          </div>
                        </div>
                      )}

                      {/* Message */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex relative group ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        {...(isCurrentUser ? longPressProps : {})}
                      >
                        {!isCurrentUser && (
                          <img
                            src={message.senderAvatar}
                            alt={message.senderName}
                            className="w-8 h-8 rounded-full object-cover mr-2 self-end"
                          />
                        )}
                        
                        <div className={`relative max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isCurrentUser
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}>
                          {message.message_type === 'text' ? (
                            <>
                              <p className="text-sm leading-relaxed break-words">{message.content}</p>
                              <div className={`flex items-center text-xs mt-1 ${
                                isCurrentUser ? 'text-primary-100' : 'text-gray-500'
                              }`}>
                                <span>{renderMessageTime(message.created_at)}</span>
                                {message.is_edited && (
                                  <span className="ml-1">(edited)</span>
                                )}
                                {isCurrentUser && message.id === messages[messages.length - 1].id && (
                                  <span className="ml-1">✓</span>
                                )}
                              </div>
                            </>
                          ) : message.message_type === 'image' && (
                            <div className="space-y-1">
                              <img
                                src={message.media_url}
                                alt="Shared image"
                                className="rounded-lg max-h-60 w-auto"
                              />
                              <div className={`flex items-center text-xs ${
                                isCurrentUser ? 'text-primary-100' : 'text-gray-500'
                              }`}>
                                <span>{renderMessageTime(message.created_at)}</span>
                              </div>
                            </div>
                          )}

                          {/* Message options */}
                          {isCurrentUser && (
                            <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowOptions(isOptionsOpen ? null : message.id)
                                }}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                              >
                                <FiMoreVertical className="text-gray-600 text-sm" />
                              </button>
                              
                              {isOptionsOpen && (
                                <div className="absolute right-full top-0 mt-2 mr-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
                                  <button
                                    onClick={() => startEditMessage(message)}
                                    className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                                  >
                                    <FiEdit2 className="text-gray-600" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(message)}
                                    className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-red-50 transition-colors text-red-600"
                                  >
                                    <FiTrash2 />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Reply button */}
                          <div className={`absolute ${
                            isCurrentUser ? '-left-10' : '-right-10'
                          } bottom-0 opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <button
                              onClick={() => setReplyingTo(message)}
                              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <FiCornerUpLeft className="text-gray-600 text-sm" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )
                })}

                {/* Typing indicator */}
                {selectedChat.participants.length > 0 && 
                 isUserTyping(selectedChat.participants[0].user_id, selectedChat.id) && (
                  <div className="flex items-end space-x-2">
                    <img
                      src={selectedChat.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                      alt={selectedChat.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="bg-white px-4 py-3 rounded-2xl border border-gray-200 inline-flex">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Reply indicator */}
          {replyingTo && (
            <div className="bg-gray-100 px-4 py-2 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiCornerUpLeft className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">
                    Replying to <span className="font-medium">{replyingTo.senderName}</span>
                  </p>
                  <p className="text-sm text-gray-700 truncate">{replyingTo.content}</p>
                </div>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <FiX className="text-gray-500" />
              </button>
            </div>
          )}

          {/* Edit indicator */}
          {editingMessage && (
            <div className="bg-blue-50 px-4 py-2 border-t border-blue-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiEdit2 className="text-blue-500" />
                <div>
                  <p className="text-xs text-blue-500 font-medium">
                    Editing message
                  </p>
                </div>
              </div>
              <button
                onClick={cancelEdit}
                className="p-1 hover:bg-blue-100 rounded-full transition-colors"
              >
                <FiX className="text-blue-500" />
              </button>
            </div>
          )}

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-lg mx-auto">
              <form 
                onSubmit={editingMessage ? handleEditMessage : handleSendMessage} 
                className="flex items-center space-x-3"
              >
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FiImage className="text-xl" />
                </button>
                
                {/* Image preview */}
                {imageUpload.preview && (
                  <div className="absolute bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                    <div className="flex items-start space-x-3">
                      <div className="relative w-20 h-20">
                        <img 
                          src={imageUpload.preview} 
                          alt="Upload preview" 
                          className="w-full h-full rounded-md object-cover"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <FiX className="text-xs" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Ready to send image</p>
                        <p className="text-xs text-gray-500">Optional: Add a caption below</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex-1 relative">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleTyping}
                    placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
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
                  disabled={(!newMessage.trim() && !imageFile) || sending || imageUpload.loading}
                  className="p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-full transition-colors flex items-center justify-center"
                >
                  {sending || imageUpload.loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : editingMessage ? (
                    <FiCheck className="text-lg" />
                  ) : (
                    <FiSend className="text-lg" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowNewChatModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">New Message</h2>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="text-xl text-gray-600" />
                </button>
              </div>

              {/* Search */}
              <div className="p-6 border-b border-gray-100">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={handleUserSearchChange}
                    placeholder="Search by name or username..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* User List */}
              <div className="max-h-96 overflow-y-auto p-6">
                {isLoadingUsers ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : userSearchError ? (
                  <div className="text-center py-8">
                    <p className="text-red-500 mb-2">{userSearchError}</p>
                    <button
                      onClick={fetchUsers}
                      className="text-primary-500 hover:text-primary-600 font-medium"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        {userSearchQuery ? 'Search Results' : 'Suggested Users'}
                      </h3>
                      {!userSearchQuery && filteredUsers.length >= 10 && (
                        <button 
                          onClick={() => fetchUsers()}
                          className="text-primary-500 text-sm font-medium"
                        >
                          Refresh
                        </button>
                      )}
                    </div>

                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No users found
                        </h3>
                        <p className="text-gray-600">
                          Try searching with a different term
                        </p>
                      </div>
                    ) : (
                      filteredUsers.map((userProfile) => (
                        <motion.div
                          key={userProfile.id}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleStartNewConversation(userProfile.id)}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                        >
                          <div className="relative">
                            <img
                              src={userProfile.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                              alt={userProfile.display_name || userProfile.username}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
                              }}
                            />
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${
                              getStatusColor(userProfile.id)
                            } border-2 border-white rounded-full`}></div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-1">
                              <h4 className="font-medium text-gray-900">{userProfile.display_name || userProfile.username || 'User'}</h4>
                              {userProfile.is_verified && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {userProfile.username ? `@${userProfile.username}` : 'No username'}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {/* Create Group Chat */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <FiUsers className="text-gray-700" />
                    <span className="font-medium text-gray-800">Create Group Chat</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Delete Message?</h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. The message will be permanently deleted.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmDeleteMessage(showDeleteConfirm)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <FiTrash2 className="text-sm" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleErrorModalClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{showErrorModal.title || 'Error'}</h3>
              <p className="text-gray-600 mb-6">
                {showErrorModal.message || 'An error occurred. Please try again.'}
              </p>
              <button
                onClick={handleErrorModalClose}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MessagesPage