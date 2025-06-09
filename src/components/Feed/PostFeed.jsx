import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import PostCard from './PostCard'
import LoadingSpinner from '../UI/LoadingSpinner'
import { posts as initialPosts } from '../../data/dummyData'

function PostFeed({ onPostClick, onShareClick }) {
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  
  const { ref, inView } = useInView({
    threshold: 0.1,
  })

  // Simulate infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setLoading(true)
      
      // Simulate API call
      setTimeout(() => {
        const newPosts = initialPosts.map(post => ({
          ...post,
          id: post.id + posts.length,
        }))
        
        setPosts(prev => [...prev, ...newPosts])
        setLoading(false)
        
        if (posts.length > 20) {
          setHasMore(false)
        }
      }, 1000)
    }
  }, [inView, hasMore, loading, posts.length])

  const handlePostInteraction = (postId, action) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        switch (action) {
          case 'like':
            return {
              ...post,
              isLiked: !post.isLiked,
              likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
            }
          case 'save':
            return { ...post, isSaved: !post.isSaved }
          default:
            return post
        }
      }
      return post
    }))
  }

  return (
    <div className="space-y-4 pb-8">
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
      
      {/* Loading trigger */}
      <div ref={ref} className="flex justify-center py-8">
        {loading && <LoadingSpinner />}
        {!hasMore && (
          <p className="text-gray-500 text-center">You've reached the end!</p>
        )}
      </div>
    </div>
  )
}

export default PostFeed