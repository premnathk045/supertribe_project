import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import TopNavigation from './TopNavigation'
import BottomNavigation from './BottomNavigation'
import SettingsModal from '../Modals/SettingsModal'
import PostDetailModal from '../Modals/PostDetailModal'
import ShareSheetModal from '../Modals/ShareSheetModal'
import StoryCreationModal from '../Stories/StoryCreationModal'
import StoryViewer from '../Stories/StoryViewer'

function Layout() {
  const location = useLocation()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [storyViewerOpen, setStoryViewerOpen] = useState(false)
  const [postDetailOpen, setPostDetailOpen] = useState(false)
  const [shareSheetOpen, setShareSheetOpen] = useState(false)
  const [storyCreationOpen, setStoryCreationOpen] = useState(false)
  const [selectedStoryGroup, setSelectedStoryGroup] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)

  const hideNavigation = location.pathname === '/create' || location.pathname === '/messages'

  const handleStoryPublish = (storyData) => {
    console.log('Story published successfully:', storyData)
    // The story will automatically appear in the carousel via real-time subscription
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavigation && (
        <TopNavigation onSettingsClick={() => setSettingsOpen(true)} />
      )}
      
      <main className={`${!hideNavigation ? 'pt-16 pb-20' : ''} transition-all duration-300`}>
        <Outlet context={{
          openStoryViewer: (storyGroup) => {
            setSelectedStoryGroup(storyGroup)
            setStoryViewerOpen(true)
          },
          openPostDetail: (post) => {
            setSelectedPost(post)
            setPostDetailOpen(true)
          },
          openShareSheet: () => setShareSheetOpen(true),
          openStoryCreation: () => setStoryCreationOpen(true)
        }} />
      </main>

      {!hideNavigation && <BottomNavigation />}

      {/* Modals */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
      
      <StoryViewer
        isOpen={storyViewerOpen}
        storyGroup={selectedStoryGroup}
        onClose={() => {
          setStoryViewerOpen(false)
          setSelectedStoryGroup(null)
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

      <StoryCreationModal
        isOpen={storyCreationOpen}
        onClose={() => setStoryCreationOpen(false)}
        onPublish={handleStoryPublish}
      />
    </div>
  )
}

export default Layout