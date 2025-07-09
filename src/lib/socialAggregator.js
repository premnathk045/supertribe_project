import { supabase } from './supabase'

/**
 * Fetch social media links for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of social media links
 */
export const fetchSocialMediaLinks = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('social_media_links')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching social media links:', error)
    throw error
  }
}

/**
 * Add a new social media link
 * @param {string} userId - The user ID
 * @param {Object} linkData - Social media link data
 * @returns {Promise<Object>} - The created social media link
 */
export const addSocialMediaLink = async (userId, linkData) => {
  try {
    const { data, error } = await supabase
      .from('social_media_links')
      .insert([
        {
          user_id: userId,
          ...linkData
        }
      ])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding social media link:', error)
    throw error
  }
}

/**
 * Update a social media link
 * @param {string} linkId - The link ID to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - The updated social media link
 */
export const updateSocialMediaLink = async (linkId, updates) => {
  try {
    const { data, error } = await supabase
      .from('social_media_links')
      .update(updates)
      .eq('id', linkId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating social media link:', error)
    throw error
  }
}

/**
 * Delete a social media link
 * @param {string} linkId - The link ID to delete
 * @returns {Promise<void>}
 */
export const deleteSocialMediaLink = async (linkId) => {
  try {
    const { error } = await supabase
      .from('social_media_links')
      .delete()
      .eq('id', linkId)
    
    if (error) throw error
  } catch (error) {
    console.error('Error deleting social media link:', error)
    throw error
  }
}

/**
 * Reorder social media links
 * @param {string} userId - The user ID
 * @param {Array} orderedLinkIds - Array of link IDs in display order
 * @returns {Promise<void>}
 */
export const reorderSocialMediaLinks = async (userId, orderedLinkIds) => {
  try {
    // Get all existing links
    const { data: existingLinks, error: fetchError } = await supabase
      .from('social_media_links')
      .select('id')
      .eq('user_id', userId)
    
    if (fetchError) throw fetchError
    
    // Create batch updates
    const updates = orderedLinkIds.map((id, index) => ({
      id,
      display_order: index
    }))
    
    // Update only valid links (those that belong to user)
    const validLinkIds = existingLinks.map(link => link.id)
    const validUpdates = updates.filter(update => 
      validLinkIds.includes(update.id)
    )
    
    if (validUpdates.length === 0) return
    
    // Perform update
    const { error } = await supabase
      .from('social_media_links')
      .upsert(validUpdates)
    
    if (error) throw error
  } catch (error) {
    console.error('Error reordering social media links:', error)
    throw error
  }
}

/**
 * Fetch aggregated posts for a user
 * @param {string} userId - The user ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - Array of aggregated posts
 */
export const fetchAggregatedPosts = async (userId, filters = {}) => {
  try {
    let query = supabase
      .from('aggregated_posts')
      .select('*')
      .eq('user_id', userId)
    
    // Apply platform filter
    if (filters.platform) {
      query = query.eq('platform', filters.platform)
    }
    
    // Apply tag filter
    if (filters.tag) {
      query = query.contains('tags', [filters.tag])
    }
    
    // Apply date filters
    if (filters.dateFrom) {
      query = query.gte('published_at', filters.dateFrom)
    }
    
    if (filters.dateTo) {
      query = query.lte('published_at', filters.dateTo)
    }
    
    // Apply ordering
    if (filters.orderBy) {
      const { column, ascending } = filters.orderBy
      query = query.order(column, { ascending })
    } else {
      query = query.order('display_order', { ascending: true })
            .order('published_at', { ascending: false })
    }
    
    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching aggregated posts:', error)
    throw error
  }
}

/**
 * Add a new aggregated post
 * @param {string} userId - The user ID
 * @param {Object} postData - Aggregated post data
 * @returns {Promise<Object>} - The created aggregated post
 */
export const addAggregatedPost = async (userId, postData) => {
  try {
    const { data, error } = await supabase
      .from('aggregated_posts')
      .insert([
        {
          user_id: userId,
          ...postData
        }
      ])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding aggregated post:', error)
    throw error
  }
}

/**
 * Update an aggregated post
 * @param {string} postId - The post ID to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - The updated aggregated post
 */
export const updateAggregatedPost = async (postId, updates) => {
  try {
    const { data, error } = await supabase
      .from('aggregated_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating aggregated post:', error)
    throw error
  }
}

/**
 * Delete an aggregated post
 * @param {string} postId - The post ID to delete
 * @returns {Promise<void>}
 */
export const deleteAggregatedPost = async (postId) => {
  try {
    const { error } = await supabase
      .from('aggregated_posts')
      .delete()
      .eq('id', postId)
    
    if (error) throw error
  } catch (error) {
    console.error('Error deleting aggregated post:', error)
    throw error
  }
}

/**
 * Reorder aggregated posts
 * @param {string} userId - The user ID
 * @param {Array} orderedPostIds - Array of post IDs in display order
 * @returns {Promise<void>}
 */
export const reorderAggregatedPosts = async (userId, orderedPostIds) => {
  try {
    // Get all existing posts
    const { data: existingPosts, error: fetchError } = await supabase
      .from('aggregated_posts')
      .select('id')
      .eq('user_id', userId)
    
    if (fetchError) throw fetchError
    
    // Create batch updates
    const updates = orderedPostIds.map((id, index) => ({
      id,
      display_order: index
    }))
    
    // Update only valid posts (those that belong to user)
    const validPostIds = existingPosts.map(post => post.id)
    const validUpdates = updates.filter(update => 
      validPostIds.includes(update.id)
    )
    
    if (validUpdates.length === 0) return
    
    // Perform update
    const { error } = await supabase
      .from('aggregated_posts')
      .upsert(validUpdates)
    
    if (error) throw error
  } catch (error) {
    console.error('Error reordering aggregated posts:', error)
    throw error
  }
}

/**
 * Fetch bio page settings for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Bio page settings
 */
export const fetchBioPageSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('bio_page_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // No rows returned
      throw error
    }
    
    return data || {
      user_id: userId,
      theme: 'default',
      background_color: '#ffffff',
      text_color: '#000000',
      accent_color: '#ec4899',
      font: 'Inter',
      layout_type: 'grid',
      show_social_links: true,
      show_aggregated_posts: true,
      is_public: true
    }
  } catch (error) {
    console.error('Error fetching bio page settings:', error)
    throw error
  }
}

