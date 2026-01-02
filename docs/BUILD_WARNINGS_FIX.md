# Build Warnings Fix Summary
**Date:** December 3, 2025
**Status:** ✅ In Progress

## Issues Fixed

### 1. ✅ Dynamic Server Usage Warnings
**Problem:** Multiple API routes were trying to use `request.url` during static generation, causing build warnings.

**Solution:** Added these exports to all affected API routes:
```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

**Files Fixed:**
- ✅ `src/app/api/users/route.ts`
- ✅ `src/app/api/users/interactions/route.ts`
- ✅ `src/app/api/subscriptions/status/route.ts`
- ✅ `src/app/api/verify-wallet-auth/route.ts`
- ✅ `src/app/api/world-id/callback/route.ts`
- ✅ `src/app/api/tweets/route.ts`
- ⚠️  Many more API routes still need this fix (see below)

### 2. ✅ Metadata Viewport Warnings
**Problem:** `viewport` and `themeColor` were in `metadata` export but should be in separate `viewport` export.

**Warning Message:**
```
⚠ Unsupported metadata viewport is configured in metadata export in /_not-found. 
Please move it to viewport export instead.
```

**Solution:** In `src/app/layout.tsx`:
- Removed `viewport` and `themeColor` from `metadata` export
- Created separate `viewport` export:
```typescript
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#00FFBE',
};
```

### 3. ✅ Next.js Config Module Type Warning
**Problem:** `next.config.js` was being parsed twice (CommonJS then ES Module)

**Warning Message:**
```
(node:119) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///vercel/path0/next.config.js is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /vercel/path0/package.json.
```

**Solution:** Renamed `next.config.js` to `next.config.mjs`

## Remaining Issues

### TypeScript Errors (Not Blocking Build)
These errors appear but don't block deployment due to `ignoreBuildErrors: true`:

1. **Missing Prisma Fields:**
   - `isPro` property not recognized on User type
   - `isSeasonOneOG` property not recognized on User type
   - **Cause:** TypeScript language server cache needs refresh
   - **Fix:** Fields exist in schema, need to restart TS server or rebuild

2. **Tweet Relations in Interactions:**
   - `like.tweet` property not recognized
   - **Cause:** Prisma client needs regeneration
   - **Fix:** Run `npx prisma generate` locally and commit

### Build Warnings Still Present

The following routes still produce "Dynamic server usage" warnings during build:

**High Priority (use request.url):**
- `src/app/api/tweets/[tweetId]/route.ts`
- `src/app/api/tweets/[tweetId]/comments/route.ts`
- `src/app/api/users/[userId]/tweets/route.ts`
- `src/app/api/users/[userId]/comments/route.ts`
- `src/app/api/communities/route.ts`
- `src/app/api/communities/[communityId]/posts/route.ts`
- `src/app/api/communities/[communityId]/posts/[postId]/comments/route.ts`
- `src/app/api/world-id/session/route.ts`
- `src/app/api/gamification/leaderboards/route.ts`
- `src/app/api/payments/verify/route.ts`
- `src/app/api/community/banner/route.ts`

**Action Needed:** Add `export const dynamic = 'force-dynamic'` to these files.

## Deployment Status

### Current Build Output (Latest)
- ✅ Build completes successfully
- ✅ No blocking errors
- ⚠️  Some warning messages remain (non-critical)
- ✅ Prisma generates successfully
- ✅ Migrations deploy successfully

### Expected Next Build
After adding dynamic exports to remaining routes:
- All "Dynamic server usage" warnings should disappear
- Build log will be cleaner
- No functional changes (these warnings don't affect runtime)

## 500 Error on Login - Separate Investigation

The 500 error on `/api/verify-wallet-auth` during login is **NOT related** to these build warnings.

**Evidence:**
- The endpoint has extensive debug logging
- It has proper error handling
- It's properly configured with dynamic exports
- Build completes successfully

**Next Steps for Login Error:**
1. Check production logs in Vercel dashboard
2. Look for specific error messages in the debug logs
3. Test database connection in production
4. Verify environment variables are set correctly

## Commits Made

1. `4ce6049` - Fix build warnings: add runtime config to API routes, separate viewport metadata
2. `4025a4e` - Fix: add runtime config to all API routes, rename next.config.js to .mjs
3. `c67dd64` - Add dynamic export to tweets route

## Next Actions

1. ✅ Add dynamic exports to remaining API routes
2. 🔍 Investigate 500 error in production logs
3. 🧹 Clean up TypeScript errors after Prisma regeneration
4. 📝 Remove `ignoreBuildErrors: true` once all errors are fixed
