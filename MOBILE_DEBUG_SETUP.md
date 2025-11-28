# 🐛 Mobile Debugging Setup - ERUDA + NGROK

## What We Added

### 1. Eruda Mobile Console ✅
Eruda creates a mobile-friendly developer console that shows:
- Console logs (all your debug messages)
- Network requests
- Elements inspection
- Resources
- Performance metrics

### 2. Enhanced Logging ✅
Added detailed logging to see exactly what's happening:
```
==================================================
🚀 H WORLD APP STARTING
==================================================
📱 User Agent: [device info]
🌐 Window location: [current URL]
🔐 Auth status: [true/false]
👤 User: [user object or null]
🌍 App ID: app_69998f554169db259e9b4e23d9e329b8
⚙️  Environment: production
🐛 Eruda enabled: true
==================================================
✅ App mounted successfully
```

### 3. Ngrok Tunnel ✅
Installed ngrok to create a public URL for your local server

---

## How to Test in World App

### Method 1: Using Ngrok (Recommended for Local Testing)

#### Step 1: Start the tunnel
```bash
cd /Users/ethan/Desktop/H
./start-tunnel.sh
```

This will:
- Start your server on port 3000
- Create an ngrok tunnel
- Display a public URL like: `https://xxxx-xxx-xxx-xxx.ngrok-free.app`

#### Step 2: Copy the ngrok URL
Look for the line that says:
```
Forwarding   https://xxxx-xxx-xxx-xxx.ngrok-free.app -> http://localhost:3000
```
Copy the `https://xxxx-xxx-xxx-xxx.ngrok-free.app` URL

#### Step 3: Test in World App Developer Portal
1. Go to: https://developer.worldcoin.org/
2. Navigate to your app
3. Click "Test" tab
4. Paste your ngrok URL
5. Click "Generate QR Code"
6. Scan with World App on your phone

#### Step 4: Debug with Eruda
1. Once the app opens in World App, look for a **floating icon in the bottom-right corner**
2. **Tap the Eruda icon** - it looks like a small gear or console icon
3. The Eruda console will open showing:
   - **Console tab**: All your `console.log()` messages
   - **Network tab**: All API requests
   - **Elements tab**: HTML structure
   - **Resources tab**: Files loaded

#### Step 5: Check the Console
In the Eruda console, you should see:
```
🚀 H WORLD APP STARTING
📱 User Agent: [your device]
🌐 Window location: https://xxxx.ngrok-free.app
🔐 Auth status: false
👤 User: null
🌍 App ID: app_69998f554169db259e9b4e23d9e329b8
⚙️  Environment: production
🐛 Eruda enabled: true
✅ App mounted successfully
🔧 MiniKitProvider mounted
📦 Installing MiniKit...
✅ MiniKit.install() called
📱 Is MiniKit installed: true
✅ MiniKit installed successfully - running in World App
```

#### Step 6: Look for Errors
If you see a blank screen, check the Eruda console for:
- **Red error messages** - JavaScript errors
- **Failed network requests** - API issues
- **Missing resources** - Files not loading

---

### Method 2: Deploy to Vercel (For Persistent Testing)

#### Step 1: Deploy
```bash
cd /Users/ethan/Desktop/H

# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel --prod
```

#### Step 2: Set Environment Variables
In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:
   ```
   NEXT_PUBLIC_WORLD_APP_ID = app_69998f554169db259e9b4e23d9e329b8
   NEXT_PUBLIC_MINIKIT_APP_ID = app_69998f554169db259e9b4e23d9e329b8
   NEXT_PUBLIC_WORLD_ID_ACTION = verify-human
   NEXT_PUBLIC_ENABLE_ERUDA = true
   DATABASE_URL = [your database URL]
   ALLOW_FAILED_VERIFICATION = true
   ```

#### Step 3: Redeploy
```bash
vercel --prod
```

#### Step 4: Test with your Vercel URL
Use your Vercel URL (e.g., `https://your-app.vercel.app`) in the World App Developer Portal

---

## Debugging Checklist

### If you see a blank/white screen:

1. **Check if Eruda icon appears**
   - ✅ Yes → Tap it and check console
   - ❌ No → Eruda might not be loading (check network tab in desktop browser first)

2. **In Eruda Console, check for:**
   - ❌ Red error messages → JavaScript errors (read the error message)
   - ❌ "Failed to fetch" → Network/API issues
   - ❌ "Cannot read property of undefined" → Data loading issues
   - ❌ "MiniKit is not defined" → MiniKit not loading properly