/**
 * Update bio page settings
 * @param {string} userId - The user ID
 * @param {Object} settings - Settings to update
 * @returns {Promise<Object>} - The updated bio page settings
 */
export const updateBioPageSettings = async (userId, settings) => {
  try {
    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('bio_page_settings')
      .select('user_id')
      .eq('user_id', userId)
      .single()
    
    let result
    
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('bio_page_settings')
        .update(settings)
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      result = data
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from('bio_page_settings')
        .insert([
          {
            user_id: userId,
            ...settings
          }
        ])
        .select()
        .single()
      
      if (error) throw error
      result = data
    }
    
    return result
  } catch (error) {
    console.error('Error updating bio page settings:', error)
    throw error
  }
}

/**
 * Fetch bio page data by username
 * @param {string} username - The username
 * @returns {Promise<Object>} - Bio page data including profile, links, and posts
 */
export const fetchBioPageByUsername = async (username) => {
  try {
    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
    
    if (profileError) throw profileError
    
    // Increment view count
    try {
      await supabase.rpc('increment_bio_page_view_count', { user_id_param: profile.id })
    } catch (e) {
      console.warn('Failed to increment bio page view count:', e)
    }
    
    // Fetch bio page settings
    const { data: bioSettings, error: bioError } = await supabase
      .from('bio_page_settings')
      .select('*')
      .eq('user_id', profile.id)
      .single()
    
    // Fetch social media links
    const { data: links, error: linksError } = await supabase
      .rpc('get_social_links_by_username', { username_param: username })
    
    if (linksError) throw linksError
    
    // Fetch aggregated posts
    const { data: posts, error: postsError } = await supabase
      .from('aggregated_posts')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_visible', true)
      .order('display_order', { ascending: true })
      .order('published_at', { ascending: false })
      .limit(30)
    
    if (postsError) throw postsError
    
    return {
      profile,
      bioSettings: bioError ? null : bioSettings,
      links: links || [],
      posts: posts || []
    }
  } catch (error) {
    console.error('Error fetching bio page:', error)
    throw error
  }
}

