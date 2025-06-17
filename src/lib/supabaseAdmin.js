import { supabase } from './supabase'

/**
 * Admin functions for managing storage buckets and policies
 * These should be run once during setup
 */

export const createStorageBuckets = async () => {
  try {
    // Create story-media bucket
    const { data: mediaBucket, error: mediaBucketError } = await supabase.storage
      .createBucket('story-media', {
        public: true,
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/webp',
          'video/mp4',
          'video/mov',
          'video/quicktime'
        ],
        fileSizeLimit: 100 * 1024 * 1024 // 100MB
      })

    if (mediaBucketError && !mediaBucketError.message.includes('already exists')) {
      console.error('Error creating story-media bucket:', mediaBucketError)
    }

    // Create story-thumbnails bucket
    const { data: thumbnailBucket, error: thumbnailBucketError } = await supabase.storage
      .createBucket('story-thumbnails', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      })

    if (thumbnailBucketError && !thumbnailBucketError.message.includes('already exists')) {
      console.error('Error creating story-thumbnails bucket:', thumbnailBucketError)
    }

    console.log('Storage buckets created successfully')
    return { mediaBucket, thumbnailBucket }
  } catch (error) {
    console.error('Error creating storage buckets:', error)
    throw error
  }
}

export const createStoragePolicies = async () => {
  try {
    // Note: Storage policies need to be created via SQL or Supabase Dashboard
    // This is a reference for the policies that should be created
    
    const policies = [
      {
        name: 'Allow authenticated users to upload story media',
        bucket: 'story-media',
        operation: 'INSERT',
        definition: 'auth.role() = "authenticated"'
      },
      {
        name: 'Allow public read access to story media',
        bucket: 'story-media', 
        operation: 'SELECT',
        definition: 'true'
      },
      {
        name: 'Allow users to delete own story media',
        bucket: 'story-media',
        operation: 'DELETE',
        definition: 'auth.uid()::text = (storage.foldername(name))[1]'
      },
      {
        name: 'Allow authenticated users to upload thumbnails',
        bucket: 'story-thumbnails',
        operation: 'INSERT', 
        definition: 'auth.role() = "authenticated"'
      },
      {
        name: 'Allow public read access to thumbnails',
        bucket: 'story-thumbnails',
        operation: 'SELECT',
        definition: 'true'
      }
    ]

    console.log('Storage policies to be created:', policies)
    return policies
  } catch (error) {
    console.error('Error creating storage policies:', error)
    throw error
  }
}

/**
 * Cleanup expired stories and their media files
 */
export const cleanupExpiredStories = async () => {
  try {
    // Get expired stories
    const { data: expiredStories, error: fetchError } = await supabase
      .from('stories')
      .select('id, media_path, thumbnail_url')
      .eq('is_active', true)
      .lt('expires_at', new Date().toISOString())

    if (fetchError) {
      throw fetchError
    }

    if (expiredStories.length === 0) {
      console.log('No expired stories to cleanup')
      return
    }

    // Mark stories as inactive
    const { error: updateError } = await supabase
      .from('stories')
      .update({ is_active: false })
      .in('id', expiredStories.map(s => s.id))

    if (updateError) {
      throw updateError
    }

    // Delete media files
    const mediaFiles = expiredStories
      .filter(s => s.media_path)
      .map(s => s.media_path)

    if (mediaFiles.length > 0) {
      const { error: deleteMediaError } = await supabase.storage
        .from('story-media')
        .remove(mediaFiles)

      if (deleteMediaError) {
        console.error('Error deleting media files:', deleteMediaError)
      }
    }

    // Delete thumbnail files
    const thumbnailFiles = expiredStories
      .filter(s => s.thumbnail_url)
      .map(s => s.thumbnail_url.split('/').pop())

    if (thumbnailFiles.length > 0) {
      const { error: deleteThumbnailError } = await supabase.storage
        .from('story-thumbnails')
        .remove(thumbnailFiles)

      if (deleteThumbnailError) {
        console.error('Error deleting thumbnail files:', deleteThumbnailError)
      }
    }

    console.log(`Cleaned up ${expiredStories.length} expired stories`)
    return expiredStories.length
  } catch (error) {
    console.error('Error cleaning up expired stories:', error)
    throw error
  }
}