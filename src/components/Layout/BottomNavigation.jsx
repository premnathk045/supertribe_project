import { NavLink, useLocation } from 'react-router-dom'
import { FiHome, FiSearch, FiPlusSquare, FiUser, FiMessageCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/', icon: FiHome, label: 'Home' },
  { path: '/discover', icon: FiSearch, label: 'Discover' },
  { path: '/create', icon: FiPlusSquare, label: 'Create' },
  { path: '/messages', icon: FiMessageCircle, label: 'Messages' },
  { path: '/profile/johndoe', icon: FiUser, label: 'Profile' }
]

function BottomNavigation() {
  const location = useLocation()

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 bottom-nav-safe"
    >
      <div className="max-w-lg mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            
            return (
              <NavLink
                key={path}
                to={path}
                className="flex flex-col items-center py-2 px-3 relative"
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Icon 
                    className={`text-2xl ${
                      isActive ? 'text-primary-500' : 'text-gray-600'
                    } transition-colors`} 
                  />
                  {/* Notification badge for messages */}
                  {path === '/messages' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full"></div>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"
                    />
                  )}
                </motion.div>
                <span className={`text-xs mt-1 ${
                  isActive ? 'text-primary-500' : 'text-gray-600'
                } transition-colors`}>
                  {label}
                </span>
              </NavLink>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}

export default BottomNavigation