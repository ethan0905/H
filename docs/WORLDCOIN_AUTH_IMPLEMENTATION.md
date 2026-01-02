# Worldcoin Wallet Authentication Implementation

## Overview
H World now uses Worldcoin wallet authentication as the primary authentication method. This ensures that only orb-verified humans can access the platform.

## Implementation Date
December 1, 2025

## Features Implemented

### 1. Wallet Authentication Flow
- **Auto-authentication**: When users open the app in World App, authentication is triggered automatically
- **Orb Verification Check**: Only users verified with a World ID Orb can access the platform
- **Secure Nonce Generation**: Backend generates cryptographically secure nonces for each auth session
- **Signature Verification**: Backend verifies SIWE (Sign-In with Ethereum) message signatures

### 2. Authentication Components

#### AuthButton Component (`/src/components/auth/AuthButton.tsx`)
- Automatically triggers wallet auth when app opens in World App
- Displays clear error messages for non-orb verified users
- Shows loading and success states during authentication
- Fallback message for users not in World App

#### Main Page (`/src/app/page.tsx`)
- Shows authentication screen for unauthenticated users
- Waits for Zustand hydration before rendering
- Redirects to main app after successful authentication
- Guest mode available in development

### 3. Backend API Endpoints

#### Nonce Generation (`/src/app/api/nonce/route.ts`)
- Generates cryptographically secure random nonces
- 32-byte hex string for enhanced security
- 5-minute expiration time
- Supports both GET and POST methods

#### Wallet Auth Verification (`/src/app/api/verify-wallet-auth/route.ts`)
- Verifies SIWE message signatures using MiniKit's `verifySiweMessage`
- Checks for orb verification level
- Returns 403 error if user is not orb-verified
- Creates user object with wallet address and verification details
- Returns user data on successful verification

### 4. Authentication Library (`/src/lib/worldAuth.ts`)
- `generateNonce()`: Fetches nonce from backend
- `initiateWalletAuth()`: Triggers MiniKit wallet auth command
- `verifyWalletAuth()`: Sends auth payload to backend for verification
- `authenticateWithWallet()`: Complete auth flow combining all steps

### 5. User Store (`/src/store/userStore.ts`)
- Added `verificationLevel` and `nullifierHash` to User type
- `logout()` action clears user state and forces re-authentication
- Persists authentication state in localStorage
- Hydration system ensures state is loaded before rendering

### 6. Logout Functionality

#### UserProfile Component (`/src/components/user/UserProfile.tsx`)
- Added logout button below follower/following stats
- Red-themed button with icon for clear visibility
- Confirmation dialog before logout
- Calls `userStore.logout()` to clear authentication

## Authentication Flow

### User Opens App
1. App checks if MiniKit is installed
2. If in World App, auto-authentication is triggered
3. Backend generates a secure nonce
4. MiniKit wallet auth command is called with nonce
5. User signs the message in World App
6. Signature is sent to backend for verification
7. Backend verifies signature and checks orb status
8. If orb-verified, user object is created and returned
9. User is logged in and redirected to main app

### User Logs Out
1. User clicks logout button in profile tab
2. Confirmation dialog appears
3. On confirm, `userStore.logout()` is called
4. User state is cleared from store and localStorage
5. `isAuthenticated` becomes false
6. Page redirects to login screen
7. Next app open will trigger re-authentication

## Security Features

### Orb Verification Required
- Only World ID Orb-verified users can access the platform
- Device verification is rejected with clear error message
- Backend enforces this at API level (403 response)

### Nonce-Based Security
- Unique nonce generated for each authentication session
- Prevents replay attacks
- 5-minute expiration window
- Stored securely on backend (ready for database storage)

### Signature Verification
- SIWE message signature is verified using MiniKit's official method
- Ensures signature was created by claimed wallet address
- Prevents address spoofing

### Session Management
- Authentication state persisted in localStorage via Zustand
- Hydration system prevents flash of unauthenticated content
- Logout properly clears all session data

## User Experience

### Smooth Auto-Authentication
- Users don't need to manually click login
- Authentication happens automatically on app open
- Clear loading states and success messages

### Error Handling
- Non-orb verified users see helpful error message
- Failed authentication shows retry option
- Network errors handled gracefully

### Logout Experience
- Confirmation dialog prevents accidental logout
- Clear visual feedback
- Immediate redirect to login screen

## Technical Details

### Dependencies
- `@worldcoin/minikit-js`: For MiniKit commands and verification
- `zustand`: For state management with persistence
- `crypto` (Node.js): For secure nonce generation

### Environment Variables
- `NEXT_PUBLIC_MINIKIT_APP_ID`: Your MiniKit app ID
- `NEXT_PUBLIC_WORLD_ID_ACTION`: Action identifier for verification
- `NODE_ENV`: For development mode features

### File Changes
1. `/src/components/auth/AuthButton.tsx` - Updated to use wallet auth
2. `/src/app/api/verify-wallet-auth/route.ts` - Enhanced verification logic
3. `/src/app/api/nonce/route.ts` - Already existed, verified implementation
4. `/src/lib/worldAuth.ts` - Already existed, verified implementation
5. `/src/components/user/UserProfile.tsx` - Added logout button
6. `/src/store/userStore.ts` - Added logout action (already existed)
7. `/src/types/index.ts` - Added verificationLevel and nullifierHash to User type

## Testing

### In World App
1. Open app in World App
2. Should auto-authenticate
3. Check that only orb-verified users can access
4. Navigate to profile tab
5. Click logout button
6. Confirm logout
7. Should return to login screen
8. Re-open app should trigger auto-auth again

### Outside World App
1. Open app in regular browser
2. Should see "Open in World App to Continue" message
3. Cannot authenticate without World App

### Development Mode
1. Guest mode available via `/?guest=true`
2. Bypass authentication for testing UI

## Future Enhancements

### Production Readiness
1. **Database Integration**
   - Store nonces in database with user sessions
   - Track authentication attempts and failures
   - Log verification levels for analytics

2. **Enhanced Security**
   - HMAC nonces with secret key
   - Rate limiting on authentication endpoints
   - IP-based suspicious activity detection

3. **User Management**
   - Link wallet address to user profile
   - Support multiple wallets per user
   - Wallet address change handling

4. **World ID API Integration**
   - Call World ID API to verify orb status independently
   - Get additional user metadata
   - Validate nullifier hash uniqueness

5. **Session Management**
   - JWT tokens for API authentication
   - Refresh token rotation
   - Session timeout and renewal

6. **Analytics**
   - Track authentication success/failure rates
   - Monitor orb vs device verification attempts
   - User retention metrics

## Documentation References

- [World ID Wallet Auth Documentation](https://docs.world.org/mini-apps/commands/wallet-auth)
- [MiniKit JS SDK](https://github.com/worldcoin/minikit-js)
- [SIWE Specification](https://eips.ethereum.org/EIPS/eip-4361)

## Support

For issues or questions about authentication:
1. Check MiniKit installation with `MiniKit.isInstalled()`
2. Verify environment variables are set correctly
3. Check browser console for detailed error logs
4. Ensure user has completed orb verification at a World ID location

## Summary

✅ Worldcoin wallet authentication implemented
✅ Orb verification required for access
✅ Auto-authentication on app open
✅ Logout button in profile tab
✅ Secure nonce generation
✅ Signature verification
✅ Error handling and user feedback
✅ TypeScript types updated
✅ No compilation errors

The authentication system is now fully functional and ready for testing in World App!