3. **Common Issues & Fixes:**

   **Error: "NEXT_PUBLIC_MINIKIT_APP_ID is not configured"**
   - Environment variables not loaded
   - Fix: Make sure they're set in Vercel/Netlify dashboard
   - Redeploy after setting

   **Error: "Failed to fetch"**
   - API routes not working
   - Database connection issues
   - Fix: Check DATABASE_URL is correct

   **Error: "undefined is not an object"**
   - JavaScript error in code
   - Fix: Look at the error stack trace in console

   **Blank screen, no errors in console**
   - CSS not loading
   - Check Network tab in Eruda
   - Look for failed requests

---

## Testing Commands

### Start local server with Eruda:
```bash
cd /Users/ethan/Desktop/H
npm run build
npm start
```

### Start ngrok tunnel:
```bash
./start-tunnel.sh
```

### Check if Eruda is enabled:
```bash
# In browser console or Eruda console:
console.log('Eruda enabled:', process.env.NEXT_PUBLIC_ENABLE_ERUDA)
```

### Test locally first:
```bash
# Open in browser
open http://localhost:3000

# You should see Eruda icon in bottom-right
# Click it to see console logs
```

---

## What Eruda Shows You

### Console Tab
All `console.log()`, `console.error()`, `console.warn()` messages:
```
🚀 H WORLD APP STARTING
🔐 Auth status: false
👤 User: null
✅ App mounted successfully
```

### Network Tab
All HTTP requests:
- `/api/tweets` - Should be 200 OK
- `/api/users` - Should be 200 OK
- Failed requests show in red

### Elements Tab
- View HTML structure
- See applied CSS
- Inspect elements

### Resources Tab
- All loaded files
- Images, JS, CSS
- Check if anything failed to load

---

## Expected Console Output (Working App)

```
==================================================
🚀 H WORLD APP STARTING
==================================================
📱 User Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...
🌐 Window location: https://xxxx.ngrok-free.app/
🔐 Auth status: false
👤 User: null
🌍 App ID: app_69998f554169db259e9b4e23d9e329b8
⚙️  Environment: production
🐛 Eruda enabled: true
==================================================
✅ App mounted successfully
🔧 MiniKitProvider mounted
🌍 World App ID: app_69998f554169db259e9b4e23d9e329b8
🔍 Environment: production
📦 Installing MiniKit...
✅ MiniKit.install() called
📱 Is MiniKit installed: true
✅ MiniKit installed successfully - running in World App
```

---

## Troubleshooting

### Eruda doesn't show up
1. Check environment variable: `NEXT_PUBLIC_ENABLE_ERUDA=true`
2. Clear browser cache
3. Hard refresh the page
4. Check if `eruda` package is installed: `npm list eruda`

### Can't access ngrok URL
1. Make sure ngrok is running: `./start-tunnel.sh`
2. Check firewall settings
3. Try a different tunnel service:
   - zrok: https://zrok.io/
   - tunnelmole: https://github.com/robbie-cahill/tunnelmole-client

### Logs not appearing in Eruda
1. Make sure you're looking at the Console tab
2. Try adding more console.logs to your code
3. Check if errors are in the Console tab

---

## Next Steps

1. ✅ Start the tunnel: `./start-tunnel.sh`
2. ✅ Copy the ngrok URL
3. ✅ Open World App Developer Portal
4. ✅ Generate QR code with your ngrok URL
5. ✅ Scan with World App
6. ✅ Tap Eruda icon (bottom-right)
7. ✅ Check Console tab for logs/errors
8. 📋 Report back what you see in the console!

---

## Files Modified

- ✅ `src/components/ErudaDebugger.tsx` - Eruda initialization
- ✅ `src/app/layout.tsx` - Added Eruda component
- ✅ `src/app/page.tsx` - Enhanced logging & visual fallback
- ✅ `.env.local` - Added NEXT_PUBLIC_ENABLE_ERUDA=true
- ✅ `package.json` - Added eruda dependency
- ✅ `start-tunnel.sh` - Helper script for ngrok

---

## Quick Start

```bash
# Terminal 1: Start the tunnel
cd /Users/ethan/Desktop/H
./start-tunnel.sh

# Copy the ngrok URL from terminal
# Example: https://xxxx-xxx-xxx.ngrok-free.app

# Then test in World App:
# 1. Go to developer.worldcoin.org
# 2. Your app → Test
# 3. Paste ngrok URL
# 4. Scan QR code
# 5. Tap Eruda icon in bottom-right
# 6. Check console for errors!
```

**Look for the Eruda icon - it's usually in the bottom-right corner as a small floating button!**
