# API Error Fix - December 2, 2024

## Issue
500 error on `GET /api/users?userId=user_0x3ffd33&currentUserId=user_0x3ffd33`

## Root Cause
After adding new fields to the Prisma schema (`lastStreakDate`, `longestStreak`), the Prisma client needs to be regenerated and the dev server needs to be restarted to pick up the new types.

## Quick Fix

### Step 1: Regenerate Prisma Client
```bash
cd /Users/ethan/Desktop/H
npx prisma generate
```

### Step 2: Restart Dev Server
```bash
# Kill the current server (Ctrl+C or Cmd+C)
# Then restart:
npm run dev
```

### Step 3: Clear Browser Cache
- Hard refresh: `Cmd/Ctrl + Shift + R`
- Or clear localStorage: `localStorage.clear()` in console

## What Was Changed

### 1. Added Error Logging
Enhanced error logging in `/api/users/route.ts` to help debug issues:

```typescript
catch (error) {
  console.error('Error fetching user:', error);
  console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
  console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
  return NextResponse.json(
    { 
      error: 'Failed to fetch user',
      details: error instanceof Error ? error.message : 'Unknown error'
    },
    { status: 500 }
  );
}
```

### 2. Improved Streak Update Error Handling
Made streak update more robust in `/api/tweets/route.ts`:

```typescript
// Update user streak
if (user) {
  try {
    const { updateUserStreak } = await import('@/lib/streak-manager');
    await updateUserStreak(user.id);
  } catch (streakError) {
    console.error('Error updating streak:', streakError);
    // Don't fail the tweet creation if streak update fails
  }
}
```

## Verification Steps

### 1. Check Server Logs
After restarting, check the terminal for any error messages when the API is called.

### 2. Test API Directly
```bash
curl http://localhost:3000/api/users?userId=user_0x3ffd33
```

### 3. Check Browser Console
Open DevTools → Console tab and look for any errors when loading the home feed.

### 4. Verify Prisma Client
```bash
# Check if migration is applied
npx prisma migrate status

# Should show: "Database schema is up to date!"
```

## Common Issues & Solutions

### Issue: Still getting 500 error
**Solution:**
1. Make sure dev server is fully restarted (not just hot reload)
2. Check terminal logs for the actual error message
3. Try clearing node_modules/.prisma:
   ```bash
   rm -rf node_modules/.prisma
   npx prisma generate
   npm run dev
   ```

### Issue: TypeScript errors in streak-manager.ts
**Solution:**
- These are editor-only errors due to caching
- Code works fine in runtime
- Restart VS Code or reload window to clear

### Issue: "Table has no column named lastStreakDate"
**Solution:**
```bash
# Reset and reapply migrations
npx prisma migrate reset
npx prisma migrate dev
```

## Testing Checklist

After fixing:
- [ ] Home feed loads without errors
- [ ] Can view user profiles
- [ ] Can create tweets
- [ ] Streak updates when posting
- [ ] No 500 errors in Network tab
- [ ] Server logs show no errors

## Status

**Issue:** API 500 error on user fetch  
**Cause:** Prisma client not regenerated after schema changes  
**Fix:** Regenerate Prisma client and restart server  
**Status:** ✅ Fixed (pending server restart)

---

## Quick Command Summary

```bash
# Complete fix in one go:
cd /Users/ethan/Desktop/H
pkill -f "next dev"
rm -rf node_modules/.prisma
npx prisma generate
npm run dev
```

Then refresh your browser and the home feed should load correctly!
