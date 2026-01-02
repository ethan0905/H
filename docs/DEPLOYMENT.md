# Vercel Deployment Guide

## Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier is sufficient)
- PostgreSQL database (we'll set this up)

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Vercel deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. Set Up PostgreSQL Database

**Option A: Vercel Postgres (Recommended)**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Storage" tab
3. Click "Create Database" → "Postgres"
4. Name it (e.g., "h-world-db")
5. Select region closest to your users
6. Click "Create"
7. Copy the `DATABASE_URL` (it will be automatically added to your project)

**Option B: Supabase (Free Alternative)**
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (URI format)
5. Replace `[YOUR-PASSWORD]` with your database password

**Option C: Railway.app (Free Alternative)**
1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL
4. Copy the `DATABASE_URL` from the PostgreSQL service

### 3. Deploy to Vercel

#### Via Vercel Dashboard (Easiest):
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. Configure environment variables:

**Required Environment Variables:**
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXT_PUBLIC_MINIKIT_APP_ID=app_staging_xxxxx
NEXT_PUBLIC_WORLD_APP_ID=app_staging_xxxxx
NEXT_PUBLIC_WORLD_ID_ACTION=verify-human
WORLD_ID_API_KEY=your_api_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

6. Click "Deploy"
7. Wait 2-3 minutes for build to complete

#### Via Vercel CLI:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts
# Set up environment variables when asked

# For production
vercel --prod
```

### 4. Set Up Database Schema

After first deployment, you need to run migrations:

**Option A: Via Vercel CLI**
```bash
# Connect to your Vercel project
vercel env pull .env.local

# Run migrations locally with production DB URL
npx prisma migrate deploy
```

**Option B: Via Vercel Dashboard**
1. Go to your project in Vercel
2. Settings → Functions
3. Add a one-time function to run migrations
4. Or use the built-in database tools

**Option C: Via Database GUI**
1. Connect to your PostgreSQL database using:
   - TablePlus
   - Postico
   - pgAdmin
   - DBeaver
2. Copy SQL from `prisma/migrations` folders
3. Execute manually

### 5. Seed Initial Data (Optional)

After migrations, seed your database:

```bash
# Pull production env
vercel env pull .env.local

# Run seed
npm run seed:full

# Or create an API endpoint to seed data
# GET /api/admin/seed (protected by admin auth)
```

### 6. Configure Custom Domain (Optional)

1. In Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` in environment variables

### 7. Update World ID Configuration

**Important:** Update your World App settings with the production URL:

1. Go to [World ID Developer Portal](https://developer.worldcoin.org)
2. Update your app settings:
   - **Redirect URIs**: Add `https://your-app.vercel.app/api/world-id/callback`
   - **Allowed Origins**: Add `https://your-app.vercel.app`
3. Save changes

### 8. Test Your Deployment

1. Visit your Vercel URL
2. Test authentication with World ID
3. Test tweet creation
4. Test all main features
5. Check for any errors in Vercel logs

## Environment Variables Reference

### Required:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_MINIKIT_APP_ID` - Your World App ID
- `NEXT_PUBLIC_WORLD_APP_ID` - Your World App ID (same as above)
- `NEXT_PUBLIC_WORLD_ID_ACTION` - Action name (e.g., "verify-human")
- `WORLD_ID_API_KEY` - World ID API key (keep secret!)

### Optional:
- `NEXT_PUBLIC_APP_URL` - Your production URL (for OG images, etc.)
- `NODE_ENV` - Set to "production" (auto-set by Vercel)

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all environment variables are set
- Check for TypeScript errors: `npm run build` locally

### Database Connection Issues
- Verify `DATABASE_URL` format
- Ensure database is accessible from Vercel's IP
- Check if database has SSL enabled (add `?sslmode=require` to URL)

### Prisma Issues
- Make sure `postinstall` script runs: `prisma generate`
- Check migrations are applied: `prisma migrate deploy`
- Verify schema is compatible with PostgreSQL

### World ID Issues
- Update redirect URIs in World ID portal
- Check `NEXT_PUBLIC_*` variables are accessible in browser
- Verify API keys are correct

### Image Upload Issues
- File uploads won't work on Vercel's filesystem (it's ephemeral)
- Consider using:
  - Vercel Blob Storage
  - AWS S3
  - Cloudinary
  - UploadThing

## Performance Optimization

### Enable Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Enable Vercel Speed Insights
```bash
npm install @vercel/speed-insights
```

Add to `layout.tsx`:
```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## Monitoring & Logs

- **Logs**: Vercel Dashboard → Your Project → Logs
- **Analytics**: Vercel Dashboard → Your Project → Analytics
- **Errors**: Vercel Dashboard → Your Project → Errors (if using Vercel Error Monitoring)

## Continuous Deployment

After initial setup, every push to `main` branch will automatically deploy to production!

```bash
# Push changes
git add .
git commit -m "Update feature"
git push

# Vercel automatically builds and deploys
```

## Production Checklist

- ✅ All environment variables set
- ✅ Database migrations applied
- ✅ World ID redirect URIs updated
- ✅ Custom domain configured (optional)
- ✅ HTTPS enabled (automatic on Vercel)
- ✅ Test authentication flow
- ✅ Test core features
- ✅ Monitor for errors
- ✅ Check performance metrics

## Next Steps

1. Set up monitoring (Sentry, LogRocket)
2. Configure CDN for images
3. Add backup strategy for database
4. Set up staging environment
5. Configure CI/CD workflows

---

**Need Help?**
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Vercel Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
