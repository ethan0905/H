# Quick Fix: Add Blob Token

## The Issue
Upload fails with: `No token found. Configure BLOB_READ_WRITE_TOKEN environment variable`

## Fastest Solution

### Step 1: Create Blob Store (Web UI)
1. Open: **https://vercel.com/ethan0905s-projects/h/stores**
2. Click: **"Create Store"** or **"Create Database"**
3. Select: **"Blob"**
4. Name it: **"h-uploads"** (or any name)
5. Click: **"Create"**

Vercel will automatically add `BLOB_READ_WRITE_TOKEN` to your environment variables!

### Step 2: Verify Token Was Added
1. Go to: **https://vercel.com/ethan0905s-projects/h/settings/environment-variables**
2. Look for: **BLOB_READ_WRITE_TOKEN**
3. Should see: ✅ Set for Production, Preview, Development

### Step 3: Redeploy
The token is added automatically, but you need to redeploy for it to take effect:

```bash
vercel --prod
```

Or just push a commit:
```bash
git commit --allow-empty -m "Trigger redeploy for Blob token"
git push
```

## Alternative: If Web UI Doesn't Work

If you can't access the Stores page, add the token manually:

1. Go to: https://vercel.com/ethan0905s-projects/h/settings/environment-variables
2. Click: "Add New"
3. Name: `BLOB_READ_WRITE_TOKEN`
4. Value: You'll need to create a Blob store first to get this value

## How to Test

After redeployment, try uploading an image in your app. You should see:

```json
{
  "url": "https://xxxxx.public.blob.vercel-storage.com/uploads/image.jpg",
  "thumbnailUrl": "https://xxxxx.public.blob.vercel-storage.com/uploads/image-thumb.jpg",
  "success": true
}
```

## Troubleshooting

### Still getting "No token found"?

1. **Check token exists**: Go to Environment Variables, verify `BLOB_READ_WRITE_TOKEN` is there
2. **Check all environments**: Make sure it's set for Production (not just Development)
3. **Redeploy**: After adding token, you MUST redeploy
4. **Wait**: Sometimes takes 1-2 minutes for env vars to propagate

### Token exists but still failing?

Check the value:
- Should NOT be empty
- Should be a long string (looks like: `vercel_blob_rw_...`)
- Should be set for **Production** environment

## Status After Fix

✅ Login works  
✅ Database works  
✅ File uploads work  
✅ App fully functional!

## Quick Command Summary

```bash
# Check if token exists
vercel env ls | grep BLOB

# Trigger redeploy after adding token
vercel --prod

# Or via git
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

## Expected Timeline

1. Create Blob store: **30 seconds**
2. Token auto-added: **Instant**
3. Redeploy: **2 minutes**
4. **Total: ~3 minutes to fix**

Then file uploads will work! 🎉
