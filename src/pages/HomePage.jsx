import { motion } from 'framer-motion'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import StoriesCarousel from '../components/Stories/StoriesCarousel'
import PostFeed from '../components/Feed/PostFeed'

function HomePage() {
  const { openStoryViewer, openPostDetail, openShareSheet, openStoryCreation } = useOutletContext()
  const { isCreator } = useAuth()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* Stories Section */}
      <div className="bg-white border-b border-gray-200">
        <StoriesCarousel 
          onStoryClick={openStoryViewer}
          onCreateStory={isCreator() ? openStoryCreation : undefined}
        />
      </div>

      {/* Posts Feed */}
      <div className="max-w-lg mx-auto">
        <PostFeed 
          onPostClick={openPostDetail} // Opens modal in main feed
          onShareClick={openShareSheet}
        />
      </div>
    </motion.div>
  )
}

export default HomePage