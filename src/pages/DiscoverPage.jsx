import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiGrid, FiList, FiTrendingUp } from 'react-icons/fi'
import SearchBar from '../components/Discover/SearchBar'
import CategoryGrid from '../components/Discover/CategoryGrid'
import TrendingSection from '../components/Discover/TrendingSection'
import CreatorGrid from '../components/Discover/CreatorGrid'
import { categories, trendingTags, users } from '../data/dummyData'

function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState(null)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-lg mx-auto">
        {/* Search Header */}
        <div className="bg-white p-4 border-b border-gray-200 sticky top-16 z-30">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search creators, content..."
          />
          
          <div className="flex items-center justify-between mt-4">
            <h2 className="text-lg font-semibold text-gray-900">Discover</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'
                }`}
              >
                <FiGrid className="text-lg" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'
                }`}
              >
                <FiList className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 p-4">
          {!searchQuery && !selectedCategory && (
            <>
              {/* Categories */}
              <motion.section
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <CategoryGrid 
                  categories={categories}
                  onCategorySelect={setSelectedCategory}
                />
              </motion.section>

              {/* Trending */}
              <motion.section
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <FiTrendingUp className="text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Trending</h3>
                </div>
                <TrendingSection tags={trendingTags} />
              </motion.section>

              {/* Suggested Creators */}
              <motion.section
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Creators</h3>
                <CreatorGrid 
                  creators={users}
                  viewMode={viewMode}
                />
              </motion.section>
            </>
          )}

          {/* Search Results */}
          {searchQuery && (
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              key="search-results"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Results for "{searchQuery}"
              </h3>
              <CreatorGrid 
                creators={users.filter(user => 
                  user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.bio.toLowerCase().includes(searchQuery.toLowerCase())
                )}
                viewMode={viewMode}
              />
            </motion.section>
          )}

          {/* Category Results */}
          {selectedCategory && (
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              key="category-results"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedCategory.name}
                </h3>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  Clear
                </button>
              </div>
              <CreatorGrid 
                creators={users}
                viewMode={viewMode}
              />
            </motion.section>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default DiscoverPage