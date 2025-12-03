# Streak Feature - Quick Testing Guide

## ✅ Complete Streak Feature

### What Was Built

1. **Database** - Added `lastStreakDate` and `longestStreak` fields
2. **Logic** - Automatic streak tracking on every post
3. **API** - Endpoints for streak data
4. **UI** - Beautiful animated streak display component

---

## Quick Test Steps

### Test 1: Start a Streak
1. Go to Home feed
2. Create a new post
3. Go to your Profile
4. **Expected:** See streak badge showing "1 day" with orange flame 🔥

### Test 2: Continue Streak Tomorrow
1. Wait until next day (or manually update database for testing)
2. Create another post
3. Check your profile
4. **Expected:** Streak shows "2 days" and increases each consecutive day

### Test 3: Same Day Posts
1. Create multiple posts in the same day
2. Check your profile streak
3. **Expected:** Streak number stays the same (doesn't increase)

### Test 4: Streak Colors
Check that colors change based on streak length:
- 1-6 days: **Orange** 🟠
- 7-13 days: **Green** 🟢 (+ "One week streak!" message)
- 14-29 days: **Blue** 🔵 (+ "Two week streak!" message)  
- 30+ days: **Purple** 🟣 (+ "One month streak!" message)

### Test 5: Visual Elements
- [ ] Flame icon is visible
- [ ] Flame animates (pulses) for active streaks
- [ ] Number is bold and colored
- [ ] Badge has colored background and border
- [ ] Hover effect works (slight scale up)

---

## Manual Database Testing

If you need to test different streak scenarios quickly:

### Set a 7-day streak
```bash
# Open Prisma Studio
npx prisma studio

# Or use SQL directly
sqlite3 prisma/dev.db
UPDATE users SET streakDays = 7, lastStreakDate = datetime('now') WHERE id = 'YOUR_USER_ID';
```

### Set a 14-day streak
```sql
UPDATE users SET streakDays = 14, longestStreak = 14, lastStreakDate = datetime('now') WHERE id = 'YOUR_USER_ID';
```

### Reset streak
```sql
UPDATE users SET streakDays = 0, lastStreakDate = NULL WHERE id = 'YOUR_USER_ID';
```

---

## API Testing

### Get Streak Data
```bash
curl http://localhost:3000/api/users/YOUR_USER_ID/streak
```

**Expected Response:**
```json
{
  "success": true,
  "currentStreak": 7,
  "longestStreak": 14,
  "lastPostDate": "2024-12-02T10:30:00.000Z",
  "isActive": true
}
```

---

## TypeScript Errors?

If you see TypeScript errors about `lastStreakDate` not existing:

### Solution 1: Restart Dev Server
```bash
# Kill the dev server (Ctrl+C)
npm run dev
```

### Solution 2: Clear Cache
```bash
rm -rf node_modules/.prisma
npx prisma generate
npm run dev
```

### Solution 3: Reload VS Code
- Press `Cmd/Ctrl + Shift + P`
- Type "Reload Window"
- Press Enter

---

## Visual Reference

### What It Looks Like

```
Profile Page:

┌──────────────────────────────────────┐
│  [Avatar] Ethan                      │
│           @ethan_username            │
│                                      │
│  [Rank Badge]        [🔥 7 days]   │ ← NEW STREAK DISPLAY
│                                      │
│  [Progress Bar]                      │
└──────────────────────────────────────┘
```

### Streak Display Component

```
┌──────────────┐
│ 🔥 7 days   │  ← Orange background (1-6 days)
└──────────────┘

┌──────────────┐
│ 🔥 10 days  │  ← Green background (7-13 days)
└──────────────┘

┌──────────────┐
│ 🔥 20 days  │  ← Blue background (14-29 days)
└──────────────┘

┌──────────────┐
│ 🔥 35 days  │  ← Purple background (30+ days)
└──────────────┘
```

---

## Troubleshooting

### Streak not updating when posting
**Check:**
1. Is the dev server running?
2. Check browser console for errors
3. Verify POST /api/tweets includes streak update code

**Fix:**
Look in `/src/app/api/tweets/route.ts` around line 225 for the streak update code.

### Streak showing 0 days
**Possible causes:**
1. User hasn't posted yet today
2. More than 24h since last post
3. Database needs migration

**Fix:**
```bash
# Apply migrations
npx prisma migrate dev
npx prisma generate
```

### UI not showing streak
**Check:**
1. Is gamification data loading?
2. Open browser DevTools → Network tab
3. Look for `/api/gamification/user/[userId]` request
4. Check if response includes `stats.streakDays`

---

## Next Steps

After testing:
1. [ ] Verify streak increments correctly
2. [ ] Test all color variations
3. [ ] Check mobile responsive
4. [ ] Confirm milestone messages
5. [ ] Test edge cases (midnight posts, timezone issues)

---

## Quick Demo Script

For showcasing the feature:

```
1. "Let me show you our new streak feature!"
2. Open profile → Point to streak badge
3. "This tracks how many consecutive days you've posted"
4. Create a new post
5. Refresh profile → Show streak increment
6. "Colors change as your streak grows:"
   - Week 1: Orange 🟠
   - Week 2+: Green 🟢  
   - Month 1+: Purple 🟣
7. "Keeps you engaged and coming back every day!"
```

---

## Status Checklist

- [x] Database schema updated
- [x] Migration created and applied
- [x] Streak logic implemented
- [x] API endpoints created
- [x] UI component built
- [x] Profile integration complete
- [ ] TypeScript errors resolved (restart server)
- [ ] Manual testing complete
- [ ] All colors verified
- [ ] Mobile tested

---

**Ready to test!** 🚀

Start by creating a post and checking your profile to see your first streak!
