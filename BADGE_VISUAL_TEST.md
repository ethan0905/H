# Season 1 OG Badge - Visual Testing Checklist

## Quick Test URL
Navigate to: `http://localhost:3000/profile/user_0x3ffd33`

## What to Look For

### ✅ Profile Page Badge
**Location**: Below the bio section, before the gamification section

**Expected Appearance**:
```
👑 Season 1 OG  Founding Member
```

**Styling**:
- Crown emoji (👑) on the left
- Yellow text on dark background
- Golden/orange gradient background
- Rounded pill shape
- Glowing border effect
- "Season 1 OG" in bold
- "Founding Member" subtitle

**Position in Profile**:
1. Header (name, avatar, follow button)
2. Bio text
3. **→ Season 1 OG Badge (should be here)** ←
4. Rank Badge (if gamification enabled)
5. Join date
6. Stats (Following, Followers, Likes)

### ✅ Tweet Card Badge
**Location**: Next to author name in tweets

**Expected Appearance**:
- Smaller version of the badge
- Next to verified badge (if user is verified)
- Crown emoji visible
- May show just icon on mobile

## Test Scenarios

### Scenario 1: View Profile
1. Open `http://localhost:3000/profile/user_0x3ffd33`
2. Scroll to bio section
3. **Expected**: See Season 1 OG badge with crown emoji
4. **Result**: ___________

### Scenario 2: View User's Tweets
1. Navigate to home feed
2. Find tweets by Ethan (@ethan)
3. **Expected**: Badge appears next to username in tweet card
4. **Result**: ___________

### Scenario 3: Compare with Non-Badge User
1. View another user's profile (e.g., alice_human)
2. **Expected**: No Season 1 OG badge visible
3. **Result**: ___________

### Scenario 4: Edit Profile
1. On Ethan's profile, click "Edit Profile"
2. Make changes and save
3. **Expected**: Badge still displays after update
4. **Result**: ___________

## Debugging Steps (If Badge Doesn't Show)

### Check 1: Browser Console
```javascript
// Open browser console and run:
fetch('/api/users?userId=user_0x3ffd33')
  .then(r => r.json())
  .then(data => console.log('isSeasonOneOG:', data.isSeasonOneOG));
```
**Expected Output**: `isSeasonOneOG: true`

### Check 2: React DevTools
1. Open React DevTools
2. Find Profile component
3. Check profileUser state
4. **Expected**: `isSeasonOneOG: true` in state

### Check 3: Network Tab
1. Open Network tab
2. Reload profile page
3. Find API call to `/api/users?userId=user_0x3ffd33`
4. Check response includes `"isSeasonOneOG": true`

### Check 4: Database
```bash
sqlite3 prisma/dev.db "SELECT id, username, isSeasonOneOG FROM users WHERE id='user_0x3ffd33';"
```
**Expected**: `user_0x3ffd33|ethan|1`

## Common Issues

### Issue: Badge Not Showing
**Possible Causes**:
1. ❌ API not returning `isSeasonOneOG` field
   - **Solution**: Check API response in Network tab
   
2. ❌ Profile component not capturing field
   - **Solution**: Check Profile.tsx line 107 includes `isSeasonOneOG: userData.isSeasonOneOG`
   
3. ❌ Database field is 0 (false)
   - **Solution**: Update user in database: `UPDATE users SET isSeasonOneOG = 1 WHERE id = 'user_0x3ffd33';`
   
4. ❌ React component not re-rendering
   - **Solution**: Hard refresh page (Cmd+Shift+R)

### Issue: Badge Shows for Wrong Users
**Possible Cause**: Check database for accidentally set flags
**Solution**: 
```sql
SELECT id, username, isSeasonOneOG FROM users WHERE isSeasonOneOG = 1;
```

## Success Criteria
- [ ] Badge visible on profile page
- [ ] Badge has correct styling (crown, gradient, yellow text)
- [ ] Badge shows "Season 1 OG" and "Founding Member" text
- [ ] Badge appears in tweet cards
- [ ] Badge only shows for users with isSeasonOneOG = true
- [ ] Badge persists after profile edits

## Visual Reference

### Expected Badge HTML Structure
```html
<div class="mb-4">
  <div class="inline-flex items-center gap-2 rounded-full 
              bg-gradient-to-r from-yellow-500/20 to-orange-500/20 
              border border-yellow-500/30 text-xl px-4 py-2 text-sm">
    <span class="text-xl">👑</span>
    <span class="font-semibold text-yellow-400 text-sm">Season 1 OG</span>
    <span class="text-yellow-400/70 text-sm">Founding Member</span>
  </div>
</div>
```

## Notes
- The badge is only visible for users who have `isSeasonOneOG = true` in database
- Currently only test user `user_0x3ffd33` (Ethan) has this badge
- Badge is granted when a user purchases a subscription during Season 1
- Badge is permanent and cannot be removed

## Status: READY FOR TESTING ✅
All code changes complete. Badge should display when visiting the test user's profile.
