# 🚀 Deployment Guide

## Vercel Deployment (Recommended)

### 1. Prerequisites
- GitHub repository with your code
- Vercel account
- Supabase project set up

### 2. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration

### 3. Environment Variables
Add these environment variables in Vercel dashboard:

**Required:**
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

**Optional:**
\`\`\`
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
CRON_SECRET=your_secure_random_string
\`\`\`

### 4. Database Setup
Run the SQL scripts in your Supabase SQL editor:
1. `scripts/001_create_database_schema.sql`
2. `scripts/002_create_profile_trigger.sql`
3. `scripts/003_create_leaderboard_functions.sql`
4. `scripts/004_update_leaderboard_trigger.sql`
5. `scripts/005_add_user_activities_table.sql`

### 5. Deploy
1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Visit your deployed URL

### 6. Custom Domain (Optional)
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Database scripts executed
- [ ] Authentication working (sign up/sign in)
- [ ] Meme upload functionality working
- [ ] Battle creation working
- [ ] Voting system functional
- [ ] Leaderboard displaying data
- [ ] Farcaster sharing working
- [ ] Mobile responsiveness verified
- [ ] Performance metrics acceptable

## Monitoring & Maintenance

### Analytics
- Vercel Analytics automatically enabled
- Speed Insights included for performance monitoring

### Cron Jobs
- Battle status updates run every 5 minutes
- Monitor in Vercel Functions tab

### Database Maintenance
- Monitor Supabase dashboard for usage
- Set up database backups
- Review RLS policies periodically

### Performance Monitoring
- Check Core Web Vitals in Vercel
- Monitor API response times
- Review error logs regularly

## Troubleshooting

### Common Issues

**Build Failures:**
- Check TypeScript errors
- Verify all environment variables
- Review import paths

**Authentication Issues:**
- Verify Supabase URL and keys
- Check redirect URLs in Supabase auth settings
- Ensure RLS policies are correct

**Database Errors:**
- Verify all SQL scripts ran successfully
- Check table permissions
- Review RLS policies

**Performance Issues:**
- Enable image optimization
- Check bundle size
- Review database query performance

### Support
- Check Vercel deployment logs
- Review Supabase logs
- Monitor browser console for errors