/**
 * Parse social media URLs to extract useful information
 * @param {string} url - The social media URL to parse
 * @returns {Object} - Extracted information including platform, ID, etc.
 */
export const parseSocialMediaUrl = (url) => {
  if (!url) return { platform: 'unknown' }
  
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.replace('www.', '')
    const pathname = urlObj.pathname
    
    // YouTube
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      const videoId = hostname.includes('youtu.be')
        ? pathname.slice(1)
        : new URLSearchParams(urlObj.search).get('v')
      
      return {
        platform: 'youtube',
        type: 'video',
        id: videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`
      }
    }
    
    // Twitter/X
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      const parts = pathname.split('/').filter(Boolean)
      if (parts.length >= 3 && parts[1] === 'status') {
        return {
          platform: 'twitter',
          type: 'tweet',
          username: parts[0],
          id: parts[2],
          embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${parts[2]}`
        }
      }
      
      if (parts.length >= 1) {
        return {
          platform: 'twitter',
          type: 'profile',
          username: parts[0]
        }
      }
    }
    
    // Instagram
    if (hostname.includes('instagram.com')) {
      const parts = pathname.split('/').filter(Boolean)
      if (parts.length >= 2 && parts[0] === 'p') {
        return {
          platform: 'instagram',
          type: 'post',
          id: parts[1],
          embedUrl: `https://www.instagram.com/p/${parts[1]}/embed`
        }
      }
      
      if (parts.length >= 1) {
        return {
          platform: 'instagram',
          type: 'profile',
          username: parts[0]
        }
      }
    }
    
    // TikTok
    if (hostname.includes('tiktok.com')) {
      const parts = pathname.split('/').filter(Boolean)
      if (parts.length >= 3 && parts[1] === 'video') {
        return {
          platform: 'tiktok',
          type: 'video',
          username: parts[0],
          id: parts[2],
          embedUrl: `https://www.tiktok.com/embed/v2/${parts[2]}`
        }
      }
      
      if (parts.length >= 1) {
        return {
          platform: 'tiktok',
          type: 'profile',
          username: parts[0]
        }
      }
    }
    
    // Facebook
    if (hostname.includes('facebook.com')) {
      return {
        platform: 'facebook',
        type: 'unknown',
        url
      }
    }
    
    // LinkedIn
    if (hostname.includes('linkedin.com')) {
      return {
        platform: 'linkedin',
        type: 'unknown',
        url
      }
    }
    
    // GitHub
    if (hostname.includes('github.com')) {
      const parts = pathname.split('/').filter(Boolean)
      if (parts.length >= 1) {
        return {
          platform: 'github',
          type: 'profile',
          username: parts[0]
        }
      }
    }
    
    // Twitch
    if (hostname.includes('twitch.tv')) {
      const parts = pathname.split('/').filter(Boolean)
      if (parts.length >= 1) {
        return {
          platform: 'twitch',
          type: 'channel',
          username: parts[0]
        }
      }
    }
    
    return {
      platform: 'unknown',
      url
    }
  } catch (error) {
    console.error('Error parsing social media URL:', error)
    return {
      platform: 'unknown',
      url
    }
  }
}

/**
 * Get platform metadata (icons, colors, etc.)
 * @param {string} platform - The platform name
 * @returns {Object} - Platform metadata
 */
