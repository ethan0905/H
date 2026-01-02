# Video Upload Implementation

## Overview
Implemented video upload functionality for tweets with a 2-minute maximum duration and lazy loading for optimal performance.

## Changes Made

### 1. Video Upload API (`/src/app/api/upload-video/route.ts`)
- Created new API endpoint for video uploads
- **Features:**
  - Validates video file type (must be video/*)
  - Max file size: 100MB (raw upload)
  - Max duration: 2 minutes (120 seconds)
  - Generates thumbnail from video (at 1 second mark using ffmpeg)
  - Stores videos in `/public/uploads/videos/`
  - Returns video URL and thumbnail URL

- **Dependencies:**
  - Uses ffmpeg for thumbnail generation and duration checking
  - If ffmpeg not available, continues without thumbnail (optional)

### 2. ComposeTweet Component Updates
- Added video upload support alongside existing image upload
- **New State:**
  - `selectedVideo`: Stores selected video file
  - `videoPreview`: Stores video preview URL
  - `uploadingVideo`: Tracks video upload progress

- **Features:**
  - Video file input with validation
  - Duration check (max 2 minutes) on client side
  - File size check (max 100MB)
  - Video preview with controls
  - Mutual exclusivity: Can upload either image OR video, not both
  - Progress indicator shows "Uploading video..." during upload
  - Remove video button

- **UI Updates:**
  - Added Video icon button next to Image icon
  - Video button disabled when image is selected (and vice versa)
  - Video preview shows below compose area with remove button
  - Upload progress message in submit button

### 3. TweetCard Component Updates
- Implemented lazy loading for video playback
- **Features:**
  - `preload="metadata"` - Only loads video metadata, not full video
  - `poster={thumbnailUrl}` - Shows thumbnail before user clicks play
  - Videos only load and play when user clicks the play button
  - Fallback message for unsupported browsers

### 4. Database Schema
- Existing `Media` table already supports video:
  - `type` field: 'image' or 'video'
  - `url` field: Video file URL
  - `thumbnailUrl` field: Video thumbnail URL
  - No schema changes needed

## File Structure
```
/public/uploads/videos/      # Video files and thumbnails
  ├── [timestamp]-[random].mp4
  ├── [timestamp]-[random]-thumb.jpg
  └── ...
```

## Usage

### For Users:
1. Click the video icon in ComposeTweet
2. Select a video file (max 2 minutes, max 100MB)
3. Video will be validated for duration
4. Preview appears with playback controls
5. Click "Tweet" to upload and post

### Video Requirements:
- **Duration:** Maximum 2 minutes (120 seconds)
- **File Size:** Maximum 100MB
- **Format:** Any video format supported by browser
- **Note:** Cannot upload both image and video in same tweet

### Performance Optimization:
- Videos use lazy loading (`preload="metadata"`)
- Thumbnails shown before video loads
- Videos only load when user clicks play
- Efficient for feed scrolling with multiple videos

## Technical Details

### Video Duration Check (Client-Side):
```typescript
const video = document.createElement('video');
video.preload = 'metadata';
video.onloadedmetadata = () => {
  const duration = video.duration;
  if (duration > 120) {
    alert('Video duration must be 2 minutes or less');
  }
};
video.src = URL.createObjectURL(file);
```

### Video Upload Flow:
1. User selects video → Client validates duration and size
2. User clicks Tweet → Video uploaded to `/api/upload-video`
3. Server validates, generates thumbnail using ffmpeg
4. Server returns video URL and thumbnail URL
5. Tweet created with media entry (type: 'video')
6. Video appears in feed with lazy loading

### Lazy Loading Implementation:
```html
<video
  src={videoUrl}
  controls
  preload="metadata"
  poster={thumbnailUrl}
  className="w-full max-h-96 bg-black"
>
```

## Dependencies
- **ffmpeg** (optional but recommended):
  - Used for thumbnail generation
  - Used for duration verification
  - Install: `brew install ffmpeg` (macOS)
  - If not available, feature degrades gracefully

## Testing
1. ✅ Upload video < 2 minutes → Success
2. ✅ Upload video > 2 minutes → Error message
3. ✅ Upload video > 100MB → Error message
4. ✅ Video preview in compose area → Shows with controls
5. ✅ Video in feed → Shows thumbnail, lazy loads
6. ✅ Cannot select both image and video → Buttons disabled appropriately
7. ✅ Thumbnail generation → Works with ffmpeg

## Future Enhancements
- Video compression/transcoding for smaller file sizes
- Multiple video format outputs (HLS for adaptive streaming)
- Progress bar during video upload
- Video editing tools (trim, filters)
- Batch upload support
- Cloud storage integration (S3, etc.)

## Notes
- Videos stored locally in `/public/uploads/videos/`
- For production, consider cloud storage (S3, Cloudinary, etc.)
- Consider implementing video compression to reduce storage
- Monitor storage usage and implement cleanup for old videos
