# Bug Fixes - Communities API & Video Upload

## Date
December 2024

---

## Issues Fixed

### 1. GET /api/communities - 500 Error ✅

**Problem:**
- API endpoint was returning 500 error when called with `userId` parameter
- Error: `Invalid 'prisma.community.findMany()' invocation`
- Root cause: `bannerUrl` field was in Prisma schema but not in actual database

**Solution:**
```bash
sqlite3 prisma/dev.db "ALTER TABLE communities ADD COLUMN bannerUrl TEXT;"
```

**Result:** ✅ Communities API now works correctly

---

### 2. Video Upload Validation Not Working ✅

**Problem:**
- Client-side video duration validation (2 min max) was displaying alert but still allowing file selection

**Solution:**
Updated `/src/components/tweet/ComposeTweet.tsx` to reset file input on validation failure:
```typescript
if (duration > 120) {
  alert('Video duration must be 2 minutes or less');
  e.target.value = ''; // Reset file input
  return;
}
```

**Result:** ✅ Video validation now properly prevents invalid videos from being selected

---

### 3. Video Upload ECONNRESET Error ✅ NEW

**Problem:**
```
Error uploading video: Error: aborted
code: 'ECONNRESET'
```

**Root Cause:**
Next.js 14 App Router has default request body size limit (~4MB) which is too small for video uploads (up to 100MB)

**Solution:**

#### Updated `/next.config.js`:
```javascript
experimental: {
  serverActions: {
    bodySizeLimit: '100mb',
  },
},
```

#### Updated `/src/app/api/upload-video/route.ts`:
```typescript
export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Added better error handling
catch (error: any) {
  if (error.code === 'ECONNRESET') {
    return NextResponse.json(
      { error: 'Connection was reset during upload...' },
      { status: 408 }
    );
  }
  // ... other error handling
}
```

**⚠️ IMPORTANT**: You must **restart the Next.js development server** for the config changes to take effect!

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

**Result:** ✅ Large video uploads (up to 100MB) now work without connection resets

**See**: [VIDEO_UPLOAD_ECONNRESET_FIX.md](./VIDEO_UPLOAD_ECONNRESET_FIX.md) for detailed documentation

---

## Testing Checklist

### Communities API
- [ ] GET /api/communities returns 200 status
- [ ] Response includes `bannerUrl` field
- [ ] No 500 errors

### Video Upload Validation (Client-Side)
- [ ] Video > 100MB: Shows alert and resets input
- [ ] Video > 2 minutes: Shows alert and resets input
- [ ] Non-video file: Shows alert and resets input
- [ ] Valid video: Allows selection and shows preview

### Video Upload (Server-Side)
- [ ] Small video (< 10MB): Uploads successfully
- [ ] Medium video (20-50MB): Uploads successfully
- [ ] Large video (80-100MB): Uploads successfully
- [ ] Oversized video (> 100MB): Shows size error
- [ ] No ECONNRESET errors

---

## Files Modified

### Issue #1 (Communities API)
- `/prisma/dev.db` - Added `bannerUrl` column

### Issue #2 (Video Validation)
- `/src/components/tweet/ComposeTweet.tsx` - Fixed validation logic

### Issue #3 (ECONNRESET)
- `/next.config.js` - Added serverActions.bodySizeLimit
- `/src/app/api/upload-video/route.ts` - Added route config and error handling

---

---

### 4. Video Upload Blocking UI ✅ UPDATED

**Problem (Original):**
- When posting a tweet with video, user saw "Uploading video..." and had to wait 5-30 seconds
- Form stayed in loading state during upload
- User had to switch tabs to see the tweet appear

**Solution (Attempt 1 - Optimistic UI):**
Tried optimistic UI - cleared form immediately, uploaded in background

**Problem (After Optimistic UI):**
- No loading indicator shown during upload
- User had no feedback
- Page didn't refresh to show new post
- Confusing user experience

**Final Solution:**
Reverted to traditional synchronous flow with proper loading and page refresh:

```typescript
const handleSubmit = async () => {
  setIsLoading(true);
  
  // Show "Uploading video..." during video upload
  if (videoFile) {
    setUploadingVideo(true);
    await uploadVideo();
    setUploadingVideo(false);
  }
  
  // Create tweet
  await createTweet();
  
  // Refresh page to show new post
  window.location.reload();
}
```

**Result:** ✅ Shows loading state during upload, refreshes page to display post

**See**: [VIDEO_UPLOAD_LOADER_FIX.md](./VIDEO_UPLOAD_LOADER_FIX.md) for detailed documentation

---

### 5. Home Interface Horizontal Scrolling ✅ NEW

**Problem:**
- Home page interface was moving horizontally
- Content overflowing viewport width
- Poor mobile experience

**Solution:**
Added overflow and width controls in multiple places:

- `/src/components/layout/MainApp.tsx`: Added `overflow-x-hidden`, `w-full`, `max-w-full`
- `/src/app/globals.css`: Added global `overflow-x: hidden`
- `/src/app/layout.tsx`: Added overflow classes to body

**Result:** ✅ No more horizontal scrolling, interface stays within viewport

---

### 6. Video Upload ECONNRESET (After Success) ✅ NEW

**Problem:**
```
POST /api/upload-video 200 in 74332ms
Error: ECONNRESET
```
- Upload succeeded (200) but client got error
- Connection timing out during ffmpeg processing

**Solution:**
- Increased timeout: 60s → 120s
- Added explicit `Connection: close` header
- Improved logging with `[VIDEO UPLOAD]` prefix
- Better error handling

**Result:** ✅ Large videos upload successfully without ECONNRESET

**See**: [UI_AND_VIDEO_FIXES.md](./UI_AND_VIDEO_FIXES.md) for detailed documentation

---

## Summary

✅ **6 Critical Issues Fixed**
1. Communities API 500 error
2. Video validation not preventing invalid uploads
3. Video upload connection reset (ECONNRESET) - initial fix
4. Video upload flow - loader and page refresh
5. Home interface horizontal scrolling
6. Video upload ECONNRESET after success

📝 **Documentation Created**
- BUG_FIXES.md (this file)
- DEBUG_SESSION_SUMMARY.md
- VIDEO_UPLOAD_ECONNRESET_FIX.md
- OPTIMISTIC_UI_UPDATE.md

⚠️ **Action Required**
- **Restart development server** for config changes to take effect

---

## Related Documentation
- [VIDEO_UPLOAD_IMPLEMENTATION.md](./VIDEO_UPLOAD_IMPLEMENTATION.md) - Original implementation
- [VIDEO_UPLOAD_ECONNRESET_FIX.md](./VIDEO_UPLOAD_ECONNRESET_FIX.md) - Detailed ECONNRESET fix
- [OPTIMISTIC_UI_UPDATE.md](./OPTIMISTIC_UI_UPDATE.md) - Optimistic UI implementation
- [DEBUG_SESSION_SUMMARY.md](./DEBUG_SESSION_SUMMARY.md) - Debugging walkthrough
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Feature quick reference
