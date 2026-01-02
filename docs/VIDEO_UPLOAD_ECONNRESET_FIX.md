# Video Upload ECONNRESET Error Fix

## Issue
When uploading videos, the connection was being reset with error:
```
Error uploading video: Error: aborted
code: 'ECONNRESET'
```

## Root Cause
Next.js 14 App Router has default request body size limits that are too small for video uploads:
- Default limit: ~4MB
- Video files: Up to 100MB
- Connection times out when trying to parse large request bodies

## Solution

### 1. Configure Next.js for Large File Uploads

Updated `/next.config.js` to increase body size limit:

```javascript
experimental: {
  serverActions: {
    bodySizeLimit: '100mb',
  },
},
```

### 2. Configure API Route

Updated `/src/app/api/upload-video/route.ts`:

```typescript
// Configure route to handle large files and long execution time
export const runtime = 'nodejs';
export const maxDuration = 60; // Maximum 60 seconds
export const dynamic = 'force-dynamic';
```

### 3. Improved Error Handling

Added specific error handling for common issues:

```typescript
catch (error: any) {
  if (error.code === 'ECONNRESET') {
    return NextResponse.json(
      { error: 'Connection was reset during upload...' },
      { status: 408 }
    );
  }
  
  if (error.name === 'PayloadTooLargeError') {
    return NextResponse.json(
      { error: 'Video file is too large. Maximum size is 100MB.' },
      { status: 413 }
    );
  }
  
  // Generic error
  return NextResponse.json(
    { error: 'Failed to upload video. Please try again.' },
    { status: 500 }
  );
}
```

## Important: Restart Required

After modifying `next.config.js`, you **MUST restart the Next.js development server**:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

## Testing

After restarting the server, test with:
1. Small video (< 10MB) - Should work
2. Medium video (20-50MB) - Should work
3. Large video (80-100MB) - Should work
4. Oversized video (> 100MB) - Should show size error

## Files Modified

1. `/next.config.js` - Added serverActions.bodySizeLimit
2. `/src/app/api/upload-video/route.ts` - Added route config and better error handling

## Additional Notes

### Why This Happens
- Next.js optimizes for typical API requests (few KB to few MB)
- Video files are significantly larger
- Without explicit configuration, Next.js rejects large payloads
- Connection reset occurs when body parser times out

### Alternative Solutions Considered

1. **Streaming Upload**: More complex, requires custom implementation
2. **Chunked Upload**: Better for very large files (>100MB)
3. **External Service**: Upload to S3/Cloudinary first (production recommended)

### Production Recommendations

For production, consider:
- Using external storage (AWS S3, Cloudinary, etc.)
- Implementing chunked uploads for files > 50MB
- Adding upload progress indicators
- Implementing retry logic
- Using CDN for video delivery

## Verification

After applying fixes and restarting server:

```bash
# Check that server started successfully
npm run dev

# Look for:
✓ Ready in X ms
Local: http://localhost:3000

# Try uploading a video through the UI
# Check console for logs:
Starting video upload...
Received video: test.mp4, size: 52428800 bytes, type: video/mp4
Converting to buffer...
Writing to disk...
Video saved successfully at: /path/to/video
```

## Troubleshooting

### Still Getting ECONNRESET?

1. **Verify server was restarted** after config changes
2. **Check file size** - ensure it's under 100MB
3. **Check console logs** - look for specific error messages
4. **Try smaller file first** - rule out other issues
5. **Check network** - slow connection might timeout

### Other Errors

- `413 Payload Too Large` - File exceeds 100MB
- `408 Request Timeout` - Upload took too long (>60s)
- `400 Bad Request` - File type or validation issue
- `500 Server Error` - Check server logs for details

## Related Issues

- Initial bug fix: See `BUG_FIXES.md`
- Video validation: Client-side duration/size checks
- Thumbnail generation: Requires ffmpeg (optional)

## Status

✅ Configuration applied
⚠️ **Requires server restart to take effect**
📝 Document created
🧪 Ready for testing

---

**Next Steps**:
1. Restart development server
2. Test video upload with various file sizes
3. Monitor console for any remaining errors
4. Update documentation if issues persist
