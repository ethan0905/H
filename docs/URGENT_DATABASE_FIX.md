# URGENT FIX: Database Connection Error

## Problem Identified ✅
**Error Code:** P5010  
**Issue:** Cannot connect to Prisma Accelerate API  
**Root Cause:** The Accelerate connection is failing in production

## Solution: Use Direct PostgreSQL Connection

### Step 1: Update Vercel Environment Variable

Go to your Vercel dashboard and update the `DATABASE_URL`:

**Current (Broken):**
```
prisma+postgres://accelerate.prisma-data.net/?api_key=...
```

**New (Working):**
```
postgres://dd9af244f73341933a8d5ba1cb4860b38a9b9920622ec2a8e6caf590ef0a4a0d:sk__4W8VlaNv2_PQur9gAe0w@db.prisma.io:5432/postgres?sslmode=require
```

### Step 2: Update via Vercel Dashboard

1. Go to https://vercel.com/ethan0905s-projects/h/settings/environment-variables
2. Find `DATABASE_URL` for Production
3. Click "Edit"
4. Replace the value with the direct PostgreSQL URL above
5. Save

### Step 3: Redeploy

The code has already been pushed. Once you update the environment variable, either:
- Wait for automatic deployment (already triggered)
- Or manually redeploy from Vercel dashboard

## Alternative: Use Vercel CLI

```bash
# Remove old DATABASE_URL
vercel env rm DATABASE_URL production

# Add new DATABASE_URL with direct connection
echo "postgres://dd9af244f73341933a8d5ba1cb4860b38a9b9920622ec2a8e6caf590ef0a4a0d:sk__4W8VlaNv2_PQur9gAe0w@db.prisma.io:5432/postgres?sslmode=require" | vercel env add DATABASE_URL production

# Redeploy
vercel --prod
```

## What Changed in Code

**File:** `src/lib/prisma.ts`

**Before:**
```typescript
import { withAccelerate } from '@prisma/extension-accelerate'
// ...
const client = new PrismaClient().$extends(withAccelerate());
```

**After:**
```typescript
// Removed Accelerate extension
const client = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});
```

## Why This Fixes It

1. **Accelerate Connection Failing** - The Prisma Accelerate API is unreachable or API key is invalid
2. **Direct Connection Works** - Vercel Postgres is accessible via direct connection
3. **No Accelerate Needed** - For your use case, direct connection is sufficient

## Expected Behavior After Fix

✅ Login will work  
✅ User creation will succeed  
✅ Database queries will be fast (Vercel Postgres is already fast)  
✅ No more P5010 errors

## Verification

After deploying, check the logs. You should see:
```
✅ [STEP 8] User search completed. Found: User ID: xxx
```

Instead of:
```
❌ [STEP 8] Database query failed: P5010
```

## Note on Accelerate

If you want to use Prisma Accelerate later:
1. Verify your Accelerate API key is valid
2. Check if Accelerate is available in your region
3. Ensure the connection string format is correct
4. Test locally first before deploying

For now, **direct connection is more reliable** and perfectly fine for your app.
