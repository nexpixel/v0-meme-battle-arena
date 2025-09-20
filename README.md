# 🔥 Meme Battle Arena

A cyberpunk-themed meme battle arena where users can upload memes, create epic battles, and vote in real-time. Built with Next.js 14, Supabase, and featuring Farcaster integration for social sharing.

## ✨ Features

### 🎮 Core Functionality
- **Meme Upload & Management** - Upload and manage your meme collection
- **Epic Battle Creation** - Create head-to-head meme battles with custom durations
- **Real-time Voting** - Vote on battles with instant UI feedback and live updates
- **Reaction System** - React to memes with 5 different reaction types (🔥, 😂, 🤯, 😬, 💯)
- **Dynamic Leaderboards** - Track top creators, most voted memes, and battle champions
- **User Profiles** - Detailed stats, achievements, and battle history

### 🚀 Advanced Features
- **Farcaster Integration** - Sign in with Farcaster and share battles on Warpcast
- **Social Sharing** - Share battles on Twitter and Farcaster with custom messages
- **Real-time Updates** - Live vote counts and battle status updates
- **Mobile-First Design** - Optimized for mobile with responsive navigation
- **Dark Cyberpunk Theme** - Neon glows, Base blue accents, and futuristic UI

### 🔐 Authentication & Security
- **Supabase Auth** - Email/password and Farcaster OAuth authentication
- **Row Level Security** - Database-level security policies
- **Protected Routes** - Middleware-based route protection
- **User Activity Tracking** - Track shares and engagement

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Farcaster OAuth
- **Styling**: Tailwind CSS v4 with custom cyberpunk theme
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics + Speed Insights

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone & Install
\`\`\`bash
git clone <your-repo-url>
cd meme-battle-arena
npm install
\`\`\`

### 2. Environment Setup
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Required environment variables:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### 3. Database Setup
Run the SQL scripts in order to set up your database:

1. `scripts/001_create_database_schema.sql` - Core tables and relationships
2. `scripts/002_create_profile_trigger.sql` - Auto-create user profiles
3. `scripts/003_create_leaderboard_functions.sql` - Leaderboard calculations
4. `scripts/004_update_leaderboard_trigger.sql` - Auto-update scores
5. `scripts/005_add_user_activities_table.sql` - Activity tracking

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see your meme battle arena!

## 📁 Project Structure

\`\`\`
meme-battle-arena/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── battles/              # Battle management
│   │   ├── memes/                # Meme operations
│   │   ├── leaderboard/          # Rankings & stats
│   │   ├── farcaster/            # Farcaster integration
│   │   └── cron/                 # Scheduled tasks
│   ├── auth/                     # Authentication pages
│   ├── battles/                  # Battle pages
│   ├── create/                   # Creation flows
│   ├── leaderboard/              # Leaderboard page
│   ├── memes/                    # Meme gallery
│   └── profile/                  # User profiles
├── components/                   # React components
│   ├── layout/                   # Layout components
│   └── ui/                       # UI components
├── lib/                          # Utilities
│   └── supabase/                 # Supabase clients
├── scripts/                      # Database scripts
└── public/                       # Static assets
\`\`\`

## 🎨 Design System

### Color Palette
- **Primary**: Base Blue (#0052FF) - Main accent color
- **Secondary**: Cyan (#00D4FF) - Secondary actions
- **Accent**: Purple (#8B5CF6) - Highlights and effects
- **Background**: Black (#000000) - Main background
- **Surface**: Gray-900 (#111827) - Cards and surfaces

### Typography
- **Headings**: Geist Sans (Bold weights)
- **Body**: Geist Sans (Regular/Medium)
- **Code**: Geist Mono

### Effects
- **Neon Glows**: Custom CSS with box-shadow
- **Gradients**: Subtle cyberpunk-themed gradients
- **Animations**: Smooth transitions and hover effects

## 🔧 API Endpoints

### Battles
- `GET /api/battles` - List battles with filters
- `POST /api/battles/vote` - Vote in a battle
- `GET /api/battles/[id]` - Get battle details

### Memes
- `GET /api/memes` - List memes with search/filter
- `POST /api/memes` - Create new meme
- `POST /api/memes/[id]/react` - React to a meme

### Leaderboard
- `GET /api/leaderboard` - Get rankings
- `GET /api/leaderboard/user/[id]` - Get user stats

### Utilities
- `GET /api/sitemap` - Dynamic sitemap generation
- `GET /api/cron/update-battle-status` - Update expired battles

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
CRON_SECRET=your_cron_secret_for_scheduled_tasks
\`\`\`

### Cron Jobs
The app includes automated battle status updates via Vercel Cron Jobs:
- Updates expired battles to "completed" status every 5 minutes
- Configured in `vercel.json`

## 🔒 Security Features

- **Row Level Security (RLS)** on all database tables
- **Authentication middleware** protecting sensitive routes
- **CORS headers** for API security
- **Content Security Policy** headers
- **Input validation** with Zod schemas

## 📊 Performance Optimizations

- **Image optimization** with Next.js Image component
- **Bundle splitting** for optimal loading
- **Compression** enabled
- **Caching strategies** for API responses
- **Lazy loading** for components
- **Optimized imports** for icon libraries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Deployed on [Vercel](https://vercel.com/)

---

**Ready to battle?** 🔥 Upload your memes and let the battles begin!
