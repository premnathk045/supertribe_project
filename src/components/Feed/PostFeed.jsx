import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import PostCard from './PostCard'
import LoadingSpinner from '../UI/LoadingSpinner'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

function PostFeed({ onPostClick, onShareClick }) {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  
  const { ref, inView } = useInView({
    threshold: 0.1,
  })

  const POSTS_PER_PAGE = 10

  // Fetch posts from Supabase
  const fetchPosts = async (pageNum = 0, append = false) => {
    try {
      if (pageNum === 0) {
        setLoading(true)
        setError(null)
      } else {
        setLoadingMore(true)
      }

      console.log('🔍 Fetching posts from Supabase...', { pageNum, append })

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!user_id (
            username,
            display_name,
            avatar_url,
            is_verified,
            user_type
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(pageNum * POSTS_PER_PAGE, (pageNum + 1) * POSTS_PER_PAGE - 1)

      if (error) {
        console.error('❌ Error fetching posts:', error)
        throw error
      }

      console.log('✅ Posts fetched successfully:', data)

      // Transform data to match expected format
      const transformedPosts = data.map(post => ({
        ...post,
        user: {
          id: post.user_id,
          username: post.profiles?.username || 'unknown',
          displayName: post.profiles?.display_name || 'Unknown User',
          avatar: post.profiles?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
          isVerified: post.profiles?.is_verified || false,
          isPremium: post.profiles?.user_type === 'creator' && post.profiles?.is_verified
        },
        media: post.media_urls ? post.media_urls.map(url => ({
          type: 'image', // We'll assume images for now, could be enhanced to detect type
          url: url,
          thumbnail: url
        })) : [],
        likeCount: post.like_count || 0,
        commentCount: post.comment_count || 0,
        shareCount: post.share_count || 0,
        isLiked: false, // TODO: Check if current user liked this post
        isSaved: false, // TODO: Check if current user saved this post
        createdAt: new Date(post.created_at),
        tags: post.tags || []
      }))

      if (append) {
        setPosts(prev => [...prev, ...transformedPosts])
      } else {
        setPosts(transformedPosts)
      }

      // Check if we have more posts
      setHasMore(transformedPosts.length === POSTS_PER_PAGE)
      
    } catch (error) {
      console.error('❌ Error in fetchPosts:', error)
      setError(error.message || 'Failed to load posts')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchPosts(0, false)
  }, [])

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPosts(nextPage, true)
    }
  }, [inView, hasMore, loading, loadingMore, page])

  const handlePostInteraction = async (postId, action) => {
    console.log('🔄 Post interaction:', { postId, action })
    
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        switch (action) {
          case 'like':
            // TODO: Implement actual like/unlike in Supabase
            return {
              ...post,
              isLiked: !post.isLiked,
              likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
            }
          case 'save':
            // TODO: Implement actual save/unsave in Supabase
            return { ...post, isSaved: !post.isSaved }
          default:
            return post
        }
      }
      return post
    }))
  }

  // Skeleton loader component
  const SkeletonPost = () => (
    <div className="bg-white border border-gray-100 overflow-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center space-x-3 p-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="px-4 pb-3">
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
      
      {/* Media skeleton */}
      <div className="aspect-square bg-gray-200"></div>
      
      {/* Actions skeleton */}
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-3">
          <div className="h-6 bg-gray-200 rounded w-12"></div>
          <div className="h-6 bg-gray-200 rounded w-12"></div>
          <div className="h-6 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    </div>
  )

  // Error state
  if (error && posts.length === 0) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to load posts
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => fetchPosts(0, false)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Loading skeleton for initial load */}
      {loading && posts.length === 0 && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonPost key={`skeleton-${index}`} />
          ))}
        </div>
      )}

      {/* Posts */}
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PostCard
            post={post}
            onLike={() => handlePostInteraction(post.id, 'like')}
            onSave={() => handlePostInteraction(post.id, 'save')}
            onComment={() => onPostClick(post)}
            onShare={() => onShareClick(post)}
            onClick={() => onPostClick(post)}
          />
        </motion.div>
      ))}

      {/* Loading more indicator */}
      {loadingMore && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <SkeletonPost key={`loading-skeleton-${index}`} />
          ))}
        </div>
      )}
      
      {/* Infinite scroll trigger */}
      <div ref={ref} className="flex justify-center py-8">
        {!hasMore && posts.length > 0 && (
          <p className="text-gray-500 text-center">You've reached the end!</p>
        )}
      </div>

      {/* Empty state */}
      {!loading && posts.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-600">
            Be the first to share something amazing!
          </p>
        </div>
      )}
    </div>
  )
}

export default PostFeed