# Community Banner Upload Implementation (Super Admin)

## Overview
Implemented community banner upload functionality exclusively for super admin users. Super admins can upload, change, and remove community banners to customize the community sections.

## Changes Made

### 1. Database Schema Updates
- **Added `bannerUrl` field to `Community` model:**
  ```prisma
  model Community {
    // ...existing fields...
    bannerUrl  String?   // Community banner image (super admin only)
    // ...
  }
  ```
- Field is nullable (optional)
- Stores the URL path to the banner image

### 2. Community Banner API (`/src/app/api/community/banner/route.ts`)
- **POST**: Upload a new banner (super admin only)
  - Validates user is super admin
  - Validates community exists
  - Validates image file (max 10MB)
  - Resizes to 1500x500px using Sharp
  - Optimizes as JPEG (quality 85, progressive)
  - Stores in `/public/uploads/banners/`
  - Updates community record with bannerUrl
  - Returns banner URL

- **GET**: Fetch community details including banner
  - Returns community info with bannerUrl
  - No authentication required (public)

- **DELETE**: Remove community banner (super admin only)
  - Validates user is super admin
  - Sets bannerUrl to null
  - Keeps file on disk (for now)

### 3. CommunityBannerUpload Component (`/src/components/community/CommunityBannerUpload.tsx`)
- **Features:**
  - Only renders for super admin users
  - Upload new banner button
  - Change existing banner button
  - Remove banner button
  - Live preview during upload
  - Loading states
  - File validation (type, size)
  - Confirmation dialogs
  - Success/error alerts

- **UI Elements:**
  - Banner preview (1500x500 aspect ratio)
  - Upload/Change button with icon
  - Remove button (X icon on banner)
  - Size guidelines (1500x500px, max 10MB)
  - "Super Admin Only" badge
  - Loading spinner during upload

### 4. File Structure
```
/public/uploads/banners/      # Community banner images
  ├── [communityId]-[timestamp]-[random].jpg
  └── ...
```

## Authentication & Authorization

### Super Admin Check:
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { isSuperAdmin: true },
});

if (!user?.isSuperAdmin) {
  return NextResponse.json({ 
    error: 'Unauthorized: Super admin access required' 
  }, { status: 403 });
}
```

## Usage

### For Super Admins:
1. Navigate to community settings/admin panel
2. Use `CommunityBannerUpload` component
3. Click "Upload Banner" or "Change Banner"
4. Select an image file (max 10MB)
5. Banner is automatically resized to 1500x500px
6. Preview appears immediately
7. Click X button to remove banner

### Integration Example:
```tsx
import CommunityBannerUpload from '@/components/community/CommunityBannerUpload';

