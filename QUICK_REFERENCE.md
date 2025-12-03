# Quick Reference Guide - New Features

## Video Upload in Tweets

### How to Use:
1. Click the **Video icon** (📹) in ComposeTweet
2. Select a video file (MP4, MOV, etc.)
3. Video must be **≤ 2 minutes** and **≤ 100MB**
4. Preview appears with playback controls
5. Click "Tweet" to upload

### Technical:
- **API**: `POST /api/upload-video`
- **Storage**: `/public/uploads/videos/`
- **Lazy Loading**: `preload="metadata"` on video elements
- **Thumbnail**: Auto-generated at 1-second mark

### Restrictions:
- Cannot upload both image AND video in same tweet
- Video button disabled when image selected (and vice versa)

---

## Community Banner Upload (Super Admin Only)

### How to Use:
1. Navigate to community settings/admin panel
2. Use `CommunityBannerUpload` component
3. Click "Upload Banner" or "Change Banner"
4. Select image (max 10MB)
5. Banner auto-resizes to 1500x500px
6. Click X to remove banner

### Technical:
- **API**: 
  - `POST /api/community/banner` - Upload
  - `DELETE /api/community/banner` - Remove
  - `GET /api/community/banner` - Fetch
- **Storage**: `/public/uploads/banners/`
- **Processing**: Sharp (1500x500px, JPEG 85%)

### Authorization:
- **Only super admins** can upload/remove banners
- Component won't render for non-super-admins
- API returns 403 for unauthorized users

---

## Super Admin Capabilities (@ethan)

### Current Super Admin: @ethan

### Permissions:
1. ✅ Delete any tweet (not just own tweets)
2. ✅ Upload community banners
3. ✅ Change community banners
4. ✅ Remove community banners

### UI Indicators:
- Delete button appears on all tweets for super admin
- Confirmation dialog shows "(Super Admin Action)" when deleting others' tweets
- "Super Admin Only" badge on banner upload component

---

## File Uploads Overview

| Upload Type | Access | Max Size | Dimensions | Location |
|-------------|--------|----------|------------|----------|
| **Profile Picture** | All users | 5MB | 400x400 | `/uploads/` |
| **Tweet Image** | All users | 5MB | Original | `/uploads/` |
| **Tweet Video** | All users | 100MB | 2 min max | `/uploads/videos/` |
| **Community Banner** | Super admin | 10MB | 1500x500 | `/uploads/banners/` |

---

## API Endpoints Quick Reference

### Images:
```
POST /api/upload-image
Body: FormData { image: File }
Response: { url: string, thumbnailUrl: string }
```

### Videos:
```
POST /api/upload-video
Body: FormData { video: File }
Response: { url: string, thumbnailUrl: string }
```

### Community Banners:
```
POST /api/community/banner
Body: FormData { banner: File, communityId: string, userId: string }
Response: { url: string, filename: string }

GET /api/community/banner?communityId={id}
Response: { ...community, bannerUrl: string }

DELETE /api/community/banner?communityId={id}&userId={userId}
Response: { success: boolean, message: string }
```

### Tweet Delete:
```
DELETE /api/tweets/{tweetId}?userId={userId}
Response: { success: boolean }
Note: Works for tweet author OR super admin
```

---

## Component Integration Examples

### Video Upload in Tweet:
Already integrated in `ComposeTweet.tsx` - works out of the box!

### Display Video in Feed:
Already integrated in `TweetCard.tsx` - automatically lazy loads!

### Community Banner Upload:
```tsx
import CommunityBannerUpload from '@/components/community/CommunityBannerUpload';

<CommunityBannerUpload
  communityId="community-id-here"
  currentBannerUrl={community.bannerUrl}
  onBannerUpdated={(url) => console.log('New banner:', url)}
/>
```

### Display Community Banner:
```tsx
{community.bannerUrl && (
  <img
    src={community.bannerUrl}
    alt="Community banner"
    className="w-full h-40 object-cover rounded-lg"
  />
)}
```

---

## Database Schema Quick Reference

### User Model:
```prisma
model User {
  // ...
  isSuperAdmin  Boolean @default(false)
  // ...
}
```

