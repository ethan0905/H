# User Identity Consolidation Fix

## Issue
Users were getting duplicate identities:
- One identity based on World ID username (@ethan)
- Another identity based on wallet address (user_3ffd33)

This caused confusion and prevented proper super admin access since the wallet-based identity didn't have the correct username or permissions.

## Root Cause
The authentication system was creating users in two different ways:
1. Some users were created with just a username (no wallet address)
2. Other users were created with wallet address but auto-generated username

The wallet address should be the primary unique identifier, with the World ID username as the display name.

## Solution Implemented

### 1. Database Consolidation
**Merged duplicate @ethan accounts:**
- Deleted the old user: `username='ethan', walletAddress=NULL`
- Updated the wallet-based user:
  - username: `ethan`
  - walletAddress: `0x3ffd3381a60c3bd973acbe1c94076de85b3d1fc9`
  - isSuperAdmin: `1` (true)
  - displayName: `@ethan`

### 2. Updated Authentication Flow

#### `/src/app/api/verify-wallet-auth/route.ts`
- **Primary Identifier**: Wallet address (unique per user)
- **Username Priority**:
  1. `worldIdUsername` from MiniKit (passed from client)
  2. Extract from SIWE message (if contains `@username`)
  3. Fallback to `user_{address}` if no World ID username

- **User Creation**: Creates user with wallet address + World ID username
- **User Update**: Updates existing users with World ID username if provided
- **Super Admin**: Automatically sets `isSuperAdmin=true` for username "ethan"

#### `/src/lib/worldAuth.ts`
- Updated to attempt to fetch World ID username from MiniKit
- Passes `worldIdUsername` to backend if available
- Updated TypeScript types to include optional `worldIdUsername` field

### 3. Identity Management Strategy

**Single Source of Truth: Wallet Address**
- Each user has ONE unique wallet address
- Wallet address is used to find/create user in database
- World ID username is secondary (display name)

**Username Flow:**
```
1. User authenticates with World App (MiniKit)
2. MiniKit provides wallet address + signature
3. Try to get World ID username from:
   - MiniKit.user.username (if available)
   - SIWE message @mention
   - Fallback to generated username
4. Find user by wallet address
5. Create or update with World ID username
```

## Database Schema
```sql
-- Wallet address is the unique identifier
walletAddress TEXT UNIQUE

-- Username from World ID (can be updated)
username TEXT UNIQUE  

-- Other fields
isSuperAdmin BOOLEAN DEFAULT 0
isVerified BOOLEAN DEFAULT 1
verificationLevel TEXT  -- 'orb' or 'device'
```

## Testing Done
✅ Deleted duplicate @ethan user without wallet
✅ Updated wallet-based user with correct username and super admin flag
✅ Verified single @ethan identity exists:
   - ID: `cmiqa6o4g0000re0sshvnjsx0`
   - Username: `ethan`
   - Wallet: `0x3ffd3381a60c3bd973acbe1c94076de85b3d1fc9`
   - Super Admin: `true`

## How It Works Now

### For @ethan (and all users):
1. Authenticate with World App
2. System uses wallet address `0x3ffd...` to find user
3. System sees username is "ethan" (from World ID or database)
4. Returns full user object with `isSuperAdmin=true`
5. Frontend displays `@ethan` and grants super admin access

### For New Users:
1. First authentication with World App
2. System gets wallet address + tries to get World ID username
3. Creates user with: `walletAddress + worldIdUsername`
4. If no World ID username, uses: `user_{address}`
5. User can be updated later when World ID username is available

## World ID Username Sources

### Method 1: MiniKit.user (Preferred)
```typescript
if (MiniKit.isInstalled() && MiniKit.user) {
  const username = MiniKit.user.username;
}
```

### Method 2: SIWE Message
```
Message: "Sign in to H World as @ethan"
Extract: "@ethan" → "ethan"
```

### Method 3: World ID API (Future)
```typescript
GET /api/v1/profile/{address}
Response: { username: "ethan" }
```

### Method 4: Fallback
```typescript
username = `user_${address.substring(2, 8)}`
// Example: user_3ffd33
```

## Files Modified
1. `/src/app/api/verify-wallet-auth/route.ts` - Username extraction and user consolidation
2. `/src/lib/worldAuth.ts` - Added World ID username from MiniKit
3. Database: Merged duplicate @ethan users

## Migration for Existing Users

If other users have duplicates, run this query:
```sql
-- Find duplicates
SELECT username, COUNT(*) 
FROM users 
GROUP BY username 
HAVING COUNT(*) > 1;

-- For each duplicate:
-- 1. Keep the user WITH wallet address
-- 2. Delete the user WITHOUT wallet address
DELETE FROM users 
WHERE username = '{username}' 
AND walletAddress IS NULL;
```

## Next Steps

1. **Clear localStorage**: Users should clear their browser storage and re-authenticate
2. **Re-authenticate**: This will ensure the wallet-based user is loaded with correct data
3. **Verify**: Check that `@ethan` appears correctly and super admin access works
4. **World ID Integration**: Consider fetching username directly from World ID API in future

## Important Notes

- **Wallet address is permanent**: Can't be changed once set
- **Username can be updated**: If World ID provides it later
- **No more duplicates**: One wallet = one user
- **Super admin check**: Now checks both `isSuperAdmin` flag AND `username === 'ethan'` as fallback

---

**Status**: ✅ Fixed - Database consolidated, authentication updated
**Date**: December 3, 2025
**Action Required**: Clear browser storage and re-authenticate to load correct user data
