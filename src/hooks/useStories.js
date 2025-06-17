import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchActiveStories, markStoryAsViewed } from '../lib/stories'

export const useStories = () => {
  const { user } = useAuth()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadStories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchActiveStories()
      setStories(data)
    } catch (err) {
      console.error('Error loading stories:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const viewStory = async (storyId) => {
    if (!user) return

    try {
      await markStoryAsViewed(storyId, user.id)
      
      // Update local state to mark as viewed
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, isViewed: true }
          : story
      ))
    } catch (err) {
      console.error('Error marking story as viewed:', err)
    }
  }

  const addNewStory = (newStory) => {
    setStories(prev => [newStory, ...prev])
  }

  const removeStory = (storyId) => {
    setStories(prev => prev.filter(story => story.id !== storyId))
  }

  useEffect(() => {
    loadStories()
  }, [])

  return {
    stories,
    loading,
    error,
    loadStories,
    viewStory,
    addNewStory,
    removeStory
  }
}