export const getPlatformMetadata = (platform) => {
  const platforms = {
    twitter: {
      name: 'Twitter',
      icon: 'FiTwitter',
      color: '#1DA1F2',
      urlPattern: 'https://twitter.com/{username}'
    },
    instagram: {
      name: 'Instagram',
      icon: 'FiInstagram',
      color: '#E1306C',
      urlPattern: 'https://instagram.com/{username}'
    },
    youtube: {
      name: 'YouTube',
      icon: 'FiYoutube',
      color: '#FF0000',
      urlPattern: 'https://youtube.com/c/{username}'
    },
    tiktok: {
      name: 'TikTok',
      icon: 'FiMusic',
      color: '#000000',
      urlPattern: 'https://tiktok.com/@{username}'
    },
    facebook: {
      name: 'Facebook',
      icon: 'FiFacebook',
      color: '#4267B2',
      urlPattern: 'https://facebook.com/{username}'
    },
    linkedin: {
      name: 'LinkedIn',
      icon: 'FiLinkedin',
      color: '#0077B5',
      urlPattern: 'https://linkedin.com/in/{username}'
    },
    github: {
      name: 'GitHub',
      icon: 'FiGithub',
      color: '#333333',
      urlPattern: 'https://github.com/{username}'
    },
    twitch: {
      name: 'Twitch',
      icon: 'FiTwitch',
      color: '#6441A5',
      urlPattern: 'https://twitch.tv/{username}'
    },
    discord: {
      name: 'Discord',
      icon: 'FiMessageSquare',
      color: '#5865F2',
      urlPattern: 'https://discord.gg/{username}'
    },
    spotify: {
      name: 'Spotify',
      icon: 'FiMusic',
      color: '#1DB954',
      urlPattern: 'https://open.spotify.com/user/{username}'
    },
    website: {
      name: 'Website',
      icon: 'FiGlobe',
      color: '#4285F4',
      urlPattern: 'https://{username}'
    },
    email: {
      name: 'Email',
      icon: 'FiMail',
      color: '#EA4335',
      urlPattern: 'mailto:{username}'
    },
    medium: {
      name: 'Medium',
      icon: 'FiFileText',
      color: '#00AB6C',
      urlPattern: 'https://medium.com/@{username}'
    },
    pinterest: {
      name: 'Pinterest',
      icon: 'FiImage',
      color: '#E60023',
      urlPattern: 'https://pinterest.com/{username}'
    },
    behance: {
      name: 'Behance',
      icon: 'FiBriefcase',
      color: '#1769FF',
      urlPattern: 'https://behance.net/{username}'
    },
    dribbble: {
      name: 'Dribbble',
      icon: 'FiDribbble',
      color: '#EA4C89',
      urlPattern: 'https://dribbble.com/{username}'
    },
    patreon: {
      name: 'Patreon',
      icon: 'FiDollarSign',
      color: '#F96854',
      urlPattern: 'https://patreon.com/{username}'
    },
    reddit: {
      name: 'Reddit',
      icon: 'FiMessageCircle',
      color: '#FF4500',
      urlPattern: 'https://reddit.com/user/{username}'
    },
    snapchat: {
      name: 'Snapchat',
      icon: 'FiCamera',
      color: '#FFFC00',
      urlPattern: 'https://snapchat.com/add/{username}'
    },
    other: {
      name: 'Other',
      icon: 'FiLink',
      color: '#718096',
      urlPattern: '{username}'
    }
  }
  
  return platforms[platform] || platforms.other
}

/**
 * Track bio page analytics event
 * @param {string} event - The event to track
 * @param {Object} properties - Event properties
 * @returns {Promise<void>}
 */
export const trackBioPageEvent = async (event, properties = {}) => {
  try {
    // In a real implementation, this would send data to an analytics service
    console.log('📊 Tracking event:', event, properties)
    
    // Example: Track page view in Supabase
    if (event === 'page_view' && properties.username) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', properties.username)
        .single()
      
      if (profile) {
        await supabase.rpc('increment_bio_page_view_count', { 
          user_id_param: profile.id 
        })
      }
    }
    
    return true
  } catch (error) {
    console.error('Error tracking bio page event:', error)
    return false
  }
}