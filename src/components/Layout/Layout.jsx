import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import TopNavigation from './TopNavigation'
import BottomNavigation from './BottomNavigation'
import SettingsModal from '../Modals/SettingsModal'
import StoryViewerModal from '../Modals/StoryViewerModal'
import PostDetailModal from '../Modals/PostDetailModal'
import ShareSheetModal from '../Modals/ShareSheetModal'

function Layout() {
  const location = useLocation()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [storyViewerOpen, setStoryViewerOpen] = useState(false)
  const [postDetailOpen, setPostDetailOpen] = useState(false)
  const [shareSheetOpen, setShareSheetOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)

  const hideNavigation = location.pathname === '/create' || location.pathname === '/messages'

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavigation && (
        <TopNavigation onSettingsClick={() => setSettingsOpen(true)} />
      )}
      
      <main className={`${!hideNavigation ? 'pt-16 pb-20' : ''} transition-all duration-300`}>
        <Outlet context={{
          openStoryViewer: (story) => {
            setSelectedStory(story)
            setStoryViewerOpen(true)
          },
          openPostDetail: (post) => {
            setSelectedPost(post)
            setPostDetailOpen(true)
          },
          openShareSheet: () => setShareSheetOpen(true)
        }} />
      </main>

      {!hideNavigation && <BottomNavigation />}

      {/* Modals */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
      
      <StoryViewerModal
        isOpen={storyViewerOpen}
        story={selectedStory}
        onClose={() => {
          setStoryViewerOpen(false)
          setSelectedStory(null)
        }}
      />
      
      <PostDetailModal
        isOpen={postDetailOpen}
        post={selectedPost}
        onClose={() => {
          setPostDetailOpen(false)
          setSelectedPost(null)
        }}
        onShare={() => setShareSheetOpen(true)}
      />
      
      <ShareSheetModal
        isOpen={shareSheetOpen}
        onClose={() => setShareSheetOpen(false)}
      />
    </div>
  )
}

export default Layout