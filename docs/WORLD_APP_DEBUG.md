# World App Debugging Guide

## White Screen Issue - Troubleshooting Steps

### 1. Enable Remote Debugging

#### For iOS (World App on iPhone):
1. Connect your iPhone to your Mac via USB
2. On iPhone: Settings → Safari → Advanced → Enable "Web Inspector"
3. On Mac: Open Safari → Develop → [Your iPhone] → [Your App URL]
4. You'll see the console with all errors

#### For Android (World App on Android):
1. Connect your Android device via USB
2. Enable Developer Options and USB Debugging on your device
3. Open Chrome on desktop → chrome://inspect
4. Find your device and click "Inspect" on your app
5. You'll see the console with all errors

### 2. Check Console Logs

After enabling remote debugging, look for these logs:

```
✅ Good logs (app working):
🚀 App mounted successfully
🔧 MiniKitProvider mounted
🌍 World App ID: app_staging_xxxxx or app_xxxxx
✅ MiniKit.install() called
📱 Is MiniKit installed: true

❌ Bad logs (need to fix):
❌ NEXT_PUBLIC_MINIKIT_APP_ID is not configured
❌ Error mounting app: [error details]
❌ Error installing MiniKit: [error details]
```

### 3. Environment Variables Checklist

Make sure your `.env.local` has these variables with correct format:

```bash
# MUST start with "app_" or "app_staging_"
NEXT_PUBLIC_WORLD_APP_ID=app_69998f554169db259e9b4e23d9e329b8
NEXT_PUBLIC_MINIKIT_APP_ID=app_69998f554169db259e9b4e23d9e329b8
NEXT_PUBLIC_WORLD_ID_ACTION=verify-human

# Database
DATABASE_URL="prisma+postgres://..."

# Optional
NODE_ENV=development
ALLOW_FAILED_VERIFICATION=true
```

### 4. Common Issues & Solutions

#### Issue: White Screen / Blank Page
**Causes:**
- JavaScript error preventing render
- Environment variables not loaded
- MiniKit initialization error
- CSS not loading

**Solutions:**
1. Check remote debugger console for errors
2. Verify `.env.local` has correct app ID format
3. Rebuild and redeploy: `npm run build`
4. Clear browser cache in World App

#### Issue: App ID Not Found
**Error:** `NEXT_PUBLIC_MINIKIT_APP_ID is not configured`

**Solutions:**
1. Make sure `.env.local` exists in root directory
2. Variable must start with `NEXT_PUBLIC_` to be available in browser
3. App ID must start with `app_` or `app_staging_`
4. Restart dev server after changing env vars
5. Rebuild for production: `npm run build`

#### Issue: "Cannot find module" errors
**Solutions:**
1. Delete `.next` folder: `rm -rf .next`
2. Delete `node_modules`: `rm -rf node_modules`
3. Reinstall: `npm install`
4. Rebuild: `npm run build`

#### Issue: Prisma Database Error
**Solutions:**
1. Generate Prisma Client: `npx prisma generate`
2. Push schema: `npx prisma db push`
3. Check DATABASE_URL is correct

### 5. Testing Workflow

#### Local Testing:
```bash
# 1. Clean build
rm -rf .next
rm -rf node_modules
npm install

# 2. Check env vars are loaded
npm run dev
# Look for console logs showing env vars

# 3. Test in browser
open http://localhost:3000
# Should see "Loading..." then content
```

#### World App Testing:
```bash
# 1. Build production version
npm run build

# 2. Deploy to hosting (Vercel/Netlify)
# Make sure env vars are set in hosting platform

# 3. Get your deployed URL
# Example: https://your-app.vercel.app

# 4. Use World App Developer Portal
# Go to: https://developer.worldcoin.org/
# Navigate to your app → Test
# Enter your URL: https://your-app.vercel.app
# Scan QR code with World App

# 5. Enable remote debugging (see step 1)
# Check console for errors
```

### 6. Quick Fixes

#### Fix 1: Verify Environment Variables
```bash
# Check if env vars are loaded
npm run dev

# In browser console, check:
console.log(process.env.NEXT_PUBLIC_MINIKIT_APP_ID)
# Should show your app ID, not undefined
```

#### Fix 2: Test Minimal Version
Replace your `src/app/page.tsx` temporarily with:
```typescript
export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#000',
      color: '#00FFBE',
      fontSize: '48px',
      fontWeight: 'bold'
    }}>
      H World Test
    </div>
  )
}
```

If this shows up, gradually add back components to find what's breaking.

#### Fix 3: Database Check
```bash
# Generate Prisma client
npx prisma generate

# Check database
npx prisma studio
# Should open database browser

# Seed database if empty
npm run seed
```

### 7. World App Specific Checks

#### Verify App Configuration:
1. Go to https://developer.worldcoin.org/
2. Check your app settings:
   - App ID format: `app_xxxxx` or `app_staging_xxxxx`
   - Callback URLs configured
   - Action ID matches your code

#### Test Outside World App:
1. Open your deployed URL in normal browser
2. Should see the app (without MiniKit features)
3. Check console - should see "MiniKit not available (this is OK for testing)"

### 8. Debugging Checklist

Run through this checklist:

- [ ] App builds successfully: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Environment variables are set
- [ ] App ID starts with `app_` or `app_staging_`
- [ ] App works in regular browser (localhost:3000)
- [ ] Remote debugging enabled
- [ ] Console shows no errors
- [ ] Database is initialized
- [ ] Prisma client generated

### 9. Get Help

If still not working, gather this info:

1. **Error messages from remote debugger**
2. **Console logs** (copy all logs)
3. **Environment check:**
   ```bash
   echo $NEXT_PUBLIC_MINIKIT_APP_ID
   ```
4. **Build output:**
   ```bash
   npm run build 2>&1 | tee build.log
   ```

### 10. Contact Support

With the info above, reach out:
- World ID Discord: https://discord.gg/worldcoin
- GitHub Issues: https://github.com/worldcoin/minikit-js/issues
- Documentation: https://docs.world.org/mini-apps

## Quick Recovery Commands

```bash
# Full reset
rm -rf .next node_modules
npm install
npx prisma generate
npx prisma db push
npm run build

# Check everything
npm run build && npm start
# Test at http://localhost:3000

# Deploy
git add .
git commit -m "Fix World App compatibility"
git push

# Then update deployment on Vercel/Netlify
```

## Expected Console Output (Working App)

```
🚀 App mounted successfully
🔐 Auth status: false
👤 User: null
🔧 MiniKitProvider mounted
🌍 World App ID: app_69998f554169db259e9b4e23d9e329b8
🔍 Environment: production
📦 Installing MiniKit...
✅ MiniKit.install() called
📱 Is MiniKit installed: true
✅ MiniKit installed successfully - running in World App
```

If you see different output, that's your clue to what's wrong!
