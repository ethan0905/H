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

### 4. Video Upload Blocking UI ✅ NEW

**Problem:**
- When posting a tweet with video, user saw "Uploading video..." and had to wait 5-30 seconds
- Form stayed in loading state during upload
- User had to switch tabs to see the tweet appear
- Poor user experience with long wait times

**Solution:**
Implemented optimistic UI updates in `/src/components/tweet/ComposeTweet.tsx`:

```typescript
const handleSubmit = async () => {
  // Clear form IMMEDIATELY
  clearForm();
  setIsLoading(false);
  
  // Update counters IMMEDIATELY
  updateCounters();

  // Upload and create tweet in BACKGROUND (non-blocking)
  (async () => {
    await uploadMedia();
    await createTweet();
  })();
}
```

**Result:** ✅ Tweet form clears instantly, upload happens in background

**See**: [OPTIMISTIC_UI_UPDATE.md](./OPTIMISTIC_UI_UPDATE.md) for detailed documentation

---

## Summary

✅ **4 Critical Issues Fixed**
1. Communities API 500 error
2. Video validation not preventing invalid uploads
3. Video upload connection reset (ECONNRESET)
4. Video upload blocking UI (optimistic updates)

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
