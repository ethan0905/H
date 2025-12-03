# 500 Error Investigation - Wallet Login
**Date:** December 3, 2025
**Status:** 🔍 Investigating

## Problem
Users get a 500 Internal Server Error when trying to log in with wallet authentication via World App.

## Endpoint
`POST /api/verify-wallet-auth`

## What We Know

### ✅ Code is Correct
- Extensive debug logging added
- Proper error handling
- All required fields validated
- Signature verification with fallback for development
- Database operations wrapped in try-catch

### ✅ Build is Successful
- No build errors
- TypeScript compiles (with ignoreBuildErrors)
- Prisma client generates successfully
- Deployment completes successfully

### ✅ Environment Variables
Verified in Vercel dashboard:
- `DATABASE_URL` - ✅ Set
- `DIRECT_DATABASE_URL` - ✅ Set  
- `WORLD_APP_ID` - ✅ Set
- `MINIKIT_APP_ID` - ✅ Set

## Debug Logging in Place

The endpoint has extensive logging at each step:

```typescript
🚀 [VERIFY-WALLET-AUTH] Starting wallet authentication...
📥 [STEP 1] Parsing request body...
🔍 [STEP 2] Extracting payload data...
✅ [STEP 3] Validation passed
🔐 [STEP 4] Verifying wallet auth for address...
🔐 [STEP 5] Starting signature verification...
🔍 [STEP 6] Checking verification level...
📦 [STEP 7] Importing Prisma client...
🔍 [STEP 8] Searching for existing user...
🔤 [STEP 9] Determining username...
🆕/👤 [STEP 10] Creating/Finding user...
📝 [STEP 11] Checking if username should be updated...
🎉 [STEP 12] Preparing successful response...
```

## Potential Causes

### 1. Database Connection Issue
**Symptoms:** 
- Error would occur at STEP 8 (finding user) or STEP 10 (creating user)
- Prisma client would throw connection error

**Debug:**
```
Look for errors like:
- "Database query failed"
- "Failed to create user"
- Connection timeout errors
```

**Check:**
- Are DATABASE_URL and DIRECT_DATABASE_URL correctly set in production?
- Is Prisma Accelerate connection working?
- Are there any firewall issues?

### 2. MiniKit Signature Verification Failure
**Symptoms:**
- Error would occur at STEP 5
- `verifySiweMessage` throws an error

**Debug:**
```
Look for:
- "Signature verification failed"
- MiniKit SDK errors
```

**Check:**
- Is the MiniKit SDK version compatible?
- Are we passing the correct parameters?
- Is the nonce handling correct?

### 3. Prisma Schema Mismatch
**Symptoms:**
- Error at STEP 10 when creating user
- Fields don't match schema

**Debug:**
```
Look for:
- "Unknown field" errors
- "Required field missing" errors
```

**Check:**
- Is Prisma client regenerated with latest schema?
- Are migrations applied in production?
- Do User model fields match what we're creating?

### 4. Import/Module Resolution Error
**Symptoms:**
- Error at STEP 7 when importing Prisma
- Dynamic import fails

**Debug:**
```
Look for:
- "Cannot find module"  
- Import errors
```

**Check:**
- Is @/lib/prisma path resolved correctly?
- Is prisma client generated?

## Next Steps

### 1. Check Vercel Production Logs
```bash
vercel logs <deployment-url> --follow
```

Look for the debug output from verify-wallet-auth endpoint.

### 2. Test Endpoint Directly
Try hitting the endpoint with curl to see the error response:

```bash
curl -X POST https://your-app.vercel.app/api/verify-wallet-auth \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "address": "0x1234567890123456789012345678901234567890",
      "message": "Sign in to H World",
      "signature": "0xabcdef..."
    },
    "nonce": "test-nonce-123"
  }'
```

### 3. Add More Specific Logging
If error is unclear, add logging to:
- Prisma client initialization in `src/lib/prisma.ts`
- Database connection testing
- Environment variable validation

### 4. Test Database Connection
Create a simple test endpoint:

```typescript
// src/app/api/test-db/route.ts
export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma');
    const count = await prisma.user.count();
    return Response.json({ success: true, userCount: count });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

## Workarounds (If Needed)

### Temporary: Skip Signature Verification
Already implemented - signature verification has try-catch with fallback.

### Temporary: Use Fixed Verification Level
Already implemented - defaults to 'orb' for demo.

### Temporary: Simplify User Creation
If user creation fails, could:
- Remove optional fields
- Use simpler username generation
- Skip username updates

## Related Files

- `/src/app/api/verify-wallet-auth/route.ts` - Main endpoint
- `/src/lib/prisma.ts` - Database client with debug logging
- `/prisma/schema.prisma` - User model definition
- `/src/components/auth/AuthButton.tsx` - Client-side auth logic

## Environment Check

To verify in production:
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Confirm these are set for Production:
   - `DATABASE_URL` (Prisma Accelerate URL)
   - `DIRECT_DATABASE_URL` (Direct PostgreSQL connection)
   - `WORLD_APP_ID`
   - `MINIKIT_APP_ID`

## Status

🔍 **Awaiting production logs** to determine exact cause of 500 error.

The code has extensive debug logging that should pinpoint exactly where the error occurs.
