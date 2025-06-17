import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useStories = () => {
  const { user } = useAuth()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const channelRef = useRef(null)

  // Fetch stories from database
  const fetchStories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('stories')
        .select(`
          *,
          profiles!stories_creator_id_fkey (
            username,
            display_name,
            avatar_url,
            is_verified,
            user_type
          ),
          story_views!left (
            viewer_id
          )
        `)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      // Process stories to add view status
      const processedStories = data.map(story => ({
        ...story,
        user: story.profiles,
        isViewed: user ? story.story_views.some(view => view.viewer_id === user.id) : false
      }))

      // Group stories by creator
      const groupedStories = processedStories.reduce((acc, story) => {
        const creatorId = story.creator_id
        if (!acc[creatorId]) {
          acc[creatorId] = {
            user: story.user,
            stories: [],
            hasUnviewed: false
          }
        }
        acc[creatorId].stories.push(story)
        if (!story.isViewed) {
          acc[creatorId].hasUnviewed = true
        }
        return acc
      }, {})

      // Convert to array and sort by unviewed first
      const sortedStories = Object.values(groupedStories).sort((a, b) => {
        if (a.hasUnviewed && !b.hasUnviewed) return -1
        if (!a.hasUnviewed && b.hasUnviewed) return 1
        return new Date(b.stories[0].created_at) - new Date(a.stories[0].created_at)
      })

      setStories(sortedStories)
    } catch (error) {
      console.error('Error fetching stories:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Mark story as viewed
  const markStoryAsViewed = useCallback(async (storyId) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('story_views')
        .upsert({
          story_id: storyId,
          viewer_id: user.id
        })

      if (error) {
        console.error('Error marking story as viewed:', error)
        return
      }

      // Update local state
      setStories(prevStories => 
        prevStories.map(storyGroup => ({
          ...storyGroup,
          stories: storyGroup.stories.map(story => 
            story.id === storyId 
              ? { ...story, isViewed: true }
              : story
          ),
          hasUnviewed: storyGroup.stories.some(story => 
            story.id !== storyId && !story.isViewed
          )
        }))
      )
    } catch (error) {
      console.error('Error marking story as viewed:', error)
    }
  }, [user])

  // Like/unlike story
  const toggleStoryLike = useCallback(async (storyId, isLiked) => {
    if (!user) return

    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('story_interactions')
          .delete()
          .eq('story_id', storyId)
          .eq('user_id', user.id)
          .eq('interaction_type', 'like')

        if (error) throw error
      } else {
        // Add like
        const { error } = await supabase
          .from('story_interactions')
          .insert({
            story_id: storyId,
            user_id: user.id,
            interaction_type: 'like'
          })

        if (error) throw error
      }

      // Update local state
      setStories(prevStories => 
        prevStories.map(storyGroup => ({
          ...storyGroup,
          stories: storyGroup.stories.map(story => 
            story.id === storyId 
              ? { 
                  ...story, 
                  like_count: isLiked ? story.like_count - 1 : story.like_count + 1,
                  isLiked: !isLiked
                }
              : story
          )
        }))
      )
    } catch (error) {
      console.error('Error toggling story like:', error)
    }
  }, [user])

  // Delete story
  const deleteStory = useCallback(async (storyId) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('stories')
        .update({ is_active: false })
        .eq('id', storyId)
        .eq('creator_id', user.id)

      if (error) throw error

      // Remove from local state
      setStories(prevStories => 
        prevStories.map(storyGroup => ({
          ...storyGroup,
          stories: storyGroup.stories.filter(story => story.id !== storyId)
        })).filter(storyGroup => storyGroup.stories.length > 0)
      )
    } catch (error) {
      console.error('Error deleting story:', error)
      throw error
    }
  }, [user])

  // Set up real-time subscription
  useEffect(() => {
    fetchStories()

    // Only create and subscribe to channel if it doesn't exist
    if (!channelRef.current) {
      channelRef.current = supabase
        .channel('stories_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stories'
          },
          (payload) => {
            console.log('Story change detected:', payload)
            fetchStories() // Refetch stories on any change
          }
        )
        .subscribe()
    }

    return () => {
      // Clean up the channel when component unmounts
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [fetchStories])

  return {
    stories,
    loading,
    error,
    fetchStories,
    markStoryAsViewed,
    toggleStoryLike,
    deleteStory
  }
}