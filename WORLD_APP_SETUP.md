# World App Integration Guide

## ✅ Configuration Complete

Your World Social app is now configured with your API key:
- **App ID**: `api_a2V5Xzk5MjJj....mVkZmVmMw`
- **Environment**: Configured in `.env.local`
- **MiniKit**: Properly initialized with your API key

## 🧪 Testing Your App

### 1. Local Testing (Current)
- ✅ App running at: http://localhost:3000
- ✅ MiniKit initialized with your API key
- ✅ Authentication flow ready

### 2. World App Testing Requirements

To test with actual World ID verification, you need to:

#### A. Set up World ID Action (Required)
1. Go to [World Developer Portal](https://developer.worldcoin.org/)
2. Sign in with your World ID
3. Create a new Action for your app:
   - **Name**: "Join World Social"
   - **Action**: `join-world-social` (or similar)
   - **Description**: "Verify identity to join World Social platform"
4. Copy the Action ID and update your `.env.local`:
   ```
   WORLD_ID_ACTION_ID=wid_staging_your_actual_action_id_here
   ```

#### B. Deploy to Public URL
World App can only test apps that are publicly accessible:

**Option 1: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

**Option 2: Ngrok (For testing)**
```bash
# Install ngrok
brew install ngrok  # or download from ngrok.com

# Expose local server
ngrok http 3000

# Use the https URL provided by ngrok
```

**Option 3: Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### 3. Test in World App

Once deployed:

1. **Open World App** on your mobile device
2. **Navigate** to your deployed URL
3. **Test Authentication**:
   - Tap "Sign in with World ID"
   - Complete World ID verification
   - Test wallet connection (optional)
4. **Test Core Features**:
   - Create tweets
   - Like/retweet posts
   - View feed

### 4. World App Store Submission

After testing:

1. **Register your app** in World Developer Portal
2. **Submit for review** with:
   - App screenshots
   - Description
   - Privacy policy
   - Terms of service
3. **Wait for approval** (usually 1-2 weeks)

## 🔧 Current Configuration Status

### ✅ Completed
- [x] MiniKit SDK integrated
- [x] World API key configured
- [x] Authentication flow implemented
- [x] Social features ready
- [x] Mobile-responsive design
- [x] Error handling in place

### ⏳ Next Steps
- [ ] Create World ID Action in developer portal
- [ ] Deploy to public URL
- [ ] Test in actual World App
- [ ] Create app store assets
- [ ] Submit for World App Store review

## 🚀 Quick Deploy Commands

### Vercel
```bash
# One-time setup
npm i -g vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_WORLD_APP_ID
# NEXT_PUBLIC_MINIKIT_APP_ID  
# WORLD_ID_ACTION_ID
```

### Railway
```bash
# One-time setup
npm install -g @railway/cli
railway login

# Deploy
railway link
railway up
```

### Environment Variables to Set
```env
NEXT_PUBLIC_WORLD_APP_ID=api_a2V5Xzk5MjJjMmI0.....zOTJlYmVkZmVmMw
NEXT_PUBLIC_MINIKIT_APP_ID=api_a2V5Xzk5MjJjMm......jkzYjQzOTJlYmVkZmVmMw
WORLD_ID_ACTION_ID=wid_staging_your_action_id_here
```

## 🐛 Troubleshooting

### Common Issues

1. **"MiniKit not installed" error**
   - Only happens in regular browsers
   - App must be opened in World App mobile browser

2. **World ID verification fails**
   - Check Action ID is correct
   - Ensure app is deployed to public URL
   - Verify in World App, not regular browser

3. **Environment variables not loading**
   - Restart dev server after changing `.env.local`
   - Check variables start with `NEXT_PUBLIC_` for client-side access

### Development vs Production

**Development (Current)**
- Running on localhost:3000
- World ID won't work (requires public URL)
- Wallet auth simulated
- Perfect for UI/UX testing

**Production (After Deploy)**
- Public HTTPS URL required
- Full World ID verification
- Real wallet connections
- Ready for World App Store

## 📱 Testing Checklist

Before submitting to World App Store:

- [ ] App loads correctly in World App
- [ ] World ID verification works
- [ ] Wallet connection works (if implemented)
- [ ] All buttons and navigation work
- [ ] Mobile layout is responsive
- [ ] Error states are handled gracefully
- [ ] Performance is acceptable
- [ ] Privacy policy and terms are linked

Your app is ready for the next phase! 🎉