### Community Model:
```prisma
model Community {
  // ...
  bannerUrl  String?
  // ...
}
```

### Media Model (existing):
```prisma
model Media {
  id           String   @id @default(cuid())
  tweetId      String
  type         String   // 'image' or 'video'
  url          String
  thumbnailUrl String?
  alt          String?
  // ...
}
```

---

## Testing Checklist

### Video Upload:
- [ ] Upload short video (< 2 min) → ✅ Success
- [ ] Upload long video (> 2 min) → ❌ Error
- [ ] Upload large file (> 100MB) → ❌ Error
- [ ] Preview video before posting → ✅ Shows
- [ ] Video in feed lazy loads → ✅ Works
- [ ] Thumbnail shows before play → ✅ Shows

### Community Banner (Super Admin):
- [ ] Login as @ethan → ✅ Super admin
- [ ] Component renders → ✅ Shows
- [ ] Upload banner → ✅ Success
- [ ] Change banner → ✅ Success
- [ ] Remove banner → ✅ Success

### Community Banner (Regular User):
- [ ] Component doesn't render → ✅ Hidden
- [ ] API returns 403 → ✅ Blocked

### Super Admin Delete:
- [ ] @ethan can delete own tweets → ✅ Works
- [ ] @ethan can delete others' tweets → ✅ Works
- [ ] Delete button shows on all tweets → ✅ Shows
- [ ] Confirmation dialog different → ✅ Shows "(Super Admin Action)"

---

## Troubleshooting

### Video Upload Issues:
**Problem**: Video fails to upload  
**Solutions**:
- Check file size (< 100MB)
- Check video duration (< 2 min)
- Check file format (MP4, MOV, etc.)
- Verify `/public/uploads/videos/` exists

**Problem**: No thumbnail generated  
**Solutions**:
- Install ffmpeg: `brew install ffmpeg`
- Check ffmpeg in PATH: `which ffmpeg`
- Video still works without thumbnail

### Banner Upload Issues:
**Problem**: Upload button doesn't show  
**Solutions**:
- Verify user is super admin
- Check `isSuperAdmin` field in database
- Component only renders for super admins

**Problem**: Upload fails  
**Solutions**:
- Check file size (< 10MB)
- Check file type (image/*)
- Verify `/public/uploads/banners/` exists
- Check user has super admin status

### TypeScript Errors:
**Problem**: `isSuperAdmin` or `bannerUrl` not found  
**Solutions**:
```bash
npx prisma generate
# Restart VS Code TypeScript server
```

---

## Quick Commands

### Verify Super Admin:
```bash
sqlite3 /Users/ethan/Desktop/H/prisma/dev.db "SELECT username, isSuperAdmin FROM users WHERE username = 'ethan';"
```

### Check Prisma Schema:
```bash
npx prisma db push
npx prisma generate
```

### Create Upload Directories:
```bash
mkdir -p /Users/ethan/Desktop/H/public/uploads/{videos,banners}
```

### Install ffmpeg (optional):
```bash
brew install ffmpeg
```

---

## Performance Notes

- **Videos**: Lazy loaded with `preload="metadata"` - only load when clicked
- **Images**: Optimized with Sharp - resized and compressed
- **Banners**: Auto-resized to 1500x500px for consistency
- **Thumbnails**: Generated for all videos (if ffmpeg available)

---

## Security Notes

- **Super Admin**: Checked on every sensitive API call
- **File Upload**: Type and size validated server-side
- **Path Safety**: Filenames generated by server
- **Authorization**: User ID verified for all protected actions

---

## Documentation Files

- `/VIDEO_UPLOAD_IMPLEMENTATION.md` - Detailed video guide
- `/COMMUNITY_BANNER_IMPLEMENTATION.md` - Detailed banner guide
- `/FINAL_IMPLEMENTATION_SUMMARY.md` - Complete overview
- `/QUICK_REFERENCE.md` - This file

---

## Need Help?

All features are fully implemented and documented. Refer to the detailed documentation files for in-depth information, code examples, and integration guides.

**Status**: ✅ All features complete and working!
