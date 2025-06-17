import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useStoryInteractions = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  // Get user's interactions for a story
  const getStoryInteractions = useCallback(async (storyId) => {
    if (!user) return {}

    try {
      const { data, error } = await supabase
        .from('story_interactions')
        .select('interaction_type, reaction_emoji')
        .eq('story_id', storyId)
        .eq('user_id', user.id)

      if (error) throw error

      return data.reduce((acc, interaction) => {
        acc[interaction.interaction_type] = interaction.reaction_emoji || true
        return acc
      }, {})
    } catch (error) {
      console.error('Error fetching story interactions:', error)
      return {}
    }
  }, [user])

  // Add reaction to story
  const addStoryReaction = useCallback(async (storyId, emoji) => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('story_interactions')
        .upsert({
          story_id: storyId,
          user_id: user.id,
          interaction_type: 'reaction',
          reaction_emoji: emoji
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error adding story reaction:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [user])

  // Share story
  const shareStory = useCallback(async (storyId) => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('story_interactions')
        .insert({
          story_id: storyId,
          user_id: user.id,
          interaction_type: 'share'
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error sharing story:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [user])

  // Get story analytics (for creators)
  const getStoryAnalytics = useCallback(async (storyId) => {
    if (!user) return null

    try {
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .eq('creator_id', user.id)
        .single()

      if (storyError) throw storyError

      const { data: views, error: viewsError } = await supabase
        .from('story_views')
        .select(`
          viewer_id,
          viewed_at,
          profiles:viewer_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('story_id', storyId)
        .order('viewed_at', { ascending: false })

      if (viewsError) throw viewsError

      const { data: interactions, error: interactionsError } = await supabase
        .from('story_interactions')
        .select(`
          interaction_type,
          reaction_emoji,
          created_at,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('story_id', storyId)
        .order('created_at', { ascending: false })

      if (interactionsError) throw interactionsError

      return {
        story,
        views,
        interactions,
        analytics: {
          totalViews: views.length,
          totalLikes: interactions.filter(i => i.interaction_type === 'like').length,
          totalShares: interactions.filter(i => i.interaction_type === 'share').length,
          totalReactions: interactions.filter(i => i.interaction_type === 'reaction').length
        }
      }
    } catch (error) {
      console.error('Error fetching story analytics:', error)
      throw error
    }
  }, [user])

  return {
    loading,
    getStoryInteractions,
    addStoryReaction,
    shareStory,
    getStoryAnalytics
  }
}