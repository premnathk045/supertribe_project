import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiHeart, FiUserPlus, FiMessageCircle, FiDollarSign } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { notifications } from '../data/dummyData'

function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [notificationList, setNotificationList] = useState(notifications)

  const markAsRead = (id) => {
    setNotificationList(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    )
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <FiHeart className="text-red-500" />
      case 'follow':
        return <FiUserPlus className="text-blue-500" />
      case 'comment':
        return <FiMessageCircle className="text-green-500" />
      case 'purchase':
        return <FiDollarSign className="text-yellow-500" />
      default:
        return <FiHeart className="text-gray-500" />
    }
  }

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'like':
        return `${notification.fromUser.displayName} liked your post`
      case 'follow':
        return `${notification.fromUser.displayName} started following you`
      case 'comment':
        return `${notification.fromUser.displayName} commented: "${notification.comment}"`
      case 'purchase':
        return `${notification.fromUser.displayName} purchased your content for $${notification.amount}`
      default:
        return 'New notification'
    }
  }

  const filteredNotifications = activeTab === 'all' 
    ? notificationList 
    : notificationList.filter(notif => notif.type === 'comment')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
          <div className="px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Notifications</h1>
            
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('mentions')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === 'mentions'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mentions
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 space-y-3">
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => markAsRead(notification.id)}
              className={`bg-white p-4 rounded-xl border transition-all cursor-pointer ${
                notification.isRead 
                  ? 'border-gray-200' 
                  : 'border-primary-200 bg-primary-50/50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <img
                    src={notification.fromUser.avatar}
                    alt={notification.fromUser.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 leading-relaxed">
                    {getNotificationText(notification)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                  </p>
                </div>

                {notification.post && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={notification.post.media[0]?.url}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {!notification.isRead && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                )}
              </div>
            </motion.div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-600">When you get notifications, they'll show up here</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default NotificationsPage