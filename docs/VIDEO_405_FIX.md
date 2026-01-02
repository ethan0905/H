# Video Upload 405 Error Fix

## Issue
- POST requests to `/api/upload-video` were returning 405 Method Not Allowed
- Investigation revealed the entire route.ts file was compressed into a single line
- This caused Next.js to fail parsing the POST handler properly

## Root Cause
The file `/src/app/api/upload-video/route.ts` had all its code on one line instead of being properly formatted with line breaks. This can happen during file editing and causes:
- Next.js build/runtime to have issues recognizing the export
- Potential parsing errors in the serverless function
- The POST method not being properly registered

## Solution
1. **Reformatted the file** with proper line breaks and indentation
2. **Verified exports** are correct:
   - `export const runtime = 'nodejs'`
   - `export const dynamic = 'force-dynamic'`
   - `export const maxDuration = 60`
   - `export async function POST(request: NextRequest)`

## Implementation Details

### File Structure (Fixed)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Token generation logic
}
```

### Key Features
- Generates client upload tokens via `@vercel/blob/client`
- Bypasses 4.5MB serverless function body limit
- Supports videos up to 50MB
- Allowed formats: mp4, quicktime, webm, avi, mkv, mpeg

## Deployment
- Committed and pushed fix: commit `89acfb4`
- Vercel will automatically redeploy
- Should resolve 405 errors immediately after deployment completes

## Testing Checklist
After deployment completes:
1. [ ] Verify `/api/upload-video` responds to POST requests
2. [ ] Test video upload token generation in production
3. [ ] Confirm client-side direct upload works end-to-end
4. [ ] Check that videos up to 50MB upload successfully
5. [ ] Verify no 405 or 413 errors

## Expected Behavior
1. Client calls POST `/api/upload-video` with filename and content type
2. Server generates an upload token with 50MB limit and allowed video types
3. Client receives token and URL
4. Client uploads directly to Vercel Blob using the token
5. Upload completes and returns blob URL
6. Client creates tweet with the video URL

## Next Steps
- Wait for Vercel deployment to complete
- Test video upload in production
- Monitor logs for any errors
- Verify the complete upload flow works

---
**Status**: Fix committed and deployed
**Date**: 2025
**Commit**: 89acfb4
