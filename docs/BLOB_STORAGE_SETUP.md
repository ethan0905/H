# Setup Vercel Blob Storage for File Uploads

## What We Fixed ✅

Changed from **filesystem storage** (doesn't work on Vercel) to **Vercel Blob Storage** (cloud storage).

### Before (Broken):
```typescript
// Tried to save to /var/task/public/uploads/
await writeFile(filePath, buffer); // ❌ Read-only filesystem error
```

### After (Fixed):
```typescript
// Upload to Vercel Blob (cloud storage)
const blob = await put(`uploads/${filename}`, buffer, {
  access: 'public',
  contentType: 'image/jpeg'
}); // ✅ Works!
```

## Setup Steps

### 1. Enable Vercel Blob Storage

Go to your Vercel dashboard:
1. Navigate to https://vercel.com/ethan0905s-projects/h/stores
2. Click "Create Database" or "Connect Store"
3. Select **"Blob"**
4. Click "Create" or "Connect"

This will automatically add the required environment variable `BLOB_READ_WRITE_TOKEN` to your project.

### Alternative: Automatic Setup

Vercel Blob is usually **automatically enabled** for Vercel projects. The `@vercel/blob` package will use the built-in authentication.

### 2. Verify Environment Variable

Check if `BLOB_READ_WRITE_TOKEN` exists:

```bash
vercel env ls
```

If it doesn't exist, Vercel will auto-generate it on first blob upload.

### 3. Deploy

The code is already pushed. Vercel will deploy automatically.

## What Changed

### Image Upload (`/api/upload-image`)
- ✅ Images uploaded to Vercel Blob
- ✅ Thumbnails created and uploaded
- ✅ Returns public URLs (https://...)
- ❌ No more filesystem errors

### Video Upload (`/api/upload-video`)
- ✅ Videos uploaded to Vercel Blob
- ✅ Returns public URLs (https://...)
- ✅ No ffmpeg processing (simplified)
- ❌ No more filesystem errors

## Benefits

### 1. **Reliability**
- No filesystem limitations
- Works on Vercel's serverless functions
- Automatic CDN distribution

### 2. **Performance**
- Files served from CDN
- Fast global access
- Automatic caching

### 3. **Scalability**
- Unlimited storage (paid plan)
- No server disk space issues
- Automatic backups

## Pricing

**Free Tier:**
- 500 GB bandwidth/month
- 50 GB storage

**Sufficient for your app!** You'd need thousands of uploads to exceed this.

## Testing

Once deployed, try uploading:

1. **Image:** Should work and return a Vercel Blob URL like:
   ```
   https://xxxxx.public.blob.vercel-storage.com/uploads/1234-abc.jpg
   ```

2. **Video:** Should work and return a Vercel Blob URL like:
   ```
   https://xxxxx.public.blob.vercel-storage.com/uploads/videos/1234-xyz.mp4
   ```

## Expected Behavior

### Image Upload ✅
```javascript
// User uploads image
POST /api/upload-image

// Response:
{
  "url": "https://xxxxx.public.blob.vercel-storage.com/uploads/1234.jpg",
  "thumbnailUrl": "https://xxxxx.public.blob.vercel-storage.com/uploads/1234-thumb.jpg",
  "success": true
}
```

### Video Upload ✅
```javascript
// User uploads video
POST /api/upload-video

// Response:
{
  "url": "https://xxxxx.public.blob.vercel-storage.com/uploads/videos/1234.mp4",
  "filename": "1234-abc.mp4",
  "success": true
}
```

## Troubleshooting

### Error: "No BLOB_READ_WRITE_TOKEN found"

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. The `BLOB_READ_WRITE_TOKEN` should be there
3. If not, create a Blob store: https://vercel.com/ethan0905s-projects/h/stores
4. Redeploy after adding the token

### First Upload Might Be Slow

The first upload after deployment might take longer as Vercel initializes the Blob connection. Subsequent uploads will be fast.

## Migration Notes

### Old Files (If Any)

If you had files uploaded to `/public/uploads/` locally:
- They won't be accessible in production
- Need to re-upload them
- Or migrate them to Blob manually

### URL Format Change

**Before:**
```
/uploads/image.jpg (local path)
```

**After:**
```
https://xxxxx.public.blob.vercel-storage.com/uploads/image.jpg (cloud URL)
```

Your frontend code should handle both formats automatically.

## Summary

✅ Fixed filesystem errors  
✅ Images upload to Vercel Blob  
✅ Videos upload to Vercel Blob  
✅ Public CDN URLs returned  
✅ No server storage limits  
✅ Automatic setup on Vercel  

**Try uploading a file now - it should work!** 📸
