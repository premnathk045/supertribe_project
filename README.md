# Instagram-like Social Media Platform

A modern, full-featured social media platform built with React, Vite, and Supabase, featuring Instagram-like functionality with advanced story creation, user authentication, and real-time interactions.

## 🚀 Features

### Core Functionality
- **User Authentication**: Complete sign-up/sign-in flow with Supabase Auth
- **Two-Tier User System**: Fan and Creator roles with verification process
- **Story Creation**: Professional-grade story creation with camera, video, text, and gallery modes
- **Real-time Stories**: Live story viewing with auto-advance and interactions
- **Content Feed**: Infinite scroll feed with posts, likes, comments, and shares
- **Direct Messaging**: Real-time chat system
- **Creator Monetization**: Premium content with payment integration
- **Responsive Design**: Mobile-first design with desktop optimization

### Story System Features
- **Multi-Mode Creation**: Photo, video, text, and gallery upload modes
- **Advanced Camera Integration**: Live preview, front/back camera, flash control
- **Video Recording**: Up to 60 seconds with audio controls and quality optimization
- **Rich Text Stories**: Multiple fonts, colors, backgrounds, and alignment options
- **Real-time Upload**: Progress indicators and error handling
- **Story Interactions**: Views, likes, reactions, and sharing
- **Auto-Expiration**: 24-hour story lifecycle with automatic cleanup

### Technical Features
- **Supabase Integration**: Database, authentication, storage, and real-time subscriptions
- **File Upload System**: Compressed media upload with validation and progress tracking
- **Storage Management**: Organized file structure with automatic cleanup
- **Performance Optimization**: Lazy loading, caching, and efficient re-rendering
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Accessibility**: ARIA compliance and keyboard navigation

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **State Management**: React Query, Context API
- **UI Components**: Custom component library with animations
- **File Handling**: React Dropzone, Canvas API for compression
- **Deployment**: Netlify with continuous deployment

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd creator-social-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   Run the migration files in order:
   ```sql
   -- Run in Supabase SQL Editor
   -- 1. supabase/migrations/create_stories_system.sql
   ```

5. **Create storage buckets**
   
   In Supabase Dashboard > Storage, create:
   - `story-media` (public bucket)
   - `story-thumbnails` (public bucket)

6. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄 Database Schema

### Core Tables

#### `profiles`
- User profile information and role management
- Links to Supabase Auth users
- Tracks verification status and user type

#### `stories`
- Main stories table with metadata
- Supports photo, video, and text content
- Automatic expiration and view tracking

#### `story_views`
- Tracks which users have viewed which stories
- Enables "viewed" status indicators

#### `story_interactions`
- Handles likes, shares, and reactions
- Supports emoji reactions and interaction counting

#### `creator_verifications`
- Multi-step creator verification workflow
- Tracks completion of verification steps

## 🔧 Configuration

### File Upload Limits
```javascript
// Image files
maxSize: 10MB
allowedTypes: ['image/jpeg', 'image/png', 'image/webp']

// Video files  
maxSize: 100MB
allowedTypes: ['video/mp4', 'video/mov']
```

### Story Configuration
```javascript
// Story duration
defaultDuration: 5000ms (5 seconds)
maxVideoDuration: 60000ms (60 seconds)
expirationTime: 24 hours

// Auto-cleanup
expiredStoriesCleanup: Daily via cron job
```

## 🚀 Deployment

The application is deployed on Netlify with automatic deployments from the main branch.

**Live Demo**: https://poetic-sunshine-730fbf.netlify.app

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

## 📱 Usage

### For Fans
1. **Sign up** with email and password
2. **Browse stories** and posts from creators
3. **Interact** with content through likes and comments
4. **Message** creators directly

### For Creators
1. **Sign up** and complete creator verification
2. **Create stories** using camera, gallery, or text modes
3. **Upload content** with automatic compression and optimization
4. **Track analytics** and engagement metrics
5. **Monetize** content through premium posts

### Story Creation Workflow
1. **Select mode**: Photo, Video, Text, or Gallery
2. **Create content**: Use built-in tools and editors
3. **Add caption**: Optional text description
4. **Preview**: Review before publishing
5. **Publish**: Upload to Supabase with progress tracking

## 🔒 Security

- **Row Level Security (RLS)**: Enabled on all tables
- **File Validation**: Type and size checking before upload
- **Authentication**: Secure JWT tokens with automatic refresh
- **Data Sanitization**: XSS protection on user-generated content
- **Access Control**: Role-based permissions for content creation

## 🎯 Performance

- **Image Compression**: Automatic compression before upload
- **Lazy Loading**: Stories and media loaded on demand
- **Caching**: React Query for efficient data fetching
- **Real-time Updates**: Supabase subscriptions for live data
- **Bundle Optimization**: Code splitting and tree shaking

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Type checking (if using TypeScript)
npm run type-check
```

## 📚 API Documentation

### Story Upload Hook
```javascript
const { uploadStory, uploading, progress, error } = useStoryUpload()

// Upload a story
const result = await uploadStory({
  type: 'photo',
  media: file,
  caption: 'My story caption',
  textStyle: { color: '#ffffff' },
  background: { type: 'solid', value: '#000000' }
})
```

### Stories Hook
```javascript
const { stories, loading, markStoryAsViewed, toggleStoryLike } = useStories()

// Mark story as viewed
await markStoryAsViewed(storyId)

// Toggle like on story
await toggleStoryLike(storyId, isCurrentlyLiked)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the excellent backend-as-a-service platform
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations and transitions
- **React Query** for efficient data fetching and caching
- **Pexels** for stock photos used in the demo

## 📞 Support

For support, email support@creatorspace.com or join our Discord community.

---

Built with ❤️ by the CreatorSpace team