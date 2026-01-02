# Multi-Feature Implementation Plan

## Overview
This document outlines the implementation of 4 major features:
1. **Comments UI Fix** - Replace popup with inline comments
2. **Community Messages System** - Proper group chat with database
3. **Create View UI Fix** - Align content type buttons
4. **Payment Verification & Season 1 Badge** - Verify payments and add special badge

---

## 1. Comments UI Fix (No Popup)

### Current Issue
- Comments open in a modal/popup that breaks the display
- Not user-friendly on mobile

### Solution
- Replace modal with inline expandable comments section
- Comments expand below the tweet when clicked
- Simple, clean UX

### Files to Modify
- `/src/components/tweet/TweetCard.tsx` - Remove modal, add inline expansion
- `/src/components/layout/MainApp.tsx` - Update CommunityPostCard comments

### Implementation Steps
1. Remove modal/popup code
2. Add `showComments` state toggle
3. Render comments inline below tweet content
4. Add smooth expand/collapse animation

---

## 2. Community Messages System

### Current Issue
- Community posts are treated like main feed tweets
- No proper group message storage
- Messages not linked to specific communities

### Solution
- Create new `CommunityPost` model in database
- Store messages per community
- Link posts to communities and members
- Fetch community-specific messages

### Database Changes (Prisma Schema)
```prisma
model CommunityPost {
  id          String    @id @default(cuid())
  content     String
  authorId    String
  communityId String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  author      User      @relation("CommunityPosts", fields: [authorId], references: [id], onDelete: Cascade)
  community   Community @relation(fields: [communityId], references: [id], onDelete: Cascade)
  comments    CommunityComment[]

  @@index([communityId, createdAt])
  @@map("community_posts")
}

model CommunityComment {
  id        String    @id @default(cuid())
  content   String
  authorId  String
  postId    String
  createdAt DateTime  @default(now())

  author    User          @relation("CommunityComments", fields: [authorId], references: [id], onDelete: Cascade)
  post      CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId, createdAt])
  @@map("community_comments")
}
```

### User Model Updates
```prisma
// Add to User model relations
communityPosts    CommunityPost[] @relation("CommunityPosts")
communityComments CommunityComment[] @relation("CommunityComments")
```

### Community Model Updates
```prisma
// Add to Community model relations
posts CommunityPost[]
```

### API Endpoints Needed
- `POST /api/communities/[id]/posts` - Create community post
- `GET /api/communities/[id]/posts` - Fetch community posts
- `POST /api/communities/[id]/posts/[postId]/comments` - Add comment
- `GET /api/communities/[id]/posts/[postId]/comments` - Fetch comments

### Files to Modify
- `/prisma/schema.prisma` - Add new models
- `/src/components/layout/MainApp.tsx` - Update CommunitiesView
- Create API routes for community posts

---

## 3. Create View Content Type Alignment Fix

### Current Issue
- Text/Image/Video buttons not vertically aligned inside boxes

### Solution
- Fix flexbox alignment
- Ensure icons and text are centered vertically

### File to Modify
- `/src/components/layout/MainApp.tsx` - CreateView content type selector

### CSS Fix
```tsx
className="flex flex-col items-center justify-center gap-2 h-20 rounded-lg..."
```

---

## 4. Payment Verification & Season 1 Badge

### Requirements
1. Verify payment was received from user's wallet address
2. Store subscription data in database
3. Add "Season 1 OG Human" badge to user profile
4. Display badge on profile

### Database Changes
```prisma
// Update User model
model User {
  // ...existing fields...
  isPro                 Boolean   @default(false)
  isSeasonOneOG         Boolean   @default(false) // NEW
  seasonOneBadgeDate    DateTime? // NEW
  proSubscribedAt       DateTime? // NEW
}

// Update Subscription model
model Subscription {
  // ...existing fields...
  paymentVerified       Boolean   @default(false) // NEW
  paymentWalletAddress  String? // NEW
  seasonOneBadge        Boolean   @default(false) // NEW
}
```

### Implementation Steps
1. Update Prisma schema with new fields
2. Run migration
3. Update payment verification endpoint (`/api/payments/verify`)
4. Check if payment came from user's wallet address
5. Set `isSeasonOneOG = true` and `seasonOneBadgeDate` on successful payment
6. Update user profile to display "Season 1 OG Human" badge
7. Create badge component

### Files to Modify
- `/prisma/schema.prisma` - Add new fields
- `/src/app/api/payments/verify/route.ts` - Enhanced verification
- `/src/components/ui/SeasonOneBadge.tsx` - New badge component
- Profile pages - Display badge

### Badge Design
- Special gradient badge with "⭐ Season 1 OG Human"
- Only visible to users who subscribed during Season 1
- Permanent badge (never removed)

---

## Implementation Order

1. **Priority 1**: Community Messages System (most complex)
2. **Priority 2**: Comments UI Fix (affects UX)
3. **Priority 3**: Payment Verification & Badge (business logic)
4. **Priority 4**: Create View UI Fix (quick fix)

---

## Estimated Implementation Time

- Community Messages: 2-3 hours (database + API + frontend)
- Comments UI Fix: 30-45 minutes
- Payment Verification: 1-2 hours
- Create View Fix: 5 minutes

**Total: ~4-6 hours**

---

## Testing Checklist

### Comments
- [ ] Click comment button shows comments inline
- [ ] Comments expand/collapse smoothly
- [ ] Can add new comments
- [ ] Comments display correctly on mobile

### Communities
- [ ] Can post message in community
- [ ] Messages are community-specific
- [ ] Only see messages from joined communities
- [ ] Can comment on community posts

### Create View
- [ ] Content type buttons aligned vertically
- [ ] Icons centered in boxes

### Payment & Badge
- [ ] Payment verification works
- [ ] Badge appears after successful payment
- [ ] Badge visible on profile
- [ ] Subscription status stored correctly

---

## Next Steps

Ready to implement! Please confirm which feature to start with, or I can implement them in the priority order listed above.
