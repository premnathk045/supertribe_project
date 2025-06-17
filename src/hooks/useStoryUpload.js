import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { 
  uploadStoryMedia, 
  generateVideoThumbnail, 
  uploadVideoThumbnail,
  deleteStoryMedia 
} from '../lib/supabaseStorage'
import { useAuth } from '../contexts/AuthContext'

export const useStoryUpload = () => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const uploadStory = useCallback(async (storyData) => {
    if (!user) {
      throw new Error('User must be authenticated')
    }

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      let mediaUrl = null
      let mediaPath = null
      let thumbnailUrl = null
      let fileSize = null
      let fileType = null
      let duration = null

      // Handle media upload
      if (storyData.media) {
        setProgress(20)
        
        // Upload main media file
        const uploadResult = await uploadStoryMedia(
          storyData.media, 
          user.id,
          (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 60) / progressEvent.total)
            setProgress(20 + percentCompleted)
          }
        )

        mediaUrl = uploadResult.url
        mediaPath = uploadResult.path
        fileSize = uploadResult.size
        fileType = uploadResult.type

        setProgress(80)

        // Generate and upload thumbnail for videos
        if (storyData.type === 'video') {
          try {
            const thumbnailBlob = await generateVideoThumbnail(storyData.media)
            thumbnailUrl = await uploadVideoThumbnail(thumbnailBlob, user.id, uploadResult.path)
            
            // Get video duration
            const video = document.createElement('video')
            video.src = URL.createObjectURL(storyData.media)
            await new Promise((resolve) => {
              video.onloadedmetadata = () => {
                duration = Math.round(video.duration)
                resolve()
              }
            })
          } catch (thumbnailError) {
            console.warn('Thumbnail generation failed:', thumbnailError)
          }
        }

        setProgress(90)
      }

      // Save story to database
      const storyRecord = {
        creator_id: user.id,
        content_type: storyData.type,
        media_url: mediaUrl,
        media_path: mediaPath,
        caption: storyData.caption || null,
        text_content: storyData.text || null,
        text_style: storyData.textStyle || {},
        background_style: storyData.background || {},
        file_size: fileSize,
        file_type: fileType,
        duration: duration,
        thumbnail_url: thumbnailUrl,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }

      const { data, error: dbError } = await supabase
        .from('stories')
        .insert(storyRecord)
        .select(`
          *,
          profiles:creator_id (
            username,
            display_name,
            avatar_url,
            is_verified,
            user_type
          )
        `)
        .single()

      if (dbError) {
        // Cleanup uploaded media if database insert fails
        if (mediaPath) {
          await deleteStoryMedia(mediaPath)
        }
        throw new Error(`Database error: ${dbError.message}`)
      }

      setProgress(100)
      return data

    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }, [user])

  const reset = useCallback(() => {
    setError(null)
    setProgress(0)
    setUploading(false)
  }, [])

  return {
    uploadStory,
    uploading,
    progress,
    error,
    reset
  }
}