function CommunitySettings({ communityId, currentBannerUrl }) {
  const handleBannerUpdate = (newBannerUrl: string | null) => {
    // Refresh community data or update state
    console.log('Banner updated:', newBannerUrl);
  };

  return (
    <div>
      <h2>Community Banner</h2>
      <CommunityBannerUpload
        communityId={communityId}
        currentBannerUrl={currentBannerUrl}
        onBannerUpdated={handleBannerUpdate}
      />
    </div>
  );
}
```

### Display Banner in Community View:
```tsx
function CommunityHeader({ community }) {
  return (
    <div>
      {community.bannerUrl && (
        <div className="w-full h-40 rounded-lg overflow-hidden">
          <img
            src={community.bannerUrl}
            alt={`${community.name} banner`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {/* ...rest of community header... */}
    </div>
  );
}
```

## Technical Details

### Image Processing:
- **Original**: Any size/format up to 10MB
- **Processed**: 1500x500px JPEG
- **Quality**: 85% (progressive JPEG)
- **Fit**: Cover (crops to fit ratio)
- **Position**: Center

### API Endpoints:

#### Upload Banner:
```
POST /api/community/banner
FormData:
  - banner: File (image)
  - communityId: string
  - userId: string (super admin)

Response:
  - url: string
  - filename: string
```

#### Get Community:
```
GET /api/community/banner?communityId={id}

Response:
  - id, name, description, category
  - iconGradient, iconName
  - bannerUrl
  - memberCount
```

#### Remove Banner:
```
DELETE /api/community/banner?communityId={id}&userId={userId}

Response:
  - success: boolean
  - message: string
```

## Security Considerations

1. **Authorization**: Only super admins can upload/remove banners
2. **Validation**: File type and size checked on server
3. **Community Check**: Verifies community exists before upload
4. **User Check**: Verifies user exists and has super admin status
5. **Input Sanitization**: File names generated server-side
6. **Path Safety**: Files saved to controlled directory

## Permissions Matrix

| Action | Regular User | Super Admin | Notes |
|--------|-------------|-------------|-------|
| View Banner | ✅ | ✅ | Public |
| Upload Banner | ❌ | ✅ | Super admin only |
| Change Banner | ❌ | ✅ | Super admin only |
| Remove Banner | ❌ | ✅ | Super admin only |

## Testing Checklist

### Super Admin (@ethan):
- [x] Set @ethan as super admin in database
- [ ] Login as @ethan
- [ ] Navigate to community settings
- [ ] Upload banner → Success
- [ ] Change banner → Success
- [ ] Remove banner → Success
- [ ] Upload invalid file → Error message
- [ ] Upload too large file → Error message

### Regular User:
- [ ] CommunityBannerUpload doesn't render
- [ ] API returns 403 for upload attempts
- [ ] API returns 403 for delete attempts
- [ ] Can view community with banner

## Future Enhancements

1. **Banner Library**: Pre-made banners for communities
2. **Cropping Tool**: Client-side crop before upload
3. **Filters/Effects**: Apply filters to banners
4. **Analytics**: Track banner performance
5. **Scheduled Banners**: Auto-change banners for events
6. **Multiple Banners**: Rotate through banner set
7. **Banner Templates**: Design templates for communities
8. **Cloud Storage**: Move to S3/Cloudinary for production

## Database Migration

The schema changes have been applied:
```bash
npx prisma db push
npx prisma generate
```

## Super Admin Setup

@ethan is already set as super admin:
```sql
UPDATE users SET isSuperAdmin = 1 WHERE username = 'ethan';
```

Verify in database:
```sql
SELECT id, username, displayName, isSuperAdmin FROM users WHERE username = 'ethan';
```

## Notes

- Banners are stored locally in `/public/uploads/banners/`
- For production, migrate to cloud storage (S3, Cloudinary)
- Consider implementing automatic cleanup for removed banners
- Monitor storage usage
- Banner aspect ratio is 3:1 (wide banner)
- Component includes responsive design
- Works with existing community structure

## Troubleshooting

### TypeScript Errors:
If you see TypeScript errors about `isSuperAdmin` or `bannerUrl`:
1. Run `npx prisma generate` to regenerate Prisma client
2. Restart TypeScript server in VS Code
3. Clear node_modules/.prisma and regenerate

### Upload Failures:
- Check file size (< 10MB)
- Check file type (image/*)
- Verify user is super admin
- Check uploads directory exists and is writable
- Check Sharp library is installed

### Banner Not Displaying:
- Verify bannerUrl is set in database
- Check file exists in /public/uploads/banners/
- Check image path in src attribute
- Verify community data includes bannerUrl

## Integration Status

✅ Database schema updated with `bannerUrl` field  
✅ Prisma client regenerated  
✅ Banner upload API created (`/api/community/banner`)  
✅ CommunityBannerUpload component created  
✅ Super admin authorization implemented  
✅ Image processing with Sharp (1500x500)  
✅ Upload directory created (`/public/uploads/banners/`)  
✅ Documentation complete  

⏳ Pending: Integration into community settings page  
⏳ Pending: Display banner in community view  
⏳ Pending: Community settings UI page
