import { supabase } from './supabase'

// Storage configuration
export const STORAGE_BUCKETS = {
  STORY_MEDIA: 'story-media',
  STORY_THUMBNAILS: 'story-thumbnails'
}

// File type configurations
export const FILE_CONFIGS = {
  images: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
  },
  videos: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/mov', 'video/quicktime'],
    allowedExtensions: ['.mp4', '.mov']
  }
}

/**
 * Validate file type and size
 */
export const validateFile = (file, type) => {
  const config = FILE_CONFIGS[type]
  
  if (!config) {
    throw new Error(`Invalid file type configuration: ${type}`)
  }

  // Check file size
  if (file.size > config.maxSize) {
    throw new Error(`File size too large. Maximum size: ${config.maxSize / (1024 * 1024)}MB`)
  }

  // Check MIME type
  if (!config.allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`)
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop().toLowerCase()
  if (!config.allowedExtensions.includes(extension)) {
    throw new Error(`Invalid file extension. Allowed extensions: ${config.allowedExtensions.join(', ')}`)
  }

  return true
}

/**
 * Compress image before upload
 */
export const compressImage = (file, maxWidth = 1080, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Generate unique file path
 */
export const generateFilePath = (userId, fileType, originalName) => {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop()
  const folder = fileType === 'video' ? 'videos' : 'images'
  
  return `${folder}/${userId}/${timestamp}.${extension}`
}

/**
 * Upload file to Supabase Storage
 */
export const uploadStoryMedia = async (file, userId, onProgress) => {
  try {
    // Validate file
    const fileType = file.type.startsWith('video') ? 'videos' : 'images'
    validateFile(file, fileType)

    // Compress image if needed
    let processedFile = file
    if (file.type.startsWith('image')) {
      processedFile = await compressImage(file)
    }

    // Generate file path
    const filePath = generateFilePath(userId, fileType, file.name)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.STORY_MEDIA)
      .upload(filePath, processedFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.STORY_MEDIA)
      .getPublicUrl(filePath)

    return {
      path: filePath,
      url: urlData.publicUrl,
      size: processedFile.size,
      type: processedFile.type
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

/**
 * Generate video thumbnail
 */
export const generateVideoThumbnail = (videoFile) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      video.currentTime = 1 // Seek to 1 second
    }

    video.onseeked = () => {
      ctx.drawImage(video, 0, 0)
      canvas.toBlob(resolve, 'image/jpeg', 0.7)
    }

    video.onerror = reject
    video.src = URL.createObjectURL(videoFile)
  })
}

/**
 * Upload video thumbnail
 */
export const uploadVideoThumbnail = async (thumbnailBlob, userId, videoPath) => {
  try {
    const thumbnailPath = videoPath.replace('/videos/', '/thumbnails/').replace(/\.[^/.]+$/, '.jpg')

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.STORY_THUMBNAILS)
      .upload(thumbnailPath, thumbnailBlob, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Thumbnail upload failed: ${error.message}`)
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.STORY_THUMBNAILS)
      .getPublicUrl(thumbnailPath)

    return urlData.publicUrl
  } catch (error) {
    console.error('Thumbnail upload error:', error)
    throw error
  }
}

/**
 * Delete file from storage
 */
export const deleteStoryMedia = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.STORY_MEDIA)
      .remove([filePath])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

/**
 * Get signed URL for private content
 */
export const getSignedUrl = async (filePath, expiresIn = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.STORY_MEDIA)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      throw new Error(`Signed URL generation failed: ${error.message}`)
    }

    return data.signedUrl
  } catch (error) {
    console.error('Signed URL error:', error)
    throw error
  }
}