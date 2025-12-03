# Vercel Deployment Checklist

## ✅ Pre-Deployment (Already Completed)

- [x] **.gitignore** configured for Vercel/Next.js/Prisma
- [x] **vercel.json** created with build configuration
- [x] **.env.example** created with all required environment variables
- [x] **package.json** updated with:
  - [x] `postinstall` script for Prisma client generation
  - [x] `build` script updated
  - [x] `vercel-build` script added
- [x] **prisma/schema.prisma** switched to PostgreSQL
- [x] Performance indexes added to schema
- [x] **DEPLOYMENT.md** created with step-by-step instructions
- [x] **prepare-deployment.sh** script created
- [x] Git repository initialized and connected to GitHub

## 🔄 Ready to Deploy

### Step 1: Commit All Changes

```bash
# Stage all new and modified files
git add .

# Commit with descriptive message
git commit -m "feat: prepare for Vercel deployment with PostgreSQL"

# Push to GitHub
git push origin main
```

### Step 2: Set Up PostgreSQL Database

Choose ONE of these options:

**Option A: Vercel Postgres (Recommended)**
- Go to [Vercel Dashboard](https://vercel.com/dashboard) → Storage → Create Database
- Select PostgreSQL
- Copy the DATABASE_URL

**Option B: Supabase (Free, Easy)**
- Create project at [supabase.com](https://supabase.com)
- Get connection string from Settings → Database
- Format: `postgresql://postgres:[password]@[host]:5432/postgres`

**Option C: Railway.app (Free tier available)**
- Create PostgreSQL service
- Copy DATABASE_URL

### Step 3: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run vercel-build` (should be auto-detected from vercel.json)
   - **Output Directory**: `.next` (default)

### Step 4: Add Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

```env
# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# World ID Configuration (REQUIRED)
NEXT_PUBLIC_MINIKIT_APP_ID=app_69998f554169db259e9b4e23d9e329b8
NEXT_PUBLIC_WORLD_APP_ID=app_69998f554169db259e9b4e23d9e329b8
NEXT_PUBLIC_WORLD_ID_ACTION=verify-human
WORLD_ID_ACTION_ID=verify-human

# World Pay (Optional - update with real address)
NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS=0x0000000000000000000000000000000000000000

# App Configuration
NEXT_PUBLIC_APP_NAME=World Social
NEXT_PUBLIC_APP_DESCRIPTION=A decentralized social platform for World App

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_ENABLE_ERUDA=false
ALLOW_FAILED_VERIFICATION=false

# App URL (Update after first deployment)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important:** Set these for all environments (Production, Preview, Development)

### Step 5: Initial Deployment

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Once deployed, copy your Vercel URL: `https://your-project.vercel.app`

### Step 6: Update World ID App Settings

1. Go to [World ID Developer Portal](https://developer.worldcoin.org/)
2. Select your app: `app_69998f554169db259e9b4e23d9e329b8`
3. Update settings:
   - **App URLs**: Add your Vercel URL
   - **Redirect URLs**: Add `https://your-project.vercel.app/api/world-id/callback`
   - **Sign in with World ID**: Add your Vercel URL to allowed origins
4. Save changes

### Step 7: Update NEXT_PUBLIC_APP_URL

1. In Vercel Dashboard → Settings → Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
3. Redeploy (Vercel → Deployments → ⋮ → Redeploy)

### Step 8: Initialize Database

Once deployed, your Prisma migrations will run automatically via the `vercel-build` script.

If you need to seed data:
```bash
# Connect to your Vercel deployment
vercel env pull .env.production

# Run seed script
npx prisma db seed
```

Or manually create an admin user via Prisma Studio:
```bash
npx prisma studio --schema prisma/schema.prisma
```

## 🧪 Post-Deployment Testing

Test these features on your deployed app:

- [ ] Homepage loads correctly
- [ ] World ID authentication works
- [ ] Create a tweet
- [ ] Like/retweet functionality
- [ ] Comment on tweets
- [ ] Profile page loads
- [ ] Edit profile
- [ ] Follow/unfollow users
- [ ] Image uploads work (if applicable)
- [ ] Leaderboards display correctly
- [ ] No console errors

## 🔍 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure `DATABASE_URL` is set correctly
- Verify all environment variables are present

### Database Connection Issues
- Verify `DATABASE_URL` format: `postgresql://user:password@host:5432/dbname?schema=public`
- Check database is accessible from Vercel's region
- Ensure database allows external connections

### World ID Not Working
- Verify World ID app settings match your Vercel URL
- Check `NEXT_PUBLIC_WORLD_APP_ID` is correct
- Ensure callback URL is whitelisted

### Images Not Loading
- Check file paths are relative to `public/`
- Verify image optimization settings in `next.config.js`
- Consider using Vercel Blob Storage for production uploads

## 📊 Performance Optimization

After deployment, consider:

1. **Enable Analytics**
   - Vercel Analytics (free for basic tier)
   - Vercel Speed Insights

2. **Database Optimization**
   - Monitor query performance
   - Add more indexes if needed
   - Consider connection pooling (Prisma Data Proxy)

3. **CDN Configuration**
   - All static assets automatically served via Vercel Edge Network
   - Consider Vercel Blob for user uploads

4. **Monitoring**
   - Set up Vercel Logs
   - Configure error tracking (Sentry, etc.)

## 🚀 Next Steps

After successful deployment:

1. **Custom Domain** (Optional)
   - Add custom domain in Vercel settings
   - Update World ID app URLs

2. **Production Optimizations**
   - Disable `NEXT_PUBLIC_ENABLE_ERUDA=false`
   - Set `ALLOW_FAILED_VERIFICATION=false`
   - Review all console.log statements

3. **Monitoring Setup**
   - Set up error tracking
   - Enable Vercel Analytics
   - Monitor database performance

4. **CI/CD** (Already configured!)
   - Every push to `main` triggers automatic deployment
   - Preview deployments for PRs

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [World ID Documentation](https://docs.worldcoin.org/)

---

**Need Help?** Check the detailed [DEPLOYMENT.md](./DEPLOYMENT.md) guide or Vercel support.
